import type { Firestore } from 'firebase-admin/firestore'

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
