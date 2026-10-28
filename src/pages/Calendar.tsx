import { useMemo, useState } from "react";
import { useApp } from "../lib/store";
import { weekStartISO, addWeeksISO, toLocalISO, parseISO, todayISO, diffDays, formatDate, dueStatusOf } from "../lib/dates";
import { subjectStyle } from "../lib/subjects";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";

export default function Calendar() {
  const { tasks, today, openTask } = useApp();
  const [weekStart, setWeekStart] = useState<string>(() => weekStartISO(todayISO()));

  const days = useMemo(() => {
    const arr: string[] = [];
    for (let i = 0; i < 7; i++) arr.push(toLocalISO(new Date(parseISO(weekStart).getTime() + i * 86400000)));
    return arr;
  }, [weekStart]);

  const tasksByDay = useMemo(() => {
    const map: Record<string, typeof tasks> = {};
    for (const d of days) map[d] = [];
    for (const t of tasks) {
      if (map[t.due]) map[t.due].push(t);
    }
    for (const d of days) {
      map[d].sort((a, b) => {
        if (a.completed !== b.completed) return a.completed ? 1 : -1;
        return b.score - a.score;
      });
    }
    return map;
  }, [tasks, days]);

  const weekTasks = days.flatMap((d) => tasksByDay[d] ?? []);
  const deadlines = weekTasks.filter((t) => !t.completed).length;
  const hoursDue = weekTasks.filter((t) => !t.completed).reduce((s, t) => s + t.hours, 0);
  const subjectsTouched = new Set(weekTasks.filter((t) => !t.completed).map((t) => t.subject)).size;

  const weekLabel = useMemo(() => {
    const a = parseISO(days[0]);
    const b = parseISO(days[6]);
    const opts: Intl.DateTimeFormatOptions = { month: "long", day: "numeric" };
    const sameMonth = a.getMonth() === b.getMonth();
    return sameMonth
      ? `${a.toLocaleDateString(undefined, opts)} – ${b.toLocaleDateString(undefined, { day: "numeric" })}, ${b.getFullYear()}`
      : `${a.toLocaleDateString(undefined, { month: "long", day: "numeric" })} – ${b.toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })}`;
  }, [days]);

  const isThisWeek = weekStart === weekStartISO(today);

  return (
    <div className="animate-fade-in mx-auto w-full max-w-[1400px] px-3 pb-14 pt-6 sm:px-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-serif-display text-3xl font-bold tracking-tight text-[#152142]">Calendar</h1>
          <p className="mt-1 text-[13.5px] text-[#5d759c]">{weekLabel}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setWeekStart((w) => addWeeksISO(w, -1))}
            aria-label="Previous week"
            className="rounded-lg border border-[#dde6f2] bg-white p-2.5 text-[#4a5568] shadow-sm transition hover:bg-[#f6f3ec] hover:text-[#152142]"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={() => setWeekStart(weekStartISO(todayISO()))}
            disabled={isThisWeek}
            className={`rounded-lg border px-4 py-2.5 text-[13px] font-semibold shadow-sm transition ${
              isThisWeek ? "cursor-default border-[#dde6f2] bg-[#eef1f6] text-[#8494ad]" : "border-[#dde6f2] bg-white text-[#152142] hover:bg-[#f6f3ec]"
            }`}
          >
            This week
          </button>
          <button
            onClick={() => setWeekStart((w) => addWeeksISO(w, 1))}
            aria-label="Next week"
            className="rounded-lg border border-[#dde6f2] bg-white p-2.5 text-[#4a5568] shadow-sm transition hover:bg-[#f6f3ec] hover:text-[#152142]"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-[#dde6f2] bg-white p-4 shadow-sm">
          <p className="text-[11.5px] font-bold uppercase tracking-wider text-[#8494ad]">Deadlines</p>
          <p className="font-serif-display text-[28px] font-bold text-[#152142]">{deadlines}</p>
          <p className="text-[12px] text-[#8494ad]">open tasks this week</p>
        </div>
        <div className="rounded-2xl border border-[#dde6f2] bg-white p-4 shadow-sm">
          <p className="text-[11.5px] font-bold uppercase tracking-wider text-[#8494ad]">Hours due</p>
          <p className="font-serif-display text-[28px] font-bold text-[#152142]">{hoursDue.toFixed(1)}h</p>
          <p className="text-[12px] text-[#8494ad]">total estimated effort due</p>
        </div>
        <div className="rounded-2xl border border-[#dde6f2] bg-white p-4 shadow-sm">
          <p className="text-[11.5px] font-bold uppercase tracking-wider text-[#8494ad]">Subjects touched</p>
          <p className="font-serif-display text-[28px] font-bold text-[#152142]">{subjectsTouched}</p>
          <p className="text-[12px] text-[#8494ad]">distinct subjects with open work</p>
        </div>
      </div>

      {/* Week grid */}
      <div className="mt-4 overflow-hidden rounded-2xl border border-[#dde6f2] bg-white shadow-[0_1px_2px_rgba(21,33,66,0.05),0_4px_16px_rgba(21,33,66,0.06)]">
        {/* header row */}
        <div className="grid grid-cols-7 border-b border-[#eef1f6] bg-[#f8fafc]">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
            <div key={d} className="px-2 py-3 text-center text-[11px] font-bold uppercase tracking-wider text-[#5d759c] sm:text-[12px]">
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {days.map((iso, idx) => {
            const isToday = iso === today;
            const dayTasks = tasksByDay[iso] ?? [];
            const dateLabel = parseISO(iso).getDate();
            return (
              <div
                key={iso}
                className={`min-h-[150px] border-r border-[#eef1f6] p-1.5 last:border-r-0 sm:min-h-[200px] sm:p-2 ${
                  isToday ? "bg-[#fdf8ea]" : "bg-white"
                }`}
              >
                <div className="flex items-center justify-between px-0.5">
                  <span className={`flex h-7 w-7 items-center justify-center rounded-full text-[13px] font-bold ${isToday ? "bg-[#d9a62e] text-[#152142]" : "text-[#4a5568]"}`}>
                    {dateLabel}
                  </span>
                  {isToday && <CalendarDays size={13} className="text-[#d9a62e]" />}
                </div>
                <div className="mt-1.5 space-y-1">
                  {dayTasks.map((t) => {
                    const st = subjectStyle(t.subject);
                    const overdue = dueStatusOf(t.due, t.completed, today) === "overdue";
                    return (
                      <button
                        key={t.id}
                        onClick={() => openTask(t.id)}
                        title={t.title}
                        className={`block w-full rounded-md border-l-[3px] px-1.5 py-1 text-left transition hover:brightness-95 ${t.completed ? "opacity-50" : ""}`}
                        style={{ backgroundColor: st.bg, borderLeftColor: st.dot }}
                      >
                        <p className={`font-bold leading-tight text-[10.5px] sm:text-[11.5px] ${t.completed ? "line-through" : ""}`} style={{ color: t.completed ? "#8494ad" : st.text }}>
                          {t.title}
                        </p>
                        <p className="mt-0.5 flex items-center justify-between text-[9.5px] font-semibold sm:text-[10.5px]" style={{ color: st.text }}>
                          <span>{t.hours}h</span>
                          <span className={overdue ? "text-[#8f2d2d]" : ""}>{t.completed ? "Done" : overdue ? "Overdue" : `S${t.score}`}</span>
                        </p>
                      </button>
                    );
                  })}
                  {dayTasks.length === 0 && <div className="h-1" />}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
