import assert from 'node:assert/strict'
import test from 'node:test'

import { getPostAuthRoute } from './post-auth-route.ts'

test('Google auth from register flow continues into onboarding intro', () => {
  assert.deepEqual(getPostAuthRoute({ entryPoint: 'register' }), {
    action: 'allow',
    route: '/(onboarding)/intro',
  })
})

test('Google auth from login flow rejects accounts that do not have a stored profile yet', () => {
  assert.deepEqual(
    getPostAuthRoute({
      entryPoint: 'login',
      hasProfile: false,
      deviceCount: 0,
    }),
    {
      action: 'reject',
      route: '/(auth)/register',
    },
  )
})

test('Google auth from login flow sends registered accounts without devices back into onboarding', () => {
  assert.deepEqual(
    getPostAuthRoute({
      entryPoint: 'login',
      hasProfile: true,
      deviceCount: 0,
    }),
    {
      action: 'allow',
      route: '/(onboarding)/intro',
    },
  )
})

test('Google auth from login flow sends setup-complete accounts into the app shell', () => {
  assert.deepEqual(
    getPostAuthRoute({
      entryPoint: 'login',
      hasProfile: true,
      deviceCount: 2,
    }),
    {
      action: 'allow',
      route: '/(app)/dashboard',
    },
  )
})
