"use client";

import { useState } from "react";
import type { Task, Category, FilterStatus, AppView } from "@/types";
import { toPersianDigits } from "@/lib/jalali";

interface Props {
  tasks: Task[];
  categories: Category[];
  filter: FilterStatus;
  setFilter: (f: FilterStatus) => void;
  selectedCategory: string;
  setSelectedCategory: (c: string) => void;
  onCreateTask: () => void;
  onCreateCategory: () => void;
  onDeleteCategory: (id: number) => Promise<boolean>;
  sidebarOpen: boolean;
  onCloseSidebar: () => void;
  currentView: AppView;
  onChangeView: (view: AppView) => void;
  memoriesCount: number;
  plansCount: number;
  lifeSections: { id: number; value: string; label: string; icon: string }[];
  onCreateSection: () => void;
  onDeleteSection: (id: number) => Promise<boolean>;
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      className={`w-3.5 h-3.5 transition-transform duration-300 ${open ? "rotate-90" : ""}`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2.5}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
    </svg>
  );
}

export default function Sidebar({
  tasks,
  categories,
  filter,
  setFilter,
  selectedCategory,
  setSelectedCategory,
  onCreateTask,
  onCreateCategory,
  onDeleteCategory,
  sidebarOpen,
  onCloseSidebar,
  currentView,
  onChangeView,
  memoriesCount,
  plansCount,
  lifeSections: lifeSectionsList,
  onCreateSection,
  onDeleteSection,
}: Props) {
  const [statusOpen, setStatusOpen] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [planningOpen, setPlanningOpen] = useState(false);

  const totalTasks = tasks.length;
  const activeTasks = tasks.filter((t) => !t.completed).length;
  const completedTasks = tasks.filter((t) => t.completed).length;
  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const getTaskCountForCategory = (catValue: string) =>
    tasks.filter((t) => t.category === catValue).length;

  const filterButtons: { key: FilterStatus; label: string; icon: string; count: number }[] = [
    { key: "all", label: "همه وظایف", icon: "📋", count: totalTasks },
    { key: "active", label: "فعال", icon: "🔵", count: activeTasks },
    { key: "completed", label: "تکمیل شده", icon: "✅", count: completedTasks },
  ];

  return (
    <>
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/30 z-40 lg:hidden" onClick={onCloseSidebar} />
      )}

      <aside
        className={`fixed top-0 right-0 h-full w-72 bg-white/80 backdrop-blur-xl border-l border-slate-200/50 z-50 transition-transform duration-300 lg:relative lg:translate-x-0 lg:z-0 flex flex-col ${
          sidebarOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center shadow-lg shadow-primary/25">
              <span className="text-white text-lg">✓</span>
            </div>
            <div>
              <h1 className="font-extrabold text-lg text-slate-800">لایف استایل</h1>
              <p className="text-[10px] text-slate-400">مدیریت وظایف حرفه‌ای</p>
            </div>
          </div>
        </div>

        {/* Create button */}
        <div className="px-5 py-4">
          <button
            onClick={() => {
              if (currentView === "tasks") {
                onCreateTask();
              } else {
                // For other views, switch to that view (each view has its own create button)
                onChangeView(currentView);
              }
            }}
            className={`w-full py-3 text-white rounded-xl font-medium text-sm hover:opacity-90 transition-opacity shadow-lg flex items-center justify-center gap-2 cursor-pointer ${
              currentView === "memories"
                ? "bg-gradient-to-l from-pink-500 to-rose-500 shadow-pink-500/25"
                : currentView === "planning"
                ? "bg-gradient-to-l from-teal-500 to-emerald-500 shadow-teal-500/25"
                : currentView.startsWith("section-")
                ? "bg-gradient-to-l from-slate-500 to-slate-600 shadow-slate-500/25"
                : "bg-gradient-to-l from-primary to-secondary shadow-primary/25"
            }`}
          >
            <span className="text-lg">+</span>
            {currentView === "tasks" ? "وظیفه جدید" : "ایجاد مورد جدید"}
          </button>
        </div>

        {/* Stats */}
        <div className="px-5 pb-4">
          <div className="bg-gradient-to-l from-indigo-50 to-purple-50 rounded-2xl p-4 border border-indigo-100/50">
            <div className="grid grid-cols-3 gap-2 mb-3">
              <div className="text-center">
                <p className="text-lg font-extrabold text-primary">{toPersianDigits(String(totalTasks))}</p>
                <p className="text-[9px] text-slate-500">کل</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-extrabold text-blue-600">{toPersianDigits(String(activeTasks))}</p>
                <p className="text-[9px] text-slate-500">فعال</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-extrabold text-emerald-600">{toPersianDigits(String(completedTasks))}</p>
                <p className="text-[9px] text-slate-500">تکمیل</p>
              </div>
            </div>
            <div className="relative">
              <div className="h-2 bg-white rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-l from-primary to-secondary rounded-full progress-bar"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-[10px] text-slate-500 mt-1 text-center">
                {toPersianDigits(String(progress))}٪ پیشرفت
              </p>
            </div>
          </div>
        </div>

        {/* Scrollable menu area */}
        <div className="flex-1 overflow-y-auto px-5 pb-5 space-y-2">

          {/* ─── وضعیت ─── */}
          <div>
            <button
              onClick={() => setStatusOpen(!statusOpen)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <span className="text-base">📊</span>
                <span>وضعیت</span>
              </div>
              <ChevronIcon open={statusOpen} />
            </button>

            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${statusOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"}`}>
              <div className="pr-3 mr-3 border-r-2 border-slate-200 mt-1 space-y-0.5">
                {filterButtons.map((fb) => (
                  <button
                    key={fb.key}
                    onClick={() => { setFilter(fb.key); onChangeView("tasks"); }}
                    className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-[13px] transition-all cursor-pointer ${
                      currentView === "tasks" && filter === fb.key
                        ? "bg-primary/10 text-primary font-bold"
                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xs">{fb.icon}</span>
                      <span>{fb.label}</span>
                    </div>
                    <span className={`text-[10px] min-w-[22px] text-center px-1.5 py-0.5 rounded-md ${
                      currentView === "tasks" && filter === fb.key ? "bg-primary/15 text-primary font-bold" : "bg-slate-100 text-slate-400"
                    }`}>
                      {toPersianDigits(String(fb.count))}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ─── لیست امور ─── */}
          <div>
            <button
              onClick={() => setCategoryOpen(!categoryOpen)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <span className="text-base">📂</span>
                <span>لیست امور</span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={(e) => { e.stopPropagation(); onCreateCategory(); }}
                  className="w-6 h-6 flex items-center justify-center rounded-lg bg-purple-100 text-purple-600 hover:bg-purple-200 transition-colors cursor-pointer text-xs font-bold"
                  title="افزودن به لیست امور"
                >
                  +
                </button>
                <ChevronIcon open={categoryOpen} />
              </div>
            </button>

            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${categoryOpen ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"}`}>
              <div className="pr-3 mr-3 border-r-2 border-purple-200 mt-1 space-y-0.5">
                <button
                  onClick={() => { setSelectedCategory(""); onChangeView("tasks"); }}
                  className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-[13px] transition-all cursor-pointer ${
                    currentView === "tasks" && selectedCategory === ""
                      ? "bg-primary/10 text-primary font-bold"
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs">📁</span>
                    <span>همه امور</span>
                  </div>
                  <span className={`text-[10px] min-w-[22px] text-center px-1.5 py-0.5 rounded-md ${
                    currentView === "tasks" && selectedCategory === "" ? "bg-primary/15 text-primary font-bold" : "bg-slate-100 text-slate-400"
                  }`}>
                    {toPersianDigits(String(totalTasks))}
                  </span>
                </button>

                {categories.map((cat) => {
                  const count = getTaskCountForCategory(cat.value);
                  return (
                    <div key={cat.id} className="group/cat flex items-center">
                      <button
                        onClick={() => { setSelectedCategory(cat.value); onChangeView("tasks"); }}
                        className={`flex-1 flex items-center justify-between px-3 py-1.5 rounded-lg text-[13px] transition-all cursor-pointer ${
                          currentView === "tasks" && selectedCategory === cat.value
                            ? "bg-primary/10 text-primary font-bold"
                            : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-xs">{cat.icon}</span>
                          <span>{cat.label}</span>
                        </div>
                        <span className={`text-[10px] min-w-[22px] text-center px-1.5 py-0.5 rounded-md ${
                          currentView === "tasks" && selectedCategory === cat.value ? "bg-primary/15 text-primary font-bold" : "bg-slate-100 text-slate-400"
                        }`}>
                          {toPersianDigits(String(count))}
                        </span>
                      </button>
                      <button
                        onClick={() => onDeleteCategory(cat.id)}
                        className="w-5 h-5 flex items-center justify-center text-[10px] text-slate-300 hover:text-red-500 opacity-0 group-hover/cat:opacity-100 transition-all cursor-pointer mr-0.5"
                      >
                        ✕
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ─── خاطرات ─── */}
          <div>
            <button
              onClick={() => onChangeView("memories")}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                currentView === "memories"
                  ? "bg-pink-100 text-pink-700"
                  : "text-slate-700 hover:bg-slate-50"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-base">📖</span>
                <span>خاطرات</span>
              </div>
              <span className={`text-[10px] min-w-[22px] text-center px-1.5 py-0.5 rounded-md ${
                currentView === "memories" ? "bg-pink-200 text-pink-700 font-bold" : "bg-slate-100 text-slate-400"
              }`}>
                {toPersianDigits(String(memoriesCount))}
              </span>
            </button>
          </div>

          {/* ─── برنامه‌ریزی (سرمنو با زیرمنو بخش‌ها) ─── */}
          <div>
            <button
              onClick={() => setPlanningOpen(!planningOpen)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <span className="text-base">🗓️</span>
                <span>برنامه‌ریزی</span>
              </div>
              <ChevronIcon open={planningOpen} />
            </button>

            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${planningOpen ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"}`}>
              <div className="pr-3 mr-3 border-r-2 border-teal-200 mt-1 space-y-0.5">
                {/* زمان‌بندی */}
                <button
                  onClick={() => onChangeView("planning")}
                  className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-[13px] transition-all cursor-pointer ${
                    currentView === "planning"
                      ? "bg-teal-100 text-teal-700 font-bold"
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs">⏰</span>
                    <span>زمان‌بندی</span>
                  </div>
                  <span className={`text-[10px] min-w-[22px] text-center px-1.5 py-0.5 rounded-md ${
                    currentView === "planning" ? "bg-teal-200 text-teal-700 font-bold" : "bg-slate-100 text-slate-400"
                  }`}>
                    {toPersianDigits(String(plansCount))}
                  </span>
                </button>

                {/* بخش‌های زندگی */}
                {lifeSectionsList.map((sec) => {
                  const viewKey = `section-${sec.value}` as const;
                  const isActive = currentView === viewKey;
                  return (
                    <div key={sec.id} className="group/sec flex items-center">
                      <button
                        onClick={() => onChangeView(viewKey)}
                        className={`flex-1 flex items-center justify-between px-3 py-1.5 rounded-lg text-[13px] transition-all cursor-pointer ${
                          isActive ? "bg-slate-200 text-slate-800 font-bold" : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-xs">{sec.icon}</span>
                          <span>{sec.label}</span>
                        </div>
                      </button>
                      <button
                        onClick={() => onDeleteSection(sec.id)}
                        className="w-5 h-5 flex items-center justify-center text-[10px] text-slate-300 hover:text-red-500 opacity-0 group-hover/sec:opacity-100 transition-all cursor-pointer mr-0.5"
                      >✕</button>
                    </div>
                  );
                })}

                {/* دکمه افزودن بخش جدید */}
                <button
                  onClick={onCreateSection}
                  className="w-full flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg text-[13px] font-medium text-slate-400 hover:text-teal-600 hover:bg-teal-50 border border-dashed border-slate-200 hover:border-teal-400 transition-all cursor-pointer mt-1"
                >
                  <span>+</span>
                  <span>افزودن بخش جدید</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
