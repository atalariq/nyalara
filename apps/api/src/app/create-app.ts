import { OpenAPIHono } from '@hono/zod-openapi'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'

import type { IdTokenVerifier } from '../features/auth/firebase-admin-auth.js'
import { registerCalculateElectricityRoutes } from '../features/calculations/register-calculate-electricity-routes.js'
import type { DeviceService } from '../features/devices/device-service.js'
import { registerDeviceRoutes } from '../features/devices/register-device-routes.js'
import type { EmissionFactorReader } from '../features/emission-factors/emission-factor-reader.js'
import { registerEmissionFactorRoutes } from '../features/emission-factors/register-emission-factor-routes.js'
import type { EnergyInsightService } from '../features/energy-insights/energy-insight-service.js'
import { registerGenerateEnergyInsightRoutes } from '../features/energy-insights/register-generate-energy-insight-routes.js'
import type { ElectricityUsageService } from '../features/electricity-usages/electricity-usage-service.js'
import { registerElectricityUsageRoutes } from '../features/electricity-usages/register-electricity-usage-routes.js'
import { registerListElectricityUsageRoutes } from '../features/electricity-usages/register-list-electricity-usages-routes.js'
import { registerMonthlySummaryRoutes } from '../features/electricity-usages/register-monthly-summary-routes.js'
import { registerRecalculateMonthlySummaryRoutes } from '../features/electricity-usages/register-recalculate-monthly-summary-routes.js'
import type { UserProfileService } from '../features/profile/user-profile-service.js'
import { registerUserProfileRoutes } from '../features/profile/register-user-profile-routes.js'
import { AppError, toErrorEnvelope } from '../features/platform/http/errors.js'
import { registerHealthRoutes } from '../features/platform/health/register-health-routes.js'
import { registerOpenApiRoutes } from '../features/platform/openapi/register-openapi-routes.js'
import { createRateLimiter } from '../features/platform/rate-limiter/create-rate-limiter.js'
import type { UserDataService } from '../features/user-data/user-data-service.js'
import { registerUserDataRoutes } from '../features/user-data/register-user-data-routes.js'

export type AppEnvironment = 'development' | 'production' | 'test'

export type CreateAppOptions = {
  environment: AppEnvironment
  auth: IdTokenVerifier
  emissionFactors: EmissionFactorReader
  electricityUsages: ElectricityUsageService
  devices?: DeviceService
  energyInsights?: EnergyInsightService
  userProfiles?: UserProfileService
  userData?: UserDataService
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

  app.use(
    '*',
    cors({
      origin: '*',
      allowMethods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
      allowHeaders: ['Authorization', 'Content-Type'],
      maxAge: 86_400
    })
  )

  if (options.environment === 'development') {
    app.use('*', logger())
  }

  if (options.environment === 'production') {
    app.use('*', createRateLimiter({ windowMs: 60_000, maxRequests: 100 }))
  }

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
  registerDeviceRoutes(app, options.auth, options.devices ?? createMissingDeviceService())
  registerUserProfileRoutes(
    app,
    options.auth,
    options.userProfiles ?? createMissingUserProfileService()
  )
  registerCalculateElectricityRoutes(app, options.auth, options.emissionFactors)
  registerElectricityUsageRoutes(
    app,
    options.auth,
    options.devices ?? createMissingDeviceService(),
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
  registerUserDataRoutes(app, options.auth, options.userData ?? createMissingUserDataService())
  registerOpenApiRoutes(app, options.environment)

  return app
}

function createMissingUserProfileService(): UserProfileService {
  return {
    async getProfile() {
      throw new AppError(
        500,
        'user_profiles_not_configured',
        'User profile service is not configured.'
      )
    },
    async createProfile() {
      throw new AppError(
        500,
        'user_profiles_not_configured',
        'User profile service is not configured.'
      )
    },
    async updateProfile() {
      throw new AppError(
        500,
        'user_profiles_not_configured',
        'User profile service is not configured.'
      )
    }
  }
}

function createMissingUserDataService(): UserDataService {
  return {
    async deleteAllUserData() {
      throw new AppError(
        500,
        'user_data_not_configured',
        'User data service is not configured.'
      )
    }
  }
}

function createMissingDeviceService(): DeviceService {
  return {
    async listDevices() {
      throw new AppError(500, 'devices_not_configured', 'Device service is not configured.')
    },
    async createDevice() {
      throw new AppError(500, 'devices_not_configured', 'Device service is not configured.')
    },
    async updateDevice() {
      throw new AppError(500, 'devices_not_configured', 'Device service is not configured.')
    },
    async deleteDevice() {
      throw new AppError(500, 'devices_not_configured', 'Device service is not configured.')
    },
    async getDevicesByIds() {
      throw new AppError(500, 'devices_not_configured', 'Device service is not configured.')
    }
  }
}
