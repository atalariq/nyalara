// features/devices/components/EditDeviceModal.tsx
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
  Alert,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { getKeyboardSafeModalLayout } from '@/shared/components/ui/keyboard-safe-modal-layout'
import { z } from 'zod'
import type { DeviceListItem } from '../hooks/useDeviceList'
import { CategoryGrid } from './AddDeviceSheet/CategoryGrid'
import type { DeviceType } from '../types/device.types'

const schema = z.object({
  name: z.string().min(2).max(50),
  deviceType: z.enum(['ac', 'tv', 'washer', 'fridge', 'lights', 'other']),
  watt: z.number().min(1).max(10000),
  hoursPerDay: z.number().min(0.1).max(24),
})

type FormValues = z.infer<typeof schema>

type Props = {
  device: DeviceListItem | null
  visible: boolean
  onClose: () => void
  onSave: (id: string, values: FormValues) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

export function EditDeviceModal({ device, visible, onClose, onSave, onDelete }: Props) {
  const insets = useSafeAreaInsets()
  const layout = getKeyboardSafeModalLayout('sheet')
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  // Reset form setiap kali device berubah
  useEffect(() => {
    if (device) {
      reset({
        name: device.name,
        deviceType: device.category as DeviceType,
        watt: device.watt,
        hoursPerDay: parseFloat(device.usageLabel) || 1,
      })
    }
  }, [device])

  async function onSubmit(values: FormValues) {
    if (!device) return
    await onSave(device.id, values)
    onClose()
  }

  async function handleDelete() {
    if (!device) return

    Alert.alert('Delete Device', `Are you sure you want to delete "${device.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await onDelete(device.id)
          onClose()
        },
      },
    ])
  }

  if (!device) return null

  return (
    <Modal visible={visible} transparent animationType="fade">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <Pressable
          className="flex-1 justify-end px-4"
          style={{ backgroundColor: '#00000050' }}
          onPress={onClose}
        >
          <Pressable
            onPress={(e) => e.stopPropagation()}
            className="bg-white rounded-t-[32px]"
            style={{ maxHeight: layout.maxHeight, paddingBottom: Math.max(insets.bottom, 16) }}
          >
            <ScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 24, paddingBottom: 20 }}
            >
              {/* Handle */}
              <View className="w-10 h-1 rounded-full bg-[#E0E0E0] self-center mb-4" />

              <Text className="text-[18px] font-extrabold text-[#111] mb-5">Edit Device</Text>

              {/* Name */}
              <View className="mb-5">
                <Text className="text-xs font-semibold text-[#888] mb-2">DEVICE NAME</Text>
                <Controller
                  name="name"
                  control={control}
                  render={({ field }) => (
                    <View className="flex-row items-center bg-[#F5F5F5] rounded-2xl px-4 py-3">
                      <TextInput
                        className="flex-1 text-[14px] text-[#111]"
                        value={field.value}
                        onChangeText={field.onChange}
                        placeholder="Device name"
                        placeholderTextColor="#ABABAB"
                      />
                    </View>
                  )}
                />
                {errors.name && (
                  <Text className="text-[#f87171] text-xs mt-1">{errors.name.message}</Text>
                )}
              </View>

              {/* Category */}
              <View className="mb-5">
                <Text className="text-xs font-semibold text-[#888] mb-2">CATEGORY</Text>
                <Controller
                  name="deviceType"
                  control={control}
                  render={({ field }) => (
                    <CategoryGrid value={field.value} onChange={field.onChange} />
                  )}
                />
              </View>

              {/* Watt + Hours */}
              <View className="flex-row gap-3">
                <View className="flex-1">
                  <Text className="text-xs font-semibold text-[#888] mb-2">WATTAGE</Text>
                  <Controller
                    name="watt"
                    control={control}
                    render={({ field }) => (
                      <View className="flex-row items-center bg-[#F5F5F5] rounded-2xl px-4 py-3">
                        <TextInput
                          className="flex-1 text-[14px] text-[#111]"
                          keyboardType="numeric"
                          value={field.value ? String(field.value) : ''}
                          onChangeText={(v) => field.onChange(Number(v) || 0)}
                          placeholder="W"
                          placeholderTextColor="#ABABAB"
                        />
                        <Text className="text-[#25CE7F] font-bold text-sm">W</Text>
                      </View>
                    )}
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-xs font-semibold text-[#888] mb-2">HOURS/DAY</Text>
                  <Controller
                    name="hoursPerDay"
                    control={control}
                    render={({ field }) => (
                      <View className="flex-row items-center bg-[#F5F5F5] rounded-2xl px-4 py-3">
                        <TextInput
                          className="flex-1 text-[14px] text-[#111]"
                          keyboardType="numeric"
                          value={field.value ? String(field.value) : ''}
                          onChangeText={(v) => field.onChange(Number(v) || 0)}
                          placeholder="h"
                          placeholderTextColor="#ABABAB"
                        />
                        <Text className="text-[#ABABAB] text-sm">h</Text>
                      </View>
                    )}
                  />
                </View>
              </View>
            </ScrollView>

            <View
              className="gap-3 border-t border-[#F1F1F1] px-5"
              style={{ paddingTop: layout.footerTopPadding }}
            >
              <Pressable
                onPress={handleDelete}
                disabled={isSubmitting}
                className="w-full rounded-2xl bg-[#FEF2F2] py-4 items-center"
              >
                <Text className="font-semibold text-[#EF4444]">Delete Device</Text>
              </Pressable>

              <View className="flex-row gap-3">
                <Pressable
                  onPress={onClose}
                  className="flex-1 rounded-2xl bg-[#F3F4F6] py-4 items-center"
                >
                  <Text className="font-semibold text-[#111]">Cancel</Text>
                </Pressable>
                <Pressable
                  onPress={handleSubmit(onSubmit)}
                  disabled={isSubmitting}
                  className="flex-1 rounded-2xl bg-[#111] py-4 items-center"
                  style={{ opacity: isSubmitting ? 0.6 : 1 }}
                >
                  <Text className="font-semibold text-[#25CE7F]">
                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                  </Text>
                </Pressable>
              </View>
            </View>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  )
}
