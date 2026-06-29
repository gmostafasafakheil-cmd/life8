"use client";

import { useState } from "react";
import type { Task, ForwardData } from "@/types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ForwardData) => Promise<boolean>;
  task: Task | null;
}

export default function ForwardModal({ isOpen, onClose, onSubmit, task }: Props) {
  const [forwardedTo, setForwardedTo] = useState("");
  const [forwardedNote, setForwardedNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen || !task) return null;

  const handleSubmit = async () => {
    if (!forwardedTo.trim()) return;
    setSubmitting(true);
    const success = await onSubmit({ forwardedTo, forwardedNote });
    setSubmitting(false);
    if (success) {
      setForwardedTo("");
      setForwardedNote("");
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center modal-backdrop animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md mx-4 animate-slide-up">
        <div className="bg-gradient-to-l from-blue-500 to-cyan-500 p-6 rounded-t-3xl">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">📤 ارجاع وظیفه</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div className="bg-slate-50 rounded-xl p-3">
            <p className="text-xs text-slate-500 mb-1">وظیفه:</p>
            <p className="text-sm font-medium text-slate-800">{task.title}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-600 mb-2">ارجاع به *</label>
            <input
              type="text"
              value={forwardedTo}
              onChange={(e) => setForwardedTo(e.target.value)}
              placeholder="نام شخص یا تیم..."
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-600 mb-2">توضیحات ارجاع</label>
            <textarea
              value={forwardedNote}
              onChange={(e) => setForwardedNote(e.target.value)}
              placeholder="توضیحات ارجاع را بنویسید..."
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-sm resize-none"
            />
          </div>
        </div>

        <div className="p-6 pt-0 flex gap-3">
          <button
            onClick={handleSubmit}
            disabled={!forwardedTo.trim() || submitting}
            className="flex-1 py-3 bg-gradient-to-l from-blue-500 to-cyan-500 text-white rounded-xl font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
          >
            {submitting ? "در حال ارجاع..." : "ارجاع وظیفه"}
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
  );
}
