---
title: myfiling.ai
emoji: 📄
colorFrom: indigo
colorTo: blue
sdk: docker
app_port: 7860
pinned: false
---

# myfiling.ai — Court Filing Defect Checker

Checks a court-filing PDF (currently **Delhi High Court**) against the Registry's
formatting and filing requirements — paper size, margins, page DPI/blur, distorted
OCR text, fonts, pagination, court fee, vakalatnama, affidavit, and more — and
returns a defect report with a filing-readiness score.

## Running it

This is a **Docker Space**: the container builds from the `Dockerfile` and serves
the dashboard + API on port `7860`.

* Web UI: the Space URL (`/`)
* Health check: `/api/health`
* Analyze (used by the UI): `POST /api/analyze/stream`

## Notes for testers

* **First request after the Space wakes** may take a few seconds.
* **OCR is disabled** in this deploy (no Tesseract). Fully-scanned image PDFs with
  no text layer will report "could not verify" on text checks; the image checks
  (DPI / blur) still run. Upload PDFs that have a real text layer for the full set.
* "Recent uploads" history is not persisted across restarts.

## Local run

```bash
pip install -r requirements.txt
python server.py          # serves dashboard + API on http://localhost:8000
```
