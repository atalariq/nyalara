import assert from 'node:assert/strict'
import test from 'node:test'

import {
  createProtectedApiClient,
  isProtectedApiAuthError,
  PROTECTED_API_AUTH_REQUIRED_MESSAGE,
} from './protected-api-client.ts'

test('protected api client rejects requests when no authenticated Firebase user exists', async () => {
  let fetchCalled = false

  const client = createProtectedApiClient({
    authInstance: {
      currentUser: null,
    },
    baseUrl: 'http://localhost:3000',
    fetchImpl: async () => {
      fetchCalled = true
      throw new Error('fetch should not be called')
    },
  })

  await assert.rejects(
    () =>
      client.post('/v1/calculate-electricity', {
        inputType: 'kwh',
      }),
    /authenticated Firebase user/i,
  )

  assert.equal(fetchCalled, false)
})

test('protected api client exposes a stable auth-transition error matcher', () => {
  assert.equal(
    isProtectedApiAuthError(new Error(PROTECTED_API_AUTH_REQUIRED_MESSAGE)),
    true,
  )
  assert.equal(isProtectedApiAuthError(new Error('different error')), false)
  assert.equal(isProtectedApiAuthError('not an error'), false)
})

test('protected api client waits for auth readiness before reading the Firebase user', async () => {
  let fetchCalled = false

  const authInstance = {
    currentUser: null,
  }

  const client = createProtectedApiClient({
    authInstance,
    waitForAuthReady: async () => {
      authInstance.currentUser = {
        async getIdToken() {
          return 'firebase-id-token'
        },
      }
    },
    baseUrl: 'http://localhost:3000',
    fetchImpl: async () => {
      fetchCalled = true

      return {
        async json() {
          return { success: true }
        },
      }
    },
  })

  await client.get('/v1/devices')

  assert.equal(fetchCalled, true)
})

test('protected api client attaches a bearer token from the current Firebase user', async () => {
  let requestUrl = ''
  let requestInit

  const client = createProtectedApiClient({
    authInstance: {
      currentUser: {
        async getIdToken() {
          return 'firebase-id-token'
        },
      },
    },
    baseUrl: 'http://localhost:3000',
    fetchImpl: async (url, init) => {
      requestUrl = String(url)
      requestInit = init

      return {
        async json() {
          return { success: true }
        },
      }
    },
  })

  await client.post('/v1/calculate-electricity', {
    inputType: 'kwh',
  })

  assert.equal(requestUrl, 'http://localhost:3000/v1/calculate-electricity')
  assert.equal(requestInit?.method, 'POST')
  assert.equal(requestInit?.headers instanceof Headers, true)
  assert.equal(
    requestInit?.headers.get('authorization'),
    'Bearer firebase-id-token',
  )
  assert.equal(requestInit?.headers.get('content-type'), 'application/json')
  assert.deepEqual(JSON.parse(String(requestInit?.body)), {
    inputType: 'kwh',
  })
})
