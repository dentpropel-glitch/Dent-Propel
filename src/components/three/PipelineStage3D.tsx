import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { useTheme } from '../../context/ThemeContext';
import { PIPELINE_STAGE_SPECS, computeStageCameraPreset } from '../../lib/three/sceneConfig';
import {
  createAfterDrawScheduler,
  createRoomPmremEnvironment,
  detectSoftwareWebGL,
  disposeObject3D,
  getThreeThemePalette,
} from '../../lib/three/webglUtils';

interface PipelineStage3DProps {
  selectedIndex: number;
  onSelectStage: (index: number) => void;
}

interface StageTowerBundle {
  index: number;
  group: THREE.Group;
  animatedSubgroup: THREE.Group;
  pedestalMat: THREE.MeshStandardMaterial;
  accentMat: THREE.MeshStandardMaterial;
  baseHaloMat: THREE.MeshBasicMaterial;
  hitTarget: THREE.Mesh;
}

export function PipelineStage3D({
  selectedIndex,
  onSelectStage,
}: PipelineStage3DProps) {
  const { resolvedTheme } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const mountRef = useRef<HTMLDivElement>(null);
  const [webglFallback, setWebglFallback] = useState(false);

  const selectedIndexRef = useRef(selectedIndex);
  const themeRef = useRef<'light' | 'dark'>(resolvedTheme);
  const onSelectStageRef = useRef(onSelectStage);

  selectedIndexRef.current = selectedIndex;
  themeRef.current = resolvedTheme;
  onSelectStageRef.current = onSelectStage;

  useEffect(() => {
    const mount = mountRef.current;
    const container = containerRef.current;
    if (!mount || !container) return;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    const isSoftwareGl = detectSoftwareWebGL();
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: !isSoftwareGl,
        alpha: false,
        powerPreference: isSoftwareGl ? 'default' : 'high-performance',
      });
    } catch {
      setWebglFallback(true);
      return;
    }

    const w = Math.max(mount.clientWidth || 720, 260);
    const h = Math.max(mount.clientHeight || 280, 220);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(w, h, false);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.shadowMap.enabled = false;
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.display = 'block';
    mount.appendChild(renderer.domElement);

    const palette = getThreeThemePalette(themeRef.current);
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(palette.backgroundHex);
    scene.fog = new THREE.FogExp2(palette.fogHex, 0.036);

    const pmrem = createRoomPmremEnvironment(renderer);
    scene.environment = pmrem.envMap;

    const initialPreset = computeStageCameraPreset(selectedIndexRef.current);
    const camera = new THREE.PerspectiveCamera(40, w / h, 0.1, 50);
    camera.position.set(
      initialPreset.cameraPosition.x,
      initialPreset.cameraPosition.y,
      initialPreset.cameraPosition.z,
    );
    const currentLookAt = new THREE.Vector3(
      initialPreset.lookAt.x,
      initialPreset.lookAt.y,
      initialPreset.lookAt.z,
    );
    camera.lookAt(currentLookAt);

    // Lighting rig
    const hemi = new THREE.HemisphereLight(palette.ambientLightHex, palette.backgroundHex, 0.9);
    scene.add(hemi);
    const dirKey = new THREE.DirectionalLight(palette.keyLightHex, 2.0);
    dirKey.position.set(3.5, 6.5, 5);
    scene.add(dirKey);
    const dirRim = new THREE.DirectionalLight(palette.rimLightHex, 1.3);
    dirRim.position.set(-4, 4, -3);
    scene.add(dirRim);

    // Ground plane + grid
    const floorGeo = new THREE.PlaneGeometry(18, 10);
    floorGeo.rotateX(-Math.PI / 2);
    const floorMat = new THREE.MeshStandardMaterial({
      color: themeRef.current === 'dark' ? 0x0c1629 : 0xe8f1f7,
      roughness: 0.9,
      metalness: 0.05,
    });
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.position.y = -0.35;
    scene.add(floorMesh);

    const grid = new THREE.GridHelper(16, 24, palette.gridMajorHex, palette.gridMinorHex);
    grid.position.y = -0.34;
    if (grid.material instanceof THREE.Material) {
      grid.material.transparent = true;
      grid.material.opacity = 0.25;
    }
    scene.add(grid);

    // Continuous CatmullRom spline track joining all 5 stages
    const trackPoints = PIPELINE_STAGE_SPECS.map(
      (s) => new THREE.Vector3(s.position.x, s.position.y + 0.35, s.position.z),
    );
    const splineCurve = new THREE.CatmullRomCurve3(trackPoints);
    const trackGeo = new THREE.TubeGeometry(splineCurve, 64, 0.045, 10, false);
    const trackMat = new THREE.MeshStandardMaterial({
      color: palette.accentHex,
      emissive: palette.accentHex,
      emissiveIntensity: 0.45,
      roughness: 0.3,
      metalness: 0.7,
      transparent: true,
      opacity: 0.75,
    });
    const trackMesh = new THREE.Mesh(trackGeo, trackMat);
    scene.add(trackMesh);

    // Traveling flow packets along the 5-stage pipeline (15 packets)
    const PACKET_COUNT = 15;
    const packetGeo = new THREE.SphereGeometry(0.07, 10, 10);
    const packetMat = new THREE.MeshBasicMaterial({ color: palette.accentHex });
    const packetMesh = new THREE.InstancedMesh(packetGeo, packetMat, PACKET_COUNT);
    scene.add(packetMesh);

    const baseHaloGeo = new THREE.RingGeometry(0.57, 0.72, 36);
    baseHaloGeo.rotateX(-Math.PI / 2);

    // Build 5 distinct composite architectural stage towers
    const bundles: StageTowerBundle[] = [];
    const hitTargets: THREE.Mesh[] = [];
    const hitGeo = new THREE.CylinderGeometry(0.75, 0.75, 1.9, 10);
    const hitMat = new THREE.MeshBasicMaterial({
      transparent: true,
      opacity: 0,
      depthWrite: false,
    });

    PIPELINE_STAGE_SPECS.forEach((spec, idx) => {
      const group = new THREE.Group();
      group.position.set(spec.position.x, spec.position.y, spec.position.z);
      scene.add(group);

      const pedestalMat = new THREE.MeshStandardMaterial({
        color: palette.metalPrimaryHex,
        roughness: 0.3,
        metalness: 0.85,
      });
      const accentMat = new THREE.MeshStandardMaterial({
        color: palette.accentHex,
        emissive: palette.accentHex,
        emissiveIntensity: 0.55,
        roughness: 0.2,
        metalness: 0.5,
      });

      // Tiered octagonal pedestal base shared across stages
      const plinth = new THREE.Mesh(
        new THREE.CylinderGeometry(0.46, 0.56, 0.28, 8),
        pedestalMat,
      );
      plinth.position.y = -0.18;
      group.add(plinth);

      const trimRing = new THREE.Mesh(
        new THREE.TorusGeometry(0.49, 0.025, 12, 32),
        accentMat,
      );
      trimRing.rotation.x = Math.PI / 2;
      trimRing.position.y = -0.05;
      group.add(trimRing);

      const baseHaloMat = new THREE.MeshBasicMaterial({
        color: palette.accentHex,
        transparent: true,
        opacity: idx === selectedIndexRef.current ? 0.65 : 0.0,
        side: THREE.DoubleSide,
      });
      const baseHalo = new THREE.Mesh(baseHaloGeo, baseHaloMat);
      baseHalo.position.y = -0.32;
      group.add(baseHalo);

      const animatedSubgroup = new THREE.Group();
      animatedSubgroup.position.y = 0.52;
      group.add(animatedSubgroup);

      // Unique sculptural architecture per stage
      if (idx === 0) {
        // 01 ATTRACT: Parabolic Signal Dish + Concentric Wave Rings
        const dishPts = [
          new THREE.Vector2(0, 0),
          new THREE.Vector2(0.18, 0.06),
          new THREE.Vector2(0.36, 0.22),
          new THREE.Vector2(0.42, 0.25),
        ];
        const dish = new THREE.Mesh(new THREE.LatheGeometry(dishPts, 24), pedestalMat);
        dish.rotation.x = -0.35;
        animatedSubgroup.add(dish);
        const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.13, 16, 16), accentMat);
        beacon.position.set(0, 0.28, 0.08);
        animatedSubgroup.add(beacon);
        const wave = new THREE.Mesh(new THREE.TorusGeometry(0.38, 0.02, 10, 32), accentMat);
        wave.position.set(0, 0.35, 0.14);
        wave.rotation.x = -0.35;
        animatedSubgroup.add(wave);
      } else if (idx === 1) {
        // 02 CAPTURE: Stepped Precision Funnel Collector + Crystal
        const outerFunnel = new THREE.Mesh(
          new THREE.CylinderGeometry(0.46, 0.2, 0.38, 6, 1, true),
          pedestalMat,
        );
        outerFunnel.material.side = THREE.DoubleSide;
        animatedSubgroup.add(outerFunnel);
        const intakeRing = new THREE.Mesh(
          new THREE.TorusGeometry(0.45, 0.028, 12, 32),
          accentMat,
        );
        intakeRing.rotation.x = Math.PI / 2;
        intakeRing.position.y = 0.2;
        animatedSubgroup.add(intakeRing);
        const core = new THREE.Mesh(new THREE.OctahedronGeometry(0.16, 0), accentMat);
        core.position.y = 0.08;
        animatedSubgroup.add(core);
      } else if (idx === 2) {
        // 03 FOLLOW UP: Interlocked Relay Gyro Rings + Conduit Axis
        const spine = new THREE.Mesh(
          new THREE.CylinderGeometry(0.06, 0.06, 0.65, 12),
          pedestalMat,
        );
        animatedSubgroup.add(spine);
        const r1 = new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.032, 12, 36), accentMat);
        r1.rotation.y = Math.PI / 4;
        animatedSubgroup.add(r1);
        const r2 = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.026, 12, 32), pedestalMat);
        r2.rotation.x = Math.PI / 3;
        animatedSubgroup.add(r2);
      } else if (idx === 3) {
        // 04 BOOK: Precision Calendar Vault Monolith + Suspended Keystone
        const frameShape = new THREE.Shape();
        frameShape.moveTo(-0.3, -0.26);
        frameShape.lineTo(0.3, -0.26);
        frameShape.lineTo(0.3, 0.26);
        frameShape.lineTo(-0.3, 0.26);
        frameShape.closePath();
        const slabGeo = new THREE.ExtrudeGeometry(frameShape, {
          depth: 0.14,
          bevelEnabled: true,
          bevelSegments: 2,
          bevelThickness: 0.03,
          bevelSize: 0.03,
        });
        slabGeo.center();
        const slab = new THREE.Mesh(slabGeo, pedestalMat);
        animatedSubgroup.add(slab);
        const keystone = new THREE.Mesh(new THREE.OctahedronGeometry(0.18, 0), accentMat);
        keystone.position.set(0, 0.36, 0);
        animatedSubgroup.add(keystone);
      } else {
        // 05 OPTIMIZE: Tri-Pillar Growth Spires + Summit Crown Prism
        const heights = [0.28, 0.44, 0.62];
        heights.forEach((ht, bIdx) => {
          const bar = new THREE.Mesh(
            new THREE.BoxGeometry(0.14, ht, 0.14),
            bIdx === 2 ? accentMat : pedestalMat,
          );
          bar.position.set((bIdx - 1) * 0.2, ht * 0.5 - 0.3, 0);
          animatedSubgroup.add(bar);
        });
        const crown = new THREE.Mesh(new THREE.IcosahedronGeometry(0.18, 0), accentMat);
        crown.position.set(0.2, 0.46, 0);
        animatedSubgroup.add(crown);
      }

      const hit = new THREE.Mesh(hitGeo, hitMat);
      hit.position.y = 0.45;
      hit.userData = { stageIndex: idx };
      group.add(hit);
      hitTargets.push(hit);

      bundles.push({
        index: idx,
        group,
        animatedSubgroup,
        pedestalMat,
        accentMat,
        baseHaloMat,
        hitTarget: hit,
      });
    });

    const _dummy = new THREE.Object3D();
    const _pt = new THREE.Vector3();
    const _raycaster = new THREE.Raycaster();
    const _pointer = new THREE.Vector2();
    let appliedTheme: 'light' | 'dark' | null = null;

    const applyTheme = (t: 'light' | 'dark') => {
      if (appliedTheme === t) return;
      appliedTheme = t;
      const pal = getThreeThemePalette(t);
      (scene.background as THREE.Color).setHex(pal.backgroundHex);
      if (scene.fog instanceof THREE.FogExp2) scene.fog.color.setHex(pal.fogHex);
      floorMat.color.setHex(t === 'dark' ? 0x0c1629 : 0xe8f1f7);
      hemi.color.setHex(pal.ambientLightHex);
      hemi.groundColor.setHex(pal.backgroundHex);
      dirRim.color.setHex(pal.rimLightHex);
      trackMat.color.setHex(pal.accentHex);
      trackMat.emissive.setHex(pal.accentHex);
      packetMat.color.setHex(pal.accentHex);

      bundles.forEach((b) => {
        b.pedestalMat.color.setHex(pal.metalPrimaryHex);
        b.accentMat.color.setHex(pal.accentHex);
        b.accentMat.emissive.setHex(pal.accentHex);
        b.baseHaloMat.color.setHex(pal.accentHex);
      });
    };

    const handlePointerDown = (e: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      _pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      _pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      _raycaster.setFromCamera(_pointer, camera);
      const hits = _raycaster.intersectObjects(hitTargets, false);
      const stageIdx = hits[0]?.object?.userData?.stageIndex;
      if (typeof stageIdx === 'number') {
        onSelectStageRef.current(stageIdx);
      }
    };

    const handlePointerMove = (e: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      _pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      _pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      _raycaster.setFromCamera(_pointer, camera);
      const hits = _raycaster.intersectObjects(hitTargets, false);
      renderer.domElement.style.cursor = hits.length > 0 ? 'pointer' : 'default';
    };

    renderer.domElement.addEventListener('pointerdown', handlePointerDown);
    renderer.domElement.addEventListener('pointermove', handlePointerMove);

    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const rw = Math.max(Math.round(entry.contentRect.width), 260);
      const rh = Math.max(Math.round(entry.contentRect.height), 220);
      camera.aspect = rw / rh;
      camera.updateProjectionMatrix();
      renderer.setSize(rw, rh, false);
    });
    resizeObserver.observe(mount);

    let isVisible = true;
    let disposed = false;
    let scheduler = createAfterDrawScheduler(renderer.getContext(), isSoftwareGl);
    let simTime = 0;
    let lastTime = performance.now();

    const tick = () => {
      if (disposed || !isVisible) return;
      const now = performance.now();
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;
      if (!prefersReducedMotion) {
        simTime += dt;
      }

      applyTheme(themeRef.current);

      // Smoothly damp camera to selected stage preset
      const preset = computeStageCameraPreset(selectedIndexRef.current);
      camera.position.x = THREE.MathUtils.damp(camera.position.x, preset.cameraPosition.x, 4.5, dt || 0.016);
      camera.position.y = THREE.MathUtils.damp(camera.position.y, preset.cameraPosition.y, 4.5, dt || 0.016);
      camera.position.z = THREE.MathUtils.damp(camera.position.z, preset.cameraPosition.z, 4.5, dt || 0.016);
      currentLookAt.x = THREE.MathUtils.damp(currentLookAt.x, preset.lookAt.x, 4.5, dt || 0.016);
      currentLookAt.y = THREE.MathUtils.damp(currentLookAt.y, preset.lookAt.y, 4.5, dt || 0.016);
      currentLookAt.z = THREE.MathUtils.damp(currentLookAt.z, preset.lookAt.z, 4.5, dt || 0.016);
      camera.lookAt(currentLookAt);

      // Animate towers and highlight selected index
      for (let i = 0; i < bundles.length; i++) {
        const b = bundles[i];
        const active = b.index === selectedIndexRef.current;
        const past = b.index <= selectedIndexRef.current;
        const targetScale = active ? 1.28 : 0.94;
        const s = THREE.MathUtils.damp(b.group.scale.x, targetScale, 7, dt || 0.016);
        b.group.scale.setScalar(s);
        b.animatedSubgroup.rotation.y = simTime * (active ? 0.95 : 0.3);
        b.animatedSubgroup.position.y = 0.52 + (active ? Math.sin(simTime * 2) * 0.05 : 0);
        b.accentMat.emissiveIntensity = active ? 1.55 : past ? 0.72 : 0.25;
        b.baseHaloMat.opacity = active ? 0.55 + Math.sin(simTime * 3) * 0.15 : 0;
      }

      // Animate pipeline packets along the 5-stage CatmullRom spline
      for (let p = 0; p < PACKET_COUNT; p++) {
        const u = (simTime * 0.16 + p / PACKET_COUNT) % 1;
        splineCurve.getPointAt(u, _pt);
        _dummy.position.copy(_pt);
        _dummy.scale.setScalar(1);
        _dummy.updateMatrix();
        packetMesh.setMatrixAt(p, _dummy.matrix);
      }
      packetMesh.instanceMatrix.needsUpdate = true;

      renderer.render(scene, camera);
      scheduler.scheduleNext(tick);
    };

    const intersectionObserver = new IntersectionObserver(
      (entries) => {
        const vis = Boolean(entries[0]?.isIntersecting);
        if (vis && !isVisible) {
          isVisible = true;
          lastTime = performance.now();
          scheduler.cancel();
          scheduler = createAfterDrawScheduler(renderer.getContext(), isSoftwareGl);
          tick();
        } else if (!vis && isVisible) {
          isVisible = false;
          scheduler.cancel();
        }
      },
      { threshold: 0.05 },
    );
    intersectionObserver.observe(container);

    const handleContextLost = (e: Event) => {
      e.preventDefault();
      scheduler.cancel();
    };
    const handleContextRestored = () => {
      if (isVisible && !disposed) {
        lastTime = performance.now();
        tick();
      }
    };
    renderer.domElement.addEventListener('webglcontextlost', handleContextLost);
    renderer.domElement.addEventListener('webglcontextrestored', handleContextRestored);

    tick();

    return () => {
      disposed = true;
      scheduler.cancel();
      intersectionObserver.disconnect();
      resizeObserver.disconnect();
      renderer.domElement.removeEventListener('pointerdown', handlePointerDown);
      renderer.domElement.removeEventListener('pointermove', handlePointerMove);
      renderer.domElement.removeEventListener('webglcontextlost', handleContextLost);
      renderer.domElement.removeEventListener('webglcontextrestored', handleContextRestored);
      pmrem.dispose();
      disposeObject3D(scene);
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, []);

  if (webglFallback) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className="relative mb-8 rounded-3xl border border-[#DCE7EE] dark:border-[#304258] bg-[#F1F7FB] dark:bg-[#0B1426] overflow-hidden shadow-[var(--dp-shadow)]"
    >
      <div className="flex items-center justify-between gap-3 px-4 sm:px-5 py-2.5 border-b border-[#DCE7EE] dark:border-[#24364D] bg-white/95 dark:bg-[#0D1829]/95 text-xs">
        <span className="font-semibold text-[#102338] dark:text-[#F5FAFF] whitespace-nowrap">
          3D Growth Pipeline Architecture
        </span>
        <span className="font-mono-tabular text-[#46596A] dark:text-[#B8C8D8] hidden sm:inline whitespace-nowrap">
          Click any 3D stage module to focus camera
        </span>
      </div>
      <div
        ref={mountRef}
        className="h-[260px] sm:h-[330px] lg:h-[360px] w-full"
        aria-label="Interactive 3D pipeline sculpture visualizing the 5 stages from Attract to Optimize"
      />
    </div>
  );
}
