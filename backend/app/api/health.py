"""
=============================================================================
health.py - Health Check Endpoint
=============================================================================
Provides a fast, zero-dependency GET /api/health endpoint.
Used by frontend and developers to verify that the FastAPI backend is running.
=============================================================================
"""

from fastapi import APIRouter
from datetime import datetime

router = APIRouter(prefix="/api", tags=["Health"])


@router.get("/health")
def health_check():
    """
    Returns server operational status and current server timestamp.
    """
    return {
        "status": "ok",
        "message": "Backend is healthy and operational",
        "timestamp": datetime.utcnow().isoformat() + "Z"
    }
