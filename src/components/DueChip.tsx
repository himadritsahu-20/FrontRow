import { dueInfo } from '../lib/date';

const TONE_CLASSES: Record<string, string> = {
  overdue: 'bg-danger-soft text-danger',
  today: 'bg-gold-soft text-gold-deep',
  tomorrow: 'bg-gold-soft text-gold-deep',
  soon: 'bg-[#e5ecf5] text-mist',
  later: 'bg-[#eef1f6] text-mist',
};

export function DueChip({ today, dueDate, completed }: { today: string; dueDate: string; completed?: boolean }) {
  if (completed) {
    return (
      <span className="inline-flex items-center rounded-full bg-[#e2f3e4] px-2.5 py-0.5 text-[11px] font-semibold whitespace-nowrap text-[#1f6b32]">
        Done
      </span>
    );
  }
  const info = dueInfo(today, dueDate);
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold whitespace-nowrap ${TONE_CLASSES[info.tone]}`}>
      {info.label}
    </span>
  );
}
