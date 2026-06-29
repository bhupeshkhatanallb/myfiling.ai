// Sample filings for demo and testing (removed for production)

const SAMPLE_FILES = [];

const RECENT = [];

// ---------------------------------------------------------------------------
// COURT RULES LIBRARY
// Detailed, court-specific rules with exact specifications and legal source.
// Researched 15 Jun 2026 from official court circulars / Rules - see
// COURT_RULES.md at the repo root for full citations and automation ratings.
// `auto` field: "high" | "medium" | "manual" - detector confidence.
// ---------------------------------------------------------------------------

const COURT_RULES = [
  {
    court: "Supreme Court of India",
    source: "SC Rules 2013 · Circular 05-03-2020 (w.e.f. 01-04-2020) · e-Filing Rules",
    categories: [
      {
        name: "Paper, Font & Margins (Circular 05-03-2020)",
        rules: [
          { text: "Paper size: A4 - 29.7 cm × 21 cm", auto: "high" },
          { text: "Paper weight: not less than 75 GSM (superior quality)", auto: "manual" },
          { text: "Font: Times New Roman", auto: "medium" },
          { text: "Body font size: 14 pt", auto: "high" },
          { text: "Line spacing: 1.5 (body)", auto: "high" },
          { text: "Quotations & indents: 12 pt, single line spacing", auto: "high" },
          { text: "Left margin: 4 cm", auto: "high" },
          { text: "Right margin: 4 cm", auto: "high" },
          { text: "Top margin: 2 cm", auto: "high" },
          { text: "Bottom margin: 2 cm", auto: "high" },
        ],
      },
      {
        name: "Document Structure (Order IV / Order XXI)",
        rules: [
          { text: "Pages numbered consecutively & noted in Index", auto: "high" },
          { text: "Index page references match actual section start pages", auto: "medium" },
          { text: "Papers arranged per Order XXI r.3(1)(f)", auto: "medium" },
          { text: "Synopsis & List of Dates (chronological events)", auto: "medium" },
          { text: "Certified copy of impugned judgment / order", auto: "manual" },
        ],
      },
      {
        name: "Legal Documents",
        rules: [
          { text: "Cause title includes 'Through: [AOR name], (Reg. No.)'", auto: "medium" },
          { text: "Vakalatnama executed & accepted by Advocate-on-Record", auto: "medium" },
          { text: "Only an AOR may act / file for a party (Order IV)", auto: "manual" },
          { text: "Verifying affidavit sworn before a Notary Public (Order XIX r.3)", auto: "manual" },
        ],
      },
      {
        name: "Court Fees (Third Schedule)",
        rules: [
          { text: "SLP: ₹1,500 (ordinary) / ₹5,000 (special category)", auto: "manual" },
          { text: "Each application (IA): ₹200", auto: "manual" },
          { text: "Court-fee stamp / e-stamp affixed on cover page", auto: "medium" },
        ],
      },
      {
        name: "E-Filing (e-Filing Rules / Manual)",
        rules: [
          { text: "PDF format only", auto: "high" },
          { text: "Searchable / OCR'd text layer (not pure image)", auto: "high" },
          { text: "PDF bookmarks / outline present", auto: "high" },
          { text: "Continuous pagination throughout", auto: "high" },
        ],
      },
    ],
  },
  {
    court: "Delhi High Court",
    source: "Practice Direction 74/Rules/DHC (w.e.f. 01-04-2021) · PD 90 (double-sided, 01-11-2022)",
    categories: [
      {
        name: "Paper, Font & Margins (PD 74/Rules/DHC)",
        rules: [
          { text: "Paper size: A4 - 29.7 cm × 21 cm", auto: "high" },
          { text: "Paper weight: not less than 75 GSM", auto: "manual" },
          { text: "Font: Times New Roman", auto: "medium" },
          { text: "Body font size: 14 pt", auto: "high" },
          { text: "Line spacing: 1.5 (body)", auto: "high" },
          { text: "Quotations & indents: 12 pt, single line spacing", auto: "high" },
          { text: "Left margin: 4 cm", auto: "high" },
          { text: "Right margin: 4 cm", auto: "high" },
          { text: "Top margin: 2 cm", auto: "high" },
          { text: "Bottom margin: 2 cm", auto: "high" },
          { text: "Double-sided printing allowed (PD 90, from 01-11-2022)", auto: "manual" },
        ],
      },
      {
        name: "Scope",
        rules: [
          { text: "Applies to High Court AND all Delhi District Courts", auto: "manual" },
          { text: "Covers pleadings, affidavits, applications, appeals, orders", auto: "manual" },
        ],
      },
      {
        name: "Court Fees (DHC Rules, Chapter 4)",
        rules: [
          { text: "Governed by Court Fees Act (amount varies by case type / valuation)", auto: "manual" },
          { text: "Court-fee stamp present", auto: "medium" },
        ],
      },
    ],
  },
  {
    court: "Bombay High Court",
    source: "Circular No. Rule/E1604/2021 dated 14-07-2021 (amending Appellate Side Rules 1960 & Original Side Rules 1980)",
    categories: [
      {
        name: "Paper, Font & Margins",
        rules: [
          { text: "Paper size: A4", auto: "high" },
          { text: "Paper weight: not less than 75 GSM", auto: "manual" },
          { text: "Printing: both sides", auto: "manual" },
          { text: "Font: Times New Roman OR Georgia", auto: "medium" },
          { text: "Font size: 14 pt", auto: "high" },
          { text: "Inner (binding-side) margin: 5 cm", auto: "high" },
          { text: "Outer margin: 3 cm", auto: "high" },
        ],
      },
    ],
  },
  {
    court: "Calcutta High Court",
    source: "Calcutta HC Gazette Notification - A4 white bond paper (figures marked * follow SC uniform standard; verify primary notification)",
    categories: [
      {
        name: "Paper, Font & Margins",
        rules: [
          { text: "Paper size: A4 (white Bond paper, replacing green)", auto: "high" },
          { text: "Font: Times New Roman *", auto: "medium" },
          { text: "Font size: 14 pt *", auto: "high" },
          { text: "Line spacing: 1.5 *", auto: "high" },
          { text: "Margins: 4 cm L/R, 2 cm T/B * (verify exact figures)", auto: "medium" },
        ],
      },
    ],
  },
  {
    court: "Madras High Court",
    source: "Madras HC direction - A4, min 75 GSM, both-sided (figures marked * follow SC uniform standard; verify primary notification)",
    categories: [
      {
        name: "Paper, Font & Margins",
        rules: [
          { text: "Paper size: A4", auto: "high" },
          { text: "Paper weight: minimum 75 GSM", auto: "manual" },
          { text: "Printing: both sides (mandated)", auto: "manual" },
          { text: "Font: Times New Roman *", auto: "medium" },
          { text: "Font size: 14 pt *", auto: "high" },
          { text: "Margins: 4 cm L/R, 2 cm T/B * (verify exact figures)", auto: "medium" },
        ],
      },
    ],
  },
];

// Derive the rule count for each court from its categories.
COURT_RULES.forEach((c) => {
  c.count = (c.categories || []).reduce((n, cat) => n + cat.rules.length, 0);
});

export { SAMPLE_FILES, RECENT, COURT_RULES };
