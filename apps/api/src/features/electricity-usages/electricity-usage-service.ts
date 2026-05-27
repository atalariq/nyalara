import type {
  CurrentStreakDto,
  ElectricityUsageDto,
  ElectricityUsageListItemDto,
  MonthlySummaryDto
} from '@nyalara/shared'

export type ElectricityUsageRecord = ElectricityUsageDto
export type MonthlySummary = MonthlySummaryDto
export type CurrentStreak = CurrentStreakDto

export type MonthlySummaryWithCurrentStreak = {
  monthlySummary: MonthlySummary
  currentStreak: CurrentStreak
}

export type CreateElectricityUsageParams = {
  userId: string
  usageId: string
  usage: ElectricityUsageRecord
}

export type UpdateElectricityUsageParams = {
  userId: string
  usageId: string
  usage: ElectricityUsageRecord
}

export type DeleteElectricityUsageParams = {
  userId: string
  usageId: string
}

export type CreateElectricityUsageResult = {
  usageId: string
  usage: ElectricityUsageRecord
  monthlySummary: MonthlySummary
  currentStreak: CurrentStreak
}

export type UpdateElectricityUsageResult = CreateElectricityUsageResult

export type DeleteElectricityUsageResult = {
  usageId: string
  monthlySummary: MonthlySummary
  currentStreak: CurrentStreak
}

export type GetMonthlySummaryParams = {
  userId: string
  month: string
}

export type ListElectricityUsagesParams = {
  userId: string
  month: string
}

export type RecalculateMonthlySummaryParams = {
  userId: string
  month: string
}

export type ElectricityUsageService = {
  createUsage(
    params: CreateElectricityUsageParams
  ): Promise<CreateElectricityUsageResult>
  updateUsage?(
    params: UpdateElectricityUsageParams
  ): Promise<UpdateElectricityUsageResult | null>
  deleteUsage?(
    params: DeleteElectricityUsageParams
  ): Promise<DeleteElectricityUsageResult | null>
  getMonthlySummary(
    params: GetMonthlySummaryParams
  ): Promise<MonthlySummaryWithCurrentStreak | null>
  listUsages(
    params: ListElectricityUsagesParams
  ): Promise<ElectricityUsageListItemDto[]>
  recalculateMonthlySummary(
    params: RecalculateMonthlySummaryParams
  ): Promise<MonthlySummaryWithCurrentStreak>
}
