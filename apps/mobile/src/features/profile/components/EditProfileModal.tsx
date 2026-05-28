import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import {
  KeyboardAvoidingView,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { z } from 'zod'
import { getKeyboardSafeModalLayout } from '@/shared/components/ui/keyboard-safe-modal-layout'
import type { UserProfile } from '../types/profile.types'

const schema = z.object({
  displayName: z.string().trim().min(2, 'Name must be at least 2 characters.').max(50),
  residence: z.string().trim().min(2, 'Residence must be at least 2 characters.').max(60),
  residents: z
    .string()
    .trim()
    .refine((value) => {
      const parsed = Number(value)
      return Number.isInteger(parsed) && parsed > 0
    }, 'Residents must be a whole number greater than 0.'),
  city: z.string().trim().min(2, 'City must be at least 2 characters.').max(60),
})

type FormValues = z.infer<typeof schema>

type Props = {
  visible: boolean
  profile: UserProfile | null
  isSaving: boolean
  onClose: () => void
  onSave: (values: {
    displayName: string
    residence: string
    residents: number
    city: string
  }) => Promise<void>
}

export function EditProfileModal({ visible, profile, isSaving, onClose, onSave }: Props) {
  const insets = useSafeAreaInsets()
  const layout = getKeyboardSafeModalLayout('dialog')
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      displayName: '',
      residence: '',
      residents: '',
      city: '',
    },
  })

  useEffect(() => {
    if (!visible || !profile) {
      return
    }

    reset({
      displayName: profile.displayName ?? '',
      residence: profile.residence ?? '',
      residents: profile.residents ? String(profile.residents) : '',
      city: profile.city ?? '',
    })
  }, [profile, reset, visible])

  const submit = handleSubmit(async (values) => {
    await onSave({
      displayName: values.displayName.trim(),
      residence: values.residence.trim(),
      residents: Number(values.residents),
      city: values.city.trim(),
    })
  })

  return (
    <Modal visible={visible} transparent animationType="fade">
      <KeyboardAvoidingView behavior="padding" className="flex-1">
        <Pressable
          className="flex-1 justify-end px-4"
          style={{ backgroundColor: '#00000050' }}
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
              <Text className="text-xl font-bold text-[#111]">Edit Profile</Text>

              <Field
                label="DISPLAY NAME"
                error={errors.displayName?.message}
                control={
                  <Controller
                    name="displayName"
                    control={control}
                    render={({ field }) => (
                      <TextInput
                        value={field.value}
                        onChangeText={field.onChange}
                        placeholder="Your name"
                        placeholderTextColor="#999"
                        className="rounded-2xl bg-[#F3F4F6] px-4 py-4 text-base text-[#111]"
                      />
                    )}
                  />
                }
              />

              <Field
                label="RESIDENCE"
                error={errors.residence?.message}
                control={
                  <Controller
                    name="residence"
                    control={control}
                    render={({ field }) => (
                      <TextInput
                        value={field.value}
                        onChangeText={field.onChange}
                        placeholder="Apartment, house, dorm, etc."
                        placeholderTextColor="#999"
                        className="rounded-2xl bg-[#F3F4F6] px-4 py-4 text-base text-[#111]"
                      />
                    )}
                  />
                }
              />

              <View className="mt-5 flex-row gap-3">
                <View className="flex-1">
                  <Field
                    label="RESIDENTS"
                    error={errors.residents?.message}
                    control={
                      <Controller
                        name="residents"
                        control={control}
                        render={({ field }) => (
                          <TextInput
                            value={field.value}
                            onChangeText={field.onChange}
                            keyboardType="number-pad"
                            placeholder="1"
                            placeholderTextColor="#999"
                            className="rounded-2xl bg-[#F3F4F6] px-4 py-4 text-base text-[#111]"
                          />
                        )}
                      />
                    }
                  />
                </View>

                <View className="flex-1">
                  <Field
                    label="CITY"
                    error={errors.city?.message}
                    control={
                      <Controller
                        name="city"
                        control={control}
                        render={({ field }) => (
                          <TextInput
                            value={field.value}
                            onChangeText={field.onChange}
                            placeholder="City"
                            placeholderTextColor="#999"
                            className="rounded-2xl bg-[#F3F4F6] px-4 py-4 text-base text-[#111]"
                          />
                        )}
                      />
                    }
                  />
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
                onPress={() => void submit()}
                disabled={isSaving}
                className="flex-1 rounded-2xl bg-[#111] py-4 items-center"
                style={{ opacity: isSaving ? 0.6 : 1 }}
              >
                <Text className="font-semibold text-[#25CE7F]">
                  {isSaving ? 'Saving...' : 'Save'}
                </Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  )
}

function Field({
  label,
  control,
  error,
}: {
  label: string
  control: React.ReactNode
  error?: string
}) {
  return (
    <View className="mt-5 gap-2">
      <Text className="text-xs font-semibold tracking-widest text-[#888]">{label}</Text>
      {control}
      {error ? <Text className="text-xs text-[#EF4444]">{error}</Text> : null}
    </View>
  )
}
