import type { Firestore } from 'firebase-admin/firestore'
import { describe, expect, it } from 'vitest'

import { createFirestoreElectricityUsageService } from './firestore-electricity-usage-service.js'

describe('createFirestoreElectricityUsageService', () => {
  it('recomputes an empty month into a zeroed canonical monthly summary document', async () => {
    const firestore = createFakeFirestore({})
    const service = createFirestoreElectricityUsageService(
      firestore as unknown as Firestore
    )

    await expect(
      service.recalculateMonthlySummary({
        userId: 'guest-user',
        month: '2026-06'
      })
    ).resolves.toEqual({
      month: '2026-06',
      totalKwh: 0,
      totalKgCo2e: 0,
      averageKwhPerDay: 0,
      averageKgCo2ePerDay: 0,
      usageCount: 0
    })

    expect(
      firestore.getDocument('users/guest-user/monthly_summaries/2026-06')
    ).toMatchObject({
      month: '2026-06',
      totalKwh: 0,
      totalKgCo2e: 0,
      averageKwhPerDay: 0,
      averageKgCo2ePerDay: 0,
      usageCount: 0,
      updatedAt: expect.anything()
    })
  })

  it('reuses the same per-user month aggregation for usage creation and explicit recomputation', async () => {
    const firestore = createFakeFirestore({
      'users/guest-user/electricity_usages/existing-usage': {
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
          offlineCreated: false,
          clientGeneratedId: 'existing-usage'
        },
        timestamps: {
          usageDate: '2026-05-10',
          createdAtClient: '2026-05-10T02:30:00.000Z'
        }
      },
      'users/other-user/electricity_usages/foreign-usage': {
        inputType: 'kwh',
        input: {
          kwh: 999,
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
          electricityKwh: 999,
          emissionFactorId: 'id_pln_grid_v1',
          emissionFactorKgCo2ePerKwh: 0.85,
          totalKgCo2e: 849.15,
          method: 'server_verified',
          status: 'verified'
        },
        source: {
          createdFrom: 'mobile',
          offlineCreated: false,
          clientGeneratedId: 'foreign-usage'
        },
        timestamps: {
          usageDate: '2026-05-12',
          createdAtClient: '2026-05-12T02:30:00.000Z'
        }
      }
    })
    const service = createFirestoreElectricityUsageService(
      firestore as unknown as Firestore
    )

    const created = await service.createUsage({
      userId: 'guest-user',
      usageId: 'new-usage',
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
          clientGeneratedId: 'new-usage'
        },
        timestamps: {
          usageDate: '2026-05-31',
          createdAtClient: '2026-05-31T02:30:00.000Z'
        }
      }
    })

    const recomputed = await service.recalculateMonthlySummary({
      userId: 'guest-user',
      month: '2026-05'
    })

    expect(created.monthlySummary).toEqual({
      month: '2026-05',
      totalKwh: 200,
      totalKgCo2e: 170,
      averageKwhPerDay: 200 / 31,
      averageKgCo2ePerDay: 170 / 31,
      usageCount: 2
    })
    expect(recomputed).toEqual(created.monthlySummary)
    expect(
      firestore.getDocument('users/guest-user/monthly_summaries/2026-05')
    ).toMatchObject(created.monthlySummary)
  })

  it('recomputes only the requested month from canonical usage records', async () => {
    const firestore = createFakeFirestore({
      'users/guest-user/electricity_usages/may-usage': {
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
          offlineCreated: false,
          clientGeneratedId: 'may-usage'
        },
        timestamps: {
          usageDate: '2026-05-10',
          createdAtClient: '2026-05-10T02:30:00.000Z'
        }
      },
      'users/guest-user/electricity_usages/april-usage': {
        inputType: 'kwh',
        input: {
          kwh: 140,
          meterStart: null,
          meterEnd: null,
          unit: 'kwh'
        },
        period: {
          startDate: '2026-04-01',
          endDate: '2026-04-30',
          month: '2026-04'
        },
        calculation: {
          electricityKwh: 140,
          emissionFactorId: 'id_pln_grid_v1',
          emissionFactorKgCo2ePerKwh: 0.85,
          totalKgCo2e: 119,
          method: 'server_verified',
          status: 'verified'
        },
        source: {
          createdFrom: 'mobile',
          offlineCreated: false,
          clientGeneratedId: 'april-usage'
        },
        timestamps: {
          usageDate: '2026-04-30',
          createdAtClient: '2026-04-30T02:30:00.000Z'
        }
      }
    })
    const service = createFirestoreElectricityUsageService(
      firestore as unknown as Firestore
    )

    await expect(
      service.recalculateMonthlySummary({
        userId: 'guest-user',
        month: '2026-05'
      })
    ).resolves.toEqual({
      month: '2026-05',
      totalKwh: 80,
      totalKgCo2e: 68,
      averageKwhPerDay: 80 / 31,
      averageKgCo2ePerDay: 68 / 31,
      usageCount: 1
    })
  })

  it('uses clientGeneratedId as the canonical document id so repeated writes replace the same usage record', async () => {
    const firestore = createFakeFirestore({})
    const service = createFirestoreElectricityUsageService(
      firestore as unknown as Firestore
    )

    await service.createUsage({
      userId: 'guest-user',
      usageId: 'same-client-id',
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
          offlineCreated: false,
          clientGeneratedId: 'same-client-id'
        },
        timestamps: {
          usageDate: '2026-05-10',
          createdAtClient: '2026-05-10T02:30:00.000Z'
        }
      }
    })

    const secondWrite = await service.createUsage({
      userId: 'guest-user',
      usageId: 'same-client-id',
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
          offlineCreated: true,
          clientGeneratedId: 'same-client-id'
        },
        timestamps: {
          usageDate: '2026-05-12',
          createdAtClient: '2026-05-12T02:30:00.000Z'
        }
      }
    })

    expect(
      firestore.getDocument('users/guest-user/electricity_usages/same-client-id')
    ).toMatchObject({
      input: {
        kwh: 120,
        meterStart: null,
        meterEnd: null,
        unit: 'kwh'
      },
      source: {
        createdFrom: 'mobile',
        offlineCreated: true,
        clientGeneratedId: 'same-client-id'
      }
    })
    expect(
      firestore.listCollection('users/guest-user/electricity_usages')
    ).toHaveLength(1)
    expect(secondWrite.monthlySummary).toEqual({
      month: '2026-05',
      totalKwh: 120,
      totalKgCo2e: 102,
      averageKwhPerDay: 120 / 31,
      averageKgCo2ePerDay: 102 / 31,
      usageCount: 1
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
    return new FakeQuery(this.firestore, this.path, [{ fieldPath, operator, value }])
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
    private readonly filters: Array<{
      fieldPath: string
      operator: string
      value: unknown
    }>
  ) {}

  where(fieldPath: string, operator: string, value: unknown) {
    return new FakeQuery(this.firestore, this.path, [
      ...this.filters,
      { fieldPath, operator, value }
    ])
  }

  async get() {
    return {
      docs: this.firestore
        .listCollection(this.path)
        .filter(({ data }) =>
          this.filters.every(
            ({ fieldPath, operator, value }) =>
              operator === '==' && getValueAtPath(data, fieldPath) === value
          )
        )
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
