# Talk to Your Drawings - Modern Engineering Drawing Analyzer

## Overview

A modern, production-ready web app for analyzing engineering drawings (P&IDs, single-line diagrams) with AI-powered chat, object detection, and interactive annotation. Built with React (frontend) and FastAPI (backend) for security, extensibility, and a beautiful user experience.

## Features

- **Interactive annotation:** Draw, move, resize, and label bounding boxes on engineering drawings
- **AI chat:** Ask questions about your drawing, powered by OpenAI (securely via backend)
- **Object detection:** Detect components (e.g., pumps, valves) using Google Gemini (securely via backend)
- **Settings:** Securely manage API keys and model selection (never exposed to browser)
- **Persistent storage:** Save images, annotations, and chat history to the cloud (multi-user ready)
- **Modern UI/UX:** Responsive, accessible, and theme-matched to engineering workflows

## Architecture

- **Frontend:** React + Chakra UI + react-konva
- **Backend:** FastAPI (Python), Pydantic, PostgreSQL/MongoDB, S3-compatible storage
- **API Security:** All API keys and sensitive data are managed server-side
- **Deployment:** Static frontend (Vercel/Netlify/S3), backend on Docker/Cloud Run/AWS/Azure

## Setup

### Backend (FastAPI)

1. Clone the repo and `cd backend`
2. Install dependencies: `pip install -r requirements.txt`
3. Set environment variables for API keys, DB, and storage
4. Run: `uvicorn app.main:app --reload`

### Frontend (React)

1. Clone the repo and `cd frontend`
2. Install dependencies: `npm install`
3. Set API endpoint in `.env` if needed
4. Run: `npm run dev`

## Usage

1. Open the app in your browser
2. Upload an engineering drawing (JPG, PNG, GIF)
3. Annotate manually or use AI detection
4. Ask questions in the chat
5. Save and revisit your work (if logged in)

## Security Model

- **API keys are never exposed to the browser**
- **All AI and storage calls go through the backend**
- **Supports multi-user and team workflows (optional)**

## Migration Notes

- All VIKTOR-specific files and logic have been removed
- All API calls, storage, and authentication are now handled by the backend

## References

- [FastAPI](https://fastapi.tiangolo.com/)
- [Chakra UI](https://chakra-ui.com/)
- [react-konva](https://konvajs.org/docs/react/index.html)
- [OpenAI Python SDK](https://github.com/openai/openai-python)
- [Google Generative AI Python SDK](https://github.com/google/generative-ai-python)

---

For advanced deployment, analytics, or team features, see `MODERN_REWRITE_PLAN.md`.
