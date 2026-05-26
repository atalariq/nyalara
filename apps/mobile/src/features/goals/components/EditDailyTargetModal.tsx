import React, { useState } from 'react'
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native'

type Props = {
  visible: boolean
  currentValue: number
  onSave: (val: number) => void
  onClose: () => void
}

export function EditDailyTargetModal({ visible, currentValue, onSave, onClose }: Props) {
  const [value, setValue] = useState(currentValue.toString())

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
          className="flex-1 items-center justify-center px-6"
          style={{ backgroundColor: '#00000030' }}
          onPress={onClose}
        >
          <Pressable
            onPress={(e) => e.stopPropagation()}
            className="w-full rounded-[28px] bg-white p-6 gap-5"
          >
            <Text className="text-xl font-bold text-[#111]">Edit Daily Target</Text>

            <View className="gap-2">
              <Text className="text-xs font-semibold tracking-widest text-[#888]">DAILY LIMIT</Text>

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

            <View className="flex-row gap-3">
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
