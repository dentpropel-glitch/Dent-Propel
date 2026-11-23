import React, { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import {
  getNextIntroPhase,
  INTRO_TIMINGS,
  shouldPlayIntro,
  type IntroPhase,
} from '../lib/introConfig';

const CHARGE_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];
const SPLIT_EASE: [number, number, number, number] = [0.65, 0, 0.35, 1];

interface SplitLockupProps {
  side: 'left' | 'right';
  phase: IntroPhase;
}

function SplitBrandLockup({ side, phase }: SplitLockupProps) {
  const [imgFailed, setImgFailed] = useState(false);
  const isSplitting = phase === 'split';

  return (
    <div
      className={`absolute top-0 bottom-0 w-[200%] flex flex-col items-center justify-center px-6 select-none pointer-events-none ${
        side === 'left' ? 'left-0' : 'right-0'
      }`}
    >
      {/* Subtle architectural dark cinema grid */}
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-25"
        style={{
          backgroundImage:
            'radial-gradient(rgba(34, 211, 213, 0.2) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />

      {/* Ambient radial energy breathing behind centered emblem */}
      <motion.div
        aria-hidden="true"
        initial={{ scale: 0.9, opacity: 0.45 }}
        animate={{
          scale: isSplitting ? 1.18 : 1.05,
          opacity: isSplitting ? 0.9 : 0.78,
        }}
        transition={{ duration: 2.6, ease: CHARGE_EASE }}
        className="absolute w-[440px] h-[440px] rounded-full bg-gradient-to-tr from-[#087D94]/35 via-[#22D3D5]/22 to-[#6476ED]/28 blur-[95px]"
      />

      {/* Centered Cinema Logo Lockup (Identical across both 50% curtain halves) */}
      <motion.div
        initial={{ opacity: 0.9, scale: 0.94 }}
        animate={{
          opacity: 1,
          scale: isSplitting ? 1.04 : 1,
        }}
        transition={{
          opacity: { duration: 0.85, ease: CHARGE_EASE },
          scale: { duration: isSplitting ? 1.4 : 2.2, ease: CHARGE_EASE },
        }}
        className="relative z-10 flex flex-col items-center text-center will-change-transform"
      >
        {/* Orbital Target Rings + Glossy DP Emblem */}
        <div className="relative flex items-center justify-center w-28 h-28 sm:w-32 sm:h-32 mb-6">
          <motion.div
            initial={{ rotate: 0, scale: 0.92, opacity: 0.75 }}
            animate={{ rotate: 90, scale: 1, opacity: 1 }}
            transition={{
              rotate: { duration: 4.5, ease: 'linear' },
              scale: { duration: 1.6, ease: CHARGE_EASE },
              opacity: { duration: 0.9, ease: CHARGE_EASE },
            }}
            className="absolute inset-0 rounded-full border border-[#22D3D5]/45 will-change-transform"
          />
          <motion.div
            initial={{ rotate: 0, scale: 1.08, opacity: 0.75 }}
            animate={{ rotate: -90, scale: 1, opacity: 1 }}
            transition={{
              rotate: { duration: 4.5, ease: 'linear' },
              scale: { duration: 1.8, ease: CHARGE_EASE },
              opacity: { duration: 1.0, ease: CHARGE_EASE },
            }}
            className="absolute inset-2 rounded-full border border-dashed border-[#43B5EC]/40 will-change-transform"
          />

          <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white border border-[#DCE7EE]/35 shadow-[0_0_48px_rgba(34,211,213,0.3)] flex items-center justify-center overflow-hidden p-1.5">
            {!imgFailed ? (
              <img
                src="/assets/aistudio/Glossy_Navy_DP_Logo_with_Teal_Swoosh_c7bac0b5.png"
                alt="Dent Propel Logo"
                referrerPolicy="no-referrer"
                loading="eager"
                decoding="sync"
                onError={() => setImgFailed(true)}
                className="w-full h-full object-contain"
              />
            ) : (
              <span className="font-display text-2xl font-bold tracking-tight text-[#087D94]">
                DP
              </span>
            )}
            {/* Subtle glossy cinema light sweep across emblem */}
            <motion.div
              aria-hidden="true"
              initial={{ x: '-140%', opacity: 0 }}
              animate={{ x: '180%', opacity: [0, 0.55, 0] }}
              transition={{ duration: 1.5, delay: 0.45, ease: CHARGE_EASE }}
              className="absolute inset-y-0 w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/75 to-transparent pointer-events-none"
            />
          </div>
        </div>

        {/* Brand Wordmark & Cinema Tagline */}
        <motion.div
          initial={{ opacity: 0.85, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, ease: CHARGE_EASE }}
          className="space-y-1.5"
        >
          <div className="font-display text-2xl sm:text-4xl font-bold tracking-[0.22em] text-[#F5FAFF] pl-[0.22em]">
            DENT PROPEL
          </div>
          <div className="font-mono-tabular text-[11px] sm:text-xs font-medium tracking-[0.28em] uppercase text-[#22D3D5]">
            Driving Dental Growth
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

export function CinematicIntro({ initialRoute }: { initialRoute: string }) {
  const prefersReducedMotion = Boolean(useReducedMotion());
  const [phase, setPhase] = useState<IntroPhase>(() => {
    const search = typeof window !== 'undefined' ? window.location.search : '';
    return shouldPlayIntro({
      search,
      reducedMotion: prefersReducedMotion,
      initialRoute,
    })
      ? 'charge'
      : 'done';
  });

  useEffect(() => {
    if (prefersReducedMotion && phase !== 'done') {
      setPhase('done');
    }
  }, [prefersReducedMotion, phase]);

  useEffect(() => {
    if (phase === 'done') return;

    const splitTimer = window.setTimeout(() => {
      setPhase((prev) => getNextIntroPhase(prev, 'SPLIT_READY'));
    }, INTRO_TIMINGS.chargeMs);

    const failsafeTimer = window.setTimeout(() => {
      setPhase((prev) => getNextIntroPhase(prev, 'COMPLETE'));
    }, INTRO_TIMINGS.failsafeMs);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setPhase((prev) => getNextIntroPhase(prev, 'SKIP'));
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.clearTimeout(splitTimer);
      window.clearTimeout(failsafeTimer);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [phase === 'done']);

  if (phase === 'done') {
    return null;
  }

  const isSplitting = phase === 'split';
  const splitDurationSec = INTRO_TIMINGS.splitDurationMs / 1000;

  return (
    <div
      data-testid="cinematic-intro"
      data-phase={phase}
      aria-label="Dent Propel brand introduction"
      className="fixed inset-0 z-[100] overflow-hidden select-none"
    >
      {/* Left Half of Split Curtain + Left Half of Centered Logo */}
      <motion.div
        initial={{ x: '0%' }}
        animate={{ x: isSplitting ? '-105%' : '0%' }}
        transition={{ duration: splitDurationSec, ease: SPLIT_EASE }}
        className="fixed top-0 bottom-0 left-0 w-1/2 overflow-hidden bg-[#050A16] will-change-transform"
      >
        <SplitBrandLockup side="left" phase={phase} />
        {/* Luminous split edge highlight */}
        <motion.div
          aria-hidden="true"
          animate={{ opacity: isSplitting ? 1 : 0 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
          className="absolute top-0 bottom-0 right-0 w-[2px] bg-gradient-to-b from-transparent via-[#22D3D5] to-transparent shadow-[0_0_28px_rgba(34,211,213,0.95)]"
        />
      </motion.div>

      {/* Right Half of Split Curtain + Right Half of Centered Logo */}
      <motion.div
        initial={{ x: '0%' }}
        animate={{ x: isSplitting ? '105%' : '0%' }}
        transition={{ duration: splitDurationSec, ease: SPLIT_EASE }}
        onAnimationComplete={() => {
          if (isSplitting) {
            setPhase((prev) => getNextIntroPhase(prev, 'COMPLETE'));
          }
        }}
        className="fixed top-0 bottom-0 right-0 w-1/2 overflow-hidden bg-[#050A16] will-change-transform"
      >
        <SplitBrandLockup side="right" phase={phase} />
        {/* Luminous split edge highlight */}
        <motion.div
          aria-hidden="true"
          animate={{ opacity: isSplitting ? 1 : 0 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
          className="absolute top-0 bottom-0 left-0 w-[2px] bg-gradient-to-b from-transparent via-[#22D3D5] to-transparent shadow-[0_0_28px_rgba(34,211,213,0.95)]"
        />
      </motion.div>

      {/* Smooth Vertical Light Slice Beam gliding down x=50% before split */}
      <motion.div
        aria-hidden="true"
        initial={{ scaleY: 0, opacity: 0 }}
        animate={
          isSplitting
            ? { scaleY: 1, opacity: [0.95, 0] }
            : { scaleY: [0, 0.55, 1], opacity: [0, 0.72, 1] }
        }
        transition={
          isSplitting
            ? { duration: 0.85, ease: 'easeOut' }
            : { duration: 1.05, delay: 1.45, ease: CHARGE_EASE }
        }
        className="pointer-events-none fixed top-0 bottom-0 left-1/2 -translate-x-1/2 w-[2px] origin-center bg-gradient-to-b from-transparent via-[#F5FAFF] to-transparent shadow-[0_0_28px_4px_rgba(34,211,213,0.85)] will-change-transform"
      />

      {/* Skip Intro Button */}
      {!isSplitting && (
        <button
          type="button"
          onClick={() => setPhase((prev) => getNextIntroPhase(prev, 'SKIP'))}
          className="fixed bottom-6 right-6 z-[110] px-3.5 py-1.5 rounded-xl border border-[#304258] bg-[#101B2B]/85 text-xs font-medium text-[#B8C8D8] hover:text-[#F5FAFF] hover:border-[#22D3D5]/60 backdrop-blur-md transition-colors cursor-pointer"
        >
          Skip Intro →
        </button>
      )}
    </div>
  );
}
