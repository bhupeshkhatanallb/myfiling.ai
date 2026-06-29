"""
Structural detectors — index format, section order.

(Page numbering lives in page_numbering.py.) The DECISION LOGIC is PORTED VERBATIM
from the corpus-tuned engine: index "present-but-unparsed is not a defect",
>=2 gross out-of-range refs before flagging, annexure-in-index-not-in-body,
section presence/order with in-person vakalatnama waiver, interior-only annexure
gap. IndexFormatDetector now consumes the pre-extracted ``ctx.index_entries``
(Stage 2) rather than re-parsing, but the grammar that produced them is identical.
"""

from __future__ import annotations

import re
from typing import Any, Dict, List

from ...base import Detector, DetectorResult
from ...finding import Finding, Severity, Confidence
from ...registry import register
from ...extractors.index import index_page_of, _ANNEXURE_RE
from ...feature_flags import PAGINATION_CHECKS_ENABLED


@register
class IndexFormatDetector(Detector):
    """Validates presence and format of the Index / Table of Contents."""

    name = "IndexFormatDetector"
    rule = "SC Rules, Order IV - Index of record"
    kind = "page"

    def run(self) -> DetectorResult:
        details: Dict[str, Any] = {
            "index_found": False, "index_pages": [], "entries_count": 0,
            "annexures_in_index": [], "page_mismatches": [],
        }
        if not self.ctx.text_scrutinizable:
            return self.unverified(fid="d_idx_scan", what="Index", page=1)

        findings: List[Finding] = []
        index_page = index_page_of(self.ctx.pages, 6)
        if index_page is None:
            findings.append(Finding(
                id="d_idx_001", severity=Severity.CRITICAL, page=1,
                title="Index/Table of Contents Missing",
                description=("No Index/Table of Contents was found in the opening pages. "
                             "SC/HC paper-books require an index listing all documents "
                             "with their folio numbers."),
                remediation="Add an Index (S.No. | Particulars | Page No.) after the cover page.",
                confidence=Confidence.HIGH))
            return self.result(details=details, findings=findings, confidence=Confidence.HIGH)

        details["index_found"] = True
        details["index_pages"] = [index_page + 1]
        entries = self.ctx.index_entries
        details["entries_count"] = len(entries)

        if not entries:
            details["note"] = "index present; rows not machine-parsed (no defect raised)"
            return self.result(details=details, findings=[], confidence=Confidence.MEDIUM)

        annexures = sorted({n for e in entries for n in e.annexures})
        details["annexures_in_index"] = annexures

        # Index page-reference sanity check depends on listed folio numbers and is
        # part of the pagination/folio family — suppressed while folio detection is
        # unreliable (see feature_flags.PAGINATION_CHECKS_ENABLED).
        if PAGINATION_CHECKS_ENABLED:
            mismatches = self._validate_page_references(entries)
            details["page_mismatches"] = mismatches
            if len(mismatches) >= 2:
                m = mismatches[0]
                findings.append(Finding(
                    id="d_idx_003", severity=Severity.MINOR, page=index_page + 1,
                    title="Index Page References Look Incorrect",
                    description=(f"Several index entries cite pages outside the document "
                                 f"(e.g. '{m['entry'][:40]}' -> page {m['listed_page']}; "
                                 f"the book has {self.ctx.page_count} pages)."),
                    remediation="Check the index page numbers against the actual folios.",
                    confidence=Confidence.LOW))

        if annexures:
            missing_in_body = self._annexures_missing_from_body(annexures)
            if missing_in_body:
                listed = ", ".join(f"P-{n}" for n in missing_in_body)
                findings.append(Finding(
                    id="d_idx_005", severity=Severity.WARNING, page=index_page + 1,
                    title="Index Lists Annexures Not Found in Body",
                    description=(f"The index lists annexure(s) {listed} but no matching "
                                 f"'ANNEXURE {listed.split(', ')[0]}' marker was found in "
                                 f"the body."),
                    remediation="Ensure every annexure listed in the index is placed in the paper-book.",
                    confidence=Confidence.MEDIUM))

        conf = Confidence.HIGH if not findings else Confidence.MEDIUM
        return self.result(details=details, findings=findings, confidence=conf)

    def _validate_page_references(self, entries) -> List[Dict]:
        mismatches = []
        n = self.ctx.page_count
        for e in entries:
            ps, pe = e.start_page_no, e.end_page_no
            if ps is None:
                continue
            if ps > n + 5 or (pe is not None and pe > n + 5):
                mismatches.append({"entry": e.title,
                                   "listed_page": f"{ps}-{pe}" if pe != ps else str(ps)})
        return mismatches

    def _annexures_missing_from_body(self, listed: List[int]) -> List[int]:
        body_nums = set()
        for p in self.ctx.pages:
            for n in _ANNEXURE_RE.findall(p.text):
                body_nums.add(int(n))
        return [n for n in listed if n not in body_nums]


@register
class SectionOrderDetector(Detector):
    """Validates section presence and sequence (in-person vakalatnama waiver)."""

    name = "SectionOrderDetector"
    rule = "SC Rules, Order IV - Arrangement of paper-book"
    kind = "page"

    SECTION_PATTERNS = [
        {"name": "Cover Page", "keywords": [r"IN THE\s+(SUPREME|HIGH)\s+COURT"], "required": True},
        {"name": "Vakalatnama", "keywords": [r"VAKALATNAMA", r"VAKALAT"], "required": False, "waived_if_in_person": True},
        {"name": "Index", "keywords": [r"\bINDEX\b", r"TABLE OF CONTENTS"], "required": True},
        {"name": "Synopsis", "keywords": [r"SYNOPSIS", r"LIST OF DATES"], "required": False},
        {"name": "Statement of Facts", "keywords": [r"STATEMENT OF FACTS", r"FACTUAL BACKGROUND"], "required": False},
        {"name": "Arguments", "keywords": [r"\bGROUNDS\b", r"LEGAL ARGUMENTS", r"SUBMISSIONS"], "required": False},
        {"name": "Prayer", "keywords": [r"\bPRAYER\b", r"PRAYER FOR RELIEF"], "required": False},
        {"name": "Affidavit", "keywords": [r"\bAFFIDAVIT\b", r"VERIFICATION"], "required": False},
        {"name": "Annexures", "keywords": [r"ANNEXURE\s+P[-\s]?\d"], "required": False},
    ]
    _IN_PERSON_RE = re.compile(
        r"(PETITIONER|APPELLANT|PARTY)[\s-]*IN[\s-]*PERSON|IN\s+PERSON", re.IGNORECASE)

    def run(self) -> DetectorResult:
        details: Dict[str, Any] = {"sections_found": [], "sections_missing": [],
                                   "in_person": False, "order_correct": True}
        if not self.ctx.text_scrutinizable:
            return self.unverified(fid="d_sec_scan", what="Section Order", page=1)

        findings: List[Finding] = []
        in_person = bool(self._IN_PERSON_RE.search(self.ctx.first_pages_text(4)))
        details["in_person"] = in_person

        presence = self._find_sections(header_only=False, skip_index_page=False)
        anchored = self._find_sections(header_only=True, skip_index_page=True)
        details["sections_found"] = [s["name"] for s in presence]
        found_names = {s["name"] for s in presence}

        for pat in self.SECTION_PATTERNS:
            if not pat["required"] or pat["name"] in found_names:
                continue
            if pat.get("waived_if_in_person") and in_person:
                continue
            details["sections_missing"].append(pat["name"])
            findings.append(Finding(
                id="d_sec_001", severity=Severity.CRITICAL, page=1,
                title=f"Required Section Missing: {pat['name']}",
                description=f"The mandatory '{pat['name']}' section was not found.",
                remediation=f"Add the '{pat['name']}' section in its proper place.",
                confidence=Confidence.HIGH))

        for v in self._check_order_rules(anchored)[:3]:
            details["order_correct"] = False
            findings.append(Finding(
                id="d_sec_002", severity=Severity.WARNING, page=v["page"],
                title="Section Order Violation", description=v["message"],
                remediation="Reorder: cover → index → synopsis → facts → grounds → prayer → affidavit → annexures.",
                confidence=Confidence.MEDIUM))

        findings.extend(self._check_annexure_numbering())

        if not findings:
            conf = Confidence.HIGH
        else:
            conf = Confidence.MEDIUM
        return self.result(details=details, findings=findings, confidence=conf)

    def _find_sections(self, header_only: bool, skip_index_page: bool) -> List[Dict]:
        index_page = self._index_page_number()
        sections: List[Dict] = []
        for p in self.ctx.pages:
            text = p.text
            if not text:
                continue
            if skip_index_page and (p.pdf_page_no + 1) == index_page:
                continue
            for pat in self.SECTION_PATTERNS:
                if any(s["name"] == pat["name"] for s in sections):
                    continue
                for kw in pat["keywords"]:
                    if header_only:
                        if self._keyword_as_header(text, kw):
                            sections.append({"name": pat["name"], "page": p.pdf_page_no + 1})
                            break
                    elif re.search(kw, text.upper()):
                        sections.append({"name": pat["name"], "page": p.pdf_page_no + 1})
                        break
        return sections

    @staticmethod
    def _keyword_as_header(text: str, keyword: str) -> bool:
        for line in text.split("\n"):
            stripped = line.strip()
            if len(stripped) <= 40 and re.search(keyword, stripped.upper()):
                return True
        return False

    def _index_page_number(self) -> int:
        for p in self.ctx.pages[:6]:
            if re.search(r"\bINDEX\b", p.text.upper()):
                return p.pdf_page_no + 1
        return -1

    def _check_order_rules(self, anchored: List[Dict]) -> List[Dict]:
        page_of: Dict[str, int] = {}
        for s in anchored:
            page_of.setdefault(s["name"], s["page"])
        violations: List[Dict] = []
        idx = self._index_page_number()
        if idx == -1:
            idx = page_of.get("Index")
        body_first = min([page_of[n] for n in ("Synopsis", "Statement of Facts", "Arguments")
                          if n in page_of], default=None)
        if idx is not None and body_first is not None and idx > body_first:
            violations.append({"page": idx,
                               "message": ("The Index appears after the body of the "
                                           "petition. The Index must come at the front.")})
        return violations

    def _check_annexure_numbering(self) -> List[Finding]:
        pat = re.compile(r"ANNEXURE\s*[-]?\s*P\s*[-/ ]?\s*(\d{1,2})\b", re.IGNORECASE)
        found = {}
        for p in self.ctx.pages:
            for m in pat.findall(p.text):
                n = int(m)
                if 1 <= n <= 60:
                    found.setdefault(n, p.pdf_page_no + 1)
        out: List[Finding] = []
        nums = sorted(found)
        if len(nums) >= 3:
            interior_missing = sorted(set(range(nums[0], nums[-1] + 1)) - set(nums))
            if interior_missing:
                gap_pg = found.get(nums[0], 1)
                out.append(Finding(
                    id="d_sec_004", severity=Severity.MINOR, page=gap_pg,
                    title="Annexure Numbering Gap",
                    description=(f"Annexures appear non-sequential; the sequence "
                                 f"P-{nums[0]}..P-{nums[-1]} is missing "
                                 f"P-{', P-'.join(map(str, interior_missing))}."),
                    remediation="Number annexures sequentially (P-1, P-2, P-3, ...).",
                    confidence=Confidence.LOW))
        return out
