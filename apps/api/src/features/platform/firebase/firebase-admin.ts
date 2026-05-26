import { getApps, initializeApp } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'

function getFirebaseAdminApp() {
  if (getApps().length > 0) {
    return getApps()[0]
  }

  return initializeApp()
}

export function getFirebaseAdminServices() {
  const app = getFirebaseAdminApp()

  return {
    auth: getAuth(app),
    firestore: getFirestore(app)
  }
}
