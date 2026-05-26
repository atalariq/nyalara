import assert from 'node:assert/strict'
import test from 'node:test'

import { mobileFeatureFlags } from './mobile-feature-flags.ts'

test('mobile MVP disables unready auth and chat entry points', () => {
  assert.deepEqual(mobileFeatureFlags, {
    appleAuth: false,
    chatbot: false,
  })
})
