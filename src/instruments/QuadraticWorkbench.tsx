import { useMemo, useState } from 'react';
import { MathTex } from '../components/MathTex';
import {
  ParabolaCanvas,
  ParabolaHighlightFeature,
} from '../visuals/parabola/ParabolaCanvas';

type SolverTab = 'formula' | 'complete-square' | 'features';

interface PresetEq {
  label: string;
  a: number;
  b: number;
  c: number;
  note: string;
}

const PRESETS: PresetEq[] = [
  { label: '2x² − 8x + 6', a: 2, b: -8, c: 6, note: '2 integer roots (1, 3)' },
  { label: 'x² − 4x + 4', a: 1, b: -4, c: 4, note: 'Tangent double root (Δ = 0)' },
  { label: 'x² + 2x + 3', a: 1, b: 2, c: 3, note: 'No real roots (Δ < 0)' },
  { label: '−0.5x² + 2x + 2', a: -0.5, b: 2, c: 2, note: 'Downward arch (maxima)' },
];

function fmt(n: number): string {
  const r = Math.round(n * 100) / 100;
  return Object.is(r, -0)
    ? '0'
    : Number.isInteger(r)
      ? `${r}`
      : r.toFixed(2).replace(/\.?0+$/, '');
}

function signed(n: number): string {
  const r = Math.round(n * 100) / 100;
  return r >= 0 ? `+ ${fmt(r)}` : `- ${fmt(Math.abs(r))}`;
}

export function QuadraticWorkbench() {
  const [a, setA] = useState(2);
  const [b, setB] = useState(-8);
  const [c, setC] = useState(6);
  const [tab, setTab] = useState<SolverTab>('formula');
  const [activeFeature, setActiveFeature] = useState<ParabolaHighlightFeature>(null);

  const h = useMemo(() => -b / (2 * a), [a, b]);
  const k = useMemo(() => c - (b * b) / (4 * a), [a, b, c]);
  const disc = useMemo(() => b * b - 4 * a * c, [a, b, c]);

  const handleCanvasDrag = (next: { a: number; h: number; k: number }) => {
    const na = Math.round(next.a * 20) / 20;
    const nb = Math.round(-2 * na * next.h * 20) / 20;
    const nc = Math.round((na * next.h * next.h + next.k) * 20) / 20;
    setA(na);
    setB(nb);
    setC(nc);
  };

  const eqTex = useMemo(() => {
    const aTxt = Math.abs(a - 1) < 1e-4 ? '' : Math.abs(a + 1) < 1e-4 ? '-' : fmt(a);
    const bTxt = Math.abs(b) < 1e-4 ? '' : ` ${signed(b)}x`;
    const cTxt = Math.abs(c) < 1e-4 ? '' : ` ${signed(c)}`;
    return `${aTxt}x^2${bTxt}${cTxt} = 0`;
  }, [a, b, c]);

  const formulaSteps = useMemo(() => {
    const twoA = 2 * a;
    const negB = -b;
    const step4Tex =
      disc > 1e-4
        ? `x_1 = ${fmt((negB - Math.sqrt(disc)) / twoA)}, \\quad x_2 = ${fmt(
            (negB + Math.sqrt(disc)) / twoA
          )}`
        : Math.abs(disc) <= 1e-4
          ? `x = ${fmt(negB / twoA)} \\quad \\text{(repeated root)}`
          : `x = ${fmt(h)} \\pm ${fmt(Math.sqrt(-disc) / Math.abs(twoA))}i \\quad \\text{(complex conjugate pair)}`;

    return [
      {
        title: '1. Identify Coefficients',
        feature: 'curvature' as ParabolaHighlightFeature,
        tex: `a = ${fmt(a)},\\quad b = ${fmt(b)},\\quad c = ${fmt(c)}`,
        note:
          a > 0
            ? 'a > 0 opens upward with a global minimum.'
            : 'a < 0 opens downward with a global maximum.',
      },
      {
        title: '2. Evaluate Discriminant',
        feature: 'roots' as ParabolaHighlightFeature,
        tex: `\\Delta = (${fmt(b)})^2 - 4(${fmt(a)})(${fmt(c)}) = ${fmt(disc)}`,
        note:
          disc > 1e-4
            ? 'Δ > 0 guarantees two distinct real x-intercepts.'
            : Math.abs(disc) <= 1e-4
              ? 'Δ = 0 means the vertex rests tangent to the x-axis.'
              : 'Δ < 0 means the parabola never intersects the real x-axis.',
      },
      {
        title: '3. Substitute into Formula',
        feature: 'axis' as ParabolaHighlightFeature,
        tex: `x = \\frac{-(${fmt(b)}) \\pm \\sqrt{${fmt(disc)}}}{2(${fmt(a)})} = \\frac{${fmt(negB)} \\pm \\sqrt{${fmt(disc)}}}{${fmt(twoA)}}`,
        note: `Notice the symmetry axis x = ${fmt(negB)}/${fmt(twoA)} = ${fmt(h)} sits centered between both roots.`,
      },
      {
        title: '4. Solution Set',
        feature: 'roots' as ParabolaHighlightFeature,
        tex: step4Tex,
        note:
          disc >= -1e-4
            ? 'Verified visually as emerald points along y = 0.'
            : 'Over ℝ there are no real solutions (Algebra 2 extends this to ℂ).',
      },
    ];
  }, [a, b, c, disc, h]);

  const squareSteps = useMemo(() => {
    const halfBOverA = b / (2 * a);
    const halfSq = halfBOverA * halfBOverA;
    const innerH = h >= 0 ? `(x - ${fmt(h)})^2` : `(x + ${fmt(Math.abs(h))})^2`;
    const rhs = -k / a;

    return [
      {
        title: '1. Factor Leading Coefficient',
        feature: 'curvature' as ParabolaHighlightFeature,
        tex: `${fmt(a)}\\left(x^2 ${signed(b / a)}x\\right) ${signed(c)} = 0`,
        note: 'Factoring out a ensures the quadratic term inside parentheses has coefficient 1.',
      },
      {
        title: '2. Complete the Square Inside',
        feature: 'axis' as ParabolaHighlightFeature,
        tex: `${fmt(a)}\\left(x^2 ${signed(b / a)}x + ${fmt(halfSq)}\\right) ${signed(c)} - ${fmt(
          a * halfSq
        )} = 0`,
        note: `Add (${fmt(b / a)} / 2)² = ${fmt(halfSq)} inside, and subtract a·${fmt(halfSq)} outside to keep balance.`,
      },
      {
        title: '3. Collapse to Vertex Form',
        feature: 'vertex' as ParabolaHighlightFeature,
        tex: `${fmt(a)}${innerH} ${signed(k)} = 0`,
        note: `Immediately reveals vertex V(${fmt(h)}, ${fmt(k)}).`,
      },
      {
        title: '4. Isolate Squared Binomial',
        feature: 'roots' as ParabolaHighlightFeature,
        tex: `${innerH} = ${fmt(rhs)}`,
        note:
          rhs >= 0
            ? `Taking square roots yields x = ${fmt(h)} ± ${fmt(Math.sqrt(rhs))}.`
            : `Since ${fmt(rhs)} < 0, no real number squared equals a negative value.`,
      },
    ];
  }, [a, b, c, h, k]);

  const featureRows = useMemo(() => {
    const extLabel = a > 0 ? 'Minimum' : 'Maximum';
    const rangeInterval = a > 0 ? `[${fmt(k)}, \\infty)` : `(-\\infty, ${fmt(k)}]`;
    const rangeIneq = a > 0 ? `y \\ge ${fmt(k)}` : `y \\le ${fmt(k)}`;
    const incDec =
      a > 0
        ? `\\text{Dec: } (-\\infty, ${fmt(h)}),\\; \\text{Inc: } (${fmt(h)}, \\infty)`
        : `\\text{Inc: } (-\\infty, ${fmt(h)}),\\; \\text{Dec: } (${fmt(h)}, \\infty)`;

    return [
      {
        label: `Vertex (${extLabel})`,
        feature: 'vertex' as ParabolaHighlightFeature,
        tex: `(${fmt(h)},\\, ${fmt(k)})`,
      },
      {
        label: 'Axis of Symmetry',
        feature: 'axis' as ParabolaHighlightFeature,
        tex: `x = ${fmt(h)}`,
      },
      {
        label: 'Y-Intercept',
        feature: 'yIntercept' as ParabolaHighlightFeature,
        tex: `(0,\\, ${fmt(c)})`,
      },
      {
        label: 'Domain (All Real)',
        feature: null as ParabolaHighlightFeature,
        tex: `(-\\infty,\\, \\infty)`,
      },
      {
        label: 'Range (Interval & Ineq.)',
        feature: 'vertex' as ParabolaHighlightFeature,
        tex: `${rangeInterval} \\;\\equiv\\; ${rangeIneq}`,
      },
      {
        label: 'Monotonicity',
        feature: 'axis' as ParabolaHighlightFeature,
        tex: incDec,
      },
    ];
  }, [a, c, h, k]);

  const activeSteps = tab === 'formula' ? formulaSteps : squareSteps;

  return (
    <div className="instrument-frame p-5 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b hairline-rule">
        <div>
          <span className="font-mono-data text-[11px] uppercase tracking-wider text-[#E5A94C]">
            Integrated Instrument · Algebra 1
          </span>
          <h3 className="font-serif-editorial text-2xl text-[#EDEBE4]">
            Quadratic Solver &amp; Feature Workbench
          </h3>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {PRESETS.map((p) => (
            <button
              key={p.label}
              type="button"
              onClick={() => {
                setA(p.a);
                setB(p.b);
                setC(p.c);
              }}
              title={p.note}
              className="px-2.5 py-1 rounded text-xs font-mono-data bg-[#0D121A] border border-[rgba(237,235,228,0.14)] text-[#9CA6B8] hover:text-[#EDEBE4] hover:border-[#E5A94C]/60 transition-colors"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Controls Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded bg-[#0D121A] border border-[rgba(237,235,228,0.08)]">
        <label className="space-y-1.5 text-xs">
          <div className="flex justify-between font-mono-data">
            <span className="text-[#E5A94C]">a (Leading)</span>
            <span>{fmt(a)}</span>
          </div>
          <input
            type="range"
            min={-3}
            max={3}
            step={0.25}
            value={a}
            onChange={(e) => {
              const v = parseFloat(e.target.value);
              setA(Math.abs(v) < 0.25 ? (v >= 0 ? 0.25 : -0.25) : v);
            }}
            className="meridian-slider"
            style={{ ['--slider-accent' as string]: '#E5A94C' }}
          />
        </label>
        <label className="space-y-1.5 text-xs">
          <div className="flex justify-between font-mono-data">
            <span className="text-[#38BDF8]">b (Linear)</span>
            <span>{fmt(b)}</span>
          </div>
          <input
            type="range"
            min={-12}
            max={12}
            step={0.5}
            value={b}
            onChange={(e) => setB(parseFloat(e.target.value))}
            className="meridian-slider"
            style={{ ['--slider-accent' as string]: '#38BDF8' }}
          />
        </label>
        <label className="space-y-1.5 text-xs">
          <div className="flex justify-between font-mono-data">
            <span className="text-[#F9735B]">c (Constant / y-int)</span>
            <span>{fmt(c)}</span>
          </div>
          <input
            type="range"
            min={-8}
            max={8}
            step={0.5}
            value={c}
            onChange={(e) => setC(parseFloat(e.target.value))}
            className="meridian-slider"
            style={{ ['--slider-accent' as string]: '#F9735B' }}
          />
        </label>
      </div>

      {/* Synchronized Split: Derivation Engine + Live Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        <div className="lg:col-span-5 space-y-3">
          <div className="p-3 rounded bg-[#0D121A] border border-[rgba(237,235,228,0.1)] flex items-center justify-between gap-2">
            <span className="font-mono-data text-[10px] uppercase tracking-wider text-[#6C7689]">
              Target Eq.
            </span>
            <MathTex tex={eqTex} className="text-sm text-[#EDEBE4]" />
          </div>

          <div className="grid grid-cols-3 gap-1 p-1 rounded bg-[#0D121A] border border-[rgba(237,235,228,0.1)]">
            {[
              { id: 'formula', label: 'Formula' },
              { id: 'complete-square', label: 'Complete Sq.' },
              { id: 'features', label: 'Key Features' },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id as SolverTab)}
                className={`py-1.5 px-2 rounded text-xs font-medium transition-colors ${
                  tab === t.id
                    ? 'bg-[#E5A94C]/18 text-[#E5A94C] border border-[#E5A94C]/40'
                    : 'text-[#9CA6B8] hover:text-[#EDEBE4]'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {tab !== 'features' ? (
            <div className="space-y-2.5">
              {activeSteps.map((st, idx) => (
                <div
                  key={idx}
                  onMouseEnter={() => setActiveFeature(st.feature)}
                  onMouseLeave={() => setActiveFeature(null)}
                  onClick={() =>
                    setActiveFeature((curr) => (curr === st.feature ? null : st.feature))
                  }
                  className="p-3.5 rounded bg-[#0D121A] border border-[rgba(237,235,228,0.1)] hover:border-[#E5A94C]/50 cursor-pointer transition-colors space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono-data text-[11px] text-[#E5A94C]">{st.title}</span>
                    <span className="font-mono-data text-[10px] text-[#6C7689]">
                      hover to sync graph
                    </span>
                  </div>
                  <MathTex tex={st.tex} displayMode className="text-sm text-[#EDEBE4]" />
                  <p className="text-xs text-[#9CA6B8] leading-snug">{st.note}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {featureRows.map((row) => (
                <div
                  key={row.label}
                  onMouseEnter={() => setActiveFeature(row.feature)}
                  onMouseLeave={() => setActiveFeature(null)}
                  className="p-3 rounded bg-[#0D121A] border border-[rgba(237,235,228,0.1)] hover:border-[#E5A94C]/50 flex flex-wrap items-center justify-between gap-2 transition-colors"
                >
                  <span className="text-xs font-medium text-[#9CA6B8]">{row.label}</span>
                  <MathTex tex={row.tex} className="text-xs sm:text-sm text-[#EDEBE4]" />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="lg:col-span-7">
          <ParabolaCanvas
            a={a}
            h={h}
            k={k}
            onChange={handleCanvasDrag}
            highlightFeature={activeFeature}
            heightClass="h-[380px] sm:h-[430px]"
          />
        </div>
      </div>
    </div>
  );
}
