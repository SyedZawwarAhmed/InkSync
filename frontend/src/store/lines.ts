import { create } from "zustand";

type LineType = {
  tool: string;
  points: number[];
};

type Store = {
  lines: LineType[];
  setLines: (lines: LineType[]) => void;
};

export const useLinesStore = create<Store>()((set) => ({
  lines: [],
  setLines: (lines: LineType[]) => set({ lines: lines }),
}));
