"""
=============================================================================
ai.py - AI Test & Interaction Endpoints
=============================================================================
Exposes the POST /api/ai/test endpoint to test Google Gemini integration.
All AI generation is routed through the modular ai/ai_service.py layer.
=============================================================================
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from ai.ai_service import generate_gemini_response

router = APIRouter(prefix="/api/ai", tags=["AI"])


class PromptRequest(BaseModel):
    """
    Schema for incoming AI prompt requests.
    """
    prompt: str = Field(
        ...,
        min_length=1,
        max_length=4000,
        description="The prompt or question to send to Google Gemini.",
        example="Explain photosynthesis in 2 simple sentences."
    )


class PromptResponse(BaseModel):
    """
    Schema for AI generation responses.
    """
    success: bool
    prompt: str
    response: str


@router.post("/test", response_model=PromptResponse)
def test_gemini_ai(request: PromptRequest):
    """
    Accepts a prompt, calls the isolated Gemini service, and returns the response.
    """
    try:
        generated_text = generate_gemini_response(prompt=request.prompt)
        return PromptResponse(
            success=True,
            prompt=request.prompt,
            response=generated_text
        )
    except ValueError as val_err:
        # Typically raised when GEMINI_API_KEY is missing or invalid
        raise HTTPException(status_code=400, detail=str(val_err))
    except Exception as e:
        # Catches network, quota, or unexpected SDK errors
        raise HTTPException(
            status_code=500,
            detail=f"Gemini API Error: {str(e)}"
        )
