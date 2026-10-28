import { subjectColor } from '../lib/subjects';

export function SubjectBadge({ subject }: { subject: string }) {
  const c = subjectColor(subject);
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold whitespace-nowrap"
      style={{ backgroundColor: c.bg, color: c.text }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: c.bar }} />
      {subject}
    </span>
  );
}

export function SubjectDot({ subject, className = '' }: { subject: string; className?: string }) {
  const c = subjectColor(subject);
  return <span className={`inline-block h-2 w-2 shrink-0 rounded-full ${className}`} style={{ backgroundColor: c.bar }} />;
}
