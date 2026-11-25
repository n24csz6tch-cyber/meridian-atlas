import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pause, Play, RotateCcw } from 'lucide-react';
import { MathTex } from '../../components/MathTex';
import { useReducedMotion } from '../../hooks/useReducedMotion';

export interface PolarHarmonicRingEngineProps {
  compact?: boolean;
  heightClass?: string;
}

type HarmonyPresetId = 'circle' | 'rose3' | 'rose5' | 'golden';

interface HarmonyPreset {
  id: HarmonyPresetId;
  label: string;
  p: number;
  q: number;
  accent: string;
  note: string;
}

const PHI = (1 + Math.sqrt(5)) / 2; // ~1.618034

const HARMONY_PRESETS: HarmonyPreset[] = [
  {
    id: 'circle',
    label: 'Circle',
    p: 1,
    q: 1,
    accent: '#46D6E8',
    note: '1:1 unit orbit where r = 1 and Lissajous closes into a pure circle',
  },
  {
    id: 'rose3',
    label: '3-Petal',
    p: 3,
    q: 1,
    accent: '#45E6A6',
    note: '3:1 odd harmonic produces a 3-petal polar rose & triangular caustic',
  },
  {
    id: 'rose5',
    label: '5-Petal',
    p: 5,
    q: 1,
    accent: '#F4C46C',
    note: '5:1 pentagram symmetry generates 5 balanced resonance lobes',
  },
  {
    id: 'golden',
    label: 'Golden Ratio',
    p: Number(PHI.toFixed(3)),
    q: 1,
    accent: '#FF8563',
    note: 'φ:1 irrational ratio never repeats — weaving a golden phyllotaxis rosette',
  },
];

function shortestAngleDiff(a: number, b: number): number {
  let d = ((a - b + Math.PI) % (Math.PI * 2)) - Math.PI;
  if (d < -Math.PI) d += Math.PI * 2;
  return d;
}

export function PolarHarmonicRingEngine({
  compact = false,
  heightClass,
}: PolarHarmonicRingEngineProps = {}): JSX.Element {
  const reducedMotion = useReducedMotion();
  const [pVal, setPVal] = useState(3);
  const [qVal, setQVal] = useState(1);
  const [thetaDeg, setThetaDeg] = useState(42);
  const [playing, setPlaying] = useState(true);
  const [showLissajous, setShowLissajous] = useState(true);
  const [isVisible, setIsVisible] = useState(true);

  const hostRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const draggingRef = useRef(false);

  const stateRef = useRef({
    p: pVal,
    q: qVal,
    thetaRad: (thetaDeg * Math.PI) / 180,
    time: 0,
    showLissajous,
  });

  stateRef.current.p = pVal;
  stateRef.current.q = qVal;
  stateRef.current.showLissajous = showLissajous;
  if (!playing) {
    stateRef.current.thetaRad = (thetaDeg * Math.PI) / 180;
  }

  const activePresetId = useMemo<HarmonyPresetId | null>(() => {
    if (Math.abs(pVal - 1) < 0.02 && qVal === 1) return 'circle';
    if (Math.abs(pVal - 3) < 0.02 && qVal === 1) return 'rose3';
    if (Math.abs(pVal - 5) < 0.02 && qVal === 1) return 'rose5';
    if (Math.abs(pVal - PHI) < 0.03 && qVal === 1) return 'golden';
    return null;
  }, [pVal, qVal]);

  const thetaRad = (thetaDeg * Math.PI) / 180;
  const ratio = pVal / Math.max(1, qVal);
  const isPureCircle = Math.abs(ratio - 1) < 0.005;
  const rVal = isPureCircle ? 1 : Math.cos(ratio * thetaRad);
  const coordX = rVal * Math.cos(thetaRad);
  const coordY = rVal * Math.sin(thetaRad);

  // IntersectionObserver pauses 60fps loop when offscreen
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

    const { p, q, thetaRad: th, time, showLissajous: drawLiss } = stateRef.current;
    const k = p / Math.max(1, q);
    const circleMode = Math.abs(k - 1) < 0.005;

    ctx.save();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Obsidian void with subtle radial gold observatory bloom
    ctx.fillStyle = '#060609';
    ctx.fillRect(0, 0, w, h);

    const cx = w * 0.5;
    const cy = h * 0.5;
    const R = Math.min(w, h) * (w < 420 ? 0.32 : 0.34);

    const bgGlow = ctx.createRadialGradient(cx, cy, R * 0.1, cx, cy, R * 1.45);
    bgGlow.addColorStop(0, 'rgba(244, 196, 108, 0.08)');
    bgGlow.addColorStop(0.55, 'rgba(70, 214, 232, 0.03)');
    bgGlow.addColorStop(1, 'rgba(6, 6, 9, 0)');
    ctx.fillStyle = bgGlow;
    ctx.fillRect(0, 0, w, h);

    // 1. Radial Spectrum Spikes around circumference
    const spikeCount = 108;
    for (let i = 0; i < spikeCount; i++) {
      const ang = (i / spikeCount) * Math.PI * 2;
      const harmonicEnv = Math.abs(
        Math.cos(p * ang + th * 0.5) * Math.sin(q * ang - time * 0.6)
      );
      const nearActive = Math.exp(-9 * shortestAngleDiff(ang, th) ** 2);
      const len = R * (0.045 + 0.19 * harmonicEnv + 0.085 * nearActive);

      const rIn = R * 1.03;
      const rOut = rIn + len;
      const sx0 = cx + Math.cos(ang) * rIn;
      const sy0 = cy - Math.sin(ang) * rIn;
      const sx1 = cx + Math.cos(ang) * rOut;
      const sy1 = cy - Math.sin(ang) * rOut;

      let strokeColor = 'rgba(244, 196, 108, 0.42)';
      if (nearActive > 0.35) {
        strokeColor = 'rgba(255, 226, 158, 0.92)';
      } else if (i % 7 === 0) {
        strokeColor = 'rgba(255, 133, 99, 0.58)';
      } else if (i % 3 === 0) {
        strokeColor = 'rgba(69, 230, 166, 0.52)';
      }

      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = nearActive > 0.35 ? 2.1 : 1.3;
      ctx.beginPath();
      ctx.moveTo(sx0, sy0);
      ctx.lineTo(sx1, sy1);
      ctx.stroke();
    }

    // 2. Concentric Orbital Coordinate Rings + Ticks
    const ringRatios = [0.28, 0.56, 0.84, 1.0];
    ringRatios.forEach((rr, idx) => {
      ctx.strokeStyle =
        idx === ringRatios.length - 1
          ? 'rgba(244, 196, 108, 0.42)'
          : 'rgba(244, 196, 108, 0.13)';
      ctx.lineWidth = idx === ringRatios.length - 1 ? 1.5 : 1;
      ctx.beginPath();
      ctx.arc(cx, cy, R * rr, 0, Math.PI * 2);
      ctx.stroke();
    });

    // Crosshairs
    ctx.strokeStyle = 'rgba(247, 244, 236, 0.12)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx - R * 1.06, cy);
    ctx.lineTo(cx + R * 1.06, cy);
    ctx.moveTo(cx, cy - R * 1.06);
    ctx.lineTo(cx, cy + R * 1.06);
    ctx.stroke();

    // Degree / Radian Ticks
    for (let m = 0; m < 24; m++) {
      const ang = (m * Math.PI) / 12;
      const major = m % 3 === 0;
      const rA = R * (major ? 0.95 : 0.98);
      const rB = R * 1.02;
      ctx.strokeStyle = major ? 'rgba(255, 226, 158, 0.55)' : 'rgba(244, 196, 108, 0.22)';
      ctx.lineWidth = major ? 1.4 : 1;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(ang) * rA, cy - Math.sin(ang) * rA);
      ctx.lineTo(cx + Math.cos(ang) * rB, cy - Math.sin(ang) * rB);
      ctx.stroke();
    }

    ctx.fillStyle = '#A8B2C6';
    ctx.font = '10px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const labelOffset = R * 1.15;
    ctx.fillText('0', cx + labelOffset, cy);
    ctx.fillText('π/2', cx, cy - labelOffset);
    ctx.fillText('π', cx - labelOffset, cy);
    ctx.fillText('3π/2', cx, cy + labelOffset);

    // 3. Golden Glowing Chord Arcs connecting harmonic sin/cos nodes
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const chordNodes = 64;
    const chordRadius = R * 0.96;

    for (let i = 0; i < chordNodes; i++) {
      const a0 = (i / chordNodes) * Math.PI * 2;
      const a1 = k * a0 + th;
      const x0 = cx + Math.cos(a0) * chordRadius;
      const y0 = cy - Math.sin(a0) * chordRadius;
      const x1 = cx + Math.cos(a1) * chordRadius;
      const y1 = cy - Math.sin(a1) * chordRadius;

      // Control point gently pulled toward origin for orbital curvature
      const ctrlX = cx + ((x0 + x1) * 0.5 - cx) * 0.28;
      const ctrlY = cy + ((y0 + y1) * 0.5 - cy) * 0.28;

      const distToTheta = Math.abs(shortestAngleDiff(a0, th));
      const isHot = distToTheta < 0.22;

      ctx.beginPath();
      ctx.moveTo(x0, y0);
      ctx.quadraticCurveTo(ctrlX, ctrlY, x1, y1);
      if (isHot) {
        ctx.strokeStyle = i % 2 === 0 ? 'rgba(255, 226, 158, 0.72)' : 'rgba(69, 230, 166, 0.58)';
        ctx.lineWidth = 1.65;
      } else {
        ctx.strokeStyle =
          i % 5 === 0
            ? 'rgba(255, 133, 99, 0.20)'
            : i % 3 === 0
              ? 'rgba(69, 230, 166, 0.16)'
              : 'rgba(244, 196, 108, 0.17)';
        ctx.lineWidth = 0.95;
      }
      ctx.stroke();
    }

    // 4. Lissajous Parametric Overlay (Cyan)
    if (drawLiss) {
      const lissSteps = 320;
      const lissTurns = Math.abs(p - Math.round(p)) > 0.02 ? 6 : q;
      const lissMaxT = Math.PI * 2 * Math.min(8, Math.max(1, lissTurns));
      const lissR = R * 0.72;
      ctx.beginPath();
      for (let i = 0; i <= lissSteps; i++) {
        const tau = (i / lissSteps) * lissMaxT;
        const lx = cx + Math.cos(p * tau + th) * lissR;
        const ly = cy - Math.sin(q * tau) * lissR;
        if (i === 0) ctx.moveTo(lx, ly);
        else ctx.lineTo(lx, ly);
      }
      ctx.strokeStyle = 'rgba(70, 214, 232, 0.34)';
      ctx.lineWidth = 1.4;
      ctx.stroke();
    }

    // 5. Polar Rose / Harmonic Locus Curve (Champagne Gold)
    const roseScale = R * 0.88;
    const isIrrational = Math.abs(p - Math.round(p)) > 0.02;
    const roseTurns = isIrrational ? 6 : q * 2;
    const roseMax = Math.PI * 2 * Math.min(8, Math.max(1, roseTurns));
    const roseSamples = 420;

    ctx.beginPath();
    for (let i = 0; i <= roseSamples; i++) {
      const a = (i / roseSamples) * roseMax;
      const radNorm = circleMode ? 1 : Math.cos(k * a);
      const rx = cx + radNorm * Math.cos(a) * roseScale;
      const ry = cy - radNorm * Math.sin(a) * roseScale;
      if (i === 0) ctx.moveTo(rx, ry);
      else ctx.lineTo(rx, ry);
    }
    ctx.strokeStyle = 'rgba(244, 196, 108, 0.25)';
    ctx.lineWidth = 6;
    ctx.stroke();
    ctx.strokeStyle = '#FFE29E';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.restore();

    // 6. Active Rotating Vector (r cos theta, r sin theta) + Orthogonal Projections
    const activeR = circleMode ? 1 : Math.cos(k * th);
    const px = cx + activeR * Math.cos(th) * roseScale;
    const py = cy - activeR * Math.sin(th) * roseScale;

    const ux = cx + Math.cos(th) * R;
    const uy = cy - Math.sin(th) * R;

    // Guide ray to unit circumference
    ctx.strokeStyle = 'rgba(244, 196, 108, 0.35)';
    ctx.setLineDash([3, 4]);
    ctx.lineWidth = 1.1;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(ux, uy);
    ctx.stroke();

    // Orthogonal cosine (cyan) and sine (coral) projection legs
    ctx.strokeStyle = 'rgba(70, 214, 232, 0.78)';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(px, cy);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(255, 133, 99, 0.78)';
    ctx.beginPath();
    ctx.moveTo(px, cy);
    ctx.lineTo(px, py);
    ctx.stroke();
    ctx.setLineDash([]);

    // Active harmonic radius arm
    ctx.strokeStyle = '#FFE29E';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(px, py);
    ctx.stroke();

    // Glowing Point P beacon
    const pg = ctx.createRadialGradient(px, py, 0, px, py, 16);
    pg.addColorStop(0, '#FFFFFF');
    pg.addColorStop(0.35, '#FFE29E');
    pg.addColorStop(0.7, '#F4C46C');
    pg.addColorStop(1, 'transparent');
    ctx.fillStyle = pg;
    ctx.beginPath();
    ctx.arc(px, py, 16, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#FFE29E';
    ctx.beginPath();
    ctx.arc(px, py, 4.5, 0, Math.PI * 2);
    ctx.fill();

    // Outer circumference marker U
    ctx.fillStyle = '#45E6A6';
    ctx.beginPath();
    ctx.arc(ux, uy, 3.2, 0, Math.PI * 2);
    ctx.fill();

    // Crisp floating callout leader tag inside wide viewports (inspired by f_08.jpg)
    if (w >= 340) {
      const label = `(${(activeR * Math.cos(th)).toFixed(2)}, ${(activeR * Math.sin(th)).toFixed(2)})`;
      const tagW = 114;
      const tagH = 22;
      const onRight = px < cx;
      const tagX = onRight ? Math.min(w - tagW - 10, cx + R * 0.76) : Math.max(10, cx - R * 0.76 - tagW);
      const tagY = Math.max(12, Math.min(h - tagH - 12, py - 24));
      const anchorX = onRight ? tagX : tagX + tagW;
      const anchorY = tagY + tagH * 0.5;

      ctx.strokeStyle = 'rgba(244, 196, 108, 0.55)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(anchorX, anchorY);
      ctx.stroke();

      ctx.fillStyle = 'rgba(11, 12, 18, 0.88)';
      ctx.strokeStyle = 'rgba(244, 196, 108, 0.42)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(tagX, tagY, tagW, tagH, 5);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#FFE29E';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(label, tagX + tagW * 0.5, tagY + tagH * 0.5 + 0.5);
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

  // Redraw when sliders change while paused
  useEffect(() => {
    drawScene();
  }, [pVal, qVal, thetaDeg, showLissajous, drawScene]);

  // 60fps animation loop paused offscreen via IntersectionObserver
  useEffect(() => {
    if (!isVisible || !playing || reducedMotion) return;

    let rafId = 0;
    let lastNow = performance.now();
    let syncAccum = 0;

    const tick = (now: number) => {
      const dt = Math.min(0.05, Math.max(0.001, (now - lastNow) / 1000));
      lastNow = now;

      if (!document.hidden && !draggingRef.current) {
        stateRef.current.time += dt;
        stateRef.current.thetaRad = (stateRef.current.thetaRad + dt * 0.68) % (Math.PI * 2);
        syncAccum += dt;
        if (syncAccum >= 0.055) {
          syncAccum = 0;
          const nextDeg = Math.round(((stateRef.current.thetaRad * 180) / Math.PI) % 360);
          setThetaDeg(nextDeg);
        }
        drawScene();
      } else if (!document.hidden) {
        drawScene();
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [isVisible, playing, reducedMotion, drawScene]);

  const scrubAngleFromPointer = useCallback((clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const dx = clientX - (rect.left + rect.width * 0.5);
    const dy = rect.top + rect.height * 0.5 - clientY;
    let rad = Math.atan2(dy, dx);
    if (rad < 0) rad += Math.PI * 2;
    stateRef.current.thetaRad = rad;
    setThetaDeg(Math.round((rad * 180) / Math.PI));
    drawScene();
  }, [drawScene]);

  const canvasHeight =
    heightClass ?? (compact ? 'h-[280px] sm:h-[320px]' : 'h-[340px] sm:h-[400px]');

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
            style={{ backgroundColor: '#45E6A6', boxShadow: '0 0 10px #45E6A6' }}
          />
          <span className="font-mono-data text-[10px] uppercase tracking-[0.16em] text-[#F4C46C] truncate">
            Polar Harmonic Ring Engine
          </span>
          <span className="hidden sm:inline font-mono-data text-[10px] px-2 py-0.5 rounded bg-[#11131C] border border-[rgba(244,196,108,0.18)] text-[#A8B2C6]">
            p:q = {pVal}:{qVal}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setShowLissajous((v) => !v)}
            className={`px-2.5 py-1 rounded text-[11px] font-mono-data border transition-colors ${
              showLissajous
                ? 'border-[#46D6E8]/55 text-[#46D6E8] bg-[#46D6E8]/12'
                : 'border-[rgba(244,196,108,0.18)] bg-[#11131C] text-[#A8B2C6]'
            }`}
          >
            Lissajous
          </button>
          <button
            type="button"
            onClick={() => setPlaying((p) => !p)}
            aria-label={playing ? 'Pause rotation' : 'Play rotation'}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-mono-data border border-[rgba(244,196,108,0.22)] bg-[#11131C] text-[#F7F4EC] hover:border-[#F4C46C]/50"
          >
            {playing ? <Pause className="w-3 h-3 text-[#F4C46C]" /> : <Play className="w-3 h-3 text-[#F4C46C]" />}
            <span>{playing ? 'Pause' : 'Play'}</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setPVal(3);
              setQVal(1);
              setThetaDeg(42);
              setPlaying(true);
            }}
            aria-label="Reset polar harmonic engine"
            className="p-1.5 rounded border border-[rgba(244,196,108,0.18)] bg-[#11131C] text-[#A8B2C6] hover:text-[#F7F4EC]"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Split: Orbital Canvas + Interactive Harmony Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12">
        <div
          className={`${
            compact ? 'lg:col-span-12' : 'lg:col-span-7 border-b lg:border-b-0 lg:border-r hairline-rule'
          } relative bg-[#060609]`}
        >
          <canvas
            ref={canvasRef}
            onPointerDown={(e) => {
              draggingRef.current = true;
              setPlaying(false);
              scrubAngleFromPointer(e.clientX, e.clientY);
            }}
            onPointerMove={(e) => {
              if (draggingRef.current) scrubAngleFromPointer(e.clientX, e.clientY);
            }}
            onPointerUp={() => {
              draggingRef.current = false;
            }}
            onPointerLeave={() => {
              draggingRef.current = false;
            }}
            className={`block w-full ${canvasHeight} cursor-crosshair touch-none`}
          />

          {/* Compact Overlay Presets & Live Coordinate Pill */}
          <div className="pointer-events-none absolute top-3 left-3 obsidian-glass rounded-lg px-2.5 py-1.5 border border-[rgba(244,196,108,0.22)]">
            <div className="font-mono-data text-[10px] text-[#A8B2C6]">
              (r cos θ, r sin θ) ={' '}
              <span className="text-[#FFE29E] font-semibold">
                ({coordX.toFixed(2)}, {coordY.toFixed(2)})
              </span>
            </div>
          </div>

          {compact && (
            <div className="absolute bottom-3 left-3 right-3 flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap gap-1.5">
                {HARMONY_PRESETS.map((preset) => {
                  const active = activePresetId === preset.id;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => {
                        setPVal(preset.p);
                        setQVal(preset.q);
                      }}
                      className={`px-2.5 py-1 rounded text-[11px] font-mono-data border transition-all ${
                        active
                          ? 'text-[#060609] font-semibold'
                          : 'bg-[#0B0C12]/85 border-[rgba(244,196,108,0.2)] text-[#A8B2C6] hover:text-[#F7F4EC]'
                      }`}
                      style={
                        active
                          ? { backgroundColor: preset.accent, borderColor: preset.accent }
                          : undefined
                      }
                    >
                      {preset.label}
                    </button>
                  );
                })}
              </div>
              <span className="pointer-events-none hidden sm:inline font-mono-data text-[10px] text-[#A8B2C6] bg-[#0B0C12]/80 px-2 py-1 rounded border border-[rgba(244,196,108,0.16)]">
                Drag ring to set θ = {thetaDeg}°
              </span>
            </div>
          )}
        </div>

        {/* Full Lab Controls & Telemetry */}
        {!compact && (
          <div className="lg:col-span-5 bg-[#0B0C12] p-4 sm:p-5 flex flex-col justify-between gap-4 min-w-0">
            {/* Presets */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono-data text-[10px] uppercase tracking-[0.16em] text-[#A8B2C6]">
                  Harmony Presets
                </span>
                <span className="font-mono-data text-[10px] text-[#F4C46C]">
                  Ratio {ratio.toFixed(3)}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {HARMONY_PRESETS.map((preset) => {
                  const active = activePresetId === preset.id;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => {
                        setPVal(preset.p);
                        setQVal(preset.q);
                      }}
                      className={`px-3 py-2 rounded-lg text-left text-xs font-mono-data border transition-all ${
                        active
                          ? 'text-[#060609] font-semibold'
                          : 'bg-[#11131C] border-[rgba(244,196,108,0.16)] text-[#A8B2C6] hover:text-[#F7F4EC] hover:border-[rgba(244,196,108,0.36)]'
                      }`}
                      style={
                        active
                          ? {
                              backgroundColor: preset.accent,
                              borderColor: preset.accent,
                              boxShadow: `0 0 18px -6px ${preset.accent}`,
                            }
                          : undefined
                      }
                    >
                      <div className="flex items-center justify-between">
                        <span>{preset.label}</span>
                        <span className="text-[10px] opacity-80">
                          {preset.id === 'golden' ? 'φ:1' : `${preset.p}:${preset.q}`}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Frequency Ratio p:q and Phase Angle Sliders */}
              <div className="p-3.5 rounded-xl bg-[#11131C] border border-[rgba(244,196,108,0.16)] space-y-3">
                <label className="block space-y-1 text-xs">
                  <div className="flex justify-between font-mono-data">
                    <span className="text-[#A8B2C6]">Harmonic Numerator (p)</span>
                    <span className="text-[#F4C46C] font-semibold">{pVal.toFixed(pVal % 1 === 0 ? 0 : 3)}</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={8}
                    step={0.1}
                    value={pVal}
                    onChange={(e) => setPVal(parseFloat(e.target.value))}
                    className="meridian-slider"
                    style={{ ['--slider-accent' as string]: '#F4C46C' }}
                  />
                </label>

                <label className="block space-y-1 text-xs">
                  <div className="flex justify-between font-mono-data">
                    <span className="text-[#A8B2C6]">Harmonic Denominator (q)</span>
                    <span className="text-[#46D6E8] font-semibold">{qVal}</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={6}
                    step={1}
                    value={qVal}
                    onChange={(e) => setQVal(parseInt(e.target.value, 10))}
                    className="meridian-slider"
                    style={{ ['--slider-accent' as string]: '#46D6E8' }}
                  />
                </label>

                <label className="block space-y-1 text-xs">
                  <div className="flex justify-between font-mono-data">
                    <span className="text-[#A8B2C6]">Phase Angle (θ)</span>
                    <span className="text-[#45E6A6] font-semibold">
                      {thetaDeg}° ({thetaRad.toFixed(2)} rad)
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={360}
                    step={1}
                    value={thetaDeg}
                    onChange={(e) => {
                      const nextDeg = parseInt(e.target.value, 10);
                      stateRef.current.thetaRad = (nextDeg * Math.PI) / 180;
                      setThetaDeg(nextDeg);
                    }}
                    className="meridian-slider"
                    style={{ ['--slider-accent' as string]: '#45E6A6' }}
                  />
                </label>
              </div>
            </div>

            {/* Live Polar & Cartesian Readout Card */}
            <div className="p-3.5 rounded-xl bg-[#11131C] border border-[rgba(244,196,108,0.18)] space-y-2.5">
              <div className="grid grid-cols-3 gap-2 font-mono-data text-xs">
                <div className="p-2 rounded bg-[#0B0C12] border border-[rgba(244,196,108,0.12)]">
                  <div className="text-[9.5px] text-[#727D94]">r(θ)</div>
                  <div className="text-[#FFE29E] font-semibold">{rVal.toFixed(3)}</div>
                </div>
                <div className="p-2 rounded bg-[#0B0C12] border border-[rgba(70,214,232,0.18)]">
                  <div className="text-[9.5px] text-[#727D94]">r cos θ</div>
                  <div className="text-[#46D6E8] font-semibold">{coordX.toFixed(3)}</div>
                </div>
                <div className="p-2 rounded bg-[#0B0C12] border border-[rgba(255,133,99,0.18)]">
                  <div className="text-[9.5px] text-[#727D94]">r sin θ</div>
                  <div className="text-[#FF8563] font-semibold">{coordY.toFixed(3)}</div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <MathTex
                  tex={
                    isPureCircle
                      ? `(x, y) = (\\cos\\theta,\\; \\sin\\theta) = (${coordX.toFixed(2)},\\; ${coordY.toFixed(2)})`
                      : `r = \\cos\\!\\left(\\tfrac{${pVal.toFixed(pVal % 1 === 0 ? 0 : 2)}}{${qVal}}\\theta\\right) = ${rVal.toFixed(2)}`
                  }
                  className="text-xs text-[#F7F4EC]"
                />
              </div>

              <p className="text-xs text-[#A8B2C6] leading-relaxed">
                {HARMONY_PRESETS.find((pr) => pr.id === activePresetId)?.note ??
                  'Custom harmonic ratio connects circumference nodes into braided chord envelopes.'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default PolarHarmonicRingEngine;
