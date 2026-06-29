"""
Report aggregation — turn a set of DetectorResults into the engine report dict.

Shared by the synchronous facade and the async processor so both emit an
identical report shape (the same contract the prior engine produced, so the
server normalisation layer is unchanged).
"""

from __future__ import annotations

from typing import Any, Dict, List

from .base import DetectorResult
from .model import DocumentContext


def build_report(ctx: DocumentContext,
                 results: Dict[str, DetectorResult]) -> Dict[str, Any]:
    findings = []
    for res in results.values():
        findings.extend(res.findings)

    findings.sort(key=lambda f: (f.page or 999, f.severity.rank))

    summary = {"critical_count": 0, "warning_count": 0, "minor_count": 0,
               "total_count": len(findings)}
    for f in findings:
        summary[f"{f.severity.value}_count"] += 1

    confidences = [r.confidence for r in results.values()]
    total_conf = round(sum(confidences) / len(confidences), 2) if confidences else 0.0

    return {
        "detectors": {name: res.to_dict() for name, res in results.items()},
        "defects": [f.to_dict() for f in findings],
        "total_confidence": total_conf,
        "summary": summary,
        "index": {"entries": len(ctx.index_entries)},
        "bookmarks": {"count": len(ctx.bookmarks)},
        "ocr": {
            "used": getattr(ctx, "ocr_used", False),
            "pages": getattr(ctx, "ocr_pages", 0),
        },
    }
