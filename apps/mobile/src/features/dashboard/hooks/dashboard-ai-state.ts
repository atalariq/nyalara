import type { AIInsight, DashboardStats } from '../types/dashboard.types'

export const IDLE_INSIGHT: AIInsight = {
  recommendations: [],
  dailyTip: '',
  environmentalQuote: '',
  status: 'idle',
}

export function getIdleInsightState(current: AIInsight): AIInsight {
  if (
    current.status === 'idle' &&
    current.recommendations.length === 0 &&
    current.dailyTip === '' &&
    current.environmentalQuote === ''
  ) {
    return current
  }

  return IDLE_INSIGHT
}

export function createDashboardStatsSnapshot(stats: DashboardStats): DashboardStats {
  return {
    dailyKwh: stats.dailyKwh,
    monthlyKwh: stats.monthlyKwh,
    dailyCo2Kg: stats.dailyCo2Kg,
    monthlyCo2Kg: stats.monthlyCo2Kg,
    dailyCostIdr: stats.dailyCostIdr,
    monthlyCostIdr: stats.monthlyCostIdr,
    progress: stats.progress,
    remaining: stats.remaining,
    isLoading: stats.isLoading,
    savedKwh: stats.savedKwh,
    co2ReducedKg: stats.co2ReducedKg,
  }
}
