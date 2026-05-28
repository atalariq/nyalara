import { AppButton } from '@/shared/components/ui/AppButton'
import { router } from 'expo-router'
import { Image, ImageBackground, Text, View } from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { OnboardingDots } from '../components/OnboardingDots'
import { ONBOARDING_SLIDES } from '../data/slides'

export default function WelcomeScreen() {
  const insets = useSafeAreaInsets()
  return (
    <ImageBackground
      source={require('@/assets/images/onboarding-bg.png')}
      className="flex-1"
      resizeMode="cover"
    >
      <SafeAreaView edges={['top']} className="flex-1">
        {/* Hero */}
        <View className="flex-1 items-center px-8">
          <View className="flex-1 justify-center items-center">
            <Orb />
            <Wordmark />
          </View>

          <View className="pb-12">
            <Subtitle />
          </View>
        </View>

        {/* Bottom Card */}
        <View
          className="bg-white px-7 pt-11 gap-4"
          style={{
            paddingBottom: insets.bottom + 24,
            borderTopLeftRadius: 54,
            borderTopRightRadius: 54,
          }}
        >
          <View className="mb-3 items-center">
            <OnboardingDots total={ONBOARDING_SLIDES.length} activeIndex={0} />
          </View>
          <AppButton
            label="Get Started"
            variant="primary"
            size="lg"
            fullWidth
            onPress={() => router.push('/(auth)/register')}
          />
          <AppButton
            label="I already have an account"
            variant="primary-subtle"
            size="lg"
            fullWidth
            onPress={() => router.push('/(auth)/login')}
          />
        </View>
      </SafeAreaView>
    </ImageBackground>
  )
}

function Orb() {
  return (
    <View className="items-center justify-center">
      <Image
        source={require('@/assets/images/hero-orb.png')}
        className="w-48 h-48"
        resizeMode="contain"
      />
    </View>
  )
}

function Wordmark() {
  return (
    <Text className="mt-4 text-[40px] font-extrabold tracking-[2px] text-[#FBFBFB]">nyalara</Text>
  )
}

function Subtitle() {
  return (
    <Text className=" text-left text-2xl font-semibold text-white">
      Track devices in real time, reduce energy waste, and build smarter habits effortlessly.
    </Text>
  )
}
