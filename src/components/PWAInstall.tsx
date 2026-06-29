"use client";

import { useEffect, useState } from "react";

declare global {
  interface Window {
    __pwaPrompt: {
      prompt(): Promise<void>;
      userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
    } | null;
  }
}

export default function PWAInstall() {
  const [ready, setReady] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as unknown as Record<string, boolean>).standalone === true;

    if (standalone) {
      setIsStandalone(true);
      return;
    }

    // Also listen in case event fires after React mount
    const handler = (e: Event) => {
      e.preventDefault();
      window.__pwaPrompt = e as unknown as Window["__pwaPrompt"];
      setReady(true);
    };
    window.addEventListener("beforeinstallprompt", handler);

    // Check if already captured
    const poll = setInterval(() => {
      if (window.__pwaPrompt) {
        setReady(true);
        clearInterval(poll);
      }
    }, 500);

    const timeout = setTimeout(() => clearInterval(poll), 60000);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      clearInterval(poll);
      clearTimeout(timeout);
    };
  }, []);

  const handleInstall = async () => {
    if (!window.__pwaPrompt) return;
    try {
      await window.__pwaPrompt.prompt();
      const { outcome } = await window.__pwaPrompt.userChoice;
      if (outcome === "accepted") {
        setReady(false);
        setIsStandalone(true);
      }
      window.__pwaPrompt = null;
    } catch {
      // ignore
    }
  };

  if (isStandalone || !ready) return null;

  return (
    <div className="fixed bottom-16 lg:bottom-4 left-0 right-0 z-50 px-3 animate-slide-up">
      <div className="max-w-md mx-auto">
        <button
          onClick={handleInstall}
          className="w-full flex items-center justify-center gap-3 bg-gradient-to-l from-primary to-secondary rounded-2xl shadow-2xl shadow-primary/30 p-3.5 cursor-pointer hover:opacity-95 active:scale-[0.98] transition-all"
        >
          <img src="/icons/icon-192.png" alt="" className="w-8 h-8 rounded-lg" />
          <span className="text-white font-bold text-sm">📲 نصب لایف استایل</span>
        </button>
      </div>
    </div>
  );
}
