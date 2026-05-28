import type { Device } from '../types/device.types'

const MOCK_DEVICES: Device[] = [
  {
    id: '1',
    userId: 'mock-user',
    name: 'AC Kamar',
    category: 'appliances',
    deviceType: 'ac',
    watt: 900,
    hoursPerDay: 8,
    daysPerMonth: 30,
    active: false,
    activatedAt: null,
    monthlyKwh: 216,
    monthlyEmissions: 94.18,
    monthlyCost: 312055,
    createdAt: Date.now(),
    location: 'bedroom',
  },
  {
    id: '2',
    userId: 'mock-user',
    name: 'Kulkas',
    category: 'appliances',
    deviceType: 'fridge',
    watt: 150,
    hoursPerDay: 24,
    daysPerMonth: 30,
    active: true,
    activatedAt: Date.now() - 3600000,
    monthlyKwh: 108,
    monthlyEmissions: 47.09,
    monthlyCost: 156028,
    createdAt: Date.now(),
    location: 'kitchen',
  },
  {
    id: '3',
    userId: 'mock-user',
    name: 'TV LED 43"',
    category: 'electronics',
    deviceType: 'tv',
    watt: 80,
    hoursPerDay: 5,
    daysPerMonth: 30,
    active: false,
    activatedAt: null,
    monthlyKwh: 12,
    monthlyEmissions: 5.23,
    monthlyCost: 17336,
    createdAt: Date.now(),
    location: 'living_room',
  },
]

const delay = (ms = 500) => new Promise((res) => setTimeout(res, ms))

export const mockDeviceService = {
  async addDevice(_userId: string, payload: any): Promise<Device> {
    await delay(400)
    return {
      ...payload,
      id: Math.random().toString(36).slice(2),
      userId: _userId,
      createdAt: Date.now(),
    }
  },

  async getUserDevices(_userId: string): Promise<Device[]> {
    await delay()
    return MOCK_DEVICES
  },

  listenUserDevices(_userId: string, onData: (devices: Device[]) => void) {
    delay().then(() => onData(MOCK_DEVICES))
    return () => {}
  },

  async updateDevice(_deviceId: string, _payload: any): Promise<void> {
    await delay(300)
  },

  async deleteDevice(_deviceId: string): Promise<void> {
    await delay(300)
  },
}
