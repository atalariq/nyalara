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

describe('PATCH /v1/electricity-usages/:usageId', () => {
  it('updates a verified electricity usage and refreshes monthly summary', async () => {
    const updatedUsage = {
      inputType: 'kwh' as const,
      input: {
        kwh: 100,
        meterStart: null,
        meterEnd: null,
        unit: 'kwh' as const
      },
      period: {
        startDate: '2026-05-01',
        endDate: '2026-05-31',
        month: '2026-05'
      },
      calculation: {
        electricityKwh: 100,
        emissionFactorId: 'id_pln_grid_v1',
        emissionFactorKgCo2ePerKwh: 0.85,
        totalKgCo2e: 85,
        method: 'server_verified' as const,
        status: 'verified' as const
      },
      source: {
        createdFrom: 'mobile' as const,
        offlineCreated: false,
        clientGeneratedId: 'usage-123'
      },
      timestamps: {
        usageDate: '2026-05-15',
        createdAtClient: '2026-05-15T10:00:00.000Z'
      }
    }

    const app = createApp({
      environment: 'test',
      auth: {
        verifyIdToken: async () => createDecodedIdToken('user-1', 'password')
      },
      emissionFactors: {
        listActiveElectricityFactors: async () => createActiveElectricityFactors()
      },
      devices: {
        listDevices: async () => [],
        createDevice: async () => {
          throw new Error('not used in this test')
        },
        updateDevice: async () => {
          throw new Error('not used in this test')
        },
        deleteDevice: async () => {
          throw new Error('not used in this test')
        },
        getDevicesByIds: async () => []
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
        },
        updateUsage: async ({ userId, usageId }) => {
          expect(userId).toBe('user-1')
          expect(usageId).toBe('usage-123')

          return {
            usageId,
            usage: updatedUsage,
            monthlySummary: {
              month: '2026-05',
              totalKwh: 100,
              totalKgCo2e: 85,
              averageKwhPerDay: 100 / 31,
              averageKgCo2ePerDay: 85 / 31,
              usageCount: 1
            },
            currentStreak: {
              length: 1,
              lastTrackedDate: '2026-05-15'
            }
          }
        },
        deleteUsage: async () => {
          throw new Error('not used in this test')
        }
      }
    })

    const response = await app.request('/v1/electricity-usages/usage-123', {
      method: 'PATCH',
      headers: {
        authorization: 'Bearer valid-user-token',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        inputType: 'kwh',
        timezoneOffsetMinutes: -420,
        input: {
          kwh: 100,
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
          usageDate: '2026-05-15',
          createdAtClient: '2026-05-15T10:00:00.000Z'
        }
      })
    })

    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.success).toBe(true)
    expect(body.data.usageId).toBe('usage-123')
    expect(body.data.monthlySummary.month).toBe('2026-05')
    expect(body.data.monthlySummary.totalKwh).toBe(100)
  })

  it('returns 404 when usage is not found', async () => {
    const app = createApp({
      environment: 'test',
      auth: {
        verifyIdToken: async () => createDecodedIdToken('user-1', 'password')
      },
      emissionFactors: {
        listActiveElectricityFactors: async () => createActiveElectricityFactors()
      },
      devices: {
        listDevices: async () => [],
        createDevice: async () => {
          throw new Error('not used')
        },
        updateDevice: async () => {
          throw new Error('not used')
        },
        deleteDevice: async () => {
          throw new Error('not used')
        },
        getDevicesByIds: async () => []
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
        },
        updateUsage: async () => null,
        deleteUsage: async () => {
          throw new Error('not used in this test')
        }
      }
    })

    const response = await app.request('/v1/electricity-usages/nonexistent', {
      method: 'PATCH',
      headers: {
        authorization: 'Bearer valid-user-token',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        inputType: 'kwh',
        timezoneOffsetMinutes: -420,
        input: {
          kwh: 50,
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
          usageDate: '2026-05-15',
          createdAtClient: '2026-05-15T10:00:00.000Z'
        }
      })
    })

    expect(response.status).toBe(404)
    const body = await response.json()
    expect(body.success).toBe(false)
    expect(body.error.code).toBe('usage_not_found')
  })
})

describe('DELETE /v1/electricity-usages/:usageId', () => {
  it('deletes a usage and refreshes monthly summary', async () => {
    const app = createApp({
      environment: 'test',
      auth: {
        verifyIdToken: async () => createDecodedIdToken('user-1', 'password')
      },
      emissionFactors: {
        listActiveElectricityFactors: async () => createActiveElectricityFactors()
      },
      devices: {
        listDevices: async () => [],
        createDevice: async () => {
          throw new Error('not used')
        },
        updateDevice: async () => {
          throw new Error('not used')
        },
        deleteDevice: async () => {
          throw new Error('not used')
        },
        getDevicesByIds: async () => []
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
        },
        updateUsage: async () => {
          throw new Error('not used in this test')
        },
        deleteUsage: async ({ userId, usageId }) => {
          expect(userId).toBe('user-1')
          expect(usageId).toBe('usage-456')

          return {
            usageId,
            monthlySummary: {
              month: '2026-05',
              totalKwh: 0,
              totalKgCo2e: 0,
              averageKwhPerDay: 0,
              averageKgCo2ePerDay: 0,
              usageCount: 0
            },
            currentStreak: {
              length: 0,
              lastTrackedDate: null
            }
          }
        }
      }
    })

    const response = await app.request('/v1/electricity-usages/usage-456', {
      method: 'DELETE',
      headers: {
        authorization: 'Bearer valid-user-token'
      }
    })

    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.success).toBe(true)
    expect(body.data.usageId).toBe('usage-456')
    expect(body.data.monthlySummary.month).toBe('2026-05')
  })

  it('returns 404 when usage is not found', async () => {
    const app = createApp({
      environment: 'test',
      auth: {
        verifyIdToken: async () => createDecodedIdToken('user-1', 'password')
      },
      emissionFactors: {
        listActiveElectricityFactors: async () => createActiveElectricityFactors()
      },
      devices: {
        listDevices: async () => [],
        createDevice: async () => {
          throw new Error('not used')
        },
        updateDevice: async () => {
          throw new Error('not used')
        },
        deleteDevice: async () => {
          throw new Error('not used')
        },
        getDevicesByIds: async () => []
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
        },
        updateUsage: async () => {
          throw new Error('not used in this test')
        },
        deleteUsage: async () => null
      }
    })

    const response = await app.request('/v1/electricity-usages/nonexistent', {
      method: 'DELETE',
      headers: {
        authorization: 'Bearer valid-user-token'
      }
    })

    expect(response.status).toBe(404)
    const body = await response.json()
    expect(body.success).toBe(false)
    expect(body.error.code).toBe('usage_not_found')
  })

  it('requires authentication', async () => {
    const app = createApp({
      environment: 'test',
      auth: {
        verifyIdToken: async () => {
          throw new Error('auth token missing')
        }
      },
      emissionFactors: {
        listActiveElectricityFactors: async () => createActiveElectricityFactors()
      },
      devices: {
        listDevices: async () => [],
        createDevice: async () => {
          throw new Error('not used')
        },
        updateDevice: async () => {
          throw new Error('not used')
        },
        deleteDevice: async () => {
          throw new Error('not used')
        },
        getDevicesByIds: async () => []
      },
      electricityUsages: {
        createUsage: async () => {
          throw new Error('not used')
        },
        getMonthlySummary: async () => {
          throw new Error('not used')
        },
        listUsages: async () => {
          throw new Error('not used')
        },
        recalculateMonthlySummary: async () => {
          throw new Error('not used')
        },
        updateUsage: async () => {
          throw new Error('not used')
        },
        deleteUsage: async () => {
          throw new Error('not used')
        }
      }
    })

    const response = await app.request('/v1/electricity-usages/usage-456', {
      method: 'DELETE'
    })

    expect(response.status).toBe(401)
  })
})