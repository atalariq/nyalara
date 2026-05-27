import { useAuthStore } from '@/features/auth/store/authStore'
import { setupStatusService } from '@/features/auth/services/app-setup-status-service'
import AppLoading from '@/shared/components/feedback/AppLoading'
import { Redirect } from 'expo-router'
import { useEffect, useState } from 'react'

export default function Index() {
  const { user, isLoading } = useAuthStore()
  const [route, setRoute] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    async function resolveRoute() {
      if (isLoading) {
        return
      }

      if (!user) {
        setRoute('/(onboarding)/welcome')
        return
      }

      const status = await setupStatusService.getStatus(user.uid)

      if (!active) return

      setRoute(status.isSetupComplete ? '/(app)/dashboard' : '/(onboarding)/intro')
    }

    void resolveRoute()

    return () => {
      active = false
    }
  }, [isLoading, user])

  if (isLoading) return null

  if (!route) {
    return <AppLoading size="md" label="Loading your setup..." />
  }

  return (
    <Redirect
      href={route as '/(app)/dashboard' | '/(onboarding)/welcome' | '/(onboarding)/intro'}
    />
  )
}
