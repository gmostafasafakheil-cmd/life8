"use client";

import { useState, useEffect, useCallback } from "react";
import { entriesDB } from "@/lib/localdb";

export interface Entry {
  id: number;
  sectionValue: string;
  title: string;
  content: string;
  date: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

export function useEntries(sectionValue: string) {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEntries = useCallback(async () => {
    try {
      const all = (await entriesDB.getBySection(sectionValue)) as Entry[];
      all.sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
      setEntries(all);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [sectionValue]);

  useEffect(() => { fetchEntries(); }, [fetchEntries]);

  const createEntry = async (data: Partial<Entry>) => {
    try {
      await entriesDB.create({ ...data, sectionValue, completed: false } as Record<string, unknown>);
      await fetchEntries();
      return true;
    } catch { return false; }
  };

  const updateEntry = async (id: number, data: Partial<Entry>) => {
    try { await entriesDB.update(id, data as Record<string, unknown>); await fetchEntries(); return true; } catch { return false; }
  };

  const deleteEntry = async (id: number) => {
    try { await entriesDB.delete(id); await fetchEntries(); return true; } catch { return false; }
  };

  const toggleComplete = async (id: number, completed: boolean) => updateEntry(id, { completed: !completed });

  return { entries, loading, createEntry, updateEntry, deleteEntry, toggleComplete, refetch: fetchEntries };
}
