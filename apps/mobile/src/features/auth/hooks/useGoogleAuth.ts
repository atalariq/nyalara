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
import { auth } from '@/config/firebase'
import { authService } from '../services/authService'
import { useAuthStore } from '../store/authStore'

let googleSignInConfigured = false

function configureGoogleSignIn() {
  if (googleSignInConfigured) {
    return
  }

  const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID
  const iosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID

  console.log(
    '[auth/google] EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID configured:',
    Boolean(webClientId),
  )
  console.log(
    '[auth/google] EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID configured:',
    Boolean(iosClientId),
  )

  if (!webClientId) {
    throw new Error(
      'Missing EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID for native Google Sign-In.',
    )
  }

  GoogleSignin.configure({
    webClientId,
    iosClientId: iosClientId || undefined,
  })

  googleSignInConfigured = true
}

export function useGoogleAuth() {
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
        return
      }

      if (!isSuccessResponse(response)) {
        throw new Error('Google Sign-In did not return a successful response.')
      }

      const googleIdToken =
        response.data.idToken ?? (await GoogleSignin.getTokens()).idToken

      if (!googleIdToken) {
        throw new Error('Google Sign-In did not return an ID token.')
      }

      console.log(
        '[auth/google] Google ID token exists:',
        Boolean(googleIdToken),
      )

      await authService.loginWithGoogle(googleIdToken)

      const firebaseIdToken = await auth.currentUser?.getIdToken()

      console.log(
        '[auth/google] Firebase ID token exists:',
        Boolean(firebaseIdToken),
      )

      router.replace('/(app)/dashboard')
    } catch (error: unknown) {
      if (isErrorWithCode(error)) {
        console.log('[auth/google] Native sign-in error code:', error.code)

        if (error.code === statusCodes.IN_PROGRESS) {
          console.log('[auth/google] Sign-in already in progress.')
        }

        if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
          console.log('[auth/google] Google Play Services unavailable.')
        }
      }

      if (error instanceof Error) {
        console.log('[auth/google] Native sign-in error:', error.message)
      }
    } finally {
      setLoading(false)
    }
  }

  return { promptAsync, request: null as null }
}
