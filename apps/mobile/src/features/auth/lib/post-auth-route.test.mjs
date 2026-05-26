import assert from 'node:assert/strict'
import test from 'node:test'

import { getPostAuthRoute } from './post-auth-route.ts'

test('Google auth from register flow continues into onboarding', () => {
  assert.equal(
    getPostAuthRoute({
      entryPoint: 'register',
    }),
    '/(onboarding)/intro',
  )
})

test('Google auth from login flow continues into the dashboard', () => {
  assert.equal(
    getPostAuthRoute({
      entryPoint: 'login',
    }),
    '/(app)/dashboard',
  )
})
