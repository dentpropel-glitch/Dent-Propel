import React from 'react';

export function AmbientBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden select-none"
    >
      {/* Subtle architectural dot matrix */}
      <div className="absolute inset-0 dp-dot-grid opacity-70 dark:opacity-55" />

      {/* Controlled ambient radial lighting */}
      <div className="dp-ambient-glow absolute -top-36 left-1/4 w-[620px] h-[620px] rounded-full bg-[#13AFA8]/10 dark:bg-[#22D3D5]/12 blur-[110px]" />
      <div className="dp-ambient-glow absolute top-24 -right-24 w-[540px] h-[540px] rounded-full bg-[#087D94]/10 dark:bg-[#6476ED]/14 blur-[120px]" />

      {/* Delicate architectural arc lines */}
      <svg
        className="absolute inset-x-0 top-0 w-full h-[680px] opacity-30 dark:opacity-25"
        viewBox="0 0 1440 680"
        fill="none"
        preserveAspectRatio="none"
      >
        <path
          d="M-120 480C260 320 620 560 980 280C1180 124 1340 160 1560 80"
          stroke="url(#dpHeroLine1)"
          strokeWidth="1"
        />
        <path
          d="M-80 560C340 420 710 620 1120 360C1280 260 1420 220 1560 190"
          stroke="url(#dpHeroLine2)"
          strokeWidth="1"
        />
        <defs>
          <linearGradient id="dpHeroLine1" x1="0" y1="0" x2="1440" y2="0" gradientUnits="userSpaceOnUse">
            <stop stopColor="#087D94" stopOpacity="0" />
            <stop offset="0.45" stopColor="#22D3D5" stopOpacity="0.65" />
            <stop offset="1" stopColor="#6476ED" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="dpHeroLine2" x1="0" y1="0" x2="1440" y2="0" gradientUnits="userSpaceOnUse">
            <stop stopColor="#13AFA8" stopOpacity="0" />
            <stop offset="0.6" stopColor="#43B5EC" stopOpacity="0.5" />
            <stop offset="1" stopColor="#6476ED" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
