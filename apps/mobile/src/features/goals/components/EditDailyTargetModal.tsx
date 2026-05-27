import React, { useEffect, useState } from 'react'
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { getKeyboardSafeModalLayout } from '@/shared/components/ui/keyboard-safe-modal-layout'

type Props = {
  visible: boolean
  currentValue: number
  onSave: (val: number) => void
  onClose: () => void
}

export function EditDailyTargetModal({ visible, currentValue, onSave, onClose }: Props) {
  const insets = useSafeAreaInsets()
  const layout = getKeyboardSafeModalLayout('dialog')
  const [value, setValue] = useState(currentValue.toString())

  useEffect(() => {
    if (visible) {
      setValue(currentValue.toString())
    }
  }, [currentValue, visible])

  const handleSave = () => {
    const parsed = parseFloat(value)

    if (isNaN(parsed) || parsed <= 0) {
      Alert.alert('Invalid value', 'Please enter a valid number greater than 0.')
      return
    }

    onSave(parsed)
    onClose()
  }

  return (
    <Modal visible={visible} transparent animationType="fade">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <Pressable
          className="flex-1 justify-end px-4"
          style={{ backgroundColor: '#00000030' }}
          onPress={onClose}
        >
          <Pressable
            onPress={(e) => e.stopPropagation()}
            className="w-full rounded-[28px] bg-white"
            style={{ maxHeight: layout.maxHeight, paddingBottom: Math.max(insets.bottom, 16) }}
          >
            <ScrollView
              automaticallyAdjustKeyboardInsets
              keyboardDismissMode="interactive"
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 24, paddingBottom: 20 }}
            >
              <Text className="text-xl font-bold text-[#111]">Edit Daily Target</Text>

              <View className="gap-2 mt-5">
                <Text className="text-xs font-semibold tracking-widest text-[#888]">
                  CARBON BUDGET
                </Text>

                <View className="rounded-2xl bg-[#F3F4F6] px-4 py-3 flex-row items-center">
                  <TextInput
                    value={value}
                    onChangeText={setValue}
                    keyboardType="decimal-pad"
                    autoFocus
                    className="flex-1 text-base text-[#111]"
                    placeholder="0"
                    placeholderTextColor="#999"
                  />

                  <Text className="text-sm text-[#666]">kWh</Text>
                </View>
              </View>
            </ScrollView>

            <View
              className="flex-row gap-3 border-t border-[#F1F1F1] px-6"
              style={{ paddingTop: layout.footerTopPadding }}
            >
              <Pressable
                onPress={onClose}
                className="flex-1 rounded-2xl bg-[#F3F4F6] py-4 items-center"
              >
                <Text className="font-semibold text-[#111]">Cancel</Text>
              </Pressable>

              <Pressable
                onPress={handleSave}
                className="flex-1 rounded-2xl bg-[#25CE7F] py-4 items-center"
              >
                <Text className="font-semibold text-white">Save</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  )
}
