"""
MetadataBuilder - Stage 3: generate PageMetadata for every page.

Consumes a :class:`~pipeline.reader.RawPage` and produces the immutable
:class:`~pipeline.model.PageMetadata` that becomes the single source of truth for
detectors. It runs the corpus-tuned geometry math (via :mod:`pipeline.metrics`)
and tags each page's detected title (Stage 3 page identification).

Written-page-number detection and the lazy image-quality signals are filled in
by dedicated passes (page_numbering / quality), not here, to keep this builder a
pure per-page transform that needs no document-level context.
"""

from __future__ import annotations

import re

from ..metrics import measure_chars
from ..model import PageMetadata, detect_page_title
from ..reader import RawPage

# Minimum native characters for a page to count as having a REAL, selectable
# text layer. A scanned image page frequently carries a few stray glyphs (a
# folio stamp, a watermark, an OCR-less annotation), which would falsely read as
# "selectable" if any char counted. Requiring a small body of text distinguishes
# a genuine text layer from incidental marks.
_REAL_TEXT_LAYER_MIN_CHARS = 20

# A page needs at least this many tokens for a garble ratio to be meaningful.
_GARBLE_MIN_TOKENS = 30
_WS_RE = re.compile(r"\s+")


_VOWELS = set("aeiouAEIOU")


def _garble_signals(text: str):
    """Return (garble_ratio, realword_ratio) for a page's extracted text.

    garble_ratio:   fraction of tokens that look like OCR garbage - 3+ chars and
                    <50% alphanumeric (ref ``_is_garbled_token``). Short tokens
                    (numbers, abbreviations) are legitimate, so they don't count.
    realword_ratio: fraction of tokens that are plausible words - 4+ letters, all
                    alpha, containing a vowel. A page of genuinely-mangled OCR has
                    FEW real words even when its garble ratio looks moderate (the
                    garble ratio alone is inflated by leading-symbol scan noise on
                    otherwise-readable pages, so the two signals together separate
                    "distorted/unreadable" from "readable but noisy").
    Returns (None, None) when there is too little text to judge.
    """
    toks = [t for t in _WS_RE.split(text or "") if t]
    if len(toks) < _GARBLE_MIN_TOKENS:
        return None, None
    n = len(toks)

    def _is_garbled(tok: str) -> bool:
        if len(tok) < 3:
            return False
        return sum(c.isalnum() for c in tok) / len(tok) < 0.5

    def _is_word(tok: str) -> bool:
        return len(tok) >= 4 and tok.isalpha() and any(c in _VOWELS for c in tok)

    garble = sum(1 for t in toks if _is_garbled(t)) / n
    realword = sum(1 for t in toks if _is_word(t)) / n
    return round(garble, 3), round(realword, 3)


def build_page_metadata(raw: RawPage) -> PageMetadata:
    """Measure one raw page into a PageMetadata (native extraction path)."""
    geo = measure_chars(raw.chars, raw.width, raw.height)
    garble, realword = _garble_signals(raw.text)
    return PageMetadata(
        pdf_page_no=raw.index,
        width=raw.width,
        height=raw.height,
        char_count=len(raw.chars),
        image_count=raw.image_count,
        text=raw.text,
        body_lines=geo.body_lines,
        header_lines=geo.header_lines,
        footer_lines=geo.footer_lines,
        body_size=geo.body_size,
        line_gap=geo.line_gap,
        margin_left=geo.margin_left,
        margin_right=geo.margin_right,
        margin_top=geo.margin_top,
        margin_bottom=geo.margin_bottom,
        font_counts=geo.font_counts,
        corner_raw=geo.corner_raw,
        left_block_min_cm=geo.left_block_min_cm,
        left_narrow_frac=geo.left_narrow_frac,
        right_block_min_cm=geo.right_block_min_cm,
        right_narrow_frac=geo.right_narrow_frac,
        garble_ratio=garble,
        realword_ratio=realword,
        detected_title=detect_page_title(raw.text),
        # A real, selectable text layer - not just a stray stamp/watermark glyph.
        text_selectable=len(raw.chars) >= _REAL_TEXT_LAYER_MIN_CHARS,
        extraction_mode="native",
    )


def build_page_metadata_from_ocr(ocr_page, index: int, corner_raw=None) -> PageMetadata:
    """Build PageMetadata from an OCR page (text + boxes), same geometry math."""
    from ..metrics import measure_ocr
    geo = measure_ocr(ocr_page)
    return PageMetadata(
        pdf_page_no=index,
        width=ocr_page.width,
        height=ocr_page.height,
        char_count=len(ocr_page.text),
        image_count=1,
        text=ocr_page.text,
        body_lines=geo.body_lines,
        header_lines=geo.header_lines,
        footer_lines=geo.footer_lines,
        body_size=geo.body_size,
        line_gap=geo.line_gap,
        margin_left=geo.margin_left,
        margin_right=geo.margin_right,
        margin_top=geo.margin_top,
        margin_bottom=geo.margin_bottom,
        font_counts={},
        corner_raw=corner_raw or {},
        left_block_min_cm=geo.left_block_min_cm,
        left_narrow_frac=geo.left_narrow_frac,
        right_block_min_cm=geo.right_block_min_cm,
        right_narrow_frac=geo.right_narrow_frac,
        detected_title=detect_page_title(ocr_page.text),
        extraction_mode="ocr",
        ocr_conf=ocr_page.mean_conf,
        text_selectable=False,
    )
