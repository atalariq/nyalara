import { db } from "@/config/firebase";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import type { UserProfile } from "../types/profile.types";

const COLLECTION = "userProfiles";

function toUserProfile(uid: string, data: any): UserProfile {
  return {
    uid,
    displayName: data.displayName ?? "",
    email: data.email ?? "",
    electricityRate: data.electricityRate ?? 1444,
    emissionFactor: data.emissionFactor ?? 0.436,
    photoURL: data.photoURL,
    residence: data.residence,
    residents: data.residents,
    city: data.city,
    createdAt: data.createdAt?.toDate?.().getTime() ?? Date.now(),
    updatedAt: data.updatedAt?.toDate?.().getTime() ?? Date.now(),
  };
}

export const profileService = {
  async getProfile(uid: string): Promise<UserProfile | null> {
    const ref = doc(db, COLLECTION, uid);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    return toUserProfile(uid, snap.data());
  },

  async createProfile(
    payload: Pick<
      UserProfile,
      "uid" | "displayName" | "email" | "electricityRate" | "emissionFactor"
    >,
  ): Promise<void> {
    const ref = doc(db, COLLECTION, payload.uid);
    await setDoc(ref, {
      ...payload,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  },

  async updateProfile(
    uid: string,
    payload: Partial<Omit<UserProfile, "uid" | "createdAt">>,
  ): Promise<void> {
    const ref = doc(db, COLLECTION, uid);
    await setDoc(
      ref,
      { ...payload, updatedAt: serverTimestamp() },
      { merge: true },
    );
  },
};
