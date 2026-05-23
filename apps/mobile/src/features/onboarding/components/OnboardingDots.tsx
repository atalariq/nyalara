import React from "react";
import { View } from "react-native";

interface Props {
  total: number;
  activeIndex: number;
}

export const OnboardingDots = ({ total, activeIndex }: Props) => {
  return (
    <View className="flex-row items-center justify-center gap-2">
      {Array.from({ length: total }).map((_, i) => {
        const active = i === activeIndex;

        return (
          <View
            key={i}
            className={[
              "rounded-full transition-all duration-300",

              active ? "w-6 h-[6px] bg-brand" : "w-[6px] h-[6px] bg-gray-400",
            ].join(" ")}
          />
        );
      })}
    </View>
  );
};
