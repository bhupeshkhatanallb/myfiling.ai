"""
BookmarkExtractor - Stage 2/8: read the PDF outline (bookmarks).

Uses PyMuPDF's ``get_toc()`` to recover the document outline as
:class:`~pipeline.model.Bookmark` entries (title + 0-based target page + level).
Fully defensive: if PyMuPDF is unavailable or the document has no outline, returns
an empty list (absence is handled by the BookmarkValidator, not here).
"""

from __future__ import annotations

import logging
from typing import List

from ..model import Bookmark

logger = logging.getLogger(__name__)


def extract_bookmarks(path: str) -> List[Bookmark]:
    """Return the PDF outline as Bookmark entries, or [] if none/unavailable."""
    try:
        import fitz  # PyMuPDF
    except Exception:  # noqa: BLE001 - optional dependency
        return []
    try:
        doc = fitz.open(path)
    except Exception:  # noqa: BLE001
        logger.exception("PyMuPDF could not open %s for bookmarks", path)
        return []
    try:
        # get_toc(simple=True) -> [[level, title, page_1based], ...]
        toc = doc.get_toc(simple=True) or []
    except Exception:  # noqa: BLE001
        logger.exception("Reading outline of %s failed", path)
        toc = []
    finally:
        try:
            doc.close()
        except Exception:  # noqa: BLE001
            pass

    out: List[Bookmark] = []
    for entry in toc:
        try:
            level, title, page_1based = entry[0], entry[1], entry[2]
        except (IndexError, TypeError):
            continue
        # fitz returns 1-based page numbers (0 / -1 when unresolved).
        page_index = (int(page_1based) - 1) if page_1based and page_1based > 0 else -1
        out.append(Bookmark(title=str(title).strip(),
                            page_index=page_index, level=int(level)))
    return out
