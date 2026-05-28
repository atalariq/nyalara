import { Pencil } from 'lucide-react-native'
import { Pressable, Text, View } from 'react-native'

type Props = {
  value: number
  onEdit: () => void
}

export function DailyTargetCard({ value, onEdit }: Props) {
  return (
    <View
      className="rounded-3xl bg-white p-5"
      style={{
        shadowColor: '#000',
        shadowOpacity: 0.04,
        shadowRadius: 10,
        elevation: 2,
      }}
    >
      <View className="flex-row items-start justify-between">
        <View className="gap-1">
          <Text className="text-xs font-semibold tracking-widest text-[#888]">CARBON BUDGET</Text>

          <Text className="text-3xl font-bold text-[#111]">{value} kWh</Text>

          <Text className="text-sm text-[#666]">Daily energy limit</Text>
        </View>

        <Pressable
          onPress={onEdit}
          className="w-10 h-10 rounded-2xl bg-[#F3F4F6] items-center justify-center"
        >
          <Pencil size={16} color="#25CE7F" />
        </Pressable>
      </View>
    </View>
  )
}
