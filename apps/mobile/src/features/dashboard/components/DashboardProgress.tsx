import { Image, Text, View } from 'react-native'
import { toFiniteNumber } from '../lib/finite-number'

type Props = {
  dailyGoalKwh: number
  remaining: number
  progress: number
}

export function DashboardProgress({ dailyGoalKwh, remaining, progress }: Props) {
  const safeDailyGoalKwh = toFiniteNumber(dailyGoalKwh)
  const safeRemaining = toFiniteNumber(remaining)
  const safeProgress = toFiniteNumber(progress)

  return (
    <View className="mx-5 mt-5 rounded-[28px] bg-white px-5 py-4 shadow-sm shadow-black/10">
      {/* TOP ROW */}
      <View className="flex-row items-center">
        <View className="mr-3 items-center justify-center">
          <Image
            source={require('@/assets/images/screen/flash.png')}
            className="h-[24px] w-[24px]"
            resizeMode="contain"
          />
        </View>

        <Text className="text-[16px] font-semibold leading-16px text-[#444]">
          Carbon Budget: {safeDailyGoalKwh.toFixed(1)} kWh
        </Text>
      </View>

      {/* PROGRESS BAR */}
      <View className="mt-3 h-[10px] overflow-hidden rounded-full bg-[#E9E9E9]">
        <View
          className="h-full rounded-full bg-[#E8A317]"
          style={{ width: `${safeProgress * 100}%` }}
        />
      </View>

      {/* BOTTOM RIGHT */}
      <View className="mt-2 items-end">
        <Text className="text-[13px] font-medium text-[#8B8B8B]">
          Remaining: {safeRemaining.toFixed(1)} kWh
        </Text>
      </View>
    </View>
  )
}
