import { createRoute, z } from '@hono/zod-openapi'
import type { OpenAPIHono } from '@hono/zod-openapi'

import type { IdTokenVerifier } from '../auth/firebase-admin-auth.js'
import { classifySession } from '../auth/session.js'
import { AppError } from '../platform/http/errors.js'
import type { ElectricityUsageService } from './electricity-usage-service.js'

const querySchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/)
})

const electricityUsageRecordSchema = z.object({
  inputType: z.enum(['kwh', 'meter_reading']),
  input: z.object({
    kwh: z.number().nullable(),
    meterStart: z.number().nullable(),
    meterEnd: z.number().nullable(),
    unit: z.literal('kwh')
  }),
  period: z.object({
    startDate: z.iso.date(),
    endDate: z.iso.date(),
    month: z.string().regex(/^\d{4}-\d{2}$/)
  }),
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
})

const responseSchema = z.object({
  success: z.literal(true),
  data: z.array(
    z.object({
      usageId: z.string(),
      usage: electricityUsageRecordSchema
    })
  )
})

const route = createRoute({
  method: 'get',
  path: '/v1/electricity-usages',
  tags: ['Electricity Usages'],
  request: {
    query: querySchema
  },
  responses: {
    200: {
      description: 'Electricity usage history for the requested month',
      content: {
        'application/json': {
          schema: responseSchema
        }
      }
    }
  }
})

export function registerListElectricityUsageRoutes(
  app: OpenAPIHono,
  auth: IdTokenVerifier,
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
    const query = c.req.valid('query')
    const usages = await electricityUsages.listUsages({
      userId: session.uid,
      month: query.month
    })

    return c.json({
      success: true,
      data: usages
    })
  })
}
