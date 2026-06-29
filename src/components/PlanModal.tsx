"use client";

import { useState, useEffect } from "react";
import type { Plan, Category } from "@/types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Plan>) => Promise<boolean>;
  categories: Category[];
  plan?: Plan | null;
}

const dayOptions = [
  { id: "everyday", label: "هر روز (روتین ثابت)" },
  { id: "sat", label: "شنبه" },
  { id: "sun", label: "یکشنبه" },
  { id: "mon", label: "دوشنبه" },
  { id: "tue", label: "سه‌شنبه" },
  { id: "wed", label: "چهارشنبه" },
  { id: "thu", label: "پنجشنبه" },
  { id: "fri", label: "جمعه" },
];

const colorOptions = [
  { id: "indigo", bg: "bg-indigo-500", label: "آبی نیلی" },
  { id: "purple", bg: "bg-purple-500", label: "بنفش" },
  { id: "emerald", bg: "bg-emerald-500", label: "سبز" },
  { id: "amber", bg: "bg-amber-500", label: "زرد" },
  { id: "rose", bg: "bg-rose-500", label: "صورتی" },
  { id: "cyan", bg: "bg-cyan-500", label: "فیروزه‌ای" },
];

export default function PlanModal({ isOpen, onClose, onSubmit, categories, plan }: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dayOfWeek, setDayOfWeek] = useState("everyday");
  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("09:00");
  const [category, setCategory] = useState("");
  const [color, setColor] = useState("indigo");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (plan) {
      setTitle(plan.title);
      setDescription(plan.description || "");
      setDayOfWeek(plan.dayOfWeek || "everyday");
      setStartTime(plan.startTime || "08:00");
      setEndTime(plan.endTime || "09:00");
      setCategory(plan.category || "");
      setColor(plan.color || "indigo");
    } else {
      setTitle("");
      setDescription("");
      setDayOfWeek("everyday");
      setStartTime("08:00");
      setEndTime("09:00");
      setCategory("");
      setColor("indigo");
    }
  }, [plan, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!title.trim()) return;
    setSubmitting(true);
    const success = await onSubmit({
      title: title.trim(),
      description,
      dayOfWeek,
      startTime,
      endTime,
      category,
      color,
    });
    setSubmitting(false);
    if (success) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 modal-backdrop animate-fade-in overflow-y-auto" onClick={onClose}>
      <div className="min-h-full flex items-start sm:items-center justify-center py-8 px-4">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg animate-slide-up" onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <div className="bg-gradient-to-l from-teal-500 to-emerald-500 p-5 rounded-t-3xl">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">{plan ? "✏️ ویرایش برنامه‌ریزی" : "🗓️ برنامه‌ریزی جدید"}</h2>
              <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors cursor-pointer">✕</button>
            </div>
          </div>

          <div className="p-5 space-y-4">
            {/* روز هفته */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">تکرار در روزهای هفته</label>
              <select
                value={dayOfWeek}
                onChange={(e) => setDayOfWeek(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none text-sm bg-slate-50 cursor-pointer"
              >
                {dayOptions.map((d) => (
                  <option key={d.id} value={d.id}>{d.label}</option>
                ))}
              </select>
            </div>

            {/* زمان شروع و پایان */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">⏰ ساعت شروع</label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none text-sm bg-slate-50 text-center font-bold"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">⏳ ساعت پایان</label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none text-sm bg-slate-50 text-center font-bold"
                />
              </div>
            </div>

            {/* عنوان */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">✏️ عنوان برنامه <span className="text-red-400">*</span></label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="مثلاً مطالعه کتاب، باشگاه، جلسه کاری..."
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none transition-all text-sm bg-slate-50"
              />
            </div>

            {/* دسته‌بندی */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">📂 دسته‌بندی</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none text-sm bg-slate-50 cursor-pointer"
              >
                <option value="">بدون دسته‌بندی</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.value}>{c.icon} {c.label}</option>
                ))}
              </select>
            </div>

            {/* توضیحات */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">📝 توضیحات / یادداشت</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="جزئیات بیشتر..."
                rows={3}
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none text-sm resize-none bg-slate-50"
              />
            </div>

            {/* رنگ کارت */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">🎨 رنگ برچسب زمان</label>
              <div className="flex gap-2">
                {colorOptions.map((co) => (
                  <button
                    key={co.id}
                    type="button"
                    onClick={() => setColor(co.id)}
                    className={`w-9 h-9 rounded-xl ${co.bg} flex items-center justify-center text-white transition-transform cursor-pointer ${
                      color === co.id ? "ring-4 ring-offset-2 ring-teal-400 scale-110" : "opacity-80 hover:opacity-100 hover:scale-105"
                    }`}
                    title={co.label}
                  >
                    {color === co.id && "✓"}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-5 pt-0 flex gap-3">
            <button
              onClick={handleSubmit}
              disabled={!title.trim() || submitting}
              className="flex-1 py-3 bg-gradient-to-l from-teal-500 to-emerald-500 text-white rounded-xl font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer shadow-lg shadow-teal-500/20"
            >
              {submitting ? "در حال ذخیره..." : plan ? "ذخیره تغییرات" : "ثبت برنامه‌ریزی"}
            </button>
            <button onClick={onClose} className="px-6 py-3 bg-slate-100 text-slate-600 rounded-xl font-medium text-sm hover:bg-slate-200 transition-colors cursor-pointer">انصراف</button>
          </div>
        </div>
      </div>
    </div>
  );
}
