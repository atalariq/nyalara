type ActiveDevice = {
  id: string
  name: string
  watt: number
  active: boolean
  activatedAt?: number | null
}

type FlushInput = {
  userId: string
  deviceId: string
  name: string
  watt: number
  durationMinutes: number
  kwh: number
}

type RuntimeDependencies = {
  intervalMs: number
  nowMs?: () => number
  setIntervalFn?: (callback: () => void | Promise<void>, ms: number) => number
  clearIntervalFn?: (id: number) => void
  flushUsage: (input: FlushInput) => Promise<void>
}

export function createActiveDeviceFlushRuntime({
  intervalMs,
  nowMs = () => Date.now(),
  setIntervalFn = (callback, ms) => setInterval(callback, ms) as unknown as number,
  clearIntervalFn = (id) => clearInterval(id),
  flushUsage,
}: RuntimeDependencies) {
  const intervalByDeviceId: Record<string, number> = {}
  const lastFlushedAtByDeviceId: Record<string, number> = {}

  async function flushDevice(userId: string, device: ActiveDevice) {
    const now = nowMs()
    const lastFlushed =
      lastFlushedAtByDeviceId[device.id] ?? (device.activatedAt as number)
    const durationMs = now - lastFlushed

    if (durationMs <= 0) {
      return
    }

    const durationMinutes = durationMs / 1000 / 60
    const kwh = (device.watt * (durationMinutes / 60)) / 1000

    await flushUsage({
      userId,
      deviceId: device.id,
      name: device.name,
      watt: device.watt,
      durationMinutes,
      kwh,
    })

    lastFlushedAtByDeviceId[device.id] = now
  }

  return {
    sync({ userId, devices }: { userId: string; devices: ActiveDevice[] }) {
      const activeDevices = devices.filter((d) => d.active && d.activatedAt)
      const activeIds = new Set(activeDevices.map((d) => d.id))

      Object.keys(intervalByDeviceId).forEach((deviceId) => {
        if (!activeIds.has(deviceId)) {
          clearIntervalFn(intervalByDeviceId[deviceId])
          delete intervalByDeviceId[deviceId]
          delete lastFlushedAtByDeviceId[deviceId]
        }
      })

      activeDevices.forEach((device) => {
        if (intervalByDeviceId[device.id]) {
          return
        }

        lastFlushedAtByDeviceId[device.id] = device.activatedAt as number

        const callback = () => {
          void flushDevice(userId, device).catch(() => {})
        }

        intervalByDeviceId[device.id] = setIntervalFn(callback, intervalMs)
        void flushDevice(userId, device).catch(() => {})
      })
    },

    dispose() {
      Object.values(intervalByDeviceId).forEach(clearIntervalFn)
      Object.keys(intervalByDeviceId).forEach((deviceId) => {
        delete intervalByDeviceId[deviceId]
      })
      Object.keys(lastFlushedAtByDeviceId).forEach((deviceId) => {
        delete lastFlushedAtByDeviceId[deviceId]
      })
    },
  }
}
