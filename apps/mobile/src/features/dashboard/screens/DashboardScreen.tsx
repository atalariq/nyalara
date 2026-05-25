import { useAuthStore } from '@/features/auth/store/authStore'
import { useActiveDeviceTimer } from '@/features/devices/hooks/useActiveDeviceTimer'
import { useHamburgerStore } from '@/shared/components/ui/HamburgerMenu/HamburgerStore'
import { Menu } from 'lucide-react-native'
import { Pressable, ScrollView, Text, View } from 'react-native'
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
  const open = useHamburgerStore((s) => s.open)

  useActiveDeviceTimer()

  const stats = useDashboardStats()
  const insight = useDashboardAI(stats)

  const displayName = user?.displayName?.split(' ')[0] ?? 'User'
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  })

  return (
    <SafeAreaView className="flex-1 bg-brand">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 140 }}
      >
        <View className="flex-row items-center justify-between px-6 pt-3 pb-5">
          <Pressable
            onPress={open}
            hitSlop={12}
            style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
          >
            <Menu size={26} color="#FFFFFF" strokeWidth={2} />
          </Pressable>

          <View className="w-15 h-16 rounded-full bg-white/20 items-center justify-center">
            <Text className="text-white text-12px">Logo</Text>
          </View>
        </View>

        <DashboardHeader displayName={displayName} dateLabel={today} />

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
