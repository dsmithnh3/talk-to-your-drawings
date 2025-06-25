from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List
import os
import google.generativeai as genai
import base64
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

class BoundingBox(BaseModel):
    label: str
    x: int
    y: int
    width: int
    height: int
    color: str

class DetectRequest(BaseModel):
    image_base64: str
    query: str

class DetectResponse(BaseModel):
    boxes: List[BoundingBox]

@router.post("/detect", response_model=DetectResponse)
def detect_endpoint(req: DetectRequest):
    if not GEMINI_API_KEY:
        raise HTTPException(status_code=500, detail="Gemini API key not set")
    try:
        # Decode image
        image_bytes = base64.b64decode(req.image_base64)
        # Gemini API expects file-like object or bytes
        model = genai.GenerativeModel("gemini-pro-vision")
        resp = model.generate_content([
            req.query,
            genai.types.content.ImageContent(image_bytes)
        ])
        # Parse bounding boxes from Gemini response (customize for your Gemini output format)
        boxes = []
        for box in resp.candidates[0].content.parts:
            if hasattr(box, 'bounding_box'):
                b = box.bounding_box
                boxes.append(BoundingBox(
                    label=box.text,
                    x=b.x,
                    y=b.y,
                    width=b.width,
                    height=b.height,
                    color="#FF0000"
                ))
        return DetectResponse(boxes=boxes)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 