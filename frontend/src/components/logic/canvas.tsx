import { useSocket } from "@/hooks/useSocket";
import { useLinesStore } from "@/store/lines";
import { FC, useRef, useState } from "react";
import { Stage, Layer, Line, Rect } from "react-konva";

type LineType = {
  tool: "pen" | "eraser";
  points: number[];
  strokeColor: string;
  strokeWidth: number;
};

type RectType = {
  tool: "rectangle";
  x: number;
  y: number;
  width: number;
  height: number;
  strokeColor: string;
  strokeWidth: number;
};

type PropTypes = {
  tool: "pen" | "eraser" | "rectangle";
  strokeColor: string;
  strokeWidth: number;
};

export const Canvas: FC<PropTypes> = ({ tool, strokeWidth, strokeColor }) => {
  const { draw } = useSocket();
  const lines = useLinesStore((state) => state.lines);
  const setLines = useLinesStore((state) => state.setLines);
  const rectangles = useLinesStore((state) => state.rectangles);
  const setRectangles = useLinesStore((state) => state.setRectangles);

  const isDrawing = useRef(false);
  const startPoint = useRef<{ x: number; y: number } | null>(null);
  const [temporaryRectangle, setTemporaryRectangle] = useState<RectType | null>(
    null
  );

  const handleMouseDown = (e: any): void => {
    isDrawing.current = true;
    const pos = e.target.getStage()?.getPointerPosition();
    if (!pos) return;

    if (tool === "pen" || tool === "eraser") {
      setLines([
        ...lines,
        { tool, points: [pos.x, pos.y], strokeColor, strokeWidth },
      ]);
    } else if (tool === "rectangle") {
      startPoint.current = pos;
      setTemporaryRectangle({
        tool: "rectangle",
        x: pos.x,
        y: pos.y,
        width: 0,
        height: 0,
        strokeColor,
        strokeWidth,
      });
    }
  };

  const handleMouseMove = (e: any) => {
    if (!isDrawing.current) return;

    const stage = e.target.getStage();
    const point = stage?.getPointerPosition();
    if (!point) return;

    if (tool === "pen" || tool === "eraser") {
      const lastLine = lines[lines.length - 1];
      lastLine.points = lastLine.points.concat([point.x, point.y]);
      const newLines = lines.slice(0, lines.length - 1).concat(lastLine);
      setLines(newLines);
      draw(newLines);
    } else if (tool === "rectangle" && startPoint.current) {
      const { x, y } = startPoint.current;
      const width = point.x - x;
      const height = point.y - y;

      setTemporaryRectangle({
        tool: "rectangle",
        x,
        y,
        width,
        height,
        strokeColor,
        strokeWidth,
      });
    }
  };

  const handleMouseUp = () => {
    isDrawing.current = false;

    if (tool === "rectangle" && temporaryRectangle) {
      setRectangles([...rectangles, temporaryRectangle]);
      setTemporaryRectangle(null);
    }

    startPoint.current = null;
  };

  return (
    <div>
      <Stage
        width={window.innerWidth}
        height={window.innerHeight}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        <Layer>
          {lines.map((line, i) => (
            <Line
              key={i}
              points={line.points}
              stroke={line.strokeColor}
              strokeWidth={line.strokeWidth}
              tension={0.5}
              lineCap="round"
              lineJoin="round"
              globalCompositeOperation={
                line.tool === "eraser" ? "destination-out" : "source-over"
              }
            />
          ))}
          {rectangles.map((rect, i) => (
            <Rect
              key={i}
              x={rect.x}
              y={rect.y}
              width={rect.width}
              height={rect.height}
              stroke={rect.strokeColor}
              strokeWidth={rect.strokeWidth}
            />
          ))}
          {temporaryRectangle && (
            <Rect
              x={temporaryRectangle.x}
              y={temporaryRectangle.y}
              width={temporaryRectangle.width}
              height={temporaryRectangle.height}
              stroke={temporaryRectangle.strokeColor}
              strokeWidth={temporaryRectangle.strokeWidth}
              globalCompositeOperation="source-over"
            />
          )}
        </Layer>
      </Stage>
    </div>
  );
};
