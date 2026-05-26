import assert from 'node:assert/strict'
import test from 'node:test'

import { shouldHideSplashScreen } from './startup-policy.ts'

test('shouldHideSplashScreen waits for both fonts and auth readiness', () => {
  assert.equal(
    shouldHideSplashScreen({
      fontsLoaded: true,
      isAuthLoading: true,
    }),
    false,
  )

  assert.equal(
    shouldHideSplashScreen({
      fontsLoaded: true,
      isAuthLoading: false,
    }),
    true,
  )
})
