import { useEffect, useRef } from 'react';
import { CourseId } from '../../data/standards';
import { useReducedMotion } from '../../hooks/useReducedMotion';

interface RgbColor {
  r: number;
  g: number;
  b: number;
}

interface CourseAtmospherePalette {
  primaryHex: string;
  secondaryHex: string;
}

interface DustParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  ox: number;
  oy: number;
  r: number;
  depth: number;
  hueKind: 'primary' | 'secondary' | 'brass' | 'ivory';
  phase: number;
  baseAlpha: number;
  proximity: number;
}

interface HarmonicFilamentNode {
  x: number;
  y: number;
  vx: number;
  vy: number;
  ox: number;
  oy: number;
  depth: number;
  phase: number;
  proximity: number;
  rx: number;
  ry: number;
}

interface AmbientPulse {
  from: number;
  to: number;
  t: number;
  speed: number;
  hueKind: 'primary' | 'secondary';
}

const DEFAULT_RGB: RgbColor = { r: 244, g: 196, b: 108 }; // #F4C46C
const CHAMPAGNE_RGB: RgbColor = { r: 255, g: 226, b: 158 }; // #FFE29E
const BRASS_RGB: RgbColor = { r: 184, g: 137, b: 56 }; // #B88938
const IVORY_RGB: RgbColor = { r: 247, g: 244, b: 236 }; // #F7F4EC

const COURSE_ATMOSPHERE_PALETTES: Record<CourseId, CourseAtmospherePalette> = {
  'algebra-1': { primaryHex: '#F5C25B', secondaryHex: '#FFE29E' },
  geometry: { primaryHex: '#46D6E8', secondaryHex: '#FFE29E' },
  'algebra-2': { primaryHex: '#45E6A6', secondaryHex: '#FFE29E' },
  precalculus: { primaryHex: '#C084FC', secondaryHex: '#F4C46C' },
};

function parseHexRgb(hex: string, fallback: RgbColor): RgbColor {
  const cleaned = hex.trim().replace('#', '');
  if (cleaned.length === 3) {
    const r = Number.parseInt(cleaned[0] + cleaned[0], 16);
    const g = Number.parseInt(cleaned[1] + cleaned[1], 16);
    const b = Number.parseInt(cleaned[2] + cleaned[2], 16);
    if (Number.isFinite(r) && Number.isFinite(g) && Number.isFinite(b)) {
      return { r, g, b };
    }
  } else if (cleaned.length === 6) {
    const r = Number.parseInt(cleaned.slice(0, 2), 16);
    const g = Number.parseInt(cleaned.slice(2, 4), 16);
    const b = Number.parseInt(cleaned.slice(4, 6), 16);
    if (Number.isFinite(r) && Number.isFinite(g) && Number.isFinite(b)) {
      return { r, g, b };
    }
  }
  return { ...fallback };
}

function resolveAtmospherePalette(accent: string, courseId?: CourseId): {
  primary: RgbColor;
  secondary: RgbColor;
} {
  if (courseId && COURSE_ATMOSPHERE_PALETTES[courseId]) {
    const palette = COURSE_ATMOSPHERE_PALETTES[courseId];
    return {
      primary: parseHexRgb(palette.primaryHex, DEFAULT_RGB),
      secondary: parseHexRgb(palette.secondaryHex, CHAMPAGNE_RGB),
    };
  }
  return {
    primary: parseHexRgb(accent, DEFAULT_RGB),
    secondary: CHAMPAGNE_RGB,
  };
}

function mixRgb(a: RgbColor, b: RgbColor, t: number): RgbColor {
  return {
    r: a.r + (b.r - a.r) * t,
    g: a.g + (b.g - a.g) * t,
    b: a.b + (b.b - a.b) * t,
  };
}

function rgbaStr(c: RgbColor, alpha: number): string {
  return `rgba(${Math.round(c.r)}, ${Math.round(c.g)}, ${Math.round(c.b)}, ${Math.max(0, Math.min(1, alpha)).toFixed(3)})`;
}

function wrapCoord(value: number, span: number, margin: number): number {
  const total = span + margin * 2;
  return (((value + margin) % total) + total) % total - margin;
}

const HUE_KINDS: DustParticle['hueKind'][] = ['primary', 'secondary', 'brass', 'ivory'];

export function AmbientNeuralBackdrop({
  accent = '#F4C46C',
  courseId,
}: {
  accent?: string;
  courseId?: CourseId;
}): JSX.Element {
  const reducedMotion = useReducedMotion();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const targetPaletteRef = useRef(resolveAtmospherePalette(accent, courseId));
  const redrawRef = useRef<(() => void) | null>(null);

  targetPaletteRef.current = resolveAtmospherePalette(accent, courseId);

  useEffect(() => {
    if (reducedMotion) {
      redrawRef.current?.();
    }
  }, [accent, courseId, reducedMotion]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    let dpr = Math.min(window.devicePixelRatio || 1, 1.5);

    const pointerTarget = { x: width * 0.5, y: height * 0.3, active: false };
    const pointer = { x: width * 0.5, y: height * 0.3, strength: 0 };

    let scrollTargetY = window.scrollY || window.pageYOffset || 0;
    let scrollY = reducedMotion ? 0 : scrollTargetY;

    let currentPrimary: RgbColor = { ...targetPaletteRef.current.primary };
    let currentSecondary: RgbColor = { ...targetPaletteRef.current.secondary };

    const dustCount = width < 768 ? 38 : 68;
    const dust: DustParticle[] = Array.from({ length: dustCount }, (_, i) => ({
      x: (((i * 197.3) % 997) / 997) * width,
      y: (((i * 313.7) % 991) / 991) * height,
      vx: Math.sin(i * 1.7) * 0.14,
      vy: -0.11 - ((i * 19) % 10) * 0.016,
      ox: 0,
      oy: 0,
      r: i % 5 === 0 ? 1.65 : i % 3 === 0 ? 1.2 : 0.9,
      depth: 0.25 + ((i * 37) % 100) / 135,
      hueKind: HUE_KINDS[i % HUE_KINDS.length],
      phase: i * 0.61,
      baseAlpha: 0.09 + ((i * 23) % 10) * 0.014,
      proximity: 0,
    }));

    const nodeCount = width < 768 ? 14 : 24;
    const nodes: HarmonicFilamentNode[] = Array.from({ length: nodeCount }, (_, i) => {
      const x = (((i * 271.9) % 997) / 997) * width;
      const y = (((i * 419.1) % 991) / 991) * height;
      return {
        x,
        y,
        vx: Math.sin(i * 2.1) * 0.16,
        vy: Math.cos(i * 2.7) * 0.16,
        ox: 0,
        oy: 0,
        depth: 0.35 + ((i * 29) % 100) / 160,
        phase: i * 0.83,
        proximity: 0,
        rx: x,
        ry: y,
      };
    });

    const pulses: AmbientPulse[] = [];

    const resize = () => {
      const prevWidth = width;
      const prevHeight = height;
      width = window.innerWidth;
      height = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      if (prevWidth > 0 && prevHeight > 0 && (prevWidth !== width || prevHeight !== height)) {
        const sx = width / prevWidth;
        const sy = height / prevHeight;
        for (const m of dust) {
          m.x *= sx;
          m.y *= sy;
        }
        for (const n of nodes) {
          n.x *= sx;
          n.y *= sy;
        }
      }
      redrawRef.current?.();
    };
    resize();

    const onPointerMove = (e: PointerEvent) => {
      if (pointer.strength < 0.02) {
        pointer.x = e.clientX;
        pointer.y = e.clientY;
      }
      pointerTarget.x = e.clientX;
      pointerTarget.y = e.clientY;
      pointerTarget.active = true;
    };

    const onPointerLeave = () => {
      pointerTarget.active = false;
    };

    const onScroll = () => {
      scrollTargetY = window.scrollY || window.pageYOffset || 0;
    };

    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    document.addEventListener('pointerleave', onPointerLeave);
    window.addEventListener('blur', onPointerLeave);
    window.addEventListener('scroll', onScroll, { passive: true });

    let raf = 0;
    let tickCount = 0;
    let lastTime = performance.now();

    const drawOnce = () => {
      if (reducedMotion) {
        currentPrimary = { ...targetPaletteRef.current.primary };
        currentSecondary = { ...targetPaletteRef.current.secondary };
      }

      const horizonMix = mixRgb(DEFAULT_RGB, currentPrimary, 0.52);
      const horizonY = height * 0.12 + Math.max(-44, Math.min(44, -scrollY * 0.025));

      ctx.save();
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);

      // Course-tinted observatory horizon core glow with subtle scroll depth
      const topAura = ctx.createRadialGradient(
        width * 0.5,
        horizonY,
        10,
        width * 0.5,
        horizonY,
        Math.max(width, height) * 0.58,
      );
      topAura.addColorStop(0, rgbaStr(horizonMix, 0.062));
      topAura.addColorStop(0.5, rgbaStr(currentPrimary, 0.022));
      topAura.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = topAura;
      ctx.fillRect(0, 0, width, height);

      // Soft translucent pointer-reactive radial aura halo
      if (!reducedMotion && pointer.strength > 0.01) {
        const haloRadius = width < 768 ? 165 : 240;
        const halo = ctx.createRadialGradient(
          pointer.x,
          pointer.y,
          0,
          pointer.x,
          pointer.y,
          haloRadius,
        );
        halo.addColorStop(0, rgbaStr(currentPrimary, 0.115 * pointer.strength));
        halo.addColorStop(0.42, rgbaStr(currentSecondary, 0.044 * pointer.strength));
        halo.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = halo;
        ctx.beginPath();
        ctx.arc(pointer.x, pointer.y, haloRadius, 0, Math.PI * 2);
        ctx.fill();

        const coreHalo = ctx.createRadialGradient(
          pointer.x,
          pointer.y,
          0,
          pointer.x,
          pointer.y,
          76,
        );
        coreHalo.addColorStop(0, rgbaStr(currentSecondary, 0.065 * pointer.strength));
        coreHalo.addColorStop(0.55, rgbaStr(currentPrimary, 0.025 * pointer.strength));
        coreHalo.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = coreHalo;
        ctx.beginPath();
        ctx.arc(pointer.x, pointer.y, 76, 0, Math.PI * 2);
        ctx.fill();
      }

      // Precompute rendered node coordinates with scroll-parallax & magnetic offset
      for (const n of nodes) {
        const baseY = reducedMotion
          ? n.y
          : wrapCoord(n.y - scrollY * 0.055 * n.depth, height, 30);
        n.rx = n.x + n.ox;
        n.ry = baseY + n.oy;
      }

      const linkDist = width < 768 ? 155 : 220;
      const baseFilamentColor = mixRgb(DEFAULT_RGB, currentPrimary, 0.44);

      // Constellation filaments with course tint + cursor illumination
      ctx.globalCompositeOperation = 'lighter';
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];
          const dx = b.rx - a.rx;
          const dy = b.ry - a.ry;
          const d = Math.hypot(dx, dy);
          if (d < linkDist) {
            const strength = 1 - d / linkDist;
            const mx = (a.rx + b.rx) * 0.5 - dy * 0.09;
            const my = (a.ry + b.ry) * 0.5 + dx * 0.09;

            let midProx = 0;
            if (!reducedMotion && pointer.strength > 0.01) {
              const md = Math.hypot(pointer.x - mx, pointer.y - my);
              const illumRadius = width < 768 ? 160 : 230;
              if (md < illumRadius) {
                midProx = (1 - md / illumRadius) ** 2 * pointer.strength;
              }
            }

            const filamentProx = Math.max(a.proximity, b.proximity, midProx);
            const filamentRgb = mixRgb(baseFilamentColor, currentPrimary, filamentProx * 0.72);
            const alpha = strength * (0.075 + filamentProx * 0.19);

            ctx.strokeStyle = rgbaStr(filamentRgb, alpha);
            ctx.lineWidth = 0.75 + filamentProx * 0.75;
            ctx.beginPath();
            ctx.moveTo(a.rx, a.ry);
            ctx.quadraticCurveTo(mx, my, b.rx, b.ry);
            ctx.stroke();

            if (
              !reducedMotion &&
              pulses.length < 14 &&
              tickCount % 22 === 0 &&
              strength > 0.36 &&
              (i + j + tickCount) % 9 === 0
            ) {
              pulses.push({
                from: i,
                to: j,
                t: 0,
                speed: 0.009 + (i % 3) * 0.003,
                hueKind: i % 3 === 0 ? 'primary' : 'secondary',
              });
            }
          }
        }
      }

      // Luminous neural node anchors
      for (const n of nodes) {
        const nodeGlowAlpha = 0.14 + n.proximity * 0.45;
        const nodeColor = mixRgb(currentSecondary, currentPrimary, 0.55);
        if (n.proximity > 0.05) {
          const haloR = 8 + n.proximity * 10;
          const nodeHalo = ctx.createRadialGradient(n.rx, n.ry, 0.2, n.rx, n.ry, haloR);
          nodeHalo.addColorStop(0, rgbaStr(currentPrimary, 0.35 * n.proximity));
          nodeHalo.addColorStop(1, 'rgba(0, 0, 0, 0)');
          ctx.fillStyle = nodeHalo;
          ctx.beginPath();
          ctx.arc(n.rx, n.ry, haloR, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.fillStyle = rgbaStr(nodeColor, nodeGlowAlpha);
        ctx.beginPath();
        ctx.arc(n.rx, n.ry, 1.05 + n.proximity * 1.35, 0, Math.PI * 2);
        ctx.fill();
      }

      // Traveling subtle pulses along harmonic filaments
      for (let k = pulses.length - 1; k >= 0; k--) {
        const p = pulses[k];
        if (p.t >= 1) {
          pulses.splice(k, 1);
          continue;
        }
        const a = nodes[p.from];
        const b = nodes[p.to];
        const dx = b.rx - a.rx;
        const dy = b.ry - a.ry;
        const mx = (a.rx + b.rx) * 0.5 - dy * 0.09;
        const my = (a.ry + b.ry) * 0.5 + dx * 0.09;
        const omt = 1 - p.t;
        const px = omt * omt * a.rx + 2 * omt * p.t * mx + p.t * p.t * b.rx;
        const py = omt * omt * a.ry + 2 * omt * p.t * my + p.t * p.t * b.ry;
        const pulseRgb = p.hueKind === 'primary' ? currentPrimary : currentSecondary;

        const grad = ctx.createRadialGradient(px, py, 0.3, px, py, 5.8);
        grad.addColorStop(0, 'rgba(255, 255, 255, 0.78)');
        grad.addColorStop(0.4, rgbaStr(pulseRgb, 0.85));
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(px, py, 5.8, 0, Math.PI * 2);
        ctx.fill();
      }

      // Drifting golden & course-tinted cosmic stardust with scroll-parallax depth
      ctx.globalCompositeOperation = 'source-over';
      for (const m of dust) {
        const baseY = reducedMotion
          ? m.y
          : wrapCoord(m.y - scrollY * 0.12 * m.depth, height, 16);
        const dx = m.x + m.ox;
        const dy = baseY + m.oy;
        const twinkle = 0.65 + 0.35 * Math.sin(m.phase);

        let baseColor: RgbColor;
        if (m.hueKind === 'primary') {
          baseColor = currentPrimary;
        } else if (m.hueKind === 'secondary') {
          baseColor = currentSecondary;
        } else if (m.hueKind === 'brass') {
          baseColor = BRASS_RGB;
        } else {
          baseColor = IVORY_RGB;
        }

        const dustColor =
          m.proximity > 0.02
            ? mixRgb(baseColor, currentPrimary, m.proximity * 0.65)
            : baseColor;
        const alpha = m.baseAlpha * twinkle + m.proximity * 0.28;
        const radius = m.r + m.proximity * 0.65;

        ctx.fillStyle = rgbaStr(dustColor, alpha);
        ctx.beginPath();
        ctx.arc(dx, dy, radius, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    };

    redrawRef.current = drawOnce;

    const render = (now: number) => {
      const rawDt = (now - lastTime) / 1000;
      lastTime = now;

      if (!document.hidden) {
        const dt = Math.min(0.05, Math.max(0.001, rawDt));
        const dt60 = dt * 60;
        tickCount += 1;

        // Smooth course tint interpolation
        const colorRate = 1 - Math.exp(-5.5 * dt);
        currentPrimary = mixRgb(currentPrimary, targetPaletteRef.current.primary, colorRate);
        currentSecondary = mixRgb(currentSecondary, targetPaletteRef.current.secondary, colorRate);

        // Smooth pointer target damping & strength envelope
        const pointerLerp = 1 - Math.exp(-11 * dt);
        pointer.x += (pointerTarget.x - pointer.x) * pointerLerp;
        pointer.y += (pointerTarget.y - pointer.y) * pointerLerp;
        const targetStrength = pointerTarget.active ? 1 : 0;
        pointer.strength += (targetStrength - pointer.strength) * (1 - Math.exp(-7 * dt));

        // Smooth scroll parallax damping
        scrollY += (scrollTargetY - scrollY) * (1 - Math.exp(-10 * dt));

        if (!reducedMotion) {
          const dustMagneticRadius = width < 768 ? 120 : 170;
          const nodeMagneticRadius = width < 768 ? 165 : 240;
          const springLerp = 1 - Math.exp(-8.5 * dt);

          for (const m of dust) {
            m.x = wrapCoord(m.x + m.vx * dt60, width, 16);
            m.y = wrapCoord(m.y + m.vy * dt60, height, 16);
            m.phase += 0.02 * dt60;

            const screenY = wrapCoord(m.y - scrollY * 0.12 * m.depth, height, 16);
            let tx = 0;
            let ty = 0;
            let prox = 0;
            if (pointer.strength > 0.01) {
              const mdx = pointer.x - m.x;
              const mdy = pointer.y - screenY;
              const d = Math.hypot(mdx, mdy);
              if (d < dustMagneticRadius) {
                prox = (1 - d / dustMagneticRadius) ** 2 * pointer.strength;
                tx = mdx * 0.06 * prox;
                ty = mdy * 0.06 * prox;
              }
            }
            m.ox += (tx - m.ox) * springLerp;
            m.oy += (ty - m.oy) * springLerp;
            m.proximity += (prox - m.proximity) * springLerp;
          }

          for (const n of nodes) {
            n.x = wrapCoord(n.x + n.vx * dt60, width, 30);
            n.y = wrapCoord(n.y + n.vy * dt60, height, 30);
            n.phase += 0.012 * dt60;

            const screenY = wrapCoord(n.y - scrollY * 0.055 * n.depth, height, 30);
            let tx = 0;
            let ty = 0;
            let prox = 0;
            if (pointer.strength > 0.01) {
              const ndx = pointer.x - n.x;
              const ndy = pointer.y - screenY;
              const d = Math.hypot(ndx, ndy);
              if (d < nodeMagneticRadius) {
                prox = (1 - d / nodeMagneticRadius) ** 2 * pointer.strength;
                tx = ndx * 0.085 * prox;
                ty = ndy * 0.085 * prox;
              }
            }
            n.ox += (tx - n.ox) * springLerp;
            n.oy += (ty - n.oy) * springLerp;
            n.proximity += (prox - n.proximity) * springLerp;
          }

          for (const p of pulses) {
            p.t += p.speed * dt60;
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
      redrawRef.current = null;
      if (raf) window.cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('pointerleave', onPointerLeave);
      window.removeEventListener('blur', onPointerLeave);
      window.removeEventListener('scroll', onScroll);
    };
  }, [reducedMotion]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 w-full h-full opacity-95"
    />
  );
}
