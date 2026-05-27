import type {
  CreateElectricityUsageRequest,
  ElectricityUsageListItemDto,
  ListElectricityUsagesResponse,
} from '@nyalara/shared'

import type { ProtectedApiClient } from '../../../shared/api/protected-api-client'
import type { DailyEnergyUsage } from '../types/energyHistory.types'

type EnergyHistoryReader = {
  getByDate(userId: string, date: Date): Promise<DailyEnergyUsage | null>
  getHistory(userId: string, days?: number, now?: Date): Promise<DailyEnergyUsage[]>
  listenToday(userId: string, onData: (data: DailyEnergyUsage | null) => void): () => void
  listenHistory(
    userId: string,
    days: number,
    onData: (data: DailyEnergyUsage[]) => void,
  ): () => void
  accumulateDeviceUsage(
    userId: string,
    date: Date,
    deviceId: string,
    record: { name: string; watt: number; durationMinutes: number; kwh: number },
  ): Promise<void>
}

export function createEnergyHistoryService({
  client,
  electricityRate,
  pollIntervalMs = 15_000,
  now = () => new Date(),
  createClientGeneratedId = (deviceId: string) =>
    `${deviceId}-${Math.random().toString(36).slice(2, 10)}`,
}: {
  client: ProtectedApiClient
  electricityRate: number
  pollIntervalMs?: number
  now?: () => Date
  createClientGeneratedId?: (deviceId: string, date: Date) => string
}): EnergyHistoryReader {
  const getByDate = async (userId: string, date: Date): Promise<DailyEnergyUsage | null> => {
    const history = await buildHistoryForRange(client, userId, date, date, electricityRate)
    return history[0] ?? null
  }

  const getHistory = async (
    userId: string,
    days: number = 30,
    now: Date = new Date(),
  ): Promise<DailyEnergyUsage[]> => {
    const end = new Date(now)
    const start = new Date(now)
    start.setDate(start.getDate() - (days - 1))
    return buildHistoryForRange(client, userId, start, end, electricityRate)
  }

  return {
    getByDate,
    getHistory,

    listenToday(userId: string, onData: (data: DailyEnergyUsage | null) => void): () => void {
      let cancelled = false

      const emit = async () => {
        try {
          const data = await getByDate(userId, new Date())
          if (!cancelled) {
            onData(data)
          }
        } catch {
          if (!cancelled) {
            onData(null)
          }
        }
      }

      void emit()
      const interval = setInterval(() => {
        void emit()
      }, pollIntervalMs)

      return () => {
        cancelled = true
        clearInterval(interval)
      }
    },

    listenHistory(
      userId: string,
      days: number,
      onData: (data: DailyEnergyUsage[]) => void,
    ): () => void {
      let cancelled = false

      const emit = async () => {
        try {
          const data = await getHistory(userId, days)
          if (!cancelled) {
            onData(data)
          }
        } catch {
          if (!cancelled) {
            onData([])
          }
        }
      }

      void emit()
      const interval = setInterval(() => {
        void emit()
      }, pollIntervalMs)

      return () => {
        cancelled = true
        clearInterval(interval)
      }
    },

    async accumulateDeviceUsage(userId, date, deviceId, record) {
      const usageDate = toDateString(date)
      const body: CreateElectricityUsageRequest = {
        clientGeneratedId: createClientGeneratedId(deviceId, date),
        inputType: 'device_breakdown',
        input: {
          unit: 'minutes',
          deviceBreakdown: [
            {
              deviceId,
              durationMinutes: record.durationMinutes,
            },
          ],
        },
        period: {
          startDate: usageDate,
          endDate: usageDate,
          month: usageDate.slice(0, 7),
        },
        source: {
          createdFrom: 'mobile',
          offlineCreated: false,
        },
        timestamps: {
          usageDate,
          createdAtClient: now().toISOString(),
        },
      }

      await client.post('/v1/electricity-usages', body)
    },
  }
}

async function buildHistoryForRange(
  client: ProtectedApiClient,
  userId: string,
  start: Date,
  end: Date,
  electricityRate: number,
): Promise<DailyEnergyUsage[]> {
  const monthKeys = getMonthKeysBetween(start, end)
  const results = await Promise.all(
    monthKeys.map((month) =>
      client.get<ListElectricityUsagesResponse>('/v1/electricity-usages', { month }),
    ),
  )

  const grouped = new Map<string, DailyEnergyUsage>()

  for (const result of results) {
    for (const item of result.data) {
      const usageDate = item.usage.timestamps.usageDate

      if (usageDate < toDateString(start) || usageDate > toDateString(end)) {
        continue
      }

      const existing = grouped.get(usageDate) ?? createEmptyDailyEnergyUsage(userId, usageDate)
      grouped.set(usageDate, mergeUsageIntoDay(existing, item, electricityRate))
    }
  }

  return [...grouped.values()].sort((left, right) => left.date.localeCompare(right.date))
}

function createEmptyDailyEnergyUsage(userId: string, date: string): DailyEnergyUsage {
  return {
    id: `${userId}_${date}`,
    userId,
    date,
    totalKwh: 0,
    totalEmissions: 0,
    totalCost: 0,
    devices: {},
  }
}

function mergeUsageIntoDay(
  day: DailyEnergyUsage,
  item: ElectricityUsageListItemDto,
  electricityRate: number,
): DailyEnergyUsage {
  const totalKwh = day.totalKwh + item.usage.calculation.electricityKwh
  const totalEmissions = day.totalEmissions + item.usage.calculation.totalKgCo2e
  const totalCost = day.totalCost + item.usage.calculation.electricityKwh * electricityRate
  const devices = { ...day.devices }

  if (item.usage.inputType === 'device_breakdown') {
    for (const device of item.usage.input.deviceBreakdown) {
      const existing = devices[device.deviceId] ?? {
        name: device.name,
        watt: device.watt,
        durationMinutes: 0,
        kwh: 0,
        sessions: [],
      }

      devices[device.deviceId] = {
        ...existing,
        durationMinutes: existing.durationMinutes + device.durationMinutes,
        kwh: existing.kwh + device.electricityKwh,
        sessions: existing.sessions,
      }
    }
  }

  return {
    ...day,
    totalKwh,
    totalEmissions,
    totalCost,
    devices,
  }
}

function getMonthKeysBetween(start: Date, end: Date): string[] {
  const cursor = new Date(Date.UTC(start.getFullYear(), start.getMonth(), 1))
  const endCursor = new Date(Date.UTC(end.getFullYear(), end.getMonth(), 1))
  const months: string[] = []

  while (cursor <= endCursor) {
    months.push(`${cursor.getUTCFullYear()}-${String(cursor.getUTCMonth() + 1).padStart(2, '0')}`)
    cursor.setUTCMonth(cursor.getUTCMonth() + 1)
  }

  return months
}

function toDateString(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}
