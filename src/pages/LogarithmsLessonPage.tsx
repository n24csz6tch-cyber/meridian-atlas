import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, CheckCircle2, ChevronLeft, ChevronRight, ExternalLink, Pause, Play } from 'lucide-react';
import { AtlasShell } from '../components/AtlasShell';
import { LessonNavHeader } from '../components/LessonNavHeader';
import { MathTex } from '../components/MathTex';
import { PracticeEngine, PracticeQuestion } from '../components/PracticeEngine';
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

  return (
    <AtlasShell activeCourse="algebra-2">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-12">
        <LessonNavHeader courseId="algebra-2" activeNodeId="a2-logarithms" code="A2-04" />

        <header className="space-y-3 max-w-4xl">
          <h1 className="font-serif-editorial text-4xl sm:text-5xl text-[#F4F3EE] leading-tight">
            Logarithms, Inverse Reflections &amp; Structural Expansion Laws
          </h1>
          <p className="text-base text-[#A5B4CC] leading-relaxed">
            A logarithm is not a mysterious button — it is literally the reflection of exponential
            growth across <MathTex tex="y = x" className="text-[#36EBA8]" />, asking{' '}
            <em>&ldquo;What exponent produces this output?&rdquo;</em>
          </p>
        </header>

        {/* LAYER 1: VISUAL INTUITION */}
        <section id="layer-1" className="space-y-4 scroll-mt-24">
          <span className="font-mono-data text-[11px] uppercase tracking-widest text-[#36EBA8]">
            Layer 01 · Visual Intuition &amp; Animated Laws
          </span>
          <LogarithmLab />
        </section>

        {/* LAYER 2: MATHEMATICAL FORMALIZATION */}
        <section id="layer-2" className="space-y-4 scroll-mt-24">
          <div>
            <span className="font-mono-data text-[11px] uppercase tracking-widest text-[#36EBA8]">
              Layer 02 · Visualized Formal Axioms &amp; Identity Rules
            </span>
            <h2 className="font-serif-editorial text-2xl sm:text-3xl text-[#F4F3EE]">
              Logarithm Laws Paired With Geometric Reflection
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="instrument-frame p-4 space-y-2.5">
              <span className="font-mono-data text-[10px] uppercase text-[#F5BC5E]">
                Inverse Equivalence
              </span>
              <EquationMiniVisual kind="log-reflection" accent="#36EBA8" heightClass="h-[112px]" />
              <div className="instrument-panel px-2 py-1.5 overflow-x-auto">
                <MathTex tex="y = \log_b(x) \iff b^y = x" displayMode className="text-[#F4F3EE]" />
              </div>
              <p className="text-xs text-[#A5B4CC]">
                Defined over real numbers for <MathTex tex="x > 0, \; b > 0, \; b \ne 1" />.
              </p>
            </div>
            <div className="instrument-frame p-4 space-y-2.5">
              <span className="font-mono-data text-[10px] uppercase text-[#36EBA8]">
                Product Law
              </span>
              <EquationMiniVisual kind="exponent-product" accent="#36EBA8" heightClass="h-[112px]" />
              <div className="instrument-panel px-2 py-1.5 overflow-x-auto">
                <MathTex tex="\log_b(MN) = \log_b M + \log_b N" displayMode className="text-[#F4F3EE]" />
              </div>
              <p className="text-xs text-[#A5B4CC]">
                Multiplying exponential outputs corresponds to adding their exponents.
              </p>
            </div>
            <div className="instrument-frame p-4 space-y-2.5">
              <span className="font-mono-data text-[10px] uppercase text-[#FF7A5C]">
                Quotient Law
              </span>
              <EquationMiniVisual kind="exp-decay" accent="#FF7A5C" heightClass="h-[112px]" />
              <div className="instrument-panel px-2 py-1.5 overflow-x-auto">
                <MathTex tex="\log_b\!\left(\frac{M}{N}\right) = \log_b M - \log_b N" displayMode className="text-[#F4F3EE]" />
              </div>
              <p className="text-xs text-[#A5B4CC]">
                Dividing bases subtracts exponents inside the logarithmic domain.
              </p>
            </div>
            <div className="instrument-frame p-4 space-y-2.5">
              <span className="font-mono-data text-[10px] uppercase text-[#38D9FF]">
                Power &amp; Change of Base
              </span>
              <EquationMiniVisual kind="inverse-mirror" accent="#38D9FF" heightClass="h-[112px]" />
              <div className="instrument-panel px-2 py-1.5 overflow-x-auto">
                <MathTex tex="\log_b(M^p) = p\log_b M" displayMode className="text-[#F4F3EE]" />
              </div>
              <p className="text-xs text-[#A5B4CC]">
                Also <MathTex tex="\log_b x = \frac{\ln x}{\ln b}" /> connects all bases smoothly.
              </p>
            </div>
          </div>
        </section>

        {/* LAYER 3: GUIDED WORKED EXAMPLE */}
        <section id="layer-3" className="instrument-frame p-5 sm:p-6 space-y-4 scroll-mt-24">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <span className="font-mono-data text-[11px] uppercase tracking-widest text-[#36EBA8] block">
                Layer 03 · Synchronized Guided Step-by-Step Solver
              </span>
              <h2 className="font-serif-editorial text-2xl text-[#F4F3EE]">
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
                className="p-1.5 rounded-full border border-white/15 bg-white/[0.03] text-[#A5B4CC] hover:text-[#F4F3EE] transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setAutoPlaySteps((p) => !p)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-mono-data border transition-all"
                style={{
                  borderColor: autoPlaySteps ? '#36EBA8' : 'rgba(255,255,255,0.16)',
                  backgroundColor: autoPlaySteps ? 'rgba(54,235,168,0.18)' : 'rgba(255,255,255,0.03)',
                  color: autoPlaySteps ? '#36EBA8' : '#A5B4CC',
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
                className="p-1.5 rounded-full border border-white/15 bg-white/[0.03] text-[#A5B4CC] hover:text-[#F4F3EE] transition-colors"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            <div className="lg:col-span-7 space-y-3">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {LOG_WORKED_STEPS.map((st, idx) => (
                  <button
                    key={st.title}
                    type="button"
                    onClick={() => {
                      setAutoPlaySteps(false);
                      setStepIdx(idx);
                    }}
                    className={`p-3 rounded-xl text-left border transition-all ${
                      stepIdx === idx
                        ? 'bg-[#36EBA8]/15 border-[#36EBA8] text-[#F4F3EE]'
                        : 'bg-[#080D16] border-white/10 text-[#A5B4CC] hover:text-[#F4F3EE]'
                    }`}
                  >
                    <span className="font-mono-data text-[10px] text-[#36EBA8] block">
                      STEP 0{idx + 1}
                    </span>
                    <span className="text-xs font-medium">{st.title.replace(/^Step \d+ · /, '')}</span>
                  </button>
                ))}
              </div>

              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={stepIdx}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                  className="instrument-panel p-5 space-y-2"
                >
                  <p className="font-mono-data text-xs text-[#36EBA8]">{LOG_WORKED_STEPS[stepIdx].title}</p>
                  <div className="py-1 overflow-x-auto">
                    <MathTex tex={LOG_WORKED_STEPS[stepIdx].tex} displayMode className="text-[#F4F3EE]" />
                  </div>
                  <p className="text-xs text-[#A5B4CC]">{LOG_WORKED_STEPS[stepIdx].note}</p>
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="lg:col-span-5">
              <DerivationStepVisual
                visualKinds={['log-product', 'log-reflection', 'parabola-vertex', 'radical-curve']}
                stepIndex={stepIdx}
                totalSteps={LOG_WORKED_STEPS.length}
                stepTitle={LOG_WORKED_STEPS[stepIdx].title}
                accent="#36EBA8"
              />
            </div>
          </div>
        </section>

        {/* LAYER 4: PRACTICE ENGINE */}
        <section id="layer-4" className="space-y-4 scroll-mt-24">
          <span className="font-mono-data text-[11px] uppercase tracking-widest text-[#34E8A5]">
            Layer 4 · Interactive Check &amp; Step Solutions
          </span>
          <PracticeEngine
            questions={LOG_PRACTICE}
            accentColor="#34E8A5"
            visualKinds={['log-reflection', 'log-quotient', 'log-product', 'log-power']}
          />
        </section>

        {/* LAYER 5: COMMON MISCONCEPTION VISUALIZED */}
        <section className="instrument-frame p-5 sm:p-6 space-y-5 border-[#FF785A]/35">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-[#FF785A] shrink-0 mt-0.5" />
            <div>
              <span className="font-mono-data text-[11px] uppercase tracking-widest text-[#FF785A] block">
                Layer 5 · Typical Error Visualized — The Sum-Split Trap
              </span>
              <h2 className="font-serif-editorial text-2xl text-[#F2F0E8]">
                Why <MathTex tex="\log_2(x + y) \ne \log_2(x) + \log_2(y)" />
              </h2>
              <p className="text-xs text-[#A7B3C7] mt-1">
                Logarithms distribute over multiplication, never addition. Test numeric values below
                to watch the two bars diverge sharply:
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-center">
            <div className="space-y-4">
              <label className="block space-y-1 text-xs">
                <span className="flex justify-between font-mono-data text-[#A7B3C7]">
                  <span>Input x</span>
                  <span className="text-[#34E8A5]">{trapX}</span>
                </span>
                <input
                  type="range"
                  min={1}
                  max={16}
                  step={1}
                  value={trapX}
                  onChange={(e) => setTrapX(Number(e.target.value))}
                  className="meridian-slider"
                  style={{ ['--slider-accent' as string]: '#34E8A5' }}
                />
              </label>

              <label className="block space-y-1 text-xs">
                <span className="flex justify-between font-mono-data text-[#A7B3C7]">
                  <span>Input y</span>
                  <span className="text-[#38D4FF]">{trapY}</span>
                </span>
                <input
                  type="range"
                  min={1}
                  max={16}
                  step={1}
                  value={trapY}
                  onChange={(e) => setTrapY(Number(e.target.value))}
                  className="meridian-slider"
                  style={{ ['--slider-accent' as string]: '#38D4FF' }}
                />
              </label>
            </div>

            <div className="instrument-panel p-4 space-y-3 font-mono-data text-xs">
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-[#34E8A5]">
                    TRUE: log₂({trapX} + {trapY}) = log₂({trapX + trapY})
                  </span>
                  <span className="text-[#F2F0E8]">{trueSumVal.toFixed(3)}</span>
                </div>
                <div className="h-2.5 rounded bg-[#05070C] overflow-hidden">
                  <div
                    className="h-full bg-[#34E8A5] transition-all"
                    style={{ width: `${Math.min(100, (trueSumVal / 8) * 100)}%` }}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-[#FF785A]">
                    FALSE TRAP: log₂({trapX}) + log₂({trapY}) = log₂({trapX * trapY})
                  </span>
                  <span className="text-[#FF785A]">{falseSplitVal.toFixed(3)}</span>
                </div>
                <div className="h-2.5 rounded bg-[#05070C] overflow-hidden">
                  <div
                    className="h-full bg-[#FF785A] transition-all"
                    style={{ width: `${Math.min(100, (falseSplitVal / 8) * 100)}%` }}
                  />
                </div>
              </div>

              <div className="text-[11px] text-[#A7B3C7] flex items-center gap-1.5 pt-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#34E8A5]" />
                Adding logs secretly multiplies {trapX} × {trapY} = {trapX * trapY}, not{' '}
                {trapX + trapY}.
              </div>
            </div>
          </div>
        </section>

        {/* LAYER 6: REAL-WORLD APPLICATION */}
        <section className="instrument-frame p-5 sm:p-6 space-y-4">
          <span className="font-mono-data text-[11px] uppercase tracking-widest text-[#F4B956] block">
            Layer 6 · Real-World Application — Seismic Moment Magnitude Scale
          </span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div className="space-y-3">
              <h2 className="font-serif-editorial text-2xl text-[#F2F0E8]">
                Why +1.0 Magnitude Equals 31.6× More Energy
              </h2>
              <p className="text-xs text-[#A7B3C7] leading-relaxed">
                Earthquake scales compress spans from tiny tremors to megathrust quakes using
                common base-10 logarithms. A step of <MathTex tex="\Delta M" /> scales wave amplitude
                by <MathTex tex="10^{\Delta M}" /> and radiated seismic energy by{' '}
                <MathTex tex="10^{1.5\,\Delta M}" />.
              </p>
              <label className="block space-y-1 text-xs">
                <span className="flex justify-between font-mono-data text-[#A7B3C7]">
                  <span>Magnitude Difference ΔM</span>
                  <span className="text-[#F4B956]">+{magDelta.toFixed(1)} M</span>
                </span>
                <input
                  type="range"
                  min={0.5}
                  max={3.5}
                  step={0.1}
                  value={magDelta}
                  onChange={(e) => setMagDelta(Number(e.target.value))}
                  className="meridian-slider"
                  style={{ ['--slider-accent' as string]: '#F4B956' }}
                />
              </label>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="instrument-panel p-4 space-y-1">
                <span className="font-mono-data text-[10px] text-[#A7B3C7] uppercase">
                  Seismograph Amplitude Ratio
                </span>
                <span className="font-mono-data text-2xl text-[#34E8A5] block">
                  {ampRatio.toLocaleString(undefined, { maximumFractionDigits: 1 })}×
                </span>
                <span className="font-mono-data text-[10px] text-[#707D94]">10^(ΔM)</span>
              </div>
              <div className="instrument-panel p-4 space-y-1">
                <span className="font-mono-data text-[10px] text-[#A7B3C7] uppercase">
                  Radiated Energy Multiplier
                </span>
                <span className="font-mono-data text-2xl text-[#F4B956] block">
                  {energyRatio.toLocaleString(undefined, { maximumFractionDigits: 0 })}×
                </span>
                <span className="font-mono-data text-[10px] text-[#707D94]">10^(1.5·ΔM)</span>
              </div>
            </div>
          </div>
        </section>

        {/* LAYER 7: VERIFIED FLORIDA B.E.S.T. STANDARDS */}
        <section className="instrument-frame p-5 space-y-3">
          <span className="font-mono-data text-[10px] uppercase tracking-[0.18em] text-[#34E8A5] block">
            Layer 7 · Verified Florida B.E.S.T. Standards (Consulted {CONSULTED_DATE})
          </span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {STD_CODES.map((code) => {
              const s = VERIFIED_STANDARDS[code];
              return (
                <div key={code} className="instrument-panel p-4 space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono-data text-xs text-[#34E8A5]">{s.code}</span>
                    <a
                      href={s.sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-mono-data text-[#A7B3C7] hover:text-[#F2F0E8]"
                    >
                      {s.sourceLabel} <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <p className="text-xs text-[#F2F0E8] leading-relaxed">{s.description}</p>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </AtlasShell>
  );
}
