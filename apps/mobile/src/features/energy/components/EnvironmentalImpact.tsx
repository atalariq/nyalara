import { CARBON_CONFIG } from "@/shared/config/carbonConfig";
import { Text, View } from "react-native";
import type { DailyUsage } from "../types/dailyUsage.types";

type Props = {
  history: DailyUsage[];
};

export function EnvironmentalImpact({ history }: Props) {
  const totalKwh = history.reduce((sum, d) => sum + d.totalKwh, 0);
  const totalEmissions = totalKwh * CARBON_CONFIG.emissionFactor;
  const totalCost = totalKwh * CARBON_CONFIG.electricityRate;

  return (
    <View className="mx-4 rounded-3xl bg-[#0E0E0E] p-6">
      <Text className="text-[10px] uppercase tracking-widest text-brand mb-2">
        Environmental Impact
      </Text>
      <Text className="text-4xl font-extrabold text-white leading-tight">
        {totalEmissions.toFixed(1)} kg CO2
      </Text>
      <Text className="text-base font-semibold text-white/80 mt-1">
        emitted this month
      </Text>
      <Text className="text-xs text-white/50 mt-3 leading-5">
        "Equivalent to driving {(totalEmissions * 4.6).toFixed(0)} km by car."
      </Text>

      {/* Cost breakdown */}
      <View className="mt-5 pt-4 border-t border-white/10 flex-row justify-between">
        <View>
          <Text className="text-xs text-white/50">Total Usage</Text>
          <Text className="text-base font-bold text-white mt-0.5">
            {totalKwh.toFixed(1)} kWh
          </Text>
        </View>
        <View className="items-end">
          <Text className="text-xs text-white/50">Est. Cost</Text>
          <Text className="text-base font-bold text-brand mt-0.5">
            Rp {totalCost.toLocaleString("id-ID", { maximumFractionDigits: 0 })}
          </Text>
        </View>
      </View>
    </View>
  );
}
