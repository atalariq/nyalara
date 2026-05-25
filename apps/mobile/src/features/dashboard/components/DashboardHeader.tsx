import { CalendarDays, SunMedium } from 'lucide-react-native'
import { Image, Text, View } from 'react-native'

type Props = {
  displayName: string
  dateLabel: string
}

export function DashboardHeader({ displayName, dateLabel }: Props) {
  return (
    <View className="mx-5 rounded-[34px] bg-white/85 px-5 py-5 shadow-sm shadow-black/10">
      <View className="flex-row items-center justify-between">
        {/* LEFT CONTENT */}
        <View className="flex-1">
          <Text className="text-[22px] font-bold tracking-[-0.5px] text-[#1A1A1A]">
            Good Morning, {displayName}!
          </Text>

          <View className="mt-4 flex-row items-center gap-4">
            {/* DATE */}
            <View className="flex-row items-center gap-1.5">
              <CalendarDays size={16} color="#28C76F" strokeWidth={2} />

              <Text className="text-[15px] text-[#404040]">{dateLabel}</Text>
            </View>

            {/* WEATHER */}
            <View className="flex-row items-center gap-1.5">
              <SunMedium size={16} color="#28C76F" strokeWidth={2} />

              <Text className="text-[15px] text-[#404040]">22°C Clear</Text>
            </View>
          </View>
        </View>

        {/* PROFILE IMAGE */}
        <Image
          source={{
            uri: 'https://i.pravatar.cc/200',
          }}
          className="h-20 w-20 rounded-full"
        />
      </View>
    </View>
  )
}
