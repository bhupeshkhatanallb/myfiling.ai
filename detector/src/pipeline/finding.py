"""
Finding value objects — the unit of detector output.

A :class:`Finding` is one defect (or honest "could not verify" note). It is
deliberately UI-agnostic: the server layer maps it to the frontend contract.
Severity and Confidence are small enums so call-sites are self-documenting and
the aggregation logic can reason about them numerically.

(Ported from the prior engine. The Finding contract is stable across the rewrite
so the server normalisation layer keeps working; the new ``detector`` field on
``to_dict`` and the ``kind`` taxonomy are additive.)
"""

from __future__ import annotations

from dataclasses import dataclass, field
from enum import Enum
from typing import Any, Dict


class Severity(str, Enum):
    CRITICAL = "critical"   # Registry will object; blocks acceptance
    WARNING = "warning"     # deviates from spec / norm; likely curable
    MINOR = "minor"         # advisory, or "could not verify"

    @property
    def rank(self) -> int:
        return {"critical": 0, "warning": 1, "minor": 2}[self.value]


class Confidence(float, Enum):
    """
    Coarse confidence tiers. Using a small enum (rather than arbitrary floats)
    keeps detectors honest and comparable: a finding is HIGH only when the
    measurement is unambiguous, MEDIUM when reasonable but tolerant, LOW when we
    are surfacing metadata we are not sure about.
    """
    HIGH = 0.92
    MEDIUM = 0.80
    LOW = 0.60
    UNVERIFIED = 0.55


@dataclass
class Finding:
    id: str
    severity: Severity
    title: str
    description: str
    remediation: str
    page: int = 1
    confidence: Confidence = Confidence.HIGH
    # Free-form measured evidence (e.g. {"left_cm": 2.3}) for transparency/UI.
    evidence: Dict[str, Any] = field(default_factory=dict)
    source: str = ""        # detector name, filled in by the sink/processor

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "severity": self.severity.value,
            "page": self.page,
            "title": self.title,
            "description": self.description,
            "remediation": self.remediation,
            "confidence": float(self.confidence),
            "evidence": self.evidence,
            "source_detector": self.source,
        }
