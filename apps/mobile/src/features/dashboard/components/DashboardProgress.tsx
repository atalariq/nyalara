import { Text, View } from "react-native";

type Props = {
  dailyGoal: number;
  remaining: number;
  progress: number;
};

export function DashboardProgress({ dailyGoal, remaining, progress }: Props) {
  return (
    <View className="mx-5 mt-5 rounded-[28px] bg-white px-5 py-4 shadow-sm shadow-black/10">
      <View className="flex-row justify-between">
        <Text className="text-[14px] font-semibold text-[#444]">
          Goal: {dailyGoal.toFixed(1)} kWh
        </Text>
        <Text className="text-[14px] font-semibold text-[#444]">
          Remaining: {remaining.toFixed(1)} kWh
        </Text>
      </View>

      <View className="mt-4 h-[10px] overflow-hidden rounded-full bg-[#ECECEC]">
        <View
          className="h-full rounded-full bg-[#E8A317]"
          style={{ width: `${progress * 100}%` }}
        />
      </View>
    </View>
  );
}
