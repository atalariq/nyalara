import { FieldValue, type Firestore } from 'firebase-admin/firestore'

import { AppError } from '../platform/http/errors.js'
import type {
  EnergyInsight,
  EnergyInsightGenerator,
  EnergyInsightService,
  EnergyInsightSuggestion,
  GenerateEnergyInsightParams
} from './energy-insight-service.js'

type MonthlySummaryRecord = {
  month: string
  totalKwh: number
  totalKgCo2e: number
  averageKwhPerDay: number
  averageKgCo2ePerDay: number
  usageCount: number
}

type PreferencesRecord = {
  monthlyEmissionTargetKgCo2e?: number
}

type PersistedInsightRecord = {
  period: {
    startDate: string
    endDate: string
    month: string
  }
  title: string
  summary: string
  suggestions: EnergyInsightSuggestion[]
  isStale?: boolean
}

export function createFirestoreEnergyInsightService(
  firestore: Firestore,
  generator: EnergyInsightGenerator = createLocalEnergyInsightGenerator()
): EnergyInsightService {
  return {
    async generateMonthlyInsight(params) {
      const insightRef = firestore
        .collection('users')
        .doc(params.userId)
        .collection('insights')
        .doc(params.month)

      if (!params.force) {
        const existingInsight = await insightRef.get()

        if (existingInsight.exists) {
          const data = existingInsight.data()

          if (data) {
            return toEnergyInsight(params.month, data)
          }
        }
      }

      const monthlySummary = await readMonthlySummary(firestore, params)
      const preferences = await readPreferences(firestore, params.userId)
      const usageIds = await listUsageIds(firestore, params)
      const previousMonthSummary = await readPreviousMonthSummary(firestore, params)
      const generatedInsight = await generator.generate({
        period: buildPeriod(params.month),
        monthlySummary,
        previousMonthSummary,
        preferences,
        usageIds
      })
      const insight: EnergyInsight = {
        insightId: params.month,
        ...generatedInsight.insight
      }

      await insightRef.set({
        type: 'monthly_energy_advice',
        period: buildPeriod(params.month),
        title: insight.title,
        summary: insight.summary,
        suggestions: insight.suggestions,
        isStale: false,
        metrics: {
          totalKwh: monthlySummary.totalKwh,
          totalKgCo2e: monthlySummary.totalKgCo2e,
          comparedToPreviousPeriodPercent: calculateComparedToPreviousPeriodPercent(
            monthlySummary,
            previousMonthSummary
          ),
          projectedMonthlyKgCo2e: monthlySummary.totalKgCo2e
        },
        model: {
          provider: generatedInsight.model.provider,
          name: generatedInsight.model.name,
          promptVersion: generatedInsight.model.promptVersion
        },
        basedOnUsageIds: usageIds,
        createdAt: FieldValue.serverTimestamp()
      })

      return insight
    }
  }
}

async function readMonthlySummary(
  firestore: Firestore,
  params: GenerateEnergyInsightParams
): Promise<MonthlySummaryRecord> {
  const snapshot = await firestore
    .collection('users')
    .doc(params.userId)
    .collection('monthly_summaries')
    .doc(params.month)
    .get()

  const data = snapshot.data()

  if (!snapshot.exists || !data) {
    throw new AppError(
      404,
      'monthly_summary_not_found',
      'Monthly summary was not found for the requested month.'
    )
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

async function readPreferences(
  firestore: Firestore,
  userId: string
): Promise<PreferencesRecord | null> {
  const snapshot = await firestore
    .collection('users')
    .doc(userId)
    .collection('preferences')
    .doc('main')
    .get()

  if (!snapshot.exists) {
    return null
  }

  const data = snapshot.data()

  if (!data) {
    return null
  }

  return {
    monthlyEmissionTargetKgCo2e:
      data.monthlyEmissionTargetKgCo2e as number | undefined
  }
}

async function listUsageIds(
  firestore: Firestore,
  params: GenerateEnergyInsightParams
): Promise<string[]> {
  const snapshot = await firestore
    .collection('users')
    .doc(params.userId)
    .collection('electricity_usages')
    .where('period.month', '==', params.month)
    .get()

  return snapshot.docs.map((doc) => doc.id)
}

async function readPreviousMonthSummary(
  firestore: Firestore,
  params: GenerateEnergyInsightParams
): Promise<MonthlySummaryRecord | null> {
  const previousMonth = getPreviousMonth(params.month)
  const snapshot = await firestore
    .collection('users')
    .doc(params.userId)
    .collection('monthly_summaries')
    .doc(previousMonth)
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

function createLocalEnergyInsightGenerator(): EnergyInsightGenerator {
  return {
    async generate({ period, monthlySummary, preferences, previousMonthSummary }) {
      return {
        insight: buildInsight(
          period.month,
          monthlySummary,
          preferences,
          previousMonthSummary
        ),
        model: {
          provider: 'local',
          name: 'rule_based',
          promptVersion: 'energy-insight-v1'
        }
      }
    }
  }
}

function buildInsight(
  month: string,
  monthlySummary: MonthlySummaryRecord,
  preferences: PreferencesRecord | null,
  previousMonthSummary: MonthlySummaryRecord | null
): Omit<EnergyInsight, 'insightId'> {
  const targetKgCo2e = preferences?.monthlyEmissionTargetKgCo2e
  const comparedPercent = calculateComparedToPreviousPeriodPercent(
    monthlySummary,
    previousMonthSummary
  )
  const isOverTarget =
    targetKgCo2e !== undefined && monthlySummary.totalKgCo2e > targetKgCo2e

  if (isOverTarget) {
    return {
      isStale: false,
      title: 'Pemakaian listrik bulan ini melebihi target',
      summary: `Emisi listrik bulan ini mencapai ${formatNumber(monthlySummary.totalKgCo2e)} kg CO2e, melewati target ${formatNumber(targetKgCo2e)} kg CO2e.`,
      suggestions: [
        {
          title: 'Turunkan beban saat jam penggunaan puncak',
          description:
            'Prioritaskan pemakaian perangkat berdaya besar secara bergantian agar konsumsi harian lebih terkendali.',
          estimatedImpactKgCo2e: roundImpact(monthlySummary.totalKgCo2e * 0.08)
        },
        {
          title: 'Periksa perangkat yang standby terlalu lama',
          description:
            'Matikan AC, dispenser, atau charger saat tidak dipakai untuk menekan konsumsi yang tidak terlihat.',
          estimatedImpactKgCo2e: roundImpact(monthlySummary.totalKgCo2e * 0.05)
        }
      ]
    }
  }

  return {
    isStale: false,
    title: 'Pemakaian listrik bulan ini masih terkendali',
    summary:
      comparedPercent === null
        ? `Emisi listrik bulan ini tercatat ${formatNumber(monthlySummary.totalKgCo2e)} kg CO2e dengan ${formatNumber(monthlySummary.totalKwh)} kWh penggunaan.`
        : `Emisi listrik bulan ini ${formatComparedDirection(comparedPercent)} ${formatNumber(Math.abs(comparedPercent))}% dibanding bulan sebelumnya.`,
    suggestions: [
      {
        title: 'Pertahankan perangkat hemat energi',
        description:
          'Lanjutkan pola pemakaian perangkat efisien dan jadwalkan penggunaan alat berdaya besar seperlunya.',
        estimatedImpactKgCo2e: roundImpact(Math.max(monthlySummary.totalKgCo2e * 0.03, 1))
      },
      {
        title: 'Kurangi standby power',
        description:
          'Cabut charger dan perangkat elektronik yang tidak digunakan agar konsumsi dasar rumah tetap rendah.',
        estimatedImpactKgCo2e: roundImpact(Math.max(monthlySummary.totalKgCo2e * 0.02, 0.5))
      }
    ]
  }
}

function toEnergyInsight(
  insightId: string,
  data: FirebaseFirestore.DocumentData
): EnergyInsight {
  return {
    insightId,
    title: data.title as string,
    summary: data.summary as string,
    suggestions: (data.suggestions as EnergyInsightSuggestion[]) ?? [],
    isStale: (data.isStale as boolean) ?? false
  }
}

function buildPeriod(month: string) {
  const [year, monthIndex] = month.split('-').map(Number)
  const startDate = `${month}-01`
  const endDate = `${month}-${String(
    new Date(Date.UTC(year, monthIndex, 0)).getUTCDate()
  ).padStart(2, '0')}`

  return {
    startDate,
    endDate,
    month
  }
}

function calculateComparedToPreviousPeriodPercent(
  monthlySummary: MonthlySummaryRecord,
  previousMonthSummary: MonthlySummaryRecord | null
) {
  if (!previousMonthSummary || previousMonthSummary.totalKgCo2e === 0) {
    return null
  }

  return (
    ((monthlySummary.totalKgCo2e - previousMonthSummary.totalKgCo2e) /
      previousMonthSummary.totalKgCo2e) *
    100
  )
}

function getPreviousMonth(month: string) {
  const [year, monthIndex] = month.split('-').map(Number)
  const date = new Date(Date.UTC(year, monthIndex - 1, 1))

  date.setUTCMonth(date.getUTCMonth() - 1)

  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`
}

function formatComparedDirection(comparedPercent: number) {
  return comparedPercent <= 0 ? 'lebih rendah' : 'lebih tinggi'
}

function roundImpact(value: number) {
  return Math.round(value * 10) / 10
}

function formatNumber(value: number) {
  return Number.isInteger(value) ? `${value}` : value.toFixed(1)
}
