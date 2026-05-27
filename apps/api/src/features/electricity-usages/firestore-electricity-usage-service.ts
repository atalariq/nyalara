import type {
  CurrentStreakDto,
  ElectricityUsageDto,
  ElectricityUsageListItemDto,
  MonthlySummaryDto
} from '@nyalara/shared'
import { FieldValue, type Firestore } from 'firebase-admin/firestore'

import { AppError } from '../platform/http/errors.js'
import type {
  CreateElectricityUsageParams,
  CreateElectricityUsageResult,
  DeleteElectricityUsageParams,
  DeleteElectricityUsageResult,
  ElectricityUsageService,
  GetMonthlySummaryParams,
  MonthlySummaryWithCurrentStreak,
  RecalculateMonthlySummaryParams,
  UpdateElectricityUsageParams,
  UpdateElectricityUsageResult
} from './electricity-usage-service.js'

export function createFirestoreElectricityUsageService(
  firestore: Firestore
): ElectricityUsageService {
  return {
    async createUsage(params) {
      const usageRef = getUsageRef(firestore, params.userId, params.usageId)

      await usageRef.set(toFirestoreUsage(params.usage))
      await updateDevicePresetsFromUsage(firestore, params.userId, params.usage)
      const monthlySummary = await recalculateMonthlySummaryFromMonth(firestore, {
        userId: params.userId,
        month: params.usage.period.month
      })
      const currentStreak = await calculateCurrentStreak(firestore, params.userId)

      await markInsightStaleIfPresent(
        firestore,
        params.userId,
        params.usage.period.month
      )

      return {
        usageId: params.usageId,
        usage: params.usage,
        monthlySummary,
        currentStreak
      }
    },
    async updateUsage(params) {
      const usageRef = getUsageRef(firestore, params.userId, params.usageId)
      const existing = await usageRef.get()
      const existingData = existing.data()

      if (!existing.exists || !existingData) {
        return null
      }

      const previousUsage = toElectricityUsageRecord(existingData)
      await usageRef.set(toFirestoreUsage(params.usage))
      await updateDevicePresetsFromUsage(firestore, params.userId, params.usage)

      if (previousUsage.period.month !== params.usage.period.month) {
        await recalculateMonthlySummaryFromMonth(firestore, {
          userId: params.userId,
          month: previousUsage.period.month
        })
      }

      const monthlySummary = await recalculateMonthlySummaryFromMonth(firestore, {
        userId: params.userId,
        month: params.usage.period.month
      })
      const currentStreak = await calculateCurrentStreak(firestore, params.userId)

      await Promise.all([
        markInsightStaleIfPresent(
          firestore,
          params.userId,
          previousUsage.period.month
        ),
        markInsightStaleIfPresent(
          firestore,
          params.userId,
          params.usage.period.month
        )
      ])

      return {
        usageId: params.usageId,
        usage: params.usage,
        monthlySummary,
        currentStreak
      }
    },
    async deleteUsage(params) {
      const usageRef = getUsageRef(firestore, params.userId, params.usageId)
      const existing = await usageRef.get()
      const existingData = existing.data()

      if (!existing.exists || !existingData) {
        return null
      }

      const usage = toElectricityUsageRecord(existingData)
      await usageRef.delete()

      const monthlySummary = await recalculateMonthlySummaryFromMonth(firestore, {
        userId: params.userId,
        month: usage.period.month
      })
      const currentStreak = await calculateCurrentStreak(firestore, params.userId)

      await markInsightStaleIfPresent(
        firestore,
        params.userId,
        usage.period.month
      )

      return {
        usageId: params.usageId,
        monthlySummary,
        currentStreak
      }
    },
    async getMonthlySummary(params) {
      return readMonthlySummary(firestore, params)
    },
    async listUsages(params) {
      return listUsages(firestore, params)
    },
    async recalculateMonthlySummary(params) {
      const monthlySummary = await recalculateMonthlySummaryFromMonth(
        firestore,
        params
      )
      const currentStreak = await calculateCurrentStreak(firestore, params.userId)

      return {
        monthlySummary,
        currentStreak
      }
    }
  }
}

function getUsageRef(firestore: Firestore, userId: string, usageId: string) {
  return firestore
    .collection('users')
    .doc(userId)
    .collection('electricity_usages')
    .doc(usageId)
}

function toFirestoreUsage(usage: ElectricityUsageDto) {
  return {
    ...usage,
    timestamps: {
      ...usage.timestamps,
      createdAtServer: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      syncedAt: FieldValue.serverTimestamp()
    }
  }
}

async function updateDevicePresetsFromUsage(
  firestore: Firestore,
  userId: string,
  usage: ElectricityUsageDto
) {
  if (usage.inputType !== 'device_breakdown') {
    return
  }

  await Promise.all(
    usage.input.deviceBreakdown.map(async (item) => {
      await firestore
        .collection('users')
        .doc(userId)
        .collection('devices')
        .doc(item.deviceId)
        .set(
          {
            defaultDurationMinutes: item.durationMinutes,
            updatedAt: FieldValue.serverTimestamp()
          },
          { merge: true }
        )
    })
  )
}

async function markInsightStaleIfPresent(
  firestore: Firestore,
  userId: string,
  month: string
) {
  const insightRef = firestore
    .collection('users')
    .doc(userId)
    .collection('insights')
    .doc(month)
  const snapshot = await insightRef.get()

  if (!snapshot.exists) {
    return
  }

  await insightRef.set(
    {
      isStale: true,
      updatedAt: FieldValue.serverTimestamp()
    },
    { merge: true }
  )
}

async function recalculateMonthlySummaryFromMonth(
  firestore: Firestore,
  params: RecalculateMonthlySummaryParams
): Promise<MonthlySummaryDto> {
  const monthSnapshot = await firestore
    .collection('users')
    .doc(params.userId)
    .collection('electricity_usages')
    .where('period.month', '==', params.month)
    .get()

  const usages = monthSnapshot.docs.map((doc) => {
    const data = doc.data()
    return {
      electricityKwh: data.calculation.electricityKwh as number,
      totalKgCo2e: data.calculation.totalKgCo2e as number
    }
  })

  const totalKwh = usages.reduce((sum, usage) => sum + usage.electricityKwh, 0)
  const totalKgCo2e = usages.reduce((sum, usage) => sum + usage.totalKgCo2e, 0)
  const daysInMonth = getDaysInMonth(params.month)

  const monthlySummary: MonthlySummaryDto = {
    month: params.month,
    totalKwh,
    totalKgCo2e,
    averageKwhPerDay: usages.length === 0 ? 0 : totalKwh / daysInMonth,
    averageKgCo2ePerDay: usages.length === 0 ? 0 : totalKgCo2e / daysInMonth,
    usageCount: usages.length
  }

  await firestore
    .collection('users')
    .doc(params.userId)
    .collection('monthly_summaries')
    .doc(params.month)
    .set({
      ...monthlySummary,
      updatedAt: FieldValue.serverTimestamp()
    })

  return monthlySummary
}

function getDaysInMonth(month: string) {
  const [year, monthIndex] = month.split('-').map(Number)

  return new Date(Date.UTC(year, monthIndex, 0)).getUTCDate()
}

async function readMonthlySummary(
  firestore: Firestore,
  params: GetMonthlySummaryParams
): Promise<MonthlySummaryWithCurrentStreak | null> {
  const snapshot = await firestore
    .collection('users')
    .doc(params.userId)
    .collection('monthly_summaries')
    .doc(params.month)
    .get()

  if (!snapshot.exists) {
    return null
  }

  const data = snapshot.data()

  if (!data) {
    return null
  }

  return {
    monthlySummary: {
      month: data.month as string,
      totalKwh: data.totalKwh as number,
      totalKgCo2e: data.totalKgCo2e as number,
      averageKwhPerDay: data.averageKwhPerDay as number,
      averageKgCo2ePerDay: data.averageKgCo2ePerDay as number,
      usageCount: data.usageCount as number
    },
    currentStreak: await calculateCurrentStreak(firestore, params.userId)
  }
}

async function listUsages(
  firestore: Firestore,
  params: GetMonthlySummaryParams
): Promise<ElectricityUsageListItemDto[]> {
  const snapshot = await firestore
    .collection('users')
    .doc(params.userId)
    .collection('electricity_usages')
    .where('period.month', '==', params.month)
    .get()

  return snapshot.docs
    .map((doc) => ({
      usageId: doc.id,
      usage: toElectricityUsageRecord(doc.data())
    }))
    .sort((left, right) => {
      const dateDifference = right.usage.timestamps.usageDate.localeCompare(
        left.usage.timestamps.usageDate
      )

      return (
        dateDifference ||
        right.usage.timestamps.createdAtClient.localeCompare(
          left.usage.timestamps.createdAtClient
        )
      )
    })
}

function toElectricityUsageRecord(
  data: FirebaseFirestore.DocumentData
): ElectricityUsageDto {
  return {
    inputType: data.inputType as ElectricityUsageDto['inputType'],
    input: data.input,
    period: data.period,
    calculation: data.calculation,
    source: data.source,
    timestamps: {
      usageDate: data.timestamps.usageDate as string,
      createdAtClient: data.timestamps.createdAtClient as string
    }
  } as ElectricityUsageDto
}

async function calculateCurrentStreak(
  firestore: Firestore,
  userId: string
): Promise<CurrentStreakDto> {
  const snapshot = await firestore
    .collection('users')
    .doc(userId)
    .collection('electricity_usages')
    .get()

  const distinctDates = [...new Set(
    snapshot.docs
      .map((doc) => doc.data().timestamps?.usageDate as string | undefined)
      .filter((value): value is string => Boolean(value))
  )].sort((left, right) => right.localeCompare(left))

  if (distinctDates.length === 0) {
    return {
      length: 0,
      lastTrackedDate: null
    }
  }

  let streakLength = 1

  for (let index = 1; index < distinctDates.length; index += 1) {
    const previousDate = distinctDates[index - 1]
    const currentDate = distinctDates[index]

    if (getDayDifference(previousDate, currentDate) !== 1) {
      break
    }

    streakLength += 1
  }

  return {
    length: streakLength,
    lastTrackedDate: distinctDates[0]
  }
}

function getDayDifference(laterDate: string, earlierDate: string) {
  const later = new Date(`${laterDate}T00:00:00.000Z`)
  const earlier = new Date(`${earlierDate}T00:00:00.000Z`)

  return Math.round((later.getTime() - earlier.getTime()) / 86_400_000)
}
