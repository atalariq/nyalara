// src/app/(app)/_layout.tsx

import { useAuthStore } from '@/features/auth/store/authStore'
import { useActiveDeviceTimer } from '@/features/devices/hooks/useActiveDeviceTimer'
import { useSyncDevices } from '@/features/devices/hooks/useSyncDevices'
import { useSyncEnergyHistory } from '@/features/energy/hooks/useSyncEnergyHistory'

import AppLoading from '@/shared/components/feedback/AppLoading'
import { AppTabBar } from '@/shared/components/ui/AppTabBar'

import { Tabs, router } from 'expo-router'
import { useEffect } from 'react'
import { View } from 'react-native'

function AuthenticatedApp() {
  useSyncDevices()
  useSyncEnergyHistory()
  useActiveDeviceTimer()

  return (
    <Tabs tabBar={(props) => <AppTabBar {...props} />} screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="dashboard" />
      <Tabs.Screen name="energy" />
      <Tabs.Screen name="devices" />
      <Tabs.Screen name="profile" />
      <Tabs.Screen name="energy-history" options={{ href: null }} />
      <Tabs.Screen name="goals" options={{ href: null }} />
    </Tabs>
  )
}

export default function AppLayout() {
  const user = useAuthStore((s) => s.user)
  const isLoading = useAuthStore((s) => s.isLoading)

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/(onboarding)/welcome')
    }
  }, [user, isLoading])

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <AppLoading size="lg" color="brand" />
      </View>
    )
  }

  if (!user) return null

  return <AuthenticatedApp />
}
