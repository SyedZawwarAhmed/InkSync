import { create } from "zustand";

type Store = {
  lines: LineType[];
  rectangles: RectType[];
  setLines: (lines: LineType[]) => void;
  setRectangles: (rectangles: RectType[]) => void;
};

export const useLinesStore = create<Store>((set) => ({
  lines: [{ strokeColor: "#ffffff", strokeWidth: 5, tool: "pen", points: [] }],
  rectangles: [],
  setLines: (lines: LineType[]) => set({ lines }),
  setRectangles: (rectangles: RectType[]) => set({ rectangles }),
}));
