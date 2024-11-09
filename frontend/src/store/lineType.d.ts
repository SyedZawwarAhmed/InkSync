type LineType = {
  tool: string;
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
