import { useCallback, useEffect, useRef, useState } from 'react';
import { Pause, Play, RotateCcw } from 'lucide-react';
import { MathTex } from '../../components/MathTex';
import { ExtendedTopicId, renderExtendedTopic } from './extendedTopicRenderers';

export type TopicVisualId =
  | 'a1-expressions'
  | 'a1-linear'
  | 'a1-systems'
  | 'a1-inequalities'
  | 'a1-exponential'
  | 'g-triangles'
  | 'g-transformations'
  | 'g-right-trig'
  | 'g-circles'
  | 'g-coordinate'
  | 'a2-complex'
  | 'a2-polynomials'
  | 'a2-rational'
  | 'a2-probability'
  | 'pc-vectors'
  | 'pc-polar'
  | 'pc-conics'
  | 'pc-series'
  | 'pc-limits'
  | ExtendedTopicId;

export interface TopicVisualCanvasProps {
  topicId: TopicVisualId;
  compact?: boolean;
  heightClass?: string;
}

interface TopicMeta {
  badge: string;
  accent: string;
  p1Label: string;
  p1Min: number;
  p1Max: number;
  p1Step: number;
  p1Default: number;
  p2Label: string;
  p2Min: number;
  p2Max: number;
  p2Step: number;
  p2Default: number;
}

const TOPIC_META: Record<TopicVisualId, TopicMeta> = {
  'a1-expressions': {
    badge: 'Area Model Factorization · (x + p)(x + q)',
    accent: '#F4B956',
    p1Label: 'Term p',
    p1Min: 1,
    p1Max: 4,
    p1Step: 0.5,
    p1Default: 2,
    p2Label: 'Term q',
    p2Min: 1,
    p2Max: 4,
    p2Step: 0.5,
    p2Default: 3,
  },
  'a1-linear': {
    badge: 'Constant Slope & Secant Triangle · y = mx + b',
    accent: '#F4B956',
    p1Label: 'Slope m (Δy/Δx)',
    p1Min: -2.5,
    p1Max: 2.5,
    p1Step: 0.1,
    p1Default: 1.2,
    p2Label: 'Y-Intercept b',
    p2Min: -2.5,
    p2Max: 2.5,
    p2Step: 0.25,
    p2Default: -0.5,
  },
  'a1-systems': {
    badge: 'Simultaneous Linear System & Gaussian Pencil',
    accent: '#F4B956',
    p1Label: 'Line 1 Slope m₁',
    p1Min: 0.4,
    p1Max: 2.5,
    p1Step: 0.1,
    p1Default: 1.4,
    p2Label: 'Line 2 Slope m₂',
    p2Min: -2.5,
    p2Max: -0.3,
    p2Step: 0.1,
    p2Default: -0.8,
  },
  'a1-exponential': {
    badge: 'Exponential Cascade · f(x) = a · bˣ',
    accent: '#F4B956',
    p1Label: 'Initial Value a',
    p1Min: 0.5,
    p1Max: 2.5,
    p1Step: 0.1,
    p1Default: 1.0,
    p2Label: 'Growth Base b',
    p2Min: 0.45,
    p2Max: 2.4,
    p2Step: 0.05,
    p2Default: 1.75,
  },
  'g-triangles': {
    badge: 'Rigid-Motion Triangle Congruence (SAS / SSS)',
    accent: '#38D4FF',
    p1Label: 'Side a Scale',
    p1Min: 0.7,
    p1Max: 1.4,
    p1Step: 0.05,
    p1Default: 1.05,
    p2Label: 'Included Angle γ (deg)',
    p2Min: 35,
    p2Max: 115,
    p2Step: 5,
    p2Default: 65,
  },
  'g-right-trig': {
    badge: 'Pythagorean Visual Proof · a² + b² = c²',
    accent: '#38D4FF',
    p1Label: 'Leg a',
    p1Min: 2.0,
    p1Max: 5.5,
    p1Step: 0.25,
    p1Default: 3.0,
    p2Label: 'Leg b',
    p2Min: 2.0,
    p2Max: 5.5,
    p2Step: 0.25,
    p2Default: 4.0,
  },
  'g-circles': {
    badge: 'Inscribed Angle Invariance & Sweeping Sector',
    accent: '#38D4FF',
    p1Label: 'Central Arc 2θ (deg)',
    p1Min: 40,
    p1Max: 200,
    p1Step: 5,
    p1Default: 110,
    p2Label: 'Radius R',
    p2Min: 2.0,
    p2Max: 5.0,
    p2Step: 0.25,
    p2Default: 3.5,
  },
  'a2-complex': {
    badge: 'Complex Argand Plane & Euler Phase Rotation',
    accent: '#34E8A5',
    p1Label: 'Real Axis Shift h',
    p1Min: -2.0,
    p1Max: 2.0,
    p1Step: 0.2,
    p1Default: 1.0,
    p2Label: 'Discriminant Δ',
    p2Min: -6.0,
    p2Max: 4.0,
    p2Step: 0.25,
    p2Default: -4.0,
  },
  'a2-polynomials': {
    badge: 'Polynomial Root Multiplicity & Inflection Morph',
    accent: '#34E8A5',
    p1Label: 'Root r₂ Position',
    p1Min: -1.5,
    p1Max: 1.8,
    p1Step: 0.1,
    p1Default: 0.4,
    p2Label: 'Root r₂ Multiplicity m',
    p2Min: 1,
    p2Max: 3,
    p2Step: 1,
    p2Default: 2,
  },
  'a2-rational': {
    badge: 'Rational Poles & Asymptotic Limit Tracers',
    accent: '#34E8A5',
    p1Label: 'Vertical Pole x = p',
    p1Min: -2.0,
    p1Max: 2.0,
    p1Step: 0.2,
    p1Default: 0.6,
    p2Label: 'Horizontal Asymptote y = c',
    p2Min: -2.0,
    p2Max: 2.0,
    p2Step: 0.2,
    p2Default: 0.8,
  },
  'pc-vectors': {
    badge: '2×2 Matrix Linear Transformation & Determinant Area',
    accent: '#FF785A',
    p1Label: 'Horizontal Shear b',
    p1Min: -1.5,
    p1Max: 1.5,
    p1Step: 0.1,
    p1Default: 0.7,
    p2Label: 'Vertical Scale d',
    p2Min: 0.5,
    p2Max: 1.8,
    p2Step: 0.1,
    p2Default: 1.2,
  },
  'pc-series': {
    badge: 'Infinite Geometric Series & Square Subdivision Limit',
    accent: '#FF7A5C',
    p1Label: 'Common Ratio r',
    p1Min: 0.2,
    p1Max: 0.85,
    p1Step: 0.05,
    p1Default: 0.5,
    p2Label: 'Initial Term a₁',
    p2Min: 0.5,
    p2Max: 2.0,
    p2Step: 0.1,
    p2Default: 1.0,
  },
  'a1-inequalities': {
    badge: 'Two-Variable Inequalities & Feasible Half-Plane Shading',
    accent: '#F5BC5E',
    p1Label: 'Lower Bound Slope m₁',
    p1Min: -1.5,
    p1Max: 1.8,
    p1Step: 0.1,
    p1Default: 0.6,
    p2Label: 'Upper Ceiling b₂',
    p2Min: 0.2,
    p2Max: 2.8,
    p2Step: 0.1,
    p2Default: 1.8,
  },
  'g-transformations': {
    badge: 'Rigid Rotation, Reflection & Dilation Symmetry Trail',
    accent: '#38D9FF',
    p1Label: 'Rotation Sweep (deg)',
    p1Min: 30,
    p1Max: 180,
    p1Step: 5,
    p1Default: 120,
    p2Label: 'Dilation Scale k',
    p2Min: 0.6,
    p2Max: 1.6,
    p2Step: 0.05,
    p2Default: 1.25,
  },
  'g-coordinate': {
    badge: 'Coordinate Distance Norm, Midpoint & Perpendicular Bisector',
    accent: '#38D9FF',
    p1Label: 'Point B Radius',
    p1Min: 1.4,
    p1Max: 3.4,
    p1Step: 0.1,
    p1Default: 2.5,
    p2Label: 'Anchor A Shift x₁',
    p2Min: -2.8,
    p2Max: 0.5,
    p2Step: 0.1,
    p2Default: -1.6,
  },
  'a2-probability': {
    badge: 'Gaussian Normal Bell Curve · 68-95-99.7 Empirical Bands',
    accent: '#36EBA8',
    p1Label: 'Mean Center μ',
    p1Min: -1.5,
    p1Max: 1.5,
    p1Step: 0.1,
    p1Default: 0.0,
    p2Label: 'Std Deviation σ',
    p2Min: 0.55,
    p2Max: 1.8,
    p2Step: 0.05,
    p2Default: 1.0,
  },
  'pc-polar': {
    badge: 'Polar Coordinate Radar & Glowing Rose Petals r(θ) = a cos(nθ)',
    accent: '#FF7A5C',
    p1Label: 'Petal Frequency n',
    p1Min: 2,
    p1Max: 7,
    p1Step: 1,
    p1Default: 5,
    p2Label: 'Amplitude Scale a',
    p2Min: 1.2,
    p2Max: 2.8,
    p2Step: 0.1,
    p2Default: 2.3,
  },
  'pc-conics': {
    badge: 'Conic Sections · Ellipse Foci String (d₁ + d₂ = 2a) ↔ Hyperbola',
    accent: '#FF7A5C',
    p1Label: 'Eccentricity e',
    p1Min: 0.15,
    p1Max: 1.55,
    p1Step: 0.05,
    p1Default: 0.65,
    p2Label: 'Semi-Major Axis a',
    p2Min: 1.4,
    p2Max: 2.8,
    p2Step: 0.1,
    p2Default: 2.2,
  },
  'pc-limits': {
    badge: 'Differential Calculus Bridge · Secant → Instantaneous Tangent (h → 0)',
    accent: '#FF7A5C',
    p1Label: 'Anchor Point x₀',
    p1Min: -1.6,
    p1Max: 1.8,
    p1Step: 0.1,
    p1Default: 0.8,
    p2Label: 'Curvature Scale a',
    p2Min: 0.3,
    p2Max: 1.2,
    p2Step: 0.05,
    p2Default: 0.65,
  },
  'a1-abs-piecewise': {
    badge: 'Absolute Value V-Vertex & Distance Caliper · f(x) = a|x − h| + k',
    accent: '#F5BC5E',
    p1Label: 'Wing Slope a',
    p1Min: -2.2,
    p1Max: 2.2,
    p1Step: 0.1,
    p1Default: 1.2,
    p2Label: 'Horizontal Shift h',
    p2Min: -2.2,
    p2Max: 2.2,
    p2Step: 0.1,
    p2Default: 0.8,
  },
  'a1-radicals-exp': {
    badge: 'Radical Curve & Rational Exponents · y = a√(x − h)',
    accent: '#F5BC5E',
    p1Label: 'Vertical Stretch a',
    p1Min: 0.5,
    p1Max: 2.4,
    p1Step: 0.1,
    p1Default: 1.3,
    p2Label: 'Domain Wall h',
    p2Min: -2.4,
    p2Max: 1.4,
    p2Step: 0.1,
    p2Default: -1.2,
  },
  'a1-statistics': {
    badge: 'Least-Squares Linear Regression & Live Residual Error Squares',
    accent: '#F5BC5E',
    p1Label: 'Model Slope m',
    p1Min: 0.1,
    p1Max: 1.4,
    p1Step: 0.05,
    p1Default: 0.68,
    p2Label: 'Model Intercept b',
    p2Min: -1.0,
    p2Max: 1.6,
    p2Step: 0.05,
    p2Default: 0.45,
  },
  'g-parallel-angles': {
    badge: 'Parallel Rails Cut by Rotating Transversal · Angle Invariants',
    accent: '#38D9FF',
    p1Label: 'Transversal Base Angle (°)',
    p1Min: 35,
    p1Max: 145,
    p1Step: 1,
    p1Default: 62,
    p2Label: 'Parallel Spacing',
    p2Min: 0.8,
    p2Max: 1.4,
    p2Step: 0.1,
    p2Default: 1.0,
  },
  'g-similarity': {
    badge: 'Homothety Projection Rays · Perimeter (k) vs Area Scaling (k²)',
    accent: '#38D9FF',
    p1Label: 'Dilation Factor k',
    p1Min: 1.15,
    p1Max: 2.5,
    p1Step: 0.05,
    p1Default: 1.85,
    p2Label: 'Angle Preset',
    p2Min: 1,
    p2Max: 3,
    p2Step: 1,
    p2Default: 2,
  },
  'g-quadrilaterals': {
    badge: 'Quadrilateral Hierarchy Morph · Diagonals, Shear & 90° Symmetry',
    accent: '#38D9FF',
    p1Label: 'Parallelogram Shear',
    p1Min: 0,
    p1Max: 1.2,
    p1Step: 0.05,
    p1Default: 0.65,
    p2Label: 'Width Aspect Ratio',
    p2Min: 0.65,
    p2Max: 1.45,
    p2Step: 0.05,
    p2Default: 1.0,
  },
  'a2-quad-systems': {
    badge: 'Nonlinear System · Sweeping Secant/Tangent Intersections (Δ)',
    accent: '#36EBA8',
    p1Label: 'Line Slope m',
    p1Min: -1.8,
    p1Max: 1.8,
    p1Step: 0.1,
    p1Default: 0.6,
    p2Label: 'Line Intercept b',
    p2Min: -2.2,
    p2Max: 1.8,
    p2Step: 0.1,
    p2Default: -0.2,
  },
  'a2-radicals': {
    badge: 'Function Composition & Inverse Reflection Mirror Across y = x',
    accent: '#36EBA8',
    p1Label: 'Horizontal Shift h',
    p1Min: -1.4,
    p1Max: 1.2,
    p1Step: 0.1,
    p1Default: -0.4,
    p2Label: 'Vertical Shift k',
    p2Min: -1.4,
    p2Max: 1.2,
    p2Step: 0.1,
    p2Default: -0.6,
  },
  'a2-combinatorics': {
    badge: 'Pascal Binomial Lattice · Live Combinatorial Pathways C(n, k)',
    accent: '#36EBA8',
    p1Label: 'Binomial Power n',
    p1Min: 4,
    p1Max: 7,
    p1Step: 1,
    p1Default: 6,
    p2Label: 'Target Column k',
    p2Min: 0,
    p2Max: 6,
    p2Step: 1,
    p2Default: 3,
  },
  'pc-trig-identities': {
    badge: 'Pythagorean Wave Conservation · sin²θ + cos²θ ≡ 1 Live Stack',
    accent: '#FF7A5C',
    p1Label: 'Harmonic Frequency',
    p1Min: 0.8,
    p1Max: 2.5,
    p1Step: 0.1,
    p1Default: 1.4,
    p2Label: 'Phase Offset φ',
    p2Min: 0,
    p2Max: 3.14,
    p2Step: 0.1,
    p2Default: 0.5,
  },
  'pc-law-sines': {
    badge: 'Oblique Triangle Circumcircle · Constant Diameter 2R = a / sin(A)',
    accent: '#FF7A5C',
    p1Label: 'Vertex A Sweep',
    p1Min: 0.5,
    p1Max: 2.5,
    p1Step: 0.1,
    p1Default: 1.5,
    p2Label: 'Vertex C Arc',
    p2Min: 0.8,
    p2Max: 2.2,
    p2Step: 0.1,
    p2Default: 1.5,
  },
  'pc-parametric': {
    badge: 'Parametric Lissajous Orbit & Instantaneous Velocity Vector v(t)',
    accent: '#FF7A5C',
    p1Label: 'X-Frequency a',
    p1Min: 1,
    p1Max: 5,
    p1Step: 1,
    p1Default: 3,
    p2Label: 'Y-Frequency b',
    p2Min: 1,
    p2Max: 5,
    p2Step: 1,
    p2Default: 2,
  },
};

export function TopicVisualCanvas({
  topicId,
  compact = false,
  heightClass = 'h-[340px] sm:h-[390px]',
}: TopicVisualCanvasProps) {
  const meta = TOPIC_META[topicId];
  const [p1, setP1] = useState(meta.p1Default);
  const [p2, setP2] = useState(meta.p2Default);
  const [playing, setPlaying] = useState(true);

  useEffect(() => {
    const m = TOPIC_META[topicId];
    setP1(m.p1Default);
    setP2(m.p2Default);
  }, [topicId]);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const sizeRef = useRef({ width: 720, height: 360, dpr: 1 });
  const visibleRef = useRef(true);
  const timeRef = useRef(0);
  const stateRef = useRef({ topicId, p1, p2, playing });
  stateRef.current = { topicId, p1, p2, playing };

  const drawFrame = useCallback((advance: boolean) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height, dpr } = sizeRef.current;
    if (width < 50 || height < 50) return;

    if (advance) {
      timeRef.current += 0.018;
    }
    const t = timeRef.current;
    const { topicId: id, p1: v1, p2: v2 } = stateRef.current;

    ctx.save();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = '#05070C';
    ctx.fillRect(0, 0, width, height);

    const cx = width * 0.5;
    const cy = height * 0.52;
    if (renderExtendedTopic({ ctx, topicId: id, width, height, cx, cy, p1: v1, p2: v2, t })) {
      ctx.restore();
      return;
    }
    const unit = Math.min(width, height) * 0.095;

    // Subtle background grid
    ctx.strokeStyle = 'rgba(237, 235, 228, 0.055)';
    ctx.lineWidth = 1;
    for (let g = -10; g <= 10; g++) {
      const gx = cx + g * unit;
      const gy = cy - g * unit;
      if (gx >= 0 && gx <= width) {
        ctx.beginPath();
        ctx.moveTo(gx, 0);
        ctx.lineTo(gx, height);
        ctx.stroke();
      }
      if (gy >= 0 && gy <= height) {
        ctx.beginPath();
        ctx.moveTo(0, gy);
        ctx.lineTo(width, gy);
        ctx.stroke();
      }
    }

    // Smooth oscillation parameter u in [0, 1]
    const u = 0.5 - 0.5 * Math.cos(t * 1.45);

    // -------------------------------------------------------------------------
    // 1. A1-EXPRESSIONS: GEOMETRIC AREA MODEL (x + p)(x + q)
    // -------------------------------------------------------------------------
    if (id === 'a1-expressions') {
      const xLen = 3.2;
      const pLen = v1;
      const qLen = v2;
      const sc = Math.min(width, height) * 0.056;
      const gap = (1 - u) * 28;
      const totalW = (xLen + pLen) * sc + gap;
      const totalH = (xLen + qLen) * sc + gap;
      const ox = cx - totalW * 0.5;
      const oy = cy - totalH * 0.5;

      const wX = xLen * sc;
      const wP = pLen * sc;
      const hX = xLen * sc;
      const hQ = qLen * sc;

      const drawBlock = (
        bx: number,
        by: number,
        bw: number,
        bh: number,
        color: string,
        label: string
      ) => {
        ctx.fillStyle = `${color}28`;
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(bx, by, bw, bh, 4);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#F2F0E8';
        ctx.font = '600 12px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(label, bx + bw * 0.5, by + bh * 0.5);
      };

      drawBlock(ox, oy, wX, hX, '#F4B956', 'x²');
      drawBlock(ox + wX + gap, oy, wP, hX, '#38D4FF', `${pLen}x`);
      drawBlock(ox, oy + hX + gap, wX, hQ, '#34E8A5', `${qLen}x`);
      drawBlock(ox + wX + gap, oy + hX + gap, wP, hQ, '#FF785A', `${(pLen * qLen).toFixed(1)}`);

      // Outer dimension brackets
      ctx.fillStyle = '#A7B3C7';
      ctx.font = '11px "JetBrains Mono", monospace';
      ctx.fillText(`x + ${pLen}`, ox + (wX + gap + wP) * 0.5, oy - 12);
      ctx.fillText(`x + ${qLen}`, ox - 28, oy + (hX + gap + hQ) * 0.5);
    }

    // -------------------------------------------------------------------------
    // 2. A1-LINEAR: CONSTANT SLOPE & SECANT TRIANGLE
    // -------------------------------------------------------------------------
    if (id === 'a1-linear') {
      ctx.strokeStyle = 'rgba(237, 235, 228, 0.22)';
      ctx.beginPath();
      ctx.moveTo(0, cy);
      ctx.lineTo(width, cy);
      ctx.moveTo(cx, 0);
      ctx.lineTo(cx, height);
      ctx.stroke();

      const m = v1;
      const b = v2;
      const toPx = (x: number, y: number): [number, number] => [cx + x * unit, cy - y * unit];

      // Full line
      ctx.globalCompositeOperation = 'lighter';
      ctx.strokeStyle = '#F4B956';
      ctx.lineWidth = 2.6;
      const [x1, y1] = toPx(-6, m * -6 + b);
      const [x2, y2] = toPx(6, m * 6 + b);
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();

      // Animated sliding slope triangle of width dx = 1.5
      const tx = -2.2 + u * 3.0;
      const ty = m * tx + b;
      const dx = 1.5;
      const dy = m * dx;
      const [pA0, pA1] = toPx(tx, ty);
      const [pB0, pB1] = toPx(tx + dx, ty);
      const [pC0, pC1] = toPx(tx + dx, ty + dy);

      ctx.fillStyle = 'rgba(56, 212, 255, 0.16)';
      ctx.beginPath();
      ctx.moveTo(pA0, pA1);
      ctx.lineTo(pB0, pB1);
      ctx.lineTo(pC0, pC1);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = '#38D4FF';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(pA0, pA1);
      ctx.lineTo(pB0, pB1);
      ctx.stroke();

      ctx.strokeStyle = '#34E8A5';
      ctx.beginPath();
      ctx.moveTo(pB0, pB1);
      ctx.lineTo(pC0, pC1);
      ctx.stroke();

      ctx.globalCompositeOperation = 'source-over';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.fillStyle = '#38D4FF';
      ctx.fillText(`Δx = ${dx.toFixed(1)}`, (pA0 + pB0) * 0.5 - 18, pA1 + 14);
      ctx.fillStyle = '#34E8A5';
      ctx.fillText(`Δy = ${dy.toFixed(2)}`, pB0 + 8, (pB1 + pC1) * 0.5);

      // Y-intercept dot
      const [ix, iy] = toPx(0, b);
      ctx.fillStyle = '#FF785A';
      ctx.beginPath();
      ctx.arc(ix, iy, 5, 0, Math.PI * 2);
      ctx.fill();
    }

    // -------------------------------------------------------------------------
    // 3. A1-SYSTEMS: LINEAR SYSTEMS & GAUSSIAN ELIMINATION PENCIL
    // -------------------------------------------------------------------------
    if (id === 'a1-systems') {
      ctx.strokeStyle = 'rgba(237, 235, 228, 0.2)';
      ctx.beginPath();
      ctx.moveTo(0, cy);
      ctx.lineTo(width, cy);
      ctx.moveTo(cx, 0);
      ctx.lineTo(cx, height);
      ctx.stroke();

      const m1 = v1;
      const b1 = -0.8;
      const m2 = v2;
      const b2 = 1.4;
      const xStar = (b2 - b1) / (m1 - m2);
      const yStar = m1 * xStar + b1;
      const toPx = (x: number, y: number): [number, number] => [cx + x * unit, cy - y * unit];

      const drawLine = (m: number, b: number, color: string, widthPx = 2.4, dashed = false) => {
        if (dashed) ctx.setLineDash([6, 4]);
        ctx.strokeStyle = color;
        ctx.lineWidth = widthPx;
        const [lx1, ly1] = toPx(-6, m * -6 + b);
        const [lx2, ly2] = toPx(6, m * 6 + b);
        ctx.beginPath();
        ctx.moveTo(lx1, ly1);
        ctx.lineTo(lx2, ly2);
        ctx.stroke();
        ctx.setLineDash([]);
      };

      ctx.globalCompositeOperation = 'lighter';
      drawLine(m1, b1, '#F4B956');
      drawLine(m2, b2, '#38D4FF');

      // Animated linear combination (elimination line morphing to horizontal y = y*)
      const mComb = (1 - u) * m1 + u * 0;
      const bComb = yStar - mComb * xStar;
      drawLine(mComb, bComb, '#34E8A5', 1.8, true);

      const [sx, sy] = toPx(xStar, yStar);
      const halo = ctx.createRadialGradient(sx, sy, 1, sx, sy, 20);
      halo.addColorStop(0, '#FFFFFF');
      halo.addColorStop(0.4, '#34E8A5');
      halo.addColorStop(1, 'transparent');
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(sx, sy, 20, 0, Math.PI * 2);
      ctx.fill();

      ctx.globalCompositeOperation = 'source-over';
      ctx.font = '600 11px "JetBrains Mono", monospace';
      ctx.fillStyle = '#34E8A5';
      ctx.fillText(`(${xStar.toFixed(2)}, ${yStar.toFixed(2)})`, sx + 12, sy - 10);
    }

    // -------------------------------------------------------------------------
    // 4. A1-EXPONENTIAL: EXPONENTIAL GROWTH & VELOCITY VECTOR
    // -------------------------------------------------------------------------
    if (id === 'a1-exponential') {
      const baseY = height * 0.78;
      const toPx = (x: number, y: number): [number, number] => [cx + x * unit, baseY - y * unit * 0.75];

      ctx.strokeStyle = 'rgba(237, 235, 228, 0.22)';
      ctx.beginPath();
      ctx.moveTo(0, baseY);
      ctx.lineTo(width, baseY);
      ctx.moveTo(cx, 0);
      ctx.lineTo(cx, height);
      ctx.stroke();

      const a = v1;
      const b = v2;
      ctx.globalCompositeOperation = 'lighter';
      ctx.strokeStyle = '#F4B956';
      ctx.lineWidth = 2.6;
      ctx.beginPath();
      for (let i = 0; i <= 140; i++) {
        const x = -3.8 + (i / 140) * 7.2;
        const y = a * Math.pow(b, x);
        const [px, py] = toPx(x, y);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();

      // Animated tracer & discrete multiplier bars
      for (let k = -2; k <= 2; k++) {
        const yk = a * Math.pow(b, k);
        const [bx, by] = toPx(k, yk);
        ctx.strokeStyle = 'rgba(56, 212, 255, 0.38)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(bx, baseY);
        ctx.lineTo(bx, by);
        ctx.stroke();
      }

      const tx = -2.2 + u * 4.2;
      const ty = a * Math.pow(b, tx);
      const [px, py] = toPx(tx, ty);
      const glow = ctx.createRadialGradient(px, py, 1, px, py, 16);
      glow.addColorStop(0, '#FFFFFF');
      glow.addColorStop(0.4, '#F4B956');
      glow.addColorStop(1, 'transparent');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(px, py, 16, 0, Math.PI * 2);
      ctx.fill();
    }

    // -------------------------------------------------------------------------
    // 5. G-TRIANGLES: RIGID MOTION CONGRUENCE (TRANSLATION + ROTATION)
    // -------------------------------------------------------------------------
    if (id === 'g-triangles') {
      const scaleT = v1 * unit * 1.35;
      const angRad = (v2 * Math.PI) / 180;
      const localPts: [number, number][] = [
        [0, 0],
        [1.8, 0],
        [1.3 * Math.cos(angRad), 1.3 * Math.sin(angRad)],
      ];

      const drawTri = (
        ox: number,
        oy: number,
        rot: number,
        color: string,
        labelPrefix: string
      ) => {
        const c = Math.cos(rot);
        const s = Math.sin(rot);
        const pts = localPts.map(([lx, ly]) => [
          ox + (lx * c - ly * s) * scaleT,
          oy - (lx * s + ly * c) * scaleT,
        ]);

        ctx.fillStyle = `${color}22`;
        ctx.strokeStyle = color;
        ctx.lineWidth = 2.4;
        ctx.beginPath();
        ctx.moveTo(pts[0][0], pts[0][1]);
        ctx.lineTo(pts[1][0], pts[1][1]);
        ctx.lineTo(pts[2][0], pts[2][1]);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = color;
        ctx.font = '600 11px "JetBrains Mono", monospace';
        ['A', 'B', 'C'].forEach((ch, idx) => {
          ctx.fillText(`${ch}${labelPrefix}`, pts[idx][0] + 6, pts[idx][1] - 6);
        });
      };

      const targetX = cx + 45;
      const targetY = cy + 45;
      drawTri(targetX, targetY, 0.12, '#F4B956', '');

      // Animated pre-image gliding & rotating into exact superposition
      const startX = cx - 155;
      const startY = cy + 65;
      const curX = startX + (targetX - startX) * u;
      const curY = startY + (targetY - startY) * u;
      const curRot = -0.65 * (1 - u) + 0.12 * u;
      drawTri(curX, curY, curRot, '#38D4FF', '′');
    }

    // -------------------------------------------------------------------------
    // 6. G-RIGHT-TRIG: PYTHAGOREAN SLIDING-TILE VISUAL PROOF (a² + b² = c²)
    // -------------------------------------------------------------------------
    if (id === 'g-right-trig') {
      const a = v1;
      const b = v2;
      const c = Math.hypot(a, b);
      const total = a + b;
      const boxPx = Math.min(width * 0.44, height * 0.72);
      const sc = boxPx / total;
      const ox = (width < 520 ? cx : width * 0.34) - boxPx * 0.5;
      const oy = cy - boxPx * 0.5;

      // Outer (a+b) x (a+b) square
      ctx.fillStyle = 'rgba(244, 185, 86, 0.12)';
      ctx.strokeStyle = 'rgba(237, 235, 228, 0.4)';
      ctx.lineWidth = 2;
      ctx.strokeRect(ox, oy, boxPx, boxPx);
      ctx.fillRect(ox, oy, boxPx, boxPx);

      // Highlighted uncovered area (c² at u=0 morphing into a² + b² at u=1)
      if (u > 0.72) {
        const alpha = ((u - 0.72) / 0.28) * 0.35;
        ctx.fillStyle = `rgba(56, 212, 255, ${alpha.toFixed(2)})`;
        ctx.fillRect(ox + b * sc, oy, a * sc, a * sc);
        ctx.fillStyle = `rgba(52, 232, 165, ${alpha.toFixed(2)})`;
        ctx.fillRect(ox, oy + a * sc, b * sc, b * sc);
      }

      const drawRightTri = (pts: [number, number][]) => {
        ctx.fillStyle = 'rgba(18, 25, 39, 0.92)';
        ctx.strokeStyle = '#38D4FF';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(ox + pts[0][0] * sc, oy + pts[0][1] * sc);
        ctx.lineTo(ox + pts[1][0] * sc, oy + pts[1][1] * sc);
        ctx.lineTo(ox + pts[2][0] * sc, oy + pts[2][1] * sc);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      };

      const lerpPts = (p0: [number, number][], p1: [number, number][]): [number, number][] =>
        p0.map((pt, i) => [pt[0] + (p1[i][0] - pt[0]) * u, pt[1] + (p1[i][1] - pt[1]) * u]);

      // T1 (top-left stationary): (0,0)-(a,0)-(0,b) -> (0,0)-(b,0)-(0,a) wait: keep exact congruent orientations!
      // State u=0 (tilted c² square in center):
      // T1: (0,0), (a,0), (0,b)
      // T2: (a,0), (a+b,0), (a+b,a)
      // T3: (a+b,a), (a+b,a+b), (b,a+b)
      // T4: (0,b), (b,a+b), (0,a+b)
      // State u=1 (two rectangles a×b leaving a² top-left and b² bottom-right!):
      // Wait: T1 + T3 form top-right a×b rectangle if:
      // T1 stays at (0,0)-(a,0)-(0,b) and T3 translates by (-b, -a) from [(a+b,a),(a+b,a+b),(b,a+b)] to [(a,0),(a,b),(0,b)]!
      // And T2 translates left by (-a, 0)? No: T2 is (a,0)-(a+b,0)-(a+b,a) (legs b horizontal, a vertical);
      // T4 is (0,b)-(b,a+b)-(0,a+b) (legs b horizontal, a vertical) -> translate T4 right by (+a, -b) to [(a,0),(a+b,a),(a,a)]?
      // Even simpler exact translation proof:
      // Keep T1 at [(0,0), (a,0), (0,b)]
      // Slide T3 from [(a+b,a), (a+b,a+b), (b,a+b)] -> [(a,0), (a,b), (0,b)] (pure translation (-b, -a)!)
      // Slide T2 from [(a,0), (a+b,0), (a+b,a)] -> [(a,b), (a+b,b), (a+b,a+b)] (pure translation (0, +b)!)
      // Slide T4 from [(0,b), (b,a+b), (0,a+b)] -> [(a,b), (a+b,a+b), (a,a+b)] (pure translation (+a, 0)!)
      // Check uncovered squares at u=1:
      // Top-right [a..a+b] × [0..b] has area b × b = b²!
      // Bottom-left [0..a] × [b..a+b] has area a × a = a²!
      // Pure translations without even rotating a single triangle!!
      drawRightTri([
        [0, 0],
        [a, 0],
        [0, b],
      ]);
      drawRightTri(
        lerpPts(
          [
            [a + b, a],
            [a + b, a + b],
            [b, a + b],
          ],
          [
            [a, 0],
            [a, b],
            [0, b],
          ]
        )
      );
      drawRightTri(
        lerpPts(
          [
            [a, 0],
            [a + b, 0],
            [a + b, a],
          ],
          [
            [a, b],
            [a + b, b],
            [a + b, a + b],
          ]
        )
      );
      drawRightTri(
        lerpPts(
          [
            [0, b],
            [b, a + b],
            [0, a + b],
          ],
          [
            [a, b],
            [a + b, a + b],
            [a, a + b],
          ]
        )
      );

      // Area labels inside uncovered squares
      ctx.font = '600 13px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      if (u < 0.35) {
        ctx.fillStyle = '#F4B956';
        ctx.fillText(`c² = ${(c * c).toFixed(1)}`, ox + boxPx * 0.5, oy + boxPx * 0.5);
      } else if (u > 0.65) {
        ctx.fillStyle = '#34E8A5';
        ctx.fillText(`b²=${(b * b).toFixed(1)}`, ox + (a + b * 0.5) * sc, oy + b * 0.5 * sc);
        ctx.fillStyle = '#F4B956';
        ctx.fillText(`a²=${(a * a).toFixed(1)}`, ox + a * 0.5 * sc, oy + (b + a * 0.5) * sc);
      }

      // Right side trigonometric readout card on wide viewports
      if (width >= 520) {
        const rx = width * 0.72;
        const thetaDeg = ((Math.atan2(b, a) * 180) / Math.PI).toFixed(1);
        ctx.textAlign = 'left';
        ctx.font = '600 12px "JetBrains Mono", monospace';
        ctx.fillStyle = '#F4B956';
        ctx.fillText(`Hypotenuse c = ${c.toFixed(2)}`, rx - 70, cy - 45);
        ctx.fillStyle = '#38D4FF';
        ctx.fillText(`sin(${thetaDeg}°) = ${(b / c).toFixed(3)}`, rx - 70, cy - 15);
        ctx.fillStyle = '#34E8A5';
        ctx.fillText(`cos(${thetaDeg}°) = ${(a / c).toFixed(3)}`, rx - 70, cy + 15);
        ctx.fillStyle = '#FF785A';
        ctx.fillText(`tan(${thetaDeg}°) = ${(b / a).toFixed(3)}`, rx - 70, cy + 45);
      }
    }

    // -------------------------------------------------------------------------
    // 7. G-CIRCLES: INSCRIBED ANGLE INVARIANCE & SECTOR AREA
    // -------------------------------------------------------------------------
    if (id === 'g-circles') {
      const rPx = Math.min(width, height) * 0.32;
      const centralRad = (v1 * Math.PI) / 180;
      const a1 = -centralRad * 0.5;
      const a2 = centralRad * 0.5;

      // Sweeping sector fill
      ctx.fillStyle = 'rgba(56, 212, 255, 0.16)';
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, rPx, a1, a2);
      ctx.closePath();
      ctx.fill();

      // Main circle
      ctx.strokeStyle = '#38D4FF';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.arc(cx, cy, rPx, 0, Math.PI * 2);
      ctx.stroke();

      const ax = cx + rPx * Math.cos(a1);
      const ay = cy + rPx * Math.sin(a1);
      const bx = cx + rPx * Math.cos(a2);
      const by = cy + rPx * Math.sin(a2);

      // Orbiting inscribed vertex P on the major arc
      const pAng = Math.PI + (u - 0.5) * 1.4;
      const px = cx + rPx * Math.cos(pAng);
      const py = cy + rPx * Math.sin(pAng);

      // Central angle chords
      ctx.strokeStyle = '#F4B956';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(ax, ay);
      ctx.lineTo(cx, cy);
      ctx.lineTo(bx, by);
      ctx.stroke();

      // Inscribed angle chords
      ctx.strokeStyle = '#34E8A5';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(ax, ay);
      ctx.lineTo(px, py);
      ctx.lineTo(bx, by);
      ctx.stroke();

      ctx.fillStyle = '#34E8A5';
      ctx.font = '600 11px "JetBrains Mono", monospace';
      ctx.fillText(`Inscribed θ = ${(v1 * 0.5).toFixed(1)}°`, px - 45, py - 12);
      ctx.fillStyle = '#F4B956';
      ctx.fillText(`Central 2θ = ${v1.toFixed(0)}°`, cx + 10, cy + 4);
    }

    // -------------------------------------------------------------------------
    // 8. A2-COMPLEX: COMPLEX ARGAND PLANE & EULER PHASE ROTATION
    // -------------------------------------------------------------------------
    if (id === 'a2-complex') {
      ctx.strokeStyle = 'rgba(237, 235, 228, 0.22)';
      ctx.beginPath();
      ctx.moveTo(0, cy);
      ctx.lineTo(width, cy);
      ctx.moveTo(cx, 0);
      ctx.lineTo(cx, height);
      ctx.stroke();

      const h = v1;
      const delta = v2;
      const toPx = (re: number, im: number): [number, number] => [cx + re * unit, cy - im * unit];

      // Unit phase circle
      ctx.strokeStyle = 'rgba(52, 232, 165, 0.22)';
      ctx.beginPath();
      ctx.arc(cx, cy, unit * 2, 0, Math.PI * 2);
      ctx.stroke();

      // Rotating Euler phasor e^(i t)
      const [ex, ey] = toPx(2 * Math.cos(t * 1.4), 2 * Math.sin(t * 1.4));
      ctx.strokeStyle = 'rgba(56, 212, 255, 0.65)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(ex, ey);
      ctx.stroke();

      // Conjugate roots r = h ± sqrt(delta)/2
      const rootOffset = Math.sqrt(Math.abs(delta)) * 0.5;
      const r1: [number, number] = delta >= 0 ? [h + rootOffset, 0] : [h, rootOffset];
      const r2: [number, number] = delta >= 0 ? [h - rootOffset, 0] : [h, -rootOffset];

      for (const [re, im] of [r1, r2]) {
        const [rx, ry] = toPx(re, im);
        ctx.strokeStyle = delta >= 0 ? '#F4B956' : '#FF785A';
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(rx, ry);
        ctx.stroke();

        ctx.fillStyle = delta >= 0 ? '#F4B956' : '#FF785A';
        ctx.beginPath();
        ctx.arc(rx, ry, 6, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // -------------------------------------------------------------------------
    // 9. A2-POLYNOMIALS: ROOT MULTIPLICITY & INFLECTION MORPH
    // -------------------------------------------------------------------------
    if (id === 'a2-polynomials') {
      ctx.strokeStyle = 'rgba(237, 235, 228, 0.22)';
      ctx.beginPath();
      ctx.moveTo(0, cy);
      ctx.lineTo(width, cy);
      ctx.moveTo(cx, 0);
      ctx.lineTo(cx, height);
      ctx.stroke();

      const r1 = -2.0;
      const r2 = v1;
      const mult = Math.round(v2);
      const evalP = (x: number) => 0.28 * (x - r1) * Math.pow(x - r2, mult);
      const toPx = (x: number, y: number): [number, number] => [cx + x * unit, cy - y * unit];

      ctx.globalCompositeOperation = 'lighter';
      ctx.strokeStyle = '#34E8A5';
      ctx.lineWidth = 2.8;
      ctx.beginPath();
      for (let i = 0; i <= 180; i++) {
        const x = -3.6 + (i / 180) * 7.2;
        const y = evalP(x);
        const [px, py] = toPx(x, Math.max(-6, Math.min(6, y)));
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();

      // Animated tangent surfer
      const sxVal = -2.4 + u * 4.6;
      const syVal = evalP(sxVal);
      const [spx, spy] = toPx(sxVal, syVal);
      ctx.fillStyle = '#F4B956';
      ctx.beginPath();
      ctx.arc(spx, spy, 6, 0, Math.PI * 2);
      ctx.fill();

      // Root markers
      for (const [r, label] of [
        [r1, 'r₁ (m=1 cross)'],
        [r2, `r₂ (m=${mult})`],
      ] as [number, string][]) {
        const [rx, ry] = toPx(r, 0);
        ctx.fillStyle = '#38D4FF';
        ctx.beginPath();
        ctx.arc(rx, ry, 5.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.font = '10px "JetBrains Mono", monospace';
        ctx.fillText(label, rx - 24, ry + 18);
      }
    }

    // -------------------------------------------------------------------------
    // 10. A2-RATIONAL: POLES, ASYMPTOTES & LIMIT TRACERS
    // -------------------------------------------------------------------------
    if (id === 'a2-rational') {
      const p = v1;
      const c = v2;
      const toPx = (x: number, y: number): [number, number] => [cx + x * unit, cy - y * unit];

      // Axes
      ctx.strokeStyle = 'rgba(237, 235, 228, 0.18)';
      ctx.beginPath();
      ctx.moveTo(0, cy);
      ctx.lineTo(width, cy);
      ctx.moveTo(cx, 0);
      ctx.lineTo(cx, height);
      ctx.stroke();

      // Dashed asymptotes x = p and y = c
      const [pxAsym] = toPx(p, 0);
      const [, pyAsym] = toPx(0, c);
      ctx.setLineDash([6, 4]);
      ctx.strokeStyle = '#FF785A';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(pxAsym, 0);
      ctx.lineTo(pxAsym, height);
      ctx.stroke();

      ctx.strokeStyle = '#38D4FF';
      ctx.beginPath();
      ctx.moveTo(0, pyAsym);
      ctx.lineTo(width, pyAsym);
      ctx.stroke();
      ctx.setLineDash([]);

      // Two branches of f(x) = 1 / (x - p) + c
      const drawBranch = (xStart: number, xEnd: number) => {
        ctx.strokeStyle = '#34E8A5';
        ctx.lineWidth = 2.6;
        ctx.beginPath();
        for (let i = 0; i <= 90; i++) {
          const x = xStart + (i / 90) * (xEnd - xStart);
          const y = 1 / (x - p) + c;
          const [sx, sy] = toPx(x, Math.max(-8, Math.min(8, y)));
          if (i === 0) ctx.moveTo(sx, sy);
          else ctx.lineTo(sx, sy);
        }
        ctx.stroke();
      };
      drawBranch(p - 5, p - 0.18);
      drawBranch(p + 0.18, p + 5);

      // Animated limit tracers approaching pole x -> p⁻ and x -> p⁺
      const dist = 2.6 - u * 2.35;
      for (const sgn of [-1, 1]) {
        const lx = p + sgn * dist;
        const ly = 1 / (lx - p) + c;
        const [tx, ty] = toPx(lx, ly);
        ctx.fillStyle = '#F4B956';
        ctx.beginPath();
        ctx.arc(tx, ty, 5.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // -------------------------------------------------------------------------
    // 11. PC-VECTORS: 2x2 MATRIX LINEAR TRANSFORMATION & DETERMINANT AREA
    // -------------------------------------------------------------------------
    if (id === 'pc-vectors') {
      const m00 = 1.1;
      const m01 = v1 * u;
      const m10 = 0.25 * u;
      const m11 = 1 + (v2 - 1) * u;

      const toPx = (x: number, y: number): [number, number] => [
        cx + (m00 * x + m01 * y) * unit,
        cy - (m10 * x + m11 * y) * unit,
      ];

      // Warped lattice lines
      ctx.strokeStyle = 'rgba(255, 120, 90, 0.18)';
      ctx.lineWidth = 1;
      for (let g = -4; g <= 4; g++) {
        const [x1, y1] = toPx(g, -4);
        const [x2, y2] = toPx(g, 4);
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();

        const [hx1, hy1] = toPx(-4, g);
        const [hx2, hy2] = toPx(4, g);
        ctx.beginPath();
        ctx.moveTo(hx1, hy1);
        ctx.lineTo(hx2, hy2);
        ctx.stroke();
      }

      // Transformed unit square (parallelogram of area det(M))
      const [o0, o1] = toPx(0, 0);
      const [i0, i1] = toPx(1, 0);
      const [j0, j1] = toPx(0, 1);
      const [ij0, ij1] = toPx(1, 1);

      ctx.fillStyle = 'rgba(52, 232, 165, 0.24)';
      ctx.beginPath();
      ctx.moveTo(o0, o1);
      ctx.lineTo(i0, i1);
      ctx.lineTo(ij0, ij1);
      ctx.lineTo(j0, j1);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = '#38D4FF';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(o0, o1);
      ctx.lineTo(i0, i1);
      ctx.stroke();

      ctx.strokeStyle = '#F4B956';
      ctx.beginPath();
      ctx.moveTo(o0, o1);
      ctx.lineTo(j0, j1);
      ctx.stroke();
    }

    // -------------------------------------------------------------------------
    // 12. PC-SERIES: INFINITE GEOMETRIC SERIES & SQUARE SUBDIVISION
    // -------------------------------------------------------------------------
    if (id === 'pc-series') {
      const r = v1;
      const a1 = v2;
      const limit = a1 / (1 - r);
      const activeTerms = 2 + Math.floor(u * 10);

      // Left half: Partial Sums Staircase approaching L = a₁ / (1 - r)
      const leftX = 36;
      const plotW = width * 0.5 - 56;
      const baseY = height - 42;
      const maxH = height - 84;

      const limitY = baseY - Math.min(1, limit / 6) * maxH;
      ctx.setLineDash([5, 4]);
      ctx.strokeStyle = '#34E8A5';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(leftX, limitY);
      ctx.lineTo(leftX + plotW, limitY);
      ctx.stroke();
      ctx.setLineDash([]);

      let sum = 0;
      const barW = Math.max(10, plotW / 12 - 4);
      for (let n = 1; n <= 11; n++) {
        sum += a1 * Math.pow(r, n - 1);
        const bh = Math.min(1, sum / 6) * maxH;
        const bx = leftX + (n - 1) * (barW + 4);
        const by = baseY - bh;
        ctx.fillStyle = n <= activeTerms ? '#FF785A' : 'rgba(255, 120, 90, 0.22)';
        ctx.fillRect(bx, by, barW, bh);
      }

      // Right half: Geometric Unit-Square Subdivision (1/2 + 1/4 + 1/8 + 1/16...)
      const sqSize = Math.min(width * 0.36, height * 0.68);
      const sqX = width * 0.56;
      const sqY = cy - sqSize * 0.5;
      ctx.strokeStyle = 'rgba(237, 235, 228, 0.35)';
      ctx.lineWidth = 1.8;
      ctx.strokeRect(sqX, sqY, sqSize, sqSize);

      let rx = sqX;
      let ry = sqY;
      let rw = sqSize;
      let rh = sqSize;
      const colors = ['#FF785A', '#F4B956', '#34E8A5', '#38D4FF'];
      for (let k = 0; k < Math.min(activeTerms, 8); k++) {
        ctx.fillStyle = `${colors[k % 4]}44`;
        ctx.strokeStyle = colors[k % 4];
        ctx.lineWidth = 1.4;
        if (k % 2 === 0) {
          const halfW = rw * 0.5;
          ctx.fillRect(rx, ry, halfW, rh);
          ctx.strokeRect(rx, ry, halfW, rh);
          if (halfW > 26) {
            ctx.fillStyle = '#F2F0E8';
            ctx.font = '10px "JetBrains Mono", monospace';
            ctx.fillText(`1/${Math.pow(2, k + 1)}`, rx + 6, ry + 16);
          }
          rx += halfW;
          rw = halfW;
        } else {
          const halfH = rh * 0.5;
          ctx.fillRect(rx, ry, rw, halfH);
          ctx.strokeRect(rx, ry, rw, halfH);
          if (halfH > 22) {
            ctx.fillStyle = '#F2F0E8';
            ctx.font = '10px "JetBrains Mono", monospace';
            ctx.fillText(`1/${Math.pow(2, k + 1)}`, rx + 6, ry + 14);
          }
          ry += halfH;
          rh = halfH;
        }
      }
    }

    // -------------------------------------------------------------------------
    // 13. A1-INEQUALITIES: FEASIBLE HALF-PLANE POLYGON & LIVE TEST PROBE
    // -------------------------------------------------------------------------
    if (id === 'a1-inequalities') {
      const toPx = (x: number, y: number): [number, number] => [cx + x * unit, cy - y * unit];
      ctx.strokeStyle = 'rgba(237, 235, 228, 0.2)';
      ctx.beginPath();
      ctx.moveTo(0, cy);
      ctx.lineTo(width, cy);
      ctx.moveTo(cx, 0);
      ctx.lineTo(cx, height);
      ctx.stroke();

      const m1 = v1;
      const b1 = -0.8;
      const m2 = -0.45;
      const b2 = v2;

      // Shaded feasible wedge where y >= m1*x + b1 AND y <= m2*x + b2
      const xInter = (b2 - b1) / (m1 - m2 || 0.01);
      const yInter = m1 * xInter + b1;
      ctx.fillStyle = 'rgba(54, 235, 168, 0.16)';
      ctx.beginPath();
      const [ix, iy] = toPx(xInter, yInter);
      const leftX = -6.5;
      const [lx1, ly1] = toPx(leftX, m1 * leftX + b1);
      const [lx2, ly2] = toPx(leftX, m2 * leftX + b2);
      ctx.moveTo(ix, iy);
      ctx.lineTo(lx1, ly1);
      ctx.lineTo(lx2, ly2);
      ctx.closePath();
      ctx.fill();

      // Solid boundary line 1 (y >= m1*x + b1)
      ctx.strokeStyle = '#F5BC5E';
      ctx.lineWidth = 2.4;
      const [a1x, a1y] = toPx(-6, m1 * -6 + b1);
      const [a2x, a2y] = toPx(6, m1 * 6 + b1);
      ctx.beginPath();
      ctx.moveTo(a1x, a1y);
      ctx.lineTo(a2x, a2y);
      ctx.stroke();

      // Dashed strict boundary line 2 (y < m2*x + b2)
      ctx.setLineDash([7, 5]);
      ctx.strokeStyle = '#38D9FF';
      ctx.lineWidth = 2.2;
      const [b1x, b1y] = toPx(-6, m2 * -6 + b2);
      const [b2x, b2y] = toPx(6, m2 * 6 + b2);
      ctx.beginPath();
      ctx.moveTo(b1x, b1y);
      ctx.lineTo(b2x, b2y);
      ctx.stroke();
      ctx.setLineDash([]);

      // Orbiting test probe point (turns emerald inside feasible zone, coral outside)
      const pxMath = -1.2 + 2.4 * Math.cos(t * 0.9);
      const pyMath = 0.3 + 1.8 * Math.sin(t * 1.15);
      const valid = pyMath >= m1 * pxMath + b1 && pyMath < m2 * pxMath + b2;
      const [psx, psy] = toPx(pxMath, pyMath);
      const pCol = valid ? '#36EBA8' : '#FF7A5C';

      const halo = ctx.createRadialGradient(psx, psy, 2, psx, psy, 20);
      halo.addColorStop(0, pCol);
      halo.addColorStop(1, 'transparent');
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(psx, psy, 20, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(psx, psy, 4.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.font = '600 10.5px "JetBrains Mono", monospace';
      ctx.fillStyle = pCol;
      ctx.fillText(
        `Probe (${pxMath.toFixed(1)}, ${pyMath.toFixed(1)}) · ${valid ? 'FEASIBLE ✓' : 'OUTSIDE ✕'}`,
        psx + 12,
        psy - 8
      );
    }

    // -------------------------------------------------------------------------
    // 14. G-TRANSFORMATIONS: RIGID ROTATION, REFLECTION & DILATION TRAIL
    // -------------------------------------------------------------------------
    if (id === 'g-transformations') {
      const toPx = (x: number, y: number): [number, number] => [cx + x * unit, cy - y * unit];
      ctx.strokeStyle = 'rgba(237, 235, 228, 0.16)';
      ctx.beginPath();
      ctx.moveTo(0, cy);
      ctx.lineTo(width, cy);
      ctx.moveTo(cx, 0);
      ctx.lineTo(cx, height);
      ctx.stroke();

      // Mirror axis y = x
      ctx.setLineDash([5, 5]);
      ctx.strokeStyle = 'rgba(245, 188, 94, 0.45)';
      ctx.beginPath();
      const [m1x, m1y] = toPx(-4, -4);
      const [m2x, m2y] = toPx(4, 4);
      ctx.moveTo(m1x, m1y);
      ctx.lineTo(m2x, m2y);
      ctx.stroke();
      ctx.setLineDash([]);

      const shape: [number, number][] = [
        [0.8, 0.4],
        [2.3, 0.5],
        [1.6, 1.8],
        [0.6, 1.2],
      ];

      const drawPoly = (pts: [number, number][], stroke: string, fill: string, lw = 2) => {
        ctx.fillStyle = fill;
        ctx.strokeStyle = stroke;
        ctx.lineWidth = lw;
        ctx.beginPath();
        pts.forEach(([x, y], idx) => {
          const [sx, sy] = toPx(x, y);
          if (idx === 0) ctx.moveTo(sx, sy);
          else ctx.lineTo(sx, sy);
        });
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      };

      // Pre-image
      drawPoly(shape, '#F5BC5E', 'rgba(245, 188, 94, 0.14)', 2.2);

      // Reflected image across y = x
      const reflected = shape.map(([x, y]): [number, number] => [y, x]);
      drawPoly(reflected, 'rgba(54, 235, 168, 0.7)', 'rgba(54, 235, 168, 0.1)', 1.5);

      // Animated motion ghosts + rotated & dilated active image
      const maxAng = (v1 * Math.PI) / 180;
      for (let g = 1; g <= 5; g++) {
        const frac = (g / 5) * u;
        const ang = maxAng * frac;
        const kCur = 1 + (v2 - 1) * frac;
        const c = Math.cos(ang);
        const s = Math.sin(ang);
        const transformed = shape.map(([x, y]): [number, number] => [
          kCur * (x * c - y * s),
          kCur * (x * s + y * c),
        ]);
        drawPoly(
          transformed,
          g === 5 ? '#38D9FF' : `rgba(56, 217, 255, ${(0.08 + g * 0.08).toFixed(2)})`,
          g === 5 ? 'rgba(56, 217, 255, 0.22)' : 'transparent',
          g === 5 ? 2.4 : 1.1
        );
      }
    }

    // -------------------------------------------------------------------------
    // 15. G-COORDINATE: DISTANCE NORM, MIDPOINT & PERPENDICULAR BISECTOR
    // -------------------------------------------------------------------------
    if (id === 'g-coordinate') {
      const toPx = (x: number, y: number): [number, number] => [cx + x * unit, cy - y * unit];
      ctx.strokeStyle = 'rgba(237, 235, 228, 0.18)';
      ctx.beginPath();
      ctx.moveTo(0, cy);
      ctx.lineTo(width, cy);
      ctx.moveTo(cx, 0);
      ctx.lineTo(cx, height);
      ctx.stroke();

      const ax = v2;
      const ay = -0.9;
      const bx = v1 * Math.cos(t * 0.75);
      const by = v1 * Math.sin(t * 0.75);
      const mx = (ax + bx) * 0.5;
      const my = (ay + by) * 0.5;
      const dx = bx - ax;
      const dy = by - ay;
      const dist = Math.hypot(dx, dy);

      const [sax, say] = toPx(ax, ay);
      const [sbx, sby] = toPx(bx, by);
      const [scx, scy] = toPx(bx, ay);
      const [smx, smy] = toPx(mx, my);

      // Right-triangle legs Δx & Δy
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = '#F5BC5E';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(sax, say);
      ctx.lineTo(scx, scy);
      ctx.lineTo(sbx, sby);
      ctx.stroke();
      ctx.setLineDash([]);

      // Perpendicular bisector locus line
      const len = Math.max(0.01, dist);
      const nx = -dy / len;
      const ny = dx / len;
      const [p1x, p1y] = toPx(mx - nx * 4, my - ny * 4);
      const [p2x, p2y] = toPx(mx + nx * 4, my + ny * 4);
      ctx.strokeStyle = 'rgba(54, 235, 168, 0.55)';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(p1x, p1y);
      ctx.lineTo(p2x, p2y);
      ctx.stroke();

      // Main segment AB
      ctx.strokeStyle = '#38D9FF';
      ctx.lineWidth = 2.6;
      ctx.beginPath();
      ctx.moveTo(sax, say);
      ctx.lineTo(sbx, sby);
      ctx.stroke();

      for (const [px, py, col, lbl] of [
        [sax, say, '#F5BC5E', `A(${ax.toFixed(1)}, ${ay.toFixed(1)})`],
        [sbx, sby, '#38D9FF', `B(${bx.toFixed(1)}, ${by.toFixed(1)})`],
        [smx, smy, '#36EBA8', `M(${mx.toFixed(1)}, ${my.toFixed(1)})`],
      ] as [number, number, string, string][]) {
        ctx.fillStyle = col;
        ctx.beginPath();
        ctx.arc(px, py, 5.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.font = '600 10px "JetBrains Mono", monospace';
        ctx.fillText(lbl, px + 8, py - 8);
      }
    }

    // -------------------------------------------------------------------------
    // 16. A2-PROBABILITY: NORMAL BELL CURVE, EMPIRICAL BANDS & GALTON BINS
    // -------------------------------------------------------------------------
    if (id === 'a2-probability') {
      const mu = v1;
      const sigma = v2;
      const baseY = height - 52;
      const maxH = height - 108;
      const xScale = width * 0.11;
      const toPx = (x: number, pdf: number): [number, number] => [
        cx + x * xScale,
        baseY - Math.min(1, pdf / 0.78) * maxH,
      ];
      const gauss = (x: number) =>
        (1 / (sigma * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * ((x - mu) / sigma) ** 2);

      // Sweeping z-score shading from μ - z*σ to μ + z*σ
      const zSweep = 0.6 + u * 2.4;
      const fillBand = (zMax: number, color: string) => {
        ctx.fillStyle = color;
        ctx.beginPath();
        const xLeft = mu - zMax * sigma;
        const xRight = mu + zMax * sigma;
        const [slx] = toPx(xLeft, 0);
        ctx.moveTo(slx, baseY);
        for (let i = 0; i <= 70; i++) {
          const x = xLeft + (i / 70) * (xRight - xLeft);
          const [sx, sy] = toPx(x, gauss(x));
          ctx.lineTo(sx, sy);
        }
        const [srx] = toPx(xRight, 0);
        ctx.lineTo(srx, baseY);
        ctx.closePath();
        ctx.fill();
      };

      fillBand(Math.min(zSweep, 3), 'rgba(56, 217, 255, 0.14)');
      fillBand(Math.min(zSweep, 2), 'rgba(54, 235, 168, 0.18)');
      fillBand(Math.min(zSweep, 1), 'rgba(245, 188, 94, 0.24)');

      // Live stochastic histogram bars breathing beneath Gaussian density
      for (let b = -14; b <= 14; b++) {
        const bxMath = b * 0.32;
        const jitter = 0.88 + 0.16 * Math.sin(t * 2.4 + b * 1.7);
        const pdfVal = gauss(bxMath) * jitter;
        const [sx, sy] = toPx(bxMath, pdfVal);
        ctx.fillStyle = 'rgba(54, 235, 168, 0.26)';
        ctx.fillRect(sx - 5, sy, 10, baseY - sy);
      }

      // Glowing Normal Curve Outline
      ctx.globalCompositeOperation = 'lighter';
      ctx.strokeStyle = '#36EBA8';
      ctx.lineWidth = 2.8;
      ctx.beginPath();
      for (let i = 0; i <= 160; i++) {
        const x = -4.5 + (i / 160) * 9.0;
        const [sx, sy] = toPx(x, gauss(x));
        if (i === 0) ctx.moveTo(sx, sy);
        else ctx.lineTo(sx, sy);
      }
      ctx.stroke();

      ctx.globalCompositeOperation = 'source-over';
      ctx.font = '600 10.5px "JetBrains Mono", monospace';
      ctx.fillStyle = '#F5BC5E';
      ctx.textAlign = 'center';
      ctx.fillText(`±1σ: 68.3% · ±2σ: 95.4% · ±3σ: 99.7%`, cx, 24);
    }

    // -------------------------------------------------------------------------
    // 17. PC-POLAR: POLAR RADAR ARM & MULTI-PASS BLOOM ROSE CURVES
    // -------------------------------------------------------------------------
    if (id === 'pc-polar') {
      const n = Math.round(v1);
      const amp = v2;
      const rUnit = Math.min(width, height) * 0.145;

      // Polar radar rings & spokes
      ctx.strokeStyle = 'rgba(226, 232, 246, 0.08)';
      ctx.lineWidth = 1;
      for (let k = 1; k <= 3; k++) {
        ctx.beginPath();
        ctx.arc(cx, cy, k * rUnit, 0, Math.PI * 2);
        ctx.stroke();
      }
      for (let s = 0; s < 12; s++) {
        const ang = (s / 12) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(ang) * rUnit * 3.1, cy - Math.sin(ang) * rUnit * 3.1);
        ctx.stroke();
      }

      // Faint full rose blueprint
      ctx.strokeStyle = 'rgba(255, 122, 92, 0.22)';
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      for (let i = 0; i <= 360; i++) {
        const th = (i / 360) * Math.PI * 2;
        const r = amp * Math.cos(n * th) * rUnit;
        const px = cx + r * Math.cos(th);
        const py = cy - r * Math.sin(th);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();

      // Animated live traced petals with additive bloom
      const sweepMax = (t * 0.85) % (Math.PI * 2);
      ctx.globalCompositeOperation = 'lighter';
      ctx.beginPath();
      const steps = Math.max(12, Math.floor((sweepMax / (Math.PI * 2)) * 320));
      let tipX = cx;
      let tipY = cy;
      for (let i = 0; i <= steps; i++) {
        const th = (i / steps) * sweepMax;
        const r = amp * Math.cos(n * th) * rUnit;
        const px = cx + r * Math.cos(th);
        const py = cy - r * Math.sin(th);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
        tipX = px;
        tipY = py;
      }
      ctx.strokeStyle = 'rgba(255, 122, 92, 0.35)';
      ctx.lineWidth = 7;
      ctx.stroke();
      ctx.strokeStyle = '#FF7A5C';
      ctx.lineWidth = 2.4;
      ctx.stroke();

      // Rotating polar arm & glowing tip beacon
      ctx.strokeStyle = '#F5BC5E';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(tipX, tipY);
      ctx.stroke();

      const glow = ctx.createRadialGradient(tipX, tipY, 1, tipX, tipY, 18);
      glow.addColorStop(0, '#FFFFFF');
      glow.addColorStop(0.4, '#FF7A5C');
      glow.addColorStop(1, 'transparent');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(tipX, tipY, 18, 0, Math.PI * 2);
      ctx.fill();
    }

    // -------------------------------------------------------------------------
    // 18. PC-CONICS: ELLIPSE FOCI STRING (d1 + d2 = 2a) <-> HYPERBOLA
    // -------------------------------------------------------------------------
    if (id === 'pc-conics') {
      const e = v1;
      const a = v2;
      const cFocus = a * e;
      const toPx = (x: number, y: number): [number, number] => [cx + x * unit, cy - y * unit];

      ctx.strokeStyle = 'rgba(237, 235, 228, 0.16)';
      ctx.beginPath();
      ctx.moveTo(0, cy);
      ctx.lineTo(width, cy);
      ctx.moveTo(cx, 0);
      ctx.lineTo(cx, height);
      ctx.stroke();

      const [f1x, f1y] = toPx(-cFocus, 0);
      const [f2x, f2y] = toPx(cFocus, 0);

      if (e < 0.98) {
        // Ellipse: x²/a² + y²/b² = 1
        const b = a * Math.sqrt(Math.max(0.04, 1 - e * e));
        ctx.globalCompositeOperation = 'lighter';
        ctx.strokeStyle = '#FF7A5C';
        ctx.lineWidth = 2.6;
        ctx.beginPath();
        ctx.ellipse(cx, cy, a * unit, b * unit, 0, 0, Math.PI * 2);
        ctx.stroke();

        // Orbiting point P with glowing foci strings F1-P and F2-P proving d1 + d2 = 2a
        const px = a * Math.cos(t * 1.05);
        const py = b * Math.sin(t * 1.05);
        const [spx, spy] = toPx(px, py);

        ctx.strokeStyle = '#38D9FF';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(f1x, f1y);
        ctx.lineTo(spx, spy);
        ctx.stroke();

        ctx.strokeStyle = '#F5BC5E';
        ctx.beginPath();
        ctx.moveTo(f2x, f2y);
        ctx.lineTo(spx, spy);
        ctx.stroke();

        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(spx, spy, 5, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Hyperbola: x²/a² - y²/b² = 1 with dashed asymptotes y = ±(b/a)x
        const b = a * Math.sqrt(Math.max(0.08, e * e - 1));
        ctx.setLineDash([6, 5]);
        ctx.strokeStyle = 'rgba(56, 217, 255, 0.45)';
        ctx.lineWidth = 1.4;
        for (const sgn of [-1, 1]) {
          const [ax1, ay1] = toPx(-5, sgn * (b / a) * -5);
          const [ax2, ay2] = toPx(5, sgn * (b / a) * 5);
          ctx.beginPath();
          ctx.moveTo(ax1, ay1);
          ctx.lineTo(ax2, ay2);
          ctx.stroke();
        }
        ctx.setLineDash([]);

        ctx.globalCompositeOperation = 'lighter';
        ctx.strokeStyle = '#FF7A5C';
        ctx.lineWidth = 2.6;
        for (const branch of [-1, 1]) {
          ctx.beginPath();
          for (let i = 0; i <= 80; i++) {
            const tau = -1.6 + (i / 80) * 3.2;
            const x = branch * a * Math.cosh(tau);
            const y = b * Math.sinh(tau);
            const [sx, sy] = toPx(x, y);
            if (i === 0) ctx.moveTo(sx, sy);
            else ctx.lineTo(sx, sy);
          }
          ctx.stroke();
        }
      }

      ctx.globalCompositeOperation = 'source-over';
      for (const [fx, fy, lbl] of [
        [f1x, f1y, 'F₁'],
        [f2x, f2y, 'F₂'],
      ] as [number, number, string][]) {
        ctx.fillStyle = '#36EBA8';
        ctx.beginPath();
        ctx.arc(fx, fy, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.font = '600 10px "JetBrains Mono", monospace';
        ctx.fillText(lbl, fx - 5, fy + 16);
      }
    }

    // -------------------------------------------------------------------------
    // 19. PC-LIMITS: SECANT -> INSTANTANEOUS TANGENT DERIVATIVE (h -> 0)
    // -------------------------------------------------------------------------
    if (id === 'pc-limits') {
      const x0 = v1;
      const a = v2;
      const fn = (x: number) => a * x * x - 1.2;
      const dfn = (x: number) => 2 * a * x;
      const toPx = (x: number, y: number): [number, number] => [cx + x * unit, cy - y * unit];

      ctx.strokeStyle = 'rgba(237, 235, 228, 0.18)';
      ctx.beginPath();
      ctx.moveTo(0, cy);
      ctx.lineTo(width, cy);
      ctx.moveTo(cx, 0);
      ctx.lineTo(cx, height);
      ctx.stroke();

      // Curve f(x) = a*x² - 1.2
      ctx.globalCompositeOperation = 'lighter';
      ctx.strokeStyle = '#38D9FF';
      ctx.lineWidth = 2.6;
      ctx.beginPath();
      for (let i = 0; i <= 140; i++) {
        const x = -3.8 + (i / 140) * 7.6;
        const [sx, sy] = toPx(x, fn(x));
        if (i === 0) ctx.moveTo(sx, sy);
        else ctx.lineTo(sx, sy);
      }
      ctx.stroke();

      // True instantaneous tangent line at x0
      const y0 = fn(x0);
      const mTan = dfn(x0);
      ctx.setLineDash([5, 5]);
      ctx.strokeStyle = 'rgba(54, 235, 168, 0.55)';
      ctx.lineWidth = 1.6;
      const [t1x, t1y] = toPx(x0 - 3, y0 - 3 * mTan);
      const [t2x, t2y] = toPx(x0 + 3, y0 + 3 * mTan);
      ctx.beginPath();
      ctx.moveTo(t1x, t1y);
      ctx.lineTo(t2x, t2y);
      ctx.stroke();
      ctx.setLineDash([]);

      // Animated secant step h(t) shrinking from 2.2 -> 0.04
      const hStep = 0.04 + (1 - u) * 2.15;
      const x1 = x0 + hStep;
      const y1 = fn(x1);
      const mSec = (y1 - y0) / hStep;

      ctx.strokeStyle = '#FF7A5C';
      ctx.lineWidth = 2.4;
      const [s1x, s1y] = toPx(x0 - 2.6, y0 - 2.6 * mSec);
      const [s2x, s2y] = toPx(x0 + 3.2, y0 + 3.2 * mSec);
      ctx.beginPath();
      ctx.moveTo(s1x, s1y);
      ctx.lineTo(s2x, s2y);
      ctx.stroke();

      const [p0x, p0y] = toPx(x0, y0);
      const [p1x, p1y] = toPx(x1, y1);
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = '#36EBA8';
      ctx.beginPath();
      ctx.arc(p0x, p0y, 5.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#F5BC5E';
      ctx.beginPath();
      ctx.arc(p1x, p1y, 5.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.font = '600 10.5px "JetBrains Mono", monospace';
      ctx.fillStyle = '#F5BC5E';
      ctx.fillText(`h = ${hStep.toFixed(2)} · Secant m = ${mSec.toFixed(2)} → f′(${x0.toFixed(1)}) = ${mTan.toFixed(2)}`, 16, 24);
    }

    ctx.restore();
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const updateSize = () => {
      const rect = container.getBoundingClientRect();
      const width = Math.max(240, Math.floor(rect.width));
      const height = Math.max(200, Math.floor(rect.height));
      const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      sizeRef.current = { width, height, dpr };
      drawFrame(false);
    };
    updateSize();
    const ro = new ResizeObserver(updateSize);
    ro.observe(container);

    const io = new IntersectionObserver(
      (entries) => {
        visibleRef.current = entries.some((e) => e.isIntersecting);
      },
      { threshold: 0.05 }
    );
    io.observe(container);

    return () => {
      ro.disconnect();
      io.disconnect();
    };
  }, [drawFrame]);

  useEffect(() => {
    drawFrame(false);
  }, [topicId, p1, p2, drawFrame]);

  useEffect(() => {
    let raf = 0;
    const tick = () => {
      if (visibleRef.current && !document.hidden && stateRef.current.playing) {
        drawFrame(true);
      }
      raf = window.requestAnimationFrame(tick);
    };
    raf = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(raf);
  }, [drawFrame]);

  const formulaTex = (() => {
    switch (topicId) {
      case 'a1-expressions':
        return `(x + ${p1})(x + ${p2}) = x^2 + ${(p1 + p2).toFixed(1)}x + ${(p1 * p2).toFixed(1)}`;
      case 'a1-linear':
        return `y = ${p1.toFixed(2)}x ${p2 >= 0 ? '+' : '-'} ${Math.abs(p2).toFixed(2)}`;
      case 'a1-systems':
        return `L_1: y = ${p1.toFixed(1)}x - 0.8, \\quad L_2: y = ${p2.toFixed(1)}x + 1.4`;
      case 'a1-exponential':
        return `f(x) = ${p1.toFixed(1)} \\cdot (${p2.toFixed(2)})^x`;
      case 'g-triangles':
        return `\\triangle ABC \\cong \\triangle A'B'C' \\quad (\\text{SAS}: \\gamma = ${p2.toFixed(0)}^\\circ)`;
      case 'g-right-trig':
        return `${p1.toFixed(2)}^2 + ${p2.toFixed(2)}^2 = ${(p1 * p1 + p2 * p2).toFixed(2)} = c^2`;
      case 'g-circles':
        return `\\theta_{\\text{inscribed}} = \\tfrac{1}{2}(${p1.toFixed(0)}^\\circ) = ${(p1 * 0.5).toFixed(1)}^\\circ`;
      case 'a2-complex':
        return `\\Delta = ${p2.toFixed(2)} \\implies r_{1,2} = ${p1.toFixed(1)} \\pm ${(Math.sqrt(Math.abs(p2)) * 0.5).toFixed(2)}${p2 < 0 ? 'i' : ''}`;
      case 'a2-polynomials':
        return `P(x) = 0.28(x + 2)(x - ${p1.toFixed(1)})^${Math.round(p2)}`;
      case 'a2-rational':
        return `f(x) = \\dfrac{1}{x - ${p1.toFixed(1)}} + ${p2.toFixed(1)}`;
      case 'pc-vectors':
        return `\\det(M) = (1.1)(${p2.toFixed(1)}) - (0.25)(${p1.toFixed(1)}) = ${(1.1 * p2 - 0.25 * p1).toFixed(2)}`;
      case 'pc-series':
        return `S_\\infty = \\sum_{n=1}^{\\infty} ${p2.toFixed(1)}(${p1.toFixed(2)})^{n-1} = \\dfrac{${p2.toFixed(1)}}{1 - ${p1.toFixed(2)}} = ${(p2 / (1 - p1)).toFixed(2)}`;
      case 'a1-inequalities':
        return `y \\ge ${p1.toFixed(1)}x - 0.8 \\;\\land\\; y < -0.45x + ${p2.toFixed(1)}`;
      case 'g-transformations':
        return `T(x,y) = ${p2.toFixed(2)}\\,R_{${p1.toFixed(0)}^\\circ}(x, y)`;
      case 'g-coordinate':
        return `d(A,B) = \\sqrt{(x_2 - ${p2.toFixed(1)})^2 + (y_2 + 0.9)^2}`;
      case 'a2-probability':
        return `X \\sim \\mathcal{N}(\\mu = ${p1.toFixed(1)},\\; \\sigma = ${p2.toFixed(2)})`;
      case 'pc-polar':
        return `r(\\theta) = ${p2.toFixed(1)}\\cos(${Math.round(p1)}\\theta) \\;\\cdot\\; ${Math.round(p1) % 2 === 1 ? Math.round(p1) : Math.round(p1) * 2}\\text{ petals}`;
      case 'pc-conics':
        return p1 < 0.98
          ? `\\text{Ellipse } (e=${p1.toFixed(2)}):\\; d_1 + d_2 = 2a = ${(2 * p2).toFixed(1)}`
          : `\\text{Hyperbola } (e=${p1.toFixed(2)}):\\; |d_1 - d_2| = ${(2 * p2).toFixed(1)}`;
      case 'pc-limits':
        return `f'(${p1.toFixed(1)}) = \\lim_{h \\to 0}\\dfrac{f(${p1.toFixed(1)}+h)-f(${p1.toFixed(1)})}{h} = ${(2 * p2 * p1).toFixed(2)}`;
      case 'a1-abs-piecewise':
        return `f(x) = ${p1.toFixed(1)}|x ${p2 >= 0 ? '-' : '+'} ${Math.abs(p2).toFixed(1)}| + k`;
      case 'a1-radicals-exp':
        return `f(x) = ${p1.toFixed(1)}\\sqrt{x ${p2 >= 0 ? '-' : '+'} ${Math.abs(p2).toFixed(1)}} \\quad (x \\ge ${p2.toFixed(1)})`;
      case 'a1-statistics':
        return `\\hat{y} = ${p1.toFixed(2)}x ${p2 >= 0 ? '+' : '-'} ${Math.abs(p2).toFixed(2)}, \\quad e_i = y_i - \\hat{y}_i`;
      case 'g-parallel-angles':
        return `\\ell_1 \\parallel \\ell_2 \\implies \\alpha \\cong \\alpha', \\quad \\alpha + \\beta = 180^\\circ`;
      case 'g-similarity':
        return `\\triangle ABC \\sim \\triangle A'B'C' \\implies \\dfrac{\\text{Area}'}{\\text{Area}} = (${p1.toFixed(2)})^2 = ${(p1 * p1).toFixed(2)}`;
      case 'g-quadrilaterals':
        return `\\Sigma\\angle = (4 - 2)\\cdot 180^\\circ = 360^\\circ, \\quad \\text{shear} = ${p1.toFixed(2)}`;
      case 'a2-quad-systems':
        return `y = 0.55x^2 - 1.6 \\;\\cap\\; y = ${p1.toFixed(1)}x ${p2 >= 0 ? '+' : '-'} ${Math.abs(p2).toFixed(1)}`;
      case 'a2-radicals':
        return `(f \\circ f^{-1})(x) = x \\quad \\text{across mirror } y = x`;
      case 'a2-combinatorics':
        return `(a + b)^{${Math.round(p1)}} = \\sum_{k=0}^{${Math.round(p1)}} \\binom{${Math.round(p1)}}{k} a^{${Math.round(p1)}-k} b^k`;
      case 'pc-trig-identities':
        return `\\sin^2(${p1.toFixed(1)}\\theta + ${p2.toFixed(1)}) + \\cos^2(${p1.toFixed(1)}\\theta + ${p2.toFixed(1)}) \\equiv 1`;
      case 'pc-law-sines':
        return `\\dfrac{a}{\\sin A} = \\dfrac{b}{\\sin B} = \\dfrac{c}{\\sin C} = 2R`;
      case 'pc-parametric':
        return `x(t) = A\\sin(${Math.round(p1)}t + \\delta),\\quad y(t) = B\\sin(${Math.round(p2)}t)`;
    }
  })();

  return (
    <div className="instrument-frame fiducial-frame overflow-hidden">
      <div className="px-4 py-2.5 border-b hairline-rule bg-[#080C15]/90 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: meta.accent, boxShadow: `0 0 10px ${meta.accent}` }}
          />
          <span className="font-mono-data text-[10px] uppercase tracking-[0.16em] text-[#A7B3C7]">
            {meta.badge}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setPlaying((p) => !p)}
            aria-label={playing ? 'Pause animation' : 'Play animation'}
            className="p-1.5 rounded border border-[rgba(237,235,228,0.16)] text-[#F2F0E8]"
          >
            {playing ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>
          <button
            type="button"
            onClick={() => {
              setP1(meta.p1Default);
              setP2(meta.p2Default);
              timeRef.current = 0;
            }}
            aria-label="Reset parameters"
            className="p-1.5 rounded border border-[rgba(237,235,228,0.16)] text-[#A7B3C7] hover:text-[#F2F0E8]"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div ref={containerRef} className={`relative w-full ${heightClass} bg-[#05070C]`}>
        <canvas ref={canvasRef} className="block w-full h-full" />
        <div className="pointer-events-none absolute bottom-3 left-3 obsidian-glass rounded px-3 py-1.5 text-xs">
          <MathTex tex={formulaTex} className="text-[#F2F0E8]" />
        </div>
      </div>

      {!compact && (
        <div className="px-4 py-3 border-t hairline-rule bg-[#080C15]/95 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <label className="space-y-1">
            <span className="flex justify-between font-mono-data text-[10px] text-[#A7B3C7]">
              <span>{meta.p1Label}</span>
              <span style={{ color: meta.accent }}>{p1.toFixed(2)}</span>
            </span>
            <input
              type="range"
              min={meta.p1Min}
              max={meta.p1Max}
              step={meta.p1Step}
              value={p1}
              onChange={(e) => setP1(Number(e.target.value))}
              className="meridian-slider"
              style={{ ['--slider-accent' as string]: meta.accent }}
            />
          </label>

          <label className="space-y-1">
            <span className="flex justify-between font-mono-data text-[10px] text-[#A7B3C7]">
              <span>{meta.p2Label}</span>
              <span className="text-[#38D4FF]">{p2.toFixed(2)}</span>
            </span>
            <input
              type="range"
              min={meta.p2Min}
              max={meta.p2Max}
              step={meta.p2Step}
              value={p2}
              onChange={(e) => setP2(Number(e.target.value))}
              className="meridian-slider"
              style={{ ['--slider-accent' as string]: '#38D4FF' }}
            />
          </label>
        </div>
      )}
    </div>
  );
}
