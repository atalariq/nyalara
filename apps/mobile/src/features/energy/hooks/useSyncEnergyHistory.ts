import { useAuthStore } from '@/features/auth/store/authStore'
import { useEffect, useRef } from 'react'
import { dailyUsageService } from '../services/dailyUsageService'
import { useEnergyHistoryStore } from '../store/energyHistoryStore'
import type { DailyUsage } from '../types/dailyUsage.types'

function sortHistoryByDateAscending(history: DailyUsage[]): DailyUsage[] {
  return [...history].sort((a, b) => a.date.localeCompare(b.date))
}

export function useSyncEnergyHistory() {
  const user = useAuthStore((s) => s.user)
  const isAuthLoading = useAuthStore((s) => s.isLoading)
  const setToday = useEnergyHistoryStore((s) => s.setToday)
  const setHistory = useEnergyHistoryStore((s) => s.setHistory)
  const setLoading = useEnergyHistoryStore((s) => s.setLoading)
  const setError = useEnergyHistoryStore((s) => s.setError)
  const reset = useEnergyHistoryStore((s) => s.reset)

  const loadedCountRef = useRef(0)
  const totalListeners = 2

  function markOneLoaded() {
    loadedCountRef.current += 1
    if (loadedCountRef.current >= totalListeners) {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isAuthLoading) {
      return
    }

    if (!user?.uid) {
      reset()
      return
    }

    setLoading(true)
    setError(null)
    loadedCountRef.current = 0

    const unsubscribeToday = dailyUsageService.listenToday(user.uid, (data) => {
      setToday(data)
      markOneLoaded()
    })

    const unsubscribeHistory = dailyUsageService.listenHistory(user.uid, 30, (data) => {
      setHistory(sortHistoryByDateAscending(data))
      markOneLoaded()
    })

    return () => {
      unsubscribeToday()
      unsubscribeHistory()
    }
  }, [isAuthLoading, reset, setError, setHistory, setLoading, setToday, user?.uid])
}
