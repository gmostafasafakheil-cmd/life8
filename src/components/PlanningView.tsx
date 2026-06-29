"use client";

import { useState, useMemo } from "react";
import { usePlans } from "@/hooks/usePlans";
import type { Plan, Category } from "@/types";
import PlanModal from "@/components/PlanModal";
import DeleteConfirmModal from "@/components/DeleteConfirmModal";
import { toPersianDigits, formatJalaaliPersian, getPersianWeekDayName } from "@/lib/jalali";

interface Props {
  categories: Category[];
}

const dayTabs = [
  { id: "everyday", label: "هر روز" },
  { id: "sat", label: "شنبه" },
  { id: "sun", label: "یکشنبه" },
  { id: "mon", label: "دوشنبه" },
  { id: "tue", label: "سه‌شنبه" },
  { id: "wed", label: "چهارشنبه" },
  { id: "thu", label: "پنجشنبه" },
  { id: "fri", label: "جمعه" },
];

const colorBadge: Record<string, string> = {
  indigo: "bg-indigo-500 text-white",
  purple: "bg-purple-500 text-white",
  emerald: "bg-emerald-500 text-white",
  amber: "bg-amber-500 text-white",
  rose: "bg-rose-500 text-white",
  cyan: "bg-cyan-500 text-white",
};

const colorBorder: Record<string, string> = {
  indigo: "border-l-4 border-l-indigo-500",
  purple: "border-l-4 border-l-purple-500",
  emerald: "border-l-4 border-l-emerald-500",
  amber: "border-l-4 border-l-amber-500",
  rose: "border-l-4 border-l-rose-500",
  cyan: "border-l-4 border-l-cyan-500",
};

export default function PlanningView({ categories }: Props) {
  const { plans, loading, createPlan, updatePlan, deletePlan, toggleComplete } = usePlans();

  const [activeTab, setActiveTab] = useState("everyday");
  const [showModal, setShowModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const now = new Date();
  const todayPersian = formatJalaaliPersian(now);
  const todayWeekDay = getPersianWeekDayName(now);

  const filteredPlans = useMemo(() => {
    return plans
      .filter((p) => p.dayOfWeek === activeTab || p.dayOfWeek === "everyday")
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [plans, activeTab]);

  const handleCreate = async (data: Partial<Plan>) => createPlan(data);
  const handleUpdate = async (data: Partial<Plan>) => {
    if (!editingPlan) return false;
    return updatePlan(editingPlan.id, data);
  };
  const handleDelete = async () => {
    if (deletingId === null) return;
    await deletePlan(deletingId);
    setDeletingId(null);
  };

  return (
    <div className="flex-1 min-w-0 main-content">
      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-l from-teal-600 via-emerald-600 to-green-600 shadow-xl shadow-teal-900/20">
        <div className="absolute -top-20 -left-20 w-72 h-72 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-16 -right-16 w-60 h-60 bg-yellow-300/10 rounded-full blur-3xl" />

        <div className="relative px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-amber-200 drop-shadow-lg" style={{ textShadow: "0 2px 12px rgba(251,191,36,0.3)" }}>
                🗓️ برنامه‌ریزی و زمان‌بندی امور
              </h2>
              <div className="flex items-center gap-3 mt-1.5">
                <span className="text-white/70 text-sm font-medium">{todayWeekDay}،</span>
                <span className="text-amber-200/90 text-sm font-bold">{todayPersian}</span>
                <span className="text-white/40 text-sm">•</span>
                <span className="text-white/60 text-sm">{toPersianDigits(String(plans.length))} بلوک زمانی</span>
              </div>
            </div>
            <button
              onClick={() => { setEditingPlan(null); setShowModal(true); }}
              className="hidden sm:flex items-center gap-2 px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-teal-900 rounded-xl text-sm font-bold transition-colors shadow-lg shadow-amber-500/25 cursor-pointer"
            >
              <span className="text-lg">+</span>
              برنامه جدید
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white/70 backdrop-blur-xl border-b border-slate-200/50 sticky top-0 z-30 overflow-x-auto">
        <div className="px-4 sm:px-6 lg:px-8 py-2.5 flex gap-2 min-w-max">
          {dayTabs.map((tab) => {
            const count = plans.filter((p) => p.dayOfWeek === tab.id || p.dayOfWeek === "everyday").length;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex-shrink-0 ${
                  activeTab === tab.id
                    ? "bg-teal-600 text-white shadow-md shadow-teal-600/25"
                    : "bg-slate-100/80 text-slate-600 hover:bg-slate-200"
                }`}
              >
                <span>{tab.label}</span>
                <span className={`px-1.5 py-0.5 rounded-md text-[10px] ${activeTab === tab.id ? "bg-white/20 text-white" : "bg-slate-200 text-slate-500"}`}>
                  {toPersianDigits(String(count))}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Timeline Content */}
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-sm text-slate-400">در حال بارگذاری برنامه‌ها...</p>
            </div>
          </div>
        ) : filteredPlans.length === 0 ? (
          <div className="bg-white/60 rounded-2xl border border-dashed border-slate-200 p-10 text-center">
            <div className="text-5xl mb-4">⏱️</div>
            <h3 className="text-lg font-bold text-slate-600 mb-2">هیچ برنامه‌ای برای این روز ثبت نشده</h3>
            <p className="text-sm text-slate-400 mb-6">بلوک‌های زمانی خود را تعریف کنید تا روزتان منظم شود</p>
            <button
              onClick={() => { setEditingPlan(null); setShowModal(true); }}
              className="px-6 py-3 bg-gradient-to-l from-teal-500 to-emerald-500 text-white rounded-xl text-sm font-medium hover:opacity-90 transition-opacity shadow-lg shadow-teal-500/25 cursor-pointer"
            >
              + ثبت برنامه‌ریزی جدید
            </button>
          </div>
        ) : (
          <div className="space-y-3 max-w-3xl">
            {filteredPlans.map((plan) => {
              const cat = categories.find((c) => c.value === plan.category);
              const badge = colorBadge[plan.color] || colorBadge.indigo;
              const border = colorBorder[plan.color] || colorBorder.indigo;

              return (
                <div
                  key={plan.id}
                  className={`bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all flex items-stretch overflow-hidden group ${
                    plan.completed ? "opacity-60 bg-slate-50/50" : ""
                  }`}
                >
                  {/* Time strip / badge */}
                  <div className={`w-24 sm:w-32 flex flex-col items-center justify-center p-3 text-center flex-shrink-0 ${badge}`}>
                    <span className="text-xs sm:text-sm font-black leading-none">{toPersianDigits(plan.startTime)}</span>
                    <span className="text-[10px] opacity-75 my-0.5">تا</span>
                    <span className="text-xs sm:text-sm font-black leading-none">{toPersianDigits(plan.endTime)}</span>
                  </div>

                  {/* Main card info */}
                  <div className={`flex-1 p-4 flex flex-col justify-between min-w-0 border-r border-slate-100 ${border}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className={`text-sm sm:text-base font-bold truncate ${plan.completed ? "line-through text-slate-400" : "text-slate-800"}`}>
                            {plan.title}
                          </p>
                          {plan.dayOfWeek === "everyday" && (
                            <span className="text-[10px] bg-teal-50 text-teal-700 px-2 py-0.5 rounded-md font-medium border border-teal-100">
                              🔄 هر روز
                            </span>
                          )}
                          {cat && (
                            <span className="text-[10px] bg-purple-50 text-purple-600 px-2 py-0.5 rounded-md font-medium border border-purple-100">
                              {cat.icon} {cat.label}
                            </span>
                          )}
                        </div>
                        {plan.description && (
                          <p className="text-xs text-slate-500 mt-1 leading-6 whitespace-pre-line">{plan.description}</p>
                        )}
                      </div>

                      {/* Checkbox action */}
                      <button
                        onClick={() => toggleComplete(plan.id, plan.completed)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer flex-shrink-0 ${
                          plan.completed
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-600"
                        }`}
                      >
                        <span>{plan.completed ? "✅ انجام شد" : "⬜ انجام شد"}</span>
                      </button>
                    </div>

                    {/* Actions footer (visible on hover or always on mobile) */}
                    <div className="flex items-center justify-end gap-2 mt-3 pt-2 border-t border-slate-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => { setEditingPlan(plan); setShowModal(true); }}
                        className="text-xs text-slate-400 hover:text-blue-600 cursor-pointer flex items-center gap-1 px-2 py-1 rounded hover:bg-blue-50 transition-colors"
                      >
                        <span>✏️</span>
                        <span>ویرایش</span>
                      </button>
                      <button
                        onClick={() => setDeletingId(plan.id)}
                        className="text-xs text-slate-400 hover:text-red-600 cursor-pointer flex items-center gap-1 px-2 py-1 rounded hover:bg-red-50 transition-colors"
                      >
                        <span>🗑</span>
                        <span>حذف</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Mobile FAB */}
      <button
        onClick={() => { setEditingPlan(null); setShowModal(true); }}
        className="sm:hidden fixed bottom-20 left-6 w-14 h-14 bg-gradient-to-br from-teal-500 to-emerald-500 text-white rounded-2xl shadow-xl shadow-teal-500/30 flex items-center justify-center text-2xl z-30 cursor-pointer hover:scale-105 transition-transform"
      >
        +
      </button>

      {/* Modals */}
      <PlanModal
        isOpen={showModal}
        onClose={() => { setShowModal(false); setEditingPlan(null); }}
        onSubmit={editingPlan ? handleUpdate : handleCreate}
        categories={categories}
        plan={editingPlan}
      />
      <DeleteConfirmModal
        isOpen={deletingId !== null}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDelete}
        title="حذف برنامه‌ریزی"
        message="آیا از حذف این بلوک زمانی اطمینان دارید؟"
      />
    </div>
  );
}
