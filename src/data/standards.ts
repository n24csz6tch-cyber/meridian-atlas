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

  // ================= EXPANDED FLORIDA B.E.S.T. / B1G-M HIGH SCHOOL BENCHMARKS =================

  // --- NSO: Number Sense & Operations ---
  'MA.912.NSO.1.4': {
    code: 'MA.912.NSO.1.4',
    courseId: 'algebra-1',
    strand: 'Number Sense and Operations',
    description:
      'Apply previous understanding of operations with rational numbers to add, subtract, multiply and divide numerical radicals.',
    clarification:
      'Includes simplifying square roots and cube roots and rationalizing single-term radical denominators.',
    sourceUrl: FLDOE_SOURCES.cpalmsAlg1.url,
    sourceLabel: 'CPALMS Algebra 1 (1200310)',
    consultedDate: CONSULTED_DATE,
  },
  'MA.912.NSO.2.1': {
    code: 'MA.912.NSO.2.1',
    courseId: 'algebra-2',
    strand: 'Number Sense and Operations',
    description:
      'Extend previous understanding of the real number system to include the complex number system. Add, subtract, multiply and divide complex numbers.',
    clarification:
      'Includes writing complex results in a + bi form using conjugates and powers of i.',
    sourceUrl: FLDOE_SOURCES.cpalmsAlg2.url,
    sourceLabel: 'CPALMS Algebra 2 (1200330)',
    consultedDate: CONSULTED_DATE,
  },
  'MA.912.NSO.3.2': {
    code: 'MA.912.NSO.3.2',
    courseId: 'precalculus',
    strand: 'Number Sense and Operations',
    description:
      'Represent addition, subtraction, scalar multiplication and dot product of vectors algebraically and graphically.',
    sourceUrl: FLDOE_SOURCES.cpalmsPrecalc.url,
    sourceLabel: 'CPALMS Pre-Calculus Honors (1202340)',
    consultedDate: CONSULTED_DATE,
  },

  // --- AR: Algebraic Reasoning ---
  'MA.912.AR.1.1': {
    code: 'MA.912.AR.1.1',
    courseId: 'algebra-1',
    strand: 'Algebraic Reasoning',
    description:
      'Identify and interpret parts of an equation or expression that represent a quantity in terms of a mathematical or real-world context, including viewing one or more of its parts as a single entity.',
    sourceUrl: FLDOE_SOURCES.cpalmsAlg1.url,
    sourceLabel: 'CPALMS Algebra 1 (1200310)',
    consultedDate: CONSULTED_DATE,
  },
  'MA.912.AR.1.2': {
    code: 'MA.912.AR.1.2',
    courseId: 'algebra-1',
    strand: 'Algebraic Reasoning',
    description: 'Rearrange equations or formulas to isolate a quantity of interest.',
    clarification:
      'Includes literal physics, geometry, and financial formulas solved for any specified variable.',
    sourceUrl: FLDOE_SOURCES.cpalmsAlg1.url,
    sourceLabel: 'CPALMS Algebra 1 (1200310)',
    consultedDate: CONSULTED_DATE,
  },
  'MA.912.AR.1.3': {
    code: 'MA.912.AR.1.3',
    courseId: 'algebra-1',
    strand: 'Algebraic Reasoning',
    description: 'Add, subtract and multiply polynomial expressions with rational number coefficients.',
    sourceUrl: FLDOE_SOURCES.cpalmsAlg1.url,
    sourceLabel: 'CPALMS Algebra 1 (1200310)',
    consultedDate: CONSULTED_DATE,
  },
  'MA.912.AR.1.7': {
    code: 'MA.912.AR.1.7',
    courseId: 'algebra-1',
    strand: 'Algebraic Reasoning',
    description:
      'Rewrite a polynomial expression as a product of polynomials over the real number system.',
    clarification:
      'Includes greatest common factor, trinomial factoring, difference of squares, and factoring by grouping.',
    sourceUrl: FLDOE_SOURCES.cpalmsAlg1.url,
    sourceLabel: 'CPALMS Algebra 1 (1200310)',
    consultedDate: CONSULTED_DATE,
  },
  'MA.912.AR.2.1': {
    code: 'MA.912.AR.2.1',
    courseId: 'algebra-1',
    strand: 'Algebraic Reasoning',
    description:
      'Given a real-world context, write and solve one-variable multi-step linear equations.',
    sourceUrl: FLDOE_SOURCES.cpalmsAlg1.url,
    sourceLabel: 'CPALMS Algebra 1 (1200310)',
    consultedDate: CONSULTED_DATE,
  },
  'MA.912.AR.2.2': {
    code: 'MA.912.AR.2.2',
    courseId: 'algebra-1',
    strand: 'Algebraic Reasoning',
    description:
      'Write a linear two-variable equation to represent the relationship between two quantities from a graph, a written description or a table of values.',
    clarification:
      'Includes slope-intercept, point-slope, and standard forms.',
    sourceUrl: FLDOE_SOURCES.cpalmsAlg1.url,
    sourceLabel: 'CPALMS Algebra 1 (1200310)',
    consultedDate: CONSULTED_DATE,
  },
  'MA.912.AR.2.6': {
    code: 'MA.912.AR.2.6',
    courseId: 'algebra-1',
    strand: 'Algebraic Reasoning',
    description:
      'Given a mathematical or real-world context, write and solve one-variable linear inequalities, including compound inequalities. Represent solutions algebraically or graphically.',
    sourceUrl: FLDOE_SOURCES.cpalmsAlg1.url,
    sourceLabel: 'CPALMS Algebra 1 (1200310)',
    consultedDate: CONSULTED_DATE,
  },
  'MA.912.AR.3.8': {
    code: 'MA.912.AR.3.8',
    courseId: 'algebra-1',
    strand: 'Algebraic Reasoning',
    description:
      'Solve and graph mathematical and real-world problems that are modeled with quadratic functions. Interpret key features and determine constraints in terms of the context.',
    sourceUrl: FLDOE_SOURCES.cpalmsAlg1.url,
    sourceLabel: 'CPALMS Algebra 1 (1200310)',
    consultedDate: CONSULTED_DATE,
  },
  'MA.912.AR.4.1': {
    code: 'MA.912.AR.4.1',
    courseId: 'algebra-1',
    strand: 'Algebraic Reasoning',
    description:
      'Given a mathematical or real-world context, write and solve one-variable absolute value equations.',
    sourceUrl: FLDOE_SOURCES.cpalmsAlg1.url,
    sourceLabel: 'CPALMS Algebra 1 (1200310)',
    consultedDate: CONSULTED_DATE,
  },
  'MA.912.AR.5.3': {
    code: 'MA.912.AR.5.3',
    courseId: 'algebra-1',
    strand: 'Algebraic Reasoning',
    description:
      'Given a mathematical or real-world context, classify an exponential function as representing growth or decay.',
    sourceUrl: FLDOE_SOURCES.cpalmsAlg1.url,
    sourceLabel: 'CPALMS Algebra 1 (1200310)',
    consultedDate: CONSULTED_DATE,
  },
  'MA.912.AR.5.4': {
    code: 'MA.912.AR.5.4',
    courseId: 'algebra-1',
    strand: 'Algebraic Reasoning',
    description:
      'Write an exponential function to represent a relationship between two quantities from a graph, a written description or a table of values.',
    sourceUrl: FLDOE_SOURCES.cpalmsAlg1.url,
    sourceLabel: 'CPALMS Algebra 1 (1200310)',
    consultedDate: CONSULTED_DATE,
  },
  'MA.912.AR.5.6': {
    code: 'MA.912.AR.5.6',
    courseId: 'algebra-1',
    strand: 'Algebraic Reasoning',
    description:
      'Given a table, equation or written description of an exponential function, graph that function and determine its key features.',
    sourceUrl: FLDOE_SOURCES.cpalmsAlg1.url,
    sourceLabel: 'CPALMS Algebra 1 (1200310)',
    consultedDate: CONSULTED_DATE,
  },
  'MA.912.AR.5.7': {
    code: 'MA.912.AR.5.7',
    courseId: 'algebra-2',
    strand: 'Algebraic Reasoning',
    description:
      'Solve and graph mathematical and real-world problems that are modeled with exponential functions. Interpret key features and determine constraints in terms of the context.',
    sourceUrl: FLDOE_SOURCES.cpalmsAlg2.url,
    sourceLabel: 'CPALMS Algebra 2 (1200330)',
    consultedDate: CONSULTED_DATE,
  },
  'MA.912.AR.6.5': {
    code: 'MA.912.AR.6.5',
    courseId: 'algebra-2',
    strand: 'Algebraic Reasoning',
    description:
      'Sketch a rough graph of a polynomial function of degree 3 or higher using zeros, multiplicity and knowledge of end behavior.',
    sourceUrl: FLDOE_SOURCES.cpalmsAlg2.url,
    sourceLabel: 'CPALMS Algebra 2 (1200330)',
    consultedDate: CONSULTED_DATE,
  },
  'MA.912.AR.8.2': {
    code: 'MA.912.AR.8.2',
    courseId: 'algebra-2',
    strand: 'Algebraic Reasoning',
    description:
      'Graph and determine key features of rational functions, including domain, range, intercepts, asymptotes and holes.',
    sourceUrl: FLDOE_SOURCES.cpalmsAlg2.url,
    sourceLabel: 'CPALMS Algebra 2 (1200330)',
    consultedDate: CONSULTED_DATE,
  },
  'MA.912.AR.9.4': {
    code: 'MA.912.AR.9.4',
    courseId: 'algebra-1',
    strand: 'Algebraic Reasoning',
    description: 'Graph the solution set of a system of two-variable linear inequalities.',
    sourceUrl: FLDOE_SOURCES.cpalmsAlg1.url,
    sourceLabel: 'CPALMS Algebra 1 (1200310)',
    consultedDate: CONSULTED_DATE,
  },
  'MA.912.AR.9.6': {
    code: 'MA.912.AR.9.6',
    courseId: 'algebra-1',
    strand: 'Algebraic Reasoning',
    description:
      'Given a real-world context, represent constraints as systems of linear equations or inequalities. Interpret solutions to problems as viable or non-viable options.',
    sourceUrl: FLDOE_SOURCES.cpalmsAlg1.url,
    sourceLabel: 'CPALMS Algebra 1 (1200310)',
    consultedDate: CONSULTED_DATE,
  },
  'MA.912.AR.10.2': {
    code: 'MA.912.AR.10.2',
    courseId: 'precalculus',
    strand: 'Algebraic Reasoning',
    description:
      'Given a mathematical or real-world context, write and solve problems involving geometric sequences and series, including infinite geometric series.',
    sourceUrl: FLDOE_SOURCES.cpalmsPrecalc.url,
    sourceLabel: 'CPALMS Pre-Calculus Honors (1202340)',
    consultedDate: CONSULTED_DATE,
  },

  // --- F: Functions ---
  'MA.912.F.1.1': {
    code: 'MA.912.F.1.1',
    courseId: 'algebra-1',
    strand: 'Functions',
    description:
      'Given an equation or graph that defines a function, classify the function type (linear, quadratic, exponential, absolute value, radical, rational, polynomial, logarithmic).',
    sourceUrl: FLDOE_SOURCES.cpalmsAlg1.url,
    sourceLabel: 'CPALMS Algebra 1 (1200310)',
    consultedDate: CONSULTED_DATE,
  },
  'MA.912.F.1.2': {
    code: 'MA.912.F.1.2',
    courseId: 'algebra-1',
    strand: 'Functions',
    description:
      'Given a function represented in function notation, evaluate the function for an input in its domain. For a real-world context, interpret the output.',
    sourceUrl: FLDOE_SOURCES.cpalmsAlg1.url,
    sourceLabel: 'CPALMS Algebra 1 (1200310)',
    consultedDate: CONSULTED_DATE,
  },
  'MA.912.F.1.3': {
    code: 'MA.912.F.1.3',
    courseId: 'algebra-1',
    strand: 'Functions',
    description:
      'Calculate and interpret the average rate of change of a real-world situation represented graphically, algebraically or in a table over a specified interval.',
    sourceUrl: FLDOE_SOURCES.cpalmsAlg1.url,
    sourceLabel: 'CPALMS Algebra 1 (1200310)',
    consultedDate: CONSULTED_DATE,
  },
  'MA.912.F.1.6': {
    code: 'MA.912.F.1.6',
    courseId: 'algebra-1',
    strand: 'Functions',
    description:
      'Compare key features of linear and nonlinear functions each represented algebraically, graphically, in tables or written descriptions.',
    sourceUrl: FLDOE_SOURCES.cpalmsAlg1.url,
    sourceLabel: 'CPALMS Algebra 1 (1200310)',
    consultedDate: CONSULTED_DATE,
  },
  'MA.912.F.1.8': {
    code: 'MA.912.F.1.8',
    courseId: 'algebra-1',
    strand: 'Functions',
    description:
      'Determine whether a linear, quadratic or exponential function best models a given real-world situation.',
    sourceUrl: FLDOE_SOURCES.cpalmsAlg1.url,
    sourceLabel: 'CPALMS Algebra 1 (1200310)',
    consultedDate: CONSULTED_DATE,
  },
  'MA.912.F.2.2': {
    code: 'MA.912.F.2.2',
    courseId: 'algebra-2',
    strand: 'Functions',
    description:
      'Identify the effect on the graph of a given function of two or more transformations defined by adding a real number to the x- or y-values or multiplying the x- or y-values by a real number.',
    sourceUrl: FLDOE_SOURCES.cpalmsAlg2.url,
    sourceLabel: 'CPALMS Algebra 2 (1200330)',
    consultedDate: CONSULTED_DATE,
  },
  'MA.912.F.3.2': {
    code: 'MA.912.F.3.2',
    courseId: 'algebra-2',
    strand: 'Functions',
    description:
      'Given a mathematical or real-world context, combine two or more functions using arithmetic operations and interpret key features.',
    sourceUrl: FLDOE_SOURCES.cpalmsAlg2.url,
    sourceLabel: 'CPALMS Algebra 2 (1200330)',
    consultedDate: CONSULTED_DATE,
  },
  'MA.912.F.3.4': {
    code: 'MA.912.F.3.4',
    courseId: 'algebra-2',
    strand: 'Functions',
    description:
      'Represent the composition of two functions algebraically or in a table. Determine the domain and range of the composite function.',
    sourceUrl: FLDOE_SOURCES.cpalmsAlg2.url,
    sourceLabel: 'CPALMS Algebra 2 (1200330)',
    consultedDate: CONSULTED_DATE,
  },
  'MA.912.F.3.6': {
    code: 'MA.912.F.3.6',
    courseId: 'algebra-2',
    strand: 'Functions',
    description:
      'Determine whether an inverse function exists by analyzing tables, graphs and equations.',
    sourceUrl: FLDOE_SOURCES.cpalmsAlg2.url,
    sourceLabel: 'CPALMS Algebra 2 (1200330)',
    consultedDate: CONSULTED_DATE,
  },

  // --- GR: Geometric Reasoning ---
  'MA.912.GR.2.2': {
    code: 'MA.912.GR.2.2',
    courseId: 'geometry',
    strand: 'Geometric Reasoning',
    description: 'Identify transformations that do or do not preserve distance.',
    clarification:
      'Distinguishes rigid isometries (translations, rotations, reflections) from non-rigid dilations and stretches.',
    sourceUrl: FLDOE_SOURCES.cpalmsGeom.url,
    sourceLabel: 'CPALMS Geometry (1206310)',
    consultedDate: CONSULTED_DATE,
  },
  'MA.912.GR.2.3': {
    code: 'MA.912.GR.2.3',
    courseId: 'geometry',
    strand: 'Geometric Reasoning',
    description:
      'Identify a sequence of transformations that will map a given figure onto itself or onto another congruent or similar figure.',
    sourceUrl: FLDOE_SOURCES.cpalmsGeom.url,
    sourceLabel: 'CPALMS Geometry (1206310)',
    consultedDate: CONSULTED_DATE,
  },
  'MA.912.GR.2.6': {
    code: 'MA.912.GR.2.6',
    courseId: 'geometry',
    strand: 'Geometric Reasoning',
    description:
      'Apply rigid transformations to map one figure onto another to justify that the two figures are congruent.',
    sourceUrl: FLDOE_SOURCES.cpalmsGeom.url,
    sourceLabel: 'CPALMS Geometry (1206310)',
    consultedDate: CONSULTED_DATE,
  },
  'MA.912.GR.2.8': {
    code: 'MA.912.GR.2.8',
    courseId: 'geometry',
    strand: 'Geometric Reasoning',
    description:
      'Apply an appropriate transformation to map one figure onto another to justify that the two figures are similar.',
    sourceUrl: FLDOE_SOURCES.cpalmsGeom.url,
    sourceLabel: 'CPALMS Geometry (1206310)',
    consultedDate: CONSULTED_DATE,
  },
  'MA.912.GR.3.1': {
    code: 'MA.912.GR.3.1',
    courseId: 'geometry',
    strand: 'Geometric Reasoning',
    description: 'Determine the weighted average of two or more points on a line.',
    clarification:
      'Includes partitioning directed line segments in a given ratio m:n and locating midpoints.',
    sourceUrl: FLDOE_SOURCES.cpalmsGeom.url,
    sourceLabel: 'CPALMS Geometry (1206310)',
    consultedDate: CONSULTED_DATE,
  },
  'MA.912.GR.3.2': {
    code: 'MA.912.GR.3.2',
    courseId: 'geometry',
    strand: 'Geometric Reasoning',
    description:
      'Given a mathematical context, use coordinate geometry to classify or justify definitions, properties and theorems involving circles, triangles or quadrilaterals.',
    sourceUrl: FLDOE_SOURCES.cpalmsGeom.url,
    sourceLabel: 'CPALMS Geometry (1206310)',
    consultedDate: CONSULTED_DATE,
  },
  'MA.912.GR.3.4': {
    code: 'MA.912.GR.3.4',
    courseId: 'geometry',
    strand: 'Geometric Reasoning',
    description:
      'Use coordinate geometry to solve mathematical and real-world problems on the coordinate plane involving perimeter or area of polygons.',
    sourceUrl: FLDOE_SOURCES.cpalmsGeom.url,
    sourceLabel: 'CPALMS Geometry (1206310)',
    consultedDate: CONSULTED_DATE,
  },
  'MA.912.GR.4.2': {
    code: 'MA.912.GR.4.2',
    courseId: 'geometry',
    strand: 'Geometric Reasoning',
    description:
      'Identify three-dimensional objects generated by rotations of two-dimensional figures.',
    sourceUrl: FLDOE_SOURCES.cpalmsGeom.url,
    sourceLabel: 'CPALMS Geometry (1206310)',
    consultedDate: CONSULTED_DATE,
  },
  'MA.912.GR.4.3': {
    code: 'MA.912.GR.4.3',
    courseId: 'geometry',
    strand: 'Geometric Reasoning',
    description:
      'Extend previous understanding of scale drawings and scale factors to determine how dilations affect the area of two-dimensional figures and the surface area or volume of three-dimensional figures.',
    sourceUrl: FLDOE_SOURCES.cpalmsGeom.url,
    sourceLabel: 'CPALMS Geometry (1206310)',
    consultedDate: CONSULTED_DATE,
  },
  'MA.912.GR.4.4': {
    code: 'MA.912.GR.4.4',
    courseId: 'geometry',
    strand: 'Geometric Reasoning',
    description:
      'Solve mathematical and real-world problems involving the area of two-dimensional figures.',
    sourceUrl: FLDOE_SOURCES.cpalmsGeom.url,
    sourceLabel: 'CPALMS Geometry (1206310)',
    consultedDate: CONSULTED_DATE,
  },
  'MA.912.GR.5.1': {
    code: 'MA.912.GR.5.1',
    courseId: 'geometry',
    strand: 'Geometric Reasoning',
    description: 'Construct a copy of a segment or angle.',
    sourceUrl: FLDOE_SOURCES.cpalmsGeom.url,
    sourceLabel: 'CPALMS Geometry (1206310)',
    consultedDate: CONSULTED_DATE,
  },
  'MA.912.GR.5.2': {
    code: 'MA.912.GR.5.2',
    courseId: 'geometry',
    strand: 'Geometric Reasoning',
    description:
      'Construct the bisector of a segment or the bisector of an angle, including the perpendicular bisector of a line segment.',
    sourceUrl: FLDOE_SOURCES.cpalmsGeom.url,
    sourceLabel: 'CPALMS Geometry (1206310)',
    consultedDate: CONSULTED_DATE,
  },
  'MA.912.GR.6.2': {
    code: 'MA.912.GR.6.2',
    courseId: 'geometry',
    strand: 'Geometric Reasoning',
    description:
      'Solve mathematical and real-world problems involving the measures of arcs and related angles.',
    clarification:
      'Includes central, inscribed, and interior/exterior chord-secant-tangent angles.',
    sourceUrl: FLDOE_SOURCES.cpalmsGeom.url,
    sourceLabel: 'CPALMS Geometry (1206310)',
    consultedDate: CONSULTED_DATE,
  },
  'MA.912.GR.6.3': {
    code: 'MA.912.GR.6.3',
    courseId: 'geometry',
    strand: 'Geometric Reasoning',
    description:
      'Solve mathematical and real-world problems involving triangles and quadrilaterals inscribed in a circle.',
    sourceUrl: FLDOE_SOURCES.cpalmsGeom.url,
    sourceLabel: 'CPALMS Geometry (1206310)',
    consultedDate: CONSULTED_DATE,
  },
  'MA.912.GR.7.2': {
    code: 'MA.912.GR.7.2',
    courseId: 'geometry',
    strand: 'Geometric Reasoning',
    description:
      'Given a mathematical or real-world context, derive and create the equation of a circle using key features.',
    sourceUrl: FLDOE_SOURCES.cpalmsGeom.url,
    sourceLabel: 'CPALMS Geometry (1206310)',
    consultedDate: CONSULTED_DATE,
  },
  'MA.912.GR.7.3': {
    code: 'MA.912.GR.7.3',
    courseId: 'geometry',
    strand: 'Geometric Reasoning',
    description:
      'Graph and solve mathematical and real-world problems that are modeled with an equation of a circle. Determine and interpret key features in terms of the context.',
    sourceUrl: FLDOE_SOURCES.cpalmsGeom.url,
    sourceLabel: 'CPALMS Geometry (1206310)',
    consultedDate: CONSULTED_DATE,
  },
  'MA.912.GR.7.4': {
    code: 'MA.912.GR.7.4',
    courseId: 'precalculus',
    strand: 'Geometric Reasoning',
    description:
      'Derive and create the equation of a parabola given its focus and directrix.',
    sourceUrl: FLDOE_SOURCES.cpalmsPrecalc.url,
    sourceLabel: 'CPALMS Pre-Calculus Honors (1202340)',
    consultedDate: CONSULTED_DATE,
  },
  'MA.912.GR.7.5': {
    code: 'MA.912.GR.7.5',
    courseId: 'precalculus',
    strand: 'Geometric Reasoning',
    description:
      'Graph and solve mathematical and real-world problems modeled with ellipses and hyperbolas; determine center, vertices, foci and asymptotes.',
    sourceUrl: FLDOE_SOURCES.cpalmsPrecalc.url,
    sourceLabel: 'CPALMS Pre-Calculus Honors (1202340)',
    consultedDate: CONSULTED_DATE,
  },

  // --- T: Trigonometry ---
  'MA.912.T.1.1': {
    code: 'MA.912.T.1.1',
    courseId: 'geometry',
    strand: 'Trigonometry',
    description: 'Define trigonometric ratios for acute angles in right triangles.',
    sourceUrl: FLDOE_SOURCES.cpalmsGeom.url,
    sourceLabel: 'CPALMS Geometry (1206310)',
    consultedDate: CONSULTED_DATE,
  },
  'MA.912.T.2.1': {
    code: 'MA.912.T.2.1',
    courseId: 'precalculus',
    strand: 'Trigonometry',
    description:
      'Define the trigonometric functions for any angle using right triangles drawn in the coordinate plane or the unit circle.',
    sourceUrl: FLDOE_SOURCES.cpalmsPrecalc.url,
    sourceLabel: 'CPALMS Pre-Calculus Honors (1202340)',
    consultedDate: CONSULTED_DATE,
  },
  'MA.912.T.3.3': {
    code: 'MA.912.T.3.3',
    courseId: 'precalculus',
    strand: 'Trigonometry',
    description:
      'Solve mathematical and real-world problems involving trigonometric equations and inverse trigonometric functions.',
    sourceUrl: FLDOE_SOURCES.cpalmsPrecalc.url,
    sourceLabel: 'CPALMS Pre-Calculus Honors (1202340)',
    consultedDate: CONSULTED_DATE,
  },
  'MA.912.T.4.1': {
    code: 'MA.912.T.4.1',
    courseId: 'precalculus',
    strand: 'Trigonometry & Polar Systems',
    description:
      'Define and plot polar coordinates and convert between polar and rectangular coordinates.',
    sourceUrl: FLDOE_SOURCES.cpalmsPrecalc.url,
    sourceLabel: 'CPALMS Pre-Calculus Honors (1202340)',
    consultedDate: CONSULTED_DATE,
  },

  // --- DP: Data Analysis & Probability ---
  'MA.912.DP.1.1': {
    code: 'MA.912.DP.1.1',
    courseId: 'algebra-1',
    strand: 'Data Analysis and Probability',
    description:
      'Given a set of data, select an appropriate method to represent the data, depending on whether it is numerical or categorical data and on whether it is univariate or bivariate.',
    sourceUrl: FLDOE_SOURCES.cpalmsAlg1.url,
    sourceLabel: 'CPALMS Algebra 1 (1200310)',
    consultedDate: CONSULTED_DATE,
  },
  'MA.912.DP.1.2': {
    code: 'MA.912.DP.1.2',
    courseId: 'algebra-1',
    strand: 'Data Analysis and Probability',
    description:
      'Interpret data distributions represented in various ways. State whether the data is numerical or categorical, whether it is univariate or bivariate and interpret the different components and quantities in the display.',
    sourceUrl: FLDOE_SOURCES.cpalmsAlg1.url,
    sourceLabel: 'CPALMS Algebra 1 (1200310)',
    consultedDate: CONSULTED_DATE,
  },
  'MA.912.DP.1.3': {
    code: 'MA.912.DP.1.3',
    courseId: 'algebra-1',
    strand: 'Data Analysis and Probability',
    description:
      'Explain the difference between correlation and causation in the contexts of both numerical and categorical data.',
    sourceUrl: FLDOE_SOURCES.cpalmsAlg1.url,
    sourceLabel: 'CPALMS Algebra 1 (1200310)',
    consultedDate: CONSULTED_DATE,
  },
  'MA.912.DP.2.6': {
    code: 'MA.912.DP.2.6',
    courseId: 'algebra-1',
    strand: 'Data Analysis and Probability',
    description:
      'Given a scatter plot with a line of fit and residuals, determine the strength and direction of the correlation. Interpret strength and direction within a real-world context.',
    sourceUrl: FLDOE_SOURCES.cpalmsAlg1.url,
    sourceLabel: 'CPALMS Algebra 1 (1200310)',
    consultedDate: CONSULTED_DATE,
  },
  'MA.912.DP.3.1': {
    code: 'MA.912.DP.3.1',
    courseId: 'algebra-1',
    strand: 'Data Analysis and Probability',
    description:
      'Construct a two-way frequency table summarizing bivariate categorical data. Interpret joint and marginal frequencies and determine possible associations in terms of a real-world context.',
    sourceUrl: FLDOE_SOURCES.cpalmsAlg1.url,
    sourceLabel: 'CPALMS Algebra 1 (1200310)',
    consultedDate: CONSULTED_DATE,
  },
  'MA.912.DP.4.1': {
    code: 'MA.912.DP.4.1',
    courseId: 'algebra-2',
    strand: 'Data Analysis and Probability',
    description:
      'Describe events as subsets of a sample space using characteristics or categories of the outcomes, or as unions, intersections or complements of other events.',
    sourceUrl: FLDOE_SOURCES.bestPdf.url,
    sourceLabel: 'Florida B.E.S.T. Mathematics Standards (PDF)',
    consultedDate: CONSULTED_DATE,
  },
  'MA.912.DP.4.2': {
    code: 'MA.912.DP.4.2',
    courseId: 'algebra-2',
    strand: 'Data Analysis and Probability',
    description:
      'Determine if events A and B are independent by calculating the product of their probabilities.',
    sourceUrl: FLDOE_SOURCES.bestPdf.url,
    sourceLabel: 'Florida B.E.S.T. Mathematics Standards (PDF)',
    consultedDate: CONSULTED_DATE,
  },
  'MA.912.DP.4.3': {
    code: 'MA.912.DP.4.3',
    courseId: 'algebra-2',
    strand: 'Data Analysis and Probability',
    description:
      'Calculate the conditional probability of two events and interpret the result in terms of its context using a two-way table or formula.',
    sourceUrl: FLDOE_SOURCES.bestPdf.url,
    sourceLabel: 'Florida B.E.S.T. Mathematics Standards (PDF)',
    consultedDate: CONSULTED_DATE,
  },

  // ================= MATHEMATICAL THINKING & REASONING (MTR) STANDARDS =================
  'MA.K12.MTR.1.1': {
    code: 'MA.K12.MTR.1.1',
    courseId: 'algebra-1',
    strand: 'Mathematical Thinking & Reasoning',
    description: 'Actively participate in effortful learning both individually and collectively.',
    clarification:
      'Analyze the problem in a way that makes sense, ask helpful questions, build perseverance by adapting methods, and collaborate productively.',
    sourceUrl: FLDOE_SOURCES.bestPdf.url,
    sourceLabel: 'Florida B.E.S.T. Mathematics Standards (MTR K–12)',
    consultedDate: CONSULTED_DATE,
  },
  'MA.K12.MTR.2.1': {
    code: 'MA.K12.MTR.2.1',
    courseId: 'algebra-1',
    strand: 'Mathematical Thinking & Reasoning',
    description: 'Demonstrate understanding by representing problems in multiple ways.',
    clarification:
      'Connect objects, drawings, tables, graphs, and algebraic equations; choose representations suited to the context.',
    sourceUrl: FLDOE_SOURCES.bestPdf.url,
    sourceLabel: 'Florida B.E.S.T. Mathematics Standards (MTR K–12)',
    consultedDate: CONSULTED_DATE,
  },
  'MA.K12.MTR.3.1': {
    code: 'MA.K12.MTR.3.1',
    courseId: 'algebra-1',
    strand: 'Mathematical Thinking & Reasoning',
    description: 'Complete tasks with mathematical fluency.',
    clarification:
      'Select efficient methods, maintain accuracy and flexibility, adapt procedures to new contexts, and refine efficiency from feedback.',
    sourceUrl: FLDOE_SOURCES.bestPdf.url,
    sourceLabel: 'Florida B.E.S.T. Mathematics Standards (MTR K–12)',
    consultedDate: CONSULTED_DATE,
  },
  'MA.K12.MTR.4.1': {
    code: 'MA.K12.MTR.4.1',
    courseId: 'algebra-1',
    strand: 'Mathematical Thinking & Reasoning',
    description: 'Engage in discussions that reflect on the mathematical thinking of self and others.',
    clarification:
      'Communicate ideas clearly, compare solution efficiency, diagnose errors, and justify reasoning logically.',
    sourceUrl: FLDOE_SOURCES.bestPdf.url,
    sourceLabel: 'Florida B.E.S.T. Mathematics Standards (MTR K–12)',
    consultedDate: CONSULTED_DATE,
  },
  'MA.K12.MTR.5.1': {
    code: 'MA.K12.MTR.5.1',
    courseId: 'algebra-1',
    strand: 'Mathematical Thinking & Reasoning',
    description: 'Use patterns and structure to help understand and connect mathematical concepts.',
    clarification:
      'Decompose complex systems into manageable sub-parts, identify structural invariants, and link new mathematics to prior knowledge.',
    sourceUrl: FLDOE_SOURCES.bestPdf.url,
    sourceLabel: 'Florida B.E.S.T. Mathematics Standards (MTR K–12)',
    consultedDate: CONSULTED_DATE,
  },
  'MA.K12.MTR.6.1': {
    code: 'MA.K12.MTR.6.1',
    courseId: 'algebra-1',
    strand: 'Mathematical Thinking & Reasoning',
    description: 'Assess the reasonableness of solutions.',
    clarification:
      'Estimate first, compare against benchmark quantities, reject extraneous values, and verify that answers fit real-world constraints.',
    sourceUrl: FLDOE_SOURCES.bestPdf.url,
    sourceLabel: 'Florida B.E.S.T. Mathematics Standards (MTR K–12)',
    consultedDate: CONSULTED_DATE,
  },
  'MA.K12.MTR.7.1': {
    code: 'MA.K12.MTR.7.1',
    courseId: 'algebra-1',
    strand: 'Mathematical Thinking & Reasoning',
    description: 'Apply mathematics to real-world contexts.',
    clarification:
      'Translate physical, engineering, financial, and scientific phenomena into mathematical models and iteratively refine accuracy.',
    sourceUrl: FLDOE_SOURCES.bestPdf.url,
    sourceLabel: 'Florida B.E.S.T. Mathematics Standards (MTR K–12)',
    consultedDate: CONSULTED_DATE,
  },
};
