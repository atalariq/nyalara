// src/features/auth/store/authStore.ts

import { auth } from '@/config/firebase'

import { onAuthStateChanged, User } from 'firebase/auth'

import { create } from 'zustand'

type AuthState = {
  user: User | null
  isLoading: boolean

  setUser: (user: User | null) => void
  setLoading: (value: boolean) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,

  setUser: (user) => set({ user }),

  setLoading: (value) => set({ isLoading: value }),
}))

let initialAuthResolved = false
let resolveInitialAuth: (() => void) | null = null

const initialAuthPromise = new Promise<void>((resolve) => {
  resolveInitialAuth = resolve
})

export function waitForAuthInitialization(): Promise<void> {
  if (initialAuthResolved) {
    return Promise.resolve()
  }

  return initialAuthPromise
}

// Panggil SEKALI di root layout
export function initAuthListener() {
  return onAuthStateChanged(auth, (user) => {
    useAuthStore.getState().setUser(user)
    useAuthStore.getState().setLoading(false)

    if (!initialAuthResolved) {
      initialAuthResolved = true
      resolveInitialAuth?.()
    }
  })
}
