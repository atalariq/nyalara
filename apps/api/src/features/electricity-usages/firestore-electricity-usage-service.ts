import { FieldValue, type Firestore } from 'firebase-admin/firestore'

import type {
  CreateElectricityUsageParams,
  CreateElectricityUsageResult,
  ElectricityUsageListItem,
  ElectricityUsageService,
  GetMonthlySummaryParams,
  RecalculateMonthlySummaryParams,
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
    },
    async listUsages(params) {
      return listUsages(firestore, params)
    },
    async recalculateMonthlySummary(params) {
      return recalculateMonthlySummaryFromMonth(firestore, params)
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
  return recalculateMonthlySummaryFromMonth(firestore, {
    userId: params.userId,
    month: params.usage.period.month
  })
}

async function recalculateMonthlySummaryFromMonth(
  firestore: Firestore,
  params: RecalculateMonthlySummaryParams
): Promise<MonthlySummary> {
  const usageCollection = firestore
    .collection('users')
    .doc(params.userId)
    .collection('electricity_usages')

  const monthSnapshot = await usageCollection.where('period.month', '==', params.month).get()

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
  const daysInMonth = getDaysInMonth(params.month)

  const monthlySummary: MonthlySummary = {
    month: params.month,
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

async function listUsages(
  firestore: Firestore,
  params: GetMonthlySummaryParams
): Promise<ElectricityUsageListItem[]> {
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
    .sort((left, right) =>
      right.usage.timestamps.usageDate.localeCompare(left.usage.timestamps.usageDate)
    )
}

function toElectricityUsageRecord(data: FirebaseFirestore.DocumentData) {
  return {
    inputType: data.inputType as 'kwh' | 'meter_reading',
    input: data.input,
    period: data.period,
    calculation: data.calculation,
    source: data.source,
    timestamps: {
      usageDate: data.timestamps.usageDate as string,
      createdAtClient: data.timestamps.createdAtClient as string
    }
  }
}
