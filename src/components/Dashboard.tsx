"use client";

import { useState, useMemo } from "react";
import { useTasks } from "@/hooks/useTasks";
import { useCategories } from "@/hooks/useCategories";
import { useMemories } from "@/hooks/useMemories";
import { usePlans } from "@/hooks/usePlans";
import { useSections } from "@/hooks/useSections";
import type { Task, TaskFormData, FilterStatus, Category, AppView } from "@/types";
import Sidebar from "@/components/Sidebar";
import TaskModal from "@/components/TaskModal";
import TaskDetailModal from "@/components/TaskDetailModal";
import DeleteConfirmModal from "@/components/DeleteConfirmModal";
import CategoryModal from "@/components/CategoryModal";
import TransferModal from "@/components/TransferModal";
import JalaliDatePicker from "@/components/JalaliDatePicker";
import MemoriesView from "@/components/MemoriesView";
import PlanningView from "@/components/PlanningView";
import SectionView from "@/components/SectionView";
import SectionModal from "@/components/SectionModal";
import MobileBottomNav from "@/components/MobileBottomNav";
import NotificationManager from "@/components/NotificationManager";
import {
  toPersianDigits,
  formatJalaaliPersian,
  getPersianWeekDayName,
  persianMonths,
  toJalaali,
  jalaaliDateString,
  parseJalaaliString,
} from "@/lib/jalali";

const categoryColors: Record<string, { bg: string; text: string; border: string }> = {
  work: { bg: "bg-blue-100", text: "text-blue-700", border: "border-blue-200" },
  personal: { bg: "bg-purple-100", text: "text-purple-700", border: "border-purple-200" },
  study: { bg: "bg-amber-100", text: "text-amber-700", border: "border-amber-200" },
  health: { bg: "bg-emerald-100", text: "text-emerald-700", border: "border-emerald-200" },
  shopping: { bg: "bg-pink-100", text: "text-pink-700", border: "border-pink-200" },
  finance: { bg: "bg-teal-100", text: "text-teal-700", border: "border-teal-200" },
};

const defaultColor = { bg: "bg-indigo-100", text: "text-indigo-700", border: "border-indigo-200" };

function getCategoryColor(value: string) {
  return categoryColors[value] || defaultColor;
}

export default function Dashboard() {
  const {
    tasks,
    loading: tasksLoading,
    createTask,
    updateTask,
    deleteTask,
    toggleComplete,
  } = useTasks();
  const { categories, createCategory, deleteCategory } = useCategories();
  const { memories } = useMemories();
  const { plans } = usePlans();
  const { sections: lifeSections, createSection, deleteSection } = useSections();

  const [currentView, setCurrentView] = useState<AppView>("tasks");
  const [showSectionModal, setShowSectionModal] = useState(false);
  const [filter, setFilter] = useState<FilterStatus>("all");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const todayJalaali = toJalaali(new Date());
  const todayDateStr = jalaaliDateString(todayJalaali.jy, todayJalaali.jm, todayJalaali.jd);
  const [selectedDate, setSelectedDate] = useState(todayDateStr);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showFullReport, setShowFullReport] = useState(false);
  const [expandedDates, setExpandedDates] = useState<Set<string>>(new Set());

  const toggleDateExpand = (date: string) => {
    setExpandedDates((prev) => {
      const next = new Set(prev);
      if (next.has(date)) {
        next.delete(date);
      } else {
        next.add(date);
      }
      return next;
    });
  };

  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [detailTask, setDetailTask] = useState<Task | null>(null);
  const [transferringTask, setTransferringTask] = useState<Task | null>(null);
  const [deletingTaskId, setDeletingTaskId] = useState<number | null>(null);

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const selectedCategoryObj: Category | undefined = useMemo(() => {
    return categories.find((c) => c.value === selectedCategory);
  }, [categories, selectedCategory]);

  const applyCommonFilters = (source: Task[]) => {
    let result = [...source];
    if (filter === "active") result = result.filter((t) => !t.completed);
    if (filter === "completed") result = result.filter((t) => t.completed);
    if (selectedCategory) result = result.filter((t) => t.category === selectedCategory);
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          (t.description && t.description.toLowerCase().includes(q))
      );
    }
    return result;
  };

  // Tasks for selected date with filters applied
  const dailyTasks = useMemo(() => {
    return applyCommonFilters(tasks.filter((t) => t.dueDate === selectedDate));
  }, [tasks, selectedDate, filter, selectedCategory, searchQuery]);

  const reportGroups = useMemo(() => {
    const filtered = applyCommonFilters(tasks);
    const grouped = new Map<string, Task[]>();

    for (const task of filtered) {
      const key = task.dueDate?.trim() || "بدون‌تاریخ";
      if (!grouped.has(key)) grouped.set(key, []);
      grouped.get(key)?.push(task);
    }

    const sortedKeys = Array.from(grouped.keys()).sort((a, b) => {
      if (a === "بدون‌تاریخ") return 1;
      if (b === "بدون‌تاریخ") return -1;
      return a < b ? 1 : -1;
    });

    return sortedKeys.map((key) => ({
      date: key,
      label: key === "بدون‌تاریخ" ? "بدون تاریخ" : toPersianDigits(key),
      tasks: grouped.get(key) ?? [],
    }));
  }, [tasks, filter, selectedCategory, searchQuery]);

  const overdueTasks = useMemo(() => {
    let result = tasks.filter(
      (task) => !task.completed && task.dueDate?.trim() && task.dueDate < todayDateStr
    );

    if (selectedCategory) {
      result = result.filter((task) => task.category === selectedCategory);
    }

    return result.sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  }, [tasks, selectedCategory, todayDateStr]);

  const handleCreateTask = async (data: TaskFormData) => {
    const success = await createTask(data);
    if (success && data.dueDate) {
      setSelectedDate(data.dueDate);
    }
    return success;
  };

  const handleUpdateTask = async (data: TaskFormData) => {
    if (!editingTask) return false;
    const success = await updateTask(editingTask.id, data);
    if (success && data.dueDate) {
      setSelectedDate(data.dueDate);
    }
    return success;
  };

  const handleDelete = async () => {
    if (deletingTaskId === null) return;
    await deleteTask(deletingTaskId);
    setDeletingTaskId(null);
  };

  const handleTransfer = async (newDate: string) => {
    if (!transferringTask) return false;
    const success = await updateTask(transferringTask.id, { dueDate: newDate });
    if (success) {
      setSelectedDate(newDate);
    }
    return success;
  };

  const now = new Date();
  const todayPersian = formatJalaaliPersian(now);
  const todayWeekDay = getPersianWeekDayName(now);
  const jToday = toJalaali(now);

  const getPageTitle = () => {
    if (selectedCategoryObj) return null;
    if (filter === "active") return "وظایف فعال";
    if (filter === "completed") return "وظایف تکمیل شده";
    return "همه وظایف";
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar
        tasks={tasks}
        categories={categories}
        filter={filter}
        setFilter={setFilter}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        onCreateTask={() => { setEditingTask(null); setShowTaskModal(true); }}
        onCreateCategory={() => setShowCategoryModal(true)}
        onDeleteCategory={deleteCategory}
        sidebarOpen={sidebarOpen}
        onCloseSidebar={() => setSidebarOpen(false)}
        currentView={currentView}
        onChangeView={setCurrentView}
        memoriesCount={memories.length}
        plansCount={plans.length}
        lifeSections={lifeSections}
        onCreateSection={() => setShowSectionModal(true)}
        onDeleteSection={deleteSection}
      />

      {currentView === "memories" ? (
        <MemoriesView />
      ) : currentView === "planning" ? (
        <PlanningView categories={categories} />
      ) : currentView.startsWith("section-") ? (
        (() => {
          const sectionValue = currentView.replace("section-", "");
          const sec = lifeSections.find((s) => s.value === sectionValue);
          return sec ? <SectionView section={sec} /> : null;
        })()
      ) : (
      <main className="flex-1 min-w-0 main-content">
        {/* ──── Hero Banner ──── */}
        <div className="relative overflow-hidden bg-gradient-to-l from-violet-600 via-purple-600 to-indigo-700 shadow-xl shadow-purple-900/20">
          <div className="absolute -top-20 -left-20 w-72 h-72 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-16 -right-16 w-60 h-60 bg-yellow-300/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-32 bg-purple-400/10 rounded-full blur-3xl" />

          <div className="relative px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden w-10 h-10 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
                >
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
                <div>
                  {selectedCategoryObj ? (
                    <div className="flex items-center gap-3">
                      <div className={`flex items-center gap-2 px-4 py-2 rounded-2xl ${getCategoryColor(selectedCategoryObj.value).bg} ${getCategoryColor(selectedCategoryObj.value).border} border-2`}>
                        <span className="text-2xl">{selectedCategoryObj.icon}</span>
                        <span className={`text-lg font-extrabold ${getCategoryColor(selectedCategoryObj.value).text}`}>
                          {selectedCategoryObj.label}
                        </span>
                      </div>
                      <button
                        onClick={() => setSelectedCategory("")}
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-white/20 text-white/80 hover:bg-white/30 hover:text-white transition-colors cursor-pointer text-sm"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <h2 className="text-xl sm:text-2xl font-extrabold text-amber-300 drop-shadow-lg" style={{ textShadow: "0 2px 12px rgba(251,191,36,0.3)" }}>
                      {getPageTitle()}
                    </h2>
                  )}
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="text-white/70 text-sm font-medium">{todayWeekDay}،</span>
                    <span className="text-amber-200/90 text-sm font-bold" style={{ textShadow: "0 1px 6px rgba(251,191,36,0.2)" }}>
                      {todayPersian}
                    </span>
                    <span className="text-white/40 text-sm">•</span>
                    <span className="text-white/60 text-sm">
                      {toPersianDigits(String(dailyTasks.length))} وظیفه
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => { setEditingTask(null); setShowTaskModal(true); }}
                className="hidden sm:flex items-center gap-2 px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-purple-900 rounded-xl text-sm font-bold transition-colors shadow-lg shadow-amber-500/25 cursor-pointer"
              >
                <span className="text-lg">+</span>
                وظیفه جدید
              </button>
            </div>
          </div>
        </div>

        {/* ──── Search Bar ──── */}
        <div className="bg-white/70 backdrop-blur-xl border-b border-slate-200/50 sticky top-0 z-30">
          <div className="px-4 sm:px-6 lg:px-8 py-3">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="جستجو در وظایف..."
                className="w-full pl-4 pr-11 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all bg-white/90"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🔍</span>
            </div>
          </div>
        </div>

        {/* ──── Content ──── */}
        <div className="px-4 sm:px-6 lg:px-8 py-5">
          {overdueTasks.length > 0 && (
            <div className="mb-5 rounded-3xl border border-amber-200 bg-gradient-to-l from-amber-50 to-orange-50 shadow-sm overflow-hidden animate-fade-in">
              <div className="px-5 py-4 border-b border-amber-100">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div>
                    <h3 className="text-sm sm:text-base font-extrabold text-amber-800 flex items-center gap-2">
                      <span>⏰</span>
                      <span>پیگیری وظایف تاریخ‌گذشته</span>
                    </h3>
                    <p className="text-xs text-amber-700/80 mt-1 leading-6">
                      {selectedCategoryObj
                        ? `در امور ${selectedCategoryObj.label} وظیفه انجام‌نشده از روزهای قبل دارید؛ لطفاً آن‌ها را تعیین تکلیف کنید.`
                        : "وظیفه‌های انجام‌نشده از روزهای قبل دارید؛ لطفاً آن‌ها را تعیین تکلیف کنید."}
                    </p>
                  </div>
                  <span className="text-xs bg-white text-amber-700 px-3 py-1 rounded-full border border-amber-200 font-medium">
                    {toPersianDigits(String(overdueTasks.length))} مورد معوق
                  </span>
                </div>
              </div>

              <div className="p-3 sm:p-4 space-y-3">
                {overdueTasks.map((task) => {
                  const cat = categories.find((c) => c.value === task.category);
                  return (
                    <div
                      key={`overdue-${task.id}`}
                      className="bg-white/90 rounded-2xl border border-amber-100 px-4 py-3 shadow-sm"
                    >
                      <div className="flex flex-col gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-slate-800 truncate">{task.title}</p>
                          <p className="text-sm text-amber-700 mt-1 leading-7 break-words">
                            کار انجام‌نشده در تاریخ {toPersianDigits(task.dueDate)} دارید؛ آن را تعیین تکلیف کنید.
                          </p>
                          <div className="flex items-center gap-2 mt-2 flex-wrap">
                            {cat && (
                              <span className="text-[10px] bg-purple-50 text-purple-600 px-2 py-1 rounded-lg">
                                {cat.icon} {cat.label}
                              </span>
                            )}
                            <button
                              onClick={() => setSelectedDate(task.dueDate)}
                              className="text-[10px] bg-slate-100 text-slate-600 px-2 py-1 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
                            >
                              رفتن به تاریخ {toPersianDigits(task.dueDate)}
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 flex-wrap">
                          <button
                            onClick={() => toggleComplete(task.id, task.completed)}
                            className="px-3 py-2 rounded-xl text-xs font-medium bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors cursor-pointer"
                          >
                            ✅ انجام شد
                          </button>
                          <button
                            onClick={() => setTransferringTask(task)}
                            className="px-3 py-2 rounded-xl text-xs font-medium bg-amber-100 text-amber-800 hover:bg-amber-200 transition-colors cursor-pointer"
                          >
                            📅 انتقال
                          </button>
                          <button
                            onClick={() => setDetailTask(task)}
                            className="px-3 py-2 rounded-xl text-xs font-medium bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors cursor-pointer"
                          >
                            👁 جزئیات
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Date Card */}
          <div className="relative mb-5">
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between gap-3 p-4">
                <div className="flex items-center gap-4 min-w-0">
                  {/* Clickable calendar icon */}
                  {(() => {
                    const sel = parseJalaaliString(selectedDate);
                    const displayMonth = sel ? persianMonths[sel.jm - 1] : persianMonths[jToday.jm - 1];
                    const displayDay = sel ? sel.jd : jToday.jd;
                    return (
                      <button
                        onClick={() => setShowDatePicker(!showDatePicker)}
                        className="w-14 h-14 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex flex-col items-center justify-center shadow-lg shadow-purple-500/20 flex-shrink-0 cursor-pointer hover:from-violet-600 hover:to-purple-700 hover:scale-105 active:scale-95 transition-all"
                        title="تغییر تاریخ"
                      >
                        <span className="text-amber-300 text-[10px] font-bold leading-none">{displayMonth}</span>
                        <span className="text-white text-xl font-extrabold leading-none mt-0.5">{toPersianDigits(String(displayDay))}</span>
                      </button>
                    );
                  })()}
                  <div className="min-w-0">
                    <h3 className="font-bold text-slate-800 text-base">
                      📅 لیست امور {selectedDate === todayDateStr ? "امروز" : toPersianDigits(selectedDate)}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {toPersianDigits(String(dailyTasks.length))} وظیفه برای این روز
                      {dailyTasks.filter((t) => t.completed).length > 0 && (
                        <span className="text-emerald-500 mr-2">
                          • {toPersianDigits(String(dailyTasks.filter((t) => t.completed).length))} تکمیل شده
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setShowFullReport((prev) => !prev)}
                  className={`flex-shrink-0 px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer border ${
                    showFullReport
                      ? "bg-indigo-600 text-white border-indigo-600 shadow-md"
                      : "bg-indigo-50 text-indigo-700 border-indigo-100 hover:bg-indigo-100"
                  }`}
                >
                  {showFullReport ? "بستن گزارش" : "کل گزارش"}
                </button>
              </div>
              {showDatePicker && (
                <div className="absolute right-4 top-full mt-1 z-50">
                  <JalaliDatePicker
                    value={selectedDate}
                    onChange={(val) => { setSelectedDate(val); setShowDatePicker(false); }}
                    onClose={() => setShowDatePicker(false)}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Loading */}
          {tasksLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-sm text-slate-400">در حال بارگذاری...</p>
              </div>
            </div>
          ) : dailyTasks.length > 0 ? (
            /* Daily task rows */
            <div className="space-y-3">
              {dailyTasks.map((task) => {
                const cat = categories.find((c) => c.value === task.category);
                const prioMap: Record<string, { dot: string; bg: string; label: string }> = {
                  high: { dot: "bg-red-500", bg: "bg-red-50", label: "فوری" },
                  medium: { dot: "bg-amber-400", bg: "bg-amber-50", label: "متوسط" },
                  low: { dot: "bg-emerald-500", bg: "bg-emerald-50", label: "عادی" },
                };
                const prio = prioMap[task.priority] ?? prioMap.medium;

                return (
                  <div
                    key={`daily-${task.id}`}
                    className={`bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-md transition-all ${task.completed ? "opacity-60" : ""}`}
                  >
                    {/* Task row */}
                    <div className="px-4 py-3 flex items-center gap-3">
                      {/* Priority dot */}
                      <div className={`w-3 h-3 rounded-full flex-shrink-0 ${prio.dot}`} title={prio.label} />

                      {/* Title + description */}
                      <div
                        className="flex-1 min-w-0 cursor-pointer"
                        onClick={() => setDetailTask(task)}
                      >
                        <p className={`text-sm font-semibold truncate ${task.completed ? "line-through text-slate-400" : "text-slate-800"}`}>
                          {task.title}
                        </p>
                        {task.description && (
                          <p className="text-xs text-slate-400 truncate mt-0.5">{task.description}</p>
                        )}
                      </div>

                      {/* Category badge */}
                      {cat && (
                        <span className="hidden sm:inline-flex text-[10px] bg-purple-50 text-purple-600 px-2 py-1 rounded-lg flex-shrink-0">
                          {cat.icon} {cat.label}
                        </span>
                      )}

                      {/* Attachments */}
                      {(task.imageUrl || task.audioUrl || task.note) && (
                        <div className="hidden sm:flex items-center gap-1 flex-shrink-0 text-slate-300">
                          {task.imageUrl && <span className="text-xs">📷</span>}
                          {task.audioUrl && <span className="text-xs">🎙</span>}
                          {task.note && <span className="text-xs">📝</span>}
                        </div>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className={`flex items-center border-t border-slate-100 ${prio.bg}`}>
                      {/* انجام شده */}
                      <button
                        onClick={() => toggleComplete(task.id, task.completed)}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-medium transition-colors cursor-pointer border-l border-slate-100 ${
                          task.completed
                            ? "text-emerald-600 bg-emerald-50"
                            : "text-slate-500 hover:text-emerald-600 hover:bg-emerald-50"
                        }`}
                      >
                        {task.completed ? (
                          <>
                            <span>✅</span>
                            <span>انجام شده</span>
                          </>
                        ) : (
                          <>
                            <span>⬜</span>
                            <span>انجام شد</span>
                          </>
                        )}
                      </button>

                      {/* انتقال */}
                      <button
                        onClick={() => setTransferringTask(task)}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-medium text-slate-500 hover:text-amber-600 hover:bg-amber-50 transition-colors cursor-pointer border-l border-slate-100"
                      >
                        <span>📅</span>
                        <span>انتقال</span>
                      </button>

                      {/* حذف */}
                      <button
                        onClick={() => setDeletingTaskId(task.id)}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-medium text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                      >
                        <span>🗑</span>
                        <span>حذف</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Empty state */
            <div className="bg-white/60 rounded-2xl border border-dashed border-slate-200 p-10 text-center">
              <div className="text-5xl mb-4">📭</div>
              <h3 className="text-lg font-bold text-slate-600 mb-2">
                هیچ وظیفه‌ای {selectedDate === todayDateStr ? "برای امروز" : "برای این روز"} ثبت نشده
              </h3>
              <p className="text-sm text-slate-400 mb-6">
                اولین وظیفه خود را ایجاد کنید
              </p>
              <button
                onClick={() => { setEditingTask(null); setShowTaskModal(true); }}
                className="px-6 py-3 bg-gradient-to-l from-primary to-secondary text-white rounded-xl text-sm font-medium hover:opacity-90 transition-opacity shadow-lg shadow-primary/25 cursor-pointer"
              >
                + ایجاد وظیفه جدید
              </button>
            </div>
          )}

          {showFullReport && !tasksLoading && (
            <div className="mt-8 rounded-3xl border border-slate-200 bg-white/80 backdrop-blur-sm shadow-sm overflow-hidden animate-fade-in">
              <div className="px-5 py-4 border-b border-slate-100 bg-gradient-to-l from-indigo-50 to-purple-50">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div>
                    <h3 className="text-base font-extrabold text-slate-800">🧾 کل گزارش وظیفه‌ها</h3>
                    <p className="text-xs text-slate-400 mt-1">
                      {selectedCategoryObj
                        ? `گزارش کامل امور ${selectedCategoryObj.label}`
                        : "گزارش کامل همه امور"}
                    </p>
                  </div>
                  <span className="text-xs bg-white text-indigo-700 px-3 py-1 rounded-full border border-indigo-100 font-medium">
                    {toPersianDigits(String(reportGroups.reduce((sum, group) => sum + group.tasks.length, 0)))} وظیفه
                  </span>
                </div>
              </div>

              <div className="p-4 sm:p-5 space-y-2">
                {reportGroups.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-3">🗂️</div>
                    <p className="text-sm text-slate-400">گزارشی برای نمایش وجود ندارد</p>
                  </div>
                ) : (
                  reportGroups.map((group) => {
                    const isExpanded = expandedDates.has(group.date);
                    const completedCount = group.tasks.filter((t) => t.completed).length;

                    return (
                      <div key={group.date} className="rounded-2xl border border-slate-100 overflow-hidden bg-white">
                        {/* Date header - clickable */}
                        <button
                          onClick={() => toggleDateExpand(group.date)}
                          className="w-full flex items-center justify-between gap-3 px-4 py-3 hover:bg-slate-50 transition-colors cursor-pointer"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <svg
                              className={`w-4 h-4 text-slate-400 transition-transform duration-200 flex-shrink-0 ${isExpanded ? "rotate-90" : ""}`}
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={2.5}
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                            </svg>
                            <span className="text-base">📅</span>
                            <h4 className="text-sm font-bold text-slate-800 truncate">{group.label}</h4>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {completedCount > 0 && (
                              <span className="text-[10px] bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded-full">
                                {toPersianDigits(String(completedCount))} ✓
                              </span>
                            )}
                            <span className="text-[11px] bg-indigo-100 text-indigo-600 px-2.5 py-1 rounded-full font-medium">
                              {toPersianDigits(String(group.tasks.length))} وظیفه
                            </span>
                          </div>
                        </button>

                        {/* Tasks - collapsible */}
                        {isExpanded && (
                          <div className="border-t border-slate-100 bg-slate-50/50 p-3 space-y-2 animate-fade-in">
                            {group.tasks.map((task) => {
                              const cat = categories.find((c) => c.value === task.category);
                              const prioMap: Record<string, { dot: string; bg: string; label: string }> = {
                                high: { dot: "bg-red-500", bg: "bg-red-50", label: "فوری" },
                                medium: { dot: "bg-amber-400", bg: "bg-amber-50", label: "متوسط" },
                                low: { dot: "bg-emerald-500", bg: "bg-emerald-50", label: "عادی" },
                              };
                              const prio = prioMap[task.priority] ?? prioMap.medium;

                              return (
                                <div
                                  key={`report-${group.date}-${task.id}`}
                                  className={`bg-white rounded-xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-md transition-all ${task.completed ? "opacity-60" : ""}`}
                                >
                                  <div className="px-4 py-3 flex items-center gap-3">
                                    <div className={`w-3 h-3 rounded-full flex-shrink-0 ${prio.dot}`} title={prio.label} />
                                    <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setDetailTask(task)}>
                                      <p className={`text-sm font-semibold truncate ${task.completed ? "line-through text-slate-400" : "text-slate-800"}`}>
                                        {task.title}
                                      </p>
                                      {task.description && (
                                        <p className="text-xs text-slate-400 truncate mt-0.5">{task.description}</p>
                                      )}
                                    </div>
                                    {cat && (
                                      <span className="hidden sm:inline-flex text-[10px] bg-purple-50 text-purple-600 px-2 py-1 rounded-lg flex-shrink-0">
                                        {cat.icon} {cat.label}
                                      </span>
                                    )}
                                  </div>

                                  <div className={`flex items-center border-t border-slate-100 ${prio.bg}`}>
                                    <button
                                      onClick={() => toggleComplete(task.id, task.completed)}
                                      className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-medium transition-colors cursor-pointer border-l border-slate-100 ${
                                        task.completed
                                          ? "text-emerald-600 bg-emerald-50"
                                          : "text-slate-500 hover:text-emerald-600 hover:bg-emerald-50"
                                      }`}
                                    >
                                      {task.completed ? "✅ انجام شده" : "⬜ انجام شد"}
                                    </button>

                                    <button
                                      onClick={() => setTransferringTask(task)}
                                      className="flex-1 flex items-center justify-center gap-2 py-2 text-xs font-medium text-slate-500 hover:text-amber-600 hover:bg-amber-50 transition-colors cursor-pointer border-l border-slate-100"
                                    >
                                      📅 انتقال
                                    </button>

                                    <button
                                      onClick={() => setDeletingTaskId(task.id)}
                                      className="flex-1 flex items-center justify-center gap-2 py-2 text-xs font-medium text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                                    >
                                      🗑 حذف
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* Mobile FAB */}
        <button
          onClick={() => { setEditingTask(null); setShowTaskModal(true); }}
          className="sm:hidden fixed bottom-20 left-6 w-14 h-14 bg-gradient-to-br from-primary to-secondary text-white rounded-2xl shadow-xl shadow-primary/30 flex items-center justify-center text-2xl z-30 cursor-pointer hover:scale-105 transition-transform"
        >+</button>
      </main>
      )}

      {/* Modals */}
      <TaskModal
        isOpen={showTaskModal}
        onClose={() => { setShowTaskModal(false); setEditingTask(null); }}
        onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
        categories={categories}
        task={editingTask}
      />
      <TaskDetailModal
        isOpen={!!detailTask}
        onClose={() => setDetailTask(null)}
        task={detailTask}
        categories={categories}
      />
      <TransferModal
        isOpen={!!transferringTask}
        onClose={() => setTransferringTask(null)}
        onSubmit={handleTransfer}
        task={transferringTask}
      />
      <DeleteConfirmModal
        isOpen={deletingTaskId !== null}
        onClose={() => setDeletingTaskId(null)}
        onConfirm={handleDelete}
      />
      <CategoryModal
        isOpen={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
        onSubmit={createCategory}
      />
      <SectionModal
        isOpen={showSectionModal}
        onClose={() => setShowSectionModal(false)}
        onSubmit={createSection}
      />
      <MobileBottomNav
        currentView={currentView}
        onChangeView={setCurrentView}
        onOpenSidebar={() => setSidebarOpen(true)}
      />
      <NotificationManager tasks={tasks} />
    </div>
  );
}
