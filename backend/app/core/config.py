"""
=============================================================================
config.py - Application Settings & Environment Loader
=============================================================================
Loads environment settings from the project root .env file.
This prevents sensitive API keys from being hardcoded in application code.
=============================================================================
"""

import os
from pathlib import Path
from dotenv import load_dotenv

# Locate project root (Megathon/) regardless of where the app is launched from
CURRENT_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = CURRENT_DIR.parent.parent.parent

# Load .env file from project root or backend folder
env_path_root = PROJECT_ROOT / ".env"
env_path_backend = CURRENT_DIR.parent.parent / ".env"

if env_path_root.exists():
    load_dotenv(dotenv_path=env_path_root)
elif env_path_backend.exists():
    load_dotenv(dotenv_path=env_path_backend)
else:
    load_dotenv()  # Fallback to current working directory

# Read configuration variables with sensible defaults
GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
HOST: str = os.getenv("HOST", "127.0.0.1")
PORT: int = int(os.getenv("PORT", "8000"))

# Parse allowed origins for CORS
raw_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173")
ALLOWED_ORIGINS = [origin.strip() for origin in raw_origins.split(",") if origin.strip()]
