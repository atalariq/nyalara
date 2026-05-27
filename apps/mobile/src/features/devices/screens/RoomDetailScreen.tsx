// features/devices/screens/RoomDetailScreen.tsx
import { useLocalSearchParams, useRouter } from 'expo-router'
import { Image, Pressable, ScrollView, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useDevices } from '../hooks/useDevices'
import type { LocationType } from '../types/device.types'
import { DeviceCard } from '../components/DeviceList/DeviceCard'
import { useState, useEffect } from 'react'
import { ChevronLeft } from 'lucide-react-native'
import { useDeviceList } from '../hooks/useDeviceList'

const ROOM_CONFIG: Record<LocationType, { label: string; image: any }> = {
  bedroom: { label: 'Bedroom', image: require('@/assets/images/room/bedroom.png') },
  living_room: { label: 'Living Room', image: require('@/assets/images/room/living-room.png') },
  kitchen: { label: 'Kitchen', image: require('@/assets/images/room/kitchen.png') },
  bathroom: { label: 'Bathroom', image: require('@/assets/images/room/bathroom.png') },
  dining_room: { label: 'Dining Room', image: require('@/assets/images/room/dining-room.png') },
  other: { label: 'Other', image: require('@/assets/images/room/other.png') },
}

type DeviceFilter = 'all' | 'active'

export function RoomDetailScreen() {
  const { location } = useLocalSearchParams<{ location: LocationType }>()
  const { allItems, toggleActive } = useDeviceList()
  const router = useRouter()
  const [filter, setFilter] = useState<DeviceFilter>('all')
  const [now, setNow] = useState(Date.now())

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(interval)
  }, [])

  const config = ROOM_CONFIG[location]
  const roomDevices = allItems.filter((d) => d.location === location)
  const activeCount = roomDevices.filter((d) => d.active).length
  const totalKwh = roomDevices.reduce((sum, d) => sum + (d.watt * 24 * 30) / 1000, 0)
  const filtered = filter === 'active' ? roomDevices.filter((d) => d.active) : roomDevices

  return (
    <View className="flex-1 bg-[#F0F7F2]">
      <SafeAreaView edges={['top']} className="flex-1">
        <View className="relative mx-4 mt-4 h-[180px] overflow-hidden rounded-[24px]">
          <Image source={config.image} resizeMode="cover" className="absolute h-full w-full" />

          <Pressable
            onPress={() => router.back()}
            className="absolute left-4 top-4 h-9 w-9 items-center justify-center rounded-full bg-black/30"
          >
            <ChevronLeft size={20} color="#fff" />
          </Pressable>

          <View className="absolute left-0 right-0 top-4 items-center">
            <View className="rounded-full bg-black/30 px-6 py-2">
              <Text className="text-[15px] font-bold text-white">{config.label}</Text>
            </View>
          </View>

          <View className="absolute bottom-4 left-5 right-5 flex-row items-end justify-between">
            <Text className="text-[22px] font-bold text-white">{totalKwh.toFixed(0)} KWH</Text>
            <View className="items-end">
              <Text style={{ fontSize: 28, fontWeight: '300', color: '#fff', lineHeight: 30 }}>
                {activeCount}/{roomDevices.length}
              </Text>
              <Text className="text-[12px] font-medium text-white/90">Device Active</Text>
            </View>
          </View>
        </View>

        <View className="mx-4 mt-4 flex-row items-center gap-3">
          <View className="flex-1 flex-row rounded-full bg-white p-1 shadow-sm shadow-black/5">
            {(['all', 'active'] as DeviceFilter[]).map((f) => (
              <Pressable
                key={f}
                onPress={() => setFilter(f)}
                className={`flex-1 items-center justify-center rounded-full px-4 py-3 ${
                  filter === f ? 'bg-[#25CE7F]' : 'bg-transparent'
                }`}
              >
                <Text className={`font-semibold ${filter === f ? 'text-white' : 'text-[#4B5563]'}`}>
                  {f === 'all' ? 'All' : 'Active'}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <ScrollView
          className="mt-4 flex-1"
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 120, gap: 12 }}
          showsVerticalScrollIndicator={false}
        >
          {filtered.length === 0 ? (
            <View className="mt-8 items-center">
              <Text className="text-[#888]">No devices in this room.</Text>
            </View>
          ) : (
            filtered.map((device) => (
              <DeviceCard key={device.id} device={device} now={now} onToggle={toggleActive} />
            ))
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  )
}
