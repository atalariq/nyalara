import { useAuthStore } from "@/features/auth/store/authStore";
import { useEffect, useState } from "react";
import { profileService } from "../services/profileService";
import type { UserProfile } from "../types/profile.types";

type ProfileState = {
  profile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
};

export function useProfile(): ProfileState {
  const user = useAuthStore((s) => s.user);
  const isAuthLoading = useAuthStore((s) => s.isLoading);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchProfile() {
    if (!user?.uid) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const data = await profileService.getProfile(user.uid);

      if (!data) {
        await profileService.createProfile({
          uid: user.uid,
          displayName: user.displayName ?? "User",
          email: user.email ?? "",
          electricityRate: 1444,
          emissionFactor: 0.436,
        });
        const created = await profileService.getProfile(user.uid);
        setProfile(created);
      } else {
        setProfile(data);
      }
    } catch (e) {
      setError("Gagal memuat profil");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (isAuthLoading) return;
    fetchProfile();
  }, [user?.uid, isAuthLoading]);

  return { profile, isLoading, error, refetch: fetchProfile };
}
