"""
myfiling.ai — Production application server.

Single entry point that:
  1. Serves the compiled dashboard (static files) at /
  2. Exposes POST /api/analyze — runs the REAL detector engine on an uploaded PDF
  3. Exposes GET  /api/health — liveness/readiness probe

Run:
    python server.py
    # or: uvicorn server:app --host 0.0.0.0 --port 8000

The detector engine lives in detector/src. We import it directly so the API and
the detectors share one source of truth (no duplicated logic).
"""

import os
import sys
import json
import logging
import tempfile
from pathlib import Path
from datetime import datetime, timezone
from typing import Any, Dict, List

from contextlib import asynccontextmanager

from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.responses import JSONResponse, StreamingResponse
from fastapi.staticfiles import StaticFiles

# --------------------------------------------------------------------------- #
# Wiring: make the detector package importable.
# detector/src contains the `detectors` package and `main.py`.
# --------------------------------------------------------------------------- #
ROOT = Path(__file__).resolve().parent
DETECTOR_SRC = ROOT / "detector" / "src"
DASHBOARD_DIR = ROOT / "dashboard"

sys.path.insert(0, str(DETECTOR_SRC))

# V2 rewrite: the scrutiny pipeline replaces the old detector engine. The
# synchronous DetectorEngine facade keeps the same run_all() contract; the async
# DocumentProcessor drives real-time streaming.
from pipeline import DetectorEngine  # noqa: E402  (import after sys.path tweak)
from pipeline.processor import DocumentProcessor  # noqa: E402

import recents_db  # noqa: E402  — SQLite-backed recent-filings store

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-7s  %(name)s  %(message)s",
)
logger = logging.getLogger("myfiling.server")

# Limits and validation ------------------------------------------------------ #
MAX_UPLOAD_BYTES = 50 * 1024 * 1024  # 50 MB — matches the dashboard hint
ENABLED_COURTS = {"dhc"}             # Only Delhi High Court is live (see courts.js)

# Resource caps (tunable via env for small instances, e.g. a 512 MB free tier).
# MAX_ANALYZE_PAGES bounds peak memory on very large scanned filings; 0/unset =
# no cap. OCR is heavy and usually absent on a free host, so it defaults off here.
_MAX_ANALYZE_PAGES = int(os.environ.get("MAX_ANALYZE_PAGES", "0")) or None
_ENABLE_OCR = os.environ.get("ENABLE_OCR", "false").lower() in ("1", "true", "yes", "on")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: ensure the recents SQLite store exists.
    recents_db.init_db()
    logger.info("Recent-filings DB ready at %s", recents_db.DB_PATH)
    yield
    # Shutdown: nothing to tear down (connections are per-call).


app = FastAPI(
    title="myfiling.ai API",
    description="Legal filing defect analysis — real detector engine.",
    version="1.0.0",
    lifespan=lifespan,
)


# --------------------------------------------------------------------------- #
# Scoring — mirrors detector/src/main.py:calculate_score so the API and CLI
# pipeline agree. Kept here to avoid importing the half-built main module chain.
# --------------------------------------------------------------------------- #
def _human_size(num_bytes: int) -> str:
    """Human-readable file size, e.g. '512 KB' or '3.4 MB'."""
    if num_bytes < 1024 * 1024:
        return f"{max(1, round(num_bytes / 1024))} KB"
    return f"{num_bytes / (1024 * 1024):.1f} MB"


def calculate_score(defects: List[Dict[str, Any]]) -> int:
    """
    Filing-readiness score (0-100), re-weighted per the advocate audit so it
    correlates with REAL registry-objection risk rather than raw defect count.

    Model rationale:
      * CRITICALs are genuine "papers will bounce" defects (missing index, no
        pagination, duplicate folios, binding-loss margin). They dominate the
        score: one critical lands you in the "must fix" band.
      * WARNINGs are "the Office is likely to raise an objection" items (margins
        off, court fee / vakalatnama / affidavit / certified copy not detected).
        They matter, but a clean petition with one or two should still read as
        "largely ready" (~80s) — so warnings are taxed gently and floored.
      * MINORs are advisory / could-not-verify notes; they barely move the score.

    This deliberately stops cosmetic/advisory items from dragging an otherwise
    filable petition into a scary band (the old model's main flaw).
    """
    critical = sum(1 for d in defects if d.get("severity") == "critical")
    warning = sum(1 for d in defects if d.get("severity") == "warning")
    minor = sum(1 for d in defects if d.get("severity") == "minor")

    if critical > 0:
        # Genuine bounce: start at 45 (top of the "must fix" band) and drop per
        # additional critical. Warnings/minors nudge but can't lift out of risk.
        score = 45 - (critical - 1) * 12 - warning * 2 - minor
    else:
        # No bounce defects: start from 100, tax warnings moderately and minors
        # lightly, but floor at 80 so advisory-only results stay "largely ready".
        score = 100 - warning * 6 - minor * 2
        score = max(80, score) if warning <= 2 else score
        score = max(55, score)   # several warnings can reach the mid band
    return max(0, min(100, score))


# --------------------------------------------------------------------------- #
# Normalization — the React UI expects each defect as:
#   { id, page, severity, title, desc, rule, fix }
# The detectors emit:
#   { id, page, severity, title, description, remediation, source_detector }
# We translate here so the frontend contract is honored exactly.
# --------------------------------------------------------------------------- #
# Live court = Delhi High Court. Formatting rules are sourced from DHC Practice
# Direction 74 / DHC Rules; the measured spec (A4 / Times New Roman / 14 pt / 1.5 /
# 4-4-2-2 cm) is identical to the SC uniform standard, so the detectors are
# unchanged — only the citation label reflects the filing court.
DETECTOR_RULE_LABEL = {
    "IndexFormatDetector": "DHC Rules - Index of record",
    "PageNumberingDetector": "DHC Rules - Pagination",
    "SectionOrderDetector": "DHC Rules - Arrangement of paper-book",
    "PaperSizeDetector": "DHC PD 74 - Paper size (A4)",
    "TextLayerDetector": "DHC e-filing - Searchable (OCR'd) text required",
    "MarginDetector": "DHC PD 74 - Margins (4/4/2/2 cm)",
    "FontFamilyDetector": "DHC PD 74 - Type face (Times New Roman)",
    "BodyFontSizeDetector": "DHC PD 74 - Body type size (14 pt)",
    "FontSizeDetector": "DHC PD 74 - Body type size (14 pt)",  # legacy id
    "LineSpacingDetector": "DHC PD 74 - Line spacing (1.5)",
    "QuotationBlockDetector": "DHC PD 74 - Quotations (12 pt, single)",
    # Filing-requirement (will-bounce) detectors.
    "CourtFeeDetector": "DHC Rules - Court fees",
    "LimitationDetector": "Limitation Act / DHC Rules - Condonation of delay",
    "CertifiedCopyDetector": "DHC Rules - Certified copy of impugned order",
    "VakalatnamaDetector": "DHC Rules - Vakalatnama / appearance",
    "AffidavitDetector": "DHC Rules - Affidavit in support",
}


def _normalize_defect(d: Dict[str, Any]) -> Dict[str, Any]:
    source = d.get("source_detector", "")
    return {
        "id": d.get("id"),
        "page": d.get("page", 1),
        "severity": d.get("severity", "minor"),
        "title": d.get("title", "Defect"),
        "desc": d.get("description", ""),
        "rule": DETECTOR_RULE_LABEL.get(source, "Delhi High Court Rules"),
        "fix": d.get("remediation", ""),
        # v3: surface per-finding confidence + measured evidence to the UI.
        "confidence": d.get("confidence"),
        "evidence": d.get("evidence", {}),
    }


def _build_stats(detector_results: Dict[str, Any]) -> Dict[str, Any]:
    """Pull real numbers out of detector `details` for the results sidebar."""
    detectors = detector_results.get("detectors", {})

    page_det = detectors.get("PageNumberingDetector", {}).get("details", {})
    idx_det = detectors.get("IndexFormatDetector", {}).get("details", {})
    sec_det = detectors.get("SectionOrderDetector", {}).get("details", {})
    paper_det = detectors.get("PaperSizeDetector", {}).get("details", {})
    margin_det = detectors.get("MarginDetector", {}).get("details", {})
    # v3: body size lives in BodyFontSizeDetector (FontSizeDetector kept as fallback).
    font_src = detectors.get("BodyFontSizeDetector") or detectors.get("FontSizeDetector", {})
    font_det = font_src.get("details", {})
    fam_det = detectors.get("FontFamilyDetector", {}).get("details", {})
    spacing_det = detectors.get("LineSpacingDetector", {}).get("details", {})

    pages_scanned = page_det.get("total_pages", 0)
    sections_found = sec_det.get("sections_found", [])
    index_entries = idx_det.get("entries_count", 0)

    # Per-check breakdown for the "Checks evaluated" collapsible panel.
    checks = _build_checks(detectors)

    return {
        "pages_scanned": pages_scanned,
        "rules_evaluated": len(detectors) or 7,
        "checks": checks,
        "sections_detected": sections_found,
        "index_entries": index_entries,
        "paper_size": paper_det.get("paper"),
        "left_margin_cm": margin_det.get("left_margin_cm"),
        "margins_cm": margin_det.get("margins_cm"),
        "body_font_pt": font_det.get("body_font_pt"),
        "font_family": fam_det.get("dominant_family"),
        "line_spacing_ratio": spacing_det.get("spacing_ratio"),
        "baseline": "DHC Rules / PD 74 v2",
        # OCR provenance for the UI banner (set from the engine report below).
        "ocr_used": False,
        "ocr_pages": 0,
    }


# Friendly names for each detector, shown in the "Checks evaluated" panel.
DETECTOR_CHECK_NAME = {
    "IndexFormatDetector": "Index / Table of Contents",
    "PageNumberingDetector": "Page (folio) numbering",
    "SectionOrderDetector": "Section order & required sections",
    "PaperSizeDetector": "Paper size (A4)",
    "TextLayerDetector": "Searchable text layer (OCR'd)",
    "MarginDetector": "Margins (4/4/2/2 cm)",
    "FontFamilyDetector": "Font family (Times New Roman)",
    "BodyFontSizeDetector": "Body font size (14 pt)",
    "FontSizeDetector": "Body font size (14 pt)",  # legacy
    "LineSpacingDetector": "Line spacing (1.5)",
    "QuotationBlockDetector": "Quotations (12 pt, single)",
    "CourtFeeDetector": "Court fee",
    "LimitationDetector": "Limitation / condonation of delay",
    "CertifiedCopyDetector": "Certified copy of impugned order",
    "VakalatnamaDetector": "Vakalatnama / appearance",
    "AffidavitDetector": "Affidavit in support",
}


def _build_checks(detectors: Dict[str, Any]) -> List[Dict[str, Any]]:
    """
    One row per detector for the collapsible panel: a friendly name, the rule it
    enforces, the number of defects it raised, and an overall status.
    """
    checks: List[Dict[str, Any]] = []
    for name, result in detectors.items():
        # Skip detectors that are switched off (e.g. pagination/folio checks):
        # showing a "pass" row for a check we did not actually run is misleading.
        if (result.get("details") or {}).get("disabled"):
            continue
        defects = result.get("defects", []) or []
        sev = {d.get("severity") for d in defects}
        if "critical" in sev:
            status = "fail"
        elif defects:
            status = "warn"
        else:
            status = "pass"
        checks.append({
            "name": DETECTOR_CHECK_NAME.get(name, name),
            "rule": DETECTOR_RULE_LABEL.get(name, "Delhi High Court Rules"),
            "defects": len(defects),
            "status": status,
        })
    # Stable, readable order: failing first, then warnings, then passes.
    order = {"fail": 0, "warn": 1, "pass": 2}
    checks.sort(key=lambda c: (order.get(c["status"], 3), c["name"]))
    return checks


# --------------------------------------------------------------------------- #
# Routes
# --------------------------------------------------------------------------- #
@app.get("/api/health")
async def health() -> Dict[str, Any]:
    return {
        "status": "ok",
        "detector": "ready",
        "api_version": app.version,
        "enabled_courts": sorted(ENABLED_COURTS),
    }


@app.get("/api/recents")
async def get_recents() -> Dict[str, Any]:
    """List recent filings (server-side, newest first)."""
    return {"recents": recents_db.list_recents()}


@app.delete("/api/recents")
async def delete_recents() -> Dict[str, Any]:
    """Clear all recent filings."""
    recents_db.clear_recents()
    return {"status": "ok", "recents": []}


def _finalize_results(results: Dict[str, Any], *, filename: str, contents_len: int,
                      court_id: str, case_type_id: str) -> Dict[str, Any]:
    """Turn an engine/processor report into the API payload the dashboard renders."""
    raw_defects = results.get("defects", [])
    normalized = [_normalize_defect(d) for d in raw_defects]
    score = calculate_score(raw_defects)
    stats = _build_stats(results)
    summary = results.get("summary", {})

    ocr_info = results.get("ocr", {}) or {}
    stats["ocr_used"] = bool(ocr_info.get("used"))
    stats["ocr_pages"] = int(ocr_info.get("pages", 0) or 0)
    # V2: surface index/bookmark extraction counts to the UI sidebar.
    stats["index_entries"] = (results.get("index", {}) or {}).get("entries", stats.get("index_entries", 0))
    stats["bookmark_count"] = (results.get("bookmarks", {}) or {}).get("count", 0)

    return {
        "analysis_id": os.urandom(8).hex(),
        "created_at": datetime.now(timezone.utc).isoformat(),
        "file_name": filename,
        "file_size_mb": round(contents_len / (1024 * 1024), 2),
        "file_size_label": _human_size(contents_len),
        "court_id": court_id,
        "case_type_id": case_type_id,
        "score": score,
        "confidence": results.get("total_confidence", 0.0),
        "defects": normalized,
        "summary": summary,
        "stats": stats,
    }


def _persist_recent(payload: Dict[str, Any]) -> None:
    """Record a completed analysis as a recent filing (best-effort)."""
    try:
        recents_db.add_recent(
            analysis_id=payload["analysis_id"],
            file_name=payload["file_name"],
            court_id=payload["court_id"],
            court_label=payload["court_id"].upper(),
            case_type_id=payload["case_type_id"],
            score=payload["score"],
            created_at=payload["created_at"],
            session={
                "file": {"name": payload["file_name"], "size": payload["file_size_label"], "url": None},
                "court": {"id": payload["court_id"], "short": payload["court_id"].upper()},
                "caseType": {"id": payload["case_type_id"]},
                "score": payload["score"],
                "confidence": payload["confidence"],
                "defectsToUse": payload["defects"],
                "summary": payload["summary"],
                "stats": payload["stats"],
                "analysisId": payload["analysis_id"],
                "createdAt": payload["created_at"],
            },
        )
    except Exception:  # noqa: BLE001
        logger.exception("Failed to record recent filing (continuing)")


def _validate_upload(court_id: str, filename: str, contents: bytes) -> None:
    """Shared request validation; raises HTTPException on any problem."""
    if court_id not in ENABLED_COURTS:
        raise HTTPException(status_code=422, detail={
            "title": "Court not yet supported",
            "details": f"Analysis for '{court_id}' is coming soon. "
                       f"Currently only the Delhi High Court is live."})
    if not filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=422, detail={
            "title": "Unsupported file type",
            "details": f'Received "{filename}". Only PDF files are accepted.'})
    if len(contents) == 0:
        raise HTTPException(status_code=422, detail={
            "title": "Empty file", "details": "The uploaded PDF is empty."})
    if len(contents) > MAX_UPLOAD_BYTES:
        raise HTTPException(status_code=413, detail={
            "title": "File too large",
            "details": f"Max size is 50 MB. Received {len(contents) / (1024 * 1024):.1f} MB."})


@app.post("/api/analyze")
async def analyze_filing(
    file: UploadFile = File(...),
    court_id: str = Form(...),
    case_type_id: str = Form(...),
):
    """Run the pipeline on an uploaded PDF and return defects + score (non-streaming)."""
    filename = file.filename or "upload.pdf"
    contents = await file.read()
    _validate_upload(court_id, filename, contents)

    temp_path = None
    try:
        with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as tmp:
            temp_path = tmp.name
            tmp.write(contents)

        logger.info("Analyzing %s (%.1f MB) court=%s case=%s",
                    filename, len(contents) / (1024 * 1024), court_id, case_type_id)

        # Build the context with resource caps (page limit + OCR toggle) so a huge
        # filing can't OOM a small instance; run sequentially when capped to keep
        # peak memory low (parallel detectors render pages concurrently).
        from pipeline.builder import build_context
        ctx = build_context(temp_path, max_pages=_MAX_ANALYZE_PAGES, enable_ocr=_ENABLE_OCR)
        engine = DetectorEngine(temp_path, ctx=ctx)
        results = engine.run_all(parallel=_MAX_ANALYZE_PAGES is None)

        payload = _finalize_results(results, filename=filename, contents_len=len(contents),
                                    court_id=court_id, case_type_id=case_type_id)
        logger.info("Done: %d defects (%d critical), score=%d, confidence=%.2f, ocr=%s/%d",
                    len(payload["defects"]), payload["summary"].get("critical_count", 0),
                    payload["score"], payload["confidence"],
                    payload["stats"]["ocr_used"], payload["stats"]["ocr_pages"])
        _persist_recent(payload)
        return JSONResponse(payload)

    except HTTPException:
        raise
    except Exception as exc:  # noqa: BLE001 — surface a clean error to the UI
        logger.exception("Analysis failed")
        raise HTTPException(
            status_code=500,
            detail={
                "title": "Could not analyse this PDF",
                "details": f"{exc}. If the file is a scanned image, run OCR and "
                           f"re-upload a text-based PDF.",
            },
        )
    finally:
        if temp_path and os.path.exists(temp_path):
            try:
                os.remove(temp_path)
            except OSError:
                pass


def _sse(event: str, data: Any) -> str:
    """Format one Server-Sent Event frame."""
    return f"event: {event}\ndata: {json.dumps(data)}\n\n"


@app.post("/api/analyze/stream")
async def analyze_filing_stream(
    file: UploadFile = File(...),
    court_id: str = Form(...),
    case_type_id: str = Form(...),
):
    """
    Stream scrutiny results in real time via Server-Sent Events.

    Frames: ``progress`` (pipeline advancing), ``defect`` (one finding, the moment
    a detector finds it), ``result`` (final payload + score), ``error``, ``done``.
    The dashboard renders defects live and transitions to the report on ``result``.
    """
    filename = file.filename or "upload.pdf"
    contents = await file.read()
    _validate_upload(court_id, filename, contents)

    temp_path = None
    with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as tmp:
        temp_path = tmp.name
        tmp.write(contents)

    logger.info("Streaming analysis %s (%.1f MB) court=%s case=%s",
                filename, len(contents) / (1024 * 1024), court_id, case_type_id)

    async def event_stream():
        try:
            proc = DocumentProcessor(temp_path, max_pages=_MAX_ANALYZE_PAGES,
                                     enable_ocr=_ENABLE_OCR)
            final_report = None
            async for ev in proc.stream():
                if ev.type == "defect":
                    # Translate the raw finding into the UI defect contract live.
                    yield _sse("defect", _normalize_defect(ev.data))
                elif ev.type == "progress":
                    yield _sse("progress", ev.data)
                elif ev.type == "summary":
                    final_report = ev.data
                elif ev.type == "error":
                    yield _sse("error", {
                        "title": "Could not analyse this PDF",
                        "details": ev.data.get("message", "Analysis failed."),
                    })
                elif ev.type == "done":
                    if final_report is not None:
                        payload = _finalize_results(
                            final_report, filename=filename, contents_len=len(contents),
                            court_id=court_id, case_type_id=case_type_id)
                        _persist_recent(payload)
                        logger.info("Stream done: %d defects (%d critical), score=%d",
                                    len(payload["defects"]),
                                    payload["summary"].get("critical_count", 0),
                                    payload["score"])
                        yield _sse("result", payload)
                    yield _sse("done", {})
        except Exception as exc:  # noqa: BLE001
            logger.exception("Streaming analysis failed")
            yield _sse("error", {"title": "Could not analyse this PDF",
                                 "details": str(exc)})
            yield _sse("done", {})
        finally:
            if temp_path and os.path.exists(temp_path):
                try:
                    os.remove(temp_path)
                except OSError:
                    pass

    return StreamingResponse(event_stream(), media_type="text/event-stream",
                             headers={"Cache-Control": "no-cache",
                                      "X-Accel-Buffering": "no"})

# --------------------------------------------------------------------------- #
# Static dashboard — mounted LAST so /api/* takes precedence.
# html=True serves index.html at "/".
# --------------------------------------------------------------------------- #
app.mount("/", StaticFiles(directory=str(DASHBOARD_DIR), html=True), name="dashboard")


if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", "8000"))
    logger.info("Serving dashboard + API on http://localhost:%d", port)
    uvicorn.run(app, host="0.0.0.0", port=port )
