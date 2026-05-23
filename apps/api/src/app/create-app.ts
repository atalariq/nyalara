import { OpenAPIHono } from '@hono/zod-openapi'

import type { IdTokenVerifier } from '../features/auth/firebase-admin-auth.js'
import { registerCalculateElectricityRoutes } from '../features/calculations/register-calculate-electricity-routes.js'
import type { EmissionFactorReader } from '../features/emission-factors/emission-factor-reader.js'
import { registerEmissionFactorRoutes } from '../features/emission-factors/register-emission-factor-routes.js'
import type { EnergyInsightService } from '../features/energy-insights/energy-insight-service.js'
import { registerGenerateEnergyInsightRoutes } from '../features/energy-insights/register-generate-energy-insight-routes.js'
import type { ElectricityUsageService } from '../features/electricity-usages/electricity-usage-service.js'
import { registerElectricityUsageRoutes } from '../features/electricity-usages/register-electricity-usage-routes.js'
import { registerListElectricityUsageRoutes } from '../features/electricity-usages/register-list-electricity-usages-routes.js'
import { registerMonthlySummaryRoutes } from '../features/electricity-usages/register-monthly-summary-routes.js'
import { registerRecalculateMonthlySummaryRoutes } from '../features/electricity-usages/register-recalculate-monthly-summary-routes.js'
import { AppError, toErrorEnvelope } from '../features/platform/http/errors.js'
import { registerHealthRoutes } from '../features/platform/health/register-health-routes.js'
import { registerOpenApiRoutes } from '../features/platform/openapi/register-openapi-routes.js'

export type AppEnvironment = 'development' | 'production' | 'test'

export type CreateAppOptions = {
  environment: AppEnvironment
  auth: IdTokenVerifier
  emissionFactors: EmissionFactorReader
  electricityUsages: ElectricityUsageService
  energyInsights?: EnergyInsightService
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
  registerListElectricityUsageRoutes(app, options.auth, options.electricityUsages)
  registerMonthlySummaryRoutes(app, options.auth, options.electricityUsages)
  registerRecalculateMonthlySummaryRoutes(
    app,
    options.auth,
    options.electricityUsages
  )
  registerGenerateEnergyInsightRoutes(app, options.auth, {
    generateMonthlyInsight:
      options.energyInsights?.generateMonthlyInsight ??
      (async () => {
        throw new AppError(
          500,
          'gemini_not_configured',
          'Gemini API is not configured.'
        )
      })
  })
  registerOpenApiRoutes(app, options.environment)

  return app
}
