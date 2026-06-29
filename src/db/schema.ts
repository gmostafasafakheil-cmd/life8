import {
  pgTable,
  serial,
  text,
  boolean,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  value: varchar("value", { length: 100 }).notNull().unique(),
  label: varchar("label", { length: 100 }).notNull(),
  icon: varchar("icon", { length: 10 }).notNull().default("📁"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const memories = pgTable("memories", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 500 }).notNull(),
  content: text("content").default(""),
  mood: varchar("mood", { length: 20 }).default(""),
  date: varchar("date", { length: 50 }).default(""),
  imageUrl: text("image_url").default(""),
  audioUrl: text("audio_url").default(""),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const lifeSections = pgTable("life_sections", {
  id: serial("id").primaryKey(),
  value: varchar("value", { length: 100 }).notNull().unique(),
  label: varchar("label", { length: 100 }).notNull(),
  icon: varchar("icon", { length: 10 }).notNull().default("📁"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const sectionEntries = pgTable("section_entries", {
  id: serial("id").primaryKey(),
  sectionValue: varchar("section_value", { length: 100 }).notNull(),
  title: varchar("title", { length: 500 }).notNull(),
  content: text("content").default(""),
  date: varchar("date", { length: 50 }).default(""),
  completed: boolean("completed").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const plans = pgTable("plans", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 500 }).notNull(),
  description: text("description").default(""),
  dayOfWeek: varchar("day_of_week", { length: 20 }).default("everyday"),
  startTime: varchar("start_time", { length: 10 }).default("08:00"),
  endTime: varchar("end_time", { length: 10 }).default("09:00"),
  category: varchar("category", { length: 100 }).default(""),
  color: varchar("color", { length: 30 }).default("indigo"),
  completed: boolean("completed").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 500 }).notNull(),
  description: text("description").default(""),
  priority: varchar("priority", { length: 10 }).notNull().default("medium"),
  category: varchar("category", { length: 100 }).default(""),
  completed: boolean("completed").default(false).notNull(),
  dueDate: varchar("due_date", { length: 50 }).default(""),
  audioUrl: text("audio_url").default(""),
  imageUrl: text("image_url").default(""),
  note: text("note").default(""),
  forwardedTo: varchar("forwarded_to", { length: 255 }).default(""),
  forwardedNote: text("forwarded_note").default(""),
  forwardedAt: varchar("forwarded_at", { length: 50 }).default(""),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
