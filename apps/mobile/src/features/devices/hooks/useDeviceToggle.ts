import { useAuthStore } from '@/features/auth/store/authStore'
import { dailyUsageService } from '@/features/energy/services/dailyUsageService'
import { deviceService } from '../services/deviceService'
import type { Device } from '../types/device.types'

export function useDeviceToggle() {
  const user = useAuthStore((s) => s.user)

  async function toggleDevice(device: Device): Promise<void> {
    if (!user?.uid) return
    const now = new Date()

    if (!device.active) {
      await deviceService.updateDevice(device.id, {
        active: true,
        activatedAt: now.getTime(),
      })
    } else {
      if (device.activatedAt) {
        await dailyUsageService.recordSession(user.uid, now, device.id, {
          startedAt: device.activatedAt,
          endedAt: now.getTime(),
        })
      }
      await deviceService.updateDevice(device.id, {
        active: false,
        activatedAt: null,
      })
    }
  }

  async function reconcileActiveDevices(devices: Device[]): Promise<void> {
    if (!user?.uid) return
    const now = new Date()
    const activeDevices = devices.filter((d) => d.active && d.activatedAt)

    await Promise.all(
      activeDevices.map(async (d) => {
        // Flush duration yang terlewat sejak activatedAt
        const durationMs = now.getTime() - d.activatedAt!
        const durationMinutes = durationMs / 1000 / 60
        const kwh = (d.watt * (durationMinutes / 60)) / 1000

        if (durationMinutes > 0) {
          await dailyUsageService.accumulateDeviceUsage(user.uid!, now, d.id, {
            name: d.name,
            watt: d.watt,
            durationMinutes,
            kwh,
          })
        }

        // Reset activatedAt supaya timer mulai dari sekarang
        await deviceService.updateDevice(d.id, {
          activatedAt: now.getTime(),
        })
      }),
    )
  }

  return { toggleDevice, reconcileActiveDevices }
}
