import { Leaf, MapPin, Pencil } from "lucide-react-native";
import { Image, Pressable, Text, View } from "react-native";
import type { EcoLevel } from "../types/profile.types";

type Props = {
  name: string;
  level: EcoLevel;
  city: string;
  avatarUrl?: string;
  onEditPress?: () => void;
};

export function ProfileHeader({
  name,
  level,
  city,
  avatarUrl,
  onEditPress,
}: Props) {
  const progressPercent = Math.min((level.current / level.target) * 100, 100);

  return (
    <View className="px-4 pt-4 pb-5">
      {/* Top row */}
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-3">
          <View className="h-12 w-12 rounded-full bg-[#D3F5E5] overflow-hidden items-center justify-center">
            {avatarUrl ? (
              <Image source={{ uri: avatarUrl }} className="h-12 w-12" />
            ) : (
              <Text className="text-xl">👤</Text>
            )}
          </View>
          <View>
            <Text className="text-base font-bold text-foreground">{name}</Text>
            <View className="flex-row items-center gap-1 mt-0.5">
              <Leaf size={12} color="#25CE7F" />
              <Text className="text-xs text-brand font-medium">
                {level.label}
              </Text>
              <Text className="text-xs text-foreground-muted mx-1">•</Text>
              <MapPin size={12} color="#8E8E8E" />
              <Text className="text-xs text-foreground-muted">{city}</Text>
            </View>
          </View>
        </View>

        <Pressable
          onPress={onEditPress}
          className="h-9 w-9 rounded-full bg-surface-raised items-center justify-center"
          style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
        >
          <Pencil size={16} color="#25CE7F" />
        </Pressable>
      </View>

      {/* XP Bar */}
      <View className="mt-4">
        <View className="flex-row items-center justify-between mb-2">
          <Text className="text-xs font-semibold text-brand">Eco Warrior</Text>
          <Text className="text-xs text-foreground-muted">
            {level.current} / {level.target} pts to Level 6
          </Text>
        </View>
        <View className="h-2 rounded-full bg-surface-raised overflow-hidden">
          <View
            className="h-2 rounded-full bg-brand"
            style={{ width: `${progressPercent}%` }}
          />
        </View>
      </View>
    </View>
  );
}
