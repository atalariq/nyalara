// features/dashboard/hooks/useCarbonSummary.ts
import { CARBON_CONFIG } from '@/shared/config/carbonConfig'
import { useDevices } from '@/features/devices/hooks/useDevices'
import { useMemo } from 'react'
import type { DailyUsage } from '@/features/energy/types/dailyUsage.types'

export function useCarbonSummary(history: DailyUsage[]) {
  const { devices } = useDevices()

  return useMemo(() => {
    const historyDays = history.length || 1

    // Actual usage dari history
    const totalKwh = history.reduce((sum, d) => sum + d.totalKwh, 0)
    const totalCo2Kg = totalKwh * CARBON_CONFIG.emissionFactor
    const totalCost = totalKwh * CARBON_CONFIG.electricityRate

    // Baseline: device config diprorata ke jumlah hari history
    const dailyBaselineKwh = devices.reduce(
      (sum, d) => sum + (d.watt * d.hoursPerDay) / 1000,
      0,
    )
    const baselineKwh = dailyBaselineKwh * historyDays

    // Saved = baseline - actual (kalau actual < baseline)
    const savedKwh = Math.max(baselineKwh - totalKwh, 0)
    const co2ReducedKg = savedKwh * CARBON_CONFIG.emissionFactor

    // Daily figures (untuk DashboardDailyImpact)
    const todayHistory = history[history.length - 1]
    const todayKwh = todayHistory?.totalKwh ?? 0
    const dailySavedKwh = Math.max(dailyBaselineKwh - todayKwh, 0)
    const dailyCo2ReducedKg = dailySavedKwh * CARBON_CONFIG.emissionFactor

    return {
      totalKwh,
      totalCo2Kg,
      totalCost,
      savedKwh,
      co2ReducedKg,
      dailySavedKwh,
      dailyCo2ReducedKg,
    }
  }, [history, devices])
}
