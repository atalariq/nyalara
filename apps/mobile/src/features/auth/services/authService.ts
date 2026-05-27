// features/auth/services/authService.ts
import { auth } from '@/config/firebase'
import { GoogleSignin } from '@react-native-google-signin/google-signin'
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInAnonymously,
  signInWithCredential,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  type User,
} from 'firebase/auth'

export const authService = {
  async register(email: string, password: string, fullName: string): Promise<User> {
    const { user } = await createUserWithEmailAndPassword(auth, email, password)
    await updateProfile(user, { displayName: fullName })
    return user as User
  },

  async login(email: string, password: string): Promise<void> {
    await signInWithEmailAndPassword(auth, email, password)
  },

  async loginWithGoogle(idToken: string) {
    const credential = GoogleAuthProvider.credential(idToken)
    return signInWithCredential(auth, credential)
  },

  async loginAsGuest(): Promise<void> {
    await signInAnonymously(auth)
  },

  async logout(): Promise<void> {
    try {
      await GoogleSignin.signOut()
    } catch {
      // Ignore provider-specific sign-out failures so Firebase sign-out still completes.
    }

    await signOut(auth)
  },
}
