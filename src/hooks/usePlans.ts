"use client";

import { useState, useEffect, useCallback } from "react";
import type { Plan } from "@/types";
import { plansDB } from "@/lib/localdb";

export function usePlans() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPlans = useCallback(async () => {
    try {
      const all = (await plansDB.getAll()) as Plan[];
      all.sort((a, b) => (a.startTime || "").localeCompare(b.startTime || ""));
      setPlans(all);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchPlans(); }, [fetchPlans]);

  const createPlan = async (data: Partial<Plan>) => {
    try { await plansDB.create(data as Record<string, unknown>); await fetchPlans(); return true; } catch { return false; }
  };

  const updatePlan = async (id: number, data: Partial<Plan>) => {
    try { await plansDB.update(id, data as Record<string, unknown>); await fetchPlans(); return true; } catch { return false; }
  };

  const deletePlan = async (id: number) => {
    try { await plansDB.delete(id); await fetchPlans(); return true; } catch { return false; }
  };

  const toggleComplete = async (id: number, completed: boolean) => updatePlan(id, { completed: !completed });

  return { plans, loading, createPlan, updatePlan, deletePlan, toggleComplete, refetch: fetchPlans };
}
