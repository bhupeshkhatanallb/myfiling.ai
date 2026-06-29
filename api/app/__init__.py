"""
myfiling.ai Backend API

FastAPI-based REST API for legal filing analysis.
Orchestrates PDF processing and manages filing data.

Version: 0.1.0
"""

__version__ = "0.1.0"


def create_app():
    """Application factory for creating FastAPI app."""
    from fastapi import FastAPI
    from fastapi.middleware.cors import CORSMiddleware

    app = FastAPI(
        title="myfiling.ai API",
        description="Legal filing defect analysis API",
        version=__version__,
    )

    # CORS middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],  # Configure per environment
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Import and include routers
    from .routes import analysis, filings, courts, health

    app.include_router(analysis.router, prefix="/api")
    app.include_router(filings.router, prefix="/api")
    app.include_router(courts.router, prefix="/api")
    app.include_router(health.router, prefix="/api")

    return app
