"""
=============================================================================
main.py - FastAPI Application Entrypoint
=============================================================================
This is the core web server entrypoint for the EduGenAI project.
It:
1. Adds project root to sys.path so 'ai' package can be imported anywhere.
2. Configures CORS to allow your React frontend to talk to this backend.
3. Mounts modular API routers (/api/health, /api/ai).
4. Provides interactive API documentation at http://localhost:8000/docs.
=============================================================================
"""

import sys
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Ensure the project root is in sys.path so the 'ai' package is always discoverable
ROOT_DIR = Path(__file__).resolve().parent.parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from backend.app.core.config import ALLOWED_ORIGINS, HOST, PORT
from backend.app.api.health import router as health_router
from backend.app.api.ai import router as ai_router

# Initialize the FastAPI application
app = FastAPI(
    title="EduGenAI Hackathon API",
    description="Minimal, modular backend skeleton powered by FastAPI and Google Gemini.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure Cross-Origin Resource Sharing (CORS)
# Allows the React Vite frontend (running on http://localhost:5173) to communicate seamlessly
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS if ALLOWED_ORIGINS else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers
app.include_router(health_router)
app.include_router(ai_router)


@app.get("/", tags=["Root"])
def root():
    """
    Root endpoint with helpful links for beginners.
    """
    return {
        "project": "EduGenAI Hackathon Skeleton",
        "status": "online",
        "docs_url": "http://localhost:8000/docs",
        "endpoints": {
            "health": "/api/health",
            "ai_test": "/api/ai/test"
        }
    }


if __name__ == "__main__":
    import uvicorn
    print(f"🚀 Starting EduGenAI Backend on http://{HOST}:{PORT}")
    print(f"📖 Interactive Swagger Docs available at http://{HOST}:{PORT}/docs")
    uvicorn.run("backend.app.main:app", host=HOST, port=PORT, reload=True)
