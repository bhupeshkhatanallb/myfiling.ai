// Filter and sort defects by severity

function filterDefectsBySeverity(defects, severity) {
  if (severity === "all") return defects;
  return defects.filter(d => d.severity === severity);
}

function sortDefectsBySeverity(defects) {
  const sevOrder = { critical: 0, minor: 1, warning: 2 };
  return [...defects].sort((a, b) => sevOrder[a.severity] - sevOrder[b.severity]);
}

function countDefectsBySeverity(defects) {
  return {
    all: defects.length,
    critical: defects.filter(d => d.severity === "critical").length,
    minor: defects.filter(d => d.severity === "minor").length,
    warning: defects.filter(d => d.severity === "warning").length,
  };
}

export { filterDefectsBySeverity, sortDefectsBySeverity, countDefectsBySeverity };