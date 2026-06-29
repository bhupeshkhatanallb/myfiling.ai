# Getting Started with myfiling.ai dashboard

## Quick Setup

### 1. Navigate to the dashboard directory
```bash
cd dashboard
```

### 2. Start the development server
```bash
# Option A: Using Python (built-in)
python -m http.server 8000

# Option B: Using Node.js (if installed)
npx http-server -p 8000

# Option C: Using Live Server VS Code extension
# Just open index.html and click "Go Live"
```

### 3. Open in browser
Visit: **http://localhost:8000**

---

## What You'll See

### Upload Screen
- Drag-and-drop zone for PDF files
- Court selector (8 options: SC, DHC, BHC, CHC, MHC, KHC, NCLT, KAT)
- Case type selector (7 options: WP, WPC, SLP, CA, CRA, RP, TP)
- 3 sample filings to try:
  - **WP_Critical_Issues.pdf** → 10% (Red: "Must fix before filing")
  - **CA_Needs_Refinement.pdf** → 70% (Green: "Safe to file")
  - **SLP_Strong_Filing.pdf** → 93% (Green: Nearly perfect)
- Recent uploads in left sidebar (all clickable)

### Results Screen
- Animated score gauge (0-100%)
- Color-coded bands:
  - 🟢 Green (71-100%): Safe to file
  - 🟡 Yellow (41-70%): Fix issues first
  - 🔴 Red (0-40%): Must fix before filing
- Defect list with filters (All / Critical / Minor / Warning)
- Expandable defect cards with:
  - Rule violated (actual court rule citations)
  - How to fix (actionable remediation steps)
  - Action buttons (View Page, Mark Fixed, Discuss with counsel)
- Download & Share buttons (simulated)

### Navigation
- **Dashboard** → Upload screen
- **History** → Past filings list
- **Court Rules** → Rule library (filterable by court)
- **Help** → FAQ, Getting Started, Terms, Support

---

## Demo Scenarios

### Test Scenario 1: Critical Defects
1. Click **WP_Critical_Issues.pdf** in sample files
2. Select Court: Supreme Court, Case Type: Writ Petition
3. Click **Analyse Filing**
4. See results: **10% (Red)**
5. View 3 critical defects:
   - Court Fee Stamp Missing
   - Vakalatnama Not Found
   - Affidavit Not Notarized

**Expected:** User sees red score, cannot file, must fix issues.

### Test Scenario 2: Medium Quality Filing
1. Click **CA_Needs_Refinement.pdf** in sample files
2. Select Court: Delhi HC, Case Type: Civil Appeal
3. Click **Analyse Filing**
4. See results: **70% (Green)**
5. View 2 minor defects + 1 warning:
   - Cause Title Missing 'Through:' Line (minor)
   - Index Page References Mismatch (minor)
   - Insufficient Left Margin (warning)

**Expected:** User sees green score, filing is safe but has polish items.

### Test Scenario 3: Excellent Filing
1. Click **SLP_Strong_Filing.pdf** in sample files
2. Select Court: Supreme Court, Case Type: Special Leave Petition
3. Click **Analyse Filing**
4. See results: **93% (Green)**
5. View 2 warnings only:
   - Affidavit Deponent Name Clarity (optional improvement)
   - Certified Copy Stamp Format (optional best practice)

**Expected:** User sees high score (but not 100%), filing is nearly perfect.

### Test Scenario 4: Recent Uploads (Sidebar)
1. Look at left sidebar under "Recent uploads"
2. Click any of the 3 recent filings:
   - WP_Critical_Issues.pdf (Just now, 10%)
   - CA_Needs_Refinement.pdf (Yesterday, 70%)
   - SLP_Strong_Filing.pdf (2 days ago, 93%)

**Expected:** Each loads with the same analysis result as sample files.

---

## Project Structure

```
dashboard/
├── index.html                 # Entry point
├── public/
│   └── assets/screenshots/    # Demo images
├── src/
│   ├── app.jsx                # Root component
│   ├── components/            # React components
│   │   ├── chrome/            # Header + Sidebar
│   │   ├── screens/           # Upload, Results, History, etc.
│   │   ├── gauge/             # Score visualization
│   │   ├── overlays/          # Modals & overlays
│   │   ├── icons/             # SVG icons
│   │   └── tweaks/            # Dev controls
│   ├── data/                  # Mock data
│   │   ├── courts.js
│   │   ├── case-types.js
│   │   ├── defects.js
│   │   └── sample-files.js
│   ├── styles/                # CSS styling
│   ├── utils/                 # Helper functions
│   ├── constants/             # App constants
│   └── hooks/                 # Custom hooks
└── docs/                      # Documentation
```

For details, see **[ARCHITECTURE.md](./ARCHITECTURE.md)**.

---

## Key Files to Understand

### Components (React UI)
- **src/app.jsx** - Root component, state management, routing
- **src/components/screens/UploadScreen.jsx** - File upload interface
- **src/components/screens/ResultsScreen.jsx** - Analysis results display
- **src/components/gauge/Gauge.jsx** - Score visualization

### Data Layer
- **src/data/defects.js** - 12 defects across 3 profiles
- **src/data/sample-files.js** - Demo filings & recent uploads
- **src/data/courts.js** - Court list
- **src/data/case-types.js** - Case type list

### Scoring Logic
- **src/utils/score-calculator.js** - Calculate score from defects
  - If critical > 0: score = MAX(0, 40 - critical × 10)
  - If no critical: score = MAX(0, 100 - minor × 15)

### Styling
- **src/styles/app.css** - Main stylesheet
  - CSS variables for colors, spacing, fonts
  - BEM naming convention
  - Responsive design

---

## How It Works (High-Level)

1. **User uploads filing** (or clicks sample)
2. **App looks up file** in sample files or recent uploads
3. **Loads defect profile** (critical/medium/excellent)
4. **Calculates score** based on defects:
   - Critical defects → cap at 40%
   - Minor defects → scale from 100%
   - Warnings → don't affect score
5. **Displays results** with animated gauge and defect list

See **[SCORING-SYSTEM.md](./SCORING-SYSTEM.md)** for detailed scoring algorithm.

---

## Keyboard Shortcuts

- **N** → New filing (upload screen)
- **H** → History
- **R** → Rule library
- **⌘K** → Search (placeholder, not yet implemented)

---

## Troubleshooting

### "Nothing appears when I open index.html"
- Make sure you're using a local server (not `file:///`)
- Run `python -m http.server 8000` in the dashboard directory
- Visit http://localhost:8000

### "Can't upload real PDFs"
- This is expected! The dashboard doesn't actually analyze PDFs yet
- Try the 3 sample files at the bottom of the upload screen
- Phase 2 will add real PDF processing

### "Sample files don't load"
- Check browser console (F12) for errors
- Make sure all script files are loaded
- Verify no JSX syntax errors in components

### "Styling looks broken"
- Clear browser cache (Ctrl+Shift+Delete)
- Hard refresh (Ctrl+Shift+R)
- Check that styles.css is being loaded

---

## Next Steps

### For Designers
- Modify `src/styles/` to customize colors, typography, layout
- Update component styles in CSS files
- Tweak animations, transitions, spacing

### For Frontend Developers
- Add new components in `src/components/`
- Extend utility functions in `src/utils/`
- Add custom hooks in `src/hooks/`
- Improve responsive design

### For Backend Integration (Phase 2)
- Create `/api` folder for Flask/FastAPI backend
- Create `/detector` folder for PDF processing engine
- Update `src/utils/score-calculator.js` to call `/api/analyze`
- Wire API responses to UI (no structure changes needed)

See **[ROADMAP.md](./ROADMAP.md)** for Phase 2 plans.

---

## Documentation

- **README.md** - Project overview & features
- **ARCHITECTURE.md** - System design & data flow
- **SCORING-SYSTEM.md** - Scoring algorithm explained
- **CRITICAL-DEFECTS-LOGIC.md** - Critical defect philosophy
- **FEATURES.md** - Detailed feature breakdown
- **ROADMAP.md** - Future roadmap

---

## Support

Questions? Check:
1. Browser console (F12 → Console tab)
2. Network tab to verify files are loading
3. Documentation files above
4. Code comments in component files

Happy filing! 🚀