# 🎓 EduGenAI Hackathon Workspace

A modular, beginner-friendly foundation for a **36-hour EduGenAI Hackathon**. Built with **FastAPI (Python)**, **React + Vite + Tailwind CSS**, and the official **Google Gemini API (`google-genai`)**.

---

## 📌 Table of Contents
1. [What the Project Is](#1-what-the-project-is)
2. [Architecture](#2-architecture)
3. [Folder Structure](#3-folder-structure)
4. [How to Configure .env](#4-how-to-configure-env)
5. [How to Install Backend](#5-how-to-install-backend)
6. [How to Install Frontend](#6-how-to-install-frontend)
7. [How to Start Backend](#7-how-to-start-backend)
8. [How to Start Frontend](#8-how-to-start-frontend)
9. [Available API Endpoints](#9-available-api-endpoints)
10. [Where Tomorrow's Problem-Specific Logic Should Be Added](#10-where-tomorrows-problem-specific-logic-should-be-added)
11. [For Tomorrow's Problem Statement](#-for-tomorrows-problem-statement)

---

## 1. What the Project Is

This repository provides a battle-tested, lightweight **EduGenAI Workspace Skeleton**. 

When building an AI project in a 36-hour hackathon, you do not know the exact challenge until Day 1. This project is structured so your team never has to scramble to configure servers, CORS, frontend wrappers, file upload parsers, or API keys.

It includes:
- **Gemini Text Generation**: Direct, prompt-driven text generation with configurable temperature and system instructions.
- **Multimodal Image Analysis**: Accepts uploaded diagrams, whiteboard photos, or worksheets and sends both image + prompt to Gemini.
- **PDF & Document Extraction**: Safely uploads files into `uploads/` and extracts text and metadata via `pypdf`.
- **Modular Task Engine**: A plug-and-play task dispatcher (`ai/task_engine.py`) designed to receive tomorrow's problem-specific functions with zero architectural rewrites.
- **AI Workspace UI**: A responsive React dashboard to test all features visually in real-time.

---

## 2. Architecture

```text
React Frontend (Vite)
        ↓  (proxied via /api)
FastAPI Backend (Port 8000)
        ↓
Modular Routers (/api/ai, /api/documents, /api/health)
        ↓
Central Task Engine (ai/task_engine.py) & AI Service (ai/ai_service.py)
        ↓
Google Gemini API (google-genai SDK)
        ↓
Structured AI Response
        ↓
React Frontend Workspace
```

- **Separation of Concerns**: No Gemini SDK calls are scattered across routes or frontend files. All Gemini interactions are encapsulated inside `ai/ai_service.py`.
- **Extensible Task Engine**: High-level educational workflows (e.g. grading, quiz creation, study plans) are registered in `ai/task_engine.py`.
- **Safe Document Handling**: Uploads are sanitized against directory traversal and stored under `uploads/` (git-ignored).

---

## 3. Folder Structure

```text
Megathon/
├── .env.example              # Sample environment variables (API keys, ports)
├── .gitignore                # Prevents .env, node_modules, and uploads from leaking
├── README.md                 # Complete documentation & quickstart guide
│
├── uploads/                  # Local storage folder for uploaded documents/images
│   └── .gitkeep
│
├── ai/                       # 🧠 ALL AI & PROMPTING LOGIC (Your team's core logic)
│   ├── __init__.py           # Exports generate_text, analyze_image, execute_task
│   ├── ai_service.py         # Isolated Google Gemini SDK interface
│   └── task_engine.py        # 🎯 TOMORROW'S HOOK: Central extension point
│
├── backend/                  # ⚙️ FASTAPI BACKEND SERVER
│   ├── requirements.txt      # Minimal, stable Python backend dependencies
│   └── app/
│       ├── main.py           # FastAPI entrypoint, CORS & router mounting
│       ├── core/
│       │   └── config.py     # Centralized settings & secure .env loader
│       └── api/
│           ├── health.py     # GET /api/health (Server verification)
│           ├── ai.py         # POST /api/ai/generate, /analyze-image, /task
│           └── documents.py  # POST /api/documents/upload (PDF/Text extraction)
│
└── frontend/                 # 💻 REACT + VITE + TAILWIND USER INTERFACE
    ├── index.html            # Main HTML page
    ├── package.json          # Frontend packages & scripts
    ├── vite.config.js        # Vite config with /api proxy to FastAPI (:8000)
    ├── tailwind.config.js    # Tailwind styling system
    └── src/
        ├── main.jsx          # React app entrypoint
        ├── index.css         # Typography & global styles
        └── App.jsx           # AI Workspace Dashboard (Text, Vision, Docs, Tasks)
```

---

## 4. How to Configure .env

1. Copy `.env.example` to create `.env` in the project root:
   ```powershell
   # Windows PowerShell
   copy .env.example .env
   ```
2. Open `.env` and paste your Google Gemini API key:
   ```env
   # Google Gemini API Key (Get a free key from https://aistudio.google.com/app/apikey)
   GEMINI_API_KEY=AIzaSy...

   # Optional Model Configuration (default: gemini-2.5-flash)
   GEMINI_MODEL=gemini-2.5-flash

   # Backend Server Configuration
   HOST=127.0.0.1
   PORT=8000
   ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
   MAX_UPLOAD_SIZE_MB=20
   ```
3. **Security Note**: `.env` is listed in `.gitignore`. **Never commit your `.env` or hardcode API keys into source code.**

---

## 5. How to Install Backend

Open your terminal in the project root:

```powershell
# 1. Navigate to backend directory
cd backend

# 2. Create a Python virtual environment (if not already created)
python -m venv venv

# 3. Activate the virtual environment
# On Windows PowerShell:
.\venv\Scripts\activate
# On macOS/Linux:
# source venv/bin/activate

# 4. Install backend dependencies
pip install -r requirements.txt
```

---

## 6. How to Install Frontend

Open a second terminal:

```powershell
# 1. Navigate to frontend directory
cd frontend

# 2. Install Node dependencies
# If PowerShell script execution is restricted on Windows, use cmd /c:
npm install
# or: cmd.exe /c "npm install"
```

---

## 7. How to Start Backend

From the activated `backend` directory (or from project root using venv python):

```powershell
# From backend/ directory with active venv:
python -m uvicorn app.main:app --reload --port 8000

# Or from the project root:
.\backend\venv\Scripts\python.exe -m uvicorn backend.app.main:app --reload --port 8000
```

- Verify backend is alive: open [http://localhost:8000/api/health](http://localhost:8000/api/health)
- Interactive API Documentation (Swagger): [http://localhost:8000/docs](http://localhost:8000/docs)

---

## 8. How to Start Frontend

From the `frontend` directory:

```powershell
npm run dev
# If PowerShell script execution is restricted on Windows:
# cmd.exe /c "npm run dev"
```

- Open the EduGenAI Workspace in your browser at: **[http://localhost:5173](http://localhost:5173)**
- Check that the status badge reads **Backend Online**.

---

## 9. Available API Endpoints

| Method | Endpoint | Description | Request / Body |
|---|---|---|---|
| `GET` | `/api/health` | Health check & latency check | None |
| `POST` | `/api/ai/generate` | Text generation via Gemini | JSON: `{ "prompt": "...", "system_instruction": "...", "temperature": 0.7 }` |
| `POST` | `/api/ai/analyze-image` | Multimodal visual analysis | Form: `file` (image) + `prompt` (text) |
| `POST` | `/api/documents/upload` | PDF / Document text extraction | Form: `file` (.pdf, .txt, .md) |
| `POST` | `/api/ai/task` | Modular task engine execution | JSON: `{ "task_type": "...", "payload": {...} }` |
| `GET` | `/api/ai/tasks` | List all registered tasks | None |
| `POST` | `/api/ai/test` | Legacy test endpoint | JSON: `{ "prompt": "..." }` |

Interactive Swagger documentation with live request testing is always available at:
👉 **[http://localhost:8000/docs](http://localhost:8000/docs)**

---

## 10. Where Tomorrow's Problem-Specific Logic Should Be Added

When the problem statement is released tomorrow:

1. **Write Problem Logic in `ai/task_engine.py`**:
   - Do NOT rewrite FastAPI routes or change frontend structure.
   - Simply define a new function in `ai/task_engine.py` and register it:
     ```python
     @task_dispatcher.register("grade_essay", description="Evaluates student essay against criteria")
     def grade_essay(payload: dict) -> dict:
         essay = payload.get("essay", "")
         rubric = payload.get("rubric", "")
         # Build prompt & call generate_text() from ai.ai_service
         result = generate_text(prompt=f"Rubric: {rubric}\n\nEssay: {essay}")
         return {"score": 92, "feedback": result}
     ```
2. **Call It From Any Client**:
   - The backend route `POST /api/ai/task` immediately supports it without any code changes!
   - Send:
     ```json
     {
       "task_type": "grade_essay",
       "payload": {
         "essay": "Photosynthesis is...",
         "rubric": "Clarity, accuracy, depth"
       }
     }
     ```
3. **If You Need Multimodal Analysis for the Problem**:
   - Use `analyze_image(image_bytes=..., mime_type=..., prompt=...)` from `ai.ai_service`.
4. **If You Need Document Parsing for the Problem**:
   - Upload any curriculum or textbook PDF through `POST /api/documents/upload`.
   - Pass the `extracted_text` directly to your task function!

---

## 🎯 For Tomorrow's Problem Statement

> [!IMPORTANT]
> **`ai/task_engine.py` is your primary extension point.**
>
> 1. Keep all Gemini prompting and SDK calls inside `ai/ai_service.py` (via `generate_text` or `analyze_image`).
> 2. Keep all problem-specific logic, question generators, rubrics, and workflows in `ai/task_engine.py`.
> 3. Use `POST /api/ai/task` to trigger any new task from the UI or API.
> 4. If you need text from uploaded PDFs, use `POST /api/documents/upload` and pass the returned `extracted_text` directly to your task.
