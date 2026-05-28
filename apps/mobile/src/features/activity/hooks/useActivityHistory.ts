// features/activity/hooks/useActivityHistory.ts

import { useAuthStore } from '@/features/auth/store/authStore'
import { energyHistoryService } from '@/features/energy/services/energyHistoryService'
import { useEffect, useRef, useState } from 'react'
import type { DailyEnergyUsage } from '@/features/energy/types/energyHistory.types'

export type ActivityDayEntry = {
  date: string // "2026-05-21"
  totalKwh: number
  totalEmissions: number
  devices: {
    deviceId: string
    name: string
    watt: number
    totalKwh: number
    durationMinutes: number
    sessions: { startedAt: number; endedAt: number }[]
  }[]
}

function toActivityEntries(history: DailyEnergyUsage[]): ActivityDayEntry[] {
  return [...history]
    .sort((a, b) => b.date.localeCompare(a.date)) // newest first
    .map((day) => ({
      date: day.date,
      totalKwh: day.totalKwh,
      totalEmissions: day.totalEmissions,
      devices: Object.entries(day.devices).map(([deviceId, record]) => ({
        deviceId,
        name: record.name,
        watt: record.watt,
        totalKwh: record.kwh,
        durationMinutes: record.durationMinutes,
        sessions: record.sessions ?? [],
      })),
    }))
}

type State = {
  entries: ActivityDayEntry[]
  isLoading: boolean
  error: string | null
}

export function useActivityHistory(): State {
  const user = useAuthStore((s) => s.user)
  const isAuthLoading = useAuthStore((s) => s.isLoading)
  const [entries, setEntries] = useState<ActivityDayEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadedCountRef = useRef(0)

  useEffect(() => {
    if (isAuthLoading) return
    if (!user?.uid) {
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)
    loadedCountRef.current = 0

    const unsubscribe = energyHistoryService.listenHistory(user.uid, 30, (data) => {
      setEntries(toActivityEntries(data))
      setIsLoading(false)
    })

    return () => unsubscribe()
  }, [user?.uid, isAuthLoading])

  return { entries, isLoading, error }
}
