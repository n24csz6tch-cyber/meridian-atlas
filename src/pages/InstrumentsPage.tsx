import { Suspense, lazy, useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Activity,
  ArrowRight,
  Atom,
  BarChart3,
  BookOpen,
  Box,
  Compass,
  Cone,
  Droplets,
  FunctionSquare,
  GitBranch,
  Infinity as InfinityIcon,
  Layers,
  Network,
  Orbit,
  Radar,
  Scale,
  Sigma,
  Sparkles,
  TrendingUp,
  Triangle,
  Waypoints,
} from 'lucide-react';
import { AtlasShell } from '../components/AtlasShell';
import { CourseId } from '../data/standards';
import { QuadraticWorkbench } from '../instruments/QuadraticWorkbench';
import { SolidNetLab } from '../instruments/SolidNetLab';
import { AlgebraicPipelineEngine } from '../visuals/drive/AlgebraicPipelineEngine';
import { ConfidenceRibbonField } from '../visuals/drive/ConfidenceRibbonField';
import { PolarHarmonicRingEngine } from '../visuals/drive/PolarHarmonicRingEngine';
import { CalabiYauManifold3D } from '../visuals/frontier/CalabiYauManifold3D';
import { OrbitalSignalTorus3D } from '../visuals/frontier/OrbitalSignalTorus3D';
import { GoldenHarmonicSpine } from '../visuals/harmony/GoldenHarmonicSpine';
import { FourierEpicyclesEngine } from '../visuals/kinetic/FourierEpicyclesEngine';
import { FormulaMorphEngine } from '../visuals/kinetic/FormulaMorphEngine';
import { PythagorasFluidProof } from '../visuals/kinetic/PythagorasFluidProof';
import { LogarithmLab } from '../visuals/logarithms/LogarithmLab';
import { NeuralMathEngine } from '../visuals/neural/NeuralMathEngine';
import { ApolloniusCone3D } from '../visuals/solids/ApolloniusCone3D';
import { TopicVisualCanvas } from '../visuals/topics/TopicVisualCanvas';
import { UnitCircleWaveCanvas } from '../visuals/trig/UnitCircleWaveCanvas';
import { VectorParallelogramCanvas } from '../visuals/trig/VectorParallelogramCanvas';
import { MathVortexCanvas } from '../visuals/vortex/MathVortexCanvas';

const LazyTensorRiemann3D = lazy(() => import('../visuals/drive/TensorRiemann3D'));
const LazyVectorFlowField3D = lazy(() => import('../visuals/cinema3d/VectorFlowField3D'));
const LazyLorenzAttractor3D = lazy(() => import('../visuals/cinema3d/LorenzAttractor3D'));
const LazyMatrixTransform3D = lazy(() => import('../visuals/cinema3d/MatrixTransform3D'));
const LazySurfaceRevolution3D = lazy(() => import('../visuals/cinema3d/SurfaceRevolution3D'));

type LabCategory = 'all' | 'frontier' | CourseId;

type LabId =
  | 'orbital-torus'
  | 'calabi-yau'
  | 'tensor-riemann'
  | 'vector-flow-3d'
  | 'lorenz-chaos-3d'
  | 'matrix-transform-3d'
  | 'surface-revolution-3d'
  | 'fourier-epicycles'
  | 'formula-morph'
  | 'pythagoras-fluid'
  | 'apollonius-cone'
  | 'harmonic-spine'
  | 'solids'
  | 'neural'
  | 'vortex'
  | 'quadratic'
  | 'algebraic-pipeline'
  | 'linear-exp'
  | 'abs-radicals'
  | 'inequalities'
  | 'regression'
  | 'angles-triangles'
  | 'circles-coord'
  | 'pythagoras'
  | 'logs'
  | 'confidence-ribbon'
  | 'nonlinear-inv'
  | 'pascal-prob'
  | 'polynomials-rat'
  | 'trig-vectors'
  | 'polar-harmonic'
  | 'parametric-polar'
  | 'limits-series';

interface LabMeta {
  id: LabId;
  label: string;
  category: Exclude<LabCategory, 'all'>;
  course?: CourseId;
  accent: string;
  tag: string;
  description: string;
  companionRoute: string;
  companionLabel: string;
  icon: typeof Network;
}

const LAB_ITEMS: LabMeta[] = [
  {
    id: 'orbital-torus',
    label: 'Orbital Signal Torus 3D',
    category: 'frontier',
    accent: '#F4C46C',
    tag: 'THREE.JS · 60,000-PARTICLE MANIFOLD',
    description:
      'GPU-morphed 3D particle torus, Hopf fiber rings, golden spiral plume, and Lorenz cloud with interactive shockwaves.',
    companionRoute: '/frontier',
    companionLabel: 'Open String Theory 3D Page',
    icon: Orbit,
  },
  {
    id: 'calabi-yau',
    label: 'Calabi-Yau & Worldsheet 3D',
    category: 'frontier',
    accent: '#FFE29E',
    tag: 'THREE.JS · EXTRA-DIMENSIONAL GEOMETRY',
    description:
      'Explore z₁ⁿ + z₂ⁿ = 1 manifold sheets, stereographic Hopf fibration loops, and relativistic standing-wave strings.',
    companionRoute: '/frontier',
    companionLabel: 'Solve 10D Physics Challenges',
    icon: Atom,
  },
  {
    id: 'tensor-riemann',
    label: '3D Tensor & Riemann Manifold',
    category: 'frontier',
    accent: '#FFE29E',
    tag: 'THREE.JS · 3D RIEMANN PRISMS & TENSOR SLICES',
    description:
      'Stack 3D Riemann prisms beneath curved manifolds, toggle Midpoint vs. Corner sampling, and watch volume converge toward exact integrals.',
    companionRoute: '/neural',
    companionLabel: 'Open Neural & Tensor Studio',
    icon: Box,
  },
  {
    id: 'vector-flow-3d',
    label: '3D Vector Flow Field',
    category: 'frontier',
    accent: '#46D6E8',
    tag: 'THREE.JS SHADER · CURL VORTEX, DIPOLE & GRAVITY SINK',
    description:
      'Fly 1,800 glowing particles and 3D velocity arrows through swirling vortices, magnetic dipole arcs, saddle curls, and spiral sinks.',
    companionRoute: '/neural',
    companionLabel: 'Open Vector & Neural Studio',
    icon: Compass,
  },
  {
    id: 'lorenz-chaos-3d',
    label: '3D Lorenz Chaos Butterfly',
    category: 'frontier',
    accent: '#FF8563',
    tag: 'THREE.JS SHADER · STRANGE ATTRACTOR & Δ₀ = 0.01 SPLIT',
    description:
      'Launch two nearly identical orbits (Δ₀ = 0.01) across twin glowing 3D attractor wings and watch deterministic chaos diverge live.',
    companionRoute: '/presentation',
    companionLabel: 'Watch in Keynote Stage',
    icon: Orbit,
  },
  {
    id: 'matrix-transform-3d',
    label: '3D Matrix Space Warp',
    category: 'algebra-2',
    course: 'algebra-2',
    accent: '#FFE29E',
    tag: 'ALGEBRA 2 · THREE.JS 3×3 BASIS & DETERMINANT VOLUME',
    description:
      'Stretch, shear, rotate, and mirror-flip a 3D lattice and unit cube while tracking basis vectors (î, ĵ, k̂) and signed volume det(A).',
    companionRoute: '/neural',
    companionLabel: 'Open Neural Matrix Studio',
    icon: Layers,
  },
  {
    id: 'surface-revolution-3d',
    label: '360° Solid of Revolution',
    category: 'geometry',
    course: 'geometry',
    accent: '#46D6E8',
    tag: 'GEOMETRY & CALCULUS · THREE.JS LATHE & DISK VOLUME',
    description:
      'Spin 2D curves 360° into crystal 3D bowls, vases, and cones while sliding a glowing circular cross-section disk along the axis.',
    companionRoute: '/lesson/solids-3d',
    companionLabel: 'Open 3D Solids Lesson',
    icon: Box,
  },
  {
    id: 'fourier-epicycles',
    label: 'Fourier Epicycles Engine',
    category: 'precalculus',
    course: 'precalculus',
    accent: '#F4C46C',
    tag: 'PRECALCULUS · 3B1B PHASOR CIRCLES & DFT CONTOURS',
    description:
      'Link rotating circles tip-to-tail to draw square waves, sawtooth ramps, hearts, 5-point stars, and figure-8 infinity loops live.',
    companionRoute: '/lesson/pc-polar',
    companionLabel: 'Open Polar & Harmonics Lesson',
    icon: Waypoints,
  },
  {
    id: 'formula-morph',
    label: 'Kinetic Formula Morph',
    category: 'algebra-1',
    course: 'algebra-1',
    accent: '#45E6A6',
    tag: 'ALGEBRA 1 & 2 · 3B1B ANIMATED DERIVATIONS',
    description:
      'Watch algebraic symbols glide smoothly step-by-step from ax² + bx + c = 0 to the Quadratic Formula, slope-intercept, and log inverses.',
    companionRoute: '/lesson/quadratics',
    companionLabel: 'Open Quadratics Lesson',
    icon: GitBranch,
  },
  {
    id: 'pythagoras-fluid',
    label: 'Pythagoras Fluid Proof',
    category: 'geometry',
    course: 'geometry',
    accent: '#45E6A6',
    tag: 'GEOMETRY · 3B1B HYDRAULIC a² + b² = c² CONSERVATION',
    description:
      'Pour luminous golden and cyan liquid from both leg squares into the tilted hypotenuse square—proving a² + b² = c² with zero spills.',
    companionRoute: '/lesson/g-right-trig',
    companionLabel: 'Open Right Triangles Lesson',
    icon: Droplets,
  },
  {
    id: 'apollonius-cone',
    label: 'Apollonius Conics 3D',
    category: 'precalculus',
    course: 'precalculus',
    accent: '#F4C46C',
    tag: 'THREE.JS · DOUBLE-NAPPE CONIC SLICER',
    description:
      'Tilt a luminous golden plane across a 3D double cone to generate circles, ellipses, parabolas, and hyperbolas live.',
    companionRoute: '/lesson/pc-conics',
    companionLabel: 'Open Conic Sections Lesson',
    icon: Cone,
  },
  {
    id: 'harmonic-spine',
    label: 'Golden Harmonic Spine',
    category: 'frontier',
    accent: '#FFE29E',
    tag: '60FPS OBSERVATORY · 24 HARMONIC LINKS',
    description:
      'Trace all 24 Florida B.E.S.T. foundations across golden harmonic strands to modern physics and String Theory.',
    companionRoute: '/neural',
    companionLabel: 'Open Neural & Harmonic Studio',
    icon: Waypoints,
  },
  {
    id: 'solids',
    label: '3D Solid & Hinged Net Lab',
    category: 'geometry',
    course: 'geometry',
    accent: '#46D6E8',
    tag: 'THREE.JS · HINGED NETS & CROSS-SECTIONS',
    description:
      'Unfold prisms, pyramids, and cylinders along real geometric hinges and inspect parallel cross-section slices.',
    companionRoute: '/lesson/solids-3d',
    companionLabel: 'Open 3D Solids 7-Layer Lesson',
    icon: Box,
  },
  {
    id: 'neural',
    label: 'Neural Matrix Engine',
    category: 'algebra-2',
    course: 'algebra-2',
    accent: '#45E6A6',
    tag: 'MATRIX CALCULUS · LIVE BACKPROPAGATION',
    description:
      'Watch real matrix multiplication, activation functions, and gradient descent train live firing synapses.',
    companionRoute: '/neural',
    companionLabel: 'Open Full Neural Studio',
    icon: Network,
  },
  {
    id: 'vortex',
    label: 'Vortex & Chaos Theater',
    category: 'precalculus',
    course: 'precalculus',
    accent: '#FF8563',
    tag: 'DYNAMICAL SYSTEMS · LORENZ & FOURIER',
    description:
      'Switch between curl vector fields, Lorenz butterfly chaos, Fourier epicycles, and complex phase streamlines.',
    companionRoute: '/neural',
    companionLabel: 'Open Dynamical Theater',
    icon: Sparkles,
  },
  {
    id: 'quadratic',
    label: 'Quadratic Workbench',
    category: 'algebra-1',
    course: 'algebra-1',
    accent: '#F5C25B',
    tag: 'ALGEBRA 1 · DISCRIMINANT & VERTEX SOLVER',
    description:
      'Drag parabola vertices directly, watch Δ = b² − 4ac flip roots, and step through completing the square.',
    companionRoute: '/lesson/quadratics',
    companionLabel: 'Open Quadratics Lesson',
    icon: FunctionSquare,
  },
  {
    id: 'algebraic-pipeline',
    label: 'Algebraic Dataflow & Wave',
    category: 'algebra-1',
    course: 'algebra-1',
    accent: '#F5C25B',
    tag: 'ALGEBRA 1 · DATAFLOW CONDUITS & OSCILLOSCOPE',
    description:
      'Stream live numbers through linear scaling ax + b and quadratic warping into a real-time multi-wave oscilloscope.',
    companionRoute: '/lesson/a1-quadratics',
    companionLabel: 'Open Quadratics Lesson',
    icon: Activity,
  },
  {
    id: 'linear-exp',
    label: 'Structure, Slope & Growth',
    category: 'algebra-1',
    course: 'algebra-1',
    accent: '#F5C25B',
    tag: 'ALGEBRA 1 · AREA MODELS, SLOPE & EXPONENTIALS',
    description:
      'Interactive laboratories for algebraic area factorization, secant slope triangles, and exponential asymptotes.',
    companionRoute: '/course/algebra-1',
    companionLabel: 'Open Algebra 1 Hub',
    icon: TrendingUp,
  },
  {
    id: 'abs-radicals',
    label: 'Abs Value & Radicals',
    category: 'algebra-1',
    course: 'algebra-1',
    accent: '#F5C25B',
    tag: 'ALGEBRA 1 · PIECEWISE V-SHIFTS & EXPONENTS',
    description:
      'Explore piecewise absolute value shifts alongside rational exponent and square-root domain curves.',
    companionRoute: '/lesson/a1-abs-piecewise',
    companionLabel: 'Open Absolute Value Lesson',
    icon: Scale,
  },
  {
    id: 'inequalities',
    label: 'Inequalities & Systems',
    category: 'algebra-1',
    course: 'algebra-1',
    accent: '#F5C25B',
    tag: 'ALGEBRA 1 · HALF-PLANES & GAUSSIAN PENCILS',
    description:
      'Shade feasible linear inequality wedges and slide intersecting lines across exact solution coordinates.',
    companionRoute: '/lesson/a1-systems',
    companionLabel: 'Open Systems Lesson',
    icon: Sigma,
  },
  {
    id: 'regression',
    label: 'Linear Regression & Residuals',
    category: 'algebra-1',
    course: 'algebra-1',
    accent: '#F5C25B',
    tag: 'ALGEBRA 1 · LEAST-SQUARES SQUARES',
    description:
      'See vertical prediction residuals visualized as glowing squares minimized along the regression line.',
    companionRoute: '/lesson/a1-statistics',
    companionLabel: 'Open Regression Lesson',
    icon: BarChart3,
  },
  {
    id: 'angles-triangles',
    label: 'Angles, Congruence & Quads',
    category: 'geometry',
    course: 'geometry',
    accent: '#46D6E8',
    tag: 'GEOMETRY · TRANSVERSALS, SIMILARITY & POLYGONS',
    description:
      'Interactive laboratories for parallel transversals, triangle congruence, k² similarity scaling, and quadrilaterals.',
    companionRoute: '/course/geometry',
    companionLabel: 'Open Geometry Hub',
    icon: Triangle,
  },
  {
    id: 'pythagoras',
    label: 'Pythagoras & Rigid Symmetry',
    category: 'geometry',
    course: 'geometry',
    accent: '#46D6E8',
    tag: 'GEOMETRY · RIGHT TRIG & TRANSFORMATIONS',
    description:
      'Manipulate right-triangle area proofs, trigonometric ratios, and isometric reflections/rotations.',
    companionRoute: '/lesson/g-right-trig',
    companionLabel: 'Open Right Trig Lesson',
    icon: Compass,
  },
  {
    id: 'circles-coord',
    label: 'Circles & Coordinate Proofs',
    category: 'geometry',
    course: 'geometry',
    accent: '#46D6E8',
    tag: 'GEOMETRY · ARCS, SECTORS & ANALYTIC DISTANCE',
    description:
      'Inspect inscribed angles, tangent chords, circle sectors, perpendicular slopes, and midpoint bisectors.',
    companionRoute: '/lesson/g-circles',
    companionLabel: 'Open Circles Lesson',
    icon: Compass,
  },
  {
    id: 'logs',
    label: 'Logarithm & Inverse Lab',
    category: 'algebra-2',
    course: 'algebra-2',
    accent: '#45E6A6',
    tag: 'ALGEBRA 2 · LOG LAWS & EXPONENTIAL REFLECTION',
    description:
      'Expand and condense logarithmic expressions interactively across the y = x symmetry mirror.',
    companionRoute: '/lesson/logarithms',
    companionLabel: 'Open Logarithms Lesson',
    icon: TrendingUp,
  },
  {
    id: 'confidence-ribbon',
    label: 'Confidence Ribbon & Residuals',
    category: 'algebra-2',
    course: 'algebra-2',
    accent: '#45E6A6',
    tag: 'ALGEBRA 2 & ML · 68-95-99.7% PROBABILITY BANDS',
    description:
      'Inspect layered 1σ, 2σ, and 3σ uncertainty ribbons with Monte Carlo residuals, live R², and Empirical Rule coverage.',
    companionRoute: '/lesson/a2-probability',
    companionLabel: 'Open Normal Curve Lesson',
    icon: TrendingUp,
  },
  {
    id: 'nonlinear-inv',
    label: 'Nonlinear Systems & Radicals',
    category: 'algebra-2',
    course: 'algebra-2',
    accent: '#45E6A6',
    tag: 'ALGEBRA 2 · PARABOLA INTERSECTIONS & INVERSES',
    description:
      'Track line-parabola tangent transitions and detect extraneous solutions in radical inverse equations.',
    companionRoute: '/lesson/a2-quad-systems',
    companionLabel: 'Open Nonlinear Systems Lesson',
    icon: Layers,
  },
  {
    id: 'pascal-prob',
    label: 'Pascal Binomial & Normal Bell',
    category: 'algebra-2',
    course: 'algebra-2',
    accent: '#45E6A6',
    tag: 'ALGEBRA 2 · COMBINATORICS & Z-SCORE BANDS',
    description:
      'Generate binomial coefficients along Pascal paths and explore empirical normal distribution bands.',
    companionRoute: '/lesson/a2-probability',
    companionLabel: 'Open Probability Lesson',
    icon: Sparkles,
  },
  {
    id: 'polynomials-rat',
    label: 'Polynomials, Complex & Poles',
    category: 'algebra-2',
    course: 'algebra-2',
    accent: '#45E6A6',
    tag: 'ALGEBRA 2 · ARGAND PLANE, MULTIPLICITY & ASYMPTOTES',
    description:
      'Plot complex rotations, polynomial root bouncing vs. crossing, and rational function vertical poles.',
    companionRoute: '/lesson/a2-complex',
    companionLabel: 'Open Complex Numbers Lesson',
    icon: GitBranch,
  },
  {
    id: 'trig-vectors',
    label: 'Unit Circle, Trig & Vectors',
    category: 'precalculus',
    course: 'precalculus',
    accent: '#FF8563',
    tag: 'PRECALCULUS · SINUSOIDS, IDENTITIES & PARALLELOGRAMS',
    description:
      'Connect circular rotation to sine waves, verify Pythagorean & double-angle identities, and drag 2D vectors.',
    companionRoute: '/lesson/unit-circle',
    companionLabel: 'Open Unit Circle Lesson',
    icon: Activity,
  },
  {
    id: 'parametric-polar',
    label: 'Parametric, Polar & 2D Conics',
    category: 'precalculus',
    course: 'precalculus',
    accent: '#FF8563',
    tag: 'PRECALCULUS · LISSAJOUS, POLAR ROSES & CONIC FOCI',
    description:
      'Trace Lissajous orbits, multi-petal polar rose blooms, and planar foci/eccentricity envelopes.',
    companionRoute: '/lesson/pc-polar',
    companionLabel: 'Open Polar Curves Lesson',
    icon: Radar,
  },
  {
    id: 'polar-harmonic',
    label: 'Polar Harmonic Chord Ring',
    category: 'precalculus',
    course: 'precalculus',
    accent: '#FF8563',
    tag: 'PRECALCULUS · POLAR ROSES & GOLDEN CHORDS',
    description:
      'Scrub angle θ on orbital rings, trace sin/cos harmonic chords, and morph between circles, roses, and golden-ratio rosettes.',
    companionRoute: '/lesson/pc-polar',
    companionLabel: 'Open Polar Curves Lesson',
    icon: Radar,
  },
  {
    id: 'limits-series',
    label: 'Limits & Infinite Series',
    category: 'precalculus',
    course: 'precalculus',
    accent: '#FF8563',
    tag: 'PRECALCULUS · SECANT-TO-TANGENT & CONVERGENCE',
    description:
      'Watch h → 0 snap secant chords into calculus tangents and sum geometric series toward finite limits.',
    companionRoute: '/lesson/pc-limits',
    companionLabel: 'Open Calculus Limits Lesson',
    icon: InfinityIcon,
  },
];

const CATEGORY_FILTERS: { id: LabCategory; label: string; accent: string }[] = [
  { id: 'all', label: 'All 33 Labs', accent: '#F4C46C' },
  { id: 'frontier', label: '3D & String Frontier (6)', accent: '#FFE29E' },
  { id: 'algebra-1', label: 'Algebra 1 (7)', accent: '#F5C25B' },
  { id: 'geometry', label: 'Geometry (6)', accent: '#46D6E8' },
  { id: 'algebra-2', label: 'Algebra 2 (7)', accent: '#45E6A6' },
  { id: 'precalculus', label: 'Precalculus (7)', accent: '#FF8563' },
];

function isLabId(val: string | null): val is LabId {
  return LAB_ITEMS.some((item) => item.id === val);
}

export function InstrumentsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const paramLab = searchParams.get('lab');
  const initialLab = isLabId(paramLab) ? (paramLab as LabId) : 'orbital-torus';

  const [activeLab, setActiveLab] = useState<LabId>(initialLab);
  const [categoryFilter, setCategoryFilter] = useState<LabCategory>('all');

  useEffect(() => {
    if (isLabId(paramLab)) {
      setActiveLab((prev) => (prev === paramLab ? prev : paramLab));
    }
  }, [paramLab]);

  const activeMeta = LAB_ITEMS.find((l) => l.id === activeLab) ?? LAB_ITEMS[0];

  const visibleTabs = useMemo(
    () =>
      categoryFilter === 'all'
        ? LAB_ITEMS
        : LAB_ITEMS.filter((item) => item.category === categoryFilter),
    [categoryFilter]
  );

  const selectLab = (id: LabId) => {
    setActiveLab(id);
    setSearchParams({ lab: id }, { replace: true });
  };

  return (
    <AtlasShell activeCourse={activeMeta.course}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6 min-w-0">
        <header className="space-y-5 border-b border-[rgba(244,196,108,0.16)] pb-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="space-y-1.5 min-w-0">
              <span className="font-mono-data text-[11px] uppercase tracking-[0.22em] text-[#F4C46C]">
                AUREA Precision Observatory · 33 Standalone Lab Suites (3D Shaders, Kinetic Proofs &amp; 35 Topic Engines)
              </span>
              <h1 className="font-serif-editorial text-3xl sm:text-5xl text-[#F7F4EC]">
                3D &amp; Mathematical Instruments Workbench
              </h1>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Link
                to="/frontier"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-mono-data bg-[#F4C46C]/15 border border-[#F4C46C]/45 text-[#FFE29E] hover:bg-[#F4C46C]/25 transition-colors"
              >
                <Orbit className="w-3.5 h-3.5" />
                String Theory 3D
              </Link>
              <Link
                to="/textbook"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-mono-data bg-[#11131C] border border-[rgba(244,196,108,0.22)] text-[#A8B2C6] hover:text-[#F7F4EC]"
              >
                <BookOpen className="w-3.5 h-3.5 text-[#F4C46C]" />
                Florida B.E.S.T. Book
              </Link>
            </div>
          </div>

          {/* Course / Category Filter Strip */}
          <div className="flex flex-wrap items-center gap-1.5">
            {CATEGORY_FILTERS.map((cat) => {
              const active = categoryFilter === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    setCategoryFilter(cat.id);
                    if (cat.id !== 'all' && activeMeta.category !== cat.id) {
                      const first = LAB_ITEMS.find((l) => l.category === cat.id);
                      if (first) selectLab(first.id);
                    }
                  }}
                  className="px-3 py-1 rounded-full text-[11px] font-mono-data border transition-all"
                  style={{
                    borderColor: active ? cat.accent : 'rgba(244,196,108,0.16)',
                    backgroundColor: active ? `${cat.accent}22` : '#0B0C12',
                    color: active ? cat.accent : '#A8B2C6',
                  }}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          {/* Interactive Lab Tabs */}
          <div className="flex flex-wrap gap-2" role="tablist" aria-label="Observatory laboratories">
            {visibleTabs.map((item) => {
              const Icon = item.icon;
              const isSelected = activeLab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  onClick={() => selectLab(item.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                    isSelected
                      ? 'text-[#060609] font-semibold'
                      : 'border-[rgba(244,196,108,0.16)] text-[#A8B2C6] hover:text-[#F7F4EC] bg-[#0B0C12]'
                  }`}
                  style={
                    isSelected
                      ? {
                          backgroundColor: item.accent,
                          borderColor: item.accent,
                          boxShadow: `0 0 18px -4px ${item.accent}`,
                        }
                      : undefined
                  }
                >
                  <Icon className="w-3.5 h-3.5" />
                  {item.label}
                </button>
              );
            })}
          </div>
        </header>

        {/* Active AUREA Gold HUD Telemetry Banner */}
        <div
          className="instrument-frame p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4"
          style={{ borderLeft: `3px solid ${activeMeta.accent}` }}
        >
          <div className="space-y-1 max-w-3xl">
            <span
              className="font-mono-data text-[10px] uppercase tracking-[0.2em] block"
              style={{ color: activeMeta.accent }}
            >
              {activeMeta.tag}
            </span>
            <h2 className="font-serif-editorial text-2xl text-[#F7F4EC]">{activeMeta.label}</h2>
            <p className="text-xs sm:text-sm text-[#A8B2C6]">{activeMeta.description}</p>
          </div>
          <Link
            to={activeMeta.companionRoute}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-mono-data border transition-all shrink-0"
            style={{
              borderColor: `${activeMeta.accent}66`,
              backgroundColor: `${activeMeta.accent}18`,
              color: activeMeta.accent,
            }}
          >
            {activeMeta.companionLabel}
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Active Laboratory Stage (Only active lab mounts, keeping WebGL contexts lean & safe) */}
        <div className="min-w-0">
          {activeLab === 'orbital-torus' && <OrbitalSignalTorus3D />}
          {activeLab === 'calabi-yau' && <CalabiYauManifold3D />}
          {activeLab === 'tensor-riemann' && (
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
          {activeLab === 'vector-flow-3d' && (
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
          {activeLab === 'lorenz-chaos-3d' && (
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
          {activeLab === 'matrix-transform-3d' && (
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
          {activeLab === 'surface-revolution-3d' && (
            <Suspense
              fallback={
                <div className="instrument-frame h-[430px] flex items-center justify-center font-mono-data text-xs text-[#A8B2C6]">
                  Initializing 360° Solid of Revolution…
                </div>
              }
            >
              <LazySurfaceRevolution3D />
            </Suspense>
          )}
          {activeLab === 'fourier-epicycles' && <FourierEpicyclesEngine />}
          {activeLab === 'formula-morph' && <FormulaMorphEngine />}
          {activeLab === 'pythagoras-fluid' && <PythagorasFluidProof />}
          {activeLab === 'apollonius-cone' && <ApolloniusCone3D />}
          {activeLab === 'harmonic-spine' && <GoldenHarmonicSpine />}
          {activeLab === 'solids' && <SolidNetLab />}
          {activeLab === 'neural' && <NeuralMathEngine />}
          {activeLab === 'vortex' && <MathVortexCanvas />}
          {activeLab === 'quadratic' && <QuadraticWorkbench />}
          {activeLab === 'algebraic-pipeline' && <AlgebraicPipelineEngine />}
          {activeLab === 'confidence-ribbon' && <ConfidenceRibbonField />}
          {activeLab === 'polar-harmonic' && <PolarHarmonicRingEngine />}

          {activeLab === 'linear-exp' && (
            <div className="space-y-5">
              <TopicVisualCanvas topicId="a1-expressions" />
              <TopicVisualCanvas topicId="a1-linear" />
              <TopicVisualCanvas topicId="a1-exponential" />
            </div>
          )}
          {activeLab === 'abs-radicals' && (
            <div className="space-y-5">
              <TopicVisualCanvas topicId="a1-abs-piecewise" />
              <TopicVisualCanvas topicId="a1-radicals-exp" />
            </div>
          )}
          {activeLab === 'inequalities' && (
            <div className="space-y-5">
              <TopicVisualCanvas topicId="a1-inequalities" />
              <TopicVisualCanvas topicId="a1-systems" />
            </div>
          )}
          {activeLab === 'regression' && <TopicVisualCanvas topicId="a1-statistics" />}

          {activeLab === 'angles-triangles' && (
            <div className="space-y-5">
              <TopicVisualCanvas topicId="g-parallel-angles" />
              <TopicVisualCanvas topicId="g-triangles" />
              <TopicVisualCanvas topicId="g-similarity" />
              <TopicVisualCanvas topicId="g-quadrilaterals" />
            </div>
          )}
          {activeLab === 'pythagoras' && (
            <div className="space-y-5">
              <TopicVisualCanvas topicId="g-right-trig" />
              <TopicVisualCanvas topicId="g-transformations" />
            </div>
          )}
          {activeLab === 'circles-coord' && (
            <div className="space-y-5">
              <TopicVisualCanvas topicId="g-circles" />
              <TopicVisualCanvas topicId="g-coordinate" />
            </div>
          )}

          {activeLab === 'logs' && <LogarithmLab />}
          {activeLab === 'nonlinear-inv' && (
            <div className="space-y-5">
              <TopicVisualCanvas topicId="a2-quad-systems" />
              <TopicVisualCanvas topicId="a2-radicals" />
            </div>
          )}
          {activeLab === 'pascal-prob' && (
            <div className="space-y-5">
              <TopicVisualCanvas topicId="a2-combinatorics" />
              <TopicVisualCanvas topicId="a2-probability" />
            </div>
          )}
          {activeLab === 'polynomials-rat' && (
            <div className="space-y-5">
              <TopicVisualCanvas topicId="a2-polynomials" />
              <TopicVisualCanvas topicId="a2-complex" />
              <TopicVisualCanvas topicId="a2-rational" />
            </div>
          )}

          {activeLab === 'trig-vectors' && (
            <div className="space-y-5">
              <UnitCircleWaveCanvas />
              <TopicVisualCanvas topicId="pc-trig-identities" />
              <TopicVisualCanvas topicId="pc-law-sines" />
              <VectorParallelogramCanvas />
              <TopicVisualCanvas topicId="pc-vectors" />
            </div>
          )}
          {activeLab === 'parametric-polar' && (
            <div className="space-y-5">
              <TopicVisualCanvas topicId="pc-parametric" />
              <TopicVisualCanvas topicId="pc-polar" />
              <TopicVisualCanvas topicId="pc-conics" />
            </div>
          )}
          {activeLab === 'limits-series' && (
            <div className="space-y-5">
              <TopicVisualCanvas topicId="pc-limits" />
              <TopicVisualCanvas topicId="pc-series" />
            </div>
          )}
        </div>
      </div>
    </AtlasShell>
  );
}
