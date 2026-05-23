import { db } from "@/config/firebase";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import type { CreateDevicePayload, Device } from "../types/device.types";

const COLLECTION = "devices";

function toDevice(id: string, data: any): Device {
  const createdAt = data.createdAt;
  const createdAtMillis =
    createdAt && typeof createdAt.toDate === "function"
      ? createdAt.toDate().getTime()
      : typeof createdAt === "number"
        ? createdAt
        : Date.now();

  return {
    id,
    userId: data.userId,
    name: data.name,
    category: data.category,
    deviceType: data.deviceType,
    watt: data.watt,
    hoursPerDay: data.hoursPerDay,
    daysPerMonth: data.daysPerMonth,
    active: data.active ?? true,
    activatedAt:
      data.activatedAt?.toDate?.().getTime() ?? data.activatedAt ?? null,
    monthlyKwh: data.monthlyKwh,
    monthlyEmissions: data.monthlyEmissions,
    monthlyCost: data.monthlyCost,
    createdAt: createdAtMillis,
  };
}

export const deviceService = {
  async addDevice(
    userId: string,
    payload: CreateDevicePayload,
  ): Promise<Device> {
    const ref = await addDoc(collection(db, COLLECTION), {
      ...payload,
      userId,
      createdAt: serverTimestamp(),
    });
    return toDevice(ref.id, { ...payload, userId });
  },

  async getUserDevices(userId: string): Promise<Device[]> {
    const q = query(
      collection(db, COLLECTION),
      where("userId", "==", userId),
      orderBy("createdAt", "desc"),
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => toDevice(d.id, d.data()));
  },

  listenUserDevices(
    userId: string,
    onData: (devices: Device[]) => void,
  ): () => void {
    const q = query(
      collection(db, COLLECTION),
      where("userId", "==", userId),
      orderBy("createdAt", "desc"),
    );
    return onSnapshot(q, (snap) => {
      onData(snap.docs.map((d) => toDevice(d.id, d.data())));
    });
  },

  async updateDevice(
    deviceId: string,
    payload: Partial<Omit<Device, "id" | "userId" | "createdAt">>,
  ): Promise<void> {
    await updateDoc(doc(db, COLLECTION, deviceId), payload);
  },

  async deleteDevice(deviceId: string): Promise<void> {
    await deleteDoc(doc(db, COLLECTION, deviceId));
  },
};
