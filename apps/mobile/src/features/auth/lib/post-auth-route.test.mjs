import assert from 'node:assert/strict'
import test from 'node:test'

import { getPostAuthRoute } from './post-auth-route.ts'

test('Register flow continues into onboarding intro', () => {
  assert.deepEqual(getPostAuthRoute({ entryPoint: 'register' }), {
    action: 'allow',
    route: '/(onboarding)/intro',
  })
})

test('Login flow rejects accounts without a stored profile', () => {
  assert.deepEqual(
    getPostAuthRoute({
      entryPoint: 'login',
      hasProfile: false,
    }),
    {
      action: 'reject',
      route: '/(auth)/register',
    },
  )
})

test('Login flow sends accounts with a profile to dashboard even with zero devices', () => {
  assert.deepEqual(
    getPostAuthRoute({
      entryPoint: 'login',
      hasProfile: true,
    }),
    {
      action: 'allow',
      route: '/(app)/dashboard',
    },
  )
})
