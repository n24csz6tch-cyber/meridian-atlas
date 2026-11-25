import { useCallback, useEffect, useRef, useState } from 'react';
import { Droplets, Pause, Play, RotateCcw } from 'lucide-react';
import { MathTex } from '../../components/MathTex';
import { useReducedMotion } from '../../hooks/useReducedMotion';

export interface PythagorasFluidProofProps {
  compact?: boolean;
  heightClass?: string;
}

interface Pt2 {
  x: number;
  y: number;
}

interface BubbleParticle {
  u: number;
  v: number;
  speed: number;
  radius: number;
  phase: number;
}

interface TrianglePreset {
  id: string;
  label: string;
  a: number;
  b: number;
}

const TRIANGLE_PRESETS: TrianglePreset[] = [
  { id: '3-4-5', label: '3 : 4 : 5', a: 3, b: 4 },
  { id: 'equal', label: '4 : 4 Iso', a: 4, b: 4 },
  { id: '2-5', label: '2 : 5 Slim', a: 2, b: 5 },
  { id: '5-6', label: '5 : 6 Wide', a: 5, b: 6 },
];

function createParticles(count: number): BubbleParticle[] {
  const arr: BubbleParticle[] = [];
  for (let i = 0; i < count; i++) {
    // Deterministic spread without runtime Math.random drift
    const s1 = ((i * 73 + 19) % 97) / 97;
    const s2 = ((i * 41 + 53) % 89) / 89;
    const s3 = ((i * 29 + 11) % 79) / 79;
    arr.push({
      u: 0.08 + 0.84 * s1,
      v: s2,
      speed: 0.16 + 0.24 * s3,
      radius: 1.4 + 1.8 * ((i % 4) / 3),
      phase: s1 * Math.PI * 2,
    });
  }
  return arr;
}

function polygonArea(poly: Pt2[]): number {
  if (poly.length < 3) return 0;
  let sum = 0;
  for (let i = 0; i < poly.length; i++) {
    const p0 = poly[i];
    const p1 = poly[(i + 1) % poly.length];
    sum += p0.x * p1.y - p1.x * p0.y;
  }
  return Math.abs(sum) * 0.5;
}

function clipPolygonBelowY(poly: Pt2[], yCut: number): Pt2[] {
  const out: Pt2[] = [];
  const n = poly.length;
  for (let i = 0; i < n; i++) {
    const a = poly[i];
    const b = poly[(i + 1) % n];
    const aIn = a.y <= yCut;
    const bIn = b.y <= yCut;
    if (aIn && bIn) {
      out.push(b);
    } else if (aIn && !bIn) {
      const t = (yCut - a.y) / (b.y - a.y);
      out.push({ x: a.x + (b.x - a.x) * t, y: yCut });
    } else if (!aIn && bIn) {
      const t = (yCut - a.y) / (b.y - a.y);
      out.push({ x: a.x + (b.x - a.x) * t, y: yCut });
      out.push(b);
    }
  }
  return out;
}

function findWaterLevelForFraction(poly: Pt2[], fraction: number): { yCut: number; clipped: Pt2[] } {
  const ys = poly.map((p) => p.y);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);

  if (fraction <= 0.001) {
    return { yCut: minY, clipped: [] };
  }
  if (fraction >= 0.999) {
    return { yCut: maxY, clipped: poly };
  }

  const totalArea = polygonArea(poly);
  const targetArea = totalArea * fraction;
  let lo = minY;
  let hi = maxY;

  for (let iter = 0; iter < 18; iter++) {
    const mid = (lo + hi) * 0.5;
    const area = polygonArea(clipPolygonBelowY(poly, mid));
    if (area < targetArea) lo = mid;
    else hi = mid;
  }

  const yCut = (lo + hi) * 0.5;
  return { yCut, clipped: clipPolygonBelowY(poly, yCut) };
}

function evalQuadBezier(p0: Pt2, p1: Pt2, p2: Pt2, t: number): Pt2 {
  const u = 1 - t;
  return {
    x: u * u * p0.x + 2 * u * t * p1.x + t * t * p2.x,
    y: u * u * p0.y + 2 * u * t * p1.y + t * t * p2.y,
  };
}

export function PythagorasFluidProof({
  compact = false,
  heightClass,
}: {
  compact?: boolean;
  heightClass?: string;
} = {}): JSX.Element {
  const reducedMotion = useReducedMotion();
  const [legA, setLegA] = useState(3.0);
  const [legB, setLegB] = useState(4.0);
  const [pourPct, setPourPct] = useState(52);
  const [autoPour, setAutoPour] = useState(true);
  const [isVisible, setIsVisible] = useState(true);

  const hostRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const particlesRef = useRef({
    gold: createParticles(28),
    cyan: createParticles(28),
    stream: createParticles(18),
  });

  const stateRef = useRef({
    a: legA,
    b: legB,
    pour: pourPct / 100,
    time: 0,
    autoPour,
    holdTimer: 0,
  });

  stateRef.current.a = legA;
  stateRef.current.b = legB;
  stateRef.current.autoPour = autoPour;
  if (!autoPour) {
    stateRef.current.pour = pourPct / 100;
  }

  const areaA = legA * legA;
  const areaB = legB * legB;
  const areaC = areaA + areaB;
  const hypC = Math.sqrt(areaC);
  const pourFrac = pourPct / 100;

  // Pause 60fps loop offscreen via IntersectionObserver
  useEffect(() => {
    const el = hostRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setIsVisible(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        setIsVisible(entries.some((e) => e.isIntersecting));
      },
      { rootMargin: '120px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const drawScene = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (w < 80 || h < 80) return;

    const targetW = Math.floor(w * dpr);
    const targetH = Math.floor(h * dpr);
    if (canvas.width !== targetW || canvas.height !== targetH) {
      canvas.width = targetW;
      canvas.height = targetH;
    }

    const { a, b, pour, time } = stateRef.current;
    const c = Math.hypot(a, b);
    const pSplit = (a * a) / c;
    const qSplit = (b * b) / c;
    const altH = (a * b) / c;

    // Exact world coordinates (y-up)
    const A: Pt2 = { x: -c * 0.5, y: 0 };
    const B: Pt2 = { x: c * 0.5, y: 0 };
    const C: Pt2 = { x: -c * 0.5 + pSplit, y: altH };

    // Square a^2 (outward upper-left from AC)
    const nAx = -altH;
    const nAy = pSplit;
    const A1: Pt2 = { x: A.x + nAx, y: A.y + nAy };
    const C1: Pt2 = { x: C.x + nAx, y: C.y + nAy };
    const sqA: Pt2[] = [A, C, C1, A1];

    // Square b^2 (outward upper-right from BC)
    const nBx = altH;
    const nBy = qSplit;
    const B1: Pt2 = { x: B.x + nBx, y: B.y + nBy };
    const C2: Pt2 = { x: C.x + nBx, y: C.y + nBy };
    const sqB: Pt2[] = [B, C, C2, B1];

    // Square c^2 (upright below hypotenuse AB)
    const A2: Pt2 = { x: A.x, y: -c };
    const B2: Pt2 = { x: B.x, y: -c };
    const sqC: Pt2[] = [A, B, B2, A2];

    // Exact analytical world bounding box
    const minX = -c * 0.5 - altH;
    const maxX = c * 0.5 + altH;
    const minY = -c;
    const maxY = altH + Math.max(pSplit, qSplit);

    const padX = w < 420 ? 22 : 34;
    const padTop = compact ? 38 : 34;
    const padBottom = compact ? 50 : 28;
    const scale = Math.min((w - padX * 2) / (maxX - minX), (h - padTop - padBottom) / (maxY - minY));

    const worldCenterX = (minX + maxX) * 0.5;
    const worldCenterY = (minY + maxY) * 0.5;
    const canvasCenterX = w * 0.5;
    const canvasCenterY = padTop + (h - padTop - padBottom) * 0.5;

    const toScreen = (pt: Pt2): Pt2 => ({
      x: canvasCenterX + (pt.x - worldCenterX) * scale,
      y: canvasCenterY - (pt.y - worldCenterY) * scale,
    });

    const tracePoly = (pts: Pt2[]) => {
      ctx.beginPath();
      pts.forEach((p, idx) => {
        const sp = toScreen(p);
        if (idx === 0) ctx.moveTo(sp.x, sp.y);
        else ctx.lineTo(sp.x, sp.y);
      });
      ctx.closePath();
    };

    const drawUnitGrid = (origin: Pt2, uVec: Pt2, vVec: Pt2, side: number, stroke: string) => {
      ctx.save();
      ctx.strokeStyle = stroke;
      ctx.lineWidth = 0.85;
      const steps = Math.floor(side);
      for (let k = 1; k <= steps; k++) {
        if (k >= side - 0.05) continue;
        const frac = k / side;
        // u-parallel lines
        const u0 = toScreen({ x: origin.x + vVec.x * frac, y: origin.y + vVec.y * frac });
        const u1 = toScreen({
          x: origin.x + uVec.x + vVec.x * frac,
          y: origin.y + uVec.y + vVec.y * frac,
        });
        ctx.beginPath();
        ctx.moveTo(u0.x, u0.y);
        ctx.lineTo(u1.x, u1.y);
        ctx.stroke();

        // v-parallel lines
        const v0 = toScreen({ x: origin.x + uVec.x * frac, y: origin.y + uVec.y * frac });
        const v1 = toScreen({
          x: origin.x + vVec.x + uVec.x * frac,
          y: origin.y + vVec.y + uVec.y * frac,
        });
        ctx.beginPath();
        ctx.moveTo(v0.x, v0.y);
        ctx.lineTo(v1.x, v1.y);
        ctx.stroke();
      }
      ctx.restore();
    };

    ctx.save();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Obsidian void & warm observatory ambient bloom
    ctx.fillStyle = '#060609';
    ctx.fillRect(0, 0, w, h);

    const triMidS = toScreen({ x: C.x, y: 0 });
    const bgGlow = ctx.createRadialGradient(triMidS.x, triMidS.y, 10, triMidS.x, triMidS.y, Math.max(w, h) * 0.55);
    bgGlow.addColorStop(0, 'rgba(244, 196, 108, 0.08)');
    bgGlow.addColorStop(0.55, 'rgba(70, 214, 232, 0.04)');
    bgGlow.addColorStop(1, 'rgba(6, 6, 9, 0)');
    ctx.fillStyle = bgGlow;
    ctx.fillRect(0, 0, w, h);

    // 1. Draw subtle background vessel chambers for a^2, b^2, c^2
    tracePoly(sqA);
    ctx.fillStyle = 'rgba(244, 196, 108, 0.05)';
    ctx.fill();
    drawUnitGrid(A, { x: C.x - A.x, y: C.y - A.y }, { x: nAx, y: nAy }, a, 'rgba(244, 196, 108, 0.12)');

    tracePoly(sqB);
    ctx.fillStyle = 'rgba(70, 214, 232, 0.05)';
    ctx.fill();
    drawUnitGrid(B, { x: C.x - B.x, y: C.y - B.y }, { x: nBx, y: nBy }, b, 'rgba(70, 214, 232, 0.12)');

    tracePoly(sqC);
    ctx.fillStyle = 'rgba(247, 244, 236, 0.03)';
    ctx.fill();
    drawUnitGrid(A2, { x: c, y: 0 }, { x: 0, y: c }, c, 'rgba(244, 196, 108, 0.10)');

    // 2. Fluid inside Gold Square a^2 (exact area-conserving horizontal cut!)
    const drainFrac = Math.max(0, 1 - pour);
    if (drainFrac > 0.002) {
      const { yCut, clipped } = findWaterLevelForFraction(sqA, drainFrac);
      if (clipped.length >= 3) {
        ctx.save();
        tracePoly(clipped);
        ctx.clip();

        const topS = toScreen({ x: 0, y: yCut });
        const botS = toScreen({ x: 0, y: A.y });
        const gradA = ctx.createLinearGradient(0, topS.y, 0, botS.y);
        gradA.addColorStop(0, 'rgba(255, 226, 158, 0.84)');
        gradA.addColorStop(0.55, 'rgba(244, 196, 108, 0.70)');
        gradA.addColorStop(1, 'rgba(212, 154, 58, 0.85)');
        ctx.fillStyle = gradA;
        ctx.fillRect(0, 0, w, h);

        // Luminous floating gold particles inside a^2
        const sA = toScreen(A);
        const sC1 = toScreen(C1);
        const minSx = Math.min(sA.x, sC1.x, toScreen(A1).x, toScreen(C).x);
        const maxSx = Math.max(sA.x, sC1.x, toScreen(A1).x, toScreen(C).x);
        const minSy = Math.min(sA.y, sC1.y, toScreen(A1).y, toScreen(C).y);
        const maxSy = Math.max(sA.y, sC1.y, toScreen(A1).y, toScreen(C).y);

        for (const p of particlesRef.current.gold) {
          const vFlow = (p.v + time * p.speed * (pour > 0 && pour < 0.99 ? 1.4 : 0.45)) % 1;
          const px = minSx + p.u * (maxSx - minSx) + Math.sin(time * 2 + p.phase) * 3;
          const py = minSy + vFlow * (maxSy - minSy);
          ctx.fillStyle = 'rgba(255, 246, 214, 0.78)';
          ctx.beginPath();
          ctx.arc(px, py, p.radius, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();

        // Shimmering horizontal meniscus line
        const cutPts = clipped.filter((pt) => Math.abs(pt.y - yCut) < 1e-3);
        if (cutPts.length >= 2) {
          const xs = cutPts.map((pt) => pt.x);
          const xL = Math.min(...xs);
          const xR = Math.max(...xs);
          const sL = toScreen({ x: xL, y: yCut });
          const sR = toScreen({ x: xR, y: yCut });
          ctx.strokeStyle = '#FFF5D6';
          ctx.lineWidth = 1.8;
          ctx.beginPath();
          const waveN = 18;
          for (let i = 0; i <= waveN; i++) {
            const u = i / waveN;
            const wx = sL.x + (sR.x - sL.x) * u;
            const amp = pour > 0.01 && pour < 0.99 ? 1.4 : 0.6;
            const wy = sL.y + Math.sin(u * Math.PI * 3 + time * 5.2) * amp * Math.sin(u * Math.PI);
            if (i === 0) ctx.moveTo(wx, wy);
            else ctx.lineTo(wx, wy);
          }
          ctx.stroke();
        }
      }
    }

    // 3. Fluid inside Cyan Square b^2 (exact area-conserving horizontal cut!)
    if (drainFrac > 0.002) {
      const { yCut, clipped } = findWaterLevelForFraction(sqB, drainFrac);
      if (clipped.length >= 3) {
        ctx.save();
        tracePoly(clipped);
        ctx.clip();

        const topS = toScreen({ x: 0, y: yCut });
        const botS = toScreen({ x: 0, y: B.y });
        const gradB = ctx.createLinearGradient(0, topS.y, 0, botS.y);
        gradB.addColorStop(0, 'rgba(138, 240, 252, 0.84)');
        gradB.addColorStop(0.55, 'rgba(70, 214, 232, 0.70)');
        gradB.addColorStop(1, 'rgba(32, 148, 178, 0.86)');
        ctx.fillStyle = gradB;
        ctx.fillRect(0, 0, w, h);

        const ptsB = sqB.map(toScreen);
        const minSx = Math.min(...ptsB.map((p) => p.x));
        const maxSx = Math.max(...ptsB.map((p) => p.x));
        const minSy = Math.min(...ptsB.map((p) => p.y));
        const maxSy = Math.max(...ptsB.map((p) => p.y));

        for (const p of particlesRef.current.cyan) {
          const vFlow = (p.v + time * p.speed * (pour > 0 && pour < 0.99 ? 1.4 : 0.45)) % 1;
          const px = minSx + p.u * (maxSx - minSx) + Math.cos(time * 2 + p.phase) * 3;
          const py = minSy + vFlow * (maxSy - minSy);
          ctx.fillStyle = 'rgba(218, 252, 255, 0.78)';
          ctx.beginPath();
          ctx.arc(px, py, p.radius, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();

        const cutPts = clipped.filter((pt) => Math.abs(pt.y - yCut) < 1e-3);
        if (cutPts.length >= 2) {
          const xs = cutPts.map((pt) => pt.x);
          const xL = Math.min(...xs);
          const xR = Math.max(...xs);
          const sL = toScreen({ x: xL, y: yCut });
          const sR = toScreen({ x: xR, y: yCut });
          ctx.strokeStyle = '#CFF9FF';
          ctx.lineWidth = 1.8;
          ctx.beginPath();
          const waveN = 18;
          for (let i = 0; i <= waveN; i++) {
            const u = i / waveN;
            const wx = sL.x + (sR.x - sL.x) * u;
            const amp = pour > 0.01 && pour < 0.99 ? 1.4 : 0.6;
            const wy = sL.y + Math.sin(u * Math.PI * 3 - time * 5.2) * amp * Math.sin(u * Math.PI);
            if (i === 0) ctx.moveTo(wx, wy);
            else ctx.lineTo(wx, wy);
          }
          ctx.stroke();
        }
      }
    }

    // 4. Rising Fluid inside Hypotenuse Square c^2 (Gold a^2 section + Cyan b^2 section!)
    const levelY = -c + pour * c;
    const sC_TL = toScreen(A);
    const sC_BR = toScreen(B2);
    const cLeftPx = sC_TL.x;
    const cRightPx = sC_BR.x;
    const cTopPx = sC_TL.y;
    const cBotPx = sC_BR.y;
    const splitXWorld = -c * 0.5 + pSplit;
    const splitPx = toScreen({ x: splitXWorld, y: 0 }).x;

    if (pour > 0.002) {
      const fillTopPx = toScreen({ x: 0, y: levelY }).y;
      ctx.save();
      ctx.beginPath();
      ctx.rect(cLeftPx, fillTopPx, cRightPx - cLeftPx, cBotPx - fillTopPx);
      ctx.clip();

      // Horizontal gradient showing Gold (a^2/c^2 share) merging smoothly with Cyan (b^2/c^2 share)
      const splitRatio = Math.max(0.1, Math.min(0.9, pSplit / c));
      const mixGrad = ctx.createLinearGradient(cLeftPx, 0, cRightPx, 0);
      mixGrad.addColorStop(0, 'rgba(244, 196, 108, 0.85)');
      mixGrad.addColorStop(Math.max(0.05, splitRatio - 0.07), 'rgba(244, 196, 108, 0.72)');
      mixGrad.addColorStop(Math.min(0.95, splitRatio + 0.07), 'rgba(70, 214, 232, 0.72)');
      mixGrad.addColorStop(1, 'rgba(70, 214, 232, 0.85)');
      ctx.fillStyle = mixGrad;
      ctx.fillRect(cLeftPx, fillTopPx, cRightPx - cLeftPx, cBotPx - fillTopPx);

      // Vertical depth sheen
      const depthGrad = ctx.createLinearGradient(0, fillTopPx, 0, cBotPx);
      depthGrad.addColorStop(0, 'rgba(255, 255, 255, 0.16)');
      depthGrad.addColorStop(1, 'rgba(6, 6, 9, 0.34)');
      ctx.fillStyle = depthGrad;
      ctx.fillRect(cLeftPx, fillTopPx, cRightPx - cLeftPx, cBotPx - fillTopPx);

      // Rising glowing bubbles inside c^2
      const allBubbles = [...particlesRef.current.gold, ...particlesRef.current.cyan];
      allBubbles.forEach((p, idx) => {
        const isGoldSide = idx < particlesRef.current.gold.length;
        const zoneStart = isGoldSide ? cLeftPx : splitPx;
        const zoneWidth = isGoldSide ? splitPx - cLeftPx : cRightPx - splitPx;
        const vRise = (1 - ((p.v + time * p.speed) % 1));
        const px = zoneStart + p.u * zoneWidth + Math.sin(time * 2.4 + p.phase) * 3;
        const py = fillTopPx + vRise * Math.max(4, cBotPx - fillTopPx);
        ctx.fillStyle = isGoldSide ? 'rgba(255, 240, 194, 0.76)' : 'rgba(202, 250, 255, 0.76)';
        ctx.beginPath();
        ctx.arc(px, py, p.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.restore();

      // Surface wave crest inside c^2
      ctx.strokeStyle = '#F7F4EC';
      ctx.lineWidth = 2;
      ctx.beginPath();
      const crestSteps = 34;
      for (let i = 0; i <= crestSteps; i++) {
        const u = i / crestSteps;
        const wx = cLeftPx + (cRightPx - cLeftPx) * u;
        const activeAmp = pour < 0.99 ? 2.2 : 0.7;
        const wy = fillTopPx + Math.sin(u * Math.PI * 4 + time * 6.0) * activeAmp * Math.sin(u * Math.PI);
        if (i === 0) ctx.moveTo(wx, wy);
        else ctx.lineTo(wx, wy);
      }
      ctx.stroke();
    }

    // Subtle Euclid altitude divider inside c^2 showing exact area split (a^2 | b^2)
    ctx.save();
    ctx.strokeStyle = 'rgba(247, 244, 236, 0.24)';
    ctx.setLineDash([4, 4]);
    ctx.lineWidth = 1.1;
    ctx.beginPath();
    ctx.moveTo(splitPx, cTopPx);
    ctx.lineTo(splitPx, cBotPx);
    ctx.stroke();
    ctx.restore();

    // 5. Animated Liquid Conduits pouring from a^2 (A) and b^2 (B) into c^2!
    const fillTopPx = toScreen({ x: 0, y: levelY }).y;
    const leftEntryX = cLeftPx + (splitPx - cLeftPx) * 0.48;
    const rightEntryX = splitPx + (cRightPx - splitPx) * 0.52;

    const leftConduitP0 = toScreen(A);
    const leftNozzle: Pt2 = { x: leftEntryX, y: cTopPx + 14 };
    const leftConduitCtrl: Pt2 = {
      x: leftConduitP0.x + (leftEntryX - leftConduitP0.x) * 0.35,
      y: cTopPx + 14,
    };

    const rightConduitP0 = toScreen(B);
    const rightNozzle: Pt2 = { x: rightEntryX, y: cTopPx + 14 };
    const rightConduitCtrl: Pt2 = {
      x: rightConduitP0.x + (rightEntryX - rightConduitP0.x) * 0.35,
      y: cTopPx + 14,
    };

    const jetBottomY = Math.max(cTopPx + 14, fillTopPx);

    // Glass conduit outlines
    ctx.strokeStyle = 'rgba(244, 196, 108, 0.34)';
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(leftConduitP0.x, leftConduitP0.y);
    ctx.quadraticCurveTo(leftConduitCtrl.x, leftConduitCtrl.y, leftNozzle.x, leftNozzle.y);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(70, 214, 232, 0.34)';
    ctx.beginPath();
    ctx.moveTo(rightConduitP0.x, rightConduitP0.y);
    ctx.quadraticCurveTo(rightConduitCtrl.x, rightConduitCtrl.y, rightNozzle.x, rightNozzle.y);
    ctx.stroke();

    // Active pouring liquid streams when pouring (0 < pour < 1)
    const isActivelyPouring = pour > 0.015 && pour < 0.985;
    if (isActivelyPouring) {
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';

      // Gold stream through nozzle + vertical jet into tank
      ctx.strokeStyle = '#FFE29E';
      ctx.lineWidth = 2.6;
      ctx.beginPath();
      ctx.moveTo(leftConduitP0.x, leftConduitP0.y);
      ctx.quadraticCurveTo(leftConduitCtrl.x, leftConduitCtrl.y, leftNozzle.x, leftNozzle.y);
      ctx.lineTo(leftNozzle.x, jetBottomY);
      ctx.stroke();

      // Cyan stream through nozzle + vertical jet into tank
      ctx.strokeStyle = '#7CEEFF';
      ctx.lineWidth = 2.6;
      ctx.beginPath();
      ctx.moveTo(rightConduitP0.x, rightConduitP0.y);
      ctx.quadraticCurveTo(rightConduitCtrl.x, rightConduitCtrl.y, rightNozzle.x, rightNozzle.y);
      ctx.lineTo(rightNozzle.x, jetBottomY);
      ctx.stroke();

      // Streaming droplets traveling through conduits and falling jets
      particlesRef.current.stream.forEach((p, idx) => {
        const s = (p.v + time * 1.45) % 1;
        const isGold = idx % 2 === 0;
        const p0 = isGold ? leftConduitP0 : rightConduitP0;
        const ctrl = isGold ? leftConduitCtrl : rightConduitCtrl;
        const nozzle = isGold ? leftNozzle : rightNozzle;

        let pt: Pt2;
        if (s < 0.45) {
          pt = evalQuadBezier(p0, ctrl, nozzle, s / 0.45);
        } else {
          const dropU = (s - 0.45) / 0.55;
          pt = {
            x: nozzle.x + Math.sin(time * 9 + p.phase) * 0.8,
            y: nozzle.y + dropU * (jetBottomY - nozzle.y),
          };
        }

        ctx.fillStyle = isGold ? '#FFE29E' : '#7CEEFF';
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 2.3, 0, Math.PI * 2);
        ctx.fill();
      });

      // Impact splash halos on water surface inside c^2
      for (const [ix, col] of [
        [leftNozzle.x, 'rgba(255, 226, 158, 0.65)'],
        [rightNozzle.x, 'rgba(124, 238, 255, 0.65)'],
      ] as Array<[number, string]>) {
        const sg = ctx.createRadialGradient(ix, jetBottomY, 0, ix, jetBottomY, 12);
        sg.addColorStop(0, col);
        sg.addColorStop(1, 'transparent');
        ctx.fillStyle = sg;
        ctx.beginPath();
        ctx.arc(ix, jetBottomY, 12, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    // 6. Sharp glowing borders for the 3 squares + Right Triangle
    tracePoly(sqA);
    ctx.strokeStyle = 'rgba(244, 196, 108, 0.85)';
    ctx.lineWidth = 1.8;
    ctx.stroke();

    tracePoly(sqB);
    ctx.strokeStyle = 'rgba(70, 214, 232, 0.85)';
    ctx.lineWidth = 1.8;
    ctx.stroke();

    tracePoly(sqC);
    ctx.strokeStyle = 'rgba(247, 244, 236, 0.72)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Right Triangle Fill + Luminous Edges
    tracePoly([A, B, C]);
    ctx.fillStyle = 'rgba(17, 19, 28, 0.86)';
    ctx.fill();

    // Right angle marker at C
    const sC = toScreen(C);
    const sA = toScreen(A);
    const sB = toScreen(B);
    const uCA = {
      x: (sA.x - sC.x) / Math.hypot(sA.x - sC.x, sA.y - sC.y),
      y: (sA.y - sC.y) / Math.hypot(sA.x - sC.x, sA.y - sC.y),
    };
    const uCB = {
      x: (sB.x - sC.x) / Math.hypot(sB.x - sC.x, sB.y - sC.y),
      y: (sB.y - sC.y) / Math.hypot(sB.x - sC.x, sB.y - sC.y),
    };
    const raSize = Math.min(12, Math.max(7, c * scale * 0.08));
    ctx.strokeStyle = '#45E6A6';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(sC.x + uCA.x * raSize, sC.y + uCA.y * raSize);
    ctx.lineTo(sC.x + (uCA.x + uCB.x) * raSize, sC.y + (uCA.y + uCB.y) * raSize);
    ctx.lineTo(sC.x + uCB.x * raSize, sC.y + uCB.y * raSize);
    ctx.stroke();

    // Crisp glowing triangle legs
    ctx.strokeStyle = '#FFE29E';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(sA.x, sA.y);
    ctx.lineTo(sC.x, sC.y);
    ctx.stroke();

    ctx.strokeStyle = '#7CEEFF';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(sC.x, sC.y);
    ctx.lineTo(sB.x, sB.y);
    ctx.stroke();

    ctx.strokeStyle = '#45E6A6';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(sA.x, sA.y);
    ctx.lineTo(sB.x, sB.y);
    ctx.stroke();

    // 7. Crisp Square Area Badges & Leg Labels
    const sqACenter = toScreen({
      x: (A.x + C.x + C1.x + A1.x) * 0.25,
      y: (A.y + C.y + C1.y + A1.y) * 0.25,
    });
    const sqBCenter = toScreen({
      x: (B.x + C.x + C2.x + B1.x) * 0.25,
      y: (B.y + C.y + C2.y + B1.y) * 0.25,
    });
    const sqCCenter = toScreen({
      x: 0,
      y: -c * 0.5,
    });

    const drawBadge = (center: Pt2, title: string, value: string, borderCol: string, textCol: string) => {
      const bw = 64;
      const bh = 30;
      ctx.fillStyle = 'rgba(6, 6, 9, 0.78)';
      ctx.strokeStyle = borderCol;
      ctx.lineWidth = 1;
      ctx.beginPath();
      if (typeof ctx.roundRect === 'function') {
        ctx.roundRect(center.x - bw * 0.5, center.y - bh * 0.5, bw, bh, 6);
      } else {
        ctx.rect(center.x - bw * 0.5, center.y - bh * 0.5, bw, bh);
      }
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = textCol;
      ctx.font = 'bold 10.5px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(title, center.x, center.y - 6);
      ctx.fillStyle = '#F7F4EC';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.fillText(value, center.x, center.y + 7);
    };

    drawBadge(sqACenter, `a²`, (a * a).toFixed(1), 'rgba(244, 196, 108, 0.55)', '#FFE29E');
    drawBadge(sqBCenter, `b²`, (b * b).toFixed(1), 'rgba(70, 214, 232, 0.55)', '#7CEEFF');
    drawBadge(sqCCenter, `c²`, (c * c).toFixed(1), 'rgba(69, 230, 166, 0.55)', '#5CEFB3');

    // Leg dimension labels inside/along triangle
    ctx.font = 'bold 10.5px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const midAC = toScreen({ x: (A.x + C.x) * 0.5 + (B.x - C.x) * 0.08, y: (A.y + C.y) * 0.5 - 0.25 });
    const midBC = toScreen({ x: (B.x + C.x) * 0.5 + (A.x - C.x) * 0.08, y: (B.y + C.y) * 0.5 - 0.25 });
    const midAB = toScreen({ x: 0, y: 0.28 });

    ctx.fillStyle = '#FFE29E';
    ctx.fillText(`a=${a.toFixed(1)}`, midAC.x, midAC.y);
    ctx.fillStyle = '#7CEEFF';
    ctx.fillText(`b=${b.toFixed(1)}`, midBC.x, midBC.y);
    ctx.fillStyle = '#5CEFB3';
    ctx.fillText(`c=${c.toFixed(2)}`, midAB.x, midAB.y);

    ctx.restore();
  }, [compact]);

  // ResizeObserver
  useEffect(() => {
    drawScene();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ro = new ResizeObserver(() => drawScene());
    ro.observe(canvas);
    return () => ro.disconnect();
  }, [drawScene, compact]);

  // Immediate redraw when leg or pour controls change
  useEffect(() => {
    drawScene();
  }, [legA, legB, pourPct, drawScene]);

  // 60fps animation loop paused offscreen via IntersectionObserver
  useEffect(() => {
    if (!isVisible || reducedMotion) return;

    let rafId = 0;
    let lastNow = performance.now();
    let uiSyncAccum = 0;

    const tick = (now: number) => {
      const dt = Math.min(0.05, Math.max(0.001, (now - lastNow) / 1000));
      lastNow = now;

      if (!document.hidden) {
        const s = stateRef.current;
        s.time += dt;

        if (s.autoPour) {
          if (s.pour < 1) {
            s.pour = Math.min(1, s.pour + dt * 0.24);
          } else {
            s.holdTimer += dt;
            if (s.holdTimer >= 1.7) {
              s.holdTimer = 0;
              s.pour = 0;
            }
          }

          uiSyncAccum += dt;
          if (uiSyncAccum >= 0.05) {
            uiSyncAccum = 0;
            setPourPct(Math.round(s.pour * 100));
          }
        }

        drawScene();
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [isVisible, reducedMotion, drawScene]);

  const emptyAndReplay = () => {
    stateRef.current.pour = 0;
    stateRef.current.holdTimer = 0;
    setPourPct(0);
    setAutoPour(true);
    drawScene();
  };

  const canvasHeight =
    heightClass ?? (compact ? 'h-[280px] sm:h-[320px]' : 'h-[350px] sm:h-[420px]');

  const filledC = pourFrac * areaC;
  const remainingSrc = (1 - pourFrac) * (areaA + areaB);

  return (
    <div
      ref={hostRef}
      className="instrument-frame fiducial-frame overflow-hidden bg-[#060609] min-w-0 max-w-full"
    >
      {/* Top Bar */}
      <div className="px-4 py-2.5 border-b hairline-rule bg-[#0B0C12]/95 flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className="w-2 h-2 rounded-full shrink-0"
            style={{ backgroundColor: '#45E6A6', boxShadow: '0 0 10px #45E6A6' }}
          />
          <span className="font-mono-data text-[10px] uppercase tracking-[0.16em] text-[#F4C46C] truncate">
            Pythagoras Fluid Proof
          </span>
          <span className="hidden sm:inline font-mono-data text-[10px] px-2 py-0.5 rounded bg-[#11131C] border border-[rgba(244,196,108,0.18)] text-[#A8B2C6]">
            a={legA.toFixed(1)} · b={legB.toFixed(1)} · c={hypC.toFixed(2)}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setAutoPour((p) => !p)}
            aria-label={autoPour ? 'Pause pour animation' : 'Auto-Pour'}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-mono-data border border-[rgba(244,196,108,0.22)] bg-[#11131C] text-[#F7F4EC] hover:border-[#F4C46C]/50"
          >
            {autoPour ? <Pause className="w-3 h-3 text-[#F4C46C]" /> : <Play className="w-3 h-3 text-[#F4C46C]" />}
            <span>{autoPour ? 'Pause Pour' : 'Auto-Pour'}</span>
          </button>

          <button
            type="button"
            onClick={emptyAndReplay}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-mono-data border border-[#45E6A6]/40 bg-[#45E6A6]/12 text-[#5CEFB3] hover:bg-[#45E6A6]/20"
          >
            <Droplets className="w-3 h-3" />
            <span>Empty &amp; Replay</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setLegA(3.0);
              setLegB(4.0);
              emptyAndReplay();
            }}
            aria-label="Reset Pythagoras proof to 3-4-5 triangle"
            className="p-1.5 rounded border border-[rgba(244,196,108,0.18)] bg-[#11131C] text-[#A8B2C6] hover:text-[#F7F4EC]"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 min-w-0">
        <div
          className={`${
            compact ? 'lg:col-span-12' : 'lg:col-span-7 border-b lg:border-b-0 lg:border-r hairline-rule'
          } relative bg-[#060609] min-w-0`}
        >
          <canvas
            ref={canvasRef}
            className={`block w-full ${canvasHeight}`}
          />

          <div className="pointer-events-none absolute top-3 left-3 obsidian-glass rounded-lg px-2.5 py-1.5 border border-[rgba(244,196,108,0.22)]">
            <div className="font-mono-data text-[10px] text-[#A8B2C6]">
              Pour{' '}
              <span className="text-[#5CEFB3] font-semibold">{pourPct}%</span> ·{' '}
              <span className="text-[#FFE29E]">{areaA.toFixed(1)}</span> +{' '}
              <span className="text-[#7CEEFF]">{areaB.toFixed(1)}</span> ={' '}
              <span className="text-[#5CEFB3] font-semibold">{areaC.toFixed(1)}</span>
            </div>
          </div>

          {compact && (
            <div className="absolute bottom-3 left-3 right-3 flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap gap-1.5">
                {TRIANGLE_PRESETS.slice(0, 3).map((tp) => {
                  const active = Math.abs(legA - tp.a) < 0.05 && Math.abs(legB - tp.b) < 0.05;
                  return (
                    <button
                      key={tp.id}
                      type="button"
                      onClick={() => {
                        setLegA(tp.a);
                        setLegB(tp.b);
                      }}
                      className={`px-2 py-1 rounded text-[10px] font-mono-data border transition-all ${
                        active
                          ? 'bg-[#F4C46C] border-[#F4C46C] text-[#060609] font-semibold'
                          : 'bg-[#0B0C12]/85 border-[rgba(244,196,108,0.2)] text-[#A8B2C6] hover:text-[#F7F4EC]'
                      }`}
                    >
                      {tp.label}
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-2 bg-[#0B0C12]/85 px-2.5 py-1 rounded border border-[rgba(69,230,166,0.28)]">
                <span className="font-mono-data text-[10px] text-[#5CEFB3]">{pourPct}%</span>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={1}
                  value={pourPct}
                  onChange={(e) => {
                    const next = parseInt(e.target.value, 10);
                    setAutoPour(false);
                    stateRef.current.pour = next / 100;
                    setPourPct(next);
                  }}
                  aria-label="Pour progress"
                  className="meridian-slider w-20"
                  style={{ ['--slider-accent' as string]: '#45E6A6' }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Full Controls & Area Conservation Telemetry */}
        {!compact && (
          <div className="lg:col-span-5 bg-[#0B0C12] p-4 sm:p-5 flex flex-col justify-between gap-4 min-w-0">
            <div className="space-y-3 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono-data text-[10px] uppercase tracking-[0.16em] text-[#A8B2C6]">
                  Right Triangle Presets
                </span>
                <span className="font-mono-data text-[10px] text-[#5CEFB3]">
                  c = {hypC.toFixed(2)}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-2">
                {TRIANGLE_PRESETS.map((tp) => {
                  const active = Math.abs(legA - tp.a) < 0.05 && Math.abs(legB - tp.b) < 0.05;
                  return (
                    <button
                      key={tp.id}
                      type="button"
                      onClick={() => {
                        setLegA(tp.a);
                        setLegB(tp.b);
                      }}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-mono-data border transition-all ${
                        active
                          ? 'bg-[#F4C46C] border-[#F4C46C] text-[#060609] font-semibold shadow-[0_0_18px_-6px_#F4C46C]'
                          : 'bg-[#11131C] border-[rgba(244,196,108,0.16)] text-[#A8B2C6] hover:text-[#F7F4EC] hover:border-[rgba(244,196,108,0.36)]'
                      }`}
                    >
                      {tp.label}
                    </button>
                  );
                })}
              </div>

              {/* Sliders */}
              <div className="p-3.5 rounded-xl bg-[#11131C] border border-[rgba(244,196,108,0.16)] space-y-3">
                <label className="block space-y-1 text-xs">
                  <div className="flex justify-between font-mono-data">
                    <span className="text-[#A8B2C6]">Gold Leg (a)</span>
                    <span className="text-[#FFE29E] font-semibold">{legA.toFixed(1)} units</span>
                  </div>
                  <input
                    type="range"
                    min={2}
                    max={6}
                    step={0.1}
                    value={legA}
                    onChange={(e) => setLegA(parseFloat(e.target.value))}
                    className="meridian-slider"
                    style={{ ['--slider-accent' as string]: '#F4C46C' }}
                  />
                </label>

                <label className="block space-y-1 text-xs">
                  <div className="flex justify-between font-mono-data">
                    <span className="text-[#A8B2C6]">Cyan Leg (b)</span>
                    <span className="text-[#7CEEFF] font-semibold">{legB.toFixed(1)} units</span>
                  </div>
                  <input
                    type="range"
                    min={2}
                    max={6}
                    step={0.1}
                    value={legB}
                    onChange={(e) => setLegB(parseFloat(e.target.value))}
                    className="meridian-slider"
                    style={{ ['--slider-accent' as string]: '#46D6E8' }}
                  />
                </label>

                <label className="block space-y-1 text-xs">
                  <div className="flex justify-between font-mono-data">
                    <span className="text-[#A8B2C6]">Pour Progress</span>
                    <span className="text-[#5CEFB3] font-semibold">{pourPct}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={1}
                    value={pourPct}
                    onChange={(e) => {
                      const next = parseInt(e.target.value, 10);
                      setAutoPour(false);
                      stateRef.current.pour = next / 100;
                      setPourPct(next);
                    }}
                    className="meridian-slider"
                    style={{ ['--slider-accent' as string]: '#45E6A6' }}
                  />
                </label>
              </div>
            </div>

            {/* Area Conservation Telemetry */}
            <div className="p-3.5 rounded-xl bg-[#11131C] border border-[rgba(244,196,108,0.18)] space-y-2.5 min-w-0">
              <div className="grid grid-cols-3 gap-2 font-mono-data text-xs">
                <div className="p-2 rounded bg-[#0B0C12] border border-[rgba(244,196,108,0.2)]">
                  <div className="text-[9.5px] text-[#727D94]">Gold a²</div>
                  <div className="text-[#FFE29E] font-semibold">{areaA.toFixed(2)}</div>
                </div>
                <div className="p-2 rounded bg-[#0B0C12] border border-[rgba(70,214,232,0.2)]">
                  <div className="text-[9.5px] text-[#727D94]">Cyan b²</div>
                  <div className="text-[#7CEEFF] font-semibold">{areaB.toFixed(2)}</div>
                </div>
                <div className="p-2 rounded bg-[#0B0C12] border border-[rgba(69,230,166,0.24)]">
                  <div className="text-[9.5px] text-[#727D94]">Total c²</div>
                  <div className="text-[#5CEFB3] font-semibold">{areaC.toFixed(2)}</div>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] font-mono-data px-2 py-1.5 rounded bg-[#0B0C12] border border-[rgba(244,196,108,0.12)]">
                <span className="text-[#A8B2C6]">
                  In Top Squares: <span className="text-[#FFE29E]">{remainingSrc.toFixed(2)}</span>
                </span>
                <span className="text-[#A8B2C6]">
                  In c² Tank: <span className="text-[#5CEFB3]">{filledC.toFixed(2)}</span>
                </span>
              </div>

              <div className="overflow-x-auto max-w-full py-0.5">
                <MathTex
                  tex={`${legA.toFixed(1)}^2 + ${legB.toFixed(1)}^2 = ${areaA.toFixed(2)} + ${areaB.toFixed(2)} = ${areaC.toFixed(2)} = ${hypC.toFixed(2)}^2`}
                  className="text-xs text-[#F7F4EC]"
                />
              </div>

              <p className="text-xs text-[#A8B2C6] leading-relaxed">
                Notice how every drop from the gold <span className="text-[#FFE29E]">a²</span> and cyan{' '}
                <span className="text-[#7CEEFF]">b²</span> squares fills the bottom{' '}
                <span className="text-[#5CEFB3]">c²</span> square to the exact brim—no spilled drops, no leftover space!
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default PythagorasFluidProof;
