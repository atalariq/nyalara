import type { DecodedIdToken } from 'firebase-admin/auth'
import { describe, expect, it } from 'vitest'

import { createApp } from '../../app/create-app.js'

function createDecodedIdToken(
  uid: string,
  signInProvider: string
): DecodedIdToken {
  return {
    aud: 'nyalara',
    auth_time: 0,
    exp: 0,
    firebase: {
      identities: {},
      sign_in_provider: signInProvider
    },
    iat: 0,
    iss: 'https://securetoken.google.com/nyalara',
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
      active: true as const,
      scope: 'scope 2 (location-based)',
      sourceNotes: 'Indonesia national grid emission factor'
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
            },
            currentStreak: {
              length: 1,
              lastTrackedDate: '2026-05-31'
            }
          }
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
        },
        currentStreak: {
          length: 1,
          lastTrackedDate: '2026-05-31'
        }
      }
    })
  })

  it('allows a full-account session to create a verified electricity usage', async () => {
    const app = createApp({
      environment: 'test',
      auth: {
        verifyIdToken: async (idToken) => {
          expect(idToken).toBe('valid-full-account-token')

          return createDecodedIdToken('full-user', 'password')
        }
      },
      emissionFactors: {
        listActiveElectricityFactors: async () => createActiveElectricityFactors()
      },
      electricityUsages: {
        createUsage: async ({ userId, usageId, usage }) => {
          expect(userId).toBe('full-user')
          expect(usageId).toBe('01HYFULL')

          return {
            usageId,
            usage,
            monthlySummary: {
              month: '2026-05',
              totalKwh: 90,
              totalKgCo2e: 76.5,
              averageKwhPerDay: 90 / 31,
              averageKgCo2ePerDay: 76.5 / 31,
              usageCount: 1
            },
            currentStreak: {
              length: 1,
              lastTrackedDate: '2026-05-20'
            }
          }
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

    const response = await app.request('/v1/electricity-usages', {
      method: 'POST',
      headers: {
        authorization: 'Bearer valid-full-account-token',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        clientGeneratedId: '01HYFULL',
        inputType: 'kwh',
        input: {
          kwh: 90,
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
          offlineCreated: true
        },
        timestamps: {
          usageDate: '2026-05-20',
          createdAtClient: '2026-05-20T10:30:00+07:00'
        }
      })
    })

    expect(response.status).toBe(201)
    await expect(response.json()).resolves.toEqual({
      success: true,
      data: {
        usageId: '01HYFULL',
        usage: {
          inputType: 'kwh',
          input: {
            kwh: 90,
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
            electricityKwh: 90,
            emissionFactorId: 'id_pln_grid_v1',
            emissionFactorKgCo2ePerKwh: 0.85,
            totalKgCo2e: 76.5,
            method: 'server_verified',
            status: 'verified'
          },
          source: {
            createdFrom: 'mobile',
            offlineCreated: true,
            clientGeneratedId: '01HYFULL'
          },
          timestamps: {
            usageDate: '2026-05-20',
            createdAtClient: '2026-05-20T10:30:00+07:00'
          }
        },
        monthlySummary: {
          month: '2026-05',
          totalKwh: 90,
          totalKgCo2e: 76.5,
          averageKwhPerDay: 90 / 31,
          averageKgCo2ePerDay: 76.5 / 31,
          usageCount: 1
        },
        currentStreak: {
          length: 1,
          lastTrackedDate: '2026-05-20'
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

  it('rejects an unauthenticated caller with the standard unauthorized envelope', async () => {
    const app = createApp({
      environment: 'test',
      auth: {
        verifyIdToken: async () => {
          throw new Error('not used in this test')
        }
      },
      emissionFactors: {
        listActiveElectricityFactors: async () => createActiveElectricityFactors()
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

    const response = await app.request('/v1/electricity-usages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        clientGeneratedId: '01HYNOAUTH',
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

    expect(response.status).toBe(401)
    await expect(response.json()).resolves.toEqual({
      success: false,
      error: {
        code: 'unauthorized',
        message: 'Authorization token is required.'
      }
    })
  })
})
