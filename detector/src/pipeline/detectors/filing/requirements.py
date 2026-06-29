"""
Filing-requirement detectors - the "will-bounce" checks.

PORTED VERBATIM from the corpus-tuned engine: court fee, limitation/condonation,
certified copy (case-type aware), vakalatnama (in-person waiver), affidavit. The
precision policy (text-absence is a WEAK signal -> LOW-confidence MINOR advisory
for fee/vakalatnama/affidavit; WARNING only for the genuinely risky
delay-without-condonation and appeal-without-certified-copy) is unchanged.

These run on the whole-document text, so they are registered as ``kind="page"``
(they execute once over ``ctx``, not per-page). They are grouped here only for
code organisation.
"""

from __future__ import annotations

import re
from typing import Any, Dict, List

from ...base import Detector, DetectorResult
from ...finding import Finding, Severity, Confidence
from ...registry import register
from ...gates import text_gate

_FRONT_PAGES = 8


def _front_text(ctx, n: int = _FRONT_PAGES) -> str:
    return ctx.first_pages_text(n).upper()


def _full_text(ctx) -> str:
    return "\n".join(p.text for p in ctx.pages).upper()


@register
class CourtFeeDetector(Detector):
    """Flags when no court-fee marker is found anywhere in the paper-book."""

    name = "CourtFeeDetector"
    rule = "SC Rules, Order IV - Court fees"
    kind = "page"

    _FEE_RE = re.compile(
        r"COURT\s*-?\s*FEE|COURT\s+FEES|FEE\s+STAMP|FILING\s+FEE|"
        r"E-?\s*FILING\s+FEE|FEES?\s+PAID|PROCESS\s+FEE|DEFICIT\s+COURT\s+FEE|"
        r"COURT\s+FEE\s+OF\s+RS|AD\s*VALOREM|FIXED\s+COURT\s+FEE|"
        r"REQUISITE\s+(COURT\s+)?FEE|APPLICATION\s+FEE",
        re.IGNORECASE)

    def run(self) -> DetectorResult:
        gated = text_gate(self, "d_fee_scan", "Court Fee")
        if gated:
            return gated
        text = _full_text(self.ctx)
        found = bool(self._FEE_RE.search(text))
        details = {"verifiable": True, "court_fee_marker": found}
        findings: List[Finding] = []
        if not found:
            findings.append(Finding(
                id="d_fee_001", severity=Severity.MINOR, page=1,
                title="Court Fee Reference Not Found in Text",
                description=("No court-fee reference was found in the document text. "
                             "Note: the fee is often paid electronically or on a "
                             "separate/scanned receipt that this text scan cannot see, "
                             "so this is an advisory, not a confirmed deficiency."),
                remediation=("Confirm the prescribed court fee is paid and on record "
                             "(e-filing receipt or court-fee stamp)."),
                confidence=Confidence.LOW, evidence={"fee_marker_found": False}))
        conf = Confidence.HIGH if found else Confidence.LOW
        return self.result(details=details, findings=findings, confidence=conf)


@register
class LimitationDetector(Detector):
    """Flags a time-barred filing with no condonation application."""

    name = "LimitationDetector"
    rule = "Limitation Act / SC Rules - Condonation of delay"
    kind = "page"

    _DELAY_SIGNAL_RE = re.compile(
        r"BARRED\s+BY\s+LIMITATION|TIME[-\s]?BARRED|DELAY\s+OF\s+\d+\s+DAYS?|"
        r"BEYOND\s+(THE\s+)?(PERIOD\s+OF\s+)?LIMITATION|OUT\s+OF\s+TIME",
        re.IGNORECASE)
    _CONDONATION_RE = re.compile(
        r"CONDONATION\s+OF\s+DELAY|CONDONE\s+THE\s+DELAY|APPLICATION\s+FOR\s+DELAY|"
        r"SECTION\s+5\s+OF\s+THE\s+LIMITATION|I\.?A\.?\s+FOR\s+CONDONATION",
        re.IGNORECASE)

    def run(self) -> DetectorResult:
        gated = text_gate(self, "d_lim_scan", "Limitation / Delay")
        if gated:
            return gated
        text = _full_text(self.ctx)
        delay = bool(self._DELAY_SIGNAL_RE.search(text))
        condonation = bool(self._CONDONATION_RE.search(text))
        details = {"verifiable": True, "delay_signal": delay,
                   "condonation_application": condonation}
        findings: List[Finding] = []
        if delay and not condonation:
            findings.append(Finding(
                id="d_lim_001", severity=Severity.WARNING, page=1,
                title="Possible Delay Without Condonation Application",
                description=("The filing refers to being filed late / beyond limitation, "
                             "but no application for condonation of delay (Section 5, "
                             "Limitation Act) was detected. A time-barred filing without "
                             "such an application is liable to objection."),
                remediation=("File an application for condonation of delay setting out "
                             "the sufficient cause, or confirm the matter is within "
                             "limitation."),
                confidence=Confidence.MEDIUM,
                evidence={"delay_signal": True, "condonation_found": False}))
        return self.result(details=details, findings=findings, confidence=Confidence.MEDIUM)


@register
class CertifiedCopyDetector(Detector):
    """For SLPs/appeals/review, flags a missing certified copy of the impugned order."""

    name = "CertifiedCopyDetector"
    rule = "SC Rules, Order XV/XXI - Certified copy of impugned order"
    kind = "page"

    _APPEAL_TYPE_RE = re.compile(
        r"SPECIAL\s+LEAVE\s+PETITION|\bS\.?L\.?P\.?\b|CIVIL\s+APPEAL|CRIMINAL\s+APPEAL|"
        r"REVIEW\s+PETITION|APPEAL\s+AGAINST|ARISING\s+OUT\s+OF\s+(THE\s+)?(IMPUGNED\s+)?"
        r"(JUDGMENT|ORDER)|IMPUGNED\s+(JUDGMENT|ORDER)",
        re.IGNORECASE)
    _CERT_COPY_RE = re.compile(
        r"CERTIFIED\s+COP(Y|IES)|TRUE\s+COP(Y|IES)\s+OF\s+THE\s+(IMPUGNED\s+)?"
        r"(JUDGMENT|ORDER)|CERTIFIED\s+TRUE\s+COPY",
        re.IGNORECASE)

    def run(self) -> DetectorResult:
        gated = text_gate(self, "d_cc_scan", "Certified Copy")
        if gated:
            return gated
        head = _front_text(self.ctx, 6)
        text = _full_text(self.ctx)
        is_appeal = bool(self._APPEAL_TYPE_RE.search(head) or
                         self._APPEAL_TYPE_RE.search(text[:8000]))
        has_cert = bool(self._CERT_COPY_RE.search(text))
        details = {"verifiable": True, "appeal_type": is_appeal,
                   "certified_copy_marker": has_cert}
        findings: List[Finding] = []
        if is_appeal and not has_cert:
            findings.append(Finding(
                id="d_cc_001", severity=Severity.WARNING, page=1,
                title="Certified Copy of Impugned Order Not Detected",
                description=("This appears to challenge a judgment/order (SLP / appeal / "
                             "review), but no certified copy of the impugned order was "
                             "detected. The Registry requires a certified copy of the "
                             "order under challenge."),
                remediation=("Annex the certified copy of the impugned judgment/order "
                             "(or its application for exemption from filing a certified "
                             "copy, if applicable)."),
                confidence=Confidence.MEDIUM,
                evidence={"appeal_type": True, "certified_copy_found": False}))
        return self.result(details=details, findings=findings, confidence=Confidence.MEDIUM)


@register
class VakalatnamaDetector(Detector):
    """Flags a missing Vakalatnama unless the filing is by a party-in-person."""

    name = "VakalatnamaDetector"
    rule = "SC Rules, Order IV - Vakalatnama / appearance"
    kind = "page"

    _VAKALAT_RE = re.compile(r"VAKALATNAMA|VAKALAT|MEMO(?:RANDUM)?\s+OF\s+APPEARANCE",
                             re.IGNORECASE)
    _IN_PERSON_RE = re.compile(
        r"(PETITIONER|APPELLANT|PARTY)[\s-]*IN[\s-]*PERSON|IN\s+PERSON", re.IGNORECASE)

    def run(self) -> DetectorResult:
        gated = text_gate(self, "d_vak_scan", "Vakalatnama")
        if gated:
            return gated
        text = _full_text(self.ctx)
        has_vak = bool(self._VAKALAT_RE.search(text))
        in_person = bool(self._IN_PERSON_RE.search(_front_text(self.ctx, 4)))
        details = {"verifiable": True, "vakalatnama": has_vak, "in_person": in_person}
        findings: List[Finding] = []
        if not has_vak and not in_person:
            findings.append(Finding(
                id="d_vak_001", severity=Severity.MINOR, page=1,
                title="Vakalatnama Not Found in Text",
                description=("No Vakalatnama / Memo of Appearance text was detected. "
                             "Note: it is usually a signed, scanned page whose text may "
                             "not extract, so this is advisory, not a confirmed absence."),
                remediation=("Confirm an executed Vakalatnama is on record (signed by "
                             "the party and accepted by the AOR); if in person, none is "
                             "needed."),
                confidence=Confidence.LOW,
                evidence={"vakalatnama_found": False, "in_person": False}))
        return self.result(details=details, findings=findings, confidence=Confidence.MEDIUM)


@register
class AffidavitDetector(Detector):
    """Flags a missing or unsworn affidavit in support."""

    name = "AffidavitDetector"
    rule = "SC Rules, Order IV - Affidavit in support"
    kind = "page"

    _AFFIDAVIT_RE = re.compile(r"\bAFFIDAVIT\b|VERIFICATION", re.IGNORECASE)
    _SWORN_RE = re.compile(
        r"SOLEMNLY\s+AFFIRM|SWORN|DEPONENT|NOTAR|OATH\s+COMMISSIONER|"
        r"VERIFIED\s+AT|BEFORE\s+ME",
        re.IGNORECASE)

    def run(self) -> DetectorResult:
        gated = text_gate(self, "d_aff_scan", "Affidavit")
        if gated:
            return gated
        text = _full_text(self.ctx)
        has_aff = bool(self._AFFIDAVIT_RE.search(text))
        sworn = bool(self._SWORN_RE.search(text))
        details = {"verifiable": True, "affidavit": has_aff, "sworn_markers": sworn}
        findings: List[Finding] = []
        if not has_aff:
            findings.append(Finding(
                id="d_aff_001", severity=Severity.MINOR, page=1,
                title="Affidavit Not Found in Text",
                description=("No affidavit/verification text was detected. A petition is "
                             "ordinarily supported by an affidavit; note it may be a "
                             "scanned page whose text did not extract."),
                remediation="Confirm a duly sworn affidavit in support is on record.",
                confidence=Confidence.LOW, evidence={"affidavit_found": False}))
        elif not sworn:
            findings.append(Finding(
                id="d_aff_002", severity=Severity.MINOR, page=1,
                title="Affidavit May Not Be Properly Sworn",
                description=("An affidavit/verification was found, but no swearing or "
                             "attestation markers (e.g. 'solemnly affirm', notarisation, "
                             "oath commissioner) were detected. An unsworn affidavit is "
                             "objectionable."),
                remediation=("Ensure the affidavit is sworn/affirmed before an oath "
                             "commissioner or notary and properly attested."),
                confidence=Confidence.LOW, evidence={"sworn_markers_found": False}))
        return self.result(details=details, findings=findings, confidence=Confidence.MEDIUM)
