import { useMemo, useState } from "react";
import { deviceService } from "../services/deviceService";
import { useDeviceStore } from "../store/deviceStore";
import { useTogglingStore } from "../store/togglingStore";
import type { Device } from "../types/device.types";
import { useDevices } from "./useDevices";
import { useDeviceToggle } from "./useDeviceToggle";

export type DeviceListItem = {
  id: string;
  name: string;
  category: string;
  watt: number;
  usageLabel: string;
  active: boolean;
  activatedAt?: number | null;
};

export type DeviceFilter = "all" | "active";

function toUsageLabel(device: Device): string {
  if (device.monthlyKwh != null)
    return `${device.monthlyKwh.toFixed(1)} kWh/mo`;
  return `${device.hoursPerDay.toFixed(1)}h/day`;
}

export function useDeviceList() {
  const { devices } = useDevices();
  const setDevices = useDeviceStore((s) => s.setDevices);
  const { toggleDevice } = useDeviceToggle();
  const { setToggling } = useTogglingStore();
  const [filter, setFilter] = useState<DeviceFilter>("all");

  const allItems = useMemo<DeviceListItem[]>(
    () =>
      devices.map((device) => ({
        id: device.id,
        name: device.name,
        category: device.category,
        watt: device.watt,
        usageLabel: toUsageLabel(device),
        active: device.active,
        activatedAt: device.activatedAt,
      })),
    [devices],
  );

  const filteredItems = useMemo(
    () => (filter === "active" ? allItems.filter((d) => d.active) : allItems),
    [filter, allItems],
  );

  const activeCount = allItems.filter((d) => d.active).length;

  const highestConsumer = allItems.length
    ? allItems.reduce((best, d) => (d.watt > best.watt ? d : best))
    : null;

  const mostActive = allItems.length
    ? allItems.reduce((best, d) =>
        d.usageLabel.localeCompare(best.usageLabel) > 0 ? d : best,
      )
    : null;

  async function toggleActive(id: string) {
    const device = devices.find((item) => item.id === id);
    if (!device) return;
    const now = new Date();
    try {
      if (!device.active) {
        await deviceService.updateDevice(id, {
          active: true,
          activatedAt: now.getTime(),
        });
        setDevices(
          devices.map((item) =>
            item.id === id
              ? { ...item, active: true, activatedAt: now.getTime() }
              : item,
          ),
        );
      } else {
        setToggling(id, true);
        await toggleDevice(device);
        setToggling(id, false);
      }
    } catch (error) {
      console.error("Failed to update device state:", error);
      setToggling(id, false);
    }
  }

  return {
    allItems,
    filteredItems,
    filter,
    setFilter,
    activeCount,
    highestConsumer,
    mostActive,
    toggleActive,
  };
}
