type LineType = {
  tool: string;
  points: number[];
  strokeColor: string;
  strokeWidth: number;
};

type RectType = {
  id: string;
  tool: "rectangle";
  x: number;
  y: number;
  width: number;
  height: number;
  strokeColor: string;
  strokeWidth: number;
};

type EllipseType = {
  tool: "ellipse";
  x: number;
  y: number;
  radiusX: number;
  radiusY: number;
  strokeColor: string;
  strokeWidth: number;
};
