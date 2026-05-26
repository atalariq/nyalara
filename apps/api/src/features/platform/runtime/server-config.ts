const DEFAULT_PORT = 3000

export function shouldLoadLocalEnv(environment: NodeJS.ProcessEnv) {
  return (
    environment.NODE_ENV !== 'production' &&
    environment.K_SERVICE === undefined
  )
}

export function resolvePort(environment: NodeJS.ProcessEnv) {
  const rawPort = environment.PORT

  if (rawPort === undefined) {
    return DEFAULT_PORT
  }

  const port = Number(rawPort)

  if (!Number.isInteger(port) || port <= 0) {
    throw new Error(`Invalid PORT value: ${rawPort}`)
  }

  return port
}
