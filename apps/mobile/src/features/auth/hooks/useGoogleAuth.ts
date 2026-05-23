import { makeRedirectUri } from "expo-auth-session";
import * as Google from "expo-auth-session/providers/google";
import { router } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useEffect } from "react";
import { authService } from "../services/authService";
import { useAuthStore } from "../store/authStore";

WebBrowser.maybeCompleteAuthSession();

export function useGoogleAuth() {
  const { setLoading } = useAuthStore();

  const redirectUri = makeRedirectUri({});

  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
    redirectUri,
  });

  useEffect(() => {
    if (response?.type === "success") {
      const idToken = response.authentication?.idToken;
      if (idToken) {
        handleGoogleLogin(idToken);
      }
    }
  }, [response]);

  const handleGoogleLogin = async (idToken: string) => {
    try {
      setLoading(true);
      await authService.loginWithGoogle(idToken);
      router.replace("/(app)/dashboard");
    } catch (err: any) {
      console.log("GOOGLE LOGIN ERROR:", err?.code, err?.message);
      setLoading(false);
    }
  };

  return { promptAsync, request };
}
