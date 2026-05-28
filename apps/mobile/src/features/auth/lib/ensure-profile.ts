// features/auth/lib/ensure-profile.ts
import { useAuthStore } from '@/features/auth/store/authStore'
import { profileService } from '@/features/profile/services/profileService'
import { CARBON_CONFIG } from '@/shared/config/carbonConfig'

/**
 * Ensures the current authenticated user has a profile document.
 * Creates one with sensible defaults if it does not exist.
 * This is idempotent — safe to call multiple times.
 */
export async function ensureProfile(): Promise<void> {
  const user = useAuthStore.getState().user
  if (!user) {
    return
  }

  try {
    const existing = await profileService.getProfile(user.uid)
    if (existing) {
      return
    }
  } catch {
    // getProfile may fail for various reasons; fall through and try to create.
  }

  try {
    await profileService.createProfile({
      uid: user.uid,
      displayName: user.displayName ?? (user.isAnonymous ? 'Guest User' : 'User'),
      email: user.email ?? '',
      electricityRate: CARBON_CONFIG.electricityRate,
      emissionFactor: CARBON_CONFIG.emissionFactor,
    })
  } catch (e) {
    // Best-effort: do not block navigation on profile creation failure.
    // AppLayout has a fallback that returns isSetupComplete=true on errors.
    console.warn('[ensureProfile] Profile creation failed:', e)
  }
}
