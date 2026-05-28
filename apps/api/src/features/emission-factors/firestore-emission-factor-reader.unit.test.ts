import type { Firestore } from 'firebase-admin/firestore'
import { describe, expect, it } from 'vitest'

import { createFirestoreEmissionFactorReader } from './firestore-emission-factor-reader.js'

describe('createFirestoreEmissionFactorReader', () => {
  it('reads active electricity factors from the canonical collection', async () => {
    const firestore = createFakeFirestore({
      emission_factors: {
        id_pln_grid_v1: {
          category: 'electricity',
          country: 'ID',
          region: 'national',
          unit: 'kwh',
          kgCo2ePerKwh: 0.85,
          version: 'v1',
          active: true,
          scope: 'scope 2 (location-based)',
          sourceNotes: 'Indonesia national grid emission factor'
        }
      }
    })

    const reader = createFirestoreEmissionFactorReader(
      firestore as unknown as Firestore
    )

    await expect(reader.listActiveElectricityFactors()).resolves.toEqual([
      {
        id: 'id_pln_grid_v1',
        country: 'ID',
        region: 'national',
        unit: 'kwh',
        kgCo2ePerKwh: 0.85,
        version: 'v1',
        active: true,
        scope: 'scope 2 (location-based)',
        sourceNotes: 'Indonesia national grid emission factor'
      }
    ])
  })

  it('rejects an active canonical factor document with invalid state', async () => {
    const firestore = createFakeFirestore({
      emission_factors: {
        id_pln_grid_v1: {
          category: 'electricity',
          country: 'ID',
          region: 'national',
          unit: 'mwh',
          kgCo2ePerKwh: 0.85,
          version: 'v1',
          active: true
        }
      }
    })

    const reader = createFirestoreEmissionFactorReader(
      firestore as unknown as Firestore
    )

    await expect(reader.listActiveElectricityFactors()).rejects.toMatchObject({
      status: 500,
      code: 'invalid_emission_factor_state',
      message: 'Active electricity emission factor data is invalid.'
    })
  })
})

function createFakeFirestore(seed: {
  emission_factors: Record<string, Record<string, unknown>>
}) {
  return {
    collection(name: string) {
      if (name !== 'emission_factors') {
        throw new Error(`Unexpected collection ${name}`)
      }

      return createCollectionReference(seed.emission_factors)
    }
  }
}

function createCollectionReference(
  documents: Record<string, Record<string, unknown>>
) {
  return {
    where(fieldPath: string, operator: string, value: unknown) {
      return createQuery(documents, [{ fieldPath, operator, value }])
    }
  }
}

function createQuery(
  documents: Record<string, Record<string, unknown>>,
  filters: Array<{ fieldPath: string; operator: string; value: unknown }>
) {
  return {
    where(fieldPath: string, operator: string, value: unknown) {
      return createQuery(documents, [...filters, { fieldPath, operator, value }])
    },
    async get() {
      return {
        docs: Object.entries(documents)
          .filter(([, data]) =>
            filters.every(
              ({ fieldPath, operator, value }) =>
                operator === '==' && data[fieldPath] === value
            )
          )
          .map(([id, data]) => ({
            id,
            data: () => data
          }))
      }
    }
  }
}
