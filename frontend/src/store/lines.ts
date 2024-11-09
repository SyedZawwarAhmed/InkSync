import { create } from "zustand";

type LineType = {
  tool: string;
  points: number[];
  strokeColor: string;
  strokeWidth: number;
};

type Store = {
  lines: LineType[];
  setLines: (lines: LineType[]) => void;
};

export const useLinesStore = create<Store>()((set) => ({
  lines: [{ strokeColor: "#ffffff", strokeWidth: 5, tool: "pen", points: [] }],
  setLines: (lines: LineType[]) => set({ lines: lines }),
}));
