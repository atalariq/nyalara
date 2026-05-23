export type ElectricityUsageRecord =
  | {
      inputType: 'kwh'
      input: {
        kwh: number
        meterStart: null
        meterEnd: null
        unit: 'kwh'
      }
      period: {
        startDate: string
        endDate: string
        month: string
      }
      calculation: {
        electricityKwh: number
        emissionFactorId: string
        emissionFactorKgCo2ePerKwh: number
        totalKgCo2e: number
        method: 'server_verified'
        status: 'verified'
      }
      source: {
        createdFrom: 'mobile'
        offlineCreated: boolean
        clientGeneratedId: string
      }
      timestamps: {
        usageDate: string
        createdAtClient: string
      }
    }
  | {
      inputType: 'meter_reading'
      input: {
        kwh: null
        meterStart: number
        meterEnd: number
        unit: 'kwh'
      }
      period: {
        startDate: string
        endDate: string
        month: string
      }
      calculation: {
        electricityKwh: number
        emissionFactorId: string
        emissionFactorKgCo2ePerKwh: number
        totalKgCo2e: number
        method: 'server_verified'
        status: 'verified'
      }
      source: {
        createdFrom: 'mobile'
        offlineCreated: boolean
        clientGeneratedId: string
      }
      timestamps: {
        usageDate: string
        createdAtClient: string
      }
    }

export type MonthlySummary = {
  month: string
  totalKwh: number
  totalKgCo2e: number
  averageKwhPerDay: number
  averageKgCo2ePerDay: number
  usageCount: number
}

export type CreateElectricityUsageParams = {
  userId: string
  usageId: string
  usage: ElectricityUsageRecord
}

export type CreateElectricityUsageResult = {
  usageId: string
  usage: ElectricityUsageRecord
  monthlySummary: MonthlySummary
}

export type ElectricityUsageService = {
  createUsage(
    params: CreateElectricityUsageParams
  ): Promise<CreateElectricityUsageResult>
}
