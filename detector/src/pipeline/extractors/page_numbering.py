"""
Page-number extraction — Stage 5.

Two jobs:
  1. ``extract_folio_number`` — pull a page/folio number from a raw corner token,
     tolerating the real-world shapes seen in the corpus. PORTED VERBATIM from the
     prior engine's structure.py so the PageNumberingDetector behaves identically.
  2. ``assign_written_page_numbers`` — Stage 5: for each page, record the written
     page number it carries (``PageMetadata.written_page_number``), reading from
     the top-centre/right then other corners. Numbering is NOT assumed to start at
     PDF page 1; pages before numbering begins simply carry ``None``.
"""

from __future__ import annotations

import re
from typing import Dict, List, Optional

# Region preference: a folio is most often top-centre/top-right, then the other
# corners. We try them in this order when assigning a page's written number.
_REGION_PREFERENCE = ("TR", "TC", "TL", "BR", "BC", "BL")

_LEADING_FOLIO = re.compile(r"^\s*(\d(?:['`.,]?\d)*)")
_TRAILING_INT = re.compile(r"(\d{1,4})\s*\.?\s*$")


def _clean_int(token: str) -> Optional[int]:
    digits = re.sub(r"\D", "", token)
    if not digits or len(digits) > 4:
        return None
    return int(digits)


def extract_folio_number(raw: str) -> Optional[int]:
    """Pull a page/folio number from a corner token string (ported verbatim)."""
    if not raw:
        return None
    s = raw.strip()
    m = _LEADING_FOLIO.match(s)
    if m:
        val = _clean_int(m.group(1))
        if val is not None:
            return val
    if len(s) <= 8:
        m = _TRAILING_INT.search(s)
        if m:
            return int(m.group(1))
    return None


def _page_written_number(corner_raw: Dict[str, str]) -> Optional[int]:
    """The written folio number a single page carries, by region preference."""
    for region in _REGION_PREFERENCE:
        num = extract_folio_number(corner_raw.get(region, ""))
        if num is not None:
            return num
    return None


def assign_written_page_numbers(pages: List) -> None:
    """
    Stage 5: stamp each page's ``written_page_number`` in place.

    The first PDF page (cover) is skipped for numbering by convention, matching
    the detector (which starts folio collection at index >= 1). Pages whose folio
    can't be read keep ``None`` — that is valid (numbering may start later, or the
    stamp may be faint).
    """
    for p in pages:
        if p.pdf_page_no == 0:
            p.written_page_number = None
            continue
        p.written_page_number = _page_written_number(p.corner_raw)
