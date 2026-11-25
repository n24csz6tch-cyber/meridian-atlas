import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Pause, Play, RotateCcw, Sparkles } from 'lucide-react';
import { MathTex } from '../../components/MathTex';

export type FormulaMorphPreset = 'quadratic' | 'slope-intercept' | 'log-inverse';

export interface FormulaMorphEngineProps {
  compact?: boolean;
  initialPreset?: FormulaMorphPreset;
}

type TokenTone = 'gold' | 'cyan' | 'emerald' | 'coral' | 'ivory' | 'muted';

type MorphNode =
  | {
      kind: 'sym';
      lid?: string;
      text: string;
      tone?: TokenTone;
      tight?: boolean;
    }
  | {
      kind: 'sup';
      lid?: string;
      base: MorphNode;
      exp: MorphNode;
    }
  | {
      kind: 'sub';
      lid?: string;
      base: MorphNode;
      sub: MorphNode;
    }
  | {
      kind: 'frac';
      lid?: string;
      num: MorphNode;
      den: MorphNode;
    }
  | {
      kind: 'sqrt';
      lid?: string;
      inner: MorphNode;
    }
  | {
      kind: 'group';
      lid?: string;
      children: MorphNode[];
      parens?: boolean;
      tone?: TokenTone;
    };

interface MorphStep {
  id: string;
  label: string;
  badge: string;
  whyTitle: string;
  whyText: string;
  tex: string;
  ast: MorphNode;
}

interface PresetSpec {
  id: FormulaMorphPreset;
  label: string;
  subtitle: string;
  accent: string;
  steps: MorphStep[];
}

const TONE_CLASS: Record<TokenTone, string> = {
  gold: 'text-[#FFE29E] drop-shadow-[0_0_8px_rgba(244,196,108,0.45)]',
  cyan: 'text-[#67E3F3] drop-shadow-[0_0_8px_rgba(70,214,232,0.42)]',
  emerald: 'text-[#5CEFB3] drop-shadow-[0_0_8px_rgba(69,230,166,0.42)]',
  coral: 'text-[#FF9E82] drop-shadow-[0_0_8px_rgba(255,133,99,0.42)]',
  ivory: 'text-[#F7F4EC]',
  muted: 'text-[#A8B2C6]',
};

const sym = (text: string, tone: TokenTone = 'ivory', lid?: string, tight = false): MorphNode => ({
  kind: 'sym',
  text,
  tone,
  lid,
  tight,
});

const sup = (base: MorphNode, exp: MorphNode, lid?: string): MorphNode => ({
  kind: 'sup',
  base,
  exp,
  lid,
});

const sub = (base: MorphNode, subNode: MorphNode, lid?: string): MorphNode => ({
  kind: 'sub',
  base,
  sub: subNode,
  lid,
});

const frac = (num: MorphNode, den: MorphNode, lid?: string): MorphNode => ({
  kind: 'frac',
  num,
  den,
  lid,
});

const sqrtNode = (inner: MorphNode, lid?: string): MorphNode => ({
  kind: 'sqrt',
  inner,
  lid,
});

const grp = (children: MorphNode[], opts?: { lid?: string; parens?: boolean; tone?: TokenTone }): MorphNode => ({
  kind: 'group',
  children,
  lid: opts?.lid,
  parens: opts?.parens,
  tone: opts?.tone,
});

const PRESET_SPECS: Record<FormulaMorphPreset, PresetSpec> = {
  quadratic: {
    id: 'quadratic',
    label: 'Quadratic Formula',
    subtitle: 'Completing the square step by step',
    accent: '#F4C46C',
    steps: [
      {
        id: 'q1',
        label: 'Standard Form',
        badge: 'Step 1',
        whyTitle: 'Spot the Three Coefficients',
        whyText:
          'x is trapped in two places (x² and bx). Keep your eye on coral a, cyan b, and emerald c as they rearrange!',
        tex: 'ax^2 + bx + c = 0',
        ast: grp([
          sym('a', 'coral', 'a1', true),
          sup(sym('x', 'gold', 'x1', true), sym('2', 'ivory', 'sq1', true)),
          sym('+', 'muted', 'plus1'),
          sym('b', 'cyan', 'b1', true),
          sym('x', 'gold', 'x2', true),
          sym('+', 'muted', 'plus2'),
          sym('c', 'emerald', 'c1'),
          sym('=', 'ivory', 'eq'),
          sym('0', 'muted', 'zero'),
        ]),
      },
      {
        id: 'q2',
        label: 'Isolate Constant',
        badge: 'Step 2',
        whyTitle: 'Move c Across the Equals Sign',
        whyText:
          'Subtract c from both sides. The emerald c flies across the = sign and flips into -c so only x-terms stay on the left.',
        tex: 'ax^2 + bx = -c',
        ast: grp([
          sym('a', 'coral', 'a1', true),
          sup(sym('x', 'gold', 'x1', true), sym('2', 'ivory', 'sq1', true)),
          sym('+', 'muted', 'plus1'),
          sym('b', 'cyan', 'b1', true),
          sym('x', 'gold', 'x2', true),
          sym('=', 'ivory', 'eq'),
          sym('−', 'emerald', 'minusC', true),
          sym('c', 'emerald', 'c1'),
        ]),
      },
      {
        id: 'q3',
        label: 'Divide by a',
        badge: 'Step 3',
        whyTitle: 'Make x² Stand Alone',
        whyText:
          'Divide every term by coral a so x² has coefficient 1. Watch a drop underneath b and c!',
        tex: 'x^2 + \\frac{b}{a}x = -\\frac{c}{a}',
        ast: grp([
          sup(sym('x', 'gold', 'x1', true), sym('2', 'ivory', 'sq1', true)),
          sym('+', 'muted', 'plus1'),
          frac(sym('b', 'cyan', 'b1'), sym('a', 'coral', 'a1')),
          sym('x', 'gold', 'x2'),
          sym('=', 'ivory', 'eq'),
          sym('−', 'emerald', 'minusC', true),
          frac(sym('c', 'emerald', 'c1'), sym('a', 'coral', 'a2')),
        ]),
      },
      {
        id: 'q4',
        label: 'Complete Square',
        badge: 'Step 4',
        whyTitle: 'Add (b/2a)² to Both Sides',
        whyText:
          'Take half of b/a and square it: (b/2a)². Adding it to BOTH sides keeps the equation balanced while turning the left into a perfect square!',
        tex: 'x^2 + \\frac{b}{a}x + \\left(\\frac{b}{2a}\\right)^2 = \\left(\\frac{b}{2a}\\right)^2 - \\frac{c}{a}',
        ast: grp([
          sup(sym('x', 'gold', 'x1', true), sym('2', 'ivory', 'sq1', true)),
          sym('+', 'muted', 'plus1'),
          frac(sym('b', 'cyan', 'b1'), sym('a', 'coral', 'a1')),
          sym('x', 'gold', 'x2'),
          sym('+', 'emerald', 'plusSqL'),
          sup(
            grp([frac(sym('b', 'cyan', 'bL'), grp([sym('2', 'ivory', 'twoL', true), sym('a', 'coral', 'aL', true)]))], {
              parens: true,
              tone: 'emerald',
            }),
            sym('2', 'emerald', 'sqL', true)
          ),
          sym('=', 'ivory', 'eq'),
          sup(
            grp([frac(sym('b', 'cyan', 'bR'), grp([sym('2', 'ivory', 'twoR', true), sym('a', 'coral', 'aR', true)]))], {
              parens: true,
              tone: 'emerald',
            }),
            sym('2', 'emerald', 'sqR', true)
          ),
          sym('−', 'emerald', 'minusC', true),
          frac(sym('c', 'emerald', 'c1'), sym('a', 'coral', 'a2')),
        ]),
      },
      {
        id: 'q5',
        label: 'Factor & Merge',
        badge: 'Step 5',
        whyTitle: 'Fold Left & Share Common Denominator 4a²',
        whyText:
          'The left side folds cleanly into (x + b/2a)² so x only appears ONCE! On the right, multiply -c/a by 4a/4a to combine over 4a².',
        tex: '\\left(x + \\frac{b}{2a}\\right)^2 = \\frac{b^2 - 4ac}{4a^2}',
        ast: grp([
          sup(
            grp(
              [
                sym('x', 'gold', 'x1'),
                sym('+', 'muted', 'plus1'),
                frac(sym('b', 'cyan', 'b1'), grp([sym('2', 'ivory', 'twoL', true), sym('a', 'coral', 'a1', true)])),
              ],
              { parens: true }
            ),
            sym('2', 'ivory', 'sq1', true)
          ),
          sym('=', 'ivory', 'eq'),
          frac(
            grp([
              sup(sym('b', 'cyan', 'bR', true), sym('2', 'emerald', 'sqR', true)),
              sym('−', 'muted', 'minusC'),
              sym('4', 'ivory', 'fourR', true),
              sym('a', 'coral', 'a2', true),
              sym('c', 'emerald', 'c1', true),
            ]),
            grp([
              sym('4', 'ivory', 'fourDen', true),
              sup(sym('a', 'coral', 'aR', true), sym('2', 'ivory', 'sqDen', true)),
            ])
          ),
        ]),
      },
      {
        id: 'q6',
        label: 'Square Root',
        badge: 'Step 6',
        whyTitle: 'Unlock the Square with ±√',
        whyText:
          'Take the square root of both sides! Both + and − roots work, and √(4a²) simplifies neatly into 2a in the denominator.',
        tex: 'x + \\frac{b}{2a} = \\frac{\\pm\\sqrt{b^2 - 4ac}}{2a}',
        ast: grp([
          sym('x', 'gold', 'x1'),
          sym('+', 'muted', 'plus1'),
          frac(sym('b', 'cyan', 'b1'), grp([sym('2', 'ivory', 'twoL', true), sym('a', 'coral', 'a1', true)])),
          sym('=', 'ivory', 'eq'),
          frac(
            grp([
              sym('±', 'gold', 'pm'),
              sqrtNode(
                grp([
                  sup(sym('b', 'cyan', 'bR', true), sym('2', 'emerald', 'sqR', true)),
                  sym('−', 'muted', 'minusC'),
                  sym('4', 'ivory', 'fourR', true),
                  sym('a', 'coral', 'a2', true),
                  sym('c', 'emerald', 'c1', true),
                ])
              ),
            ]),
            grp([sym('2', 'ivory', 'twoR', true), sym('a', 'coral', 'aR', true)])
          ),
        ]),
      },
      {
        id: 'q7',
        label: 'Quadratic Formula',
        badge: 'Step 7',
        whyTitle: 'Subtract b/2a — Formula Unlocked!',
        whyText:
          'Slide cyan b across the equals sign to -b. Because both fractions already share denominator 2a, they merge into the Quadratic Formula!',
        tex: 'x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}',
        ast: grp([
          sym('x', 'gold', 'x1'),
          sym('=', 'ivory', 'eq'),
          frac(
            grp([
              sym('−', 'cyan', 'negB', true),
              sym('b', 'cyan', 'b1'),
              sym('±', 'gold', 'pm'),
              sqrtNode(
                grp([
                  sup(sym('b', 'cyan', 'bR', true), sym('2', 'emerald', 'sqR', true)),
                  sym('−', 'muted', 'minusC'),
                  sym('4', 'ivory', 'fourR', true),
                  sym('a', 'coral', 'a2', true),
                  sym('c', 'emerald', 'c1', true),
                ])
              ),
            ]),
            grp([sym('2', 'ivory', 'twoR', true), sym('a', 'coral', 'aR', true)])
          ),
        ]),
      },
    ],
  },

  'slope-intercept': {
    id: 'slope-intercept',
    label: 'Slope-Intercept',
    subtitle: 'Standard linear Ax + By = C to y = mx + b',
    accent: '#46D6E8',
    steps: [
      {
        id: 's1',
        label: 'Standard Line',
        badge: 'Step 1',
        whyTitle: 'Start With Ax + By = C',
        whyText:
          'Standard form puts x and y together on the left. To find the slope and y-intercept instantly, let’s solve for y!',
        tex: 'Ax + By = C',
        ast: grp([
          sym('A', 'gold', 'A1', true),
          sym('x', 'ivory', 'x1'),
          sym('+', 'muted', 'plus1'),
          sym('B', 'cyan', 'B1', true),
          sym('y', 'gold', 'y1'),
          sym('=', 'ivory', 'eq'),
          sym('C', 'emerald', 'C1'),
        ]),
      },
      {
        id: 's2',
        label: 'Move Ax',
        badge: 'Step 2',
        whyTitle: 'Send Ax Across the Equals Sign',
        whyText:
          'Subtract Ax from both sides. Gold A and x glide over to the right and turn into -Ax.',
        tex: 'By = -Ax + C',
        ast: grp([
          sym('B', 'cyan', 'B1', true),
          sym('y', 'gold', 'y1'),
          sym('=', 'ivory', 'eq'),
          sym('−', 'gold', 'negA', true),
          sym('A', 'gold', 'A1', true),
          sym('x', 'ivory', 'x1'),
          sym('+', 'muted', 'plusC'),
          sym('C', 'emerald', 'C1'),
        ]),
      },
      {
        id: 's3',
        label: 'Divide by B',
        badge: 'Step 3',
        whyTitle: 'Isolate y by Dividing by B',
        whyText:
          'Divide the entire right side by cyan B. Now y stands cleanly on the left!',
        tex: 'y = \\frac{-Ax + C}{B}',
        ast: grp([
          sym('y', 'gold', 'y1'),
          sym('=', 'ivory', 'eq'),
          frac(
            grp([
              sym('−', 'gold', 'negA', true),
              sym('A', 'gold', 'A1', true),
              sym('x', 'ivory', 'x1'),
              sym('+', 'muted', 'plusC'),
              sym('C', 'emerald', 'C1'),
            ]),
            sym('B', 'cyan', 'B1')
          ),
        ]),
      },
      {
        id: 's4',
        label: 'Slope & Intercept',
        badge: 'Step 4',
        whyTitle: 'Split Into Slope m and Intercept b',
        whyText:
          'Split the fraction into two pieces: -A/B tells you the steepness (slope m), and +C/B tells you where the line crosses the y-axis!',
        tex: 'y = -\\frac{A}{B}x + \\frac{C}{B}',
        ast: grp([
          sym('y', 'gold', 'y1'),
          sym('=', 'ivory', 'eq'),
          sym('−', 'gold', 'negA', true),
          frac(sym('A', 'gold', 'A1'), sym('B', 'cyan', 'B1')),
          sym('x', 'ivory', 'x1'),
          sym('+', 'muted', 'plusC'),
          frac(sym('C', 'emerald', 'C1'), sym('B', 'cyan', 'B2')),
        ]),
      },
    ],
  },

  'log-inverse': {
    id: 'log-inverse',
    label: 'Log Inverse',
    subtitle: 'Exponential bʸ = x to logarithm & change of base',
    accent: '#45E6A6',
    steps: [
      {
        id: 'l1',
        label: 'Exponential',
        badge: 'Step 1',
        whyTitle: 'Exponent Sitting Up High',
        whyText:
          'Gold base b raised to emerald power y produces cyan output x. Think: 2³ = 8. How do we solve for y when it’s stuck in the exponent?',
        tex: 'b^y = x',
        ast: grp([
          sup(sym('b', 'gold', 'b1', true), sym('y', 'emerald', 'y1', true)),
          sym('=', 'ivory', 'eq'),
          sym('x', 'cyan', 'x1'),
        ]),
      },
      {
        id: 'l2',
        label: 'Apply Inverse',
        badge: 'Step 2',
        whyTitle: 'Use log_b to Undo Base b',
        whyText:
          'Apply log base b to both sides! Just like subtraction undoes addition, log_b is the exact mirror inverse of raising b to a power.',
        tex: '\\log_b(b^y) = \\log_b(x)',
        ast: grp([
          sub(sym('log', 'ivory', 'logL', true), sym('b', 'gold', 'bL', true)),
          sym('(', 'muted', 'lpL', true),
          sup(sym('b', 'gold', 'b1', true), sym('y', 'emerald', 'y1', true)),
          sym(')', 'muted', 'rpL', true),
          sym('=', 'ivory', 'eq'),
          sub(sym('log', 'ivory', 'logR', true), sym('b', 'gold', 'bR', true)),
          sym('(', 'muted', 'lpR', true),
          sym('x', 'cyan', 'x1', true),
          sym(')', 'muted', 'rpR', true),
        ]),
      },
      {
        id: 'l3',
        label: 'Logarithm Form',
        badge: 'Step 3',
        whyTitle: 'Exponent Drops to Ground Level!',
        whyText:
          'log_b and base b cancel each other out, bringing emerald y straight down! So y = log_b(x) simply means: "y is the power that turns b into x."',
        tex: 'y = \\log_b(x)',
        ast: grp([
          sym('y', 'emerald', 'y1'),
          sym('=', 'ivory', 'eq'),
          sub(sym('log', 'ivory', 'logR', true), sym('b', 'gold', 'bR', true)),
          sym('(', 'muted', 'lpR', true),
          sym('x', 'cyan', 'x1', true),
          sym(')', 'muted', 'rpR', true),
        ]),
      },
      {
        id: 'l4',
        label: 'Change of Base',
        badge: 'Step 4',
        whyTitle: 'Compare Growth Speeds via Natural Log',
        whyText:
          'Any logarithm splits into a clean ratio: ln(x) divided by ln(b)! Watch cyan x rise to the numerator and gold base b move into the denominator.',
        tex: 'y = \\frac{\\ln(x)}{\\ln(b)}',
        ast: grp([
          sym('y', 'emerald', 'y1'),
          sym('=', 'ivory', 'eq'),
          frac(
            grp([
              sym('ln', 'ivory', 'lnTop', true),
              sym('(', 'muted', 'lpR', true),
              sym('x', 'cyan', 'x1', true),
              sym(')', 'muted', 'rpR', true),
            ]),
            grp([
              sym('ln', 'ivory', 'lnBot', true),
              sym('(', 'muted', 'lpB', true),
              sym('b', 'gold', 'bR', true),
              sym(')', 'muted', 'rpB', true),
            ])
          ),
        ]),
      },
    ],
  },
};

function MorphExpr({
  node,
  prefix,
  reducedMotion,
}: {
  node: MorphNode;
  prefix: string;
  reducedMotion: boolean;
}): JSX.Element {
  const springTransition = reducedMotion
    ? { duration: 0.04 }
    : { type: 'spring' as const, stiffness: 310, damping: 28, mass: 0.85 };

  if (node.kind === 'sym') {
    const toneCls = TONE_CLASS[node.tone ?? 'ivory'];
    const marginCls = node.tight ? 'px-[1px]' : 'px-[3px] sm:px-1';
    if (node.lid) {
      return (
        <motion.span
          layout
          layoutId={`${prefix}-${node.lid}`}
          initial={reducedMotion ? false : { opacity: 0, scale: 0.72 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={reducedMotion ? undefined : { opacity: 0, scale: 0.72 }}
          transition={springTransition}
          className={`inline-block font-serif-editorial font-semibold leading-none select-none ${toneCls} ${marginCls}`}
        >
          {node.text}
        </motion.span>
      );
    }
    return (
      <span className={`inline-block font-serif-editorial font-semibold leading-none select-none ${toneCls} ${marginCls}`}>
        {node.text}
      </span>
    );
  }

  if (node.kind === 'sup') {
    return (
      <motion.span
        layout="position"
        layoutId={node.lid ? `${prefix}-${node.lid}` : undefined}
        transition={springTransition}
        className="inline-flex items-start"
      >
        <MorphExpr node={node.base} prefix={prefix} reducedMotion={reducedMotion} />
        <span className="inline-block text-[0.58em] -translate-y-[0.42em] leading-none">
          <MorphExpr node={node.exp} prefix={prefix} reducedMotion={reducedMotion} />
        </span>
      </motion.span>
    );
  }

  if (node.kind === 'sub') {
    return (
      <motion.span
        layout="position"
        layoutId={node.lid ? `${prefix}-${node.lid}` : undefined}
        transition={springTransition}
        className="inline-flex items-baseline"
      >
        <MorphExpr node={node.base} prefix={prefix} reducedMotion={reducedMotion} />
        <span className="inline-block text-[0.62em] translate-y-[0.28em] leading-none">
          <MorphExpr node={node.sub} prefix={prefix} reducedMotion={reducedMotion} />
        </span>
      </motion.span>
    );
  }

  if (node.kind === 'frac') {
    return (
      <motion.span
        layout="position"
        layoutId={node.lid ? `${prefix}-${node.lid}` : undefined}
        transition={springTransition}
        className="inline-flex flex-col items-center justify-center align-middle mx-1"
      >
        <span className="px-1.5 pb-0.5 text-[0.82em] leading-tight">
          <MorphExpr node={node.num} prefix={prefix} reducedMotion={reducedMotion} />
        </span>
        <span className="w-full h-[1.5px] bg-[#F4C46C]/70 rounded-full" />
        <span className="px-1.5 pt-0.5 text-[0.82em] leading-tight">
          <MorphExpr node={node.den} prefix={prefix} reducedMotion={reducedMotion} />
        </span>
      </motion.span>
    );
  }

  if (node.kind === 'sqrt') {
    return (
      <motion.span
        layout="position"
        layoutId={node.lid ? `${prefix}-${node.lid}` : undefined}
        transition={springTransition}
        className="inline-flex items-stretch align-middle mx-0.5"
      >
        <span className="text-[#F4C46C] font-serif-editorial text-[1.08em] leading-none pr-0.5 select-none">
          √
        </span>
        <span className="border-t-[1.5px] border-[#F4C46C]/80 pt-0.5 px-1 inline-flex items-center">
          <MorphExpr node={node.inner} prefix={prefix} reducedMotion={reducedMotion} />
        </span>
      </motion.span>
    );
  }

  // Group
  const parenTone = TONE_CLASS[node.tone ?? 'muted'];
  return (
    <motion.span
      layout="position"
      layoutId={node.lid ? `${prefix}-${node.lid}` : undefined}
      transition={springTransition}
      className="inline-flex items-center flex-wrap justify-center gap-y-1"
    >
      {node.parens && <span className={`font-serif-editorial ${parenTone} pr-0.5`}>(</span>}
      {node.children.map((child, idx) => (
        <MorphExpr key={idx} node={child} prefix={prefix} reducedMotion={reducedMotion} />
      ))}
      {node.parens && <span className={`font-serif-editorial ${parenTone} pl-0.5`}>)</span>}
    </motion.span>
  );
}

function LogMirrorDiagram({
  base,
  inputX,
  onBaseChange,
  onInputChange,
}: {
  base: number;
  inputX: number;
  onBaseChange: (val: number) => void;
  onInputChange: (val: number) => void;
}): JSX.Element {
  const w = 280;
  const h = 152;
  const minC = -2.2;
  const maxC = 8.4;

  const mapX = (x: number) => 20 + ((x - minC) / (maxC - minC)) * (w - 36);
  const mapY = (y: number) => h - 16 - ((y - minC) / (maxC - minC)) * (h - 30);

  const buildCurve = (fn: (v: number) => number | null, vStart: number, vEnd: number) => {
    const pts: string[] = [];
    const steps = 90;
    for (let i = 0; i <= steps; i++) {
      const v = vStart + (i / steps) * (vEnd - vStart);
      const y = fn(v);
      if (y === null || !Number.isFinite(y) || y < minC - 0.5 || y > maxC + 0.5) continue;
      pts.push(`${pts.length === 0 ? 'M' : 'L'}${mapX(v).toFixed(1)},${mapY(y).toFixed(1)}`);
    }
    return pts.join(' ');
  };

  const expPath = useMemo(() => buildCurve((t) => Math.pow(base, t), -2.0, 3.2), [base]);
  const logPath = useMemo(() => buildCurve((t) => (t > 0.08 ? Math.log(t) / Math.log(base) : null), 0.1, 8.2), [base]);

  const yLog = Math.log(inputX) / Math.log(base);
  const pxLog = mapX(inputX);
  const pyLog = mapY(yLog);
  const pxExp = mapX(yLog);
  const pyExp = mapY(inputX);

  return (
    <div className="p-3 rounded-xl bg-[#11131C] border border-[rgba(69,230,166,0.22)] space-y-2.5 min-w-0">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="font-mono-data text-[10px] uppercase tracking-[0.14em] text-[#45E6A6]">
          Exponential ↔ Log Mirror
        </span>
        <span className="font-mono-data text-[10px] text-[#A8B2C6]">
          {base.toFixed(1)}
          <sup>{yLog.toFixed(2)}</sup> = {inputX.toFixed(1)} ⇔ log<sub>{base.toFixed(1)}</sub>({inputX.toFixed(1)}) ={' '}
          <span className="text-[#5CEFB3] font-semibold">{yLog.toFixed(2)}</span>
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
        <div className="sm:col-span-7 bg-[#060609] rounded-lg border border-[rgba(244,196,108,0.14)] overflow-hidden">
          <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-36 block">
            {/* Axes */}
            <line x1={mapX(0)} y1={10} x2={mapX(0)} y2={h - 10} stroke="rgba(247,244,236,0.16)" strokeWidth={1} />
            <line x1={12} y1={mapY(0)} x2={w - 12} y2={mapY(0)} stroke="rgba(247,244,236,0.16)" strokeWidth={1} />
            {/* Mirror line y = x */}
            <line
              x1={mapX(-2)}
              y1={mapY(-2)}
              x2={mapX(8)}
              y2={mapY(8)}
              stroke="rgba(244,196,108,0.3)"
              strokeDasharray="4 4"
              strokeWidth={1.1}
            />
            {/* Reflection connector */}
            <line
              x1={pxExp}
              y1={pyExp}
              x2={pxLog}
              y2={pyLog}
              stroke="rgba(69,230,166,0.45)"
              strokeDasharray="3 3"
              strokeWidth={1}
            />
            {/* b^x (gold) */}
            <path d={expPath} fill="none" stroke="#F4C46C" strokeWidth={2.2} strokeLinecap="round" />
            {/* log_b(x) (cyan) */}
            <path d={logPath} fill="none" stroke="#46D6E8" strokeWidth={2.2} strokeLinecap="round" />
            {/* Paired reflection points */}
            <circle cx={pxExp} cy={pyExp} r={4.2} fill="#FFE29E" />
            <circle cx={pxLog} cy={pyLog} r={4.2} fill="#67E3F3" />
            <text x={mapX(7.2)} y={mapY(7.4)} fill="rgba(244,196,108,0.6)" fontSize="8.5" fontFamily="monospace">
              y=x
            </text>
          </svg>
        </div>

        <div className="sm:col-span-5 space-y-2.5 text-xs">
          <label className="block space-y-1">
            <div className="flex justify-between font-mono-data text-[11px]">
              <span className="text-[#F4C46C]">Base b</span>
              <span className="text-[#FFE29E] font-semibold">{base.toFixed(1)}</span>
            </div>
            <input
              type="range"
              min={1.5}
              max={4.0}
              step={0.1}
              value={base}
              onChange={(e) => onBaseChange(parseFloat(e.target.value))}
              className="meridian-slider"
              style={{ ['--slider-accent' as string]: '#F4C46C' }}
            />
          </label>

          <label className="block space-y-1">
            <div className="flex justify-between font-mono-data text-[11px]">
              <span className="text-[#46D6E8]">Value x</span>
              <span className="text-[#67E3F3] font-semibold">{inputX.toFixed(1)}</span>
            </div>
            <input
              type="range"
              min={1.0}
              max={8.0}
              step={0.2}
              value={inputX}
              onChange={(e) => onInputChange(parseFloat(e.target.value))}
              className="meridian-slider"
              style={{ ['--slider-accent' as string]: '#46D6E8' }}
            />
          </label>

          <div className="font-mono-data text-[10px] text-[#A8B2C6] leading-snug">
            Notice how flipping <span className="text-[#FFE29E]">({yLog.toFixed(1)}, {inputX.toFixed(1)})</span> over{' '}
            <span className="text-[#F4C46C]">y=x</span> lands straight on{' '}
            <span className="text-[#67E3F3]">({inputX.toFixed(1)}, {yLog.toFixed(1)})</span>!
          </div>
        </div>
      </div>
    </div>
  );
}

export function FormulaMorphEngine({
  compact = false,
  initialPreset = 'quadratic',
}: {
  compact?: boolean;
  initialPreset?: FormulaMorphPreset;
} = {}): JSX.Element {
  const reducedMotion = Boolean(useReducedMotion());
  const rawUid = useId();
  const uid = rawUid.replace(/:/g, '');

  const [preset, setPreset] = useState<FormulaMorphPreset>(initialPreset);
  const [stepIndex, setStepIndex] = useState(0);
  const [autoMorph, setAutoMorph] = useState(true);
  const [isVisible, setIsVisible] = useState(true);
  const [logBase, setLogBase] = useState(2.0);
  const [logInputX, setLogInputX] = useState(8.0);

  const hostRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setPreset(initialPreset);
    setStepIndex(0);
  }, [initialPreset]);

  const spec = PRESET_SPECS[preset];
  const steps = spec.steps;
  const clampedStepIdx = Math.min(stepIndex, steps.length - 1);
  const activeStep = steps[clampedStepIdx];

  // Observe visibility so offscreen auto-morphing pauses gracefully
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
      { rootMargin: '100px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Auto-Morph choreography timer
  useEffect(() => {
    if (!autoMorph || !isVisible) return;
    const timer = window.setInterval(() => {
      setStepIndex((prev) => (prev + 1) % steps.length);
    }, 2900);
    return () => window.clearInterval(timer);
  }, [autoMorph, isVisible, steps.length]);

  const selectPreset = (nextPreset: FormulaMorphPreset) => {
    setPreset(nextPreset);
    setStepIndex(0);
  };

  const goPrev = () => {
    setAutoMorph(false);
    setStepIndex((prev) => Math.max(0, prev - 1));
  };

  const goNext = () => {
    setAutoMorph(false);
    setStepIndex((prev) => Math.min(steps.length - 1, prev + 1));
  };

  const layoutPrefix = `${uid}-${preset}`;

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
            style={{ backgroundColor: spec.accent, boxShadow: `0 0 10px ${spec.accent}` }}
          />
          <span className="font-mono-data text-[10px] uppercase tracking-[0.16em] text-[#F4C46C] truncate">
            Kinetic Algebra Morph Stage
          </span>
          <span className="hidden sm:inline font-mono-data text-[10px] px-2 py-0.5 rounded bg-[#11131C] border border-[rgba(244,196,108,0.18)] text-[#A8B2C6]">
            {clampedStepIdx + 1} / {steps.length}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setAutoMorph((v) => !v)}
            aria-label={autoMorph ? 'Pause auto-morph' : 'Play auto-morph'}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-mono-data border transition-colors ${
              autoMorph
                ? 'border-[#F4C46C]/55 bg-[#F4C46C]/15 text-[#FFE29E]'
                : 'border-[rgba(244,196,108,0.22)] bg-[#11131C] text-[#F7F4EC]'
            }`}
          >
            {autoMorph ? <Pause className="w-3 h-3 text-[#F4C46C]" /> : <Play className="w-3 h-3 text-[#F4C46C]" />}
            <span>{autoMorph ? 'Auto-Morph' : 'Paused'}</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setStepIndex(0);
              setAutoMorph(true);
            }}
            aria-label="Restart morph sequence"
            className="p-1.5 rounded border border-[rgba(244,196,108,0.18)] bg-[#11131C] text-[#A8B2C6] hover:text-[#F7F4EC]"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Preset Switcher Pills */}
      <div className="px-4 py-2.5 bg-[#0B0C12]/70 border-b hairline-rule flex flex-wrap items-center justify-between gap-2 min-w-0">
        <div className="flex flex-wrap gap-1.5 min-w-0">
          {(Object.values(PRESET_SPECS) as PresetSpec[]).map((item) => {
            const active = item.id === preset;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => selectPreset(item.id)}
                className={`px-2.5 py-1 rounded-full text-[11px] font-mono-data border transition-all ${
                  active
                    ? 'text-[#060609] font-semibold'
                    : 'bg-[#11131C] border-[rgba(244,196,108,0.18)] text-[#A8B2C6] hover:text-[#F7F4EC]'
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

        <span className="hidden md:inline font-mono-data text-[10px] text-[#727D94]">
          {spec.subtitle}
        </span>
      </div>

      {/* Kinetic Equation Stage */}
      <div className="p-4 sm:p-6 space-y-4 bg-[#060609] min-w-0">
        <div className="relative rounded-2xl border border-[rgba(244,196,108,0.22)] bg-[radial-gradient(ellipse_at_center,rgba(244,196,108,0.08)_0%,rgba(6,6,9,0.98)_72%)] px-3 sm:px-6 py-6 sm:py-9 flex flex-col items-center justify-center min-h-[144px] sm:min-h-[176px] min-w-0 overflow-x-auto">
          <div className="absolute top-2.5 left-3 flex items-center gap-1.5 font-mono-data text-[10px] text-[#F4C46C]">
            <Sparkles className="w-3 h-3" />
            <span>{activeStep.badge} · {activeStep.label}</span>
          </div>

          <LayoutGroup id={layoutPrefix}>
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.div
                key={`${preset}-${activeStep.id}`}
                initial={reducedMotion ? false : { opacity: 0.85 }}
                animate={{ opacity: 1 }}
                exit={reducedMotion ? undefined : { opacity: 0.85 }}
                transition={{ duration: reducedMotion ? 0.04 : 0.25 }}
                className="text-xl sm:text-3xl md:text-[2.15rem] tracking-tight flex flex-wrap items-center justify-center pt-4 max-w-full"
              >
                <MorphExpr
                  node={activeStep.ast}
                  prefix={layoutPrefix}
                  reducedMotion={reducedMotion}
                />
              </motion.div>
            </AnimatePresence>
          </LayoutGroup>

          <div className="mt-4 pt-2 border-t border-[rgba(244,196,108,0.12)] w-full flex justify-center overflow-x-auto">
            <MathTex tex={activeStep.tex} className="text-xs text-[#727D94]" />
          </div>
        </div>

        {/* Clickable Step Progress Bar + Prev / Next */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 min-w-0">
          <button
            type="button"
            onClick={goPrev}
            disabled={clampedStepIdx === 0}
            aria-label="Previous step"
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-mono-data border border-[rgba(244,196,108,0.2)] bg-[#11131C] text-[#F7F4EC] disabled:opacity-35 disabled:cursor-not-allowed hover:border-[#F4C46C]/50"
          >
            <ChevronLeft className="w-3.5 h-3.5 text-[#F4C46C]" />
            <span>Prev</span>
          </button>

          <div className="flex-1 flex items-center gap-1.5 min-w-[140px]">
            {steps.map((step, idx) => {
              const isCurrent = idx === clampedStepIdx;
              const isPassed = idx < clampedStepIdx;
              return (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => {
                    setAutoMorph(false);
                    setStepIndex(idx);
                  }}
                  aria-label={`Jump to ${step.badge}: ${step.label}`}
                  title={`${step.badge}: ${step.label}`}
                  className="group flex-1 py-1.5 flex flex-col items-center gap-1 min-w-0"
                >
                  <span
                    className={`w-full h-1.5 rounded-full transition-all ${
                      isCurrent
                        ? 'shadow-[0_0_10px_rgba(244,196,108,0.7)]'
                        : isPassed
                          ? 'opacity-65'
                          : 'bg-[#1A1D29] group-hover:bg-[#2A2F42]'
                    }`}
                    style={
                      isCurrent || isPassed
                        ? { backgroundColor: spec.accent }
                        : undefined
                    }
                  />
                  {!compact && (
                    <span
                      className={`hidden sm:block font-mono-data text-[9px] truncate max-w-full ${
                        isCurrent ? 'text-[#FFE29E]' : 'text-[#727D94] group-hover:text-[#A8B2C6]'
                      }`}
                    >
                      {step.label}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={goNext}
            disabled={clampedStepIdx === steps.length - 1}
            aria-label="Next step"
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-mono-data border border-[rgba(244,196,108,0.2)] bg-[#11131C] text-[#F7F4EC] disabled:opacity-35 disabled:cursor-not-allowed hover:border-[#F4C46C]/50"
          >
            <span>Next</span>
            <ChevronRight className="w-3.5 h-3.5 text-[#F4C46C]" />
          </button>
        </div>

        {/* What Just Moved & Why Caption */}
        <div className="p-3.5 rounded-xl bg-[#0B0C12] border border-[rgba(244,196,108,0.18)] space-y-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="font-mono-data text-[10px] uppercase tracking-[0.14em] text-[#F4C46C]">
              What Just Moved &amp; Why · {activeStep.whyTitle}
            </span>
          </div>
          <p className="text-xs sm:text-[13px] text-[#D7DFEE] leading-relaxed">
            {activeStep.whyText}
          </p>
        </div>

        {/* Log Inverse Live Mirror Visualization (shown cleanly in full mode or on log-inverse preset) */}
        {!compact && preset === 'log-inverse' && (
          <LogMirrorDiagram
            base={logBase}
            inputX={logInputX}
            onBaseChange={setLogBase}
            onInputChange={setLogInputX}
          />
        )}
      </div>
    </div>
  );
}

export default FormulaMorphEngine;
