import { useEffect, useRef, useState } from "react";
import type { Task, Priority } from "../lib/types";
import { dueLabel, dueStatusOf, formatDate } from "../lib/dates";
import { subjectStyle } from "../lib/subjects";
import { initials } from "../lib/data";
import { useApp } from "../lib/store";
import { Plus, RotateCcw, ChevronDown, Home, ListTodo, CalendarDays, BarChart3, LogOut, Check } from "lucide-react";
import { NavLink } from "react-router-dom";

const PRIORITY_STYLE: Record<string, string> = {
  Critical: "bg-[#f8e3e3] text-[#8f2d2d] border-[#eebcbc]",
  High: "bg-[#fdeeda] text-[#8a5a12] border-[#f0d3a2]",
  Medium: "bg-[#e9eef8] text-[#3a5a8a] border-[#c9d6ec]",
  Low: "bg-[#eef0f3] text-[#5a6675] border-[#d8dee6]",
};

function LogoMark({ size = 30 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <rect x="1" y="1" width="30" height="30" rx="7" fill="#d9a62e" />
      <rect x="7" y="16" width="4.6" height="9" rx="1.2" fill="#152142" />
      <rect x="13.7" y="11.5" width="4.6" height="13.5" rx="1.2" fill="#152142" />
      <rect x="20.4" y="7" width="4.6" height="18" rx="1.2" fill="#152142" />
      <path d="M6.5 13.5 L13 9.5 L18 11.5 L25.5 5.5" fill="none" stroke="#f6f3ec" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="25.5" cy="5.5" r="1.8" fill="#f6f3ec" />
    </svg>
  );
}

export function Header() {
  const app = useApp();
  const { profile, signOut, resetDemo, openNewTask } = app;
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const resetTimer = useRef<number | null>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const onDown = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  useEffect(() => {
    return () => {
      if (resetTimer.current) window.clearTimeout(resetTimer.current);
    };
  }, []);

  if (!profile) return null;

  const handleReset = () => {
    if (confirmReset) {
      resetDemo();
      setConfirmReset(false);
      if (resetTimer.current) window.clearTimeout(resetTimer.current);
    } else {
      setConfirmReset(true);
      resetTimer.current = window.setTimeout(() => setConfirmReset(false), 3000);
    }
  };

  const navItems = [
    { to: "/", label: "Home", icon: Home },
    { to: "/tasks", label: "Tasks", icon: ListTodo },
    { to: "/calendar", label: "Calendar", icon: CalendarDays },
    { to: "/analytics", label: "Analytics", icon: BarChart3 },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-[#dde6f2] bg-[#fbf9f4]/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-[1400px] items-center gap-2 px-3 sm:px-5">
        {/* Brand */}
        <NavLink to="/" className="flex items-center gap-2.5 pr-2 sm:pr-4">
          <LogoMark />
          <span className="leading-none">
            <span className="block font-serif-display text-[19px] font-bold tracking-tight text-[#152142]">FrontRow</span>
            <span className="tracking-label block text-[9px] font-semibold text-[#5d759c]">ACADEMIC PRIORITIES</span>
          </span>
        </NavLink>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className={({ isActive }) =>
                `flex items-center gap-1.5 rounded-lg px-3 py-2 text-[13.5px] font-medium transition-colors ${
                  isActive
                    ? "bg-[#152142] text-[#f6f3ec]"
                    : "text-[#4a5568] hover:bg-[#efeadd] hover:text-[#152142]"
                }`
              }
            >
              <Icon size={16} strokeWidth={2.2} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="flex-1" />

        {/* Actions */}
        <button
          onClick={openNewTask}
          className="flex items-center gap-1.5 rounded-lg bg-[#d9a62e] px-3 py-2 text-[13px] font-semibold text-[#152142] shadow-sm transition hover:bg-[#c99a25] active:translate-y-px focus:outline-none"
        >
          <Plus size={16} strokeWidth={2.6} />
          <span className="hidden sm:inline">New task</span>
          <span className="sm:hidden">New</span>
        </button>

        <button
          onClick={handleReset}
          className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-[13px] font-medium transition ${
            confirmReset
              ? "border-[#d9a62e] bg-[#f0dcb0] text-[#7a5a10]"
              : "border-[#dde6f2] bg-white text-[#4a5568] hover:bg-[#f6f3ec] hover:text-[#152142]"
          }`}
          title="Restore original demo tasks"
        >
          <RotateCcw size={15} strokeWidth={2.2} />
          <span className="hidden lg:inline">{confirmReset ? "Confirm reset?" : "Reset demo"}</span>
        </button>

        {/* Profile + dropdown */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            aria-label="Open profile menu"
            className="ml-1 flex h-9 w-9 items-center justify-center rounded-full bg-[#152142] text-[13px] font-bold text-[#f0dcb0] ring-2 ring-transparent transition hover:ring-[#d9a62e]/50"
          >
            {initials(profile.fullName)}
          </button>

          {menuOpen && (
            <div
              role="menu"
              className="animate-pop-in absolute right-0 top-[calc(100%+8px)] z-50 w-64 overflow-hidden rounded-xl border border-[#dde6f2] bg-white shadow-[0_12px_40px_rgba(21,33,66,0.18)]"
            >
              <div className="flex items-center gap-3 border-b border-[#eef1f6] bg-[#f8fafc] px-4 py-3.5">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#152142] text-sm font-bold text-[#f0dcb0]">
                  {initials(profile.fullName)}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-[14px] font-semibold text-[#152142]">{profile.fullName}</p>
                  <p className="truncate text-[12px] text-[#5d759c]">Roll {profile.roll} · {profile.branch}</p>
                </div>
              </div>
              <div className="px-4 py-3 text-[12px] leading-relaxed text-[#5d759c]">
                <p><span className="font-semibold text-[#152142]">Roll no:</span> {profile.roll}</p>
                <p><span className="font-semibold text-[#152142]">Branch:</span> {profile.branch}</p>
              </div>
              <div className="border-t border-[#eef1f6] px-4 py-3">
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    signOut();
                  }}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#eebcbc] bg-[#f8e3e3] px-3 py-2 text-[13px] font-semibold text-[#8f2d2d] transition hover:bg-[#f2d4d4]"
                >
                  <LogOut size={15} strokeWidth={2.4} />
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile nav */}
      <nav className="flex items-center gap-1 overflow-x-auto border-t border-[#eef1f6] px-3 py-2 md:hidden" aria-label="Mobile">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              `flex flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-2 text-[13px] font-medium transition-colors ${
                isActive ? "bg-[#152142] text-[#f6f3ec]" : "text-[#4a5568] hover:bg-[#efeadd]"
              }`
            }
          >
            <Icon size={15} strokeWidth={2.2} />
            {label}
          </NavLink>
        ))}
      </nav>
    </header>
  );
}

export { PRIORITY_STYLE };
