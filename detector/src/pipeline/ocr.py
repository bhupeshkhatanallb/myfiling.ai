"""
Optional OCR layer for scanned / image-only filings.

Why this exists
---------------
A scanned paper-book has no extractable text, so the text-based detectors (index,
section order, page numbering, font family) would otherwise gate out with a
"could not verify" note. This module rasterises such pages and runs Tesseract so
those detectors CAN scrutinise scanned filings.

Design constraints (decided with the user):
  * Tesseract via pytesseract, offline. We recover BOTH text AND layout geometry
    (word/line bounding boxes) from scans via ``image_to_data``, converted from
    image pixels to PDF points using the rasterisation DPI. This lets the
    geometry detectors (margins / font size / line spacing / quotations) measure
    scanned pages - at reduced confidence, since OCR boxes are noisier than native
    coordinates.
  * Fully optional and defensive: if PyMuPDF, pytesseract, or the Tesseract
    binary is unavailable, every function degrades to a no-op and the engine
    falls back to its previous "could not verify" behaviour. OCR must never crash
    an analysis.
  * Page-capped by the caller for speed (a 288-page scan must not hang an upload).
  * Single Tesseract pass per page: ``image_to_data`` yields text + boxes
    together, so we never OCR a page twice.

Public surface:
    ocr_available() -> bool
    ocr_document_layout(path, max_pages, dpi) -> Optional[List[OcrPage]]
    ocr_document_text(path, max_pages) -> Optional[List[str]]   (text-only convenience)
    corner_tokens_from_text(text) -> dict
"""

from __future__ import annotations

import logging
import os
from dataclasses import dataclass, field
from functools import lru_cache
from typing import Dict, List, Optional, Tuple

logger = logging.getLogger(__name__)


# --------------------------------------------------------------------------- #
# OCR result value objects. Coordinates are in PDF POINTS (already converted
# from image pixels via the rasterisation DPI), top-left origin, matching the
# native pdfplumber coordinate convention so downstream code is source-agnostic.
# --------------------------------------------------------------------------- #
@dataclass(frozen=True)
class OcrWord:
    text: str
    x0: float
    top: float
    x1: float
    bottom: float
    conf: float        # Tesseract confidence 0..100
    line_id: int       # stable per-page line key (block, par, line)

    @property
    def height(self) -> float:
        return self.bottom - self.top


@dataclass(frozen=True)
class OcrLine:
    text: str
    x0: float
    top: float
    x1: float
    bottom: float
    words: Tuple[OcrWord, ...]

    @property
    def height(self) -> float:
        return self.bottom - self.top


@dataclass(frozen=True)
class OcrPage:
    width: float                       # page width in points
    height: float                      # page height in points
    text: str                          # full page text
    words: Tuple[OcrWord, ...]
    lines: Tuple[OcrLine, ...]
    mean_conf: float                   # mean word confidence (quality signal)

# Rasterisation resolution. 300 DPI is the OCR sweet spot for body text; higher
# is slower with little accuracy gain on clean scans.
_OCR_DPI = 300
# Tesseract page-segmentation: 3 = fully automatic page segmentation (default,
# good for full pages of running text).
_TESS_CONFIG = "--psm 3"


# --------------------------------------------------------------------------- #
# Tesseract binary discovery. pytesseract needs the engine on PATH OR an explicit
# path. On Windows it is commonly installed but not added to PATH, so we probe
# the usual locations and configure pytesseract once.
# --------------------------------------------------------------------------- #
_WINDOWS_TESSERACT_PATHS = [
    r"C:\Program Files\Tesseract-OCR\tesseract.exe",
    r"C:\Program Files (x86)\Tesseract-OCR\tesseract.exe",
    os.path.expandvars(r"%LOCALAPPDATA%\Programs\Tesseract-OCR\tesseract.exe"),
    os.path.expandvars(r"%LOCALAPPDATA%\Tesseract-OCR\tesseract.exe"),
]


@lru_cache(maxsize=1)
def _import_pytesseract():
    try:
        import pytesseract  # noqa: WPS433 (lazy import is intentional)
    except Exception:  # noqa: BLE001
        return None
    # Point pytesseract at the binary if it isn't already resolvable.
    try:
        pytesseract.get_tesseract_version()
        return pytesseract
    except Exception:  # noqa: BLE001 - not on PATH; try known locations
        for cand in _WINDOWS_TESSERACT_PATHS:
            if cand and os.path.exists(cand):
                pytesseract.pytesseract.tesseract_cmd = cand
                try:
                    pytesseract.get_tesseract_version()
                    return pytesseract
                except Exception:  # noqa: BLE001
                    continue
    return None


@lru_cache(maxsize=1)
def _import_fitz():
    try:
        import fitz  # PyMuPDF
        return fitz
    except Exception:  # noqa: BLE001
        return None


@lru_cache(maxsize=1)
def ocr_available() -> bool:
    """True only if we can both rasterise (PyMuPDF) and OCR (Tesseract)."""
    return _import_fitz() is not None and _import_pytesseract() is not None


def _render_page_to_image(fitz_doc, page_index: int, dpi: int):
    """Rasterise one page to a PIL image, or None on failure."""
    try:
        from PIL import Image
        page = fitz_doc[page_index]
        # zoom = dpi / 72 (PDF base is 72 dpi)
        zoom = dpi / 72.0
        mat = fitz_doc_matrix(zoom)
        pix = page.get_pixmap(matrix=mat, alpha=False)
        return Image.frombytes("RGB", (pix.width, pix.height), pix.samples)
    except Exception:  # noqa: BLE001
        logger.exception("Rasterising page %d failed", page_index)
        return None


def fitz_doc_matrix(zoom: float):
    """Build a fitz scaling matrix (separated for testability)."""
    fitz = _import_fitz()
    return fitz.Matrix(zoom, zoom)


def ocr_page_text(fitz_doc, page_index: int, dpi: int = _OCR_DPI) -> Optional[str]:
    """OCR a single already-open page. Returns text, or None if OCR is unavailable."""
    pyt = _import_pytesseract()
    if pyt is None:
        return None
    img = _render_page_to_image(fitz_doc, page_index, dpi)
    if img is None:
        return None
    try:
        return pyt.image_to_string(img, lang="eng", config=_TESS_CONFIG) or ""
    except Exception:  # noqa: BLE001
        logger.exception("OCR of page %d failed", page_index)
        return None


# Discard OCR tokens below this confidence - they are usually speckle/noise and
# would pollute geometry (stray boxes at the page edge inflate margins/font).
_MIN_WORD_CONF = 40.0


def _ocr_page_layout(fitz_doc, page_index: int, dpi: int) -> Optional[OcrPage]:
    """
    OCR one page and return words + lines with bounding boxes in PDF points.

    A single ``image_to_data`` call yields text and geometry together (one
    Tesseract pass). Pixel coordinates are scaled to points using the true page
    width so the boxes line up with the native pdfplumber coordinate system.
    """
    pyt = _import_pytesseract()
    fitz = _import_fitz()
    if pyt is None or fitz is None:
        return None
    img = _render_page_to_image(fitz_doc, page_index, dpi)
    if img is None:
        return None
    try:
        page = fitz_doc[page_index]
        w_pt, h_pt = float(page.rect.width), float(page.rect.height)
        # px -> pt scale (use width; uniform zoom so x and y scales are equal).
        scale = w_pt / img.width if img.width else 0.0
        if scale <= 0:
            return None
        data = pyt.image_to_data(img, lang="eng", config=_TESS_CONFIG,
                                 output_type=pyt.Output.DICT)
    except Exception:  # noqa: BLE001
        logger.exception("OCR layout of page %d failed", page_index)
        return None

    n = len(data.get("text", []))
    words: List[OcrWord] = []
    confs: List[float] = []
    # Group words into lines using Tesseract's block/par/line hierarchy.
    line_buckets: Dict[Tuple[int, int, int], List[OcrWord]] = {}
    for i in range(n):
        txt = (data["text"][i] or "").strip()
        if not txt:
            continue
        try:
            conf = float(data["conf"][i])
        except (TypeError, ValueError):
            conf = -1.0
        if conf < _MIN_WORD_CONF:
            continue
        x0 = data["left"][i] * scale
        top = data["top"][i] * scale
        x1 = (data["left"][i] + data["width"][i]) * scale
        bottom = (data["top"][i] + data["height"][i]) * scale
        key = (data["block_num"][i], data["par_num"][i], data["line_num"][i])
        line_id = hash(key) & 0x7FFFFFFF
        word = OcrWord(text=txt, x0=x0, top=top, x1=x1, bottom=bottom,
                       conf=conf, line_id=line_id)
        words.append(word)
        confs.append(conf)
        line_buckets.setdefault(key, []).append(word)

    lines: List[OcrLine] = []
    for key, ws in line_buckets.items():
        ws_sorted = sorted(ws, key=lambda w: w.x0)
        lines.append(OcrLine(
            text=" ".join(w.text for w in ws_sorted),
            x0=min(w.x0 for w in ws), top=min(w.top for w in ws),
            x1=max(w.x1 for w in ws), bottom=max(w.bottom for w in ws),
            words=tuple(ws_sorted),
        ))
    lines.sort(key=lambda ln: ln.top)

    return OcrPage(
        width=w_pt, height=h_pt,
        text="\n".join(ln.text for ln in lines),
        words=tuple(words), lines=tuple(lines),
        mean_conf=(sum(confs) / len(confs)) if confs else 0.0,
    )


def ocr_document_layout(path: str, max_pages: Optional[int] = None,
                        dpi: int = _OCR_DPI) -> Optional[List[OcrPage]]:
    """
    OCR up to ``max_pages`` pages and return per-page layout (text + boxes).
    Returns None if OCR is unavailable / the document can't be opened. Never raises.
    """
    if not ocr_available():
        return None
    fitz = _import_fitz()
    try:
        doc = fitz.open(path)
    except Exception:  # noqa: BLE001
        logger.exception("PyMuPDF could not open %s for OCR", path)
        return None
    try:
        n = doc.page_count
        limit = n if max_pages is None else min(max_pages, n)
        out: List[OcrPage] = []
        for i in range(limit):
            pg = _ocr_page_layout(doc, i, dpi)
            out.append(pg if pg is not None else OcrPage(
                width=float(doc[i].rect.width), height=float(doc[i].rect.height),
                text="", words=(), lines=(), mean_conf=0.0,
            ))
        return out
    finally:
        try:
            doc.close()
        except Exception:  # noqa: BLE001
            pass


def ocr_pages_layout(path: str, page_indices, dpi: int = _OCR_DPI,
                     on_page=None):
    """
    OCR a SPECIFIC set of page indices (not just the first N) and yield/collect
    their layout. Returns a dict {page_index: OcrPage} for the pages OCR'd, or
    None if OCR is unavailable / the document can't be opened. Never raises.

    ``on_page(idx, ordinal, total)`` is an optional progress callback invoked
    after each page is OCR'd (ordinal is 1-based within the requested set) so the
    streaming pipeline can report live OCR progress on a long scan.
    """
    if not ocr_available():
        return None
    fitz = _import_fitz()
    try:
        doc = fitz.open(path)
    except Exception:  # noqa: BLE001
        logger.exception("PyMuPDF could not open %s for OCR", path)
        return None
    try:
        n = doc.page_count
        wanted = [i for i in page_indices if 0 <= i < n]
        total = len(wanted)
        out = {}
        for ordinal, i in enumerate(wanted, start=1):
            pg = _ocr_page_layout(doc, i, dpi)
            if pg is None:
                pg = OcrPage(width=float(doc[i].rect.width),
                             height=float(doc[i].rect.height),
                             text="", words=(), lines=(), mean_conf=0.0)
            out[i] = pg
            if on_page is not None:
                try:
                    on_page(i, ordinal, total)
                except Exception:  # noqa: BLE001 - a progress hook must not break OCR
                    pass
        return out
    finally:
        try:
            doc.close()
        except Exception:  # noqa: BLE001
            pass


def corner_tokens_from_text(text: str) -> dict:
    """
    Approximate corner folio tokens from OCR'd page text.

    OCR gives no coordinates, so we cannot place a token in a precise corner.
    But the folio almost always sits on the FIRST or LAST non-empty line. We map
    the first line into the top regions (TL/TC/TR) and the last line into the
    bottom regions (BL/BC/BR) so the page-numbering detector's existing
    folio-extraction can pull a number from whichever it finds. This is coarse by
    design - it recovers "is there a number top/bottom?" not exact placement.
    """
    lines = [ln.strip() for ln in (text or "").splitlines() if ln.strip()]
    out = {r: "" for r in ("TL", "TC", "TR", "BL", "BC", "BR")}
    if not lines:
        return out
    first, last = lines[0], lines[-1]
    for r in ("TL", "TC", "TR"):
        out[r] = first
    for r in ("BL", "BC", "BR"):
        out[r] = last
    return out


def corner_tokens_from_layout(ocr_page: "OcrPage") -> dict:
    """
    Place OCR words into corner/centre bands using their real bounding boxes -
    more precise than the text-only fallback because we know each word's x/y.
    Mirrors the native char-level corner extraction so the page-numbering
    detector's folio logic works identically on scans.
    """
    out = {r: "" for r in ("TL", "TC", "TR", "BL", "BC", "BR")}
    if not ocr_page or not ocr_page.words:
        return out
    w, h = ocr_page.width, ocr_page.height
    X_MARGIN, Y_BAND = 150.0, 110.0
    buckets: Dict[str, List[OcrWord]] = {r: [] for r in out}
    for word in ocr_page.words:
        top = word.top < Y_BAND
        bot = word.top > h - Y_BAND
        if not (top or bot):
            continue
        band = "T" if top else "B"
        col = "L" if word.x0 < X_MARGIN else ("R" if word.x0 > w - X_MARGIN else "C")
        buckets[band + col].append(word)
    for r, ws in buckets.items():
        ws.sort(key=lambda c: (round(c.top / 3), c.x0))
        out[r] = "".join(x.text for x in ws).strip()
    return out


def ocr_document_text(path: str, max_pages: Optional[int] = None,
                      dpi: int = _OCR_DPI) -> Optional[List[str]]:
    """
    OCR up to ``max_pages`` pages of a PDF. Returns a list of per-page strings
    (length == pages actually OCR'd), or None if OCR is unavailable / fails to
    open the document. Never raises.
    """
    if not ocr_available():
        return None
    fitz = _import_fitz()
    try:
        doc = fitz.open(path)
    except Exception:  # noqa: BLE001
        logger.exception("PyMuPDF could not open %s for OCR", path)
        return None
    try:
        n = doc.page_count
        limit = n if max_pages is None else min(max_pages, n)
        out: List[str] = []
        for i in range(limit):
            out.append(ocr_page_text(doc, i, dpi) or "")
        return out
    finally:
        try:
            doc.close()
        except Exception:  # noqa: BLE001
            pass
