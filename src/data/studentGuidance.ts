import { CURRICULUM_NODES } from './curriculumGraph';
import { CourseId } from './standards';

export const MASTERED_NODES_STORAGE_KEY = 'aurea_mastered_nodes_v1';
export const PROGRESS_CHANGE_EVENT = 'aurea-progress-change';

export interface SurvivalRule {
  id: string;
  title: string;
  badge: string;
  tex: string;
  plainEnglish: string;
  quickNote: string;
}

export interface SymbolGlossaryEntry {
  id: string;
  symbolTex: string;
  name: string;
  meaning: string;
  exampleTex: string;
  exampleNote: string;
}

export interface NodeGuidance {
  nodeId: string;
  courseId: CourseId;
  stepNumber: number;
  prerequisiteNodeId: string | null;
  prerequisiteTitle: string;
  prerequisiteRoute: string | null;
  whyThisMatters: string;
  warmUpPrompt: string;
  warmUpPromptTex?: string;
  warmUpAnswer: string;
  warmUpAnswerTex?: string;
  keySymbols: [SymbolGlossaryEntry, SymbolGlossaryEntry, SymbolGlossaryEntry];
  nextTip: string;
  nextNodeId: string | null;
}

/**
 * Safely reads the list of mastered CurriculumNode IDs from localStorage.
 */
export function getCompletedNodes(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(MASTERED_NODES_STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const seen = new Set<string>();
    const valid: string[] = [];
    for (const item of parsed) {
      if (typeof item === 'string' && item.trim().length > 0 && !seen.has(item)) {
        seen.add(item);
        valid.push(item);
      }
    }
    return valid;
  } catch {
    return [];
  }
}

/**
 * Toggles mastery for a given CurriculumNode ID, persists it safely, and notifies listeners.
 */
export function toggleNodeCompleted(nodeId: string): string[] {
  const current = getCompletedNodes();
  const exists = current.includes(nodeId);
  const next = exists ? current.filter((id) => id !== nodeId) : [...current, nodeId];

  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(MASTERED_NODES_STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Ignore storage quota or private-mode errors gracefully
    }
    try {
      window.dispatchEvent(new Event(PROGRESS_CHANGE_EVENT));
    } catch {
      // Ignore dispatch errors in restricted environments
    }
  }

  return next;
}

export const COURSE_ORDER: CourseId[] = ['algebra-1', 'geometry', 'algebra-2', 'precalculus'];

export const COURSE_SURVIVAL_GUIDES: Record<CourseId, SurvivalRule[]> = {
  'algebra-1': [
    {
      id: 'a1-balance-rule',
      title: 'Balance Golden Rule',
      badge: 'Core Law',
      tex: 'a = b \\implies a + c = b + c, \\quad ac = bc \\; (c \\ne 0)',
      plainEnglish:
        'An equals sign is a balanced scale: whatever you add, subtract, multiply, or divide on the left side, do the exact same thing to the right side.',
      quickNote: 'Undo +/− first, then undo ×/÷ to isolate x cleanly.',
    },
    {
      id: 'a1-slope-intercept',
      title: 'Slope-Intercept Form',
      badge: 'Graph Key',
      tex: 'y = mx + b, \\quad m = \\dfrac{y_2 - y_1}{x_2 - x_1}',
      plainEnglish:
        'm is your speed (Rise over Run—how much y changes for +1 step in x), and b is your starting height right at x = 0.',
      quickNote: 'Plot (0, b) first, then step right 1 and up/down m.',
    },
    {
      id: 'a1-point-slope',
      title: 'Point-Slope Shortcut',
      badge: 'Fast Formula',
      tex: 'y - y_1 = m(x - x_1)',
      plainEnglish:
        'Have a slope m and ANY point (x₁, y₁)? Drop them straight in! You never have to hunt for the y-intercept first.',
      quickNote: 'Watch the minus signs: point (3, −2) becomes y + 2 = m(x − 3).',
    },
    {
      id: 'a1-quadratic-discriminant',
      title: 'Quadratic Formula & Discriminant Sign Guide',
      badge: 'EOC Lifesaver',
      tex: 'x = \\dfrac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}, \\quad \\Delta = b^2 - 4ac',
      plainEnglish:
        'Solves ANY ax² + bx + c = 0. Look inside the square root (Δ): if Δ > 0 you get 2 real x-intercepts; Δ = 0 gives 1 tangent bounce; Δ < 0 means 0 real roots.',
      quickNote: 'Put parentheses around negative b: (-4)² = +16, not −16!',
    },
    {
      id: 'a1-exponent-laws',
      title: 'Exponent Laws',
      badge: 'Power Rules',
      tex: 'x^a x^b = x^{a+b}, \\quad \\dfrac{x^a}{x^b} = x^{a-b}, \\quad (x^a)^b = x^{ab}, \\quad x^{-n} = \\dfrac{1}{x^n}',
      plainEnglish:
        'Multiplying matching bases ADDS powers, dividing SUBTRACTS powers, power-on-power MULTIPLIES powers, and a negative exponent just flips across the fraction bar.',
      quickNote: 'Anything nonzero to the 0 power equals 1: x⁰ = 1.',
    },
    {
      id: 'a1-factoring-shortcuts',
      title: 'Factoring Shortcuts',
      badge: 'Pattern Hack',
      tex: 'a^2 - b^2 = (a - b)(a + b), \\quad x^2 + (p+q)x + pq = (x+p)(x+q)',
      plainEnglish:
        'Always pull out a Greatest Common Factor first. Next check for two squares subtracting (a² − b²), or pick two numbers p, q that ADD to the middle term and MULTIPLY to the end.',
      quickNote: 'Quick sanity check: (x + 3)² = x² + 6x + 9 (never forget the 6x!).',
    },
    {
      id: 'a1-inequality-flip',
      title: 'Inequality Sign-Flip Rule',
      badge: 'Trap Alert',
      tex: '-2x > 6 \\implies x < -3 \\quad (\\text{divide by } -2 \\text{ flips } > \\text{ to } <)',
      plainEnglish:
        'Multiplying or dividing both sides by a NEGATIVE number flips the inequality arrow around. Adding or subtracting a negative keeps the arrow unchanged.',
      quickNote: 'Graph ≤ or ≥ with a solid line; graph < or > with a dashed line.',
    },
    {
      id: 'a1-exponential-growth',
      title: 'Exponential Growth vs. Decay',
      badge: 'Real World',
      tex: 'f(t) = a(1 + r)^t \\;(\\text{grow}), \\quad f(t) = a(1 - r)^t \\;(\\text{decay})',
      plainEnglish:
        'Linear adds the same amount each step; exponential MULTIPLIES by b every step. Losing 15% per year keeps 85%, so use b = 0.85—not 0.15!',
      quickNote: 'At t = 0, f(0) = a because b⁰ = 1.',
    },
  ],
  geometry: [
    {
      id: 'g-transversal-angles',
      title: 'Parallel Rails & Transversal Pairs',
      badge: 'Proof Key',
      tex: '\\ell_1 \\parallel \\ell_2 \\implies \\angle_{\\text{alt.int}} \\cong \\angle_{\\text{alt.int}}, \\quad \\angle_A + \\angle_B = 180^\\circ',
      plainEnglish:
        'When a diagonal cuts two parallel lines, all 8 angles are either twins (equal) or straight-line partners that add up to 180°.',
      quickNote: 'Look for Z-shapes (alternate interior = equal) vs. C-shapes (same-side = 180°).',
    },
    {
      id: 'g-congruence-similarity',
      title: 'Congruence Locks & Area Scale k²',
      badge: 'Scale Law',
      tex: '\\text{Length } \\times k \\implies \\text{Area } \\times k^2, \\quad \\text{Volume } \\times k^3',
      plainEnglish:
        'Triple every side of a shape (k = 3) and its area explodes by 3² = 9× while its 3D volume grows by 3³ = 27×.',
      quickNote: 'Valid triangle locks: SSS, SAS, ASA, AAS, HL (never SSA or AAA for congruence!).',
    },
    {
      id: 'g-polygon-sum',
      title: 'Polygon Interior Angle Sum',
      badge: 'Shape Law',
      tex: '\\Sigma \\angle_{\\text{interior}} = (n - 2) \\cdot 180^\\circ',
      plainEnglish:
        'Every n-sided polygon slices cleanly into (n − 2) triangles, so multiply (n − 2) by 180° for total angles. Exterior angles ALWAYS sum to 360°.',
      quickNote: 'Triangle = 180°, Quadrilateral = 360°, Pentagon = 540°, Hexagon = 720°.',
    },
    {
      id: 'g-pythagoras-trig',
      title: 'Pythagoras & SOH-CAH-TOA',
      badge: 'Right Triangles',
      tex: 'a^2 + b^2 = c^2, \\quad \\sin\\theta = \\tfrac{O}{H}, \\; \\cos\\theta = \\tfrac{A}{H}, \\; \\tan\\theta = \\tfrac{O}{A}',
      plainEnglish:
        'c is ALWAYS the longest side across from the 90° corner. Use Trig ratios when you have one side and one acute angle.',
      quickNote: 'Spot fast triples: 3-4-5, 5-12-13, 8-15-17 (and multiples like 6-8-10).',
    },
    {
      id: 'g-coord-distance',
      title: 'Distance, Midpoint & Perpendicular Slopes',
      badge: 'Grid Tool',
      tex: 'd = \\sqrt{(x_2-x_1)^2 + (y_2-y_1)^2}, \\quad m_1 \\cdot m_2 = -1',
      plainEnglish:
        'The Distance Formula is literally Pythagoras on a coordinate grid! Perpendicular lines have opposite-reciprocal slopes (flip the fraction and flip the sign).',
      quickNote: 'Midpoint just averages the x-values and averages the y-values.',
    },
    {
      id: 'g-circles-solids',
      title: 'Inscribed Angles & 3D Pyramid/Cone 1/3 Rule',
      badge: '3D & Circles',
      tex: '\\theta_{\\text{inscr}} = \\tfrac{1}{2}\\theta_{\\text{central}}, \\quad V_{\\text{cone/pyr}} = \\tfrac{1}{3}Bh',
      plainEnglish:
        'An angle touching the circle rim sees half the central angle. Pointy 3D shapes (pyramids and cones) hold 1/3 the volume of a flat-top prism/cylinder.',
      quickNote: 'Always use perpendicular height h for Volume, and slanted edge l for Surface Area!',
    },
  ],
  'algebra-2': [
    {
      id: 'a2-complex-i',
      title: 'Imaginary Rotations & Conjugates',
      badge: 'Argand Plane',
      tex: 'i^2 = -1, \\quad (a + bi)(a - bi) = a^2 + b^2',
      plainEnglish:
        'Multiplying by i rotates a number 90° counterclockwise off the real number line. Multiply by the conjugate (flip the middle sign) to clear i from denominators.',
      quickNote: 'Powers of i cycle every 4: i, −1, −i, +1.',
    },
    {
      id: 'a2-log-loop',
      title: 'The Logarithm-Exponent Loop',
      badge: 'Inverse Key',
      tex: 'y = \\log_b(x) \\iff b^y = x \\quad (x > 0)',
      plainEnglish:
        'A logarithm just asks: "What exponent turns base b into x?" Because logs reverse exponentials, their graphs mirror across y = x.',
      quickNote: 'Check solutions at the end—you can never take log of 0 or a negative number!',
    },
    {
      id: 'a2-log-laws',
      title: 'Log Product, Quotient & Power Laws',
      badge: 'Algebra Hack',
      tex: '\\log(AB) = \\log A + \\log B, \\quad \\log(A^k) = k\\log A',
      plainEnglish:
        'Since logs are exponents, multiplying inside a log turns into adding logs, and exponents inside hop straight out to the front.',
      quickNote: 'Watch out: log(A + B) CANNOT split into log A + log B!',
    },
    {
      id: 'a2-poly-multiplicity',
      title: 'Polynomial Root Multiplicity',
      badge: 'Curve Behavior',
      tex: '(x - r)^1 \\text{ crosses}, \\quad (x - r)^2 \\text{ bounces}, \\quad (x - r)^3 \\text{ flattens}',
      plainEnglish:
        'Odd exponent on a factor (x − r) cuts through the x-axis; even exponent bounces smoothly off like a mini parabola without crossing.',
      quickNote: 'Odd total degree = opposite arrow ends; even degree = both ends point the same way.',
    },
    {
      id: 'a2-rational-poles',
      title: 'Holes vs. Vertical Asymptotes',
      badge: 'Domain Guard',
      tex: '\\text{Shared zero } \\tfrac{0}{0} \\to \\text{Hole}, \\quad \\text{Leftover } \\tfrac{k}{0} \\to \\text{Vertical Pole}',
      plainEnglish:
        'Factor top and bottom first. A factor that cancels leaves a tiny missing dot (hole); a denominator zero that stays behind shoots the graph to ±∞.',
      quickNote: 'Horizontal asymptote comes from comparing the highest x-power top vs. bottom.',
    },
    {
      id: 'a2-normal-rule',
      title: 'Normal Bell 68–95–99.7 Rule',
      badge: 'Data Science',
      tex: 'z = \\dfrac{x - \\mu}{\\sigma} \\implies \\pm 1\\sigma: 68\\%, \\; \\pm 2\\sigma: 95\\%, \\; \\pm 3\\sigma: 99.7\\%',
      plainEnglish:
        'z-score measures how many standard deviations σ an observation sits away from the average μ. Nearly every normal data point lives within ±3σ.',
      quickNote: 'Positive z is above average; negative z is below average.',
    },
  ],
  precalculus: [
    {
      id: 'pc-unit-circle-law',
      title: 'Unit Circle & Pythagorean Identity',
      badge: 'Harmonic Core',
      tex: 'P(\\theta) = (\\cos\\theta, \\sin\\theta), \\quad \\sin^2\\theta + \\cos^2\\theta = 1',
      plainEnglish:
        'Every point on the radius-1 circle has x = cos θ and y = sin θ. By Pythagoras, x² + y² = 1 holds true for EVERY angle in the universe.',
      quickNote: '180° = π radians, so 90° = π/2, 60° = π/3, 45° = π/4, 30° = π/6.',
    },
    {
      id: 'pc-oblique-laws',
      title: 'Law of Sines & Law of Cosines',
      badge: 'Any Triangle',
      tex: '\\dfrac{a}{\\sin A} = \\dfrac{b}{\\sin B} = 2R, \\quad c^2 = a^2 + b^2 - 2ab\\cos C',
      plainEnglish:
        'Works on triangles WITHOUT a 90° angle! Use Law of Sines when you have a matching angle-side pair; use Law of Cosines for SAS or SSS.',
      quickNote: 'When C = 90°, cos(90°) = 0 and Law of Cosines collapses right into Pythagoras.',
    },
    {
      id: 'pc-vectors-det',
      title: 'Vectors, Dot Product & 2×2 Determinant',
      badge: 'Linear Algebra',
      tex: '\\vec{u} \\cdot \\vec{v} = u_1 v_1 + u_2 v_2, \\quad \\det(M) = ad - bc',
      plainEnglish:
        'Dot product = 0 proves two vectors meet at 90°. The determinant ad − bc tells you how much a 2×2 matrix stretches or flips area.',
      quickNote: 'If det(M) = 0, the matrix squashes 2D space flat onto a line (no inverse!).',
    },
    {
      id: 'pc-polar-coords',
      title: 'Polar ↔ Rectangular Bridge',
      badge: 'Radar Grid',
      tex: 'x = r\\cos\\theta, \\quad y = r\\sin\\theta, \\quad r^2 = x^2 + y^2',
      plainEnglish:
        'Instead of (right x, up y), polar coordinates navigate like radar: spin to angle θ, then walk out distance r from the center.',
      quickNote: 'r(θ) = a cos(nθ) draws n petals if n is odd, and 2n petals if n is even!',
    },
    {
      id: 'pc-conic-ecc',
      title: 'Conic Sections & Eccentricity',
      badge: 'Orbits',
      tex: '\\dfrac{x^2}{a^2} + \\dfrac{y^2}{b^2} = 1 \\;(\\text{ellipse}), \\quad \\dfrac{x^2}{a^2} - \\dfrac{y^2}{b^2} = 1 \\;(\\text{hyperbola})',
      plainEnglish:
        'Eccentricity e = c/a measures orbit stretch: e = 0 is a perfect circle, 0 < e < 1 is an ellipse, e = 1 is a parabola, and e > 1 is a hyperbola.',
      quickNote: 'Plus (+) in standard form gives a closed ellipse; minus (−) splits a hyperbola.',
    },
    {
      id: 'pc-series-limits',
      title: 'Infinite Series & Calculus Derivative Limit',
      badge: 'Calc Launchpad',
      tex: 'S_\\infty = \\dfrac{a_1}{1 - r} \\;(|r|<1), \\quad f\'(x) = \\lim_{h\\to 0}\\dfrac{f(x+h)-f(x)}{h}',
      plainEnglish:
        'Adding infinitely many shrinking pieces (|r| < 1) settles onto an exact finite number. Shrinking step h → 0 turns average secant slope into exact speed!',
      quickNote: 'If |r| ≥ 1, a geometric series blows up instead of converging.',
    },
  ],
};

export const COURSE_SYMBOL_GLOSSARY: Record<CourseId, SymbolGlossaryEntry[]> = {
  'algebra-1': [
    {
      id: 'sym-a1-x',
      symbolTex: 'x',
      name: 'Variable (Unknown Number)',
      meaning: 'A placeholder letter standing in for a number that can change or needs solving.',
      exampleTex: 'x + 4 = 11 \\implies x = 7',
      exampleNote: 'Here x stands for 7 so both sides stay equal.',
    },
    {
      id: 'sym-a1-m',
      symbolTex: 'm = \\tfrac{\\Delta y}{\\Delta x}',
      name: 'Slope (Rate of Change)',
      meaning: 'How fast y rises or falls each time x steps +1 to the right.',
      exampleTex: 'm = \\tfrac{14 - 8}{5 - 3} = 3',
      exampleNote: 'Every +1 step in x lifts y by +3.',
    },
    {
      id: 'sym-a1-b',
      symbolTex: 'b',
      name: 'y-Intercept (Starting Value)',
      meaning: 'The height where a graph touches the vertical y-axis (when x = 0).',
      exampleTex: 'y = 4x + 5 \\implies (0, 5)',
      exampleNote: 'Starts at 5 when x = 0.',
    },
    {
      id: 'sym-a1-sqrt',
      symbolTex: '\\sqrt[n]{x}',
      name: 'nth Root (Radical)',
      meaning: 'Undoes an exponent: asks what number multiplied n times gives x.',
      exampleTex: '\\sqrt{49} = 7, \\quad \\sqrt[3]{27} = 3',
      exampleNote: '7 × 7 = 49 and 3 × 3 × 3 = 27.',
    },
    {
      id: 'sym-a1-ineq',
      symbolTex: '\\le, \\; \\ge, \\; <, \\; >',
      name: 'Inequality Signs',
      meaning: 'Point toward the smaller number; the bar underneath (≤, ≥) means "or equal to" (solid boundary).',
      exampleTex: 'x \\le 5 \\;(\\text{includes } 5), \\quad x < 5 \\;(\\text{below } 5)',
      exampleNote: 'Dividing by a negative flips the direction!',
    },
    {
      id: 'sym-a1-abs',
      symbolTex: '|x - h|',
      name: 'Absolute Value (Distance)',
      meaning: 'Drops any minus sign to measure pure positive distance between x and h.',
      exampleTex: '|2 - 7| = |-5| = 5',
      exampleNote: '2 and 7 sit 5 units apart on a number line.',
    },
    {
      id: 'sym-a1-delta',
      symbolTex: '\\Delta = b^2 - 4ac',
      name: 'Quadratic Discriminant',
      meaning: 'Quick test telling how many times a parabola touches the x-axis: + means 2, 0 means 1, − means 0.',
      exampleTex: 'x^2 - 4x + 4 \\implies \\Delta = 16 - 16 = 0',
      exampleNote: 'One clean tangent touch at x = 2.',
    },
    {
      id: 'sym-a1-res',
      symbolTex: '\\hat{y}, \\; e_i',
      name: 'Predicted Line & Residual',
      meaning: 'ŷ ("y-hat") is the model guess on the line; residual e = actual − predicted.',
      exampleTex: 'e = 88 - 82 = +6',
      exampleNote: 'Actual score landed 6 points above the line.',
    },
  ],
  geometry: [
    {
      id: 'sym-g-cong',
      symbolTex: '\\cong',
      name: 'Congruent (Exact Twin)',
      meaning: 'Exact same size and exact same shape—one fits cleanly over the other.',
      exampleTex: '\\triangle ABC \\cong \\triangle DEF',
      exampleNote: 'All matching sides and angles are equal.',
    },
    {
      id: 'sym-g-sim',
      symbolTex: '\\sim',
      name: 'Similar (Zoomed Shape)',
      meaning: 'Exact same angles, with all side lengths scaled up or down by the same zoom ratio k.',
      exampleTex: '3\\text{-}4\\text{-}5 \\sim 6\\text{-}8\\text{-}10 \\;(k = 2)',
      exampleNote: 'Double the sides, multiply area by k² = 4.',
    },
    {
      id: 'sym-g-para',
      symbolTex: '\\parallel \\;\\text{vs.}\\; \\perp',
      name: 'Parallel vs. Perpendicular',
      meaning: '∥ means train tracks that never cross (equal slope); ⊥ means meeting at a square 90° corner.',
      exampleTex: 'm_1 = 2 \\;\\perp\\; m_2 = -\\tfrac{1}{2}',
      exampleNote: 'Perpendicular slopes multiply to −1.',
    },
    {
      id: 'sym-g-trig',
      symbolTex: '\\sin\\theta, \\; \\cos\\theta, \\; \\tan\\theta',
      name: 'Right-Triangle Trig Ratios',
      meaning: 'Constant side ratios locked by acute angle θ: SOH (O/H), CAH (A/H), TOA (O/A).',
      exampleTex: '\\sin(30^\\circ) = \\tfrac{3}{6} = 0.5',
      exampleNote: 'Across from 30° is always half the hypotenuse!',
    },
    {
      id: 'sym-g-pi',
      symbolTex: '\\pi',
      name: 'Pi (Circle Constant)',
      meaning: 'How many diameters wrap around ANY circle’s rim—always about 3.14159.',
      exampleTex: 'C = 2\\pi r \\approx 2(3.14)(5) = 31.4',
      exampleNote: 'Keep exact answers in terms of π whenever asked.',
    },
    {
      id: 'sym-g-bh',
      symbolTex: 'B, \\; l, \\; V',
      name: 'Base Area, Slant Height & Volume',
      meaning: 'Capital B is the entire 2D floor area (not just side b!), l climbs a slanted wall, and V counts 3D cubes.',
      exampleTex: 'V_{\\text{pyr}} = \\tfrac{1}{3}Bh = \\tfrac{1}{3}(12)(5) = 20',
      exampleNote: 'Pyramids & cones always carry the 1/3 factor.',
    },
  ],
  'algebra-2': [
    {
      id: 'sym-a2-i',
      symbolTex: 'i = \\sqrt{-1}',
      name: 'Imaginary Unit (90° Turn)',
      meaning: 'A number whose square is −1; geometrically rotates values 90° off the real line.',
      exampleTex: '(3i)^2 = 9i^2 = -9',
      exampleNote: 'Unlocks solutions even when parabola Δ < 0.',
    },
    {
      id: 'sym-a2-inv',
      symbolTex: 'f^{-1}(x)',
      name: 'Inverse Function ("Undo")',
      meaning: 'The reverse machine that swaps x and y—reflecting the graph across y = x.',
      exampleTex: 'f(x)=2x \\implies f^{-1}(x) = \\tfrac{x}{2}',
      exampleNote: 'Warning: −1 here means inverse, NOT 1/f(x)!',
    },
    {
      id: 'sym-a2-log',
      symbolTex: '\\log_b(x)',
      name: 'Logarithm (Exponent Finder)',
      meaning: 'Asks: "What exponent on base b builds x?"',
      exampleTex: '\\log_2(16) = 4 \\text{ because } 2^4 = 16',
      exampleNote: 'ln(x) simply means log with base e ≈ 2.718.',
    },
    {
      id: 'sym-a2-mat',
      symbolTex: '\\mathbf{W}\\mathbf{x} + \\mathbf{b}',
      name: 'Matrix Weight + Bias Layer',
      meaning: 'Packs dozens of multiply-and-add equations into one clean grid operation used in AI.',
      exampleTex: '\\begin{bmatrix}2 & 1\\end{bmatrix}\\begin{bmatrix}3\\\\4\\end{bmatrix} = 2(3)+1(4)=10',
      exampleNote: 'Dot product turns vectors into neuron signals.',
    },
    {
      id: 'sym-a2-nck',
      symbolTex: '\\binom{n}{k}',
      name: 'Combination ("n Choose k")',
      meaning: 'Counts how many groups of size k you can pick from n items when order doesn’t matter.',
      exampleTex: '\\binom{5}{2} = \\tfrac{5 \\cdot 4}{2} = 10',
      exampleNote: 'Matches Row 5, Position 2 of Pascal’s Triangle!',
    },
    {
      id: 'sym-a2-norm',
      symbolTex: '\\mu, \\; \\sigma, \\; z',
      name: 'Mean, Spread & Z-Score',
      meaning: 'μ is the center average, σ is typical spread, and z counts how many σ steps away you landed.',
      exampleTex: 'z = \\tfrac{85 - 75}{5} = +2',
      exampleNote: 'Score 85 is 2 standard deviations above 75.',
    },
  ],
  precalculus: [
    {
      id: 'sym-pc-rad',
      symbolTex: '\\theta \\;(\\text{rad})',
      name: 'Radian Angle Measure',
      meaning: 'Measures an angle by how many radius-lengths wrap along the circle rim (π rad = 180°).',
      exampleTex: '60^\\circ = \\tfrac{\\pi}{3}\\text{ rad}',
      exampleNote: 'Full 360° spin equals 2π radians.',
    },
    {
      id: 'sym-pc-vec',
      symbolTex: '\\vec{v} = \\langle a, b\\rangle, \\; \\|\\vec{v}\\|',
      name: 'Vector & Magnitude',
      meaning: 'An arrow moving `a` units sideways and `b` units vertically, with total length ‖v‖.',
      exampleTex: '\\|\\langle 3, 4 \\rangle\\| = \\sqrt{3^2+4^2} = 5',
      exampleNote: 'Angle brackets ⟨ ⟩ signal a vector arrow, not a fixed point.',
    },
    {
      id: 'sym-pc-polar',
      symbolTex: '(r, \\theta)',
      name: 'Polar Radar Coordinates',
      meaning: 'Aim at angle θ first, then step outward distance r from the center pole.',
      exampleTex: '(r, \\theta) = (4, 90^\\circ) \\to (0, 4)',
      exampleNote: 'Great for spirals, flowers, and orbital mechanics.',
    },
    {
      id: 'sym-pc-ecc',
      symbolTex: 'e = \\tfrac{c}{a}',
      name: 'Conic Eccentricity',
      meaning: 'Measures how stretched a slice of a cone is: 0 = circle, < 1 = ellipse, 1 = parabola, > 1 = hyperbola.',
      exampleTex: 'c=3, \\; a=5 \\implies e = 0.6 \\;(\\text{ellipse})',
      exampleNote: 'Earth’s orbit has e ≈ 0.017 (nearly circular!).',
    },
    {
      id: 'sym-pc-sigma',
      symbolTex: '\\sum_{k=1}^{\\infty} a_1 r^{k-1}',
      name: 'Sigma Infinite Series',
      meaning: 'Greek capital Sigma means "add every term from start to finish"—even infinitely many shrinking steps!',
      exampleTex: '\\tfrac{1}{2}+\\tfrac{1}{4}+\\tfrac{1}{8}+\\cdots = 1',
      exampleNote: 'Converges whenever |r| < 1.',
    },
    {
      id: 'sym-pc-lim',
      symbolTex: '\\lim_{h \\to 0}',
      name: 'Limit Operator',
      meaning: 'Tracks what a formula zeroes in on as h shrinks closer and closer to 0 without hitting 0/0.',
      exampleTex: '\\lim_{h\\to 0}(6 + h) = 6',
      exampleNote: 'The gateway into Differential Calculus.',
    },
  ],
};

export const NODE_GUIDANCE: Record<string, NodeGuidance> = {
  // ================= ALGEBRA 1 (9 UNITS) =================
  'a1-expressions': {
    nodeId: 'a1-expressions',
    courseId: 'algebra-1',
    stepNumber: 1,
    prerequisiteNodeId: null,
    prerequisiteTitle: 'Arithmetic & Order of Operations',
    prerequisiteRoute: '/textbook',
    whyThisMatters:
      'Algebra is like translating a messy sentence into crystal-clear Lego blocks. Once you can break an expression like x² + 5x + 6 into (x + 2)(x + 3), you immediately unlock side lengths, puzzle solutions, and every equation ahead.',
    warmUpPrompt:
      'Picture a rectangle with width (x + 3) and height (x + 5). If x = 10, what is its total area?',
    warmUpPromptTex: 'A = (10 + 3)(10 + 5)',
    warmUpAnswer:
      '195! Multiplying 13 × 15 gives 195—and notice x² + 8x + 15 = 100 + 80 + 15 = 195 too. Different outfits, exact same area!',
    warmUpAnswerTex: '13 \\times 15 = 10^2 + 8(10) + 15 = 195',
    keySymbols: [
      {
        id: 'k-a1e-x',
        symbolTex: 'x',
        name: 'Variable (Flexible Number)',
        meaning: 'A stand-in letter holding space for any number you want to test or solve.',
        exampleTex: 'x + 4 = 11 \\implies x = 7',
        exampleNote: '7 is the number that makes both sides match.',
      },
      {
        id: 'k-a1e-fac',
        symbolTex: '(x+p)(x+q)',
        name: 'Factored Rectangle Form',
        meaning: 'Shows area as Width × Height, exposing the numbers p and q right away.',
        exampleTex: '(x+2)(x+3) = x^2 + 5x + 6',
        exampleNote: '2 + 3 = 5 (middle) and 2 × 3 = 6 (end).',
      },
      {
        id: 'k-a1e-eq',
        symbolTex: '=',
        name: 'Equivalence Sign',
        meaning: 'Guarantees left and right expressions always produce the exact same value.',
        exampleTex: 'x^2 - 9 = (x - 3)(x + 3)',
        exampleNote: 'Try x = 5: 25 − 9 = 16 and 2 × 8 = 16.',
      },
    ],
    nextTip:
      'Now that you can reshape algebraic expressions into clean pieces, Step 2 puts variables in motion—measuring steady speed and slope on straight lines!',
    nextNodeId: 'a1-linear',
  },
  'a1-linear': {
    nodeId: 'a1-linear',
    courseId: 'algebra-1',
    stepNumber: 2,
    prerequisiteNodeId: 'a1-expressions',
    prerequisiteTitle: 'Algebraic Structure',
    prerequisiteRoute: '/lesson/a1-expressions',
    whyThisMatters:
      'Linear functions power every steady rate in everyday life—battery charging speed, hourly pay, Uber fares, and game character movement. Master y = mx + b once and you unlock half of Algebra 1!',
    warmUpPrompt:
      'Your phone starts at 20% battery and charges +15% every 10 minutes. What percentage will it reach after 30 minutes?',
    warmUpPromptTex: '20\\% + 3 \\times 15\\%',
    warmUpAnswer:
      '65%! Three 10-minute blocks add 45% onto your starting 20%, landing right at 65%.',
    warmUpAnswerTex: '20 + 45 = 65\\%',
    keySymbols: [
      {
        id: 'k-a1l-m',
        symbolTex: 'm = \\tfrac{\\Delta y}{\\Delta x}',
        name: 'Slope (Rate of Change)',
        meaning: 'How steep the line climbs (Rise) per unit step right (Run).',
        exampleTex: 'm = \\tfrac{11 - 5}{4 - 2} = \\tfrac{6}{2} = 3',
        exampleNote: 'Each +1 step right lifts the line +3 up.',
      },
      {
        id: 'k-a1l-b',
        symbolTex: 'b',
        name: 'y-Intercept (Start Height)',
        meaning: 'The starting output right where x = 0.',
        exampleTex: 'y = 3x + 20 \\implies \\text{starts at } (0, 20)',
        exampleNote: 'Plug in x = 0 and only b remains.',
      },
      {
        id: 'k-a1l-delta',
        symbolTex: '\\Delta',
        name: 'Delta ("Change In")',
        meaning: 'Math shorthand for "New value minus Old value".',
        exampleTex: '\\Delta x = 7 - 2 = 5',
        exampleNote: 'Always subtract in the same point order for y and x.',
      },
    ],
    nextTip:
      'Lines move by adding constant steps (+m). Next up in Step 3, you level up to repeated multiplication—Powers, Exponents, and Square Roots!',
    nextNodeId: 'a1-radicals-exp',
  },
  'a1-radicals-exp': {
    nodeId: 'a1-radicals-exp',
    courseId: 'algebra-1',
    stepNumber: 3,
    prerequisiteNodeId: 'a1-expressions',
    prerequisiteTitle: 'Algebraic Structure',
    prerequisiteRoute: '/lesson/a1-expressions',
    whyThisMatters:
      'Exponents compress gigantic numbers (like computer memory gigabytes or cosmic distances) into tiny superscripts, while radicals undo powers so you can solve distances and area back to side length.',
    warmUpPrompt:
      'What positive number times itself equals 64? Now, what number multiplied 3 times equals 64?',
    warmUpPromptTex: '\\sqrt{64} = ? \\qquad \\sqrt[3]{64} = ?',
    warmUpAnswer:
      'Square root = 8 (because 8 × 8 = 64), and cube root = 4 (because 4 × 4 × 4 = 64)!',
    warmUpAnswerTex: '8^2 = 64, \\qquad 4^3 = 64',
    keySymbols: [
      {
        id: 'k-a1r-pow',
        symbolTex: 'a^n',
        name: 'Base & Exponent',
        meaning: 'Multiply base `a` by itself `n` times.',
        exampleTex: '2^5 = 2 \\cdot 2 \\cdot 2 \\cdot 2 \\cdot 2 = 32',
        exampleNote: 'Adding powers works whenever the base matches!',
      },
      {
        id: 'k-a1r-rad',
        symbolTex: '\\sqrt[n]{x}',
        name: 'nth Root (Radical)',
        meaning: 'Reverses an nth power to uncover the original side or factor.',
        exampleTex: '\\sqrt{36} = 6, \\quad \\sqrt[3]{125} = 5',
        exampleNote: 'If no index number is written, assume 2 (square root).',
      },
      {
        id: 'k-a1r-frac',
        symbolTex: 'x^{m/n}',
        name: 'Fractional Exponent',
        meaning: 'Top number m raises to a power; bottom number n takes the root.',
        exampleTex: '8^{2/3} = (\\sqrt[3]{8})^2 = 2^2 = 4',
        exampleNote: 'Taking the root first keeps numbers small and easy!',
      },
    ],
    nextTip:
      'With exponents and linear equations in your toolkit, Step 4 pits TWO lines against each other to pinpoint exact break-even crossing points!',
    nextNodeId: 'a1-systems',
  },
  'a1-systems': {
    nodeId: 'a1-systems',
    courseId: 'algebra-1',
    stepNumber: 4,
    prerequisiteNodeId: 'a1-linear',
    prerequisiteTitle: 'Linear Functions & Slope',
    prerequisiteRoute: '/lesson/a1-linear',
    whyThisMatters:
      'Real decisions rarely depend on just one rule—comparing two phone plans, balancing budgets, or syncing two moving drones means solving two equations at the exact same time.',
    warmUpPrompt:
      'Two secret numbers add up to 14, and their difference is 4. What are the two numbers?',
    warmUpPromptTex: 'x + y = 14 \\quad \\land \\quad x - y = 4',
    warmUpAnswer:
      '9 and 5! Add the equations together to get 2x = 18, so x = 9 and y = 5.',
    warmUpAnswerTex: '2x = 18 \\implies x = 9,\\; y = 5',
    keySymbols: [
      {
        id: 'k-a1s-pt',
        symbolTex: '(x^*, y^*)',
        name: 'Solution Point',
        meaning: 'The exact coordinates that satisfy BOTH lines simultaneously.',
        exampleTex: 'y=2x \\;\\land\\; y=x+3 \\implies (3, 6)',
        exampleNote: 'Check: 6 = 2(3) and 6 = 3 + 3 both hold.',
      },
      {
        id: 'k-a1s-cap',
        symbolTex: 'L_1 \\cap L_2',
        name: 'Intersection Operator',
        meaning: 'Geometric "overlap" symbol showing where Line 1 crosses Line 2.',
        exampleTex: 'L_1 \\cap L_2 = \\{(3, 6)\\}',
        exampleNote: 'Parallel lines have 0 crossings (∅).',
      },
      {
        id: 'k-a1s-brace',
        symbolTex: '\\begin{cases} \\text{eq}_1 \\\\ \\text{eq}_2 \\end{cases}',
        name: 'System Brace',
        meaning: 'Locks two equations together as one combined puzzle.',
        exampleTex: 'x + y = 10, \\; x - y = 2',
        exampleNote: 'You can solve by substitution, elimination, or graphing.',
      },
    ],
    nextTip:
      'Sometimes life doesn’t require hitting an exact equals point—just staying inside a safe budget or speed limit! Step 5 shades whole regions with Inequalities.',
    nextNodeId: 'a1-inequalities',
  },
  'a1-inequalities': {
    nodeId: 'a1-inequalities',
    courseId: 'algebra-1',
    stepNumber: 5,
    prerequisiteNodeId: 'a1-linear',
    prerequisiteTitle: 'Linear Functions & Slope',
    prerequisiteRoute: '/lesson/a1-linear',
    whyThisMatters:
      'Whenever you see "at least", "at most", "under budget", or "safe weight limit", you’re working with inequalities—carving out entire valid zones on a map instead of one lonely point.',
    warmUpPrompt:
      'You have $30 for a $6 smoothie plus $4 snacks. At most how many $4 snacks can you buy?',
    warmUpPromptTex: '4x + 6 \\le 30',
    warmUpAnswer:
      'At most 6 snacks! Subtract $6 to leave $24, then divide 24 ÷ 4 = 6.',
    warmUpAnswerTex: '4x \\le 24 \\implies x \\le 6',
    keySymbols: [
      {
        id: 'k-a1i-solid',
        symbolTex: '\\le, \\; \\ge',
        name: 'Inclusive ("Or Equal To")',
        meaning: 'Points ON the boundary line count too, so draw a solid wall.',
        exampleTex: 'x \\ge 3 \\implies 3, 4, 5.2, \\dots \\text{ all work}',
        exampleNote: 'Solid line + shaded side.',
      },
      {
        id: 'k-a1i-dash',
        symbolTex: '<, \\; >',
        name: 'Strict Inequality',
        meaning: 'Strictly above or below—draw a dashed fence because the border is off-limits.',
        exampleTex: 'y > 2x \\implies (1, 2) \\text{ fails } (2 > 2 \\text{ false})',
        exampleNote: 'Test an easy point like (0, 0) to pick which side to shade.',
      },
      {
        id: 'k-a1i-and',
        symbolTex: '\\land',
        name: 'Logical "AND"',
        meaning: 'Overlapping zone where BOTH inequalities are satisfied together.',
        exampleTex: 'x > 1 \\;\\land\\; x \\le 4 \\implies (1, 4]',
        exampleNote: 'Where two shaded half-planes overlap creates a feasible wedge.',
      },
    ],
    nextTip:
      'Ready for graphs with sharp corners and switching rules? Step 6 bends straight lines into V-shapes and step-functions with Absolute Value & Piecewise curves!',
    nextNodeId: 'a1-abs-piecewise',
  },
  'a1-abs-piecewise': {
    nodeId: 'a1-abs-piecewise',
    courseId: 'algebra-1',
    stepNumber: 6,
    prerequisiteNodeId: 'a1-linear',
    prerequisiteTitle: 'Linear Functions & Slope',
    prerequisiteRoute: '/lesson/a1-linear',
    whyThisMatters:
      'Sensors, shipping prices, tax brackets, and AI neural activations (ReLU) switch formulas at trigger thresholds or measure pure error distance |x − target| regardless of plus/minus direction.',
    warmUpPrompt:
      'How far apart are −3 and +5 on a number line as a positive distance?',
    warmUpPromptTex: '|5 - (-3)| = ?',
    warmUpAnswer:
      '8 units! Distance never comes out negative: walking from −3 to 0 is 3 steps, plus 5 steps to +5 gives 8.',
    warmUpAnswerTex: '|5 + 3| = 8',
    keySymbols: [
      {
        id: 'k-a1a-abs',
        symbolTex: '|x - h|',
        name: 'Unsigned Distance From h',
        meaning: 'Measures how far x sits from h, turning negatives positive.',
        exampleTex: '|1 - 6| = |-5| = 5',
        exampleNote: 'Notice |x − 6| = 5 has two answers: 1 and 11.',
      },
      {
        id: 'k-a1a-vtx',
        symbolTex: '(h, k)',
        name: 'V-Corner Vertex',
        meaning: 'Sharp turning point of f(x) = a|x − h| + k.',
        exampleTex: 'f(x)=|x-4|+2 \\implies V = (4, 2)',
        exampleNote: 'Inside (x − 4) shifts RIGHT +4; outside +2 shifts UP 2.',
      },
      {
        id: 'k-a1a-pw',
        symbolTex: '\\begin{cases} g_1 & x < c \\\\ g_2 & x \\ge c \\end{cases}',
        name: 'Piecewise Switch',
        meaning: 'Chooses one formula before cutoff c and a different formula from c onward.',
        exampleTex: '\\text{ReLU}(x) = \\max(0, x)',
        exampleNote: 'Flat 0 on the left, slope +1 on the right!',
      },
    ],
    nextTip:
      'Straight rays move by addition. Step 7 unlocks explosive multiplication—where viral videos, savings interest, and cell growth double every tick!',
    nextNodeId: 'a1-exponential',
  },
  'a1-exponential': {
    nodeId: 'a1-exponential',
    courseId: 'algebra-1',
    stepNumber: 7,
    prerequisiteNodeId: 'a1-radicals-exp',
    prerequisiteTitle: 'Exponents & Radicals',
    prerequisiteRoute: '/lesson/a1-radicals-exp',
    whyThisMatters:
      'Exponential math explains why compound savings snowballs over time, how carbon dating clocks fossils, and why doubling cascades start quietly before rocketing upward.',
    warmUpPrompt:
      'A cell culture starts with 3 cells and doubles every hour. How many cells exist after 4 hours?',
    warmUpPromptTex: '3 \\cdot 2^4 = ?',
    warmUpAnswer:
      '48 cells! Double four times: 3 → 6 → 12 → 24 → 48.',
    warmUpAnswerTex: '3 \\cdot 16 = 48',
    keySymbols: [
      {
        id: 'k-a1x-a',
        symbolTex: 'a',
        name: 'Initial Value (Start)',
        meaning: 'Starting amount at t = 0 right before any growth happens.',
        exampleTex: 'f(0) = 500(1.2)^0 = 500',
        exampleNote: 'Since anything⁰ = 1, a is your y-intercept.',
      },
      {
        id: 'k-a1x-b',
        symbolTex: 'b = 1 \\pm r',
        name: 'Multiplier Base',
        meaning: 'The constant factor multiplied each step: b > 1 grows, 0 < b < 1 shrinks.',
        exampleTex: '15\\% \\text{ off} \\implies b = 1 - 0.15 = 0.85',
        exampleNote: 'Percent change r always converts to decimal first (15% = 0.15).',
      },
      {
        id: 'k-a1x-asy',
        symbolTex: 'y = k',
        name: 'Horizontal Asymptote',
        meaning: 'Invisible floor/ceiling the tail approaches closer and closer without crossing.',
        exampleTex: '100(0.5)^x \\to 0 \\text{ as } x \\to \\infty',
        exampleNote: 'Repeated halving never quite reaches 0.',
      },
    ],
    nextTip:
      'Next is the crown jewel of Algebra 1—Step 8: Quadratic Parabolas! From basketball arcs to flashlight reflectors, everything curves cleanly around (h, k).',
    nextNodeId: 'a1-quadratics',
  },
  'a1-quadratics': {
    nodeId: 'a1-quadratics',
    courseId: 'algebra-1',
    stepNumber: 8,
    prerequisiteNodeId: 'a1-expressions',
    prerequisiteTitle: 'Algebraic Structure',
    prerequisiteRoute: '/lesson/a1-expressions',
    whyThisMatters:
      'Whenever gravity pulls a ball back down, profit peaks at a sweet spot, or an area depends on x², you get a parabola. Knowing how to flip between vertex, factored, and standard forms lets you read peaks and landing spots on sight.',
    warmUpPrompt:
      'Look at f(x) = (x − 2)² − 9. What is the lowest possible value f(x) can ever output, and at which x does it happen?',
    warmUpPromptTex: 'f(x) = (x - 2)^2 - 9',
    warmUpAnswer:
      'Minimum y = −9 at x = 2! Any squared number is ≥ 0, so the smallest (x − 2)² gets is 0 right at x = 2.',
    warmUpAnswerTex: 'V(2, -9) \\implies \\min = -9',
    keySymbols: [
      {
        id: 'k-a1q-vtx',
        symbolTex: 'a(x-h)^2+k',
        name: 'Vertex Form',
        meaning: 'Spotlights the turning peak or valley (h, k) and whether it opens up (+a) or down (−a).',
        exampleTex: '-2(x-3)^2 + 10 \\implies \\max(3, 10)',
        exampleNote: 'Flip the sign inside for h; keep the outside sign for k.',
      },
      {
        id: 'k-a1q-disc',
        symbolTex: '\\Delta = b^2 - 4ac',
        name: 'Discriminant',
        meaning: 'Tells how many real x-intercepts exist: + means 2, 0 means 1, − means 0.',
        exampleTex: 'x^2 + 2x + 5 \\implies \\Delta = 4 - 20 = -16',
        exampleNote: 'Negative Δ means the parabola floats without crossing the x-axis.',
      },
      {
        id: 'k-a1q-rts',
        symbolTex: 'r_1, r_2',
        name: 'Zeros / x-Intercepts',
        meaning: 'Where output hits 0 (e.g., where a launched rocket hits the ground).',
        exampleTex: '(x-1)(x-5)=0 \\implies r_1=1,\\; r_2=5',
        exampleNote: 'Axis of symmetry sits dead center: (1 + 5)/2 = 3.',
      },
    ],
    nextTip:
      'In Algebra 1’s final unit (Step 9), you turn real noisy scatterplots into best-fit lines and measure how accurate a model really is!',
    nextNodeId: 'a1-statistics',
  },
  'a1-statistics': {
    nodeId: 'a1-statistics',
    courseId: 'algebra-1',
    stepNumber: 9,
    prerequisiteNodeId: 'a1-linear',
    prerequisiteTitle: 'Linear Functions & Slope',
    prerequisiteRoute: '/lesson/a1-linear',
    whyThisMatters:
      'Real-world measurements never sit perfectly on one straight line. Regression and residuals let data scientists, doctors, and sports analysts spot real trends while catching hidden bias.',
    warmUpPrompt:
      'A study-time line predicts you will score 82 on a quiz, and you actually score 88. What is the residual (actual − predicted)?',
    warmUpPromptTex: 'e = 88 - 82',
    warmUpAnswer:
      '+6 points! A positive residual means the real outcome beat the trend line’s prediction by 6 points.',
    warmUpAnswerTex: 'e = +6',
    keySymbols: [
      {
        id: 'k-a1st-yhat',
        symbolTex: '\\hat{y}',
        name: 'Predicted Line Output ("y-hat")',
        meaning: 'The height ON the best-fit trend line for a given input x.',
        exampleTex: '\\hat{y}(5) = 10(5) + 32 = 82',
        exampleNote: 'Always carries the little hat ^ to separate prediction from reality.',
      },
      {
        id: 'k-a1st-res',
        symbolTex: 'e_i = y_i - \\hat{y}_i',
        name: 'Residual Error',
        meaning: 'Vertical distance between an actual dot and the trend line (+ above, − below).',
        exampleTex: 'y = 78,\\; \\hat{y} = 82 \\implies e = -4',
        exampleNote: 'Least-squares finds the line minimizing the sum of squared residuals.',
      },
      {
        id: 'k-a1st-r',
        symbolTex: 'r, \\; R^2',
        name: 'Correlation & Fit Strength',
        meaning: 'r ranges from −1 to +1 showing linear tightness; R² tells % of variation explained.',
        exampleTex: 'r = -0.9 \\implies R^2 = (-0.9)^2 = 81\\%',
        exampleNote: 'Remember: strong correlation does NOT automatically prove causation!',
      },
    ],
    nextTip:
      'Milestone complete—you just finished all 9 units of Algebra 1! Next door awaits Geometry Step 1, where your linear slope instincts evolve into visual angle proofs!',
    nextNodeId: 'g-parallel-angles',
  },

  // ================= GEOMETRY (9 UNITS) =================
  'g-parallel-angles': {
    nodeId: 'g-parallel-angles',
    courseId: 'geometry',
    stepNumber: 1,
    prerequisiteNodeId: 'a1-linear',
    prerequisiteTitle: 'Linear Functions & Slope',
    prerequisiteRoute: '/lesson/a1-linear',
    whyThisMatters:
      'Geometry starts by locking down what happens when straight beams stay perfectly parallel. Eratosthenes even used alternate interior angles with sunlight shadows to measure Earth’s circumference over 2,200 years ago!',
    warmUpPrompt:
      'Two angles meet on a straight flat ruler edge. If one measures 115°, how many degrees is its partner?',
    warmUpPromptTex: '115^\\circ + \\beta = 180^\\circ',
    warmUpAnswer:
      '65°! A straight line always spans 180°, so 180° − 115° = 65°.',
    warmUpAnswerTex: '\\beta = 180^\\circ - 115^\\circ = 65^\\circ',
    keySymbols: [
      {
        id: 'k-g1-para',
        symbolTex: '\\ell_1 \\parallel \\ell_2',
        name: 'Parallel Lines',
        meaning: 'Two lines in the same flat plane with equal slope that never meet.',
        exampleTex: 'y = 2x + 1 \\parallel y = 2x - 7',
        exampleNote: 'Matching slopes guarantee parallel rails.',
      },
      {
        id: 'k-g1-cong',
        symbolTex: '\\cong',
        name: 'Congruent',
        meaning: 'Exact same degree measure or exact same length.',
        exampleTex: '\\angle 1 \\cong \\angle 5 \\;(\\text{both } 72^\\circ)',
        exampleNote: 'Different from = only because it compares shapes/angles directly.',
      },
      {
        id: 'k-g1-ang',
        symbolTex: '\\alpha + \\beta = 180^\\circ',
        name: 'Supplementary Pair',
        meaning: 'Two angles whose measures combine into a straight 180° angle.',
        exampleTex: '110^\\circ + 70^\\circ = 180^\\circ',
        exampleNote: 'Consecutive interior angles between parallel lines always sum to 180°.',
      },
    ],
    nextTip:
      'Parallel angles immediately force every flat triangle’s three corners to sum to 180°—unlocking Step 2: Triangle Congruence proofs!',
    nextNodeId: 'g-triangles',
  },
  'g-triangles': {
    nodeId: 'g-triangles',
    courseId: 'geometry',
    stepNumber: 2,
    prerequisiteNodeId: 'g-parallel-angles',
    prerequisiteTitle: 'Parallel Lines & Angles',
    prerequisiteRoute: '/lesson/g-parallel-angles',
    whyThisMatters:
      'Triangles are the only rigid polygon—push on a square and it collapses into a diamond, push on a triangle and it stays rock solid. That’s why bridges, cranes, and 3D game meshes are built out of triangles!',
    warmUpPrompt:
      'Two corners inside a triangle measure 50° and 75°. What must the third corner measure?',
    warmUpPromptTex: '50^\\circ + 75^\\circ + \\angle C = 180^\\circ',
    warmUpAnswer:
      '55°! All three interior angles sum to 180°, leaving 180° − 125° = 55°.',
    warmUpAnswerTex: '\\angle C = 180^\\circ - 125^\\circ = 55^\\circ',
    keySymbols: [
      {
        id: 'k-g2-tri',
        symbolTex: '\\triangle ABC',
        name: 'Triangle Order',
        meaning: 'Names the 3 corners in matching order so you know which sides pair up.',
        exampleTex: '\\triangle ABC \\cong \\triangle DEF \\implies AB = DE',
        exampleNote: 'Vertex letter order matters when writing proofs!',
      },
      {
        id: 'k-g2-sas',
        symbolTex: 'SSS, \\; SAS, \\; ASA',
        name: 'Congruence Shortcuts',
        meaning: 'Minimum 3 matching clues needed to guarantee two triangles are exact twins.',
        exampleTex: '\\text{Sides } 5, 7 \\text{ with } 60^\\circ \\text{ between} = \\text{SAS}',
        exampleNote: 'Beware SSA ("donkey trap")—it does not always lock one triangle!',
      },
      {
        id: 'k-g2-iso',
        symbolTex: 'AB = AC \\implies \\angle B \\cong \\angle C',
        name: 'Isosceles Base Rule',
        meaning: 'Equal sides sit directly across from equal angles.',
        exampleTex: '\\text{Top angle } 40^\\circ \\implies \\text{base angles } 70^\\circ, 70^\\circ',
        exampleNote: 'Symmetry splits the base cleanly down the middle.',
      },
    ],
    nextTip:
      'Once you prove triangles are exact clones (1× scale), Step 3 zooms shapes up and down—discovering how length factor k squares into area factor k²!',
    nextNodeId: 'g-similarity',
  },
  'g-similarity': {
    nodeId: 'g-similarity',
    courseId: 'geometry',
    stepNumber: 3,
    prerequisiteNodeId: 'g-triangles',
    prerequisiteTitle: 'Triangle Congruence',
    prerequisiteRoute: '/lesson/g-triangles',
    whyThisMatters:
      'Scale models, architectural blueprints, map zoom levels, and movie special effects all rely on similarity: keep angles identical while multiplying every length by k.',
    warmUpPrompt:
      'You scale a 3 cm × 4 cm sticker up by k = 3 to 9 cm × 12 cm. How many times bigger is the new AREA?',
    warmUpPromptTex: '\\dfrac{9 \\times 12}{3 \\times 4} = k^2',
    warmUpAnswer:
      '9 times bigger (3² = 9)! The small sticker covers 12 cm² while the zoomed sticker covers 108 cm².',
    warmUpAnswerTex: '\\dfrac{108}{12} = 9 = 3^2',
    keySymbols: [
      {
        id: 'k-g3-sim',
        symbolTex: '\\sim',
        name: 'Similar Shapes',
        meaning: 'Same angles and proportional sides (one is a clean zoom of the other).',
        exampleTex: '\\triangle ABC \\sim \\triangle DEF',
        exampleNote: 'Just 2 matching angles (AA) already prove triangles similar!',
      },
      {
        id: 'k-g3-k',
        symbolTex: 'k = \\tfrac{\\text{new}}{\\text{old}}',
        name: 'Linear Scale Factor',
        meaning: 'The zoom multiplier applied to every side length and perimeter.',
        exampleTex: '6\\text{ cm} \\to 15\\text{ cm} \\implies k = 2.5',
        exampleNote: 'k > 1 enlarges; 0 < k < 1 shrinks.',
      },
      {
        id: 'k-g3-k2',
        symbolTex: '\\text{Area Ratio} = k^2',
        name: 'Area Scale Factor',
        meaning: 'Because both width AND height multiply by k, total area scales by k × k = k².',
        exampleTex: 'k = 4 \\implies \\text{Area grows } 16\\times',
        exampleNote: 'One of the most tested ideas on Florida Geometry EOC!',
      },
    ],
    nextTip:
      'Ready to animate shapes yourself? Step 4 turns rigid shifts, mirrors, rotations, and dilations into crisp coordinate formulas!',
    nextNodeId: 'g-transformations',
  },
  'g-transformations': {
    nodeId: 'g-transformations',
    courseId: 'geometry',
    stepNumber: 4,
    prerequisiteNodeId: 'g-triangles',
    prerequisiteTitle: 'Triangle Congruence',
    prerequisiteRoute: '/lesson/g-triangles',
    whyThisMatters:
      'Every animation frame in a video game—sliding a character, spinning a spaceship, or zooming a camera—is just a transformation mapping (x, y) to a new position.',
    warmUpPrompt:
      'A point starts at (4, 1), slides 3 units RIGHT, and drops 2 units DOWN. Where does it land?',
    warmUpPromptTex: '(4 + 3,\\; 1 - 2)',
    warmUpAnswer:
      '(7, −1)! Right adds +3 to x (4 + 3 = 7) and down subtracts 2 from y (1 − 2 = −1).',
    warmUpAnswerTex: '(7, -1)',
    keySymbols: [
      {
        id: 'k-g4-map',
        symbolTex: '(x, y) \\mapsto (x+a, y+b)',
        name: 'Translation Arrow',
        meaning: 'Shows the exact coordinate recipe moving every corner identically.',
        exampleTex: '(2, 5) \\mapsto (2+4, 5-1) = (6, 4)',
        exampleNote: 'Read ↦ as "maps to".',
      },
      {
        id: 'k-g4-rot',
        symbolTex: 'R_{90^\\circ}(x, y) = (-y, x)',
        name: '90° Counterclockwise Turn',
        meaning: 'Swaps x and y and negates the new first coordinate to turn 90° around (0, 0).',
        exampleTex: '(3, 1) \\mapsto (-1, 3)',
        exampleNote: 'Rotations keep distances and angles 100% rigid.',
      },
      {
        id: 'k-g4-dil',
        symbolTex: 'D_k(x, y) = (kx, ky)',
        name: 'Origin Dilation',
        meaning: 'Multiplies both coordinates by scale factor k to stretch or shrink from (0, 0).',
        exampleTex: 'D_2(3, -1) = (6, -2)',
        exampleNote: 'Preserves shape and angles while scaling lengths by |k|.',
      },
    ],
    nextTip:
      'With symmetry and congruence mastered, Step 5 classifies the entire family tree of Polygons & Quadrilaterals using diagonals and angle sums!',
    nextNodeId: 'g-quadrilaterals',
  },
  'g-quadrilaterals': {
    nodeId: 'g-quadrilaterals',
    courseId: 'geometry',
    stepNumber: 5,
    prerequisiteNodeId: 'g-parallel-angles',
    prerequisiteTitle: 'Parallel Lines & Angles',
    prerequisiteRoute: '/lesson/g-parallel-angles',
    whyThisMatters:
      'Squares, rectangles, rhombuses, and trapezoids aren’t random memorized names—they form a logical upgrade ladder where adding one symmetry rule (like 90° corners or equal diagonals) unlocks the next shape!',
    warmUpPrompt:
      'Draw diagonals from one corner of a 5-sided pentagon to split it into triangles. How many triangles appear, and what is the interior angle sum?',
    warmUpPromptTex: '(5 - 2) \\times 180^\\circ',
    warmUpAnswer:
      '3 triangles totaling 540°! Every extra polygon side adds 1 more triangle (+180°).',
    warmUpAnswerTex: '3 \\times 180^\\circ = 540^\\circ',
    keySymbols: [
      {
        id: 'k-g5-sum',
        symbolTex: '(n - 2)\\cdot 180^\\circ',
        name: 'Polygon Angle Total',
        meaning: 'Total degrees inside any n-sided polygon.',
        exampleTex: 'n = 6 \\;(\\text{hexagon}) \\implies 4 \\cdot 180^\\circ = 720^\\circ',
        exampleNote: 'Divide by n if all angles are equal (regular polygon).',
      },
      {
        id: 'k-g5-perp',
        symbolTex: 'd_1 \\perp d_2',
        name: 'Perpendicular Diagonals',
        meaning: 'Two corner-to-corner diagonals cross at a crisp 90° angle (rhombus, square, kite).',
        exampleTex: '\\text{Rhombus diagonals } 6, 8 \\implies \\text{side } 5',
        exampleNote: 'Half-diagonals form 4 congruent right triangles!',
      },
      {
        id: 'k-g5-diag',
        symbolTex: 'd_1 = d_2',
        name: 'Equal Diagonals',
        meaning: 'Opposite corners are spaced identically—instant proof a parallelogram is a rectangle (or square)!',
        exampleTex: '3\\text{-}4\\text{-}5 \\text{ rectangle } \\implies d_1 = d_2 = 5',
        exampleNote: 'Both diagonals have the exact same length.',
      },
    ],
    nextTip:
      'Notice how splitting rectangles and rhombuses creates right triangles? Step 6 unlocks the famous Pythagorean Theorem and Right-Triangle Trigonometry!',
    nextNodeId: 'g-right-trig',
  },
  'g-right-trig': {
    nodeId: 'g-right-trig',
    courseId: 'geometry',
    stepNumber: 6,
    prerequisiteNodeId: 'g-similarity',
    prerequisiteTitle: 'Similarity & Scale Ratio',
    prerequisiteRoute: '/lesson/g-similarity',
    whyThisMatters:
      'Right-triangle trigonometry lets surveyors measure tall skyscrapers, drones triangulate distance, and physicists split any diagonal force into horizontal and vertical components.',
    warmUpPrompt:
      'A right triangle has legs of length 6 and 8. What is the length of its longest side (hypotenuse)?',
    warmUpPromptTex: '6^2 + 8^2 = c^2',
    warmUpAnswer:
      '10! 36 + 64 = 100, and √100 = 10 (twice the classic 3-4-5 right triangle).',
    warmUpAnswerTex: '\\sqrt{36 + 64} = \\sqrt{100} = 10',
    keySymbols: [
      {
        id: 'k-g6-pyth',
        symbolTex: 'a^2 + b^2 = c^2',
        name: 'Pythagorean Law',
        meaning: 'Squares built on the two legs add up exactly to the square on hypotenuse c.',
        exampleTex: '5^2 + 12^2 = 25 + 144 = 169 = 13^2',
        exampleNote: 'c must ALWAYS be the longest side opposite 90°.',
      },
      {
        id: 'k-g6-sin',
        symbolTex: '\\sin\\theta = \\tfrac{\\text{Opp}}{\\text{Hyp}}',
        name: 'Sine Ratio (SOH)',
        meaning: 'Ratio of the side ACROSS from angle θ to the hypotenuse.',
        exampleTex: '\\sin(30^\\circ) = \\tfrac{5}{10} = 0.5',
        exampleNote: 'Same for every 30-60-90 triangle regardless of size!',
      },
      {
        id: 'k-g6-cos',
        symbolTex: '\\cos\\theta = \\tfrac{\\text{Adj}}{\\text{Hyp}}',
        name: 'Cosine Ratio (CAH)',
        meaning: 'Ratio of the side TOUCHING angle θ (not the hypotenuse) to the hypotenuse.',
        exampleTex: '\\cos(60^\\circ) = 0.5',
        exampleNote: 'Notice sin(30°) = cos(60°) because 30° + 60° = 90°!',
      },
    ],
    nextTip:
      'Step 7 drops Pythagoras straight onto the x-y grid—proving exact lengths, midpoints, and right angles using only coordinates!',
    nextNodeId: 'g-coordinate',
  },
  'g-coordinate': {
    nodeId: 'g-coordinate',
    courseId: 'geometry',
    stepNumber: 7,
    prerequisiteNodeId: 'g-right-trig',
    prerequisiteTitle: 'Pythagoras & Right Trig',
    prerequisiteRoute: '/lesson/g-right-trig',
    whyThisMatters:
      'GPS navigation, CAD blueprints, and game collision engines don’t use rulers or protractors—they run coordinate geometry formulas on (x, y) points in microseconds!',
    warmUpPrompt:
      'Find the midpoint right halfway between (2, 4) and (8, 10).',
    warmUpPromptTex: 'M = \\left(\\dfrac{2+8}{2},\\; \\dfrac{4+10}{2}\\right)',
    warmUpAnswer:
      '(5, 7)! Average the two x’s to get 5 and average the two y’s to get 7.',
    warmUpAnswerTex: 'M = (5, 7)',
    keySymbols: [
      {
        id: 'k-g7-dist',
        symbolTex: 'd = \\sqrt{(x_2-x_1)^2 + (y_2-y_1)^2}',
        name: 'Distance Formula',
        meaning: 'Horizontal leg Δx and vertical leg Δy fed directly into Pythagoras.',
        exampleTex: '(1,2) \\to (4,6): \\sqrt{3^2+4^2} = 5',
        exampleNote: 'Never worry about negative differences—squaring makes them positive!',
      },
      {
        id: 'k-g7-mid',
        symbolTex: 'M = (\\bar{x}, \\bar{y})',
        name: 'Midpoint Average',
        meaning: 'Exact center point between two endpoints.',
        exampleTex: '(-2, 6) \\& (6, 2) \\implies (2, 4)',
        exampleNote: 'Add coordinates (don’t subtract!) when finding midpoints.',
      },
      {
        id: 'k-g7-perp',
        symbolTex: 'm_1 \\cdot m_2 = -1',
        name: 'Perpendicular Slope Test',
        meaning: 'Proves a 90° corner on the grid when two slopes are opposite reciprocals.',
        exampleTex: '\\tfrac{3}{4} \\cdot \\left(-\\tfrac{4}{3}\\right) = -1',
        exampleNote: 'Flip fraction + flip sign = guaranteed right angle.',
      },
    ],
    nextTip:
      'Moving from straight edges to smooth curves: Step 8 unlocks Circles, Arcs, Sector slices, and Inscribed Angle theorems!',
    nextNodeId: 'g-circles',
  },
  'g-circles': {
    nodeId: 'g-circles',
    courseId: 'geometry',
    stepNumber: 8,
    prerequisiteNodeId: 'g-triangles',
    prerequisiteTitle: 'Triangle Congruence',
    prerequisiteRoute: '/lesson/g-triangles',
    whyThisMatters:
      'Wheels, gears, radar sweeps, planetary orbits, and circular lenses all follow exact circle geometry—including the surprising secret that any angle perched on a circle’s edge sees HALF the central angle.',
    warmUpPrompt:
      'A round pizza has radius 10 cm (full area 100π cm²). If you take one-quarter (a 90° slice), what is your slice’s area in terms of π?',
    warmUpPromptTex: '\\dfrac{90^\\circ}{360^\\circ} \\cdot \\pi (10)^2',
    warmUpAnswer:
      '25π cm² (about 78.5 cm²)! 90° is 1/4 of a full 360° circle, so take 1/4 of 100π.',
    warmUpAnswerTex: '\\tfrac{1}{4}(100\\pi) = 25\\pi',
    keySymbols: [
      {
        id: 'k-g8-inscr',
        symbolTex: '\\theta_{\\text{inscr}} = \\tfrac{1}{2}\\theta_{\\text{cent}}',
        name: 'Inscribed Angle Rule',
        meaning: 'Vertex on the circle rim sees half the arc degree measure seen from the center.',
        exampleTex: '100^\\circ \\text{ arc} \\implies 50^\\circ \\text{ inscribed angle}',
        exampleNote: 'An angle facing a 180° diameter ALWAYS equals 90°!',
      },
      {
        id: 'k-g8-arc',
        symbolTex: 's = \\tfrac{\\theta}{360^\\circ}\\cdot 2\\pi r',
        name: 'Arc Length Fraction',
        meaning: 'Grabs the fraction (θ/360°) of the full outer circumference 2πr.',
        exampleTex: '180^\\circ \\text{ on } r=6 \\implies 6\\pi',
        exampleNote: 'Arc length is 1D crust; sector area is 2D pizza slice.',
      },
      {
        id: 'k-g8-tan',
        symbolTex: 'r \\perp \\text{tangent}',
        name: 'Tangent 90° Rule',
        meaning: 'A line skimming the circle at 1 point always makes a 90° corner with the radius.',
        exampleTex: 'r=5,\\; \\text{tan}=12 \\implies \\text{dist}=13',
        exampleNote: 'Creates an instant right triangle with the center!',
      },
    ],
    nextTip:
      'Final Geometry milestone (Step 9): lift flat 2D circles and polygons off the screen into articulated 3D Solids & Hinged Nets!',
    nextNodeId: 'g-solids',
  },
  'g-solids': {
    nodeId: 'g-solids',
    courseId: 'geometry',
    stepNumber: 9,
    prerequisiteNodeId: 'g-right-trig',
    prerequisiteTitle: 'Pythagoras & Right Trig',
    prerequisiteRoute: '/lesson/g-right-trig',
    whyThisMatters:
      'From 3D printing and packaging design to spacecraft fuel tanks and architectural domes, unfolding a 3D solid into a flat 2D net turns tricky surface areas into simple rectangles and triangles.',
    warmUpPrompt:
      'A square prism and a square pyramid share the exact same base area B = 18 and height h = 5. What are their two volumes?',
    warmUpPromptTex: 'V_{\\text{prism}} = 18 \\cdot 5, \\qquad V_{\\text{pyr}} = \\tfrac{1}{3}(18)(5)',
    warmUpAnswer:
      'Prism = 90 and Pyramid = 30! Three identical pyramids pour together to fill one matching prism.',
    warmUpAnswerTex: 'V_{\\text{prism}} = 90,\\quad V_{\\text{pyr}} = 30',
    keySymbols: [
      {
        id: 'k-g9-base',
        symbolTex: 'B',
        name: 'Capital B (Base Area)',
        meaning: 'The entire 2D area of the bottom face (not just one edge!).',
        exampleTex: '4\\times 4 \\text{ square base} \\implies B = 16',
        exampleNote: 'For a circular cylinder or cone, B = πr².',
      },
      {
        id: 'k-g9-slant',
        symbolTex: 'l',
        name: 'Slant Height',
        meaning: 'Tilted height climbing along the outside triangular face or cone side.',
        exampleTex: 'h=4,\\; \\text{half-base}=3 \\implies l=5',
        exampleNote: 'Use l for Surface Area; use straight-up h for Volume!',
      },
      {
        id: 'k-g9-vol',
        symbolTex: 'V = \\tfrac{1}{3}Bh',
        name: 'Pointy Solid Volume',
        meaning: 'Applies to every pyramid and cone tapering to one apex tip.',
        exampleTex: 'r=3,\\; h=4 \\implies V = \\tfrac{1}{3}\\pi(9)(4) = 12\\pi',
        exampleNote: 'Sphere volume steps up to (4/3)πr³.',
      },
    ],
    nextTip:
      'Geometry complete! Step into Algebra 2 Step 1 next, where even parabolas that never touch the x-axis reveal hidden rotations in the Complex Argand Plane!',
    nextNodeId: 'a2-complex',
  },

  // ================= ALGEBRA 2 (9 UNITS) =================
  'a2-complex': {
    nodeId: 'a2-complex',
    courseId: 'algebra-2',
    stepNumber: 1,
    prerequisiteNodeId: 'a1-quadratics',
    prerequisiteTitle: 'Quadratic Parabolas',
    prerequisiteRoute: '/lesson/quadratics',
    whyThisMatters:
      'In Algebra 1, Δ < 0 meant "no real solution." Algebra 2 opens a whole second dimension above the number line! Complex numbers power AC electricity, Wi-Fi signals, noise-canceling headphones, and quantum waves.',
    warmUpPrompt:
      'If multiplying by i rotates 90° counterclockwise (so i² = −1, a 180° turn), what number does i⁴ equal?',
    warmUpPromptTex: 'i^4 = i^2 \\cdot i^2 = (-1)(-1)',
    warmUpAnswer:
      '+1! Four 90° quarter-turns spin a full 360° right back to +1.',
    warmUpAnswerTex: 'i^4 = +1',
    keySymbols: [
      {
        id: 'k-a2c-i',
        symbolTex: 'i = \\sqrt{-1}',
        name: 'Imaginary Unit (90° Turn)',
        meaning: 'Number whose square is −1, stepping vertically off the real axis.',
        exampleTex: '\\sqrt{-25} = 5i',
        exampleNote: 'Pull out √(−1) = i first, then take the regular square root.',
      },
      {
        id: 'k-a2c-z',
        symbolTex: 'z = a + bi',
        name: 'Complex Coordinate',
        meaning: 'Pairs real horizontal coordinate `a` with vertical imaginary coordinate `b`.',
        exampleTex: '3 + 4i \\text{ sits } 5 \\text{ units from } (0,0)',
        exampleNote: 'Distance from origin still uses Pythagoras: √(3² + 4²) = 5!',
      },
      {
        id: 'k-a2c-conj',
        symbolTex: 'a - bi',
        name: 'Complex Conjugate',
        meaning: 'Flips the middle sign of a + bi so imaginary cross-terms cancel cleanly.',
        exampleTex: '(2+3i)(2-3i) = 4 - 9i^2 = 13',
        exampleNote: 'Complex roots of real polynomials always come in conjugate pairs.',
      },
    ],
    nextTip:
      'With imaginary geometry unlocked, Step 2 collides straight lines, parabolas, and circles to map every nonlinear crossing point!',
    nextNodeId: 'a2-quad-systems',
  },
  'a2-quad-systems': {
    nodeId: 'a2-quad-systems',
    courseId: 'algebra-2',
    stepNumber: 2,
    prerequisiteNodeId: 'a1-quadratics',
    prerequisiteTitle: 'Quadratic Parabolas',
    prerequisiteRoute: '/lesson/quadratics',
    whyThisMatters:
      'Orbits crossing laser beams, drones dodging curved hills, and supply-demand curves meeting quadratic costs all require solving linear and curved equations together.',
    warmUpPrompt:
      'Where does the parabola y = x² cross the horizontal line y = 9?',
    warmUpPromptTex: 'x^2 = 9',
    warmUpAnswer:
      'Two crossing points: (3, 9) and (−3, 9)!',
    warmUpAnswerTex: 'x = \\pm 3 \\implies (-3, 9) \\text{ and } (3, 9)',
    keySymbols: [
      {
        id: 'k-a2qs-cap',
        symbolTex: 'L \\cap P',
        name: 'Curve Intersection',
        meaning: 'Points lying simultaneously on both the line and the parabola/circle.',
        exampleTex: 'y = x^2 \\;\\land\\; y = x + 2 \\implies (-1,1),(2,4)',
        exampleNote: 'A line and parabola can hit 0, 1 (tangent), or 2 times.',
      },
      {
        id: 'k-a2qs-tan',
        symbolTex: '\\Delta = 0',
        name: 'Exact Tangency',
        meaning: 'When combining both equations leaves Δ = 0, the line just grazes the curve once.',
        exampleTex: 'x^2 = 4x - 4 \\implies (x-2)^2 = 0',
        exampleNote: 'One clean repeated intersection at (2, 4).',
      },
      {
        id: 'k-a2qs-ineq',
        symbolTex: 'y \\ge ax^2 + c',
        name: 'Quadratic Feasible Zone',
        meaning: 'Shades inside or outside a curved parabola boundary.',
        exampleTex: 'y \\ge x^2 \\text{ shades inside the bowl}',
        exampleNote: 'Test (0, 2): 2 ≥ 0² is true, so the inside gets shaded.',
      },
    ],
    nextTip:
      'Next in Step 3: build function pipelines (f ∘ g) and flip functions backward across y = x using Inverses & Radical equations!',
    nextNodeId: 'a2-radicals',
  },
  'a2-radicals': {
    nodeId: 'a2-radicals',
    courseId: 'algebra-2',
    stepNumber: 3,
    prerequisiteNodeId: 'a1-radicals-exp',
    prerequisiteTitle: 'Exponents & Radicals',
    prerequisiteRoute: '/lesson/a1-radicals-exp',
    whyThisMatters:
      'Every encryption decoder, unit converter, and undo button in software works on inverse functions f⁻¹(x). Plus, squaring both sides of a radical teaches you to watch for "ghost" extraneous solutions!',
    warmUpPrompt:
      'Function f(x) = 3x + 2 sends 4 to 14. What does the undo function f⁻¹ send 14 back to?',
    warmUpPromptTex: 'f(4) = 14 \\implies f^{-1}(14) = ?',
    warmUpAnswer:
      '4! Subtract 2 (getting 12), then divide by 3 to land right back at 4.',
    warmUpAnswerTex: '\\dfrac{14 - 2}{3} = 4',
    keySymbols: [
      {
        id: 'k-a2rad-inv',
        symbolTex: 'f^{-1}(x)',
        name: 'Inverse Function ("Undo")',
        meaning: 'Reverses every step of f(x) in backward order, swapping x and y.',
        exampleTex: 'f(x)=x^2 \\;(x\\ge 0) \\implies f^{-1}(x)=\\sqrt{x}',
        exampleNote: 'Note: f⁻¹ does NOT mean 1 / f(x)!',
      },
      {
        id: 'k-a2rad-comp',
        symbolTex: '(f \\circ g)(x) = f(g(x))',
        name: 'Function Composition',
        meaning: 'Feeds the output of g(x) straight into the input of f.',
        exampleTex: 'f(g(2)) \\text{ runs } g(2) \\text{ first, then } f',
        exampleNote: 'Always evaluate from the INSIDE parentheses outward.',
      },
      {
        id: 'k-a2rad-ext',
        symbolTex: '\\sqrt{A} = B \\;(\\text{check } B \\ge 0)',
        name: 'Extraneous Guard',
        meaning: 'Squaring can sneak in fake roots—always plug answers back into the original equation!',
        exampleTex: '\\sqrt{x} = -3 \\text{ has NO real solution}',
        exampleNote: 'Principal √ never outputs a negative real number.',
      },
    ],
    nextTip:
      'You just saw how √x reverses x². In Step 4, what reverses bˣ? Meet the ultimate exponent-detector: Logarithms!',
    nextNodeId: 'a2-logarithms',
  },
  'a2-logarithms': {
    nodeId: 'a2-logarithms',
    courseId: 'algebra-2',
    stepNumber: 4,
    prerequisiteNodeId: 'a1-exponential',
    prerequisiteTitle: 'Exponential Growth',
    prerequisiteRoute: '/lesson/a1-exponential',
    whyThisMatters:
      'Earthquake Richter scales, sound decibels, chemistry pH, and time-to-double financial formulas all rely on logarithms to solve when the unknown variable sits trapped up in the exponent!',
    warmUpPrompt:
      'What power must you raise 2 to in order to produce 32?',
    warmUpPromptTex: '2^{?} = 32 \\quad\\iff\\quad \\log_2(32) = ?',
    warmUpAnswer:
      '5! Because 2⁵ = 32, log₂(32) equals 5—a logarithm simply reports the missing exponent.',
    warmUpAnswerTex: '\\log_2(32) = 5',
    keySymbols: [
      {
        id: 'k-a2log-log',
        symbolTex: '\\log_b(x)',
        name: 'Logarithm Base b',
        meaning: 'Outputs the exact exponent that turns base b into x.',
        exampleTex: '\\log_{10}(1000) = 3 \\;(\\text{since } 10^3 = 1000)',
        exampleNote: 'When no base is printed on log(x), it defaults to base 10.',
      },
      {
        id: 'k-a2log-ln',
        symbolTex: '\\ln(x) = \\log_e(x)',
        name: 'Natural Logarithm',
        meaning: 'Logarithm built on Euler’s growth constant e ≈ 2.71828.',
        exampleTex: '\\ln(e^4) = 4',
        exampleNote: 'ln and eˣ cancel each other cleanly!',
      },
      {
        id: 'k-a2log-dom',
        symbolTex: 'x > 0',
        name: 'Positive Domain Rule',
        meaning: 'You can only take the logarithm of strictly positive numbers.',
        exampleTex: '\\log_2(0) \\text{ is undefined (asymptote } x=0\\text{)}',
        exampleNote: 'Always discard solutions that make the inside ≤ 0.',
      },
    ],
    nextTip:
      'Now that you control exponentials and logs, Step 5 unlocks higher-degree polynomials—rollercoaster curves with bounces, inflections, and hidden complex roots!',
    nextNodeId: 'a2-polynomials',
  },
  'a2-polynomials': {
    nodeId: 'a2-polynomials',
    courseId: 'algebra-2',
    stepNumber: 5,
    prerequisiteNodeId: 'a2-complex',
    prerequisiteTitle: 'Complex Argand Plane',
    prerequisiteRoute: '/lesson/a2-complex',
    whyThisMatters:
      'Polynomial splines draw the smooth curved bodywork of cars, Apple icons, and rollercoasters—where every factor (x − r)ᵐ shapes whether the track crosses straight through or kisses the ground.',
    warmUpPrompt:
      'Plug x = 3 and x = 5 into P(x) = (x − 1)(x − 4)². Does the sign switch from positive to negative around x = 4?',
    warmUpPromptTex: 'P(3) = (2)(-1)^2, \\qquad P(5) = (4)(1)^2',
    warmUpAnswer:
      'No—both P(3) = +2 and P(5) = +4 stay positive! Because (x − 4)² has an even power, the graph bounces off x = 4 without crossing.',
    warmUpAnswerTex: 'P(3)=+2, \\quad P(5)=+4',
    keySymbols: [
      {
        id: 'k-a2p-mult',
        symbolTex: '(x - r)^m',
        name: 'Root Multiplicity m',
        meaning: 'Exponent m decides behavior at root r: m = 1 crosses straight, m = 2 bounces, m = 3 flattens through.',
        exampleTex: 'x^2(x-3) \\text{ bounces at } 0, \\text{ crosses at } 3',
        exampleNote: 'Odd m crosses; even m stays on the same side.',
      },
      {
        id: 'k-a2p-deg',
        symbolTex: 'n = \\text{deg}(P)',
        name: 'Polynomial Degree',
        meaning: 'Highest exponent of x; guarantees exactly n total roots (real + complex) and at most n − 1 turns.',
        exampleTex: 'P(x) = 2x^5 - x^2 + 7 \\implies n = 5',
        exampleNote: 'Look at the leading term 2x⁵ for far-left and far-right arrows.',
      },
      {
        id: 'k-a2p-rem',
        symbolTex: 'P(c) = 0 \\iff (x - c) \\mid P(x)',
        name: 'Factor Theorem',
        meaning: 'Plugging in c gives 0 if and only if (x − c) divides cleanly with zero remainder.',
        exampleTex: 'P(2)=0 \\implies (x-2) \\text{ is a factor}',
        exampleNote: 'Instant bridge between graph zeros and algebraic factors.',
      },
    ],
    nextTip:
      'Next in Step 6: stack simultaneous algebraic equations into rectangular Matrix grids—literally the exact engine running inside modern AI neural networks!',
    nextNodeId: 'a2-matrices',
  },
  'a2-matrices': {
    nodeId: 'a2-matrices',
    courseId: 'algebra-2',
    stepNumber: 6,
    prerequisiteNodeId: 'a1-systems',
    prerequisiteTitle: 'Systems & Intersections',
    prerequisiteRoute: '/lesson/a1-systems',
    whyThisMatters:
      'Every frame of 3D video games, photo filters, and Large Language Models multiplies huge matrices of weights W times input signals x plus a bias b millions of times per second.',
    warmUpPrompt:
      'Compute a single neuron’s weighted sum: (2 × 3) + (4 × 5) + 1.',
    warmUpPromptTex: 'z = (2 \\cdot 3) + (4 \\cdot 5) + 1',
    warmUpAnswer:
      '27! Multiplying weights by inputs and adding a bias (6 + 20 + 1 = 27) is the fundamental matrix dot product.',
    warmUpAnswerTex: 'z = 6 + 20 + 1 = 27',
    keySymbols: [
      {
        id: 'k-a2m-w',
        symbolTex: '\\mathbf{W}',
        name: 'Weight Matrix',
        meaning: 'A tidy grid of scaling numbers transforming input vectors all at once.',
        exampleTex: '\\begin{bmatrix}2 & 0\\\\0 & 3\\end{bmatrix}\\begin{bmatrix}4\\\\5\\end{bmatrix}=\\begin{bmatrix}8\\\\15\\end{bmatrix}',
        exampleNote: 'Rows of the left matrix dot columns of the right.',
      },
      {
        id: 'k-a2m-b',
        symbolTex: '\\mathbf{b}',
        name: 'Bias Offset Vector',
        meaning: 'Shifts the transformed output threshold up or down, just like b in y = mx + b.',
        exampleTex: 'z = \\mathbf{W}\\mathbf{x} + \\mathbf{b}',
        exampleNote: 'Without bias, every line would stay stuck passing through (0, 0).',
      },
      {
        id: 'k-a2m-sig',
        symbolTex: '\\sigma(z)',
        name: 'Nonlinear Activation',
        meaning: 'Bends straight matrix outputs so stacked layers can learn curves and patterns.',
        exampleTex: '\\text{ReLU}(-3) = 0, \\quad \\text{ReLU}(5) = 5',
        exampleNote: 'Without σ, 100 matrix layers would collapse into 1 linear step.',
      },
    ],
    nextTip:
      'Step 7 climbs Pascal’s Triangle to count winning combinations and expand massive powers like (a + b)⁸ effortlessly!',
    nextNodeId: 'a2-combinatorics',
  },
  'a2-combinatorics': {
    nodeId: 'a2-combinatorics',
    courseId: 'algebra-2',
    stepNumber: 7,
    prerequisiteNodeId: 'a1-expressions',
    prerequisiteTitle: 'Algebraic Structure',
    prerequisiteRoute: '/lesson/a1-expressions',
    whyThisMatters:
      'Combinatorics counts password strength, genetic variations, lottery odds, and every coefficient in (a + b)ⁿ without forcing you to multiply parentheses out ten times by hand.',
    warmUpPrompt:
      'How many 2-topping pizzas can you order from 4 toppings (Pepperoni, Mushroom, Onion, Olive) when topping order doesn’t matter?',
    warmUpPromptTex: '\\binom{4}{2} = \\dfrac{4 \\times 3}{2 \\times 1}',
    warmUpAnswer:
      '6 pizzas! Since Pepperoni + Mushroom equals Mushroom + Pepperoni, divide 12 ordered pairs by 2.',
    warmUpAnswerTex: '\\binom{4}{2} = 6',
    keySymbols: [
      {
        id: 'k-a2cb-fact',
        symbolTex: 'n!',
        name: 'n Factorial',
        meaning: 'Multiply every whole number from n all the way down to 1.',
        exampleTex: '5! = 5 \\cdot 4 \\cdot 3 \\cdot 2 \\cdot 1 = 120',
        exampleNote: 'By definition, 0! = 1.',
      },
      {
        id: 'k-a2cb-comb',
        symbolTex: '\\binom{n}{k} \\text{ or } {}_nC_k',
        name: 'Combinations (Order Ignored)',
        meaning: 'Ways to pick a team or committee of k items out of n.',
        exampleTex: '\\binom{5}{2} = \\tfrac{5!}{2!3!} = 10',
        exampleNote: 'Reads right off Pascal’s Triangle!',
      },
      {
        id: 'k-a2cb-perm',
        symbolTex: '{}_nP_k',
        name: 'Permutations (Order Matters)',
        meaning: 'Ways to arrange k winners in ranked order (1st, 2nd, 3rd).',
        exampleTex: '{}_5P_2 = 5 \\cdot 4 = 20',
        exampleNote: 'Permutations are always larger than or equal to combinations.',
      },
    ],
    nextTip:
      'Next in Step 8: divide one polynomial by another—discovering where curves leap over vertical asymptotes and hide single-pixel holes!',
    nextNodeId: 'a2-rational',
  },
  'a2-rational': {
    nodeId: 'a2-rational',
    courseId: 'algebra-2',
    stepNumber: 8,
    prerequisiteNodeId: 'a2-polynomials',
    prerequisiteTitle: 'Higher-Degree Polynomials',
    prerequisiteRoute: '/lesson/a2-polynomials',
    whyThisMatters:
      'Physics inverse-square laws (gravity 1/r²), lens focal formulas, and average-cost efficiency curves are all rational fractions where approaching zero in the denominator sends values skyrocketing.',
    warmUpPrompt:
      'Evaluate 10 / x as x gets closer to zero: x = 1, x = 0.1, x = 0.01. What happens?',
    warmUpPromptTex: '\\dfrac{10}{1} \\to \\dfrac{10}{0.1} \\to \\dfrac{10}{0.01}',
    warmUpAnswer:
      '10 → 100 → 1,000! Dividing by tinier numbers rockets toward infinity, building a vertical asymptote at x = 0.',
    warmUpAnswerTex: '10 \\to 100 \\to 1000 \\to \\infty',
    keySymbols: [
      {
        id: 'k-a2rat-pole',
        symbolTex: 'x = p \\;(\\text{VA})',
        name: 'Vertical Asymptote',
        meaning: 'An uncrossable vertical wall where the bottom equals 0 (and top is nonzero).',
        exampleTex: 'f(x) = \\tfrac{3}{x-4} \\implies \\text{VA at } x = 4',
        exampleNote: 'Graph flies toward +∞ or −∞ near x = 4.',
      },
      {
        id: 'k-a2rat-hole',
        symbolTex: '\\tfrac{0}{0} \\text{ cancels}',
        name: 'Removable Hole',
        meaning: 'A shared factor top and bottom wipes out everywhere except one tiny missing dot.',
        exampleTex: '\\tfrac{(x-2)(x+1)}{x-2} = x+1 \\;(x \\ne 2)',
        exampleNote: 'Plot the simplified line with an open circle at (2, 3).',
      },
      {
        id: 'k-a2rat-inf',
        symbolTex: 'x \\to \\pm\\infty',
        name: 'End-Behavior Arrow',
        meaning: 'Asks what horizontal level y settles toward far out to the left or right.',
        exampleTex: '\\tfrac{4x^2 + 1}{2x^2 - 5} \\to \\tfrac{4}{2} = 2',
        exampleNote: 'Equal top/bottom degrees settle at the ratio of leading coefficients.',
      },
    ],
    nextTip:
      'Algebra 2’s finale (Step 9) blends counting with smooth bell curves—using z-scores to predict probabilities across massive populations!',
    nextNodeId: 'a2-probability',
  },
  'a2-probability': {
    nodeId: 'a2-probability',
    courseId: 'algebra-2',
    stepNumber: 9,
    prerequisiteNodeId: 'a1-statistics',
    prerequisiteTitle: 'Regression & Residuals',
    prerequisiteRoute: '/lesson/a1-statistics',
    whyThisMatters:
      'Heights, SAT scores, manufacturing tolerances, and noisy radar measurements naturally pile up into a smooth Gaussian bell curve. One z-score tells you instantly how rare any result really is.',
    warmUpPrompt:
      'Test scores follow a normal bell curve with mean μ = 75 and standard deviation σ = 5. What score sits 2 standard deviations above average?',
    warmUpPromptTex: 'x = 75 + 2(5)',
    warmUpAnswer:
      '85! Two σ jumps above 75 lands at 85—outscoring roughly 97.5% of the curve.',
    warmUpAnswerTex: '75 + 10 = 85',
    keySymbols: [
      {
        id: 'k-a2pr-mu',
        symbolTex: '\\mu',
        name: 'Population Mean (Center)',
        meaning: 'Greek letter "mu"—the exact balance peak of the normal bell curve.',
        exampleTex: '\\mu = 75\\text{ pts}',
        exampleNote: 'Half of all normal values sit below μ and half above.',
      },
      {
        id: 'k-a2pr-sig',
        symbolTex: '\\sigma',
        name: 'Standard Deviation (Spread)',
        meaning: 'Greek letter "sigma"—measures typical step size away from the center.',
        exampleTex: '\\mu \\pm 1\\sigma \\text{ holds } \\approx 68\\%',
        exampleNote: 'Small σ = tall skinny bell; big σ = wide flat bell.',
      },
      {
        id: 'k-a2pr-z',
        symbolTex: 'z = \\dfrac{x - \\mu}{\\sigma}',
        name: 'Z-Score Ruler',
        meaning: 'Converts any unit (inches, points, seconds) into universal σ-steps from average.',
        exampleTex: 'x=65,\\; \\mu=75,\\; \\sigma=5 \\implies z = -2',
        exampleNote: 'Negative z simply means below average.',
      },
    ],
    nextTip:
      'Algebra 2 mastered! Ready for Precalculus Honors Step 1? Step onto the Unit Circle and watch circular spins generate smooth sine and cosine waves!',
    nextNodeId: 'pc-unit-circle',
  },

  // ================= PRECALCULUS HONORS (9 UNITS) =================
  'pc-unit-circle': {
    nodeId: 'pc-unit-circle',
    courseId: 'precalculus',
    stepNumber: 1,
    prerequisiteNodeId: 'g-circles',
    prerequisiteTitle: 'Circles, Arcs & Sectors',
    prerequisiteRoute: '/lesson/g-circles',
    whyThisMatters:
      'Every Wi-Fi radio wave, musical chord, alternating electric current, and swaying skyscraper follows sine and cosine waves born from spinning around a radius-1 circle!',
    warmUpPrompt:
      'Start at (1, 0) on a radius-1 circle and rotate 90° counterclockwise to the top. What are your exact (x, y) coordinates?',
    warmUpPromptTex: 'P(90^\\circ) = (\\cos 90^\\circ, \\; \\sin 90^\\circ)',
    warmUpAnswer:
      '(0, 1)! That instantly reads off cos(90°) = 0 and sin(90°) = 1—no triangle memorization needed.',
    warmUpAnswerTex: '(\\cos 90^\\circ, \\sin 90^\\circ) = (0, 1)',
    keySymbols: [
      {
        id: 'k-pc1-th',
        symbolTex: '\\theta \\;(\\text{rad})',
        name: 'Radian Angle',
        meaning: 'Measures turn size by arc length on a unit circle (180° = π radians).',
        exampleTex: '90^\\circ = \\tfrac{\\pi}{2}, \\quad 45^\\circ = \\tfrac{\\pi}{4}',
        exampleNote: 'Positive θ spins counterclockwise; negative θ spins clockwise.',
      },
      {
        id: 'k-pc1-cos',
        symbolTex: '\\cos\\theta',
        name: 'Cosine (x-Projection)',
        meaning: 'Horizontal x-coordinate of your point on the unit circle.',
        exampleTex: '\\cos(0) = 1, \\quad \\cos(\\pi) = -1',
        exampleNote: 'Lives strictly between −1 and +1.',
      },
      {
        id: 'k-pc1-sin',
        symbolTex: '\\sin\\theta',
        name: 'Sine (y-Projection)',
        meaning: 'Vertical height y on the unit circle—waves up and down smoothly as θ spins.',
        exampleTex: '\\sin\\left(\\tfrac{\\pi}{6}\\right) = \\tfrac{1}{2}',
        exampleNote: 'Think "Sine = Sky height (y)".',
      },
    ],
    nextTip:
      'In Step 2, you’ll turn circular geometry into algebraic superpowers—combining waves and simplifying double-angle signals with Trig Identities!',
    nextNodeId: 'pc-trig-identities',
  },
  'pc-trig-identities': {
    nodeId: 'pc-trig-identities',
    courseId: 'precalculus',
    stepNumber: 2,
    prerequisiteNodeId: 'pc-unit-circle',
    prerequisiteTitle: 'Unit Circle & Waves',
    prerequisiteRoute: '/lesson/unit-circle',
    whyThisMatters:
      'Audio engineers, signal-processing coders, and quantum physicists use trig identities to compress overlapping sound waves, separate frequencies, and simplify monstrous calculus integrals.',
    warmUpPrompt:
      'If sin(θ) = 3/5 in Quadrant I, use sin²θ + cos²θ = 1 to compute cos(θ).',
    warmUpPromptTex: '\\left(\\tfrac{3}{5}\\right)^2 + \\cos^2\\theta = 1',
    warmUpAnswer:
      '4/5! 9/25 + cos²θ = 25/25 gives cos²θ = 16/25, so cos(θ) = +4/5 in Quadrant I.',
    warmUpAnswerTex: '\\cos\\theta = \\sqrt{1 - \\tfrac{9}{25}} = \\tfrac{4}{5}',
    keySymbols: [
      {
        id: 'k-pc2-id',
        symbolTex: '\\sin^2\\theta + \\cos^2\\theta = 1',
        name: 'Pythagorean Identity',
        meaning: 'Circular energy conservation: horizontal² + vertical² always locks to radius² = 1.',
        exampleTex: '0.6^2 + 0.8^2 = 0.36 + 0.64 = 1',
        exampleNote: 'Valid for every real or complex angle θ.',
      },
      {
        id: 'k-pc2-dbl',
        symbolTex: '\\sin(2\\theta) = 2\\sin\\theta\\cos\\theta',
        name: 'Double-Angle Identity',
        meaning: 'Doubles a wave’s oscillation frequency using only single-angle values.',
        exampleTex: '\\sin(2\\cdot 45^\\circ) = 2(\\tfrac{\\sqrt{2}}{2})(\\tfrac{\\sqrt{2}}{2}) = 1',
        exampleNote: 'Matches sin(90°) = 1 cleanly!',
      },
      {
        id: 'k-pc2-sum',
        symbolTex: '\\cos(\\alpha - \\beta)',
        name: 'Phase-Shift Difference',
        meaning: 'Predicts wave interference when two shifted signals add together.',
        exampleTex: '\\cos\\alpha\\cos\\beta + \\sin\\alpha\\sin\\beta',
        exampleNote: 'Notice cos flips the sign between α and β!',
      },
    ],
    nextTip:
      'Ready to steer ships, forces, and 2D coordinate warps? Step 3 unites trig directions with Algebra 2 matrices into Euclidean Vectors!',
    nextNodeId: 'pc-vectors',
  },
  'pc-vectors': {
    nodeId: 'pc-vectors',
    courseId: 'precalculus',
    stepNumber: 3,
    prerequisiteNodeId: 'a2-matrices',
    prerequisiteTitle: 'Matrices & Neural Nets',
    prerequisiteRoute: '/neural',
    whyThisMatters:
      'Every force arrow in physics (gravity, wind, rocket thrust) and every camera perspective transformation in 3D graphics engines is built from vectors and 2×2 matrices.',
    warmUpPrompt:
      'A drone flies 3 km East and 4 km North, described by vector v = ⟨3, 4⟩. What is its total straight-line distance?',
    warmUpPromptTex: '\\|\\vec{v}\\| = \\sqrt{3^2 + 4^2}',
    warmUpAnswer:
      '5 km! Component form splits motion into x and y so Pythagoras gives total magnitude immediately.',
    warmUpAnswerTex: '\\|\\langle 3, 4 \\rangle\\| = 5\\text{ km}',
    keySymbols: [
      {
        id: 'k-pc3-vec',
        symbolTex: '\\vec{v} = \\langle a, b \\rangle',
        name: 'Component Vector',
        meaning: 'An arrow specifying horizontal step `a` and vertical step `b` (not fixed to one spot).',
        exampleTex: '\\langle 2, 1\\rangle + \\langle 3, 4\\rangle = \\langle 5, 5\\rangle',
        exampleNote: 'Tip-to-tail arrow addition simply adds matching components.',
      },
      {
        id: 'k-pc3-dot',
        symbolTex: '\\vec{u} \\cdot \\vec{v} = u_1 v_1 + u_2 v_2',
        name: 'Dot Product',
        meaning: 'Measures how aligned two arrows point—equals 0 whenever they meet at 90°!',
        exampleTex: '\\langle 2, 6\\rangle \\cdot \\langle -3, 1\\rangle = -6 + 6 = 0',
        exampleNote: 'Quickest perpendicularity test in higher dimensions.',
      },
      {
        id: 'k-pc3-det',
        symbolTex: '\\det(M) = ad - bc',
        name: 'Matrix Area Scale',
        meaning: 'Shows how much a 2×2 matrix stretches area (and flips orientation if negative).',
        exampleTex: '\\det\\begin{bmatrix}3 & 0\\\\0 & 2\\end{bmatrix} = 6',
        exampleNote: 'Scales every 2D region’s area by 6×.',
      },
    ],
    nextTip:
      'Next in Step 4, take trigonometry off the 90° crutch—solving ANY slanted oblique triangle with the Laws of Sines & Cosines!',
    nextNodeId: 'pc-law-sines',
  },
  'pc-law-sines': {
    nodeId: 'pc-law-sines',
    courseId: 'precalculus',
    stepNumber: 4,
    prerequisiteNodeId: 'g-right-trig',
    prerequisiteTitle: 'Pythagoras & Right Trig',
    prerequisiteRoute: '/lesson/g-right-trig',
    whyThisMatters:
      'Real mountain peaks, radar triangles, and robotic arms almost never form tidy 90° angles. The Laws of Sines and Cosines solve any triangle shape on Earth or in orbit.',
    warmUpPrompt:
      'Look at the Law of Cosines: c² = a² + b² − 2ab cos(C). What happens to that last term when angle C = 90°?',
    warmUpPromptTex: 'c^2 = a^2 + b^2 - 2ab\\cos(90^\\circ)',
    warmUpAnswer:
      'It vanishes (`cos 90° = 0`), collapsing smoothly right back into Pythagoras: c² = a² + b²!',
    warmUpAnswerTex: 'c^2 = a^2 + b^2 - 0 = a^2 + b^2',
    keySymbols: [
      {
        id: 'k-pc4-sin',
        symbolTex: '\\dfrac{a}{\\sin A} = \\dfrac{b}{\\sin B} = 2R',
        name: 'Law of Sines',
        meaning: 'In every triangle, each side divided by its opposite sine equals the circumcircle’s diameter 2R!',
        exampleTex: 'A=30^\\circ,\\; a=7 \\implies 2R = \\tfrac{7}{0.5} = 14',
        exampleNote: 'Use whenever you know an angle and the side directly across from it.',
      },
      {
        id: 'k-pc4-cos',
        symbolTex: 'c^2 = a^2 + b^2 - 2ab\\cos C',
        name: 'Law of Cosines',
        meaning: 'Upgraded Pythagoras that works for acute or obtuse angles C.',
        exampleTex: 'a=5,\\; b=8,\\; C=60^\\circ \\implies c^2 = 89 - 40 = 49',
        exampleNote: 'Take √49 = 7 cleanly!',
      },
      {
        id: 'k-pc4-area',
        symbolTex: '\\text{Area} = \\tfrac{1}{2}ab\\sin C',
        name: 'SAS Triangle Area',
        meaning: 'Finds area from any two sides and the angle squeezed between them.',
        exampleTex: 'a=6,\\; b=10,\\; C=30^\\circ \\implies 15',
        exampleNote: 'When C = 90°, sin 90° = 1 gives classic ½bh.',
      },
    ],
    nextTip:
      'Step 5 turns static graphs into live motion—adding a clock parameter `t` so curves trace trajectories, orbits, and glowing Lissajous loops!',
    nextNodeId: 'pc-parametric',
  },
  'pc-parametric': {
    nodeId: 'pc-parametric',
    courseId: 'precalculus',
    stepNumber: 5,
    prerequisiteNodeId: 'pc-vectors',
    prerequisiteTitle: 'Vectors & 2×2 Matrices',
    prerequisiteRoute: '/lesson/pc-vectors',
    whyThisMatters:
      'Ordinary y = f(x) graphs can’t draw loops or tell you WHEN an object passes a point. Parametric equations (x(t), y(t)) track exact location AND velocity at every tick of clock `t`.',
    warmUpPrompt:
      'A glider moves along x(t) = 2t and y(t) = t². What coordinates (x, y) does it hit at t = 3 seconds?',
    warmUpPromptTex: '(x(3),\\; y(3)) = (2\\cdot 3,\\; 3^2)',
    warmUpAnswer:
      '(6, 9)! Plug t = 3 into both x(t) and y(t) clocks independently.',
    warmUpAnswerTex: '(6, 9)',
    keySymbols: [
      {
        id: 'k-pc5-t',
        symbolTex: 't',
        name: 'Time / Clock Parameter',
        meaning: 'Hidden third variable driving both x and y along a curve in a set direction.',
        exampleTex: 't: 0 \\to 2\\pi \\text{ draws one full loop}',
        exampleNote: 'Direction arrows show which way t increases.',
      },
      {
        id: 'k-pc5-pos',
        symbolTex: '(x(t),\\; y(t))',
        name: 'Parametric Position',
        meaning: 'Separate formulas for horizontal motion x(t) and vertical motion y(t).',
        exampleTex: '(\\cos t, \\sin t) \\text{ traces the unit circle}',
        exampleNote: 'Eliminate t (like t = x/2) to recover the static path equation.',
      },
      {
        id: 'k-pc5-vel',
        symbolTex: '\\vec{v}(t)',
        name: 'Velocity Tangent Vector',
        meaning: 'Arrow showing instantaneous speed and heading tangent to the curve at time t.',
        exampleTex: 'x=4t,\\; y=3t \\implies \\text{speed } \\sqrt{4^2+3^2}=5',
        exampleNote: 'Combine horizontal and vertical rates with Pythagoras.',
      },
    ],
    nextTip:
      'In Step 6, ditch the rectangular grid altogether—aim an angle θ and step outward distance r to draw Polar Roses & Spirals!',
    nextNodeId: 'pc-polar',
  },
  'pc-polar': {
    nodeId: 'pc-polar',
    courseId: 'precalculus',
    stepNumber: 6,
    prerequisiteNodeId: 'pc-unit-circle',
    prerequisiteTitle: 'Unit Circle & Waves',
    prerequisiteRoute: '/lesson/unit-circle',
    whyThisMatters:
      'Air traffic radar, directional microphones, hurricane tracking, and spiral galaxy arms naturally revolve around a central pole—making polar coordinates r(θ) far simpler than awkward x-y equations.',
    warmUpPrompt:
      'Air traffic radar spots a plane at distance r = 10 km and angle θ = 0° (due East). What are its standard (x, y) grid coordinates?',
    warmUpPromptTex: 'x = 10\\cos(0^\\circ), \\quad y = 10\\sin(0^\\circ)',
    warmUpAnswer:
      '(10, 0)! Because cos(0°) = 1 and sin(0°) = 0, the plane sits 10 km right on the x-axis.',
    warmUpAnswerTex: '(10, 0)',
    keySymbols: [
      {
        id: 'k-pc6-r',
        symbolTex: 'r',
        name: 'Radial Distance',
        meaning: 'How far out from the origin pole to plot the point along angle θ.',
        exampleTex: 'r = 5 \\text{ draws a circle of radius } 5',
        exampleNote: 'Negative r steps straight backward through the pole (+180°)!',
      },
      {
        id: 'k-pc6-th',
        symbolTex: '\\theta',
        name: 'Polar Aim Angle',
        meaning: 'Counterclockwise rotation angle starting from the positive East axis.',
        exampleTex: '\\theta = \\tfrac{\\pi}{2} \\text{ points straight North}',
        exampleNote: 'Matches the exact angle definition from the Unit Circle.',
      },
      {
        id: 'k-pc6-rose',
        symbolTex: 'r = a\\cos(n\\theta)',
        name: 'Polar Rose Curve',
        meaning: 'Draws symmetric flower petals around the origin as radius pulses with angle.',
        exampleTex: 'r = 4\\cos(3\\theta) \\implies 3 \\text{ petals}',
        exampleNote: 'Odd n draws n petals; even n draws 2n petals!',
      },
    ],
    nextTip:
      'Step 7 slices a double 3D cone at tilting angles—revealing how Circles, Ellipses, Parabolas, and Hyperbolas unify every planetary orbit!',
    nextNodeId: 'pc-conics',
  },
  'pc-conics': {
    nodeId: 'pc-conics',
    courseId: 'precalculus',
    stepNumber: 7,
    prerequisiteNodeId: 'g-coordinate',
    prerequisiteTitle: 'Coordinate Analytic Proofs',
    prerequisiteRoute: '/lesson/g-coordinate',
    whyThisMatters:
      'Kepler discovered planets don’t orbit in circles—they glide along ellipses with the Sun at one focus! Meanwhile comets follow parabolas or hyperbolas governed by one number: eccentricity e.',
    warmUpPrompt:
      'Look at the ellipse equation x²/25 + y²/9 = 1. How wide is its horizontal half-axis a and vertical half-axis b?',
    warmUpPromptTex: '\\dfrac{x^2}{5^2} + \\dfrac{y^2}{3^2} = 1',
    warmUpAnswer:
      'a = 5 (since √25 = 5) and b = 3 (since √9 = 3)! The oval runs from −5 to +5 horizontally and −3 to +3 vertically.',
    warmUpAnswerTex: 'a = 5, \\quad b = 3',
    keySymbols: [
      {
        id: 'k-pc7-foci',
        symbolTex: 'F_1, F_2',
        name: 'Focal Points (Foci)',
        meaning: 'Twin anchor pins inside an ellipse where total string distance d₁ + d₂ stays constant = 2a.',
        exampleTex: 'c^2 = a^2 - b^2 \\implies c = \\sqrt{25-9} = 4',
        exampleNote: 'In a hyperbola (+ becomes −), foci use c² = a² + b²!',
      },
      {
        id: 'k-pc7-ecc',
        symbolTex: 'e = \\tfrac{c}{a}',
        name: 'Orbit Eccentricity',
        meaning: 'Measures stretch: 0 = circle, 0 < e < 1 = ellipse, 1 = parabola, e > 1 = hyperbola.',
        exampleTex: 'c=4,\\; a=5 \\implies e = 0.8',
        exampleNote: 'Higher eccentricity means a flatter, more stretched orbit.',
      },
      {
        id: 'k-pc7-hyp',
        symbolTex: '\\dfrac{x^2}{a^2} - \\dfrac{y^2}{b^2} = 1',
        name: 'Hyperbola Equation',
        meaning: 'A minus sign splits the loop inside-out into twin branches guided by diagonal asymptotes.',
        exampleTex: '\\text{Asymptotes: } y = \\pm\\tfrac{b}{a}x',
        exampleNote: 'Notice + makes a closed ellipse; − opens a hyperbola.',
      },
    ],
    nextTip:
      'Next in Step 8: tame infinity itself! Learn how adding infinitely many shrinking numbers can land cleanly on one exact finite sum.',
    nextNodeId: 'pc-series',
  },
  'pc-series': {
    nodeId: 'pc-series',
    courseId: 'precalculus',
    stepNumber: 8,
    prerequisiteNodeId: 'a2-logarithms',
    prerequisiteTitle: 'Logarithmic Inverses',
    prerequisiteRoute: '/lesson/logarithms',
    whyThisMatters:
      'Infinite series power every scientific calculator (computing sin x and eˣ to 16 digits!), fractal geometry areas, and physics Taylor approximations.',
    warmUpPrompt:
      'You walk 1/2 mile, then 1/4 mile, then 1/8 mile, continuing forever. What total distance do your steps approach?',
    warmUpPromptTex: '\\dfrac{1}{2} + \\dfrac{1}{4} + \\dfrac{1}{8} + \\cdots = \\dfrac{1/2}{1 - 1/2}',
    warmUpAnswer:
      '1 whole mile! Each step cuts the remaining gap to 1 mile cleanly in half.',
    warmUpAnswerTex: 'S_\\infty = 1',
    keySymbols: [
      {
        id: 'k-pc8-sig',
        symbolTex: '\\sum_{k=1}^n a_k',
        name: 'Sigma Summation',
        meaning: 'Loops index k from start to finish and adds up every resulting term.',
        exampleTex: '\\sum_{k=1}^3 k^2 = 1 + 4 + 9 = 14',
        exampleNote: 'Just like a compact `for` loop in code!',
      },
      {
        id: 'k-pc8-r',
        symbolTex: 'r = \\tfrac{a_{k+1}}{a_k}',
        name: 'Geometric Common Ratio',
        meaning: 'Constant multiplier between adjacent terms.',
        exampleTex: '12, 4, \\tfrac{4}{3}, \\dots \\implies r = \\tfrac{1}{3}',
        exampleNote: 'An infinite sum converges ONLY when |r| < 1.',
      },
      {
        id: 'k-pc8-sinf',
        symbolTex: 'S_\\infty = \\dfrac{a_1}{1 - r}',
        name: 'Infinite Convergent Sum',
        meaning: 'Exact finite total when multiplying by |r| < 1 forever.',
        exampleTex: 'a_1=12,\\; r=\\tfrac{1}{3} \\implies \\tfrac{12}{2/3} = 18',
        exampleNote: 'Works whenever −1 < r < 1.',
      },
    ],
    nextTip:
      'Final stop of the 36-unit Atlas (Step 9): shrink step size h → 0 to watch Algebra 1’s secant slope transform into Differential Calculus!',
    nextNodeId: 'pc-limits',
  },
  'pc-limits': {
    nodeId: 'pc-limits',
    courseId: 'precalculus',
    stepNumber: 9,
    prerequisiteNodeId: 'pc-series',
    prerequisiteTitle: 'Infinite Series & Sums',
    prerequisiteRoute: '/lesson/pc-series',
    whyThisMatters:
      'Algebra 1 gave you average slope between two distinct points. Limits shrink that gap h → 0 without dividing by zero—unlocking instantaneous speed, optimization, AP Calculus, and String Theory geometry!',
    warmUpPrompt:
      'Compute the average slope of f(x) = x² between x = 3 and x = 3.01.',
    warmUpPromptTex: '\\dfrac{(3.01)^2 - 3^2}{3.01 - 3} = \\dfrac{9.0601 - 9}{0.01}',
    warmUpAnswer:
      '6.01! Notice how shrinking h toward 0 locks the slope straight onto 2x = 6—your exact calculus derivative at x = 3!',
    warmUpAnswerTex: '\\lim_{h\\to 0}\\dfrac{(3+h)^2 - 9}{h} = 6',
    keySymbols: [
      {
        id: 'k-pc9-lim',
        symbolTex: '\\lim_{h \\to 0}',
        name: 'Limit as h Approaches 0',
        meaning: 'Watches where an expression zeroes in as h gets arbitrarily tiny—without setting h = 0 prematurely.',
        exampleTex: '\\lim_{h\\to 0}(6 + h) = 6',
        exampleNote: 'Algebraic factoring cancels the h in the denominator first!',
      },
      {
        id: 'k-pc9-diff',
        symbolTex: '\\dfrac{f(x+h) - f(x)}{h}',
        name: 'Difference Quotient',
        meaning: 'Rise over Run between two super-close points x and x + h.',
        exampleTex: 'f(x)=x^2 \\implies \\tfrac{(x+h)^2 - x^2}{h} = 2x + h',
        exampleNote: 'Literally Algebra 1 slope m = Δy/Δx upgraded!',
      },
      {
        id: 'k-pc9-drv',
        symbolTex: 'f\'(x)',
        name: 'Instantaneous Derivative',
        meaning: 'Exact tangent slope and instantaneous rate of change at x.',
        exampleTex: 'f(x) = x^2 \\implies f\'(x) = 2x',
        exampleNote: 'Powers velocity, acceleration, AI gradient descent, and physics!',
      },
    ],
    nextTip:
      'You’ve bridged every single milestone from Algebra 1 all the way to Calculus! Launch the 10D String Theory & Calabi-Yau 3D Frontier to see how these exact equations shape spacetime.',
    nextNodeId: null,
  },
};

const NODE_MAP = new Map(CURRICULUM_NODES.map((n) => [n.id, n]));

export function getNodeGuidance(nodeId: string): NodeGuidance {
  const found = NODE_GUIDANCE[nodeId];
  if (found) return found;

  const node = NODE_MAP.get(nodeId) ?? CURRICULUM_NODES[0];
  const siblings = CURRICULUM_NODES.filter((n) => n.courseId === node.courseId);
  const stepIdx = Math.max(
    0,
    siblings.findIndex((n) => n.id === node.id)
  );
  const prereqId = node.prerequisites[0] ?? null;
  const prereqNode = prereqId ? NODE_MAP.get(prereqId) : undefined;
  const nextSibling = siblings[stepIdx + 1];
  const courseIdx = COURSE_ORDER.indexOf(node.courseId);
  const nextCourseId = courseIdx >= 0 ? COURSE_ORDER[courseIdx + 1] : undefined;
  const nextCourseFirst = nextCourseId
    ? CURRICULUM_NODES.find((n) => n.courseId === nextCourseId)
    : undefined;
  const nextNode = nextSibling ?? nextCourseFirst ?? null;
  const courseSymbols = COURSE_SYMBOL_GLOSSARY[node.courseId];

  return {
    nodeId: node.id,
    courseId: node.courseId,
    stepNumber: stepIdx + 1,
    prerequisiteNodeId: prereqNode?.id ?? null,
    prerequisiteTitle: prereqNode?.title ?? 'Course Foundations',
    prerequisiteRoute: prereqNode?.route ?? '/textbook',
    whyThisMatters: node.summary,
    warmUpPrompt: `Preview the core idea behind ${node.title}: inspect how ${node.symbol} relates inputs to outputs.`,
    warmUpPromptTex: node.formulaTex,
    warmUpAnswer: `Connecting ${node.symbol} back to concrete numbers unlocks the visual pattern in this lesson.`,
    keySymbols: [courseSymbols[0], courseSymbols[1], courseSymbols[2]],
    nextTip: nextNode
      ? `Mastering ${node.title} sets you up directly for ${nextNode.title}.`
      : 'You have reached the frontier of the 36-unit atlas!',
    nextNodeId: nextNode?.id ?? null,
  };
}
