// features/profile/screens/ProfileScreen.tsx
import { useLogout } from "@/features/auth/hooks/useLogout";
import AppLoading from "@/shared/components/feedback/AppLoading";
import { LogOut } from "lucide-react-native";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AccountInfoList } from "../components/AccountInfoList";
import { AchievementsBadges } from "../components/AchievementsBadges";
import { CarbonEffectsGrid } from "../components/CarbonEffectsGrid";
import { MonthlyGoalCard } from "../components/MonthlyGoalCard";
import { ProfileHeader } from "../components/ProfileHeader";
import { useProfile } from "../hooks/useProfile";

export default function ProfileScreen() {
  const { profile, isLoading, error } = useProfile();
  const { logout, isLoading: isLoggingOut } = useLogout();

  function handleLogout() {
    Alert.alert("Log Out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log Out",
        style: "destructive",
        onPress: logout,
      },
    ]);
  }

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center">
        <AppLoading size="md" label="Memuat profil..." />
      </SafeAreaView>
    );
  }

  if (error || !profile) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center">
        <Text className="text-foreground-muted text-sm">
          {error ?? "Profil tidak ditemukan"}
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ gap: 20, paddingBottom: 140 }}
      >
        <ProfileHeader
          name={profile.displayName}
          level={{ label: "Eco Warrior", current: 620, target: 1000 }}
          city={profile.city ?? "—"}
          avatarUrl={profile.photoURL}
          onEditPress={() => {}}
        />

        <CarbonEffectsGrid
          data={{
            co2ReductionKg: 18,
            energyUsedKwh: 482,
            streakDays: 21,
            deviceCount: 12,
          }}
        />

        <AccountInfoList
          data={{
            name: profile.displayName,
            email: profile.email,
            residence: profile.residence ?? "—",
            residents: profile.residents ?? 0,
            city: profile.city ?? "—",
            plnRate: `Rp ${profile.electricityRate}/kWh`,
          }}
        />

        <MonthlyGoalCard
          data={{
            title: "Reduce usage by 20% from last month",
            description:
              "You've reached 14% reduction so far. Keep going for that Eco-Badge!",
            baselineKwh: 520,
            targetKwh: 416,
            progressPercent: 70,
          }}
          onUpdatePress={() => {}}
        />

        <AchievementsBadges
          achievements={[
            { id: "1", label: "Eco Starter", emoji: "🌱" },
            { id: "2", label: "Zero Waste Hero", emoji: "🏆" },
            { id: "3", label: "Early Bird", emoji: "🐦" },
          ]}
        />

        {/* Logout */}
        <View className="px-4">
          <Pressable
            onPress={handleLogout}
            disabled={isLoggingOut}
            className="flex-row items-center justify-center gap-2 rounded-3xl border border-red-200 bg-red-50 py-4"
            style={({ pressed }) => ({
              opacity: pressed || isLoggingOut ? 0.6 : 1,
            })}
          >
            {isLoggingOut ? (
              <AppLoading size="sm" color="muted" />
            ) : (
              <>
                <LogOut size={18} color="#EF4444" />
                <Text className="text-base font-semibold text-red-500">
                  Log Out
                </Text>
              </>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
