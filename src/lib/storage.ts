import type { Task, StudentProfile } from "./types";
import { seedTasks } from "./data";

const PROFILE_KEY = "frontrow.profile.v1";
const TASKS_KEY = "frontrow.tasks.v1";

export function loadProfile(): StudentProfile | null {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (!raw) return null;
    const p = JSON.parse(raw) as Partial<StudentProfile>;
    if (typeof p.fullName === "string" && p.fullName.trim() &&
        typeof p.roll === "string" && p.roll.trim() &&
        typeof p.branch === "string" && p.branch.trim()) {
      return { fullName: p.fullName.trim(), roll: p.roll.trim(), branch: p.branch.trim() };
    }
    return null;
  } catch {
    return null;
  }
}

export function saveProfile(p: StudentProfile): void {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(p));
}

export function clearProfile(): void {
  localStorage.removeItem(PROFILE_KEY);
}

export function loadTasks(): Task[] {
  try {
    const raw = localStorage.getItem(TASKS_KEY);
    if (!raw) {
      const seeded = seedTasks();
      localStorage.setItem(TASKS_KEY, JSON.stringify(seeded));
      return seeded;
    }
    const parsed = JSON.parse(raw) as Task[];
    if (!Array.isArray(parsed) || parsed.length === 0) {
      const seeded = seedTasks();
      localStorage.setItem(TASKS_KEY, JSON.stringify(seeded));
      return seeded;
    }
    return parsed;
  } catch {
    const seeded = seedTasks();
    localStorage.setItem(TASKS_KEY, JSON.stringify(seeded));
    return seeded;
  }
}

export function saveTasks(tasks: Task[]): void {
  localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
}

export function resetTasks(): Task[] {
  const seeded = seedTasks();
  localStorage.setItem(TASKS_KEY, JSON.stringify(seeded));
  return seeded;
}
