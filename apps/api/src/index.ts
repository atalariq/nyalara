import { serve } from '@hono/node-server'
import { createApp } from './app/create-app.js'
import { createFirebaseAdminAuthVerifier } from './features/auth/firebase-admin-auth.js'
import { createFirestoreEmissionFactorReader } from './features/emission-factors/firestore-emission-factor-reader.js'
import { createGeminiEnergyInsightGenerator } from './features/energy-insights/gemini-energy-insight-generator.js'
import { createFirestoreEnergyInsightService } from './features/energy-insights/firestore-energy-insight-service.js'
import { createFirestoreElectricityUsageService } from './features/electricity-usages/firestore-electricity-usage-service.js'
import { AppError } from './features/platform/http/errors.js'
import { loadLocalEnv } from './features/platform/env/load-local-env.js'
import { getFirebaseAdminServices } from './features/platform/firebase/firebase-admin.js'
import {
  resolvePort,
  shouldLoadLocalEnv
} from './features/platform/runtime/server-config.js'

if (shouldLoadLocalEnv(process.env)) {
  loadLocalEnv([
    new URL('../.env', import.meta.url),
    new URL('../../.env', import.meta.url)
  ])
}

const firebase = getFirebaseAdminServices()
const geminiApiKey = process.env.GEMINI_API_KEY
const geminiModel = process.env.GEMINI_MODEL ?? 'gemini-3.5-flash'
const port = resolvePort(process.env)

const app = createApp({
  environment: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  auth: createFirebaseAdminAuthVerifier(firebase.auth),
  emissionFactors: createFirestoreEmissionFactorReader(firebase.firestore),
  electricityUsages: createFirestoreElectricityUsageService(firebase.firestore),
  energyInsights: createFirestoreEnergyInsightService(
    firebase.firestore,
    geminiApiKey
      ? createGeminiEnergyInsightGenerator({
          apiKey: geminiApiKey,
          model: geminiModel
        })
      : {
          generate: async () => {
            throw new AppError(
              500,
              'gemini_not_configured',
              'Gemini API is not configured.'
            )
          }
        }
  )
})

const server = serve({
  fetch: app.fetch,
  port
}, (info) => {
  console.log(`Server is running on port ${info.port}`)
})

process.on('SIGINT', () => {
  server.close()
  process.exit(0)
})

process.on('SIGTERM', () => {
  server.close((error) => {
    if (error) {
      console.error(error)
      process.exit(1)
    }

    process.exit(0)
  })
})
