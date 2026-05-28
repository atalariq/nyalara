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

const stubElectricityUsages = {
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

const stubEmissionFactors = {
  listActiveElectricityFactors: async () => []
}

describe('profile routes', () => {
  it('returns the authenticated user profile', async () => {
    const app = createApp({
      environment: 'test',
      auth: {
        verifyIdToken: async (idToken) => {
          expect(idToken).toBe('valid-user-token')
          return createDecodedIdToken('user-1', 'password')
        }
      },
      emissionFactors: stubEmissionFactors,
      electricityUsages: stubElectricityUsages,
      userProfiles: {
        getProfile: async ({ userId }) => {
          expect(userId).toBe('user-1')
          return {
            displayName: 'Nadia',
            email: 'nadia@example.com',
            electricityRate: 1444,
            emissionFactor: 0.436,
            city: 'Jakarta',
            createdAt: '2026-05-28T00:00:00.000Z',
            updatedAt: '2026-05-28T00:00:00.000Z'
          }
        },
        createProfile: async () => {
          throw new Error('not used in this test')
        },
        updateProfile: async () => {
          throw new Error('not used in this test')
        }
      }
    })

    const response = await app.request('/v1/profile', {
      headers: {
        authorization: 'Bearer valid-user-token'
      }
    })

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({
      success: true,
      data: {
        displayName: 'Nadia',
        email: 'nadia@example.com',
        electricityRate: 1444,
        emissionFactor: 0.436,
        city: 'Jakarta',
        createdAt: '2026-05-28T00:00:00.000Z',
        updatedAt: '2026-05-28T00:00:00.000Z'
      }
    })
  })

  it('creates a new profile for an authenticated user', async () => {
    const app = createApp({
      environment: 'test',
      auth: {
        verifyIdToken: async () => createDecodedIdToken('user-1', 'password')
      },
      emissionFactors: stubEmissionFactors,
      electricityUsages: stubElectricityUsages,
      userProfiles: {
        getProfile: async () => null,
        createProfile: async ({ userId, profile }) => {
          expect(userId).toBe('user-1')
          expect(profile.displayName).toBe('Nadia')
          expect(profile.email).toBe('nadia@example.com')

          return {
            displayName: profile.displayName,
            email: profile.email,
            electricityRate: profile.electricityRate,
            emissionFactor: profile.emissionFactor,
            createdAt: '2026-05-28T00:00:00.000Z',
            updatedAt: '2026-05-28T00:00:00.000Z'
          }
        },
        updateProfile: async () => {
          throw new Error('not used in this test')
        }
      }
    })

    const response = await app.request('/v1/profile', {
      method: 'POST',
      headers: {
        authorization: 'Bearer valid-user-token',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        displayName: 'Nadia',
        email: 'nadia@example.com',
        electricityRate: 1444,
        emissionFactor: 0.85
      })
    })

    expect(response.status).toBe(201)
    const body = await response.json()
    expect(body.success).toBe(true)
    expect(body.data.displayName).toBe('Nadia')
    expect(body.data.email).toBe('nadia@example.com')
  })

  it('rejects profile creation with missing required fields', async () => {
    const app = createApp({
      environment: 'test',
      auth: {
        verifyIdToken: async () => createDecodedIdToken('user-1', 'password')
      },
      emissionFactors: stubEmissionFactors,
      electricityUsages: stubElectricityUsages,
      userProfiles: {
        getProfile: async () => null,
        createProfile: async () => {
          throw new Error('should not be called')
        },
        updateProfile: async () => {
          throw new Error('not used in this test')
        }
      }
    })

    const response = await app.request('/v1/profile', {
      method: 'POST',
      headers: {
        authorization: 'Bearer valid-user-token',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        displayName: 'Nadia'
      })
    })

    expect(response.status).toBe(400)
    const body = await response.json()
    expect(body.success).toBe(false)
    expect(body.error.code).toBe('validation_error')
  })

  it('updates the authenticated user profile', async () => {
    const app = createApp({
      environment: 'test',
      auth: {
        verifyIdToken: async () => createDecodedIdToken('user-1', 'password')
      },
      emissionFactors: stubEmissionFactors,
      electricityUsages: stubElectricityUsages,
      userProfiles: {
        getProfile: async () => null,
        createProfile: async () => {
          throw new Error('not used in this test')
        },
        updateProfile: async ({ userId, profile }) => {
          expect(userId).toBe('user-1')
          expect(profile).toEqual({
            city: 'Bandung',
            residents: 3
          })

          return {
            displayName: 'Nadia',
            email: 'nadia@example.com',
            electricityRate: 1444,
            emissionFactor: 0.436,
            city: 'Bandung',
            residents: 3,
            createdAt: '2026-05-28T00:00:00.000Z',
            updatedAt: '2026-05-28T12:00:00.000Z'
          }
        }
      }
    })

    const response = await app.request('/v1/profile', {
      method: 'PATCH',
      headers: {
        authorization: 'Bearer valid-user-token',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        city: 'Bandung',
        residents: 3
      })
    })

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({
      success: true,
      data: {
        displayName: 'Nadia',
        email: 'nadia@example.com',
        electricityRate: 1444,
        emissionFactor: 0.436,
        city: 'Bandung',
        residents: 3,
        createdAt: '2026-05-28T00:00:00.000Z',
        updatedAt: '2026-05-28T12:00:00.000Z'
      }
    })
  })
})
