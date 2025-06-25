# Modern Rewrite Plan: Talk to Your Drawings (Updated)

## 1. Architecture Overview

**Frontend:**

- React (TypeScript)
- Chakra UI (theme, color, responsive design)
- react-konva (annotation/canvas)
- State: React Context/Zustand
- API calls: Axios/React Query
- No authentication for single-user mode; optional for multi-user

**Backend (Recommended for Production):**

- FastAPI (Python)
- Pydantic for data validation
- OpenAI & Gemini API integration (API keys stored securely server-side)
- Database: PostgreSQL (SQLAlchemy) or MongoDB
- Storage: S3-compatible (for images, annotation data)
- User authentication (JWT, OAuth, or session-based)
- CORS, OpenAPI docs, rate limiting, logging

---

## 2. Backend: FastAPI Structure & Endpoints

**A. Project Structure**

```
backend/
  app/
    main.py
    api/
      endpoints/
        chat.py
        detect.py
        annotate.py
        auth.py
        export.py
    models/
    schemas/
    services/
    utils/
    db/
  tests/
  requirements.txt
```

**B. Key Endpoints**

- `POST /api/upload` — Upload image, returns image ID
- `POST /api/chat` — Send chat message, returns LLM response and (if needed) triggers object detection
- `POST /api/detect` — Run object detection on image, returns bounding boxes/labels
- `GET/POST /api/annotations/{image_id}` — Get/set all annotations for an image
- `POST /api/annotate` — Add/update/delete annotation
- `GET /api/export/{image_id}` — Download annotated image/data
- `POST /api/auth/*` — User authentication endpoints

**C. Services**

- OpenAI and Gemini integration (API keys stored securely)
- Image processing (base64, resizing, etc.)
- Annotation storage and retrieval
- User/session management
- Rate limiting, logging, error handling

---

## 3. Frontend: React App Structure

**A. Project Structure**

```
frontend/
  src/
    components/
      Canvas/
      BoundingBoxEditor/
      Chat/
      SettingsModal/
      ImageUpload/
    context/
    theme/
    App.tsx
    index.tsx
  public/
    index.html
```

**B. Integration**

- All API calls (chat, detection, upload, annotation) go through the backend.
- No API keys are stored in the browser.
- User authentication (if enabled) is handled via JWT/session.
- All annotation and chat data can be persisted in the backend DB/cloud.

---

## 4. Deployment Recommendations

- **Frontend:** Deploy as a static site (Vercel, Netlify, S3+CloudFront, etc.)
- **Backend:** Deploy FastAPI on a secure server (Docker, Cloud Run, AWS ECS, Azure App Service, etc.)
- **Database/Storage:** Use managed PostgreSQL/MongoDB and S3-compatible storage for images/data.
- **Environment:** Store all secrets (API keys, DB URIs) in environment variables, not in code.

---

## 5. Files to Keep and Delete

**Keep:**

- All React source files in `frontend/src/` (components, context, theme, App.tsx, index.tsx)
- All backend source files in `backend/app/` (main.py, endpoints, models, etc.)
- `requirements.txt` (backend), `package.json` (frontend)
- `MODERN_REWRITE_PLAN.md` (this plan)

**Delete:**

- Any old VIKTOR-specific files
- Any unused demo/example files
- Any files not referenced in the new architecture

---

## 6. Updated Summary Table

| Area                 | Recommendation                      | Why?                                |
| -------------------- | ----------------------------------- | ----------------------------------- |
| UI Framework         | React + Chakra UI/Material UI       | Modern, accessible, customizable    |
| Annotation           | react-konva                         | Interactive, performant, extensible |
| Chat                 | Custom React + Markdown support     | Familiar, flexible, beautiful       |
| Backend              | FastAPI + Pydantic                  | Secure, async, type-safe, scalable  |
| LLM/Object Detection | OpenAI, Gemini APIs (via backend)   | Best-in-class models, secure keys   |
| Storage              | PostgreSQL/MongoDB, S3              | Persistence, scalability            |
| State Management     | React Context + Zustand/Redux       | Simple, robust, future-proof        |
| Auth (optional)      | JWT/OAuth (backend)                 | Secure, scalable, multi-user        |
| Testing              | Jest, React Testing Library, Pytest | Quality, reliability                |
| Docs                 | Storybook, OpenAPI, README          | Dev onboarding, maintainability     |

---

## 7. Next Steps

- Complete backend implementation (API endpoints, DB, storage, auth)
- Update frontend to use backend for all API calls
- Test end-to-end, deploy, and document

---

## 8. References

- [FastAPI](https://fastapi.tiangolo.com/)
- [Chakra UI](https://chakra-ui.com/)
- [react-konva](https://konvajs.org/docs/react/index.html)
- [OpenAI Python SDK](https://github.com/openai/openai-python)
- [Google Generative AI Python SDK](https://github.com/google/generative-ai-python)
- [Docker](https://www.docker.com/)
