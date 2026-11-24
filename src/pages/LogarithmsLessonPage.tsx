import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Orbit,
  Pause,
  Play,
  Sparkles,
} from 'lucide-react';
import { AtlasShell } from '../components/AtlasShell';
import { LessonNavHeader } from '../components/LessonNavHeader';
import { MathTex } from '../components/MathTex';
import { PracticeEngine, PracticeQuestion } from '../components/PracticeEngine';
import { CURRICULUM_NODES } from '../data/curriculumGraph';
import { CONSULTED_DATE, VERIFIED_STANDARDS } from '../data/standards';
import { EquationMiniVisual } from '../visuals/equations/EquationMiniVisual';
import { DerivationStepVisual } from '../visuals/equations/LessonLayerVisuals';
import { LogarithmLab } from '../visuals/logarithms/LogarithmLab';

const LOG_WORKED_STEPS = [
  {
    title: 'Step 1 · Condense the Left Side via Product Law',
    tex: '\\log_2(x) + \\log_2(x - 2) = 3 \\implies \\log_2\\!\\big(x(x - 2)\\big) = 3',
    note: 'Addition of logarithms sharing base 2 combines into multiplication inside one log.',
  },
  {
    title: 'Step 2 · Rewrite in Inverse Exponential Form',
    tex: 'x(x - 2) = 2^3 \\implies x^2 - 2x = 8',
    note: 'Apply the mirror definition log_b(A) = C ⟺ b^C = A to eliminate the logarithm.',
  },
  {
    title: 'Step 3 · Solve the Resulting Quadratic',
    tex: 'x^2 - 2x - 8 = 0 \\implies (x - 4)(x + 2) = 0 \\implies x = 4 \\text{ or } x = -2',
    note: 'Factoring reveals two candidate algebraic solutions.',
  },
  {
    title: 'Step 4 · Audit Domain & Reject Extraneous Root',
    tex: 'x > 2 \\implies x = 4 \\; (\\text{valid}), \\quad x = -2 \\; (\\text{rejected})',
    note: 'Logarithm arguments must stay strictly positive: log₂(−2) lies outside ℝ.',
  },
];

const LOG_PRACTICE: PracticeQuestion[] = [
  {
    id: 'log-1',
    prompt: 'Evaluate the exact base-2 logarithm:',
    promptTex: '\\log_2(32) = \\text{?}',
    type: 'numeric',
    correctAnswer: 5,
    tolerance: 0.01,
    hint: 'Ask: what exponent must 2 be raised to in order to reach 32?',
    solutionSteps: [
      { label: 'Exponential Equivalence', tex: '2^y = 32', note: 'Rewrite log equation.' },
      { label: 'Power Identity', tex: '2^5 = 32 \\implies y = 5', note: 'Exact integer exponent.' },
    ],
  },
  {
    id: 'log-2',
    prompt: 'Which expression is equivalent after fully expanding using Logarithm Laws?',
    promptTex: '\\log_3\\!\\left(\\dfrac{x^4}{y^2}\\right)',
    type: 'multiple-choice',
    options: [
      { id: 'a', label: 'Expanded form A', tex: '4\\log_3(x) - 2\\log_3(y)' },
      { id: 'b', label: 'Expanded form B', tex: '4\\log_3(x) + 2\\log_3(y)' },
      { id: 'c', label: 'Expanded form C', tex: '\\dfrac{4\\log_3(x)}{2\\log_3(y)}' },
      { id: 'd', label: 'Expanded form D', tex: '2\\log_3(x - y)' },
    ],
    correctAnswer: 'a',
    hint: 'Quotients turn into subtraction, and powers drop down as coefficients.',
    solutionSteps: [
      {
        label: 'Quotient Rule',
        tex: '\\log_3(x^4) - \\log_3(y^2)',
        note: 'Division inside argument becomes subtraction.',
      },
      {
        label: 'Power Rule',
        tex: '4\\log_3(x) - 2\\log_3(y)',
        note: 'Exponents move forward as scalars.',
      },
    ],
  },
  {
    id: 'log-3',
    prompt: 'Solve for the valid real solution x (check domain x > 3):',
    promptTex: '\\log_{10}(x - 3) = 2',
    type: 'numeric',
    correctAnswer: 103,
    tolerance: 0.01,
    hint: 'Raise base 10 to the power 2, then solve x − 3 = 100.',
    solutionSteps: [
      { label: 'Exponentiate', tex: 'x - 3 = 10^2 = 100', note: 'Inverse base-10 exponential.' },
      { label: 'Solve & Verify Domain', tex: 'x = 103 \\quad (103 - 3 > 0)', note: 'Argument positive.' },
    ],
  },
  {
    id: 'log-4',
    prompt: 'Solve log₂(x) + log₂(x − 6) = 4. Enter ONLY the valid non-extraneous root.',
    promptTex: '\\log_2(x) + \\log_2(x - 6) = 4',
    type: 'numeric',
    correctAnswer: 8,
    tolerance: 0.01,
    hint: 'Condense to x(x − 6) = 16, factor, and discard the negative root.',
    solutionSteps: [
      { label: 'Condense & Exponentiate', tex: 'x^2 - 6x = 2^4 = 16', note: 'Product rule.' },
      { label: 'Factor & Check', tex: '(x - 8)(x + 2) = 0 \\implies x = 8', note: 'x = −2 violates x > 6.' },
    ],
  },
];

const STD_CODES = ['MA.912.AR.5.2', 'MA.912.AR.5.9'];

export function LogarithmsLessonPage() {
  const reducedMotion = useReducedMotion();
  const [stepIdx, setStepIdx] = useState(0);
  const [autoPlaySteps, setAutoPlaySteps] = useState(false);
  const [trapX, setTrapX] = useState(4);
  const [trapY, setTrapY] = useState(4);
  const [magDelta, setMagDelta] = useState(2.0);

  useEffect(() => {
    if (!autoPlaySteps) return;
    const timer = window.setInterval(() => {
      setStepIdx((prev) => (prev + 1) % LOG_WORKED_STEPS.length);
    }, 2800);
    return () => window.clearInterval(timer);
  }, [autoPlaySteps]);

  const trueSumVal = Math.log2(trapX + trapY);
  const falseSplitVal = Math.log2(trapX) + Math.log2(trapY);
  const ampRatio = Math.pow(10, magDelta);
  const energyRatio = Math.pow(10, 1.5 * magDelta);

  const alg2Nodes = CURRICULUM_NODES.filter((n) => n.courseId === 'algebra-2');
  const idx = alg2Nodes.findIndex((n) => n.id === 'a2-logarithms');
  const nextNode = alg2Nodes[(idx + 1) % alg2Nodes.length];
  const stepPct = Math.round(((stepIdx + 1) / LOG_WORKED_STEPS.length) * 100);

  return (
    <AtlasShell activeCourse="algebra-2">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-12">
        <LessonNavHeader courseId="algebra-2" activeNodeId="a2-logarithms" code="A2-04" />

        <header className="instrument-frame fiducial-frame p-6 sm:p-7 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="font-mono-data text-[11px] uppercase tracking-[0.2em] text-[#45E6A6]">
              Algebra 2 Flagship · Inverse Reflection &amp; Scaling Observatory
            </span>
            <div className="flex flex-wrap items-center gap-2 font-mono-data text-[11px]">
              <Link
                to="/textbook"
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#F4C46C]/25 bg-[#0B0C12] text-[#FFE29E] hover:border-[#F4C46C]/55 transition-colors"
              >
                <BookOpen className="w-3 h-3 text-[#F4C46C]" /> FL Textbook
              </Link>
              <Link
                to="/frontier"
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#F4C46C]/25 bg-[#0B0C12] text-[#F4C46C] hover:border-[#FFE29E]/55 transition-colors"
              >
                <Orbit className="w-3 h-3" /> String 3D
              </Link>
            </div>
          </div>

          <h1 className="font-serif-editorial text-4xl sm:text-5xl text-[#F7F4EC] leading-tight">
            Logarithms, Inverse Reflections &amp; Structural Expansion Laws
          </h1>
          <p className="text-sm sm:text-base text-[#A8B2C6] leading-relaxed max-w-4xl">
            A logarithm is not a mysterious button — it is literally the reflection of exponential
            growth across <MathTex tex="y = x" className="text-[#45E6A6]" />, asking{' '}
            <em>&ldquo;What exponent produces this output?&rdquo;</em>
          </p>
        </header>

        {/* LAYER 1: VISUAL INTUITION */}
        <section id="layer-1" className="space-y-4 scroll-mt-24">
          <span className="font-mono-data text-[11px] uppercase tracking-widest text-[#45E6A6]">
            Layer 01 · Visual Intuition &amp; Animated Laws
          </span>
          <LogarithmLab />
        </section>

        {/* LAYER 2: MATHEMATICAL FORMALIZATION */}
        <section id="layer-2" className="space-y-4 scroll-mt-24">
          <div>
            <span className="font-mono-data text-[11px] uppercase tracking-widest text-[#45E6A6]">
              Layer 02 · Visualized Formal Axioms &amp; Identity Rules
            </span>
            <h2 className="font-serif-editorial text-2xl sm:text-3xl text-[#F7F4EC]">
              Logarithm Laws Paired With Geometric Reflection
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="instrument-frame p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-mono-data text-[10px] uppercase text-[#F4C46C]">
                  Inverse Equivalence
                </span>
                <span className="font-mono-data text-[9px] text-[#727D94]">EQ 01</span>
              </div>
              <div aria-label="Logarithm inverse mirror across y = x">
                <EquationMiniVisual kind="log-reflection" accent="#45E6A6" heightClass="h-[112px]" />
              </div>
              <div className="instrument-panel px-2.5 py-2 overflow-x-auto">
                <MathTex tex="y = \log_b(x) \iff b^y = x" displayMode className="text-[#F7F4EC]" />
              </div>
              <p className="text-xs text-[#A8B2C6]">
                Defined over real numbers for <MathTex tex="x > 0, \; b > 0, \; b \ne 1" />.
              </p>
            </div>
            <div className="instrument-frame p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-mono-data text-[10px] uppercase text-[#45E6A6]">
                  Product Law
                </span>
                <span className="font-mono-data text-[9px] text-[#727D94]">EQ 02</span>
              </div>
              <div aria-label="Exponent product law diagram">
                <EquationMiniVisual kind="exponent-product" accent="#45E6A6" heightClass="h-[112px]" />
              </div>
              <div className="instrument-panel px-2.5 py-2 overflow-x-auto">
                <MathTex tex="\log_b(MN) = \log_b M + \log_b N" displayMode className="text-[#F7F4EC]" />
              </div>
              <p className="text-xs text-[#A8B2C6]">
                Multiplying exponential outputs corresponds to adding their exponents.
              </p>
            </div>
            <div className="instrument-frame p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-mono-data text-[10px] uppercase text-[#FF8563]">
                  Quotient Law
                </span>
                <span className="font-mono-data text-[9px] text-[#727D94]">EQ 03</span>
              </div>
              <div aria-label="Quotient decay law diagram">
                <EquationMiniVisual kind="exp-decay" accent="#FF8563" heightClass="h-[112px]" />
              </div>
              <div className="instrument-panel px-2.5 py-2 overflow-x-auto">
                <MathTex tex="\log_b\!\left(\frac{M}{N}\right) = \log_b M - \log_b N" displayMode className="text-[#F7F4EC]" />
              </div>
              <p className="text-xs text-[#A8B2C6]">
                Dividing bases subtracts exponents inside the logarithmic domain.
              </p>
            </div>
            <div className="instrument-frame p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-mono-data text-[10px] uppercase text-[#46D6E8]">
                  Power &amp; Change of Base
                </span>
                <span className="font-mono-data text-[9px] text-[#727D94]">EQ 04</span>
              </div>
              <div aria-label="Inverse mirror scaling diagram">
                <EquationMiniVisual kind="inverse-mirror" accent="#46D6E8" heightClass="h-[112px]" />
              </div>
              <div className="instrument-panel px-2.5 py-2 overflow-x-auto">
                <MathTex tex="\log_b(M^p) = p\log_b M" displayMode className="text-[#F7F4EC]" />
              </div>
              <p className="text-xs text-[#A8B2C6]">
                Also <MathTex tex="\log_b x = \frac{\ln x}{\ln b}" /> connects all bases smoothly.
              </p>
            </div>
          </div>
        </section>

        {/* LAYER 3: GUIDED WORKED EXAMPLE */}
        <section id="layer-3" className="instrument-frame fiducial-frame p-5 sm:p-6 space-y-5 scroll-mt-24">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <span className="font-mono-data text-[11px] uppercase tracking-widest text-[#45E6A6] block">
                Layer 03 · Synchronized Guided Step-by-Step Solver
              </span>
              <h2 className="font-serif-editorial text-2xl sm:text-3xl text-[#F7F4EC]">
                Solving <MathTex tex="\log_2(x) + \log_2(x - 2) = 3" />
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setAutoPlaySteps(false);
                  setStepIdx((prev) => (prev - 1 + LOG_WORKED_STEPS.length) % LOG_WORKED_STEPS.length);
                }}
                aria-label="Previous logarithm step"
                className="p-1.5 rounded-full border border-[#F4C46C]/25 bg-[#0B0C12] text-[#A8B2C6] hover:text-[#F7F4EC] hover:border-[#F4C46C]/50 transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setAutoPlaySteps((p) => !p)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-mono-data border transition-all"
                style={{
                  borderColor: autoPlaySteps ? '#45E6A6' : 'rgba(244, 196, 108, 0.28)',
                  backgroundColor: autoPlaySteps ? 'rgba(69, 230, 166, 0.18)' : '#0B0C12',
                  color: autoPlaySteps ? '#45E6A6' : '#F7F4EC',
                }}
              >
                {autoPlaySteps ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                {autoPlaySteps ? 'Pause Walkthrough' : 'Auto-Play Steps'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setAutoPlaySteps(false);
                  setStepIdx((prev) => (prev + 1) % LOG_WORKED_STEPS.length);
                }}
                aria-label="Next logarithm step"
                className="p-1.5 rounded-full border border-[#F4C46C]/25 bg-[#0B0C12] text-[#A8B2C6] hover:text-[#F7F4EC] hover:border-[#F4C46C]/50 transition-colors"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="h-1 w-full rounded-full bg-[#060609] border border-[#F4C46C]/15 overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{
                background: 'linear-gradient(90deg, #F4C46C, #45E6A6)',
                boxShadow: '0 0 10px #45E6A6',
              }}
              initial={false}
              animate={{ width: `${stepPct}%` }}
              transition={reducedMotion ? { duration: 0 } : { type: 'spring', stiffness: 260, damping: 28 }}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            <div className="lg:col-span-7 space-y-3">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {LOG_WORKED_STEPS.map((st, idxStep) => (
                  <button
                    key={st.title}
                    type="button"
                    onClick={() => {
                      setAutoPlaySteps(false);
                      setStepIdx(idxStep);
                    }}
                    className={`p-3 rounded-xl text-left border transition-all ${
                      stepIdx === idxStep
                        ? 'bg-[#45E6A6]/12 border-[#45E6A6] text-[#F7F4EC]'
                        : 'bg-[#0B0C12] border-[#F4C46C]/16 text-[#A8B2C6] hover:text-[#F7F4EC] hover:border-[#F4C46C]/40'
                    }`}
                  >
                    <span className="font-mono-data text-[10px] text-[#45E6A6] block">
                      STEP 0{idxStep + 1}
                    </span>
                    <span className="text-xs font-medium">{st.title.replace(/^Step \d+ · /, '')}</span>
                  </button>
                ))}
              </div>

              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={stepIdx}
                  initial={reducedMotion ? false : { opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={reducedMotion ? undefined : { opacity: 0, x: -10 }}
                  transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                  className="instrument-panel p-5 space-y-2"
                >
                  <p className="font-mono-data text-xs text-[#45E6A6]">{LOG_WORKED_STEPS[stepIdx].title}</p>
                  <div className="py-1 overflow-x-auto">
                    <MathTex tex={LOG_WORKED_STEPS[stepIdx].tex} displayMode className="text-[#F7F4EC]" />
                  </div>
                  <p className="text-xs text-[#A8B2C6]">{LOG_WORKED_STEPS[stepIdx].note}</p>
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="lg:col-span-5">
              <DerivationStepVisual
                visualKinds={['log-product', 'log-reflection', 'parabola-vertex', 'radical-curve']}
                stepIndex={stepIdx}
                totalSteps={LOG_WORKED_STEPS.length}
                stepTitle={LOG_WORKED_STEPS[stepIdx].title}
                accent="#45E6A6"
              />
            </div>
          </div>
        </section>

        {/* LAYER 4: PRACTICE ENGINE */}
        <section id="layer-4" className="space-y-4 scroll-mt-24">
          <div>
            <span className="font-mono-data text-[11px] uppercase tracking-widest text-[#45E6A6]">
              Layer 04 · Interactive Check &amp; Step Solutions
            </span>
            <h2 className="font-serif-editorial text-2xl sm:text-3xl text-[#F7F4EC]">
              Solve Logarithmic Equations &amp; Audit Extraneous Roots
            </h2>
          </div>
          <PracticeEngine
            questions={LOG_PRACTICE}
            accentColor="#45E6A6"
            visualKinds={['log-reflection', 'log-quotient', 'log-product', 'log-power']}
          />
        </section>

        {/* LAYER 5: COMMON MISCONCEPTION VISUALIZED */}
        <motion.section
          id="layer-5"
          initial={reducedMotion ? false : { opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="instrument-frame p-5 sm:p-6 space-y-5 border-[#FF8563]/40 scroll-mt-24"
        >
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-[#FF8563] shrink-0 mt-0.5" />
            <div>
              <span className="font-mono-data text-[11px] uppercase tracking-widest text-[#FF8563] block">
                Layer 05 · Typical Error Visualized — The Sum-Split Trap
              </span>
              <h2 className="font-serif-editorial text-2xl sm:text-3xl text-[#F7F4EC]">
                Why <MathTex tex="\log_2(x + y) \ne \log_2(x) + \log_2(y)" />
              </h2>
              <p className="text-xs text-[#A8B2C6] mt-1">
                Logarithms distribute over multiplication, never addition. Test numeric values below
                to watch the two bars diverge sharply:
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-center">
            <div className="space-y-4">
              <label className="block space-y-1 text-xs">
                <span className="flex justify-between font-mono-data text-[#A8B2C6]">
                  <span>Input x</span>
                  <span className="text-[#45E6A6]">{trapX}</span>
                </span>
                <input
                  type="range"
                  min={1}
                  max={16}
                  step={1}
                  value={trapX}
                  onChange={(e) => setTrapX(Number(e.target.value))}
                  className="meridian-slider"
                  style={{ ['--slider-accent' as string]: '#45E6A6' }}
                />
              </label>

              <label className="block space-y-1 text-xs">
                <span className="flex justify-between font-mono-data text-[#A8B2C6]">
                  <span>Input y</span>
                  <span className="text-[#46D6E8]">{trapY}</span>
                </span>
                <input
                  type="range"
                  min={1}
                  max={16}
                  step={1}
                  value={trapY}
                  onChange={(e) => setTrapY(Number(e.target.value))}
                  className="meridian-slider"
                  style={{ ['--slider-accent' as string]: '#46D6E8' }}
                />
              </label>
            </div>

            <div className="instrument-panel p-4 space-y-3 font-mono-data text-xs">
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-[#45E6A6]">
                    TRUE: log₂({trapX} + {trapY}) = log₂({trapX + trapY})
                  </span>
                  <span className="text-[#F7F4EC]">{trueSumVal.toFixed(3)}</span>
                </div>
                <div className="h-2.5 rounded-full bg-[#060609] overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-[#45E6A6]"
                    initial={false}
                    animate={{ width: `${Math.min(100, (trueSumVal / 8) * 100)}%` }}
                    transition={reducedMotion ? { duration: 0 } : { type: 'spring', stiffness: 260, damping: 24 }}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-[#FF8563]">
                    FALSE TRAP: log₂({trapX}) + log₂({trapY}) = log₂({trapX * trapY})
                  </span>
                  <span className="text-[#FF8563]">{falseSplitVal.toFixed(3)}</span>
                </div>
                <div className="h-2.5 rounded-full bg-[#060609] overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-[#FF8563]"
                    initial={false}
                    animate={{ width: `${Math.min(100, (falseSplitVal / 8) * 100)}%` }}
                    transition={reducedMotion ? { duration: 0 } : { type: 'spring', stiffness: 260, damping: 24 }}
                  />
                </div>
              </div>

              <div className="text-[11px] text-[#A8B2C6] flex items-center gap-1.5 pt-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#45E6A6] shrink-0" />
                <span>
                  Adding logs secretly multiplies {trapX} × {trapY} = {trapX * trapY}, not{' '}
                  {trapX + trapY}.
                </span>
              </div>
            </div>
          </div>
        </motion.section>

        {/* LAYER 6: REAL-WORLD APPLICATION */}
        <section id="layer-6" className="instrument-frame p-5 sm:p-6 space-y-4 scroll-mt-24">
          <span className="font-mono-data text-[11px] uppercase tracking-widest text-[#F4C46C] block">
            Layer 06 · Real-World Application — Seismic Moment Magnitude Scale
          </span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div className="space-y-3">
              <h2 className="font-serif-editorial text-2xl text-[#F7F4EC]">
                Why +1.0 Magnitude Equals 31.6× More Energy
              </h2>
              <p className="text-xs sm:text-sm text-[#A8B2C6] leading-relaxed">
                Earthquake scales compress spans from tiny tremors to megathrust quakes using
                common base-10 logarithms. A step of <MathTex tex="\Delta M" /> scales wave amplitude
                by <MathTex tex="10^{\Delta M}" /> and radiated seismic energy by{' '}
                <MathTex tex="10^{1.5\,\Delta M}" />.
              </p>
              <label className="block space-y-1 text-xs">
                <span className="flex justify-between font-mono-data text-[#A8B2C6]">
                  <span>Magnitude Difference ΔM</span>
                  <span className="text-[#F4C46C]">+{magDelta.toFixed(1)} M</span>
                </span>
                <input
                  type="range"
                  min={0.5}
                  max={3.5}
                  step={0.1}
                  value={magDelta}
                  onChange={(e) => setMagDelta(Number(e.target.value))}
                  className="meridian-slider"
                  style={{ ['--slider-accent' as string]: '#F4C46C' }}
                />
              </label>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="instrument-panel p-4 space-y-1">
                <span className="font-mono-data text-[10px] text-[#A8B2C6] uppercase">
                  Seismograph Amplitude Ratio
                </span>
                <span className="font-mono-data text-2xl text-[#45E6A6] block">
                  {ampRatio.toLocaleString(undefined, { maximumFractionDigits: 1 })}×
                </span>
                <span className="font-mono-data text-[10px] text-[#727D94]">10^(ΔM)</span>
              </div>
              <div className="instrument-panel p-4 space-y-1">
                <span className="font-mono-data text-[10px] text-[#A8B2C6] uppercase">
                  Radiated Energy Multiplier
                </span>
                <span className="font-mono-data text-2xl text-[#F4C46C] block">
                  {energyRatio.toLocaleString(undefined, { maximumFractionDigits: 0 })}×
                </span>
                <span className="font-mono-data text-[10px] text-[#727D94]">10^(1.5·ΔM)</span>
              </div>
            </div>
          </div>
        </section>

        {/* LAYER 7: VERIFIED FLORIDA B.E.S.T. STANDARDS + NEXT LESSON */}
        <section id="layer-7" className="instrument-frame p-5 sm:p-6 space-y-5 scroll-mt-24">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="font-mono-data text-[10px] uppercase tracking-[0.18em] text-[#45E6A6] block">
              Layer 07 · Verified Florida B.E.S.T. Standards (Consulted {CONSULTED_DATE})
            </span>
            <Link
              to="/textbook"
              className="inline-flex items-center gap-1.5 font-mono-data text-[11px] text-[#FFE29E] hover:underline"
            >
              <BookOpen className="w-3.5 h-3.5 text-[#F4C46C]" /> View in FL Textbook Hub
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {STD_CODES.map((code) => {
              const s = VERIFIED_STANDARDS[code];
              if (!s) return null;
              return (
                <div key={code} className="instrument-panel p-4 space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono-data text-xs text-[#45E6A6]">{s.code}</span>
                    <a
                      href={s.sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-mono-data text-[#A8B2C6] hover:text-[#FFE29E]"
                    >
                      {s.sourceLabel} <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <p className="text-xs text-[#F7F4EC] leading-relaxed">{s.description}</p>
                </div>
              );
            })}
          </div>

          {nextNode && (
            <div className="pt-4 border-t hairline-rule flex flex-wrap items-center justify-between gap-3">
              <div className="text-xs text-[#A8B2C6]">
                <span className="font-mono-data text-[10px] uppercase text-[#727D94] block">
                  Continue Algebra 2 Sequence
                </span>
                <strong className="text-[#F7F4EC] font-serif-editorial text-lg">
                  {nextNode.code} · {nextNode.title}
                </strong>
              </div>
              <div className="flex flex-wrap items-center gap-2.5">
                <Link
                  to="/frontier"
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full text-xs font-mono-data border border-[#F4C46C]/35 bg-[#0B0C12] text-[#FFE29E] hover:border-[#FFE29E]/65 transition-colors"
                >
                  <Orbit className="w-3.5 h-3.5 text-[#F4C46C]" />
                  String 3D Bridge
                </Link>
                <Link
                  to={nextNode.route}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold text-[#060609] hover:brightness-110 transition-all shadow-[0_0_22px_-6px_rgba(69,230,166,0.55)]"
                  style={{ background: 'linear-gradient(135deg, #45E6A6, #FFE29E)' }}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Next Visual Lesson
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )}
        </section>
      </div>
    </AtlasShell>
  );
}
