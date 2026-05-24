import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import {
  defaultEnvFilePath,
  mintAnonymousAuthToken,
} from './mint-anonymous-auth-token.mjs'

test('mints an anonymous Firebase token and prints the minimal JSON payload', async () => {
  const tempDir = mkdtempSync(join(tmpdir(), 'carbon-tracker-mobile-auth-'))
  const envFilePath = join(tempDir, '.env')

  writeFileSync(
    envFilePath,
    [
      'EXPO_PUBLIC_FIREBASE_API_KEY=test-api-key',
      'EXPO_PUBLIC_FIREBASE_PROJECT_ID=carbon-tracker-c1925',
    ].join('\n'),
  )

  const writes = []
  let requestUrl
  let requestInit

  const result = await mintAnonymousAuthToken({
    envFilePath,
    fetchImpl: async (url, init) => {
      requestUrl = url
      requestInit = init

      return {
        ok: true,
        async json() {
          return {
            localId: 'guest-uid',
            idToken: 'guest-id-token',
          }
        },
      }
    },
    stdout: {
      write(chunk) {
        writes.push(String(chunk))
        return true
      },
    },
  })

  assert.equal(
    requestUrl,
    'https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=test-api-key',
  )
  assert.deepEqual(JSON.parse(requestInit.body), {
    returnSecureToken: true,
  })
  assert.deepEqual(result, {
    projectId: 'carbon-tracker-c1925',
    uid: 'guest-uid',
    isAnonymous: true,
    idToken: 'guest-id-token',
  })
  assert.deepEqual(JSON.parse(writes.join('')), result)
})

test('defaults to apps/mobile/.env for local Firebase client configuration', () => {
  assert.match(defaultEnvFilePath, /apps\/mobile\/\.env$/)
})

test('documents the dev-only guest-session smoke test for the protected calculation route', () => {
  const firebaseSetupGuide = readFileSync(
    new URL('../../../docs/firebase-setup.md', import.meta.url),
    'utf8',
  )

  assert.match(firebaseSetupGuide, /dev-only/i)
  assert.match(firebaseSetupGuide, /mint-anonymous-auth-token\.mjs/)
  assert.match(firebaseSetupGuide, /POST \/v1\/calculate-electricity/)
  assert.match(firebaseSetupGuide, /Authorization: Bearer/)
})
