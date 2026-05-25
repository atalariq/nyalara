import { useAuthStore } from '@/features/auth/store/authStore'
import { useEffect, useRef } from 'react'
import { deviceService } from '../services/deviceService'
import { useDeviceStore } from '../store/deviceStore'
import { useDeviceToggle } from './useDeviceToggle'

export function useSyncDevices() {
  const user = useAuthStore((s) => s.user)
  const isAuthLoading = useAuthStore((s) => s.isLoading)
  const setDevices = useDeviceStore((s) => s.setDevices)
  const setLoading = useDeviceStore((s) => s.setLoading)
  const clearDevices = useDeviceStore((s) => s.clearDevices)
  const { reconcileActiveDevices } = useDeviceToggle()
  const hasReconciled = useRef(false)

  useEffect(() => {
    if (isAuthLoading) {
      return
    }

    hasReconciled.current = false

    if (!user?.uid) {
      clearDevices()
      return
    }

    setLoading(true)

    const unsub = deviceService.listenUserDevices(user.uid, (result) => {
      setDevices(result)
      setLoading(false)

      if (!hasReconciled.current && result.length > 0) {
        hasReconciled.current = true
        void reconcileActiveDevices(result)
      }
    })

    return () => unsub()
  }, [
    clearDevices,
    isAuthLoading,
    reconcileActiveDevices,
    setDevices,
    setLoading,
    user?.uid,
  ])
}
