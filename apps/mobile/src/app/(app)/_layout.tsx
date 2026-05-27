// src/app/(app)/_layout.tsx

import { setupStatusService } from '@/features/auth/services/app-setup-status-service'
import { useAuthStore } from '@/features/auth/store/authStore'
import { useActiveDeviceTimer } from '@/features/devices/hooks/useActiveDeviceTimer'
import { useSyncDevices } from '@/features/devices/hooks/useSyncDevices'
import { useSyncEnergyHistory } from '@/features/energy/hooks/useSyncEnergyHistory'

import AppLoading from '@/shared/components/feedback/AppLoading'
import { AppTabBar } from '@/shared/components/ui/AppTabBar'

import { Tabs, router } from 'expo-router'
import { useEffect, useState } from 'react'
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
  const [isCheckingSetup, setIsCheckingSetup] = useState(false)

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/(onboarding)/welcome')
    }
  }, [user, isLoading])

  useEffect(() => {
    let active = true

    async function enforceSetup() {
      if (isLoading || !user?.uid) {
        return
      }

      setIsCheckingSetup(true)

      try {
        const status = await setupStatusService.getStatus(user.uid)

        if (!active || status.isSetupComplete) {
          return
        }

        router.replace('/(onboarding)/intro')
      } catch {
        // On failure, allow access to avoid trapping users in onboarding loop
      } finally {
        if (active) {
          setIsCheckingSetup(false)
        }
      }
    }

    void enforceSetup()

    return () => {
      active = false
    }
  }, [user?.uid, isLoading])

  if (isLoading || isCheckingSetup) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <AppLoading size="lg" color="brand" label="Loading your setup..." />
      </View>
    )
  }

  if (!user) return null

  return <AuthenticatedApp />
}
