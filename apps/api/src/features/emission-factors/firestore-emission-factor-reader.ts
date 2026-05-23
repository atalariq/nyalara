import type { Firestore } from 'firebase-admin/firestore'

import { AppError } from '../platform/http/errors.js'
import type {
  EmissionFactor,
  EmissionFactorReader
} from './emission-factor-reader.js'

type EmissionFactorDocument = {
  category: string
  country: string
  region: string
  unit: string
  kgCo2ePerKwh: number
  version: string
  active: boolean
}

export function createFirestoreEmissionFactorReader(
  firestore: Firestore
): EmissionFactorReader {
  return {
    async listActiveElectricityFactors() {
      const snapshot = await firestore
        .collection('emission_factors')
        .where('category', '==', 'electricity')
        .where('active', '==', true)
        .get()

      return snapshot.docs.map((document) => {
        const data = document.data() as EmissionFactorDocument

        return toEmissionFactor(document.id, data)
      })
    }
  }
}

function toEmissionFactor(
  id: string,
  document: EmissionFactorDocument
): EmissionFactor {
  if (
    document.unit !== 'kwh' ||
    !Number.isFinite(document.kgCo2ePerKwh) ||
    document.kgCo2ePerKwh <= 0 ||
    !document.country ||
    !document.region ||
    !document.version ||
    document.active !== true ||
    document.category !== 'electricity'
  ) {
    throw new AppError(
      500,
      'invalid_emission_factor_state',
      'Active electricity emission factor data is invalid.'
    )
  }

  return {
    id,
    country: document.country,
    region: document.region,
    unit: 'kwh',
    kgCo2ePerKwh: document.kgCo2ePerKwh,
    version: document.version,
    active: true
  }
}
