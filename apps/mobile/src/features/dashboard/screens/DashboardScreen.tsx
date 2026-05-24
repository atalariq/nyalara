// features/dashboard/screens/DashboardScreen.tsx
import { useAuthStore } from '@/features/auth/store/authStore'
import { useActiveDeviceTimer } from '@/features/devices/hooks/useActiveDeviceTimer'
import { ScrollView, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import {
  DashboardDailyImpact,
  DashboardHeader,
  DashboardMainStats,
  DashboardProgress,
  DashboardRecommendations,
} from '../components'
import { useDashboardAI } from '../hooks/useDashboardAI'
import { useDashboardStats } from '../hooks/useDashboardStats'

const DAILY_GOAL_KWH = 5

export default function DashboardScreen() {
  const user = useAuthStore((s) => s.user)

  // Aktifkan timer flush — ini yang nulis kWh ke Firestore setiap 10 detik
  useActiveDeviceTimer()

  const stats = useDashboardStats() // baca dari Firestore today
  const insight = useDashboardAI(stats)

  const displayName = user?.displayName?.split(' ')[0] ?? 'User'
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  })

  return (
    <SafeAreaView className="flex-1 bg-[#F4F6F5]">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 140 }}
      >
        <DashboardHeader
          displayName={displayName}
          dateLabel={today}
          dailyTip={insight.dailyTip}
          isLoadingTip={insight.status === 'loading'}
        />
        <View className="mx-5 mt-7 rounded-[32px] bg-white p-5 shadow-sm shadow-black/10">
          <View className="flex-row justify-between gap-4">
            <DashboardMainStats
              dailyKwh={stats.dailyKwh}
              progress={stats.progress}
            />
            <DashboardDailyImpact
              savedKwh={stats.savedKwh}
              co2ReducedKg={stats.co2ReducedKg}
            />
          </View>
        </View>
        <DashboardProgress
          dailyGoalKwh={DAILY_GOAL_KWH}
          remaining={stats.remaining}
          progress={stats.progress}
        />
        <DashboardRecommendations
          recommendations={insight.recommendations}
          status={insight.status}
        />
      </ScrollView>
    </SafeAreaView>
  )
}
