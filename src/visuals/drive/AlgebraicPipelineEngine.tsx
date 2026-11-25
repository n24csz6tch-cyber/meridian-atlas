import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pause, Play, RotateCcw, Sparkles } from 'lucide-react';
import { MathTex } from '../../components/MathTex';
import { useReducedMotion } from '../../hooks/useReducedMotion';

export interface AlgebraicPipelineEngineProps {
  compact?: boolean;
  heightClass?: string;
}

type CompositeMode = 'compose' | 'sum';

interface PipelinePreset {
  id: string;
  label: string;
  a: number;
  b: number;
  x: number;
  mode: CompositeMode;
}

const PRESETS: PipelinePreset[] = [
  { id: 'balanced', label: 'Balanced Scale', a: 1.2, b: 0.6, x: 1.0, mode: 'compose' },
  { id: 'shift', label: 'Vertex Shift', a: 1.0, b: -1.5, x: 1.2, mode: 'compose' },
  { id: 'invert', label: 'Inverted Fold', a: -1.4, b: 0.8, x: -0.6, mode: 'compose' },
  { id: 'sum', label: 'Quadratic Sum', a: 1.5, b: -1.0, x: 1.4, mode: 'sum' },
];

interface LinkSegment {
  x0: number;
  y0: number;
  cx0: number;
  cy0: number;
  cx1: number;
  cy1: number;
  x1: number;
  y1: number;
  color: string;
  glow: string;
}

function evalCubicBezier(p0: number, p1: number, p2: number, p3: number, t: number): number {
  const u = 1 - t;
  return u * u * u * p0 + 3 * u * u * t * p1 + 3 * u * t * t * p2 + t * t * t * p3;
}

function fmtSigned(val: number, digits = 2): string {
  return val >= 0 ? `+${val.toFixed(digits)}` : `−${Math.abs(val).toFixed(digits)}`;
}

export function AlgebraicPipelineEngine({
  compact = false,
  heightClass,
}: AlgebraicPipelineEngineProps = {}): JSX.Element {
  const reducedMotion = useReducedMotion();
  const [xVal, setXVal] = useState(1.15);
  const [aVal, setAVal] = useState(1.2);
  const [bVal, setBVal] = useState(0.6);
  const [mode, setMode] = useState<CompositeMode>('compose');
  const [playing, setPlaying] = useState(true);
  const [autoSweep, setAutoSweep] = useState(true);
  const [isVisible, setIsVisible] = useState(true);

  const hostRef = useRef<HTMLDivElement | null>(null);
  const pipelineBoxRef = useRef<HTMLDivElement | null>(null);
  const pipeCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const scopeCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const linksRef = useRef<LinkSegment[]>([]);
  const draggingScopeRef = useRef(false);

  const animRef = useRef({
    time: 0,
    x: xVal,
    a: aVal,
    b: bVal,
    mode,
    playing: playing && !reducedMotion,
    autoSweep,
    isVisible,
  });

  animRef.current.a = aVal;
  animRef.current.b = bVal;
  animRef.current.mode = mode;
  animRef.current.playing = playing && !reducedMotion;
  animRef.current.autoSweep = autoSweep;
  animRef.current.isVisible = isVisible;
  if (!autoSweep || !playing) {
    animRef.current.x = xVal;
  }

  // Derived stage values
  const stages = useMemo(() => {
    const linear = aVal * xVal + bVal;
    const xSquared = xVal * xVal;
    const warpedSquare = linear * linear;
    const composite = mode === 'compose' ? warpedSquare : xSquared + linear;
    const slope = mode === 'compose' ? 2 * aVal * linear : 2 * xVal + aVal;
    return { linear, xSquared, warpedSquare, composite, slope };
  }, [xVal, aVal, bVal, mode]);

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

  // Measure card port anchors for responsive bezier conduit routing
  const measureLinks = useCallback(() => {
    const box = pipelineBoxRef.current;
    const pipeCanvas = pipeCanvasRef.current;
    if (!box || !pipeCanvas) return;

    const boxRect = box.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.max(240, Math.floor(boxRect.width));
    const h = Math.max(120, Math.floor(boxRect.height));
    pipeCanvas.width = Math.floor(w * dpr);
    pipeCanvas.height = Math.floor(h * dpr);

    const colors = [
      { color: '#46D6E8', glow: 'rgba(70, 214, 232, 0.35)' },
      { color: '#45E6A6', glow: 'rgba(69, 230, 166, 0.35)' },
      { color: '#F4C46C', glow: 'rgba(244, 196, 108, 0.42)' },
    ];

    const nextLinks: LinkSegment[] = [];
    for (let i = 0; i < 3; i++) {
      const cA = cardRefs.current[i];
      const cB = cardRefs.current[i + 1];
      if (!cA || !cB) continue;
      const rA = cA.getBoundingClientRect();
      const rB = cB.getBoundingClientRect();

      const sameRow = Math.abs(rA.top - rB.top) < 28;
      if (sameRow) {
        const x0 = rA.right - boxRect.left;
        const y0 = rA.top + rA.height * 0.5 - boxRect.top;
        const x1 = rB.left - boxRect.left;
        const y1 = rB.top + rB.height * 0.5 - boxRect.top;
        const span = Math.max(24, (x1 - x0) * 0.55);
        nextLinks.push({
          x0,
          y0,
          cx0: x0 + span,
          cy0: y0 - 12,
          cx1: x1 - span,
          cy1: y1 + 12,
          x1,
          y1,
          ...colors[i],
        });
      } else {
        // Wrapped tablet / mobile vertical transition
        const x0 = rA.left + rA.width * 0.5 - boxRect.left;
        const y0 = rA.bottom - boxRect.top;
        const x1 = rB.left + rB.width * 0.5 - boxRect.left;
        const y1 = rB.top - boxRect.top;
        const dy = Math.max(18, (y1 - y0) * 0.55);
        nextLinks.push({
          x0,
          y0,
          cx0: x0,
          cy0: y0 + dy,
          cx1: x1,
          cy1: y1 - dy,
          x1,
          y1,
          ...colors[i],
        });
      }
    }
    linksRef.current = nextLinks;
  }, []);

  const drawPipeline = useCallback((time: number) => {
    const canvas = pipeCanvasRef.current;
    const box = pipelineBoxRef.current;
    if (!canvas || !box) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = box.clientWidth;
    const h = box.clientHeight;
    if (w < 60 || h < 60) return;

    ctx.save();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    // Subtle vertical dark telemetry stream threads in the backdrop
    const cols = Math.max(6, Math.floor(w / 95));
    for (let c = 0; c < cols; c++) {
      const gx = ((c + 0.5) / cols) * w;
      const grad = ctx.createLinearGradient(gx, 0, gx, h);
      grad.addColorStop(0, 'rgba(244, 196, 108, 0.01)');
      grad.addColorStop(0.5, 'rgba(244, 196, 108, 0.055)');
      grad.addColorStop(1, 'rgba(70, 214, 232, 0.015)');
      ctx.strokeStyle = grad;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(gx, 0);
      ctx.lineTo(gx, h);
      ctx.stroke();

      const dropY = ((time * (28 + (c % 3) * 14) + c * 47) % (h + 24)) - 12;
      ctx.fillStyle = c % 2 === 0 ? 'rgba(255, 226, 158, 0.35)' : 'rgba(70, 214, 232, 0.32)';
      ctx.beginPath();
      ctx.arc(gx, dropY, 1.4, 0, Math.PI * 2);
      ctx.fill();
    }

    const speedBoost = 0.45 + Math.min(0.65, Math.abs(animRef.current.a) * 0.22);
    const links = linksRef.current;

    ctx.globalCompositeOperation = 'lighter';
    for (let idx = 0; idx < links.length; idx++) {
      const seg = links[idx];

      // Braided 3-strand bezier filaments
      for (let strand = -1; strand <= 1; strand++) {
        const offset = strand * 4.5;
        ctx.beginPath();
        ctx.moveTo(seg.x0, seg.y0);
        ctx.bezierCurveTo(
          seg.cx0,
          seg.cy0 + offset,
          seg.cx1,
          seg.cy1 - offset,
          seg.x1,
          seg.y1
        );
        ctx.strokeStyle = strand === 0 ? seg.color : seg.glow;
        ctx.globalAlpha = strand === 0 ? 0.55 : 0.26;
        ctx.lineWidth = strand === 0 ? 2.1 : 1.1;
        ctx.stroke();
      }

      // Soft outer halo on main conduit
      ctx.globalAlpha = 0.22;
      ctx.strokeStyle = seg.color;
      ctx.lineWidth = 7;
      ctx.beginPath();
      ctx.moveTo(seg.x0, seg.y0);
      ctx.bezierCurveTo(seg.cx0, seg.cy0, seg.cx1, seg.cy1, seg.x1, seg.y1);
      ctx.stroke();
      ctx.globalAlpha = 1;

      // Port halos
      for (const [px, py] of [
        [seg.x0, seg.y0],
        [seg.x1, seg.y1],
      ]) {
        const pg = ctx.createRadialGradient(px, py, 0, px, py, 10);
        pg.addColorStop(0, '#FFE29E');
        pg.addColorStop(0.45, seg.color);
        pg.addColorStop(1, 'transparent');
        ctx.fillStyle = pg;
        ctx.beginPath();
        ctx.arc(px, py, 10, 0, Math.PI * 2);
        ctx.fill();
      }

      // Flowing animated golden dot packets left-to-right
      const packetCount = 4;
      for (let p = 0; p < packetCount; p++) {
        const phase = (time * speedBoost + idx * 0.23 + p / packetCount) % 1;
        const px = evalCubicBezier(seg.x0, seg.cx0, seg.cx1, seg.x1, phase);
        const py = evalCubicBezier(seg.y0, seg.cy0, seg.cy1, seg.y1, phase);

        // Trailing tail
        const tailPhase = Math.max(0, phase - 0.09);
        const tx = evalCubicBezier(seg.x0, seg.cx0, seg.cx1, seg.x1, tailPhase);
        const ty = evalCubicBezier(seg.y0, seg.cy0, seg.cy1, seg.y1, tailPhase);
        const tGrad = ctx.createLinearGradient(tx, ty, px, py);
        tGrad.addColorStop(0, 'transparent');
        tGrad.addColorStop(1, '#FFE29E');
        ctx.strokeStyle = tGrad;
        ctx.lineWidth = 2.6;
        ctx.beginPath();
        ctx.moveTo(tx, ty);
        ctx.lineTo(px, py);
        ctx.stroke();

        const g = ctx.createRadialGradient(px, py, 0, px, py, 9);
        g.addColorStop(0, '#FFFFFF');
        g.addColorStop(0.35, '#FFE29E');
        g.addColorStop(0.7, '#F4C46C');
        g.addColorStop(1, 'transparent');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(px, py, 9, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.restore();
  }, []);

  const drawOscilloscope = useCallback((time: number) => {
    const canvas = scopeCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (w < 80 || h < 60) return;

    if (canvas.width !== Math.floor(w * dpr) || canvas.height !== Math.floor(h * dpr)) {
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
    }

    const { x: activeX, a, b, mode: curMode } = animRef.current;

    ctx.save();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Obsidian deep scope backdrop
    ctx.fillStyle = '#060609';
    ctx.fillRect(0, 0, w, h);

    const padL = 38;
    const padR = 16;
    const padT = 22;
    const padB = 24;
    const plotW = Math.max(80, w - padL - padR);
    const plotH = Math.max(50, h - padT - padB);

    const xMin = -3.2;
    const xMax = 3.2;
    const yMin = -5.5;
    const yMax = 11.5;

    const toPx = (xv: number) => padL + ((xv - xMin) / (xMax - xMin)) * plotW;
    const toPy = (yv: number) => padT + ((yMax - yv) / (yMax - yMin)) * plotH;

    // Subtle cartographic grid
    ctx.strokeStyle = 'rgba(244, 196, 108, 0.06)';
    ctx.lineWidth = 1;
    for (let gx = -3; gx <= 3; gx++) {
      const sx = toPx(gx);
      ctx.beginPath();
      ctx.moveTo(sx, padT);
      ctx.lineTo(sx, padT + plotH);
      ctx.stroke();
    }
    for (let gy = -4; gy <= 10; gy += 2) {
      const sy = toPy(gy);
      ctx.beginPath();
      ctx.moveTo(padL, sy);
      ctx.lineTo(padL + plotW, sy);
      ctx.stroke();
    }

    // Zero axes
    const yZero = toPy(0);
    const xZero = toPx(0);
    ctx.strokeStyle = 'rgba(247, 244, 236, 0.16)';
    ctx.beginPath();
    ctx.moveTo(padL, yZero);
    ctx.lineTo(padL + plotW, yZero);
    ctx.moveTo(xZero, padT);
    ctx.lineTo(xZero, padT + plotH);
    ctx.stroke();

    // Axis ticks
    ctx.fillStyle = '#727D94';
    ctx.font = '10px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    for (let gx = -3; gx <= 3; gx++) {
      ctx.fillText(String(gx), toPx(gx), h - 7);
    }
    ctx.textAlign = 'right';
    for (let gy = -4; gy <= 10; gy += 4) {
      ctx.fillText(String(gy), padL - 6, toPy(gy) + 3);
    }

    // Clip curves cleanly inside plot box
    ctx.save();
    ctx.beginPath();
    ctx.rect(padL, padT, plotW, plotH);
    ctx.clip();

    const evalLinear = (t: number) => a * t + b;
    const evalQuad = (t: number) => t * t;
    const evalComp = (t: number) =>
      curMode === 'compose' ? (a * t + b) ** 2 : t * t + a * t + b;

    const plotCurve = (
      fn: (t: number) => number,
      strokeColor: string,
      glowColor: string,
      lineWidth: number,
      dashed = false
    ) => {
      const samples = 140;
      if (dashed) ctx.setLineDash([4, 4]);
      ctx.beginPath();
      for (let i = 0; i <= samples; i++) {
        const t = xMin + (i / samples) * (xMax - xMin);
        const px = toPx(t);
        const py = toPy(fn(t));
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.strokeStyle = glowColor;
      ctx.lineWidth = lineWidth * 3.1;
      ctx.stroke();

      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = lineWidth;
      ctx.stroke();
      if (dashed) ctx.setLineDash([]);
    };

    ctx.globalCompositeOperation = 'lighter';
    plotCurve(evalLinear, '#46D6E8', 'rgba(70, 214, 232, 0.22)', 1.9);
    plotCurve(evalQuad, '#45E6A6', 'rgba(69, 230, 166, 0.22)', 1.9, true);
    plotCurve(evalComp, '#FFE29E', 'rgba(244, 196, 108, 0.34)', 2.6);

    // Traveling luminous scan pulse along the Composite Output curve
    const scanT = xMin + (((time * 1.45) % 1) * (xMax - xMin));
    const scanPx = toPx(scanT);
    const scanPy = toPy(evalComp(scanT));
    const scanGlow = ctx.createRadialGradient(scanPx, scanPy, 0, scanPx, scanPy, 16);
    scanGlow.addColorStop(0, 'rgba(255, 226, 158, 0.85)');
    scanGlow.addColorStop(0.5, 'rgba(244, 196, 108, 0.28)');
    scanGlow.addColorStop(1, 'transparent');
    ctx.fillStyle = scanGlow;
    ctx.beginPath();
    ctx.arc(scanPx, scanPy, 16, 0, Math.PI * 2);
    ctx.fill();

    // Active x vertical reticle and intersection beacons
    ctx.globalCompositeOperation = 'source-over';
    const cx = toPx(activeX);
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = 'rgba(244, 196, 108, 0.65)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(cx, padT);
    ctx.lineTo(cx, padT + plotH);
    ctx.stroke();
    ctx.setLineDash([]);

    const markers = [
      { val: evalLinear(activeX), color: '#46D6E8' },
      { val: evalQuad(activeX), color: '#45E6A6' },
      { val: evalComp(activeX), color: '#FFE29E' },
    ];
    for (const m of markers) {
      const py = toPy(m.val);
      const mg = ctx.createRadialGradient(cx, py, 0, cx, py, 11);
      mg.addColorStop(0, '#FFFFFF');
      mg.addColorStop(0.4, m.color);
      mg.addColorStop(1, 'transparent');
      ctx.fillStyle = mg;
      ctx.beginPath();
      ctx.arc(cx, py, 11, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = m.color;
      ctx.beginPath();
      ctx.arc(cx, py, 3.8, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();

    // Top curve legend pills inside scope header (responsive for 390px viewports)
    ctx.font = w < 440 ? '9px "JetBrains Mono", monospace' : '10px "JetBrains Mono", monospace';
    ctx.textAlign = 'left';
    const gap1 = w < 440 ? 78 : 102;
    const gap2 = w < 440 ? 156 : 206;
    ctx.fillStyle = '#46D6E8';
    ctx.fillText(w < 440 ? '— ax+b' : '— Linear ax+b', padL + 4, 14);
    ctx.fillStyle = '#45E6A6';
    ctx.fillText(w < 440 ? '-- x²' : '-- Quadratic x²', padL + gap1, 14);
    ctx.fillStyle = '#FFE29E';
    ctx.fillText(
      curMode === 'compose'
        ? w < 440
          ? '— (ax+b)²'
          : '— Composite (ax+b)²'
        : w < 440
          ? '— x²+ax+b'
          : '— Composite x²+ax+b',
      padL + gap2,
      14
    );

    ctx.restore();
  }, []);

  // ResizeObserver keeps conduit anchors & canvas crisp
  useEffect(() => {
    measureLinks();
    drawPipeline(animRef.current.time);
    drawOscilloscope(animRef.current.time);

    const box = pipelineBoxRef.current;
    const scope = scopeCanvasRef.current;
    const ro = new ResizeObserver(() => {
      measureLinks();
      drawPipeline(animRef.current.time);
      drawOscilloscope(animRef.current.time);
    });
    if (box) ro.observe(box);
    if (scope) ro.observe(scope);

    return () => ro.disconnect();
  }, [measureLinks, drawPipeline, drawOscilloscope, compact]);

  // Redraw immediately when sliders change while paused
  useEffect(() => {
    drawPipeline(animRef.current.time);
    drawOscilloscope(animRef.current.time);
  }, [xVal, aVal, bVal, mode, drawPipeline, drawOscilloscope]);

  // 60fps animation loop (only runs while visible + playing + tab active)
  useEffect(() => {
    if (!isVisible || !playing || reducedMotion) return;

    let rafId = 0;
    let lastNow = performance.now();
    let uiSyncAccum = 0;

    const tick = (now: number) => {
      const dt = Math.min(0.05, Math.max(0.001, (now - lastNow) / 1000));
      lastNow = now;

      if (!document.hidden) {
        animRef.current.time += dt;
        if (animRef.current.autoSweep) {
          const swept = Number((Math.sin(animRef.current.time * 0.72) * 2.25).toFixed(2));
          animRef.current.x = swept;
          uiSyncAccum += dt;
          if (uiSyncAccum >= 0.065) {
            uiSyncAccum = 0;
            setXVal(swept);
          }
        }
        drawPipeline(animRef.current.time);
        drawOscilloscope(animRef.current.time);
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [isVisible, playing, reducedMotion, drawPipeline, drawOscilloscope]);

  // Scrub x directly on the oscilloscope canvas
  const updateXFromPointer = useCallback((clientX: number) => {
    const canvas = scopeCanvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const padL = 38;
    const padR = 16;
    const plotW = Math.max(80, rect.width - padL - padR);
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left - padL) / plotW));
    const nextX = Number((-3.0 + ratio * 6.0).toFixed(2));
    setAutoSweep(false);
    setXVal(nextX);
  }, []);

  const handleReset = () => {
    setAVal(1.2);
    setBVal(0.6);
    setXVal(1.15);
    setMode('compose');
    setAutoSweep(true);
    setPlaying(true);
  };

  const scopeHeight = heightClass ?? (compact ? 'h-[155px] sm:h-[180px]' : 'h-[205px] sm:h-[235px]');

  return (
    <div
      ref={hostRef}
      className="instrument-frame fiducial-frame overflow-hidden bg-[#060609] min-w-0 max-w-full"
    >
      {/* Top Control Header */}
      <div className="px-4 py-2.5 border-b hairline-rule bg-[#0B0C12]/95 flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className="w-2 h-2 rounded-full shrink-0"
            style={{ backgroundColor: '#F4C46C', boxShadow: '0 0 10px #F4C46C' }}
          />
          <span className="font-mono-data text-[10px] uppercase tracking-[0.16em] text-[#F4C46C] truncate">
            Algebraic Pipeline Engine
          </span>
          {!compact && (
            <span className="hidden sm:inline font-mono-data text-[10px] px-2 py-0.5 rounded bg-[#11131C] border border-[rgba(244,196,108,0.18)] text-[#A8B2C6]">
              x → ax+b → x² → f(x)
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setAutoSweep((s) => !s)}
            className={`px-2.5 py-1 rounded text-[11px] font-mono-data border transition-colors ${
              autoSweep
                ? 'border-[#45E6A6]/50 text-[#45E6A6] bg-[#45E6A6]/12'
                : 'border-[rgba(244,196,108,0.18)] bg-[#11131C] text-[#A8B2C6]'
            }`}
          >
            {autoSweep ? 'Auto-Sweep: ON' : 'Manual x'}
          </button>
          <button
            type="button"
            onClick={() => setPlaying((p) => !p)}
            aria-label={playing ? 'Pause signal flow' : 'Play signal flow'}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-mono-data border border-[rgba(244,196,108,0.22)] bg-[#11131C] text-[#F7F4EC] hover:border-[#F4C46C]/50"
          >
            {playing ? <Pause className="w-3 h-3 text-[#F4C46C]" /> : <Play className="w-3 h-3 text-[#F4C46C]" />}
            <span>{playing ? 'Pause' : 'Play'}</span>
          </button>
          <button
            type="button"
            onClick={handleReset}
            aria-label="Reset algebraic pipeline"
            className="p-1.5 rounded border border-[rgba(244,196,108,0.18)] bg-[#11131C] text-[#A8B2C6] hover:text-[#F7F4EC]"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Top 4 Telemetry Readout Cards (Full Lab Mode) */}
      {!compact && (
        <div className="px-4 py-2.5 border-b hairline-rule bg-[#0B0C12]/70 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="rounded-lg bg-[#11131C]/90 border border-[rgba(244,196,108,0.14)] px-3 py-2">
            <div className="font-mono-data text-[9.5px] uppercase tracking-[0.14em] text-[#A8B2C6]">
              Input Signal x
            </div>
            <div className="font-mono-data text-base sm:text-lg font-semibold text-[#FFE29E]">
              {xVal.toFixed(2)}
            </div>
          </div>
          <div className="rounded-lg bg-[#11131C]/90 border border-[rgba(70,214,232,0.22)] px-3 py-2">
            <div className="font-mono-data text-[9.5px] uppercase tracking-[0.14em] text-[#A8B2C6]">
              Linear Scale ax+b
            </div>
            <div className="font-mono-data text-base sm:text-lg font-semibold text-[#46D6E8]">
              {stages.linear.toFixed(2)}
            </div>
          </div>
          <div className="rounded-lg bg-[#11131C]/90 border border-[rgba(69,230,166,0.22)] px-3 py-2">
            <div className="font-mono-data text-[9.5px] uppercase tracking-[0.14em] text-[#A8B2C6]">
              Quadratic Warp x²
            </div>
            <div className="font-mono-data text-base sm:text-lg font-semibold text-[#45E6A6]">
              {stages.xSquared.toFixed(2)}
            </div>
          </div>
          <div className="rounded-lg bg-[#11131C]/90 border border-[rgba(244,196,108,0.3)] px-3 py-2">
            <div className="font-mono-data text-[9.5px] uppercase tracking-[0.14em] text-[#A8B2C6]">
              Output f(x) · Slope {stages.slope.toFixed(1)}
            </div>
            <div className="font-mono-data text-base sm:text-lg font-semibold text-[#F4C46C]">
              {stages.composite.toFixed(2)}
            </div>
          </div>
        </div>
      )}

      {/* 4 Luminous Pipeline Stage Cards + Bezier Pulse Canvas */}
      <div
        ref={pipelineBoxRef}
        className="relative px-4 py-4 sm:py-5 cartographic-grid border-b hairline-rule overflow-hidden"
      >
        <canvas
          ref={pipeCanvasRef}
          className="pointer-events-none absolute inset-0 w-full h-full"
        />

        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {/* Stage 1: Input x */}
          <div
            ref={(el) => {
              cardRefs.current[0] = el;
            }}
            className="obsidian-glass rounded-xl p-3 border border-[rgba(255,226,158,0.28)] shadow-[0_0_24px_-12px_rgba(255,226,158,0.45)] min-w-0"
          >
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <span className="font-mono-data text-[9.5px] uppercase tracking-[0.15em] text-[#FFE29E]">
                Stage 01 · Input
              </span>
              <span className="w-2 h-2 rounded-full bg-[#FFE29E] shadow-[0_0_8px_#FFE29E]" />
            </div>
            <div className="font-serif-editorial text-lg text-[#F7F4EC] leading-tight">
              Input <span className="font-mono-data text-[#FFE29E]">x</span>
            </div>
            <div className="mt-2 flex items-baseline justify-between font-mono-data">
              <span className="text-[11px] text-[#A8B2C6]">x =</span>
              <span className="text-base font-semibold text-[#FFE29E]">{xVal.toFixed(2)}</span>
            </div>
            <div className="mt-2 h-1 rounded-full bg-[#171A26] overflow-hidden">
              <div
                className="h-full rounded-full bg-[#FFE29E] transition-all duration-75"
                style={{ width: `${Math.min(100, Math.max(6, ((xVal + 3) / 6) * 100))}%` }}
              />
            </div>
          </div>

          {/* Stage 2: Linear Scale ax + b */}
          <div
            ref={(el) => {
              cardRefs.current[1] = el;
            }}
            className="obsidian-glass rounded-xl p-3 border border-[rgba(70,214,232,0.3)] shadow-[0_0_24px_-12px_rgba(70,214,232,0.45)] min-w-0"
          >
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <span className="font-mono-data text-[9.5px] uppercase tracking-[0.15em] text-[#46D6E8]">
                Stage 02 · Linear
              </span>
              <span className="w-2 h-2 rounded-full bg-[#46D6E8] shadow-[0_0_8px_#46D6E8]" />
            </div>
            <div className="font-serif-editorial text-lg text-[#F7F4EC] leading-tight">
              Linear Scale <span className="font-mono-data text-[#46D6E8]">ax+b</span>
            </div>
            <div className="mt-2 flex items-baseline justify-between font-mono-data">
              <span className="text-[10.5px] text-[#A8B2C6] truncate mr-1">
                {aVal.toFixed(1)}({xVal.toFixed(1)}){fmtSigned(bVal, 1)}
              </span>
              <span className="text-base font-semibold text-[#46D6E8] shrink-0">
                {stages.linear.toFixed(2)}
              </span>
            </div>
            <div className="mt-2 h-1 rounded-full bg-[#171A26] overflow-hidden">
              <div
                className="h-full rounded-full bg-[#46D6E8] transition-all duration-75"
                style={{ width: `${Math.min(100, Math.max(8, Math.abs(stages.linear) * 14))}%` }}
              />
            </div>
          </div>

          {/* Stage 3: Quadratic Warp x^2 */}
          <div
            ref={(el) => {
              cardRefs.current[2] = el;
            }}
            className="obsidian-glass rounded-xl p-3 border border-[rgba(69,230,166,0.3)] shadow-[0_0_24px_-12px_rgba(69,230,166,0.45)] min-w-0"
          >
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <span className="font-mono-data text-[9.5px] uppercase tracking-[0.15em] text-[#45E6A6]">
                Stage 03 · Quadratic
              </span>
              <span className="w-2 h-2 rounded-full bg-[#45E6A6] shadow-[0_0_8px_#45E6A6]" />
            </div>
            <div className="font-serif-editorial text-lg text-[#F7F4EC] leading-tight">
              Quadratic Warp <span className="font-mono-data text-[#45E6A6]">x²</span>
            </div>
            <div className="mt-2 flex items-baseline justify-between font-mono-data">
              <span className="text-[10.5px] text-[#A8B2C6] truncate mr-1">
                {mode === 'compose'
                  ? `(${stages.linear.toFixed(1)})²`
                  : `(${xVal.toFixed(1)})²`}
              </span>
              <span className="text-base font-semibold text-[#45E6A6] shrink-0">
                {(mode === 'compose' ? stages.warpedSquare : stages.xSquared).toFixed(2)}
              </span>
            </div>
            <div className="mt-2 h-1 rounded-full bg-[#171A26] overflow-hidden">
              <div
                className="h-full rounded-full bg-[#45E6A6] transition-all duration-75"
                style={{
                  width: `${Math.min(
                    100,
                    Math.max(8, (mode === 'compose' ? stages.warpedSquare : stages.xSquared) * 8)
                  )}%`,
                }}
              />
            </div>
          </div>

          {/* Stage 4: Composite Output f(x) */}
          <div
            ref={(el) => {
              cardRefs.current[3] = el;
            }}
            className="obsidian-glass rounded-xl p-3 border border-[rgba(244,196,108,0.45)] shadow-[0_0_28px_-10px_rgba(244,196,108,0.55)] min-w-0"
          >
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <span className="font-mono-data text-[9.5px] uppercase tracking-[0.15em] text-[#F4C46C]">
                Stage 04 · Output
              </span>
              <span className="w-2 h-2 rounded-full bg-[#F4C46C] shadow-[0_0_8px_#F4C46C]" />
            </div>
            <div className="font-serif-editorial text-lg text-[#F7F4EC] leading-tight">
              Output <span className="font-mono-data text-[#F4C46C]">f(x)</span>
            </div>
            <div className="mt-2 flex items-baseline justify-between font-mono-data">
              <span className="text-[10.5px] text-[#A8B2C6] truncate mr-1">
                {mode === 'compose' ? '(ax+b)² =' : 'x²+ax+b ='}
              </span>
              <span className="text-base font-semibold text-[#F4C46C] shrink-0">
                {stages.composite.toFixed(2)}
              </span>
            </div>
            <div className="mt-2 h-1 rounded-full bg-[#171A26] overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#F4C46C] to-[#FFE29E] transition-all duration-75"
                style={{ width: `${Math.min(100, Math.max(8, Math.abs(stages.composite) * 8))}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Live Multi-Wave Oscilloscope */}
      <div className="relative bg-[#060609]">
        <div className={`w-full ${scopeHeight} relative`}>
          <canvas
            ref={scopeCanvasRef}
            onPointerDown={(e) => {
              draggingScopeRef.current = true;
              updateXFromPointer(e.clientX);
            }}
            onPointerMove={(e) => {
              if (draggingScopeRef.current) updateXFromPointer(e.clientX);
            }}
            onPointerUp={() => {
              draggingScopeRef.current = false;
            }}
            onPointerLeave={() => {
              draggingScopeRef.current = false;
            }}
            className="block w-full h-full cursor-ew-resize touch-none"
          />
          <div className="pointer-events-none absolute bottom-2 right-3 hidden sm:flex items-center gap-1.5 font-mono-data text-[10px] text-[#A8B2C6] bg-[#0B0C12]/80 px-2 py-0.5 rounded border border-[rgba(244,196,108,0.16)]">
            <Sparkles className="w-3 h-3 text-[#F4C46C]" />
            <span>Drag waveform to probe x</span>
          </div>
        </div>
      </div>

      {/* Interactive Sliders & Presets */}
      <div className="px-4 py-3 border-t hairline-rule bg-[#0B0C12]/95 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <label className="block space-y-1 text-xs min-w-0">
            <div className="flex justify-between font-mono-data">
              <span className="text-[#A8B2C6]">Input x</span>
              <span className="text-[#FFE29E] font-semibold">{xVal.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min={-3.0}
              max={3.0}
              step={0.05}
              value={xVal}
              onChange={(e) => {
                setAutoSweep(false);
                setXVal(parseFloat(e.target.value));
              }}
              className="meridian-slider"
              style={{ ['--slider-accent' as string]: '#FFE29E' }}
            />
          </label>

          <label className="block space-y-1 text-xs min-w-0">
            <div className="flex justify-between font-mono-data">
              <span className="text-[#A8B2C6]">Scale Slope a</span>
              <span className="text-[#46D6E8] font-semibold">{aVal.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min={-2.0}
              max={2.0}
              step={0.05}
              value={aVal}
              onChange={(e) => setAVal(parseFloat(e.target.value))}
              className="meridian-slider"
              style={{ ['--slider-accent' as string]: '#46D6E8' }}
            />
          </label>

          <label className="block space-y-1 text-xs min-w-0">
            <div className="flex justify-between font-mono-data">
              <span className="text-[#A8B2C6]">Offset b</span>
              <span className="text-[#45E6A6] font-semibold">{bVal.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min={-3.0}
              max={3.0}
              step={0.1}
              value={bVal}
              onChange={(e) => setBVal(parseFloat(e.target.value))}
              className="meridian-slider"
              style={{ ['--slider-accent' as string]: '#45E6A6' }}
            />
          </label>
        </div>

        {!compact && (
          <div className="pt-2 border-t border-[rgba(244,196,108,0.12)] flex flex-wrap items-center justify-between gap-2.5">
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => setMode('compose')}
                className={`px-2.5 py-1 rounded text-[11px] font-mono-data border transition-colors ${
                  mode === 'compose'
                    ? 'border-[#F4C46C]/60 bg-[#F4C46C]/15 text-[#FFE29E]'
                    : 'border-[rgba(244,196,108,0.16)] bg-[#11131C] text-[#A8B2C6]'
                }`}
              >
                f(x) = (ax + b)²
              </button>
              <button
                type="button"
                onClick={() => setMode('sum')}
                className={`px-2.5 py-1 rounded text-[11px] font-mono-data border transition-colors ${
                  mode === 'sum'
                    ? 'border-[#F4C46C]/60 bg-[#F4C46C]/15 text-[#FFE29E]'
                    : 'border-[rgba(244,196,108,0.16)] bg-[#11131C] text-[#A8B2C6]'
                }`}
              >
                f(x) = x² + ax + b
              </button>

              {PRESETS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    setAVal(p.a);
                    setBVal(p.b);
                    setXVal(p.x);
                    setMode(p.mode);
                    setAutoSweep(false);
                  }}
                  className="px-2 py-1 rounded text-[10.5px] font-mono-data border border-[rgba(244,196,108,0.14)] bg-[#11131C] text-[#A8B2C6] hover:text-[#F7F4EC] hover:border-[rgba(244,196,108,0.36)]"
                >
                  {p.label}
                </button>
              ))}
            </div>

            <div className="overflow-x-auto max-w-full">
              <MathTex
                tex={
                  mode === 'compose'
                    ? `f(${xVal.toFixed(2)}) = (${aVal.toFixed(1)}(${xVal.toFixed(2)}) ${fmtSigned(bVal, 1)})^2 = ${stages.composite.toFixed(2)}`
                    : `f(${xVal.toFixed(2)}) = (${xVal.toFixed(2)})^2 ${fmtSigned(aVal, 1)}(${xVal.toFixed(2)}) ${fmtSigned(bVal, 1)} = ${stages.composite.toFixed(2)}`
                }
                className="text-xs text-[#F7F4EC]"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AlgebraicPipelineEngine;
