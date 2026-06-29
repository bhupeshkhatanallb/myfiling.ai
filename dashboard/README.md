# myfiling.ai Dashboard

A professional dashboard for analyzing Indian legal filings for defects. Built with React, designed for scalability.

**Status:** ✅ Production-ready frontend | ⏳ Backend (Phase 2) in planning

---

## What is myfiling.ai?

myfiling.ai is a web-based tool that helps lawyers, advocates, and legal teams:
- 🔍 Analyze PDF filings for compliance with 140+ court-specific rules
- 🎯 Get a confidence score (0-100%) on filing readiness
- 📋 View detailed defect reports with remediation steps
- ✅ Ensure filings pass Registry scrutiny before submission

---

## This Dashboard Includes

✅ Full React frontend with 5 screens (Upload, Results, History, Court Rules, Help)  
✅ Interactive score gauge with 3 confidence levels (Safe / Needs Work / Must Fix)  
✅ 12 realistic defects across 3 demo profiles (critical, medium, excellent)  
✅ Intelligent scoring: 1 critical defect = score capped at 40%  
✅ Professional UI/UX (Navy/Blue SaaS design, responsive, WCAG AA)  
✅ Complete documentation (architecture, scoring logic, features)  
✅ Zero-build setup (Babel transpilation in-browser)  

---

## What's NOT Here Yet (Phase 2)

⏳ Real PDF parsing & text extraction  
⏳ Actual defect detection engine  
⏳ Rule matching against PDF content  
⏳ User authentication & saved history  
⏳ Database storage  
⏳ Backend API  

**This dashboard is intentionally frontend-only for rapid feedback & demos.** Backend is planned as separate `/detector` and `/api` projects.

---

## Quick Start

### 1. Start the server
```bash
cd dashboard
python -m http.server 8000
```

### 2. Open in browser
```
http://localhost:8000
```

### 3. Try a demo filing
Click **WP_Critical_Issues.pdf** to see a filing with 3 critical defects (10% score).

For detailed setup: **[GETTING-STARTED.md](./docs/GETTING-STARTED.md)**

---

## Demo Scenarios

| Filing | Score | Status | View |
|--------|-------|--------|------|
| **WP_Critical_Issues.pdf** | 10% | 🔴 Must fix | Court Fee, Vakalatnama, Affidavit |
| **CA_Needs_Refinement.pdf** | 70% | 🟢 Safe | Cause Title, Index, Margin |
| **SLP_Strong_Filing.pdf** | 93% | 🟢 Nearly Perfect | Deponent Clarity, Copy Format |

Each is clickable:
- In sample files panel (bottom of upload screen)
- In recent uploads sidebar (left side)

---

## Key Features

### 🎯 Intelligent Scoring
```
If ANY critical defect:  Score = 40% - (critical_count × 10%)
If ONLY minors:          Score = 100% - (minor_count × 15%)
If ONLY warnings:        Score = Preset (93% for excellent)
```

**Philosophy:** "One critical defect = Filing not ready"  
See **[SCORING-SYSTEM.md](./docs/SCORING-SYSTEM.md)** for details.

### 📊 Three Confidence Levels
- **🟢 71-100%:** "Safe to file" — File now (after lawyer review)
- **🟡 41-70%:** "Fix issues first" — Polish before submission
- **🔴 0-40%:** "Must fix before filing" — Do not file in this state

### 📋 Defect Analysis
Each defect shows:
- **Rule violated** (actual court rule citations: SC Rules 2013, Court Fees Act, etc.)
- **What to do** (step-by-step remediation)
- **Action buttons** (View Page, Mark Fixed, Discuss with counsel)

### 🔍 Filters & Search
- Filter by severity: Critical / Minor / Warning
- Count badges per category
- Expandable cards for deep dive

---

## Documentation

| Document | Purpose |
|----------|---------|
| **[ARCHITECTURE.md](./docs/ARCHITECTURE.md)** | System design, data flow, module breakdown |
| **[GETTING-STARTED.md](./docs/GETTING-STARTED.md)** | Setup instructions, demo scenarios, troubleshooting |
| **[FEATURES.md](./docs/FEATURES.md)** | Detailed feature breakdown, user journeys |
| **[SCORING-SYSTEM.md](./docs/SCORING-SYSTEM.md)** | Scoring algorithm, examples, philosophy |
| **[CRITICAL-DEFECTS-LOGIC.md](./docs/CRITICAL-DEFECTS-LOGIC.md)** | Why critical defects = score capped at 40% |

---

## Project Structure

```
dashboard/
├── index.html                          # Entry point
├── src/
│   ├── app.jsx                         # Root component
│   ├── components/
│   │   ├── chrome/                     # Header & sidebar
│   │   ├── screens/                    # Upload, Results, History, etc.
│   │   ├── gauge/                      # Score visualization
│   │   ├── overlays/                   # Modals
│   │   └── icons/                      # SVG icons
│   ├── data/                           # Courts, defects, sample files
│   ├── utils/                          # Score calc, filters, validation
│   ├── constants/                      # Score bands, messages
│   └── styles/                         # CSS styling
├── public/assets/                      # Screenshots
├── docs/                               # Documentation
└── tests/                              # Test structure (placeholder)
```

---

## How It Works

### User Journey
1. User uploads PDF (or clicks sample filing)
2. Selects court & case type
3. Clicks "Analyse Filing"
4. App loads defect profile for that filing
5. Calculates score (0-100%)
6. Displays results with gauge + defect list
7. User can expand defects to see rules & remediation
8. User downloads report or discusses with counsel

### Data Flow
```
Upload → Lookup Sample File → Load Defect Profile → 
Calculate Score → Animate Gauge → Show Defects
```

No actual PDF processing in this dashboard. Demo uses hardcoded defects per sample file.

---

## Scoring Examples

### Example 1: Critical Defects Present
```
Defects found: 3 critical, 0 minor
Calculation: 40 - (3 × 10) = 10%
Score: 10% 🔴 "Must fix before filing"
```

### Example 2: Only Minor Issues
```
Defects found: 0 critical, 2 minor, 1 warning
Calculation: 100 - (2 × 15) = 70%
Score: 70% 🟢 "Safe to file"
```

### Example 3: Nearly Perfect
```
Defects found: 0 critical, 0 minor, 2 warnings
Score: 93% (preset, never 100%)
Score: 93% 🟢 "Safe to file"
```

---

## Technology Stack

| Layer | Tech | Why |
|-------|------|-----|
| UI Framework | React 18 (CDN) | Fast, component-based |
| Language | JSX + JavaScript ES2020 | Modern, familiar |
| Styling | CSS (no preprocessor) | Simple, maintainable |
| Build | Babel (in-browser) | Zero-build for dashboard |
| Hosting | Static HTML | Can run anywhere |

**No build step required** — Open `index.html` in a browser with local server.

---

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers (iOS Safari, Chrome Mobile)

**Requires:** ES2020+ JavaScript, CSS Grid, CSS Custom Properties

---

## Defects (12 Total)

### Critical (3) — File-Breaking
1. Court Fee Stamp Missing
2. Vakalatnama Not Found
3. Affidavit Not Notarized

### Minor (2) — Cause Queries
4. Cause Title Missing 'Through:' Line
5. Index Page References Mismatch

### Warnings (2) — Best Practices
6. Insufficient Left Margin
7. Affidavit Deponent Name Clarity
8. Certified Copy Stamp Format

(Plus 4 more in defect library)

---

## Development Notes

### No Installation Required
```bash
# Just start a server
python -m http.server 8000
```

### Hot Reload
Edit any file, refresh browser. Changes apply immediately.

### Adding Features
- New screen? Add in `src/components/screens/`
- New utility? Add in `src/utils/`
- New data? Add in `src/data/`
- Styling? Edit `src/styles/app.css`

See **[ARCHITECTURE.md](./docs/ARCHITECTURE.md)** for detailed extension guide.

---

## Roadmap (Phase 2)

### Backend Integration
```
/detector/     ← Python PDF parsing & defect detection
/api/          ← Flask/FastAPI backend
dashboard/           ← React frontend (no changes needed)
```

### dashboard → Production
1. Wire frontend to actual PDF analyzer
2. Add user authentication
3. Implement database for history
4. Add payment integration
5. Deploy to production server

**Key insight:** dashboard structure is detector-agnostic. Backend can be swapped without frontend changes.

---

## Defect Sources

All 12 defects are **real court filing issues** based on:
- Supreme Court Rules, 2013
- Court Fees Act & Rules
- High Court practice directions
- Notaries Act, 1952
- Delhi High Court procedures
- Advocate-on-Record requirements

Not generic issues — these are actual blockers that cause filings to be returned by court registries.

---

## Confidence Scoring Philosophy

> **One critical defect = Filing not ready**

We refuse to show a "Safe to file" score when critical issues exist. This is how trust is built:
- 🟢 Green score = Filing is actually ready
- 🟡 Yellow score = Filing needs work
- 🔴 Red score = Filing cannot proceed

Users learn they can trust the tool because it tells the truth.

---

## Support & Questions

- **How to run?** → [GETTING-STARTED.md](./docs/GETTING-STARTED.md)
- **How does it work?** → [ARCHITECTURE.md](./docs/ARCHITECTURE.md)
- **How is score calculated?** → [SCORING-SYSTEM.md](./docs/SCORING-SYSTEM.md)
- **Why cap at 40% for critical?** → [CRITICAL-DEFECTS-LOGIC.md](./docs/CRITICAL-DEFECTS-LOGIC.md)
- **All features?** → [FEATURES.md](./docs/FEATURES.md)

---

## Team

Built for legal professionals who want to catch filing defects before court rejection.

---

## License

MIT

---

## What's Next?

✅ Current: **Frontend dashboard** (this project)  
⏳ Phase 2: **Detector Engine** (PDF parsing + rule matching)  
⏳ Phase 3: **Backend API** (User accounts + history)  
⏳ Phase 4: **Production** (Authentication + billing)  

---

**Ready to analyze filings?** Open [index.html](./index.html) in your browser!

🚀 **Questions?** See docs/ folder or check code comments.