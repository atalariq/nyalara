// features/dashboard/components/DashboardDailyImpact.tsx
import { Text, View } from 'react-native'
import { toFiniteNumber } from '../lib/finite-number'

type Props = {
  savedKwh: number
  co2ReducedKg: number
}

export function DashboardDailyImpact({ savedKwh = 0, co2ReducedKg = 0 }: Props) {
  const safeSavedKwh = toFiniteNumber(savedKwh)
  const safeCo2ReducedKg = toFiniteNumber(co2ReducedKg)

  return (
    <View className="w-[145px] rounded-[28px] bg-[#DDF5E7] p-4">
      <Text className="text-[16px] font-bold text-[#2B2B2B]">Daily Impact</Text>
      <View className="mt-4 rounded-[18px] bg-white p-3">
        <Text className="text-[11px] text-[#6D6D6D]">Saved Today</Text>
        <Text className="mt-1 text-[28px] font-black text-[#222]">
          {safeSavedKwh.toFixed(1)}
          <Text className="text-[15px] font-semibold"> kWh</Text>
        </Text>
      </View>
      <View className="mt-3 rounded-[18px] bg-[#28C76F] p-3">
        <Text className="text-[11px] text-white/80">CO2 Reduced</Text>
        <Text className="mt-1 text-[28px] font-black text-white">
          {safeCo2ReducedKg.toFixed(2)}
          <Text className="text-[15px] font-semibold"> kg</Text>
        </Text>
      </View>
    </View>
  )
}
