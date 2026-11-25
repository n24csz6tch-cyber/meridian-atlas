import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Eraser, Pause, Play, RotateCcw } from 'lucide-react';
import { MathTex } from '../../components/MathTex';
import { useReducedMotion } from '../../hooks/useReducedMotion';

export interface FourierEpicyclesEngineProps {
  compact?: boolean;
  heightClass?: string;
}

type FourierPresetId = 'square' | 'sawtooth' | 'heart' | 'star' | 'treble-infinity';

interface EpicycleTerm {
  freq: number;
  amp: number;
  phase: number;
}

interface FourierPresetConfig {
  id: FourierPresetId;
  label: string;
  mode: 'waveform' | 'contour';
  accent: string;
  badge: string;
  teenNote: string;
}

interface WaveSample {
  t: number;
  yNorm: number;
}

interface TrailSample {
  xNorm: number;
  yNorm: number;
}

const MAX_HARMONICS = 15;
const DFT_SAMPLES = 160;
const MAX_TRAIL_SAMPLES = 280;

const FOURIER_PRESETS: FourierPresetConfig[] = [
  {
    id: 'square',
    label: 'Square Wave',
    mode: 'waveform',
    accent: '#F4C46C',
    badge: 'Odd Harmonics',
    teenNote:
      'Only odd circles (1x, 3x, 5x...) add up here! Each smaller, faster circle flattens the tops and sharpens the vertical cliff edges.',
  },
  {
    id: 'sawtooth',
    label: 'Sawtooth',
    mode: 'waveform',
    accent: '#46D6E8',
    badge: 'All Integer Harmonics',
    teenNote:
      'Using every integer speed (1x, 2x, 3x...) with alternating signs builds a steady ramp that snaps back vertically at every cycle.',
  },
  {
    id: 'heart',
    label: 'Heart Curve',
    mode: 'contour',
    accent: '#FF8563',
    badge: '2D Closed DFT',
    teenNote:
      'One circle draws an oval, 3 circles bend the top cleft, and 15 epicycles lock cleanly onto the sharp bottom point.',
  },
  {
    id: 'star',
    label: '5-Point Star',
    mode: 'contour',
    accent: '#FFE29E',
    badge: '5-Fold Symmetry',
    teenNote:
      'Because a 5-point star repeats every 72°, its hidden recipe skips straight to symmetric harmonic frequencies (1, -4, +6, -9...).',
  },
  {
    id: 'treble-infinity',
    label: 'Treble Infinity',
    mode: 'contour',
    accent: '#45E6A6',
    badge: 'Figure-8 Loop',
    teenNote:
      'Counter-rotating circles (positive and negative frequencies!) weave in opposite directions to cross cleanly through the center.',
  },
];

function resampleClosedPath(rawPoints: Array<{ x: number; y: number }>, targetCount: number): Array<{ x: number; y: number }> {
  const n = rawPoints.length;
  const cumLen: number[] = [0];
  let total = 0;

  for (let i = 0; i < n; i++) {
    const a = rawPoints[i];
    const b = rawPoints[(i + 1) % n];
    total += Math.hypot(b.x - a.x, b.y - a.y);
    cumLen.push(total);
  }

  const resampled: Array<{ x: number; y: number }> = [];
  let seg = 0;

  for (let k = 0; k < targetCount; k++) {
    const targetDist = (k / targetCount) * total;
    while (seg < n - 1 && cumLen[seg + 1] < targetDist) {
      seg++;
    }
    const segStart = cumLen[seg];
    const segLen = Math.max(1e-8, cumLen[seg + 1] - segStart);
    const alpha = (targetDist - segStart) / segLen;
    const p0 = rawPoints[seg];
    const p1 = rawPoints[(seg + 1) % n];
    resampled.push({
      x: p0.x + (p1.x - p0.x) * alpha,
      y: p0.y + (p1.y - p0.y) * alpha,
    });
  }

  // Center at centroid and normalize radius to <= 1.0
  let meanX = 0;
  let meanY = 0;
  for (const pt of resampled) {
    meanX += pt.x;
    meanY += pt.y;
  }
  meanX /= resampled.length;
  meanY /= resampled.length;

  let maxR = 1e-6;
  const centered = resampled.map((pt) => {
    const x = pt.x - meanX;
    const y = pt.y - meanY;
    maxR = Math.max(maxR, Math.hypot(x, y));
    return { x, y };
  });

  return centered.map((pt) => ({
    x: pt.x / maxR,
    y: pt.y / maxR,
  }));
}

function computeDftTerms(points: Array<{ x: number; y: number }>, maxFreq = 40): EpicycleTerm[] {
  const m = points.length;
  const terms: EpicycleTerm[] = [];

  for (let f = -maxFreq; f <= maxFreq; f++) {
    if (f === 0) continue;
    let re = 0;
    let im = 0;
    for (let k = 0; k < m; k++) {
      const phi = (2 * Math.PI * f * k) / m;
      const cosPhi = Math.cos(phi);
      const sinPhi = Math.sin(phi);
      re += points[k].x * cosPhi + points[k].y * sinPhi;
      im += points[k].y * cosPhi - points[k].x * sinPhi;
    }
    re /= m;
    im /= m;
    const amp = Math.hypot(re, im);
    if (amp > 1e-4) {
      terms.push({
        freq: f,
        amp,
        phase: Math.atan2(im, re),
      });
    }
  }

  terms.sort((a, b) => b.amp - a.amp);
  return terms.slice(0, MAX_HARMONICS);
}

function buildContourDataset(id: 'heart' | 'star' | 'treble-infinity'): {
  points: Array<{ x: number; y: number }>;
  terms: EpicycleTerm[];
} {
  const dense: Array<{ x: number; y: number }> = [];

  if (id === 'heart') {
    const count = 480;
    for (let i = 0; i < count; i++) {
      const t = (i / count) * Math.PI * 2;
      const x = 16 * Math.pow(Math.sin(t), 3);
      const yMath = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
      // Screen space y-down
      dense.push({ x, y: -yMath });
    }
  } else if (id === 'star') {
    const vertices: Array<{ x: number; y: number }> = [];
    for (let j = 0; j < 10; j++) {
      const ang = Math.PI / 2 + (j * Math.PI) / 5;
      const rad = j % 2 === 0 ? 1.0 : 0.41;
      vertices.push({ x: rad * Math.cos(ang), y: -rad * Math.sin(ang) });
    }
    const perEdge = 32;
    for (let j = 0; j < vertices.length; j++) {
      const v0 = vertices[j];
      const v1 = vertices[(j + 1) % vertices.length];
      for (let s = 0; s < perEdge; s++) {
        const u = s / perEdge;
        dense.push({
          x: v0.x + (v1.x - v0.x) * u,
          y: v0.y + (v1.y - v0.y) * u,
        });
      }
    }
  } else {
    const count = 480;
    for (let i = 0; i < count; i++) {
      const t = (i / count) * Math.PI * 2;
      const x = 1.1 * Math.sin(t) - 0.16 * Math.cos(2 * t);
      const yMath = 0.72 * Math.sin(2 * t) + 0.22 * Math.sin(3 * t);
      dense.push({ x, y: -yMath });
    }
  }

  const points = resampleClosedPath(dense, DFT_SAMPLES);
  const terms = computeDftTerms(points);
  return { points, terms };
}

const CONTOUR_LIBRARY = {
  heart: buildContourDataset('heart'),
  star: buildContourDataset('star'),
  'treble-infinity': buildContourDataset('treble-infinity'),
};

function getWaveformTerms(id: 'square' | 'sawtooth', nTerms: number): EpicycleTerm[] {
  const terms: EpicycleTerm[] = [];
  if (id === 'square') {
    for (let k = 0; k < nTerms; k++) {
      const freq = 2 * k + 1;
      terms.push({
        freq,
        amp: 4 / (Math.PI * freq),
        phase: 0,
      });
    }
  } else {
    for (let k = 1; k <= nTerms; k++) {
      terms.push({
        freq: k,
        amp: 2 / (Math.PI * k),
        phase: k % 2 === 0 ? Math.PI : 0,
      });
    }
  }
  return terms;
}

function evalEpicyclePosition(terms: EpicycleTerm[], t: number): { x: number; y: number } {
  let x = 0;
  let y = 0;
  for (const term of terms) {
    const ang = term.freq * t + term.phase;
    x += term.amp * Math.cos(ang);
    y += term.amp * Math.sin(ang);
  }
  return { x, y };
}

function idealWaveformValue(id: 'square' | 'sawtooth', t: number): number {
  const wrapped = ((t % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
  if (id === 'square') {
    return wrapped < Math.PI ? 1 : -1;
  }
  // Sawtooth aligned with 2/pi * sum((-1)^(n+1)/n * sin(nt))
  if (wrapped < Math.PI) {
    return wrapped / Math.PI;
  }
  return (wrapped - Math.PI * 2) / Math.PI;
}

function buildFourierTex(preset: FourierPresetId, harmonicsN: number): string {
  if (preset === 'square') {
    const parts: string[] = [];
    const shown = Math.min(3, harmonicsN);
    for (let k = 0; k < shown; k++) {
      const m = 2 * k + 1;
      parts.push(m === 1 ? '\\sin t' : `\\frac{\\sin(${m}t)}{${m}}`);
    }
    if (harmonicsN > 3) {
      const lastM = 2 * harmonicsN - 1;
      parts.push(`\\cdots + \\frac{\\sin(${lastM}t)}{${lastM}}`);
    }
    return `f_{${harmonicsN}}(t) = \\frac{4}{\\pi}\\!\\left(${parts.join(' + ')}\\right)`;
  }

  if (preset === 'sawtooth') {
    const parts: string[] = [];
    const shown = Math.min(3, harmonicsN);
    for (let n = 1; n <= shown; n++) {
      if (n === 1) parts.push('\\sin t');
      else {
        const sign = n % 2 === 0 ? ' - ' : ' + ';
        parts.push(`${sign}\\frac{\\sin(${n}t)}{${n}}`);
      }
    }
    if (harmonicsN > 3) {
      const signLast = harmonicsN % 2 === 0 ? ' - ' : ' + ';
      parts.push(` + \\cdots${signLast}\\frac{\\sin(${harmonicsN}t)}{${harmonicsN}}`);
    }
    return `f_{${harmonicsN}}(t) = \\frac{2}{\\pi}\\!\\left(${parts.join('')}\\right)`;
  }

  const terms = CONTOUR_LIBRARY[preset].terms.slice(0, harmonicsN);
  const topAmp = terms[0]?.amp ?? 0;
  return `z_{${harmonicsN}}(t) = \\sum_{k=1}^{${harmonicsN}} r_k\\,e^{i(\\omega_k t + \\phi_k)}, \\quad r_1 = ${topAmp.toFixed(2)}`;
}

export function FourierEpicyclesEngine({
  compact = false,
  heightClass,
}: {
  compact?: boolean;
  heightClass?: string;
} = {}): JSX.Element {
  const reducedMotion = useReducedMotion();
  const [presetId, setPresetId] = useState<FourierPresetId>('square');
  const [harmonicsN, setHarmonicsN] = useState(5);
  const [speed, setSpeed] = useState(1.0);
  const [playing, setPlaying] = useState(true);
  const [isVisible, setIsVisible] = useState(true);

  const hostRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const preset = useMemo(
    () => FOURIER_PRESETS.find((p) => p.id === presetId) ?? FOURIER_PRESETS[0],
    [presetId]
  );

  const activeTerms = useMemo(() => {
    if (presetId === 'square' || presetId === 'sawtooth') {
      return getWaveformTerms(presetId, harmonicsN);
    }
    return CONTOUR_LIBRARY[presetId].terms.slice(0, harmonicsN);
  }, [presetId, harmonicsN]);

  const stateRef = useRef({
    presetId,
    harmonicsN,
    speed,
    terms: activeTerms,
    theta: 0.4,
    waveSamples: [] as WaveSample[],
    trailSamples: [] as TrailSample[],
  });

  stateRef.current.presetId = presetId;
  stateRef.current.harmonicsN = harmonicsN;
  stateRef.current.speed = speed;
  stateRef.current.terms = activeTerms;

  const clearTrace = useCallback(() => {
    stateRef.current.waveSamples = [];
    stateRef.current.trailSamples = [];
  }, []);

  // Pre-seed waveform / trail when switching presets or harmonics so the screen is immediately rich
  const seedTraceForPreset = useCallback((nextPreset: FourierPresetId, nextTerms: EpicycleTerm[]) => {
    const s = stateRef.current;
    s.waveSamples = [];
    s.trailSamples = [];

    if (nextPreset === 'square' || nextPreset === 'sawtooth') {
      const span = Math.PI * 3.6;
      const steps = 160;
      const endTheta = s.theta;
      for (let i = steps; i >= 0; i--) {
        const tau = endTheta - (i / steps) * span;
        let yNorm = 0;
        for (const term of nextTerms) {
          yNorm += term.amp * Math.sin(term.freq * tau + term.phase);
        }
        s.waveSamples.push({ t: tau, yNorm });
      }
    } else {
      const steps = 160;
      const span = Math.PI * 1.45;
      for (let i = steps; i >= 0; i--) {
        const tau = s.theta - (i / steps) * span;
        const pt = evalEpicyclePosition(nextTerms, tau);
        s.trailSamples.push({ xNorm: pt.x, yNorm: pt.y });
      }
    }
  }, []);

  useEffect(() => {
    seedTraceForPreset(presetId, activeTerms);
  }, [presetId, activeTerms, seedTraceForPreset]);

  // Pause animation loop offscreen via IntersectionObserver
  useEffect(() => {
    const el = hostRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setIsVisible(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        setIsVisible(entries.some((entry) => entry.isIntersecting));
      },
      { rootMargin: '120px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const drawScene = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (w < 80 || h < 80) return;

    const targetW = Math.floor(w * dpr);
    const targetH = Math.floor(h * dpr);
    if (canvas.width !== targetW || canvas.height !== targetH) {
      canvas.width = targetW;
      canvas.height = targetH;
    }

    const { presetId: pId, terms, theta, waveSamples, trailSamples } = stateRef.current;
    const currentPreset = FOURIER_PRESETS.find((p) => p.id === pId) ?? FOURIER_PRESETS[0];

    ctx.save();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Obsidian void background
    ctx.fillStyle = '#060609';
    ctx.fillRect(0, 0, w, h);

    // Subtle cartographic grid
    ctx.strokeStyle = 'rgba(244, 196, 108, 0.045)';
    ctx.lineWidth = 1;
    const gridStep = 32;
    for (let gx = (w * 0.5) % gridStep; gx < w; gx += gridStep) {
      ctx.beginPath();
      ctx.moveTo(gx, 0);
      ctx.lineTo(gx, h);
      ctx.stroke();
    }
    for (let gy = (h * 0.5) % gridStep; gy < h; gy += gridStep) {
      ctx.beginPath();
      ctx.moveTo(0, gy);
      ctx.lineTo(w, gy);
      ctx.stroke();
    }

    if (currentPreset.mode === 'waveform') {
      const isNarrow = w < 440;
      const cx = isNarrow ? w * 0.25 : w * 0.24;
      const cy = h * 0.52;
      const unitScale = Math.min(w * (isNarrow ? 0.115 : 0.125), h * 0.23);

      const bgGlow = ctx.createRadialGradient(cx, cy, 4, cx, cy, unitScale * 2.2);
      bgGlow.addColorStop(0, 'rgba(244, 196, 108, 0.10)');
      bgGlow.addColorStop(1, 'rgba(6, 6, 9, 0)');
      ctx.fillStyle = bgGlow;
      ctx.fillRect(0, 0, w, h);

      const waveStartX = Math.max(cx + unitScale * 1.65, isNarrow ? w * 0.48 : w * 0.44);
      const waveEndX = w - 16;
      const waveWidth = Math.max(40, waveEndX - waveStartX);
      const waveSpanRad = Math.PI * 3.6;
      const pxPerRad = waveWidth / waveSpanRad;

      // Center equilibrium axis
      ctx.strokeStyle = 'rgba(247, 244, 236, 0.11)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(14, cy);
      ctx.lineTo(waveEndX, cy);
      ctx.stroke();

      // Faint reference target wave (ideal Square or Sawtooth)
      ctx.save();
      ctx.strokeStyle = 'rgba(70, 214, 232, 0.24)';
      ctx.setLineDash([4, 4]);
      ctx.lineWidth = 1.25;
      ctx.beginPath();
      const refSteps = 220;
      for (let i = 0; i <= refSteps; i++) {
        const dx = (i / refSteps) * waveWidth;
        const tau = theta - dx / pxPerRad;
        const val = idealWaveformValue(pId as 'square' | 'sawtooth', tau);
        const rx = waveStartX + dx;
        const ry = cy - val * unitScale;
        if (i === 0) ctx.moveTo(rx, ry);
        else ctx.lineTo(rx, ry);
      }
      ctx.stroke();
      ctx.restore();

      // Nested rotating epicycles tip-to-tail (y = -sin so +sin is upward)
      let px = cx;
      let py = cy;

      for (let i = 0; i < terms.length; i++) {
        const term = terms[i];
        const rPx = term.amp * unitScale;
        const ang = term.freq * theta + term.phase;
        const nx = px + rPx * Math.cos(ang);
        const ny = py - rPx * Math.sin(ang);

        const alphaCircle = Math.max(0.16, 0.48 - i * 0.025);
        ctx.strokeStyle =
          i === 0
            ? 'rgba(244, 196, 108, 0.45)'
            : i % 2 === 1
              ? `rgba(70, 214, 232, ${alphaCircle})`
              : `rgba(255, 226, 158, ${alphaCircle})`;
        ctx.lineWidth = i === 0 ? 1.5 : 1.05;
        ctx.beginPath();
        ctx.arc(px, py, Math.max(1.2, rPx), 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = i === 0 ? '#FFE29E' : 'rgba(244, 196, 108, 0.75)';
        ctx.lineWidth = i === 0 ? 1.8 : 1.2;
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(nx, ny);
        ctx.stroke();

        ctx.fillStyle = '#FFE29E';
        ctx.beginPath();
        ctx.arc(nx, ny, i === 0 ? 2.4 : 1.6, 0, Math.PI * 2);
        ctx.fill();

        px = nx;
        py = ny;
      }

      // Vertical oscilloscope divider line
      ctx.strokeStyle = 'rgba(244, 196, 108, 0.20)';
      ctx.setLineDash([2, 4]);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(waveStartX, 24);
      ctx.lineTo(waveStartX, h - 18);
      ctx.stroke();
      ctx.setLineDash([]);

      // Laser projection beam from final epicycle tip to waveform edge
      ctx.strokeStyle = currentPreset.accent;
      ctx.lineWidth = 1.3;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(waveStartX, py);
      ctx.stroke();
      ctx.setLineDash([]);

      // Rolling Fourier partial-sum waveform trace
      if (waveSamples.length > 1) {
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.beginPath();
        let started = false;
        for (let i = waveSamples.length - 1; i >= 0; i--) {
          const sample = waveSamples[i];
          const dt = theta - sample.t;
          if (dt < -0.05 || dt > waveSpanRad) continue;
          const sx = waveStartX + Math.max(0, dt) * pxPerRad;
          const sy = cy - sample.yNorm * unitScale;
          if (!started) {
            ctx.moveTo(sx, sy);
            started = true;
          } else {
            ctx.lineTo(sx, sy);
          }
        }
        ctx.strokeStyle = currentPreset.id === 'sawtooth' ? 'rgba(70, 214, 232, 0.32)' : 'rgba(244, 196, 108, 0.32)';
        ctx.lineWidth = 5.5;
        ctx.stroke();
        ctx.strokeStyle = currentPreset.id === 'sawtooth' ? '#7CEEFF' : '#FFE29E';
        ctx.lineWidth = 2.1;
        ctx.stroke();
        ctx.restore();
      }

      // Glowing tip & pen node
      for (const [gx, gy] of [
        [px, py],
        [waveStartX, py],
      ]) {
        const g = ctx.createRadialGradient(gx, gy, 0, gx, gy, 11);
        g.addColorStop(0, '#FFFFFF');
        g.addColorStop(0.4, currentPreset.accent);
        g.addColorStop(1, 'transparent');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(gx, gy, 11, 0, Math.PI * 2);
        ctx.fill();
      }

      // Crisp axis caption
      ctx.fillStyle = '#727D94';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillText('TARGET (DASHED)', waveStartX + 4, 22);
    } else {
      // Closed 2D DFT contour mode
      const cx = w * 0.5;
      const cy = h * 0.52;
      const scale = Math.min(w, h) * 0.34;
      const dataset = CONTOUR_LIBRARY[pId as 'heart' | 'star' | 'treble-infinity'];

      const bgGlow = ctx.createRadialGradient(cx, cy, 8, cx, cy, scale * 1.5);
      bgGlow.addColorStop(0, 'rgba(244, 196, 108, 0.08)');
      bgGlow.addColorStop(0.6, 'rgba(70, 214, 232, 0.03)');
      bgGlow.addColorStop(1, 'rgba(6, 6, 9, 0)');
      ctx.fillStyle = bgGlow;
      ctx.fillRect(0, 0, w, h);

      // Crosshairs
      ctx.strokeStyle = 'rgba(247, 244, 236, 0.08)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cx - scale * 1.15, cy);
      ctx.lineTo(cx + scale * 1.15, cy);
      ctx.moveTo(cx, cy - scale * 1.15);
      ctx.lineTo(cx, cy + scale * 1.15);
      ctx.stroke();

      // Faint ideal target shape
      ctx.save();
      ctx.strokeStyle = 'rgba(70, 214, 232, 0.18)';
      ctx.setLineDash([4, 4]);
      ctx.lineWidth = 1.15;
      ctx.beginPath();
      dataset.points.forEach((pt, idx) => {
        const sx = cx + pt.x * scale;
        const sy = cy + pt.y * scale;
        if (idx === 0) ctx.moveTo(sx, sy);
        else ctx.lineTo(sx, sy);
      });
      ctx.closePath();
      ctx.stroke();
      ctx.restore();

      // Faint full N-term closed harmonic locus so N changes immediately preview sharpness
      ctx.beginPath();
      const locusSteps = 180;
      for (let i = 0; i <= locusSteps; i++) {
        const tau = (i / locusSteps) * Math.PI * 2;
        const pt = evalEpicyclePosition(terms, tau);
        const sx = cx + pt.x * scale;
        const sy = cy + pt.y * scale;
        if (i === 0) ctx.moveTo(sx, sy);
        else ctx.lineTo(sx, sy);
      }
      ctx.closePath();
      ctx.strokeStyle = 'rgba(244, 196, 108, 0.22)';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // Active glowing live trail
      if (trailSamples.length > 1) {
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        for (let i = 1; i < trailSamples.length; i++) {
          const p0 = trailSamples[i - 1];
          const p1 = trailSamples[i];
          const ageAlpha = Math.pow(i / trailSamples.length, 1.3);
          ctx.strokeStyle =
            pId === 'heart'
              ? `rgba(255, 133, 99, ${0.15 + 0.8 * ageAlpha})`
              : pId === 'treble-infinity'
                ? `rgba(69, 230, 166, ${0.15 + 0.8 * ageAlpha})`
                : `rgba(255, 226, 158, ${0.15 + 0.8 * ageAlpha})`;
          ctx.lineWidth = 1.3 + 1.5 * ageAlpha;
          ctx.beginPath();
          ctx.moveTo(cx + p0.xNorm * scale, cy + p0.yNorm * scale);
          ctx.lineTo(cx + p1.xNorm * scale, cy + p1.yNorm * scale);
          ctx.stroke();
        }
        ctx.restore();
      }

      // Nested rotating epicycle circles & radii
      let px = cx;
      let py = cy;
      for (let i = 0; i < terms.length; i++) {
        const term = terms[i];
        const rPx = term.amp * scale;
        const ang = term.freq * theta + term.phase;
        const nx = px + rPx * Math.cos(ang);
        const ny = py + rPx * Math.sin(ang);

        const circleAlpha = Math.max(0.14, 0.44 - i * 0.022);
        ctx.strokeStyle =
          term.freq < 0
            ? `rgba(70, 214, 232, ${circleAlpha})`
            : `rgba(244, 196, 108, ${circleAlpha})`;
        ctx.lineWidth = i === 0 ? 1.4 : 0.95;
        ctx.beginPath();
        ctx.arc(px, py, Math.max(1.2, rPx), 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = i === 0 ? '#FFE29E' : 'rgba(244, 196, 108, 0.72)';
        ctx.lineWidth = i === 0 ? 1.7 : 1.15;
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(nx, ny);
        ctx.stroke();

        ctx.fillStyle = '#FFE29E';
        ctx.beginPath();
        ctx.arc(nx, ny, i === 0 ? 2.3 : 1.4, 0, Math.PI * 2);
        ctx.fill();

        px = nx;
        py = ny;
      }

      // Glowing drawing stylus tip
      const glow = ctx.createRadialGradient(px, py, 0, px, py, 14);
      glow.addColorStop(0, '#FFFFFF');
      glow.addColorStop(0.38, currentPreset.accent);
      glow.addColorStop(1, 'transparent');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(px, py, 14, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#FFE29E';
      ctx.beginPath();
      ctx.arc(px, py, 3.2, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }, []);

  // ResizeObserver
  useEffect(() => {
    drawScene();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ro = new ResizeObserver(() => drawScene());
    ro.observe(canvas);
    return () => ro.disconnect();
  }, [drawScene, compact]);

  // Immediate redraw when controls change while paused
  useEffect(() => {
    drawScene();
  }, [presetId, harmonicsN, speed, drawScene]);

  // 60fps animation loop paused offscreen via IntersectionObserver
  useEffect(() => {
    if (!isVisible || !playing || reducedMotion) return;

    let rafId = 0;
    let lastNow = performance.now();

    const tick = (now: number) => {
      const dt = Math.min(0.05, Math.max(0.001, (now - lastNow) / 1000));
      lastNow = now;

      if (!document.hidden) {
        const s = stateRef.current;
        const angularVel = s.speed * (s.presetId === 'square' || s.presetId === 'sawtooth' ? 1.5 : 1.15);
        s.theta += dt * angularVel;

        if (s.presetId === 'square' || s.presetId === 'sawtooth') {
          let yNorm = 0;
          for (const term of s.terms) {
            yNorm += term.amp * Math.sin(term.freq * s.theta + term.phase);
          }
          s.waveSamples.push({ t: s.theta, yNorm });
          const minKeepT = s.theta - Math.PI * 3.8;
          while (s.waveSamples.length > 0 && s.waveSamples[0].t < minKeepT) {
            s.waveSamples.shift();
          }
        } else {
          const pt = evalEpicyclePosition(s.terms, s.theta);
          s.trailSamples.push({ xNorm: pt.x, yNorm: pt.y });
          if (s.trailSamples.length > MAX_TRAIL_SAMPLES) {
            s.trailSamples.shift();
          }
        }

        drawScene();
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [isVisible, playing, reducedMotion, drawScene]);

  const formulaTex = useMemo(
    () => buildFourierTex(presetId, harmonicsN),
    [presetId, harmonicsN]
  );

  const canvasHeight =
    heightClass ?? (compact ? 'h-[280px] sm:h-[320px]' : 'h-[340px] sm:h-[400px]');

  return (
    <div
      ref={hostRef}
      className="instrument-frame fiducial-frame overflow-hidden bg-[#060609] min-w-0 max-w-full"
    >
      {/* Header Bar */}
      <div className="px-4 py-2.5 border-b hairline-rule bg-[#0B0C12]/95 flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className="w-2 h-2 rounded-full shrink-0"
            style={{ backgroundColor: preset.accent, boxShadow: `0 0 10px ${preset.accent}` }}
          />
          <span className="font-mono-data text-[10px] uppercase tracking-[0.16em] text-[#F4C46C] truncate">
            Fourier Epicycles Workbench
          </span>
          <span className="hidden sm:inline font-mono-data text-[10px] px-2 py-0.5 rounded bg-[#11131C] border border-[rgba(244,196,108,0.18)] text-[#A8B2C6]">
            N = {harmonicsN} {harmonicsN === 1 ? 'circle' : 'circles'}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setPlaying((p) => !p)}
            aria-label={playing ? 'Pause epicycles' : 'Play epicycles'}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-mono-data border border-[rgba(244,196,108,0.22)] bg-[#11131C] text-[#F7F4EC] hover:border-[#F4C46C]/50"
          >
            {playing ? <Pause className="w-3 h-3 text-[#F4C46C]" /> : <Play className="w-3 h-3 text-[#F4C46C]" />}
            <span>{playing ? 'Pause' : 'Play'}</span>
          </button>
          <button
            type="button"
            onClick={() => {
              clearTrace();
              drawScene();
            }}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-mono-data border border-[rgba(244,196,108,0.18)] bg-[#11131C] text-[#A8B2C6] hover:text-[#F7F4EC]"
          >
            <Eraser className="w-3 h-3 text-[#46D6E8]" />
            <span>Clear Trace</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setPresetId('square');
              setHarmonicsN(5);
              setSpeed(1.0);
              setPlaying(true);
            }}
            aria-label="Reset Fourier epicycles"
            className="p-1.5 rounded border border-[rgba(244,196,108,0.18)] bg-[#11131C] text-[#A8B2C6] hover:text-[#F7F4EC]"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 min-w-0">
        <div
          className={`${
            compact ? 'lg:col-span-12' : 'lg:col-span-7 border-b lg:border-b-0 lg:border-r hairline-rule'
          } relative bg-[#060609] min-w-0`}
        >
          <canvas
            ref={canvasRef}
            className={`block w-full ${canvasHeight}`}
          />

          <div className="pointer-events-none absolute top-3 left-3 obsidian-glass rounded-lg px-2.5 py-1.5 border border-[rgba(244,196,108,0.22)]">
            <div className="font-mono-data text-[10px] text-[#A8B2C6]">
              {preset.label}{' '}
              <span className="text-[#FFE29E] font-semibold">· {harmonicsN} Epicycles</span>
            </div>
          </div>

          {compact && (
            <div className="absolute bottom-3 left-3 right-3 flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap gap-1.5">
                {FOURIER_PRESETS.map((item) => {
                  const active = item.id === presetId;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setPresetId(item.id)}
                      className={`px-2 py-1 rounded text-[10px] font-mono-data border transition-all ${
                        active
                          ? 'text-[#060609] font-semibold'
                          : 'bg-[#0B0C12]/85 border-[rgba(244,196,108,0.2)] text-[#A8B2C6] hover:text-[#F7F4EC]'
                      }`}
                      style={
                        active ? { backgroundColor: item.accent, borderColor: item.accent } : undefined
                      }
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
              <div className="flex items-center gap-2 bg-[#0B0C12]/85 px-2.5 py-1 rounded border border-[rgba(244,196,108,0.2)]">
                <span className="font-mono-data text-[10px] text-[#F4C46C]">N={harmonicsN}</span>
                <input
                  type="range"
                  min={1}
                  max={MAX_HARMONICS}
                  step={1}
                  value={harmonicsN}
                  onChange={(e) => setHarmonicsN(parseInt(e.target.value, 10))}
                  aria-label="Number of harmonic circles"
                  className="meridian-slider w-20"
                  style={{ ['--slider-accent' as string]: preset.accent }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Full Controls & Live Sum Telemetry */}
        {!compact && (
          <div className="lg:col-span-5 bg-[#0B0C12] p-4 sm:p-5 flex flex-col justify-between gap-4 min-w-0">
            <div className="space-y-3 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono-data text-[10px] uppercase tracking-[0.16em] text-[#A8B2C6]">
                  Curve &amp; Wave Presets
                </span>
                <span className="font-mono-data text-[10px] text-[#F4C46C]">{preset.badge}</span>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {FOURIER_PRESETS.map((item) => {
                  const active = item.id === presetId;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setPresetId(item.id)}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-mono-data border transition-all ${
                        active
                          ? 'text-[#060609] font-semibold'
                          : 'bg-[#11131C] border-[rgba(244,196,108,0.16)] text-[#A8B2C6] hover:text-[#F7F4EC] hover:border-[rgba(244,196,108,0.36)]'
                      }`}
                      style={
                        active
                          ? {
                              backgroundColor: item.accent,
                              borderColor: item.accent,
                              boxShadow: `0 0 18px -6px ${item.accent}`,
                            }
                          : undefined
                      }
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>

              {/* Harmonics & Speed Sliders */}
              <div className="p-3.5 rounded-xl bg-[#11131C] border border-[rgba(244,196,108,0.16)] space-y-3">
                <label className="block space-y-1 text-xs">
                  <div className="flex justify-between font-mono-data">
                    <span className="text-[#A8B2C6]">Harmonics (N Circles)</span>
                    <span className="text-[#F4C46C] font-semibold">N = {harmonicsN}</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={MAX_HARMONICS}
                    step={1}
                    value={harmonicsN}
                    onChange={(e) => setHarmonicsN(parseInt(e.target.value, 10))}
                    className="meridian-slider"
                    style={{ ['--slider-accent' as string]: '#F4C46C' }}
                  />
                </label>

                <label className="block space-y-1 text-xs">
                  <div className="flex justify-between font-mono-data">
                    <span className="text-[#A8B2C6]">Rotation Speed</span>
                    <span className="text-[#46D6E8] font-semibold">{speed.toFixed(1)}×</span>
                  </div>
                  <input
                    type="range"
                    min={0.2}
                    max={2.4}
                    step={0.1}
                    value={speed}
                    onChange={(e) => setSpeed(parseFloat(e.target.value))}
                    className="meridian-slider"
                    style={{ ['--slider-accent' as string]: '#46D6E8' }}
                  />
                </label>
              </div>
            </div>

            {/* Live Fourier Sum + Teen-Friendly Explanation */}
            <div className="p-3.5 rounded-xl bg-[#11131C] border border-[rgba(244,196,108,0.18)] space-y-2.5 min-w-0">
              <div className="flex items-center justify-between">
                <span className="font-mono-data text-[10px] uppercase tracking-[0.14em] text-[#727D94]">
                  Live Fourier Partial Sum
                </span>
                <span className="font-mono-data text-[10px] text-[#45E6A6]">
                  Top freq {Math.max(...activeTerms.map((t) => Math.abs(t.freq)))}×
                </span>
              </div>

              <div className="overflow-x-auto max-w-full py-1">
                <MathTex tex={formulaTex} className="text-xs sm:text-sm text-[#FFE29E]" />
              </div>

              <div className="pt-2 border-t border-[rgba(244,196,108,0.12)] space-y-1">
                <div className="font-mono-data text-[10px] uppercase tracking-[0.12em] text-[#F4C46C]">
                  Why More Circles Sharpen Corners
                </div>
                <p className="text-xs text-[#A8B2C6] leading-relaxed">
                  {preset.teenNote}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default FourierEpicyclesEngine;
