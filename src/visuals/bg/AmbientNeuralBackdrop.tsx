import { useEffect, useRef } from 'react';
import { useReducedMotion } from '../../hooks/useReducedMotion';

interface DustParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  hue: string;
  phase: number;
  baseAlpha: number;
}

interface HarmonicFilamentNode {
  x: number;
  y: number;
  vx: number;
  vy: number;
  phase: number;
}

interface AmbientPulse {
  from: number;
  to: number;
  t: number;
  speed: number;
  color: string;
}

const GOLD_DUST_PALETTE = ['#F4C46C', '#FFE29E', '#B88938', '#F7F4EC'];

export function AmbientNeuralBackdrop({ accent = '#F4C46C' }: { accent?: string }) {
  const reducedMotion = useReducedMotion();
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
    let dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const pointer = { x: width * 0.5, y: height * 0.3, active: false };

    const dustCount = width < 768 ? 36 : 64;
    const dust: DustParticle[] = Array.from({ length: dustCount }, (_, i) => ({
      x: (((i * 197.3) % 997) / 997) * width,
      y: (((i * 313.7) % 991) / 991) * height,
      vx: Math.sin(i * 1.7) * 0.14,
      vy: -0.12 - ((i * 19) % 10) * 0.018,
      r: i % 5 === 0 ? 1.65 : 0.95,
      hue: GOLD_DUST_PALETTE[i % GOLD_DUST_PALETTE.length],
      phase: i * 0.61,
      baseAlpha: 0.09 + ((i * 23) % 10) * 0.014,
    }));

    const nodeCount = width < 768 ? 14 : 24;
    const nodes: HarmonicFilamentNode[] = Array.from({ length: nodeCount }, (_, i) => ({
      x: (((i * 271.9) % 997) / 997) * width,
      y: (((i * 419.1) % 991) / 991) * height,
      vx: Math.sin(i * 2.1) * 0.18,
      vy: Math.cos(i * 2.7) * 0.18,
      phase: i * 0.83,
    }));

    const pulses: AmbientPulse[] = [];

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
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

    const drawOnce = () => {
      ctx.save();
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);

      // Subtle golden ambient core glow at top observatory horizon
      const topAura = ctx.createRadialGradient(
        width * 0.5,
        height * 0.12,
        10,
        width * 0.5,
        height * 0.12,
        Math.max(width, height) * 0.55
      );
      topAura.addColorStop(0, 'rgba(244, 196, 108, 0.045)');
      topAura.addColorStop(0.55, 'rgba(184, 137, 56, 0.015)');
      topAura.addColorStop(1, 'transparent');
      ctx.fillStyle = topAura;
      ctx.fillRect(0, 0, width, height);

      // Soft pointer-reactive champagne halo
      if (pointer.active) {
        const halo = ctx.createRadialGradient(
          pointer.x,
          pointer.y,
          0,
          pointer.x,
          pointer.y,
          210
        );
        halo.addColorStop(0, `${accentRef.current}14`);
        halo.addColorStop(0.5, 'rgba(244, 196, 108, 0.04)');
        halo.addColorStop(1, 'transparent');
        ctx.fillStyle = halo;
        ctx.beginPath();
        ctx.arc(pointer.x, pointer.y, 210, 0, Math.PI * 2);
        ctx.fill();
      }

      const linkDist = width < 768 ? 155 : 215;

      // Faint golden harmonic filaments
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
            ctx.strokeStyle = `rgba(244, 196, 108, ${(strength * 0.072).toFixed(3)})`;
            ctx.lineWidth = 0.75;
            const mx = (a.x + b.x) * 0.5 - dy * 0.09;
            const my = (a.y + b.y) * 0.5 + dx * 0.09;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.quadraticCurveTo(mx, my, b.x, b.y);
            ctx.stroke();

            if (
              !reducedMotion &&
              pulses.length < 12 &&
              tickCount % 22 === 0 &&
              strength > 0.38 &&
              (i + j + tickCount) % 9 === 0
            ) {
              pulses.push({
                from: i,
                to: j,
                t: 0,
                speed: 0.009 + (i % 3) * 0.003,
                color: i % 3 === 0 ? accentRef.current : '#FFE29E',
              });
            }
          }
        }
      }

      // Traveling subtle golden pulses along harmonic filaments
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
        const mx = (a.x + b.x) * 0.5 - dy * 0.09;
        const my = (a.y + b.y) * 0.5 + dx * 0.09;
        const omt = 1 - p.t;
        const px = omt * omt * a.x + 2 * omt * p.t * mx + p.t * p.t * b.x;
        const py = omt * omt * a.y + 2 * omt * p.t * my + p.t * p.t * b.y;

        const grad = ctx.createRadialGradient(px, py, 0.3, px, py, 5.5);
        grad.addColorStop(0, 'rgba(255, 255, 255, 0.75)');
        grad.addColorStop(0.4, p.color);
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(px, py, 5.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // Drifting subtle golden cosmic dust
      ctx.globalCompositeOperation = 'source-over';
      for (const m of dust) {
        const pulse = 0.65 + 0.35 * Math.sin(m.phase);
        ctx.fillStyle = m.hue;
        ctx.globalAlpha = m.baseAlpha * pulse;
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalAlpha = 1;
      ctx.restore();
    };

    const render = (now: number) => {
      if (!document.hidden && now - lastDraw >= 33) {
        lastDraw = now;
        tickCount += 1;

        if (!reducedMotion) {
          for (const m of dust) {
            m.x += m.vx;
            m.y += m.vy;
            m.phase += 0.02;
            if (m.x < -16) m.x = width + 16;
            if (m.x > width + 16) m.x = -16;
            if (m.y < -16) m.y = height + 16;
            if (m.y > height + 16) m.y = -16;
          }

          for (const n of nodes) {
            n.x += n.vx;
            n.y += n.vy;
            n.phase += 0.012;
            if (n.x < -30) n.x = width + 30;
            if (n.x > width + 30) n.x = -30;
            if (n.y < -30) n.y = height + 30;
            if (n.y > height + 30) n.y = -30;
          }
        }

        drawOnce();
      }
      if (!reducedMotion) {
        raf = window.requestAnimationFrame(render);
      }
    };

    drawOnce();
    if (!reducedMotion) {
      raf = window.requestAnimationFrame(render);
    }

    return () => {
      if (raf) window.cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerleave', onPointerLeave);
    };
  }, [reducedMotion]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 w-full h-full opacity-90"
    />
  );
}
