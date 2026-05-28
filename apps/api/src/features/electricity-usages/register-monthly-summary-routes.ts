import { createRoute, z } from '@hono/zod-openapi'
import type { OpenAPIHono } from '@hono/zod-openapi'

import { authenticate } from '../auth/auth-middleware.js'
import type { IdTokenVerifier } from '../auth/firebase-admin-auth.js'
import { AppError } from '../platform/http/errors.js'
import type { ElectricityUsageService } from './electricity-usage-service.js'

const querySchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/)
})

const responseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    monthlySummary: z.object({
      month: z.string().regex(/^\d{4}-\d{2}$/),
      totalKwh: z.number(),
      totalKgCo2e: z.number(),
      averageKwhPerDay: z.number(),
      averageKgCo2ePerDay: z.number(),
      usageCount: z.number().int().nonnegative()
    }),
    currentStreak: z.object({
      length: z.number().int().nonnegative(),
      lastTrackedDate: z.iso.date().nullable()
    })
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
    const session = await authenticate(c.req.header('authorization'), auth)
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