import { useEffect, useState } from "react";

const MIN_WORK_MS = 4 * 60 * 60 * 1000; // 4 hours

export default function useCheckoutTimer(todayAttendance) {
  const [remainingMs, setRemainingMs] = useState(0);
  const [canCheckout, setCanCheckout] = useState(false);

  useEffect(() => {
    if (!todayAttendance || todayAttendance.checkOut) {
      setCanCheckout(false);
      return;
    }

    const interval = setInterval(() => {
      const workedMs =
        new Date().getTime() - new Date(todayAttendance.checkIn).getTime();

      const remaining = MIN_WORK_MS - workedMs;

      if (remaining <= 0) {
        setCanCheckout(true);
        setRemainingMs(0);
        clearInterval(interval);
      } else {
        setRemainingMs(remaining);
        setCanCheckout(false);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [todayAttendance]);

  const formatRemaining = () => {
    const totalSeconds = Math.ceil(remainingMs / 1000);
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${h}h ${m}m ${s}s`;
  };

  return {
    canCheckout,
    remainingMs,
    formattedRemaining: formatRemaining(),
  };
}
