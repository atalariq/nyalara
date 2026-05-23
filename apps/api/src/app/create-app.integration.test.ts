import { describe, expect, it } from 'vitest'

import { createApp } from './create-app.js'

describe('v1 app platform behavior', () => {
  it('serves OpenAPI JSON and Swagger UI outside production', async () => {
    const app = createApp({
      environment: 'test',
      auth: {
        verifyIdToken: async () => {
          throw new Error('not used in this test')
        }
      },
      emissionFactors: {
        listActiveElectricityFactors: async () => []
      },
      electricityUsages: {
        createUsage: async () => {
          throw new Error('not used in this test')
        }
      }
    })

    const docResponse = await app.request('/v1/doc')
    expect(docResponse.status).toBe(200)
    await expect(docResponse.json()).resolves.toMatchObject({
      openapi: expect.any(String),
      paths: {
        '/v1/health': expect.any(Object)
      }
    })

    const uiResponse = await app.request('/v1/ui')
    expect(uiResponse.status).toBe(200)
    expect(uiResponse.headers.get('content-type')).toContain('text/html')
  })

  it('restricts OpenAPI docs in production with the uniform error envelope', async () => {
    const app = createApp({
      environment: 'production',
      auth: {
        verifyIdToken: async () => {
          throw new Error('not used in this test')
        }
      },
      emissionFactors: {
        listActiveElectricityFactors: async () => []
      },
      electricityUsages: {
        createUsage: async () => {
          throw new Error('not used in this test')
        }
      }
    })

    const response = await app.request('/v1/doc')

    expect(response.status).toBe(403)
    await expect(response.json()).resolves.toEqual({
      success: false,
      error: {
        code: 'docs_restricted',
        message: 'OpenAPI docs are not available in production.'
      }
    })
  })

  it('returns the uniform error envelope for unknown routes', async () => {
    const app = createApp({
      environment: 'test',
      auth: {
        verifyIdToken: async () => {
          throw new Error('not used in this test')
        }
      },
      emissionFactors: {
        listActiveElectricityFactors: async () => []
      },
      electricityUsages: {
        createUsage: async () => {
          throw new Error('not used in this test')
        }
      }
    })

    const response = await app.request('/v1/missing')

    expect(response.status).toBe(404)
    await expect(response.json()).resolves.toEqual({
      success: false,
      error: {
        code: 'not_found',
        message: 'Route not found.'
      }
    })
  })
})
