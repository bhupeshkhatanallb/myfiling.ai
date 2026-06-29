"""
Main entry point for PDF analysis pipeline.

Orchestrates PDF parsing, structure detection, rule matching, and defect aggregation.
"""

import logging
import tempfile
import uuid
from datetime import datetime
from typing import BinaryIO, Dict, Any

logger = logging.getLogger(__name__)


def analyze_pdf(
    file: BinaryIO,
    court_id: str,
    case_type_id: str,
) -> Dict[str, Any]:
    """
    Analyze a PDF filing for defects.

    Args:
        file: PDF file object (binary)
        court_id: Court identifier (e.g., "sc", "dhc")
        case_type_id: Case type identifier (e.g., "wp", "ca")

    Returns:
        {
            "defects": [
                {
                    "id": "d1",
                    "title": "Court Fee Stamp Missing",
                    "severity": "critical",
                    "page": 1,
                    "description": "...",
                    "remediation": "..."
                },
                ...
            ],
            "score": 30,
            "confidence": 0.95,
            "analysis_id": "uuid",
            "created_at": "2026-06-05T10:30:00Z"
        }

    Raises:
        ValueError: If file is not a valid PDF
        RuntimeError: If analysis fails
    """
    analysis_id = str(uuid.uuid4())
    created_at = datetime.utcnow().isoformat() + "Z"

    try:
        logger.info(f"Starting analysis for court={court_id}, case_type={case_type_id}")

        # Save uploaded file to temp location
        temp_path = None
        try:
            with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as tmp:
                temp_path = tmp.name
                tmp.write(file.read())

            # Step 1: Run structure detectors (high-precision analysis)
            from .detectors import DetectorEngine
            detector_engine = DetectorEngine(temp_path)
            structure_results = detector_engine.run_all(parallel=True)
            structure_defects = structure_results.get("defects", [])
            structure_confidence = structure_results.get("total_confidence", 0.0)

            logger.info(f"Structure detection complete: {len(structure_defects)} defects found")

            # Step 2: Run rule matching (future integration)
            # from .rules.rule_engine import RuleEngine
            # rule_engine = RuleEngine(court_id)
            # rule_defects = rule_engine.analyze(temp_path, court_id, case_type_id)
            rule_defects = []
            rule_confidence = 0.0

            # Step 3: Aggregate defects
            all_defects = structure_defects + rule_defects

            # De-duplicate defects by ID
            seen_ids = set()
            unique_defects = []
            for defect in all_defects:
                defect_id = defect.get("id")
                if defect_id not in seen_ids:
                    seen_ids.add(defect_id)
                    unique_defects.append(defect)

            # Step 4: Calculate score based on defects
            score = calculate_score(unique_defects)

            # Average confidence across all components
            confidences = [structure_confidence, rule_confidence] if rule_confidence else [structure_confidence]
            overall_confidence = sum(confidences) / len(confidences) if confidences else 0.0

            logger.info(f"Analysis complete: score={score}, confidence={overall_confidence:.2f}")

            return {
                "defects": unique_defects,
                "score": score,
                "confidence": round(overall_confidence, 2),
                "analysis_id": analysis_id,
                "created_at": created_at,
            }

        finally:
            # Cleanup temp file
            if temp_path:
                import os
                try:
                    os.remove(temp_path)
                except:
                    pass

    except Exception as e:
        logger.error(f"Analysis failed: {str(e)}", exc_info=True)
        raise RuntimeError(f"PDF analysis failed: {str(e)}")


def calculate_score(defects: list) -> int:
    """
    Calculate compliance score based on defects found.

    Score ranges from 0-100:
    - 0 critical defects: 85-100 (depends on warnings/minors)
    - 1+ critical defects: 0-60
    - Multiple warnings: -10 points each
    - Multiple minors: -2 points each
    """
    score = 100

    critical_count = sum(1 for d in defects if d.get("severity") == "critical")
    warning_count = sum(1 for d in defects if d.get("severity") == "warning")
    minor_count = sum(1 for d in defects if d.get("severity") == "minor")

    # Critical defects heavily penalize score
    if critical_count > 0:
        score = max(10, 60 - (critical_count * 15))
    else:
        # No critical defects: deduct points for warnings and minors
        score = 100 - (warning_count * 8) - (minor_count * 2)
        score = max(50, score)  # Minimum 50 if no critical issues

    return max(0, min(100, score))
