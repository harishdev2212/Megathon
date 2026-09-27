"""
AI Package Initialization
Provides access to core Gemini services and pluggable task engines.
"""
from .ai_service import generate_gemini_response
from .task_engine import execute_task

__all__ = ["generate_gemini_response", "execute_task"]
