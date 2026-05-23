import { useDeviceStore } from "@/features/devices/store/deviceStore";
import { useTogglingStore } from "@/features/devices/store/togglingStore";
import { Plug, Zap } from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import { Text, View } from "react-native";
import type { DailyUsage, DeviceDailyRecord } from "../types/dailyUsage.types";

type Props = {
  today: DailyUsage | null;
};

export function ActiveDevicesList({ today }: Props) {
  const devices = useDeviceStore((s) => s.devices);
  const togglingIds = useTogglingStore((s) => s.togglingIds);
  const [now, setNow] = useState(Date.now());
  const frozenMinutesRef = useRef<Record<string, number>>({});
  const activeSessionBaseMinutesRef = useRef<Record<string, number>>({});
  const activeSessionBaseKwhRef = useRef<Record<string, number>>({});
  const activeSessionActivatedAtRef = useRef<Record<string, number>>({});

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const firestoreEntries = today ? Object.entries(today.devices) : [];
  const firestoreIds = new Set(firestoreEntries.map(([id]) => id));

  const liveOnlyDevices = devices.filter(
    (d) => d.active && d.activatedAt && !firestoreIds.has(d.id),
  );

  useEffect(() => {
    const activeIds = new Set(
      devices.filter((d) => d.active && d.activatedAt).map((d) => d.id),
    );

    Object.keys(activeSessionActivatedAtRef.current).forEach((id) => {
      if (!activeIds.has(id)) {
        delete activeSessionActivatedAtRef.current[id];
        delete activeSessionBaseMinutesRef.current[id];
        delete activeSessionBaseKwhRef.current[id];
      }
    });
  }, [devices]);

  const allEntries: [string, DeviceDailyRecord | null][] = [
    ...firestoreEntries,
    ...liveOnlyDevices.map((d) => [d.id, null] as [string, null]),
  ];

  if (allEntries.length === 0) {
    return (
      <View className="mx-4 rounded-3xl bg-white p-5 shadow-sm shadow-black/5">
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-sm font-bold text-[#0E0E0E]">
            Today's Devices
          </Text>
          <View className="flex-row items-center gap-1">
            <Zap size={12} color="#25CE7F" />
            <Text className="text-xs text-brand font-semibold">0 tracked</Text>
          </View>
        </View>
        <View className="items-center py-4">
          <Text className="text-sm text-[#AAA]">
            No device usage recorded today
          </Text>
          <Text className="text-xs text-[#CCC] mt-1">
            Toggle a device ON to start tracking
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View className="mx-4 rounded-3xl bg-white p-5 shadow-sm shadow-black/5">
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-sm font-bold text-[#0E0E0E]">
          Today's Devices
        </Text>
        <View className="flex-row items-center gap-1">
          <Zap size={12} color="#25CE7F" />
          <Text className="text-xs text-brand font-semibold">
            {allEntries.length} tracked
          </Text>
        </View>
      </View>

      <View className="gap-3">
        {allEntries.map(([deviceId, record]) => {
          const isToggling = togglingIds.has(deviceId);
          const liveDevice = !isToggling
            ? devices.find(
                (d) => d.id === deviceId && d.active && d.activatedAt,
              )
            : undefined;

          const watt = record?.watt ?? liveDevice?.watt ?? 0;
          const name = record?.name ?? liveDevice?.name ?? deviceId;
          const activationAt = liveDevice?.activatedAt ?? now;

          if (liveDevice) {
            const previousActivation =
              activeSessionActivatedAtRef.current[deviceId];

            if (previousActivation !== activationAt) {
              activeSessionActivatedAtRef.current[deviceId] = activationAt;
              activeSessionBaseMinutesRef.current[deviceId] =
                record?.durationMinutes ?? 0;
              activeSessionBaseKwhRef.current[deviceId] = record?.kwh ?? 0;
            }
          }

          const baseMinutes = liveDevice
            ? (activeSessionBaseMinutesRef.current[deviceId] ??
              record?.durationMinutes ??
              0)
            : (record?.durationMinutes ?? 0);
          const baseKwh = liveDevice
            ? (activeSessionBaseKwhRef.current[deviceId] ?? record?.kwh ?? 0)
            : (record?.kwh ?? 0);
          const elapsedMinutes = liveDevice
            ? Math.max((now - activationAt) / 1000 / 60, 0)
            : 0;
          const currentMinutes = baseMinutes + elapsedMinutes;

          // Freeze nilai saat toggle OFF dimulai
          if (isToggling && frozenMinutesRef.current[deviceId] === undefined) {
            frozenMinutesRef.current[deviceId] = currentMinutes;
          }
          // Clear freeze saat onSnapshot sudah update dengan nilai baru
          if (!isToggling && frozenMinutesRef.current[deviceId] !== undefined) {
            delete frozenMinutesRef.current[deviceId];
          }

          const totalMinutes = isToggling
            ? (frozenMinutesRef.current[deviceId] ?? currentMinutes)
            : currentMinutes;

          const unflushedKwh = liveDevice
            ? (watt * (elapsedMinutes / 60)) / 1000
            : 0;
          const totalKwh = liveDevice
            ? baseKwh + unflushedKwh
            : record?.kwh != null
              ? record.kwh
              : (watt * (totalMinutes / 60)) / 1000;

          const displayMinutes = Math.floor(totalMinutes);
          const hours = Math.floor(displayMinutes / 60);
          const mins = displayMinutes % 60;
          const durationLabel = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

          return (
            <View
              key={deviceId}
              className="flex-row items-center justify-between"
            >
              <View className="flex-row items-center gap-3">
                <View
                  className={`h-9 w-9 rounded-2xl items-center justify-center ${
                    liveDevice ? "bg-[#E8FFF4]" : "bg-[#F5F5F5]"
                  }`}
                >
                  <Plug size={16} color={liveDevice ? "#25CE7F" : "#AAA"} />
                </View>
                <View>
                  <View className="flex-row items-center gap-2">
                    <Text className="text-sm font-semibold text-[#0E0E0E]">
                      {name}
                    </Text>
                    {liveDevice && (
                      <View className="rounded-full bg-[#E8FFF4] px-1.5 py-0.5">
                        <Text className="text-[10px] font-semibold text-brand">
                          Active
                        </Text>
                      </View>
                    )}
                    {isToggling && (
                      <View className="rounded-full bg-[#F5F5F5] px-1.5 py-0.5">
                        <Text className="text-[10px] text-[#AAA]">
                          saving...
                        </Text>
                      </View>
                    )}
                  </View>
                  <Text className="text-xs text-[#888]">
                    {watt}W · {durationLabel}
                  </Text>
                </View>
              </View>
              <Text className="text-sm font-bold text-brand">
                {totalKwh.toFixed(4)} kWh
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}
