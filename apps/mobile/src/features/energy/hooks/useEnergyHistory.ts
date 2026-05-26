import { useAuthStore } from '@/features/auth/store/authStore'
import { useCallback } from 'react'
import { dailyUsageService } from '../services/dailyUsageService'
import { useEnergyHistoryStore } from '../store/energyHistoryStore'
import type { DailyUsage } from '../types/dailyUsage.types'

type EnergyHistoryState = {
  today: DailyUsage | null
  history: DailyUsage[]
  isLoading: boolean
  error: string | null
  refetch: () => void
}

export function useEnergyHistory(): EnergyHistoryState {
  const user = useAuthStore((s) => s.user)
  const today = useEnergyHistoryStore((s) => s.today)
  const history = useEnergyHistoryStore((s) => s.history)
  const isLoading = useEnergyHistoryStore((s) => s.isLoading)
  const error = useEnergyHistoryStore((s) => s.error)
  const setToday = useEnergyHistoryStore((s) => s.setToday)
  const setHistory = useEnergyHistoryStore((s) => s.setHistory)
  const setError = useEnergyHistoryStore((s) => s.setError)

  const refetch = useCallback(async () => {
    if (!user?.uid) return
    setError(null)
    try {
      const [todayData, historyData] = await Promise.all([
        dailyUsageService.getByDate(user.uid, new Date()),
        dailyUsageService.getHistory(user.uid, 30),
      ])
      setToday(todayData)
      setHistory([...historyData].sort((a, b) => a.date.localeCompare(b.date)))
    } catch {
      setError('Failed to load energy data')
    }
  }, [setError, setHistory, setToday, user?.uid])

  return { today, history, isLoading, error, refetch }
}
