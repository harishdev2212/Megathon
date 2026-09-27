# 🎓 EduGenAI Hackathon Starter Skeleton

A clean, beginner-friendly, modular software skeleton designed for a **36-hour EduGenAI Hackathon**. Built with **React + Vite + Tailwind CSS**, **FastAPI (Python)**, and the official **Google Gemini API**.

---

## 📌 Table of Contents
1. [Project Overview & Philosophy](#-project-overview--philosophy)
2. [What Each Folder Does](#-what-each-folder-does)
3. [Beginner's Guide: Core Concepts](#-beginners-guide-core-concepts)
   - [What is an API?](#what-is-an-api)
   - [How the Backend Works](#how-the-backend-works)
   - [How the Frontend Works](#how-the-frontend-works)
   - [How Google Gemini is Connected](#how-google-gemini-is-connected)
4. [Step-by-Step: How to Run the Project](#-step-by-step-how-to-run-the-project)
5. [The "Tomorrow Hook": Where to Write Your Hackathon Logic](#-the-tomorrow-hook-where-to-write-your-hackathon-logic)

---

## 🚀 Project Overview & Philosophy

In a fast-paced 36-hour hackathon, you don't know the exact problem statement until day 1. 

**This starter template is designed so you never have to scramble or rebuild boilerplate:**
- **Zero unnecessary bloat**: No complex microservices, no authentication walls, no Docker overhead.
- **Isolated AI layer**: All Gemini API calls live in `ai/ai_service.py`.
- **Plug-and-play logic**: Tomorrow's problem solution lives in `ai/task_engine.py`.
- **Instant visual feedback**: Modern UI with a live server health check and an interactive Gemini testing playground.

---

## 📁 What Each Folder Does

```text
Megathon/
├── .env.example          # Sample environment variables (API keys, ports)
├── .gitignore            # Tells Git which files to ignore (node_modules, .env, etc.)
├── README.md             # This guide
│
├── uploads/              # Local storage folder for student/teacher uploaded files
│   └── .gitkeep
│
├── ai/                   # 🧠 ALL AI & PROMPTING LOGIC (Your team's secret weapon)
│   ├── ai_service.py     # Direct, isolated interface to Google Gemini SDK
│   └── task_engine.py    # TOMORROW'S HOOK: Where you code the assigned challenge
│
├── backend/              # ⚙️ FASTAPI BACKEND SERVER
│   ├── requirements.txt  # Python packages needed to run the server
│   └── app/
│       ├── main.py       # Server entrypoint and CORS configuration
│       ├── core/
│       │   └── config.py # Secure environment loader for .env
│       └── api/
│           ├── health.py # GET /api/health (Server verification)
│           └── ai.py     # POST /api/ai/test (Sends prompts to Gemini)
│
└── frontend/             # 💻 REACT + VITE + TAILWIND USER INTERFACE
    ├── index.html        # Main HTML web page
    ├── package.json      # Frontend libraries and scripts
    ├── vite.config.js    # Vite config + automatic backend proxy to :8000
    ├── tailwind.config.js# Styling configurations
    └── src/
        ├── main.jsx      # React entrypoint
        ├── index.css     # Global styles & fonts
        └── App.jsx       # Main interactive dashboard UI
```

---

## 📖 Beginner's Guide: Core Concepts

### What is an API?
**API** stands for *Application Programming Interface*.
- Think of your backend like a **restaurant kitchen** and your frontend (browser) like a **customer at a table**.
- The customer cannot directly cook food or access the refrigerator (database/AI keys).
- The **API is the waiter**: The frontend sends an HTTP request (*"Order: generate a quiz"*), the backend processes it using Gemini, and sends back an HTTP response (*"Here is your quiz"* in JSON format).

### How the Backend Works
1. The backend is written in **FastAPI** (`backend/app/main.py`), a modern Python framework.
2. When you start the server, it listens on `http://127.0.0.1:8000`.
3. It provides two essential starter endpoints:
   - `GET /api/health`: Checks if the server is alive and returns `{ "status": "ok" }`.
   - `POST /api/ai/test`: Receives `{ "prompt": "..." }`, sends it to `ai_service.py`, and returns `{ "response": "..." }`.
4. It also automatically generates an interactive documentation page at **`http://localhost:8000/docs`**, where you can test any endpoint directly in your browser!

### How the Frontend Works
1. The frontend is built with **React** and bundled with **Vite** (`frontend/src/App.jsx`).
2. Vite runs a fast local development server on `http://localhost:5173`.
3. The file `frontend/vite.config.js` sets up a **proxy**: whenever the frontend calls `/api/health` or `/api/ai/test`, Vite automatically forwards the request to the FastAPI backend on port `8000`. This prevents "CORS" errors and keeps your code simple.

### How Google Gemini is Connected
1. The official Google GenAI Python SDK (`google-genai`) is used.
2. All connection details are encapsulated inside `ai/ai_service.py`.
3. `ai_service.py` reads `GEMINI_API_KEY` securely from the `.env` file via `backend/app/core/config.py`.
4. **Your API key is never exposed to the frontend browser or pushed to GitHub.**

---

## 🛠️ Step-by-Step: How to Run the Project

You will need **two terminal windows** (one for the backend, one for the frontend).

### 1. Set Up Your API Key
1. In the project root, make a copy of `.env.example` named `.env`:
   ```bash
   # Windows PowerShell
   copy .env.example .env
   ```
2. Open `.env` and replace `your_gemini_api_key_here` with your real Google Gemini API key:
   ```env
   GEMINI_API_KEY=AIzaSy...
   ```
   *(You can get a free key at [Google AI Studio](https://aistudio.google.com/app/apikey))*

---

### 2. Run the Backend (Terminal 1)
```bash
# Navigate to the backend directory
cd backend

# Create and activate a Python virtual environment (recommended)
python -m venv venv

# Windows activate:
.\venv\Scripts\activate

# Install the minimal dependencies:
pip install -r requirements.txt

# Run the FastAPI server:
python -m uvicorn app.main:app --reload --port 8000
```
- Open `http://localhost:8000/api/health` in your browser. You should see `{"status":"ok"}`.
- View interactive Swagger documentation at `http://localhost:8000/docs`.

---

### 3. Run the Frontend (Terminal 2)
```bash
# Open a new terminal and navigate to the frontend directory
cd frontend

# Install frontend dependencies:
npm install

# Start the Vite development server:
npm run dev
```
- Open **`http://localhost:5173`** in your browser.
- You will see the **EduGenAI Hackathon Starter Dashboard**!
- Check that the status badge says **Backend Online**.
- Type any prompt into the playground box to test live Gemini responses.

---

## 🎯 The "Tomorrow Hook": Where to Write Your Hackathon Logic

When the problem statement is unveiled tomorrow:

1. **Open `ai/task_engine.py`**:
   - This file is built specifically for educational workflows.
   - It already has starter templates for `explain_concept`, `generate_quick_quiz`, and `summarize_educational_content`.
   - Modify or add functions matching your team's solution (e.g. `grade_essay`, `generate_lesson_plan`, `simplify_dyslexia_text`).
2. **Expose the Endpoint in `backend/app/api/`**:
   - Create a clean endpoint (e.g. `POST /api/tasks/grade`) that accepts input and calls your task function.
3. **Display in `frontend/src/App.jsx`**:
   - Connect your new backend endpoint to the React UI.
