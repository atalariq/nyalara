// features/dashboard/hooks/useDashboardStats.ts
import { useDevices } from '@/features/devices/hooks/useDevices'
import { useEnergyHistory } from '@/features/energy/hooks/useEnergyHistory'
import { CARBON_CONFIG } from '@/shared/config/carbonConfig'
import type { DashboardStats } from '../types/dashboard.types'
import { useCarbonBudget } from '@/features/carbon-budget/hooks/useCarbonBudget'
import { useMemo } from 'react'
import { toFiniteNumber } from '../lib/finite-number'

export function useDashboardStats(): DashboardStats & { isLoading: boolean } {
  const { monthlyBudgetKwh } = useCarbonBudget()
  const dailyTargetKwh = toFiniteNumber(monthlyBudgetKwh / 30)
  const { today, isLoading } = useEnergyHistory()
  const { devices } = useDevices()

  return useMemo(() => {
    const dailyKwh = today?.totalKwh ?? 0
    const dailyCo2Kg = today?.totalEmissions ?? 0
    const dailyCostIdr = today?.totalCost ?? 0

    // Estimasi harian dari konfigurasi device (hoursPerDay)
    const estimatedDailyKwh = devices.reduce((sum, d) => sum + (d.watt * d.hoursPerDay) / 1000, 0)

    // Saved = selisih estimasi vs actual (min 0)
    const savedKwh = Math.max(estimatedDailyKwh - dailyKwh, 0)
    const co2ReducedKg = savedKwh * CARBON_CONFIG.emissionFactor

    const progress = dailyTargetKwh > 0 ? Math.min(dailyKwh / dailyTargetKwh, 1) : 0
    const remaining = Math.max(dailyTargetKwh - dailyKwh, 0)

    return {
      dailyKwh,
      monthlyKwh: 0,
      dailyCo2Kg,
      monthlyCo2Kg: 0,
      dailyCostIdr,
      monthlyCostIdr: 0,
      savedKwh,
      co2ReducedKg,
      progress,
      remaining,
      isLoading,
    }
  }, [dailyTargetKwh, devices, isLoading, today])
}
