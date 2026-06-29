"""
Feature flags — runtime on/off switches for whole detectors or specific checks.

Kept in one place so a temporarily-disabled check is easy to find and re-enable,
and so the detector code that implements it is preserved (not deleted) while it is
switched off. Each flag documents WHY it is off and WHAT to fix before turning it
back on.
"""

from __future__ import annotations

import os


def _env_bool(name: str, default: bool) -> bool:
    """Read a boolean override from the environment ("1/true/yes/on")."""
    v = os.getenv(name)
    if v is None:
        return default
    return v.strip().lower() in ("1", "true", "yes", "on")


# --------------------------------------------------------------------------- #
# PAGINATION / WRITTEN-FOLIO checks.
#
# DISABLED 2026-06-26: the written page-number (folio) extraction is not
# reliable enough on the current corpus — folios printed in the margin are
# frequently missed, producing false "No Page Numbers", "Non-Sequential", and
# index folio-mismatch findings. Until folio detection is improved, every check
# that DEPENDS on reading written folio numbers is suppressed:
#
#   * PageNumberingDetector          — all d_pgn_* findings
#   * IndexValidator folio mismatch  — "index entry lands on the wrong page"
#   * IndexFormatDetector page-refs  — d_idx_003 listed-page sanity check
#
# Re-enable by flipping this to True (or setting ENABLE_PAGINATION_CHECKS=1).
# Non-folio index checks (index present, listed-but-missing section, annexure
# numbering) stay ON — they do not rely on folio detection.
# --------------------------------------------------------------------------- #
PAGINATION_CHECKS_ENABLED: bool = _env_bool("ENABLE_PAGINATION_CHECKS", False)
