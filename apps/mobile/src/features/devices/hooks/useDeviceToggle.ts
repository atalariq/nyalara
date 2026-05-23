import { useAuthStore } from "@/features/auth/store/authStore";
import { dailyUsageService } from "@/features/energy/services/dailyUsageService";
import { deviceService } from "../services/deviceService";
import type { Device } from "../types/device.types";

export function useDeviceToggle() {
  const user = useAuthStore((s) => s.user);

  async function flushDeviceUsage(
    device: Device,
    until: Date,
    userId: string,
  ): Promise<void> {
    if (!device.activatedAt) return;
    const durationMs = until.getTime() - device.activatedAt;
    const durationMinutes = durationMs / 1000 / 60;
    if (durationMinutes <= 0) return;
    const kwh = (device.watt * (durationMinutes / 60)) / 1000;
    await dailyUsageService.accumulateDeviceUsage(userId, until, device.id, {
      name: device.name,
      watt: device.watt,
      durationMinutes,
      kwh,
    });
  }

  async function toggleDevice(device: Device): Promise<void> {
    if (!user?.uid) return;
    const now = new Date();
    if (!device.active) {
      await deviceService.updateDevice(device.id, {
        active: true,
        activatedAt: now.getTime(),
      });
    } else {
      await flushDeviceUsage(device, now, user.uid);
      await deviceService.updateDevice(device.id, {
        active: false,
        activatedAt: null,
      });
    }
  }

  async function reconcileActiveDevices(devices: Device[]): Promise<void> {
    if (!user?.uid) return;
    const now = new Date();
    const activeDevices = devices.filter((d) => d.active && d.activatedAt);
    await Promise.all(
      activeDevices.map((d) => flushDeviceUsage(d, now, user.uid!)),
    );
    await Promise.all(
      activeDevices.map((d) =>
        deviceService.updateDevice(d.id, { activatedAt: now.getTime() }),
      ),
    );
  }

  return { toggleDevice, reconcileActiveDevices };
}
