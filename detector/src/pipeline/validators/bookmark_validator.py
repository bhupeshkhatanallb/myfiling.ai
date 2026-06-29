"""
BookmarkValidator - Stage 8: PDF outline (bookmark) presence + accuracy.

Two checks:
  * PRESENCE: a Supreme Court paper-book is expected to be bookmarked so the
    Registry/Bench can navigate it. No outline at all -> defect.
  * ACCURACY: when bookmarks exist, validate that a bookmark titled after a
    known section actually points at a page whose content matches that section
    (e.g. a "Synopsis" bookmark must land on the synopsis, not page 1).

PRECISION POLICY: bookmark titles are free-text and target pages can legitimately
sit a page or two off the heading, so accuracy mismatches are only flagged when a
well-known section bookmark lands on a page that confidently reads as a DIFFERENT
section. Presence is the high-value, high-precision check.
"""

from __future__ import annotations

import re
from typing import Any, Dict, List, Optional

from ..base import Detector, DetectorResult
from ..finding import Finding, Severity, Confidence
from ..registry import register


# Bookmark-title -> section taxonomy (model.PAGE_TITLE_PATTERNS names).
#
# PRECISION: bookmark titles in real paper-books are long free-text descriptions
# ("ANNEXURE P-8 A true copy of AFFIDAVIT of assets ... (79-156)") that mention
# section words in passing. Mapping on a bare keyword anywhere in the title is the
# dominant false-positive source. So a bookmark is mapped to a section ONLY when
# the title is SHORT and the keyword ANCHORS it (the bookmark IS that section, not
# one that references it). "Affidavit"/"Prayer" are excluded - they appear inside
# countless unrelated bookmark titles.
_BOOKMARK_SECTION = [
    ("Index", r"^\s*(?:INDEX|TABLE\s+OF\s+CONTENTS)\b"),
    ("Synopsis & List of Dates", r"^\s*(?:SYNOPSIS|LIST\s+OF\s+DATES)\b"),
    ("Vakalatnama", r"^\s*(?:VAKALATNAMA|MEMO(?:RANDUM)?\s+OF\s+APPEARANCE)\b"),
]
_BOOKMARK_SECTION_RX = [(name, re.compile(rx, re.IGNORECASE)) for name, rx in _BOOKMARK_SECTION]

# A bookmark title longer than this is a document description, not a section name.
_MAX_BOOKMARK_TITLE_LEN = 40


def _bookmark_section(title: str) -> Optional[str]:
    if len(title.strip()) > _MAX_BOOKMARK_TITLE_LEN:
        return None
    for name, rx in _BOOKMARK_SECTION_RX:
        if rx.search(title):
            return name
    return None


@register
class BookmarkValidator(Detector):
    """Validates PDF outline presence and (where checkable) accuracy."""

    name = "BookmarkValidator"
    rule = "SC Rules - Bookmarking of e-filed paper-book"
    kind = "validator"

    # Only assert "should be bookmarked" for documents large enough that the
    # Registry would expect navigation aids (tiny applications are exempt).
    _MIN_PAGES_FOR_BOOKMARK = 20

    def run(self) -> DetectorResult:
        bms = self.ctx.bookmarks
        details: Dict[str, Any] = {
            "bookmark_count": len(bms), "checked": 0, "mismatches": [],
        }
        findings: List[Finding] = []

        # 1) Presence.
        if not bms:
            if self.ctx.page_count >= self._MIN_PAGES_FOR_BOOKMARK:
                findings.append(Finding(
                    id="d_bmk_001", severity=Severity.MINOR, page=1,
                    title="No Bookmarks / Outline Found",
                    description=(f"This {self.ctx.page_count}-page paper-book has no PDF "
                                 f"bookmarks (outline). E-filed paper-books should be "
                                 f"bookmarked so each section can be navigated directly."),
                    remediation="Add PDF bookmarks for each section (Index, Synopsis, "
                                "Petition, Annexures, etc.).",
                    confidence=Confidence.MEDIUM,
                    evidence={"page_count": self.ctx.page_count}))
            return self.result(details=details, findings=findings,
                               confidence=Confidence.MEDIUM, _ocr_annotate=False)

        # 2) Accuracy - only when we can read page content to compare against.
        if self.ctx.text_scrutinizable:
            mismatches = self._accuracy_mismatches()
            details["mismatches"] = mismatches
            details["checked"] = sum(1 for b in bms if _bookmark_section(b.title))
            if len(mismatches) >= 2:
                m = mismatches[0]
                findings.append(Finding(
                    id="d_bmk_002", severity=Severity.MINOR, page=m["pdf_page"],
                    title="Bookmarks Point to the Wrong Pages",
                    description=(f"One or more bookmarks target a page whose content does "
                                 f"not match the bookmark title (e.g. the '{m['title']}' "
                                 f"bookmark opens page {m['pdf_page']}, which reads as "
                                 f"'{m['found_title'] or 'unrelated content'}'). "
                                 f"Misaligned bookmarks misdirect the reader."),
                    remediation="Re-target each bookmark to the first page of its section.",
                    confidence=Confidence.LOW,
                    evidence={"mismatches": mismatches[:8]}))

        conf = Confidence.HIGH if not findings else Confidence.MEDIUM
        return self.result(details=details, findings=findings, confidence=conf,
                           _ocr_annotate=False)

    # Section bookmarks legitimately landing on the petition's cause-title page
    # are NOT mismatches: the synopsis / list of dates / index are routinely
    # merged into the petition front matter, so their bookmark targets the page
    # that also opens the cause title. Treating that as an error is a false
    # positive (observed on the corpus).
    _FRONT_MATTER_OK = {"Synopsis & List of Dates", "Index", "Vakalatnama"}

    # ------------------------------------------------------------------ helper
    def _accuracy_mismatches(self) -> List[Dict]:
        out: List[Dict] = []
        npages = len(self.ctx.pages)
        # Window after the target where the section heading may legitimately sit.
        WINDOW = 3
        for b in self.ctx.bookmarks:
            section = _bookmark_section(b.title)
            if section is None or b.page_index < 0 or b.page_index >= npages:
                continue
            window = range(b.page_index, min(b.page_index + WINDOW, npages))
            titles = {self.ctx.pages[i].detected_title for i in window}
            if section in titles:
                continue                       # bookmark lands on/near its section
            landing = self.ctx.pages[b.page_index].detected_title
            # Front-matter sections commonly open on the cause-title page - fine.
            if landing == "Cause Title" and section in self._FRONT_MATTER_OK:
                continue
            # Only a mismatch when the landing page confidently reads as a DIFFERENT
            # SPECIFIC section (not "no title", not the tolerated front-matter case).
            if landing is not None and landing != section:
                out.append({"title": b.title, "pdf_page": b.page_index + 1,
                            "expected": section, "found_title": landing})
        return out
