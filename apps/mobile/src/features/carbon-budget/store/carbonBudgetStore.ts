// features/carbon-budget/store/carbonBudgetStore.ts
import { create } from 'zustand'
import AsyncStorage from '@react-native-async-storage/async-storage'
import type { HouseType } from '@/shared/config/carbonBudget'
import { getMonthlyBudget } from '@/shared/config/carbonBudget'
import { persist, createJSONStorage } from 'zustand/middleware'

type CarbonBudgetStore = {
  houseType: HouseType | null
  monthlyBudgetKwh: number
  setHouseType: (type: HouseType) => void
  setMonthlyBudget: (kwh: number) => void
}

export const useCarbonBudgetStore = create<CarbonBudgetStore>()(
  persist(
    (set) => ({
      houseType: null,
      monthlyBudgetKwh: 0,
      setHouseType: (type) =>
        set({
          houseType: type,
          monthlyBudgetKwh: getMonthlyBudget(type),
        }),
      setMonthlyBudget: (kwh) => set({ monthlyBudgetKwh: kwh }), // ← tambah
    }),
    {
      name: 'carbon-budget',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
)
