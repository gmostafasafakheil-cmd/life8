"use client";

import type { Task, Category } from "@/types";
import { toPersianDigits } from "@/lib/jalali";

interface Props {
  task: Task;
  categories: Category[];
  onToggle: (id: number, completed: boolean) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: number) => void;
  onDetail: (task: Task) => void;
  onForward: (task: Task) => void;
}

const priorityConfig = {
  high: { label: "فوری", bg: "bg-red-50", border: "border-red-200", badge: "bg-red-500", text: "text-red-700", dot: "bg-red-500" },
  medium: { label: "متوسط", bg: "bg-amber-50", border: "border-amber-200", badge: "bg-amber-500", text: "text-amber-700", dot: "bg-amber-500" },
  low: { label: "عادی", bg: "bg-emerald-50", border: "border-emerald-200", badge: "bg-emerald-500", text: "text-emerald-700", dot: "bg-emerald-500" },
};

export default function TaskCard({
  task,
  categories,
  onToggle,
  onEdit,
  onDelete,
  onDetail,
  onForward,
}: Props) {
  const pConfig = priorityConfig[task.priority as keyof typeof priorityConfig] || priorityConfig.medium;
  const cat = categories.find((c) => c.value === task.category);

  return (
    <div
      className={`bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden card-hover group ${
        task.completed ? "opacity-75" : ""
      }`}
    >
      {/* Priority Strip */}
      <div className={`h-1 ${pConfig.badge}`} />

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <button
              onClick={() => onToggle(task.id, task.completed)}
              className={`mt-0.5 w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all cursor-pointer ${
                task.completed
                  ? "bg-emerald-500 border-emerald-500 text-white"
                  : "border-slate-300 hover:border-primary"
              }`}
            >
              {task.completed && (
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
            <div className="flex-1 min-w-0">
              <h3
                className={`font-bold text-sm leading-6 cursor-pointer hover:text-primary transition-colors ${
                  task.completed ? "line-through text-slate-400" : "text-slate-800"
                }`}
                onClick={() => onDetail(task)}
              >
                {task.title}
              </h3>
              {task.description && (
                <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-5">
                  {task.description}
                </p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onDetail(task)}
              className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer text-xs"
              title="جزئیات"
            >
              👁
            </button>
            <button
              onClick={() => onEdit(task)}
              className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors cursor-pointer text-xs"
              title="ویرایش"
            >
              ✏️
            </button>
            <button
              onClick={() => onForward(task)}
              className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-cyan-50 text-slate-400 hover:text-cyan-600 transition-colors cursor-pointer text-xs"
              title="ارجاع"
            >
              📤
            </button>
            <button
              onClick={() => onDelete(task.id)}
              className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors cursor-pointer text-xs"
              title="حذف"
            >
              🗑
            </button>
          </div>
        </div>

        {/* Attachments indicator */}
        {(task.imageUrl || task.audioUrl || task.note) && (
          <div className="flex items-center gap-2 mb-3">
            {task.imageUrl && <span className="text-xs bg-slate-50 px-2 py-0.5 rounded-md">📷</span>}
            {task.audioUrl && <span className="text-xs bg-slate-50 px-2 py-0.5 rounded-md">🎙</span>}
            {task.note && <span className="text-xs bg-slate-50 px-2 py-0.5 rounded-md">📝</span>}
          </div>
        )}

        {/* Forward indicator */}
        {task.forwardedTo && (
          <div className="mb-3 flex items-center gap-1 text-xs text-blue-600 bg-blue-50 rounded-lg px-2 py-1 w-fit">
            <span>📤</span>
            <span>ارجاع به: {task.forwardedTo}</span>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Priority badge */}
            <span className={`px-2 py-0.5 rounded-md text-[10px] font-medium ${pConfig.bg} ${pConfig.text} border ${pConfig.border}`}>
              {pConfig.label}
            </span>

            {/* Category badge */}
            {cat && (
              <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-purple-50 text-purple-600 border border-purple-200">
                {cat.icon} {cat.label}
              </span>
            )}
          </div>

          {/* Date */}
          {task.dueDate && (
            <span className="text-[10px] text-slate-400 flex items-center gap-1">
              📅 {toPersianDigits(task.dueDate)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
