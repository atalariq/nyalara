import { Text, View } from "react-native";

type Props = {
  dailyUsage: number;
  progress: number;
};

export function DashboardMainStats({ dailyUsage, progress }: Props) {
  return (
    <View className="flex-1 items-center justify-center">
      <View className="flex-row items-baseline gap-2">
        <Text className="text-[58px] font-black text-[#27C76F] leading-none">
          {dailyUsage.toFixed(1)}
        </Text>
        <Text className="text-[24px] font-semibold text-[#68B98B]">kWh</Text>
      </View>

      <Text className="mt-10 text-center text-[22px] font-black text-[#27C76F]">
        {Math.round(progress * 100)}%
      </Text>

      <Text className="text-[14px] font-bold tracking-[2px] text-[#27C76F]">
        DAILY GOAL
      </Text>
    </View>
  );
}
