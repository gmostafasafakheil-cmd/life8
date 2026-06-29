"use client";

import { useState } from "react";
import { useEntries } from "@/hooks/useEntries";
import type { LifeSection } from "@/types";
import DeleteConfirmModal from "@/components/DeleteConfirmModal";
import JalaliDatePicker from "@/components/JalaliDatePicker";
import { toPersianDigits, formatJalaaliPersian, getPersianWeekDayName, toJalaali, jalaaliDateString } from "@/lib/jalali";

interface Props {
  section: LifeSection;
}

export default function SectionView({ section }: Props) {
  const { entries, loading, createEntry, updateEntry, deleteEntry, toggleComplete } = useEntries(section.value);

  const now = new Date();
  const todayPersian = formatJalaaliPersian(now);
  const todayWeekDay = getPersianWeekDayName(now);
  const todayJ = toJalaali(now);
  const todayStr = jalaaliDateString(todayJ.jy, todayJ.jm, todayJ.jd);

  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [date, setDate] = useState(todayStr);
  const [showCal, setShowCal] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const openNew = () => { setEditId(null); setTitle(""); setContent(""); setDate(todayStr); setShowForm(true); };
  const openEdit = (e: typeof entries[0]) => { setEditId(e.id); setTitle(e.title); setContent(e.content); setDate(e.date || todayStr); setShowForm(true); };

  const handleSubmit = async () => {
    if (!title.trim()) return;
    setSubmitting(true);
    if (editId) {
      await updateEntry(editId, { title, content, date });
    } else {
      await createEntry({ title, content, date });
    }
    setSubmitting(false);
    setShowForm(false);
    setTitle(""); setContent(""); setEditId(null);
  };

  const handleDelete = async () => {
    if (deletingId === null) return;
    await deleteEntry(deletingId);
    setDeletingId(null);
  };

  // Color map per section
  const colorMap: Record<string, { from: string; to: string; light: string }> = {
    health: { from: "from-red-500", to: "to-rose-500", light: "bg-red-50" },
    nutrition: { from: "from-lime-500", to: "to-green-500", light: "bg-lime-50" },
    exercise: { from: "from-orange-500", to: "to-amber-500", light: "bg-orange-50" },
    learning: { from: "from-blue-500", to: "to-indigo-500", light: "bg-blue-50" },
    reading: { from: "from-violet-500", to: "to-purple-500", light: "bg-violet-50" },
  };
  const c = colorMap[section.value] || { from: "from-slate-500", to: "to-slate-600", light: "bg-slate-50" };

  return (
    <div className="flex-1 min-w-0 main-content">
      {/* Hero */}
      <div className={`relative overflow-hidden bg-gradient-to-l ${c.from} ${c.to} shadow-xl`}>
        <div className="absolute -top-20 -left-20 w-72 h-72 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-16 -right-16 w-60 h-60 bg-yellow-300/10 rounded-full blur-3xl" />

        <div className="relative px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-amber-200 drop-shadow-lg flex items-center gap-3" style={{ textShadow: "0 2px 12px rgba(251,191,36,0.3)" }}>
                <span className="text-3xl">{section.icon}</span>
                {section.label}
              </h2>
              <div className="flex items-center gap-3 mt-1.5">
                <span className="text-white/70 text-sm font-medium">{todayWeekDay}،</span>
                <span className="text-amber-200/90 text-sm font-bold">{todayPersian}</span>
                <span className="text-white/40 text-sm">•</span>
                <span className="text-white/60 text-sm">{toPersianDigits(String(entries.length))} مورد</span>
              </div>
            </div>
            <button
              onClick={openNew}
              className="hidden sm:flex items-center gap-2 px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-900 rounded-xl text-sm font-bold transition-colors shadow-lg cursor-pointer"
            >
              <span className="text-lg">+</span>
              مورد جدید
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 sm:px-6 lg:px-8 py-5">
        {/* Inline Form */}
        {showForm && (
          <div className="mb-5 bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4 animate-fade-in">
            <h3 className="text-sm font-bold text-slate-700">{editId ? "✏️ ویرایش" : `➕ مورد جدید در ${section.label}`}</h3>

            <div className="relative">
              <button onClick={() => setShowCal(!showCal)} className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 text-right text-sm hover:border-primary transition-colors cursor-pointer flex items-center justify-between bg-slate-50">
                <span className="text-slate-700 font-medium">📅 {toPersianDigits(date)}</span>
                <span>📆</span>
              </button>
              {showCal && (
                <div className="absolute top-full mt-2 z-50 right-0">
                  <JalaliDatePicker value={date} onChange={(val) => { setDate(val); setShowCal(false); }} onClose={() => setShowCal(false)} />
                </div>
              )}
            </div>

            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="عنوان..." className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm bg-slate-50" />

            <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="توضیحات..." rows={3} className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm resize-none bg-slate-50" />

            <div className="flex gap-3">
              <button onClick={handleSubmit} disabled={!title.trim() || submitting} className={`flex-1 py-2.5 bg-gradient-to-l ${c.from} ${c.to} text-white rounded-xl font-medium text-sm hover:opacity-90 disabled:opacity-50 cursor-pointer`}>
                {submitting ? "در حال ذخیره..." : editId ? "ذخیره تغییرات" : "ثبت"}
              </button>
              <button onClick={() => setShowForm(false)} className="px-6 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-sm cursor-pointer hover:bg-slate-200">انصراف</button>
            </div>
          </div>
        )}

        {/* Entries */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : entries.length === 0 && !showForm ? (
          <div className="bg-white/60 rounded-2xl border border-dashed border-slate-200 p-10 text-center">
            <div className="text-5xl mb-4">{section.icon}</div>
            <h3 className="text-lg font-bold text-slate-600 mb-2">هنوز موردی در {section.label} ثبت نشده</h3>
            <button onClick={openNew} className={`mt-4 px-6 py-3 bg-gradient-to-l ${c.from} ${c.to} text-white rounded-xl text-sm font-medium hover:opacity-90 cursor-pointer shadow-lg`}>+ ثبت مورد جدید</button>
          </div>
        ) : (
          <div className="space-y-3">
            {entries.map((entry) => (
              <div key={entry.id} className={`bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-md transition-all ${entry.completed ? "opacity-60" : ""}`}>
                <div className="px-4 py-3 flex items-center gap-3">
                  <button
                    onClick={() => toggleComplete(entry.id, entry.completed)}
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all cursor-pointer ${entry.completed ? "bg-emerald-500 border-emerald-500 text-white" : "border-slate-300 hover:border-emerald-500"}`}
                  >
                    {entry.completed && <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold truncate ${entry.completed ? "line-through text-slate-400" : "text-slate-800"}`}>{entry.title}</p>
                    {entry.content && <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">{entry.content}</p>}
                  </div>
                  {entry.date && <span className="text-[10px] text-slate-400 flex-shrink-0">{toPersianDigits(entry.date)}</span>}
                </div>
                <div className={`flex items-center border-t border-slate-100 ${c.light}`}>
                  <button onClick={() => openEdit(entry)} className="flex-1 flex items-center justify-center gap-1 py-2 text-xs font-medium text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer border-l border-slate-100">✏️ ویرایش</button>
                  <button onClick={() => setDeletingId(entry.id)} className="flex-1 flex items-center justify-center gap-1 py-2 text-xs font-medium text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer">🗑 حذف</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* FAB */}
      <button onClick={openNew} className={`sm:hidden fixed bottom-20 left-6 w-14 h-14 bg-gradient-to-br ${c.from} ${c.to} text-white rounded-2xl shadow-xl flex items-center justify-center text-2xl z-30 cursor-pointer hover:scale-105 transition-transform`}>+</button>

      <DeleteConfirmModal isOpen={deletingId !== null} onClose={() => setDeletingId(null)} onConfirm={handleDelete} title="حذف مورد" message="آیا از حذف این مورد اطمینان دارید؟" />
    </div>
  );
}
