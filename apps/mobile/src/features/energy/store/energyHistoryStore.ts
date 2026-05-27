import { create } from 'zustand'
import type { DailyEnergyUsage } from '../types/energyHistory.types'

type EnergyHistoryState = {
  today: DailyEnergyUsage | null
  history: DailyEnergyUsage[]
  isLoading: boolean
  error: string | null
  setToday: (today: DailyEnergyUsage | null) => void
  setHistory: (history: DailyEnergyUsage[]) => void
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
