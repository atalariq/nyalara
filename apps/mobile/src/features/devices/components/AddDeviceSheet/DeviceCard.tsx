import { Text, View } from "react-native";
import type { Device } from "../../types/device.types";

type Props = {
  device: Device;
};

export function DeviceCard({ device }: Props) {
  return (
    <View
      style={{
        backgroundColor: "#FFFFFF",
        borderRadius: 24,
        padding: 18,
        marginBottom: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 10,
        elevation: 3,
      }}
    >
      <Text style={{ fontSize: 16, fontWeight: "700", color: "#111" }}>
        {device.name}
      </Text>
      <Text style={{ marginTop: 4, color: "#666", fontSize: 14 }}>
        {device.category} • {device.deviceType}
      </Text>
      <Text
        style={{ marginTop: 10, color: "#444", fontSize: 13, lineHeight: 18 }}
      >
        {device.watt} W • {device.hoursPerDay}h/day • {device.daysPerMonth}
        d/month
      </Text>
    </View>
  );
}
