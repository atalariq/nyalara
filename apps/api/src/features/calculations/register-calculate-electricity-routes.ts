import { createRoute, z } from '@hono/zod-openapi'
import type { OpenAPIHono } from '@hono/zod-openapi'

import type { IdTokenVerifier } from '../auth/firebase-admin-auth.js'
import { classifySession } from '../auth/session.js'
import type { EmissionFactorReader } from '../emission-factors/emission-factor-reader.js'
import { AppError } from '../platform/http/errors.js'

const periodSchema = z.object({
  startDate: z.iso.date(),
  endDate: z.iso.date(),
  month: z.string().regex(/^\d{4}-\d{2}$/)
})

const requestSchema = z.discriminatedUnion('inputType', [
  z.object({
    inputType: z.literal('kwh'),
    input: z.object({
      kwh: z.number().positive(),
      meterStart: z.null(),
      meterEnd: z.null(),
      unit: z.literal('kwh')
    }),
    period: periodSchema
  }),
  z.object({
    inputType: z.literal('meter_reading'),
    input: z
      .object({
        kwh: z.null(),
        meterStart: z.number(),
        meterEnd: z.number(),
        unit: z.literal('kwh')
      })
      .refine((input) => input.meterEnd >= input.meterStart, {
        message: 'meterEnd must be greater than or equal to meterStart.',
        path: ['meterEnd']
      }),
    period: periodSchema
  })
])

const responseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    electricityKwh: z.number(),
    emissionFactorId: z.string(),
    emissionFactorKgCo2ePerKwh: z.number(),
    totalKgCo2e: z.number(),
    method: z.literal('server_verified'),
    status: z.literal('verified')
  })
})

const route = createRoute({
  method: 'post',
  path: '/v1/calculate-electricity',
  tags: ['Calculations'],
  request: {
    body: {
      required: true,
      content: {
        'application/json': {
          schema: requestSchema
        }
      }
    }
  },
  responses: {
    200: {
      description: 'Verified electricity calculation',
      content: {
        'application/json': {
          schema: responseSchema
        }
      }
    }
  }
})

export function registerCalculateElectricityRoutes(
  app: OpenAPIHono,
  auth: IdTokenVerifier,
  emissionFactors: EmissionFactorReader
) {
  app.openapi(route, async (c) => {
    const authorization = c.req.header('authorization')

    if (!authorization?.startsWith('Bearer ')) {
      throw new AppError(401, 'unauthorized', 'Authorization token is required.')
    }

    const idToken = authorization.slice('Bearer '.length)
    let decodedToken

    try {
      decodedToken = await auth.verifyIdToken(idToken)
    } catch {
      throw new AppError(401, 'unauthorized', 'Authorization token is invalid.')
    }

    classifySession(decodedToken)

    const payload = c.req.valid('json')
    const activeFactors = await emissionFactors.listActiveElectricityFactors()
    const activeFactor = activeFactors[0]

    if (!activeFactor) {
      throw new AppError(
        404,
        'emission_factors_not_found',
        'No active electricity emission factors are available.'
      )
    }

    const electricityKwh =
      payload.inputType === 'kwh'
        ? payload.input.kwh
        : payload.input.meterEnd - payload.input.meterStart

    return c.json({
      success: true,
      data: {
        electricityKwh,
        emissionFactorId: activeFactor.id,
        emissionFactorKgCo2ePerKwh: activeFactor.kgCo2ePerKwh,
        totalKgCo2e: electricityKwh * activeFactor.kgCo2ePerKwh,
        method: 'server_verified',
        status: 'verified'
      }
    })
  })
}
