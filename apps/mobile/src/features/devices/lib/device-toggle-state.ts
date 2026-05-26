import type { Device } from '../types/device.types'

export function toggleDeviceState(device: Device, nowMs: number): Device {
  if (device.active) {
    return {
      ...device,
      active: false,
      activatedAt: null,
    }
  }

  return {
    ...device,
    active: true,
    activatedAt: nowMs,
  }
}

export function updateDevicesAfterToggle(
  devices: Device[],
  deviceId: string,
  nowMs: number,
): Device[] {
  return devices.map((device) =>
    device.id === deviceId ? toggleDeviceState(device, nowMs) : device,
  )
}
