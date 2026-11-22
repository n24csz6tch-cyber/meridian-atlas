import { useEffect, useRef } from 'react';

interface AmbientNode {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  symbol: string | null;
  hue: string;
  phase: number;
}

interface AmbientPulse {
  from: number;
  to: number;
  t: number;
  speed: number;
  color: string;
}

const MATH_GLYPHS = ['π', '∑', '√', 'Δ', '∞', 'θ', 'λ', '∫', 'φ', 'eⁱπ', '∇', '∂', 'log', 'sin'];
const PALETTE = ['#F5BC5E', '#38D9FF', '#36EBA8', '#FF7A5C'];

export function AmbientNeuralBackdrop({ accent = '#F5BC5E' }: { accent?: string }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const accentRef = useRef(accent);
  accentRef.current = accent;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    const dpr = 1;
    const pointer = { x: width * 0.5, y: height * 0.3, active: false };

    const nodeCount = width < 768 ? 20 : 34;
    const nodes: AmbientNode[] = Array.from({ length: nodeCount }, (_, i) => ({
      x: ((i * 197.3) % 1) * width || Math.random() * width,
      y: ((i * 313.7) % 1) * height || Math.random() * height,
      vx: Math.sin(i * 1.9) * 0.32,
      vy: Math.cos(i * 2.3) * 0.32,
      r: i % 4 === 0 ? 2.6 : 1.5,
      symbol: i % 3 === 0 ? MATH_GLYPHS[i % MATH_GLYPHS.length] : null,
      hue: PALETTE[i % PALETTE.length],
      phase: i * 0.7,
    }));

    const pulses: AmbientPulse[] = [];

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };
    resize();

    const onPointerMove = (e: PointerEvent) => {
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      pointer.active = true;
    };
    const onPointerLeave = () => {
      pointer.active = false;
    };

    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerleave', onPointerLeave);

    let raf = 0;
    let tickCount = 0;
    let lastDraw = 0;

    const render = (now: number) => {
      if (!document.hidden && now - lastDraw >= 33) {
        lastDraw = now;
        tickCount += 1;
        ctx.save();
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, width, height);

        // Soft pointer-reactive atmospheric veil (bounded circle, never full-screen fill)
        if (pointer.active) {
          const halo = ctx.createRadialGradient(
            pointer.x,
            pointer.y,
            0,
            pointer.x,
            pointer.y,
            220
          );
          halo.addColorStop(0, `${accentRef.current}16`);
          halo.addColorStop(1, 'transparent');
          ctx.fillStyle = halo;
          ctx.beginPath();
          ctx.arc(pointer.x, pointer.y, 220, 0, Math.PI * 2);
          ctx.fill();
        }

        const linkDist = width < 768 ? 145 : 195;

        // Advance floating neural nodes
        for (const n of nodes) {
          n.x += n.vx;
          n.y += n.vy;
          n.phase += 0.015;
          if (n.x < -30) n.x = width + 30;
          if (n.x > width + 30) n.x = -30;
          if (n.y < -30) n.y = height + 30;
          if (n.y > height + 30) n.y = -30;
        }

        // Draw curved subtle synaptic filaments between nearby nodes
        ctx.globalCompositeOperation = 'lighter';
        for (let i = 0; i < nodes.length; i++) {
          const a = nodes[i];
          for (let j = i + 1; j < nodes.length; j++) {
            const b = nodes[j];
            const dx = b.x - a.x;
            const dy = b.y - a.y;
            const d = Math.hypot(dx, dy);
            if (d < linkDist) {
              const strength = 1 - d / linkDist;
              ctx.strokeStyle = `rgba(120, 175, 225, ${(strength * 0.12).toFixed(3)})`;
              ctx.lineWidth = 0.85;
              const mx = (a.x + b.x) * 0.5 - dy * 0.08;
              const my = (a.y + b.y) * 0.5 + dx * 0.08;
              ctx.beginPath();
              ctx.moveTo(a.x, a.y);
              ctx.quadraticCurveTo(mx, my, b.x, b.y);
              ctx.stroke();

              // Periodically spawn a Claude-style glowing neural pulse along a filament
              if (pulses.length < 18 && tickCount % 16 === 0 && strength > 0.35 && (i + j + tickCount) % 7 === 0) {
                pulses.push({
                  from: i,
                  to: j,
                  t: 0,
                  speed: 0.012 + (i % 3) * 0.004,
                  color: i % 2 === 0 ? accentRef.current : '#38D9FF',
                });
              }
            }
          }
        }

        // Draw traveling photon pulses along neural connectors
        for (let k = pulses.length - 1; k >= 0; k--) {
          const p = pulses[k];
          p.t += p.speed;
          if (p.t >= 1) {
            pulses.splice(k, 1);
            continue;
          }
          const a = nodes[p.from];
          const b = nodes[p.to];
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const mx = (a.x + b.x) * 0.5 - dy * 0.08;
          const my = (a.y + b.y) * 0.5 + dx * 0.08;
          const omt = 1 - p.t;
          const px = omt * omt * a.x + 2 * omt * p.t * mx + p.t * p.t * b.x;
          const py = omt * omt * a.y + 2 * omt * p.t * my + p.t * p.t * b.y;

          const grad = ctx.createRadialGradient(px, py, 0.5, px, py, 7);
          grad.addColorStop(0, '#FFFFFF');
          grad.addColorStop(0.35, p.color);
          grad.addColorStop(1, 'transparent');
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(px, py, 7, 0, Math.PI * 2);
          ctx.fill();
        }

        // Draw neural dots & floating subtle mathematical symbols
        ctx.globalCompositeOperation = 'source-over';
        ctx.font = '11px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        for (const n of nodes) {
          const breathe = 0.25 + 0.18 * Math.sin(n.phase);
          ctx.fillStyle = n.hue;
          ctx.globalAlpha = breathe;
          ctx.beginPath();
          ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
          ctx.fill();

          if (n.symbol) {
            ctx.globalAlpha = 0.14 + 0.07 * Math.sin(n.phase);
            ctx.fillStyle = '#DCE6F7';
            ctx.fillText(n.symbol, n.x + 12, n.y - 10);
          }
        }
        ctx.globalAlpha = 1;
        ctx.restore();
      }
      raf = window.requestAnimationFrame(render);
    };

    render(performance.now());
    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerleave', onPointerLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 w-full h-full opacity-85"
    />
  );
}
