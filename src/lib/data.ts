import { db, hasDB } from "@/db";
import { tasks, categories } from "@/db/schema";
import { desc } from "drizzle-orm";
import type { Task, Category } from "@/types";

export async function getTasks(): Promise<Task[]> {
  if (!hasDB) return [];
  try {
    const rows = await db.select().from(tasks).orderBy(desc(tasks.createdAt));
    return rows.map((r) => ({
      id: r.id,
      title: r.title,
      description: r.description ?? "",
      priority: r.priority as Task["priority"],
      category: r.category ?? "",
      completed: r.completed,
      dueDate: r.dueDate ?? "",
      audioUrl: r.audioUrl ?? "",
      imageUrl: r.imageUrl ?? "",
      note: r.note ?? "",
      forwardedTo: r.forwardedTo ?? "",
      forwardedNote: r.forwardedNote ?? "",
      forwardedAt: r.forwardedAt ?? "",
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
    }));
  } catch {
    return [];
  }
}

export async function getCategories(): Promise<Category[]> {
  if (!hasDB) return [];
  try {
    const rows = await db.select().from(categories).orderBy(categories.id);
    return rows.map((r) => ({
      id: r.id,
      value: r.value,
      label: r.label,
      icon: r.icon,
    }));
  } catch {
    return [];
  }
}

export async function ensureSeed(): Promise<void> {
  if (!hasDB) return;
  try {
    const rows = await db.select().from(categories);
    if (rows.length === 0) {
      await db.insert(categories).values([
        { value: "work", label: "کاری", icon: "💼" },
        { value: "personal", label: "شخصی", icon: "👤" },
        { value: "study", label: "مطالعه", icon: "📚" },
        { value: "health", label: "سلامت", icon: "🏥" },
        { value: "shopping", label: "خرید", icon: "🛒" },
        { value: "finance", label: "مالی", icon: "💰" },
      ]);
    }
  } catch {
    // ignore
  }
}
