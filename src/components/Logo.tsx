import React, { useState } from 'react';

interface LogoProps {
  onClick?: () => void;
  inverted?: boolean;
  size?: 'sm' | 'md';
}

export function Logo({ onClick, inverted = false, size = 'md' }: LogoProps) {
  const [imgFailed, setImgFailed] = useState(false);

  const boxSize = size === 'sm' ? 'h-8 w-8 rounded-lg' : 'h-9 w-9 rounded-xl';
  const textSize = size === 'sm' ? 'text-base' : 'text-lg';

  const content = (
    <span className="inline-flex items-center gap-2.5 whitespace-nowrap shrink-0">
      <span
        className={`${boxSize} relative inline-flex items-center justify-center overflow-hidden bg-white border border-[#DCE7EE] dark:border-[#304258] shadow-xs shrink-0`}
      >
        {!imgFailed ? (
          <img
            src="/assets/aistudio/Glossy_Navy_DP_Logo_with_Teal_Swoosh_c7bac0b5.png"
            alt="Dent Propel DP monogram"
            referrerPolicy="no-referrer"
            onError={() => setImgFailed(true)}
            className="h-full w-full object-contain p-0.5"
          />
        ) : (
          <span className="font-display text-xs font-bold tracking-tight text-[#087D94]">
            DP
          </span>
        )}
      </span>
      <span
        className={`font-display ${textSize} font-bold tracking-tight ${
          inverted
            ? 'text-[#F5FAFF]'
            : 'text-[#102338] dark:text-[#F5FAFF]'
        }`}
      >
        DENT PROPEL
      </span>
    </span>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="inline-flex items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-[#087D94] dark:focus-visible:ring-[#22D3D5] rounded-xl cursor-pointer"
        aria-label="Dent Propel Home"
      >
        {content}
      </button>
    );
  }

  return content;
}
