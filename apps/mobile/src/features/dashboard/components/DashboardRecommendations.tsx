import { CircleCheck } from "lucide-react-native";
import { Text, View } from "react-native";

type Props = {
  recommendations: string[];
};

export function DashboardRecommendations({ recommendations }: Props) {
  return (
    <View className="mx-5 mt-5 overflow-hidden rounded-[32px] bg-[#DFF6E7] shadow-sm shadow-black/10">
      <View className="bg-[#28C76F] px-6 py-5">
        <Text className="text-[22px] font-black text-[#111]">
          Today's Recommendations
        </Text>
      </View>

      <View className="px-6 py-5">
        <Text className="text-[18px] font-semibold text-[#333]">
          “Small actions to improve today's energy efficiency.”
        </Text>

        <View className="mt-6 gap-4">
          {recommendations.map((item) => (
            <View key={item} className="flex-row items-start gap-3">
              <CircleCheck size={18} color="#28C76F" fill="#28C76F" />
              <Text className="flex-1 text-[15px] text-[#333]">{item}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}
