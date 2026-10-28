import { AlarmClock, ArrowRight, BookOpenCheck, CheckCircle2, Flame, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useStore } from '../lib/store';
import { computeScore, recommendedAction, sortByScoreDesc, whyRankedFirst } from '../lib/score';
import { diffDays, dueInfo, fmtHours, formatLong, greetingForHour, startOfWeekISO } from '../lib/date';
import { SubjectBadge, SubjectDot } from '../components/SubjectBadge';
import { DueChip } from '../components/DueChip';

export default function Home() {
  const { profile, tasks, today, openEditTask } = useStore();
  if (!profile) return null;

  const firstName = profile.name.trim().split(/\s+/)[0];
  const greeting = greetingForHour(new Date().getHours());

  const open = tasks.filter((t) => !t.completed);
  const done = tasks.filter((t) => t.completed);
  const overdue = open.filter((t) => diffDays(today, t.dueDate) < 0);
  const openHours = open.reduce((s, t) => s + t.hours, 0);
  const doneHours = done.reduce((s, t) => s + t.hours, 0);

  const queue = sortByScoreDesc(open, today);
  const top = queue[0];

  // Strict "Coming up": ONLY incomplete tasks due today or tomorrow.
  // Overdue (diff < 0) and 2+ days out (diff >= 2) are excluded here — they
  // still appear on Tasks, Calendar, and Analytics.
  const comingUp = open
    .filter((t) => {
      const diff = diffDays(today, t.dueDate);
      return diff === 0 || diff === 1;
    })
    .sort((a, b) => {
      const da = diffDays(today, a.dueDate);
      const db = diffDays(today, b.dueDate);
      if (da !== db) return da - db; // today first, then tomorrow
      return computeScore(b, today) - computeScore(a, today);
    });

  // This week's progress: Mon–Sun window around today.
  const weekStart = startOfWeekISO(today);
  const inWeek = (iso: string) => {
    const d = diffDays(weekStart, iso);
    return d >= 0 && d <= 6;
  };
  const doneThisWeek = done.filter((t) => t.completedAt && inWeek(t.completedAt));
  const openDueThisWeek = open.filter((t) => inWeek(t.dueDate));
  const weekTotal = doneThisWeek.length + openDueThisWeek.length;
  const weekPct = weekTotal === 0 ? 0 : Math.round((doneThisWeek.length / weekTotal) * 100);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      {/* Greeting */}
      <div className="fade-up">
        <p className="text-xs font-bold tracking-[0.22em] text-gold-deep uppercase">{formatLong(today)}</p>
        <h1 className="font-display mt-1.5 text-3xl font-semibold text-navy sm:text-4xl">
          {greeting}, {firstName}.
        </h1>
        <p className="mt-2 text-sm text-mist">
          You have <strong className="font-semibold text-ink">{open.length} open task{open.length === 1 ? '' : 's'}</strong> totaling{' '}
          <strong className="font-semibold text-ink">{fmtHours(openHours)}</strong> of estimated work
          {overdue.length > 0 ? (
            <> — including <strong className="font-semibold text-danger">{overdue.length} overdue</strong>.</>
          ) : (
            <> — nothing overdue. Nice.</>
          )}
        </p>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Top priority */}
        <section className="fade-up lg:col-span-2" style={{ animationDelay: '80ms' }} aria-label="Top priority">
          {top ? (
            <div className="relative flex h-full flex-col overflow-hidden rounded-2xl bg-navy p-6 text-cream shadow-lg sm:p-8">
              <div
                className="pointer-events-none absolute inset-0 opacity-[0.06]"
                style={{
                  backgroundImage:
                    'repeating-linear-gradient(45deg, #f4ede0 0, #f4ede0 1px, transparent 1px, transparent 14px)',
                }}
              />
              <div className="relative flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-center gap-2 text-[11px] font-bold tracking-[0.25em] text-gold uppercase">
                  <Flame size={14} />
                  Top priority
                </div>
                <div className="text-right">
                  <div className="font-display text-4xl leading-none font-semibold text-gold">
                    {computeScore(top, today)}
                  </div>
                  <div className="text-[10px] font-semibold tracking-wider text-mist-soft uppercase">Priority score / 100</div>
                </div>
              </div>

              <h2 className="font-display relative mt-3 max-w-xl text-2xl leading-snug font-semibold sm:text-3xl">
                {top.title}
              </h2>

              <div className="relative mt-4 flex flex-wrap items-center gap-2">
                <SubjectBadge subject={top.subject} />
                <span className="rounded-full bg-cream/10 px-2.5 py-0.5 text-[11px] font-semibold text-cream/85">{top.type}</span>
                <span className="rounded-full bg-cream/10 px-2.5 py-0.5 text-[11px] font-semibold text-cream/85">
                  {fmtHours(top.hours)} est.
                </span>
                <DueChip today={today} dueDate={top.dueDate} />
                <span className="rounded-full bg-cream/10 px-2.5 py-0.5 text-[11px] font-semibold text-cream/85">
                  {top.importance} priority
                </span>
              </div>

              <p className="relative mt-4 max-w-xl text-sm leading-relaxed text-mist-soft">{whyRankedFirst(top, today)}</p>

              <div className="relative mt-5 flex flex-col gap-4 rounded-xl bg-cream/8 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-2.5 text-sm leading-relaxed text-cream/90">
                  <TrendingUp size={16} className="mt-0.5 shrink-0 text-gold" />
                  <span>{recommendedAction(top, today)}</span>
                </div>
                <button
                  onClick={() => openEditTask(top.id)}
                  className="flex shrink-0 items-center justify-center gap-2 rounded-lg bg-gold px-5 py-2.5 text-sm font-bold text-navy shadow-sm transition hover:bg-gold-deep hover:text-cream focus-visible:ring-2 focus-visible:ring-cream focus-visible:outline-none"
                >
                  Open task
                  <ArrowRight size={15} strokeWidth={2.5} />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex h-full flex-col items-center justify-center rounded-2xl bg-navy p-10 text-center text-cream shadow-lg">
              <CheckCircle2 size={36} className="text-gold" />
              <h2 className="font-display mt-3 text-2xl font-semibold">Queue cleared.</h2>
              <p className="mt-1 text-sm text-mist-soft">No open tasks — add one with “New task” when the next assignment lands.</p>
            </div>
          )}
        </section>

        {/* Coming up — STRICT: today + tomorrow only */}
        <section
          className="fade-up rounded-2xl border border-line bg-cream p-5 shadow-sm"
          style={{ animationDelay: '160ms' }}
          aria-label="Coming up"
        >
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold text-navy">Coming up</h2>
            <span className="text-[10px] font-bold tracking-wider text-mist-soft uppercase">Today &amp; tomorrow</span>
          </div>
          {comingUp.length === 0 ? (
            <div className="mt-6 flex flex-col items-center rounded-xl border border-dashed border-line bg-white/60 px-4 py-8 text-center">
              <AlarmClock size={22} className="text-mist-soft" />
              <p className="mt-2 text-sm font-semibold text-mist">Nothing due today or tomorrow.</p>
            </div>
          ) : (
            <ul className="mt-4 space-y-2.5">
              {comingUp.map((t) => (
                <li key={t.id}>
                  <button
                    onClick={() => openEditTask(t.id)}
                    className="flex w-full items-center gap-3 rounded-xl border border-line bg-white px-3.5 py-3 text-left transition hover:border-gold hover:shadow-sm focus-visible:ring-2 focus-visible:ring-gold focus-visible:outline-none"
                  >
                    <SubjectDot subject={t.subject} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-ink">{t.title}</span>
                      <span className="mt-0.5 block text-xs text-mist">
                        {t.subject} · {fmtHours(t.hours)}
                      </span>
                    </span>
                    <DueChip today={today} dueDate={t.dueDate} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {/* Summary cards */}
      <div className="fade-up mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4" style={{ animationDelay: '240ms' }}>
        <SummaryCard
          icon={<CheckCircle2 size={18} />}
          label="Completed"
          value={String(done.length)}
          sub={`${fmtHours(doneHours)} of work finished`}
        />
        <SummaryCard
          icon={<AlarmClock size={18} />}
          label="Overdue"
          value={String(overdue.length)}
          sub={overdue.length > 0 ? `${fmtHours(overdue.reduce((s, t) => s + t.hours, 0))} needs rescue` : 'All caught up'}
          tone={overdue.length > 0 ? 'danger' : 'default'}
        />
        <SummaryCard
          icon={<BookOpenCheck size={18} />}
          label="Open workload"
          value={fmtHours(openHours)}
          sub={`across ${open.length} task${open.length === 1 ? '' : 's'}`}
        />
        <div className="rounded-2xl border border-line bg-cream p-4 shadow-sm">
          <div className="flex items-center gap-2 text-mist">
            <TrendingUp size={18} />
            <span className="text-[11px] font-bold tracking-wider uppercase">This week</span>
          </div>
          <div className="font-display mt-2 text-2xl font-semibold text-navy">{weekPct}%</div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-line">
            <div className="h-full rounded-full bg-gold transition-all duration-500" style={{ width: `${weekPct}%` }} />
          </div>
          <p className="mt-1.5 text-xs text-mist">
            {doneThisWeek.length} done · {openDueThisWeek.length} still due this week
          </p>
        </div>
      </div>

      {/* Top of the queue */}
      <section className="fade-up mt-6 rounded-2xl border border-line bg-cream p-5 shadow-sm sm:p-6" style={{ animationDelay: '320ms' }}>
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-lg font-semibold text-navy">Top of the queue</h2>
            <p className="text-xs text-mist">Your highest-priority open tasks, ranked by score.</p>
          </div>
          <Link
            to="/tasks"
            className="flex shrink-0 items-center gap-1 rounded-lg px-2 py-1 text-xs font-bold text-gold-deep transition hover:text-navy focus-visible:ring-2 focus-visible:ring-gold focus-visible:outline-none"
          >
            All tasks
            <ArrowRight size={13} strokeWidth={2.5} />
          </Link>
        </div>
        {queue.length === 0 ? (
          <p className="mt-5 rounded-xl border border-dashed border-line bg-white/60 px-4 py-6 text-center text-sm font-semibold text-mist">
            The queue is empty — add a task to get started.
          </p>
        ) : (
          <ol className="mt-4 divide-y divide-line">
            {queue.slice(0, 5).map((t, i) => {
              const info = dueInfo(today, t.dueDate);
              return (
                <li key={t.id}>
                  <button
                    onClick={() => openEditTask(t.id)}
                    className="flex w-full items-center gap-3 px-1 py-3 text-left transition hover:bg-linen/70 focus-visible:ring-2 focus-visible:ring-gold focus-visible:outline-none sm:gap-4"
                  >
                    <span className="font-display w-6 shrink-0 text-center text-sm font-semibold text-mist-soft">{i + 1}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-ink">{t.title}</span>
                      <span className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-mist">
                        <SubjectDot subject={t.subject} className="h-1.5 w-1.5" />
                        {t.subject} · {t.type} · {fmtHours(t.hours)}
                      </span>
                    </span>
                    <span className={`hidden text-xs font-semibold sm:block ${info.tone === 'overdue' ? 'text-danger' : 'text-mist'}`}>
                      {info.label}
                    </span>
                    <span className="w-12 shrink-0 text-right">
                      <span className="font-display text-lg font-semibold text-navy">{computeScore(t, today)}</span>
                      <span className="block text-[9px] font-semibold tracking-wide text-mist-soft uppercase">score</span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        )}
      </section>
    </div>
  );
}

function SummaryCard({
  icon,
  label,
  value,
  sub,
  tone = 'default',
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
  tone?: 'default' | 'danger';
}) {
  return (
    <div className="rounded-2xl border border-line bg-cream p-4 shadow-sm">
      <div className={`flex items-center gap-2 ${tone === 'danger' ? 'text-danger' : 'text-mist'}`}>
        {icon}
        <span className="text-[11px] font-bold tracking-wider uppercase">{label}</span>
      </div>
      <div className={`font-display mt-2 text-2xl font-semibold ${tone === 'danger' ? 'text-danger' : 'text-navy'}`}>{value}</div>
      <p className="mt-1 text-xs text-mist">{sub}</p>
    </div>
  );
}
