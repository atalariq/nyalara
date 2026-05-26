import { existsSync, readFileSync } from 'node:fs'

export function loadLocalEnv(envFilePaths: URL | URL[]) {
  for (const envFilePath of toCandidateList(envFilePaths)) {
    if (!existsSync(envFilePath)) {
      continue
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

    return
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

function toCandidateList(envFilePaths: URL | URL[]) {
  return Array.isArray(envFilePaths) ? envFilePaths : [envFilePaths]
}
