"""
Detector implementations.

Importing this package imports every detector module, which triggers their
``@register`` decorators and populates the registry. The processor then discovers
them by ``kind`` (page / conditional / validator).
"""

from . import page          # noqa: F401  per-page detectors (Stage 4)
from . import filing        # noqa: F401  filing-requirement (whole-doc text) checks
from . import conditional   # noqa: F401  page-specific detectors (Stage 6)

__all__ = ["page", "filing", "conditional"]
