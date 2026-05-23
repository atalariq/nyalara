// features/onboarding/screens/IntroScreen.tsx
import { AppButton } from "@/shared/components/ui/AppButton";
import { router } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  ListRenderItem,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { OnboardingSlide } from "../components/OnboardingSlide";
import { ONBOARDING_SLIDES } from "../data/slides";
import { OnboardingSlideData } from "../types";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function IntroScreen() {
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const isLastSlide = activeIndex === ONBOARDING_SLIDES.length - 1;

  const handleNext = () => {
    if (isLastSlide) {
      router.replace("/(onboarding)/device-setup");
      return;
    }
    const next = activeIndex + 1;
    flatListRef.current?.scrollToIndex({ index: next, animated: true });
    setActiveIndex(next);
  };

  const handleSkip = () => {
    router.replace("/(onboarding)/device-setup");
  };

  const renderItem: ListRenderItem<OnboardingSlideData> = ({ item }) => (
    <View
      style={{ width: SCREEN_WIDTH }}
      className="items-center justify-center"
    >
      <OnboardingSlide
        slide={item}
        totalSlides={ONBOARDING_SLIDES.length}
        activeIndex={activeIndex}
      />
    </View>
  );

  return (
    <View className="flex-1 bg-[#F8F8F8]">
      {/* Header */}
      <View className="flex-row justify-end px-6 pt-14">
        <TouchableOpacity onPress={handleSkip} activeOpacity={0.7}>
          <Text className="text-[16px] font-semibold text-neutral-600">
            Skip
          </Text>
        </TouchableOpacity>
      </View>

      {/* Slider */}
      <View className="flex-1 justify-center">
        <FlatList
          ref={flatListRef}
          data={ONBOARDING_SLIDES}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          horizontal
          pagingEnabled
          scrollEnabled={false}
          showsHorizontalScrollIndicator={false}
        />
      </View>

      {/* Footer */}
      <View className="px-7 pb-10">
        <AppButton
          label={isLastSlide ? "Get Started →" : "Next →"}
          variant="primary"
          size="lg"
          fullWidth
          onPress={handleNext}
        />
      </View>
    </View>
  );
}
