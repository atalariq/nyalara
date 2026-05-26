// src/features/goals/store/goalsStore.ts
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'

export type SustainabilityTarget = {
  id: string
  label: string
  completed: boolean
}

type GoalsState = {
  dailyTargetKwh: number
  sustainabilityTargets: SustainabilityTarget[]
  setDailyTarget: (kwh: number) => void
  addTarget: (label: string) => void
  updateTarget: (id: string, label: string) => void
  removeTarget: (id: string) => void
  toggleTarget: (id: string) => void
}

export const useGoalsStore = create<GoalsState>()(
  persist(
    (set) => ({
      dailyTargetKwh: 5,
      sustainabilityTargets: [
        { id: '1', label: 'Reduce monthly usage', completed: false },
        { id: '2', label: 'Lower carbon footprint', completed: false },
      ],

      setDailyTarget: (kwh) => set({ dailyTargetKwh: kwh }),

      addTarget: (label) =>
        set((state) => ({
          sustainabilityTargets: [
            ...state.sustainabilityTargets,
            { id: Date.now().toString(), label, completed: false },
          ],
        })),

      updateTarget: (id, label) =>
        set((state) => ({
          sustainabilityTargets: state.sustainabilityTargets.map((t) =>
            t.id === id ? { ...t, label } : t,
          ),
        })),

      removeTarget: (id) =>
        set((state) => ({
          sustainabilityTargets: state.sustainabilityTargets.filter((t) => t.id !== id),
        })),

      toggleTarget: (id) =>
        set((state) => ({
          sustainabilityTargets: state.sustainabilityTargets.map((t) =>
            t.id === id ? { ...t, completed: !t.completed } : t,
          ),
        })),
    }),
    {
      name: 'goals-storage',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
)
