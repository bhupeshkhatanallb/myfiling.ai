"""
SQLite persistence for recent filings.

A deliberately tiny store: one table, one JSON blob per analysed filing, plus a
few indexed columns for the sidebar list. Server-side so recents are shared
across browsers/devices (unlike the previous per-browser localStorage).

The DB file lives next to the server (``recents.db``) unless RECENTS_DB_PATH is
set. Connections are opened per-call (SQLite is happiest that way under a
threaded ASGI server) with WAL enabled for concurrent reads during a write.
"""

from __future__ import annotations

import json
import os
import sqlite3
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional

_DEFAULT_PATH = Path(__file__).resolve().parent / "recents.db"
DB_PATH = Path(os.environ.get("RECENTS_DB_PATH", str(_DEFAULT_PATH)))

# Keep the sidebar history bounded so the table doesn't grow without limit.
MAX_RECENTS = 50


def _connect() -> sqlite3.Connection:
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL;")
    conn.execute("PRAGMA foreign_keys=ON;")
    return conn


def init_db() -> None:
    """Create the table if it doesn't exist. Safe to call on every startup."""
    with _connect() as conn:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS recent_filings (
                id            INTEGER PRIMARY KEY AUTOINCREMENT,
                analysis_id   TEXT    NOT NULL,
                file_name     TEXT    NOT NULL,
                court_id      TEXT,
                court_label   TEXT,
                case_type_id  TEXT,
                score         INTEGER,
                created_at    TEXT    NOT NULL,
                session_json  TEXT    NOT NULL
            );
            """
        )
        conn.execute(
            "CREATE INDEX IF NOT EXISTS idx_recent_created "
            "ON recent_filings (created_at DESC);"
        )
        conn.commit()


def add_recent(
    *,
    analysis_id: str,
    file_name: str,
    court_id: Optional[str],
    court_label: Optional[str],
    case_type_id: Optional[str],
    score: Optional[int],
    created_at: Optional[str],
    session: Dict[str, Any],
) -> None:
    """
    Insert a completed analysis. De-dupes by file_name (a re-analysis of the same
    file replaces the older entry), then trims the table to MAX_RECENTS.
    """
    created_at = created_at or datetime.now(timezone.utc).isoformat()
    with _connect() as conn:
        conn.execute("DELETE FROM recent_filings WHERE file_name = ?;", (file_name,))
        conn.execute(
            """
            INSERT INTO recent_filings
                (analysis_id, file_name, court_id, court_label, case_type_id,
                 score, created_at, session_json)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?);
            """,
            (
                analysis_id,
                file_name,
                court_id,
                court_label,
                case_type_id,
                score,
                created_at,
                json.dumps(session),
            ),
        )
        # Trim anything beyond the newest MAX_RECENTS rows.
        conn.execute(
            """
            DELETE FROM recent_filings
            WHERE id NOT IN (
                SELECT id FROM recent_filings
                ORDER BY created_at DESC, id DESC
                LIMIT ?
            );
            """,
            (MAX_RECENTS,),
        )
        conn.commit()


def list_recents(limit: int = MAX_RECENTS) -> List[Dict[str, Any]]:
    """Return recent filings, newest first, in the shape the sidebar expects."""
    with _connect() as conn:
        rows = conn.execute(
            """
            SELECT analysis_id, file_name, court_id, court_label, case_type_id,
                   score, created_at, session_json
            FROM recent_filings
            ORDER BY created_at DESC, id DESC
            LIMIT ?;
            """,
            (limit,),
        ).fetchall()

    out: List[Dict[str, Any]] = []
    for r in rows:
        try:
            session = json.loads(r["session_json"])
        except (ValueError, TypeError):
            session = None
        out.append(
            {
                "analysisId": r["analysis_id"],
                "name": r["file_name"],
                "courtId": r["court_id"],
                "court": r["court_label"],
                "caseTypeId": r["case_type_id"],
                "score": r["score"],
                "createdAt": r["created_at"],
                "session": session,
            }
        )
    return out


def clear_recents() -> None:
    with _connect() as conn:
        conn.execute("DELETE FROM recent_filings;")
        conn.commit()
