import { useId, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { RotateCcw } from 'lucide-react';
import { EquationMiniVisual, EquationVisualKind } from './EquationMiniVisual';

interface DerivationStepVisualProps {
  visualKinds: EquationVisualKind[];
  stepIndex: number;
  totalSteps?: number;
  stepTitle: string;
  accent: string;
}

/**
 * Step-matched visual companion for Layer 3 Guided Step-by-Step Derivations.
 * Renders the geometric/graphical visual matched to the active derivation step
 * with AUREA Golden Observatory telemetry, animated draw-in, and step-progress reticle.
 */
export function DerivationStepVisual({
  visualKinds,
  stepIndex,
  totalSteps,
  stepTitle,
  accent,
}: DerivationStepVisualProps) {
  const reducedMotion = useReducedMotion();
  const activeKind = visualKinds[Math.min(stepIndex, visualKinds.length - 1)] ?? visualKinds[0];
  const count = Math.max(1, totalSteps ?? visualKinds.length);
  const progressPct = Math.min(100, Math.round(((stepIndex + 1) / count) * 100));

  return (
    <div className="space-y-2.5">
      <div className="space-y-1.5">
        <div className="flex items-center justify-between px-1">
          <span
            className="font-mono-data text-[10px] uppercase tracking-widest flex items-center gap-1.5"
            style={{ color: accent }}
          >
            <span
              className="w-2 h-2 rounded-full inline-block"
              style={{ backgroundColor: accent, boxShadow: `0 0 10px ${accent}` }}
            />
            Guided Step Visual · 0{stepIndex + 1} / 0{count}
          </span>
          <span className="font-mono-data text-[10px] text-[#A8B2C6] truncate max-w-[220px]">
            {stepTitle.replace(/^Step \d+ · /, '')}
          </span>
        </div>

        <div className="h-1 w-full rounded-full bg-[rgba(244,196,108,0.12)] overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ backgroundColor: accent, boxShadow: `0 0 10px ${accent}` }}
            initial={false}
            animate={{ width: `${progressPct}%` }}
            transition={reducedMotion ? { duration: 0 } : { type: 'spring', stiffness: 260, damping: 28 }}
          />
        </div>
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={`${activeKind}-${stepIndex}`}
          initial={reducedMotion ? false : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reducedMotion ? undefined : { opacity: 0, y: -6 }}
          transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
        >
          <EquationMiniVisual
            kind={activeKind}
            accent={accent}
            replayKey={`${activeKind}-${stepIndex}`}
            heightClass="h-[195px]"
            caption={stepTitle}
            showReplay
          />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export type MisconceptionPlotKind =
  | 'area-wings'
  | 'slope-invert'
  | 'exp-add-vs-mult'
  | 'parallel-no-cross'
  | 'dashed-boundary'
  | 'abs-shift-sign'
  | 'exp-vs-linear'
  | 'regression-outlier'
  | 'transversal-supp-vs-eq'
  | 'ssa-not-congruent'
  | 'scale-k-vs-k2'
  | 'reflect-order'
  | 'polygon-n-vs-n2'
  | 'pythag-hyp-vs-sum'
  | 'distance-sign-error'
  | 'inscribed-vs-central'
  | 'complex-i2-sign'
  | 'nonlinear-single-root'
  | 'radical-extraneous-branch'
  | 'poly-divide-zero'
  | 'comb-vs-perm-overcount'
  | 'rational-cancel-sum'
  | 'normal-skew-vs-sym'
  | 'trig-double-vs-amp'
  | 'vector-norm-vs-sum'
  | 'cosines-missing-term'
  | 'parametric-speed-vs-path'
  | 'polar-neg-radius'
  | 'conic-plus-vs-minus'
  | 'series-diverge-r1'
  | 'limit-hole-vs-value';

interface MisconceptionVisualProps {
  kind: MisconceptionPlotKind;
  falseLabel?: string;
  trueLabel?: string;
}

const MW = 360;
const MH = 156;

function plot(fn: (x: number) => number | null, x0: number, x1: number, y0: number, y1: number) {
  const parts: string[] = [];
  let down = false;
  for (let i = 0; i <= 72; i++) {
    const x = x0 + (i / 72) * (x1 - x0);
    const y = fn(x);
    if (y === null || !Number.isFinite(y) || y < y0 - 1 || y > y1 + 1) {
      down = false;
      continue;
    }
    const sx = 24 + ((x - x0) / (x1 - x0)) * (MW - 48);
    const sy = MH - 20 - ((y - y0) / (y1 - y0)) * (MH - 38);
    parts.push(`${down ? 'L' : 'M'}${sx.toFixed(1)},${sy.toFixed(1)}`);
    down = true;
  }
  return parts.join(' ');
}

function PulseBeacon({ cx, cy, color }: { cx: number; cy: number; color: string }) {
  const reducedMotion = useReducedMotion();
  if (reducedMotion) {
    return (
      <g>
        <circle cx={cx} cy={cy} r={7} fill={color} fillOpacity={0.22} />
        <circle cx={cx} cy={cy} r={3.8} fill={color} stroke="#06070B" strokeWidth={1.2} />
      </g>
    );
  }
  return (
    <g>
      <motion.circle
        cx={cx}
        cy={cy}
        r={7}
        fill={color}
        animate={{ scale: [1, 1.55, 1], opacity: [0.28, 0.06, 0.28] }}
        transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
        style={{ transformOrigin: `${cx}px ${cy}px` }}
      />
      <circle cx={cx} cy={cy} r={3.8} fill={color} stroke="#06070B" strokeWidth={1.2} />
    </g>
  );
}

/**
 * Dedicated Amber-Coral (FALSE) vs Jade (TRUE) geometric proof plot for Layer 5.
 * Visually proves WHY a classic student error fails rather than merely stating it in text.
 */
export function MisconceptionVisual({
  kind,
  falseLabel = 'Common Error (FALSE)',
  trueLabel = 'Verified Law (TRUE)',
}: MisconceptionVisualProps) {
  const uid = useId().replace(/:/g, '');
  const gridId = `mgrid-${kind}-${uid}`;
  const glowId = `mglow-${kind}-${uid}`;
  const clipId = `mclip-${kind}-${uid}`;
  const reducedMotion = useReducedMotion();
  const [localReplay, setLocalReplay] = useState(0);

  const coral = '#FF8563';
  const emerald = '#45E6A6';
  const gold = '#F4C46C';
  const starGold = '#FFE29E';
  const cyan = '#46D6E8';
  const axisStroke = 'rgba(244, 196, 108, 0.22)';

  const renderGraphic = () => {
    switch (kind) {
      case 'area-wings':
        return (
          <g>
            {/* Left: False x² + 9 */}
            <rect x={42} y={32} width={52} height={52} fill={`${coral}26`} stroke={coral} strokeWidth={1.6} />
            <rect x={94} y={84} width={28} height={28} fill={`${coral}26`} stroke={coral} strokeWidth={1.6} />
            <rect x={94} y={32} width={28} height={52} fill="none" stroke={coral} strokeDasharray="3 3" opacity={0.55} />
            <rect x={42} y={84} width={52} height={28} fill="none" stroke={coral} strokeDasharray="3 3" opacity={0.55} />
            <text x={82} y={132} fill={coral} fontSize={9.5} textAnchor="middle" fontFamily="JetBrains Mono">Missing 6x wings!</text>
            {/* Right: True (x+3)² */}
            <rect x={218} y={32} width={52} height={52} fill={`${emerald}26`} stroke={emerald} strokeWidth={1.6} />
            <rect x={270} y={32} width={28} height={52} fill={`${gold}30`} stroke={gold} strokeWidth={1.5} />
            <rect x={218} y={84} width={52} height={28} fill={`${gold}30`} stroke={gold} strokeWidth={1.5} />
            <rect x={270} y={84} width={28} height={28} fill={`${emerald}32`} stroke={emerald} strokeWidth={1.6} />
            <PulseBeacon cx={270} cy={84} color={starGold} />
            <text x={244} y={62} fill={emerald} fontSize={10} textAnchor="middle" fontFamily="JetBrains Mono">x²</text>
            <text x={284} y={62} fill={starGold} fontSize={9} textAnchor="middle" fontFamily="JetBrains Mono">3x</text>
            <text x={244} y={102} fill={starGold} fontSize={9} textAnchor="middle" fontFamily="JetBrains Mono">3x</text>
            <text x={284} y={102} fill={emerald} fontSize={9} textAnchor="middle" fontFamily="JetBrains Mono">9</text>
            <text x={258} y={132} fill={emerald} fontSize={9.5} textAnchor="middle" fontFamily="JetBrains Mono">Full Area = x² + 6x + 9</text>
          </g>
        );

      case 'slope-invert':
        return (
          <g>
            <line x1={28} y1={126} x2={332} y2={126} stroke={axisStroke} />
            <line x1={70} y1={18} x2={70} y2={136} stroke={axisStroke} />
            <path d={plot((x) => 2.5 * x, -0.5, 4, -0.5, 5)} fill="none" stroke={emerald} strokeWidth={2.3} />
            <path d={plot((x) => 0.4 * x, -0.5, 4, -0.5, 5)} fill="none" stroke={coral} strokeWidth={2.1} strokeDasharray="5 3" />
            <text x={156} y={42} fill={emerald} fontSize={9.5} fontFamily="JetBrains Mono">TRUE m = Δy/Δx = 2.5</text>
            <text x={216} y={96} fill={coral} fontSize={9.5} fontFamily="JetBrains Mono">FALSE Δx/Δy = 0.4</text>
          </g>
        );

      case 'exp-add-vs-mult':
        return (
          <g>
            <line x1={28} y1={124} x2={332} y2={124} stroke={axisStroke} />
            <path d={plot((x) => Math.pow(2, x + 2), 0, 3, 0, 32)} fill="none" stroke={emerald} strokeWidth={2.3} />
            <path d={plot((x) => Math.pow(2, 2 * x), 0, 3, 0, 32)} fill="none" stroke={coral} strokeWidth={2} strokeDasharray="5 3" />
            <text x={182} y={92} fill={emerald} fontSize={9.5} fontFamily="JetBrains Mono">2ˣ · 2² = 2^(x+2)</text>
            <text x={144} y={36} fill={coral} fontSize={9.5} fontFamily="JetBrains Mono">FALSE: 2^(2x) explodes!</text>
          </g>
        );

      case 'parallel-no-cross':
        return (
          <g>
            <line x1={28} y1={120} x2={332} y2={120} stroke={axisStroke} />
            <path d={plot((x) => 0.65 * x + 1.2, -3, 4, -1, 5)} fill="none" stroke={emerald} strokeWidth={2.3} />
            <path d={plot((x) => 0.65 * x - 0.3, -3, 4, -1, 5)} fill="none" stroke={cyan} strokeWidth={2.1} />
            <text x={180} y={42} fill={emerald} fontSize={9.5} textAnchor="middle" fontFamily="JetBrains Mono">Equal slopes m₁ = m₂ → Parallel (∅ solutions)</text>
            <text x={180} y={136} fill={coral} fontSize={9} textAnchor="middle" fontFamily="JetBrains Mono">Trap: forcing an intersection where lines never meet</text>
          </g>
        );

      case 'abs-shift-sign':
        return (
          <g>
            <line x1={28} y1={118} x2={332} y2={118} stroke={axisStroke} />
            <line x1={180} y1={18} x2={180} y2={136} stroke={axisStroke} />
            <path d={plot((x) => Math.abs(x - 2), -4, 4, -0.4, 4)} fill="none" stroke={emerald} strokeWidth={2.3} />
            <path d={plot((x) => Math.abs(x + 2), -4, 4, -0.4, 4)} fill="none" stroke={coral} strokeWidth={2} strokeDasharray="5 3" />
            <PulseBeacon cx={256} cy={109} color={emerald} />
            <text x={256} y={134} fill={emerald} fontSize={9} textAnchor="middle" fontFamily="JetBrains Mono">|x−2| RIGHT (+2)</text>
            <text x={102} y={134} fill={coral} fontSize={9} textAnchor="middle" fontFamily="JetBrains Mono">Trap: shifted LEFT</text>
          </g>
        );

      case 'exp-vs-linear':
        return (
          <g>
            <line x1={28} y1={126} x2={332} y2={126} stroke={axisStroke} />
            <path d={plot((x) => Math.pow(2, x), 0, 4, 0, 16)} fill="none" stroke={emerald} strokeWidth={2.3} />
            <path d={plot((x) => 2 * x + 1, 0, 4, 0, 16)} fill="none" stroke={coral} strokeWidth={2} strokeDasharray="5 3" />
            <text x={210} y={40} fill={emerald} fontSize={9.5} fontFamily="JetBrains Mono">2ˣ explodes to 16</text>
            <text x={218} y={96} fill={coral} fontSize={9.5} fontFamily="JetBrains Mono">Linear 2x+1 = 9</text>
          </g>
        );

      case 'scale-k-vs-k2':
        return (
          <g>
            <rect x={46} y={66} width={36} height={36} fill={`${cyan}28`} stroke={cyan} strokeWidth={1.6} />
            <text x={64} y={88} fill={cyan} fontSize={9.5} textAnchor="middle" fontFamily="JetBrains Mono">1×1</text>
            <rect x={128} y={48} width={72} height={36} fill={`${coral}22`} stroke={coral} strokeDasharray="4 3" strokeWidth={1.5} />
            <text x={164} y={102} fill={coral} fontSize={9} textAnchor="middle" fontFamily="JetBrains Mono">Trap: 2× Area</text>
            <g>
              <rect x={242} y={32} width={36} height={36} fill={`${emerald}26`} stroke={emerald} />
              <rect x={278} y={32} width={36} height={36} fill={`${emerald}26`} stroke={emerald} />
              <rect x={242} y={68} width={36} height={36} fill={`${emerald}26`} stroke={emerald} />
              <rect x={278} y={68} width={36} height={36} fill={`${emerald}26`} stroke={emerald} />
              <text x={278} y={124} fill={emerald} fontSize={9.5} textAnchor="middle" fontFamily="JetBrains Mono">TRUE: k² = 4× Area</text>
            </g>
          </g>
        );

      case 'pythag-hyp-vs-sum':
        return (
          <g>
            <polygon points="62,118 220,118 220,38" fill={`${emerald}1A`} stroke={emerald} strokeWidth={2} />
            <line x1={62} y1={118} x2={220} y2={118} stroke={coral} strokeWidth={2.2} strokeDasharray="4 3" />
            <line x1={220} y1={118} x2={220} y2={38} stroke={coral} strokeWidth={2.2} strokeDasharray="4 3" />
            <text x={126} y={68} fill={emerald} fontSize={10} fontFamily="JetBrains Mono">c = √(3²+4²) = 5</text>
            <text x={232} y={84} fill={coral} fontSize={9.5} fontFamily="JetBrains Mono">a + b = 7 ≠ 5</text>
          </g>
        );

      case 'inscribed-vs-central':
        return (
          <g>
            <circle cx={180} cy={78} r={54} fill="none" stroke="rgba(244,196,108,0.24)" />
            <line x1={180} y1={78} x2={228} y2={102} stroke={coral} strokeWidth={1.8} />
            <line x1={180} y1={78} x2={216} y2={38} stroke={coral} strokeWidth={1.8} />
            <line x1={128} y1={66} x2={228} y2={102} stroke={emerald} strokeWidth={1.8} />
            <line x1={128} y1={66} x2={216} y2={38} stroke={emerald} strokeWidth={1.8} />
            <PulseBeacon cx={180} cy={78} color={coral} />
            <PulseBeacon cx={128} cy={66} color={emerald} />
            <text x={242} y={76} fill={coral} fontSize={9.5} fontFamily="JetBrains Mono">Central 2θ = 80°</text>
            <text x={26} y={72} fill={emerald} fontSize={9.5} fontFamily="JetBrains Mono">Inscribed θ = 40°</text>
          </g>
        );

      case 'poly-divide-zero':
        return (
          <g>
            <line x1={24} y1={84} x2={336} y2={84} stroke={axisStroke} />
            <path d={plot((x) => 0.35 * (x * x * x - 4 * x), -2.6, 2.6, -3.5, 3.5)} fill="none" stroke={emerald} strokeWidth={2.2} />
            <circle cx={180} cy={84} r={7} fill={`${coral}33`} stroke={coral} strokeWidth={2} />
            <PulseBeacon cx={104} cy={84} color={emerald} />
            <PulseBeacon cx={256} cy={84} color={emerald} />
            <text x={180} y={114} fill={coral} fontSize={9.5} textAnchor="middle" fontFamily="JetBrains Mono">Dividing by x erases x = 0!</text>
          </g>
        );

      case 'trig-double-vs-amp':
        return (
          <g>
            <line x1={24} y1={78} x2={336} y2={78} stroke={axisStroke} />
            <path d={plot((x) => Math.sin(2 * x), 0, 6.28, -2.3, 2.3)} fill="none" stroke={emerald} strokeWidth={2.2} />
            <path d={plot((x) => 2 * Math.sin(x), 0, 6.28, -2.3, 2.3)} fill="none" stroke={coral} strokeWidth={1.9} strokeDasharray="5 3" />
            <text x={228} y={32} fill={coral} fontSize={9} fontFamily="JetBrains Mono">2·sin(x): taller</text>
            <text x={228} y={134} fill={emerald} fontSize={9} fontFamily="JetBrains Mono">sin(2x): 2× faster</text>
          </g>
        );

      case 'cosines-missing-term':
        return (
          <g>
            <polygon points="74,116 202,116 254,42" fill={`${emerald}1A`} stroke={emerald} strokeWidth={2} />
            <polygon points="74,116 202,116 202,42" fill="none" stroke={coral} strokeDasharray="4 3" strokeWidth={1.6} />
            <text x={180} y={134} fill={emerald} fontSize={9} textAnchor="middle" fontFamily="JetBrains Mono">Obtuse C &gt; 90° → −2ab cos C ADDS length!</text>
          </g>
        );

      case 'series-diverge-r1':
        return (
          <g>
            <line x1={24} y1={126} x2={336} y2={126} stroke={axisStroke} />
            <path d={plot((x) => 2 * (1 - Math.pow(0.5, x)), 0, 6, 0, 4.5)} fill="none" stroke={emerald} strokeWidth={2.3} />
            <path d={plot((x) => 0.45 * Math.pow(1.45, x), 0, 6, 0, 4.5)} fill="none" stroke={coral} strokeWidth={2} strokeDasharray="5 3" />
            <line x1={24} y1={72} x2={336} y2={72} stroke={gold} strokeDasharray="3 3" strokeWidth={1.2} />
            <text x={218} y={66} fill={emerald} fontSize={9} fontFamily="JetBrains Mono">|r| &lt; 1 converges</text>
            <text x={216} y={30} fill={coral} fontSize={9} fontFamily="JetBrains Mono">|r| ≥ 1 explodes!</text>
          </g>
        );

      case 'limit-hole-vs-value':
        return (
          <g>
            <line x1={24} y1={124} x2={336} y2={124} stroke={axisStroke} />
            <path d={plot((x) => 0.7 * x + 1.2, -1, 4, 0, 4.5)} fill="none" stroke={emerald} strokeWidth={2.2} />
            <circle cx={196} cy={68} r={5.5} fill="#06070B" stroke={emerald} strokeWidth={2.2} />
            <PulseBeacon cx={196} cy={108} color={coral} />
            <text x={208} y={68} fill={emerald} fontSize={9.5} fontFamily="JetBrains Mono">Limit L exists (open hole)</text>
            <text x={208} y={112} fill={coral} fontSize={9.5} fontFamily="JetBrains Mono">Point jump f(a) ≠ L</text>
          </g>
        );

      case 'radical-extraneous-branch':
        return (
          <g>
            <line x1={24} y1={90} x2={336} y2={90} stroke={axisStroke} />
            <line x1={88} y1={16} x2={88} y2={140} stroke={axisStroke} />
            <path d={plot((x) => (x >= -1 ? Math.sqrt(x + 1) : null), -2, 5, -2.5, 3)} fill="none" stroke={emerald} strokeWidth={2.3} />
            <path d={plot((x) => (x >= -1 ? -Math.sqrt(x + 1) : null), -2, 5, -2.5, 3)} fill="none" stroke={coral} strokeWidth={1.8} strokeDasharray="4 3" />
            <PulseBeacon cx={132} cy={90} color={starGold} />
            <text x={200} y={42} fill={emerald} fontSize={9.5} fontFamily="JetBrains Mono">+√(x+1) principal branch</text>
            <text x={182} y={132} fill={coral} fontSize={9} fontFamily="JetBrains Mono">Ghost −√ branch (extraneous!)</text>
          </g>
        );

      case 'rational-cancel-sum':
        return (
          <g>
            <line x1={24} y1={122} x2={336} y2={122} stroke={axisStroke} />
            <path d={plot((x) => (x > 0.4 ? 1 + 5 / x : null), 0, 8, 0, 8)} fill="none" stroke={emerald} strokeWidth={2.3} />
            <path d={plot(() => 6, 0, 8, 0, 8)} fill="none" stroke={coral} strokeWidth={2} strokeDasharray="5 3" />
            <text x={208} y={48} fill={coral} fontSize={9.5} fontFamily="JetBrains Mono">FALSE constant y = 6</text>
            <text x={196} y={96} fill={emerald} fontSize={9.5} fontFamily="JetBrains Mono">TRUE hyperbola 1 + 5/x</text>
          </g>
        );

      case 'transversal-supp-vs-eq':
        return (
          <g>
            <line x1={28} y1={52} x2={332} y2={52} stroke={cyan} strokeWidth={1.8} />
            <line x1={28} y1={108} x2={332} y2={108} stroke={cyan} strokeWidth={1.8} />
            <line x1={120} y1={18} x2={228} y2={140} stroke={gold} strokeWidth={2} />
            <path d="M150,52 A20,20 0 0,1 163,66" fill={`${emerald}33`} stroke={emerald} strokeWidth={1.7} />
            <path d="M198,108 A20,20 0 0,0 185,94" fill={`${coral}33`} stroke={coral} strokeWidth={1.7} />
            <text x={235} y={44} fill={emerald} fontSize={9} fontFamily="JetBrains Mono">Same-side interior:</text>
            <text x={235} y={58} fill={starGold} fontSize={9} fontFamily="JetBrains Mono">α + β = 180° (NOT α=β)</text>
          </g>
        );

      case 'vector-norm-vs-sum':
        return (
          <g>
            <line x1={62} y1={116} x2={200} y2={116} stroke={coral} strokeWidth={2.2} strokeDasharray="4 3" />
            <line x1={200} y1={116} x2={252} y2={42} stroke={coral} strokeWidth={2.2} strokeDasharray="4 3" />
            <line x1={62} y1={116} x2={252} y2={42} stroke={emerald} strokeWidth={2.5} />
            <PulseBeacon cx={252} cy={42} color={emerald} />
            <text x={118} y={66} fill={emerald} fontSize={9.5} fontFamily="JetBrains Mono">‖u+v‖ ≤ ‖u‖ + ‖v‖</text>
            <text x={180} y={134} fill={coral} fontSize={9} fontFamily="JetBrains Mono">Detour ‖u‖ + ‖v‖ is longer</text>
          </g>
        );

      case 'conic-plus-vs-minus':
        return (
          <g>
            <ellipse cx={102} cy={78} rx={58} ry={34} fill="none" stroke={emerald} strokeWidth={2} />
            <text x={102} y={132} fill={emerald} fontSize={9} textAnchor="middle" fontFamily="JetBrains Mono">(+) Closed Ellipse</text>
            <path d="M236,34 Q264,78 236,122" fill="none" stroke={coral} strokeWidth={2} />
            <path d="M312,34 Q284,78 312,122" fill="none" stroke={coral} strokeWidth={2} />
            <text x={274} y={132} fill={coral} fontSize={9} textAnchor="middle" fontFamily="JetBrains Mono">(−) Open Hyperbola</text>
          </g>
        );

      case 'dashed-boundary':
        return (
          <g>
            <polygon points="36,118 320,38 320,18 36,18" fill={`${emerald}22`} />
            <line x1={36} y1={118} x2={320} y2={38} stroke={emerald} strokeWidth={2.2} strokeDasharray="6 4" />
            <circle cx={180} cy={78} r={5.5} fill="#06070B" stroke={coral} strokeWidth={2} />
            <text x={194} y={88} fill={coral} fontSize={9.5} fontFamily="JetBrains Mono">Strict &gt; excludes boundary line!</text>
          </g>
        );

      default: {
        const trueCurve = plot((x) => 0.36 * x * x + 0.55 * x + 0.3, -3, 3.2, -2, 5);
        const falseCurve = plot((x) => 0.36 * x * x - 0.85, -3, 3.2, -2, 5);
        return (
          <g>
            <line x1={24} y1={116} x2={336} y2={116} stroke={axisStroke} />
            <line x1={180} y1={16} x2={180} y2={136} stroke={axisStroke} />
            <path d={trueCurve} fill="none" stroke={emerald} strokeWidth={2.3} />
            <path d={falseCurve} fill="none" stroke={coral} strokeWidth={2.1} strokeDasharray="5 3" />
            <line x1={264} y1={42} x2={264} y2={84} stroke={gold} strokeWidth={1.8} />
            <PulseBeacon cx={264} cy={42} color={emerald} />
            <PulseBeacon cx={264} cy={84} color={coral} />
            <text x={272} y={66} fill={starGold} fontSize={9.5} fontFamily="JetBrains Mono">Δ Gap</text>
            <text x={36} y={32} fill={emerald} fontSize={9} fontFamily="JetBrains Mono">TRUE LAW</text>
            <text x={36} y={46} fill={coral} fontSize={9} fontFamily="JetBrains Mono">FALLACY</text>
          </g>
        );
      }
    }
  };

  return (
    <div className="rounded-xl bg-[#06070B] border border-[rgba(244,196,108,0.17)] overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2 border-b border-[rgba(244,196,108,0.14)] bg-[#0B0C12]">
        <span className="font-mono-data text-[10px] uppercase tracking-wider text-[#F7F4EC]">
          Geometric Discrepancy Proof
        </span>
        <div className="flex flex-wrap items-center gap-3 font-mono-data text-[10px]">
          <span className="flex items-center gap-1 text-[#FF8563]">
            <span className="w-2.5 h-0.5 bg-[#FF8563] inline-block" /> {falseLabel}
          </span>
          <span className="flex items-center gap-1 text-[#45E6A6]">
            <span className="w-2.5 h-0.5 bg-[#45E6A6] inline-block" /> {trueLabel}
          </span>
          <button
            type="button"
            onClick={() => setLocalReplay((n) => n + 1)}
            aria-label="Replay misconception proof animation"
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#11131C] border border-[rgba(244,196,108,0.2)] text-[#A8B2C6] hover:text-[#FFE29E] hover:border-[#F4C46C]/50 transition-colors"
          >
            <RotateCcw className="w-2.5 h-2.5" /> Replay Proof
          </button>
        </div>
      </div>
      <svg viewBox={`0 0 ${MW} ${MH}`} className="w-full h-[155px]" role="img" aria-label="Visual misconception comparison">
        <defs>
          <pattern id={gridId} width="24" height="24" patternUnits="userSpaceOnUse">
            <path d="M 24 0 L 0 0 0 24" fill="none" stroke="rgba(244, 196, 108, 0.055)" strokeWidth="1" />
          </pattern>
          <radialGradient id={glowId} cx="50%" cy="50%" r="65%">
            <stop offset="0%" stopColor="rgba(244, 196, 108, 0.07)" />
            <stop offset="100%" stopColor="rgba(6, 7, 11, 0)" />
          </radialGradient>
          <clipPath id={clipId}>
            <motion.rect
              key={`clip-${localReplay}`}
              x={0}
              y={0}
              height={MH}
              initial={reducedMotion ? { width: MW } : { width: 0 }}
              animate={{ width: MW }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            />
          </clipPath>
        </defs>
        <rect x={0} y={0} width={MW} height={MH} fill={`url(#${glowId})`} />
        <rect x={0} y={0} width={MW} height={MH} fill={`url(#${gridId})`} />
        <motion.g
          key={localReplay}
          clipPath={`url(#${clipId})`}
          initial={reducedMotion ? false : { opacity: 0.35 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.55 }}
        >
          {renderGraphic()}
        </motion.g>
        {!reducedMotion && (
          <motion.line
            key={`scan-${localReplay}`}
            y1={8}
            y2={MH - 8}
            stroke={gold}
            strokeWidth={1.5}
            strokeOpacity={0.65}
            initial={{ x1: 0, x2: 0, opacity: 0.9 }}
            animate={{ x1: MW, x2: MW, opacity: 0 }}
            transition={{ duration: 0.92, ease: [0.22, 1, 0.36, 1] }}
          />
        )}
      </svg>
    </div>
  );
}

interface ApplicationVisualProps {
  kind: EquationVisualKind;
  accent: string;
  domainTag: string;
}

export function ApplicationVisual({ kind, accent, domainTag }: ApplicationVisualProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between px-1">
        <span className="font-mono-data text-[10px] uppercase tracking-widest" style={{ color: accent }}>
          Applied Telemetry Schematic
        </span>
        <span className="font-mono-data text-[10px] text-[#A8B2C6]">{domainTag}</span>
      </div>
      <EquationMiniVisual kind={kind} accent={accent} heightClass="h-[168px]" caption={domainTag} />
    </div>
  );
}
