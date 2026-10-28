import { useMemo } from "react";
import { useApp } from "../lib/store";
import { todayISO, diffDays, weekStartISO, parseISO, addWeeksISO } from "../lib/dates";
import { subjectStyle } from "../lib/subjects";
import { BarChart3, PieChart, TrendingUp, Clock, CheckCircle2 } from "lucide-react";

export default function Analytics() {
  const { tasks, today } = useApp();

  const open = tasks.filter((t) => !t.completed);
  const done = tasks.filter((t) => t.completed);
  const completionRate = tasks.length ? Math.round((done.length / tasks.length) * 100) : 0;
  const avgHoursOpen = open.length ? open.reduce((s, t) => s + t.hours, 0) / open.length : 0;

  // ---- Weekly completion summary (this calendar week: completed tasks count, ) ----
  const ws = weekStartISO(today);
  const weekEnd = addWeeksISO(ws, 1);
  const completedThisWeek = done.filter((t) => {
    if (!t.completedAt) return false;
    const d = t.completedAt.slice(0, 10);
    return d >= ws && d < weekEnd || (t.completedAt && withinWeek(t.completedAt, ws, weekEnd));
  }).length;
  function withinWeek(isoDate: string, s: string, e: string) {
    return isoDate.slice(0, 10) >= s && isoDate.slice(0, 10) < e;
  }
  // also count by due-date within the week for "planned"
  const plannedThisWeek = tasks.filter((t) => t.due >= ws && t.due < weekEnd);
  const completedThisWeekByDue = plannedThisWeek.filter((t) => t.completed).length;

  // ---- Completion-rate visualization: last 6 weeks completion (tasks due that week, % completed) ----
  const weeklySeries = useMemo(() => {
    const weeks: { label: string; planned: number; completed: number }[] = [];
    for (let w = 5; w >= 0; w--) {
      const s = addWeeksISO(ws, -w);
      const e = addWeeksISO(s, 1);
      const inWeek = tasks.filter((t) => t.due >= s && t.due < e);
      const comp = inWeek.filter((t) => t.completed).length;
      const d = parseISO(s);
      weeks.push({
        label: d.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
        planned: inWeek.length,
        completed: comp,
      });
    }
    return weeks;
  }, [tasks, ws]);

  // ---- Planned vs completed by day (next 7 days from today) ----
  const dailyPlan = useMemo(() => {
    const arr: { label: string; planned: number; completed: number; overdue: number }[] = [];
    for (let i = 0; i < 7; i++) {
      const d = todayISO();
      const iso = shiftISO(d, i);
      const inDay = tasks.filter((t) => t.due === iso);
      arr.push({
        label: parseISO(iso).toLocaleDateString(undefined, { weekday: "short" }),
        planned: inDay.filter((t) => !t.completed).length,
        completed: inDay.filter((t) => t.completed).length,
        overdue: 0,
      });
    }
    function shiftISO(iso: string, n: number) {
      const d = parseISO(iso);
      d.setDate(d.getDate() + n);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const da = String(d.getDate()).padStart(2, "0");
      return `${y}-${m}-${da}`;
    }
    return arr;
  }, [tasks, today]);

  // ---- Subject workload bars ----
  const subjectStats = useMemo(() => {
    const map: Record<string, { tasks: number; openHours: number; openTasks: number }> = {};
    for (const t of tasks) {
      if (!map[t.subject]) map[t.subject] = { tasks: 0, openHours: 0, openTasks: 0 };
      map[t.subject].tasks++;
      if (!t.completed) {
        map[t.subject].openTasks++;
        map[t.subject].openHours += t.hours;
      }
    }
    return Object.entries(map).map(([subject, v]) => ({ subject, ...v })).sort((a, b) => b.openHours - a.openHours);
  }, [tasks]);
  const maxSubjectHours = Math.max(1, ...subjectStats.map((s) => s.openHours));

  // ---- Pending vs completed donut ----
  const pendPct = tasks.length ? Math.round((open.length / tasks.length) * 100) : 0;

  return (
    <div className="animate-fade-in mx-auto w-full max-w-[1400px] px-3 pb-14 pt-6 sm:px-5">
      <div>
        <h1 className="font-serif-display text-3xl font-bold tracking-tight text-[#152142]">Analytics</h1>
        <p className="mt-1 text-[13.5px] text-[#5d759c]">Your academic workload at a glance</p>
      </div>

      {/* metric cards */}
      <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MetricCard icon={<CheckCircle2 size={18} className="text-[#2f9c84]" />} label="Completed tasks" value={String(done.length)} sub={`of ${tasks.length} total`} />
        <MetricCard icon={<PieChart size={18} className="text-[#d9a62e]" />} label="Completion rate" value={`${completionRate}%`} sub={`${completedThisWeek} finished this week`} />
        <MetricCard icon={<Clock size={18} className="text-[#5d759c]" />} label="Avg hours / open task" value={`${avgHoursOpen.toFixed(1)}h`} sub={`${open.length} open tasks`} />
        <MetricCard icon={<TrendingUp size={18} className="text-[#3f6ac2]" />} label="Planned this week" value={String(plannedThisWeek.length)} sub={`${completedThisWeekByDue} already done`} />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-5">
        {/* Completion rate (weekly, last 6 weeks) */}
        <section className="rounded-2xl border border-[#dde6f2] bg-white p-5 shadow-sm lg:col-span-2">
          <h3 className="font-serif-display flex items-center gap-2 text-[16px] font-bold text-[#152142]">
            <BarChart3 size={17} className="text-[#d9a62e]" /> Completion rate · 6 weeks
          </h3>
          <div className="mt-4 space-y-3">
            {weeklySeries.map((w) => {
              const pct = w.planned ? Math.round((w.completed / w.planned) * 100) : 0;
              return (
                <div key={w.label}>
                  <div className="flex items-center justify-between text-[12px]">
                    <span className="font-medium text-[#4a5568]">{w.label}</span>
                    <span className="font-bold text-[#152142]">{pct}% <span className="font-normal text-[#8494ad]">({w.completed}/{w.planned})</span></span>
                  </div>
                  <div className="mt-1 h-2.5 overflow-hidden rounded-full bg-[#eef1f6]">
                    <div className="h-full rounded-full bg-[#d9a62e]" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Planned vs completed by day */}
        <section className="rounded-2xl border border-[#dde6f2] bg-white p-5 shadow-sm lg:col-span-3">
          <h3 className="font-serif-display text-[16px] font-bold text-[#152142]">Planned vs completed · next 7 days</h3>
          <div className="mt-4 flex h-48 items-stretch gap-2 sm:gap-3">
            {dailyPlan.map((d, i) => {
              const maxV = Math.max(1, ...dailyPlan.map((x) => x.planned + x.completed));
              const total = d.planned + d.completed;
              return (
                <div key={i} className="flex flex-1 flex-col items-center justify-end gap-1">
                  <span className="text-[11px] font-bold text-[#152142]">{total > 0 ? total : ""}</span>
                  <div className="flex w-full flex-1 flex-col-reverse overflow-hidden rounded-lg bg-[#f4f6f9]">
                    <div className="w-full bg-[#d9a62e]" style={{ height: `${(d.completed / maxV) * 100}%` }} title={`Completed: ${d.completed}`} />
                    <div className="w-full bg-[#8aa0c4]" style={{ height: `${(d.planned / maxV) * 100}%` }} title={`Planned: ${d.planned}`} />
                  </div>
                  <span className={`text-[11px] font-medium ${i === 0 ? "text-[#d9a62e] font-bold" : "text-[#8494ad]"}`}>{d.label}</span>
                </div>
              );
            })}
          </div>
          <div className="mt-3 flex items-center gap-4 text-[11.5px] text-[#5d759c]">
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-[#d9a62e]" /> Completed</span>
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-[#8aa0c4]" /> Planned</span>
          </div>
        </section>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-5">
        {/* Subject workload bars */}
        <section className="rounded-2xl border border-[#dde6f2] bg-white p-5 shadow-sm lg:col-span-3">
          <h3 className="font-serif-display text-[16px] font-bold text-[#152142]">Subject workload</h3>
          <div className="mt-4 space-y-3.5">
            {subjectStats.map((s) => {
              const st = subjectStyle(s.subject);
              return (
                <div key={s.subject}>
                  <div className="flex items-center justify-between text-[12px]">
                    <span className="flex items-center gap-1.5 font-medium text-[#4a5568]">
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: st.dot }} />
                      {s.subject}
                      <span className="text-[#8494ad]">· {s.tasks} task{s.tasks !== 1 ? "s" : ""}</span>
                    </span>
                    <span className="font-bold text-[#152142]">{s.openHours.toFixed(1)}h open</span>
                  </div>
                  <div className="mt-1 h-3 overflow-hidden rounded-full bg-[#eef1f6]">
                    <div className="h-full rounded-full" style={{ width: `${(s.openHours / maxSubjectHours) * 100}%`, backgroundColor: st.bar }} />
                  </div>
                </div>
              );
            })}
            {subjectStats.length === 0 && <p className="py-8 text-center text-[13px] text-[#8494ad]">No tasks yet.</p>}
          </div>
        </section>

        {/* Pending vs completed donut */}
        <section className="rounded-2xl border border-[#dde6f2] bg-white p-5 shadow-sm lg:col-span-2">
          <h3 className="font-serif-display text-[16px] font-bold text-[#152142]">Status breakdown</h3>
          <div className="mt-4 flex items-center justify-center">
            <svg width="150" height="150" viewBox="0 0 42 42" role="img" aria-label="Status breakdown chart">
              <circle cx="21" cy="21" r="15.9155" fill="none" stroke="#d9a62e" strokeWidth="5"
                strokeDasharray={`${100 - pendPct} ${pendPct}`}
                strokeDashoffset="25" strokeLinecap="butt" />
              <circle cx="21" cy="21" r="15.9155" fill="none" stroke="#8aa0c4" strokeWidth="5"
                strokeDasharray={`${pendPct} ${100 - pendPct}`}
                strokeDashoffset={`${25 + (100 - pendPct)}`} strokeLinecap="butt" />
              <text x="21" y="19" textAnchor="middle" fontSize="7.5" fontWeight="bold" fill="#152142">{completionRate}%</text>
              <text x="21" y="25" textAnchor="middle" fontSize="3" fill="#8494ad">done</text>
            </svg>
          </div>
          <div className="mt-4 space-y-2 text-[12.5px]">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-[#4a5568]"><span className="h-2.5 w-2.5 rounded-sm bg-[#d9a62e]" /> Completed</span>
              <span className="font-bold text-[#152142]">{done.length} ({100 - pendPct}%)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-[#4a5568]"><span className="h-2.5 w-2.5 rounded-sm bg-[#8aa0c4]" /> Pending</span>
              <span className="font-bold text-[#152142]">{open.length} ({pendPct}%)</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function MetricCard({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string; sub: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-[#dde6f2] bg-white p-4 shadow-sm">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#f4f6f9]">{icon}</span>
      <div className="min-w-0">
        <p className="text-[11px] font-bold uppercase tracking-wider text-[#8494ad]">{label}</p>
        <p className="font-serif-display text-[22px] font-bold leading-tight text-[#152142]">{value}</p>
        <p className="truncate text-[11.5px] text-[#8494ad]">{sub}</p>
      </div>
    </div>
  );
}
