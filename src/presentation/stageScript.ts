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
    title: 'MERIDIAN — Living Atlas of Mathematics',
    subtitle: 'Four years of high school mathematics propelled by kinetic manifolds and vector fields.',
    accent: '#F4B956',
    durationSec: 14,
  },
  {
    id: 'cartography',
    number: 'ACT II',
    title: 'Cartography of Prerequisites',
    subtitle: 'Tracing structural dependencies from Algebra 1 through Matrix Networks to Precalculus.',
    accent: '#38D4FF',
    durationSec: 16,
  },
  {
    id: 'parabola',
    number: 'ACT III',
    title: 'Algebra in Motion · The Discriminant Trichotomy',
    subtitle: 'Watching Δ = b² − 4ac carry a parabola across real roots, tangency, and complex lift.',
    accent: '#F4B956',
    durationSec: 18,
  },
  {
    id: 'solids',
    number: 'ACT IV',
    title: 'Geometry Unfolded · Surface Area & Cross-Sections',
    subtitle: 'Deconstructing a 3D square pyramid along real geometric hinges into its planar 2D net.',
    accent: '#38D4FF',
    durationSec: 18,
  },
  {
    id: 'neural-wave',
    number: 'ACT V',
    title: 'Harmonic Waves & Neural Matrix Propagation',
    subtitle: 'Circular rotation projected into sinusoids, then layered into neural matrix transforms.',
    accent: '#34E8A5',
    durationSec: 20,
  },
  {
    id: 'animated-proofs',
    number: 'ACT VI',
    title: 'Animated Proofs & Worked Solutions',
    subtitle: 'Watch geometric formulas draw themselves alongside synchronized step-by-step solved problems.',
    accent: '#36EBA8',
    durationSec: 18,
  },
  {
    id: 'finale',
    number: 'ACT VII',
    title: 'Lorenz Chaos Finale & Closing Meridian',
    subtitle: 'Two trajectories separated by 0.002 diverging across twin butterfly lobes.',
    accent: '#FF785A',
    durationSec: 14,
  },
];

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
    atSec: 3.8,
    selectedId: 'a1-quadratics',
    camera: { x: 520, y: 290, zoom: 1.1 },
    caption: 'A1-05 · Quadratic Geometry branches into Geometry, Algebra 2 & Physics.',
  },
  {
    atSec: 7.5,
    selectedId: 'g-solids',
    camera: { x: 930, y: 310, zoom: 1.08 },
    caption: 'G-04 · 3D Solids & Nets extend right-triangle Pythagoras into 3D space.',
  },
  {
    atSec: 10.8,
    selectedId: 'a2-matrices',
    camera: { x: 1290, y: 258, zoom: 1.05 },
    caption: 'A2-05 · Matrix transformations compose into multilayer neural architectures.',
  },
  {
    atSec: 13.5,
    selectedId: 'pc-unit-circle',
    camera: { x: 1610, y: 240, zoom: 0.96 },
    caption: 'PC-01 · Circular Trigonometry unifies geometry, waves, and vector velocity.',
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
