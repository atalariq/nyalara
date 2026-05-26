export type EnergyInsightSuggestion = {
  title: string
  description: string
  estimatedImpactKgCo2e: number
}

export type EnergyInsight = {
  insightId: string
  title: string
  summary: string
  suggestions: EnergyInsightSuggestion[]
  isStale: boolean
}

export type EnergyInsightModel = {
  provider: string
  name: string
  promptVersion: string
}

export type GenerateEnergyInsightParams = {
  userId: string
  month: string
  force: boolean
}

export type MonthlySummaryContext = {
  month: string
  totalKwh: number
  totalKgCo2e: number
  averageKwhPerDay: number
  averageKgCo2ePerDay: number
  usageCount: number
}

export type UserPreferencesContext = {
  monthlyEmissionTargetKgCo2e?: number
}

export type GenerateEnergyInsightContext = {
  period: {
    startDate: string
    endDate: string
    month: string
  }
  monthlySummary: MonthlySummaryContext
  previousMonthSummary: MonthlySummaryContext | null
  preferences: UserPreferencesContext | null
  usageIds: string[]
}

export type GeneratedEnergyInsight = {
  insight: Omit<EnergyInsight, 'insightId'>
  model: EnergyInsightModel
}

export type EnergyInsightGenerator = {
  generate(context: GenerateEnergyInsightContext): Promise<GeneratedEnergyInsight>
}

export type EnergyInsightService = {
  generateMonthlyInsight(
    params: GenerateEnergyInsightParams
  ): Promise<EnergyInsight>
}
