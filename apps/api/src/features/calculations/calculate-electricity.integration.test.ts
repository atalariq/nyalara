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

describe('POST /v1/calculate-electricity', () => {
  it('returns a verified electricity calculation for an authenticated kwh request', async () => {
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
        createUsage: async () => {
          throw new Error('not used in this test')
        }
      }
    })

    const response = await app.request('/v1/calculate-electricity', {
      method: 'POST',
      headers: {
        authorization: 'Bearer valid-guest-token',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
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
        }
      })
    })

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({
      success: true,
      data: {
        electricityKwh: 120,
        emissionFactorId: 'id_pln_grid_v1',
        emissionFactorKgCo2ePerKwh: 0.85,
        totalKgCo2e: 102,
        method: 'server_verified',
        status: 'verified'
      }
    })
  })

  it('derives electricity kwh from meter readings for an authenticated request', async () => {
    const app = createApp({
      environment: 'test',
      auth: {
        verifyIdToken: async () => createDecodedIdToken('full-user', 'password')
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

    const response = await app.request('/v1/calculate-electricity', {
      method: 'POST',
      headers: {
        authorization: 'Bearer valid-full-token',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
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
        }
      })
    })

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({
      success: true,
      data: {
        electricityKwh: 120,
        emissionFactorId: 'id_pln_grid_v1',
        emissionFactorKgCo2ePerKwh: 0.85,
        totalKgCo2e: 102,
        method: 'server_verified',
        status: 'verified'
      }
    })
  })

  it('requires a bearer token', async () => {
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
        }
      }
    })

    const response = await app.request('/v1/calculate-electricity', {
      method: 'POST',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify({
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

  it('rejects invalid kwh input with the uniform error envelope', async () => {
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

    const response = await app.request('/v1/calculate-electricity', {
      method: 'POST',
      headers: {
        authorization: 'Bearer valid-guest-token',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        inputType: 'kwh',
        input: {
          kwh: -10,
          meterStart: null,
          meterEnd: null,
          unit: 'kwh'
        },
        period: {
          startDate: '2026-05-01',
          endDate: '2026-05-31',
          month: '2026-05'
        }
      })
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

  it('rejects an invalid bearer token', async () => {
    const app = createApp({
      environment: 'test',
      auth: {
        verifyIdToken: async () => {
          throw new Error('token verification failed')
        }
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

    const response = await app.request('/v1/calculate-electricity', {
      method: 'POST',
      headers: {
        authorization: 'Bearer invalid-token',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
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
        }
      })
    })

    expect(response.status).toBe(401)
    await expect(response.json()).resolves.toEqual({
      success: false,
      error: {
        code: 'unauthorized',
        message: 'Authorization token is invalid.'
      }
    })
  })
})
