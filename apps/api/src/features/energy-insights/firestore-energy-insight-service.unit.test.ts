import type { Firestore } from 'firebase-admin/firestore'
import { describe, expect, it } from 'vitest'

import { createFirestoreEnergyInsightService } from './firestore-energy-insight-service.js'

describe('createFirestoreEnergyInsightService', () => {
  it('returns the existing monthly insight when force is false', async () => {
    const firestore = createFakeFirestore({
      'users/full-user/insights/2026-05': {
        title: 'Existing insight',
        summary: 'Use the cached insight.',
        suggestions: [
          {
            title: 'Keep it up',
            description: 'No regeneration needed.',
            estimatedImpactKgCo2e: 1.2
          }
        ]
      }
    })

    const service = createFirestoreEnergyInsightService(
      firestore as unknown as Firestore
    )

    await expect(
      service.generateMonthlyInsight({
        userId: 'full-user',
        month: '2026-05',
        force: false
      })
    ).resolves.toEqual({
      insightId: '2026-05',
      title: 'Existing insight',
      summary: 'Use the cached insight.',
      isStale: false,
      suggestions: [
        {
          title: 'Keep it up',
          description: 'No regeneration needed.',
          estimatedImpactKgCo2e: 1.2
        }
      ]
    })
  })

  it('generates and stores a monthly insight when one does not exist', async () => {
    const firestore = createFakeFirestore({
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

    const service = createFirestoreEnergyInsightService(
      firestore as unknown as Firestore,
      {
        generate: async () => ({
          insight: {
            title: 'Pemakaian listrik bulan ini masih terkendali',
            summary:
              'Emisi listrik bulan ini lebih rendah 11.3% dibanding bulan sebelumnya.',
            isStale: false,
            suggestions: [
              {
                title: 'Pertahankan perangkat hemat energi',
                description:
                  'Lanjutkan pola pemakaian perangkat efisien dan jadwalkan penggunaan alat berdaya besar seperlunya.',
                estimatedImpactKgCo2e: 3.1
              },
              {
                title: 'Kurangi standby power',
                description:
                  'Cabut charger dan perangkat elektronik yang tidak digunakan agar konsumsi dasar rumah tetap rendah.',
                estimatedImpactKgCo2e: 2
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
    const insight = await service.generateMonthlyInsight({
      userId: 'full-user',
      month: '2026-05',
      force: false
    })

    expect(insight).toEqual({
      insightId: '2026-05',
      title: 'Pemakaian listrik bulan ini masih terkendali',
      summary: 'Emisi listrik bulan ini lebih rendah 11.3% dibanding bulan sebelumnya.',
      isStale: false,
      suggestions: [
        {
          title: 'Pertahankan perangkat hemat energi',
          description:
            'Lanjutkan pola pemakaian perangkat efisien dan jadwalkan penggunaan alat berdaya besar seperlunya.',
          estimatedImpactKgCo2e: 3.1
        },
        {
          title: 'Kurangi standby power',
          description:
            'Cabut charger dan perangkat elektronik yang tidak digunakan agar konsumsi dasar rumah tetap rendah.',
          estimatedImpactKgCo2e: 2
        }
      ]
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
      title: 'Pemakaian listrik bulan ini masih terkendali',
      isStale: false,
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
