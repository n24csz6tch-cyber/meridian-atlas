import { Suspense, lazy, useState } from 'react';
import { ParabolaCanvas, ParabolaHighlightFeature } from '../visuals/parabola/ParabolaCanvas';
import type { SolidHighlightPart, SolidKind } from '../visuals/solids/SolidNetScene';
import { PrerequisiteMap } from '../visuals/map/PrerequisiteMap';
import { MathVortexCanvas } from '../visuals/vortex/MathVortexCanvas';
import { NeuralMathEngine } from '../visuals/neural/NeuralMathEngine';
import { UnitCircleWaveCanvas } from '../visuals/trig/UnitCircleWaveCanvas';
import { VectorParallelogramCanvas } from '../visuals/trig/VectorParallelogramCanvas';
import { LogarithmLab } from '../visuals/logarithms/LogarithmLab';

const LazySolidNetScene = lazy(() => import('../visuals/solids/SolidNetScene'));

export function ParabolaSandbox() {
  const [a, setA] = useState(1);
  const [h, setH] = useState(2);
  const [k, setK] = useState(-3);
  const [highlight, setHighlight] = useState<ParabolaHighlightFeature>(null);
  const [showGhost, setShowGhost] = useState(false);

  return (
    <div className="min-h-screen bg-[#0A0D12] text-[#EDEBE4] p-6 space-y-5 cartographic-grid">
      <div className="max-w-5xl mx-auto space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b hairline-rule pb-3">
          <div>
            <p className="font-mono-data text-xs uppercase tracking-widest text-[#E5A94C]">
              QA Sandbox · Visual 4A
            </p>
            <h1 className="font-serif-editorial text-2xl">Parabolic Geometry Instrument</h1>
          </div>
          <div className="flex flex-wrap gap-2">
            {(['vertex', 'axis', 'roots', 'yIntercept', 'curvature'] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setHighlight((prev) => (prev === f ? null : f))}
                className={`px-2.5 py-1 rounded text-xs font-mono-data border ${
                  highlight === f
                    ? 'border-[#E5A94C] bg-[#E5A94C]/15 text-[#E5A94C]'
                    : 'border-[rgba(237,235,228,0.14)] text-[#9CA6B8]'
                }`}
              >
                {f}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setShowGhost((s) => !s)}
              className={`px-2.5 py-1 rounded text-xs font-mono-data border ${
                showGhost
                  ? 'border-[#F9735B] bg-[#F9735B]/15 text-[#F9735B]'
                  : 'border-[rgba(237,235,228,0.14)] text-[#9CA6B8]'
              }`}
            >
              Sign-Flip Ghost
            </button>
          </div>
        </div>

        <ParabolaCanvas
          a={a}
          h={h}
          k={k}
          onChange={(next) => {
            setA(next.a);
            setH(next.h);
            setK(next.k);
          }}
          highlightFeature={highlight}
          showParentCurve
          probeX={showGhost ? 2 : null}
          ghostCurve={
            showGhost
              ? { a, h: -h, k, label: `g(x): V(${-h}, ${k})`, color: '#38BDF8' }
              : null
          }
        />

        <div className="instrument-frame p-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <label className="space-y-1.5 text-xs">
            <div className="flex justify-between font-mono-data">
              <span className="text-[#E5A94C]">a (Curvature)</span>
              <span>{a}</span>
            </div>
            <input
              type="range"
              min={-3}
              max={3}
              step={0.1}
              value={a}
              onChange={(e) => {
                const v = parseFloat(e.target.value);
                setA(Math.abs(v) < 0.2 ? (v >= 0 ? 0.2 : -0.2) : v);
              }}
              className="meridian-slider"
              style={{ ['--slider-accent' as string]: '#E5A94C' }}
            />
          </label>
          <label className="space-y-1.5 text-xs">
            <div className="flex justify-between font-mono-data">
              <span className="text-[#38BDF8]">h (Horizontal Shift)</span>
              <span>{h}</span>
            </div>
            <input
              type="range"
              min={-6}
              max={6}
              step={0.5}
              value={h}
              onChange={(e) => setH(parseFloat(e.target.value))}
              className="meridian-slider"
              style={{ ['--slider-accent' as string]: '#38BDF8' }}
            />
          </label>
          <label className="space-y-1.5 text-xs">
            <div className="flex justify-between font-mono-data">
              <span className="text-[#F9735B]">k (Vertical Shift)</span>
              <span>{k}</span>
            </div>
            <input
              type="range"
              min={-5}
              max={5}
              step={0.5}
              value={k}
              onChange={(e) => setK(parseFloat(e.target.value))}
              className="meridian-slider"
              style={{ ['--slider-accent' as string]: '#F9735B' }}
            />
          </label>
        </div>
      </div>
    </div>
  );
}

export function SolidsSandbox() {
  const [solid, setSolid] = useState<SolidKind>('square-pyramid');
  const [unfold, setUnfold] = useState(0);
  const [highlightPart, setHighlightPart] = useState<SolidHighlightPart>('all');
  const [sliceOn, setSliceOn] = useState(false);
  const [sliceHeight, setSliceHeight] = useState(0.5);
  const [showInternal, setShowInternal] = useState(true);

  return (
    <div className="min-h-screen bg-[#0A0D12] text-[#EDEBE4] p-6 space-y-5 cartographic-grid">
      <div className="max-w-5xl mx-auto space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b hairline-rule pb-3">
          <div>
            <p className="font-mono-data text-xs uppercase tracking-widest text-[#38BDF8]">
              QA Sandbox · Visual 4B
            </p>
            <h1 className="font-serif-editorial text-2xl">3D Articulated Solid &amp; Hinged Net</h1>
          </div>
          <div className="flex flex-wrap gap-2">
            {(['square-pyramid', 'rectangular-prism', 'triangular-prism'] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSolid(s)}
                className={`px-3 py-1 rounded text-xs font-mono-data border ${
                  solid === s
                    ? 'border-[#38BDF8] bg-[#38BDF8]/15 text-[#38BDF8]'
                    : 'border-[rgba(237,235,228,0.14)] text-[#9CA6B8]'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="instrument-frame overflow-hidden">
          <Suspense
            fallback={
              <div className="h-[440px] flex items-center justify-center text-xs font-mono-data text-[#9CA6B8]">
                Initializing 3D Solid Viewport…
              </div>
            }
          >
            <LazySolidNetScene
              solid={solid}
              width={2.6}
              depth={2.2}
              height={2.4}
              unfold={unfold}
              highlightPart={highlightPart}
              showInternalTriangle={showInternal}
              sliceHeight={sliceOn ? sliceHeight : null}
            />
          </Suspense>
          <div className="p-4 border-t hairline-rule bg-[#111620] flex flex-wrap items-center gap-4">
            <label className="flex-1 min-w-[220px] space-y-1 text-xs">
              <div className="flex justify-between font-mono-data">
                <span className="text-[#38BDF8]">Unfold Net</span>
                <span>{Math.round(unfold * 100)}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={unfold}
                onChange={(e) => setUnfold(parseFloat(e.target.value))}
                className="meridian-slider"
                style={{ ['--slider-accent' as string]: '#38BDF8' }}
              />
            </label>

            <div className="flex flex-wrap items-center gap-2">
              {([0, 0.5, 1] as const).map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setUnfold(val)}
                  className="px-2.5 py-1 rounded text-xs font-mono-data border border-[rgba(237,235,228,0.14)] text-[#EDEBE4] hover:border-[#38BDF8]"
                >
                  {Math.round(val * 100)}%
                </button>
              ))}
              {(['all', 'base', 'lateral'] as const).map((part) => (
                <button
                  key={part}
                  type="button"
                  onClick={() => setHighlightPart(part)}
                  className={`px-2.5 py-1 rounded text-xs font-mono-data border ${
                    highlightPart === part
                      ? 'border-[#38BDF8] bg-[#38BDF8]/15 text-[#38BDF8]'
                      : 'border-[rgba(237,235,228,0.14)] text-[#9CA6B8]'
                  }`}
                >
                  {part}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setSliceOn((s) => !s)}
                className={`px-2.5 py-1 rounded text-xs font-mono-data border ${
                  sliceOn
                    ? 'border-[#F9735B] bg-[#F9735B]/15 text-[#F9735B]'
                    : 'border-[rgba(237,235,228,0.14)] text-[#9CA6B8]'
                }`}
              >
                Cross-Section
              </button>
              <button
                type="button"
                onClick={() => setShowInternal((s) => !s)}
                className={`px-2.5 py-1 rounded text-xs font-mono-data border ${
                  showInternal
                    ? 'border-[#34D399] bg-[#34D399]/15 text-[#34D399]'
                    : 'border-[rgba(237,235,228,0.14)] text-[#9CA6B8]'
                }`}
              >
                Slant Triangle
              </button>
            </div>

            {sliceOn && (
              <label className="w-48 space-y-1 text-xs">
                <div className="flex justify-between font-mono-data">
                  <span className="text-[#F9735B]">Slice Plane</span>
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
              </label>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function MapSandbox() {
  return (
    <div className="min-h-screen bg-[#05070C] text-[#F2F0E8] p-6 space-y-4 cartographic-grid">
      <div className="max-w-7xl mx-auto space-y-3">
        <div className="border-b hairline-rule pb-3">
          <p className="font-mono-data text-xs uppercase tracking-widest text-[#F4B956]">
            QA Sandbox · Visual 4C
          </p>
          <h1 className="font-serif-editorial text-2xl">Prerequisite Cartography Map</h1>
        </div>
        <PrerequisiteMap />
      </div>
    </div>
  );
}

export function NeuralSandbox() {
  return (
    <div className="min-h-screen bg-[#05070C] text-[#F2F0E8] p-6 space-y-4 cartographic-grid">
      <div className="max-w-7xl mx-auto space-y-4">
        <div className="border-b hairline-rule pb-3">
          <p className="font-mono-data text-xs uppercase tracking-widest text-[#38D4FF]">
            QA Sandbox · PEAK Engine 1
          </p>
          <h1 className="font-serif-editorial text-2xl">Neural Matrix &amp; Backprop Engine</h1>
        </div>
        <NeuralMathEngine />
      </div>
    </div>
  );
}

export function VortexSandbox() {
  return (
    <div className="min-h-screen bg-[#05070C] text-[#F2F0E8] p-6 space-y-4 cartographic-grid">
      <div className="max-w-7xl mx-auto space-y-4">
        <div className="border-b hairline-rule pb-3">
          <p className="font-mono-data text-xs uppercase tracking-widest text-[#F4B956]">
            QA Sandbox · PEAK Engine 2
          </p>
          <h1 className="font-serif-editorial text-2xl">Mathematical Vortex, Lorenz &amp; Fourier Theater</h1>
        </div>
        <MathVortexCanvas />
      </div>
    </div>
  );
}

export function TrigSandbox() {
  return (
    <div className="min-h-screen bg-[#05070C] text-[#F2F0E8] p-6 space-y-5 cartographic-grid">
      <div className="max-w-7xl mx-auto space-y-5">
        <div className="border-b hairline-rule pb-3">
          <p className="font-mono-data text-xs uppercase tracking-widest text-[#FF785A]">
            QA Sandbox · PEAK Engine 3
          </p>
          <h1 className="font-serif-editorial text-2xl">Unit Circle Waves &amp; Vector Parallelogram</h1>
        </div>
        <UnitCircleWaveCanvas />
        <VectorParallelogramCanvas />
      </div>
    </div>
  );
}

export function LogsSandbox() {
  return (
    <div className="min-h-screen bg-[#05070C] text-[#F2F0E8] p-6 space-y-4 cartographic-grid">
      <div className="max-w-6xl mx-auto space-y-4">
        <div className="border-b hairline-rule pb-3">
          <p className="font-mono-data text-xs uppercase tracking-widest text-[#34E8A5]">
            QA Sandbox · PEAK Engine 4
          </p>
          <h1 className="font-serif-editorial text-2xl">Inverse Manifold &amp; Logarithm Expander</h1>
        </div>
        <LogarithmLab />
      </div>
    </div>
  );
}
