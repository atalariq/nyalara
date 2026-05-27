import assert from 'node:assert/strict'
import test from 'node:test'

import { shouldUseMockDeviceService } from './device-service-mode.ts'

test('device service uses mock only when the explicit mock flag is enabled', () => {
  assert.equal(
    shouldUseMockDeviceService({
      EXPO_PUBLIC_API_BASE_URL: '',
      EXPO_PUBLIC_USE_MOCK_DEVICES: undefined,
    }),
    false,
  )

  assert.equal(
    shouldUseMockDeviceService({
      EXPO_PUBLIC_API_BASE_URL: 'http://localhost:3000',
      EXPO_PUBLIC_USE_MOCK_DEVICES: 'true',
    }),
    true,
  )

  assert.equal(
    shouldUseMockDeviceService({
      EXPO_PUBLIC_API_BASE_URL: 'http://localhost:3000',
      EXPO_PUBLIC_USE_MOCK_DEVICES: 'false',
    }),
    false,
  )
})
