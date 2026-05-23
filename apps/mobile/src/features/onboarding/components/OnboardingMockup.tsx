import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Image, Text, View } from "react-native";

import { OnboardingSlideData } from "../types";

interface Props {
  slide: OnboardingSlideData;
}

export const OnboardingMockup = ({ slide }: Props) => {
  return (
    <View className="relative w-[352px] h-[306px]">
      {/* Top Floating Label */}
      <View
        className="
          absolute
          top-0
          left-2
          z-20
          bg-white
          px-7
          py-5
          rounded-[28px]
        "
        style={{
          shadowColor: "#000",
          shadowOpacity: 0.12,
          shadowRadius: 12,
          shadowOffset: {
            width: 0,
            height: 6,
          },
          elevation: 8,
        }}
      >
        <Text
          className="
            text-brand
            text-[20px]
            leading-[24px]
            text-center
            font-extrabold
          "
        >
          {slide.labelText}
        </Text>
      </View>

      {/* Main Image Card */}
      <View
        className="
          absolute
          top-16
          right-0
          w-[240px]
          h-[170px]
          bg-white
          rounded-[38px]
          p-[10px]
        "
        style={{
          shadowColor: "#000",
          shadowOpacity: 0.1,
          shadowRadius: 16,
          shadowOffset: {
            width: 0,
            height: 8,
          },
          elevation: 10,
        }}
      >
        <View className="flex-1 overflow-hidden rounded-[30px]">
          <Image
            source={require("@/assets/images/onboarding-hero.png")}
            className="w-full h-full"
            resizeMode="cover"
          />
        </View>
      </View>

      {/* Bottom Device Card */}
      <View
        className="
          absolute
          left-6
          bottom-3
          z-30
          w-[155px]
          bg-[#EEF3EE]
          rounded-[24px]
          px-4
          py-4
        "
        style={{
          shadowColor: "#000",
          shadowOpacity: 0.16,
          shadowRadius: 10,
          shadowOffset: {
            width: 0,
            height: 5,
          },
          elevation: 8,
        }}
      >
        {/* Top Row */}
        <View className="flex-row items-center justify-between">
          {/* Bulb Icon */}
          <View className="w-12 h-12 rounded-full bg-brand items-center justify-center">
            <Ionicons name="bulb-outline" size={22} color="white" />
          </View>

          {/* Toggle */}
          <View className="w-[42px] h-[22px] rounded-full bg-brand justify-center px-[3px]">
            <View className="w-[16px] h-[16px] rounded-full bg-white self-end" />
          </View>
        </View>

        {/* Bottom Content */}
        <View className="mt-5 flex-row items-end justify-between">
          <Text
            className="
              text-[#4A4A4A]
              text-[14px]
              leading-[18px]
              font-medium
            "
          >
            Living{"\n"}Room
          </Text>

          <Text
            className="
              text-brand
              text-[14px]
              font-bold
            "
          >
            {slide.deviceKwh}
          </Text>
        </View>
      </View>
    </View>
  );
};
