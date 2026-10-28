import type { Task, StudentProfile } from "./types";
import { todayISO, addDaysISO } from "./dates";

let counter = 0;
export function uid(prefix = "t"): string {
  counter += 1;
  return `${prefix}_${Date.now().toString(36)}_${counter.toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

/**
 * Seed demo tasks — always built relative to "today" so Today/Tomorrow/Overdue
 * labels, the Coming up filter, and weekly charts are always correct.
 *
 * 19 tasks total: 14 open (49.5h) + 5 completed.
 * Open subject totals: Physics 3T/15h, CS 3T/13h, Math 2T/8h, Economics 3T/6.5h,
 * Literature 1T/4h, Chemistry 1T/2.5h, Sociology 1T/0.5h.
 * Exactly 8 open tasks due within the next 7 days (excluding today? no — see note):
 * today counts (due in 0 days), days 1..6 also within 7 days  => 8 tasks.
 */
export function seedTasks(now: Date = new Date()): Task[] {
  const T = todayISO(now);
  const mk = (
    title: string,
    subject: string,
    type: Task["type"],
    dueOffset: number,
    hours: number,
    priority: Task["priority"],
    score: number,
    completed = false,
    notes?: string,
  ): Task => ({
    id: uid(),
    title,
    subject,
    type,
    due: addDaysISO(T, dueOffset),
    hours,
    priority,
    score,
    completed,
    createdAt: new Date(now.getTime() - 86400000 * 3).toISOString(),
    ...(completed ? { completedAt: new Date(now.getTime() - 86400000).toISOString() } : {}),
    ...(notes ? { notes } : {}),
  });

  const tasks: Task[] = [
    // ---- Open tasks (14) ----
    // Physics 3 tasks / 15h
    mk("Lab report — Fluid dynamics", "Physics", "Lab Report", -2, 4, "Critical", 90, false,
      "Complete the analysis section with the Reynolds number discussion; due back to the TA."),
    mk("Midterm review — Thermodynamics", "Physics", "Exam Prep", 2, 5, "Critical", 77),
    mk("Lab report — Electromagnetic induction", "Physics", "Lab Report", 4, 6, "High", 63),
    // Computer Science 3 tasks / 13h
    mk("Problem set 4 — Asymptotic analysis", "Computer Science", "Problem Set", 1, 3, "Critical", 79),
    mk("Project milestone — Editorial assistant", "Computer Science", "Project", 5, 6, "High", 66),
    mk("Documentation revamp — Data pipeline", "Computer Science", "Homework", 9, 4, "Medium", 52),
    // Mathematics 2 tasks / 8h
    mk("Problem set 7 — Linear algebra", "Mathematics", "Problem Set", 1, 4, "High", 71),
    mk("Midterm review — Calculus II", "Mathematics", "Exam Prep", 10, 4, "Medium", 58),
    // Economics 3 tasks / 6.5h
    mk("Problem set 5 — Microeconomics", "Economics", "Problem Set", 0, 2.5, "High", 74),
    mk("Reading summary — Behavioral econ paper", "Economics", "Reading", 11, 2, "Medium", 55),
    mk("Market analysis memo", "Economics", "Essay", 12, 2, "Low", 40),
    // Literature 1 task / 4h
    mk("Literature analysis — The Great Gatsby", "Literature", "Essay", 3, 4, "High", 65),
    // Chemistry 1 task / 2.5h
    mk("Lab report — Acid-base titrations", "Chemistry", "Lab Report", 13, 2.5, "Medium", 50),
    // Sociology 1 task / 0.5h
    mk("Discussion post 6 — Durkheim on anomie", "Sociology", "Discussion Post", 0, 0.5, "Medium", 47),

    // ---- Completed tasks (5) ----
    mk("Problem set 3 — Differential equations", "Mathematics", "Problem Set", -3, 4, "High", 70, true),
    mk("Lab report — Simple harmonic motion", "Physics", "Lab Report", -4, 5, "High", 72, true),
    mk("Essay — Essay outline draft", "Literature", "Essay", -1, 3, "Medium", 60, true),
    mk("Quiz — Statistics foundations", "Economics", "Quiz", -2, 1.5, "Medium", 64, true),
    mk("Programming exercises — Pythonic data", "Computer Science", "Homework", -5, 4, "Low", 45, true),
  ];

  // Sanity: 14 open, 49.5h open, exactly 8 open due within next 7 days (today..+6)
  const open = tasks.filter((t) => !t.completed);
  console.assert(open.length === 14, `expected 14 open, got ${open.length}`);
  console.assert(Math.abs(open.reduce((s, t) => s + t.hours, 0) - 49.5) < 1e-9, "open hours should total 49.5");
  const within7 = open.filter((t) => diffInDays(t.due) >= 0 && diffInDays(t.due) <= 6);
  console.assert(within7.length === 8, `expected 8 open within 7 days, got ${within7.length}`);
  function diffInDays(iso: string) {
    const ms = new Date(iso + "T00:00:00").getTime() - new Date(T + "T00:00:00").getTime();
    return Math.round(ms / 86400000);
  }

  return tasks;
}

export const PRIORITIES = ["Critical", "High", "Medium", "Low"] as const;
export const TASK_TYPES = [
  "Problem Set",
  "Lab Report",
  "Exam Prep",
  "Essay",
  "Quiz",
  "Reading",
  "Discussion Post",
  "Project",
  "Homework",
] as const;

/** Priority → default score band if the user hasn't customized. */
export function scoreForPriority(p: string): number {
  switch (p) {
    case "Critical": return 85;
    case "High": return 70;
    case "Medium": return 55;
    case "Low": return 40;
    default: return 50;
  }
}

export function greetStudent(profile: StudentProfile | null): string {
  const name = profile?.fullName.trim().split(/\s+/)[0];
  return name ?? "there";
}

export function initials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  const first = parts[0][0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] ?? "" : "";
  return (first + last).toUpperCase();
}
