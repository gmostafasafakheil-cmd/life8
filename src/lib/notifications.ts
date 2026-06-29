"use client";

// Request notification permission
export async function requestNotificationPermission(): Promise<boolean> {
  if (!("Notification" in window)) return false;
  
  if (Notification.permission === "granted") return true;
  
  if (Notification.permission === "denied") return false;
  
  const result = await Notification.requestPermission();
  return result === "granted";
}

// Check if notifications are supported and permitted
export function canNotify(): boolean {
  return "Notification" in window && Notification.permission === "granted";
}

// Send a local notification
export function sendNotification(title: string, body: string, tag?: string) {
  if (!canNotify()) return;

  const options: NotificationOptions = {
    body,
    icon: "/icons/icon-192.png",
    badge: "/icons/icon-192.png",
    dir: "rtl",
    lang: "fa",
    tag: tag || `lifestyle-${Date.now()}`,
    silent: false,
  };

  // Try service worker notification first (works in background)
  if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.ready.then((reg) => {
      reg.showNotification(title, options).catch(() => {
        // Fallback to regular notification
        new Notification(title, options);
      });
    });
  } else {
    new Notification(title, options);
  }
}

// Send overdue tasks notification
export function notifyOverdueTasks(count: number) {
  if (count === 0) return;
  
  const lastNotified = localStorage.getItem("overdue-notified-date");
  const today = new Date().toDateString();
  
  // Only notify once per day
  if (lastNotified === today) return;
  
  sendNotification(
    "⏰ وظایف عقب‌افتاده",
    count === 1
      ? "یک وظیفه انجام‌نشده از روزهای قبل دارید"
      : `${count} وظیفه انجام‌نشده از روزهای قبل دارید — تعیین تکلیف کنید`,
    "overdue-tasks"
  );
  
  localStorage.setItem("overdue-notified-date", today);
}

// Send today's tasks reminder
export function notifyTodayTasks(count: number) {
  if (count === 0) return;
  
  const lastNotified = localStorage.getItem("today-notified-date");
  const today = new Date().toDateString();
  
  if (lastNotified === today) return;
  
  sendNotification(
    "📋 وظایف امروز",
    count === 1
      ? "یک وظیفه برای امروز دارید"
      : `${count} وظیفه برای امروز دارید`,
    "today-tasks"
  );
  
  localStorage.setItem("today-notified-date", today);
}

// Schedule daily reminder check
export function scheduleDailyReminder() {
  // Check every 30 minutes
  const intervalId = setInterval(() => {
    const now = new Date();
    const hours = now.getHours();
    
    // Notify between 7-9 AM
    if (hours >= 7 && hours <= 9) {
      const alreadyReminded = localStorage.getItem("morning-reminded");
      const today = now.toDateString();
      
      if (alreadyReminded !== today) {
        sendNotification(
          "🌅 صبح بخیر!",
          "وظایف امروز رو بررسی کنید",
          "morning-reminder"
        );
        localStorage.setItem("morning-reminded", today);
      }
    }
  }, 30 * 60 * 1000); // هر ۳۰ دقیقه

  return intervalId;
}
