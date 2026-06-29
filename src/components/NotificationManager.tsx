"use client";

import { useEffect, useState } from "react";
import type { Task } from "@/types";
import {
  requestNotificationPermission,
  canNotify,
  notifyOverdueTasks,
  notifyTodayTasks,
  scheduleDailyReminder,
} from "@/lib/notifications";
import { toJalaali, jalaaliDateString } from "@/lib/jalali";

interface Props {
  tasks: Task[];
}

export default function NotificationManager({ tasks }: Props) {
  const [permissionAsked, setPermissionAsked] = useState(false);
  const [showPermissionBanner, setShowPermissionBanner] = useState(false);

  useEffect(() => {
    if (!("Notification" in window)) return;

    // If already granted, set up notifications
    if (Notification.permission === "granted") {
      setPermissionAsked(true);
      return;
    }

    // If not asked yet, show banner after 5 seconds
    if (Notification.permission === "default") {
      const dismissed = localStorage.getItem("notif-banner-dismissed");
      if (!dismissed) {
        const timer = setTimeout(() => setShowPermissionBanner(true), 5000);
        return () => clearTimeout(timer);
      }
    }
  }, []);

  // When permission granted, send notifications
  useEffect(() => {
    if (!canNotify() || tasks.length === 0) return;

    const todayJ = toJalaali(new Date());
    const todayStr = jalaaliDateString(todayJ.jy, todayJ.jm, todayJ.jd);

    // Overdue tasks
    const overdue = tasks.filter(
      (t) => !t.completed && t.dueDate?.trim() && t.dueDate < todayStr
    );
    notifyOverdueTasks(overdue.length);

    // Today's tasks
    const todayTasks = tasks.filter(
      (t) => !t.completed && t.dueDate === todayStr
    );
    notifyTodayTasks(todayTasks.length);

    // Schedule daily reminder
    const intervalId = scheduleDailyReminder();

    return () => clearInterval(intervalId);
  }, [tasks, permissionAsked]);

  const handleAllow = async () => {
    const granted = await requestNotificationPermission();
    setPermissionAsked(true);
    setShowPermissionBanner(false);
    if (granted) {
      // Immediately send if there are tasks
      const todayJ = toJalaali(new Date());
      const todayStr = jalaaliDateString(todayJ.jy, todayJ.jm, todayJ.jd);
      const overdue = tasks.filter(
        (t) => !t.completed && t.dueDate?.trim() && t.dueDate < todayStr
      );
      if (overdue.length > 0) {
        notifyOverdueTasks(overdue.length);
      }
    }
  };

  const handleDismiss = () => {
    setShowPermissionBanner(false);
    localStorage.setItem("notif-banner-dismissed", "1");
  };

  if (!showPermissionBanner) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[55] px-3 pt-3 animate-slide-up">
      <div className="max-w-md mx-auto bg-amber-500 rounded-2xl shadow-xl shadow-amber-500/30 p-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <span className="text-xl">🔔</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-bold text-xs">اعلان‌ها رو فعال کنید</p>
            <p className="text-white/80 text-[10px] mt-0.5">یادآوری وظایف و کارهای عقب‌افتاده</p>
          </div>
          <button
            onClick={handleAllow}
            className="px-3 py-1.5 bg-white text-amber-600 rounded-lg text-xs font-bold hover:bg-white/90 cursor-pointer flex-shrink-0"
          >
            فعال
          </button>
          <button
            onClick={handleDismiss}
            className="w-6 h-6 flex items-center justify-center text-white/50 hover:text-white cursor-pointer text-xs flex-shrink-0"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}
