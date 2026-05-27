import type { Device } from '@/features/devices/types/device.types'
import { useMemo } from 'react'
import type { DailyEnergyUsage } from '@/features/energy/types/energyHistory.types'
import { calculateCarbonSummary } from '../lib/dashboard-metrics'

export function useCarbonSummary(history: DailyEnergyUsage[], devices: Device[]) {
  return useMemo(() => {
    return calculateCarbonSummary(history, devices)
  }, [history, devices])
}
