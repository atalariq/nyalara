import type { ApiResponse, EnergyInsightDto } from '@nyalara/shared'
import { protectedApiClient } from '@/shared/api/app-protected-api-client'
import type { DashboardStats } from '../types/dashboard.types'

type BackendInsightResponse = {
  recommendations: string[]
  dailyTip: string
  environmentalQuote: string
}

function getCurrentMonth() {
  return new Date().toISOString().slice(0, 7)
}

function buildEnvironmentalQuote(totalImpactKgCo2e: number) {
  const trees = Math.max(1, Math.round(totalImpactKgCo2e / 21))
  return `Potential monthly impact equals about ${trees} trees.`
}

export async function fetchAIInsight(
  _stats: DashboardStats,
  _deviceSummary: string,
  co2ReducedKg: number,
): Promise<BackendInsightResponse> {
  const response = await protectedApiClient.post<{ month: string }, ApiResponse<EnergyInsightDto>>(
    '/v1/generate-energy-insight',
    {
      month: getCurrentMonth(),
    },
  )

  if (!response.success) {
    throw new Error(response.error.message)
  }

  return {
    recommendations: response.data.suggestions.map((item) => item.title),
    dailyTip: response.data.summary,
    environmentalQuote: buildEnvironmentalQuote(co2ReducedKg),
  }
}
