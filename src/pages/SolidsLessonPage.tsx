import { Suspense, lazy, useEffect, useRef, useState } from 'react';
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
import { SolidNetLab } from '../instruments/SolidNetLab';
import { EquationMiniVisual } from '../visuals/equations/EquationMiniVisual';
import type { SolidHighlightPart } from '../visuals/solids/SolidNetScene';

const LazySolidNetScene = lazy(() => import('../visuals/solids/SolidNetScene'));

const WORKED_3D_STEPS: {
  title: string;
  tex: string;
  note: string;
  unfold: number;
  highlight: SolidHighlightPart;
  internalTriangle: boolean;
}[] = [
  {
    title: 'Step 1 · Inspect Internal Right Triangle',
    tex: '\\text{Base } s = 6\\text{ cm} \\implies \\text{apothem } \\frac{s}{2} = 3\\text{ cm},\\quad h = 4\\text{ cm}',
    note: 'Look inside the closed pyramid: the vertical altitude h (coral) and half-base apothem s/2 (gold) meet at 90°.',
    unfold: 0,
    highlight: 'all',
    internalTriangle: true,
  },
  {
    title: 'Step 2 · Solve Slant Height via Pythagoras',
    tex: 'l = \\sqrt{h^2 + \\left(\\frac{s}{2}\\right)^2} = \\sqrt{4^2 + 3^2} = \\sqrt{25} = 5\\text{ cm}',
    note: 'The jade hypotenuse l = 5 cm is the true height of each triangular lateral wall.',
    unfold: 0,
    highlight: 'lateral',
    internalTriangle: true,
  },
  {
    title: 'Step 3 · Unfold Hinged Net into 2D Faces',
    tex: 'B = 6^2 = 36\\text{ cm}^2,\\quad L = 4\\left(\\tfrac{1}{2} \\cdot 6 \\cdot 5\\right) = 60\\text{ cm}^2',
    note: 'Unfolding flattens the square base and four congruent triangles onto one plane without changing area.',
    unfold: 1,
    highlight: 'all',
    internalTriangle: false,
  },
  {
    title: 'Step 4 · Compute Total Surface Area & Volume',
    tex: 'SA = 36 + 60 = 96\\text{ cm}^2,\\quad V = \\tfrac{1}{3}Bh = \\tfrac{1}{3}(36)(4) = 48\\text{ cm}^3',
    note: 'Surface area sums the 2D net (cm²); volume fills one-third of the enclosing 6 × 6 × 4 prism (cm³).',
    unfold: 0,
    highlight: 'base',
    internalTriangle: false,
  },
];

const GEOMETRY_QUESTIONS: PracticeQuestion[] = [
  {
    id: 'g1',
    type: 'numeric',
    prompt: 'A right rectangular prism measures 4 cm wide, 3 cm deep, and 5 cm tall. What is its total surface area?',
    promptTex: 'SA = 2B + Ph \\quad (w = 4,\\; d = 3,\\; h = 5)',
    correctAnswer: 94,
    tolerance: 0.05,
    unitLabel: 'cm²',
    hint: 'Compute two bases (2 × 4 × 3) plus lateral area P·h where P = 2(4 + 3).',
    solutionSteps: [
      {
        label: 'Base Area & Perimeter',
        tex: 'B = 4 \\cdot 3 = 12,\\quad P = 2(4 + 3) = 14',
        note: 'Two identical rectangular bases contribute 2B = 24 cm².',
      },
      {
        label: 'Add Lateral Band',
        tex: 'SA = 2(12) + 14(5) = 24 + 70 = 94\\text{ cm}^2',
        note: 'Verified across all 6 faces of the unfolded net.',
      },
    ],
  },
  {
    id: 'g2',
    type: 'numeric',
    prompt: 'A square pyramid has base side s = 10 m and vertical altitude h = 12 m. Find its slant height l.',
    promptTex: 'l = \\sqrt{h^2 + (s/2)^2}',
    correctAnswer: 13,
    tolerance: 0.05,
    unitLabel: 'm',
    hint: 'The apothem is half the base side: s/2 = 5 m. Use the 5-12-13 Pythagorean triple.',
    solutionSteps: [
      {
        label: 'Apply Internal Right Triangle',
        tex: 'l = \\sqrt{12^2 + 5^2} = \\sqrt{144 + 25} = \\sqrt{169} = 13\\text{ m}',
        note: 'Slant height is strictly greater than vertical altitude h = 12 m.',
      },
    ],
  },
  {
    id: 'g3',
    type: 'multiple-choice',
    prompt: 'If every linear dimension of a prism is tripled (scale factor k = 3), how does its volume change?',
    promptTex: 'V_{\\text{scaled}} = k^3 \\cdot V_{\\text{original}}',
    options: [
      { id: 'a', label: 'Increases by a factor of 3' },
      { id: 'b', label: 'Increases by a factor of 9' },
      { id: 'c', label: 'Increases by a factor of 27' },
      { id: 'd', label: 'Increases by a factor of 6' },
    ],
    correctAnswer: 'c',
    hint: 'Surface area scales by k² while 3D volume scales in all three orthogonal directions by k³.',
    solutionSteps: [
      {
        label: '3D Dilation Scaling Law (MA.912.GR.4.3)',
        tex: '(3w)(3d)(3h) = 3^3(wdh) = 27V',
        note: 'Volume scales with the cube of the linear scale factor: 3³ = 27.',
      },
    ],
  },
  {
    id: 'g4',
    type: 'multiple-choice',
    prompt: 'A plane slices horizontally through a right square pyramid parallel to its base (MA.912.GR.4.1). What 2D cross-section results?',
    options: [
      { id: 'a', label: 'An isosceles triangle' },
      { id: 'b', label: 'A smaller square similar to the base' },
      { id: 'c', label: 'A regular pentagon' },
      { id: 'd', label: 'A circle' },
    ],
    correctAnswer: 'b',
    hint: 'Enable the Cross-Section Slicer in Layer 01 above on the Square Pyramid to see the highlighted horizontal slice!',
    solutionSteps: [
      {
        label: 'Parallel Cross-Section Invariance',
        tex: '\\text{Slice parallel to square base} \\implies \\text{scaled square}',
        note: 'At fraction t ∈ (0, 1) of height, the square has side (1 - t)·s.',
      },
    ],
  },
];

const LESSON_STANDARD_CODES = ['MA.912.GR.4.1', 'MA.912.GR.4.5', 'MA.912.GR.4.6'];

export function SolidsLessonPage() {
  const reducedMotion = useReducedMotion();

  const [stepIdx, setStepIdx] = useState(0);
  const [autoPlaySteps, setAutoPlaySteps] = useState(false);
  const [mountWorked3D, setMountWorked3D] = useState(false);
  const worked3DRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!autoPlaySteps) return;
    const timer = window.setInterval(() => {
      setStepIdx((prev) => (prev + 1) % WORKED_3D_STEPS.length);
    }, 2800);
    return () => window.clearInterval(timer);
  }, [autoPlaySteps]);

  useEffect(() => {
    const el = worked3DRef.current;
    if (!el || mountWorked3D) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setMountWorked3D(true);
          io.disconnect();
        }
      },
      { rootMargin: '220px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [mountWorked3D]);

  // Layer 5 misconception: Altitude vs Slant Height
  const [misSide, setMisSide] = useState(6);
  const [misHeight, setMisHeight] = useState(4);
  const slantVal = Math.sqrt(misHeight * misHeight + (misSide / 2) * (misSide / 2));
  const trueLateral = 2 * misSide * slantVal;
  const wrongLateral = 2 * misSide * misHeight;
  const errorGap = trueLateral - wrongLateral;

  // Layer 6 Architectural Atrium Estimator
  const [atriumSide, setAtriumSide] = useState(18);
  const [atriumHeight, setAtriumHeight] = useState(12);
  const atriumSlant = Math.sqrt(atriumHeight ** 2 + (atriumSide / 2) ** 2);
  const atriumGlass = 2 * atriumSide * atriumSlant;
  const atriumVol = (1 / 3) * atriumSide * atriumSide * atriumHeight;

  const activeStep = WORKED_3D_STEPS[stepIdx];
  const stepPct = Math.round(((stepIdx + 1) / WORKED_3D_STEPS.length) * 100);
  const nextBridgeNode = CURRICULUM_NODES.find((n) => n.id === 'a2-complex');

  return (
    <AtlasShell activeCourse="geometry">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-12">
        <LessonNavHeader courseId="geometry" activeNodeId="g-solids" code="G-09" />

        {/* Header */}
        <header className="instrument-frame fiducial-frame p-6 sm:p-7 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="font-mono-data text-[11px] uppercase tracking-[0.2em] text-[#46D6E8]">
              Geometry 3D Flagship · Hinged Nets &amp; Planar Slicing
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
            3D Solids, Articulated Nets &amp; Cross-Sections
          </h1>
          <p className="text-sm sm:text-base text-[#A8B2C6] leading-relaxed max-w-4xl">
            Surface area is not a formula to memorize — it is literally the 2D skin of a solid
            hinged open onto a flat plane. Unfold, orbit, resize, and slice three-dimensional
            solids directly below.
          </p>
        </header>

        {/* LAYER 1: 3D Visual Intuition & Embedded SolidNetLab */}
        <section id="layer-1" className="space-y-4 scroll-mt-24">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="font-mono-data text-[11px] uppercase tracking-widest text-[#46D6E8]">
                Layer 01 · Interactive 3D Visual Intuition
              </span>
              <h2 className="font-serif-editorial text-2xl sm:text-3xl text-[#F7F4EC]">
                Unfold 3D Hinges Into Planar 2D Nets
              </h2>
            </div>
            <Link
              to="/instruments"
              className="inline-flex items-center gap-1.5 text-xs font-mono-data text-[#46D6E8] hover:underline"
            >
              <Sparkles className="w-3.5 h-3.5" /> Open in 3D Labs
            </Link>
          </div>
          <SolidNetLab />
        </section>

        {/* LAYER 2: Clean Formalization */}
        <section id="layer-2" className="space-y-4 scroll-mt-24">
          <div>
            <span className="font-mono-data text-[11px] uppercase tracking-widest text-[#46D6E8]">
              Layer 02 · Visualized 3D Surface &amp; Volume Equations
            </span>
            <h2 className="font-serif-editorial text-2xl sm:text-3xl text-[#F7F4EC]">
              Surface Area via Unfolded Nets &amp; Volume Conservation
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="instrument-frame p-5 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono-data text-[10.5px] text-[#46D6E8] uppercase tracking-wider">
                  Right Prisms
                </span>
                <span className="font-mono-data text-[9.5px] px-2 py-0.5 rounded-full border border-[#F4C46C]/20 bg-[#0B0C12] text-[#F4C46C]">
                  EQ 01
                </span>
              </div>
              <div aria-label="Unfolded prism net preview">
                <EquationMiniVisual kind="prism-net" accent="#46D6E8" />
              </div>
              <div className="instrument-panel px-3 py-2 overflow-x-auto">
                <MathTex tex="SA = 2B + Ph \qquad V = Bh" displayMode className="text-[#F7F4EC]" />
              </div>
              <p className="text-xs text-[#A8B2C6] leading-relaxed">
                Two congruent bases (<MathTex tex="2B" />) plus one unwrapped rectangular lateral
                band of width <MathTex tex="P" /> (base perimeter) and height <MathTex tex="h" />.
              </p>
            </div>

            <div className="instrument-frame p-5 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono-data text-[10.5px] text-[#F4C46C] uppercase tracking-wider">
                  Regular Pyramids &amp; Slant Height
                </span>
                <span className="font-mono-data text-[9.5px] px-2 py-0.5 rounded-full border border-[#F4C46C]/20 bg-[#0B0C12] text-[#F4C46C]">
                  EQ 02
                </span>
              </div>
              <div aria-label="Pyramid net and slant height l preview">
                <EquationMiniVisual kind="pyramid-slant" accent="#F4C46C" />
              </div>
              <div className="instrument-panel px-3 py-2 overflow-x-auto">
                <MathTex
                  tex="SA = B + \tfrac{1}{2}Pl \qquad V = \tfrac{1}{3}Bh"
                  displayMode
                  className="text-[#F7F4EC]"
                />
              </div>
              <p className="text-xs text-[#A8B2C6] leading-relaxed">
                Lateral triangles taper to an apex along slant height{' '}
                <MathTex tex="l = \sqrt{h^2 + a^2}" />, while volume occupies one-third of its
                parent prism.
              </p>
            </div>

            <div className="instrument-frame p-5 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono-data text-[10.5px] text-[#45E6A6] uppercase tracking-wider">
                  Cylinders &amp; Scaling Laws
                </span>
                <span className="font-mono-data text-[9.5px] px-2 py-0.5 rounded-full border border-[#F4C46C]/20 bg-[#0B0C12] text-[#F4C46C]">
                  EQ 03
                </span>
              </div>
              <div aria-label="Unrolled cylinder 2pi r by h band preview">
                <EquationMiniVisual kind="cylinder-unroll" accent="#45E6A6" />
              </div>
              <div className="instrument-panel px-3 py-2 overflow-x-auto">
                <MathTex
                  tex="SA' = k^2 SA \qquad V' = k^3 V"
                  displayMode
                  className="text-[#F7F4EC]"
                />
              </div>
              <p className="text-xs text-[#A8B2C6] leading-relaxed">
                Dilating linear dimensions by <MathTex tex="k" /> scales 2D net area by{' '}
                <MathTex tex="k^2" /> and 3D volume by <MathTex tex="k^3" />.
              </p>
            </div>
          </div>
        </section>

        {/* LAYER 3: Synchronized 3D Guided Worked Example */}
        <section id="layer-3" className="instrument-frame fiducial-frame p-5 sm:p-7 space-y-5 scroll-mt-24">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <Layers className="w-4 h-4 text-[#46D6E8]" />
              <div>
                <span className="font-mono-data text-[11px] uppercase tracking-widest text-[#46D6E8] block">
                  Layer 03 · Synchronized 3D Worked Example
                </span>
                <h2 className="font-serif-editorial text-2xl sm:text-3xl text-[#F7F4EC]">
                  Square Pyramid (<MathTex tex="s = 6\text{ cm},\; h = 4\text{ cm}" />)
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setAutoPlaySteps(false);
                  setStepIdx((prev) => (prev - 1 + WORKED_3D_STEPS.length) % WORKED_3D_STEPS.length);
                }}
                aria-label="Previous 3D step"
                className="p-1.5 rounded-full border border-[#F4C46C]/25 bg-[#0B0C12] text-[#A8B2C6] hover:text-[#F7F4EC] hover:border-[#F4C46C]/50 transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setAutoPlaySteps((p) => !p)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-mono-data border transition-all"
                style={{
                  borderColor: autoPlaySteps ? '#46D6E8' : 'rgba(244, 196, 108, 0.28)',
                  backgroundColor: autoPlaySteps ? 'rgba(70, 214, 232, 0.18)' : '#0B0C12',
                  color: autoPlaySteps ? '#46D6E8' : '#F7F4EC',
                }}
              >
                {autoPlaySteps ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                {autoPlaySteps ? 'Pause 3D Unfold' : 'Auto-Play Steps'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setAutoPlaySteps(false);
                  setStepIdx((prev) => (prev + 1) % WORKED_3D_STEPS.length);
                }}
                aria-label="Next 3D step"
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
                background: 'linear-gradient(90deg, #F4C46C, #46D6E8)',
                boxShadow: '0 0 10px #46D6E8',
              }}
              initial={false}
              animate={{ width: `${stepPct}%` }}
              transition={reducedMotion ? { duration: 0 } : { type: 'spring', stiffness: 260, damping: 28 }}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            <div className="lg:col-span-5 space-y-2.5">
              {WORKED_3D_STEPS.map((st, idxStep) => {
                const active = stepIdx === idxStep;
                return (
                  <motion.button
                    key={st.title}
                    type="button"
                    whileTap={reducedMotion ? undefined : { scale: 0.99 }}
                    onClick={() => {
                      setAutoPlaySteps(false);
                      setStepIdx(idxStep);
                    }}
                    className="w-full text-left p-4 rounded-xl border transition-all space-y-1.5"
                    style={{
                      backgroundColor: active ? 'rgba(70, 214, 232, 0.1)' : '#0B0C12',
                      borderColor: active ? '#46D6E8' : 'rgba(244, 196, 108, 0.16)',
                      boxShadow: active ? '0 0 22px -10px rgba(70, 214, 232, 0.85)' : undefined,
                    }}
                  >
                    <p className="font-mono-data text-[11px] text-[#46D6E8]">{st.title}</p>
                    <div className="overflow-x-auto">
                      <MathTex tex={st.tex} displayMode className="text-sm text-[#F7F4EC]" />
                    </div>
                    <p className="text-xs text-[#A8B2C6] leading-relaxed">{st.note}</p>
                  </motion.button>
                );
              })}
            </div>

            <div ref={worked3DRef} className="lg:col-span-7 space-y-3">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={stepIdx}
                  initial={reducedMotion ? false : { opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reducedMotion ? undefined : { opacity: 0, y: -6 }}
                  transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
                  className="instrument-panel px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 border-[#46D6E8]/35"
                >
                  <span className="font-mono-data text-[11px] text-[#46D6E8]">
                    3D STAGE · 0{stepIdx + 1} / 0{WORKED_3D_STEPS.length}
                  </span>
                  <span className="text-xs text-[#F7F4EC]">
                    {activeStep.unfold === 1 ? 'Unfolded 2D Planar Net' : 'Folded 3D Solid'}
                  </span>
                </motion.div>
              </AnimatePresence>

              <div className="instrument-frame overflow-hidden">
                {mountWorked3D ? (
                  <Suspense
                    fallback={
                      <div className="h-[380px] flex items-center justify-center bg-[#0B0C12] font-mono-data text-xs text-[#A8B2C6]">
                        Loading 3D Worked Example…
                      </div>
                    }
                  >
                    <LazySolidNetScene
                      solid="square-pyramid"
                      width={3.0}
                      depth={3.0}
                      height={2.0}
                      unfold={activeStep.unfold}
                      highlightPart={activeStep.highlight}
                      showInternalTriangle={activeStep.internalTriangle}
                      heightClass="h-[380px] sm:h-[420px]"
                    />
                  </Suspense>
                ) : (
                  <div className="h-[380px] sm:h-[420px] flex flex-col items-center justify-center gap-3 bg-[#060609] p-6 text-center">
                    <div className="w-full max-w-sm" aria-label="Pyramid net preview">
                      <EquationMiniVisual kind="pyramid-slant" accent="#46D6E8" heightClass="h-[170px]" />
                    </div>
                    <button
                      type="button"
                      onClick={() => setMountWorked3D(true)}
                      className="px-4 py-2 rounded-full text-xs font-mono-data bg-[#46D6E8]/15 text-[#46D6E8] border border-[#46D6E8]/45 hover:bg-[#46D6E8]/25 transition-colors"
                    >
                      Activate 3D Interactive Worked Pyramid
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* LAYER 4: Interactive Practice */}
        <section id="layer-4" className="space-y-4 scroll-mt-24">
          <div>
            <span className="font-mono-data text-[11px] uppercase tracking-widest text-[#46D6E8]">
              Layer 04 · Interactive Mastery Practice
            </span>
            <h2 className="font-serif-editorial text-2xl sm:text-3xl text-[#F7F4EC]">
              Calculate Nets, Slant Heights &amp; Cross-Sections
            </h2>
          </div>
          <PracticeEngine
            questions={GEOMETRY_QUESTIONS}
            accentColor="#46D6E8"
            visualKinds={['prism-net', 'pyramid-slant', 'area-scale-k2', 'cylinder-unroll']}
          />
        </section>

        {/* LAYER 5: Visualized Misconception (Altitude h vs Slant Height l) */}
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
                Vertical Altitude (<MathTex tex="h" />) Is NOT Triangle Slant Height (<MathTex tex="l" />)
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
            <div className="lg:col-span-6 instrument-panel p-4 sm:p-5 bg-[#060609]">
              <svg
                viewBox="0 0 420 260"
                className="w-full h-auto"
                role="img"
                aria-label="Cross-section right triangle showing altitude h, apothem s/2, and slant height l"
              >
                <defs>
                  <pattern id="aureaSolidsGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(244,196,108,0.06)" strokeWidth="1" />
                  </pattern>
                </defs>
                <rect width="420" height="260" fill="url(#aureaSolidsGrid)" />

                <polygon
                  points="80,215 340,215 210,45"
                  fill="rgba(70, 214, 232, 0.08)"
                  stroke="rgba(70, 214, 232, 0.45)"
                  strokeWidth="1.5"
                />
                <line x1="210" y1="45" x2="210" y2="215" stroke="#FF8563" strokeWidth="3" />
                <line x1="210" y1="215" x2="340" y2="215" stroke="#F4C46C" strokeWidth="3" />
                <line x1="210" y1="45" x2="340" y2="215" stroke="#45E6A6" strokeWidth="3.2" />
                <polyline points="210,197 228,197 228,215" fill="none" stroke="#F7F4EC" strokeWidth="1.5" />

                <text x="195" y="135" fill="#FF8563" fontSize="13" fontFamily="JetBrains Mono, monospace" textAnchor="end">
                  h = {misHeight}
                </text>
                <text x="275" y="236" fill="#F4C46C" fontSize="13" fontFamily="JetBrains Mono, monospace" textAnchor="middle">
                  s/2 = {(misSide / 2).toFixed(1)}
                </text>
                <text x="292" y="122" fill="#45E6A6" fontSize="13" fontFamily="JetBrains Mono, monospace" textAnchor="start">
                  l = {slantVal.toFixed(2)}
                </text>
                <text x="210" y="24" fill="#A8B2C6" fontSize="11" fontFamily="JetBrains Mono, monospace" textAnchor="middle">
                  Cross-Section Slice Through Pyramid Apex
                </text>
              </svg>
            </div>

            <div className="lg:col-span-6 instrument-panel p-5 space-y-4">
              <p className="text-sm text-[#A8B2C6] leading-relaxed">
                Using vertical altitude <MathTex tex="h" /> inside{' '}
                <MathTex tex="\frac{1}{2} P (\cdot)" /> always <strong>underestimates</strong>{' '}
                surface area because a tilted triangle face is the hypotenuse{' '}
                <MathTex tex="l = \sqrt{h^2 + (s/2)^2} > h" />.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="space-y-1 text-xs">
                  <div className="flex justify-between font-mono-data">
                    <span className="text-[#F4C46C]">Base Side (s)</span>
                    <span className="text-[#F7F4EC]">{misSide}</span>
                  </div>
                  <input
                    type="range"
                    min={4}
                    max={14}
                    step={2}
                    value={misSide}
                    onChange={(e) => setMisSide(parseFloat(e.target.value))}
                    className="meridian-slider"
                    style={{ ['--slider-accent' as string]: '#F4C46C' }}
                  />
                </label>
                <label className="space-y-1 text-xs">
                  <div className="flex justify-between font-mono-data">
                    <span className="text-[#FF8563]">Altitude (h)</span>
                    <span className="text-[#F7F4EC]">{misHeight}</span>
                  </div>
                  <input
                    type="range"
                    min={3}
                    max={12}
                    step={1}
                    value={misHeight}
                    onChange={(e) => setMisHeight(parseFloat(e.target.value))}
                    className="meridian-slider"
                    style={{ ['--slider-accent' as string]: '#FF8563' }}
                  />
                </label>
              </div>

              <div className="p-4 rounded-xl bg-[#060609] border border-[#F4C46C]/20 space-y-2.5 font-mono-data text-xs">
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-[#45E6A6]">True Lateral Area (½·P·l):</span>
                    <span className="text-[#45E6A6]">{trueLateral.toFixed(1)} u²</span>
                  </div>
                  <div className="h-2 rounded-full bg-[#11131C] overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-[#45E6A6]"
                      initial={false}
                      animate={{ width: `${Math.min(100, (trueLateral / 420) * 100)}%` }}
                      transition={reducedMotion ? { duration: 0 } : { type: 'spring', stiffness: 250, damping: 24 }}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-[#FF8563]">Erroneous (½·P·h):</span>
                    <span className="text-[#FF8563]">{wrongLateral.toFixed(1)} u²</span>
                  </div>
                  <div className="h-2 rounded-full bg-[#11131C] overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-[#FF8563]"
                      initial={false}
                      animate={{ width: `${Math.min(100, (wrongLateral / 420) * 100)}%` }}
                      transition={reducedMotion ? { duration: 0 } : { type: 'spring', stiffness: 250, damping: 24 }}
                    />
                  </div>
                </div>

                <div className="flex justify-between border-t hairline-rule pt-2">
                  <span className="text-[#F7F4EC]">Missing Material Error:</span>
                  <span className="text-[#F4C46C]">−{errorGap.toFixed(1)} u²</span>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* LAYER 6: Real-World Application */}
        <section id="layer-6" className="space-y-4 scroll-mt-24">
          <div>
            <span className="font-mono-data text-[11px] uppercase tracking-widest text-[#46D6E8]">
              Layer 06 · Real-World Engineering Application
            </span>
            <h2 className="font-serif-editorial text-2xl sm:text-3xl text-[#F7F4EC]">
              Architectural Glass Pyramid Atrium Estimator
            </h2>
          </div>

          <div className="instrument-frame p-5 sm:p-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            <div className="md:col-span-6 space-y-3">
              <p className="text-sm text-[#A8B2C6] leading-relaxed">
                Structural glazing engineers compute <strong>lateral surface area</strong> to order
                tempered glass panels, and <strong>interior volume</strong> to size HVAC air
                exchange.
              </p>
              <label className="block space-y-1 text-xs">
                <div className="flex justify-between font-mono-data">
                  <span className="text-[#46D6E8]">Atrium Base Span (s)</span>
                  <span className="text-[#F7F4EC]">{atriumSide} m</span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={40}
                  step={2}
                  value={atriumSide}
                  onChange={(e) => setAtriumSide(parseFloat(e.target.value))}
                  className="meridian-slider"
                  style={{ ['--slider-accent' as string]: '#46D6E8' }}
                />
              </label>
              <label className="block space-y-1 text-xs">
                <div className="flex justify-between font-mono-data">
                  <span className="text-[#F4C46C]">Apex Height (h)</span>
                  <span className="text-[#F7F4EC]">{atriumHeight} m</span>
                </div>
                <input
                  type="range"
                  min={8}
                  max={30}
                  step={1}
                  value={atriumHeight}
                  onChange={(e) => setAtriumHeight(parseFloat(e.target.value))}
                  className="meridian-slider"
                  style={{ ['--slider-accent' as string]: '#F4C46C' }}
                />
              </label>
            </div>

            <div className="md:col-span-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="instrument-panel p-4">
                <span className="font-mono-data text-[10px] uppercase text-[#727D94] block">
                  Beam Slant (l)
                </span>
                <span className="font-mono-data text-xl text-[#45E6A6]">
                  {atriumSlant.toFixed(1)} m
                </span>
              </div>
              <div className="instrument-panel p-4 border-[#46D6E8]/35">
                <span className="font-mono-data text-[10px] uppercase text-[#727D94] block">
                  Glass Cladding (L)
                </span>
                <span className="font-mono-data text-xl text-[#46D6E8]">
                  {atriumGlass.toFixed(0)} m²
                </span>
              </div>
              <div className="instrument-panel p-4">
                <span className="font-mono-data text-[10px] uppercase text-[#727D94] block">
                  HVAC Volume (V)
                </span>
                <span className="font-mono-data text-xl text-[#FFE29E]">
                  {atriumVol.toFixed(0)} m³
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* LAYER 7: Verified Standards & Next Lesson */}
        <section id="layer-7" className="instrument-frame p-5 sm:p-6 space-y-5 scroll-mt-24">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="font-mono-data text-[11px] uppercase tracking-widest text-[#46D6E8]">
                Layer 07 · Verified Standards &amp; Official Sources
              </span>
              <h2 className="font-serif-editorial text-2xl text-[#F7F4EC]">
                Florida B.E.S.T. / CPALMS Alignment
              </h2>
              <p className="text-xs text-[#A8B2C6] mt-1">
                Geometry Course Code{' '}
                <a
                  href={FLDOE_SOURCES.cpalmsGeom.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#46D6E8] underline underline-offset-2"
                >
                  1206310 (CPALMS)
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {LESSON_STANDARD_CODES.map((code) => {
              const std = VERIFIED_STANDARDS[code];
              if (!std) return null;
              return (
                <div key={code} className="instrument-panel p-4 space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono-data text-xs text-[#46D6E8]">{std.code}</span>
                    <a
                      href={std.sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 font-mono-data text-[11px] text-[#A8B2C6] hover:text-[#FFE29E]"
                    >
                      CPALMS <ExternalLink className="w-3 h-3" />
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

          {nextBridgeNode && (
            <div className="pt-4 border-t hairline-rule flex flex-wrap items-center justify-between gap-3">
              <div className="text-xs text-[#A8B2C6]">
                <span className="font-mono-data text-[10px] uppercase text-[#727D94] block">
                  Advance Into Algebra 2 Sequence
                </span>
                <strong className="text-[#F7F4EC] font-serif-editorial text-lg">
                  {nextBridgeNode.code} · {nextBridgeNode.title}
                </strong>
              </div>
              <div className="flex flex-wrap items-center gap-2.5">
                <Link
                  to="/frontier"
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full text-xs font-mono-data border border-[#F4C46C]/35 bg-[#0B0C12] text-[#FFE29E] hover:border-[#FFE29E]/65 transition-colors"
                >
                  <Orbit className="w-3.5 h-3.5 text-[#F4C46C]" />
                  Calabi-Yau 3D Bridge
                </Link>
                <Link
                  to={nextBridgeNode.route}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold text-[#060609] hover:brightness-110 transition-all shadow-[0_0_22px_-6px_rgba(70,214,232,0.55)]"
                  style={{ background: 'linear-gradient(135deg, #46D6E8, #FFE29E)' }}
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
