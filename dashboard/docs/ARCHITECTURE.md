# myfiling.ai dashboard Architecture

## Project Structure

```
dashboard/
├── index.html                 # Entry point (loads React CDN + Babel)
├── package.json               # Project metadata & npm scripts
├── README.md                  # Quick start guide
│
├── public/
│   └── assets/
│       └── screenshots/       # Demo & debug screenshots
│
├── src/                       # Frontend source code
│   ├── app.jsx                # Root component & state management
│   │
│   ├── components/            # React UI components
│   │   ├── chrome/            # Header & Sidebar navigation
│   │   ├── screens/           # Full-page screens (upload, results, etc.)
│   │   ├── gauge/             # Score visualization widget
│   │   ├── overlays/          # Modal/overlay components
│   │   ├── icons/             # SVG icon library
│   │   ├── sidebar/           # Sidebar navigation
│   │   └── tweaks/            # Dev controls & settings
│   │
│   ├── styles/                # Styling (CSS)
│   │   ├── app.css            # Main stylesheet
│   │   ├── colors.css         # CSS variables & color palette
│   │   ├── typography.css     # Fonts & text styles
│   │   ├── components.css     # Component-specific styles
│   │   └── animations.css     # Keyframes & transitions
│   │
│   ├── data/                  # Data layer (mock for dashboard)
│   │   ├── courts.js          # Court list
│   │   ├── case-types.js      # Case type definitions
│   │   ├── defects.js         # Defect profiles & definitions
│   │   └── sample-files.js    # Demo sample filings & recent list
│   │
│   ├── utils/                 # Utility functions
│   │   ├── score-calculator.js    # Scoring logic
│   │   ├── defect-filter.js       # Filter & sort defects
│   │   └── file-handler.js        # File upload validation
│   │
│   ├── hooks/                 # Custom React hooks (future)
│   │   └── useTweaks.js       # Tweak state management
│   │
│   └── constants/             # Application constants
│       ├── score-bands.js     # Score tier definitions
│       └── messages.js        # UI message strings
│
├── docs/                      # Documentation
│   ├── README.md              # Contributing guide
│   ├── ARCHITECTURE.md        # This file
│   ├── GETTING-STARTED.md     # Setup instructions (future)
│   ├── FEATURES.md            # Feature breakdown
│   ├── SCORING-SYSTEM.md      # Scoring algorithm
│   ├── CRITICAL-DEFECTS-LOGIC.md  # Critical defect handling
│   └── ROADMAP.md             # Phase 2 & beyond (future)
│
├── tests/                     # Test files (future)
│   ├── unit/
│   └── integration/
│
├── .claude/                   # Claude Code config
│   └── settings.json          # Project-specific settings
│
└── .gitignore                 # Git ignore rules
```

---

## Data Flow

### 1. User Uploads Filing

```
[Upload Screen]
  ↓
File selected (drag/drop or click browse)
  ↓
[Validation] (src/utils/file-handler.js)
  • Check file extension (.pdf)
  • Format file size
  ↓
Display file info, show court & case type selects
  ↓
User clicks "Analyse Filing"
```

### 2. Analysis Lookup

```
[app.jsx] startAnalyse(payload)
  ↓
Payload contains: file, court, caseType
  ↓
[Sample Files Lookup] (src/data/sample-files.js)
  • Check if file name matches SAMPLE_FILES
  • Retrieve defectProfile ("critical", "medium", "excellent")
  ↓
[Recent Lookup] (src/data/sample-files.js)
  • Alternative: look in RECENT array for same file
  ↓
[Defect Profile Load] (src/data/defects.js)
  • Load CRITICAL_DEFECTS, MEDIUM_DEFECTS, or EXCELLENT_DEFECTS
  ↓
Store in session: { file, court, caseType, score, defectsToUse }
```

### 3. Score Calculation

```
[src/utils/score-calculator.js] calculateScore()
  ↓
Check for critical defects
  IF criticalCount > 0:
    score = MAX(0, 40 - (criticalCount × 10))
  ELSE:
    score = MAX(0, 100 - (minorCount × 15))
  ↓
Override with presetScore if available (for demo)
  ↓
Return: 0-100 (number)
```

### 4. Results Display

```
[Analysing Overlay] (4-step progress animation, ~3 seconds)
  ↓
[Results Screen]
  ├─ [Gauge Component] (src/components/gauge/Gauge.jsx)
  │   • Display animated score
  │   • Show color band (green/yellow/red)
  │   • Display label ("Safe to file" / "Fix issues first" / "Must fix before filing")
  │
  ├─ [Defect List] (src/components/screens/ResultsScreen.jsx)
  │   • Filter dropdown (All / Critical / Minor / Warning)
  │   • Defect count badges
  │   ↓
  │   [Defect Card] (expandable)
  │   • Title, severity badge, page number
  │   • On expand:
  │     - Rule violated
  │     - How to fix
  │     - Action buttons (View Page, Mark Fixed, Discuss with counsel)
  │
  └─ [Action Buttons]
      • Download Report (simulated)
      • Share with co-counsel (simulated)
      • Back to Dashboard
```

---

## Key Modules

### src/app.jsx (Root Component)
**Responsibilities:**
- Overall app state management (screen, session, errors, toasts)
- Screen routing (upload → analysing → results)
- Score calculation logic
- Navigation coordination

**State Variables:**
- `screen`: "upload" | "analysing" | "results" | "history" | "rules" | "help" | "error"
- `session`: { file, court, caseType, score, defectsToUse }
- `errorMsg`: Error details
- `toast`: Notification message
- `navActive`: Current nav highlight

### src/components/screens/UploadScreen.jsx
**Responsibilities:**
- Drag-drop file upload interface
- Court & case type selection dropdowns
- Sample files quick-start buttons
- File validation error handling

### src/components/screens/ResultsScreen.jsx
**Responsibilities:**
- Display score gauge (animated)
- Show defect list with filtering
- Expandable defect cards with rules & fixes
- Download/share action buttons

### src/components/gauge/Gauge.jsx
**Responsibilities:**
- Render SVG semicircle gauge
- Animate score fill (0→target)
- Display score number & percentage
- Color-code by band (green/yellow/red)
- Show tick marks at 40% & 70% boundaries

### src/data/ (Data Layer)
**Files:**
- `courts.js`: 8 court options (SC, DHC, BHC, CHC, MHC, KHC, NCLT, KAT)
- `case-types.js`: 7 case types (WP, WPC, SLP, CA, CRA, RP, TP)
- `defects.js`: 12 total defects in 3 profiles
  - CRITICAL_DEFECTS: 3 issues (10% score)
  - MEDIUM_DEFECTS: 2 minors + 1 warning (70% score)
  - EXCELLENT_DEFECTS: 2 warnings only (93% score)
- `sample-files.js`: Demo filings + recent uploads list + court rules

**Note:** All data is currently hardcoded. **Phase 2** will replace with API calls to `/api/analyze` backend.

### src/utils/ (Utility Functions)
- `score-calculator.js`: 
  - `calculateScore()`: Compute score from defects
  - `getScoreBand()`: Get color/label for score

- `defect-filter.js`:
  - `filterDefectsBySeverity()`: Filter by critical/minor/warning
  - `sortDefectsBySeverity()`: Sort by severity order
  - `countDefectsBySeverity()`: Count defects per severity

- `file-handler.js`:
  - `validatePdfFile()`: Check file type
  - `formatFileSize()`: Convert bytes to MB
  - `createFileObject()`: Standardize file object

### src/constants/ (App Constants)
- `score-bands.js`: Band definitions (71+, 41-70, 0-40) with colors
- `messages.js`: UI strings for upload, errors, results

---

## Data Structures

### Defect Object
```javascript
{
  id: "d1",                    // Unique identifier
  title: "Court Fee Stamp Missing",  // Display name
  severity: "critical",        // "critical" | "minor" | "warning"
  page: 1,                     // Page number or range
  desc: "No e-stamp...",       // User-facing description
  rule: "SC Rules 2013...",    // Relevant rule citation
  fix: "Affix court fee...",   // How to resolve
}
```

### Session Object
```javascript
{
  file: { name: "WP_Critical_Issues.pdf", size: "3.4 MB" },
  court: { id: "sc", name: "Supreme Court of India", short: "SC" },
  caseType: { id: "wp", name: "Writ Petition (Civil)" },
  score: 10,                   // 0-100
  defectsToUse: [defect1, defect2, ...],  // Active defect set
}
```

---

## Future: Detector Engine Integration

When the PDF analysis backend is ready (Phase 2), the architecture will evolve:

### New Structure
```
legal-analysis-platform/
├── dashboard/                       # React frontend (current)
├── detector/                  # Python PDF processing
│   ├── src/
│   │   ├── parsers/           # PDF text extraction
│   │   ├── rules/             # Rule matching engine
│   │   ├── validators/        # Defect detection logic
│   │   └── models/            # ML/scoring models
│   └── requirements.txt
├── api/                       # Backend API (Flask/FastAPI)
│   ├── routes/
│   ├── models/
│   └── database/
└── docs/                      # Shared documentation
```

### Changes to dashboard Frontend
1. **src/data/** → Replace with API calls
   - `getAnalysis()` calls `/api/analyze`
   - Returns defects found in actual PDF
   
2. **src/utils/score-calculator.js** → Signature unchanged
   - Still receives defect array
   - Calculation logic remains identical
   
3. **app.jsx** startAnalyse()
   - Send file to `/api/analyze`
   - Receive defects + score
   - Display results (UI unchanged)

**Key insight:** Frontend doesn't change structure, just data source. The dashboard layout is **detector-agnostic**.

---

## How to Extend

### Add a New Screen
1. Create component in `src/components/screens/MyScreen.jsx`
2. Add to app.jsx routing (`screen === "myscreen"`)
3. Add navigation link in Header

### Add Utility Function
1. Create in `src/utils/my-util.js`
2. Export function
3. Import in component that needs it

### Add Data
1. Create module in `src/data/my-data.js`
2. Export constants
3. Initialize in app.jsx (set `window.FC_DATA.MY_DATA`)

### Modify Styling
1. Edit `src/styles/app.css` or appropriate sub-file
2. Changes apply immediately (no build step needed)

---

## Development Notes

### No Build Step Required
- Uses Babel transpiler in-browser
- JSX converted at runtime
- Hot-reload by refreshing browser

### Global Namespace
- Components exposed on `window` (e.g., `window.Header`, `window.UploadScreen`)
- Data exposed on `window.FC_DATA`
- Simplifies HTML script loading

### CSS Architecture
- CSS variables for consistency
- BEM naming convention (.block__element--modifier)
- Responsive design (desktop-first, mobile-friendly)

### Testing (Future)
- `/tests` folder prepared for Jest/Vitest
- Utility functions are pure → easily testable
- Components can be unit tested in isolation

---

## Performance Characteristics

| Metric | Value | Notes |
|--------|-------|-------|
| Initial load | <500ms | Single HTML file, React CDN, Babel |
| Score calculation | <1ms | Pure function, no I/O |
| Defect rendering | <10ms | ~12 defects in results list |
| Animation (gauge) | 900ms | Smooth CSS transitions |
| Sidebar recent uploads | <5ms | Mapping 3 items |

---

## Browser Support

- Chrome 90+ (full support)
- Firefox 88+ (full support)
- Safari 14+ (full support)
- Edge 90+ (full support)
- Mobile browsers (iOS Safari, Chrome Mobile)

**Requires:** ES2020+ JavaScript, CSS Grid, CSS Custom Properties

---

## Security Considerations

### Current dashboard (Frontend Only)
- No server-side validation (all client-side)
- No authentication/authorization
- No database access
- Safe for demo/prototype use

### Phase 2 (Backend Integration)
- Add server-side file validation
- Implement authentication (JWT, OAuth)
- Add rate limiting
- Secure API endpoints
- Data encryption in transit & at rest

---

## Contact & Support

For questions about this architecture, refer to:
- `FEATURES.md` — Detailed feature breakdown
- `SCORING-SYSTEM.md` — Scoring algorithm explained
- `CRITICAL-DEFECTS-LOGIC.md` — Critical defect handling
- GitHub Issues (future)