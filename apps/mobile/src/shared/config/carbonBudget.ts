// shared/config/carbonBudget.ts
export type HouseType = 'small' | 'medium' | 'large'

export const HOUSE_CONFIG = {
  small: { label: 'Small House', kwh: 12, description: 'Up to 15 kWh/day' },
  medium: { label: 'Medium House', kwh: 25, description: 'Up to 30 kWh/day' },
  large: { label: 'Large House', kwh: 40, description: '40+ kWh/day' },
} as const satisfies Record<HouseType, { label: string; kwh: number; description: string }>

export function getMonthlyBudget(houseType: HouseType) {
  return HOUSE_CONFIG[houseType].kwh * 30 // kWh/month
}
