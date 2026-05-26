export type DashboardStats = {
  dailyKwh: number
  monthlyKwh: number
  dailyCo2Kg: number
  monthlyCo2Kg: number
  dailyCostIdr: number
  monthlyCostIdr: number
  progress: number
  remaining: number
  isLoading: boolean
  savedKwh: number
  co2ReducedKg: number
}

export type AIInsight = {
  recommendations: string[]
  dailyTip: string
  environmentalQuote: string // ← tambah
  status: 'idle' | 'loading' | 'success' | 'error'
}
