// features/devices/components/EstimateBar.tsx
import { Text, View } from "react-native";

interface Props {
  kwh: number;
  emissions: number;
  cost: number;
}

function formatCost(cost: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(cost);
}

export function EstimateBar({ kwh, emissions, cost }: Props) {
  const hasValue = kwh > 0;

  return (
    <View className="bg-[#171717] border border-[#2a2a2a] rounded-xl p-3 mt-3">
      <View className="flex-row items-center gap-2 mb-2">
        <View className="w-2 h-2 rounded-full bg-[#25CE7F]" />
        <Text className="text-xs text-[#555] font-semibold">
          Monthly estimate
        </Text>
      </View>

      <View className="flex-row justify-between">
        <EstimateItem
          label="Energy"
          value={hasValue ? `${kwh.toFixed(1)} kWh` : "—"}
          highlight={hasValue}
        />
        <EstimateItem
          label="CO₂"
          value={hasValue ? `${emissions.toFixed(1)} kg` : "—"}
          highlight={hasValue}
        />
        <EstimateItem
          label="Cost"
          value={hasValue ? formatCost(cost) : "—"}
          highlight={hasValue}
        />
      </View>
    </View>
  );
}

function EstimateItem({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight: boolean;
}) {
  return (
    <View className="items-center">
      <Text
        className={`text-sm font-bold ${highlight ? "text-[#25CE7F]" : "text-[#444]"}`}
      >
        {value}
      </Text>
      <Text className="text-[10px] text-[#555] mt-0.5">{label}</Text>
    </View>
  );
}
