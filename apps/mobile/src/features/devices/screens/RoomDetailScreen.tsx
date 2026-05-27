// features/devices/screens/RoomDetailScreen.tsx
import { useLocalSearchParams, useRouter } from 'expo-router'
import { Image, Pressable, ScrollView, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import type { LocationType } from '../types/device.types'
import { DeviceCard } from '../components/DeviceList/DeviceCard'
import { EditDeviceModal } from '../components/EditDeviceModal'
import { useState, useEffect } from 'react'
import { useDeviceList, type DeviceListItem } from '../hooks/useDeviceList'

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
  const { allItems, toggleActive, editDevice, deleteDevice } = useDeviceList()
  const router = useRouter()
  const [filter, setFilter] = useState<DeviceFilter>('all')
  const [now, setNow] = useState(Date.now())
  const [editingDevice, setEditingDevice] = useState<DeviceListItem | null>(null)

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
    <View className="flex-1 bg-[#28D67B]">
      <SafeAreaView edges={['top']} className="flex-1">
        {/* BACKGROUND BLOBS */}
        <View
          style={{
            position: 'absolute',
            top: 80,
            left: -90,
            width: 240,
            height: 240,
            borderRadius: 999,
            backgroundColor: 'rgba(255,255,255,0.15)',
          }}
        />
        <View
          style={{
            position: 'absolute',
            top: 40,
            right: -100,
            width: 280,
            height: 280,
            borderRadius: 999,
            backgroundColor: 'rgba(255,255,255,0.12)',
          }}
        />

        {/* ROOM LABEL */}
        <View className="px-4 pt-4">
          <View className="bg-[#1d1d1d] py-3 rounded-full items-center">
            <Text className="text-[15px] font-bold text-white">{config.label}</Text>
          </View>
        </View>

        {/* HERO IMAGE */}
        <View className="relative mx-4 mt-4 h-[180px] overflow-hidden rounded-[24px]">
          <Image source={config.image} resizeMode="cover" className="absolute h-full w-full" />
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

        {/* CARD PUTIH */}
        <View className="mt-4 flex-1 rounded-t-[36px] bg-white px-4 pt-6">
          {/* FILTER BAR */}
          <View className="mb-4 flex-row items-center gap-3">
            <View className="flex-1 flex-row rounded-full bg-[#F5F5F5] p-1">
              {(['all', 'active'] as DeviceFilter[]).map((f) => (
                <Pressable
                  key={f}
                  onPress={() => setFilter(f)}
                  className={`flex-1 items-center justify-center rounded-full px-4 py-3 ${
                    filter === f ? 'bg-[#25CE7F]' : 'bg-transparent'
                  }`}
                >
                  <Text
                    className={`font-semibold ${filter === f ? 'text-white' : 'text-[#4B5563]'}`}
                  >
                    {f === 'all' ? 'All' : 'Active'}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Pressable className="h-12 w-32 flex-row items-center justify-center gap-1 rounded-full border border-[#25CE7F]">
              <Text className="text-[20px] text-[#25CE7F]">+</Text>
              <Text className="text-[13px] font-semibold text-[#25CE7F]">Add Device</Text>
            </Pressable>
          </View>

          {/* LIST */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ gap: 12, paddingBottom: 120 }}
          >
            {filtered.length === 0 ? (
              <View className="mt-8 items-center">
                <Text className="text-[#888]">No devices in this room.</Text>
              </View>
            ) : (
              filtered.map((device) => (
                <DeviceCard
                  key={device.id}
                  device={device}
                  now={now}
                  onToggle={toggleActive}
                  onEdit={(id) => setEditingDevice(allItems.find((d) => d.id === id) ?? null)}
                />
              ))
            )}
          </ScrollView>
        </View>

        {/* EDIT MODAL */}
        <EditDeviceModal
          device={editingDevice}
          visible={!!editingDevice}
          onClose={() => setEditingDevice(null)}
          onSave={editDevice}
          onDelete={deleteDevice}
        />
      </SafeAreaView>
    </View>
  )
}
