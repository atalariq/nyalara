import { useMemo, useState } from 'react'
import Toast from 'react-native-toast-message'
import { deviceService } from '../services/deviceService'
import { updateDevicesAfterToggle } from '../lib/device-toggle-state'
import { toggleOffWithOptimisticUpdate } from '../lib/toggle-off-optimistic'
import { useDeviceStore } from '../store/deviceStore'
import { useTogglingStore } from '../store/togglingStore'
import type { Device } from '../types/device.types'
import { useDevices } from './useDevices'
import { useDeviceToggle } from './useDeviceToggle'

export type DeviceListItem = {
  id: string
  name: string
  category: string
  watt: number
  usageLabel: string
  active: boolean
  activatedAt?: number | null
}

export type DeviceFilter = 'all' | 'active'

function toUsageLabel(device: Device): string {
  if (device.monthlyKwh != null) return `${device.monthlyKwh.toFixed(1)} kWh/mo`
  return `${device.hoursPerDay.toFixed(1)}h/day`
}

export function useDeviceList() {
  const { devices } = useDevices()
  const setDevices = useDeviceStore((s) => s.setDevices)
  const { toggleDevice } = useDeviceToggle()
  const { setToggling } = useTogglingStore()
  const [filter, setFilter] = useState<DeviceFilter>('all')

  const allItems = useMemo<DeviceListItem[]>(
    () =>
      devices.map((device) => ({
        id: device.id,
        name: device.name,
        category: device.category,
        watt: device.watt,
        usageLabel: toUsageLabel(device),
        active: device.active,
        activatedAt: device.activatedAt,
      })),
    [devices],
  )

  const filteredItems = useMemo(
    () => (filter === 'active' ? allItems.filter((d) => d.active) : allItems),
    [filter, allItems],
  )

  const activeCount = allItems.filter((d) => d.active).length

  const highestConsumer = allItems.length
    ? allItems.reduce((best, d) => (d.watt > best.watt ? d : best))
    : null

  const mostActive = allItems.length
    ? allItems.reduce((best, d) =>
        d.usageLabel.localeCompare(best.usageLabel) > 0 ? d : best,
      )
    : null

  async function toggleActive(id: string) {
    const device = devices.find((item) => item.id === id)
    if (!device) return
    const now = new Date()
    try {
      if (!device.active) {
        await deviceService.updateDevice(id, {
          active: true,
          activatedAt: now.getTime(),
        })
        setDevices(updateDevicesAfterToggle(devices, id, now.getTime()))
        Toast.show({
          type: 'success',
          text1: 'Device turned on',
          text2: device.name,
          visibilityTime: 1800,
        })
      } else {
        const result = await toggleOffWithOptimisticUpdate({
          deviceId: id,
          devices,
          setDevices,
          setToggling,
          persistToggleOff: async () => {
            await toggleDevice(device)
          },
        })

        if (result === 'persisted') {
          Toast.show({
            type: 'success',
            text1: 'Device turned off',
            text2: device.name,
            visibilityTime: 1800,
          })
        } else {
          Toast.show({
            type: 'error',
            text1: 'Failed to turn off device',
            text2: 'Restored previous state.',
            visibilityTime: 2200,
          })
        }
      }
    } catch (error) {
      console.error('Failed to update device state:', error)
      setToggling(id, false)
      Toast.show({
        type: 'error',
        text1: 'Device update failed',
        text2: 'Please try again.',
        visibilityTime: 2200,
      })
    }
  }

  return {
    allItems,
    filteredItems,
    filter,
    setFilter,
    activeCount,
    highestConsumer,
    mostActive,
    toggleActive,
  }
}
