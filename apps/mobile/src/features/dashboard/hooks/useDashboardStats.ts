import type { Device } from '@/features/devices/types/device.types'
import type { DailyUsage } from '@/features/energy/types/dailyUsage.types'
import { useMemo } from 'react'
import {
  calculateDashboardStats,
  type DashboardStatsInput,
} from '../lib/dashboard-metrics'

type UseDashboardStatsInput = {
  today: DailyUsage | null
  devices: Device[]
  isLoading: boolean
}

export function useDashboardStats({
  today,
  devices,
  isLoading,
}: UseDashboardStatsInput) {
  return useMemo(
    () =>
      calculateDashboardStats({
        today,
        devices,
        isLoading,
      } satisfies DashboardStatsInput),
    [today, devices, isLoading],
  )
}
