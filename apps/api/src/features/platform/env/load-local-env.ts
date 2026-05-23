import { existsSync, readFileSync } from 'node:fs'

export function loadLocalEnv(envFilePath: URL) {
  if (!existsSync(envFilePath)) {
    return
  }

  const envFile = readFileSync(envFilePath, 'utf8')

  for (const line of envFile.split(/\r?\n/u)) {
    const trimmedLine = line.trim()

    if (!trimmedLine || trimmedLine.startsWith('#')) {
      continue
    }

    const separatorIndex = trimmedLine.indexOf('=')

    if (separatorIndex <= 0) {
      continue
    }

    const key = trimmedLine.slice(0, separatorIndex).trim()

    if (!key || process.env[key] !== undefined) {
      continue
    }

    const rawValue = trimmedLine.slice(separatorIndex + 1).trim()
    process.env[key] = stripWrappingQuotes(rawValue)
  }
}

function stripWrappingQuotes(value: string) {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1)
  }

  return value
}
