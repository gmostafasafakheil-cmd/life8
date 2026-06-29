"use client";

import { useState, useEffect, useCallback } from "react";
import type { Category } from "@/types";
import { categoriesDB } from "@/lib/localdb";

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCategories = useCallback(async () => {
    try {
      const all = (await categoriesDB.getAll()) as Category[];
      setCategories(all);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  const createCategory = async (data: { value: string; label: string; icon: string }) => {
    try { await categoriesDB.create(data); await fetchCategories(); return true; } catch { return false; }
  };

  const deleteCategory = async (id: number) => {
    try { await categoriesDB.delete(id); await fetchCategories(); return true; } catch { return false; }
  };

  return { categories, loading, createCategory, deleteCategory, refetch: fetchCategories };
}
