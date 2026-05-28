import type { IdTokenVerifier } from './firebase-admin-auth.js'
import { classifySession, type AuthSession } from './session.js'
import { AppError } from '../platform/http/errors.js'

export async function authenticate(
  authorization: string | undefined,
  auth: IdTokenVerifier
): Promise<AuthSession> {
  if (!authorization?.startsWith('Bearer ')) {
    throw new AppError(401, 'unauthorized', 'Authorization token is required.')
  }

  const idToken = authorization.slice('Bearer '.length)

  try {
    return classifySession(await auth.verifyIdToken(idToken))
  } catch {
    throw new AppError(401, 'unauthorized', 'Authorization token is invalid.')
  }
}

export function requireFullAccount(session: AuthSession): void {
  if (session.kind !== 'full_account') {
    throw new AppError(403, 'forbidden', 'A full account session is required.')
  }
}