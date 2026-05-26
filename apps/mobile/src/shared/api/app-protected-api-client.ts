import { auth } from '../../config/firebase'
import { waitForAuthInitialization } from '../../features/auth/store/authStore'
import { createProtectedApiClient } from './protected-api-client'

export const protectedApiClient = createProtectedApiClient({
  authInstance: auth,
  baseUrl: process.env.EXPO_PUBLIC_API_BASE_URL ?? '',
  waitForAuthReady: waitForAuthInitialization,
})
