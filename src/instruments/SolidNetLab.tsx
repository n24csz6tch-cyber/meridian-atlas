import { Suspense, lazy, useEffect, useMemo, useRef, useState } from 'react';
import { Pause, Play, Scissors } from 'lucide-react';
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
}: SolidNetLabProps) {
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
    const duration = 1800;
    const startTime = performance.now();

    const step = (now: number) => {
      const t = Math.min(1, (now - startTime) / duration);
      const eased = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
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
        baseCount: 1,
        L,
        SA,
        V,
        slant: l,
        saTex: `SA = {\\color{#38BDF8}B} + {\\color{#22D3EE}\\tfrac{1}{2}Pl} = {\\color{#38BDF8}${fmt(
          B
        )}} + {\\color{#22D3EE}${fmt(L)}} = ${fmt(SA)}`,
        volTex: `V = \\tfrac{1}{3}Bh = \\tfrac{1}{3}(${fmt(B)})(${fmt(height)}) = ${fmt(V)}`,
        sliceShape: `Square (${fmt((1 - sliceHeight) * s)} × ${fmt((1 - sliceHeight) * s)})`,
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
        baseCount: 2,
        L,
        SA,
        V,
        slant: null,
        saTex: `SA = {\\color{#38BDF8}2B} + {\\color{#22D3EE}Ph} = {\\color{#38BDF8}${fmt(
          2 * B
        )}} + {\\color{#22D3EE}${fmt(L)}} = ${fmt(SA)}`,
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
      baseCount: 2,
      L,
      SA,
      V,
      slant: leg,
      saTex: `SA = {\\color{#38BDF8}2B} + {\\color{#22D3EE}P_{\\triangle}d} = {\\color{#38BDF8}${fmt(
        2 * B
      )}} + {\\color{#22D3EE}${fmt(L)}} = ${fmt(SA)}`,
      volTex: `V = Bd = (${fmt(B)})(${fmt(depth)}) = ${fmt(V)}`,
      sliceShape: `Rectangle (${fmt((1 - sliceHeight) * width)} × ${fmt(depth)})`,
    };
  }, [solid, width, depth, height, sliceHeight]);

  return (
    <div className="instrument-frame overflow-hidden">
      <div className="px-5 py-3.5 border-b hairline-rule bg-[#111620] flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className="font-mono-data text-[11px] uppercase tracking-wider text-[#38BDF8]">
            Integrated 3D Instrument · Geometry
          </span>
          <h3 className="font-serif-editorial text-2xl text-[#EDEBE4]">
            Articulated Solid &amp; Hinged Net Lab
          </h3>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {[
            { id: 'square-pyramid' as SolidKind, label: 'Square Pyramid' },
            { id: 'rectangular-prism' as SolidKind, label: 'Rectangular Prism' },
            { id: 'triangular-prism' as SolidKind, label: 'Triangular Prism' },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                onSyncOverrideClear?.();
                setSolid(item.id);
              }}
              className={`px-3 py-1.5 rounded text-xs font-medium border transition-colors ${
                solid === item.id
                  ? 'border-[#38BDF8] bg-[#38BDF8]/15 text-[#38BDF8]'
                  : 'border-[rgba(237,235,228,0.12)] text-[#9CA6B8] hover:text-[#EDEBE4]'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12">
        <div className="lg:col-span-8 border-b lg:border-b-0 lg:border-r hairline-rule">
          <Suspense
            fallback={
              <div className="h-[410px] flex items-center justify-center bg-[#0B1018] font-mono-data text-xs text-[#9CA6B8]">
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
              heightClass="h-[390px] sm:h-[440px]"
            />
          </Suspense>
        </div>

        <div className="lg:col-span-4 bg-[#111620] p-5 flex flex-col justify-between gap-4">
          <div className="space-y-4">
            {/* Unfold Animation Controls */}
            <div className="p-3.5 rounded bg-[#0D121A] border border-[rgba(237,235,228,0.1)] space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-mono-data text-xs text-[#38BDF8]">
                  Net Hinge Angle: {Math.round(unfold * 100)}%
                </span>
                <button
                  type="button"
                  onClick={() => {
                    onSyncOverrideClear?.();
                    setSliceOn(false);
                    setIsPlaying((p) => !p);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium bg-[#38BDF8] text-[#0A0D12] hover:opacity-90"
                >
                  {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  {isPlaying ? 'Pause' : unfold < 0.5 ? 'Play Unfold' : 'Fold Back'}
                </button>
              </div>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={unfold}
                onChange={(e) => {
                  onSyncOverrideClear?.();
                  setIsPlaying(false);
                  const val = parseFloat(e.target.value);
                  setUnfold(val);
                  if (val > 0.1) setSliceOn(false);
                }}
                className="meridian-slider"
                style={{ ['--slider-accent' as string]: '#38BDF8' }}
              />
            </div>

            {/* Dimension Sliders */}
            <div className="space-y-2.5">
              <label className="block space-y-1 text-xs">
                <div className="flex justify-between font-mono-data">
                  <span className="text-[#9CA6B8]">
                    {solid === 'square-pyramid' ? 'Base Side (s)' : 'Width (w)'}
                  </span>
                  <span className="text-[#EDEBE4]">{fmt(width)} u</span>
                </div>
                <input
                  type="range"
                  min={1.6}
                  max={3.6}
                  step={0.1}
                  value={width}
                  onChange={(e) => setWidth(parseFloat(e.target.value))}
                  className="meridian-slider"
                  style={{ ['--slider-accent' as string]: '#38BDF8' }}
                />
              </label>

              {solid !== 'square-pyramid' && (
                <label className="block space-y-1 text-xs">
                  <div className="flex justify-between font-mono-data">
                    <span className="text-[#9CA6B8]">Depth / Length (d)</span>
                    <span className="text-[#EDEBE4]">{fmt(depth)} u</span>
                  </div>
                  <input
                    type="range"
                    min={1.6}
                    max={3.4}
                    step={0.1}
                    value={depth}
                    onChange={(e) => setDepth(parseFloat(e.target.value))}
                    className="meridian-slider"
                    style={{ ['--slider-accent' as string]: '#38BDF8' }}
                  />
                </label>
              )}

              <label className="block space-y-1 text-xs">
                <div className="flex justify-between font-mono-data">
                  <span className="text-[#9CA6B8]">Altitude Height (h)</span>
                  <span className="text-[#EDEBE4]">{fmt(height)} u</span>
                </div>
                <input
                  type="range"
                  min={1.6}
                  max={3.6}
                  step={0.1}
                  value={height}
                  onChange={(e) => setHeight(parseFloat(e.target.value))}
                  className="meridian-slider"
                  style={{ ['--slider-accent' as string]: '#38BDF8' }}
                />
              </label>
            </div>

            {/* Face Highlight Sync + Cross Section Slicer */}
            <div className="space-y-2">
              <span className="font-mono-data text-[10px] uppercase tracking-wider text-[#6C7689] block">
                Highlight Surface Components
              </span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { id: 'all' as SolidHighlightPart, label: 'All Faces' },
                  { id: 'base' as SolidHighlightPart, label: 'Base (B)' },
                  { id: 'lateral' as SolidHighlightPart, label: 'Lateral (L)' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      onSyncOverrideClear?.();
                      setHighlightPart(opt.id);
                    }}
                    className={`px-2.5 py-1 rounded text-xs font-mono-data border ${
                      highlightPart === opt.id
                        ? 'border-[#38BDF8] bg-[#38BDF8]/15 text-[#38BDF8]'
                        : 'border-[rgba(237,235,228,0.12)] text-[#9CA6B8]'
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
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-mono-data border ${
                    sliceOn
                      ? 'border-[#F9735B] bg-[#F9735B]/15 text-[#F9735B]'
                      : 'border-[rgba(237,235,228,0.12)] text-[#9CA6B8]'
                  }`}
                >
                  <Scissors className="w-3 h-3" /> Cross-Section
                </button>
              </div>

              {sliceOn && (
                <div className="p-3 rounded bg-[#0D121A] border border-[#F9735B]/35 space-y-1.5 text-xs">
                  <div className="flex justify-between font-mono-data">
                    <span className="text-[#F9735B]">Slice Plane Elevation</span>
                    <span>{Math.round(sliceHeight * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min={0.1}
                    max={0.9}
                    step={0.02}
                    value={sliceHeight}
                    onChange={(e) => setSliceHeight(parseFloat(e.target.value))}
                    className="meridian-slider"
                    style={{ ['--slider-accent' as string]: '#F9735B' }}
                  />
                  <p className="font-mono-data text-[11px] text-[#EDEBE4]">
                    2D Intersection: {metrics.sliceShape}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Live Telemetry KaTeX Readout */}
          <div className="p-3.5 rounded bg-[#0D121A] border border-[rgba(237,235,228,0.1)] space-y-2">
            {metrics.slant !== null && (
              <div className="flex justify-between items-center text-xs font-mono-data">
                <span className="text-[#34D399]">Slant Height (l)</span>
                <span>{fmt(metrics.slant)} u</span>
              </div>
            )}
            <MathTex tex={metrics.saTex} className="text-xs sm:text-sm text-[#EDEBE4] block" />
            <MathTex tex={metrics.volTex} className="text-xs sm:text-sm text-[#9CA6B8] block" />
          </div>
        </div>
      </div>
    </div>
  );
}
