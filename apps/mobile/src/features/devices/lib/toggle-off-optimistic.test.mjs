import assert from 'node:assert/strict'
import test from 'node:test'

import { toggleOffWithOptimisticUpdate } from './toggle-off-optimistic.ts'

test('toggleOffWithOptimisticUpdate rolls back local state when persistence fails', async () => {
  const originalDevices = [
    {
      id: 'device-1',
      userId: 'user-1',
      name: 'Fan',
      category: 'appliances',
      deviceType: 'ac',
      watt: 70,
      hoursPerDay: 3,
      daysPerMonth: 30,
      active: true,
      activatedAt: 1_700_000_000_000,
      createdAt: 1_690_000_000_000,
    },
  ]

  const deviceSnapshots = []
  const togglingStates = []

  const result = await toggleOffWithOptimisticUpdate({
    deviceId: 'device-1',
    devices: originalDevices,
    setDevices(next) {
      deviceSnapshots.push(next)
    },
    setToggling(id, value) {
      togglingStates.push({ id, value })
    },
    async persistToggleOff() {
      throw new Error('network down')
    },
  })

  assert.equal(result, 'rolled_back')
  assert.equal(deviceSnapshots.length, 2)
  assert.equal(deviceSnapshots[0][0].active, false)
  assert.equal(deviceSnapshots[1][0].active, true)
  assert.deepEqual(togglingStates, [
    { id: 'device-1', value: true },
    { id: 'device-1', value: false },
  ])
})
