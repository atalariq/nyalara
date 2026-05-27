import { useAuthStore } from '@/features/auth/store/authStore'
import { energyHistoryService } from '@/features/energy/services/energyHistoryService'
import { useEffect, useRef } from 'react'
import { useDeviceStore } from '../store/deviceStore'
import { createActiveDeviceFlushRuntime } from '../lib/active-device-flush-runtime'

const FLUSH_INTERVAL_MS = 10_000

export function useActiveDeviceTimer() {
  const user = useAuthStore((s) => s.user)
  const devices = useDeviceStore((s) => s.devices)
  const runtimeRef = useRef(
    createActiveDeviceFlushRuntime({
      intervalMs: FLUSH_INTERVAL_MS,
      async flushUsage({ userId, deviceId, name, watt, durationMinutes, kwh }) {
        await energyHistoryService.accumulateDeviceUsage(userId, new Date(), deviceId, {
          name,
          watt,
          durationMinutes,
          kwh,
        })
      },
    }),
  )

  useEffect(() => {
    if (!user?.uid) return

    runtimeRef.current.sync({ userId: user.uid, devices })

    return () => {
      runtimeRef.current.dispose()
    }
  }, [devices, user?.uid])
}
