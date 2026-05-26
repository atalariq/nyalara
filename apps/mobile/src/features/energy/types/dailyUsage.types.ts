// features/devices/types/dailyUsage.types.ts

export type DeviceSession = {
  startedAt: number // Unix ms
  endedAt: number // Unix ms
}

export type DeviceDailyRecord = {
  name: string
  watt: number
  durationMinutes: number
  kwh: number
  sessions: DeviceSession[]
}

export type DailyUsage = {
  id: string
  userId: string
  date: string
  totalKwh: number
  totalEmissions: number
  totalCost: number
  devices: Record<string, DeviceDailyRecord>
}
