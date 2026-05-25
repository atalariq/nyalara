// features/energy/hooks/useEnergyScreenData.ts

import { useCarbonSummary } from '@/features/dashboard/hooks/useCarbonSummary'
import { useDashboardAI } from '@/features/dashboard/hooks/useDashboardAI'
import { useDashboardStats } from '@/features/dashboard/hooks/useDashboardStats'
import { useDevices } from '@/features/devices/hooks/useDevices'
import { getEfficiencyResult } from '../utils/energyEfficiency'
import { useEnergyHistory } from './useEnergyHistory'

function getComparedToYesterday(
  todayKwh: number,
  history: ReturnType<typeof useEnergyHistory>['history'],
): number | null {
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = yesterday.toISOString().split('T')[0]
  const yesterdayData = history.find((d) => d.date === yesterdayStr)
  if (!yesterdayData || yesterdayData.totalKwh === 0) return null
  return ((todayKwh - yesterdayData.totalKwh) / yesterdayData.totalKwh) * 100
}

export function useEnergyScreenData() {
  useDevices()

  const { today, history, isLoading, error } = useEnergyHistory()
  const { co2ReducedKg } = useCarbonSummary(history)
  const stats = useDashboardStats()
  const insight = useDashboardAI(stats)

  const todayKwh = today?.totalKwh ?? 0
  const comparedToYesterday = getComparedToYesterday(todayKwh, history)
  const efficiency = getEfficiencyResult(todayKwh, comparedToYesterday)

  return {
    today,
    history,
    isLoading,
    error,
    todayKwh,
    comparedToYesterday,
    co2ReducedKg,
    insight,
    efficiency,
  }
}
