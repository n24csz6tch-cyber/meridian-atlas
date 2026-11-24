import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Pause, Play, Sparkles, Zap } from 'lucide-react';
import { MathTex } from '../../components/MathTex';
import { CURRICULUM_NODES } from '../../data/curriculumGraph';
import { useReducedMotion } from '../../hooks/useReducedMotion';

export type HarmonicStrand = 'all' | 'algebra' | 'geometry' | 'precalculus' | 'string';

export interface GoldenHarmonicSpineProps {
  compact?: boolean;
  heightClass?: string;
}

interface HarmonicChannel {
  id: string;
  index: number;
  strand: Exclude<HarmonicStrand, 'all'>;
  courseTag: string;
  accent: string;
  leftLabel: string;
  rightLabel: string;
  title: string;
  summary: string;
  prereqLabel: string;
  targetLabel: string;
  formulaTex: string;
  lessonRoute: string;
  coupledRightIndices: number[];
  resonanceWeights: number[];
}

const ROUTE_BY_NODE_ID = new Map(CURRICULUM_NODES.map((n) => [n.id, n.route]));

const resolveRoute = (nodeId: string, fallback = '/map') =>
  ROUTE_BY_NODE_ID.get(nodeId) ?? fallback;

const STRAND_TABS: { id: HarmonicStrand; label: string; accent: string }[] = [
  { id: 'all', label: 'ALL HARMONICS', accent: '#F4C46C' },
  { id: 'algebra', label: 'ALGEBRA', accent: '#F5C25B' },
  { id: 'geometry', label: 'GEOMETRY', accent: '#46D6E8' },
  { id: 'precalculus', label: 'PRECALCULUS', accent: '#FF8563' },
  { id: 'string', label: 'STRING THEORY', accent: '#FFE29E' },
];

const HARMONIC_CHANNELS: HarmonicChannel[] = [
  {
    id: 'h-01',
    index: 0,
    strand: 'algebra',
    courseTag: 'ALGEBRA 1 · A1-01',
    accent: '#F5C25B',
    leftLabel: 'Area Factor (x+p)',
    rightLabel: 'Quadratic Roots Δ',
    title: 'Algebraic Structure to Roots',
    summary: 'Rectangular tile factorization reveals where a parabola crosses the x-axis.',
    prereqLabel: '(x + p)(x + q) Expansion',
    targetLabel: 'Discriminant Δ = b² − 4ac',
    formulaTex: '(x+p)(x+q) = x^2 + (p+q)x + pq',
    lessonRoute: resolveRoute('a1-expressions'),
    coupledRightIndices: [0, 3, 6],
    resonanceWeights: [0.96, 0.72, 0.54, 0.88, 0.41, 0.35],
  },
  {
    id: 'h-02',
    index: 1,
    strand: 'algebra',
    courseTag: 'ALGEBRA 1 · A1-02',
    accent: '#F5C25B',
    leftLabel: 'Linear Rate Δy/Δx',
    rightLabel: 'Least-Squares Fit',
    title: 'Constant Slope to Data Regression',
    summary: 'Steepness Δy/Δx scales into best-fit linear trend lines minimizing squared residuals.',
    prereqLabel: 'Secant Slope Triangle',
    targetLabel: 'Correlation r & Residuals',
    formulaTex: 'm = \\dfrac{\\Delta y}{\\Delta x}, \\quad \\hat{y} = ax + b',
    lessonRoute: resolveRoute('a1-linear'),
    coupledRightIndices: [1, 2, 19],
    resonanceWeights: [0.68, 0.95, 0.81, 0.47, 0.39, 0.62],
  },
  {
    id: 'h-03',
    index: 2,
    strand: 'algebra',
    courseTag: 'ALGEBRA 1 · A1-04',
    accent: '#F5C25B',
    leftLabel: 'Systems L₁ ∩ L₂',
    rightLabel: 'Neural Matrix W·a',
    title: 'Simultaneous Systems to Neural Nets',
    summary: 'Intersecting linear equations generalize directly into multi-layer matrix transforms.',
    prereqLabel: '2-Line Intersection (x*, y*)',
    targetLabel: 'Matrix Layer σ(Wx + b)',
    formulaTex: '\\mathbf{a}^{(l)} = \\sigma(\\mathbf{W}^{(l)}\\mathbf{a}^{(l-1)} + \\mathbf{b}^{(l)})',
    lessonRoute: resolveRoute('a2-matrices', '/neural'),
    coupledRightIndices: [2, 15, 20],
    resonanceWeights: [0.58, 0.84, 0.98, 0.61, 0.75, 0.89],
  },
  {
    id: 'h-04',
    index: 3,
    strand: 'algebra',
    courseTag: 'ALGEBRA 1 · A1-08',
    accent: '#F5C25B',
    leftLabel: 'Vertex Shift (h,k)',
    rightLabel: 'Conic Parabola Focus',
    title: 'Vertex Form to Focal Geometry',
    summary: 'Translating a parabola by (h, k) mirrors its focus-directrix distance invariance.',
    prereqLabel: 'Completing the Square',
    targetLabel: 'Reflective Parabolic Focus',
    formulaTex: 'f(x) = a(x - h)^2 + k',
    lessonRoute: resolveRoute('a1-quadratics'),
    coupledRightIndices: [3, 0, 18],
    resonanceWeights: [0.87, 0.52, 0.44, 0.97, 0.64, 0.78],
  },
  {
    id: 'h-05',
    index: 4,
    strand: 'algebra',
    courseTag: 'ALGEBRA 1 · A1-07',
    accent: '#F5C25B',
    leftLabel: 'Exp Growth b^x',
    rightLabel: 'Log Inverse log_b(x)',
    title: 'Multiplicative Cascades & Logs',
    summary: 'Repeated multiplication reflects across y = x to define inverse logarithmic scaling.',
    prereqLabel: 'Rational Exponents x^(m/n)',
    targetLabel: 'Logarithmic Reflection',
    formulaTex: 'y = b^x \\iff x = \\log_b(y)',
    lessonRoute: resolveRoute('a1-exponential'),
    coupledRightIndices: [4, 5, 17],
    resonanceWeights: [0.42, 0.55, 0.61, 0.96, 0.91, 0.74],
  },
  {
    id: 'h-06',
    index: 5,
    strand: 'algebra',
    courseTag: 'ALGEBRA 2 · A2-04',
    accent: '#45E6A6',
    leftLabel: 'Logarithm Base b',
    rightLabel: 'Rational Poles 1/x',
    title: 'Asymptotic Barriers & Growth Compression',
    summary: 'Logarithms compress exponential scales just as rational poles bound vertical limits.',
    prereqLabel: 'Product & Quotient Log Laws',
    targetLabel: 'Vertical & Horizontal Asymptotes',
    formulaTex: '\\log_b(MN) = \\log_b M + \\log_b N',
    lessonRoute: resolveRoute('a2-logarithms'),
    coupledRightIndices: [5, 4, 19],
    resonanceWeights: [0.51, 0.48, 0.73, 0.89, 0.94, 0.66],
  },
  {
    id: 'h-07',
    index: 6,
    strand: 'algebra',
    courseTag: 'ALGEBRA 2 · A2-01',
    accent: '#45E6A6',
    leftLabel: 'Complex i = √(-1)',
    rightLabel: 'Argand Rotation z·e^iθ',
    title: 'Imaginary Axis to 2D Spin',
    summary: 'Multiplying by i rotates vectors by 90° in the Argand plane, turning roots into circles.',
    prereqLabel: 'Quadratic Discriminant Δ < 0',
    targetLabel: 'Polar Complex Plane Spin',
    formulaTex: 'z = a + bi = r e^{i\\theta}, \\quad i^2 = -1',
    lessonRoute: resolveRoute('a2-complex'),
    coupledRightIndices: [6, 17, 21],
    resonanceWeights: [0.76, 0.69, 0.93, 0.85, 0.98, 0.81],
  },
  {
    id: 'h-08',
    index: 7,
    strand: 'geometry',
    courseTag: 'GEOMETRY · G-01',
    accent: '#46D6E8',
    leftLabel: 'Parallel Transversal',
    rightLabel: 'Triangle Congruence',
    title: 'Angle Invariants to Rigid Proofs',
    summary: 'Alternate interior angle equality locks triangle interior sums at 180°.',
    prereqLabel: 'Linear Pair & Vertical Angles',
    targetLabel: 'SAS / SSS / ASA Congruence',
    formulaTex: '\\alpha + \\beta = 180^\\circ, \\quad \\triangle ABC \\cong \\triangle A\'B\'C\'',
    lessonRoute: resolveRoute('g-parallel-angles'),
    coupledRightIndices: [7, 8, 9],
    resonanceWeights: [0.92, 0.81, 0.45, 0.62, 0.38, 0.57],
  },
  {
    id: 'h-09',
    index: 8,
    strand: 'geometry',
    courseTag: 'GEOMETRY · G-03',
    accent: '#46D6E8',
    leftLabel: 'Similarity Ratio k',
    rightLabel: 'Area & Volume k², k³',
    title: 'Homothety & Dimensional Scaling',
    summary: 'Stretching lengths by factor k scales planar area by k² and 3D solid volume by k³.',
    prereqLabel: 'AA Similarity & Side Splitters',
    targetLabel: 'Surface Area & Volume Laws',
    formulaTex: '\\frac{A\'}{A} = k^2, \\qquad \\frac{V\'}{V} = k^3',
    lessonRoute: resolveRoute('g-similarity'),
    coupledRightIndices: [8, 12, 21],
    resonanceWeights: [0.79, 0.94, 0.67, 0.58, 0.72, 0.83],
  },
  {
    id: 'h-10',
    index: 9,
    strand: 'geometry',
    courseTag: 'GEOMETRY · G-06',
    accent: '#46D6E8',
    leftLabel: 'Pythagoras a²+b²',
    rightLabel: 'Right Trig sin/cos',
    title: 'Area Squares to Trigonometric Ratios',
    summary: 'The Pythagorean identity a² + b² = c² divides through by c² to yield sin²θ + cos²θ = 1.',
    prereqLabel: 'Right Triangle Similarity',
    targetLabel: 'Acute Sine & Cosine Ratios',
    formulaTex: 'a^2 + b^2 = c^2 \\implies \\sin^2\\theta + \\cos^2\\theta = 1',
    lessonRoute: resolveRoute('g-right-trig'),
    coupledRightIndices: [9, 13, 14],
    resonanceWeights: [0.97, 0.91, 0.84, 0.77, 0.65, 0.93],
  },
  {
    id: 'h-11',
    index: 10,
    strand: 'geometry',
    courseTag: 'GEOMETRY · G-08',
    accent: '#46D6E8',
    leftLabel: 'Inscribed Arc',
    rightLabel: 'Sector Sweep ½r²θ',
    title: 'Circular Angles & Arc Length',
    summary: 'Inscribed vertex angles always measure exactly half the central intercepted arc.',
    prereqLabel: 'Chord & Tangent Geometry',
    targetLabel: 'Radian Arc s = rθ & Sector Area',
    formulaTex: '\\theta_{\\text{inscribed}} = \\tfrac{1}{2}\\theta_{\\text{central}}, \\quad A = \\tfrac{1}{2}r^2\\theta',
    lessonRoute: resolveRoute('g-circles'),
    coupledRightIndices: [10, 13, 16],
    resonanceWeights: [0.85, 0.92, 0.74, 0.68, 0.81, 0.59],
  },
  {
    id: 'h-12',
    index: 11,
    strand: 'geometry',
    courseTag: 'GEOMETRY · G-07',
    accent: '#46D6E8',
    leftLabel: 'Distance Norm √Δx²',
    rightLabel: 'Coordinate Vectors',
    title: 'Cartesian Distance to Vector Magnitude',
    summary: 'The Euclidean metric bridges flat coordinate geometry into multidimensional vector norms.',
    prereqLabel: 'Midpoint & Perpendicular Slopes',
    targetLabel: 'Vector Dot Product & Projection',
    formulaTex: 'd = \\sqrt{(x_2-x_1)^2 + (y_2-y_1)^2} = \\|\\vec{v}\\|',
    lessonRoute: resolveRoute('g-coordinate'),
    coupledRightIndices: [11, 15, 22],
    resonanceWeights: [0.74, 0.88, 0.95, 0.66, 0.79, 0.84],
  },
  {
    id: 'h-13',
    index: 12,
    strand: 'geometry',
    courseTag: 'GEOMETRY · G-09',
    accent: '#46D6E8',
    leftLabel: '3D Hinged Nets',
    rightLabel: 'Manifold Curvature',
    title: 'Polyhedral Nets to Curved Surfaces',
    summary: 'Unfolding 3D pyramids and prisms reveals how intrinsic 2D area folds into 3D space.',
    prereqLabel: '2D Polygon Nets & Slant Height',
    targetLabel: 'Cross-Sections & Topology',
    formulaTex: 'SA = B + \\tfrac{1}{2}Pl, \\qquad V = \\tfrac{1}{3}Bh',
    lessonRoute: resolveRoute('g-solids'),
    coupledRightIndices: [12, 8, 21],
    resonanceWeights: [0.69, 0.78, 0.91, 0.82, 0.88, 0.93],
  },
  {
    id: 'h-14',
    index: 13,
    strand: 'precalculus',
    courseTag: 'PRECALCULUS · PC-01',
    accent: '#FF8563',
    leftLabel: 'Unit Circle cos/sin',
    rightLabel: 'Harmonic Wave A·sin',
    title: 'Circular Projection to Periodic Waves',
    summary: 'Tracking y = sin θ as a point orbits the unit circle unfolds time-domain harmonic waves.',
    prereqLabel: 'Right Triangle Ratios & Radians',
    targetLabel: 'Phase-Shifted Sinusoids',
    formulaTex: 'P(\\theta) = (\\cos\\theta, \\sin\\theta)',
    lessonRoute: resolveRoute('pc-unit-circle'),
    coupledRightIndices: [13, 14, 20],
    resonanceWeights: [0.95, 0.98, 0.89, 0.76, 0.84, 0.92],
  },
  {
    id: 'h-15',
    index: 14,
    strand: 'precalculus',
    courseTag: 'PRECALCULUS · PC-02',
    accent: '#FF8563',
    leftLabel: 'Double Angle 2θ',
    rightLabel: 'Lissajous Resonance',
    title: 'Harmonic Identities & Wave Interference',
    summary: 'Doubling angular frequency creates interference nodes analogous to Lissajous figures.',
    prereqLabel: 'Pythagorean Identity sin²+cos²=1',
    targetLabel: 'Parametric Harmonic Coupling',
    formulaTex: '\\sin(2\\theta) = 2\\sin\\theta\\cos\\theta',
    lessonRoute: resolveRoute('pc-trig-identities'),
    coupledRightIndices: [14, 13, 20],
    resonanceWeights: [0.88, 0.96, 0.82, 0.91, 0.77, 0.85],
  },
  {
    id: 'h-16',
    index: 15,
    strand: 'precalculus',
    courseTag: 'PRECALCULUS · PC-03',
    accent: '#FF8563',
    leftLabel: 'Vector Span ⟨u,v⟩',
    rightLabel: '2×2 Det Area Warp',
    title: 'Linear Operators & Determinant Area',
    summary: '2×2 matrices warp basis vectors, with |ad − bc| measuring exact signed area scaling.',
    prereqLabel: 'Component Addition & Dot Product',
    targetLabel: 'Eigen-Space & Neural Layers',
    formulaTex: '\\det(M) = ad - bc, \\quad \\vec{u}\\cdot\\vec{v} = \\|\\vec{u}\\|\\|\\vec{v}\\|\\cos\\theta',
    lessonRoute: resolveRoute('pc-vectors'),
    coupledRightIndices: [15, 2, 11],
    resonanceWeights: [0.83, 0.79, 0.97, 0.86, 0.64, 0.91],
  },
  {
    id: 'h-17',
    index: 16,
    strand: 'precalculus',
    courseTag: 'PRECALCULUS · PC-06',
    accent: '#FF8563',
    leftLabel: 'Polar Rose r(nθ)',
    rightLabel: 'Spiral Phase Field',
    title: 'Radial Symmetry & Orbital Roses',
    summary: 'Varying integer petal frequency n in r = a cos(nθ) produces resonant standing petals.',
    prereqLabel: 'Polar Conversion (r, θ)',
    targetLabel: 'Logarithmic Spiral Attractors',
    formulaTex: 'r(\\theta) = a\\cos(n\\theta)',
    lessonRoute: resolveRoute('pc-polar'),
    coupledRightIndices: [16, 13, 22],
    resonanceWeights: [0.75, 0.89, 0.72, 0.94, 0.88, 0.81],
  },
  {
    id: 'h-18',
    index: 17,
    strand: 'precalculus',
    courseTag: 'PRECALCULUS · PC-08',
    accent: '#FF8563',
    leftLabel: 'Euler e^(iθ)',
    rightLabel: 'Fourier Series Σc_k',
    title: 'Euler Phase to Fourier Decomposition',
    summary: 'Complex exponentials e^(inθ) form the orthogonal harmonic basis for every wave and shape.',
    prereqLabel: 'Complex Plane & Unit Circle',
    targetLabel: 'Infinite Harmonic Synthesis',
    formulaTex: 'e^{i\\theta} = \\cos\\theta + i\\sin\\theta',
    lessonRoute: resolveRoute('pc-series'),
    coupledRightIndices: [17, 6, 20],
    resonanceWeights: [0.93, 0.87, 0.95, 0.91, 0.99, 0.96],
  },
  {
    id: 'h-19',
    index: 18,
    strand: 'precalculus',
    courseTag: 'PRECALCULUS · PC-07',
    accent: '#FF8563',
    leftLabel: 'Conic Focus',
    rightLabel: 'Orbital Eccentricity',
    title: 'Apollonius Conics & Kepler Orbits',
    summary: 'Plane slices through a double cone yield ellipses (e < 1), parabolas (e = 1), and hyperbolas.',
    prereqLabel: 'Distance Formula & Quadratics',
    targetLabel: '3D Conic Slicer & Gravitation',
    formulaTex: '\\dfrac{x^2}{a^2} \\pm \\dfrac{y^2}{b^2} = 1, \\quad e = \\dfrac{c}{a}',
    lessonRoute: resolveRoute('pc-conics'),
    coupledRightIndices: [18, 3, 12],
    resonanceWeights: [0.84, 0.73, 0.68, 0.92, 0.79, 0.87],
  },
  {
    id: 'h-20',
    index: 19,
    strand: 'precalculus',
    courseTag: 'PRECALCULUS · PC-09',
    accent: '#FF8563',
    leftLabel: 'Limit h → 0',
    rightLabel: 'Tangent Slope f\'(x)',
    title: 'Secant Convergence to Calculus',
    summary: 'Shrinking secant step h → 0 bridges high school algebra directly into differential calculus.',
    prereqLabel: 'Average Rate of Change',
    targetLabel: 'Instantaneous Derivative',
    formulaTex: 'f\'(x) = \\lim_{h \\to 0} \\dfrac{f(x+h) - f(x)}{h}',
    lessonRoute: resolveRoute('pc-limits'),
    coupledRightIndices: [19, 1, 23],
    resonanceWeights: [0.91, 0.86, 0.78, 0.88, 0.95, 0.97],
  },
  {
    id: 'h-21',
    index: 20,
    strand: 'string',
    courseTag: 'FRONTIER · STRING 01',
    accent: '#FFE29E',
    leftLabel: 'Standing Mode nω',
    rightLabel: 'Photon Mode n = 1',
    title: 'Vibrating Strings to Elementary Particles',
    summary: 'Just like guitar harmonics sin(nπx/L), higher string vibrational modes appear as distinct particle masses.',
    prereqLabel: 'Trigonometric Standing Waves',
    targetLabel: 'Quantized Harmonic Spectrum',
    formulaTex: 'X^\\mu(\\tau,\\sigma) = x^\\mu + \\alpha\' p^\\mu\\tau + \\sum_{n\\neq 0} \\frac{\\alpha_n^\\mu}{n} e^{-in\\tau}\\cos(n\\sigma)',
    lessonRoute: '/frontier',
    coupledRightIndices: [20, 13, 17],
    resonanceWeights: [0.96, 0.92, 0.88, 0.94, 0.99, 0.95],
  },
  {
    id: 'h-22',
    index: 21,
    strand: 'string',
    courseTag: 'FRONTIER · STRING 02',
    accent: '#FFE29E',
    leftLabel: 'Calabi-Yau z^n',
    rightLabel: '6D Compactification',
    title: 'Complex Roots Folding Extra Dimensions',
    summary: 'Equations like z₁ⁿ + z₂ⁿ = 1 curl 6 tiny dimensions so tightly they remain hidden below atomic scales.',
    prereqLabel: 'Complex nth Roots of Unity',
    targetLabel: 'Ricci-Flat 6D Internal Space',
    formulaTex: 'z_1^n + z_2^n = 1, \\qquad R_{\\mu\\nu} = 0',
    lessonRoute: '/frontier',
    coupledRightIndices: [21, 6, 12],
    resonanceWeights: [0.94, 0.89, 0.97, 0.91, 0.95, 0.98],
  },
  {
    id: 'h-23',
    index: 22,
    strand: 'string',
    courseTag: 'FRONTIER · STRING 03',
    accent: '#FFE29E',
    leftLabel: 'Hopf Fiber S³→S²',
    rightLabel: 'Linked Flux Torus',
    title: '4D Sphere Fibers Projected to 3D Rings',
    summary: 'Stereographic projection maps hypersphere circles into nested golden tori linked in 3D space.',
    prereqLabel: '4D Unit Norm & Trig Projection',
    targetLabel: 'Topological Gauge Flux',
    formulaTex: '\\pi(z_1, z_2) = \\left(2z_1\\bar{z}_2,\\; |z_1|^2 - |z_2|^2\\right)',
    lessonRoute: '/frontier',
    coupledRightIndices: [22, 10, 16],
    resonanceWeights: [0.89, 0.93, 0.91, 0.86, 0.97, 0.92],
  },
  {
    id: 'h-24',
    index: 23,
    strand: 'string',
    courseTag: 'FRONTIER · STRING 04',
    accent: '#FFE29E',
    leftLabel: 'String Tension T',
    rightLabel: 'Graviton Spin-2',
    title: 'Closed Loop Harmonics & Gravity',
    summary: 'Closed string loops vibrate without endpoints, naturally predicting a massless spin-2 graviton.',
    prereqLabel: 'Parametric Worldsheets & Limits',
    targetLabel: 'Unified Quantum Gravity Scale',
    formulaTex: 'T = \\dfrac{1}{2\\pi\\alpha\'}, \\qquad M^2 = \\dfrac{4}{\\alpha\'}(N - 1)',
    lessonRoute: '/frontier',
    coupledRightIndices: [23, 19, 20],
    resonanceWeights: [0.98, 0.95, 0.92, 0.94, 0.97, 0.99],
  },
];

interface SpinePulse {
  channelIdx: number;
  targetIdx: number;
  side: 'in' | 'out';
  t: number;
  speed: number;
  color: string;
}

interface DustMote {
  nx: number;
  ny: number;
  r: number;
  speedY: number;
  phase: number;
  alpha: number;
}

function evalCubicBezier(
  p0x: number,
  p0y: number,
  p1x: number,
  p1y: number,
  p2x: number,
  p2y: number,
  p3x: number,
  p3y: number,
  t: number
): [number, number] {
  const u = 1 - t;
  const tt = t * t;
  const uu = u * u;
  const uuu = uu * u;
  const ttt = tt * t;
  return [
    uuu * p0x + 3 * uu * t * p1x + 3 * u * tt * p2x + ttt * p3x,
    uuu * p0y + 3 * uu * t * p1y + 3 * u * tt * p2y + ttt * p3y,
  ];
}

export function GoldenHarmonicSpine({
  compact = false,
  heightClass,
}: GoldenHarmonicSpineProps) {
  const reducedMotion = useReducedMotion();
  const [strandFilter, setStrandFilter] = useState<HarmonicStrand>('all');
  const [selectedIdx, setSelectedIdx] = useState<number>(20); // Highlight String / Euler bridge or first item
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [hoveredSide, setHoveredSide] = useState<'left' | 'right' | null>(null);
  const [playing, setPlaying] = useState<boolean>(true);
  const [matrixTick, setMatrixTick] = useState<number>(0);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const sizeRef = useRef({ width: 980, height: 540, dpr: 1 });
  const visibleRef = useRef(true);
  const timeRef = useRef(0);
  const hubSurgeRef = useRef(0.6);

  const dustRef = useRef<DustMote[] | null>(null);
  if (!dustRef.current) {
    dustRef.current = Array.from({ length: 88 }, (_, i) => ({
      nx: ((i * 193.7) % 997) / 997,
      ny: ((i * 317.3) % 991) / 991,
      r: 0.7 + ((i * 17) % 10) * 0.14,
      speedY: 0.004 + ((i * 11) % 7) * 0.0018,
      phase: i * 0.63,
      alpha: 0.14 + ((i * 29) % 10) * 0.04,
    }));
  }

  const pulsesRef = useRef<SpinePulse[]>([]);
  if (pulsesRef.current.length === 0) {
    for (let i = 0; i < 24; i++) {
      pulsesRef.current.push({
        channelIdx: i,
        targetIdx: i,
        side: i % 2 === 0 ? 'in' : 'out',
        t: (i * 0.17) % 1,
        speed: 0.0085 + (i % 5) * 0.0018,
        color: HARMONIC_CHANNELS[i].accent,
      });
    }
  }

  const activeFocusIdx = hoveredIdx ?? selectedIdx;
  const activeChannel = HARMONIC_CHANNELS[activeFocusIdx] ?? HARMONIC_CHANNELS[0];

  const matchingIndices = useMemo(() => {
    const set = new Set<number>();
    HARMONIC_CHANNELS.forEach((ch, idx) => {
      if (strandFilter === 'all' || ch.strand === strandFilter) {
        set.add(idx);
      }
    });
    return set;
  }, [strandFilter]);

  const stateRef = useRef({
    strandFilter,
    selectedIdx,
    hoveredIdx,
    hoveredSide,
    activeFocusIdx,
    matchingIndices,
    playing: playing && !reducedMotion,
  });
  stateRef.current = {
    strandFilter,
    selectedIdx,
    hoveredIdx,
    hoveredSide,
    activeFocusIdx,
    matchingIndices,
    playing: playing && !reducedMotion,
  };

  // Compute exact canvas layout geometry symmetrically around center spine
  const getLayout = useCallback((width: number, height: number) => {
    const isNarrow = width < 640;
    const cx = width * 0.5;
    const cy = height * 0.5;
    const leftX = isNarrow
      ? Math.max(106, width * 0.28)
      : Math.max(178, Math.min(245, width * 0.22));
    const rightX = width - leftX;
    const railTop = isNarrow ? 54 : 62;
    const railBottom = height - (isNarrow ? 46 : 56);
    const step = (railBottom - railTop) / (HARMONIC_CHANNELS.length - 1);
    return { isNarrow, cx, cy, leftX, rightX, railTop, railBottom, step };
  }, []);

  const drawSpine = useCallback(
    (advance: boolean) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const { width, height, dpr } = sizeRef.current;
      if (width < 80 || height < 80) return;

      const {
        activeFocusIdx: focusIdx,
        selectedIdx: selIdx,
        hoveredSide: hSide,
        matchingIndices: matchSet,
      } = stateRef.current;

      if (advance) {
        timeRef.current += 0.016;
        hubSurgeRef.current = Math.max(0, hubSurgeRef.current - 0.014);
      }
      const t = timeRef.current;
      const { isNarrow, cx, cy, leftX, rightX, railTop, step } = getLayout(
        width,
        height
      );

      ctx.save();
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // 1. Deep Obsidian Background (#060609) + Warm Hourglass Golden Nebula Glow
      ctx.fillStyle = '#060609';
      ctx.fillRect(0, 0, width, height);

      const coreNebula = ctx.createRadialGradient(
        cx,
        cy,
        8,
        cx,
        cy,
        Math.max(width, height) * 0.48
      );
      coreNebula.addColorStop(0, 'rgba(244, 196, 108, 0.14)');
      coreNebula.addColorStop(0.35, 'rgba(184, 137, 56, 0.055)');
      coreNebula.addColorStop(0.75, 'rgba(18, 16, 22, 0.02)');
      coreNebula.addColorStop(1, 'transparent');
      ctx.fillStyle = coreNebula;
      ctx.fillRect(0, 0, width, height);

      // Subtle drifting cosmic gold dust motes
      const dust = dustRef.current!;
      for (const m of dust) {
        const yPos = ((m.ny - t * m.speedY) % 1 + 1) % 1;
        const dx = m.nx * width;
        const dy = yPos * height;
        // Concentrate glow gently inside the spindle silhouette
        const distNorm = Math.abs(dx - cx) / (width * 0.5);
        const spindleWeight = Math.max(0.15, 1 - distNorm * 0.85);
        const pulse = 0.65 + 0.35 * Math.sin(t * 1.4 + m.phase);
        ctx.fillStyle = `rgba(255, 226, 158, ${(m.alpha * spindleWeight * pulse).toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(dx, dy, m.r, 0, Math.PI * 2);
        ctx.fill();
      }

      // 2. Central Vertical Harmonic Rung Spine (~32 fine horizontal gold notches)
      const spineTop = 14;
      const spineBottom = height - 14;
      const spineGrad = ctx.createLinearGradient(cx, spineTop, cx, spineBottom);
      spineGrad.addColorStop(0, 'rgba(244, 196, 108, 0)');
      spineGrad.addColorStop(0.15, 'rgba(244, 196, 108, 0.35)');
      spineGrad.addColorStop(0.5, 'rgba(255, 226, 158, 0.82)');
      spineGrad.addColorStop(0.85, 'rgba(244, 196, 108, 0.35)');
      spineGrad.addColorStop(1, 'rgba(244, 196, 108, 0)');

      ctx.strokeStyle = spineGrad;
      ctx.lineWidth = 1.25;
      ctx.beginPath();
      ctx.moveTo(cx, spineTop);
      ctx.lineTo(cx, spineBottom);
      ctx.stroke();

      const RUNG_COUNT = 32;
      for (let r = 0; r < RUNG_COUNT; r++) {
        const frac = r / (RUNG_COUNT - 1);
        const ry = spineTop + frac * (spineBottom - spineTop);
        // Smooth cosine fade at top and bottom vignette
        const edgeFade = Math.sin(frac * Math.PI);
        const distFromHub = Math.abs(ry - cy) / (height * 0.5);
        const rungWidth = (isNarrow ? 12 : 18) + (1 - Math.min(1, distFromHub)) * (isNarrow ? 8 : 16);
        const rungAlpha = 0.14 + 0.52 * edgeFade;

        ctx.strokeStyle = `rgba(244, 196, 108, ${(rungAlpha * 0.65).toFixed(3)})`;
        ctx.lineWidth = 0.9;
        ctx.beginPath();
        ctx.moveTo(cx - rungWidth, ry);
        ctx.lineTo(cx + rungWidth, ry);
        ctx.stroke();

        // Crisp luminous rung node at axis crossing
        ctx.fillStyle = `rgba(255, 226, 158, ${(rungAlpha * 0.95).toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(cx, ry, 1.7 + (1 - Math.min(1, distFromHub)) * 1.1, 0, Math.PI * 2);
        ctx.fill();
      }

      // Helper for incoming and outgoing Bezier control points matching f_10.jpg silhouette
      const getInBezier = (idx: number) => {
        const y0 = railTop + idx * step;
        const cp1x = leftX + (cx - leftX) * 0.44;
        const cp1y = y0 - (y0 - cy) * 0.28;
        const cp2x = leftX + (cx - leftX) * 0.76;
        const cp2y = cy + (y0 - cy) * 0.05;
        return { p0x: leftX, p0y: y0, p1x: cp1x, p1y: cp1y, p2x: cp2x, p2y: cp2y, p3x: cx, p3y: cy };
      };

      const getOutBezier = (idx: number) => {
        const y1 = railTop + idx * step;
        const cp1x = cx + (rightX - cx) * 0.24;
        const cp1y = cy + (y1 - cy) * 0.05;
        const cp2x = cx + (rightX - cx) * 0.56;
        const cp2y = y1 - (y1 - cy) * 0.28;
        return { p0x: cx, p0y: cy, p1x: cp1x, p1y: cp1y, p2x: cp2x, p2y: cp2y, p3x: rightX, p3y: y1 };
      };

      const focusChannel = HARMONIC_CHANNELS[focusIdx];
      const coupledSet = new Set(focusChannel.coupledRightIndices);

      // 3. Draw Sinusoidal Cubic Bezier Filaments (Additive Glow Pass)
      ctx.globalCompositeOperation = 'lighter';

      for (let i = 0; i < HARMONIC_CHANNELS.length; i++) {
        const ch = HARMONIC_CHANNELS[i];
        const inMatched = matchSet.has(i);
        const isPrimaryFocus = i === focusIdx;
        const isCoupledRight = coupledSet.has(i);

        // Left incoming filament
        const bIn = getInBezier(i);
        if (isPrimaryFocus) {
          ctx.strokeStyle = `${ch.accent}44`;
          ctx.lineWidth = 4.6;
          ctx.beginPath();
          ctx.moveTo(bIn.p0x, bIn.p0y);
          ctx.bezierCurveTo(bIn.p1x, bIn.p1y, bIn.p2x, bIn.p2y, bIn.p3x, bIn.p3y);
          ctx.stroke();

          ctx.strokeStyle = '#FFE29E';
          ctx.lineWidth = 1.9;
        } else {
          ctx.strokeStyle = inMatched
            ? 'rgba(244, 196, 108, 0.28)'
            : 'rgba(184, 137, 56, 0.07)';
          ctx.lineWidth = inMatched ? 1.05 : 0.7;
        }
        ctx.beginPath();
        ctx.moveTo(bIn.p0x, bIn.p0y);
        ctx.bezierCurveTo(bIn.p1x, bIn.p1y, bIn.p2x, bIn.p2y, bIn.p3x, bIn.p3y);
        ctx.stroke();

        // Right outgoing filament
        const bOut = getOutBezier(i);
        const rightActive = isPrimaryFocus || isCoupledRight;
        if (rightActive) {
          ctx.strokeStyle = isPrimaryFocus ? `${ch.accent}4A` : 'rgba(244, 196, 108, 0.24)';
          ctx.lineWidth = isPrimaryFocus ? 4.6 : 2.8;
          ctx.beginPath();
          ctx.moveTo(bOut.p0x, bOut.p0y);
          ctx.bezierCurveTo(bOut.p1x, bOut.p1y, bOut.p2x, bOut.p2y, bOut.p3x, bOut.p3y);
          ctx.stroke();

          ctx.strokeStyle = isPrimaryFocus ? '#FFE29E' : focusChannel.accent;
          ctx.lineWidth = isPrimaryFocus ? 1.9 : 1.35;
        } else {
          ctx.strokeStyle = inMatched
            ? 'rgba(244, 196, 108, 0.28)'
            : 'rgba(184, 137, 56, 0.07)';
          ctx.lineWidth = inMatched ? 1.05 : 0.7;
        }
        ctx.beginPath();
        ctx.moveTo(bOut.p0x, bOut.p0y);
        ctx.bezierCurveTo(bOut.p1x, bOut.p1y, bOut.p2x, bOut.p2y, bOut.p3x, bOut.p3y);
        ctx.stroke();
      }

      // 4. Traveling Golden Light Packets Along Filaments
      const pulses = pulsesRef.current;
      for (let pIdx = 0; pIdx < pulses.length; pIdx++) {
        const pulse = pulses[pIdx];
        if (advance) {
          const boost = pulse.channelIdx === focusIdx ? 1.65 : 1;
          pulse.t += pulse.speed * boost;
          if (pulse.t >= 1) {
            pulse.t = 0;
            if (pulse.side === 'in') {
              pulse.side = 'out';
              const ch = HARMONIC_CHANNELS[pulse.channelIdx];
              const coupled = ch.coupledRightIndices;
              pulse.targetIdx =
                pulse.channelIdx === focusIdx && coupled.length > 0
                  ? coupled[pIdx % coupled.length]
                  : pulse.channelIdx;
            } else {
              pulse.side = 'in';
              pulse.targetIdx = pulse.channelIdx;
            }
          }
        }

        const isFocusPulse =
          pulse.channelIdx === focusIdx ||
          (pulse.side === 'out' && coupledSet.has(pulse.targetIdx) && pulse.channelIdx === focusIdx);
        if (!matchSet.has(pulse.channelIdx) && !isFocusPulse) continue;

        const curve =
          pulse.side === 'in'
            ? getInBezier(pulse.channelIdx)
            : getOutBezier(pulse.targetIdx);
        const [px, py] = evalCubicBezier(
          curve.p0x,
          curve.p0y,
          curve.p1x,
          curve.p1y,
          curve.p2x,
          curve.p2y,
          curve.p3x,
          curve.p3y,
          pulse.t
        );

        const radius = isFocusPulse ? 6.5 : 3.8;
        const grad = ctx.createRadialGradient(px, py, 0.4, px, py, radius);
        grad.addColorStop(0, '#FFFFFF');
        grad.addColorStop(0.35, isFocusPulse ? '#FFE29E' : '#F4C46C');
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(px, py, radius, 0, Math.PI * 2);
        ctx.fill();
      }

      // 5. Pulsing Solar Champagne Singularity Hub at Exact Center (cx, cy)
      const breathe = 0.5 + 0.5 * Math.sin(t * 2.6);
      const hubRadius = (isNarrow ? 9 : 11.5) + breathe * 2 + hubSurgeRef.current * 4;
      const hubBloom = ctx.createRadialGradient(cx, cy, 1, cx, cy, hubRadius * 4.4);
      hubBloom.addColorStop(0, '#FFFFFF');
      hubBloom.addColorStop(0.18, 'rgba(255, 226, 158, 0.96)');
      hubBloom.addColorStop(0.42, 'rgba(244, 196, 108, 0.48)');
      hubBloom.addColorStop(0.75, 'rgba(184, 137, 56, 0.14)');
      hubBloom.addColorStop(1, 'transparent');
      ctx.fillStyle = hubBloom;
      ctx.beginPath();
      ctx.arc(cx, cy, hubRadius * 4.4, 0, Math.PI * 2);
      ctx.fill();

      // Orbiting fine gold singularity rings
      ctx.strokeStyle = 'rgba(255, 226, 158, 0.55)';
      ctx.lineWidth = 1.15;
      ctx.beginPath();
      ctx.arc(cx, cy, hubRadius * 1.45, t * 0.9, t * 0.9 + Math.PI * 1.35);
      ctx.stroke();

      ctx.strokeStyle = 'rgba(244, 196, 108, 0.35)';
      ctx.beginPath();
      ctx.arc(cx, cy, hubRadius * 2.05, -t * 0.65, -t * 0.65 + Math.PI * 1.15);
      ctx.stroke();

      // Crisp bright inner core
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = '#FFE29E';
      ctx.beginPath();
      ctx.arc(cx, cy, isNarrow ? 5.2 : 6.4, 0, Math.PI * 2);
      ctx.fill();

      // 6. Left & Right Rail Terminals + Crisp Monospace Labels
      const fontSize = isNarrow ? 8.5 : width < 900 ? 9.5 : 10.5;
      ctx.font = `500 ${fontSize}px "JetBrains Mono", monospace`;
      ctx.textBaseline = 'middle';

      for (let i = 0; i < HARMONIC_CHANNELS.length; i++) {
        const ch = HARMONIC_CHANNELS[i];
        const y = railTop + i * step;
        const inMatched = matchSet.has(i);
        const isFocus = i === focusIdx;
        const isSelected = i === selIdx;
        const isCoupledRight = coupledSet.has(i);

        // Left terminal dot
        const leftAlpha = isFocus || isSelected ? 1 : inMatched ? 0.85 : 0.25;
        ctx.fillStyle = isFocus ? '#FFE29E' : inMatched ? ch.accent : '#B88938';
        ctx.globalAlpha = leftAlpha;
        ctx.beginPath();
        ctx.arc(leftX, y, isFocus ? 3.5 : 2.1, 0, Math.PI * 2);
        ctx.fill();

        if (isFocus || isSelected) {
          ctx.strokeStyle = hSide === 'left' && isFocus ? '#FFFFFF' : '#FFE29E';
          ctx.lineWidth = hSide === 'left' && isFocus ? 1.5 : 1.1;
          ctx.beginPath();
          ctx.arc(leftX, y, hSide === 'left' && isFocus ? 7.2 : 6.2, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Left label
        ctx.textAlign = 'right';
        ctx.fillStyle = isFocus ? '#F7F4EC' : inMatched ? '#D7CFBC' : '#6A655A';
        const leftText =
          isNarrow && ch.leftLabel.length > 15 ? `${ch.leftLabel.slice(0, 14)}…` : ch.leftLabel;
        ctx.fillText(leftText, leftX - 9, y);

        // Right terminal dot
        const rightHighlight = isFocus || isSelected || isCoupledRight;
        ctx.globalAlpha = rightHighlight ? 1 : inMatched ? 0.85 : 0.25;
        ctx.fillStyle = rightHighlight ? '#FFE29E' : inMatched ? ch.accent : '#B88938';
        ctx.beginPath();
        ctx.arc(rightX, y, rightHighlight ? 3.5 : 2.1, 0, Math.PI * 2);
        ctx.fill();

        if (rightHighlight) {
          ctx.strokeStyle = hSide === 'right' && isFocus ? '#FFFFFF' : isFocus ? '#FFE29E' : focusChannel.accent;
          ctx.lineWidth = hSide === 'right' && isFocus ? 1.5 : 1.1;
          ctx.beginPath();
          ctx.arc(rightX, y, hSide === 'right' && isFocus ? 7.2 : 6.2, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Right label
        ctx.textAlign = 'left';
        ctx.fillStyle = rightHighlight ? '#F7F4EC' : inMatched ? '#D7CFBC' : '#6A655A';
        const rightText =
          isNarrow && ch.rightLabel.length > 15 ? `${ch.rightLabel.slice(0, 14)}…` : ch.rightLabel;
        ctx.fillText(rightText, rightX + 9, y);
      }

      ctx.globalAlpha = 1;
      ctx.restore();
    },
    [getLayout]
  );

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const updateSize = () => {
      const rect = container.getBoundingClientRect();
      const width = Math.max(280, Math.floor(rect.width));
      const height = Math.max(320, Math.floor(rect.height));
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      sizeRef.current = { width, height, dpr };
      drawSpine(false);
    };

    updateSize();
    const ro = new ResizeObserver(updateSize);
    ro.observe(container);

    const io = new IntersectionObserver(
      (entries) => {
        visibleRef.current = entries.some((e) => e.isIntersecting);
      },
      { rootMargin: '120px', threshold: 0.02 }
    );
    io.observe(container);

    return () => {
      ro.disconnect();
      io.disconnect();
    };
  }, [drawSpine]);

  useEffect(() => {
    drawSpine(false);
  }, [strandFilter, selectedIdx, hoveredIdx, drawSpine]);

  useEffect(() => {
    let rafId = 0;
    const tick = () => {
      if (visibleRef.current && !document.hidden && stateRef.current.playing) {
        drawSpine(true);
      }
      rafId = window.requestAnimationFrame(tick);
    };
    rafId = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(rafId);
  }, [drawSpine]);

  useEffect(() => {
    if (compact || !playing || reducedMotion) return;
    const id = window.setInterval(() => {
      if (visibleRef.current && !document.hidden) {
        setMatrixTick((t) => (t + 1) % 1000);
      }
    }, 420);
    return () => window.clearInterval(id);
  }, [compact, playing, reducedMotion]);

  const hitTestChannel = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const mx = clientX - rect.left;
    const my = clientY - rect.top;
    const { width, height } = sizeRef.current;
    const { leftX, rightX, railTop, step } = getLayout(width, height);

    const nearLeft = mx <= leftX + 24;
    const nearRight = mx >= rightX - 24;
    if (!nearLeft && !nearRight) return null;

    let bestIdx: number | null = null;
    let bestDy = Math.max(12, step * 0.52);
    for (let i = 0; i < HARMONIC_CHANNELS.length; i++) {
      const y = railTop + i * step;
      const dy = Math.abs(my - y);
      if (dy < bestDy) {
        bestDy = dy;
        bestIdx = i;
      }
    }
    if (bestIdx === null) return null;
    return { index: bestIdx, side: nearLeft ? ('left' as const) : ('right' as const) };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const hit = hitTestChannel(e.clientX, e.clientY);
    if (hit) {
      setHoveredIdx(hit.index);
      setHoveredSide(hit.side);
    } else {
      setHoveredIdx(null);
      setHoveredSide(null);
    }
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const hit = hitTestChannel(e.clientX, e.clientY);
    if (!hit) return;
    setSelectedIdx(hit.index);
    hubSurgeRef.current = 1.0;
    // Inject a synchronous bright burst along the clicked channel
    pulsesRef.current.push({
      channelIdx: hit.index,
      targetIdx: hit.index,
      side: hit.side === 'left' ? 'in' : 'out',
      t: 0.02,
      speed: 0.018,
      color: HARMONIC_CHANNELS[hit.index].accent,
    });
    if (pulsesRef.current.length > 34) pulsesRef.current.shift();
  };

  const handleStrandSelect = (strand: HarmonicStrand) => {
    setStrandFilter(strand);
    if (strand !== 'all') {
      const firstMatch = HARMONIC_CHANNELS.findIndex((c) => c.strand === strand);
      if (firstMatch >= 0) setSelectedIdx(firstMatch);
    }
    hubSurgeRef.current = 0.85;
  };

  const resolvedHeight =
    heightClass ?? (compact ? 'h-[400px] sm:h-[440px]' : 'h-[490px] sm:h-[560px]');

  const activeCount = matchingIndices.size;
  const activeFilamentCount = activeCount * 2;

  return (
    <div
      className="relative rounded-2xl overflow-hidden bg-[#060609] border text-[#F7F4EC]"
      style={{
        borderColor: 'rgba(244, 196, 108, 0.17)',
        boxShadow: 'inset 0 1px 0 rgba(255, 232, 178, 0.14), 0 28px 60px -28px rgba(0,0,0,0.95)',
      }}
    >
      {/* Top Sleek HUD Bar */}
      <div
        className="px-4 py-2.5 bg-[#0B0C12]/95 border-b flex flex-wrap items-center justify-between gap-2.5"
        style={{ borderColor: 'rgba(244, 196, 108, 0.17)' }}
      >
        <div className="flex flex-wrap items-center gap-1.5">
          {STRAND_TABS.map((tab) => {
            const active = strandFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleStrandSelect(tab.id)}
                className="px-2.5 py-1 rounded-full text-[10.5px] font-mono-data tracking-wider border transition-all flex items-center gap-1.5"
                style={{
                  borderColor: active ? tab.accent : 'rgba(244, 196, 108, 0.17)',
                  backgroundColor: active ? `${tab.accent}22` : 'rgba(17, 19, 28, 0.7)',
                  color: active ? tab.accent : '#A8B2C6',
                }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{
                    backgroundColor: tab.accent,
                    boxShadow: active ? `0 0 8px ${tab.accent}` : 'none',
                  }}
                />
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#11131C] border border-[rgba(244,196,108,0.17)] font-mono-data text-[10px] text-[#FFE29E]">
            <Zap className="w-3 h-3 text-[#F4C46C]" />
            {activeCount} CHANNELS · {activeFilamentCount} FILAMENTS
          </span>
          <button
            type="button"
            onClick={() => setPlaying((p) => !p)}
            aria-label={playing ? 'Pause harmonic spine' : 'Resume harmonic spine'}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10.5px] font-mono-data bg-[#11131C] border border-[rgba(244,196,108,0.22)] text-[#F7F4EC] hover:border-[#F4C46C]"
          >
            {playing ? <Pause className="w-3 h-3 text-[#F4C46C]" /> : <Play className="w-3 h-3 text-[#F4C46C]" />}
            <span>{playing ? 'LIVE' : 'PAUSED'}</span>
          </button>
        </div>
      </div>

      {/* Central Golden Harmonic Spine 60fps Canvas */}
      <div ref={containerRef} className={`relative w-full ${resolvedHeight} bg-[#060609]`}>
        <canvas
          ref={canvasRef}
          onPointerMove={handlePointerMove}
          onPointerLeave={() => {
            setHoveredIdx(null);
            setHoveredSide(null);
          }}
          onPointerDown={handlePointerDown}
          className={`block w-full h-full touch-none ${hoveredIdx !== null ? 'cursor-pointer' : 'cursor-crosshair'}`}
        />

        {/* Sleek Floating HUD Callout Cards (Zero Watermarks) */}
        {!compact && (
          <>
            <div
              className="pointer-events-none hidden md:block absolute top-4 left-4 rounded-lg px-3 py-2 bg-[#0B0C12]/85 backdrop-blur-md border"
              style={{ borderColor: 'rgba(244, 196, 108, 0.22)' }}
            >
              <div className="font-mono-data text-[9px] uppercase tracking-[0.18em] text-[#F4C46C]">
                INPUTS
              </div>
              <div className="font-mono-data text-[10px] text-[#A8B2C6]">
                {activeCount} Core Foundations · Hover or click
              </div>
            </div>

            <div
              className="pointer-events-none hidden md:block absolute top-4 right-4 rounded-lg px-3 py-2 bg-[#0B0C12]/85 backdrop-blur-md border text-right"
              style={{ borderColor: 'rgba(244, 196, 108, 0.22)' }}
            >
              <div className="font-mono-data text-[9px] uppercase tracking-[0.18em] text-[#FFE29E]">
                SYNTHESIS
              </div>
              <div className="font-mono-data text-[10px] text-[#A8B2C6]">
                {activeCount} Theorems &amp; Frontiers
              </div>
            </div>
          </>
        )}

        {/* Centered Lower Spine Focal Callout Pill */}
        <div
          className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 max-w-[90%] rounded-md px-3.5 py-1.5 bg-[#0B0C12]/90 backdrop-blur-md border flex items-center gap-2 whitespace-nowrap"
          style={{
            borderColor: 'rgba(244, 196, 108, 0.34)',
            boxShadow: '0 0 24px -8px rgba(244, 196, 108, 0.45)',
          }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full shrink-0"
            style={{
              backgroundColor: activeChannel.accent,
              boxShadow: `0 0 8px ${activeChannel.accent}`,
            }}
          />
          <span className="font-mono-data text-[10px] sm:text-[11px] text-[#FFE29E] truncate">
            {activeChannel.leftLabel}
          </span>
          <span className="font-mono-data text-[10px] text-[#B88938]">⇄</span>
          <span className="font-mono-data text-[10px] sm:text-[11px] text-[#F7F4EC] truncate">
            {activeChannel.rightLabel}
          </span>
        </div>
      </div>

      {/* 4-Column Bottom HUD Telemetry Deck */}
      {!compact && (
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x bg-[#0B0C12]/95 border-t"
          style={{
            borderColor: 'rgba(244, 196, 108, 0.17)',
          }}
        >
          {/* 01 ACTIVE NODE */}
          <div className="p-4 space-y-2.5 border-[rgba(244,196,108,0.12)]">
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono-data text-[10px] uppercase tracking-[0.18em] text-[#F4C46C]">
                01 ACTIVE NODE
              </span>
              <span
                className="font-mono-data text-[9.5px] px-2 py-0.5 rounded-full border"
                style={{
                  color: activeChannel.accent,
                  borderColor: `${activeChannel.accent}55`,
                  backgroundColor: `${activeChannel.accent}15`,
                }}
              >
                {activeChannel.courseTag}
              </span>
            </div>
            <h3 className="font-serif-editorial text-lg text-[#F7F4EC] leading-snug">
              {activeChannel.title}
            </h3>
            <p className="text-xs text-[#A8B2C6] leading-relaxed">{activeChannel.summary}</p>
            <Link
              to={activeChannel.lessonRoute}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-mono-data font-semibold text-[#060609] transition-all hover:brightness-110"
              style={{
                backgroundColor: activeChannel.accent,
                boxShadow: `0 0 18px -6px ${activeChannel.accent}`,
              }}
            >
              <Sparkles className="w-3 h-3" />
              Open Lesson
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {/* 02 HARMONIC PATHWAY */}
          <div className="p-4 space-y-2.5 border-[rgba(244,196,108,0.12)]">
            <span className="font-mono-data text-[10px] uppercase tracking-[0.18em] text-[#F4C46C] block">
              02 HARMONIC PATHWAY
            </span>
            <div className="space-y-1.5 text-xs">
              <div className="rounded-lg p-2 bg-[#11131C] border border-[rgba(244,196,108,0.14)]">
                <span className="font-mono-data text-[9px] uppercase tracking-wider text-[#B88938] block">
                  Input Foundation
                </span>
                <span className="text-[#F7F4EC] font-medium">{activeChannel.prereqLabel}</span>
              </div>
              <div className="rounded-lg p-2 bg-[#11131C] border border-[rgba(244,196,108,0.14)]">
                <span className="font-mono-data text-[9px] uppercase tracking-wider text-[#46D6E8] block">
                  Synthesized Destination
                </span>
                <span className="text-[#F7F4EC] font-medium">{activeChannel.targetLabel}</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-1 pt-0.5">
              {activeChannel.coupledRightIndices.map((cIdx) => {
                const partner = HARMONIC_CHANNELS[cIdx];
                if (!partner) return null;
                return (
                  <button
                    key={partner.id}
                    type="button"
                    onClick={() => setSelectedIdx(cIdx)}
                    className="px-2 py-0.5 rounded text-[9.5px] font-mono-data border border-[rgba(244,196,108,0.2)] bg-[#11131C] text-[#FFE29E] hover:border-[#F4C46C]"
                  >
                    → {partner.rightLabel}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 03 LIVE FORMULA */}
          <div className="p-4 space-y-2.5 border-[rgba(244,196,108,0.12)]">
            <span className="font-mono-data text-[10px] uppercase tracking-[0.18em] text-[#F4C46C] block">
              03 LIVE FORMULA
            </span>
            <div className="rounded-lg px-3 py-3 bg-[#060609] border border-[rgba(244,196,108,0.18)] overflow-x-auto min-h-[74px] flex items-center justify-center">
              <MathTex
                tex={activeChannel.formulaTex}
                displayMode
                className="text-xs sm:text-sm text-[#FFE29E]"
              />
            </div>
            <p className="font-mono-data text-[10px] text-[#A8B2C6]">
              Routed via central Harmonic Spine hub · Click any left or right filament node to switch coupling.
            </p>
          </div>

          {/* 04 RESONANCE MATRIX */}
          <div className="p-4 space-y-2.5 border-[rgba(244,196,108,0.12)]">
            <div className="flex items-center justify-between">
              <span className="font-mono-data text-[10px] uppercase tracking-[0.18em] text-[#F4C46C]">
                04 RESONANCE MATRIX
              </span>
              <span className="font-mono-data text-[10px] text-[#FFE29E]">
                {(
                  (activeChannel.resonanceWeights.reduce((a, b) => a + b, 0) /
                    activeChannel.resonanceWeights.length) *
                  100
                ).toFixed(0)}
                % SYNC
              </span>
            </div>

            {/* 6x4 Animated Coupling Dot/Bar Matrix */}
            <div className="grid grid-cols-6 gap-1.5 p-2.5 rounded-lg bg-[#060609] border border-[rgba(244,196,108,0.16)]">
              {Array.from({ length: 24 }, (_, cellIdx) => {
                const baseWeight =
                  activeChannel.resonanceWeights[cellIdx % activeChannel.resonanceWeights.length];
                const wave = 0.08 * Math.sin(matrixTick * 0.55 + cellIdx * 0.65);
                const mod = ((cellIdx * 7 + activeChannel.index * 3) % 10) / 10;
                const intensity = Math.min(1, Math.max(0.12, baseWeight * 0.62 + mod * 0.36 + wave));
                const tileColor =
                  intensity > 0.82
                    ? '#FFE29E'
                    : intensity > 0.62
                      ? '#F4C46C'
                      : intensity > 0.42
                        ? '#FF8563'
                        : '#B88938';
                return (
                  <div
                    key={cellIdx}
                    className="h-3.5 rounded-[2px] transition-all duration-300"
                    style={{
                      backgroundColor: tileColor,
                      opacity: 0.22 + intensity * 0.78,
                      boxShadow: intensity > 0.78 ? `0 0 8px ${tileColor}66` : 'none',
                    }}
                  />
                );
              })}
            </div>

            {/* Horizontal coupling spectrum bars */}
            <div className="space-y-1">
              {activeChannel.resonanceWeights.slice(0, 3).map((w, bIdx) => {
                const liveW = Math.min(
                  0.99,
                  Math.max(0.18, w + 0.04 * Math.sin(matrixTick * 0.7 + bIdx * 1.4))
                );
                return (
                  <div key={bIdx} className="flex items-center gap-2 font-mono-data text-[9.5px]">
                    <span className="w-10 text-[#A8B2C6]">H{bIdx + 1}</span>
                    <div className="flex-1 h-1.5 rounded-full bg-[#11131C] overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${Math.round(liveW * 100)}%`,
                          background: `linear-gradient(90deg, #B88938, ${activeChannel.accent}, #FFE29E)`,
                        }}
                      />
                    </div>
                    <span className="w-8 text-right text-[#FFE29E]">{liveW.toFixed(2)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
