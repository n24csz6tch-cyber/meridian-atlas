import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { MathTex } from '../../components/MathTex';
import { useReducedMotion } from '../../hooks/useReducedMotion';

export type ParabolaHighlightFeature =
  | 'vertex'
  | 'axis'
  | 'roots'
  | 'yIntercept'
  | 'curvature'
  | null;

export interface GhostCurveConfig {
  a: number;
  h: number;
  k: number;
  label: string;
  color: string;
}

export interface ParabolaCanvasProps {
  a: number;
  h: number;
  k: number;
  onChange?: (next: { a: number; h: number; k: number }) => void;
  highlightFeature?: ParabolaHighlightFeature;
  ghostCurve?: GhostCurveConfig | null;
  showParentCurve?: boolean;
  probeX?: number | null;
  interactive?: boolean;
  heightClass?: string;
  accentColor?: string;
  showHeaderEquation?: boolean;
  compactTelemetry?: boolean;
}

function fmt(n: number): string {
  const rounded = Math.round(n * 100) / 100;
  return Object.is(rounded, -0)
    ? '0'
    : Number.isInteger(rounded)
      ? `${rounded}`
      : rounded.toFixed(2).replace(/\.?0+$/, '');
}

function fmtSigned(n: number): string {
  const rounded = Math.round(n * 100) / 100;
  if (Math.abs(rounded) < 1e-6) return '+ 0';
  return rounded > 0 ? `+ ${fmt(rounded)}` : `- ${fmt(Math.abs(rounded))}`;
}

export function buildVertexFormTex(a: number, h: number, k: number): string {
  const aStr = fmt(a);
  const inner =
    Math.abs(h) < 1e-6
      ? 'x^2'
      : h > 0
        ? `(x - {\\color{#38BDF8}${fmt(h)}})^2`
        : `(x + {\\color{#38BDF8}${fmt(Math.abs(h))}})^2`;
  const kTerm =
    Math.abs(k) < 1e-6
      ? ''
      : k > 0
        ? ` + {\\color{#F9735B}${fmt(k)}}`
        : ` - {\\color{#F9735B}${fmt(Math.abs(k))}}`;
  return `f(x) = {\\color{#E5A94C}${aStr}}${inner}${kTerm}`;
}

export function buildStandardFormTex(a: number, h: number, k: number): string {
  const b = -2 * a * h;
  const c = a * h * h + k;
  const aRounded = Math.round(a * 100) / 100;
  const aPart =
    Math.abs(aRounded - 1) < 1e-4
      ? 'x^2'
      : Math.abs(aRounded + 1) < 1e-4
        ? '-x^2'
        : `${fmt(a)}x^2`;

  const bRounded = Math.round(b * 100) / 100;
  let bPart = '';
  if (Math.abs(bRounded) >= 1e-4) {
    if (Math.abs(bRounded - 1) < 1e-4) bPart = ' + x';
    else if (Math.abs(bRounded + 1) < 1e-4) bPart = ' - x';
    else bPart = ` ${fmtSigned(b)}x`;
  }

  const cPart = Math.abs(c) < 1e-4 ? '' : ` ${fmtSigned(c)}`;
  return `${aPart}${bPart}${cPart}`;
}

export function ParabolaCanvas({
  a,
  h,
  k,
  onChange,
  highlightFeature = null,
  ghostCurve = null,
  showParentCurve = false,
  probeX = null,
  interactive = true,
  heightClass = 'h-[400px] sm:h-[440px]',
  accentColor = '#E5A94C',
  showHeaderEquation = true,
  compactTelemetry = false,
}: ParabolaCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reducedMotion = useReducedMotion();

  const [size, setSize] = useState({ width: 680, height: 420 });
  const [hoverTarget, setHoverTarget] = useState<'vertex' | 'curvature' | null>(null);
  const dragModeRef = useRef<'vertex' | 'curvature' | null>(null);

  const targetRef = useRef({ a, h, k });
  targetRef.current = { a, h, k };
  const displayRef = useRef({ a, h, k });
  const rafRef = useRef<number | null>(null);

  const latestPropsRef = useRef({
    highlightFeature,
    ghostCurve,
    showParentCurve,
    probeX,
    interactive,
    accentColor,
    hoverTarget,
    reducedMotion,
    size,
  });
  latestPropsRef.current = {
    highlightFeature,
    ghostCurve,
    showParentCurve,
    probeX,
    interactive,
    accentColor,
    hoverTarget,
    reducedMotion,
    size,
  };

  const getTransform = (w: number, hBox: number) => {
    const pxPerUnit = Math.min(w / 16.5, hBox / 11.5);
    const originX = w * 0.5;
    const originY = hBox * 0.52;
    const toPx = (wx: number, wy: number) => ({
      x: originX + wx * pxPerUnit,
      y: originY - wy * pxPerUnit,
    });
    const toWorld = (px: number, py: number) => ({
      x: (px - originX) / pxPerUnit,
      y: (originY - py) / pxPerUnit,
    });
    return { pxPerUnit, originX, originY, toPx, toWorld };
  };

  const renderFrame = useCallback((): boolean => {
    const canvas = canvasRef.current;
    if (!canvas) return false;
    const {
      highlightFeature: hi,
      ghostCurve: ghost,
      showParentCurve: showParent,
      probeX: probe,
      interactive: canInteract,
      accentColor: accent,
      hoverTarget: hovered,
      reducedMotion: reduced,
      size: box,
    } = latestPropsRef.current;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const targetW = Math.round(box.width * dpr);
    const targetH = Math.round(box.height * dpr);
    if (canvas.width !== targetW || canvas.height !== targetH) {
      canvas.width = targetW;
      canvas.height = targetH;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return false;

    const target = targetRef.current;
    const disp = displayRef.current;
    let animating = false;

    if (dragModeRef.current || reduced) {
      disp.a = target.a;
      disp.h = target.h;
      disp.k = target.k;
    } else {
      const da = target.a - disp.a;
      const dh = target.h - disp.h;
      const dk = target.k - disp.k;
      if (Math.abs(da) > 0.0008 || Math.abs(dh) > 0.0008 || Math.abs(dk) > 0.0008) {
        disp.a += da * 0.22;
        disp.h += dh * 0.22;
        disp.k += dk * 0.22;
        animating = true;
      } else {
        disp.a = target.a;
        disp.h = target.h;
        disp.k = target.k;
      }
    }

    const curA = disp.a;
    const curH = disp.h;
    const curK = disp.k;

    ctx.save();
    ctx.scale(dpr, dpr);

    const W = box.width;
    const H = box.height;
    const { pxPerUnit, originX, originY, toPx } = getTransform(W, H);

    ctx.fillStyle = '#0D121A';
    ctx.fillRect(0, 0, W, H);

    const vPx = toPx(curH, curK);
    const radial = ctx.createRadialGradient(vPx.x, vPx.y, 8, vPx.x, vPx.y, Math.max(W, H) * 0.48);
    radial.addColorStop(0, 'rgba(229, 169, 76, 0.08)');
    radial.addColorStop(1, 'rgba(13, 18, 26, 0)');
    ctx.fillStyle = radial;
    ctx.fillRect(0, 0, W, H);

    const minWorldX = Math.floor(-originX / pxPerUnit) - 1;
    const maxWorldX = Math.ceil((W - originX) / pxPerUnit) + 1;
    const minWorldY = Math.floor(-(H - originY) / pxPerUnit) - 1;
    const maxWorldY = Math.ceil(originY / pxPerUnit) + 1;

    for (let gx = minWorldX; gx <= maxWorldX; gx++) {
      const px = originX + gx * pxPerUnit;
      ctx.beginPath();
      ctx.moveTo(px, 0);
      ctx.lineTo(px, H);
      ctx.strokeStyle = gx % 2 === 0 ? 'rgba(237, 235, 228, 0.08)' : 'rgba(237, 235, 228, 0.032)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }
    for (let gy = minWorldY; gy <= maxWorldY; gy++) {
      const py = originY - gy * pxPerUnit;
      ctx.beginPath();
      ctx.moveTo(0, py);
      ctx.lineTo(W, py);
      ctx.strokeStyle = gy % 2 === 0 ? 'rgba(237, 235, 228, 0.08)' : 'rgba(237, 235, 228, 0.032)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    ctx.strokeStyle = 'rgba(237, 235, 228, 0.26)';
    ctx.lineWidth = 1.25;
    ctx.beginPath();
    ctx.moveTo(0, originY);
    ctx.lineTo(W, originY);
    ctx.moveTo(originX, 0);
    ctx.lineTo(originX, H);
    ctx.stroke();

    ctx.font = '11px "JetBrains Mono", monospace';
    ctx.fillStyle = 'rgba(156, 166, 184, 0.72)';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    for (let gx = minWorldX; gx <= maxWorldX; gx++) {
      if (gx === 0 || gx % 2 !== 0) continue;
      const px = originX + gx * pxPerUnit;
      if (px < 18 || px > W - 18) continue;
      ctx.fillText(String(gx), px, Math.min(Math.max(originY + 6, 8), H - 18));
    }
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    for (let gy = minWorldY; gy <= maxWorldY; gy++) {
      if (gy === 0 || gy % 2 !== 0) continue;
      const py = originY - gy * pxPerUnit;
      if (py < 14 || py > H - 14) continue;
      ctx.fillText(String(gy), Math.max(originX - 8, 22), py);
    }

    const drawParabolaCurve = (
      qa: number,
      qh: number,
      qk: number,
      color: string,
      lineWidth: number,
      dashed: number[] = []
    ) => {
      ctx.save();
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.setLineDash(dashed);
      const steps = 220;
      let started = false;
      const xStart = minWorldX - 0.5;
      const xEnd = maxWorldX + 0.5;
      for (let i = 0; i <= steps; i++) {
        const wx = xStart + ((xEnd - xStart) * i) / steps;
        const wy = qa * (wx - qh) * (wx - qh) + qk;
        const pt = toPx(wx, wy);
        if (pt.y < -120 || pt.y > H + 120) {
          started = false;
          continue;
        }
        if (!started) {
          ctx.moveTo(pt.x, pt.y);
          started = true;
        } else {
          ctx.lineTo(pt.x, pt.y);
        }
      }
      ctx.stroke();
      ctx.restore();
    };

    if (showParent) {
      drawParabolaCurve(1, 0, 0, 'rgba(156, 166, 184, 0.32)', 1.5, [4, 5]);
    }

    if (ghost) {
      drawParabolaCurve(ghost.a, ghost.h, ghost.k, ghost.color, 2, [6, 5]);
      const gv = toPx(ghost.h, ghost.k);
      ctx.beginPath();
      ctx.arc(gv.x, gv.y, 4.5, 0, Math.PI * 2);
      ctx.fillStyle = ghost.color;
      ctx.fill();

      const gLabelX = Math.min(Math.max(gv.x, 76), W - 76);
      const gLabelY = ghost.a >= 0 ? Math.min(gv.y + 20, H - 16) : Math.max(gv.y - 20, 18);
      drawBadge(ctx, ghost.label, gLabelX, gLabelY, '#161D29', ghost.color, ghost.color);
    }

    const axisPx = toPx(curH, 0).x;
    if (axisPx >= -10 && axisPx <= W + 10) {
      const isAxisHi = hi === 'axis';
      ctx.save();
      ctx.beginPath();
      ctx.setLineDash([5, 5]);
      ctx.moveTo(axisPx, 10);
      ctx.lineTo(axisPx, H - 10);
      ctx.strokeStyle = isAxisHi ? '#38BDF8' : 'rgba(56, 189, 248, 0.42)';
      ctx.lineWidth = isAxisHi ? 2.2 : 1.2;
      ctx.stroke();
      ctx.restore();

      const axisBadgeX = Math.min(Math.max(axisPx, 44), W - 44);
      drawBadge(
        ctx,
        `x = ${fmt(curH)}`,
        axisBadgeX,
        22,
        '#0F1722',
        isAxisHi ? '#38BDF8' : 'rgba(56, 189, 248, 0.45)',
        '#38BDF8'
      );
    }

    const isCurvHi = hi === 'curvature';
    drawParabolaCurve(curA, curH, curK, 'rgba(229, 169, 76, 0.22)', isCurvHi ? 9 : 6);
    drawParabolaCurve(curA, curH, curK, accent, isCurvHi ? 3.2 : 2.5);

    if (probe !== null && probe !== undefined) {
      const pyMain = curA * (probe - curH) * (probe - curH) + curK;
      const pAxis = toPx(probe, 0);
      const pMain = toPx(probe, pyMain);

      ctx.save();
      ctx.setLineDash([3, 4]);
      ctx.strokeStyle = 'rgba(237, 235, 228, 0.45)';
      ctx.lineWidth = 1.25;
      ctx.beginPath();
      ctx.moveTo(pAxis.x, pAxis.y);
      ctx.lineTo(pMain.x, Math.min(Math.max(pMain.y, 12), H - 12));
      if (ghost) {
        const pyGhost = ghost.a * (probe - ghost.h) * (probe - ghost.h) + ghost.k;
        const pGhost = toPx(probe, pyGhost);
        ctx.lineTo(pGhost.x, Math.min(Math.max(pGhost.y, 12), H - 12));
      }
      ctx.stroke();
      ctx.restore();

      ctx.beginPath();
      ctx.arc(pMain.x, pMain.y, 5, 0, Math.PI * 2);
      ctx.fillStyle = '#34D399';
      ctx.fill();
      drawBadge(
        ctx,
        `f(${fmt(probe)}) = ${fmt(pyMain)}`,
        Math.min(Math.max(pMain.x + 56, 70), W - 70),
        Math.min(Math.max(pMain.y - 16, 20), H - 20),
        '#111620',
        '#34D399',
        '#34D399'
      );

      if (ghost) {
        const pyGhost = ghost.a * (probe - ghost.h) * (probe - ghost.h) + ghost.k;
        const pGhost = toPx(probe, pyGhost);
        if (pGhost.y >= 8 && pGhost.y <= H - 8) {
          ctx.beginPath();
          ctx.arc(pGhost.x, pGhost.y, 5, 0, Math.PI * 2);
          ctx.fillStyle = ghost.color;
          ctx.fill();
          drawBadge(
            ctx,
            `g(${fmt(probe)}) = ${fmt(pyGhost)}`,
            Math.min(Math.max(pGhost.x - 58, 70), W - 70),
            Math.min(Math.max(pGhost.y + 18, 20), H - 20),
            '#111620',
            ghost.color,
            ghost.color
          );
        }
      }
    }

    const ratio = -curK / curA;
    const rootPoints: { x: number; px: number; py: number }[] = [];
    if (Math.abs(ratio) < 1e-4) {
      const pt = toPx(curH, 0);
      rootPoints.push({ x: curH, px: pt.x, py: pt.y });
    } else if (ratio > 0) {
      const offset = Math.sqrt(ratio);
      const r1 = curH - offset;
      const r2 = curH + offset;
      const p1 = toPx(r1, 0);
      const p2 = toPx(r2, 0);
      rootPoints.push({ x: r1, px: p1.x, py: p1.y });
      rootPoints.push({ x: r2, px: p2.x, py: p2.y });
    }

    const isRootsHi = hi === 'roots';
    rootPoints.forEach((rp, idx) => {
      if (rp.px < -12 || rp.px > W + 12) return;
      ctx.beginPath();
      ctx.arc(rp.px, rp.py, isRootsHi ? 7 : 5, 0, Math.PI * 2);
      ctx.fillStyle = '#34D399';
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#0A0D12';
      ctx.stroke();

      let labelX = rp.px;
      if (rootPoints.length === 2 && Math.abs(rootPoints[1].px - rootPoints[0].px) < 92) {
        labelX += idx === 0 ? -34 : 34;
      }
      const labelY = curA >= 0 ? Math.max(rp.py - 22, 18) : Math.min(rp.py + 22, H - 18);
      if (!(rootPoints.length === 1 && Math.abs(curK) < 0.2)) {
        drawBadge(
          ctx,
          `(${fmt(rp.x)}, 0)`,
          Math.min(Math.max(labelX, 46), W - 46),
          labelY,
          '#0F1722',
          isRootsHi ? '#34D399' : 'rgba(52, 211, 153, 0.5)',
          '#34D399'
        );
      }
    });

    const yInt = curA * curH * curH + curK;
    const yIntPx = toPx(0, yInt);
    if (yIntPx.y >= 10 && yIntPx.y <= H - 10) {
      const isYHi = hi === 'yIntercept';
      ctx.save();
      ctx.translate(yIntPx.x, yIntPx.y);
      ctx.rotate(Math.PI / 4);
      const r = isYHi ? 5.5 : 4;
      ctx.fillStyle = '#EDEBE4';
      ctx.fillRect(-r, -r, r * 2, r * 2);
      ctx.restore();

      const distVertex = Math.hypot(yIntPx.x - vPx.x, yIntPx.y - vPx.y);
      const nearRoot = rootPoints.some((rp) => Math.hypot(yIntPx.x - rp.px, yIntPx.y - rp.py) < 42);
      if ((isYHi || (distVertex > 36 && !nearRoot)) && yIntPx.x > 48 && yIntPx.x < W - 48) {
        drawBadge(
          ctx,
          `(0, ${fmt(yInt)})`,
          yIntPx.x + (curH >= 0 ? -48 : 48),
          yIntPx.y - 6,
          '#111620',
          isYHi ? '#EDEBE4' : 'rgba(237, 235, 228, 0.35)',
          '#EDEBE4'
        );
      }
    }

    const cPx = toPx(curH + 1.2, curK + curA * 1.44);
    if (canInteract && cPx.x >= 8 && cPx.x <= W - 8 && cPx.y >= 8 && cPx.y <= H - 8) {
      ctx.save();
      ctx.setLineDash([2, 3]);
      ctx.strokeStyle =
        hovered === 'curvature' || dragModeRef.current === 'curvature'
          ? 'rgba(229, 169, 76, 0.85)'
          : 'rgba(229, 169, 76, 0.35)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(vPx.x, vPx.y);
      ctx.lineTo(cPx.x, cPx.y);
      ctx.stroke();
      ctx.restore();

      ctx.save();
      ctx.translate(cPx.x, cPx.y);
      ctx.rotate(Math.PI / 4);
      const sizeHandle = hovered === 'curvature' || dragModeRef.current === 'curvature' ? 6.5 : 5;
      ctx.fillStyle = '#0A0D12';
      ctx.fillRect(-sizeHandle, -sizeHandle, sizeHandle * 2, sizeHandle * 2);
      ctx.strokeStyle = accent;
      ctx.lineWidth = 2;
      ctx.strokeRect(-sizeHandle, -sizeHandle, sizeHandle * 2, sizeHandle * 2);
      ctx.restore();
    }

    const isVHi = hi === 'vertex' || hovered === 'vertex' || dragModeRef.current === 'vertex';
    ctx.beginPath();
    ctx.arc(vPx.x, vPx.y, isVHi ? 12 : 9, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(249, 115, 91, 0.16)';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(vPx.x, vPx.y, isVHi ? 6.5 : 5.5, 0, Math.PI * 2);
    ctx.fillStyle = '#F9735B';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#0A0D12';
    ctx.stroke();

    const vBadgeY = curA >= 0 ? Math.min(vPx.y + 24, H - 18) : Math.max(vPx.y - 24, 18);
    const vBadgeX = Math.min(Math.max(vPx.x, 56), W - 56);
    drawBadge(
      ctx,
      `V(${fmt(curH)}, ${fmt(curK)})`,
      vBadgeX,
      vBadgeY,
      '#111620',
      isVHi ? '#F9735B' : 'rgba(249, 115, 91, 0.55)',
      '#EDEBE4'
    );

    ctx.restore();
    return animating;
  }, []);

  const scheduleDraw = useCallback(() => {
    if (rafRef.current !== null) return;
    const stillAnimating = renderFrame();
    if (stillAnimating) {
      const tick = () => {
        rafRef.current = null;
        if (renderFrame()) {
          rafRef.current = requestAnimationFrame(tick);
        }
      };
      rafRef.current = requestAnimationFrame(tick);
    }
  }, [renderFrame]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const initialW = Math.max(260, Math.round(el.clientWidth || 680));
    const initialH = Math.max(260, Math.round(el.clientHeight || 420));
    setSize({ width: initialW, height: initialH });

    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const w = Math.max(260, Math.round(entry.contentRect.width));
        const hBox = Math.max(260, Math.round(entry.contentRect.height));
        setSize((prev) =>
          prev.width === w && prev.height === hBox ? prev : { width: w, height: hBox }
        );
      }
    });
    ro.observe(el);
    return () => {
      ro.disconnect();
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    scheduleDraw();
  }, [
    a,
    h,
    k,
    highlightFeature,
    ghostCurve,
    showParentCurve,
    probeX,
    interactive,
    accentColor,
    hoverTarget,
    reducedMotion,
    size,
    scheduleDraw,
  ]);

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!interactive || !onChange) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    const { toPx } = getTransform(rect.width, rect.height);

    const vPx = toPx(displayRef.current.h, displayRef.current.k);
    const cPx = toPx(displayRef.current.h + 1.2, displayRef.current.k + displayRef.current.a * 1.44);

    if (Math.hypot(px - vPx.x, py - vPx.y) <= 22) {
      dragModeRef.current = 'vertex';
      canvas.setPointerCapture(e.pointerId);
    } else if (Math.hypot(px - cPx.x, py - cPx.y) <= 20) {
      dragModeRef.current = 'curvature';
      canvas.setPointerCapture(e.pointerId);
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!interactive) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    const { toPx, toWorld } = getTransform(rect.width, rect.height);

    if (!dragModeRef.current) {
      const vPx = toPx(displayRef.current.h, displayRef.current.k);
      const cPx = toPx(
        displayRef.current.h + 1.2,
        displayRef.current.k + displayRef.current.a * 1.44
      );
      if (Math.hypot(px - vPx.x, py - vPx.y) <= 22) {
        setHoverTarget('vertex');
      } else if (Math.hypot(px - cPx.x, py - cPx.y) <= 20) {
        setHoverTarget('curvature');
      } else {
        setHoverTarget(null);
      }
      return;
    }

    if (!onChange) return;
    const w = toWorld(px, py);

    if (dragModeRef.current === 'vertex') {
      const nextH = Math.round(Math.min(6, Math.max(-6, w.x)) * 10) / 10;
      const nextK = Math.round(Math.min(5, Math.max(-5, w.y)) * 10) / 10;
      onChange({ a, h: nextH, k: nextK });
    } else if (dragModeRef.current === 'curvature') {
      let rawA = (w.y - k) / 1.44;
      if (Math.abs(rawA) < 0.2) {
        rawA = rawA >= 0 ? 0.2 : -0.2;
      }
      const nextA = Math.round(Math.min(3, Math.max(-3, rawA)) * 20) / 20;
      onChange({ a: nextA, h, k });
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (dragModeRef.current) {
      dragModeRef.current = null;
      try {
        canvasRef.current?.releasePointerCapture(e.pointerId);
      } catch {
        // ignore if already released
      }
      scheduleDraw();
    }
  };

  const discriminant = useMemo(() => -4 * a * k, [a, k]);
  const rootSummary = useMemo(() => {
    if (Math.abs(discriminant) < 1e-4) {
      return {
        badge: '1 Double Root (Tangent)',
        color: '#E5A94C',
        rootsText: `x = ${fmt(h)}`,
      };
    }
    if (discriminant > 0) {
      const off = Math.sqrt(-k / a);
      return {
        badge: '2 Real Roots',
        color: '#34D399',
        rootsText: `x = ${fmt(h - off)}, ${fmt(h + off)}`,
      };
    }
    return {
      badge: '0 Real Roots (Complex)',
      color: '#F9735B',
      rootsText: 'No x-intercepts',
    };
  }, [a, h, k, discriminant]);

  const vertexTex = useMemo(() => buildVertexFormTex(a, h, k), [a, h, k]);
  const standardTex = useMemo(() => buildStandardFormTex(a, h, k), [a, h, k]);

  return (
    <div className="instrument-frame overflow-hidden flex flex-col">
      {showHeaderEquation && (
        <div className="px-4 py-3 border-b hairline-rule bg-[#111620] flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <MathTex tex={vertexTex} className="text-base sm:text-lg text-[#EDEBE4]" />
            <span className="text-[#6C7689] text-xs font-mono-data">≡</span>
            <MathTex tex={standardTex} className="text-sm text-[#9CA6B8]" />
          </div>
          <div className="flex items-center gap-2">
            <span
              className="px-2.5 py-0.5 rounded-full text-[11px] font-mono-data border"
              style={{
                color: rootSummary.color,
                borderColor: `${rootSummary.color}55`,
                backgroundColor: `${rootSummary.color}14`,
              }}
            >
              Δ = {fmt(discriminant)} · {rootSummary.badge}
            </span>
          </div>
        </div>
      )}

      <div ref={containerRef} className={`relative w-full ${heightClass} select-none`}>
        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className={`block w-full h-full touch-none ${
            interactive ? (hoverTarget ? 'cursor-grab active:cursor-grabbing' : 'cursor-crosshair') : ''
          }`}
        />
        {interactive && (
          <div className="pointer-events-none absolute bottom-2.5 left-3 px-2.5 py-1 rounded bg-[#0A0D12]/80 border border-[rgba(237,235,228,0.12)] text-[11px] font-mono-data text-[#9CA6B8]">
            Drag <span className="text-[#F9735B]">● Vertex</span> to translate · Drag{' '}
            <span className="text-[#E5A94C]">◆ Arm</span> to bend curvature
          </div>
        )}
      </div>

      {!compactTelemetry && (
        <div className="px-4 py-2.5 border-t hairline-rule bg-[#111620] grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <span className="text-[#6C7689] uppercase tracking-wider text-[10px] block">Vertex</span>
            <span className="font-mono-data text-[#F9735B]">
              ({fmt(h)}, {fmt(k)})
            </span>
          </div>
          <div>
            <span className="text-[#6C7689] uppercase tracking-wider text-[10px] block">Axis</span>
            <span className="font-mono-data text-[#38BDF8]">x = {fmt(h)}</span>
          </div>
          <div>
            <span className="text-[#6C7689] uppercase tracking-wider text-[10px] block">Real Zeros</span>
            <span className="font-mono-data text-[#34D399]">{rootSummary.rootsText}</span>
          </div>
          <div>
            <span className="text-[#6C7689] uppercase tracking-wider text-[10px] block">Y-Intercept</span>
            <span className="font-mono-data text-[#EDEBE4]">(0, {fmt(a * h * h + k)})</span>
          </div>
        </div>
      )}
    </div>
  );
}

function drawBadge(
  ctx: CanvasRenderingContext2D,
  text: string,
  cx: number,
  cy: number,
  bg: string,
  border: string,
  fg: string
) {
  ctx.save();
  ctx.font = '500 11px "JetBrains Mono", monospace';
  const metrics = ctx.measureText(text);
  const padX = 7;
  const w = metrics.width + padX * 2;
  const h = 20;
  const x = cx - w / 2;
  const y = cy - h / 2;

  ctx.fillStyle = bg;
  ctx.strokeStyle = border;
  ctx.lineWidth = 1;
  ctx.beginPath();
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(x, y, w, h, 4);
  } else {
    ctx.rect(x, y, w, h);
  }
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = fg;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, cx, cy + 0.5);
  ctx.restore();
}
