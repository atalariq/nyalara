import React from "react";
import { Text, View } from "react-native";
import { OnboardingSlideData } from "../types";
import { OnboardingDots } from "./OnboardingDots";
import { OnboardingMockup } from "./OnboardingMockup";

interface Props {
  slide: OnboardingSlideData;
  totalSlides: number;
  activeIndex: number;
}

export const OnboardingSlide = ({ slide, totalSlides, activeIndex }: Props) => {
  return (
    <View className="flex-1 items-center">
      {/* Mockup */}
      <View className="mt-2">
        <OnboardingMockup slide={slide} />
      </View>

      {/* Content */}
      <View className="items-center px-8 mt-14">
        <Text
          className="
            text-[52px]
            leading-[54px]
            font-extrabold
            text-primary
            text-center
            tracking-[-1.5px]
          "
        >
          {slide.title}
        </Text>

        <Text
          className="
            mt-6
            text-[16px]
            leading-[28px]
            text-neutral-500
            text-center
            max-w-[300px]
            font-medium
          "
        >
          {slide.description}
        </Text>

        {/* Dots */}
        <View className="mt-10">
          <OnboardingDots total={totalSlides} activeIndex={activeIndex} />
        </View>
      </View>
    </View>
  );
};
