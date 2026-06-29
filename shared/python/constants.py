"""
Shared constants across myfiling.ai platform.

Used by detector, API, and frontend.
"""

# Severity levels for defects
SEVERITY_LEVELS = ["critical", "minor", "warning"]

# Court codes
COURT_CODES = {
    "sc": "Supreme Court of India",
    "dhc": "Delhi High Court",
    "bhc": "Bombay High Court",
    "chc": "Calcutta High Court",
    "mhc": "Madras High Court",
    "khc": "Karnataka High Court",
    "nclt": "National Company Law Tribunal",
    "kat": "Kathmandu District Court",
}

# Case type codes
CASE_TYPE_CODES = {
    "wp": "Writ Petition (Civil)",
    "wpc": "Writ Petition (Criminal)",
    "slp": "Special Leave Petition",
    "ca": "Civil Appeal",
    "cra": "Criminal Appeal",
    "rp": "Review Petition",
    "tp": "Transfer Petition",
}

# All defect identifiers
DEFECT_IDS = [
    "d1",   # Court Fee Stamp Missing
    "d2",   # Vakalatnama Not Found
    "d3",   # Affidavit Not Notarized
    "d6",   # Cause Title Missing 'Through:' Line
    "d7",   # Index Page References Mismatch
    "d10",  # Insufficient Left Margin
    "d11",  # Affidavit Deponent Name Clarity
    "d12",  # Certified Copy Stamp Format
]

# Score band thresholds (reference; the live score model is server.py:
# calculate_score). Reframed per the advocate audit: the score reflects
# formatting + filing-requirement readiness, not legal merit - so no "safe to
# file" guarantee.
SCORE_BANDS = {
    "ready": {"min": 75, "max": 100, "label": "Likely registry-ready"},
    "needs_work": {"min": 45, "max": 74, "label": "Fix issues before filing"},
    "must_fix": {"min": 0, "max": 44, "label": "Not ready - must fix"},
}

# Scoring parameters
CRITICAL_DEFECT_PENALTY = 10  # Per critical defect
MINOR_DEFECT_PENALTY = 15     # Per minor defect
CRITICAL_CAP = 40              # Max score if critical defect exists

# File upload limits
MAX_FILE_SIZE_MB = 50
ALLOWED_EXTENSIONS = ["pdf"]

# API configuration
API_TIMEOUT_SECONDS = 30
ANALYSIS_MAX_RETRIES = 3
