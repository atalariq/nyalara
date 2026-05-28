import type { EmissionFactor } from './emission-factor-reader.js'

export function selectActiveEmissionFactor(
  factors: EmissionFactor[]
): EmissionFactor | null {
  const indonesiaNational = factors.find(
    (factor) => factor.country === 'ID' && factor.region === 'national'
  )

  if (indonesiaNational) {
    return indonesiaNational
  }

  if (factors.length === 0) {
    return null
  }

  return [...factors].sort((left, right) => left.id.localeCompare(right.id))[0]
}
