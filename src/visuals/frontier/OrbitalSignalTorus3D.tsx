import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { Pause, Play, Radio, RotateCcw, Sparkles } from 'lucide-react';
import { WebGLErrorBoundary } from '../../components/WebGLErrorBoundary';
import { useReducedMotion } from '../../hooks/useReducedMotion';

export type OrbitalManifoldId = 0 | 1 | 2 | 3;

interface ManifoldMeta {
  id: OrbitalManifoldId;
  label: string;
  shortLabel: string;
  formula: string;
  sublabel: string;
  anchors: [number, number, number][];
}

const MANIFOLDS: ManifoldMeta[] = [
  {
    id: 0,
    label: 'Toroidal String Flux',
    shortLabel: 'Toroidal Flux',
    formula: 'X^μ(τ, σ) · S¹ × S¹ Compactification',
    sublabel: 'Tilted 3D flux vortex circling the incandescent Calabi-Yau throat',
    anchors: [
      [1.24, 0.06, 0.25],
      [-2.25, 0.22, -1.02],
      [2.52, 0.18, -0.74],
      [0.68, -0.18, 2.35],
    ],
  },
  {
    id: 1,
    label: 'Hopf Fiber Rings',
    shortLabel: 'Hopf Fibers',
    formula: 'S¹ ↪ S³ → S² Stereographic Link',
    sublabel: 'Nested Villarceau circles twisting through four-dimensional space',
    anchors: [
      [0.92, 0.35, 0.15],
      [-1.85, 0.55, -0.68],
      [1.92, 0.48, -0.62],
      [0.45, -0.62, 1.85],
    ],
  },
  {
    id: 2,
    label: 'Golden Spiral Plume',
    shortLabel: 'Golden Plume',
    formula: 'r(θ) = a · e^(bθ) Exponential Flare',
    sublabel: 'Golden-amber-coral harmonic trajectory expanding across scale',
    anchors: [
      [-1.75, -1.15, 0.15],
      [-0.35, -0.35, -0.45],
      [1.55, 1.15, 0.35],
      [0.55, -0.85, 0.95],
    ],
  },
  {
    id: 3,
    label: 'Lorenz Chaos Cloud',
    shortLabel: 'Lorenz Cloud',
    formula: 'dx/dt = σ(y−x), dz/dt = xy − βz',
    sublabel: 'Dual strange attractor wings modeling non-linear string perturbations',
    anchors: [
      [0.05, 0.15, 0.12],
      [-1.65, 0.65, -0.52],
      [1.72, 0.58, 0.48],
      [0.35, -0.95, 1.15],
    ],
  },
];

const CALLOUT_DEFS = [
  {
    title: 'CALABI-YAU THROAT',
    metric: 'R_min ≈ 1.6×10⁻³⁵ m',
    accent: '#FFE29E',
    cardPos: { x: 14, y: 18 },
    cardAnchorSide: 'right' as const,
  },
  {
    title: 'FUNDAMENTAL MODE n=1',
    metric: 'E₁ = ℏω · sin(πσ/L)',
    accent: '#F4C46C',
    cardPos: { x: 14, y: 74 },
    cardAnchorSide: 'right' as const,
  },
  {
    title: 'RICCI-FLAT R_uv = 0',
    metric: 'SU(3) Holonomy · 6D',
    accent: '#46D6E8',
    cardPos: { x: 86, y: 20 },
    cardAnchorSide: 'left' as const,
  },
  {
    title: 'COUPLING g_s',
    metric: 'g_s = e^Φ = 0.24',
    accent: '#FF8563',
    cardPos: { x: 86, y: 76 },
    cardAnchorSide: 'left' as const,
  },
];

const MODE_EXCITONS = [
  { label: 'PHOTON γ (n=1)', weight: 0.94, color: '#FFE29E' },
  { label: 'GRAVITON G (n=2)', weight: 0.81, color: '#F4C46C' },
  { label: 'QUARK TRIPLET', weight: 0.68, color: '#46D6E8' },
  { label: 'GLUON OCTET', weight: 0.57, color: '#45E6A6' },
  { label: 'KK TOWER m=1', weight: 0.44, color: '#FF8563' },
  { label: 'DILATON Φ', weight: 0.36, color: '#B88938' },
];

function createPrng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s += 0x6d2b79f5;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface ParticleManifoldBuffers {
  pos0: Float32Array;
  pos1: Float32Array;
  pos2: Float32Array;
  pos3: Float32Array;
  meta: Float32Array; // [role, strandNorm, energy, seed]
}

function buildParticleManifoldBuffers(count: number): ParticleManifoldBuffers {
  const rand = createPrng(20261124);
  const pos0 = new Float32Array(count * 3);
  const pos1 = new Float32Array(count * 3);
  const pos2 = new Float32Array(count * 3);
  const pos3 = new Float32Array(count * 3);
  const meta = new Float32Array(count * 4);

  // Precompute 20 Lorenz orbits for Mode 3
  const lorenzCount = 20;
  const stepsPerOrbit = Math.ceil(count / lorenzCount);
  const lorenzPts = new Float32Array(count * 3);
  {
    const sigma = 10;
    const rho = 28;
    const beta = 8 / 3;
    const dt = 0.0062;
    let writeIdx = 0;
    for (let orb = 0; orb < lorenzCount && writeIdx < count; orb++) {
      let lx = 1.2 + (orb - lorenzCount / 2) * 0.11;
      let ly = 1.4 + Math.sin(orb * 0.7) * 0.4;
      let lz = 22.0 + Math.cos(orb * 0.5) * 0.5;
      // Burn-in
      for (let b = 0; b < 380; b++) {
        const dx = sigma * (ly - lx);
        const dy = lx * (rho - lz) - ly;
        const dz = lx * ly - beta * lz;
        lx += dx * dt;
        ly += dy * dt;
        lz += dz * dt;
      }
      for (let st = 0; st < stepsPerOrbit && writeIdx < count; st++) {
        const dx = sigma * (ly - lx);
        const dy = lx * (rho - lz) - ly;
        const dz = lx * ly - beta * lz;
        lx += dx * dt;
        ly += dy * dt;
        lz += dz * dt;
        const jx = (rand() - 0.5) * 0.095;
        const jy = (rand() - 0.5) * 0.095;
        const jz = (rand() - 0.5) * 0.095;
        lorenzPts[writeIdx * 3] = lx * 0.115 + jx;
        lorenzPts[writeIdx * 3 + 1] = (lz - 25.0) * 0.105 + jy;
        lorenzPts[writeIdx * 3 + 2] = ly * 0.105 + jz;
        writeIdx++;
      }
    }
  }

  const hopfBands = [0.27, 0.51, 0.76, 1.04];
  const hopfLongitudes = 11;
  const totalHopfFibers = hopfBands.length * hopfLongitudes;

  for (let i = 0; i < count; i++) {
    const frac = i / count;
    const i3 = i * 3;
    const i4 = i * 4;

    // ---------------------------------------------------------
    // MODE 0: Toroidal String Flux (f_03.jpg inspired)
    // ---------------------------------------------------------
    let role = 0.5;
    let energy = 0.5;
    let strandNorm = (i % 64) / 64;

    if (frac < 0.2) {
      // Bright incandescent inner Singularity Core ring + twin plasma cusps
      const phi = rand() * Math.PI * 2;
      const isCusp = rand() < 0.24;
      const cuspBoost = isCusp ? Math.pow(Math.abs(Math.sin(phi - 0.35)), 6.0) : 0;
      const rCore = 1.2 + (rand() - 0.5) * 0.11 + cuspBoost * 0.42;
      const yCore = (rand() - 0.5) * 0.06 + cuspBoost * (0.28 + rand() * 0.25);
      pos0[i3] = Math.cos(phi) * rCore;
      pos0[i3 + 1] = yCore;
      pos0[i3 + 2] = Math.sin(phi) * rCore;
      role = 0.08 + cuspBoost * 0.08;
      energy = 0.92 + rand() * 0.08;
    } else if (frac < 0.85) {
      // 64 Coiled toroidal stream filaments spiraling outward from the throat
      const strand = i % 64;
      const u = rand() * Math.PI * 2;
      const v = u * 2.0 + strand * ((Math.PI * 2) / 64) * 3.0 + (rand() - 0.5) * 0.18;
      const radialBias = Math.pow(rand(), 0.72);
      const R = 2.65;
      const a = 1.48 * (0.35 + 0.65 * radialBias);
      const b = 0.52 * (0.35 + 0.65 * radialBias);

      const cosV = Math.cos(v);
      const sinV = Math.sin(v);
      const ringR = Math.max(1.16, R + a * cosV);
      const throatDip = -0.34 * Math.exp(-Math.pow((ringR - 1.28) * 1.6, 2));
      const spread = 0.042 * (rand() - 0.5);

      pos0[i3] = Math.cos(u) * (ringR + spread);
      pos0[i3 + 1] = b * sinV + throatDip + (rand() - 0.5) * 0.055;
      pos0[i3 + 2] = Math.sin(u) * (ringR + spread);

      role = 0.48;
      energy = 0.45 + 0.5 * (1.0 - Math.min(1, (ringR - 1.16) / 3.0));
      strandNorm = strand / 64;
    } else {
      // Outer cosmic halo dust & sparse orbital motes
      const phi = rand() * Math.PI * 2;
      const rHalo = 1.7 + rand() * 3.35;
      const yHalo = (rand() - 0.5) * (0.35 + 0.35 * (rHalo / 4.5));
      pos0[i3] = Math.cos(phi) * rHalo;
      pos0[i3 + 1] = yHalo;
      pos0[i3 + 2] = Math.sin(phi) * rHalo;
      role = 0.9;
      energy = 0.25 + rand() * 0.45;
    }

    // ---------------------------------------------------------
    // MODE 1: Hopf Fiber Rings (Stereographic S^3 -> S^2)
    // ---------------------------------------------------------
    {
      const fiberIdx = i % totalHopfFibers;
      const bandIdx = Math.floor(fiberIdx / hopfLongitudes);
      const lonIdx = fiberIdx % hopfLongitudes;
      const eta = hopfBands[bandIdx] + (rand() - 0.5) * 0.02;
      const phi = (lonIdx / hopfLongitudes) * Math.PI * 2 + bandIdx * 0.35;
      const xi = rand() * Math.PI * 2;

      const x1 = Math.cos(eta) * Math.cos(xi + phi);
      const x2 = Math.cos(eta) * Math.sin(xi + phi);
      const x3 = Math.sin(eta) * Math.cos(xi);
      const x4 = Math.sin(eta) * Math.sin(xi);

      const denom = Math.max(0.35, 1.38 - x4);
      const scale = 1.52 / denom;
      pos1[i3] = x1 * scale + (rand() - 0.5) * 0.032;
      pos1[i3 + 1] = x3 * scale * 0.92 + (rand() - 0.5) * 0.032;
      pos1[i3 + 2] = x2 * scale + (rand() - 0.5) * 0.032;
    }

    // ---------------------------------------------------------
    // MODE 2: Golden Spiral Plume (f_09.jpg inspired)
    // ---------------------------------------------------------
    {
      const t = Math.pow(rand(), 0.78);
      const expFactor = (Math.exp(3.15 * t) - 1) / (Math.exp(3.15) - 1);
      const bx = -3.25 + 5.75 * t;
      const by = -1.62 + 3.85 * expFactor;
      const bz = 0.72 * Math.sin(t * Math.PI * 2.3) * Math.pow(t, 1.15);

      const arm = i % 14;
      const helixAngle = t * 14.0 + arm * ((Math.PI * 2) / 14) + rand() * 0.35;
      const spread = (0.03 + 1.38 * Math.pow(t, 1.85)) * Math.pow(rand(), 0.65);

      pos2[i3] = bx + Math.cos(helixAngle) * spread * 0.62;
      pos2[i3 + 1] = by + Math.sin(helixAngle) * spread * 0.48;
      pos2[i3 + 2] = bz + Math.sin(helixAngle * 1.3) * spread * 0.95;
    }

    // ---------------------------------------------------------
    // MODE 3: Lorenz Chaos Cloud
    // ---------------------------------------------------------
    pos3[i3] = lorenzPts[i3];
    pos3[i3 + 1] = lorenzPts[i3 + 1];
    pos3[i3 + 2] = lorenzPts[i3 + 2];

    meta[i4] = role;
    meta[i4 + 1] = strandNorm;
    meta[i4 + 2] = energy;
    meta[i4 + 3] = rand();
  }

  return { pos0, pos1, pos2, pos3, meta };
}

const VERTEX_SHADER = /* glsl */ `
  attribute vec3 aPos0;
  attribute vec3 aPos1;
  attribute vec3 aPos2;
  attribute vec3 aPos3;
  attribute vec4 aMeta;

  uniform float uTime;
  uniform float uFromIdx;
  uniform float uToIdx;
  uniform float uMorph;
  uniform float uPixelRatio;
  uniform float uDensityScale;
  uniform vec3 uPulseOrigin;
  uniform float uPulseTime;
  uniform float uPulseActive;

  varying vec3 vColor;
  varying float vAlpha;
  varying float vBoost;

  vec3 pickPos(float idx) {
    if (idx < 0.5) return aPos0;
    if (idx < 1.5) return aPos1;
    if (idx < 2.5) return aPos2;
    return aPos3;
  }

  vec3 pickColor(float idx, vec3 p) {
    float role = aMeta.x;
    float strand = aMeta.y;
    float energy = aMeta.z;
    float seed = aMeta.w;

    vec3 champagne = vec3(0.957, 0.769, 0.424); // #F4C46C
    vec3 starGold  = vec3(1.000, 0.886, 0.620); // #FFE29E
    vec3 brass     = vec3(0.722, 0.537, 0.220); // #B88938
    vec3 ivory     = vec3(0.969, 0.957, 0.925); // #F7F4EC
    vec3 cyan      = vec3(0.275, 0.839, 0.910); // #46D6E8
    vec3 coral     = vec3(1.000, 0.522, 0.388); // #FF8563
    vec3 jade      = vec3(0.271, 0.902, 0.651); // #45E6A6

    if (idx < 0.5) {
      // Toroidal String Flux
      if (role < 0.22) {
        return mix(starGold, ivory, 0.48 + 0.35 * sin(seed * 12.0 + uTime * 2.0));
      }
      if (role > 0.78) {
        return mix(brass, cyan, step(0.76, seed) * 0.75);
      }
      vec3 base = mix(brass, champagne, energy);
      if (strand > 0.82) base = mix(base, cyan, 0.55);
      else if (strand < 0.14) base = mix(base, coral, 0.48);
      return mix(base, starGold, 0.22 * sin(uTime * 1.4 + seed * 6.28) + 0.22);
    }

    if (idx < 1.5) {
      // Hopf Fiber Rings
      float band = fract(strand * 4.0);
      vec3 c = mix(champagne, cyan, smoothstep(0.25, 0.78, band));
      if (seed > 0.85) c = mix(c, ivory, 0.5);
      return mix(c, starGold, 0.28);
    }

    if (idx < 2.5) {
      // Golden Spiral Plume (f_09.jpg inspired)
      float t = clamp((p.x + 3.25) / 5.75, 0.0, 1.0);
      vec3 c = mix(ivory, starGold, smoothstep(0.0, 0.24, t));
      c = mix(c, coral, smoothstep(0.18, 0.68, t));
      c = mix(c, champagne, smoothstep(0.55, 0.95, t));
      if (seed > 0.88 && t > 0.35) c = mix(c, jade, 0.72);
      return c;
    }

    // Lorenz Chaos Cloud
    float wing = smoothstep(-1.4, 1.4, p.x);
    vec3 c = mix(coral, champagne, wing * 0.7);
    c = mix(c, cyan, (1.0 - wing) * 0.55 * step(0.45, seed));
    return mix(c, starGold, energy * 0.35);
  }

  vec3 rotateY(vec3 p, float a) {
    float c = cos(a);
    float s = sin(a);
    return vec3(p.x * c - p.z * s, p.y, p.x * s + p.z * c);
  }

  void main() {
    float m = smoothstep(0.0, 1.0, uMorph);
    vec3 pFrom = pickPos(uFromIdx);
    vec3 pTo = pickPos(uToIdx);
    vec3 pos = mix(pFrom, pTo, m);

    // Subtle helical swirl during morph transition
    float transSwirl = sin(m * 3.14159265) * 0.42;
    pos = rotateY(pos, transSwirl * (0.5 + aMeta.w));

    // Continuous manifold streaming motion
    float rXZ = length(pos.xz);
    float flowFrom = uFromIdx < 0.5 ? 1.0 : 0.0;
    float flowTo = uToIdx < 0.5 ? 1.0 : 0.0;
    float torusWeight = mix(flowFrom, flowTo, m);

    if (torusWeight > 0.01) {
      float omega = (0.24 + 0.58 / (0.48 + rXZ)) * torusWeight;
      pos = rotateY(pos, uTime * omega);
      pos.y += sin(uTime * 1.5 + aMeta.y * 12.0 + rXZ * 1.4) * 0.032 * torusWeight;
    } else {
      float drift = sin(uTime * 0.9 + aMeta.w * 6.2831) * 0.026;
      pos += normalize(pos + vec3(0.0001)) * drift;
    }

    // Radial click shockwave
    float boost = 0.0;
    if (uPulseActive > 0.5) {
      vec3 delta = pos - uPulseOrigin;
      float d = length(delta);
      float waveR = uPulseTime * 5.6;
      float fade = max(0.0, 1.0 - uPulseTime / 2.2);
      float ring = exp(-pow((d - waveR) * 2.1, 2.0)) * fade;
      pos += normalize(delta + vec3(0.0001)) * ring * 0.36;
      boost = ring;
    }

    vec3 cFrom = pickColor(uFromIdx, pos);
    vec3 cTo = pickColor(uToIdx, pos);
    vColor = mix(cFrom, cTo, m);
    vColor = mix(vColor, vec3(0.97, 0.98, 1.0), boost * 0.65);

    float coreBright = (aMeta.x < 0.22 && torusWeight > 0.3) ? 1.45 : 1.0;
    vAlpha = (0.22 + 0.34 * aMeta.z) * uDensityScale * coreBright + boost * 0.55;
    vBoost = boost;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    float baseSize = (aMeta.x < 0.22 ? 2.25 : 1.55) + aMeta.w * 1.1 + boost * 3.6;
    gl_PointSize = clamp(baseSize * uPixelRatio * (9.2 / max(1.0, -mvPosition.z)), 1.1, 14.0);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const FRAGMENT_SHADER = /* glsl */ `
  varying vec3 vColor;
  varying float vAlpha;
  varying float vBoost;

  void main() {
    vec2 uv = gl_PointCoord - vec2(0.5);
    float d = length(uv) * 2.0;
    if (d > 1.0) discard;

    float soft = pow(1.0 - d, 2.15);
    float core = exp(-d * d * 7.5);
    float intensity = soft * 0.62 + core * 0.78;
    vec3 col = mix(vColor, vec3(1.0, 0.96, 0.86), core * 0.35 + vBoost * 0.3);

    gl_FragColor = vec4(col, clamp(vAlpha * intensity, 0.0, 1.0));
  }
`;

export function OrbitalSignalTorus3D({
  compact = false,
  heightClass,
}: {
  compact?: boolean;
  heightClass?: string;
}) {
  const reducedMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasHostRef = useRef<HTMLDivElement | null>(null);

  const [isNearViewport, setIsNearViewport] = useState(false);
  const [webglError, setWebglError] = useState<string | null>(null);
  const [activeMode, setActiveMode] = useState<OrbitalManifoldId>(0);
  const [autoMorph, setAutoMorph] = useState(true);
  const [playing, setPlaying] = useState(true);
  const [fps, setFps] = useState(60);
  const [pulseCount, setPulseCount] = useState(0);
  const [matrixTick, setMatrixTick] = useState(0);

  const particleCount = compact ? 36000 : 60000;
  const resolvedHeight =
    heightClass ?? (compact ? 'h-[430px] sm:h-[510px]' : 'h-[580px] sm:h-[660px] lg:h-[700px]');

  // Mutable animation & interaction state kept out of React render loop
  const stateRef = useRef({
    fromIdx: 0 as OrbitalManifoldId,
    toIdx: 0 as OrbitalManifoldId,
    morph: 1,
    morphing: false,
    yaw: 0.32,
    pitch: 0.44,
    velYaw: 0,
    velPitch: 0,
    targetParallaxX: 0,
    targetParallaxY: 0,
    parallaxX: 0,
    parallaxY: 0,
    time: 0,
    pulseActive: 0,
    pulseTime: 0,
    pulseOrigin: new THREE.Vector3(0, 0, 0),
    playing: true,
    reduced: false,
  });

  useEffect(() => {
    stateRef.current.playing = playing;
    stateRef.current.reduced = reducedMotion;
  }, [playing, reducedMotion]);

  // SVG leader line DOM refs for zero-re-render 60fps tracking
  const leaderPolyRefs = useRef<(SVGPolylineElement | null)[]>([]);
  const leaderDotRefs = useRef<(SVGCircleElement | null)[]>([]);
  const coreLabelRef = useRef<HTMLDivElement | null>(null);

  // Trigger smooth GPU morph between manifolds
  const switchManifold = useCallback((nextId: OrbitalManifoldId) => {
    setActiveMode((prev) => {
      if (prev === nextId) return prev;
      const st = stateRef.current;
      st.fromIdx = st.morph > 0.5 ? st.toIdx : st.fromIdx;
      st.toIdx = nextId;
      st.morph = 0;
      st.morphing = true;
      return nextId;
    });
  }, []);

  // Auto-morph timer when enabled
  useEffect(() => {
    if (!autoMorph || !playing || reducedMotion || !isNearViewport) return;
    const timer = window.setInterval(() => {
      setActiveMode((prev) => {
        const next = ((prev + 1) % 4) as OrbitalManifoldId;
        const st = stateRef.current;
        st.fromIdx = st.toIdx;
        st.toIdx = next;
        st.morph = 0;
        st.morphing = true;
        return next;
      });
    }, 7600);
    return () => window.clearInterval(timer);
  }, [autoMorph, playing, reducedMotion, isNearViewport]);

  // Subtle 6x6 Golden Coupling Matrix animation tick (low frequency, zero 3D overhead)
  useEffect(() => {
    if (!isNearViewport || !playing || reducedMotion || compact) return;
    const id = window.setInterval(() => {
      setMatrixTick((t) => (t + 1) % 1000);
    }, 450);
    return () => window.clearInterval(id);
  }, [isNearViewport, playing, reducedMotion, compact]);

  // IntersectionObserver (rootMargin: '200px') so WebGL mounts ONLY near viewport
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          setIsNearViewport(entry.isIntersecting);
        }
      },
      { rootMargin: '200px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const triggerCenterPulse = useCallback(() => {
    const st = stateRef.current;
    st.pulseOrigin.set(0, 0, 0);
    st.pulseTime = 0;
    st.pulseActive = 1;
    setPulseCount((c) => c + 1);
  }, []);

  const resetView = useCallback(() => {
    const st = stateRef.current;
    st.yaw = 0.32;
    st.pitch = 0.44;
    st.velYaw = 0;
    st.velPitch = 0;
    st.parallaxX = 0;
    st.parallaxY = 0;
  }, []);

  // Main Three.js WebGL lifecycle bound to isNearViewport
  useEffect(() => {
    if (!isNearViewport) return;
    const host = canvasHostRef.current;
    if (!host) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        powerPreference: 'high-performance',
        alpha: false,
      });
    } catch (err) {
      setWebglError(err instanceof Error ? err.message : 'Unable to initialize WebGL context.');
      return;
    }

    setWebglError(null);
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    renderer.setPixelRatio(dpr);
    renderer.setClearColor(0x060609, 1);

    const initW = Math.max(300, host.clientWidth || 720);
    const initH = Math.max(260, host.clientHeight || 520);
    renderer.setSize(initW, initH);
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(44, initW / initH, 0.1, 60);
    camera.position.set(0, 0.35, compact ? 7.9 : 8.4);

    const rootGroup = new THREE.Group();
    scene.add(rootGroup);

    // Build 4-manifold particle buffers
    const buffers = buildParticleManifoldBuffers(particleCount);
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(buffers.pos0, 3));
    geometry.setAttribute('aPos0', new THREE.BufferAttribute(buffers.pos0, 3));
    geometry.setAttribute('aPos1', new THREE.BufferAttribute(buffers.pos1, 3));
    geometry.setAttribute('aPos2', new THREE.BufferAttribute(buffers.pos2, 3));
    geometry.setAttribute('aPos3', new THREE.BufferAttribute(buffers.pos3, 3));
    geometry.setAttribute('aMeta', new THREE.BufferAttribute(buffers.meta, 4));

    const uniforms = {
      uTime: { value: 0 },
      uFromIdx: { value: 0 },
      uToIdx: { value: 0 },
      uMorph: { value: 1 },
      uPixelRatio: { value: dpr },
      uDensityScale: { value: compact ? 0.36 : 0.27 },
      uPulseOrigin: { value: new THREE.Vector3(0, 0, 0) },
      uPulseTime: { value: 0 },
      uPulseActive: { value: 0 },
    };

    const material = new THREE.ShaderMaterial({
      vertexShader: VERTEX_SHADER,
      fragmentShader: FRAGMENT_SHADER,
      uniforms,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    const points = new THREE.Points(geometry, material);
    rootGroup.add(points);

    // Crisp equatorial singularity horizon ring guide
    const ringGeom = new THREE.RingGeometry(1.19, 1.215, 128);
    ringGeom.rotateX(-Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xffe29e,
      transparent: true,
      opacity: 0.42,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const innerRingMesh = new THREE.Mesh(ringGeom, ringMat);
    rootGroup.add(innerRingMesh);

    // Pointer interaction (smooth drag orbit + hover parallax + click radial pulse)
    let dragging = false;
    let downX = 0;
    let downY = 0;
    let lastX = 0;
    let lastY = 0;
    let totalMove = 0;

    const raycaster = new THREE.Raycaster();
    const pointerNdc = new THREE.Vector2();
    const hitPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    const hitVec = new THREE.Vector3();

    const onPointerDown = (e: PointerEvent) => {
      dragging = true;
      downX = e.clientX;
      downY = e.clientY;
      lastX = e.clientX;
      lastY = e.clientY;
      totalMove = 0;
      renderer.domElement.setPointerCapture?.(e.pointerId);
    };

    const onPointerMove = (e: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / Math.max(1, rect.width)) * 2 - 1;
      const ny = -(((e.clientY - rect.top) / Math.max(1, rect.height)) * 2 - 1);
      stateRef.current.targetParallaxX = nx * 0.16;
      stateRef.current.targetParallaxY = ny * 0.12;

      if (!dragging) return;
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      totalMove += Math.hypot(dx, dy);
      lastX = e.clientX;
      lastY = e.clientY;

      stateRef.current.velYaw = dx * 0.0065;
      stateRef.current.velPitch = dy * 0.0055;
      stateRef.current.yaw += stateRef.current.velYaw;
      stateRef.current.pitch = THREE.MathUtils.clamp(
        stateRef.current.pitch + stateRef.current.velPitch,
        -1.15,
        1.15
      );
    };

    const onPointerUp = (e: PointerEvent) => {
      if (!dragging) return;
      dragging = false;
      renderer.domElement.releasePointerCapture?.(e.pointerId);

      // Treat short taps/clicks as radial harmonic pulse shockwave
      if (totalMove < 6 && Math.hypot(e.clientX - downX, e.clientY - downY) < 6) {
        const rect = renderer.domElement.getBoundingClientRect();
        pointerNdc.set(
          ((e.clientX - rect.left) / Math.max(1, rect.width)) * 2 - 1,
          -(((e.clientY - rect.top) / Math.max(1, rect.height)) * 2 - 1)
        );
        raycaster.setFromCamera(pointerNdc, camera);
        const normal = new THREE.Vector3(0, 1, 0).applyEuler(rootGroup.rotation).normalize();
        hitPlane.set(normal, 0);
        if (raycaster.ray.intersectPlane(hitPlane, hitVec)) {
          rootGroup.worldToLocal(hitVec);
          if (hitVec.length() > 4.5) hitVec.setLength(4.5);
          stateRef.current.pulseOrigin.copy(hitVec);
        } else {
          stateRef.current.pulseOrigin.set(0, 0, 0);
        }
        stateRef.current.pulseTime = 0;
        stateRef.current.pulseActive = 1;
        setPulseCount((c) => c + 1);
      }
    };

    const dom = renderer.domElement;
    dom.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);

    let width = initW;
    let height = initH;
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const nextW = Math.max(260, Math.floor(entry.contentRect.width));
        const nextH = Math.max(240, Math.floor(entry.contentRect.height));
        if (nextW !== width || nextH !== height) {
          width = nextW;
          height = nextH;
          camera.aspect = width / height;
          camera.updateProjectionMatrix();
          renderer.setSize(width, height);
        }
      }
    });
    resizeObserver.observe(host);

    let hidden = document.hidden;
    const onVisChange = () => {
      hidden = document.hidden;
    };
    document.addEventListener('visibilitychange', onVisChange);

    // Scratch vectors for 3D -> 2D HUD leader line projection
    const projVec = new THREE.Vector3();
    const coreVec = new THREE.Vector3();

    let rafId = 0;
    let lastNow = performance.now();
    let fpsFrames = 0;
    let fpsClock = lastNow;

    const animate = (now: number) => {
      rafId = requestAnimationFrame(animate);
      const dt = Math.min(0.05, Math.max(0.001, (now - lastNow) / 1000));
      lastNow = now;
      if (hidden) return;

      const st = stateRef.current;
      const shouldStep = st.playing && !st.reduced;

      if (shouldStep) {
        st.time += dt;
        if (!dragging) {
          st.yaw += dt * 0.14 + st.velYaw;
          st.pitch = THREE.MathUtils.clamp(st.pitch + st.velPitch, -1.15, 1.15);
          st.velYaw *= 0.92;
          st.velPitch *= 0.92;
        }
      } else if (!dragging) {
        st.yaw += st.velYaw;
        st.pitch = THREE.MathUtils.clamp(st.pitch + st.velPitch, -1.15, 1.15);
        st.velYaw *= 0.9;
        st.velPitch *= 0.9;
      }

      st.parallaxX += (st.targetParallaxX - st.parallaxX) * 0.08;
      st.parallaxY += (st.targetParallaxY - st.parallaxY) * 0.08;

      if (st.morphing) {
        st.morph = Math.min(1, st.morph + dt * 0.72);
        if (st.morph >= 1) {
          st.morph = 1;
          st.morphing = false;
          st.fromIdx = st.toIdx;
        }
      }

      if (st.pulseActive > 0.5) {
        st.pulseTime += dt;
        if (st.pulseTime > 2.25) {
          st.pulseActive = 0;
          st.pulseTime = 0;
        }
      }

      rootGroup.rotation.order = 'YXZ';
      rootGroup.rotation.y = st.yaw + st.parallaxX;
      rootGroup.rotation.x = st.pitch - st.parallaxY;
      rootGroup.rotation.z = -0.14;
      rootGroup.updateMatrixWorld();

      // Fade inner horizon ring gracefully outside Toroidal Flux mode
      const torusRatio =
        st.toIdx === 0 && st.fromIdx === 0
          ? 1
          : st.toIdx === 0
            ? st.morph
            : st.fromIdx === 0
              ? 1 - st.morph
              : 0;
      ringMat.opacity = 0.42 * torusRatio;
      innerRingMesh.visible = torusRatio > 0.02;

      uniforms.uTime.value = st.time;
      uniforms.uFromIdx.value = st.fromIdx;
      uniforms.uToIdx.value = st.toIdx;
      uniforms.uMorph.value = st.morph;
      uniforms.uPulseOrigin.value.copy(st.pulseOrigin);
      uniforms.uPulseTime.value = st.pulseTime;
      uniforms.uPulseActive.value = st.pulseActive;

      renderer.render(scene, camera);

      // Update SVG leader lines connecting 4 callouts to projected 3D ring anchors
      const activeManifold = MANIFOLDS[st.toIdx];
      for (let i = 0; i < CALLOUT_DEFS.length; i++) {
        const poly = leaderPolyRefs.current[i];
        const dot = leaderDotRefs.current[i];
        if (!poly || !dot) continue;

        const fromA = MANIFOLDS[st.fromIdx].anchors[i];
        const toA = activeManifold.anchors[i];
        const m = st.morph;
        projVec.set(
          THREE.MathUtils.lerp(fromA[0], toA[0], m),
          THREE.MathUtils.lerp(fromA[1], toA[1], m),
          THREE.MathUtils.lerp(fromA[2], toA[2], m)
        );
        projVec.applyMatrix4(rootGroup.matrixWorld).project(camera);

        const ax = THREE.MathUtils.clamp((projVec.x * 0.5 + 0.5) * width, 24, width - 24);
        const ay = THREE.MathUtils.clamp((-projVec.y * 0.5 + 0.5) * height, 24, height - 24);

        const def = CALLOUT_DEFS[i];
        const cx = (def.cardPos.x / 100) * width;
        const cy = (def.cardPos.y / 100) * height;
        const elbowX = def.cardAnchorSide === 'right' ? cx + (ax - cx) * 0.35 : cx + (ax - cx) * 0.35;
        const pointsStr = `${cx.toFixed(1)},${cy.toFixed(1)} ${elbowX.toFixed(1)},${cy.toFixed(1)} ${ax.toFixed(1)},${ay.toFixed(1)}`;
        poly.setAttribute('points', pointsStr);
        dot.setAttribute('cx', ax.toFixed(1));
        dot.setAttribute('cy', ay.toFixed(1));
      }

      if (coreLabelRef.current) {
        coreVec.set(0, -0.38, 0).applyMatrix4(rootGroup.matrixWorld).project(camera);
        const sx = THREE.MathUtils.clamp((coreVec.x * 0.5 + 0.5) * width, 80, width - 80);
        const sy = THREE.MathUtils.clamp((-coreVec.y * 0.5 + 0.5) * height, 40, height - 40);
        coreLabelRef.current.style.transform = `translate3d(${sx.toFixed(1)}px, ${sy.toFixed(1)}px, 0) translate(-50%, -50%)`;
        coreLabelRef.current.style.opacity = torusRatio > 0.25 ? String(Math.min(1, torusRatio)) : '0';
      }

      fpsFrames++;
      if (now - fpsClock >= 650) {
        const measured = Math.round((fpsFrames * 1000) / (now - fpsClock));
        setFps(Math.min(120, Math.max(1, measured)));
        fpsFrames = 0;
        fpsClock = now;
      }
    };

    rafId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
      document.removeEventListener('visibilitychange', onVisChange);
      dom.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      geometry.dispose();
      material.dispose();
      ringGeom.dispose();
      ringMat.dispose();
      renderer.dispose();
      dom.remove();
    };
  }, [isNearViewport, particleCount, compact]);

  // 6x6 Golden Coupling Matrix cells
  const couplingCells = useMemo(() => {
    const palette = ['#F4C46C', '#FFE29E', '#B88938', '#46D6E8', '#FF8563', '#45E6A6'];
    const items: { key: number; color: string; opacity: number }[] = [];
    for (let r = 0; r < 6; r++) {
      for (let c = 0; c < 6; c++) {
        const idx = r * 6 + c;
        const wave = Math.sin((r + 1) * 0.8 + (c + 1) * 1.1 + matrixTick * 0.45 + activeMode * 1.3);
        const opacity = 0.22 + 0.74 * (0.5 + 0.5 * wave);
        const colorIdx = (r + c + activeMode) % palette.length;
        items.push({ key: idx, color: palette[colorIdx], opacity });
      }
    }
    return items;
  }, [matrixTick, activeMode]);

  const sparklinePath = useMemo(() => {
    const pts: string[] = [];
    const shift = matrixTick * 0.35 + activeMode * 1.1;
    for (let i = 0; i <= 24; i++) {
      const x = (i / 24) * 160;
      const y = 20 - Math.sin(i * 0.55 + shift) * 9 - Math.cos(i * 1.15 - shift * 0.7) * 5;
      pts.push(`${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`);
    }
    return pts.join(' ');
  }, [matrixTick, activeMode]);

  const activeMeta = MANIFOLDS[activeMode];

  return (
    <div
      ref={containerRef}
      className="relative w-full rounded-2xl overflow-hidden bg-[#060609]"
      style={{
        border: '1px solid rgba(244, 196, 108, 0.17)',
        boxShadow:
          'inset 0 1px 0 rgba(255, 232, 178, 0.22), 0 28px 64px -26px rgba(0, 0, 0, 0.96)',
      }}
    >
      {/* Top HUD Command Strip */}
      <div
        className="relative z-20 flex flex-wrap items-center justify-between gap-2 px-3.5 sm:px-5 py-2.5 bg-[#0B0C12]/90 backdrop-blur-md"
        style={{ borderBottom: '1px solid rgba(244, 196, 108, 0.17)' }}
      >
        <div className="flex items-center gap-2.5">
          <span className="inline-flex h-2 w-2 rounded-full bg-[#F4C46C] shadow-[0_0_10px_#F4C46C]" />
          <span className="font-mono-data text-[10.5px] uppercase tracking-[0.2em] text-[#FFE29E]">
            Orbital Signal Engine
          </span>
          {!compact && (
            <span className="hidden md:inline font-mono-data text-[10px] text-[#A8B2C6] border-l border-[#F4C46C]/20 pl-2.5">
              {activeMeta.formula}
            </span>
          )}
        </div>

        {/* Manifold Mode Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          {MANIFOLDS.map((m) => {
            const active = activeMode === m.id;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => {
                  setAutoMorph(false);
                  switchManifold(m.id);
                }}
                className={`px-2.5 py-1 rounded-full font-mono-data text-[10.5px] transition-all border ${
                  active
                    ? 'text-[#060609] font-semibold'
                    : 'bg-[#11131C]/80 text-[#A8B2C6] hover:text-[#F7F4EC]'
                }`}
                style={{
                  backgroundColor: active ? '#F4C46C' : undefined,
                  borderColor: active ? '#FFE29E' : 'rgba(244, 196, 108, 0.17)',
                  boxShadow: active ? '0 0 18px -4px rgba(244, 196, 108, 0.7)' : undefined,
                }}
              >
                {compact ? m.shortLabel : m.label}
              </button>
            );
          })}
        </div>

        {/* Utility Controls */}
        <div className="flex items-center gap-1.5 font-mono-data text-[10.5px]">
          <button
            type="button"
            onClick={() => setAutoMorph((v) => !v)}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full border transition-colors"
            style={{
              borderColor: autoMorph ? 'rgba(70, 214, 232, 0.45)' : 'rgba(244, 196, 108, 0.17)',
              backgroundColor: autoMorph ? 'rgba(70, 214, 232, 0.12)' : 'rgba(17, 19, 28, 0.8)',
              color: autoMorph ? '#46D6E8' : '#A8B2C6',
            }}
          >
            <Sparkles className="w-3 h-3" />
            <span className="hidden sm:inline">Auto-Morph</span>
          </button>

          <button
            type="button"
            onClick={triggerCenterPulse}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full border border-[#FF8563]/40 bg-[#FF8563]/10 text-[#FF8563] hover:bg-[#FF8563]/20 transition-colors"
            title="Emit radial shockwave"
          >
            <Radio className="w-3 h-3" />
            <span className="hidden sm:inline">Pulse</span>
          </button>

          <button
            type="button"
            onClick={() => setPlaying((p) => !p)}
            aria-label={playing ? 'Pause simulation' : 'Play simulation'}
            className="p-1.5 rounded-full border border-[#F4C46C]/25 bg-[#11131C] text-[#F7F4EC] hover:border-[#F4C46C]/60"
          >
            {playing ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>

          <button
            type="button"
            onClick={resetView}
            aria-label="Reset camera orbit"
            className="p-1.5 rounded-full border border-[#F4C46C]/25 bg-[#11131C] text-[#A8B2C6] hover:text-[#F7F4EC]"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main 3D Observatory Stage + Flanking Telemetry */}
      <div className={`relative w-full ${resolvedHeight} flex bg-[#060609]`}>
        {/* Left Flanking Telemetry (Full mode only) */}
        {!compact && (
          <aside
            className="hidden lg:flex w-56 xl:w-64 shrink-0 flex-col justify-between p-3.5 bg-[#0B0C12]/85 z-10"
            style={{ borderRight: '1px solid rgba(244, 196, 108, 0.17)' }}
          >
            <div className="space-y-3">
              <div
                className="p-3 rounded-xl bg-[#11131C]/90 space-y-2"
                style={{
                  border: '1px solid rgba(244, 196, 108, 0.17)',
                  boxShadow: 'inset 0 1px 0 rgba(255, 232, 178, 0.16)',
                }}
              >
                <div className="flex items-center justify-between text-[10px] font-mono-data">
                  <span className="text-[#F4C46C] uppercase tracking-wider">Harmonic Spectrum</span>
                  <span className="text-[#45E6A6]">LIVE</span>
                </div>
                <svg viewBox="0 0 160 40" className="w-full h-10 overflow-visible">
                  <line x1="0" y1="20" x2="160" y2="20" stroke="rgba(244,196,108,0.14)" strokeWidth="1" />
                  <path d={sparklinePath} fill="none" stroke="#FFE29E" strokeWidth="1.5" />
                </svg>
                <p className="text-[11px] text-[#A8B2C6] leading-snug">{activeMeta.sublabel}</p>
              </div>

              <div
                className="p-3 rounded-xl bg-[#11131C]/90 space-y-2 font-mono-data text-[10.5px]"
                style={{ border: '1px solid rgba(244, 196, 108, 0.17)' }}
              >
                <span className="text-[#46D6E8] uppercase tracking-wider block text-[10px]">
                  Spacetime Compactification
                </span>
                <div className="flex justify-between text-[#A8B2C6]">
                  <span>Total Dimensions</span>
                  <span className="text-[#F7F4EC]">9 + 1 = 10D</span>
                </div>
                <div className="flex justify-between text-[#A8B2C6]">
                  <span>Curled Calabi-Yau</span>
                  <span className="text-[#FFE29E]">6D Compact</span>
                </div>
                <div className="flex justify-between text-[#A8B2C6]">
                  <span>String Scale l_s</span>
                  <span className="text-[#FF8563]">10⁻³⁵ m</span>
                </div>
                <div className="flex justify-between text-[#A8B2C6]">
                  <span>Shockwaves Sent</span>
                  <span className="text-[#45E6A6]">{pulseCount}</span>
                </div>
              </div>
            </div>

            <div
              className="p-3 rounded-xl bg-[#11131C]/90 space-y-1.5 font-mono-data text-[10px]"
              style={{ border: '1px solid rgba(244, 196, 108, 0.17)' }}
            >
              <div className="flex justify-between text-[#A8B2C6]">
                <span>ACTIVE PARTICLES</span>
                <span className="text-[#FFE29E]">{particleCount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-[#A8B2C6]">
                <span>RENDER RATE</span>
                <span className="text-[#45E6A6]">{fps} FPS</span>
              </div>
              <div className="text-[#6F7F99] pt-1 border-t border-[#F4C46C]/15">
                Drag to orbit · Click anywhere on ring to emit radial shockwave
              </div>
            </div>
          </aside>
        )}

        {/* Center WebGL Canvas Viewport + SVG Leader Line Callouts */}
        <div className="relative flex-1 h-full overflow-hidden">
          <WebGLErrorBoundary
            fallbackTitle="Orbital Signal WebGL Unavailable"
            fallbackDescription="Hardware WebGL could not initialize for the 60,000-particle flux engine."
          >
            {webglError ? (
              <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-[#060609]">
                <p className="font-serif-editorial text-lg text-[#F7F4EC] mb-1">
                  WebGL Context Unavailable
                </p>
                <p className="font-mono-data text-xs text-[#A8B2C6] max-w-md">{webglError}</p>
              </div>
            ) : (
              <div
                ref={canvasHostRef}
                className="w-full h-full cursor-grab active:cursor-grabbing select-none"
                aria-label="Interactive 3D particle manifold simulation"
              />
            )}
          </WebGLErrorBoundary>

          {/* Offscreen static placeholder notice before IntersectionObserver mounts WebGL */}
          {!isNearViewport && !webglError && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-[#060609]">
              <span className="font-mono-data text-xs text-[#F4C46C]/70">
                Initializing Observatory Manifold...
              </span>
            </div>
          )}

          {/* Projected SVG Leader Lines */}
          <svg
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 w-full h-full z-10"
          >
            {CALLOUT_DEFS.map((def, i) => (
              <g key={def.title}>
                <polyline
                  ref={(el) => {
                    leaderPolyRefs.current[i] = el;
                  }}
                  points="0,0 0,0 0,0"
                  fill="none"
                  stroke={def.accent}
                  strokeOpacity={0.55}
                  strokeWidth="1"
                />
                <circle
                  ref={(el) => {
                    leaderDotRefs.current[i] = el;
                  }}
                  cx="0"
                  cy="0"
                  r="3.2"
                  fill={def.accent}
                  stroke="#060609"
                  strokeWidth="1"
                />
              </g>
            ))}
          </svg>

          {/* Projected Singularity Core Micro-Label */}
          <div
            ref={coreLabelRef}
            className="pointer-events-none absolute top-0 left-0 z-10 px-2 py-0.5 rounded bg-[#060609]/75 border border-[#FFE29E]/30 font-mono-data text-[9px] uppercase tracking-[0.22em] text-[#FFE29E] transition-opacity duration-300"
            style={{ opacity: 0 }}
          >
            SINGULARITY CORE
          </div>

          {/* 4 Floating 1px Obsidian Glass Callout Cards */}
          <div className="pointer-events-none absolute inset-0 z-10">
            {CALLOUT_DEFS.map((def) => (
              <div
                key={def.title}
                className="absolute -translate-y-1/2 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg bg-[#0B0C12]/88 backdrop-blur-md max-w-[134px] sm:max-w-[195px]"
                style={{
                  left: def.cardAnchorSide === 'right' ? `${def.cardPos.x - 11}%` : undefined,
                  right: def.cardAnchorSide === 'left' ? `${100 - def.cardPos.x - 11}%` : undefined,
                  top: `${def.cardPos.y}%`,
                  border: '1px solid rgba(244, 196, 108, 0.24)',
                  boxShadow: 'inset 0 1px 0 rgba(255, 232, 178, 0.2)',
                }}
              >
                <div className="flex items-center gap-1.5">
                  <span
                    className="w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ backgroundColor: def.accent, boxShadow: `0 0 8px ${def.accent}` }}
                  />
                  <span
                    className="font-mono-data text-[9.5px] sm:text-[10px] font-semibold tracking-wider truncate"
                    style={{ color: def.accent }}
                  >
                    {def.title}
                  </span>
                </div>
                {!compact && (
                  <p className="font-mono-data text-[9.5px] text-[#A8B2C6] mt-0.5 truncate">
                    {def.metric}
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Compact Mode Bottom Readout Pill */}
          {compact && (
            <div className="pointer-events-none absolute bottom-3 left-3 right-3 z-10 flex items-center justify-between gap-2">
              <div
                className="px-2.5 py-1 rounded-full bg-[#0B0C12]/85 font-mono-data text-[10px] text-[#FFE29E]"
                style={{ border: '1px solid rgba(244, 196, 108, 0.22)' }}
              >
                {particleCount.toLocaleString()} pts · {fps} FPS · Drag &amp; Click to Pulse
              </div>
              <div
                className="hidden sm:grid grid-cols-6 gap-0.5 p-1 rounded bg-[#0B0C12]/85"
                style={{ border: '1px solid rgba(244, 196, 108, 0.22)' }}
                aria-hidden="true"
              >
                {couplingCells.slice(0, 12).map((cell) => (
                  <span
                    key={cell.key}
                    className="w-1.5 h-1.5 rounded-[1px]"
                    style={{ backgroundColor: cell.color, opacity: cell.opacity }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Flanking Telemetry (Full mode only): 6x6 Coupling Matrix + Exciton Bars */}
        {!compact && (
          <aside
            className="hidden lg:flex w-56 xl:w-64 shrink-0 flex-col justify-between p-3.5 bg-[#0B0C12]/85 z-10"
            style={{ borderLeft: '1px solid rgba(244, 196, 108, 0.17)' }}
          >
            <div className="space-y-3">
              {/* 6x6 Golden Coupling Matrix */}
              <div
                className="p-3 rounded-xl bg-[#11131C]/90 space-y-2"
                style={{
                  border: '1px solid rgba(244, 196, 108, 0.17)',
                  boxShadow: 'inset 0 1px 0 rgba(255, 232, 178, 0.16)',
                }}
              >
                <div className="flex items-center justify-between font-mono-data text-[10px]">
                  <span className="text-[#FFE29E] uppercase tracking-wider">
                    6×6 Coupling Matrix
                  </span>
                  <span className="text-[#A8B2C6]">g_ij</span>
                </div>
                <div className="grid grid-cols-6 gap-1">
                  {couplingCells.map((cell) => (
                    <div
                      key={cell.key}
                      className="aspect-square rounded-[3px] transition-opacity duration-300"
                      style={{
                        backgroundColor: cell.color,
                        opacity: cell.opacity,
                        boxShadow: cell.opacity > 0.72 ? `0 0 8px ${cell.color}55` : undefined,
                      }}
                    />
                  ))}
                </div>
                <p className="font-mono-data text-[9.5px] text-[#A8B2C6]">
                  6 compactified dimensions govern how vibrational modes mix.
                </p>
              </div>

              {/* Harmonic Exciton Bars */}
              <div
                className="p-3 rounded-xl bg-[#11131C]/90 space-y-2"
                style={{ border: '1px solid rgba(244, 196, 108, 0.17)' }}
              >
                <span className="font-mono-data text-[10px] text-[#F4C46C] uppercase tracking-wider block">
                  String Mode Resonance
                </span>
                <div className="space-y-1.5">
                  {MODE_EXCITONS.map((ex, idx) => {
                    const dynamicMod =
                      0.78 + 0.22 * Math.sin(matrixTick * 0.4 + idx * 0.9 + activeMode);
                    const pct = Math.round(ex.weight * dynamicMod * 100);
                    return (
                      <div key={ex.label} className="space-y-0.5">
                        <div className="flex justify-between font-mono-data text-[9px] text-[#A8B2C6]">
                          <span>{ex.label}</span>
                          <span style={{ color: ex.color }}>{pct}%</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-[#060609] overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-300"
                            style={{
                              width: `${pct}%`,
                              backgroundColor: ex.color,
                              boxShadow: `0 0 8px ${ex.color}66`,
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div
              className="p-2.5 rounded-xl bg-[#11131C]/90 font-mono-data text-[9.5px] text-[#A8B2C6] flex items-center justify-between"
              style={{ border: '1px solid rgba(244, 196, 108, 0.17)' }}
            >
              <span>EULER BOUND</span>
              <span className="text-[#46D6E8]">χ = −6 → 3 FAMILIES</span>
            </div>
          </aside>
        )}
      </div>

      {/* Responsive Compact Bottom Strip for Mobile/Tablet when !compact */}
      {!compact && (
        <div
          className="lg:hidden flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 bg-[#0B0C12] font-mono-data text-[10.5px] text-[#A8B2C6]"
          style={{ borderTop: '1px solid rgba(244, 196, 108, 0.17)' }}
        >
          <span>
            <strong className="text-[#FFE29E]">{particleCount.toLocaleString()}</strong> particles ·{' '}
            <strong className="text-[#45E6A6]">{fps} FPS</strong>
          </span>
          <span>Drag to orbit · Click anywhere to emit radial shockwave</span>
        </div>
      )}
    </div>
  );
}
