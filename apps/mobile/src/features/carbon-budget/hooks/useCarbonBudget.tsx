// features/carbon-budget/hooks/useCarbonBudget.ts
import { useCarbonBudgetStore } from '../store/carbonBudgetStore'
import { useDevices } from '@/features/devices/hooks/useDevices'

export function useCarbonBudget() {
  const { monthlyBudgetKwh, houseType } = useCarbonBudgetStore()
  const { devices } = useDevices()

  const usedKwh = devices.reduce((sum, d) => sum + (d.monthlyKwh ?? 0), 0)
  const remainingKwh = Math.max(0, monthlyBudgetKwh - usedKwh)
  const percentage = monthlyBudgetKwh > 0 ? (usedKwh / monthlyBudgetKwh) * 100 : 0
  const isOverBudget = usedKwh > monthlyBudgetKwh

  return {
    houseType,
    monthlyBudgetKwh,
    usedKwh,
    remainingKwh,
    percentage: Math.min(percentage, 100),
    isOverBudget,
  }
}
