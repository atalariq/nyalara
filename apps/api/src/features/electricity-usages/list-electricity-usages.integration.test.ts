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

describe('GET /v1/electricity-usages', () => {
  it('returns the authenticated user usage history for the requested month sorted by usage date descending', async () => {
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
        getMonthlySummary: async () => {
          throw new Error('not used in this test')
        },
        listUsages: async ({ userId, month }) => {
          expect(userId).toBe('guest-user')
          expect(month).toBe('2026-05')

          return [
            {
              usageId: 'usage-2',
              usage: {
                inputType: 'meter_reading',
                input: {
                  kwh: null,
                  meterStart: 1000,
                  meterEnd: 1120,
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
                  clientGeneratedId: 'usage-2'
                },
                timestamps: {
                  usageDate: '2026-05-31',
                  createdAtClient: '2026-05-31T09:30:00+07:00'
                }
              }
            },
            {
              usageId: 'usage-1',
              usage: {
                inputType: 'kwh',
                input: {
                  kwh: 80,
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
                  electricityKwh: 80,
                  emissionFactorId: 'id_pln_grid_v1',
                  emissionFactorKgCo2ePerKwh: 0.85,
                  totalKgCo2e: 68,
                  method: 'server_verified',
                  status: 'verified'
                },
                source: {
                  createdFrom: 'mobile',
                  offlineCreated: true,
                  clientGeneratedId: 'usage-1'
                },
                timestamps: {
                  usageDate: '2026-05-15',
                  createdAtClient: '2026-05-15T09:30:00+07:00'
                }
              }
            }
          ]
        },
        recalculateMonthlySummary: async () => {
          throw new Error('not used in this test')
        }
      }
    })

    const response = await app.request('/v1/electricity-usages?month=2026-05', {
      headers: {
        authorization: 'Bearer valid-guest-token'
      }
    })

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({
      success: true,
      data: [
        {
          usageId: 'usage-2',
          usage: {
            inputType: 'meter_reading',
            input: {
              kwh: null,
              meterStart: 1000,
              meterEnd: 1120,
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
              clientGeneratedId: 'usage-2'
            },
            timestamps: {
              usageDate: '2026-05-31',
              createdAtClient: '2026-05-31T02:30:00.000Z'
            }
          }
        },
        {
          usageId: 'usage-1',
          usage: {
            inputType: 'kwh',
            input: {
              kwh: 80,
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
              electricityKwh: 80,
              emissionFactorId: 'id_pln_grid_v1',
              emissionFactorKgCo2ePerKwh: 0.85,
              totalKgCo2e: 68,
              method: 'server_verified',
              status: 'verified'
            },
            source: {
              createdFrom: 'mobile',
              offlineCreated: true,
              clientGeneratedId: 'usage-1'
            },
            timestamps: {
              usageDate: '2026-05-15',
              createdAtClient: '2026-05-15T02:30:00.000Z'
            }
          }
        }
      ]
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

    const response = await app.request('/v1/electricity-usages?month=2026-5', {
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
