import { useAuthStore } from "@/features/auth/store/authStore";
import { useEffect, useRef } from "react";
import { deviceService } from "../services/deviceService";
import { useDeviceStore } from "../store/deviceStore";
import { useDeviceToggle } from "./useDeviceToggle";

export const useDevices = () => {
  const user = useAuthStore((s) => s.user);
  const setDevices = useDeviceStore((s) => s.setDevices);
  const devices = useDeviceStore((s) => s.devices);
  const { reconcileActiveDevices } = useDeviceToggle();
  const hasReconciled = useRef(false);

  useEffect(() => {
    if (!user?.uid) return;

    const unsub = deviceService.listenUserDevices(user.uid, (result) => {
      setDevices(result);

      if (!hasReconciled.current && result.length > 0) {
        hasReconciled.current = true;
        reconcileActiveDevices(result);
      }
    });

    return () => unsub();
  }, [user?.uid]);

  return { devices };
};
