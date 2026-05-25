import AsyncStorage from '@react-native-async-storage/async-storage'
import * as Crypto from 'expo-crypto'
import type {
  ApiResponse,
  CreateElectricityUsageRequest,
  ElectricityUsageDto,
} from '@carbon-tracker/shared'
import { CARBON_CONFIG } from '@/shared/config/carbonConfig'
import { protectedApiClient } from '@/shared/api/app-protected-api-client'
import { createDraftQueueFlusher } from './draft-queue-flusher'
import type { DailyUsage, DeviceDailyRecord } from '../types/dailyUsage.types'

const POLL_INTERVAL_MS = 15_000
const DRAFT_QUEUE_KEY_PREFIX = 'daily-usage-drafts'

type PendingUsageDraft = CreateElectricityUsageRequest
type DraftQueueStorage = Pick<typeof AsyncStorage, 'getItem' | 'setItem'>
type UsageApiClient = Pick<typeof protectedApiClient, 'get' | 'post'>
type DailyUsageServiceDependencies = {
  storage?: DraftQueueStorage
  client?: UsageApiClient
  createClientGeneratedId?: () => string
}

function toDateString(date: Date): string {
  return date.toISOString().split('T')[0]
}

function docId(userId: string, date: string): string {
  return `${userId}_${date}`
}

function toMonthString(date: Date): string {
  return date.toISOString().slice(0, 7)
}

function parseMonth(month: string) {
  const [year, monthIndex] = month.split('-').map(Number)
  return { year, monthIndex }
}

function buildPeriod(date: Date) {
  const month = toMonthString(date)
  const { year, monthIndex } = parseMonth(month)
  const daysInMonth = new Date(Date.UTC(year, monthIndex, 0)).getUTCDate()

  return {
    startDate: `${month}-01`,
    endDate: `${month}-${String(daysInMonth).padStart(2, '0')}`,
    month,
  }
}

function getMonthSequence(startDate: Date, endDate: Date) {
  const months: string[] = []
  const cursor = new Date(
    Date.UTC(
      startDate.getUTCFullYear(),
      startDate.getUTCMonth(),
      1,
      0,
      0,
      0,
      0,
    ),
  )
  const end = new Date(
    Date.UTC(endDate.getUTCFullYear(), endDate.getUTCMonth(), 1, 0, 0, 0, 0),
  )

  while (cursor <= end) {
    months.push(
      `${cursor.getUTCFullYear()}-${String(cursor.getUTCMonth() + 1).padStart(2, '0')}`,
    )
    cursor.setUTCMonth(cursor.getUTCMonth() + 1)
  }

  return months
}

function aggregateUsages(userId: string, usages: ElectricityUsageDto[]): DailyUsage[] {
  const byDate = new Map<string, DailyUsage>()

  usages.forEach((usage) => {
    const date = usage.timestamps.usageDate
    const existing =
      byDate.get(date) ??
      ({
        id: docId(userId, date),
        userId,
        date,
        totalKwh: 0,
        totalEmissions: 0,
        totalCost: 0,
        devices: {},
      } satisfies DailyUsage)

    existing.totalKwh += usage.calculation.electricityKwh
    existing.totalEmissions += usage.calculation.totalKgCo2e
    existing.totalCost +=
      usage.calculation.electricityKwh * CARBON_CONFIG.electricityRate

    if (usage.inputType === 'device_breakdown') {
      usage.input.deviceBreakdown.forEach((item) => {
        const previous = existing.devices[item.deviceId]
        const merged: DeviceDailyRecord = {
          name: item.name,
          watt: item.watt,
          durationMinutes:
            (previous?.durationMinutes ?? 0) + item.durationMinutes,
          kwh: (previous?.kwh ?? 0) + item.electricityKwh,
        }

        existing.devices[item.deviceId] = merged
      })
    }

    byDate.set(date, existing)
  })

  return [...byDate.values()].sort((left, right) => left.date.localeCompare(right.date))
}

function getDraftQueueKey(userId: string) {
  return `${DRAFT_QUEUE_KEY_PREFIX}:${userId}`
}

function createUsageDraft(
  date: Date,
  deviceId: string,
  durationMinutes: number,
  offlineCreated: boolean,
  createClientGeneratedId: () => string,
): CreateElectricityUsageRequest {
  return {
    clientGeneratedId: createClientGeneratedId(),
    inputType: 'device_breakdown',
    input: {
      deviceBreakdown: [
        {
          deviceId,
          durationMinutes,
        },
      ],
      unit: 'minutes',
    },
    period: buildPeriod(date),
    source: {
      createdFrom: 'mobile',
      offlineCreated,
    },
    timestamps: {
      usageDate: toDateString(date),
      createdAtClient: new Date().toISOString(),
    },
  }
}

export function createDailyUsageService({
  storage = AsyncStorage,
  client = protectedApiClient,
  createClientGeneratedId = () => Crypto.randomUUID(),
}: DailyUsageServiceDependencies = {}) {
  async function listUsagesForMonth(month: string): Promise<ElectricityUsageDto[]> {
    const response = await client.get<
      ApiResponse<{ usageId: string; usage: ElectricityUsageDto }[]>
    >('/v1/electricity-usages', { month })

    if (!response.success) {
      throw new Error(response.error.message)
    }

    return response.data.map((item) => item.usage)
  }

  async function readDraftQueue(userId: string): Promise<PendingUsageDraft[]> {
    const raw = await storage.getItem(getDraftQueueKey(userId))

    if (!raw) {
      return []
    }

    try {
      const parsed = JSON.parse(raw) as PendingUsageDraft[]
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  }

  async function writeDraftQueue(userId: string, drafts: PendingUsageDraft[]) {
    await storage.setItem(getDraftQueueKey(userId), JSON.stringify(drafts))
  }

  async function enqueueDraft(userId: string, draft: PendingUsageDraft) {
    const existing = await readDraftQueue(userId)
    await writeDraftQueue(userId, [...existing, draft])
  }

  async function submitDraft(draft: PendingUsageDraft) {
    const response = await client.post<
      CreateElectricityUsageRequest,
      ApiResponse<unknown>
    >('/v1/electricity-usages', draft)

    if (!response.success) {
      throw new Error(response.error.message)
    }
  }

  const draftQueueFlusher = createDraftQueueFlusher({
    readDrafts: readDraftQueue,
    writeDrafts: writeDraftQueue,
    submitDraft,
  })

  async function getHistoryRange(userId: string, days: number) {
    await draftQueueFlusher.flush(userId)

    const endDate = new Date()
    const startDate = new Date(endDate)
    startDate.setUTCDate(startDate.getUTCDate() - Math.max(days - 1, 0))

    const months = getMonthSequence(startDate, endDate)
    const usages = await Promise.all(months.map((month) => listUsagesForMonth(month)))
    const history = aggregateUsages(userId, usages.flat())
    const startDateString = toDateString(startDate)

    return history.filter((item) => item.date >= startDateString)
  }

  return {
    async getByDate(userId: string, date: Date): Promise<DailyUsage | null> {
      const history = await getHistoryRange(userId, 62)
      const targetDate = toDateString(date)

      return history.find((item) => item.date === targetDate) ?? null
    },

    async getHistory(userId: string, days: number = 30): Promise<DailyUsage[]> {
      return getHistoryRange(userId, days)
    },

    listenToday(
      userId: string,
      onData: (data: DailyUsage | null) => void,
    ): () => void {
      let cancelled = false

      const emit = async () => {
        try {
          const today = await this.getByDate(userId, new Date())

          if (!cancelled) {
            onData(today)
          }
        } catch (error) {
          console.error('Failed to fetch today usage from backend', error)
        }
      }

      void emit()
      const interval = setInterval(() => {
        void emit()
      }, POLL_INTERVAL_MS)

      return () => {
        cancelled = true
        clearInterval(interval)
      }
    },

    listenHistory(
      userId: string,
      days: number,
      onData: (data: DailyUsage[]) => void,
    ): () => void {
      let cancelled = false

      const emit = async () => {
        try {
          const history = await this.getHistory(userId, days)

          if (!cancelled) {
            onData(history)
          }
        } catch (error) {
          console.error('Failed to fetch energy history from backend', error)
        }
      }

      void emit()
      const interval = setInterval(() => {
        void emit()
      }, POLL_INTERVAL_MS)

      return () => {
        cancelled = true
        clearInterval(interval)
      }
    },

    async accumulateDeviceUsage(
      userId: string,
      date: Date,
      deviceId: string,
      record: DeviceDailyRecord,
    ): Promise<void> {
      await draftQueueFlusher.flush(userId)

      const onlineDraft = createUsageDraft(
        date,
        deviceId,
        record.durationMinutes,
        false,
        createClientGeneratedId,
      )

      try {
        await submitDraft(onlineDraft)
      } catch (error) {
        const offlineDraft = {
          ...onlineDraft,
          source: {
            ...onlineDraft.source,
            offlineCreated: true,
          },
        } satisfies PendingUsageDraft

        await enqueueDraft(userId, offlineDraft)
        console.error('Queued electricity usage draft for later sync', error)
      }
    },
  }
}

export const dailyUsageService = createDailyUsageService()
