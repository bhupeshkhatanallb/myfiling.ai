"""
myfiling.ai detector pipeline (V2 rewrite).

A from-scratch scrutiny pipeline built to the rewrite brief:

  Stage 1  ChunkReader        — single chunked parse (memory-bounded, streamable)
  Stage 2  Index/Bookmark     — extract index entries + PDF outline
  Stage 3  MetadataBuilder    — shared PageMetadata (the single source of truth)
  Stage 4  Page detectors     — margin/paper/font/spacing/page-number (parallel)
  Stage 5  Page numbering      — written-number assignment (numbering may start late)
  Stage 6  Conditional        — synopsis/cause-title/vakalatnama/affidavit/annexure
  Stage 7  IndexValidator     — index claims vs actual page metadata
  Stage 8  BookmarkValidator  — outline presence + accuracy

The corpus-tuned DECISION LOGIC of every detector is ported verbatim from the
prior engine, so accuracy is preserved; the pipeline, chunking, shared metadata
model, conditional routing, validators, defect cap and streaming are new.

Public surface::

    from pipeline import DetectorEngine, build_context
    report = DetectorEngine(pdf_path).run()             # synchronous

    from pipeline.processor import DocumentProcessor     # streaming (step D)
"""

from .builder import build_context
from .model import (
    DocumentContext, PageMetadata, IndexEntry, Bookmark, classify_paper,
)
from .finding import Finding, Severity, Confidence
from .base import Detector, DetectorResult, DefectSink, MAX_DEFECTS_PER_DETECTOR
from .registry import register, all_detectors, detectors_of_kind
from .engine import DetectorEngine

# Importing the detectors package triggers @register on every detector.
from . import detectors  # noqa: F401,E402
# Validators register here too once they exist (step B).
from . import validators  # noqa: F401,E402

__all__ = [
    "build_context", "DocumentContext", "PageMetadata", "IndexEntry", "Bookmark",
    "classify_paper", "Finding", "Severity", "Confidence",
    "Detector", "DetectorResult", "DefectSink", "MAX_DEFECTS_PER_DETECTOR",
    "register", "all_detectors", "detectors_of_kind", "DetectorEngine",
]
