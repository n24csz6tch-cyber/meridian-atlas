import { Suspense, lazy, useEffect, useMemo, useRef, useState } from 'react';
import { Eye, Pause, Play, Scissors } from 'lucide-react';
import { MathTex } from '../components/MathTex';
import type { SolidHighlightPart, SolidKind } from '../visuals/solids/SolidNetScene';

const LazySolidNetScene = lazy(() => import('../visuals/solids/SolidNetScene'));

interface SolidNetLabProps {
  controlledSolid?: SolidKind;
  controlledUnfold?: number;
  controlledHighlight?: SolidHighlightPart;
  controlledInternalTriangle?: boolean;
  onSyncOverrideClear?: () => void;
}

function fmt(n: number): string {
  return (Math.round(n * 100) / 100).toFixed(2).replace(/\.?0+$/, '');
}

export function SolidNetLab({
  controlledSolid,
  controlledUnfold,
  controlledHighlight,
  controlledInternalTriangle,
  onSyncOverrideClear,
}: SolidNetLabProps = {}) {
  const [solid, setSolid] = useState<SolidKind>(controlledSolid ?? 'square-pyramid');
  const [width, setWidth] = useState(2.6);
  const [depth, setDepth] = useState(2.2);
  const [height, setHeight] = useState(2.4);
  const [unfold, setUnfold] = useState(controlledUnfold ?? 0);
  const [highlightPart, setHighlightPart] = useState<SolidHighlightPart>(
    controlledHighlight ?? 'all'
  );
  const [sliceOn, setSliceOn] = useState(false);
  const [sliceHeight, setSliceHeight] = useState(0.5);
  const [showInternal, setShowInternal] = useState(controlledInternalTriangle ?? true);
  const [isPlaying, setIsPlaying] = useState(false);

  const playRafRef = useRef<number | null>(null);

  useEffect(() => {
    if (controlledSolid !== undefined) setSolid(controlledSolid);
  }, [controlledSolid]);

  useEffect(() => {
    if (controlledUnfold !== undefined) {
      setIsPlaying(false);
      setUnfold(controlledUnfold);
      if (controlledUnfold > 0.1) setSliceOn(false);
    }
  }, [controlledUnfold]);

  useEffect(() => {
    if (controlledHighlight !== undefined) setHighlightPart(controlledHighlight);
  }, [controlledHighlight]);

  useEffect(() => {
    if (controlledInternalTriangle !== undefined) setShowInternal(controlledInternalTriangle);
  }, [controlledInternalTriangle]);

  useEffect(() => {
    if (!isPlaying) {
      if (playRafRef.current) cancelAnimationFrame(playRafRef.current);
      return;
    }

    const startVal = unfold;
    const targetVal = startVal < 0.5 ? 1 : 0;
    const duration = 2100;
    const startTime = performance.now();

    const step = (now: number) => {
      const t = Math.min(1, (now - startTime) / duration);
      // Smooth quintic ease-in-out for museum-grade hinge articulation
      const eased =
        t < 0.5 ? 16 * t * t * t * t * t : 1 - Math.pow(-2 * t + 2, 5) / 2;
      setUnfold(startVal + (targetVal - startVal) * eased);
      if (t < 1) {
        playRafRef.current = requestAnimationFrame(step);
      } else {
        setIsPlaying(false);
      }
    };
    playRafRef.current = requestAnimationFrame(step);
    return () => {
      if (playRafRef.current) cancelAnimationFrame(playRafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying]);

  const metrics = useMemo(() => {
    if (solid === 'square-pyramid') {
      const s = width;
      const B = s * s;
      const P = 4 * s;
      const l = Math.sqrt(height * height + (s / 2) * (s / 2));
      const L = 0.5 * P * l;
      const SA = B + L;
      const V = (1 / 3) * B * height;
      return {
        B,
        baseTotal: B,
        baseCount: 1,
        L,
        SA,
        V,
        slant: l,
        saTex: `SA = {\\color{#F4C46C}B} + {\\color{#46D6E8}\\tfrac{1}{2}Pl} = {\\color{#F4C46C}${fmt(
          B
        )}} + {\\color{#46D6E8}${fmt(L)}} = ${fmt(SA)}`,
        volTex: `V = \\tfrac{1}{3}Bh = \\tfrac{1}{3}(${fmt(B)})(${fmt(height)}) = ${fmt(V)}`,
        sliceShape: `Similar Square (${fmt((1 - sliceHeight) * s)} × ${fmt((1 - sliceHeight) * s)})`,
      };
    }
    if (solid === 'rectangular-prism') {
      const B = width * depth;
      const P = 2 * (width + depth);
      const L = P * height;
      const SA = 2 * B + L;
      const V = B * height;
      return {
        B,
        baseTotal: 2 * B,
        baseCount: 2,
        L,
        SA,
        V,
        slant: null,
        saTex: `SA = {\\color{#F4C46C}2B} + {\\color{#46D6E8}Ph} = {\\color{#F4C46C}${fmt(
          2 * B
        )}} + {\\color{#46D6E8}${fmt(L)}} = ${fmt(SA)}`,
        volTex: `V = Bh = (${fmt(B)})(${fmt(height)}) = ${fmt(V)}`,
        sliceShape: `Congruent Rectangle (${fmt(width)} × ${fmt(depth)})`,
      };
    }
    // triangular-prism (isosceles base width, triangle height, prism depth)
    const B = 0.5 * width * height;
    const leg = Math.sqrt(height * height + (width / 2) * (width / 2));
    const P = width + 2 * leg;
    const L = P * depth;
    const SA = 2 * B + L;
    const V = B * depth;
    return {
      B,
      baseTotal: 2 * B,
      baseCount: 2,
      L,
      SA,
      V,
      slant: leg,
      saTex: `SA = {\\color{#F4C46C}2B} + {\\color{#46D6E8}P_{\\triangle}d} = {\\color{#F4C46C}${fmt(
        2 * B
      )}} + {\\color{#46D6E8}${fmt(L)}} = ${fmt(SA)}`,
      volTex: `V = Bd = (${fmt(B)})(${fmt(depth)}) = ${fmt(V)}`,
      sliceShape: `Rectangle (${fmt((1 - sliceHeight) * width)} × ${fmt(depth)})`,
    };
  }, [solid, width, depth, height, sliceHeight]);

  return (
    <div className="instrument-frame fiducial-frame overflow-hidden bg-[#0B0C12] border border-[rgba(244,196,108,0.17)]">
      {/* Header Bar */}
      <div className="px-5 py-3.5 border-b border-[rgba(244,196,108,0.17)] bg-[#0B0C12] flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className="font-mono-data text-[10.5px] uppercase tracking-[0.18em] text-[#F4C46C]">
            Integrated 3D Instrument · Geometry Observatory
          </span>
          <h3 className="font-serif-editorial text-2xl text-[#F7F4EC]">
            Articulated Solid &amp; Hinged Net Lab
          </h3>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {[
            { id: 'square-pyramid' as SolidKind, label: 'Square Pyramid' },
            { id: 'rectangular-prism' as SolidKind, label: 'Rectangular Prism' },
            { id: 'triangular-prism' as SolidKind, label: 'Triangular Prism' },
          ].map((item) => {
            const active = solid === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onSyncOverrideClear?.();
                  setSolid(item.id);
                }}
                className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-all ${
                  active
                    ? 'border-[#F4C46C] bg-[#F4C46C]/15 text-[#FFE29E] shadow-[0_0_16px_-4px_rgba(244,196,108,0.45)]'
                    : 'border-[rgba(244,196,108,0.16)] bg-[#11131C] text-[#A8B2C6] hover:text-[#F7F4EC] hover:border-[rgba(244,196,108,0.35)]'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Split Viewport & AUREA HUD */}
      <div className="grid grid-cols-1 lg:grid-cols-12">
        <div className="lg:col-span-8 border-b lg:border-b-0 lg:border-r border-[rgba(244,196,108,0.17)] relative">
          <Suspense
            fallback={
              <div className="h-[410px] flex items-center justify-center bg-[#06070B] font-mono-data text-xs text-[#A8B2C6]">
                Loading 3D Articulated Solid Engine…
              </div>
            }
          >
            <LazySolidNetScene
              solid={solid}
              width={width}
              depth={solid === 'square-pyramid' ? width : depth}
              height={height}
              unfold={unfold}
              highlightPart={highlightPart}
              showInternalTriangle={showInternal}
              sliceHeight={sliceOn ? sliceHeight : null}
              heightClass="h-[390px] sm:h-[460px]"
            />
          </Suspense>

          {/* Live Surface-Area / Volume Decomposition Pill Badges */}
          <div className="pointer-events-none absolute top-3 left-3 right-3 flex flex-wrap gap-1.5">
            <span className="obsidian-glass px-2.5 py-1 rounded-md border border-[rgba(244,196,108,0.28)] font-mono-data text-[10.5px] text-[#FFE29E]">
              {metrics.baseCount === 1 ? 'Base B' : '2 Bases (2B)'}: {fmt(metrics.baseTotal)} u²
            </span>
            <span className="obsidian-glass px-2.5 py-1 rounded-md border border-[rgba(70,214,232,0.28)] font-mono-data text-[10.5px] text-[#46D6E8]">
              Side Walls (L): {fmt(metrics.L)} u²
            </span>
            <span className="obsidian-glass px-2.5 py-1 rounded-md border border-[rgba(69,230,166,0.28)] font-mono-data text-[10.5px] text-[#45E6A6]">
              Total SA: {fmt(metrics.SA)} u²
            </span>
            <span className="obsidian-glass px-2.5 py-1 rounded-md border border-[rgba(244,196,108,0.22)] font-mono-data text-[10.5px] text-[#F7F4EC]">
              Volume V: {fmt(metrics.V)} u³
            </span>
          </div>
        </div>

        <div className="lg:col-span-4 bg-[#0B0C12] p-5 flex flex-col justify-between gap-4">
          <div className="space-y-4">
            {/* Unfold Animation Controls */}
            <div className="p-3.5 rounded-lg bg-[#11131C] border border-[rgba(244,196,108,0.17)] space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-mono-data text-xs text-[#F4C46C]">
                  Hinge Unfold: {Math.round(unfold * 100)}%
                </span>
                <button
                  type="button"
                  onClick={() => {
                    onSyncOverrideClear?.();
                    setSliceOn(false);
                    setIsPlaying((p) => !p);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold bg-gradient-to-r from-[#F4C46C] to-[#FFE29E] text-[#06070B] hover:brightness-105 transition-all"
                >
                  {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  {isPlaying ? 'Pause' : unfold < 0.5 ? 'Unfold Net' : 'Fold Solid'}
                </button>
              </div>
              <input
                type="range"
                min={0}
                max={1}
                step={0.005}
                value={unfold}
                onChange={(e) => {
                  onSyncOverrideClear?.();
                  setIsPlaying(false);
                  const val = parseFloat(e.target.value);
                  setUnfold(val);
                  if (val > 0.1) setSliceOn(false);
                }}
                className="meridian-slider"
                style={{ ['--slider-accent' as string]: '#F4C46C' }}
              />
              <div className="flex gap-1.5 pt-0.5">
                {[
                  { label: '3D Closed', val: 0 },
                  { label: 'Half Open', val: 0.5 },
                  { label: '2D Flat Net', val: 1 },
                ].map((snap) => (
                  <button
                    key={snap.label}
                    type="button"
                    onClick={() => {
                      onSyncOverrideClear?.();
                      setIsPlaying(false);
                      setUnfold(snap.val);
                      if (snap.val > 0.1) setSliceOn(false);
                    }}
                    className={`flex-1 py-1 rounded text-[10px] font-mono-data border transition-colors ${
                      Math.abs(unfold - snap.val) < 0.04
                        ? 'border-[#F4C46C]/60 bg-[#F4C46C]/15 text-[#FFE29E]'
                        : 'border-[rgba(244,196,108,0.12)] text-[#A8B2C6] hover:text-[#F7F4EC]'
                    }`}
                  >
                    {snap.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Dimension Sliders */}
            <div className="space-y-2.5 p-3.5 rounded-lg bg-[#11131C] border border-[rgba(244,196,108,0.17)]">
              <label className="block space-y-1 text-xs">
                <div className="flex justify-between font-mono-data">
                  <span className="text-[#A8B2C6]">
                    {solid === 'square-pyramid' ? 'Base Side (s)' : 'Width (w)'}
                  </span>
                  <span className="text-[#F4C46C]">{fmt(width)} u</span>
                </div>
                <input
                  type="range"
                  min={1.6}
                  max={3.6}
                  step={0.1}
                  value={width}
                  onChange={(e) => setWidth(parseFloat(e.target.value))}
                  className="meridian-slider"
                  style={{ ['--slider-accent' as string]: '#F4C46C' }}
                />
              </label>

              {solid !== 'square-pyramid' && (
                <label className="block space-y-1 text-xs">
                  <div className="flex justify-between font-mono-data">
                    <span className="text-[#A8B2C6]">Depth / Length (d)</span>
                    <span className="text-[#46D6E8]">{fmt(depth)} u</span>
                  </div>
                  <input
                    type="range"
                    min={1.6}
                    max={3.4}
                    step={0.1}
                    value={depth}
                    onChange={(e) => setDepth(parseFloat(e.target.value))}
                    className="meridian-slider"
                    style={{ ['--slider-accent' as string]: '#46D6E8' }}
                  />
                </label>
              )}

              <label className="block space-y-1 text-xs">
                <div className="flex justify-between font-mono-data">
                  <span className="text-[#A8B2C6]">Vertical Height (h)</span>
                  <span className="text-[#45E6A6]">{fmt(height)} u</span>
                </div>
                <input
                  type="range"
                  min={1.6}
                  max={3.6}
                  step={0.1}
                  value={height}
                  onChange={(e) => setHeight(parseFloat(e.target.value))}
                  className="meridian-slider"
                  style={{ ['--slider-accent' as string]: '#45E6A6' }}
                />
              </label>
            </div>

            {/* Face Highlight Sync + Cross Section Slicer */}
            <div className="space-y-2">
              <span className="font-mono-data text-[10px] uppercase tracking-wider text-[#A8B2C6] block">
                Inspect Surface Parts &amp; Laser Slice
              </span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { id: 'all' as SolidHighlightPart, label: 'All Faces', activeClass: 'border-[#F4C46C] bg-[#F4C46C]/15 text-[#FFE29E]' },
                  { id: 'base' as SolidHighlightPart, label: 'Base (B)', activeClass: 'border-[#F4C46C] bg-[#F4C46C]/20 text-[#FFE29E]' },
                  { id: 'lateral' as SolidHighlightPart, label: 'Side Walls (L)', activeClass: 'border-[#46D6E8] bg-[#46D6E8]/15 text-[#46D6E8]' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      onSyncOverrideClear?.();
                      setHighlightPart(opt.id);
                    }}
                    className={`px-2.5 py-1 rounded text-xs font-mono-data border transition-colors ${
                      highlightPart === opt.id
                        ? opt.activeClass
                        : 'border-[rgba(244,196,108,0.16)] bg-[#11131C] text-[#A8B2C6] hover:text-[#F7F4EC]'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    onSyncOverrideClear?.();
                    setSliceOn((prev) => {
                      const next = !prev;
                      if (next) {
                        setIsPlaying(false);
                        setUnfold(0);
                      }
                      return next;
                    });
                  }}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-mono-data border transition-colors ${
                    sliceOn
                      ? 'border-[#FF8563] bg-[#FF8563]/15 text-[#FF8563]'
                      : 'border-[rgba(244,196,108,0.16)] bg-[#11131C] text-[#A8B2C6] hover:text-[#F7F4EC]'
                  }`}
                >
                  <Scissors className="w-3 h-3" /> Laser Slice
                </button>
                {solid === 'square-pyramid' && (
                  <button
                    type="button"
                    onClick={() => setShowInternal((v) => !v)}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-mono-data border transition-colors ${
                      showInternal
                        ? 'border-[#45E6A6]/60 bg-[#45E6A6]/12 text-[#45E6A6]'
                        : 'border-[rgba(244,196,108,0.16)] bg-[#11131C] text-[#A8B2C6]'
                    }`}
                  >
                    <Eye className="w-3 h-3" /> Right Triangle (h, l)
                  </button>
                )}
              </div>

              {sliceOn && (
                <div className="p-3 rounded-lg bg-[#11131C] border border-[#FF8563]/40 space-y-1.5 text-xs">
                  <div className="flex justify-between font-mono-data">
                    <span className="text-[#FF8563]">Laser Cut Height</span>
                    <span className="text-[#FFE29E]">{Math.round(sliceHeight * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min={0.1}
                    max={0.9}
                    step={0.02}
                    value={sliceHeight}
                    onChange={(e) => setSliceHeight(parseFloat(e.target.value))}
                    className="meridian-slider"
                    style={{ ['--slider-accent' as string]: '#FF8563' }}
                  />
                  <p className="font-mono-data text-[11px] text-[#F7F4EC]">
                    2D Cross-Section: {metrics.sliceShape}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Live Telemetry KaTeX Readout */}
          <div className="p-3.5 rounded-lg bg-[#11131C] border border-[rgba(244,196,108,0.17)] space-y-2">
            {metrics.slant !== null && (
              <div className="flex justify-between items-center text-xs font-mono-data">
                <span className="text-[#45E6A6]">Slant Height (l)</span>
                <span className="text-[#F7F4EC]">{fmt(metrics.slant)} u</span>
              </div>
            )}
            <MathTex tex={metrics.saTex} className="text-xs sm:text-sm text-[#F7F4EC] block" />
            <MathTex tex={metrics.volTex} className="text-xs sm:text-sm text-[#A8B2C6] block" />
          </div>
        </div>
      </div>
    </div>
  );
}
