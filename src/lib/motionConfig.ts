export type EntranceDirection = 'up' | 'left' | 'right' | 'scale';

export const CINEMATIC_EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

export const FEATURE_VIEWPORT_CONFIG = {
  once: true,
  amount: 0.14,
} as const;

export const LARGE_CARD_VIEWPORT_CONFIG = {
  once: true,
  amount: 0.08,
} as const;

export function calculateStaggerDelay(
  index: number,
  stepSeconds = 0.085,
  baseDelaySeconds = 0,
  maxDelaySeconds = 0.42,
): number {
  const safeIndex = Math.max(0, Math.floor(index));
  const raw = baseDelaySeconds + safeIndex * stepSeconds;
  return Number(Math.min(maxDelaySeconds, Math.max(0, raw)).toFixed(3));
}

export function buildCardEntranceStates(
  direction: EntranceDirection = 'up',
  distancePx = 28,
): {
  initial: { opacity: number; x: number; y: number; scale: number };
  visible: { opacity: number; x: number; y: number; scale: number };
} {
  const safeDistance = Math.max(0, distancePx);

  switch (direction) {
    case 'left':
      return {
        initial: { opacity: 0, x: -safeDistance, y: 8, scale: 0.98 },
        visible: { opacity: 1, x: 0, y: 0, scale: 1 },
      };
    case 'right':
      return {
        initial: { opacity: 0, x: safeDistance, y: 8, scale: 0.98 },
        visible: { opacity: 1, x: 0, y: 0, scale: 1 },
      };
    case 'scale':
      return {
        initial: { opacity: 0, x: 0, y: 18, scale: 0.95 },
        visible: { opacity: 1, x: 0, y: 0, scale: 1 },
      };
    case 'up':
    default:
      return {
        initial: { opacity: 0, x: 0, y: safeDistance, scale: 0.97 },
        visible: { opacity: 1, x: 0, y: 0, scale: 1 },
      };
  }
}
