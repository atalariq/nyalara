// features/auth/services/userCleanupService.ts
import { db } from "@/config/firebase";
import {
    collection,
    deleteDoc,
    doc,
    getDocs,
    query,
    where,
} from "firebase/firestore";

export const userCleanupService = {
  async deleteAllUserData(uid: string): Promise<void> {
    await Promise.all([
      deleteCollection("devices", uid),
      deleteCollection("dailyUsage", uid),
      deleteDoc(doc(db, "userProfiles", uid)),
    ]);
  },
};

async function deleteCollection(
  collectionName: string,
  userId: string,
): Promise<void> {
  const q = query(
    collection(db, collectionName),
    where("userId", "==", userId),
  );
  const snap = await getDocs(q);
  await Promise.all(snap.docs.map((d) => deleteDoc(d.ref)));
}
