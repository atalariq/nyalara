import { CARBON_CONFIG } from '@/shared/config/carbonConfig'
import { protectedApiClient } from '@/shared/api/app-protected-api-client'
import type { DeviceEnergyRecord } from '../types/energyHistory.types'
import { createEnergyHistoryService } from './energy-history-service-core'

const energyHistoryReadService = createEnergyHistoryService({
  client: protectedApiClient,
  electricityRate: CARBON_CONFIG.electricityRate,
})

export const energyHistoryService = {
  getByDate: energyHistoryReadService.getByDate,
  getHistory: energyHistoryReadService.getHistory,
  listenToday: energyHistoryReadService.listenToday,
  listenHistory: energyHistoryReadService.listenHistory,
  accumulateDeviceUsage(
    userId: string,
    date: Date,
    deviceId: string,
    record: Omit<DeviceEnergyRecord, 'sessions'>,
  ): Promise<void> {
    return energyHistoryReadService.accumulateDeviceUsage(userId, date, deviceId, record)
  },
}
