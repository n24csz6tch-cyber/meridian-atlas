import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pause, Play, RotateCcw } from 'lucide-react';
import { MathTex } from '../../components/MathTex';
import { useReducedMotion } from '../../hooks/useReducedMotion';

export type VortexMode = 'vortex' | 'lorenz' | 'fourier' | 'complex';
export type FourierShape = 'square' | 'cardioid' | 'trefoil' | 'lemniscate';

interface FourierCoeff {
  freq: number;
  re: number;
  im: number;
  amp: number;
  phase: number;
}

export interface MathVortexCanvasProps {
  mode?: VortexMode;
  onModeChange?: (mode: VortexMode) => void;
  lockedMode?: VortexMode;
  compact?: boolean;
  heightClass?: string;
  interactive?: boolean;
  initialPlaying?: boolean;
}

const MODE_META: Record<
  VortexMode,
  { label: string; badge: string; accent: string; subtitle: string }
> = {
  vortex: {
    label: 'Vector Curl Vortex',
    badge: 'Eigen-Flow Field',
    accent: '#38D4FF',
    subtitle: 'Drag across the manifold to warp curl & divergence',
  },
  lorenz: {
    label: 'Lorenz Butterfly',
    badge: 'Chaos Sensitivity',
    accent: '#F4B956',
    subtitle: 'Two trajectories started Δx₀ = 0.002 apart diverging in 3D',
  },
  fourier: {
    label: 'Fourier Epicycles',
    badge: 'Phasor Synthesis',
    accent: '#34E8A5',
    subtitle: 'Any closed geometric contour decomposed into rotating vectors',
  },
  complex: {
    label: 'Complex Phase Flow',
    badge: 'Zeros & Poles f(z)',
    accent: '#FF785A',
    subtitle: 'Flow lines and phase contours around holomorphic roots & poles',
  },
};

function computeFourierSeries(shape: FourierShape): FourierCoeff[] {
  const M = 160;
  const ptsRe = new Float64Array(M);
  const ptsIm = new Float64Array(M);

  for (let m = 0; m < M; m++) {
    const t = (m / M) * Math.PI * 2;
    let x = 0;
    let y = 0;
    if (shape === 'square') {
      // Closed rounded square parametric wave (superellipse-like high-corner contour)
      const u = (m / M) * 4;
      const seg = Math.floor(u);
      const frac = u - seg;
      const side = 1.05;
      if (seg === 0) {
        x = -side + 2 * side * frac;
        y = -side;
      } else if (seg === 1) {
        x = side;
        y = -side + 2 * side * frac;
      } else if (seg === 2) {
        x = side - 2 * side * frac;
        y = side;
      } else {
        x = -side;
        y = side - 2 * side * frac;
      }
    } else if (shape === 'cardioid') {
      const r = 0.65 * (1 - Math.cos(t));
      x = r * Math.cos(t) + 0.42;
      y = r * Math.sin(t);
    } else if (shape === 'trefoil') {
      x = 0.62 * Math.sin(t) + 0.38 * Math.sin(2 * t);
      y = 0.62 * Math.cos(t) - 0.38 * Math.cos(2 * t);
    } else {
      // Lemniscate of Bernoulli
      const denom = 1 + Math.sin(t) * Math.sin(t);
      x = (1.18 * Math.cos(t)) / denom;
      y = (1.18 * Math.sin(t) * Math.cos(t)) / denom;
    }
    ptsRe[m] = x;
    ptsIm[m] = y;
  }

  const maxHarmonic = 14;
  const coeffs: FourierCoeff[] = [];
  for (let k = -maxHarmonic; k <= maxHarmonic; k++) {
    let sumRe = 0;
    let sumIm = 0;
    for (let m = 0; m < M; m++) {
      const phi = (k * m * Math.PI * 2) / M;
      const c = Math.cos(phi);
      const s = Math.sin(phi);
      // (ptsRe + i ptsIm) * (c - i s)
      sumRe += ptsRe[m] * c + ptsIm[m] * s;
      sumIm += ptsIm[m] * c - ptsRe[m] * s;
    }
    const re = sumRe / M;
    const im = sumIm / M;
    const amp = Math.hypot(re, im);
    if (amp > 0.002) {
      coeffs.push({
        freq: k,
        re,
        im,
        amp,
        phase: Math.atan2(im, re),
      });
    }
  }
  coeffs.sort((a, b) => b.amp - a.amp);
  return coeffs;
}

const LORENZ_MAX_TRAIL = 680;
const VORTEX_PARTICLE_COUNT = 720;
const COMPLEX_PARTICLE_COUNT = 460;

export function MathVortexCanvas({
  mode: controlledMode,
  onModeChange,
  lockedMode,
  compact = false,
  heightClass = 'h-[430px] sm:h-[490px]',
  interactive = true,
  initialPlaying = true,
}: MathVortexCanvasProps) {
  const reducedMotion = useReducedMotion();
  const [internalMode, setInternalMode] = useState<VortexMode>('vortex');
  const activeMode: VortexMode = lockedMode ?? controlledMode ?? internalMode;

  const [playing, setPlaying] = useState(initialPlaying);
  const [omega, setOmega] = useState(1.45); // curl angular frequency
  const [lambda, setLambda] = useState(-0.18); // radial divergence
  const [dipole, setDipole] = useState(false);

  const [rho, setRho] = useState(28);
  const [lorenzDelta, setLorenzDelta] = useState(0.002);

  const [fourierShape, setFourierShape] = useState<FourierShape>('trefoil');
  const [harmonics, setHarmonics] = useState(9);

  const [orbitPoles, setOrbitPoles] = useState(true);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const sizeRef = useRef({ width: 800, height: 460, dpr: 1 });
  const visibleRef = useRef(true);
  const modeRef = useRef<VortexMode>(activeMode);
  const playingRef = useRef<boolean>(playing && !reducedMotion);

  // Synced refs for 60fps Canvas loop without React re-renders
  const paramsRef = useRef({
    omega,
    lambda,
    dipole,
    rho,
    harmonics,
    orbitPoles,
    time: 0,
    yaw: -0.62,
    pitch: 0.12,
    pointerActive: false,
    pointerX: 0, // math coords [-2, 2]
    pointerY: 0,
  });

  useEffect(() => {
    modeRef.current = activeMode;
  }, [activeMode]);

  useEffect(() => {
    playingRef.current = playing && !reducedMotion;
  }, [playing, reducedMotion]);

  useEffect(() => {
    paramsRef.current.omega = omega;
    paramsRef.current.lambda = lambda;
    paramsRef.current.dipole = dipole;
    paramsRef.current.rho = rho;
    paramsRef.current.harmonics = harmonics;
    paramsRef.current.orbitPoles = orbitPoles;
  }, [omega, lambda, dipole, rho, harmonics, orbitPoles]);

  const fourierSeries = useMemo(() => computeFourierSeries(fourierShape), [fourierShape]);
  const fourierSeriesRef = useRef<FourierCoeff[]>(fourierSeries);
  useEffect(() => {
    fourierSeriesRef.current = fourierSeries;
    fourierTrailRef.current.length = 0;
  }, [fourierSeries]);

  // Persistent particle & trajectory buffers
  const vortexParticlesRef = useRef<{
    x: Float32Array;
    y: Float32Array;
    px: Float32Array;
    py: Float32Array;
    age: Float32Array;
    maxAge: Float32Array;
  } | null>(null);

  const lorenzStateRef = useRef({
    a: { x: 0.1, y: 0, z: 0 },
    b: { x: 0.102, y: 0, z: 0 },
    trailA: [] as [number, number, number][],
    trailB: [] as [number, number, number][],
    frameSkip: 0,
  });

  const fourierTrailRef = useRef<{ x: number; y: number }[]>([]);

  const complexParticlesRef = useRef<{
    x: Float32Array;
    y: Float32Array;
    px: Float32Array;
    py: Float32Array;
    age: Float32Array;
  } | null>(null);

  const resetVortexParticles = useCallback(() => {
    const N = VORTEX_PARTICLE_COUNT;
    const x = new Float32Array(N);
    const y = new Float32Array(N);
    const px = new Float32Array(N);
    const py = new Float32Array(N);
    const age = new Float32Array(N);
    const maxAge = new Float32Array(N);
    for (let i = 0; i < N; i++) {
      const ang = (i * 2.39996) % (Math.PI * 2);
      const rad = 0.25 + 2.3 * Math.sqrt(((i * 73) % N) / N);
      x[i] = Math.cos(ang) * rad;
      y[i] = Math.sin(ang) * rad;
      px[i] = x[i];
      py[i] = y[i];
      age[i] = (i * 3) % 160;
      maxAge[i] = 110 + ((i * 19) % 90);
    }
    vortexParticlesRef.current = { x, y, px, py, age, maxAge };
  }, []);

  const resetLorenz = useCallback(() => {
    const state = lorenzStateRef.current;
    state.a = { x: 1.5, y: 1.5, z: 24 };
    state.b = { x: 1.502, y: 1.5, z: 24 };
    state.trailA = [];
    state.trailB = [];
    // Pre-warm 1050 steps synchronously so both butterfly wings and diverging cyan/amber trails shine from frame 0
    const dt = 0.007;
    const s = 10;
    const b = 8 / 3;
    const r = paramsRef.current.rho;
    const stepRK4 = (p: { x: number; y: number; z: number }) => {
      const d = (u: number, v: number, w: number): [number, number, number] => [
        s * (v - u),
        u * (r - w) - v,
        u * v - b * w,
      ];
      const k1 = d(p.x, p.y, p.z);
      const k2 = d(p.x + 0.5 * dt * k1[0], p.y + 0.5 * dt * k1[1], p.z + 0.5 * dt * k1[2]);
      const k3 = d(p.x + 0.5 * dt * k2[0], p.y + 0.5 * dt * k2[1], p.z + 0.5 * dt * k2[2]);
      const k4 = d(p.x + dt * k3[0], p.y + dt * k3[1], p.z + dt * k3[2]);
      p.x += (dt / 6) * (k1[0] + 2 * k2[0] + 2 * k3[0] + k4[0]);
      p.y += (dt / 6) * (k1[1] + 2 * k2[1] + 2 * k3[1] + k4[1]);
      p.z += (dt / 6) * (k1[2] + 2 * k2[2] + 2 * k3[2] + k4[2]);
    };
    for (let i = 0; i < 1850; i++) {
      stepRK4(state.a);
      stepRK4(state.b);
      if (i >= 1850 - LORENZ_MAX_TRAIL) {
        state.trailA.push([state.a.x, state.a.y, state.a.z]);
        state.trailB.push([state.b.x, state.b.y, state.b.z]);
      }
    }
    setLorenzDelta(
      Math.hypot(
        state.a.x - state.b.x,
        state.a.y - state.b.y,
        state.a.z - state.b.z
      )
    );
  }, []);

  const resetComplexParticles = useCallback(() => {
    const N = COMPLEX_PARTICLE_COUNT;
    const x = new Float32Array(N);
    const y = new Float32Array(N);
    const px = new Float32Array(N);
    const py = new Float32Array(N);
    const age = new Float32Array(N);
    for (let i = 0; i < N; i++) {
      x[i] = ((i % 24) / 23 - 0.5) * 3.6;
      y[i] = (Math.floor(i / 24) / 19 - 0.5) * 2.6;
      px[i] = x[i];
      py[i] = y[i];
      age[i] = (i * 5) % 120;
    }
    complexParticlesRef.current = { x, y, px, py, age };
  }, []);

  if (!vortexParticlesRef.current) resetVortexParticles();
  if (lorenzStateRef.current.trailA.length === 0) resetLorenz();
  if (!complexParticlesRef.current) resetComplexParticles();

  const drawFrame = useCallback((clearFully: boolean, advancePhysics: boolean) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height, dpr } = sizeRef.current;
    if (width < 10 || height < 10) return;

    ctx.save();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const mode = modeRef.current;
    const p = paramsRef.current;

    // Background / Persistence decay
    ctx.globalCompositeOperation = 'source-over';
    if (clearFully || mode === 'fourier' || mode === 'lorenz') {
      ctx.fillStyle = '#05070C';
      ctx.fillRect(0, 0, width, height);
    } else {
      ctx.fillStyle = 'rgba(5, 7, 12, 0.14)';
      ctx.fillRect(0, 0, width, height);
    }

    const cx = width * 0.5;
    const cy = height * 0.5;
    const scale = Math.min(width, height) * 0.23;

    // Subtle polar / cartographic reticle grid on full clears or low-alpha persistent overlay
    if (clearFully || mode === 'fourier' || mode === 'lorenz') {
      ctx.strokeStyle = 'rgba(237, 235, 228, 0.045)';
      ctx.lineWidth = 1;
      for (let r = 1; r <= 3; r++) {
        ctx.beginPath();
        ctx.arc(cx, cy, r * scale * 0.72, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.moveTo(0, cy);
      ctx.lineTo(width, cy);
      ctx.moveTo(cx, 0);
      ctx.lineTo(cx, height);
      ctx.stroke();
    }

    if (advancePhysics) {
      p.time += 0.016;
    }

    // -------------------------------------------------------------------------
    // MODE 1: VECTOR CURL & DIVERGENCE VORTEX
    // -------------------------------------------------------------------------
    if (mode === 'vortex') {
      const vp = vortexParticlesRef.current!;
      const satX = p.pointerActive ? p.pointerX : 1.08 * Math.cos(p.time * 0.82);
      const satY = p.pointerActive ? p.pointerY : 0.74 * Math.sin(p.time * 1.15);

      const fieldVel = (x: number, y: number): [number, number] => {
        if (!p.dipole) {
          // Single central swirl + autonomous or pointer orbiting satellite vortex
          let vx = -p.omega * y + p.lambda * x;
          let vy = p.omega * x + p.lambda * y;
          const dx = x - satX;
          const dy = y - satY;
          const r2 = dx * dx + dy * dy + 0.16;
          const satStrength = p.pointerActive ? 1.15 : 0.68;
          vx += (-dy * satStrength) / r2;
          vy += (dx * satStrength) / r2;
          // Soft confinement nonlinear term near boundary
          const r2c = x * x + y * y;
          if (r2c > 4.2) {
            vx -= x * 0.25 * (r2c - 4.2);
            vy -= y * 0.25 * (r2c - 4.2);
          }
          return [vx, vy];
        } else {
          // Binary counter-rotating vortex dipole with breathing separation
          const sep = 0.85 + 0.14 * Math.sin(p.time * 1.1);
          const x1 = x + sep;
          const x2 = x - sep;
          const r1 = x1 * x1 + y * y + 0.08;
          const r2 = x2 * x2 + y * y + 0.08;
          const vx =
            (-p.omega * y) / r1 +
            (p.omega * y) / r2 +
            p.lambda * x * 0.45;
          const vy =
            (p.omega * x1) / r1 -
            (p.omega * x2) / r2 +
            p.lambda * y * 0.45;
          return [vx, vy];
        }
      };

      // Faint lattice guide arrows (subtle reference background)
      ctx.strokeStyle = 'rgba(56, 212, 255, 0.08)';
      ctx.lineWidth = 1;
      for (let gx = -2.2; gx <= 2.21; gx += 0.55) {
        for (let gy = -1.5; gy <= 1.51; gy += 0.55) {
          const [vx, vy] = fieldVel(gx, gy);
          const mag = Math.hypot(vx, vy) + 1e-4;
          const len = Math.min(18, 6 + mag * 4.5);
          const sx = cx + gx * scale;
          const sy = cy - gy * scale;
          const ux = (vx / mag) * len;
          const uy = (-vy / mag) * len;
          ctx.beginPath();
          ctx.moveTo(sx, sy);
          ctx.lineTo(sx + ux, sy + uy);
          ctx.stroke();
        }
      }

      if (clearFully) {
        // Draw crisp synthetic streamlines synchronously on first paint
        ctx.globalCompositeOperation = 'lighter';
        for (let s = 0; s < 56; s++) {
          const ang = (s / 56) * Math.PI * 2;
          const rad = 0.28 + ((s % 7) * 0.32);
          let sx = Math.cos(ang) * rad;
          let sy = Math.sin(ang) * rad;
          ctx.beginPath();
          ctx.moveTo(cx + sx * scale, cy - sy * scale);
          for (let step = 0; step < 24; step++) {
            const [vx, vy] = fieldVel(sx, sy);
            sx += vx * 0.032;
            sy += vy * 0.032;
            ctx.lineTo(cx + sx * scale, cy - sy * scale);
          }
          ctx.strokeStyle = s % 3 === 0 ? 'rgba(244, 185, 86, 0.34)' : 'rgba(56, 212, 255, 0.36)';
          ctx.lineWidth = 1.35;
          ctx.stroke();
        }
      }

      const dt = 0.017;
      ctx.globalCompositeOperation = 'lighter';
      for (let i = 0; i < VORTEX_PARTICLE_COUNT; i++) {
        let x = vp.x[i];
        let y = vp.y[i];
        const px = x;
        const py = y;

        if (advancePhysics) {
          const [v1x, v1y] = fieldVel(x, y);
          const mx = x + 0.5 * dt * v1x;
          const my = y + 0.5 * dt * v1y;
          const [v2x, v2y] = fieldVel(mx, my);
          x += dt * v2x;
          y += dt * v2y;
          vp.age[i] += 1;

          const r = Math.hypot(x, y);
          if (vp.age[i] > vp.maxAge[i] || r > 3.1 || (r < 0.035 && p.lambda < -0.05)) {
            const ang = (i * 2.39996 + p.time * 1.3) % (Math.PI * 2);
            const spawnR = p.lambda >= 0 ? 0.14 + (i % 9) * 0.06 : 1.1 + (i % 15) * 0.11;
            x = Math.cos(ang) * spawnR;
            y = Math.sin(ang) * spawnR;
            vp.px[i] = x;
            vp.py[i] = y;
            vp.x[i] = x;
            vp.y[i] = y;
            vp.age[i] = 0;
            continue;
          }
          vp.px[i] = px;
          vp.py[i] = py;
          vp.x[i] = x;
          vp.y[i] = y;
        }

        const speed = Math.hypot(x - px, y - py) / dt;
        const isWarm = i % 4 === 0 || speed > 2.1;
        const alpha = Math.min(0.85, 0.28 + speed * 0.22);
        const sx = cx + x * scale;
        const sy = cy - y * scale;
        const tailX = cx + (x - (x - px) * 2.2) * scale;
        const tailY = cy - (y - (y - py) * 2.2) * scale;
        ctx.strokeStyle = isWarm
          ? `rgba(244, 185, 86, ${alpha.toFixed(2)})`
          : `rgba(56, 212, 255, ${alpha.toFixed(2)})`;
        ctx.lineWidth = isWarm ? 1.85 : 1.45;
        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(sx, sy);
        ctx.stroke();
      }

      // Singularity core / dipole markers
      const drawCore = (gx: number, gy: number, color: string) => {
        const sx = cx + gx * scale;
        const sy = cy - gy * scale;
        const grad = ctx.createRadialGradient(sx, sy, 1, sx, sy, 26);
        grad.addColorStop(0, color);
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(sx, sy, 26, 0, Math.PI * 2);
        ctx.fill();
      };
      if (p.dipole) {
        drawCore(-0.85, 0, 'rgba(56, 212, 255, 0.65)');
        drawCore(0.85, 0, 'rgba(244, 185, 86, 0.65)');
      } else {
        drawCore(0, 0, 'rgba(56, 212, 255, 0.6)');
        drawCore(satX, satY, 'rgba(244, 185, 86, 0.58)');
      }
    }

    // -------------------------------------------------------------------------
    // MODE 2: LORENZ STRANGE ATTRACTOR (DUAL DIVERGING RK4 ORBITS)
    // -------------------------------------------------------------------------
    if (mode === 'lorenz') {
      const state = lorenzStateRef.current;
      const dt = 0.0068;
      const s = 10;
      const b = 8 / 3;
      const r = p.rho;

      const stepRK4 = (q: { x: number; y: number; z: number }) => {
        const d = (u: number, v: number, w: number): [number, number, number] => [
          s * (v - u),
          u * (r - w) - v,
          u * v - b * w,
        ];
        const k1 = d(q.x, q.y, q.z);
        const k2 = d(q.x + 0.5 * dt * k1[0], q.y + 0.5 * dt * k1[1], q.z + 0.5 * dt * k1[2]);
        const k3 = d(q.x + 0.5 * dt * k2[0], q.y + 0.5 * dt * k2[1], q.z + 0.5 * dt * k2[2]);
        const k4 = d(q.x + dt * k3[0], q.y + dt * k3[1], q.z + dt * k3[2]);
        q.x += (dt / 6) * (k1[0] + 2 * k2[0] + 2 * k3[0] + k4[0]);
        q.y += (dt / 6) * (k1[1] + 2 * k2[1] + 2 * k3[1] + k4[1]);
        q.z += (dt / 6) * (k1[2] + 2 * k2[2] + 2 * k3[2] + k4[2]);
      };

      if (advancePhysics) {
        for (let sub = 0; sub < 2; sub++) {
          stepRK4(state.a);
          stepRK4(state.b);
          state.trailA.push([state.a.x, state.a.y, state.a.z]);
          state.trailB.push([state.b.x, state.b.y, state.b.z]);
          if (state.trailA.length > LORENZ_MAX_TRAIL) state.trailA.shift();
          if (state.trailB.length > LORENZ_MAX_TRAIL) state.trailB.shift();
        }
        p.yaw = -0.62 + Math.sin(p.time * 0.42) * 0.18;
        p.pitch = 0.12 + Math.cos(p.time * 0.31) * 0.06;
        state.frameSkip = (state.frameSkip + 1) % 6;
        if (state.frameSkip === 0) {
          setLorenzDelta(
            Math.hypot(
              state.a.x - state.b.x,
              state.a.y - state.b.y,
              state.a.z - state.b.z
            )
          );
        }
      }

      const cosY = Math.cos(p.yaw);
      const sinY = Math.sin(p.yaw);
      const cosP = Math.cos(p.pitch);
      const sinP = Math.sin(p.pitch);
      const lorenzScale = Math.min(width, height) * 0.0175;

      const project = (pt: [number, number, number]): [number, number] => {
        const x = pt[0];
        const y = pt[1];
        const z = pt[2] - 25;
        const rx = x * cosY - y * sinY;
        const ry = x * sinY + y * cosY;
        const rz = z * cosP - ry * sinP;
        const depth = 1 + (ry * cosP + z * sinP) * 0.008;
        return [cx + (rx * lorenzScale) / depth, cy - (rz * lorenzScale) / depth];
      };

      ctx.globalCompositeOperation = 'lighter';

      const drawTrail = (trail: [number, number, number][], rgb: string) => {
        if (trail.length < 2) return;
        const segSize = 14;
        for (let start = 0; start < trail.length - 1; start += segSize) {
          const end = Math.min(trail.length - 1, start + segSize);
          const frac = (end / trail.length) ** 1.1;
          ctx.beginPath();
          const [x0, y0] = project(trail[start]);
          ctx.moveTo(x0, y0);
          for (let j = start + 1; j <= end; j++) {
            const [xj, yj] = project(trail[j]);
            ctx.lineTo(xj, yj);
          }
          ctx.strokeStyle = `rgba(${rgb}, ${(0.14 + frac * 0.72).toFixed(2)})`;
          ctx.lineWidth = 1.2 + frac * 1.6;
          ctx.stroke();
        }
        const head = project(trail[trail.length - 1]);
        const glow = ctx.createRadialGradient(head[0], head[1], 1, head[0], head[1], 18);
        glow.addColorStop(0, `rgba(${rgb}, 0.98)`);
        glow.addColorStop(1, 'transparent');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(head[0], head[1], 18, 0, Math.PI * 2);
        ctx.fill();
      };

      drawTrail(state.trailA, '56, 212, 255');
      drawTrail(state.trailB, '244, 185, 86');
    }

    // -------------------------------------------------------------------------
    // MODE 3: FOURIER EPICYCLES
    // -------------------------------------------------------------------------
    if (mode === 'fourier') {
      const series = fourierSeriesRef.current;
      const trail = fourierTrailRef.current;
      const count = Math.min(p.harmonics, series.length);
      const fourierScale = Math.min(width, height) * 0.33;

      const evalEpicycles = (theta: number, drawCircles: boolean): [number, number] => {
        let vx = cx;
        let vy = cy;
        for (let i = 0; i < count; i++) {
          const c = series[i];
          const prevX = vx;
          const prevY = vy;
          const angle = c.freq * theta + c.phase;
          const r = c.amp * fourierScale;
          vx += r * Math.cos(angle);
          vy -= r * Math.sin(angle);
          if (drawCircles && r > 1.5) {
            ctx.strokeStyle =
              i === 0 ? 'rgba(52, 232, 165, 0.28)' : 'rgba(167, 179, 199, 0.16)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(prevX, prevY, r, 0, Math.PI * 2);
            ctx.stroke();

            ctx.strokeStyle = 'rgba(244, 185, 86, 0.55)';
            ctx.lineWidth = 1.25;
            ctx.beginPath();
            ctx.moveTo(prevX, prevY);
            ctx.lineTo(vx, vy);
            ctx.stroke();
          }
        }
        return [vx, vy];
      };

      if (trail.length === 0) {
        // Populate initial contour loop synchronously so first frame shows the full glowing trace!
        for (let m = 0; m <= 160; m++) {
          const th = (m / 160) * Math.PI * 2;
          const [tx, ty] = evalEpicycles(th, false);
          trail.push({ x: tx, y: ty });
        }
      }

      const theta = p.time * 0.9;
      ctx.globalCompositeOperation = 'lighter';
      const [tipX, tipY] = evalEpicycles(theta, true);

      if (advancePhysics) {
        trail.push({ x: tipX, y: tipY });
        if (trail.length > 260) trail.shift();
      }

      if (trail.length > 2) {
        ctx.beginPath();
        ctx.moveTo(trail[0].x, trail[0].y);
        for (let i = 1; i < trail.length; i++) {
          ctx.lineTo(trail[i].x, trail[i].y);
        }
        ctx.strokeStyle = 'rgba(52, 232, 165, 0.25)';
        ctx.lineWidth = 6;
        ctx.stroke();

        ctx.strokeStyle = '#34E8A5';
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      const tipGlow = ctx.createRadialGradient(tipX, tipY, 1, tipX, tipY, 18);
      tipGlow.addColorStop(0, '#FFFFFF');
      tipGlow.addColorStop(0.35, '#34E8A5');
      tipGlow.addColorStop(1, 'transparent');
      ctx.fillStyle = tipGlow;
      ctx.beginPath();
      ctx.arc(tipX, tipY, 18, 0, Math.PI * 2);
      ctx.fill();
    }

    // -------------------------------------------------------------------------
    // MODE 4: COMPLEX PLANE ZEROS & POLES f(z) = (z - z1)(z - z2) / (z - p1)
    // -------------------------------------------------------------------------
    if (mode === 'complex') {
      const cp = complexParticlesRef.current!;
      const tOrbit = p.orbitPoles ? p.time * 0.65 : 0.4;
      const z1x = 0.85 * Math.cos(tOrbit);
      const z1y = 0.72 * Math.sin(tOrbit);
      const z2x = -0.85 * Math.cos(tOrbit * 0.8);
      const z2y = -0.68 * Math.sin(tOrbit * 0.8);
      const p1x = 0.15 * Math.sin(tOrbit * 1.4);
      const p1y = 0.15 * Math.cos(tOrbit * 1.4);

      const evalF = (zx: number, zy: number): [number, number] => {
        // n = (z - z1)*(z - z2)
        const ax = zx - z1x;
        const ay = zy - z1y;
        const bx = zx - z2x;
        const by = zy - z2y;
        const nx = ax * bx - ay * by;
        const ny = ax * by + ay * bx;
        // d = z - p1
        const dx = zx - p1x;
        const dy = zy - p1y;
        const d2 = dx * dx + dy * dy + 0.035;
        const fx = (nx * dx + ny * dy) / d2;
        const fy = (ny * dx - nx * dy) / d2;
        const mag = Math.hypot(fx, fy) + 1e-4;
        // Normalized smooth flow field
        const clamp = Math.min(2.4, mag);
        return [(fx / mag) * clamp, (fy / mag) * clamp];
      };

      if (clearFully) {
        ctx.globalCompositeOperation = 'lighter';
        for (let k = 0; k < 44; k++) {
          let sx = ((k % 11) / 10 - 0.5) * 3.2;
          let sy = (Math.floor(k / 11) / 3 - 0.5) * 2.1;
          ctx.beginPath();
          ctx.moveTo(cx + sx * scale, cy - sy * scale);
          for (let step = 0; step < 22; step++) {
            const [vx, vy] = evalF(sx, sy);
            sx += vx * 0.035;
            sy += vy * 0.035;
            ctx.lineTo(cx + sx * scale, cy - sy * scale);
          }
          ctx.strokeStyle = k % 2 === 0 ? 'rgba(255, 120, 90, 0.32)' : 'rgba(56, 212, 255, 0.3)';
          ctx.lineWidth = 1.3;
          ctx.stroke();
        }
      }

      const dt = 0.022;
      ctx.globalCompositeOperation = 'lighter';
      for (let i = 0; i < COMPLEX_PARTICLE_COUNT; i++) {
        let x = cp.x[i];
        let y = cp.y[i];
        const px = x;
        const py = y;
        const [vx, vy] = evalF(x, y);
        if (advancePhysics) {
          x += vx * dt;
          y += vy * dt;
          cp.age[i] += 1;
          if (cp.age[i] > 110 || Math.hypot(x, y) > 3.0) {
            x = ((i % 24) / 23 - 0.5) * 3.6;
            y = (Math.floor(i / 24) / 19 - 0.5) * 2.5;
            cp.x[i] = x;
            cp.y[i] = y;
            cp.px[i] = x;
            cp.py[i] = y;
            cp.age[i] = 0;
            continue;
          }
          cp.px[i] = px;
          cp.py[i] = py;
          cp.x[i] = x;
          cp.y[i] = y;
        }
        const phase = Math.atan2(vy, vx);
        const isWarm = Math.sin(phase) > 0;
        ctx.strokeStyle = isWarm ? 'rgba(255, 120, 90, 0.45)' : 'rgba(56, 212, 255, 0.45)';
        ctx.lineWidth = 1.35;
        ctx.beginPath();
        ctx.moveTo(cx + px * scale, cy - py * scale);
        ctx.lineTo(cx + x * scale, cy - y * scale);
        ctx.stroke();
      }

      // Draw zeros (emerald rings) & pole (coral beacon)
      const drawMarker = (mx: number, my: number, color: string, label: string) => {
        const sx = cx + mx * scale;
        const sy = cy - my * scale;
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(sx, sy, 7, 0, Math.PI * 2);
        ctx.stroke();
        ctx.font = '10px "JetBrains Mono", monospace';
        ctx.fillStyle = color;
        ctx.fillText(label, sx + 10, sy + 3);
      };
      drawMarker(z1x, z1y, '#34E8A5', 'z₁=0');
      drawMarker(z2x, z2y, '#34E8A5', 'z₂=0');
      drawMarker(p1x, p1y, '#FF785A', 'p₁=∞');
    }

    ctx.restore();
  }, []);

  // Resize & synchronous paint observer
  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const updateSize = () => {
      const rect = container.getBoundingClientRect();
      const width = Math.max(240, Math.floor(rect.width));
      const height = Math.max(220, Math.floor(rect.height));
      const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      sizeRef.current = { width, height, dpr };
      drawFrame(true, false);
    };

    updateSize();
    const ro = new ResizeObserver(updateSize);
    ro.observe(container);

    const io = new IntersectionObserver(
      (entries) => {
        visibleRef.current = entries.some((e) => e.isIntersecting);
      },
      { threshold: 0.05 }
    );
    io.observe(container);

    return () => {
      ro.disconnect();
      io.disconnect();
    };
  }, [drawFrame]);

  // Repaint cleanly when mode switches or static controls update
  useEffect(() => {
    drawFrame(true, false);
  }, [activeMode, omega, lambda, dipole, rho, fourierShape, harmonics, orbitPoles, drawFrame]);

  // 60fps animation loop pausing cleanly when hidden or off-screen
  useEffect(() => {
    let rafId = 0;
    const tick = () => {
      if (visibleRef.current && !document.hidden && playingRef.current) {
        drawFrame(false, true);
      }
      rafId = window.requestAnimationFrame(tick);
    };
    rafId = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(rafId);
  }, [drawFrame]);

  const handleSelectMode = (next: VortexMode) => {
    if (lockedMode) return;
    if (onModeChange) onModeChange(next);
    else setInternalMode(next);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!interactive) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const scale = Math.min(rect.width, rect.height) * 0.23;
    const mx = (e.clientX - rect.left - rect.width * 0.5) / scale;
    const my = -(e.clientY - rect.top - rect.height * 0.5) / scale;
    paramsRef.current.pointerX = mx;
    paramsRef.current.pointerY = my;
    paramsRef.current.pointerActive = true;
    if (activeMode === 'lorenz' && e.buttons === 1) {
      paramsRef.current.yaw += e.movementX * 0.008;
      paramsRef.current.pitch = Math.max(-1.1, Math.min(1.1, paramsRef.current.pitch + e.movementY * 0.008));
      drawFrame(true, false);
    }
  };

  const handlePointerLeave = () => {
    paramsRef.current.pointerActive = false;
  };

  const meta = MODE_META[activeMode];
  const vortexClassification =
    Math.abs(lambda) < 0.06
      ? 'Pure Center Vortex (Closed Orbits)'
      : lambda < 0
        ? 'Stable Spiral Sink (Re λ < 0)'
        : 'Unstable Spiral Source (Re λ > 0)';

  return (
    <div className="instrument-frame fiducial-frame overflow-hidden">
      {/* Top Instrument Bar */}
      <div className="px-4 py-2.5 border-b hairline-rule bg-[#080C15]/90 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: meta.accent, boxShadow: `0 0 10px ${meta.accent}` }}
          />
          <span className="font-mono-data text-[10px] uppercase tracking-[0.18em] text-[#A7B3C7]">
            {meta.badge}
          </span>
          {!compact && (
            <span className="hidden sm:inline text-xs text-[#707D94]">· {meta.subtitle}</span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {!lockedMode &&
            (['vortex', 'lorenz', 'fourier', 'complex'] as VortexMode[]).map((m) => {
              const active = activeMode === m;
              return (
                <button
                  key={m}
                  type="button"
                  onClick={() => handleSelectMode(m)}
                  className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                    active
                      ? 'text-[#05070C] font-semibold'
                      : 'text-[#A7B3C7] border border-[rgba(237,235,228,0.12)] hover:text-[#F2F0E8]'
                  }`}
                  style={
                    active
                      ? { backgroundColor: MODE_META[m].accent }
                      : undefined
                  }
                >
                  {MODE_META[m].label}
                </button>
              );
            })}

          <button
            type="button"
            onClick={() => setPlaying((v) => !v)}
            aria-label={playing ? 'Pause simulation' : 'Play simulation'}
            className="p-1.5 rounded border border-[rgba(237,235,228,0.16)] text-[#F2F0E8] hover:border-[rgba(237,235,228,0.35)]"
          >
            {playing ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>
          <button
            type="button"
            onClick={() => {
              if (activeMode === 'vortex') resetVortexParticles();
              else if (activeMode === 'lorenz') resetLorenz();
              else if (activeMode === 'complex') resetComplexParticles();
              else fourierTrailRef.current.length = 0;
              drawFrame(true, false);
            }}
            aria-label="Reset manifold"
            className="p-1.5 rounded border border-[rgba(237,235,228,0.16)] text-[#A7B3C7] hover:text-[#F2F0E8]"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Kinetic Canvas Viewport */}
      <div ref={containerRef} className={`relative w-full ${heightClass} bg-[#05070C]`}>
        <canvas
          ref={canvasRef}
          onPointerMove={handlePointerMove}
          onPointerLeave={handlePointerLeave}
          className="block w-full h-full touch-none cursor-crosshair"
        />

        {/* Bottom-left live equation & telemetry glass pill */}
        <div className="pointer-events-none absolute bottom-3 left-3 max-w-[92%] obsidian-glass rounded px-3 py-2 text-xs">
          {activeMode === 'vortex' && (
            <div className="space-y-0.5">
              <MathTex
                tex={`\\mathbf{F}(x,y) = \\langle ${lambda.toFixed(2)}x ${omega >= 0 ? '-' : '+'} ${Math.abs(omega).toFixed(2)}y,\\; ${omega.toFixed(2)}x ${lambda >= 0 ? '+' : '-'} ${Math.abs(lambda).toFixed(2)}y \\rangle`}
                className="text-[#F2F0E8]"
              />
              <div className="font-mono-data text-[10px] text-[#38D4FF]">
                {dipole ? 'Counter-Rotating Vortex Dipole' : vortexClassification}
              </div>
            </div>
          )}
          {activeMode === 'lorenz' && (
            <div className="space-y-0.5">
              <MathTex
                tex={`\\dot{x}=10(y-x),\\quad \\dot{y}=x(${rho}-z)-y,\\quad \\dot{z}=xy-\\tfrac{8}{3}z`}
                className="text-[#F2F0E8]"
              />
              <div className="font-mono-data text-[10px] text-[#F4B956]">
                Orbit Separation δ(t) = {lorenzDelta.toFixed(3)} · Initial Δx₀ = 0.002
              </div>
            </div>
          )}
          {activeMode === 'fourier' && (
            <div className="space-y-0.5">
              <MathTex
                tex={`z(t) \\approx \\sum_{k=1}^{${harmonics}} c_k e^{i n_k t}`}
                className="text-[#F2F0E8]"
              />
              <div className="font-mono-data text-[10px] text-[#34E8A5]">
                Active rotating phasors: {harmonics} · Shape: {fourierShape}
              </div>
            </div>
          )}
          {activeMode === 'complex' && (
            <div className="space-y-0.5">
              <MathTex
                tex="f(z) = \dfrac{(z - z_1)(z - z_2)}{z - p_1}"
                className="text-[#F2F0E8]"
              />
              <div className="font-mono-data text-[10px] text-[#FF785A]">
                Holomorphic phase trajectories · 2 zeros (emerald), 1 pole (coral)
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mode-Specific Precision Control Strip */}
      {!compact && (
        <div className="px-4 py-3 border-t hairline-rule bg-[#080C15]/95 flex flex-wrap items-center gap-5 text-xs">
          {activeMode === 'vortex' && (
            <>
              <label className="flex-1 min-w-[160px] space-y-1">
                <span className="flex justify-between font-mono-data text-[10px] text-[#A7B3C7]">
                  <span>Curl Ω (Rotation)</span>
                  <span className="text-[#38D4FF]">{omega.toFixed(2)} rad/s</span>
                </span>
                <input
                  type="range"
                  min={-2.5}
                  max={2.5}
                  step={0.05}
                  value={omega}
                  onChange={(e) => setOmega(Number(e.target.value))}
                  className="meridian-slider"
                  style={{ ['--slider-accent' as string]: '#38D4FF' }}
                />
              </label>

              <label className="flex-1 min-w-[160px] space-y-1">
                <span className="flex justify-between font-mono-data text-[10px] text-[#A7B3C7]">
                  <span>Divergence λ</span>
                  <span className="text-[#F4B956]">{lambda.toFixed(2)}</span>
                </span>
                <input
                  type="range"
                  min={-1.0}
                  max={0.9}
                  step={0.02}
                  value={lambda}
                  onChange={(e) => setLambda(Number(e.target.value))}
                  className="meridian-slider"
                  style={{ ['--slider-accent' as string]: '#F4B956' }}
                />
              </label>

              <button
                type="button"
                onClick={() => setDipole((d) => !d)}
                className={`px-3 py-1.5 rounded text-xs font-mono-data border transition-colors ${
                  dipole
                    ? 'bg-[#38D4FF]/15 text-[#38D4FF] border-[#38D4FF]/50'
                    : 'text-[#A7B3C7] border-[rgba(237,235,228,0.16)]'
                }`}
              >
                {dipole ? 'Topology: Twin Dipole' : 'Topology: Single Core'}
              </button>
            </>
          )}

          {activeMode === 'lorenz' && (
            <>
              <label className="flex-1 min-w-[200px] space-y-1">
                <span className="flex justify-between font-mono-data text-[10px] text-[#A7B3C7]">
                  <span>Rayleigh Parameter ρ</span>
                  <span className="text-[#F4B956]">{rho.toFixed(1)}</span>
                </span>
                <input
                  type="range"
                  min={20}
                  max={34}
                  step={0.5}
                  value={rho}
                  onChange={(e) => setRho(Number(e.target.value))}
                  className="meridian-slider"
                  style={{ ['--slider-accent' as string]: '#F4B956' }}
                />
              </label>
              <button
                type="button"
                onClick={() => {
                  resetLorenz();
                  drawFrame(true, false);
                }}
                className="px-3 py-1.5 rounded text-xs font-mono-data bg-[#F4B956]/15 text-[#F4B956] border border-[#F4B956]/40 hover:bg-[#F4B956]/25"
              >
                Re-seed Perturbation (Δx₀ = 0.002)
              </button>
            </>
          )}

          {activeMode === 'fourier' && (
            <>
              <div className="flex flex-wrap items-center gap-1.5">
                {(['trefoil', 'square', 'cardioid', 'lemniscate'] as FourierShape[]).map((sh) => (
                  <button
                    key={sh}
                    type="button"
                    onClick={() => setFourierShape(sh)}
                    className={`px-2.5 py-1 rounded text-[11px] font-mono-data capitalize border ${
                      fourierShape === sh
                        ? 'bg-[#34E8A5]/15 text-[#34E8A5] border-[#34E8A5]/50'
                        : 'text-[#A7B3C7] border-[rgba(237,235,228,0.14)]'
                    }`}
                  >
                    {sh}
                  </button>
                ))}
              </div>
              <label className="flex-1 min-w-[180px] space-y-1">
                <span className="flex justify-between font-mono-data text-[10px] text-[#A7B3C7]">
                  <span>Rotating Epicycles N</span>
                  <span className="text-[#34E8A5]">{harmonics} terms</span>
                </span>
                <input
                  type="range"
                  min={2}
                  max={18}
                  step={1}
                  value={harmonics}
                  onChange={(e) => setHarmonics(Number(e.target.value))}
                  className="meridian-slider"
                  style={{ ['--slider-accent' as string]: '#34E8A5' }}
                />
              </label>
            </>
          )}

          {activeMode === 'complex' && (
            <div className="flex items-center justify-between w-full gap-4">
              <span className="text-[#A7B3C7]">
                Meromorphic vector field: emerald rings mark roots <code className="text-[#34E8A5]">z₁, z₂</code>, coral marks pole <code className="text-[#FF785A]">p₁</code>.
              </span>
              <button
                type="button"
                onClick={() => setOrbitPoles((v) => !v)}
                className={`px-3 py-1.5 rounded text-xs font-mono-data border ${
                  orbitPoles
                    ? 'bg-[#FF785A]/15 text-[#FF785A] border-[#FF785A]/50'
                    : 'text-[#A7B3C7] border-[rgba(237,235,228,0.14)]'
                }`}
              >
                {orbitPoles ? 'Roots: Orbiting' : 'Roots: Pinned'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
