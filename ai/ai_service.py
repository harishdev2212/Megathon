"""
=============================================================================
ai_service.py - Google Gemini AI Abstraction Layer
=============================================================================
This file isolates ALL direct interactions with the Google Gemini API.

WHY ISOLATION MATTERS:
By keeping all Gemini SDK calls in this single file, the rest of your app
(FastAPI routers, UI, task engine) never touches raw API details. If you ever
want to change models, adjust temperature, or add system instructions,
you only modify this file!
=============================================================================
"""

import os
from typing import Optional
from google import genai
from google.genai import types

# Default model recommended for fast, cost-effective, high-quality reasoning
DEFAULT_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")

# Supported image MIME types for multimodal inspection
SUPPORTED_IMAGE_TYPES = {
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/gif",
    "image/heic",
    "image/heif",
}


def get_gemini_client(api_key: Optional[str] = None) -> genai.Client:
    """
    Initializes and returns a Google GenAI client instance.
    
    Reads GEMINI_API_KEY from the environment if no key is explicitly passed.
    Raises a ValueError with clear beginner instructions if the key is missing.
    """
    resolved_key = api_key or os.getenv("GEMINI_API_KEY")

    if not resolved_key or resolved_key.strip() == "" or resolved_key == "your_gemini_api_key_here":
        raise ValueError(
            "GEMINI_API_KEY is not set! Please add your API key to the .env file. "
            "Get a key for free from: https://aistudio.google.com/app/apikey"
        )

    # Initialize client using the official Google GenAI SDK
    return genai.Client(api_key=resolved_key.strip())


def generate_text(
    prompt: str,
    system_instruction: Optional[str] = None,
    model: Optional[str] = None,
    temperature: float = 0.7,
) -> str:
    """
    FEATURE 1: Clean, reusable text generation using Google Gemini.

    Parameters:
        prompt (str): The user's query or instruction.
        system_instruction (str, optional): System-level persona or rule for Gemini.
        model (str, optional): Gemini model identifier (defaults to DEFAULT_MODEL).
        temperature (float): Controls randomness (0.0 = deterministic, 1.0 = creative).

    Returns:
        str: The generated response text from Gemini.
    """
    if not prompt or not prompt.strip():
        raise ValueError("Prompt cannot be empty. Please provide text input.")

    active_model = model or DEFAULT_MODEL
    client = get_gemini_client()

    # Configure generation parameters
    config = types.GenerateContentConfig(
        temperature=temperature,
        system_instruction=system_instruction.strip() if system_instruction else None,
    )

    # Call Gemini model
    response = client.models.generate_content(
        model=active_model,
        contents=prompt.strip(),
        config=config,
    )

    if not response.text:
        return "No text returned by the model."

    return response.text


def analyze_image(
    image_bytes: bytes,
    mime_type: str,
    prompt: str = "Analyze this image in detail and explain key elements.",
    system_instruction: Optional[str] = None,
    model: Optional[str] = None,
    temperature: float = 0.4,
) -> str:
    """
    FEATURE 2: Reusable multimodal image analysis capability.
    
    Architecture:
        image + prompt -> Gemini -> analysis

    Parameters:
        image_bytes (bytes): Raw binary bytes of the uploaded image.
        mime_type (str): MIME type (e.g. image/png, image/jpeg).
        prompt (str): Text prompt or instruction for the visual analysis.
        system_instruction (str, optional): System persona/role.
        model (str, optional): Gemini model identifier.
        temperature (float): Controls creativity.

    Returns:
        str: Multimodal response text from Gemini.
    """
    if not image_bytes or len(image_bytes) == 0:
        raise ValueError("Image file is empty. Please upload a valid image.")

    normalized_mime = mime_type.lower().strip()
    if normalized_mime == "image/jpg":
        normalized_mime = "image/jpeg"

    if normalized_mime not in SUPPORTED_IMAGE_TYPES:
        raise ValueError(
            f"Unsupported image type '{mime_type}'. Supported formats: {', '.join(sorted(SUPPORTED_IMAGE_TYPES))}"
        )

    if not prompt or not prompt.strip():
        prompt = "Analyze this image in detail and explain key elements."

    active_model = model or DEFAULT_MODEL
    client = get_gemini_client()

    # Create multimodal inline Part
    image_part = types.Part.from_bytes(data=image_bytes, mime_type=normalized_mime)

    config = types.GenerateContentConfig(
        temperature=temperature,
        system_instruction=system_instruction.strip() if system_instruction else None,
    )

    response = client.models.generate_content(
        model=active_model,
        contents=[image_part, prompt.strip()],
        config=config,
    )

    if not response.text:
        return "No text returned by the model for this image."

    return response.text


def generate_gemini_response(
    prompt: str,
    system_instruction: Optional[str] = None,
    model: Optional[str] = None,
    temperature: float = 0.7,
) -> str:
    """
    Backward-compatible alias for generate_text().
    Preserves compatibility with existing starter code and tests.
    """
    return generate_text(
        prompt=prompt,
        system_instruction=system_instruction,
        model=model,
        temperature=temperature,
    )
