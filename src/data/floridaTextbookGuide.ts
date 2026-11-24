import { PracticeQuestion } from '../components/PracticeEngine';
import { CourseId, FLDOE_SOURCES } from './standards';
import { EquationVisualKind } from '../visuals/equations/EquationMiniVisual';
import { TopicVisualId } from '../visuals/topics/TopicVisualCanvas';

export interface FloridaMtrHabit {
  code: string;
  number: number;
  shortTitle: string;
  title: string;
  teenHook: string;
  actionChecklist: string[];
}

export interface FloridaCourseTextbookMeta {
  courseId: CourseId;
  cpalmsCode: string;
  cpalmsUrl: string;
  b1gmLabel: string;
  eocBadge: string;
  audience: string;
  overview: string;
}

export interface FloridaTextbookChapter {
  id: string;
  courseId: CourseId;
  chapterNumber: number;
  title: string;
  subtitle: string;
  benchmarks: string[];
  mtrFocus: string;
  bigIdea: string;
  keyFormulas: { label: string; tex: string; visualKind: EquationVisualKind }[];
  interactiveTopicId: TopicVisualId;
  linkedLessonRoute: string;
  workedExample: {
    problem: string;
    problemTex: string;
    steps: { title: string; tex: string; note: string }[];
  };
  eocTrap: string;
  frontierConnection: string;
  checkQuestions: PracticeQuestion[];
}

export const FLORIDA_MTR_HABITS: FloridaMtrHabit[] = [
  {
    code: 'MA.K12.MTR.1.1',
    number: 1,
    shortTitle: 'Effortful Perseverance',
    title: 'Actively participate in effortful learning both individually and collectively.',
    teenHook:
      'Think like a game speedrunner: when your first strategy hits a wall, switch angles, ask sharp questions, and iterate instead of quitting.',
    actionChecklist: [
      'Break intimidating multi-step problems into one clean first move.',
      'Test small numbers when a symbolic formula feels abstract.',
      'Compare approaches with classmates to uncover faster routes.',
    ],
  },
  {
    code: 'MA.K12.MTR.2.1',
    number: 2,
    shortTitle: 'Multiple Representations',
    title: 'Demonstrate understanding by representing problems in multiple ways.',
    teenHook:
      'Every equation has a secret twin as a graph, a table, and a geometric picture — flip between them until the answer pops out.',
    actionChecklist: [
      'Sketch the graph or area model alongside every algebraic equation.',
      'Verify tables of values against symbolic rules.',
      'Choose the cleanest representation for the question at hand.',
    ],
  },
  {
    code: 'MA.K12.MTR.3.1',
    number: 3,
    shortTitle: 'Mathematical Fluency',
    title: 'Complete tasks with mathematical fluency.',
    teenHook:
      'Fluency is speed plus accuracy under pressure — knowing why a shortcut works so you execute without second-guessing.',
    actionChecklist: [
      'Pick efficient algebraic forms (vertex vs. factored vs. standard).',
      'Spot 3-4-5 and 5-12-13 Pythagorean triples and exact trig values fast.',
      'Check signs and units cleanly on every line.',
    ],
  },
  {
    code: 'MA.K12.MTR.4.1',
    number: 4,
    shortTitle: 'Reflective Discourse',
    title: 'Engage in discussions that reflect on the mathematical thinking of self and others.',
    teenHook:
      'Debug math like code review: explain why a theorem holds, catch hidden domain bugs in someone else’s proof, and defend your fix.',
    actionChecklist: [
      'Justify each step with an explicit theorem or algebraic property.',
      'Diagnose why common traps like (x + 3)² = x² + 9 fail geometrically.',
      'Compare two valid solution paths for clarity and speed.',
    ],
  },
  {
    code: 'MA.K12.MTR.5.1',
    number: 5,
    shortTitle: 'Patterns & Structure',
    title: 'Use patterns and structure to help understand and connect mathematical concepts.',
    teenHook:
      'Math isn’t 1,000 disconnected rules — it’s one interconnected lattice where factoring, complex rotations, and string harmonics share the same skeleton.',
    actionChecklist: [
      'Spot repeated sub-expressions and treat them as a single chunk.',
      'Track structural invariants preserved under transformations.',
      'Link Algebra 1 patterns forward to Precalculus and physics.',
    ],
  },
  {
    code: 'MA.K12.MTR.6.1',
    number: 6,
    shortTitle: 'Reasonableness Audit',
    title: 'Assess the reasonableness of solutions.',
    teenHook:
      'Run a sanity check before locking your answer: can a side length be negative, can sin(θ) beat 1, or did squaring sneak in a ghost root?',
    actionChecklist: [
      'Estimate bounds mentally before trusting a calculator output.',
      'Plug solutions back into the ORIGINAL equation to catch extraneous roots.',
      'Check context constraints (non-negative time, domain limits, units).',
    ],
  },
  {
    code: 'MA.K12.MTR.7.1',
    number: 7,
    shortTitle: 'Real-World Modeling',
    title: 'Apply mathematics to real-world contexts.',
    teenHook:
      'From rocket trajectories and neural networks to orbital mechanics and 6D Calabi-Yau physics, math is the source code of reality.',
    actionChecklist: [
      'Translate word descriptions into clear variables, units, and equations.',
      'Interpret slope, intercepts, asymptotes, and vertex values physically.',
      'Refine models when residual plots or measurements drift.',
    ],
  },
];

export const FLORIDA_COURSE_TEXTBOOK_META: Record<CourseId, FloridaCourseTextbookMeta> = {
  'algebra-1': {
    courseId: 'algebra-1',
    cpalmsCode: '1200310',
    cpalmsUrl: FLDOE_SOURCES.cpalmsAlg1.url,
    b1gmLabel: 'FL B.E.S.T. Algebra 1 · B1G-M Sequence',
    eocBadge: 'Florida Algebra 1 EOC Core',
    audience: 'Ages 12–15 · Foundation of Functions & Symbolic Reasoning',
    overview:
      'Seven progressive chapters covering algebraic equivalence, linear dynamics, inequalities, piecewise absolute value, exponential cascades, quadratic parabolas, and regression diagnostics.',
  },
  geometry: {
    courseId: 'geometry',
    cpalmsCode: '1206310',
    cpalmsUrl: FLDOE_SOURCES.cpalmsGeom.url,
    b1gmLabel: 'FL B.E.S.T. Geometry · B1G-M Sequence',
    eocBadge: 'Florida Geometry EOC Core',
    audience: 'Ages 13–16 · Spatial Proofs, Symmetry & 3D Measurement',
    overview:
      'Seven geometric chapters spanning transversal logic, rigid isometries, triangle congruence, dilation scale factors (k vs. k²), quadrilateral diagonals, right-triangle trig, circles, and 3D solids.',
  },
  'algebra-2': {
    courseId: 'algebra-2',
    cpalmsCode: '1200330',
    cpalmsUrl: FLDOE_SOURCES.cpalmsAlg2.url,
    b1gmLabel: 'FL B.E.S.T. Algebra 2 · B1G-M Sequence',
    eocBadge: 'College-Ready & STEM Bridge',
    audience: 'Ages 15–17 · Complex Numbers, Polynomials, Matrices & Probability',
    overview:
      'Seven advanced algebraic chapters unlocking the complex Argand plane, higher-degree multiplicity, nonlinear & matrix systems, inverses & logarithms, rational poles, combinatorics, and normal curves.',
  },
  precalculus: {
    courseId: 'precalculus',
    cpalmsCode: '1202340',
    cpalmsUrl: FLDOE_SOURCES.cpalmsPrecalc.url,
    b1gmLabel: 'FL B.E.S.T. Precalculus Honors · B1G-M Sequence',
    eocBadge: 'AP Calculus & Physics Readiness',
    audience: 'Ages 16–18 · Harmonics, Vectors, Conics & Calculus Limits',
    overview:
      'Seven honors chapters uniting unit-circle waves, trig identities, oblique laws, 2×2 matrix transformations, parametric motion, polar curves, conic orbits, infinite series, and limits.',
  },
};

export const FLORIDA_TEXTBOOK_CHAPTERS: FloridaTextbookChapter[] = [
  // ============================================================================
  // ALGEBRA 1 (1200310) — CHAPTERS 1..7
  // ============================================================================
  {
    id: 'alg1-ch1',
    courseId: 'algebra-1',
    chapterNumber: 1,
    title: 'Algebraic Structure, Equivalent Forms & Rational Exponents',
    subtitle: 'Decoding polynomials, literal formulas, and fractional power rules',
    benchmarks: ['MA.912.AR.1', 'MA.912.AR.1.1', 'MA.912.AR.1.2', 'MA.912.NSO.1.1', 'MA.912.NSO.1.2'],
    mtrFocus: 'MA.K12.MTR.5.1 · Patterns & Structure',
    bigIdea:
      'Rewriting an expression doesn’t change its value — it changes what you can see! Factoring turns an area sum into side lengths (x + p)(x + q), while fractional exponents turn roots into clean powers.',
    keyFormulas: [
      { label: 'Area Factorization', tex: 'x^2 + (p+q)x + pq = (x+p)(x+q)', visualKind: 'area-factor' },
      { label: 'Difference of Squares', tex: 'a^2 - b^2 = (a - b)(a + b)', visualKind: 'diff-squares' },
      { label: 'Rational Exponent Bridge', tex: 'x^{m/n} = \\left(\\sqrt[n]{x}\\right)^m', visualKind: 'rational-exponent' },
    ],
    interactiveTopicId: 'a1-expressions',
    linkedLessonRoute: '/lesson/a1-expressions',
    workedExample: {
      problem:
        'A rectangle has area A(x) = x² + 8x + 15. Factor to find its side dimensions, then rearrange A = LW to solve for W when L = x + 5.',
      problemTex: 'A(x) = x^2 + 8x + 15, \\qquad W = \\dfrac{A}{L}',
      steps: [
        {
          title: 'Find Sum-Product Pair',
          tex: 'p + q = 8, \\qquad p \\cdot q = 15 \\implies p = 3,\\; q = 5',
          note: 'Test factor pairs of 15: 1+15 = 16, while 3+5 = 8 hits the middle coefficient.',
        },
        {
          title: 'Factor Into Side Lengths',
          tex: 'A(x) = (x + 3)(x + 5)',
          note: 'Geometrically decomposes the rectangle into x², 3x, 5x, and 15 tiles.',
        },
        {
          title: 'Isolate Literal Width W',
          tex: 'W = \\dfrac{(x + 3)(x + 5)}{x + 5} = x + 3 \\quad (x \\ne -5)',
          note: 'Dividing total area by length L = x + 5 reveals width W = x + 3.',
        },
      ],
    },
    eocTrap:
      'The Freshman’s Dream: students write (x + 4)² = x² + 16 and forget the two 4x side wings (+8x). Always expand (x + 4)(x + 4) = x² + 8x + 16.',
    frontierConnection:
      'In String Theory and quantum field theory, physicists factor high-dimensional polynomial scattering amplitudes into symmetric pieces just like (x + p)(x + q) to expose hidden conservation laws!',
    checkQuestions: [
      {
        id: 'fl-a1-c1-q1',
        prompt: 'Rearrange the kinetic energy formula K = ½mv² to solve for v² in terms of K and m. If K = 90 J and m = 5 kg, what is v (positive speed)?',
        promptTex: '90 = \\tfrac{1}{2}(5)v^2',
        type: 'numeric',
        correctAnswer: 6,
        tolerance: 0.05,
        unitLabel: 'm/s',
        hint: 'First isolate v² = 2K / m, then take the positive square root.',
        visualKind: 'rational-exponent',
        solutionSteps: [
          { label: 'Isolate Literal Variable v²', tex: '2K = mv^2 \\implies v^2 = \\dfrac{2K}{m}', note: 'Multiply both sides by 2, then divide by mass m.' },
          { label: 'Substitute K = 90 and m = 5', tex: 'v^2 = \\dfrac{2(90)}{5} = \\dfrac{180}{5} = 36', note: 'Clean integer before taking the root.' },
          { label: 'Take Positive Speed', tex: 'v = \\sqrt{36} = 6\\text{ m/s}', note: 'Speed is non-negative.' },
        ],
      },
      {
        id: 'fl-a1-c1-q2',
        prompt: 'Which expression is equivalent to (x − 6)(x + 6) + 36?',
        promptTex: '(x - 6)(x + 6) + 36',
        type: 'multiple-choice',
        options: [
          { id: 'a', label: 'Equivalent A', tex: 'x^2' },
          { id: 'b', label: 'Equivalent B', tex: 'x^2 + 72' },
          { id: 'c', label: 'Equivalent C', tex: 'x^2 - 12x' },
          { id: 'd', label: 'Equivalent D', tex: 'x^2 + 12x' },
        ],
        correctAnswer: 'a',
        hint: 'Apply difference of squares (x − 6)(x + 6) = x² − 36 first.',
        visualKind: 'diff-squares',
        solutionSteps: [
          { label: 'Expand Difference of Squares', tex: '(x - 6)(x + 6) = x^2 - 36', note: 'Middle terms −6x and +6x cancel.' },
          { label: 'Combine Constant Terms', tex: '(x^2 - 36) + 36 = x^2', note: 'Constants cancel cleanly to leave x².' },
        ],
      },
    ],
  },
  {
    id: 'alg1-ch2',
    courseId: 'algebra-1',
    chapterNumber: 2,
    title: 'Linear Functions, Constant Slope & Rate of Change',
    subtitle: 'Connecting tables, graphs, slope triangles, and real-world rates',
    benchmarks: ['MA.912.AR.2.1', 'MA.912.AR.2.2', 'MA.912.AR.2.4', 'MA.912.F.1.3'],
    mtrFocus: 'MA.K12.MTR.2.1 · Multiple Representations',
    bigIdea:
      'A linear function moves at a steady rhythm: every equal horizontal step Δx delivers the exact same vertical jump Δy = m·Δx — making every slope triangle along the line mathematically similar.',
    keyFormulas: [
      { label: 'Slope Rate of Change', tex: 'm = \\dfrac{y_2 - y_1}{x_2 - x_1} = \\dfrac{\\Delta y}{\\Delta x}', visualKind: 'slope-triangle' },
      { label: 'Slope-Intercept Form', tex: 'f(x) = mx + b', visualKind: 'slope-intercept' },
      { label: 'Point-Slope Form', tex: 'y - y_1 = m(x - x_1)', visualKind: 'point-slope' },
    ],
    interactiveTopicId: 'a1-linear',
    linkedLessonRoute: '/lesson/a1-linear',
    workedExample: {
      problem:
        'A rocket booster burns fuel at a constant rate: 1,400 kg remain at t = 2 s and 650 kg remain at t = 7 s. Find the burn rate and predict when fuel hits 0 kg.',
      problemTex: '(2, 1400) \\quad \\text{and} \\quad (7, 650)',
      steps: [
        {
          title: 'Compute Constant Slope m',
          tex: 'm = \\dfrac{650 - 1400}{7 - 2} = \\dfrac{-750}{5} = -150\\text{ kg/s}',
          note: 'Negative slope confirms fuel decreases by 150 kg every second.',
        },
        {
          title: 'Anchor Initial Fuel b via Point-Slope',
          tex: 'M(t) - 1400 = -150(t - 2) \\implies M(t) = -150t + 1700',
          note: 'At t = 0 launch, the tank held 1,700 kg.',
        },
        {
          title: 'Solve x-Intercept (Empty Tank)',
          tex: '0 = -150t + 1700 \\implies t = \\dfrac{1700}{150} \\approx 11.33\\text{ s}',
          note: 'Horizontal intercept marks exact fuel burnout time.',
        },
      ],
    },
    eocTrap:
      'Flipping Rise over Run into Run over Rise (Δx / Δy) or mismatching subtraction order like (y₂ − y₁) / (x₁ − x₂), which flips the sign of slope!',
    frontierConnection:
      'Linear functions are the local building blocks of Calculus and AI: zoom close enough onto any smooth curve in spacetime, and a tangent line y = mx + b approximates its exact physics.',
    checkQuestions: [
      {
        id: 'fl-a1-c2-q1',
        prompt: 'A line passes through (3, 11) and (8, 31). What is the y-intercept b of its equation y = mx + b?',
        promptTex: 'm = \\dfrac{31 - 11}{8 - 3}, \\qquad 11 = m(3) + b',
        type: 'numeric',
        correctAnswer: -1,
        tolerance: 0.01,
        hint: 'Find slope m first, then plug (3, 11) into y = mx + b.',
        visualKind: 'slope-intercept',
        solutionSteps: [
          { label: 'Calculate Slope m', tex: 'm = \\dfrac{31 - 11}{8 - 3} = \\dfrac{20}{5} = 4', note: 'Output grows by 4 per unit x.' },
          { label: 'Solve for Intercept b', tex: '11 = 4(3) + b \\implies 11 = 12 + b \\implies b = -1', note: 'Line equation is y = 4x − 1.' },
        ],
      },
      {
        id: 'fl-a1-c2-q2',
        prompt: 'In an elevator model h(t) = 18 + 3.5t (height in meters, t in seconds), what does 18 represent physically?',
        type: 'multiple-choice',
        options: [
          { id: 'a', label: 'The starting height (18 m) at time t = 0 seconds' },
          { id: 'b', label: 'The climb speed in meters per second' },
          { id: 'c', label: 'The total travel time in seconds' },
          { id: 'd', label: 'The height reached after 10 seconds' },
        ],
        correctAnswer: 'a',
        hint: 'Evaluate h(0) to see what the constant term b means at the start.',
        visualKind: 'point-slope',
        solutionSteps: [
          { label: 'Evaluate at t = 0', tex: 'h(0) = 18 + 3.5(0) = 18\\text{ m}', note: 'The y-intercept gives the initial state.' },
          { label: 'Identify Slope Role', tex: 'm = 3.5\\text{ m/s}', note: '3.5 is the ascent speed, while 18 is starting altitude.' },
        ],
      },
    ],
  },
  {
    id: 'alg1-ch3',
    courseId: 'algebra-1',
    chapterNumber: 3,
    title: 'Systems of Equations & Feasible Linear Inequalities',
    subtitle: 'Solving simultaneous constraints and mapping viable shaded zones',
    benchmarks: ['MA.912.AR.9.1', 'MA.912.AR.2.6', 'MA.912.AR.2.8', 'MA.912.AR.9.4', 'MA.912.AR.9.6'],
    mtrFocus: 'MA.K12.MTR.6.1 · Reasonableness Audit',
    bigIdea:
      'One equation draws a thin 1D line of solutions; two equations lock onto a single crossing point (x*, y*); inequalities open up entire 2D shaded regions of viable choices!',
    keyFormulas: [
      { label: 'System Intersection', tex: 'L_1(x^*, y^*) = 0 \\;\\land\\; L_2(x^*, y^*) = 0', visualKind: 'line-intersection' },
      { label: 'Feasible Half-Plane Wedge', tex: 'y \\ge m_1 x + b_1 \\;\\land\\; y < m_2 x + b_2', visualKind: 'feasible-wedge' },
      { label: 'Strict Dashed Boundary', tex: 'y > mx + b \\;\\text{(boundary excluded)}', visualKind: 'boundary-dashed' },
    ],
    interactiveTopicId: 'a1-systems',
    linkedLessonRoute: '/lesson/a1-systems',
    workedExample: {
      problem:
        'A coding camp buys x microcontrollers ($12 each) and y sensor kits ($8 each) with at most $120, needing at least 11 total devices: 12x + 8y ≤ 120 and x + y ≥ 11. Find the maximum microcontrollers x possible.',
      problemTex: '12x + 8y \\le 120 \\quad \\land \\quad x + y \\ge 11',
      steps: [
        {
          title: 'Intersect Boundary Lines to Find Vertex',
          tex: 'y = 11 - x \\implies 12x + 8(11 - x) = 120',
          note: 'Optimal corners always occur where constraint boundaries cross.',
        },
        {
          title: 'Solve Corner Equation for x',
          tex: '12x + 88 - 8x = 120 \\implies 4x = 32 \\implies x = 8',
          note: 'At x = 8, y = 11 − 8 = 3 devices.',
        },
        {
          title: 'Verify Both Constraints at (8, 3)',
          tex: '12(8) + 8(3) = 96 + 24 = 120 \\;(\\checkmark), \\quad 8 + 3 = 11 \\;(\\checkmark)',
          note: '8 microcontrollers + 3 sensor kits hits the exact boundary corner.',
        },
      ],
    },
    eocTrap:
      'Forgetting to FLIP the inequality direction (< to >) when multiplying or dividing by a negative number — and plotting strict > or < as a solid line instead of dashed.',
    frontierConnection:
      'Linear programming over high-dimensional inequality wedges powers airline flight routing, GPU chip allocation, and simplex optimization in operations research.',
    checkQuestions: [
      {
        id: 'fl-a1-c3-q1',
        prompt: 'Solve the system 3x + 2y = 22 and x − 2y = 2. What is x + y?',
        promptTex: '\\begin{cases} 3x + 2y = 22 \\\\ x - 2y = 2 \\end{cases}',
        type: 'numeric',
        correctAnswer: 8,
        tolerance: 0.01,
        hint: 'Add both equations to cancel +2y and −2y, solve x, then find y.',
        visualKind: 'linear-pencil',
        solutionSteps: [
          { label: 'Eliminate y by Addition', tex: '(3x + x) + (2y - 2y) = 22 + 2 \\implies 4x = 24 \\implies x = 6', note: 'Opposite y coefficients vanish cleanly.' },
          { label: 'Back-Substitute for y', tex: '6 - 2y = 2 \\implies 2y = 4 \\implies y = 2', note: 'Intersection point is (6, 2).' },
          { label: 'Sum x + y', tex: 'x + y = 6 + 2 = 8', note: 'Verify: 3(6) + 2(2) = 22 ✓.' },
        ],
      },
      {
        id: 'fl-a1-c3-q2',
        prompt: 'Which ordered pair lies inside the feasible region of y > 2x − 1 AND x + y ≤ 8?',
        type: 'multiple-choice',
        options: [
          { id: 'a', label: '(2, 5)' },
          { id: 'b', label: '(3, 5)' },
          { id: 'c', label: '(5, 4)' },
          { id: 'd', label: '(4, 6)' },
        ],
        correctAnswer: 'a',
        hint: 'Test each pair in BOTH inequalities; watch out for strict > on the first inequality!',
        visualKind: 'feasible-wedge',
        solutionSteps: [
          { label: 'Audit Option (3, 5)', tex: '5 > 2(3) - 1 = 5 \\implies 5 > 5 \\text{ FALSE}', note: '(3, 5) sits on the excluded dashed line.' },
          { label: 'Audit Option (2, 5)', tex: '5 > 2(2) - 1 = 3 \\;(\\checkmark) \\quad \\land \\quad 2 + 5 = 7 \\le 8 \\;(\\checkmark)', note: 'Satisfies both constraints cleanly.' },
        ],
      },
    ],
  },
  {
    id: 'alg1-ch4',
    courseId: 'algebra-1',
    chapterNumber: 4,
    title: 'Absolute Value, Piecewise Curves & Function Transformations',
    subtitle: 'Measuring unsigned distance |x − h| and shifting any parent graph f(x)',
    benchmarks: ['MA.912.AR.4.1', 'MA.912.AR.4.3', 'MA.912.F.1.1', 'MA.912.F.1.2', 'MA.912.F.2.1'],
    mtrFocus: 'MA.K12.MTR.2.1 · Multiple Representations',
    bigIdea:
      'Every absolute value graph f(x) = a|x − h| + k is a symmetric V built from two linear rays meeting at (h, k), and every function f(x − h) + k shifts identically!',
    keyFormulas: [
      { label: 'Absolute Value Vertex Form', tex: 'f(x) = a|x - h| + k, \\quad V = (h, k)', visualKind: 'abs-v-shift' },
      { label: 'Tolerance Distance Interval', tex: '|x - c| \\le d \\iff c - d \\le x \\le c + d', visualKind: 'abs-distance' },
      { label: 'Piecewise Step Stitching', tex: 'f(x) = \\begin{cases} g_1(x) & x < c \\\\ g_2(x) & x \\ge c \\end{cases}', visualKind: 'piecewise-step' },
    ],
    interactiveTopicId: 'a1-abs-piecewise',
    linkedLessonRoute: '/lesson/a1-abs-piecewise',
    workedExample: {
      problem:
        'A CNC aluminum wing spar must have thickness t solving |2t − 24| = 0.8 (in mm) at the boundary limits. Find both allowable extreme thicknesses.',
      problemTex: '|2t - 24| = 0.8',
      steps: [
        {
          title: 'Factor Out 2 or Split Directly',
          tex: '2t - 24 = +0.8 \\qquad \\text{or} \\qquad 2t - 24 = -0.8',
          note: 'Absolute value equations split into positive and negative target branches.',
        },
        {
          title: 'Solve Both Linear Equations',
          tex: '2t = 24.8 \\implies t = 12.4\\text{ mm}; \\qquad 2t = 23.2 \\implies t = 11.6\\text{ mm}',
          note: 'Notice both lie symmetrically ±0.4 mm from 12.0 mm.',
        },
        {
          title: 'Interpret Tolerance Band',
          tex: '11.6\\text{ mm} \\le t \\le 12.4\\text{ mm}',
          note: 'Any thickness inside this band passes aerospace inspection.',
        },
      ],
    },
    eocTrap:
      'Thinking f(x + 3) shifts RIGHT by 3! Replacing x with (x + 3) = (x − (−3)) shifts the graph LEFT to h = −3 because x + 3 hits zero at x = −3.',
    frontierConnection:
      'Inside modern AI neural networks, the ubiquitous ReLU activation function ReLU(x) = max(0, x) = ½(x + |x|) is literally a shifted absolute-value piecewise bend!',
    checkQuestions: [
      {
        id: 'fl-a1-c4-q1',
        prompt: 'Solve 3|x − 2| + 1 = 16. Enter the SUM of the two real solutions.',
        promptTex: '3|x - 2| + 1 = 16',
        type: 'numeric',
        correctAnswer: 4,
        tolerance: 0.01,
        hint: 'First isolate |x − 2| = 5, find both roots, then add them (or notice symmetry about x = 2!).',
        visualKind: 'abs-distance',
        solutionSteps: [
          { label: 'Isolate Absolute Value', tex: '3|x - 2| = 15 \\implies |x - 2| = 5', note: 'Subtract 1, then divide by 3.' },
          { label: 'Solve Both Symmetric Roots', tex: 'x - 2 = \\pm 5 \\implies x = 7 \\text{ and } x = -3', note: 'Both lie 5 units from center 2.' },
          { label: 'Sum Solutions', tex: '7 + (-3) = 4', note: 'Symmetric pair around h = 2 always sums to 2h = 4!' },
        ],
      },
      {
        id: 'fl-a1-c4-q2',
        prompt: 'Compared to f(x) = |x|, how does g(x) = |x − 4| − 7 shift the vertex?',
        type: 'multiple-choice',
        options: [
          { id: 'a', label: '4 units RIGHT and 7 units DOWN to (4, −7)' },
          { id: 'b', label: '4 units LEFT and 7 units DOWN to (−4, −7)' },
          { id: 'c', label: '4 units RIGHT and 7 units UP to (4, 7)' },
          { id: 'd', label: '4 units LEFT and 7 units UP to (−4, 7)' },
        ],
        correctAnswer: 'a',
        hint: 'Match g(x) = |x − h| + k directly: h = +4 and k = −7.',
        visualKind: 'abs-v-shift',
        solutionSteps: [
          { label: 'Identify Parameters (h, k)', tex: 'x - 4 = 0 \\implies h = +4, \\qquad k = -7', note: 'Horizontal shift opposes sign inside; vertical shift keeps sign.' },
          { label: 'Locate New Vertex', tex: '(0, 0) \\mapsto (4, -7)', note: '4 right, 7 down.' },
        ],
      },
    ],
  },
  {
    id: 'alg1-ch5',
    courseId: 'algebra-1',
    chapterNumber: 5,
    title: 'Numerical Radicals & Exponential Growth / Decay',
    subtitle: 'Multiplicative compounding a·bˣ, percent rates, and asymptotes',
    benchmarks: ['MA.912.NSO.1.4', 'MA.912.AR.5', 'MA.912.AR.5.3', 'MA.912.AR.5.4', 'MA.912.AR.5.6'],
    mtrFocus: 'MA.K12.MTR.7.1 · Real-World Modeling',
    bigIdea:
      'Linear functions add a constant each step; exponential functions MULTIPLY by a constant factor b = 1 + r each step — turning tiny percent rates into massive curves.',
    keyFormulas: [
      { label: 'Exponential Growth (b > 1)', tex: 'f(t) = a(1 + r)^t', visualKind: 'exp-growth' },
      { label: 'Exponential Decay (0 < b < 1)', tex: 'f(t) = a(1 - r)^t', visualKind: 'exp-decay' },
      { label: 'Horizontal Asymptote', tex: 'y = k \\quad (\\text{tail of } a\\cdot b^x + k)', visualKind: 'exp-asymptote' },
    ],
    interactiveTopicId: 'a1-exponential',
    linkedLessonRoute: '/lesson/a1-exponential',
    workedExample: {
      problem:
        'A $2,400 gaming laptop depreciates by 15% per year. Write V(t) and compute its value after 2 years, plus simplify √72 as an exact radical.',
      problemTex: 'V(t) = 2400(1 - 0.15)^t, \\qquad \\sqrt{72} = \\sqrt{36 \\cdot 2}',
      steps: [
        {
          title: 'Build Exponential Decay Factor b',
          tex: 'b = 1 - 0.15 = 0.85 \\implies V(t) = 2400(0.85)^t',
          note: 'Losing 15% each year retains 85% of the prior value.',
        },
        {
          title: 'Evaluate Value at t = 2 Years',
          tex: 'V(2) = 2400(0.85)^2 = 2400(0.7225) = \\$1{,}734',
          note: 'Multiplicative decay slows down rather than dropping to zero linearly.',
        },
        {
          title: 'Simplify Numerical Radical √72',
          tex: '\\sqrt{72} = \\sqrt{36 \\cdot 2} = 6\\sqrt{2}',
          note: 'Pull out the largest perfect square factor 36 = 6².',
        },
      ],
    },
    eocTrap:
      'Writing a 12% decay model as f(t) = a(0.12)^t instead of a(1 − 0.12)^t = a(0.88)^t — losing 12% means you KEEP 88%!',
    frontierConnection:
      'Radioactive half-life clocks in astrophysics, Moore’s law in semiconductors, and epidemic growth curves all obey y = a·bˣ scaling.',
    checkQuestions: [
      {
        id: 'fl-a1-c5-q1',
        prompt: 'A streaming channel starts with 500 subscribers and grows by 20% each month: S(t) = 500(1.2)^t. How many subscribers does it have at t = 2 months?',
        promptTex: 'S(2) = 500(1.2)^2',
        type: 'numeric',
        correctAnswer: 720,
        tolerance: 0.1,
        unitLabel: 'subscribers',
        hint: 'Square 1.2 to get 1.44, then multiply by 500.',
        visualKind: 'exp-growth',
        solutionSteps: [
          { label: 'Square Growth Multiplier', tex: '(1.2)^2 = 1.44', note: 'Month 2 compounds on Month 1’s gain.' },
          { label: 'Multiply by Initial 500', tex: '500 \\cdot 1.44 = 720', note: '720 subscribers after 2 months.' },
        ],
      },
      {
        id: 'fl-a1-c5-q2',
        prompt: 'Simplify 3√8 + √18 into k√2. What is the integer coefficient k?',
        promptTex: '3\\sqrt{8} + \\sqrt{18} = k\\sqrt{2}',
        type: 'numeric',
        correctAnswer: 9,
        tolerance: 0.01,
        hint: 'Simplify √8 = 2√2 and √18 = 3√2, then combine like radicals.',
        visualKind: 'exponent-product',
        solutionSteps: [
          { label: 'Extract Perfect Squares', tex: '3\\sqrt{4\\cdot 2} + \\sqrt{9\\cdot 2} = 3(2\\sqrt{2}) + 3\\sqrt{2}', note: 'Both reduce to multiples of √2.' },
          { label: 'Combine Like Radicals', tex: '6\\sqrt{2} + 3\\sqrt{2} = 9\\sqrt{2} \\implies k = 9', note: 'Coefficients add once radicands match.' },
        ],
      },
    ],
  },
  {
    id: 'alg1-ch6',
    courseId: 'algebra-1',
    chapterNumber: 6,
    title: 'Quadratic Equations, Parabolas & Vertex Physics',
    subtitle: 'Three forms of a parabola, completing the square, and the discriminant',
    benchmarks: ['MA.912.AR.1.3', 'MA.912.AR.1.7', 'MA.912.AR.3.1', 'MA.912.AR.3.4', 'MA.912.AR.3.6', 'MA.912.AR.3.7', 'MA.912.AR.3.8', 'MA.912.F.1.8'],
    mtrFocus: 'MA.K12.MTR.3.1 · Mathematical Fluency',
    bigIdea:
      'Every quadratic has three outfits for three jobs: standard form reveals y-intercept c, factored form exposes zeros r₁ and r₂, and vertex form puts the turning point (h, k) on display.',
    keyFormulas: [
      { label: 'Vertex Form & Symmetry Axis', tex: 'f(x) = a(x - h)^2 + k, \\quad h = -\\dfrac{b}{2a}', visualKind: 'parabola-vertex' },
      { label: 'Quadratic Formula & Δ', tex: 'x = \\dfrac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}', visualKind: 'parabola-discriminant' },
      { label: 'Standard Form & Intercept', tex: 'f(x) = ax^2 + bx + c, \\quad f(0) = c', visualKind: 'parabola-standard' },
    ],
    interactiveTopicId: 'a2-quad-systems',
    linkedLessonRoute: '/lesson/quadratics',
    workedExample: {
      problem:
        'A soccer ball’s height is h(t) = −5t² + 20t + 1 (meters, t in seconds). Complete the square or use h = −b/(2a) to find the peak height and the time it occurs.',
      problemTex: 'h(t) = -5t^2 + 20t + 1',
      steps: [
        {
          title: 'Locate Axis of Symmetry Time t*',
          tex: 't^* = -\\dfrac{b}{2a} = -\\dfrac{20}{2(-5)} = 2\\text{ s}',
          note: 'Vertex always sits centered between symmetric flight heights.',
        },
        {
          title: 'Evaluate Maximum Height h(2)',
          tex: 'h(2) = -5(2)^2 + 20(2) + 1 = -20 + 40 + 1 = 21\\text{ m}',
          note: 'Since a = −5 < 0, the parabola opens downward with a global peak.',
        },
        {
          title: 'Confirm in Vertex Form',
          tex: 'h(t) = -5(t - 2)^2 + 21',
          note: 'Peak vertex is (2, 21) and launch height at t = 0 is 1 m.',
        },
      ],
    },
    eocTrap:
      'Dropping the negative sign in h = −b / (2a), or writing x = −b ± √Δ / 2a instead of dividing the ENTIRE numerator by 2a!',
    frontierConnection:
      'Curved gravitational wells, optimal parabolic dish reflectors for deep-space telescopes, and quadratic Taylor approximations of potential energy in physics all run on ax² + bx + c.',
    checkQuestions: [
      {
        id: 'fl-a1-c6-q1',
        prompt: 'A parabola has vertex (3, −8) and passes through (5, 0). What is the leading coefficient a in f(x) = a(x − 3)² − 8?',
        promptTex: '0 = a(5 - 3)^2 - 8',
        type: 'numeric',
        correctAnswer: 2,
        tolerance: 0.01,
        hint: 'Substitute (5, 0) into vertex form and solve 4a − 8 = 0.',
        visualKind: 'parabola-vertex',
        solutionSteps: [
          { label: 'Substitute Known Point (5, 0)', tex: '0 = a(5 - 3)^2 - 8 = 4a - 8', note: 'Vertex (3, −8) sets h = 3 and k = −8.' },
          { label: 'Solve for Stretch Factor a', tex: '4a = 8 \\implies a = 2', note: 'Equation is f(x) = 2(x − 3)² − 8.' },
        ],
      },
      {
        id: 'fl-a1-c6-q2',
        prompt: 'How many REAL x-intercepts does f(x) = 2x² − 4x + 5 have?',
        promptTex: '\\Delta = (-4)^2 - 4(2)(5)',
        type: 'numeric',
        correctAnswer: 0,
        tolerance: 0.01,
        hint: 'Compute discriminant Δ = b² − 4ac and check its sign.',
        visualKind: 'parabola-discriminant',
        solutionSteps: [
          { label: 'Compute Discriminant Δ', tex: '\\Delta = (-4)^2 - 4(2)(5) = 16 - 40 = -24', note: 'Negative Δ means no real square root.' },
          { label: 'Count Real Zeros', tex: '\\Delta < 0 \\implies 0 \\text{ real x-intercepts}', note: 'The upward parabola stays strictly above the x-axis.' },
        ],
      },
    ],
  },
  {
    id: 'alg1-ch7',
    courseId: 'algebra-1',
    chapterNumber: 7,
    title: 'Bivariate Statistics, Linear Regression & Two-Way Data',
    subtitle: 'Fitting trend lines, auditing residuals, and avoiding correlation traps',
    benchmarks: ['MA.912.DP.1.1', 'MA.912.DP.1.2', 'MA.912.DP.1.3', 'MA.912.DP.2.4', 'MA.912.DP.2.6', 'MA.912.DP.2.9', 'MA.912.DP.3.1'],
    mtrFocus: 'MA.K12.MTR.4.1 · Reflective Discourse',
    bigIdea:
      'Data science begins with residuals e = y − ŷ: a straight line fits bivariate data well only when correlation |r| is strong AND the residual plot scatters randomly without a curved U-pattern.',
    keyFormulas: [
      { label: 'Least-Squares Line of Fit', tex: '\\hat{y} = m x + b', visualKind: 'scatter-regression' },
      { label: 'Residual Error Definition', tex: 'e_i = y_{\\text{obs}} - \\hat{y}_{\\text{pred}}', visualKind: 'residual-squares' },
      { label: 'Correlation Strength r', tex: '-1 \\le r \\le 1, \\quad R^2 = r^2', visualKind: 'correlation-r' },
    ],
    interactiveTopicId: 'a1-statistics',
    linkedLessonRoute: '/lesson/a1-statistics',
    workedExample: {
      problem:
        'A coffee kiosk fits daily hot-cup sales as ŷ = 300 − 3x where x is temperature (°F). On an 80°F day, it sold 52 cups. Find the residual and interpret the slope.',
      problemTex: '\\hat{y}(80) = 300 - 3(80), \\qquad e = 52 - \\hat{y}(80)',
      steps: [
        {
          title: 'Compute Predicted Sales ŷ(80)',
          tex: '\\hat{y}(80) = 300 - 3(80) = 300 - 240 = 60\\text{ cups}',
          note: 'On an 80°F day, the linear model predicts 60 hot cups sold.',
        },
        {
          title: 'Compute Actual Minus Predicted Residual',
          tex: 'e = 52 - 60 = -8\\text{ cups}',
          note: 'Negative residual −8 means actual sales fell 8 cups below prediction.',
        },
        {
          title: 'Interpret Slope −3 in Context',
          tex: 'm = -3 \\implies \\text{Each }+1^\\circ\\text{F predicts } 3\\text{ fewer hot cups sold}',
          note: 'Slope always carries units of y per 1 unit of x.',
        },
      ],
    },
    eocTrap:
      'Claiming high correlation (like r = 0.94 between ice cream sales and shark sightings) proves causation! Both rise together because of a hidden lurking variable (summer temperature).',
    frontierConnection:
      'Minimizing squared residuals Σ(yᵢ − ŷᵢ)² is literally the Mean Squared Error (MSE) loss function used to train deep neural networks and weather models.',
    checkQuestions: [
      {
        id: 'fl-a1-c7-q1',
        prompt: 'A student’s two-way survey shows 36 out of 60 gamers prefer FPS games, and 24 prefer RPGs. What percentage of surveyed gamers prefer FPS games?',
        promptTex: '\\dfrac{36}{60} \\times 100\\%',
        type: 'numeric',
        correctAnswer: 60,
        tolerance: 0.1,
        unitLabel: '%',
        hint: 'Divide the conditional cell count 36 by the row total 60.',
        visualKind: 'correlation-r',
        solutionSteps: [
          { label: 'Form Relative Frequency', tex: '\\dfrac{36}{60} = \\dfrac{3}{5} = 0.60', note: 'Relative frequency out of 60 gamers.' },
          { label: 'Convert to Percentage', tex: '0.60 \\times 100\\% = 60\\%', note: '60% of gamers in the sample prefer FPS.' },
        ],
      },
      {
        id: 'fl-a1-c7-q2',
        prompt: 'If a regression model ŷ = 12x + 30 predicts y for x = 4, and the observed point is (4, 83), what is its residual e = y − ŷ?',
        promptTex: 'e = 83 - (12(4) + 30)',
        type: 'numeric',
        correctAnswer: 5,
        tolerance: 0.01,
        hint: 'Calculate predicted value ŷ(4) = 78 first, then subtract 83 − 78.',
        visualKind: 'residual-squares',
        solutionSteps: [
          { label: 'Compute Predicted ŷ(4)', tex: '\\hat{y}(4) = 12(4) + 30 = 48 + 30 = 78', note: 'Line sits at y = 78 when x = 4.' },
          { label: 'Subtract Actual − Predicted', tex: 'e = 83 - 78 = +5', note: 'Actual point lies 5 units above the line.' },
        ],
      },
    ],
  },

  // ============================================================================
  // GEOMETRY (1206310) — CHAPTERS 1..7
  // ============================================================================
  {
    id: 'geom-ch1',
    courseId: 'geometry',
    chapterNumber: 1,
    title: 'Deductive Reasoning, Parallel Lines & Angle Proofs',
    subtitle: 'Transversals, bisector constructions, and Euclidean angle theorems',
    benchmarks: ['MA.912.GR.1.1', 'MA.912.GR.5.1', 'MA.912.GR.5.2'],
    mtrFocus: 'MA.K12.MTR.4.1 · Reflective Discourse',
    bigIdea:
      'Parallel rails locked by one straight transversal freeze all eight angles into just two supplementary values α and 180° − α — the very trick Eratosthenes used to measure Earth’s size 2,200 years ago!',
    keyFormulas: [
      { label: 'Alternate Interior Theorem', tex: '\\ell_1 \\parallel \\ell_2 \\iff \\angle_{\\text{alt. int. 1}} \\cong \\angle_{\\text{alt. int. 2}}', visualKind: 'transversal-alt' },
      { label: 'Corresponding Postulate', tex: '\\ell_1 \\parallel \\ell_2 \\iff \\angle_1 \\cong \\angle_5', visualKind: 'transversal-corr' },
      { label: 'Linear Pair Supplement', tex: '\\alpha + \\beta = 180^\\circ', visualKind: 'linear-pair' },
    ],
    interactiveTopicId: 'g-parallel-angles',
    linkedLessonRoute: '/lesson/g-parallel-angles',
    workedExample: {
      problem:
        'Parallel beams ℓ₁ ∥ ℓ₂ are crossed by a transversal. Same-side interior angles measure (4x + 12)° and (6x − 22)°. Solve for x and find the smaller angle.',
      problemTex: '(4x + 12) + (6x - 22) = 180',
      steps: [
        {
          title: 'Set Same-Side Interior Sum to 180°',
          tex: '(4x + 12) + (6x - 22) = 180',
          note: 'Consecutive interior angles between parallel lines are supplementary, not equal.',
        },
        {
          title: 'Combine Like Terms & Solve x',
          tex: '10x - 10 = 180 \\implies 10x = 190 \\implies x = 19',
          note: 'Isolates x = 19 cleanly.',
        },
        {
          title: 'Evaluate Both Angles',
          tex: '4(19) + 12 = 88^\\circ, \\qquad 6(19) - 22 = 92^\\circ',
          note: 'Check: 88° + 92° = 180° ✓; smaller angle is 88°.',
        },
      ],
    },
    eocTrap:
      'Setting consecutive (same-side) interior angles EQUAL to each other instead of summing them to 180°!',
    frontierConnection:
      'Notice how Euclid’s Parallel Postulate locks triangle angles to 180° on a flat plane — in General Relativity and String Theory, curved spacetime breaks parallel rails so triangles sum above or below 180°!',
    checkQuestions: [
      {
        id: 'fl-g-c1-q1',
        prompt: 'Alternate exterior angles on parallel lines measure (5x − 8)° and (3x + 28)°. Find the angle measure in degrees.',
        promptTex: '5x - 8 = 3x + 28',
        type: 'numeric',
        correctAnswer: 82,
        tolerance: 0.1,
        unitLabel: '°',
        hint: 'Alternate exterior angles are congruent; solve for x first, then plug x back in.',
        visualKind: 'transversal-alt',
        solutionSteps: [
          { label: 'Equate Congruent Angles', tex: '5x - 8 = 3x + 28 \\implies 2x = 36 \\implies x = 18', note: 'Parallel lines guarantee alternate exterior congruence.' },
          { label: 'Compute Measure', tex: '5(18) - 8 = 90 - 8 = 82^\\circ', note: 'Verify: 3(18) + 28 = 82° ✓.' },
        ],
      },
      {
        id: 'fl-g-c1-q2',
        prompt: 'A compass-and-straightedge perpendicular bisector of segment AB guarantees every point P on that bisector satisfies which property?',
        type: 'multiple-choice',
        options: [
          { id: 'a', label: 'P is equidistant from endpoints A and B (PA = PB)' },
          { id: 'b', label: 'PA is always double PB' },
          { id: 'c', label: 'Angle APB is always 90°' },
          { id: 'd', label: 'P always lies directly on segment AB' },
        ],
        correctAnswer: 'a',
        hint: 'Think of the two congruent right triangles formed from midpoint M to A and B.',
        visualKind: 'midpoint-bisector',
        solutionSteps: [
          { label: 'Apply SAS Congruence', tex: 'AM \\cong BM,\\; \\angle PMA = \\angle PMB = 90^\\circ,\\; PM = PM', note: 'Right triangles △PMA and △PMB match.' },
          { label: 'Conclude Equidistance by CPCTC', tex: 'PA = PB', note: 'Defines the Voronoi boundary separating A and B.' },
        ],
      },
    ],
  },
  {
    id: 'geom-ch2',
    courseId: 'geometry',
    chapterNumber: 2,
    title: 'Rigid Motions, Reflections & Coordinate Symmetry',
    subtitle: 'Isometries preserving distance, rotational symmetry, and transformation sequences',
    benchmarks: ['MA.912.GR.2.1', 'MA.912.GR.2.2', 'MA.912.GR.2.3', 'MA.912.GR.2.6'],
    mtrFocus: 'MA.K12.MTR.5.1 · Patterns & Structure',
    bigIdea:
      'Rigid motions — translations, rotations, and reflections — glide or flip a shape without stretching a single millimeter, which is why congruence means "one figure maps onto another by rigid motion."',
    keyFormulas: [
      { label: 'Reflection Across y = x', tex: 'M_{y=x}(x, y) = (y, x)', visualKind: 'reflection-axis' },
      { label: '90° CCW Rotation', tex: 'R_{90^\\circ}(x, y) = (-y, x)', visualKind: 'rotation-arc' },
      { label: 'Rigid Congruence Law', tex: 'T(x, y) \\text{ is an isometry} \\implies d(A\', B\') = d(A, B)', visualKind: 'rigid-motion' },
    ],
    interactiveTopicId: 'g-transformations',
    linkedLessonRoute: '/lesson/g-transformations',
    workedExample: {
      problem:
        'A game ship at vertex P(3, −5) undergoes a reflection across the y-axis followed by a 180° rotation about the origin. Find its final coordinates.',
      problemTex: 'P(3, -5) \\xrightarrow{r_{y\\text{-axis}}} P\' \\xrightarrow{R_{180^\\circ}} P\'\'',
      steps: [
        {
          title: 'Reflect Across the y-Axis',
          tex: '(x, y) \\mapsto (-x, y) \\implies (3, -5) \\mapsto (-3, -5)',
          note: 'Horizontal reflection flips only the sign of x.',
        },
        {
          title: 'Rotate 180° Around Origin',
          tex: '(x, y) \\mapsto (-x, -y) \\implies (-3, -5) \\mapsto (3, 5)',
          note: '180° rotation negates both coordinates.',
        },
        {
          title: 'Notice Equivalent Single Symmetry',
          tex: 'R_{180^\\circ} \\circ r_{y\\text{-axis}} = r_{x\\text{-axis}}: (3, -5) \\mapsto (3, 5)',
          note: 'Composing two reflections or a reflection + 180° rotation reduces cleanly!',
        },
      ],
    },
    eocTrap:
      'Assuming transformation order never matters! Rotating 90° THEN translating gives a different landing spot than translating THEN rotating 90° around the origin.',
    frontierConnection:
      'Every conserved law of physics comes from a symmetry transformation (Noether’s Theorem): rotational symmetry creates angular momentum conservation, while gauge symmetry powers the Standard Model and String Theory.',
    checkQuestions: [
      {
        id: 'fl-g-c2-q1',
        prompt: 'A regular pentagon rotates counterclockwise around its center. What is the smallest positive rotation angle (in degrees) that maps the pentagon onto itself?',
        promptTex: '\\theta_{\\text{min}} = \\dfrac{360^\\circ}{5}',
        type: 'numeric',
        correctAnswer: 72,
        tolerance: 0.1,
        unitLabel: '°',
        hint: 'Divide a full 360° circle by the 5 congruent rotational symmetries of a regular pentagon.',
        visualKind: 'rotation-arc',
        solutionSteps: [
          { label: 'Count Rotational Symmetries', tex: 'n = 5\\text{ identical vertices}', note: 'A regular n-gon has order-n rotational symmetry.' },
          { label: 'Divide 360° by 5', tex: '\\dfrac{360^\\circ}{5} = 72^\\circ', note: 'Every multiple of 72° maps the pentagon onto itself.' },
        ],
      },
      {
        id: 'fl-g-c2-q2',
        prompt: 'Which transformation does NOT preserve segment lengths (is NOT a rigid motion)?',
        type: 'multiple-choice',
        options: [
          { id: 'a', label: 'Dilation by scale factor k = 1.5' },
          { id: 'b', label: 'Reflection across the line y = −x' },
          { id: 'c', label: 'Rotation by 270° clockwise' },
          { id: 'd', label: 'Translation by vector ⟨−6, 9⟩' },
        ],
        correctAnswer: 'a',
        hint: 'Reflections, rotations, and translations preserve length; scaling by k ≠ 1 stretches or shrinks lengths.',
        visualKind: 'dilation-rays',
        solutionSteps: [
          { label: 'Identify Isometries', tex: '\\text{Translations, Rotations, Reflections} \\implies d\' = d', note: 'All three keep distances identical.' },
          { label: 'Spot Length Stretch', tex: '(x, y) \\mapsto (1.5x, 1.5y) \\implies d\' = 1.5\\,d', note: 'Dilation k = 1.5 alters distances by 50%.' },
        ],
      },
    ],
  },
  {
    id: 'geom-ch3',
    courseId: 'geometry',
    chapterNumber: 3,
    title: 'Triangle Congruence, Postulates & Geometric Proofs',
    subtitle: 'Locking triangles with SSS, SAS, ASA, AAS, HL, and CPCTC',
    benchmarks: ['MA.912.GR.1.2', 'MA.912.GR.1.3'],
    mtrFocus: 'MA.K12.MTR.1.1 · Effortful Perseverance',
    bigIdea:
      'A triangle is the only polygon that cannot wobble once its 3 side lengths are pinned (SSS) — which is why every bridge truss, crane boom, and geodesic dome relies on triangles!',
    keyFormulas: [
      { label: 'Triangle Angle Sum', tex: '\\alpha + \\beta + \\gamma = 180^\\circ', visualKind: 'triangle-sum' },
      { label: 'Congruence Criteria', tex: '\\text{SSS, SAS, ASA, AAS, HL} \\implies \\triangle \\cong \\triangle', visualKind: 'triangle-congruence' },
      { label: 'Rigid Mapping Proof', tex: 'T_{\\vec{v}} \\circ R_\\theta (\\triangle ABC) = \\triangle A\'B\'C\'', visualKind: 'rigid-motion' },
    ],
    interactiveTopicId: 'g-triangles',
    linkedLessonRoute: '/lesson/g-triangles',
    workedExample: {
      problem:
        'In △ABC, exterior angle at vertex C measures 118°, and interior angle A measures 43°. Find interior angle B and classify △ABC by angles.',
      problemTex: '\\angle_{\\text{ext}}(C) = \\angle A + \\angle B = 118^\\circ',
      steps: [
        {
          title: 'Apply Exterior Angle Theorem',
          tex: '\\angle A + \\angle B = 118^\\circ \\implies 43^\\circ + \\angle B = 118^\\circ',
          note: 'An exterior angle equals the sum of the two remote interior angles.',
        },
        {
          title: 'Solve for Angle B',
          tex: '\\angle B = 118^\\circ - 43^\\circ = 75^\\circ',
          note: 'Remote interior angle B is 75°.',
        },
        {
          title: 'Check All Three Interior Angles',
          tex: '\\angle C = 180^\\circ - 118^\\circ = 62^\\circ; \\quad 43^\\circ + 75^\\circ + 62^\\circ = 180^\\circ',
          note: 'All angles < 90°, so △ABC is acute.',
        },
      ],
    },
    eocTrap:
      'Treating SSA (two sides and a NON-included angle) as a valid congruence rule! Only when the angle is 90° (Hypotenuse-Leg, HL) or INCLUDED between the two sides (SAS) is the triangle locked.',
    frontierConnection:
      '3D video games and string-theory discrete Regge calculus tessellate curved 3D surfaces and 6D spaces out of rigid triangular simplices (meshes) because triangles never deform ambiguously.',
    checkQuestions: [
      {
        id: 'fl-g-c3-q1',
        prompt: 'An exterior angle of a triangle measures 132° and one remote interior angle measures 57°. What is the other remote interior angle (in degrees)?',
        promptTex: '132^\\circ = 57^\\circ + x',
        type: 'numeric',
        correctAnswer: 75,
        tolerance: 0.1,
        unitLabel: '°',
        hint: 'An exterior angle equals the sum of the two non-adjacent (remote) interior angles.',
        visualKind: 'triangle-sum',
        solutionSteps: [
          { label: 'Apply Exterior Angle Theorem', tex: '\\angle_{\\text{ext}} = \\angle_1 + \\angle_2 \\implies 132^\\circ = 57^\\circ + x', note: 'Equivalently, adjacent interior is 48°, and 180 − (48 + 57) = 75.' },
          { label: 'Solve for x', tex: 'x = 132^\\circ - 57^\\circ = 75^\\circ', note: 'Exact measure.' },
        ],
      },
      {
        id: 'fl-g-c3-q2',
        prompt: 'Segments AC and BD bisect each other at point M. Which congruence postulate proves △ABM ≅ △CDM?',
        type: 'multiple-choice',
        options: [
          { id: 'a', label: 'SAS (Side-Angle-Side using vertical angles at M)' },
          { id: 'b', label: 'SSA (Side-Side-Angle)' },
          { id: 'c', label: 'HL (Hypotenuse-Leg without a right angle)' },
          { id: 'd', label: 'AAA (Angle-Angle-Angle)' },
        ],
        correctAnswer: 'a',
        hint: 'Bisection gives AM = CM and BM = DM, and the crossing at M creates vertical angles ∠AMB ≅ ∠CMD.',
        visualKind: 'triangle-congruence',
        solutionSteps: [
          { label: 'Identify Two Congruent Side Pairs', tex: 'AM \\cong CM, \\qquad BM \\cong DM', note: 'Definition of segment bisector.' },
          { label: 'Lock Included Vertical Angle', tex: '\\angle AMB \\cong \\angle CMD \\implies \\text{SAS}', note: 'The vertical angle sits directly between the two pairs of sides.' },
        ],
      },
    ],
  },
  {
    id: 'geom-ch4',
    courseId: 'geometry',
    chapterNumber: 4,
    title: 'Similarity, Dilations & Scale-Factor Geometry (k vs. k²)',
    subtitle: 'Proportional triangles, side-splitter rays, and quadratic area scaling',
    benchmarks: ['MA.912.GR.1.2', 'MA.912.GR.1.6', 'MA.912.GR.2.8', 'MA.912.GR.4.3'],
    mtrFocus: 'MA.K12.MTR.6.1 · Reasonableness Audit',
    bigIdea:
      'When you scale every side of a shape by factor k, perimeters and heights scale by k, surface area scales by k², and 3D volume scales by k³ — geometry’s universal scaling ladder!',
    keyFormulas: [
      { label: 'AA Similarity Proportion', tex: '\\triangle ABC \\sim \\triangle DEF \\implies \\dfrac{AB}{DE} = \\dfrac{BC}{EF} = \\dfrac{1}{k}', visualKind: 'similar-triangles' },
      { label: 'Area & Volume Scale Ladder', tex: 'L\' = kL,\\quad A\' = k^2 A,\\quad V\' = k^3 V', visualKind: 'area-scale-k2' },
      { label: 'Side-Splitter Theorem', tex: '\\overline{DE} \\parallel \\overline{BC} \\implies \\dfrac{AD}{DB} = \\dfrac{AE}{EC}', visualKind: 'side-splitter' },
    ],
    interactiveTopicId: 'g-similarity',
    linkedLessonRoute: '/lesson/g-similarity',
    workedExample: {
      problem:
        'A movie studio builds a 1 : 4 scale model (k = 4 going from model to full-size prop) of a spaceship fin. If the model fin has area 18 in² and volume 24 in³, find the full-size fin’s area and volume.',
      problemTex: 'k = 4 \\implies A\' = 4^2 A,\\quad V\' = 4^3 V',
      steps: [
        {
          title: 'Compute Surface Area Multiplier k²',
          tex: 'k^2 = 4^2 = 16 \\implies A_{\\text{full}} = 16 \\cdot 18 = 288\\text{ in}^2',
          note: 'Needs 16× as much paint as the scale model.',
        },
        {
          title: 'Compute 3D Volume Multiplier k³',
          tex: 'k^3 = 4^3 = 64 \\implies V_{\\text{full}} = 64 \\cdot 24 = 1{,}536\\text{ in}^3',
          note: 'Weighs 64× as much (the square-cube law!).',
        },
        {
          title: 'Audit Units',
          tex: '\\text{Area} \\propto \\text{in}^2,\\qquad \\text{Volume} \\propto \\text{in}^3',
          note: 'Exponents on units match exponents on scale factor k.',
        },
      ],
    },
    eocTrap:
      'Multiplying area by k instead of k² — or dividing smaller-to-larger wrong! Always label k = Image / Preimage before squaring or cubing.',
    frontierConnection:
      'Galileo’s Square-Cube Law explains why giant sci-fi monsters would collapse under their own k³ weight unless bones widened faster, and how renormalization group scaling works across physics scales.',
    checkQuestions: [
      {
        id: 'fl-g-c4-q1',
        prompt: 'Two similar cones have surface areas 20 cm² and 180 cm². What is the linear scale factor k from the smaller cone to the larger cone?',
        promptTex: 'k^2 = \\dfrac{180}{20}',
        type: 'numeric',
        correctAnswer: 3,
        tolerance: 0.01,
        hint: 'Divide the two areas to get k², then take the square root!',
        visualKind: 'area-scale-k2',
        solutionSteps: [
          { label: 'Find Area Ratio k²', tex: 'k^2 = \\dfrac{180}{20} = 9', note: 'Larger surface area is 9× the smaller.' },
          { label: 'Take Square Root for k', tex: 'k = \\sqrt{9} = 3', note: 'All heights and radii are 3× as large.' },
        ],
      },
      {
        id: 'fl-g-c4-q2',
        prompt: 'In △ABC, DE ∥ BC cuts sides AB and AC so AD = 6, DB = 3, and AE = 8. What is the full side length AC?',
        promptTex: '\\dfrac{AD}{DB} = \\dfrac{AE}{EC}, \\qquad AC = AE + EC',
        type: 'numeric',
        correctAnswer: 12,
        tolerance: 0.01,
        hint: 'Find EC = 4 via Side-Splitter 6/3 = 8/EC, then add AE + EC!',
        visualKind: 'side-splitter',
        solutionSteps: [
          { label: 'Solve EC by Side-Splitter', tex: '\\dfrac{6}{3} = \\dfrac{8}{EC} \\implies 2 = \\dfrac{8}{EC} \\implies EC = 4', note: 'Upper segment is twice lower segment.' },
          { label: 'Add AE + EC for Full Side AC', tex: 'AC = 8 + 4 = 12', note: 'Read carefully: question asks for total AC, not just EC!' },
        ],
      },
    ],
  },
  {
    id: 'geom-ch5',
    courseId: 'geometry',
    chapterNumber: 5,
    title: 'Polygons, Quadrilaterals & Coordinate Analytic Proofs',
    subtitle: 'Interior sums (n − 2)·180°, diagonal theorems, and slope/distance proofs',
    benchmarks: ['MA.912.GR.1.4', 'MA.912.GR.1.5', 'MA.912.GR.3.1', 'MA.912.GR.3.2', 'MA.912.GR.3.3', 'MA.912.GR.3.4'],
    mtrFocus: 'MA.K12.MTR.3.1 · Mathematical Fluency',
    bigIdea:
      'Put any quadrilateral on a coordinate grid and its DNA shows right away: equal midpoints prove a parallelogram, equal diagonal lengths prove a rectangle, and perpendicular slopes (m₁m₂ = −1) prove a rhombus!',
    keyFormulas: [
      { label: 'Polygon Angle Sum', tex: '\\Sigma \\angle_{\\text{int}} = (n - 2)\\cdot 180^\\circ', visualKind: 'polygon-angles' },
      { label: 'Diagonal Classification', tex: '\\text{Rect: } AC = BD,\\quad \\text{Rhombus: } AC \\perp BD', visualKind: 'quad-diagonals' },
      { label: 'Coordinate Distance & Slope', tex: 'd = \\sqrt{\\Delta x^2 + \\Delta y^2},\\quad m_1 m_2 = -1', visualKind: 'perp-slopes' },
    ],
    interactiveTopicId: 'g-quadrilaterals',
    linkedLessonRoute: '/lesson/g-quadrilaterals',
    workedExample: {
      problem:
        'Vertices A(0, 0), B(4, 2), C(6, 6), D(2, 4) form quadrilateral ABCD. Compute side lengths and diagonal slopes to classify ABCD precisely.',
      problemTex: 'A(0,0),\\; B(4,2),\\; C(6,6),\\; D(2,4)',
      steps: [
        {
          title: 'Compare Diagonals Midpoints',
          tex: 'M_{AC} = \\left(\\tfrac{0+6}{2}, \\tfrac{0+6}{2}\\right) = (3, 3), \\quad M_{BD} = \\left(\\tfrac{4+2}{2}, \\tfrac{2+4}{2}\\right) = (3, 3)',
          note: 'Shared midpoint proves ABCD is a parallelogram.',
        },
        {
          title: 'Check Perpendicularity of Diagonals AC and BD',
          tex: 'm_{AC} = \\dfrac{6-0}{6-0} = 1, \\qquad m_{BD} = \\dfrac{4-2}{2-4} = -1',
          note: 'Since m_AC · m_BD = −1, diagonals cross at 90° (rhombus!).',
        },
        {
          title: 'Test Diagonal Lengths for Rectangle/Square',
          tex: 'AC = \\sqrt{6^2 + 6^2} = \\sqrt{72}, \\qquad BD = \\sqrt{(-2)^2 + 2^2} = \\sqrt{8}',
          note: 'Since AC ≠ BD, corners are NOT 90° — so ABCD is strictly a non-square Rhombus!',
        },
      ],
    },
    eocTrap:
      'Assuming a quadrilateral with perpendicular diagonals is automatically a square — both a rhombus AND a kite have perpendicular diagonals without needing 90° corners!',
    frontierConnection:
      'Every curved 2D surface obeys the Gauss-Bonnet / Euler polygon formula V − E + F = χ, connecting triangle/polygon angle defects straight to the topology of Calabi-Yau manifolds in String Theory.',
    checkQuestions: [
      {
        id: 'fl-g-c5-q1',
        prompt: 'Find the perimeter of rectangle PQRS on the coordinate plane if two adjacent sides span from P(1, 2) to Q(4, 6) and Q(4, 6) to R(−4, 12).',
        promptTex: 'PQ = \\sqrt{3^2 + 4^2}, \\qquad QR = \\sqrt{(-8)^2 + 6^2}',
        type: 'numeric',
        correctAnswer: 30,
        tolerance: 0.1,
        hint: 'Compute side lengths PQ = 5 and QR = 10 using distance formula, then compute 2(PQ + QR).',
        visualKind: 'distance-norm',
        solutionSteps: [
          { label: 'Compute Side Lengths PQ and QR', tex: 'PQ = \\sqrt{3^2 + 4^2} = 5, \\qquad QR = \\sqrt{(-8)^2 + 6^2} = 10', note: 'Verify perpendicular slopes: (4/3)·(−6/8) = −1 ✓.' },
          { label: 'Compute Rectangle Perimeter', tex: 'P = 2(5 + 10) = 30', note: 'Opposite sides of a rectangle match.' },
        ],
      },
      {
        id: 'fl-g-c5-q2',
        prompt: 'What is the measure of ONE interior angle of a regular dodecagon (12-sided polygon) in degrees?',
        promptTex: '\\theta = \\dfrac{(12 - 2) \\cdot 180^\\circ}{12}',
        type: 'numeric',
        correctAnswer: 150,
        tolerance: 0.1,
        unitLabel: '°',
        hint: 'Either divide (12 − 2)·180° by 12, or subtract exterior angle 360°/12 = 30° from 180°.',
        visualKind: 'polygon-angles',
        solutionSteps: [
          { label: 'Find Exterior Angle First', tex: '\\theta_{\\text{ext}} = \\dfrac{360^\\circ}{12} = 30^\\circ', note: 'Fastest mental shortcut for any regular n-gon.' },
          { label: 'Subtract From 180°', tex: '\\theta_{\\text{int}} = 180^\\circ - 30^\\circ = 150^\\circ', note: 'Matches 10 · 180° / 12 = 150°.' },
        ],
      },
    ],
  },
  {
    id: 'geom-ch6',
    courseId: 'geometry',
    chapterNumber: 6,
    title: 'Right-Triangle Trigonometry, Pythagoras & Circle Geometry',
    subtitle: 'SOH-CAH-TOA, inscribed angles, tangents, arc sectors & circle equations',
    benchmarks: ['MA.912.T.1.1', 'MA.912.T.1.2', 'MA.912.GR.6.1', 'MA.912.GR.6.2', 'MA.912.GR.6.3', 'MA.912.GR.6.4', 'MA.912.GR.7.2', 'MA.912.GR.7.3'],
    mtrFocus: 'MA.K12.MTR.5.1 · Patterns & Structure',
    bigIdea:
      'Circles and right triangles are secretly the same geometry: placing a right triangle inside a circle creates the equation (x − h)² + (y − k)² = r², right-triangle trig ratios, and inscribed angle invariance!',
    keyFormulas: [
      { label: 'Pythagorean & Trig Ratios', tex: 'a^2 + b^2 = c^2,\\quad \\sin\\theta = \\dfrac{\\text{opp}}{\\text{hyp}}', visualKind: 'right-trig-ratios' },
      { label: 'Circle Equation', tex: '(x - h)^2 + (y - k)^2 = r^2', visualKind: 'chord-tangent' },
      { label: 'Inscribed & Sector Rules', tex: '\\theta_{\\text{ins}} = \\tfrac{1}{2}\\widehat{AB},\\quad A_{\\text{sec}} = \\tfrac{\\theta}{360^\\circ}\\pi r^2', visualKind: 'inscribed-angle' },
    ],
    interactiveTopicId: 'g-right-trig',
    linkedLessonRoute: '/lesson/g-right-trig',
    workedExample: {
      problem:
        'A lighthouse radar beam sits at center C(3, −2) with range r = 10 km. Determine its circle equation and test whether a ship at S(9, 6) lies on, inside, or outside the beam boundary.',
      problemTex: '(x - 3)^2 + (y + 2)^2 = 10^2',
      steps: [
        {
          title: 'Write Standard Circle Equation',
          tex: '(x - 3)^2 + (y + 2)^2 = 100',
          note: 'Notice y − (−2) becomes y + 2, and r² = 100.',
        },
        {
          title: 'Substitute Ship Coordinates S(9, 6)',
          tex: '(9 - 3)^2 + (6 + 2)^2 = 6^2 + 8^2 = 36 + 64 = 100',
          note: 'Left-hand side equals 100 (distance d = 10 km).',
        },
        {
          title: 'Classify Position',
          tex: 'd = 10 = r \\implies \\text{Ship lies ON the exact circle boundary}',
          note: 'Values < 100 lie inside; values > 100 lie outside.',
        },
      ],
    },
    eocTrap:
      'Forgetting that opposite angles of an inscribed quadrilateral are SUPPLEMENTARY (sum to 180°, NOT equal), or forgetting to take the square root of the right-hand side of (x − h)² + (y − k)² = r²!',
    frontierConnection:
      'Closed loops of vibrating strings wrap around circular extra dimensions of radius R — where arc length s = Rθ quantizes momentum modes into discrete particle masses!',
    checkQuestions: [
      {
        id: 'fl-g-c6-q1',
        prompt: 'Quadrilateral ABCD is inscribed inside a circle. If ∠A = 74° and ∠B = 102°, find ∠C (opposite ∠A) in degrees.',
        promptTex: '\\angle A + \\angle C = 180^\\circ',
        type: 'numeric',
        correctAnswer: 106,
        tolerance: 0.1,
        unitLabel: '°',
        hint: 'Opposite angles of any cyclic (inscribed) quadrilateral intercept the full 360° circle, so their inscribed angles sum to 180°.',
        visualKind: 'inscribed-angle',
        solutionSteps: [
          { label: 'Apply Inscribed Quadrilateral Theorem', tex: '\\angle A + \\angle C = \\tfrac{1}{2}(360^\\circ) = 180^\\circ', note: 'Opposite angles are always supplementary.' },
          { label: 'Solve for ∠C', tex: '\\angle C = 180^\\circ - 74^\\circ = 106^\\circ', note: 'Ignore ∠B = 102° — it pairs with ∠D = 78°.' },
        ],
      },
      {
        id: 'fl-g-c6-q2',
        prompt: 'A right triangle has angle θ = 30° and adjacent leg 12√3. What is the length of the hypotenuse?',
        promptTex: '\\cos(30^\\circ) = \\dfrac{12\\sqrt{3}}{c}',
        type: 'numeric',
        correctAnswer: 24,
        tolerance: 0.1,
        hint: 'Use cos(30°) = √3 / 2 to solve for hypotenuse c.',
        visualKind: 'special-triangle',
        solutionSteps: [
          { label: 'Set Up Cosine Ratio', tex: '\\dfrac{\\sqrt{3}}{2} = \\dfrac{12\\sqrt{3}}{c}', note: '12√3 is adjacent to the 30° angle.' },
          { label: 'Solve for c', tex: 'c = \\dfrac{12\\sqrt{3} \\cdot 2}{\\sqrt{3}} = 24', note: '30°-60°-90° sides are 12, 12√3, 24.' },
        ],
      },
    ],
  },
  {
    id: 'geom-ch7',
    courseId: 'geometry',
    chapterNumber: 7,
    title: '3D Cross-Sections, Surface Area, Hinged Nets & Volume',
    subtitle: 'Solids of revolution, Cavalieri’s Principle, and unfolding 3D geometry',
    benchmarks: ['MA.912.GR.4.1', 'MA.912.GR.4.2', 'MA.912.GR.4.4', 'MA.912.GR.4.5', 'MA.912.GR.4.6'],
    mtrFocus: 'MA.K12.MTR.2.1 · Multiple Representations',
    bigIdea:
      'Every pyramid and cone holds exactly ⅓ the volume of its enclosing prism or cylinder — and unfolding any polyhedron or cylinder into a flat 2D net turns 3D surface area into easy 2D rectangles and triangles!',
    keyFormulas: [
      { label: 'Pyramid Surface Area & Slant', tex: 'SA = B + \\tfrac{1}{2}P\\ell, \\quad \\ell^2 = h^2 + a^2', visualKind: 'pyramid-slant' },
      { label: 'Unrolled Cylinder Lateral Area', tex: 'SA_{\\text{cyl}} = 2\\pi r^2 + 2\\pi r h', visualKind: 'cylinder-unroll' },
      { label: 'Unfolded Prism Net', tex: 'SA_{\\text{prism}} = 2B + P\\cdot h,\\quad V = B\\cdot h', visualKind: 'prism-net' },
    ],
    interactiveTopicId: 'g-circles',
    linkedLessonRoute: '/lesson/solids-3d',
    workedExample: {
      problem:
        'A square pyramid has base edge s = 12 m and vertical height h = 8 m. Find its slant height ℓ, lateral surface area, and total volume.',
      problemTex: 's = 12,\\quad h = 8,\\quad \\ell = \\sqrt{h^2 + (s/2)^2}',
      steps: [
        {
          title: 'Compute Slant Height ℓ Along Face',
          tex: '\\ell = \\sqrt{8^2 + 6^2} = \\sqrt{64 + 36} = 10\\text{ m}',
          note: 'Half the base edge is apothem a = 12/2 = 6 m.',
        },
        {
          title: 'Compute Lateral + Total Surface Area',
          tex: 'SA = 12^2 + \\tfrac{1}{2}(48)(10) = 144 + 240 = 384\\text{ m}^2',
          note: 'Four congruent triangular wings unfold flat around the 12×12 square.',
        },
        {
          title: 'Calculate Pyramid Volume',
          tex: 'V = \\tfrac{1}{3}Bh = \\tfrac{1}{3}(144)(8) = 384\\text{ m}^3',
          note: 'Exactly one-third of a 12×12×8 box.',
        },
      ],
    },
    eocTrap:
      'Plugging VERTICAL height h into surface area instead of SLANT height ℓ (or vice versa, plugging ℓ into V = ⅓Bh!). Remember: Volume uses vertical h; Surface Area uses slanted face height ℓ.',
    frontierConnection:
      'In higher-dimensional geometry, slicing a 3D cone predicts cross-sections, while slicing 10D Calabi-Yau manifolds produces cross-sectional particle spectra in String Theory!',
    checkQuestions: [
      {
        id: 'fl-g-c7-q1',
        prompt: 'A right triangle with legs 3 cm and 4 cm spins 360° around its 4 cm leg to sweep a cone. What is the cone’s volume divided by π (i.e., the integer k in V = kπ cm³)?',
        promptTex: 'V = \\tfrac{1}{3}\\pi r^2 h',
        type: 'numeric',
        correctAnswer: 12,
        tolerance: 0.05,
        unitLabel: 'π cm³',
        hint: 'Spinning around the 4 cm leg makes height h = 4 and base radius r = 3.',
        visualKind: 'cylinder-unroll',
        solutionSteps: [
          { label: 'Identify Solid of Revolution Dimensions', tex: 'r = 3\\text{ cm}, \\qquad h = 4\\text{ cm}', note: 'The axis of rotation becomes height h; perpendicular leg sweeps radius r.' },
          { label: 'Apply Cone Volume Formula', tex: 'V = \\tfrac{1}{3}\\pi (3)^2 (4) = \\tfrac{1}{3}\\pi(36) = 12\\pi', note: 'Coefficient k = 12.' },
        ],
      },
      {
        id: 'fl-g-c7-q2',
        prompt: 'What 2D cross-section shape results from slicing a right cylinder perpendicular to its circular base (straight down through the top and bottom)?',
        type: 'multiple-choice',
        options: [
          { id: 'a', label: 'A rectangle' },
          { id: 'b', label: 'A circle' },
          { id: 'c', label: 'A triangle' },
          { id: 'd', label: 'A trapezoid' },
        ],
        correctAnswer: 'a',
        hint: 'Parallel to the circular base cuts a circle; perpendicular cuts straight across parallel top/bottom edges and straight side walls.',
        visualKind: 'prism-net',
        solutionSteps: [
          { label: 'Trace Cut Boundaries', tex: '\\text{Top/Bottom parallel} \\land \\text{Side walls } \\perp \\text{ base}', note: 'Produces four 90° corners.' },
          { label: 'Classify Slice Shape', tex: '\\text{Rectangle (width } \\le 2r,\\text{ height } h\\text{)}', note: 'Becomes a triangle on a cone, but a rectangle on a cylinder!' },
        ],
      },
    ],
  },

  // ============================================================================
  // ALGEBRA 2 (1200330) — CHAPTERS 1..7
  // ============================================================================
  {
    id: 'alg2-ch1',
    courseId: 'algebra-2',
    chapterNumber: 1,
    title: 'Complex Numbers, Argand Geometry & Quadratic Extensions',
    subtitle: 'Operations in a + bi, conjugates, and complex roots when Δ < 0',
    benchmarks: ['MA.912.NSO.2.1', 'MA.912.AR.3.2', 'MA.912.AR.3.8'],
    mtrFocus: 'MA.K12.MTR.5.1 · Patterns & Structure',
    bigIdea:
      'Multiplying by i = √(−1) is NOT mysterious — it literally rotates any vector 90° counterclockwise onto a vertical imaginary axis, completing algebra so every quadratic has 2 roots!',
    keyFormulas: [
      { label: 'Argand Plane Vector', tex: 'z = a + bi, \\quad |z| = \\sqrt{a^2 + b^2}', visualKind: 'argand-vector' },
      { label: 'Conjugate Division & Norm', tex: '(a + bi)(a - bi) = a^2 + b^2', visualKind: 'complex-conjugate' },
      { label: 'Euler Rotational Circle', tex: 'r e^{i\\theta} = r(\\cos\\theta + i\\sin\\theta)', visualKind: 'euler-circle' },
    ],
    interactiveTopicId: 'a2-complex',
    linkedLessonRoute: '/lesson/a2-complex',
    workedExample: {
      problem:
        'Divide (5 + 5i) / (1 − 2i) and write the result in standard a + bi form by rationalizing with the complex conjugate.',
      problemTex: '\\dfrac{5 + 5i}{1 - 2i} \\cdot \\dfrac{1 + 2i}{1 + 2i}',
      steps: [
        {
          title: 'Multiply Top & Bottom by Conjugate (1 + 2i)',
          tex: '\\text{Denom: } (1 - 2i)(1 + 2i) = 1^2 + 2^2 = 5',
          note: 'Conjugate product removes i from the denominator cleanly.',
        },
        {
          title: 'Expand Numerator Using i² = −1',
          tex: '(5 + 5i)(1 + 2i) = 5 + 10i + 5i + 10i^2 = (5 - 10) + 15i = -5 + 15i',
          note: 'Remember +10i² turns into −10!',
        },
        {
          title: 'Divide Both Real & Imaginary Parts by 5',
          tex: '\\dfrac{-5 + 15i}{5} = -1 + 3i',
          note: 'Clean standard form a = −1, b = 3.',
        },
      ],
    },
    eocTrap:
      'Forgetting i² = −1 inside conjugate multiplication (writing 1 − 4 = −3 instead of 1 − 4(−1) = +5) or failing to divide BOTH real and imaginary parts by the denominator.',
    frontierConnection:
      'Quantum mechanics wavefunctions ψ and String Theory scattering amplitudes live natively in the complex plane ℂ — every particle vibration carries complex phase e^{iθ}!',
    checkQuestions: [
      {
        id: 'fl-a2-c1-q1',
        prompt: 'Write (4 + 2i) / (1 + i) in standard form a + bi. What is the real part a?',
        promptTex: '\\dfrac{4 + 2i}{1 + i} \\cdot \\dfrac{1 - i}{1 - i} = a + bi',
        type: 'numeric',
        correctAnswer: 3,
        tolerance: 0.01,
        hint: 'Multiply numerator and denominator by conjugate (1 − i), using (1 + i)(1 − i) = 2.',
        visualKind: 'complex-conjugate',
        solutionSteps: [
          { label: 'Compute Conjugate Denominator', tex: '(1 + i)(1 - i) = 1^2 + 1^2 = 2', note: 'Pure real denominator 2.' },
          { label: 'Expand Numerator', tex: '(4 + 2i)(1 - i) = 4 - 4i + 2i - 2i^2 = 6 - 2i', note: '−2i² = +2 adds to 4.' },
          { label: 'Divide by 2', tex: '\\dfrac{6 - 2i}{2} = 3 - i \\implies a = 3', note: 'Real part is 3; imaginary part is −1.' },
        ],
      },
      {
        id: 'fl-a2-c1-q2',
        prompt: 'What is the value of i^23?',
        promptTex: 'i^{23} = (i^4)^5 \\cdot i^3',
        type: 'multiple-choice',
        options: [
          { id: 'a', label: 'Value A', tex: '-i' },
          { id: 'b', label: 'Value B', tex: 'i' },
          { id: 'c', label: 'Value C', tex: '-1' },
          { id: 'd', label: 'Value D', tex: '1' },
        ],
        correctAnswer: 'a',
        hint: 'Divide exponent 23 by 4 and inspect the remainder (23 = 4·5 + 3).',
        visualKind: 'euler-circle',
        solutionSteps: [
          { label: 'Factor Out Full 360° Loops (i⁴ = 1)', tex: 'i^{20} = (i^4)^5 = 1^5 = 1', note: 'Every 4 powers complete one full circle.' },
          { label: 'Evaluate Remainder i³', tex: 'i^{23} = 1 \\cdot i^3 = i^2 \\cdot i = -i', note: 'Three 90° turns land at −i.' },
        ],
      },
    ],
  },
  {
    id: 'alg2-ch2',
    courseId: 'algebra-2',
    chapterNumber: 2,
    title: 'Polynomial Functions, Multiplicity & End Behavior',
    subtitle: 'Factoring higher-degree curves, crossing vs. bouncing roots, and limits',
    benchmarks: ['MA.912.AR.6.1', 'MA.912.AR.6.5', 'MA.912.F.3.2'],
    mtrFocus: 'MA.K12.MTR.5.1 · Patterns & Structure',
    bigIdea:
      'Every polynomial curve tells its whole story through two clues: the leading term aₙxⁿ steers the far left/right ends, while each factor (x − r)ᵐ decides whether the curve slices through (odd m) or bounces off (even m) the x-axis.',
    keyFormulas: [
      { label: 'Multiplicity Behavior', tex: 'P(x) = a_n \\prod (x - r_i)^{m_i}', visualKind: 'poly-multiplicity' },
      { label: 'Factor & Remainder Theorem', tex: 'P(r) = 0 \\iff (x - r) \\mid P(x)', visualKind: 'factor-root' },
      { label: 'Leading-Term End Behavior', tex: 'P(x) \\sim a_n x^n \\quad (|x| \\to \\infty)', visualKind: 'poly-end-behavior' },
    ],
    interactiveTopicId: 'a2-polynomials',
    linkedLessonRoute: '/lesson/a2-polynomials',
    workedExample: {
      problem:
        'Factor P(x) = x³ − 3x² − 4x + 12 completely by grouping, then list all zeros and the total degree.',
      problemTex: 'P(x) = x^3 - 3x^2 - 4x + 12',
      steps: [
        {
          title: 'Factor by Grouping Pairs',
          tex: 'x^2(x - 3) - 4(x - 3) = (x^2 - 4)(x - 3)',
          note: 'Both pairs share the binomial factor (x − 3).',
        },
        {
          title: 'Split Difference of Squares (x² − 4)',
          tex: 'P(x) = (x - 2)(x + 2)(x - 3)',
          note: 'All three factors are linear with multiplicity 1.',
        },
        {
          title: 'Read Roots & Crossing Behavior',
          tex: 'x \\in \\{-2, 2, 3\\}, \\quad y\\text{-int} = (0, 12)',
          note: 'Odd degree + positive leading term falls left, rises right, crossing cleanly at all 3 zeros.',
        },
      ],
    },
    eocTrap:
      'Thinking a graph of P(x) = x³(x − 2)² has degree 2 because only 2 distinct x-intercepts appear — count MULTIPLICITIES: 3 + 2 = degree 5!',
    frontierConnection:
      '3D modeling in Pixar films and aerospace CAD shapes smooth wings using cubic Bézier spline polynomials, while Calabi-Yau hypersurfaces are literally zero sets of degree-5 polynomials z₁⁵ + … + z₅⁵ = 0!',
    checkQuestions: [
      {
        id: 'fl-a2-c2-q1',
        prompt: 'A degree-4 polynomial with real coefficients has zeros at x = 2 (multiplicity 2) and x = 1 + 3i. How many DISTINCT real zeros does it have?',
        promptTex: '\\deg P = 4, \\quad \\text{Complex conjugates come in pairs!}',
        type: 'numeric',
        correctAnswer: 1,
        tolerance: 0.01,
        hint: 'Since 1 + 3i is a root, its conjugate 1 − 3i MUST also be a root, leaving only x = 2 (multiplicity 2) on the real axis.',
        visualKind: 'poly-multiplicity',
        solutionSteps: [
          { label: 'Apply Conjugate Root Theorem', tex: 'r_3 = 1 + 3i \\implies r_4 = 1 - 3i', note: 'Real coefficients force imaginary roots into conjugate pairs.' },
          { label: 'Count Real Zeros', tex: '\\text{Real zero: } x = 2 \\;(m = 2) \\implies 1 \\text{ distinct real x-intercept}', note: 'Roots sum to 2 + 1 + 1 = degree 4.' },
        ],
      },
      {
        id: 'fl-a2-c2-q2',
        prompt: 'Which factored polynomial crosses the x-axis at x = −1, bounces tangentially at x = 3, falls left (x → −∞), and rises right (x → +∞)?',
        type: 'multiple-choice',
        options: [
          { id: 'a', label: 'Poly A', tex: 'P(x) = (x + 1)(x - 3)^2' },
          { id: 'b', label: 'Poly B', tex: 'P(x) = (x + 1)^2(x - 3)^2' },
          { id: 'c', label: 'Poly C', tex: 'P(x) = -(x + 1)(x - 3)^2' },
          { id: 'd', label: 'Poly D', tex: 'P(x) = (x - 1)(x + 3)^2' },
        ],
        correctAnswer: 'a',
        hint: 'Crossing at −1 needs an odd exponent on (x + 1), bouncing at 3 needs an even exponent on (x − 3), and falling left / rising right needs an odd degree with a positive leading coefficient.',
        visualKind: 'poly-end-behavior',
        solutionSteps: [
          { label: 'Match Root Multiplicity Behavior', tex: '\\text{Cross } x = -1 \\implies (x + 1)^1, \\qquad \\text{Bounce } x = 3 \\implies (x - 3)^2', note: 'Odd powers slice through; even powers bounce tangentially.' },
          { label: 'Verify Leading Term End Behavior', tex: 'P(x) \\sim +x^3 \\implies \\text{Falls left } (-\\infty),\\text{ rises right } (+\\infty)', note: 'Degree 1 + 2 = 3 (odd) with positive +1 leading term matches.' },
        ],
      },
    ],
  },
  {
    id: 'alg2-ch3',
    courseId: 'algebra-2',
    chapterNumber: 3,
    title: 'Nonlinear Systems & Matrix Transformations',
    subtitle: 'Intersecting parabolas/circles with lines and solving linear systems via matrices',
    benchmarks: ['MA.912.AR.9.2', 'MA.912.AR.9.3', 'MA.912.NSO.4.1', 'MA.912.NSO.4.2'],
    mtrFocus: 'MA.K12.MTR.3.1 · Mathematical Fluency',
    bigIdea:
      'Matrices turn messy multi-variable systems into crisp grid operations A·x = b, while nonlinear systems test the exact discriminant Δ where curved trajectories collide, graze, or miss.',
    keyFormulas: [
      { label: 'Nonlinear Intersection & Tangency', tex: 'y = ax^2 + c \\;\\cap\\; y = mx + b', visualKind: 'nonlinear-2roots' },
      { label: '2×2 Matrix System Action', tex: '\\mathbf{W}\\vec{x} + \\vec{b} = \\vec{y}', visualKind: 'neural-layer' },
      { label: 'Tangent Discriminant Lock', tex: '\\Delta = b^2 - 4ac = 0 \\implies 1\\text{ grazing touch}', visualKind: 'nonlinear-tangent' },
    ],
    interactiveTopicId: 'a2-quad-systems',
    linkedLessonRoute: '/lesson/a2-quad-systems',
    workedExample: {
      problem:
        'Find both intersection coordinates of the parabola y = x² − 4x + 5 and the line y = x + 1, and express the 2×2 system 2x + y = 7, x − y = 2 as a matrix equation.',
      problemTex: 'x^2 - 4x + 5 = x + 1, \\qquad \\begin{bmatrix} 2 & 1 \\\\ 1 & -1 \\end{bmatrix}\\begin{bmatrix} x \\\\ y \\end{bmatrix} = \\begin{bmatrix} 7 \\\\ 2 \\end{bmatrix}',
      steps: [
        {
          title: 'Equate Parabola and Line',
          tex: 'x^2 - 4x + 5 = x + 1 \\implies x^2 - 5x + 4 = 0',
          note: 'Standardizes into one clean quadratic equation.',
        },
        {
          title: 'Factor to Get Intersection x-Values',
          tex: '(x - 1)(x - 4) = 0 \\implies x = 1 \\text{ or } x = 4',
          note: 'Two crossing x-coordinates.',
        },
        {
          title: 'Recover Paired y-Values & Verify Matrix',
          tex: '(1, 2) \\text{ and } (4, 5); \\quad \\begin{bmatrix} 2 & 1 \\\\ 1 & -1 \\end{bmatrix}\\begin{bmatrix} 3 \\\\ 1 \\end{bmatrix} = \\begin{bmatrix} 7 \\\\ 2 \\end{bmatrix}',
          note: 'Always plug x back into the line y = x + 1 for complete ordered pairs.',
        },
      ],
    },
    eocTrap:
      'Reporting only the x-values when solving a 2D nonlinear system! Solutions to two-variable systems are ordered pairs (x, y) — and matrix multiplication A·B is NOT commutative (A·B ≠ B·A).',
    frontierConnection:
      'Every layer inside GPT/Claude-scale AI models is literally repeated matrix multiplication plus bias W·a + b passed through a nonlinear activation function (explore it live in our /neural Harmonic Spine!).',
    checkQuestions: [
      {
        id: 'fl-a2-c3-q1',
        prompt: 'Compute the product of the 2×2 matrix [[2, −1], [3, 4]] times the column vector [5, 2]ᵀ. What is the TOP entry of the resulting vector?',
        promptTex: '\\begin{bmatrix} 2 & -1 \\\\ 3 & 4 \\end{bmatrix}\\begin{bmatrix} 5 \\\\ 2 \\end{bmatrix}',
        type: 'numeric',
        correctAnswer: 8,
        tolerance: 0.01,
        hint: 'Take the dot product of the top row [2, −1] with column [5, 2].',
        visualKind: 'matrix-warp',
        solutionSteps: [
          { label: 'Dot Row 1 With Column Vector', tex: '2(5) + (-1)(2) = 10 - 2 = 8', note: 'Gives the top output coordinate.' },
          { label: 'Dot Row 2 for Complete Output', tex: '3(5) + 4(2) = 23 \\implies \\begin{bmatrix} 8 \\\\ 23 \\end{bmatrix}', note: 'Top entry is 8.' },
        ],
      },
      {
        id: 'fl-a2-c3-q2',
        prompt: 'For the system y = x² + 1 and y = 2x + 1, what is the SUM of the y-coordinates of all intersection points?',
        promptTex: 'x^2 + 1 = 2x + 1',
        type: 'numeric',
        correctAnswer: 6,
        tolerance: 0.01,
        hint: 'Solve x² − 2x = 0 for x = 0 and x = 2, find BOTH y-coordinates, then sum them.',
        visualKind: 'nonlinear-2roots',
        solutionSteps: [
          { label: 'Solve Intersection x-Values', tex: 'x^2 - 2x = x(x - 2) = 0 \\implies x = 0 \\text{ or } x = 2', note: 'Two intersections.' },
          { label: 'Recover Paired y-Coordinates', tex: 'y(0) = 1,\\quad y(2) = 5 \\implies (0, 1)\\text{ and }(2, 5)', note: 'Both satisfy y = x² + 1.' },
          { label: 'Sum y-Values', tex: '1 + 5 = 6', note: 'Sum of y-coordinates equals 6.' },
        ],
      },
    ],
  },
  {
    id: 'alg2-ch4',
    courseId: 'algebra-2',
    chapterNumber: 4,
    title: 'Radical Equations, Function Composition & Inverses',
    subtitle: 'Chaining f(g(x)), reflecting across y = x, and catching extraneous roots',
    benchmarks: ['MA.912.AR.7.1', 'MA.912.F.2.2', 'MA.912.F.3.4', 'MA.912.F.3.6', 'MA.912.F.3.7'],
    mtrFocus: 'MA.K12.MTR.6.1 · Reasonableness Audit',
    bigIdea:
      'An inverse function f⁻¹ unravels f backward step-for-step like decrypting a message — and squaring a radical equation can create fake ghost roots that must ALWAYS be tested in the original equation!',
    keyFormulas: [
      { label: 'Composition Pipeline', tex: '(f \\circ g)(x) = f(g(x))', visualKind: 'composition-pipe' },
      { label: 'Inverse Mirror Symmetry', tex: 'f(f^{-1}(x)) = x \\iff (x, y) \\leftrightarrow (y, x)', visualKind: 'inverse-mirror' },
      { label: 'Extraneous Radical Check', tex: '\\sqrt{A(x)} = B(x) \\implies B(x) \\ge 0', visualKind: 'radical-extraneous' },
    ],
    interactiveTopicId: 'a2-radicals',
    linkedLessonRoute: '/lesson/a2-radicals',
    workedExample: {
      problem:
        'Find the inverse of f(x) = √(x − 3) + 2 and specify its restricted domain so f(f⁻¹(x)) = x holds.',
      problemTex: 'y = \\sqrt{x - 3} + 2 \\quad (x \\ge 3,\\; y \\ge 2)',
      steps: [
        {
          title: 'Determine Range of Original Function f',
          tex: '\\sqrt{x - 3} \\ge 0 \\implies f(x) \\ge 2',
          note: 'The range of f becomes the exact domain of f⁻¹.',
        },
        {
          title: 'Swap x and y and Solve for y',
          tex: 'x = \\sqrt{y - 3} + 2 \\implies (x - 2)^2 = y - 3',
          note: 'Isolate the radical before squaring both sides.',
        },
        {
          title: 'State Inverse With Domain Restriction',
          tex: 'f^{-1}(x) = (x - 2)^2 + 3 \\quad \\text{for } x \\ge 2',
          note: 'Restricting x ≥ 2 keeps only the right half of the parabola matching the mirror across y = x.',
        },
      ],
    },
    eocTrap:
      'Forgetting to carry the domain restriction onto f⁻¹(x) = (x − 2)² + 3 (x ≥ 2), or keeping an extraneous root like x = −2 where √(4) = −2 fails!',
    frontierConnection:
      'Public-key RSA encryption and robotic arm inverse kinematics rely directly on invertible composition maps — and invertible neural networks (normalizing flows) use bijective inverse chains!',
    checkQuestions: [
      {
        id: 'fl-a2-c4-q1',
        prompt: 'Solve √(3x + 1) = x − 1 and enter the ONLY valid (non-extraneous) solution.',
        promptTex: '\\sqrt{3x + 1} = x - 1',
        type: 'numeric',
        correctAnswer: 5,
        tolerance: 0.01,
        hint: 'Square both sides to get x² − 5x = 0, then check BOTH x = 0 and x = 5 in the original radical!',
        visualKind: 'radical-extraneous',
        solutionSteps: [
          { label: 'Square Both Sides', tex: '3x + 1 = (x - 1)^2 = x^2 - 2x + 1', note: 'Expand (x − 1)² carefully.' },
          { label: 'Factor Quadratic', tex: 'x^2 - 5x = x(x - 5) = 0 \\implies x \\in \\{0, 5\\}', note: 'Two algebraic candidates.' },
          { label: 'Reject Extraneous Root', tex: 'x = 0: \\sqrt{1} = 1 \\ne -1 \\;(\\times); \\quad x = 5: \\sqrt{16} = 4 \\;(\\checkmark)', note: 'Only x = 5 is valid.' },
        ],
      },
      {
        id: 'fl-a2-c4-q2',
        prompt: 'Given f(x) = x² − 2 and g(x) = 3x + 1, evaluate (g ∘ f)(−2) = g(f(−2)).',
        promptTex: 'g(f(-2))',
        type: 'numeric',
        correctAnswer: 7,
        tolerance: 0.01,
        hint: 'Evaluate the inner function f(−2) first, then plug that output into g.',
        visualKind: 'composition-pipe',
        solutionSteps: [
          { label: 'Compute Inner Output f(−2)', tex: 'f(-2) = (-2)^2 - 2 = 4 - 2 = 2', note: 'Negative sign squares to +4.' },
          { label: 'Feed Into Outer Machine g(2)', tex: 'g(2) = 3(2) + 1 = 7', note: '(g ∘ f)(−2) = 7.' },
        ],
      },
    ],
  },
  {
    id: 'alg2-ch5',
    courseId: 'algebra-2',
    chapterNumber: 5,
    title: 'Logarithms, Exponential Inverses & Decibel / pH Scales',
    subtitle: 'Decoding log_b(x) as an exponent finder, log laws, and natural base e',
    benchmarks: ['MA.912.AR.5.2', 'MA.912.AR.5.7', 'MA.912.AR.5.9'],
    mtrFocus: 'MA.K12.MTR.5.1 · Patterns & Structure',
    bigIdea:
      'A logarithm simply asks "What exponent turns base b into x?" — which is why log_b(x) mirrors bˣ across y = x and turns multiplication into effortless addition!',
    keyFormulas: [
      { label: 'Log-Exponential Inverse Mirror', tex: 'y = \\log_b(x) \\iff b^y = x \\quad (x > 0)', visualKind: 'log-reflection' },
      { label: 'Product & Quotient Log Laws', tex: '\\log_b(MN) = \\log_b M + \\log_b N', visualKind: 'log-product' },
      { label: 'Power-Pulling Log Law', tex: '\\log_b(M^k) = k\\log_b M', visualKind: 'log-power' },
    ],
    interactiveTopicId: 'a1-exponential',
    linkedLessonRoute: '/lesson/logarithms',
    workedExample: {
      problem:
        'Solve log₂(x) + log₂(x − 6) = 4, and identify any extraneous candidate caused by the domain wall x > 0.',
      problemTex: '\\log_2(x) + \\log_2(x - 6) = 4',
      steps: [
        {
          title: 'Condense Sum Into Single Product Log',
          tex: '\\log_2\\big(x(x - 6)\\big) = 4 \\quad \\text{(requires } x > 6\\text{)}',
          note: 'Log arguments must stay strictly positive.',
        },
        {
          title: 'Convert Log to Exponential Power',
          tex: 'x(x - 6) = 2^4 = 16 \\implies x^2 - 6x - 16 = 0',
          note: 'Undo log₂ by exponentiating base 2.',
        },
        {
          title: 'Factor & Filter by Domain x > 6',
          tex: '(x - 8)(x + 2) = 0 \\implies x = 8 \\;(\\checkmark), \\quad x = -2 \\;(\\text{Rejected!})',
          note: 'log₂(−2) is undefined in ℝ, leaving only x = 8.',
        },
      ],
    },
    eocTrap:
      'Inventing a fake rule like log(A + B) = log A + log B or keeping negative solutions after condensing logs — ALWAYS check arguments inside the ORIGINAL logs stay > 0!',
    frontierConnection:
      'Boltzmann entropy S = k_B ln(W), information bits log₂(N), earthquake Richter magnitudes, and sound decibels all run on logarithms because nature compresses huge multiplicative ranges into additive scales.',
    checkQuestions: [
      {
        id: 'fl-a2-c5-q1',
        prompt: 'Evaluate log₃(27) + log₂(1/8) as a single exact integer.',
        promptTex: '\\log_3(27) + \\log_2\\left(\\tfrac{1}{8}\\right)',
        type: 'numeric',
        correctAnswer: 0,
        tolerance: 0.01,
        hint: 'Ask what power of 3 gives 27, and what negative power of 2 gives 1/8.',
        visualKind: 'log-power',
        solutionSteps: [
          { label: 'Evaluate Each Logarithm', tex: '3^3 = 27 \\implies \\log_3(27) = 3; \\qquad 2^{-3} = \\tfrac{1}{8} \\implies \\log_2(\\tfrac{1}{8}) = -3', note: 'Fractions 1/bⁿ correspond to negative exponents.' },
          { label: 'Add Values', tex: '3 + (-3) = 0', note: 'Exact cancellation.' },
        ],
      },
      {
        id: 'fl-a2-c5-q2',
        prompt: 'Solve 5 · 2^(x − 1) = 40 for x.',
        promptTex: '5 \\cdot 2^{x - 1} = 40',
        type: 'numeric',
        correctAnswer: 4,
        tolerance: 0.01,
        hint: 'Divide both sides by 5 first to isolate the exponential power 2^(x − 1) = 8.',
        visualKind: 'log-reflection',
        solutionSteps: [
          { label: 'Isolate Exponential Term', tex: '2^{x - 1} = \\dfrac{40}{5} = 8', note: 'Never multiply 5 · 2 into 10^(x−1)!' },
          { label: 'Match Base 2 Exponents', tex: '2^{x - 1} = 2^3 \\implies x - 1 = 3 \\implies x = 4', note: 'Check: 5 · 2³ = 5 · 8 = 40 ✓.' },
        ],
      },
    ],
  },
  {
    id: 'alg2-ch6',
    courseId: 'algebra-2',
    chapterNumber: 6,
    title: 'Rational Functions, Vertical Poles & Holes',
    subtitle: 'Solving rational equations, domain restrictions, and asymptotic limits',
    benchmarks: ['MA.912.AR.8.1', 'MA.912.AR.8.2'],
    mtrFocus: 'MA.K12.MTR.6.1 · Reasonableness Audit',
    bigIdea:
      'Zeros in a rational denominator split into two distinct landmarks: uncancelled factors explode into vertical asymptote walls, while factors that cancel with the numerator leave a single pinpoint hole!',
    keyFormulas: [
      { label: 'Vertical Pole Asymptote', tex: 'Q(p) = 0,\\; P(p) \\ne 0 \\implies x = p', visualKind: 'rational-pole' },
      { label: 'Removable Discontinuity Hole', tex: '\\dfrac{(x - a)P(x)}{(x - a)Q(x)} \\text{ has hole at } x = a', visualKind: 'rational-hole' },
      { label: 'Horizontal End Limit', tex: '\\lim_{x \\to \\pm\\infty} \\left(\\dfrac{a}{x - p} + c\\right) = c', visualKind: 'horizontal-asym' },
    ],
    interactiveTopicId: 'a2-rational',
    linkedLessonRoute: '/lesson/a2-rational',
    workedExample: {
      problem:
        'Analyze f(x) = (x² − 9) / (x² − x − 6): locate any open hole, vertical asymptote, and horizontal asymptote.',
      problemTex: 'f(x) = \\dfrac{(x - 3)(x + 3)}{(x - 3)(x + 2)}',
      steps: [
        {
          title: 'Factor Top & Bottom Completely',
          tex: 'f(x) = \\dfrac{(x - 3)(x + 3)}{(x - 3)(x + 2)} \\quad (x \\ne 3,\\; x \\ne -2)',
          note: 'Always record domain exclusions BEFORE cancelling.',
        },
        {
          title: 'Locate Hole vs. Vertical Pole',
          tex: '\\text{Hole at } x = 3 \\;\\left(y = \\tfrac{3+3}{3+2} = 1.2\\right); \\qquad \\text{Pole at } x = -2',
          note: '(x − 3) cancels into a hole; (x + 2) stays in denominator as a vertical pole.',
        },
        {
          title: 'Read Horizontal Asymptote',
          tex: '\\lim_{x \\to \\pm\\infty} \\dfrac{x + 3}{x + 2} = \\dfrac{1}{1} = 1 \\implies y = 1',
          note: 'Equal degrees in numerator and denominator give ratio of leading coefficients.',
        },
      ],
    },
    eocTrap:
      'Cancelling terms added together like (x + 4)/x = 1 + 4, or calling a cancelled denominator zero a vertical asymptote instead of a removable hole!',
    frontierConnection:
      'In particle physics and engineering, rational transfer functions pinpoint "poles" — exact resonant frequencies where bridges oscillate or quantum particles appear as physical resonances!',
    checkQuestions: [
      {
        id: 'fl-a2-c6-q1',
        prompt: 'What is the horizontal asymptote y = c of f(x) = (8x² − 3x + 1) / (2x² + 5)?',
        promptTex: '\\lim_{x \\to \\infty} \\dfrac{8x^2 - 3x + 1}{2x^2 + 5}',
        type: 'numeric',
        correctAnswer: 4,
        tolerance: 0.01,
        hint: 'When numerator and denominator share the same highest degree (2), divide their leading coefficients.',
        visualKind: 'horizontal-asym',
        solutionSteps: [
          { label: 'Compare Degrees', tex: '\\deg(\\text{num}) = 2 = \\deg(\\text{den})', note: 'Highest powers match.' },
          { label: 'Divide Leading Coefficients', tex: 'y = \\dfrac{8}{2} = 4', note: 'Lower-degree terms vanish as x → ±∞.' },
        ],
      },
      {
        id: 'fl-a2-c6-q2',
        prompt: 'Solve 2x / (x − 3) = 1 + 6 / (x − 3) for x, watching carefully for extraneous denominator zeros.',
        promptTex: '\\dfrac{2x}{x - 3} = 1 + \\dfrac{6}{x - 3}',
        type: 'multiple-choice',
        options: [
          { id: 'a', label: 'No real solution (candidate x = 3 makes the denominator 0)' },
          { id: 'b', label: 'x = 3' },
          { id: 'c', label: 'x = −3' },
          { id: 'd', label: 'x = 6' },
        ],
        correctAnswer: 'a',
        hint: 'Note domain restriction x ≠ 3 first, then multiply every term by (x − 3) and test the candidate!',
        visualKind: 'rational-pole',
        solutionSteps: [
          { label: 'Multiply Through by (x − 3)', tex: '2x = (x - 3) + 6 \\implies 2x = x + 3 \\implies x = 3', note: 'Algebraic clearing yields single candidate x = 3.' },
          { label: 'Audit Domain Restriction', tex: 'x = 3 \\implies x - 3 = 0 \\;(\\text{Division by Zero!})', note: 'Since x = 3 is extraneous, the equation has no solution.' },
        ],
      },
    ],
  },
  {
    id: 'alg2-ch7',
    courseId: 'algebra-2',
    chapterNumber: 7,
    title: 'Combinatorics, Binomial Theorem & Normal Probability',
    subtitle: 'Counting with nCr/nPr, Pascal expansions, independence & the 68-95-99.7 bell curve',
    benchmarks: ['MA.912.DP.2.2', 'MA.912.DP.4.1', 'MA.912.DP.4.2', 'MA.912.DP.4.3', 'MA.912.DP.4.10', 'MA.912.DP.6'],
    mtrFocus: 'MA.K12.MTR.7.1 · Real-World Modeling',
    bigIdea:
      'Pascal’s triangle links counting, binomial algebra, and bell-curve randomness into one unified cascade: drop enough random coins through binomial pegs and the Gaussian normal curve emerges automatically!',
    keyFormulas: [
      { label: 'Binomial Expansion', tex: '(a + b)^n = \\sum_{k=0}^n \\binom{n}{k}a^{n-k}b^k', visualKind: 'pascal-binomial' },
      { label: 'Independence & Conditional Odds', tex: 'P(A \\mid B) = \\dfrac{P(A \\cap B)}{P(B)}', visualKind: 'comb-vs-perm' },
      { label: 'Standard Z-Score & Normal Band', tex: 'z = \\dfrac{x - \\mu}{\\sigma}', visualKind: 'z-score-band' },
    ],
    interactiveTopicId: 'a2-probability',
    linkedLessonRoute: '/lesson/a2-probability',
    workedExample: {
      problem:
        'A robotics club has 7 seniors and 5 juniors (12 total). Find how many 3-person committees contain ONLY seniors, and find the conditional probability P(Senior | Officer) if 3 of the 4 officers are seniors.',
      problemTex: '\\binom{7}{3} \\quad \\text{and} \\quad P(\\text{Senior} \\mid \\text{Officer})',
      steps: [
        {
          title: 'Use Combination C(7, 3) (Order Ignored)',
          tex: '\\binom{7}{3} = \\dfrac{7 \\cdot 6 \\cdot 5}{3 \\cdot 2 \\cdot 1} = 35\\text{ committees}',
          note: 'Committees have identical roles, so order does not matter.',
        },
        {
          title: 'Compute Conditional Probability P(Senior | Officer)',
          tex: 'P(\\text{Senior} \\mid \\text{Officer}) = \\dfrac{3\\text{ senior officers}}{4\\text{ total officers}} = 0.75',
          note: 'Conditioning shrinks the denominator to only the 4 officers.',
        },
        {
          title: 'Connect to Binomial Symmetry',
          tex: '\\binom{7}{3} = \\binom{7}{4} = 35',
          note: 'Choosing 3 to include equals choosing 4 to leave out.',
        },
      ],
    },
    eocTrap:
      'Confusing P(A | B) with P(B | A) or forgetting to divide permutations by r! when roles are identical (committees vs. ranked podiums).',
    frontierConnection:
      'Thermodynamics and statistical mechanics compute entropy from combinations W = C(N, k), while quantum mechanics predicts measurement odds from Gaussian wavepacket probabilities!',
    checkQuestions: [
      {
        id: 'fl-a2-c7-q1',
        prompt: 'In a class of 30 students, 18 take Physics, 12 take CS, and 6 take BOTH. Given a student takes CS, what is the probability they also take Physics (enter as decimal)?',
        promptTex: 'P(\\text{Physics} \\mid \\text{CS}) = \\dfrac{6}{12}',
        type: 'numeric',
        correctAnswer: 0.5,
        tolerance: 0.01,
        hint: 'Divide students taking BOTH (6) by the total taking CS (12).',
        visualKind: 'comb-vs-perm',
        solutionSteps: [
          { label: 'Restrict Sample Space to CS', tex: 'n(\\text{CS}) = 12', note: 'Condition "given CS" puts 12 in denominator.' },
          { label: 'Compute Conditional Ratio', tex: 'P(\\text{Physics} \\mid \\text{CS}) = \\dfrac{6}{12} = 0.5', note: '50% of CS students also take Physics.' },
        ],
      },
      {
        id: 'fl-a2-c7-q2',
        prompt: 'Battery life is normally distributed with μ = 14 hours and σ = 1.5 hours. What battery life (in hours) corresponds to a z-score of −2?',
        promptTex: '-2 = \\dfrac{x - 14}{1.5}',
        type: 'numeric',
        correctAnswer: 11,
        tolerance: 0.05,
        unitLabel: 'hr',
        hint: 'Multiply z = −2 by σ = 1.5 and add to mean μ = 14.',
        visualKind: 'z-score-band',
        solutionSteps: [
          { label: 'Rearrange Z-Score Formula', tex: 'x = \\mu + z\\sigma', note: 'Moves z standard deviations from the mean.' },
          { label: 'Substitute Parameters', tex: 'x = 14 + (-2)(1.5) = 14 - 3 = 11\\text{ hr}', note: '2 standard deviations below the mean.' },
        ],
      },
    ],
  },

  // ============================================================================
  // PRECALCULUS HONORS (1202340) — CHAPTERS 1..7
  // ============================================================================
  {
    id: 'pc-ch1',
    courseId: 'precalculus',
    chapterNumber: 1,
    title: 'Unit Circle, Radian Arcs & Sinusoidal Harmonics',
    subtitle: 'Defining all 6 trig functions, periodic modeling, and inverse trig equations',
    benchmarks: ['MA.912.T.2.1', 'MA.912.T.2.2', 'MA.912.T.3.1', 'MA.912.T.3.2', 'MA.912.T.3.3'],
    mtrFocus: 'MA.K12.MTR.2.1 · Multiple Representations',
    bigIdea:
      'Every sine and cosine wave is simply the horizontal or vertical shadow of a point orbiting the unit circle at steady angular speed ω — turning circular spin into musical and electromagnetic waves!',
    keyFormulas: [
      { label: 'Unit Circle Coordinates', tex: 'P(\\theta) = (\\cos\\theta,\\; \\sin\\theta)', visualKind: 'unit-circle-proj' },
      { label: 'Sinusoidal Wave Parameters', tex: 'y = A\\sin\\big(B(x - C)\\big) + D,\\quad T = \\dfrac{2\\pi}{|B|}', visualKind: 'sinusoid-wave' },
      { label: 'Circular Identity Core', tex: '\\sin^2\\theta + \\cos^2\\theta = 1', visualKind: 'trig-pythag-id' },
    ],
    interactiveTopicId: 'pc-trig-identities',
    linkedLessonRoute: '/lesson/unit-circle',
    workedExample: {
      problem:
        'A Ferris wheel of radius 18 m centers 20 m above the ground and completes one full spin every 24 seconds, starting at midline height rising upward. Write h(t) and find h(4).',
      problemTex: 'h(t) = 18\\sin\\left(\\dfrac{2\\pi}{24}t\\right) + 20',
      steps: [
        {
          title: 'Set Amplitude A and Midline D',
          tex: 'A = 18\\text{ m}, \\qquad D = 20\\text{ m}',
          note: 'Height oscillates between 20 − 18 = 2 m and 20 + 18 = 38 m.',
        },
        {
          title: 'Compute Angular Frequency B From Period T = 24',
          tex: 'B = \\dfrac{2\\pi}{24} = \\dfrac{\\pi}{12}\\text{ rad/s}',
          note: 'Every 24 seconds completes a full 2π radian loop.',
        },
        {
          title: 'Evaluate Height at t = 4 Seconds',
          tex: 'h(4) = 18\\sin\\left(\\dfrac{4\\pi}{12}\\right) + 20 = 18\\sin\\left(\\tfrac{\\pi}{3}\\right) + 20 = 9\\sqrt{3} + 20 \\approx 35.6\\text{ m}',
          note: 'sin(π/3) = √3 / 2.',
        },
      ],
    },
    eocTrap:
      'Confusing period T with frequency coefficient B! In y = sin(Bx), the period is NOT B — it is T = 2π / |B|, so y = sin(3x) completes 3 cycles in 2π with period 2π/3.',
    frontierConnection:
      'Vibrating relativistic strings oscillate in standing harmonic modes sin(nπσ/L) along the unit circle — mode n = 1 vibrates as photons, while higher modes generate heavier particles!',
    checkQuestions: [
      {
        id: 'fl-pc-c1-q1',
        prompt: 'What is the period of the sound wave y = 5 cos(π x / 4) + 2?',
        promptTex: 'T = \\dfrac{2\\pi}{B}, \\qquad B = \\dfrac{\\pi}{4}',
        type: 'numeric',
        correctAnswer: 8,
        tolerance: 0.01,
        hint: 'Divide 2π by frequency B = π/4.',
        visualKind: 'sinusoid-wave',
        solutionSteps: [
          { label: 'Identify Frequency Coefficient B', tex: 'B = \\dfrac{\\pi}{4}', note: 'Amplitude is 5; midline is 2.' },
          { label: 'Compute Period T', tex: 'T = \\dfrac{2\\pi}{\\pi/4} = 2\\pi \\cdot \\dfrac{4}{\\pi} = 8', note: 'π cancels cleanly, leaving period 8.' },
        ],
      },
      {
        id: 'fl-pc-c1-q2',
        prompt: 'For 0 ≤ θ < 2π, how many solutions does the trigonometric equation 2 sin(θ) + 1 = 0 have?',
        promptTex: '\\sin(\\theta) = -\\dfrac{1}{2} \\quad (0 \\le \\theta < 2\\pi)',
        type: 'numeric',
        correctAnswer: 2,
        tolerance: 0.01,
        hint: 'Check which quadrants have negative sine (y < 0) on the unit circle.',
        visualKind: 'unit-circle-proj',
        solutionSteps: [
          { label: 'Isolate sin(θ)', tex: '\\sin(\\theta) = -\\dfrac{1}{2}', note: 'Horizontal line y = −0.5 intersects the unit circle.' },
          { label: 'Locate Quadrants III & IV Angles', tex: '\\theta = \\dfrac{7\\pi}{6},\\; \\dfrac{11\\pi}{6} \\implies 2\\text{ solutions}', note: 'One crossing in QIII and one in QIV.' },
        ],
      },
    ],
  },
  {
    id: 'pc-ch2',
    courseId: 'precalculus',
    chapterNumber: 2,
    title: 'Analytic Trigonometry & Oblique Triangle Laws',
    subtitle: 'Pythagorean/double-angle identities, Law of Sines, Law of Cosines & SAS area',
    benchmarks: ['MA.912.T.1.3', 'MA.912.T.1.4', 'MA.912.T.1.5', 'MA.912.T.1.6'],
    mtrFocus: 'MA.K12.MTR.3.1 · Mathematical Fluency',
    bigIdea:
      'Trigonometric identities simplify wave interference cleanly, while Law of Sines and Law of Cosines liberate triangle geometry from the 90° right-triangle restriction forever!',
    keyFormulas: [
      { label: 'Double-Angle Identities', tex: '\\sin(2\\theta) = 2\\sin\\theta\\cos\\theta', visualKind: 'trig-double-angle' },
      { label: 'Law of Sines & Circumcircle', tex: '\\dfrac{a}{\\sin A} = \\dfrac{b}{\\sin B} = \\dfrac{c}{\\sin C} = 2R', visualKind: 'law-sines-circle' },
      { label: 'Law of Cosines & Area', tex: 'c^2 = a^2 + b^2 - 2ab\\cos C,\\quad A = \\tfrac{1}{2}ab\\sin C', visualKind: 'law-cosines-tri' },
    ],
    interactiveTopicId: 'pc-law-sines',
    linkedLessonRoute: '/lesson/pc-law-sines',
    workedExample: {
      problem:
        'Verify cos²(θ) − sin²(θ) = 1 − 2sin²(θ) and find the exact area of an oblique parcel with sides a = 12 m, b = 15 m, and included angle C = 150°.',
      problemTex: '\\cos(2\\theta) = 1 - 2\\sin^2\\theta, \\qquad \\text{Area} = \\tfrac{1}{2}(12)(15)\\sin(150^\\circ)',
      steps: [
        {
          title: 'Substitute cos²θ = 1 − sin²θ',
          tex: '\\cos^2\\theta - \\sin^2\\theta = (1 - \\sin^2\\theta) - \\sin^2\\theta = 1 - 2\\sin^2\\theta',
          note: 'Proves the alternate double-angle cosine identity.',
        },
        {
          title: 'Evaluate sin(150°) in Quadrant II',
          tex: '\\sin(150^\\circ) = \\sin(180^\\circ - 30^\\circ) = +\\dfrac{1}{2}',
          note: 'Sine remains positive in Quadrant II.',
        },
        {
          title: 'Compute Oblique SAS Area',
          tex: '\\text{Area} = \\tfrac{1}{2}(12)(15)\\left(\\tfrac{1}{2}\\right) = 45\\text{ m}^2',
          note: 'Works smoothly even for obtuse angles > 90°.',
        },
      ],
    },
    eocTrap:
      'In the Law of Cosines c² = a² + b² − 2ab cos(C) when angle C > 90°, forgetting that cos(C) is NEGATIVE — turning −2ab cos(C) into a POSITIVE boost!',
    frontierConnection:
      'Active noise-canceling headphones, phased-array 5G beamforming, and celestial parallax surveying across parsecs of space rely on angle-sum identities and oblique triangulation.',
    checkQuestions: [
      {
        id: 'fl-pc-c2-q1',
        prompt: 'In an oblique triangle with sides a = 5, b = 8, and included angle C = 60°, find side c.',
        promptTex: 'c^2 = 5^2 + 8^2 - 2(5)(8)\\cos(60^\\circ)',
        type: 'numeric',
        correctAnswer: 7,
        tolerance: 0.05,
        hint: 'Remember cos(60°) = 0.5, then take the square root of c².',
        visualKind: 'law-cosines-tri',
        solutionSteps: [
          { label: 'Apply Law of Cosines', tex: 'c^2 = 25 + 64 - 80(0.5) = 89 - 40 = 49', note: 'Generalized Pythagoras for 60°.' },
          { label: 'Take Square Root', tex: 'c = \\sqrt{49} = 7', note: 'Famous 5-7-8 integer 60° triangle!' },
        ],
      },
      {
        id: 'fl-pc-c2-q2',
        prompt: 'Evaluate exact cos(15°) using cos(45° − 30°) = cos 45° cos 30° + sin 45° sin 30°.',
        type: 'multiple-choice',
        options: [
          { id: 'a', label: 'Exact Value A', tex: '\\dfrac{\\sqrt{6} + \\sqrt{2}}{4}' },
          { id: 'b', label: 'Exact Value B', tex: '\\dfrac{\\sqrt{6} - \\sqrt{2}}{4}' },
          { id: 'c', label: 'Exact Value C', tex: '\\dfrac{\\sqrt{3} + 1}{2}' },
          { id: 'd', label: 'Exact Value D', tex: '\\dfrac{\\sqrt{2}}{2}' },
        ],
        correctAnswer: 'a',
        hint: 'Notice cos(α − β) has a PLUS sign between terms: (√2/2)(√3/2) + (√2/2)(1/2).',
        visualKind: 'trig-sum-phase',
        solutionSteps: [
          { label: 'Expand Cosine Difference', tex: '\\cos(45^\\circ)\\cos(30^\\circ) + \\sin(45^\\circ)\\sin(30^\\circ)', note: 'Note the + sign in cos(α − β).' },
          { label: 'Multiply & Combine Fractions', tex: '\\dfrac{\\sqrt{2}}{2}\\cdot\\dfrac{\\sqrt{3}}{2} + \\dfrac{\\sqrt{2}}{2}\\cdot\\dfrac{1}{2} = \\dfrac{\\sqrt{6} + \\sqrt{2}}{4}', note: 'Exact radical value.' },
        ],
      },
    ],
  },
  {
    id: 'pc-ch3',
    courseId: 'precalculus',
    chapterNumber: 3,
    title: 'Euclidean Vectors, Dot Products & 2×2 Matrix Spaces',
    subtitle: 'Resultant forces, angle projection u · v, and determinant area scaling',
    benchmarks: ['MA.912.NSO.3.1', 'MA.912.NSO.3.2', 'MA.912.NSO.4.1'],
    mtrFocus: 'MA.K12.MTR.7.1 · Real-World Modeling',
    bigIdea:
      'Vectors unify physics and algebra: adding vectors closes a force parallelogram, the dot product measures alignment (u·v = 0 means 90°!), and a 2×2 matrix transforms the entire coordinate plane at once.',
    keyFormulas: [
      { label: 'Parallelogram Addition', tex: '\\vec{r} = \\vec{u} + \\vec{v} = \\langle u_x+v_x,\\; u_y+v_y\\rangle', visualKind: 'vector-parallelogram' },
      { label: 'Dot Product & Angle', tex: '\\vec{u}\\cdot\\vec{v} = \\|\\vec{u}\\|\\|\\vec{v}\\|\\cos\\theta', visualKind: 'dot-product-angle' },
      { label: 'Determinant Area Scale', tex: '\\det\\begin{bmatrix}a & b\\\\c & d\\end{bmatrix} = ad - bc', visualKind: 'matrix-det-area' },
    ],
    interactiveTopicId: 'pc-vectors',
    linkedLessonRoute: '/lesson/pc-vectors',
    workedExample: {
      problem:
        'A cargo plane flies due East at 240 km/h (u = ⟨240, 0⟩) while a steady crosswind blows due North at 70 km/h (v = ⟨0, 70⟩). Find its ground speed ‖u + v‖ and drift angle θ.',
      problemTex: '\\vec{u} = \\langle 240, 0 \\rangle,\\; \\vec{v} = \\langle 0, 70 \\rangle \\implies \\vec{r} = \\vec{u} + \\vec{v}',
      steps: [
        {
          title: 'Sum Velocity Components',
          tex: '\\vec{r} = \\langle 240 + 0,\\; 0 + 70 \\rangle = \\langle 240, 70 \\rangle',
          note: 'Wind drifts the plane northward while forward speed stays 240.',
        },
        {
          title: 'Compute Ground Speed Magnitude ‖r‖',
          tex: '\\|\\vec{r}\\| = \\sqrt{240^2 + 70^2} = 10\\sqrt{24^2 + 7^2} = 10(25) = 250\\text{ km/h}',
          note: 'Scaled 7-24-25 Pythagorean triple!',
        },
        {
          title: 'Find Drift Angle θ Above East',
          tex: '\\theta = \\arctan\\left(\\dfrac{70}{240}\\right) \\approx 16.26^\\circ',
          note: 'Inverse tangent locates exact heading angle.',
        },
      ],
    },
    eocTrap:
      'Adding magnitudes directly (240 + 70 = 310) instead of adding vector components first! Magnitudes add linearly ONLY when vectors point in the exact same direction.',
    frontierConnection:
      'Every 3D video game shader, robotic arm controller, and 10-dimensional metric tensor g_μν in Einstein’s General Relativity and String Theory generalizes vector dot products and matrix determinants.',
    checkQuestions: [
      {
        id: 'fl-pc-c3-q1',
        prompt: 'Find the dot product of u = ⟨6, −2⟩ and v = ⟨3, 9⟩.',
        promptTex: '\\langle 6, -2 \\rangle \\cdot \\langle 3, 9 \\rangle',
        type: 'numeric',
        correctAnswer: 0,
        tolerance: 0.01,
        hint: 'Multiply matching components (6·3) + (−2·9).',
        visualKind: 'dot-product-angle',
        solutionSteps: [
          { label: 'Multiply Component Pairs', tex: '6(3) + (-2)(9) = 18 - 18', note: 'First term +18, second term −18.' },
          { label: 'Sum to Scalar', tex: '18 - 18 = 0 \\implies \\vec{u} \\perp \\vec{v}', note: 'Zero dot product reveals perpendicular 90° vectors!' },
        ],
      },
      {
        id: 'fl-pc-c3-q2',
        prompt: 'A triangle of area 7 cm² is warped by the 2×2 matrix M = [[5, 2], [1, 3]]. What is the area of the transformed triangle?',
        promptTex: '\\text{Area}\' = |\\det(M)| \\cdot \\text{Area}',
        type: 'numeric',
        correctAnswer: 91,
        tolerance: 0.1,
        unitLabel: 'cm²',
        hint: 'Compute determinant |ad − bc| = |5·3 − 2·1| = 13, then multiply by 7.',
        visualKind: 'matrix-det-area',
        solutionSteps: [
          { label: 'Compute Matrix Determinant', tex: '\\det(M) = 5(3) - 2(1) = 15 - 2 = 13', note: 'Every unit square scales to area 13.' },
          { label: 'Scale Original Area', tex: '13 \\cdot 7 = 91\\text{ cm}^2', note: 'Exact warped area.' },
        ],
      },
    ],
  },
  {
    id: 'pc-ch4',
    courseId: 'precalculus',
    chapterNumber: 4,
    title: 'Parametric Motion, Velocity Vectors & Lissajous Orbits',
    subtitle: 'Time-driven plane curves, parameter elimination, and projectile physics',
    benchmarks: ['MA.912.T.4.5', 'MA.912.T.4.7'],
    mtrFocus: 'MA.K12.MTR.7.1 · Real-World Modeling',
    bigIdea:
      'Normal graphs y = f(x) only trace static shapes — parametric equations ⟨x(t), y(t)⟩ add a ticking clock t so you can trace loops, knots, direction arrows, and flight trajectories.',
    keyFormulas: [
      { label: 'Lissajous Resonance Curve', tex: 'x(t) = A\\sin(at + \\delta),\\; y(t) = B\\sin(bt)', visualKind: 'parametric-lissajous' },
      { label: 'Ballistic Launch Trajectory', tex: 'x(t) = (v_0\\cos\\theta)t,\\; y(t) = v_0\\sin\\theta\\,t - \\tfrac{1}{2}gt^2', visualKind: 'projectile-arc' },
      { label: 'Tangent Velocity Vector', tex: '\\vec{v}(t) = \\langle x\'(t),\\; y\'(t) \\rangle', visualKind: 'parametric-velocity' },
    ],
    interactiveTopicId: 'pc-parametric',
    linkedLessonRoute: '/lesson/pc-parametric',
    workedExample: {
      problem:
        'A water-rocket launches from ground height at 40 m/s at angle 30° (use g = 10 m/s²): x(t) = 20√3·t, y(t) = 20t − 5t². Find flight time and horizontal landing range.',
      problemTex: 'x(t) = 20\\sqrt{3}\\,t, \\qquad y(t) = 20t - 5t^2',
      steps: [
        {
          title: 'Set Vertical Height y(t) = 0 to Find Impact Time',
          tex: '20t - 5t^2 = 5t(4 - t) = 0 \\implies t = 0\\text{ or } t = 4\\text{ s}',
          note: 't = 0 is launch; t = 4 s is touchdown.',
        },
        {
          title: 'Locate Peak Height at Mid-Flight t = 2 s',
          tex: 'y(2) = 20(2) - 5(2)^2 = 40 - 20 = 20\\text{ m}',
          note: 'Symmetric parabolic arc peaks halfway at t = 2 s.',
        },
        {
          title: 'Compute Horizontal Range at t = 4 s',
          tex: 'x(4) = 20\\sqrt{3}(4) = 80\\sqrt{3} \\approx 138.6\\text{ m}',
          note: 'Horizontal velocity stays constant throughout flight.',
        },
      ],
    },
    eocTrap:
      'Eliminating parameter t and forgetting the orientation arrows or t-domain restrictions (e.g., t ≥ 0 stops half the parabola or trace direction reverses)!',
    frontierConnection:
      'In String Theory, a moving 1D string sweeps out a 2D "worldsheet" X^μ(τ, σ) parameterized by proper time τ and spatial coordinate σ — literally a parametric surface in 10 dimensions!',
    checkQuestions: [
      {
        id: 'fl-pc-c4-q1',
        prompt: 'Eliminate parameter t in x(t) = t + 2 and y(t) = t² − 1. What is the y-value when x = 7?',
        promptTex: 't = x - 2 \\implies y = (x - 2)^2 - 1',
        type: 'numeric',
        correctAnswer: 24,
        tolerance: 0.01,
        hint: 'Find t when x = 7 (t = 5), then compute y(5).',
        visualKind: 'parametric-velocity',
        solutionSteps: [
          { label: 'Solve Parameter t From x = 7', tex: '7 = t + 2 \\implies t = 5', note: 'Particle reaches x = 7 at t = 5.' },
          { label: 'Evaluate y(5)', tex: 'y(5) = 5^2 - 1 = 24', note: 'Equivalently (7 − 2)² − 1 = 24.' },
        ],
      },
      {
        id: 'fl-pc-c4-q2',
        prompt: 'Which parameter elimination matches x(t) = 3 cos(t), y(t) = 2 sin(t)?',
        type: 'multiple-choice',
        options: [
          { id: 'a', label: 'Curve A', tex: '\\dfrac{x^2}{9} + \\dfrac{y^2}{4} = 1' },
          { id: 'b', label: 'Curve B', tex: '\\dfrac{x^2}{3} + \\dfrac{y^2}{2} = 1' },
          { id: 'c', label: 'Curve C', tex: 'x^2 + y^2 = 13' },
          { id: 'd', label: 'Curve D', tex: '\\dfrac{x^2}{9} - \\dfrac{y^2}{4} = 1' },
        ],
        correctAnswer: 'a',
        hint: 'Isolate cos(t) = x/3 and sin(t) = y/2, square both, and add.',
        visualKind: 'parametric-lissajous',
        solutionSteps: [
          { label: 'Isolate cos(t) and sin(t)', tex: '\\cos t = \\dfrac{x}{3}, \\qquad \\sin t = \\dfrac{y}{2}', note: 'Divide by horizontal and vertical radii.' },
          { label: 'Apply cos²t + sin²t = 1', tex: '\\left(\\dfrac{x}{3}\\right)^2 + \\left(\\dfrac{y}{2}\\right)^2 = 1 \\implies \\dfrac{x^2}{9} + \\dfrac{y^2}{4} = 1', note: 'Traces a horizontal ellipse!' },
        ],
      },
    ],
  },
  {
    id: 'pc-ch5',
    courseId: 'precalculus',
    chapterNumber: 5,
    title: 'Polar Coordinates, Complex Euler Form & Rose Curves',
    subtitle: 'Converting (r, θ) ↔ (x, y), negative radii, and radial symmetries',
    benchmarks: ['MA.912.T.4', 'MA.912.T.4.1'],
    mtrFocus: 'MA.K12.MTR.2.1 · Multiple Representations',
    bigIdea:
      'Polar coordinates aim an angle θ like a radar dish and reach outward distance r — turning multi-petal roses, cardioids, and spirals into ultra-compact one-line formulas!',
    keyFormulas: [
      { label: 'Polar-Cartesian Bridge', tex: 'x = r\\cos\\theta,\\; y = r\\sin\\theta,\\; r^2 = x^2 + y^2', visualKind: 'polar-coords' },
      { label: 'Rose Petal Parity', tex: 'r = a\\cos(n\\theta):\\; n\\text{ odd} \\to n,\\; n\\text{ even} \\to 2n', visualKind: 'polar-rose' },
      { label: 'Archimedean Spiral', tex: 'r(\\theta) = a\\theta', visualKind: 'polar-spiral' },
    ],
    interactiveTopicId: 'pc-polar',
    linkedLessonRoute: '/lesson/pc-polar',
    workedExample: {
      problem:
        'Convert the polar equation r = 6 cos(θ) into rectangular Cartesian form to reveal what shape it actually draws.',
      problemTex: 'r = 6\\cos\\theta \\xrightarrow{\\times r} r^2 = 6(r\\cos\\theta)',
      steps: [
        {
          title: 'Multiply Both Sides by r',
          tex: 'r^2 = 6 r\\cos\\theta',
          note: 'Prepares both sides for r² = x² + y² and x = r cos θ.',
        },
        {
          title: 'Substitute Rectangular Equivalents',
          tex: 'x^2 + y^2 = 6x \\implies x^2 - 6x + y^2 = 0',
          note: 'Move 6x left to prepare completing the square.',
        },
        {
          title: 'Complete the Square in x',
          tex: '(x - 3)^2 + y^2 = 9',
          note: 'Reveals a circle of radius 3 centered at (3, 0)!',
        },
      ],
    },
    eocTrap:
      'Thinking (−4, π/6) doesn’t exist or sits in Quadrant I! A negative radius walks BACKWARD through the origin onto ray π/6 + π = 7π/6 in Quadrant III.',
    frontierConnection:
      'Circular antenna arrays, orbital phase diagrams, and the Hopf fibration S³ → S² linking polar angles across 4D spheres use angular-radial coordinates natively.',
    checkQuestions: [
      {
        id: 'fl-pc-c5-q1',
        prompt: 'What is the Cartesian y-coordinate of the polar point (r = 8, θ = 5π/6)?',
        promptTex: 'y = 8\\sin\\left(\\dfrac{5\\pi}{6}\\right)',
        type: 'numeric',
        correctAnswer: 4,
        tolerance: 0.01,
        hint: 'In Quadrant II, sin(5π/6) = +1/2.',
        visualKind: 'polar-coords',
        solutionSteps: [
          { label: 'Evaluate sin(5π/6)', tex: '\\sin\\left(\\dfrac{5\\pi}{6}\\right) = \\dfrac{1}{2}', note: 'Reference angle is π/6 in Quadrant II.' },
          { label: 'Multiply by Radius r = 8', tex: 'y = 8\\left(\\dfrac{1}{2}\\right) = 4', note: 'Cartesian point is (−4√3, 4).' },
        ],
      },
      {
        id: 'fl-pc-c5-q2',
        prompt: 'How many petals does the polar curve r = 7 sin(6θ) trace?',
        promptTex: 'n = 6 \\text{ (even)} \\implies 2n \\text{ petals}',
        type: 'numeric',
        correctAnswer: 12,
        tolerance: 0.01,
        unitLabel: 'petals',
        hint: 'When n is even, both positive and negative lobes trace distinct petals, doubling n to 2n.',
        visualKind: 'polar-rose',
        solutionSteps: [
          { label: 'Check Parity of n = 6', tex: 'n = 6 \\text{ is EVEN}', note: 'Even n prevents petals from overlapping over [0, 2π].' },
          { label: 'Double n', tex: '2n = 2(6) = 12\\text{ petals}', note: '12 symmetric petals of length 7.' },
        ],
      },
    ],
  },
  {
    id: 'pc-ch6',
    courseId: 'precalculus',
    chapterNumber: 6,
    title: 'Conic Sections, Foci, Eccentricity & Orbital Mechanics',
    subtitle: 'Circles, parabolas (focus-directrix), ellipses, hyperbolas, and e = c/a',
    benchmarks: ['MA.912.GR.7', 'MA.912.GR.7.4', 'MA.912.GR.7.5'],
    mtrFocus: 'MA.K12.MTR.7.1 · Real-World Modeling',
    bigIdea:
      'Every conic section comes from slicing a 3D double cone — and one magic ratio e = c / a classifies the entire universe of orbits: e = 0 circle, 0 < e < 1 planet ellipse, e = 1 parabolic escape, e > 1 hyperbolic flyby!',
    keyFormulas: [
      { label: 'Ellipse & Foci Conservation', tex: '\\dfrac{x^2}{a^2} + \\dfrac{y^2}{b^2} = 1,\\quad c^2 = a^2 - b^2', visualKind: 'ellipse-foci' },
      { label: 'Hyperbola Asymptotes', tex: '\\dfrac{x^2}{a^2} - \\dfrac{y^2}{b^2} = 1,\\quad y = \\pm\\dfrac{b}{a}x', visualKind: 'hyperbola-asym' },
      { label: 'Conic Eccentricity e', tex: 'e = \\dfrac{c}{a} \\in [0, \\infty)', visualKind: 'conic-eccentricity' },
    ],
    interactiveTopicId: 'pc-conics',
    linkedLessonRoute: '/lesson/pc-conics',
    workedExample: {
      problem:
        'A whispering gallery arch is modeled by x²/100 + y²/36 = 1 (meters). Find where the two acoustic foci sit and derive the parabola x² = 4py with focus (0, 3) and directrix y = −3.',
      problemTex: '\\dfrac{x^2}{100} + \\dfrac{y^2}{36} = 1, \\qquad (x - 0)^2 = 4p(y - 0)',
      steps: [
        {
          title: 'Compute Ellipse Focal Distance c',
          tex: 'c = \\sqrt{a^2 - b^2} = \\sqrt{100 - 36} = \\sqrt{64} = 8\\text{ m}',
          note: 'Whispering at (−8, 0) reflects cleanly off the ceiling to (+8, 0).',
        },
        {
          title: 'Find Eccentricity e of the Arch',
          tex: 'e = \\dfrac{c}{a} = \\dfrac{8}{10} = 0.80',
          note: '0 < 0.80 < 1 confirms an ellipse.',
        },
        {
          title: 'Write Parabola Equation From Focus (0, 3)',
          tex: 'p = 3 \\implies x^2 = 4(3)y = 12y \\;\\text{ (or } y = \\tfrac{1}{12}x^2\\text{)}',
          note: 'Every point on y = x²/12 is equidistant from focus (0, 3) and directrix y = −3.',
        },
      ],
    },
    eocTrap:
      'Mixing up the focal sign between ellipses and hyperbolas: Ellipses subtract (c² = a² − b² because c < a), while Hyperbolas add (c² = a² + b² because c > a)!',
    frontierConnection:
      'Kepler’s First Law proved planets orbit the Sun in ellipses, while gravitational lensing around black holes follows hyperbolic/conic geodesics — explore slicing Apollonius’s double cone in 3D inside our /instruments Lab!',
    checkQuestions: [
      {
        id: 'fl-pc-c6-q1',
        prompt: 'A parabolic solar dish has equation x² = 16y with vertex at (0, 0). How many meters above the vertex does its focal receiver sit (p)?',
        promptTex: 'x^2 = 4py = 16y',
        type: 'numeric',
        correctAnswer: 4,
        tolerance: 0.01,
        unitLabel: 'm',
        hint: 'Match 4p = 16 to find focal distance p.',
        visualKind: 'conic-eccentricity',
        solutionSteps: [
          { label: 'Match Focus-Directrix Form', tex: 'x^2 = 4py', note: 'p is the distance from vertex to focus.' },
          { label: 'Solve 4p = 16', tex: '4p = 16 \\implies p = 4\\text{ m}', note: 'Focus sits at (0, 4); directrix is y = −4.' },
        ],
      },
      {
        id: 'fl-pc-c6-q2',
        prompt: 'For the hyperbola x²/25 − y²/144 = 1, compute the slope magnitude m = b/a of its asymptote y = ±(b/a)x.',
        promptTex: 'y = \\pm\\dfrac{b}{a}x',
        type: 'numeric',
        correctAnswer: 2.4,
        tolerance: 0.02,
        hint: 'Take a = √25 = 5 and b = √144 = 12, then compute 12 / 5.',
        visualKind: 'hyperbola-asym',
        solutionSteps: [
          { label: 'Extract Semi-Axes a and b', tex: 'a = \\sqrt{25} = 5, \\qquad b = \\sqrt{144} = 12', note: 'Notice x² comes first, so a² = 25.' },
          { label: 'Compute Asymptote Slope', tex: '\\dfrac{b}{a} = \\dfrac{12}{5} = 2.4', note: 'Asymptotes are y = ±2.4x.' },
        ],
      },
    ],
  },
  {
    id: 'pc-ch7',
    courseId: 'precalculus',
    chapterNumber: 7,
    title: 'Infinite Series & Calculus Limit Foundations',
    subtitle: 'Convergent sums S_∞ = a₁/(1−r), removable holes, and secant-to-tangent limits',
    benchmarks: ['MA.912.AR.10.1', 'MA.912.AR.10.2', 'MA.912.C.1'],
    mtrFocus: 'MA.K12.MTR.1.1 · Effortful Perseverance',
    bigIdea:
      'Infinity becomes exact when you control limits: infinitely many shrinking steps add up to a crisp finite sum a₁/(1 − r), and letting step width h → 0 snaps an average secant into an exact tangent slope!',
    keyFormulas: [
      { label: 'Infinite Geometric Sum', tex: 'S_\\infty = \\dfrac{a_1}{1 - r} \\quad (|r| < 1)', visualKind: 'series-square-split' },
      { label: 'Secant-to-Tangent Derivative', tex: 'f\'(x) = \\lim_{h \\to 0} \\dfrac{f(x+h) - f(x)}{h}', visualKind: 'secant-to-tangent' },
      { label: 'Two-Sided Limit Convergence', tex: '\\lim_{x \\to c^-} f(x) = \\lim_{x \\to c^+} f(x) = L', visualKind: 'limit-approach' },
    ],
    interactiveTopicId: 'pc-limits',
    linkedLessonRoute: '/lesson/pc-limits',
    workedExample: {
      problem:
        'Find the instantaneous derivative slope f′(3) of f(x) = x² − 2x using the difference-quotient limit as h → 0.',
      problemTex: 'f\'(3) = \\lim_{h \\to 0} \\dfrac{f(3+h) - f(3)}{h}',
      steps: [
        {
          title: 'Evaluate f(3) and f(3 + h)',
          tex: 'f(3) = 9 - 6 = 3; \\quad f(3+h) = (3+h)^2 - 2(3+h) = 3 + 4h + h^2',
          note: 'Expand (3 + h)² = 9 + 6h + h² carefully.',
        },
        {
          title: 'Cancel Common Factor h in Quotient',
          tex: '\\dfrac{(3 + 4h + h^2) - 3}{h} = \\dfrac{h(4 + h)}{h} = 4 + h \\quad (h \\ne 0)',
          note: 'Removes the 0/0 algebraic indeterminacy.',
        },
        {
          title: 'Take the Limit as h → 0',
          tex: 'f\'(3) = \\lim_{h \\to 0}(4 + h) = 4',
          note: 'Tangent line at (3, 3) has exact slope 4.',
        },
      ],
    },
    eocTrap:
      'Stopping at 0/0 and declaring "Does Not Exist!" — 0/0 is an invitation to factor, rationalize, or simplify so the true finite limit emerges!',
    frontierConnection:
      'String theory computes scattering amplitudes by summing infinite series over string worldsheet loops (genus g = 0, 1, 2, …) and taking derivatives of curved action integrals — the exact bridge from Precalculus into AP Calculus and theoretical physics!',
    checkQuestions: [
      {
        id: 'fl-pc-c7-q1',
        prompt: 'Find the infinite geometric series sum 12 + 4 + 4/3 + 4/9 + …',
        promptTex: 'S_\\infty = \\dfrac{12}{1 - 1/3}',
        type: 'numeric',
        correctAnswer: 18,
        tolerance: 0.05,
        hint: 'Identify first term a₁ = 12 and ratio r = 4/12 = 1/3, then apply a₁/(1 − r).',
        visualKind: 'series-square-split',
        solutionSteps: [
          { label: 'Find Common Ratio r', tex: 'r = \\dfrac{4}{12} = \\dfrac{1}{3} \\quad (|r| < 1)', note: 'Convergent geometric series.' },
          { label: 'Apply Convergence Formula', tex: 'S_\\infty = \\dfrac{12}{1 - 1/3} = \\dfrac{12}{2/3} = 18', note: 'Infinite sum converges to 18.' },
        ],
      },
      {
        id: 'fl-pc-c7-q2',
        prompt: 'Evaluate the derivative slope f′(5) of f(x) = x² using lim (h → 0) [(5 + h)² − 25] / h.',
        promptTex: 'f\'(5) = \\lim_{h \\to 0} \\dfrac{(5 + h)^2 - 25}{h}',
        type: 'numeric',
        correctAnswer: 10,
        tolerance: 0.01,
        hint: 'Expand (5 + h)² − 25 = 10h + h², factor and cancel h, then set h = 0.',
        visualKind: 'secant-to-tangent',
        solutionSteps: [
          { label: 'Expand & Simplify Numerator', tex: '(25 + 10h + h^2) - 25 = 10h + h^2', note: 'Constant 25 cancels cleanly.' },
          { label: 'Cancel h & Take Limit', tex: '\\lim_{h \\to 0} \\dfrac{h(10 + h)}{h} = \\lim_{h \\to 0}(10 + h) = 10', note: 'Exact tangent slope at x = 5 is 10.' },
        ],
      },
    ],
  },
];
