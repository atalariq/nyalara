import { useAuthStore } from '@/features/auth/store/authStore'
import { useEffect, useRef, useState } from 'react'
import { dailyUsageService } from '../services/dailyUsageService'
import type { DailyUsage } from '../types/dailyUsage.types'

type EnergyHistoryState = {
  today: DailyUsage | null
  history: DailyUsage[]
  isLoading: boolean
  error: string | null
  refetch: () => void
}

function sortHistoryByDateAscending(history: DailyUsage[]): DailyUsage[] {
  return [...history].sort((a, b) => a.date.localeCompare(b.date))
}

export function useEnergyHistory(): EnergyHistoryState {
  const user = useAuthStore((s) => s.user)
  const isAuthLoading = useAuthStore((s) => s.isLoading)

  const [today, setToday] = useState<DailyUsage | null>(null)
  const [history, setHistory] = useState<DailyUsage[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Track berapa listener yang sudah fire pertama kali
  const loadedCountRef = useRef(0)
  const TOTAL_LISTENERS = 2

  function markOneLoaded() {
    loadedCountRef.current += 1
    if (loadedCountRef.current >= TOTAL_LISTENERS) {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    // Auth belum siap
    if (isAuthLoading) return

    // User tidak login
    if (!user?.uid) {
      setIsLoading(false)
      return
    }

    // Reset state
    setIsLoading(true)
    setError(null)
    loadedCountRef.current = 0

    const unsubscribeToday = dailyUsageService.listenToday(user.uid, (data) => {
      setToday(data)
      markOneLoaded()
    })

    const unsubscribeHistory = dailyUsageService.listenHistory(
      user.uid,
      30,
      (data) => {
        setHistory(sortHistoryByDateAscending(data))
        markOneLoaded()
      },
    )

    return () => {
      unsubscribeToday()
      unsubscribeHistory()
    }
  }, [user?.uid, isAuthLoading])

  async function refetch() {
    if (!user?.uid) return
    setError(null)
    try {
      const [todayData, historyData] = await Promise.all([
        dailyUsageService.getByDate(user.uid, new Date()),
        dailyUsageService.getHistory(user.uid, 30),
      ])
      setToday(todayData)
      setHistory(sortHistoryByDateAscending(historyData))
    } catch {
      setError('Gagal memuat data energi')
    }
  }

  return { today, history, isLoading, error, refetch }
}
