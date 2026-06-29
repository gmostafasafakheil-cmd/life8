"use client";

import { useState } from "react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { value: string; label: string; icon: string }) => Promise<boolean>;
}

const icons = ["📁", "💪", "🧘", "🎯", "🏠", "✈️", "🎨", "🎮", "🍔", "⚽", "🎵", "💡", "📱", "💻", "🔧", "📧", "🧠", "💊", "🌿", "🐾"];

export default function SectionModal({ isOpen, onClose, onSubmit }: Props) {
  const [label, setLabel] = useState("");
  const [icon, setIcon] = useState("📁");
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!label.trim()) return;
    setSubmitting(true);
    const value = label.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9\u0600-\u06FF-]/g, "") || `sec-${Date.now()}`;
    const success = await onSubmit({ value, label: label.trim(), icon });
    setSubmitting(false);
    if (success) { setLabel(""); setIcon("📁"); onClose(); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center modal-backdrop animate-fade-in" onClick={onClose}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md mx-4 animate-slide-up" onClick={(e) => e.stopPropagation()}>
        <div className="bg-gradient-to-l from-slate-600 to-slate-700 p-5 rounded-t-3xl">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">➕ بخش جدید</h2>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30 cursor-pointer">✕</button>
          </div>
        </div>
        <div className="p-5 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-3">انتخاب آیکون</label>
            <div className="grid grid-cols-10 gap-2">
              {icons.map((em) => (
                <button key={em} onClick={() => setIcon(em)} className={`w-9 h-9 flex items-center justify-center rounded-xl text-lg transition-all cursor-pointer ${icon === em ? "bg-primary/10 ring-2 ring-primary scale-110" : "bg-slate-50 hover:bg-slate-100"}`}>{em}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">نام بخش *</label>
            <div className="flex items-center gap-3">
              <span className="w-12 h-12 flex items-center justify-center bg-slate-100 rounded-xl text-2xl">{icon}</span>
              <input type="text" value={label} onChange={(e) => setLabel(e.target.value)} placeholder="مثال: مدیتیشن، مالی، سفر..." className="flex-1 px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm" onKeyDown={(e) => e.key === "Enter" && handleSubmit()} />
            </div>
          </div>
        </div>
        <div className="p-5 pt-0 flex gap-3">
          <button onClick={handleSubmit} disabled={!label.trim() || submitting} className="flex-1 py-3 bg-gradient-to-l from-primary to-secondary text-white rounded-xl font-medium text-sm hover:opacity-90 disabled:opacity-50 cursor-pointer">{submitting ? "در حال ذخیره..." : "افزودن بخش"}</button>
          <button onClick={onClose} className="px-6 py-3 bg-slate-100 text-slate-600 rounded-xl text-sm hover:bg-slate-200 cursor-pointer">انصراف</button>
        </div>
      </div>
    </div>
  );
}
