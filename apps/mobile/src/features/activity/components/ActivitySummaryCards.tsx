import React from 'react'
import { Text, View } from 'react-native'
import { TrendingDown, TrendingUp } from 'lucide-react-native'

type Props = {
  totalKWh: number
  efficiencyPercent: number
}

export function ActivitySummaryCards({ totalKWh, efficiencyPercent }: Props) {
  const isLower = efficiencyPercent < 0
  const absPercent = Math.abs(efficiencyPercent)

  return (
    <View className="flex-row gap-4 px-5 pb-7">
      {/* Total Usage */}
      <View
        className="flex-1 rounded-[28px] bg-[#FAFAFA] p-5"
        style={{
          shadowColor: '#000',
          shadowOpacity: 0.04,
          shadowRadius: 10,
          elevation: 2,
        }}
      >
        <Text className="text-[13px] text-[#8A8A8A]">Total Usage</Text>

        <View className="mt-2 flex-row items-end gap-1">
          <Text className="text-[20px] font-bold text-[#25CE7F]">{totalKWh.toFixed(1)}</Text>

          <Text className="mb-[2px] text-[14px] text-[#8A8A8A]">kWh</Text>
        </View>
      </View>

      {/* Efficiency */}
      <View
        className="flex-1 rounded-[28px] bg-[#FAFAFA] p-5"
        style={{
          shadowColor: '#000',
          shadowOpacity: 0.04,
          shadowRadius: 10,
          elevation: 2,
        }}
      >
        <Text className="text-[13px] text-[#8A8A8A]">Efficiency</Text>

        <View className="mt-2 flex-row items-center gap-1">
          {isLower ? (
            <TrendingDown size={14} color="#25CE7F" />
          ) : (
            <TrendingUp size={14} color="#FF6B6B" />
          )}

          <Text
            className="text-[16px] font-semibold"
            style={{
              color: isLower ? '#25CE7F' : '#FF6B6B',
            }}
          >
            {absPercent}% {isLower ? 'lower' : 'higher'}
          </Text>
        </View>
      </View>
    </View>
  )
}
