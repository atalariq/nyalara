import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { Hono } from 'hono'

import { createRateLimiter } from './create-rate-limiter.js'

describe('createRateLimiter', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('allows requests under the limit', async () => {
    const app = createTestApp({ maxRequests: 2 })

    const firstResponse = await app.request('/test', {
      headers: { 'x-forwarded-for': '192.168.1.1' }
    })
    const secondResponse = await app.request('/test', {
      headers: { 'x-forwarded-for': '192.168.1.1' }
    })

    expect(firstResponse.status).toBe(200)
    expect(secondResponse.status).toBe(200)
  })

  it('blocks requests after the limit is exceeded with the uniform error envelope', async () => {
    const app = createTestApp({ maxRequests: 1 })

    const firstResponse = await app.request('/test', {
      headers: { 'x-forwarded-for': '192.168.1.1' }
    })
    const limitedResponse = await app.request('/test', {
      headers: { 'x-forwarded-for': '192.168.1.1' }
    })

    expect(firstResponse.status).toBe(200)
    expect(limitedResponse.status).toBe(429)
    await expect(limitedResponse.json()).resolves.toEqual({
      success: false,
      error: {
        code: 'rate_limit_exceeded',
        message: 'Too many requests. Try again later.'
      }
    })
  })

  it('resets the window after windowMs passes', async () => {
    const app = createTestApp({ windowMs: 1_000, maxRequests: 1 })

    const firstResponse = await app.request('/test', {
      headers: { 'x-forwarded-for': '192.168.1.1' }
    })
    const limitedResponse = await app.request('/test', {
      headers: { 'x-forwarded-for': '192.168.1.1' }
    })

    vi.advanceTimersByTime(1_001)

    const resetResponse = await app.request('/test', {
      headers: { 'x-forwarded-for': '192.168.1.1' }
    })

    expect(firstResponse.status).toBe(200)
    expect(limitedResponse.status).toBe(429)
    expect(resetResponse.status).toBe(200)
  })

  it('bypasses rate limiting for OPTIONS requests', async () => {
    const app = createTestApp({ maxRequests: 1 })

    const preflightResponse = await app.request('/test', {
      method: 'OPTIONS',
      headers: { 'x-forwarded-for': '192.168.1.1' }
    })
    const firstResponse = await app.request('/test', {
      headers: { 'x-forwarded-for': '192.168.1.1' }
    })
    const limitedResponse = await app.request('/test', {
      headers: { 'x-forwarded-for': '192.168.1.1' }
    })

    expect(preflightResponse.status).toBe(204)
    expect(firstResponse.status).toBe(200)
    expect(limitedResponse.status).toBe(429)
  })

  it('tracks multiple IPs independently', async () => {
    const app = createTestApp({ maxRequests: 1 })

    const firstIpFirstResponse = await app.request('/test', {
      headers: { 'x-forwarded-for': '192.168.1.1' }
    })
    const secondIpResponse = await app.request('/test', {
      headers: { 'x-forwarded-for': '192.168.1.2' }
    })
    const firstIpLimitedResponse = await app.request('/test', {
      headers: { 'x-forwarded-for': '192.168.1.1' }
    })

    expect(firstIpFirstResponse.status).toBe(200)
    expect(secondIpResponse.status).toBe(200)
    expect(firstIpLimitedResponse.status).toBe(429)
  })

  it('falls back to the unknown bucket when x-forwarded-for is missing', async () => {
    const app = createTestApp({ maxRequests: 1 })

    const firstResponse = await app.request('/test')
    const limitedResponse = await app.request('/test')

    expect(firstResponse.status).toBe(200)
    expect(limitedResponse.status).toBe(429)
  })
})

function createTestApp(options?: {
  windowMs?: number
  maxRequests?: number
}) {
  const app = new Hono()

  app.use('*', createRateLimiter(options))
  app.options('/test', (c) => c.body(null, 204))
  app.get('/test', (c) => c.json({ ok: true }))

  return app
}
