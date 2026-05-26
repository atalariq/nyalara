export type AuthEntryPoint = 'login' | 'register'

export function getPostAuthRoute({
  entryPoint,
}: {
  entryPoint: AuthEntryPoint
}) {
  if (entryPoint === 'register') {
    return '/(onboarding)/intro'
  }

  return '/(app)/dashboard'
}
