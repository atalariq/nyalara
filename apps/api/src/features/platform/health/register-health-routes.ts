import { createRoute, z } from '@hono/zod-openapi'
import type { OpenAPIHono } from '@hono/zod-openapi'

const healthRoute = createRoute({
  method: 'get',
  path: '/v1/health',
  tags: ['Platform'],
  responses: {
    200: {
      description: 'Backend service health',
      content: {
        'application/json': {
          schema: z.object({
            success: z.literal(true),
            data: z.object({
              status: z.literal('ok'),
              service: z.literal('carbon-tracker-backend')
            })
          })
        }
      }
    }
  }
})

export function registerHealthRoutes(app: OpenAPIHono) {
  app.openapi(healthRoute, (c) => {
    return c.json({
      success: true,
      data: {
        status: 'ok',
        service: 'carbon-tracker-backend'
      }
    })
  })
}
