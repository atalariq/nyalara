import { CalendarDays, Sparkles } from 'lucide-react-native'
import { ActivityIndicator, Text, View } from 'react-native'

type Props = {
  displayName: string
  dateLabel: string
  dailyTip: string
  isLoadingTip: boolean
}

export function DashboardHeader({
  displayName,
  dateLabel,
  dailyTip,
  isLoadingTip,
}: Props) {
  return (
    <View className="mx-5 mt-4 rounded-[30px] bg-[#CFF7DF] px-5 py-5 shadow-sm shadow-black/10">
      <View className="flex-row items-center gap-1 mb-1">
        <CalendarDays size={14} color="#28C76F" />
        <Text className="text-[13px] text-[#4A4A4A]">{dateLabel}</Text>
      </View>
      <Text className="text-[18px] font-medium text-[#202020]">
        Good Morning,
      </Text>
      <Text className="mt-1 text-[32px] font-black text-[#111]">
        {displayName}!
      </Text>

      {/* <View className="mt-4 flex-row items-start gap-2 rounded-[16px] bg-white/60 px-3 py-3">
        {isLoadingTip ? (
          <ActivityIndicator size="small" color="#28C76F" />
        ) : (
          <>
            <Sparkles size={14} color="#28C76F" style={{ marginTop: 2 }} />
            <Text className="flex-1 text-[13px] text-[#4A4A4A]">
              {dailyTip || 'Loading your daily insight...'}
            </Text>
          </>
        )}
      </View> */}
    </View>
  )
}
