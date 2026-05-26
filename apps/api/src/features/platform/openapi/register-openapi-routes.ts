import type { OpenAPIHono } from '@hono/zod-openapi'
import { swaggerUI } from '@hono/swagger-ui'
import { createMiddleware } from 'hono/factory'

import { AppError } from '../http/errors.js'

type DocsEnvironment = 'development' | 'production' | 'test'

function createDocsGuard(environment: DocsEnvironment) {
  return createMiddleware(async (_c, next) => {
    if (environment === 'production') {
      throw new AppError(
        403,
        'docs_restricted',
        'OpenAPI docs are not available in production.'
      )
    }

    await next()
  })
}

export function registerOpenApiRoutes(
  app: OpenAPIHono,
  environment: DocsEnvironment
) {
  const docsGuard = createDocsGuard(environment)

  app.use('/v1/doc', docsGuard)
  app.use('/v1/ui', docsGuard)

  app.doc('/v1/doc', {
    openapi: '3.0.0',
    info: {
      title: 'Nyalara API',
      version: 'v1'
    }
  })

  app.get('/v1/ui', swaggerUI({ url: '/v1/doc' }))
}
