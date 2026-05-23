// features/devices/store/togglingStore.ts
import { create } from "zustand";

type TogglingStore = {
  togglingIds: Set<string>;
  setToggling: (id: string, value: boolean) => void;
};

export const useTogglingStore = create<TogglingStore>((set) => ({
  togglingIds: new Set(),
  setToggling: (id, value) =>
    set((state) => {
      const next = new Set(state.togglingIds);
      value ? next.add(id) : next.delete(id);
      return { togglingIds: next };
    }),
}));
