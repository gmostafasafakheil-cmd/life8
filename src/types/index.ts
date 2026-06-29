export type Priority = "high" | "medium" | "low";

export interface Task {
  id: number;
  title: string;
  description: string;
  priority: Priority;
  category: string;
  completed: boolean;
  dueDate: string;
  audioUrl: string;
  imageUrl: string;
  note: string;
  forwardedTo: string;
  forwardedNote: string;
  forwardedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: number;
  value: string;
  label: string;
  icon: string;
}

export interface TaskFormData {
  title: string;
  description: string;
  priority: Priority;
  category: string;
  dueDate: string;
  audioUrl: string;
  imageUrl: string;
  note: string;
}

export interface ForwardData {
  forwardedTo: string;
  forwardedNote: string;
}

export type FilterStatus = "all" | "active" | "completed";

export interface Memory {
  id: number;
  title: string;
  content: string;
  mood: string;
  date: string;
  imageUrl: string;
  audioUrl: string;
  createdAt: string;
  updatedAt: string;
}

export interface Plan {
  id: number;
  title: string;
  description: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  category: string;
  color: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LifeSection {
  id: number;
  value: string;
  label: string;
  icon: string;
}

export type AppView = "tasks" | "memories" | "planning" | `section-${string}`;
