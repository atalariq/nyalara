import { createRoute, z } from '@hono/zod-openapi'
import type { OpenAPIHono } from '@hono/zod-openapi'

import { authenticate, requireFullAccount } from '../auth/auth-middleware.js'
import type { IdTokenVerifier } from '../auth/firebase-admin-auth.js'
import type { EnergyInsightService } from './energy-insight-service.js'

const requestSchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/),
  force: z.boolean().optional().default(false)
})

const responseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    insightId: z.string(),
    title: z.string(),
    summary: z.string(),
    isStale: z.boolean(),
    suggestions: z.array(
      z.object({
        title: z.string(),
        description: z.string(),
        estimatedImpactKgCo2e: z.number()
      })
    )
  })
})

const route = createRoute({
  method: 'post',
  path: '/v1/generate-energy-insight',
  tags: ['Energy Insights'],
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
      description: 'Generated or returned the monthly energy insight',
      content: {
        'application/json': {
          schema: responseSchema
        }
      }
    }
  }
})

export function registerGenerateEnergyInsightRoutes(
  app: OpenAPIHono,
  auth: IdTokenVerifier,
  energyInsights: EnergyInsightService
) {
  app.openapi(route, async (c) => {
    const session = await authenticate(c.req.header('authorization'), auth)
    requireFullAccount(session)

    const payload = c.req.valid('json')
    const insight = await energyInsights.generateMonthlyInsight({
      userId: session.uid,
      month: payload.month,
      force: payload.force ?? false
    })

    return c.json({
      success: true,
      data: insight
    })
  })
}