import { createContext, useContext, useId, useMemo, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { RotateCcw } from 'lucide-react';

const VisualAnimContext = createContext<boolean>(true);

export type EquationVisualKind =
  // Algebra 1
  | 'area-factor'
  | 'diff-squares'
  | 'perfect-square'
  | 'slope-triangle'
  | 'slope-intercept'
  | 'point-slope'
  | 'exponent-product'
  | 'rational-exponent'
  | 'radical-curve'
  | 'line-intersection'
  | 'linear-pencil'
  | 'parallel-lines'
  | 'half-plane'
  | 'feasible-wedge'
  | 'boundary-dashed'
  | 'abs-v-shift'
  | 'abs-distance'
  | 'piecewise-step'
  | 'exp-growth'
  | 'exp-decay'
  | 'exp-asymptote'
  | 'parabola-vertex'
  | 'parabola-discriminant'
  | 'parabola-standard'
  | 'scatter-regression'
  | 'residual-squares'
  | 'correlation-r'
  // Geometry
  | 'transversal-alt'
  | 'transversal-corr'
  | 'linear-pair'
  | 'triangle-congruence'
  | 'rigid-motion'
  | 'triangle-sum'
  | 'similar-triangles'
  | 'area-scale-k2'
  | 'side-splitter'
  | 'reflection-axis'
  | 'rotation-arc'
  | 'dilation-rays'
  | 'polygon-angles'
  | 'quad-diagonals'
  | 'quad-hierarchy'
  | 'pythagoras-squares'
  | 'right-trig-ratios'
  | 'special-triangle'
  | 'distance-norm'
  | 'midpoint-bisector'
  | 'perp-slopes'
  | 'inscribed-angle'
  | 'circle-sector'
  | 'chord-tangent'
  | 'prism-net'
  | 'pyramid-slant'
  | 'cylinder-unroll'
  // Algebra 2
  | 'argand-vector'
  | 'complex-conjugate'
  | 'euler-circle'
  | 'nonlinear-2roots'
  | 'nonlinear-tangent'
  | 'quad-ineq-region'
  | 'composition-pipe'
  | 'inverse-mirror'
  | 'radical-extraneous'
  | 'log-reflection'
  | 'log-product'
  | 'log-quotient'
  | 'log-power'
  | 'poly-multiplicity'
  | 'poly-end-behavior'
  | 'factor-root'
  | 'matrix-warp'
  | 'neural-layer'
  | 'activation-relu'
  | 'pascal-binomial'
  | 'comb-vs-perm'
  | 'binomial-bars'
  | 'rational-pole'
  | 'rational-hole'
  | 'horizontal-asym'
  | 'normal-bell'
  | 'z-score-band'
  | 'expected-value'
  // Precalculus
  | 'unit-circle-proj'
  | 'sinusoid-wave'
  | 'trig-pythag-id'
  | 'trig-double-angle'
  | 'trig-sum-phase'
  | 'vector-parallelogram'
  | 'dot-product-angle'
  | 'matrix-det-area'
  | 'law-sines-circle'
  | 'law-cosines-tri'
  | 'oblique-area'
  | 'parametric-lissajous'
  | 'parametric-velocity'
  | 'projectile-arc'
  | 'polar-rose'
  | 'polar-coords'
  | 'polar-spiral'
  | 'ellipse-foci'
  | 'hyperbola-asym'
  | 'conic-eccentricity'
  | 'series-staircase'
  | 'series-square-split'
  | 'series-diverge'
  | 'secant-to-tangent'
  | 'limit-approach'
  | 'continuity-hole';

const W = 280;
const H = 132;

function plotPath(
  fn: (x: number) => number | null,
  xMin: number,
  xMax: number,
  yMin: number,
  yMax: number,
  steps = 80
): string {
  const parts: string[] = [];
  let penDown = false;
  for (let i = 0; i <= steps; i++) {
    const x = xMin + (i / steps) * (xMax - xMin);
    const y = fn(x);
    if (y === null || !Number.isFinite(y) || y < yMin - 1.5 || y > yMax + 1.5) {
      penDown = false;
      continue;
    }
    const sx = 18 + ((x - xMin) / (xMax - xMin)) * (W - 36);
    const sy = H - 14 - ((y - yMin) / (yMax - yMin)) * (H - 28);
    parts.push(`${penDown ? 'L' : 'M'}${sx.toFixed(1)},${sy.toFixed(1)}`);
    penDown = true;
  }
  return parts.join(' ');
}

function mapPt(
  x: number,
  y: number,
  xMin: number,
  xMax: number,
  yMin: number,
  yMax: number
): [number, number] {
  return [
    18 + ((x - xMin) / (xMax - xMin)) * (W - 36),
    H - 14 - ((y - yMin) / (yMax - yMin)) * (H - 28),
  ];
}

function GlowCurve({
  d,
  color,
  width = 2.1,
  dashed = false,
}: {
  d: string;
  color: string;
  width?: number;
  dashed?: boolean;
}) {
  const animated = useContext(VisualAnimContext);

  if (!animated) {
    return (
      <>
        <path
          d={d}
          fill="none"
          stroke={color}
          strokeWidth={width + 4.5}
          strokeOpacity={0.18}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d={d}
          fill="none"
          stroke={color}
          strokeWidth={width}
          strokeDasharray={dashed ? '5 4' : undefined}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </>
    );
  }

  if (dashed) {
    return (
      <>
        <motion.path
          d={d}
          fill="none"
          stroke={color}
          strokeWidth={width + 4.5}
          strokeOpacity={0.18}
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        />
        <motion.path
          d={d}
          fill="none"
          stroke={color}
          strokeWidth={width}
          strokeDasharray="5 4"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ opacity: 0, strokeDashoffset: 28 }}
          animate={{ opacity: 1, strokeDashoffset: 0 }}
          transition={{ duration: 0.72, ease: [0.22, 1, 0.36, 1] }}
        />
      </>
    );
  }

  return (
    <>
      <motion.path
        d={d}
        pathLength={1}
        strokeDasharray="1"
        fill="none"
        stroke={color}
        strokeWidth={width + 4.5}
        strokeOpacity={0.18}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ strokeDashoffset: 1, opacity: 0.25 }}
        animate={{ strokeDashoffset: 0, opacity: 1 }}
        transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
      />
      <motion.path
        d={d}
        pathLength={1}
        strokeDasharray="1"
        fill="none"
        stroke={color}
        strokeWidth={width}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ strokeDashoffset: 1, opacity: 0.25 }}
        animate={{ strokeDashoffset: 0, opacity: 1 }}
        transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
      />
    </>
  );
}

function Axes({ xMin, xMax, yMin, yMax }: { xMin: number; xMax: number; yMin: number; yMax: number }) {
  const [zx, zy] = mapPt(0, 0, xMin, xMax, yMin, yMax);
  return (
    <g>
      {zx >= 16 && zx <= W - 16 && (
        <line x1={zx} y1={10} x2={zx} y2={H - 10} stroke="rgba(255,255,255,0.18)" strokeWidth={1} />
      )}
      {zy >= 10 && zy <= H - 10 && (
        <line x1={14} y1={zy} x2={W - 14} y2={zy} stroke="rgba(255,255,255,0.18)" strokeWidth={1} />
      )}
    </g>
  );
}

function Dot({ x, y, color, r = 3.6 }: { x: number; y: number; color: string; r?: number }) {
  const animated = useContext(VisualAnimContext);

  if (!animated) {
    return (
      <g>
        <circle cx={x} cy={y} r={r + 4} fill={color} fillOpacity={0.22} />
        <circle cx={x} cy={y} r={r} fill={color} stroke="#060A13" strokeWidth={1.2} />
      </g>
    );
  }

  return (
    <motion.g
      initial={{ opacity: 0, scale: 0.4 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 320, damping: 22, delay: 0.38 }}
      style={{ transformOrigin: `${x}px ${y}px` }}
    >
      <circle cx={x} cy={y} r={r + 4} fill={color} fillOpacity={0.22} />
      <circle cx={x} cy={y} r={r} fill={color} stroke="#060A13" strokeWidth={1.2} />
    </motion.g>
  );
}

interface EquationMiniVisualProps {
  kind: EquationVisualKind;
  accent?: string;
  heightClass?: string;
  caption?: string;
  replayKey?: string | number;
  animated?: boolean;
  showReplay?: boolean;
}

export function EquationMiniVisual({
  kind,
  accent = '#F5BC5E',
  heightClass = 'h-[126px]',
  caption,
  replayKey,
  animated = true,
  showReplay = false,
}: EquationMiniVisualProps) {
  const uid = useId().replace(/:/g, '');
  const gridId = `grid-${kind}-${uid}`;
  const reducedMotion = useReducedMotion();
  const [localReplay, setLocalReplay] = useState(0);
  const shouldAnimate = animated && !reducedMotion;
  const content = useMemo(() => {
    const cyan = '#38D9FF';
    const gold = '#F5BC5E';
    const emerald = '#36EBA8';
    const coral = '#FF7A5C';
    const ink = '#F4F3EE';

    switch (kind) {
      case 'area-factor':
        return (
          <g>
            <rect x={68} y={24} width={76} height={52} fill={`${gold}28`} stroke={gold} strokeWidth={1.6} />
            <rect x={144} y={24} width={64} height={52} fill={`${cyan}22`} stroke={cyan} strokeWidth={1.4} />
            <rect x={68} y={76} width={76} height={36} fill={`${emerald}22`} stroke={emerald} strokeWidth={1.4} />
            <rect x={144} y={76} width={64} height={36} fill={`${coral}26`} stroke={coral} strokeWidth={1.4} />
            <text x={106} y={54} fill={gold} fontSize={11} textAnchor="middle" fontFamily="JetBrains Mono">x²</text>
            <text x={176} y={54} fill={cyan} fontSize={10.5} textAnchor="middle" fontFamily="JetBrains Mono">p·x</text>
            <text x={106} y={98} fill={emerald} fontSize={10.5} textAnchor="middle" fontFamily="JetBrains Mono">q·x</text>
            <text x={176} y={98} fill={coral} fontSize={10.5} textAnchor="middle" fontFamily="JetBrains Mono">p·q</text>
            <text x={106} y={17} fill={ink} fontSize={9.5} textAnchor="middle" fontFamily="JetBrains Mono">x</text>
            <text x={176} y={17} fill={cyan} fontSize={9.5} textAnchor="middle" fontFamily="JetBrains Mono">+ p</text>
            <text x={55} y={54} fill={ink} fontSize={9.5} textAnchor="end" fontFamily="JetBrains Mono">x</text>
            <text x={55} y={98} fill={emerald} fontSize={9.5} textAnchor="end" fontFamily="JetBrains Mono">+q</text>
          </g>
        );

      case 'diff-squares':
        return (
          <g>
            <rect x={44} y={22} width={82} height={82} fill={`${gold}22`} stroke={gold} strokeWidth={1.6} />
            <rect x={96} y={22} width={30} height={30} fill="#060A13" stroke={coral} strokeWidth={1.4} strokeDasharray="3 2" />
            <text x={72} y={78} fill={gold} fontSize={10.5} fontFamily="JetBrains Mono">a²−b²</text>
            <text x={111} y={40} fill={coral} fontSize={9} textAnchor="middle" fontFamily="JetBrains Mono">−b²</text>
            <path d="M138,63 L156,63" stroke={ink} strokeWidth={1.4} />
            <polygon points="156,59 163,63 156,67" fill={ink} />
            <rect x={172} y={38} width={84} height={50} fill={`${cyan}24`} stroke={cyan} strokeWidth={1.6} />
            <text x={214} y={32} fill={cyan} fontSize={9.5} textAnchor="middle" fontFamily="JetBrains Mono">a + b</text>
            <text x={214} y={67} fill={ink} fontSize={10} textAnchor="middle" fontFamily="JetBrains Mono">(a−b)(a+b)</text>
          </g>
        );

      case 'perfect-square':
        return (
          <g>
            <rect x={82} y={20} width={58} height={58} fill={`${gold}26`} stroke={gold} strokeWidth={1.6} />
            <rect x={140} y={20} width={36} height={58} fill={`${cyan}22`} stroke={cyan} strokeWidth={1.4} />
            <rect x={82} y={78} width={58} height={36} fill={`${cyan}22`} stroke={cyan} strokeWidth={1.4} />
            <rect x={140} y={78} width={36} height={36} fill={`${emerald}28`} stroke={emerald} strokeWidth={1.4} />
            <text x={111} y={53} fill={gold} fontSize={11} textAnchor="middle" fontFamily="JetBrains Mono">x²</text>
            <text x={158} y={53} fill={cyan} fontSize={9.5} textAnchor="middle" fontFamily="JetBrains Mono">px</text>
            <text x={111} y={100} fill={cyan} fontSize={9.5} textAnchor="middle" fontFamily="JetBrains Mono">px</text>
            <text x={158} y={100} fill={emerald} fontSize={9.5} textAnchor="middle" fontFamily="JetBrains Mono">p²</text>
            <text x={218} y={66} fill={cyan} fontSize={9.5} fontFamily="JetBrains Mono">2 wings = 2px</text>
          </g>
        );

      case 'slope-triangle':
      case 'slope-intercept':
      case 'point-slope': {
        const d = plotPath((x) => 0.7 * x + 0.5, -3, 4, -2, 4);
        const [x1, y1] = mapPt(0, 0.5, -3, 4, -2, 4);
        const [x2, y2] = mapPt(2.5, 2.25, -3, 4, -2, 4);
        return (
          <g>
            <Axes xMin={-3} xMax={4} yMin={-2} yMax={4} />
            <GlowCurve d={d} color={accent} />
            {kind === 'slope-triangle' && (
              <>
                <line x1={x1} y1={y1} x2={x2} y2={y1} stroke={cyan} strokeWidth={1.5} strokeDasharray="3 2" />
                <line x1={x2} y1={y1} x2={x2} y2={y2} stroke={emerald} strokeWidth={1.6} />
                <text x={(x1 + x2) / 2} y={y1 + 13} fill={cyan} fontSize={9.5} textAnchor="middle" fontFamily="JetBrains Mono">Δx</text>
                <text x={x2 + 12} y={(y1 + y2) / 2 + 3} fill={emerald} fontSize={9.5} fontFamily="JetBrains Mono">Δy</text>
              </>
            )}
            <Dot x={x1} y={y1} color={kind === 'slope-intercept' ? coral : cyan} />
            <Dot x={x2} y={y2} color={accent} />
            <text x={x1 - 8} y={y1 - 8} fill={coral} fontSize={9} textAnchor="end" fontFamily="JetBrains Mono">
              {kind === 'slope-intercept' ? '(0, b)' : kind === 'point-slope' ? '(x₀, y₀)' : 'P₁'}
            </text>
          </g>
        );
      }

      case 'exponent-product':
      case 'rational-exponent':
        return (
          <g>
            <rect x={28} y={32} width={70} height={36} rx={8} fill={`${gold}1C`} stroke={gold} strokeWidth={1.4} />
            <text x={63} y={54} fill={gold} fontSize={12} textAnchor="middle" fontFamily="JetBrains Mono">
              {kind === 'exponent-product' ? 'aᵐ · aⁿ' : 'x^(m/n)'}
            </text>
            <path d="M106,50 L146,50" stroke={cyan} strokeWidth={1.8} />
            <polygon points="146,46 154,50 146,54" fill={cyan} />
            <rect x={162} y={32} width={90} height={36} rx={8} fill={`${emerald}1C`} stroke={emerald} strokeWidth={1.5} />
            <text x={207} y={54} fill={emerald} fontSize={12} textAnchor="middle" fontFamily="JetBrains Mono">
              {kind === 'exponent-product' ? 'a^(m+n)' : 'ⁿ√(xᵐ)'}
            </text>
            <text x={140} y={96} fill="#A5B4CC" fontSize={9.5} textAnchor="middle" fontFamily="JetBrains Mono">
              {kind === 'exponent-product'
                ? 'Multiplication of bases → Addition of exponents'
                : 'Numerator m = power · Denominator n = root index'}
            </text>
          </g>
        );

      case 'radical-curve': {
        const d = plotPath((x) => (x >= -1 ? 1.5 * Math.sqrt(x + 1) : null), -3, 6, -1, 4.5);
        const [hx, hy] = mapPt(-1, 0, -3, 6, -1, 4.5);
        return (
          <g>
            <Axes xMin={-3} xMax={6} yMin={-1} yMax={4.5} />
            <rect x={18} y={12} width={hx - 18} height={H - 24} fill={`${coral}14`} />
            <line x1={hx} y1={12} x2={hx} y2={H - 12} stroke={coral} strokeDasharray="3 3" strokeWidth={1.2} />
            <GlowCurve d={d} color={accent} />
            <Dot x={hx} y={hy} color={emerald} />
            <text x={hx + 8} y={hy - 8} fill={emerald} fontSize={9} fontFamily="JetBrains Mono">Domain x ≥ h</text>
          </g>
        );
      }

      case 'line-intersection':
      case 'linear-pencil':
      case 'parallel-lines': {
        const l1 = plotPath((x) => 0.65 * x + 0.6, -3, 4, -2, 4);
        const l2 = plotPath(
          (x) => (kind === 'parallel-lines' ? 0.65 * x - 1.1 : -0.85 * x + 2.4),
          -3,
          4,
          -2,
          4
        );
        const l3 = plotPath((x) => 0.05 * x + 1.32, -3, 4, -2, 4);
        const [ix, iy] = mapPt(1.2, 1.38, -3, 4, -2, 4);
        return (
          <g>
            <Axes xMin={-3} xMax={4} yMin={-2} yMax={4} />
            <GlowCurve d={l1} color={gold} />
            <GlowCurve d={l2} color={cyan} />
            {kind === 'linear-pencil' && <GlowCurve d={l3} color={emerald} width={1.5} dashed />}
            {kind !== 'parallel-lines' ? (
              <>
                <Dot x={ix} y={iy} color={coral} r={4.2} />
                <text x={ix + 9} y={iy - 6} fill={ink} fontSize={9.5} fontFamily="JetBrains Mono">(x*, y*)</text>
              </>
            ) : (
              <text x={152} y={96} fill={coral} fontSize={9.5} fontFamily="JetBrains Mono">m₁ = m₂ · No Crossing (∅)</text>
            )}
          </g>
        );
      }

      case 'half-plane':
      case 'feasible-wedge':
      case 'boundary-dashed': {
        const [ax, ay] = mapPt(-3, -0.5, -3, 4, -2, 4);
        const [bx, by] = mapPt(4, 3.0, -3, 4, -2, 4);
        const [cx, cy] = mapPt(-3, 3.5, -3, 4, -2, 4);
        const [dx, dy] = mapPt(4, 0.2, -3, 4, -2, 4);
        const [ix, iy] = mapPt(1.12, 1.56, -3, 4, -2, 4);
        return (
          <g>
            <Axes xMin={-3} xMax={4} yMin={-2} yMax={4} />
            {kind === 'feasible-wedge' ? (
              <polygon points={`${ax},${ay} ${ix},${iy} ${cx},${cy}`} fill={`${emerald}2A`} />
            ) : (
              <polygon points={`${ax},${ay} ${bx},${by} ${bx},12 ${ax},12`} fill={`${gold}24`} />
            )}
            <GlowCurve d={`M${ax},${ay} L${bx},${by}`} color={gold} dashed={kind === 'boundary-dashed'} />
            {kind === 'feasible-wedge' && <GlowCurve d={`M${cx},${cy} L${dx},${dy}`} color={cyan} dashed />}
            <Dot x={96} y={48} color={emerald} />
            <text x={106} y={51} fill={emerald} fontSize={9} fontFamily="JetBrains Mono">Feasible ✓</text>
          </g>
        );
      }

      case 'abs-v-shift':
      case 'abs-distance': {
        const d = plotPath((x) => 1.15 * Math.abs(x - 1) - 0.6, -3, 5, -2, 4);
        const [vx, vy] = mapPt(1, -0.6, -3, 5, -2, 4);
        return (
          <g>
            <Axes xMin={-3} xMax={5} yMin={-2} yMax={4} />
            <line x1={vx} y1={14} x2={vx} y2={H - 14} stroke={`${cyan}66`} strokeDasharray="3 3" />
            <GlowCurve d={d} color={accent} />
            <Dot x={vx} y={vy} color={coral} />
            <text x={vx + 8} y={vy + 4} fill={ink} fontSize={9.5} fontFamily="JetBrains Mono">V(h, k)</text>
          </g>
        );
      }

      case 'piecewise-step': {
        const p1 = plotPath((x) => (x < 0 ? 0.6 * x + 1.5 : null), -3, 4, -2, 4);
        const p2 = plotPath((x) => (x >= 0 ? 0.35 * x * x - 0.8 : null), -3, 4, -2, 4);
        const [ox, oy] = mapPt(0, 1.5, -3, 4, -2, 4);
        const [cx, cy] = mapPt(0, -0.8, -3, 4, -2, 4);
        return (
          <g>
            <Axes xMin={-3} xMax={4} yMin={-2} yMax={4} />
            <GlowCurve d={p1} color={gold} />
            <GlowCurve d={p2} color={cyan} />
            <circle cx={ox} cy={oy} r={4} fill="#060A13" stroke={gold} strokeWidth={1.8} />
            <Dot x={cx} y={cy} color={cyan} />
            <text x={cx + 9} y={cy + 3} fill={cyan} fontSize={9} fontFamily="JetBrains Mono">x ≥ 0</text>
          </g>
        );
      }

      case 'exp-growth':
      case 'exp-decay':
      case 'exp-asymptote': {
        const d = plotPath(
          (x) => (kind === 'exp-decay' ? 2.8 * Math.pow(0.55, x) : 0.7 * Math.pow(1.65, x)),
          -3,
          3.5,
          -0.6,
          4.5
        );
        const [ay0x, ay0y] = mapPt(0, 0, -3, 3.5, -0.6, 4.5);
        const [y0x, y0y] = mapPt(0, kind === 'exp-decay' ? 2.8 : 0.7, -3, 3.5, -0.6, 4.5);
        return (
          <g>
            <Axes xMin={-3} xMax={3.5} yMin={-0.6} yMax={4.5} />
            <line x1={18} y1={ay0y} x2={W - 18} y2={ay0y} stroke={coral} strokeDasharray="4 3" strokeWidth={1.2} />
            <GlowCurve d={d} color={accent} />
            <Dot x={y0x} y={y0y} color={emerald} />
            <text x={ay0x + 42} y={ay0y - 5} fill={coral} fontSize={8.5} fontFamily="JetBrains Mono">y = 0 asymptote</text>
          </g>
        );
      }

      case 'parabola-vertex':
      case 'parabola-standard':
      case 'parabola-discriminant': {
        const d1 = plotPath((x) => 0.45 * (x - 0.8) ** 2 - 1.3, -3.5, 4.5, -2.5, 4.5);
        const d2 = plotPath((x) => 0.45 * (x - 0.8) ** 2, -3.5, 4.5, -2.5, 4.5);
        const d3 = plotPath((x) => 0.45 * (x - 0.8) ** 2 + 1.4, -3.5, 4.5, -2.5, 4.5);
        const [vx, vy] = mapPt(0.8, -1.3, -3.5, 4.5, -2.5, 4.5);
        return (
          <g>
            <Axes xMin={-3.5} xMax={4.5} yMin={-2.5} yMax={4.5} />
            {kind === 'parabola-discriminant' ? (
              <>
                <GlowCurve d={d1} color={emerald} width={1.8} />
                <GlowCurve d={d2} color={gold} width={1.8} />
                <GlowCurve d={d3} color={coral} width={1.8} />
                <text x={204} y={28} fill={coral} fontSize={8.5} fontFamily="JetBrains Mono">Δ &lt; 0</text>
                <text x={204} y={56} fill={gold} fontSize={8.5} fontFamily="JetBrains Mono">Δ = 0</text>
                <text x={204} y={88} fill={emerald} fontSize={8.5} fontFamily="JetBrains Mono">Δ &gt; 0</text>
              </>
            ) : (
              <>
                <line x1={vx} y1={14} x2={vx} y2={H - 14} stroke={`${cyan}66`} strokeDasharray="3 3" />
                <GlowCurve d={d1} color={accent} />
                <Dot x={vx} y={vy} color={coral} />
                <text x={vx + 8} y={vy + 4} fill={ink} fontSize={9.5} fontFamily="JetBrains Mono">V(h, k)</text>
              </>
            )}
          </g>
        );
      }

      case 'scatter-regression':
      case 'residual-squares':
      case 'correlation-r': {
        const pts: [number, number][] =
          kind === 'residual-squares'
            ? [
                [-2.2, -1.6],
                [-1.1, 0.7],
                [-0.2, -0.4],
                [0.8, 2.1],
                [1.8, 0.9],
                [2.8, 3.2],
              ]
            : [
                [-2.2, -1.0],
                [-1.3, -0.15],
                [-0.4, 0.3],
                [0.5, 1.2],
                [1.4, 1.6],
                [2.3, 2.45],
                [3.1, 2.85],
              ];
        const line = plotPath((x) => 0.72 * x + 0.62, -3, 4, -2, 4);
        const upperEnv = plotPath((x) => 0.72 * x + 1.15, -3, 4, -2, 4);
        const lowerEnv = plotPath((x) => 0.72 * x + 0.08, -3, 4, -2, 4);
        return (
          <g>
            <Axes xMin={-3} xMax={4} yMin={-2} yMax={4} />
            {kind === 'correlation-r' && (
              <>
                <GlowCurve d={upperEnv} color={`${emerald}88`} width={1} dashed />
                <GlowCurve d={lowerEnv} color={`${emerald}88`} width={1} dashed />
              </>
            )}
            <GlowCurve d={line} color={gold} />
            {pts.map(([px, py], i) => {
              const [sx, sy] = mapPt(px, py, -3, 4, -2, 4);
              const [, ly] = mapPt(px, 0.72 * px + 0.62, -3, 4, -2, 4);
              const e = Math.abs(sy - ly);
              return (
                <g key={i}>
                  {kind === 'residual-squares' && e > 2 && (
                    <rect
                      x={sx}
                      y={Math.min(sy, ly)}
                      width={e}
                      height={e}
                      fill={`${coral}30`}
                      stroke={coral}
                      strokeWidth={1.3}
                    />
                  )}
                  <line x1={sx} y1={sy} x2={sx} y2={ly} stroke={coral} strokeWidth={1.3} strokeDasharray="2 2" />
                  <Dot x={sx} y={sy} color={cyan} r={3} />
                </g>
              );
            })}
            <text x={24} y={24} fill={kind === 'residual-squares' ? coral : emerald} fontSize={9.5} fontFamily="JetBrains Mono">
              {kind === 'residual-squares'
                ? 'Minimize Σ eᵢ² (area)'
                : kind === 'correlation-r'
                  ? 'r = +0.97 · R² = 0.94'
                  : 'Trend ŷ = mx + b'}
            </text>
          </g>
        );
      }

      case 'transversal-alt':
      case 'transversal-corr':
      case 'linear-pair':
        return (
          <g>
            <line x1={26} y1={42} x2={254} y2={42} stroke={cyan} strokeWidth={1.8} />
            <line x1={26} y1={92} x2={254} y2={92} stroke={cyan} strokeWidth={1.8} />
            <line x1={96} y1={14} x2={186} y2={118} stroke={gold} strokeWidth={2} />
            <path d="M120,42 A18,18 0 0,1 131,55" fill={`${emerald}33`} stroke={emerald} strokeWidth={1.6} />
            {kind === 'transversal-alt' && (
              <path d="M164,92 A18,18 0 0,1 153,79" fill={`${emerald}33`} stroke={emerald} strokeWidth={1.6} />
            )}
            {kind === 'transversal-corr' && (
              <path d="M164,92 A18,18 0 0,1 175,105" fill={`${emerald}33`} stroke={emerald} strokeWidth={1.6} />
            )}
            {kind === 'linear-pair' && (
              <path d="M100,42 A18,18 0 0,1 120,42" fill={`${coral}33`} stroke={coral} strokeWidth={1.6} />
            )}
            <text x={198} y={36} fill={cyan} fontSize={9} fontFamily="JetBrains Mono">ℓ₁ ∥ ℓ₂</text>
            <text x={198} y={114} fill={emerald} fontSize={9} fontFamily="JetBrains Mono">
              {kind === 'linear-pair' ? 'α + β = 180°' : 'Congruent ≅'}
            </text>
          </g>
        );

      case 'triangle-congruence':
      case 'rigid-motion':
      case 'triangle-sum':
        return (
          <g>
            <polygon points="44,98 112,98 76,32" fill={`${cyan}22`} stroke={cyan} strokeWidth={1.8} />
            <polygon points="164,98 232,98 196,32" fill={`${gold}22`} stroke={gold} strokeWidth={1.8} />
            <path d="M112,56 Q140,34 166,56" fill="none" stroke={emerald} strokeDasharray="3 3" strokeWidth={1.5} />
            <text x={140} y={32} fill={emerald} fontSize={9} textAnchor="middle" fontFamily="JetBrains Mono">
              {kind === 'triangle-sum' ? 'α+β+γ = 180°' : 'SAS · SSS ≅'}
            </text>
          </g>
        );

      case 'similar-triangles':
      case 'area-scale-k2':
      case 'side-splitter':
        return (
          <g>
            <line x1={32} y1={104} x2={236} y2={28} stroke="rgba(255,255,255,0.22)" strokeDasharray="3 3" />
            <line x1={32} y1={104} x2={244} y2={104} stroke="rgba(255,255,255,0.22)" strokeDasharray="3 3" />
            <polygon points="32,104 118,104 118,72" fill={`${cyan}2C`} stroke={cyan} strokeWidth={1.8} />
            <polygon points="32,104 226,104 226,32" fill={`${gold}18`} stroke={gold} strokeWidth={1.6} />
            <text x={82} y={97} fill={cyan} fontSize={9} fontFamily="JetBrains Mono">A</text>
            <text x={175} y={84} fill={gold} fontSize={9.5} fontFamily="JetBrains Mono">k²·A</text>
            <text x={128} y={118} fill={emerald} fontSize={9} fontFamily="JetBrains Mono">Scale factor k</text>
          </g>
        );

      case 'reflection-axis':
      case 'rotation-arc':
      case 'dilation-rays': {
        return (
          <g>
            <line x1={140} y1={14} x2={140} y2={118} stroke={coral} strokeDasharray="4 3" strokeWidth={1.3} />
            <polygon points="62,88 112,88 94,38" fill={`${cyan}26`} stroke={cyan} strokeWidth={1.7} />
            <polygon
              points={kind === 'dilation-rays' ? '156,98 232,98 205,24' : '218,88 168,88 186,38'}
              fill={`${gold}24`}
              stroke={gold}
              strokeWidth={1.7}
            />
            <path d="M104,54 Q140,28 176,54" fill="none" stroke={emerald} strokeWidth={1.4} />
            <text x={140} y={24} fill={emerald} fontSize={9} textAnchor="middle" fontFamily="JetBrains Mono">
              {kind === 'rotation-arc' ? 'R(θ)' : kind === 'dilation-rays' ? 'k · (x, y)' : 'Reflect'}
            </text>
          </g>
        );
      }

      case 'polygon-angles':
      case 'quad-diagonals':
      case 'quad-hierarchy':
        return (
          <g>
            {kind === 'polygon-angles' ? (
              <>
                <polygon points="140,18 202,48 182,106 98,106 78,48" fill={`${cyan}1C`} stroke={cyan} strokeWidth={1.8} />
                <line x1={140} y1={18} x2={98} y2={106} stroke={gold} strokeDasharray="3 2" strokeWidth={1.3} />
                <line x1={140} y1={18} x2={182} y2={106} stroke={gold} strokeDasharray="3 2" strokeWidth={1.3} />
                <text x={140} y={76} fill={gold} fontSize={9.5} textAnchor="middle" fontFamily="JetBrains Mono">(n−2)·180°</text>
              </>
            ) : (
              <>
                <polygon points="88,28 214,28 192,104 66,104" fill={`${cyan}20`} stroke={cyan} strokeWidth={1.8} />
                <line x1={88} y1={28} x2={192} y2={104} stroke={gold} strokeWidth={1.4} />
                <line x1={214} y1={28} x2={66} y2={104} stroke={emerald} strokeWidth={1.4} />
                <Dot x={140} y={66} color={coral} r={3.5} />
                <text x={140} y={120} fill={ink} fontSize={8.5} textAnchor="middle" fontFamily="JetBrains Mono">Diagonals bisect at M</text>
              </>
            )}
          </g>
        );

      case 'pythagoras-squares':
      case 'right-trig-ratios':
      case 'special-triangle':
        return (
          <g>
            {kind === 'pythagoras-squares' ? (
              <>
                <rect x={68} y={60} width={34} height={34} fill={`${gold}28`} stroke={gold} strokeWidth={1.4} />
                <rect x={102} y={94} width={48} height={24} fill={`${cyan}24`} stroke={cyan} strokeWidth={1.4} />
                <polygon points="102,60 102,94 150,94" fill={`${emerald}26`} stroke={emerald} strokeWidth={1.8} />
                <text x={85} y={80} fill={gold} fontSize={9.5} textAnchor="middle" fontFamily="JetBrains Mono">a²</text>
                <text x={126} y={110} fill={cyan} fontSize={9.5} textAnchor="middle" fontFamily="JetBrains Mono">b²</text>
                <text x={142} y={68} fill={emerald} fontSize={10} fontFamily="JetBrains Mono">c² = a²+b²</text>
              </>
            ) : (
              <>
                <polygon points="62,104 198,104 198,32" fill={`${cyan}20`} stroke={cyan} strokeWidth={1.8} />
                <rect x={186} y={92} width={12} height={12} fill="none" stroke={gold} strokeWidth={1.2} />
                <text x={130} y={118} fill={gold} fontSize={9.5} textAnchor="middle" fontFamily="JetBrains Mono">adj (cos)</text>
                <text x={208} y={70} fill={emerald} fontSize={9.5} fontFamily="JetBrains Mono">opp</text>
                <text x={115} y={62} fill={coral} fontSize={9.5} fontFamily="JetBrains Mono">hyp</text>
              </>
            )}
          </g>
        );

      case 'distance-norm':
      case 'midpoint-bisector':
      case 'perp-slopes': {
        const [x1, y1] = mapPt(-1.8, -0.8, -3, 3.5, -2, 3);
        const [x2, y2] = mapPt(2.2, 2.0, -3, 3.5, -2, 3);
        const mx = (x1 + x2) / 2;
        const my = (y1 + y2) / 2;
        return (
          <g>
            <Axes xMin={-3} xMax={3.5} yMin={-2} yMax={3} />
            <line x1={x1} y1={y1} x2={x2} y2={y1} stroke={gold} strokeDasharray="3 2" strokeWidth={1.2} />
            <line x1={x2} y1={y1} x2={x2} y2={y2} stroke={emerald} strokeDasharray="3 2" strokeWidth={1.2} />
            <GlowCurve d={`M${x1},${y1} L${x2},${y2}`} color={cyan} />
            {kind !== 'distance-norm' && (
              <GlowCurve d={`M${mx - 32},${my - 46} L${mx + 32},${my + 46}`} color={coral} width={1.5} dashed />
            )}
            <Dot x={x1} y={y1} color={gold} />
            <Dot x={x2} y={y2} color={gold} />
            <Dot x={mx} y={my} color={emerald} r={3.2} />
          </g>
        );
      }

      case 'inscribed-angle':
      case 'circle-sector':
      case 'chord-tangent':
        return (
          <g>
            <circle cx={140} cy={66} r={46} fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth={1.4} />
            {kind === 'circle-sector' ? (
              <>
                <path d="M140,66 L186,66 A46,46 0 0,0 156,23 Z" fill={`${cyan}36`} stroke={cyan} strokeWidth={1.8} />
                <text x={198} y={54} fill={gold} fontSize={9.5} fontFamily="JetBrains Mono">s = rθ</text>
              </>
            ) : (
              <>
                <line x1={140} y1={66} x2={182} y2={84} stroke={gold} strokeWidth={1.6} />
                <line x1={140} y1={66} x2={172} y2={33} stroke={gold} strokeWidth={1.6} />
                <line x1={96} y1={52} x2={182} y2={84} stroke={cyan} strokeWidth={1.5} />
                <line x1={96} y1={52} x2={172} y2={33} stroke={cyan} strokeWidth={1.5} />
                <Dot x={140} y={66} color={gold} r={3.2} />
                <Dot x={96} y={52} color={cyan} r={3.2} />
                <text x={200} y={64} fill={emerald} fontSize={9} fontFamily="JetBrains Mono">θ = ½(2θ)</text>
              </>
            )}
          </g>
        );

      case 'prism-net':
      case 'pyramid-slant':
      case 'cylinder-unroll':
        return (
          <g>
            {kind === 'pyramid-slant' ? (
              <>
                <polygon points="118,52 162,52 162,92 118,92" fill={`${cyan}26`} stroke={cyan} strokeWidth={1.5} />
                <polygon points="118,52 162,52 140,14" fill={`${gold}24`} stroke={gold} strokeWidth={1.4} />
                <polygon points="162,52 162,92 204,72" fill={`${gold}24`} stroke={gold} strokeWidth={1.4} />
                <polygon points="118,92 162,92 140,124" fill={`${gold}24`} stroke={gold} strokeWidth={1.4} />
                <polygon points="118,52 118,92 76,72" fill={`${gold}24`} stroke={gold} strokeWidth={1.4} />
                <line x1={140} y1={52} x2={140} y2={14} stroke={emerald} strokeWidth={1.6} />
                <text x={146} y={36} fill={emerald} fontSize={9.5} fontFamily="JetBrains Mono">l</text>
              </>
            ) : kind === 'cylinder-unroll' ? (
              <>
                <rect x={84} y={40} width={112} height={52} fill={`${cyan}24`} stroke={cyan} strokeWidth={1.6} />
                <circle cx={140} cy={22} r={16} fill={`${gold}24`} stroke={gold} strokeWidth={1.4} />
                <circle cx={140} cy={110} r={16} fill={`${gold}24`} stroke={gold} strokeWidth={1.4} />
                <text x={140} y={70} fill={ink} fontSize={9.5} textAnchor="middle" fontFamily="JetBrains Mono">2πr × h</text>
              </>
            ) : (
              <>
                <rect x={54} y={46} width={44} height={44} fill={`${cyan}22`} stroke={cyan} strokeWidth={1.4} />
                <rect x={98} y={46} width={44} height={44} fill={`${gold}26`} stroke={gold} strokeWidth={1.6} />
                <rect x={142} y={46} width={44} height={44} fill={`${cyan}22`} stroke={cyan} strokeWidth={1.4} />
                <rect x={186} y={46} width={44} height={44} fill={`${cyan}22`} stroke={cyan} strokeWidth={1.4} />
                <rect x={98} y={14} width={44} height={32} fill={`${emerald}24`} stroke={emerald} strokeWidth={1.4} />
                <rect x={98} y={90} width={44} height={32} fill={`${emerald}24`} stroke={emerald} strokeWidth={1.4} />
              </>
            )}
          </g>
        );

      case 'argand-vector':
      case 'complex-conjugate':
      case 'euler-circle':
        return (
          <g>
            <Axes xMin={-3} xMax={3} yMin={-2} yMax={2} />
            <circle cx={140} cy={66} r={42} fill="none" stroke="rgba(255,255,255,0.16)" strokeDasharray="3 3" />
            <GlowCurve d="M140,66 L174,38" color={emerald} />
            <Dot x={174} y={38} color={emerald} />
            <text x={182} y={36} fill={emerald} fontSize={9.5} fontFamily="JetBrains Mono">a+bi</text>
            {kind === 'complex-conjugate' && (
              <>
                <GlowCurve d="M140,66 L174,94" color={coral} dashed />
                <Dot x={174} y={94} color={coral} />
                <text x={182} y={98} fill={coral} fontSize={9.5} fontFamily="JetBrains Mono">a−bi</text>
              </>
            )}
          </g>
        );

      case 'nonlinear-2roots':
      case 'nonlinear-tangent':
      case 'quad-ineq-region': {
        const para = plotPath((x) => 0.48 * x * x - 1.5, -3.5, 3.5, -2.5, 4);
        const lineY = kind === 'nonlinear-tangent' ? (x: number) => 0.96 * x - 1.98 : (x: number) => 0.45 * x + 0.35;
        const line = plotPath(lineY, -3.5, 3.5, -2.5, 4);
        return (
          <g>
            <Axes xMin={-3.5} xMax={3.5} yMin={-2.5} yMax={4} />
            <GlowCurve d={para} color={emerald} />
            <GlowCurve d={line} color={gold} />
            {kind === 'nonlinear-tangent' ? (
              <Dot x={mapPt(1, -1.02, -3.5, 3.5, -2.5, 4)[0]} y={mapPt(1, -1.02, -3.5, 3.5, -2.5, 4)[1]} color={coral} />
            ) : (
              <>
                <Dot x={mapPt(-1.55, -0.35, -3.5, 3.5, -2.5, 4)[0]} y={mapPt(-1.55, -0.35, -3.5, 3.5, -2.5, 4)[1]} color={coral} />
                <Dot x={mapPt(2.48, 1.46, -3.5, 3.5, -2.5, 4)[0]} y={mapPt(2.48, 1.46, -3.5, 3.5, -2.5, 4)[1]} color={coral} />
              </>
            )}
          </g>
        );
      }

      case 'composition-pipe':
      case 'inverse-mirror':
      case 'radical-extraneous': {
        if (kind === 'composition-pipe') {
          return (
            <g>
              <rect x={22} y={46} width={44} height={34} rx={8} fill={`${gold}22`} stroke={gold} />
              <text x={44} y={67} fill={gold} fontSize={11} textAnchor="middle" fontFamily="JetBrains Mono">x</text>
              <line x1={66} y1={63} x2={92} y2={63} stroke={cyan} strokeWidth={1.6} />
              <rect x={92} y={40} width={58} height={46} rx={10} fill={`${cyan}22`} stroke={cyan} />
              <text x={121} y={67} fill={cyan} fontSize={11} textAnchor="middle" fontFamily="JetBrains Mono">g(x)</text>
              <line x1={150} y1={63} x2={176} y2={63} stroke={emerald} strokeWidth={1.6} />
              <rect x={176} y={40} width={82} height={46} rx={10} fill={`${emerald}22`} stroke={emerald} />
              <text x={217} y={67} fill={emerald} fontSize={10.5} textAnchor="middle" fontFamily="JetBrains Mono">f(g(x))</text>
            </g>
          );
        }
        const f1 = plotPath((x) => (x >= 0 ? 0.5 * x * x : null), -1, 4, -1, 4);
        const f2 = plotPath((x) => (x >= 0 ? Math.sqrt(2 * x) : null), -1, 4, -1, 4);
        const mir = plotPath((x) => x, -1, 4, -1, 4);
        return (
          <g>
            <Axes xMin={-1} xMax={4} yMin={-1} yMax={4} />
            <GlowCurve d={mir} color="rgba(255,255,255,0.45)" width={1.2} dashed />
            <GlowCurve d={f1} color={gold} />
            <GlowCurve d={f2} color={emerald} />
            <text x={208} y={28} fill={ink} fontSize={8.5} fontFamily="JetBrains Mono">y = x</text>
          </g>
        );
      }

      case 'log-reflection':
      case 'log-product':
      case 'log-quotient':
      case 'log-power': {
        const exp = plotPath((x) => Math.pow(2, x), -2.5, 3.2, -2.5, 4);
        const log = plotPath((x) => (x > 0.08 ? Math.log2(x) : null), -2.5, 3.2, -2.5, 4);
        const mir = plotPath((x) => x, -2.5, 3.2, -2.5, 4);
        return (
          <g>
            <Axes xMin={-2.5} xMax={3.2} yMin={-2.5} yMax={4} />
            <GlowCurve d={mir} color="rgba(255,255,255,0.35)" width={1.1} dashed />
            <GlowCurve d={exp} color={gold} />
            <GlowCurve d={log} color={emerald} />
            <Dot x={mapPt(0, 1, -2.5, 3.2, -2.5, 4)[0]} y={mapPt(0, 1, -2.5, 3.2, -2.5, 4)[1]} color={gold} r={3} />
            <Dot x={mapPt(1, 0, -2.5, 3.2, -2.5, 4)[0]} y={mapPt(1, 0, -2.5, 3.2, -2.5, 4)[1]} color={emerald} r={3} />
          </g>
        );
      }

      case 'poly-multiplicity':
      case 'poly-end-behavior':
      case 'factor-root': {
        const d = plotPath((x) => 0.22 * (x + 1.8) * (x - 1) * (x - 1), -2.8, 3, -3, 3.5);
        const [r1x, r1y] = mapPt(-1.8, 0, -2.8, 3, -3, 3.5);
        const [r2x, r2y] = mapPt(1, 0, -2.8, 3, -3, 3.5);
        return (
          <g>
            <Axes xMin={-2.8} xMax={3} yMin={-3} yMax={3.5} />
            <GlowCurve d={d} color={emerald} />
            <Dot x={r1x} y={r1y} color={cyan} />
            <Dot x={r2x} y={r2y} color={gold} />
            <text x={r1x} y={r1y - 10} fill={cyan} fontSize={8.5} textAnchor="middle" fontFamily="JetBrains Mono">m=1</text>
            <text x={r2x} y={r2y + 15} fill={gold} fontSize={8.5} textAnchor="middle" fontFamily="JetBrains Mono">m=2 bounce</text>
          </g>
        );
      }

      case 'matrix-warp':
      case 'neural-layer':
      case 'activation-relu': {
        if (kind === 'activation-relu') {
          const d = plotPath((x) => Math.max(0, x), -3, 3, -1, 3.2);
          return (
            <g>
              <Axes xMin={-3} xMax={3} yMin={-1} yMax={3.2} />
              <GlowCurve d={d} color={emerald} />
              <text x={180} y={36} fill={emerald} fontSize={9.5} fontFamily="JetBrains Mono">ReLU(z)=max(0,z)</text>
            </g>
          );
        }
        const L1 = [28, 64, 100];
        const L2 = [42, 86];
        const L3 = [64];
        return (
          <g>
            {L1.map((y1, i) =>
              L2.map((y2, j) => (
                <line key={`${i}-${j}`} x1={64} y1={y1} x2={146} y2={y2} stroke={i === j ? cyan : `${gold}55`} strokeWidth={i === j ? 1.8 : 1} />
              ))
            )}
            {L2.map((y2, i) =>
              L3.map((y3, j) => (
                <line key={`b-${i}-${j}`} x1={146} y1={y2} x2={224} y2={y3} stroke={emerald} strokeWidth={1.6} />
              ))
            )}
            {L1.map((y, i) => <Dot key={`a${i}`} x={64} y={y} color={gold} r={4.5} />)}
            {L2.map((y, i) => <Dot key={`b${i}`} x={146} y={y} color={cyan} r={4.5} />)}
            <Dot x={224} y={64} color={emerald} r={5} />
          </g>
        );
      }

      case 'pascal-binomial':
      case 'comb-vs-perm':
      case 'binomial-bars': {
        const rows = [[1], [1, 1], [1, 2, 1], [1, 3, 3, 1], [1, 4, 6, 4, 1]];
        return (
          <g>
            {rows.map((row, r) =>
              row.map((val, c) => {
                const cx = 140 + (c - r / 2) * 34;
                const cy = 22 + r * 22;
                const hi = r === 4 && c === 2;
                return (
                  <g key={`${r}-${c}`}>
                    <circle cx={cx} cy={cy} r={9.5} fill={hi ? `${emerald}38` : `${cyan}18`} stroke={hi ? emerald : cyan} strokeWidth={hi ? 1.8 : 1} />
                    <text x={cx} y={cy + 3.2} fill={ink} fontSize={8.5} textAnchor="middle" fontFamily="JetBrains Mono">{val}</text>
                  </g>
                );
              })
            )}
          </g>
        );
      }

      case 'rational-pole':
      case 'rational-hole':
      case 'horizontal-asym': {
        const d1 = plotPath((x) => (x < 0.85 ? 1 / (x - 1) + 0.6 : null), -3, 4.5, -3.5, 4.5);
        const d2 = plotPath((x) => (x > 1.15 ? 1 / (x - 1) + 0.6 : null), -3, 4.5, -3.5, 4.5);
        const [px] = mapPt(1, 0, -3, 4.5, -3.5, 4.5);
        const [, hy] = mapPt(0, 0.6, -3, 4.5, -3.5, 4.5);
        return (
          <g>
            <Axes xMin={-3} xMax={4.5} yMin={-3.5} yMax={4.5} />
            <line x1={px} y1={12} x2={px} y2={H - 12} stroke={coral} strokeDasharray="4 3" strokeWidth={1.3} />
            <line x1={18} y1={hy} x2={W - 18} y2={hy} stroke={gold} strokeDasharray="4 3" strokeWidth={1.1} />
            <GlowCurve d={d1} color={emerald} />
            <GlowCurve d={d2} color={emerald} />
            {kind === 'rational-hole' && <circle cx={px + 26} cy={hy - 18} r={4} fill="#060A13" stroke={cyan} strokeWidth={1.8} />}
          </g>
        );
      }

      case 'normal-bell':
      case 'z-score-band':
      case 'expected-value': {
        const bell = plotPath((x) => Math.exp(-0.5 * x * x), -3.5, 3.5, -0.1, 1.2);
        const band = plotPath((x) => Math.exp(-0.5 * x * x), -1, 1, -0.1, 1.2, 32);
        const [lx, by] = mapPt(-1, 0, -3.5, 3.5, -0.1, 1.2);
        const [rx] = mapPt(1, 0, -3.5, 3.5, -0.1, 1.2);
        return (
          <g>
            <Axes xMin={-3.5} xMax={3.5} yMin={-0.1} yMax={1.2} />
            <path d={`${band} L${rx},${by} L${lx},${by} Z`} fill={`${emerald}2E`} />
            <GlowCurve d={bell} color={emerald} />
            <text x={140} y={88} fill={gold} fontSize={9.5} textAnchor="middle" fontFamily="JetBrains Mono">68.3% (±1σ)</text>
          </g>
        );
      }

      case 'unit-circle-proj':
      case 'sinusoid-wave': {
        const wave = plotPath((x) => Math.sin(x), 0, 6.28, -1.35, 1.35);
        return (
          <g>
            <circle cx={58} cy={66} r={34} fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth={1.3} />
            <line x1={58} y1={66} x2={82} y2={42} stroke={gold} strokeWidth={1.8} />
            <line x1={82} y1={42} x2={132} y2={42} stroke={coral} strokeDasharray="3 2" strokeWidth={1.2} />
            <Dot x={82} y={42} color={coral} r={3.4} />
            <g transform="translate(86,0) scale(0.68,1)">
              <GlowCurve d={wave} color={coral} />
            </g>
          </g>
        );
      }

      case 'trig-pythag-id':
      case 'trig-double-angle':
      case 'trig-sum-phase': {
        const s2 = plotPath((x) => Math.sin(x) ** 2, 0, 6.28, -0.2, 1.4);
        const c2 = plotPath((x) => Math.cos(x) ** 2, 0, 6.28, -0.2, 1.4);
        const [, y1] = mapPt(0, 1, 0, 6.28, -0.2, 1.4);
        return (
          <g>
            <Axes xMin={0} xMax={6.28} yMin={-0.2} yMax={1.4} />
            <line x1={18} y1={y1} x2={W - 18} y2={y1} stroke={emerald} strokeWidth={1.8} />
            <GlowCurve d={s2} color={coral} width={1.6} />
            <GlowCurve d={c2} color={cyan} width={1.6} />
            <text x={200} y={y1 - 6} fill={emerald} fontSize={9} fontFamily="JetBrains Mono">sum = 1</text>
          </g>
        );
      }

      case 'vector-parallelogram':
      case 'dot-product-angle':
      case 'matrix-det-area':
        return (
          <g>
            <polygon points="56,100 144,96 208,42 120,46" fill={`${cyan}20`} stroke="rgba(255,255,255,0.22)" strokeDasharray="3 2" />
            <GlowCurve d="M56,100 L144,96" color={gold} />
            <GlowCurve d="M56,100 L120,46" color={cyan} />
            <GlowCurve d="M56,100 L208,42" color={emerald} width={2.4} />
            <Dot x={208} y={42} color={emerald} />
            <text x={198} y={32} fill={emerald} fontSize={9.5} fontFamily="JetBrains Mono">u + v</text>
          </g>
        );

      case 'law-sines-circle':
      case 'law-cosines-tri':
      case 'oblique-area':
        return (
          <g>
            {kind === 'law-sines-circle' && (
              <circle cx={140} cy={66} r={48} fill="none" stroke={`${cyan}55`} strokeDasharray="4 3" strokeWidth={1.3} />
            )}
            <polygon points="96,94 186,92 154,22" fill={`${coral}20`} stroke={coral} strokeWidth={1.8} />
            <text x={140} y={108} fill={gold} fontSize={9.5} textAnchor="middle" fontFamily="JetBrains Mono">c</text>
            <text x={115} y={56} fill={cyan} fontSize={9.5} fontFamily="JetBrains Mono">b</text>
            <text x={176} y={56} fill={emerald} fontSize={9.5} fontFamily="JetBrains Mono">a</text>
          </g>
        );

      case 'parametric-lissajous':
      case 'parametric-velocity':
      case 'projectile-arc': {
        if (kind === 'projectile-arc') {
          const arc = plotPath((x) => -0.25 * x * x + 1.5 * x, 0, 6.2, -0.3, 3.0);
          return (
            <g>
              <Axes xMin={0} xMax={6.2} yMin={-0.3} yMax={3.0} />
              <GlowCurve d={arc} color={coral} />
              <Dot x={140} y={30} color={gold} />
            </g>
          );
        }
        const pts: string[] = [];
        for (let i = 0; i <= 120; i++) {
          const t = (i / 120) * Math.PI * 2;
          const x = 140 + 82 * Math.sin(3 * t + 0.5);
          const y = 66 + 44 * Math.sin(2 * t);
          pts.push(`${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`);
        }
        return (
          <g>
            <GlowCurve d={pts.join(' ')} color={coral} width={1.8} />
            <Dot x={140 + 82 * Math.sin(0.5)} y={66} color={gold} />
          </g>
        );
      }

      case 'polar-rose':
      case 'polar-coords':
      case 'polar-spiral': {
        const pts: string[] = [];
        for (let i = 0; i <= 160; i++) {
          const t = (i / 160) * Math.PI * 2;
          const r = kind === 'polar-spiral' ? 8 + t * 6.8 : 44 * Math.cos(3 * t);
          const x = 140 + r * Math.cos(t);
          const y = 66 + r * Math.sin(t);
          pts.push(`${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`);
        }
        return (
          <g>
            <circle cx={140} cy={66} r={44} fill="none" stroke="rgba(255,255,255,0.12)" />
            <circle cx={140} cy={66} r={22} fill="none" stroke="rgba(255,255,255,0.1)" />
            <GlowCurve d={pts.join(' ')} color={coral} width={1.8} />
            <Dot x={184} y={66} color={gold} r={3.4} />
          </g>
        );
      }

      case 'ellipse-foci':
      case 'hyperbola-asym':
      case 'conic-eccentricity':
        return kind === 'hyperbola-asym' ? (
          <g>
            <Axes xMin={-3} xMax={3} yMin={-2} yMax={2} />
            <line x1={38} y1={16} x2={242} y2={116} stroke="rgba(255,255,255,0.22)" strokeDasharray="3 3" />
            <line x1={38} y1={116} x2={242} y2={16} stroke="rgba(255,255,255,0.22)" strokeDasharray="3 3" />
            <GlowCurve d="M72,18 Q112,66 72,114" color={coral} />
            <GlowCurve d="M208,18 Q168,66 208,114" color={coral} />
          </g>
        ) : (
          <g>
            <ellipse cx={140} cy={66} rx={78} ry={40} fill="none" stroke={coral} strokeWidth={2} />
            <line x1={84} y1={66} x2={164} y2={28} stroke={cyan} strokeWidth={1.4} />
            <line x1={196} y1={66} x2={164} y2={28} stroke={gold} strokeWidth={1.4} />
            <Dot x={84} y={66} color={emerald} r={3.2} />
            <Dot x={196} y={66} color={emerald} r={3.2} />
            <Dot x={164} y={28} color={ink} r={3.2} />
            <text x={140} y={82} fill={gold} fontSize={8.5} textAnchor="middle" fontFamily="JetBrains Mono">d₁ + d₂ = 2a</text>
          </g>
        );

      case 'series-staircase':
      case 'series-square-split':
      case 'series-diverge':
        return (
          <g>
            <rect x={80} y={18} width={120} height={96} fill="none" stroke="rgba(255,255,255,0.25)" />
            <rect x={80} y={18} width={60} height={96} fill={`${coral}34`} stroke={coral} />
            <rect x={140} y={18} width={60} height={48} fill={`${gold}32`} stroke={gold} />
            <rect x={140} y={66} width={30} height={48} fill={`${cyan}32`} stroke={cyan} />
            <rect x={170} y={66} width={30} height={24} fill={`${emerald}32`} stroke={emerald} />
            <text x={110} y={70} fill={ink} fontSize={10} textAnchor="middle" fontFamily="JetBrains Mono">½</text>
            <text x={170} y={45} fill={ink} fontSize={9.5} textAnchor="middle" fontFamily="JetBrains Mono">¼</text>
            <text x={155} y={94} fill={ink} fontSize={8.5} textAnchor="middle" fontFamily="JetBrains Mono">⅛</text>
          </g>
        );

      case 'secant-to-tangent':
      case 'limit-approach':
      case 'continuity-hole': {
        const para = plotPath((x) => 0.45 * x * x - 1.0, -2.5, 3.2, -1.6, 3.8);
        const tan = plotPath((x) => 0.9 * (x - 1) - 0.55, -2.5, 3.2, -1.6, 3.8);
        const sec = plotPath((x) => 1.45 * (x - 1) - 0.55, -2.5, 3.2, -1.6, 3.8);
        const [p1x, p1y] = mapPt(1, -0.55, -2.5, 3.2, -1.6, 3.8);
        const [p2x, p2y] = mapPt(2.2, 1.18, -2.5, 3.2, -1.6, 3.8);
        return (
          <g>
            <Axes xMin={-2.5} xMax={3.2} yMin={-1.6} yMax={3.8} />
            <GlowCurve d={para} color={cyan} />
            <GlowCurve d={tan} color={emerald} width={1.5} dashed />
            <GlowCurve d={sec} color={coral} width={1.7} />
            {kind === 'continuity-hole' ? (
              <circle cx={p1x} cy={p1y} r={4.2} fill="#060A13" stroke={gold} strokeWidth={1.8} />
            ) : (
              <Dot x={p1x} y={p1y} color={emerald} />
            )}
            <Dot x={p2x} y={p2y} color={gold} />
            <text x={p2x - 20} y={p2y - 10} fill={gold} fontSize={8.5} fontFamily="JetBrains Mono">h → 0</text>
          </g>
        );
      }

      default:
        return null;
    }
  }, [kind, accent]);

  return (
    <VisualAnimContext.Provider value={shouldAnimate}>
      <div
        className={`relative w-full ${heightClass} rounded-xl bg-[#050811] border border-white/[0.08] overflow-hidden flex items-center justify-center group`}
      >
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full" role="img" aria-label={caption ?? kind}>
          <defs>
            <pattern id={gridId} width="24" height="24" patternUnits="userSpaceOnUse">
              <path d="M 24 0 L 0 0 0 24" fill="none" stroke="rgba(255,255,255,0.035)" strokeWidth="1" />
            </pattern>
          </defs>
          <rect x={0} y={0} width={W} height={H} fill={`url(#${gridId})`} />
          <motion.g
            key={`${kind}-${replayKey ?? 'base'}-${localReplay}`}
            initial={shouldAnimate ? { opacity: 0.25 } : false}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            {content}
          </motion.g>
        </svg>
        {showReplay && (
          <button
            type="button"
            onClick={() => setLocalReplay((n) => n + 1)}
            aria-label="Replay equation drawing animation"
            title="Replay animation"
            className="absolute top-1.5 right-1.5 p-1 rounded-md bg-[#090F1D]/85 border border-white/10 text-[#8B9BB4] hover:text-[#F4F3EE] hover:border-white/25 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
          </button>
        )}
        {caption && (
          <span className="pointer-events-none absolute bottom-1.5 right-2.5 font-mono-data text-[9px] uppercase tracking-wider text-[#6F7F99]">
            {caption}
          </span>
        )}
      </div>
    </VisualAnimContext.Provider>
  );
}
