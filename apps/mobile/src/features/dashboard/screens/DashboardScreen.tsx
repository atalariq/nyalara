import { useAuthStore } from '@/features/auth/store/authStore'
import { useActiveDeviceTimer } from '@/features/devices/hooks/useActiveDeviceTimer'
import { useHamburgerStore } from '@/shared/components/ui/hamburger/HamburgerStore'
import { LinearGradient } from 'expo-linear-gradient'
import { Menu } from 'lucide-react-native'
import { Pressable, ScrollView, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useCarbonBudget } from '@/features/carbon-budget/hooks/useCarbonBudget'
import { Image } from 'react-native'

import {
  DashboardDailyImpact,
  DashboardHeader,
  DashboardMainStats,
  DashboardProgress,
  DashboardRecommendations,
} from '../components'

import { useDashboardAI } from '../hooks/useDashboardAI'
import { useDashboardStats } from '../hooks/useDashboardStats'
import { useDevices } from '@/features/devices/hooks/useDevices'
import { useEnergyHistory } from '@/features/energy/hooks/useEnergyHistory'

export default function DashboardScreen() {
  const user = useAuthStore((s) => s.user)
  const open = useHamburgerStore((s) => s.open)
  const { monthlyBudgetKwh } = useCarbonBudget()
  const dailyTargetKwh = monthlyBudgetKwh / 30

  useActiveDeviceTimer()
  const { devices } = useDevices()
  const { today: todayUsage } = useEnergyHistory()
  const stats = useDashboardStats()
  const insight = useDashboardAI({ stats, devices, today: todayUsage })

  const displayName = user?.displayName?.split(' ')[0] ?? 'User'

  const todayLabel = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  })

  return (
    <View className="flex-1 bg-[#EEF7F1]">
      {/* TOP GRADIENT */}
      <LinearGradient
        colors={['#28D67B', '#6BE7B2']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 280,
        }}
      />

      {/* BACKGROUND BLOBS */}
      <View
        style={{
          position: 'absolute',
          top: 150,
          left: -80,
          width: 240,
          height: 240,
          borderRadius: 999,
          backgroundColor: 'rgba(255,255,255,0.5)',
        }}
      />

      <View
        style={{
          position: 'absolute',
          top: 120,
          right: -100,
          width: 280,
          height: 280,
          borderRadius: 999,
          backgroundColor: 'rgba(255,255,255,0.45)',
        }}
      />

      <SafeAreaView className="flex-1">
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 140 }}
        >
          {/* TOP BAR */}
          <View className="flex-row items-center justify-between px-6 pt-3 pb-5">
            <Pressable
              onPress={open}
              hitSlop={12}
              style={({ pressed }) => ({
                opacity: pressed ? 0.6 : 1,
              })}
            >
              <Menu size={26} color="#FFFFFF" strokeWidth={2} />
            </Pressable>
            <View className="h-14 w-14 items-center justify-center rounded-full ">
              <Image
                source={require('@/assets/images/icon.png')}
                className="h-10 w-10"
                resizeMode="contain"
              />
            </View>
          </View>

          {/* HEADER */}
          <DashboardHeader displayName={displayName} dateLabel={todayLabel} />

          {/* MAIN CARD */}
          <View className="mx-5 mt-7 rounded-[32px] bg-white/90 p-5 shadow-sm shadow-black/10">
            <View className="flex-row justify-between gap-4">
              <DashboardMainStats dailyKwh={stats.dailyKwh} progress={stats.progress} />

              <DashboardDailyImpact savedKwh={stats.savedKwh} co2ReducedKg={stats.co2ReducedKg} />
            </View>
          </View>

          {/* PROGRESS */}
          <DashboardProgress
            dailyGoalKwh={dailyTargetKwh}
            remaining={stats.remaining}
            progress={stats.progress}
          />

          {/* RECOMMENDATIONS */}
          <DashboardRecommendations
            recommendations={insight.recommendations}
            status={insight.status}
            hasDevices={devices.length > 0}
          />
        </ScrollView>
      </SafeAreaView>
    </View>
  )
}
