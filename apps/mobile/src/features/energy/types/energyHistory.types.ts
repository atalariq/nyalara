// features/energy/types/energyHistory.types.ts

export type DeviceUsageSession = {
  startedAt: number // Unix ms
  endedAt: number // Unix ms
}

export type DeviceEnergyRecord = {
  name: string
  watt: number
  durationMinutes: number
  kwh: number
  sessions: DeviceUsageSession[]
}

export type DailyEnergyUsage = {
  id: string
  userId: string
  date: string
  totalKwh: number
  totalEmissions: number
  totalCost: number
  devices: Record<string, DeviceEnergyRecord>
}
