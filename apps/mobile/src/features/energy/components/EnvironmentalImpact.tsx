// features/energy/components/EnvironmentalImpact.tsx
import { ActivityIndicator, Text, View } from 'react-native'

type Props = {
  co2ReducedKg: number
  environmentalQuote: string
  isLoading: boolean
}

export function EnvironmentalImpact({ co2ReducedKg, environmentalQuote, isLoading }: Props) {
  return (
    <View className="">
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
