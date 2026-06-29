"use client";

import { useState, useMemo } from "react";
import { useMemories } from "@/hooks/useMemories";
import type { Memory } from "@/types";
import MemoryModal from "@/components/MemoryModal";
import DeleteConfirmModal from "@/components/DeleteConfirmModal";
import { toPersianDigits, formatJalaaliPersian, getPersianWeekDayName } from "@/lib/jalali";

const moodMap: Record<string, { icon: string; label: string }> = {
  happy: { icon: "😊", label: "شاد" },
  calm: { icon: "😌", label: "آرام" },
  excited: { icon: "🤩", label: "هیجان‌زده" },
  sad: { icon: "😢", label: "غمگین" },
  angry: { icon: "😡", label: "عصبانی" },
  thankful: { icon: "🙏", label: "سپاسگزار" },
  love: { icon: "❤️", label: "عاشقانه" },
  thinking: { icon: "🤔", label: "متفکر" },
};

export default function MemoriesView() {
  const { memories, loading, createMemory, updateMemory, deleteMemory } = useMemories();

  const [showModal, setShowModal] = useState(false);
  const [editingMemory, setEditingMemory] = useState<Memory | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const now = new Date();
  const todayPersian = formatJalaaliPersian(now);
  const todayWeekDay = getPersianWeekDayName(now);

  // Group by date
  const groups = useMemo(() => {
    let filtered = memories;
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      filtered = memories.filter(
        (m) => m.title.toLowerCase().includes(q) || (m.content && m.content.toLowerCase().includes(q))
      );
    }

    const grouped = new Map<string, Memory[]>();
    for (const m of filtered) {
      const key = m.date?.trim() || "بدون‌تاریخ";
      if (!grouped.has(key)) grouped.set(key, []);
      grouped.get(key)?.push(m);
    }

    const sortedKeys = Array.from(grouped.keys()).sort((a, b) => {
      if (a === "بدون‌تاریخ") return 1;
      if (b === "بدون‌تاریخ") return -1;
      return a > b ? -1 : 1;
    });

    return sortedKeys.map((key) => ({
      date: key,
      label: key === "بدون‌تاریخ" ? "بدون تاریخ" : toPersianDigits(key),
      items: grouped.get(key) ?? [],
    }));
  }, [memories, searchQuery]);

  const handleCreate = async (data: Partial<Memory>) => createMemory(data);
  const handleUpdate = async (data: Partial<Memory>) => {
    if (!editingMemory) return false;
    return updateMemory(editingMemory.id, data);
  };
  const handleDelete = async () => {
    if (deletingId === null) return;
    await deleteMemory(deletingId);
    setDeletingId(null);
  };

  return (
    <div className="flex-1 min-w-0 main-content">
      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-l from-pink-500 via-rose-500 to-red-400 shadow-xl shadow-rose-900/20">
        <div className="absolute -top-20 -left-20 w-72 h-72 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-16 -right-16 w-60 h-60 bg-yellow-300/10 rounded-full blur-3xl" />

        <div className="relative px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-amber-200 drop-shadow-lg" style={{ textShadow: "0 2px 12px rgba(251,191,36,0.3)" }}>
                📖 خاطرات من
              </h2>
              <div className="flex items-center gap-3 mt-1.5">
                <span className="text-white/70 text-sm font-medium">{todayWeekDay}،</span>
                <span className="text-amber-200/90 text-sm font-bold">{todayPersian}</span>
                <span className="text-white/40 text-sm">•</span>
                <span className="text-white/60 text-sm">{toPersianDigits(String(memories.length))} خاطره</span>
              </div>
            </div>
            <button
              onClick={() => { setEditingMemory(null); setShowModal(true); }}
              className="hidden sm:flex items-center gap-2 px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-rose-900 rounded-xl text-sm font-bold transition-colors shadow-lg shadow-amber-500/25 cursor-pointer"
            >
              <span className="text-lg">+</span>
              خاطره جدید
            </button>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white/70 backdrop-blur-xl border-b border-slate-200/50 sticky top-0 z-30">
        <div className="px-4 sm:px-6 lg:px-8 py-3">
          <div className="relative">
            <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="جستجو در خاطرات..." className="w-full pl-4 pr-11 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-pink-400 focus:ring-2 focus:ring-pink-200 outline-none transition-all bg-white/90" />
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🔍</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 sm:px-6 lg:px-8 py-5">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-pink-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-sm text-slate-400">در حال بارگذاری...</p>
            </div>
          </div>
        ) : groups.length === 0 ? (
          <div className="bg-white/60 rounded-2xl border border-dashed border-slate-200 p-10 text-center">
            <div className="text-5xl mb-4">📖</div>
            <h3 className="text-lg font-bold text-slate-600 mb-2">{searchQuery ? "خاطره‌ای یافت نشد" : "هنوز خاطره‌ای ثبت نشده"}</h3>
            <p className="text-sm text-slate-400 mb-6">اولین خاطره خود را ثبت کنید</p>
            {!searchQuery && (
              <button onClick={() => { setEditingMemory(null); setShowModal(true); }} className="px-6 py-3 bg-gradient-to-l from-pink-500 to-rose-500 text-white rounded-xl text-sm font-medium hover:opacity-90 transition-opacity shadow-lg shadow-pink-500/25 cursor-pointer">+ ثبت خاطره جدید</button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {groups.map((group) => (
              <div key={group.date}>
                {/* Date header */}
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-xs font-bold text-rose-500">📅 {group.label}</span>
                  <span className="flex-1 h-px bg-rose-100" />
                  <span className="text-[10px] text-slate-400">{toPersianDigits(String(group.items.length))} خاطره</span>
                </div>

                <div className="space-y-3">
                  {group.items.map((m) => {
                    const isExpanded = expandedId === m.id;
                    const moodInfo = m.mood ? moodMap[m.mood] : null;

                    return (
                      <div key={m.id} className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-md transition-all">
                        {/* Header */}
                        <button onClick={() => setExpandedId(isExpanded ? null : m.id)} className="w-full text-right px-4 py-3 flex items-center gap-3 cursor-pointer hover:bg-slate-50 transition-colors">
                          {moodInfo && <span className="text-xl flex-shrink-0">{moodInfo.icon}</span>}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-slate-800 truncate">{m.title}</p>
                            {m.content && !isExpanded && <p className="text-xs text-slate-400 truncate mt-0.5">{m.content.substring(0, 60)}...</p>}
                          </div>
                          {(m.imageUrl || m.audioUrl) && (
                            <div className="flex items-center gap-1 flex-shrink-0 text-slate-300">
                              {m.imageUrl && <span className="text-xs">📷</span>}
                              {m.audioUrl && <span className="text-xs">🎙</span>}
                            </div>
                          )}
                          <svg className={`w-4 h-4 text-slate-400 transition-transform flex-shrink-0 ${isExpanded ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                        </button>

                        {/* Expanded content */}
                        {isExpanded && (
                          <div className="border-t border-slate-100 animate-fade-in">
                            <div className="p-4 space-y-3">
                              {moodInfo && (
                                <span className="inline-flex items-center gap-1 text-xs bg-pink-50 text-pink-600 px-2 py-1 rounded-lg">{moodInfo.icon} {moodInfo.label}</span>
                              )}
                              {m.content && <p className="text-sm text-slate-700 leading-7 whitespace-pre-wrap">{m.content}</p>}
                              {m.imageUrl && (
                                <div className="rounded-xl overflow-hidden border border-slate-200">
                                  <img src={m.imageUrl} alt="تصویر خاطره" className="w-full max-h-64 object-cover" />
                                </div>
                              )}
                              {m.audioUrl && <audio controls src={m.audioUrl} className="w-full" />}
                              <p className="text-[10px] text-slate-300">ثبت: {new Date(m.createdAt).toLocaleDateString("fa-IR")}</p>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center border-t border-slate-100 bg-slate-50">
                              <button onClick={() => { setEditingMemory(m); setShowModal(true); }} className="flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-medium text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer border-l border-slate-100">✏️ ویرایش</button>
                              <button onClick={() => setDeletingId(m.id)} className="flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-medium text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer">🗑 حذف</button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* FAB */}
      <button onClick={() => { setEditingMemory(null); setShowModal(true); }} className="sm:hidden fixed bottom-20 left-6 w-14 h-14 bg-gradient-to-br from-pink-500 to-rose-500 text-white rounded-2xl shadow-xl shadow-pink-500/30 flex items-center justify-center text-2xl z-30 cursor-pointer hover:scale-105 transition-transform">+</button>

      {/* Modals */}
      <MemoryModal isOpen={showModal} onClose={() => { setShowModal(false); setEditingMemory(null); }} onSubmit={editingMemory ? handleUpdate : handleCreate} memory={editingMemory} />
      <DeleteConfirmModal isOpen={deletingId !== null} onClose={() => setDeletingId(null)} onConfirm={handleDelete} title="حذف خاطره" message="آیا از حذف این خاطره اطمینان دارید؟" />
    </div>
  );
}
