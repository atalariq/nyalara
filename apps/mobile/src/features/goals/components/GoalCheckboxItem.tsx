import { Check } from 'lucide-react-native'
import { Pressable, Text, View } from 'react-native'

type Props = {
  label: string
  completed: boolean
  onPress: () => void
}

export function GoalCheckboxItem({ label, completed, onPress }: Props) {
  return (
    <Pressable onPress={onPress} className="flex-row items-center gap-3">
      <View
        className="w-6 h-6 rounded-full items-center justify-center"
        style={{
          backgroundColor: completed ? '#25CE7F' : '#fff',
          borderWidth: 1.5,
          borderColor: '#25CE7F',
        }}
      >
        {completed && <Check size={12} color="#fff" />}
      </View>

      <Text
        className="text-sm"
        style={{
          color: completed ? '#999' : '#111',
          textDecorationLine: completed ? 'line-through' : 'none',
        }}
      >
        {label}
      </Text>
    </Pressable>
  )
}
