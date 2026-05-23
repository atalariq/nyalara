import { useAuthStore } from "@/features/auth/store/authStore";
import { dailyUsageService } from "@/features/energy/services/dailyUsageService";
import { useEffect, useRef } from "react";
import { useDeviceStore } from "../store/deviceStore";

const FLUSH_INTERVAL_MS = 10_000;

export function useActiveDeviceTimer() {
  const user = useAuthStore((s) => s.user);
  const devices = useDeviceStore((s) => s.devices);
  const intervalsRef = useRef<Record<string, ReturnType<typeof setInterval>>>(
    {},
  );
  const lastFlushedAtRef = useRef<Record<string, number>>({});

  useEffect(() => {
    if (!user?.uid) return;

    const activeDevices = devices.filter((d) => d.active && d.activatedAt);
    const activeIds = new Set(activeDevices.map((d) => d.id));

    // Clear interval untuk device yang tidak active
    Object.keys(intervalsRef.current).forEach((id) => {
      if (!activeIds.has(id)) {
        clearInterval(intervalsRef.current[id]);
        delete intervalsRef.current[id];
        delete lastFlushedAtRef.current[id];
      }
    });

    activeDevices.forEach((device) => {
      if (intervalsRef.current[device.id]) return;

      const flushDevice = async () => {
        const now = Date.now();
        const lastFlushed =
          lastFlushedAtRef.current[device.id] ?? device.activatedAt!;
        const durationMs = now - lastFlushed;

        if (durationMs <= 0) return;

        const durationMinutes = durationMs / 1000 / 60;
        const kwh = (device.watt * (durationMinutes / 60)) / 1000;

        try {
          await dailyUsageService.accumulateDeviceUsage(
            user.uid!,
            new Date(),
            device.id,
            { name: device.name, watt: device.watt, durationMinutes, kwh },
          );
          lastFlushedAtRef.current[device.id] = now;
        } catch (error) {
          console.error("Failed to flush device usage", device.id, error);
        }
      };

      lastFlushedAtRef.current[device.id] = device.activatedAt!;
      intervalsRef.current[device.id] = setInterval(
        flushDevice,
        FLUSH_INTERVAL_MS,
      );
      flushDevice();
    });

    return () => {
      Object.values(intervalsRef.current).forEach(clearInterval);
      intervalsRef.current = {};
    };
  }, [devices, user?.uid]);
}
