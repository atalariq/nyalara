import { createRoute, z } from '@hono/zod-openapi'
import type { OpenAPIHono } from '@hono/zod-openapi'

import type { EmissionFactorReader } from './emission-factor-reader.js'
import { AppError } from '../platform/http/errors.js'

const emissionFactorSchema = z.object({
  id: z.string(),
  country: z.string(),
  region: z.string(),
  unit: z.literal('kwh'),
  kgCo2ePerKwh: z.number(),
  version: z.string(),
  active: z.literal(true)
})

const listEmissionFactorsRoute = createRoute({
  method: 'get',
  path: '/v1/emission-factors',
  tags: ['Emission Factors'],
  responses: {
    200: {
      description: 'Active electricity emission factors',
      content: {
        'application/json': {
          schema: z.object({
            success: z.literal(true),
            data: z.array(emissionFactorSchema)
          })
        }
      }
    }
  }
})

export function registerEmissionFactorRoutes(
  app: OpenAPIHono,
  emissionFactors: EmissionFactorReader
) {
  app.openapi(listEmissionFactorsRoute, async (c) => {
    const activeFactors = await emissionFactors.listActiveElectricityFactors()

    if (activeFactors.length === 0) {
      throw new AppError(
        404,
        'emission_factors_not_found',
        'No active electricity emission factors are available.'
      )
    }

    return c.json({
      success: true,
      data: activeFactors
    })
  })
}
