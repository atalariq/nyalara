// features/onboarding/screens/IntroScreen.tsx
import { ensureProfile } from '@/features/auth/lib/ensure-profile'
import { AppButton } from '@/shared/components/ui/AppButton'
import { router } from 'expo-router'
import React, { useRef, useState } from 'react'
import {
  Dimensions,
  FlatList,
  ListRenderItem,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { OnboardingDots } from '../components/OnboardingDots'
import { OnboardingSlide } from '../components/OnboardingSlide'
import { ONBOARDING_SLIDES } from '../data/slides'
import { OnboardingSlideData } from '../types'

const { width: SCREEN_WIDTH } = Dimensions.get('window')

export default function IntroScreen() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [isSkipping, setIsSkipping] = useState(false)
  const flatListRef = useRef<FlatList>(null)
  const isLastSlide = activeIndex === ONBOARDING_SLIDES.length - 1

  const handleNext = () => {
    if (isLastSlide) {
      router.replace('/(onboarding)/house-type')
      return
    }
    const next = activeIndex + 1
    flatListRef.current?.scrollToIndex({ index: next, animated: true })
    setActiveIndex(next)
  }

  const handleSkip = async () => {
    setIsSkipping(true)
    await ensureProfile()
    setIsSkipping(false)
    router.replace('/(app)/dashboard')
  }

  const handleMomentumScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const nextIndex = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH)
    setActiveIndex(nextIndex)
  }

  const renderItem: ListRenderItem<OnboardingSlideData> = ({ item }) => (
    <View style={{ width: SCREEN_WIDTH }} className="items-center justify-center">
      <OnboardingSlide slide={item} />
    </View>
  )

  return (
    <View className="flex-1 bg-[#F8F8F8]">
      {/* Header */}
      <View className="flex-row justify-end px-6 pt-14">
        <TouchableOpacity onPress={handleSkip} activeOpacity={0.7} disabled={isSkipping}>
          <Text
            className={`text-[16px] font-semibold ${isSkipping ? 'text-neutral-300' : 'text-neutral-600'}`}
          >
            {isSkipping ? 'Loading...' : 'Skip'}
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
          onMomentumScrollEnd={handleMomentumScrollEnd}
          showsHorizontalScrollIndicator={false}
          bounces={false}
        />
      </View>

      {/* Dots - fixed position below the slider */}
      <View className="items-center pb-6">
        <OnboardingDots total={ONBOARDING_SLIDES.length} activeIndex={activeIndex} />
      </View>

      {/* Footer */}
      <View className="px-7 pb-10">
        <AppButton
          label={isLastSlide ? 'Get Started →' : 'Next →'}
          variant="primary"
          size="lg"
          fullWidth
          onPress={handleNext}
        />
      </View>
    </View>
  )
}
