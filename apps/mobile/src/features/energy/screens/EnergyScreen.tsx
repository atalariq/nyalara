import AppLoading from '@/shared/components/feedback/AppLoading'
import { LinearGradient } from 'expo-linear-gradient'
import { ScrollView, Text, View } from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'

import { ActiveDevicesList } from '../components/ActiveDevicesList'
import { EnergyBarChart } from '../components/EnergyBarChart'
import { EnergyStatusPill } from '../components/EnergyStatusPill'
import { EnvironmentalImpact } from '../components/EnvironmentalImpact'
import { useEnergyScreenData } from '../hooks/useEnergyScreenData'
import type { EfficiencyLevel } from '../utils/energyEfficiency'

const EFFICIENCY_STYLES: Record<EfficiencyLevel, { bg: string; text: string }> = {
  efficient: { bg: 'bg-brand', text: 'text-white' },
  moderate: { bg: 'bg-[#F3D3B7]', text: 'text-[#6A4A2F]' },
  inefficient: { bg: 'bg-red-100', text: 'text-red-700' },
}

export default function EnergyScreen() {
  const insets = useSafeAreaInsets()
  const {
    today,
    history,
    isLoading,
    error,
    todayKwh,
    comparedToYesterday,
    co2ReducedKg,
    insight,
    efficiency,
  } = useEnergyScreenData()

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-[#ECECEC]">
        <AppLoading size="md" label="Loading energy data..." />
      </SafeAreaView>
    )
  }

  if (error) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-[#ECECEC]">
        <Text className="text-sm text-[#666]">{error}</Text>
      </SafeAreaView>
    )
  }

  const efficiencyStyle = EFFICIENCY_STYLES[efficiency.level]

  return (
    <View className="flex-1 bg-brand">
      <LinearGradient
        colors={['#1FDD7A', '#45E39F']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
      />

      <View
        style={{
          position: 'absolute',
          top: -100,
          right: -70,
          width: 240,
          height: 240,
          borderRadius: 999,
          backgroundColor: 'rgba(255,255,255,0.1)',
        }}
      />

      <SafeAreaView edges={['top']} className="flex-1">
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1 }}
        >
          <EnergyStatusPill comparedToYesterday={comparedToYesterday} />

          {/* HERO CARD */}
          <View className="mt-4 px-4">
            <View className="overflow-hidden rounded-[34px] bg-[#F7F7F7] px-6 py-6">
              <View className="absolute bottom-0 left-0 h-16 w-16 rounded-tr-[20px] bg-[#DDF6E8]" />
              <View className="absolute bottom-0 right-0 h-24 w-24 rounded-tl-[24px] bg-[#DDF6E8]" />

              <Text className="text-center text-xl font-semibold tracking-[2px] text-[#555]">
                CURRENT USAGE
              </Text>

              <View className="mt-3 flex-row items-start justify-center">
                <Text className="text-[68px] font-black leading-[72px] text-[#1B1B1B]">
                  {todayKwh.toFixed(1)}
                </Text>
                <Text className="mt-5 ml-2 text-[24px] text-[#2A2A2A]">kWh</Text>
              </View>

              <View className="mt-2 items-center gap-2">
                <View className="rounded-full bg-brand px-4 py-2">
                  <Text className="text-xs font-semibold text-white">
                    {comparedToYesterday
                      ? `${Math.abs(comparedToYesterday).toFixed(0)}% lower than yesterday`
                      : 'Energy usage stable'}
                  </Text>
                </View>

                <View className={`rounded-full px-4 py-2 ${efficiencyStyle.bg}`}>
                  <Text className={`text-xs font-semibold ${efficiencyStyle.text}`}>
                    {efficiency.label}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* AI INSIGHTS */}
          <View
            className="mt-8 flex-1 overflow-hidden rounded-t-[52px] bg-[#F7F7F7] px-5 pt-8"
            style={{
              paddingBottom: insets.bottom + 100,
              shadowColor: '#000',
              shadowOpacity: 0.04,
              shadowRadius: 18,
              shadowOffset: { width: 0, height: -4 },
              elevation: 2,
            }}
          >
            <View className="flex-row items-center justify-between px-1">
              <Text className="font-extrabold text-[46px] tracking-[-2px] text-foreground">
                AI Insights
              </Text>
              <Text className="font-semibold text-[18px] text-foreground-secondary">View All</Text>
            </View>

            <View
              className="mt-7 rounded-[34px] bg-white p-5"
              style={{
                shadowColor: '#000',
                shadowOpacity: 0.06,
                shadowRadius: 16,
                shadowOffset: { width: 0, height: 6 },
                elevation: 4,
              }}
            >
              <ActiveDevicesList today={today} />
            </View>

            <View
              className="mt-6 rounded-[34px] bg-white px-5 py-6"
              style={{
                shadowColor: '#000',
                shadowOpacity: 0.06,
                shadowRadius: 16,
                shadowOffset: { width: 0, height: 6 },
                elevation: 4,
              }}
            >
              <View className="mb-5 flex-row items-center justify-between">
                <Text className="font-semibold text-[17px] text-brand">Weekly Usage Flow</Text>
                <Text className="text-[15px] text-brand">Mon — Sun</Text>
              </View>
              <EnergyBarChart history={history} />
            </View>

            <View
              className="mt-6 rounded-[34px] bg-white px-5 py-6"
              style={{
                shadowColor: '#000',
                shadowOpacity: 0.06,
                shadowRadius: 16,
                shadowOffset: { width: 0, height: 6 },
                elevation: 4,
              }}
            >
              <EnvironmentalImpact
                co2ReducedKg={co2ReducedKg}
                environmentalQuote={insight.environmentalQuote}
                isLoading={insight.status === 'loading'}
              />
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  )
}
