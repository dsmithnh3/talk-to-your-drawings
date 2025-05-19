import io
import base64
from typing import overload, Union, List, Tuple
import numpy as np
from PIL import Image, ImageColor
import plotly.graph_objects as go

additional_colors = list(ImageColor.colormap.keys())

base_colors = [
    'red', 'green', 'blue', 'yellow', 'orange', 'pink',
    'purple', 'brown', 'gray', 'beige', 'turquoise',
    'cyan', 'magenta', 'lime', 'navy', 'maroon',
    'teal', 'olive', 'coral', 'lavender', 'violet',
    'gold', 'silver'
]
colors = base_colors + additional_colors

@overload
def plot_bounding_boxes_go(
    image_input: Image.Image,
    noun_phrases_and_positions: List[Tuple[str, Tuple[int, int, int, int]]]
) -> go.Figure: ...
@overload
def plot_bounding_boxes_go(
    image_input: str,
    noun_phrases_and_positions: List[Tuple[str, Tuple[int, int, int, int]]]
) -> go.Figure: ...

def plot_bounding_boxes_go(
    image_input: Union[Image.Image, str],
    noun_phrases_and_positions: List[Tuple[str, Tuple[int, int, int, int]]]
) -> go.Figure:
    """
    Plot image with colored bounding boxes and labels using Plotly go.
    Accepts either a PIL Image or a base64-encoded PNG string.
    noun_phrases_and_positions: List of (label, (y1, x1, y2, x2)) in 0–1000 normalized coords.
    """
    # Load or decode the image
    if isinstance(image_input, str):
        header, _, b64data = image_input.partition(',')
        raw = base64.b64decode(b64data or header)
        img = Image.open(io.BytesIO(raw)).convert('RGB')
    else:
        img = image_input.convert('RGB')

    arr = np.array(img)
    h, w = arr.shape[:2]
    if arr.ndim == 2:
        arr = np.stack((arr,) * 3, axis=-1)

    fig = go.Figure(go.Image(z=arr))
    shapes, annotations = [], []

    for i, (phrase, (y1, x1, y2, x2)) in enumerate(noun_phrases_and_positions):
        color = colors[i % len(colors)]

        # Denormalize coords
        abs_x1, abs_y1 = x1/1000*w, y1/1000*h
        abs_x2, abs_y2 = x2/1000*w, y2/1000*h

        # Thicker rectangle
        shapes.append({
            'type': 'rect',
            'x0': abs_x1, 'y0': abs_y1,
            'x1': abs_x2, 'y1': abs_y2,
            'line': {'color': color, 'width': 6}
        })

        # Filled label box, bold text
        annotations.append({
            'x': abs_x1,
            'y': abs_y1 - 4,
            'xref': 'x', 'yref': 'y',
            'text': f"<b>{phrase}</b>",
            'showarrow': False,
            'font': {'color': 'black', 'size': 14},
            'bgcolor': color,
            'borderpad': 4,
            'align': 'left'
        })

    fig.update_layout(
        margin={'l': 0, 'r': 0, 't': 0, 'b': 0},
        xaxis={'visible': False},
        yaxis={'visible': False, 'autorange': 'reversed'},
        shapes=shapes,
        annotations=annotations
    )

    return fig