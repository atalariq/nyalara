// features/devices/components/CategoryGrid.tsx
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Text, TouchableOpacity, View } from "react-native";
import type { DeviceType } from "../../types/device.types";

interface CategoryOption {
  value: DeviceType;
  label: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
}

const CATEGORIES: CategoryOption[] = [
  { value: "ac", label: "AC Unit", icon: "snowflake" },
  { value: "tv", label: "Smart TV", icon: "television-play" },
  { value: "washer", label: "Washer", icon: "washing-machine" },
  { value: "fridge", label: "Fridge", icon: "fridge-outline" },
  { value: "lights", label: "Lights", icon: "lightbulb-outline" },
  { value: "other", label: "Other", icon: "plus-circle-outline" },
];

interface Props {
  value: DeviceType;
  onChange: (val: DeviceType) => void;
}

export function CategoryGrid({ value, onChange }: Props) {
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
      {CATEGORIES.map((cat) => {
        const isSelected = value === cat.value;
        return (
          <TouchableOpacity
            key={cat.value}
            onPress={() => onChange(cat.value)}
            style={{
              width: "30%",
              flexGrow: 1,
              alignItems: "center",
              justifyContent: "center",
              paddingVertical: 14,
              borderRadius: 16,
              borderWidth: 1.5,
              backgroundColor: isSelected ? "rgba(37,206,127,0.08)" : "#F5F5F5",
              borderColor: isSelected ? "#25CE7F" : "#F5F5F5",
              gap: 6,
            }}
          >
            <MaterialCommunityIcons
              name={cat.icon}
              size={22}
              color={isSelected ? "#25CE7F" : "#555"}
            />
            <Text
              style={{
                fontSize: 11,
                fontWeight: "600",
                color: isSelected ? "#25CE7F" : "#333",
              }}
            >
              {cat.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
