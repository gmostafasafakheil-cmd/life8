"use client";

import { useState, useEffect, useCallback } from "react";
import type { Memory } from "@/types";
import { memoriesDB } from "@/lib/localdb";

export function useMemories() {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMemories = useCallback(async () => {
    try {
      const all = (await memoriesDB.getAll()) as Memory[];
      all.sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
      setMemories(all);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchMemories(); }, [fetchMemories]);

  const createMemory = async (data: Partial<Memory>) => {
    try { await memoriesDB.create(data as Record<string, unknown>); await fetchMemories(); return true; } catch { return false; }
  };

  const updateMemory = async (id: number, data: Partial<Memory>) => {
    try { await memoriesDB.update(id, data as Record<string, unknown>); await fetchMemories(); return true; } catch { return false; }
  };

  const deleteMemory = async (id: number) => {
    try { await memoriesDB.delete(id); await fetchMemories(); return true; } catch { return false; }
  };

  return { memories, loading, createMemory, updateMemory, deleteMemory, refetch: fetchMemories };
}
