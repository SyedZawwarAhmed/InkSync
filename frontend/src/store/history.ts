import { create } from "zustand";

type Store = {
  history: unknown[];
  setHistory: (nextState: unknown[]) => void;
  currentState: number;
  undoState: () => void;
  redoState: () => void;
};

export const useHistoryStore = create<Store>((set) => ({
  history: [],
  currentState: 0,
  setHistory: (nextState) => {
    set({ history: nextState });
    set((state) => ({ currentState: state.history.length - 1 }));
  },
  undoState: () => {
    set((state) => ({
      currentState:
        state.currentState > -1 ? state.currentState - 1 : state.currentState,
    }));
  },
  redoState: () => {
    set((state) => ({
      currentState:
        state.currentState < history.length
          ? state.currentState + 1
          : state.currentState,
    }));
  },
}));
