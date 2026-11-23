import React, { useEffect, useRef, useState } from 'react';
import { Monitor, Moon, Sun } from 'lucide-react';
import { useTheme, type ThemePreference } from '../context/ThemeContext';

const OPTIONS: { id: ThemePreference; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'light', label: 'Light', icon: Sun },
  { id: 'dark', label: 'Dark', icon: Moon },
  { id: 'system', label: 'System', icon: Monitor },
];

export function ThemeSelector({ compact = false }: { compact?: boolean }) {
  const { preference, resolvedTheme, setPreference } = useTheme();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  if (compact) {
    return (
      <div
        role="group"
        aria-label="Theme preference"
        className="inline-flex items-center gap-1 p-1 rounded-xl border border-[#DCE7EE] dark:border-[#304258] bg-[#F6F9FC] dark:bg-[#101B2B]"
      >
        {OPTIONS.map((opt) => {
          const Icon = opt.icon;
          const active = preference === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => setPreference(opt.id)}
              aria-pressed={active}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                active
                  ? 'bg-white dark:bg-[#1B2C42] text-[#102338] dark:text-[#F5FAFF] shadow-xs border border-[#DCE7EE] dark:border-[#304258]'
                  : 'text-[#46596A] dark:text-[#B8C8D8] hover:text-[#102338] dark:hover:text-[#F5FAFF]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{opt.label}</span>
            </button>
          );
        })}
      </div>
    );
  }

  const ActiveIcon =
    preference === 'light'
      ? Sun
      : preference === 'dark'
        ? Moon
        : resolvedTheme === 'dark'
          ? Moon
          : Sun;

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Appearance mode: ${preference}. Switch theme`}
        className="inline-flex items-center justify-center h-10 w-10 rounded-xl border border-[#DCE7EE] dark:border-[#304258] bg-white/80 dark:bg-[#152337]/80 text-[#102338] dark:text-[#F5FAFF] hover:border-[#087D94] dark:hover:border-[#22D3D5] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#087D94] dark:focus-visible:ring-[#22D3D5] cursor-pointer"
      >
        <ActiveIcon className="w-4 h-4" aria-hidden="true" />
      </button>

      {open && (
        <div
          role="menu"
          aria-label="Select appearance theme"
          className="absolute right-0 mt-2 w-40 rounded-xl border border-[#DCE7EE] dark:border-[#304258] bg-white dark:bg-[#152337] shadow-lg p-1.5 z-50"
        >
          {OPTIONS.map((opt) => {
            const Icon = opt.icon;
            const active = preference === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                role="menuitemradio"
                aria-checked={active}
                onClick={() => {
                  setPreference(opt.id);
                  setOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                  active
                    ? 'bg-[#EAF8FA] dark:bg-[#1B2C42] text-[#087D94] dark:text-[#22D3D5]'
                    : 'text-[#46596A] dark:text-[#B8C8D8] hover:bg-[#F6F9FC] dark:hover:bg-[#1B2C42]/60 hover:text-[#102338] dark:hover:text-[#F5FAFF]'
                }`}
              >
                <span className="inline-flex items-center gap-2">
                  <Icon className="w-4 h-4" aria-hidden="true" />
                  <span>{opt.label}</span>
                </span>
                {active && (
                  <span className="text-xs font-mono-tabular">Active</span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
