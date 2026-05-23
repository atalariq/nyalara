import { useAuthStore } from "@/features/auth/store/authStore";
import { Redirect } from "expo-router";
export default function Index() {
  const { user, isLoading } = useAuthStore();
  // Tunggu sampai auth selesai dicek
  if (isLoading) return null;
  // Sudah login → dashboard, belum → onboarding
  return user ? (
    <Redirect href="/(app)/dashboard" />
  ) : (
    <Redirect href="/(onboarding)/welcome" />
  );
}
