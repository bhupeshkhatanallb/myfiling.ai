"""
Shared data models across myfiling.ai.

Defines Defect, AnalysisResult, and other data structures
used by detector, API, and frontend.
"""

from dataclasses import dataclass, field
from typing import List, Optional
from datetime import datetime
from enum import Enum


class SeverityLevel(Enum):
    """Defect severity levels."""
    CRITICAL = "critical"
    MINOR = "minor"
    WARNING = "warning"


@dataclass
class Defect:
    """A single defect found in a filing."""

    id: str                    # Unique defect identifier
    title: str                 # Display name
    severity: str              # "critical" | "minor" | "warning"
    page: int | str            # Page number or range
    description: str           # User-facing description
    rule: str                  # Relevant rule citation
    remediation: str           # How to fix it
    confidence: float = 0.95   # Detection confidence (0-1)

    def to_dict(self):
        """Convert to dictionary."""
        return {
            "id": self.id,
            "title": self.title,
            "severity": self.severity,
            "page": self.page,
            "description": self.description,
            "rule": self.rule,
            "remediation": self.remediation,
            "confidence": self.confidence,
        }


@dataclass
class AnalysisResult:
    """Complete analysis result for a filing."""

    defects: List[Defect]
    score: int                      # 0-100
    confidence: float               # 0-1 (overall confidence)
    analysis_id: str
    created_at: datetime
    file_name: Optional[str] = None
    court_id: Optional[str] = None
    case_type_id: Optional[str] = None
    metadata: dict = field(default_factory=dict)

    def to_dict(self):
        """Convert to dictionary (API response)."""
        return {
            "analysis_id": self.analysis_id,
            "defects": [d.to_dict() for d in self.defects],
            "score": self.score,
            "confidence": self.confidence,
            "created_at": self.created_at.isoformat(),
            "file_name": self.file_name,
            "court_id": self.court_id,
            "case_type_id": self.case_type_id,
        }


@dataclass
class Filing:
    """A legal filing submitted for analysis."""

    filing_id: str
    file_name: str
    file_size: int              # bytes
    court_id: str
    case_type_id: str
    uploaded_at: datetime
    analyzed_at: Optional[datetime] = None
    analysis_id: Optional[str] = None
    score: Optional[int] = None
    status: str = "pending"     # pending | analyzed | filed | archived


@dataclass
class User:
    """User account."""

    user_id: str
    email: str
    name: str
    organization: str
    created_at: datetime
    last_login: Optional[datetime] = None
    is_active: bool = True
