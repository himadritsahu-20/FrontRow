import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { Task, StudentProfile, TaskDraft } from "./types";
import { loadProfile, saveProfile, clearProfile, loadTasks, saveTasks, resetTasks } from "./storage";
import { uid, scoreForPriority } from "./data";
import { todayISO } from "./dates";

interface AppState {
  profile: StudentProfile | null;
  tasks: Task[];
  hydrated: boolean;
  today: string;

  signIn: (p: StudentProfile) => void;
  signOut: () => void;
  resetDemo: () => void;

  addTask: (draft: TaskDraft) => Task;
  updateTask: (id: string, draft: TaskDraft) => void;
  toggleComplete: (id: string) => void;
  deleteTask: (id: string) => void;

  editingId: string | null;
  openTask: (id: string) => void;
  closeTaskModal: () => void;
  newTaskOpen: boolean;
  openNewTask: () => void;
  closeNewTask: () => void;
}

const AppCtx = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [today, setToday] = useState<string>(() => todayISO());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newTaskOpen, setNewTaskOpen] = useState(false);

  const tasksRef = useRef<Task[]>(tasks);
  tasksRef.current = tasks;
  const saveTimer = useRef<number | null>(null);

  useEffect(() => {
    setProfile(loadProfile());
    setTasks(loadTasks());
    setHydrated(true);
  }, []);

  // Keep "today" correct across midnight: reroll at the next midnight.
  useEffect(() => {
    let timer: number;
    const schedule = () => {
      const now = new Date();
      const next = new Date(now);
      next.setHours(24, 0, 5, 0);
      timer = window.setTimeout(() => {
        setToday(todayISO());
        schedule();
      }, next.getTime() - now.getTime());
    };
    schedule();
    return () => window.clearTimeout(timer);
  }, []);

  const persistTasks = useCallback((next: Task[]) => {
    setTasks(next);
    if (saveTimer.current) window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => saveTasks(next), 60);
  }, []);

  const signIn = useCallback((p: StudentProfile) => {
    saveProfile(p);
    setProfile(p);
  }, []);

  const signOut = useCallback(() => {
    clearProfile();
    setProfile(null);
  }, []);

  const resetDemo = useCallback(() => {
    persistTasks(resetTasks());
  }, [persistTasks]);

  const addTask = useCallback((draft: TaskDraft): Task => {
    const task: Task = {
      id: uid(),
      title: draft.title.trim(),
      subject: draft.subject.trim(),
      type: draft.type,
      due: draft.due,
      hours: parseFloat(draft.hours),
      priority: draft.priority,
      score: scoreForPriority(draft.priority),
      completed: false,
      createdAt: new Date().toISOString(),
      ...(draft.notes?.trim() ? { notes: draft.notes.trim() } : {}),
    };
    persistTasks([...tasksRef.current, task]);
    return task;
  }, [persistTasks]);

  const updateTask = useCallback((id: string, draft: TaskDraft) => {
    persistTasks(tasksRef.current.map((t) => {
      if (t.id !== id) return t;
      const next: Task = {
        ...t,
        title: draft.title.trim(),
        subject: draft.subject.trim(),
        type: draft.type,
        due: draft.due,
        hours: parseFloat(draft.hours),
        priority: draft.priority,
        score: scoreForPriority(draft.priority),
      };
      if (draft.notes?.trim()) next.notes = draft.notes.trim();
      else delete next.notes;
      return next;
    }));
  }, [persistTasks]);

  const toggleComplete = useCallback((id: string) => {
    persistTasks(tasksRef.current.map((t) => {
      if (t.id !== id) return t;
      const completed = !t.completed;
      const next: Task = { ...t, completed };
      if (completed) next.completedAt = new Date().toISOString();
      else delete next.completedAt;
      return next;
    }));
  }, [persistTasks]);

  const deleteTask = useCallback((id: string) => {
    persistTasks(tasksRef.current.filter((t) => t.id !== id));
  }, [persistTasks]);

  const openTask = useCallback((id: string) => setEditingId(id), []);
  const closeTaskModal = useCallback(() => setEditingId(null), []);
  const openNewTask = useCallback(() => setNewTaskOpen(true), []);
  const closeNewTask = useCallback(() => setNewTaskOpen(false), []);

  const value = useMemo<AppState>(() => ({
    profile,
    tasks,
    hydrated,
    today,
    signIn,
    signOut,
    resetDemo,
    addTask,
    updateTask,
    toggleComplete,
    deleteTask,
    editingId,
    openTask,
    closeTaskModal,
    newTaskOpen,
    openNewTask,
    closeNewTask,
  }), [profile, tasks, hydrated, today, signIn, signOut, resetDemo, addTask, updateTask, toggleComplete, deleteTask, editingId, openTask, closeTaskModal, newTaskOpen, openNewTask, closeNewTask]);

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}

export function useApp(): AppState {
  const ctx = useContext(AppCtx);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
}
