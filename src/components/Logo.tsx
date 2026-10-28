export function LogoMark({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true" className="shrink-0">
      <rect width="64" height="64" rx="14" fill="#16263f" />
      <rect x="13" y="36" width="9" height="14" rx="2" fill="#8fa6c4" />
      <rect x="27" y="27" width="9" height="23" rx="2" fill="#d9a422" />
      <rect x="41" y="16" width="9" height="34" rx="2" fill="#f4ede0" />
    </svg>
  );
}

export function Wordmark({ light = false }: { light?: boolean }) {
  return (
    <div className="leading-none">
      <div className={`font-display text-xl font-semibold tracking-tight ${light ? 'text-cream' : 'text-navy'}`}>
        FrontRow
      </div>
      <div className={`mt-0.5 text-[9px] font-semibold tracking-[0.28em] ${light ? 'text-mist-soft' : 'text-mist'}`}>
        ACADEMIC PRIORITIES
      </div>
    </div>
  );
}
