import { CARBON_CONFIG } from '@/shared/config/carbonConfig'
import { useDevices } from '@/features/devices/hooks/useDevices'
import { ActivityIndicator, Text, View } from 'react-native'
import type { DailyUsage } from '../types/dailyUsage.types'

type Props = {
  history: DailyUsage[]
  environmentalQuote: string
  isLoading: boolean
}

export function EnvironmentalImpact({
  history,
  environmentalQuote,
  isLoading,
}: Props) {
  const { devices } = useDevices()

  const totalKwh = history.reduce((sum, d) => sum + d.totalKwh, 0)
  const totalCost = totalKwh * CARBON_CONFIG.electricityRate

  const estimatedMonthlyKwh = devices.reduce(
    (sum, d) => sum + (d.watt * d.hoursPerDay * 30) / 1000,
    0,
  )
  const savedKwh = Math.max(estimatedMonthlyKwh - totalKwh, 0)
  const co2ReducedKg = savedKwh * CARBON_CONFIG.emissionFactor

  return (
    <View className="mx-4 rounded-[34px] border border-black/5 bg-surface px-6 py-7 shadow-sm shadow-black/5">
      <Text className="font-bold text-[13px] uppercase tracking-[2px] text-brand">
        Environmental Impact
      </Text>
      <View className="mt-3 max-w-[220px]">
        <Text className="font-extrabold text-[34px] leading-[44px] text-foreground">
          {co2ReducedKg.toFixed(1)} kg CO2
        </Text>
        <Text className="mt-1 font-extrabold text-[34px] leading-[34px] text-foreground">
          reduced
        </Text>
      </View>
      <View className="mt-4 max-w-[300px]">
        {isLoading ? (
          <ActivityIndicator size="small" color="#25CE7F" />
        ) : (
          <Text className="text-[15px] leading-[26px] text-foreground-secondary">
            "{environmentalQuote}"
          </Text>
        )}
      </View>
    </View>
  )
}
