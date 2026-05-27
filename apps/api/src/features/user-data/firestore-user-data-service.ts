import { type Firestore } from 'firebase-admin/firestore'

import type { DeleteUserDataParams, UserDataService } from './user-data-service.js'

export function createFirestoreUserDataService(
  firestore: Firestore
): UserDataService {
  return {
    async deleteAllUserData(params) {
      await Promise.all([
        deleteLegacyCollection(firestore, 'devices', params.userId),
        deleteLegacyCollection(firestore, 'dailyUsage', params.userId),
        deleteUserScopedCollection(firestore, params.userId, 'devices'),
        deleteUserScopedCollection(firestore, params.userId, 'electricity_usages'),
        deleteUserScopedCollection(firestore, params.userId, 'monthly_summaries'),
        deleteUserScopedCollection(firestore, params.userId, 'insights'),
        deleteUserScopedCollection(firestore, params.userId, 'preferences')
      ])
    }
  }
}

async function deleteLegacyCollection(
  firestore: Firestore,
  collectionName: string,
  userId: string
) {
  const snapshot = await firestore
    .collection(collectionName)
    .where('userId', '==', userId)
    .get()

  await Promise.all(snapshot.docs.map((doc) => doc.ref.delete()))
}

async function deleteUserScopedCollection(
  firestore: Firestore,
  userId: string,
  collectionName: string
) {
  const snapshot = await firestore
    .collection('users')
    .doc(userId)
    .collection(collectionName)
    .get()

  await Promise.all(snapshot.docs.map((doc) => doc.ref.delete()))
}
