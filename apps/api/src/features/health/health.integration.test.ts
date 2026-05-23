import { describe, expect, it } from 'vitest'

import { createApp } from '../../app/create-app.js'

describe('GET /v1/health', () => {
  it('returns the v1 service health payload', async () => {
    const app = createApp({
      environment: 'test',
      auth: {
        verifyIdToken: async () => {
          throw new Error('not used in this test')
        }
      }
    })

    const response = await app.request('/v1/health')

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({
      success: true,
      data: {
        status: 'ok',
        service: 'carbon-tracker-backend'
      }
    })
  })
})
