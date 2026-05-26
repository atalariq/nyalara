import assert from 'node:assert/strict'
import test from 'node:test'

import {
  shouldHideSplashScreen,
  shouldRenderNonCriticalOverlays,
} from './startup-policy.ts'

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

test('shouldRenderNonCriticalOverlays waits for first paint on app routes', () => {
  assert.equal(
    shouldRenderNonCriticalOverlays({
      shellReady: true,
      hasPainted: false,
      isAppRoute: true,
    }),
    false,
  )

  assert.equal(
    shouldRenderNonCriticalOverlays({
      shellReady: true,
      hasPainted: true,
      isAppRoute: false,
    }),
    false,
  )

  assert.equal(
    shouldRenderNonCriticalOverlays({
      shellReady: true,
      hasPainted: true,
      isAppRoute: true,
    }),
    true,
  )
})
