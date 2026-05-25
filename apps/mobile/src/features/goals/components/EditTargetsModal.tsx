import React, { useState } from 'react'
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native'

import { Check, Pencil, Plus, Trash2 } from 'lucide-react-native'

import { useGoalsStore } from '../store/goalsStore'

type Props = {
  visible: boolean
  onClose: () => void
}

export function EditTargetsModal({ visible, onClose }: Props) {
  const { sustainabilityTargets, addTarget, updateTarget, removeTarget } = useGoalsStore()

  const [newLabel, setNewLabel] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingLabel, setEditingLabel] = useState('')

  const handleAdd = () => {
    if (!newLabel.trim()) return

    addTarget(newLabel.trim())
    setNewLabel('')
  }

  const handleSaveEdit = (id: string) => {
    if (!editingLabel.trim()) return

    updateTarget(id, editingLabel.trim())
    setEditingId(null)
  }

  return (
    <Modal visible={visible} transparent animationType="slide">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <Pressable
          className="flex-1 justify-end"
          style={{ backgroundColor: '#00000030' }}
          onPress={onClose}
        >
          <Pressable
            onPress={(e) => e.stopPropagation()}
            className="rounded-t-[32px] bg-white p-6 gap-4"
          >
            <View className="flex-row items-center justify-between">
              <Text className="text-xl font-bold text-[#111]">Edit Targets</Text>

              <Pressable onPress={onClose}>
                <Text className="font-medium text-[#25CE7F]">Done</Text>
              </Pressable>
            </View>

            <View className="flex-row items-center gap-3 rounded-2xl bg-[#F3F4F6] px-4">
              <TextInput
                value={newLabel}
                onChangeText={setNewLabel}
                placeholder="Add new target..."
                placeholderTextColor="#999"
                className="flex-1 py-4 text-[#111]"
              />

              <Pressable onPress={handleAdd}>
                <Plus size={18} color="#25CE7F" />
              </Pressable>
            </View>

            <View className="gap-3">
              {sustainabilityTargets.map((target) => (
                <View
                  key={target.id}
                  className="flex-row items-center gap-3 rounded-2xl bg-[#F3F4F6] px-4 py-4"
                >
                  {editingId === target.id ? (
                    <>
                      <TextInput
                        value={editingLabel}
                        onChangeText={setEditingLabel}
                        className="flex-1 text-[#111]"
                        autoFocus
                        onSubmitEditing={() => handleSaveEdit(target.id)}
                      />

                      <Pressable onPress={() => handleSaveEdit(target.id)}>
                        <Check size={16} color="#25CE7F" />
                      </Pressable>
                    </>
                  ) : (
                    <>
                      <Text className="flex-1 text-sm text-[#111]">{target.label}</Text>

                      <Pressable
                        onPress={() => {
                          setEditingId(target.id)
                          setEditingLabel(target.label)
                        }}
                      >
                        <Pencil size={15} color="#666" />
                      </Pressable>

                      <Pressable onPress={() => removeTarget(target.id)}>
                        <Trash2 size={15} color="#EF4444" />
                      </Pressable>
                    </>
                  )}
                </View>
              ))}
            </View>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  )
}
