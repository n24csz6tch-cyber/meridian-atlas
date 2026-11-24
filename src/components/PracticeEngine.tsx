import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  HelpCircle,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
  Trophy,
  XCircle,
  Zap,
} from 'lucide-react';
import { MathTex } from './MathTex';
import { EquationMiniVisual, EquationVisualKind } from '../visuals/equations/EquationMiniVisual';

export interface SolutionStep {
  label: string;
  tex?: string;
  note: string;
}

export interface PracticeQuestion {
  id: string;
  prompt: string;
  promptTex?: string;
  type: 'multiple-choice' | 'numeric';
  options?: { id: string; label: string; tex?: string }[];
  correctAnswer: string | number;
  tolerance?: number;
  unitLabel?: string;
  hint: string;
  solutionSteps: SolutionStep[];
  visualKind?: EquationVisualKind;
}

interface PracticeEngineProps {
  questions: PracticeQuestion[];
  accentColor: string;
  visualKinds?: EquationVisualKind[];
}

interface NormalizedStage {
  label: string;
  tex?: string;
  resultText?: string;
  note: string;
  isFinal?: boolean;
}

function AnimatedWorkedSolution({
  question,
  accentColor,
  resolvedVisual,
}: {
  question: PracticeQuestion;
  accentColor: string;
  resolvedVisual?: EquationVisualKind;
}) {
  const reducedMotion = useReducedMotion();

  const stages = useMemo<NormalizedStage[]>(() => {
    const base: NormalizedStage[] = [];
    if (question.solutionSteps.length === 1 && question.promptTex) {
      base.push({
        label: 'Given Problem Setup',
        tex: question.promptTex,
        note: question.prompt,
      });
    }
    for (const st of question.solutionSteps) {
      base.push({
        label: st.label,
        tex: st.tex,
        note: st.note,
      });
    }

    if (question.type === 'multiple-choice') {
      const matched = question.options?.find((o) => o.id === String(question.correctAnswer));
      base.push({
        label: 'Verified Result',
        tex: matched?.tex,
        resultText: matched?.tex
          ? undefined
          : `Option ${String(question.correctAnswer).toUpperCase()} — ${matched?.label ?? question.correctAnswer}`,
        note: 'Exact solution confirmed against domain and geometric invariants.',
        isFinal: true,
      });
    } else {
      const safeUnit = question.unitLabel ? `\\;\\text{${question.unitLabel}}` : '';
      base.push({
        label: 'Verified Result',
        tex: `\\text{Answer} = ${question.correctAnswer}${safeUnit}`,
        note: 'Verified numerical evaluation.',
        isFinal: true,
      });
    }
    return base;
  }, [question]);

  const totalStages = stages.length;
  const [visibleCount, setVisibleCount] = useState<number>(() => (reducedMotion ? totalStages : 1));
  const [playing, setPlaying] = useState<boolean>(() => !reducedMotion && totalStages > 1);

  useEffect(() => {
    if (!playing) return;
    if (visibleCount >= totalStages) {
      setPlaying(false);
      return;
    }
    const timer = window.setTimeout(() => {
      setVisibleCount((prev) => Math.min(totalStages, prev + 1));
    }, 1450);
    return () => window.clearTimeout(timer);
  }, [playing, visibleCount, totalStages]);

  const activeIdx = Math.min(visibleCount, totalStages) - 1;
  const progressRatio = totalStages > 0 ? Math.min(1, visibleCount / totalStages) : 1;

  const handleReplay = () => {
    setVisibleCount(1);
    setPlaying(true);
  };

  return (
    <motion.div
      initial={reducedMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reducedMotion ? undefined : { opacity: 0, y: -6 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      className="p-4 sm:p-5 rounded-2xl bg-[#0B0C12] border border-[#F4C46C]/25 space-y-4 overflow-hidden shadow-[inset_0_1px_0_rgba(255,234,186,0.1)]"
    >
      {/* Header + Playback Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b hairline-rule">
        <div className="flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-[#45E6A6]" />
          <p className="font-mono-data text-[10.5px] uppercase tracking-wider text-[#45E6A6]">
            Worked Solution Timeline · Stage {Math.min(visibleCount, totalStages)}/{totalStages}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 font-mono-data text-[10.5px]">
          <button
            type="button"
            onClick={() => {
              if (visibleCount >= totalStages) {
                setVisibleCount(1);
                setPlaying(true);
              } else {
                setPlaying((p) => !p);
              }
            }}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full border transition-colors"
            style={{
              borderColor: playing ? accentColor : 'rgba(244, 196, 108, 0.22)',
              backgroundColor: playing ? `${accentColor}1E` : 'rgba(255, 255, 255, 0.03)',
              color: playing ? accentColor : '#F7F4EC',
            }}
          >
            {playing ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
            <span>{playing ? 'Pause' : visibleCount >= totalStages ? 'Replay Auto' : 'Play'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setPlaying(false);
              setVisibleCount((v) => Math.max(1, v - 1));
            }}
            disabled={visibleCount <= 1}
            aria-label="Previous solution stage"
            className="p-1.5 rounded-full border border-[#F4C46C]/20 text-[#A8B2C6] hover:text-[#F7F4EC] disabled:opacity-35 transition-colors"
          >
            <ChevronLeft className="w-3 h-3" />
          </button>

          <button
            type="button"
            onClick={() => {
              setPlaying(false);
              setVisibleCount((v) => Math.min(totalStages, v + 1));
            }}
            disabled={visibleCount >= totalStages}
            aria-label="Next solution stage"
            className="p-1.5 rounded-full border border-[#F4C46C]/20 text-[#A8B2C6] hover:text-[#F7F4EC] disabled:opacity-35 transition-colors"
          >
            <ChevronRight className="w-3 h-3" />
          </button>

          <button
            type="button"
            onClick={() => {
              setPlaying(false);
              setVisibleCount(totalStages);
            }}
            className="px-2.5 py-1 rounded-full border border-[#F4C46C]/20 text-[#A8B2C6] hover:text-[#F7F4EC] transition-colors"
          >
            Show All
          </button>

          <button
            type="button"
            onClick={handleReplay}
            aria-label="Replay worked solution"
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full border border-[#F4C46C]/20 text-[#A8B2C6] hover:text-[#F7F4EC] transition-colors"
          >
            <RotateCcw className="w-3 h-3" /> Replay
          </button>
        </div>
      </div>

      {/* Main Two-Column Worked Timeline + Live Geometric Companion */}
      <div
        className={`grid grid-cols-1 ${resolvedVisual ? 'lg:grid-cols-12' : ''} gap-5 items-start`}
      >
        <div className={`${resolvedVisual ? 'lg:col-span-7' : ''} relative pl-6 space-y-2.5`}>
          {/* Vertical Animated Derivation Rail */}
          <div className="absolute left-2 top-2 bottom-2 w-[2px] rounded-full bg-[#F4C46C]/12 overflow-hidden">
            <motion.div
              className="w-full h-full rounded-full origin-top"
              style={{
                background: `linear-gradient(180deg, #F4C46C, ${accentColor}, #45E6A6)`,
                boxShadow: `0 0 10px ${accentColor}`,
              }}
              initial={false}
              animate={{ scaleY: progressRatio }}
              transition={reducedMotion ? { duration: 0 } : { type: 'spring', stiffness: 220, damping: 26 }}
            />
          </div>

          {stages.slice(0, visibleCount).map((st, sIdx) => {
            const isActive = sIdx === activeIdx;
            const nodeColor = st.isFinal
              ? '#45E6A6'
              : isActive
                ? accentColor
                : 'rgba(244, 196, 108, 0.45)';
            return (
              <motion.div
                key={`${question.id}-stage-${sIdx}`}
                initial={reducedMotion ? false : { opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 26 }}
                className="relative p-3.5 rounded-xl border transition-colors text-xs space-y-1.5"
                style={{
                  backgroundColor: st.isFinal
                    ? 'rgba(69, 230, 166, 0.08)'
                    : isActive
                      ? 'rgba(244, 196, 108, 0.07)'
                      : '#060609',
                  borderColor: st.isFinal
                    ? 'rgba(69, 230, 166, 0.48)'
                    : isActive
                      ? `${accentColor}77`
                      : 'rgba(244, 196, 108, 0.14)',
                  boxShadow: isActive ? `0 0 22px -10px ${nodeColor}` : undefined,
                }}
              >
                <span
                  className="absolute -left-[21px] top-4 w-2.5 h-2.5 rounded-full border border-[#0B0C12]"
                  style={{
                    backgroundColor: nodeColor,
                    boxShadow: isActive ? `0 0 8px ${nodeColor}` : undefined,
                  }}
                />
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <span
                    className="font-mono-data text-[10px] uppercase tracking-wider"
                    style={{ color: st.isFinal ? '#45E6A6' : accentColor }}
                  >
                    Stage 0{sIdx + 1} · {st.label}
                  </span>
                </div>
                {st.tex && (
                  <div className="overflow-x-auto">
                    <MathTex tex={st.tex} className="text-[#F7F4EC]" />
                  </div>
                )}
                {st.resultText && (
                  <p className="font-mono-data text-xs text-[#45E6A6] font-semibold">
                    {st.resultText}
                  </p>
                )}
                <p className="text-[#A8B2C6] leading-relaxed">{st.note}</p>
              </motion.div>
            );
          })}
        </div>

        {resolvedVisual && (
          <div
            className="lg:col-span-5 space-y-2"
            aria-label={`Worked Visual Stage ${Math.min(visibleCount, totalStages)} of ${totalStages}`}
          >
            <div className="flex items-center justify-between px-1">
              <span className="font-mono-data text-[10px] uppercase tracking-widest text-[#F4C46C]">
                Geometric Companion
              </span>
              <span className="font-mono-data text-[10px] text-[#727D94]">
                Stage 0{Math.min(visibleCount, totalStages)} / 0{totalStages}
              </span>
            </div>
            <EquationMiniVisual
              kind={resolvedVisual}
              accent={accentColor}
              replayKey={`${question.id}-vis-${visibleCount}`}
              heightClass="h-[158px]"
              showReplay
            />
            <p className="font-mono-data text-[10px] text-[#727D94] px-1">
              Vector diagram syncs automatically with each algebraic stage.
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export function PracticeEngine({ questions, accentColor, visualKinds }: PracticeEngineProps) {
  const reducedMotion = useReducedMotion();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [results, setResults] = useState<Record<string, 'correct' | 'incorrect' | undefined>>({});
  const [openHints, setOpenHints] = useState<Record<string, boolean>>({});
  const [openSolutions, setOpenSolutions] = useState<Record<string, boolean>>({});

  const solvedCount = Object.values(results).filter((r) => r === 'correct').length;
  const totalCount = Math.max(1, questions.length);
  const masteryPct = Math.round((solvedCount / totalCount) * 100);
  const xpEarned = solvedCount * 25;
  const xpTotal = questions.length * 25;
  const allVerified = questions.length > 0 && solvedCount === questions.length;

  const checkQuestion = (q: PracticeQuestion, overrideAnswer?: string) => {
    const raw = (overrideAnswer ?? answers[q.id] ?? '').trim();
    if (!raw) return;

    let isCorrect = false;
    if (q.type === 'multiple-choice') {
      isCorrect = raw === String(q.correctAnswer);
    } else {
      const parsed = parseFloat(raw);
      const target = Number(q.correctAnswer);
      const tol = q.tolerance ?? 0.05;
      isCorrect = !Number.isNaN(parsed) && Math.abs(parsed - target) <= tol;
    }

    setResults((prev) => ({ ...prev, [q.id]: isCorrect ? 'correct' : 'incorrect' }));
    if (isCorrect) {
      setOpenSolutions((prev) => ({ ...prev, [q.id]: true }));
    }
  };

  const resetAll = () => {
    setAnswers({});
    setResults({});
    setOpenHints({});
    setOpenSolutions({});
  };

  return (
    <div className="space-y-4">
      {/* Golden HUD Mastery Terminal Header */}
      <div className="instrument-panel p-4 flex flex-wrap items-center justify-between gap-4 border-[#F4C46C]/25">
        <div className="flex flex-wrap items-center gap-3 sm:gap-4 min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span
              className="w-7 h-7 rounded-lg border flex items-center justify-center shrink-0"
              style={{
                borderColor: allVerified ? 'rgba(69, 230, 166, 0.55)' : 'rgba(244, 196, 108, 0.4)',
                backgroundColor: allVerified ? 'rgba(69, 230, 166, 0.14)' : 'rgba(244, 196, 108, 0.1)',
              }}
            >
              {allVerified ? (
                <Trophy className="w-3.5 h-3.5 text-[#45E6A6]" />
              ) : (
                <Zap className="w-3.5 h-3.5 text-[#F4C46C]" />
              )}
            </span>
            <div>
              <span className="font-mono-data text-[10px] uppercase tracking-[0.18em] text-[#727D94] block">
                Mastery Terminal
              </span>
              <span className="font-mono-data text-xs text-[#F7F4EC]">
                <strong style={{ color: allVerified ? '#45E6A6' : accentColor }}>
                  {solvedCount} / {questions.length}
                </strong>{' '}
                verified · <span className="text-[#FFE29E]">{masteryPct}%</span>
              </span>
            </div>
          </div>

          <div className="flex-1 min-w-[140px] max-w-xs space-y-1">
            <div className="flex justify-between font-mono-data text-[10px]">
              <span className="text-[#F4C46C]">XP {xpEarned} / {xpTotal}</span>
              <span className={allVerified ? 'text-[#45E6A6]' : 'text-[#A8B2C6]'}>
                {allVerified ? 'SIGNAL LOCKED' : 'CALIBRATING'}
              </span>
            </div>
            <div className="h-2 rounded-full bg-[#060609] border border-[#F4C46C]/20 overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{
                  background: `linear-gradient(90deg, #F4C46C, ${accentColor}, #45E6A6)`,
                  boxShadow: `0 0 12px ${accentColor}`,
                }}
                initial={false}
                animate={{ width: `${masteryPct}%` }}
                transition={reducedMotion ? { duration: 0 } : { type: 'spring', stiffness: 240, damping: 24 }}
              />
            </div>
          </div>
        </div>

        {Object.keys(results).length > 0 && (
          <button
            type="button"
            onClick={resetAll}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#F4C46C]/25 bg-[#060609]/80 text-xs font-mono-data text-[#A8B2C6] hover:text-[#FFE29E] hover:border-[#F4C46C]/50 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset Set
          </button>
        )}
      </div>

      {/* Practice Cards */}
      <div className="space-y-4">
        {questions.map((q, idx) => {
          const status = results[q.id];
          const hintOpen = !!openHints[q.id];
          const solOpen = !!openSolutions[q.id];
          const resolvedVisual =
            q.visualKind ??
            (visualKinds && visualKinds.length > 0 ? visualKinds[idx % visualKinds.length] : undefined);

          return (
            <motion.div
              key={q.id}
              layout={!reducedMotion}
              className="instrument-frame p-4 sm:p-5 space-y-4 transition-colors"
              style={{
                borderColor:
                  status === 'correct'
                    ? 'rgba(69, 230, 166, 0.52)'
                    : status === 'incorrect'
                      ? 'rgba(255, 133, 99, 0.52)'
                      : undefined,
                boxShadow:
                  status === 'correct'
                    ? '0 0 28px -14px rgba(69, 230, 166, 0.55)'
                    : status === 'incorrect'
                      ? '0 0 28px -14px rgba(255, 133, 99, 0.45)'
                      : undefined,
              }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-2 min-w-0 flex-1">
                  <span className="font-mono-data text-[10.5px] uppercase tracking-[0.18em] text-[#F4C46C]/85 block">
                    Checkpoint 0{idx + 1} · +25 XP
                  </span>
                  <p className="text-sm sm:text-base text-[#F7F4EC] leading-relaxed">{q.prompt}</p>
                  {q.promptTex && (
                    <div className="py-1 overflow-x-auto">
                      <MathTex tex={q.promptTex} displayMode className="text-[#F7F4EC]" />
                    </div>
                  )}
                </div>
                <AnimatePresence mode="popLayout" initial={false}>
                  {status === 'correct' && (
                    <motion.span
                      key={`${q.id}-ok`}
                      initial={reducedMotion ? false : { opacity: 0, scale: 0.82 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={reducedMotion ? undefined : { opacity: 0, scale: 0.85 }}
                      transition={{ type: 'spring', stiffness: 380, damping: 22 }}
                      className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-mono-data border border-[#45E6A6]/45 bg-[#45E6A6]/15 text-[#45E6A6]"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                    </motion.span>
                  )}
                  {status === 'incorrect' && (
                    <motion.span
                      key={`${q.id}-err`}
                      initial={reducedMotion ? false : { opacity: 0, scale: 0.82 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={reducedMotion ? undefined : { opacity: 0, scale: 0.85 }}
                      transition={{ type: 'spring', stiffness: 380, damping: 22 }}
                      className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-mono-data border border-[#FF8563]/45 bg-[#FF8563]/15 text-[#FF8563]"
                    >
                      <XCircle className="w-3.5 h-3.5" /> Re-check
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>

              {q.type === 'multiple-choice' && q.options && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {q.options.map((opt) => {
                    const selected = answers[q.id] === opt.id;
                    const isThisCorrect = status && opt.id === String(q.correctAnswer);
                    return (
                      <motion.button
                        key={opt.id}
                        type="button"
                        whileTap={reducedMotion ? undefined : { scale: 0.99 }}
                        onClick={() => {
                          setAnswers((prev) => ({ ...prev, [q.id]: opt.id }));
                          checkQuestion(q, opt.id);
                        }}
                        className="text-left px-4 py-3 rounded-xl border text-sm transition-all flex items-center gap-3 hover:border-[#F4C46C]/40"
                        style={{
                          backgroundColor: selected ? 'rgba(244, 196, 108, 0.1)' : '#0B0C12',
                          borderColor:
                            selected && status === 'correct'
                              ? '#45E6A6'
                              : selected && status === 'incorrect'
                                ? '#FF8563'
                                : isThisCorrect && solOpen
                                  ? 'rgba(69, 230, 166, 0.55)'
                                  : selected
                                    ? accentColor
                                    : 'rgba(244, 196, 108, 0.16)',
                        }}
                      >
                        <span className="font-mono-data text-xs text-[#F4C46C]/80 uppercase shrink-0">
                          {opt.id}.
                        </span>
                        <span className="min-w-0 overflow-x-auto">
                          {opt.tex ? (
                            <MathTex tex={opt.tex} className="text-[#F7F4EC]" />
                          ) : (
                            <span className="text-[#F7F4EC]">{opt.label}</span>
                          )}
                        </span>
                      </motion.button>
                    );
                  })}
                </div>
              )}

              {q.type === 'numeric' && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    checkQuestion(q);
                  }}
                  className="flex flex-wrap items-center gap-2.5"
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      inputMode="decimal"
                      value={answers[q.id] ?? ''}
                      onChange={(e) =>
                        setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))
                      }
                      placeholder="Enter numeric value"
                      aria-label={`Answer for problem ${idx + 1}`}
                      className="w-44 px-3.5 py-2 rounded-full bg-[#060609] border border-[#F4C46C]/25 font-mono-data text-sm text-[#F7F4EC] placeholder:text-[#727D94] focus:border-[#F4C46C]"
                    />
                    {q.unitLabel && (
                      <span className="font-mono-data text-xs text-[#A8B2C6]">{q.unitLabel}</span>
                    )}
                  </div>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-full text-xs font-semibold text-[#060609] transition-all hover:brightness-110 shadow-[0_0_20px_-6px_rgba(244,196,108,0.6)]"
                    style={{
                      background: `linear-gradient(135deg, ${accentColor}, #FFE29E)`,
                    }}
                  >
                    Verify Answer
                  </button>
                </form>
              )}

              <div className="flex flex-wrap items-center gap-4 pt-1 text-xs">
                <button
                  type="button"
                  onClick={() =>
                    setOpenHints((prev) => ({ ...prev, [q.id]: !prev[q.id] }))
                  }
                  className="inline-flex items-center gap-1.5 font-mono-data text-[#A8B2C6] hover:text-[#FFE29E] transition-colors"
                >
                  <HelpCircle className="w-3.5 h-3.5 text-[#F4C46C]" />
                  {hintOpen ? 'Hide Hint' : 'Show Hint'}
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setOpenSolutions((prev) => ({ ...prev, [q.id]: !prev[q.id] }))
                  }
                  className="inline-flex items-center gap-1.5 font-mono-data text-[#A8B2C6] hover:text-[#45E6A6] transition-colors"
                >
                  {solOpen ? (
                    <ChevronUp className="w-3.5 h-3.5 text-[#45E6A6]" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5 text-[#45E6A6]" />
                  )}
                  {solOpen ? 'Hide Step-by-Step Solution' : 'Step-by-Step Solution'}
                </button>
              </div>

              <AnimatePresence initial={false}>
                {hintOpen && (
                  <motion.div
                    key={`${q.id}-hint`}
                    initial={reducedMotion ? false : { opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={reducedMotion ? undefined : { opacity: 0, height: 0 }}
                    transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="p-3.5 rounded-xl bg-[#11131C] border border-[#F4C46C]/30 text-xs text-[#F7F4EC]/90">
                      <span className="font-mono-data text-[#F4C46C] mr-2">HINT:</span>
                      {q.hint}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence initial={false}>
                {solOpen && (
                  <AnimatedWorkedSolution
                    key={`${q.id}-sol`}
                    question={q}
                    accentColor={accentColor}
                    resolvedVisual={resolvedVisual}
                  />
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
