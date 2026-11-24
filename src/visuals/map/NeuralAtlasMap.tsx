import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Maximize2, Minus, Plus, Search, Sparkles, Zap } from 'lucide-react';
import { MathTex } from '../../components/MathTex';
import {
  COURSES,
  CURRICULUM_NODES,
  CurriculumNode,
  getCoursePrerequisites,
  getCourseUnlocks,
} from '../../data/curriculumGraph';
import { CourseId } from '../../data/standards';
import { useReducedMotion } from '../../hooks/useReducedMotion';

export interface NeuralAtlasMapProps {
  heightClass?: string;
  compact?: boolean;
  initialNodeId?: string;
  forcedSelectedId?: string;
}

const COURSE_ORDER: CourseId[] = ['algebra-1', 'geometry', 'algebra-2', 'precalculus'];

const AUREA_COURSE_ACCENT: Record<CourseId, string> = {
  'algebra-1': '#F5C25B',
  geometry: '#46D6E8',
  'algebra-2': '#45E6A6',
  precalculus: '#FF8563',
};

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
  const reducedMotion = useReducedMotion();
  const [selectedId, setSelectedId] = useState<string>(initialNodeId);
  useEffect(() => {
    if (forcedSelectedId) setSelectedId(forcedSelectedId);
  }, [forcedSelectedId]);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [courseFilter, setCourseFilter] = useState<CourseId | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [zoomPct, setZoomPct] = useState(100);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const sizeRef = useRef({ width: 1000, height: 540, dpr: 1 });
  const viewRef = useRef({ zoom: 1, panX: 0, panY: 0 });
  const dragRef = useRef<{
    active: boolean;
    startX: number;
    startY: number;
    origPanX: number;
    origPanY: number;
    movedDist: number;
  }>({
    active: false,
    startX: 0,
    startY: 0,
    origPanX: 0,
    origPanY: 0,
    movedDist: 0,
  });

  const visibleRef = useRef(true);
  const timeRef = useRef(0);
  const waveStartRef = useRef(-10);

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
        const bend = ((idx + pIdx) % 2 === 0 ? 1 : -1) * Math.min(48, Math.hypot(dx, dy) * 0.16);
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
    const { zoom, panX, panY } = viewRef.current;
    const padX = Math.max(28, width * 0.036);
    const padTop = 52;
    const padBottom = 44;
    const baseX = padX + (nx / 1180) * (width - padX * 2);
    const baseY = padTop + (ny / 570) * (height - padTop - padBottom);
    const cx = width * 0.5;
    const cy = height * 0.5;
    return [cx + (baseX - cx) * zoom + panX, cy + (baseY - cy) * zoom + panY];
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
      const waveX = waveElapsed >= 0 && waveElapsed < 4.5 ? (waveElapsed / 4.5) * 1320 - 70 : -999;

      const {
        activeFocusId: focusId,
        selectedId: selId,
        hoveredId: hovId,
        prereqSet: preSet,
        unlockSet: unlSet,
        matchingSet: matchSet,
      } = stateRef.current;

      ctx.save();
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // 1. Deep AUREA Obsidian Void (#060609)
      ctx.fillStyle = '#060609';
      ctx.fillRect(0, 0, width, height);

      // Soft central warm golden observatory core aura
      const coreAura = ctx.createRadialGradient(
        width * 0.5,
        height * 0.48,
        12,
        width * 0.5,
        height * 0.48,
        Math.max(width, height) * 0.52
      );
      coreAura.addColorStop(0, 'rgba(244, 196, 108, 0.075)');
      coreAura.addColorStop(0.55, 'rgba(184, 137, 56, 0.025)');
      coreAura.addColorStop(1, 'transparent');
      ctx.fillStyle = coreAura;
      ctx.fillRect(0, 0, width, height);

      const bands: { cid: CourseId; nxCenter: number; label: string }[] = [
        { cid: 'algebra-1', nxCenter: 175, label: 'ALGEBRA 1 · 9 UNITS' },
        { cid: 'geometry', nxCenter: 475, label: 'GEOMETRY · 9 UNITS' },
        { cid: 'algebra-2', nxCenter: 775, label: 'ALGEBRA 2 · 9 UNITS' },
        { cid: 'precalculus', nxCenter: 1050, label: 'PRECALCULUS · 9 UNITS' },
      ];

      // Territory nebula glows & arborescent canopy roots (inspired by f_07.jpg)
      for (const b of bands) {
        const accent = AUREA_COURSE_ACCENT[b.cid];
        const [bx, by] = toScreen(b.nxCenter, 290);
        const r = Math.min(width * 0.22, height * 0.5) * viewRef.current.zoom;
        const grad = ctx.createRadialGradient(bx, by, 8, bx, by, r);
        grad.addColorStop(0, `${accent}16`);
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);
      }

      // Faint astrolabe concentric rings
      const [astX, astY] = toScreen(590, 290);
      ctx.strokeStyle = 'rgba(244, 196, 108, 0.045)';
      ctx.lineWidth = 1;
      for (let r = 1; r <= 3; r++) {
        ctx.beginPath();
        ctx.arc(astX, astY, r * Math.min(width, height) * 0.22 * viewRef.current.zoom, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Subtle Arborescent Canopy Rays from each territory crown node down to its nodes (f_07.jpg)
      ctx.globalCompositeOperation = 'lighter';
      for (const b of bands) {
        const accent = AUREA_COURSE_ACCENT[b.cid];
        const [crownX, crownY] = toScreen(b.nxCenter, 26);
        const clusterNodes = CURRICULUM_NODES.filter((n) => n.courseId === b.cid);
        ctx.strokeStyle = `${accent}17`;
        ctx.lineWidth = 0.85;
        for (const cn of clusterNodes) {
          if (!matchSet.has(cn.id)) continue;
          const [tx, ty] = toScreen(cn.nx, cn.ny);
          const midY = crownY + (ty - crownY) * 0.42;
          ctx.beginPath();
          ctx.moveTo(crownX, crownY);
          ctx.bezierCurveTo(crownX, midY, tx, midY, tx, ty);
          ctx.stroke();
        }
      }

      // 2. Luminous Synaptic Axon Filaments & Traveling Photon Pulses
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
          ? '244, 196, 108' // Solar Champagne Gold
          : isDownstream
            ? '70, 214, 232' // Starlight Cyan
            : '184, 137, 56'; // Antique Brass

        if (isHighlighted) {
          ctx.strokeStyle = `rgba(${baseColor}, 0.25)`;
          ctx.lineWidth = 5.5;
          ctx.beginPath();
          ctx.moveTo(x0, y0);
          ctx.quadraticCurveTo(cx, cy, x1, y1);
          ctx.stroke();
        }

        const alpha = isHighlighted ? 0.86 : isMatched ? 0.26 : 0.06;
        ctx.strokeStyle = `rgba(${baseColor}, ${alpha})`;
        ctx.lineWidth = isHighlighted ? 1.85 : 0.95;
        ctx.beginPath();
        ctx.moveTo(x0, y0);
        ctx.quadraticCurveTo(cx, cy, x1, y1);
        ctx.stroke();

        // Traveling photon packets along active and ambient pathways
        if (isHighlighted || isMatched) {
          const speed = isHighlighted ? 0.44 : 0.16;
          const u = (t * speed + edge.seed) % 1;
          const omt = 1 - u;
          const px = omt * omt * x0 + 2 * omt * u * cx + u * u * x1;
          const py = omt * omt * y0 + 2 * omt * u * cy + u * u * y1;

          const pRadius = isHighlighted ? 6.8 : 3.4;
          const pGrad = ctx.createRadialGradient(px, py, 0.5, px, py, pRadius);
          pGrad.addColorStop(0, '#FFFFFF');
          pGrad.addColorStop(0.38, isUpstream ? '#FFE29E' : `rgba(${baseColor}, 0.95)`);
          pGrad.addColorStop(1, 'transparent');
          ctx.fillStyle = pGrad;
          ctx.beginPath();
          ctx.arc(px, py, pRadius, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // 3. Territory Header Badges
      ctx.globalCompositeOperation = 'source-over';
      for (const b of bands) {
        const accent = AUREA_COURSE_ACCENT[b.cid];
        const [bx] = toScreen(b.nxCenter, 26);
        ctx.font =
          width < 640
            ? '600 8.5px "JetBrains Mono", monospace'
            : '600 10px "JetBrains Mono", monospace';
        ctx.fillStyle = `${accent}D0`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(b.label, bx, 20);
      }

      // 4. Glowing Mathematical Symbol Nodes & Hover Halo Rings
      const isNarrow = width < 640;
      const zoomScale = Math.min(1.25, Math.max(0.85, viewRef.current.zoom));
      const baseR = (isNarrow ? 12.5 : width < 960 ? 16 : 18.5) * zoomScale;

      for (let i = 0; i < CURRICULUM_NODES.length; i++) {
        const node = CURRICULUM_NODES[i];
        const accent = AUREA_COURSE_ACCENT[node.courseId];
        const [sx, sy] = toScreen(node.nx, node.ny);
        const isHovered = node.id === hovId;
        const isFocus = node.id === focusId;
        const isSelected = node.id === selId;
        const isRel = preSet.has(node.id) || unlSet.has(node.id);
        const isMatch = matchSet.has(node.id);

        const waveDist = Math.abs(node.nx - waveX);
        const waveBoost = waveDist < 90 ? 1 - waveDist / 90 : 0;

        const r = isFocus ? baseR + 4 : baseR;
        const breathe = 0.5 + 0.5 * Math.sin(t * 2.1 + i * 0.7);

        // Additive luminous aura
        ctx.globalCompositeOperation = 'lighter';
        if (isFocus || isRel || waveBoost > 0.05) {
          const haloR = r * (2.4 + waveBoost * 1.15 + (isFocus ? 0.5 : 0));
          const halo = ctx.createRadialGradient(sx, sy, 2, sx, sy, haloR);
          halo.addColorStop(0, `${accent}${isFocus || waveBoost > 0.3 ? '88' : '44'}`);
          halo.addColorStop(1, 'transparent');
          ctx.fillStyle = halo;
          ctx.beginPath();
          ctx.arc(sx, sy, haloR, 0, Math.PI * 2);
          ctx.fill();
        }

        // Hover expanding double halo ring
        if (isHovered) {
          const pulseR = r + 9 + 3.5 * Math.sin(t * 5);
          ctx.strokeStyle = 'rgba(255, 226, 158, 0.78)';
          ctx.lineWidth = 1.4;
          ctx.beginPath();
          ctx.arc(sx, sy, pulseR, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Rotating dashed astrolabe ring on focused/selected node
        if (isFocus || isSelected) {
          ctx.strokeStyle = isFocus ? '#FFE29E' : `${accent}CC`;
          ctx.lineWidth = 1.35;
          ctx.setLineDash([5, 4]);
          ctx.beginPath();
          ctx.arc(sx, sy, r + 6.5, t * 0.9, t * 0.9 + Math.PI * 1.65);
          ctx.stroke();
          ctx.setLineDash([]);
        }

        // Solid obsidian pearl core
        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = isMatch || isFocus || isRel ? 1 : 0.22;
        ctx.fillStyle = isFocus ? '#11131C' : '#0B0C12';
        ctx.beginPath();
        ctx.arc(sx, sy, r, 0, Math.PI * 2);
        ctx.fill();

        // Soft top-lit metallic tint inside pearl
        const innerGrad = ctx.createRadialGradient(sx, sy - r * 0.3, 1, sx, sy, r);
        innerGrad.addColorStop(0, `${accent}${isFocus ? '52' : '26'}`);
        innerGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = innerGrad;
        ctx.beginPath();
        ctx.arc(sx, sy, r, 0, Math.PI * 2);
        ctx.fill();

        // Crisp rim border
        ctx.strokeStyle = isFocus
          ? '#FFE29E'
          : isRel
            ? accent
            : `${accent}${breathe > 0.5 ? 'C4' : '7E'}`;
        ctx.lineWidth = isFocus ? 2.1 : isRel ? 1.75 : 1.25;
        ctx.beginPath();
        ctx.arc(sx, sy, r, 0, Math.PI * 2);
        ctx.stroke();

        // Mathematical symbol
        ctx.fillStyle = isFocus ? '#FFFFFF' : '#F7F4EC';
        ctx.font = isNarrow
          ? '600 9px "JetBrains Mono", monospace'
          : node.symbol.length > 5
            ? '600 9.5px "JetBrains Mono", monospace'
            : '600 11px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(node.symbol, sx, sy);

        // Node title below pearl
        if (!isNarrow || isFocus || isSelected) {
          ctx.font = isFocus
            ? '600 9.5px "IBM Plex Sans", sans-serif'
            : '500 8.5px "IBM Plex Sans", sans-serif';
          ctx.fillStyle = isFocus
            ? '#FFE29E'
            : isRel
              ? '#F7F4EC'
              : 'rgba(168, 178, 198, 0.85)';
          const shortTitle =
            node.title.length > 15 ? `${node.title.slice(0, 14)}…` : node.title;
          ctx.fillText(shortTitle, sx, sy + r + 12);
        }

        // Hovered node floating code badge above pearl
        if (isHovered) {
          ctx.font = '600 8.5px "JetBrains Mono", monospace';
          ctx.fillStyle = '#FFE29E';
          ctx.fillText(node.code, sx, sy - r - 13);
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
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
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
      { rootMargin: '120px', threshold: 0.02 }
    );
    io.observe(container);

    return () => {
      ro.disconnect();
      io.disconnect();
    };
  }, [drawAtlas]);

  useEffect(() => {
    drawAtlas(false);
  }, [courseFilter, searchQuery, selectedId, hoveredId, zoomPct, drawAtlas]);

  useEffect(() => {
    let raf = 0;
    const tick = () => {
      if (visibleRef.current && !document.hidden && !reducedMotion) {
        drawAtlas(true);
      }
      raf = window.requestAnimationFrame(tick);
    };
    raf = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(raf);
  }, [drawAtlas, reducedMotion]);

  const hitTestNode = (clientX: number, clientY: number): CurriculumNode | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const mx = clientX - rect.left;
    const my = clientY - rect.top;
    let best: CurriculumNode | null = null;
    let bestD = 30 * Math.min(1.25, Math.max(0.9, viewRef.current.zoom));
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

  const applyZoom = (nextZoom: number) => {
    const clamped = Math.max(0.75, Math.min(2.2, Number(nextZoom.toFixed(2))));
    viewRef.current.zoom = clamped;
    if (clamped <= 1) {
      viewRef.current.panX *= 0.5;
      viewRef.current.panY *= 0.5;
    }
    setZoomPct(Math.round(clamped * 100));
    drawAtlas(false);
  };

  const resetView = () => {
    viewRef.current = { zoom: 1, panX: 0, panY: 0 };
    setZoomPct(100);
    drawAtlas(false);
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    dragRef.current = {
      active: true,
      startX: e.clientX,
      startY: e.clientY,
      origPanX: viewRef.current.panX,
      origPanY: viewRef.current.panY,
      movedDist: 0,
    };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const d = dragRef.current;
    if (d.active && e.buttons === 1) {
      const dx = e.clientX - d.startX;
      const dy = e.clientY - d.startY;
      d.movedDist = Math.hypot(dx, dy);
      if (d.movedDist > 4) {
        const { width, height } = sizeRef.current;
        const maxPanX = width * 0.48;
        const maxPanY = height * 0.48;
        viewRef.current.panX = Math.max(-maxPanX, Math.min(maxPanX, d.origPanX + dx));
        viewRef.current.panY = Math.max(-maxPanY, Math.min(maxPanY, d.origPanY + dy));
        drawAtlas(false);
        return;
      }
    }
    const hit = hitTestNode(e.clientX, e.clientY);
    setHoveredId(hit ? hit.id : null);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const wasDrag = dragRef.current.movedDist > 5;
    dragRef.current.active = false;
    if (wasDrag) return;
    const hit = hitTestNode(e.clientX, e.clientY);
    if (!hit) return;
    if (selectedId === hit.id) {
      navigate(hit.route);
    } else {
      setSelectedId(hit.id);
    }
  };

  const handleDoubleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const hit = hitTestNode(e.clientX, e.clientY);
    if (hit) navigate(hit.route);
    else resetView();
  };

  const selectedNode = nodeMap.get(selectedId) ?? CURRICULUM_NODES[0];
  const selectedCourse = COURSES[selectedNode.courseId];
  const selectedAccent = AUREA_COURSE_ACCENT[selectedNode.courseId];
  const directUnlocks = useMemo(
    () => CURRICULUM_NODES.filter((n) => n.prerequisites.includes(selectedNode.id)),
    [selectedNode.id]
  );

  return (
    <div
      className="rounded-2xl overflow-hidden bg-[#060609] border text-[#F7F4EC]"
      style={{
        borderColor: 'rgba(244, 196, 108, 0.17)',
        boxShadow: 'inset 0 1px 0 rgba(255, 232, 178, 0.14), 0 24px 54px -26px rgba(0, 0, 0, 0.95)',
      }}
    >
      {/* Top Toolbar */}
      <div
        className="px-4 py-3 border-b bg-[#0B0C12]/95 flex flex-wrap items-center justify-between gap-3"
        style={{ borderColor: 'rgba(244, 196, 108, 0.17)' }}
      >
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setCourseFilter('all')}
            className={`px-3 py-1 rounded-full text-[11px] font-mono-data border transition-all ${
              courseFilter === 'all'
                ? 'bg-[#F4C46C]/18 border-[#F4C46C]/60 text-[#FFE29E]'
                : 'bg-[#11131C] border-[rgba(244,196,108,0.17)] text-[#A8B2C6] hover:text-[#F7F4EC]'
            }`}
          >
            All 36 Symbols
          </button>
          {COURSE_ORDER.map((cid) => {
            const c = COURSES[cid];
            const accent = AUREA_COURSE_ACCENT[cid];
            const active = courseFilter === cid;
            return (
              <button
                key={cid}
                type="button"
                onClick={() => setCourseFilter(cid)}
                className="px-3 py-1 rounded-full text-[11px] font-mono-data border transition-all flex items-center gap-1.5"
                style={{
                  borderColor: active ? accent : 'rgba(244, 196, 108, 0.17)',
                  backgroundColor: active ? `${accent}22` : '#11131C',
                  color: active ? accent : '#A8B2C6',
                }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: accent, boxShadow: `0 0 8px ${accent}` }}
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
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono-data border border-[#F4C46C]/50 bg-[#F4C46C]/14 text-[#FFE29E] hover:bg-[#F4C46C]/24 transition-colors"
          >
            <Zap className="w-3 h-3 text-[#F4C46C]" />
            Fire Neural Pulse Wave
          </button>

          {!compact && (
            <div className="relative w-48 sm:w-56">
              <Search className="w-3.5 h-3.5 text-[#B88938] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search symbol or topic..."
                aria-label="Search mathematical symbols or lessons"
                className="w-full pl-8 pr-3 py-1 rounded-full bg-[#060609] border border-[rgba(244,196,108,0.22)] text-xs text-[#F7F4EC] placeholder:text-[#6E778B] focus:border-[#F4C46C]"
              />
            </div>
          )}
        </div>
      </div>

      {/* Interactive 60fps Arborescent Neural Constellation Canvas */}
      <div ref={containerRef} className={`relative w-full ${heightClass} bg-[#060609]`}>
        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={() => {
            dragRef.current.active = false;
            setHoveredId(null);
          }}
          onDoubleClick={handleDoubleClick}
          className={`block w-full h-full touch-none ${hoveredId ? 'cursor-pointer' : 'cursor-grab active:cursor-grabbing'}`}
        />

        {/* Sleek Top-Right Zoom & Pan HUD Pills */}
        {!compact && (
          <div
            className="absolute top-3 right-3 rounded-full px-1.5 py-1 bg-[#0B0C12]/90 backdrop-blur-md border flex items-center gap-1"
            style={{ borderColor: 'rgba(244, 196, 108, 0.22)' }}
          >
            <button
              type="button"
              onClick={() => applyZoom(viewRef.current.zoom - 0.2)}
              aria-label="Zoom out constellation"
              className="p-1 rounded-full text-[#A8B2C6] hover:text-[#FFE29E] hover:bg-white/[0.06]"
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="font-mono-data text-[10px] text-[#FFE29E] px-1 min-w-[38px] text-center">
              {zoomPct}%
            </span>
            <button
              type="button"
              onClick={() => applyZoom(viewRef.current.zoom + 0.2)}
              aria-label="Zoom in constellation"
              className="p-1 rounded-full text-[#A8B2C6] hover:text-[#FFE29E] hover:bg-white/[0.06]"
            >
              <Plus className="w-3 h-3" />
            </button>
            <button
              type="button"
              onClick={resetView}
              aria-label="Reset pan and zoom"
              title="Reset view"
              className="p-1 rounded-full text-[#A8B2C6] hover:text-[#FFE29E] hover:bg-white/[0.06]"
            >
              <Maximize2 className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* Crisp Bottom-Right Legend Pill */}
        <div
          className="pointer-events-none hidden sm:flex absolute bottom-3 right-3 rounded-full px-3.5 py-1.5 bg-[#0B0C12]/90 backdrop-blur-md border items-center gap-3 text-[10px] font-mono-data text-[#A8B2C6]"
          style={{ borderColor: 'rgba(244, 196, 108, 0.22)' }}
        >
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#F4C46C]" /> Prerequisites
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#46D6E8]" /> Unlocks
          </span>
          <span className="text-[#8B95A8]">Drag to pan · Click again to open lesson</span>
        </div>
      </div>

      {/* Sleek Bottom Inspector Strip for the Selected Mathematical Symbol */}
      <div
        className="p-4 sm:p-5 border-t bg-[#0B0C12]/95 grid grid-cols-1 lg:grid-cols-12 gap-4 items-center"
        style={{ borderColor: 'rgba(244, 196, 108, 0.17)' }}
      >
        <div className="lg:col-span-5 flex items-start gap-3.5">
          <div
            className="w-14 h-14 rounded-2xl shrink-0 border flex items-center justify-center font-mono-data text-sm font-semibold"
            style={{
              borderColor: `${selectedAccent}77`,
              backgroundColor: `${selectedAccent}18`,
              color: selectedAccent,
              boxShadow: `0 0 24px -6px ${selectedAccent}88`,
            }}
          >
            {selectedNode.symbol}
          </div>
          <div className="space-y-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className="font-mono-data text-[10px] uppercase tracking-wider"
                style={{ color: selectedAccent }}
              >
                {selectedCourse.title} · {selectedNode.code}
              </span>
              <span className="font-mono-data text-[10px] px-2 py-0.5 rounded-full bg-[#45E6A6]/15 text-[#45E6A6]">
                7-Layer Lesson Live
              </span>
            </div>
            <h3 className="font-serif-editorial text-xl sm:text-2xl text-[#F7F4EC] leading-tight">
              {selectedNode.title}
            </h3>
            <p className="text-xs text-[#A8B2C6] leading-relaxed">{selectedNode.summary}</p>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-2">
          <div
            className="rounded-lg px-3.5 py-2 overflow-x-auto bg-[#060609] border"
            style={{ borderColor: 'rgba(244, 196, 108, 0.17)' }}
          >
            <MathTex tex={selectedNode.formulaTex} className="text-xs sm:text-sm text-[#FFE29E]" />
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
                  className="px-2 py-0.5 rounded-full bg-[#F4C46C]/12 border border-[#F4C46C]/35 text-[#FFE29E] hover:bg-[#F4C46C]/22"
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
                className="px-2 py-0.5 rounded-full bg-[#46D6E8]/12 border border-[#46D6E8]/35 text-[#46D6E8] hover:bg-[#46D6E8]/22"
              >
                {u.symbol} {u.code} →
              </button>
            ))}
          </div>
        </div>

        <div className="lg:col-span-3 flex lg:justify-end">
          <Link
            to={selectedNode.route}
            className="w-full lg:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full text-xs font-semibold text-[#060609] transition-all hover:brightness-110"
            style={{
              backgroundColor: selectedAccent,
              boxShadow: `0 0 28px -8px ${selectedAccent}`,
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
