/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { Task, Profile } from './types';
import { buildDemoTasks } from './seed';
import { todayISO } from './date';

// Profile and tasks are stored under separate keys on purpose:
// signing out clears only the profile; resetting demo touches only tasks.
const PROFILE_KEY = 'frontrow:profile';
const TASKS_KEY = 'frontrow:tasks';

function loadProfile(): Profile | null {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (!raw) return null;
    const p = JSON.parse(raw);
    if (p && typeof p.name === 'string' && typeof p.roll === 'string' && typeof p.branch === 'string') return p;
    return null;
  } catch {
    return null;
  }
}

function loadTasks(): Task[] | null {
  try {
    const raw = localStorage.getItem(TASKS_KEY);
    if (!raw) return null;
    const t = JSON.parse(raw);
    return Array.isArray(t) ? (t as Task[]) : null;
  } catch {
    return null;
  }
}

function makeId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `t-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export interface TaskInput {
  title: string;
  subject: string;
  type: string;
  hours: number;
  dueDate: string;
  importance: Task['importance'];
  notes?: string;
}

interface ModalState {
  mode: 'new' | 'edit';
  taskId?: string;
}

interface StoreValue {
  today: string;
  profile: Profile | null;
  tasks: Task[];
  signIn: (p: Profile) => void;
  signOut: () => void;
  addTask: (input: TaskInput) => void;
  updateTask: (id: string, input: TaskInput) => void;
  deleteTask: (id: string) => void;
  toggleComplete: (id: string) => void;
  resetDemo: () => void;
  modal: ModalState | null;
  openNewTask: () => void;
  openEditTask: (id: string) => void;
  closeModal: () => void;
}

const StoreContext = createContext<StoreValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(() => loadProfile());
  const [tasks, setTasks] = useState<Task[]>(() => loadTasks() ?? buildDemoTasks(todayISO()));
  const [modal, setModal] = useState<ModalState | null>(null);
  const [today, setToday] = useState<string>(() => todayISO());

  // Keep "today" fresh if the tab stays open across midnight / regains focus.
  useEffect(() => {
    const refresh = () => setToday(todayISO());
    window.addEventListener('focus', refresh);
    const iv = window.setInterval(refresh, 60_000);
    return () => {
      window.removeEventListener('focus', refresh);
      window.clearInterval(iv);
    };
  }, []);

  useEffect(() => {
    try {
      if (profile) localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
      else localStorage.removeItem(PROFILE_KEY);
    } catch {
      /* storage unavailable */
    }
  }, [profile]);

  useEffect(() => {
    try {
      localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
    } catch {
      /* storage unavailable */
    }
  }, [tasks]);

  const signIn = useCallback((p: Profile) => setProfile(p), []);
  // Sign-out clears ONLY the profile — task data is untouched.
  const signOut = useCallback(() => setProfile(null), []);

  const addTask = useCallback((input: TaskInput) => {
    setTasks((prev) => [
      { ...input, id: makeId(), completed: false, createdAt: todayISO() },
      ...prev,
    ]);
  }, []);

  const updateTask = useCallback((id: string, input: TaskInput) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...input } : t)));
  }, []);

  const deleteTask = useCallback((id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toggleComplete = useCallback((id: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id
          ? t.completed
            ? { ...t, completed: false, completedAt: undefined }
            : { ...t, completed: true, completedAt: todayISO() }
          : t,
      ),
    );
  }, []);

  // Reset demo restores ONLY tasks — the profile is untouched.
  const resetDemo = useCallback(() => setTasks(buildDemoTasks(todayISO())), []);

  const openNewTask = useCallback(() => setModal({ mode: 'new' }), []);
  const openEditTask = useCallback((id: string) => setModal({ mode: 'edit', taskId: id }), []);
  const closeModal = useCallback(() => setModal(null), []);

  const value = useMemo<StoreValue>(
    () => ({
      today,
      profile,
      tasks,
      signIn,
      signOut,
      addTask,
      updateTask,
      deleteTask,
      toggleComplete,
      resetDemo,
      modal,
      openNewTask,
      openEditTask,
      closeModal,
    }),
    [today, profile, tasks, signIn, signOut, addTask, updateTask, deleteTask, toggleComplete, resetDemo, modal, openNewTask, openEditTask, closeModal],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}
