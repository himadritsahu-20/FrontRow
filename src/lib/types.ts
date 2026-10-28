export type Priority = "Critical" | "High" | "Medium" | "Low";

export type TaskType =
  | "Problem Set"
  | "Lab Report"
  | "Exam Prep"
  | "Essay"
  | "Quiz"
  | "Reading"
  | "Discussion Post"
  | "Project"
  | "Homework";

export type DueStatus = "overdue" | "today" | "tomorrow" | "upcoming" | "done";

export interface Task {
  id: string;
  title: string;
  subject: string;
  type: TaskType;
  due: string; // YYYY-MM-DD, local calendar date
  hours: number; // estimated hours
  priority: Priority;
  score: number; // 0-100
  notes?: string;
  completed: boolean;
  completedAt?: string; // ISO timestamp when completed
  createdAt: string; // ISO timestamp
}

export interface StudentProfile {
  fullName: string;
  roll: string;
  branch: string;
}

export interface TaskDraft {
  title: string;
  subject: string;
  type: TaskType;
  due: string;
  hours: string;
  priority: Priority;
  notes?: string;
}
