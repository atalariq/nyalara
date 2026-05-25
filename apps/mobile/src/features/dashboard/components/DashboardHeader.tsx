import { CalendarDays } from 'lucide-react-native'
import { Text, View } from 'react-native'

type Props = {
  displayName: string
  dateLabel: string
}

export function DashboardHeader({ displayName, dateLabel }: Props) {
  return (
    <View className="mx-5 rounded-[30px] bg-white px-5 py-5 shadow-sm shadow-black/10">
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
    </View>
  )
}
