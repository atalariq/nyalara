import { describe, expect, it } from 'vitest'

import { createApp } from '../../app/create-app.js'

describe('GET /v1/emission-factors', () => {
  it('returns active electricity emission factors', async () => {
    const app = createApp({
      environment: 'test',
      auth: {
        verifyIdToken: async () => {
          throw new Error('not used in this test')
        }
      },
      emissionFactors: {
        listActiveElectricityFactors: async () => [
          {
            id: 'id_pln_grid_v1',
            country: 'ID',
            region: 'national',
            unit: 'kwh',
            kgCo2ePerKwh: 0.85,
            version: 'v1',
            active: true
          }
        ]
      },
      electricityUsages: {
        createUsage: async () => {
          throw new Error('not used in this test')
        },
        getMonthlySummary: async () => {
          throw new Error('not used in this test')
        }
      }
    })

    const response = await app.request('/v1/emission-factors')

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({
      success: true,
      data: [
        {
          id: 'id_pln_grid_v1',
          country: 'ID',
          region: 'national',
          unit: 'kwh',
          kgCo2ePerKwh: 0.85,
          version: 'v1',
          active: true
        }
      ]
    })
  })

  it('returns the uniform error envelope when no active electricity factors exist', async () => {
    const app = createApp({
      environment: 'test',
      auth: {
        verifyIdToken: async () => {
          throw new Error('not used in this test')
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
        }
      }
    })

    const response = await app.request('/v1/emission-factors')

    expect(response.status).toBe(404)
    await expect(response.json()).resolves.toEqual({
      success: false,
      error: {
        code: 'emission_factors_not_found',
        message: 'No active electricity emission factors are available.'
      }
    })
  })
})
