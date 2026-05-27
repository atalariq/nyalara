// app/_layout.tsx
import { useAuthStore } from '@/features/auth/store/authStore'
import { initAuthListener } from '@/features/auth/store/authStore'
import { LoadingProvider } from '@/providers/LoadingProvider'
import { HamburgerMenu } from '@/shared/components/ui/hamburger/HamburgerMenu'
import { useFonts } from 'expo-font'
import { Stack, useSegments } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import { useEffect, useState } from 'react'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { configureReanimatedLogger, ReanimatedLogLevel } from 'react-native-reanimated'
import Toast from 'react-native-toast-message'
import { shouldHideSplashScreen, shouldRenderNonCriticalOverlays } from './startup-policy'
import { markStartup } from './startup-telemetry'
import '../../global.css'

configureReanimatedLogger({ level: ReanimatedLogLevel.warn, strict: false })
SplashScreen.preventAutoHideAsync()
markStartup('app module initialized')

export default function RootLayout() {
  const isAuthLoading = useAuthStore((s) => s.isLoading)
  const [fontsLoaded] = useFonts({
    'Manrope-Regular': require('@/assets/fonts/Manrope-Regular.ttf'),
    'Manrope-Medium': require('@/assets/fonts/Manrope-Medium.ttf'),
    'Manrope-SemiBold': require('@/assets/fonts/Manrope-SemiBold.ttf'),
    'Manrope-Bold': require('@/assets/fonts/Manrope-Bold.ttf'),
    'Manrope-ExtraBold': require('@/assets/fonts/Manrope-ExtraBold.ttf'),
  })

  const segments = useSegments()
  const isAppRoute = segments[0] === '(app)'
  const [hasPainted, setHasPainted] = useState(false)
  const shellReady = shouldHideSplashScreen({ fontsLoaded, isAuthLoading })

  useEffect(() => {
    markStartup(`fonts loaded: ${fontsLoaded ? 'yes' : 'no'}`)
  }, [fontsLoaded])

  useEffect(() => {
    if (!isAuthLoading) {
      markStartup('auth ready')
    }
  }, [isAuthLoading])

  useEffect(() => {
    markStartup('auth listener init')
    const unsubscribe = initAuthListener()
    return () => unsubscribe?.()
  }, [])

  useEffect(() => {
    if (shellReady) {
      markStartup('splash hide requested')
      SplashScreen.hideAsync()
    }
  }, [shellReady])

  useEffect(() => {
    if (!shellReady || hasPainted) return
    setHasPainted(true)
    markStartup('first paint committed')
  }, [shellReady, hasPainted])

  if (!shellReady) return null

  const shouldRenderOverlays = shouldRenderNonCriticalOverlays({
    shellReady,
    hasPainted,
    isAppRoute,
  })

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <LoadingProvider>
        <Stack screenOptions={{ headerShown: false }} />
        <Toast />
        {shouldRenderOverlays && <HamburgerMenu />}
      </LoadingProvider>
    </GestureHandlerRootView>
  )
}
