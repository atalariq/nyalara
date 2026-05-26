import React, { useState } from 'react'
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
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
    <Modal visible={visible} transparent animationType="fade">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <Pressable
          className="flex-1 items-center justify-center px-5"
          style={{ backgroundColor: '#00000050' }}
          onPress={onClose}
        >
          <Pressable
            onPress={(e) => e.stopPropagation()}
            className="w-full rounded-[28px] bg-white p-6 gap-4"
            style={{ maxHeight: '80%' }}
          >
            {/* Header */}
            <View className="flex-row items-center justify-between">
              <Text className="text-xl font-bold text-[#111]">Edit Targets</Text>
              <Pressable onPress={onClose} hitSlop={8}>
                <Text className="font-semibold text-[#25CE7F]">Done</Text>
              </Pressable>
            </View>

            {/* Add new */}
            <View className="flex-row items-center gap-3 rounded-2xl bg-[#F3F4F6] px-4">
              <TextInput
                value={newLabel}
                onChangeText={setNewLabel}
                placeholder="Add new target..."
                placeholderTextColor="#999"
                className="flex-1 py-4 text-sm text-[#111]"
                onSubmitEditing={handleAdd}
                returnKeyType="done"
              />
              <Pressable onPress={handleAdd} hitSlop={8}>
                <Plus size={18} color="#25CE7F" />
              </Pressable>
            </View>

            {/* List */}
            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              style={{ maxHeight: 280 }}
              contentContainerStyle={{ gap: 10 }}
            >
              {sustainabilityTargets.map((target) => (
                <View
                  key={target.id}
                  className="flex-row items-center gap-3 rounded-2xl bg-[#F3F4F6] px-4"
                  style={{ height: 52 }}
                >
                  {editingId === target.id ? (
                    <>
                      <TextInput
                        value={editingLabel}
                        onChangeText={setEditingLabel}
                        className="flex-1 text-sm text-[#111]"
                        autoFocus
                        onSubmitEditing={() => handleSaveEdit(target.id)}
                        returnKeyType="done"
                      />
                      <Pressable onPress={() => handleSaveEdit(target.id)} hitSlop={8}>
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
                        hitSlop={8}
                      >
                        <Pencil size={15} color="#666" />
                      </Pressable>
                      <Pressable onPress={() => removeTarget(target.id)} hitSlop={8}>
                        <Trash2 size={15} color="#EF4444" />
                      </Pressable>
                    </>
                  )}
                </View>
              ))}
            </ScrollView>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  )
}
