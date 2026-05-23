import { AppButton } from "@/shared/components/ui/AppButton";
import { Text, View } from "react-native";
import type { MonthlyGoal } from "../types/profile.types";

type Props = {
  data: MonthlyGoal;
  onUpdatePress?: () => void;
};

export function MonthlyGoalCard({ data, onUpdatePress }: Props) {
  const progress = Math.min(data.progressPercent, 100);

  return (
    <View className="px-4">
      <Text className="text-xs font-semibold text-foreground-muted uppercase tracking-widest mb-3">
        This Month Goals
      </Text>
      <View className="rounded-3xl bg-surface p-5 shadow-sm shadow-black/5">
        <Text className="text-base font-bold text-foreground">
          {data.title}
        </Text>
        <Text className="text-sm text-foreground-secondary mt-1.5 leading-5">
          {data.description}
        </Text>

        {/* Baseline / Target */}
        <View className="flex-row gap-4 mt-4">
          <Text className="text-xs text-foreground-muted">
            Baseline:{" "}
            <Text className="font-semibold text-foreground">
              {data.baselineKwh} kWh
            </Text>
          </Text>
          <Text className="text-xs text-foreground-muted">
            Target:{" "}
            <Text className="font-semibold text-brand">
              {data.targetKwh} kWh
            </Text>
          </Text>
        </View>

        {/* Progress bar */}
        <View className="mt-4">
          <View className="flex-row items-center justify-between mb-1.5">
            <Text className="text-[10px] uppercase tracking-widest text-foreground-muted">
              Progress
            </Text>
            <Text className="text-xs font-semibold text-brand">
              {progress}%
            </Text>
          </View>
          <View className="h-2 rounded-full bg-surface-raised overflow-hidden">
            <View
              className="h-2 rounded-full bg-brand"
              style={{ width: `${progress}%` }}
            />
          </View>
        </View>

        <View className="mt-5">
          <AppButton
            label="Update Target"
            variant="primary"
            fullWidth
            onPress={onUpdatePress}
          />
        </View>
      </View>
    </View>
  );
}
