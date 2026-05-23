import { FieldValue, type Firestore } from 'firebase-admin/firestore'

import type {
  CreateElectricityUsageParams,
  CreateElectricityUsageResult,
  ElectricityUsageService,
  GetMonthlySummaryParams,
  MonthlySummary
} from './electricity-usage-service.js'

export function createFirestoreElectricityUsageService(
  firestore: Firestore
): ElectricityUsageService {
  return {
    async createUsage(params) {
      const usageRef = firestore
        .collection('users')
        .doc(params.userId)
        .collection('electricity_usages')
        .doc(params.usageId)

      await usageRef.set(toFirestoreUsage(params))

      const monthlySummary = await recalculateMonthlySummary(firestore, params)

      return {
        usageId: params.usageId,
        usage: params.usage,
        monthlySummary
      }
    },
    async getMonthlySummary(params) {
      return readMonthlySummary(firestore, params)
    }
  }
}

function toFirestoreUsage({ usage }: CreateElectricityUsageParams) {
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

async function recalculateMonthlySummary(
  firestore: Firestore,
  params: CreateElectricityUsageParams
): Promise<MonthlySummary> {
  const usageCollection = firestore
    .collection('users')
    .doc(params.userId)
    .collection('electricity_usages')

  const monthSnapshot = await usageCollection
    .where('period.month', '==', params.usage.period.month)
    .get()

  const usages = monthSnapshot.docs.map((doc) => {
    const data = doc.data()
    return {
      electricityKwh: data.calculation.electricityKwh as number,
      totalKgCo2e: data.calculation.totalKgCo2e as number
    }
  })

  const totalKwh = usages.reduce((sum, usage) => sum + usage.electricityKwh, 0)
  const totalKgCo2e = usages.reduce(
    (sum, usage) => sum + usage.totalKgCo2e,
    0
  )
  const daysInMonth = getDaysInMonth(params.usage.period.month)

  const monthlySummary: MonthlySummary = {
    month: params.usage.period.month,
    totalKwh,
    totalKgCo2e,
    averageKwhPerDay: totalKwh / daysInMonth,
    averageKgCo2ePerDay: totalKgCo2e / daysInMonth,
    usageCount: usages.length
  }

  await firestore
    .collection('users')
    .doc(params.userId)
    .collection('monthly_summaries')
    .doc(params.usage.period.month)
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
): Promise<MonthlySummary | null> {
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
    month: data.month as string,
    totalKwh: data.totalKwh as number,
    totalKgCo2e: data.totalKgCo2e as number,
    averageKwhPerDay: data.averageKwhPerDay as number,
    averageKgCo2ePerDay: data.averageKgCo2ePerDay as number,
    usageCount: data.usageCount as number
  }
}
