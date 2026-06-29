"""
DocumentProcessor - async orchestration with real-time defect streaming.

This is the brief's top-level ``DocumentProcessor``. It walks the eight stages and
emits events as they happen so the frontend can show progress and defects LIVE:

    progress  {stage, page, total}     - pipeline advancing
    defect    {<finding dict>}         - a defect, the moment a detector finds it
    summary   {<report dict>}          - final aggregated report
    done      {}                       - stream complete

Concurrency model: the CPU-bound parse + detectors run in worker threads (they are
the same pure-Python analysers the sync engine uses); the async layer's job is to
own the event queue and yield events to the SSE response as they arrive. Each
detector is given an ``on_finding`` callback that enqueues a ``defect`` event the
instant a finding is accepted by its DefectSink (so the 20-cap and streaming share
one path).

The synchronous :class:`~pipeline.engine.DetectorEngine` remains the simple
"return once" path; this processor is used by the streaming endpoint.
"""

from __future__ import annotations

import asyncio
import logging
from dataclasses import dataclass
from typing import Any, AsyncIterator, Callable, Dict, List, Optional

from .builder import build_context
from .model import DocumentContext
from .base import Detector, DetectorResult
from .finding import Finding, Severity, Confidence
from .registry import detectors_of_kind
from .aggregate import build_report

logger = logging.getLogger(__name__)


@dataclass
class Event:
    """One streamed event (serialised to SSE by the server)."""
    type: str               # "progress" | "defect" | "summary" | "done" | "error"
    data: Dict[str, Any]


class DocumentProcessor:
    """Async, streaming orchestration of the scrutiny pipeline."""

    def __init__(self, pdf_path: str, chunk_size: int = 50,
                 max_pages: Optional[int] = None, enable_ocr: bool = True):
        self.pdf_path = pdf_path
        self.chunk_size = chunk_size
        # Cap the number of pages parsed/analysed. None = no cap. Used to keep
        # peak memory bounded on small instances (e.g. a 512 MB free tier OOMs on
        # very large scanned filings).
        self.max_pages = max_pages
        self.enable_ocr = enable_ocr
        self.ctx: Optional[DocumentContext] = None

    # ---- public streaming API -------------------------------------------- #
    async def stream(self) -> AsyncIterator[Event]:
        """
        Yield pipeline events as they occur. The consumer (SSE endpoint) simply
        serialises each Event. Guarantees a terminal ``done`` (or ``error``) event.
        """
        queue: "asyncio.Queue[Optional[Event]]" = asyncio.Queue()
        loop = asyncio.get_running_loop()

        def emit(ev: Event) -> None:
            # Thread-safe hand-off from worker threads to the async queue.
            loop.call_soon_threadsafe(queue.put_nowait, ev)

        async def worker() -> None:
            try:
                # run_in_executor (not asyncio.to_thread, which is 3.9+) keeps the
                # CPU-bound pipeline off the event loop on Python 3.8.
                await loop.run_in_executor(None, self._run_pipeline, emit)
            except Exception as exc:  # noqa: BLE001
                logger.exception("Pipeline failed")
                emit(Event("error", {"message": str(exc)}))
            finally:
                loop.call_soon_threadsafe(queue.put_nowait, None)  # sentinel

        task = asyncio.create_task(worker())
        try:
            while True:
                ev = await queue.get()
                if ev is None:
                    break
                yield ev
        finally:
            await task

    # ---- the staged pipeline (runs in a worker thread) -------------------- #
    def _run_pipeline(self, emit: Callable[[Event], None]) -> None:
        # Stages 1-3 + 5 + (2 index/bookmark) + (4 quality) all happen inside
        # build_context (single chunked parse). We pass a progress callback so the
        # parse of each chunk AND each OCR'd page stream live - otherwise a long or
        # scanned document looks frozen until the detector phase.
        emit(Event("progress", {"stage": "parsing", "page": 0, "total": 0}))

        def on_parse_progress(ev: dict) -> None:
            # ev: {stage: "parsing"|"ocr", page, total, [pdf_page]}
            emit(Event("progress", ev))

        self.ctx = build_context(self.pdf_path, chunk_size=self.chunk_size,
                                 max_pages=self.max_pages, enable_ocr=self.enable_ocr,
                                 on_progress=on_parse_progress)
        ctx = self.ctx
        total = ctx.page_count
        emit(Event("progress", {"stage": "parsed", "page": total, "total": total,
                                "index_entries": len(ctx.index_entries),
                                "bookmarks": len(ctx.bookmarks),
                                "ocr_used": ctx.ocr_used}))

        results: Dict[str, DetectorResult] = {}

        def run_group(kind: str, stage: str) -> None:
            classes = detectors_of_kind(kind)
            for i, cls in enumerate(classes):
                emit(Event("progress", {"stage": stage, "detector": cls.__name__,
                                        "page": i + 1, "total": len(classes)}))
                det = cls(ctx, on_finding=lambda f: emit(Event("defect", f.to_dict())))
                results[det.name] = self._safe_run(det)

        # Stage 4: page detectors (incl. filing + quality, registered as "page").
        run_group("page", "page-detectors")
        # Stage 6: conditional detectors (run only on identified pages).
        run_group("conditional", "conditional-detectors")
        # Stage 7/8: validators (index + bookmark), after all pages analysed.
        run_group("validator", "validators")

        report = build_report(ctx, results)
        emit(Event("summary", report))
        emit(Event("done", {}))

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

    # ---- non-streaming convenience (collect the stream) ------------------- #
    def run(self) -> Dict[str, Any]:
        """Run the full pipeline and return the final report (no streaming)."""
        results: Dict[str, DetectorResult] = {}
        captured: Dict[str, Any] = {}

        def emit(ev: Event) -> None:
            if ev.type == "summary":
                captured["report"] = ev.data

        self._run_pipeline(emit)
        return captured.get("report", {})
