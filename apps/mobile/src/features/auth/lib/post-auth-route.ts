export type AuthEntryPoint = 'login' | 'register'

type PostAuthRoute = '/(auth)/register' | '/(onboarding)/intro' | '/(app)/dashboard'

export function getPostAuthRoute({
  entryPoint,
  hasProfile,
}: {
  entryPoint: AuthEntryPoint
  hasProfile?: boolean
}) {
  if (entryPoint === 'register') {
    return {
      action: 'allow' as const,
      route: '/(onboarding)/intro' as PostAuthRoute,
    }
  }

  if (!hasProfile) {
    return {
      action: 'allow' as const,
      route: '/(onboarding)/intro' as PostAuthRoute,
    }
  }

  // A setup-complete account (hasProfile) always goes to dashboard,
  // regardless of device count (CONTEXT.md allows empty device inventory)
  return {
    action: 'allow' as const,
    route: '/(app)/dashboard' as PostAuthRoute,
  }
}
