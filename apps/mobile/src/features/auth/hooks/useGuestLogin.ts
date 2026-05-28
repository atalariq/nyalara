// features/auth/hooks/useGuestLogin.ts
import { router } from 'expo-router'
import { useState } from 'react'
import Toast from 'react-native-toast-message'
import { ensureProfile } from '../lib/ensure-profile'
import { authService } from '../services/authService'

export function useGuestLogin() {
  const [isLoading, setIsLoading] = useState(false)

  async function loginAsGuest() {
    setIsLoading(true)
    try {
      await authService.loginAsGuest()

      // Create a profile for guests so they can skip onboarding without looping
      await ensureProfile()

      Toast.show({
        type: 'success',
        text1: 'Guest mode enabled',
        text2: 'Some features may be limited.',
        visibilityTime: 2000,
      })
      router.replace('/(onboarding)/intro')
    } catch (e) {
      console.error('Guest login failed:', e)
      Toast.show({
        type: 'error',
        text1: 'Guest login failed',
        text2: 'Please check your connection and try again.',
        visibilityTime: 2500,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return { loginAsGuest, isLoading }
}
