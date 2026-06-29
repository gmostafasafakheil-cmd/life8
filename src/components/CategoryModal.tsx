"use client";

import { useState } from "react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { value: string; label: string; icon: string }) => Promise<boolean>;
}

const emojiOptions = ["📁", "💼", "👤", "📚", "🏥", "🛒", "💰", "🎯", "🏠", "✈️", "🎨", "🎮", "🍔", "⚽", "🎵", "💡", "📱", "💻", "🔧", "📧"];

export default function CategoryModal({ isOpen, onClose, onSubmit }: Props) {
  const [label, setLabel] = useState("");
  const [icon, setIcon] = useState("📁");
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!label.trim()) return;
    setSubmitting(true);
    const value = label.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9\u0600-\u06FF-]/g, "");
    const success = await onSubmit({ value: value || `cat-${Date.now()}`, label: label.trim(), icon });
    setSubmitting(false);
    if (success) {
      setLabel("");
      setIcon("📁");
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center modal-backdrop animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md mx-4 animate-slide-up">
        <div className="bg-gradient-to-l from-purple-500 to-pink-500 p-6 rounded-t-3xl">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">📂 دسته‌بندی جدید</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {/* Icon Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-3">انتخاب آیکون</label>
            <div className="grid grid-cols-10 gap-2">
              {emojiOptions.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => setIcon(emoji)}
                  className={`w-9 h-9 flex items-center justify-center rounded-xl text-lg transition-all cursor-pointer ${
                    icon === emoji
                      ? "bg-purple-100 ring-2 ring-purple-500 scale-110"
                      : "bg-slate-50 hover:bg-slate-100"
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Label */}
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-2">نام دسته‌بندی *</label>
            <div className="flex items-center gap-3">
              <span className="w-12 h-12 flex items-center justify-center bg-purple-50 rounded-xl text-2xl">
                {icon}
              </span>
              <input
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="مثال: پروژه‌ها، ورزش، سفر..."
                className="flex-1 px-4 py-3 rounded-xl border border-slate-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all text-sm"
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              />
            </div>
          </div>

          {/* Preview */}
          {label && (
            <div className="bg-slate-50 rounded-xl p-4">
              <p className="text-xs text-slate-400 mb-2">پیش‌نمایش:</p>
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-xl text-sm font-medium">
                {icon} {label}
              </span>
            </div>
          )}
        </div>

        <div className="p-6 pt-0 flex gap-3">
          <button
            onClick={handleSubmit}
            disabled={!label.trim() || submitting}
            className="flex-1 py-3 bg-gradient-to-l from-purple-500 to-pink-500 text-white rounded-xl font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
          >
            {submitting ? "در حال ذخیره..." : "افزودن دسته‌بندی"}
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
