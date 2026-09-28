"""
=============================================================================
documents.py - Document Upload and Text Extraction Endpoints
=============================================================================
Provides endpoints for uploading educational documents (PDFs, text files),
saving them safely in the local uploads/ directory, and extracting text
using pypdf for downstream AI analysis or prompt augmentation.
=============================================================================
"""

import io
import re
from datetime import datetime
from pathlib import Path
from typing import Optional
from fastapi import APIRouter, File, UploadFile, HTTPException
from pydantic import BaseModel
import pypdf

from backend.app.core.config import UPLOAD_DIR, MAX_UPLOAD_SIZE_MB

router = APIRouter(prefix="/api/documents", tags=["Documents"])

SUPPORTED_EXTENSIONS = {".pdf", ".txt", ".md"}


def sanitize_filename(filename: str) -> str:
    """
    Sanitizes filename to avoid directory traversal and unsafe characters.
    """
    name = Path(filename).name
    name = re.sub(r'[^a-zA-Z0-9_\.-]', '_', name)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    return f"{timestamp}_{name}"


def format_file_size(size_bytes: int) -> str:
    """
    Returns human-readable file size string.
    """
    if size_bytes < 1024:
        return f"{size_bytes} B"
    elif size_bytes < 1024 * 1024:
        return f"{size_bytes / 1024:.1f} KB"
    else:
        return f"{size_bytes / (1024 * 1024):.2f} MB"


class DocumentUploadResponse(BaseModel):
    """
    Structured response schema for document uploads.
    """
    success: bool
    filename: str
    saved_filename: str
    file_size_bytes: int
    file_size_readable: str
    content_type: str
    page_count: int
    char_count: int
    word_count: int
    extracted_text: str
    preview: str
    message: str


@router.post("/upload", response_model=DocumentUploadResponse)
async def upload_document(file: UploadFile = File(...)):
    """
    FEATURE 3: Accepts an uploaded PDF or text file, saves it safely,
    extracts text using pypdf, and returns structured metadata + extracted text.
    """
    if not file.filename:
        raise HTTPException(status_code=400, detail="No filename provided in upload.")

    original_filename = file.filename
    file_ext = Path(original_filename).suffix.lower()

    if file_ext not in SUPPORTED_EXTENSIONS:
        supported = ", ".join(sorted(SUPPORTED_EXTENSIONS))
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file format '{file_ext}'. Allowed formats: {supported}"
        )

    # Read uploaded bytes
    try:
        content = await file.read()
    except Exception as read_err:
        raise HTTPException(status_code=400, detail=f"Failed to read file: {str(read_err)}")

    if not content or len(content) == 0:
        raise HTTPException(status_code=400, detail="The uploaded file is empty.")

    # Validate file size
    max_bytes = MAX_UPLOAD_SIZE_MB * 1024 * 1024
    if len(content) > max_bytes:
        raise HTTPException(
            status_code=400,
            detail=f"File exceeds maximum allowed size of {MAX_UPLOAD_SIZE_MB}MB."
        )

    # Safely save file under uploads directory
    safe_name = sanitize_filename(original_filename)
    destination = UPLOAD_DIR / safe_name

    try:
        with open(destination, "wb") as f:
            f.write(content)
    except Exception as save_err:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to save file to uploads directory: {str(save_err)}"
        )

    # Extract text and metadata
    extracted_text = ""
    page_count = 1

    if file_ext == ".pdf":
        try:
            reader = pypdf.PdfReader(io.BytesIO(content))
            page_count = len(reader.pages)
            if reader.is_encrypted:
                raise HTTPException(
                    status_code=400,
                    detail="Encrypted or password-protected PDFs are not supported."
                )

            pages_output = []
            for idx, page in enumerate(reader.pages):
                text = page.extract_text() or ""
                pages_output.append(f"--- Page {idx + 1} ---\n{text.strip()}")

            extracted_text = "\n\n".join(pages_output).strip()
            if not extracted_text:
                extracted_text = "[Notice: No readable text found in PDF. It may be scanned or image-only.]"
        except HTTPException:
            raise
        except Exception as pdf_err:
            raise HTTPException(
                status_code=400,
                detail=f"Failed to extract text from PDF: {str(pdf_err)}. Ensure the PDF is not corrupted."
            )
    else:
        # Plain text / Markdown
        try:
            extracted_text = content.decode("utf-8")
        except UnicodeDecodeError:
            extracted_text = content.decode("latin-1", errors="replace")

    words = extracted_text.split()
    preview = extracted_text[:400] + ("..." if len(extracted_text) > 400 else "")

    return DocumentUploadResponse(
        success=True,
        filename=original_filename,
        saved_filename=safe_name,
        file_size_bytes=len(content),
        file_size_readable=format_file_size(len(content)),
        content_type=file.content_type or f"application/{file_ext.lstrip('.')}",
        page_count=page_count,
        char_count=len(extracted_text),
        word_count=len(words),
        extracted_text=extracted_text,
        preview=preview,
        message=f"Document '{original_filename}' parsed successfully ({page_count} page{'s' if page_count != 1 else ''})."
    )
