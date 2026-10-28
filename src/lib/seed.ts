import type { Task } from './types';
import { addDaysISO } from './date';

/**
 * Builds the 19 demo tasks relative to the given local date:
 * 14 open (49.5h total) + 5 completed.
 * Exactly 8 open tasks are due within the next 7 days (overdue excluded).
 */
export function buildDemoTasks(today: string): Task[] {
  const d = (n: number) => addDaysISO(today, n);
  let n = 0;
  const id = () => `demo-${++n}`;
  const t = (
    partial: Omit<Task, 'id' | 'completed' | 'createdAt'> & { completed?: boolean; completedAt?: string },
  ): Task => ({
    id: id(),
    completed: false,
    createdAt: d(-14),
    ...partial,
  });

  return [
    // ---- Open tasks (14, totaling 49.5h) ----
    // Physics — 3 tasks, 15h
    t({
      title: 'Lab report — Fluid dynamics',
      subject: 'Physics',
      type: 'Lab Report',
      hours: 4,
      dueDate: d(-2),
      importance: 'Critical',
      notes: 'Bernoulli experiment write-up. Results table done; analysis and error discussion still missing.',
    }),
    t({
      title: 'Midterm review — Thermodynamics',
      subject: 'Physics',
      type: 'Exam Prep',
      hours: 5,
      dueDate: d(2),
      importance: 'Critical',
      notes: 'Chapters 4–7: entropy, Carnot cycles, past papers 2023–25.',
    }),
    t({
      title: 'Lab report — Electromagnetic induction',
      subject: 'Physics',
      type: 'Lab Report',
      hours: 6,
      dueDate: d(4),
      importance: 'High',
      notes: "Faraday's law setup — needs plots regenerated from the corrected dataset.",
    }),
    // Computer Science — 3 tasks, 13h
    t({
      title: 'Problem set 4 — Asymptotic analysis',
      subject: 'Computer Science',
      type: 'Problem Set',
      hours: 3,
      dueDate: d(1),
      importance: 'Critical',
      notes: 'Master theorem proofs, Q3 recurrence still unsolved.',
    }),
    t({
      title: 'Project milestone — Compiler front-end',
      subject: 'Computer Science',
      type: 'Project',
      hours: 6,
      dueDate: d(6),
      importance: 'High',
      notes: 'Lexer + parser demo due. Error recovery is the risky part.',
    }),
    t({
      title: 'Reading — Distributed systems, chapter 4',
      subject: 'Computer Science',
      type: 'Reading',
      hours: 4,
      dueDate: d(10),
      importance: 'Medium',
      notes: 'Consensus and replication; take notes for the seminar.',
    }),
    // Mathematics — 2 tasks, 8h
    t({
      title: 'Problem set 7 — Eigenvalues & diagonalization',
      subject: 'Mathematics',
      type: 'Problem Set',
      hours: 3,
      dueDate: d(5),
      importance: 'High',
      notes: 'Ten problems; last two require spectral theorem.',
    }),
    t({
      title: 'Exam prep — Real analysis midterm',
      subject: 'Mathematics',
      type: 'Exam Prep',
      hours: 5,
      dueDate: d(12),
      importance: 'Medium',
      notes: 'Sequences, continuity, uniform convergence. Redo proofs from lectures 8–14.',
    }),
    // Economics — 3 tasks, 6.5h
    t({
      title: 'Response paper — Behavioral economics',
      subject: 'Economics',
      type: 'Essay',
      hours: 2,
      dueDate: d(6),
      importance: 'Medium',
      notes: '800 words on Kahneman & Tversky prospect theory reading.',
    }),
    t({
      title: 'Problem set 3 — Game theory basics',
      subject: 'Economics',
      type: 'Problem Set',
      hours: 3,
      dueDate: d(9),
      importance: 'Medium',
      notes: 'Nash equilibria and dominant strategies worksheet.',
    }),
    t({
      title: 'Reading notes — Macro chapter 12',
      subject: 'Economics',
      type: 'Reading',
      hours: 1.5,
      dueDate: d(11),
      importance: 'Low',
      notes: 'Monetary policy transmission; summarize for study group.',
    }),
    // Literature — 1 task, 4h
    t({
      title: 'Literature analysis — The Great Gatsby',
      subject: 'Literature',
      type: 'Essay',
      hours: 4,
      dueDate: d(3),
      importance: 'High',
      notes: '1,500 words on symbolism of the green light. Thesis approved; drafting left.',
    }),
    // Chemistry — 1 task, 2.5h
    t({
      title: 'Pre-lab quiz — Titration curves',
      subject: 'Chemistry',
      type: 'Quiz',
      hours: 2.5,
      dueDate: d(8),
      importance: 'Medium',
      notes: 'Covers weak acid/strong base equivalence points.',
    }),
    // Sociology — 1 task, 0.5h
    t({
      title: 'Discussion post 6 — Durkheim on anomie',
      subject: 'Sociology',
      type: 'Discussion',
      hours: 0.5,
      dueDate: d(0),
      importance: 'High',
      notes: '250-word forum post plus one peer reply.',
    }),

    // ---- Completed tasks (5) ----
    t({
      title: 'Quiz 3 — Organic reaction mechanisms',
      subject: 'Chemistry',
      type: 'Quiz',
      hours: 1.5,
      dueDate: d(-3),
      importance: 'Medium',
      completed: true,
      completedAt: d(-3),
    }),
    t({
      title: 'Essay draft — Keynes vs. Hayek',
      subject: 'Economics',
      type: 'Essay',
      hours: 3,
      dueDate: d(-1),
      importance: 'High',
      completed: true,
      completedAt: d(-1),
    }),
    t({
      title: 'Problem set 6 — Linear transformations',
      subject: 'Mathematics',
      type: 'Problem Set',
      hours: 3,
      dueDate: d(-4),
      importance: 'High',
      completed: true,
      completedAt: d(-4),
    }),
    t({
      title: 'Lab report — Optics: interference patterns',
      subject: 'Physics',
      type: 'Lab Report',
      hours: 4,
      dueDate: d(-6),
      importance: 'Medium',
      completed: true,
      completedAt: d(-6),
    }),
    t({
      title: 'Reading response — Sociology of education',
      subject: 'Sociology',
      type: 'Reading',
      hours: 1,
      dueDate: d(-1),
      importance: 'Low',
      completed: true,
      completedAt: d(-2),
    }),
  ];
}
