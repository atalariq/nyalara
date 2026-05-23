import { Zap } from "lucide-react-native";
import { Text, View } from "react-native";
import type { DeviceListItem } from "../../hooks/useDeviceList";

type StatCardProps = {
  label: string;
  deviceName: string;
};

function StatCard({ label, deviceName }: StatCardProps) {
  return (
    <View className="flex-1 rounded-3xl bg-white p-4 shadow-sm shadow-black/5">
      <Text className="text-[10px] uppercase tracking-[0.2em] text-[#999]">
        {label}
      </Text>
      <View className="mt-3 flex-row items-center gap-3">
        <View className="h-10 w-10 rounded-2xl bg-[#E8FFF4] items-center justify-center">
          <Zap size={20} color="#25CE7F" strokeWidth={3} />
        </View>
        <Text
          className="flex-1 text-sm font-semibold text-[#121212]"
          numberOfLines={1}
        >
          {deviceName}
        </Text>
      </View>
    </View>
  );
}

type Props = {
  highestConsumer: DeviceListItem | null;
  mostActive: DeviceListItem | null;
};

export function DeviceStatsRow({ highestConsumer, mostActive }: Props) {
  return (
    <View className="mt-4 flex-row gap-3">
      <StatCard
        label="highest consumer"
        deviceName={highestConsumer?.name ?? "—"}
      />
      <StatCard label="most active" deviceName={mostActive?.name ?? "—"} />
    </View>
  );
}
