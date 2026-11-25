import { Suspense, lazy, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  CheckCircle2,
  List,
  Maximize2,
  Minimize2,
  Pause,
  Play,
  SkipBack,
  SkipForward,
  X,
} from 'lucide-react';
import { MathTex } from '../components/MathTex';
import { COURSES } from '../data/curriculumGraph';
import { AlgebraicPipelineEngine } from '../visuals/drive/AlgebraicPipelineEngine';
import { ConfidenceRibbonField } from '../visuals/drive/ConfidenceRibbonField';
import { PolarHarmonicRingEngine } from '../visuals/drive/PolarHarmonicRingEngine';
import { DerivationStepVisual } from '../visuals/equations/LessonLayerVisuals';
import { CalabiYauManifold3D } from '../visuals/frontier/CalabiYauManifold3D';
import { OrbitalSignalTorus3D } from '../visuals/frontier/OrbitalSignalTorus3D';
import { GoldenHarmonicSpine } from '../visuals/harmony/GoldenHarmonicSpine';
import { FourierEpicyclesEngine } from '../visuals/kinetic/FourierEpicyclesEngine';
import { FormulaMorphEngine } from '../visuals/kinetic/FormulaMorphEngine';
import { PythagorasFluidProof } from '../visuals/kinetic/PythagorasFluidProof';
import { NeuralAtlasMap } from '../visuals/map/NeuralAtlasMap';
import { NeuralMathEngine } from '../visuals/neural/NeuralMathEngine';
import { ParabolaCanvas } from '../visuals/parabola/ParabolaCanvas';
import { UnitCircleWaveCanvas } from '../visuals/trig/UnitCircleWaveCanvas';
import { MathVortexCanvas } from '../visuals/vortex/MathVortexCanvas';
import {
  DRIVE_STAGE_NOTES,
  DriveStageActId,
  FRONTIER_KEYFRAMES,
  MAP_FLIGHT_KEYFRAMES,
  PARABOLA_KEYFRAMES,
  PROOF_KEYFRAMES,
  SOLIDS_KEYFRAMES,
  STAGE_ACTS,
  V3_STAGE_NOTES,
  V3StageActId,
} from './stageScript';

const LazySolidNetScene = lazy(() => import('../visuals/solids/SolidNetScene'));
const LazyTensorRiemann3D = lazy(() => import('../visuals/drive/TensorRiemann3D'));
const LazyLorenzAttractor3D = lazy(() => import('../visuals/cinema3d/LorenzAttractor3D'));
const LazyMatrixTransform3D = lazy(() => import('../visuals/cinema3d/MatrixTransform3D'));
const LazySurfaceRevolution3D = lazy(() => import('../visuals/cinema3d/SurfaceRevolution3D'));

interface StageModeProps {
  onExit: () => void;
}

const COURSE_SWEEP = [
  { id: 'algebra-1' as const, label: 'Algebra 1 · Solar Gold' },
  { id: 'geometry' as const, label: 'Geometry · Starlight Cyan' },
  { id: 'algebra-2' as const, label: 'Algebra 2 · Jade Signal' },
  { id: 'precalculus' as const, label: 'Precalculus · Amber-Coral' },
];

export function StageMode({ onExit }: StageModeProps) {
  const [actIndex, setActIndex] = useState(0);
  // Quantized to 0.25s steps so React only updates at 4Hz while progress bar runs at 60fps via DOM ref
  const [elapsedTick, setElapsedTick] = useState(0);
  const [paused, setPaused] = useState(false);
  const [showIndex, setShowIndex] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hudNotice, setHudNotice] = useState<string | null>(null);

  const elapsedRef = useRef(0);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const activePillRef = useRef<HTMLButtonElement | null>(null);

  const act = STAGE_ACTS[actIndex];

  const toggleFullscreen = useCallback(() => {
    if (typeof document === 'undefined') return;
    if (!document.fullscreenElement) {
      void document.documentElement.requestFullscreen?.().catch(() => {});
    } else {
      void document.exitFullscreen?.().catch(() => {});
    }
  }, []);

  useEffect(() => {
    void import('../visuals/solids/SolidNetScene');
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onFsChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', onFsChange);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener('fullscreenchange', onFsChange);
    };
  }, []);

  useEffect(() => {
    elapsedRef.current = 0;
    setElapsedTick(0);
    if (progressBarRef.current) {
      progressBarRef.current.style.width = '0%';
    }
    activePillRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
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

  const seekToSecond = (sec: number) => {
    elapsedRef.current = sec;
    setElapsedTick(sec);
    if (progressBarRef.current) {
      const pct = Math.min(100, (sec / act.durationSec) * 100);
      progressBarRef.current.style.width = `${pct}%`;
    }
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
      } else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        toggleFullscreen();
      } else if (e.key === 'Home') {
        e.preventDefault();
        elapsedRef.current = 0;
        setElapsedTick(0);
        setActIndex(0);
        flashNotice(STAGE_ACTS[0].number);
      } else if (e.key === 'End') {
        e.preventDefault();
        const lastIdx = STAGE_ACTS.length - 1;
        elapsedRef.current = 0;
        setElapsedTick(0);
        setActIndex(lastIdx);
        flashNotice(STAGE_ACTS[lastIdx].number);
      } else if (e.shiftKey && /^Digit[0-9]$/.test(e.code)) {
        const digit = Number(e.code.replace('Digit', ''));
        const offset = digit === 0 ? 9 : digit - 1;
        const idx = 10 + offset;
        if (idx >= 0 && idx < STAGE_ACTS.length) {
          e.preventDefault();
          elapsedRef.current = 0;
          setElapsedTick(0);
          setActIndex(idx);
          flashNotice(STAGE_ACTS[idx].number);
        }
      } else if (!e.shiftKey && e.key >= '1' && e.key <= '9') {
        const idx = Number(e.key) - 1;
        if (idx >= 0 && idx < STAGE_ACTS.length) {
          e.preventDefault();
          elapsedRef.current = 0;
          setElapsedTick(0);
          setActIndex(idx);
          flashNotice(STAGE_ACTS[idx].number);
        }
      } else if (!e.shiftKey && e.key === '0' && STAGE_ACTS.length >= 10) {
        e.preventDefault();
        elapsedRef.current = 0;
        setElapsedTick(0);
        setActIndex(9);
        flashNotice(STAGE_ACTS[9].number);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onExit, toggleFullscreen]);

  const sweepIndex = Math.max(0, Math.min(3, Math.floor((elapsedTick / act.durationSec) * 4)));

  const showConstellationPhase = act.id === 'harmonic-spine' && elapsedTick >= 10;
  const mapFrame = useMemo(() => {
    const relSec = showConstellationPhase ? Math.max(0, elapsedTick - 10) : 0;
    let chosen = MAP_FLIGHT_KEYFRAMES[0];
    for (const kf of MAP_FLIGHT_KEYFRAMES) {
      if (relSec >= kf.atSec) chosen = kf;
    }
    return chosen;
  }, [elapsedTick, showConstellationPhase]);

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

  const frontierFrame = useMemo(() => {
    let chosen = FRONTIER_KEYFRAMES[0];
    for (const kf of FRONTIER_KEYFRAMES) {
      if (elapsedTick >= kf.atSec) chosen = kf;
    }
    return chosen;
  }, [elapsedTick]);

  const proofFrame = useMemo(() => {
    let chosen = PROOF_KEYFRAMES[0];
    for (const kf of PROOF_KEYFRAMES) {
      if (elapsedTick >= kf.atSec) chosen = kf;
    }
    return chosen;
  }, [elapsedTick]);

  const showNeuralPhase = act.id === 'neural-wave' && elapsedTick >= 10;
  const showLiquidPythagoras = act.id === 'kinetic-proofs' && elapsedTick >= 11;
  const showClosingAurea = act.id === 'finale' && elapsedTick >= 10;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="AUREA Stage Mode Presentation"
      className="fixed inset-0 z-50 bg-[#060609] text-[#F7F4EC] flex flex-col justify-between select-none overflow-hidden"
    >
      {/* Top AUREA Editorial Header */}
      <div className="px-3 sm:px-8 pt-3 sm:pt-4 pb-2.5 sm:pb-3 flex items-center justify-between gap-3 border-b border-[rgba(244,196,108,0.16)] bg-[#0B0C12]/80">
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <span
            className="font-mono-data text-[11px] sm:text-xs uppercase tracking-[0.2em] px-2 sm:px-2.5 py-0.5 rounded border shrink-0"
            style={{
              color: act.accent,
              borderColor: `${act.accent}66`,
              backgroundColor: `${act.accent}18`,
            }}
          >
            {act.number}
          </span>
          <h2 className="font-serif-editorial text-lg sm:text-2xl text-[#F7F4EC] truncate">
            {act.title}
          </h2>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <span className="hidden lg:inline font-mono-data text-[11px] text-[#A8B2C6] max-w-md truncate">
            {act.subtitle}
          </span>
          <button
            type="button"
            onClick={onExit}
            aria-label="Close Stage Mode"
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono-data border border-[rgba(244,196,108,0.22)] bg-[#11131C] text-[#A8B2C6] hover:text-[#F7F4EC] hover:border-[#FF8563]/60 transition-colors"
          >
            <X className="w-3.5 h-3.5 text-[#FF8563]" />
            <span>Exit</span>
          </button>
        </div>
      </div>

      {/* Main Stage Viewport */}
      <div className="flex-1 relative px-3 sm:px-8 py-4 flex items-start lg:items-center justify-center overflow-y-auto overflow-x-hidden">
        <AnimatePresence mode="wait" initial={false}>
          {/* ACT I: OVERTURE WITH ORBITAL SIGNAL TORUS 3D */}
          {actIndex === 0 && (
            <motion.div
              key="act-overture"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.28 }}
              className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-7 items-center"
            >
              <div className="lg:col-span-5 space-y-5">
                <p className="font-mono-data text-xs uppercase tracking-[0.24em] text-[#F4C46C]">
                  AUREA · GOLDEN OBSERVATORY KEYNOTE
                </p>
                <h1 className="font-serif-editorial text-4xl sm:text-5xl lg:text-6xl text-[#F7F4EC] leading-[1.04]">
                  See Mathematics Move in{' '}
                  <em className="italic text-[#FFE29E]">3D Dimensions.</em>
                </h1>
                <p className="text-sm sm:text-base text-[#A8B2C6] leading-relaxed">
                  A complete four-year Florida B.E.S.T. mathematical observatory spanning Algebra 1,
                  Geometry, Algebra 2, and Precalculus Honors—powered by 60,000-particle 3D
                  manifolds, neural matrices, and String Theory geometry.
                </p>

                <div className="grid grid-cols-2 gap-2.5 pt-1">
                  {COURSE_SWEEP.map((item, idx) => {
                    const c = COURSES[item.id];
                    const active = idx === sweepIndex;
                    return (
                      <div
                        key={item.id}
                        className="p-3 rounded-xl border transition-all duration-300"
                        style={{
                          backgroundColor: active ? `${c.accent}1E` : '#0B0C12',
                          borderColor: active ? c.accent : 'rgba(244,196,108,0.16)',
                        }}
                      >
                        <span
                          className="font-mono-data text-[11px] block"
                          style={{ color: c.accent }}
                        >
                          {c.shortTitle} · {c.cpalmsCode}
                        </span>
                        <span className="font-serif-editorial text-lg text-[#F7F4EC]">
                          {c.title}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="lg:col-span-7">
                <OrbitalSignalTorus3D compact heightClass="h-[400px] sm:h-[450px]" />
              </div>
            </motion.div>
          )}

          {/* ACT II: GOLDEN HARMONIC SPINE + CONSTELLATION ATLAS */}
          {actIndex === 1 && (
            <motion.div
              key="act-harmonic-spine"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.28 }}
              className="w-full max-w-6xl space-y-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 px-1">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => seekToSecond(0)}
                    className={`px-3 py-1 rounded-full font-mono-data text-[11px] border transition-all ${
                      !showConstellationPhase
                        ? 'bg-[#F4C46C] text-[#060609] border-[#FFE29E] font-semibold'
                        : 'bg-[#0B0C12] text-[#A8B2C6] border-[rgba(244,196,108,0.18)]'
                    }`}
                  >
                    Phase A · Golden Harmonic Spine (24 Strands)
                  </button>
                  <button
                    type="button"
                    onClick={() => seekToSecond(10)}
                    className={`px-3 py-1 rounded-full font-mono-data text-[11px] border transition-all ${
                      showConstellationPhase
                        ? 'bg-[#46D6E8] text-[#060609] border-[#46D6E8] font-semibold'
                        : 'bg-[#0B0C12] text-[#A8B2C6] border-[rgba(244,196,108,0.18)]'
                    }`}
                  >
                    Phase B · 36-Node Prerequisite Flight
                  </button>
                </div>
                <span className="font-mono-data text-[11px] text-[#FFE29E]">
                  {!showConstellationPhase
                    ? 'High School Foundations ⇄ Physics & String Theory'
                    : mapFrame.selectedId.toUpperCase()}
                </span>
              </div>

              {!showConstellationPhase ? (
                <GoldenHarmonicSpine compact heightClass="h-[400px] sm:h-[440px]" />
              ) : (
                <div className="space-y-2.5">
                  <NeuralAtlasMap
                    compact
                    forcedSelectedId={mapFrame.selectedId}
                    heightClass="h-[390px] sm:h-[420px]"
                  />
                  <div className="px-4 py-2.5 rounded-xl bg-[#0B0C12] border border-[rgba(244,196,108,0.2)] flex flex-wrap items-center justify-between gap-3">
                    <span className="font-mono-data text-xs text-[#46D6E8]">
                      CONSTELLATION FLIGHT · {mapFrame.selectedId.toUpperCase()}
                    </span>
                    <p className="text-xs sm:text-sm text-[#F7F4EC]">{mapFrame.caption}</p>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* ACT III: ALGEBRA IN MOTION · PARABOLA */}
          {actIndex === 2 && (
            <motion.div
              key="act-parabola"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35 }}
              className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-6 items-center"
            >
              <div className="lg:col-span-5 space-y-4">
                <span className="font-mono-data text-xs uppercase tracking-wider text-[#F5C25B]">
                  {parabolaFrame.badge}
                </span>
                <div className="instrument-frame p-5 border-[#F5C25B]/40 space-y-3">
                  <MathTex tex={parabolaFrame.tex} displayMode className="text-2xl text-[#F7F4EC]" />
                  <p className="text-sm text-[#A8B2C6] leading-relaxed">{parabolaFrame.note}</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {PARABOLA_KEYFRAMES.map((kf) => (
                    <button
                      key={kf.badge}
                      type="button"
                      onClick={() => seekToSecond(kf.atSec)}
                      className="p-2.5 rounded-lg border text-left text-xs font-mono-data transition-colors"
                      style={{
                        borderColor:
                          kf.badge === parabolaFrame.badge ? '#F5C25B' : 'rgba(244,196,108,0.14)',
                        backgroundColor:
                          kf.badge === parabolaFrame.badge ? 'rgba(245,194,91,0.14)' : '#0B0C12',
                        color: kf.badge === parabolaFrame.badge ? '#F7F4EC' : '#727D94',
                      }}
                    >
                      {kf.badge.split('·')[0]}
                    </button>
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
                  heightClass="h-[440px]"
                />
              </div>
            </motion.div>
          )}

          {/* ACT IV: GEOMETRY UNFOLDED · 3D SOLIDS */}
          {actIndex === 3 && (
            <motion.div
              key="act-solids"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35 }}
              className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-6 items-center"
            >
              <div className="lg:col-span-4 space-y-4">
                <span className="font-mono-data text-xs uppercase tracking-wider text-[#46D6E8]">
                  {solidFrame.badge}
                </span>
                <div className="instrument-frame p-5 border-[#46D6E8]/40 space-y-3">
                  <MathTex tex={solidFrame.tex} displayMode className="text-xl text-[#F7F4EC]" />
                  <p className="text-sm text-[#A8B2C6] leading-relaxed">{solidFrame.note}</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {SOLIDS_KEYFRAMES.map((kf) => (
                    <button
                      key={kf.badge}
                      type="button"
                      onClick={() => seekToSecond(kf.atSec)}
                      className="p-2 rounded-lg border text-left text-[11px] font-mono-data transition-colors"
                      style={{
                        borderColor:
                          kf.badge === solidFrame.badge ? '#46D6E8' : 'rgba(244,196,108,0.14)',
                        backgroundColor:
                          kf.badge === solidFrame.badge ? 'rgba(70,214,232,0.14)' : '#0B0C12',
                        color: kf.badge === solidFrame.badge ? '#F7F4EC' : '#727D94',
                      }}
                    >
                      {kf.badge.split('·')[0]}
                    </button>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-8 instrument-frame overflow-hidden">
                <Suspense
                  fallback={
                    <div className="h-[460px] flex items-center justify-center font-mono-data text-xs text-[#A8B2C6]">
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
                    heightClass="h-[460px]"
                    showControlsHint={false}
                  />
                </Suspense>
              </div>
            </motion.div>
          )}

          {/* ACT V: HARMONIC WAVES & NEURAL MATRIX */}
          {actIndex === 4 && (
            <motion.div
              key="act-neural-wave"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.28 }}
              className="w-full max-w-6xl space-y-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 px-1">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => seekToSecond(0)}
                    className={`px-3 py-1 rounded-full font-mono-data text-[11px] border transition-all ${
                      !showNeuralPhase
                        ? 'bg-[#FF8563] text-[#060609] border-[#FF8563] font-semibold'
                        : 'bg-[#0B0C12] text-[#A8B2C6] border-[rgba(244,196,108,0.18)]'
                    }`}
                  >
                    Phase A · Unit Circle Waves
                  </button>
                  <button
                    type="button"
                    onClick={() => seekToSecond(10)}
                    className={`px-3 py-1 rounded-full font-mono-data text-[11px] border transition-all ${
                      showNeuralPhase
                        ? 'bg-[#45E6A6] text-[#060609] border-[#45E6A6] font-semibold'
                        : 'bg-[#0B0C12] text-[#A8B2C6] border-[rgba(244,196,108,0.18)]'
                    }`}
                  >
                    Phase B · Neural Matrix Engine
                  </button>
                </div>
                <span className="font-mono-data text-[11px] text-[#FFE29E]">
                  {!showNeuralPhase
                    ? 'PC-01 · P(θ) = (cos θ, sin θ)'
                    : 'A2-07 · a⁽ˡ⁾ = σ(W⁽ˡ⁾a⁽ˡ⁻¹⁾ + b⁽ˡ⁾)'}
                </span>
              </div>

              {!showNeuralPhase ? (
                <UnitCircleWaveCanvas compact heightClass="h-[420px]" />
              ) : (
                <NeuralMathEngine compact heightClass="h-[420px]" />
              )}
            </motion.div>
          )}

          {/* ACT VI: STRING THEORY & CALABI-YAU MANIFOLDS 3D */}
          {actIndex === 5 && (
            <motion.div
              key="act-string-calabi-yau"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-6 items-center"
            >
              <div className="lg:col-span-5 space-y-4">
                <div className="space-y-1">
                  <span className="font-mono-data text-[11px] uppercase tracking-[0.2em] text-[#F4C46C] block">
                    {frontierFrame.badge}
                  </span>
                  <span className="font-mono-data text-[11px] text-[#46D6E8] block">
                    {frontierFrame.courseBridge}
                  </span>
                </div>

                <div className="instrument-frame p-5 border-[#F4C46C]/45 space-y-3">
                  <div className="overflow-x-auto">
                    <MathTex tex={frontierFrame.tex} displayMode className="text-lg text-[#FFE29E]" />
                  </div>
                  <p className="text-xs sm:text-sm text-[#A8B2C6] leading-relaxed">
                    {frontierFrame.note}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {FRONTIER_KEYFRAMES.map((kf) => (
                    <button
                      key={kf.badge}
                      type="button"
                      onClick={() => seekToSecond(kf.atSec)}
                      className="p-2.5 rounded-xl border text-left text-[11px] font-mono-data transition-all"
                      style={{
                        borderColor:
                          kf.badge === frontierFrame.badge ? '#F4C46C' : 'rgba(244,196,108,0.16)',
                        backgroundColor:
                          kf.badge === frontierFrame.badge ? 'rgba(244,196,108,0.14)' : '#0B0C12',
                        color: kf.badge === frontierFrame.badge ? '#FFE29E' : '#727D94',
                      }}
                    >
                      {kf.badge}
                    </button>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-7">
                <CalabiYauManifold3D compact heightClass="h-[410px] sm:h-[450px]" />
              </div>
            </motion.div>
          )}

          {/* ACT VII: ANIMATED PROOFS & WORKED SOLUTIONS */}
          {actIndex === 6 && (
            <motion.div
              key="act-animated-proofs"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-6 items-center"
            >
              <div className="lg:col-span-6 space-y-3">
                <span className="font-mono-data text-xs uppercase tracking-wider text-[#45E6A6]">
                  Synchronized Derivation &amp; Worked Solutions
                </span>
                <div className="space-y-2">
                  {PROOF_KEYFRAMES.map((kf, idx) => {
                    const active = idx === proofFrame.stepIdx;
                    const unlocked = idx <= proofFrame.stepIdx;
                    return (
                      <button
                        key={kf.stage}
                        type="button"
                        onClick={() => seekToSecond(kf.atSec)}
                        className="w-full text-left p-3.5 rounded-xl border transition-all"
                        style={{
                          backgroundColor: active ? 'rgba(69, 230, 166, 0.12)' : '#0B0C12',
                          borderColor: active
                            ? '#45E6A6'
                            : unlocked
                              ? 'rgba(69, 230, 166, 0.32)'
                              : 'rgba(244, 196, 108, 0.14)',
                          opacity: unlocked ? 1 : 0.55,
                        }}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-mono-data text-[11px] text-[#45E6A6]">{kf.stage}</span>
                          {unlocked && <CheckCircle2 className="w-3.5 h-3.5 text-[#45E6A6]" />}
                        </div>
                        <div className="overflow-x-auto pt-1">
                          <MathTex tex={kf.tex} className="text-xs text-[#F7F4EC]" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="lg:col-span-6 space-y-4">
                <div className="instrument-frame p-4 border-[#45E6A6]/35">
                  <DerivationStepVisual
                    visualKinds={PROOF_KEYFRAMES.map((k) => k.eqVisual)}
                    stepIndex={proofFrame.stepIdx}
                    totalSteps={PROOF_KEYFRAMES.length}
                    stepTitle={proofFrame.stage}
                    accent="#45E6A6"
                  />
                </div>
                <div className="instrument-frame p-4 border-[#F4C46C]/40 space-y-1.5">
                  <span className="font-mono-data text-[10px] uppercase tracking-wider text-[#F4C46C]">
                    {proofFrame.solvedBadge}
                  </span>
                  <div className="overflow-x-auto">
                    <MathTex tex={proofFrame.solvedTex} displayMode className="text-[#F7F4EC]" />
                  </div>
                  <p className="text-xs text-[#A8B2C6] leading-relaxed">{proofFrame.note}</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* ACT VIII–XI: DRIVE MATHEMATICAL ENGINES SHOWCASE */}
          {(act.id === 'algebraic-pipeline' ||
            act.id === 'polar-harmonic' ||
            act.id === 'confidence-ribbon' ||
            act.id === 'tensor-riemann') && (() => {
            const driveId = act.id as DriveStageActId;
            const note = DRIVE_STAGE_NOTES[driveId];
            return (
              <motion.div
                key={`act-${driveId}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.28 }}
                className="my-auto w-full max-w-6xl min-w-0 space-y-3"
              >
                <div
                  className="aurea-glass-card px-4 py-3 flex flex-col lg:flex-row lg:items-center justify-between gap-3 min-w-0"
                  style={{ borderLeft: `3px solid ${act.accent}` }}
                >
                  <div className="space-y-1 min-w-0">
                    <span
                      className="font-mono-data text-[10.5px] uppercase tracking-[0.18em] block"
                      style={{ color: act.accent }}
                    >
                      {note.courseBridge}
                    </span>
                    <p className="text-xs sm:text-sm text-[#A8B2C6] leading-relaxed">
                      {note.takeaway}
                    </p>
                  </div>
                  <div className="rounded-xl bg-[#060609]/95 border border-[#F4C46C]/22 px-3 py-2 overflow-x-auto max-w-full shrink-0">
                    <MathTex tex={note.tex} className="text-xs sm:text-sm text-[#FFE29E]" />
                  </div>
                </div>

                <div className="min-w-0">
                  {driveId === 'algebraic-pipeline' && (
                    <AlgebraicPipelineEngine heightClass="h-[165px] sm:h-[195px]" />
                  )}
                  {driveId === 'polar-harmonic' && (
                    <PolarHarmonicRingEngine heightClass="h-[270px] sm:h-[345px]" />
                  )}
                  {driveId === 'confidence-ribbon' && (
                    <ConfidenceRibbonField heightClass="h-[265px] sm:h-[335px]" />
                  )}
                  {driveId === 'tensor-riemann' && (
                    <Suspense
                      fallback={
                        <div className="instrument-frame h-[340px] flex items-center justify-center font-mono-data text-xs text-[#A8B2C6]">
                          Initializing 3D Tensor &amp; Riemann Manifold…
                        </div>
                      }
                    >
                      <LazyTensorRiemann3D heightClass="h-[280px] sm:h-[355px]" />
                    </Suspense>
                  )}
                </div>
              </motion.div>
            );
          })()}

          {/* ACT XII–XV: V3 KINETIC & 3D SHADER SHOWCASE */}
          {(act.id === 'fourier-epicycles' ||
            act.id === 'lorenz-chaos-3d' ||
            act.id === 'matrix-transform-3d' ||
            act.id === 'surface-revolution-3d') && (() => {
            const v3Id = act.id as V3StageActId;
            const note = V3_STAGE_NOTES[v3Id];
            return (
              <motion.div
                key={`act-${v3Id}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.28 }}
                className="my-auto w-full max-w-6xl min-w-0 space-y-3"
              >
                <div
                  className="aurea-glass-card px-4 py-3 flex flex-col lg:flex-row lg:items-center justify-between gap-3 min-w-0"
                  style={{ borderLeft: `3px solid ${act.accent}` }}
                >
                  <div className="space-y-1 min-w-0">
                    <span
                      className="font-mono-data text-[10.5px] uppercase tracking-[0.18em] block"
                      style={{ color: act.accent }}
                    >
                      {note.courseBridge}
                    </span>
                    <p className="text-xs sm:text-sm text-[#A8B2C6] leading-relaxed">
                      {note.takeaway}
                    </p>
                  </div>
                  <div className="rounded-xl bg-[#060609]/95 border border-[#F4C46C]/22 px-3 py-2 overflow-x-auto max-w-full shrink-0">
                    <MathTex tex={note.tex} className="text-xs sm:text-sm text-[#FFE29E]" />
                  </div>
                </div>

                <div className="min-w-0">
                  {v3Id === 'fourier-epicycles' && (
                    <FourierEpicyclesEngine compact heightClass="h-[270px] sm:h-[345px]" />
                  )}
                  {v3Id === 'lorenz-chaos-3d' && (
                    <Suspense
                      fallback={
                        <div className="instrument-frame h-[340px] flex items-center justify-center font-mono-data text-xs text-[#A8B2C6]">
                          Initializing 3D Lorenz Chaos Butterfly…
                        </div>
                      }
                    >
                      <LazyLorenzAttractor3D compact heightClass="h-[270px] sm:h-[345px]" />
                    </Suspense>
                  )}
                  {v3Id === 'matrix-transform-3d' && (
                    <Suspense
                      fallback={
                        <div className="instrument-frame h-[340px] flex items-center justify-center font-mono-data text-xs text-[#A8B2C6]">
                          Initializing 3D Matrix Space Warp…
                        </div>
                      }
                    >
                      <LazyMatrixTransform3D compact heightClass="h-[270px] sm:h-[345px]" />
                    </Suspense>
                  )}
                  {v3Id === 'surface-revolution-3d' && (
                    <Suspense
                      fallback={
                        <div className="instrument-frame h-[340px] flex items-center justify-center font-mono-data text-xs text-[#A8B2C6]">
                          Initializing 360° Solid of Revolution…
                        </div>
                      }
                    >
                      <LazySurfaceRevolution3D compact heightClass="h-[270px] sm:h-[345px]" />
                    </Suspense>
                  )}
                </div>
              </motion.div>
            );
          })()}

          {/* ACT XVI: KINETIC FORMULA MORPH & LIQUID PYTHAGORAS */}
          {act.id === 'kinetic-proofs' && (
            <motion.div
              key="act-kinetic-proofs"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.28 }}
              className="my-auto w-full max-w-6xl min-w-0 space-y-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 px-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => seekToSecond(0)}
                    className={`px-3 py-1 rounded-full font-mono-data text-[11px] border transition-all ${
                      !showLiquidPythagoras
                        ? 'bg-[#F4C46C] text-[#060609] border-[#FFE29E] font-semibold'
                        : 'bg-[#0B0C12] text-[#A8B2C6] border-[rgba(244,196,108,0.18)]'
                    }`}
                  >
                    Phase A · Kinetic Formula Morph
                  </button>
                  <button
                    type="button"
                    onClick={() => seekToSecond(11)}
                    className={`px-3 py-1 rounded-full font-mono-data text-[11px] border transition-all ${
                      showLiquidPythagoras
                        ? 'bg-[#45E6A6] text-[#060609] border-[#45E6A6] font-semibold'
                        : 'bg-[#0B0C12] text-[#A8B2C6] border-[rgba(244,196,108,0.18)]'
                    }`}
                  >
                    Phase B · Liquid Pythagoras Proof
                  </button>
                </div>

                <div className="overflow-x-auto max-w-full">
                  <MathTex
                    tex={
                      !showLiquidPythagoras
                        ? 'ax^2 + bx + c = 0 \\;\\Longrightarrow\\; x = \\dfrac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}'
                        : 'a^2 + b^2 = c^2'
                    }
                    className="text-xs text-[#FFE29E]"
                  />
                </div>
              </div>

              <div className="min-w-0">
                {!showLiquidPythagoras ? (
                  <FormulaMorphEngine compact initialPreset="quadratic" />
                ) : (
                  <PythagorasFluidProof compact heightClass="h-[270px] sm:h-[345px]" />
                )}
              </div>
            </motion.div>
          )}

          {/* ACT XVII: LORENZ CHAOS FINALE & CLOSING AUREA */}
          {act.id === 'finale' && (
            <motion.div
              key="act-finale"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.28 }}
              className="my-auto w-full max-w-6xl min-w-0"
            >
              {!showClosingAurea ? (
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 px-1">
                    <span className="font-mono-data text-xs uppercase tracking-wider text-[#FF8563]">
                      Lorenz Strange Attractor · Dual Orbit Separation
                    </span>
                    <span className="font-mono-data text-[11px] text-[#FFE29E]">
                      Δx₀ = 0.002 · Deterministic Chaos
                    </span>
                  </div>
                  <MathVortexCanvas
                    lockedMode="lorenz"
                    compact
                    interactive={false}
                    heightClass="h-[340px] sm:h-[420px]"
                  />
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="max-w-3xl mx-auto text-center space-y-6 py-12"
                >
                  <p className="font-mono-data text-xs uppercase tracking-[0.28em] text-[#F4C46C]">
                    AUREA · LIVING 3D ATLAS OF MATHEMATICS
                  </p>
                  <h2 className="font-serif-editorial text-5xl sm:text-6xl text-[#F7F4EC] leading-tight">
                    Intuition First.{' '}
                    <em className="italic text-[#FFE29E]">Rigor Always.</em>
                  </h2>
                  <p className="text-base text-[#A8B2C6]">
                    Press{' '}
                    <kbd className="px-2 py-0.5 rounded bg-[#11131C] border border-[#F4C46C]/30 text-[#FFE29E]">
                      Esc
                    </kbd>{' '}
                    to return to the AUREA Observatory and explore 3D String Theory, the Florida
                    B.E.S.T. book, and all 36 live lessons.
                  </p>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {hudNotice && (
          <div className="pointer-events-none absolute top-6 right-8 px-3 py-1.5 rounded-lg bg-[#11131C]/95 border border-[rgba(244,196,108,0.3)] font-mono-data text-xs text-[#FFE29E]">
            {hudNotice}
          </div>
        )}
      </div>

      {/* Crisp Always-Accessible Bottom Control Dock */}
      <div className="px-3 sm:px-8 pb-3 pt-2 border-t border-[rgba(244,196,108,0.16)] bg-[#060609]/95 backdrop-blur-md flex flex-wrap items-center justify-between gap-2 sm:gap-3 min-w-0 max-w-full">
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => jumpToAct(actIndex - 1)}
            aria-label="Previous act"
            className="p-2 rounded-lg border border-[rgba(244,196,108,0.18)] bg-[#0B0C12] text-[#A8B2C6] hover:text-[#F7F4EC] hover:border-[#F4C46C]/45 transition-colors"
            title="Previous Act (←)"
          >
            <SkipBack className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setPaused((p) => !p)}
            aria-label={paused ? 'Resume presentation' : 'Pause presentation'}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[rgba(244,196,108,0.28)] bg-[#0B0C12] text-xs font-mono-data text-[#FFE29E] hover:border-[#F4C46C]/60 transition-colors"
            title="Play / Pause (Space)"
          >
            {paused ? <Play className="w-3.5 h-3.5 text-[#45E6A6]" /> : <Pause className="w-3.5 h-3.5 text-[#F4C46C]" />}
            <span>{paused ? 'Play' : 'Pause'}</span>
          </button>
          <button
            type="button"
            onClick={() => jumpToAct(actIndex + 1)}
            aria-label="Next act"
            className="p-2 rounded-lg border border-[rgba(244,196,108,0.18)] bg-[#0B0C12] text-[#A8B2C6] hover:text-[#F7F4EC] hover:border-[#F4C46C]/45 transition-colors"
            title="Next Act (→)"
          >
            <SkipForward className="w-3.5 h-3.5" />
          </button>
          <span className="ml-1 sm:ml-2 font-mono-data text-[11px] text-[#727D94]">
            {String(Math.floor(elapsedTick)).padStart(2, '0')}s / {act.durationSec}s
          </span>
        </div>

        {/* Act Selector Pills (I - XVII, touch-scrollable on narrow mobile so 0px horizontal overflow) */}
        <div
          className="order-3 lg:order-none w-full lg:w-auto lg:max-w-[54%] xl:max-w-none flex items-center lg:flex-wrap gap-1 overflow-x-auto lg:overflow-visible no-scrollbar py-0.5 min-w-0"
          role="tablist"
          aria-label="Presentation acts"
        >
          {STAGE_ACTS.map((item, idx) => {
            const active = idx === actIndex;
            const numeral = item.number.replace('ACT ', '');
            const keyHint =
              idx < 9
                ? `Key ${idx + 1}`
                : idx === 9
                  ? 'Key 0'
                  : `Shift+${idx - 9}`;
            return (
              <button
                key={item.id}
                ref={active ? activePillRef : undefined}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => jumpToAct(idx)}
                title={`${item.number}: ${item.title} (${keyHint})`}
                className="px-2 py-1 rounded-full font-mono-data text-[10.5px] sm:text-[11px] border transition-all shrink-0"
                style={{
                  borderColor: active ? item.accent : 'rgba(244,196,108,0.18)',
                  backgroundColor: active ? `${item.accent}26` : '#0B0C12',
                  color: active ? item.accent : '#A8B2C6',
                }}
              >
                {numeral}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setShowIndex((s) => !s)}
            aria-label="Toggle act index drawer"
            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-mono-data transition-colors ${
              showIndex
                ? 'border-[#F4C46C]/60 bg-[#F4C46C]/15 text-[#FFE29E]'
                : 'border-[rgba(244,196,108,0.18)] bg-[#0B0C12] text-[#A8B2C6] hover:text-[#F7F4EC]'
            }`}
            title="Act Index (I)"
          >
            <List className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Index</span>
          </button>

          <button
            type="button"
            onClick={toggleFullscreen}
            aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-[rgba(244,196,108,0.18)] bg-[#0B0C12] text-xs font-mono-data text-[#A8B2C6] hover:text-[#F7F4EC] transition-colors"
            title="Fullscreen (F)"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{isFullscreen ? 'Window' : 'Fullscreen'}</span>
          </button>

          <button
            type="button"
            onClick={onExit}
            aria-label="Exit presentation mode"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#FF8563]/45 bg-[#FF8563]/15 text-xs font-mono-data text-[#FF8563] hover:bg-[#FF8563]/25 transition-colors"
            title="Exit Stage Mode (Esc)"
          >
            <X className="w-3.5 h-3.5" />
            <span>Exit (Esc)</span>
          </button>
        </div>
      </div>

      {/* Toggleable Mini-Index Drawer */}
      {showIndex && (
        <div className="fixed bottom-24 sm:bottom-20 right-4 sm:right-8 z-50 w-80 max-w-[calc(100vw-2rem)] max-h-[68vh] overflow-y-auto p-3 rounded-xl bg-[#0B0C12]/95 backdrop-blur-md border border-[rgba(244,196,108,0.28)] space-y-2 shadow-2xl">
          <div className="flex items-center justify-between pb-1.5 border-b border-[rgba(244,196,108,0.16)] gap-2">
            <span className="font-mono-data text-[10px] uppercase tracking-wider text-[#F4C46C] truncate">
              {STAGE_ACTS.length} Acts (1–0 · ⇧1–7 · ←/→ · Esc)
            </span>
            <button
              type="button"
              onClick={() => setShowIndex(false)}
              aria-label="Close index drawer"
              className="p-1 rounded hover:bg-[#171A26] text-[#A8B2C6] shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-1">
            {STAGE_ACTS.map((item, idx) => {
              const shortcut =
                idx < 9 ? `${idx + 1}` : idx === 9 ? '0' : `⇧${idx - 9}`;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    jumpToAct(idx);
                    setShowIndex(false);
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded text-xs flex items-center justify-between gap-2 transition-colors"
                  style={{
                    backgroundColor: idx === actIndex ? '#171A26' : 'transparent',
                    color: idx === actIndex ? item.accent : '#A8B2C6',
                  }}
                >
                  <span className="truncate pr-1">
                    {item.number} · {item.title.split('·')[0]}
                  </span>
                  <span className="flex items-center gap-1.5 font-mono-data text-[10px] shrink-0">
                    <kbd className="px-1.5 py-0.5 rounded bg-[#060609] border border-[rgba(244,196,108,0.18)] text-[#727D94]">
                      {shortcut}
                    </kbd>
                    <span>{item.durationSec}s</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Ultra-subtle 2px Bottom Progress Hairline */}
      <div className="w-full h-[2px] bg-[rgba(244,196,108,0.1)]">
        <div
          ref={progressBarRef}
          className="h-full"
          style={{
            width: '0%',
            backgroundColor: act.accent,
            opacity: 0.85,
          }}
        />
      </div>
    </div>
  );
}

export default StageMode;
