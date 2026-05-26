import { useAuthStore } from '@/features/auth/store/authStore'
import { useEffect } from 'react'
import { deviceService } from '../services/deviceService'
import { useDeviceStore } from '../store/deviceStore'

export function useSyncDevices() {
  const user = useAuthStore((s) => s.user)
  const isAuthLoading = useAuthStore((s) => s.isLoading)
  const setDevices = useDeviceStore((s) => s.setDevices)
  const setLoading = useDeviceStore((s) => s.setLoading)
  const clearDevices = useDeviceStore((s) => s.clearDevices)

  useEffect(() => {
    if (isAuthLoading) {
      return
    }

    if (!user?.uid) {
      clearDevices()
      return
    }

    setLoading(true)

    const unsub = deviceService.listenUserDevices(user.uid, (result) => {
      setDevices(result)
      setLoading(false)
    })

    return () => unsub()
  }, [clearDevices, isAuthLoading, setDevices, setLoading, user?.uid])
}
