import { useEffect, useRef, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Menu, X, Plus, RotateCcw, LogOut, ChevronDown } from 'lucide-react';
import { useStore } from '../lib/store';
import { LogoMark, Wordmark } from './Logo';
import { ConfirmDialog } from './ConfirmDialog';

const NAV = [
  { to: '/', label: 'Home' },
  { to: '/tasks', label: 'Tasks' },
  { to: '/calendar', label: 'Calendar' },
  { to: '/analytics', label: 'Analytics' },
];

export function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  const first = parts[0][0] ?? '';
  const last = parts.length > 1 ? (parts[parts.length - 1][0] ?? '') : '';
  return (first + last).toUpperCase() || first.toUpperCase();
}

export default function Header() {
  const { profile, signOut, resetDemo, openNewTask } = useStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close profile dropdown on outside click / Escape.
  useEffect(() => {
    if (!profileOpen) return;
    const onDown = (e: MouseEvent | TouchEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setProfileOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('touchstart', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('touchstart', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [profileOpen]);

  if (!profile) return null;

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `relative px-1 py-2 text-sm font-semibold transition focus-visible:ring-2 focus-visible:ring-gold focus-visible:outline-none rounded ${
      isActive
        ? "text-navy after:absolute after:right-1 after:-bottom-[13px] after:left-1 after:h-[3px] after:rounded-full after:bg-gold after:content-['']"
        : 'text-mist hover:text-navy'
    }`;

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-linen/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4 sm:px-6">
        <NavLink
          to="/"
          className="flex items-center gap-2.5 rounded focus-visible:ring-2 focus-visible:ring-gold focus-visible:outline-none"
        >
          <LogoMark size={36} />
          <Wordmark />
        </NavLink>

        {/* Desktop nav */}
        <nav className="ml-6 hidden items-center gap-5 md:flex" aria-label="Main">
          {NAV.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.to === '/'} className={navLinkClass}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => setConfirmReset(true)}
            className="hidden items-center gap-1.5 rounded-lg border border-line bg-white px-3 py-2 text-xs font-semibold text-mist transition hover:border-mist-soft hover:text-navy focus-visible:ring-2 focus-visible:ring-gold focus-visible:outline-none sm:flex"
          >
            <RotateCcw size={13} />
            Reset demo
          </button>
          <button
            onClick={openNewTask}
            className="flex items-center gap-1.5 rounded-lg bg-gold px-3 py-2 text-xs font-bold text-navy shadow-sm transition hover:bg-gold-deep hover:text-cream focus-visible:ring-2 focus-visible:ring-navy focus-visible:outline-none sm:px-3.5"
          >
            <Plus size={14} strokeWidth={3} />
            <span>New task</span>
          </button>

          {/* Profile avatar + dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setProfileOpen((v) => !v)}
              aria-haspopup="menu"
              aria-expanded={profileOpen}
              aria-label="Open profile menu"
              className="flex items-center gap-1 rounded-full transition focus-visible:ring-2 focus-visible:ring-gold focus-visible:outline-none"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-navy text-xs font-bold tracking-wide text-gold-soft ring-2 ring-gold/60">
                {initialsOf(profile.name)}
              </span>
              <ChevronDown size={14} className={`hidden text-mist transition-transform sm:block ${profileOpen ? 'rotate-180' : ''}`} />
            </button>

            {profileOpen && (
              <div
                role="menu"
                className="pop-in absolute right-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-xl border border-line bg-cream shadow-xl"
              >
                <div className="border-b border-line bg-white/60 px-4 py-3">
                  <div className="font-display text-base font-semibold text-navy">{profile.name}</div>
                  <dl className="mt-2 space-y-1 text-xs">
                    <div className="flex justify-between gap-3">
                      <dt className="font-semibold tracking-wide text-mist-soft uppercase">Roll no.</dt>
                      <dd className="font-semibold text-ink">{profile.roll}</dd>
                    </div>
                    <div className="flex justify-between gap-3">
                      <dt className="font-semibold tracking-wide text-mist-soft uppercase">Branch</dt>
                      <dd className="text-right font-semibold text-ink">{profile.branch}</dd>
                    </div>
                  </dl>
                </div>
                <div className="p-2">
                  <button
                    role="menuitem"
                    onClick={() => {
                      setProfileOpen(false);
                      signOut();
                    }}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-navy px-3 py-2.5 text-sm font-semibold text-cream transition hover:bg-navy-deep focus-visible:ring-2 focus-visible:ring-gold focus-visible:outline-none"
                  >
                    <LogOut size={15} />
                    Sign out
                  </button>
                  <p className="mt-2 px-1 text-center text-[10px] leading-snug text-mist-soft">
                    Signing out keeps your tasks saved in this browser.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            className="rounded-lg border border-line bg-white p-2 text-navy transition hover:bg-linen focus-visible:ring-2 focus-visible:ring-gold focus-visible:outline-none md:hidden"
          >
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile nav panel */}
      {menuOpen && (
        <nav className="border-t border-line bg-cream px-4 py-3 md:hidden" aria-label="Mobile">
          <div className="flex flex-col gap-1">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `rounded-lg px-3 py-2.5 text-sm font-semibold transition focus-visible:ring-2 focus-visible:ring-gold focus-visible:outline-none ${
                    isActive ? 'bg-navy text-cream' : 'text-ink hover:bg-linen'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
            <button
              onClick={() => {
                setMenuOpen(false);
                setConfirmReset(true);
              }}
              className="mt-1 flex items-center gap-2 rounded-lg border border-line bg-white px-3 py-2.5 text-sm font-semibold text-mist transition hover:text-navy focus-visible:ring-2 focus-visible:ring-gold focus-visible:outline-none"
            >
              <RotateCcw size={14} />
              Reset demo
            </button>
          </div>
        </nav>
      )}

      <ConfirmDialog
        open={confirmReset}
        title="Reset demo tasks?"
        message="This restores the original demo task list (any tasks you added or edited will be replaced). Your student profile stays signed in and untouched."
        confirmLabel="Reset tasks"
        onConfirm={() => {
          resetDemo();
          setConfirmReset(false);
        }}
        onCancel={() => setConfirmReset(false)}
      />
    </header>
  );
}
