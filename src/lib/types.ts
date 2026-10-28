export type Importance = 'Critical' | 'High' | 'Medium' | 'Low';

export interface Task {
  id: string;
  title: string;
  subject: string;
  type: string;
  hours: number;
  dueDate: string; // YYYY-MM-DD, local calendar date
  importance: Importance;
  notes?: string;
  completed: boolean;
  completedAt?: string; // YYYY-MM-DD, local calendar date
  createdAt: string;
}

export interface Profile {
  name: string;
  roll: string;
  branch: string;
}

export const IMPORTANCE_LEVELS: Importance[] = ['Critical', 'High', 'Medium', 'Low'];

export const TASK_TYPES = [
  'Problem Set',
  'Lab Report',
  'Essay',
  'Exam Prep',
  'Reading',
  'Project',
  'Quiz',
  'Discussion',
  'Presentation',
  'Other',
];
