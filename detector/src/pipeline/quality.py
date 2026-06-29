"""
Image-quality measurement — Stage 4 quality signals, computed LAZILY.

Per the chosen policy (DPI/blur on scanned pages only), this rasterises and scores
ONLY pages that carry a real content image (a scan / photographed page). Clean
native text pages are skipped entirely, so a normal text filing pays nothing here.

The MEASUREMENT logic here is PORTED from the reference analyzer's
``detect_blur_pages`` / ``analyze_pdf_min_dpi`` (the AI-free, rule-based half of
that pipeline), adapted to this project's PyMuPDF+numpy stack:

  * dpi          — effective scan resolution = min(dpi_x, dpi_y) of the largest
                   embedded raster, vs the page's physical size. Using min() of
                   both axes (not width only) catches anisotropically downsampled
                   scans the old width-only estimate missed.
  * blur_score   — variance of the Laplacian of the greyscale page (higher =
                   sharper). Compared against an ADAPTIVE p75 baseline so a
                   genuinely soft page is judged against the document's own good
                   pages, not a fixed constant that drifts with render DPI.
  * sharp_norm   — blur variance normalised by render-DPI² (the reference's
                   scale-free sharpness), kept so detectors can reason about it.
  * ocr_compatible / text_selectable — unchanged role.

Fully defensive: if PyMuPDF/numpy are unavailable the pass is a no-op and the
signals stay None (the detectors then simply don't assert anything).
"""

from __future__ import annotations

import logging
from typing import List, Optional

logger = logging.getLogger(__name__)

# ── DPI policy (court spec) ────────────────────────────────────────────────────
# The Supreme Court / High Court e-filing rules require a minimum 300 DPI scan.
# The reference analyzer flags at (min_dpi - 10) to absorb rounding noise, so a
# genuine 300-DPI scan that measures 295-299 is not flagged. We adopt the same
# court-spec floor: the previous 120-DPI floor silently passed 145-212 DPI scans
# that are below spec and hard to read in the paper-book.
_COURT_MIN_DPI = 300.0
_MIN_OCR_DPI = _COURT_MIN_DPI - 10.0   # 290: below this a scanned page is below court spec
_OCR_USABLE_DPI = 200.0                # comfortable OCR resolution (gates ocr_compatible only)

# ── Blur policy (adaptive, ported from the reference) ──────────────────────────
# The reference normalises Laplacian variance by render_dpi² to get a scale-free
# "sharpness", then compares each page against the document's own p75 sharpness:
#   sharp < STRONG               OR sharp < p75 * 0.15  -> blur
#   sharp < BLUR  AND sharp < p75 * 0.40                 -> slight blur
# This is far more robust than a single fixed Laplacian-variance constant, which
# drifts with content density and render resolution.
_BLUR_STRONG = 0.01           # absolute scale-free sharpness floor (hard blur)
_BLUR_SLIGHT = 0.12           # absolute scale-free sharpness ceiling for "slight"
_BLUR_P75_FRAC_STRONG = 0.15  # < 15% of the document's good-page sharpness
_BLUR_P75_FRAC_SLIGHT = 0.40  # < 40% of the document's good-page sharpness
_PCT_BRIGHT_SKIP = 0.90       # near-blank page (>90% very-bright px) — skip blur judgement

# Back-compat: kept so quality_checks.py keeps importing a name. With the adaptive
# model the per-page blur flag is decided in ``measure_page_quality`` and exposed
# via ``PageMetadata.blur_score`` being the scale-free sharpness; the detector now
# treats ``blur_score < _MIN_SHARP_BLUR`` as "flagged blurred".
_MIN_SHARP_BLUR = _BLUR_SLIGHT

_RENDER_DPI = 150             # rasterise at a modest DPI just to MEASURE quality

# A page is rendered for quality scoring only if it carries a real content image
# covering at least this fraction of the page — the reference's MIN_IMAGE_COVERAGE.
_MIN_IMAGE_COVERAGE = 0.10
# Pure text pages (lots of native text) are never blurry scans — skip them.
_MIN_TEXT_SKIP = 500


def _imports():
    try:
        import fitz  # PyMuPDF
        import numpy as np
        return fitz, np
    except Exception:  # noqa: BLE001
        return None, None


def _laplacian_variance(gray) -> float:
    """Variance of a 3x3 Laplacian over a greyscale array (focus measure)."""
    import numpy as np
    # Discrete Laplacian via shifts (avoids a SciPy/OpenCV dependency).
    g = gray.astype("float32")
    lap = (-4.0 * g
           + np.roll(g, 1, axis=0) + np.roll(g, -1, axis=0)
           + np.roll(g, 1, axis=1) + np.roll(g, -1, axis=1))
    # Trim the 1-px border where the roll wraps around.
    inner = lap[1:-1, 1:-1]
    return float(inner.var()) if inner.size else 0.0


def _estimate_dpi(fitz_page, page_width_pt: float, page_height_pt: float) -> Optional[float]:
    """
    Effective DPI of the dominant embedded raster on a page, as
    ``min(dpi_x, dpi_y)`` — the reference analyzer's measure. Using the smaller of
    the two axes (rather than width only) catches scans that are downsampled on
    one axis. Returns None if the page has no measurable image.
    """
    try:
        infos = fitz_page.get_image_info()
    except Exception:  # noqa: BLE001
        return None
    if not infos:
        return None
    # Largest image by pixel area is the page scan.
    best = max(infos, key=lambda im: (im.get("width", 0) * im.get("height", 0)))
    px_w = best.get("width", 0)
    px_h = best.get("height", 0)
    if not px_w or not px_h or page_width_pt <= 0 or page_height_pt <= 0:
        return None
    # Reject tiny logos/stamps that would skew the estimate.
    if min(px_w, px_h) < 200:
        return None
    dpi_x = px_w / (page_width_pt / 72.0)
    dpi_y = px_h / (page_height_pt / 72.0)
    return round(min(dpi_x, dpi_y), 1)


# A page whose largest raster covers at least this fraction of the page is a
# full-page SCAN — its text (if any) is a garbled OCR overlay, not native text,
# so it must be DPI/blur-measured even when its char count is high.
_FULL_PAGE_IMAGE_COVERAGE = 0.80


def _max_image_coverage(fitz_page) -> float:
    """Largest fraction of the page area covered by a single placed raster.

    Uses placed image rects so a full-page scan is detected even when its
    char_count is above the ``is_image_heavy`` cut-off (e.g. a scanned body under
    a typed/garbled-OCR text overlay). Returns 0.0 on any error or no images.
    """
    try:
        rect = fitz_page.rect
        page_area = rect.width * rect.height
        if page_area <= 0:
            return 0.0
        best = 0.0
        for img in fitz_page.get_images(full=True):
            xref = img[0]
            try:
                for r in fitz_page.get_image_rects(xref):
                    cov = (r.width * r.height) / page_area
                    if cov > best:
                        best = cov
            except Exception:  # noqa: BLE001
                continue
        return best
    except Exception:  # noqa: BLE001
        return 0.0


def _has_content_image(fitz_page) -> bool:
    """True if the page has a raster covering >= _MIN_IMAGE_COVERAGE of its area."""
    return _max_image_coverage(fitz_page) >= _MIN_IMAGE_COVERAGE


def measure_page_quality(path: str, page_indices: List[int]) -> dict:
    """
    Rasterise & score the given page indices. Returns {index: {dpi, blur,
    sharp_norm, ocr_compatible}}. Pages that can't be measured are omitted.

    ``blur`` is the scale-free sharpness (Laplacian-variance / render_dpi²) — the
    reference's normalised measure — so a fixed-render baseline does not bias it.
    The ADAPTIVE blur classification (vs the document's own p75) is applied in
    ``apply_quality`` once all candidate pages are scored. Never raises.
    """
    fitz, np = _imports()
    out: dict = {}
    if fitz is None or np is None or not page_indices:
        return out
    try:
        doc = fitz.open(path)
    except Exception:  # noqa: BLE001
        logger.exception("PyMuPDF could not open %s for quality scan", path)
        return out
    try:
        zoom = _RENDER_DPI / 72.0
        mat = fitz.Matrix(zoom, zoom)
        for idx in page_indices:
            if idx < 0 or idx >= doc.page_count:
                continue
            try:
                page = doc[idx]
                dpi = _estimate_dpi(page, float(page.rect.width), float(page.rect.height))
                # Render greyscale directly (csGRAY) — matches the reference and
                # halves the buffer vs RGB.
                pix = page.get_pixmap(matrix=mat, colorspace=fitz.csGRAY, alpha=False)
                gray = np.frombuffer(pix.samples, dtype=np.uint8).reshape(pix.height, pix.width)
                del pix

                pct_very_bright = float(np.mean(gray > 240))
                lap_var = _laplacian_variance(gray)
                # Scale-free sharpness (reference): variance / render_dpi².
                sharp_norm = lap_var / float(_RENDER_DPI ** 2)

                # Near-blank pages have low variance because they are EMPTY, not
                # blurred — mark sharpness None so the adaptive pass skips them.
                blur_meas = None if pct_very_bright > _PCT_BRIGHT_SKIP else round(sharp_norm, 5)

                ocr_ok = ((dpi is None or dpi >= _OCR_USABLE_DPI)
                          and (blur_meas is None or blur_meas >= _BLUR_STRONG))
                out[idx] = {
                    "dpi": dpi,
                    "blur": blur_meas,
                    "ocr_compatible": bool(ocr_ok),
                }
            except Exception:  # noqa: BLE001 — one bad page must not stop the rest
                logger.exception("Quality scan of page %d failed", idx)
    finally:
        try:
            doc.close()
        except Exception:  # noqa: BLE001
            pass
    return out


def _quality_targets(ctx, path: str, max_pages: int) -> List[int]:
    """
    Page indices to score: pages carrying a real content image (a scan), capped.

    Primary source is the cheap ``is_image_heavy`` flag (image + little text).
    We additionally promote pages that have a large covering image even when they
    carry some text (a scanned body under a typed header overlay) — the reference
    treats these as scan candidates, and the old ``is_image_heavy``-only gate
    silently skipped them, missing low-DPI/blurred scans on hybrid pages.
    """
    fitz, _ = _imports()
    targets: List[int] = [p.pdf_page_no for p in ctx.pages if p.is_image_heavy]

    if fitz is not None:
        seen = set(targets)
        try:
            doc = fitz.open(path)
        except Exception:  # noqa: BLE001
            doc = None
        if doc is not None:
            try:
                for p in ctx.pages:
                    # Once we have more candidates than we will render, stop the
                    # scan — measure_page_quality only renders ``max_pages`` of them.
                    if len(targets) >= max_pages:
                        break
                    if p.pdf_page_no in seen:
                        continue
                    if p.image_count <= 0 or p.pdf_page_no >= doc.page_count:
                        continue
                    cov = _max_image_coverage(doc[p.pdf_page_no])
                    # A FULL-PAGE scan is measured regardless of char count: its
                    # text is a garbled OCR overlay, not native text. Only pages
                    # with a SMALLER content image are subject to the text-skip
                    # guard (a native page with an inline figure is not a scan).
                    is_full_scan = cov >= _FULL_PAGE_IMAGE_COVERAGE
                    if not is_full_scan and p.char_count >= _MIN_TEXT_SKIP:
                        continue
                    if cov >= _MIN_IMAGE_COVERAGE:
                        targets.append(p.pdf_page_no)
                        seen.add(p.pdf_page_no)
            finally:
                try:
                    doc.close()
                except Exception:  # noqa: BLE001
                    pass

    targets.sort()
    return targets[:max_pages]


def apply_quality(ctx, path: str, max_pages: int = 60) -> int:
    """
    Populate quality signals on the scan pages of ``ctx`` (in place).

    Only image-carrying pages (scans) are measured, capped to ``max_pages`` for
    speed. After scoring, an ADAPTIVE blur threshold is derived from the p75
    sharpness of the measured pages (the reference's approach), and each page's
    ``blur_score`` is finalised so a soft page is judged against the document's
    own good pages. Returns the number of pages measured. A clean native filing
    has no scan pages, so this returns 0 and costs nothing.
    """
    targets = _quality_targets(ctx, path, max_pages)
    if not targets:
        return 0
    scored = measure_page_quality(path, targets)
    if not scored:
        return 0

    # ── Adaptive blur baseline (ported from detect_blur_pages) ────────────────
    # p75 of the scale-free sharpness across all measured pages: the document's
    # "good page" reference. A page is blurred when it is far below this baseline
    # AND below an absolute ceiling — so a uniformly-soft scan (low p75) is not
    # judged blurry just for being soft, and a sharp doc's one bad page is caught.
    import statistics as _st  # local import keeps module import side-effect free
    sharp_vals = sorted(s["blur"] for s in scored.values() if s["blur"] is not None)
    p75_sharp = None
    if sharp_vals:
        i = min(int(len(sharp_vals) * 0.75), len(sharp_vals) - 1)
        p75_sharp = sharp_vals[i]

    def _is_blurred(sharp: Optional[float]) -> Optional[bool]:
        if sharp is None:
            return None
        if p75_sharp is not None and p75_sharp > 0:
            if sharp < _BLUR_STRONG or sharp < p75_sharp * _BLUR_P75_FRAC_STRONG:
                return True
            if sharp < _BLUR_SLIGHT and sharp < p75_sharp * _BLUR_P75_FRAC_SLIGHT:
                return True
            return False
        # No baseline (single page): fall back to absolute thresholds only.
        return sharp < _BLUR_STRONG

    def _is_severe(sharp: Optional[float]) -> Optional[bool]:
        # STRONGLY blurred: well below the absolute floor OR drastically below the
        # document's own good pages. Such a page is illegible, not merely soft, so
        # it can be surfaced individually (no pervasiveness gate needed).
        if sharp is None:
            return None
        if sharp < _BLUR_STRONG:
            return True
        if p75_sharp is not None and p75_sharp > 0:
            return sharp < p75_sharp * _BLUR_P75_FRAC_STRONG
        return False

    for p in ctx.pages:
        s = scored.get(p.pdf_page_no)
        if s is None:
            continue
        p.dpi = s["dpi"]
        p.blur_score = s["blur"]          # scale-free sharpness (None = not judgeable)
        p.ocr_compatible = s["ocr_compatible"]
        p.blur_flagged = _is_blurred(s["blur"])
        p.blur_severe = _is_severe(s["blur"])
    return len(scored)
