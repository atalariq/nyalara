import { useDevices } from '@/features/devices/hooks/useDevices'
import { useEnergyHistory } from '@/features/energy/hooks/useEnergyHistory'
import { CARBON_CONFIG } from '@/shared/config/carbonConfig'
import { useEffect, useRef, useState } from 'react'
import { fetchAIInsight } from '../api/dashboardApi'
import type { AIInsight, DashboardStats } from '../types/dashboard.types'

const CACHE_DURATION_MS = 10 * 60 * 1000

export function useDashboardAI(stats: DashboardStats): AIInsight {
  const { devices } = useDevices()
  const { today } = useEnergyHistory()

  const [insight, setInsight] = useState<AIInsight>({
    recommendations: [],
    dailyTip: '',
    environmentalQuote: '',
    status: 'idle',
  })

  const lastFetchRef = useRef<number>(0)
  const lastStatsRef = useRef<string>('')

  // Hitung co2ReducedKg dari devices estimate vs actual
  const estimatedMonthlyKwh = devices.reduce(
    (sum, d) => sum + (d.watt * d.hoursPerDay * 30) / 1000,
    0,
  )
  const totalKwh = today?.totalKwh ?? 0
  const savedKwh = Math.max(estimatedMonthlyKwh - totalKwh, 0)
  const co2ReducedKg = savedKwh * CARBON_CONFIG.emissionFactor

  useEffect(() => {
    if (stats.isLoading) return

    const statsKey = `${stats.dailyKwh.toFixed(1)}-${devices.length}`
    const now = Date.now()
    const isCacheValid = now - lastFetchRef.current < CACHE_DURATION_MS
    const isSameStats = lastStatsRef.current === statsKey

    if (isCacheValid && isSameStats) return

    const deviceSummary = today?.devices
      ? Object.values(today.devices)
          .map((d) => `${d.name} (${d.kwh.toFixed(3)} kWh)`)
          .join(', ')
      : devices.map((d) => d.name).join(', ')

    setInsight((prev) => ({ ...prev, status: 'loading' }))
    lastFetchRef.current = now
    lastStatsRef.current = statsKey

    const timeout = setTimeout(() => {}, 10_000)

    fetchAIInsight(stats, deviceSummary, co2ReducedKg)
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
  }, [stats.dailyKwh, stats.isLoading, devices.length])

  return insight
}
