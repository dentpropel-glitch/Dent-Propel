import React, { useRef, useState } from 'react';
import { motion, useReducedMotion, useScroll, useSpring } from 'motion/react';
import {
  buildCardEntranceStates,
  calculateStaggerDelay,
  CINEMATIC_EASE,
  FEATURE_VIEWPORT_CONFIG,
  LARGE_CARD_VIEWPORT_CONFIG,
  type EntranceDirection,
} from '../lib/motionConfig';

/**
 * Precision top-of-viewport scroll progress indicator synced smoothly via spring physics.
 */
export function ScrollProgressRail() {
  const shouldReduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 220,
    damping: 32,
    restDelta: 0.001,
  });

  if (shouldReduceMotion) {
    return null;
  }

  return (
    <motion.div
      aria-hidden="true"
      style={{ scaleX }}
      className="fixed top-0 left-0 right-0 h-[2.5px] z-[60] origin-left bg-gradient-to-r from-[#087D94] via-[#22D3D5] to-[#6476ED] pointer-events-none"
    />
  );
}

interface MotionTiltCardProps {
  children: React.ReactNode;
  className?: string;
  spotlightColor?: string;
  intensity?: number;
}

/**
 * Interactive 3D perspective card with subtle pointer-tracked specular glare.
 * Respects prefers-reduced-motion and avoids transforms on touch devices.
 */
export function MotionTiltCard({
  children,
  className = '',
  spotlightColor = 'rgba(34, 211, 213, 0.13)',
  intensity = 5.5,
}: MotionTiltCardProps) {
  const shouldReduceMotion = useReducedMotion();
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0, gx: 50, gy: 50, active: false });

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (shouldReduceMotion || e.pointerType !== 'mouse') return;
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    const ry = (px - 0.5) * intensity * 2;
    const rx = (0.5 - py) * intensity * 2;
    setTilt({
      rx,
      ry,
      gx: px * 100,
      gy: py * 100,
      active: true,
    });
  };

  const handlePointerLeave = () => {
    setTilt((prev) => ({ ...prev, rx: 0, ry: 0, active: false }));
  };

  return (
    <div
      ref={cardRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      style={{
        transform: shouldReduceMotion
          ? undefined
          : `perspective(1100px) rotateX(${tilt.rx.toFixed(2)}deg) rotateY(${tilt.ry.toFixed(2)}deg)`,
        transition: tilt.active
          ? 'transform 90ms cubic-bezier(0.16, 1, 0.3, 1)'
          : 'transform 380ms cubic-bezier(0.16, 1, 0.3, 1)',
      }}
      className={`relative overflow-hidden ${className}`}
    >
      {!shouldReduceMotion && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 transition-opacity duration-300"
          style={{
            opacity: tilt.active ? 1 : 0,
            background: `radial-gradient(380px circle at ${tilt.gx}% ${tilt.gy}%, ${spotlightColor}, transparent 68%)`,
          }}
        />
      )}
      {children}
    </div>
  );
}


interface KineticRevealProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}

export function KineticReveal({ children, delay = 0, className = '' }: KineticRevealProps) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={FEATURE_VIEWPORT_CONFIG}
      transition={{ duration: 0.48, delay, ease: CINEMATIC_EASE }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface ScrollFeatureCardProps {
  children: React.ReactNode;
  index?: number;
  stepDelay?: number;
  baseDelay?: number;
  direction?: EntranceDirection;
  distance?: number;
  large?: boolean;
  className?: string;
}

export function ScrollFeatureCard({
  children,
  index = 0,
  stepDelay = 0.085,
  baseDelay = 0,
  direction = 'up',
  distance = 28,
  large = false,
  className = '',
}: ScrollFeatureCardProps) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  const states = buildCardEntranceStates(direction, distance);
  const delay = calculateStaggerDelay(index, stepDelay, baseDelay);

  return (
    <motion.div
      initial={states.initial}
      whileInView={states.visible}
      viewport={large ? LARGE_CARD_VIEWPORT_CONFIG : FEATURE_VIEWPORT_CONFIG}
      transition={{
        duration: 0.56,
        delay,
        ease: CINEMATIC_EASE,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
