import { describe, expect, it } from 'vitest'

import type { EmissionFactor } from './emission-factor-reader.js'
import { selectActiveEmissionFactor } from './select-active-emission-factor.js'

function factor(
  partial: Partial<EmissionFactor> & Pick<EmissionFactor, 'id'>
): EmissionFactor {
  return {
    id: partial.id,
    country: partial.country ?? 'ID',
    region: partial.region ?? 'national',
    unit: 'kwh',
    kgCo2ePerKwh: partial.kgCo2ePerKwh ?? 0.85,
    version: partial.version ?? 'v1',
    active: true,
    scope: partial.scope ?? 'scope 2 (location-based)',
    sourceNotes: partial.sourceNotes ?? ''
  }
}

describe('selectActiveEmissionFactor', () => {
  it('prefers Indonesia national active factor when present', () => {
    const selected = selectActiveEmissionFactor([
      factor({ id: 'sg-national', country: 'SG', region: 'national' }),
      factor({ id: 'id-jamali', country: 'ID', region: 'jamali' }),
      factor({ id: 'id-national', country: 'ID', region: 'national' })
    ])

    expect(selected?.id).toBe('id-national')
  })
})
