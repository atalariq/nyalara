import { Text, View } from "react-native";
import type { CarbonEffects } from "../types/profile.types";

type StatCardProps = {
  value: string;
  label: string;
  icon: string;
  accent?: boolean;
  highlight?: "green" | "orange";
};

function StatCard({ value, label, icon, highlight }: StatCardProps) {
  const valueColor =
    highlight === "orange"
      ? "text-[#F59E0B]"
      : highlight === "green"
        ? "text-brand"
        : "text-foreground";

  return (
    <View className="flex-1 rounded-3xl bg-surface p-4 items-start">
      <Text className="text-xl mb-1">{icon}</Text>
      <Text className={`text-2xl font-extrabold ${valueColor}`}>{value}</Text>
      <Text className="text-xs text-foreground-muted mt-0.5">{label}</Text>
    </View>
  );
}

type Props = {
  data: CarbonEffects;
};

export function CarbonEffectsGrid({ data }: Props) {
  return (
    <View className="px-4">
      <Text className="text-xs font-semibold text-foreground-muted uppercase tracking-widest mb-3">
        Carbon Effects
      </Text>
      <View className="gap-3">
        <View className="flex-row gap-3">
          <StatCard
            icon="💨"
            value={`${data.co2ReductionKg > 0 ? "-" : ""}${Math.abs(data.co2ReductionKg)}kg`}
            label="CO2 Reduksi"
            highlight="green"
          />
          <StatCard
            icon="⚡"
            value={`${data.energyUsedKwh} kWh`}
            label="Digunakan"
          />
        </View>
        <View className="flex-row gap-3">
          <StatCard
            icon="🏆"
            value={`${data.streakDays} Day`}
            label="Streak"
            highlight="orange"
          />
          <StatCard
            icon="🔌"
            value={`${data.deviceCount}`}
            label="Devices"
            highlight="green"
          />
        </View>
      </View>
    </View>
  );
}
