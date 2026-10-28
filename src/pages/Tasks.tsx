import { useMemo, useState } from "react";
import { useApp } from "../lib/store";
import type { Task } from "../lib/types";
import { dueLabel, dueStatusOf, diffDays, formatDate } from "../lib/dates";
import { subjectStyle, ALL_SUBJECTS } from "../lib/subjects";
import { PRIORITY_STYLE } from "../components/Header";
import { Search, Pencil, Trash2, CheckCircle2, Circle, ChevronDown } from "lucide-react";

type FilterTab = "all" | "critical" | "upcoming" | "done";

export default function Tasks() {
  const { tasks, today, toggleComplete, deleteTask, openTask, openNewTask } = useApp();
  const [tab, setTab] = useState<FilterTab>("all");
  const [query, setQuery] = useState("");
  const [subjectFilter, setSubjectFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");

  const open = tasks.filter((t) => !t.completed);
  const done = tasks.filter((t) => t.completed);
  const openHours = open.reduce((s, t) => s + t.hours, 0);
  const critical = open.filter((t) => t.priority === "Critical").length;
  const upcoming = open.filter((t) => dueStatusOf(t.due, false, today) === "upcoming").length;

  const subjectsInUse = useMemo(() => {
    const s = new Set(tasks.map((t) => t.subject));
    return [...ALL_SUBJECTS.filter((x) => s.has(x)), ...[...s].filter((x) => !ALL_SUBJECTS.includes(x)).sort()];
  }, [tasks]);

  const filtered = useMemo(() => {
    let list = [...tasks];
    if (tab === "critical") list = list.filter((t) => !t.completed && t.priority === "Critical");
    else if (tab === "upcoming") list = list.filter((t) => !t.completed && dueStatusOf(t.due, false, today) === "upcoming");
    else if (tab === "done") list = list.filter((t) => t.completed);
    if (query.trim()) list = list.filter((t) => t.title.toLowerCase().includes(query.trim().toLowerCase()));
    if (subjectFilter !== "all") list = list.filter((t) => t.subject === subjectFilter);
    if (priorityFilter !== "all") list = list.filter((t) => t.priority === priorityFilter);
    // Sort: open first (by score desc then due asc), then done (by completedAt desc).
    list.sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      if (!a.completed && !b.completed) {
        if (b.score !== a.score) return b.score - a.score;
        return diffDays(today, a.due) - diffDays(today, b.due);
      }
      if (a.completed && b.completed) return (b.completedAt ?? "").localeCompare(a.completedAt ?? "");
      return 0;
    });
    return list;
  }, [tasks, tab, query, subjectFilter, priorityFilter, today]);

  const counts = {
    all: tasks.length,
    critical: critical,
    upcoming: upcoming,
    done: done.length,
  };

  const tabs: { id: FilterTab; label: string; count: number }[] = [
    { id: "all", label: "All", count: counts.all },
    { id: "critical", label: "Critical", count: counts.critical },
    { id: "upcoming", label: "Upcoming", count: counts.upcoming },
    { id: "done", label: "Done", count: counts.done },
  ];

  return (
    <div className="animate-fade-in mx-auto w-full max-w-[1400px] px-3 pb-14 pt-6 sm:px-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-serif-display text-3xl font-bold tracking-tight text-[#152142]">Tasks</h1>
          <p className="mt-1 text-[13.5px] text-[#5d759c]">
            <span className="font-semibold text-[#152142]">{open.length}</span> open ·{" "}
            <span className="font-semibold text-[#152142]">{done.length}</span> completed ·{" "}
            <span className="font-semibold text-[#152142]">{openHours.toFixed(1)}h</span> open workload
          </p>
        </div>
        <button
          onClick={openNewTask}
          className="rounded-lg bg-[#d9a62e] px-4 py-2.5 text-[13.5px] font-bold text-[#152142] shadow transition hover:bg-[#c99a25] active:translate-y-px"
        >
          + New task
        </button>
      </div>

      {/* Filter bar */}
      <div className="mt-5 flex flex-wrap items-center gap-2.5">
        <div className="flex overflow-hidden rounded-xl border border-[#dde6f2] bg-white shadow-sm" role="tablist" aria-label="Task filters">
          {tabs.map(({ id, label, count }) => (
            <button
              key={id}
              role="tab"
              aria-selected={tab === id}
              onClick={() => setTab(id)}
              className={`flex items-center gap-1.5 px-3.5 py-2.5 text-[13px] font-medium transition ${
                tab === id ? "bg-[#152142] text-[#f6f3ec]" : "bg-white text-[#4a5568] hover:bg-[#f6f3ec]"
              }`}
            >
              {label}
              <span className={`rounded-full px-1.5 py-0.5 text-[10.5px] font-bold ${tab === id ? "bg-[#d9a62e] text-[#152142]" : "bg-[#eef1f6] text-[#5d759c]"}`}>
                {count}
              </span>
            </button>
          ))}
        </div>

        <div className="relative min-w-[180px] flex-1 sm:max-w-xs">
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#8494ad]" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tasks…"
            aria-label="Search tasks"
            className="w-full rounded-xl border border-[#dde6f2] bg-white py-2.5 pl-9 pr-3 text-[13.5px] text-[#152142] shadow-sm placeholder:text-[#8494ad] focus:border-[#d9a62e] focus:outline-none"
          />
        </div>

        <FilterSelect
          value={subjectFilter}
          onChange={setSubjectFilter}
          options={[{ value: "all", label: "All subjects" }, ...subjectsInUse.map((s) => ({ value: s, label: s }))]}
          label="Filter by subject"
        />
        <FilterSelect
          value={priorityFilter}
          onChange={setPriorityFilter}
          options={[{ value: "all", label: "All priorities" }, { value: "Critical", label: "Critical" }, { value: "High", label: "High" }, { value: "Medium", label: "Medium" }, { value: "Low", label: "Low" }]}
          label="Filter by priority"
        />
      </div>

      {/* Table */}
      <div className="mt-4 overflow-hidden rounded-2xl border border-[#dde6f2] bg-white shadow-[0_1px_2px_rgba(21,33,66,0.05),0_4px_16px_rgba(21,33,66,0.06)]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-left text-[13px]">
            <thead>
              <tr className="border-b border-[#eef1f6] bg-[#f8fafc] text-[11px] font-bold uppercase tracking-wider text-[#5d759c]">
                <th className="px-4 py-3">Task</th>
                <th className="px-3 py-3">Subject</th>
                <th className="px-3 py-3">Type</th>
                <th className="px-3 py-3 text-right">Hours</th>
                <th className="px-3 py-3">Due</th>
                <th className="px-3 py-3">Priority</th>
                <th className="px-3 py-3 text-right">Score</th>
                <th className="px-3 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eef1f6]">
              {filtered.map((t) => {
                const st = subjectStyle(t.subject);
                const status = dueStatusOf(t.due, t.completed, today);
                return (
                  <tr key={t.id} className={`transition hover:bg-[#fbf9f4] ${t.completed ? "opacity-60" : ""}`}>
                    <td className="px-4 py-3">
                      <button onClick={() => openTask(t.id)} className="text-left font-medium text-[#152142] hover:text-[#d9a62e] hover:underline focus:outline-none" title="Open task">
                        {t.title}
                      </button>
                      {t.notes ? <p className="mt-0.5 max-w-[220px] truncate text-[11.5px] text-[#8494ad]">{t.notes}</p> : null}
                    </td>
                    <td className="px-3 py-3">
                      <span className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11.5px] font-semibold" style={{ backgroundColor: st.bg, color: st.text, borderColor: st.border }}>
                        <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: st.dot }} />
                        {t.subject}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-[#4a5568]">{t.type}</td>
                    <td className="px-3 py-3 text-right font-medium text-[#152142]">{t.hours}h</td>
                    <td className="px-3 py-3">
                      <span className={`inline-block rounded-md px-2 py-1 text-[11.5px] font-bold ${
                        status === "overdue" ? "bg-[#f8e3e3] text-[#8f2d2d]"
                        : status === "today" ? "bg-[#f0dcb0] text-[#7a5a10]"
                        : status === "tomorrow" ? "bg-[#e9eef8] text-[#3a5a8a]"
                        : status === "done" ? "bg-[#eef0f3] text-[#5a6675]"
                        : "bg-[#f4f6f9] text-[#5d759c]"
                      }`}>
                        {dueLabel(t.due, t.completed, today)}
                        <span className="ml-1 font-normal">· {formatDate(t.due)}</span>
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <span className={`inline-block rounded-full border px-2.5 py-1 text-[11px] font-bold ${PRIORITY_STYLE[t.priority]}`}>
                        {t.priority}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-right">
                      <span className="font-bold text-[#152142]">{t.score}</span>
                      <span className="text-[11px] text-[#8494ad]">/100</span>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => toggleComplete(t.id)}
                          title={t.completed ? "Reopen task" : "Mark complete"}
                          aria-label={t.completed ? "Reopen task" : "Mark complete"}
                          className={`rounded-lg p-1.5 transition ${t.completed ? "text-[#2f9c84] hover:text-[#247a68]" : "text-[#8494ad] hover:text-[#2f9c84]"} hover:bg-[#eef4ef]`}
                        >
                          {t.completed ? <CheckCircle2 size={17} /> : <Circle size={17} />}
                        </button>
                        <button
                          onClick={() => openTask(t.id)}
                          title="Edit task"
                          aria-label="Edit task"
                          className="rounded-lg p-1.5 text-[#8494ad] transition hover:bg-[#f0dcb0] hover:text-[#7a5a10]"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => deleteTask(t.id)}
                          title="Delete task"
                          aria-label="Delete task"
                          className="rounded-lg p-1.5 text-[#8494ad] transition hover:bg-[#f8e3e3] hover:text-[#8f2d2d]"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="px-6 py-14 text-center">
            <p className="font-serif-display text-[17px] font-bold text-[#152142]">No tasks match your filters</p>
            <p className="mt-1 text-[13px] text-[#8494ad]">Try a different search, or clear the filters.</p>
            <button
              onClick={() => { setQuery(""); setSubjectFilter("all"); setPriorityFilter("all"); setTab("all"); }}
              className="mt-4 rounded-lg border border-[#dde6f2] bg-[#f6f3ec] px-4 py-2 text-[13px] font-semibold text-[#152142] hover:bg-[#efeadd]"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function FilterSelect({ value, onChange, options, label }: {
  value: string; onChange: (v: string) => void;
  options: { value: string; label: string }[]; label: string;
}) {
  return (
    <div className="relative">
      <label htmlFor={label} className="sr-only">{label}</label>
      <select
        id={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none rounded-xl border border-[#dde6f2] bg-white py-2.5 pl-3 pr-8 text-[13px] font-medium text-[#152142] shadow-sm focus:border-[#d9a62e] focus:outline-none"
      >
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      <ChevronDown size={14} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8494ad]" />
    </div>
  );
}
