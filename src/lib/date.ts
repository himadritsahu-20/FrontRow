// Shared local-calendar-date logic. All dates in the app are 'YYYY-MM-DD'
// strings interpreted in the browser's local timezone.

export function toISO(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function todayISO(): string {
  return toISO(new Date());
}

export function parseISO(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function addDaysISO(iso: string, n: number): string {
  const d = parseISO(iso);
  d.setDate(d.getDate() + n);
  return toISO(d);
}

/** Days from `fromIso` to `toIso` (positive when toIso is later). */
export function diffDays(fromIso: string, toIso: string): number {
  return Math.round((parseISO(toIso).getTime() - parseISO(fromIso).getTime()) / 86400000);
}

/** Monday of the week containing `iso`. */
export function startOfWeekISO(iso: string): string {
  const d = parseISO(iso);
  const dow = (d.getDay() + 6) % 7; // Monday = 0
  d.setDate(d.getDate() - dow);
  return toISO(d);
}

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export function formatLong(iso: string): string {
  const d = parseISO(iso);
  return `${WEEKDAYS[d.getDay()]}, ${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

export function formatShort(iso: string): string {
  const d = parseISO(iso);
  return `${MONTHS[d.getMonth()].slice(0, 3)} ${d.getDate()}`;
}

export function formatWeekday(iso: string, short = false): string {
  const d = parseISO(iso);
  const name = WEEKDAYS[d.getDay()];
  return short ? name.slice(0, 3) : name;
}

export type DueTone = 'overdue' | 'today' | 'tomorrow' | 'soon' | 'later';

export function dueInfo(todayIso: string, dueIso: string): { label: string; tone: DueTone; diff: number } {
  const diff = diffDays(todayIso, dueIso);
  if (diff < 0) return { label: `Overdue ${-diff}d`, tone: 'overdue', diff };
  if (diff === 0) return { label: 'Today', tone: 'today', diff };
  if (diff === 1) return { label: 'Tomorrow', tone: 'tomorrow', diff };
  if (diff <= 14) return { label: `In ${diff}d`, tone: diff <= 4 ? 'soon' : 'later', diff };
  return { label: formatShort(dueIso), tone: 'later', diff };
}

export function fmtHours(h: number): string {
  return `${Number.isInteger(h) ? h : h.toFixed(1).replace(/\.0$/, '')}h`;
}

export function greetingForHour(hour: number): string {
  if (hour < 5) return 'Burning the midnight oil';
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}
