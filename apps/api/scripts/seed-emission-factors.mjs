import { existsSync, readFileSync } from 'node:fs'
import { FieldValue, getFirestore } from 'firebase-admin/firestore'
import { getApps, initializeApp } from 'firebase-admin/app'

loadLocalEnv(new URL('../.env', import.meta.url))

const app = getApps()[0] ?? initializeApp()
const firestore = getFirestore(app)

const factors = [
  {
    id: 'id_pln_grid_v1',
    category: 'electricity',
    country: 'ID',
    region: 'national',
    providerName: 'PLN',
    unit: 'kwh',
    kgCo2ePerKwh: 0.85,
    source: 'manual_seed',
    version: 'v1',
    active: true,
    validFrom: '2026-01-01',
    validTo: null
  }
]

for (const factor of factors) {
  await firestore.collection('emission_factors').doc(factor.id).set({
    category: factor.category,
    country: factor.country,
    region: factor.region,
    providerName: factor.providerName,
    unit: factor.unit,
    kgCo2ePerKwh: factor.kgCo2ePerKwh,
    source: factor.source,
    version: factor.version,
    active: factor.active,
    validFrom: factor.validFrom,
    validTo: factor.validTo,
    updatedAt: FieldValue.serverTimestamp()
  })
}

console.log(
  JSON.stringify({
    seeded: factors.map(({ id }) => id),
    count: factors.length
  })
)

function loadLocalEnv(envFilePath) {
  if (!existsSync(envFilePath)) {
    return
  }

  const envFile = readFileSync(envFilePath, 'utf8')

  for (const line of envFile.split(/\r?\n/u)) {
    const trimmedLine = line.trim()

    if (!trimmedLine || trimmedLine.startsWith('#')) {
      continue
    }

    const separatorIndex = trimmedLine.indexOf('=')

    if (separatorIndex <= 0) {
      continue
    }

    const key = trimmedLine.slice(0, separatorIndex).trim()

    if (!key || process.env[key] !== undefined) {
      continue
    }

    const rawValue = trimmedLine.slice(separatorIndex + 1).trim()
    process.env[key] = stripWrappingQuotes(rawValue)
  }
}

function stripWrappingQuotes(value) {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1)
  }

  return value
}
