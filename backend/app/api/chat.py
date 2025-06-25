from fastapi import APIRouter, HTTPException
from app.schemas import Token
from pydantic import BaseModel
import os
import openai
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

openai.api_key = OPENAI_API_KEY
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

class ChatRequest(BaseModel):
    message: str
    provider: str = "openai"  # or "gemini"

class ChatResponse(BaseModel):
    response: str

@router.post("/chat", response_model=ChatResponse)
def chat_endpoint(req: ChatRequest):
    if req.provider == "openai":
        if not OPENAI_API_KEY:
            raise HTTPException(status_code=500, detail="OpenAI API key not set")
        try:
            resp = openai.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": req.message}]
            )
            return ChatResponse(response=resp.choices[0].message.content)
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
    elif req.provider == "gemini":
        if not GEMINI_API_KEY:
            raise HTTPException(status_code=500, detail="Gemini API key not set")
        try:
            model = genai.GenerativeModel("gemini-pro")
            resp = model.generate_content(req.message)
            return ChatResponse(response=resp.text)
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
    else:
        raise HTTPException(status_code=400, detail="Unknown provider") 