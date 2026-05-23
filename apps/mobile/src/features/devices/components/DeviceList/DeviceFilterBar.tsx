import { Plus } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";
import type { DeviceFilter } from "../../hooks/useDeviceList";

type Props = {
  selected: DeviceFilter;
  onSelect: (filter: DeviceFilter) => void;
  onAddPress: () => void;
};

const FILTERS: { key: DeviceFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "active", label: "Active" },
];

export function DeviceFilterBar({ selected, onSelect, onAddPress }: Props) {
  return (
    <View className="mt-4 flex-row items-center gap-3">
      <View className="flex-1 flex-row rounded-full bg-white p-1 shadow-sm shadow-black/5">
        {FILTERS.map(({ key, label }) => (
          <Pressable
            key={key}
            onPress={() => onSelect(key)}
            className={`flex-1 items-center justify-center rounded-full px-4 py-3 ${
              selected === key ? "bg-[#25CE7F]" : "bg-transparent"
            }`}
          >
            <Text
              className={`font-semibold ${
                selected === key ? "text-white" : "text-[#4B5563]"
              }`}
            >
              {label}
            </Text>
          </Pressable>
        ))}
      </View>

      <Pressable
        onPress={onAddPress}
        className="h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm shadow-black/5"
      >
        <Plus size={20} color="#25CE7F" />
      </Pressable>
    </View>
  );
}
