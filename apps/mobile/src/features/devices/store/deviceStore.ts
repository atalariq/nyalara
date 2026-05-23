// features/devices/store/deviceStore.ts
import { create } from "zustand";
import type { Device } from "../types/device.types";

interface DeviceState {
  devices: Device[];
  isLoading: boolean;
  setDevices: (devices: Device[]) => void;
  addDevice: (device: Device) => void;
  removeDevice: (id: string) => void;
  clearDevices: () => void; // ← tambah
}

export const useDeviceStore = create<DeviceState>((set) => ({
  devices: [],
  isLoading: false,
  setDevices: (devices) => set({ devices }),
  addDevice: (device) =>
    set((state) => ({ devices: [...state.devices, device] })),
  removeDevice: (id) =>
    set((state) => ({ devices: state.devices.filter((d) => d.id !== id) })),
  clearDevices: () => set({ devices: [] }), // ← tambah
}));
