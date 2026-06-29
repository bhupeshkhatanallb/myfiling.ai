"""
TextLayerDetector - searchable/selectable text-layer check.

A Supreme Court e-filing must be machine-readable: its pages should carry a real
text layer so the paper-book is searchable and the text is selectable/copyable.
A filing whose pages are scanned IMAGES with no text layer (a photocopied book
saved straight to PDF without OCR) is a serious, common registry objection - and
it is exactly the kind of defect a human notices immediately ("I can't select any
text") but an automated scan can miss, because every text-based check simply
gates out with a quiet "could not verify" note.

This detector makes the absence of a text layer an EXPLICIT, first-class defect.

How it reads the state: by the time this runs, OCR (if it ran) has already
rebuilt image pages with ``extraction_mode == "ocr"`` (and ``text_selectable``
False). So a page lacks a usable native text layer when it is either an OCR'd
page or a native page with no real selectable text. We count those against the
whole document.

PRECISION POLICY (precision over recall - calibrated against the corpus):
  * CRITICAL only when the document is OVERWHELMINGLY image-only (the body itself
    is not searchable) - the clear, defensible objection.
  * WARNING only when the MAJORITY of pages lack a text layer.
  * Silent otherwise - crucially, a normal native petition with a substantial
    block of SCANNED ANNEXURES (signed affidavits, certified copies, exhibits) is
    standard, accepted practice. Three valid corpus filings are 25-27% scanned
    annexures; flagging those is the false positive this policy forbids. So the
    thresholds sit well above a normal annexure share.
"""

from __future__ import annotations

from typing import List

from ...base import Detector, DetectorResult
from ...finding import Finding, Severity, Confidence
from ...registry import register


@register
class TextLayerDetector(Detector):
    """Flags pages that have no searchable / selectable text layer (scanned images)."""

    name = "TextLayerDetector"
    rule = "SC e-filing - Searchable (OCR'd) text required"
    kind = "page"

    # Fractions of the document that are image-only (no native text layer).
    # Calibrated above a normal scanned-annexure share (corpus: valid filings run
    # 25-27% scanned annexures, which must NOT be flagged): a WARNING needs the
    # MAJORITY of pages unsearchable; a CRITICAL needs the book to be essentially
    # all images.
    _CRITICAL_FRACTION = 0.75   # essentially the whole book is unsearchable
    _WARNING_FRACTION = 0.50    # the majority of pages are unsearchable
    _MIN_PAGES = 3              # too small to judge meaningfully

    # Per-page OCR-garble: a page whose text layer is clearly UNREADABLE (heavily
    # distorted OCR). A page is flagged only when BOTH a high garble ratio AND a
    # LOW real-word fraction hold - this separates genuinely-mangled text from a
    # readable page that merely carries leading-symbol scan noise (which inflates
    # the garble ratio alone). Calibrated across the corpus: catches the test
    # PDF's distorted page and other mangled scans while sparing readable pages.
    _GARBLE_THRESHOLD = 0.18
    _REALWORD_MAX = 0.12
    _GARBLE_MAX_LISTED = 20

    def run(self) -> DetectorResult:
        pages = self.ctx.pages
        n = len(pages)
        details = {"total_pages": self.ctx.page_count, "pages_examined": n}

        if n < self._MIN_PAGES:
            details["applicable"] = False
            return self.result(details=details, findings=[], confidence=Confidence.LOW,
                               _ocr_annotate=False)

        # A page lacks a usable native text layer if it was OCR'd (i.e. it had no
        # native text so OCR recovered it) OR it is a native page whose text is
        # not genuinely selectable.
        no_layer = [p for p in pages
                    if p.extraction_mode == "ocr" or p.text_selectable is False]
        no_layer_pages = [p.pdf_page_no + 1 for p in no_layer]
        frac = len(no_layer) / n
        details["pages_without_text_layer"] = len(no_layer)
        details["fraction_without_text_layer"] = round(frac, 2)
        details["example_pages"] = no_layer_pages[:20]

        findings: List[Finding] = []
        first_bad = no_layer_pages[0] if no_layer_pages else 1
        examples = ", ".join(str(p) for p in no_layer_pages[:6])
        ex_note = f" e.g. page(s) {examples}." if no_layer_pages else ""
        ocr_note = (" (The system OCR'd them to scrutinise the contents, but the "
                    "filed PDF itself is not searchable.)"
                    if self.ctx.ocr_used else "")

        if frac >= self._CRITICAL_FRACTION:
            findings.append(Finding(
                id="d_textlayer_001", severity=Severity.CRITICAL, page=first_bad,
                title="Document Is Not Searchable (No Text Layer)",
                description=(f"{len(no_layer)} of {n} pages are scanned images with no "
                             f"selectable/searchable text layer "
                             f"({round(frac*100)}% of the document). Supreme Court "
                             f"e-filings must be machine-readable (OCR'd) so the "
                             f"paper-book is searchable and text can be copied.{ex_note}"
                             f"{ocr_note}"),
                remediation=("Run OCR on the document (or export a text-based PDF) so "
                             "every page has a selectable text layer before filing."),
                confidence=Confidence.HIGH,
                evidence={"fraction": round(frac, 2),
                          "pages_without_text_layer": no_layer_pages[:20]}))
        elif frac >= self._WARNING_FRACTION:
            findings.append(Finding(
                id="d_textlayer_002", severity=Severity.WARNING, page=first_bad,
                title="Several Pages Are Not Searchable (No Text Layer)",
                description=(f"{len(no_layer)} of {n} pages are scanned images with no "
                             f"selectable text layer ({round(frac*100)}% of the "
                             f"document). Scanned annexures/exhibits should be OCR'd so "
                             f"the whole paper-book is searchable.{ex_note}{ocr_note}"),
                remediation=("OCR the scanned pages so their text is selectable and "
                             "searchable."),
                confidence=Confidence.MEDIUM,
                evidence={"fraction": round(frac, 2),
                          "pages_without_text_layer": no_layer_pages[:20]}))

        # Per-page OCR-incompatible (distorted/unreadable text layer): pages whose
        # extracted text is clearly garbled. These HAVE a text layer (so the
        # whole-document checks above don't catch them) but it is unreadable.
        garbled = [p for p in pages
                   if p.garble_ratio is not None and p.realword_ratio is not None
                   and p.garble_ratio >= self._GARBLE_THRESHOLD
                   and p.realword_ratio < self._REALWORD_MAX]
        garbled_pages = [p.pdf_page_no + 1 for p in garbled]
        details["garbled_pages"] = garbled_pages[:self._GARBLE_MAX_LISTED]
        if garbled:
            listed = ", ".join(str(p) for p in garbled_pages[:self._GARBLE_MAX_LISTED])
            more = (f" (+{len(garbled_pages) - self._GARBLE_MAX_LISTED} more)"
                    if len(garbled_pages) > self._GARBLE_MAX_LISTED else "")
            findings.append(Finding(
                id="d_textlayer_garble", severity=Severity.WARNING, page=garbled_pages[0],
                title="Distorted / Unreadable OCR Text",
                description=(f"On {len(garbled_pages)} page(s) the extracted text is "
                             f"heavily distorted (the OCR text layer is largely "
                             f"unreadable). The page is not reliably searchable and may "
                             f"be objected to. Affected page(s): {listed}{more}."),
                remediation=("Re-OCR the affected pages from a clean, high-resolution "
                             "scan so their text layer is accurate and searchable."),
                confidence=Confidence.MEDIUM,
                evidence={"pages": garbled_pages[:self._GARBLE_MAX_LISTED]}))

        conf = Confidence.HIGH if not findings else Confidence.HIGH
        return self.result(details=details, findings=findings, confidence=conf,
                           _ocr_annotate=False)
