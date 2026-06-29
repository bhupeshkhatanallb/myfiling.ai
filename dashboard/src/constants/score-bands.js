// Score band definitions and thresholds

// Kept in sync with utils/score-calculator.js:getScoreBand and Gauge.jsx.
const SCORE_BANDS = {
  GREEN: { min: 75, max: 100, label: "Likely registry-ready", color: "#119366", soft: "#D8F0E6" },
  YELLOW: { min: 45, max: 74, label: "Fix issues before filing", color: "#C2790B", soft: "#FBEFD7" },
  RED: { min: 0, max: 44, label: "Not ready - must fix", color: "#D6293E", soft: "#FBDCE0" },
};

const SCORE_THRESHOLDS = {
  CRITICAL_CAP: 40,
  CRITICAL_PENALTY: 10,
  MINOR_PENALTY: 15,
};

export { SCORE_BANDS, SCORE_THRESHOLDS };