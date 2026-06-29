"""
Capability gates shared by the geometry/typography detectors.

Ported from the prior engine's formatting.py. A gate returns a graceful
"could not verify" DetectorResult when the document lacks the capability a
detector needs, else None (proceed).
"""

from __future__ import annotations

from typing import Optional

from .base import Detector, DetectorResult


def geometry_gate(det: Detector, fid: str, what: str) -> Optional[DetectorResult]:
    """POSITION-based gate (margins): needs measurable geometry, native OR OCR."""
    if not det.ctx.has_geometry:
        return det.unverified(fid=fid, what=what)
    return None


def typography_gate(det: Detector, fid: str, what: str) -> Optional[DetectorResult]:
    """TYPE-quality gate (font/size/spacing/quotations): needs a clean text layer."""
    if not det.ctx.reliable_typography:
        return det.unverified(fid=fid, what=what)
    return None


def text_gate(det: Detector, fid: str, what: str) -> Optional[DetectorResult]:
    """TEXT gate (filing-requirement/structure checks): needs readable text."""
    if not det.ctx.text_scrutinizable:
        return det.unverified(fid=fid, what=what)
    return None
