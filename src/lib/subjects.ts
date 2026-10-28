export interface SubjectColor {
  bg: string;
  text: string;
  bar: string;
}

const FIXED: Record<string, SubjectColor> = {
  physics: { bg: '#ede9fb', text: '#5b3fa8', bar: '#7c5cd6' },
  'computer science': { bg: '#dff3f0', text: '#0c6b60', bar: '#149183' },
  mathematics: { bg: '#e3ecfb', text: '#1e4fa8', bar: '#3a6fd8' },
  economics: { bg: '#faeddb', text: '#96570d', bar: '#c07a1d' },
  literature: { bg: '#fbe6ee', text: '#a12760', bar: '#cc4a86' },
  chemistry: { bg: '#e2f3e4', text: '#1f6b32', bar: '#37904e' },
  sociology: { bg: '#f3e6f8', text: '#7b2d99', bar: '#a04ec4' },
};

const FALLBACK: SubjectColor[] = [
  { bg: '#e5eef6', text: '#28567d', bar: '#4179ab' },
  { bg: '#f8e9df', text: '#94491c', bar: '#c26a35' },
  { bg: '#e8f0e2', text: '#3f6427', bar: '#5f8c40' },
  { bg: '#f0e6e9', text: '#84354f', bar: '#ab5471' },
  { bg: '#e6ecef', text: '#2f5f6b', bar: '#4a8595' },
];

export function subjectColor(subject: string): SubjectColor {
  const key = subject.trim().toLowerCase();
  if (FIXED[key]) return FIXED[key];
  let hash = 0;
  for (let i = 0; i < key.length; i++) hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  return FALLBACK[hash % FALLBACK.length];
}
