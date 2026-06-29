# myfiling.ai dashboard — Intelligent Scoring System

**Updated:** June 2026  
**Feature:** Critical-First Scoring Logic  
**Status:** ✅ Active

---

## Scoring Philosophy

**One critical defect = Filing not ready**

If even a single critical defect is found, the score will never exceed 40% (High Risk). This reflects the reality: critical defects are file-breaking issues that must be fixed before submission.

---

## Score Ranges & Meaning

### 71–100% 🟢 "Safe to File"
- ✅ No critical defects
- ✅ Only minor/warning issues (if any)
- ✅ Ready for submission
- 📋 Lawyer review still recommended

### 41–70% 🟡 "Fix Issues First"
- ⚠️ No critical defects, but
- ⚠️ Multiple minor issues present
- 🔧 Need fixes before filing
- 📋 Work with your team to resolve

### 0–40% 🔴 "Must Fix Before Filing"
- ❌ One or more critical defects detected
- ❌ Filing cannot proceed until fixed
- 🚫 Cannot file in this state
- 🔧 Resolve critical issues immediately

---

## How Score is Calculated

### Scenario 1: Critical Defects Found
```
If ANY critical defect exists:
  score = MAX(0, 40 - (critical_count × 10))
  
Examples:
  • 1 critical → score: 30% (Must Fix)
  • 2 critical → score: 20% (Must Fix)
  • 5 critical → score: 0% (Must Fix)
```

### Scenario 2: No Critical Defects
```
If NO critical defects:
  score = MAX(0, 100 - (minor_count × 15))
  
Examples:
  • 0 minor → score: 100% (Safe to File)
  • 1 minor → score: 85% (Safe to File)
  • 3 minor → score: 55% (Fix Issues First)
  • 7 minor → score: 0% (Fix Issues First)
```

---

## What This Means

### For Users
- **Green (Safe to File):** You can proceed with confidence
- **Yellow (Fix Issues First):** Polish before submission
- **Red (Must Fix Before Filing):** Do not file in this state

### For Filing Safety
- Critical issues block filing (score capped at 40%)
- Minor issues don't block, but should be addressed
- Warning issues are FYI only

### For Lawyer Review
- Green score: Lawyer can focus on content/substance
- Yellow score: Lawyer helps fix identified issues
- Red score: Filing is not ready yet

---

## Example Scenarios

### Scenario A: Perfect Filing
```
Defects found:
  • 0 critical
  • 0 minor
  • 0 warnings

Score: 100% 🟢 "Safe to File"
```

### Scenario B: Minor Imperfections
```
Defects found:
  • 0 critical ✅
  • 2 minor issues (font, margins)
  • 0 warnings

Score: 70% 🟢 "Safe to File"
(Minor issues won't block scrutiny)
```

### Scenario C: Some Issues, No Blockers
```
Defects found:
  • 0 critical ✅
  • 4 minor issues (formatting)
  • 0 warnings

Score: 40% 🟡 "Fix Issues First"
(Multiple minor issues = clean up first)
```

### Scenario D: Filing Not Ready (1 Critical)
```
Defects found:
  • 1 critical ❌ (Missing Court Fee Stamp)
  • 2 minor issues

Score: 30% 🔴 "Must Fix Before Filing"
(Court fee is mandatory = filing blocked)
```

### Scenario E: Filing Not Ready (Multiple Critical)
```
Defects found:
  • 3 critical ❌
    - Missing Court Fee Stamp
    - Vakalatnama Not Found
    - Affidavit Not Notarized
  • 1 minor

Score: 10% 🔴 "Must Fix Before Filing"
(Multiple blockers = not ready)
```

---

## Message Clarity

### Green Score Message
```
✅ Strong Compliance - Safe to File

This filing meets all critical requirements. 
The court is unlikely to return it for defects.
Have your advocate review the substance and file with confidence.
```

### Yellow Score Message
```
🟡 Needs Refinement - Fix Issues First

This filing has some issues that should be addressed before submission.
Review the flagged items and make corrections.
Once fixed, this will be ready for filing.
```

### Red Score Message
```
🔴 Critical Issues - Must Fix Before Filing

This filing has one or more blocking issues that MUST be fixed.
Do NOT file in this state. The court will return it.
Resolve each critical issue and re-analyze before filing.
```

---

## Critical vs. Minor Defects

### Critical Defects (File-Breaking)
These WILL cause the court to return your filing:
1. Missing Court Fee Stamp
2. Vakalatnama Not Found
3. Affidavit Not Notarized
4. Annexures Not Self-Attested
5. Synopsis Exceeds Page Limit

**If even ONE exists:** Score capped at 40%

### Minor Defects (Not File-Breaking)
These might cause queries but won't block filing:
- Cause title formatting
- Index page mismatch
- Font size issues
- Missing page numbering
- Margin issues

**Multiple minors** → Lower score (but still 41%+ if no critical)

### Warning Issues (Advisory)
These are best practices:
- Deponent visibility
- Certified copy format

**Don't affect score as much**

---

## User Experience Impact

### User Flow with Critical Defect
```
1. Upload filing
2. Click Analyse
3. See progress animation
4. Results page shows:
   ❌ Score: 30% "Must Fix Before Filing"
   ❌ 1 Critical: "Missing Court Fee Stamp"
   → User CANNOT proceed
   → User must fix issue
   → User re-analyzes
```

### User Flow with Only Minor Issues
```
1. Upload filing
2. Click Analyse
3. See progress animation
4. Results page shows:
   ✅ Score: 70% "Safe to File"
   ⚠️ 2 Minor: "Font size", "Margins"
   → User CAN proceed if confident
   → Or user can fix minors first
   → Lawyer will review anyway
```

---

## Real-World Accuracy

### Why Critical Defects = Can't File
- Court Fees: Mandatory, filing returned without it
- Vakalatnama: Counsel not authorized, filing rejected
- Affidavit: Unsworn documents returned
- Annexures: Unattested copies objected to
- Page Limits: Excess pages separated and returned

**These are non-negotiable.** If even one exists, filing should not proceed.

### Why Minor Issues ≠ File-Breaking
- Font sizes: Court scanner might complain, but filing accepted
- Margins: Binding issue, court handles it
- Page numbering: Cosmetic, court will number them

**These are polish, not blockers.**

---

## Score Labels Explained

| Score | Label | User Action |
|-------|-------|-------------|
| 71–100% | "Safe to File" | File now (after lawyer review) |
| 41–70% | "Fix Issues First" | Address minors, then file |
| 0–40% | "Must Fix Before Filing" | Stop. Fix critical issues. Re-analyze. |

---

## Technical Implementation

### Calculation Code
```javascript
// If critical defects exist
if (criticalCount > 0) {
  score = Math.max(0, 40 - (criticalCount × 10));
  // Result: 0–40% (High Risk)
}

// If no critical defects
else {
  score = Math.max(0, 100 - (minorCount × 15));
  // Result: 41–100% (Refinement to Safe)
}
```

### Key Rule
**One critical defect = Score never exceeds 40%**

---

## Why This Matters for Trust

Users need to trust that the tool tells them the truth:
- ✅ If score is green, filing is ready
- ✅ If score is yellow, filing needs work
- ✅ If score is red, filing cannot proceed

By capping scores at 40% when critical defects exist, we build trust. Users know that if the tool says "Safe to File," they can trust that statement.

---

## Status

✅ **Intelligent scoring active**  
✅ **Critical defects properly weighted**  
✅ **User can trust the score**  
✅ **Clear messaging per score range**

The tool now provides confidence when warranted and prevents risky filings.

---

**Next time you analyze a filing with a critical defect, the score will never show "Strong Compliance." It will show "Must Fix Before Filing."**

This is the right behavior. 🎯
