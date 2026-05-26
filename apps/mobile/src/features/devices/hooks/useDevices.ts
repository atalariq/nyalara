import { useDeviceStore } from '../store/deviceStore'

export const useDevices = () => {
  const devices = useDeviceStore((s) => s.devices)
  const isLoading = useDeviceStore((s) => s.isLoading)

  return { devices, isLoading }
}
