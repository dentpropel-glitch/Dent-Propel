import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getNextIntroPhase,
  INTRO_TIMINGS,
  shouldPlayIntro,
} from './introConfig';

test('shouldPlayIntro enables intro on homepage when motion is enabled', () => {
  assert.equal(
    shouldPlayIntro({ search: '', reducedMotion: false, initialRoute: '/' }),
    true,
  );
});

test('shouldPlayIntro skips intro for reduced motion, bypass params, or non-landing routes', () => {
  assert.equal(
    shouldPlayIntro({ search: '', reducedMotion: true, initialRoute: '/' }),
    false,
  );
  assert.equal(
    shouldPlayIntro({ search: '?nointro=1', reducedMotion: false, initialRoute: '/' }),
    false,
  );
  assert.equal(
    shouldPlayIntro({ search: '?autostart=1', reducedMotion: false, initialRoute: '/' }),
    false,
  );
  assert.equal(
    shouldPlayIntro({ search: '', reducedMotion: false, initialRoute: '/checkout' }),
    false,
  );
});

test('getNextIntroPhase transitions charge -> split -> done cleanly and supports instant skip', () => {
  assert.equal(getNextIntroPhase('charge', 'SPLIT_READY'), 'split');
  assert.equal(getNextIntroPhase('split', 'COMPLETE'), 'done');
  assert.equal(getNextIntroPhase('charge', 'SKIP'), 'done');
  assert.equal(getNextIntroPhase('split', 'SKIP'), 'done');
  assert.equal(getNextIntroPhase('done', 'SPLIT_READY'), 'done');
});

test('INTRO_TIMINGS failsafe exceeds charge + split duration cleanly within cinematic budget', () => {
  const totalDuration = INTRO_TIMINGS.chargeMs + INTRO_TIMINGS.splitDurationMs;
  assert.ok(totalDuration >= 3500 && totalDuration <= 5500);
  assert.ok(INTRO_TIMINGS.failsafeMs > totalDuration);
});
