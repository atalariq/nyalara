// features/activity/types/index.ts

export type ActivityStatus = 'active' | 'completed' | 'low_power' | 'idle'

export type DeviceActivity = {
  id: string
  deviceName: string
  deviceId: string
  startTime: string // "2:00 PM"
  endTime: string // "4:15 PM"
  durationMinutes: number
  kWh: number
  status: ActivityStatus
}

export type ActivitySummary = {
  date: string // "2025-05-25"
  totalKWh: number
  efficiencyPercent: number // negative = lower than avg
  activities: DeviceActivity[]
}
