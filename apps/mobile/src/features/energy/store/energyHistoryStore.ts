import { create } from 'zustand'
import type { DailyUsage } from '../types/dailyUsage.types'

type EnergyHistoryState = {
  today: DailyUsage | null
  history: DailyUsage[]
  isLoading: boolean
  error: string | null
  setToday: (today: DailyUsage | null) => void
  setHistory: (history: DailyUsage[]) => void
  setLoading: (isLoading: boolean) => void
  setError: (error: string | null) => void
  reset: () => void
}

export const useEnergyHistoryStore = create<EnergyHistoryState>((set) => ({
  today: null,
  history: [],
  isLoading: true,
  error: null,
  setToday: (today) => set({ today }),
  setHistory: (history) => set({ history }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  reset: () =>
    set({
      today: null,
      history: [],
      isLoading: false,
      error: null,
    }),
}))
