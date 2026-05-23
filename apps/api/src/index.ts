import { serve } from '@hono/node-server'
import { createApp } from './app/create-app.js'
import { createFirebaseAdminAuthVerifier } from './features/auth/firebase-admin-auth.js'
import { createFirestoreEmissionFactorReader } from './features/emission-factors/firestore-emission-factor-reader.js'
import { getFirebaseAdminServices } from './features/platform/firebase/firebase-admin.js'

const firebase = getFirebaseAdminServices()

const app = createApp({
  environment: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  auth: createFirebaseAdminAuthVerifier(firebase.auth),
  emissionFactors: createFirestoreEmissionFactorReader(firebase.firestore)
})

serve({
  fetch: app.fetch,
  port: 3000
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})
