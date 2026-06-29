"use client";

import { openDB, type IDBPDatabase } from "idb";

const DB_NAME = "lifestyle-db";
const DB_VERSION = 2;

type StoreNames = "tasks" | "categories" | "memories" | "plans" | "lifeSections" | "sectionEntries";

let dbPromise: Promise<IDBPDatabase> | null = null;

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion) {
        // Tasks
        if (!db.objectStoreNames.contains("tasks")) {
          const tasks = db.createObjectStore("tasks", { keyPath: "id", autoIncrement: true });
          tasks.createIndex("dueDate", "dueDate");
          tasks.createIndex("category", "category");
        }
        // Categories
        if (!db.objectStoreNames.contains("categories")) {
          db.createObjectStore("categories", { keyPath: "id", autoIncrement: true });
        }
        // Memories
        if (!db.objectStoreNames.contains("memories")) {
          const mem = db.createObjectStore("memories", { keyPath: "id", autoIncrement: true });
          mem.createIndex("date", "date");
        }
        // Plans
        if (!db.objectStoreNames.contains("plans")) {
          const plans = db.createObjectStore("plans", { keyPath: "id", autoIncrement: true });
          plans.createIndex("dayOfWeek", "dayOfWeek");
        }
        // Life Sections
        if (!db.objectStoreNames.contains("lifeSections")) {
          db.createObjectStore("lifeSections", { keyPath: "id", autoIncrement: true });
        }
        // Section Entries
        if (!db.objectStoreNames.contains("sectionEntries")) {
          const entries = db.createObjectStore("sectionEntries", { keyPath: "id", autoIncrement: true });
          entries.createIndex("sectionValue", "sectionValue");
        }
      },
    });
  }
  return dbPromise;
}

// ─── Generic CRUD ───

async function getAll<T>(store: StoreNames): Promise<T[]> {
  const db = await getDB();
  return (await db.getAll(store)) as T[];
}

async function getById<T>(store: StoreNames, id: number): Promise<T | undefined> {
  const db = await getDB();
  return (await db.get(store, id)) as T | undefined;
}

async function add<T extends Record<string, unknown>>(store: StoreNames, data: T): Promise<T & { id: number }> {
  const db = await getDB();
  const now = new Date().toISOString();
  const record = { ...data, createdAt: now, updatedAt: now };
  const id = (await db.add(store, record)) as number;
  return { ...record, id } as T & { id: number };
}

async function update<T extends Record<string, unknown>>(store: StoreNames, id: number, data: Partial<T>): Promise<T | null> {
  const db = await getDB();
  const existing = await db.get(store, id);
  if (!existing) return null;
  const updated = { ...existing, ...data, updatedAt: new Date().toISOString() };
  await db.put(store, updated);
  return updated as T;
}

async function remove(store: StoreNames, id: number): Promise<boolean> {
  const db = await getDB();
  await db.delete(store, id);
  return true;
}

async function getAllByIndex<T>(store: StoreNames, indexName: string, value: string): Promise<T[]> {
  const db = await getDB();
  return (await db.getAllFromIndex(store, indexName, value)) as T[];
}

// ─── Tasks ───

export const tasksDB = {
  getAll: () => getAll("tasks"),
  getById: (id: number) => getById("tasks", id),
  create: (data: Record<string, unknown>) => add("tasks", data),
  update: (id: number, data: Record<string, unknown>) => update("tasks", id, data),
  delete: (id: number) => remove("tasks", id),
};

// ─── Categories ───

const defaultCategories = [
  { value: "work", label: "کاری", icon: "💼" },
  { value: "personal", label: "شخصی", icon: "👤" },
  { value: "study", label: "مطالعه", icon: "📚" },
  { value: "health", label: "سلامت", icon: "🏥" },
  { value: "shopping", label: "خرید", icon: "🛒" },
  { value: "finance", label: "مالی", icon: "💰" },
];

export const categoriesDB = {
  getAll: async () => {
    const all = await getAll("categories");
    if (all.length === 0) {
      for (const cat of defaultCategories) {
        await add("categories", cat);
      }
      return getAll("categories");
    }
    return all;
  },
  create: (data: Record<string, unknown>) => add("categories", data),
  delete: (id: number) => remove("categories", id),
};

// ─── Memories ───

export const memoriesDB = {
  getAll: () => getAll("memories"),
  create: (data: Record<string, unknown>) => add("memories", data),
  update: (id: number, data: Record<string, unknown>) => update("memories", id, data),
  delete: (id: number) => remove("memories", id),
};

// ─── Plans ───

export const plansDB = {
  getAll: () => getAll("plans"),
  create: (data: Record<string, unknown>) => add("plans", data),
  update: (id: number, data: Record<string, unknown>) => update("plans", id, data),
  delete: (id: number) => remove("plans", id),
};

// ─── Life Sections ───

const defaultSections = [
  { value: "health", label: "سلامت", icon: "❤️" },
  { value: "nutrition", label: "تغذیه", icon: "🥗" },
  { value: "exercise", label: "ورزش", icon: "🏋️" },
  { value: "learning", label: "یادگیری", icon: "🎓" },
  { value: "reading", label: "مطالعه", icon: "📚" },
];

export const sectionsDB = {
  getAll: async () => {
    const all = await getAll("lifeSections");
    if (all.length === 0) {
      for (const sec of defaultSections) {
        await add("lifeSections", sec);
      }
      return getAll("lifeSections");
    }
    return all;
  },
  create: (data: Record<string, unknown>) => add("lifeSections", data),
  delete: (id: number) => remove("lifeSections", id),
};

// ─── Section Entries ───

export const entriesDB = {
  getAll: () => getAll("sectionEntries"),
  getBySection: (sectionValue: string) => getAllByIndex("sectionEntries", "sectionValue", sectionValue),
  create: (data: Record<string, unknown>) => add("sectionEntries", data),
  update: (id: number, data: Record<string, unknown>) => update("sectionEntries", id, data),
  delete: (id: number) => remove("sectionEntries", id),
};

// ─── File Storage (as base64) ───

export async function saveFileLocally(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
