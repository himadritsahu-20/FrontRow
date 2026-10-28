import { useEffect, useMemo, useState } from 'react';
import { X } from 'lucide-react';
import { useStore } from '../lib/store';
import type { TaskInput } from '../lib/store';
import { IMPORTANCE_LEVELS, TASK_TYPES } from '../lib/types';
import type { Importance } from '../lib/types';
import { todayISO } from '../lib/date';

interface FormErrors {
  title?: string;
  subject?: string;
  dueDate?: string;
  hours?: string;
}

export default function TaskModal() {
  const { modal, closeModal, tasks, addTask, updateTask } = useStore();

  const editing = modal?.mode === 'edit' ? tasks.find((t) => t.id === modal.taskId) : undefined;

  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [type, setType] = useState('Problem Set');
  const [dueDate, setDueDate] = useState(todayISO());
  const [hours, setHours] = useState('2');
  const [importance, setImportance] = useState<Importance>('Medium');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});

  const subjects = useMemo(() => {
    const set = new Set(tasks.map((t) => t.subject));
    return [...set].sort();
  }, [tasks]);

  // Re-initialize the form whenever the modal opens.
  useEffect(() => {
    if (!modal) return;
    if (editing) {
      setTitle(editing.title);
      setSubject(editing.subject);
      setType(editing.type);
      setDueDate(editing.dueDate);
      setHours(String(editing.hours));
      setImportance(editing.importance);
      setNotes(editing.notes ?? '');
    } else {
      setTitle('');
      setSubject('');
      setType('Problem Set');
      setDueDate(todayISO());
      setHours('2');
      setImportance('Medium');
      setNotes('');
    }
    setErrors({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modal?.mode, modal?.taskId]);

  useEffect(() => {
    if (!modal) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeModal();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [modal, closeModal]);

  if (!modal) return null;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: FormErrors = {};
    const hoursNum = parseFloat(hours);
    if (!title.trim()) errs.title = 'Give the task a title.';
    if (!subject.trim()) errs.subject = 'Enter a subject — any name works.';
    if (!dueDate || !/^\d{4}-\d{2}-\d{2}$/.test(dueDate)) errs.dueDate = 'Pick a due date.';
    if (!hours.trim() || Number.isNaN(hoursNum) || hoursNum <= 0) errs.hours = 'Estimated hours must be greater than 0.';
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    const input: TaskInput = {
      title: title.trim(),
      subject: subject.trim(),
      type,
      dueDate,
      hours: Math.round(hoursNum * 4) / 4,
      importance,
      notes: notes.trim() || undefined,
    };
    if (editing) updateTask(editing.id, input);
    else addTask(input);
    closeModal();
  };

  const field =
    'w-full rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink placeholder:text-mist-soft focus:border-gold focus:ring-2 focus:ring-gold/40 focus:outline-none';
  const label = 'mb-1 block text-[11px] font-bold tracking-wide text-mist uppercase';
  const err = 'mt-1 text-xs font-semibold text-danger';

  return (
    <div
      className="fixed inset-0 z-[55] flex items-start justify-center overflow-y-auto bg-navy-deep/40 p-4 backdrop-blur-[2px] sm:items-center"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) closeModal();
      }}
      role="dialog"
      aria-modal="true"
      aria-label={editing ? 'Edit task' : 'New task'}
    >
      <form
        onSubmit={submit}
        noValidate
        className="pop-in my-4 w-full max-w-lg rounded-2xl border border-line bg-cream shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-line px-6 py-4">
          <div>
            <h2 className="font-display text-xl font-semibold text-navy">{editing ? 'Edit task' : 'New task'}</h2>
            <p className="text-xs text-mist">{editing ? 'Changes update every page instantly.' : 'It will be slotted into your queue by priority score.'}</p>
          </div>
          <button
            type="button"
            onClick={closeModal}
            aria-label="Close"
            className="rounded-lg p-1.5 text-mist transition hover:bg-linen hover:text-navy focus-visible:ring-2 focus-visible:ring-gold focus-visible:outline-none"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4 px-6 py-5">
          <div>
            <label htmlFor="tm-title" className={label}>Title *</label>
            <input id="tm-title" className={field} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Problem set 5 — Graph algorithms" />
            {errors.title && <p className={err}>{errors.title}</p>}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="tm-subject" className={label}>Subject *</label>
              <input
                id="tm-subject"
                className={field}
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Type any subject…"
                list="tm-subject-list"
              />
              <datalist id="tm-subject-list">
                {subjects.map((s) => (
                  <option key={s} value={s} />
                ))}
              </datalist>
              {errors.subject && <p className={err}>{errors.subject}</p>}
            </div>
            <div>
              <label htmlFor="tm-type" className={label}>Task type</label>
              <select id="tm-type" className={field} value={type} onChange={(e) => setType(e.target.value)}>
                {TASK_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label htmlFor="tm-due" className={label}>Due date *</label>
              <input id="tm-due" type="date" className={field} value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
              {errors.dueDate && <p className={err}>{errors.dueDate}</p>}
            </div>
            <div>
              <label htmlFor="tm-hours" className={label}>Est. hours *</label>
              <input
                id="tm-hours"
                type="number"
                min="0.25"
                step="0.25"
                className={field}
                value={hours}
                onChange={(e) => setHours(e.target.value)}
              />
              {errors.hours && <p className={err}>{errors.hours}</p>}
            </div>
            <div>
              <label htmlFor="tm-importance" className={label}>Priority</label>
              <select
                id="tm-importance"
                className={field}
                value={importance}
                onChange={(e) => setImportance(e.target.value as Importance)}
              >
                {IMPORTANCE_LEVELS.map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="tm-notes" className={label}>Notes (optional)</label>
            <textarea
              id="tm-notes"
              className={`${field} min-h-20 resize-y`}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Anything you need to remember…"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-line px-6 py-4">
          <button
            type="button"
            onClick={closeModal}
            className="rounded-lg border border-line bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:bg-linen focus-visible:ring-2 focus-visible:ring-gold focus-visible:outline-none"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded-lg bg-gold px-5 py-2 text-sm font-bold text-navy shadow-sm transition hover:bg-gold-deep hover:text-cream focus-visible:ring-2 focus-visible:ring-navy focus-visible:outline-none"
          >
            {editing ? 'Save changes' : 'Add task'}
          </button>
        </div>
      </form>
    </div>
  );
}
