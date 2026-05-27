import { zodResolver } from '@hookform/resolvers/zod'
import { router } from 'expo-router'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import Toast from 'react-native-toast-message'
import { z } from 'zod'
import { authService } from '../services/authService'
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
      await authService.register(data.email, data.password, data.fullName)
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
      Toast.show({
        type: 'success',
        text1: 'Logged in',
        text2: 'Welcome back.',
        visibilityTime: 1600,
      })
      setLoading(false)
      router.replace('/(app)/dashboard')
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
