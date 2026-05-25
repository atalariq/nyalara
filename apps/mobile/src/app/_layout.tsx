// app/_layout.tsx
import { initAuthListener } from '@/features/auth/store/authStore'
import { GeminiChatSheet } from '@/features/chat/components/GeminiChatSheet'
import { LoadingProvider } from '@/providers/LoadingProvider'
import { FloatingChatButton } from '@/shared/components/ui/FloatingChatButton'
import { HamburgerMenu } from '@/shared/components/ui/hamburger/HamburgerMenu'
import { useFonts } from 'expo-font'
import { Stack, useSegments } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import { useEffect } from 'react'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { configureReanimatedLogger, ReanimatedLogLevel } from 'react-native-reanimated'
import Toast from 'react-native-toast-message'
import '../../global.css'

configureReanimatedLogger({ level: ReanimatedLogLevel.warn, strict: false })
SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    'Manrope-Regular': require('@/assets/fonts/Manrope-Regular.ttf'),
    'Manrope-Medium': require('@/assets/fonts/Manrope-Medium.ttf'),
    'Manrope-SemiBold': require('@/assets/fonts/Manrope-SemiBold.ttf'),
    'Manrope-Bold': require('@/assets/fonts/Manrope-Bold.ttf'),
    'Manrope-ExtraBold': require('@/assets/fonts/Manrope-ExtraBold.ttf'),
  })

  const segments = useSegments()
  const isAppRoute = segments[0] === '(app)'

  useEffect(() => {
    const unsubscribe = initAuthListener()
    return () => unsubscribe?.()
  }, [])

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync()
  }, [fontsLoaded])

  if (!fontsLoaded) return null

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <LoadingProvider>
        <Stack screenOptions={{ headerShown: false }} />

        {isAppRoute && (
          <>
            <FloatingChatButton />
            <GeminiChatSheet />
            <HamburgerMenu />
          </>
        )}

        <Toast />
      </LoadingProvider>
    </GestureHandlerRootView>
  )
}
