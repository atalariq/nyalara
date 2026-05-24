// features/dashboard/hooks/useDashboardAI.ts
import { useDevices } from '@/features/devices/hooks/useDevices'
import { useEnergyHistory } from '@/features/energy/hooks/useEnergyHistory'
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
    status: 'idle',
  })

  const lastFetchRef = useRef<number>(0)
  const lastStatsRef = useRef<string>('')

  useEffect(() => {
    // Tunggu sampai ada data today dari Firestore
    if (stats.isLoading) return

    const statsKey = `${stats.dailyKwh.toFixed(1)}-${devices.length}`
    const now = Date.now()
    const isCacheValid = now - lastFetchRef.current < CACHE_DURATION_MS
    const isSameStats = lastStatsRef.current === statsKey

    if (isCacheValid && isSameStats) return

    // Kirim device breakdown ke Gemini supaya lebih spesifik
    const deviceSummary = today?.devices
      ? Object.values(today.devices)
          .map((d) => `${d.name} (${d.kwh.toFixed(3)} kWh)`)
          .join(', ')
      : devices.map((d) => d.name).join(', ')

    setInsight((prev) => ({ ...prev, status: 'loading' }))
    lastFetchRef.current = now
    lastStatsRef.current = statsKey

    fetchAIInsight(stats, deviceSummary)
      .then((data) =>
        setInsight({
          recommendations: data.recommendations,
          dailyTip: data.dailyTip,
          status: 'success',
        }),
      )
      .catch(() => setInsight((prev) => ({ ...prev, status: 'error' })))
  }, [stats.dailyKwh, stats.isLoading, devices.length])

  return insight
}
