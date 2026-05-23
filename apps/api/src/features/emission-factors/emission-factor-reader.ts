export type EmissionFactor = {
  id: string
  country: string
  region: string
  unit: 'kwh'
  kgCo2ePerKwh: number
  version: string
  active: true
}

export type EmissionFactorReader = {
  listActiveElectricityFactors(): Promise<EmissionFactor[]>
}
