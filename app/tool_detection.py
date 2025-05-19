import os
import instructor
import io
import base64

from PIL import Image
from dotenv import load_dotenv
from pydantic import BaseModel, Field
from google import genai
from textwrap import dedent


load_dotenv()

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
client = instructor.from_genai(client, mode=instructor.Mode.GENAI_TOOLS)

MODEL = "gemini-2.5-pro-preview-05-06"


class BoundingBox(BaseModel):
    box_2d: list[int] = Field(..., description="[y1, x1, y2, x2]")
    label: str = Field(..., description="Unique Object label with unique feature")


class BBoxList(BaseModel):
    bounding_boxes: list[BoundingBox]


def convert_image2bs64(image_path: str) -> str:
    with Image.open(image_path) as img:
        img.thumbnail((640, 640), Image.Resampling.LANCZOS)
        buffer = io.BytesIO()
        img.save(buffer, format="PNG")
        buffer.seek(0)
        encoded_bytes = base64.b64encode(buffer.getvalue())
        bs6string = encoded_bytes.decode("utf-8")
    return bs6string


def detect_objects(query: str, image_path: str) -> BBoxList:
    """Detect objects based on a query"""
    return client.chat.completions.create(
        model= MODEL,
        messages=[
            {
                "role": "system",
                "content": dedent(
                    """You are a precise object detection agent who always checks and thinks whether the bounding box of the detected object is correct.
                    You think step by step, always verifying that the bounding boxes are accurate."""
                ),
            },
            {
                "role": "user",
                "content": [
                    f"{query}",
                    instructor.multimodal.Image.from_base64(
                        f"data:image/png;base64,{image_path}"
                    ),
                ],
            },
        ],
        response_model=BBoxList,
    )
