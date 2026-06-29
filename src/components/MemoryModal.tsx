"use client";

import { useState, useRef, useEffect } from "react";
import type { Memory } from "@/types";
import JalaliDatePicker from "./JalaliDatePicker";
import { toJalaali, jalaaliDateString, toPersianDigits } from "@/lib/jalali";
import { saveFileLocally } from "@/lib/localdb";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Memory>) => Promise<boolean>;
  memory?: Memory | null;
}

const moods = [
  { value: "happy", label: "شاد", icon: "😊" },
  { value: "calm", label: "آرام", icon: "😌" },
  { value: "excited", label: "هیجان‌زده", icon: "🤩" },
  { value: "sad", label: "غمگین", icon: "😢" },
  { value: "angry", label: "عصبانی", icon: "😡" },
  { value: "thankful", label: "سپاسگزار", icon: "🙏" },
  { value: "love", label: "عاشقانه", icon: "❤️" },
  { value: "thinking", label: "متفکر", icon: "🤔" },
];

export default function MemoryModal({ isOpen, onClose, onSubmit, memory }: Props) {
  const today = toJalaali(new Date());
  const todayStr = jalaaliDateString(today.jy, today.jm, today.jd);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [mood, setMood] = useState("");
  const [date, setDate] = useState(todayStr);
  const [imageUrl, setImageUrl] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
  const [showCalendar, setShowCalendar] = useState(false);
  const [showAttachments, setShowAttachments] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (memory) {
      setTitle(memory.title);
      setContent(memory.content || "");
      setMood(memory.mood || "");
      setDate(memory.date || todayStr);
      setImageUrl(memory.imageUrl || "");
      setAudioUrl(memory.audioUrl || "");
    } else {
      setTitle("");
      setContent("");
      setMood("");
      setDate(todayStr);
      setImageUrl("");
      setAudioUrl("");
    }
    setShowAttachments(false);
  }, [memory, isOpen, todayStr]);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!title.trim()) return;
    setSubmitting(true);
    const success = await onSubmit({ title, content, mood, date, imageUrl, audioUrl });
    setSubmitting(false);
    if (success) onClose();
  };

  const handleFileUpload = async (file: File, type: "image" | "audio") => {
    setUploading(true);
    try {
      const dataUrl = await saveFileLocally(file);
      if (type === "image") setImageUrl(dataUrl);
      else setAudioUrl(dataUrl);
    } catch (err) {
      console.error("Upload error:", err);
    }
    setUploading(false);
  };

  return (
    <div className="fixed inset-0 z-50 modal-backdrop animate-fade-in overflow-y-auto" onClick={onClose}>
      <div className="min-h-full flex items-start sm:items-center justify-center py-8 px-4">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg animate-slide-up" onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <div className="bg-gradient-to-l from-pink-500 to-rose-500 p-5 rounded-t-3xl">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">{memory ? "✏️ ویرایش خاطره" : "✨ خاطره جدید"}</h2>
              <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors cursor-pointer">✕</button>
            </div>
          </div>

          <div className="p-5 space-y-4">
            {/* تاریخ */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">📅 تاریخ</label>
              <div className="relative">
                <button onClick={() => setShowCalendar(!showCalendar)} className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 text-right text-sm hover:border-pink-400 transition-colors cursor-pointer flex items-center justify-between bg-slate-50">
                  <span className="text-slate-700 font-medium">{toPersianDigits(date)}</span>
                  <span className="text-lg">📆</span>
                </button>
                {showCalendar && (
                  <div className="absolute top-full mt-2 z-50 right-0">
                    <JalaliDatePicker value={date} onChange={(val) => { setDate(val); setShowCalendar(false); }} onClose={() => setShowCalendar(false)} />
                  </div>
                )}
              </div>
            </div>

            {/* حال و هوا */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">😊 حال و هوا</label>
              <div className="grid grid-cols-4 gap-2">
                {moods.map((m) => (
                  <button
                    key={m.value}
                    onClick={() => setMood(mood === m.value ? "" : m.value)}
                    className={`flex flex-col items-center gap-1 p-2 rounded-xl border-2 transition-all cursor-pointer ${
                      mood === m.value ? "border-pink-400 bg-pink-50 ring-2 ring-pink-200" : "border-slate-200 bg-slate-50 hover:border-slate-300"
                    }`}
                  >
                    <span className="text-xl">{m.icon}</span>
                    <span className={`text-[10px] font-medium ${mood === m.value ? "text-pink-600" : "text-slate-500"}`}>{m.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* عنوان */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">✏️ عنوان خاطره <span className="text-red-400">*</span></label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="عنوان خاطره..." className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-200 outline-none transition-all text-sm bg-slate-50" />
            </div>

            {/* محتوا */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">📝 شرح خاطره</label>
              <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="خاطره خود را بنویسید..." rows={5} className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-200 outline-none transition-all text-sm resize-none bg-slate-50 leading-7" />
            </div>

            {/* پیوست‌ها */}
            <div>
              <button onClick={() => setShowAttachments(!showAttachments)} className="w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 border-dashed border-slate-300 hover:border-pink-400 hover:bg-pink-50/50 transition-all cursor-pointer">
                <div className="flex items-center gap-2">
                  <span className="text-lg">📎</span>
                  <span className="text-sm font-medium text-slate-600">پیوست‌ها</span>
                  {(imageUrl || audioUrl) && <span className="text-xs bg-pink-100 text-pink-600 px-2 py-0.5 rounded-full">{[imageUrl, audioUrl].filter(Boolean).length} فایل</span>}
                </div>
                <svg className={`w-4 h-4 text-slate-400 transition-transform ${showAttachments ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
              </button>
              {showAttachments && (
                <div className="mt-3 p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-4 animate-fade-in">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-slate-600">📷 تصویر</span>
                      {imageUrl && <button onClick={() => setImageUrl("")} className="text-xs text-red-500 hover:text-red-700 cursor-pointer">حذف</button>}
                    </div>
                    {imageUrl ? (
                      <div className="rounded-xl overflow-hidden border border-slate-200"><img src={imageUrl} alt="پیش‌نمایش" className="w-full max-h-32 object-cover" /></div>
                    ) : (
                      <button onClick={() => imageInputRef.current?.click()} className="w-full py-3 border-2 border-dashed border-slate-300 rounded-xl text-xs text-slate-500 hover:border-pink-400 hover:text-pink-500 transition-colors cursor-pointer">+ آپلود تصویر</button>
                    )}
                    <input ref={imageInputRef} type="file" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileUpload(f, "image"); }} className="hidden" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-slate-600">🎙 صوت</span>
                      {audioUrl && <button onClick={() => setAudioUrl("")} className="text-xs text-red-500 hover:text-red-700 cursor-pointer">حذف</button>}
                    </div>
                    {audioUrl ? (
                      <audio controls src={audioUrl} className="w-full" />
                    ) : (
                      <button onClick={() => audioInputRef.current?.click()} className="w-full py-3 border-2 border-dashed border-slate-300 rounded-xl text-xs text-slate-500 hover:border-pink-400 hover:text-pink-500 transition-colors cursor-pointer">+ آپلود صوت</button>
                    )}
                    <input ref={audioInputRef} type="file" accept="audio/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileUpload(f, "audio"); }} className="hidden" />
                  </div>
                  {uploading && <div className="text-xs text-pink-600 flex items-center gap-2 justify-center py-2"><span className="animate-spin">⏳</span> در حال آپلود...</div>}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="p-5 pt-0 flex gap-3">
            <button onClick={handleSubmit} disabled={!title.trim() || submitting} className="flex-1 py-3 bg-gradient-to-l from-pink-500 to-rose-500 text-white rounded-xl font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer shadow-lg shadow-pink-500/20">
              {submitting ? "در حال ذخیره..." : memory ? "ذخیره تغییرات" : "ثبت خاطره"}
            </button>
            <button onClick={onClose} className="px-6 py-3 bg-slate-100 text-slate-600 rounded-xl font-medium text-sm hover:bg-slate-200 transition-colors cursor-pointer">انصراف</button>
          </div>
        </div>
      </div>
    </div>
  );
}
