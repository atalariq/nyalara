// features/auth/services/authService.ts
import { auth } from "@/config/firebase";
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInAnonymously,
  signInWithCredential,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";

export const authService = {
  async register(
    email: string,
    password: string,
    fullName: string,
  ): Promise<void> {
    const { user } = await createUserWithEmailAndPassword(
      auth,
      email,
      password,
    );
    await updateProfile(user, { displayName: fullName });
  },

  async login(email: string, password: string): Promise<void> {
    await signInWithEmailAndPassword(auth, email, password);
  },

  async loginWithGoogle(idToken: string): Promise<void> {
    const credential = GoogleAuthProvider.credential(idToken);
    await signInWithCredential(auth, credential);
  },

  async loginAsGuest(): Promise<void> {
    await signInAnonymously(auth);
  },

  async logout(): Promise<void> {
    await signOut(auth);
  },
};
