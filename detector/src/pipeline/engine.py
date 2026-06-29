"""
DetectorEngine - synchronous facade over the new pipeline.

Drop-in replacement for the prior engine's public surface (``run`` / ``run_all``)
so the regression harness and server can switch with no API changes. It builds the
DocumentContext once (chunked single parse), instantiates every registered
detector, runs them on a thread pool (they are independent and read-only), runs
the validators, and aggregates into the report dict.

For real-time STREAMING the async :class:`~pipeline.processor.DocumentProcessor`
is used instead; this facade is the simple "build then analyse, return once"
path. Both share :func:`pipeline.aggregate.build_report`.
"""

from __future__ import annotations

import logging
from concurrent.futures import ThreadPoolExecutor, as_completed
from typing import Any, Dict, List, Optional

from .builder import build_context
from .model import DocumentContext
from .base import Detector, DetectorResult
from .finding import Severity, Confidence, Finding
from .registry import detectors_of_kind
from .aggregate import build_report

logger = logging.getLogger(__name__)


class DetectorEngine:
    def __init__(self, pdf_path: str, ctx: Optional[DocumentContext] = None,
                 chunk_size: int = 50):
        self.pdf_path = pdf_path
        self.ctx = ctx if ctx is not None else build_context(pdf_path, chunk_size=chunk_size)
        # Page + filing detectors run unconditionally; conditional + validators
        # are added by their own passes (steps B/C) once registered.
        self._page_classes = (detectors_of_kind("page"))

    # Expose ``doc`` too so existing harness code (eng.doc) keeps working.
    @property
    def doc(self) -> DocumentContext:
        return self.ctx

    def run(self, parallel: bool = True) -> Dict[str, Any]:
        page_dets: List[Detector] = [cls(self.ctx) for cls in self._page_classes]
        results = (self._run_parallel(page_dets) if parallel
                   else self._run_sequential(page_dets))

        # Validators (Stage 7/8) run after page analysis; they consume the same
        # ctx (already holds index + bookmark metadata). Registered in step B.
        for cls in detectors_of_kind("validator"):
            det = cls(self.ctx)
            results[det.name] = self._safe_run(det)

        # Conditional detectors (Stage 6) run only on identified pages; each
        # decides internally whether it applies. Registered in step C.
        for cls in detectors_of_kind("conditional"):
            det = cls(self.ctx)
            results[det.name] = self._safe_run(det)

        return build_report(self.ctx, results)

    def run_all(self, parallel: bool = True) -> Dict[str, Any]:
        return self.run(parallel=parallel)

    # --------------------------------------------------------------- internals
    def _safe_run(self, det: Detector) -> DetectorResult:
        try:
            return det.run()
        except Exception as exc:  # noqa: BLE001
            logger.exception("Detector %s failed", det.name)
            return DetectorResult(
                detector=det.name,
                findings=[Finding(
                    id="detector_error", severity=Severity.WARNING,
                    title=f"{det.name} Failed",
                    description=f"Detector failed with error: {exc}",
                    remediation="Check the PDF and retry; if it persists, report this.",
                    confidence=Confidence.LOW, source=det.name)],
                confidence=Confidence.LOW)

    def _run_sequential(self, dets: List[Detector]) -> Dict[str, DetectorResult]:
        return {d.name: self._safe_run(d) for d in dets}

    def _run_parallel(self, dets: List[Detector]) -> Dict[str, DetectorResult]:
        results: Dict[str, DetectorResult] = {}
        with ThreadPoolExecutor(max_workers=max(1, len(dets))) as ex:
            futures = {ex.submit(self._safe_run, d): d.name for d in dets}
            for fut in as_completed(futures):
                results[futures[fut]] = fut.result()
        ordered = {}
        for d in dets:
            if d.name in results:
                ordered[d.name] = results[d.name]
        return ordered
