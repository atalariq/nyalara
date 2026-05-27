// features/carbon-budget/hooks/useCarbonBudget.ts
import { useCarbonBudgetStore } from '../store/carbonBudgetStore'
import { useDevices } from '@/features/devices/hooks/useDevices'
import { toFiniteNumber } from '@/features/dashboard/lib/finite-number'

export function useCarbonBudget() {
  const { monthlyBudgetKwh, houseType } = useCarbonBudgetStore()
  const { devices } = useDevices()

  const usedKwh = devices.reduce((sum, d) => sum + (d.monthlyKwh ?? 0), 0)
  const safeMonthlyBudgetKwh = toFiniteNumber(monthlyBudgetKwh)
  const remainingKwh = Math.max(0, safeMonthlyBudgetKwh - usedKwh)
  const percentage = safeMonthlyBudgetKwh > 0 ? (usedKwh / safeMonthlyBudgetKwh) * 100 : 0
  const isOverBudget = usedKwh > safeMonthlyBudgetKwh

  return {
    houseType,
    monthlyBudgetKwh: safeMonthlyBudgetKwh,
    usedKwh,
    remainingKwh,
    percentage: Math.min(percentage, 100),
    isOverBudget,
  }
}
