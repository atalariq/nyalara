import { Text, View } from "react-native";
import type { DailyUsage } from "../types/dailyUsage.types";

type Props = {
  history: DailyUsage[];
};

function getDayLabel(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", { weekday: "short" }).slice(0, 1);
}

function getWeekDates(reference: Date): string[] {
  const date = new Date(reference);
  const day = date.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  const monday = new Date(date);
  monday.setDate(date.getDate() + mondayOffset);

  return Array.from({ length: 7 }).map((_, index) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + index);
    return d.toISOString().split("T")[0];
  });
}

export function EnergyBarChart({ history }: Props) {
  const weekDates = getWeekDates(new Date());
  const todayStr = new Date().toISOString().split("T")[0];
  const historyByDate = new Map(
    history.map((item) => [item.date, item.totalKwh]),
  );

  const weekData = weekDates.map((date) => ({
    date,
    totalKwh: historyByDate.get(date) ?? 0,
  }));

  const maxKwh = Math.max(...weekData.map((d) => d.totalKwh), 0.1);

  return (
    <View className="mx-5 rounded-[30px] bg-white px-5 py-6 shadow-sm shadow-black/10">
      <View className="mb-6 flex-row items-center justify-between">
        <Text className="text-[18px] font-bold text-[#27C76F]">
          Weekly Usage Flow
        </Text>

        <Text className="text-[14px] font-medium text-[#6FCF97]">
          Mon — Sun
        </Text>
      </View>

      <View className="flex-row items-end justify-between h-44 mt-2 px-1">
        {weekData.map((day) => {
          const heightPercent = (day.totalKwh / maxKwh) * 100;
          const isToday = day.date === todayStr;

          const barHeight = day.totalKwh <= 0 ? 6 : Math.max(heightPercent, 18);

          return (
            <View
              key={day.date}
              className="items-center justify-end"
              style={{ width: 24 }}
            >
              <View
                className={`rounded-full ${
                  isToday ? "bg-[#27C76F]" : "bg-[#E3E3E3]"
                }`}
                style={{
                  width: 9,
                  height: `${barHeight}%`,
                }}
              />

              <Text
                className={`mt-2 text-[10px] ${
                  isToday ? "text-[#27C76F] font-bold" : "text-[#B5B5B5]"
                }`}
              >
                {getDayLabel(day.date)}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}
