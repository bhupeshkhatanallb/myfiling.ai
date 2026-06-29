"""
Formatting page-detectors - Supreme Court paper-book formatting brief.

Spec targets:
    paper        A4 (21.0 x 29.7 cm)
    font family  Times New Roman
    body text    14 pt, 1.5 line spacing
    quotations   12 pt, single line spacing
    margins      left 4 cm, right 4 cm, top 2 cm, bottom 2 cm

The DECISION LOGIC here (tiered severity, left-margin-only flagging, mixed-doc
font/spacing suppression guards, sans-serif-only font flagging, informational
quotations) is PORTED VERBATIM from the corpus-tuned engine. Only the plumbing
changed: detectors read ``self.ctx`` (DocumentContext) and pages expose
``pdf_page_no``. Behaviour - and therefore corpus parity - is unchanged.
"""

from __future__ import annotations

import statistics as st
from typing import List

from ...base import Detector, DetectorResult
from ...finding import Finding, Severity, Confidence
from ...registry import register
from ...gates import geometry_gate, typography_gate
from ...model import classify_paper
from ...metrics import normalize_fontname, TIMES_FAMILY_TOKENS
from ...units import (
    CM, SPEC_BODY_PT, SPEC_QUOTE_PT, SPEC_LINE_SPACING,
    SPEC_MARGIN_LR_CM, SPEC_MARGIN_TB_CM,
)

_SANS_SERIF_TOKENS = {
    "arial", "helvetica", "calibri", "verdana", "tahoma", "segoeui",
    "trebuchet", "trebuchetms", "gillsans", "futura", "opensans", "roboto",
}

_MIN_PAGES = 3
_FONT_SPEC_TOL = 0.6
_FONT_CRITICAL_PT = 9.0
_FONT_WARN_LOW = 11.0
_SPACING_SPEC = SPEC_LINE_SPACING
_SPACING_TOL = 0.20
_SPACING_SINGLE = 1.30
_NON_A4_WARN_FRAC = 0.10

# Per-page LEFT/RIGHT margin defect rule (calibrated to ground-truth defect pages
# on the reference Test PDF; see metrics._edge_defect_signal). A page is flagged
# when its narrowest real text block runs within this distance of the page edge
# AND a substantial fraction of its lines run to that edge. Tuned for zero false
# positives. Shared by left and right (symmetric geometry).
_EDGE_PAGE_BLOCK_MIN_CM = 1.5
_EDGE_PAGE_NARROW_FRAC = 0.35
_EDGE_PAGE_MAX_LISTED = 20


# =========================================================================== #
@register
class PaperSizeDetector(Detector):
    """Paper must be A4 (21.0 x 29.7 cm) or Legal (21.6 x 35.6 cm).

    Matches the reference analyzer (objection 254): a page is acceptable if it is
    EITHER A4 or Legal; only pages that are neither are flagged. Flags both the
    predominantly-wrong case and the mixed case.
    """

    name = "PaperSizeDetector"
    rule = "SC Rules, Order IV - Paper size (A4 or Legal)"
    kind = "page"

    # Sizes the court accepts. Legal is permitted alongside A4 (reference parity).
    _ACCEPTED = ("A4", "Legal")

    def run(self) -> DetectorResult:
        if not self.ctx.has_page_dimensions:
            return self.unverified(fid="d_fmt_paper_scan", what="Paper Size")

        dist = self.ctx.paper_distribution
        total = sum(dist.values())
        dom = self.ctx.dominant_paper_size_pt
        details = {
            "verifiable": True,
            "size_distribution": dist,
            "dominant_size_pt": dom,
            "dominant_size_cm": (round(dom[0] / CM, 1), round(dom[1] / CM, 1)) if dom else None,
        }
        findings: List[Finding] = []

        if total == 0:
            details["verifiable"] = False
            return self.result(details=details, findings=[], confidence=Confidence.LOW,
                               _ocr_annotate=False)

        # A4 and Legal both count as accepted; everything else is a defect.
        accepted = sum(dist.get(k, 0) for k in self._ACCEPTED)
        bad = total - accepted
        frac = bad / total
        bad_classes = {k: v for k, v in dist.items() if k not in self._ACCEPTED}
        details["accepted"] = accepted
        details["paper"] = "A4/Legal" if accepted >= bad else max(dist, key=dist.get)

        bad_pages = [p.pdf_page_no + 1 for p in self.ctx.pages
                     if classify_paper(p.width, p.height) not in self._ACCEPTED]
        details["non_accepted_pages"] = bad_pages
        first_bad = bad_pages[0] if bad_pages else 1
        examples = ", ".join(str(p) for p in bad_pages[:5])
        ex_note = f" First affected page(s): {examples}." if bad_pages else ""

        if accepted < bad:
            other = max(bad_classes, key=bad_classes.get)
            ok_note = "" if accepted == 0 else f" ({accepted} of {total} pages are A4/Legal)"
            findings.append(Finding(
                id="d_fmt_paper_001", severity=Severity.WARNING, page=first_bad,
                title="Non-Standard Paper Size",
                description=(f"The document is predominantly on {other} paper{ok_note}. "
                             f"Filings must be on A4 (21.0 x 29.7 cm) or Legal "
                             f"(21.6 x 35.6 cm).{ex_note}"),
                remediation="Re-format the document on A4 (or Legal) paper.",
                confidence=Confidence.HIGH,
                evidence={"distribution": dist, "non_accepted_pages": bad_pages[:20]}))
        elif frac >= _NON_A4_WARN_FRAC:
            breakdown = ", ".join(f"{v} {k}" for k, v in
                                  sorted(bad_classes.items(), key=lambda x: -x[1]) if v)
            findings.append(Finding(
                id="d_fmt_paper_003", severity=Severity.WARNING, page=first_bad,
                title="Mixed Paper Sizes",
                description=(f"{bad} of {total} pages are not A4 or Legal ({breakdown}). The "
                             f"paper-book should use a standard size - A4 (21.0 x 29.7 cm) "
                             f"or Legal (21.6 x 35.6 cm).{ex_note}"),
                remediation="Re-format the off-size pages to A4 (or Legal).",
                confidence=Confidence.HIGH,
                evidence={"non_accepted_fraction": round(frac, 2), "non_accepted_pages": bad_pages[:20]}))

        return self.result(details=details, findings=findings, confidence=Confidence.HIGH,
                           _ocr_annotate=False)


# =========================================================================== #
@register
class MarginDetector(Detector):
    """Flags the SPECIFIC pages whose body text runs into the left/right margin.

    Per-page only: the document-median ("whole book") margin findings were
    removed - they duplicated the per-page result and were less actionable. Each
    page is judged by the calibrated block-min + pervasiveness rule (see
    metrics._edge_defect_signal). Top/bottom are not flagged per-page because they
    have a single edge line, so the pervasiveness signal does not apply.
    """

    name = "MarginDetector"
    rule = "SC Rules, Order IV - Margins (4/4/2/2 cm)"
    kind = "page"

    # Per-side config for the PER-PAGE margin findings. Only LEFT and RIGHT are
    # flagged per-page (top/bottom have a single edge line, so the pervasiveness
    # signal that gives this rule its precision does not apply).
    _PAGE_SIDES = (
        {
            "side": "left",
            "block_attr": "left_block_min_cm",
            "frac_attr": "left_narrow_frac",
            "fid": "d_fmt_margin_left_pages",
            "title": "Left Margin Too Narrow on Specific Pages",
            "phrase": "the left (binding) margin",
        },
        {
            "side": "right",
            "block_attr": "right_block_min_cm",
            "frac_attr": "right_narrow_frac",
            "fid": "d_fmt_margin_right_pages",
            "title": "Right Margin Too Narrow on Specific Pages",
            "phrase": "the right margin",
        },
    )

    def run(self) -> DetectorResult:
        gated = geometry_gate(self, "d_fmt_margin_scan", "Margins")
        if gated:
            return gated

        m = self.ctx.margins_cm
        n = len(self.ctx.measurable_pages)
        details = {"verifiable": True, "pages_measured": n, "margins_cm": m}
        findings: List[Finding] = []

        if n < _MIN_PAGES:
            details["verifiable"] = False
            return self.result(details=details, findings=[], confidence=Confidence.LOW)

        # PER-PAGE margin defects only: the SPECIFIC pages whose body text runs
        # into the left or right margin. No document-median/whole-book findings -
        # those duplicated the per-page result and were less actionable.
        for cfg in self._PAGE_SIDES:
            pages = self._edge_defect_pages(cfg["block_attr"], cfg["frac_attr"])
            details[f"{cfg['side']}_defect_pages"] = pages
            if not pages:
                continue
            listed = ", ".join(str(p) for p in pages[:_EDGE_PAGE_MAX_LISTED])
            more = (f" (+{len(pages) - _EDGE_PAGE_MAX_LISTED} more)"
                    if len(pages) > _EDGE_PAGE_MAX_LISTED else "")
            findings.append(Finding(
                id=cfg["fid"], severity=Severity.WARNING, page=pages[0],
                title=cfg["title"],
                description=(f"On {len(pages)} page(s) the body text runs into "
                             f"{cfg['phrase']} - text reaches within "
                             f"~{_EDGE_PAGE_BLOCK_MIN_CM:.1f} cm of the page edge across "
                             f"much of the page. Affected page(s): {listed}{more}."),
                remediation=f"Increase the {cfg['side']} margin on these pages towards "
                            f"the {SPEC_MARGIN_LR_CM:.0f} cm spec.",
                confidence=Confidence.HIGH,
                evidence={"pages": pages[:_EDGE_PAGE_MAX_LISTED]}))

        conf = Confidence.HIGH if not findings else Confidence.MEDIUM
        return self.result(details=details, findings=findings, confidence=conf)

    def _edge_defect_pages(self, block_attr: str, frac_attr: str) -> List[int]:
        """1-based pages flagged by the calibrated per-page edge-margin rule."""
        out: List[int] = []
        for p in self.ctx.measurable_pages:
            bm = getattr(p, block_attr, None)
            nf = getattr(p, frac_attr, None)
            if bm is None or nf is None:
                continue
            if bm < _EDGE_PAGE_BLOCK_MIN_CM and nf >= _EDGE_PAGE_NARROW_FRAC:
                out.append(p.pdf_page_no + 1)
        return out


# =========================================================================== #
@register
class FontFamilyDetector(Detector):
    """Checks the dominant body font family; flags only clearly sans-serif body."""

    name = "FontFamilyDetector"
    rule = "SC Rules, Order IV - Type face (Times New Roman)"
    kind = "page"

    def run(self) -> DetectorResult:
        if self.on_ocr:
            return self.result(
                details={"verifiable": False, "reason": "no font metadata on scanned pages"},
                findings=[], confidence=Confidence.LOW, _ocr_annotate=False)
        if not self.ctx.reliable_typography:
            return self.unverified(fid="d_fmt_fontfam_scan", what="Font Family")

        counts = self.ctx.font_family_counts
        details = {"verifiable": True, "family_counts": dict(counts)}
        findings: List[Finding] = []

        total = sum(counts.values())
        if total < 200 or not counts:
            details["verifiable"] = False
            return self.result(details=details, findings=[], confidence=Confidence.LOW)

        dominant, dom_count = counts.most_common(1)[0]
        dom_frac = dom_count / total
        details["dominant_family"] = dominant
        details["dominant_fraction"] = round(dom_frac, 2)
        times_frac = sum(c for fam, c in counts.items()
                         if fam in TIMES_FAMILY_TOKENS) / total
        details["times_fraction"] = round(times_frac, 2)

        is_times_dominant = dominant in TIMES_FAMILY_TOKENS
        if is_times_dominant or times_frac >= 0.6:
            return self.result(details=details, findings=[], confidence=Confidence.HIGH)

        if dominant in _SANS_SERIF_TOKENS and dom_frac >= 0.6:
            findings.append(Finding(
                id="d_fmt_fontfam_001", severity=Severity.WARNING,
                title="Body Text Uses a Sans-Serif Font",
                description=(f"The dominant body typeface appears to be a sans-serif "
                             f"face ('{dominant}'). Supreme Court pleadings are "
                             f"conventionally set in a serif face such as Times New "
                             f"Roman for readability."),
                remediation="Set the body text in a serif face (e.g. Times New Roman).",
                confidence=Confidence.MEDIUM,
                evidence={"dominant_family": dominant, "dominant_fraction": round(dom_frac, 2)}))
            conf = Confidence.MEDIUM
        else:
            details["note"] = (f"Body face '{dominant or 'unknown'}' is not Times but "
                               f"is acceptable (serif/uncertain); no objection raised.")
            conf = Confidence.LOW

        return self.result(details=details, findings=findings, confidence=conf)


# =========================================================================== #
@register
class BodyFontSizeDetector(Detector):
    """Dominant body text size should be 14 pt (spec). Tiered."""

    name = "BodyFontSizeDetector"
    rule = "SC Rules, Order IV - Body type size (14 pt)"
    kind = "page"

    def run(self) -> DetectorResult:
        gated = typography_gate(self, "d_fmt_font_scan", "Font Size")
        if gated:
            return gated

        size = self.ctx.dominant_body_size
        n = len(self.ctx.measurable_pages)
        details = {"verifiable": True, "pages_measured": n}
        findings: List[Finding] = []

        if size is None or n < _MIN_PAGES:
            details["verifiable"] = False
            return self.result(details=details, findings=[], confidence=Confidence.LOW)

        details["body_font_pt"] = round(size, 1)

        concentration = self.ctx.body_size_concentration()
        details["size_concentration"] = round(concentration, 2)
        if concentration < 0.55:
            details["note"] = ("Body size is mixed across the document (e.g. small "
                               "annexures + larger pleading); not flagged.")
            return self.result(details=details, findings=[], confidence=Confidence.LOW)

        small_pages = self.ctx.pages_with_body_size(0.0, _FONT_WARN_LOW)
        ex_page = small_pages[0] if small_pages else 1
        ex_note = f" e.g. page {ex_page}." if small_pages else ""

        if size <= _FONT_CRITICAL_PT:
            findings.append(Finding(
                id="d_fmt_font_001", severity=Severity.CRITICAL, page=ex_page,
                title="Body Font Too Small",
                description=(f"The dominant body font is about {size:.1f} pt, below the "
                             f"{_FONT_CRITICAL_PT:.0f} pt floor. Such small text is "
                             f"illegible in the paper-book and draws objections.{ex_note}"),
                remediation=f"Re-set the body text to {SPEC_BODY_PT:.0f} pt.",
                confidence=Confidence.HIGH,
                evidence={"body_pt": round(size, 1), "example_page": ex_page}))
        elif size < _FONT_WARN_LOW:
            findings.append(Finding(
                id="d_fmt_font_002", severity=Severity.WARNING, page=ex_page,
                title="Small Body Font",
                description=(f"The dominant body font is about {size:.1f} pt. The "
                             f"Supreme Court spec is {SPEC_BODY_PT:.0f} pt.{ex_note}"),
                remediation=f"Increase the body font to {SPEC_BODY_PT:.0f} pt.",
                confidence=Confidence.MEDIUM,
                evidence={"body_pt": round(size, 1), "example_page": ex_page}))
        elif abs(size - SPEC_BODY_PT) > _FONT_SPEC_TOL:
            details["off_spec_note"] = (
                f"Body font ~{size:.1f} pt (spec {SPEC_BODY_PT:.0f} pt) - legible, "
                f"not a registry objection.")

        conf = Confidence.HIGH if not findings else Confidence.MEDIUM
        return self.result(details=details, findings=findings, confidence=conf)


# =========================================================================== #
@register
class LineSpacingDetector(Detector):
    """Body line spacing should be 1.5 (spec). Tiered."""

    name = "LineSpacingDetector"
    rule = "SC Rules, Order IV - Line spacing (1.5)"
    kind = "page"

    def run(self) -> DetectorResult:
        gated = typography_gate(self, "d_fmt_spacing_scan", "Line Spacing")
        if gated:
            return gated

        ratio = self.ctx.dominant_spacing_ratio
        n = len(self.ctx.measurable_pages)
        details = {"verifiable": True, "pages_measured": n}
        findings: List[Finding] = []

        if ratio is None or n < _MIN_PAGES:
            details["verifiable"] = False
            return self.result(details=details, findings=[], confidence=Confidence.LOW)

        details["spacing_ratio"] = round(ratio, 2)

        if ratio < _SPACING_SINGLE:
            cramped_frac = self.ctx.cramped_fraction(_SPACING_SINGLE)
            details["cramped_fraction"] = round(cramped_frac, 2)
            if cramped_frac < 0.55:
                details["note"] = ("Cramped spacing is not the document norm "
                                   "(likely annexures); not flagged.")
                return self.result(details=details, findings=[], confidence=Confidence.LOW)
            cramped_pages = self.ctx.pages_with_spacing_below(_SPACING_SINGLE)
            ex_page = cramped_pages[0] if cramped_pages else 1
            findings.append(Finding(
                id="d_fmt_spacing_001", severity=Severity.WARNING, page=ex_page,
                title="Cramped Line Spacing",
                description=(f"Body text appears single-spaced (line-to-font ratio "
                             f"~{ratio:.2f}). The Supreme Court spec is "
                             f"{_SPACING_SPEC:.1f} line spacing. e.g. page {ex_page}."),
                remediation=f"Set body line spacing to {_SPACING_SPEC:.1f}.",
                confidence=Confidence.MEDIUM,
                evidence={"ratio": round(ratio, 2), "example_page": ex_page}))
        elif abs(ratio - _SPACING_SPEC) > _SPACING_TOL:
            details["off_spec_note"] = (
                f"Line spacing ~{ratio:.2f} (spec {_SPACING_SPEC:.1f}) - acceptable, "
                f"not a registry objection.")

        conf = Confidence.HIGH if not findings else Confidence.MEDIUM
        return self.result(details=details, findings=findings, confidence=conf)


# =========================================================================== #
@register
class QuotationBlockDetector(Detector):
    """Identifies indented quotation blocks (informational only; raises no defect)."""

    name = "QuotationBlockDetector"
    rule = "SC Rules, Order IV - Quotations (12 pt, single spacing)"
    kind = "page"

    _INDENT_PT = 18.0
    _MIN_BLOCK_LINES = 3

    def run(self) -> DetectorResult:
        gated = typography_gate(self, "d_fmt_quote_scan", "Quotations")
        if gated:
            return gated

        body_size = self.ctx.dominant_body_size
        details = {"verifiable": True, "blocks_found": 0}

        if body_size is None or len(self.ctx.measurable_pages) < _MIN_PAGES:
            details["verifiable"] = False
            return self.result(details=details, findings=[], confidence=Confidence.LOW)

        blocks = self._find_quote_blocks(body_size)
        details["blocks_found"] = len(blocks)
        if blocks:
            details["quote_sizes"] = sorted({round(b["size"], 1) for b in blocks})
            bad_size = [b for b in blocks if abs(b["size"] - SPEC_QUOTE_PT) > 1.0]
            details["off_spec_blocks"] = len(bad_size)

        # Informational only - never raises a defect (corpus precision decision).
        return self.result(details=details, findings=[], confidence=Confidence.MEDIUM)

    def _find_quote_blocks(self, body_size: float) -> List[dict]:
        out: List[dict] = []
        for p in self.ctx.measurable_pages:
            if p.margin_left is None:
                continue
            body_left_pt = p.margin_left
            run: List = []
            for ln in p.body_lines:
                indented = (ln.x0 - body_left_pt) >= self._INDENT_PT
                smaller = ln.modal_size and ln.modal_size < body_size - 0.6
                if indented and smaller and ln.char_count >= 10:
                    run.append(ln)
                else:
                    if len(run) >= self._MIN_BLOCK_LINES:
                        sizes = [r.modal_size for r in run if r.modal_size]
                        out.append({"page": p.pdf_page_no + 1,
                                    "size": st.median(sizes) if sizes else body_size,
                                    "lines": len(run)})
                    run = []
            if len(run) >= self._MIN_BLOCK_LINES:
                sizes = [r.modal_size for r in run if r.modal_size]
                out.append({"page": p.pdf_page_no + 1,
                            "size": st.median(sizes) if sizes else body_size,
                            "lines": len(run)})
        return out
