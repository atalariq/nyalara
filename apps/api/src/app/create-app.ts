import { OpenAPIHono } from '@hono/zod-openapi'

import type { IdTokenVerifier } from '../features/auth/firebase-admin-auth.js'
import type { EmissionFactorReader } from '../features/emission-factors/emission-factor-reader.js'
import { registerEmissionFactorRoutes } from '../features/emission-factors/register-emission-factor-routes.js'
import { AppError, toErrorEnvelope } from '../features/platform/http/errors.js'
import { registerHealthRoutes } from '../features/platform/health/register-health-routes.js'
import { registerOpenApiRoutes } from '../features/platform/openapi/register-openapi-routes.js'

export type AppEnvironment = 'development' | 'production' | 'test'

export type CreateAppOptions = {
  environment: AppEnvironment
  auth: IdTokenVerifier
  emissionFactors: EmissionFactorReader
}

export function createApp(options: CreateAppOptions) {
  const app = new OpenAPIHono()

  app.notFound((c) => {
    return c.json(
      toErrorEnvelope(new AppError(404, 'not_found', 'Route not found.')),
      404
    )
  })

  app.onError((error, c) => {
    if (error instanceof AppError) {
      return c.json(toErrorEnvelope(error), error.status)
    }

    console.error('request_failed', {
      path: c.req.path,
      method: c.req.method,
      errorName: error.name,
      errorMessage: error.message
    })

    return c.json(
      toErrorEnvelope(
        new AppError(500, 'internal_error', 'An unexpected error occurred.')
      ),
      500
    )
  })

  registerHealthRoutes(app)
  registerEmissionFactorRoutes(app, options.emissionFactors)
  registerOpenApiRoutes(app, options.environment)

  return app
}
