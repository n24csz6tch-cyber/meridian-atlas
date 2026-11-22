import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Compass,
  ExternalLink,
  Maximize2,
  Minus,
  Plus,
  Search,
  Sparkles,
} from 'lucide-react';
import {
  COURSES,
  CURRICULUM_NODES,
  CurriculumNode,
  getCoursePrerequisites,
  getCourseUnlocks,
} from '../../data/curriculumGraph';
import { CourseId, VERIFIED_STANDARDS } from '../../data/standards';
import { useReducedMotion } from '../../hooks/useReducedMotion';

export interface MapCameraTarget {
  x: number;
  y: number;
  zoom: number;
}

export interface PrerequisiteMapProps {
  initialSelectedId?: string | null;
  cameraTarget?: MapCameraTarget | null;
  forcedSelectedId?: string | null;
  hideToolbar?: boolean;
  hideDossier?: boolean;
  heightClass?: string;
}

const COURSE_ORDER: CourseId[] = ['algebra-1', 'geometry', 'algebra-2', 'precalculus'];

export function PrerequisiteMap({
  initialSelectedId = 'a1-quadratics',
  cameraTarget = null,
  forcedSelectedId = undefined,
  hideToolbar = false,
  hideDossier = false,
  heightClass = 'h-[580px] lg:h-[640px]',
}: PrerequisiteMapProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  const [selectedId, setSelectedId] = useState<string | null>(initialSelectedId);
  const [courseFilter, setCourseFilter] = useState<CourseId | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Pan/zoom transform in SVG screen coordinates: screen = world * zoom + offset
  const [view, setView] = useState({ tx: 40, ty: 80, zoom: 0.68 });
  const targetViewRef = useRef<{ tx: number; ty: number; zoom: number } | null>(null);
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0, tx: 0, ty: 0, moved: false });

  useEffect(() => {
    if (forcedSelectedId !== undefined) {
      setSelectedId(forcedSelectedId);
    }
  }, [forcedSelectedId]);

  const activeSelectedId = forcedSelectedId !== undefined ? forcedSelectedId : selectedId;

  // Smooth camera flight when external cameraTarget changes (used by Stage Mode)
  useEffect(() => {
    if (!cameraTarget || !viewportRef.current) return;
    const rect = viewportRef.current.getBoundingClientRect();
    const w = rect.width || 1100;
    const h = rect.height || 620;
    const nextTx = w * 0.5 - cameraTarget.x * cameraTarget.zoom;
    const nextTy = h * 0.5 - cameraTarget.y * cameraTarget.zoom;

    if (reducedMotion) {
      setView({ tx: nextTx, ty: nextTy, zoom: cameraTarget.zoom });
      return;
    }

    targetViewRef.current = { tx: nextTx, ty: nextTy, zoom: cameraTarget.zoom };
    let raf = 0;
    const step = () => {
      const tgt = targetViewRef.current;
      if (!tgt) return;
      setView((curr) => {
        const dx = tgt.tx - curr.tx;
        const dy = tgt.ty - curr.ty;
        const dz = tgt.zoom - curr.zoom;
        if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5 && Math.abs(dz) < 0.002) {
          targetViewRef.current = null;
          return tgt;
        }
        return {
          tx: curr.tx + dx * 0.1,
          ty: curr.ty + dy * 0.1,
          zoom: curr.zoom + dz * 0.1,
        };
      });
      if (targetViewRef.current) {
        raf = requestAnimationFrame(step);
      }
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [cameraTarget, reducedMotion]);

  const fitView = () => {
    const rect = viewportRef.current?.getBoundingClientRect();
    const w = rect?.width || 960;
    const h = rect?.height || 580;
    const zoom = Math.min(Math.max(w / 1960, 0.45), 0.92);
    const tx = Math.max(16, (w - 1960 * zoom) * 0.5);
    const ty = Math.max(20, (h - 500 * zoom) * 0.5);
    targetViewRef.current = null;
    setView({ tx, ty, zoom });
  };

  useEffect(() => {
    if (!cameraTarget) {
      fitView();
    }
    // Run once on mount when not cameraTarget-controlled
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const nodeMap = useMemo(() => new Map(CURRICULUM_NODES.map((n) => [n.id, n])), []);

  const selectedNode: CurriculumNode | null = useMemo(
    () => (activeSelectedId ? nodeMap.get(activeSelectedId) ?? null : null),
    [activeSelectedId, nodeMap]
  );

  const upstreamSet = useMemo(
    () => (activeSelectedId ? getCoursePrerequisites(activeSelectedId) : new Set<string>()),
    [activeSelectedId]
  );

  const downstreamSet = useMemo(
    () => (activeSelectedId ? getCourseUnlocks(activeSelectedId) : new Set<string>()),
    [activeSelectedId]
  );

  const searchMatches = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return null;
    return new Set(
      CURRICULUM_NODES.filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          n.code.toLowerCase().includes(q) ||
          n.standards.some((s) => s.toLowerCase().includes(q)) ||
          COURSES[n.courseId].title.toLowerCase().includes(q)
      ).map((n) => n.id)
    );
  }, [searchQuery]);

  const edges = useMemo(() => {
    const list: { from: CurriculumNode; to: CurriculumNode; key: string }[] = [];
    for (const node of CURRICULUM_NODES) {
      for (const preId of node.prerequisites) {
        const pre = nodeMap.get(preId);
        if (pre) {
          list.push({ from: pre, to: node, key: `${pre.id}->${node.id}` });
        }
      }
    }
    return list;
  }, [nodeMap]);

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    targetViewRef.current = null;
    const rect = viewportRef.current?.getBoundingClientRect();
    if (!rect) return;
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const factor = e.deltaY < 0 ? 1.1 : 0.91;
    setView((v) => {
      const nextZoom = Math.min(2.2, Math.max(0.45, v.zoom * factor));
      const ratio = nextZoom / v.zoom;
      return {
        zoom: nextZoom,
        tx: mx - (mx - v.tx) * ratio,
        ty: my - (my - v.ty) * ratio,
      };
    });
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('[data-map-node="true"]')) return;
    targetViewRef.current = null;
    isDraggingRef.current = true;
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      tx: view.tx,
      ty: view.ty,
      moved: false,
    };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    if (Math.hypot(dx, dy) > 4) dragStartRef.current.moved = true;
    setView((v) => ({
      ...v,
      tx: dragStartRef.current.tx + dx,
      ty: dragStartRef.current.ty + dy,
    }));
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDraggingRef.current) {
      isDraggingRef.current = false;
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {
        // ignore if not captured
      }
    }
  };

  const zoomStep = (multiplier: number) => {
    targetViewRef.current = null;
    const rect = viewportRef.current?.getBoundingClientRect();
    const cx = (rect?.width || 800) * 0.5;
    const cy = (rect?.height || 520) * 0.5;
    setView((v) => {
      const nextZoom = Math.min(2.2, Math.max(0.45, v.zoom * multiplier));
      const ratio = nextZoom / v.zoom;
      return {
        zoom: nextZoom,
        tx: cx - (cx - v.tx) * ratio,
        ty: cy - (cy - v.ty) * ratio,
      };
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const panAmount = 48;
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      setView((v) => ({ ...v, tx: v.tx + panAmount }));
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      setView((v) => ({ ...v, tx: v.tx - panAmount }));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setView((v) => ({ ...v, ty: v.ty + panAmount }));
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setView((v) => ({ ...v, ty: v.ty - panAmount }));
    } else if (e.key === '=' || e.key === '+') {
      e.preventDefault();
      zoomStep(1.15);
    } else if (e.key === '-') {
      e.preventDefault();
      zoomStep(0.87);
    }
  };

  const focusNode = (nodeId: string) => {
    setSelectedId(nodeId);
    const node = nodeMap.get(nodeId);
    const rect = viewportRef.current?.getBoundingClientRect();
    if (!node || !rect) return;
    setView((v) => ({
      ...v,
      tx: rect.width * 0.48 - node.x * v.zoom,
      ty: rect.height * 0.5 - node.y * v.zoom,
    }));
  };

  return (
    <div className="instrument-frame overflow-hidden flex flex-col">
      {!hideToolbar && (
        <div className="px-4 py-3 border-b hairline-rule bg-[#111620] flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setCourseFilter('all')}
              className={`px-3 py-1 rounded text-xs font-medium border transition-colors ${
                courseFilter === 'all'
                  ? 'bg-[#EDEBE4]/12 border-[#EDEBE4]/30 text-[#EDEBE4]'
                  : 'border-transparent text-[#9CA6B8] hover:text-[#EDEBE4]'
              }`}
            >
              All 4 Courses
            </button>
            {COURSE_ORDER.map((cid) => {
              const c = COURSES[cid];
              const active = courseFilter === cid;
              return (
                <button
                  key={cid}
                  type="button"
                  onClick={() => setCourseFilter(cid)}
                  className="px-3 py-1 rounded text-xs font-medium border transition-colors flex items-center gap-1.5"
                  style={{
                    borderColor: active ? `${c.accent}70` : 'transparent',
                    backgroundColor: active ? `${c.accent}18` : 'transparent',
                    color: active ? c.accent : '#9CA6B8',
                  }}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: c.accent }}
                  />
                  {c.title}
                </button>
              );
            })}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-[#6C7689] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search topic or B.E.S.T. code..."
              aria-label="Search curriculum topics or Florida B.E.S.T. standard codes"
              className="w-full pl-8 pr-3 py-1.5 rounded bg-[#0A0D12] border border-[rgba(237,235,228,0.14)] text-xs text-[#EDEBE4] placeholder:text-[#6C7689] focus:border-[#E5A94C]/60"
            />
          </div>
        </div>
      )}

      <div className={`relative flex flex-col lg:flex-row ${heightClass}`}>
        {/* Interactive Pan/Zoom SVG Cartography Canvas */}
        <div
          ref={viewportRef}
          tabIndex={0}
          role="region"
          aria-label="Interactive prerequisite cartography map. Use arrow keys to pan, plus or minus to zoom."
          onKeyDown={handleKeyDown}
          onWheel={handleWheel}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className="relative flex-1 bg-[#090C11] overflow-hidden cursor-grab active:cursor-grabbing select-none outline-none"
        >
          <svg className="w-full h-full block">
            <defs>
              <marker
                id="arrow-muted"
                viewBox="0 0 10 10"
                refX="8"
                refY="5"
                markerWidth="5"
                markerHeight="5"
                orient="auto-start-reverse"
              >
                <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="rgba(156, 166, 184, 0.35)" />
              </marker>
              <marker
                id="arrow-up"
                viewBox="0 0 10 10"
                refX="8"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#E5A94C" />
              </marker>
              <marker
                id="arrow-down"
                viewBox="0 0 10 10"
                refX="8"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#38BDF8" />
              </marker>
            </defs>

            <g transform={`translate(${view.tx}, ${view.ty}) scale(${view.zoom})`}>
              {/* Cartographic Meridian Latitude/Longitude Bands */}
              {[
                { x: 40, w: 530, cid: 'algebra-1' as CourseId },
                { x: 615, w: 430, cid: 'geometry' as CourseId },
                { x: 1090, w: 405, cid: 'algebra-2' as CourseId },
                { x: 1540, w: 380, cid: 'precalculus' as CourseId },
              ].map((band) => {
                const c = COURSES[band.cid];
                return (
                  <g key={band.cid}>
                    <rect
                      x={band.x}
                      y={42}
                      width={band.w}
                      height={410}
                      rx={8}
                      fill="rgba(17, 22, 32, 0.42)"
                      stroke="rgba(237, 235, 228, 0.07)"
                      strokeWidth={1}
                    />
                    <text
                      x={band.x + 18}
                      y={72}
                      fill={c.accent}
                      fontSize="11"
                      fontFamily="JetBrains Mono, monospace"
                      letterSpacing="0.12em"
                    >
                      {c.shortTitle} · {c.cpalmsCode}
                    </text>
                    <text
                      x={band.x + 18}
                      y={93}
                      fill="#EDEBE4"
                      fontSize="16"
                      fontFamily="Newsreader, Georgia, serif"
                    >
                      {c.title}
                    </text>
                  </g>
                );
              })}

              {/* Subtle Compass Reticle */}
              <g opacity="0.16" stroke="#9CA6B8" fill="none">
                <circle cx="960" cy="255" r="215" strokeDasharray="3 6" />
                <circle cx="960" cy="255" r="340" strokeDasharray="2 8" />
              </g>

              {/* Dependency Arcs */}
              {edges.map(({ from, to, key }) => {
                const isUpstreamEdge =
                  activeSelectedId !== null &&
                  (to.id === activeSelectedId || upstreamSet.has(to.id)) &&
                  upstreamSet.has(from.id);
                const isDownstreamEdge =
                  activeSelectedId !== null &&
                  (from.id === activeSelectedId || downstreamSet.has(from.id)) &&
                  downstreamSet.has(to.id);

                const isVisibleByFilter =
                  courseFilter === 'all' ||
                  from.courseId === courseFilter ||
                  to.courseId === courseFilter;

                const midX = (from.x + to.x) * 0.5;
                const d = `M ${from.x + 74} ${from.y} C ${midX} ${from.y}, ${midX} ${to.y}, ${
                  to.x - 74
                } ${to.y}`;

                let stroke = 'rgba(156, 166, 184, 0.2)';
                let strokeWidth = 1.4;
                let dash = '';
                let marker = 'url(#arrow-muted)';
                let opacity = isVisibleByFilter ? 1 : 0.14;

                if (activeSelectedId) {
                  if (isUpstreamEdge) {
                    stroke = '#E5A94C';
                    strokeWidth = 2.2;
                    dash = '6 4';
                    marker = 'url(#arrow-up)';
                    opacity = 1;
                  } else if (isDownstreamEdge) {
                    stroke = COURSES[to.courseId].accent;
                    strokeWidth = 2.4;
                    marker = 'url(#arrow-down)';
                    opacity = 1;
                  } else {
                    opacity = 0.14;
                  }
                }

                return (
                  <path
                    key={key}
                    d={d}
                    fill="none"
                    stroke={stroke}
                    strokeWidth={strokeWidth}
                    strokeDasharray={dash}
                    markerEnd={marker}
                    opacity={opacity}
                  />
                );
              })}

              {/* Topic Nodes */}
              {CURRICULUM_NODES.map((node) => {
                const course = COURSES[node.courseId];
                const isSelected = activeSelectedId === node.id;
                const isUp = upstreamSet.has(node.id);
                const isDown = downstreamSet.has(node.id);

                const matchesFilter = courseFilter === 'all' || node.courseId === courseFilter;
                const matchesSearch = searchMatches === null || searchMatches.has(node.id);

                let opacity = 1;
                if (!matchesFilter || !matchesSearch) {
                  opacity = 0.18;
                } else if (activeSelectedId && !isSelected && !isUp && !isDown) {
                  opacity = 0.34;
                }

                const borderStroke = isSelected
                  ? course.accent
                  : isUp
                    ? '#E5A94C'
                    : isDown
                      ? course.accent
                      : 'rgba(237, 235, 228, 0.18)';

                return (
                  <g
                    key={node.id}
                    data-map-node="true"
                    transform={`translate(${node.x}, ${node.y})`}
                    opacity={opacity}
                    onClick={() => setSelectedId(node.id)}
                    className="cursor-pointer"
                  >
                    {isSelected && (
                      <rect
                        x={-80}
                        y={-36}
                        width={160}
                        height={72}
                        rx={9}
                        fill="none"
                        stroke={course.accent}
                        strokeOpacity={0.45}
                        strokeWidth={1.5}
                      />
                    )}
                    {node.status === 'live' && (
                      <rect
                        x={-77}
                        y={-33}
                        width={154}
                        height={66}
                        rx={8}
                        fill="none"
                        stroke={course.accent}
                        strokeOpacity={isSelected ? 0.55 : 0.22}
                        strokeWidth={1.5}
                      />
                    )}
                    <rect
                      x={-74}
                      y={-30}
                      width={148}
                      height={60}
                      rx={6}
                      fill={isSelected ? '#172032' : '#0C111C'}
                      stroke={borderStroke}
                      strokeWidth={isSelected ? 2 : 1.1}
                    />
                    {/* Status dot */}
                    <circle
                      cx={-58}
                      cy={-13}
                      r={3.5}
                      fill={node.status === 'live' ? course.accent : '#4B5565'}
                    />
                    <text
                      x={-48}
                      y={-9.5}
                      fill={node.status === 'live' ? course.accent : '#6C7689'}
                      fontSize="9.5"
                      fontFamily="JetBrains Mono, monospace"
                    >
                      {node.code} · {node.status === 'live' ? 'LIVE' : 'MAPPED'}
                    </text>
                    <text
                      x={-60}
                      y={11}
                      fill="#EDEBE4"
                      fontSize="11.5"
                      fontWeight="500"
                      fontFamily="IBM Plex Sans, sans-serif"
                    >
                      {node.title.length > 21 ? `${node.title.slice(0, 20)}…` : node.title}
                    </text>
                  </g>
                );
              })}
            </g>
          </svg>

          {/* Bottom-left Legend & Telemetry */}
          <div className="pointer-events-none absolute bottom-3 left-3 flex flex-wrap items-center gap-3 px-3 py-1.5 rounded bg-[#0A0D12]/85 border border-[rgba(237,235,228,0.12)] text-[11px] font-mono-data text-[#9CA6B8]">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-[#E5A94C] inline-block border-b border-dashed border-[#E5A94C]" />
              Prerequisites
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-[#38BDF8] inline-block" />
              Unlocks
            </span>
            <span className="hidden sm:inline text-[#6C7689]">
              Drag to pan · Scroll to zoom ({Math.round(view.zoom * 100)}%)
            </span>
          </div>

          {/* Bottom-right Zoom Controls */}
          <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-[#111620]/95 border border-[rgba(237,235,228,0.14)] rounded p-1">
            <button
              type="button"
              onClick={() => zoomStep(1.18)}
              aria-label="Zoom in map"
              className="p-1.5 rounded hover:bg-[#1B2433] text-[#EDEBE4]"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => zoomStep(0.84)}
              aria-label="Zoom out map"
              className="p-1.5 rounded hover:bg-[#1B2433] text-[#EDEBE4]"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={fitView}
              aria-label="Reset map view"
              className="px-2 py-1 rounded hover:bg-[#1B2433] text-[11px] font-mono-data text-[#9CA6B8] hover:text-[#EDEBE4] flex items-center gap-1"
            >
              <Maximize2 className="w-3 h-3" />
              Fit
            </button>
          </div>
        </div>

        {/* Cartographic Dossier Sidebar */}
        {!hideDossier && (
          <aside className="w-full lg:w-[340px] border-t lg:border-t-0 lg:border-l hairline-rule bg-[#111620] p-5 overflow-y-auto">
            {selectedNode ? (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span
                    className="whitespace-nowrap font-mono-data text-[11px] uppercase tracking-wider px-2 py-0.5 rounded border"
                    style={{
                      color: COURSES[selectedNode.courseId].accent,
                      borderColor: `${COURSES[selectedNode.courseId].accent}55`,
                      backgroundColor: `${COURSES[selectedNode.courseId].accent}14`,
                    }}
                  >
                    {COURSES[selectedNode.courseId].title} · {selectedNode.code}
                  </span>
                  <span
                    className={`whitespace-nowrap font-mono-data text-[10px] uppercase tracking-wider px-2 py-0.5 rounded ${
                      selectedNode.status === 'live'
                        ? 'bg-[#34D399]/15 text-[#34D399]'
                        : 'bg-[#1B2433] text-[#9CA6B8]'
                    }`}
                  >
                    {selectedNode.status === 'live' ? 'Interactive Lesson Live' : 'Scheduled Phase 2'}
                  </span>
                </div>

                <div>
                  <h3 className="font-serif-editorial text-2xl text-[#EDEBE4] leading-snug">
                    {selectedNode.title}
                  </h3>
                  <p className="text-xs text-[#9CA6B8] leading-relaxed mt-2">
                    {selectedNode.summary}
                  </p>
                </div>

                {selectedNode.status === 'live' && selectedNode.route ? (
                  <Link
                    to={selectedNode.route}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded font-medium text-sm text-[#0A0D12] transition-opacity hover:opacity-90"
                    style={{ backgroundColor: COURSES[selectedNode.courseId].accent }}
                  >
                    <Sparkles className="w-4 h-4" />
                    Enter Interactive Lesson
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                ) : (
                  <div className="p-3 rounded bg-[#161D29] border border-[rgba(237,235,228,0.08)] text-xs text-[#9CA6B8]">
                    Full interactive lesson module scheduled for Phase 2 expansion. Inspect its
                    prerequisites and official Florida B.E.S.T. standards below.
                  </div>
                )}

                {/* Upstream Prerequisites */}
                <div className="pt-2 border-t hairline-rule">
                  <p className="font-mono-data text-[10px] uppercase tracking-wider text-[#6C7689] mb-2">
                    Direct Prerequisites ({selectedNode.prerequisites.length})
                  </p>
                  {selectedNode.prerequisites.length === 0 ? (
                    <p className="text-xs text-[#9CA6B8]">Entry meridian — no prior high school prerequisites.</p>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {selectedNode.prerequisites.map((pid) => {
                        const p = nodeMap.get(pid);
                        if (!p) return null;
                        return (
                          <button
                            key={pid}
                            type="button"
                            onClick={() => focusNode(pid)}
                            className="px-2.5 py-1 rounded text-xs bg-[#161D29] border border-[rgba(229,169,76,0.3)] text-[#E5A94C] hover:bg-[#1B2433] transition-colors"
                          >
                            {p.code}: {p.title}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Direct Unlocks */}
                <div className="pt-2 border-t hairline-rule">
                  <p className="font-mono-data text-[10px] uppercase tracking-wider text-[#6C7689] mb-2">
                    Directly Unlocks
                  </p>
                  {(() => {
                    const directUnlocks = CURRICULUM_NODES.filter((n) =>
                      n.prerequisites.includes(selectedNode.id)
                    );
                    if (directUnlocks.length === 0) {
                      return (
                        <p className="text-xs text-[#9CA6B8]">
                          {selectedNode.courseId === 'precalculus'
                            ? 'Capstone Precalculus node preparing for AP Calculus and Linear Algebra.'
                            : 'Terminal node in this Phase 1 cluster — bridges into upcoming Phase 2 course modules.'}
                        </p>
                      );
                    }
                    return (
                      <div className="flex flex-wrap gap-1.5">
                        {directUnlocks.map((u) => (
                          <button
                            key={u.id}
                            type="button"
                            onClick={() => focusNode(u.id)}
                            className="px-2.5 py-1 rounded text-xs bg-[#161D29] border border-[rgba(56,189,248,0.3)] text-[#38BDF8] hover:bg-[#1B2433] transition-colors"
                          >
                            {u.code}: {u.title}
                          </button>
                        ))}
                      </div>
                    );
                  })()}
                </div>

                {/* Verified Standards */}
                <div className="pt-2 border-t hairline-rule space-y-2">
                  <p className="font-mono-data text-[10px] uppercase tracking-wider text-[#6C7689]">
                    Florida B.E.S.T. Standards
                  </p>
                  {selectedNode.standards.map((code) => {
                    const std = VERIFIED_STANDARDS[code];
                    if (!std) return null;
                    return (
                      <div
                        key={code}
                        className="p-2.5 rounded bg-[#0D121A] border border-[rgba(237,235,228,0.08)]"
                      >
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="font-mono-data text-[11px] text-[#EDEBE4]">{std.code}</span>
                          <a
                            href={std.sourceUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-[10px] font-mono-data text-[#9CA6B8] hover:text-[#EDEBE4]"
                          >
                            CPALMS <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        </div>
                        <p className="text-[11px] text-[#9CA6B8] leading-snug">{std.description}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <Compass className="w-7 h-7 text-[#6C7689] mb-3" />
                <p className="font-serif-editorial text-lg text-[#EDEBE4]">Select a Meridian Node</p>
                <p className="text-xs text-[#9CA6B8] mt-1 max-w-xs">
                  Click any node on the cartography canvas to trace its upstream prerequisites,
                  unlocked topics, and verified Florida B.E.S.T. standards.
                </p>
              </div>
            )}
          </aside>
        )}
      </div>
    </div>
  );
}
