export interface SubjectStyle {
  bg: string;
  text: string;
  border: string;
  dot: string;
  bar: string;
}

/* Distinct, consistent per-subject colors (muted to fit the editorial palette). */
const PALETTE: Record<string, SubjectStyle> = {
  physics: {
    bg: "#e8eefb", text: "#2c4a8a", border: "#c3d2ef",
    dot: "#3f6ac2", bar: "#3f6ac2",
  },
  "computer science": {
    bg: "#e2f2ee", text: "#1d6b5c", border: "#bfe3d9",
    dot: "#2f9c84", bar: "#2f9c84",
  },
  mathematics: {
    bg: "#f3ecdc", text: "#7c5a10", border: "#e8dda8",
    dot: "#b8912a", bar: "#b8912a",
  },
  economics: {
    bg: "#f6e9e2", text: "#8a4a30", border: "#ecccc0",
    dot: "#c46a45", bar: "#c46a45",
  },
  literature: {
    bg: "#f1e9f6", text: "#6a3d8a", border: "#dccbe9",
    dot: "#9160b8", bar: "#9160b8",
  },
  chemistry: {
    bg: "#e4f0e6", text: "#3d6b35", border: "#cbe0cd",
    dot: "#5d9a4f", bar: "#5d9a4f",
  },
  sociology: {
    bg: "#fdeef0", text: "#963a52", border: "#f4ccd6",
    dot: "#c0526b", bar: "#c0526b",
  },
  default: {
    bg: "#eef1f6", text: "#46536b", border: "#d6dfea",
    dot: "#7c8aa0", bar: "#7c8aa0",
  },
};

const EXTRA = [
  { bg: "#e8f3fb", text: "#2a6a8a", border: "#c3ddec", dot: "#3f93bd", bar: "#3f93bd" },
  { bg: "#f2efe3", text: "#6b6224", border: "#e0d9b4", dot: "#a2963c", bar: "#a2963c" },
  { bg: "#efe6f0", text: "#7a3a6e", border: "#dcc6da", dot: "#a55a9a", bar: "#a55a9a" },
  { bg: "#e3ecef", text: "#3a5c68", border: "#c6dde3", dot: "#5b8794", bar: "#5b8794" },
];

export function subjectStyle(subject: string): SubjectStyle {
  return PALETTE[subject.trim().toLowerCase()] ?? EXTRA[hash(subject) % EXTRA.length];
}

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export const ALL_SUBJECTS = [
  "Physics",
  "Computer Science",
  "Mathematics",
  "Economics",
  "Literature",
  "Chemistry",
  "Sociology",
];

/** Deterministic extra color for arbitrary (custom) subjects. */
export function subjectKey(subject: string): string {
  return subject.trim().toLowerCase();
}
