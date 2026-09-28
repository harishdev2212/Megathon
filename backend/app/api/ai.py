"""
=============================================================================
ai.py - AI Generation, Multimodal Vision & Task Engine Endpoints
=============================================================================
Provides clean, structured REST endpoints for:
1. POST /api/ai/generate      - Gemini text generation
2. POST /api/ai/analyze-image - Multimodal image + prompt analysis
3. POST /api/ai/task          - Modular task engine dispatch point
4. GET  /api/ai/tasks         - List registered modular tasks
5. POST /api/ai/test          - Backward-compatible test endpoint
=============================================================================
"""

from typing import Optional, Dict, Any, List
from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from pydantic import BaseModel, Field

from ai.ai_service import generate_text, analyze_image, DEFAULT_MODEL, SUPPORTED_IMAGE_TYPES
from ai.task_engine import execute_task, task_dispatcher

router = APIRouter(prefix="/api/ai", tags=["AI"])


# =============================================================================
# Pydantic Request & Response Schemas
# =============================================================================

class GenerateRequest(BaseModel):
    """
    Schema for text generation requests.
    """
    prompt: str = Field(
        ...,
        min_length=1,
        max_length=8000,
        description="The prompt or question to send to Google Gemini.",
        example="Explain photosynthesis in 2 simple sentences with an analogy."
    )
    system_instruction: Optional[str] = Field(
        None,
        max_length=2000,
        description="Optional system instruction / role definition."
    )
    model: Optional[str] = Field(
        None,
        description="Optional Gemini model override."
    )
    temperature: Optional[float] = Field(
        0.7,
        ge=0.0,
        le=2.0,
        description="Randomness temperature (0.0 = deterministic, 1.0 = creative)."
    )


class GenerateResponse(BaseModel):
    """
    Schema for AI text generation responses.
    """
    success: bool
    prompt: str
    response: str
    model: str


class ImageAnalysisResponse(BaseModel):
    """
    Schema for multimodal image analysis responses.
    """
    success: bool
    filename: str
    mime_type: str
    prompt: str
    response: str


class TaskRequest(BaseModel):
    """
    Schema for modular task engine requests.
    """
    task_type: str = Field(
        ...,
        description="Registered task identifier (e.g. 'explain', 'quiz', 'analyze_document', 'generate_questions')."
    )
    payload: Optional[Dict[str, Any]] = Field(
        default_factory=dict,
        description="Dynamic dictionary payload for the task."
    )
    user_input: Optional[str] = Field(
        None,
        description="Quick text input fallback."
    )
    context: Optional[str] = Field(
        None,
        description="Optional reference context or extracted document text."
    )


class TaskResponse(BaseModel):
    """
    Schema for modular task engine responses.
    """
    success: bool
    task_type: str
    result: Dict[str, Any]


class TaskMetadata(BaseModel):
    task_type: str
    description: str


# =============================================================================
# API Endpoints
# =============================================================================

@router.post("/generate", response_model=GenerateResponse)
def generate_ai_text(request: GenerateRequest):
    """
    FEATURE 1 & FEATURE 6: Core Gemini text generation endpoint.
    Accepts prompt, optional system instruction, and temperature.
    """
    try:
        response_text = generate_text(
            prompt=request.prompt,
            system_instruction=request.system_instruction,
            model=request.model,
            temperature=request.temperature or 0.7,
        )
        return GenerateResponse(
            success=True,
            prompt=request.prompt,
            response=response_text,
            model=request.model or DEFAULT_MODEL,
        )
    except ValueError as val_err:
        raise HTTPException(status_code=400, detail=str(val_err))
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Gemini API Error: {str(e)}"
        )


@router.post("/analyze-image", response_model=ImageAnalysisResponse)
async def analyze_uploaded_image(
    file: UploadFile = File(...),
    prompt: str = Form("Analyze this image in detail and explain key elements."),
    system_instruction: Optional[str] = Form(None),
):
    """
    FEATURE 2 & FEATURE 6: Multimodal image analysis endpoint.
    Accepts an image file + text prompt, sends both to Gemini, returns structured analysis.
    """
    if not file.filename:
        raise HTTPException(status_code=400, detail="No image file provided.")

    content_type = (file.content_type or "").lower().strip()
    if content_type == "image/jpg":
        content_type = "image/jpeg"

    if content_type not in SUPPORTED_IMAGE_TYPES:
        supported = ", ".join(sorted(SUPPORTED_IMAGE_TYPES))
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported image format '{file.content_type}'. Supported: {supported}"
        )

    try:
        image_bytes = await file.read()
    except Exception as read_err:
        raise HTTPException(status_code=400, detail=f"Failed to read image: {str(read_err)}")

    if not image_bytes:
        raise HTTPException(status_code=400, detail="Uploaded image is empty.")

    try:
        analysis = analyze_image(
            image_bytes=image_bytes,
            mime_type=content_type,
            prompt=prompt,
            system_instruction=system_instruction,
        )
        return ImageAnalysisResponse(
            success=True,
            filename=file.filename,
            mime_type=content_type,
            prompt=prompt,
            response=analysis,
        )
    except ValueError as val_err:
        raise HTTPException(status_code=400, detail=str(val_err))
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Gemini Vision API Error: {str(e)}"
        )


@router.post("/task", response_model=TaskResponse)
def execute_modular_task(request: TaskRequest):
    """
    FEATURE 4 & FEATURE 6: Central plug-in endpoint for tomorrow's problem tasks.
    Routes to registered handlers in ai/task_engine.py.
    """
    try:
        result = execute_task(
            task_type=request.task_type,
            user_input=request.user_input,
            context=request.context,
            payload=request.payload,
        )
        return TaskResponse(
            success=True,
            task_type=request.task_type,
            result=result,
        )
    except ValueError as val_err:
        raise HTTPException(status_code=400, detail=str(val_err))
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Task Engine Error: {str(e)}"
        )


@router.get("/tasks", response_model=List[TaskMetadata])
def list_available_tasks():
    """
    Returns the list of all registered tasks in the task engine.
    """
    return task_dispatcher.list_tasks()


# Backward-compatible PromptRequest & PromptResponse models for /api/ai/test
class PromptRequest(BaseModel):
    prompt: str = Field(..., min_length=1, max_length=4000)


class PromptResponse(BaseModel):
    success: bool
    prompt: str
    response: str


@router.post("/test", response_model=PromptResponse)
def test_gemini_ai(request: PromptRequest):
    """
    Backward-compatible test endpoint.
    """
    try:
        generated_text = generate_text(prompt=request.prompt)
        return PromptResponse(
            success=True,
            prompt=request.prompt,
            response=generated_text
        )
    except ValueError as val_err:
        raise HTTPException(status_code=400, detail=str(val_err))
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Gemini API Error: {str(e)}"
        )
