import { useSocket } from "@/hooks/useSocket";
import { useLinesStore } from "@/store/lines";
import { KonvaEventObject } from "konva/lib/Node";
import { FC, useRef, useState, useEffect } from "react";
import { Stage, Layer, Line, Rect, Ellipse } from "react-konva";
import { Vector2d } from "konva/lib/types";

type PropTypes = {
  tool: ToolType;
  strokeColor: string;
  strokeWidth: number;
};

export const Canvas: FC<PropTypes> = ({ tool, strokeWidth, strokeColor }) => {
  const { draw } = useSocket();
  const lines = useLinesStore((state) => state.lines);
  const setLines = useLinesStore((state) => state.setLines);
  const rectangles = useLinesStore((state) => state.rectangles);
  const setRectangles = useLinesStore((state) => state.setRectangles);
  const ellipses = useLinesStore((state) => state.ellipses);
  const setEllipse = useLinesStore((state) => state.setEllipse);

  const isDrawing = useRef(false);
  const startPoint = useRef<{ x: number; y: number } | null>(null);
  const [temporaryRectangle, setTemporaryRectangle] = useState<RectType | null>(
    null
  );
  const [temporaryEllipse, setTemporaryEllipse] = useState<EllipseType | null>(
    null
  );
  const [isSpacePressed, setIsSpacePressed] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" && !isSpacePressed) {
        e.preventDefault();
        setIsSpacePressed(true);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        setIsSpacePressed(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [isSpacePressed]);

  const getRelativePointerPosition = (
    e: KonvaEventObject<MouseEvent>
  ): Vector2d | undefined => {
    const stage = e.target.getStage();
    if (stage) {
      const transform = stage.getAbsoluteTransform().copy();
      transform.invert();
      const pos = stage.getPointerPosition();
      if (pos) return transform.point(pos);
    }
  };

  const handleMouseDown = (e: KonvaEventObject<MouseEvent>): void => {
    if (isSpacePressed) return; // Don't draw if space is pressed

    isDrawing.current = true;
    const pos = getRelativePointerPosition(e);
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
    } else if (tool === "ellipse") {
      startPoint.current = pos;
      setTemporaryEllipse({
        tool: "ellipse",
        x: pos.x,
        y: pos.y,
        radiusX: 0,
        radiusY: 0,
        strokeColor,
        strokeWidth,
      });
    }
  };

  const handleMouseMove = (e: KonvaEventObject<MouseEvent>) => {
    if (isSpacePressed) return; // Don't draw if space is pressed
    if (!isDrawing.current) return;

    const point = getRelativePointerPosition(e);
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
    } else if (tool === "ellipse" && startPoint.current) {
      const { x, y } = startPoint.current;
      const width = Math.abs(point.x - x);
      const height = Math.abs(point.y - y);

      // Calculate center point of the ellipse
      const centerX = x + (point.x - x) / 2;
      const centerY = y + (point.y - y) / 2;

      setTemporaryEllipse({
        tool: "ellipse",
        x: centerX,
        y: centerY,
        radiusX: width / 2,
        radiusY: height / 2,
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
    } else if (tool === "ellipse" && temporaryEllipse) {
      setEllipse([...ellipses, temporaryEllipse]);
      setTemporaryEllipse(null);
    }

    startPoint.current = null;
  };

  const [stage, setStage] = useState({
    scale: 1,
    x: 0,
    y: 0,
  });

  const handleWheel = (e: KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();

    const scaleBy = 1.02;
    const stage = e.target.getStage();
    if (stage) {
      const oldScale = stage.scaleX();
      const stagePointerPosition = stage.getPointerPosition();
      if (stagePointerPosition) {
        const mousePointTo = {
          x: stagePointerPosition.x / oldScale - stage.x() / oldScale,
          y: stagePointerPosition.y / oldScale - stage.y() / oldScale,
        };

        const newScale =
          e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy;

        setStage({
          scale: newScale,
          x: (stagePointerPosition.x / newScale - mousePointTo.x) * newScale,
          y: (stagePointerPosition.y / newScale - mousePointTo.y) * newScale,
        });
      }
    }
  };

  return (
    <div>
      <Stage
        width={window.innerWidth}
        height={window.innerHeight}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
        scaleX={stage.scale}
        scaleY={stage.scale}
        x={stage.x}
        y={stage.y}
        draggable={isSpacePressed || tool === "hand"}
        onDragEnd={(e) => {
          const newPos = e.target.position();
          setStage({
            ...stage,
            x: newPos.x,
            y: newPos.y,
          });
        }}
        style={{
          cursor:
            isSpacePressed || tool === "hand"
              ? isDrawing.current
                ? "grabbing"
                : "grab"
              : "crosshair",
        }}
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
          {ellipses.map((ellipse, i) => (
            <Ellipse
              key={i}
              x={ellipse.x}
              y={ellipse.y}
              radiusX={ellipse.radiusX}
              radiusY={ellipse.radiusY}
              stroke={ellipse.strokeColor}
              strokeWidth={ellipse.strokeWidth}
            />
          ))}
          {temporaryEllipse && (
            <Ellipse
              x={temporaryEllipse.x}
              y={temporaryEllipse.y}
              radiusX={temporaryEllipse.radiusX}
              radiusY={temporaryEllipse.radiusY}
              stroke={temporaryEllipse.strokeColor}
              strokeWidth={temporaryEllipse.strokeWidth}
            />
          )}
        </Layer>
      </Stage>
    </div>
  );
};
