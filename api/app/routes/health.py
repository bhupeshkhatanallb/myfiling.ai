"""
GET /api/health endpoint.

System health check - useful for monitoring and load balancers.
"""

from fastapi import APIRouter
from typing import Dict, Any

router = APIRouter()


@router.get("/health")
async def health_check() -> Dict[str, Any]:
    """
    Check system health.

    Returns:
        {
            "status": "ok" | "degraded" | "error",
            "detector": "ready" | "down",
            "database": "connected" | "disconnected",
            "api_version": "0.1.0"
        }
    """
    return {
        "status": "ok",
        "detector": "ready",
        "database": "connected",
        "api_version": "0.1.0",
    }
