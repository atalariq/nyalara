import type { UserProfile } from '../types/profile.types'

type AuthProfileUser = {
  uid: string
  displayName: string | null
  email: string | null
  photoURL: string | null
  isAnonymous: boolean
}

const DEFAULT_ELECTRICITY_RATE = 1444
const DEFAULT_EMISSION_FACTOR = 0.436

export function buildProfileSnapshot({
  authUser,
  storedProfile,
  nowMs = Date.now(),
}: {
  authUser: AuthProfileUser | null
  storedProfile: UserProfile | null
  nowMs?: number
}): UserProfile | null {
  if (storedProfile) {
    return {
      ...storedProfile,
      photoURL: storedProfile.photoURL ?? authUser?.photoURL ?? undefined,
      email: storedProfile.email || authUser?.email || '',
    }
  }

  if (!authUser) {
    return null
  }

  return {
    uid: authUser.uid,
    displayName:
      authUser.displayName ?? (authUser.isAnonymous ? 'Guest User' : 'User'),
    email: authUser.email ?? '',
    electricityRate: DEFAULT_ELECTRICITY_RATE,
    emissionFactor: DEFAULT_EMISSION_FACTOR,
    photoURL: authUser.photoURL ?? undefined,
    residence: undefined,
    residents: undefined,
    city: undefined,
    createdAt: nowMs,
    updatedAt: nowMs,
  }
}

export function getInitialProfileState({
  authUser,
  isAuthLoading,
  nowMs = Date.now(),
}: {
  authUser: AuthProfileUser | null
  isAuthLoading: boolean
  nowMs?: number
}) {
  const profile = buildProfileSnapshot({
    authUser,
    storedProfile: null,
    nowMs,
  })

  return {
    profile,
    isLoading: Boolean(isAuthLoading && !profile),
  }
}
