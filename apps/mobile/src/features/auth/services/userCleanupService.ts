import { db } from '@/config/firebase'
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
} from 'firebase/firestore'

export const userCleanupService = {
  async deleteAllUserData(uid: string): Promise<void> {
    await Promise.all([
      deleteLegacyCollection('devices', uid),
      deleteLegacyCollection('dailyUsage', uid),
      deleteLegacyUserProfile(uid),
      deleteUserScopedCollection(uid, 'devices'),
      deleteUserScopedCollection(uid, 'electricity_usages'),
      deleteUserScopedCollection(uid, 'monthly_summaries'),
      deleteUserScopedCollection(uid, 'insights'),
      deleteUserScopedCollection(uid, 'preferences'),
    ])
  },
}

async function deleteLegacyUserProfile(uid: string) {
  await deleteDoc(doc(db, 'userProfiles', uid))
}

async function deleteLegacyCollection(
  collectionName: string,
  userId: string,
): Promise<void> {
  const q = query(collection(db, collectionName), where('userId', '==', userId))
  const snap = await getDocs(q)
  await Promise.all(snap.docs.map((item) => deleteDoc(item.ref)))
}

async function deleteUserScopedCollection(
  userId: string,
  collectionName: string,
): Promise<void> {
  const snap = await getDocs(collection(db, 'users', userId, collectionName))
  await Promise.all(snap.docs.map((item) => deleteDoc(item.ref)))
}
