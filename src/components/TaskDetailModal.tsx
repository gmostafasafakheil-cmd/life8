"use client";

import type { Task, Category } from "@/types";
import { toPersianDigits } from "@/lib/jalali";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
  categories: Category[];
}

const priorityConfig = {
  high: { label: "فوری", color: "bg-red-100 text-red-700", icon: "🔴" },
  medium: { label: "متوسط", color: "bg-amber-100 text-amber-700", icon: "🟡" },
  low: { label: "عادی", color: "bg-emerald-100 text-emerald-700", icon: "🟢" },
};

export default function TaskDetailModal({ isOpen, onClose, task, categories }: Props) {
  if (!isOpen || !task) return null;

  const pConfig = priorityConfig[task.priority as keyof typeof priorityConfig] || priorityConfig.medium;
  const cat = categories.find((c) => c.value === task.category);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center modal-backdrop animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto animate-slide-up">
        <div className="bg-gradient-to-l from-primary to-secondary p-6 rounded-t-3xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{task.completed ? "✅" : "📋"}</span>
              <h2 className="text-xl font-bold text-white">{task.title}</h2>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {/* Status & Priority */}
          <div className="flex flex-wrap gap-3">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${pConfig.color}`}>
              {pConfig.icon} {pConfig.label}
            </span>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              task.completed ? "bg-emerald-100 text-emerald-700" : "bg-blue-100 text-blue-700"
            }`}>
              {task.completed ? "✅ تکمیل شده" : "🔵 فعال"}
            </span>
            {cat && (
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                {cat.icon} {cat.label}
              </span>
            )}
          </div>

          {/* Description */}
          {task.description && (
            <div>
              <h3 className="text-sm font-medium text-slate-500 mb-2">📝 توضیحات</h3>
              <p className="text-sm text-slate-700 leading-7 bg-slate-50 rounded-xl p-4">
                {task.description}
              </p>
            </div>
          )}

          {/* Due Date */}
          {task.dueDate && (
            <div>
              <h3 className="text-sm font-medium text-slate-500 mb-2">📅 تاریخ سررسید</h3>
              <p className="text-sm text-slate-700">{toPersianDigits(task.dueDate)}</p>
            </div>
          )}

          {/* Image */}
          {task.imageUrl && (
            <div>
              <h3 className="text-sm font-medium text-slate-500 mb-2">📷 تصویر</h3>
              <div className="rounded-xl overflow-hidden border border-slate-200">
                <img src={task.imageUrl} alt="تصویر وظیفه" className="w-full max-h-64 object-cover" />
              </div>
            </div>
          )}

          {/* Audio */}
          {task.audioUrl && (
            <div>
              <h3 className="text-sm font-medium text-slate-500 mb-2">🎙 صوت</h3>
              <audio controls src={task.audioUrl} className="w-full" />
            </div>
          )}

          {/* Note */}
          {task.note && (
            <div>
              <h3 className="text-sm font-medium text-slate-500 mb-2">📝 یادداشت</h3>
              <div className="bg-amber-50 rounded-xl p-4 text-sm text-slate-700 leading-7 border border-amber-100">
                {task.note}
              </div>
            </div>
          )}

          {/* Forward Info */}
          {task.forwardedTo && (
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
              <h3 className="text-sm font-medium text-blue-700 mb-2">📤 ارجاع شده</h3>
              <p className="text-sm text-slate-700">
                <strong>به:</strong> {task.forwardedTo}
              </p>
              {task.forwardedNote && (
                <p className="text-sm text-slate-600 mt-1">
                  <strong>توضیح:</strong> {task.forwardedNote}
                </p>
              )}
              {task.forwardedAt && (
                <p className="text-xs text-slate-400 mt-2">
                  تاریخ ارجاع: {new Date(task.forwardedAt).toLocaleDateString("fa-IR")}
                </p>
              )}
            </div>
          )}

          {/* Dates */}
          <div className="flex gap-6 text-xs text-slate-400 pt-4 border-t border-slate-100">
            <span>
              ایجاد: {new Date(task.createdAt).toLocaleDateString("fa-IR")}
            </span>
            <span>
              بروزرسانی: {new Date(task.updatedAt).toLocaleDateString("fa-IR")}
            </span>
          </div>
        </div>

        <div className="p-6 pt-0">
          <button
            onClick={onClose}
            className="w-full py-3 bg-slate-100 text-slate-600 rounded-xl font-medium text-sm hover:bg-slate-200 transition-colors cursor-pointer"
          >
            بستن
          </button>
        </div>
      </div>
    </div>
  );
}
