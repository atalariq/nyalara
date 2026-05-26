import { MapPin } from 'lucide-react-native'
import { Image, Text, View } from 'react-native'

type Props = {
  name: string
  city: string
  avatarUrl?: string
}

export function ProfileHeader({ name, city, avatarUrl }: Props) {
  return (
    <View className="px-4 pt-4 pb-5">
      <View className="flex-row items-center gap-3">
        <View className="h-12 w-12 rounded-full bg-[#D3F5E5] overflow-hidden items-center justify-center">
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} className="h-12 w-12" />
          ) : (
            <Text className="text-xl">👤</Text>
          )}
        </View>
        <View>
          <Text className="text-base font-bold text-foreground">{name}</Text>
          <View className="flex-row items-center gap-1 mt-0.5">
            <MapPin size={12} color="#8E8E8E" />
            <Text className="text-xs text-foreground-muted">{city}</Text>
          </View>
        </View>
      </View>
    </View>
  )
}
