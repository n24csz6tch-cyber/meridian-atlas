import { PracticeQuestion } from '../../components/PracticeEngine';
import { EquationVisualKind } from '../../visuals/equations/EquationMiniVisual';
import { MisconceptionPlotKind } from '../../visuals/equations/LessonLayerVisuals';
import { TopicVisualId } from '../../visuals/topics/TopicVisualCanvas';

export interface TopicVisualConfig {
  axiomVisuals: [EquationVisualKind, EquationVisualKind, EquationVisualKind];
  stepVisuals: EquationVisualKind[];
  misconceptionPlot: MisconceptionPlotKind;
  applicationVisual: EquationVisualKind;
  applicationTag: string;
  extraQuestions?: PracticeQuestion[];
}

export const TOPIC_VISUAL_CONFIG: Record<TopicVisualId, TopicVisualConfig> = {
  'a1-expressions': {
    axiomVisuals: ['area-factor', 'diff-squares', 'perfect-square'],
    stepVisuals: ['area-factor', 'area-factor', 'perfect-square', 'area-factor'],
    misconceptionPlot: 'area-wings',
    applicationVisual: 'perfect-square',
    applicationTag: 'Architectural Floor-Plan',
    extraQuestions: [
      {
        id: 'a1e-3',
        prompt: 'Expand (x + 5)² = x² + bx + 25. What is the middle coefficient b?',
        promptTex: '(x + 5)^2 = x^2 + bx + 25',
        type: 'numeric',
        correctAnswer: 10,
        tolerance: 0.01,
        hint: 'There are TWO identical 5x rectangular wings: 2 · 5 = 10.',
        solutionSteps: [
          { label: 'Two Symmetric Wings', tex: '5x + 5x = 10x \\implies b = 10', note: 'Perfect square pattern.' },
        ],
      },
    ],
  },
  'a1-linear': {
    axiomVisuals: ['slope-triangle', 'slope-intercept', 'point-slope'],
    stepVisuals: ['slope-triangle', 'slope-triangle', 'point-slope', 'slope-intercept'],
    misconceptionPlot: 'slope-invert',
    applicationVisual: 'slope-intercept',
    applicationTag: 'Thermal Sensor Calibration',
    extraQuestions: [
      {
        id: 'a1l-3',
        prompt: 'A line with slope m = 4 passes through (1, 5). What is its y-intercept b?',
        promptTex: '5 = 4(1) + b',
        type: 'numeric',
        correctAnswer: 1,
        tolerance: 0.01,
        hint: 'Subtract 4 from 5.',
        solutionSteps: [
          { label: 'Solve for b', tex: 'b = 5 - 4 = 1 \\implies y = 4x + 1', note: 'Crosses y-axis at (0, 1).' },
        ],
      },
    ],
  },
  'a1-radicals-exp': {
    axiomVisuals: ['exponent-product', 'rational-exponent', 'radical-curve'],
    stepVisuals: ['rational-exponent', 'exponent-product', 'rational-exponent', 'radical-curve'],
    misconceptionPlot: 'exp-add-vs-mult',
    applicationVisual: 'radical-curve',
    applicationTag: 'Wave Speed & Pendulum Physics',
  },
  'a1-systems': {
    axiomVisuals: ['line-intersection', 'linear-pencil', 'parallel-lines'],
    stepVisuals: ['line-intersection', 'linear-pencil', 'line-intersection', 'line-intersection'],
    misconceptionPlot: 'parallel-no-cross',
    applicationVisual: 'line-intersection',
    applicationTag: 'Supply & Demand Equilibrium',
    extraQuestions: [
      {
        id: 'a1s-2',
        prompt: 'Solve the system x + y = 10 and x − y = 4. What is the value of x?',
        promptTex: '(x + y) + (x - y) = 10 + 4',
        type: 'numeric',
        correctAnswer: 7,
        tolerance: 0.01,
        hint: 'Add both equations to cancel y: 2x = 14.',
        solutionSteps: [
          { label: 'Eliminate y', tex: '2x = 14 \\implies x = 7,\\; y = 3', note: 'Unique crossing (7, 3).' },
        ],
      },
      {
        id: 'a1s-3',
        prompt: 'How many solutions does the system y = 3x + 2 and y = 3x − 5 have?',
        type: 'multiple-choice',
        options: [
          { id: 'a', label: '0 solutions (parallel lines never cross)' },
          { id: 'b', label: '1 unique solution' },
          { id: 'c', label: '2 solutions' },
          { id: 'd', label: 'Infinitely many solutions' },
        ],
        correctAnswer: 'a',
        hint: 'Compare slopes m₁ = 3 and m₂ = 3 with different intercepts.',
        solutionSteps: [
          { label: 'Parallel Check', tex: 'm_1 = m_2 = 3,\\; 2 \\ne -5 \\implies \\emptyset', note: 'No intersection.' },
        ],
      },
    ],
  },
  'a1-inequalities': {
    axiomVisuals: ['half-plane', 'feasible-wedge', 'boundary-dashed'],
    stepVisuals: ['half-plane', 'boundary-dashed', 'feasible-wedge', 'feasible-wedge'],
    misconceptionPlot: 'dashed-boundary',
    applicationVisual: 'feasible-wedge',
    applicationTag: 'Linear Programming Optimization',
    extraQuestions: [
      {
        id: 'a1in-2',
        prompt: 'Does the point (2, 5) satisfy the strict inequality y > 2x + 1?',
        promptTex: '5 > 2(2) + 1 \\;?',
        type: 'multiple-choice',
        options: [
          { id: 'a', label: 'No — 5 is NOT strictly greater than 5 (lies on dashed boundary)' },
          { id: 'b', label: 'Yes — 5 equals 5 so strict > includes it' },
        ],
        correctAnswer: 'a',
        hint: 'Plug in x = 2: 2(2) + 1 = 5. Is 5 > 5 true?',
        solutionSteps: [
          { label: 'Boundary Audit', tex: '5 > 5 \\text{ is FALSE}', note: 'Strict > uses a dashed excluded line.' },
        ],
      },
      {
        id: 'a1in-3',
        prompt: 'If −3x ≤ 12, what is the boundary threshold value k in x ≥ k?',
        promptTex: '-3x \\le 12 \\implies x \\ge k',
        type: 'numeric',
        correctAnswer: -4,
        tolerance: 0.01,
        hint: 'Divide by −3 and FLIP the inequality sign.',
        solutionSteps: [
          { label: 'Sign Flip Rule', tex: 'x \\ge \\dfrac{12}{-3} = -4', note: 'Multiplying/dividing by negative reverses order.' },
        ],
      },
    ],
  },
  'a1-abs-piecewise': {
    axiomVisuals: ['abs-v-shift', 'abs-distance', 'piecewise-step'],
    stepVisuals: ['abs-v-shift', 'abs-distance', 'abs-distance', 'piecewise-step'],
    misconceptionPlot: 'abs-shift-sign',
    applicationVisual: 'abs-distance',
    applicationTag: 'CNC Machining Tolerance',
  },
  'a1-exponential': {
    axiomVisuals: ['exp-growth', 'exp-decay', 'exp-asymptote'],
    stepVisuals: ['exp-growth', 'exp-growth', 'exp-decay', 'exp-asymptote'],
    misconceptionPlot: 'exp-vs-linear',
    applicationVisual: 'exp-growth',
    applicationTag: 'Compound Growth & Half-Life',
    extraQuestions: [
      {
        id: 'a1ex-2',
        prompt: 'A bacteria culture starts at 100 and doubles every hour: P(t) = 100·2^t. Find P(3).',
        promptTex: 'P(3) = 100 \\cdot 2^3',
        type: 'numeric',
        correctAnswer: 800,
        tolerance: 0.1,
        hint: '2³ = 8.',
        solutionSteps: [
          { label: 'Evaluate Power', tex: '100 \\cdot 8 = 800', note: '3 doublings.' },
        ],
      },
      {
        id: 'a1ex-3',
        prompt: 'Does f(x) = 5 · (0.7)^x model exponential growth or exponential decay?',
        type: 'multiple-choice',
        options: [
          { id: 'a', label: 'Exponential decay (0 < b < 1)' },
          { id: 'b', label: 'Exponential growth (b > 1)' },
          { id: 'c', label: 'Constant linear decrease' },
        ],
        correctAnswer: 'a',
        hint: 'Base b = 0.7 shrinks by 30% each unit step.',
        solutionSteps: [
          { label: 'Base Check', tex: '0 < 0.7 < 1 \\implies \\text{30\\% decay per step}', note: 'Approaches y = 0.' },
        ],
      },
    ],
  },
  'a1-statistics': {
    axiomVisuals: ['scatter-regression', 'residual-squares', 'correlation-r'],
    stepVisuals: ['scatter-regression', 'residual-squares', 'residual-squares', 'correlation-r'],
    misconceptionPlot: 'regression-outlier',
    applicationVisual: 'residual-squares',
    applicationTag: 'ML Mean-Squared-Error Loss',
  },
  'g-parallel-angles': {
    axiomVisuals: ['transversal-alt', 'transversal-corr', 'linear-pair'],
    stepVisuals: ['transversal-alt', 'transversal-alt', 'linear-pair', 'transversal-corr'],
    misconceptionPlot: 'transversal-supp-vs-eq',
    applicationVisual: 'transversal-alt',
    applicationTag: 'Eratosthenes Earth Arc',
  },
  'g-triangles': {
    axiomVisuals: ['triangle-congruence', 'rigid-motion', 'triangle-sum'],
    stepVisuals: ['rigid-motion', 'triangle-congruence', 'triangle-congruence', 'triangle-sum'],
    misconceptionPlot: 'ssa-not-congruent',
    applicationVisual: 'triangle-congruence',
    applicationTag: 'Structural Bridge Trusses',
    extraQuestions: [
      {
        id: 'gtri-2',
        prompt: 'Two angles of a triangle measure 47° and 63°. Find the third angle in degrees.',
        promptTex: '180^\\circ - (47^\\circ + 63^\\circ)',
        type: 'numeric',
        correctAnswer: 70,
        tolerance: 0.1,
        unitLabel: '°',
        hint: 'Interior angles sum to 180°.',
        solutionSteps: [
          { label: 'Triangle Sum', tex: '180^\\circ - 110^\\circ = 70^\\circ', note: 'Exact measure.' },
        ],
      },
      {
        id: 'gtri-3',
        prompt: 'Which combination does NOT guarantee triangle congruence in general?',
        type: 'multiple-choice',
        options: [
          { id: 'a', label: 'SSA (Side-Side-Angle) and AAA' },
          { id: 'b', label: 'SSS (Side-Side-Side)' },
          { id: 'c', label: 'SAS (Side-Angle-Side)' },
          { id: 'd', label: 'ASA (Angle-Side-Angle)' },
        ],
        correctAnswer: 'a',
        hint: 'AAA only fixes shape (similarity); SSA can swing into two triangles.',
        solutionSteps: [
          { label: 'Congruence Audit', tex: '\\text{SSS, SAS, ASA, AAS, HL valid; SSA/AAA fail}', note: 'Need rigid lock.' },
        ],
      },
    ],
  },
  'g-similarity': {
    axiomVisuals: ['similar-triangles', 'area-scale-k2', 'side-splitter'],
    stepVisuals: ['similar-triangles', 'similar-triangles', 'side-splitter', 'area-scale-k2'],
    misconceptionPlot: 'scale-k-vs-k2',
    applicationVisual: 'similar-triangles',
    applicationTag: 'Optical Camera Projection',
  },
  'g-transformations': {
    axiomVisuals: ['reflection-axis', 'rotation-arc', 'dilation-rays'],
    stepVisuals: ['reflection-axis', 'rotation-arc', 'dilation-rays', 'dilation-rays'],
    misconceptionPlot: 'reflect-order',
    applicationVisual: 'rotation-arc',
    applicationTag: 'Computer Graphics Pipeline',
    extraQuestions: [
      {
        id: 'gtrf-2',
        prompt: 'Point P(3, −2) is dilated from the origin by scale factor k = 4. What is the new x-coordinate?',
        promptTex: '(4 \\cdot 3,\\; 4 \\cdot (-2))',
        type: 'numeric',
        correctAnswer: 12,
        tolerance: 0.01,
        hint: 'Multiply both coordinates by k = 4.',
        solutionSteps: [
          { label: 'Origin Dilation', tex: 'P\'(12, -8) \\implies x\' = 12', note: 'Linear scale.' },
        ],
      },
      {
        id: 'gtrf-3',
        prompt: 'Reflecting point (5, 2) across the x-axis produces which image?',
        type: 'multiple-choice',
        options: [
          { id: 'a', label: '(5, −2)' },
          { id: 'b', label: '(−5, 2)' },
          { id: 'c', label: '(2, 5)' },
          { id: 'd', label: '(−5, −2)' },
        ],
        correctAnswer: 'a',
        hint: 'Flipping vertically negates only the y-coordinate.',
        solutionSteps: [
          { label: 'x-Axis Reflection', tex: '(x, y) \\mapsto (x, -y) = (5, -2)', note: 'Vertical mirror.' },
        ],
      },
    ],
  },
  'g-quadrilaterals': {
    axiomVisuals: ['polygon-angles', 'quad-diagonals', 'quad-hierarchy'],
    stepVisuals: ['polygon-angles', 'polygon-angles', 'polygon-angles', 'quad-diagonals'],
    misconceptionPlot: 'polygon-n-vs-n2',
    applicationVisual: 'quad-diagonals',
    applicationTag: 'Scissor-Lift Pantograph',
  },
  'g-right-trig': {
    axiomVisuals: ['pythagoras-squares', 'right-trig-ratios', 'special-triangle'],
    stepVisuals: ['pythagoras-squares', 'pythagoras-squares', 'right-trig-ratios', 'special-triangle'],
    misconceptionPlot: 'pythag-hyp-vs-sum',
    applicationVisual: 'right-trig-ratios',
    applicationTag: 'Aviation Glide Slope',
    extraQuestions: [
      {
        id: 'grt-2',
        prompt: 'A right triangle has legs a = 5 and b = 12. Find hypotenuse c.',
        promptTex: 'c = \\sqrt{5^2 + 12^2}',
        type: 'numeric',
        correctAnswer: 13,
        tolerance: 0.01,
        hint: '25 + 144 = 169.',
        solutionSteps: [
          { label: 'Pythagorean Triple', tex: '\\sqrt{169} = 13', note: '5-12-13 triangle.' },
        ],
      },
      {
        id: 'grt-3',
        prompt: 'In a 3-4-5 right triangle, what is sin(θ) for the angle opposite side 3?',
        promptTex: '\\sin\\theta = \\dfrac{\\text{opp}}{\\text{hyp}}',
        type: 'numeric',
        correctAnswer: 0.6,
        tolerance: 0.01,
        hint: 'Divide 3 by hypotenuse 5.',
        solutionSteps: [
          { label: 'Sine Ratio', tex: '3 / 5 = 0.6', note: 'SOH-CAH-TOA.' },
        ],
      },
    ],
  },
  'g-coordinate': {
    axiomVisuals: ['distance-norm', 'midpoint-bisector', 'perp-slopes'],
    stepVisuals: ['distance-norm', 'midpoint-bisector', 'perp-slopes', 'distance-norm'],
    misconceptionPlot: 'distance-sign-error',
    applicationVisual: 'distance-norm',
    applicationTag: 'GPS Euclidean Localization',
    extraQuestions: [
      {
        id: 'gco-2',
        prompt: 'Find the x-coordinate of the midpoint between (−2, 4) and (8, 10).',
        promptTex: 'x_M = \\dfrac{-2 + 8}{2}',
        type: 'numeric',
        correctAnswer: 3,
        tolerance: 0.01,
        hint: 'Average −2 and 8.',
        solutionSteps: [
          { label: 'Midpoint Formula', tex: 'M = (3, 7) \\implies x_M = 3', note: 'Exact center.' },
        ],
      },
      {
        id: 'gco-3',
        prompt: 'A line has slope m = 2/3. What is the slope of any line perpendicular to it?',
        type: 'multiple-choice',
        options: [
          { id: 'a', label: 'Slope A', tex: '-\\dfrac{3}{2}' },
          { id: 'b', label: 'Slope B', tex: '\\dfrac{3}{2}' },
          { id: 'c', label: 'Slope C', tex: '-\\dfrac{2}{3}' },
          { id: 'd', label: 'Slope D', tex: '\\dfrac{2}{3}' },
        ],
        correctAnswer: 'a',
        hint: 'Negative reciprocal: flip fraction and change sign.',
        solutionSteps: [
          { label: 'Perpendicular Product', tex: '\\tfrac{2}{3} \\cdot (-\\tfrac{3}{2}) = -1', note: '90° intersection.' },
        ],
      },
    ],
  },
  'g-circles': {
    axiomVisuals: ['inscribed-angle', 'circle-sector', 'chord-tangent'],
    stepVisuals: ['inscribed-angle', 'circle-sector', 'circle-sector', 'chord-tangent'],
    misconceptionPlot: 'inscribed-vs-central',
    applicationVisual: 'circle-sector',
    applicationTag: 'Orbital Sweep & Radar Arc',
    extraQuestions: [
      {
        id: 'gcir-2',
        prompt: 'An inscribed angle intercepts a 110° arc. What is the measure of the inscribed angle (in degrees)?',
        promptTex: '\\theta = \\tfrac{1}{2}(110^\\circ)',
        type: 'numeric',
        correctAnswer: 55,
        tolerance: 0.1,
        unitLabel: '°',
        hint: 'Take half of the intercepted arc.',
        solutionSteps: [
          { label: 'Inscribed Theorem', tex: '110^\\circ / 2 = 55^\\circ', note: 'Half central angle.' },
        ],
      },
      {
        id: 'gcir-3',
        prompt: 'What angle does a tangent line ALWAYS form with a radius drawn to the point of tangency?',
        type: 'numeric',
        correctAnswer: 90,
        tolerance: 0.1,
        unitLabel: '°',
        hint: 'Tangent and radius are perpendicular.',
        solutionSteps: [
          { label: 'Tangent-Radius Theorem', tex: '\\angle = 90^\\circ', note: 'Right angle.' },
        ],
      },
    ],
  },
  'a2-complex': {
    axiomVisuals: ['argand-vector', 'complex-conjugate', 'euler-circle'],
    stepVisuals: ['argand-vector', 'complex-conjugate', 'euler-circle', 'argand-vector'],
    misconceptionPlot: 'complex-i2-sign',
    applicationVisual: 'euler-circle',
    applicationTag: 'AC Impedance & Phasors',
    extraQuestions: [
      {
        id: 'a2cx-2',
        prompt: 'Compute the modulus |3 + 4i| in the Argand plane.',
        promptTex: '|3 + 4i| = \\sqrt{3^2 + 4^2}',
        type: 'numeric',
        correctAnswer: 5,
        tolerance: 0.01,
        hint: 'Distance from origin: √(9 + 16).',
        solutionSteps: [
          { label: 'Modulus', tex: '\\sqrt{25} = 5', note: 'Radius in complex plane.' },
        ],
      },
      {
        id: 'a2cx-3',
        prompt: 'Multiply (2 + 3i)(2 − 3i) using conjugate product a² + b².',
        promptTex: '(2 + 3i)(2 - 3i) = 4 - 9i^2',
        type: 'numeric',
        correctAnswer: 13,
        tolerance: 0.01,
        hint: 'Remember i² = −1, so 4 − 9(−1) = 4 + 9.',
        solutionSteps: [
          { label: 'Conjugate Norm', tex: '2^2 + 3^2 = 13', note: 'Pure real positive norm.' },
        ],
      },
    ],
  },
  'a2-quad-systems': {
    axiomVisuals: ['nonlinear-2roots', 'nonlinear-tangent', 'quad-ineq-region'],
    stepVisuals: ['nonlinear-2roots', 'nonlinear-2roots', 'nonlinear-tangent', 'quad-ineq-region'],
    misconceptionPlot: 'nonlinear-single-root',
    applicationVisual: 'nonlinear-2roots',
    applicationTag: 'Trajectory Interception',
  },
  'a2-radicals': {
    axiomVisuals: ['composition-pipe', 'inverse-mirror', 'radical-extraneous'],
    stepVisuals: ['radical-extraneous', 'inverse-mirror', 'composition-pipe', 'radical-extraneous'],
    misconceptionPlot: 'radical-extraneous-branch',
    applicationVisual: 'composition-pipe',
    applicationTag: 'Cryptography & Robotics',
  },
  'a2-polynomials': {
    axiomVisuals: ['factor-root', 'poly-multiplicity', 'poly-end-behavior'],
    stepVisuals: ['factor-root', 'poly-multiplicity', 'poly-end-behavior', 'poly-multiplicity'],
    misconceptionPlot: 'poly-divide-zero',
    applicationVisual: 'poly-multiplicity',
    applicationTag: 'CAD Bezier Splines',
    extraQuestions: [
      {
        id: 'a2p-2',
        prompt: 'At a zero of even multiplicity m = 2, how does the polynomial graph behave at the x-axis?',
        type: 'multiple-choice',
        options: [
          { id: 'a', label: 'Touches tangentially and bounces back without changing sign' },
          { id: 'b', label: 'Crosses straight through cleanly' },
          { id: 'c', label: 'Explodes into a vertical asymptote' },
        ],
        correctAnswer: 'a',
        hint: '(x − r)² ≥ 0 never flips sign across x = r.',
        solutionSteps: [
          { label: 'Even Parity', tex: '(x - r)^2 \\ge 0', note: 'Parabolic tangent bounce.' },
        ],
      },
      {
        id: 'a2p-3',
        prompt: 'How many total complex roots (counting multiplicity) does a degree-5 polynomial have?',
        type: 'numeric',
        correctAnswer: 5,
        tolerance: 0.01,
        hint: 'Fundamental Theorem of Algebra: degree n has exactly n complex roots.',
        solutionSteps: [
          { label: 'FTA', tex: '\\deg(P) = 5 \\implies 5\\text{ complex roots}', note: 'Counting multiplicity.' },
        ],
      },
    ],
  },
  'a2-combinatorics': {
    axiomVisuals: ['comb-vs-perm', 'pascal-binomial', 'binomial-bars'],
    stepVisuals: ['comb-vs-perm', 'pascal-binomial', 'pascal-binomial', 'binomial-bars'],
    misconceptionPlot: 'comb-vs-perm-overcount',
    applicationVisual: 'pascal-binomial',
    applicationTag: 'Binomial Risk & Routing',
  },
  'a2-rational': {
    axiomVisuals: ['rational-pole', 'rational-hole', 'horizontal-asym'],
    stepVisuals: ['rational-pole', 'rational-pole', 'rational-hole', 'horizontal-asym'],
    misconceptionPlot: 'rational-cancel-sum',
    applicationVisual: 'rational-pole',
    applicationTag: 'Thin-Lens Optics Focus',
    extraQuestions: [
      {
        id: 'a2r-2',
        prompt: 'What is the horizontal asymptote y = c of f(x) = 3 / (x − 1) + 7 as x → ∞?',
        promptTex: '\\lim_{x \\to \\infty} \\left(\\dfrac{3}{x - 1} + 7\\right)',
        type: 'numeric',
        correctAnswer: 7,
        tolerance: 0.01,
        hint: '3/(x − 1) shrinks to 0 as x becomes huge.',
        solutionSteps: [
          { label: 'End Limit', tex: '0 + 7 = 7', note: 'Approaches y = 7.' },
        ],
      },
      {
        id: 'a2r-3',
        prompt: 'In f(x) = (x − 2)(x + 5) / (x − 2), what occurs at x = 2?',
        type: 'multiple-choice',
        options: [
          { id: 'a', label: 'A removable discontinuity (open hole at (2, 7))' },
          { id: 'b', label: 'A vertical asymptote pole' },
          { id: 'c', label: 'A real x-intercept' },
        ],
        correctAnswer: 'a',
        hint: 'Common factor (x − 2) cancels out, leaving a single missing point.',
        solutionSteps: [
          { label: 'Cancel Factor', tex: 'f(x) = x + 5 \\;(x \\ne 2)', note: 'Open hole at (2, 7).' },
        ],
      },
    ],
  },
  'a2-probability': {
    axiomVisuals: ['normal-bell', 'z-score-band', 'expected-value'],
    stepVisuals: ['normal-bell', 'z-score-band', 'z-score-band', 'expected-value'],
    misconceptionPlot: 'normal-skew-vs-sym',
    applicationVisual: 'z-score-band',
    applicationTag: 'Six-Sigma Quality Telemetry',
    extraQuestions: [
      {
        id: 'a2pr-2',
        prompt: 'Test scores follow N(μ = 75, σ = 5). What is the z-score of a student who scored 85?',
        promptTex: 'z = \\dfrac{85 - 75}{5}',
        type: 'numeric',
        correctAnswer: 2,
        tolerance: 0.01,
        hint: 'Divide (x − μ) by σ.',
        solutionSteps: [
          { label: 'Standardize', tex: 'z = 10 / 5 = +2', note: 'Two standard deviations above mean.' },
        ],
      },
      {
        id: 'a2pr-3',
        prompt: 'Approximately what percentage of data in a normal distribution falls within ±2σ of the mean?',
        type: 'multiple-choice',
        options: [
          { id: 'a', label: '95%' },
          { id: 'b', label: '68%' },
          { id: 'c', label: '50%' },
          { id: 'd', label: '99.7%' },
        ],
        correctAnswer: 'a',
        hint: 'Empirical rule: 68 – 95 – 99.7.',
        solutionSteps: [
          { label: 'Empirical Band', tex: 'P(\\mu - 2\\sigma \\le X \\le \\mu + 2\\sigma) \\approx 95.4\\%', note: 'Central 95%.' },
        ],
      },
    ],
  },
  'pc-trig-identities': {
    axiomVisuals: ['trig-pythag-id', 'trig-double-angle', 'trig-sum-phase'],
    stepVisuals: ['trig-pythag-id', 'trig-pythag-id', 'trig-double-angle', 'trig-sum-phase'],
    misconceptionPlot: 'trig-double-vs-amp',
    applicationVisual: 'trig-sum-phase',
    applicationTag: 'Active Noise Cancellation',
  },
  'pc-vectors': {
    axiomVisuals: ['vector-parallelogram', 'dot-product-angle', 'matrix-det-area'],
    stepVisuals: ['vector-parallelogram', 'dot-product-angle', 'matrix-det-area', 'vector-parallelogram'],
    misconceptionPlot: 'vector-norm-vs-sum',
    applicationVisual: 'vector-parallelogram',
    applicationTag: 'Aerospace Wind Drift',
    extraQuestions: [
      {
        id: 'pcv-2',
        prompt: 'Compute the dot product ⟨2, 3⟩ · ⟨4, −1⟩.',
        promptTex: '2(4) + 3(-1)',
        type: 'numeric',
        correctAnswer: 5,
        tolerance: 0.01,
        hint: 'Multiply matching components and sum: 8 − 3.',
        solutionSteps: [
          { label: 'Dot Product', tex: '8 - 3 = 5', note: 'Scalar projection measure.' },
        ],
      },
      {
        id: 'pcv-3',
        prompt: 'If u · v = 0 for two non-zero vectors, what angle separates them?',
        type: 'numeric',
        correctAnswer: 90,
        tolerance: 0.1,
        unitLabel: '°',
        hint: 'cos(θ) = 0 at right angles.',
        solutionSteps: [
          { label: 'Orthogonality', tex: '\\cos\\theta = 0 \\implies \\theta = 90^\\circ', note: 'Perpendicular vectors.' },
        ],
      },
    ],
  },
  'pc-law-sines': {
    axiomVisuals: ['law-sines-circle', 'law-cosines-tri', 'oblique-area'],
    stepVisuals: ['law-cosines-tri', 'law-cosines-tri', 'law-sines-circle', 'oblique-area'],
    misconceptionPlot: 'cosines-missing-term',
    applicationVisual: 'law-sines-circle',
    applicationTag: 'Geodetic Triangulation',
  },
  'pc-parametric': {
    axiomVisuals: ['parametric-lissajous', 'projectile-arc', 'parametric-velocity'],
    stepVisuals: ['projectile-arc', 'projectile-arc', 'parametric-velocity', 'parametric-lissajous'],
    misconceptionPlot: 'parametric-speed-vs-path',
    applicationVisual: 'parametric-lissajous',
    applicationTag: 'Oscilloscope Harmonic Lock',
  },
  'pc-polar': {
    axiomVisuals: ['polar-coords', 'polar-rose', 'polar-spiral'],
    stepVisuals: ['polar-coords', 'polar-rose', 'polar-rose', 'polar-spiral'],
    misconceptionPlot: 'polar-neg-radius',
    applicationVisual: 'polar-rose',
    applicationTag: 'Directional Antenna Array',
    extraQuestions: [
      {
        id: 'pcpo-2',
        prompt: 'How many petals does the polar rose r = 4 cos(3θ) trace?',
        promptTex: 'n = 3 \\text{ (odd)} \\implies n \\text{ petals}',
        type: 'numeric',
        correctAnswer: 3,
        tolerance: 0.01,
        hint: 'Odd n yields n petals; even n yields 2n petals.',
        solutionSteps: [
          { label: 'Petal Rule', tex: 'n = 3 \\text{ odd} \\implies 3\\text{ petals}', note: 'Retraced cleanly.' },
        ],
      },
      {
        id: 'pcpo-3',
        prompt: 'Convert polar point (r = 6, θ = 0) into Cartesian x-coordinate.',
        promptTex: 'x = 6\\cos(0)',
        type: 'numeric',
        correctAnswer: 6,
        tolerance: 0.01,
        hint: 'cos(0) = 1.',
        solutionSteps: [
          { label: 'Polar → Cartesian', tex: '(6, 0) \\implies x = 6', note: 'On positive x-axis.' },
        ],
      },
    ],
  },
  'pc-conics': {
    axiomVisuals: ['ellipse-foci', 'hyperbola-asym', 'conic-eccentricity'],
    stepVisuals: ['ellipse-foci', 'ellipse-foci', 'conic-eccentricity', 'hyperbola-asym'],
    misconceptionPlot: 'conic-plus-vs-minus',
    applicationVisual: 'ellipse-foci',
    applicationTag: 'Kepler Planetary Orbits',
    extraQuestions: [
      {
        id: 'pcco-2',
        prompt: 'An ellipse has semi-major axis a = 5 and semi-minor axis b = 3. Find focal distance c = √(a² − b²).',
        promptTex: 'c = \\sqrt{5^2 - 3^2}',
        type: 'numeric',
        correctAnswer: 4,
        tolerance: 0.01,
        hint: '√(25 − 9) = √16.',
        solutionSteps: [
          { label: 'Ellipse Focus', tex: 'c = \\sqrt{16} = 4', note: 'Foci at (±4, 0).' },
        ],
      },
      {
        id: 'pcco-3',
        prompt: 'Which eccentricity range describes a closed ellipse (non-circle)?',
        type: 'multiple-choice',
        options: [
          { id: 'a', label: 'Range A', tex: '0 < e < 1' },
          { id: 'b', label: 'Range B', tex: 'e = 1' },
          { id: 'c', label: 'Range C', tex: 'e > 1' },
        ],
        correctAnswer: 'a',
        hint: 'e = 0 is a circle, e = 1 a parabola, e > 1 a hyperbola.',
        solutionSteps: [
          { label: 'Eccentricity Spectrum', tex: '0 < e < 1 \\implies \\text{Ellipse}', note: 'Bound celestial orbits.' },
        ],
      },
    ],
  },
  'pc-series': {
    axiomVisuals: ['series-square-split', 'series-staircase', 'series-diverge'],
    stepVisuals: ['series-square-split', 'series-staircase', 'series-square-split', 'series-diverge'],
    misconceptionPlot: 'series-diverge-r1',
    applicationVisual: 'series-staircase',
    applicationTag: 'Pharmacokinetic Dosing Equilibrium',
    extraQuestions: [
      {
        id: 'pcse-2',
        prompt: 'Find the infinite geometric sum 10 + 5 + 2.5 + 1.25 + …',
        promptTex: 'S_\\infty = \\dfrac{10}{1 - 0.5}',
        type: 'numeric',
        correctAnswer: 20,
        tolerance: 0.05,
        hint: 'Divide first term 10 by (1 − 0.5) = 0.5.',
        solutionSteps: [
          { label: 'Infinite Sum', tex: '10 / 0.5 = 20', note: 'Exact convergence.' },
        ],
      },
      {
        id: 'pcse-3',
        prompt: 'Does the infinite geometric series with r = 1.1 converge to a finite number?',
        type: 'multiple-choice',
        options: [
          { id: 'a', label: 'No — it diverges because |r| ≥ 1' },
          { id: 'b', label: 'Yes — it converges to a₁ / (−0.1)' },
        ],
        correctAnswer: 'a',
        hint: 'Terms grow larger forever instead of shrinking toward 0.',
        solutionSteps: [
          { label: 'Convergence Condition', tex: '|r| < 1 \\text{ required};\\; 1.1 > 1 \\text{ diverges}', note: 'Formula invalid when |r| ≥ 1.' },
        ],
      },
    ],
  },
  'pc-limits': {
    axiomVisuals: ['secant-to-tangent', 'limit-approach', 'continuity-hole'],
    stepVisuals: ['secant-to-tangent', 'secant-to-tangent', 'limit-approach', 'continuity-hole'],
    misconceptionPlot: 'limit-hole-vs-value',
    applicationVisual: 'secant-to-tangent',
    applicationTag: 'Instantaneous Rocket Velocity',
    extraQuestions: [
      {
        id: 'pcli-2',
        prompt: 'Evaluate lim (x → 3) of (x² − 9) / (x − 3).',
        promptTex: '\\lim_{x \\to 3} \\dfrac{(x - 3)(x + 3)}{x - 3}',
        type: 'numeric',
        correctAnswer: 6,
        tolerance: 0.01,
        hint: 'Factor numerator, cancel (x − 3), then substitute x = 3 into x + 3.',
        solutionSteps: [
          { label: 'Cancel Hole Factor', tex: '\\lim_{x \\to 3} (x + 3) = 6', note: 'Hole sits at (3, 6).' },
        ],
      },
      {
        id: 'pcli-3',
        prompt: 'For f(x) = x², what is the instantaneous derivative slope f′(4) = 2x at x = 4?',
        promptTex: 'f\'(4) = \\lim_{h \\to 0} \\dfrac{(4+h)^2 - 16}{h}',
        type: 'numeric',
        correctAnswer: 8,
        tolerance: 0.01,
        hint: 'Expand (4+h)² − 16 = 8h + h², divide by h, let h → 0.',
        solutionSteps: [
          { label: 'Difference Quotient Limit', tex: '\\lim_{h \\to 0}(8 + h) = 8', note: 'Exact tangent slope.' },
        ],
      },
    ],
  },
};
