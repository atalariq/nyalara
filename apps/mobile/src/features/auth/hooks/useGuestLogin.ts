// features/auth/hooks/useGuestLogin.ts
import { router } from "expo-router";
import { useState } from "react";
import { authService } from "../services/authService";

export function useGuestLogin() {
  const [isLoading, setIsLoading] = useState(false);

  async function loginAsGuest() {
    setIsLoading(true);
    try {
      await authService.loginAsGuest();
      router.replace("/(onboarding)/intro");
    } catch (e) {
      console.error("Guest login failed:", e);
    } finally {
      setIsLoading(false);
    }
  }

  return { loginAsGuest, isLoading };
}
