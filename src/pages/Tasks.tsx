import { useMemo, useState } from 'react';
import { Check, Pencil, Plus, RotateCcw, Search, Trash2 } from 'lucide-react';
import { useStore } from '../lib/store';
import { computeScore, sortByScoreDesc } from '../lib/score';
import { diffDays, fmtHours, formatShort, dueInfo } from '../lib/date';
import { SubjectBadge } from '../components/SubjectBadge';
import { DueChip } from '../components/DueChip';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { IMPORTANCE_LEVELS } from '../lib/types';
import type { Task } from '../lib/types';

type Tab = 'all' | 'critical' | 'upcoming' | 'done';

export default function Tasks() {
  const { tasks, today, toggleComplete, deleteTask, openEditTask, openNewTask } = useStore();
  const [tab, setTab] = useState<Tab>('all');
  const [query, setQuery] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [pendingDelete, setPendingDelete] = useState<Task | null>(null);

  const open = tasks.filter((t) => !t.completed);
  const done = tasks.filter((t) => t.completed);
  const openHours = open.reduce((s, t) => s + t.hours, 0);

  const isCritical = (t: Task) => !t.completed && (t.importance === 'Critical' || diffDays(today, t.dueDate) < 0);
  const isUpcoming = (t: Task) => !t.completed && diffDays(today, t.dueDate) >= 0;

  const tabCounts: Record<Tab, number> = {
    all: tasks.length,
    critical: tasks.filter(isCritical).length,
    upcoming: tasks.filter(isUpcoming).length,
    done: done.length,
  };

  const subjects = useMemo(() => [...new Set(tasks.map((t) => t.subject))].sort(), [tasks]);

  const filtered = useMemo(() => {
    let list = tasks;
    if (tab === 'critical') list = list.filter(isCritical);
    else if (tab === 'upcoming') list = list.filter(isUpcoming);
    else if (tab === 'done') list = list.filter((t) => t.completed);

    if (subjectFilter !== 'all') list = list.filter((t) => t.subject === subjectFilter);
    if (priorityFilter !== 'all') list = list.filter((t) => t.importance === priorityFilter);
    const q = query.trim().toLowerCase();
    if (q) list = list.filter((t) => t.title.toLowerCase().includes(q));

    const openSorted = sortByScoreDesc(list.filter((t) => !t.completed), today);
    const doneSorted = [...list.filter((t) => t.completed)].sort((a, b) =>
      (b.completedAt ?? '').localeCompare(a.completedAt ?? ''),
    );
    return [...openSorted, ...doneSorted];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tasks, tab, subjectFilter, priorityFilter, query, today]);

  const hasActiveFilters = query.trim() !== '' || subjectFilter !== 'all' || priorityFilter !== 'all';

  const TABS: { id: Tab; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'critical', label: 'Critical' },
    { id: 'upcoming', label: 'Upcoming' },
    { id: 'done', label: 'Done' },
  ];

  const select =
    'rounded-lg border border-line bg-white px-3 py-2 text-sm font-semibold text-ink focus:border-gold focus:ring-2 focus:ring-gold/40 focus:outline-none';

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="fade-up flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold text-navy">Tasks</h1>
          <p className="mt-1.5 text-sm text-mist">
            <strong className="font-semibold text-ink">{open.length} open</strong> ·{' '}
            <strong className="font-semibold text-ink">{done.length} completed</strong> ·{' '}
            <strong className="font-semibold text-ink">{fmtHours(openHours)}</strong> of open workload
          </p>
        </div>
        <button
          onClick={openNewTask}
          className="flex items-center gap-1.5 rounded-lg bg-gold px-4 py-2.5 text-sm font-bold text-navy shadow-sm transition hover:bg-gold-deep hover:text-cream focus-visible:ring-2 focus-visible:ring-navy focus-visible:outline-none"
        >
          <Plus size={15} strokeWidth={3} />
          New task
        </button>
      </div>

      {/* Tabs */}
      <div className="fade-up mt-6 flex flex-wrap gap-1.5" style={{ animationDelay: '80ms' }} role="tablist" aria-label="Task filters">
        {TABS.map(({ id, label }) => (
          <button
            key={id}
            role="tab"
            aria-selected={tab === id}
            onClick={() => setTab(id)}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold transition focus-visible:ring-2 focus-visible:ring-gold focus-visible:outline-none ${
              tab === id ? 'bg-navy text-cream shadow-sm' : 'border border-line bg-white text-mist hover:text-navy'
            }`}
          >
            {label}
            <span className={`ml-1.5 text-xs ${tab === id ? 'text-gold' : 'text-mist-soft'}`}>{tabCounts[id]}</span>
          </button>
        ))}
      </div>

      {/* Search + filters */}
      <div className="fade-up mt-4 flex flex-col gap-3 sm:flex-row" style={{ animationDelay: '140ms' }}>
        <div className="relative flex-1">
          <Search size={15} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-mist-soft" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by task title…"
            aria-label="Search tasks"
            className="w-full rounded-lg border border-line bg-white py-2 pr-3 pl-9 text-sm text-ink placeholder:text-mist-soft focus:border-gold focus:ring-2 focus:ring-gold/40 focus:outline-none"
          />
        </div>
        <div className="flex gap-3">
          <select value={subjectFilter} onChange={(e) => setSubjectFilter(e.target.value)} aria-label="Filter by subject" className={`${select} flex-1 sm:flex-none`}>
            <option value="all">All subjects</option>
            {subjects.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} aria-label="Filter by priority" className={`${select} flex-1 sm:flex-none`}>
            <option value="all">All priorities</option>
            {IMPORTANCE_LEVELS.map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
        </div>
      </div>

      {/* List */}
      <div className="fade-up mt-5 overflow-hidden rounded-2xl border border-line bg-cream shadow-sm" style={{ animationDelay: '200ms' }}>
        {/* Desktop header row */}
        <div className="hidden grid-cols-[minmax(0,2.4fr)_1.1fr_0.9fr_0.55fr_0.8fr_0.75fr_0.5fr_5.5rem] items-center gap-3 border-b border-line bg-white/70 px-4 py-2.5 text-[10px] font-bold tracking-wider text-mist-soft uppercase lg:grid">
          <span>Task</span>
          <span>Subject</span>
          <span>Type</span>
          <span>Est.</span>
          <span>Due</span>
          <span>Priority</span>
          <span className="text-right">Score</span>
          <span className="text-right">Actions</span>
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center px-6 py-14 text-center">
            <Search size={26} className="text-mist-soft" />
            <p className="font-display mt-3 text-lg font-semibold text-navy">
              {tasks.length === 0 ? 'No tasks yet' : 'Nothing matches these filters'}
            </p>
            <p className="mt-1 max-w-sm text-sm text-mist">
              {tasks.length === 0
                ? 'Add your first task and FrontRow will slot it into the queue.'
                : hasActiveFilters
                  ? 'Try a different search term, or clear the subject and priority filters.'
                  : `No tasks in the “${TABS.find((t) => t.id === tab)?.label}” view right now.`}
            </p>
            {hasActiveFilters && (
              <button
                onClick={() => {
                  setQuery('');
                  setSubjectFilter('all');
                  setPriorityFilter('all');
                }}
                className="mt-4 rounded-lg border border-line bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:bg-linen focus-visible:ring-2 focus-visible:ring-gold focus-visible:outline-none"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <ul className="divide-y divide-line">
            {filtered.map((t) => {
              const score = computeScore(t, today);
              const info = dueInfo(today, t.dueDate);
              return (
                <li key={t.id} className={`px-4 py-3 transition hover:bg-white/70 ${t.completed ? 'opacity-60' : ''}`}>
                  {/* Desktop row */}
                  <div className="hidden grid-cols-[minmax(0,2.4fr)_1.1fr_0.9fr_0.55fr_0.8fr_0.75fr_0.5fr_5.5rem] items-center gap-3 lg:grid">
                    <div className="flex min-w-0 items-center gap-3">
                      <CompleteToggle task={t} onToggle={() => toggleComplete(t.id)} />
                      <div className="min-w-0">
                        <div className={`truncate text-sm font-semibold ${t.completed ? 'text-mist line-through' : 'text-ink'}`}>{t.title}</div>
                        {t.notes && <div className="truncate text-xs text-mist-soft">{t.notes}</div>}
                      </div>
                    </div>
                    <div><SubjectBadge subject={t.subject} /></div>
                    <div className="truncate text-xs font-semibold text-mist">{t.type}</div>
                    <div className="text-xs font-semibold text-mist">{fmtHours(t.hours)}</div>
                    <div className="flex flex-col gap-0.5">
                      <DueChip today={today} dueDate={t.dueDate} completed={t.completed} />
                      <span className="pl-1 text-[10px] text-mist-soft">{formatShort(t.dueDate)}</span>
                    </div>
                    <div><ImportanceChip level={t.importance} /></div>
                    <div className="text-right">
                      <span className={`font-display text-lg font-semibold ${!t.completed && info.tone === 'overdue' ? 'text-danger' : 'text-navy'}`}>
                        {score}
                      </span>
                    </div>
                    <RowActions task={t} onEdit={() => openEditTask(t.id)} onDelete={() => setPendingDelete(t)} onToggle={() => toggleComplete(t.id)} />
                  </div>

                  {/* Mobile card */}
                  <div className="lg:hidden">
                    <div className="flex items-start gap-3">
                      <CompleteToggle task={t} onToggle={() => toggleComplete(t.id)} />
                      <div className="min-w-0 flex-1">
                        <div className={`text-sm font-semibold ${t.completed ? 'text-mist line-through' : 'text-ink'}`}>{t.title}</div>
                        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                          <SubjectBadge subject={t.subject} />
                          <span className="text-xs font-semibold text-mist">{t.type}</span>
                          <span className="text-xs text-mist-soft">·</span>
                          <span className="text-xs font-semibold text-mist">{fmtHours(t.hours)}</span>
                        </div>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <DueChip today={today} dueDate={t.dueDate} completed={t.completed} />
                          <ImportanceChip level={t.importance} />
                          <span className="text-xs font-bold text-navy">Score {score}</span>
                        </div>
                      </div>
                      <RowActions task={t} onEdit={() => openEditTask(t.id)} onDelete={() => setPendingDelete(t)} onToggle={() => toggleComplete(t.id)} compact />
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Delete task?"
        message={pendingDelete ? `“${pendingDelete.title}” will be removed permanently. This can't be undone.` : ''}
        confirmLabel="Delete"
        danger
        onConfirm={() => {
          if (pendingDelete) deleteTask(pendingDelete.id);
          setPendingDelete(null);
        }}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}

function CompleteToggle({ task, onToggle }: { task: Task; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      aria-label={task.completed ? `Reopen “${task.title}”` : `Mark “${task.title}” complete`}
      title={task.completed ? 'Reopen task' : 'Mark complete'}
      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition focus-visible:ring-2 focus-visible:ring-gold focus-visible:outline-none ${
        task.completed ? 'border-gold bg-gold text-navy' : 'border-mist-soft bg-white text-transparent hover:border-gold hover:text-gold'
      }`}
    >
      <Check size={13} strokeWidth={3.5} />
    </button>
  );
}

function ImportanceChip({ level }: { level: Task['importance'] }) {
  const styles: Record<string, string> = {
    Critical: 'bg-danger-soft text-danger',
    High: 'bg-gold-soft text-gold-deep',
    Medium: 'bg-[#e5ecf5] text-mist',
    Low: 'bg-[#eef1f6] text-mist-soft',
  };
  return <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold whitespace-nowrap ${styles[level]}`}>{level}</span>;
}

function RowActions({
  task,
  onEdit,
  onDelete,
  onToggle,
  compact,
}: {
  task: Task;
  onEdit: () => void;
  onDelete: () => void;
  onToggle: () => void;
  compact?: boolean;
}) {
  const btn =
    'rounded-lg p-1.5 text-mist transition hover:bg-linen hover:text-navy focus-visible:ring-2 focus-visible:ring-gold focus-visible:outline-none';
  return (
    <div className={`flex items-center justify-end gap-0.5 ${compact ? 'flex-col' : ''}`}>
      {task.completed && (
        <button onClick={onToggle} aria-label={`Reopen “${task.title}”`} title="Reopen" className={btn}>
          <RotateCcw size={15} />
        </button>
      )}
      <button onClick={onEdit} aria-label={`Edit “${task.title}”`} title="Edit" className={btn}>
        <Pencil size={15} />
      </button>
      <button onClick={onDelete} aria-label={`Delete “${task.title}”`} title="Delete" className={`${btn} hover:text-danger`}>
        <Trash2 size={15} />
      </button>
    </div>
  );
}
