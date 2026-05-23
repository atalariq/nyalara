import { Text, View } from "react-native";

export function DeviceEmptyState() {
  return (
    <View className="rounded-3xl bg-white p-6 shadow-sm shadow-black/5 items-center">
      <Text className="text-base font-semibold text-[#0E0E0E]">
        No devices found
      </Text>
      <Text className="mt-2 text-sm text-[#7A7A7A] text-center">
        Add a device first and it will appear here.
      </Text>
    </View>
  );
}
