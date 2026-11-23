import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  HERO_GROWTH_NODES,
  PIPELINE_STAGE_SPECS,
  computeOrbitPosition,
  computeStageCameraPreset,
  sampleQuadraticBezierPoint,
} from './sceneConfig.ts';

describe('3D Scene Config Pure Math', () => {
  it('defines all 5 Dent Propel hero subsystem nodes with unique IDs and coordinates', () => {
    assert.equal(HERO_GROWTH_NODES.length, 5);
    const ids = new Set(HERO_GROWTH_NODES.map((n) => n.id));
    assert.equal(ids.size, 5);
  });

  it('scales radial orbital coordinates cleanly with spreadFactor', () => {
    const base = computeOrbitPosition(0, 3, 1, 1);
    const expanded = computeOrbitPosition(0, 3, 1, 1.35);
    assert.equal(base.x, 3);
    assert.equal(base.y, 1);
    assert.ok(Math.abs(base.z) < 1e-9);
    assert.ok(expanded.x > base.x);
    assert.ok(expanded.y > base.y);
  });

  it('samples quadratic bezier curves accurately at endpoints and midpoint', () => {
    const start = { x: 0, y: 0, z: 0 };
    const control = { x: 2, y: 4, z: 0 };
    const end = { x: 4, y: 0, z: 0 };

    assert.deepEqual(sampleQuadraticBezierPoint(start, control, end, 0), start);
    assert.deepEqual(sampleQuadraticBezierPoint(start, control, end, 1), end);

    const mid = sampleQuadraticBezierPoint(start, control, end, 0.5);
    assert.equal(mid.x, 2);
    assert.equal(mid.y, 2);
  });

  it('clamps stage camera presets cleanly across out-of-bounds indices', () => {
    assert.equal(computeStageCameraPreset(-2).index, 0);
    assert.equal(computeStageCameraPreset(99).index, PIPELINE_STAGE_SPECS.length - 1);
    assert.equal(computeStageCameraPreset(2).label, 'FOLLOW UP');
  });
});
