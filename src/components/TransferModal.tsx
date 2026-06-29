"use client";

import { useState } from "react";
import type { Task } from "@/types";
import JalaliDatePicker from "./JalaliDatePicker";
import { toPersianDigits } from "@/lib/jalali";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (newDate: string) => Promise<boolean>;
  task: Task | null;
}

export default function TransferModal({ isOpen, onClose, onSubmit, task }: Props) {
  const [newDate, setNewDate] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen || !task) return null;

  const handleSubmit = async () => {
    if (!newDate) return;
    setSubmitting(true);
    const success = await onSubmit(newDate);
    setSubmitting(false);
    if (success) {
      setNewDate("");
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 modal-backdrop animate-fade-in overflow-y-auto"
      onClick={onClose}
    >
      <div className="min-h-full flex items-start sm:items-center justify-center py-8 px-4">
        <div
          className="bg-white rounded-3xl shadow-2xl w-full max-w-sm animate-slide-up"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-gradient-to-l from-orange-500 to-amber-500 p-5 rounded-t-3xl">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                📅 انتقال وظیفه
              </h2>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>
          </div>

          <div className="p-5 space-y-4">
            {/* Task info */}
            <div className="bg-slate-50 rounded-xl p-3">
              <p className="text-xs text-slate-500 mb-1">وظیفه:</p>
              <p className="text-sm font-medium text-slate-800">{task.title}</p>
              {task.dueDate && (
                <p className="text-xs text-slate-400 mt-1">
                  تاریخ فعلی: {toPersianDigits(task.dueDate)}
                </p>
              )}
            </div>

            {/* New date picker */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-3">
                تاریخ جدید را انتخاب کنید:
              </label>

              <div className="flex justify-center">
                <JalaliDatePicker
                  value={newDate}
                  onChange={(val) => setNewDate(val)}
                />
              </div>

              {newDate && (
                <div className="mt-3 text-center">
                  <span className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-700 rounded-xl text-sm font-medium">
                    📅 {toPersianDigits(newDate)}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="p-5 pt-0 flex gap-3">
            <button
              onClick={handleSubmit}
              disabled={!newDate || submitting}
              className="flex-1 py-3 bg-gradient-to-l from-orange-500 to-amber-500 text-white rounded-xl font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
            >
              {submitting ? "در حال انتقال..." : "انتقال وظیفه"}
            </button>
            <button
              onClick={onClose}
              className="px-6 py-3 bg-slate-100 text-slate-600 rounded-xl font-medium text-sm hover:bg-slate-200 transition-colors cursor-pointer"
            >
              انصراف
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
