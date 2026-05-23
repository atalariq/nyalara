import { useAuthStore } from "@/features/auth/store/authStore";
import { useEffect, useState } from "react";
import { dailyUsageService } from "../services/dailyUsageService";
import type { DailyUsage } from "../types/dailyUsage.types";

type EnergyHistoryState = {
  today: DailyUsage | null;
  history: DailyUsage[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
};

function sortHistoryByDateAscending(history: DailyUsage[]): DailyUsage[] {
  return [...history].sort((a, b) => a.date.localeCompare(b.date));
}

export function useEnergyHistory(): EnergyHistoryState {
  const user = useAuthStore((s) => s.user);
  const isAuthLoading = useAuthStore((s) => s.isLoading);
  const [today, setToday] = useState<DailyUsage | null>(null);
  const [history, setHistory] = useState<DailyUsage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [todayLoaded, setTodayLoaded] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);

  async function fetchData() {
    if (!user?.uid) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const [todayData, historyData] = await Promise.all([
        dailyUsageService.getByDate(user.uid, new Date()),
        dailyUsageService.getHistory(user.uid, 30),
      ]);
      setToday(todayData);
      setHistory(sortHistoryByDateAscending(historyData));
    } catch (e) {
      setError("Gagal memuat data energi");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (todayLoaded && historyLoaded) {
      setIsLoading(false);
    }
  }, [todayLoaded, historyLoaded]);

  useEffect(() => {
    if (isAuthLoading || !user?.uid) return;
    setError(null);
    setIsLoading(true);
    setTodayLoaded(false);
    setHistoryLoaded(false);

    const unsubscribeToday = dailyUsageService.listenToday(user.uid, (data) => {
      setToday(data);
      setTodayLoaded(true);
    });

    const unsubscribeHistory = dailyUsageService.listenHistory(
      user.uid,
      30,
      (data) => {
        setHistory(sortHistoryByDateAscending(data));
        setHistoryLoaded(true);
      },
    );

    return () => {
      unsubscribeToday();
      unsubscribeHistory();
    };
  }, [user?.uid, isAuthLoading]);

  return { today, history, isLoading, error, refetch: fetchData };
}
