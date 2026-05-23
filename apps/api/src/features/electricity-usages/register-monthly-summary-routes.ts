import { createRoute, z } from '@hono/zod-openapi'
import type { OpenAPIHono } from '@hono/zod-openapi'

import type { IdTokenVerifier } from '../auth/firebase-admin-auth.js'
import { classifySession } from '../auth/session.js'
import { AppError } from '../platform/http/errors.js'
import type { ElectricityUsageService } from './electricity-usage-service.js'

const querySchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/)
})

const responseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    month: z.string().regex(/^\d{4}-\d{2}$/),
    totalKwh: z.number(),
    totalKgCo2e: z.number(),
    averageKwhPerDay: z.number(),
    averageKgCo2ePerDay: z.number(),
    usageCount: z.number().int().nonnegative()
  })
})

const route = createRoute({
  method: 'get',
  path: '/v1/monthly-summary',
  tags: ['Monthly Summary'],
  request: {
    query: querySchema
  },
  responses: {
    200: {
      description: 'Monthly summary for the requested month',
      content: {
        'application/json': {
          schema: responseSchema
        }
      }
    }
  }
})

export function registerMonthlySummaryRoutes(
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
    const monthlySummary = await electricityUsages.getMonthlySummary({
      userId: session.uid,
      month: query.month
    })

    if (!monthlySummary) {
      throw new AppError(
        404,
        'monthly_summary_not_found',
        'Monthly summary not found for the requested month.'
      )
    }

    return c.json({
      success: true,
      data: monthlySummary
    })
  })
}
