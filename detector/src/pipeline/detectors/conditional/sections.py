"""
Conditional detectors — Stage 6.

Each runs ONLY when the relevant page was identified by the MetadataBuilder
(``PageMetadata.detected_title``), so page-specific checks never run on every
page. A conditional detector that finds no applicable page returns an empty pass
(no defect, no noise).

PRECISION POLICY (project core rule): these inspect a specific, already-located
page, so they can be more confident than a whole-document scan — but they still
prefer silence over a shaky finding. They reuse the same sworn/in-person/markers
vocabulary the ported filing-requirement detectors use.

Detectors here:
  * SynopsisDetector      — synopsis/list-of-dates present and non-trivial
  * CauseTitleDetector    — cause-title page carries court + parties + versus
  * VakalatnamaPageDetector — on the vakalatnama page, look for execution markers
  * AffidavitPageDetector — on the affidavit page, look for swearing/attestation
  * AnnexurePageDetector  — annexure pages carry an annexure marker/number
"""

from __future__ import annotations

import re
from typing import List, Optional

from ...base import Detector, DetectorResult
from ...finding import Finding, Severity, Confidence
from ...registry import register
from ...model import PageMetadata


def _first_titled(ctx, title: str) -> Optional[PageMetadata]:
    pages = ctx.pages_titled(title)
    return pages[0] if pages else None


# =========================================================================== #
@register
class SynopsisDetector(Detector):
    """Runs only on the Synopsis / List of Dates page (Stage 6)."""

    name = "SynopsisDetector"
    rule = "SC Rules, Order IV - Synopsis & List of Dates"
    kind = "conditional"

    _DATE_RE = re.compile(r"\b\d{1,2}[./-]\d{1,2}[./-]\d{2,4}\b")

    def run(self) -> DetectorResult:
        page = _first_titled(self.ctx, "Synopsis & List of Dates")
        details = {"applicable": page is not None}
        if page is None or not self.ctx.text_scrutinizable:
            return self.result(details=details, findings=[], confidence=Confidence.HIGH,
                               _ocr_annotate=False)

        details["page"] = page.pdf_page_no + 1
        text = page.text
        dates = self._DATE_RE.findall(text)
        details["dates_found"] = len(dates)
        findings: List[Finding] = []

        # A List of Dates with no dates at all, or a near-empty synopsis page, is
        # a genuine structural problem the Registry can object to.
        if "LIST OF DATES" in text.upper() and len(dates) == 0 and len(text) > 80:
            findings.append(Finding(
                id="d_syn_001", severity=Severity.MINOR, page=page.pdf_page_no + 1,
                title="List of Dates Has No Dates",
                description=("The 'List of Dates' page was found but no dates could be "
                             "read on it. The List of Dates must set out the chronology "
                             "of relevant events with their dates."),
                remediation="Ensure the List of Dates sets out each event against its date.",
                confidence=Confidence.LOW,
                evidence={"page": page.pdf_page_no + 1}))
        return self.result(details=details, findings=findings, confidence=Confidence.HIGH,
                           _ocr_annotate=False)


# =========================================================================== #
@register
class CauseTitleDetector(Detector):
    """Runs only on the cause-title page; checks it names the parties."""

    name = "CauseTitleDetector"
    rule = "SC Rules, Order IV - Cause title"
    kind = "conditional"

    _VERSUS_RE = re.compile(r"\bV(?:ERSUS|S\.?|/S)\b|\bVS\b", re.IGNORECASE)

    def run(self) -> DetectorResult:
        page = _first_titled(self.ctx, "Cause Title")
        details = {"applicable": page is not None}
        if page is None or not self.ctx.text_scrutinizable:
            return self.result(details=details, findings=[], confidence=Confidence.HIGH,
                               _ocr_annotate=False)

        details["page"] = page.pdf_page_no + 1
        text = page.text.upper()
        has_versus = bool(self._VERSUS_RE.search(text))
        has_party = bool(re.search(r"PETITIONER|APPELLANT|APPLICANT|RESPONDENT", text))
        details["has_versus"] = has_versus
        details["has_party_label"] = has_party
        findings: List[Finding] = []

        # Only flag when the cause-title page names NEITHER a party role NOR a
        # versus — a real cause title always has both; missing both means the
        # parties aren't set out (precision: require both absent).
        if not has_versus and not has_party:
            findings.append(Finding(
                id="d_cause_001", severity=Severity.MINOR, page=page.pdf_page_no + 1,
                title="Cause Title May Not Name the Parties",
                description=("The cause-title page was found, but neither a party "
                             "designation (Petitioner/Appellant/Respondent) nor a "
                             "'versus' could be read. The cause title must set out the "
                             "parties to the matter."),
                remediation="Ensure the cause title names the parties and their array "
                            "(e.g. 'A ... Petitioner versus B ... Respondent').",
                confidence=Confidence.LOW,
                evidence={"page": page.pdf_page_no + 1}))
        return self.result(details=details, findings=findings, confidence=Confidence.HIGH,
                           _ocr_annotate=False)


# =========================================================================== #
@register
class AffidavitPageDetector(Detector):
    """Runs only on the affidavit page; checks for swearing/attestation markers."""

    name = "AffidavitPageDetector"
    rule = "SC Rules, Order IV - Affidavit attestation"
    kind = "conditional"

    _SWORN_RE = re.compile(
        r"SOLEMNLY\s+AFFIRM|SWORN|DEPONENT|NOTAR|OATH\s+COMMISSIONER|"
        r"VERIFIED\s+AT|BEFORE\s+ME|AFFIRMED",
        re.IGNORECASE)

    def run(self) -> DetectorResult:
        page = _first_titled(self.ctx, "Affidavit")
        details = {"applicable": page is not None}
        if page is None or not self.ctx.text_scrutinizable:
            return self.result(details=details, findings=[], confidence=Confidence.HIGH,
                               _ocr_annotate=False)

        details["page"] = page.pdf_page_no + 1
        # Check the affidavit page AND the page after (the jurat often spills over).
        window_text = page.text
        nxt = page.pdf_page_no + 1
        if nxt < len(self.ctx.pages):
            window_text += "\n" + self.ctx.pages[nxt].text
        details["sworn_markers"] = bool(self._SWORN_RE.search(window_text))

        # CONFIRMATORY ONLY (precision): the whole-document AffidavitDetector
        # already raises the (soft) unsworn-affidavit advisory. A page-level
        # re-check would double-report AND false-flag the common case where the
        # jurat is a scanned signature/stamp whose text doesn't extract. So this
        # detector records WHERE the affidavit is (useful for the UI) but raises
        # no defect of its own. See [[detector-precision-pass]] rationale.
        return self.result(details=details, findings=[], confidence=Confidence.HIGH,
                           _ocr_annotate=False)


# =========================================================================== #
@register
class VakalatnamaPageDetector(Detector):
    """Runs only when a Vakalatnama page was identified (Stage 6, confirmatory)."""

    name = "VakalatnamaPageDetector"
    rule = "SC Rules, Order IV - Vakalatnama execution"
    kind = "conditional"

    def run(self) -> DetectorResult:
        page = _first_titled(self.ctx, "Vakalatnama")
        details = {"applicable": page is not None}
        # CONFIRMATORY ONLY: when a vakalatnama page is present we record it (so
        # the whole-document VakalatnamaDetector's "not found in text" advisory is
        # demonstrably satisfied and the UI can show the page). We deliberately
        # raise NO defect here: the vakalatnama is a signed scanned page, so any
        # absence-of-markers check would be a low-precision false positive. Its
        # presence is the useful signal.
        if page is not None:
            details["page"] = page.pdf_page_no + 1
        return self.result(details=details, findings=[], confidence=Confidence.HIGH,
                           _ocr_annotate=False)


# =========================================================================== #
@register
class AnnexurePageDetector(Detector):
    """Runs only on annexure pages; confirms each carries an annexure marker."""

    name = "AnnexurePageDetector"
    rule = "SC Rules, Order IV - Annexure marking"
    kind = "conditional"

    def run(self) -> DetectorResult:
        pages = self.ctx.pages_titled("Annexure")
        details = {"applicable": bool(pages), "annexure_pages": len(pages)}
        # Annexure marking gaps are already handled (with corpus-tuned precision)
        # by SectionOrderDetector._check_annexure_numbering. This conditional
        # detector is INFORMATIONAL only — it records which pages open an annexure
        # so the report/UI can show annexure coverage, but raises no defect (to
        # avoid duplicating the section detector's annexure-gap finding).
        details["annexure_page_numbers"] = [p.pdf_page_no + 1 for p in pages[:50]]
        return self.result(details=details, findings=[], confidence=Confidence.HIGH,
                           _ocr_annotate=False)
