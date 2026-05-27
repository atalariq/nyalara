import { zodResolver } from '@hookform/resolvers/zod'
import { auth } from '@/config/firebase'
import { router } from 'expo-router'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import Toast from 'react-native-toast-message'
import { z } from 'zod'
import { CARBON_CONFIG } from '@/shared/config/carbonConfig'
import { getPostAuthRoute } from '../lib/post-auth-route'
import { setupStatusService } from '../services/app-setup-status-service'
import { authService } from '../services/authService'
import { profileService } from '@/features/profile/services/profileService'
import { useAuthStore } from '../store/authStore'
import type { LoginFormData, RegisterFormData } from '../types/auth.types'

const registerSchema = z.object({
  fullName: z.string().min(2, 'Minimum 2 characters'),
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Minimum 6 characters'),
})

const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Minimum 6 characters'),
})

function parseFirebaseError(err: any): string {
  const code = err?.code as string
  const map: Record<string, string> = {
    'auth/email-already-in-use': 'Email already registered.',
    'auth/invalid-email': 'Invalid email address.',
    'auth/weak-password': 'Password is too weak.',
    'auth/user-not-found': 'No account found with this email.',
    'auth/wrong-password': 'Incorrect password.',
    'auth/invalid-credential': 'Incorrect email or password.',
    'auth/too-many-requests': 'Too many attempts. Try again later.',
    'auth/network-request-failed': 'Network error. Check your connection.',
  }
  return map[code] ?? 'Something went wrong. Please try again.'
}

export const useRegisterForm = () => {
  const { isLoading, setLoading } = useAuthStore()
  const [error, setError] = useState<string | null>(null)

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = form.handleSubmit(async (data) => {
    try {
      setError(null)
      setLoading(true)
      const user = await authService.register(data.email, data.password, data.fullName)

      try {
        await profileService.createProfile({
          uid: user.uid,
          displayName: data.fullName,
          email: data.email,
          electricityRate: CARBON_CONFIG.electricityRate,
          emissionFactor: CARBON_CONFIG.emissionFactor,
        })
      } catch (profileErr) {
        console.warn(
          '[auth/register] Profile creation failed; user can retry from profile screen:',
          profileErr,
        )
      }

      Toast.show({
        type: 'success',
        text1: 'Account created',
        text2: 'Welcome to Nyalara.',
        visibilityTime: 1800,
      })
      setLoading(false)
      router.replace('/(onboarding)/intro')
    } catch (err: any) {
      const message = parseFirebaseError(err)
      setError(message)
      Toast.show({
        type: 'error',
        text1: 'Sign up failed',
        text2: message,
        visibilityTime: 2600,
      })
      setLoading(false)
    }
  })

  return { form, onSubmit, error, isLoading }
}

export const useLoginForm = () => {
  const { isLoading, setLoading } = useAuthStore()
  const [error, setError] = useState<string | null>(null)

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = form.handleSubmit(async (data) => {
    try {
      setError(null)
      setLoading(true)
      await authService.login(data.email, data.password)
      const user = auth.currentUser
      const status = user ? await setupStatusService.getStatus(user.uid) : null
      const next = getPostAuthRoute({
        entryPoint: 'login',
        hasProfile: status?.hasProfile ?? false,
      })

      if (next.action === 'reject') {
        await authService.logout()
        Toast.show({
          type: 'error',
          text1: 'Account not found',
          text2: 'Please register first before logging in.',
          visibilityTime: 2600,
        })
        setLoading(false)
        return
      }

      Toast.show({
        type: 'success',
        text1: 'Logged in',
        text2: 'Welcome back.',
        visibilityTime: 1800,
      })
      setLoading(false)
      router.replace(next.route)
    } catch (err: any) {
      const message = parseFirebaseError(err)
      setError(message)
      Toast.show({
        type: 'error',
        text1: 'Login failed',
        text2: message,
        visibilityTime: 2600,
      })
      setLoading(false)
    }
  })

  return { form, onSubmit, error, isLoading }
}
