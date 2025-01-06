import { useSocket } from "@/hooks/useSocket";
import { useHistoryStore } from "@/store/history";
import { useLinesStore } from "@/store/lines";
import { KonvaEventObject } from "konva/lib/Node";
import { FC, useEffect, useRef, useState } from "react";
import { Stage, Layer, Line, Rect } from "react-konva";

type PropTypes = {
  tool: "pen" | "eraser" | "rectangle";
  strokeColor: string;
  strokeWidth: number;
};

export const Canvas: FC<PropTypes> = ({ tool, strokeWidth, strokeColor }) => {
  const { draw } = useSocket();

  const { history, setHistory, currentState, undoState, redoState } =
    useHistoryStore();
  console.log(
    "\n\n ---> src/components/logic/canvas.tsx:18 -> history: ",
    history
  );
  const lines = useLinesStore((state) => state.lines);
  const shouldCreateNewSateRef = useRef(false);
  console.log("\n\n ---> src/components/logic/canvas.tsx:20 -> lines: ", lines);
  const setLines = useLinesStore((state) => state.setLines);
  const rectangles = useLinesStore((state) => state.rectangles);
  const setRectangles = useLinesStore((state) => state.setRectangles);

  const isDrawing = useRef(false);
  const startPoint = useRef<{ x: number; y: number } | null>(null);
  const [temporaryRectangle, setTemporaryRectangle] = useState<RectType | null>(
    null
  );

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key.toLowerCase() === "z") {
        if (event.shiftKey) {
          redoState();
        } else {
          undoState();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleMouseDown = (e: KonvaEventObject<MouseEvent>): void => {
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

  const handleMouseMove = (e: KonvaEventObject<MouseEvent>) => {
    if (!isDrawing.current) return;

    const stage = e.target.getStage();
    const point = stage?.getPointerPosition();
    if (!point) return;

    let newLines: LineType[] = [];
    if (tool === "pen" || tool === "eraser") {
      const lastLine = lines[lines.length - 1];
      lastLine.points = lastLine.points.concat([point.x, point.y]);
      newLines = lines.slice(0, lines.length - 1).concat(lastLine);
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
    if (shouldCreateNewSateRef.current) {
      shouldCreateNewSateRef.current = false;
      const newState = [...history, { lines: newLines, rectangles: [] }];
      setHistory(newState);
    } else {
      const newState = [...history];
      newState[currentState] = {
        lines: newLines,
        rectangles: [],
      };
      setHistory(newState);
    }
  };

  const handleMouseUp = () => {
    isDrawing.current = false;

    if (tool === "rectangle" && temporaryRectangle) {
      setRectangles([...rectangles, temporaryRectangle]);
      setTemporaryRectangle(null);
    }
    shouldCreateNewSateRef.current = true;
    startPoint.current = null;
  };

  console.log(
    "\n\n ---> src/components/logic/canvas.tsx:116 -> history[currentState]?.lines: ",
    history[currentState]?.lines
  );
  console.log(
    "\n\n ---> src/components/logic/canvas.tsx:120 -> currentState: ",
    currentState
  );
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
          {history[currentState]?.lines.map((line, i) => (
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
              // draggable
            />
          ))}
          {history[currentState]?.rectangles.map((rect, i) => (
            <Rect
              // draggable
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
              // draggable
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
