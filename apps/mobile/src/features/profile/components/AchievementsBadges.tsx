import { Text, View } from "react-native";
import type { Achievement } from "../types/profile.types";

type Props = {
  achievements: Achievement[];
};

export function AchievementsBadges({ achievements }: Props) {
  return (
    <View className="px-4">
      <Text className="text-xs font-semibold text-foreground-muted uppercase tracking-widest mb-3">
        Achievements
      </Text>
      <View className="flex-row flex-wrap gap-2">
        {achievements.map((a) => (
          <View
            key={a.id}
            className="flex-row items-center gap-1.5 rounded-full bg-surface border border-border px-3 py-1.5"
          >
            <Text className="text-xs">{a.emoji}</Text>
            <Text className="text-xs font-semibold text-foreground">
              {a.label}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}
