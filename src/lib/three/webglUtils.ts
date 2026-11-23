import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

export interface SceneThemePalette {
  backgroundHex: number;
  fogHex: number;
  gridMajorHex: number;
  gridMinorHex: number;
  metalPrimaryHex: number;
  metalTrimHex: number;
  accentHex: number;
  secondaryHex: number;
  ambientLightHex: number;
  keyLightHex: number;
  rimLightHex: number;
}

export function getThreeThemePalette(theme: 'light' | 'dark'): SceneThemePalette {
  if (theme === 'dark') {
    return {
      backgroundHex: 0x0b1426,
      fogHex: 0x0b1426,
      gridMajorHex: 0x22d3d5,
      gridMinorHex: 0x1e324d,
      metalPrimaryHex: 0x172943,
      metalTrimHex: 0x7aa2c4,
      accentHex: 0x22d3d5,
      secondaryHex: 0x6476ed,
      ambientLightHex: 0x94c2e8,
      keyLightHex: 0xf5faff,
      rimLightHex: 0x22d3d5,
    };
  }
  return {
    backgroundHex: 0xf1f7fb,
    fogHex: 0xf1f7fb,
    gridMajorHex: 0x087d94,
    gridMinorHex: 0xc8dbe6,
    metalPrimaryHex: 0x102338,
    metalTrimHex: 0x46596a,
    accentHex: 0x087d94,
    secondaryHex: 0x2563eb,
    ambientLightHex: 0xdbeafe,
    keyLightHex: 0xffffff,
    rimLightHex: 0x13afa8,
  };
}

/**
 * Probes unmasked WebGL renderer string using a tiny short-lived canvas
 * and loses the probe context immediately to avoid GPU context accumulation.
 */
export function detectSoftwareWebGL(): boolean {
  if (typeof document === 'undefined') return false;
  let canvas: HTMLCanvasElement | null = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  try {
    const gl =
      (canvas.getContext('webgl2') as WebGL2RenderingContext | null) ||
      (canvas.getContext('webgl') as WebGLRenderingContext | null);
    if (!gl) return true;

    const dbg = gl.getExtension('WEBGL_debug_renderer_info');
    const rendererString = dbg
      ? String(gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) || '')
      : String(gl.getParameter(gl.RENDERER) || '');

    const loseExt = gl.getExtension('WEBGL_lose_context');
    loseExt?.loseContext();

    return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(rendererString);
  } catch {
    return true;
  } finally {
    canvas = null;
  }
}

export function createRoomPmremEnvironment(renderer: THREE.WebGLRenderer): {
  envMap: THREE.Texture;
  dispose: () => void;
} {
  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  pmremGenerator.compileEquirectangularShader();
  const roomEnv = new RoomEnvironment();
  const renderTarget = pmremGenerator.fromScene(roomEnv, 0.04);
  roomEnv.dispose();

  return {
    envMap: renderTarget.texture,
    dispose: () => {
      renderTarget.dispose();
      pmremGenerator.dispose();
    },
  };
}

/**
 * Software-WebGL-safe frame pacing helper:
 * - On hardware GPU: calls requestAnimationFrame cleanly.
 * - On SwiftShader/CPU WebGL: inserts a WebGL2 fenceSync and waits for completion + 80ms
 *   so input/scroll/Playwright layout checks never starve.
 */
export function createAfterDrawScheduler(
  gl: WebGLRenderingContext | WebGL2RenderingContext,
  isSoftwareGl: boolean,
) {
  let cancelled = false;
  let rafId = 0;
  let timerId = 0;

  const scheduleNext = (tick: () => void) => {
    if (cancelled) return;

    if (!isSoftwareGl) {
      rafId = requestAnimationFrame(tick);
      return;
    }

    const gl2 = typeof WebGL2RenderingContext !== 'undefined' && gl instanceof WebGL2RenderingContext ? gl : null;
    if (!gl2 || typeof gl2.fenceSync !== 'function') {
      timerId = window.setTimeout(() => {
        if (!cancelled) rafId = requestAnimationFrame(tick);
      }, 85);
      return;
    }

    const sync = gl2.fenceSync(gl2.SYNC_GPU_COMMANDS_COMPLETE, 0);
    if (!sync) {
      timerId = window.setTimeout(() => {
        if (!cancelled) rafId = requestAnimationFrame(tick);
      }, 85);
      return;
    }
    gl2.flush();

    let pollCount = 0;
    const poll = () => {
      if (cancelled) {
        try {
          gl2.deleteSync(sync);
        } catch {
          // Ignore cleanup errors if context was lost
        }
        return;
      }
      pollCount += 1;
      const status = gl2.clientWaitSync(sync, 0, 0);
      if (status === gl2.TIMEOUT_EXPIRED && pollCount < 15) {
        timerId = window.setTimeout(poll, 16);
      } else {
        try {
          gl2.deleteSync(sync);
        } catch {
          // Ignore cleanup errors
        }
        timerId = window.setTimeout(() => {
          if (!cancelled) rafId = requestAnimationFrame(tick);
        }, 80);
      }
    };
    timerId = window.setTimeout(poll, 12);
  };

  const cancel = () => {
    cancelled = true;
    if (rafId) cancelAnimationFrame(rafId);
    if (timerId) window.clearTimeout(timerId);
  };

  return { scheduleNext, cancel };
}

export function disposeObject3D(root: THREE.Object3D): void {
  root.traverse((obj) => {
    if ((obj as THREE.Mesh).geometry) {
      (obj as THREE.Mesh).geometry.dispose();
    }
    const rawMat = (obj as THREE.Mesh).material;
    if (Array.isArray(rawMat)) {
      rawMat.forEach((m) => disposeMaterial(m));
    } else if (rawMat) {
      disposeMaterial(rawMat);
    }
  });
}

function disposeMaterial(mat: THREE.Material): void {
  const anyMat = mat as unknown as Record<string, unknown>;
  for (const key of Object.keys(anyMat)) {
    const val = anyMat[key];
    if (val && typeof val === 'object' && 'isTexture' in val) {
      (val as THREE.Texture).dispose();
    }
  }
  mat.dispose();
}
