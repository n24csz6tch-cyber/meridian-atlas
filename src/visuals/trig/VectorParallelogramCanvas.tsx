import { useCallback, useEffect, useRef, useState } from 'react';
import { MathTex } from '../../components/MathTex';

export interface VectorParallelogramCanvasProps {
  heightClass?: string;
}

export function VectorParallelogramCanvas({
  heightClass = 'h-[320px] sm:h-[360px]',
}: VectorParallelogramCanvasProps) {
  const [u, setU] = useState<[number, number]>([3, 1.5]);
  const [v, setV] = useState<[number, number]>([-1, 2.5]);
  const [dragging, setDragging] = useState<'u' | 'v' | null>(null);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const sizeRef = useRef({ width: 640, height: 340, dpr: 1 });

  const vecRef = useRef({ u, v, dragging });
  vecRef.current = { u, v, dragging };

  const drawScene = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height, dpr } = sizeRef.current;
    if (width < 60 || height < 60) return;

    const { u: vu, v: vv } = vecRef.current;
    const cx = width * 0.5;
    const cy = height * 0.54;
    const scale = Math.min(width, height) * 0.082;

    const toPx = (pt: [number, number]): [number, number] => [
      cx + pt[0] * scale,
      cy - pt[1] * scale,
    ];

    ctx.save();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    ctx.fillStyle = '#05070C';
    ctx.fillRect(0, 0, width, height);

    // Coordinate grid
    ctx.strokeStyle = 'rgba(237, 235, 228, 0.06)';
    ctx.lineWidth = 1;
    for (let g = -7; g <= 7; g++) {
      const gx = cx + g * scale;
      const gy = cy - g * scale;
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

    ctx.strokeStyle = 'rgba(237, 235, 228, 0.2)';
    ctx.beginPath();
    ctx.moveTo(0, cy);
    ctx.lineTo(width, cy);
    ctx.moveTo(cx, 0);
    ctx.lineTo(cx, height);
    ctx.stroke();

    const origin = toPx([0, 0]);
    const tipU = toPx(vu);
    const tipV = toPx(vv);
    const res: [number, number] = [vu[0] + vv[0], vu[1] + vv[1]];
    const tipR = toPx(res);

    // Shaded Parallelogram Area (|u x v|)
    ctx.fillStyle = 'rgba(255, 120, 90, 0.1)';
    ctx.beginPath();
    ctx.moveTo(origin[0], origin[1]);
    ctx.lineTo(tipU[0], tipU[1]);
    ctx.lineTo(tipR[0], tipR[1]);
    ctx.lineTo(tipV[0], tipV[1]);
    ctx.closePath();
    ctx.fill();

    // Dashed Parallelogram closing edges
    ctx.setLineDash([5, 4]);
    ctx.strokeStyle = 'rgba(244, 185, 86, 0.5)';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(tipU[0], tipU[1]);
    ctx.lineTo(tipR[0], tipR[1]);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(56, 212, 255, 0.5)';
    ctx.beginPath();
    ctx.moveTo(tipV[0], tipV[1]);
    ctx.lineTo(tipR[0], tipR[1]);
    ctx.stroke();
    ctx.setLineDash([]);

    const drawArrow = (
      from: [number, number],
      to: [number, number],
      vecVal: [number, number],
      color: string,
      label: string,
      thick = 2.6
    ) => {
      const ang = Math.atan2(to[1] - from[1], to[0] - from[0]);
      ctx.strokeStyle = color;
      ctx.lineWidth = thick;
      ctx.beginPath();
      ctx.moveTo(from[0], from[1]);
      ctx.lineTo(to[0], to[1]);
      ctx.stroke();

      const headLen = 11;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(to[0], to[1]);
      ctx.lineTo(
        to[0] - headLen * Math.cos(ang - Math.PI / 7),
        to[1] - headLen * Math.sin(ang - Math.PI / 7)
      );
      ctx.lineTo(
        to[0] - headLen * Math.cos(ang + Math.PI / 7),
        to[1] - headLen * Math.sin(ang + Math.PI / 7)
      );
      ctx.closePath();
      ctx.fill();

      ctx.font = '600 11px "JetBrains Mono", monospace';
      ctx.fillStyle = color;
      ctx.textAlign = vecVal[0] < -0.15 ? 'right' : 'left';
      const offX = vecVal[0] < -0.15 ? -14 : 12;
      const offY = vecVal[1] < -0.15 ? 16 : -10;
      ctx.fillText(label, to[0] + offX, to[1] + offY);
    };

    drawArrow(origin, tipU, vu, '#38D4FF', `u⟨${vu[0].toFixed(1)}, ${vu[1].toFixed(1)}⟩`);
    drawArrow(origin, tipV, vv, '#F4B956', `v⟨${vv[0].toFixed(1)}, ${vv[1].toFixed(1)}⟩`);
    drawArrow(origin, tipR, res, '#FF785A', `u+v⟨${res[0].toFixed(1)}, ${res[1].toFixed(1)}⟩`, 3);

    // Draggable control halos for u and v
    const drawHandle = (pt: [number, number], color: string) => {
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.arc(pt[0], pt[1], 10, 0, Math.PI * 2);
      ctx.stroke();
    };
    drawHandle(tipU, 'rgba(56, 212, 255, 0.75)');
    drawHandle(tipV, 'rgba(244, 185, 86, 0.75)');

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
      drawScene();
    };
    updateSize();
    const ro = new ResizeObserver(updateSize);
    ro.observe(container);
    return () => ro.disconnect();
  }, [drawScene]);

  useEffect(() => {
    drawScene();
  }, [u, v, drawScene]);

  const toMath = (clientX: number, clientY: number): [number, number] => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const cx = rect.width * 0.5;
    const cy = rect.height * 0.54;
    const scale = Math.min(rect.width, rect.height) * 0.082;
    const x = Math.round(((clientX - rect.left - cx) / scale) * 4) / 4;
    const y = Math.round(((cy - (clientY - rect.top)) / scale) * 4) / 4;
    return [Math.max(-5, Math.min(5, x)), Math.max(-4, Math.min(4, y))];
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const m = toMath(e.clientX, e.clientY);
    const dU = Math.hypot(m[0] - u[0], m[1] - u[1]);
    const dV = Math.hypot(m[0] - v[0], m[1] - v[1]);
    if (dU <= dV && dU < 1.2) setDragging('u');
    else if (dV < 1.2) setDragging('v');
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!dragging) return;
    const m = toMath(e.clientX, e.clientY);
    if (dragging === 'u') setU(m);
    else setV(m);
  };

  const rx = u[0] + v[0];
  const ry = u[1] + v[1];
  const magR = Math.hypot(rx, ry);
  const dotUV = u[0] * v[0] + u[1] * v[1];
  const dirDeg = (Math.atan2(ry, rx) * 180) / Math.PI;

  return (
    <div className="instrument-frame fiducial-frame overflow-hidden">
      <div className="px-4 py-2.5 border-b hairline-rule bg-[#080C15]/90 flex flex-wrap items-center justify-between gap-2">
        <span className="font-mono-data text-[10px] uppercase tracking-[0.18em] text-[#A7B3C7]">
          Vector Addition · Parallelogram Law (Drag Vector Tips)
        </span>
        <span className="font-mono-data text-[10px] text-[#FF785A]">
          ∥u + v∥ = {magR.toFixed(2)} · θ = {dirDeg.toFixed(1)}°
        </span>
      </div>

      <div ref={containerRef} className={`relative w-full ${heightClass} bg-[#05070C]`}>
        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={() => setDragging(null)}
          onPointerLeave={() => setDragging(null)}
          className="block w-full h-full cursor-grab active:cursor-grabbing touch-none"
        />
      </div>

      <div className="px-4 py-2.5 border-t hairline-rule bg-[#080C15]/95 flex flex-wrap items-center justify-between gap-3 text-xs">
        <MathTex
          tex={`\\vec{u}+\\vec{v} = \\langle ${rx.toFixed(2)},\\; ${ry.toFixed(2)} \\rangle \\quad\\|\\vec{u}+\\vec{v}\\|=${magR.toFixed(2)}`}
          className="text-[#F2F0E8]"
        />
        <span className="font-mono-data text-[11px] text-[#A7B3C7]">
          u · v = {dotUV.toFixed(2)} {Math.abs(dotUV) < 0.05 ? '(Orthogonal!)' : ''}
        </span>
      </div>
    </div>
  );
}
