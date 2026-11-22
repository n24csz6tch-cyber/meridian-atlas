import { useEffect, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { AlertTriangle, ArrowRight, ExternalLink, Pause, Play, Sparkles } from 'lucide-react';
import { AtlasShell } from '../components/AtlasShell';
import { LessonNavHeader } from '../components/LessonNavHeader';
import { MathTex } from '../components/MathTex';
import { PracticeEngine, PracticeQuestion } from '../components/PracticeEngine';
import { COURSES, CURRICULUM_NODES } from '../data/curriculumGraph';
import { EXTENDED_TOPIC_SPECS } from '../data/lessons/extendedLessonSpecs';
import { TOPIC_VISUAL_CONFIG } from '../data/lessons/topicVisualMappings';
import { CONSULTED_DATE, CourseId, VERIFIED_STANDARDS } from '../data/standards';
import { EquationMiniVisual } from '../visuals/equations/EquationMiniVisual';
import {
  ApplicationVisual,
  DerivationStepVisual,
  MisconceptionVisual,
} from '../visuals/equations/LessonLayerVisuals';
import { VectorParallelogramCanvas } from '../visuals/trig/VectorParallelogramCanvas';
import { TopicVisualCanvas, TopicVisualId } from '../visuals/topics/TopicVisualCanvas';

interface TopicLessonSpec {
  id: TopicVisualId;
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

const BASE_TOPIC_SPECS: Record<string, TopicLessonSpec> = {
  'a1-expressions': {
    id: 'a1-expressions',
    courseId: 'algebra-1',
    code: 'A1-01',
    title: 'Algebraic Structure & Geometric Factorization',
    lead: 'Every quadratic trinomial x² + bx + c corresponds to the area of a partitioned rectangle whose sub-blocks lock together into (x + p)(x + q).',
    axioms: [
      {
        label: 'Distributive Area Law',
        tex: '(x + p)(x + q) = x^2 + (p + q)x + pq',
        note: 'Sum of constants equals linear coefficient b; product equals constant c.',
      },
      {
        label: 'Difference of Squares',
        tex: 'a^2 - b^2 = (a - b)(a + b)',
        note: 'Symmetric cancellation eliminates the middle cross-term.',
      },
      {
        label: 'Perfect Square Trinomial',
        tex: '(x + p)^2 = x^2 + 2px + p^2',
        note: 'Two identical px strips flank the x² corner square.',
      },
    ],
    steps: [
      {
        title: 'Step 1 · Identify Target Sum and Product',
        tex: 'x^2 + 5x + 6 \\implies p + q = 5,\\quad p \\cdot q = 6',
        note: 'We seek two side lengths whose sum is 5 and area product is 6.',
      },
      {
        title: 'Step 2 · Split the Linear Strip Into Two Rectangles',
        tex: '5x = 2x + 3x',
        note: 'The 5x strip partitions cleanly into a 2×x block and a 3×x block.',
      },
      {
        title: 'Step 3 · Factor by Grouping Common Edges',
        tex: 'x(x + 2) + 3(x + 2)',
        note: 'Factor x from the top row and 3 from the bottom row.',
      },
      {
        title: 'Step 4 · Lock Final Outer Dimensions',
        tex: '(x + 2)(x + 3)',
        note: 'Total rectangle width is x + 2 and height is x + 3.',
      },
    ],
    questions: [
      {
        id: 'a1e-1',
        prompt: 'If (x + 4)(x + 3) = x² + bx + 12, what is the value of b?',
        promptTex: '(x + 4)(x + 3) = x^2 + bx + 12',
        type: 'numeric',
        correctAnswer: 7,
        tolerance: 0.01,
        hint: 'Add the two linear strip widths 4x and 3x.',
        solutionSteps: [
          { label: 'Combine Like Terms', tex: '4x + 3x = 7x \\implies b = 7', note: 'Sum of constants 4 + 3.' },
        ],
      },
      {
        id: 'a1e-2',
        prompt: 'Factor x² − 9 completely.',
        promptTex: 'x^2 - 9',
        type: 'multiple-choice',
        options: [
          { id: 'a', label: 'Factored A', tex: '(x - 3)(x + 3)' },
          { id: 'b', label: 'Factored B', tex: '(x - 3)^2' },
          { id: 'c', label: 'Factored C', tex: '(x - 9)(x + 1)' },
          { id: 'd', label: 'Factored D', tex: 'x(x - 9)' },
        ],
        correctAnswer: 'a',
        hint: 'Use difference of squares a² − b² = (a − b)(a + b).',
        solutionSteps: [
          { label: 'Difference of Squares', tex: 'x^2 - 3^2 = (x - 3)(x + 3)', note: '−3x + 3x = 0.' },
        ],
      },
    ],
    misconception: {
      title: 'The "Freshman\'s Dream" Exponent Trap',
      falseTex: '(x + 3)^2 = x^2 + 9 \\quad (\\text{FALSE})',
      trueTex: '(x + 3)^2 = x^2 + 6x + 9 \\quad (\\text{TRUE})',
      explanation:
        'Squaring a binomial means multiplying a side (x + 3) by itself. Forgetting the two 3x rectangular wings drops 6x of area.',
    },
    application: {
      title: 'Architectural Floor-Plan Expansion',
      context:
        'Adding a uniform walkway of width p around a square courtyard of side x expands total area by 2px + p², allowing instant material estimation.',
      formulaTex: 'A(x) = (x + 2p)^2 = x^2 + 4px + 4p^2',
    },
    standards: ['MA.912.AR.1'],
  },

  'a1-linear': {
    id: 'a1-linear',
    courseId: 'algebra-1',
    code: 'A1-02',
    title: 'Linear Functions, Constant Slope & Secant Triangles',
    lead: 'A function is linear if and only if every horizontal step Δx produces a proportional vertical change Δy = m·Δx anywhere along the line.',
    axioms: [
      {
        label: 'Constant Rate of Change',
        tex: 'm = \\dfrac{\\Delta y}{\\Delta x} = \\dfrac{y_2 - y_1}{x_2 - x_1}',
        note: 'All right triangles drawn beneath a line are geometrically similar.',
      },
      {
        label: 'Slope-Intercept Form',
        tex: 'f(x) = mx + b',
        note: 'Crosses the vertical axis at (0, b) and rises m units per unit step right.',
      },
      {
        label: 'Point-Slope Invariance',
        tex: 'y - y_0 = m(x - x_0)',
        note: 'Anchors a line of slope m through any known coordinate (x₀, y₀).',
      },
    ],
    steps: [
      {
        title: 'Step 1 · Measure Horizontal Run Δx',
        tex: 'P_1(1, 1),\\; P_2(5, 7) \\implies \\Delta x = 5 - 1 = 4',
        note: 'Subtract initial x-coordinate from final x-coordinate.',
      },
      {
        title: 'Step 2 · Measure Vertical Rise Δy',
        tex: '\\Delta y = 7 - 1 = 6',
        note: 'Positive Δy indicates an upward-climbing trajectory.',
      },
      {
        title: 'Step 3 · Compute Quotient Slope m',
        tex: 'm = \\dfrac{6}{4} = 1.5',
        note: 'For every 1 unit right, y increases by 1.5 units.',
      },
      {
        title: 'Step 4 · Anchor Y-Intercept b',
        tex: '1 = 1.5(1) + b \\implies b = -0.5 \\implies y = 1.5x - 0.5',
        note: 'Substitute either point to lock b.',
      },
    ],
    questions: [
      {
        id: 'a1l-1',
        prompt: 'Find the slope of the line passing through (2, 3) and (6, 15).',
        promptTex: 'm = \\dfrac{15 - 3}{6 - 2}',
        type: 'numeric',
        correctAnswer: 3,
        tolerance: 0.01,
        hint: 'Divide vertical rise 12 by horizontal run 4.',
        solutionSteps: [
          { label: 'Slope Ratio', tex: 'm = \\dfrac{12}{4} = 3', note: '3 units rise per 1 unit run.' },
        ],
      },
      {
        id: 'a1l-2',
        prompt: 'What is the x-intercept of y = 2x − 8?',
        promptTex: '0 = 2x - 8',
        type: 'numeric',
        correctAnswer: 4,
        tolerance: 0.01,
        hint: 'Set y = 0 and solve 2x = 8.',
        solutionSteps: [
          { label: 'Set y = 0', tex: '2x = 8 \\implies x = 4', note: 'Crosses x-axis at (4, 0).' },
        ],
      },
    ],
    misconception: {
      title: 'The Run-Over-Rise Inversion Trap',
      falseTex: 'm = \\dfrac{x_2 - x_1}{y_2 - y_1} \\quad (\\text{FALSE})',
      trueTex: 'm = \\dfrac{y_2 - y_1}{x_2 - x_1} \\quad (\\text{TRUE})',
      explanation:
        'Slope measures dependent output change per unit independent input change (Δy / Δx). Inverting the fraction flips steep lines into flat ones.',
    },
    application: {
      title: 'Thermal Expansion & Sensor Calibration',
      context:
        'Resistance temperature detectors map voltage linearly to Celsius temperature, where slope m is sensitivity and b is the 0°C baseline offset.',
      formulaTex: 'T(V) = m\\,V + T_0',
    },
    standards: ['MA.912.AR.2.4'],
  },

  'a1-systems': {
    id: 'a1-systems',
    courseId: 'algebra-1',
    code: 'A1-03',
    title: 'Systems of Linear Equations & Gaussian Elimination',
    lead: 'Adding a scalar multiple of one linear equation to another rotates the line around their shared intersection point without ever moving that point.',
    axioms: [
      {
        label: 'Intersection Equilibrium',
        tex: 'm_1 x^* + b_1 = m_2 x^* + b_2 \\implies x^* = \\dfrac{b_2 - b_1}{m_1 - m_2}',
        note: 'Unique solution exists whenever slopes differ (m₁ ≠ m₂).',
      },
      {
        label: 'Linear Pencil Invariance',
        tex: '(L_1 + \\lambda L_2)(x^*, y^*) = 0',
        note: 'Every linear combination passes through the same intersection point.',
      },
      {
        label: 'Parallel & Coincident Cases',
        tex: 'm_1 = m_2,\\; b_1 \\ne b_2 \\implies \\emptyset',
        note: 'Identical slopes never cross unless intercepts also match.',
      },
    ],
    steps: [
      {
        title: 'Step 1 · Align System in Standard Form',
        tex: '\\begin{cases} 2x + y = 7 \\\\ x - y = 2 \\end{cases}',
        note: 'Notice opposite coefficients +y and −y ready for elimination.',
      },
      {
        title: 'Step 2 · Add Equations to Eliminate y',
        tex: '(2x + x) + (y - y) = 7 + 2 \\implies 3x = 9',
        note: 'Geometrically rotates the combination into vertical line x = 3.',
      },
      {
        title: 'Step 3 · Solve x* and Back-Substitute',
        tex: 'x^* = 3 \\implies 3 - y^* = 2 \\implies y^* = 1',
        note: 'Substitute x = 3 into either original line.',
      },
      {
        title: 'Step 4 · Verify Equilibrium in Both Equations',
        tex: '2(3) + 1 = 7 \\checkmark, \\quad 3 - 1 = 2 \\checkmark',
        note: '(3, 1) lies on both lines simultaneously.',
      },
    ],
    questions: [
      {
        id: 'a1s-1',
        prompt: 'Find the x-coordinate of the intersection of y = 2x + 1 and y = −x + 7.',
        promptTex: '2x + 1 = -x + 7',
        type: 'numeric',
        correctAnswer: 2,
        tolerance: 0.01,
        hint: 'Add x to both sides: 3x + 1 = 7.',
        solutionSteps: [
          { label: 'Equate Outputs', tex: '3x = 6 \\implies x = 2', note: 'At x = 2, y = 5 on both lines.' },
        ],
      },
    ],
    misconception: {
      title: 'Partial Row Scaling Error',
      falseTex: '2(x + y) = 5 \\implies 2x + 2y = 5 \\quad (\\text{FALSE})',
      trueTex: '2(x + y) = 2(5) \\implies 2x + 2y = 10 \\quad (\\text{TRUE})',
      explanation:
        'Failing to multiply the right-hand constant shifts the line parallel to itself and destroys the true intersection coordinate.',
    },
    application: {
      title: 'Break-Even Economics & Circuit Node Analysis',
      context:
        'Kirchhoff current loops and supply-demand equilibrium curves intersect at the unique operating state satisfying all conservation laws simultaneously.',
      formulaTex: 'C(q) = R(q) \\implies c_{\\text{fixed}} + c_v q = p \\cdot q',
    },
    standards: ['MA.912.AR.9.1'],
  },

  'a1-exponential': {
    id: 'a1-exponential',
    courseId: 'algebra-1',
    code: 'A1-04',
    title: 'Exponential Growth, Decay & Multiplicative Scaling',
    lead: 'While linear functions add a constant amount per step, exponential functions multiply by a constant growth factor b every unit interval.',
    axioms: [
      {
        label: 'Multiplicative Recurrence',
        tex: 'f(x + 1) = b \\cdot f(x) \\implies f(x) = a \\cdot b^x',
        note: 'Initial value f(0) = a; ratio of consecutive outputs is b.',
      },
      {
        label: 'Growth vs. Decay Regimes',
        tex: 'b > 1 \\implies \\text{Growth},\\qquad 0 < b < 1 \\implies \\text{Decay}',
        note: 'Horizontal asymptote y = 0 anchors the tail.',
      },
      {
        label: 'Percentage Rate Form',
        tex: 'A(t) = A_0(1 + r)^t',
        note: 'Growth rate r = b − 1 (e.g., +15% corresponds to b = 1.15).',
      },
    ],
    steps: [
      {
        title: 'Step 1 · Read Initial Value at x = 0',
        tex: 'f(0) = 500 \\implies a = 500',
        note: 'Because b⁰ = 1, the y-intercept directly gives a.',
      },
      {
        title: 'Step 2 · Compute Constant Ratio b',
        tex: 'f(1) = 750 \\implies b = \\dfrac{750}{500} = 1.5',
        note: 'Output increases by +50% every unit step.',
      },
      {
        title: 'Step 3 · Assemble Exponential Model',
        tex: 'f(x) = 500(1.5)^x',
        note: 'Valid across integer and continuous real inputs x.',
      },
      {
        title: 'Step 4 · Project Future Value at x = 4',
        tex: 'f(4) = 500(1.5)^4 = 500(5.0625) = 2531.25',
        note: 'Compounding accelerates upward curvature.',
      },
    ],
    questions: [
      {
        id: 'a1x-1',
        prompt: 'Evaluate f(3) for the exponential function f(x) = 4 · 2ˣ.',
        promptTex: 'f(3) = 4 \\cdot 2^3',
        type: 'numeric',
        correctAnswer: 32,
        tolerance: 0.01,
        hint: 'Compute 2³ = 8 first, then multiply by 4.',
        solutionSteps: [
          { label: 'Order of Operations', tex: '4 \\cdot 8 = 32', note: 'Exponent applies only to base 2.' },
        ],
      },
    ],
    misconception: {
      title: 'Base-Coefficient Multiplication Error',
      falseTex: '4 \\cdot 2^x = 8^x \\quad (\\text{FALSE})',
      trueTex: '4 \\cdot 2^x = 2^2 \\cdot 2^x = 2^{x+2} \\quad (\\text{TRUE})',
      explanation:
        'Exponents bind before multiplication. Multiplying a·b first illegally raises initial value a to the x-th power.',
    },
    application: {
      title: 'Radioactive Half-Life & Compound Interest',
      context:
        'Carbon-14 dating and compound investment portfolios evolve multiplicatively over time intervals.',
      formulaTex: 'N(t) = N_0\\left(\\tfrac{1}{2}\\right)^{t / t_{1/2}}',
    },
    standards: ['MA.912.AR.5'],
  },

  'g-triangles': {
    id: 'g-triangles',
    courseId: 'geometry',
    code: 'G-01',
    title: 'Triangle Congruence & Rigid Euclidean Isometries',
    lead: 'Two triangles are congruent if a sequence of rigid motions — translations, rotations, and reflections — maps one figure onto the other without stretching.',
    axioms: [
      {
        label: 'SSS & SAS Postulates',
        tex: '(AB \\cong A\'B\',\\; BC \\cong B\'C\',\\; \\angle B \\cong \\angle B\') \\implies \\triangle ABC \\cong \\triangle A\'B\'C\'',
        note: 'Three sides or two sides and their included angle lock a triangle rigidly.',
      },
      {
        label: 'ASA & AAS Theorems',
        tex: '(\\angle A \\cong \\angle A\',\\; AB \\cong A\'B\',\\; \\angle B \\cong \\angle B\') \\implies \\triangle ABC \\cong \\triangle A\'B\'C\'',
        note: 'Two angles determine the third via α + β + γ = 180°.',
      },
      {
        label: 'CPCTC Invariance',
        tex: '\\triangle ABC \\cong \\triangle A\'B\'C\' \\implies \\text{All 6 corresponding parts match}',
        note: 'Corresponding Parts of Congruent Triangles are Congruent.',
      },
    ],
    steps: [
      {
        title: 'Step 1 · Translate Vertex A′ to Vertex A',
        tex: 'T_{\\vec{v}}(A\') = A',
        note: 'Aligns the first shared reference vertex.',
      },
      {
        title: 'Step 2 · Rotate Around A Until Ray A′B′ Aligns With AB',
        tex: 'R_{A, \\theta}(B\') = B \\quad (\\text{since } |A\'B\'| = |AB|)',
        note: 'Equal segment lengths guarantee B′ lands exactly on B.',
      },
      {
        title: 'Step 3 · Verify Included Angle Locks Ray AC',
        tex: '\\angle A\' = \\angle A,\\; |A\'C\'| = |AC| \\implies C\' = C',
        note: 'Completes the deductive SAS superposition proof.',
      },
    ],
    questions: [
      {
        id: 'gt-1',
        prompt: 'In △ABC, ∠A = 55° and ∠B = 75°. What is ∠C in degrees?',
        promptTex: '\\angle C = 180^\\circ - (55^\\circ + 75^\\circ)',
        type: 'numeric',
        correctAnswer: 50,
        tolerance: 0.01,
        hint: 'Interior angles of a Euclidean triangle sum to 180°.',
        solutionSteps: [
          { label: 'Triangle Angle Sum', tex: '180^\\circ - 130^\\circ = 50^\\circ', note: 'Exact interior measure.' },
        ],
      },
    ],
    misconception: {
      title: 'The SSA Ambiguous Swing Trap',
      falseTex: '\\text{Side-Side-Angle (SSA)} \\implies \\text{Congruence} \\quad (\\text{FALSE})',
      trueTex: '\\text{Angle must be INCLUDED (SAS) or Right-Angle (HL)}',
      explanation:
        'A non-included side can swing like a pendulum to hit the opposite ray in two distinct locations, forming an acute and an obtuse triangle with identical SSA data.',
    },
    application: {
      title: 'Truss Bridge Structural Rigidity',
      context:
        'Civil engineers triangulate steel bridge trusses because SSS locks a triangle against shearing without requiring welded corner joints.',
      formulaTex: 'F_{\\text{joint}} = 0 \\iff \\text{SSS Rigid Simplex}',
    },
    standards: ['MA.912.GR.1.3'],
  },

  'g-right-trig': {
    id: 'g-right-trig',
    courseId: 'geometry',
    code: 'G-02',
    title: 'Pythagorean Visual Proof & Right-Triangle Trigonometry',
    lead: 'Watch four congruent right triangles slide inside an (a + b)×(a + b) square: the uncovered area transforms continuously from c² into a² + b² without changing a single square millimeter.',
    axioms: [
      {
        label: 'Pythagorean Theorem',
        tex: 'a^2 + b^2 = c^2 \\iff c = \\sqrt{a^2 + b^2}',
        note: 'Area of the hypotenuse square equals the sum of the two leg squares.',
      },
      {
        label: 'Sine & Cosine Ratios',
        tex: '\\sin\\theta = \\dfrac{\\text{Opposite}}{\\text{Hypotenuse}},\\qquad \\cos\\theta = \\dfrac{\\text{Adjacent}}{\\text{Hypotenuse}}',
        note: 'Scale-invariant ratios determined solely by acute angle θ.',
      },
      {
        label: 'Tangent & Cofunction Identity',
        tex: '\\tan\\theta = \\dfrac{\\sin\\theta}{\\cos\\theta} = \\dfrac{b}{a},\\qquad \\sin\\theta = \\cos(90^\\circ - \\theta)',
        note: 'Complementary acute angles swap opposite and adjacent legs.',
      },
    ],
    steps: [
      {
        title: 'Step 1 · Enclose Four (a, b, c) Triangles in Side (a + b)',
        tex: 'A_{\\text{outer}} = (a + b)^2 = 4\\left(\\tfrac{1}{2}ab\\right) + c^2',
        note: 'At u = 0, the central tilted void is a square of side c.',
      },
      {
        title: 'Step 2 · Slide Triangles Into Two (a × b) Rectangles',
        tex: 'A_{\\text{outer}} = 2(ab) + a^2 + b^2',
        note: 'At u = 1, the triangles pair up, leaving two squares of sides a and b.',
      },
      {
        title: 'Step 3 · Subtract the Four Triangles From Both Layouts',
        tex: 'c^2 = a^2 + b^2',
        note: 'Conservation of area proves Pythagoras visually with zero algebra.',
      },
    ],
    questions: [
      {
        id: 'grt-1',
        prompt: 'A right triangle has legs a = 6 and b = 8. What is the length of hypotenuse c?',
        promptTex: 'c = \\sqrt{6^2 + 8^2}',
        type: 'numeric',
        correctAnswer: 10,
        tolerance: 0.01,
        hint: '36 + 64 = 100.',
        solutionSteps: [
          { label: 'Pythagorean Sum', tex: '\\sqrt{36 + 64} = \\sqrt{100} = 10', note: 'Scaled 3-4-5 triple.' },
        ],
      },
    ],
    misconception: {
      title: 'Square Root Distribution Fallacy',
      falseTex: '\\sqrt{a^2 + b^2} = a + b \\quad (\\text{FALSE})',
      trueTex: '\\sqrt{3^2 + 4^2} = \\sqrt{25} = 5 \\ne 3 + 4',
      explanation:
        'If √(a² + b²) equaled a + b, the hypotenuse would be as long as walking along both legs — violating the triangle inequality.',
    },
    application: {
      title: 'GPS Triangulation & Surveying Elevation',
      context:
        'Total-station laser surveyors measure horizontal distance a and elevation angle θ to compute building height b = a·tan(θ) and line-of-sight range c.',
      formulaTex: 'h = d \\cdot \\tan(\\theta)',
    },
    standards: ['MA.912.T.1.2'],
  },

  'g-circles': {
    id: 'g-circles',
    courseId: 'geometry',
    code: 'G-03',
    title: 'Circles, Inscribed Angle Invariance & Sector Areas',
    lead: 'Every inscribed angle subtending an arc measures exactly half the central angle subtending that same arc — no matter where the vertex glides along the circle.',
    axioms: [
      {
        label: 'Inscribed Angle Theorem',
        tex: '\\theta_{\\text{inscribed}} = \\tfrac{1}{2}\\,\\theta_{\\text{central}}',
        note: 'Inscribed angle in a semicircle (central 180°) is always 90° (Thales).',
      },
      {
        label: 'Arc Length Proportion',
        tex: 's = r\\theta_{\\text{rad}} = \\dfrac{\\theta_{\\text{deg}}}{360^\\circ}\\,2\\pi r',
        note: 'Arc length scales linearly with central angle.',
      },
      {
        label: 'Sector Area Formula',
        tex: 'A_{\\text{sector}} = \\tfrac{1}{2}r^2\\theta_{\\text{rad}} = \\dfrac{\\theta_{\\text{deg}}}{360^\\circ}\\,\\pi r^2',
        note: 'Fraction of the full disk area πr².',
      },
    ],
    steps: [
      {
        title: 'Step 1 · Measure Central Angle 2θ at Center O',
        tex: '\\angle AOB = 120^\\circ',
        note: 'Subtends minor arc AB of 120°.',
      },
      {
        title: 'Step 2 · Place Vertex P Anywhere on Major Arc',
        tex: '\\triangle AOP \\text{ and } \\triangle BOP \\text{ are isosceles } (OA = OB = OP = R)',
        note: 'Exterior angle of isosceles triangle equals twice its base angle.',
      },
      {
        title: 'Step 3 · Halve Central Measure',
        tex: '\\angle APB = \\tfrac{1}{2}(120^\\circ) = 60^\\circ',
        note: 'Remains locked at 60° as P slides along the arc.',
      },
    ],
    questions: [
      {
        id: 'gc-1',
        prompt: 'A central angle measures 84°. What is the measure of any inscribed angle intercepting the same arc?',
        promptTex: '\\theta = \\tfrac{1}{2}(84^\\circ)',
        type: 'numeric',
        correctAnswer: 42,
        tolerance: 0.01,
        hint: 'Divide the central angle by 2.',
        solutionSteps: [
          { label: 'Inscribed Angle Theorem', tex: '84^\\circ / 2 = 42^\\circ', note: 'Exact half measure.' },
        ],
      },
    ],
    misconception: {
      title: 'Equating Inscribed and Central Angles',
      falseTex: '\\angle APB = \\angle AOB \\quad (\\text{FALSE})',
      trueTex: '\\angle APB = \\tfrac{1}{2}\\angle AOB \\quad (\\text{TRUE})',
      explanation:
        'Pulling the vertex back from the center to the far boundary narrows the viewing angle by a factor of 2.',
    },
    application: {
      title: 'Orbital Satellite Field-of-View & Radar Sectors',
      context:
        'Radar sweeps and camera lenses compute coverage area using circular sector integration and tangent horizon geometry.',
      formulaTex: 'A = \\tfrac{1}{2}R^2\\theta',
    },
    standards: ['MA.912.GR.6.1', 'MA.912.GR.6.4'],
  },

  'a2-complex': {
    id: 'a2-complex',
    courseId: 'algebra-2',
    code: 'A2-01',
    title: 'Complex Numbers, Argand Rotations & Conjugate Roots',
    lead: 'When a parabola lifts above the x-axis (Δ < 0), its roots do not vanish — they rotate 90° off the real line into complex conjugate pairs h ± βi.',
    axioms: [
      {
        label: 'Imaginary Unit Rotation',
        tex: 'i^2 = -1 \\implies \\text{Multiplying by } i \\text{ rotates } 90^\\circ \\text{ counter-clockwise}',
        note: 'Two 90° rotations produce a 180° reversal (−1).',
      },
      {
        label: 'Complex Conjugate Product',
        tex: '(a + bi)(a - bi) = a^2 + b^2 = |z|^2',
        note: 'Imaginary cross-terms cancel, yielding a real positive norm squared.',
      },
      {
        label: 'Quadratic Complex Roots (Δ < 0)',
        tex: 'x = \\dfrac{-b \\pm i\\sqrt{|\\Delta|}}{2a}',
        note: 'Fundamental Theorem of Algebra guarantees 2 roots in ℂ.',
      },
    ],
    steps: [
      {
        title: 'Step 1 · Compute Negative Discriminant Δ',
        tex: 'x^2 - 2x + 5 = 0 \\implies \\Delta = (-2)^2 - 4(1)(5) = -16',
        note: 'Negative Δ signals conjugate roots in the complex plane.',
      },
      {
        title: 'Step 2 · Factor √(-16) via Imaginary Unit i',
        tex: '\\sqrt{-16} = \\sqrt{16}\\cdot\\sqrt{-1} = 4i',
        note: 'Extract i before taking the positive real square root.',
      },
      {
        title: 'Step 3 · Write Symmetric Conjugate Pair',
        tex: 'x = \\dfrac{2 \\pm 4i}{2} = 1 \\pm 2i',
        note: 'Mirrored across the real axis at Re(z) = 1.',
      },
    ],
    questions: [
      {
        id: 'a2c-1',
        prompt: 'Compute the product of complex conjugates (3 + 4i)(3 − 4i).',
        promptTex: '(3 + 4i)(3 - 4i) = 3^2 + 4^2',
        type: 'numeric',
        correctAnswer: 25,
        tolerance: 0.01,
        hint: 'Use a² − (bi)² = a² + b² = 9 + 16.',
        solutionSteps: [
          { label: 'Modulus Squared', tex: '9 - 16i^2 = 9 + 16 = 25', note: 'Since i² = −1.' },
        ],
      },
    ],
    misconception: {
      title: 'Sign Error on i² = −1',
      falseTex: '(3 + 4i)(3 - 4i) = 9 - 16 = -7 \\quad (\\text{FALSE})',
      trueTex: '9 - 16i^2 = 9 - 16(-1) = 25 \\quad (\\text{TRUE})',
      explanation:
        'Dropping i² treats i as +1 instead of √(−1). The product of a non-zero complex number and its conjugate is always strictly positive.',
    },
    application: {
      title: 'AC Electrical Impedance & Quantum Wavefunctions',
      context:
        'Capacitors and inductors introduce 90° phase shifts modeled by complex impedance Z = R + i(ωL − 1/ωC).',
      formulaTex: 'V = I \\cdot Z,\\qquad Z = |Z|e^{i\\phi}',
    },
    standards: ['MA.912.AR.3.2'],
  },

  'a2-polynomials': {
    id: 'a2-polynomials',
    courseId: 'algebra-2',
    code: 'A2-02',
    title: 'Higher-Degree Polynomials, Root Multiplicity & End Behavior',
    lead: 'The exponent m on each factor (x − r)ᵐ controls local geometry at the x-axis: odd multiplicity crosses, while even multiplicity bounces tangentially.',
    axioms: [
      {
        label: 'Factor-Root Theorem',
        tex: 'P(r) = 0 \\iff (x - r) \\text{ divides } P(x)',
        note: 'Every real zero corresponds to a linear factor.',
      },
      {
        label: 'Local Multiplicity Geometry',
        tex: 'm = 1 \\text{ (cross)},\\quad m = 2 \\text{ (parabolic tangent)},\\quad m = 3 \\text{ (inflection cross)}',
        note: 'Near x = r, P(x) behaves like C(x − r)ᵐ.',
      },
      {
        label: 'Leading Term End Behavior',
        tex: '\\lim_{x \\to \\pm\\infty} P(x) \\sim a_n x^n',
        note: 'Degree parity (even/odd) and sign of aₙ govern the far tails.',
      },
    ],
    steps: [
      {
        title: 'Step 1 · Factor Polynomial Completely',
        tex: 'P(x) = x^3 - 2x^2 + x = x(x - 1)^2',
        note: 'Pull out common x, then recognize the perfect square (x − 1)².',
      },
      {
        title: 'Step 2 · Classify Multiplicities at Each Zero',
        tex: 'r_1 = 0 \\; (m = 1 \\text{ cross}),\\qquad r_2 = 1 \\; (m = 2 \\text{ tangent bounce})',
        note: 'Sum of multiplicities equals degree 1 + 2 = 3.',
      },
      {
        title: 'Step 3 · Audit Leading Term a₃x³',
        tex: 'x \\to -\\infty \\implies P(x) \\to -\\infty,\\qquad x \\to +\\infty \\implies P(x) \\to +\\infty',
        note: 'Odd degree with positive leading coefficient rises left-to-right.',
      },
    ],
    questions: [
      {
        id: 'a2p-1',
        prompt: 'What is the total degree of P(x) = 2(x + 3)(x − 1)²?',
        promptTex: 'P(x) = 2(x + 3)^1(x - 1)^2',
        type: 'numeric',
        correctAnswer: 3,
        tolerance: 0.01,
        hint: 'Add the multiplicities of all linear factors: 1 + 2.',
        solutionSteps: [
          { label: 'Sum Multiplicities', tex: '1 + 2 = 3', note: 'Cubic polynomial.' },
        ],
      },
    ],
    misconception: {
      title: 'Dividing Away a Variable Root',
      falseTex: 'x^3 = 4x \\implies x^2 = 4 \\implies x = \\pm 2 \\quad (\\text{MISSING } x = 0)',
      trueTex: 'x^3 - 4x = x(x - 2)(x + 2) = 0 \\implies x \\in \\{-2, 0, 2\\}',
      explanation:
        'Dividing both sides by x illegally divides by zero when x = 0, erasing a valid root. Always move terms to one side and factor.',
    },
    application: {
      title: 'Bezier Splines & Aerospace Aerodynamic Profiles',
      context:
        'CAD software and font engines use cubic polynomials to join curves with smooth tangent and curvature continuity.',
      formulaTex: 'B(t) = (1-t)^3 P_0 + 3(1-t)^2 t P_1 + 3(1-t)t^2 P_2 + t^3 P_3',
    },
    standards: ['MA.912.AR.6.1'],
  },

  'a2-rational': {
    id: 'a2-rational',
    courseId: 'algebra-2',
    code: 'A2-04',
    title: 'Rational Functions, Vertical Poles & Asymptotic Limits',
    lead: 'When a denominator approaches zero while the numerator stays non-zero, the output explodes toward ±∞ along a vertical asymptote.',
    axioms: [
      {
        label: 'Vertical Asymptote (Pole)',
        tex: 'Q(p) = 0,\\; P(p) \\ne 0 \\implies \\lim_{x \\to p^\\pm} \\frac{P(x)}{Q(x)} = \\pm\\infty',
        note: 'Occurs at uncancelled zeros of the denominator.',
      },
      {
        label: 'Removable Discontinuity (Hole)',
        tex: '\\dfrac{(x - a)(x + 2)}{x - a} = x + 2 \\quad (x \\ne a)',
        note: 'Common factor (x − a) cancels into a single missing point.',
      },
      {
        label: 'Horizontal Asymptote',
        tex: '\\lim_{x \\to \\pm\\infty}\\left(\\dfrac{a}{x - p} + c\\right) = c',
        note: 'As |x| grows huge, 1/(x − p) vanishes toward 0.',
      },
    ],
    steps: [
      {
        title: 'Step 1 · Exclude Denominator Zeros From Domain',
        tex: '\\dfrac{2x}{x - 3} = 1 + \\dfrac{6}{x - 3} \\quad (x \\ne 3)',
        note: 'Record domain restriction x ≠ 3 before clearing fractions.',
      },
      {
        title: 'Step 2 · Multiply Through by (x − 3)',
        tex: '2x = (x - 3) + 6 \\implies 2x = x + 3',
        note: 'Clears denominator across all terms.',
      },
      {
        title: 'Step 3 · Check Candidate Against Restriction',
        tex: 'x = 3 \\quad (\\text{Rejected — Extraneous Pole!})',
        note: 'Since x = 3 makes denominator 0, the equation has no solution.',
      },
    ],
    questions: [
      {
        id: 'a2r-1',
        prompt: 'At what x-value does f(x) = 5 / (x − 4) + 2 have its vertical asymptote?',
        promptTex: 'x - 4 = 0',
        type: 'numeric',
        correctAnswer: 4,
        tolerance: 0.01,
        hint: 'Set the denominator equal to zero.',
        solutionSteps: [
          { label: 'Denominator Zero', tex: 'x - 4 = 0 \\implies x = 4', note: 'Vertical pole x = 4.' },
        ],
      },
    ],
    misconception: {
      title: 'Cancelling Terms Across Addition',
      falseTex: '\\dfrac{x + 5}{x} = 1 + 5 = 6 \\quad (\\text{FALSE})',
      trueTex: '\\dfrac{x + 5}{x} = 1 + \\dfrac{5}{x} \\quad (\\text{TRUE})',
      explanation:
        'Only common factors of the entire numerator and denominator cancel. In (x + 5)/x, x divides both terms.',
    },
    application: {
      title: 'Lens Optics & Michaelis-Menten Enzyme Kinetics',
      context:
        'Thin-lens focusing 1/f = 1/d_o + 1/d_i exhibits a vertical asymptote when an object reaches the focal point d_o = f, sending image rays to infinity.',
      formulaTex: 'd_i = \\dfrac{f \\cdot d_o}{d_o - f}',
    },
    standards: ['MA.912.AR.8.1'],
  },

  'pc-vectors': {
    id: 'pc-vectors',
    courseId: 'precalculus',
    code: 'PC-02',
    title: 'Euclidean Vectors, Parallelogram Resultants & 2×2 Matrix Transformations',
    lead: 'Vectors encode magnitude and direction; 2×2 matrices act on vectors by warping the unit basis grid and scaling areas by the determinant det(M).',
    axioms: [
      {
        label: 'Component Addition & Norm',
        tex: '\\vec{u} + \\vec{v} = \\langle u_x + v_x,\\; u_y + v_y \\rangle,\\qquad \\|\\vec{u}\\| = \\sqrt{u_x^2 + u_y^2}',
        note: 'Diagonal of the parallelogram spanned by u and v.',
      },
      {
        label: 'Dot Product & Angle',
        tex: '\\vec{u} \\cdot \\vec{v} = u_x v_x + u_y v_y = \\|\\vec{u}\\|\\|\\vec{v}\\|\\cos\\theta',
        note: 'Vanishes (u · v = 0) if and only if vectors are orthogonal.',
      },
      {
        label: '2×2 Matrix Basis Action',
        tex: '\\begin{bmatrix}a & b\\\\c & d\\end{bmatrix}\\begin{bmatrix}x\\\\y\\end{bmatrix} = x\\begin{bmatrix}a\\\\c\\end{bmatrix} + y\\begin{bmatrix}b\\\\d\\end{bmatrix}',
        note: 'Columns of M are the transformed basis vectors î and ĵ.',
      },
    ],
    steps: [
      {
        title: 'Step 1 · Decompose Vectors Into Orthogonal Components',
        tex: '\\vec{u} = \\langle 3, 1.5 \\rangle,\\quad \\vec{v} = \\langle -1, 2.5 \\rangle',
        note: 'Project onto horizontal and vertical axes.',
      },
      {
        title: 'Step 2 · Sum Components to Close the Parallelogram',
        tex: '\\vec{r} = \\vec{u} + \\vec{v} = \\langle 2, 4 \\rangle',
        note: 'Tip-to-tail translation reaches the same resultant corner.',
      },
      {
        title: 'Step 3 · Compute Magnitude & Direction Bearing',
        tex: '\\|\\vec{r}\\| = \\sqrt{2^2 + 4^2} = \\sqrt{20} \\approx 4.47,\\quad \\theta = \\arctan(4/2) \\approx 63.4^\\circ',
        note: 'Pythagoras and inverse tangent recover polar form.',
      },
    ],
    questions: [
      {
        id: 'pcv-1',
        prompt: 'Compute the dot product u · v for u = ⟨2, 3⟩ and v = ⟨4, −1⟩.',
        promptTex: '\\langle 2, 3 \\rangle \\cdot \\langle 4, -1 \\rangle = 2(4) + 3(-1)',
        type: 'numeric',
        correctAnswer: 5,
        tolerance: 0.01,
        hint: 'Multiply x-components (8) plus y-components (−3).',
        solutionSteps: [
          { label: 'Scalar Dot Product', tex: '8 - 3 = 5', note: 'Positive dot product means acute angle.' },
        ],
      },
    ],
    misconception: {
      title: 'Adding Magnitudes Instead of Components',
      falseTex: '\\|\\vec{u} + \\vec{v}\\| = \\|\\vec{u}\\| + \\|\\vec{v}\\| \\quad (\\text{FALSE unless parallel})',
      trueTex: '\\|\\vec{u} + \\vec{v}\\| \\le \\|\\vec{u}\\| + \\|\\vec{v}\\| \\quad (\\text{Triangle Inequality})',
      explanation:
        'Walking two sides of a triangle is always longer than cutting straight across the resultant diagonal.',
    },
    application: {
      title: '3D Computer Graphics Shaders & Flight Navigation',
      context:
        'GPU vertex shaders multiply millions of 3D position vectors by transformation matrices every 16 milliseconds.',
      formulaTex: '\\vec{p}_{\\text{screen}} = M_{\\text{proj}}\\,M_{\\text{view}}\\,M_{\\text{model}}\\,\\vec{p}',
    },
    standards: ['MA.912.NSO.3.1'],
  },

  'pc-series': {
    id: 'pc-series',
    courseId: 'precalculus',
    code: 'PC-03',
    title: 'Infinite Sequences, Geometric Series & Limit Convergence',
    lead: 'An infinite sum of shrinking terms can converge to an exact finite number — visually proven by subdividing a 1×1 square into 1/2 + 1/4 + 1/8 + 1/16 + … = 1.',
    axioms: [
      {
        label: 'Finite Geometric Partial Sum',
        tex: 'S_n = \\sum_{k=1}^{n} a_1 r^{k-1} = a_1\\dfrac{1 - r^n}{1 - r}',
        note: 'Exact closed form for the first n terms.',
      },
      {
        label: 'Infinite Convergence Criterion',
        tex: '|r| < 1 \\implies \\lim_{n \\to \\infty} r^n = 0 \\implies S_\\infty = \\dfrac{a_1}{1 - r}',
        note: 'If |r| ≥ 1, terms fail to shrink and the series diverges.',
      },
      {
        label: 'Arithmetic Partial Sum',
        tex: 'S_n = \\dfrac{n}{2}(a_1 + a_n)',
        note: 'Gauss pairing of first and last terms.',
      },
    ],
    steps: [
      {
        title: 'Step 1 · Verify Common Ratio |r| < 1',
        tex: '1 + \\tfrac{1}{2} + \\tfrac{1}{4} + \\tfrac{1}{8} + \\dots \\implies a_1 = 1,\\quad r = \\tfrac{1}{2}',
        note: 'Since |1/2| < 1, the partial sums approach a finite ceiling.',
      },
      {
        title: 'Step 2 · Write Partial Sum Remainder',
        tex: 'S_n = \\dfrac{1 - (1/2)^n}{1 - 1/2} = 2 - \\left(\\tfrac{1}{2}\\right)^{n-1}',
        note: 'Each new term halves the remaining gap to 2.',
      },
      {
        title: 'Step 3 · Take the Limit as n → ∞',
        tex: 'S_\\infty = \\dfrac{1}{1 - 0.5} = 2',
        note: 'The gap (1/2)^(n−1) vanishes in the limit.',
      },
    ],
    questions: [
      {
        id: 'pcs-1',
        prompt: 'Find the exact infinite sum of the geometric series with first term a₁ = 6 and common ratio r = 1/3.',
        promptTex: 'S_\\infty = \\dfrac{6}{1 - 1/3}',
        type: 'numeric',
        correctAnswer: 9,
        tolerance: 0.01,
        hint: 'Divide 6 by 2/3.',
        solutionSteps: [
          { label: 'Convergence Formula', tex: '\\dfrac{6}{2/3} = 6 \\cdot \\dfrac{3}{2} = 9', note: 'Exact limit.' },
        ],
      },
    ],
    misconception: {
      title: 'Applying a₁/(1 − r) When |r| ≥ 1',
      falseTex: '1 + 2 + 4 + 8 + \\dots = \\dfrac{1}{1 - 2} = -1 \\quad (\\text{FALSE})',
      trueTex: 'r = 2 \\ge 1 \\implies \\text{Series Diverges to } +\\infty',
      explanation:
        'The formula a₁/(1 − r) is only valid when rⁿ → 0. When |r| ≥ 1, rⁿ explodes.',
    },
    application: {
      title: 'Pharmacokinetics Drug Dosing & Fractal Coastlines',
      context:
        'Repeated daily medication doses with decay fraction r settle to a steady-state bloodstream plateau a₁/(1 − r).',
      formulaTex: 'C_{\\text{steady}} = \\dfrac{D_0}{1 - e^{-k\\tau}}',
    },
    standards: ['MA.912.AR.10.1'],
  },

  'a1-inequalities': {
    id: 'a1-inequalities',
    courseId: 'algebra-1',
    code: 'A1-04',
    title: 'Two-Variable Linear Inequalities & Feasible Half-Planes',
    lead: 'Unlike a single linear equation that restricts solutions to a 1D line, a system of inequalities carves the entire 2D plane into a shaded feasible polygon.',
    axioms: [
      {
        label: 'Strict vs. Inclusive Boundaries',
        tex: 'y \\ge mx + b \\text{ (solid line)},\\qquad y < mx + b \\text{ (dashed boundary)}',
        note: 'Inclusive symbols (≤, ≥) include points directly on the boundary.',
      },
      {
        label: 'Half-Plane Test Point Criterion',
        tex: '0 \\ge m(0) + b \\iff (0,0) \\in \\text{Feasible Region}',
        note: 'Testing one point off the line determines which entire half-plane satisfies the constraint.',
      },
      {
        label: 'Linear Programming Corner Principle',
        tex: '\\max_{(x,y) \\in \\Omega} (c_1 x + c_2 y) \\text{ occurs at a polygon vertex}',
        note: 'Optimal resource allocations always sit at intersections of active boundary lines.',
      },
    ],
    steps: [
      {
        title: 'Step 1 · Graph Lower Boundary Line Solid',
        tex: 'y \\ge 0.6x - 0.8',
        note: 'Solid line because ≥ includes points on the boundary; shade above.',
      },
      {
        title: 'Step 2 · Graph Upper Boundary Line Dashed',
        tex: 'y < -0.45x + 1.8',
        note: 'Dashed line because strict < excludes boundary points; shade below.',
      },
      {
        title: 'Step 3 · Locate Feasible Overlap & Probe Origin',
        tex: '(0,0):\\; 0 \\ge -0.8 \\;\\checkmark \\;\\land\\; 0 < 1.8 \\;\\checkmark',
        note: 'Origin satisfies both inequalities simultaneously, confirming the shaded emerald wedge.',
      },
    ],
    questions: [
      {
        id: 'a1i-1',
        prompt: 'Does the point (2, 3) satisfy the inequality y ≥ 2x − 1?',
        promptTex: '3 \\ge 2(2) - 1',
        type: 'multiple-choice',
        options: [
          { id: 'a', label: 'Yes — 3 ≥ 3 is true (inclusive boundary)' },
          { id: 'b', label: 'No — boundary points are never included' },
          { id: 'c', label: 'No — 3 is less than 2(2) − 1' },
          { id: 'd', label: 'Cannot be determined without a graph' },
        ],
        correctAnswer: 'a',
        hint: 'Evaluate 2(2) − 1 = 3 and check whether 3 ≥ 3 holds.',
        solutionSteps: [
          { label: 'Substitute (2, 3)', tex: '3 \\ge 3 \\implies \\text{True}', note: 'Inclusive ≥ holds on the line.' },
        ],
      },
      {
        id: 'a1i-2',
        prompt: 'When solving −3x ≤ 12, what is the boundary value of x after dividing by −3?',
        promptTex: '-3x \\le 12 \\implies x \\ge \\text{?}',
        type: 'numeric',
        correctAnswer: -4,
        tolerance: 0.01,
        hint: 'Dividing by a negative flips ≤ into ≥ and yields 12 / (−3) = −4.',
        solutionSteps: [
          { label: 'Flip Inequality Sign', tex: 'x \\ge -4', note: 'Negation reverses number-line order.' },
        ],
      },
    ],
    misconception: {
      title: 'Forgetting to Flip the Sign When Dividing by a Negative',
      falseTex: '-2y < 6 \\implies y < -3 \\quad (\\text{FALSE})',
      trueTex: '-2y < 6 \\implies y > -3 \\quad (\\text{TRUE})',
      explanation:
        'Multiplying or dividing across an inequality by a negative number reflects the entire number line across 0, reversing left and right.',
    },
    application: {
      title: 'Supply-Chain Logistics & Linear Programming Optimization',
      context:
        'Airlines, factories, and cloud datacenters model budget, capacity, and latency limits as systems of linear inequalities to optimize operating profit.',
      formulaTex: 'A\\vec{x} \\le \\vec{b},\\qquad \\max\\; \\vec{c}^\\top \\vec{x}',
    },
    standards: ['MA.912.AR.2.8'],
  },

  'g-transformations': {
    id: 'g-transformations',
    courseId: 'geometry',
    code: 'G-02',
    title: 'Geometric Transformations, Reflections & Dilations',
    lead: 'Rigid motions (translations, rotations, reflections) preserve every length and angle, while dilations scale lengths uniformly by factor k while locking all angles invariant.',
    axioms: [
      {
        label: '2D Rotation Operator',
        tex: 'R_\\theta(x, y) = (x\\cos\\theta - y\\sin\\theta,\\; x\\sin\\theta + y\\cos\\theta)',
        note: 'Pure isometry keeping distance from origin strictly unchanged.',
      },
      {
        label: 'Diagonal Mirror Reflection',
        tex: 'M_{y=x}(x, y) = (y, x)',
        note: 'Swaps x and y coordinates — the exact geometric mirror behind inverse functions.',
      },
      {
        label: 'Uniform Dilation & Area Scaling',
        tex: 'D_k(x, y) = (kx, ky) \\implies \\text{Area}\' = k^2 \\cdot \\text{Area}',
        note: 'Produces mathematically similar figures with side ratio k and area ratio k².',
      },
    ],
    steps: [
      {
        title: 'Step 1 · Reflect Vertex (3, 1) Across y = x',
        tex: '(3, 1) \\xrightarrow{y=x} (1, 3)',
        note: 'Coordinates swap symmetrically across the 45° line.',
      },
      {
        title: 'Step 2 · Rotate 90° Counter-Clockwise Around Origin',
        tex: '(x, y) \\xrightarrow{R_{90^\\circ}} (-y, x) \\implies (1, 3) \\mapsto (-3, 1)',
        note: 'Perpendicularity rotates Quadrant I smoothly into Quadrant II.',
      },
      {
        title: 'Step 3 · Apply Scale Factor Dilation k = 2',
        tex: '(-3, 1) \\xrightarrow{D_2} (-6, 2)',
        note: 'Doubles every segment length and quadruples enclosed area.',
      },
    ],
    questions: [
      {
        id: 'gtr-1',
        prompt: 'A polygon of area 12 cm² is dilated by scale factor k = 3. What is the area of the dilated image?',
        promptTex: 'A\' = k^2 \\cdot A = 3^2 \\cdot 12',
        type: 'numeric',
        correctAnswer: 108,
        tolerance: 0.01,
        hint: 'Area scales with the square of the linear scale factor (k² = 9).',
        solutionSteps: [
          { label: 'Area Scaling', tex: '9 \\cdot 12 = 108\\text{ cm}^2', note: 'Both width and height triple.' },
        ],
      },
    ],
    misconception: {
      title: 'Confusing Scale Factor k With Area Multiplier',
      falseTex: 'k = 2 \\implies \\text{Area doubles} \\quad (\\text{FALSE})',
      trueTex: 'k = 2 \\implies \\text{Area multiplies by } k^2 = 4 \\quad (\\text{TRUE})',
      explanation:
        'A 2D dilation scales both horizontal and vertical dimensions simultaneously, multiplying enclosed area by k × k = k².',
    },
    application: {
      title: 'Robotic Arm Kinematics & Computer Animation Rigs',
      context:
        'Every 2D/3D game engine chains translation, rotation, and scale matrices hierarchically to animate articulated limbs cleanly at 60fps.',
      formulaTex: 'T_{\\text{world}} = T_{\\text{parent}} \\cdot R_\\theta \\cdot D_k',
    },
    standards: ['MA.912.GR.2.1'],
  },

  'g-coordinate': {
    id: 'g-coordinate',
    courseId: 'geometry',
    code: 'G-05',
    title: 'Coordinate Geometry: Distance, Midpoint & Analytic Proofs',
    lead: 'Descartes unified algebra and geometry: every Euclidean distance becomes Pythagoras on coordinate differences, and perpendicularity becomes negative-reciprocal slope.',
    axioms: [
      {
        label: 'Euclidean Distance Formula',
        tex: 'd(A, B) = \\sqrt{(x_2 - x_1)^2 + (y_2 - y_1)^2}',
        note: 'Direct application of the Pythagorean Theorem to horizontal Δx and vertical Δy.',
      },
      {
        label: 'Midpoint Average',
        tex: 'M = \\left(\\dfrac{x_1 + x_2}{2},\\; \\dfrac{y_1 + y_2}{2}\\right)',
        note: 'Exact geometric center of segment AB.',
      },
      {
        label: 'Perpendicular Slope Criterion',
        tex: 'L_1 \\perp L_2 \\iff m_1 \\cdot m_2 = -1',
        note: 'Every point on the perpendicular bisector is equidistant from A and B.',
      },
    ],
    steps: [
      {
        title: 'Step 1 · Compute Orthogonal Legs Δx and Δy',
        tex: 'A(-1, -2),\\; B(5, 6) \\implies \\Delta x = 6,\\quad \\Delta y = 8',
        note: 'Signed coordinate differences form a right triangle.',
      },
      {
        title: 'Step 2 · Apply Distance Norm',
        tex: 'd = \\sqrt{6^2 + 8^2} = \\sqrt{100} = 10',
        note: 'Exact segment length without using a ruler.',
      },
      {
        title: 'Step 3 · Find Midpoint & Perpendicular Bisector Slope',
        tex: 'M = (2, 2),\\quad m_{AB} = \\tfrac{4}{3} \\implies m_\\perp = -\\tfrac{3}{4}',
        note: 'Constructs the exact symmetry locus of points equidistant from A and B.',
      },
    ],
    questions: [
      {
        id: 'gco-1',
        prompt: 'Find the distance between A(1, 2) and B(4, 6).',
        promptTex: 'd = \\sqrt{(4-1)^2 + (6-2)^2}',
        type: 'numeric',
        correctAnswer: 5,
        tolerance: 0.01,
        hint: 'Δx = 3 and Δy = 4 form a 3-4-5 right triangle.',
        solutionSteps: [
          { label: 'Pythagorean Norm', tex: '\\sqrt{3^2 + 4^2} = \\sqrt{25} = 5', note: 'Exact Euclidean distance.' },
        ],
      },
    ],
    misconception: {
      title: 'Adding Inside Distance or Subtracting Inside Midpoint',
      falseTex: 'd = \\sqrt{(x_2 + x_1)^2 + (y_2 + y_1)^2} \\quad (\\text{FALSE})',
      trueTex: 'd \\text{ subtracts coordinates } (x_2 - x_1); \\; M \\text{ averages } (x_1 + x_2)/2',
      explanation:
        'Distance measures separation (difference), whereas midpoint measures balance (average).',
    },
    application: {
      title: 'Voronoi Cellular Coverage Maps',
      context:
        'Telecom networks partition cities into Voronoi cells bounded by perpendicular bisectors so every mobile phone connects to its nearest cell tower.',
      formulaTex: 'd(P, T_i) = d(P, T_j)',
    },
    standards: ['MA.912.GR.3.3'],
  },

  'a2-probability': {
    id: 'a2-probability',
    courseId: 'algebra-2',
    code: 'A2-06',
    title: 'Probability Distributions & The Gaussian Normal Bell Curve',
    lead: 'When hundreds of small independent random variations sum together, they converge universally into the symmetric Gaussian bell curve governed by mean μ and spread σ.',
    axioms: [
      {
        label: 'Normal Density Function',
        tex: 'f(x) = \\dfrac{1}{\\sigma\\sqrt{2\\pi}}\\,e^{-\\frac{1}{2}\\left(\\frac{x - \\mu}{\\sigma}\\right)^2}',
        note: 'Total area under the curve from −∞ to +∞ equals exactly 1 (100% probability).',
      },
      {
        label: 'Empirical 68–95–99.7 Rule',
        tex: 'P(|X - \\mu| \\le 1\\sigma) \\approx 68\\%,\\quad 2\\sigma \\approx 95\\%,\\quad 3\\sigma \\approx 99.7\\%',
        note: 'Instant mental probability estimation for any normally distributed dataset.',
      },
      {
        label: 'Standardized Z-Score',
        tex: 'z = \\dfrac{x - \\mu}{\\sigma}',
        note: 'Measures how many standard deviations an observation lies above or below the mean.',
      },
    ],
    steps: [
      {
        title: 'Step 1 · Identify Mean μ and Standard Deviation σ',
        tex: '\\mu = 100,\\quad \\sigma = 15',
        note: 'Center peak sits at x = 100; inflection shoulders sit at 85 and 115.',
      },
      {
        title: 'Step 2 · Convert Score x = 130 Into Standard Z-Score',
        tex: 'z = \\dfrac{130 - 100}{15} = +2.0',
        note: 'Score sits exactly 2 standard deviations above the mean.',
      },
      {
        title: 'Step 3 · Estimate Upper-Tail Percentile',
        tex: '95\\% \\text{ lies within } \\pm 2\\sigma \\implies \\text{Top tail} \\approx \\tfrac{5\\%}{2} = 2.5\\%',
        note: 'A z-score of +2 sits near the 97.5th percentile.',
      },
    ],
    questions: [
      {
        id: 'a2pr-1',
        prompt: 'A normal distribution has mean μ = 70 and σ = 5. What is the z-score of x = 80?',
        promptTex: 'z = \\dfrac{80 - 70}{5}',
        type: 'numeric',
        correctAnswer: 2,
        tolerance: 0.01,
        hint: 'Subtract μ = 70 from 80, then divide by σ = 5.',
        solutionSteps: [
          { label: 'Z-Score', tex: 'z = \\dfrac{10}{5} = 2', note: '2 standard deviations above mean.' },
        ],
      },
    ],
    misconception: {
      title: 'Confusing One-Tail With Two-Tail Areas',
      falseTex: 'P(X > \\mu + 2\\sigma) = 5\\% \\quad (\\text{FALSE})',
      trueTex: 'P(|X - \\mu| > 2\\sigma) = 5\\% \\implies P(X > \\mu + 2\\sigma) = 2.5\\%',
      explanation:
        'The remaining 5% outside ±2σ splits symmetrically: 2.5% in the lower left tail and 2.5% in the upper right tail.',
    },
    application: {
      title: 'Six-Sigma Manufacturing Quality & Sensor Noise Filtering',
      context:
        'Aerospace tolerances and Kalman filters model measurement noise as Gaussian curves to separate true signal from random jitter.',
      formulaTex: 'P(|\\varepsilon| > 6\\sigma) < 2 \\times 10^{-9}',
    },
    standards: ['MA.912.DP.2.2', 'MA.912.DP.6'],
  },

  'pc-polar': {
    id: 'pc-polar',
    courseId: 'precalculus',
    code: 'PC-03',
    title: 'Polar Coordinates, Rose Curves & Radial Geometry',
    lead: 'Instead of walking horizontally and vertically (x, y), polar coordinates aim an angle θ and reach outward distance r — turning complex trigonometric petals into one-line equations.',
    axioms: [
      {
        label: 'Polar ↔ Cartesian Bridge',
        tex: 'x = r\\cos\\theta,\\quad y = r\\sin\\theta,\\qquad r^2 = x^2 + y^2',
        note: 'Connects circular radar sweeps directly to rectangular coordinates.',
      },
      {
        label: 'Rose Petal Parity Law',
        tex: 'r = a\\cos(n\\theta):\\; n \\text{ odd} \\implies n \\text{ petals},\\quad n \\text{ even} \\implies 2n \\text{ petals}',
        note: 'Negative values of r flip across the origin, doubling even-frequency petals.',
      },
      {
        label: 'Polar Area Sector Integral',
        tex: 'A = \\tfrac{1}{2}\\int_{\\alpha}^{\\beta} [r(\\theta)]^2\\,d\\theta',
        note: 'Sums infinitesimal triangular wedges sweeping around the pole.',
      },
    ],
    steps: [
      {
        title: 'Step 1 · Identify Petal Count From n = 5',
        tex: 'r(\\theta) = 2.3\\cos(5\\theta) \\implies 5 \\text{ symmetric petals}',
        note: 'Because n = 5 is odd, the full rose traces completely over [0, π].',
      },
      {
        title: 'Step 2 · Locate Maximum Petal Tips (|cos 5θ| = 1)',
        tex: '5\\theta = k\\pi \\implies \\theta = 0,\\; \\tfrac{\\pi}{5},\\; \\tfrac{2\\pi}{5},\\; \\dots',
        note: 'Each petal reaches maximum radius a = 2.3.',
      },
      {
        title: 'Step 3 · Convert Polar Point (4, π/3) to Rectangular',
        tex: 'x = 4\\cos(\\pi/3) = 2,\\qquad y = 4\\sin(\\pi/3) = 2\\sqrt{3}',
        note: 'Exact Cartesian projection.',
      },
    ],
    questions: [
      {
        id: 'pcpo-1',
        prompt: 'How many petals does the polar rose r = 3 cos(4θ) have?',
        promptTex: 'r = 3\\cos(4\\theta)',
        type: 'numeric',
        correctAnswer: 8,
        tolerance: 0.01,
        hint: 'When n is even, a rose curve has 2n petals.',
        solutionSteps: [
          { label: 'Even Parity Rule', tex: 'n = 4 \\text{ (even)} \\implies 2(4) = 8 \\text{ petals}', note: '8 symmetric lobes.' },
        ],
      },
    ],
    misconception: {
      title: 'Ignoring Negative Radius r < 0 in Polar Plots',
      falseTex: 'r < 0 \\text{ is undefined} \\quad (\\text{FALSE})',
      trueTex: '(-r, \\theta) \\text{ plots } |r| \\text{ units in the opposite ray } \\theta + \\pi',
      explanation:
        'When cos(nθ) becomes negative, the radial arm reverses straight through the pole, painting the opposing petals of the rose.',
    },
    application: {
      title: 'Directional Microphone Patterns & Phased-Array Radar',
      context:
        'Cardioid microphones r = 1 + cos(θ) and antenna gain diagrams are literally polar curves measuring sensitivity by angle.',
      formulaTex: 'G(\\theta) = a + b\\cos(\\theta)',
    },
    standards: ['MA.912.T.4'],
  },

  'pc-conics': {
    id: 'pc-conics',
    courseId: 'precalculus',
    code: 'PC-04',
    title: 'Conic Sections: Ellipses, Hyperbolas & Eccentricity',
    lead: 'Slicing a double cone at tilting angles produces every celestial orbit in nature — circles (e = 0), planetary ellipses (0 < e < 1), parabolic escapes (e = 1), and hyperbolic flybys (e > 1).',
    axioms: [
      {
        label: 'Ellipse Foci Conservation',
        tex: '\\dfrac{x^2}{a^2} + \\dfrac{y^2}{b^2} = 1,\\qquad d(P, F_1) + d(P, F_2) = 2a',
        note: 'Foci sit at (±c, 0) where c² = a² − b².',
      },
      {
        label: 'Hyperbola Asymptotic Form',
        tex: '\\dfrac{x^2}{a^2} - \\dfrac{y^2}{b^2} = 1,\\qquad y = \\pm\\dfrac{b}{a}x',
        note: 'Difference of foci distances stays constant: |d₁ − d₂| = 2a.',
      },
      {
        label: 'Orbital Eccentricity e',
        tex: 'e = \\dfrac{c}{a} \\in [0, \\infty)',
        note: 'Single dimensionless constant governing the entire conic family.',
      },
    ],
    steps: [
      {
        title: 'Step 1 · Read Semi-Axes a and b',
        tex: '\\dfrac{x^2}{25} + \\dfrac{y^2}{9} = 1 \\implies a = 5,\\quad b = 3',
        note: 'Major horizontal span is 2a = 10; minor vertical span is 2b = 6.',
      },
      {
        title: 'Step 2 · Compute Focal Distance c',
        tex: 'c = \\sqrt{a^2 - b^2} = \\sqrt{25 - 9} = 4',
        note: 'Foci anchor at F₁(−4, 0) and F₂(+4, 0).',
      },
      {
        title: 'Step 3 · Calculate Eccentricity e',
        tex: 'e = \\dfrac{c}{a} = \\dfrac{4}{5} = 0.80',
        note: 'Between 0 and 1, confirming an elongated closed ellipse.',
      },
    ],
    questions: [
      {
        id: 'pcco-1',
        prompt: 'For the ellipse x²/25 + y²/16 = 1, find the focal distance c = √(a² − b²).',
        promptTex: 'c = \\sqrt{25 - 16}',
        type: 'numeric',
        correctAnswer: 3,
        tolerance: 0.01,
        hint: '25 − 16 = 9.',
        solutionSteps: [
          { label: 'Focal Relation', tex: 'c = \\sqrt{9} = 3', note: 'Foci sit at (±3, 0).' },
        ],
      },
    ],
    misconception: {
      title: 'Mixing Up c² = a² − b² vs. c² = a² + b²',
      falseTex: '\\text{Ellipse foci: } c^2 = a^2 + b^2 \\quad (\\text{FALSE — foci would lie OUTSIDE!})',
      trueTex: '\\text{Ellipse: } c^2 = a^2 - b^2; \\qquad \\text{Hyperbola: } c^2 = a^2 + b^2',
      explanation:
        'An ellipse encloses its foci (c < a), whereas a hyperbola curves around external foci (c > a).',
    },
    application: {
      title: 'Keplerian Planetary Orbits & Whispering Galleries',
      context:
        'Every planet sweeps an ellipse with the Sun at one focus F₁, while interstellar comets like Oumuamua follow hyperbolic trajectories (e > 1).',
      formulaTex: 'r(\\theta) = \\dfrac{p}{1 + e\\cos\\theta}',
    },
    standards: ['MA.912.GR.7'],
  },

  'pc-limits': {
    id: 'pc-limits',
    courseId: 'precalculus',
    code: 'PC-06',
    title: 'Limits, Continuity & The Tangent Derivative Bridge',
    lead: 'Calculus begins with a single mesmerizing limit: letting the step h between two points on a curve shrink toward zero transforms an average secant slope into an exact instantaneous tangent.',
    axioms: [
      {
        label: 'Two-Sided Limit Existence',
        tex: '\\lim_{x \\to c} f(x) = L \\iff \\lim_{x \\to c^-} f(x) = \\lim_{x \\to c^+} f(x) = L',
        note: 'Left and right trajectories must converge toward the exact same height L.',
      },
      {
        label: 'Difference Quotient Limit (Derivative)',
        tex: 'f\'(x_0) = \\lim_{h \\to 0} \\dfrac{f(x_0 + h) - f(x_0)}{h}',
        note: 'Eliminates 0/0 indeterminacy via algebraic simplification before taking h → 0.',
      },
      {
        label: 'Continuity Checklist',
        tex: 'f(c) \\text{ defined},\\; \\lim_{x \\to c} f(x) \\text{ exists},\\; \\lim_{x \\to c} f(x) = f(c)',
        note: 'No holes, jumps, or vertical asymptotes at x = c.',
      },
    ],
    steps: [
      {
        title: 'Step 1 · Form Secant Slope Over Step h',
        tex: 'f(x) = x^2 \\implies m_{\\text{sec}} = \\dfrac{(x + h)^2 - x^2}{h}',
        note: 'Plugging h = 0 prematurely produces indeterminate 0/0.',
      },
      {
        title: 'Step 2 · Expand Numerator & Cancel Factor h',
        tex: '\\dfrac{x^2 + 2xh + h^2 - x^2}{h} = \\dfrac{h(2x + h)}{h} = 2x + h \\quad (h \\ne 0)',
        note: 'Removes the zero-over-zero algebraic cancellation trap.',
      },
      {
        title: 'Step 3 · Take Limit as h → 0',
        tex: 'f\'(x) = \\lim_{h \\to 0}(2x + h) = 2x',
        note: 'Instantaneous tangent slope at any point x on y = x² equals exactly 2x.',
      },
    ],
    questions: [
      {
        id: 'pcli-1',
        prompt: 'Evaluate the removable-hole limit: lim_{x → 3} (x² − 9) / (x − 3).',
        promptTex: '\\lim_{x \\to 3} \\dfrac{x^2 - 9}{x - 3}',
        type: 'numeric',
        correctAnswer: 6,
        tolerance: 0.01,
        hint: 'Factor x² − 9 = (x − 3)(x + 3), cancel (x − 3), then let x → 3.',
        solutionSteps: [
          { label: 'Factor & Cancel', tex: '\\lim_{x \\to 3} (x + 3) = 6', note: 'Limit exists cleanly even though f(3) has a hole.' },
        ],
      },
    ],
    misconception: {
      title: 'Assuming 0/0 Means the Limit Does Not Exist',
      falseTex: '\\lim_{x \\to 3} \\dfrac{x^2 - 9}{x - 3} = \\dfrac{0}{0} \\implies \\text{DNE} \\quad (\\text{FALSE})',
      trueTex: '0/0 \\text{ signals a cancellable factor hiding a finite limit!}',
      explanation:
        'A limit describes what f(x) approaches near x = c, regardless of whether a single hole sits directly at x = c.',
    },
    application: {
      title: 'Instantaneous Velocity, Rocket Thrust & Neural Backpropagation',
      context:
        'Every gradient descent update in modern AI computes partial-derivative limits to descend a loss surface in millions of dimensions.',
      formulaTex: 'v(t) = \\lim_{\\Delta t \\to 0} \\dfrac{x(t + \\Delta t) - x(t)}{\\Delta t}',
    },
    standards: ['MA.912.C.1'],
  },
};

const ALL_TOPIC_SPECS: Record<TopicVisualId, TopicLessonSpec> = {
  ...(BASE_TOPIC_SPECS as Record<TopicVisualId, TopicLessonSpec>),
  ...(EXTENDED_TOPIC_SPECS as Record<string, TopicLessonSpec>),
};

function isTopicVisualId(id: string | undefined): id is TopicVisualId {
  return Boolean(id && id in ALL_TOPIC_SPECS);
}

export function TopicLessonPage() {
  const { topicId } = useParams<{ topicId: string }>();
  const [stepIdx, setStepIdx] = useState(0);
  const [autoPlaySteps, setAutoPlaySteps] = useState(false);

  const valid = isTopicVisualId(topicId);
  const spec = valid ? ALL_TOPIC_SPECS[topicId] : ALL_TOPIC_SPECS['a1-expressions'];
  const stepCount = spec.steps.length;

  useEffect(() => {
    setStepIdx(0);
    setAutoPlaySteps(false);
  }, [topicId]);

  useEffect(() => {
    if (!autoPlaySteps) return;
    const timer = window.setInterval(() => {
      setStepIdx((prev) => (prev + 1) % stepCount);
    }, 2600);
    return () => window.clearInterval(timer);
  }, [autoPlaySteps, stepCount]);

  if (!valid) {
    return <Navigate to="/map" replace />;
  }

  const course = COURSES[spec.courseId];
  const nodeMeta = CURRICULUM_NODES.find((n) => n.id === topicId);
  const visualConfig = TOPIC_VISUAL_CONFIG[topicId];
  const safeStep = Math.min(stepIdx, spec.steps.length - 1);
  const mergedQuestions = [...spec.questions, ...(visualConfig.extraQuestions ?? [])];

  const courseNodes = CURRICULUM_NODES.filter((n) => n.courseId === spec.courseId);
  const currentIdx = courseNodes.findIndex((n) => n.id === topicId);
  const nextNode = courseNodes[(currentIdx + 1) % courseNodes.length];

  return (
    <AtlasShell activeCourse={spec.courseId}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-12">
        <LessonNavHeader
          courseId={spec.courseId}
          activeNodeId={topicId}
          code={nodeMeta?.code ?? spec.code}
        />

        <header className="space-y-3 max-w-4xl">
          <div className="inline-flex items-center gap-2">
            {nodeMeta && (
              <span
                className="px-3 py-1 rounded-xl font-mono-data text-sm font-semibold border"
                style={{
                  color: course.accent,
                  borderColor: `${course.accent}55`,
                  backgroundColor: `${course.accent}16`,
                }}
              >
                {nodeMeta.symbol}
              </span>
            )}
            <span className="font-mono-data text-xs text-[#6F7F99]">
              {mergedQuestions.length} Interactive Drills · Visual Proof on Every Equation
            </span>
          </div>
          <h1 className="font-serif-editorial text-4xl sm:text-5xl text-[#F4F3EE] leading-tight">
            {spec.title}
          </h1>
          <p className="text-base text-[#A5B4CC] leading-relaxed">{spec.lead}</p>
        </header>

        {/* LAYER 1: 60FPS VISUAL INTUITION */}
        <section id="layer-1" className="space-y-4 scroll-mt-24">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <span
                className="font-mono-data text-[11px] uppercase tracking-widest block"
                style={{ color: course.accent }}
              >
                Layer 01 · 60fps Visual Intuition &amp; Live Manipulation
              </span>
              <h2 className="font-serif-editorial text-2xl sm:text-3xl text-[#F4F3EE]">
                Drag Parameters &amp; Watch the Geometry Respond
              </h2>
            </div>
          </div>
          <TopicVisualCanvas topicId={topicId} />
          {topicId === 'pc-vectors' && <VectorParallelogramCanvas />}
        </section>

        {/* LAYER 2: VISUALIZED MATHEMATICAL FORMALIZATION */}
        <section id="layer-2" className="space-y-4 scroll-mt-24">
          <div>
            <span
              className="font-mono-data text-[11px] uppercase tracking-widest block"
              style={{ color: course.accent }}
            >
              Layer 02 · Visualized Mathematical Equations &amp; Invariants
            </span>
            <h2 className="font-serif-editorial text-2xl sm:text-3xl text-[#F4F3EE]">
              Every Formula Paired With Its Geometric Meaning
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {spec.axioms.map((ax, idx) => (
              <div key={ax.label} className="instrument-frame p-4 sm:p-5 flex flex-col justify-between gap-3.5">
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className="font-mono-data text-[10.5px] uppercase tracking-wider"
                      style={{ color: course.accent }}
                    >
                      {ax.label}
                    </span>
                    <span className="font-mono-data text-[9.5px] px-2 py-0.5 rounded-full bg-white/[0.04] text-[#6F7F99]">
                      EQ 0{idx + 1}
                    </span>
                  </div>

                  <EquationMiniVisual
                    kind={visualConfig.axiomVisuals[idx] ?? visualConfig.axiomVisuals[0]}
                    accent={course.accent}
                  />

                  <div className="instrument-panel px-3 py-2.5 overflow-x-auto">
                    <MathTex tex={ax.tex} displayMode className="text-[#F4F3EE]" />
                  </div>
                </div>
                <p className="text-xs text-[#A5B4CC] leading-relaxed">{ax.note}</p>
              </div>
            ))}
          </div>
        </section>

        {/* LAYER 3: SYNCHRONIZED GUIDED DERIVATION */}
        <section id="layer-3" className="instrument-frame p-5 sm:p-7 space-y-5 scroll-mt-24">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <span
                className="font-mono-data text-[11px] uppercase tracking-widest block"
                style={{ color: course.accent }}
              >
                Layer 03 · Synchronized Step-by-Step Visual Derivation
              </span>
              <h2 className="font-serif-editorial text-2xl sm:text-3xl text-[#F4F3EE]">
                Follow Each Algebraic Move Alongside Its Live Diagram
              </h2>
            </div>

            <button
              type="button"
              onClick={() => setAutoPlaySteps((p) => !p)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-mono-data border transition-all"
              style={{
                borderColor: autoPlaySteps ? course.accent : 'rgba(255,255,255,0.16)',
                backgroundColor: autoPlaySteps ? `${course.accent}22` : 'rgba(255,255,255,0.03)',
                color: autoPlaySteps ? course.accent : '#A5B4CC',
              }}
            >
              {autoPlaySteps ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              {autoPlaySteps ? 'Pause Auto-Walkthrough' : 'Auto-Play Steps'}
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            <div className="lg:col-span-7 space-y-3">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {spec.steps.map((st, idx) => (
                  <button
                    key={st.title}
                    type="button"
                    onClick={() => {
                      setAutoPlaySteps(false);
                      setStepIdx(idx);
                    }}
                    className={`p-3 rounded-xl text-left border transition-all ${
                      safeStep === idx
                        ? 'bg-white/[0.07] text-[#F4F3EE]'
                        : 'bg-[#080D16] border-white/10 text-[#A5B4CC] hover:text-[#F4F3EE]'
                    }`}
                    style={
                      safeStep === idx
                        ? { borderColor: course.accent, boxShadow: `0 0 18px -6px ${course.accent}` }
                        : undefined
                    }
                  >
                    <span
                      className="font-mono-data text-[10px] block"
                      style={{ color: course.accent }}
                    >
                      STEP 0{idx + 1}
                    </span>
                    <span className="text-xs font-medium line-clamp-2">
                      {st.title.replace(/^Step \d+ · /, '')}
                    </span>
                  </button>
                ))}
              </div>

              <div className="instrument-panel p-5 space-y-2.5">
                <p className="font-mono-data text-xs" style={{ color: course.accent }}>
                  {spec.steps[safeStep].title}
                </p>
                <div className="overflow-x-auto py-1">
                  <MathTex tex={spec.steps[safeStep].tex} displayMode className="text-[#F4F3EE]" />
                </div>
                <p className="text-xs sm:text-sm text-[#A5B4CC] leading-relaxed">
                  {spec.steps[safeStep].note}
                </p>
              </div>
            </div>

            <div className="lg:col-span-5">
              <DerivationStepVisual
                visualKinds={visualConfig.stepVisuals}
                stepIndex={safeStep}
                stepTitle={spec.steps[safeStep].title}
                accent={course.accent}
              />
            </div>
          </div>
        </section>

        {/* LAYER 4: PRACTICE ENGINE */}
        <section id="layer-4" className="space-y-4 scroll-mt-24">
          <div>
            <span
              className="font-mono-data text-[11px] uppercase tracking-widest block"
              style={{ color: course.accent }}
            >
              Layer 04 · Interactive Verification &amp; Worked Solutions
            </span>
            <h2 className="font-serif-editorial text-2xl sm:text-3xl text-[#F4F3EE]">
              Test Your Intuition With Instant Step-by-Step Feedback
            </h2>
          </div>
          <PracticeEngine questions={mergedQuestions} accentColor={course.accent} />
        </section>

        {/* LAYER 5: COMMON MISCONCEPTION VISUALLY PROVEN */}
        <section
          id="layer-5"
          className="instrument-frame p-5 sm:p-7 space-y-5 border-[#FF7A5C]/35 scroll-mt-24"
        >
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-[#FF7A5C] shrink-0 mt-1" />
            <div>
              <span className="font-mono-data text-[11px] uppercase tracking-widest text-[#FF7A5C] block">
                Layer 05 · Typical Error Visually Proven
              </span>
              <h2 className="font-serif-editorial text-2xl sm:text-3xl text-[#F4F3EE]">
                {spec.misconception.title}
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
            <div className="lg:col-span-6">
              <MisconceptionVisual kind={visualConfig.misconceptionPlot} />
            </div>

            <div className="lg:col-span-6 space-y-3">
              <div className="instrument-panel p-4 border-[#FF7A5C]/35">
                <span className="font-mono-data text-[10px] text-[#FF7A5C] uppercase block mb-1">
                  Common Fallacy (Fails Geometrically)
                </span>
                <div className="overflow-x-auto">
                  <MathTex tex={spec.misconception.falseTex} displayMode className="text-[#FF7A5C]" />
                </div>
              </div>
              <div className="instrument-panel p-4 border-[#36EBA8]/35">
                <span className="font-mono-data text-[10px] text-[#36EBA8] uppercase block mb-1">
                  Verified Mathematical Law
                </span>
                <div className="overflow-x-auto">
                  <MathTex tex={spec.misconception.trueTex} displayMode className="text-[#36EBA8]" />
                </div>
              </div>
              <p className="text-xs sm:text-sm text-[#A5B4CC] leading-relaxed">
                {spec.misconception.explanation}
              </p>
            </div>
          </div>
        </section>

        {/* LAYER 6: REAL-WORLD APPLICATION + SCHEMATIC */}
        <section id="layer-6" className="instrument-frame p-5 sm:p-7 space-y-5 scroll-mt-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-7 space-y-3">
              <span className="font-mono-data text-[11px] uppercase tracking-widest text-[#F5BC5E] block">
                Layer 06 · Real-World Scientific &amp; Engineering Application
              </span>
              <h2 className="font-serif-editorial text-2xl sm:text-3xl text-[#F4F3EE]">
                {spec.application.title}
              </h2>
              <p className="text-xs sm:text-sm text-[#A5B4CC] leading-relaxed">
                {spec.application.context}
              </p>
              <div className="instrument-panel p-4 overflow-x-auto">
                <MathTex tex={spec.application.formulaTex} displayMode className="text-[#F4F3EE]" />
              </div>
            </div>

            <div className="lg:col-span-5">
              <ApplicationVisual
                kind={visualConfig.applicationVisual}
                accent={course.accent}
                domainTag={visualConfig.applicationTag}
              />
            </div>
          </div>
        </section>

        {/* LAYER 7: VERIFIED FLORIDA B.E.S.T. STANDARDS + NEXT LESSON */}
        <section id="layer-7" className="instrument-frame p-5 sm:p-6 space-y-4 scroll-mt-24">
          <span
            className="font-mono-data text-[10px] uppercase tracking-[0.18em] block"
            style={{ color: course.accent }}
          >
            Layer 07 · Verified Florida B.E.S.T. Standards (Consulted {CONSULTED_DATE})
          </span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {spec.standards.map((code) => {
              const s = VERIFIED_STANDARDS[code];
              if (!s) return null;
              return (
                <div key={code} className="instrument-panel p-4 space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono-data text-xs" style={{ color: course.accent }}>
                      {s.code}
                    </span>
                    <a
                      href={s.sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-mono-data text-[#A5B4CC] hover:text-[#F4F3EE]"
                    >
                      {s.sourceLabel} <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <p className="text-xs text-[#F4F3EE] leading-relaxed">{s.description}</p>
                </div>
              );
            })}
          </div>

          {nextNode && (
            <div className="pt-4 border-t hairline-rule flex flex-wrap items-center justify-between gap-3">
              <div className="text-xs text-[#A5B4CC]">
                <span className="font-mono-data text-[10px] uppercase text-[#6F7F99] block">
                  Continue {course.title} Sequence
                </span>
                <strong className="text-[#F4F3EE] font-serif-editorial text-lg">
                  {nextNode.code} · {nextNode.title}
                </strong>
              </div>
              <Link
                to={nextNode.route}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold text-[#03050A] hover:brightness-110 transition-all"
                style={{ backgroundColor: course.accent }}
              >
                <Sparkles className="w-3.5 h-3.5" />
                Next Visual Lesson
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </section>
      </div>
    </AtlasShell>
  );
}
