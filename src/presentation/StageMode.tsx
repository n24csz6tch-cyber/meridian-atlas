import { Suspense, lazy, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Pause, Play, SkipBack, SkipForward, X } from 'lucide-react';
import { MathTex } from '../components/MathTex';
import { COURSES } from '../data/curriculumGraph';
import { NeuralAtlasMap } from '../visuals/map/NeuralAtlasMap';
import { NeuralMathEngine } from '../visuals/neural/NeuralMathEngine';
import { ParabolaCanvas } from '../visuals/parabola/ParabolaCanvas';
import { UnitCircleWaveCanvas } from '../visuals/trig/UnitCircleWaveCanvas';
import { MathVortexCanvas } from '../visuals/vortex/MathVortexCanvas';
import {
  MAP_FLIGHT_KEYFRAMES,
  PARABOLA_KEYFRAMES,
  SOLIDS_KEYFRAMES,
  STAGE_ACTS,
} from './stageScript';

const LazySolidNetScene = lazy(() => import('../visuals/solids/SolidNetScene'));

interface StageModeProps {
  onExit: () => void;
}

const COURSE_SWEEP = [
  { id: 'algebra-1' as const, label: 'Algebra 1 · Warm Brass' },
  { id: 'geometry' as const, label: 'Geometry · Cartographic Cyan' },
  { id: 'algebra-2' as const, label: 'Algebra 2 · Oscilloscope Emerald' },
  { id: 'precalculus' as const, label: 'Precalculus · Solar Coral' },
];

export function StageMode({ onExit }: StageModeProps) {
  const [actIndex, setActIndex] = useState(0);
  // Quantized to 0.25s steps so React only updates at 4Hz while progress bar runs at 60fps via DOM ref
  const [elapsedTick, setElapsedTick] = useState(0);
  const [paused, setPaused] = useState(false);
  const [showIndex, setShowIndex] = useState(false);
  const [hudNotice, setHudNotice] = useState<string | null>(null);

  const elapsedRef = useRef(0);
  const progressBarRef = useRef<HTMLDivElement>(null);

  const act = STAGE_ACTS[actIndex];

  useEffect(() => {
    void import('../visuals/solids/SolidNetScene');
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  useEffect(() => {
    elapsedRef.current = 0;
    setElapsedTick(0);
    if (progressBarRef.current) {
      progressBarRef.current.style.width = '0%';
    }
  }, [actIndex]);

  useEffect(() => {
    if (paused) return;
    let last: number | null = null;
    let raf = 0;
    let lastQuant = Math.floor(elapsedRef.current * 4);

    const tick = (now: number) => {
      const dt = last === null ? 0 : Math.max(0, Math.min((now - last) / 1000, 0.1));
      last = now;
      elapsedRef.current += dt;

      if (elapsedRef.current >= act.durationSec) {
        elapsedRef.current = 0;
        setActIndex((idx) => (idx + 1) % STAGE_ACTS.length);
        return;
      }

      if (progressBarRef.current) {
        const pct = Math.min(100, (elapsedRef.current / act.durationSec) * 100);
        progressBarRef.current.style.width = `${pct}%`;
      }

      const quant = Math.floor(elapsedRef.current * 4);
      if (quant !== lastQuant) {
        lastQuant = quant;
        setElapsedTick(quant / 4);
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [paused, act.durationSec, actIndex]);

  const jumpToAct = (idx: number) => {
    const clamped = ((idx % STAGE_ACTS.length) + STAGE_ACTS.length) % STAGE_ACTS.length;
    elapsedRef.current = 0;
    setElapsedTick(0);
    setActIndex(clamped);
  };

  useEffect(() => {
    const flashNotice = (msg: string) => {
      setHudNotice(msg);
      window.setTimeout(() => setHudNotice((curr) => (curr === msg ? null : curr)), 1400);
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onExit();
      } else if (e.code === 'Space') {
        e.preventDefault();
        setPaused((p) => {
          const next = !p;
          flashNotice(next ? 'Paused' : 'Resumed');
          return next;
        });
      } else if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        e.preventDefault();
        elapsedRef.current = 0;
        setElapsedTick(0);
        setActIndex((idx) => (idx + 1) % STAGE_ACTS.length);
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        elapsedRef.current = 0;
        setElapsedTick(0);
        setActIndex((idx) => (idx - 1 + STAGE_ACTS.length) % STAGE_ACTS.length);
      } else if (e.key === 'i' || e.key === 'I') {
        e.preventDefault();
        setShowIndex((s) => !s);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onExit]);

  const sweepIndex = Math.max(0, Math.min(3, Math.floor((elapsedTick / act.durationSec) * 4)));
  void sweepIndex;

  const mapFrame = useMemo(() => {
    let chosen = MAP_FLIGHT_KEYFRAMES[0];
    for (const kf of MAP_FLIGHT_KEYFRAMES) {
      if (elapsedTick >= kf.atSec) chosen = kf;
    }
    return chosen;
  }, [elapsedTick]);

  const parabolaFrame = useMemo(() => {
    let chosen = PARABOLA_KEYFRAMES[0];
    for (const kf of PARABOLA_KEYFRAMES) {
      if (elapsedTick >= kf.atSec) chosen = kf;
    }
    return chosen;
  }, [elapsedTick]);

  const solidFrame = useMemo(() => {
    let chosen = SOLIDS_KEYFRAMES[0];
    for (const kf of SOLIDS_KEYFRAMES) {
      if (elapsedTick >= kf.atSec) chosen = kf;
    }
    const sliceAnim =
      chosen.sliceHeight !== null
        ? 0.25 + 0.55 * (0.5 + 0.5 * Math.sin((elapsedTick - 16.5) * 1.4))
        : null;
    return { ...chosen, sliceAnim };
  }, [elapsedTick]);

  const showNeuralPhase = actIndex === 4 && elapsedTick >= 10;
  const showClosingMeridian = actIndex === 5 && elapsedTick >= 10;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Meridian Stage Mode Presentation"
      className="fixed inset-0 z-50 bg-[#05070C] text-[#F2F0E8] flex flex-col justify-between select-none overflow-hidden"
    >
      {/* Top editorial header */}
      <div className="px-8 pt-6 pb-3 flex items-center justify-between gap-4 border-b border-[rgba(237,235,228,0.08)]">
        <div className="flex items-center gap-3">
          <span
            className="font-mono-data text-xs uppercase tracking-[0.22em] px-2.5 py-0.5 rounded border"
            style={{
              color: act.accent,
              borderColor: `${act.accent}55`,
              backgroundColor: `${act.accent}14`,
            }}
          >
            {act.number}
          </span>
          <h2 className="font-serif-editorial text-xl sm:text-2xl text-[#F2F0E8]">{act.title}</h2>
        </div>

        <div className="hidden md:flex items-center gap-4 font-mono-data text-[11px] text-[#707D94]">
          <span>{act.subtitle}</span>
        </div>
      </div>

      {/* Main Stage Viewport */}
      <div className="flex-1 relative px-6 sm:px-10 py-6 flex items-center justify-center overflow-hidden">
        <AnimatePresence mode="popLayout" initial={false}>
          {actIndex === 0 && (
            <motion.div
              key="act-overture"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.28 }}
              className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
            >
              <div className="lg:col-span-5 space-y-6">
                <p className="font-mono-data text-xs uppercase tracking-[0.25em] text-[#F4B956]">
                  MERIDIAN · OBSERVATORY PRESENTATION
                </p>
                <h1 className="font-serif-editorial text-5xl sm:text-6xl text-[#F2F0E8] leading-[1.06]">
                  See High School Mathematics Move.
                </h1>
                <p className="text-base text-[#A7B3C7] leading-relaxed">
                  A tactile nocturnal atlas spanning Algebra 1, Geometry, Algebra 2, and Precalculus
                  Honors — powered by live flow manifolds, neural matrices, and WebGL nets.
                </p>

                <div className="grid grid-cols-2 gap-2.5 pt-2">
                  {COURSE_SWEEP.map((item, idx) => {
                    const c = COURSES[item.id];
                    const active = idx === sweepIndex;
                    return (
                      <div
                        key={item.id}
                        className="p-3 rounded border transition-all duration-300"
                        style={{
                          backgroundColor: active ? `${c.accent}1E` : '#0C111C',
                          borderColor: active ? c.accent : 'rgba(237,235,228,0.1)',
                        }}
                      >
                        <span
                          className="font-mono-data text-xs block"
                          style={{ color: c.accent }}
                        >
                          {c.shortTitle} · {c.cpalmsCode}
                        </span>
                        <span className="font-serif-editorial text-lg text-[#F2F0E8]">
                          {c.title}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="lg:col-span-7">
                <MathVortexCanvas
                  lockedMode="vortex"
                  compact
                  interactive={false}
                  heightClass="h-[420px] sm:h-[460px]"
                />
              </div>
            </motion.div>
          )}

          {actIndex === 1 && (
            <motion.div
              key="act-map"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-6xl space-y-3"
            >
              <NeuralAtlasMap
                compact
                forcedSelectedId={mapFrame.selectedId}
                heightClass="h-[420px] sm:h-[460px]"
              />
              <div className="px-4 py-2.5 rounded-xl bg-[#090E18] border border-white/12 flex items-center justify-between gap-4">
                <span className="font-mono-data text-xs text-[#38D9FF]">
                  NEURAL CONSTELLATION FLIGHT · {mapFrame.selectedId.toUpperCase()}
                </span>
                <p className="text-sm text-[#F4F3EE]">{mapFrame.caption}</p>
              </div>
            </motion.div>
          )}

          {actIndex === 2 && (
            <motion.div
              key="act-parabola"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.45 }}
              className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-6 items-center"
            >
              <div className="lg:col-span-5 space-y-4">
                <span className="font-mono-data text-xs uppercase tracking-wider text-[#E5A94C]">
                  {parabolaFrame.badge}
                </span>
                <div className="instrument-frame p-5 bg-[#111620] border-[#E5A94C]/40 space-y-3">
                  <MathTex tex={parabolaFrame.tex} displayMode className="text-2xl text-[#EDEBE4]" />
                  <p className="text-sm text-[#9CA6B8] leading-relaxed">{parabolaFrame.note}</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {PARABOLA_KEYFRAMES.map((kf) => (
                    <div
                      key={kf.badge}
                      className="p-2.5 rounded border text-xs font-mono-data transition-colors"
                      style={{
                        borderColor:
                          kf.badge === parabolaFrame.badge ? '#E5A94C' : 'rgba(237,235,228,0.08)',
                        backgroundColor:
                          kf.badge === parabolaFrame.badge ? 'rgba(229,169,76,0.12)' : '#0D121A',
                        color: kf.badge === parabolaFrame.badge ? '#EDEBE4' : '#6C7689',
                      }}
                    >
                      {kf.badge.split('·')[0]}
                    </div>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-7">
                <ParabolaCanvas
                  a={parabolaFrame.a}
                  h={parabolaFrame.h}
                  k={parabolaFrame.k}
                  highlightFeature={parabolaFrame.highlight}
                  interactive={false}
                  showParentCurve
                  heightClass="h-[460px]"
                />
              </div>
            </motion.div>
          )}

          {actIndex === 3 && (
            <motion.div
              key="act-solids"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.45 }}
              className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-6 items-center"
            >
              <div className="lg:col-span-4 space-y-4">
                <span className="font-mono-data text-xs uppercase tracking-wider text-[#38BDF8]">
                  {solidFrame.badge}
                </span>
                <div className="instrument-frame p-5 bg-[#111620] border-[#38BDF8]/40 space-y-3">
                  <MathTex tex={solidFrame.tex} displayMode className="text-xl text-[#EDEBE4]" />
                  <p className="text-sm text-[#9CA6B8] leading-relaxed">{solidFrame.note}</p>
                </div>
              </div>

              <div className="lg:col-span-8 instrument-frame overflow-hidden">
                <Suspense
                  fallback={
                    <div className="h-[480px] flex items-center justify-center font-mono-data text-xs text-[#9CA6B8]">
                      Initializing 3D Pyramid Stage…
                    </div>
                  }
                >
                  <LazySolidNetScene
                    solid="square-pyramid"
                    width={2.8}
                    depth={2.8}
                    height={2.4}
                    unfold={solidFrame.unfold}
                    highlightPart={solidFrame.highlight}
                    showInternalTriangle={solidFrame.internalTriangle}
                    sliceHeight={solidFrame.sliceAnim}
                    autoOrbitSpeed={0.95}
                    heightClass="h-[480px]"
                    showControlsHint={false}
                  />
                </Suspense>
              </div>
            </motion.div>
          )}

          {actIndex === 4 && (
            <motion.div
              key="act-neural-wave"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.28 }}
              className="w-full max-w-6xl space-y-4"
            >
              {!showNeuralPhase ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between px-1">
                    <span className="font-mono-data text-xs uppercase tracking-wider text-[#FF785A]">
                      Phase A · Circular Rotation Unwrapped Into Sinusoidal Oscillation
                    </span>
                    <span className="font-mono-data text-[11px] text-[#A7B3C7]">
                      PC-01 · P(θ) = (cos θ, sin θ)
                    </span>
                  </div>
                  <UnitCircleWaveCanvas compact heightClass="h-[430px]" />
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between px-1">
                    <span className="font-mono-data text-xs uppercase tracking-wider text-[#38D4FF]">
                      Phase B · Layered Matrix Transformations Across 224 Weighted Synapses
                    </span>
                    <span className="font-mono-data text-[11px] text-[#34E8A5]">
                      A2-05 · a⁽ˡ⁾ = σ(W⁽ˡ⁾a⁽ˡ⁻¹⁾ + b⁽ˡ⁾)
                    </span>
                  </div>
                  <NeuralMathEngine compact heightClass="h-[430px]" />
                </div>
              )}
            </motion.div>
          )}

          {actIndex === 5 && (
            <motion.div
              key="act-finale"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.28 }}
              className="w-full max-w-6xl"
            >
              {!showClosingMeridian ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between px-1">
                    <span className="font-mono-data text-xs uppercase tracking-wider text-[#FF785A]">
                      Lorenz Strange Attractor · Dual Orbit Separation
                    </span>
                    <span className="font-mono-data text-[11px] text-[#F4B956]">
                      Δx₀ = 0.002 · Deterministic Chaos
                    </span>
                  </div>
                  <MathVortexCanvas
                    lockedMode="lorenz"
                    compact
                    interactive={false}
                    heightClass="h-[420px]"
                  />
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="max-w-3xl mx-auto text-center space-y-6 py-12"
                >
                  <p className="font-mono-data text-xs uppercase tracking-[0.28em] text-[#F4B956]">
                    MERIDIAN · LIVING ATLAS OF MATHEMATICS
                  </p>
                  <h2 className="font-serif-editorial text-5xl sm:text-6xl text-[#F2F0E8] leading-tight">
                    Intuition First. Rigor Always.
                  </h2>
                  <p className="text-base text-[#A7B3C7]">
                    Press <kbd className="px-2 py-0.5 rounded bg-[#121927] text-[#F2F0E8]">Esc</kbd>{' '}
                    to return to the interactive Atlas and explore live.
                  </p>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {hudNotice && (
          <div className="pointer-events-none absolute top-6 right-8 px-3 py-1.5 rounded bg-[#161D29]/90 border border-[rgba(237,235,228,0.18)] font-mono-data text-xs text-[#EDEBE4]">
            {hudNotice}
          </div>
        )}
      </div>

      {/* Discrete Bottom-Left Hover Hotzone + Hidden Mini-Index Drawer */}
      <div
        onMouseEnter={() => setShowIndex(true)}
        onMouseLeave={() => setShowIndex(false)}
        className="fixed bottom-0 left-0 z-50 w-16 h-16"
      >
        {showIndex && (
          <div className="fixed bottom-4 left-4 w-80 p-3 rounded bg-[#111620]/95 backdrop-blur-md border border-[rgba(237,235,228,0.18)] space-y-2 shadow-2xl">
            <div className="flex items-center justify-between pb-1.5 border-b hairline-rule">
              <span className="font-mono-data text-[10px] uppercase tracking-wider text-[#9CA6B8]">
                Stage Index (Space · ←/→ · I · Esc)
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => jumpToAct(actIndex - 1)}
                  aria-label="Previous act"
                  className="p-1 rounded hover:bg-[#1B2433]"
                >
                  <SkipBack className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setPaused((p) => !p)}
                  aria-label={paused ? 'Resume presentation' : 'Pause presentation'}
                  className="p-1 rounded hover:bg-[#1B2433]"
                >
                  {paused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
                </button>
                <button
                  type="button"
                  onClick={() => jumpToAct(actIndex + 1)}
                  aria-label="Next act"
                  className="p-1 rounded hover:bg-[#1B2433]"
                >
                  <SkipForward className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={onExit}
                  aria-label="Exit Stage Mode"
                  className="p-1 rounded hover:bg-[#1B2433] text-[#F9735B]"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="space-y-1">
              {STAGE_ACTS.map((item, idx) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => jumpToAct(idx)}
                  className="w-full text-left px-2.5 py-1.5 rounded text-xs flex items-center justify-between transition-colors"
                  style={{
                    backgroundColor: idx === actIndex ? '#1B2433' : 'transparent',
                    color: idx === actIndex ? item.accent : '#9CA6B8',
                  }}
                >
                  <span>
                    {item.number} · {item.title.split('·')[0]}
                  </span>
                  <span className="font-mono-data text-[10px]">{item.durationSec}s</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Ultra-subtle 2px Bottom Progress Hairline */}
      <div className="w-full h-[2px] bg-[rgba(237,235,228,0.08)]">
        <div
          ref={progressBarRef}
          className="h-full"
          style={{
            width: '0%',
            backgroundColor: act.accent,
            opacity: 0.78,
          }}
        />
      </div>
    </div>
  );
}

export default StageMode;
