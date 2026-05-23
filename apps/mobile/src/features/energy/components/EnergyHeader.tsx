import { TrendingDown, TrendingUp } from "lucide-react-native";
import { Text, View } from "react-native";

type Props = {
  totalKwh: number;
  comparedToYesterday?: number | null;
};

export function EnergyHeader({ totalKwh, comparedToYesterday }: Props) {
  const isDown = comparedToYesterday != null && comparedToYesterday <= 0;

  const hasComparison = comparedToYesterday != null;

  return (
    <View className="mx-5 mt-5 overflow-hidden rounded-[34px] bg-white px-6 py-7 shadow-sm shadow-black/10">
      {/* BACKGROUND BARS */}
      <View className="absolute bottom-0 left-0 right-0 flex-row items-end justify-between px-2 opacity-40">
        {[60, 100, 140, 80, 130, 95].map((h, i) => (
          <View
            key={i}
            className="w-[48px] rounded-t-[18px] bg-[#DDF5E7]"
            style={{ height: h }}
          />
        ))}
      </View>

      {/* TITLE */}
      <Text className="text-center text-[14px] font-black tracking-[3px] text-[#2F2F2F]">
        CURRENT USAGE
      </Text>

      {/* MAIN CONTENT */}
      <View className="mt-4 flex-row items-center justify-center">
        {hasComparison &&
          (isDown ? (
            <TrendingDown size={58} color="#F59E0B" strokeWidth={2.5} />
          ) : (
            <TrendingUp size={58} color="#EF4444" strokeWidth={2.5} />
          ))}

        <View className="ml-2 flex-row items-end">
          <Text className="text-[64px] font-black leading-none text-[#111]">
            {totalKwh.toFixed(1)}
          </Text>

          <Text className="mb-2 ml-2 text-[30px] font-medium text-[#2B2B2B]">
            kWh
          </Text>
        </View>
      </View>

      {/* BADGES */}
      <View className="mt-5 items-center gap-3">
        {hasComparison && (
          <View className="rounded-full bg-[#2DD881] px-5 py-2">
            <Text className="text-[14px] font-bold text-white">
              {Math.abs(comparedToYesterday!).toFixed(0)}%{" "}
              {isDown ? "lower" : "higher"} than yesterday
            </Text>
          </View>
        )}

        <View className="rounded-full bg-[#F7D7A8] px-5 py-2">
          <Text className="text-[14px] font-bold text-[#5B4631]">
            {isDown ? "Efficient Energy Pattern" : "Consider reducing usage"}
          </Text>
        </View>
      </View>
    </View>
  );
}
