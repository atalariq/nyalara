import { existsSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const defaultEnvFilePath = fileURLToPath(new URL('../.env', import.meta.url))

export async function mintAnonymousAuthToken({
  envFilePath = defaultEnvFilePath,
  fetchImpl = fetch,
  stdout = process.stdout
} = {}) {
  const env = readEnvFile(envFilePath)
  const apiKey = requireEnv(env, 'EXPO_PUBLIC_FIREBASE_API_KEY')
  const projectId = requireEnv(env, 'EXPO_PUBLIC_FIREBASE_PROJECT_ID')

  const response = await fetchImpl(
    `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${apiKey}`,
    {
      method: 'POST',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        returnSecureToken: true
      })
    }
  )

  const payload = await response.json()

  if (!response.ok) {
    throw new Error(payload?.error?.message ?? 'Anonymous Firebase sign-in failed.')
  }

  const result = {
    projectId,
    uid: payload.localId,
    isAnonymous: true,
    idToken: payload.idToken
  }

  stdout.write(`${JSON.stringify(result)}\n`)

  return result
}

function readEnvFile(envFilePath) {
  if (!existsSync(envFilePath)) {
    throw new Error(`Env file not found: ${envFilePath}`)
  }

  const envFile = readFileSync(envFilePath, 'utf8')
  const env = {}

  for (const line of envFile.split(/\r?\n/)) {
    const trimmedLine = line.trim()

    if (!trimmedLine || trimmedLine.startsWith('#')) {
      continue
    }

    const separatorIndex = trimmedLine.indexOf('=')

    if (separatorIndex === -1) {
      continue
    }

    const key = trimmedLine.slice(0, separatorIndex).trim()
    const value = trimmedLine.slice(separatorIndex + 1).trim()
    env[key] = stripWrappingQuotes(value)
  }

  return env
}

function requireEnv(env, key) {
  const value = env[key]

  if (!value) {
    throw new Error(`Missing required env var: ${key}`)
  }

  return value
}

function stripWrappingQuotes(value) {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1)
  }

  return value
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  mintAnonymousAuthToken().catch((error) => {
    console.error(error.message)
    process.exitCode = 1
  })
}

export { defaultEnvFilePath }
