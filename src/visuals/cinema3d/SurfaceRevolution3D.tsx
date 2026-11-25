import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Box, Layers, Pause, Play, RotateCcw } from 'lucide-react';
import { MathTex } from '../../components/MathTex';
import { WebGLErrorBoundary } from '../../components/WebGLErrorBoundary';
import { useReducedMotion } from '../../hooks/useReducedMotion';

export interface SurfaceRevolution3DProps {
  compact?: boolean;
  heightClass?: string;
}

type CurvePresetId = 'bowl' | 'vase' | 'chalice' | 'cone';
type RenderStyle = 'crystal' | 'wireframe';

interface CurvePreset {
  id: CurvePresetId;
  label: string;
  formulaTex: string;
  integralTex: string;
  a: number;
  b: number;
  domainText: string;
  exactVolume: number;
  exactSymbolic: string;
  worldScale: number;
  accent: string;
  fn: (x: number) => number;
  intuition: string;
}

const CURVE_PRESETS: Record<CurvePresetId, CurvePreset> = {
  bowl: {
    id: 'bowl',
    label: 'Parabolic Bowl',
    formulaTex: 'y = \\sqrt{x}',
    integralTex: 'V = \\pi \\int_0^4 (\\sqrt{x})^2\\,dx = 8\\pi',
    a: 0,
    b: 4,
    domainText: '[0, 4]',
    exactVolume: 8 * Math.PI,
    exactSymbolic: '8π',
    worldScale: 0.86,
    accent: '#F4C46C',
    fn: (x) => Math.sqrt(Math.max(0, x)),
    intuition:
      'Rotating a square-root curve around the x-axis forms a smooth parabolic reflector bowl whose cross-section area grows linearly with x.',
  },
  vase: {
    id: 'vase',
    label: 'Horn Vase',
    formulaTex: 'y = 0.35x^2 + 0.3',
    integralTex: 'V = \\pi \\int_0^2 (0.35x^2 + 0.3)^2\\,dx = 1.524\\pi',
    a: 0,
    b: 2,
    domainText: '[0, 2]',
    exactVolume: 1.524 * Math.PI,
    exactSymbolic: '1.524π',
    worldScale: 1.08,
    accent: '#46D6E8',
    fn: (x) => 0.35 * x * x + 0.3,
    intuition:
      'Starts at a narrow neck (r = 0.30) and flares quadratically into a wide acoustic horn bell.',
  },
  chalice: {
    id: 'chalice',
    label: 'Harmonic Chalice',
    formulaTex: 'y = 1 + 0.45\\sin(x)',
    integralTex: 'V = \\pi \\int_0^{2\\pi} (1 + 0.45\\sin x)^2\\,dx = 2.2025\\pi^2',
    a: 0,
    b: Math.PI * 2,
    domainText: '[0, 2π]',
    exactVolume: 2.2025 * Math.PI * Math.PI,
    exactSymbolic: '2.2025π²',
    worldScale: 0.66,
    accent: '#45E6A6',
    fn: (x) => 1 + 0.45 * Math.sin(x),
    intuition:
      'A gentle sine wave creates a waist and swell when spun 360° — every slice is a circle of radius 1 + 0.45 sin(x).',
  },
  cone: {
    id: 'cone',
    label: 'Laser Cone',
    formulaTex: 'y = 0.5x',
    integralTex: 'V = \\pi \\int_0^4 (0.5x)^2\\,dx = \\frac{16}{3}\\pi',
    a: 0,
    b: 4,
    domainText: '[0, 4]',
    exactVolume: (16 / 3) * Math.PI,
    exactSymbolic: '16π/3',
    worldScale: 0.86,
    accent: '#FF8563',
    fn: (x) => 0.5 * x,
    intuition:
      'Spinning a straight diagonal line builds a classic cone — proving V = π∫(0.5x)² dx matches geometry’s ⅓πr²h!',
  },
};

const CURVE_ORDER: CurvePresetId[] = ['bowl', 'vase', 'chalice', 'cone'];

function buildCurtainGeometry(
  samples: { wx: number; r: number }[],
  theta: number
): THREE.BufferGeometry {
  const count = samples.length;
  const positions = new Float32Array((count - 1) * 6 * 3);
  const cosT = Math.cos(theta);
  const sinT = Math.sin(theta);

  let ptr = 0;
  for (let i = 0; i < count - 1; i++) {
    const p0 = samples[i];
    const p1 = samples[i + 1];

    const y0 = p0.r * cosT;
    const z0 = p0.r * sinT;
    const y1 = p1.r * cosT;
    const z1 = p1.r * sinT;

    // Triangle 1: axis0 -> axis1 -> curve1
    positions[ptr++] = p0.wx; positions[ptr++] = 0; positions[ptr++] = 0;
    positions[ptr++] = p1.wx; positions[ptr++] = 0; positions[ptr++] = 0;
    positions[ptr++] = p1.wx; positions[ptr++] = y1; positions[ptr++] = z1;

    // Triangle 2: axis0 -> curve1 -> curve0
    positions[ptr++] = p0.wx; positions[ptr++] = 0; positions[ptr++] = 0;
    positions[ptr++] = p1.wx; positions[ptr++] = y1; positions[ptr++] = z1;
    positions[ptr++] = p0.wx; positions[ptr++] = y0; positions[ptr++] = z0;
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.computeVertexNormals();
  return geo;
}

function disposeDynamicGroupGeometries(group: THREE.Group) {
  const uniqueGeos = new Set<THREE.BufferGeometry>();
  while (group.children.length > 0) {
    const child = group.children[0];
    group.remove(child);
    child.traverse((obj) => {
      const mesh = obj as THREE.Mesh & { geometry?: THREE.BufferGeometry };
      if (mesh.geometry) uniqueGeos.add(mesh.geometry);
    });
  }
  uniqueGeos.forEach((g) => g.dispose());
}

export function SurfaceRevolution3D({
  compact = false,
  heightClass,
}: SurfaceRevolution3DProps = {}): JSX.Element {
  const reducedMotion = useReducedMotion();
  const [curveId, setCurveId] = useState<CurvePresetId>('bowl');
  const [sweepDeg, setSweepDeg] = useState<number>(270);
  const [sliceNorm, setSliceNorm] = useState<number>(0.62);
  const [renderStyle, setRenderStyle] = useState<RenderStyle>('crystal');
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [autoSlice, setAutoSlice] = useState<boolean>(true);
  const [autoSpin, setAutoSpin] = useState<boolean>(true);
  const [nearViewport, setNearViewport] = useState<boolean>(false);
  const [webglError, setWebglError] = useState<string | null>(null);

  const hostRef = useRef<HTMLDivElement | null>(null);
  const mountRef = useRef<HTMLDivElement | null>(null);

  const curveIdRef = useRef<CurvePresetId>(curveId);
  curveIdRef.current = curveId;

  const sweepDegRef = useRef<number>(sweepDeg);
  const sliceNormRef = useRef<number>(sliceNorm);

  const isPlayingRef = useRef<boolean>(isPlaying);
  isPlayingRef.current = isPlaying;

  const autoSliceRef = useRef<boolean>(autoSlice);
  autoSliceRef.current = autoSlice;

  const autoSpinRef = useRef<boolean>(autoSpin);
  autoSpinRef.current = autoSpin;

  const renderStyleRef = useRef<RenderStyle>(renderStyle);
  renderStyleRef.current = renderStyle;

  const rebuildRef = useRef<((id: CurvePresetId, deg: number, sliceT: number) => void) | null>(
    null
  );
  const updateStyleRef = useRef<((style: RenderStyle) => void) | null>(null);

  const sweepPauseTimerRef = useRef<number>(0);

  const preset = CURVE_PRESETS[curveId];

  const telemetry = useMemo(() => {
    const frac = sweepDeg / 360;
    const sweptVol = preset.exactVolume * frac;
    const xSlice = preset.a + sliceNorm * (preset.b - preset.a);
    const radiusAtSlice = preset.fn(xSlice);
    const diskArea = Math.PI * radiusAtSlice * radiusAtSlice;
    const sweptSectorArea = diskArea * frac;
    return {
      frac,
      sweptVol,
      xSlice,
      radiusAtSlice,
      diskArea,
      sweptSectorArea,
    };
  }, [preset, sweepDeg, sliceNorm]);

  // IntersectionObserver gates WebGL mounting/animation to near-viewport
  useEffect(() => {
    const el = hostRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setNearViewport(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        setNearViewport(entries.some((e) => e.isIntersecting));
      },
      { rootMargin: '200px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Main Three.js WebGL lifecycle
  useEffect(() => {
    if (!nearViewport) return;
    const container = mountRef.current;
    if (!container) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        powerPreference: 'high-performance',
      });
    } catch (err) {
      setWebglError(
        err instanceof Error ? err.message : 'WebGL context could not be initialized.'
      );
      return;
    }

    setWebglError(null);
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    renderer.setPixelRatio(dpr);
    renderer.setClearColor(0x060609, 1);

    const rect = container.getBoundingClientRect();
    const initW = Math.max(240, Math.floor(rect.width));
    const initH = Math.max(220, Math.floor(rect.height));
    renderer.setSize(initW, initH);
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x060609);

    const camera = new THREE.PerspectiveCamera(38, initW / initH, 0.1, 80);
    camera.position.set(3.45, 2.55, 4.55);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.065;
    controls.rotateSpeed = 0.78;
    controls.minDistance = 2.6;
    controls.maxDistance = 12;
    controls.target.set(0, 0, 0);

    // Lightweight procedural studio environment reflection
    const pmrem = new THREE.PMREMGenerator(renderer);
    const envScene = new THREE.Scene();
    envScene.background = new THREE.Color(0x060609);
    const envGeo = new THREE.PlaneGeometry(8, 8);
    const envGold = new THREE.MeshBasicMaterial({ color: 0xffe29e, side: THREE.DoubleSide });
    const envCyan = new THREE.MeshBasicMaterial({ color: 0x46d6e8, side: THREE.DoubleSide });
    const envP1 = new THREE.Mesh(envGeo, envGold);
    envP1.position.set(5, 6, 4);
    envP1.lookAt(0, 0, 0);
    const envP2 = new THREE.Mesh(envGeo, envCyan);
    envP2.position.set(-5, 3, -4);
    envP2.lookAt(0, 0, 0);
    envScene.add(envP1, envP2);
    const envRT = pmrem.fromScene(envScene);
    scene.environment = envRT.texture;

    const ambient = new THREE.AmbientLight(0xf7f4ec, 0.45);
    const keyLight = new THREE.DirectionalLight(0xffe29e, 1.45);
    keyLight.position.set(5, 7, 5);
    const cyanRim = new THREE.DirectionalLight(0x46d6e8, 0.95);
    cyanRim.position.set(-6, 3, -4);
    const jadeRim = new THREE.DirectionalLight(0x45e6a6, 0.55);
    jadeRim.position.set(2, -4, -3);
    scene.add(ambient, keyLight, cyanRim, jadeRim);

    // Observatory floor plane & concentric reference rings
    const floorY = -2.18;
    const floorGeo = new THREE.CircleGeometry(3.3, 64);
    floorGeo.rotateX(-Math.PI / 2);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x0a0b10,
      roughness: 0.88,
      metalness: 0.2,
    });
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.position.y = floorY - 0.01;
    scene.add(floorMesh);

    const ringGeos: THREE.BufferGeometry[] = [];
    const ringMats: THREE.Material[] = [];
    [1.8, 2.4, 3.0].forEach((r, idx) => {
      const rg = new THREE.RingGeometry(r - 0.008, r + 0.008, 96);
      rg.rotateX(-Math.PI / 2);
      const rm = new THREE.MeshBasicMaterial({
        color: idx === 1 ? 0x46d6e8 : 0xf4c46c,
        transparent: true,
        opacity: idx === 0 ? 0.3 : 0.16,
        side: THREE.DoubleSide,
      });
      ringGeos.push(rg);
      ringMats.push(rm);
      const ring = new THREE.Mesh(rg, rm);
      ring.position.y = floorY;
      scene.add(ring);
    });

    // Axis of revolution (horizontal X-axis)
    const axisGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-2.55, 0, 0),
      new THREE.Vector3(2.55, 0, 0),
    ]);
    const axisMat = new THREE.LineDashedMaterial({
      color: 0xf4c46c,
      dashSize: 0.12,
      gapSize: 0.08,
      transparent: true,
      opacity: 0.62,
    });
    const axisLine = new THREE.Line(axisGeo, axisMat);
    axisLine.computeLineDistances();
    scene.add(axisLine);

    const axisArrowGeo = new THREE.ConeGeometry(0.055, 0.15, 14);
    axisArrowGeo.rotateZ(-Math.PI / 2);
    const axisArrowMat = new THREE.MeshBasicMaterial({ color: 0xf4c46c, toneMapped: false });
    const axisArrow = new THREE.Mesh(axisArrowGeo, axisArrowMat);
    axisArrow.position.set(2.6, 0, 0);
    scene.add(axisArrow);

    // Persistent Materials (reused across dynamic geometry rebuilds -> zero shader recompile!)
    const solidCrystalMat = new THREE.MeshPhysicalMaterial({
      color: 0xf4c46c,
      emissive: 0x3b2608,
      emissiveIntensity: 0.32,
      roughness: 0.14,
      metalness: 0.25,
      clearcoat: 1.0,
      clearcoatRoughness: 0.08,
      transparent: true,
      opacity: 0.42,
      side: THREE.DoubleSide,
      depthWrite: false,
    });

    const wireOverlayMat = new THREE.MeshBasicMaterial({
      color: 0x46d6e8,
      wireframe: true,
      transparent: true,
      opacity: 0.18,
    });

    const curtainGoldMat = new THREE.MeshBasicMaterial({
      color: 0xf4c46c,
      transparent: true,
      opacity: 0.16,
      side: THREE.DoubleSide,
      depthWrite: false,
    });

    const curtainCyanMat = new THREE.MeshBasicMaterial({
      color: 0x46d6e8,
      transparent: true,
      opacity: 0.18,
      side: THREE.DoubleSide,
      depthWrite: false,
    });

    const curveStartMat = new THREE.MeshBasicMaterial({
      color: 0xffe29e,
      toneMapped: false,
    });

    const curveLeadMat = new THREE.MeshBasicMaterial({
      color: 0x46d6e8,
      toneMapped: false,
    });

    const diskBodyMat = new THREE.MeshPhysicalMaterial({
      color: 0x45e6a6,
      emissive: 0x115e40,
      emissiveIntensity: 0.5,
      roughness: 0.18,
      metalness: 0.2,
      clearcoat: 0.85,
      transparent: true,
      opacity: 0.56,
      side: THREE.DoubleSide,
      depthWrite: false,
    });

    const diskRimMat = new THREE.MeshBasicMaterial({
      color: 0xffe29e,
      toneMapped: false,
    });

    const targetCircleMat = new THREE.LineDashedMaterial({
      color: 0x46d6e8,
      dashSize: 0.09,
      gapSize: 0.06,
      transparent: true,
      opacity: 0.38,
    });

    const sliceSpokeMat = new THREE.LineBasicMaterial({
      color: 0x45e6a6,
      transparent: true,
      opacity: 0.88,
      toneMapped: false,
    });

    const applyRenderStyle = (style: RenderStyle) => {
      if (style === 'crystal') {
        solidCrystalMat.opacity = 0.42;
        wireOverlayMat.color.setHex(0x46d6e8);
        wireOverlayMat.opacity = 0.18;
      } else {
        solidCrystalMat.opacity = 0.08;
        wireOverlayMat.color.setHex(0xffe29e);
        wireOverlayMat.opacity = 0.68;
      }
    };
    updateStyleRef.current = applyRenderStyle;
    applyRenderStyle(renderStyleRef.current);

    const dynamicGroup = new THREE.Group();
    scene.add(dynamicGroup);

    const rebuildDynamicSolid = (id: CurvePresetId, deg: number, sliceT: number) => {
      disposeDynamicGroupGeometries(dynamicGroup);

      const p = CURVE_PRESETS[id];
      const clampedDeg = Math.min(360, Math.max(15, deg));
      const sweepRad = (clampedDeg * Math.PI) / 180;
      const xMid = (p.a + p.b) * 0.5;

      const axialSteps = 44;
      const lathePoints: THREE.Vector2[] = [];
      const worldSamples: { wx: number; r: number }[] = [];
      const startCurvePts: THREE.Vector3[] = [];
      const leadCurvePts: THREE.Vector3[] = [];

      const cosEnd = Math.cos(sweepRad);
      const sinEnd = Math.sin(sweepRad);

      for (let i = 0; i <= axialSteps; i++) {
        const u = i / axialSteps;
        const xMath = p.a + u * (p.b - p.a);
        const yMath = Math.max(0.004, p.fn(xMath));
        const wx = (xMath - xMid) * p.worldScale;
        const r = yMath * p.worldScale;

        lathePoints.push(new THREE.Vector2(r, wx));
        worldSamples.push({ wx, r });
        startCurvePts.push(new THREE.Vector3(wx, r, 0));
        leadCurvePts.push(new THREE.Vector3(wx, r * cosEnd, r * sinEnd));
      }

      // 1. Dynamic Lathe Solid + Wireframe Overlay sharing one LatheGeometry
      const radialSegs = Math.max(8, Math.round((clampedDeg / 360) * 52));
      const latheGeo = new THREE.LatheGeometry(
        lathePoints,
        radialSegs,
        -Math.PI / 2,
        sweepRad
      );

      const solidMesh = new THREE.Mesh(latheGeo, solidCrystalMat);
      solidMesh.rotation.z = -Math.PI / 2;
      solidMesh.renderOrder = 2;

      const wireMesh = new THREE.Mesh(latheGeo, wireOverlayMat);
      wireMesh.rotation.z = -Math.PI / 2;
      wireMesh.renderOrder = 3;

      dynamicGroup.add(solidMesh, wireMesh);

      // 2. Generator Curves (0° Gold & Leading Edge Cyan)
      const startCurve = new THREE.CatmullRomCurve3(startCurvePts);
      const startTubeGeo = new THREE.TubeGeometry(startCurve, 40, 0.028, 8, false);
      const startTube = new THREE.Mesh(startTubeGeo, curveStartMat);
      startTube.renderOrder = 6;
      dynamicGroup.add(startTube);

      if (clampedDeg < 358.5) {
        const leadCurve = new THREE.CatmullRomCurve3(leadCurvePts);
        const leadTubeGeo = new THREE.TubeGeometry(leadCurve, 40, 0.026, 8, false);
        const leadTube = new THREE.Mesh(leadTubeGeo, curveLeadMat);
        leadTube.renderOrder = 6;
        dynamicGroup.add(leadTube);

        // Translucent 2D swept area curtains at 0° and sweepRad
        const curtain0Geo = buildCurtainGeometry(worldSamples, 0);
        const curtainEndGeo = buildCurtainGeometry(worldSamples, sweepRad);
        const c0Mesh = new THREE.Mesh(curtain0Geo, curtainGoldMat);
        const cEndMesh = new THREE.Mesh(curtainEndGeo, curtainCyanMat);
        c0Mesh.renderOrder = 1;
        cEndMesh.renderOrder = 1;
        dynamicGroup.add(c0Mesh, cEndMesh);
      }

      // 3. Highlighted Animated Circular Disk Cross-Section Slice
      const xSlice = p.a + sliceT * (p.b - p.a);
      const wxSlice = (xSlice - xMid) * p.worldScale;
      const rSlice = Math.max(0.05, p.fn(xSlice) * p.worldScale);

      const diskGeo = new THREE.CylinderGeometry(
        rSlice,
        rSlice,
        0.085,
        Math.max(8, radialSegs),
        1,
        false,
        -Math.PI / 2,
        sweepRad
      );
      const diskMesh = new THREE.Mesh(diskGeo, diskBodyMat);
      diskMesh.rotation.z = -Math.PI / 2;
      diskMesh.position.set(wxSlice, 0, 0);
      diskMesh.renderOrder = 4;
      dynamicGroup.add(diskMesh);

      // Swept Rim Arc on Disk Slice
      const arcSegs = Math.max(8, Math.round((clampedDeg / 360) * 48));
      const arcPts: THREE.Vector3[] = [];
      for (let k = 0; k <= arcSegs; k++) {
        const th = (k / arcSegs) * sweepRad;
        arcPts.push(new THREE.Vector3(wxSlice, rSlice * Math.cos(th), rSlice * Math.sin(th)));
      }
      const arcCurve = new THREE.CatmullRomCurve3(arcPts);
      const diskRimGeo = new THREE.TubeGeometry(arcCurve, arcSegs, 0.02, 8, false);
      const diskRimMesh = new THREE.Mesh(diskRimGeo, diskRimMat);
      diskRimMesh.renderOrder = 7;
      dynamicGroup.add(diskRimMesh);

      // Radial spokes on disk slice (0° and leading edge)
      const spokePts: THREE.Vector3[] = [
        new THREE.Vector3(wxSlice, 0, 0),
        new THREE.Vector3(wxSlice, rSlice, 0),
      ];
      if (clampedDeg < 358.5) {
        spokePts.push(
          new THREE.Vector3(wxSlice, 0, 0),
          new THREE.Vector3(wxSlice, rSlice * cosEnd, rSlice * sinEnd)
        );
      }
      const spokeGeo = new THREE.BufferGeometry().setFromPoints(spokePts);
      dynamicGroup.add(new THREE.LineSegments(spokeGeo, sliceSpokeMat));

      // Full 360° dashed reference orbit ring at slice plane
      if (clampedDeg < 358.5) {
        const fullRingPts: THREE.Vector3[] = [];
        for (let k = 0; k <= 64; k++) {
          const th = (k / 64) * Math.PI * 2;
          fullRingPts.push(
            new THREE.Vector3(wxSlice, rSlice * Math.cos(th), rSlice * Math.sin(th))
          );
        }
        const fullRingGeo = new THREE.BufferGeometry().setFromPoints(fullRingPts);
        const fullRingLine = new THREE.Line(fullRingGeo, targetCircleMat);
        fullRingLine.computeLineDistances();
        dynamicGroup.add(fullRingLine);
      }
    };

    rebuildRef.current = rebuildDynamicSolid;
    rebuildDynamicSolid(curveIdRef.current, sweepDegRef.current, sliceNormRef.current);

    const ro = new ResizeObserver(() => {
      const r = container.getBoundingClientRect();
      const w = Math.max(240, Math.floor(r.width));
      const h = Math.max(220, Math.floor(r.height));
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    });
    ro.observe(container);

    let rafId = 0;
    let lastNow = performance.now();
    let elapsed = 0;
    let uiSyncAccum = 0;

    const tick = (now: number) => {
      const dt = Math.min(0.05, Math.max(0.001, (now - lastNow) / 1000));
      lastNow = now;
      elapsed += dt;

      if (!document.hidden) {
        let dirty = false;

        if (isPlayingRef.current && !reducedMotion) {
          if (sweepPauseTimerRef.current > 0) {
            sweepPauseTimerRef.current -= dt;
            if (sweepPauseTimerRef.current <= 0) {
              sweepDegRef.current = 18;
              dirty = true;
            }
          } else {
            const nextSweep = sweepDegRef.current + dt * 62;
            if (nextSweep >= 360) {
              sweepDegRef.current = 360;
              sweepPauseTimerRef.current = 1.35;
            } else {
              sweepDegRef.current = nextSweep;
            }
            dirty = true;
          }
        }

        if (autoSliceRef.current && isPlayingRef.current && !reducedMotion) {
          sliceNormRef.current = 0.56 + 0.34 * Math.sin(elapsed * 0.85);
          dirty = true;
        }

        if (dirty) {
          rebuildDynamicSolid(curveIdRef.current, sweepDegRef.current, sliceNormRef.current);
          uiSyncAccum += dt;
          if (uiSyncAccum >= 0.055) {
            uiSyncAccum = 0;
            setSweepDeg(Math.round(sweepDegRef.current));
            if (autoSliceRef.current) {
              setSliceNorm(Number(sliceNormRef.current.toFixed(2)));
            }
          }
        }

        controls.autoRotate = autoSpinRef.current && !reducedMotion;
        controls.autoRotateSpeed = 0.45;
        controls.update();
        renderer.render(scene, camera);
      }

      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
      rebuildRef.current = null;
      updateStyleRef.current = null;
      controls.dispose();

      disposeDynamicGroupGeometries(dynamicGroup);

      [
        envGeo,
        floorGeo,
        axisGeo,
        axisArrowGeo,
        ...ringGeos,
      ].forEach((g) => g.dispose());

      [
        envGold,
        envCyan,
        floorMat,
        axisMat,
        axisArrowMat,
        solidCrystalMat,
        wireOverlayMat,
        curtainGoldMat,
        curtainCyanMat,
        curveStartMat,
        curveLeadMat,
        diskBodyMat,
        diskRimMat,
        targetCircleMat,
        sliceSpokeMat,
        ...ringMats,
      ].forEach((m) => m.dispose());

      envRT.dispose();
      pmrem.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [nearViewport, reducedMotion]);

  // Rebuild when curve preset or WebGL mount changes without snapping back live sweep frames
  useEffect(() => {
    rebuildRef.current?.(curveId, sweepDegRef.current, sliceNormRef.current);
  }, [curveId, nearViewport]);

  useEffect(() => {
    updateStyleRef.current?.(renderStyle);
  }, [renderStyle]);

  const handleSelectCurve = (id: CurvePresetId) => {
    setCurveId(id);
    sweepPauseTimerRef.current = 0;
    sweepDegRef.current = 24;
    setSweepDeg(24);
    setIsPlaying(true);
    setAutoSlice(true);
    rebuildRef.current?.(id, 24, sliceNormRef.current);
  };

  const handleManualSweep = (val: number) => {
    setIsPlaying(false);
    sweepPauseTimerRef.current = 0;
    sweepDegRef.current = val;
    setSweepDeg(val);
    rebuildRef.current?.(curveIdRef.current, val, sliceNormRef.current);
  };

  const handleManualSlice = (val: number) => {
    setAutoSlice(false);
    sliceNormRef.current = val;
    setSliceNorm(val);
    rebuildRef.current?.(curveIdRef.current, sweepDegRef.current, val);
  };

  const viewportHeight =
    heightClass ?? (compact ? 'h-[310px] sm:h-[350px]' : 'h-[370px] sm:h-[440px]');

  return (
    <div
      ref={hostRef}
      className="instrument-frame fiducial-frame overflow-hidden bg-[#060609] min-w-0 max-w-full"
    >
      {/* Top Instrument Bar */}
      <div className="px-4 py-2.5 border-b hairline-rule bg-[#0B0C12]/95 flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className="w-2 h-2 rounded-full shrink-0"
            style={{
              backgroundColor: preset.accent,
              boxShadow: `0 0 10px ${preset.accent}`,
            }}
          />
          <span className="font-mono-data text-[10px] uppercase tracking-[0.16em] text-[#F4C46C] truncate">
            3D Surface of Revolution Lab
          </span>
          <span className="hidden sm:inline font-mono-data text-[10px] px-2 py-0.5 rounded bg-[#11131C] border border-[rgba(244,196,108,0.18)] text-[#A8B2C6]">
            Sweep {sweepDeg}° / 360°
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() =>
              setRenderStyle((s) => (s === 'crystal' ? 'wireframe' : 'crystal'))
            }
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-mono-data border transition-colors ${
              renderStyle === 'crystal'
                ? 'border-[#46D6E8]/55 text-[#46D6E8] bg-[#46D6E8]/12'
                : 'border-[#F4C46C]/55 text-[#FFE29E] bg-[#F4C46C]/15'
            }`}
          >
            {renderStyle === 'crystal' ? (
              <Box className="w-3 h-3" />
            ) : (
              <Layers className="w-3 h-3" />
            )}
            <span>{renderStyle === 'crystal' ? 'Crystal' : 'Wireframe'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (!isPlaying && sweepDeg >= 360) {
                sweepDegRef.current = 18;
                setSweepDeg(18);
                rebuildRef.current?.(curveIdRef.current, 18, sliceNormRef.current);
              }
              sweepPauseTimerRef.current = 0;
              setIsPlaying((p) => !p);
            }}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-mono-data border transition-colors ${
              isPlaying
                ? 'border-[#F4C46C]/55 text-[#FFE29E] bg-[#F4C46C]/15'
                : 'border-[rgba(244,196,108,0.18)] bg-[#11131C] text-[#A8B2C6]'
            }`}
          >
            {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
            <span>{isPlaying ? 'Pause' : 'Play'}</span>
          </button>

          <button
            type="button"
            onClick={() => setAutoSpin((s) => !s)}
            className={`hidden sm:inline-flex px-2.5 py-1 rounded text-[11px] font-mono-data border transition-colors ${
              autoSpin
                ? 'border-[#45E6A6]/50 text-[#45E6A6] bg-[#45E6A6]/12'
                : 'border-[rgba(244,196,108,0.18)] bg-[#11131C] text-[#A8B2C6]'
            }`}
          >
            {autoSpin ? 'Auto-Orbit' : 'Manual Orbit'}
          </button>

          <button
            type="button"
            onClick={() => {
              setCurveId('bowl');
              sweepPauseTimerRef.current = 0;
              sweepDegRef.current = 270;
              sliceNormRef.current = 0.62;
              setSweepDeg(270);
              setSliceNorm(0.62);
              setRenderStyle('crystal');
              setIsPlaying(true);
              setAutoSlice(true);
              setAutoSpin(true);
              rebuildRef.current?.('bowl', 270, 0.62);
            }}
            aria-label="Reset 3D surface of revolution"
            className="p-1.5 rounded border border-[rgba(244,196,108,0.18)] bg-[#11131C] text-[#A8B2C6] hover:text-[#F7F4EC]"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Split: 3D Viewport + Curve & Volume Integral Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 min-w-0">
        <div
          className={`${
            compact
              ? 'lg:col-span-12'
              : 'lg:col-span-8 border-b lg:border-b-0 lg:border-r hairline-rule'
          } relative bg-[#060609] min-w-0`}
        >
          <WebGLErrorBoundary fallbackTitle="3D Surface Revolution Lab Unavailable">
            {webglError ? (
              <div
                className={`w-full ${viewportHeight} flex items-center justify-center p-4 text-center bg-[#060609] font-mono-data text-xs text-[#A8B2C6]`}
              >
                {webglError}
              </div>
            ) : nearViewport ? (
              <div ref={mountRef} className={`w-full ${viewportHeight} bg-[#060609]`} />
            ) : (
              <div
                className={`w-full ${viewportHeight} flex items-center justify-center bg-[#060609] font-mono-data text-xs text-[#A8B2C6]`}
              >
                Initializing 3D Surface of Revolution Observatory…
              </div>
            )}
          </WebGLErrorBoundary>

          {/* Top-Left Formula & Swept Volume Telemetry Overlay */}
          <div className="pointer-events-none absolute top-3 left-3 obsidian-glass rounded-lg px-3 py-2 border border-[rgba(244,196,108,0.24)] space-y-0.5 max-w-[calc(100%-24px)] overflow-x-auto">
            <div className="flex flex-wrap items-center gap-2 font-mono-data text-[10px]">
              <span style={{ color: preset.accent }} className="font-semibold uppercase">
                {preset.label}
              </span>
              <span className="text-[#FFE29E]">
                · V({sweepDeg}°) = {telemetry.sweptVol.toFixed(2)}
              </span>
              <span className="text-[#45E6A6]">
                · {(telemetry.frac * 100).toFixed(0)}% swept
              </span>
            </div>
            <MathTex tex={preset.formulaTex} className="text-xs text-[#F7F4EC] block" />
          </div>

          {/* Top-Right Disk Slice Telemetry Pill (hidden on narrow mobile) */}
          <div className="pointer-events-none absolute top-3 right-3 hidden sm:block obsidian-glass rounded-lg px-2.5 py-1.5 border border-[rgba(69,230,166,0.32)] font-mono-data text-[10px] space-y-0.5">
            <div className="text-[#45E6A6]">
              Disk Slice @ x = {telemetry.xSlice.toFixed(2)}
            </div>
            <div className="text-[#FFE29E]">
              r = {telemetry.radiusAtSlice.toFixed(2)} · Area = {telemetry.diskArea.toFixed(2)}
            </div>
          </div>

          {/* Compact Mode Bottom Presets & Sweep Slider */}
          {compact && (
            <div className="absolute bottom-3 left-3 right-3 flex flex-col gap-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap gap-1">
                  {CURVE_ORDER.map((id) => {
                    const p = CURVE_PRESETS[id];
                    const active = curveId === id;
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => handleSelectCurve(id)}
                        className={`px-2 py-1 rounded text-[10px] font-mono-data border transition-all ${
                          active
                            ? 'text-[#060609] font-semibold'
                            : 'bg-[#0B0C12]/85 border-[rgba(244,196,108,0.2)] text-[#A8B2C6] hover:text-[#F7F4EC]'
                        }`}
                        style={
                          active
                            ? { backgroundColor: p.accent, borderColor: p.accent }
                            : undefined
                        }
                      >
                        {p.label}
                      </button>
                    );
                  })}
                </div>
                <span className="pointer-events-none hidden md:inline font-mono-data text-[10px] text-[#A8B2C6] bg-[#0B0C12]/80 px-2 py-1 rounded border border-[rgba(244,196,108,0.16)]">
                  Drag to orbit · Scroll to zoom
                </span>
              </div>

              <div className="obsidian-glass rounded-lg px-2.5 py-1.5 border border-[rgba(244,196,108,0.2)] flex items-center gap-2.5">
                <span className="font-mono-data text-[10px] text-[#46D6E8] shrink-0">
                  Sweep {sweepDeg}°
                </span>
                <input
                  type="range"
                  aria-label="Sweep angle"
                  min={15}
                  max={360}
                  step={1}
                  value={sweepDeg}
                  onChange={(e) => handleManualSweep(parseInt(e.target.value, 10))}
                  className="meridian-slider"
                  style={{ ['--slider-accent' as string]: '#46D6E8' }}
                />
              </div>
            </div>
          )}

          {!compact && (
            <div className="pointer-events-none absolute bottom-2.5 left-3 px-2.5 py-1 rounded bg-[#0B0C12]/85 border border-[rgba(244,196,108,0.18)] text-[10.5px] font-mono-data text-[#A8B2C6] max-w-[calc(100%-24px)] truncate">
              Drag to orbit · Gold curve = 0° start · Cyan = sweeping edge · Green = disk slice
            </div>
          )}
        </div>

        {/* Full Interactive Controls & Volume Integral Telemetry Panel */}
        {!compact && (
          <div className="lg:col-span-4 bg-[#0B0C12] p-4 sm:p-5 flex flex-col justify-between gap-3.5 min-w-0">
            <div className="space-y-3 min-w-0">
              <div className="font-mono-data text-[10px] uppercase tracking-[0.16em] text-[#A8B2C6]">
                2D Generator Curve
              </div>

              <div className="grid grid-cols-2 gap-1.5">
                {CURVE_ORDER.map((id) => {
                  const p = CURVE_PRESETS[id];
                  const active = curveId === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => handleSelectCurve(id)}
                      className={`px-2.5 py-2 rounded-lg text-left text-xs font-mono-data border transition-all ${
                        active
                          ? 'text-[#060609] font-semibold'
                          : 'bg-[#11131C] border-[rgba(244,196,108,0.16)] text-[#A8B2C6] hover:text-[#F7F4EC]'
                      }`}
                      style={
                        active
                          ? {
                              backgroundColor: p.accent,
                              borderColor: p.accent,
                              boxShadow: `0 0 18px -6px ${p.accent}`,
                            }
                          : undefined
                      }
                    >
                      <div className="truncate">{p.label}</div>
                      <div className={`text-[9.5px] ${active ? 'opacity-80' : 'text-[#727D94]'}`}>
                        x ∈ {p.domainText}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Sweep Angle & Disk Slice Sliders */}
              <div className="p-3.5 rounded-xl bg-[#11131C] border border-[rgba(244,196,108,0.16)] space-y-3">
                <label className="block space-y-1 text-xs">
                  <div className="flex justify-between font-mono-data">
                    <span className="text-[#A8B2C6]">Sweep Angle (θ)</span>
                    <span className="text-[#46D6E8] font-semibold">{sweepDeg}°</span>
                  </div>
                  <input
                    type="range"
                    min={15}
                    max={360}
                    step={1}
                    value={sweepDeg}
                    onChange={(e) => handleManualSweep(parseInt(e.target.value, 10))}
                    className="meridian-slider"
                    style={{ ['--slider-accent' as string]: '#46D6E8' }}
                  />
                  <div className="flex justify-between font-mono-data text-[9.5px] text-[#727D94]">
                    <span>15° Sliver</span>
                    <span>180° Half</span>
                    <span>360° Full Solid</span>
                  </div>
                </label>

                <label className="block space-y-1 text-xs pt-2 border-t border-[rgba(244,196,108,0.12)]">
                  <div className="flex justify-between font-mono-data">
                    <span className="text-[#A8B2C6]">Disk Cross-Section (x)</span>
                    <span className="text-[#45E6A6] font-semibold">
                      x = {telemetry.xSlice.toFixed(2)} (r = {telemetry.radiusAtSlice.toFixed(2)})
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0.08}
                    max={0.96}
                    step={0.01}
                    value={sliceNorm}
                    onChange={(e) => handleManualSlice(parseFloat(e.target.value))}
                    className="meridian-slider"
                    style={{ ['--slider-accent' as string]: '#45E6A6' }}
                  />
                  <div className="flex justify-between items-center font-mono-data text-[9.5px] text-[#727D94]">
                    <span>Full Disk A(x) = {telemetry.diskArea.toFixed(2)}</span>
                    <button
                      type="button"
                      onClick={() => setAutoSlice((a) => !a)}
                      className="text-[#45E6A6] hover:underline"
                    >
                      {autoSlice ? 'Auto-Glide ON' : 'Resume Glide'}
                    </button>
                  </div>
                </label>
              </div>
            </div>

            {/* Live Disk-Method Volume Integral Readout */}
            <div className="p-3.5 rounded-xl bg-[#11131C] border border-[rgba(244,196,108,0.2)] space-y-2.5 min-w-0">
              <div className="flex items-center justify-between gap-2 font-mono-data text-[10px]">
                <span className="uppercase tracking-[0.15em] text-[#A8B2C6]">
                  Disk Method Volume Integral
                </span>
                <span className="text-[#FFE29E]">
                  {(telemetry.frac * 100).toFixed(1)}% Swept
                </span>
              </div>

              <div className="overflow-x-auto max-w-full">
                <MathTex
                  tex="V = \pi \int_a^b [f(x)]^2\,dx"
                  className="text-xs text-[#A8B2C6] block"
                />
                <MathTex
                  tex={`${preset.integralTex} \\approx ${preset.exactVolume.toFixed(2)}`}
                  className="text-xs text-[#F7F4EC] block mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 font-mono-data text-xs">
                <div className="p-2 rounded bg-[#0B0C12] border border-[rgba(70,214,232,0.2)]">
                  <div className="text-[9.5px] text-[#727D94]">Swept Volume</div>
                  <div className="text-[#46D6E8] font-semibold">
                    {telemetry.sweptVol.toFixed(2)} u³
                  </div>
                </div>
                <div className="p-2 rounded bg-[#0B0C12] border border-[rgba(244,196,108,0.24)]">
                  <div className="text-[9.5px] text-[#727D94]">Full 360° ({preset.exactSymbolic})</div>
                  <div className="text-[#FFE29E] font-semibold">
                    {preset.exactVolume.toFixed(2)} u³
                  </div>
                </div>
              </div>

              {/* Swept Fraction Progress Bar */}
              <div className="space-y-1 font-mono-data text-[10px]">
                <div className="flex justify-between text-[#A8B2C6]">
                  <span>Swept Sector Area: {telemetry.sweptSectorArea.toFixed(2)} u²</span>
                  <span className="text-[#FFE29E]">{sweepDeg}° / 360°</span>
                </div>
                <div className="h-1.5 rounded-full bg-[#0B0C12] overflow-hidden border border-[rgba(244,196,108,0.1)]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#46D6E8] via-[#45E6A6] to-[#FFE29E] transition-all duration-100"
                    style={{ width: `${(telemetry.frac * 100).toFixed(1)}%` }}
                  />
                </div>
              </div>

              <p className="text-[11.5px] text-[#A8B2C6] leading-relaxed">
                {preset.intuition}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SurfaceRevolution3D;
