import type { Task, Importance } from './types';
import { diffDays, dueInfo, fmtHours } from './date';

const IMPORTANCE_BASE: Record<Importance, number> = {
  Critical: 50,
  High: 43,
  Medium: 30,
  Low: 18,
};

/**
 * Priority score out of 100, derived from importance, urgency (days until
 * due, with overdue work escalating), and estimated workload.
 */
export function computeScore(task: Task, todayIso: string): number {
  const diff = diffDays(todayIso, task.dueDate);
  const base = IMPORTANCE_BASE[task.importance];
  const urgency = diff < 0 ? 30 + Math.min(3 * -diff, 12) : Math.max(30 - 4 * diff, 2);
  const workload = Math.min(task.hours, 8);
  return Math.max(1, Math.min(100, Math.round(base + urgency + workload)));
}

export function sortByScoreDesc(tasks: Task[], todayIso: string): Task[] {
  return [...tasks].sort((a, b) => {
    const d = computeScore(b, todayIso) - computeScore(a, todayIso);
    if (d !== 0) return d;
    return a.dueDate.localeCompare(b.dueDate);
  });
}

export function whyRankedFirst(task: Task, todayIso: string): string {
  const { diff } = dueInfo(todayIso, task.dueDate);
  const due =
    diff < 0
      ? `it's already overdue by ${-diff} day${-diff === 1 ? '' : 's'}`
      : diff === 0
        ? "it's due today"
        : diff === 1
          ? "it's due tomorrow"
          : `it's due in ${diff} days`;
  return `Ranked first because ${due}, it's marked ${task.importance}, and it carries ${fmtHours(task.hours)} of estimated work — the highest combined urgency and weight in your queue.`;
}

export function recommendedAction(task: Task, todayIso: string): string {
  const { diff } = dueInfo(todayIso, task.dueDate);
  const block = Math.min(Math.max(task.hours, 1), 2);
  const blockLabel = fmtHours(block);
  if (diff < 0) {
    return `Clear this before anything else: block a ${blockLabel} focus session today and submit — every extra day past due compounds the damage.`;
  }
  if (diff === 0) {
    return `Due today — reserve an uninterrupted ${blockLabel} block right now and finish it before switching subjects.`;
  }
  if (diff === 1) {
    return `Due tomorrow — schedule a ${blockLabel} deep-work session this evening so you're not finishing it under pressure.`;
  }
  const sessions = Math.max(1, Math.ceil(task.hours / 2));
  return `Split the ${fmtHours(task.hours)} into ${sessions} focused session${sessions === 1 ? '' : 's'} before the deadline, starting with the hardest part today.`;
}
