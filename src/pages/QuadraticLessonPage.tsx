import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Layers,
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
import { FLDOE_SOURCES, VERIFIED_STANDARDS } from '../data/standards';
import { QuadraticWorkbench } from '../instruments/QuadraticWorkbench';
import { EquationMiniVisual } from '../visuals/equations/EquationMiniVisual';
import {
  ParabolaCanvas,
  ParabolaHighlightFeature,
} from '../visuals/parabola/ParabolaCanvas';

const INTUITION_PRESETS = [
  { label: 'Parent x²', a: 1, h: 0, k: 0 },
  { label: 'Two Real Roots', a: 1, h: 2, k: -3 },
  { label: 'Tangent (Δ = 0)', a: 1, h: -1.5, k: 0 },
  { label: 'Complex Roots (Δ < 0)', a: 1, h: 1, k: 2 },
  { label: 'Inverted Arch', a: -0.5, h: 1, k: 3.5 },
];

const WORKED_STEPS: {
  title: string;
  feature: ParabolaHighlightFeature;
  tex: string;
  note: string;
}[] = [
  {
    title: 'Step 1 · Factor Out Leading Curvature (a = 2)',
    feature: 'curvature',
    tex: 'f(x) = 2x^2 - 8x + 6 = 2(x^2 - 4x) + 6',
    note: 'Factoring out 2 keeps the inner quadratic monic and dictates a narrower upward opening.',
  },
  {
    title: 'Step 2 · Complete the Square & Locate Axis of Symmetry',
    feature: 'axis',
    tex: 'f(x) = 2(x^2 - 4x + 4) + 6 - 2(4) = 2(x - 2)^2 - 2',
    note: 'Half of −4 is −2, squared is +4. Subtract 2(4) = 8 outside so the expression remains equivalent. Symmetry sits at x = 2.',
  },
  {
    title: 'Step 3 · Read Global Minimum Vertex (h, k)',
    feature: 'vertex',
    tex: 'V(h, k) = (2, -2)',
    note: 'Because (x − 2)² ≥ 0 for all real x and a = 2 > 0, the lowest possible output is y = −2 at x = 2.',
  },
  {
    title: 'Step 4 · Inspect Y-Intercept (x = 0)',
    feature: 'yIntercept',
    tex: 'f(0) = 2(0 - 2)^2 - 2 = 6 \\implies (0, 6)',
    note: 'Evaluating at x = 0 confirms c = 6 in standard form.',
  },
  {
    title: 'Step 5 · Solve Zeros / X-Intercepts (f(x) = 0)',
    feature: 'roots',
    tex: '2(x - 2)^2 - 2 = 0 \\implies (x - 2)^2 = 1 \\implies x \\in \\{1, 3\\}',
    note: 'Notice both roots sit symmetrically 1 unit left and right of the axis x = 2.',
  },
];

const PRACTICE_QUESTIONS: PracticeQuestion[] = [
  {
    id: 'q1',
    type: 'multiple-choice',
    prompt: 'What is the vertex of the quadratic function below, and does it represent a minimum or maximum?',
    promptTex: 'g(x) = -3(x - 4)^2 + 5',
    options: [
      { id: 'a', label: '(-4, 5), minimum' },
      { id: 'b', label: '(4, 5), maximum' },
      { id: 'c', label: '(4, -5), maximum' },
      { id: 'd', label: '(-4, 5), maximum' },
    ],
    correctAnswer: 'b',
    hint: 'Compare directly against a(x - h)² + k. Notice the minus sign before h = 4, and check the sign of a = -3.',
    solutionSteps: [
      {
        label: 'Match Vertex Form Parameters',
        tex: 'a = -3,\\quad h = 4,\\quad k = 5',
        note: 'In (x - h)², x - 4 means h = +4 (shifted 4 units right).',
      },
      {
        label: 'Determine Extremum Direction',
        tex: 'a = -3 < 0 \\implies \\text{opens downward}',
        note: 'Downward-opening parabolas reach a peak maximum at V(4, 5).',
      },
    ],
  },
  {
    id: 'q2',
    type: 'multiple-choice',
    prompt: 'How many real x-intercepts does a quadratic function have when its discriminant is Δ = -12?',
    promptTex: '\\Delta = b^2 - 4ac = -12',
    options: [
      { id: 'a', label: '2 distinct real roots' },
      { id: 'b', label: '1 repeated double root' },
      { id: 'c', label: '0 real roots (no x-intercepts)' },
      { id: 'd', label: 'Infinitely many roots' },
    ],
    correctAnswer: 'c',
    hint: 'In the quadratic formula, √Δ appears under a square root. Can √(-12) produce a real number?',
    solutionSteps: [
      {
        label: 'Evaluate Radical Sign',
        tex: '\\Delta = -12 < 0 \\implies \\sqrt{-12} \\notin \\mathbb{R}',
        note: 'The parabola lies entirely above or entirely below the x-axis, never crossing y = 0 in the real plane.',
      },
    ],
  },
  {
    id: 'q3',
    type: 'numeric',
    prompt: 'Find the larger real zero (x-intercept) of the equation below.',
    promptTex: 'x^2 - 6x + 8 = 0',
    correctAnswer: 4,
    tolerance: 0.01,
    hint: 'Look for two integers that multiply to +8 and add to -6.',
    solutionSteps: [
      {
        label: 'Factor Quadratic Trinomial',
        tex: '(x - 2)(x - 4) = 0',
        note: '(-2) · (-4) = +8 and (-2) + (-4) = -6.',
      },
      {
        label: 'Zero-Product Property',
        tex: 'x = 2 \\quad \\text{or} \\quad x = 4',
        note: 'The larger real root is x = 4.',
      },
    ],
  },
  {
    id: 'q4',
    type: 'multiple-choice',
    prompt: 'Replacing f(x) with f(x) - 5 transforms the graph in what exact way?',
    promptTex: 'h(x) = f(x) - 5',
    options: [
      { id: 'a', label: 'Shifts the graph 5 units right' },
      { id: 'b', label: 'Shifts the graph 5 units left' },
      { id: 'c', label: 'Shifts the graph 5 units downward' },
      { id: 'd', label: 'Compresses curvature by factor 5' },
    ],
    correctAnswer: 'c',
    hint: 'Subtracting 5 outside the function lowers every output y-value by 5.',
    solutionSteps: [
      {
        label: 'Vertical Translation Rule (MA.912.F.2.1)',
        tex: '(x, y) \\mapsto (x, y - 5)',
        note: 'Every point moves vertically downward by 5 units while x-coordinates remain unchanged.',
      },
    ],
  },
];

const LESSON_STANDARD_CODES = [
  'MA.912.AR.3.1',
  'MA.912.AR.3.4',
  'MA.912.AR.3.6',
  'MA.912.AR.3.7',
  'MA.912.F.2.1',
];

export function QuadraticLessonPage() {
  const reducedMotion = useReducedMotion();

  // Layer 1 state
  const [a, setA] = useState(1);
  const [h, setH] = useState(2);
  const [k, setK] = useState(-3);

  // Layer 3 worked example state
  const [workedIdx, setWorkedIdx] = useState(0);
  const [autoPlayWorked, setAutoPlayWorked] = useState(false);

  useEffect(() => {
    if (!autoPlayWorked) return;
    const timer = window.setInterval(() => {
      setWorkedIdx((prev) => (prev + 1) % WORKED_STEPS.length);
    }, 2800);
    return () => window.clearInterval(timer);
  }, [autoPlayWorked]);

  // Layer 5 misconception probe
  const [probeX, setProbeX] = useState(3);

  // Layer 6 real-world fountain telemetry
  const [launchH0, setLaunchH0] = useState(1.0);
  const [peakTime, setPeakTime] = useState(2.2);
  const [peakHeight, setPeakHeight] = useState(4.2);

  const fountain = useMemo(() => {
    const aJet = (launchH0 - peakHeight) / (peakTime * peakTime);
    const tLand = peakTime + Math.sqrt(-peakHeight / aJet);
    return { aJet, tLand };
  }, [launchH0, peakTime, peakHeight]);

  const algNodes = CURRICULUM_NODES.filter((n) => n.courseId === 'algebra-1');
  const idx = algNodes.findIndex((n) => n.id === 'a1-quadratics');
  const nextNode = algNodes[(idx + 1) % algNodes.length];

  const workedPct = Math.round(((workedIdx + 1) / WORKED_STEPS.length) * 100);
  const trueVal = (probeX - 3) ** 2;
  const trapVal = (probeX + 3) ** 2;

  return (
    <AtlasShell activeCourse="algebra-1">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-12">
        <LessonNavHeader courseId="algebra-1" activeNodeId="a1-quadratics" code="A1-08" />

        {/* Lesson Hero Header */}
        <header className="instrument-frame fiducial-frame p-6 sm:p-7 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="font-mono-data text-[11px] uppercase tracking-[0.2em] text-[#F5C25B]">
              Algebra 1 Flagship · Vertex &amp; Discriminant Observatory
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
            Quadratic Functions &amp; Parabolic Geometry
          </h1>
          <p className="text-sm sm:text-base text-[#A8B2C6] leading-relaxed max-w-4xl">
            Every quadratic curve is a geometric balance between curvature{' '}
            <MathTex tex="a" className="text-[#F5C25B]" />, horizontal shift{' '}
            <MathTex tex="h" className="text-[#46D6E8]" />, and vertical elevation{' '}
            <MathTex tex="k" className="text-[#FF8563]" />. Drag the curve below to see how
            algebraic coefficients sculpt roots and symmetry in real time.
          </p>
        </header>

        {/* LAYER 1: Interactive Visual Intuition */}
        <section id="layer-1" className="space-y-4 scroll-mt-24">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="font-mono-data text-[11px] uppercase tracking-widest text-[#F5C25B]">
                Layer 01 · Interactive Visual Intuition
              </span>
              <h2 className="font-serif-editorial text-2xl sm:text-3xl text-[#F7F4EC]">
                Touch the Vertex, Bend the Curvature
              </h2>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {INTUITION_PRESETS.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => {
                    setA(p.a);
                    setH(p.h);
                    setK(p.k);
                  }}
                  className="px-3 py-1 rounded-full text-xs font-mono-data bg-[#0B0C12] border border-[#F4C46C]/20 text-[#A8B2C6] hover:text-[#FFE29E] hover:border-[#F5C25B]/60 transition-colors"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <ParabolaCanvas
            a={a}
            h={h}
            k={k}
            onChange={(next) => {
              setA(next.a);
              setH(next.h);
              setK(next.k);
            }}
            showParentCurve
          />

          <div className="instrument-frame p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <label className="space-y-1.5 text-xs">
              <div className="flex justify-between font-mono-data">
                <span className="text-[#F5C25B]">a · Curvature &amp; Opening</span>
                <span className="text-[#F7F4EC]">{a}</span>
              </div>
              <input
                type="range"
                min={-3}
                max={3}
                step={0.1}
                value={a}
                onChange={(e) => {
                  const v = parseFloat(e.target.value);
                  setA(Math.abs(v) < 0.2 ? (v >= 0 ? 0.2 : -0.2) : v);
                }}
                className="meridian-slider"
                style={{ ['--slider-accent' as string]: '#F5C25B' }}
              />
            </label>
            <label className="space-y-1.5 text-xs">
              <div className="flex justify-between font-mono-data">
                <span className="text-[#46D6E8]">h · Horizontal Vertex Shift</span>
                <span className="text-[#F7F4EC]">{h}</span>
              </div>
              <input
                type="range"
                min={-6}
                max={6}
                step={0.5}
                value={h}
                onChange={(e) => setH(parseFloat(e.target.value))}
                className="meridian-slider"
                style={{ ['--slider-accent' as string]: '#46D6E8' }}
              />
            </label>
            <label className="space-y-1.5 text-xs">
              <div className="flex justify-between font-mono-data">
                <span className="text-[#FF8563]">k · Vertical Vertex Shift</span>
                <span className="text-[#F7F4EC]">{k}</span>
              </div>
              <input
                type="range"
                min={-5}
                max={5}
                step={0.5}
                value={k}
                onChange={(e) => setK(parseFloat(e.target.value))}
                className="meridian-slider"
                style={{ ['--slider-accent' as string]: '#FF8563' }}
              />
            </label>
          </div>
        </section>

        {/* LAYER 2: Clean Mathematical Formalization */}
        <section id="layer-2" className="space-y-4 scroll-mt-24">
          <div>
            <span className="font-mono-data text-[11px] uppercase tracking-widest text-[#F5C25B]">
              Layer 02 · Visualized Mathematical Equations
            </span>
            <h2 className="font-serif-editorial text-2xl sm:text-3xl text-[#F7F4EC]">
              Three Equivalent Algebraic Representations — Seen Geometrically
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="instrument-frame p-5 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono-data text-[10.5px] text-[#FF8563] uppercase tracking-wider">
                  Vertex Form (Geometry First)
                </span>
                <span className="font-mono-data text-[9.5px] px-2 py-0.5 rounded-full border border-[#F4C46C]/20 bg-[#0B0C12] text-[#F4C46C]">
                  EQ 01
                </span>
              </div>
              <div aria-label="Vertex V(h, k) geometry preview">
                <EquationMiniVisual kind="parabola-vertex" accent="#F5C25B" />
              </div>
              <div className="instrument-panel px-3 py-2 overflow-x-auto">
                <MathTex
                  tex="f(x) = a(x - h)^2 + k"
                  displayMode
                  className="text-lg text-[#F7F4EC]"
                />
              </div>
              <p className="text-xs text-[#A8B2C6] leading-relaxed">
                Exposes the extremum <MathTex tex="(h, k)" /> and symmetry axis{' '}
                <MathTex tex="x = h" /> immediately without extra calculation.
              </p>
            </div>

            <div className="instrument-frame p-5 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono-data text-[10.5px] text-[#F5C25B] uppercase tracking-wider">
                  Standard Form &amp; Discriminant Δ
                </span>
                <span className="font-mono-data text-[9.5px] px-2 py-0.5 rounded-full border border-[#F4C46C]/20 bg-[#0B0C12] text-[#F4C46C]">
                  EQ 02
                </span>
              </div>
              <div aria-label="Discriminant regimes Δ < 0, Δ = 0, Δ > 0">
                <EquationMiniVisual kind="parabola-discriminant" accent="#F5C25B" />
              </div>
              <div className="instrument-panel px-3 py-2 overflow-x-auto">
                <MathTex
                  tex="f(x) = ax^2 + bx + c"
                  displayMode
                  className="text-lg text-[#F7F4EC]"
                />
              </div>
              <p className="text-xs text-[#A8B2C6] leading-relaxed">
                Reveals y-intercept <MathTex tex="(0, c)" /> directly. Vertex abscissa satisfies{' '}
                <MathTex tex="h = -\frac{b}{2a}" /> and discriminant{' '}
                <MathTex tex="\Delta = b^2 - 4ac" />.
              </p>
            </div>

            <div className="instrument-frame p-5 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono-data text-[10.5px] text-[#45E6A6] uppercase tracking-wider">
                  Factored Form (Roots First)
                </span>
                <span className="font-mono-data text-[9.5px] px-2 py-0.5 rounded-full border border-[#F4C46C]/20 bg-[#0B0C12] text-[#F4C46C]">
                  EQ 03
                </span>
              </div>
              <div aria-label="Area model root factorization">
                <EquationMiniVisual kind="area-factor" accent="#45E6A6" />
              </div>
              <div className="instrument-panel px-3 py-2 overflow-x-auto">
                <MathTex
                  tex="f(x) = a(x - r_1)(x - r_2)"
                  displayMode
                  className="text-lg text-[#F7F4EC]"
                />
              </div>
              <p className="text-xs text-[#A8B2C6] leading-relaxed">
                Valid over ℝ when <MathTex tex="\Delta \ge 0" />. Axis of symmetry is the exact
                midpoint <MathTex tex="h = \frac{r_1 + r_2}{2}" />.
              </p>
            </div>
          </div>
        </section>

        {/* LAYER 3: Guided Step-by-Step Worked Example */}
        <section id="layer-3" className="instrument-frame fiducial-frame p-5 sm:p-7 space-y-5 scroll-mt-24">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="font-mono-data text-[11px] uppercase tracking-widest text-[#F5C25B]">
                Layer 03 · Synchronized Worked Example
              </span>
              <h2 className="font-serif-editorial text-2xl sm:text-3xl text-[#F7F4EC]">
                Deconstructing <MathTex tex="f(x) = 2x^2 - 8x + 6" />
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setAutoPlayWorked(false);
                  setWorkedIdx((prev) => (prev - 1 + WORKED_STEPS.length) % WORKED_STEPS.length);
                }}
                aria-label="Previous worked step"
                className="p-1.5 rounded-full border border-[#F4C46C]/25 bg-[#0B0C12] text-[#A8B2C6] hover:text-[#F7F4EC] hover:border-[#F4C46C]/50 transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setAutoPlayWorked((p) => !p)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-mono-data border transition-all"
                style={{
                  borderColor: autoPlayWorked ? '#F5C25B' : 'rgba(244, 196, 108, 0.28)',
                  backgroundColor: autoPlayWorked ? 'rgba(245, 194, 91, 0.18)' : '#0B0C12',
                  color: autoPlayWorked ? '#F5C25B' : '#F7F4EC',
                }}
              >
                {autoPlayWorked ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                {autoPlayWorked ? 'Pause Walkthrough' : 'Auto-Play Steps'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setAutoPlayWorked(false);
                  setWorkedIdx((prev) => (prev + 1) % WORKED_STEPS.length);
                }}
                aria-label="Next worked step"
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
                background: 'linear-gradient(90deg, #F4C46C, #F5C25B, #45E6A6)',
                boxShadow: '0 0 10px #F5C25B',
              }}
              initial={false}
              animate={{ width: `${workedPct}%` }}
              transition={reducedMotion ? { duration: 0 } : { type: 'spring', stiffness: 260, damping: 28 }}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            <div className="lg:col-span-5 space-y-2.5">
              {WORKED_STEPS.map((st, idxStep) => {
                const active = workedIdx === idxStep;
                return (
                  <motion.button
                    key={st.title}
                    type="button"
                    whileTap={reducedMotion ? undefined : { scale: 0.99 }}
                    onClick={() => {
                      setAutoPlayWorked(false);
                      setWorkedIdx(idxStep);
                    }}
                    className="w-full text-left p-4 rounded-xl border transition-all space-y-1.5"
                    style={{
                      backgroundColor: active ? 'rgba(244, 196, 108, 0.1)' : '#0B0C12',
                      borderColor: active ? '#F5C25B' : 'rgba(244, 196, 108, 0.16)',
                      boxShadow: active ? '0 0 22px -10px rgba(245, 194, 91, 0.85)' : undefined,
                    }}
                  >
                    <p className="font-mono-data text-[11px] text-[#F5C25B]">{st.title}</p>
                    <div className="overflow-x-auto">
                      <MathTex tex={st.tex} displayMode className="text-sm text-[#F7F4EC]" />
                    </div>
                    <p className="text-xs text-[#A8B2C6] leading-relaxed">{st.note}</p>
                  </motion.button>
                );
              })}
            </div>

            <div className="lg:col-span-7 space-y-3">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={workedIdx}
                  initial={reducedMotion ? false : { opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reducedMotion ? undefined : { opacity: 0, y: -6 }}
                  transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
                  className="instrument-panel px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 border-[#F5C25B]/35"
                >
                  <span className="font-mono-data text-[11px] text-[#F5C25B]">
                    ACTIVE FEATURE · 0{workedIdx + 1} / 0{WORKED_STEPS.length}
                  </span>
                  <span className="text-xs text-[#F7F4EC]">
                    {WORKED_STEPS[workedIdx].title.replace(/^Step \d+ · /, '')}
                  </span>
                </motion.div>
              </AnimatePresence>

              <ParabolaCanvas
                a={2}
                h={2}
                k={-2}
                interactive={false}
                highlightFeature={WORKED_STEPS[workedIdx].feature}
                heightClass="h-[400px]"
              />
            </div>
          </div>
        </section>

        {/* LAYER 4: Interactive Practice */}
        <section id="layer-4" className="space-y-4 scroll-mt-24">
          <div>
            <span className="font-mono-data text-[11px] uppercase tracking-widest text-[#F5C25B]">
              Layer 04 · Interactive Mastery Practice
            </span>
            <h2 className="font-serif-editorial text-2xl sm:text-3xl text-[#F7F4EC]">
              Verify Concepts with Step-by-Step Solutions
            </h2>
          </div>
          <PracticeEngine
            questions={PRACTICE_QUESTIONS}
            accentColor="#F5C25B"
            visualKinds={['parabola-vertex', 'parabola-discriminant', 'area-factor', 'parabola-standard']}
          />
        </section>

        {/* LAYER 5: Visualized Common Misconception */}
        <motion.section
          id="layer-5"
          initial={reducedMotion ? false : { opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="instrument-frame p-5 sm:p-7 space-y-5 border-[#FF8563]/40 scroll-mt-24"
        >
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-[#FF8563] shrink-0 mt-1" />
            <div>
              <span className="font-mono-data text-[11px] uppercase tracking-widest text-[#FF8563]">
                Layer 05 · Visualized Common Misconception
              </span>
              <h2 className="font-serif-editorial text-2xl sm:text-3xl text-[#F7F4EC]">
                The Sign-Flip Trap: Why <MathTex tex="(x - 3)^2" /> Shifts Right, Not Left
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            <div className="lg:col-span-5 instrument-panel p-5 space-y-4">
              <p className="text-sm text-[#A8B2C6] leading-relaxed">
                Students frequently assume <MathTex tex="(x - 3)^2" /> shifts left because of the
                minus sign. Geometry reveals the truth: the parabola touches{' '}
                <MathTex tex="y = 0" /> wherever the expression <em>inside</em> the square vanishes!
              </p>

              <div className="p-3.5 rounded-xl bg-[#060609] border border-[#45E6A6]/35 space-y-1.5 text-xs">
                <div className="flex items-center justify-between font-mono-data">
                  <span className="text-[#45E6A6]">TRUE · f(x) = (x − 3)²</span>
                  <span className="text-[#F7F4EC]">{trueVal.toFixed(2)}</span>
                </div>
                <div className="h-2 rounded-full bg-[#11131C] overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-[#45E6A6]"
                    initial={false}
                    animate={{ width: `${Math.min(100, (trueVal / 64) * 100)}%` }}
                    transition={reducedMotion ? { duration: 0 } : { type: 'spring', stiffness: 260, damping: 24 }}
                  />
                </div>
                <MathTex
                  tex={`f(${probeX}) = (${probeX} - 3)^2 = ${trueVal}`}
                  displayMode
                  className="text-[#F7F4EC]"
                />
                <p className="text-[#A8B2C6]">
                  Needs <MathTex tex="x = +3" /> to cancel the <MathTex tex="-3" /> back to zero.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#060609] border border-[#46D6E8]/35 space-y-1.5 text-xs">
                <div className="flex items-center justify-between font-mono-data">
                  <span className="text-[#46D6E8]">TRAP · g(x) = (x + 3)²</span>
                  <span className="text-[#F7F4EC]">{trapVal.toFixed(2)}</span>
                </div>
                <div className="h-2 rounded-full bg-[#11131C] overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-[#46D6E8]"
                    initial={false}
                    animate={{ width: `${Math.min(100, (trapVal / 64) * 100)}%` }}
                    transition={reducedMotion ? { duration: 0 } : { type: 'spring', stiffness: 260, damping: 24 }}
                  />
                </div>
                <MathTex
                  tex={`g(${probeX}) = (${probeX} + 3)^2 = ${trapVal}`}
                  displayMode
                  className="text-[#F7F4EC]"
                />
                <p className="text-[#A8B2C6]">
                  Zeros out at <MathTex tex="x = -3" />, placing its vertex on the left.
                </p>
              </div>

              <label className="block space-y-1.5 text-xs pt-1">
                <div className="flex justify-between font-mono-data">
                  <span className="text-[#F7F4EC]">Move Input Probe (x)</span>
                  <span className="text-[#45E6A6]">x = {probeX}</span>
                </div>
                <input
                  type="range"
                  min={-4}
                  max={5}
                  step={0.5}
                  value={probeX}
                  onChange={(e) => setProbeX(parseFloat(e.target.value))}
                  className="meridian-slider"
                  style={{ ['--slider-accent' as string]: '#45E6A6' }}
                />
              </label>
            </div>

            <div className="lg:col-span-7">
              <ParabolaCanvas
                a={1}
                h={3}
                k={0}
                interactive={false}
                probeX={probeX}
                ghostCurve={{ a: 1, h: -3, k: 0, label: 'g(x) = (x + 3)²', color: '#46D6E8' }}
                heightClass="h-[410px]"
              />
            </div>
          </div>
        </motion.section>

        {/* LAYER 6: Real-World Application */}
        <section id="layer-6" className="space-y-4 scroll-mt-24">
          <div>
            <span className="font-mono-data text-[11px] uppercase tracking-widest text-[#F5C25B]">
              Layer 06 · Real-World Telemetry Application
            </span>
            <h2 className="font-serif-editorial text-2xl sm:text-3xl text-[#F7F4EC]">
              Parabolic Fountain Jet &amp; Domain Constraints
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            <div className="lg:col-span-5 instrument-frame p-5 space-y-4">
              <p className="text-sm text-[#A8B2C6] leading-relaxed">
                Adjust the nozzle height <MathTex tex="h_0" /> and target apex{' '}
                <MathTex tex="(t_{\text{peak}}, y_{\max})" />. While the pure mathematical parabola
                extends infinitely, the physical water stream exists only over the non-negative
                domain <MathTex tex="t \in [0, t_{\text{land}}]" />.
              </p>

              <div className="space-y-3">
                <label className="block space-y-1 text-xs">
                  <div className="flex justify-between font-mono-data">
                    <span className="text-[#A8B2C6]">Nozzle Height (h₀)</span>
                    <span className="text-[#F5C25B]">{launchH0.toFixed(1)} m</span>
                  </div>
                  <input
                    type="range"
                    min={0.5}
                    max={2.5}
                    step={0.1}
                    value={launchH0}
                    onChange={(e) => setLaunchH0(parseFloat(e.target.value))}
                    className="meridian-slider"
                    style={{ ['--slider-accent' as string]: '#F5C25B' }}
                  />
                </label>

                <label className="block space-y-1 text-xs">
                  <div className="flex justify-between font-mono-data">
                    <span className="text-[#46D6E8]">Time to Apex (t_peak)</span>
                    <span className="text-[#46D6E8]">{peakTime.toFixed(1)} s</span>
                  </div>
                  <input
                    type="range"
                    min={1.2}
                    max={3.8}
                    step={0.1}
                    value={peakTime}
                    onChange={(e) => setPeakTime(parseFloat(e.target.value))}
                    className="meridian-slider"
                    style={{ ['--slider-accent' as string]: '#46D6E8' }}
                  />
                </label>

                <label className="block space-y-1 text-xs">
                  <div className="flex justify-between font-mono-data">
                    <span className="text-[#FF8563]">Apex Height (y_max)</span>
                    <span className="text-[#FF8563]">{peakHeight.toFixed(1)} m</span>
                  </div>
                  <input
                    type="range"
                    min={2.6}
                    max={4.8}
                    step={0.1}
                    value={peakHeight}
                    onChange={(e) => setPeakHeight(parseFloat(e.target.value))}
                    className="meridian-slider"
                    style={{ ['--slider-accent' as string]: '#FF8563' }}
                  />
                </label>
              </div>

              <div className="instrument-panel p-4 space-y-1.5 text-xs font-mono-data">
                <div className="flex justify-between">
                  <span className="text-[#A8B2C6]">Gravity Curvature (a):</span>
                  <span className="text-[#F5C25B]">{fountain.aJet.toFixed(2)} m/s²</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#A8B2C6]">Basin Impact (t_land):</span>
                  <span className="text-[#45E6A6]">{fountain.tLand.toFixed(2)} s</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#A8B2C6]">Valid Domain:</span>
                  <span className="text-[#F7F4EC]">[0, {fountain.tLand.toFixed(2)}] s</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7">
              <ParabolaCanvas
                a={fountain.aJet}
                h={peakTime}
                k={peakHeight}
                interactive={false}
                heightClass="h-[390px]"
              />
            </div>
          </div>
        </section>

        {/* INTEGRATED COURSE INSTRUMENT */}
        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#F5C25B]" />
              <h2 className="font-serif-editorial text-2xl text-[#F7F4EC]">
                Embedded Course Instrument
              </h2>
            </div>
            <Link
              to="/instruments"
              className="inline-flex items-center gap-1.5 text-xs font-mono-data text-[#FFE29E] hover:underline"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#F5C25B]" /> Open Full 3D &amp; Interactive Labs
            </Link>
          </div>
          <QuadraticWorkbench />
        </section>

        {/* LAYER 7: Verified Standards & Next Lesson */}
        <section id="layer-7" className="instrument-frame p-5 sm:p-6 space-y-5 scroll-mt-24">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="font-mono-data text-[11px] uppercase tracking-widest text-[#F5C25B]">
                Layer 07 · Verified Standards &amp; Official Sources
              </span>
              <h2 className="font-serif-editorial text-2xl text-[#F7F4EC]">
                Florida B.E.S.T. / CPALMS Alignment
              </h2>
              <p className="text-xs text-[#A8B2C6] mt-1">
                Algebra 1 Course Code{' '}
                <a
                  href={FLDOE_SOURCES.cpalmsAlg1.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#FFE29E] underline underline-offset-2"
                >
                  1200310 (CPALMS)
                </a>{' '}
                · Official{' '}
                <a
                  href={FLDOE_SOURCES.bestPdf.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#F7F4EC] underline underline-offset-2"
                >
                  FLDOE B.E.S.T. Mathematics PDF
                </a>{' '}
                · Consulted November 22, 2026.
              </p>
            </div>
            <Link
              to="/textbook"
              className="inline-flex items-center gap-1.5 font-mono-data text-[11px] text-[#FFE29E] hover:underline"
            >
              <BookOpen className="w-3.5 h-3.5 text-[#F4C46C]" /> View in FL Textbook Hub
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {LESSON_STANDARD_CODES.map((code) => {
              const std = VERIFIED_STANDARDS[code];
              if (!std) return null;
              return (
                <div key={code} className="instrument-panel p-4 space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono-data text-xs text-[#F5C25B]">{std.code}</span>
                    <a
                      href={std.sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 font-mono-data text-[11px] text-[#A8B2C6] hover:text-[#FFE29E]"
                    >
                      {std.sourceLabel} <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <p className="text-xs text-[#F7F4EC] leading-relaxed">{std.description}</p>
                  {std.clarification && (
                    <p className="text-[11px] text-[#727D94] leading-snug">{std.clarification}</p>
                  )}
                </div>
              );
            })}
          </div>

          {nextNode && (
            <div className="pt-4 border-t hairline-rule flex flex-wrap items-center justify-between gap-3">
              <div className="text-xs text-[#A8B2C6]">
                <span className="font-mono-data text-[10px] uppercase text-[#727D94] block">
                  Continue Algebra 1 Sequence
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
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold text-[#060609] hover:brightness-110 transition-all shadow-[0_0_22px_-6px_rgba(244,196,108,0.6)]"
                  style={{ background: 'linear-gradient(135deg, #F5C25B, #FFE29E)' }}
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
