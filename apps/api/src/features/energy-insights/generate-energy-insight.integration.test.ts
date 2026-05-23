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

describe('POST /v1/generate-energy-insight', () => {
  it('rejects guest sessions because insight generation requires a full account', async () => {
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

    const response = await app.request('/v1/generate-energy-insight', {
      method: 'POST',
      headers: {
        authorization: 'Bearer valid-guest-token',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        month: '2026-05'
      })
    })

    expect(response.status).toBe(403)
    await expect(response.json()).resolves.toEqual({
      success: false,
      error: {
        code: 'forbidden',
        message: 'A full account session is required.'
      }
    })
  })

  it('generates an insight for a full account session and defaults force to false', async () => {
    const app = createApp({
      environment: 'test',
      auth: {
        verifyIdToken: async (idToken) => {
          expect(idToken).toBe('valid-full-account-token')

          return createDecodedIdToken('full-user', 'password')
        }
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
      },
      energyInsights: {
        generateMonthlyInsight: async ({ userId, month, force }) => {
          expect(userId).toBe('full-user')
          expect(month).toBe('2026-05')
          expect(force).toBe(false)

          return {
            insightId: '2026-05',
            title: 'Pemakaian listrik bulan ini masih terkendali',
            summary: 'Pemakaian listrik kamu berada di bawah target bulanan.',
            suggestions: [
              {
                title: 'Kurangi standby power',
                description:
                  'Cabut charger dan perangkat elektronik yang tidak digunakan.',
                estimatedImpactKgCo2e: 3.5
              }
            ]
          }
        }
      }
    })

    const response = await app.request('/v1/generate-energy-insight', {
      method: 'POST',
      headers: {
        authorization: 'Bearer valid-full-account-token',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        month: '2026-05'
      })
    })

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({
      success: true,
      data: {
        insightId: '2026-05',
        title: 'Pemakaian listrik bulan ini masih terkendali',
        summary: 'Pemakaian listrik kamu berada di bawah target bulanan.',
        suggestions: [
          {
            title: 'Kurangi standby power',
            description:
              'Cabut charger dan perangkat elektronik yang tidak digunakan.',
            estimatedImpactKgCo2e: 3.5
          }
        ]
      }
    })
  })

  it('returns a stable configuration error when Gemini is not configured', async () => {
    const app = createApp({
      environment: 'test',
      auth: {
        verifyIdToken: async () => createDecodedIdToken('full-user', 'password')
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

    const response = await app.request('/v1/generate-energy-insight', {
      method: 'POST',
      headers: {
        authorization: 'Bearer valid-full-account-token',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        month: '2026-05'
      })
    })

    expect(response.status).toBe(500)
    await expect(response.json()).resolves.toEqual({
      success: false,
      error: {
        code: 'gemini_not_configured',
        message: 'Gemini API is not configured.'
      }
    })
  })
})
