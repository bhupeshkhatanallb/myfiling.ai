"""
SQLite-backed user accounts + sessions for myfiling.ai.

Deliberately tiny and dependency-free: password hashing uses stdlib PBKDF2-HMAC
(no bcrypt/passlib needed), sessions are opaque random tokens stored server-side
and carried in an HttpOnly cookie. Lives in the same DB file as recents (or
AUTH_DB_PATH) so a single SQLite file holds everything.

Tables:
  users    (id, email, password_hash, name, created_at)
  sessions (token, user_id, created_at, expires_at)
"""

from __future__ import annotations

import hashlib
import hmac
import os
import secrets
import sqlite3
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any, Dict, Optional

# Share the recents DB file by default so one SQLite file holds everything; allow
# an explicit override.
_DEFAULT_PATH = Path(
    os.environ.get("RECENTS_DB_PATH", str(Path(__file__).resolve().parent / "recents.db"))
)
DB_PATH = Path(os.environ.get("AUTH_DB_PATH", str(_DEFAULT_PATH)))

# PBKDF2 parameters. 200k iterations is a sensible 2026 default for a side app.
_PBKDF2_ITERATIONS = 200_000
_SALT_BYTES = 16
_SESSION_DAYS = 30


def _connect() -> sqlite3.Connection:
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL;")
    return conn


def init_db() -> None:
    """Create the users + sessions tables if absent. Safe on every startup."""
    with _connect() as conn:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS users (
                id            INTEGER PRIMARY KEY AUTOINCREMENT,
                email         TEXT    NOT NULL UNIQUE,
                password_hash TEXT    NOT NULL,
                name          TEXT,
                created_at    TEXT    NOT NULL
            );
            """
        )
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS sessions (
                token      TEXT    PRIMARY KEY,
                user_id    INTEGER NOT NULL,
                created_at TEXT    NOT NULL,
                expires_at TEXT    NOT NULL
            );
            """
        )
        conn.execute(
            "CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions (user_id);"
        )
        conn.commit()


# --------------------------------------------------------------------------- #
# Password hashing (stdlib PBKDF2-HMAC-SHA256).
# --------------------------------------------------------------------------- #
def _hash_password(password: str) -> str:
    salt = secrets.token_bytes(_SALT_BYTES)
    dk = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, _PBKDF2_ITERATIONS)
    return f"pbkdf2_sha256${_PBKDF2_ITERATIONS}${salt.hex()}${dk.hex()}"


def _verify_password(password: str, stored: str) -> bool:
    try:
        algo, iters, salt_hex, hash_hex = stored.split("$")
        if algo != "pbkdf2_sha256":
            return False
        dk = hashlib.pbkdf2_hmac(
            "sha256", password.encode("utf-8"), bytes.fromhex(salt_hex), int(iters)
        )
        return hmac.compare_digest(dk.hex(), hash_hex)
    except (ValueError, TypeError):
        return False


# --------------------------------------------------------------------------- #
# Users.
# --------------------------------------------------------------------------- #
def _norm_email(email: str) -> str:
    return (email or "").strip().lower()


class AuthError(Exception):
    """Raised for expected auth failures (duplicate email, bad credentials)."""


def create_user(email: str, password: str, name: Optional[str] = None) -> Dict[str, Any]:
    """Create a user. Raises AuthError if the email is taken or input is invalid."""
    email = _norm_email(email)
    if not email or "@" not in email:
        raise AuthError("Please enter a valid email address.")
    if not password or len(password) < 6:
        raise AuthError("Password must be at least 6 characters.")
    now = datetime.now(timezone.utc).isoformat()
    with _connect() as conn:
        existing = conn.execute(
            "SELECT id FROM users WHERE email = ?;", (email,)
        ).fetchone()
        if existing:
            raise AuthError("An account with this email already exists.")
        cur = conn.execute(
            "INSERT INTO users (email, password_hash, name, created_at) "
            "VALUES (?, ?, ?, ?);",
            (email, _hash_password(password), (name or "").strip() or None, now),
        )
        conn.commit()
        return {"id": cur.lastrowid, "email": email, "name": (name or "").strip() or None}


def authenticate(email: str, password: str) -> Dict[str, Any]:
    """Return the user dict if credentials are valid, else raise AuthError."""
    email = _norm_email(email)
    with _connect() as conn:
        row = conn.execute(
            "SELECT id, email, password_hash, name FROM users WHERE email = ?;",
            (email,),
        ).fetchone()
    if not row or not _verify_password(password, row["password_hash"]):
        raise AuthError("Incorrect email or password.")
    return {"id": row["id"], "email": row["email"], "name": row["name"]}


# --------------------------------------------------------------------------- #
# Sessions.
# --------------------------------------------------------------------------- #
def create_session(user_id: int) -> str:
    """Create a session and return its opaque token."""
    token = secrets.token_urlsafe(32)
    now = datetime.now(timezone.utc)
    with _connect() as conn:
        conn.execute(
            "INSERT INTO sessions (token, user_id, created_at, expires_at) "
            "VALUES (?, ?, ?, ?);",
            (
                token,
                user_id,
                now.isoformat(),
                (now + timedelta(days=_SESSION_DAYS)).isoformat(),
            ),
        )
        conn.commit()
    return token


def user_for_token(token: Optional[str]) -> Optional[Dict[str, Any]]:
    """Resolve a session token to a user dict, or None if invalid/expired."""
    if not token:
        return None
    now = datetime.now(timezone.utc).isoformat()
    with _connect() as conn:
        row = conn.execute(
            """
            SELECT u.id, u.email, u.name, s.expires_at
            FROM sessions s JOIN users u ON u.id = s.user_id
            WHERE s.token = ?;
            """,
            (token,),
        ).fetchone()
        if not row:
            return None
        if row["expires_at"] < now:
            conn.execute("DELETE FROM sessions WHERE token = ?;", (token,))
            conn.commit()
            return None
    return {"id": row["id"], "email": row["email"], "name": row["name"]}


def destroy_session(token: Optional[str]) -> None:
    if not token:
        return
    with _connect() as conn:
        conn.execute("DELETE FROM sessions WHERE token = ?;", (token,))
        conn.commit()


SESSION_COOKIE = "mf_session"
SESSION_MAX_AGE = _SESSION_DAYS * 24 * 3600
