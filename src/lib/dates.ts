/* Shared, consistent local-calendar date logic for the whole app.
   All dates are represented as "YYYY-MM-DD" strings in the LOCAL timezone. */

export function toLocalISO(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function todayISO(now: Date = new Date()): string {
  return toLocalISO(now);
}

/** Parse a YYYY-MM-DD string into a local Date (midnight local). */
export function parseISO(iso: string): Date {
  const [y, m, d] = iso.split("-").map((n) => parseInt(n, 10));
  return new Date(y, m - 1, d);
}

/** Whole days from `fromISO` to `toISO` (positive = in the future). */
export function diffDays(fromISO: string, toISO: string): number {
  const ms = parseISO(toISO).getTime() - parseISO(fromISO).getTime();
  return Math.round(ms / 86400000);
}

export function addDaysISO(iso: string, days: number): string {
  const d = parseISO(iso);
  d.setDate(d.getDate() + days);
  return toLocalISO(d);
}

export type DueStatus = "overdue" | "today" | "tomorrow" | "upcoming" | "done";

export function dueStatusOf(due: string, completed: boolean, today: string = todayISO()): DueStatus {
  if (completed) return "done";
  const diff = diffDays(today, due);
  if (diff < 0) return "overdue";
  if (diff === 0) return "today";
  if (diff === 1) return "tomorrow";
  return "upcoming";
}

export function dueLabel(due: string, completed: boolean, today: string = todayISO()): string {
  const status = dueStatusOf(due, completed, today);
  switch (status) {
    case "overdue": {
      const n = Math.abs(diffDays(today, due));
      return n === 1 ? "Overdue 1d" : `Overdue ${n}d`;
    }
    case "today":
      return "Today";
    case "tomorrow":
      return "Tomorrow";
    case "done":
      return "Done";
    default: {
      const n = diffDays(today, due);
      return `In ${n}d`;
    }
  }
}

export function formatDate(iso: string): string {
  return parseISO(iso).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function formatDateLong(iso: string): string {
  return parseISO(iso).toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

export function isValidISODate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [y, m, d] = value.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  return dt.getFullYear() === y && dt.getMonth() === m - 1 && dt.getDate() === d;
}

/** Start (Monday) of the week containing `iso`. */
export function weekStartISO(iso: string): string {
  const d = parseISO(iso);
  const dow = (d.getDay() + 6) % 7; // Mon=0 .. Sun=6
  d.setDate(d.getDate() - dow);
  return toLocalISO(d);
}

export function addWeeksISO(iso: string, weeks: number): string {
  return addDaysISO(iso, weeks * 7);
}

export function weekdayNames(): string[] {
  return ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
}

export function greetingFor(now: Date = new Date()): string {
  const h = now.getHours();
  if (h < 5) return "Up late";
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  if (h < 22) return "Good evening";
  return "Good evening";
}

export function fullDateLong(now: Date = new Date()): string {
  return now.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}
