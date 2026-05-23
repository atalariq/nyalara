export type DeviceDailyRecord = {
  name: string;
  watt: number;
  durationMinutes: number;
  kwh: number;
};

export type DailyUsage = {
  id: string; // {userId}_{YYYY-MM-DD}
  userId: string;
  date: string; // "2026-05-21"
  totalKwh: number;
  totalEmissions: number;
  totalCost: number;
  devices: Record<string, DeviceDailyRecord>;
};
