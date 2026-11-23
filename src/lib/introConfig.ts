export type IntroPhase = 'charge' | 'split' | 'done';

export type IntroAction = 'SPLIT_READY' | 'COMPLETE' | 'SKIP';

export const INTRO_TIMINGS = {
  chargeMs: 2800,
  splitDurationMs: 1750,
  failsafeMs: 6200,
} as const;

export interface ShouldPlayIntroParams {
  search: string;
  reducedMotion: boolean;
  initialRoute: string;
}

export function shouldPlayIntro({
  search,
  reducedMotion,
  initialRoute,
}: ShouldPlayIntroParams): boolean {
  if (reducedMotion) return false;
  if (initialRoute !== '/') return false;

  const params = new URLSearchParams(search);
  if (params.get('nointro') === '1' || params.get('autostart') === '1') {
    return false;
  }

  return true;
}

export function getNextIntroPhase(
  current: IntroPhase,
  action: IntroAction,
): IntroPhase {
  if (action === 'SKIP') return 'done';
  if (current === 'charge' && action === 'SPLIT_READY') return 'split';
  if (current === 'split' && action === 'COMPLETE') return 'done';
  if (action === 'COMPLETE') return 'done';
  return current;
}
