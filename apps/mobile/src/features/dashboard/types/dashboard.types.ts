// features/dashboard/types/dashboard.types.ts

export type DashboardStats = {
  dailyKwh: number
  monthlyKwh: number
  dailyCo2Kg: number // kg CO₂
  monthlyCo2Kg: number
  dailyCostIdr: number // IDR
  monthlyCostIdr: number
  progress: number // 0–1 vs daily goal
  remaining: number // kWh remaining to goal
  isLoading: boolean
  savedKwh: number // ← tambah
  co2ReducedKg: number
}

export type AIInsight = {
  recommendations: string[]
  dailyTip: string
  status: 'idle' | 'loading' | 'success' | 'error'
}
