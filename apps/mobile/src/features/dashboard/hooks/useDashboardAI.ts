import type { Device } from '@/features/devices/types/device.types'
import type { DailyEnergyUsage } from '@/features/energy/types/energyHistory.types'
import { CARBON_CONFIG } from '@/shared/config/carbonConfig'
import { useEffect, useMemo, useRef, useState } from 'react'
import { fetchAIInsight } from '../api/dashboardApi'
import type { AIInsight, DashboardStats } from '../types/dashboard.types'
import {
  createDashboardStatsSnapshot,
  getIdleInsightState,
  IDLE_INSIGHT,
} from './dashboard-ai-state'

const CACHE_DURATION_MS = 10 * 60 * 1000

export function useDashboardAI({
  stats,
  devices,
  today,
}: {
  stats: DashboardStats
  devices: Device[]
  today: DailyEnergyUsage | null
}): AIInsight {
  const [insight, setInsight] = useState<AIInsight>(IDLE_INSIGHT)

  const lastFetchRef = useRef<number>(0)
  const lastStatsRef = useRef<string>('')

  const statsSnapshot = useMemo(
    () => createDashboardStatsSnapshot(stats),
    [
      stats.co2ReducedKg,
      stats.dailyCo2Kg,
      stats.dailyCostIdr,
      stats.dailyKwh,
      stats.isLoading,
      stats.monthlyCo2Kg,
      stats.monthlyCostIdr,
      stats.monthlyKwh,
      stats.progress,
      stats.remaining,
      stats.savedKwh,
    ],
  )

  // Hitung co2ReducedKg dari devices estimate vs actual
  const estimatedMonthlyKwh = useMemo(
    () => devices.reduce((sum, d) => sum + (d.watt * d.hoursPerDay * 30) / 1000, 0),
    [devices],
  )
  const totalKwh = today?.totalKwh ?? 0
  const savedKwh = Math.max(estimatedMonthlyKwh - totalKwh, 0)
  const co2ReducedKg = savedKwh * CARBON_CONFIG.emissionFactor
  const hasMeaningfulUsageData = totalKwh > 0 || Object.keys(today?.devices ?? {}).length > 0
  const deviceSummary = useMemo(() => {
    if (today?.devices) {
      return Object.values(today.devices)
        .map((d) => `${d.name} (${d.kwh.toFixed(3)} kWh)`)
        .join(', ')
    }

    return devices.map((d) => d.name).join(', ')
  }, [devices, today?.devices])
  const requestKey = useMemo(() => {
    const todayDate = today?.date ?? 'none'
    const deviceCount = devices.length

    return [
      statsSnapshot.dailyKwh.toFixed(3),
      statsSnapshot.savedKwh.toFixed(3),
      statsSnapshot.co2ReducedKg.toFixed(3),
      totalKwh.toFixed(3),
      todayDate,
      String(deviceCount),
      String(Object.keys(today?.devices ?? {}).length),
    ].join('|')
  }, [
    devices.length,
    statsSnapshot.co2ReducedKg,
    statsSnapshot.dailyKwh,
    statsSnapshot.savedKwh,
    today?.date,
    today?.devices,
    totalKwh,
  ])

  useEffect(() => {
    if (statsSnapshot.isLoading) return

    if (!hasMeaningfulUsageData) {
      setInsight((current) => getIdleInsightState(current))
      return
    }

    const now = Date.now()
    const isCacheValid = now - lastFetchRef.current < CACHE_DURATION_MS
    const isSameStats = lastStatsRef.current === requestKey

    if (isCacheValid && isSameStats) return

    setInsight((prev) => ({ ...prev, status: 'loading' }))
    lastFetchRef.current = now
    lastStatsRef.current = requestKey

    const timeout = setTimeout(() => {}, 10_000)

    fetchAIInsight(statsSnapshot, deviceSummary, co2ReducedKg)
      .then((data) =>
        setInsight({
          recommendations: data.recommendations,
          dailyTip: data.dailyTip,
          environmentalQuote: data.environmentalQuote,
          status: 'success',
        }),
      )
      .catch(() => setInsight((prev) => ({ ...prev, status: 'error' })))
      .finally(() => clearTimeout(timeout))
  }, [co2ReducedKg, deviceSummary, hasMeaningfulUsageData, requestKey, statsSnapshot])

  return insight
}
