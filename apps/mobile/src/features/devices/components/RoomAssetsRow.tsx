// features/devices/components/RoomAssetsRow.tsx
import { useDevices } from '../hooks/useDevices'
import type { LocationType } from '../types/device.types'
import { Image, ImageSourcePropType, Pressable, ScrollView, Text, View } from 'react-native'
import { useRouter } from 'expo-router'

const ROOM_CONFIG: Record<LocationType, { label: string; image: ImageSourcePropType }> = {
  bedroom: { label: 'Bedroom', image: require('@/assets/images/room/bedroom.png') },
  living_room: { label: 'Living Room', image: require('@/assets/images/room/living-room.png') },
  kitchen: { label: 'Kitchen', image: require('@/assets/images/room/kitchen.png') },
  bathroom: { label: 'Bathroom', image: require('@/assets/images/room/bathroom.png') },
  dining_room: { label: 'Dining Room', image: require('@/assets/images/room/dining-room.png') },
  other: { label: 'Other', image: require('@/assets/images/room/other.png') },
}

export function RoomAssetsRow() {
  const { devices } = useDevices()

  const grouped = devices.reduce<Partial<Record<LocationType, typeof devices>>>((acc, device) => {
    const key = (device.location ?? 'other') as LocationType
    if (!acc[key]) acc[key] = []
    acc[key]!.push(device)
    return acc
  }, {})

  const rooms = Object.entries(grouped) as [LocationType, typeof devices][]

  if (rooms.length === 0) return null

  return (
    <View className="mb-6">
      <View className="mb-3 flex-row items-center justify-between">
        <Text className="text-[16px] font-extrabold text-[#111]">Room Assets</Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 16, paddingRight: 24 }}
      >
        {rooms.map(([location, items]) => (
          <RoomCard key={location} location={location} devices={items} />
        ))}
      </ScrollView>
    </View>
  )
}

type RoomCardProps = {
  location: LocationType
  devices: { watt: number; active: boolean; monthlyKwh?: number }[]
}

function RoomCard({ location, devices }: RoomCardProps) {
  const router = useRouter()

  const config = ROOM_CONFIG[location]
  const activeCount = devices.filter((d) => d.active).length
  const totalKwh = devices.reduce((sum, d) => sum + (d.monthlyKwh ?? 0), 0)

  return (
    <Pressable
      className="relative h-[160px] w-[270px] overflow-hidden rounded-[24px]"
      onPress={() => router.push(`/(app)/room/${location}`)}
    >
      <Image source={config.image} resizeMode="cover" className="absolute h-full w-full" />

      {/* Top row */}
      <View className="absolute left-[14px] right-[14px] top-[14px] flex-row items-center justify-between">
        <View className="rounded-full bg-black/35 px-4 py-2">
          <Text className="text-[15px] font-bold text-white">{config.label}</Text>
        </View>
        <View className="rounded-full bg-white/90 px-3 py-2">
          <Text className="text-[14px] font-bold text-[#25CE7F]">{totalKwh.toFixed(0)} kWh</Text>
        </View>
      </View>

      {/* Bottom right */}
      <View className="absolute bottom-[18px] right-[18px] items-end">
        <Text className="text-white" style={{ fontSize: 34, fontWeight: '300', lineHeight: 36 }}>
          {activeCount}/{devices.length}
        </Text>
        <Text className="text-[13px] font-medium tracking-[0.3px] text-white/90">
          Device Active
        </Text>
      </View>
    </Pressable>
  )
}
