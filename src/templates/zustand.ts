export const zustandTemplates = {
  // Example counter store demonstrating the pattern
  exampleStore: `import { createStore, useStore } from 'zustand';

interface CounterState {
  count: number;
  increment: () => void;
  decrement: () => void;
  reset: () => void;
}

const initialState = {
  count: 0,
};

export const counterStore = createStore<CounterState>()((set) => ({
  ...initialState,
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
  reset: () => set(initialState),
}));

export const useCounterStore = <T>(selector: (state: CounterState) => T): T => {
  return useStore(counterStore, selector);
};
`,
};
