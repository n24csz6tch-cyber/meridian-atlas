import type { EquationVisualKind } from '../visuals/equations/EquationMiniVisual';
import type { MapCameraTarget } from '../visuals/map/PrerequisiteMap';
import type { ParabolaHighlightFeature } from '../visuals/parabola/ParabolaCanvas';
import type { SolidHighlightPart } from '../visuals/solids/SolidNetScene';

export interface StageActMeta {
  id: string;
  number: string;
  title: string;
  subtitle: string;
  accent: string;
  durationSec: number;
}

export const STAGE_ACTS: StageActMeta[] = [
  {
    id: 'overture',
    number: 'ACT I',
    title: 'AUREA — Living 3D Observatory of Mathematics',
    subtitle: 'Four years of high school math connected to kinetic 3D manifolds and String Theory.',
    accent: '#F4C46C',
    durationSec: 14,
  },
  {
    id: 'harmonic-spine',
    number: 'ACT II',
    title: 'Golden Harmonic Spine & Constellation Atlas',
    subtitle: 'Tracing 24 foundational theorems across golden filaments and 36 prerequisite nodes.',
    accent: '#FFE29E',
    durationSec: 20,
  },
  {
    id: 'parabola',
    number: 'ACT III',
    title: 'Algebra in Motion · The Discriminant Trichotomy',
    subtitle: 'Watching Δ = b² − 4ac carry a parabola across real roots, tangency, and complex lift.',
    accent: '#F5C25B',
    durationSec: 18,
  },
  {
    id: 'solids',
    number: 'ACT IV',
    title: 'Geometry Unfolded · Surface Area & Cross-Sections',
    subtitle: 'Deconstructing a 3D square pyramid along real geometric hinges into its planar 2D net.',
    accent: '#46D6E8',
    durationSec: 18,
  },
  {
    id: 'neural-wave',
    number: 'ACT V',
    title: 'Harmonic Waves & Neural Matrix Propagation',
    subtitle: 'Circular rotation projected into sinusoids, then layered into neural matrix transforms.',
    accent: '#45E6A6',
    durationSec: 20,
  },
  {
    id: 'string-calabi-yau',
    number: 'ACT VI',
    title: 'String Theory & Calabi-Yau Manifolds 3D',
    subtitle: 'How complex roots z₁ⁿ + z₂ⁿ = 1, Euler phase e^(iθ), and standing waves fold 6 extra dimensions.',
    accent: '#F4C46C',
    durationSec: 18,
  },
  {
    id: 'animated-proofs',
    number: 'ACT VII',
    title: 'Animated Proofs & Worked Solutions',
    subtitle: 'Watch geometric formulas draw themselves alongside synchronized step-by-step solved problems.',
    accent: '#45E6A6',
    durationSec: 18,
  },
  {
    id: 'algebraic-pipeline',
    number: 'ACT VIII',
    title: 'Algebraic Dataflow & Oscilloscope Engine',
    subtitle: 'Streaming numbers through linear scale ax + b, quadratic warp x², and live composite waves.',
    accent: '#F4C46C',
    durationSec: 18,
  },
  {
    id: 'polar-harmonic',
    number: 'ACT IX',
    title: 'Polar Harmonic Ring & Lissajous Orbits',
    subtitle: 'Scrub angle θ across concentric rings, golden chord arcs, and p:q resonance roses.',
    accent: '#46D6E8',
    durationSec: 18,
  },
  {
    id: 'confidence-ribbon',
    number: 'ACT X',
    title: 'Confidence Ribbon & Residual Telemetry',
    subtitle: 'Live 68–95–99.7% empirical uncertainty envelopes, Box-Muller residuals, and R² fit.',
    accent: '#45E6A6',
    durationSec: 18,
  },
  {
    id: 'tensor-riemann',
    number: 'ACT XI',
    title: '3D Tensor & Riemann Volume Manifold',
    subtitle: 'Interactive 3D prism stacks converging toward exact multivariable surface integrals.',
    accent: '#FFE29E',
    durationSec: 20,
  },
  {
    id: 'finale',
    number: 'ACT XII',
    title: 'Lorenz Chaos Finale & Closing Observatory',
    subtitle: 'Two trajectories separated by 0.002 diverging across twin golden attractor lobes.',
    accent: '#FF8563',
    durationSec: 14,
  },
];

export type DriveStageActId =
  | 'algebraic-pipeline'
  | 'polar-harmonic'
  | 'confidence-ribbon'
  | 'tensor-riemann';

export interface DriveStageNote {
  courseBridge: string;
  tex: string;
  takeaway: string;
}

export const DRIVE_STAGE_NOTES: Record<DriveStageActId, DriveStageNote> = {
  'algebraic-pipeline': {
    courseBridge: 'Algebra 1 · Function Composition & Oscilloscope Signal Flow',
    tex: 'x \\xrightarrow{ax+b} u \\xrightarrow{u^2} f(x) = (ax + b)^2',
    takeaway:
      'Every neural layer and composite algebraic rule works like an assembly line: scale first, bend second, and read the output wave live.',
  },
  'polar-harmonic': {
    courseBridge: 'Precalculus · Polar Roses, Circular Harmonics & Golden Ratios',
    tex: 'r(\\theta) = \\cos\\!\\left(\\tfrac{p}{q}\\theta\\right), \\quad (x, y) = (r\\cos\\theta, r\\sin\\theta)',
    takeaway:
      'Drag right on the ring to scrub angle θ, or switch between 3-Petal, 5-Petal, and irrational Golden Ratio φ:1 orbits.',
  },
  'confidence-ribbon': {
    courseBridge: 'Algebra 1 & Algebra 2 · Regression Residuals & 68–95–99.7% Bands',
    tex: 'y = \\hat{y}(x) \\pm k\\sigma, \\qquad R^2 = 1 - \\dfrac{\\sum e_i^2}{\\sum (y_i - \\bar{y})^2}',
    takeaway:
      'Real measurements cluster around a trend curve inside layered 1σ, 2σ, and 3σ ribbons—showing uncertainty visually at a glance.',
  },
  'tensor-riemann': {
    courseBridge: 'Precalculus & Calculus Bridge · 3D Riemann Sums & Tensor Slices',
    tex: 'V_N = \\sum_{i,j=1}^N f(x_i, y_j)\\,\\Delta x\\,\\Delta y \\xrightarrow{N\\to\\infty} \\iint_D f(x,y)\\,dA',
    takeaway:
      'Increase the grid from 2×2 to 10×10 and watch blocky 3D prisms hug the smooth exact surface as error shrinks toward zero.',
  },
};

export const MAP_FLIGHT_KEYFRAMES: {
  atSec: number;
  selectedId: string;
  camera: MapCameraTarget;
  caption: string;
}[] = [
  {
    atSec: 0,
    selectedId: 'a1-linear',
    camera: { x: 300, y: 230, zoom: 1.05 },
    caption: 'A1-02 · Linear Functions anchor every slope and coordinate mapping.',
  },
  {
    atSec: 2,
    selectedId: 'a1-quadratics',
    camera: { x: 520, y: 290, zoom: 1.1 },
    caption: 'A1-08 · Quadratic Geometry branches into Geometry, Algebra 2 & Physics.',
  },
  {
    atSec: 4,
    selectedId: 'g-solids',
    camera: { x: 930, y: 310, zoom: 1.08 },
    caption: 'G-09 · 3D Solids & Nets extend right-triangle Pythagoras into 3D space.',
  },
  {
    atSec: 6,
    selectedId: 'a2-matrices',
    camera: { x: 1290, y: 258, zoom: 1.05 },
    caption: 'A2-07 · Matrix transformations compose into multilayer neural architectures.',
  },
  {
    atSec: 8,
    selectedId: 'pc-unit-circle',
    camera: { x: 1610, y: 240, zoom: 0.96 },
    caption: 'PC-01 · Circular Trigonometry unifies geometry, waves, and String Harmonics.',
  },
];

export const PARABOLA_KEYFRAMES: {
  atSec: number;
  a: number;
  h: number;
  k: number;
  highlight: ParabolaHighlightFeature;
  badge: string;
  tex: string;
  note: string;
}[] = [
  {
    atSec: 0,
    a: 1,
    h: 2,
    k: -3,
    highlight: 'roots',
    badge: 'Δ = +12 > 0 · Two Real Roots',
    tex: 'f(x) = (x - 2)^2 - 3',
    note: 'Vertex sits below the x-axis while a > 0, producing two symmetric real intercepts.',
  },
  {
    atSec: 5.5,
    a: 1,
    h: 2,
    k: 0,
    highlight: 'vertex',
    badge: 'Δ = 0 · Tangent Double Root',
    tex: 'f(x) = (x - 2)^2',
    note: 'Lifting k to 0 brings both real roots together at one tangent point V(2, 0).',
  },
  {
    atSec: 11,
    a: 1,
    h: 2,
    k: 2.5,
    highlight: 'axis',
    badge: 'Δ = −10 < 0 · Zero Real Roots',
    tex: 'f(x) = (x - 2)^2 + 2.5',
    note: 'Above the axis, symmetry x = 2 holds, while roots leave ℝ for the complex plane.',
  },
  {
    atSec: 16.5,
    a: -0.6,
    h: -1,
    k: 3.5,
    highlight: 'curvature',
    badge: 'a < 0 · Inverted Trajectory',
    tex: 'f(x) = -0.6(x + 1)^2 + 3.5',
    note: 'Negating curvature flips the extremum into a global maximum.',
  },
];

export const SOLIDS_KEYFRAMES: {
  atSec: number;
  unfold: number;
  highlight: SolidHighlightPart;
  internalTriangle: boolean;
  sliceHeight: number | null;
  badge: string;
  tex: string;
  note: string;
}[] = [
  {
    atSec: 0,
    unfold: 0,
    highlight: 'all',
    internalTriangle: true,
    sliceHeight: null,
    badge: 'Phase 1 · Internal Slant Geometry',
    tex: 'l = \\sqrt{h^2 + (s/2)^2}',
    note: 'Vertical altitude h and apothem s/2 form an internal right triangle whose hypotenuse is slant height l.',
  },
  {
    atSec: 5.5,
    unfold: 1,
    highlight: 'base',
    internalTriangle: false,
    sliceHeight: null,
    badge: 'Phase 2 · Unfold Base Footprint (B)',
    tex: 'B = s^2',
    note: 'Four hinges swing outward 90°, exposing the exact square base footprint.',
  },
  {
    atSec: 11,
    unfold: 1,
    highlight: 'lateral',
    internalTriangle: false,
    sliceHeight: null,
    badge: 'Phase 3 · Lateral Triangle Net (L)',
    tex: 'L = 4\\left(\\tfrac{1}{2} s l\\right) = \\tfrac{1}{2}Pl',
    note: 'All four congruent triangles lie flat on the plane; area is conserved with zero distortion.',
  },
  {
    atSec: 16.5,
    unfold: 0,
    highlight: 'all',
    internalTriangle: false,
    sliceHeight: 0.45,
    badge: 'Phase 4 · Parallel Cross-Section (MA.912.GR.4.1)',
    tex: '\\text{Horizontal Cut} \\implies \\text{Similar Square}',
    note: 'Refolding the solid and slicing parallel to the base always produces a scaled square.',
  },
];

export const FRONTIER_KEYFRAMES: {
  atSec: number;
  badge: string;
  courseBridge: string;
  tex: string;
  note: string;
}[] = [
  {
    atSec: 0,
    badge: '01 · Complex Polynomial Compactification',
    courseBridge: 'Algebra 2 · Complex Roots of Unity',
    tex: 'z_1^n + z_2^n = 1 \\implies z_k = r^{1/n}e^{i(\\theta + 2\\pi k)/n}',
    note: 'Solving zⁿ = 1 places n symmetric roots around the unit circle—stitching n² smooth sheets into a 6D Calabi-Yau throat.',
  },
  {
    atSec: 4.5,
    badge: '02 · Euler Phase Rotation',
    courseBridge: 'Algebra 2 & Precalculus · Complex Argand Plane',
    tex: 'e^{i\\theta} = \\cos\\theta + i\\sin\\theta',
    note: 'Multiplying a string amplitude by e^(iθ) rotates quantum states smoothly around hidden circular fibers.',
  },
  {
    atSec: 9,
    badge: '03 · Standing Wave String Harmonics',
    courseBridge: 'Precalculus · Unit Circle Sinusoids',
    tex: 'y(\\sigma, \\tau) = A\\sin(n\\sigma)\\cos(\\omega_n\\tau),\\quad E_n \\propto n\\sqrt{T}',
    note: 'Just like overtones on a guitar string, integer modes n = 1, 2, 3… determine whether a string vibrates as light, gravity, or matter.',
  },
  {
    atSec: 13.5,
    badge: '04 · Topology & Dimensional Scaling',
    courseBridge: 'Geometry · Euler Invariant & Volume Scaling',
    tex: '\\chi = V - E + F,\\qquad N_{\\text{families}} = \\dfrac{|\\chi|}{2} = 3',
    note: 'Raising tiny radius R ≈ 10⁻³⁵ m to the 6th power hides six dimensions while preserving the topological family count.',
  },
];

export const PROOF_KEYFRAMES: {
  atSec: number;
  stepIdx: number;
  eqVisual: EquationVisualKind;
  stage: string;
  tex: string;
  solvedBadge: string;
  solvedTex: string;
  note: string;
}[] = [
  {
    atSec: 0,
    stepIdx: 0,
    eqVisual: 'area-factor',
    stage: 'Step 1 · Partition & Complete the Square',
    tex: '2x^2 - 8x + 6 = 2(x^2 - 4x + 4) - 2',
    solvedBadge: 'Worked Problem 01 · Vertex Rewrite',
    solvedTex: 'f(x) = 2(x - 2)^2 - 2 \\implies V(2, -2)',
    note: 'Splitting linear rectangles reveals the exact squared side length and minimum vertex coordinate.',
  },
  {
    atSec: 4.5,
    stepIdx: 1,
    eqVisual: 'parabola-discriminant',
    stage: 'Step 2 · Extract Real Roots Symmetrically',
    tex: '2(x - 2)^2 = 2 \\implies x = 2 \\pm 1',
    solvedBadge: 'Verified Roots Solution',
    solvedTex: 'r_1 = 1,\\quad r_2 = 3,\\quad \\Delta = 16 > 0',
    note: 'Real roots mirror symmetrically around x = 2 inside the discriminant envelope.',
  },
  {
    atSec: 9,
    stepIdx: 2,
    eqVisual: 'pythagoras-squares',
    stage: 'Step 3 · Visual Pythagorean Area Proof',
    tex: '(a + b)^2 - 4\\left(\\tfrac{1}{2}ab\\right) = c^2 \\implies a^2 + b^2 = c^2',
    solvedBadge: 'Worked Problem 02 · Slant Triple',
    solvedTex: 'h = 3,\\; \\tfrac{s}{2} = 4 \\implies l = \\sqrt{3^2 + 4^2} = 5',
    note: 'Sliding four congruent right triangles preserves area directly from c² into a² + b².',
  },
  {
    atSec: 13.5,
    stepIdx: 3,
    eqVisual: 'secant-to-tangent',
    stage: 'Step 4 · Secant-to-Tangent Calculus Limit',
    tex: 'f\'(x) = \\lim_{h \\to 0}\\dfrac{f(x + h) - f(x)}{h}',
    solvedBadge: 'Instantaneous Tangent Verified',
    solvedTex: 'f(x) = 0.45x^2 - 1 \\implies f\'(1) = 0.90',
    note: 'Collapsing interval width h → 0 snaps average secant slope onto the instantaneous tangent.',
  },
];
