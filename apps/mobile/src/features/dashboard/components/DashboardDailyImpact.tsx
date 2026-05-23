import { Text, View } from "react-native";

type Props = {
  savedToday: number;
  co2Reduced: number;
};

export function DashboardDailyImpact({ savedToday, co2Reduced }: Props) {
  return (
    <View className="w-[145px] rounded-[28px] bg-[#DDF5E7] p-4">
      <Text className="text-[16px] font-bold text-[#2B2B2B]">Daily Impact</Text>

      <View className="mt-4 rounded-[18px] bg-white p-3">
        <Text className="text-[11px] text-[#6D6D6D]">Saved Today</Text>
        <Text className="mt-1 text-[28px] font-black text-[#222]">
          {savedToday.toFixed(1)}
          <Text className="text-[15px] font-semibold"> kWh</Text>
        </Text>
      </View>

      <View className="mt-3 rounded-[18px] bg-white p-3">
        <Text className="text-[11px] text-[#6D6D6D]">CO2 Reduced</Text>
        <Text className="mt-1 text-[28px] font-black text-[#222]">
          {co2Reduced.toFixed(2)}
          <Text className="text-[15px] font-semibold"> kg</Text>
        </Text>
      </View>
    </View>
  );
}
