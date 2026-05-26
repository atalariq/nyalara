import { createRoute, z } from '@hono/zod-openapi'
import type { OpenAPIHono } from '@hono/zod-openapi'

import type { IdTokenVerifier } from '../auth/firebase-admin-auth.js'
import { classifySession } from '../auth/session.js'
import { AppError } from '../platform/http/errors.js'
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

    if (session.kind !== 'full_account') {
      throw new AppError(403, 'forbidden', 'A full account session is required.')
    }

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
