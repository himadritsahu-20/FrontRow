import { useState } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight, Clock3, Layers } from 'lucide-react';
import { useStore } from '../lib/store';
import { addDaysISO, fmtHours, formatShort, parseISO, startOfWeekISO, formatWeekday } from '../lib/date';
import { subjectColor } from '../lib/subjects';
import { sortByScoreDesc } from '../lib/score';

export default function CalendarPage() {
  const { tasks, today, openEditTask } = useStore();
  const [weekOffset, setWeekOffset] = useState(0);

  const weekStart = addDaysISO(startOfWeekISO(today), weekOffset * 7);
  const days = Array.from({ length: 7 }, (_, i) => addDaysISO(weekStart, i));
  const weekEnd = days[6];

  const tasksOn = (iso: string) => {
    const dayTasks = tasks.filter((t) => t.dueDate === iso);
    return [...sortByScoreDesc(dayTasks.filter((t) => !t.completed), today), ...dayTasks.filter((t) => t.completed)];
  };

  const weekTasks = tasks.filter((t) => t.dueDate >= weekStart && t.dueDate <= weekEnd);
  const weekOpen = weekTasks.filter((t) => !t.completed);
  const hoursDue = weekOpen.reduce((s, t) => s + t.hours, 0);
  const subjectsTouched = new Set(weekTasks.map((t) => t.subject)).size;

  const startD = parseISO(weekStart);
  const endD = parseISO(weekEnd);
  const rangeLabel = `${formatShort(weekStart)} – ${formatShort(weekEnd)}, ${endD.getFullYear()}${
    startD.getFullYear() !== endD.getFullYear() ? ` (${startD.getFullYear()}–${endD.getFullYear()})` : ''
  }`;

  const navBtn =
    'flex h-9 w-9 items-center justify-center rounded-lg border border-line bg-white text-navy transition hover:bg-linen focus-visible:ring-2 focus-visible:ring-gold focus-visible:outline-none';

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="fade-up flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold text-navy">Calendar</h1>
          <p className="mt-1.5 text-sm text-mist">Week of <strong className="font-semibold text-ink">{rangeLabel}</strong></p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setWeekOffset((v) => v - 1)} aria-label="Previous week" className={navBtn}>
            <ChevronLeft size={17} />
          </button>
          <button
            onClick={() => setWeekOffset(0)}
            disabled={weekOffset === 0}
            className="rounded-lg border border-line bg-white px-3.5 py-2 text-sm font-semibold text-navy transition hover:bg-linen focus-visible:ring-2 focus-visible:ring-gold focus-visible:outline-none disabled:cursor-default disabled:opacity-45"
          >
            This week
          </button>
          <button onClick={() => setWeekOffset((v) => v + 1)} aria-label="Next week" className={navBtn}>
            <ChevronRight size={17} />
          </button>
        </div>
      </div>

      {/* Week grid */}
      <div className="fade-up mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-7 lg:gap-2" style={{ animationDelay: '100ms' }}>
        {days.map((iso) => {
          const isToday = iso === today;
          const dayTasks = tasksOn(iso);
          const d = parseISO(iso);
          return (
            <div
              key={iso}
              className={`flex min-h-36 flex-col rounded-xl border p-2.5 lg:min-h-52 ${
                isToday ? 'border-gold bg-gold-soft/40 shadow-sm ring-1 ring-gold/50' : 'border-line bg-cream'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-bold tracking-wider uppercase ${isToday ? 'text-gold-deep' : 'text-mist-soft'}`}>
                  {formatWeekday(iso, true)}
                </span>
                <span
                  className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                    isToday ? 'bg-navy text-gold' : 'text-mist'
                  }`}
                >
                  {d.getDate()}
                </span>
              </div>
              <div className="mt-2 flex flex-1 flex-col gap-1.5">
                {dayTasks.length === 0 ? (
                  <span className="mt-1 text-[11px] text-mist-soft italic">—</span>
                ) : (
                  dayTasks.map((t) => {
                    const c = subjectColor(t.subject);
                    return (
                      <button
                        key={t.id}
                        onClick={() => openEditTask(t.id)}
                        title={`${t.title} — ${t.subject}, ${fmtHours(t.hours)}`}
                        className={`w-full rounded-md border-l-[3px] px-2 py-1.5 text-left transition hover:shadow-sm focus-visible:ring-2 focus-visible:ring-gold focus-visible:outline-none ${
                          t.completed ? 'opacity-50' : ''
                        }`}
                        style={{ backgroundColor: c.bg, borderLeftColor: c.bar }}
                      >
                        <span className={`block text-[11px] leading-tight font-semibold ${t.completed ? 'line-through' : ''}`} style={{ color: c.text }}>
                          {t.title}
                        </span>
                        <span className="mt-0.5 block text-[10px] font-medium" style={{ color: c.text, opacity: 0.75 }}>
                          {fmtHours(t.hours)}{t.completed ? ' · done' : ''}
                        </span>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Weekly summary */}
      <div className="fade-up mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3" style={{ animationDelay: '180ms' }}>
        <div className="rounded-2xl border border-line bg-cream p-4 shadow-sm">
          <div className="flex items-center gap-2 text-mist">
            <CalendarDays size={17} />
            <span className="text-[11px] font-bold tracking-wider uppercase">Deadlines this week</span>
          </div>
          <div className="font-display mt-2 text-2xl font-semibold text-navy">{weekTasks.length}</div>
          <p className="mt-1 text-xs text-mist">{weekOpen.length} open · {weekTasks.length - weekOpen.length} completed</p>
        </div>
        <div className="rounded-2xl border border-line bg-cream p-4 shadow-sm">
          <div className="flex items-center gap-2 text-mist">
            <Clock3 size={17} />
            <span className="text-[11px] font-bold tracking-wider uppercase">Hours due</span>
          </div>
          <div className="font-display mt-2 text-2xl font-semibold text-navy">{fmtHours(hoursDue)}</div>
          <p className="mt-1 text-xs text-mist">estimated work still open this week</p>
        </div>
        <div className="rounded-2xl border border-line bg-cream p-4 shadow-sm">
          <div className="flex items-center gap-2 text-mist">
            <Layers size={17} />
            <span className="text-[11px] font-bold tracking-wider uppercase">Subjects touched</span>
          </div>
          <div className="font-display mt-2 text-2xl font-semibold text-navy">{subjectsTouched}</div>
          <p className="mt-1 text-xs text-mist">{subjectsTouched === 0 ? 'a quiet week' : 'with deadlines in this week'}</p>
        </div>
      </div>
    </div>
  );
}
