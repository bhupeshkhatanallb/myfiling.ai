"""
IndexValidator — Stage 7: index claims vs actual page metadata.

After every page has been analysed, compare what the Index says (an
:class:`IndexEntry`'s title + cited start/end folio) against where that section
actually appears in the document (derived from the per-page detected titles and
written folio numbers). Generate a defect when the index points to the wrong
place or to a section that cannot be found.

PRECISION POLICY (the project's core rule — precision over recall): index page
columns are extraction-fragile, and folio<->PDF-page mapping is approximate, so
this validator is deliberately CONSERVATIVE. It only flags:
  * a section the index lists whose title NEVER appears anywhere in the body
    (the index promises something the paper-book doesn't contain), and only when
    we are confident the title is a real, locatable section heading; and
  * a cited start folio that resolves to a page whose content clearly does NOT
    match the entry (large, unambiguous displacement), requiring MULTIPLE such
    mismatches before raising (one is almost always a parse artifact).
It NEVER flags when the index simply couldn't be tabulated, and it points every
finding at the index page so the advocate can see the claim.
"""

from __future__ import annotations

import re
from typing import Any, Dict, List, Optional

from ..base import Detector, DetectorResult
from ..finding import Finding, Severity, Confidence
from ..registry import register
from ..extractors.index import index_page_of
from ..feature_flags import PAGINATION_CHECKS_ENABLED


# Map an index entry's free-text title to the section-title taxonomy used by
# MetadataBuilder (model.PAGE_TITLE_PATTERNS), so we can look for the section's
# real page.
#
# PRECISION: index/bookmark titles are long free-text descriptions that MENTION
# many section words in passing ("Application for stay WITH AFFIDAVIT", "ANNEXURE
# P-8 ... copy of AFFIDAVIT of assets"). Matching a section because its keyword
# appears ANYWHERE in such a string is the dominant false-positive source. So we
# map ONLY:
#   * sections whose keyword is essentially never used loosely (Synopsis), AND
#   * only when that keyword anchors a SHORT entry title (the entry is ABOUT that
#     section, not merely referencing it).
# Affidavit / Vakalatnama are deliberately NOT auto-mapped: they are usually
# signed scanned pages whose heading doesn't extract, so "not found in body" is a
# weak signal the filing-requirement detectors already surface as a soft advisory.
_TITLE_TO_SECTION = [
    ("Synopsis & List of Dates", r"^\s*(?:LIST\s+OF\s+DATES|SYNOPSIS)\b"),
]
_TITLE_TO_SECTION_RX = [(name, re.compile(rx, re.IGNORECASE)) for name, rx in _TITLE_TO_SECTION]

# An entry must be SHORT to be considered "about" a section (not a long annexure
# description that merely mentions the word).
_MAX_SECTION_TITLE_LEN = 40


def _entry_section(title: str) -> Optional[str]:
    if len(title.strip()) > _MAX_SECTION_TITLE_LEN:
        return None
    for name, rx in _TITLE_TO_SECTION_RX:
        if rx.search(title):
            return name
    return None


@register
class IndexValidator(Detector):
    """Validates the Index's claims against the document's actual structure."""

    name = "IndexValidator"
    rule = "SC Rules, Order IV - Index accuracy"
    kind = "validator"

    def run(self) -> DetectorResult:
        details: Dict[str, Any] = {
            "index_entries": len(self.ctx.index_entries),
            "validated": 0, "title_mismatches": [], "missing_sections": [],
        }
        if not self.ctx.text_scrutinizable or not self.ctx.index_entries:
            # No index to validate (or unreadable): say nothing (absence of an
            # index is the IndexFormatDetector's job, not ours).
            return self.result(details=details, findings=[], confidence=Confidence.MEDIUM,
                               _ocr_annotate=False)

        index_page = index_page_of(self.ctx.pages, 6)
        index_page_1 = (index_page + 1) if index_page is not None else 1

        # Build a folio -> PDF-page lookup from the written-number assignment so
        # we can resolve a cited start folio to a real page.
        folio_to_pdf: Dict[int, int] = {}
        for p in self.ctx.pages:
            if p.written_page_number is not None:
                folio_to_pdf.setdefault(p.written_page_number, p.pdf_page_no)

        findings: List[Finding] = []

        # 1) Sections promised by the index but whose heading is nowhere in body.
        missing = self._sections_missing_from_body()
        details["missing_sections"] = missing
        if missing:
            listed = ", ".join(missing[:4])
            findings.append(Finding(
                id="d_idxval_001", severity=Severity.WARNING, page=index_page_1,
                title="Index Lists Section(s) Not Found in the Paper-Book",
                description=(f"The Index lists {listed}, but no matching section heading "
                             f"was found anywhere in the document body. The Registry "
                             f"objects when the index promises documents the paper-book "
                             f"does not contain."),
                remediation="Ensure every section listed in the index is actually placed "
                            "in the paper-book, or correct the index.",
                confidence=Confidence.MEDIUM,
                evidence={"missing": missing}))

        # 2) Cited start folio resolves to a page whose detected title clearly
        #    contradicts the entry (require >=2 to avoid parse artifacts).
        #    This relies on written-folio detection, so it is part of the
        #    pagination/folio family — suppressed while folio detection is
        #    unreliable (see feature_flags.PAGINATION_CHECKS_ENABLED).
        details["validated"] = len(folio_to_pdf)
        if PAGINATION_CHECKS_ENABLED:
            mismatches = self._title_position_mismatches(folio_to_pdf)
            details["title_mismatches"] = mismatches
            if len(mismatches) >= 2:
                m = mismatches[0]
                findings.append(Finding(
                    id="d_idxval_002", severity=Severity.MINOR, page=index_page_1,
                    title="Index Page Numbers Don't Match the Document",
                    description=(f"Several index entries cite a folio that lands on a page "
                                 f"with unrelated content (e.g. '{m['entry'][:40]}' is "
                                 f"indexed at folio {m['folio']}, but that page reads as "
                                 f"'{m['found_title'] or 'unrelated content'}'). The index "
                                 f"folios may be out of sync with the paper-book."),
                    remediation="Re-check the index folio numbers against the actual pages.",
                    confidence=Confidence.LOW,
                    evidence={"mismatches": mismatches[:8]}))

        conf = Confidence.HIGH if not findings else Confidence.MEDIUM
        return self.result(details=details, findings=findings, confidence=conf,
                           _ocr_annotate=False)

    # ------------------------------------------------------------------ helpers
    def _sections_missing_from_body(self) -> List[str]:
        """
        Index-listed well-known sections that appear NEITHER as a page heading NOR
        as a bookmark. Cross-checking the bookmarks is essential: a synopsis is
        frequently merged into the petition's front matter with no dedicated
        heading line, but the outline still names it — that is NOT a missing
        section, so we must not flag it (precision over recall).
        """
        present_titles = {p.detected_title for p in self.ctx.pages if p.detected_title}
        bookmark_titles = " | ".join(b.title for b in self.ctx.bookmarks).upper()
        missing: List[str] = []
        seen = set()
        for e in self.ctx.index_entries:
            section = _entry_section(e.title)
            if section is None or section in seen:
                continue
            seen.add(section)
            if section in present_titles:
                continue
            # Cross-check: a bookmark naming the section means it exists.
            kw = "SYNOPSIS" if "Synopsis" in section else section.upper()
            if kw in bookmark_titles:
                continue
            missing.append(section)
        return missing

    def _title_position_mismatches(self, folio_to_pdf: Dict[int, int]) -> List[Dict]:
        """Entries whose cited start folio lands on a clearly-unrelated page."""
        out: List[Dict] = []
        for e in self.ctx.index_entries:
            section = _entry_section(e.title)
            if section is None or e.start_page_no is None:
                continue
            pdf_idx = folio_to_pdf.get(e.start_page_no)
            if pdf_idx is None:
                continue
            page = self.ctx.pages[pdf_idx]
            found = page.detected_title
            # Mismatch only when the page HAS a confident title and it differs
            # from the section the index entry names (precision guard).
            if found is not None and found != section:
                out.append({"entry": e.title, "folio": e.start_page_no,
                            "pdf_page": pdf_idx + 1, "expected": section,
                            "found_title": found})
        return out
