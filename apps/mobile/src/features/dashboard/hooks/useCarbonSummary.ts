import type { Device } from '@/features/devices/types/device.types'
import { useMemo } from 'react'
import type { DailyUsage } from '@/features/energy/types/dailyUsage.types'
import { calculateCarbonSummary } from '../lib/dashboard-metrics'

export function useCarbonSummary(history: DailyUsage[], devices: Device[]) {
  return useMemo(() => {
    return calculateCarbonSummary(history, devices)
  }, [history, devices])
}
