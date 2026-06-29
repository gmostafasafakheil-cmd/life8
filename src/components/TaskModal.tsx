"use client";

import { useState, useRef, useEffect } from "react";
import type { Task, TaskFormData, Category, Priority } from "@/types";
import JalaliDatePicker from "./JalaliDatePicker";
import { toJalaali, jalaaliDateString, toPersianDigits } from "@/lib/jalali";
import { saveFileLocally } from "@/lib/localdb";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: TaskFormData) => Promise<boolean>;
  categories: Category[];
  task?: Task | null;
}

const priorities: { value: Priority; label: string; color: string; icon: string }[] = [
  { value: "high", label: "فوری", color: "bg-red-100 text-red-700 border-red-300 ring-red-400", icon: "🔴" },
  { value: "medium", label: "متوسط", color: "bg-amber-100 text-amber-700 border-amber-300 ring-amber-400", icon: "🟡" },
  { value: "low", label: "عادی", color: "bg-emerald-100 text-emerald-700 border-emerald-300 ring-emerald-400", icon: "🟢" },
];

export default function TaskModal({ isOpen, onClose, onSubmit, categories, task }: Props) {
  // Get today as default
  const today = toJalaali(new Date());
  const todayStr = jalaaliDateString(today.jy, today.jm, today.jd);

  const [dueDate, setDueDate] = useState(todayStr);
  const [category, setCategory] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [note, setNote] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");

  const [showCalendar, setShowCalendar] = useState(false);
  const [showCategories, setShowCategories] = useState(false);
  const [showAttachments, setShowAttachments] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [recording, setRecording] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (task) {
      setDueDate(task.dueDate || todayStr);
      setCategory(task.category || "");
      setPriority(task.priority as Priority);
      setTitle(task.title);
      setDescription(task.description || "");
      setNote(task.note || "");
      setImageUrl(task.imageUrl || "");
      setAudioUrl(task.audioUrl || "");
      setVideoUrl("");
    } else {
      setDueDate(todayStr);
      setCategory("");
      setPriority("medium");
      setTitle("");
      setDescription("");
      setNote("");
      setImageUrl("");
      setAudioUrl("");
      setVideoUrl("");
    }
    setShowAttachments(false);
    setShowCategories(false);
  }, [task, isOpen, todayStr]);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!title.trim()) return;
    setSubmitting(true);
    const success = await onSubmit({
      title,
      description,
      priority,
      category,
      dueDate,
      note,
      imageUrl,
      audioUrl,
    });
    setSubmitting(false);
    if (success) onClose();
  };

  const handleFileUpload = async (file: File, type: "image" | "video" | "audio") => {
    setUploading(true);
    try {
      const dataUrl = await saveFileLocally(file);
      if (type === "image") setImageUrl(dataUrl);
      else if (type === "video") setVideoUrl(dataUrl);
      else if (type === "audio") setAudioUrl(dataUrl);
    } catch (err) {
      console.error("Upload error:", err);
    }
    setUploading(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileUpload(file, "image");
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileUpload(file, "video");
  };

  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileUpload(file, "audio");
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      mediaRecorder.ondataavailable = (event) => audioChunksRef.current.push(event.data);
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        await handleFileUpload(new File([audioBlob], `recording-${Date.now()}.webm`), "audio");
        stream.getTracks().forEach((track) => track.stop());
      };
      mediaRecorder.start();
      setRecording(true);
    } catch (err) {
      console.error("Recording error:", err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  };

  const hasAttachments = imageUrl || videoUrl || audioUrl || note;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center modal-backdrop animate-fade-in" onClick={onClose}>
      <div
        className="bg-white rounded-3xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-l from-primary to-secondary p-5 rounded-t-3xl">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              {task ? "✏️ ویرایش وظیفه" : "➕ وظیفه جدید"}
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

          {/* 1. تاریخ */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">📅 تاریخ سررسید</label>
            <div className="relative">
              <button
                onClick={() => setShowCalendar(!showCalendar)}
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 text-right text-sm hover:border-primary transition-colors cursor-pointer flex items-center justify-between bg-slate-50"
              >
                <span className="text-slate-700 font-medium">{toPersianDigits(dueDate)}</span>
                <span className="text-lg">📆</span>
              </button>
              {showCalendar && (
                <div className="absolute top-full mt-2 z-50 right-0">
                  <JalaliDatePicker
                    value={dueDate}
                    onChange={(val) => { setDueDate(val); setShowCalendar(false); }}
                    onClose={() => setShowCalendar(false)}
                  />
                </div>
              )}
            </div>
          </div>

          {/* 2. دسته‌بندی امور - کشویی */}
          <div>
            <button
              onClick={() => setShowCategories(!showCategories)}
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 border-slate-200 hover:border-primary transition-all cursor-pointer bg-slate-50"
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">📂</span>
                <span className="text-sm font-semibold text-slate-700">دسته‌بندی امور</span>
                {category && (
                  <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                    {categories.find((c) => c.value === category)?.icon} {categories.find((c) => c.value === category)?.label}
                  </span>
                )}
              </div>
              <svg className={`w-4 h-4 text-slate-400 transition-transform ${showCategories ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {showCategories && (
              <div className="mt-3 p-4 bg-slate-50 rounded-xl border border-slate-200 animate-fade-in">
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => { setCategory(""); setShowCategories(false); }}
                    className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all cursor-pointer ${
                      category === "" ? "border-primary bg-primary/5 ring-2 ring-primary/20" : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    <span className="text-lg">📁</span>
                    <span className={`text-xs font-medium ${category === "" ? "text-primary" : "text-slate-500"}`}>بدون دسته</span>
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => { setCategory(cat.value); setShowCategories(false); }}
                      className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all cursor-pointer ${
                        category === cat.value ? "border-primary bg-primary/5 ring-2 ring-primary/20" : "border-slate-200 bg-white hover:border-slate-300"
                      }`}
                    >
                      <span className="text-lg">{cat.icon}</span>
                      <span className={`text-xs font-medium truncate w-full text-center ${category === cat.value ? "text-primary" : "text-slate-500"}`}>{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 3. اولویت */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">⚡ اولویت وظیفه</label>
            <div className="grid grid-cols-3 gap-2">
              {priorities.map((p) => (
                <button
                  key={p.value}
                  onClick={() => setPriority(p.value)}
                  className={`flex items-center justify-center gap-2 py-3 px-3 rounded-xl border-2 text-sm font-medium transition-all cursor-pointer ${
                    priority === p.value ? `${p.color} ring-2` : "bg-slate-50 text-slate-500 border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <span>{p.icon}</span>
                  <span>{p.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 4. عنوان */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">✏️ عنوان وظیفه <span className="text-red-400">*</span></label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="عنوان وظیفه را وارد کنید..."
              className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm bg-slate-50"
            />
          </div>

          {/* 5. توضیحات */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">📝 توضیحات</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="توضیحات وظیفه..."
              rows={3}
              className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm resize-none bg-slate-50"
            />
          </div>

          {/* 6. پیوست‌ها */}
          <div>
            <button
              onClick={() => setShowAttachments(!showAttachments)}
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 border-dashed border-slate-300 hover:border-primary hover:bg-primary/5 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">📎</span>
                <span className="text-sm font-medium text-slate-600">پیوست‌ها</span>
                {hasAttachments && (
                  <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                    {[imageUrl, videoUrl, audioUrl, note].filter(Boolean).length} فایل
                  </span>
                )}
              </div>
              <svg className={`w-4 h-4 text-slate-400 transition-transform ${showAttachments ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {showAttachments && (
              <div className="mt-3 p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-4 animate-fade-in">

                {/* تصویر */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-slate-600 flex items-center gap-1">📷 تصویر</span>
                    {imageUrl && (
                      <button onClick={() => setImageUrl("")} className="text-xs text-red-500 hover:text-red-700 cursor-pointer">حذف</button>
                    )}
                  </div>
                  {imageUrl ? (
                    <div className="rounded-xl overflow-hidden border border-slate-200">
                      <img src={imageUrl} alt="پیش‌نمایش" className="w-full max-h-32 object-cover" />
                    </div>
                  ) : (
                    <button
                      onClick={() => imageInputRef.current?.click()}
                      className="w-full py-3 border-2 border-dashed border-slate-300 rounded-xl text-xs text-slate-500 hover:border-primary hover:text-primary transition-colors cursor-pointer"
                    >
                      + آپلود تصویر
                    </button>
                  )}
                  <input ref={imageInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </div>

                {/* ویدیو */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-slate-600 flex items-center gap-1">🎬 ویدیو</span>
                    {videoUrl && (
                      <button onClick={() => setVideoUrl("")} className="text-xs text-red-500 hover:text-red-700 cursor-pointer">حذف</button>
                    )}
                  </div>
                  {videoUrl ? (
                    <div className="rounded-xl overflow-hidden border border-slate-200">
                      <video src={videoUrl} controls className="w-full max-h-32" />
                    </div>
                  ) : (
                    <button
                      onClick={() => videoInputRef.current?.click()}
                      className="w-full py-3 border-2 border-dashed border-slate-300 rounded-xl text-xs text-slate-500 hover:border-primary hover:text-primary transition-colors cursor-pointer"
                    >
                      + آپلود ویدیو
                    </button>
                  )}
                  <input ref={videoInputRef} type="file" accept="video/*" onChange={handleVideoUpload} className="hidden" />
                </div>

                {/* صوت */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-slate-600 flex items-center gap-1">🎙 صوت</span>
                    {audioUrl && (
                      <button onClick={() => setAudioUrl("")} className="text-xs text-red-500 hover:text-red-700 cursor-pointer">حذف</button>
                    )}
                  </div>
                  {audioUrl ? (
                    <audio controls src={audioUrl} className="w-full" />
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={recording ? stopRecording : startRecording}
                        className={`flex-1 py-3 border-2 border-dashed rounded-xl text-xs transition-colors cursor-pointer ${
                          recording ? "border-red-400 text-red-600 bg-red-50" : "border-slate-300 text-slate-500 hover:border-primary hover:text-primary"
                        }`}
                      >
                        {recording ? "⏹ توقف ضبط" : "🎙 ضبط صدا"}
                      </button>
                      <button
                        onClick={() => audioInputRef.current?.click()}
                        className="flex-1 py-3 border-2 border-dashed border-slate-300 rounded-xl text-xs text-slate-500 hover:border-primary hover:text-primary transition-colors cursor-pointer"
                      >
                        📁 آپلود فایل
                      </button>
                    </div>
                  )}
                  <input ref={audioInputRef} type="file" accept="audio/*" onChange={handleAudioUpload} className="hidden" />
                </div>

                {/* یادداشت */}
                <div>
                  <span className="text-xs font-semibold text-slate-600 flex items-center gap-1 mb-2">📝 یادداشت</span>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="یادداشت خود را بنویسید..."
                    rows={2}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none transition-all text-xs resize-none"
                  />
                </div>

                {uploading && (
                  <div className="text-xs text-primary flex items-center gap-2 justify-center py-2">
                    <span className="animate-spin">⏳</span> در حال آپلود...
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 pt-0 flex gap-3">
          <button
            onClick={handleSubmit}
            disabled={!title.trim() || submitting}
            className="flex-1 py-3 bg-gradient-to-l from-primary to-secondary text-white rounded-xl font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer shadow-lg shadow-primary/20"
          >
            {submitting ? "در حال ذخیره..." : task ? "ذخیره تغییرات" : "ایجاد وظیفه"}
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
