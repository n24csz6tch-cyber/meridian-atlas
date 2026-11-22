export type CourseId = 'algebra-1' | 'geometry' | 'algebra-2' | 'precalculus';

export interface OfficialSource {
  id: string;
  label: string;
  url: string;
  consultedDate: string;
}

export interface VerifiedStandard {
  code: string;
  courseId: CourseId;
  strand: string;
  description: string;
  clarification?: string;
  sourceUrl: string;
  sourceLabel: string;
  consultedDate: string;
}

export const CONSULTED_DATE = '2026-11-22';

export const FLDOE_SOURCES: Record<string, OfficialSource> = {
  bestIndex: {
    id: 'fldoe-best-index',
    label: 'FLDOE B.E.S.T. Standards for Mathematics',
    url: 'https://www.fldoe.org/academics/standards/subject-areas/math-science/mathematics/index.stml',
    consultedDate: CONSULTED_DATE,
  },
  bestPdf: {
    id: 'fldoe-best-pdf',
    label: 'Florida B.E.S.T. Mathematics Standards (Official PDF)',
    url: 'https://www.fldoe.org/core/fileparse.php/20590/urlt/FLBestMathStandards.pdf',
    consultedDate: CONSULTED_DATE,
  },
  cpalmsAlg1: {
    id: 'cpalms-1200310',
    label: 'CPALMS Course 1200310 — Algebra 1',
    url: 'https://www.cpalms.org/Public/PreviewCourse/Preview/1200310',
    consultedDate: CONSULTED_DATE,
  },
  cpalmsGeom: {
    id: 'cpalms-1206310',
    label: 'CPALMS Course 1206310 — Geometry',
    url: 'https://www.cpalms.org/Public/PreviewCourse/Preview/1206310',
    consultedDate: CONSULTED_DATE,
  },
  cpalmsAlg2: {
    id: 'cpalms-1200330',
    label: 'CPALMS Course 1200330 — Algebra 2',
    url: 'https://www.cpalms.org/Public/PreviewCourse/Preview/1200330',
    consultedDate: CONSULTED_DATE,
  },
  cpalmsPrecalc: {
    id: 'cpalms-1202340',
    label: 'CPALMS Course 1202340 — Pre-Calculus Honors',
    url: 'https://www.cpalms.org/Public/PreviewCourse/Preview/1202340',
    consultedDate: CONSULTED_DATE,
  },
};

export const VERIFIED_STANDARDS: Record<string, VerifiedStandard> = {
  'MA.912.AR.1': {
    code: 'MA.912.AR.1',
    courseId: 'algebra-1',
    strand: 'Algebraic Reasoning',
    description: 'Interpret and rewrite algebraic expressions and equations in equivalent forms.',
    sourceUrl: 'https://www.cpalms.org/Public/Standard/Preview/12328',
    sourceLabel: 'CPALMS Standard Preview #12328',
    consultedDate: CONSULTED_DATE,
  },
  'MA.912.AR.2.4': {
    code: 'MA.912.AR.2.4',
    courseId: 'algebra-1',
    strand: 'Algebraic Reasoning',
    description:
      'Given a table, equation or written description of a linear function, graph that function, and determine and interpret its key features.',
    sourceUrl: 'https://www.cpalms.org/Public/Standard/Preview/12474',
    sourceLabel: 'CPALMS Standard Preview #12474',
    consultedDate: CONSULTED_DATE,
  },
  'MA.912.AR.9.1': {
    code: 'MA.912.AR.9.1',
    courseId: 'algebra-1',
    strand: 'Algebraic Reasoning',
    description:
      'Given a mathematical or real-world context, write and solve a system of two-variable linear equations algebraically or graphically.',
    sourceUrl: 'https://www.cpalms.org/Public/Standard/Preview/12530',
    sourceLabel: 'CPALMS Standard Preview #12530',
    consultedDate: CONSULTED_DATE,
  },
  'MA.912.AR.3.1': {
    code: 'MA.912.AR.3.1',
    courseId: 'algebra-1',
    strand: 'Algebraic Reasoning',
    description:
      'Given a mathematical or real-world context, write and solve one-variable quadratic equations over the real number system.',
    clarification:
      'Expectations include solving using factoring techniques, taking square roots, the quadratic formula, and completing the square.',
    sourceUrl: FLDOE_SOURCES.cpalmsAlg1.url,
    sourceLabel: 'CPALMS Algebra 1 (1200310)',
    consultedDate: CONSULTED_DATE,
  },
  'MA.912.AR.3.4': {
    code: 'MA.912.AR.3.4',
    courseId: 'algebra-1',
    strand: 'Algebraic Reasoning',
    description:
      'Write a quadratic function to represent the relationship between two quantities from a graph, a written description or a table of values within a mathematical or real-world context.',
    clarification:
      'Includes standard form, factored form, and vertex form using the vertex and equidistant points.',
    sourceUrl: FLDOE_SOURCES.cpalmsAlg1.url,
    sourceLabel: 'CPALMS Algebra 1 (1200310)',
    consultedDate: CONSULTED_DATE,
  },
  'MA.912.AR.3.6': {
    code: 'MA.912.AR.3.6',
    courseId: 'algebra-1',
    strand: 'Algebraic Reasoning',
    description:
      'Given an expression or equation representing a quadratic function, determine the vertex and zeros and interpret them in terms of a real-world context.',
    sourceUrl: FLDOE_SOURCES.cpalmsAlg1.url,
    sourceLabel: 'CPALMS Algebra 1 (1200310)',
    consultedDate: CONSULTED_DATE,
  },
  'MA.912.AR.3.7': {
    code: 'MA.912.AR.3.7',
    courseId: 'algebra-1',
    strand: 'Algebraic Reasoning',
    description:
      'Given a table, equation or written description of a quadratic function, graph that function, and determine and interpret its key features.',
    clarification:
      'Key features: domain, range, intercepts, increasing/decreasing/positive/negative intervals, end behavior, vertex, and symmetry.',
    sourceUrl: FLDOE_SOURCES.cpalmsAlg1.url,
    sourceLabel: 'CPALMS Algebra 1 (1200310)',
    consultedDate: CONSULTED_DATE,
  },
  'MA.912.F.2.1': {
    code: 'MA.912.F.2.1',
    courseId: 'algebra-1',
    strand: 'Functions',
    description:
      'Identify the effect on the graph or table of a given function after replacing f(x) by f(x)+k, kf(x), f(kx), and f(x+k) for specific values of k.',
    sourceUrl: FLDOE_SOURCES.cpalmsAlg1.url,
    sourceLabel: 'CPALMS Algebra 1 (1200310)',
    consultedDate: CONSULTED_DATE,
  },
  'MA.912.AR.5': {
    code: 'MA.912.AR.5',
    courseId: 'algebra-1',
    strand: 'Algebraic Reasoning',
    description:
      'Write, solve and graph exponential and logarithmic equations and functions in one and two variables.',
    sourceUrl: FLDOE_SOURCES.cpalmsAlg1.url,
    sourceLabel: 'CPALMS Algebra 1 (1200310)',
    consultedDate: CONSULTED_DATE,
  },
  'MA.912.GR.1.3': {
    code: 'MA.912.GR.1.3',
    courseId: 'geometry',
    strand: 'Geometric Reasoning',
    description:
      'Prove relationships and theorems about triangles. Solve mathematical and real-world problems involving postulates, relationships, and theorems of triangles.',
    sourceUrl: 'https://www.cpalms.org/PreviewStandard/Preview/12693',
    sourceLabel: 'CPALMS Standard Preview #12693',
    consultedDate: CONSULTED_DATE,
  },
  'MA.912.T.1.2': {
    code: 'MA.912.T.1.2',
    courseId: 'geometry',
    strand: 'Trigonometry',
    description:
      'Solve mathematical and real-world problems involving right triangles using trigonometric ratios and the Pythagorean Theorem.',
    sourceUrl: FLDOE_SOURCES.cpalmsGeom.url,
    sourceLabel: 'CPALMS Geometry (1206310)',
    consultedDate: CONSULTED_DATE,
  },
  'MA.912.GR.6.1': {
    code: 'MA.912.GR.6.1',
    courseId: 'geometry',
    strand: 'Geometric Reasoning',
    description:
      'Solve problems involving the length of a secant, tangent, segment, or chord in a circle.',
    sourceUrl: FLDOE_SOURCES.cpalmsGeom.url,
    sourceLabel: 'CPALMS Geometry (1206310)',
    consultedDate: CONSULTED_DATE,
  },
  'MA.912.GR.6.4': {
    code: 'MA.912.GR.6.4',
    courseId: 'geometry',
    strand: 'Geometric Reasoning',
    description: 'Solve problems involving arc length and the area of a sector.',
    sourceUrl: FLDOE_SOURCES.cpalmsGeom.url,
    sourceLabel: 'CPALMS Geometry (1206310)',
    consultedDate: CONSULTED_DATE,
  },
  'MA.912.GR.4.1': {
    code: 'MA.912.GR.4.1',
    courseId: 'geometry',
    strand: 'Geometric Reasoning',
    description: 'Identify the shapes of two-dimensional cross-sections of three-dimensional figures.',
    clarification:
      'Parallel or perpendicular to the base for right cylinders, prisms, pyramids, and cones.',
    sourceUrl: 'https://www.cpalms.org/PreviewStandard/Preview/12717',
    sourceLabel: 'CPALMS Standard Preview #12717',
    consultedDate: CONSULTED_DATE,
  },
  'MA.912.GR.4.5': {
    code: 'MA.912.GR.4.5',
    courseId: 'geometry',
    strand: 'Geometric Reasoning',
    description:
      'Solve mathematical and real-world problems involving the volume of three-dimensional figures limited to cylinders, pyramids, prisms, cones, and spheres.',
    sourceUrl: 'https://www.cpalms.org/PreviewStandard/Preview/12721',
    sourceLabel: 'CPALMS Standard Preview #12721',
    consultedDate: CONSULTED_DATE,
  },
  'MA.912.GR.4.6': {
    code: 'MA.912.GR.4.6',
    courseId: 'geometry',
    strand: 'Geometric Reasoning',
    description:
      'Solve mathematical and real-world problems involving the surface area of three-dimensional figures limited to cylinders, pyramids, prisms, cones, and spheres.',
    sourceUrl: 'https://www.cpalms.org/PreviewStandard/Preview/12722',
    sourceLabel: 'CPALMS Standard Preview #12722',
    consultedDate: CONSULTED_DATE,
  },
  'MA.912.AR.3.2': {
    code: 'MA.912.AR.3.2',
    courseId: 'algebra-2',
    strand: 'Algebraic Reasoning',
    description:
      'Given a mathematical or real-world context, write and solve one-variable quadratic equations over the real and complex number systems.',
    sourceUrl: FLDOE_SOURCES.cpalmsAlg2.url,
    sourceLabel: 'CPALMS Algebra 2 (1200330)',
    consultedDate: CONSULTED_DATE,
  },
  'MA.912.AR.6.1': {
    code: 'MA.912.AR.6.1',
    courseId: 'algebra-2',
    strand: 'Algebraic Reasoning',
    description: 'Solve one-variable polynomial equations using factorization when suitable.',
    sourceUrl: FLDOE_SOURCES.cpalmsAlg2.url,
    sourceLabel: 'CPALMS Algebra 2 (1200330)',
    consultedDate: CONSULTED_DATE,
  },
  'MA.912.AR.5.2': {
    code: 'MA.912.AR.5.2',
    courseId: 'algebra-2',
    strand: 'Algebraic Reasoning',
    description:
      'Solve one-variable equations involving logarithms or exponential expressions. Interpret solutions as viable in terms of the context and identify any extraneous solutions.',
    sourceUrl: FLDOE_SOURCES.cpalmsAlg2.url,
    sourceLabel: 'CPALMS Algebra 2 (1200330)',
    consultedDate: CONSULTED_DATE,
  },
  'MA.912.AR.5.9': {
    code: 'MA.912.AR.5.9',
    courseId: 'algebra-2',
    strand: 'Algebraic Reasoning',
    description:
      'Solve and graph mathematical and real-world problems that are modeled with logarithmic functions. Interpret key features and determine constraints in terms of the context.',
    sourceUrl: FLDOE_SOURCES.cpalmsAlg2.url,
    sourceLabel: 'CPALMS Algebra 2 (1200330)',
    consultedDate: CONSULTED_DATE,
  },
  'MA.912.AR.8.1': {
    code: 'MA.912.AR.8.1',
    courseId: 'algebra-2',
    strand: 'Algebraic Reasoning',
    description:
      'Write and solve one-variable rational equations, interpret solutions as viable in context, and identify extraneous solutions.',
    sourceUrl: FLDOE_SOURCES.cpalmsAlg2.url,
    sourceLabel: 'CPALMS Algebra 2 (1200330)',
    consultedDate: CONSULTED_DATE,
  },
  'MA.912.T.2.2': {
    code: 'MA.912.T.2.2',
    courseId: 'precalculus',
    strand: 'Trigonometry',
    description:
      'Define the six basic trigonometric functions for all real numbers by identifying corresponding angle measures and using right triangles drawn in the unit circle.',
    sourceUrl: FLDOE_SOURCES.cpalmsPrecalc.url,
    sourceLabel: 'CPALMS Pre-Calculus Honors (1202340)',
    consultedDate: CONSULTED_DATE,
  },
  'MA.912.T.3.1': {
    code: 'MA.912.T.3.1',
    courseId: 'precalculus',
    strand: 'Trigonometry',
    description:
      'Given a mathematical or real-world context, choose sine, cosine or tangent trigonometric functions to model periodic phenomena with specified amplitude, frequency, horizontal shift and midline.',
    sourceUrl: FLDOE_SOURCES.cpalmsPrecalc.url,
    sourceLabel: 'CPALMS Pre-Calculus Honors (1202340)',
    consultedDate: CONSULTED_DATE,
  },
  'MA.912.T.3.2': {
    code: 'MA.912.T.3.2',
    courseId: 'precalculus',
    strand: 'Trigonometry',
    description:
      'Given a table, equation or written description of a trigonometric function, graph that function and determine key features.',
    sourceUrl: FLDOE_SOURCES.cpalmsPrecalc.url,
    sourceLabel: 'CPALMS Pre-Calculus Honors (1202340)',
    consultedDate: CONSULTED_DATE,
  },
  'MA.912.NSO.3.1': {
    code: 'MA.912.NSO.3.1',
    courseId: 'precalculus',
    strand: 'Number Sense and Operations',
    description:
      'Represent vectors as directed line segments in the plane; determine magnitude and direction in component form.',
    sourceUrl: FLDOE_SOURCES.cpalmsPrecalc.url,
    sourceLabel: 'CPALMS Pre-Calculus Honors (1202340)',
    consultedDate: CONSULTED_DATE,
  },
  'MA.912.NSO.4.1': {
    code: 'MA.912.NSO.4.1',
    courseId: 'algebra-2',
    strand: 'Number Sense and Operations',
    description:
      'Given a mathematical or real-world context, represent and manipulate data using matrices.',
    sourceUrl: FLDOE_SOURCES.cpalmsAlg2.url,
    sourceLabel: 'CPALMS Algebra 2 (1200330)',
    consultedDate: CONSULTED_DATE,
  },
  'MA.912.NSO.4.2': {
    code: 'MA.912.NSO.4.2',
    courseId: 'algebra-2',
    strand: 'Number Sense and Operations',
    description:
      'Given a mathematical or real-world context, represent and solve a system of two- or three-variable linear equations using matrices.',
    sourceUrl: FLDOE_SOURCES.cpalmsAlg2.url,
    sourceLabel: 'CPALMS Algebra 2 (1200330)',
    consultedDate: CONSULTED_DATE,
  },
  'MA.912.AR.10.1': {
    code: 'MA.912.AR.10.1',
    courseId: 'precalculus',
    strand: 'Algebraic Reasoning',
    description:
      'Write and solve mathematical and real-world problems involving arithmetic or geometric sequences and series.',
    sourceUrl: FLDOE_SOURCES.cpalmsPrecalc.url,
    sourceLabel: 'CPALMS Pre-Calculus Honors (1202340)',
    consultedDate: CONSULTED_DATE,
  },
  'MA.912.AR.2.8': {
    code: 'MA.912.AR.2.8',
    courseId: 'algebra-1',
    strand: 'Algebraic Reasoning',
    description:
      'Given a mathematical or real-world context, graph the solution set to a two-variable linear inequality or system of inequalities.',
    sourceUrl: FLDOE_SOURCES.cpalmsAlg1.url,
    sourceLabel: 'CPALMS Algebra 1 (1200310)',
    consultedDate: CONSULTED_DATE,
  },
  'MA.912.GR.2.1': {
    code: 'MA.912.GR.2.1',
    courseId: 'geometry',
    strand: 'Geometric Reasoning',
    description:
      'Given a preimage and image, describe the transformation and represent the transformation algebraically using coordinates.',
    sourceUrl: FLDOE_SOURCES.cpalmsGeom.url,
    sourceLabel: 'CPALMS Geometry (1206310)',
    consultedDate: CONSULTED_DATE,
  },
  'MA.912.GR.3.3': {
    code: 'MA.912.GR.3.3',
    courseId: 'geometry',
    strand: 'Geometric Reasoning',
    description:
      'Use coordinate geometry to solve mathematical and real-world geometric problems involving lines, segments, triangles, and quadrilaterals.',
    sourceUrl: FLDOE_SOURCES.cpalmsGeom.url,
    sourceLabel: 'CPALMS Geometry (1206310)',
    consultedDate: CONSULTED_DATE,
  },
  'MA.912.DP.2.2': {
    code: 'MA.912.DP.2.2',
    courseId: 'algebra-2',
    strand: 'Data Analysis and Probability',
    description:
      'Use the mean and standard deviation of a data set to fit it to a normal distribution and to estimate population percentages.',
    sourceUrl: FLDOE_SOURCES.bestIndex.url,
    sourceLabel: 'FLDOE B.E.S.T. Mathematics Standards',
    consultedDate: CONSULTED_DATE,
  },
  'MA.912.DP.6': {
    code: 'MA.912.DP.6',
    courseId: 'algebra-2',
    strand: 'Data Analysis and Probability',
    description:
      'Develop and analyze probability distributions and calculate expected values for random variables.',
    sourceUrl: FLDOE_SOURCES.bestIndex.url,
    sourceLabel: 'FLDOE B.E.S.T. Mathematics Standards',
    consultedDate: CONSULTED_DATE,
  },
  'MA.912.GR.7': {
    code: 'MA.912.GR.7',
    courseId: 'precalculus',
    strand: 'Geometric Reasoning',
    description:
      'Apply geometric and algebraic representations of conic sections (circles, parabolas, ellipses, and hyperbolas) using foci, vertices, and eccentricity.',
    sourceUrl: FLDOE_SOURCES.cpalmsPrecalc.url,
    sourceLabel: 'CPALMS Pre-Calculus Honors (1202340)',
    consultedDate: CONSULTED_DATE,
  },
  'MA.912.T.4': {
    code: 'MA.912.T.4',
    courseId: 'precalculus',
    strand: 'Trigonometry & Polar Systems',
    description:
      'Extend planar representations using polar coordinates and parametric equations; graph polar curves and convert between rectangular and polar forms.',
    sourceUrl: FLDOE_SOURCES.cpalmsPrecalc.url,
    sourceLabel: 'CPALMS Pre-Calculus Honors (1202340)',
    consultedDate: CONSULTED_DATE,
  },
  'MA.912.C.1': {
    code: 'MA.912.C.1',
    courseId: 'precalculus',
    strand: 'Calculus Foundations',
    description:
      'Determine limits of functions graphically, numerically, and algebraically; connect secant slopes approaching h → 0 to instantaneous rates of change.',
    sourceUrl: FLDOE_SOURCES.bestIndex.url,
    sourceLabel: 'FLDOE B.E.S.T. Calculus Bridge',
    consultedDate: CONSULTED_DATE,
  },
  'MA.912.AR.4.3': {
    code: 'MA.912.AR.4.3',
    courseId: 'algebra-1',
    strand: 'Algebraic Reasoning',
    description:
      'Given a table, equation or written description of an absolute value function, graph that function and determine its key features (vertex, axis of symmetry, intercepts, domain, and range).',
    sourceUrl: FLDOE_SOURCES.cpalmsAlg1.url,
    sourceLabel: 'CPALMS Algebra 1 (1200310)',
    consultedDate: CONSULTED_DATE,
  },
  'MA.912.NSO.1.1': {
    code: 'MA.912.NSO.1.1',
    courseId: 'algebra-1',
    strand: 'Number Sense and Operations',
    description:
      'Extend previous understanding of the laws of exponents to include rational exponents; convert between radical and rational-exponent forms.',
    sourceUrl: FLDOE_SOURCES.cpalmsAlg1.url,
    sourceLabel: 'CPALMS Algebra 1 (1200310)',
    consultedDate: CONSULTED_DATE,
  },
  'MA.912.NSO.1.2': {
    code: 'MA.912.NSO.1.2',
    courseId: 'algebra-1',
    strand: 'Number Sense and Operations',
    description:
      'Generate equivalent algebraic expressions using the properties of exponents (product, quotient, and power rules).',
    sourceUrl: FLDOE_SOURCES.cpalmsAlg1.url,
    sourceLabel: 'CPALMS Algebra 1 (1200310)',
    consultedDate: CONSULTED_DATE,
  },
  'MA.912.DP.2.4': {
    code: 'MA.912.DP.2.4',
    courseId: 'algebra-1',
    strand: 'Data Analysis and Probability',
    description:
      'Fit a linear function to bivariate numerical data that suggests a linear association and interpret the slope and y-intercept of the model.',
    sourceUrl: FLDOE_SOURCES.cpalmsAlg1.url,
    sourceLabel: 'CPALMS Algebra 1 (1200310)',
    consultedDate: CONSULTED_DATE,
  },
  'MA.912.DP.2.9': {
    code: 'MA.912.DP.2.9',
    courseId: 'algebra-1',
    strand: 'Data Analysis and Probability',
    description:
      'Use the slope and residuals of a line of fit to evaluate the strength, direction, and appropriateness of a linear model.',
    sourceUrl: FLDOE_SOURCES.cpalmsAlg1.url,
    sourceLabel: 'CPALMS Algebra 1 (1200310)',
    consultedDate: CONSULTED_DATE,
  },
  'MA.912.GR.1.1': {
    code: 'MA.912.GR.1.1',
    courseId: 'geometry',
    strand: 'Geometric Reasoning',
    description:
      'Prove relationships and theorems about lines and angles, including vertical angles, linear pairs, and parallel lines cut by a transversal.',
    sourceUrl: FLDOE_SOURCES.cpalmsGeom.url,
    sourceLabel: 'CPALMS Geometry (1206310)',
    consultedDate: CONSULTED_DATE,
  },
  'MA.912.GR.1.2': {
    code: 'MA.912.GR.1.2',
    courseId: 'geometry',
    strand: 'Geometric Reasoning',
    description:
      'Prove triangle congruence or similarity using SSS, SAS, ASA, AAS, AA, and HL criteria.',
    sourceUrl: FLDOE_SOURCES.cpalmsGeom.url,
    sourceLabel: 'CPALMS Geometry (1206310)',
    consultedDate: CONSULTED_DATE,
  },
  'MA.912.GR.1.6': {
    code: 'MA.912.GR.1.6',
    courseId: 'geometry',
    strand: 'Geometric Reasoning',
    description:
      'Solve mathematical and real-world problems involving congruence or similarity in two-dimensional figures, including perimeter and area scale ratios.',
    sourceUrl: FLDOE_SOURCES.cpalmsGeom.url,
    sourceLabel: 'CPALMS Geometry (1206310)',
    consultedDate: CONSULTED_DATE,
  },
  'MA.912.GR.1.4': {
    code: 'MA.912.GR.1.4',
    courseId: 'geometry',
    strand: 'Geometric Reasoning',
    description:
      'Prove relationships and theorems about polygons, including interior and exterior angle sums.',
    sourceUrl: FLDOE_SOURCES.cpalmsGeom.url,
    sourceLabel: 'CPALMS Geometry (1206310)',
    consultedDate: CONSULTED_DATE,
  },
  'MA.912.GR.1.5': {
    code: 'MA.912.GR.1.5',
    courseId: 'geometry',
    strand: 'Geometric Reasoning',
    description:
      'Prove relationships and theorems about quadrilaterals (parallelograms, rectangles, rhombi, squares, trapezoids, and kites) using sides, angles, and diagonals.',
    sourceUrl: FLDOE_SOURCES.cpalmsGeom.url,
    sourceLabel: 'CPALMS Geometry (1206310)',
    consultedDate: CONSULTED_DATE,
  },
  'MA.912.AR.9.2': {
    code: 'MA.912.AR.9.2',
    courseId: 'algebra-2',
    strand: 'Algebraic Reasoning',
    description:
      'Given a mathematical or real-world context, solve a system consisting of a two-variable linear equation and a non-linear equation algebraically or graphically.',
    sourceUrl: FLDOE_SOURCES.cpalmsAlg2.url,
    sourceLabel: 'CPALMS Algebra 2 (1200330)',
    consultedDate: CONSULTED_DATE,
  },
  'MA.912.AR.9.3': {
    code: 'MA.912.AR.9.3',
    courseId: 'algebra-2',
    strand: 'Algebraic Reasoning',
    description:
      'Given a mathematical or real-world context, solve a system consisting of two-variable linear or non-linear equations algebraically or graphically.',
    sourceUrl: FLDOE_SOURCES.cpalmsAlg2.url,
    sourceLabel: 'CPALMS Algebra 2 (1200330)',
    consultedDate: CONSULTED_DATE,
  },
  'MA.912.AR.7.1': {
    code: 'MA.912.AR.7.1',
    courseId: 'algebra-2',
    strand: 'Algebraic Reasoning',
    description:
      'Solve one-variable radical equations, interpret solutions as viable in terms of context, and identify any extraneous solutions.',
    sourceUrl: FLDOE_SOURCES.cpalmsAlg2.url,
    sourceLabel: 'CPALMS Algebra 2 (1200330)',
    consultedDate: CONSULTED_DATE,
  },
  'MA.912.F.3.7': {
    code: 'MA.912.F.3.7',
    courseId: 'algebra-2',
    strand: 'Functions',
    description:
      'Represent the inverse of a function algebraically, graphically, or in a table, and use composition of functions f(g(x)) = x to verify inverses.',
    sourceUrl: FLDOE_SOURCES.cpalmsAlg2.url,
    sourceLabel: 'CPALMS Algebra 2 (1200330)',
    consultedDate: CONSULTED_DATE,
  },
  'MA.912.DP.4.10': {
    code: 'MA.912.DP.4.10',
    courseId: 'algebra-2',
    strand: 'Data Analysis and Probability',
    description:
      'Given a mathematical or real-world situation, calculate the appropriate permutation or combination and apply binomial counting principles.',
    sourceUrl: FLDOE_SOURCES.bestIndex.url,
    sourceLabel: 'FLDOE B.E.S.T. Mathematics Standards',
    consultedDate: CONSULTED_DATE,
  },
  'MA.912.T.1.5': {
    code: 'MA.912.T.1.5',
    courseId: 'precalculus',
    strand: 'Trigonometry',
    description:
      'Prove and apply Pythagorean trigonometric identities to simplify expressions and solve equations.',
    sourceUrl: FLDOE_SOURCES.cpalmsPrecalc.url,
    sourceLabel: 'CPALMS Pre-Calculus Honors (1202340)',
    consultedDate: CONSULTED_DATE,
  },
  'MA.912.T.1.6': {
    code: 'MA.912.T.1.6',
    courseId: 'precalculus',
    strand: 'Trigonometry',
    description:
      'Prove and apply the Double-Angle, Half-Angle, and Angle Sum/Difference formulas for sine, cosine, and tangent.',
    sourceUrl: FLDOE_SOURCES.cpalmsPrecalc.url,
    sourceLabel: 'CPALMS Pre-Calculus Honors (1202340)',
    consultedDate: CONSULTED_DATE,
  },
  'MA.912.T.1.3': {
    code: 'MA.912.T.1.3',
    courseId: 'precalculus',
    strand: 'Trigonometry',
    description:
      'Apply the Law of Sines and the Law of Cosines to solve mathematical and real-world problems involving oblique triangles.',
    sourceUrl: FLDOE_SOURCES.cpalmsPrecalc.url,
    sourceLabel: 'CPALMS Pre-Calculus Honors (1202340)',
    consultedDate: CONSULTED_DATE,
  },
  'MA.912.T.1.4': {
    code: 'MA.912.T.1.4',
    courseId: 'precalculus',
    strand: 'Trigonometry',
    description:
      'Solve problems involving the area of a triangle given two sides and the included angle using Area = ½ab sin(C).',
    sourceUrl: FLDOE_SOURCES.cpalmsPrecalc.url,
    sourceLabel: 'CPALMS Pre-Calculus Honors (1202340)',
    consultedDate: CONSULTED_DATE,
  },
  'MA.912.T.4.5': {
    code: 'MA.912.T.4.5',
    courseId: 'precalculus',
    strand: 'Trigonometry & Polar Systems',
    description:
      'Sketch the graph of a plane curve represented parametrically, indicating orientation and direction of motion over time t.',
    sourceUrl: FLDOE_SOURCES.cpalmsPrecalc.url,
    sourceLabel: 'CPALMS Pre-Calculus Honors (1202340)',
    consultedDate: CONSULTED_DATE,
  },
  'MA.912.T.4.7': {
    code: 'MA.912.T.4.7',
    courseId: 'precalculus',
    strand: 'Trigonometry & Polar Systems',
    description:
      'Apply parametric equations to model and solve real-world applications involving motion in the plane, including ballistic trajectories.',
    sourceUrl: FLDOE_SOURCES.cpalmsPrecalc.url,
    sourceLabel: 'CPALMS Pre-Calculus Honors (1202340)',
    consultedDate: CONSULTED_DATE,
  },
};
