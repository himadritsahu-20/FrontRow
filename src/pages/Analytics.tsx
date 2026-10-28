import { CheckCircle2, Clock3, Hourglass, ListTodo } from 'lucide-react';
import { useStore } from '../lib/store';
import { addDaysISO, diffDays, fmtHours, formatWeekday, startOfWeekISO } from '../lib/date';
import { subjectColor } from '../lib/subjects';

export default function Analytics() {
  const { tasks, today } = useStore();

  const open = tasks.filter((t) => !t.completed);
  const done = tasks.filter((t) => t.completed);
  const openHours = open.reduce((s, t) => s + t.hours, 0);
  const doneHours = done.reduce((s, t) => s + t.hours, 0);
  const overdue = open.filter((t) => diffDays(today, t.dueDate) < 0);
  const avgOpenHours = open.length === 0 ? 0 : openHours / open.length;

  const completionRate = tasks.length === 0 ? 0 : Math.round((done.length / tasks.length) * 100);

  // This week (Mon–Sun)
  const weekStart = startOfWeekISO(today);
  const days = Array.from({ length: 7 }, (_, i) => addDaysISO(weekStart, i));
  const doneThisWeek = done.filter((t) => t.completedAt && t.completedAt >= days[0] && t.completedAt <= days[6]);
  const doneThisWeekHours = doneThisWeek.reduce((s, t) => s + t.hours, 0);
  const dueThisWeek = tasks.filter((t) => t.dueDate >= days[0] && t.dueDate <= days[6]);

  // Planned vs completed hours per weekday
  const byDay = days.map((iso) => ({
    iso,
    planned: tasks.filter((t) => t.dueDate === iso).reduce((s, t) => s + t.hours, 0),
    completed: done.filter((t) => t.completedAt === iso).reduce((s, t) => s + t.hours, 0),
  }));
  const maxDay = Math.max(1, ...byDay.map((d) => Math.max(d.planned, d.completed)));

  // Subject workload (open tasks)
  const subjectMap = new Map<string, { openCount: number; openHours: number; doneCount: number }>();
  for (const t of tasks) {
    const e = subjectMap.get(t.subject) ?? { openCount: 0, openHours: 0, doneCount: 0 };
    if (t.completed) e.doneCount += 1;
    else {
      e.openCount += 1;
      e.openHours += t.hours;
    }
    subjectMap.set(t.subject, e);
  }
  const subjectRows = [...subjectMap.entries()]
    .map(([subject, v]) => ({ subject, ...v }))
    .sort((a, b) => b.openHours - a.openHours);
  const maxSubjectHours = Math.max(1, ...subjectRows.map((r) => r.openHours));

  // Donut geometry
  const R = 52;
  const C = 2 * Math.PI * R;
  const donutFill = (completionRate / 100) * C;

  const pendingPct = tasks.length === 0 ? 0 : Math.round((open.length / tasks.length) * 100);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="fade-up">
        <h1 className="font-display text-3xl font-semibold text-navy">Analytics</h1>
        <p className="mt-1.5 text-sm text-mist">Everything below is computed live from your task list.</p>
      </div>

      {/* Metric cards */}
      <div className="fade-up mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4" style={{ animationDelay: '80ms' }}>
        <Metric icon={<CheckCircle2 size={17} />} label="Completed tasks" value={String(done.length)} sub={`${fmtHours(doneHours)} finished`} />
        <Metric icon={<ListTodo size={17} />} label="Open tasks" value={String(open.length)} sub={`${fmtHours(openHours)} remaining`} />
        <Metric icon={<Clock3 size={17} />} label="Avg hours / open task" value={fmtHours(Math.round(avgOpenHours * 10) / 10)} sub="estimated effort each" />
        <Metric icon={<Hourglass size={17} />} label="Overdue" value={String(overdue.length)} sub={overdue.length > 0 ? `${fmtHours(overdue.reduce((s, t) => s + t.hours, 0))} past due` : 'all caught up'} danger={overdue.length > 0} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Weekly completion summary */}
        <section className="fade-up rounded-2xl bg-navy p-6 text-cream shadow-lg" style={{ animationDelay: '140ms' }} aria-label="Weekly completion summary">
          <h2 className="text-[11px] font-bold tracking-[0.22em] text-gold uppercase">This week</h2>
          <div className="font-display mt-3 text-4xl font-semibold">
            {doneThisWeek.length}
            <span className="ml-2 text-base font-medium text-mist-soft">task{doneThisWeek.length === 1 ? '' : 's'} completed</span>
          </div>
          <p className="mt-1 text-sm text-mist-soft">{fmtHours(doneThisWeekHours)} of work checked off since Monday.</p>
          <div className="mt-5 space-y-2.5 border-t border-cream/15 pt-4 text-sm">
            <div className="flex justify-between">
              <span className="text-mist-soft">Deadlines falling this week</span>
              <span className="font-semibold">{dueThisWeek.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-mist-soft">…of which still open</span>
              <span className="font-semibold">{dueThisWeek.filter((t) => !t.completed).length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-mist-soft">Hours still due this week</span>
              <span className="font-semibold">{fmtHours(dueThisWeek.filter((t) => !t.completed).reduce((s, t) => s + t.hours, 0))}</span>
            </div>
          </div>
        </section>

        {/* Completion rate donut */}
        <section className="fade-up flex flex-col items-center rounded-2xl border border-line bg-cream p-6 shadow-sm" style={{ animationDelay: '200ms' }} aria-label="Completion rate">
          <h2 className="font-display self-start text-lg font-semibold text-navy">Completion rate</h2>
          <div className="relative mt-4">
            <svg width="150" height="150" viewBox="0 0 130 130" role="img" aria-label={`${completionRate}% of all tasks completed`}>
              <circle cx="65" cy="65" r={R} fill="none" stroke="#dce4ee" strokeWidth="13" />
              <circle
                cx="65"
                cy="65"
                r={R}
                fill="none"
                stroke="#d9a422"
                strokeWidth="13"
                strokeLinecap="round"
                strokeDasharray={`${donutFill} ${C}`}
                transform="rotate(-90 65 65)"
                style={{ transition: 'stroke-dasharray 0.6s ease' }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-display text-3xl font-semibold text-navy">{completionRate}%</span>
              <span className="text-[10px] font-bold tracking-wider text-mist-soft uppercase">completed</span>
            </div>
          </div>
          <p className="mt-3 text-center text-xs text-mist">
            {done.length} of {tasks.length} task{tasks.length === 1 ? '' : 's'} done overall
          </p>
        </section>

        {/* Pending vs completed */}
        <section className="fade-up rounded-2xl border border-line bg-cream p-6 shadow-sm" style={{ animationDelay: '260ms' }} aria-label="Status breakdown">
          <h2 className="font-display text-lg font-semibold text-navy">Status breakdown</h2>
          <div className="mt-5 flex h-5 overflow-hidden rounded-full bg-line" role="img" aria-label={`${open.length} pending, ${done.length} completed`}>
            {open.length > 0 && <div className="h-full bg-gold transition-all duration-500" style={{ width: `${pendingPct}%` }} />}
            {done.length > 0 && <div className="h-full bg-navy transition-all duration-500" style={{ width: `${100 - pendingPct}%` }} />}
          </div>
          <div className="mt-5 space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 font-semibold text-ink">
                <span className="h-3 w-3 rounded-sm bg-gold" /> Pending
              </span>
              <span className="font-bold text-navy">{open.length} <span className="font-medium text-mist">· {fmtHours(openHours)}</span></span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 font-semibold text-ink">
                <span className="h-3 w-3 rounded-sm bg-navy" /> Completed
              </span>
              <span className="font-bold text-navy">{done.length} <span className="font-medium text-mist">· {fmtHours(doneHours)}</span></span>
            </div>
          </div>
        </section>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Planned vs completed by day */}
        <section className="fade-up rounded-2xl border border-line bg-cream p-6 shadow-sm" style={{ animationDelay: '320ms' }} aria-label="Planned versus completed by day">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-display text-lg font-semibold text-navy">Planned vs. completed <span className="text-sm font-normal text-mist">(hours, this week)</span></h2>
          </div>
          <div className="mt-2 flex gap-4 text-[11px] font-semibold text-mist">
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-navy" /> Planned (due)</span>
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-gold" /> Completed</span>
          </div>
          <div className="mt-5 flex h-40 items-end gap-2 sm:gap-3">
            {byDay.map((d) => (
              <div key={d.iso} className="flex flex-1 flex-col items-center gap-1.5">
                <div className="flex h-32 w-full items-end justify-center gap-1">
                  <div
                    className="w-2/5 max-w-5 rounded-t-sm bg-navy transition-all duration-500"
                    style={{ height: `${Math.max(d.planned > 0 ? 6 : 0, (d.planned / maxDay) * 100)}%` }}
                    title={`Planned ${fmtHours(d.planned)}`}
                  />
                  <div
                    className="w-2/5 max-w-5 rounded-t-sm bg-gold transition-all duration-500"
                    style={{ height: `${Math.max(d.completed > 0 ? 6 : 0, (d.completed / maxDay) * 100)}%` }}
                    title={`Completed ${fmtHours(d.completed)}`}
                  />
                </div>
                <span className={`text-[10px] font-bold uppercase ${d.iso === today ? 'text-gold-deep' : 'text-mist-soft'}`}>
                  {formatWeekday(d.iso, true)}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Subject workload */}
        <section className="fade-up rounded-2xl border border-line bg-cream p-6 shadow-sm" style={{ animationDelay: '380ms' }} aria-label="Subject workload">
          <h2 className="font-display text-lg font-semibold text-navy">Subject workload <span className="text-sm font-normal text-mist">(open hours)</span></h2>
          {subjectRows.length === 0 ? (
            <p className="mt-6 rounded-xl border border-dashed border-line bg-white/60 px-4 py-6 text-center text-sm font-semibold text-mist">
              No tasks yet — add some to see the breakdown.
            </p>
          ) : (
            <ul className="mt-5 space-y-3.5">
              {subjectRows.map((r) => {
                const c = subjectColor(r.subject);
                return (
                  <li key={r.subject}>
                    <div className="flex items-baseline justify-between gap-2 text-sm">
                      <span className="font-semibold text-ink">{r.subject}</span>
                      <span className="text-xs font-semibold whitespace-nowrap text-mist">
                        {r.openCount} open · {fmtHours(r.openHours)}
                        {r.doneCount > 0 && <span className="text-mist-soft"> · {r.doneCount} done</span>}
                      </span>
                    </div>
                    <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-line">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${(r.openHours / maxSubjectHours) * 100}%`, backgroundColor: c.bar }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

function Metric({ icon, label, value, sub, danger }: { icon: React.ReactNode; label: string; value: string; sub: string; danger?: boolean }) {
  return (
    <div className="rounded-2xl border border-line bg-cream p-4 shadow-sm">
      <div className={`flex items-center gap-2 ${danger ? 'text-danger' : 'text-mist'}`}>
        {icon}
        <span className="text-[11px] font-bold tracking-wider uppercase">{label}</span>
      </div>
      <div className={`font-display mt-2 text-2xl font-semibold ${danger ? 'text-danger' : 'text-navy'}`}>{value}</div>
      <p className="mt-1 text-xs text-mist">{sub}</p>
    </div>
  );
}
