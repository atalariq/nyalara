// features/auth/screens/RegisterScreen.tsx
import { AntDesign, FontAwesome5 } from "@expo/vector-icons";
import { router } from "expo-router";
import { ArrowLeft, Lock, Mail, User } from "lucide-react-native";
import React from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { FormField } from "../components/FormFields";
import { useRegisterForm } from "../hooks/useAuthForm";
import { useGoogleAuth } from "../hooks/useGoogleAuth";
import { useGuestLogin } from "../hooks/useGuestLogin";

export function RegisterScreen() {
  const { form, onSubmit, error, isLoading } = useRegisterForm();
  const { promptAsync } = useGoogleAuth();
  const { loginAsGuest, isLoading: isGuestLoading } = useGuestLogin();

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-[#F6F6F6]"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingHorizontal: 22,
          paddingBottom: 40,
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <TouchableOpacity
          onPress={() => router.back()}
          className="flex-row items-center gap-2 mt-14 mb-10"
        >
          <ArrowLeft size={18} color="#25CE7F" />
          <Text className="text-brand font-extrabold text-[22px]">Wattly</Text>
        </TouchableOpacity>

        {/* Hero */}
        <View className="items-center mb-10">
          <Text className="text-brand text-[44px] font-extrabold leading-none">
            Join Wattly
          </Text>
          <Text className="text-zinc-500 text-center text-[15px] leading-5 mt-4 px-5">
            Step into the future of sustainable living{"\n"}
            with a personal touch.
          </Text>
        </View>

        {/* Card */}
        <View className="bg-white rounded-[30px] px-5 py-6 border border-zinc-100 shadow-sm">
          {/* Social Buttons */}
          <View className="flex-row gap-3 mb-6">
            {/* Apple */}
            <TouchableOpacity className="flex-1 h-11 rounded-full border border-brand items-center justify-center flex-row gap-2">
              <FontAwesome5 name="apple" size={18} color="#25CE7F" />
              <Text className="text-brand text-sm font-semibold">
                Continue with
              </Text>
            </TouchableOpacity>

            {/* Google */}
            <TouchableOpacity
              onPress={() => promptAsync()}
              className="flex-1 h-11 rounded-full border border-brand items-center justify-center flex-row gap-2"
            >
              <AntDesign name="google" size={18} color="#25CE7F" />
              <Text className="text-brand text-sm font-semibold">
                Continue with
              </Text>
            </TouchableOpacity>
          </View>

          {/* Divider */}
          <View className="flex-row items-center gap-3 mb-5">
            <View className="flex-1 h-px bg-zinc-200" />
            <Text className="text-zinc-400 text-xs font-medium">
              or with email
            </Text>
            <View className="flex-1 h-px bg-zinc-200" />
          </View>

          <FormField
            control={form.control}
            name="fullName"
            label="Full Name"
            icon={User}
            placeholder="John Doe"
          />

          <FormField
            control={form.control}
            name="email"
            label="Email Address"
            icon={Mail}
            placeholder="your@email.com"
            inputProps={{ keyboardType: "email-address" }}
          />

          <FormField
            control={form.control}
            name="password"
            label="Password"
            icon={Lock}
            placeholder="Minimum 6 characters"
            secureTextEntry
          />
        </View>

        {error && (
          <Text className="text-red-500 text-sm text-center mt-4">{error}</Text>
        )}

        {/* Register Button */}
        <TouchableOpacity
          onPress={onSubmit}
          disabled={isLoading || isGuestLoading}
          className="bg-brand h-14 rounded-full items-center justify-center mt-10"
          style={{ opacity: isLoading || isGuestLoading ? 0.7 : 1 }}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text className="text-white font-extrabold text-lg">
              Create An Account
            </Text>
          )}
        </TouchableOpacity>

        {/* Divider */}
        <View className="flex-row items-center gap-3 mt-6">
          <View className="flex-1 h-px bg-zinc-200" />
          <Text className="text-zinc-400 text-xs font-medium">or</Text>
          <View className="flex-1 h-px bg-zinc-200" />
        </View>

        {/* Guest Login Button */}
        <TouchableOpacity
          onPress={loginAsGuest}
          disabled={isLoading || isGuestLoading}
          className="h-14 rounded-full items-center justify-center mt-4 border border-zinc-200 bg-white"
          style={{ opacity: isLoading || isGuestLoading ? 0.7 : 1 }}
        >
          {isGuestLoading ? (
            <ActivityIndicator color="#25CE7F" />
          ) : (
            <Text className="text-zinc-500 font-semibold text-base">
              Continue as Guest
            </Text>
          )}
        </TouchableOpacity>

        <Text className="text-zinc-500 text-base text-center mt-6">
          Already have an account?{" "}
          <Text
            className="text-brand font-bold"
            onPress={() => router.push("/(auth)/login")}
          >
            Log In
          </Text>
        </Text>

        <Text className="text-zinc-400 text-xs text-center mt-4 leading-5 px-5">
          By signing up, you agree to our{" "}
          <Text className="text-brand font-semibold">Terms</Text> &{" "}
          <Text className="text-brand font-semibold">Privacy Policy</Text>
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
