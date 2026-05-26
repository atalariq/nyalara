import assert from 'node:assert/strict'
import test from 'node:test'

import { toggleDeviceState, updateDevicesAfterToggle } from './device-toggle-state.ts'

test('toggleDeviceState turns an active device off and clears its activation time', () => {
  const device = {
    id: 'device-1',
    userId: 'user-1',
    name: 'Air Conditioner',
    category: 'appliances',
    deviceType: 'ac',
    watt: 1200,
    hoursPerDay: 4,
    daysPerMonth: 30,
    active: true,
    activatedAt: 1700000000000,
    createdAt: 1690000000000,
  }

  assert.deepEqual(toggleDeviceState(device, 1700000100000), {
    ...device,
    active: false,
    activatedAt: null,
  })
})

test('updateDevicesAfterToggle turns an inactive device on with a fresh activation time', () => {
  const devices = [
    {
      id: 'device-1',
      userId: 'user-1',
      name: 'Lamp',
      category: 'lighting',
      deviceType: 'lights',
      watt: 60,
      hoursPerDay: 3,
      daysPerMonth: 30,
      active: false,
      activatedAt: null,
      createdAt: 1690000000000,
    },
  ]

  assert.deepEqual(updateDevicesAfterToggle(devices, 'device-1', 1700000100000), [
    {
      ...devices[0],
      active: true,
      activatedAt: 1700000100000,
    },
  ])
})
