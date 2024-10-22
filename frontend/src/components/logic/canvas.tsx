import { useSocket } from "@/hooks/useSocket";
import { useLinesStore } from "@/store/lines";
import { FC, useRef } from "react";
import { Stage, Layer, Line } from "react-konva";

// Define the shape of a single line

type PropTypes = {
  tool: "pen" | "eraser";
  strokeColor: string;
  strokeWidth: number;
};

export const Canvas: FC<PropTypes> = ({ tool, strokeWidth, strokeColor }) => {
  const { draw } = useSocket();
  const lines = useLinesStore((state) => state.lines);
  const setLines = useLinesStore((state) => state.setLines);
  const isDrawing = useRef(false);

  const handleMouseDown = (e): void => {
    isDrawing.current = true;

    const pos = e.target.getStage()?.getPointerPosition();
    if (pos) {
      setLines([...lines, { tool, points: [pos.x, pos.y] }]);
    }
  };

  const handleMouseMove = (e) => {
    if (!isDrawing.current) return;

    const stage = e.target.getStage();
    const point = stage?.getPointerPosition();
    if (!point) return;

    const lastLine = lines[lines.length - 1];
    lastLine.points = lastLine.points.concat([point.x, point.y]);

    const newLines = lines.slice(0, lines.length - 1).concat(lastLine);
    setLines(newLines);
    draw(newLines);
  };

  const handleMouseUp = () => {
    isDrawing.current = false;
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
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              tension={0.5}
              lineCap="round"
              lineJoin="round"
              globalCompositeOperation={
                line.tool === "eraser" ? "destination-out" : "source-over"
              }
            />
          ))}
        </Layer>
      </Stage>
    </div>
  );
};
