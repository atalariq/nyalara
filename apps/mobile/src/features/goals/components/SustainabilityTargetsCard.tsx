import { Pencil } from 'lucide-react-native'
import { Pressable, Text, View } from 'react-native'

import { GoalCheckboxItem } from './GoalCheckboxItem'

type Target = {
  id: string
  label: string
  completed: boolean
}

type Props = {
  targets: Target[]
  onToggle: (id: string) => void
  onEdit: () => void
}

export function SustainabilityTargetsCard({ targets, onToggle, onEdit }: Props) {
  return (
    <View
      className="rounded-3xl bg-white p-5 gap-4"
      style={{
        shadowColor: '#000',
        shadowOpacity: 0.04,
        shadowRadius: 10,
        elevation: 2,
      }}
    >
      <View className="flex-row items-center justify-between">
        <Text className="text-xs font-semibold tracking-widest text-[#888]">
          SUSTAINABILITY TARGETS
        </Text>

        <Pressable
          onPress={onEdit}
          className="w-10 h-10 rounded-2xl bg-[#F3F4F6] items-center justify-center"
        >
          <Pencil size={16} color="#25CE7F" />
        </Pressable>
      </View>

      <View className="gap-4">
        {targets.map((target) => (
          <GoalCheckboxItem
            key={target.id}
            label={target.label}
            completed={target.completed}
            onPress={() => onToggle(target.id)}
          />
        ))}
      </View>
    </View>
  )
}
