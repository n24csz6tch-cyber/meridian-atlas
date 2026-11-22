import { useEffect, useRef } from 'react';
import { useReducedMotion } from '../../hooks/useReducedMotion';

interface ObservatoryCanvasProps {
  accentColor?: string;
  heightClass?: string;
  interactive?: boolean;
}

export function ObservatoryCanvas({
  accentColor = '#E5A94C',
  heightClass = 'h-[340px] sm:h-[420px]',
  interactive = true,
}: ObservatoryCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reducedMotion = useReducedMotion();
  const pointerRef = useRef({ nx: 0.25, ny: -0.15, tx: 0.25, ty: -0.15 });
  const latestRef = useRef({ accentColor, reducedMotion });
  latestRef.current = { accentColor, reducedMotion };

  useEffect(() => {
    const el = containerRef.current;
    const canvas = canvasRef.current;
    if (!el || !canvas) return;

    let width = Math.max(240, el.clientWidth || 500);
    let height = Math.max(240, el.clientHeight || 400);
    let inView = true;
    let visible = !document.hidden;
    let raf = 0;
    let theta = 0.65;
    let lastTime = performance.now();

    const drawFrame = () => {
      const { accentColor: accent } = latestRef.current;
      const p = pointerRef.current;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const cw = Math.round(width * dpr);
      const ch = Math.round(height * dpr);
      if (canvas.width !== cw || canvas.height !== ch) {
        canvas.width = cw;
        canvas.height = ch;
      }

      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.save();
      ctx.scale(dpr, dpr);

      ctx.fillStyle = '#0D121A';
      ctx.fillRect(0, 0, width, height);

      const cx = width * 0.5;
      const cy = height * 0.5;
      const R = Math.min(width, height) * 0.36;

      ctx.strokeStyle = 'rgba(237, 235, 228, 0.08)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(16, cy);
      ctx.lineTo(width - 16, cy);
      ctx.moveTo(cx, 16);
      ctx.lineTo(cx, height - 16);
      ctx.stroke();

      [1.14, 1.0, 0.68].forEach((mult, idx) => {
        ctx.beginPath();
        ctx.arc(cx, cy, R * mult, 0, Math.PI * 2);
        ctx.strokeStyle =
          idx === 1 ? 'rgba(237, 235, 228, 0.22)' : 'rgba(237, 235, 228, 0.09)';
        ctx.lineWidth = idx === 1 ? 1.25 : 1;
        ctx.stroke();
      });

      for (let deg = 0; deg < 360; deg += 15) {
        const rad = (deg * Math.PI) / 180;
        const inner = deg % 45 === 0 ? R * 0.94 : R * 0.97;
        const outer = R * 1.02;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(rad) * inner, cy + Math.sin(rad) * inner);
        ctx.lineTo(cx + Math.cos(rad) * outer, cy + Math.sin(rad) * outer);
        ctx.strokeStyle =
          deg % 90 === 0 ? 'rgba(237, 235, 228, 0.35)' : 'rgba(237, 235, 228, 0.12)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      const tilt = p.nx * 0.35;
      const bRatio = 0.52 + p.ny * 0.14;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(tilt);
      ctx.beginPath();
      ctx.ellipse(0, 0, R * 0.92, R * bRatio, 0, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.32)';
      ctx.lineWidth = 1.3;
      ctx.setLineDash([4, 4]);
      ctx.stroke();
      ctx.restore();

      const angle = theta + p.nx * 0.55;
      const px = cx + Math.cos(angle) * R;
      const py = cy - Math.sin(angle) * R;

      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(px, py);
      ctx.strokeStyle = accent;
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(px, cy);
      ctx.strokeStyle = '#38BDF8';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(px, cy);
      ctx.lineTo(px, py);
      ctx.strokeStyle = '#F9735B';
      ctx.lineWidth = 2;
      ctx.stroke();

      const trailStart = cx + R * 1.18;
      const trailSpan = Math.max(0, width - trailStart - 16);
      if (trailSpan > 48) {
        ctx.beginPath();
        for (let i = 0; i <= 56; i++) {
          const t = i / 56;
          const x = trailStart + t * trailSpan;
          const y = cy - Math.sin(angle - t * Math.PI * 2.2) * (R * 0.68);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = 'rgba(52, 211, 153, 0.6)';
        ctx.lineWidth = 1.6;
        ctx.stroke();

        ctx.beginPath();
        ctx.setLineDash([2, 3]);
        ctx.moveTo(px, py);
        ctx.lineTo(trailStart, cy - Math.sin(angle) * (R * 0.68));
        ctx.strokeStyle = 'rgba(237, 235, 228, 0.25)';
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.setLineDash([]);
      }

      ctx.beginPath();
      ctx.arc(px, py, 6, 0, Math.PI * 2);
      ctx.fillStyle = accent;
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#0A0D12';
      ctx.stroke();

      const degNorm = Math.round((((angle * 180) / Math.PI) % 360 + 360) % 360);
      ctx.font = '11px "JetBrains Mono", monospace';
      ctx.fillStyle = '#9CA6B8';
      ctx.textAlign = 'left';
      ctx.fillText(`θ = ${degNorm}°`, 16, 24);
      ctx.fillStyle = '#38BDF8';
      ctx.fillText(`cos θ = ${Math.cos(angle).toFixed(2)}`, 16, height - 34);
      ctx.fillStyle = '#F9735B';
      ctx.fillText(`sin θ = ${Math.sin(angle).toFixed(2)}`, 16, height - 16);

      ctx.restore();
    };

    const tick = (now: number) => {
      raf = 0;
      if (!inView || !visible) return;
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      const { reducedMotion: reduced } = latestRef.current;
      const p = pointerRef.current;
      p.nx += (p.tx - p.nx) * (reduced ? 1 : 0.08);
      p.ny += (p.ty - p.ny) * (reduced ? 1 : 0.08);
      if (!reduced) {
        theta += dt * 0.42;
      }
      drawFrame();
      if (!reduced) {
        raf = requestAnimationFrame(tick);
      }
    };

    const ensureLoop = () => {
      if (!raf && inView && visible && !latestRef.current.reducedMotion) {
        lastTime = performance.now();
        raf = requestAnimationFrame(tick);
      }
    };

    // Synchronous initial paint
    drawFrame();
    ensureLoop();

    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        width = Math.max(240, Math.round(entry.contentRect.width));
        height = Math.max(240, Math.round(entry.contentRect.height));
      }
      drawFrame();
    });
    ro.observe(el);

    const io = new IntersectionObserver((entries) => {
      inView = entries[0]?.isIntersecting ?? true;
      if (inView) ensureLoop();
      else if (raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    });
    io.observe(el);

    const onVisibility = () => {
      visible = !document.hidden;
      if (visible) ensureLoop();
      else if (raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      if (raf) cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [accentColor, reducedMotion]);

  const handleMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!interactive) return;
    const rect = e.currentTarget.getBoundingClientRect();
    pointerRef.current.tx = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    pointerRef.current.ty = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
  };

  return (
    <div
      ref={containerRef}
      onPointerMove={handleMove}
      className={`instrument-frame overflow-hidden relative w-full ${heightClass}`}
    >
      <canvas ref={canvasRef} className="block w-full h-full" />
    </div>
  );
}
