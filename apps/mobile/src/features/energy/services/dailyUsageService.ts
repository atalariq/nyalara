import { db } from "@/config/firebase";
import { CARBON_CONFIG } from "@/shared/config/carbonConfig";
import {
    collection,
    doc,
    getDoc,
    getDocs,
    limitToLast,
    onSnapshot,
    orderBy,
    query,
    setDoc,
    where,
} from "firebase/firestore";
import type { DailyUsage, DeviceDailyRecord } from "../types/dailyUsage.types";

const COLLECTION = "dailyUsage";

function toDateString(date: Date): string {
  return date.toISOString().split("T")[0];
}

function docId(userId: string, date: string): string {
  return `${userId}_${date}`;
}

function toDailyUsage(id: string, data: any): DailyUsage {
  return {
    id,
    userId: data.userId,
    date: data.date,
    totalKwh: data.totalKwh ?? 0,
    totalEmissions: data.totalEmissions ?? 0,
    totalCost: data.totalCost ?? 0,
    devices: data.devices ?? {},
  };
}

export const dailyUsageService = {
  async getByDate(userId: string, date: Date): Promise<DailyUsage | null> {
    const dateStr = toDateString(date);
    const ref = doc(db, COLLECTION, docId(userId, dateStr));
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    return toDailyUsage(snap.id, snap.data());
  },

  async getHistory(userId: string, days: number = 30): Promise<DailyUsage[]> {
    const q = query(
      collection(db, COLLECTION),
      where("userId", "==", userId),
      orderBy("date", "asc"),
      limitToLast(days),
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => toDailyUsage(d.id, d.data()));
  },

  listenToday(
    userId: string,
    onData: (data: DailyUsage | null) => void,
  ): () => void {
    const dateStr = toDateString(new Date());
    const ref = doc(db, COLLECTION, docId(userId, dateStr));
    return onSnapshot(ref, (snap) => {
      onData(snap.exists() ? toDailyUsage(snap.id, snap.data()) : null);
    });
  },

  listenHistory(
    userId: string,
    days: number,
    onData: (data: DailyUsage[]) => void,
  ): () => void {
    const q = query(
      collection(db, COLLECTION),
      where("userId", "==", userId),
      orderBy("date", "asc"),
      limitToLast(days),
    );
    return onSnapshot(q, (snap) => {
      onData(snap.docs.map((d) => toDailyUsage(d.id, d.data())));
    });
  },

  async accumulateDeviceUsage(
    userId: string,
    date: Date,
    deviceId: string,
    record: DeviceDailyRecord,
  ): Promise<void> {
    const dateStr = toDateString(date);
    const id = docId(userId, dateStr);
    const ref = doc(db, COLLECTION, id);
    const snap = await getDoc(ref);

    const existing: DailyUsage = snap.exists()
      ? toDailyUsage(id, snap.data())
      : {
          id,
          userId,
          date: dateStr,
          totalKwh: 0,
          totalEmissions: 0,
          totalCost: 0,
          devices: {},
        };

    const prevDevice = existing.devices[deviceId];
    const mergedDevice: DeviceDailyRecord = {
      name: record.name,
      watt: record.watt,
      durationMinutes:
        (prevDevice?.durationMinutes ?? 0) + record.durationMinutes,
      kwh: (prevDevice?.kwh ?? 0) + record.kwh,
    };

    const updatedDevices = { ...existing.devices, [deviceId]: mergedDevice };

    const totalKwh = Object.values(updatedDevices).reduce(
      (sum, d) => sum + d.kwh,
      0,
    );
    const totalEmissions = totalKwh * CARBON_CONFIG.emissionFactor;
    const totalCost = totalKwh * CARBON_CONFIG.electricityRate;

    await setDoc(ref, {
      userId,
      date: dateStr,
      totalKwh,
      totalEmissions,
      totalCost,
      devices: updatedDevices,
    });
  },
};
