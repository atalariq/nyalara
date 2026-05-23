import { OpenAPIHono } from '@hono/zod-openapi'

import type { IdTokenVerifier } from '../features/auth/firebase-admin-auth.js'
import { registerCalculateElectricityRoutes } from '../features/calculations/register-calculate-electricity-routes.js'
import type { EmissionFactorReader } from '../features/emission-factors/emission-factor-reader.js'
import { registerEmissionFactorRoutes } from '../features/emission-factors/register-emission-factor-routes.js'
import type { ElectricityUsageService } from '../features/electricity-usages/electricity-usage-service.js'
import { registerElectricityUsageRoutes } from '../features/electricity-usages/register-electricity-usage-routes.js'
import { AppError, toErrorEnvelope } from '../features/platform/http/errors.js'
import { registerHealthRoutes } from '../features/platform/health/register-health-routes.js'
import { registerOpenApiRoutes } from '../features/platform/openapi/register-openapi-routes.js'

export type AppEnvironment = 'development' | 'production' | 'test'

export type CreateAppOptions = {
  environment: AppEnvironment
  auth: IdTokenVerifier
  emissionFactors: EmissionFactorReader
  electricityUsages: ElectricityUsageService
}

export function createApp(options: CreateAppOptions) {
  const app = new OpenAPIHono({
    defaultHook: (result, c) => {
      if (!result.success) {
        return c.json(
          toErrorEnvelope(
            new AppError(
              400,
              'validation_error',
              'Request validation failed.',
              result.error.issues
            )
          ),
          400
        )
      }
    }
  })

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
  registerCalculateElectricityRoutes(app, options.auth, options.emissionFactors)
  registerElectricityUsageRoutes(
    app,
    options.auth,
    options.emissionFactors,
    options.electricityUsages
  )
  registerOpenApiRoutes(app, options.environment)

  return app
}
