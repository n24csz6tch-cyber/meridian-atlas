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
    accent: '#F4C46C',
    subtitle: 'Hover to attract streams or click to launch radial golden bursts',
  },
  lorenz: {
    label: 'Lorenz Butterfly',
    badge: 'Chaos Sensitivity',
    accent: '#FFE29E',
    subtitle: 'Two trajectories started Δx₀ = 0.002 apart diverging in 3D phase space',
  },
  fourier: {
    label: 'Fourier Epicycles',
    badge: 'Phasor Synthesis',
    accent: '#45E6A6',
    subtitle: 'Any closed geometric contour decomposed into rotating complex phasors',
  },
  complex: {
    label: 'Complex Phase Flow',
    badge: 'Zeros & Poles f(z)',
    accent: '#FF8563',
    subtitle: 'Holomorphic streamlines and phase contours around roots & poles',
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

const LORENZ_MAX_TRAIL = 820;
const VORTEX_PARTICLE_COUNT = 1950;
const COMPLEX_PARTICLE_COUNT = 1150;

interface Shockwave {
  x: number; // math coords
  y: number;
  r: number;
  alpha: number;
}

interface CalloutBadge {
  anchorX: number;
  anchorY: number;
  boxX: number;
  boxY: number;
  title: string;
  subtitle: string;
  accent: string;
}

function drawHudCallouts(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  callouts: CalloutBadge[]
) {
  ctx.save();
  ctx.globalCompositeOperation = 'source-over';
  for (const c of callouts) {
    const bw = 138;
    const bh = 32;
    const bx = Math.max(12, Math.min(width - bw - 12, c.boxX));
    const by = Math.max(12, Math.min(height - bh - 56, c.boxY));
    const targetX = c.anchorX < bx + bw * 0.5 ? bx : bx + bw;
    const targetY = by + bh * 0.5;

    // 1px leader line + anchor reticle dot
    ctx.strokeStyle = `${c.accent}77`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(c.anchorX, c.anchorY);
    ctx.lineTo((c.anchorX + targetX) * 0.5, targetY);
    ctx.lineTo(targetX, targetY);
    ctx.stroke();

    ctx.fillStyle = c.accent;
    ctx.beginPath();
    ctx.arc(c.anchorX, c.anchorY, 2.6, 0, Math.PI * 2);
    ctx.fill();

    // 1px obsidian glass callout card
    ctx.fillStyle = 'rgba(11, 12, 18, 0.88)';
    ctx.strokeStyle = 'rgba(244, 196, 108, 0.28)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(bx, by, bw, bh, 5);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = c.accent;
    ctx.font = '600 8.5px "JetBrains Mono", monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(c.title, bx + 8, by + 5);

    ctx.fillStyle = '#A8B2C6';
    ctx.font = '500 8.5px "JetBrains Mono", monospace';
    ctx.fillText(c.subtitle, bx + 8, by + 17);
  }
  ctx.restore();
}

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
  const [omega, setOmega] = useState(1.55);
  const [lambda, setLambda] = useState(-0.14);
  const [dipole, setDipole] = useState(false);

  const [rho, setRho] = useState(28);
  const [lorenzDelta, setLorenzDelta] = useState(0.002);

  const [fourierShape, setFourierShape] = useState<FourierShape>('trefoil');
  const [harmonics, setHarmonics] = useState(10);

  const [orbitPoles, setOrbitPoles] = useState(true);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const sizeRef = useRef({ width: 800, height: 460, dpr: 1 });
  const visibleRef = useRef(true);
  const modeRef = useRef<VortexMode>(activeMode);
  const playingRef = useRef<boolean>(playing && !reducedMotion);
  const shockwavesRef = useRef<Shockwave[]>([]);

  const paramsRef = useRef({
    omega,
    lambda,
    dipole,
    rho,
    harmonics,
    orbitPoles,
    time: 0,
    yaw: -0.62,
    pitch: 0.14,
    pointerActive: false,
    pointerX: 0,
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

  const vortexParticlesRef = useRef<{
    x: Float32Array;
    y: Float32Array;
    px: Float32Array;
    py: Float32Array;
    age: Float32Array;
    maxAge: Float32Array;
    band: Uint8Array;
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
    const band = new Uint8Array(N);
    for (let i = 0; i < N; i++) {
      const ang = (i * 2.39996) % (Math.PI * 2);
      const rad = 0.18 + 2.45 * Math.sqrt(((i * 97) % N) / N);
      x[i] = Math.cos(ang) * rad;
      y[i] = Math.sin(ang) * rad;
      px[i] = x[i];
      py[i] = y[i];
      age[i] = (i * 5) % 150;
      maxAge[i] = 95 + ((i * 23) % 95);
      band[i] = i % 10 === 0 ? 3 : i % 4 === 0 ? 2 : i % 2 === 0 ? 1 : 0;
    }
    vortexParticlesRef.current = { x, y, px, py, age, maxAge, band };
  }, []);

  const resetLorenz = useCallback(() => {
    const state = lorenzStateRef.current;
    state.a = { x: 1.5, y: 1.5, z: 24 };
    state.b = { x: 1.502, y: 1.5, z: 24 };
    state.trailA = [];
    state.trailB = [];
    const dt = 0.0068;
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
    for (let i = 0; i < 1900; i++) {
      stepRK4(state.a);
      stepRK4(state.b);
      if (i >= 1900 - LORENZ_MAX_TRAIL) {
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
      x[i] = ((i % 38) / 37 - 0.5) * 3.8;
      y[i] = (Math.floor(i / 38) / 29 - 0.5) * 2.7;
      px[i] = x[i];
      py[i] = y[i];
      age[i] = (i * 5) % 115;
    }
    complexParticlesRef.current = { x, y, px, py, age };
  }, []);

  if (!vortexParticlesRef.current) resetVortexParticles();
  if (lorenzStateRef.current.trailA.length === 0) resetLorenz();
  if (!complexParticlesRef.current) resetComplexParticles();

  const drawFrame = useCallback(
    (clearFully: boolean, advancePhysics: boolean) => {
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

      // Deep Obsidian #060609 canvas base + subtle trail decay
      ctx.globalCompositeOperation = 'source-over';
      if (clearFully || mode === 'fourier' || mode === 'lorenz') {
        ctx.fillStyle = '#060609';
        ctx.fillRect(0, 0, width, height);
      } else {
        ctx.fillStyle = 'rgba(6, 6, 9, 0.16)';
        ctx.fillRect(0, 0, width, height);
      }

      const cx = width * 0.5;
      const cy = height * 0.5;
      const scale = Math.min(width, height) * 0.235;

      // Subtle warm champagne observatory core glow & polar reticles
      if (clearFully || mode === 'fourier' || mode === 'lorenz') {
        const bgGlow = ctx.createRadialGradient(cx, cy, 4, cx, cy, Math.max(width, height) * 0.48);
        bgGlow.addColorStop(0, 'rgba(244, 196, 108, 0.08)');
        bgGlow.addColorStop(0.45, 'rgba(184, 137, 56, 0.025)');
        bgGlow.addColorStop(1, 'transparent');
        ctx.fillStyle = bgGlow;
        ctx.fillRect(0, 0, width, height);

        ctx.strokeStyle = 'rgba(244, 196, 108, 0.06)';
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

      const callouts: CalloutBadge[] = [];

      // -------------------------------------------------------------------------
      // MODE 1: DENSE GOLDEN-AMBER-CORAL-CYAN EXPONENTIAL VECTOR VORTEX
      // -------------------------------------------------------------------------
      if (mode === 'vortex') {
        const vp = vortexParticlesRef.current!;
        const satX = p.pointerActive ? p.pointerX : 1.06 * Math.cos(p.time * 0.85);
        const satY = p.pointerActive ? p.pointerY : 0.72 * Math.sin(p.time * 1.15);

        // Update active click shockwaves
        const waves = shockwavesRef.current;
        for (let w = waves.length - 1; w >= 0; w--) {
          waves[w].r += 0.065;
          waves[w].alpha *= 0.945;
          if (waves[w].alpha < 0.03 || waves[w].r > 3.6) waves.splice(w, 1);
        }

        const fieldVel = (x: number, y: number): [number, number] => {
          let vx = 0;
          let vy = 0;
          if (!p.dipole) {
            // Core rotation + radial shear + gentle exponential spiral plume flare
            const r2Core = x * x + y * y + 0.06;
            const swirlBoost = 1 + 0.65 / (0.35 + r2Core);
            vx = -p.omega * swirlBoost * y + p.lambda * x;
            vy = p.omega * swirlBoost * x + p.lambda * y;

            // Satellite / mouse attractor curl & subtle inflow attraction when hovering
            const dx = x - satX;
            const dy = y - satY;
            const r2 = dx * dx + dy * dy + 0.14;
            const satStrength = p.pointerActive ? 1.45 : 0.76;
            vx += (-dy * satStrength) / r2;
            vy += (dx * satStrength) / r2;
            if (p.pointerActive) {
              const attract = 0.42 / (0.28 + r2);
              vx -= dx * attract;
              vy -= dy * attract;
            }

            if (r2Core > 4.4) {
              vx -= x * 0.28 * (r2Core - 4.4);
              vy -= y * 0.28 * (r2Core - 4.4);
            }
          } else {
            const sep = 0.86 + 0.14 * Math.sin(p.time * 1.1);
            const x1 = x + sep;
            const x2 = x - sep;
            const r1 = x1 * x1 + y * y + 0.08;
            const r2 = x2 * x2 + y * y + 0.08;
            vx = (-p.omega * y) / r1 + (p.omega * y) / r2 + p.lambda * x * 0.45;
            vy = (p.omega * x1) / r1 - (p.omega * x2) / r2 + p.lambda * y * 0.45;
          }

          // Click burst shockwave impulse
          for (const sw of waves) {
            const dx = x - sw.x;
            const dy = y - sw.y;
            const dist = Math.hypot(dx, dy) + 1e-4;
            const ringDiff = Math.abs(dist - sw.r);
            if (ringDiff < 0.35) {
              const push = (1 - ringDiff / 0.35) * sw.alpha * 4.5;
              vx += (dx / dist) * push;
              vy += (dy / dist) * push;
            }
          }
          return [vx, vy];
        };

        // Faint golden vector lattice ticks
        ctx.strokeStyle = 'rgba(244, 196, 108, 0.075)';
        ctx.lineWidth = 0.9;
        ctx.beginPath();
        for (let gx = -2.2; gx <= 2.21; gx += 0.55) {
          for (let gy = -1.5; gy <= 1.51; gy += 0.55) {
            const [vx, vy] = fieldVel(gx, gy);
            const mag = Math.hypot(vx, vy) + 1e-4;
            const len = Math.min(16, 5 + mag * 3.8);
            const sx = cx + gx * scale;
            const sy = cy - gy * scale;
            ctx.moveTo(sx, sy);
            ctx.lineTo(sx + (vx / mag) * len, sy - (vy / mag) * len);
          }
        }
        ctx.stroke();

        // Initial synchronous luminous streamlines on full clear (gives instant rich swirl on frame 0!)
        if (clearFully) {
          ctx.globalCompositeOperation = 'lighter';
          for (let s = 0; s < 68; s++) {
            const ang = (s / 68) * Math.PI * 2;
            const rad = 0.22 + (s % 8) * 0.28;
            let sx = Math.cos(ang) * rad;
            let sy = Math.sin(ang) * rad;
            ctx.beginPath();
            ctx.moveTo(cx + sx * scale, cy - sy * scale);
            for (let step = 0; step < 26; step++) {
              const [vx, vy] = fieldVel(sx, sy);
              sx += vx * 0.028;
              sy += vy * 0.028;
              ctx.lineTo(cx + sx * scale, cy - sy * scale);
            }
            ctx.strokeStyle =
              s % 4 === 0
                ? 'rgba(255, 226, 158, 0.36)'
                : s % 4 === 1
                  ? 'rgba(244, 196, 108, 0.34)'
                  : s % 4 === 2
                    ? 'rgba(255, 133, 99, 0.3)'
                    : 'rgba(70, 214, 232, 0.28)';
            ctx.lineWidth = 1.25;
            ctx.stroke();
          }
        }

        const dt = 0.016;
        const activeCount = compact ? 1350 : VORTEX_PARTICLE_COUNT;

        // Batch particles into 4 additive color buckets for 60fps density!
        const buckets: { color: string; width: number; segs: number[] }[] = [
          { color: 'rgba(255, 226, 158, 0.72)', width: 1.8, segs: [] }, // Starlight Gold
          { color: 'rgba(244, 196, 108, 0.62)', width: 1.5, segs: [] }, // Solar Champagne
          { color: 'rgba(255, 133, 99, 0.56)', width: 1.35, segs: [] }, // Amber-Coral
          { color: 'rgba(70, 214, 232, 0.54)', width: 1.3, segs: [] }, // Starlight Cyan
        ];

        for (let i = 0; i < activeCount; i++) {
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
            if (vp.age[i] > vp.maxAge[i] || r > 3.25 || (r < 0.04 && p.lambda < -0.04)) {
              const ang = (i * 2.39996 + p.time * 1.45) % (Math.PI * 2);
              const spawnR =
                p.lambda >= 0
                  ? 0.14 + (i % 11) * 0.065
                  : 0.75 + ((i * 13) % 19) * 0.11;
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
          const bIdx =
            speed > 2.95 ? 0 : speed > 1.95 ? 2 : vp.band[i] === 3 ? 3 : 1;
          const sx = cx + x * scale;
          const sy = cy - y * scale;
          const tailX = cx + (x - (x - px) * 2.5) * scale;
          const tailY = cy - (y - (y - py) * 2.5) * scale;
          buckets[bIdx].segs.push(tailX, tailY, sx, sy);
        }

        ctx.globalCompositeOperation = 'lighter';
        for (const b of buckets) {
          if (b.segs.length === 0) continue;
          ctx.strokeStyle = b.color;
          ctx.lineWidth = b.width;
          ctx.beginPath();
          for (let k = 0; k < b.segs.length; k += 4) {
            ctx.moveTo(b.segs[k], b.segs[k + 1]);
            ctx.lineTo(b.segs[k + 2], b.segs[k + 3]);
          }
          ctx.stroke();
        }

        // Draw click shockwave rings
        for (const sw of waves) {
          ctx.strokeStyle = `rgba(255, 226, 158, ${(sw.alpha * 0.8).toFixed(2)})`;
          ctx.lineWidth = 1.6;
          ctx.beginPath();
          ctx.arc(cx + sw.x * scale, cy - sw.y * scale, sw.r * scale, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Luminous inner Singularity Ring & core beacons
        const drawCore = (gx: number, gy: number, innerColor: string, outerColor: string, rad: number) => {
          const sx = cx + gx * scale;
          const sy = cy - gy * scale;
          const grad = ctx.createRadialGradient(sx, sy, 1, sx, sy, rad);
          grad.addColorStop(0, '#FFFFFF');
          grad.addColorStop(0.28, innerColor);
          grad.addColorStop(0.65, outerColor);
          grad.addColorStop(1, 'transparent');
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(sx, sy, rad, 0, Math.PI * 2);
          ctx.fill();
        };

        if (p.dipole) {
          drawCore(-0.86, 0, '#46D6E8', 'rgba(70, 214, 232, 0.25)', 30);
          drawCore(0.86, 0, '#FFE29E', 'rgba(244, 196, 108, 0.28)', 30);
        } else {
          // Bright inner orbital singularity ring (f_03.jpg signature)
          ctx.strokeStyle = 'rgba(255, 226, 158, 0.46)';
          ctx.lineWidth = 1.3;
          ctx.beginPath();
          ctx.ellipse(cx, cy, scale * 0.42, scale * 0.26, -0.22, 0, Math.PI * 2);
          ctx.stroke();

          drawCore(0, 0, '#FFE29E', 'rgba(244, 196, 108, 0.34)', 34);
          drawCore(satX, satY, '#FF8563', 'rgba(255, 133, 99, 0.22)', 24);
        }

        if (!compact && width > 560) {
          const satScreenX = cx + satX * scale;
          const satScreenY = cy - satY * scale;
          callouts.push(
            {
              anchorX: cx + scale * 0.38,
              anchorY: cy - scale * 0.14,
              boxX: width - 166,
              boxY: 22,
              title: 'SINGULARITY CORE',
              subtitle: `CURL Ω ${p.omega.toFixed(2)} · DIV λ ${p.lambda.toFixed(2)}`,
              accent: '#FFE29E',
            },
            {
              anchorX: satScreenX,
              anchorY: satScreenY,
              boxX: 20,
              boxY: 22,
              title: p.pointerActive ? 'ATTRACTOR LOCK' : 'ORBITAL PLUME',
              subtitle: `(${satX.toFixed(2)}, ${satY.toFixed(2)}) · ${activeCount} PTS`,
              accent: '#FF8563',
            }
          );
        }
      }

      // -------------------------------------------------------------------------
      // MODE 2: LORENZ STRANGE ATTRACTOR (DUAL DIVERGING RK4 ORBITS + DUST)
      // -------------------------------------------------------------------------
      if (mode === 'lorenz') {
        const state = lorenzStateRef.current;
        const dt = 0.0068;
        const s = 10;
        const b = 8 / 3;
        const r = p.rho;

        const integrateRK4 = (q: { x: number; y: number; z: number }) => {
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
            integrateRK4(state.a);
            integrateRK4(state.b);
            state.trailA.push([state.a.x, state.a.y, state.a.z]);
            state.trailB.push([state.b.x, state.b.y, state.b.z]);
            if (state.trailA.length > LORENZ_MAX_TRAIL) state.trailA.shift();
            if (state.trailB.length > LORENZ_MAX_TRAIL) state.trailB.shift();
          }
          p.yaw = -0.62 + Math.sin(p.time * 0.42) * 0.18;
          p.pitch = 0.14 + Math.cos(p.time * 0.31) * 0.06;
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
        const lorenzScale = Math.min(width, height) * 0.0178;

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

        const drawTrail = (
          trail: [number, number, number][],
          rgb: string,
          glowRgb: string
        ): [number, number] => {
          if (trail.length < 2) return [cx, cy];
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
            ctx.strokeStyle = `rgba(${glowRgb}, ${(0.06 + frac * 0.16).toFixed(2)})`;
            ctx.lineWidth = 4.2 + frac * 2.2;
            ctx.stroke();

            ctx.strokeStyle = `rgba(${rgb}, ${(0.18 + frac * 0.78).toFixed(2)})`;
            ctx.lineWidth = 1.1 + frac * 1.5;
            ctx.stroke();
          }
          const head = project(trail[trail.length - 1]);
          const glow = ctx.createRadialGradient(head[0], head[1], 1, head[0], head[1], 22);
          glow.addColorStop(0, '#FFFFFF');
          glow.addColorStop(0.25, `rgba(${rgb}, 0.95)`);
          glow.addColorStop(1, 'transparent');
          ctx.fillStyle = glow;
          ctx.beginPath();
          ctx.arc(head[0], head[1], 22, 0, Math.PI * 2);
          ctx.fill();
          return head;
        };

        const headA = drawTrail(state.trailA, '70, 214, 232', '70, 214, 232');
        const headB = drawTrail(state.trailB, '255, 226, 158', '255, 133, 99');

        if (!compact && width > 560) {
          const sep = Math.hypot(
            state.a.x - state.b.x,
            state.a.y - state.b.y,
            state.a.z - state.b.z
          );
          callouts.push(
            {
              anchorX: headA[0],
              anchorY: headA[1],
              boxX: 20,
              boxY: 22,
              title: 'ORBIT A (CYAN)',
              subtitle: `z = ${state.a.z.toFixed(1)} · ρ = ${p.rho}`,
              accent: '#46D6E8',
            },
            {
              anchorX: headB[0],
              anchorY: headB[1],
              boxX: width - 166,
              boxY: 22,
              title: 'ORBIT B (GOLD)',
              subtitle: `SEPARATION δ = ${sep.toFixed(2)}`,
              accent: '#FFE29E',
            }
          );
        }
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
                i === 0 ? 'rgba(244, 196, 108, 0.32)' : 'rgba(184, 137, 56, 0.18)';
              ctx.lineWidth = 1;
              ctx.beginPath();
              ctx.arc(prevX, prevY, r, 0, Math.PI * 2);
              ctx.stroke();

              ctx.strokeStyle = 'rgba(255, 226, 158, 0.65)';
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
          ctx.strokeStyle = 'rgba(244, 196, 108, 0.24)';
          ctx.lineWidth = 6;
          ctx.stroke();

          ctx.strokeStyle = '#45E6A6';
          ctx.lineWidth = 2;
          ctx.stroke();
        }

        const tipGlow = ctx.createRadialGradient(tipX, tipY, 1, tipX, tipY, 20);
        tipGlow.addColorStop(0, '#FFFFFF');
        tipGlow.addColorStop(0.32, '#FFE29E');
        tipGlow.addColorStop(0.65, 'rgba(69, 230, 166, 0.45)');
        tipGlow.addColorStop(1, 'transparent');
        ctx.fillStyle = tipGlow;
        ctx.beginPath();
        ctx.arc(tipX, tipY, 20, 0, Math.PI * 2);
        ctx.fill();

        if (!compact && width > 560) {
          callouts.push(
            {
              anchorX: tipX,
              anchorY: tipY,
              boxX: width - 166,
              boxY: 22,
              title: 'PHASOR SUM z(t)',
              subtitle: `N = ${count} EPICYCLES`,
              accent: '#45E6A6',
            },
            {
              anchorX: cx,
              anchorY: cy,
              boxX: 20,
              boxY: 22,
              title: 'FUNDAMENTAL c₀',
              subtitle: `CONTOUR: ${fourierShape.toUpperCase()}`,
              accent: '#F4C46C',
            }
          );
        }
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
          const ax = zx - z1x;
          const ay = zy - z1y;
          const bx = zx - z2x;
          const by = zy - z2y;
          const nx = ax * bx - ay * by;
          const ny = ax * by + ay * bx;
          const dx = zx - p1x;
          const dy = zy - p1y;
          const d2 = dx * dx + dy * dy + 0.035;
          const fx = (nx * dx + ny * dy) / d2;
          const fy = (ny * dx - nx * dy) / d2;
          const mag = Math.hypot(fx, fy) + 1e-4;
          const clamp = Math.min(2.4, mag);
          return [(fx / mag) * clamp, (fy / mag) * clamp];
        };

        if (clearFully) {
          ctx.globalCompositeOperation = 'lighter';
          for (let k = 0; k < 56; k++) {
            let sx = ((k % 14) / 13 - 0.5) * 3.3;
            let sy = (Math.floor(k / 14) / 3 - 0.5) * 2.1;
            ctx.beginPath();
            ctx.moveTo(cx + sx * scale, cy - sy * scale);
            for (let step = 0; step < 24; step++) {
              const [vx, vy] = evalF(sx, sy);
              sx += vx * 0.033;
              sy += vy * 0.033;
              ctx.lineTo(cx + sx * scale, cy - sy * scale);
            }
            ctx.strokeStyle =
              k % 3 === 0
                ? 'rgba(244, 196, 108, 0.34)'
                : k % 3 === 1
                  ? 'rgba(255, 133, 99, 0.32)'
                  : 'rgba(70, 214, 232, 0.30)';
            ctx.lineWidth = 1.25;
            ctx.stroke();
          }
        }

        const dt = 0.021;
        const activeCount = compact ? 820 : COMPLEX_PARTICLE_COUNT;
        const buckets: { color: string; segs: number[] }[] = [
          { color: 'rgba(255, 226, 158, 0.54)', segs: [] }, // Gold
          { color: 'rgba(255, 133, 99, 0.52)', segs: [] }, // Coral
          { color: 'rgba(70, 214, 232, 0.50)', segs: [] }, // Cyan
          { color: 'rgba(69, 230, 166, 0.48)', segs: [] }, // Jade
        ];

        for (let i = 0; i < activeCount; i++) {
          let x = cp.x[i];
          let y = cp.y[i];
          const px = x;
          const py = y;
          const [vx, vy] = evalF(x, y);
          if (advancePhysics) {
            x += vx * dt;
            y += vy * dt;
            cp.age[i] += 1;
            if (cp.age[i] > 110 || Math.hypot(x, y) > 3.15) {
              x = ((i % 38) / 37 - 0.5) * 3.8;
              y = (Math.floor(i / 38) / 29 - 0.5) * 2.6;
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
          const qIdx = phase > 1.57 ? 0 : phase > 0 ? 1 : phase > -1.57 ? 2 : 3;
          buckets[qIdx].segs.push(
            cx + px * scale,
            cy - py * scale,
            cx + x * scale,
            cy - y * scale
          );
        }

        ctx.globalCompositeOperation = 'lighter';
        ctx.lineWidth = 1.35;
        for (const b of buckets) {
          if (b.segs.length === 0) continue;
          ctx.strokeStyle = b.color;
          ctx.beginPath();
          for (let k = 0; k < b.segs.length; k += 4) {
            ctx.moveTo(b.segs[k], b.segs[k + 1]);
            ctx.lineTo(b.segs[k + 2], b.segs[k + 3]);
          }
          ctx.stroke();
        }

        const drawMarker = (mx: number, my: number, color: string, label: string) => {
          const sx = cx + mx * scale;
          const sy = cy - my * scale;
          const halo = ctx.createRadialGradient(sx, sy, 1, sx, sy, 20);
          halo.addColorStop(0, `${color}66`);
          halo.addColorStop(1, 'transparent');
          ctx.fillStyle = halo;
          ctx.beginPath();
          ctx.arc(sx, sy, 20, 0, Math.PI * 2);
          ctx.fill();

          ctx.strokeStyle = color;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(sx, sy, 7, 0, Math.PI * 2);
          ctx.stroke();
          ctx.font = '600 10px "JetBrains Mono", monospace';
          ctx.fillStyle = color;
          ctx.textAlign = 'left';
          ctx.textBaseline = 'middle';
          ctx.fillText(label, sx + 11, sy);
        };
        drawMarker(z1x, z1y, '#45E6A6', 'z₁=0');
        drawMarker(z2x, z2y, '#45E6A6', 'z₂=0');
        drawMarker(p1x, p1y, '#FF8563', 'p₁=∞');

        if (!compact && width > 560) {
          callouts.push(
            {
              anchorX: cx + z1x * scale,
              anchorY: cy - z1y * scale,
              boxX: 20,
              boxY: 22,
              title: 'ZERO ROOT z₁',
              subtitle: `(${z1x.toFixed(2)}, ${z1y.toFixed(2)}i)`,
              accent: '#45E6A6',
            },
            {
              anchorX: cx + p1x * scale,
              anchorY: cy - p1y * scale,
              boxX: width - 166,
              boxY: 22,
              title: 'SINGULARITY POLE',
              subtitle: `|f(z)| → ∞ AT p₁`,
              accent: '#FF8563',
            }
          );
        }
      }

      if (callouts.length > 0) {
        drawHudCallouts(ctx, width, height, callouts);
      }

      ctx.restore();
    },
    [compact, fourierShape]
  );

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const updateSize = () => {
      const rect = container.getBoundingClientRect();
      const width = Math.max(240, Math.floor(rect.width));
      const height = Math.max(220, Math.floor(rect.height));
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
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
      { rootMargin: '150px', threshold: 0.02 }
    );
    io.observe(container);

    return () => {
      ro.disconnect();
      io.disconnect();
    };
  }, [drawFrame]);

  useEffect(() => {
    drawFrame(true, false);
  }, [activeMode, omega, lambda, dipole, rho, fourierShape, harmonics, orbitPoles, drawFrame]);

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
    const scale = Math.min(rect.width, rect.height) * 0.235;
    const mx = (e.clientX - rect.left - rect.width * 0.5) / scale;
    const my = -(e.clientY - rect.top - rect.height * 0.5) / scale;
    paramsRef.current.pointerX = mx;
    paramsRef.current.pointerY = my;
    paramsRef.current.pointerActive = true;
    if (activeMode === 'lorenz' && e.buttons === 1) {
      paramsRef.current.yaw += e.movementX * 0.008;
      paramsRef.current.pitch = Math.max(
        -1.1,
        Math.min(1.1, paramsRef.current.pitch + e.movementY * 0.008)
      );
      drawFrame(true, false);
    }
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!interactive) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const scale = Math.min(rect.width, rect.height) * 0.235;
    const mx = (e.clientX - rect.left - rect.width * 0.5) / scale;
    const my = -(e.clientY - rect.top - rect.height * 0.5) / scale;
    if (activeMode === 'vortex') {
      shockwavesRef.current.push({ x: mx, y: my, r: 0.06, alpha: 1.0 });
      if (shockwavesRef.current.length > 5) shockwavesRef.current.shift();
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
    <div
      className="rounded-2xl overflow-hidden bg-[#060609] border text-[#F7F4EC]"
      style={{
        borderColor: 'rgba(244, 196, 108, 0.17)',
        boxShadow: 'inset 0 1px 0 rgba(255, 232, 178, 0.14), 0 24px 54px -26px rgba(0, 0, 0, 0.95)',
      }}
    >
      {/* Top Instrument Bar */}
      <div
        className="px-4 py-2.5 border-b bg-[#0B0C12]/95 flex flex-wrap items-center justify-between gap-3"
        style={{ borderColor: 'rgba(244, 196, 108, 0.17)' }}
      >
        <div className="flex items-center gap-2.5">
          <span
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: meta.accent, boxShadow: `0 0 10px ${meta.accent}` }}
          />
          <span className="font-mono-data text-[10px] uppercase tracking-[0.18em] text-[#FFE29E]">
            {meta.badge}
          </span>
          {!compact && (
            <span className="hidden sm:inline text-xs text-[#A8B2C6]">· {meta.subtitle}</span>
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
                  className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors ${
                    active
                      ? 'text-[#060609] font-semibold'
                      : 'text-[#A8B2C6] bg-[#11131C] border border-[rgba(244,196,108,0.17)] hover:text-[#F7F4EC]'
                  }`}
                  style={
                    active
                      ? {
                          backgroundColor: MODE_META[m].accent,
                          boxShadow: `0 0 16px -4px ${MODE_META[m].accent}`,
                        }
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
            className="p-1.5 rounded-full bg-[#11131C] border border-[rgba(244,196,108,0.22)] text-[#F7F4EC] hover:border-[#F4C46C]"
          >
            {playing ? <Pause className="w-3.5 h-3.5 text-[#F4C46C]" /> : <Play className="w-3.5 h-3.5 text-[#F4C46C]" />}
          </button>
          <button
            type="button"
            onClick={() => {
              shockwavesRef.current.length = 0;
              if (activeMode === 'vortex') resetVortexParticles();
              else if (activeMode === 'lorenz') resetLorenz();
              else if (activeMode === 'complex') resetComplexParticles();
              else fourierTrailRef.current.length = 0;
              drawFrame(true, false);
            }}
            aria-label="Reset manifold"
            className="p-1.5 rounded-full bg-[#11131C] border border-[rgba(244,196,108,0.22)] text-[#A8B2C6] hover:text-[#F7F4EC] hover:border-[#F4C46C]"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Kinetic Canvas Viewport */}
      <div ref={containerRef} className={`relative w-full ${heightClass} bg-[#060609]`}>
        <canvas
          ref={canvasRef}
          onPointerMove={handlePointerMove}
          onPointerDown={handlePointerDown}
          onPointerLeave={handlePointerLeave}
          className="block w-full h-full touch-none cursor-crosshair"
        />

        {/* Bottom-left live equation & telemetry glass pill */}
        <div
          className="pointer-events-none absolute bottom-3 left-3 max-w-[92%] rounded-lg px-3.5 py-2 text-xs bg-[#0B0C12]/90 backdrop-blur-md border"
          style={{ borderColor: 'rgba(244, 196, 108, 0.24)' }}
        >
          {activeMode === 'vortex' && (
            <div className="space-y-0.5">
              <MathTex
                tex={`\\mathbf{F}(x,y) = \\langle ${lambda.toFixed(2)}x ${omega >= 0 ? '-' : '+'} ${Math.abs(omega).toFixed(2)}y,\\; ${omega.toFixed(2)}x ${lambda >= 0 ? '+' : '-'} ${Math.abs(lambda).toFixed(2)}y \\rangle`}
                className="text-[#F7F4EC]"
              />
              <div className="font-mono-data text-[10px] text-[#F4C46C]">
                {dipole ? 'Counter-Rotating Vortex Dipole' : vortexClassification}
              </div>
            </div>
          )}
          {activeMode === 'lorenz' && (
            <div className="space-y-0.5">
              <MathTex
                tex={`\\dot{x}=10(y-x),\\quad \\dot{y}=x(${rho}-z)-y,\\quad \\dot{z}=xy-\\tfrac{8}{3}z`}
                className="text-[#F7F4EC]"
              />
              <div className="font-mono-data text-[10px] text-[#FFE29E]">
                Orbit Separation δ(t) = {lorenzDelta.toFixed(3)} · Initial Δx₀ = 0.002
              </div>
            </div>
          )}
          {activeMode === 'fourier' && (
            <div className="space-y-0.5">
              <MathTex
                tex={`z(t) \\approx \\sum_{k=1}^{${harmonics}} c_k e^{i n_k t}`}
                className="text-[#F7F4EC]"
              />
              <div className="font-mono-data text-[10px] text-[#45E6A6]">
                Active rotating phasors: {harmonics} · Shape: {fourierShape}
              </div>
            </div>
          )}
          {activeMode === 'complex' && (
            <div className="space-y-0.5">
              <MathTex
                tex="f(z) = \dfrac{(z - z_1)(z - z_2)}{z - p_1}"
                className="text-[#F7F4EC]"
              />
              <div className="font-mono-data text-[10px] text-[#FF8563]">
                Holomorphic phase trajectories · 2 zeros (jade), 1 pole (coral)
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mode-Specific Precision Control Strip */}
      {!compact && (
        <div
          className="px-4 py-3 border-t bg-[#0B0C12]/95 flex flex-wrap items-center gap-5 text-xs"
          style={{ borderColor: 'rgba(244, 196, 108, 0.17)' }}
        >
          {activeMode === 'vortex' && (
            <>
              <label className="flex-1 min-w-[160px] space-y-1">
                <span className="flex justify-between font-mono-data text-[10px] text-[#A8B2C6]">
                  <span>Curl Ω (Rotation)</span>
                  <span className="text-[#FFE29E]">{omega.toFixed(2)} rad/s</span>
                </span>
                <input
                  type="range"
                  min={-2.5}
                  max={2.5}
                  step={0.05}
                  value={omega}
                  onChange={(e) => setOmega(Number(e.target.value))}
                  className="meridian-slider"
                  style={{ ['--slider-accent' as string]: '#F4C46C' }}
                />
              </label>

              <label className="flex-1 min-w-[160px] space-y-1">
                <span className="flex justify-between font-mono-data text-[10px] text-[#A8B2C6]">
                  <span>Divergence λ</span>
                  <span className="text-[#FF8563]">{lambda.toFixed(2)}</span>
                </span>
                <input
                  type="range"
                  min={-1.0}
                  max={0.9}
                  step={0.02}
                  value={lambda}
                  onChange={(e) => setLambda(Number(e.target.value))}
                  className="meridian-slider"
                  style={{ ['--slider-accent' as string]: '#FF8563' }}
                />
              </label>

              <button
                type="button"
                onClick={() => setDipole((d) => !d)}
                className={`px-3 py-1.5 rounded-full text-xs font-mono-data border transition-colors ${
                  dipole
                    ? 'bg-[#46D6E8]/15 text-[#46D6E8] border-[#46D6E8]/50'
                    : 'bg-[#11131C] text-[#A8B2C6] border-[rgba(244,196,108,0.2)]'
                }`}
              >
                {dipole ? 'Topology: Twin Dipole' : 'Topology: Single Core'}
              </button>
            </>
          )}

          {activeMode === 'lorenz' && (
            <>
              <label className="flex-1 min-w-[200px] space-y-1">
                <span className="flex justify-between font-mono-data text-[10px] text-[#A8B2C6]">
                  <span>Rayleigh Parameter ρ</span>
                  <span className="text-[#FFE29E]">{rho.toFixed(1)}</span>
                </span>
                <input
                  type="range"
                  min={20}
                  max={34}
                  step={0.5}
                  value={rho}
                  onChange={(e) => setRho(Number(e.target.value))}
                  className="meridian-slider"
                  style={{ ['--slider-accent' as string]: '#FFE29E' }}
                />
              </label>
              <button
                type="button"
                onClick={() => {
                  resetLorenz();
                  drawFrame(true, false);
                }}
                className="px-3 py-1.5 rounded-full text-xs font-mono-data bg-[#F4C46C]/15 text-[#FFE29E] border border-[#F4C46C]/40 hover:bg-[#F4C46C]/25"
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
                    className={`px-2.5 py-1 rounded-full text-[11px] font-mono-data capitalize border ${
                      fourierShape === sh
                        ? 'bg-[#45E6A6]/15 text-[#45E6A6] border-[#45E6A6]/50'
                        : 'bg-[#11131C] text-[#A8B2C6] border-[rgba(244,196,108,0.17)]'
                    }`}
                  >
                    {sh}
                  </button>
                ))}
              </div>
              <label className="flex-1 min-w-[180px] space-y-1">
                <span className="flex justify-between font-mono-data text-[10px] text-[#A8B2C6]">
                  <span>Rotating Epicycles N</span>
                  <span className="text-[#45E6A6]">{harmonics} terms</span>
                </span>
                <input
                  type="range"
                  min={2}
                  max={18}
                  step={1}
                  value={harmonics}
                  onChange={(e) => setHarmonics(Number(e.target.value))}
                  className="meridian-slider"
                  style={{ ['--slider-accent' as string]: '#45E6A6' }}
                />
              </label>
            </>
          )}

          {activeMode === 'complex' && (
            <div className="flex items-center justify-between w-full gap-4">
              <span className="text-[#A8B2C6]">
                Meromorphic vector field: jade rings mark roots{' '}
                <code className="text-[#45E6A6]">z₁, z₂</code>, coral marks pole{' '}
                <code className="text-[#FF8563]">p₁</code>.
              </span>
              <button
                type="button"
                onClick={() => setOrbitPoles((v) => !v)}
                className={`px-3 py-1.5 rounded-full text-xs font-mono-data border ${
                  orbitPoles
                    ? 'bg-[#FF8563]/15 text-[#FF8563] border-[#FF8563]/50'
                    : 'bg-[#11131C] text-[#A8B2C6] border-[rgba(244,196,108,0.17)]'
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
