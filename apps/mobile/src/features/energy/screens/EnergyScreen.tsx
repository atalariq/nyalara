import { useDevices } from "@/features/devices/hooks/useDevices";
import AppLoading from "@/shared/components/feedback/AppLoading";
import { ScrollView, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ActiveDevicesList } from "../components/ActiveDevicesList";
import { EnergyBarChart } from "../components/EnergyBarChart";
import { EnergyHeader } from "../components/EnergyHeader";
import { EnvironmentalImpact } from "../components/EnvironmentalImpact";
import { useEnergyHistory } from "../hooks/useEnergyHistory";

function getComparedToYesterday(
  todayKwh: number,
  history: ReturnType<typeof useEnergyHistory>["history"],
): number | null {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split("T")[0];
  const yesterdayData = history.find((d) => d.date === yesterdayStr);
  if (!yesterdayData || yesterdayData.totalKwh === 0) return null;
  return ((todayKwh - yesterdayData.totalKwh) / yesterdayData.totalKwh) * 100;
}

export default function EnergyScreen() {
  useDevices(); // ← populate devices store
  const { today, history, isLoading, error } = useEnergyHistory();

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center">
        <AppLoading size="md" label="Loading energy data..." />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center">
        <Text className="text-foreground-muted text-sm">{error}</Text>
      </SafeAreaView>
    );
  }

  const todayKwh = today?.totalKwh ?? 0;
  const comparedToYesterday = getComparedToYesterday(todayKwh, history);

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-[#F3FBF7]">
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ gap: 16, paddingBottom: 140 }}
      >
        <EnergyHeader
          totalKwh={todayKwh}
          comparedToYesterday={comparedToYesterday}
        />
        <EnergyBarChart history={history} />
        <ActiveDevicesList today={today} />
        <EnvironmentalImpact history={history} />
      </ScrollView>
    </SafeAreaView>
  );
}
