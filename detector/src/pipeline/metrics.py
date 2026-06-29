"""
Low-level typography & geometry measurement.

This module turns one raw pdfplumber page into the geometry/typography numbers a
:class:`~pipeline.model.PageMetadata` carries. It is PURE MEASUREMENT - no policy,
no thresholds, no notion of "defect". Policy lives in the detectors.

The measurement algorithms here are PORTED VERBATIM from the prior engine's
``metrics.py`` because they were tuned against the real test_pdf corpus across
three documented precision passes (the band-filter margin bug fix, the mixed-doc
guards, char-level corner folios, OCR pseudo-font exclusion). Rebuilding the
framework around them must NOT discard that hard-won accuracy, so the numbers a
page yields are identical to before; only the surrounding pipeline is new.

Units: pdfplumber reports PDF points (1 pt = 1/72 inch), origin TOP-left, ``top``
increasing downward. All geometry is in points unless a name says ``_cm``.
"""

from __future__ import annotations

import re
from collections import Counter, defaultdict
from dataclasses import dataclass, field
from typing import Dict, List, Optional, Tuple


# --------------------------------------------------------------------------- #
# Tunables for the geometry pass - MEASUREMENT parameters (how we group chars
# into lines, what counts as the header band), not pass/fail policy.
# --------------------------------------------------------------------------- #
_LINE_BUCKET = 2.0        # chars whose baselines fall within this many pt are one line
_HEADER_BAND = 85.0       # pt from the top edge treated as header/folio zone
_FOOTER_BAND = 85.0       # pt from the bottom edge treated as footer/folio zone
_MIN_CHARS_FOR_METRICS = 60   # below this a page is too sparse to measure body type
_MIN_LINE_CHARS = 4       # a "line" with fewer chars than this is treated as noise


@dataclass(frozen=True)
class Line:
    """One physical text line on a page, already aggregated from chars."""
    top: float
    bottom: float
    x0: float
    x1: float
    text: str
    char_count: int
    modal_size: float
    fontnames: Tuple[str, ...]

    @property
    def baseline(self) -> float:
        return self.bottom

    @property
    def width(self) -> float:
        return self.x1 - self.x0


# --------------------------------------------------------------------------- #
# Font-name normalisation (ported verbatim - corpus-tuned).
# --------------------------------------------------------------------------- #
_SUBSET_PREFIX = re.compile(r"^[A-Z]{6}\+")
_STYLE_TOKENS = (
    "bolditalic", "boldoblique", "semibold", "extrabold", "demibold",
    "bold", "italic", "oblique", "regular", "medium", "light", "book",
    "psmt", "ps", "mt",
)
_CANONICAL_FAMILIES = [
    "timesnewroman", "times", "liberationserif", "nimbusroman",
    "arial", "helvetica", "calibri", "cambria", "georgia", "verdana",
    "couriernew", "courier", "garamond", "bookmanoldstyle", "tahoma",
]


def normalize_fontname(raw: str) -> str:
    """Reduce an embedded font name to a comparable family token (corpus-tuned)."""
    if not raw:
        return ""
    name = _SUBSET_PREFIX.sub("", raw)
    name = re.sub(r"[^A-Za-z0-9]", "", name).lower()
    if not name:
        return ""
    for fam in _CANONICAL_FAMILIES:
        if name.startswith(fam):
            return fam
    changed = True
    while changed:
        changed = False
        for tok in _STYLE_TOKENS:
            if name.endswith(tok) and len(name) > len(tok):
                name = name[: -len(tok)]
                changed = True
                break
    return name


TIMES_FAMILY_TOKENS = {
    "timesnewroman", "times", "timesroman", "timesnewromanps", "tnr",
    "liberationserif", "nimbusroman", "nimbusromanno9l",
}
_NON_BODY_FONT_TOKENS = {"hiddenhorzocr", "hiddenhorizontalocr", "glyphlessfont"}


def is_real_body_font(normalized: str) -> bool:
    """False for OCR/hidden pseudo-fonts that must not count as body type."""
    return bool(normalized) and normalized not in _NON_BODY_FONT_TOKENS


# --------------------------------------------------------------------------- #
# Line aggregation, band split, corner folios, physical margins
# (all ported verbatim from the corpus-tuned engine).
# --------------------------------------------------------------------------- #
def _mode(values: List[float], bucket: float) -> Optional[float]:
    if not values:
        return None
    binned = Counter(round(v / bucket) * bucket for v in values)
    return float(binned.most_common(1)[0][0])


def build_lines(chars: List[dict]) -> List[Line]:
    """Aggregate chars into physical lines, top-to-bottom."""
    if not chars:
        return []
    buckets: Dict[int, List[dict]] = defaultdict(list)
    for c in chars:
        key = round(c["top"] / _LINE_BUCKET)
        buckets[key].append(c)

    lines: List[Line] = []
    for key in sorted(buckets):
        cs = buckets[key]
        if len(cs) < _MIN_LINE_CHARS:
            continue
        cs.sort(key=lambda c: c["x0"])
        sizes = [c["size"] for c in cs if c.get("size")]
        fonts = tuple(sorted({c.get("fontname", "") for c in cs if c.get("fontname")}))
        lines.append(Line(
            top=min(c["top"] for c in cs),
            bottom=max(c["bottom"] for c in cs),
            x0=min(c["x0"] for c in cs),
            x1=max(c["x1"] for c in cs),
            text="".join(c["text"] for c in cs).strip(),
            char_count=len(cs),
            modal_size=_mode(sizes, 0.5) or 0.0,
            fontnames=fonts,
        ))
    return lines


def split_bands(lines: List[Line], height: float) -> Tuple[List[Line], List[Line], List[Line]]:
    """Partition lines into (header, body, footer) by vertical band."""
    header, body, footer = [], [], []
    for ln in lines:
        if ln.top < _HEADER_BAND:
            header.append(ln)
        elif ln.bottom > height - _FOOTER_BAND:
            footer.append(ln)
        else:
            body.append(ln)
    return header, body, footer


_CORNER_REGIONS = ("TL", "TC", "TR", "BL", "BC", "BR")
_CORNER_X_MARGIN = 150.0
_CORNER_Y_BAND = 110.0


def corner_tokens(chars: List[dict], width: float, height: float) -> Dict[str, str]:
    """Collect raw token strings from each corner/centre band (char-level)."""
    out: Dict[str, List] = {r: [] for r in _CORNER_REGIONS}
    for c in chars:
        x, y = c["x0"], c["top"]
        top = y < _CORNER_Y_BAND
        bot = y > height - _CORNER_Y_BAND
        if not (top or bot):
            continue
        left = x < _CORNER_X_MARGIN
        right = x > width - _CORNER_X_MARGIN
        band = "T" if top else "B"
        col = "L" if left else ("R" if right else "C")
        out[band + col].append(c)
    result: Dict[str, str] = {}
    for r, cs in out.items():
        cs.sort(key=lambda c: (round(c["top"] / 3), c["x0"]))
        result[r] = "".join(c["text"] for c in cs).strip()
    return result


def _percentile(sorted_vals: List[float], frac: float) -> float:
    if not sorted_vals:
        return 0.0
    idx = min(len(sorted_vals) - 1, max(0, int(len(sorted_vals) * frac)))
    return sorted_vals[idx]


_MARGIN_TRIM = 3


def _trimmed_edge(sorted_vals, trim, from_high):
    if not sorted_vals:
        return None
    if from_high:
        idx = max(0, len(sorted_vals) - 1 - trim)
    else:
        idx = min(len(sorted_vals) - 1, trim)
    return sorted_vals[idx]


# Lines that are NOT main typed body content: signatures, stamps, attestation
# strips, court-fee/seal text, and footer/header furniture. Ported from the
# reference analyzer's ``_MARGIN_NOISE_RE`` + ``_block_is_main_content`` - such
# fragments (often flush to the page edge) must not drive the binding-margin
# measurement, or a stamp on a scanned page produces a false "narrow margin".
_MARGIN_NOISE_RE = re.compile(
    r"(?i)\b("
    r"signature|thumb\s*impression|thumb\s+imprint|deponent|witness|attested|"
    r"attestation|acknowledg(?:e)?ment|place\s+for\s+signature|notary|notaris|"
    r"seal|stamp|court\s+fee|e-?stamp|verified\s+at|sworn\s+before|"
    r"solemnly\s+affirm|true\s+copy|certified\s+copy|authoris(?:ed|ed)\s+signatory|"
    r"advocate\s+on\s+record|counsel\s+for|filed\s+(?:by|on\s+behalf)|"
    r"bar\s+council|enroll?ment\s+no|diary\s+no|filing\s+no|cnr\s+no"
    r")\b"
)


def _line_is_margin_noise(ln: "Line") -> bool:
    """True for short stamp/signature/footer lines that must not set the margin.

    Mirrors the reference's per-block test, line-adapted: skip near-empty lines,
    low-alphanumeric-density (OCR-noise) lines, and short lines matching a
    signature/stamp/footer keyword. Long body lines that merely mention one of
    these words are kept (>= 200 chars).
    """
    txt = (ln.text or "").strip()
    if len(txt) < 5:
        return True
    alnum = sum(c.isalnum() for c in txt)
    if alnum / max(len(txt), 1) < 0.35:
        return True
    if len(txt) < 200 and _MARGIN_NOISE_RE.search(txt):
        return True
    return False


# Lines closer than this (baseline-to-baseline) are treated as one paragraph
# block when reconstructing blocks for margin measurement.
_BLOCK_GAP = 18.0


def _group_into_blocks(lines: List["Line"]) -> List[List["Line"]]:
    """Group vertically-adjacent lines into paragraph blocks.

    Mirrors the granularity of the reference's ``get_text('dict')`` blocks: a run
    of lines with small vertical gaps is one block. Margins are then judged at
    block level (combined text), so a garbled-but-real OCR line is kept when its
    surrounding paragraph is clearly body content - the per-line alnum test alone
    would wrongly drop it.
    """
    if not lines:
        return []
    ordered = sorted(lines, key=lambda l: l.top)
    blocks: List[List["Line"]] = [[ordered[0]]]
    for ln in ordered[1:]:
        prev = blocks[-1][-1]
        if ln.top - prev.bottom <= _BLOCK_GAP:
            blocks[-1].append(ln)
        else:
            blocks.append([ln])
    return blocks


def _block_is_margin_noise(block: List["Line"]) -> bool:
    """Block-level content test, ported from the reference ``_block_is_main_content``.

    A block is noise (excluded from the margin edge) when its COMBINED text is
    near-empty, low-alnum-density (OCR garbage / rules), or a short
    stamp/signature/footer fragment. Judging the whole block - not each line -
    keeps a real paragraph whose individual lines look noisy in isolation.
    """
    txt = " ".join((ln.text or "") for ln in block).strip()
    if len(txt) < 5:
        return True
    alnum = sum(c.isalnum() for c in txt)
    if alnum / max(len(txt), 1) < 0.35:
        return True
    if len(txt) < 200 and _MARGIN_NOISE_RE.search(txt):
        return True
    return False


def _block_left(block: List["Line"]) -> float:
    return min(ln.x0 for ln in block)


def _block_right(block: List["Line"], width: float) -> float:
    return width - max(ln.x1 for ln in block)


_MIN_MARGIN_BLOCKS = 3


def physical_margins(chars, lines, width, height):
    """
    The four physical margins (pt). PORTED to match the reference analyzer's
    ``_get_page_margins_from_blocks`` exactly: reconstruct paragraph BLOCKS, keep
    real content blocks, and measure each margin from the EXTREME edge across them
    (``min`` of block-left, ``min`` of right-gap, etc.).

    This replaces the prior 10th-percentile / supported-edge line approach, which
    drifted inward and over-reported the left (binding) margin, hiding genuinely
    narrow margins on garbled/OCR'd pages (e.g. a 1.0 cm margin read as 2.1 cm).
    Measuring at BLOCK granularity is the reference's robustness mechanism: a
    paragraph that contains a garbled line is still kept (its combined text is
    clearly body content), whereas the same line judged alone looks like noise.

    Steps:
      * restrict to BODY-band lines (header/footer zones excluded);
      * group them into paragraph blocks (``_group_into_blocks``);
      * drop signature/stamp/footer/garbage blocks (``_block_is_margin_noise``);
      * require >= ``_MIN_MARGIN_BLOCKS`` content blocks (else the page is a
        stamp/title/cover page - fall back so a value is still produced);
      * margins = the extreme block edges.
    Returns (left, right, top, bottom) in points.
    """
    if not chars:
        return None, None, None, None

    _, body, _ = split_bands(lines, height) if lines else ([], [], [])

    content_blocks = [b for b in _group_into_blocks(body)
                      if not _block_is_margin_noise(b)]

    if len(content_blocks) >= _MIN_MARGIN_BLOCKS:
        m_left = min(_block_left(b) for b in content_blocks)
        m_right = min(_block_right(b, width) for b in content_blocks)
        m_top = min(min(ln.top for ln in b) for b in content_blocks)
        m_bottom = height - max(max(ln.bottom for ln in b) for b in content_blocks)
        return (max(0.0, m_left), max(0.0, m_right),
                max(0.0, m_top), max(0.0, m_bottom))

    # Too few content blocks (sparse / cover / stamp page): fall back to a noise-
    # filtered line min over the body so a value is still produced, then to raw
    # char extremes if even that is empty.
    clean = [ln for ln in body if not _line_is_margin_noise(ln)]
    if len(clean) < 3:
        clean = [ln for ln in lines if not _line_is_margin_noise(ln)]
    if len(clean) >= 3:
        m_left = min(ln.x0 for ln in clean)
        m_right = width - max(ln.x1 for ln in clean)
        m_top = min(ln.top for ln in clean)
        m_bottom = height - max(ln.bottom for ln in clean)
        return (max(0.0, m_left), max(0.0, m_right),
                max(0.0, m_top), max(0.0, m_bottom))

    ctrim = _MARGIN_TRIM if len(chars) >= 40 else 0
    x0s = sorted(c["x0"] for c in chars)
    x1s = sorted(c["x1"] for c in chars)
    tops = sorted(c["top"] for c in chars)
    bots = sorted(c["bottom"] for c in chars)
    return (max(0.0, _trimmed_edge(x0s, ctrim, from_high=False)),
            max(0.0, width - _trimmed_edge(x1s, ctrim, from_high=True)),
            max(0.0, _trimmed_edge(tops, ctrim, from_high=False)),
            max(0.0, height - _trimmed_edge(bots, ctrim, from_high=True)))


# --------------------------------------------------------------------------- #
# Per-page LEFT / RIGHT margin defect signals.
#
# Calibrated against ground-truth defect pages on the reference Test corpus
# (11_09_2025_14_09_409.pdf, pages 31/37/38/39/40/60/67): a real horizontal-margin
# defect is a page where the body text BLOCK genuinely runs very close to the page
# edge AND a substantial fraction of its lines do so - distinguishing a
# pervasively-narrow scanned/form page from a clean-prose page whose low minimum
# is just one stray glyph. Precision-over-recall: these thresholds give zero
# false positives on that document (one sparse/garbled page is intentionally not
# flagged rather than admit false positives).
#
# The RIGHT side is the mirror of the LEFT: instead of each line's distance from
# the left page edge (``x0``) we use its distance from the right page edge
# (``width - x1``). The thresholds are shared - the geometry is symmetric.
# --------------------------------------------------------------------------- #
_EDGE_DEFECT_BLOCK_MIN_CM = 1.5   # narrowest real content block must be below this (cm)
_EDGE_DEFECT_EDGE_CM = 2.0        # a line "runs to the edge" when within this of the edge
_EDGE_DEFECT_NARROW_FRAC = 0.35   # >= this fraction of body lines must run to the edge
_EDGE_DEFECT_MIN_LINES = 8        # too few body lines to judge -> no verdict
_CM_PT = 28.3465                  # points per cm (local; units.CM not imported here)

# Back-compat aliases (the LEFT names are referenced by the detector module).
_LEFT_DEFECT_BLOCK_MIN_CM = _EDGE_DEFECT_BLOCK_MIN_CM
_LEFT_DEFECT_EDGE_CM = _EDGE_DEFECT_EDGE_CM
_LEFT_DEFECT_NARROW_FRAC = _EDGE_DEFECT_NARROW_FRAC
_LEFT_DEFECT_MIN_LINES = _EDGE_DEFECT_MIN_LINES


def _edge_defect_signal(body_lines, edge_dist):
    """Generic per-page horizontal-margin defect signal for one side.

    ``edge_dist(line)`` returns that line's distance (pt) from the page edge being
    measured (``x0`` for left; ``width - x1`` for right).

    Returns (block_min_cm, narrow_frac):
      block_min_cm: narrowest real CONTENT block's distance from the edge (noise
                    blocks excluded), in cm - the true position of the body text.
      narrow_frac:  fraction of body lines that run within the edge threshold -
                    high on pervasively-narrow form/scan pages, low when only a
                    stray block reaches the edge on an otherwise normal page.
    Returns (None, None) when there are too few body lines to judge.
    """
    real = [ln for ln in body_lines if ln.text and len(ln.text.strip()) >= 5]
    if len(real) < _EDGE_DEFECT_MIN_LINES:
        return None, None
    blocks = [b for b in _group_into_blocks(real) if not _block_is_margin_noise(b)]

    # A genuine narrow margin is body text NEAR the edge (0..threshold), not text
    # drawn PAST the page boundary - a negative distance is an OCR/layout artifact
    # (glyphs placed beyond the page on a garbled scan), not a real defect. Clamp
    # such overflow out of both the block-min and the pervasiveness fraction.
    def _block_dist(b):
        return min(edge_dist(ln) for ln in b if edge_dist(ln) >= 0.0)
    valid_blocks = [b for b in blocks if any(edge_dist(ln) >= 0.0 for ln in b)]
    if valid_blocks:
        block_min = min(_block_dist(b) for b in valid_blocks)
    else:
        inside = [edge_dist(ln) for ln in real if edge_dist(ln) >= 0.0]
        if not inside:
            return None, None
        block_min = min(inside)
    block_min_cm = block_min / _CM_PT
    edge_pt = _EDGE_DEFECT_EDGE_CM * _CM_PT
    narrow_frac = sum(1 for ln in real if 0.0 <= edge_dist(ln) < edge_pt) / len(real)
    return round(block_min_cm, 3), round(narrow_frac, 3)


def left_margin_defect_signal(body_lines: List["Line"], width: float):
    """(block_min_cm, narrow_frac) for the per-page LEFT-margin defect rule."""
    return _edge_defect_signal(body_lines, lambda ln: ln.x0)


def right_margin_defect_signal(body_lines: List["Line"], width: float):
    """(block_min_cm, narrow_frac) for the per-page RIGHT-margin defect rule."""
    return _edge_defect_signal(body_lines, lambda ln: width - ln.x1)


@dataclass(frozen=True)
class GeometryResult:
    """Bundle of measured geometry returned by :func:`measure_chars`."""
    body_lines: Tuple[Line, ...]
    header_lines: Tuple[Line, ...]
    footer_lines: Tuple[Line, ...]
    body_size: Optional[float]
    line_gap: Optional[float]
    margin_left: Optional[float]
    margin_right: Optional[float]
    margin_top: Optional[float]
    margin_bottom: Optional[float]
    font_counts: Dict[str, int] = field(default_factory=dict)
    corner_raw: Dict[str, str] = field(default_factory=dict)
    left_block_min_cm: Optional[float] = None
    left_narrow_frac: Optional[float] = None
    right_block_min_cm: Optional[float] = None
    right_narrow_frac: Optional[float] = None


def measure_chars(chars: List[dict], width: float, height: float) -> GeometryResult:
    """
    Run the full native geometry math over a page's chars. Mirrors the prior
    engine's ``_page_metrics`` body exactly (margins independent of band split,
    body size/line-gap from band-filtered body lines).
    """
    all_lines = build_lines(chars)
    header, body, footer = split_bands(all_lines, height)

    font_counts: Counter = Counter()
    for c in chars:
        fn = c.get("fontname")
        if fn:
            font_counts[fn] += 1

    body_size = line_gap = m_left = m_right = m_top = m_bottom = None
    left_block_min = left_narrow = right_block_min = right_narrow = None
    if len(chars) >= _MIN_CHARS_FOR_METRICS:
        m_left, m_right, m_top, m_bottom = physical_margins(chars, all_lines, width, height)
        left_block_min, left_narrow = left_margin_defect_signal(body, width)
        right_block_min, right_narrow = right_margin_defect_signal(body, width)
    if len(chars) >= _MIN_CHARS_FOR_METRICS and body:
        body_sizes = [ln.modal_size for ln in body if ln.modal_size]
        body_size = _mode(body_sizes, 0.5)
        tops = sorted(ln.top for ln in body)
        gaps = [b - a for a, b in zip(tops, tops[1:]) if 4 <= (b - a) <= 60]
        line_gap = _mode(gaps, 1.0)

    return GeometryResult(
        body_lines=tuple(body), header_lines=tuple(header), footer_lines=tuple(footer),
        body_size=body_size, line_gap=line_gap,
        margin_left=m_left, margin_right=m_right, margin_top=m_top, margin_bottom=m_bottom,
        font_counts=dict(font_counts),
        corner_raw=corner_tokens(chars, width, height),
        left_block_min_cm=left_block_min, left_narrow_frac=left_narrow,
        right_block_min_cm=right_block_min, right_narrow_frac=right_narrow,
    )


# --------------------------------------------------------------------------- #
# OCR adaptation (ported verbatim - OCR box height calibration + geometry math).
# --------------------------------------------------------------------------- #
_OCR_SIZE_CAL = 1.08


def _ocr_line_to_native(ocr_line) -> Line:
    return Line(
        top=ocr_line.top, bottom=ocr_line.bottom,
        x0=ocr_line.x0, x1=ocr_line.x1,
        text=ocr_line.text, char_count=len(ocr_line.text),
        modal_size=ocr_line.height * _OCR_SIZE_CAL,
        fontnames=(),
    )


def measure_ocr(ocr_page) -> GeometryResult:
    """Run the SAME geometry math over OCR line boxes (source-agnostic)."""
    width, height = ocr_page.width, ocr_page.height
    native_lines = [_ocr_line_to_native(ln) for ln in ocr_page.lines
                    if ln.text and (ln.x1 - ln.x0) > 0]
    header, body, footer = split_bands(native_lines, height)

    body_size = line_gap = m_left = m_right = m_top = m_bottom = None
    if len(body) >= 3:
        body_sizes = [ln.modal_size for ln in body if ln.modal_size]
        body_size = _mode(body_sizes, 0.5)
        # Same block-based measurement as the native path (reference parity): group
        # OCR lines into paragraph blocks, drop noise blocks, take the extreme
        # block edges. OCR text is the noisiest case, so judging whole blocks
        # (not lone garbled lines) is what keeps a real narrow margin from being
        # discarded - exactly the case this fixes.
        content_blocks = [b for b in _group_into_blocks(body)
                          if not _block_is_margin_noise(b)]
        if len(content_blocks) >= _MIN_MARGIN_BLOCKS:
            m_left = min(_block_left(b) for b in content_blocks)
            m_right = min(_block_right(b, width) for b in content_blocks)
            m_top = min(min(ln.top for ln in b) for b in content_blocks)
            m_bottom = height - max(max(ln.bottom for ln in b) for b in content_blocks)
        else:
            m_left = min(ln.x0 for ln in body)
            m_right = width - max(ln.x1 for ln in body)
            m_top = min(ln.top for ln in body)
            m_bottom = height - max(ln.bottom for ln in body)
        tops = sorted(ln.top for ln in body)
        gaps = [b - a for a, b in zip(tops, tops[1:]) if 4 <= (b - a) <= 80]
        line_gap = _mode(gaps, 1.0)

    left_block_min, left_narrow = left_margin_defect_signal(body, width)
    right_block_min, right_narrow = right_margin_defect_signal(body, width)
    return GeometryResult(
        body_lines=tuple(body), header_lines=tuple(header), footer_lines=tuple(footer),
        body_size=body_size, line_gap=line_gap,
        margin_left=m_left, margin_right=m_right, margin_top=m_top, margin_bottom=m_bottom,
        font_counts={}, corner_raw={},
        left_block_min_cm=left_block_min, left_narrow_frac=left_narrow,
        right_block_min_cm=right_block_min, right_narrow_frac=right_narrow,
    )
