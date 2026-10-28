import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useApp } from "../lib/store";
import { dueLabel, dueStatusOf, diffDays, formatDate, greetingFor, fullDateLong, parseISO } from "../lib/dates";
import { subjectStyle } from "../lib/subjects";
import { greetStudent } from "../lib/data";
import { ArrowUpRight, AlertTriangle, CheckCircle2, Clock, CalendarCheck, Zap, CircleDashed, Flame } from "lucide-react";
import { PRIORITY_STYLE } from "../components/Header";

export default function Home() {
  const { tasks, profile, today, openTask } = useApp();

  const open = tasks.filter((t) => !t.completed);
  const done = tasks.filter((t) => t.completed);
  const overdue = open.filter((t) => dueStatusOf(t.due, false, today) === "overdue");
  const openHours = open.reduce((s, t) => s + t.hours, 0);

  // Rank: not completed first, then score, then due-soonest.
  const ranked = useMemo(() =>
    [...tasks].sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      if (b.score !== a.score) return b.score - a.score;
      return diffDays(today, a.due) - diffDays(today, b.due);
    }), [tasks, today]);

  const top = ranked.find((t) => !t.completed);
  const queue = ranked.filter((t) => !t.completed).slice(0, 5);

  // Coming up: incomplete & due today or tomorrow only. Today first, then tomorrow.
  const comingUp = useMemo(() => {
    const todays = open.filter((t) => dueStatusOf(t.due, false, today) === "today");
    const tomorrows = open.filter((t) => dueStatusOf(t.due, false, today) === "tomorrow");
    const byScore = (a: (typeof open)[number], b: (typeof open)[number]) => b.score - a.score;
    return [...todays.sort(byScore), ...tomorrows.sort(byScore)];
  }, [tasks, today]); // eslint-disable-line react-hooks/exhaustive-deps

  // This week's progress: tasks completed in the last 7 days + completed today.
  const weekProgress = done.filter((t) => {
    if (!t.completedAt) return false;
    const days = (Date.now() - new Date(t.completedAt).getTime()) / 86400000;
    return days <= 7;
  }).length;
  const weekGoal = Math.max(tasks.length, 1);
  const weekPct = Math.min(100, Math.round((done.length / weekGoal) * 100));

  const firstName = profile ? greetStudent(profile) : "there";
  const greeting = greetingFor(new Date());

  return (
    <div className="animate-fade-in mx-auto w-full max-w-[1400px] px-3 pb-14 pt-5 sm:px-5">
      {/* Greeting row */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-serif-display text-3xl font-bold tracking-tight text-[#152142] sm:text-4xl">
            {greeting}, {firstName}.
          </h1>
          <p className="mt-1 flex items-center gap-2 text-[13.5px] text-[#5d759c]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#d9a62e]" />
            {fullDateLong(new Date())}
          </p>
        </div>
        <div className="text-right text-[12.5px] leading-relaxed text-[#5d759c]">
          <p><span className="font-semibold text-[#152142]">{open.length}</span> open tasks</p>
          <p><span className="font-semibold text-[#152142]">{openHours.toFixed(1)}h</span> workload ahead</p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* ---- Left column (2/3): Top priority + Queue ---- */}
        <div className="space-y-4 lg:col-span-2">
          {/* Top priority — dark navy panel */}
          {top && (
            <section className="relative overflow-hidden rounded-2xl bg-[#152142] p-5 text-[#f6f3ec] shadow-[0_12px_40px_rgba(21,33,66,0.22)] sm:p-6">
              <div className="dotted pointer-events-none absolute inset-0 opacity-[0.16]" />
              <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-[#d9a62e]/10" />
              <div className="relative">
                <div className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-[#d9a62e]">
                    <Zap size={13} strokeWidth={2.6} /> Top priority
                  </span>
                  <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${PRIORITY_STYLE[top.priority]} !border-white/20`}>
                    {top.priority} · {top.score}
                  </span>
                </div>

                <h2 className="font-serif-display mt-3 text-[22px] font-bold leading-snug sm:text-2xl">{top.title}</h2>

                <div className="mt-3 flex flex-wrap items-center gap-2 text-[12px]">
                  <span className="rounded-md bg-white/10 px-2 py-1 font-medium" style={{ color: subjectStyle(top.subject).bar }}>
                    {top.subject}
                  </span>
                  <span className="rounded-md bg-white/10 px-2 py-1 text-[#c9d6ec]">{top.type}</span>
                  <span className="rounded-md bg-white/10 px-2 py-1 text-[#c9d6ec]">{top.hours}h est.</span>
                  <span className={`rounded-md px-2 py-1 font-semibold ${dueStatusOf(top.due, false, today) === "overdue" ? "bg-[#8f2d2d] text-[#ffd9d9]" : "bg-[#d9a62e] text-[#152142]"}`}>
                    {dueLabel(top.due, false, today)}
                  </span>
                </div>

                <p className="mt-4 max-w-xl text-[13px] leading-relaxed text-[#c9d6ec]">
                  Ranked first because it combines a <span className="font-semibold text-[#f0dcb0]">score of {top.score}</span> with{" "}
                  {dueStatusOf(top.due, false, today) === "overdue"
                    ? <span className="font-semibold text-[#ffd9d9]">overdue risk</span>
                    : <span className="font-semibold text-[#f0dcb0]">a near-term deadline</span>}
                  {" "}and <span className="font-semibold text-[#f0dcb0]">{top.hours}h</span> of required work.
                </p>

                <div className="mt-5 flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => openTask(top.id)}
                    className="flex items-center gap-1.5 rounded-lg bg-[#d9a62e] px-4 py-2.5 text-[13.5px] font-bold text-[#152142] shadow transition hover:bg-[#e0b23c] active:translate-y-px"
                  >
                    Open task <ArrowUpRight size={16} strokeWidth={2.6} />
                  </button>
                  <Link to="/tasks" className="text-[13px] font-medium text-[#c9d6ec] underline-offset-4 hover:text-white hover:underline">
                    View all tasks
                  </Link>
                </div>
              </div>
            </section>
          )}

          {/* Top of the queue */}
          <section className="rounded-2xl border border-[#dde6f2] bg-white p-5 shadow-[0_1px_2px_rgba(21,33,66,0.05),0_4px_16px_rgba(21,33,66,0.06)]">
            <div className="flex items-center justify-between">
              <h3 className="font-serif-display text-lg font-bold text-[#152142]">Top of the queue</h3>
              <Link to="/tasks" className="text-[12.5px] font-medium text-[#5d759c] hover:text-[#152142]">See all →</Link>
            </div>
            <ul className="mt-3 divide-y divide-[#eef1f6]">
              {queue.map((t, i) => {
                const st = subjectStyle(t.subject);
                const overdue = dueStatusOf(t.due, false, today) === "overdue";
                return (
                  <li key={t.id} className="flex items-center gap-3 py-3 first:pt-1 last:pb-0">
                    <span className="w-5 text-center font-serif-display text-[15px] font-bold text-[#8aa0c4]">{i + 1}</span>
                    <span className="mt-0.5 h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: st.dot }} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[14px] font-medium text-[#1c2438]">{t.title}</p>
                      <p className="text-[12px] text-[#8494ad]">{t.subject} · {t.hours}h · {formatDate(t.due)}</p>
                    </div>
                    <span className={`shrink-0 rounded-md px-2 py-1 text-[11px] font-bold ${overdue ? "bg-[#f8e3e3] text-[#8f2d2d]" : "bg-[#e9eef8] text-[#3a5a8a]"}`}>
                      {dueLabel(t.due, false, today)}
                    </span>
                    <span className="w-11 shrink-0 text-right text-[13px] font-bold text-[#152142]">{t.score}</span>
                  </li>
                );
              })}
              {queue.length === 0 && (
                <li className="py-8 text-center text-[13px] text-[#8494ad]">No open tasks. Add one to get started.</li>
              )}
            </ul>
          </section>

          {/* Coming up — today & tomorrow only */}
          <section className="rounded-2xl border border-[#dde6f2] bg-white p-5 shadow-[0_1px_2px_rgba(21,33,66,0.05),0_4px_16px_rgba(21,33,66,0.06)]">
            <div className="flex items-center justify-between">
              <h3 className="flex items-center gap-2 font-serif-display text-lg font-bold text-[#152142]">
                <CalendarCheck size={18} className="text-[#d9a62e]" /> Coming up
              </h3>
              <span className="text-[12px] text-[#8494ad]">Today &amp; tomorrow</span>
            </div>
            {comingUp.length === 0 ? (
              <p className="mt-4 rounded-xl border border-dashed border-[#dde6f2] bg-[#f8fafc] px-4 py-6 text-center text-[13.5px] text-[#8494ad]">
                Nothing due today or tomorrow.
              </p>
            ) : (
              <div className="mt-3 space-y-2.5">
                {comingUp.map((t) => {
                  const st = subjectStyle(t.subject);
                  const isToday = dueStatusOf(t.due, false, today) === "today";
                  return (
                    <button
                      key={t.id}
                      onClick={() => openTask(t.id)}
                      className="group flex w-full items-center gap-3 rounded-xl border border-[#dde6f2] bg-[#fbf9f4] px-3.5 py-3 text-left transition hover:border-[#d9a62e] hover:bg-[#f6f3ec]"
                    >
                      <span className={`shrink-0 rounded-lg px-2.5 py-1.5 text-[11.5px] font-bold ${isToday ? "bg-[#d9a62e] text-[#152142]" : "bg-[#e9eef8] text-[#3a5a8a]"}`}>
                        {isToday ? "TODAY" : "TOMORROW"}
                      </span>
                      <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: st.dot }} />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[14px] font-medium text-[#1c2438] group-hover:text-[#152142]">{t.title}</span>
                        <span className="block text-[12px] text-[#8494ad]">{t.subject} · {t.hours}h</span>
                      </span>
                      <ArrowUpRight size={15} className="shrink-0 text-[#8aa0c4] transition group-hover:text-[#d9a62e]" />
                    </button>
                  );
                })}
              </div>
            )}
          </section>
        </div>

        {/* ---- Right column: summary cards ---- */}
        <div className="space-y-4">
          <SummaryCard
            icon={<CheckCircle2 size={20} className="text-[#2f9c84]" />}
            label="Completed"
            value={String(done.length)}
            sub={`${weekProgress} this week`}
            tone="#2f9c84"
          />
          <SummaryCard
            icon={<AlertTriangle size={20} className="text-[#c0526b]" />}
            label="Overdue"
            value={String(overdue.length)}
            sub={overdue.length ? `${overdue.reduce((s, t) => s + t.hours, 0).toFixed(1)}h overdue` : "Nothing overdue"}
            tone="#c0526b"
            highlight={overdue.length > 0}
          />
          <SummaryCard
            icon={<Clock size={20} className="text-[#d9a62e]" />}
            label="Open workload"
            value={`${openHours.toFixed(1)}h`}
            sub={`${open.length} tasks remaining`}
            tone="#d9a62e"
          />
          <div className="rounded-2xl border border-[#dde6f2] bg-white p-5 shadow-[0_1px_2px_rgba(21,33,66,0.05),0_4px_16px_rgba(21,33,66,0.06)]">
            <div className="flex items-center justify-between">
              <h3 className="flex items-center gap-2 font-serif-display text-[16px] font-bold text-[#152142]">
                <Flame size={17} className="text-[#d9a62e]" /> This week's progress
              </h3>
              <span className="text-[13px] font-bold text-[#152142]">{weekPct}%</span>
            </div>
            <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-[#eef1f6]">
              <div className="h-full rounded-full bg-[#d9a62e] transition-all duration-500" style={{ width: `${weekPct}%` }} />
            </div>
            <p className="mt-2 text-[12.5px] text-[#8494ad]">{done.length} of {weekGoal} tasks completed overall</p>
          </div>

          <div className="rounded-2xl border border-[#152142] bg-[#152142] p-5 text-[#f6f3ec]">
            <h3 className="flex items-center gap-2 font-serif-display text-[16px] font-bold">
              <CircleDashed size={16} className="text-[#d9a62e]" /> Focus tip
            </h3>
            <p className="mt-2.5 text-[13px] leading-relaxed text-[#c9d6ec]">
              {overdue.length > 0
                ? `You have ${overdue.length} overdue task${overdue.length > 1 ? "s" : ""}. Clear the top overdue item first to protect the rest of your week.`
                : top
                  ? `Start with “${top.title}” — it's your highest-ranked task and due ${dueLabel(top.due, false, today).toLowerCase()}.`
                  : "No open tasks — you're all caught up. Reset the demo data any time."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ icon, label, value, sub, tone, highlight }: {
  icon: React.ReactNode; label: string; value: string; sub: string; tone: string; highlight?: boolean;
}) {
  return (
    <div className={`flex items-center gap-4 rounded-2xl border p-5 shadow-[0_1px_2px_rgba(21,33,66,0.05),0_4px_16px_rgba(21,33,66,0.06)] ${highlight ? "border-[#eebcbc] bg-[#fdf6f6]" : "border-[#dde6f2] bg-white"}`}>
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: `${tone}1a` }}>
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-[12px] font-semibold uppercase tracking-wider text-[#8494ad]">{label}</p>
        <p className="font-serif-display text-[26px] font-bold leading-tight text-[#152142]">{value}</p>
        <p className="truncate text-[12px] text-[#8494ad]">{sub}</p>
      </div>
    </div>
  );
}
