// Printable filing report - opens a clean, self-contained report in a new window
// and invokes the browser's print dialog (the user saves as PDF). This makes the
// "Download Report" button deliver a real artifact an advocate can keep or hand
// to a clerk, instead of a placeholder toast.
//
// ADVOCATE AUDIT: a downloadable report + a Filing Readiness Checklist were the
// top "would-pay-for" items. The report leads with the readiness checklist
// (pass/needs-attention per check), then the full defect list with remediation.

function escapeHtml(s) {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// Build a Filing Readiness Checklist from the per-check breakdown the API sends.
function readinessRows(stats) {
  const checks = (stats && stats.checks) || [];
  return checks.map(c => {
    const status = c.status === "pass" ? "Pass"
      : c.status === "fail" ? "Action required"
      : "Review";
    return { name: c.name, rule: c.rule, status, raw: c.status,
             detail: c.defects ? `${c.defects} issue${c.defects === 1 ? "" : "s"}` : "-" };
  });
}

function downloadReport(session) {
  const s = session || {};
  const stats = s.stats || {};
  const defects = s.defectsToUse || [];
  const score = s.score != null ? s.score : 0;
  const band = (typeof getScoreBand === "function")
    ? getScoreBand(score)
    : { label: "", color: "#0A1628" };
  const when = new Date(s.createdAt || Date.now()).toLocaleString();
  const fileName = (s.file && s.file.name) || "filing.pdf";
  const court = (s.court && (s.court.short || s.court.name)) || "-";
  const caseType = (s.caseType && s.caseType.name) || "-";

  const sevRank = { critical: 0, warning: 1, minor: 2 };
  const sorted = [...defects].sort((a, b) =>
    (sevRank[a.severity] ?? 3) - (sevRank[b.severity] ?? 3) || (a.page - b.page));

  const checklist = readinessRows(stats);

  const checklistHtml = checklist.length ? checklist.map(r => `
    <tr>
      <td>${escapeHtml(r.name)}<div class="rule">${escapeHtml(r.rule)}</div></td>
      <td class="status status--${escapeHtml(r.raw)}">${escapeHtml(r.status)}</td>
      <td>${escapeHtml(r.detail)}</td>
    </tr>`).join("") : `<tr><td colspan="3">No checks recorded.</td></tr>`;

  const defectsHtml = sorted.length ? sorted.map(d => `
    <div class="defect defect--${escapeHtml(d.severity)}">
      <div class="defect__head">
        <span class="sev sev--${escapeHtml(d.severity)}">${escapeHtml(d.severity)}</span>
        <span class="defect__title">${escapeHtml(d.title)}</span>
        <span class="defect__page">p.${escapeHtml(d.page)}</span>
      </div>
      <div class="defect__desc">${escapeHtml(d.desc)}</div>
      <div class="defect__rule"><strong>Rule:</strong> ${escapeHtml(d.rule)}</div>
      <div class="defect__fix"><strong>What to do:</strong> ${escapeHtml(d.fix)}</div>
    </div>`).join("") : `<p class="none">No defects detected. Have a qualified advocate review before filing.</p>`;

  const counts = {
    critical: defects.filter(d => d.severity === "critical").length,
    warning: defects.filter(d => d.severity === "warning").length,
    minor: defects.filter(d => d.severity === "minor").length,
  };

  const html = `<!doctype html><html><head><meta charset="utf-8">
  <title>Filing Readiness Report - ${escapeHtml(fileName)}</title>
  <style>
    * { box-sizing: border-box; }
    body { font-family: Georgia, "Times New Roman", serif; color: #11203B; margin: 0; padding: 40px; line-height: 1.5; }
    h1 { font-size: 22px; margin: 0 0 4px; }
    h2 { font-size: 15px; margin: 28px 0 10px; border-bottom: 2px solid #11203B; padding-bottom: 4px; }
    .sub { color: #5B6577; font-size: 12px; }
    .meta { margin: 16px 0; font-size: 12px; color: #2A3344; }
    .meta span { display: inline-block; margin-right: 18px; }
    .scorebox { display: flex; align-items: center; gap: 16px; margin: 16px 0 8px; padding: 14px 18px; border: 1px solid #E5E8EE; border-radius: 10px; }
    .scorenum { font-size: 40px; font-weight: 700; line-height: 1; color: ${band.color}; }
    .scoreband { font-size: 14px; font-weight: 700; color: ${band.color}; }
    .summary { font-size: 12px; color: #5B6577; }
    table { width: 100%; border-collapse: collapse; font-family: Arial, sans-serif; font-size: 12px; }
    th { text-align: left; color: #5B6577; font-size: 10px; text-transform: uppercase; letter-spacing: .05em; padding: 6px 8px; border-bottom: 1px solid #E5E8EE; }
    td { padding: 8px; border-bottom: 1px solid #EEF1F5; vertical-align: top; }
    .rule { color: #828B9D; font-size: 10px; margin-top: 2px; }
    .status { font-weight: 700; white-space: nowrap; }
    .status--pass { color: #167A3C; } .status--warn { color: #B0640A; } .status--fail { color: #C2261B; }
    .defect { border: 1px solid #E5E8EE; border-left: 3px solid #B7BECC; border-radius: 8px; padding: 12px 14px; margin: 10px 0; page-break-inside: avoid; }
    .defect--critical { border-left-color: #D6293E; } .defect--warning { border-left-color: #C2790B; } .defect--minor { border-left-color: #B9BCD4; }
    .defect__head { display: flex; align-items: center; gap: 10px; margin-bottom: 6px; }
    .defect__title { font-weight: 700; font-family: Arial, sans-serif; font-size: 13px; flex: 1; }
    .defect__page { color: #828B9D; font-family: Arial, sans-serif; font-size: 11px; }
    .sev { font-family: Arial, sans-serif; font-size: 9px; font-weight: 700; text-transform: uppercase; padding: 2px 6px; border-radius: 4px; }
    .sev--critical { background: #FEECEC; color: #C2261B; } .sev--warning { background: #FFF7E0; color: #A16207; } .sev--minor { background: #FCF1DF; color: #B0640A; }
    .defect__desc, .defect__rule, .defect__fix { font-family: Arial, sans-serif; font-size: 11.5px; color: #2A3344; margin-top: 4px; }
    .defect__rule { color: #5B6577; } .none { color: #167A3C; font-family: Arial, sans-serif; }
    .disclaimer { margin-top: 28px; padding: 12px 14px; background: #F7F8FB; border: 1px solid #E5E8EE; border-radius: 8px; font-family: Arial, sans-serif; font-size: 10.5px; color: #5B6577; }
    @media print { body { padding: 0; } @page { margin: 18mm; } }
  </style></head><body>
    <h1>Filing Readiness Report</h1>
    <div class="sub">myfiling.ai - formatting &amp; registry-requirement scrutiny</div>
    <div class="meta">
      <span><strong>File:</strong> ${escapeHtml(fileName)}</span>
      <span><strong>Court:</strong> ${escapeHtml(court)}</span>
      <span><strong>Case type:</strong> ${escapeHtml(caseType)}</span>
      <span><strong>Generated:</strong> ${escapeHtml(when)}</span>
    </div>
    <div class="scorebox">
      <div class="scorenum">${escapeHtml(score)}</div>
      <div>
        <div class="scoreband">${escapeHtml(band.label)}</div>
        <div class="summary">${counts.critical} critical · ${counts.warning} warning · ${counts.minor} minor</div>
      </div>
    </div>

    <h2>Filing Readiness Checklist</h2>
    <table>
      <thead><tr><th>Check</th><th>Status</th><th>Detail</th></tr></thead>
      <tbody>${checklistHtml}</tbody>
    </table>

    <h2>Defects &amp; Remediation</h2>
    ${defectsHtml}

    <div class="disclaimer">
      This report covers <strong>formatting and registry-filing requirements</strong>
      (paper, margins, type, pagination, index, court fee, vakalatnama, limitation,
      certified copy, affidavit). It does <strong>not</strong> assess the legal merit
      or substance of the matter, and is not a guarantee against registry objection.
      Have a qualified advocate review the filing before submission.
    </div>
    <script>window.onload = function(){ setTimeout(function(){ window.print(); }, 250); };</script>
  </body></html>`;

  const w = window.open("", "_blank");
  if (!w) return false;           // popup blocked - caller can toast a hint
  w.document.open();
  w.document.write(html);
  w.document.close();
  return true;
}

export { downloadReport };
