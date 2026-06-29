"""
Quality detectors — Stage 4 quality checks over scanned-page signals.

These consume the lazy image-quality signals (``dpi`` / ``blur_score`` /
``ocr_compatible``) the quality pass populated on image-heavy pages. They flag a
filing whose scanned pages are too low-resolution or too blurred to read — a real
Registry objection — while staying silent on clean native filings (which have no
image-heavy pages, hence no signals).

PRECISION POLICY: only flag when MULTIPLE scanned pages are clearly bad (a single
soft page is often a cover/photo, not a defect), and cap output at the
per-detector limit.
"""

from __future__ import annotations

from typing import List

from ...base import Detector, DetectorResult
from ...finding import Finding, Severity, Confidence
from ...registry import register
from ...quality import _MIN_OCR_DPI, _COURT_MIN_DPI


@register
class ScanQualityDetector(Detector):
    """Flags low-resolution / blurred scanned pages (illegible in print).

    DPI uses the court-spec floor (300 DPI, flagged below 290 to absorb rounding,
    matching the reference analyzer). Blur uses the adaptive verdict the quality
    pass computed against the document's own p75 sharpness — far more robust than
    a fixed Laplacian-variance constant.
    """

    name = "ScanQualityDetector"
    rule = "SC Rules - Legible reproduction of documents"
    kind = "page"

    # Require this many bad pages AND this fraction of scanned pages before
    # raising (precision over recall): a couple of low-res pages in a big book is
    # not a filing defect, a pervasive low-res scan is.
    _MIN_BAD_PAGES = 3
    _MIN_BAD_FRACTION = 0.30

    def run(self) -> DetectorResult:
        # A page is "scored" if the quality pass measured EITHER a DPI or a blur
        # value on it. (blur_score is None on near-blank pages, but those can
        # still carry a measurable low DPI — so gate on either signal.)
        scored = [p for p in self.ctx.pages
                  if p.dpi is not None or p.blur_score is not None]
        details = {"pages_quality_scanned": len(scored)}
        if not scored:
            # No scan pages were measured (clean native filing) -> nothing.
            details["applicable"] = False
            return self.result(details=details, findings=[], confidence=Confidence.HIGH,
                               _ocr_annotate=False)

        details["applicable"] = True
        low_dpi = [p for p in scored if p.dpi is not None and p.dpi < _MIN_OCR_DPI]
        blurred = [p for p in scored if p.blur_flagged]
        details["low_dpi_pages"] = [p.pdf_page_no + 1 for p in low_dpi[:20]]
        details["blurred_pages"] = [p.pdf_page_no + 1 for p in blurred[:20]]
        findings: List[Finding] = []

        # DPI and blur each gate against their own measured-page population.
        dpi_measured = [p for p in scored if p.dpi is not None]
        blur_measured = [p for p in scored if p.blur_flagged is not None]

        def _pervasive(bad: list, population: list) -> bool:
            return (len(bad) >= self._MIN_BAD_PAGES and population
                    and len(bad) / len(population) >= self._MIN_BAD_FRACTION)

        if _pervasive(low_dpi, dpi_measured):
            pages = ", ".join(str(p.pdf_page_no + 1) for p in low_dpi[:6])
            worst = min(low_dpi, key=lambda p: p.dpi or 0)
            findings.append(Finding(
                id="d_qual_dpi", severity=Severity.WARNING, page=worst.pdf_page_no + 1,
                title="Low-Resolution Scanned Pages",
                description=(f"{len(low_dpi)} scanned page(s) are below the "
                             f"{_COURT_MIN_DPI:.0f} DPI minimum (e.g. page "
                             f"{worst.pdf_page_no + 1} at ~{worst.dpi:.0f} DPI). "
                             f"Low-resolution scans are hard to read in the paper-book "
                             f"and may be objected to. Pages: {pages}."),
                remediation=f"Re-scan the affected pages at {_COURT_MIN_DPI:.0f} DPI "
                            f"for legible reproduction.",
                confidence=Confidence.MEDIUM,
                evidence={"low_dpi_pages": details["low_dpi_pages"]}))

        # SEVERELY blurred pages are illegible (not merely soft) and are surfaced
        # INDIVIDUALLY — no pervasiveness gate — because even one such page is a
        # real "can't read this page" defect. Slight blur still needs the
        # pervasiveness gate (a single soft cover/photo is not a filing defect).
        severe = [p for p in scored if p.blur_severe]
        details["severe_blur_pages"] = [p.pdf_page_no + 1 for p in severe[:20]]
        slight_only = [p for p in blurred if not p.blur_severe]

        if severe:
            pages = ", ".join(str(p.pdf_page_no + 1) for p in severe[:8])
            more = f" (+{len(severe) - 8} more)" if len(severe) > 8 else ""
            findings.append(Finding(
                id="d_qual_blur_severe", severity=Severity.WARNING,
                page=severe[0].pdf_page_no + 1,
                title="Blurred / Illegible Scanned Pages",
                description=(f"{len(severe)} scanned page(s) are badly blurred and hard to "
                             f"read — text on these pages may be illegible in the "
                             f"paper-book. Affected page(s): {pages}{more}."),
                remediation="Re-scan the affected pages with the document flat and in "
                            "focus (at 300 DPI).",
                confidence=Confidence.MEDIUM,
                evidence={"pages": details["severe_blur_pages"]}))

        if _pervasive(slight_only, blur_measured):
            pages = ", ".join(str(p.pdf_page_no + 1) for p in slight_only[:6])
            findings.append(Finding(
                id="d_qual_blur", severity=Severity.MINOR, page=slight_only[0].pdf_page_no + 1,
                title="Soft / Slightly Blurred Scanned Pages",
                description=(f"{len(slight_only)} scanned page(s) appear soft or slightly "
                             f"blurred and may be hard to read (e.g. page "
                             f"{slight_only[0].pdf_page_no + 1}). Pages: {pages}."),
                remediation="Re-scan the affected pages with the document flat and in focus.",
                confidence=Confidence.LOW,
                evidence={"blurred_pages": details["blurred_pages"]}))

        conf = Confidence.HIGH if not findings else Confidence.MEDIUM
        return self.result(details=details, findings=findings, confidence=conf,
                           _ocr_annotate=False)
