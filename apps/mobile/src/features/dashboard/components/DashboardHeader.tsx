import { CalendarDays, SunMedium } from "lucide-react-native";
import { Image, Text, View } from "react-native";

type Props = {
  displayName: string;
  dateLabel: string;
  weatherLabel: string;
  avatarUri: string;
};

export function DashboardHeader({
  displayName,
  dateLabel,
  weatherLabel,
  avatarUri,
}: Props) {
  return (
    <View className="mx-5 mt-4 rounded-[30px] bg-[#CFF7DF] px-5 py-5 shadow-sm shadow-black/10">
      <View className="flex-row items-center justify-between">
        <View className="flex-1 pr-4">
          <Text className="text-[18px] font-medium text-[#202020]">
            Good Morning,
          </Text>
          <Text className="mt-1 text-[32px] font-black text-[#111]">
            {displayName}!
          </Text>

          <View className="mt-2 flex-row flex-wrap items-center gap-3">
            <View className="flex-row items-center gap-1">
              <CalendarDays size={14} color="#28C76F" />
              <Text className="text-[13px] text-[#4A4A4A]">{dateLabel}</Text>
            </View>

            <View className="flex-row items-center gap-1">
              <SunMedium size={14} color="#28C76F" />
              <Text className="text-[13px] text-[#4A4A4A]">{weatherLabel}</Text>
            </View>
          </View>
        </View>

        <Image
          source={{ uri: avatarUri }}
          className="h-[62px] w-[62px] rounded-full"
        />
      </View>
    </View>
  );
}
