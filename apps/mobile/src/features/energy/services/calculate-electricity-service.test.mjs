import assert from 'node:assert/strict'
import test from 'node:test'

import { createCalculateElectricityService } from './calculate-electricity-service.ts'

test('energy service calls the protected calculate-electricity endpoint through the shared client', async () => {
  const request = {
    inputType: 'kwh',
    timezoneOffsetMinutes: 420,
    input: {
      kwh: 120,
      meterStart: null,
      meterEnd: null,
      unit: 'kwh',
    },
    period: {
      startDate: '2026-05-01',
      endDate: '2026-05-31',
      month: '2026-05',
    },
  }

  const response = {
    success: true,
    data: {
      electricityKwh: 120,
      emissionFactorId: 'id_pln_grid_v1',
      emissionFactorKgCo2ePerKwh: 0.85,
      totalKgCo2e: 102,
      method: 'server_verified',
      status: 'verified',
    },
  }

  let path = ''
  let body

  const service = createCalculateElectricityService({
    client: {
      async post(nextPath, nextBody) {
        path = nextPath
        body = nextBody
        return response
      },
    },
  })

  const result = await service.calculateElectricity(request)

  assert.equal(path, '/v1/calculate-electricity')
  assert.deepEqual(body, request)
  assert.deepEqual(result, response)
})
