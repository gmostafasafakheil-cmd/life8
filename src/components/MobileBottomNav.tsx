"use client";

import type { AppView } from "@/types";

interface Props {
  currentView: AppView;
  onChangeView: (view: AppView) => void;
  onOpenSidebar: () => void;
}

export default function MobileBottomNav({ currentView, onChangeView, onOpenSidebar }: Props) {
  const tabs: { key: AppView | "menu"; label: string; icon: string }[] = [
    { key: "tasks", label: "وظایف", icon: "📋" },
    { key: "planning", label: "برنامه‌ریزی", icon: "🗓️" },
    { key: "memories", label: "خاطرات", icon: "📖" },
    { key: "menu", label: "منو", icon: "☰" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-xl border-t border-slate-200/80 lg:hidden safe-bottom">
      <div className="flex items-center justify-around px-2 py-1">
        {tabs.map((tab) => {
          const isActive = tab.key === "menu" ? false : currentView === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => {
                if (tab.key === "menu") {
                  onOpenSidebar();
                } else {
                  onChangeView(tab.key);
                }
              }}
              className={`flex flex-col items-center gap-0.5 py-2 px-3 rounded-xl transition-all cursor-pointer min-w-[60px] ${
                isActive
                  ? "text-primary"
                  : "text-slate-400"
              }`}
            >
              <span className={`text-xl transition-transform ${isActive ? "scale-110" : ""}`}>{tab.icon}</span>
              <span className={`text-[10px] font-medium ${isActive ? "font-bold" : ""}`}>{tab.label}</span>
              {isActive && <span className="w-1 h-1 rounded-full bg-primary" />}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
