import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildCardEntranceStates,
  calculateStaggerDelay,
  FEATURE_VIEWPORT_CONFIG,
  LARGE_CARD_VIEWPORT_CONFIG,
} from './motionConfig';

test('calculateStaggerDelay scales cleanly with index and clamps at maxDelay', () => {
  assert.equal(calculateStaggerDelay(0, 0.08, 0), 0);
  assert.equal(calculateStaggerDelay(2, 0.08, 0.04), 0.2);
  assert.equal(calculateStaggerDelay(10, 0.08, 0, 0.42), 0.42);
  assert.equal(calculateStaggerDelay(-3, 0.08, 0.05), 0.05);
});

test('buildCardEntranceStates generates clean directional offsets and settled visible targets', () => {
  const up = buildCardEntranceStates('up', 28);
  assert.deepEqual(up.initial, { opacity: 0, x: 0, y: 28, scale: 0.97 });
  assert.deepEqual(up.visible, { opacity: 1, x: 0, y: 0, scale: 1 });

  const left = buildCardEntranceStates('left', 24);
  assert.equal(left.initial.x, -24);
  assert.equal(left.visible.x, 0);

  const right = buildCardEntranceStates('right', 24);
  assert.equal(right.initial.x, 24);
  assert.equal(right.visible.opacity, 1);

  const scale = buildCardEntranceStates('scale', 20);
  assert.equal(scale.initial.scale, 0.95);
  assert.equal(scale.visible.scale, 1);
});

test('viewport configs trigger reliably once without requiring excessive visibility ratio', () => {
  assert.equal(FEATURE_VIEWPORT_CONFIG.once, true);
  assert.ok(FEATURE_VIEWPORT_CONFIG.amount > 0 && FEATURE_VIEWPORT_CONFIG.amount <= 0.2);
  assert.ok(LARGE_CARD_VIEWPORT_CONFIG.amount <= 0.12);
});
