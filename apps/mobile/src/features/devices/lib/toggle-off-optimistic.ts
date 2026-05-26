import type { Device } from '../types/device.types'

type Params = {
  deviceId: string
  devices: Device[]
  setDevices: (devices: Device[]) => void
  setToggling: (id: string, value: boolean) => void
  persistToggleOff: () => Promise<void>
}

export type ToggleOffResult = 'persisted' | 'rolled_back'

export async function toggleOffWithOptimisticUpdate({
  deviceId,
  devices,
  setDevices,
  setToggling,
  persistToggleOff,
}: Params): Promise<ToggleOffResult> {
  const applyToggle = () =>
    devices.map((device) =>
      device.id === deviceId
        ? {
            ...device,
            active: false,
            activatedAt: null,
          }
        : device,
    )

  setToggling(deviceId, true)
  setDevices(applyToggle())

  try {
    await persistToggleOff()
    return 'persisted'
  } catch {
    setDevices(devices)
    return 'rolled_back'
  } finally {
    setToggling(deviceId, false)
  }
}
