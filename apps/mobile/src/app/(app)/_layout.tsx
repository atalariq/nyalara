// src/app/(app)/_layout.tsx
import { useAuthStore } from "@/features/auth/store/authStore";
import AppLoading from "@/shared/components/feedback/AppLoading";
import { AppTabBar } from "@/shared/components/ui/AppTabBar";
import { Tabs, router } from "expo-router";
import { useEffect } from "react";
import { View } from "react-native";

export default function AppLayout() {
  const { user, isLoading } = useAuthStore();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/(onboarding)/welcome");
    }
  }, [user, isLoading]);

  if (isLoading) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <AppLoading size="lg" color="brand" />
      </View>
    );
  }

  if (!user) return null;

  return (
    <Tabs
      tabBar={(props) => <AppTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="dashboard" />
      <Tabs.Screen name="energy" />
      <Tabs.Screen name="devices" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}
