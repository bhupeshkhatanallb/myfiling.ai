"""
Shared page metadata + document context (Stage 3 of the rewrite brief).

``PageMetadata`` is the single source of truth for one page: every measurement
any detector could want, generated ONCE by the MetadataBuilder. No detector
re-reads a page — they all consume PageMetadata.

``DocumentContext`` is the central shared repository (the brief's
``DocumentContext``): the page metadata list + index data + bookmark data +
document-level signals computed once and cached. Detectors read it; they never
mutate it and never see one another.

The document-level signals (scan/garble gating, dominant body metrics,
concentration guards, paper distribution, corner harvesting) are PORTED from the
prior engine's ``DocumentModel`` because they encode corpus-tuned precision
decisions. Their behaviour is unchanged; they now hang off the new context.
"""

from __future__ import annotations

import re
import statistics as st
from collections import Counter
from dataclasses import dataclass, field
from functools import cached_property
from typing import Dict, List, Optional, Tuple

from .metrics import (
    Line, normalize_fontname, is_real_body_font,
)
from .units import A4_W, A4_H, LETTER_W, LETTER_H, LEGAL_W, LEGAL_H, CM


# --- paper classification (ported verbatim) ---------------------------------- #
_PAPER_W_TOL = 28.0
_PAPER_H_TOL = 22.0
_STANDARD_SIZES = [("A4", A4_W, A4_H), ("Letter", LETTER_W, LETTER_H), ("Legal", LEGAL_W, LEGAL_H)]


def classify_paper(width: float, height: float) -> str:
    """Return 'A4' | 'Letter' | 'Legal' | 'Other', orientation-agnostic."""
    w, h = (width, height) if height >= width else (height, width)
    best = None
    for name, sw, sh in _STANDARD_SIZES:
        if abs(w - sw) <= _PAPER_W_TOL and abs(h - sh) <= _PAPER_H_TOL:
            err = abs(w - sw) + abs(h - sh)
            if best is None or err < best[1]:
                best = (name, err)
    return best[0] if best else "Other"


_ANCHOR_WORDS = {
    "THE", "AND", "COURT", "HIGH", "SUPREME", "DELHI", "INDEX", "PETITIONER",
    "MATTER", "VERSUS", "APPLICATION", "NOTICE", "MOTION", "MEMO", "PARTIES",
    "SECTION", "ORDER", "AFFIDAVIT", "RESPONDENT", "RESPONDENTS", "APPEAL",
    "PETITION", "SYNOPSIS", "DATES", "PARTICULARS", "PAGE", "FEE", "FEES",
    "URGENT", "ANNEXURE", "WITH", "FOR", "UNDER", "BEFORE", "THROUGH", "STATE",
    "PRAYER", "FACTS", "GROUNDS", "JUDGMENT", "HONBLE", "HONOURABLE",
}

CORNER_REGIONS = ("TL", "TC", "TR", "BL", "BC", "BR")


# Section/title keywords used by MetadataBuilder to tag each page's detected
# title (Stage 3) and by the conditional detectors to decide which pages to run
# on (Stage 6).
#
# ORDER = PRIORITY (first match wins). SPECIFIC section markers come first; the
# generic "Cause Title" (the court-name header) is LAST, because that header
# appears as a RUNNING HEAD at the top of nearly every page — if it ranked high
# it would steal synopsis/vakalatnama/affidavit pages and mis-tag them as cause
# titles (observed on the corpus). A page is a "Cause Title" only when it carries
# the court name AND none of the specific section headings.
PAGE_TITLE_PATTERNS: List[Tuple[str, str]] = [
    ("Index", r"\bINDEX\b|TABLE\s+OF\s+CONTENTS"),
    ("Synopsis & List of Dates", r"\bSYNOPSIS\b|LIST\s+OF\s+DATES"),
    ("Vakalatnama", r"VAKALATNAMA|VAKALAT|MEMO(?:RANDUM)?\s+OF\s+APPEARANCE"),
    ("Affidavit", r"\bAFFIDAVIT\b|\bVERIFICATION\b"),
    ("Annexure", r"ANNEXURE\s*[-/]?\s*P"),
    ("Statement of Facts", r"STATEMENT\s+OF\s+FACTS|FACTUAL\s+BACKGROUND"),
    ("Grounds", r"\bGROUNDS\b|LEGAL\s+ARGUMENTS|SUBMISSIONS"),
    ("Prayer", r"\bPRAYER\b"),
    ("Impugned Judgment", r"IMPUGNED\s+(JUDGMENT|ORDER)"),
    ("Application", r"\bI\.?A\.?\s+NO|APPLICATION\s+FOR"),
    ("Cause Title", r"IN\s+THE\s+(SUPREME|HIGH)\s+COURT"),
]
_TITLE_COMPILED = [(name, re.compile(pat, re.IGNORECASE)) for name, pat in PAGE_TITLE_PATTERNS]


def detect_page_title(text: str) -> Optional[str]:
    """
    The primary section title a page announces, taken ONLY from a short HEADING
    line near the top of the page (the first ~8 lines). We deliberately do NOT
    fall back to a whole-page keyword scan: a page that merely MENTIONS "affidavit"
    or "annexure" in its body is not that section, and such loose matching is the
    dominant title-misdetection source. A real section heading is a short line.
    """
    head = "\n".join(text.split("\n")[:8])
    for name, rx in _TITLE_COMPILED:
        for line in head.split("\n"):
            s = line.strip()
            if len(s) <= 60 and rx.search(s):
                return name
    return None


@dataclass
class PageMetadata:
    """
    All measurements for ONE page — the single source of truth (Stage 3).

    Geometry/typography fields mirror the prior engine's PageMetrics (so detector
    math is unchanged). New fields per the brief: ``detected_title``,
    ``written_page_number``, and the lazy quality signals (``dpi``, ``blur_score``,
    ``ocr_compatible``, ``text_selectable``) populated by quality.py only when a
    page is image-heavy (scanned-only, per the chosen policy).
    """
    pdf_page_no: int                 # 0-based index
    width: float
    height: float
    char_count: int
    image_count: int
    text: str

    body_lines: Tuple[Line, ...] = ()
    header_lines: Tuple[Line, ...] = ()
    footer_lines: Tuple[Line, ...] = ()

    body_size: Optional[float] = None
    line_gap: Optional[float] = None
    margin_left: Optional[float] = None
    margin_right: Optional[float] = None
    margin_top: Optional[float] = None
    margin_bottom: Optional[float] = None
    font_counts: Dict[str, int] = field(default_factory=dict)
    corner_raw: Dict[str, str] = field(default_factory=dict)

    # Per-page LEFT/RIGHT margin defect signals (see metrics._edge_defect_signal):
    # block_min = narrowest real content-block distance from that edge (cm);
    # narrow_frac = fraction of body lines running to that edge. Used by
    # MarginDetector to flag the SPECIFIC pages whose body text runs into the
    # left (binding) or right margin.
    left_block_min_cm: Optional[float] = None
    left_narrow_frac: Optional[float] = None
    right_block_min_cm: Optional[float] = None
    right_narrow_frac: Optional[float] = None

    # Page identification (Stage 3 / Stage 5).
    detected_title: Optional[str] = None
    written_page_number: Optional[int] = None

    # OCR text-quality signals (see page_meta._garble_signals). garble_ratio =
    # fraction of garbage-looking tokens; realword_ratio = fraction of plausible
    # words. A page with HIGH garble AND LOW real-word count is genuinely
    # distorted/unreadable (vs merely noisy). None when too little text to judge.
    garble_ratio: Optional[float] = None
    realword_ratio: Optional[float] = None

    # Provenance + quality.
    extraction_mode: str = "native"   # "native" | "ocr"
    ocr_conf: float = 0.0
    dpi: Optional[float] = None
    blur_score: Optional[float] = None       # scale-free sharpness (None = not judgeable)
    blur_flagged: Optional[bool] = None      # adaptive blur verdict from quality.py
    blur_severe: Optional[bool] = None       # STRONGLY blurred (surfaced per-page)
    ocr_compatible: Optional[bool] = None
    text_selectable: Optional[bool] = None

    # ---- derived ----
    @property
    def norm_size(self) -> Tuple[float, float]:
        w, h = self.width, self.height
        return (w, h) if h >= w else (h, w)

    @property
    def is_measurable(self) -> bool:
        return self.body_size is not None

    @property
    def spacing_ratio(self) -> Optional[float]:
        if self.line_gap and self.body_size and self.body_size > 0:
            return self.line_gap / self.body_size
        return None

    @property
    def is_image_heavy(self) -> bool:
        """A page dominated by image content (scanned) and sparse on real text."""
        return self.image_count > 0 and self.char_count < 50


@dataclass
class IndexEntry:
    """One row extracted from the Index / Table of Contents (Stage 2)."""
    title: str
    start_page_no: Optional[int]      # written page number cited in the index
    end_page_no: Optional[int]
    serial: Optional[int] = None
    annexures: Tuple[int, ...] = ()


@dataclass
class Bookmark:
    """One PDF outline entry (Stage 8)."""
    title: str
    page_index: int                   # 0-based target page
    level: int = 1


class DocumentContext:
    """
    Central shared repository (the brief's ``DocumentContext``).

    Holds the page metadata, extracted index entries, bookmark metadata, and the
    cached document-level signals. Logically immutable once built; detectors read
    it and must not mutate it.
    """

    def __init__(self, path: str, pages: List[PageMetadata], page_count: int,
                 index_entries: Optional[List[IndexEntry]] = None,
                 bookmarks: Optional[List[Bookmark]] = None,
                 ocr_used: bool = False, ocr_pages: int = 0):
        self.path = path
        self.pages = pages
        self.page_count = page_count
        self.index_entries = index_entries or []
        self.bookmarks = bookmarks if bookmarks is not None else []
        self.ocr_used = ocr_used
        self.ocr_pages = ocr_pages

    # ----------------------------------------------------------- scan gating
    @cached_property
    def total_text_len(self) -> int:
        return sum(p.char_count for p in self.pages)

    @cached_property
    def is_scanned(self) -> bool:
        if not self.pages:
            return True
        parsed = len(self.pages)
        texty = sum(1 for p in self.pages if p.char_count >= 50)
        frac = texty / parsed
        avg = self.total_text_len / parsed
        has_images = any(p.image_count for p in self.pages)
        if frac < 0.2 and (has_images or avg < 40):
            return True
        return avg < 15

    @cached_property
    def _anchor_count(self) -> int:
        head = self.first_pages_text(3)
        tokens = re.findall(r"[A-Za-z]{3,}", head)
        return sum(1 for t in tokens if t.upper() in _ANCHOR_WORDS)

    @cached_property
    def is_low_quality_text(self) -> bool:
        if self.is_scanned:
            return True
        head = self.first_pages_text(3)
        tokens = re.findall(r"[A-Za-z]{3,}", head)
        if len(tokens) < 10:
            return False
        ratio = self._anchor_count / max(1, len(tokens))
        return ratio < 0.10 or self._anchor_count < 5

    @cached_property
    def geometry_is_ocr(self) -> bool:
        return any(p.extraction_mode == "ocr" for p in self.measurable_pages)

    @cached_property
    def has_geometry(self) -> bool:
        return len(self.measurable_pages) >= 3

    @cached_property
    def has_page_dimensions(self) -> bool:
        return bool(self.pages)

    @cached_property
    def reliable_typography(self) -> bool:
        if self.ocr_used:
            return False
        return self.has_geometry and not self.is_low_quality_text

    @cached_property
    def text_scrutinizable(self) -> bool:
        if self.ocr_used:
            return self._anchor_count >= 4
        return not (self.is_scanned or self.is_low_quality_text)

    @cached_property
    def cannot_scrutinize(self) -> bool:
        return not self.text_scrutinizable and not self.has_geometry

    def is_probable_petition(self) -> bool:
        if self.is_scanned:
            return False
        head = " ".join(p.text for p in self.pages[:4]).upper()
        markers = ("IN THE", "COURT", "PETITION", "APPEAL", "IN THE MATTER",
                   "VERSUS", "INDEX", "APPLICATION", "WRIT", "MATTER OF")
        return sum(1 for m in markers if m in head) >= 2

    def first_pages_text(self, n: int) -> str:
        return "\n".join(p.text for p in self.pages[: min(n, len(self.pages))])

    # ------------------------------------------------------- body-page metrics
    @cached_property
    def measurable_pages(self) -> List[PageMetadata]:
        return [p for p in self.pages if p.is_measurable]

    def _median_of(self, attr: str) -> Optional[float]:
        vals = [getattr(p, attr) for p in self.measurable_pages
                if getattr(p, attr) is not None]
        return st.median(vals) if len(vals) >= 3 else None

    @cached_property
    def dominant_body_size(self) -> Optional[float]:
        return self._median_of("body_size")

    def body_size_concentration(self) -> float:
        dom = self.dominant_body_size
        if dom is None:
            return 0.0
        sizes = [p.body_size for p in self.measurable_pages if p.body_size]
        if not sizes:
            return 0.0
        near = sum(1 for s in sizes if abs(s - dom) <= 1.0)
        return near / len(sizes)

    def pages_with_body_size(self, lo: float, hi: float) -> List[int]:
        return [p.pdf_page_no + 1 for p in self.measurable_pages
                if p.body_size is not None and lo <= p.body_size <= hi]

    @cached_property
    def dominant_line_gap(self) -> Optional[float]:
        return self._median_of("line_gap")

    @cached_property
    def dominant_spacing_ratio(self) -> Optional[float]:
        ratios = [p.spacing_ratio for p in self.measurable_pages if p.spacing_ratio]
        return st.median(ratios) if len(ratios) >= 3 else None

    def cramped_fraction(self, threshold: float) -> float:
        ratios = [p.spacing_ratio for p in self.measurable_pages if p.spacing_ratio]
        if not ratios:
            return 0.0
        return sum(1 for r in ratios if r < threshold) / len(ratios)

    def pages_with_spacing_below(self, threshold: float) -> List[int]:
        return [p.pdf_page_no + 1 for p in self.measurable_pages
                if p.spacing_ratio is not None and p.spacing_ratio < threshold]

    @cached_property
    def margins_cm(self) -> Dict[str, Optional[float]]:
        def med(attr: str) -> Optional[float]:
            v = self._median_of(attr)
            return round(v / CM, 2) if v is not None else None
        return {"left": med("margin_left"), "right": med("margin_right"),
                "top": med("margin_top"), "bottom": med("margin_bottom")}

    # ---------------------------------------------------------- paper / fonts
    @cached_property
    def paper_distribution(self) -> Dict[str, int]:
        c: Counter = Counter()
        for p in self.pages:
            c[classify_paper(p.width, p.height)] += 1
        return dict(c)

    @cached_property
    def dominant_paper_size_pt(self) -> Optional[Tuple[float, float]]:
        if not self.pages:
            return None
        ws = [p.norm_size[0] for p in self.pages]
        hs = [p.norm_size[1] for p in self.pages]
        return (round(st.median(ws)), round(st.median(hs)))

    @cached_property
    def font_family_counts(self) -> Counter:
        c: Counter = Counter()
        for p in self.pages:
            for raw, n in p.font_counts.items():
                fam = normalize_fontname(raw)
                if is_real_body_font(fam):
                    c[fam] += n
        c.pop("", None)
        return c

    # --------------------------------------------------------- corner tokens
    @cached_property
    def corner_tokens(self) -> List[Dict[str, str]]:
        return [dict(p.corner_raw) for p in self.pages]

    # -------------------------------------------- conditional-detector helpers
    def pages_titled(self, title: str) -> List[PageMetadata]:
        """Pages whose detected title matches (Stage 6 routing)."""
        return [p for p in self.pages if p.detected_title == title]
