import { PracticeQuestion } from '../../components/PracticeEngine';
import { CourseId } from '../standards';
import { ExtendedTopicId } from '../../visuals/topics/extendedTopicRenderers';

export interface TopicLessonSpec {
  id: string;
  courseId: CourseId;
  code: string;
  title: string;
  lead: string;
  axioms: { label: string; tex: string; note: string }[];
  steps: { title: string; tex: string; note: string }[];
  questions: PracticeQuestion[];
  misconception: {
    title: string;
    falseTex: string;
    trueTex: string;
    explanation: string;
  };
  application: {
    title: string;
    context: string;
    formulaTex: string;
  };
  standards: string[];
}

export const EXTENDED_TOPIC_SPECS: Record<ExtendedTopicId, TopicLessonSpec> = {
  'a1-abs-piecewise': {
    id: 'a1-abs-piecewise',
    courseId: 'algebra-1',
    code: 'A1-06',
    title: 'Absolute Value Transformations & Piecewise Functions',
    lead: 'Absolute value measures unsigned distance |x − h| from center h, bending a straight line into a symmetric V-corner whose slopes mirror across x = h.',
    axioms: [
      {
        label: 'Vertex Transformation Law',
        tex: 'f(x) = a|x - h| + k, \\quad V = (h, k)',
        note: 'Parameter a scales and reflects wing steepness; (h, k) relocates the sharp corner.',
      },
      {
        label: 'Distance Equation Split',
        tex: '|x - h| = d \\iff x = h - d \\;\\text{ or }\\; x = h + d \\quad (d \\ge 0)',
        note: 'Two points sit symmetrically distance d to the left and right of center h.',
      },
      {
        label: 'Piecewise Domain Definition',
        tex: '|u| = \\begin{cases} u & u \\ge 0 \\\\ -u & u < 0 \\end{cases}',
        note: 'Every absolute value function is natively a two-branch continuous piecewise function.',
      },
    ],
    steps: [
      {
        title: 'Step 1 · Isolate the Absolute Value Expression',
        tex: '2|x - 3| - 4 = 6 \\implies 2|x - 3| = 10 \\implies |x - 3| = 5',
        note: 'Always isolate |x − h| before splitting into two distance branches.',
      },
      {
        title: 'Step 2 · Split Into Symmetric Distance Cases',
        tex: 'x - 3 = +5 \\qquad \\text{or} \\qquad x - 3 = -5',
        note: 'Both +5 and −5 sit exactly 5 units away from zero.',
      },
      {
        title: 'Step 3 · Solve Both Linear Branches',
        tex: 'x = 8 \\qquad \\text{or} \\qquad x = -2',
        note: 'Notice their midpoint is (8 + (−2))/2 = 3, matching the vertex center h = 3.',
      },
      {
        title: 'Step 4 · Verify Both Roots on V-Graph',
        tex: '2|8 - 3| - 4 = 6,\\qquad 2|-2 - 3| - 4 = 6',
        note: 'Horizontal line y = 6 slices both wings symmetrically at x = −2 and x = 8.',
      },
    ],
    questions: [
      {
        id: 'a1abs-1',
        prompt: 'What is the x-coordinate of the vertex of f(x) = −2|x − 5| + 7?',
        promptTex: 'f(x) = -2|x - 5| + 7',
        type: 'numeric',
        correctAnswer: 5,
        tolerance: 0.01,
        hint: 'Set the interior expression x − 5 = 0 to find h.',
        solutionSteps: [
          { label: 'Match Vertex Form', tex: 'h = 5,\\; k = 7 \\implies V(5, 7)', note: 'Vertex sits at x = 5.' },
        ],
      },
      {
        id: 'a1abs-2',
        prompt: 'Find the larger solution of |x − 4| = 9.',
        promptTex: '|x - 4| = 9',
        type: 'numeric',
        correctAnswer: 13,
        tolerance: 0.01,
        hint: 'Move 9 units right from center 4.',
        solutionSteps: [
          { label: 'Positive Branch', tex: 'x - 4 = 9 \\implies x = 13', note: 'Other branch gives x = −5.' },
        ],
      },
      {
        id: 'a1abs-3',
        prompt: 'How many real solutions does |x + 2| = −3 have?',
        promptTex: '|x + 2| = -3',
        type: 'multiple-choice',
        options: [
          { id: 'a', label: '0 real solutions (distance cannot be negative)' },
          { id: 'b', label: '1 solution: x = −5' },
          { id: 'c', label: '2 solutions: x = 1 and x = −5' },
          { id: 'd', label: 'Infinitely many solutions' },
        ],
        correctAnswer: 'a',
        hint: 'Distance |u| is always ≥ 0.',
        solutionSteps: [
          { label: 'Non-Negativity Axiom', tex: '|x + 2| \\ge 0 > -3 \\implies \\emptyset', note: 'Empty solution set.' },
        ],
      },
    ],
    misconception: {
      title: 'Horizontal Shift Sign Reversal in |x − h|',
      falseTex: '|x - 2| \\text{ shifts 2 units LEFT} \\quad (\\text{FALSE})',
      trueTex: '|x - 2| \\text{ shifts 2 units RIGHT to } V(2, 0) \\quad (\\text{TRUE})',
      explanation:
        'The V-corner occurs where the inside equals zero: x − 2 = 0 solves to x = +2, moving the vertex right.',
    },
    application: {
      title: 'Precision CNC Tolerance & Tax Bracket Piecewise Tiers',
      context:
        'Aerospace machining specifies part thickness within tolerance |t − 12.5| ≤ 0.02 mm, while utility billing and progressive taxes use piecewise continuous linear rates.',
      formulaTex: '|t - t_{\\text{target}}| \\le \\varepsilon',
    },
    standards: ['MA.912.AR.4.3', 'MA.912.F.2.1'],
  },

  'a1-radicals-exp': {
    id: 'a1-radicals-exp',
    courseId: 'algebra-1',
    code: 'A1-03',
    title: 'Laws of Exponents, Rational Powers & Radical Functions',
    lead: 'Fractional exponents seamlessly unite powers and roots — turning square roots into smooth power curves x^(1/2) governed by identical algebraic laws.',
    axioms: [
      {
        label: 'Product & Quotient Exponent Laws',
        tex: 'a^m \\cdot a^n = a^{m+n}, \\qquad \\dfrac{a^m}{a^n} = a^{m-n}',
        note: 'Multiplying shared bases adds exponents; dividing subtracts them.',
      },
      {
        label: 'Rational Exponent Bridge',
        tex: 'x^{m/n} = \\sqrt[n]{x^m} = \\left(\\sqrt[n]{x}\\right)^m',
        note: 'Numerator m raises the power; denominator n sets the root index.',
      },
      {
        label: 'Square-Root Domain Wall',
        tex: 'f(x) = a\\sqrt{x - h} + k \\implies \\text{Domain: } x \\ge h',
        note: 'Over the real numbers ℝ, the radicand x − h cannot drop below zero.',
      },
    ],
    steps: [
      {
        title: 'Step 1 · Rewrite Radical as Rational Power',
        tex: '\\sqrt[3]{8^2} = 8^{2/3}',
        note: 'Index 3 becomes the denominator; exponent 2 is the numerator.',
      },
      {
        title: 'Step 2 · Apply Root First to Keep Numbers Small',
        tex: '8^{2/3} = \\left(8^{1/3}\\right)^2 = (2)^2',
        note: 'Taking the cube root of 8 first yields 2 immediately.',
      },
      {
        title: 'Step 3 · Raise Result to Integer Power',
        tex: '2^2 = 4',
        note: 'Exact evaluation without large intermediate powers.',
      },
      {
        title: 'Step 4 · Verify Domain of Radical Graph',
        tex: 'g(x) = \\sqrt{x + 3} \\implies x + 3 \\ge 0 \\implies x \\ge -3',
        note: 'Curve originates smoothly at endpoint (−3, 0) and arcs rightward.',
      },
    ],
    questions: [
      {
        id: 'a1rad-1',
        prompt: 'Evaluate 27^(2/3) exactly.',
        promptTex: '27^{2/3} = \\left(\\sqrt[3]{27}\\right)^2',
        type: 'numeric',
        correctAnswer: 9,
        tolerance: 0.01,
        hint: 'Cube root of 27 is 3; then square 3.',
        solutionSteps: [
          { label: 'Cube Root', tex: '27^{1/3} = 3', note: '3³ = 27.' },
          { label: 'Square', tex: '3^2 = 9', note: 'Exact integer result.' },
        ],
      },
      {
        id: 'a1rad-2',
        prompt: 'Simplify (x⁴ · x³) / x² into x^k. What is k?',
        promptTex: '\\dfrac{x^4 \\cdot x^3}{x^2} = x^k',
        type: 'numeric',
        correctAnswer: 5,
        tolerance: 0.01,
        hint: 'Add 4 + 3, then subtract 2.',
        solutionSteps: [
          { label: 'Product & Quotient Rules', tex: 'x^{4+3-2} = x^5 \\implies k = 5', note: 'Combine exponents.' },
        ],
      },
      {
        id: 'a1rad-3',
        prompt: 'What is the real domain of f(x) = √(x − 6) + 2?',
        promptTex: 'f(x) = \\sqrt{x - 6} + 2',
        type: 'multiple-choice',
        options: [
          { id: 'a', label: 'Domain A', tex: 'x \\ge 6' },
          { id: 'b', label: 'Domain B', tex: 'x \\ge -6' },
          { id: 'c', label: 'Domain C', tex: 'x \\ge 2' },
          { id: 'd', label: 'All real numbers ℝ' },
        ],
        correctAnswer: 'a',
        hint: 'Require radicand x − 6 ≥ 0.',
        solutionSteps: [
          { label: 'Non-Negative Radicand', tex: 'x - 6 \\ge 0 \\implies x \\ge 6', note: 'Starts at (6, 2).' },
        ],
      },
    ],
    misconception: {
      title: 'Multiplying Exponents Instead of Adding Them',
      falseTex: 'x^3 \\cdot x^4 = x^{12} \\quad (\\text{FALSE})',
      trueTex: 'x^3 \\cdot x^4 = x^{3+4} = x^7 \\quad (\\text{TRUE})',
      explanation:
        'x³·x⁴ strings together 3 factors of x followed by 4 more factors, totaling 7 factors. Exponents only multiply in a power-of-a-power (x³)⁴ = x¹².',
    },
    application: {
      title: 'Pendulum Period & Tsunami Wave Speed Physics',
      context:
        'Shallow-water ocean wave speed scales with the square root of depth h, while a grandfather clock pendulum period scales with √L.',
      formulaTex: 'v = \\sqrt{g \\cdot h}, \\qquad T = 2\\pi\\sqrt{\\dfrac{L}{g}}',
    },
    standards: ['MA.912.NSO.1.1', 'MA.912.NSO.1.2'],
  },

  'a1-statistics': {
    id: 'a1-statistics',
    courseId: 'algebra-1',
    code: 'A1-09',
    title: 'Linear Regression, Least Squares & Residual Diagnostics',
    lead: 'Ordinary least-squares regression positions a single line through noisy measurements to minimize the total area of all vertical residual error squares Σ(yᵢ − ŷᵢ)².',
    axioms: [
      {
        label: 'Linear Regression Predictor',
        tex: '\\hat{y} = m x + b',
        note: 'Predicts expected output ŷ for any input x along the linear trend.',
      },
      {
        label: 'Vertical Residual Definition',
        tex: 'e_i = y_i - \\hat{y}_i \\quad (\\text{Observed} - \\text{Predicted})',
        note: 'Positive residual means the real point lies above the line; negative lies below.',
      },
      {
        label: 'Correlation r & Goodness of Fit R²',
        tex: '-1 \\le r \\le 1, \\qquad R^2 = 1 - \\dfrac{\\sum e_i^2}{\\sum (y_i - \\bar{y})^2}',
        note: 'R² measures the fraction of variance captured by the linear model.',
      },
    ],
    steps: [
      {
        title: 'Step 1 · Compute Predicted Value ŷ From Line of Fit',
        tex: '\\hat{y} = 2.5x + 10 \\implies \\hat{y}(4) = 2.5(4) + 10 = 20',
        note: 'Substitute x = 4 into the fitted regression model.',
      },
      {
        title: 'Step 2 · Subtract Predicted From Observed Data',
        tex: 'y_{\\text{obs}} = 23 \\implies e = 23 - 20 = +3',
        note: 'Residual +3 shows the data point sits 3 units above the regression trend.',
      },
      {
        title: 'Step 3 · Square Residuals to Penalize Outliers',
        tex: '\\text{SSE} = \\sum_{i=1}^n (y_i - \\hat{y}_i)^2',
        note: 'Squaring prevents positive and negative errors from cancelling out.',
      },
      {
        title: 'Step 4 · Inspect Residual Plot Randomness',
        tex: '\\text{No U-curve pattern in } e_i \\implies \\text{Linear model appropriate}',
        note: 'A curved residual plot warns that a quadratic or exponential model fits better.',
      },
    ],
    questions: [
      {
        id: 'a1stat-1',
        prompt: 'A regression model is ŷ = 4x + 6. An observed point is (5, 29). Find its residual e = y − ŷ.',
        promptTex: 'e = y - \\hat{y},\\quad \\hat{y}(5) = 4(5) + 6',
        type: 'numeric',
        correctAnswer: 3,
        tolerance: 0.01,
        hint: 'First compute ŷ(5) = 26, then subtract 29 − 26.',
        solutionSteps: [
          { label: 'Predict', tex: '\\hat{y} = 4(5) + 6 = 26', note: 'Model prediction.' },
          { label: 'Residual', tex: 'e = 29 - 26 = +3', note: 'Observed exceeds predicted by 3.' },
        ],
      },
      {
        id: 'a1stat-2',
        prompt: 'If correlation coefficient r = −0.90, what is the coefficient of determination R²?',
        promptTex: 'R^2 = (-0.90)^2',
        type: 'numeric',
        correctAnswer: 0.81,
        tolerance: 0.01,
        hint: 'Square −0.90.',
        solutionSteps: [
          { label: 'Square Correlation', tex: '(-0.90)^2 = 0.81', note: '81% of variance explained linearly.' },
        ],
      },
      {
        id: 'a1stat-3',
        prompt: 'What does a strong U-shaped curve in a residual plot indicate?',
        type: 'multiple-choice',
        options: [
          { id: 'a', label: 'A nonlinear (e.g., quadratic) model would fit better than a straight line' },
          { id: 'b', label: 'The linear model is guaranteed exact (R² = 1)' },
          { id: 'c', label: 'Correlation r must be positive' },
          { id: 'd', label: 'All residuals equal zero' },
        ],
        correctAnswer: 'a',
        hint: 'Good linear fits scatter residuals randomly around 0 with no systematic curve.',
        solutionSteps: [
          { label: 'Diagnostic Rule', tex: '\\text{Curved } e_i \\implies \\text{nonlinear structure missed}', note: 'Switch to polynomial/exponential regression.' },
        ],
      },
    ],
    misconception: {
      title: 'Confusing Correlation With Causation & Reversing Residual Sign',
      falseTex: 'e = \\hat{y} - y \\quad \\text{or} \\quad r \\approx 0.95 \\implies X \\text{ causes } Y',
      trueTex: 'e = y_{\\text{obs}} - \\hat{y}_{\\text{pred}} \\quad (\\text{Association} \\ne \\text{Causation})',
      explanation:
        'Residuals always measure Actual minus Predicted so positive errors lie visibly ABOVE the line. High r measures linear co-movement, never causal proof without a controlled experiment.',
    },
    application: {
      title: 'Climate Trend Modeling & Machine Learning Loss Functions',
      context:
        'Mean Squared Error (MSE = SSE / n) in linear regression is the exact foundational loss function used to train neural networks.',
      formulaTex: '\\mathcal{L}(m, b) = \\dfrac{1}{n}\\sum_{i=1}^n \\big(y_i - (mx_i + b)\\big)^2',
    },
    standards: ['MA.912.DP.2.4', 'MA.912.DP.2.9'],
  },

  'g-parallel-angles': {
    id: 'g-parallel-angles',
    courseId: 'geometry',
    code: 'G-01',
    title: 'Parallel Lines, Transversals & Deductive Angle Proofs',
    lead: 'When a single transversal slices two parallel rails, eight angles collapse into just two exact supplementary measures α and β = 180° − α.',
    axioms: [
      {
        label: 'Alternate Interior Congruence',
        tex: '\\ell_1 \\parallel \\ell_2 \\iff \\angle_{\\text{alt. int. 1}} \\cong \\angle_{\\text{alt. int. 2}}',
        note: 'Opposite sides of the transversal inside the parallel corridor match identically.',
      },
      {
        label: 'Corresponding Angles Postulate',
        tex: '\\ell_1 \\parallel \\ell_2 \\iff \\angle_1 \\cong \\angle_5',
        note: 'Translating one intersection along the transversal maps matching corners directly onto each other.',
      },
      {
        label: 'Linear Pair & Same-Side Interior',
        tex: '\\alpha + \\beta = 180^\\circ',
        note: 'Adjacent angles on a straight line — and same-side interior angles — are always supplementary.',
      },
    ],
    steps: [
      {
        title: 'Step 1 · Identify Parallel Hypothesis ℓ₁ ∥ ℓ₂',
        tex: '\\angle_1 = (3x + 15)^\\circ,\\quad \\angle_2 = (5x - 25)^\\circ \\text{ (alt. interior)}',
        note: 'Locate whether the given pair is congruent or supplementary.',
      },
      {
        title: 'Step 2 · Set Equal by Alternate Interior Theorem',
        tex: '3x + 15 = 5x - 25',
        note: 'Parallel rails guarantee alternate interior angles have identical measure.',
      },
      {
        title: 'Step 3 · Solve Linear Equation for x',
        tex: '40 = 2x \\implies x = 20',
        note: 'Isolate variable x cleanly.',
      },
      {
        title: 'Step 4 · Recover Both Supplementary Measures',
        tex: '\\alpha = 3(20) + 15 = 75^\\circ,\\qquad \\beta = 180^\\circ - 75^\\circ = 105^\\circ',
        note: 'All eight angles across the parallel system are either 75° or 105°.',
      },
    ],
    questions: [
      {
        id: 'gpa-1',
        prompt: 'Two parallel lines are cut by a transversal. One acute angle measures 58°. Find its supplementary consecutive interior angle (in degrees).',
        promptTex: '58^\\circ + \\beta = 180^\\circ',
        type: 'numeric',
        correctAnswer: 122,
        tolerance: 0.1,
        unitLabel: '°',
        hint: 'Consecutive (same-side) interior angles sum to 180°.',
        solutionSteps: [
          { label: 'Supplementary Sum', tex: '\\beta = 180^\\circ - 58^\\circ = 122^\\circ', note: 'Adds to 180°.' },
        ],
      },
      {
        id: 'gpa-2',
        prompt: 'Alternate interior angles measure (4x − 10)° and (2x + 30)°. Solve for x.',
        promptTex: '4x - 10 = 2x + 30',
        type: 'numeric',
        correctAnswer: 20,
        tolerance: 0.01,
        hint: 'Set them equal: 2x = 40.',
        solutionSteps: [
          { label: 'Equate Angles', tex: '2x = 40 \\implies x = 20', note: 'Each angle measures 70°.' },
        ],
      },
      {
        id: 'gpa-3',
        prompt: 'Which pair of angles formed by parallel lines and a transversal is ALWAYS supplementary (sums to 180°)?',
        type: 'multiple-choice',
        options: [
          { id: 'a', label: 'Same-side (consecutive) interior angles' },
          { id: 'b', label: 'Alternate interior angles' },
          { id: 'c', label: 'Corresponding angles' },
          { id: 'd', label: 'Vertical angles' },
        ],
        correctAnswer: 'a',
        hint: 'Vertical, corresponding, and alternate interior angles are congruent, not necessarily supplementary.',
        solutionSteps: [
          { label: 'Consecutive Interior Theorem', tex: '\\angle_3 + \\angle_5 = 180^\\circ', note: 'Always supplementary.' },
        ],
      },
    ],
    misconception: {
      title: 'Setting Consecutive Interior Angles Equal Instead of Summing to 180°',
      falseTex: '\\angle_{\\text{same-side int. 1}} = \\angle_{\\text{same-side int. 2}} \\quad (\\text{FALSE unless } 90^\\circ)',
      trueTex: '\\angle_{\\text{same-side int. 1}} + \\angle_{\\text{same-side int. 2}} = 180^\\circ \\quad (\\text{TRUE})',
      explanation:
        'Notice visually on a tilted transversal: one same-side interior wedge is clearly acute (< 90°) while its partner is obtuse (> 90°). They combine to 180°.',
    },
    application: {
      title: 'Eratosthenes Measuring Earth’s Circumference (240 BCE)',
      context:
        'Treating parallel sunlight rays as parallel lines cut by Earth’s radial transversal, Eratosthenes equated a 7.2° shadow angle in Alexandria to the central arc angle of Earth.',
      formulaTex: 'C_{\\text{Earth}} = \\dfrac{360^\\circ}{7.2^\\circ} \\cdot d_{\\text{Syene–Alexandria}} \\approx 40{,}000\\text{ km}',
    },
    standards: ['MA.912.GR.1.1'],
  },

  'g-similarity': {
    id: 'g-similarity',
    courseId: 'geometry',
    code: 'G-03',
    title: 'Triangle Similarity, Homothety & Area Scale Ratios',
    lead: 'Dilation stretches every linear edge by constant scale factor k while preserving every angle identically — causing 2D area to multiply by k².',
    axioms: [
      {
        label: 'AA & SAS Similarity Criteria',
        tex: '\\angle A \\cong \\angle D,\\; \\angle B \\cong \\angle E \\implies \\triangle ABC \\sim \\triangle DEF',
        note: 'Two matching angles lock the third angle and force all side ratios equal.',
      },
      {
        label: 'Linear vs Area Scale Law',
        tex: '\\dfrac{P\'}{P} = k, \\qquad \\dfrac{\\text{Area}\'}{\\text{Area}} = k^2',
        note: 'Stretching width by k AND height by k multiplies 2D area by k·k = k².',
      },
      {
        label: 'Triangle Side-Splitter Theorem',
        tex: '\\overline{DE} \\parallel \\overline{BC} \\implies \\dfrac{AD}{DB} = \\dfrac{AE}{EC}',
        note: 'A line parallel to one base divides the other two sides proportionally.',
      },
    ],
    steps: [
      {
        title: 'Step 1 · Confirm Similarity via AA Criterion',
        tex: '\\angle A \\cong \\angle A\' = 40^\\circ,\\quad \\angle B \\cong \\angle B\' = 65^\\circ',
        note: 'Two congruent angle pairs guarantee identical shape.',
      },
      {
        title: 'Step 2 · Compute Scale Factor k From Matching Sides',
        tex: 'k = \\dfrac{A\'B\'}{AB} = \\dfrac{15}{6} = 2.5',
        note: 'Every linear dimension scales by 2.5×.',
      },
      {
        title: 'Step 3 · Solve Unknown Missing Side',
        tex: 'B\'C\' = 2.5 \\cdot BC = 2.5(8) = 20',
        note: 'Multiply corresponding preimage side by k.',
      },
      {
        title: 'Step 4 · Square Scale Factor for Area Ratio',
        tex: '\\text{Area}\' = k^2 \\cdot \\text{Area} = (2.5)^2 (24) = 6.25(24) = 150',
        note: 'Area grows quadratically (6.25×), not linearly.',
      },
    ],
    questions: [
      {
        id: 'gsim-1',
        prompt: 'Two triangles are similar with linear scale factor k = 3. If the smaller triangle has area 10 cm², what is the larger triangle’s area?',
        promptTex: '\\text{Area}\' = 3^2 \\cdot 10',
        type: 'numeric',
        correctAnswer: 90,
        tolerance: 0.05,
        unitLabel: 'cm²',
        hint: 'Area scales by k² = 9, not k = 3.',
        solutionSteps: [
          { label: 'Square Scale Factor', tex: 'k^2 = 3^2 = 9', note: '2D scaling factor.' },
          { label: 'Multiply Area', tex: '9 \\cdot 10 = 90\\text{ cm}^2', note: 'Final scaled area.' },
        ],
      },
      {
        id: 'gsim-2',
        prompt: 'A 2 m vertical pole casts a 1.5 m shadow while a nearby tower casts a 15 m shadow. How tall is the tower?',
        promptTex: '\\dfrac{h}{15} = \\dfrac{2}{1.5}',
        type: 'numeric',
        correctAnswer: 20,
        tolerance: 0.1,
        unitLabel: 'm',
        hint: 'Shadow ratio is 15 / 1.5 = 10.',
        solutionSteps: [
          { label: 'Scale Factor', tex: 'k = \\dfrac{15}{1.5} = 10 \\implies h = 10(2) = 20\\text{ m}', note: 'AA shadow similarity.' },
        ],
      },
      {
        id: 'gsim-3',
        prompt: 'Which criterion is sufficient to prove two triangles are SIMILAR (same shape, possibly different size)?',
        type: 'multiple-choice',
        options: [
          { id: 'a', label: 'AA (two pairs of congruent angles)' },
          { id: 'b', label: 'One pair of congruent sides' },
          { id: 'c', label: 'Equal perimeters only' },
          { id: 'd', label: 'One pair of congruent angles' },
        ],
        correctAnswer: 'a',
        hint: 'Angles lock shape completely.',
        solutionSteps: [
          { label: 'AA Similarity', tex: '\\text{Two angles match} \\implies \\text{third matches} \\implies \\sim', note: 'Verified postulate.' },
        ],
      },
    ],
    misconception: {
      title: 'Multiplying Area by k Instead of k²',
      falseTex: 'k = 2 \\implies \\text{Area doubles } (2A) \\quad (\\text{FALSE})',
      trueTex: 'k = 2 \\implies \\text{Area quadruples } (2^2 A = 4A) \\quad (\\text{TRUE})',
      explanation:
        'Doubling both horizontal and vertical dimensions packs 2 × 2 = 4 copies of the original figure inside the dilated image.',
    },
    application: {
      title: 'Architectural Scale Models & Optical Pinhole Projection',
      context:
        'Camera lenses project similar triangles onto an image sensor: sensor image height / object height = focal length / distance.',
      formulaTex: '\\dfrac{h_{\\text{image}}}{h_{\\text{object}}} = \\dfrac{f}{d}',
    },
    standards: ['MA.912.GR.1.2', 'MA.912.GR.1.6'],
  },

  'g-quadrilaterals': {
    id: 'g-quadrilaterals',
    courseId: 'geometry',
    code: 'G-05',
    title: 'Polygons, Quadrilateral Hierarchy & Diagonal Theorems',
    lead: 'Every convex n-gon slices cleanly into (n − 2) triangles summing to (n − 2)·180°, while quadrilateral families are classified cleanly by diagonal symmetry.',
    axioms: [
      {
        label: 'Polygon Interior Angle Sum',
        tex: '\\Sigma \\angle_{\\text{int}} = (n - 2)\\cdot 180^\\circ, \\qquad \\Sigma \\angle_{\\text{ext}} = 360^\\circ',
        note: 'Drawing diagonals from one vertex partitions any n-gon into n − 2 triangles.',
      },
      {
        label: 'Parallelogram Diagonal Bisection',
        tex: 'M_{AC} = M_{BD} \\iff ABCD \\text{ is a Parallelogram}',
        note: 'Opposite sides and angles match, and diagonals bisect one another at center M.',
      },
      {
        label: 'Rectangle, Rhombus & Square Lock',
        tex: '\\text{Rect: } AC = BD, \\quad \\text{Rhombus: } AC \\perp BD, \\quad \\text{Square: Both}',
        note: 'A square inherits every diagonal property of both rectangles and rhombi.',
      },
    ],
    steps: [
      {
        title: 'Step 1 · Triangulate Convex n-Gon From One Vertex',
        tex: 'n = 6 \\text{ (Hexagon)} \\implies 6 - 2 = 4 \\text{ triangles}',
        note: 'Three diagonals from one vertex split a hexagon into 4 triangles.',
      },
      {
        title: 'Step 2 · Compute Total Interior Angle Sum',
        tex: '\\Sigma = 4 \\cdot 180^\\circ = 720^\\circ',
        note: 'Each triangle contributes exactly 180°.',
      },
      {
        title: 'Step 3 · Divide Equally for Regular Polygon',
        tex: '\\theta_{\\text{each}} = \\dfrac{720^\\circ}{6} = 120^\\circ',
        note: 'Every corner of a regular honeycomb hexagon locks at 120°.',
      },
      {
        title: 'Step 4 · Audit Diagonals to Classify a Quadrilateral',
        tex: 'AC = BD \\;\\land\\; AC \\perp BD \\;\\land\\; M_{AC} = M_{BD} \\implies \\text{Square}',
        note: 'Three coordinate checks completely prove square classification.',
      },
    ],
    questions: [
      {
        id: 'gquad-1',
        prompt: 'What is the sum of interior angles of an octagon (n = 8) in degrees?',
        promptTex: '(8 - 2) \\cdot 180^\\circ',
        type: 'numeric',
        correctAnswer: 1080,
        tolerance: 0.1,
        unitLabel: '°',
        hint: 'Compute 6 × 180°.',
        solutionSteps: [
          { label: 'Polygon Formula', tex: '6 \\cdot 180^\\circ = 1080^\\circ', note: 'Six interior triangles.' },
        ],
      },
      {
        id: 'gquad-2',
        prompt: 'In a parallelogram, one angle measures 65°. What does its consecutive (adjacent) angle measure?',
        promptTex: '65^\\circ + \\beta = 180^\\circ',
        type: 'numeric',
        correctAnswer: 115,
        tolerance: 0.1,
        unitLabel: '°',
        hint: 'Consecutive angles between parallel sides are supplementary.',
        solutionSteps: [
          { label: 'Supplementary Pair', tex: '180^\\circ - 65^\\circ = 115^\\circ', note: 'Adjacent corners add to 180°.' },
        ],
      },
      {
        id: 'gquad-3',
        prompt: 'Which quadrilateral ALWAYS has perpendicular diagonals that bisect each other, even when corners are NOT 90°?',
        type: 'multiple-choice',
        options: [
          { id: 'a', label: 'Rhombus' },
          { id: 'b', label: 'Rectangle' },
          { id: 'c', label: 'Isosceles trapezoid' },
          { id: 'd', label: 'General parallelogram' },
        ],
        correctAnswer: 'a',
        hint: 'All four sides equal forces diagonal perpendicularity.',
        solutionSteps: [
          { label: 'Rhombus Diagonal Theorem', tex: 'AC \\perp BD', note: 'Consecutive equal sides form perpendicular bisectors.' },
        ],
      },
    ],
    misconception: {
      title: 'Using n·180° Instead of (n − 2)·180° for Polygons',
      falseTex: '\\Sigma \\angle_{\\text{quad}} = 4 \\cdot 180^\\circ = 720^\\circ \\quad (\\text{FALSE})',
      trueTex: '\\Sigma \\angle_{\\text{quad}} = (4 - 2) \\cdot 180^\\circ = 360^\\circ \\quad (\\text{TRUE})',
      explanation:
        'A 4-sided quadrilateral divides into only 2 triangles (not 4), giving 2 × 180° = 360°.',
    },
    application: {
      title: 'Scissor-Lift Pantograph Mechanisms & Tessellation Engineering',
      context:
        'Hydraulic scissor lifts link congruent rhombi whose perpendicular diagonals convert horizontal piston motion smoothly into pure vertical elevation.',
      formulaTex: 'h = 2L\\sin\\theta, \\qquad \\text{Diagonals } \\perp \\text{ at every height}',
    },
    standards: ['MA.912.GR.1.4', 'MA.912.GR.1.5'],
  },

  'a2-quad-systems': {
    id: 'a2-quad-systems',
    courseId: 'algebra-2',
    code: 'A2-02',
    title: 'Nonlinear Systems & Quadratic Intersections',
    lead: 'Substituting a line into a parabola or circle collapses a 2D geometric collision problem into one quadratic discriminant Δ revealing 2, 1, or 0 exact crossing points.',
    axioms: [
      {
        label: 'Substitution Reduction',
        tex: 'ax^2 + c = mx + b \\iff ax^2 - mx + (c - b) = 0',
        note: 'Equating y-expressions locates every shared x-coordinate.',
      },
      {
        label: 'Tangency Discriminant Criterion',
        tex: '\\Delta > 0 \\text{ (2 secant)},\\quad \\Delta = 0 \\text{ (1 tangent)},\\quad \\Delta < 0 \\text{ (miss)}',
        note: 'Zero discriminant Δ = 0 marks the exact grazing tangent line.',
      },
      {
        label: 'Quadratic Inequality Region',
        tex: 'y \\ge ax^2 + bx + c',
        note: 'Partitions the coordinate plane into interior/exterior curved feasibility zones.',
      },
    ],
    steps: [
      {
        title: 'Step 1 · Equate Linear and Quadratic Expressions',
        tex: '\\begin{cases} y = x^2 - 2 \\\\ y = x \\end{cases} \\implies x^2 - 2 = x',
        note: 'Both curves share the exact same y-height at intersection points.',
      },
      {
        title: 'Step 2 · Rewrite in Standard Zero Form',
        tex: 'x^2 - x - 2 = 0',
        note: 'Move all terms to one side to expose factoring structure.',
      },
      {
        title: 'Step 3 · Factor to Find Crossing x-Values',
        tex: '(x - 2)(x + 1) = 0 \\implies x = 2 \\text{ or } x = -1',
        note: 'Positive discriminant Δ = 9 confirms 2 distinct intersections.',
      },
      {
        title: 'Step 4 · Recover Paired y-Coordinates',
        tex: '(2, 2) \\quad \\text{and} \\quad (-1, -1)',
        note: 'Always report complete ordered pairs (x, y) verified in both equations.',
      },
    ],
    questions: [
      {
        id: 'a2qs-1',
        prompt: 'Find the positive x-coordinate where y = x² − 3 intersects y = 2x.',
        promptTex: 'x^2 - 3 = 2x',
        type: 'numeric',
        correctAnswer: 3,
        tolerance: 0.01,
        hint: 'Factor x² − 2x − 3 = (x − 3)(x + 1) = 0.',
        solutionSteps: [
          { label: 'Factor', tex: '(x - 3)(x + 1) = 0 \\implies x = 3', note: 'Intersects at (3, 6) and (−1, −2).' },
        ],
      },
      {
        id: 'a2qs-2',
        prompt: 'For what value of k is the horizontal line y = k tangent to y = x² + 4?',
        promptTex: 'x^2 + 4 = k \\implies \\Delta = 0',
        type: 'numeric',
        correctAnswer: 4,
        tolerance: 0.01,
        hint: 'A horizontal tangent touches directly at the vertex height.',
        solutionSteps: [
          { label: 'Vertex Tangency', tex: 'k = 4 \\implies x^2 = 0 \\text{ (single root } x = 0\\text{)}', note: 'Grazes (0, 4).' },
        ],
      },
      {
        id: 'a2qs-3',
        prompt: 'What is the maximum number of intersection points possible between a circle and a parabola?',
        type: 'multiple-choice',
        options: [
          { id: 'a', label: '4 intersection points' },
          { id: 'b', label: '2 intersection points' },
          { id: 'c', label: '1 intersection point' },
          { id: 'd', label: 'Infinitely many' },
        ],
        correctAnswer: 'a',
        hint: 'Substituting y = ax² into x² + y² = r² yields a degree-4 quartic polynomial.',
        solutionSteps: [
          { label: 'Quartic Degree', tex: 'x^2 + (ax^2)^2 = r^2 \\text{ has degree } 4', note: 'Up to 4 real crossings.' },
        ],
      },
    ],
    misconception: {
      title: 'Reporting Only One Intersection or Forgetting y-Coordinates',
      falseTex: 'x^2 = 4 \\implies x = 2 \\text{ only} \\quad (\\text{INCOMPLETE})',
      trueTex: 'x^2 = 4 \\implies (-2, 4) \\text{ and } (2, 4) \\quad (\\text{COMPLETE})',
      explanation:
        'A parabola bends symmetrically, so a secant line almost always enters and exits at TWO ordered pairs (x, y).',
    },
    application: {
      title: 'Radar Intercept & Drone Ballistic Collision Detection',
      context:
        'Guidance computers intersect linear laser-beam paths with parabolic gravity trajectories in real time to predict exact interception coordinates.',
      formulaTex: 'y_{\\text{beam}}(x) = y_{\\text{drone}}(x) \\implies \\text{Intercept } (x^*, y^*)',
    },
    standards: ['MA.912.AR.9.2', 'MA.912.AR.9.3'],
  },

  'a2-radicals': {
    id: 'a2-radicals',
    courseId: 'algebra-2',
    code: 'A2-03',
    title: 'Radical Equations, Function Composition & Inverses',
    lead: 'Function composition chains machines f(g(x)); true inverses undo every step across the mirror y = x — while squaring both sides of a radical can spawn ghost extraneous roots.',
    axioms: [
      {
        label: 'Composition Pipeline',
        tex: '(f \\circ g)(x) = f\\!\\big(g(x)\\big)',
        note: 'Feed x into inner machine g first, then pipe its output directly into f.',
      },
      {
        label: 'Inverse Verification Identity',
        tex: 'f\\!\\big(f^{-1}(x)\\big) = x \\quad \\land \\quad f^{-1}\\!\\big(f(x)\\big) = x',
        note: 'Swapping coordinates (x, y) ↦ (y, x) reflects the graph strictly across y = x.',
      },
      {
        label: 'Radical Squaring & Extraneous Audit',
        tex: '\\sqrt{A(x)} = B(x) \\implies A(x) = B(x)^2 \\quad \\text{requires } B(x) \\ge 0',
        note: 'Principal square root √ cannot equal a negative output; always test candidates.',
      },
    ],
    steps: [
      {
        title: 'Step 1 · Isolate Radical Before Squaring',
        tex: '\\sqrt{x + 7} = x + 1',
        note: 'Domain requires x + 1 ≥ 0 (so x ≥ −1) before squaring.',
      },
      {
        title: 'Step 2 · Square Both Sides Completely',
        tex: 'x + 7 = (x + 1)^2 = x^2 + 2x + 1',
        note: 'Expand binomial (x + 1)² carefully including the middle 2x term.',
      },
      {
        title: 'Step 3 · Solve Resulting Quadratic',
        tex: 'x^2 + x - 6 = 0 \\implies (x + 3)(x - 2) = 0 \\implies x \\in \\{-3, 2\\}',
        note: 'Algebraic squaring yields two candidates.',
      },
      {
        title: 'Step 4 · Reject Extraneous Ghost Branch',
        tex: 'x = 2: \\sqrt{9} = 3 \\;(\\checkmark), \\qquad x = -3: \\sqrt{4} = 2 \\ne -2 \\;(\\times)',
        note: 'x = −3 hits the ghost negative −√ branch and must be rejected.',
      },
    ],
    questions: [
      {
        id: 'a2rad-1',
        prompt: 'Given f(x) = 2x + 1 and g(x) = x², evaluate f(g(3)).',
        promptTex: 'f(g(3)) = 2(3^2) + 1',
        type: 'numeric',
        correctAnswer: 19,
        tolerance: 0.01,
        hint: 'First compute g(3) = 9, then apply f(9).',
        solutionSteps: [
          { label: 'Inner Machine', tex: 'g(3) = 3^2 = 9', note: 'Square 3 first.' },
          { label: 'Outer Machine', tex: 'f(9) = 2(9) + 1 = 19', note: 'Final output.' },
        ],
      },
      {
        id: 'a2rad-2',
        prompt: 'Solve √(2x + 5) = 3 for x.',
        promptTex: '\\sqrt{2x + 5} = 3',
        type: 'numeric',
        correctAnswer: 2,
        tolerance: 0.01,
        hint: 'Square both sides to get 2x + 5 = 9.',
        solutionSteps: [
          { label: 'Square & Solve', tex: '2x + 5 = 9 \\implies 2x = 4 \\implies x = 2', note: 'Check: √9 = 3 ✓.' },
        ],
      },
      {
        id: 'a2rad-3',
        prompt: 'Which graph reflection produces the inverse function f⁻¹(x)?',
        type: 'multiple-choice',
        options: [
          { id: 'a', label: 'Reflection across the diagonal line y = x' },
          { id: 'b', label: 'Reflection across the x-axis' },
          { id: 'c', label: 'Reflection across the y-axis' },
          { id: 'd', label: '90° clockwise rotation' },
        ],
        correctAnswer: 'a',
        hint: 'Inverses swap inputs and outputs: (x, y) ↦ (y, x).',
        solutionSteps: [
          { label: 'Coordinate Swap', tex: '(x, y) \\leftrightarrow (y, x)', note: 'Diagonal mirror y = x.' },
        ],
      },
    ],
    misconception: {
      title: 'Accepting Extraneous Solutions Created by Squaring',
      falseTex: '\\sqrt{x} = -4 \\implies x = 16 \\quad (\\text{FALSE — } \\sqrt{16} = +4 \\ne -4)',
      trueTex: '\\sqrt{x} = -4 \\implies \\text{No Real Solution } (\\emptyset)',
      explanation:
        'Squaring merges both +√x and −√x into one parabola, introducing ghost intersections on the negative branch that fail the original radical equation.',
    },
    application: {
      title: 'Cryptography Encryption/Decryption & Inverse Kinematics',
      context:
        'Secure messaging defines decryption D as the exact composition inverse of encryption E so D(E(m)) = m, and robotic arms solve inverse radical kinematics to place grippers.',
      formulaTex: '(D \\circ E)(m) = m, \\qquad r = \\sqrt{x^2 + y^2}',
    },
    standards: ['MA.912.AR.7.1', 'MA.912.F.3.7'],
  },

  'a2-combinatorics': {
    id: 'a2-combinatorics',
    courseId: 'algebra-2',
    code: 'A2-07',
    title: 'Permutations, Combinations & The Binomial Theorem',
    lead: 'Pascal’s luminous triangle counts how many paths reach each peg — simultaneously generating every combination C(n, k) and every coefficient of (a + b)ⁿ.',
    axioms: [
      {
        label: 'Permutations (Order Matters)',
        tex: '_nP_r = \\dfrac{n!}{(n - r)!}',
        note: 'Counts ordered rankings, passwords, or podium placements.',
      },
      {
        label: 'Combinations (Order Ignored)',
        tex: '\\binom{n}{r} = {}_nC_r = \\dfrac{n!}{r!(n - r)!}',
        note: 'Divides permutations by r! internal rearrangements to count pure subsets.',
      },
      {
        label: 'Binomial Expansion Theorem',
        tex: '(a + b)^n = \\sum_{k=0}^n \\binom{n}{k} a^{n-k} b^k',
        note: 'Row n of Pascal’s triangle directly yields all n + 1 expansion coefficients.',
      },
    ],
    steps: [
      {
        title: 'Step 1 · Decide Whether Order Matters',
        tex: '\\text{Select 3 committee members from 6} \\implies \\text{Order ignored } (C)',
        note: 'Swapping two committee members yields the exact same team.',
      },
      {
        title: 'Step 2 · Substitute Into Combination Formula',
        tex: '\\binom{6}{3} = \\dfrac{6!}{3!\\,3!} = \\dfrac{6 \\cdot 5 \\cdot 4}{3 \\cdot 2 \\cdot 1}',
        note: 'Cancel the matching 3! tail immediately.',
      },
      {
        title: 'Step 3 · Simplify Combinatorial Count',
        tex: '\\dfrac{120}{6} = 20 \\text{ unique teams}',
        note: 'Matches the central entry of Row 6 in Pascal’s triangle (1, 6, 15, 20, 15, 6, 1).',
      },
      {
        title: 'Step 4 · Connect to Binomial Coefficient',
        tex: '\\text{Coefficient of } a^3 b^3 \\text{ in } (a+b)^6 \\text{ is } \\binom{6}{3} = 20',
        note: 'Choosing 3 b’s out of 6 factors is identically a combination count.',
      },
    ],
    questions: [
      {
        id: 'a2c-1',
        prompt: 'Calculate the combination C(5, 2) — the number of ways to choose 2 items from 5.',
        promptTex: '\\binom{5}{2} = \\dfrac{5!}{2!\\,3!}',
        type: 'numeric',
        correctAnswer: 10,
        tolerance: 0.01,
        hint: 'Compute (5 × 4) / (2 × 1).',
        solutionSteps: [
          { label: 'Simplify Factorials', tex: '\\dfrac{5 \\cdot 4}{2} = 10', note: 'Row 5 of Pascal: 1, 5, 10, 10, 5, 1.' },
        ],
      },
      {
        id: 'a2c-2',
        prompt: 'How many ordered 1st-2nd-3rd podium rankings are possible among 5 sprinters?',
        promptTex: '_5P_3 = 5 \\cdot 4 \\cdot 3',
        type: 'numeric',
        correctAnswer: 60,
        tolerance: 0.01,
        hint: 'Order matters: multiply 5 × 4 × 3.',
        solutionSteps: [
          { label: 'Permutation Count', tex: '5 \\cdot 4 \\cdot 3 = 60', note: '60 distinct podiums.' },
        ],
      },
      {
        id: 'a2c-3',
        prompt: 'What is the coefficient of x²y² in the expansion of (x + y)⁴?',
        promptTex: '(x + y)^4 = x^4 + 4x^3y + ?\\,x^2y^2 + 4xy^3 + y^4',
        type: 'numeric',
        correctAnswer: 6,
        tolerance: 0.01,
        hint: 'Read the middle entry of Pascal’s 4th row: C(4, 2).',
        solutionSteps: [
          { label: 'Binomial Coefficient', tex: '\\binom{4}{2} = \\dfrac{4 \\cdot 3}{2} = 6', note: 'Row 4: 1, 4, 6, 4, 1.' },
        ],
      },
    ],
    misconception: {
      title: 'Overcounting Combinations as Permutations',
      falseTex: '\\text{3-person team from 5} = 5 \\cdot 4 \\cdot 3 = 60 \\quad (\\text{OVERCOUNTS } 3! = 6\\times)',
      trueTex: '\\binom{5}{3} = \\dfrac{60}{3!} = 10 \\text{ unique teams} \\quad (\\text{TRUE})',
      explanation:
        'Multiplying 5·4·3 counts {Alice, Bob, Cara} and {Cara, Bob, Alice} as different outcomes. Dividing by r! removes duplicate orderings.',
    },
    application: {
      title: 'Binomial Probability, Quality Testing & Network Routing',
      context:
        'Packet-loss reliability and clinical trial probabilities rely directly on binomial distributions P(X = k) = C(n, k) p^k (1 − p)^(n−k).',
      formulaTex: 'P(X = k) = \\binom{n}{k} p^k (1 - p)^{n-k}',
    },
    standards: ['MA.912.DP.4.10'],
  },

  'pc-trig-identities': {
    id: 'pc-trig-identities',
    courseId: 'precalculus',
    code: 'PC-02',
    title: 'Trigonometric Identities, Wave Conservation & Double Angles',
    lead: 'Trigonometric identities are not random algebra tricks — they are exact laws of circular energy conservation (sin²θ + cos²θ ≡ 1) and wave phase rotation.',
    axioms: [
      {
        label: 'Pythagorean Wave Conservation',
        tex: '\\sin^2\\theta + \\cos^2\\theta = 1, \\qquad 1 + \\tan^2\\theta = \\sec^2\\theta',
        note: 'Vertical and horizontal wave energies trade off identically at every instant θ.',
      },
      {
        label: 'Double-Angle Identities',
        tex: '\\sin(2\\theta) = 2\\sin\\theta\\cos\\theta, \\qquad \\cos(2\\theta) = \\cos^2\\theta - \\sin^2\\theta',
        note: 'Doubling angular speed compresses frequency 2× without ever doubling amplitude.',
      },
      {
        label: 'Angle Sum & Phase Rotation',
        tex: '\\sin(\\alpha + \\beta) = \\sin\\alpha\\cos\\beta + \\cos\\alpha\\sin\\beta',
        note: 'Directly derived from composing two 2D rotation matrices R(α)R(β).',
      },
    ],
    steps: [
      {
        title: 'Step 1 · Express Everything in Sine and Cosine',
        tex: '\\tan\\theta \\cos\\theta + \\sin\\theta = \\dfrac{\\sin\\theta}{\\cos\\theta}\\cdot\\cos\\theta + \\sin\\theta',
        note: 'Converting sec, csc, tan, cot into sin/cos reveals hidden cancellations.',
      },
      {
        title: 'Step 2 · Cancel Common Factors & Combine',
        tex: '= \\sin\\theta + \\sin\\theta = 2\\sin\\theta',
        note: 'Valid everywhere cos θ ≠ 0.',
      },
      {
        title: 'Step 3 · Apply Pythagorean Substitution',
        tex: '1 - \\cos^2\\theta = \\sin^2\\theta',
        note: 'Swap squared trig terms smoothly using the unit-circle identity.',
      },
      {
        title: 'Step 4 · Evaluate Exact Angle Sum sin(75°)',
        tex: '\\sin(45^\\circ + 30^\\circ) = \\tfrac{\\sqrt{2}}{2}\\tfrac{\\sqrt{3}}{2} + \\tfrac{\\sqrt{2}}{2}\\tfrac{1}{2} = \\dfrac{\\sqrt{6}+\\sqrt{2}}{4}',
        note: 'Builds exact non-special angles from 30° and 45°.',
      },
    ],
    questions: [
      {
        id: 'pctid-1',
        prompt: 'If sin(θ) = 0.6 and θ is in Quadrant I, what is the exact value of cos(θ)?',
        promptTex: '\\cos\\theta = \\sqrt{1 - 0.6^2}',
        type: 'numeric',
        correctAnswer: 0.8,
        tolerance: 0.01,
        hint: 'Use sin²θ + cos²θ = 1 (3-4-5 right triangle scaled by 0.2).',
        solutionSteps: [
          { label: 'Pythagorean Identity', tex: '\\cos\\theta = \\sqrt{1 - 0.36} = \\sqrt{0.64} = 0.8', note: 'Positive in QI.' },
        ],
      },
      {
        id: 'pctid-2',
        prompt: 'With sin(θ) = 0.6 and cos(θ) = 0.8, compute sin(2θ).',
        promptTex: '\\sin(2\\theta) = 2\\sin\\theta\\cos\\theta',
        type: 'numeric',
        correctAnswer: 0.96,
        tolerance: 0.01,
        hint: 'Multiply 2 × 0.6 × 0.8.',
        solutionSteps: [
          { label: 'Double Angle', tex: '2(0.6)(0.8) = 0.96', note: 'Strictly ≤ 1 (never 1.2!).' },
        ],
      },
      {
        id: 'pctid-3',
        prompt: 'Simplify (1 − cos²θ) / sin(θ) for sin(θ) ≠ 0.',
        promptTex: '\\dfrac{1 - \\cos^2\\theta}{\\sin\\theta}',
        type: 'multiple-choice',
        options: [
          { id: 'a', label: 'Identity A', tex: '\\sin\\theta' },
          { id: 'b', label: 'Identity B', tex: '\\cos\\theta' },
          { id: 'c', label: 'Identity C', tex: '\\tan\\theta' },
          { id: 'd', label: 'Identity D', tex: '1' },
        ],
        correctAnswer: 'a',
        hint: 'Replace 1 − cos²θ with sin²θ.',
        solutionSteps: [
          { label: 'Substitute & Cancel', tex: '\\dfrac{\\sin^2\\theta}{\\sin\\theta} = \\sin\\theta', note: 'Exact simplification.' },
        ],
      },
    ],
    misconception: {
      title: 'Pulling Constants Out of sin(2θ) as 2·sin(θ)',
      falseTex: '\\sin(2\\theta) = 2\\sin\\theta \\quad (\\text{FALSE — exceeds } 1!)',
      trueTex: '\\sin(2\\theta) = 2\\sin\\theta\\cos\\theta \\quad (\\text{TRUE — stays in } [-1, 1])',
      explanation:
        'Multiplying the angle by 2 speeds up horizontal wave oscillation rather than stretching vertical wave height. Notice 2·sin(60°) ≈ 1.73 > 1, impossible for sine.',
    },
    application: {
      title: 'Noise-Canceling Headphones & FM Radio Signal Modulation',
      context:
        'Acoustic wave cancellation shifts sound phase by π radians so sin(ωt) + sin(ωt + π) ≡ 0, while radio mixers use product-to-sum trig identities to separate channels.',
      formulaTex: '\\sin(\\omega t) + \\sin(\\omega t + \\pi) = 0',
    },
    standards: ['MA.912.T.1.5', 'MA.912.T.1.6'],
  },

  'pc-law-sines': {
    id: 'pc-law-sines',
    courseId: 'precalculus',
    code: 'PC-04',
    title: 'Oblique Triangles: Law of Sines, Law of Cosines & Area',
    lead: 'When a triangle has no 90° corner, every side-to-sine ratio locks to the circumcircle diameter 2R, while the Law of Cosines generalizes Pythagoras with −2ab cos(C).',
    axioms: [
      {
        label: 'Law of Sines & Circumcircle Diameter',
        tex: '\\dfrac{a}{\\sin A} = \\dfrac{b}{\\sin B} = \\dfrac{c}{\\sin C} = 2R',
        note: 'Every oblique triangle sits inside a unique circle whose diameter equals a / sin(A).',
      },
      {
        label: 'Law of Cosines (Generalized Pythagoras)',
        tex: 'c^2 = a^2 + b^2 - 2ab\\cos C',
        note: 'Reduces instantly to a² + b² = c² when C = 90° since cos(90°) = 0.',
      },
      {
        label: 'Oblique SAS Area Formula',
        tex: '\\text{Area} = \\tfrac{1}{2}ab\\sin C',
        note: 'Altitude h = b·sin(C) turns ½(base)(height) into a purely trigonometric formula.',
      },
    ],
    steps: [
      {
        title: 'Step 1 · Choose Law Based on Known Pattern',
        tex: 'a = 6,\\; b = 8,\\; C = 60^\\circ \\;(\\text{SAS}) \\implies \\text{Use Law of Cosines}',
        note: 'SAS and SSS require Law of Cosines; AAS/ASA use Law of Sines.',
      },
      {
        title: 'Step 2 · Substitute Into Generalized Pythagoras',
        tex: 'c^2 = 6^2 + 8^2 - 2(6)(8)\\cos(60^\\circ)',
        note: 'Remember cos(60°) = 0.5.',
      },
      {
        title: 'Step 3 · Compute Opposite Side Length c',
        tex: 'c^2 = 36 + 64 - 48 = 52 \\implies c = \\sqrt{52} \\approx 7.21',
        note: 'Acute angle 60° pulls side c strictly shorter than right-angle hypotenuse 10.',
      },
      {
        title: 'Step 4 · Calculate Triangle Area Instantly',
        tex: '\\text{Area} = \\tfrac{1}{2}(6)(8)\\sin(60^\\circ) = 24\\cdot\\tfrac{\\sqrt{3}}{2} = 12\\sqrt{3} \\approx 20.78',
        note: 'Zero need to drop a manual perpendicular altitude.',
      },
    ],
    questions: [
      {
        id: 'pclos-1',
        prompt: 'In △ABC, a = 10, b = 10, and included angle C = 60°. Find side c using the Law of Cosines.',
        promptTex: 'c^2 = 10^2 + 10^2 - 2(10)(10)\\cos(60^\\circ)',
        type: 'numeric',
        correctAnswer: 10,
        tolerance: 0.05,
        hint: 'cos(60°) = 0.5, so c² = 200 − 100 = 100.',
        solutionSteps: [
          { label: 'Law of Cosines', tex: 'c^2 = 100 + 100 - 100 = 100 \\implies c = 10', note: 'Equilateral triangle verified!' },
        ],
      },
      {
        id: 'pclos-2',
        prompt: 'Find the area of a triangle with sides a = 8, b = 10, and included angle C = 30°.',
        promptTex: '\\text{Area} = \\tfrac{1}{2}(8)(10)\\sin(30^\\circ)',
        type: 'numeric',
        correctAnswer: 20,
        tolerance: 0.05,
        hint: 'sin(30°) = 0.5.',
        solutionSteps: [
          { label: 'SAS Area', tex: '0.5 \\cdot 8 \\cdot 10 \\cdot 0.5 = 20', note: 'Exact area = 20 sq units.' },
        ],
      },
      {
        id: 'pclos-3',
        prompt: 'If a = 12 and opposite angle A = 30°, what is the diameter 2R of the triangle’s circumcircle?',
        promptTex: '2R = \\dfrac{a}{\\sin A} = \\dfrac{12}{\\sin 30^\\circ}',
        type: 'numeric',
        correctAnswer: 24,
        tolerance: 0.05,
        hint: 'Divide 12 by sin(30°) = 0.5.',
        solutionSteps: [
          { label: 'Circumcircle Ratio', tex: '2R = \\dfrac{12}{0.5} = 24', note: 'Radius R = 12.' },
        ],
      },
    ],
    misconception: {
      title: 'Using a² + b² = c² on Non-Right Oblique Triangles',
      falseTex: 'C = 120^\\circ \\implies c^2 = a^2 + b^2 \\quad (\\text{FALSE})',
      trueTex: 'C = 120^\\circ \\implies c^2 = a^2 + b^2 - 2ab(-0.5) = a^2 + b^2 + ab \\quad (\\text{TRUE})',
      explanation:
        'When C > 90°, cos(C) is NEGATIVE, making −2ab cos(C) positive and pushing the opposite side c significantly longer than a right-triangle hypotenuse.',
    },
    application: {
      title: 'GPS Surveying, Maritime Triangulation & Bridge Truss Forces',
      context:
        'Land surveyors measure inaccessible mountain distances across rivers from two baseline stations using ASA Law of Sines triangulation.',
      formulaTex: 'd = \\dfrac{B\\sin\\alpha}{\\sin(180^\\circ - \\alpha - \\beta)}',
    },
    standards: ['MA.912.T.1.3', 'MA.912.T.1.4'],
  },

  'pc-parametric': {
    id: 'pc-parametric',
    courseId: 'precalculus',
    code: 'PC-05',
    title: 'Parametric Motion, Velocity Vectors & Lissajous Orbits',
    lead: 'Separating horizontal position x(t) and vertical position y(t) as functions of clock time t unlocks loops, self-intersections, ballistic trajectories, and instantaneous speed vectors.',
    axioms: [
      {
        label: 'Time-Parameterized Trajectory',
        tex: '\\vec{r}(t) = \\langle x(t),\\; y(t) \\rangle',
        note: 'Captures not only WHERE a curve goes, but WHEN and HOW FAST it moves.',
      },
      {
        label: 'Ballistic Gravity Equations',
        tex: 'x(t) = (v_0\\cos\\theta)t, \\qquad y(t) = h_0 + (v_0\\sin\\theta)t - \\tfrac{1}{2}gt^2',
        note: 'Constant horizontal velocity paired with uniform downward gravitational acceleration.',
      },
      {
        label: 'Lissajous Harmonic Resonance',
        tex: 'x(t) = A\\sin(at + \\delta), \\qquad y(t) = B\\sin(bt)',
        note: 'Rational frequency ratios a : b close into woven harmonic orbital knots.',
      },
    ],
    steps: [
      {
        title: 'Step 1 · Isolate Clock Parameter t From x(t)',
        tex: 'x(t) = 2t - 1 \\implies t = \\dfrac{x + 1}{2}',
        note: 'Solve the simpler parametric component for time t.',
      },
      {
        title: 'Step 2 · Substitute t Into y(t) to Eliminate Parameter',
        tex: 'y(t) = t^2 + 3 \\implies y = \\left(\\dfrac{x + 1}{2}\\right)^2 + 3',
        note: 'Reveals the underlying Cartesian parabolic path.',
      },
      {
        title: 'Step 3 · Enforce Time-Domain Orientation (t ≥ 0)',
        tex: 't = 0 \\implies (-1, 3), \\qquad t = 2 \\implies (3, 7)',
        note: 'Curve starts at (−1, 3) and traces strictly rightward as t advances.',
      },
      {
        title: 'Step 4 · Compute Parametric Velocity Components',
        tex: '\\vec{v}(t) = \\langle x\'(t),\\; y\'(t) \\rangle = \\langle 2,\\; 2t \\rangle',
        note: 'Horizontal speed stays constant at 2 while vertical climb accelerates.',
      },
    ],
    questions: [
      {
        id: 'pcpar-1',
        prompt: 'A particle moves via x(t) = 3t and y(t) = 2t + 1. What is its y-coordinate when x = 12?',
        promptTex: '3t = 12 \\implies y(t) = 2t + 1',
        type: 'numeric',
        correctAnswer: 9,
        tolerance: 0.01,
        hint: 'Solve 3t = 12 for t = 4, then plug into y(4).',
        solutionSteps: [
          { label: 'Find Time t', tex: 't = 12 / 3 = 4', note: 'Particle reaches x = 12 at t = 4.' },
          { label: 'Evaluate y', tex: 'y(4) = 2(4) + 1 = 9', note: 'Passes through (12, 9).' },
        ],
      },
      {
        id: 'pcpar-2',
        prompt: 'What Cartesian shape is traced by x(t) = 5 cos(t), y(t) = 5 sin(t) for 0 ≤ t ≤ 2π?',
        promptTex: 'x^2 + y^2 = 25(\\cos^2 t + \\sin^2 t)',
        type: 'multiple-choice',
        options: [
          { id: 'a', label: 'A circle of radius 5 centered at the origin' },
          { id: 'b', label: 'A straight diagonal line of slope 5' },
          { id: 'c', label: 'A parabola opening upward' },
          { id: 'd', label: 'A hyperbola with asymptotes ±x' },
        ],
        correctAnswer: 'a',
        hint: 'Add x² + y² and apply cos²t + sin²t = 1.',
        solutionSteps: [
          { label: 'Eliminate t', tex: 'x^2 + y^2 = 25', note: 'Counterclockwise circle of radius 5.' },
        ],
      },
      {
        id: 'pcpar-3',
        prompt: 'If a projectile launches horizontally with vₓ = 20 m/s and hits the ground at t = 3 s, what horizontal distance x did it travel?',
        promptTex: 'x(3) = 20 \\cdot 3',
        type: 'numeric',
        correctAnswer: 60,
        tolerance: 0.1,
        unitLabel: 'm',
        hint: 'Horizontal motion ignores gravity (ignoring air drag): x = vₓ·t.',
        solutionSteps: [
          { label: 'Horizontal Range', tex: 'x(3) = 20(3) = 60\\text{ m}', note: 'Constant horizontal velocity.' },
        ],
      },
    ],
    misconception: {
      title: 'Confusing Curve Shape With Direction & Timing',
      falseTex: '\\langle \\cos t, \\sin t \\rangle \\text{ and } \\langle \\cos(-2t), \\sin(-2t) \\rangle \\text{ are identical motions}',
      trueTex: '\\text{Same circle shape, OPPOSITE direction (CW) at } 2\\times \\text{ speed}',
      explanation:
        'Eliminating parameter t only preserves the static geometric footprint — it erases starting point, orientation, and speed along the trajectory.',
    },
    application: {
      title: 'Spacecraft Orbital Docking & Oscilloscope Lissajous Tuning',
      context:
        'Electrical engineers feed two frequencies into X and Y oscilloscope axes to read exact harmonic lock ratios directly from stationary Lissajous loops.',
      formulaTex: '\\dfrac{f_x}{f_y} = \\dfrac{\\text{horizontal tangencies}}{\\text{vertical tangencies}}',
    },
    standards: ['MA.912.T.4.5', 'MA.912.T.4.7'],
  },
};
