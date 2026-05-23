// LOGIN SCREEN

import { router } from "expo-router";
import { ArrowLeft, Lock, Mail } from "lucide-react-native";

import React from "react";

import { AntDesign, FontAwesome5 } from "@expo/vector-icons";
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
import { useLoginForm } from "../hooks/useAuthForm";
import { useGoogleAuth } from "../hooks/useGoogleAuth";

export function LoginScreen() {
  const { form, onSubmit, error, isLoading } = useLoginForm();

  const { promptAsync } = useGoogleAuth();

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
            Welcome
          </Text>

          <Text className="text-zinc-500 text-center text-[15px] leading-5 mt-4 px-5">
            Log back into your sustainable living{"\n"}
            journey and continue tracking.
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
            name="email"
            label="Email Address"
            icon={Mail}
            placeholder="your@email.com"
            inputProps={{
              keyboardType: "email-address",
            }}
          />

          <FormField
            control={form.control}
            name="password"
            label="Password"
            icon={Lock}
            placeholder="Your password"
            secureTextEntry
          />

          <TouchableOpacity className="items-end mt-1">
            <Text className="text-brand text-sm font-semibold">
              Forgot password?
            </Text>
          </TouchableOpacity>
        </View>

        {error && (
          <Text className="text-red-500 text-sm text-center mt-4">{error}</Text>
        )}

        <TouchableOpacity
          onPress={onSubmit}
          disabled={isLoading}
          className="bg-brand h-14 rounded-full items-center justify-center mt-10"
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text className="text-white font-extrabold text-lg">Log In</Text>
          )}
        </TouchableOpacity>

        <Text className="text-zinc-500 text-base text-center mt-6">
          Don&apos;t have an account?{" "}
          <Text
            className="text-brand font-bold"
            onPress={() => router.push("/(auth)/register")}
          >
            Sign Up
          </Text>
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
