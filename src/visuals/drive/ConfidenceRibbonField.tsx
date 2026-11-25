import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pause, Play, RefreshCw } from 'lucide-react';
import { MathTex } from '../../components/MathTex';
import { useReducedMotion } from '../../hooks/useReducedMotion';

export interface ConfidenceRibbonFieldProps {
  compact?: boolean;
  heightClass?: string;
}

type RegressionKind = 'quadratic' | 'sine' | 'exponential';

interface RegressionMeta {
  id: RegressionKind;
  label: string;
  shortLabel: string;
  tex: string;
  accent: string;
}

const REGRESSION_MODELS: RegressionMeta[] = [
  {
    id: 'quadratic',
    label: 'Quadratic Trend',
    shortLabel: 'Quadratic',
    tex: '\\hat{y} = 0.095(x - 2.6)^2 + 1.35',
    accent: '#F4C46C',
  },
  {
    id: 'sine',
    label: 'Sine Wave',
    shortLabel: 'Sine Wave',
    tex: '\\hat{y} = 3.50 + 1.65\\sin(0.85x - 0.4)',
    accent: '#46D6E8',
  },
  {
    id: 'exponential',
    label: 'Exponential Growth',
    shortLabel: 'Exponential',
    tex: '\\hat{y} = 0.72\\,e^{0.215x}',
    accent: '#45E6A6',
  },
];

function evalTrend(x: number, kind: RegressionKind): number {
  if (kind === 'quadratic') return 0.095 * (x - 2.6) ** 2 + 1.35;
  if (kind === 'sine') return 3.5 + 1.65 * Math.sin(0.85 * x - 0.4);
  return 0.72 * Math.exp(0.215 * x);
}

function createPrng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s += 0x6d2b79f5;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface SampleDatum {
  x: number;
  zNorm: number; // standard normal residual z ~ N(0,1)
  phase: number;
  radius: number;
}

export function ConfidenceRibbonField({
  compact = false,
  heightClass,
}: ConfidenceRibbonFieldProps = {}): JSX.Element {
  const reducedMotion = useReducedMotion();
  const [curveKind, setCurveKind] = useState<RegressionKind>('quadratic');
  const [sigma, setSigma] = useState(0.42);
  const [sampleCount, setSampleCount] = useState(150);
  const [seed, setSeed] = useState(1);
  const [playing, setPlaying] = useState(true);
  const [probeX, setProbeX] = useState<number | null>(5.4);
  const [isVisible, setIsVisible] = useState(true);

  const hostRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const hoveringRef = useRef(false);

  // Generate deterministic Box-Muller normal sample residuals
  const baseSamples = useMemo<SampleDatum[]>(() => {
    const rand = createPrng(202604 + seed * 9973 + sampleCount * 31);
    const list: SampleDatum[] = [];
    for (let i = 0; i < sampleCount; i++) {
      const u1 = Math.max(1e-6, rand());
      const u2 = rand();
      const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
      const x = 0.25 + ((i + rand() * 0.7) / sampleCount) * 9.5;
      list.push({
        x: Math.min(9.85, Math.max(0.15, x)),
        zNorm: Math.max(-3.6, Math.min(3.6, z)),
        phase: rand() * Math.PI * 2,
        radius: 2.0 + rand() * 1.6,
      });
    }
    return list;
  }, [sampleCount, seed]);

  // Live R^2, sample std-dev, empirical band coverage, and residual histogram bins
  const stats = useMemo(() => {
    const pts = baseSamples.map((s) => {
      const mu = evalTrend(s.x, curveKind);
      const y = mu + sigma * s.zNorm;
      const err = y - mu;
      return { y, mu, err, absZ: Math.abs(s.zNorm), z: s.zNorm };
    });

    const n = pts.length || 1;
    const meanY = pts.reduce((acc, p) => acc + p.y, 0) / n;
    let ssRes = 0;
    let ssTot = 0;
    let in1 = 0;
    let in2 = 0;
    let in3 = 0;
    let aboveGate = 0;
    const bins = new Array<number>(11).fill(0);

    for (const p of pts) {
      ssRes += p.err * p.err;
      ssTot += (p.y - meanY) * (p.y - meanY);
      if (p.absZ <= 1) in1++;
      if (p.absZ <= 2) in2++;
      if (p.absZ <= 3) in3++;
      if (p.y >= 4.2) aboveGate++;

      const binIdx = Math.min(10, Math.max(0, Math.floor(((p.z + 3.3) / 6.6) * 11)));
      bins[binIdx]++;
    }

    const rSquared = ssTot > 1e-6 ? Math.max(0, 1 - ssRes / ssTot) : 1;
    const sampleStdDev = Math.sqrt(ssRes / Math.max(1, n - 1));
    const maxBin = Math.max(1, ...bins);

    return {
      rSquared,
      sampleStdDev,
      pct1: (in1 / n) * 100,
      pct2: (in2 / n) * 100,
      pct3: (in3 / n) * 100,
      pctGate: (aboveGate / n) * 100,
      bins,
      maxBin,
    };
  }, [baseSamples, curveKind, sigma]);

  const animRef = useRef({
    time: 0,
    curveKind,
    sigma,
    samples: baseSamples,
    probeX,
  });
  animRef.current.curveKind = curveKind;
  animRef.current.sigma = sigma;
  animRef.current.samples = baseSamples;
  animRef.current.probeX = probeX;

  // Pause 60fps loop when offscreen
  useEffect(() => {
    const el = hostRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setIsVisible(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        setIsVisible(entries.some((e) => e.isIntersecting));
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

    if (canvas.width !== Math.floor(w * dpr) || canvas.height !== Math.floor(h * dpr)) {
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
    }

    const { time, curveKind: kind, sigma: sig, samples, probeX: pxVal } = animRef.current;

    ctx.save();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Obsidian void background
    ctx.fillStyle = '#060609';
    ctx.fillRect(0, 0, w, h);

    const padL = 36;
    const padR = 16;
    const padT = 22;
    const padB = 26;
    const plotW = Math.max(80, w - padL - padR);
    const plotH = Math.max(80, h - padT - padB);

    const xMin = 0;
    const xMax = 10;
    const yMin = -0.6;
    const yMax = 8.4;

    const toPx = (xv: number) => padL + ((xv - xMin) / (xMax - xMin)) * plotW;
    const toPy = (yv: number) => padT + ((yMax - yv) / (yMax - yMin)) * plotH;

    // Cartographic background grid
    ctx.strokeStyle = 'rgba(244, 196, 108, 0.055)';
    ctx.lineWidth = 1;
    for (let gx = 0; gx <= 10; gx += 2) {
      const sx = toPx(gx);
      ctx.beginPath();
      ctx.moveTo(sx, padT);
      ctx.lineTo(sx, padT + plotH);
      ctx.stroke();
    }
    for (let gy = 0; gy <= 8; gy += 2) {
      const sy = toPy(gy);
      ctx.beginPath();
      ctx.moveTo(padL, sy);
      ctx.lineTo(padL + plotW, sy);
      ctx.stroke();
    }

    // Axis labels
    ctx.fillStyle = '#727D94';
    ctx.font = '10px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    for (let gx = 0; gx <= 10; gx += 2) {
      ctx.fillText(String(gx), toPx(gx), h - 8);
    }
    ctx.textAlign = 'right';
    for (let gy = 0; gy <= 8; gy += 2) {
      ctx.fillText(String(gy), padL - 6, toPy(gy) + 3);
    }

    // Clip inside plot area
    ctx.save();
    ctx.beginPath();
    ctx.rect(padL, padT, plotW, plotH);
    ctx.clip();

    const steps = 120;
    const drawRibbonBand = (
      mult: number,
      fillStyle: string | CanvasGradient,
      edgeColor: string,
      dashedEdge = false
    ) => {
      ctx.beginPath();
      for (let i = 0; i <= steps; i++) {
        const xv = xMin + (i / steps) * (xMax - xMin);
        const yTop = evalTrend(xv, kind) + mult * sig;
        const px = toPx(xv);
        const py = toPy(yTop);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      for (let i = steps; i >= 0; i--) {
        const xv = xMin + (i / steps) * (xMax - xMin);
        const yBot = evalTrend(xv, kind) - mult * sig;
        ctx.lineTo(toPx(xv), toPy(yBot));
      }
      ctx.closePath();
      ctx.fillStyle = fillStyle;
      ctx.fill();

      // Upper and lower luminous rails
      if (dashedEdge) ctx.setLineDash([4, 4]);
      ctx.strokeStyle = edgeColor;
      ctx.lineWidth = mult === 1 ? 1.45 : 1.05;
      for (const sign of [1, -1]) {
        ctx.beginPath();
        for (let i = 0; i <= steps; i++) {
          const xv = xMin + (i / steps) * (xMax - xMin);
          const yEdge = evalTrend(xv, kind) + sign * mult * sig;
          const px = toPx(xv);
          const py = toPy(yEdge);
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();
      }
      if (dashedEdge) ctx.setLineDash([]);
    };

    // 1. 99.7% (3-sigma) outer emerald envelope
    drawRibbonBand(3, 'rgba(69, 230, 166, 0.085)', 'rgba(69, 230, 166, 0.34)', true);

    // 2. 95% (2-sigma) middle cyan envelope
    drawRibbonBand(2, 'rgba(70, 214, 232, 0.14)', 'rgba(70, 214, 232, 0.48)', false);

    // 3. 68% (1-sigma) inner champagne gold core band
    const coreGrad = ctx.createLinearGradient(padL, 0, padL + plotW, 0);
    coreGrad.addColorStop(0, 'rgba(244, 196, 108, 0.22)');
    coreGrad.addColorStop(0.5, 'rgba(255, 226, 158, 0.34)');
    coreGrad.addColorStop(1, 'rgba(244, 196, 108, 0.24)');
    drawRibbonBand(1, coreGrad, 'rgba(255, 226, 158, 0.72)', false);

    // 4. Shimmering laminar flow filaments drifting along the ribbon
    ctx.globalCompositeOperation = 'lighter';
    for (let f = -2; f <= 2; f++) {
      if (f === 0) continue;
      const offsetFrac = f * 0.42;
      ctx.beginPath();
      for (let i = 0; i <= 90; i++) {
        const xv = xMin + (i / 90) * (xMax - xMin);
        const ripple = 0.08 * Math.sin(xv * 1.4 - time * 2.2 + f);
        const yv = evalTrend(xv, kind) + (offsetFrac + ripple) * sig;
        const px = toPx(xv);
        const py = toPy(yv);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.strokeStyle = 'rgba(255, 226, 158, 0.16)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // 5. Central Regression Trend Line + Flowing Pulse Wave
    ctx.beginPath();
    for (let i = 0; i <= steps; i++) {
      const xv = xMin + (i / steps) * (xMax - xMin);
      const px = toPx(xv);
      const py = toPy(evalTrend(xv, kind));
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.strokeStyle = 'rgba(244, 196, 108, 0.35)';
    ctx.lineWidth = 7;
    ctx.stroke();
    ctx.strokeStyle = '#FFE29E';
    ctx.lineWidth = 2.2;
    ctx.stroke();

    // Flowing luminous highlight packet along the central curve
    const packetX = ((time * 2.1) % 10);
    const packetPx = toPx(packetX);
    const packetPy = toPy(evalTrend(packetX, kind));
    const pktGlow = ctx.createRadialGradient(packetPx, packetPy, 0, packetPx, packetPy, 22);
    pktGlow.addColorStop(0, 'rgba(255, 255, 255, 0.85)');
    pktGlow.addColorStop(0.35, 'rgba(255, 226, 158, 0.45)');
    pktGlow.addColorStop(1, 'transparent');
    ctx.fillStyle = pktGlow;
    ctx.beginPath();
    ctx.arc(packetPx, packetPy, 22, 0, Math.PI * 2);
    ctx.fill();

    // 6. Luminous Floating Particle Sample Points (color-coded by sigma band)
    for (let i = 0; i < samples.length; i++) {
      const s = samples[i];
      const mu = evalTrend(s.x, kind);
      const yVal = mu + sig * s.zNorm;
      const driftX = Math.sin(time * 1.1 + s.phase) * 0.04;
      const driftY = Math.cos(time * 1.3 + s.phase * 1.7) * 0.035;
      const px = toPx(s.x + driftX);
      const py = toPy(yVal + driftY);

      const az = Math.abs(s.zNorm);
      let col = '#FFE29E';
      if (az > 3) col = '#FF8563';
      else if (az > 2) col = '#45E6A6';
      else if (az > 1) col = '#46D6E8';

      const halo = ctx.createRadialGradient(px, py, 0, px, py, s.radius * 3.1);
      halo.addColorStop(0, '#FFFFFF');
      halo.addColorStop(0.35, col);
      halo.addColorStop(1, 'transparent');
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(px, py, s.radius * 3.1, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.arc(px, py, s.radius * 0.65, 0, Math.PI * 2);
      ctx.fill();

      if (az > 3) {
        // Subtle outlier ring for >3 sigma
        ctx.strokeStyle = 'rgba(255, 133, 99, 0.72)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(px, py, s.radius * 2.2, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    ctx.globalCompositeOperation = 'source-over';

    // 7. Horizontal Reference Gate Line (y = 4.2, inspired by f_04.jpg)
    const gatePy = toPy(4.2);
    ctx.setLineDash([5, 5]);
    ctx.strokeStyle = 'rgba(255, 133, 99, 0.42)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padL, gatePy);
    ctx.lineTo(padL + plotW, gatePy);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = 'rgba(11, 12, 18, 0.85)';
    ctx.fillRect(padL + plotW - 68, gatePy - 16, 62, 14);
    ctx.fillStyle = '#FF8563';
    ctx.font = '9px "JetBrains Mono", monospace';
    ctx.textAlign = 'right';
    ctx.fillText('GATE 4.2', padL + plotW - 10, gatePy - 6);

    // 8. Hover / Interactive Probe Reticle & Leader Callout Tag
    if (pxVal !== null) {
      const clampedX = Math.max(0.2, Math.min(9.8, pxVal));
      const muAtX = evalTrend(clampedX, kind);
      const rx = toPx(clampedX);
      const ry = toPy(muAtX);

      ctx.strokeStyle = 'rgba(244, 196, 108, 0.55)';
      ctx.setLineDash([3, 3]);
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      ctx.moveTo(rx, padT);
      ctx.lineTo(rx, padT + plotH);
      ctx.stroke();
      ctx.setLineDash([]);

      // Interval tick span for +/- 1 sigma at x*
      ctx.strokeStyle = '#FFE29E';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(rx, toPy(muAtX + sig));
      ctx.lineTo(rx, toPy(muAtX - sig));
      ctx.stroke();

      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(rx, ry, 3.6, 0, Math.PI * 2);
      ctx.fill();

      if (w >= 340) {
        const tagW = 134;
        const tagH = 34;
        const placeLeft = rx > padL + plotW * 0.58;
        const tagX = placeLeft ? Math.max(padL + 8, rx - tagW - 22) : Math.min(padL + plotW - tagW - 8, rx + 22);
        const tagY = Math.max(padT + 8, Math.min(padT + plotH - tagH - 8, ry - tagH * 0.5));
        const anchorX = placeLeft ? tagX + tagW : tagX;
        const anchorY = tagY + tagH * 0.5;

        ctx.strokeStyle = 'rgba(244, 196, 108, 0.65)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(rx, ry);
        ctx.lineTo(anchorX, anchorY);
        ctx.stroke();

        ctx.fillStyle = 'rgba(11, 12, 18, 0.9)';
        ctx.strokeStyle = 'rgba(244, 196, 108, 0.4)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(tagX, tagY, tagW, tagH, 6);
        ctx.fill();
        ctx.stroke();

        ctx.textAlign = 'left';
        ctx.fillStyle = '#FFE29E';
        ctx.font = '10px "JetBrains Mono", monospace';
        ctx.fillText(`x=${clampedX.toFixed(1)} · ŷ=${muAtX.toFixed(2)}`, tagX + 8, tagY + 13);
        ctx.fillStyle = '#46D6E8';
        ctx.fillText(
          `95%: [${(muAtX - 2 * sig).toFixed(2)}, ${(muAtX + 2 * sig).toFixed(2)}]`,
          tagX + 8,
          tagY + 26
        );
      }
    }

    ctx.restore(); // end clip

    // Band legend in upper-left
    ctx.font = w < 440 ? '9px "JetBrains Mono", monospace' : '10px "JetBrains Mono", monospace';
    ctx.textAlign = 'left';
    ctx.fillStyle = '#FFE29E';
    ctx.fillText('68% (±1σ)', padL + 6, 14);
    ctx.fillStyle = '#46D6E8';
    ctx.fillText('95% (±2σ)', padL + (w < 440 ? 74 : 88), 14);
    ctx.fillStyle = '#45E6A6';
    ctx.fillText('99.7% (±3σ)', padL + (w < 440 ? 142 : 170), 14);

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

  // Redraw when params update while paused
  useEffect(() => {
    drawScene();
  }, [curveKind, sigma, sampleCount, seed, probeX, drawScene]);

  // 60fps requestAnimationFrame paused offscreen via IntersectionObserver
  useEffect(() => {
    if (!isVisible || !playing || reducedMotion) return;

    let rafId = 0;
    let lastNow = performance.now();

    const tick = (now: number) => {
      const dt = Math.min(0.05, Math.max(0.001, (now - lastNow) / 1000));
      lastNow = now;
      if (!document.hidden) {
        animRef.current.time += dt;
        if (!hoveringRef.current) {
          animRef.current.probeX = 5.0 + Math.sin(animRef.current.time * 0.52) * 3.1;
        }
        drawScene();
      }
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [isVisible, playing, reducedMotion, drawScene]);

  const updateProbeFromPointer = useCallback((clientX: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const padL = 36;
    const padR = 16;
    const plotW = Math.max(80, rect.width - padL - padR);
    const frac = Math.max(0, Math.min(1, (clientX - rect.left - padL) / plotW));
    const nextX = Number((frac * 10).toFixed(2));
    setProbeX(nextX);
  }, []);

  const activeModel = REGRESSION_MODELS.find((m) => m.id === curveKind) ?? REGRESSION_MODELS[0];
  const canvasHeight =
    heightClass ?? (compact ? 'h-[260px] sm:h-[300px]' : 'h-[320px] sm:h-[370px]');

  return (
    <div
      ref={hostRef}
      className="instrument-frame fiducial-frame overflow-hidden bg-[#060609] min-w-0 max-w-full"
    >
      {/* Top Bar */}
      <div className="px-4 py-2.5 border-b hairline-rule bg-[#0B0C12]/95 flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className="w-2 h-2 rounded-full shrink-0"
            style={{ backgroundColor: activeModel.accent, boxShadow: `0 0 10px ${activeModel.accent}` }}
          />
          <span className="font-mono-data text-[10px] uppercase tracking-[0.16em] text-[#F4C46C] truncate">
            Confidence Ribbon Field
          </span>
          <span className="hidden sm:inline font-mono-data text-[10px] px-2 py-0.5 rounded bg-[#11131C] border border-[rgba(244,196,108,0.18)] text-[#A8B2C6]">
            R² = {stats.rSquared.toFixed(3)} · σ = {sigma.toFixed(2)}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setSeed((s) => s + 1)}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-mono-data border border-[rgba(244,196,108,0.2)] bg-[#11131C] text-[#A8B2C6] hover:text-[#F7F4EC]"
          >
            <RefreshCw className="w-3 h-3 text-[#46D6E8]" />
            <span>Resample</span>
          </button>
          <button
            type="button"
            onClick={() => setPlaying((p) => !p)}
            aria-label={playing ? 'Pause particle drift' : 'Play particle drift'}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-mono-data border border-[rgba(244,196,108,0.22)] bg-[#11131C] text-[#F7F4EC] hover:border-[#F4C46C]/50"
          >
            {playing ? <Pause className="w-3 h-3 text-[#F4C46C]" /> : <Play className="w-3 h-3 text-[#F4C46C]" />}
            <span>{playing ? 'Pause' : 'Play'}</span>
          </button>
        </div>
      </div>

      {/* Main Split: Confidence Field Canvas + Empirical Rule & Telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-12">
        <div
          className={`${
            compact ? 'lg:col-span-12' : 'lg:col-span-8 border-b lg:border-b-0 lg:border-r hairline-rule'
          } relative bg-[#060609]`}
        >
          <canvas
            ref={canvasRef}
            onPointerEnter={() => {
              hoveringRef.current = true;
            }}
            onPointerMove={(e) => {
              hoveringRef.current = true;
              updateProbeFromPointer(e.clientX);
            }}
            onPointerLeave={() => {
              hoveringRef.current = false;
            }}
            className={`block w-full ${canvasHeight} cursor-crosshair touch-none`}
          />

          {compact && (
            <div className="px-3 py-2 border-t hairline-rule bg-[#0B0C12]/90 flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap gap-1.5">
                {REGRESSION_MODELS.map((m) => {
                  const active = curveKind === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setCurveKind(m.id)}
                      className={`px-2 py-1 rounded text-[10.5px] font-mono-data border transition-all ${
                        active
                          ? 'text-[#060609] font-semibold'
                          : 'bg-[#11131C] border-[rgba(244,196,108,0.18)] text-[#A8B2C6] hover:text-[#F7F4EC]'
                      }`}
                      style={
                        active ? { backgroundColor: m.accent, borderColor: m.accent } : undefined
                      }
                    >
                      {m.shortLabel}
                    </button>
                  );
                })}
              </div>
              <span className="font-mono-data text-[10.5px] text-[#FFE29E]">
                R² = {stats.rSquared.toFixed(3)} · s = {stats.sampleStdDev.toFixed(2)}
              </span>
            </div>
          )}
        </div>

        {/* Full Telemetry & Sliders Panel */}
        {!compact && (
          <div className="lg:col-span-4 bg-[#0B0C12] p-4 sm:p-5 flex flex-col justify-between gap-4 min-w-0">
            <div className="space-y-3">
              <div className="font-mono-data text-[10px] uppercase tracking-[0.16em] text-[#A8B2C6]">
                Regression Curve Model
              </div>

              <div className="grid grid-cols-1 gap-1.5">
                {REGRESSION_MODELS.map((m) => {
                  const active = curveKind === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setCurveKind(m.id)}
                      className={`px-3 py-2 rounded-lg text-left text-xs font-mono-data border transition-all flex items-center justify-between ${
                        active
                          ? 'text-[#060609] font-semibold'
                          : 'bg-[#11131C] border-[rgba(244,196,108,0.16)] text-[#A8B2C6] hover:text-[#F7F4EC]'
                      }`}
                      style={
                        active
                          ? {
                              backgroundColor: m.accent,
                              borderColor: m.accent,
                              boxShadow: `0 0 18px -6px ${m.accent}`,
                            }
                          : undefined
                      }
                    >
                      <span>{m.label}</span>
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: active ? '#060609' : m.accent }}
                      />
                    </button>
                  );
                })}
              </div>

              {/* Noise Sigma & Sample Count Sliders */}
              <div className="p-3.5 rounded-xl bg-[#11131C] border border-[rgba(244,196,108,0.16)] space-y-3">
                <label className="block space-y-1 text-xs">
                  <div className="flex justify-between font-mono-data">
                    <span className="text-[#A8B2C6]">Noise Spread (σ)</span>
                    <span className="text-[#F4C46C] font-semibold">{sigma.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min={0.12}
                    max={0.85}
                    step={0.02}
                    value={sigma}
                    onChange={(e) => setSigma(parseFloat(e.target.value))}
                    className="meridian-slider"
                    style={{ ['--slider-accent' as string]: '#F4C46C' }}
                  />
                </label>

                <label className="block space-y-1 text-xs">
                  <div className="flex justify-between font-mono-data">
                    <span className="text-[#A8B2C6]">Sample Points (N)</span>
                    <span className="text-[#46D6E8] font-semibold">{sampleCount}</span>
                  </div>
                  <input
                    type="range"
                    min={40}
                    max={320}
                    step={10}
                    value={sampleCount}
                    onChange={(e) => setSampleCount(parseInt(e.target.value, 10))}
                    className="meridian-slider"
                    style={{ ['--slider-accent' as string]: '#46D6E8' }}
                  />
                </label>
              </div>
            </div>

            {/* R^2, Std Dev, Empirical Rule & Residual Histogram */}
            <div className="p-3.5 rounded-xl bg-[#11131C] border border-[rgba(244,196,108,0.18)] space-y-3">
              <div className="grid grid-cols-3 gap-2 font-mono-data text-xs">
                <div className="p-2 rounded bg-[#0B0C12] border border-[rgba(244,196,108,0.14)]">
                  <div className="text-[9.5px] text-[#727D94]">Fit R²</div>
                  <div className="text-[#FFE29E] font-semibold">{stats.rSquared.toFixed(3)}</div>
                </div>
                <div className="p-2 rounded bg-[#0B0C12] border border-[rgba(70,214,232,0.16)]">
                  <div className="text-[9.5px] text-[#727D94]">Std Dev s</div>
                  <div className="text-[#46D6E8] font-semibold">{stats.sampleStdDev.toFixed(2)}</div>
                </div>
                <div className="p-2 rounded bg-[#0B0C12] border border-[rgba(255,133,99,0.18)]">
                  <div className="text-[9.5px] text-[#727D94]">&gt; Gate</div>
                  <div className="text-[#FF8563] font-semibold">{stats.pctGate.toFixed(0)}%</div>
                </div>
              </div>

              {/* Empirical Rule Live Coverage */}
              <div className="space-y-1.5 font-mono-data text-[10px]">
                <div className="flex justify-between text-[#A8B2C6]">
                  <span>1σ Band (Target 68%)</span>
                  <span className="text-[#FFE29E]">{stats.pct1.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between text-[#A8B2C6]">
                  <span>2σ Band (Target 95%)</span>
                  <span className="text-[#46D6E8]">{stats.pct2.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between text-[#A8B2C6]">
                  <span>3σ Band (Target 99.7%)</span>
                  <span className="text-[#45E6A6]">{stats.pct3.toFixed(1)}%</span>
                </div>
              </div>

              {/* Mini Residual Bell Histogram */}
              <div>
                <div className="flex justify-between font-mono-data text-[9.5px] text-[#727D94] mb-1">
                  <span>−3σ</span>
                  <span>Residual Distribution</span>
                  <span>+3σ</span>
                </div>
                <div className="h-10 flex items-end gap-1 px-1 py-1 rounded bg-[#0B0C12] border border-[rgba(244,196,108,0.1)]">
                  {stats.bins.map((cnt, idx) => {
                    const pct = Math.max(8, (cnt / stats.maxBin) * 100);
                    const distFromCenter = Math.abs(idx - 5);
                    const barCol =
                      distFromCenter <= 1
                        ? '#FFE29E'
                        : distFromCenter <= 3
                          ? '#46D6E8'
                          : '#45E6A6';
                    return (
                      <div
                        key={idx}
                        className="flex-1 rounded-t-[2px] transition-all duration-150"
                        style={{ height: `${pct}%`, backgroundColor: barCol, opacity: 0.85 }}
                      />
                    );
                  })}
                </div>
              </div>

              <div className="overflow-x-auto">
                <MathTex tex={activeModel.tex} className="text-xs text-[#F7F4EC]" />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ConfidenceRibbonField;
