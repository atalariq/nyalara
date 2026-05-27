import assert from 'node:assert/strict'
import test from 'node:test'

import { createSetupStatusService } from './setup-status-service.ts'

test('setup status rejects accounts that do not have a stored profile yet', async () => {
  const service = createSetupStatusService({
    profileService: {
      getProfile: async () => null,
    },
    deviceService: {
      getUserDevices: async () => {
        throw new Error('device inventory should not be fetched without a stored profile')
      },
    },
  })

  const result = await service.getStatus('user-1')

  assert.deepEqual(result, {
    hasProfile: false,
    deviceCount: 0,
    isSetupComplete: false,
  })
})

test('setup status keeps registered accounts without devices in onboarding', async () => {
  const service = createSetupStatusService({
    profileService: {
      getProfile: async () => ({ uid: 'user-1' }),
    },
    deviceService: {
      getUserDevices: async () => [],
    },
  })

  const result = await service.getStatus('user-1')

  assert.deepEqual(result, {
    hasProfile: true,
    deviceCount: 0,
    isSetupComplete: false,
  })
})

test('setup status marks accounts with a stored profile and at least one device as setup-complete', async () => {
  const service = createSetupStatusService({
    profileService: {
      getProfile: async () => ({ uid: 'user-1' }),
    },
    deviceService: {
      getUserDevices: async () => [{ id: 'device-1' }],
    },
  })

  const result = await service.getStatus('user-1')

  assert.deepEqual(result, {
    hasProfile: true,
    deviceCount: 1,
    isSetupComplete: true,
  })
})
