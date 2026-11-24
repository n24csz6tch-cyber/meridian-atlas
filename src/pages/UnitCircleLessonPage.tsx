import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
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
import { UnitCircleWaveCanvas } from '../visuals/trig/UnitCircleWaveCanvas';
import { VectorParallelogramCanvas } from '../visuals/trig/VectorParallelogramCanvas';

const TRIG_STEPS = [
  {
    title: 'Step 1 · Identify Amplitude |A|',
    tex: 'y = 3\\sin(2x) \\implies |A| = 3',
    note: 'The vertical wave peak reaches +3 above midline y = 0 and drops to −3.',
  },
  {
    title: 'Step 2 · Compute Period T = 2π / |B|',
    tex: 'B = 2 \\implies T = \\dfrac{2\\pi}{2} = \\pi',
    note: 'Doubling angular speed completes a full unit-circle lap twice as fast.',
  },
  {
    title: 'Step 3 · Plot Key Quarter-Cycle Points',
    tex: 'x \\in \\left\\{0,\\; \\tfrac{\\pi}{4},\\; \\tfrac{\\pi}{2},\\; \\tfrac{3\\pi}{4},\\; \\pi\\right\\}',
    note: 'Divide period π by 4 to locate zero, peak (+3), zero, trough (−3), and cycle end.',
  },
  {
    title: 'Step 4 · Evaluate Exact Value at π/6',
    tex: 'y\\!\\left(\\tfrac{\\pi}{6}\\right) = 3\\sin\\!\\left(\\tfrac{\\pi}{3}\\right) = \\dfrac{3\\sqrt{3}}{2} \\approx 2.60',
    note: 'Connect unit-circle triangle altitude √3/2 directly back to scaled wave height.',
  },
];

const TRIG_PRACTICE: PracticeQuestion[] = [
  {
    id: 'trig-1',
    prompt: 'What is the exact value of sin(5π/6)?',
    promptTex: '\\sin\\!\\left(\\dfrac{5\\pi}{6}\\right) = \\text{?}',
    type: 'numeric',
    correctAnswer: 0.5,
    tolerance: 0.01,
    hint: '5π/6 lies in Quadrant II with reference angle π/6 above the negative x-axis.',
    solutionSteps: [
      { label: 'Quadrant II Check', tex: 'y > 0', note: 'Sine is positive above the x-axis.' },
      { label: 'Reference Angle π/6', tex: '\\sin(\\pi/6) = 0.5', note: 'Half unit vertical leg.' },
    ],
  },
  {
    id: 'trig-2',
    prompt: 'Which expression gives the period of y = 4 cos(3x)?',
    promptTex: 'T = \\dfrac{2\\pi}{|B|}',
    type: 'multiple-choice',
    options: [
      { id: 'a', label: 'Period A', tex: '\\dfrac{2\\pi}{3}' },
      { id: 'b', label: 'Period B', tex: '6\\pi' },
      { id: 'c', label: 'Period C', tex: '4\\pi' },
      { id: 'd', label: 'Period D', tex: '\\dfrac{\\pi}{3}' },
    ],
    correctAnswer: 'a',
    hint: 'Divide fundamental circle period 2π by frequency B = 3.',
    solutionSteps: [
      { label: 'Extract B = 3', tex: 'B = 3', note: 'Amplitude 4 affects height, not period.' },
      { label: 'Divide 2π', tex: 'T = \\dfrac{2\\pi}{3}', note: 'Compressed horizontally 3×.' },
    ],
  },
  {
    id: 'trig-3',
    prompt: 'Convert 180° into radians (approx to 2 decimal places).',
    type: 'numeric',
    correctAnswer: 3.14,
    tolerance: 0.02,
    hint: 'A full circle 360° is 2π radians.',
    solutionSteps: [
      { label: 'Radian Ratio', tex: '180^\\circ \\cdot \\dfrac{\\pi}{180^\\circ} = \\pi \\approx 3.14', note: 'Half turn.' },
    ],
  },
  {
    id: 'trig-4',
    prompt: 'Find the magnitude of resultant vector u + v if u = ⟨1, 2⟩ and v = ⟨2, 2⟩.',
    promptTex: '\\|\\langle 1, 2 \\rangle + \\langle 2, 2 \\rangle\\| = \\text{?}',
    type: 'numeric',
    correctAnswer: 5,
    tolerance: 0.01,
    hint: 'Add components first to obtain ⟨3, 4⟩, then apply Pythagoras √(3² + 4²).',
    solutionSteps: [
      { label: 'Component Sum', tex: '\\langle 1+2,\\; 2+2 \\rangle = \\langle 3, 4 \\rangle', note: 'Sum x and y legs.' },
      { label: 'Euclidean Norm', tex: '\\sqrt{3^2 + 4^2} = \\sqrt{25} = 5', note: '3-4-5 right triangle.' },
    ],
  },
];

const STD_CODES = ['MA.912.T.2.2', 'MA.912.T.3.1', 'MA.912.T.3.2', 'MA.912.NSO.3.1'];

export function UnitCircleLessonPage() {
  const reducedMotion = useReducedMotion();
  const [stepIdx, setStepIdx] = useState(0);
  const [autoPlaySteps, setAutoPlaySteps] = useState(false);
  const [freqTest, setFreqTest] = useState(2.0);
  const [windSpeed, setWindSpeed] = useState(40);
  const planeAirspeed = 180;
  const groundSpeed = Math.hypot(planeAirspeed, windSpeed);
  const driftDeg = (Math.atan2(windSpeed, planeAirspeed) * 180) / Math.PI;

  useEffect(() => {
    if (!autoPlaySteps) return;
    const timer = window.setInterval(() => {
      setStepIdx((prev) => (prev + 1) % TRIG_STEPS.length);
    }, 2800);
    return () => window.clearInterval(timer);
  }, [autoPlaySteps]);

  const precalcNodes = CURRICULUM_NODES.filter((n) => n.courseId === 'precalculus');
  const idx = precalcNodes.findIndex((n) => n.id === 'pc-unit-circle');
  const nextNode = precalcNodes[(idx + 1) % precalcNodes.length];
  const stepPct = Math.round(((stepIdx + 1) / TRIG_STEPS.length) * 100);
  const periodVal = (Math.PI * 2) / freqTest;

  return (
    <AtlasShell activeCourse="precalculus">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-12">
        <LessonNavHeader courseId="precalculus" activeNodeId="pc-unit-circle" code="PC-01" />

        <header className="instrument-frame fiducial-frame p-6 sm:p-7 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="font-mono-data text-[11px] uppercase tracking-[0.2em] text-[#FF8563]">
              Precalculus Flagship · Circular Harmonics &amp; Vector Observatory
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
            Unit Circle Projections, Sinusoids &amp; Vector Addition
          </h1>
          <p className="text-sm sm:text-base text-[#A8B2C6] leading-relaxed max-w-4xl">
            Sine and cosine are simply the horizontal and vertical shadows of steady circular
            rotation unwrapped along time — forming the language of oscillations, signals, and
            2D directional vectors.
          </p>
        </header>

        {/* LAYER 1: VISUAL INTUITION */}
        <section id="layer-1" className="space-y-4 scroll-mt-24">
          <span className="font-mono-data text-[11px] uppercase tracking-widest text-[#FF8563]">
            Layer 01 · Visual Intuition — Live Unit Circle Oscillation
          </span>
          <UnitCircleWaveCanvas />
        </section>

        {/* LAYER 2: MATHEMATICAL FORMALIZATION */}
        <section id="layer-2" className="space-y-4 scroll-mt-24">
          <div>
            <span className="font-mono-data text-[11px] uppercase tracking-widest text-[#FF8563]">
              Layer 02 · Visualized Circular &amp; Wave Architecture
            </span>
            <h2 className="font-serif-editorial text-2xl sm:text-3xl text-[#F7F4EC]">
              Every Harmonic Formula Illustrated Geometrically
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="instrument-frame p-5 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono-data text-[10.5px] uppercase text-[#F4C46C]">
                  Circular Coordinates
                </span>
                <span className="font-mono-data text-[9.5px] px-2 py-0.5 rounded-full border border-[#F4C46C]/20 bg-[#0B0C12] text-[#F4C46C]">
                  EQ 01
                </span>
              </div>
              <div aria-label="Unit circle projection (cos theta, sin theta)">
                <EquationMiniVisual kind="unit-circle-proj" accent="#FF8563" />
              </div>
              <div className="instrument-panel px-3 py-2 overflow-x-auto">
                <MathTex tex="P(\theta) = (\cos\theta,\; \sin\theta)" displayMode className="text-[#F7F4EC]" />
              </div>
              <p className="text-xs text-[#A8B2C6]">
                By Pythagoras on radius 1: <MathTex tex="\cos^2\theta + \sin^2\theta = 1" /> for all real angles.
              </p>
            </div>
            <div className="instrument-frame p-5 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono-data text-[10.5px] uppercase text-[#FF8563]">
                  Sinusoidal Model
                </span>
                <span className="font-mono-data text-[9.5px] px-2 py-0.5 rounded-full border border-[#F4C46C]/20 bg-[#0B0C12] text-[#F4C46C]">
                  EQ 02
                </span>
              </div>
              <div aria-label="Amplitude and period identity">
                <EquationMiniVisual kind="trig-pythag-id" accent="#FF8563" />
              </div>
              <div className="instrument-panel px-3 py-2 overflow-x-auto">
                <MathTex tex="y = A\sin\!\big(B(x - C)\big) + D" displayMode className="text-[#F7F4EC]" />
              </div>
              <p className="text-xs text-[#A8B2C6]">
                Amplitude <MathTex tex="|A|" />, angular frequency <MathTex tex="B" />, period{' '}
                <MathTex tex="T = \frac{2\pi}{|B|}" />.
              </p>
            </div>
            <div className="instrument-frame p-5 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono-data text-[10.5px] uppercase text-[#46D6E8]">
                  Vector Components
                </span>
                <span className="font-mono-data text-[9.5px] px-2 py-0.5 rounded-full border border-[#F4C46C]/20 bg-[#0B0C12] text-[#F4C46C]">
                  EQ 03
                </span>
              </div>
              <div aria-label="Orthogonal vector resultant parallelogram">
                <EquationMiniVisual kind="vector-parallelogram" accent="#46D6E8" />
              </div>
              <div className="instrument-panel px-3 py-2 overflow-x-auto">
                <MathTex tex="\|\vec{v}\| = \sqrt{v_x^2 + v_y^2},\quad \tan\theta = \frac{v_y}{v_x}" displayMode className="text-[#F7F4EC]" />
              </div>
              <p className="text-xs text-[#A8B2C6]">
                Trigonometry converts magnitude &amp; bearing back into orthogonal <MathTex tex="x, y" /> components.
              </p>
            </div>
          </div>
        </section>

        {/* LAYER 3: GUIDED WORKED EXAMPLE */}
        <section id="layer-3" className="instrument-frame fiducial-frame p-5 sm:p-6 space-y-5 scroll-mt-24">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <span className="font-mono-data text-[11px] uppercase tracking-widest text-[#FF8563] block">
                Layer 03 · Synchronized Guided Step-by-Step Analysis
              </span>
              <h2 className="font-serif-editorial text-2xl sm:text-3xl text-[#F7F4EC]">
                Graphing &amp; Evaluating <MathTex tex="y = 3\sin(2x)" />
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setAutoPlaySteps(false);
                  setStepIdx((prev) => (prev - 1 + TRIG_STEPS.length) % TRIG_STEPS.length);
                }}
                aria-label="Previous trig step"
                className="p-1.5 rounded-full border border-[#F4C46C]/25 bg-[#0B0C12] text-[#A8B2C6] hover:text-[#F7F4EC] hover:border-[#F4C46C]/50 transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setAutoPlaySteps((p) => !p)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-mono-data border transition-all"
                style={{
                  borderColor: autoPlaySteps ? '#FF8563' : 'rgba(244, 196, 108, 0.28)',
                  backgroundColor: autoPlaySteps ? 'rgba(255, 133, 99, 0.18)' : '#0B0C12',
                  color: autoPlaySteps ? '#FF8563' : '#F7F4EC',
                }}
              >
                {autoPlaySteps ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                {autoPlaySteps ? 'Pause Walkthrough' : 'Auto-Play Steps'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setAutoPlaySteps(false);
                  setStepIdx((prev) => (prev + 1) % TRIG_STEPS.length);
                }}
                aria-label="Next trig step"
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
                background: 'linear-gradient(90deg, #F4C46C, #FF8563)',
                boxShadow: '0 0 10px #FF8563',
              }}
              initial={false}
              animate={{ width: `${stepPct}%` }}
              transition={reducedMotion ? { duration: 0 } : { type: 'spring', stiffness: 260, damping: 28 }}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            <div className="lg:col-span-7 space-y-3">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {TRIG_STEPS.map((st, idxStep) => (
                  <button
                    key={st.title}
                    type="button"
                    onClick={() => {
                      setAutoPlaySteps(false);
                      setStepIdx(idxStep);
                    }}
                    className={`p-3 rounded-xl text-left border transition-all ${
                      stepIdx === idxStep
                        ? 'bg-[#FF8563]/14 border-[#FF8563] text-[#F7F4EC]'
                        : 'bg-[#0B0C12] border-[#F4C46C]/16 text-[#A8B2C6] hover:text-[#F7F4EC] hover:border-[#F4C46C]/40'
                    }`}
                  >
                    <span className="font-mono-data text-[10px] text-[#FF8563] block">STEP 0{idxStep + 1}</span>
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
                  <p className="font-mono-data text-xs text-[#FF8563]">{TRIG_STEPS[stepIdx].title}</p>
                  <div className="overflow-x-auto">
                    <MathTex tex={TRIG_STEPS[stepIdx].tex} displayMode className="text-[#F7F4EC]" />
                  </div>
                  <p className="text-xs text-[#A8B2C6]">{TRIG_STEPS[stepIdx].note}</p>
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="lg:col-span-5">
              <DerivationStepVisual
                visualKinds={['unit-circle-proj', 'trig-pythag-id', 'sinusoid-wave', 'right-trig-ratios']}
                stepIndex={stepIdx}
                totalSteps={TRIG_STEPS.length}
                stepTitle={TRIG_STEPS[stepIdx].title}
                accent="#FF8563"
              />
            </div>
          </div>
        </section>

        {/* LAYER 4: PRACTICE */}
        <section id="layer-4" className="space-y-4 scroll-mt-24">
          <div>
            <span className="font-mono-data text-[11px] uppercase tracking-widest text-[#FF8563]">
              Layer 04 · Interactive Check &amp; Vector Norm Drills
            </span>
            <h2 className="font-serif-editorial text-2xl sm:text-3xl text-[#F7F4EC]">
              Test Unit Circle Values, Periods &amp; Vector Magnitudes
            </h2>
          </div>
          <PracticeEngine
            questions={TRIG_PRACTICE}
            accentColor="#FF8563"
            visualKinds={['unit-circle-proj', 'sinusoid-wave', 'trig-pythag-id', 'vector-parallelogram']}
          />
        </section>

        {/* LAYER 5: MISCONCEPTION VISUALIZED */}
        <motion.section
          id="layer-5"
          initial={reducedMotion ? false : { opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="instrument-frame p-5 sm:p-6 space-y-4 border-[#FF8563]/40 scroll-mt-24"
        >
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-[#FF8563] shrink-0 mt-0.5" />
            <div>
              <span className="font-mono-data text-[11px] uppercase tracking-widest text-[#FF8563] block">
                Layer 05 · Typical Error Visualized — The Frequency Stretch Trap
              </span>
              <h2 className="font-serif-editorial text-2xl sm:text-3xl text-[#F7F4EC]">
                Why <MathTex tex="y = \sin(Bx)" /> Compresses Horizontally When <MathTex tex="B > 1" />
              </h2>
              <p className="text-xs text-[#A8B2C6] mt-1">
                Multiplying <MathTex tex="x" /> by <MathTex tex="B" /> makes the angle race{' '}
                {freqTest.toFixed(1)}× faster around the unit circle, shrinking period from{' '}
                <MathTex tex="2\pi" /> down to <MathTex tex={`2\\pi/${freqTest.toFixed(1)}`} />.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
            <div className="md:col-span-4 space-y-3">
              <label className="block space-y-1 text-xs">
                <span className="flex justify-between font-mono-data text-[#A8B2C6]">
                  <span>Multiplier B in sin(Bx)</span>
                  <span className="text-[#FF8563]">B = {freqTest.toFixed(1)}</span>
                </span>
                <input
                  type="range"
                  min={0.5}
                  max={3.5}
                  step={0.1}
                  value={freqTest}
                  onChange={(e) => setFreqTest(Number(e.target.value))}
                  className="meridian-slider"
                  style={{ ['--slider-accent' as string]: '#FF8563' }}
                />
              </label>

              <div className="instrument-panel p-3.5 text-xs font-mono-data space-y-2">
                <div className="flex justify-between text-[#46D6E8]">
                  <span>Parent sin(x):</span>
                  <span>2π ≈ 6.28 rad</span>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-[#FF8563]">
                    <span>sin({freqTest.toFixed(1)}x) period:</span>
                    <span>{periodVal.toFixed(2)} rad</span>
                  </div>
                  <div className="h-2 rounded-full bg-[#060609] overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-[#FF8563]"
                      initial={false}
                      animate={{ width: `${Math.min(100, (periodVal / (Math.PI * 4)) * 100)}%` }}
                      transition={reducedMotion ? { duration: 0 } : { type: 'spring', stiffness: 250, damping: 24 }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="md:col-span-8">
              <svg
                viewBox="0 0 560 140"
                className="w-full h-36 rounded-xl bg-[#060609] border border-[#F4C46C]/20"
                role="img"
                aria-label="Comparison of parent sin(x) and scaled sin(Bx) wave frequency"
              >
                <line x1="16" y1="70" x2="544" y2="70" stroke="rgba(244,196,108,0.18)" strokeWidth="1" />
                <path
                  d={Array.from({ length: 120 }, (_, i) => {
                    const t = (i / 119) * Math.PI * 4;
                    const x = 16 + (i / 119) * 528;
                    const y = 70 - Math.sin(t) * 44;
                    return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
                  }).join(' ')}
                  fill="none"
                  stroke="rgba(70, 214, 232, 0.5)"
                  strokeWidth="1.8"
                  strokeDasharray="4 4"
                />
                <path
                  d={Array.from({ length: 180 }, (_, i) => {
                    const t = (i / 179) * Math.PI * 4;
                    const x = 16 + (i / 179) * 528;
                    const y = 70 - Math.sin(freqTest * t) * 44;
                    return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
                  }).join(' ')}
                  fill="none"
                  stroke="#FF8563"
                  strokeWidth="2.4"
                />
              </svg>
            </div>
          </div>
        </motion.section>

        {/* LAYER 6: REAL-WORLD APPLICATION + EMBEDDED VECTOR PARALLELOGRAM LAB */}
        <section id="layer-6" className="space-y-5 scroll-mt-24">
          <div id="vectors" className="sr-only" aria-hidden="true" />
          <span className="font-mono-data text-[11px] uppercase tracking-widest text-[#46D6E8] block">
            Layer 06 · Vector Addition &amp; Real-World Crosswind Resultant
          </span>

          <div className="instrument-frame p-5 sm:p-6 grid grid-cols-1 md:grid-cols-3 gap-5 items-center">
            <div className="md:col-span-2 space-y-2">
              <h2 className="font-serif-editorial text-2xl text-[#F7F4EC]">
                Aircraft Bearing + Crosswind Resultant
              </h2>
              <p className="text-xs sm:text-sm text-[#A8B2C6] leading-relaxed">
                An aircraft flying due north at 180 knots encounters an eastern crosswind of{' '}
                {windSpeed} knots. Adding the two orthogonal vectors yields true ground speed{' '}
                <strong className="text-[#FF8563]">{groundSpeed.toFixed(1)} kt</strong> shifted{' '}
                <strong className="text-[#F4C46C]">{driftDeg.toFixed(1)}°</strong> off heading.
              </p>
            </div>
            <label className="space-y-1 text-xs">
              <span className="flex justify-between font-mono-data text-[#A8B2C6]">
                <span>East Crosswind</span>
                <span className="text-[#46D6E8]">{windSpeed} kt</span>
              </span>
              <input
                type="range"
                min={0}
                max={95}
                step={5}
                value={windSpeed}
                onChange={(e) => setWindSpeed(Number(e.target.value))}
                className="meridian-slider"
                style={{ ['--slider-accent' as string]: '#46D6E8' }}
              />
            </label>
          </div>

          <VectorParallelogramCanvas />
        </section>

        {/* LAYER 7: VERIFIED FLORIDA B.E.S.T. STANDARDS + NEXT LESSON */}
        <section id="layer-7" className="instrument-frame p-5 sm:p-6 space-y-5 scroll-mt-24">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="font-mono-data text-[10px] uppercase tracking-[0.18em] text-[#FF8563] block">
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
                    <span className="font-mono-data text-xs text-[#FF8563]">{s.code}</span>
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
                  Continue Precalculus Honors Sequence
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
                  String 3D Harmonics
                </Link>
                <Link
                  to={nextNode.route}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold text-[#060609] hover:brightness-110 transition-all shadow-[0_0_22px_-6px_rgba(255,133,99,0.55)]"
                  style={{ background: 'linear-gradient(135deg, #FF8563, #FFE29E)' }}
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
