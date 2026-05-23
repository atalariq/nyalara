// features/dashboard/screens/DashboardScreen.tsx

import { useAuthStore } from "@/features/auth/store/authStore";
import { useDevices } from "@/features/devices/hooks/useDevices";
import { useMemo } from "react";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  DashboardDailyImpact,
  DashboardHeader,
  DashboardMainStats,
  DashboardProgress,
  DashboardRecommendations,
} from "../components";

const recommendations = [
  "Turn off devices when not in use",
  "Use natural daylight",
  "Unplug unused chargers",
  "Set AC temperature higher",
  "Run full laundry loads",
  "Use eco mode on appliances",
];

export default function DashboardScreen() {
  const { devices } = useDevices();
  const user = useAuthStore((s) => s.user);

  const totalKwh = useMemo(
    () => devices.reduce((sum, d) => sum + (d.monthlyKwh ?? 0), 0),
    [devices],
  );

  const displayName = user?.displayName?.split(" ")[0] ?? "User";
  const avatarUri = "https://i.pravatar.cc/150?img=12";
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  const dailyUsage = totalKwh > 0 ? totalKwh / 30 : 3.4;
  const dailyGoal = 5;
  const progress = Math.min(dailyUsage / dailyGoal, 1);
  const remaining = Math.max(dailyGoal - dailyUsage, 0);

  return (
    <SafeAreaView className="flex-1 bg-[#F4F6F5]">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 140 }}
      >
        <DashboardHeader
          displayName={displayName}
          dateLabel={today}
          weatherLabel="22°C Clear"
          avatarUri={avatarUri}
        />

        <View className="mx-5 mt-7 rounded-[32px] bg-white p-5 shadow-sm shadow-black/10">
          <View className="flex-row justify-between gap-4">
            <DashboardMainStats dailyUsage={dailyUsage} progress={progress} />
            <DashboardDailyImpact savedToday={1.2} co2Reduced={0.85} />
          </View>
        </View>

        <DashboardProgress
          dailyGoal={dailyGoal}
          remaining={remaining}
          progress={progress}
        />

        <DashboardRecommendations recommendations={recommendations} />
      </ScrollView>
    </SafeAreaView>
  );
}
