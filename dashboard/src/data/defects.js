// Defect profiles: Critical, Medium (Minor), Excellent (Warnings only)

// CRITICAL PROFILE: 3 critical defects = 40 - (3 * 10) = 10%
const CRITICAL_DEFECTS = [
  {
    id: "d1",
    title: "Court Fee Stamp Missing",
    severity: "critical",
    page: 1,
    desc: "No e-stamp or affixed court fee on the cover page. Filing without prescribed court fee will be rejected at Registry scrutiny.",
    rule: "Supreme Court Rules, 2013 — Order IV, Rule 1(a); Court Fees Act Schedule II. Court fee of ₹250 required on first page.",
    fix: "Affix prescribed court fee stamp (e-stamp via SHCIL or physical stamp) on cover page. Re-upload the corrected PDF.",
  },
  {
    id: "d2",
    title: "Vakalatnama Not Found",
    severity: "critical",
    page: 2,
    desc: "No executed Vakalatnama between cover page and index. Counsel authorization is mandatory; filing without it is rejected.",
    rule: "SC Rules, 2013 — Order IV, Rule 7. Vakalatnama must be signed by petitioner and accepted by Advocate-on-Record.",
    fix: "Insert signed Vakalatnama immediately after cover page. Ensure clear AOR stamp and registration number visible.",
  },
  {
    id: "d3",
    title: "Affidavit Not Notarized",
    severity: "critical",
    page: 8,
    desc: "Verifying affidavit lacks notary seal. Unattested affidavits are routinely returned by the Registry without scrutiny.",
    rule: "SC Rules — Order XIX, Rule 3 read with Notaries Act, 1952, §8. Affidavit must be sworn before Notary Public.",
    fix: "Get affidavit notarized by Notary Public. Replace page with attested version. Ensure notary seal is legible.",
  },
];

// MEDIUM PROFILE: 2 minor defects = 100 - (2 * 15) = 70% (safe to file, but has issues)
const MEDIUM_DEFECTS = [
  {
    id: "d6",
    title: "Cause Title Missing 'Through:' Line",
    severity: "minor",
    page: 1,
    desc: "Cause title lacks 'Through: [Advocate name & AOR number]' line. Incomplete cause title causes Registry queries.",
    rule: "SC Rules — Order IV, Rule 1(b) and Form No. 1. Cause title must include counsel representation.",
    fix: "Add 'Through: [Counsel name], Advocate-on-Record (Reg. No.)' line after respondent array.",
  },
  {
    id: "d7",
    title: "Index Page References Mismatch",
    severity: "minor",
    page: 2,
    desc: "Index lists Annexure P-5 at Page 42, but P-5 actually begins Page 44. Pagination mismatch causes Registry correspondence.",
    rule: "SC Rules — Order IV, Rule 4. Index must accurately reflect page numbers of document sections.",
    fix: "Manually verify index against bound document. Correct all page numbers. Re-paginate if needed.",
  },
  {
    id: "d10",
    title: "Insufficient Left Margin",
    severity: "warning",
    page: "3–50",
    desc: "Left margin measures 1.8cm; minimum is 2.5cm. May prevent proper binding. Not grounds for rejection.",
    rule: "SC Practice Direction — Minimum left margin of 2.5cm required for proper binding.",
    fix: "Re-print all pages with 2.5cm left margin. Recommend 3cm to ensure safe binding.",
  },
];

// EXCELLENT PROFILE: 0 critical, 0 minor, warnings only = 93% (nearly perfect, but not 100%)
const EXCELLENT_DEFECTS = [
  {
    id: "d11",
    title: "Affidavit Deponent Name Clarity",
    severity: "warning",
    page: 8,
    desc: "Affidavit deponent's printed name is slightly small but readable. Best practice: make it more prominent.",
    rule: "SC Rules — Deponent should be clearly identified for audit trail. Current format is acceptable.",
    fix: "Optional: Increase deponent name font size slightly for better visibility.",
  },
  {
    id: "d12",
    title: "Certified Copy Stamp Format",
    severity: "warning",
    page: "14, 16",
    desc: "Certified copy attestation uses acceptable wording. Standard format would enhance consistency.",
    rule: "SC Practice Direction — Attestation format is acceptable. Standard format recommended for best practice.",
    fix: "Optional: Revise attestation to read: 'Certified true copy of the original. Attested by: [Signature] [Date]'.",
  },
];

const ALL_DEFECTS = [
  ...CRITICAL_DEFECTS,
  ...MEDIUM_DEFECTS,
  ...EXCELLENT_DEFECTS,
];

export { CRITICAL_DEFECTS, MEDIUM_DEFECTS, EXCELLENT_DEFECTS, ALL_DEFECTS };