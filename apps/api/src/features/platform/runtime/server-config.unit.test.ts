import { describe, expect, it } from 'vitest'

import { resolvePort, shouldLoadLocalEnv } from './server-config.js'

describe('resolvePort', () => {
  it('defaults to port 3000 when PORT is missing', () => {
    expect(resolvePort({})).toBe(3000)
  })

  it('uses the injected PORT value when present', () => {
    expect(resolvePort({ PORT: '8080' })).toBe(8080)
  })

  it('rejects invalid PORT values', () => {
    expect(() => resolvePort({ PORT: 'not-a-number' })).toThrow(
      'Invalid PORT value: not-a-number'
    )
  })
})

describe('shouldLoadLocalEnv', () => {
  it('loads local env files for non-production local development', () => {
    expect(shouldLoadLocalEnv({ NODE_ENV: 'development' })).toBe(true)
  })

  it('does not load local env files in production', () => {
    expect(shouldLoadLocalEnv({ NODE_ENV: 'production' })).toBe(false)
  })

  it('does not load local env files on Cloud Run', () => {
    expect(shouldLoadLocalEnv({ K_SERVICE: 'carbon-tracker-api' })).toBe(false)
  })
})
