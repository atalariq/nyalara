import { useAuthStore } from '@/features/auth/store/authStore'
import AppLoading from '@/shared/components/feedback/AppLoading'
import { Redirect } from 'expo-router'
import { useEffect, useState } from 'react'

export default function Index() {
  const { user, isLoading } = useAuthStore()
  const [route, setRoute] = useState<string | null>(null)

  useEffect(() => {
    if (isLoading) {
      return
    }

    setRoute(user ? '/(app)/dashboard' : '/(onboarding)/welcome')
  }, [isLoading, user])

  if (isLoading) return null

  if (!route) {
    return <AppLoading size="md" label="Loading your setup..." />
  }

  return <Redirect href={route as '/(app)/dashboard' | '/(onboarding)/welcome'} />
}
