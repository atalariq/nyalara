import { View, Text } from 'react-native'
import { formatTime, formatDuration } from '../utils/format'

type Props = {
  startedAt: number
  endedAt: number
}

export function SessionRow({ startedAt, endedAt }: Props) {
  const durationMinutes = (endedAt - startedAt) / 1000 / 60
  return (
    <View className="flex-row items-center gap-2">
      <View className="w-1.5 h-1.5 rounded-full bg-[#25CE7F]" />
      <Text className="text-xs text-[#888]">
        {formatTime(startedAt)} → {formatTime(endedAt)}
        {'  '}
        <Text className="text-[#BBB]">{formatDuration(durationMinutes)}</Text>
      </Text>
    </View>
  )
}
