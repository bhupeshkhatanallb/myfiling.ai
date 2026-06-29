// Indian courts and tribunals for filing selection.
// High Court (Delhi) is the first launch court; Supreme Court is queued next.
// The active court is listed first so COURTS[0] resolves to an enabled court.
const COURTS = [
  { id: "dhc", name: "Delhi High Court", short: "DHC", enabled: true, comingSoon: false },
  { id: "sc", name: "Supreme Court of India", short: "SC", enabled: false, comingSoon: true },
  { id: "bhc", name: "Bombay High Court", short: "BHC", enabled: false, comingSoon: true },
  { id: "chc", name: "Calcutta High Court", short: "CHC", enabled: false, comingSoon: true },
  { id: "mhc", name: "Madras High Court", short: "MHC", enabled: false, comingSoon: true },
  { id: "khc", name: "Karnataka High Court", short: "KHC", enabled: false, comingSoon: true },
  { id: "nclt", name: "National Company Law Tribunal", short: "NCLT", enabled: false, comingSoon: true },
  { id: "kat", name: "Kathmandu District Court (Test)", short: "KAT", enabled: false, comingSoon: true },
];

export default COURTS;