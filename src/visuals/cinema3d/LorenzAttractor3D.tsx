import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Pause, Play, RotateCcw, Sparkles } from 'lucide-react';
import { MathTex } from '../../components/MathTex';
import { WebGLErrorBoundary } from '../../components/WebGLErrorBoundary';
import { useReducedMotion } from '../../hooks/useReducedMotion';

export type LorenzPresetId = 'classic' | 'period' | 'calm';

interface LorenzPreset {
  id: LorenzPresetId;
  label: string;
  shortLabel: string;
  sigma: number;
  rho: number;
  beta: number;
  seedA: [number, number, number];
  accent: string;
  description: string;
}

const BETA = 8 / 3;
const DELTA_ZERO = 0.01;
const MAX_TRAIL_POINTS = 680;
const SUB_DT = 0.003;

const LORENZ_PRESETS: Record<LorenzPresetId, LorenzPreset> = {
  classic: {
    id: 'classic',
    label: 'Classic Butterfly',
    shortLabel: 'Classic Butterfly',
    sigma: 10,
    rho: 28,
    beta: BETA,
    seedA: [-6.8, -9.2, 23.5],
    accent: '#F4C46C',
    description:
      'Golden Amber and Cyan start just 0.01 apart—smaller than a butterfly wingbeat—yet quickly split onto opposite wings of the attractor.',
  },
  period: {
    id: 'period',
    label: 'Period Doubling',
    shortLabel: 'Period Doubling',
    sigma: 10,
    rho: 100.5,
    beta: BETA,
    seedA: [-1.366, 27.672, 97.863],
    accent: '#46D6E8',
    description:
      'At high heating ρ = 100.5, chaos briefly locks into a repeating multi-loop rhythm where both trajectories stay synchronized.',
  },
  calm: {
    id: 'calm',
    label: 'Calm Orbit',
    shortLabel: 'Calm Orbit',
    sigma: 10,
    rho: 16,
    beta: BETA,
    seedA: [-10.5, -13.0, 21.5],
    accent: '#45E6A6',
    description:
      'Below ρ ≈ 24.74, friction tames the flow. Both paths spiral inward and settle onto the exact same calm focal eye.',
  },
};

const PRESET_ORDER: LorenzPresetId[] = ['classic', 'period', 'calm'];

const RIBBON_VERTEX_SHADER = /* glsl */ `
  attribute float aProgress;
  attribute float aSide;
  varying float vProgress;
  varying float vSide;

  void main() {
    vProgress = aProgress;
    vSide = aSide;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const RIBBON_FRAGMENT_SHADER = /* glsl */ `
  uniform vec3 uHeadColor;
  uniform vec3 uTailColor;
  uniform float uOpacity;
  varying float vProgress;
  varying float vSide;

  void main() {
    float edgeGlow = exp(-vSide * vSide * 4.5);
    float tailFade = pow(clamp(vProgress, 0.0, 1.0), 1.35);
    vec3 col = mix(uTailColor, uHeadColor, smoothstep(0.15, 0.98, vProgress));
    float alpha = tailFade * edgeGlow * uOpacity;
    if (alpha < 0.005) discard;
    gl_FragColor = vec4(col, alpha);
  }
`;

function lorenzDeriv(
  x: number,
  y: number,
  z: number,
  sigma: number,
  rho: number,
  beta: number
): [number, number, number] {
  return [sigma * (y - x), x * (rho - z) - y, x * y - beta * z];
}

function rk4Step(
  state: [number, number, number],
  dt: number,
  sigma: number,
  rho: number,
  beta: number
): void {
  const [x, y, z] = state;
  const k1 = lorenzDeriv(x, y, z, sigma, rho, beta);
  const k2 = lorenzDeriv(
    x + 0.5 * dt * k1[0],
    y + 0.5 * dt * k1[1],
    z + 0.5 * dt * k1[2],
    sigma,
    rho,
    beta
  );
  const k3 = lorenzDeriv(
    x + 0.5 * dt * k2[0],
    y + 0.5 * dt * k2[1],
    z + 0.5 * dt * k2[2],
    sigma,
    rho,
    beta
  );
  const k4 = lorenzDeriv(
    x + dt * k3[0],
    y + dt * k3[1],
    z + dt * k3[2],
    sigma,
    rho,
    beta
  );

  state[0] = x + (dt / 6) * (k1[0] + 2 * k2[0] + 2 * k3[0] + k4[0]);
  state[1] = y + (dt / 6) * (k1[1] + 2 * k2[1] + 2 * k3[1] + k4[1]);
  state[2] = z + (dt / 6) * (k1[2] + 2 * k2[2] + 2 * k3[2] + k4[2]);
}

function toWorldPos(
  lx: number,
  ly: number,
  lz: number,
  rho: number,
  out: THREE.Vector3
): THREE.Vector3 {
  const zCenter = Math.max(12, rho * 0.88);
  const scale = 2.08 / Math.max(18, rho * 0.68 + 6);
  return out.set(lx * scale, (lz - zCenter) * scale, ly * scale);
}

interface TelemetryState {
  distance: number;
  maxDistance: number;
  simTime: number;
  posA: [number, number, number];
  history: number[];
}

function createRibbonBuffers() {
  const vertexCount = MAX_TRAIL_POINTS * 2;
  const positions = new Float32Array(vertexCount * 3);
  const progress = new Float32Array(vertexCount);
  const side = new Float32Array(vertexCount);
  const indices = new Uint16Array((MAX_TRAIL_POINTS - 1) * 6);

  for (let i = 0; i < MAX_TRAIL_POINTS; i++) {
    side[i * 2] = -1;
    side[i * 2 + 1] = 1;
  }

  for (let i = 0; i < MAX_TRAIL_POINTS - 1; i++) {
    const base = i * 6;
    const v = i * 2;
    indices[base] = v;
    indices[base + 1] = v + 1;
    indices[base + 2] = v + 2;
    indices[base + 3] = v + 1;
    indices[base + 4] = v + 3;
    indices[base + 5] = v + 2;
  }

  const geo = new THREE.BufferGeometry();
  const posAttr = new THREE.BufferAttribute(positions, 3);
  const progAttr = new THREE.BufferAttribute(progress, 1);
  const sideAttr = new THREE.BufferAttribute(side, 1);
  geo.setAttribute('position', posAttr);
  geo.setAttribute('aProgress', progAttr);
  geo.setAttribute('aSide', sideAttr);
  geo.setIndex(new THREE.BufferAttribute(indices, 1));
  geo.setDrawRange(0, 0);

  return { geo, positions, progress, posAttr, progAttr };
}

export function LorenzAttractor3D(props?: {
  compact?: boolean;
  heightClass?: string;
}): JSX.Element {
  const { compact = false, heightClass } = props ?? {};
  const reducedMotion = useReducedMotion();

  const [presetId, setPresetId] = useState<LorenzPresetId>('classic');
  const [rho, setRho] = useState(28);
  const [sigma, setSigma] = useState(10);
  const [simSpeed, setSimSpeed] = useState(1.0);
  const [playing, setPlaying] = useState(true);
  const [autoOrbit, setAutoOrbit] = useState(true);
  const [nearViewport, setNearViewport] = useState(false);
  const [webglError, setWebglError] = useState<string | null>(null);

  const [telemetry, setTelemetry] = useState<TelemetryState>({
    distance: DELTA_ZERO,
    maxDistance: DELTA_ZERO,
    simTime: 0,
    posA: [-6.8, -9.2, 23.5],
    history: [DELTA_ZERO],
  });

  const hostRef = useRef<HTMLDivElement | null>(null);
  const mountRef = useRef<HTMLDivElement | null>(null);

  const paramsRef = useRef({
    presetId,
    rho,
    sigma,
    simSpeed,
    playing,
    autoOrbit,
  });
  paramsRef.current = {
    presetId,
    rho,
    sigma,
    simSpeed,
    playing,
    autoOrbit,
  };

  const resetDivergenceActionRef = useRef<((usePresetSeed?: LorenzPresetId) => void) | null>(
    null
  );
  const updateEquilibriaRef = useRef<((curRho: number) => void) | null>(null);

  const preset = LORENZ_PRESETS[presetId];

  // IntersectionObserver with rootMargin '200px' gating WebGL mount & disposal
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
    renderer.setClearColor(0x050508, 1);

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
    scene.background = new THREE.Color(0x050508);

    const camera = new THREE.PerspectiveCamera(40, initW / initH, 0.1, 80);
    camera.position.set(4.5, 2.2, 4.9);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.rotateSpeed = 0.8;
    controls.enablePan = false;
    controls.minDistance = 2.6;
    controls.maxDistance = 12.5;
    controls.target.set(0, 0.05, 0);

    // Observatory base rings & coordinate crosshairs
    const ringGeos: THREE.BufferGeometry[] = [];
    const ringMats: THREE.Material[] = [];
    const ringConfigs = [
      { radius: 1.55, color: 0xf4c46c, opacity: 0.24 },
      { radius: 2.38, color: 0x46d6e8, opacity: 0.15 },
    ];
    ringConfigs.forEach((cfg) => {
      const rg = new THREE.RingGeometry(cfg.radius - 0.008, cfg.radius + 0.008, 96);
      rg.rotateX(-Math.PI / 2);
      const rm = new THREE.MeshBasicMaterial({
        color: cfg.color,
        transparent: true,
        opacity: cfg.opacity,
        side: THREE.DoubleSide,
      });
      ringGeos.push(rg);
      ringMats.push(rm);
      const mesh = new THREE.Mesh(rg, rm);
      mesh.position.y = -2.15;
      scene.add(mesh);
    });

    const axisPositions = new Float32Array([
      -2.2, -2.15, 0, 2.2, -2.15, 0,
      0, -2.15, -2.2, 0, -2.15, 2.2,
    ]);
    const axisGeo = new THREE.BufferGeometry();
    axisGeo.setAttribute('position', new THREE.BufferAttribute(axisPositions, 3));
    const axisMat = new THREE.LineBasicMaterial({
      color: 0xf4c46c,
      transparent: true,
      opacity: 0.14,
    });
    const axisLines = new THREE.LineSegments(axisGeo, axisMat);
    scene.add(axisLines);

    // Equilibrium focal markers C+ and C-
    const eqGeo = new THREE.SphereGeometry(0.04, 12, 12);
    const eqMat = new THREE.MeshBasicMaterial({
      color: 0xf4c46c,
      transparent: true,
      opacity: 0.38,
    });
    const eqPlus = new THREE.Mesh(eqGeo, eqMat);
    const eqMinus = new THREE.Mesh(eqGeo, eqMat);
    scene.add(eqPlus, eqMinus);

    const updateEquilibria = (curRho: number) => {
      if (curRho <= 1.05) {
        eqPlus.visible = false;
        eqMinus.visible = false;
        return;
      }
      eqPlus.visible = true;
      eqMinus.visible = true;
      const xy = Math.sqrt(BETA * (curRho - 1));
      const zEq = curRho - 1;
      toWorldPos(xy, xy, zEq, curRho, eqPlus.position);
      toWorldPos(-xy, -xy, zEq, curRho, eqMinus.position);
    };
    updateEquilibria(paramsRef.current.rho);
    updateEquilibriaRef.current = updateEquilibria;

    // Tapering glowing ribbons for Trajectory A (Golden Amber) & B (Cyan)
    const ribbonA = createRibbonBuffers();
    const ribbonB = createRibbonBuffers();

    const ribbonAMat = new THREE.ShaderMaterial({
      vertexShader: RIBBON_VERTEX_SHADER,
      fragmentShader: RIBBON_FRAGMENT_SHADER,
      uniforms: {
        uHeadColor: { value: new THREE.Color('#FFE29E') },
        uTailColor: { value: new THREE.Color('#FF8563') },
        uOpacity: { value: 0.78 },
      },
      transparent: true,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false,
    });

    const ribbonBMat = new THREE.ShaderMaterial({
      vertexShader: RIBBON_VERTEX_SHADER,
      fragmentShader: RIBBON_FRAGMENT_SHADER,
      uniforms: {
        uHeadColor: { value: new THREE.Color('#9DF3FF') },
        uTailColor: { value: new THREE.Color('#45E6A6') },
        uOpacity: { value: 0.74 },
      },
      transparent: true,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false,
    });

    const ribbonAMesh = new THREE.Mesh(ribbonA.geo, ribbonAMat);
    const ribbonBMesh = new THREE.Mesh(ribbonB.geo, ribbonBMat);
    ribbonAMesh.frustumCulled = false;
    ribbonBMesh.frustumCulled = false;
    scene.add(ribbonAMesh, ribbonBMesh);

    // Crisp luminous center spine lines on top of each ribbon
    const spineAPos = new Float32Array(MAX_TRAIL_POINTS * 3);
    const spineACol = new Float32Array(MAX_TRAIL_POINTS * 3);
    const spineBPos = new Float32Array(MAX_TRAIL_POINTS * 3);
    const spineBCol = new Float32Array(MAX_TRAIL_POINTS * 3);

    const spineAGeo = new THREE.BufferGeometry();
    const spineAPosAttr = new THREE.BufferAttribute(spineAPos, 3);
    const spineAColAttr = new THREE.BufferAttribute(spineACol, 3);
    spineAGeo.setAttribute('position', spineAPosAttr);
    spineAGeo.setAttribute('color', spineAColAttr);
    spineAGeo.setDrawRange(0, 0);

    const spineBGeo = new THREE.BufferGeometry();
    const spineBPosAttr = new THREE.BufferAttribute(spineBPos, 3);
    const spineBColAttr = new THREE.BufferAttribute(spineBCol, 3);
    spineBGeo.setAttribute('position', spineBPosAttr);
    spineBGeo.setAttribute('color', spineBColAttr);
    spineBGeo.setDrawRange(0, 0);

    const spineAMat = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const spineBMat = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const spineALine = new THREE.Line(spineAGeo, spineAMat);
    const spineBLine = new THREE.Line(spineBGeo, spineBMat);
    spineALine.frustumCulled = false;
    spineBLine.frustumCulled = false;
    scene.add(spineALine, spineBLine);

    // Glowing Head Spheres + Outer Halos
    const headGeo = new THREE.SphereGeometry(0.068, 18, 18);
    const haloGeo = new THREE.SphereGeometry(0.175, 16, 16);

    const headAMat = new THREE.MeshBasicMaterial({ color: 0xffe29e });
    const headBMat = new THREE.MeshBasicMaterial({ color: 0x46d6e8 });
    const haloAMat = new THREE.MeshBasicMaterial({
      color: 0xf4c46c,
      transparent: true,
      opacity: 0.32,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const haloBMat = new THREE.MeshBasicMaterial({
      color: 0x46d6e8,
      transparent: true,
      opacity: 0.32,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const headA = new THREE.Mesh(headGeo, headAMat);
    const headB = new THREE.Mesh(headGeo, headBMat);
    const haloA = new THREE.Mesh(haloGeo, haloAMat);
    const haloB = new THREE.Mesh(haloGeo, haloBMat);
    scene.add(headA, headB, haloA, haloB);

    // Live Divergence Tether line connecting Head A <-> Head B
    const tetherArr = new Float32Array(6);
    const tetherGeo = new THREE.BufferGeometry();
    const tetherAttr = new THREE.BufferAttribute(tetherArr, 3);
    tetherGeo.setAttribute('position', tetherAttr);
    const tetherMat = new THREE.LineBasicMaterial({
      color: 0x45e6a6,
      transparent: true,
      opacity: 0.82,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const tetherLine = new THREE.Line(tetherGeo, tetherMat);
    scene.add(tetherLine);

    // Simulation state in math coordinates (stored in refs inside effect)
    const initialPreset = LORENZ_PRESETS[paramsRef.current.presetId];
    const stateA: [number, number, number] = [...initialPreset.seedA];
    const stateB: [number, number, number] = [
      initialPreset.seedA[0] + DELTA_ZERO,
      initialPreset.seedA[1],
      initialPreset.seedA[2],
    ];

    // Trail points stored in math space so changing rho smoothly re-centers in world space
    const trailMathA = new Float32Array(MAX_TRAIL_POINTS * 3);
    const trailMathB = new Float32Array(MAX_TRAIL_POINTS * 3);
    let trailCount = 0;
    let simTime = 0;
    let maxDistance = DELTA_ZERO;
    const divergenceHistory: number[] = [DELTA_ZERO];
    let lastHistorySampleT = 0;

    const pushTrailPoint = () => {
      if (trailCount < MAX_TRAIL_POINTS) {
        const o = trailCount * 3;
        trailMathA[o] = stateA[0];
        trailMathA[o + 1] = stateA[1];
        trailMathA[o + 2] = stateA[2];

        trailMathB[o] = stateB[0];
        trailMathB[o + 1] = stateB[1];
        trailMathB[o + 2] = stateB[2];
        trailCount++;
      } else {
        trailMathA.copyWithin(0, 3);
        trailMathB.copyWithin(0, 3);
        const o = (MAX_TRAIL_POINTS - 1) * 3;
        trailMathA[o] = stateA[0];
        trailMathA[o + 1] = stateA[1];
        trailMathA[o + 2] = stateA[2];

        trailMathB[o] = stateB[0];
        trailMathB[o + 1] = stateB[1];
        trailMathB[o + 2] = stateB[2];
      }
    };

    const goldHead = new THREE.Color('#FFE29E');
    const goldTail = new THREE.Color('#FF8563');
    const cyanHead = new THREE.Color('#9DF3FF');
    const cyanTail = new THREE.Color('#45E6A6');

    const tmpTan = new THREE.Vector3();
    const tmpView = new THREE.Vector3();
    const tmpSide = new THREE.Vector3();
    const tmpCol = new THREE.Color();

    const worldCacheA: THREE.Vector3[] = Array.from(
      { length: MAX_TRAIL_POINTS },
      () => new THREE.Vector3()
    );
    const worldCacheB: THREE.Vector3[] = Array.from(
      { length: MAX_TRAIL_POINTS },
      () => new THREE.Vector3()
    );

    const syncGeometryFromTrails = (curRho: number) => {
      // Update glowing heads & divergence tether
      toWorldPos(stateA[0], stateA[1], stateA[2], curRho, headA.position);
      toWorldPos(stateB[0], stateB[1], stateB[2], curRho, headB.position);
      haloA.position.copy(headA.position);
      haloB.position.copy(headB.position);

      tetherArr[0] = headA.position.x;
      tetherArr[1] = headA.position.y;
      tetherArr[2] = headA.position.z;
      tetherArr[3] = headB.position.x;
      tetherArr[4] = headB.position.y;
      tetherArr[5] = headB.position.z;
      tetherAttr.needsUpdate = true;

      const dist = Math.hypot(
        stateB[0] - stateA[0],
        stateB[1] - stateA[1],
        stateB[2] - stateA[2]
      );
      if (dist < 0.2) {
        tetherMat.color.setHex(0x45e6a6);
      } else if (dist < 4.5) {
        tetherMat.color.setHex(0xf4c46c);
      } else {
        tetherMat.color.setHex(0xff8563);
      }

      if (trailCount < 2) {
        ribbonA.geo.setDrawRange(0, 0);
        ribbonB.geo.setDrawRange(0, 0);
        spineAGeo.setDrawRange(0, 0);
        spineBGeo.setDrawRange(0, 0);
        return;
      }

      // Convert math trails to world points once per frame
      for (let i = 0; i < trailCount; i++) {
        const o = i * 3;
        toWorldPos(
          trailMathA[o],
          trailMathA[o + 1],
          trailMathA[o + 2],
          curRho,
          worldCacheA[i]
        );
        toWorldPos(
          trailMathB[o],
          trailMathB[o + 1],
          trailMathB[o + 2],
          curRho,
          worldCacheB[i]
        );
      }

      const updateOneRibbon = (
        pts: THREE.Vector3[],
        ribbon: ReturnType<typeof createRibbonBuffers>,
        spinePos: Float32Array,
        spineCol: Float32Array,
        cHead: THREE.Color,
        cTail: THREE.Color
      ) => {
        const denom = Math.max(1, trailCount - 1);
        for (let i = 0; i < trailCount; i++) {
          const u = i / denom;
          const p = pts[i];
          const pPrev = i > 0 ? pts[i - 1] : p;
          const pNext = i < trailCount - 1 ? pts[i + 1] : p;

          tmpTan.subVectors(pNext, pPrev);
          if (tmpTan.lengthSq() < 1e-8) {
            tmpTan.set(1, 0, 0);
          } else {
            tmpTan.normalize();
          }

          tmpView.subVectors(camera.position, p).normalize();
          tmpSide.crossVectors(tmpTan, tmpView);
          if (tmpSide.lengthSq() < 1e-6) {
            tmpSide.set(0, 1, 0).cross(tmpTan);
            if (tmpSide.lengthSq() < 1e-6) tmpSide.set(1, 0, 0);
          }
          tmpSide.normalize();

          const halfW = 0.002 + Math.pow(u, 1.4) * 0.048;

          const vIdx = i * 2;
          const pOff = vIdx * 3;
          ribbon.positions[pOff] = p.x - tmpSide.x * halfW;
          ribbon.positions[pOff + 1] = p.y - tmpSide.y * halfW;
          ribbon.positions[pOff + 2] = p.z - tmpSide.z * halfW;

          ribbon.positions[pOff + 3] = p.x + tmpSide.x * halfW;
          ribbon.positions[pOff + 4] = p.y + tmpSide.y * halfW;
          ribbon.positions[pOff + 5] = p.z + tmpSide.z * halfW;

          ribbon.progress[vIdx] = u;
          ribbon.progress[vIdx + 1] = u;

          const sOff = i * 3;
          spinePos[sOff] = p.x;
          spinePos[sOff + 1] = p.y;
          spinePos[sOff + 2] = p.z;

          const fade = Math.pow(u, 1.15);
          tmpCol.copy(cTail).lerp(cHead, u);
          spineCol[sOff] = tmpCol.r * fade;
          spineCol[sOff + 1] = tmpCol.g * fade;
          spineCol[sOff + 2] = tmpCol.b * fade;
        }

        ribbon.posAttr.needsUpdate = true;
        ribbon.progAttr.needsUpdate = true;
        ribbon.geo.setDrawRange(0, (trailCount - 1) * 6);
      };

      updateOneRibbon(worldCacheA, ribbonA, spineAPos, spineACol, goldHead, goldTail);
      updateOneRibbon(worldCacheB, ribbonB, spineBPos, spineBCol, cyanHead, cyanTail);

      spineAPosAttr.needsUpdate = true;
      spineAColAttr.needsUpdate = true;
      spineBPosAttr.needsUpdate = true;
      spineBColAttr.needsUpdate = true;
      spineAGeo.setDrawRange(0, trailCount);
      spineBGeo.setDrawRange(0, trailCount);
    };

    const resetSimulation = (usePresetKey?: LorenzPresetId) => {
      const cur = paramsRef.current;
      const activeRho = usePresetKey ? LORENZ_PRESETS[usePresetKey].rho : cur.rho;
      const activeSigma = usePresetKey ? LORENZ_PRESETS[usePresetKey].sigma : cur.sigma;

      if (usePresetKey) {
        const p = LORENZ_PRESETS[usePresetKey];
        stateA[0] = p.seedA[0];
        stateA[1] = p.seedA[1];
        stateA[2] = p.seedA[2];
      } else {
        // If trajectory A settled near an equilibrium eye, re-seed cleanly to an outer wing
        const dA = lorenzDeriv(stateA[0], stateA[1], stateA[2], activeSigma, activeRho, BETA);
        const speedA = Math.hypot(dA[0], dA[1], dA[2]);
        if (speedA < 1.2 || !Number.isFinite(speedA) || Math.abs(stateA[0]) > 250) {
          const p = LORENZ_PRESETS[cur.presetId];
          stateA[0] = activeRho < 24 ? -10.5 : p.seedA[0];
          stateA[1] = activeRho < 24 ? -13.0 : p.seedA[1];
          stateA[2] = activeRho < 24 ? Math.max(8, activeRho * 1.25) : Math.max(4, activeRho * 0.85);
        }
      }

      stateB[0] = stateA[0] + DELTA_ZERO;
      stateB[1] = stateA[1];
      stateB[2] = stateA[2];

      trailCount = 0;
      simTime = 0;
      maxDistance = DELTA_ZERO;
      lastHistorySampleT = 0;
      divergenceHistory.length = 0;
      divergenceHistory.push(DELTA_ZERO);

      pushTrailPoint();
      // Step 2 micro-ticks so both ribbons start with a crisp luminous anchor
      rk4Step(stateA, SUB_DT, activeSigma, activeRho, BETA);
      rk4Step(stateB, SUB_DT, activeSigma, activeRho, BETA);
      simTime += SUB_DT;
      pushTrailPoint();

      const d0 = Math.hypot(
        stateB[0] - stateA[0],
        stateB[1] - stateA[1],
        stateB[2] - stateA[2]
      );
      syncGeometryFromTrails(activeRho);
      setTelemetry({
        distance: d0,
        maxDistance: Math.max(DELTA_ZERO, d0),
        simTime,
        posA: [stateA[0], stateA[1], stateA[2]],
        history: [...divergenceHistory],
      });
    };

    resetDivergenceActionRef.current = resetSimulation;

    // Seed initial luminous arc (~90 steps) so the butterfly wings immediately shimmer on load
    pushTrailPoint();
    for (let k = 0; k < 95; k++) {
      rk4Step(stateA, SUB_DT, paramsRef.current.sigma, paramsRef.current.rho, BETA);
      rk4Step(stateB, SUB_DT, paramsRef.current.sigma, paramsRef.current.rho, BETA);
      simTime += SUB_DT;
      if (k % 2 === 0) pushTrailPoint();
      const d = Math.hypot(
        stateB[0] - stateA[0],
        stateB[1] - stateA[1],
        stateB[2] - stateA[2]
      );
      if (d > maxDistance) maxDistance = d;
    }
    divergenceHistory.push(
      Math.hypot(stateB[0] - stateA[0], stateB[1] - stateA[1], stateB[2] - stateA[2])
    );
    syncGeometryFromTrails(paramsRef.current.rho);

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
    let lastTelemetryPush = 0;
    let substepCounter = 0;
    let elapsedWall = 0;

    const tick = (now: number) => {
      const dt = Math.min(0.045, Math.max(0.001, (now - lastNow) / 1000));
      lastNow = now;
      elapsedWall += dt;

      if (!document.hidden) {
        const {
          rho: curRho,
          sigma: curSigma,
          simSpeed: curSpeed,
          playing: isPlaying,
          autoOrbit: isAutoOrbit,
        } = paramsRef.current;

        controls.autoRotate = isAutoOrbit && !reducedMotion;
        controls.autoRotateSpeed = 0.6;
        controls.update();

        if (isPlaying && !reducedMotion) {
          const mathDtTotal = dt * curSpeed * 1.1;
          const steps = Math.min(18, Math.max(1, Math.round(mathDtTotal / SUB_DT)));
          const stepSize = mathDtTotal / steps;

          for (let s = 0; s < steps; s++) {
            rk4Step(stateA, stepSize, curSigma, curRho, BETA);
            rk4Step(stateB, stepSize, curSigma, curRho, BETA);
            simTime += stepSize;
            substepCounter++;

            // Guard against numerical escape on extreme slider drag
            if (
              !Number.isFinite(stateA[0]) ||
              Math.abs(stateA[0]) > 400 ||
              !Number.isFinite(stateB[0]) ||
              Math.abs(stateB[0]) > 400
            ) {
              resetSimulation(paramsRef.current.presetId);
              break;
            }

            if (substepCounter % 2 === 0) {
              pushTrailPoint();
            }
          }

          const dist = Math.hypot(
            stateB[0] - stateA[0],
            stateB[1] - stateA[1],
            stateB[2] - stateA[2]
          );
          if (dist > maxDistance) maxDistance = dist;

          if (simTime - lastHistorySampleT >= 0.14) {
            lastHistorySampleT = simTime;
            divergenceHistory.push(dist);
            if (divergenceHistory.length > 84) {
              divergenceHistory.shift();
            }
          }

          if (now - lastTelemetryPush >= 65) {
            lastTelemetryPush = now;
            setTelemetry({
              distance: dist,
              maxDistance,
              simTime,
              posA: [stateA[0], stateA[1], stateA[2]],
              history: [...divergenceHistory],
            });
          }
        }

        const pulse = 1 + Math.sin(elapsedWall * 3.1) * 0.15;
        haloA.scale.setScalar(pulse);
        haloB.scale.setScalar(pulse);

        syncGeometryFromTrails(curRho);
        renderer.render(scene, camera);
      }

      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
      resetDivergenceActionRef.current = null;
      updateEquilibriaRef.current = null;

      controls.dispose();
      ringGeos.forEach((g) => g.dispose());
      ringMats.forEach((m) => m.dispose());
      axisGeo.dispose();
      axisMat.dispose();
      eqGeo.dispose();
      eqMat.dispose();

      ribbonA.geo.dispose();
      ribbonB.geo.dispose();
      ribbonAMat.dispose();
      ribbonBMat.dispose();

      spineAGeo.dispose();
      spineBGeo.dispose();
      spineAMat.dispose();
      spineBMat.dispose();

      headGeo.dispose();
      haloGeo.dispose();
      headAMat.dispose();
      headBMat.dispose();
      haloAMat.dispose();
      haloBMat.dispose();

      tetherGeo.dispose();
      tetherMat.dispose();

      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [nearViewport, reducedMotion]);

  useEffect(() => {
    updateEquilibriaRef.current?.(rho);
  }, [rho]);

  const selectPreset = (nextId: LorenzPresetId) => {
    const p = LORENZ_PRESETS[nextId];
    setPresetId(nextId);
    setRho(p.rho);
    setSigma(p.sigma);
    setPlaying(true);
    resetDivergenceActionRef.current?.(nextId);
  };

  const handleResetDivergence = () => {
    setPlaying(true);
    resetDivergenceActionRef.current?.();
  };

  const divergenceStatus = (() => {
    if (telemetry.distance < 0.004 && telemetry.simTime > 2.5) {
      return { label: 'Converged', color: '#45E6A6' };
    }
    if (telemetry.distance < 0.25) {
      return { label: 'Synchronized', color: '#45E6A6' };
    }
    if (telemetry.distance < 4.5) {
      return { label: 'Separating', color: '#F4C46C' };
    }
    return { label: 'Chaotic Split', color: '#FF8563' };
  })();

  // Build clean SVG sparkline polyline for |Δ(t)|
  const sparklinePoints = (() => {
    const hist = telemetry.history;
    if (hist.length < 2) return '0,44 220,44';
    const maxVal = Math.max(0.1, ...hist);
    return hist
      .map((val, idx) => {
        const x = (idx / Math.max(1, hist.length - 1)) * 220;
        const y = 44 - Math.min(1, val / maxVal) * 38;
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ');
  })();

  const viewportHeight =
    heightClass ?? (compact ? 'h-[310px] sm:h-[360px]' : 'h-[360px] sm:h-[440px]');

  return (
    <div
      ref={hostRef}
      className="instrument-frame fiducial-frame overflow-hidden bg-[#050508] min-w-0 max-w-full"
    >
      {/* Top Bar */}
      <div className="px-3 sm:px-4 py-2.5 border-b hairline-rule bg-[#0B0C12]/95 flex flex-wrap items-center justify-between gap-2 min-w-0">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className="w-2 h-2 rounded-full shrink-0"
            style={{
              backgroundColor: preset.accent,
              boxShadow: `0 0 10px ${preset.accent}`,
            }}
          />
          <span className="font-mono-data text-[10px] uppercase tracking-[0.16em] text-[#F4C46C] truncate">
            Lorenz Chaos Butterfly 3D
          </span>
          <span className="hidden sm:inline font-mono-data text-[10px] px-2 py-0.5 rounded bg-[#11131C] border border-[rgba(244,196,108,0.18)] text-[#A8B2C6]">
            RK4 · Δ₀ = {DELTA_ZERO.toFixed(2)}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={handleResetDivergence}
            className="inline-flex items-center gap-1 px-2 py-1 rounded text-[10.5px] font-mono-data border border-[#F4C46C]/45 bg-[#F4C46C]/12 text-[#FFE29E] hover:bg-[#F4C46C]/22 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Δ₀</span>
          </button>

          {!compact && (
            <button
              type="button"
              onClick={() => setAutoOrbit((s) => !s)}
              className={`px-2 py-1 rounded text-[10.5px] font-mono-data border transition-colors ${
                autoOrbit
                  ? 'border-[#46D6E8]/50 text-[#46D6E8] bg-[#46D6E8]/12'
                  : 'border-[rgba(244,196,108,0.18)] bg-[#11131C] text-[#A8B2C6]'
              }`}
            >
              {autoOrbit ? 'Orbit: Auto' : 'Orbit: Free'}
            </button>
          )}

          <button
            type="button"
            onClick={() => setPlaying((p) => !p)}
            aria-label={playing ? 'Pause Lorenz simulation' : 'Play Lorenz simulation'}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-[10.5px] font-mono-data border transition-colors ${
              playing
                ? 'border-[#45E6A6]/50 text-[#45E6A6] bg-[#45E6A6]/12'
                : 'border-[#F4C46C]/50 text-[#FFE29E] bg-[#F4C46C]/15'
            }`}
          >
            {playing ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
            <span>{playing ? 'Pause' : 'Play'}</span>
          </button>
        </div>
      </div>

      {/* Main Split: 3D Chaos Viewport + Butterfly Effect Telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-12 min-w-0">
        <div
          className={`${
            compact
              ? 'lg:col-span-12'
              : 'lg:col-span-8 border-b lg:border-b-0 lg:border-r hairline-rule'
          } relative bg-[#050508] min-w-0`}
        >
          <WebGLErrorBoundary fallbackTitle="3D Lorenz Attractor Unavailable">
            {webglError ? (
              <div
                className={`w-full ${viewportHeight} flex items-center justify-center p-4 text-center bg-[#050508] font-mono-data text-xs text-[#A8B2C6]`}
              >
                {webglError}
              </div>
            ) : nearViewport ? (
              <div ref={mountRef} className={`w-full ${viewportHeight} bg-[#050508]`} />
            ) : (
              <div
                className={`w-full ${viewportHeight} flex items-center justify-center bg-[#050508] font-mono-data text-xs text-[#A8B2C6]`}
              >
                Initializing 3D Lorenz Chaos Attractor…
              </div>
            )}
          </WebGLErrorBoundary>

          {/* Top-Left Equations & Live Divergence Readout */}
          <div className="pointer-events-none absolute top-3 left-3 obsidian-glass rounded-lg px-2.5 sm:px-3 py-2 border border-[rgba(244,196,108,0.24)] space-y-1 max-w-[calc(100%-24px)]">
            <div className="flex flex-wrap items-center gap-2 font-mono-data text-[10px]">
              <span style={{ color: preset.accent }} className="font-semibold uppercase">
                {preset.label}
              </span>
              <span className="text-[#A8B2C6]">
                σ={sigma.toFixed(1)} · ρ={rho.toFixed(1)} · β=8/3
              </span>
              <span
                className="font-semibold px-1.5 py-0.5 rounded bg-[#050508]/80 border border-[rgba(244,196,108,0.2)]"
                style={{ color: divergenceStatus.color }}
              >
                |Δ(t)| = {telemetry.distance.toFixed(3)}
              </span>
            </div>
            <div className="overflow-x-auto max-w-full">
              <MathTex
                tex={`\\dot{x}=\\sigma(y-x),\\quad \\dot{y}=x(\\rho-z)-y,\\quad \\dot{z}=xy-\\beta z`}
                className="text-[11px] sm:text-xs text-[#F7F4EC]"
              />
            </div>
          </div>

          {/* Trajectory A vs B Legend Badge (Top Right on sm+) */}
          <div className="pointer-events-none hidden sm:flex absolute top-3 right-3 obsidian-glass rounded-lg px-2.5 py-1.5 border border-[rgba(244,196,108,0.2)] flex-col gap-1 font-mono-data text-[10px]">
            <div className="flex items-center gap-1.5 text-[#FFE29E]">
              <span className="w-2 h-2 rounded-full bg-[#FFE29E] shadow-[0_0_8px_#FFE29E]" />
              <span>Trajectory A (Golden)</span>
            </div>
            <div className="flex items-center gap-1.5 text-[#46D6E8]">
              <span className="w-2 h-2 rounded-full bg-[#46D6E8] shadow-[0_0_8px_#46D6E8]" />
              <span>Trajectory B (+0.01 offset)</span>
            </div>
          </div>

          {/* Bottom Preset Pills (Compact) or Orbit Hint (Full) */}
          {compact ? (
            <div className="absolute bottom-3 left-3 right-3 flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap gap-1.5">
                {PRESET_ORDER.map((id) => {
                  const p = LORENZ_PRESETS[id];
                  const active = presetId === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => selectPreset(id)}
                      className={`px-2 py-1 rounded text-[10px] font-mono-data border transition-all ${
                        active
                          ? 'text-[#050508] font-semibold'
                          : 'bg-[#0B0C12]/85 border-[rgba(244,196,108,0.2)] text-[#A8B2C6] hover:text-[#F7F4EC]'
                      }`}
                      style={
                        active ? { backgroundColor: p.accent, borderColor: p.accent } : undefined
                      }
                    >
                      {p.shortLabel}
                    </button>
                  );
                })}
              </div>
              <span className="pointer-events-none hidden sm:inline font-mono-data text-[10px] text-[#A8B2C6] bg-[#0B0C12]/80 px-2 py-1 rounded border border-[rgba(244,196,108,0.16)]">
                Drag to orbit · Scroll to zoom
              </span>
            </div>
          ) : (
            <div className="pointer-events-none absolute bottom-2.5 left-3 right-3 sm:right-auto px-2.5 py-1 rounded bg-[#0B0C12]/85 border border-[rgba(244,196,108,0.18)] text-[10px] sm:text-[10.5px] font-mono-data text-[#A8B2C6] truncate">
              Drag to orbit · Scroll to zoom · Watch Δ₀ = 0.01 diverge in real time
            </div>
          )}
        </div>

        {/* Full Interactive Controls & Live Divergence Telemetry */}
        {!compact && (
          <div className="lg:col-span-4 bg-[#0B0C12] p-4 sm:p-5 flex flex-col justify-between gap-3.5 min-w-0">
            <div className="space-y-3 min-w-0">
              <div className="font-mono-data text-[10px] uppercase tracking-[0.16em] text-[#A8B2C6]">
                Attractor Regime Preset
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-1.5">
                {PRESET_ORDER.map((id) => {
                  const p = LORENZ_PRESETS[id];
                  const active = presetId === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => selectPreset(id)}
                      className={`px-3 py-2 rounded-lg text-left text-xs font-mono-data border transition-all flex items-center justify-between gap-2 ${
                        active
                          ? 'text-[#050508] font-semibold'
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
                      <span className="truncate">{p.label}</span>
                      <span
                        className={`text-[10px] shrink-0 ${
                          active ? 'text-[#050508]/80' : 'text-[#727D94]'
                        }`}
                      >
                        ρ={p.rho}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Parameter Sliders */}
              <div className="p-3.5 rounded-xl bg-[#11131C] border border-[rgba(244,196,108,0.16)] space-y-3">
                <label className="block space-y-1 text-xs">
                  <div className="flex justify-between font-mono-data">
                    <span className="text-[#A8B2C6]">Rayleigh Drive (ρ)</span>
                    <span className="text-[#FFE29E] font-semibold">{rho.toFixed(1)}</span>
                  </div>
                  <input
                    type="range"
                    min={5}
                    max={120}
                    step={0.5}
                    value={rho}
                    onChange={(e) => setRho(parseFloat(e.target.value))}
                    className="meridian-slider"
                    style={{ ['--slider-accent' as string]: '#FFE29E' }}
                  />
                  <div className="flex justify-between font-mono-data text-[10px] text-[#727D94]">
                    <span>5 Calm</span>
                    <span>28 Chaos</span>
                    <span>100.5 Periodic</span>
                  </div>
                </label>

                <label className="block space-y-1 text-xs">
                  <div className="flex justify-between font-mono-data">
                    <span className="text-[#A8B2C6]">Prandtl Viscosity (σ)</span>
                    <span className="text-[#46D6E8] font-semibold">{sigma.toFixed(1)}</span>
                  </div>
                  <input
                    type="range"
                    min={4}
                    max={24}
                    step={0.5}
                    value={sigma}
                    onChange={(e) => setSigma(parseFloat(e.target.value))}
                    className="meridian-slider"
                    style={{ ['--slider-accent' as string]: '#46D6E8' }}
                  />
                </label>

                <label className="block space-y-1 text-xs">
                  <div className="flex justify-between font-mono-data">
                    <span className="text-[#A8B2C6]">Time Speed</span>
                    <span className="text-[#45E6A6] font-semibold">{simSpeed.toFixed(1)}×</span>
                  </div>
                  <input
                    type="range"
                    min={0.3}
                    max={2.0}
                    step={0.1}
                    value={simSpeed}
                    onChange={(e) => setSimSpeed(parseFloat(e.target.value))}
                    className="meridian-slider"
                    style={{ ['--slider-accent' as string]: '#45E6A6' }}
                  />
                </label>
              </div>
            </div>

            {/* Live Divergence Telemetry + Sparkline */}
            <div className="p-3.5 rounded-xl bg-[#11131C] border border-[rgba(244,196,108,0.2)] space-y-2.5 min-w-0">
              <div className="flex items-center justify-between gap-2 font-mono-data text-[10px] uppercase tracking-[0.14em]">
                <span className="text-[#A8B2C6] inline-flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-[#F4C46C]" />
                  Butterfly Divergence
                </span>
                <span style={{ color: divergenceStatus.color }}>{divergenceStatus.label}</span>
              </div>

              <div className="grid grid-cols-2 gap-2 font-mono-data text-xs">
                <div className="p-2 rounded bg-[#0B0C12] border border-[rgba(244,196,108,0.22)]">
                  <div className="text-[9.5px] text-[#727D94]">Live |Δ(t)|</div>
                  <div
                    className="font-semibold text-sm"
                    style={{ color: divergenceStatus.color }}
                  >
                    {telemetry.distance.toFixed(4)}
                  </div>
                </div>
                <div className="p-2 rounded bg-[#0B0C12] border border-[rgba(70,214,232,0.2)]">
                  <div className="text-[9.5px] text-[#727D94]">Peak |Δ| (Δ₀=0.01)</div>
                  <div className="text-[#46D6E8] font-semibold text-sm">
                    {telemetry.maxDistance.toFixed(2)}
                  </div>
                </div>
              </div>

              <div className="rounded-lg bg-[#050508] border border-[rgba(244,196,108,0.14)] p-2">
                <svg
                  viewBox="0 0 220 48"
                  className="w-full h-11 overflow-visible"
                  aria-label="Trajectory divergence over time"
                >
                  <line
                    x1="0"
                    y1="44"
                    x2="220"
                    y2="44"
                    stroke="rgba(244,196,108,0.18)"
                    strokeWidth="1"
                  />
                  <polyline
                    fill="none"
                    stroke={divergenceStatus.color}
                    strokeWidth="1.75"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                    points={sparklinePoints}
                  />
                </svg>
                <div className="flex justify-between font-mono-data text-[9.5px] text-[#727D94] mt-0.5">
                  <span>t = {telemetry.simTime.toFixed(1)}s</span>
                  <span>
                    A: ({telemetry.posA[0].toFixed(1)}, {telemetry.posA[1].toFixed(1)},{' '}
                    {telemetry.posA[2].toFixed(1)})
                  </span>
                </div>
              </div>

              <p className="text-[11.5px] leading-relaxed text-[#A8B2C6]">{preset.description}</p>
            </div>
          </div>
        )}
      </div>

      {/* Compact Butterfly Intuition Strip */}
      {compact && (
        <div className="px-3 sm:px-4 py-2 border-t hairline-rule bg-[#0B0C12]/90 flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#A8B2C6]">
          <span className="leading-snug">{preset.description}</span>
        </div>
      )}
    </div>
  );
}

export default LorenzAttractor3D;
