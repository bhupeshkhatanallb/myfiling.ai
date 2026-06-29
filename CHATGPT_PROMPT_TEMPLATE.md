# ChatGPT → Claude Code Prompt Template (myfiling.ai)

**How to use this file:**
1. Open this file, scroll to **PART 4 — UPDATES I WANT** and describe (in plain English) the change(s) you want.
2. Copy this **entire file** and paste it into ChatGPT.
3. ChatGPT will return a complete, ready-to-run prompt for **Claude Code** (the agent working inside this repo).
4. Paste ChatGPT's output to Claude Code.

Keep PARTS 1–3 as-is (they are stable project context). Only edit PART 4 each time.

---

## PART 0 — INSTRUCTIONS TO CHATGPT (read first)

You are a prompt engineer. Below is the full context of my software project (`myfiling.ai`) and a description of changes I want made. **Do not make the changes yourself.** Instead, produce a single, copy-paste-ready prompt addressed to **Claude Code** (an autonomous coding agent that already has direct access to this repository on my machine).

Your output prompt must:
- Restate the goal clearly and unambiguously in your own words.
- Reference the **exact file paths** from PART 2 that are likely involved.
- Respect every constraint in PART 3 (especially: never hand-edit build artifacts; rebuild after editing `dashboard/src`).
- Break the work into a short ordered task list.
- Tell Claude to verify its work (run the build / detector tests) and report what it changed.
- Ask Claude to confirm scope or surface blockers **before** large or destructive changes, and to flag anything ambiguous rather than guessing.
- NOT include explanations to me — output **only** the final prompt for Claude, inside one code block.

If my PART 4 request is ambiguous or missing detail, first list the clarifying questions I should answer, then produce a best-effort prompt with assumptions stated.

---

## PART 1 — PROJECT OVERVIEW

- **Name:** myfiling.ai
- **What it does:** Analyzes Indian legal-filing PDFs (Supreme Court & High Courts) for formatting/structure compliance defects, scores "scrutiny pass probability," and shows results in a web dashboard.
- **Primary target court (live):** Supreme Court of India. Other courts (Delhi, Bombay, Calcutta, Madras HC, NCLT, etc.) exist in the UI but are marked `comingSoon` / disabled.
- **Repo root:** `d:\data\2026\legal\legal-v1`
- **OS / shell:** Windows 11, PowerShell. Python + Node both available.
- **Run the full app:** `python server.py` (FastAPI; serves dashboard at `/`, exposes `POST /api/analyze` and `GET /api/health`).

---

## PART 2 — ARCHITECTURE & KEY FILES

### Backend — detector engine (Python)
- `detector/src/detectors/detector_engine.py` — orchestrator; parses the PDF **once** into a shared `DocumentModel`, runs all detectors (in parallel) and aggregates results.
- `detector/src/detectors/document_model.py` — single-pass PDF model shared by all detectors; includes a scanned/garbled "cannot scrutinize" gate.
- Detectors:
  - `detector/src/detectors/index_format_detector.py` — Index vs actual page references.
  - `detector/src/detectors/page_numbering_detector.py` — consecutive page numbers (top-right corner per corpus).
  - `detector/src/detectors/section_order_detector.py` — paper-book section arrangement.
  - `detector/src/detectors/format_detectors.py` — `PaperSizeDetector`, `MarginDetector`, `FontSizeDetector`, `LineSpacingDetector` (thresholds tuned against the `test_pdf` corpus to avoid false positives).
  - `detector/src/detectors/base_detector.py` — shared base class.
- `detector/src/parsers/pdf_parser.py` — PDF text/geometry extraction.
- Tests / harnesses (repo root): `test_detectors.py`, `test_detector_logic.py`, `integration_test.py`, `regression.py`, `run_detectors.py`, `make_test_pdf.py`.

### Server / API (Python, FastAPI)
- `server.py` — production entry point. Imports `DetectorEngine` directly (single source of truth). Key gotchas:
  - `calculate_score()` here mirrors the detector scoring; keep them in agreement.
  - `_normalize_defect()` translates detector fields → frontend contract: detectors emit `{id,page,severity,title,description,remediation,source_detector}`; the UI expects `{id,page,severity,title,desc,rule,fix}`.
  - `ENABLED_COURTS = {"sc"}` and `MAX_UPLOAD_BYTES = 50MB`.
- `recents_db.py` — SQLite store for recent filings.
- `api/app/routes/analysis.py`, `api/app/routes/health.py` — route modules.
- `shared/python/constants.py` — court codes, case-type codes, defect IDs, score bands, scoring penalties, upload limits.
- `shared/python/models.py` — shared data models.

### Frontend — production dashboard (React via Babel, no bundler)
- **Source of truth is `dashboard/src/`** (JSX + JS). The served files `dashboard/app.js` and `dashboard/styles.css` are **BUILD ARTIFACTS — do not edit by hand.**
- Build: `cd dashboard && node build.js` (or `npm run build`). It concatenates `src/**` → Babel-compiles to `app.js`, **and** syncs `src/styles/app.css` → `styles.css`.
- `dashboard/index.html` loads root `app.js` + `styles.css`.
- Key source files:
  - `dashboard/src/app.jsx` — root app.
  - `dashboard/src/components/screens/UploadScreen.jsx`, `ResultsScreen.jsx`, `AllScreens.jsx` (History, **Court Rules**, Help).
  - `dashboard/src/components/{gauge,icons,chrome,overlays,tweaks}/...`
  - `dashboard/src/data/courts.js` — court list (`enabled`/`comingSoon` flags; only `sc` is enabled).
  - `dashboard/src/data/case-types.js`, `dashboard/src/data/defects.js`.
  - `dashboard/src/data/sample-files.js` — exports `SAMPLE_FILES`, `RECENT`, `COURT_RULES` (the detailed court rules library powering the Court Rules screen; each court has `source`, `categories[].rules[].{text,auto}`, derived `count`).
  - `dashboard/src/utils/score-calculator.js`, `defect-filter.js`, `file-handler.js`.
  - `dashboard/src/styles/app.css` — all styles.
- All exported data is exposed at runtime via `window.FC_DATA`.

### Demo dashboard (separate, static)
- `demo/` is a **separate self-contained copy** (investor/marketing demo, hardcoded scenarios, no backend). It has its **own** `build.js` and `src/`. Changes to `dashboard/` do NOT propagate to `demo/` and vice-versa.

### Reference docs (repo root)
- `COURT_RULES.md` — detailed, sourced court rules (exact margins/fonts) + which rules are automatable with high confidence.
- `DEMO_DASHBOARD_GUIDE.md`, `README.md`, `COMPLETE_ARCHITECTURE_SUMMARY.md`, `IMPLEMENTATION_SUMMARY.md`, plus `dashboard/docs/*`.

---

## PART 3 — RULES & CONSTRAINTS FOR CLAUDE (must always hold)

1. **Never edit build artifacts directly:** `dashboard/app.js`, `dashboard/styles.css`, `demo/app.js`. Edit `*/src/**` then run the build.
2. **After any change under `dashboard/src/`**, run `cd dashboard && node build.js` and confirm both `app.js` and `styles.css` updated. Same pattern for `demo/` (its own build).
3. **Detector ↔ server agreement:** if you change scoring or defect fields, update both `detector/src` and `server.py` (`calculate_score`, `_normalize_defect`, `DETECTOR_RULE_LABEL`) so the API contract stays intact.
4. **Avoid false positives:** detector thresholds were tuned against the `test_pdf` corpus. If you touch detectors, run `python regression.py` / `python test_detectors.py` and report results.
5. **Only `sc` (Supreme Court) is live.** Don't silently enable other courts; if a change implies enabling one, call it out.
6. **PowerShell / Windows** environment. Use Windows-friendly commands.
7. **Don't introduce heavy dependencies** without asking — the frontend is deliberately bundler-free (Babel only), and detectors rely on the existing PDF stack.
8. **Verify, then report:** end by stating exactly which files changed, what was run, and the result. If tests fail, say so with output.
9. **Confirm before destructive or large-scale changes** (deletions, mass renames, schema/data wipes).

---

## PART 4 — UPDATES I WANT  ✍️ (EDIT THIS SECTION EACH TIME)

> Describe the change(s) in plain English. Be as specific or rough as you like — ChatGPT will turn it into a precise Claude prompt and ask me questions if it's unclear. Delete the examples below and write yours.

**Goal / what I want to change:**
<!-- e.g. "Add a new detector that checks the cover page has a 'Through: <AOR>, Reg. No.' line and flag it as minor if missing." -->


---

### Quick reference for filling PART 4 (delete before sending if you want)
- **UI change** → name the screen (Upload / Results / Court Rules / Help) and the data file in `dashboard/src/data/`.
- **New/changed rule check** → think "detector + engine registration + server rule label + tests".
- **Scoring change** → mention both `detector/src` and `server.py` must agree.
- **New court** → `dashboard/src/data/courts.js` flags + `shared/python/constants.py` + `ENABLED_COURTS` in `server.py`.
- **Rules content** → `dashboard/src/data/sample-files.js` (`COURT_RULES`) and/or `COURT_RULES.md`.k




i want to do complete change in the flow:



Problem: No detector is working fine. lets build it again from start.



solution:

Read Pdf in fractions like first 50 pages and then next 50 and so on. and defects found should be displayed realtime

all detectors will run simultaneously and independently untill any specific case which needs two detectors to work along side. (But important - if any task is repeatitive and if its causing unnecessary delay then build the pipeline smartly)

defects counts for each detector is capped by 20, if 20 defects are found for a particular detector then stop that specific detector for further analysis

First identify the index page and read it and store this information like according to index what page number is for what type of page. 

Then look for page numbers in top middle to top right corner of the pages, its not neccessary that page number starts from first pdf page, look from where page number starts and then  check for continuity.

for margins, 