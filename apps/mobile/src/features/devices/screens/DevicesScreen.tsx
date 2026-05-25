import { LinearGradient } from 'expo-linear-gradient'
import { useEffect, useState } from 'react'
import { ScrollView, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { AddDeviceSheet } from '../components/AddDeviceSheet'

import {
  DeviceCard,
  DeviceEmptyState,
  DeviceFilterBar,
  DeviceScreenHeader,
  DeviceStatsRow,
} from '../components/DeviceList'

import { useActiveDeviceTimer } from '../hooks/useActiveDeviceTimer'
import { useDeviceList } from '../hooks/useDeviceList'
import { useAddDeviceSheetStore } from '../store/addDeviceSheetStore'

export default function DevicesScreen() {
  useActiveDeviceTimer()

  const [now, setNow] = useState(Date.now())

  const { isOpen: isAddSheetVisible, setOpen: setIsAddSheetVisible } = useAddDeviceSheetStore()

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now())
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const {
    allItems,
    filteredItems,
    filter,
    setFilter,
    activeCount,
    highestConsumer,
    mostActive,
    toggleActive,
  } = useDeviceList()

  return (
    <View className="flex-1 bg-[#EEF7F1]">
      {/* TOP GRADIENT */}
      <LinearGradient
        colors={['#28D67B', '#6BE7B2']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 260,
        }}
      />

      {/* BACKGROUND BLOBS */}
      <View
        style={{
          position: 'absolute',
          top: 120,
          left: -90,
          width: 240,
          height: 240,
          borderRadius: 999,
          backgroundColor: 'rgba(255,255,255,0.5)',
        }}
      />

      <View
        style={{
          position: 'absolute',
          top: 90,
          right: -100,
          width: 280,
          height: 280,
          borderRadius: 999,
          backgroundColor: 'rgba(255,255,255,0.45)',
        }}
      />

      <SafeAreaView edges={['top']} className="flex-1">
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingBottom: 140,
          }}
        >
          {/* HEADER */}
          <DeviceScreenHeader totalCount={allItems.length} activeCount={activeCount} />

          {/* STATS */}
          <DeviceStatsRow highestConsumer={highestConsumer} mostActive={mostActive} />

          {/* FILTER BAR */}
          <DeviceFilterBar
            selected={filter}
            onSelect={setFilter}
            onAddPress={() => setIsAddSheetVisible(true)}
          />

          {/* DEVICE LIST */}
          <View className="mt-4 gap-3">
            {filteredItems.length === 0 ? (
              <DeviceEmptyState />
            ) : (
              filteredItems.map((device) => (
                <DeviceCard key={device.id} device={device} now={now} onToggle={toggleActive} />
              ))
            )}
          </View>
        </ScrollView>

        {/* SHEET */}
        <AddDeviceSheet visible={isAddSheetVisible} onClose={() => setIsAddSheetVisible(false)} />
      </SafeAreaView>
    </View>
  )
}
