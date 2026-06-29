"use client";

import { useState, useEffect, useCallback } from "react";
import type { LifeSection } from "@/types";
import { sectionsDB } from "@/lib/localdb";

export function useSections() {
  const [sections, setSections] = useState<LifeSection[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSections = useCallback(async () => {
    try {
      const all = (await sectionsDB.getAll()) as LifeSection[];
      setSections(all);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchSections(); }, [fetchSections]);

  const createSection = async (data: { value: string; label: string; icon: string }) => {
    try { await sectionsDB.create(data); await fetchSections(); return true; } catch { return false; }
  };

  const deleteSection = async (id: number) => {
    try { await sectionsDB.delete(id); await fetchSections(); return true; } catch { return false; }
  };

  return { sections, loading, createSection, deleteSection, refetch: fetchSections };
}
