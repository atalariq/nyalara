import type { DeviceDto } from '@carbon-tracker/shared'
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

function createDevice(id: string): DeviceDto {
  return {
    id,
    name: 'Air Conditioner',
    category: 'appliances',
    deviceType: 'ac',
    watt: 900,
    defaultDurationMinutes: 120,
    active: false,
    activatedAt: null,
    createdAt: '2026-05-25T06:00:00.000Z',
    updatedAt: '2026-05-25T06:00:00.000Z'
  }
}

describe('device routes', () => {
  it('lists devices for the authenticated user', async () => {
    const app = createApp({
      environment: 'test',
      auth: {
        verifyIdToken: async () => createDecodedIdToken('guest-user', 'anonymous')
      },
      emissionFactors: {
        listActiveElectricityFactors: async () => []
      },
      devices: {
        listDevices: async ({ userId }) => {
          expect(userId).toBe('guest-user')
          return [createDevice('device-1')]
        },
        createDevice: async () => {
          throw new Error('not used in this test')
        },
        updateDevice: async () => {
          throw new Error('not used in this test')
        },
        deleteDevice: async () => {
          throw new Error('not used in this test')
        },
        getDevicesByIds: async () => {
          throw new Error('not used in this test')
        }
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

    const response = await app.request('/v1/devices', {
      headers: {
        authorization: 'Bearer valid-guest-token'
      }
    })

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({
      success: true,
      data: [createDevice('device-1')]
    })
  })

  it('creates a device for the authenticated user', async () => {
    const app = createApp({
      environment: 'test',
      auth: {
        verifyIdToken: async () => createDecodedIdToken('guest-user', 'anonymous')
      },
      emissionFactors: {
        listActiveElectricityFactors: async () => []
      },
      devices: {
        listDevices: async () => {
          throw new Error('not used in this test')
        },
        createDevice: async ({ userId, device }) => {
          expect(userId).toBe('guest-user')
          expect(device.defaultDurationMinutes).toBe(90)

          return createDevice('device-2')
        },
        updateDevice: async () => {
          throw new Error('not used in this test')
        },
        deleteDevice: async () => {
          throw new Error('not used in this test')
        },
        getDevicesByIds: async () => {
          throw new Error('not used in this test')
        }
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

    const response = await app.request('/v1/devices', {
      method: 'POST',
      headers: {
        authorization: 'Bearer valid-guest-token',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        name: 'Air Conditioner',
        category: 'appliances',
        deviceType: 'ac',
        watt: 900,
        defaultDurationMinutes: 90,
        active: false,
        activatedAt: null
      })
    })

    expect(response.status).toBe(201)
    await expect(response.json()).resolves.toEqual({
      success: true,
      data: createDevice('device-2')
    })
  })

  it('updates a device for the authenticated user', async () => {
    const app = createApp({
      environment: 'test',
      auth: {
        verifyIdToken: async () => createDecodedIdToken('guest-user', 'anonymous')
      },
      emissionFactors: {
        listActiveElectricityFactors: async () => []
      },
      devices: {
        listDevices: async () => {
          throw new Error('not used in this test')
        },
        createDevice: async () => {
          throw new Error('not used in this test')
        },
        updateDevice: async ({ userId, deviceId, device }) => {
          expect(userId).toBe('guest-user')
          expect(deviceId).toBe('device-3')
          expect(device.active).toBe(true)

          return {
            ...createDevice('device-3'),
            active: true,
            activatedAt: 1_748_154_400_000
          }
        },
        deleteDevice: async () => {
          throw new Error('not used in this test')
        },
        getDevicesByIds: async () => {
          throw new Error('not used in this test')
        }
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

    const response = await app.request('/v1/devices/device-3', {
      method: 'PATCH',
      headers: {
        authorization: 'Bearer valid-guest-token',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        active: true,
        activatedAt: 1_748_154_400_000
      })
    })

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({
      success: true,
      data: {
        ...createDevice('device-3'),
        active: true,
        activatedAt: 1_748_154_400_000
      }
    })
  })

  it('deletes a device for the authenticated user', async () => {
    const app = createApp({
      environment: 'test',
      auth: {
        verifyIdToken: async () => createDecodedIdToken('guest-user', 'anonymous')
      },
      emissionFactors: {
        listActiveElectricityFactors: async () => []
      },
      devices: {
        listDevices: async () => {
          throw new Error('not used in this test')
        },
        createDevice: async () => {
          throw new Error('not used in this test')
        },
        updateDevice: async () => {
          throw new Error('not used in this test')
        },
        deleteDevice: async ({ userId, deviceId }) => {
          expect(userId).toBe('guest-user')
          expect(deviceId).toBe('device-4')
          return true
        },
        getDevicesByIds: async () => {
          throw new Error('not used in this test')
        }
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

    const response = await app.request('/v1/devices/device-4', {
      method: 'DELETE',
      headers: {
        authorization: 'Bearer valid-guest-token'
      }
    })

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({
      success: true,
      data: {
        deviceId: 'device-4'
      }
    })
  })
})
