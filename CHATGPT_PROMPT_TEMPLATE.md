# ChatGPT → Claude Code Prompt Template (myfiling.ai)

**How to use this file:**
1. Open this file, scroll to **PART 4 — UPDATES I WANT** and describe (in plain English) the change(s) you want.
2. Copy this **entire file** and paste it into ChatGPT.
3. ChatGPT will return a complete, ready-to-run prompt for **Claude Code** (the agent working inside this repo).
4. Paste ChatGPT's output to Claude Code.

Keep PARTS 1–3 as-is (they are stable project context). Only edit PART 4 each time.

> **Last synced with the codebase:** 2026-06 (after the pipeline rebuild, court switch to Delhi High Court, court-neutral copy, login/auth, and the Render/Hugging Face deploys). If the code has drifted again, tell Claude to re-verify file paths before relying on PART 2.

---

## PART 0 — INSTRUCTIONS TO CHATGPT (read first)

You are a prompt engineer. Below is the full context of my software project (`myfiling.ai`) and a description of changes I want made. **Do not make the changes yourself.** Instead, produce a single, copy-paste-ready prompt addressed to **Claude Code** (an autonomous coding agent that already has direct access to this repository on my machine).

Your output prompt must:
- Restate the goal clearly and unambiguously in your own words.
- Reference the **exact file paths** from PART 2 that are likely involved.
- Respect every constraint in PART 3 (especially: never hand-edit build artifacts; rebuild after editing `dashboard/src`; keep detector ↔ server in agreement).
- Break the work into a short ordered task list.
- Tell Claude to verify its work (run the build / `python test_pipeline.py` / `python regression_pipeline.py`) and report what it changed.
- Ask Claude to confirm scope or surface blockers **before** large or destructive changes, and to flag anything ambiguous rather than guessing.
- NOT include explanations to me — output **only** the final prompt for Claude, inside one code block.

If my PART 4 request is ambiguous or missing detail, first list the clarifying questions I should answer, then produce a best-effort prompt with assumptions stated.

---

## PART 1 — PROJECT OVERVIEW

- **Name:** myfiling.ai
- **What it does:** Analyzes Indian legal-filing PDFs for formatting / structure / filing-requirement defects, gives a "filing-readiness score," and shows a defect checklist in a web dashboard. Designed for advocates' clerks / AoR offices to catch defects **before** the Registry objects to a filing.
- **Live court (which rules are enforced):** **Delhi High Court** (`dhc`). The detector spec it enforces (A4/Legal paper, Times New Roman, 14 pt, 1.5 spacing, 4/4/2/2 cm margins, etc.) is shared across courts, so the engine is largely court-agnostic. Other courts exist in the UI as `comingSoon`. **User-facing copy is deliberately court-NEUTRAL** ("the court", not "Delhi High Court") so it reads correctly as more courts launch — do not reintroduce a specific court name into marketing/help copy.
- **Auth:** the app is **login-gated**. Users sign up (email + password) and each user's history is private to them.
- **Repo root:** `d:\data\2026\legal\legal-v1`
- **OS / shell:** Windows 11, PowerShell (a Bash tool is also available). Python 3.8 locally; the deploy containers use Python 3.11. Node is available for the dashboard build.
- **Run the full app locally:** `python server.py` → FastAPI serves the dashboard at `/` and the API under `/api/*` on `http://localhost:8000`.
- **Deployed via:** Hugging Face Spaces (Docker, 16 GB free) and/or Render (free 512 MB tier). Both build from the GitHub repo `bhupeshkhatanallb/myfiling.ai`.

---

## PART 2 — ARCHITECTURE & KEY FILES

### Backend — detector PIPELINE (Python)  ← this was fully rebuilt; the old `detector/src/detectors/` engine no longer exists
The engine is the **`detector/src/pipeline/`** package. It parses the PDF **in chunks** (default 8–50 pages) and streams findings in real time. Detectors **self-register** via a decorator and are grouped by `kind` ("page" | "conditional" | "validator").

- `detector/src/pipeline/reader.py` — `ChunkReader`: opens the PDF once (pdfplumber), yields `RawPage`s in chunks (bounded memory). `max_pages` cap supported.
- `detector/src/pipeline/builder.py` — `build_context()`: drives the chunked parse → builds `PageMetadata` per page → runs extractors → returns the shared `DocumentContext`. Honors `max_pages` / `enable_ocr`.
- `detector/src/pipeline/model.py` — `PageMetadata` (single source of truth for one page) + `DocumentContext` (shared, cached doc-level signals: scan/garble gating, dominant body metrics, paper distribution, per-page margin/quality signals). `classify_paper()` lives here.
- `detector/src/pipeline/metrics.py` — pure geometry/typography measurement (line aggregation, **block-based margin measurement**, per-page left/right margin defect signals, OCR-garble signals).
- `detector/src/pipeline/registry.py` — `@register` decorator + `detectors_of_kind(kind)`. Adding a detector = one decorated class.
- `detector/src/pipeline/base.py` — `Detector` base class, `DetectorResult`, `DefectSink` (enforces the **20-defects-per-detector cap** + streaming callback).
- `detector/src/pipeline/engine.py` — synchronous `DetectorEngine` facade (`run_all()`); used by harnesses + the non-streaming endpoint.
- `detector/src/pipeline/processor.py` — async `DocumentProcessor.stream()`: drives the pipeline and yields live `progress` / `defect` / `summary` events for SSE. Accepts `max_pages` / `enable_ocr`.
- `detector/src/pipeline/aggregate.py` — builds the final report dict from detector results.
- `detector/src/pipeline/quality.py` — image-quality pass: per-page **DPI** + **blur** measurement (renders scan pages at a low DPI; memory-frugal int16 Laplacian). Env knobs: `QUALITY_RENDER_DPI`, `QUALITY_MAX_PAGES`.
- `detector/src/pipeline/ocr.py` — **optional** Tesseract OCR (gracefully skipped if the binary is absent; OFF in deploys).
- `detector/src/pipeline/gates.py` — capability gates (geometry / typography / text) for graceful "could not verify".
- `detector/src/pipeline/feature_flags.py` — runtime switches. **Pagination/written-folio checks are currently DISABLED** here (`PAGINATION_CHECKS_ENABLED = False`, folio detection unreliable); re-enable via flag or `ENABLE_PAGINATION_CHECKS=1`.
- Extractors: `detector/src/pipeline/extractors/{index.py, page_meta.py, page_numbering.py, bookmarks.py}`.
- Detectors (each `@register`, grouped by `kind`):
  - `detectors/page/formatting.py` — `PaperSizeDetector` (A4 **or** Legal), `MarginDetector` (per-page left/right narrow-margin findings), `FontFamilyDetector`, `BodyFontSizeDetector`, `LineSpacingDetector`, `QuotationBlockDetector`.
  - `detectors/page/structure.py` — `IndexFormatDetector`, `SectionOrderDetector`.
  - `detectors/page/page_numbering.py` — `PageNumberingDetector` (gated off by the pagination flag).
  - `detectors/page/quality_checks.py` — `ScanQualityDetector` (low-DPI + blurred/illegible pages).
  - `detectors/page/text_layer.py` — `TextLayerDetector` (no-text-layer + per-page distorted/garbled OCR text).
  - `detectors/filing/requirements.py` — court-fee / vakalatnama / affidavit / limitation / certified-copy "will-bounce" checks.
  - `detectors/conditional/sections.py` — checks that run only on identified section pages.
  - `validators/{index_validator.py, bookmark_validator.py}` — cross-page validation after all pages are analyzed.
- **Test / regression harnesses (repo root):** `python test_pipeline.py` (unit), `python regression_pipeline.py` (runs the engine over the `test_pdf/` corpus). The corpus (`test_pdf/`, ~1.4 GB) and the `Reference_only/` codebase are **gitignored** — local only.

### Server / API (Python, FastAPI)
- `server.py` — production entry point. Serves the dashboard (static mount at `/`) and the API. Imports the pipeline directly (single source of truth). Key points:
  - Endpoints: `POST /api/analyze`, `POST /api/analyze/stream` (SSE, the one the UI uses), `GET /api/health`, `GET/DELETE /api/recents`, and auth: `POST /api/auth/{signup,login,logout}`, `GET /api/auth/me`.
  - **Analyze + recents endpoints require login** (`require_user`); per-user data via the session cookie.
  - `calculate_score()` mirrors the detector scoring — keep them in agreement.
  - `_normalize_defect()` translates detector fields → the frontend contract (detectors emit `{id,page,severity,title,description,remediation,source_detector,evidence}`; the UI expects `{id,page,severity,title,desc,rule,fix,evidence}`).
  - `DETECTOR_RULE_LABEL` / `DETECTOR_CHECK_NAME` map detector names → the rule citation + check name shown in the UI.
  - `ENABLED_COURTS = {"dhc"}`, `MAX_UPLOAD_BYTES = 50 MB`.
  - **Memory/resource env knobs** (for small instances): `MAX_ANALYZE_PAGES`, `ANALYZE_CONCURRENCY` (1 = serial), `ENABLE_OCR`, `QUALITY_RENDER_DPI`, `QUALITY_MAX_PAGES`, `PARSE_CHUNK_SIZE`, `RECENTS_DB_PATH`, `COOKIE_SECURE`.
- `auth_db.py` — SQLite users + sessions. **Stdlib PBKDF2** password hashing (no bcrypt/passlib), opaque session tokens in an HttpOnly cookie. Shares the SQLite file with recents by default.
- `recents_db.py` — SQLite recent-filings store, **scoped per `user_id`** (a user only sees their own history).
- `api/app/routes/analysis.py`, `api/app/routes/health.py` — older route modules (the live server is `server.py`; treat `api/` as secondary).
- `shared/python/constants.py`, `shared/python/models.py` — shared codes / models.

### Frontend — production dashboard (React via Babel, no bundler)
- **Source of truth is `dashboard/src/`** (JSX + JS). The served files `dashboard/app.js` and `dashboard/styles.css` are **BUILD ARTIFACTS — do not edit by hand.**
- Build: `cd dashboard && node build.js` (or `npm run build`). It concatenates `src/**` (order defined in `build.js`'s `filesToConcat`) → Babel-compiles to `app.js`, **and** syncs `src/styles/app.css` → `styles.css`.
- `dashboard/index.html` loads root `app.js` + `styles.css`.
- Key source files:
  - `dashboard/src/app.jsx` — root app; holds auth/session state, **gates the whole app behind `AuthScreen` when logged out**, screen routing, and the SSE analyze flow (`/api/analyze/stream`).
  - `dashboard/src/components/screens/AuthScreen.jsx` — login / signup gate (+ `apiMe` / `apiLogout` helpers).
  - `dashboard/src/components/screens/UploadScreen.jsx`, `ResultsScreen.jsx`, `AllScreens.jsx` (History, **Court Rules**, Help). **History tab reads live per-user recents** and opens the cached report.
  - `dashboard/src/components/chrome/chrome.jsx` — Header (nav tabs + **user menu / logout**) and Sidebar (recent uploads, fixed-height scrollable).
  - `dashboard/src/components/{gauge,icons,overlays,tweaks}/...`
  - `dashboard/src/data/courts.js` — court list (`enabled`/`comingSoon`; **`dhc` is enabled, `sc` is comingSoon**; active court listed first so `COURTS[0]` is enabled).
  - `dashboard/src/data/case-types.js`, `dashboard/src/data/defects.js`.
  - `dashboard/src/data/sample-files.js` — `SAMPLE_FILES`, `RECENT` (now unused by History — kept only as legacy), `COURT_RULES` (the court-rules library powering the Court Rules screen).
  - `dashboard/src/constants/messages.js` — UI copy strings (court-neutral).
  - `dashboard/src/utils/{score-calculator,defect-filter,file-handler,report-generator}.js`.
  - `dashboard/src/styles/app.css` — all styles (incl. the auth screen + user menu).
- All exported data is exposed at runtime via `window.FC_DATA`.

### Deploy / infra (repo root)
- `requirements.txt` — minimal runtime deps (fastapi, uvicorn, pdfplumber, PyMuPDF, numpy, Pillow). **Do not re-bloat** (no Postgres/Redis/Celery/bcrypt — auth uses stdlib).
- `Dockerfile` + `.dockerignore` — Hugging Face Spaces (Docker) deploy; serves on port 7860.
- `render.yaml` — Render Blueprint (free tier; sets the memory env knobs above).
- `README.md` — doubles as the HF Space card (YAML header: `sdk: docker`, `app_port: 7860`).

### Demo dashboard (separate, now dormant)
- `demo/` is a separate self-contained marketing copy with its **own** `build.js`/`src/`. It is **gitignored** (not deployed) and not kept in sync with `dashboard/`. Ignore it unless explicitly asked.

---

## PART 3 — RULES & CONSTRAINTS FOR CLAUDE (must always hold)

1. **Never edit build artifacts directly:** `dashboard/app.js`, `dashboard/styles.css`. Edit `dashboard/src/**` then run `cd dashboard && node build.js` and confirm both `app.js` and `styles.css` updated.
2. **The engine is `detector/src/pipeline/`** — the old `detector/src/detectors/` engine is gone. New checks = a `@register`ed `Detector` subclass with the right `kind`; verify it gets picked up by `detectors_of_kind`.
3. **Detector ↔ server agreement:** if you change scoring or defect fields, update both the pipeline and `server.py` (`calculate_score`, `_normalize_defect`, `DETECTOR_RULE_LABEL`, `DETECTOR_CHECK_NAME`) so the API/UI contract stays intact.
4. **Per-detector defect cap is 20** (enforced by `DefectSink`). **Pagination/folio checks are intentionally disabled** behind `feature_flags.PAGINATION_CHECKS_ENABLED` — don't silently re-enable them.
5. **Avoid false positives:** detector thresholds are tuned against the `test_pdf/` corpus and specific ground-truth pages. If you touch detectors, run `python regression_pipeline.py` and `python test_pipeline.py` and report results; default to **precision over recall**.
6. **Keep copy court-neutral.** Don't put a specific court name (e.g. "Delhi High Court") back into user-facing marketing/help copy. The court *selector* may name courts; claims about "what we check against" should say "the court".
7. **Auth is login-gated + per-user.** Analyze/recents require a session; new saved data must be scoped to the logged-in `user_id`. Don't add data that leaks across users.
8. **Memory matters on the free tier (512 MB).** Don't introduce per-page full-resolution renders or hold the whole document in memory unnecessarily; respect the `MAX_ANALYZE_PAGES` / `QUALITY_*` / `ANALYZE_CONCURRENCY` knobs.
9. **Don't introduce heavy dependencies** without asking — the frontend is bundler-free (Babel only); the backend deps are deliberately minimal (stdlib auth, no OCR system packages in deploy).
10. **Windows / PowerShell** environment (a Bash tool is also available) — use compatible commands.
11. **Verify, then report:** end by stating exactly which files changed, what was run, and the result. If tests fail, say so with output.
12. **Confirm before destructive or large-scale changes** (deletions, mass renames, schema/data wipes, enabling a new court, re-enabling pagination).

---

## PART 4 — UPDATES I WANT  ✍️ (EDIT THIS SECTION EACH TIME)

> Describe the change(s) in plain English. Be as specific or rough as you like — ChatGPT will turn it into a precise Claude prompt and ask me questions if it's unclear. Delete the examples below and write yours.

**Goal / what I want to change:**
<!-- e.g. "Add a detector that flags a missing 'Through: <AOR>, Reg. No.' line on the cover page as a minor defect." -->


---

### Quick reference for filling PART 4 (delete before sending if you want)
- **UI change** → name the screen (Auth / Upload / Results / History / Court Rules / Help) and the data/source file in `dashboard/src/`. Remember the rebuild.
- **New/changed rule check** → think "new `@register` Detector in `detector/src/pipeline/detectors/...` + correct `kind` + server `DETECTOR_RULE_LABEL`/`DETECTOR_CHECK_NAME` + run `regression_pipeline.py`".
- **Scoring change** → both the pipeline and `server.py:calculate_score` must agree.
- **New court** → `dashboard/src/data/courts.js` flags + `ENABLED_COURTS` in `server.py` (+ court rules in `sample-files.js`). Call it out explicitly.
- **Rules content** → `dashboard/src/data/sample-files.js` (`COURT_RULES`).
- **Auth / accounts / history** → `auth_db.py`, `recents_db.py`, `server.py` auth routes, `dashboard/src/components/screens/AuthScreen.jsx` + `app.jsx`.
- **Deploy / memory** → `requirements.txt`, `Dockerfile`, `render.yaml`, and the env knobs in `server.py`.
