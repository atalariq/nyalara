import type { MiddlewareHandler } from 'hono'

import { AppError, toErrorEnvelope } from '../http/errors.js'

type RateLimiterOptions = {
  windowMs?: number
  maxRequests?: number
  signal?: AbortSignal
}

type RateLimitEntry = {
  count: number
  windowStart: number
}

export function createRateLimiter(
  options: RateLimiterOptions = {}
): MiddlewareHandler {
  const windowMs = options.windowMs ?? 60_000
  const maxRequests = options.maxRequests ?? 100
  const store = new Map<string, RateLimitEntry>()

  const cleanupStore = () => {
    const now = Date.now()

    for (const [key, entry] of store) {
      if (now - entry.windowStart > windowMs) {
        store.delete(key)
      }
    }
  }

  const cleanupTimer = setInterval(cleanupStore, 60_000)
  cleanupTimer.unref?.()

  const stopCleanup = () => {
    clearInterval(cleanupTimer)
    options.signal?.removeEventListener('abort', stopCleanup)
  }

  if (options.signal) {
    if (options.signal.aborted) {
      stopCleanup()
    } else {
      options.signal.addEventListener('abort', stopCleanup, { once: true })
    }
  }

  return async (c, next) => {
    if (c.req.method === 'OPTIONS') {
      return next()
    }

    const ip = c.req.header('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
    const now = Date.now()
    const entry = store.get(ip)

    if (!entry || now - entry.windowStart > windowMs) {
      store.set(ip, { count: 1, windowStart: now })
      return next()
    }

    entry.count += 1

    if (entry.count > maxRequests) {
      return c.json(
        toErrorEnvelope(
          new AppError(
            429,
            'rate_limit_exceeded',
            'Too many requests. Try again later.'
          )
        ),
        429
      )
    }

    return next()
  }
}
