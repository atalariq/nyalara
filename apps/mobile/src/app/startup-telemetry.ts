const APP_START_MS = Date.now()
const ENABLED =
  __DEV__ || process.env.EXPO_PUBLIC_ENABLE_STARTUP_TELEMETRY === 'true'

export function markStartup(event: string) {
  if (!ENABLED) return
  const elapsedMs = Date.now() - APP_START_MS
  console.log(`[startup] ${event} @ ${elapsedMs}ms`)
}
