import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeftRight } from 'lucide-react';
import { MathTex } from '../../components/MathTex';

export interface LogarithmLabProps {
  heightClass?: string;
}

interface LogExpression {
  id: string;
  label: string;
  condensedTex: string;
  splitTex: string;
  expandedTex: string;
  tokens: {
    id: string;
    sign: '+' | '-';
    coef: string;
    rawTex: string;
    expandedPartTex: string;
    rule: string;
  }[];
}

const LOG_EXPRESSIONS: LogExpression[] = [
  {
    id: 'binary-rational',
    label: 'log₂(8x³ / y²)',
    condensedTex: '\\log_2\\!\\left(\\dfrac{8x^3}{y^2}\\right)',
    splitTex: '\\log_2(8) + \\log_2(x^3) - \\log_2(y^2)',
    expandedTex: '3 + 3\\log_2(x) - 2\\log_2(y)',
    tokens: [
      {
        id: 't1',
        sign: '+',
        coef: 'Eval 2³=8',
        rawTex: '\\log_2(8)',
        expandedPartTex: '3',
        rule: 'Product numerator splits positively; log₂(8) = 3',
      },
      {
        id: 't2',
        sign: '+',
        coef: 'Power 3',
        rawTex: '\\log_2(x^3)',
        expandedPartTex: '+\\;3\\log_2(x)',
        rule: 'Exponent inside argument drops forward as multiplier',
      },
      {
        id: 't3',
        sign: '-',
        coef: 'Quotient −2',
        rawTex: '-\\log_2(y^2)',
        expandedPartTex: '-\\;2\\log_2(y)',
        rule: 'Denominator becomes subtraction, then exponent 2 drops down',
      },
    ],
  },
  {
    id: 'natural-radical',
    label: 'ln(x⁴√z / e²)',
    condensedTex: '\\ln\\!\\left(\\dfrac{x^4\\sqrt{z}}{e^2}\\right)',
    splitTex: '\\ln(x^4) + \\ln(z^{1/2}) - \\ln(e^2)',
    expandedTex: '4\\ln(x) + \\tfrac{1}{2}\\ln(z) - 2',
    tokens: [
      {
        id: 'n1',
        sign: '+',
        coef: 'Power 4',
        rawTex: '\\ln(x^4)',
        expandedPartTex: '4\\ln(x)',
        rule: 'Power rule brings 4 in front of natural log',
      },
      {
        id: 'n2',
        sign: '+',
        coef: 'Radical ½',
        rawTex: '\\ln(z^{1/2})',
        expandedPartTex: '+\\;\\tfrac{1}{2}\\ln(z)',
        rule: 'Square root is fractional exponent 1/2',
      },
      {
        id: 'n3',
        sign: '-',
        coef: 'Inverse −2',
        rawTex: '-\\ln(e^2)',
        expandedPartTex: '-\\;2',
        rule: 'Denominator e² subtracts out cleanly since ln(e²)=2',
      },
    ],
  },
  {
    id: 'common-product',
    label: 'log₁₀(100a²b)',
    condensedTex: '\\log\\!\\left(100\\,a^2 b\\right)',
    splitTex: '\\log(100) + \\log(a^2) + \\log(b)',
    expandedTex: '2 + 2\\log(a) + \\log(b)',
    tokens: [
      {
        id: 'c1',
        sign: '+',
        coef: '10²=100',
        rawTex: '\\log(100)',
        expandedPartTex: '2',
        rule: 'Common base-10 logarithm evaluates log₁₀(100) = 2',
      },
      {
        id: 'c2',
        sign: '+',
        coef: 'Power 2',
        rawTex: '\\log(a^2)',
        expandedPartTex: '+\\;2\\log(a)',
        rule: 'Factor a² brings exponent 2 out as scalar coefficient',
      },
      {
        id: 'c3',
        sign: '+',
        coef: 'Product b',
        rawTex: '\\log(b)',
        expandedPartTex: '+\\;\\log(b)',
        rule: 'Multiplication inside input splits into addition',
      },
    ],
  },
];

export function LogarithmLab({ heightClass = 'h-[320px] sm:h-[360px]' }: LogarithmLabProps) {
  const [base, setBase] = useState(2.0);
  const [shiftH, setShiftH] = useState(0.0);
  const [probeT, setProbeT] = useState(1.25);

  const [exprIdx, setExprIdx] = useState(0);
  const [stage, setStage] = useState<'condensed' | 'split' | 'expanded'>('expanded');

  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const sizeRef = useRef({ width: 700, height: 340, dpr: 1 });

  const graphRef = useRef({ base, shiftH, probeT });
  graphRef.current = { base, shiftH, probeT };

  const drawGraph = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height, dpr } = sizeRef.current;
    if (width < 60 || height < 60) return;

    const { base: b, shiftH: h, probeT: tVal } = graphRef.current;
    const cx = width * 0.45;
    const cy = height * 0.56;
    const pxPerUnit = Math.min(width, height) * 0.088;

    const toPx = (x: number, y: number): [number, number] => [
      cx + x * pxPerUnit,
      cy - y * pxPerUnit,
    ];

    ctx.save();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    ctx.fillStyle = '#05070C';
    ctx.fillRect(0, 0, width, height);

    // Subtle cartesian grid
    ctx.strokeStyle = 'rgba(237, 235, 228, 0.06)';
    ctx.lineWidth = 1;
    for (let g = -6; g <= 8; g++) {
      const [gx] = toPx(g, 0);
      const [, gy] = toPx(0, g);
      if (gx >= 0 && gx <= width) {
        ctx.beginPath();
        ctx.moveTo(gx, 0);
        ctx.lineTo(gx, height);
        ctx.stroke();
      }
      if (gy >= 0 && gy <= height) {
        ctx.beginPath();
        ctx.moveTo(0, gy);
        ctx.lineTo(width, gy);
        ctx.stroke();
      }
    }

    // Main axes
    ctx.strokeStyle = 'rgba(237, 235, 228, 0.22)';
    ctx.beginPath();
    ctx.moveTo(0, cy);
    ctx.lineTo(width, cy);
    ctx.moveTo(cx, 0);
    ctx.lineTo(cx, height);
    ctx.stroke();

    // Diagonal mirror axis y = x
    ctx.setLineDash([6, 5]);
    ctx.strokeStyle = 'rgba(237, 235, 228, 0.34)';
    ctx.lineWidth = 1.3;
    const [m1x, m1y] = toPx(-5, -5);
    const [m2x, m2y] = toPx(6.5, 6.5);
    ctx.beginPath();
    ctx.moveTo(m1x, m1y);
    ctx.lineTo(m2x, m2y);
    ctx.stroke();

    // Asymptotes: y = h (horizontal for b^x + h) & x = h (vertical for log_b(x - h))
    const [axX] = toPx(h, 0);
    const [, axY] = toPx(0, h);
    ctx.strokeStyle = 'rgba(52, 232, 165, 0.42)';
    ctx.beginPath();
    ctx.moveTo(axX, 0);
    ctx.lineTo(axX, height);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(244, 185, 86, 0.36)';
    ctx.beginPath();
    ctx.moveTo(0, axY);
    ctx.lineTo(width, axY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Exponential curve y = b^x + h
    ctx.globalCompositeOperation = 'lighter';
    ctx.strokeStyle = '#F4B956';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    let startedExp = false;
    for (let i = 0; i <= 180; i++) {
      const x = -4.8 + (i / 180) * 9.5;
      const y = Math.pow(b, x) + h;
      if (y > 8 || y < -8) {
        startedExp = false;
        continue;
      }
      const [sx, sy] = toPx(x, y);
      if (!startedExp) {
        ctx.moveTo(sx, sy);
        startedExp = true;
      } else {
        ctx.lineTo(sx, sy);
      }
    }
    ctx.stroke();

    // Logarithm curve y = log_b(x - h)
    ctx.strokeStyle = '#34E8A5';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    let startedLog = false;
    const lnB = Math.log(b);
    for (let i = 1; i <= 220; i++) {
      const dx = (i / 220) * 8.2;
      const x = h + dx;
      const y = Math.log(dx) / lnB;
      if (y > 8 || y < -6) {
        startedLog = false;
        continue;
      }
      const [sx, sy] = toPx(x, y);
      if (!startedLog) {
        ctx.moveTo(sx, sy);
        startedLog = true;
      } else {
        ctx.lineTo(sx, sy);
      }
    }
    ctx.stroke();

    // Reflection twin points P(t, b^t + h) and P'(b^t + h, t)
    const expY = Math.pow(b, tVal) + h;
    const [p1x, p1y] = toPx(tVal, expY);
    const [p2x, p2y] = toPx(expY, tVal);

    ctx.globalCompositeOperation = 'source-over';
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = 'rgba(56, 212, 255, 0.72)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(p1x, p1y);
    ctx.lineTo(p2x, p2y);
    ctx.stroke();
    ctx.setLineDash([]);

    const drawDot = (dx: number, dy: number, color: string, label: string, alignLeft = false) => {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(dx, dy, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#05070C';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.font = '600 10px "JetBrains Mono", monospace';
      ctx.fillStyle = color;
      ctx.textAlign = alignLeft ? 'right' : 'left';
      ctx.fillText(label, dx + (alignLeft ? -10 : 10), dy - 6);
    };

    drawDot(p1x, p1y, '#F4B956', `(${tVal.toFixed(2)}, ${expY.toFixed(2)})`, true);
    drawDot(p2x, p2y, '#34E8A5', `(${expY.toFixed(2)}, ${tVal.toFixed(2)})`, false);

    // Non-overlapping subtle corner annotations
    ctx.font = '10px "JetBrains Mono", monospace';
    ctx.textAlign = 'right';
    ctx.fillStyle = 'rgba(52, 232, 165, 0.85)';
    ctx.fillText(`x = ${h.toFixed(1)} asymptote`, axX - 8, 22);
    const [blX, blY] = toPx(-2.6, -2.6);
    ctx.textAlign = 'left';
    ctx.fillStyle = 'rgba(167, 179, 199, 0.85)';
    ctx.fillText('y = x mirror', blX + 8, blY + 12);

    ctx.restore();
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;
    const updateSize = () => {
      const rect = container.getBoundingClientRect();
      const width = Math.max(240, Math.floor(rect.width));
      const height = Math.max(200, Math.floor(rect.height));
      const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      sizeRef.current = { width, height, dpr };
      drawGraph();
    };
    updateSize();
    const ro = new ResizeObserver(updateSize);
    ro.observe(container);
    return () => ro.disconnect();
  }, [drawGraph]);

  useEffect(() => {
    drawGraph();
  }, [base, shiftH, probeT, drawGraph]);

  const activeExpr = LOG_EXPRESSIONS[exprIdx];
  const probeY = Math.pow(base, probeT) + shiftH;

  return (
    <div className="space-y-4">
      {/* PART A: Exponential <-> Logarithm Reflection Manifold */}
      <div className="instrument-frame fiducial-frame overflow-hidden">
        <div className="px-4 py-2.5 border-b hairline-rule bg-[#080C15]/90 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: '#34E8A5', boxShadow: '0 0 10px #34E8A5' }}
            />
            <span className="font-mono-data text-[10px] uppercase tracking-[0.18em] text-[#A7B3C7]">
              Inverse Reflection Manifold · y = x Symmetry
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs font-mono-data">
            <span className="text-[#F4B956]">
              f(x) = {base.toFixed(2)}ˣ{Math.abs(shiftH) < 0.05 ? '' : shiftH > 0 ? ` + ${shiftH.toFixed(1)}` : ` − ${Math.abs(shiftH).toFixed(1)}`}
            </span>
            <span className="text-[#707D94]">↔</span>
            <span className="text-[#34E8A5]">
              f⁻¹(x) = log_{base.toFixed(2)}({Math.abs(shiftH) < 0.05 ? 'x' : shiftH > 0 ? `x − ${shiftH.toFixed(1)}` : `x + ${Math.abs(shiftH).toFixed(1)}`})
            </span>
          </div>
        </div>

        <div ref={containerRef} className={`relative w-full ${heightClass} bg-[#05070C]`}>
          <canvas ref={canvasRef} className="block w-full h-full" />
          <div className="pointer-events-none absolute bottom-3 left-3 obsidian-glass rounded px-3 py-1.5 text-[11px] font-mono-data text-[#A7B3C7]">
            Input ↔ Output Swap: ({probeT.toFixed(2)}, {probeY.toFixed(2)}) ⇄ ({probeY.toFixed(2)},{' '}
            {probeT.toFixed(2)})
          </div>
        </div>

        <div className="px-4 py-3 border-t hairline-rule bg-[#080C15]/95 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <label className="space-y-1">
            <span className="flex justify-between font-mono-data text-[10px] text-[#A7B3C7]">
              <span>Base b</span>
              <span className="text-[#34E8A5]">
                b = {base.toFixed(2)} {Math.abs(base - Math.E) < 0.04 ? '(≈ e)' : ''}
              </span>
            </span>
            <input
              type="range"
              min={1.4}
              max={4.0}
              step={0.05}
              value={base}
              onChange={(e) => setBase(Number(e.target.value))}
              className="meridian-slider"
              style={{ ['--slider-accent' as string]: '#34E8A5' }}
            />
          </label>

          <label className="space-y-1">
            <span className="flex justify-between font-mono-data text-[10px] text-[#A7B3C7]">
              <span>Asymptote Shift h</span>
              <span className="text-[#F4B956]">x &gt; {shiftH.toFixed(1)}</span>
            </span>
            <input
              type="range"
              min={-2.0}
              max={2.0}
              step={0.1}
              value={shiftH}
              onChange={(e) => setShiftH(Number(e.target.value))}
              className="meridian-slider"
              style={{ ['--slider-accent' as string]: '#F4B956' }}
            />
          </label>

          <label className="space-y-1">
            <span className="flex justify-between font-mono-data text-[10px] text-[#A7B3C7]">
              <span>Reflection Probe t</span>
              <span className="text-[#38D4FF]">t = {probeT.toFixed(2)}</span>
            </span>
            <input
              type="range"
              min={-1.5}
              max={2.0}
              step={0.05}
              value={probeT}
              onChange={(e) => setProbeT(Number(e.target.value))}
              className="meridian-slider"
              style={{ ['--slider-accent' as string]: '#38D4FF' }}
            />
          </label>
        </div>
      </div>

      {/* PART B: Animated Spring Logarithm Expander <-> Condenser */}
      <div className="instrument-frame p-4 sm:p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="font-mono-data text-[10px] uppercase tracking-[0.18em] text-[#34E8A5] block">
              Logarithm Laws Morph Engine
            </span>
            <h3 className="font-serif-editorial text-lg text-[#F2F0E8]">
              Animated Expander &amp; Condenser
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {LOG_EXPRESSIONS.map((ex, i) => (
              <button
                key={ex.id}
                type="button"
                onClick={() => setExprIdx(i)}
                className={`px-2.5 py-1 rounded text-[11px] font-mono-data border ${
                  exprIdx === i
                    ? 'bg-[#34E8A5]/15 text-[#34E8A5] border-[#34E8A5]/50'
                    : 'text-[#A7B3C7] border-[rgba(237,235,228,0.14)] hover:text-[#F2F0E8]'
                }`}
              >
                {ex.label}
              </button>
            ))}
          </div>
        </div>

        {/* Stage Switcher */}
        <div className="flex flex-wrap items-center gap-2">
          {(['condensed', 'split', 'expanded'] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStage(s)}
              className={`px-3 py-1.5 rounded text-xs font-medium capitalize border transition-colors ${
                stage === s
                  ? 'bg-[#34E8A5] text-[#05070C] border-[#34E8A5] font-semibold'
                  : 'bg-[#0C111C] text-[#A7B3C7] border-[rgba(237,235,228,0.14)] hover:text-[#F2F0E8]'
              }`}
            >
              {s === 'condensed'
                ? '1. Condensed Single Log'
                : s === 'split'
                  ? '2. Product & Quotient Split'
                  : '3. Full Power Expansion'}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setStage((s) => (s === 'expanded' ? 'condensed' : 'expanded'))}
            className="ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono-data border border-[rgba(237,235,228,0.18)] text-[#F2F0E8] hover:border-[#34E8A5]"
          >
            <ArrowLeftRight className="w-3.5 h-3.5 text-[#34E8A5]" />
            {stage === 'expanded' ? 'Condense All' : 'Expand All'}
          </button>
        </div>

        {/* Animated Stage Display */}
        <div className="instrument-panel p-4 min-h-[132px] flex flex-col justify-center">
          <AnimatePresence mode="popLayout" initial={false}>
            {stage === 'condensed' ? (
              <motion.div
                key={`${activeExpr.id}-condensed`}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.18 }}
                className="text-center space-y-2"
              >
                <div className="inline-block px-5 py-3 rounded bg-[#05070C] border border-[#34E8A5]/45 shadow-[0_0_24px_-8px_rgba(52,232,165,0.4)]">
                  <MathTex tex={activeExpr.condensedTex} displayMode className="text-[#F2F0E8]" />
                </div>
                <p className="text-xs text-[#A7B3C7]">
                  Unified logarithmic expression: multiplication, division, and exponents sit inside one argument.
                </p>
              </motion.div>
            ) : (
              <motion.div
                key={`${activeExpr.id}-${stage}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ type: 'spring', stiffness: 240, damping: 22 }}
                className="space-y-3"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                  {activeExpr.tokens.map((tok) => (
                    <motion.div
                      key={tok.id}
                      layout
                      className="rounded p-3 bg-[#05070C] border border-[rgba(237,235,228,0.14)] space-y-1.5"
                    >
                      <span
                        className="inline-block font-mono-data text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded"
                        style={{
                          backgroundColor:
                            tok.sign === '-' ? 'rgba(255,120,90,0.16)' : 'rgba(52,232,165,0.16)',
                          color: tok.sign === '-' ? '#FF785A' : '#34E8A5',
                        }}
                      >
                        {tok.coef}
                      </span>
                      <div className="text-base text-[#F2F0E8]">
                        <MathTex tex={stage === 'split' ? tok.rawTex : tok.expandedPartTex} />
                      </div>
                      <p className="text-[11px] text-[#707D94] leading-snug">{tok.rule}</p>
                    </motion.div>
                  ))}
                </div>
                <div className="text-center pt-1">
                  <MathTex
                    tex={stage === 'split' ? activeExpr.splitTex : activeExpr.expandedTex}
                    className="text-sm text-[#34E8A5]"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
