// features/devices/types/device.types.ts

export type DeviceCategory =
  | "electronics"
  | "appliances"
  | "lighting"
  | "other";

export type DeviceType = "ac" | "tv" | "washer" | "fridge" | "lights" | "other";

export const DEVICE_TYPE_TO_CATEGORY: Record<DeviceType, DeviceCategory> = {
  ac: "appliances",
  washer: "appliances",
  fridge: "appliances",
  tv: "electronics",
  lights: "lighting",
  other: "other",
};

export interface Device {
  id: string;
  userId: string;
  name: string;
  category: DeviceCategory;
  deviceType: DeviceType;
  watt: number;
  hoursPerDay: number;
  daysPerMonth: number;
  active: boolean;
  activatedAt?: number | null;
  monthlyKwh?: number;
  monthlyCost?: number;
  monthlyEmissions?: number;
  createdAt: number;
}

export interface CreateDevicePayload {
  name: string;
  category: DeviceCategory;
  deviceType: DeviceType;
  watt: number;
  hoursPerDay: number;
  daysPerMonth: number;
  active?: boolean;
  monthlyKwh?: number;
  monthlyCost?: number;
  monthlyEmissions?: number;
}

export interface CreateDevicePayload {
  name: string;
  category: DeviceCategory;
  deviceType: DeviceType;
  watt: number;
  hoursPerDay: number;
  daysPerMonth: number;
  monthlyKwh?: number;
  monthlyCost?: number;
  monthlyEmissions?: number;
}
