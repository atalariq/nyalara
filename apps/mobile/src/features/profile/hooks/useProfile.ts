import { useAuthStore } from '@/features/auth/store/authStore'
import { useEffect, useState } from 'react'
import {
  buildProfileSnapshot,
  getInitialProfileState,
} from '../lib/profile-snapshot'
import { profileService } from '../services/profileService'
import type { UserProfile } from '../types/profile.types'

type ProfileState = {
  profile: UserProfile | null
  isLoading: boolean
  error: string | null
  refetch: () => void
}

export function useProfile(): ProfileState {
  const user = useAuthStore((s) => s.user)
  const isAuthLoading = useAuthStore((s) => s.isLoading)
  const initialState = getInitialProfileState({
    authUser: user,
    isAuthLoading,
  })
  const [profile, setProfile] = useState<UserProfile | null>(initialState.profile)
  const [isLoading, setIsLoading] = useState(initialState.isLoading)
  const [error, setError] = useState<string | null>(null)

  async function fetchProfile() {
    if (!user?.uid) {
      setProfile(null)
      setIsLoading(false)
      return
    }

    setIsLoading(false)
    setProfile((current) =>
      buildProfileSnapshot({
        authUser: user,
        storedProfile: current,
      }),
    )
    setError(null)
    try {
      const data = await profileService.getProfile(user.uid)
      setProfile(
        buildProfileSnapshot({
          authUser: user,
          storedProfile: data,
        }),
      )
    } catch (e) {
      setError('Gagal memuat profil')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (isAuthLoading) return
    fetchProfile()
  }, [user?.uid, isAuthLoading])

  return { profile, isLoading, error, refetch: fetchProfile }
}
