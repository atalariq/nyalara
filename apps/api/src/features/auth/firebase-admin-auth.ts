import type { Auth, DecodedIdToken } from 'firebase-admin/auth'

export type IdTokenVerifier = {
  verifyIdToken(idToken: string): Promise<DecodedIdToken>
}

export function createFirebaseAdminAuthVerifier(auth: Auth): IdTokenVerifier {
  return {
    verifyIdToken(idToken: string) {
      return auth.verifyIdToken(idToken)
    }
  }
}
