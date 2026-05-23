import { createRoute, z } from '@hono/zod-openapi'
import type { OpenAPIHono } from '@hono/zod-openapi'

import type { IdTokenVerifier } from '../auth/firebase-admin-auth.js'
import { classifySession } from '../auth/session.js'
import type { EmissionFactorReader } from '../emission-factors/emission-factor-reader.js'
import { AppError } from '../platform/http/errors.js'
import type {
  ElectricityUsageRecord,
  ElectricityUsageService
} from './electricity-usage-service.js'

const periodSchema = z.object({
  startDate: z.iso.date(),
  endDate: z.iso.date(),
  month: z.string().regex(/^\d{4}-\d{2}$/)
})

const requestSchema = z.discriminatedUnion('inputType', [
  z.object({
    clientGeneratedId: z.string().min(1),
    inputType: z.literal('kwh'),
    input: z.object({
      kwh: z.number().positive(),
      meterStart: z.null(),
      meterEnd: z.null(),
      unit: z.literal('kwh')
    }),
    period: periodSchema,
    source: z.object({
      createdFrom: z.literal('mobile'),
      offlineCreated: z.boolean()
    }),
    timestamps: z.object({
      usageDate: z.iso.date(),
      createdAtClient: z.iso.datetime({ offset: true })
    })
  }),
  z.object({
    clientGeneratedId: z.string().min(1),
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
    period: periodSchema,
    source: z.object({
      createdFrom: z.literal('mobile'),
      offlineCreated: z.boolean()
    }),
    timestamps: z.object({
      usageDate: z.iso.date(),
      createdAtClient: z.iso.datetime({ offset: true })
    })
  })
])

const responseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    usageId: z.string(),
    usage: z.object({
      inputType: z.enum(['kwh', 'meter_reading']),
      input: z.object({
        kwh: z.number().nullable(),
        meterStart: z.number().nullable(),
        meterEnd: z.number().nullable(),
        unit: z.literal('kwh')
      }),
      period: periodSchema,
      calculation: z.object({
        electricityKwh: z.number(),
        emissionFactorId: z.string(),
        emissionFactorKgCo2ePerKwh: z.number(),
        totalKgCo2e: z.number(),
        method: z.literal('server_verified'),
        status: z.literal('verified')
      }),
      source: z.object({
        createdFrom: z.literal('mobile'),
        offlineCreated: z.boolean(),
        clientGeneratedId: z.string()
      }),
      timestamps: z.object({
        usageDate: z.iso.date(),
        createdAtClient: z.iso.datetime({ offset: true })
      })
    }),
    monthlySummary: z.object({
      month: z.string().regex(/^\d{4}-\d{2}$/),
      totalKwh: z.number(),
      totalKgCo2e: z.number(),
      averageKwhPerDay: z.number(),
      averageKgCo2ePerDay: z.number(),
      usageCount: z.number().int().nonnegative()
    })
  })
})

const route = createRoute({
  method: 'post',
  path: '/v1/electricity-usages',
  tags: ['Electricity Usages'],
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
    201: {
      description: 'Verified electricity usage created and monthly summary recalculated',
      content: {
        'application/json': {
          schema: responseSchema
        }
      }
    }
  }
})

export function registerElectricityUsageRoutes(
  app: OpenAPIHono,
  auth: IdTokenVerifier,
  emissionFactors: EmissionFactorReader,
  electricityUsages: ElectricityUsageService
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

    const session = classifySession(decodedToken)
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

    const calculation = {
      electricityKwh,
      emissionFactorId: activeFactor.id,
      emissionFactorKgCo2ePerKwh: activeFactor.kgCo2ePerKwh,
      totalKgCo2e: electricityKwh * activeFactor.kgCo2ePerKwh,
      method: 'server_verified' as const,
      status: 'verified' as const
    }

    const usage: ElectricityUsageRecord =
      payload.inputType === 'kwh'
        ? {
            inputType: 'kwh',
            input: payload.input,
            period: payload.period,
            calculation,
            source: {
              ...payload.source,
              clientGeneratedId: payload.clientGeneratedId
            },
            timestamps: payload.timestamps
          }
        : {
            inputType: 'meter_reading',
            input: payload.input,
            period: payload.period,
            calculation,
            source: {
              ...payload.source,
              clientGeneratedId: payload.clientGeneratedId
            },
            timestamps: payload.timestamps
          }

    const result = await electricityUsages.createUsage({
      userId: session.uid,
      usageId: payload.clientGeneratedId,
      usage
    })

    return c.json(
      {
        success: true,
        data: result
      },
      201
    )
  })
}
