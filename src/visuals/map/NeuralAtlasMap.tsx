import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Search, Sparkles, Zap } from 'lucide-react';
import { MathTex } from '../../components/MathTex';
import {
  COURSES,
  CURRICULUM_NODES,
  CurriculumNode,
  getCoursePrerequisites,
  getCourseUnlocks,
} from '../../data/curriculumGraph';
import { CourseId } from '../../data/standards';

export interface NeuralAtlasMapProps {
  heightClass?: string;
  compact?: boolean;
  initialNodeId?: string;
  forcedSelectedId?: string;
}

const COURSE_ORDER: CourseId[] = ['algebra-1', 'geometry', 'algebra-2', 'precalculus'];

interface EdgeDef {
  from: CurriculumNode;
  to: CurriculumNode;
  cpX: number;
  cpY: number;
  seed: number;
}

export function NeuralAtlasMap({
  heightClass = 'h-[520px] sm:h-[580px]',
  compact = false,
  initialNodeId = 'a2-matrices',
  forcedSelectedId,
}: NeuralAtlasMapProps) {
  const navigate = useNavigate();
  const [selectedId, setSelectedId] = useState<string>(initialNodeId);
  useEffect(() => {
    if (forcedSelectedId) setSelectedId(forcedSelectedId);
  }, [forcedSelectedId]);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [courseFilter, setCourseFilter] = useState<CourseId | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const sizeRef = useRef({ width: 1000, height: 540, dpr: 1 });
  const visibleRef = useRef(true);
  const timeRef = useRef(0);
  const waveStartRef = useRef(0);

  const nodeMap = useMemo(() => new Map(CURRICULUM_NODES.map((n) => [n.id, n])), []);

  const edges = useMemo<EdgeDef[]>(() => {
    const list: EdgeDef[] = [];
    CURRICULUM_NODES.forEach((node, idx) => {
      node.prerequisites.forEach((pid, pIdx) => {
        const src = nodeMap.get(pid);
        if (!src) return;
        const midX = (src.nx + node.nx) * 0.5;
        const midY = (src.ny + node.ny) * 0.5;
        const dy = node.ny - src.ny;
        const dx = node.nx - src.nx;
        const bend = ((idx + pIdx) % 2 === 0 ? 1 : -1) * Math.min(48, Math.hypot(dx, dy) * 0.14);
        list.push({
          from: src,
          to: node,
          cpX: midX - (dy / (Math.hypot(dx, dy) + 1)) * bend,
          cpY: midY + (dx / (Math.hypot(dx, dy) + 1)) * bend,
          seed: (idx * 0.37 + pIdx * 0.61) % 1,
        });
      });
    });
    return list;
  }, [nodeMap]);

  const activeFocusId = hoveredId ?? selectedId;
  const prereqSet = useMemo(() => getCoursePrerequisites(activeFocusId), [activeFocusId]);
  const unlockSet = useMemo(() => getCourseUnlocks(activeFocusId), [activeFocusId]);

  const matchingSet = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const set = new Set<string>();
    for (const n of CURRICULUM_NODES) {
      const courseOk = courseFilter === 'all' || n.courseId === courseFilter;
      const queryOk =
        !q ||
        n.title.toLowerCase().includes(q) ||
        n.code.toLowerCase().includes(q) ||
        n.symbol.toLowerCase().includes(q) ||
        n.instrumentTag.toLowerCase().includes(q) ||
        n.standards.some((s) => s.toLowerCase().includes(q));
      if (courseOk && queryOk) set.add(n.id);
    }
    return set;
  }, [courseFilter, searchQuery]);

  const stateRef = useRef({
    activeFocusId,
    selectedId,
    hoveredId,
    prereqSet,
    unlockSet,
    matchingSet,
  });
  stateRef.current = {
    activeFocusId,
    selectedId,
    hoveredId,
    prereqSet,
    unlockSet,
    matchingSet,
  };

  const toScreen = useCallback((nx: number, ny: number): [number, number] => {
    const { width, height } = sizeRef.current;
    const padX = Math.max(28, width * 0.034);
    const padTop = 48;
    const padBottom = 42;
    const sx = padX + (nx / 1180) * (width - padX * 2);
    const sy = padTop + (ny / 570) * (height - padTop - padBottom);
    return [sx, sy];
  }, []);

  const drawAtlas = useCallback(
    (advance: boolean) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const { width, height, dpr } = sizeRef.current;
      if (width < 80 || height < 80) return;

      if (advance) {
        timeRef.current += 0.016;
      }
      const t = timeRef.current;
      const waveElapsed = t - waveStartRef.current;
      const waveX = waveElapsed < 4.5 ? (waveElapsed / 4.5) * 1320 - 70 : -999;

      const {
        activeFocusId: focusId,
        selectedId: selId,
        prereqSet: preSet,
        unlockSet: unlSet,
        matchingSet: matchSet,
      } = stateRef.current;

      ctx.save();
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Deep observatory void background
      ctx.fillStyle = '#040710';
      ctx.fillRect(0, 0, width, height);

      // 4 Soft Spectral Nebulae behind course territories
      const bands: { cid: CourseId; cxFrac: number; label: string }[] = [
        { cid: 'algebra-1', cxFrac: 0.15, label: 'ALGEBRA 1 · 9 UNITS' },
        { cid: 'geometry', cxFrac: 0.4, label: 'GEOMETRY · 9 UNITS' },
        { cid: 'algebra-2', cxFrac: 0.65, label: 'ALGEBRA 2 · 9 UNITS' },
        { cid: 'precalculus', cxFrac: 0.88, label: 'PRECALCULUS · 9 UNITS' },
      ];

      for (const b of bands) {
        const c = COURSES[b.cid];
        const bx = width * b.cxFrac;
        const by = height * 0.52;
        const r = Math.min(width * 0.24, height * 0.56);
        const grad = ctx.createRadialGradient(bx, by, 10, bx, by, r);
        grad.addColorStop(0, `${c.accent}18`);
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);

        // Subtle vertical territory header
        ctx.font = width < 640 ? '600 8.5px "JetBrains Mono", monospace' : '600 10px "JetBrains Mono", monospace';
        ctx.fillStyle = `${c.accent}BB`;
        ctx.textAlign = 'center';
        ctx.fillText(b.label, bx, 24);
      }

      // Faint astrolabe background concentric rings
      ctx.strokeStyle = 'rgba(226, 232, 246, 0.035)';
      ctx.lineWidth = 1;
      for (let r = 1; r <= 3; r++) {
        ctx.beginPath();
        ctx.arc(width * 0.5, height * 0.52, r * Math.min(width, height) * 0.22, 0, Math.PI * 2);
        ctx.stroke();
      }

      // 1. CLAUDE-STYLE GLOWING NEURAL AXON CONNECTORS & TRAVELING PHOTON PULSES
      ctx.globalCompositeOperation = 'lighter';

      for (const edge of edges) {
        const [x0, y0] = toScreen(edge.from.nx, edge.from.ny);
        const [x1, y1] = toScreen(edge.to.nx, edge.to.ny);
        const [cx, cy] = toScreen(edge.cpX, edge.cpY);

        const isUpstream =
          (edge.to.id === focusId && preSet.has(edge.from.id)) ||
          (preSet.has(edge.to.id) && preSet.has(edge.from.id));
        const isDownstream =
          (edge.from.id === focusId && unlSet.has(edge.to.id)) ||
          (unlSet.has(edge.from.id) && unlSet.has(edge.to.id));
        const isMatched = matchSet.has(edge.from.id) && matchSet.has(edge.to.id);
        const isHighlighted = isUpstream || isDownstream;

        const baseColor = isUpstream
          ? '245, 188, 94'
          : isDownstream
            ? '56, 217, 255'
            : '115, 165, 225';

        // Outer soft bloom on highlighted pathways
        if (isHighlighted) {
          ctx.strokeStyle = `rgba(${baseColor}, 0.22)`;
          ctx.lineWidth = 5.5;
          ctx.beginPath();
          ctx.moveTo(x0, y0);
          ctx.quadraticCurveTo(cx, cy, x1, y1);
          ctx.stroke();
        }

        // Crisp inner neural filament
        const alpha = isHighlighted ? 0.78 : isMatched ? 0.22 : 0.06;
        ctx.strokeStyle = `rgba(${baseColor}, ${alpha})`;
        ctx.lineWidth = isHighlighted ? 1.8 : 1.0;
        ctx.beginPath();
        ctx.moveTo(x0, y0);
        ctx.quadraticCurveTo(cx, cy, x1, y1);
        ctx.stroke();

        // Traveling synaptic light packets along active & ambient axons
        if (isHighlighted || isMatched) {
          const speed = isHighlighted ? 0.42 : 0.16;
          const u = (t * speed + edge.seed) % 1;
          const omt = 1 - u;
          const px = omt * omt * x0 + 2 * omt * u * cx + u * u * x1;
          const py = omt * omt * y0 + 2 * omt * u * cy + u * u * y1;

          const pRadius = isHighlighted ? 6.5 : 3.4;
          const pGrad = ctx.createRadialGradient(px, py, 0.5, px, py, pRadius);
          pGrad.addColorStop(0, '#FFFFFF');
          pGrad.addColorStop(0.4, `rgba(${baseColor}, ${isHighlighted ? 0.95 : 0.65})`);
          pGrad.addColorStop(1, 'transparent');
          ctx.fillStyle = pGrad;
          ctx.beginPath();
          ctx.arc(px, py, pRadius, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // 2. GLOWING MATHEMATICAL SYMBOL NODES
      const isNarrow = width < 640;
      const baseR = isNarrow ? 12.5 : width < 960 ? 16.5 : 19;

      for (let i = 0; i < CURRICULUM_NODES.length; i++) {
        const node = CURRICULUM_NODES[i];
        const c = COURSES[node.courseId];
        const [sx, sy] = toScreen(node.nx, node.ny);
        const isFocus = node.id === focusId;
        const isSelected = node.id === selId;
        const isRel = preSet.has(node.id) || unlSet.has(node.id);
        const isMatch = matchSet.has(node.id);

        // Cascade wave proximity glow
        const waveDist = Math.abs(node.nx - waveX);
        const waveBoost = waveDist < 85 ? 1 - waveDist / 85 : 0;

        const r = isFocus ? baseR + 4 : baseR;
        const breathe = 0.5 + 0.5 * Math.sin(t * 2.1 + i * 0.7);

        // Additive glow aura
        ctx.globalCompositeOperation = 'lighter';
        if (isFocus || isRel || waveBoost > 0.05) {
          const haloR = r * (2.3 + waveBoost * 1.1 + (isFocus ? 0.45 : 0));
          const halo = ctx.createRadialGradient(sx, sy, 2, sx, sy, haloR);
          halo.addColorStop(
            0,
            `${c.accent}${isFocus || waveBoost > 0.3 ? '88' : '44'}`
          );
          halo.addColorStop(1, 'transparent');
          ctx.fillStyle = halo;
          ctx.beginPath();
          ctx.arc(sx, sy, haloR, 0, Math.PI * 2);
          ctx.fill();
        }

        // Rotating orbital astrolabe ring on focused / selected node
        if (isFocus || isSelected) {
          ctx.strokeStyle = `${c.accent}CC`;
          ctx.lineWidth = 1.4;
          ctx.setLineDash([6, 4]);
          ctx.beginPath();
          ctx.arc(sx, sy, r + 7, t * 0.9, t * 0.9 + Math.PI * 1.65);
          ctx.stroke();
          ctx.setLineDash([]);
        }

        // Solid obsidian core circle
        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = isMatch || isFocus || isRel ? 1 : 0.24;
        ctx.fillStyle = isFocus ? '#111A2E' : '#080D18';
        ctx.beginPath();
        ctx.arc(sx, sy, r, 0, Math.PI * 2);
        ctx.fill();

        // Subtle interior tinted bloom
        const innerGrad = ctx.createRadialGradient(sx, sy - r * 0.3, 1, sx, sy, r);
        innerGrad.addColorStop(0, `${c.accent}${isFocus ? '48' : '22'}`);
        innerGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = innerGrad;
        ctx.beginPath();
        ctx.arc(sx, sy, r, 0, Math.PI * 2);
        ctx.fill();

        // Crisp ring border
        ctx.strokeStyle = isFocus ? '#FFFFFF' : isRel ? c.accent : `${c.accent}${breathe > 0.5 ? 'BB' : '77'}`;
        ctx.lineWidth = isFocus ? 2.2 : isRel ? 1.8 : 1.25;
        ctx.beginPath();
        ctx.arc(sx, sy, r, 0, Math.PI * 2);
        ctx.stroke();

        // Mathematical symbol inside the neural node!
        ctx.fillStyle = isFocus ? '#FFFFFF' : '#F4F3EE';
        ctx.font = isNarrow
          ? '600 9px "JetBrains Mono", monospace'
          : node.symbol.length > 5
            ? '600 9.5px "JetBrains Mono", monospace'
            : '600 11.5px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(node.symbol, sx, sy);

        // Short topic label cleanly tucked beneath the node
        if (!isNarrow || isFocus || isSelected) {
          ctx.font = isFocus ? '600 9.5px "IBM Plex Sans", sans-serif' : '500 8.5px "IBM Plex Sans", sans-serif';
          ctx.fillStyle = isFocus ? '#FFFFFF' : isRel ? '#E2E8F6' : 'rgba(165, 180, 204, 0.82)';
          const shortTitle =
            node.title.length > 14 ? `${node.title.slice(0, 13)}…` : node.title;
          ctx.fillText(shortTitle, sx, sy + r + 12);
        }

        ctx.globalAlpha = 1;
      }

      ctx.restore();
    },
    [edges, toScreen]
  );

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const updateSize = () => {
      const rect = container.getBoundingClientRect();
      const width = Math.max(300, Math.floor(rect.width));
      const height = Math.max(280, Math.floor(rect.height));
      const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      sizeRef.current = { width, height, dpr };
      drawAtlas(false);
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
  }, [drawAtlas]);

  useEffect(() => {
    let raf = 0;
    const tick = () => {
      if (visibleRef.current && !document.hidden) {
        drawAtlas(true);
      }
      raf = window.requestAnimationFrame(tick);
    };
    raf = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(raf);
  }, [drawAtlas]);

  const hitTestNode = (clientX: number, clientY: number): CurriculumNode | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const mx = clientX - rect.left;
    const my = clientY - rect.top;
    let best: CurriculumNode | null = null;
    let bestD = 30;
    for (const node of CURRICULUM_NODES) {
      const [sx, sy] = toScreen(node.nx, node.ny);
      const d = Math.hypot(sx - mx, sy - my);
      if (d < bestD) {
        bestD = d;
        best = node;
      }
    }
    return best;
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const hit = hitTestNode(e.clientX, e.clientY);
    setHoveredId(hit ? hit.id : null);
  };

  const handleClick = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const hit = hitTestNode(e.clientX, e.clientY);
    if (!hit) return;
    if (selectedId === hit.id) {
      // Second click on active glowing math symbol jumps straight into the lesson!
      navigate(hit.route);
    } else {
      setSelectedId(hit.id);
    }
  };

  const handleDoubleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const hit = hitTestNode(e.clientX, e.clientY);
    if (hit) navigate(hit.route);
  };

  const selectedNode = nodeMap.get(selectedId) ?? CURRICULUM_NODES[0];
  const selectedCourse = COURSES[selectedNode.courseId];
  const directUnlocks = useMemo(
    () => CURRICULUM_NODES.filter((n) => n.prerequisites.includes(selectedNode.id)),
    [selectedNode.id]
  );

  return (
    <div className="instrument-frame fiducial-frame overflow-hidden">
      {/* Top Toolbar */}
      <div className="px-4 py-3 border-b hairline-rule bg-[#060A14]/90 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setCourseFilter('all')}
            className={`px-3 py-1 rounded-full text-[11px] font-mono-data border transition-all ${
              courseFilter === 'all'
                ? 'bg-white/12 border-white/30 text-[#F4F3EE]'
                : 'border-white/10 text-[#A5B4CC] hover:text-[#F4F3EE]'
            }`}
          >
            All 36 Symbols
          </button>
          {COURSE_ORDER.map((cid) => {
            const c = COURSES[cid];
            const active = courseFilter === cid;
            return (
              <button
                key={cid}
                type="button"
                onClick={() => setCourseFilter(cid)}
                className="px-3 py-1 rounded-full text-[11px] font-mono-data border transition-all flex items-center gap-1.5"
                style={{
                  borderColor: active ? c.accent : 'rgba(226,232,246,0.1)',
                  backgroundColor: active ? `${c.accent}22` : 'transparent',
                  color: active ? c.accent : '#A5B4CC',
                }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: c.accent, boxShadow: `0 0 8px ${c.accent}` }}
                />
                {c.shortTitle}
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              waveStartRef.current = timeRef.current;
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono-data border border-[#38D9FF]/50 bg-[#38D9FF]/12 text-[#38D9FF] hover:bg-[#38D9FF]/22 transition-colors"
          >
            <Zap className="w-3 h-3" />
            Fire Neural Pulse Wave
          </button>

          {!compact && (
            <div className="relative w-48 sm:w-56">
              <Search className="w-3.5 h-3.5 text-[#6F7F99] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search symbol or topic..."
                aria-label="Search mathematical symbols or lessons"
                className="w-full pl-8 pr-3 py-1 rounded-full bg-[#040710] border border-white/15 text-xs text-[#F4F3EE] placeholder:text-[#6F7F99] focus:border-[#38D9FF]"
              />
            </div>
          )}
        </div>
      </div>

      {/* Interactive 60fps Neural Constellation Canvas */}
      <div ref={containerRef} className={`relative w-full ${heightClass} bg-[#040710]`}>
        <canvas
          ref={canvasRef}
          onPointerMove={handlePointerMove}
          onPointerLeave={() => setHoveredId(null)}
          onPointerDown={handleClick}
          onDoubleClick={handleDoubleClick}
          className={`block w-full h-full touch-none ${hoveredId ? 'cursor-pointer' : 'cursor-crosshair'}`}
        />

        {/* Subtle Top-Right Legend */}
        <div className="pointer-events-none hidden sm:flex absolute bottom-3 right-3 obsidian-glass rounded-full px-3.5 py-1.5 items-center gap-3 text-[10px] font-mono-data text-[#A5B4CC]">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#F5BC5E]" /> Prerequisites
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#38D9FF]" /> Unlocks
          </span>
          <span className="text-[#6F7F99]">Click symbol to inspect · Click again to open lesson</span>
        </div>
      </div>

      {/* Sleek Bottom Inspector Strip for the Selected Mathematical Symbol */}
      <div className="p-4 sm:p-5 border-t hairline-rule bg-[#060A14]/95 grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
        <div className="lg:col-span-5 flex items-start gap-3.5">
          <div
            className="w-14 h-14 rounded-2xl shrink-0 border flex items-center justify-center font-mono-data text-sm font-semibold"
            style={{
              borderColor: `${selectedCourse.accent}77`,
              backgroundColor: `${selectedCourse.accent}18`,
              color: selectedCourse.accent,
              boxShadow: `0 0 24px -6px ${selectedCourse.accent}88`,
            }}
          >
            {selectedNode.symbol}
          </div>
          <div className="space-y-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className="font-mono-data text-[10px] uppercase tracking-wider"
                style={{ color: selectedCourse.accent }}
              >
                {selectedCourse.title} · {selectedNode.code}
              </span>
              <span className="font-mono-data text-[10px] px-2 py-0.5 rounded-full bg-[#36EBA8]/15 text-[#36EBA8]">
                7-Layer Lesson Live
              </span>
            </div>
            <h3 className="font-serif-editorial text-xl sm:text-2xl text-[#F4F3EE] leading-tight">
              {selectedNode.title}
            </h3>
            <p className="text-xs text-[#A5B4CC] leading-relaxed">{selectedNode.summary}</p>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-2">
          <div className="instrument-panel px-3.5 py-2 overflow-x-auto">
            <MathTex tex={selectedNode.formulaTex} className="text-xs sm:text-sm text-[#F4F3EE]" />
          </div>
          <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-mono-data">
            {selectedNode.prerequisites.slice(0, 3).map((pid) => {
              const p = nodeMap.get(pid);
              if (!p) return null;
              return (
                <button
                  key={pid}
                  type="button"
                  onClick={() => setSelectedId(pid)}
                  className="px-2 py-0.5 rounded-full bg-[#F5BC5E]/12 border border-[#F5BC5E]/35 text-[#F5BC5E] hover:bg-[#F5BC5E]/22"
                >
                  ← {p.symbol} {p.code}
                </button>
              );
            })}
            {directUnlocks.slice(0, 3).map((u) => (
              <button
                key={u.id}
                type="button"
                onClick={() => setSelectedId(u.id)}
                className="px-2 py-0.5 rounded-full bg-[#38D9FF]/12 border border-[#38D9FF]/35 text-[#38D9FF] hover:bg-[#38D9FF]/22"
              >
                {u.symbol} {u.code} →
              </button>
            ))}
          </div>
        </div>

        <div className="lg:col-span-3 flex lg:justify-end">
          <Link
            to={selectedNode.route}
            className="w-full lg:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full text-xs font-semibold text-[#03050A] transition-all hover:brightness-110"
            style={{
              backgroundColor: selectedCourse.accent,
              boxShadow: `0 0 28px -8px ${selectedCourse.accent}`,
            }}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Enter {selectedNode.code} Lesson
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
