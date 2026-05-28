import { createRoute, z } from '@hono/zod-openapi'
import type { OpenAPIHono } from '@hono/zod-openapi'

import { authenticate } from '../auth/auth-middleware.js'
import type { IdTokenVerifier } from '../auth/firebase-admin-auth.js'
import type { ElectricityUsageService } from './electricity-usage-service.js'

const requestSchema = z.object({
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
  method: 'post',
  path: '/v1/recalculate-monthly-summary',
  tags: ['Monthly Summary'],
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
      description: 'Recomputed monthly summary for the requested month',
      content: {
        'application/json': {
          schema: responseSchema
        }
      }
    }
  }
})

export function registerRecalculateMonthlySummaryRoutes(
  app: OpenAPIHono,
  auth: IdTokenVerifier,
  electricityUsages: ElectricityUsageService
) {
  app.openapi(route, async (c) => {
    const session = await authenticate(c.req.header('authorization'), auth)
    const payload = c.req.valid('json')
    const monthlySummary = await electricityUsages.recalculateMonthlySummary({
      userId: session.uid,
      month: payload.month
    })

    return c.json({
      success: true,
      data: monthlySummary
    })
  })
}