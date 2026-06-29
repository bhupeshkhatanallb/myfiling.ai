"""
ChunkReader — Stage 1 of the rewrite brief.

Opens the PDF EXACTLY ONCE (one pdfplumber handle) and yields pages in
configurable chunks ([1-50], [51-100], ...) so that:

  * memory stays bounded — we never hold every page's chars at once,
  * the processor can emit results for early pages before late pages are parsed
    (first-results latency / real-time streaming),
  * a single traversal feeds every detector (no duplicate parsing).

A ``RawPage`` is the minimal raw payload the MetadataBuilder needs: page index,
dimensions, the char dicts, image count, and extracted text. The pdfplumber Page
object itself is NOT leaked past this module, so nothing downstream can re-open
or re-walk the PDF.
"""

from __future__ import annotations

import logging
from dataclasses import dataclass
from typing import Iterator, List, Optional

import pdfplumber

logger = logging.getLogger(__name__)

# Default chunk size. 50 pages keeps peak memory low while amortising the
# per-chunk overhead; configurable via ChunkReader(chunk_size=...).
DEFAULT_CHUNK_SIZE = 50


@dataclass(frozen=True)
class RawPage:
    """Raw, source-agnostic payload for one page (no pdfplumber object leaks)."""
    index: int
    width: float
    height: float
    chars: List[dict]
    image_count: int
    text: str


class ChunkReader:
    """
    Single-parse, chunked PDF reader.

    Usage::

        reader = ChunkReader(path, chunk_size=50)
        with reader:
            total = reader.page_count
            for chunk in reader.chunks():        # List[RawPage]
                ...                              # process [1-50], [51-100], ...

    ``max_pages`` caps deep parsing for very large books; ``page_count`` always
    reports the document's true length so callers can reason about coverage.
    """

    def __init__(self, path: str, chunk_size: int = DEFAULT_CHUNK_SIZE,
                 max_pages: Optional[int] = None):
        self.path = path
        self.chunk_size = max(1, chunk_size)
        self.max_pages = max_pages
        self._pdf = None
        self._page_count = 0
        self._limit = 0

    # ---- context management (one open handle for the whole read) ---------- #
    def __enter__(self) -> "ChunkReader":
        self._pdf = pdfplumber.open(self.path)
        self._page_count = len(self._pdf.pages)
        self._limit = (self._page_count if self.max_pages is None
                       else min(self.max_pages, self._page_count))
        return self

    def __exit__(self, *exc) -> None:
        if self._pdf is not None:
            try:
                self._pdf.close()
            finally:
                self._pdf = None

    @property
    def page_count(self) -> int:
        """True document length (independent of max_pages cap)."""
        return self._page_count

    @property
    def parsed_count(self) -> int:
        """How many pages will actually be deep-parsed (after the cap)."""
        return self._limit

    # ---- chunked iteration ------------------------------------------------ #
    def chunks(self) -> Iterator[List[RawPage]]:
        """Yield successive lists of RawPage, ``chunk_size`` pages at a time."""
        if self._pdf is None:
            raise RuntimeError("ChunkReader must be used as a context manager")
        batch: List[RawPage] = []
        for i in range(self._limit):
            batch.append(self._read_page(i))
            if len(batch) >= self.chunk_size:
                yield batch
                batch = []
        if batch:
            yield batch

    def _read_page(self, index: int) -> RawPage:
        page = self._pdf.pages[index]
        try:
            chars = page.chars or []
        except Exception:  # noqa: BLE001 — a malformed page must not kill the read
            logger.exception("Reading chars on page %d failed", index)
            chars = []
        try:
            text = page.extract_text() or ""
        except Exception:  # noqa: BLE001
            text = ""
        try:
            image_count = len(page.images or [])
        except Exception:  # noqa: BLE001
            image_count = 0
        rp = RawPage(
            index=index,
            width=float(page.width),
            height=float(page.height),
            chars=chars,
            image_count=image_count,
            text=text,
        )
        # Release pdfplumber's per-page cache so memory does not accumulate
        # across a large book (we have already copied out everything we need).
        try:
            page.flush_cache()
            page.close()
        except Exception:  # noqa: BLE001
            pass
        return rp
