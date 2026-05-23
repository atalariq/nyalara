import type { DecodedIdToken } from 'firebase-admin/auth'

export type AuthSession =
  | {
      uid: string
      kind: 'guest'
      isAnonymous: true
    }
  | {
      uid: string
      kind: 'full_account'
      isAnonymous: false
    }

export function classifySession(
  token: Pick<DecodedIdToken, 'uid' | 'firebase'>
): AuthSession {
  const isAnonymous = token.firebase.sign_in_provider === 'anonymous'

  if (isAnonymous) {
    return {
      uid: token.uid,
      kind: 'guest',
      isAnonymous: true
    }
  }

  return {
    uid: token.uid,
    kind: 'full_account',
    isAnonymous: false
  }
}
