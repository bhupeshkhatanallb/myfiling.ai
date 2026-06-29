"""
Document assembly — wire ChunkReader -> MetadataBuilder -> extractors -> context.

``build_context`` is the synchronous entry point: it performs the single chunked
parse, builds PageMetadata for every page, runs index/bookmark extraction and the
written-page-number pass, applies the OCR fallback when the text parse is
unscrutinisable, and returns the immutable :class:`DocumentContext`.

The async :class:`~pipeline.processor.DocumentProcessor` reuses these same
building blocks but interleaves detector execution with chunk parsing for
streaming; this module is the simple "build it all, then analyse" path used by
the synchronous engine facade and the regression harness.
"""

from __future__ import annotations

import gc
import os
import logging
from typing import Callable, List, Optional

from .reader import ChunkReader, DEFAULT_CHUNK_SIZE
from .model import DocumentContext, PageMetadata
from .extractors.page_meta import build_page_metadata, build_page_metadata_from_ocr
from .extractors.index import extract_index
from .extractors.bookmarks import extract_bookmarks
from .extractors.page_numbering import assign_written_page_numbers

logger = logging.getLogger(__name__)

# How many pages to OCR for a scanned/garbled filing. OCR is ~1.5s/page, so we
# cap it for sanity on very large books; 75 covers the front matter plus most
# annexures of a typical filing (user decision: raise from the old 25).
_OCR_PAGE_CAP = 75

# A page is considered to lack usable native text (an OCR candidate) when its
# text layer is essentially empty — i.e. it is a scanned image page. We keep
# pages that DO have good native text native (do not re-OCR them), so a mixed
# document's native pleading pages retain full-fidelity geometry/fonts.
_NATIVE_TEXT_MIN_CHARS = 50


def _needs_ocr(ctx: DocumentContext) -> bool:
    """
    Should we OCR this document?

    OCR runs whenever the TEXT is not scrutinisable on a document that still
    looks like a real filing (has page dimensions / some images). The old gate
    required ``cannot_scrutinize`` (no text AND no geometry), which WRONGLY
    skipped OCR on a MIXED scan — a filing with a few native text pages had
    ``has_geometry`` True, so its scanned bulk was never OCR'd and every
    text-based check returned "Could Not Be Verified". The correct trigger is
    simply: the text can't be read, but there are scanned pages we can OCR.
    """
    if ctx.text_scrutinizable:
        return False
    if not ctx.has_page_dimensions:
        return False
    # Only worth OCR if there are image/near-empty pages to recover text from.
    return any(p.is_image_heavy or p.char_count < _NATIVE_TEXT_MIN_CHARS
               for p in ctx.pages)


def _ocr_candidate_indices(pages: List[PageMetadata]) -> List[int]:
    """Page indices that lack usable native text (scanned image pages)."""
    return [p.pdf_page_no for p in pages if p.char_count < _NATIVE_TEXT_MIN_CHARS]


def _apply_quality_safe(ctx: DocumentContext, path: str) -> None:
    """Run the lazy image-quality pass, never letting it fail an analysis."""
    try:
        from .quality import apply_quality
        apply_quality(ctx, path)
    except Exception:  # noqa: BLE001 — quality scoring is best-effort
        logger.exception("Quality pass failed (continuing without quality signals)")


def _apply_ocr(pages: List[PageMetadata], path: str,
               max_pages: Optional[int],
               on_ocr_page: Optional[Callable[[int, int, int], None]] = None) -> tuple:
    """
    OCR the SCANNED pages (those lacking native text) and rebuild only those.

    Selective by design: native text pages are left untouched so a mixed
    document keeps its high-fidelity native geometry/fonts; only image pages are
    replaced with OCR-derived metadata. Capped at ``_OCR_PAGE_CAP`` (or
    ``max_pages``). ``on_ocr_page(idx, ordinal, total)`` streams live progress.
    Returns (new_pages, ocr_count).
    """
    from . import ocr as ocr_mod
    if not ocr_mod.ocr_available():
        return pages, 0

    candidates = _ocr_candidate_indices(pages)
    if not candidates:
        return pages, 0
    cap = _OCR_PAGE_CAP if max_pages is None else min(_OCR_PAGE_CAP, max_pages)
    targets = candidates[:cap]

    ocr_map = ocr_mod.ocr_pages_layout(path, targets, on_page=on_ocr_page)
    if not ocr_map:
        return pages, 0

    new_pages: List[PageMetadata] = list(pages)
    ocr_count = 0
    for i, opage in ocr_map.items():
        if i >= len(new_pages) or not opage.text.strip():
            continue
        corner = ocr_mod.corner_tokens_from_layout(opage)
        new_pages[i] = build_page_metadata_from_ocr(opage, i, corner_raw=corner)
        ocr_count += 1
    return new_pages, ocr_count


def build_context(path: str, chunk_size: int = DEFAULT_CHUNK_SIZE,
                  max_pages: Optional[int] = None,
                  enable_ocr: bool = True,
                  on_progress: Optional[Callable[[dict], None]] = None) -> DocumentContext:
    """
    Parse the PDF ONCE (chunked) and return the assembled DocumentContext.

    ``on_progress(event_dict)`` is an optional callback the streaming processor
    passes in to surface live parse/OCR progress (each chunk parsed, each page
    OCR'd) so a long or scanned document doesn't appear frozen. It is ignored by
    the synchronous callers.
    """
    def _progress(**kw) -> None:
        if on_progress is not None:
            on_progress(kw)

    pages: List[PageMetadata] = []
    # Smaller chunks keep fewer heavy raw-char lists alive at once (memory) on
    # large scans; tunable via env for tight instances (e.g. a 512 MB free tier).
    eff_chunk = min(chunk_size, int(os.getenv("PARSE_CHUNK_SIZE", "8")))
    with ChunkReader(path, chunk_size=eff_chunk, max_pages=max_pages) as reader:
        total = reader.page_count
        parsed = reader.parsed_count
        for chunk in reader.chunks():
            for raw in chunk:
                pages.append(build_page_metadata(raw))
            _progress(stage="parsing", page=len(pages), total=parsed)
            chunk.clear()            # release this chunk's raw chars promptly
            gc.collect()             # return freed buffers to the OS sooner

    # Stage 5: assign written page numbers (numbering need not start at page 1).
    assign_written_page_numbers(pages)

    # Stage 2: index + bookmark extraction (text-based + outline).
    index_entries = extract_index(pages)
    bookmarks = extract_bookmarks(path)

    ctx = DocumentContext(path=path, pages=pages, page_count=total,
                          index_entries=index_entries, bookmarks=bookmarks)

    # Stage 4 (quality): score image-heavy (scanned) pages for DPI/blur ONLY.
    _apply_quality_safe(ctx, path)

    if enable_ocr and _needs_ocr(ctx):
        def _ocr_cb(idx, ordinal, total_ocr):
            _progress(stage="ocr", page=ordinal, total=total_ocr, pdf_page=idx + 1)
        new_pages, ocr_count = _apply_ocr(pages, path, max_pages, on_ocr_page=_ocr_cb)
        if ocr_count:
            assign_written_page_numbers(new_pages)
            index_entries = extract_index(new_pages)
            ctx = DocumentContext(path=path, pages=new_pages, page_count=total,
                                  index_entries=index_entries, bookmarks=bookmarks,
                                  ocr_used=True, ocr_pages=ocr_count)
            _apply_quality_safe(ctx, path)
    return ctx
