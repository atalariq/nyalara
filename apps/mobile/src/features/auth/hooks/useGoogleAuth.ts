import {
  GoogleSignin,
  isCancelledResponse,
  isErrorWithCode,
  isSuccessResponse,
  statusCodes,
} from '@react-native-google-signin/google-signin'
import { router } from 'expo-router'
import { useEffect } from 'react'
import { Platform } from 'react-native'
import Toast from 'react-native-toast-message'
import { auth } from '@/config/firebase'
import { getPostAuthRoute, type AuthEntryPoint } from '../lib/post-auth-route'
import { setupStatusService } from '../services/app-setup-status-service'
import { authService } from '../services/authService'
import { useAuthStore } from '../store/authStore'

let googleSignInConfigured = false

function configureGoogleSignIn() {
  if (googleSignInConfigured) {
    return
  }

  const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID
  const iosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID

  console.log('[auth/google] EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID configured:', Boolean(webClientId))
  console.log('[auth/google] EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID configured:', Boolean(iosClientId))

  if (!webClientId) {
    throw new Error('Missing EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID for native Google Sign-In.')
  }

  GoogleSignin.configure({
    webClientId,
    iosClientId: iosClientId || undefined,
  })

  googleSignInConfigured = true
}

export function useGoogleAuth(entryPoint: AuthEntryPoint = 'login') {
  const { setLoading } = useAuthStore()

  useEffect(() => {
    try {
      configureGoogleSignIn()
    } catch (error) {
      if (error instanceof Error) {
        console.log('[auth/google] Configuration error:', error.message)
      }
    }
  }, [])

  const promptAsync = async () => {
    try {
      setLoading(true)

      configureGoogleSignIn()

      if (Platform.OS === 'android') {
        await GoogleSignin.hasPlayServices({
          showPlayServicesUpdateDialog: true,
        })
      }

      const response = await GoogleSignin.signIn()

      if (isCancelledResponse(response)) {
        Toast.show({
          type: 'info',
          text1: 'Google sign-in cancelled',
          text2: 'No changes were made.',
          visibilityTime: 1800,
        })
        return
      }

      if (!isSuccessResponse(response)) {
        throw new Error('Google Sign-In did not return a successful response.')
      }

      const googleIdToken = response.data.idToken ?? (await GoogleSignin.getTokens()).idToken

      if (!googleIdToken) {
        throw new Error('Google Sign-In did not return an ID token.')
      }

      console.log('[auth/google] Google ID token exists:', Boolean(googleIdToken))

      const { user } = await authService.loginWithGoogle(googleIdToken)

      const firebaseIdToken = await auth.currentUser?.getIdToken()

      console.log('[auth/google] Firebase ID token exists:', Boolean(firebaseIdToken))

      const status = await setupStatusService.getStatus(user.uid)
      const next = getPostAuthRoute({
        entryPoint,
        hasProfile: status.hasProfile,
        deviceCount: status.deviceCount,
      })

      if (next.action === 'reject') {
        await authService.logout()
        Toast.show({
          type: 'error',
          text1: 'Account not found',
          text2: 'Please register first before logging in with Google.',
          visibilityTime: 2600,
        })
      } else {
        Toast.show({
          type: 'success',
          text1: 'Signed in with Google',
          visibilityTime: 1600,
        })
      }

      router.replace(next.route)
    } catch (error: unknown) {
      let errorText = 'Please try again.'

      if (isErrorWithCode(error)) {
        console.log('[auth/google] Native sign-in error code:', error.code)

        if (error.code === statusCodes.IN_PROGRESS) {
          console.log('[auth/google] Sign-in already in progress.')
          errorText = 'A sign-in request is already running.'
        }

        if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
          console.log('[auth/google] Google Play Services unavailable.')
          errorText = 'Google Play Services is unavailable on this device.'
        }
      }

      if (error instanceof Error) {
        console.log('[auth/google] Native sign-in error:', error.message)
        if (error.message.includes('ID token') || error.message.includes('successful response')) {
          errorText = error.message
        }
      }

      Toast.show({
        type: 'error',
        text1: 'Google sign-in failed',
        text2: errorText,
        visibilityTime: 2600,
      })
    } finally {
      setLoading(false)
    }
  }

  return { promptAsync, request: null as null }
}
