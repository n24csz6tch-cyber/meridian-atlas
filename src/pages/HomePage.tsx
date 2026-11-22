import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Calculator,
  Compass,
  Cpu,
  ExternalLink,
  Network,
  Pause,
  Play,
  Sparkles,
} from 'lucide-react';
import { AtlasShell } from '../components/AtlasShell';
import { MathTex } from '../components/MathTex';
import { COURSES, CURRICULUM_NODES } from '../data/curriculumGraph';
import { CourseId, FLDOE_SOURCES } from '../data/standards';
import { EquationMiniVisual, EquationVisualKind } from '../visuals/equations/EquationMiniVisual';
import { NeuralAtlasMap } from '../visuals/map/NeuralAtlasMap';
import { NeuralMathEngine } from '../visuals/neural/NeuralMathEngine';
import { ParabolaCanvas } from '../visuals/parabola/ParabolaCanvas';
import { TopicVisualCanvas, TopicVisualId } from '../visuals/topics/TopicVisualCanvas';
import { UnitCircleWaveCanvas } from '../visuals/trig/UnitCircleWaveCanvas';
import { MathVortexCanvas, VortexMode } from '../visuals/vortex/MathVortexCanvas';

const COURSE_ORDER: CourseId[] = ['algebra-1', 'geometry', 'algebra-2', 'precalculus'];

type HeroMode = 'vortex' | 'lorenz' | 'polar' | 'fourier' | 'complex';

const HERO_TABS: { id: HeroMode; label: string; accent: string }[] = [
  { id: 'vortex', label: 'Vector Vortex', accent: '#38D9FF' },
  { id: 'lorenz', label: 'Lorenz Butterfly', accent: '#F5BC5E' },
  { id: 'polar', label: 'Polar Rose Bloom', accent: '#FF7A5C' },
  { id: 'fourier', label: 'Fourier Epicycles', accent: '#36EBA8' },
  { id: 'complex', label: 'Complex Phase', accent: '#38D9FF' },
];

const SIGNATURE_VISUAL_EQUATIONS: {
  title: string;
  course: string;
  accent: string;
  kind: EquationVisualKind;
  tex: string;
  insight: string;
  route: string;
}[] = [
  {
    title: 'Least-Squares Residuals',
    course: 'ALG I · A1-09',
    accent: '#F5BC5E',
    kind: 'residual-squares',
    tex: '\\min \\sum_{i=1}^n (y_i - \\hat{y}_i)^2',
    insight: 'Every vertical error becomes a glowing square minimized simultaneously.',
    route: '/lesson/a1-statistics',
  },
  {
    title: 'Quadratic Vertex & Δ',
    course: 'ALG I · A1-08',
    accent: '#F5BC5E',
    kind: 'parabola-discriminant',
    tex: 'f(x) = a(x-h)^2 + k',
    insight: 'Discriminant sign flips parabolas cleanly from 2 roots to tangent to complex.',
    route: '/lesson/quadratics',
  },
  {
    title: 'Pythagorean Area Proof',
    course: 'GEOM · G-06',
    accent: '#38D9FF',
    kind: 'pythagoras-squares',
    tex: 'a^2 + b^2 = c^2',
    insight: 'Sliding congruent right triangles converts c² directly into a² + b².',
    route: '/lesson/g-right-trig',
  },
  {
    title: 'Similarity Area Scaling',
    course: 'GEOM · G-03',
    accent: '#38D9FF',
    kind: 'area-scale-k2',
    tex: '\\dfrac{\\text{Area}\'}{\\text{Area}} = k^2',
    insight: 'Stretching linear edges by k packs k² copies into 2D area.',
    route: '/lesson/g-similarity',
  },
  {
    title: 'Pascal Binomial Theorem',
    course: 'ALG II · A2-07',
    accent: '#36EBA8',
    kind: 'pascal-binomial',
    tex: '(a+b)^n = \\sum_{k=0}^n \\binom{n}{k} a^{n-k}b^k',
    insight: 'Lattice path counts generate every binomial expansion coefficient.',
    route: '/lesson/a2-combinatorics',
  },
  {
    title: 'Gaussian Normal Density',
    course: 'ALG II · A2-09',
    accent: '#36EBA8',
    kind: 'normal-bell',
    tex: 'P(|X-\\mu| \\le \\sigma) \\approx 68.3\\%',
    insight: 'Symmetric bell area locks 68–95–99.7% empirical probability bands.',
    route: '/lesson/a2-probability',
  },
  {
    title: 'Law of Sines Circumcircle',
    course: 'PRECALC · PC-04',
    accent: '#FF7A5C',
    kind: 'law-sines-circle',
    tex: '\\dfrac{a}{\\sin A} = \\dfrac{b}{\\sin B} = 2R',
    insight: 'Every oblique side-to-sine ratio equals the circumcircle diameter 2R.',
    route: '/lesson/pc-law-sines',
  },
  {
    title: 'Calculus Tangent Limit',
    course: 'PRECALC · PC-09',
    accent: '#FF7A5C',
    kind: 'secant-to-tangent',
    tex: 'f\'(x) = \\lim_{h \\to 0}\\dfrac{f(x+h)-f(x)}{h}',
    insight: 'Shrinking h → 0 snaps average secant slopes onto instantaneous tangents.',
    route: '/lesson/pc-limits',
  },
];

function LiveParabolaShowcase() {
  const [autoSweep, setAutoSweep] = useState(true);
  const [a, setA] = useState(0.85);
  const [h, setH] = useState(1.2);
  const [k, setK] = useState(-2.2);

  useEffect(() => {
    if (!autoSweep) return;
    let t = 0;
    const timer = window.setInterval(() => {
      if (document.hidden) return;
      t += 0.14;
      setK(Number((-2.6 * Math.cos(t)).toFixed(2)));
      setH(Number((1.4 * Math.sin(t * 0.65)).toFixed(2)));
    }, 90);
    return () => window.clearInterval(timer);
  }, [autoSweep]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between px-1">
        <span className="font-mono-data text-[10px] uppercase tracking-wider text-[#F5BC5E]">
          Live Discriminant Oscillation · Drag Vertex Anytime
        </span>
        <button
          type="button"
          onClick={() => setAutoSweep((s) => !s)}
          className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono-data border border-[#F5BC5E]/45 text-[#F5BC5E] bg-[#F5BC5E]/10"
        >
          {autoSweep ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
          {autoSweep ? 'Auto-Morph' : 'Manual'}
        </button>
      </div>
      <ParabolaCanvas
        a={a}
        h={h}
        k={k}
        onChange={(next) => {
          setAutoSweep(false);
          setA(next.a);
          setH(next.h);
          setK(next.k);
        }}
        highlightFeature="roots"
        showParentCurve
        compactTelemetry
        heightClass="h-[285px]"
      />
    </div>
  );
}

export function HomePage() {
  const [heroMode, setHeroMode] = useState<HeroMode>('vortex');
  const [alg1Tab, setAlg1Tab] = useState<'parabola' | 'a1-statistics' | 'a1-abs-piecewise' | 'a1-inequalities'>('parabola');
  const [geomTab, setGeomTab] = useState<TopicVisualId>('g-parallel-angles');
  const [alg2Tab, setAlg2Tab] = useState<TopicVisualId>('a2-combinatorics');
  const [pcTab, setPcTab] = useState<'unit' | 'pc-parametric' | 'pc-trig-identities' | 'pc-law-sines' | 'pc-limits'>('unit');
  const [dirFilter, setDirFilter] = useState<'all' | CourseId>('all');

  const activeTab = HERO_TABS.find((t) => t.id === heroMode) ?? HERO_TABS[0];
  const visibleDirectoryCourses = dirFilter === 'all' ? COURSE_ORDER : [dirFilter];

  return (
    <AtlasShell>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-20">
        {/* SECTION 1: LUXURY CINEMATIC HERO OBSERVATORY */}
        <section className="grid grid-cols-1 md:grid-cols-12 gap-7 lg:gap-10 items-center pt-2">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="md:col-span-5 space-y-6"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-[#F5BC5E]/35 bg-[#F5BC5E]/10 text-[11px] font-mono-data text-[#F5BC5E]">
              <Sparkles className="w-3.5 h-3.5" />
              36 FULL-YEAR INTERACTIVE LESSONS · FLORIDA B.E.S.T.
            </div>

            <h1 className="font-serif-editorial text-4xl sm:text-5xl lg:text-[3.6rem] text-[#F4F3EE] leading-[1.03] tracking-tight">
              See Mathematics{' '}
              <em className="italic bg-gradient-to-r from-[#F5BC5E] via-[#38D9FF] to-[#FF7A5C] bg-clip-text text-transparent">
                Think, Flow &amp; Connect.
              </em>
            </h1>

            <p className="text-sm sm:text-base text-[#A5B4CC] leading-relaxed">
              A complete four-year high school mathematical observatory — every single equation
              illustrated visually, 36 live 60fps engines, synchronized step-by-step proofs, visual
              misconception labs, and an interactive neural constellation atlas.
            </p>

            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              <a
                href="#neural-atlas"
                className="luminous-pill-btn inline-flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm"
              >
                <Network className="w-4 h-4" />
                Explore 36-Symbol Atlas
                <ArrowRight className="w-4 h-4" />
              </a>
              <Link
                to="/neural"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-xs sm:text-sm font-medium bg-white/[0.05] border border-white/15 text-[#F4F3EE] hover:border-[#38D9FF]/60 hover:bg-white/[0.09] transition-all"
              >
                <Cpu className="w-4 h-4 text-[#38D9FF]" />
                Neural &amp; Vortex Lab
              </Link>
              <Link
                to="/instruments"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-xs sm:text-sm font-medium bg-white/[0.04] border border-white/12 text-[#A5B4CC] hover:text-[#F4F3EE] transition-all"
              >
                <Compass className="w-4 h-4 text-[#36EBA8]" />
                16 Live Labs
              </Link>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-4 border-t hairline-rule">
              <div>
                <span className="font-mono-data text-lg sm:text-xl text-[#F4F3EE] block">
                  36 / 36
                </span>
                <span className="text-[11px] text-[#6F7F99]">7-Layer Lessons</span>
              </div>
              <div>
                <span className="font-mono-data text-lg sm:text-xl text-[#F5BC5E] block">
                  108+ Visuals
                </span>
                <span className="text-[11px] text-[#6F7F99]">Illustrated Equations</span>
              </div>
              <div>
                <span className="font-mono-data text-lg sm:text-xl text-[#38D9FF] block">
                  4 Full Years
                </span>
                <span className="text-[11px] text-[#6F7F99]">9 Units per Course</span>
              </div>
            </div>
          </motion.div>

          {/* Hero Kinetic Stage */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="md:col-span-7 space-y-3"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 px-1">
              <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Hero mathematical engines">
                {HERO_TABS.map((tab) => {
                  const active = heroMode === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      onClick={() => setHeroMode(tab.id)}
                      className={`px-3 py-1 rounded-full text-[11px] font-mono-data border transition-all ${
                        active
                          ? 'text-[#03050A] font-semibold'
                          : 'bg-[#090E18]/80 text-[#A5B4CC] border-white/12 hover:text-[#F4F3EE]'
                      }`}
                      style={
                        active
                          ? {
                              backgroundColor: tab.accent,
                              borderColor: tab.accent,
                              boxShadow: `0 0 18px -4px ${tab.accent}`,
                            }
                          : undefined
                      }
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>
              <span className="font-mono-data text-[10px] text-[#36EBA8]">
                ● 60fps Live Physics
              </span>
            </div>

            {heroMode === 'polar' ? (
              <TopicVisualCanvas topicId="pc-polar" compact heightClass="h-[350px] sm:h-[410px]" />
            ) : (
              <MathVortexCanvas
                lockedMode={heroMode as VortexMode}
                compact
                heightClass="h-[350px] sm:h-[410px]"
              />
            )}

            <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-[11px] font-mono-data text-[#6F7F99]">
              <span>
                Active Simulation:{' '}
                <strong style={{ color: activeTab.accent }}>{activeTab.label}</strong> · Interactive canvas
              </span>
              <Link to="/neural" className="text-[#38D9FF] hover:underline">
                Open Full Dynamical Systems Controls →
              </Link>
            </div>
          </motion.div>
        </section>

        {/* SECTION 2: THE MAIN GENERAL ATLAS — 36-SYMBOL NEURAL CONSTELLATION */}
        <section id="neural-atlas" className="space-y-5 scroll-mt-24">
          <div className="flex flex-wrap items-end justify-between gap-4 border-b hairline-rule pb-4">
            <div className="space-y-1">
              <span className="font-mono-data text-[11px] uppercase tracking-[0.22em] text-[#38D9FF]">
                General Atlas · 36 Living Neural Math Connectors
              </span>
              <h2 className="font-serif-editorial text-3xl sm:text-4xl text-[#F4F3EE]">
                Touch Any Glowing Symbol to Launch Its Complete 7-Layer Lesson
              </h2>
            </div>
            <Link
              to="/map"
              className="inline-flex items-center gap-1.5 text-xs font-mono-data text-[#38D9FF] hover:underline"
            >
              Open Fullscreen Neural Atlas <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <NeuralAtlasMap heightClass="h-[540px] sm:h-[600px]" />
        </section>

        {/* SECTION 3: SIGNATURE VISUAL EQUATIONS GALLERY */}
        <section className="space-y-5">
          <div className="flex flex-wrap items-end justify-between gap-4 border-b hairline-rule pb-4">
            <div className="space-y-1">
              <span className="font-mono-data text-[11px] uppercase tracking-[0.22em] text-[#F5BC5E]">
                Visualized Equations · Every Formula Illustrated Geometrically
              </span>
              <h2 className="font-serif-editorial text-3xl sm:text-4xl text-[#F4F3EE]">
                Signature High School Equations — Seen, Never Blindly Memorized
              </h2>
            </div>
            <span className="font-mono-data text-xs text-[#A5B4CC]">
              Every axiom across all 36 lessons carries its own visual proof
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {SIGNATURE_VISUAL_EQUATIONS.map((eq) => (
              <Link
                key={eq.title}
                to={eq.route}
                className="instrument-frame p-4 flex flex-col justify-between gap-3 hover:border-white/25 transition-all group"
                style={{ borderTop: `2px solid ${eq.accent}` }}
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono-data text-[10px]" style={{ color: eq.accent }}>
                      {eq.course}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#6F7F99] group-hover:text-[#F4F3EE] transition-colors" />
                  </div>
                  <EquationMiniVisual kind={eq.kind} accent={eq.accent} heightClass="h-[112px]" />
                  <h3 className="font-serif-editorial text-lg text-[#F4F3EE] group-hover:underline">
                    {eq.title}
                  </h3>
                  <div className="instrument-panel px-2.5 py-1.5 overflow-x-auto">
                    <MathTex tex={eq.tex} className="text-xs text-[#F4F3EE]" />
                  </div>
                </div>
                <p className="text-[11px] text-[#A5B4CC] leading-relaxed">{eq.insight}</p>
              </Link>
            ))}
          </div>
        </section>

        {/* SECTION 4: LIVE EMBEDDED NEURAL NETWORK & BACKPROPAGATION ENGINE */}
        <section className="space-y-4">
          <div className="flex flex-wrap items-end justify-between gap-4 border-b hairline-rule pb-4">
            <div className="space-y-1">
              <span className="font-mono-data text-[11px] uppercase tracking-[0.22em] text-[#36EBA8]">
                Live Matrix Calculus Engine · Auto-Training &amp; Firing Photons
              </span>
              <h2 className="font-serif-editorial text-3xl sm:text-4xl text-[#F4F3EE]">
                Interactive Neural Network &amp; Real-Time Backpropagation
              </h2>
            </div>
            <Link
              to="/neural"
              className="inline-flex items-center gap-1.5 text-xs font-mono-data text-[#36EBA8] hover:underline"
            >
              Full Neural Theory &amp; Vortex Theater <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <NeuralMathEngine />
        </section>

        {/* SECTION 5: 4-COURSE INTERACTIVE LIVE GALLERY */}
        <section className="space-y-6">
          <div className="flex flex-wrap items-end justify-between gap-4 border-b hairline-rule pb-4">
            <div className="space-y-1">
              <span className="font-mono-data text-[11px] uppercase tracking-[0.22em] text-[#F5BC5E]">
                Four Complete Courses · Multi-Simulation Live Showcase
              </span>
              <h2 className="font-serif-editorial text-3xl sm:text-4xl text-[#F4F3EE]">
                Watch Every Branch of High School Math Transform at 60fps
              </h2>
            </div>
            <Link
              to="/instruments"
              className="inline-flex items-center gap-1.5 text-xs font-mono-data text-[#F5BC5E] hover:underline"
            >
              Open All 16 Standalone Laboratories <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* ALGEBRA 1 LIVE CARD */}
            <div className="instrument-frame p-5 space-y-4" style={{ borderTop: '2px solid #F5BC5E' }}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="font-mono-data text-[10px] tracking-wider text-[#F5BC5E]">
                    ALGEBRA 1 · CPALMS 1200310 · 9 COMPLETE UNITS
                  </span>
                  <h3 className="font-serif-editorial text-2xl text-[#F4F3EE]">
                    Parabolas, Regression, Absolute Value &amp; Half-Planes
                  </h3>
                </div>
                <Link
                  to="/course/algebra-1"
                  className="px-3.5 py-1.5 rounded-full text-[11px] font-mono-data bg-[#F5BC5E] text-[#03050A] font-semibold"
                >
                  Algebra 1 →
                </Link>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {(
                  [
                    ['parabola', 'Parabola Sweep'],
                    ['a1-statistics', 'Regression Squares'],
                    ['a1-abs-piecewise', 'Absolute Value V'],
                    ['a1-inequalities', 'Feasible Half-Planes'],
                  ] as const
                ).map(([id, lbl]) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setAlg1Tab(id)}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-mono-data border ${
                      alg1Tab === id
                        ? 'bg-[#F5BC5E]/20 border-[#F5BC5E] text-[#F5BC5E]'
                        : 'border-white/12 text-[#A5B4CC]'
                    }`}
                  >
                    {lbl}
                  </button>
                ))}
              </div>

              {alg1Tab === 'parabola' ? (
                <LiveParabolaShowcase />
              ) : (
                <TopicVisualCanvas topicId={alg1Tab} compact heightClass="h-[312px]" />
              )}
            </div>

            {/* GEOMETRY LIVE CARD */}
            <div className="instrument-frame p-5 space-y-4" style={{ borderTop: '2px solid #38D9FF' }}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="font-mono-data text-[10px] tracking-wider text-[#38D9FF]">
                    GEOMETRY · CPALMS 1206310 · 9 COMPLETE UNITS
                  </span>
                  <h3 className="font-serif-editorial text-2xl text-[#F4F3EE]">
                    Transversals, Similarity k², Quadrilaterals &amp; 3D Nets
                  </h3>
                </div>
                <Link
                  to="/lesson/solids-3d"
                  className="px-3.5 py-1.5 rounded-full text-[11px] font-mono-data bg-[#38D9FF] text-[#03050A] font-semibold"
                >
                  3D Solids WebGL →
                </Link>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {(
                  [
                    ['g-parallel-angles', 'Parallel Transversal'],
                    ['g-similarity', 'Similarity k²'],
                    ['g-quadrilaterals', 'Quadrilateral Morph'],
                    ['g-right-trig', 'Pythagoras Proof'],
                  ] as [TopicVisualId, string][]
                ).map(([id, lbl]) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setGeomTab(id)}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-mono-data border ${
                      geomTab === id
                        ? 'bg-[#38D9FF]/20 border-[#38D9FF] text-[#38D9FF]'
                        : 'border-white/12 text-[#A5B4CC]'
                    }`}
                  >
                    {lbl}
                  </button>
                ))}
              </div>

              <TopicVisualCanvas topicId={geomTab} compact heightClass="h-[312px]" />
            </div>

            {/* ALGEBRA 2 LIVE CARD */}
            <div className="instrument-frame p-5 space-y-4" style={{ borderTop: '2px solid #36EBA8' }}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="font-mono-data text-[10px] tracking-wider text-[#36EBA8]">
                    ALGEBRA 2 · CPALMS 1200330 · 9 COMPLETE UNITS
                  </span>
                  <h3 className="font-serif-editorial text-2xl text-[#F4F3EE]">
                    Pascal Binomial, Nonlinear Systems, Inverses &amp; Normal Bell
                  </h3>
                </div>
                <Link
                  to="/lesson/logarithms"
                  className="px-3.5 py-1.5 rounded-full text-[11px] font-mono-data bg-[#36EBA8] text-[#03050A] font-semibold"
                >
                  Logarithms Lab →
                </Link>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {(
                  [
                    ['a2-combinatorics', 'Pascal Binomial'],
                    ['a2-quad-systems', 'Nonlinear Intersections'],
                    ['a2-radicals', 'Inverse Mirror'],
                    ['a2-probability', 'Normal Bell Curve'],
                  ] as [TopicVisualId, string][]
                ).map(([id, lbl]) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setAlg2Tab(id)}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-mono-data border ${
                      alg2Tab === id
                        ? 'bg-[#36EBA8]/20 border-[#36EBA8] text-[#36EBA8]'
                        : 'border-white/12 text-[#A5B4CC]'
                    }`}
                  >
                    {lbl}
                  </button>
                ))}
              </div>

              <TopicVisualCanvas topicId={alg2Tab} compact heightClass="h-[312px]" />
            </div>

            {/* PRECALCULUS HONORS LIVE CARD */}
            <div className="instrument-frame p-5 space-y-4" style={{ borderTop: '2px solid #FF7A5C' }}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="font-mono-data text-[10px] tracking-wider text-[#FF7A5C]">
                    PRECALCULUS HONORS · CPALMS 1202340 · 9 COMPLETE UNITS
                  </span>
                  <h3 className="font-serif-editorial text-2xl text-[#F4F3EE]">
                    Waves, Trig Identities, Law of Sines, Lissajous &amp; Limits
                  </h3>
                </div>
                <Link
                  to="/course/precalculus"
                  className="px-3.5 py-1.5 rounded-full text-[11px] font-mono-data bg-[#FF7A5C] text-[#03050A] font-semibold"
                >
                  Precalculus →
                </Link>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {(
                  [
                    ['unit', 'Unit Circle Waves'],
                    ['pc-parametric', 'Lissajous Orbit'],
                    ['pc-trig-identities', 'sin²+cos² = 1'],
                    ['pc-law-sines', 'Law of Sines 2R'],
                    ['pc-limits', 'Tangent Limit'],
                  ] as const
                ).map(([id, lbl]) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setPcTab(id)}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-mono-data border ${
                      pcTab === id
                        ? 'bg-[#FF7A5C]/20 border-[#FF7A5C] text-[#FF7A5C]'
                        : 'border-white/12 text-[#A5B4CC]'
                    }`}
                  >
                    {lbl}
                  </button>
                ))}
              </div>

              {pcTab === 'unit' ? (
                <UnitCircleWaveCanvas compact heightClass="h-[312px]" />
              ) : (
                <TopicVisualCanvas topicId={pcTab} compact heightClass="h-[312px]" />
              )}
            </div>
          </div>
        </section>

        {/* SECTION 6: FILTERABLE COMPLETE 36-TOPIC CURRICULUM DIRECTORY */}
        <section className="space-y-5">
          <div className="flex flex-wrap items-end justify-between gap-4 border-b hairline-rule pb-4">
            <div className="space-y-1">
              <span className="font-mono-data text-[11px] uppercase tracking-[0.22em] text-[#A5B4CC]">
                Complete 4-Year Curriculum Library · 36 Interactive 7-Layer Lessons
              </span>
              <h2 className="font-serif-editorial text-3xl sm:text-4xl text-[#F4F3EE]">
                Every Full-Year Unit Equipped With Visualized Equations &amp; Drills
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => setDirFilter('all')}
                className={`px-3 py-1 rounded-full text-[11px] font-mono-data border ${
                  dirFilter === 'all'
                    ? 'bg-white/12 border-white/30 text-[#F4F3EE]'
                    : 'border-white/12 text-[#A5B4CC]'
                }`}
              >
                All 36
              </button>
              {COURSE_ORDER.map((cid) => {
                const c = COURSES[cid];
                const active = dirFilter === cid;
                return (
                  <button
                    key={cid}
                    type="button"
                    onClick={() => setDirFilter(cid)}
                    className="px-3 py-1 rounded-full text-[11px] font-mono-data border transition-all"
                    style={{
                      borderColor: active ? c.accent : 'rgba(255,255,255,0.12)',
                      backgroundColor: active ? `${c.accent}20` : 'transparent',
                      color: active ? c.accent : '#A5B4CC',
                    }}
                  >
                    {c.shortTitle} (9)
                  </button>
                );
              })}
              <a
                href={FLDOE_SOURCES.bestIndex.url}
                target="_blank"
                rel="noreferrer"
                className="ml-2 inline-flex items-center gap-1 text-[11px] font-mono-data text-[#6F7F99] hover:text-[#F4F3EE]"
              >
                FLDOE B.E.S.T. <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          <div
            className={`grid grid-cols-1 ${
              dirFilter === 'all' ? 'md:grid-cols-2 lg:grid-cols-4' : 'max-w-4xl'
            } gap-4`}
          >
            {visibleDirectoryCourses.map((cid) => {
              const c = COURSES[cid];
              const nodes = CURRICULUM_NODES.filter((n) => n.courseId === cid);

              return (
                <div
                  key={cid}
                  className="instrument-frame p-4 flex flex-col justify-between gap-4"
                  style={{ borderTop: `2px solid ${c.accent}` }}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Link
                        to={`/course/${cid}`}
                        className="font-serif-editorial text-xl text-[#F4F3EE] hover:underline"
                      >
                        {c.title}
                      </Link>
                      <span
                        className="font-mono-data text-[10px] px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: `${c.accent}20`, color: c.accent }}
                      >
                        {nodes.length} Live
                      </span>
                    </div>

                    <div
                      className={
                        dirFilter === 'all'
                          ? 'space-y-2'
                          : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5'
                      }
                    >
                      {nodes.map((node) => (
                        <Link
                          key={node.id}
                          to={node.route}
                          className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[#070B14]/90 border border-white/[0.08] hover:border-white/25 transition-all group"
                        >
                          <span
                            className="w-9 h-9 rounded-lg shrink-0 flex items-center justify-center font-mono-data text-[9.5px] font-semibold border"
                            style={{
                              borderColor: `${c.accent}44`,
                              backgroundColor: `${c.accent}14`,
                              color: c.accent,
                            }}
                          >
                            {node.symbol}
                          </span>
                          <div className="min-w-0">
                            <div className="text-xs font-medium text-[#F4F3EE] truncate group-hover:underline">
                              {node.title}
                            </div>
                            <div className="text-[10px] font-mono-data text-[#6F7F99] truncate">
                              {node.code} · {node.instrumentTag}
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>

                  <Link
                    to={`/course/${cid}`}
                    className="pt-2 border-t hairline-rule flex items-center justify-between text-xs font-mono-data hover:underline"
                    style={{ color: c.accent }}
                  >
                    <span>Open Full {c.title} Hub</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              );
            })}
          </div>
        </section>

        {/* SECTION 7: STANDALONE LABS & GRADE PLANNER CALLOUTS */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Link
            to="/instruments"
            className="instrument-frame p-6 space-y-3 hover:border-[#36EBA8]/55 transition-all"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono-data text-xs text-[#36EBA8]">UNIFIED WORKBENCH BANK</span>
              <Cpu className="w-4 h-4 text-[#36EBA8]" />
            </div>
            <h3 className="font-serif-editorial text-2xl text-[#F4F3EE]">
              16 Standalone Precision Laboratories (36 Engines)
            </h3>
            <p className="text-xs text-[#A5B4CC] leading-relaxed">
              Launch the Neural Matrix Lab, Vortex &amp; Lorenz Theater, Quadratic Solver, Linear
              Regression Residual Lab, 3D Hinged Net Lab, Parallel Transversals, Similarity k²,
              Pascal Binomial Engine, Trig Identity Conservation, Law of Sines, or Lissajous Studio.
            </p>
            <span className="inline-flex items-center gap-1.5 text-xs font-mono-data text-[#36EBA8]">
              Open All 16 Laboratories <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </Link>

          <Link
            to="/planner"
            className="instrument-frame p-6 space-y-3 hover:border-[#F5BC5E]/55 transition-all"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono-data text-xs text-[#F5BC5E]">LINEAR SENSITIVITY OBSERVATORY</span>
              <Calculator className="w-4 h-4 text-[#F5BC5E]" />
            </div>
            <h3 className="font-serif-editorial text-2xl text-[#F4F3EE]">
              Syllabus Grade Planner &amp; Radial Target Gauge
            </h3>
            <p className="text-xs text-[#A5B4CC] leading-relaxed">
              Visualize syllabus category weights, inspect your radial Final Exam Target Gauge, and
              watch the live linear sensitivity curve G(F) compute the exact final exam score needed.
            </p>
            <span className="inline-flex items-center gap-1.5 text-xs font-mono-data text-[#F5BC5E]">
              Open Grade Planner <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </Link>
        </section>
      </div>
    </AtlasShell>
  );
}
