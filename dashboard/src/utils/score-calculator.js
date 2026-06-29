// Filing-readiness score — MIRRORS server.py:calculate_score so the demo/preset
// path and any client-side computation agree with the backend. For real
// analyses the score comes from the API (data.score); this is the fallback.

function calculateScore(defectsToUse, presetScore) {
  if (presetScore !== undefined) {
    return presetScore;
  }

  const critical = defectsToUse.filter(d => d.severity === "critical").length;
  const warning = defectsToUse.filter(d => d.severity === "warning").length;
  const minor = defectsToUse.filter(d => d.severity === "minor").length;

  let score;
  if (critical > 0) {
    score = 45 - (critical - 1) * 12 - warning * 2 - minor;
  } else {
    score = 100 - warning * 6 - minor * 2;
    if (warning <= 2) score = Math.max(80, score);
    score = Math.max(55, score);
  }
  return Math.max(0, Math.min(100, score));
}

// Score band: green (75+) likely registry-ready, amber (45-74) fix issues,
// red (<45) must fix. Labels reframed (advocate audit): the tool checks
// formatting + filing-requirement presence, not legal merit, so we avoid
// "safe to file" guarantees.
function getScoreBand(score) {
  if (score >= 75) return { color: "#119366", label: "Likely registry-ready", soft: "#D8F0E6" };
  if (score >= 45) return { color: "#C2790B", label: "Fix issues before filing", soft: "#FBEFD7" };
  return { color: "#D6293E", label: "Not ready — must fix", soft: "#FBDCE0" };
}

export { calculateScore, getScoreBand };
