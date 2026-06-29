"""
IndexExtractor — Stage 2: find the Index / Table of Contents and extract entries.

Produces :class:`~pipeline.model.IndexEntry` rows (title + start/end page +
serial + annexures). The grammar (tolerant entry regexes, column-header gate,
page-less rows accepted only when the serial continues, annexure parsing) is
PORTED VERBATIM from the prior engine's IndexFormatDetector so accuracy is
preserved; only the OUTPUT shape changed (it now yields reusable IndexEntry
objects that both the IndexFormatDetector and the IndexValidator consume).
"""

from __future__ import annotations

import re
from typing import List, Optional, Tuple

from ..model import IndexEntry, PageMetadata


_ROMAN = {"I": 1, "V": 5, "X": 10, "L": 50, "C": 100}


def _roman_to_int(s: str) -> Optional[int]:
    s = s.upper()
    if not s or any(ch not in _ROMAN for ch in s):
        return None
    total, prev = 0, 0
    for ch in reversed(s):
        v = _ROMAN[ch]
        total += -v if v < prev else v
        prev = max(prev, v)
    return total if 0 < total < 400 else None


def _serial_to_int(token: str) -> Optional[int]:
    token = token.strip(".) ")
    if token.isdigit():
        return int(token)
    return _roman_to_int(token)


_ENTRY_RE = re.compile(r"^\s*(\d{1,3})[.)]?\s+(.+?)\s+(\d{1,4})(?:\s*[-–]\s*(\d{1,4}))?\s*$")
_ENTRY_NOPAGE_RE = re.compile(r"^\s*([0-9]{1,3}|[IVXLC]{1,5})[.)]\s+([A-Z][A-Za-z0-9/().,'&\- ]{2,}?)\s*$")
_INDEX_HEADER_RE = re.compile(r"\b(INDEX|TABLE\s+OF\s+CONTENTS)\b", re.IGNORECASE)
_COLUMN_HEADER_RE = re.compile(
    r"(S\.?\s*N[O0]\.?|SR\.?\s*N[O0]\.?|S\.?\s*N[O0]).*PARTICULAR.*PAGE",
    re.IGNORECASE | re.DOTALL)
_ANNEXURE_RE = re.compile(r"ANNEXURE\s*[-–]?\s*P\s*[-–]?\s*(\d{1,3})", re.IGNORECASE)


def find_index_page(pages: List[PageMetadata], max_pages: int = 6) -> Optional[int]:
    """0-based index of the Index/ToC page, or None (ported logic)."""
    limit = min(max_pages, len(pages))
    for i in range(limit):
        t = pages[i].text
        if _INDEX_HEADER_RE.search(t) and _COLUMN_HEADER_RE.search(t):
            return i
    for i in range(limit):
        if _INDEX_HEADER_RE.search(pages[i].text):
            return i
    return None


def _index_block_text(pages: List[PageMetadata], index_page: int) -> str:
    end = min(index_page + 2, len(pages))
    return "\n".join(pages[i].text for i in range(index_page, end))


def parse_index_entries(text: str) -> List[IndexEntry]:
    """Parse index rows into IndexEntry objects (ported grammar)."""
    entries: List[IndexEntry] = []
    expected_serial = 1
    for line in text.split("\n"):
        line = line.rstrip()
        if not line.strip():
            continue
        m = _ENTRY_RE.match(line)
        if m:
            serial = int(m.group(1))
            desc = m.group(2).strip()
            start = int(m.group(3))
            end = int(m.group(4)) if m.group(4) else start
            if start > 9999 or len(desc) < 2:
                continue
            entries.append(IndexEntry(
                title=desc, start_page_no=start, end_page_no=end,
                serial=serial,
                annexures=tuple(int(n) for n in _ANNEXURE_RE.findall(desc))))
            expected_serial = serial + 1
            continue
        m = _ENTRY_NOPAGE_RE.match(line)
        if m:
            serial = _serial_to_int(m.group(1))
            if serial is not None and serial == expected_serial:
                desc = m.group(2).strip()
                entries.append(IndexEntry(
                    title=desc, start_page_no=None, end_page_no=None,
                    serial=serial,
                    annexures=tuple(int(n) for n in _ANNEXURE_RE.findall(desc))))
                expected_serial = serial + 1
    return entries


def extract_index(pages: List[PageMetadata]) -> List[IndexEntry]:
    """Locate the index and return its parsed entries ([] if no index)."""
    if not pages:
        return []
    index_page = find_index_page(pages)
    if index_page is None:
        return []
    block = _index_block_text(pages, index_page)
    return parse_index_entries(block)


def index_page_of(pages: List[PageMetadata], max_pages: int = 6) -> Optional[int]:
    """Public helper so detectors/validators can find the index page (0-based)."""
    return find_index_page(pages, max_pages)
