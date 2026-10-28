import { useEffect, useMemo, useState } from "react";
import { useApp } from "../lib/store";
import { TASK_TYPES, PRIORITIES } from "../lib/data";
import { ALL_SUBJECTS } from "../lib/subjects";
import { todayISO, isValidISODate } from "../lib/dates";
import { X, Save, Trash2 } from "lucide-react";
import type { TaskDraft, Priority, TaskType } from "../lib/types";

export default function TaskModal() {
  const { editingId, newTaskOpen, closeTaskModal, closeNewTask, tasks, addTask, updateTask, deleteTask, today } = useApp();
  const open = newTaskOpen || editingId !== null;
  const existing = editingId ? tasks.find((t) => t.id === editingId) : null;

  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [type, setType] = useState<TaskType>("Homework");
  const [due, setDue] = useState(todayISO());
  const [hours, setHours] = useState("2");
  const [priority, setPriority] = useState<Priority>("Medium");
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Populate form when opened for a specific task or for new.
  useEffect(() => {
    if (newTaskOpen) {
      setTitle(""); setSubject(""); setType("Homework");
      setDue(todayISO()); setHours("2"); setPriority("Medium"); setNotes("");
      setErrors({});
    } else if (editingId) {
      const t = tasks.find((x) => x.id === editingId);
      if (t) {
        setTitle(t.title); setSubject(t.subject); setType(t.type);
        setDue(t.due); setHours(String(t.hours)); setPriority(t.priority);
        setNotes(t.notes ?? "");
        setErrors({});
      }
    }
  }, [newTaskOpen, editingId, tasks]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (newTaskOpen) closeNewTask(); else closeTaskModal();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, newTaskOpen, closeNewTask, closeTaskModal]);

  const subjectsInUse = useMemo(() => {
    const s = new Set(tasks.map((t) => t.subject));
    return [...ALL_SUBJECTS.filter((x) => s.has(x)), ...[...s].filter((x) => !ALL_SUBJECTS.includes(x)).sort()];
  }, [tasks]);

  if (!open) return null;

  const submit = () => {
    const e: Record<string, string> = {};
    if (!title.trim()) e.title = "Title is required";
    if (!subject.trim()) e.subject = "Subject is required";
    if (!hours || parseFloat(hours) <= 0 || parseFloat(hours) > 200) e.hours = "Enter valid estimated hours (e.g. 2.5)";
    if (!isValidISODate(due)) e.due = "Pick a valid due date";
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    const draft: TaskDraft = { title, subject, type, due, hours, priority, notes };
    if (newTaskOpen) {
      addTask(draft);
      closeNewTask();
    } else if (editingId) {
      updateTask(editingId, draft);
      closeTaskModal();
    }
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-[#152142]/60 p-4 backdrop-blur-sm"
      onMouseDown={(e) => { if (e.target === e.currentTarget) { newTaskOpen ? closeNewTask() : closeTaskModal(); } }}
      role="dialog"
      aria-modal="true"
      aria-label={newTaskOpen ? "New task" : "Edit task"}
    >
      <div className="animate-pop-in w-full max-w-lg overflow-hidden rounded-2xl border border-[#dde6f2] bg-white shadow-[0_24px_80px_rgba(21,33,66,0.35)]">
        <div className="flex items-center justify-between border-b border-[#eef1f6] bg-[#152142] px-5 py-4">
          <h2 className="font-serif-display text-[18px] font-bold text-[#f6f3ec]">
            {newTaskOpen ? "New task" : "Edit task"}
          </h2>
          <button
            onClick={() => (newTaskOpen ? closeNewTask() : closeTaskModal())}
            aria-label="Close"
            className="rounded-lg p-1.5 text-[#c9d6ec] transition hover:bg-white/10 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        <div className="max-h-[70vh] space-y-4 overflow-y-auto p-5">
          <div>
            <label htmlFor="tf-title" className="mb-1 block text-[12.5px] font-semibold text-[#152142]">Title <span className="text-[#d9a62e]">*</span></label>
            <input
              id="tf-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Problem set 8 — Fourier series"
              className={`w-full rounded-xl border bg-[#fbf9f4] px-3.5 py-2.5 text-[14px] text-[#152142] placeholder:text-[#aab8cc] focus:outline-none ${errors.title ? "border-[#d97070]" : "border-[#dde6f2] focus:border-[#d9a62e]"}`}
            />
            {errors.title && <p className="mt-1 text-[12px] font-medium text-[#8f2d2d]">{errors.title}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="tf-subject" className="mb-1 block text-[12.5px] font-semibold text-[#152142]">Subject <span className="text-[#d9a62e]">*</span></label>
              <input
                id="tf-subject"
                type="text"
                list="subject-list"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Physics"
                className={`w-full rounded-xl border bg-[#fbf9f4] px-3.5 py-2.5 text-[14px] text-[#152142] placeholder:text-[#aab8cc] focus:outline-none ${errors.subject ? "border-[#d97070]" : "border-[#dde6f2] focus:border-[#d9a62e]"}`}
              />
              <datalist id="subject-list">
                {subjectsInUse.map((s) => <option key={s} value={s} />)}
              </datalist>
              {errors.subject && <p className="mt-1 text-[12px] font-medium text-[#8f2d2d]">{errors.subject}</p>}
            </div>
            <div>
              <label htmlFor="tf-type" className="mb-1 block text-[12.5px] font-semibold text-[#152142]">Task type</label>
              <select
                id="tf-type"
                value={type}
                onChange={(e) => setType(e.target.value as TaskType)}
                className="w-full rounded-xl border border-[#dde6f2] bg-[#fbf9f4] px-3.5 py-2.5 text-[14px] text-[#152142] focus:border-[#d9a62e] focus:outline-none"
              >
                {TASK_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="tf-due" className="mb-1 block text-[12.5px] font-semibold text-[#152142]">Due date <span className="text-[#d9a62e]">*</span></label>
              <input
                id="tf-due"
                type="date"
                value={due}
                onChange={(e) => setDue(e.target.value)}
                className={`w-full rounded-xl border bg-[#fbf9f4] px-3.5 py-2.5 text-[14px] text-[#152142] focus:outline-none ${errors.due ? "border-[#d97070]" : "border-[#dde6f2] focus:border-[#d9a62e]"}`}
              />
              {errors.due && <p className="mt-1 text-[12px] font-medium text-[#8f2d2d]">{errors.due}</p>}
            </div>
            <div>
              <label htmlFor="tf-hours" className="mb-1 block text-[12.5px] font-semibold text-[#152142]">Estimated hours <span className="text-[#d9a62e]">*</span></label>
              <input
                id="tf-hours"
                type="number"
                min="0.5"
                step="0.5"
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                className={`w-full rounded-xl border bg-[#fbf9f4] px-3.5 py-2.5 text-[14px] text-[#152142] focus:outline-none ${errors.hours ? "border-[#d97070]" : "border-[#dde6f2] focus:border-[#d9a62e]"}`}
              />
              {errors.hours && <p className="mt-1 text-[12px] font-medium text-[#8f2d2d]">{errors.hours}</p>}
            </div>
          </div>

          <div>
            <span className="mb-1 block text-[12.5px] font-semibold text-[#152142]">Priority / importance</span>
            <div className="flex gap-2">
              {PRIORITIES.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  aria-pressed={priority === p}
                  className={`flex-1 rounded-xl border px-2 py-2.5 text-[12.5px] font-bold transition ${
                    priority === p
                      ? "border-[#d9a62e] bg-[#f0dcb0] text-[#7a5a10]"
                      : "border-[#dde6f2] bg-[#fbf9f4] text-[#5d759c] hover:border-[#c3d2ef]"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="tf-notes" className="mb-1 block text-[12.5px] font-semibold text-[#152142]">Notes</label>
            <textarea
              id="tf-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Optional notes, rubric reminders…"
              className="w-full resize-none rounded-xl border border-[#dde6f2] bg-[#fbf9f4] px-3.5 py-2.5 text-[14px] text-[#152142] placeholder:text-[#aab8cc] focus:border-[#d9a62e] focus:outline-none"
            />
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-[#eef1f6] bg-[#f8fafc] px-5 py-4">
          <div>
            {!newTaskOpen && editingId && (
              <button
                onClick={() => { deleteTask(editingId); closeTaskModal(); }}
                className="flex items-center gap-1.5 rounded-lg border border-[#eebcbc] bg-[#f8e3e3] px-3 py-2 text-[12.5px] font-semibold text-[#8f2d2d] transition hover:bg-[#f2d4d4]"
              >
                <Trash2 size={14} /> Delete
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => (newTaskOpen ? closeNewTask() : closeTaskModal())}
              className="rounded-lg border border-[#dde6f2] bg-white px-4 py-2.5 text-[13px] font-semibold text-[#4a5568] transition hover:bg-[#f6f3ec]"
            >
              Cancel
            </button>
            <button
              onClick={submit}
              className="flex items-center gap-1.5 rounded-lg bg-[#d9a62e] px-5 py-2.5 text-[13.5px] font-bold text-[#152142] shadow transition hover:bg-[#c99a25] active:translate-y-px"
            >
              <Save size={16} strokeWidth={2.4} />
              {newTaskOpen ? "Add task" : "Save changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
