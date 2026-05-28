// features/carbon-budget/screens/HouseTypeScreen.tsx
import { useRouter } from 'expo-router'
import { Image, Pressable, ScrollView, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useState } from 'react'
import { AppBackButton } from '@/shared/components/ui/AppBackButton'
import { HOUSE_CONFIG, type HouseType } from '@/shared/config/carbonBudget'
import { useCarbonBudgetStore } from '../../carbon-budget/store/carbonBudgetStore'
import { AppButton } from '@/shared/components/ui/AppButton'
import { useAuthStore } from '@/features/auth/store/authStore'
import { profileService } from '@/features/profile/services/profileService'
import { CARBON_CONFIG } from '@/shared/config/carbonConfig'

const HOUSE_IMAGES: Record<HouseType, any> = {
  large: require('@/assets/images/house/large.png'),
  medium: require('@/assets/images/house/medium.png'),
  small: require('@/assets/images/house/small.png'),
}

export function HouseTypeScreen() {
  const router = useRouter()
  const setHouseType = useCarbonBudgetStore((s) => s.setHouseType)
  const [selected, setSelected] = useState<HouseType | null>(null)
  const [isFinishing, setIsFinishing] = useState(false)
  const user = useAuthStore((s) => s.user)

  async function handleFinish() {
    if (!selected) return
    setIsFinishing(true)
    setHouseType(selected)

    // Ensure profile exists so onboarding does not loop on dashboard entry
    if (user) {
      try {
        await profileService.createProfile({
          uid: user.uid,
          displayName: user.displayName ?? (user.isAnonymous ? 'Guest User' : 'User'),
          email: user.email ?? '',
          electricityRate: CARBON_CONFIG.electricityRate,
          emissionFactor: CARBON_CONFIG.emissionFactor,
        })
      } catch {
        // Best-effort: continue onboarding even if profile creation fails;
        // a safety net in DeviceSetupCompleteScreen will retry before entering the app.
      }
    }

    setIsFinishing(false)
    router.replace('/(onboarding)/device-setup' as any)
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* HEADER */}
      <View className="flex-row items-center gap-3 px-4 py-3">
        <AppBackButton onPress={() => router.replace('/(onboarding)/intro')} />
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        <Text className="mb-6 mt-2 text-[26px] font-extrabold text-[#111]">
          Choose Your House Type!
        </Text>

        {(['large', 'medium', 'small'] as HouseType[]).map((type) => {
          const config = HOUSE_CONFIG[type]
          const isSelected = selected === type

          return (
            <Pressable
              key={type}
              onPress={() => setSelected(type)}
              style={{
                marginBottom: 16,
                borderRadius: 20,
                overflow: 'hidden',
                borderWidth: 2,
                borderColor: isSelected ? 'black' : 'transparent',
              }}
            >
              <View className="bg-white p-3 shadow-sm shadow-black/5" style={{ borderRadius: 18 }}>
                <Text className="mb-2 text-[15px] font-bold text-[#111]">{config.label}</Text>
                <Image
                  source={HOUSE_IMAGES[type]}
                  resizeMode="cover"
                  style={{ width: '100%', height: 160, borderRadius: 14 }}
                />
                <Text className="mt-2 text-[12px] text-[#888]">~{config.description}</Text>
              </View>
            </Pressable>
          )
        })}
      </ScrollView>

      {/* FINISH BUTTON */}
      <View className="absolute bottom-0 left-0 right-0 px-4 pb-8 pt-4 bg-white">
        <Pressable
          onPress={handleFinish}
          disabled={!selected || isFinishing}
          style={{
            backgroundColor: '#111',
            borderRadius: 99,
            paddingVertical: 18,
            alignItems: 'center',
            opacity: selected && !isFinishing ? 1 : 0.5,
          }}
        >
          <Text style={{ color: '#25CE7F', fontSize: 16, fontWeight: '700' }}>Continue Set Up</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  )
}
