import { create } from "zustand";

type Store = {
  lines: LineType[];
  rectangles: RectType[];
  setLines: (lines: LineType[]) => void;
  setRectangles: (rectangles: RectType[]) => void;
  ellipses: EllipseType[];
  setEllipse: (ellipses: EllipseType[]) => void;
};

export const useLinesStore = create<Store>((set) => ({
  lines: [{ strokeColor: "#ffffff", strokeWidth: 5, tool: "pen", points: [] }],
  rectangles: [],
  ellipses: [],
  setLines: (lines: LineType[]) => set({ lines }),
  setRectangles: (rectangles: RectType[]) => set({ rectangles }),
  setEllipse: (ellipses: EllipseType[]) => set({ ellipses }),
}));
