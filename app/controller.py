import sys
import io
import os
import instructor
import viktor as vkt
import json
import base64
import plotly.graph_objects as go
import numpy as np 
import logging

from textwrap import dedent
from pydantic import BaseModel, Field
from openai import OpenAI
from dotenv import load_dotenv
from app.tool_detection import detect_objects, BBoxList
from app.tool_plot_bbox import plot_bounding_boxes_go
from PIL import Image
from typing import  Union, Generator

load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
client = instructor.from_openai(client)


logging.basicConfig(
    stream=sys.stdout,
    level=logging.INFO,
    format="%(asctime)s %(name)s %(levelname)s: %(message)s",
    filename="log.log"
)

logger = logging.getLogger(name="debugging")


class Action(BaseModel):
    query: str = Field(
        ...,
        description=dedent(
            """Query to be send to an object detection tool that highlights multiple or single components from the drawings, ans shows  a bounding box with lables to the user. need to be simple, query should be words like "detect breakers", "detect pumps", "detect busbars", "detect disconnectors" """
        ),
    )


class Response(BaseModel):
    response: str = Field(
        ...,
        description=dedent(
            "Friendly response to the user about the question they asked. Be thorought!"
        ),
    )
    action: Union[Action | None] = Field(
        ...,
        description="Use action to complement your answer you can highlithing the main components of the drawing, that are being reference in the text response, can be None if you want to keep current view or no element needs to be highlighted",
    )


def llm_response(messages: list[dict]) -> Response:
    return client.chat.completions.create_partial(
        model="o4-mini",
        messages=messages,
        response_model=Response,
        reasoning_effort="low",
    )


class Parametrization(vkt.Parametrization):
    text1 = vkt.Text(value= "# Talk to your engineering drawings")
    text2 = vkt.Text(value= dedent("""
                                   This app lets you talk to your **engineering drawings**.
                                   Upload an image of your P&ID or single-line diagram and a **state-of-the-art
                                   language model** will help you interpret the content. You will receive clear,
                                   answers directly from your drawings."""))

    chat = vkt.Chat("LLM Chat", method="call_llm")
    image = vkt.FileField(
        "**Upload Image**",
        file_types=[".jpg", ".jpeg", ".png", ".gif"],
        max_size=10_000_000,
    )


class Controller(vkt.Controller):
    parametrization = Parametrization(width=40)

    def call_llm(self, params, **kwargs) -> vkt.ChatResult | None:
        if not params.chat:
            return None
        messages: dict[str, str] = [
            {
                "role": "system",
                "content": dedent(
                    """\
                    You are a helpful assistant that helps users to understand enginneering drawings
                    You run inside a VIKTOR.AI app thas allow you to highlith components of the drawing. Use clear, simple but formal English with correct use of
                    engenieering terms.
                    """
                ),
            }]
        if params.image:
            messages.append(
            {
                "role": "user",
                "content": [
                    "This image is the context of the conversation",
                    instructor.multimodal.Image.from_base64(
                        f"data:image/png;base64,{self.convert_image2bs64(params.image.file)}"
                    ),
                ],
            })

        messages.extend(params.chat.get_messages())

        partials: Generator[Response, None, None] = llm_response(messages)

        def text_stream() -> Generator[str, None, None]:
            prev_text = ""
            for partial in partials:
                if partial.response is None:
                    continue

                full_text = partial.response
                if full_text.startswith(prev_text):
                    delta = full_text[len(prev_text):]
                else:
                    delta = full_text

                prev_text = full_text

                if partial.action is not None:
                    vkt.Storage().set(
                        "View",
                        data=vkt.File.from_data(partial.action.model_dump_json()),
                        scope="entity",
                    )

                if delta:
                    yield delta

        return vkt.ChatResult(params.chat, text_stream())
    
    @vkt.PlotlyView("Drawing Annotations", width=100)
    def plot_view(self, params, **kwargs) -> vkt.PlotlyResult:
        if not params.chat:
            try:
                vkt.Storage().delete("View", scope="entity")
            except Exception:
                pass

        try:
            raw = vkt.Storage().get("View", scope="entity").getvalue()  # str
            action = Action.model_validate(json.loads(raw))
            logger.info(f"[Action] {action}")
            query = action.query
            # Make this work with binaries!
            bs64image = self.convert_image2bs64(img_file=params.image.file)
            bbox_list: BBoxList = detect_objects(
                query=query,
                image_path=bs64image,
            )
            logger.info(f"[bbox_list] {bbox_list}")

            bbox2plot = [(bbox.label, bbox.box_2d) for bbox in bbox_list.bounding_boxes]
            
            fig = plot_bounding_boxes_go(bs64image, bbox2plot)
        except Exception:
            if params.image:
                bs64image = self.convert_image2bs64(img_file=params.image.file)
                raw = base64.b64decode(bs64image)
                img = Image.open(io.BytesIO(raw)).convert("RGB")
                arr = np.array(img)
                if arr.ndim == 2:
                    arr = np.stack((arr,) * 3, axis=-1)
                fig = go.Figure(go.Image(z=arr))
                vkt.PlotlyResult(fig.to_json())
            else:
                fig = go.Figure()
                fig.add_annotation(
                text="Upload your engineering drawing to be analyzed",
                x=0.5, y=0.5,
                xref="paper", yref="paper",
                showarrow=False,
                font=dict(size=24, color="black"),
                xanchor="center", yanchor="middle"
            )

            # hide axes, ticks and grid; set white background; remove margins
            fig.update_xaxes(visible=False)
            fig.update_yaxes(visible=False)
            fig.update_layout(
                plot_bgcolor="white",
                paper_bgcolor="white",
                margin=dict(l=0, r=0, t=0, b=0)
            )

        return vkt.PlotlyResult(fig.to_json())

    @classmethod
    def convert_image2bs64(self, img_file: vkt.File) -> str:
        img_data = img_file.getvalue_binary()

        img = Image.open(io.BytesIO(img_data))
        img = img.convert("RGB")

        # Convert the image to bytes
        byte_arr = io.BytesIO()
        img.save(byte_arr, format='PNG')
        byte_arr.seek(0)

        return base64.b64encode(byte_arr.getvalue()).decode("utf-8")
