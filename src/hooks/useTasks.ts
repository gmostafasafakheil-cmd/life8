"use client";

import { useState, useEffect, useCallback } from "react";
import type { Task, TaskFormData, ForwardData } from "@/types";
import { tasksDB } from "@/lib/localdb";

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = useCallback(async () => {
    try {
      const all = (await tasksDB.getAll()) as Task[];
      all.sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
      setTasks(all);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const createTask = async (data: TaskFormData) => {
    try {
      await tasksDB.create({ ...data, completed: false, forwardedTo: "", forwardedNote: "", forwardedAt: "" });
      await fetchTasks();
      return true;
    } catch { return false; }
  };

  const updateTask = async (id: number, data: Partial<Task>) => {
    try {
      await tasksDB.update(id, data as Record<string, unknown>);
      await fetchTasks();
      return true;
    } catch { return false; }
  };

  const deleteTask = async (id: number) => {
    try { await tasksDB.delete(id); await fetchTasks(); return true; } catch { return false; }
  };

  const toggleComplete = async (id: number, completed: boolean) => updateTask(id, { completed: !completed });

  const forwardTask = async (id: number, data: ForwardData) => {
    return updateTask(id, { forwardedTo: data.forwardedTo, forwardedNote: data.forwardedNote, forwardedAt: new Date().toISOString() });
  };

  return { tasks, loading, createTask, updateTask, deleteTask, toggleComplete, forwardTask, refetch: fetchTasks };
}
