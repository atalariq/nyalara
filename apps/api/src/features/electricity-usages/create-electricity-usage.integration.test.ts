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

function createActiveElectricityFactors() {
  return [
    {
      id: 'id_pln_grid_v1',
      country: 'ID',
      region: 'national',
      unit: 'kwh' as const,
      kgCo2ePerKwh: 0.85,
      version: 'v1',
      active: true as const
    }
  ]
}

describe('POST /v1/electricity-usages', () => {
  it('creates a verified electricity usage and recalculates the monthly summary', async () => {
    const app = createApp({
      environment: 'test',
      auth: {
        verifyIdToken: async (idToken) => {
          expect(idToken).toBe('valid-guest-token')

          return createDecodedIdToken('guest-user', 'anonymous')
        }
      },
      emissionFactors: {
        listActiveElectricityFactors: async () => createActiveElectricityFactors()
      },
      electricityUsages: {
        createUsage: async ({ userId, usageId, usage }) => {
          expect(userId).toBe('guest-user')
          expect(usageId).toBe('01HYEXAMPLE')
          expect(usage.calculation).toEqual({
            electricityKwh: 120,
            emissionFactorId: 'id_pln_grid_v1',
            emissionFactorKgCo2ePerKwh: 0.85,
            totalKgCo2e: 102,
            method: 'server_verified',
            status: 'verified'
          })

          return {
            usageId,
            usage,
            monthlySummary: {
              month: '2026-05',
              totalKwh: 120,
              totalKgCo2e: 102,
              averageKwhPerDay: 120 / 31,
              averageKgCo2ePerDay: 102 / 31,
              usageCount: 1
            }
          }
        }
      }
    })

    const response = await app.request('/v1/electricity-usages', {
      method: 'POST',
      headers: {
        authorization: 'Bearer valid-guest-token',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        clientGeneratedId: '01HYEXAMPLE',
        inputType: 'kwh',
        input: {
          kwh: 120,
          meterStart: null,
          meterEnd: null,
          unit: 'kwh'
        },
        period: {
          startDate: '2026-05-01',
          endDate: '2026-05-31',
          month: '2026-05'
        },
        source: {
          createdFrom: 'mobile',
          offlineCreated: false
        },
        timestamps: {
          usageDate: '2026-05-31',
          createdAtClient: '2026-05-23T10:30:00+07:00'
        }
      })
    })

    expect(response.status).toBe(201)
    await expect(response.json()).resolves.toEqual({
      success: true,
      data: {
        usageId: '01HYEXAMPLE',
        usage: {
          inputType: 'kwh',
          input: {
            kwh: 120,
            meterStart: null,
            meterEnd: null,
            unit: 'kwh'
          },
          period: {
            startDate: '2026-05-01',
            endDate: '2026-05-31',
            month: '2026-05'
          },
          calculation: {
            electricityKwh: 120,
            emissionFactorId: 'id_pln_grid_v1',
            emissionFactorKgCo2ePerKwh: 0.85,
            totalKgCo2e: 102,
            method: 'server_verified',
            status: 'verified'
          },
          source: {
            createdFrom: 'mobile',
            offlineCreated: false,
            clientGeneratedId: '01HYEXAMPLE'
          },
          timestamps: {
            usageDate: '2026-05-31',
            createdAtClient: '2026-05-23T10:30:00+07:00'
          }
        },
        monthlySummary: {
          month: '2026-05',
          totalKwh: 120,
          totalKgCo2e: 102,
          averageKwhPerDay: 120 / 31,
          averageKgCo2ePerDay: 102 / 31,
          usageCount: 1
        }
      }
    })
  })

  it('rejects a request without clientGeneratedId', async () => {
    const app = createApp({
      environment: 'test',
      auth: {
        verifyIdToken: async () => createDecodedIdToken('guest-user', 'anonymous')
      },
      emissionFactors: {
        listActiveElectricityFactors: async () => createActiveElectricityFactors()
      },
      electricityUsages: {
        createUsage: async () => {
          throw new Error('not used in this test')
        }
      }
    })

    const response = await app.request('/v1/electricity-usages', {
      method: 'POST',
      headers: {
        authorization: 'Bearer valid-guest-token',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        clientGeneratedId: '',
        inputType: 'kwh',
        input: {
          kwh: 120,
          meterStart: null,
          meterEnd: null,
          unit: 'kwh'
        },
        period: {
          startDate: '2026-05-01',
          endDate: '2026-05-31',
          month: '2026-05'
        },
        source: {
          createdFrom: 'mobile',
          offlineCreated: false
        },
        timestamps: {
          usageDate: '2026-05-31',
          createdAtClient: '2026-05-23T10:30:00+07:00'
        }
      })
    })

    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toEqual({
      success: false,
      error: {
        code: 'validation_error',
        message: 'Request validation failed.',
        details: expect.arrayContaining([
          expect.objectContaining({
            path: ['clientGeneratedId']
          })
        ])
      }
    })
  })
})
