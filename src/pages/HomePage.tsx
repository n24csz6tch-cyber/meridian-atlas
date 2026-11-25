import { Suspense, lazy, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Activity,
  ArrowRight,
  Atom,
  BookOpen,
  Box,
  Calculator,
  CheckCircle2,
  Compass,
  Cpu,
  Droplets,
  ExternalLink,
  GitBranch,
  Layers,
  Network,
  Orbit,
  PlayCircle,
  Presentation,
  Radar,
  Sparkles,
  TrendingUp,
  Waypoints,
} from 'lucide-react';
import { AtlasShell } from '../components/AtlasShell';
import { CourseJourneySidebar } from '../components/CourseJourneySidebar';
import { MathTex } from '../components/MathTex';
import { COURSES, CURRICULUM_NODES } from '../data/curriculumGraph';
import {
  FLORIDA_COURSE_TEXTBOOK_META,
  FLORIDA_TEXTBOOK_CHAPTERS,
} from '../data/floridaTextbookGuide';
import { CourseId, FLDOE_SOURCES } from '../data/standards';
import { getCompletedNodes, PROGRESS_CHANGE_EVENT } from '../data/studentGuidance';
import { AlgebraicPipelineEngine } from '../visuals/drive/AlgebraicPipelineEngine';
import { ConfidenceRibbonField } from '../visuals/drive/ConfidenceRibbonField';
import { PolarHarmonicRingEngine } from '../visuals/drive/PolarHarmonicRingEngine';
import { CalabiYauManifold3D } from '../visuals/frontier/CalabiYauManifold3D';
import { OrbitalSignalTorus3D } from '../visuals/frontier/OrbitalSignalTorus3D';
import { GoldenHarmonicSpine } from '../visuals/harmony/GoldenHarmonicSpine';
import { FourierEpicyclesEngine } from '../visuals/kinetic/FourierEpicyclesEngine';
import { FormulaMorphEngine } from '../visuals/kinetic/FormulaMorphEngine';
import { PythagorasFluidProof } from '../visuals/kinetic/PythagorasFluidProof';
import { NeuralAtlasMap } from '../visuals/map/NeuralAtlasMap';
import { ApolloniusCone3D } from '../visuals/solids/ApolloniusCone3D';
import { MathVortexCanvas } from '../visuals/vortex/MathVortexCanvas';

const LazyTensorRiemann3D = lazy(() => import('../visuals/drive/TensorRiemann3D'));
const LazyVectorFlowField3D = lazy(() => import('../visuals/cinema3d/VectorFlowField3D'));
const LazyLorenzAttractor3D = lazy(() => import('../visuals/cinema3d/LorenzAttractor3D'));
const LazyMatrixTransform3D = lazy(() => import('../visuals/cinema3d/MatrixTransform3D'));
const LazySurfaceRevolution3D = lazy(() => import('../visuals/cinema3d/SurfaceRevolution3D'));

const COURSE_ORDER: CourseId[] = ['algebra-1', 'geometry', 'algebra-2', 'precalculus'];

type HeroStageMode = 'orbital' | 'calabi' | 'vortex';
type CinemaCategory = 'all' | 'shaders-3d' | 'kinetic' | 'drive';
type CinemaEngineId =
  | 'pipeline'
  | 'polar'
  | 'confidence'
  | 'tensor'
  | 'vector-flow'
  | 'lorenz-chaos'
  | 'matrix-warp'
  | 'surface-rev'
  | 'fourier-epi'
  | 'formula-morph'
  | 'pythagoras-fluid';

const CINEMA_CATEGORIES: { id: CinemaCategory; label: string; accent: string }[] = [
  { id: 'all', label: 'All (11)', accent: '#F4C46C' },
  { id: 'shaders-3d', label: '3D Shaders (5)', accent: '#46D6E8' },
  { id: 'kinetic', label: 'Kinetic 3B1B (3)', accent: '#45E6A6' },
  { id: 'drive', label: 'Drive Signal (3)', accent: '#FFE29E' },
];

const ALGEBRA1_QUICK_STAGES = [
  {
    stage: 1,
    title: 'Stage 1 · Foundations',
    range: 'Units 01–03',
    caption: 'Translate words into algebraic blocks, measure steady slope, and tame roots & powers.',
    nodeIds: ['a1-expressions', 'a1-linear', 'a1-radicals-exp'],
  },
  {
    stage: 2,
    title: 'Stage 2 · Core Mechanics',
    range: 'Units 04–06',
    caption: 'Cross two lines to solve systems, shade safe budgets, and bend V-shaped corner graphs.',
    nodeIds: ['a1-systems', 'a1-inequalities', 'a1-abs-piecewise'],
  },
  {
    stage: 3,
    title: 'Stage 3 · Quadratics & Data',
    range: 'Units 07–09',
    caption: 'Launch exponential growth, curve parabolas with Δ = b² − 4ac, and fit trend lines to data.',
    nodeIds: ['a1-exponential', 'a1-quadratics', 'a1-statistics'],
  },
] as const;

const CINEMA_ENGINES: {
  id: CinemaEngineId;
  category: Exclude<CinemaCategory, 'all'>;
  label: string;
  courseTag: string;
  accent: string;
  labId: string;
  headline: string;
  plainEnglish: string;
  tryHint: string;
  formulaTex: string;
  icon: typeof Activity;
}[] = [
  {
    id: 'pipeline',
    category: 'drive',
    label: 'Algebraic Dataflow',
    courseTag: 'Algebra 1 & 2 · Drive Signal',
    accent: '#F4C46C',
    labId: 'algebraic-pipeline',
    headline: 'Watch a Number Flow Through a Live Equation Machine',
    plainEnglish:
      'Think of f(x) = (ax + b)² like a two-station assembly line: Station 1 stretches and shifts x into ax + b, and Station 2 bends it into a parabola while the oscilloscope draws both waves side by side.',
    tryHint: 'Drag slider a or b—or toggle Manual x—to watch golden packets pulse along the conduits.',
    formulaTex: 'x \\xrightarrow{ax+b} u \\xrightarrow{u^2} (ax+b)^2',
    icon: Activity,
  },
  {
    id: 'vector-flow',
    category: 'shaders-3d',
    label: '3D Vector Flow Field',
    courseTag: '3D Shader · Curl & Streamlines',
    accent: '#46D6E8',
    labId: 'vector-flow-3d',
    headline: 'Follow 1,800 Glowing Particles Through Invisible 3D Force Arrows',
    plainEnglish:
      'Every point in 3D space holds a velocity arrow telling particles where to turn next. Switch between a swirling vortex, magnetic dipole loops, saddle curl, and a spiral gravity sink.',
    tryHint: 'Raise Curl / Twist (k) or toggle Velocity Arrows to see how local spin curves particle trails.',
    formulaTex: '\\mathbf{F}(x,y,z) = \\langle F_x, F_y, F_z \\rangle,\\; \\nabla \\times \\mathbf{F}',
    icon: Compass,
  },
  {
    id: 'lorenz-chaos',
    category: 'shaders-3d',
    label: '3D Lorenz Chaos Butterfly',
    courseTag: '3D Shader · Strange Attractor',
    accent: '#FF8563',
    labId: 'lorenz-chaos-3d',
    headline: 'Watch Two Nearly Identical Paths Split Across a 3D Chaos Butterfly',
    plainEnglish:
      'Golden and cyan trajectories start just 0.01 units apart—smaller than a butterfly wingbeat—yet deterministic weather equations fling them onto opposite lobes while staying inside one sculpted attractor.',
    tryHint: 'Compare Classic Butterfly (ρ = 28) against Calm Orbit (ρ = 16) or click Reset Δ₀ = 0.01.',
    formulaTex: '\\dot{x}=\\sigma(y-x),\\; \\dot{y}=x(\\rho-z)-y,\\; \\dot{z}=xy-\\beta z',
    icon: Orbit,
  },
  {
    id: 'matrix-warp',
    category: 'shaders-3d',
    label: '3D Matrix Space Warp',
    courseTag: '3D Shader · Linear Algebra',
    accent: '#FFE29E',
    labId: 'matrix-transform-3d',
    headline: 'See a 3×3 Matrix Stretch, Shear, and Flip Every Grid Line in 3D',
    plainEnglish:
      'A matrix does not just store numbers—it moves all of space at once. Track the three basis arrows (î, ĵ, k̂) and watch the determinant det(A) measure how much the unit cube’s volume scales or mirrors.',
    tryHint: 'Try Mirror Flip (det = -1) and scrub Morph t through 0.50 to see space flatten to zero volume.',
    formulaTex: 'T(\\mathbf{v}) = A\\mathbf{v},\\quad \\det(A) = \\text{Signed Volume Scale}',
    icon: Layers,
  },
  {
    id: 'surface-rev',
    category: 'shaders-3d',
    label: '360° Solid of Revolution',
    courseTag: '3D Shader · Disk Method',
    accent: '#46D6E8',
    labId: 'surface-revolution-3d',
    headline: 'Spin a Flat 2D Curve 360° Into a Translucent 3D Volume',
    plainEnglish:
      'Rotate y = √x or y = 0.5x around the horizontal axis like a cosmic potter’s wheel. Every thin vertical slice sweeps out a glowing circular disk whose area πr² stacks into exact 3D volume.',
    tryHint: 'Scrub Sweep Angle from 15° to 360° and slide the green Disk Cross-Section along the axis.',
    formulaTex: 'V = \\pi \\int_a^b [f(x)]^2\\,dx',
    icon: Box,
  },
  {
    id: 'fourier-epi',
    category: 'kinetic',
    label: 'Fourier Epicycles',
    courseTag: 'Kinetic 3B1B · Phasor Harmonics',
    accent: '#F4C46C',
    labId: 'fourier-epicycles',
    headline: 'Draw Square Waves, Hearts, and Stars Using Spinning Circles Alone',
    plainEnglish:
      'Link circles tip-to-tail, each spinning at an integer frequency multiple. With 1 circle you get an ellipse; stack 5 to 15 harmonic circles and sharp corners snap into focus like magic.',
    tryHint: 'Switch to 5-Point Star or Heart Curve, then drag Harmonics N from 1 up to 15.',
    formulaTex: 'z(t) = \\sum_{k} c_k\\,e^{i\\omega_k t}',
    icon: Waypoints,
  },
  {
    id: 'formula-morph',
    category: 'kinetic',
    label: 'Kinetic Formula Morph',
    courseTag: 'Kinetic 3B1B · Algebra Proof',
    accent: '#45E6A6',
    labId: 'formula-morph',
    headline: 'Watch Equations Physically Glide & Rearrange Into Their Solved Form',
    plainEnglish:
      'Instead of memorizing formulas, watch each color-coded symbol slide to its new home step by step—completing the square on ax² + bx + c = 0, isolating slope-intercept form, or flipping logs into inverses.',
    tryHint: 'Click Prev/Next or toggle Auto-Morph while reading “What Just Moved & Why” below each step.',
    formulaTex: 'ax^2 + bx + c = 0 \\;\\Longrightarrow\\; x = \\dfrac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}',
    icon: GitBranch,
  },
  {
    id: 'pythagoras-fluid',
    category: 'kinetic',
    label: 'Pythagoras Fluid Proof',
    courseTag: 'Kinetic 3B1B · Hydraulic Area',
    accent: '#45E6A6',
    labId: 'pythagoras-fluid',
    headline: 'Pour Luminous Liquid From a² and b² Directly Into c²',
    plainEnglish:
      'See why the Pythagorean theorem works without a single memorized line: the glowing liquid filling the two leg squares drains through conduits and fills the tilted hypotenuse square to the exact brim.',
    tryHint: 'Adjust legs a and b or scrub Pour Progress manually to inspect exact area conservation.',
    formulaTex: 'a^2 + b^2 = c^2',
    icon: Droplets,
  },
  {
    id: 'polar',
    category: 'drive',
    label: 'Polar Harmonic Ring',
    courseTag: 'Precalculus · Drive Signal',
    accent: '#46D6E8',
    labId: 'polar-harmonic',
    headline: 'Steer by Angle & Radius Instead of Left-Right Grid Steps',
    plainEnglish:
      'Polar coordinates work like radar: aim at angle θ and walk out distance r. Locking frequency ratios like 3:1 or 5:1 blooms crisp flower petals, while Golden Ratio φ weaves patterns that never repeat.',
    tryHint: 'Drag anywhere on the ring to scrub θ or tap 3-Petal, 5-Petal, and Golden Ratio.',
    formulaTex: 'r(\\theta) = \\cos\\!\\left(\\tfrac{p}{q}\\theta\\right), \\quad (x,y)=(r\\cos\\theta,r\\sin\\theta)',
    icon: Radar,
  },
  {
    id: 'confidence',
    category: 'drive',
    label: 'Confidence Ribbon Field',
    courseTag: 'Algebra 1 & 2 · Drive Signal',
    accent: '#45E6A6',
    labId: 'confidence-ribbon',
    headline: 'See Why Real Data Floats Inside 68%–95%–99.7% Prediction Ribbons',
    plainEnglish:
      'Real-world measurements rarely sit right on a textbook line. These glowing ribbons show where 68% (±1σ), 95% (±2σ), and 99.7% (±3σ) of noisy points land around a curved trend.',
    tryHint: 'Hover across the field to probe uncertainty, or raise Noise σ and watch R² react live.',
    formulaTex: 'y = \\hat{y}(x) \\pm k\\sigma, \\quad R^2 = 1 - \\tfrac{\\sum e_i^2}{\\sum (y_i-\\bar{y})^2}',
    icon: TrendingUp,
  },
  {
    id: 'tensor',
    category: 'shaders-3d',
    label: '3D Tensor & Riemann',
    courseTag: '3D Shader · Multivariable Volume',
    accent: '#FFE29E',
    labId: 'tensor-riemann',
    headline: 'Stack 3D Prisms to Measure Curved Surfaces Like Digital LEGOs',
    plainEnglish:
      'How do engineers find the exact volume under a curved hill? Slice the floor into tiny squares and stack flat columns up to the curve—the finer your grid (2×2 → 10×10), the closer your prism sum hugs the true integral.',
    tryHint: 'Drag to orbit the 3D prisms, raise Grid N, and compare Riemann Sum V against Exact Integral.',
    formulaTex: 'V_N = \\sum_{i,j=1}^N f(x_i,y_j)\\,\\Delta x\\,\\Delta y \\longrightarrow \\iint_D f\\,dA',
    icon: Box,
  },
];

const HERO_TABS: {
  id: HeroStageMode;
  label: string;
  accent: string;
  formulaTex: string;
  caption: string;
}[] = [
  {
    id: 'orbital',
    label: 'Orbital String Flux 3D',
    accent: '#F4C46C',
    formulaTex: 'X^\\mu(\\tau, \\sigma) \\cdot S^1 \\times S^1',
    caption: '60,000-particle 3D manifold — drag to orbit or click to emit radial shockwaves',
  },
  {
    id: 'calabi',
    label: 'Calabi-Yau 3D',
    accent: '#FFE29E',
    formulaTex: 'z_1^n + z_2^n = 1',
    caption: 'Compactified 6D manifold sheets, Hopf fibration rings, and relativistic worldsheets',
  },
  {
    id: 'vortex',
    label: 'Math Vortex & Chaos',
    accent: '#46D6E8',
    formulaTex: '\\dot{x} = \\sigma(y-x),\\; \\dot{z} = xy - \\beta z',
    caption: 'Interactive eigen-flow vortex, Lorenz chaos butterfly, and Fourier epicycles',
  },
];

export function HomePage() {
  const [heroMode, setHeroMode] = useState<HeroStageMode>('orbital');
  const [cinemaCategory, setCinemaCategory] = useState<CinemaCategory>('all');
  const [cinemaEngine, setCinemaEngine] = useState<CinemaEngineId>('pipeline');
  const [dirFilter, setDirFilter] = useState<'all' | CourseId>('all');
  const [dirView, setDirView] = useState<'both' | 'textbook' | 'lessons'>('both');
  const [completedIds, setCompletedIds] = useState<string[]>(() => getCompletedNodes());

  useEffect(() => {
    const syncProgress = () => setCompletedIds(getCompletedNodes());
    syncProgress();
    window.addEventListener(PROGRESS_CHANGE_EVENT, syncProgress);
    window.addEventListener('storage', syncProgress);
    return () => {
      window.removeEventListener(PROGRESS_CHANGE_EVENT, syncProgress);
      window.removeEventListener('storage', syncProgress);
    };
  }, []);

  const algebra1Nodes = useMemo(
    () => CURRICULUM_NODES.filter((n) => n.courseId === 'algebra-1'),
    []
  );
  const algebra1NodeMap = useMemo(
    () => new Map(algebra1Nodes.map((n) => [n.id, n])),
    [algebra1Nodes]
  );
  const completedSet = useMemo(() => new Set(completedIds), [completedIds]);
  const algebra1MasteredCount = useMemo(
    () => algebra1Nodes.filter((n) => completedSet.has(n.id)).length,
    [algebra1Nodes, completedSet]
  );
  const algebra1MasteredPct = Math.round(
    (algebra1MasteredCount / Math.max(1, algebra1Nodes.length)) * 100
  );
  const nextAlgebra1Node = useMemo(
    () => algebra1Nodes.find((n) => !completedSet.has(n.id)) ?? algebra1Nodes[0],
    [algebra1Nodes, completedSet]
  );

  const activeHeroTab = HERO_TABS.find((t) => t.id === heroMode) ?? HERO_TABS[0];
  const visibleCinemaEngines = useMemo(
    () =>
      cinemaCategory === 'all'
        ? CINEMA_ENGINES
        : CINEMA_ENGINES.filter((item) => item.category === cinemaCategory),
    [cinemaCategory]
  );
  const activeCinemaMeta = CINEMA_ENGINES.find((c) => c.id === cinemaEngine) ?? CINEMA_ENGINES[0];
  const visibleDirectoryCourses = dirFilter === 'all' ? COURSE_ORDER : [dirFilter];

  return (
    <AtlasShell>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-20 min-w-0">
        {/* SECTION A: AUREA GOLDEN CYBER-OBSERVATORY HERO */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center pt-1 min-w-0">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-5 space-y-6 min-w-0"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#F4C46C]/35 bg-[#F4C46C]/10 text-[11px] font-mono-data uppercase tracking-[0.16em] text-[#FFE29E]">
              <Sparkles className="w-3.5 h-3.5 text-[#F4C46C]" />
              AUREA Observatory · High School to 10D Physics
            </div>

            <h1 className="font-serif-editorial text-4xl sm:text-5xl lg:text-[3.55rem] text-[#F7F4EC] leading-[1.03] tracking-tight">
              See Mathematics{' '}
              <em className="italic bg-gradient-to-r from-[#FFE29E] via-[#F4C46C] to-[#FF8563] bg-clip-text text-transparent">
                Move in 3D Dimensions
              </em>
            </h1>

            <p className="text-sm sm:text-base text-[#A8B2C6] leading-relaxed">
              Master Algebra 1, Geometry, Algebra 2, and Precalculus Honors through real-time 3D
              engines, step-by-step proofs, and a 28-chapter Florida B.E.S.T. textbook—and discover
              how the exact same exponents, waves, and curves describe modern physics and String
              Theory.
            </p>

            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              <Link
                to="/frontier"
                className="luminous-pill-btn inline-flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm"
              >
                <Orbit className="w-4 h-4" />
                String Theory 3D
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/textbook"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-xs sm:text-sm font-medium bg-[#11131C] border border-[#F4C46C]/35 text-[#FFE29E] hover:border-[#FFE29E]/70 hover:bg-[#F4C46C]/10 transition-all"
              >
                <BookOpen className="w-4 h-4 text-[#F4C46C]" />
                Florida B.E.S.T. Book
              </Link>
              <a
                href="#constellation"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-xs sm:text-sm font-medium bg-[#0B0C12] border border-[#46D6E8]/35 text-[#46D6E8] hover:border-[#46D6E8]/70 hover:bg-[#46D6E8]/10 transition-all"
              >
                <Network className="w-4 h-4" />
                36-Node Atlas
              </a>
              <Link
                to="/presentation"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-xs sm:text-sm font-medium bg-[#FF8563]/12 border border-[#FF8563]/40 text-[#FF8563] hover:bg-[#FF8563]/20 transition-all"
              >
                <Presentation className="w-4 h-4" />
                Live Keynote
              </Link>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-[rgba(244,196,108,0.16)]">
              <div>
                <span className="font-mono-data text-lg sm:text-xl text-[#FFE29E] block">
                  36 / 36
                </span>
                <span className="text-[11px] text-[#A8B2C6]">7-Layer Lessons</span>
              </div>
              <div>
                <span className="font-mono-data text-lg sm:text-xl text-[#F4C46C] block">
                  28 Chapters
                </span>
                <span className="text-[11px] text-[#A8B2C6]">Florida B.E.S.T. Book</span>
              </div>
              <div>
                <span className="font-mono-data text-lg sm:text-xl text-[#46D6E8] block">
                  108+ Visuals
                </span>
                <span className="text-[11px] text-[#A8B2C6]">3D &amp; Animated Proofs</span>
              </div>
            </div>
          </motion.div>

          {/* Live Interactive Hero 3D Stage */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-7 space-y-3 min-w-0"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 px-1">
              <div
                className="flex flex-wrap gap-1.5"
                role="tablist"
                aria-label="Hero 3D mathematical engines"
              >
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
                          ? 'text-[#060609] font-semibold'
                          : 'bg-[#0B0C12]/90 text-[#A8B2C6] border-[rgba(244,196,108,0.18)] hover:text-[#F7F4EC]'
                      }`}
                      style={
                        active
                          ? {
                              backgroundColor: tab.accent,
                              borderColor: tab.accent,
                              boxShadow: `0 0 20px -4px ${tab.accent}`,
                            }
                          : undefined
                      }
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              <span className="inline-flex items-center gap-1.5 font-mono-data text-[10px] text-[#45E6A6]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#45E6A6] shadow-[0_0_8px_#45E6A6]" />
                60fps Interactive Stage
              </span>
            </div>

            {heroMode === 'orbital' && (
              <OrbitalSignalTorus3D compact heightClass="h-[360px] sm:h-[430px]" />
            )}
            {heroMode === 'calabi' && (
              <CalabiYauManifold3D compact heightClass="h-[360px] sm:h-[430px]" />
            )}
            {heroMode === 'vortex' && (
              <MathVortexCanvas compact heightClass="h-[360px] sm:h-[430px]" />
            )}

            <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-[11px] font-mono-data text-[#A8B2C6]">
              <span className="flex items-center gap-2 flex-wrap">
                <strong style={{ color: activeHeroTab.accent }}>{activeHeroTab.label}:</strong>
                <span>{activeHeroTab.caption}</span>
              </span>
              <div className="flex items-center gap-3">
                <MathTex tex={activeHeroTab.formulaTex} className="text-[#FFE29E] hidden sm:inline" />
                <Link to="/frontier" className="text-[#F4C46C] hover:underline shrink-0">
                  Full String Frontier →
                </Link>
              </div>
            </div>
          </motion.div>
        </section>

        {/* SECTION B: ALGEBRA 1 GUIDED SANCTUARY — DOCKED SIDE-HUB + 3-STAGE QUICK-START */}
        <section
          id="algebra-1-sanctuary"
          aria-label="Algebra 1 Guided Sanctuary"
          className="space-y-6 scroll-mt-24 min-w-0"
        >
          <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[rgba(244,196,108,0.18)] pb-4">
            <div className="space-y-1 min-w-0">
              <span className="font-mono-data text-[11px] uppercase tracking-[0.22em] text-[#F5C25B] inline-flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#F4C46C]" />
                Algebra 1 Guided Sanctuary · 100% Unified in One Docked Hub
              </span>
              <h2 className="font-serif-editorial text-3xl sm:text-4xl text-[#F7F4EC]">
                Start Algebra 1 From Scratch — With Zero Confusion
              </h2>
            </div>
            <div className="flex flex-wrap items-center gap-2.5">
              <Link
                to="/course/algebra-1"
                className="luminous-pill-btn inline-flex items-center gap-2 px-4 py-2 text-xs"
              >
                <Compass className="w-3.5 h-3.5" />
                Open Algebra 1 Hub
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                to="/lesson/a1-quadratics"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-mono-data border border-[#F4C46C]/40 bg-[#11131C] text-[#FFE29E] hover:border-[#FFE29E] transition-colors"
              >
                Quadratics Lab
                <ArrowRight className="w-3.5 h-3.5 text-[#F4C46C]" />
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start min-w-0">
            {/* Left Docked Side-Hub: Complete 9-Unit Path, Survival Sheet & Symbol Decoder */}
            <div className="lg:col-span-5 xl:col-span-4 min-w-0">
              <CourseJourneySidebar courseId="algebra-1" />
            </div>

            {/* Right Sanctuary Panel: Live Mastery Tracker + 3-Stage Quick-Start Roadmap */}
            <div className="lg:col-span-7 xl:col-span-8 min-w-0 space-y-5">
              <div className="aurea-gold-frame p-5 sm:p-6 space-y-5 min-w-0">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="space-y-1.5 min-w-0">
                    <span className="font-mono-data text-[10.5px] uppercase tracking-[0.2em] text-[#F5C25B] block">
                      Live Algebra 1 Mastery Telemetry
                    </span>
                    <h3 className="font-serif-editorial text-2xl sm:text-3xl text-[#F7F4EC]">
                      Your Guided 3-Stage Quick-Start Path
                    </h3>
                    <p className="text-xs sm:text-sm text-[#A8B2C6] leading-relaxed max-w-2xl">
                      Follow all 9 Algebra 1 units in order, check off mastered lessons in the docked
                      hub, and switch tabs anytime for fast formula survival rules and plain-English
                      symbol translations.
                    </p>
                  </div>

                  <div className="instrument-panel px-4 py-2.5 border-[#F4C46C]/30 shrink-0 text-right">
                    <span className="font-mono-data text-[10px] uppercase tracking-wider text-[#A8B2C6] block">
                      Algebra 1 Progress
                    </span>
                    <span className="font-mono-data text-lg font-semibold text-[#FFE29E]">
                      {algebra1MasteredCount} / {algebra1Nodes.length} Mastered ({algebra1MasteredPct}%)
                    </span>
                  </div>
                </div>

                {/* Live Mastery Progress Bar */}
                <div className="space-y-2">
                  <div
                    role="progressbar"
                    aria-valuenow={algebra1MasteredPct}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`Algebra 1 mastery progress: ${algebra1MasteredCount} of ${algebra1Nodes.length} units`}
                    className="h-2.5 w-full rounded-full bg-[#050508] border border-[#F4C46C]/25 overflow-hidden"
                  >
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${algebra1MasteredPct}%`,
                        background: 'linear-gradient(90deg, #F5C25B, #FFE5A3, #45E6A6)',
                        boxShadow: '0 0 16px rgba(244, 196, 108, 0.7)',
                      }}
                    />
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono-data">
                    <span className="text-[#A8B2C6]">
                      {algebra1MasteredCount === algebra1Nodes.length
                        ? 'All 9 Algebra 1 units mastered! Ready for Geometry Step 1.'
                        : `Recommended Next: ${nextAlgebra1Node.code} · ${nextAlgebra1Node.title}`}
                    </span>
                    <Link
                      to={nextAlgebra1Node.route}
                      className="text-[#45E6A6] hover:underline inline-flex items-center gap-1"
                    >
                      Continue {nextAlgebra1Node.code} <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>

                {/* Beginner-Friendly 3-Stage Algebra 1 Quick-Start Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 min-w-0">
                  {ALGEBRA1_QUICK_STAGES.map((stage) => (
                    <div
                      key={stage.stage}
                      className="aurea-glass-card aurea-sheen-card p-4 space-y-3 flex flex-col justify-between min-w-0"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-mono-data text-[10px] uppercase tracking-wider text-[#F5C25B]">
                            {stage.range}
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[9.5px] font-mono-data bg-[#F4C46C]/15 border border-[#F4C46C]/30 text-[#FFE29E]">
                            Stage {stage.stage}
                          </span>
                        </div>
                        <h4 className="font-serif-editorial text-xl text-[#F7F4EC]">
                          {stage.title}
                        </h4>
                        <p className="text-xs text-[#A8B2C6] leading-relaxed">{stage.caption}</p>
                      </div>

                      <div className="space-y-1.5 pt-2 border-t border-[#F4C46C]/15">
                        {stage.nodeIds.map((nid) => {
                          const node = algebra1NodeMap.get(nid);
                          if (!node) return null;
                          const done = completedSet.has(nid);
                          return (
                            <Link
                              key={nid}
                              to={node.route}
                              className={`flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg border text-[11px] transition-all min-w-0 ${
                                done
                                  ? 'bg-[#45E6A6]/[0.08] border-[#45E6A6]/35 text-[#45E6A6]'
                                  : 'bg-[#050508]/80 border-[#F4C46C]/15 text-[#F7F4EC] hover:border-[#F4C46C]/50 hover:text-[#FFE29E]'
                              }`}
                            >
                              <span className="truncate font-medium">
                                <span className="font-mono-data text-[10px] text-[#F4C46C] mr-1.5">
                                  {node.code}
                                </span>
                                {node.title}
                              </span>
                              {done ? (
                                <CheckCircle2 className="w-3.5 h-3.5 text-[#45E6A6] shrink-0" />
                              ) : (
                                <ArrowRight className="w-3 h-3 text-[#727D94] shrink-0" />
                              )}
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Direct Algebra 1 Action CTAs */}
                <div className="pt-2 flex flex-wrap items-center gap-2.5">
                  <Link
                    to="/lesson/a1-expressions"
                    className="luminous-pill-btn inline-flex items-center gap-2 px-5 py-2.5 text-xs"
                  >
                    <PlayCircle className="w-4 h-4" />
                    Start Algebra 1 · Step 1
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  <Link
                    to="/lesson/a1-quadratics"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-mono-data bg-[#12121D] border border-[#F4C46C]/40 text-[#FFE29E] hover:border-[#FFE5A3] transition-colors"
                  >
                    Explore Quadratics (/lesson/a1-quadratics)
                  </Link>
                  <Link
                    to="/course/algebra-1"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-mono-data bg-[#0B0B12] border border-[#46D6E8]/35 text-[#46D6E8] hover:border-[#46D6E8]/70 transition-colors"
                  >
                    Full /course/algebra-1 Roadmap
                  </Link>
                  <Link
                    to="/textbook?course=algebra-1"
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full text-xs font-mono-data bg-[#0B0B12] border border-[#F4C46C]/25 text-[#A8B2C6] hover:text-[#FFE29E] transition-colors"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-[#F4C46C]" />
                    7 Algebra 1 Book Chapters
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION C: LIVING MATHEMATICAL CINEMA — 11 INTERACTIVE VISUAL ENGINES */}
        <section
          id="living-cinema"
          aria-label="Living Mathematical Cinema"
          className="space-y-6 scroll-mt-24 min-w-0"
        >
          <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[rgba(244,196,108,0.18)] pb-4">
            <div className="space-y-1 min-w-0">
              <span className="font-mono-data text-[11px] uppercase tracking-[0.22em] text-[#F4C46C]">
                Living Mathematical Cinema · 11 Interactive 3D &amp; Kinetic Engines
              </span>
              <h2 className="font-serif-editorial text-3xl sm:text-4xl text-[#F7F4EC]">
                Touch Every Formula in Real-Time Motion
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Link
                to={`/instruments?lab=${activeCinemaMeta.labId}`}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-mono-data bg-[#12121D] border border-[#F4C46C]/40 text-[#FFE29E] hover:border-[#FFE5A3] transition-colors"
              >
                <Cpu className="w-3.5 h-3.5 text-[#F4C46C]" />
                Open in /instruments
              </Link>
              <Link
                to="/presentation"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-mono-data bg-[#FF8563]/14 border border-[#FF8563]/45 text-[#FF8563] hover:bg-[#FF8563]/22 transition-colors"
              >
                <Presentation className="w-3.5 h-3.5" />
                Present in /presentation
              </Link>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div
            className="flex flex-wrap items-center gap-2 min-w-0"
            role="group"
            aria-label="Filter cinema engines by category"
          >
            {CINEMA_CATEGORIES.map((cat) => {
              const active = cinemaCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    setCinemaCategory(cat.id);
                    if (cat.id !== 'all' && activeCinemaMeta.category !== cat.id) {
                      const firstInCategory = CINEMA_ENGINES.find((item) => item.category === cat.id);
                      if (firstInCategory) setCinemaEngine(firstInCategory.id);
                    }
                  }}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-mono-data border transition-all ${
                    active ? 'font-semibold' : 'bg-[#0B0C12] text-[#A8B2C6] hover:text-[#F7F4EC]'
                  }`}
                  style={{
                    borderColor: active ? cat.accent : 'rgba(244,196,108,0.18)',
                    backgroundColor: active ? `${cat.accent}22` : '#0B0C12',
                    color: active ? cat.accent : undefined,
                    boxShadow: active ? `0 0 18px -6px ${cat.accent}` : undefined,
                  }}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          {/* Interactive Cinema Selector Tabs */}
          <div
            role="tablist"
            aria-label="Living Mathematical Cinema Engine Selector"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 min-w-0"
          >
            {visibleCinemaEngines.map((item) => {
              const Icon = item.icon;
              const active = cinemaEngine === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setCinemaEngine(item.id)}
                  className={`text-left p-3.5 rounded-2xl border transition-all min-w-0 aurea-sheen-card ${
                    active
                      ? 'aurea-pill-active'
                      : 'aurea-glass-card text-[#A8B2C6] hover:text-[#F7F4EC]'
                  }`}
                  style={
                    active
                      ? {
                          borderColor: item.accent,
                          boxShadow: `0 0 24px -8px ${item.accent}`,
                        }
                      : undefined
                  }
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span
                      className="font-mono-data text-[10px] uppercase tracking-wider truncate"
                      style={{ color: item.accent }}
                    >
                      {item.courseTag}
                    </span>
                    <Icon className="w-4 h-4 shrink-0" style={{ color: item.accent }} />
                  </div>
                  <div className="font-serif-editorial text-lg sm:text-xl text-[#F7F4EC] truncate">
                    {item.label}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Plain-English Guide Banner for Ages 11-18 */}
          <div
            className="aurea-glass-card p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 min-w-0"
            style={{ borderLeft: `3px solid ${activeCinemaMeta.accent}` }}
          >
            <div className="space-y-1.5 min-w-0">
              <h3 className="font-serif-editorial text-xl sm:text-2xl text-[#F7F4EC]">
                {activeCinemaMeta.headline}
              </h3>
              <p className="text-xs sm:text-sm text-[#A8B2C6] leading-relaxed max-w-3xl">
                {activeCinemaMeta.plainEnglish}
              </p>
              <p className="text-[11px] font-mono-data text-[#45E6A6]">
                Try this: {activeCinemaMeta.tryHint}
              </p>
            </div>
            <div className="rounded-xl bg-[#050508]/95 border border-[#F4C46C]/22 px-3.5 py-2.5 overflow-x-auto max-w-full shrink-0">
              <MathTex tex={activeCinemaMeta.formulaTex} className="text-xs sm:text-sm text-[#FFE29E]" />
            </div>
          </div>

          {/* Single Active Cinema Engine Mounted at Any Time (Snappy WebGL & Canvas Budget) */}
          <div className="min-w-0">
            {cinemaEngine === 'pipeline' && <AlgebraicPipelineEngine />}
            {cinemaEngine === 'polar' && <PolarHarmonicRingEngine />}
            {cinemaEngine === 'confidence' && <ConfidenceRibbonField />}
            {cinemaEngine === 'fourier-epi' && <FourierEpicyclesEngine />}
            {cinemaEngine === 'formula-morph' && <FormulaMorphEngine />}
            {cinemaEngine === 'pythagoras-fluid' && <PythagorasFluidProof />}
            {cinemaEngine === 'tensor' && (
              <Suspense
                fallback={
                  <div className="instrument-frame h-[430px] flex items-center justify-center font-mono-data text-xs text-[#A8B2C6]">
                    Initializing 3D Tensor &amp; Riemann Manifold…
                  </div>
                }
              >
                <LazyTensorRiemann3D />
              </Suspense>
            )}
            {cinemaEngine === 'vector-flow' && (
              <Suspense
                fallback={
                  <div className="instrument-frame h-[430px] flex items-center justify-center font-mono-data text-xs text-[#A8B2C6]">
                    Initializing 3D Vector Flow Field…
                  </div>
                }
              >
                <LazyVectorFlowField3D />
              </Suspense>
            )}
            {cinemaEngine === 'lorenz-chaos' && (
              <Suspense
                fallback={
                  <div className="instrument-frame h-[430px] flex items-center justify-center font-mono-data text-xs text-[#A8B2C6]">
                    Initializing 3D Lorenz Chaos Butterfly…
                  </div>
                }
              >
                <LazyLorenzAttractor3D />
              </Suspense>
            )}
            {cinemaEngine === 'matrix-warp' && (
              <Suspense
                fallback={
                  <div className="instrument-frame h-[430px] flex items-center justify-center font-mono-data text-xs text-[#A8B2C6]">
                    Initializing 3D Matrix Space Warp…
                  </div>
                }
              >
                <LazyMatrixTransform3D />
              </Suspense>
            )}
            {cinemaEngine === 'surface-rev' && (
              <Suspense
                fallback={
                  <div className="instrument-frame h-[430px] flex items-center justify-center font-mono-data text-xs text-[#A8B2C6]">
                    Initializing 360° Surface of Revolution…
                  </div>
                }
              >
                <LazySurfaceRevolution3D />
              </Suspense>
            )}
          </div>
        </section>

        {/* SECTION D: FULL-BLEED GOLDEN HARMONIC SPINE */}
        <section className="space-y-5">
          <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[rgba(244,196,108,0.16)] pb-4">
            <div className="space-y-1">
              <span className="font-mono-data text-[11px] uppercase tracking-[0.22em] text-[#F4C46C]">
                Golden Harmonic Spine · 24 Foundations Connected to Modern Physics
              </span>
              <h2 className="font-serif-editorial text-3xl sm:text-4xl text-[#F7F4EC]">
                How High School Math Weaves Directly Into String Theory
              </h2>
            </div>
            <Link
              to="/neural"
              className="inline-flex items-center gap-1.5 text-xs font-mono-data text-[#FFE29E] hover:underline"
            >
              Open Neural Matrix &amp; Harmonic Studio <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <GoldenHarmonicSpine />
        </section>

        {/* SECTION C: 3D STRING THEORY, CALABI-YAU & APOLLONIUS CONICS SPOTLIGHT */}
        <section className="space-y-6">
          <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[rgba(244,196,108,0.16)] pb-4">
            <div className="space-y-1">
              <span className="font-mono-data text-[11px] uppercase tracking-[0.22em] text-[#FFE29E]">
                Interactive 3D Geometry &amp; Frontier Laboratories
              </span>
              <h2 className="font-serif-editorial text-3xl sm:text-4xl text-[#F7F4EC]">
                Calabi-Yau Manifolds, String Harmonics &amp; Apollonius Conics in 3D
              </h2>
            </div>
            <div className="flex flex-wrap items-center gap-2.5">
              <Link
                to="/frontier"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-mono-data bg-[#F4C46C]/15 border border-[#F4C46C]/45 text-[#FFE29E] hover:bg-[#F4C46C]/25 transition-colors"
              >
                <Atom className="w-3.5 h-3.5" />
                Explore /frontier
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                to="/instruments"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-mono-data bg-[#11131C] border border-[#46D6E8]/40 text-[#46D6E8] hover:bg-[#46D6E8]/15 transition-colors"
              >
                <Compass className="w-3.5 h-3.5" />
                All /instruments Labs
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          <div className="space-y-8">
            {/* Spotlight 1: Calabi-Yau, Hopf Fibration & Worldsheet */}
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3 px-1">
                <div className="space-y-0.5">
                  <span className="font-mono-data text-[10.5px] uppercase tracking-[0.18em] text-[#F4C46C]">
                    01 · String Theory &amp; Complex Roots of Unity
                  </span>
                  <h3 className="font-serif-editorial text-2xl text-[#F7F4EC]">
                    Calabi-Yau Hypersurfaces, Hopf Fibers &amp; Vibrating Strings
                  </h3>
                </div>
                <Link
                  to="/frontier"
                  className="inline-flex items-center gap-1.5 text-xs font-mono-data text-[#FFE29E] hover:underline"
                >
                  Open String Theory 3D Challenges <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
              <CalabiYauManifold3D />
            </div>

            {/* Spotlight 2: Apollonius Double-Nappe Cone Slicer */}
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3 px-1">
                <div className="space-y-0.5">
                  <span className="font-mono-data text-[10.5px] uppercase tracking-[0.18em] text-[#46D6E8]">
                    02 · Precalculus &amp; Classical Conic Geometry
                  </span>
                  <h3 className="font-serif-editorial text-2xl text-[#F7F4EC]">
                    One Double Cone, Four Curves: Circle, Ellipse, Parabola &amp; Hyperbola
                  </h3>
                </div>
                <Link
                  to="/instruments"
                  className="inline-flex items-center gap-1.5 text-xs font-mono-data text-[#46D6E8] hover:underline"
                >
                  Launch Full 3D &amp; Math Lab Bank <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
              <ApolloniusCone3D />
            </div>
          </div>
        </section>

        {/* SECTION D: INTERACTIVE 36-NODE CONSTELLATION ATLAS */}
        <section id="constellation" className="space-y-5 scroll-mt-24">
          <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[rgba(244,196,108,0.16)] pb-4">
            <div className="space-y-1">
              <span className="font-mono-data text-[11px] uppercase tracking-[0.22em] text-[#46D6E8]">
                Constellation Atlas · 36 Interconnected Prerequisite Nodes
              </span>
              <h2 className="font-serif-editorial text-3xl sm:text-4xl text-[#F7F4EC]">
                Click Any Glowing Node to Inspect Prerequisites &amp; Launch Its 7-Layer Lesson
              </h2>
            </div>
            <Link
              to="/map"
              className="inline-flex items-center gap-1.5 text-xs font-mono-data text-[#46D6E8] hover:underline"
            >
              Open Fullscreen Constellation Atlas <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <NeuralAtlasMap heightClass="h-[540px] sm:h-[600px]" />
        </section>

        {/* SECTION E: FLORIDA B.E.S.T. 4-YEAR CURRICULUM & 28-CHAPTER TEXTBOOK DIRECTORY */}
        <section className="space-y-6">
          <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[rgba(244,196,108,0.16)] pb-4">
            <div className="space-y-1">
              <span className="font-mono-data text-[11px] uppercase tracking-[0.22em] text-[#F4C46C]">
                Florida B.E.S.T. Curriculum &amp; Interactive Textbook
              </span>
              <h2 className="font-serif-editorial text-3xl sm:text-4xl text-[#F7F4EC]">
                4 Full-Year Courses · 28 Textbook Chapters &amp; 36 Interactive Lessons
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setDirFilter('all')}
                  className={`px-3 py-1 rounded-full text-[11px] font-mono-data border transition-all ${
                    dirFilter === 'all'
                      ? 'bg-[#F4C46C]/20 border-[#F4C46C] text-[#FFE29E]'
                      : 'border-[rgba(244,196,108,0.18)] text-[#A8B2C6] hover:text-[#F7F4EC]'
                  }`}
                >
                  All 4 Courses
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
                        borderColor: active ? c.accent : 'rgba(244,196,108,0.18)',
                        backgroundColor: active ? `${c.accent}22` : 'transparent',
                        color: active ? c.accent : '#A8B2C6',
                      }}
                    >
                      {c.title}
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-1 rounded-full p-0.5 bg-[#0B0C12] border border-[rgba(244,196,108,0.18)]">
                {(
                  [
                    ['both', 'Chapters + Lessons'],
                    ['textbook', '28 Chapters'],
                    ['lessons', '36 Lessons'],
                  ] as const
                ).map(([modeId, modeLabel]) => {
                  const active = dirView === modeId;
                  return (
                    <button
                      key={modeId}
                      type="button"
                      onClick={() => setDirView(modeId)}
                      className={`px-2.5 py-1 rounded-full text-[10.5px] font-mono-data transition-colors ${
                        active
                          ? 'bg-[#F4C46C] text-[#060609] font-semibold'
                          : 'text-[#A8B2C6] hover:text-[#F7F4EC]'
                      }`}
                    >
                      {modeLabel}
                    </button>
                  );
                })}
              </div>

              <a
                href={FLDOE_SOURCES.bestIndex.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-[11px] font-mono-data text-[#727D94] hover:text-[#FFE29E]"
              >
                FLDOE B.E.S.T. <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          <div
            className={`grid grid-cols-1 ${
              dirFilter === 'all' ? 'lg:grid-cols-2' : 'max-w-5xl'
            } gap-6 min-w-0`}
          >
            {visibleDirectoryCourses.map((cid) => {
              const c = COURSES[cid];
              const tbMeta = FLORIDA_COURSE_TEXTBOOK_META[cid];
              const chapters = FLORIDA_TEXTBOOK_CHAPTERS.filter((ch) => ch.courseId === cid).sort(
                (a, b) => a.chapterNumber - b.chapterNumber
              );
              const nodes = CURRICULUM_NODES.filter((n) => n.courseId === cid);

              return (
                <article
                  key={cid}
                  className="aurea-glass-card p-5 sm:p-6 flex flex-col justify-between gap-5 min-w-0"
                  style={{ borderTop: `2px solid ${c.accent}` }}
                >
                  <div className="space-y-4">
                    {/* Course Header */}
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2 font-mono-data text-[10px]">
                          <span style={{ color: c.accent }}>
                            {c.shortTitle} · CPALMS {c.cpalmsCode}
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-[#11131C] border border-[rgba(244,196,108,0.18)] text-[#A8B2C6]">
                            {tbMeta.eocBadge}
                          </span>
                        </div>
                        <Link
                          to={`/course/${cid}`}
                          className="font-serif-editorial text-2xl sm:text-3xl text-[#F7F4EC] hover:underline block"
                        >
                          {c.title}
                        </Link>
                        <p className="text-xs text-[#A8B2C6] leading-relaxed">{tbMeta.overview}</p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <Link
                          to={`/textbook?course=${cid}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-mono-data border border-[rgba(244,196,108,0.28)] bg-[#11131C] text-[#FFE29E] hover:border-[#F4C46C]"
                        >
                          <BookOpen className="w-3 h-3" />7 Chapters
                        </Link>
                        <Link
                          to={`/course/${cid}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-mono-data text-[#060609] font-semibold"
                          style={{ backgroundColor: c.accent }}
                        >
                          Course Hub →
                        </Link>
                      </div>
                    </div>

                    {/* 7 Florida B.E.S.T. Textbook Chapters */}
                    {(dirView === 'both' || dirView === 'textbook') && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between font-mono-data text-[10px] uppercase tracking-wider text-[#F4C46C]">
                          <span>Florida B.E.S.T. Textbook Chapters (7)</span>
                          <Link to={`/textbook?course=${cid}`} className="hover:underline">
                            Open Book →
                          </Link>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {chapters.map((ch) => (
                            <Link
                              key={ch.id}
                              to={`/textbook?course=${cid}&chapter=${ch.id}`}
                              className="p-2.5 rounded-xl bg-[#0B0C12] border border-[rgba(244,196,108,0.14)] hover:border-[rgba(244,196,108,0.4)] transition-all group"
                            >
                              <div className="flex items-center justify-between gap-2 font-mono-data text-[10px]">
                                <span style={{ color: c.accent }}>CH 0{ch.chapterNumber}</span>
                                <span className="text-[#727D94] truncate">{ch.benchmarks[0]}</span>
                              </div>
                              <div className="text-xs font-medium text-[#F7F4EC] truncate mt-0.5 group-hover:underline">
                                {ch.title}
                              </div>
                              <div className="text-[10.5px] text-[#A8B2C6] truncate">
                                {ch.subtitle}
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 9 Interactive 7-Layer Lessons */}
                    {(dirView === 'both' || dirView === 'lessons') && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between font-mono-data text-[10px] uppercase tracking-wider text-[#A8B2C6]">
                          <span>Interactive 7-Layer Lessons ({nodes.length})</span>
                          <Link
                            to={`/course/${cid}`}
                            className="hover:underline"
                            style={{ color: c.accent }}
                          >
                            All {c.shortTitle} Units →
                          </Link>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          {nodes.map((node) => (
                            <Link
                              key={node.id}
                              to={node.route}
                              className="flex items-center gap-2 p-2 rounded-xl bg-[#060609]/85 border border-[rgba(244,196,108,0.12)] hover:border-[rgba(244,196,108,0.38)] transition-all group"
                            >
                              <span
                                className="w-8 h-8 rounded-lg shrink-0 flex items-center justify-center font-mono-data text-[9px] font-semibold border"
                                style={{
                                  borderColor: `${c.accent}44`,
                                  backgroundColor: `${c.accent}14`,
                                  color: c.accent,
                                }}
                              >
                                {node.symbol}
                              </span>
                              <div className="min-w-0">
                                <div className="text-[11.5px] font-medium text-[#F7F4EC] truncate group-hover:underline">
                                  {node.title}
                                </div>
                                <div className="text-[9.5px] font-mono-data text-[#727D94] truncate">
                                  {node.code}
                                </div>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-[rgba(244,196,108,0.14)] flex flex-wrap items-center justify-between gap-2 text-xs font-mono-data">
                    <span className="text-[#727D94] text-[11px]">{tbMeta.audience}</span>
                    <Link
                      to={`/course/${cid}`}
                      className="inline-flex items-center gap-1 hover:underline"
                      style={{ color: c.accent }}
                    >
                      Open {c.title} Hub <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* SECTION H: OBSERVATORY SUITE PORTALS */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 min-w-0">
          <Link
            to="/frontier"
            className="aurea-glass-card aurea-sheen-card p-5 space-y-2.5 hover:border-[#F4C46C]/60 transition-all min-w-0"
          >
            <div className="flex items-center justify-between text-[#FFE29E]">
              <span className="font-mono-data text-[10px] uppercase tracking-wider">10D Frontier</span>
              <Orbit className="w-4 h-4" />
            </div>
            <h3 className="font-serif-editorial text-xl text-[#F7F4EC]">String Theory 3D</h3>
            <p className="text-xs text-[#A8B2C6] leading-relaxed">
              Calabi-Yau manifolds, Hopf rings, worldsheet vibrations, and 60,000-particle flux.
            </p>
          </Link>

          <Link
            to="/textbook"
            className="aurea-glass-card aurea-sheen-card p-5 space-y-2.5 hover:border-[#46D6E8]/60 transition-all min-w-0"
          >
            <div className="flex items-center justify-between text-[#46D6E8]">
              <span className="font-mono-data text-[10px] uppercase tracking-wider">28 Chapters</span>
              <Layers className="w-4 h-4" />
            </div>
            <h3 className="font-serif-editorial text-xl text-[#F7F4EC]">Florida B.E.S.T. Book</h3>
            <p className="text-xs text-[#A8B2C6] leading-relaxed">
              Interactive examples, EOC trap alerts, MTR habits, and live checks for all 4 courses.
            </p>
          </Link>

          <Link
            to="/instruments"
            className="aurea-glass-card aurea-sheen-card p-5 space-y-2.5 hover:border-[#45E6A6]/60 transition-all min-w-0"
          >
            <div className="flex items-center justify-between text-[#45E6A6]">
              <span className="font-mono-data text-[10px] uppercase tracking-wider">33 Interactive Labs</span>
              <Cpu className="w-4 h-4" />
            </div>
            <h3 className="font-serif-editorial text-xl text-[#F7F4EC]">All 3D &amp; Kinetic Labs</h3>
            <p className="text-xs text-[#A8B2C6] leading-relaxed">
              Every 3D shader, kinetic 3Blue1Brown proof, dataflow oscilloscope, and topic workbench.
            </p>
          </Link>

          <Link
            to="/planner"
            className="aurea-glass-card aurea-sheen-card p-5 space-y-2.5 hover:border-[#FF8563]/60 transition-all min-w-0"
          >
            <div className="flex items-center justify-between text-[#FF8563]">
              <span className="font-mono-data text-[10px] uppercase tracking-wider">Target Gauge</span>
              <Calculator className="w-4 h-4" />
            </div>
            <h3 className="font-serif-editorial text-xl text-[#F7F4EC]">Syllabus Grade Planner</h3>
            <p className="text-xs text-[#A8B2C6] leading-relaxed">
              Simulate category weights and compute the exact final exam score needed for your goal.
            </p>
          </Link>
        </section>
      </div>
    </AtlasShell>
  );
}
