"""
Detector base class, result container, and the defect sink.

A detector is a small, stateless analyser over the shared DocumentContext. It:
  * never opens the PDF (it reads ``self.ctx``),
  * never sees other detectors,
  * prefers emitting nothing over emitting a low-confidence defect.

The OCR-awareness helpers (confidence knock-down, CRITICAL->WARNING precision
guard, "could not verify" exit) are PORTED from the prior engine's Detector base
because they encode corpus-tuned precision policy.

``DefectSink`` is new in the rewrite: it enforces the per-detector 20-defect cap
(Stage / "Defect Cap" in the brief) and pushes each finding to an optional
callback for real-time streaming.
"""

from __future__ import annotations

from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import Any, Callable, Dict, List, Optional

from .model import DocumentContext
from .finding import Finding, Severity, Confidence


# Per-detector defect cap (the brief: "Maximum defects = 20" per detector).
MAX_DEFECTS_PER_DETECTOR = 20


@dataclass
class DetectorResult:
    detector: str
    findings: List[Finding] = field(default_factory=list)
    details: Dict[str, Any] = field(default_factory=dict)
    confidence: float = Confidence.HIGH
    capped: bool = False              # True if the 20-defect cap truncated output

    @property
    def passed(self) -> bool:
        return not self.findings

    def to_dict(self) -> Dict[str, Any]:
        return {
            "detector": self.detector,
            "detected": self.passed,
            "confidence": round(float(self.confidence), 2),
            "details": self.details,
            "capped": self.capped,
            "defects": [f.to_dict() for f in self.findings],
        }


class DefectSink:
    """
    Collects a single detector's findings, enforces the 20-defect cap, and
    streams each accepted finding to an optional callback as it arrives.

    A detector that produces findings one-by-one can ``push`` them and check
    :pyattr:`full` to stop early (the brief: "found 20 defects -> immediately stop
    further analysis" for that detector). Detectors that build a small fixed list
    can just hand it to :meth:`extend`.
    """

    def __init__(self, detector_name: str,
                 on_finding: Optional[Callable[[Finding], None]] = None,
                 cap: int = MAX_DEFECTS_PER_DETECTOR):
        self.detector_name = detector_name
        self._on_finding = on_finding
        self._cap = cap
        self.findings: List[Finding] = []
        self.capped = False

    @property
    def full(self) -> bool:
        return len(self.findings) >= self._cap

    def push(self, finding: Finding) -> bool:
        """Accept one finding. Returns False once the cap is reached."""
        if self.full:
            self.capped = True
            return False
        finding.source = self.detector_name
        self.findings.append(finding)
        if self._on_finding is not None:
            self._on_finding(finding)
        return not self.full

    def extend(self, findings: List[Finding]) -> None:
        for f in findings:
            if not self.push(f):
                break


class Detector(ABC):
    """Abstract analyser over a shared DocumentContext."""

    #: Stable detector identity (used in API rule labels & UI). Override.
    name: str = "Detector"
    #: Human rule label shown in the UI.
    rule: str = "Supreme Court Rules, 2013"
    #: Taxonomy for the registry/processor: "page" | "conditional" | "validator".
    kind: str = "page"

    def __init__(self, ctx: DocumentContext,
                 on_finding: Optional[Callable[[Finding], None]] = None):
        self.ctx = ctx
        self._sink = DefectSink(self.name, on_finding=on_finding)

    @abstractmethod
    def run(self) -> DetectorResult:
        """Analyse ``self.ctx`` and return findings + details."""
        raise NotImplementedError

    # ---- convenience builders (ported precision policy) ------------------- #
    def result(self, *, details: Dict[str, Any], findings: List[Finding],
               confidence: float, _ocr_annotate: bool = True) -> DetectorResult:
        # When reading OCR text, every finding is less certain: cap its
        # confidence, annotate its description, downgrade CRITICAL->WARNING.
        if self.on_ocr and _ocr_annotate:
            details = {**details, "source": "ocr",
                       "ocr_pages": getattr(self.ctx, "ocr_pages", 0)}
            confidence = self.ocr_confidence(confidence)
            for f in findings:
                if float(f.confidence) > float(Confidence.LOW):
                    f.confidence = Confidence.LOW
                if f.severity == Severity.CRITICAL:
                    f.severity = Severity.WARNING
                f.description = self.ocr_note(f.description)
        # Funnel through the sink so the 20-cap + streaming apply uniformly.
        self._sink.extend(findings)
        return DetectorResult(
            detector=self.name, findings=self._sink.findings,
            details=details, confidence=confidence, capped=self._sink.capped)

    def unverified(self, *, fid: str, what: str, page: int = 1) -> DetectorResult:
        """Standard graceful exit for a document we could NOT read."""
        f = Finding(
            id=fid, severity=Severity.MINOR,
            title=f"{what} Could Not Be Verified (Scanned Document)",
            description=("The document appears scanned/image-based or its text is "
                         "garbled, and OCR could not recover readable text, so this "
                         "check could not be performed automatically."),
            remediation="Re-upload a text-based PDF, or verify this requirement manually.",
            page=page, confidence=Confidence.UNVERIFIED,
        )
        return self.result(details={"verifiable": False}, findings=[f],
                           confidence=Confidence.UNVERIFIED, _ocr_annotate=False)

    # ---- OCR-awareness helpers (ported) ----------------------------------- #
    @property
    def on_ocr(self) -> bool:
        return getattr(self.ctx, "ocr_used", False)

    def ocr_confidence(self, base: float) -> float:
        if not self.on_ocr:
            return base
        return min(base, float(Confidence.LOW))

    def ocr_note(self, description: str) -> str:
        if not self.on_ocr:
            return description
        return (description + " (Read via OCR from a scanned document - verify "
                "manually, as OCR text can contain errors.)")
