import type { DecodedIdToken } from 'firebase-admin/auth'
import { describe, expect, it } from 'vitest'

import { createApp } from '../../app/create-app.js'

function createDecodedIdToken(
  uid: string,
  signInProvider: string
): DecodedIdToken {
  return {
    aud: 'carbon-tracker',
    auth_time: 0,
    exp: 0,
    firebase: {
      identities: {},
      sign_in_provider: signInProvider
    },
    iat: 0,
    iss: 'https://securetoken.google.com/carbon-tracker',
    sub: uid,
    uid
  } as DecodedIdToken
}

describe('GET /v1/monthly-summary', () => {
  it('returns the authenticated user monthly summary for a valid month query', async () => {
    const app = createApp({
      environment: 'test',
      auth: {
        verifyIdToken: async (idToken) => {
          expect(idToken).toBe('valid-guest-token')

          return createDecodedIdToken('guest-user', 'anonymous')
        }
      },
      emissionFactors: {
        listActiveElectricityFactors: async () => []
      },
      electricityUsages: {
        createUsage: async () => {
          throw new Error('not used in this test')
        },
        getMonthlySummary: async ({ userId, month }) => {
          expect(userId).toBe('guest-user')
          expect(month).toBe('2026-05')

          return {
            month: '2026-05',
            totalKwh: 120,
            totalKgCo2e: 102,
            averageKwhPerDay: 120 / 31,
            averageKgCo2ePerDay: 102 / 31,
            usageCount: 1
          }
        },
        listUsages: async () => {
          throw new Error('not used in this test')
        },
        recalculateMonthlySummary: async () => {
          throw new Error('not used in this test')
        }
      }
    })

    const response = await app.request('/v1/monthly-summary?month=2026-05', {
      headers: {
        authorization: 'Bearer valid-guest-token'
      }
    })

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({
      success: true,
      data: {
        month: '2026-05',
        totalKwh: 120,
        totalKgCo2e: 102,
        averageKwhPerDay: 120 / 31,
        averageKgCo2ePerDay: 102 / 31,
        usageCount: 1
      }
    })
  })

  it('returns the uniform error envelope when the monthly summary does not exist', async () => {
    const app = createApp({
      environment: 'test',
      auth: {
        verifyIdToken: async () => createDecodedIdToken('guest-user', 'anonymous')
      },
      emissionFactors: {
        listActiveElectricityFactors: async () => []
      },
      electricityUsages: {
        createUsage: async () => {
          throw new Error('not used in this test')
        },
        getMonthlySummary: async () => null
        ,
        listUsages: async () => {
          throw new Error('not used in this test')
        },
        recalculateMonthlySummary: async () => {
          throw new Error('not used in this test')
        }
      }
    })

    const response = await app.request('/v1/monthly-summary?month=2026-05', {
      headers: {
        authorization: 'Bearer valid-guest-token'
      }
    })

    expect(response.status).toBe(404)
    await expect(response.json()).resolves.toEqual({
      success: false,
      error: {
        code: 'monthly_summary_not_found',
        message: 'Monthly summary not found for the requested month.'
      }
    })
  })

  it('rejects an invalid month query with the uniform validation envelope', async () => {
    const app = createApp({
      environment: 'test',
      auth: {
        verifyIdToken: async () => createDecodedIdToken('guest-user', 'anonymous')
      },
      emissionFactors: {
        listActiveElectricityFactors: async () => []
      },
      electricityUsages: {
        createUsage: async () => {
          throw new Error('not used in this test')
        },
        getMonthlySummary: async () => {
          throw new Error('not used in this test')
        },
        listUsages: async () => {
          throw new Error('not used in this test')
        },
        recalculateMonthlySummary: async () => {
          throw new Error('not used in this test')
        }
      }
    })

    const response = await app.request('/v1/monthly-summary?month=2026-5', {
      headers: {
        authorization: 'Bearer valid-guest-token'
      }
    })

    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toEqual({
      success: false,
      error: {
        code: 'validation_error',
        message: 'Request validation failed.',
        details: expect.any(Array)
      }
    })
  })
})
