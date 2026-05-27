export type ApiSuccess<T> = {
  success: true
  data: T
}

export type ApiError = {
  success: false
  error: {
    code: string
    message: string
  }
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError

export type IsoDateString = string
export type IsoDateTimeString = string
export type MonthString = string

export type ElectricityPeriod = {
  startDate: IsoDateString
  endDate: IsoDateString
  month: MonthString
}

export type CreateDeviceBreakdownItemRequest = {
  deviceId: string
  durationMinutes: number
}

export type DeviceCategory = 'electronics' | 'appliances' | 'lighting' | 'other'

export type DeviceType = 'ac' | 'tv' | 'washer' | 'fridge' | 'lights' | 'other'

export type LocationType =
  | 'bedroom'
  | 'bathroom'
  | 'living_room'
  | 'kitchen'
  | 'dining_room'
  | 'other'

export type DeviceDto = {
  id: string
  name: string
  category: DeviceCategory
  deviceType: DeviceType
  location?: LocationType
  watt: number
  defaultDurationMinutes: number
  active: boolean
  activatedAt: number | null
  createdAt: IsoDateTimeString
  updatedAt: IsoDateTimeString
}

export type CreateDeviceRequest = {
  name: string
  category: DeviceCategory
  deviceType: DeviceType
  location?: LocationType
  watt: number
  defaultDurationMinutes: number
  active?: boolean
  activatedAt?: number | null
}

export type UpdateDeviceRequest = Partial<CreateDeviceRequest>

export type ListDevicesResponse = ApiSuccess<DeviceDto[]>
export type CreateDeviceResponse = ApiSuccess<DeviceDto>
export type UpdateDeviceResponse = ApiSuccess<DeviceDto>
export type DeleteDeviceResponse = ApiSuccess<{
  deviceId: string
}>

export type CalculateElectricityKwhRequest = {
  inputType: 'kwh'
  timezoneOffsetMinutes: number
  input: {
    kwh: number
    meterStart: null
    meterEnd: null
    unit: 'kwh'
  }
  period: ElectricityPeriod
}

export type CalculateElectricityMeterReadingRequest = {
  inputType: 'meter_reading'
  timezoneOffsetMinutes: number
  input: {
    kwh: null
    meterStart: number
    meterEnd: number
    unit: 'kwh'
  }
  period: ElectricityPeriod
}

export type CalculateElectricityRequest =
  | CalculateElectricityKwhRequest
  | CalculateElectricityMeterReadingRequest

export type VerifiedElectricityCalculation = {
  electricityKwh: number
  emissionFactorId: string
  emissionFactorKgCo2ePerKwh: number
  totalKgCo2e: number
  method: 'server_verified'
  status: 'verified'
}

export type CalculateElectricitySuccessResponse = ApiSuccess<VerifiedElectricityCalculation>

export type UsageSourceDto = {
  createdFrom: 'mobile'
  offlineCreated: boolean
  clientGeneratedId: string
}

export type UsageTimestampsDto = {
  usageDate: IsoDateString
  createdAtClient: IsoDateTimeString
}

export type CreateElectricityUsageKwhRequest = {
  clientGeneratedId: string
  inputType: 'kwh'
  input: {
    kwh: number
    meterStart: null
    meterEnd: null
    unit: 'kwh'
  }
  period: ElectricityPeriod
  source: {
    createdFrom: 'mobile'
    offlineCreated: boolean
  }
  timestamps: UsageTimestampsDto
}

export type CreateElectricityUsageMeterReadingRequest = {
  clientGeneratedId: string
  inputType: 'meter_reading'
  input: {
    kwh: null
    meterStart: number
    meterEnd: number
    unit: 'kwh'
  }
  period: ElectricityPeriod
  source: {
    createdFrom: 'mobile'
    offlineCreated: boolean
  }
  timestamps: UsageTimestampsDto
}

export type CreateElectricityUsageDeviceBreakdownRequest = {
  clientGeneratedId: string
  inputType: 'device_breakdown'
  input: {
    deviceBreakdown: CreateDeviceBreakdownItemRequest[]
    unit: 'minutes'
  }
  period: ElectricityPeriod
  source: {
    createdFrom: 'mobile'
    offlineCreated: boolean
  }
  timestamps: UsageTimestampsDto
}

export type CreateElectricityUsageRequest =
  | CreateElectricityUsageKwhRequest
  | CreateElectricityUsageMeterReadingRequest
  | CreateElectricityUsageDeviceBreakdownRequest

export type UpdateElectricityUsageKwhRequest = Omit<
  CreateElectricityUsageKwhRequest,
  'clientGeneratedId'
>

export type UpdateElectricityUsageMeterReadingRequest = Omit<
  CreateElectricityUsageMeterReadingRequest,
  'clientGeneratedId'
>

export type UpdateElectricityUsageDeviceBreakdownRequest = Omit<
  CreateElectricityUsageDeviceBreakdownRequest,
  'clientGeneratedId'
>

export type UpdateElectricityUsageRequest =
  | UpdateElectricityUsageKwhRequest
  | UpdateElectricityUsageMeterReadingRequest
  | UpdateElectricityUsageDeviceBreakdownRequest

export type PersistedDeviceBreakdownItemDto = {
  deviceId: string
  name: string
  category: DeviceCategory
  deviceType: DeviceType
  watt: number
  durationMinutes: number
  electricityKwh: number
  totalKgCo2e: number
}

export type ElectricityUsageDto =
  | {
      inputType: 'kwh'
      input: {
        kwh: number
        meterStart: null
        meterEnd: null
        unit: 'kwh'
      }
      period: ElectricityPeriod
      calculation: VerifiedElectricityCalculation
      source: UsageSourceDto
      timestamps: UsageTimestampsDto
    }
  | {
      inputType: 'meter_reading'
      input: {
        kwh: null
        meterStart: number
        meterEnd: number
        unit: 'kwh'
      }
      period: ElectricityPeriod
      calculation: VerifiedElectricityCalculation
      source: UsageSourceDto
      timestamps: UsageTimestampsDto
    }
  | {
      inputType: 'device_breakdown'
      input: {
        deviceBreakdown: PersistedDeviceBreakdownItemDto[]
        unit: 'minutes'
      }
      period: ElectricityPeriod
      calculation: VerifiedElectricityCalculation
      source: UsageSourceDto
      timestamps: UsageTimestampsDto
    }

export type ElectricityUsageListItemDto = {
  usageId: string
  usage: ElectricityUsageDto
}

export type CurrentStreakDto = {
  length: number
  lastTrackedDate: IsoDateString | null
}

export type MonthlySummaryDto = {
  month: MonthString
  totalKwh: number
  totalKgCo2e: number
  averageKwhPerDay: number
  averageKgCo2ePerDay: number
  usageCount: number
}

export type CreateElectricityUsageResponse = ApiSuccess<{
  usageId: string
  usage: ElectricityUsageDto
  monthlySummary: MonthlySummaryDto
  currentStreak: CurrentStreakDto
}>

export type UpdateElectricityUsageResponse = CreateElectricityUsageResponse

export type DeleteElectricityUsageResponse = ApiSuccess<{
  usageId: string
  monthlySummary: MonthlySummaryDto
  currentStreak: CurrentStreakDto
}>

export type ListElectricityUsagesResponse = ApiSuccess<ElectricityUsageListItemDto[]>

export type GetMonthlySummaryResponse = ApiSuccess<{
  monthlySummary: MonthlySummaryDto
  currentStreak: CurrentStreakDto
}>

export type RecalculateMonthlySummaryResponse = GetMonthlySummaryResponse

export type EnergyInsightSuggestion = {
  title: string
  description: string
  estimatedImpactKgCo2e: number
}

export type GenerateEnergyInsightRequest = {
  month: MonthString
  force?: boolean
}

export type EnergyInsightDto = {
  insightId: string
  title: string
  summary: string
  suggestions: EnergyInsightSuggestion[]
  isStale: boolean
}

export type GenerateEnergyInsightResponse = ApiSuccess<EnergyInsightDto>

export type EmissionFactorDto = {
  id: string
  country: string
  region: string
  unit: 'kwh'
  kgCo2ePerKwh: number
  version: string
  active: true
}

export type ListEmissionFactorsResponse = ApiSuccess<EmissionFactorDto[]>

export type AuthUser = {
  uid: string
  email: string | null
  displayName: string | null
  photoURL: string | null
}

export type CarbonActivityCategory = 'transport' | 'electricity' | 'food' | 'waste'

export type CarbonActivity = {
  id: string
  userId: string
  category: CarbonActivityCategory
  amount: number
  unit: string
  co2Kg: number
  createdAt: string
  updatedAt: string
}
