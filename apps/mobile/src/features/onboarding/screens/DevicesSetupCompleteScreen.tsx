import { router } from 'expo-router'
import { useEffect, useRef, useState } from 'react'
import { Animated, Pressable, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useDeviceStore } from '../../devices/store/deviceStore'
import { ensureProfile } from '@/features/auth/lib/ensure-profile'

export function DeviceSetupCompleteScreen() {
  const devices = useDeviceStore((s) => s.devices)
  const [isContinuing, setIsContinuing] = useState(false)

  const scaleAnim = useRef(new Animated.Value(0)).current
  const fadeAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 6,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start()
  }, [])

  const totalKwh = devices.reduce((sum, d) => sum + (d.monthlyKwh ?? 0), 0)
  const dailyKwh = totalKwh / 30

  async function handleContinue() {
    setIsContinuing(true)
    await ensureProfile()
    setIsContinuing(false)
    router.replace('/(app)/dashboard')
  }

  return (
    <SafeAreaView className="flex-1 bg-[#25CE7F]">
      {/* Checkmark */}
      <View className="flex-1 items-center justify-center px-6">
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <View className="w-36 h-36 rounded-full bg-white/20 items-center justify-center mb-2">
            <View className="w-28 h-28 rounded-full bg-white/30 items-center justify-center">
              <View className="w-20 h-20 rounded-full bg-white items-center justify-center">
                <Text className="text-[#25CE7F] text-4xl font-bold">✓</Text>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Decorative circles */}
        <View className="absolute top-8 right-12 w-4 h-4 rounded-full bg-white/30" />
        <View className="absolute top-20 left-8 w-2 h-2 rounded-full bg-white/20" />

        {/* Text */}
        <Animated.View style={{ opacity: fadeAnim }} className="items-center">
          <Text className="text-white text-4xl font-extrabold mt-6 mb-3">System Ready.</Text>
          <Text className="text-white/80 text-sm text-center leading-relaxed mb-8">
            Your Nyalara setup is ready.{'\n'}
            You're all set to start building better energy habits.
          </Text>

          {/* Stats cards */}
          <View className="w-full gap-3">
            <View className="bg-white/20 border border-white/25 rounded-2xl px-4 py-4 flex-row items-center gap-3">
              <View className="w-10 h-10 rounded-xl bg-white/20 items-center justify-center">
                <Text className="text-white text-base">📡</Text>
              </View>
              <View>
                <Text className="text-white/70 text-[10px] font-bold tracking-widest uppercase">
                  Network Status
                </Text>
                <Text className="text-white text-base font-bold">
                  {devices.length} Device
                  {devices.length !== 1 ? 's' : ''} Connected
                </Text>
              </View>
            </View>

            <View className="bg-white/20 border border-white/25 rounded-2xl px-4 py-4 flex-row items-center gap-3">
              <View className="w-10 h-10 rounded-xl bg-white/20 items-center justify-center">
                <Text className="text-white text-base">📊</Text>
              </View>
              <View>
                <Text className="text-white/70 text-[10px] font-bold tracking-widest uppercase">
                  Forecasted Efficiency
                </Text>
                <Text className="text-white text-base font-bold">
                  {dailyKwh.toFixed(1)} kWh/day Estimated Usage
                </Text>
              </View>
            </View>
          </View>
        </Animated.View>
      </View>

      {/* CTA */}
      <View className="px-5 pb-8">
        <Pressable
          onPress={handleContinue}
          disabled={isContinuing}
          className="bg-white rounded-full py-4 flex-row items-center justify-center gap-2"
          style={{ opacity: isContinuing ? 0.7 : 1 }}
        >
          <Text className="text-[#0E0E0E] text-base font-semibold">
            {isContinuing ? 'Loading...' : 'Go to Dashboard'}
          </Text>
          {!isContinuing && <Text className="text-[#0E0E0E] text-base">→</Text>}
        </Pressable>
      </View>
    </SafeAreaView>
  )
}
