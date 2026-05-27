import type { Device } from '../../devices/types/device.types'
import type { DailyEnergyUsage } from '../../energy/types/energyHistory.types'
import { CARBON_CONFIG } from '../../../shared/config/carbonConfig'
import type { DashboardStats } from '../types/dashboard.types'

const DAILY_GOAL_KWH = 5

export type DashboardStatsInput = {
  today: DailyEnergyUsage | null
  devices: Device[]
  isLoading: boolean
}

export type CarbonSummary = {
  totalKwh: number
  totalCo2Kg: number
  totalCost: number
  savedKwh: number
  co2ReducedKg: number
  dailySavedKwh: number
  dailyCo2ReducedKg: number
}

export function calculateDashboardStats({
  today,
  devices,
  isLoading,
}: DashboardStatsInput): DashboardStats {
  const dailyKwh = today?.totalKwh ?? 0
  const dailyCo2Kg = today?.totalEmissions ?? 0
  const dailyCostIdr = today?.totalCost ?? 0

  const estimatedDailyKwh = devices.reduce(
    (sum, device) => sum + (device.watt * device.hoursPerDay) / 1000,
    0,
  )

  const savedKwh = Math.max(estimatedDailyKwh - dailyKwh, 0)
  const co2ReducedKg = savedKwh * CARBON_CONFIG.emissionFactor
  const progress = Math.min(dailyKwh / DAILY_GOAL_KWH, 1)
  const remaining = Math.max(DAILY_GOAL_KWH - dailyKwh, 0)

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
}

export function calculateCarbonSummary(
  history: DailyEnergyUsage[],
  devices: Device[],
): CarbonSummary {
  const historyDays = history.length || 1
  const totalKwh = history.reduce((sum, day) => sum + day.totalKwh, 0)
  const totalCo2Kg = totalKwh * CARBON_CONFIG.emissionFactor
  const totalCost = totalKwh * CARBON_CONFIG.electricityRate

  const dailyBaselineKwh = devices.reduce(
    (sum, device) => sum + (device.watt * device.hoursPerDay) / 1000,
    0,
  )
  const baselineKwh = dailyBaselineKwh * historyDays
  const savedKwh = Math.max(baselineKwh - totalKwh, 0)
  const co2ReducedKg = savedKwh * CARBON_CONFIG.emissionFactor

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
}
