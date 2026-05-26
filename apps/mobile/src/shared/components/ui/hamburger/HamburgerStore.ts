// src/features/navigation/store/hamburgerStore.ts
import { create } from 'zustand'

type HamburgerStore = {
  isOpen: boolean
  open: () => void
  close: () => void
  toggle: () => void
}

export const useHamburgerStore = create<HamburgerStore>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  toggle: () => set((state) => ({ isOpen: !state.isOpen })),
}))
