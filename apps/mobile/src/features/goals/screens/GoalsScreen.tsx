// features/goals/screens/GoalsScreen.tsx
import React, { useState } from 'react'
import { ScrollView, Text, View, Pressable } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { ArrowLeft } from 'lucide-react-native'
import { useGoalsStore } from '../store/goalsStore'
import { DailyTargetCard } from '../components/DailyTargetCard'
import { SustainabilityTargetsCard } from '../components/SustainabilityTargetsCard'
import { EditDailyTargetModal } from '../components/EditDailyTargetModal'
import { EditTargetsModal } from '../components/EditTargetsModal'
import { useCarbonBudgetStore } from '@/features/carbon-budget/store/carbonBudgetStore'

export default function GoalsScreen() {
  const router = useRouter()
  const { sustainabilityTargets, toggleTarget } = useGoalsStore()
  const { monthlyBudgetKwh, setMonthlyBudget } = useCarbonBudgetStore()
  const dailyTargetKwh = monthlyBudgetKwh > 0 ? monthlyBudgetKwh / 30 : 10

  const [showDailyModal, setShowDailyModal] = useState(false)
  const [showTargetsModal, setShowTargetsModal] = useState(false)

  function handleSaveDailyTarget(kwh: number) {
    setMonthlyBudget(kwh * 30)
  }

  return (
    <SafeAreaView className="flex-1 bg-[#F6F7F9]">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 20, gap: 16, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-row items-center gap-4 mb-2">
          <Pressable
            onPress={() => router.back()}
            className="w-11 h-11 rounded-2xl bg-white items-center justify-center"
            style={{ shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 }}
          >
            <ArrowLeft size={18} color="#111" />
          </Pressable>
          <Text className="text-3xl font-bold text-[#111]">Carbon Budget</Text>
        </View>

        <DailyTargetCard value={dailyTargetKwh} onEdit={() => setShowDailyModal(true)} />
        <SustainabilityTargetsCard
          targets={sustainabilityTargets}
          onToggle={toggleTarget}
          onEdit={() => setShowTargetsModal(true)}
        />
      </ScrollView>

      <EditDailyTargetModal
        visible={showDailyModal}
        currentValue={dailyTargetKwh}
        onSave={handleSaveDailyTarget}
        onClose={() => setShowDailyModal(false)}
      />
      <EditTargetsModal visible={showTargetsModal} onClose={() => setShowTargetsModal(false)} />
    </SafeAreaView>
  )
}
