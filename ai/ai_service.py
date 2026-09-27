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
DEFAULT_MODEL = "gemini-2.5-flash"


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
    return genai.Client(api_key=resolved_key)


def generate_gemini_response(
    prompt: str,
    system_instruction: Optional[str] = None,
    model: str = DEFAULT_MODEL,
    temperature: float = 0.7,
) -> str:
    """
    Sends a text prompt to Google Gemini and returns the generated text.

    Parameters:
        prompt (str): The user's query or instruction.
        system_instruction (str, optional): System-level persona or rule for Gemini.
        model (str): Gemini model identifier (default: gemini-2.5-flash).
        temperature (float): Controls randomness (0.0 = deterministic, 1.0 = creative).

    Returns:
        str: The generated response text from Gemini.
    """
    if not prompt or not prompt.strip():
        raise ValueError("Prompt cannot be empty.")

    client = get_gemini_client()

    # Configure generation parameters if system instructions or custom temperature are provided
    config = types.GenerateContentConfig(
        temperature=temperature,
        system_instruction=system_instruction if system_instruction else None,
    )

    # Call the Gemini model
    response = client.models.generate_content(
        model=model,
        contents=prompt.strip(),
        config=config,
    )

    if not response.text:
        return "No text returned by the model."

    return response.text
