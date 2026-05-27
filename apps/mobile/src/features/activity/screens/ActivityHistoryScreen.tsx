import AppLoading from '@/shared/components/feedback/AppLoading'
import { router } from 'expo-router'
import { ArrowLeft } from 'lucide-react-native'
import { FlatList, Pressable, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { ActivitySummaryCards } from '../components/ActivitySummaryCards'
import { DayCard } from '../components/DayCard'
import { useActivityHistory } from '../hooks/useActivityHistory'

export function ActivityHistoryScreen() {
  const insets = useSafeAreaInsets()
  const { entries, isLoading } = useActivityHistory()

  const totalKwh = entries.reduce((sum, day) => sum + day.totalKwh, 0)
  const last7 = entries.slice(0, 7).reduce((sum, d) => sum + d.totalKwh, 0)
  const prev7 = entries.slice(7, 14).reduce((sum, d) => sum + d.totalKwh, 0)
  const efficiencyPercent = prev7 > 0 ? ((last7 - prev7) / prev7) * 100 : 0

  return (
    <View className="flex-1 bg-[#F5F7FA]">
      <FlatList
        data={entries}
        keyExtractor={(item) => item.date}
        contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            <View
              className="flex-row items-center gap-4 px-5 pb-5"
              style={{ paddingTop: insets.top + 12 }}
            >
              <Pressable
                onPress={() => router.back()}
                className="h-11 w-11 items-center justify-center rounded-2xl bg-white"
                style={{ shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 }}
              >
                <ArrowLeft size={18} color="#111111" />
              </Pressable>
              <Text className="font-bold text-[#111]" style={{ fontSize: 28, letterSpacing: -0.8 }}>
                Activity History
              </Text>
            </View>

            <View className="px-5 pb-4">
              <Text className="text-[14px] text-[#777]">
                Last 30 days · {entries.length} day{entries.length !== 1 ? 's' : ''} recorded
              </Text>
            </View>

            {entries.length > 0 && (
              <ActivitySummaryCards totalKWh={totalKwh} efficiencyPercent={efficiencyPercent} />
            )}

            <View className="px-5 pt-2 pb-4">
              <Text className="font-bold text-[#111]" style={{ fontSize: 18, letterSpacing: -0.3 }}>
                Device Activity
              </Text>
            </View>
          </>
        }
        renderItem={({ item }) => <DayCard entry={item} />}
        ListEmptyComponent={
          isLoading ? (
            <View className="items-center pt-20">
              <AppLoading size="md" color="brand" label="Loading activity..." />
            </View>
          ) : (
            <View className="items-center pt-20 px-10">
              <Text className="text-base font-semibold text-[#333] text-center">
                No activity yet
              </Text>
              <Text className="text-sm text-[#888] text-center mt-2">
                Toggle a device ON then OFF to start recording sessions
              </Text>
            </View>
          )
        }
      />
    </View>
  )
}
