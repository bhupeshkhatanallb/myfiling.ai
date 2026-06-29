"""Page detectors - run on every page's metadata (Stage 4)."""

from . import formatting       # noqa: F401  paper/margin/font/spacing/quote
from . import page_numbering   # noqa: F401  folio numbering
from . import structure        # noqa: F401  index format / section order
from . import quality_checks   # noqa: F401  scanned-page DPI/blur quality
from . import text_layer       # noqa: F401  searchable/selectable text layer

__all__ = ["formatting", "page_numbering", "structure", "quality_checks", "text_layer"]
