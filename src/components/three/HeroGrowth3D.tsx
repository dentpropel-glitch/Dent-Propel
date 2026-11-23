import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Expand, Minimize2, Pause, Play, RotateCcw } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import {
  HERO_GROWTH_NODES,
  GrowthNodeId,
  computeOrbitPosition,
  sampleQuadraticBezierPoint,
} from '../../lib/three/sceneConfig';
import {
  createAfterDrawScheduler,
  createRoomPmremEnvironment,
  detectSoftwareWebGL,
  disposeObject3D,
  getThreeThemePalette,
} from '../../lib/three/webglUtils';

interface NodeVisualBundle {
  id: GrowthNodeId;
  group: THREE.Group;
  hitTarget: THREE.Mesh;
  coreMesh: THREE.Mesh;
  coreMat: THREE.MeshStandardMaterial;
  haloMesh: THREE.Mesh;
  haloMat: THREE.MeshStandardMaterial;
  baseMat: THREE.MeshStandardMaterial;
  pylonMesh: THREE.Mesh;
  conduitMesh: THREE.Mesh;
  conduitMat: THREE.MeshStandardMaterial;
  angleRad: number;
  baseRadius: number;
  elevation: number;
  accentLight: number;
  accentDark: number;
  basePos: THREE.Vector3;
}

export function HeroGrowth3D() {
  const { resolvedTheme } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const mountRef = useRef<HTMLDivElement>(null);

  const [activeId, setActiveId] = useState<GrowthNodeId>('inquiries');
  const [hoveredId, setHoveredId] = useState<GrowthNodeId | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [webglUnavailable, setWebglUnavailable] = useState(false);

  const activeIdRef = useRef<GrowthNodeId>(activeId);
  const hoveredIdRef = useRef<GrowthNodeId | null>(hoveredId);
  const isPausedRef = useRef<boolean>(isPaused);
  const isExpandedRef = useRef<boolean>(isExpanded);
  const themeRef = useRef<'light' | 'dark'>(resolvedTheme);
  const resetViewRef = useRef<(() => void) | null>(null);

  activeIdRef.current = activeId;
  hoveredIdRef.current = hoveredId;
  isPausedRef.current = isPaused;
  isExpandedRef.current = isExpanded;
  themeRef.current = resolvedTheme;

  useEffect(() => {
    const mount = mountRef.current;
    const container = containerRef.current;
    if (!mount || !container) return;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      isPausedRef.current = true;
    }

    const isSoftwareGl = detectSoftwareWebGL();
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: !isSoftwareGl,
        alpha: false,
        powerPreference: isSoftwareGl ? 'default' : 'high-performance',
      });
    } catch {
      setWebglUnavailable(true);
      return;
    }

    const initWidth = Math.max(mount.clientWidth || 520, 260);
    const initHeight = Math.max(mount.clientHeight || 440, 260);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(initWidth, initHeight, false);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.shadowMap.enabled = !isSoftwareGl;
    if (!isSoftwareGl) {
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    }

    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.touchAction = 'pan-y';
    mount.appendChild(renderer.domElement);

    const palette = getThreeThemePalette(themeRef.current);
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(palette.backgroundHex);
    scene.fog = new THREE.FogExp2(palette.fogHex, 0.042);

    const pmrem = createRoomPmremEnvironment(renderer);
    scene.environment = pmrem.envMap;

    const camera = new THREE.PerspectiveCamera(42, initWidth / initHeight, 0.1, 60);
    camera.position.set(0, 3.8, 7.9);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.enableZoom = false;
    controls.enablePan = false;
    controls.minPolarAngle = 0.42;
    controls.maxPolarAngle = Math.PI * 0.47;
    controls.target.set(0, 0.25, 0);
    controls.update();

    resetViewRef.current = () => {
      camera.position.set(0, 3.8, 7.9);
      controls.target.set(0, 0.25, 0);
      controls.update();
    };

    // Lighting rig (consistent intensities on software & hardware WebGL)
    const hemiLight = new THREE.HemisphereLight(
      palette.ambientLightHex,
      palette.backgroundHex,
      0.85,
    );
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(palette.keyLightHex, 2.2);
    keyLight.position.set(4.5, 7.5, 5.2);
    if (!isSoftwareGl) {
      keyLight.castShadow = true;
      keyLight.shadow.mapSize.set(1024, 1024);
      keyLight.shadow.camera.near = 1;
      keyLight.shadow.camera.far = 22;
    }
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(palette.rimLightHex, 1.35);
    rimLight.position.set(-5.5, 3.8, -4.5);
    scene.add(rimLight);

    const corePointLight = new THREE.PointLight(palette.accentHex, 2.4, 9, 1.5);
    corePointLight.position.set(0, 1.15, 0);
    scene.add(corePointLight);

    // Architectural stage floor & concentric compass rings
    const stageGroup = new THREE.Group();
    scene.add(stageGroup);

    const floorGeo = new THREE.CircleGeometry(6.5, 64);
    floorGeo.rotateX(-Math.PI / 2);
    const floorMat = new THREE.MeshStandardMaterial({
      color: themeRef.current === 'dark' ? 0x0c1629 : 0xe8f1f7,
      roughness: 0.88,
      metalness: 0.08,
    });
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.position.y = -0.32;
    floorMesh.receiveShadow = !isSoftwareGl;
    stageGroup.add(floorMesh);

    const gridHelper = new THREE.GridHelper(
      11,
      22,
      palette.gridMajorHex,
      palette.gridMinorHex,
    );
    gridHelper.position.y = -0.315;
    const gridMat = gridHelper.material as THREE.Material;
    if (gridMat) {
      gridMat.transparent = true;
      gridMat.opacity = 0.28;
    }
    stageGroup.add(gridHelper);

    const orbitRingGeo = new THREE.TorusGeometry(3.16, 0.018, 12, 96);
    orbitRingGeo.rotateX(Math.PI / 2);
    const orbitRingMat = new THREE.MeshStandardMaterial({
      color: palette.accentHex,
      emissive: palette.accentHex,
      emissiveIntensity: 0.3,
      roughness: 0.35,
      metalness: 0.8,
    });
    const orbitRingMesh = new THREE.Mesh(orbitRingGeo, orbitRingMat);
    orbitRingMesh.position.y = -0.22;
    stageGroup.add(orbitRingMesh);

    // Composite multi-part Central Dent Propel Architectural Hub (8 procedural parts)
    const hubGroup = new THREE.Group();
    hubGroup.position.set(0, 0.65, 0);
    scene.add(hubGroup);

    // Part 1: Lathed Precision Pedestal
    const lathePts = [
      new THREE.Vector2(0.0, -0.95),
      new THREE.Vector2(1.02, -0.95),
      new THREE.Vector2(0.92, -0.78),
      new THREE.Vector2(0.68, -0.7),
      new THREE.Vector2(0.55, -0.45),
      new THREE.Vector2(0.0, -0.45),
    ];
    const hubPedestalGeo = new THREE.LatheGeometry(lathePts, 36);
    const hubMetalMat = new THREE.MeshStandardMaterial({
      color: palette.metalPrimaryHex,
      roughness: 0.28,
      metalness: 0.86,
    });
    const hubPedestal = new THREE.Mesh(hubPedestalGeo, hubMetalMat);
    hubPedestal.castShadow = !isSoftwareGl;
    hubGroup.add(hubPedestal);

    // Part 2: Illuminated Collar Ring on Pedestal
    const collarGeo = new THREE.TorusGeometry(0.76, 0.035, 16, 48);
    collarGeo.rotateX(Math.PI / 2);
    const hubTrimMat = new THREE.MeshStandardMaterial({
      color: palette.accentHex,
      emissive: palette.accentHex,
      emissiveIntensity: 0.65,
      roughness: 0.25,
      metalness: 0.75,
    });
    const collarMesh = new THREE.Mesh(collarGeo, hubTrimMat);
    collarMesh.position.y = -0.72;
    hubGroup.add(collarMesh);

    // Part 3: Outer Chamfered Gyroscope Ring + 4 Caliper Brackets
    const outerGyroGroup = new THREE.Group();
    outerGyroGroup.position.y = 0.22;
    hubGroup.add(outerGyroGroup);

    const outerGyroGeo = new THREE.TorusGeometry(0.95, 0.055, 20, 64);
    const outerGyroMat = new THREE.MeshStandardMaterial({
      color: palette.metalTrimHex,
      roughness: 0.22,
      metalness: 0.9,
    });
    const outerGyroMesh = new THREE.Mesh(outerGyroGeo, outerGyroMat);
    outerGyroGroup.add(outerGyroMesh);

    const bracketShape = new THREE.Shape();
    bracketShape.moveTo(-0.08, -0.14);
    bracketShape.lineTo(0.08, -0.14);
    bracketShape.lineTo(0.11, 0.14);
    bracketShape.lineTo(-0.11, 0.14);
    bracketShape.closePath();
    const bracketGeo = new THREE.ExtrudeGeometry(bracketShape, {
      depth: 0.08,
      bevelEnabled: true,
      bevelSegments: 2,
      bevelThickness: 0.02,
      bevelSize: 0.015,
    });
    bracketGeo.center();

    for (let i = 0; i < 4; i++) {
      const angle = (i * Math.PI) / 2;
      const bracket = new THREE.Mesh(bracketGeo, hubTrimMat);
      bracket.position.set(Math.cos(angle) * 0.95, Math.sin(angle) * 0.95, 0);
      bracket.rotation.z = angle;
      outerGyroGroup.add(bracket);
    }

    // Part 4: Counter-Rotating Inner Gimbal Ring
    const innerGyroGroup = new THREE.Group();
    innerGyroGroup.position.y = 0.22;
    hubGroup.add(innerGyroGroup);

    const innerGyroGeo = new THREE.TorusGeometry(0.68, 0.036, 16, 56);
    const innerGyroMesh = new THREE.Mesh(innerGyroGeo, hubTrimMat);
    innerGyroMesh.rotation.x = Math.PI / 3;
    innerGyroGroup.add(innerGyroMesh);

    // Part 5: Sculpted Crystalline Core + Inner Nucleus
    const crystalGeo = new THREE.IcosahedronGeometry(0.46, 0);
    const crystalMat = new THREE.MeshPhysicalMaterial({
      color: palette.accentHex,
      emissive: palette.accentHex,
      emissiveIntensity: 0.24,
      roughness: 0.12,
      metalness: 0.1,
      clearcoat: 1,
      clearcoatRoughness: 0.08,
      transmission: isSoftwareGl ? 0 : 0.78,
      ior: 1.48,
      thickness: isSoftwareGl ? 0 : 0.8,
      transparent: true,
      opacity: isSoftwareGl ? 0.56 : 0.95,
    });
    const crystalMesh = new THREE.Mesh(crystalGeo, crystalMat);
    crystalMesh.position.y = 0.22;
    hubGroup.add(crystalMesh);

    const nucleusGeo = new THREE.OctahedronGeometry(0.22, 0);
    const nucleusMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: palette.accentHex,
      emissiveIntensity: 1.35,
      roughness: 0.15,
      metalness: 0.2,
    });
    const nucleusMesh = new THREE.Mesh(nucleusGeo, nucleusMat);
    nucleusMesh.position.y = 0.22;
    hubGroup.add(nucleusMesh);

    // Build 5 Composite Subsystem Satellite Nodes + Curved Tube Conduits
    const nodeBundles: NodeVisualBundle[] = [];
    const hitTargets: THREE.Mesh[] = [];
    const satellitesGroup = new THREE.Group();
    scene.add(satellitesGroup);

    const nodePedestalGeo = new THREE.CylinderGeometry(0.26, 0.34, 0.18, 6);
    const nodeCrystalGeo = new THREE.OctahedronGeometry(0.24, 0);
    const nodeHaloGeo = new THREE.TorusGeometry(0.36, 0.025, 12, 36);
    const hitSphereGeo = new THREE.SphereGeometry(0.56, 12, 12);
    const hitInvisibleMat = new THREE.MeshBasicMaterial({
      transparent: true,
      opacity: 0,
      depthWrite: false,
    });
    const pylonGeo = new THREE.CylinderGeometry(0.014, 0.014, 1, 8);

    const hubOrigin = new THREE.Vector3(0, 0.85, 0);

    HERO_GROWTH_NODES.forEach((spec) => {
      const accentColor =
        themeRef.current === 'dark' ? spec.accentHexDark : spec.accentHexLight;
      const pos = computeOrbitPosition(spec.angleRad, spec.baseRadius, spec.elevation, 1);

      const group = new THREE.Group();
      group.position.set(pos.x, pos.y, pos.z);
      satellitesGroup.add(group);

      const baseMat = new THREE.MeshStandardMaterial({
        color: palette.metalPrimaryHex,
        roughness: 0.32,
        metalness: 0.82,
      });
      const baseMesh = new THREE.Mesh(nodePedestalGeo, baseMat);
      baseMesh.position.y = -0.22;
      group.add(baseMesh);

      const coreMat = new THREE.MeshStandardMaterial({
        color: accentColor,
        emissive: accentColor,
        emissiveIntensity: 0.75,
        roughness: 0.2,
        metalness: 0.35,
      });
      const coreMesh = new THREE.Mesh(nodeCrystalGeo, coreMat);
      coreMesh.position.y = 0.08;
      group.add(coreMesh);

      const haloMat = new THREE.MeshStandardMaterial({
        color: accentColor,
        emissive: accentColor,
        emissiveIntensity: 0.4,
        roughness: 0.3,
        metalness: 0.85,
      });
      const haloMesh = new THREE.Mesh(nodeHaloGeo, haloMat);
      haloMesh.position.y = 0.08;
      haloMesh.rotation.x = Math.PI * 0.38;
      group.add(haloMesh);

      const pylonMesh = new THREE.Mesh(pylonGeo, baseMat);
      pylonMesh.scale.y = Math.max(0.2, pos.y + 0.22);
      pylonMesh.position.y = -(pos.y + 0.22) * 0.5 - 0.15;
      group.add(pylonMesh);

      const hitTarget = new THREE.Mesh(hitSphereGeo, hitInvisibleMat);
      hitTarget.userData = { nodeId: spec.id };
      group.add(hitTarget);
      hitTargets.push(hitTarget);

      // Curved Tube Conduit from Hub to Node
      const midCtrl = new THREE.Vector3(
        pos.x * 0.5,
        Math.max(hubOrigin.y, pos.y) + 0.55,
        pos.z * 0.5,
      );
      const curve = new THREE.QuadraticBezierCurve3(
        hubOrigin.clone(),
        midCtrl,
        new THREE.Vector3(pos.x, pos.y + 0.04, pos.z),
      );
      const conduitGeo = new THREE.TubeGeometry(curve, 28, 0.024, 8, false);
      const conduitMat = new THREE.MeshStandardMaterial({
        color: accentColor,
        emissive: accentColor,
        emissiveIntensity: 0.45,
        roughness: 0.3,
        metalness: 0.5,
        transparent: true,
        opacity: 0.68,
      });
      const conduitMesh = new THREE.Mesh(conduitGeo, conduitMat);
      satellitesGroup.add(conduitMesh);

      nodeBundles.push({
        id: spec.id,
        group,
        hitTarget,
        coreMesh,
        coreMat,
        haloMesh,
        haloMat,
        baseMat,
        pylonMesh,
        conduitMesh,
        conduitMat,
        angleRad: spec.angleRad,
        baseRadius: spec.baseRadius,
        elevation: spec.elevation,
        accentLight: spec.accentHexLight,
        accentDark: spec.accentHexDark,
        basePos: new THREE.Vector3(pos.x, pos.y, pos.z),
      });
    });

    // Traveling Signal Packets along the 5 conduits (InstancedMesh: 7 packets x 5 = 35)
    const PACKETS_PER_NODE = 7;
    const TOTAL_PACKETS = HERO_GROWTH_NODES.length * PACKETS_PER_NODE;
    const packetGeo = new THREE.SphereGeometry(0.055, 10, 10);
    const packetMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const packetInstanced = new THREE.InstancedMesh(packetGeo, packetMat, TOTAL_PACKETS);
    packetInstanced.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    scene.add(packetInstanced);

    // Subtle Floating Ambient Motes (InstancedMesh: 44 particles)
    const MOTE_COUNT = 44;
    const moteGeo = new THREE.OctahedronGeometry(0.032, 0);
    const moteMat = new THREE.MeshBasicMaterial({
      color: palette.accentHex,
      transparent: true,
      opacity: 0.45,
    });
    const moteInstanced = new THREE.InstancedMesh(moteGeo, moteMat, MOTE_COUNT);
    const moteSeeds = Array.from({ length: MOTE_COUNT }, (_, i) => ({
      angle: (i / MOTE_COUNT) * Math.PI * 2 + (i % 5) * 0.4,
      radius: 1.6 + ((i * 37) % 34) * 0.11,
      height: -0.05 + ((i * 19) % 24) * 0.11,
      speed: 0.08 + (i % 7) * 0.025,
    }));
    scene.add(moteInstanced);

    // Pre-allocated scratch helpers (zero GC inside animation loop)
    const _dummy = new THREE.Object3D();
    const _raycaster = new THREE.Raycaster();
    const _pointer = new THREE.Vector2();
    const _startVec = { x: hubOrigin.x, y: hubOrigin.y, z: hubOrigin.z };
    const _ctrlVec = { x: 0, y: 0, z: 0 };
    const _endVec = { x: 0, y: 0, z: 0 };
    const _tmpColor = new THREE.Color();

    let appliedTheme: 'light' | 'dark' | null = null;
    let currentSpread = 1.0;

    const applyThemeToScene = (nextTheme: 'light' | 'dark') => {
      if (appliedTheme === nextTheme) return;
      appliedTheme = nextTheme;
      const pal = getThreeThemePalette(nextTheme);
      (scene.background as THREE.Color).setHex(pal.backgroundHex);
      if (scene.fog instanceof THREE.FogExp2) {
        scene.fog.color.setHex(pal.fogHex);
      }
      floorMat.color.setHex(nextTheme === 'dark' ? 0x0c1629 : 0xe8f1f7);
      hemiLight.color.setHex(pal.ambientLightHex);
      hemiLight.groundColor.setHex(pal.backgroundHex);
      rimLight.color.setHex(pal.rimLightHex);
      corePointLight.color.setHex(pal.accentHex);
      hubMetalMat.color.setHex(pal.metalPrimaryHex);
      outerGyroMat.color.setHex(pal.metalTrimHex);
      hubTrimMat.color.setHex(pal.accentHex);
      hubTrimMat.emissive.setHex(pal.accentHex);
      orbitRingMat.color.setHex(pal.accentHex);
      orbitRingMat.emissive.setHex(pal.accentHex);
      crystalMat.color.setHex(pal.accentHex);
      crystalMat.emissive.setHex(pal.accentHex);
      nucleusMat.emissive.setHex(pal.accentHex);
      moteMat.color.setHex(pal.accentHex);

      nodeBundles.forEach((bundle) => {
        const hex = nextTheme === 'dark' ? bundle.accentDark : bundle.accentLight;
        bundle.baseMat.color.setHex(pal.metalPrimaryHex);
        bundle.coreMat.color.setHex(hex);
        bundle.coreMat.emissive.setHex(hex);
        bundle.haloMat.color.setHex(hex);
        bundle.haloMat.emissive.setHex(hex);
        bundle.conduitMat.color.setHex(hex);
        bundle.conduitMat.emissive.setHex(hex);
      });
    };

    // Raycast pointer interactions
    const updatePointer = (clientX: number, clientY: number) => {
      const rect = renderer.domElement.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      _pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      _pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1;
    };

    const handlePointerMove = (e: PointerEvent) => {
      updatePointer(e.clientX, e.clientY);
      _raycaster.setFromCamera(_pointer, camera);
      const hits = _raycaster.intersectObjects(hitTargets, false);
      const hitId = (hits[0]?.object?.userData?.nodeId as GrowthNodeId) || null;
      if (hitId !== hoveredIdRef.current) {
        setHoveredId(hitId);
        renderer.domElement.style.cursor = hitId ? 'pointer' : 'grab';
      }
    };

    const handlePointerDown = (e: PointerEvent) => {
      updatePointer(e.clientX, e.clientY);
      _raycaster.setFromCamera(_pointer, camera);
      const hits = _raycaster.intersectObjects(hitTargets, false);
      const hitId = hits[0]?.object?.userData?.nodeId as GrowthNodeId | undefined;
      if (hitId) {
        setActiveId(hitId);
      }
    };

    const handlePointerLeave = () => {
      if (hoveredIdRef.current !== null) {
        setHoveredId(null);
      }
      renderer.domElement.style.cursor = 'grab';
    };

    renderer.domElement.addEventListener('pointermove', handlePointerMove);
    renderer.domElement.addEventListener('pointerdown', handlePointerDown);
    renderer.domElement.addEventListener('pointerleave', handlePointerLeave);
    renderer.domElement.style.cursor = 'grab';

    // ResizeObserver for crisp layout adaptability
    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const w = Math.max(Math.round(entry.contentRect.width), 260);
      const h = Math.max(Math.round(entry.contentRect.height), 260);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
    });
    resizeObserver.observe(mount);

    // IntersectionObserver so off-screen WebGL uses zero CPU
    let isVisible = true;
    let scheduler = createAfterDrawScheduler(renderer.getContext(), isSoftwareGl);
    let disposed = false;
    let simTime = 0;
    let lastTimestamp = performance.now();

    const tick = () => {
      if (disposed || !isVisible) return;

      const now = performance.now();
      const dt = Math.min((now - lastTimestamp) / 1000, 0.05);
      lastTimestamp = now;

      if (!isPausedRef.current) {
        simTime += dt;
      }

      applyThemeToScene(themeRef.current);

      const targetSpread = isExpandedRef.current ? 1.26 : 1.0;
      const prevSpread = currentSpread;
      currentSpread = THREE.MathUtils.damp(currentSpread, targetSpread, 5.5, dt || 0.016);

      // Rotate central architectural gyroscopes & crystal
      outerGyroGroup.rotation.y = simTime * 0.42;
      outerGyroGroup.rotation.x = Math.sin(simTime * 0.55) * 0.22;
      innerGyroGroup.rotation.y = -simTime * 0.72;
      innerGyroGroup.rotation.z = simTime * 0.35;
      crystalMesh.rotation.y = simTime * 0.5;
      crystalMesh.position.y = 0.22 + Math.sin(simTime * 1.4) * 0.05;
      nucleusMesh.rotation.y = -simTime * 1.1;
      nucleusMesh.position.y = crystalMesh.position.y;
      orbitRingMesh.scale.setScalar(currentSpread);

      // Update satellites, tubes when spread changes, and traveling packets
      const rebuildTubes = Math.abs(currentSpread - prevSpread) > 0.002;
      let packetIdx = 0;

      for (let i = 0; i < nodeBundles.length; i++) {
        const b = nodeBundles[i];
        const isSelected = b.id === activeIdRef.current;
        const isHovered = b.id === hoveredIdRef.current;

        const targetPos = computeOrbitPosition(
          b.angleRad,
          b.baseRadius,
          b.elevation,
          currentSpread,
        );
        const bob = Math.sin(simTime * 1.6 + i * 1.15) * 0.06;
        b.group.position.set(targetPos.x, targetPos.y + bob, targetPos.z);

        const targetScale = isSelected ? 1.24 : isHovered ? 1.14 : 0.96;
        const nextScale = THREE.MathUtils.damp(b.group.scale.x, targetScale, 8, dt || 0.016);
        b.group.scale.setScalar(nextScale);

        b.coreMesh.rotation.y = simTime * (isSelected ? 1.6 : 0.65);
        b.haloMesh.rotation.z = simTime * (isSelected ? -1.4 : 0.55);

        b.coreMat.emissiveIntensity = isSelected ? 1.45 : isHovered ? 1.1 : 0.52;
        b.haloMat.emissiveIntensity = isSelected ? 0.95 : 0.32;
        b.conduitMat.opacity = isSelected ? 0.96 : 0.42;
        b.conduitMat.emissiveIntensity = isSelected ? 0.95 : 0.32;

        if (rebuildTubes) {
          const ctrl = new THREE.Vector3(
            targetPos.x * 0.5,
            Math.max(hubOrigin.y, targetPos.y) + 0.55,
            targetPos.z * 0.5,
          );
          const nextCurve = new THREE.QuadraticBezierCurve3(
            hubOrigin.clone(),
            ctrl,
            new THREE.Vector3(targetPos.x, targetPos.y + 0.04, targetPos.z),
          );
          b.conduitMesh.geometry.dispose();
          b.conduitMesh.geometry = new THREE.TubeGeometry(nextCurve, 28, 0.024, 8, false);
        }

        // Update traveling data packets along Bezier path
        _ctrlVec.x = targetPos.x * 0.5;
        _ctrlVec.y = Math.max(hubOrigin.y, targetPos.y) + 0.55;
        _ctrlVec.z = targetPos.z * 0.5;
        _endVec.x = targetPos.x;
        _endVec.y = targetPos.y + bob + 0.04;
        _endVec.z = targetPos.z;

        const accentHex =
          themeRef.current === 'dark' ? b.accentDark : b.accentLight;
        _tmpColor.setHex(isSelected ? 0xffffff : accentHex);

        for (let p = 0; p < PACKETS_PER_NODE; p++) {
          const speed = isSelected ? 0.46 : 0.24;
          const phase = (simTime * speed + p / PACKETS_PER_NODE + i * 0.17) % 1;
          const pt = sampleQuadraticBezierPoint(_startVec, _ctrlVec, _endVec, phase);
          _dummy.position.set(pt.x, pt.y, pt.z);
          const packetScale = isSelected ? 1.25 : 0.72;
          _dummy.scale.setScalar(packetScale);
          _dummy.updateMatrix();
          packetInstanced.setMatrixAt(packetIdx, _dummy.matrix);
          packetInstanced.setColorAt(packetIdx, _tmpColor);
          packetIdx++;
        }
      }
      packetInstanced.instanceMatrix.needsUpdate = true;
      if (packetInstanced.instanceColor) {
        packetInstanced.instanceColor.needsUpdate = true;
      }

      // Gentle ambient motes
      for (let m = 0; m < MOTE_COUNT; m++) {
        const seed = moteSeeds[m];
        const a = seed.angle + simTime * seed.speed;
        _dummy.position.set(
          Math.cos(a) * seed.radius,
          seed.height + Math.sin(simTime * 0.8 + m) * 0.09,
          Math.sin(a) * seed.radius,
        );
        _dummy.rotation.set(simTime * 0.5, a, 0);
        _dummy.scale.setScalar(1);
        _dummy.updateMatrix();
        moteInstanced.setMatrixAt(m, _dummy.matrix);
      }
      moteInstanced.instanceMatrix.needsUpdate = true;

      // Gentle idle orbital drift when unpaused & pointer not dragging
      if (!isPausedRef.current) {
        satellitesGroup.rotation.y = Math.sin(simTime * 0.18) * 0.12;
      }

      controls.update();
      renderer.render(scene, camera);
      scheduler.scheduleNext(tick);
    };

    const intersectionObserver = new IntersectionObserver(
      (entries) => {
        const visible = Boolean(entries[0]?.isIntersecting);
        if (visible && !isVisible) {
          isVisible = true;
          lastTimestamp = performance.now();
          scheduler.cancel();
          scheduler = createAfterDrawScheduler(renderer.getContext(), isSoftwareGl);
          tick();
        } else if (!visible && isVisible) {
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
        lastTimestamp = performance.now();
        tick();
      }
    };
    renderer.domElement.addEventListener('webglcontextlost', handleContextLost);
    renderer.domElement.addEventListener('webglcontextrestored', handleContextRestored);

    // Kick off initial render
    tick();

    return () => {
      disposed = true;
      scheduler.cancel();
      intersectionObserver.disconnect();
      resizeObserver.disconnect();
      renderer.domElement.removeEventListener('pointermove', handlePointerMove);
      renderer.domElement.removeEventListener('pointerdown', handlePointerDown);
      renderer.domElement.removeEventListener('pointerleave', handlePointerLeave);
      renderer.domElement.removeEventListener('webglcontextlost', handleContextLost);
      renderer.domElement.removeEventListener('webglcontextrestored', handleContextRestored);
      controls.dispose();
      pmrem.dispose();
      disposeObject3D(scene);
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, []);

  const activeNode =
    HERO_GROWTH_NODES.find((n) => n.id === activeId) || HERO_GROWTH_NODES[0];

  return (
    <div
      ref={containerRef}
      className="relative w-full rounded-3xl border border-[#DCE7EE] dark:border-[#304258] bg-[#F1F7FB] dark:bg-[#0B1426] shadow-[var(--dp-shadow)] overflow-hidden"
    >
      {/* Slim Top Bar with Unobtrusive 3D Viewport Controls */}
      <div className="relative z-20 flex items-center justify-between gap-3 px-4 sm:px-5 py-2.5 border-b border-[#DCE7EE] dark:border-[#24364D] bg-white/95 dark:bg-[#0D1829]/95 text-xs">
        <span className="font-semibold tracking-wide text-[#102338] dark:text-[#F5FAFF] whitespace-nowrap">
          Connected Growth Core · 3D
        </span>

        <div className="flex items-center gap-1.5 shrink-0">
          <span className="font-mono-tabular text-[#46596A] dark:text-[#B8C8D8] hidden md:inline mr-2">
            Drag to orbit · Click node
          </span>
          <button
            type="button"
            onClick={() => setIsExpanded((v) => !v)}
            title={isExpanded ? 'Compact orbital radius' : 'Expand orbital radius'}
            aria-label={isExpanded ? 'Compact orbital radius' : 'Expand orbital radius'}
            aria-pressed={isExpanded}
            className="p-1.5 rounded-lg border border-[#DCE7EE] dark:border-[#2D4059] bg-[#F6F9FC] dark:bg-[#152337] text-[#102338] dark:text-[#F5FAFF] hover:border-[#087D94] dark:hover:border-[#22D3D5] transition-colors cursor-pointer"
          >
            {isExpanded ? (
              <Minimize2 className="w-3.5 h-3.5" aria-hidden="true" />
            ) : (
              <Expand className="w-3.5 h-3.5" aria-hidden="true" />
            )}
          </button>
          <button
            type="button"
            onClick={() => setIsPaused((v) => !v)}
            title={isPaused ? 'Resume 3D motion' : 'Pause 3D motion'}
            aria-label={isPaused ? 'Resume 3D motion' : 'Pause 3D motion'}
            aria-pressed={isPaused}
            className="p-1.5 rounded-lg border border-[#DCE7EE] dark:border-[#2D4059] bg-[#F6F9FC] dark:bg-[#152337] text-[#102338] dark:text-[#F5FAFF] hover:border-[#087D94] dark:hover:border-[#22D3D5] transition-colors cursor-pointer"
          >
            {isPaused ? (
              <Play className="w-3.5 h-3.5" aria-hidden="true" />
            ) : (
              <Pause className="w-3.5 h-3.5" aria-hidden="true" />
            )}
          </button>
          <button
            type="button"
            onClick={() => resetViewRef.current?.()}
            title="Reset 3D camera"
            aria-label="Reset 3D camera"
            className="p-1.5 rounded-lg border border-[#DCE7EE] dark:border-[#2D4059] bg-[#F6F9FC] dark:bg-[#152337] text-[#102338] dark:text-[#F5FAFF] hover:border-[#087D94] dark:hover:border-[#22D3D5] transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Pure Unobstructed Interactive 3D Stage */}
      <div className="relative h-[310px] sm:h-[420px] lg:h-[460px] w-full">
        {webglUnavailable ? (
          <div className="h-full w-full flex flex-col items-center justify-center p-6 text-center space-y-3">
            <img
              src="/assets/aistudio/Glossy_Navy_DP_Logo_with_Teal_Swoosh_c7bac0b5.png"
              alt="Dent Propel Core"
              className="w-12 h-12 object-contain rounded-xl bg-white p-1"
            />
            <div className="font-display text-base font-bold text-[#102338] dark:text-[#F5FAFF]">
              {activeNode.cardTitle}
            </div>
            <p className="text-xs text-[#46596A] dark:text-[#B8C8D8] max-w-sm">
              {activeNode.sampleDetail}
            </p>
          </div>
        ) : (
          <div
            ref={mountRef}
            className="w-full h-full"
            aria-label="Interactive 3D Dent Propel Growth Network showing 5 connected practice growth subsystems"
          />
        )}
      </div>
    </div>
  );
}
