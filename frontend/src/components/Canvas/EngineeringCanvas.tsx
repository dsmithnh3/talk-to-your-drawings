import React, { useRef, useEffect, useState } from "react";
import {
  Stage,
  Layer,
  Image as KonvaImage,
  Rect,
  Transformer,
} from "react-konva";
import useImage from "use-image";

// Types
export interface BoundingBox {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  color: string;
}

interface EngineeringCanvasProps {
  imageUrl: string | null;
  boundingBoxes: BoundingBox[];
  selectedBoxId: string | null;
  onBoxesChange: (boxes: BoundingBox[]) => void;
  onSelectBox: (id: string | null) => void;
  // TODO: Add props for label/color options, zoom/pan reset, etc.
}

const EngineeringCanvas: React.FC<EngineeringCanvasProps> = ({
  imageUrl,
  boundingBoxes,
  selectedBoxId,
  onBoxesChange,
  onSelectBox,
}) => {
  const [image] = useImage(imageUrl || "", "anonymous");
  const [drawing, setDrawing] = useState(false);
  const [newBox, setNewBox] = useState<BoundingBox | null>(null);
  const [stageScale, setStageScale] = useState(1);
  const [stagePos, setStagePos] = useState({ x: 0, y: 0 });
  const [draggingBoxId, setDraggingBoxId] = useState<string | null>(null);
  const stageRef = useRef<any>(null);
  const trRef = useRef<any>(null);

  // Handle drawing new box
  const handleMouseDown = (e: any) => {
    if (!image) return;
    // Only left click, not on existing box
    if (e.target === stageRef.current) {
      const { x, y } = e.target.getPointerPosition();
      setDrawing(true);
      setNewBox({
        id: `box_${Date.now()}`,
        x,
        y,
        width: 0,
        height: 0,
        label: "Other",
        color: "#FF0000",
      });
      onSelectBox(null);
    }
  };

  const handleMouseMove = (e: any) => {
    if (!drawing || !newBox) return;
    const { x, y } = e.target.getPointerPosition();
    setNewBox({
      ...newBox,
      width: x - newBox.x,
      height: y - newBox.y,
    });
  };

  const handleMouseUp = () => {
    if (
      drawing &&
      newBox &&
      Math.abs(newBox.width) > 10 &&
      Math.abs(newBox.height) > 10
    ) {
      onBoxesChange([...boundingBoxes, newBox]);
    }
    setDrawing(false);
    setNewBox(null);
  };

  // Handle box selection
  const handleBoxClick = (id: string) => {
    onSelectBox(id);
  };

  // Handle box drag
  const handleBoxDrag = (id: string, x: number, y: number) => {
    onBoxesChange(
      boundingBoxes.map((box) => (box.id === id ? { ...box, x, y } : box))
    );
  };

  // Handle box resize
  useEffect(() => {
    if (trRef.current && selectedBoxId) {
      trRef.current.nodes([stageRef.current.findOne(`#${selectedBoxId}`)]);
      trRef.current.getLayer().batchDraw();
    }
  }, [selectedBoxId]);

  // Handle zoom
  const handleWheel = (e: any) => {
    e.evt.preventDefault();
    const scaleBy = 1.05;
    const oldScale = stageScale;
    const pointer = stageRef.current.getPointerPosition();
    const mousePointTo = {
      x: (pointer.x - stagePos.x) / oldScale,
      y: (pointer.y - stagePos.y) / oldScale,
    };
    const newScale = e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy;
    setStageScale(newScale);
    setStagePos({
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    });
  };

  // Handle pan
  const handleDragMove = (e: any) => {
    setStagePos(e.target.position());
  };

  return (
    <Stage
      width={600}
      height={600}
      ref={stageRef}
      scaleX={stageScale}
      scaleY={stageScale}
      x={stagePos.x}
      y={stagePos.y}
      draggable
      onDragMove={handleDragMove}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      style={{ background: "#f8f8f8", borderRadius: 12 }}
    >
      <Layer>
        {image && <KonvaImage image={image} width={600} height={600} />}
        {boundingBoxes.map((box) => (
          <Rect
            key={box.id}
            id={box.id}
            x={box.x}
            y={box.y}
            width={box.width}
            height={box.height}
            stroke={box.color}
            strokeWidth={3}
            draggable
            onClick={() => handleBoxClick(box.id)}
            onDragStart={() => setDraggingBoxId(box.id)}
            onDragEnd={(e) => {
              setDraggingBoxId(null);
              handleBoxDrag(box.id, e.target.x(), e.target.y());
            }}
            opacity={selectedBoxId === box.id ? 0.7 : 1}
          />
        ))}
        {newBox && (
          <Rect
            x={newBox.x}
            y={newBox.y}
            width={newBox.width}
            height={newBox.height}
            stroke={newBox.color}
            strokeWidth={2}
            dash={[4, 4]}
            opacity={0.5}
          />
        )}
        {selectedBoxId && (
          <Transformer
            ref={trRef}
            boundBoxFunc={(oldBox, newBox) => {
              // Limit resize to minimum size
              if (newBox.width < 10 || newBox.height < 10) {
                return oldBox;
              }
              // TODO: Update box size on transform end
              return newBox;
            }}
          />
        )}
      </Layer>
    </Stage>
  );
};

export default EngineeringCanvas;
