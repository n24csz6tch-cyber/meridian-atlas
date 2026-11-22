import { useCallback, useEffect, useRef, useState } from 'react';
import { Pause, Play } from 'lucide-react';
import { MathTex } from '../../components/MathTex';
import { useReducedMotion } from '../../hooks/useReducedMotion';

export interface UnitCircleWaveCanvasProps {
  compact?: boolean;
  heightClass?: string;
  initialPlaying?: boolean;
  highlightFeature?: 'all' | 'sine' | 'cosine' | 'amplitude' | 'frequency';
}

const SPECIAL_ANGLES = [
  { label: 'π/6', rad: Math.PI / 6 },
  { label: 'π/4', rad: Math.PI / 4 },
  { label: 'π/3', rad: Math.PI / 3 },
  { label: 'π/2', rad: Math.PI / 2 },
  { label: '3π/4', rad: (3 * Math.PI) / 4 },
  { label: 'π', rad: Math.PI },
  { label: '3π/2', rad: (3 * Math.PI) / 2 },
];

export function UnitCircleWaveCanvas({
  compact = false,
  heightClass = 'h-[340px] sm:h-[400px]',
  initialPlaying = true,
  highlightFeature = 'all',
}: UnitCircleWaveCanvasProps) {
  const reducedMotion = useReducedMotion();
  const [theta, setTheta] = useState(Math.PI / 3);
  const [amplitude, setAmplitude] = useState(1.0);
  const [frequency, setFrequency] = useState(1.0);
  const [showCosine, setShowCosine] = useState(true);
  const [playing, setPlaying] = useState(initialPlaying);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const sizeRef = useRef({ width: 760, height: 360, dpr: 1 });
  const visibleRef = useRef(true);
  const draggingCircleRef = useRef(false);

  const thetaRef = useRef(theta);
  const stateRef = useRef({
    theta,
    amplitude,
    frequency,
    showCosine,
    highlightFeature,
  });
  stateRef.current = {
    theta: thetaRef.current,
    amplitude,
    frequency,
    showCosine,
    highlightFeature,
  };

  const playingRef = useRef(playing && !reducedMotion);
  useEffect(() => {
    playingRef.current = playing && !reducedMotion;
  }, [playing, reducedMotion]);

  const drawScene = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height, dpr } = sizeRef.current;
    if (width < 60 || height < 60) return;

    const {
      theta: th,
      amplitude: amp,
      frequency: freq,
      showCosine: drawCos,
    } = stateRef.current;

    ctx.save();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Obsidian background
    ctx.fillStyle = '#05070C';
    ctx.fillRect(0, 0, width, height);

    const isNarrow = width < 560;
    const circleCx = isNarrow ? width * 0.28 : width * 0.25;
    const cy = height * 0.52;
    const baseR = Math.min(isNarrow ? width * 0.19 : width * 0.16, height * 0.3);
    const waveLeft = circleCx + baseR * 1.48;
    const waveRight = width - 22;
    const waveW = Math.max(120, waveRight - waveLeft);

    // Grid lines across wave region
    ctx.strokeStyle = 'rgba(237, 235, 228, 0.06)';
    ctx.lineWidth = 1;
    for (let k = -2; k <= 2; k++) {
      const gy = cy - (k * 0.5) * baseR;
      ctx.beginPath();
      ctx.moveTo(waveLeft, gy);
      ctx.lineTo(waveRight, gy);
      ctx.stroke();
    }
    ctx.strokeStyle = 'rgba(237, 235, 228, 0.14)';
    ctx.beginPath();
    ctx.moveTo(waveLeft, cy);
    ctx.lineTo(waveRight, cy);
    ctx.stroke();

    // Vertical pi ticks on wave domain [0, 4pi]
    const domainMax = Math.PI * 4;
    for (let p = 0; p <= 4; p++) {
      const gx = waveLeft + ((p * Math.PI) / domainMax) * waveW;
      ctx.strokeStyle = 'rgba(237, 235, 228, 0.08)';
      ctx.beginPath();
      ctx.moveTo(gx, 24);
      ctx.lineTo(gx, height - 24);
      ctx.stroke();
      ctx.fillStyle = '#707D94';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(p === 0 ? '0' : p === 1 ? 'π' : `${p}π`, gx, height - 10);
    }

    // Unit Circle Axes
    ctx.strokeStyle = 'rgba(237, 235, 228, 0.16)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(circleCx - baseR * 1.28, cy);
    ctx.lineTo(circleCx + baseR * 1.28, cy);
    ctx.moveTo(circleCx, cy - baseR * 1.28);
    ctx.lineTo(circleCx, cy + baseR * 1.28);
    ctx.stroke();

    // Scaled amplitude outer glow ring & reference unit ring
    ctx.strokeStyle = 'rgba(237, 235, 228, 0.22)';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.arc(circleCx, cy, baseR, 0, Math.PI * 2);
    ctx.stroke();

    if (Math.abs(amp - 1) > 0.03) {
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = 'rgba(255, 120, 90, 0.28)';
      ctx.beginPath();
      ctx.arc(circleCx, cy, baseR * amp, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Special angle tick markers on unit circle
    for (let m = 0; m < 12; m++) {
      const ang = (m * Math.PI) / 6;
      const ix = circleCx + Math.cos(ang) * (baseR - 4);
      const iy = cy - Math.sin(ang) * (baseR - 4);
      const ox = circleCx + Math.cos(ang) * (baseR + 4);
      const oy = cy - Math.sin(ang) * (baseR + 4);
      ctx.strokeStyle = 'rgba(237, 235, 228, 0.26)';
      ctx.beginPath();
      ctx.moveTo(ix, iy);
      ctx.lineTo(ox, oy);
      ctx.stroke();
    }

    // Active Point P(cos(freq*theta), sin(freq*theta)) scaled by amplitude
    const phase = th * freq;
    const cosVal = Math.cos(phase);
    const sinVal = Math.sin(phase);
    const rActive = baseR * amp;
    const px = circleCx + cosVal * rActive;
    const py = cy - sinVal * rActive;

    // Angle Sector wedge
    ctx.fillStyle = 'rgba(244, 185, 86, 0.14)';
    ctx.beginPath();
    ctx.moveTo(circleCx, cy);
    ctx.arc(circleCx, cy, Math.min(28, rActive * 0.45), 0, -(phase % (Math.PI * 2)), true);
    ctx.closePath();
    ctx.fill();

    // Right Triangle legs inside Unit Circle
    // Cosine leg (horizontal cyan)
    ctx.strokeStyle = '#38D4FF';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(circleCx, cy);
    ctx.lineTo(px, cy);
    ctx.stroke();

    // Sine leg (vertical coral)
    ctx.strokeStyle = '#FF785A';
    ctx.lineWidth = 2.6;
    ctx.beginPath();
    ctx.moveTo(px, cy);
    ctx.lineTo(px, py);
    ctx.stroke();

    // Radius vector (amber gold)
    ctx.strokeStyle = '#F4B956';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(circleCx, cy);
    ctx.lineTo(px, py);
    ctx.stroke();

    // Full background faint reference curves across [0, 4pi]
    const samples = 160;
    if (drawCos) {
      ctx.strokeStyle = 'rgba(56, 212, 255, 0.25)';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      for (let i = 0; i <= samples; i++) {
        const t = (i / samples) * domainMax;
        const x = waveLeft + (t / domainMax) * waveW;
        const y = cy - amp * Math.cos(freq * t) * baseR;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    ctx.strokeStyle = 'rgba(255, 120, 90, 0.24)';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    for (let i = 0; i <= samples; i++) {
      const t = (i / samples) * domainMax;
      const x = waveLeft + (t / domainMax) * waveW;
      const y = cy - amp * Math.sin(freq * t) * baseR;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Active traced wave from 0 -> theta with additive bloom
    const wrappedTheta = ((th % domainMax) + domainMax) % domainMax;
    const waveCursorX = waveLeft + (wrappedTheta / domainMax) * waveW;
    const activeSteps = Math.max(8, Math.floor((wrappedTheta / domainMax) * samples));

    ctx.globalCompositeOperation = 'lighter';

    if (drawCos) {
      ctx.beginPath();
      for (let i = 0; i <= activeSteps; i++) {
        const t = (i / activeSteps) * wrappedTheta;
        const x = waveLeft + (t / domainMax) * waveW;
        const y = cy - amp * Math.cos(freq * t) * baseR;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = 'rgba(56, 212, 255, 0.85)';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // Glowing Sine Trace
    ctx.beginPath();
    for (let i = 0; i <= activeSteps; i++) {
      const t = (i / activeSteps) * wrappedTheta;
      const x = waveLeft + (t / domainMax) * waveW;
      const y = cy - amp * Math.sin(freq * t) * baseR;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = 'rgba(255, 120, 90, 0.35)';
    ctx.lineWidth = 6;
    ctx.stroke();
    ctx.strokeStyle = '#FF785A';
    ctx.lineWidth = 2.4;
    ctx.stroke();

    // Horizontal Projection Beam connecting Circle Point P -> Wave Crest!
    ctx.globalCompositeOperation = 'source-over';
    ctx.setLineDash([5, 5]);
    ctx.strokeStyle = 'rgba(255, 120, 90, 0.75)';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.lineTo(waveCursorX, py);
    ctx.stroke();
    ctx.setLineDash([]);

    // Vertical stem on wave cursor
    ctx.strokeStyle = 'rgba(237, 235, 228, 0.25)';
    ctx.beginPath();
    ctx.moveTo(waveCursorX, cy);
    ctx.lineTo(waveCursorX, py);
    ctx.stroke();

    // Point P beacon + wave tip beacon
    const drawBeacon = (bx: number, by: number, color: string) => {
      const g = ctx.createRadialGradient(bx, by, 1, bx, by, 14);
      g.addColorStop(0, '#FFFFFF');
      g.addColorStop(0.35, color);
      g.addColorStop(1, 'transparent');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(bx, by, 14, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(bx, by, 4.5, 0, Math.PI * 2);
      ctx.fill();
    };

    drawBeacon(px, py, '#F4B956');
    drawBeacon(waveCursorX, py, '#FF785A');

    // Wave legend labels inside plot
    ctx.font = '10px "JetBrains Mono", monospace';
    ctx.textAlign = 'left';
    ctx.fillStyle = '#FF785A';
    ctx.fillText(`y = ${amp.toFixed(1)} sin(${freq.toFixed(1)}θ)`, waveLeft + 8, 22);
    if (drawCos) {
      ctx.fillStyle = '#38D4FF';
      ctx.fillText(`y = ${amp.toFixed(1)} cos(${freq.toFixed(1)}θ)`, waveLeft + 150, 22);
    }

    ctx.restore();
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const updateSize = () => {
      const rect = container.getBoundingClientRect();
      const width = Math.max(260, Math.floor(rect.width));
      const height = Math.max(220, Math.floor(rect.height));
      const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      sizeRef.current = { width, height, dpr };
      drawScene();
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
  }, [drawScene]);

  useEffect(() => {
    thetaRef.current = theta;
    stateRef.current.theta = theta;
    drawScene();
  }, [theta, amplitude, frequency, showCosine, drawScene]);

  useEffect(() => {
    let rafId = 0;
    let last: number | null = null;
    let lastReactSync = 0;
    const tick = (now: number) => {
      if (last === null) last = now;
      const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
      last = now;
      if (visibleRef.current && !document.hidden && playingRef.current) {
        const nextTheta = (thetaRef.current + dt * 1.15) % (Math.PI * 4);
        thetaRef.current = nextTheta;
        stateRef.current.theta = nextTheta;
        drawScene();
        if (now - lastReactSync > 240) {
          lastReactSync = now;
          setTheta(nextTheta);
        }
      }
      rafId = window.requestAnimationFrame(tick);
    };
    rafId = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(rafId);
  }, [drawScene]);

  const updateAngleFromPointer = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const isNarrow = width < 560;
    const circleCx = isNarrow ? width * 0.28 : width * 0.25;
    const cy = height * 0.52;
    const dx = e.clientX - rect.left - circleCx;
    const dy = -(e.clientY - rect.top - cy);
    let angle = Math.atan2(dy, dx);
    if (angle < 0) angle += Math.PI * 2;
    setTheta(angle / Math.max(0.25, frequency));
  };

  const phaseVal = theta * frequency;
  const sinNum = amplitude * Math.sin(phaseVal);
  const cosNum = amplitude * Math.cos(phaseVal);
  const tanNum = Math.abs(Math.cos(phaseVal)) < 0.02 ? null : Math.tan(phaseVal);

  return (
    <div className="instrument-frame fiducial-frame overflow-hidden">
      <div className="px-4 py-2.5 border-b hairline-rule bg-[#080C15]/90 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: '#FF785A', boxShadow: '0 0 10px #FF785A' }}
          />
          <span className="font-mono-data text-[10px] uppercase tracking-[0.18em] text-[#A7B3C7]">
            Unit Circle ↔ Harmonic Projection
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {!compact &&
            SPECIAL_ANGLES.map((sp) => (
              <button
                key={sp.label}
                type="button"
                onClick={() => {
                  setPlaying(false);
                  setTheta(sp.rad / frequency);
                }}
                className="px-2 py-0.5 rounded text-[11px] font-mono-data border border-[rgba(237,235,228,0.12)] text-[#A7B3C7] hover:text-[#F2F0E8] hover:border-[rgba(237,235,228,0.3)]"
              >
                {sp.label}
              </button>
            ))}

          <button
            type="button"
            onClick={() => setShowCosine((v) => !v)}
            className={`px-2 py-0.5 rounded text-[11px] font-mono-data border ${
              showCosine
                ? 'bg-[#38D4FF]/15 text-[#38D4FF] border-[#38D4FF]/45'
                : 'text-[#A7B3C7] border-[rgba(237,235,228,0.14)]'
            }`}
          >
            cos θ
          </button>

          <button
            type="button"
            onClick={() => setPlaying((p) => !p)}
            aria-label={playing ? 'Pause rotation' : 'Play rotation'}
            className="p-1.5 rounded border border-[rgba(237,235,228,0.16)] text-[#F2F0E8]"
          >
            {playing ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      <div ref={containerRef} className={`relative w-full ${heightClass} bg-[#05070C]`}>
        <canvas
          ref={canvasRef}
          onPointerDown={(e) => {
            draggingCircleRef.current = true;
            setPlaying(false);
            updateAngleFromPointer(e);
          }}
          onPointerMove={(e) => {
            if (draggingCircleRef.current) updateAngleFromPointer(e);
          }}
          onPointerUp={() => {
            draggingCircleRef.current = false;
          }}
          onPointerLeave={() => {
            draggingCircleRef.current = false;
          }}
          className="block w-full h-full cursor-crosshair touch-none"
        />

        {/* Telemetry strip bottom-left */}
        <div className="pointer-events-none absolute bottom-3 left-3 obsidian-glass rounded px-3 py-1.5 flex flex-wrap items-center gap-3 text-[11px] font-mono-data">
          <span className="text-[#F4B956]">θ = {theta.toFixed(2)} rad</span>
          <span className="text-[#FF785A]">A·sin = {sinNum.toFixed(2)}</span>
          <span className="text-[#38D4FF]">A·cos = {cosNum.toFixed(2)}</span>
          <span className="text-[#34E8A5]">
            tan = {tanNum === null ? 'undef' : tanNum.toFixed(2)}
          </span>
        </div>
      </div>

      {!compact && (
        <div className="px-4 py-3 border-t hairline-rule bg-[#080C15]/95 flex flex-wrap items-center gap-5 text-xs">
          <label className="flex-1 min-w-[160px] space-y-1">
            <span className="flex justify-between font-mono-data text-[10px] text-[#A7B3C7]">
              <span>Angle θ</span>
              <span className="text-[#F4B956]">
                {theta.toFixed(2)} rad ({((theta * 180) / Math.PI).toFixed(0)}°)
              </span>
            </span>
            <input
              type="range"
              min={0}
              max={Number((Math.PI * 4).toFixed(2))}
              step={0.02}
              value={theta}
              onChange={(e) => {
                setPlaying(false);
                setTheta(Number(e.target.value));
              }}
              className="meridian-slider"
              style={{ ['--slider-accent' as string]: '#F4B956' }}
            />
          </label>

          <label className="flex-1 min-w-[140px] space-y-1">
            <span className="flex justify-between font-mono-data text-[10px] text-[#A7B3C7]">
              <span>Amplitude A</span>
              <span className="text-[#FF785A]">{amplitude.toFixed(2)}</span>
            </span>
            <input
              type="range"
              min={0.4}
              max={1.4}
              step={0.05}
              value={amplitude}
              onChange={(e) => setAmplitude(Number(e.target.value))}
              className="meridian-slider"
              style={{ ['--slider-accent' as string]: '#FF785A' }}
            />
          </label>

          <label className="flex-1 min-w-[140px] space-y-1">
            <span className="flex justify-between font-mono-data text-[10px] text-[#A7B3C7]">
              <span>Frequency B</span>
              <span className="text-[#38D4FF]">{frequency.toFixed(2)}×</span>
            </span>
            <input
              type="range"
              min={0.5}
              max={2.5}
              step={0.1}
              value={frequency}
              onChange={(e) => setFrequency(Number(e.target.value))}
              className="meridian-slider"
              style={{ ['--slider-accent' as string]: '#38D4FF' }}
            />
          </label>

          <div className="text-xs text-[#A7B3C7]">
            <MathTex tex="P(\theta) = (\cos\theta,\; \sin\theta)" className="text-sm text-[#F2F0E8]" />
          </div>
        </div>
      )}
    </div>
  );
}
