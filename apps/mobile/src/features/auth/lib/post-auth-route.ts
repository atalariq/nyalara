export type AuthEntryPoint = 'login' | 'register'

type PostAuthRoute = '/(auth)/register' | '/(onboarding)/intro' | '/(app)/dashboard'

export function getPostAuthRoute({
  entryPoint,
  hasProfile,
  deviceCount = 0,
}: {
  entryPoint: AuthEntryPoint
  hasProfile?: boolean
  deviceCount?: number
}) {
  if (entryPoint === 'register') {
    return {
      action: 'allow' as const,
      route: '/(onboarding)/intro' as PostAuthRoute,
    }
  }

  if (!hasProfile) {
    return {
      action: 'reject' as const,
      route: '/(auth)/register' as PostAuthRoute,
    }
  }

  if (deviceCount < 1) {
    return {
      action: 'allow' as const,
      route: '/(onboarding)/intro' as PostAuthRoute,
    }
  }

  return {
    action: 'allow' as const,
    route: '/(app)/dashboard' as PostAuthRoute,
  }
}
