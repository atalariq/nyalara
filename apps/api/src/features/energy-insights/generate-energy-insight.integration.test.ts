import type { Firestore } from 'firebase-admin/firestore'
import type { DecodedIdToken } from 'firebase-admin/auth'
import { describe, expect, it, vi } from 'vitest'

import { createApp } from '../../app/create-app.js'
import { createFirestoreEnergyInsightService } from './firestore-energy-insight-service.js'

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

  it('returns the existing monthly insight for a full account session when force is omitted', async () => {
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
            title: 'Existing insight',
            summary: 'Use the cached monthly insight.',
            suggestions: [
              {
                title: 'Keep it up',
                description: 'No regeneration needed for this request.',
                estimatedImpactKgCo2e: 1.2
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
        title: 'Existing insight',
        summary: 'Use the cached monthly insight.',
        suggestions: [
          {
            title: 'Keep it up',
            description: 'No regeneration needed for this request.',
            estimatedImpactKgCo2e: 1.2
          }
        ]
      }
    })
  })

  it('forwards force=true for a full account session regeneration request', async () => {
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
          expect(force).toBe(true)

          return {
            insightId: '2026-05',
            title: 'Insight regenerated on demand',
            summary: 'A fresh Gemini-backed insight was generated for this month.',
            suggestions: [
              {
                title: 'Schedule heavy appliances off-peak',
                description:
                  'Move high-load appliance use into a consistent low-demand window.',
                estimatedImpactKgCo2e: 4.2
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
        month: '2026-05',
        force: true
      })
    })

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({
      success: true,
      data: {
        insightId: '2026-05',
        title: 'Insight regenerated on demand',
        summary: 'A fresh Gemini-backed insight was generated for this month.',
        suggestions: [
          {
            title: 'Schedule heavy appliances off-peak',
            description:
              'Move high-load appliance use into a consistent low-demand window.',
            estimatedImpactKgCo2e: 4.2
          }
        ]
      }
    })
  })

  it('returns the existing persisted monthly insight by default through the public route', async () => {
    const firestore = createFakeFirestore({
      'users/full-user/insights/2026-05': {
        type: 'monthly_energy_advice',
        period: {
          startDate: '2026-05-01',
          endDate: '2026-05-31',
          month: '2026-05'
        },
        title: 'Existing insight',
        summary: 'Use the cached monthly insight.',
        suggestions: [
          {
            title: 'Keep it up',
            description: 'No regeneration needed for this request.',
            estimatedImpactKgCo2e: 1.2
          }
        ]
      }
    })
    const generator = {
      generate: vi.fn(async () => ({
        insight: {
          title: 'Should not be used',
          summary: 'Generator should not run when cached insight exists.',
          suggestions: []
        },
        model: {
          provider: 'google',
          name: 'gemini-3.5-flash',
          promptVersion: 'energy-insight-v1'
        }
      }))
    }
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
      },
      energyInsights: createFirestoreEnergyInsightService(
        firestore as unknown as Firestore,
        generator
      )
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
        title: 'Existing insight',
        summary: 'Use the cached monthly insight.',
        suggestions: [
          {
            title: 'Keep it up',
            description: 'No regeneration needed for this request.',
            estimatedImpactKgCo2e: 1.2
          }
        ]
      }
    })
    expect(generator.generate).not.toHaveBeenCalled()
  })

  it('regenerates and persists the canonical monthly insight document when force=true', async () => {
    const firestore = createFakeFirestore({
      'users/full-user/insights/2026-05': {
        type: 'monthly_energy_advice',
        period: {
          startDate: '2026-05-01',
          endDate: '2026-05-31',
          month: '2026-05'
        },
        title: 'Existing insight',
        summary: 'Use the cached monthly insight.',
        suggestions: [
          {
            title: 'Keep it up',
            description: 'No regeneration needed for this request.',
            estimatedImpactKgCo2e: 1.2
          }
        ]
      },
      'users/full-user/monthly_summaries/2026-05': {
        month: '2026-05',
        totalKwh: 120,
        totalKgCo2e: 102,
        averageKwhPerDay: 120 / 31,
        averageKgCo2ePerDay: 102 / 31,
        usageCount: 2
      },
      'users/full-user/monthly_summaries/2026-04': {
        month: '2026-04',
        totalKwh: 140,
        totalKgCo2e: 115,
        averageKwhPerDay: 140 / 30,
        averageKgCo2ePerDay: 115 / 30,
        usageCount: 3
      },
      'users/full-user/preferences/main': {
        monthlyEmissionTargetKgCo2e: 120
      },
      'users/full-user/electricity_usages/usage-1': {
        period: {
          month: '2026-05'
        }
      },
      'users/full-user/electricity_usages/usage-2': {
        period: {
          month: '2026-05'
        }
      }
    })
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
      },
      energyInsights: createFirestoreEnergyInsightService(
        firestore as unknown as Firestore,
        {
          generate: async () => ({
            insight: {
              title: 'Fresh regenerated insight',
              summary: 'A new Gemini-backed insight replaced the cached one.',
              suggestions: [
                {
                  title: 'Shift appliance usage',
                  description:
                    'Move high-load appliance usage into a planned daily window.',
                  estimatedImpactKgCo2e: 4.2
                }
              ]
            },
            model: {
              provider: 'google',
              name: 'gemini-3.5-flash',
              promptVersion: 'energy-insight-v1'
            }
          })
        }
      )
    })

    const response = await app.request('/v1/generate-energy-insight', {
      method: 'POST',
      headers: {
        authorization: 'Bearer valid-full-account-token',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        month: '2026-05',
        force: true
      })
    })

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({
      success: true,
      data: {
        insightId: '2026-05',
        title: 'Fresh regenerated insight',
        summary: 'A new Gemini-backed insight replaced the cached one.',
        suggestions: [
          {
            title: 'Shift appliance usage',
            description:
              'Move high-load appliance usage into a planned daily window.',
            estimatedImpactKgCo2e: 4.2
          }
        ]
      }
    })
    expect(
      firestore.getDocument('users/full-user/insights/2026-05')
    ).toMatchObject({
      type: 'monthly_energy_advice',
      period: {
        startDate: '2026-05-01',
        endDate: '2026-05-31',
        month: '2026-05'
      },
      title: 'Fresh regenerated insight',
      summary: 'A new Gemini-backed insight replaced the cached one.',
      basedOnUsageIds: ['usage-1', 'usage-2'],
      metrics: {
        totalKwh: 120,
        totalKgCo2e: 102,
        comparedToPreviousPeriodPercent: expect.closeTo(-11.304347826086957),
        projectedMonthlyKgCo2e: 102
      },
      model: {
        provider: 'google',
        name: 'gemini-3.5-flash',
        promptVersion: 'energy-insight-v1'
      },
      createdAt: expect.anything()
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

class FakeFirestore {
  private readonly documents = new Map<string, Record<string, unknown>>()

  constructor(seed: Record<string, Record<string, unknown>>) {
    for (const [path, value] of Object.entries(seed)) {
      this.documents.set(path, structuredClone(value))
    }
  }

  collection(name: string) {
    return new FakeCollectionReference(this, name)
  }

  getDocument(path: string) {
    return this.documents.get(path)
  }

  read(path: string) {
    return this.documents.get(path)
  }

  write(path: string, value: Record<string, unknown>) {
    this.documents.set(path, structuredClone(value))
  }

  listCollection(path: string) {
    const prefix = `${path}/`
    const documents: Array<{ id: string; data: Record<string, unknown> }> = []

    for (const [documentPath, data] of this.documents.entries()) {
      if (!documentPath.startsWith(prefix)) {
        continue
      }

      const relativePath = documentPath.slice(prefix.length)

      if (relativePath.includes('/')) {
        continue
      }

      documents.push({
        id: relativePath,
        data
      })
    }

    return documents
  }
}

class FakeCollectionReference {
  constructor(
    private readonly firestore: FakeFirestore,
    private readonly path: string
  ) {}

  doc(id: string) {
    return new FakeDocumentReference(this.firestore, `${this.path}/${id}`)
  }

  where(fieldPath: string, operator: string, value: unknown) {
    return new FakeQuery(this.firestore, this.path, fieldPath, operator, value)
  }
}

class FakeDocumentReference {
  constructor(
    private readonly firestore: FakeFirestore,
    private readonly path: string
  ) {}

  collection(name: string) {
    return new FakeCollectionReference(this.firestore, `${this.path}/${name}`)
  }

  async get() {
    const data = this.firestore.read(this.path)

    return {
      exists: data !== undefined,
      data: () => data
    }
  }

  async set(value: Record<string, unknown>) {
    this.firestore.write(this.path, value)
  }
}

class FakeQuery {
  constructor(
    private readonly firestore: FakeFirestore,
    private readonly path: string,
    private readonly fieldPath: string,
    private readonly operator: string,
    private readonly value: unknown
  ) {}

  async get() {
    if (this.operator !== '==') {
      throw new Error(`Unsupported operator ${this.operator}`)
    }

    return {
      docs: this.firestore
        .listCollection(this.path)
        .filter(({ data }) => getValueAtPath(data, this.fieldPath) === this.value)
        .map(({ id, data }) => ({
          id,
          data: () => data
        }))
    }
  }
}

function getValueAtPath(
  value: Record<string, unknown>,
  path: string
): unknown {
  return path
    .split('.')
    .reduce<unknown>(
      (currentValue, segment) =>
        currentValue !== null &&
        typeof currentValue === 'object' &&
        segment in currentValue
          ? (currentValue as Record<string, unknown>)[segment]
          : undefined,
      value
    )
}

function createFakeFirestore(seed: Record<string, Record<string, unknown>>) {
  return new FakeFirestore(seed)
}
