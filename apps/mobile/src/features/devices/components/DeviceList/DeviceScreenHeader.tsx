import { LinearGradient } from "expo-linear-gradient";
import { Text, View } from "react-native";

type Props = {
  totalCount: number;
  activeCount: number;
};

export function DeviceScreenHeader({ totalCount, activeCount }: Props) {
  return (
    <View className="mt-4 overflow-hidden rounded-[30px] bg-[#E8FBEE] px-5 py-6">
      <View className="absolute inset-0 opacity-80">
        <LinearGradient
          colors={["#F4FFF7", "#DDF7E7", "#C8F0D8"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="h-full w-full"
        />
      </View>

      <View className="relative z-10">
        <Text className="text-[40px] font-bold tracking-[-1.5px] text-[#111111]">
          Devices
        </Text>

        <Text className="mt-2 max-w-[220px] text-[15px] leading-6 text-[#222222]">
          Manage the devices connected to your energy tracking.
        </Text>

        <View className="mt-5 flex-row flex-wrap items-center gap-3">
          <View className="rounded-full bg-[#29D17C] px-5 py-3 shadow-sm shadow-black/10">
            <Text className="text-[15px] font-semibold text-[#041E12]">
              {totalCount} devices
            </Text>
          </View>

          <View className="rounded-full bg-[#101010] px-5 py-3 shadow-sm shadow-black/20">
            <Text className="text-[15px] font-semibold text-white">
              {activeCount} currently active
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}
