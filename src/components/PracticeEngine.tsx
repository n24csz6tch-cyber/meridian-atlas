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
  XCircle,
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
      className="p-4 sm:p-5 rounded-xl bg-[#0A101B] border border-white/[0.12] space-y-4 overflow-hidden"
    >
      {/* Header + Playback Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b hairline-rule">
        <div className="flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-[#36EBA8]" />
          <p className="font-mono-data text-[10.5px] uppercase tracking-wider text-[#36EBA8]">
            Animated Worked Solution · Stage {Math.min(visibleCount, totalStages)}/{totalStages}
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
              borderColor: playing ? accentColor : 'rgba(255,255,255,0.14)',
              backgroundColor: playing ? `${accentColor}1E` : 'rgba(255,255,255,0.04)',
              color: playing ? accentColor : '#EDEBE4',
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
            className="p-1.5 rounded-full border border-white/10 text-[#9CA6B8] hover:text-[#EDEBE4] disabled:opacity-35 transition-colors"
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
            className="p-1.5 rounded-full border border-white/10 text-[#9CA6B8] hover:text-[#EDEBE4] disabled:opacity-35 transition-colors"
          >
            <ChevronRight className="w-3 h-3" />
          </button>

          <button
            type="button"
            onClick={() => {
              setPlaying(false);
              setVisibleCount(totalStages);
            }}
            className="px-2.5 py-1 rounded-full border border-white/10 text-[#9CA6B8] hover:text-[#EDEBE4] transition-colors"
          >
            Show All
          </button>

          <button
            type="button"
            onClick={handleReplay}
            aria-label="Replay worked solution"
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full border border-white/10 text-[#9CA6B8] hover:text-[#EDEBE4] transition-colors"
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
          <div className="absolute left-2 top-2 bottom-2 w-[2px] rounded-full bg-white/[0.08] overflow-hidden">
            <motion.div
              className="w-full h-full rounded-full origin-top"
              style={{
                background: `linear-gradient(180deg, ${accentColor}, #36EBA8)`,
                boxShadow: `0 0 10px ${accentColor}`,
              }}
              initial={false}
              animate={{ scaleY: progressRatio }}
              transition={reducedMotion ? { duration: 0 } : { type: 'spring', stiffness: 220, damping: 26 }}
            />
          </div>

          {stages.slice(0, visibleCount).map((st, sIdx) => {
            const isActive = sIdx === activeIdx;
            const nodeColor = st.isFinal ? '#36EBA8' : isActive ? accentColor : 'rgba(237,235,228,0.35)';
            return (
              <motion.div
                key={`${question.id}-stage-${sIdx}`}
                initial={reducedMotion ? false : { opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 26 }}
                className="relative p-3 rounded-lg border transition-colors text-xs space-y-1.5"
                style={{
                  backgroundColor: st.isFinal
                    ? 'rgba(54, 235, 168, 0.08)'
                    : isActive
                      ? 'rgba(255, 255, 255, 0.05)'
                      : '#070C15',
                  borderColor: st.isFinal
                    ? 'rgba(54, 235, 168, 0.45)'
                    : isActive
                      ? `${accentColor}66`
                      : 'rgba(255, 255, 255, 0.08)',
                  boxShadow: isActive ? `0 0 20px -10px ${nodeColor}` : undefined,
                }}
              >
                <span
                  className="absolute -left-[21px] top-4 w-2.5 h-2.5 rounded-full border border-[#0A101B]"
                  style={{
                    backgroundColor: nodeColor,
                    boxShadow: isActive ? `0 0 8px ${nodeColor}` : undefined,
                  }}
                />
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <span
                    className="font-mono-data text-[10px] uppercase tracking-wider"
                    style={{ color: st.isFinal ? '#36EBA8' : accentColor }}
                  >
                    Stage 0{sIdx + 1} · {st.label}
                  </span>
                </div>
                {st.tex && (
                  <div className="overflow-x-auto">
                    <MathTex tex={st.tex} className="text-[#F4F3EE]" />
                  </div>
                )}
                {st.resultText && (
                  <p className="font-mono-data text-xs text-[#36EBA8] font-semibold">
                    {st.resultText}
                  </p>
                )}
                <p className="text-[#9CA6B8] leading-relaxed">{st.note}</p>
              </motion.div>
            );
          })}
        </div>

        {resolvedVisual && (
          <div className="lg:col-span-5 space-y-1.5">
            <EquationMiniVisual
              kind={resolvedVisual}
              accent={accentColor}
              replayKey={`${question.id}-vis-${visibleCount}`}
              heightClass="h-[156px]"
              caption={`Worked Visual · Stage ${Math.min(visibleCount, totalStages)}/${totalStages}`}
              showReplay
            />
            <p className="font-mono-data text-[10px] text-[#6F7F99] px-1">
              Visual diagram re-draws in sync with algebraic solution stages.
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
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b hairline-rule">
        <div className="flex items-center gap-3">
          <span className="font-mono-data text-xs text-[#9CA6B8]">
            Mastery Check:{' '}
            <strong style={{ color: accentColor }}>
              {solvedCount} / {questions.length}
            </strong>{' '}
            verified
          </span>
          <div className="w-28 h-1.5 rounded-full bg-[#161D29] overflow-hidden">
            <div
              className="h-full transition-all duration-300"
              style={{
                width: `${(solvedCount / Math.max(1, questions.length)) * 100}%`,
                backgroundColor: accentColor,
              }}
            />
          </div>
        </div>
        {Object.keys(results).length > 0 && (
          <button
            type="button"
            onClick={resetAll}
            className="inline-flex items-center gap-1.5 text-xs font-mono-data text-[#9CA6B8] hover:text-[#EDEBE4]"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset Set
          </button>
        )}
      </div>

      <div className="space-y-4">
        {questions.map((q, idx) => {
          const status = results[q.id];
          const hintOpen = !!openHints[q.id];
          const solOpen = !!openSolutions[q.id];
          const resolvedVisual =
            q.visualKind ??
            (visualKinds && visualKinds.length > 0 ? visualKinds[idx % visualKinds.length] : undefined);

          return (
            <div
              key={q.id}
              className="instrument-frame p-5 space-y-4 transition-colors"
              style={{
                borderColor:
                  status === 'correct'
                    ? 'rgba(52, 211, 153, 0.45)'
                    : status === 'incorrect'
                      ? 'rgba(249, 115, 91, 0.45)'
                      : undefined,
              }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-2">
                  <span className="font-mono-data text-[11px] uppercase tracking-wider text-[#6C7689]">
                    Problem 0{idx + 1}
                  </span>
                  <p className="text-sm sm:text-base text-[#EDEBE4] leading-relaxed">{q.prompt}</p>
                  {q.promptTex && (
                    <div className="py-1">
                      <MathTex tex={q.promptTex} displayMode className="text-[#EDEBE4]" />
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
                      className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-mono-data bg-[#34D399]/15 text-[#34D399]"
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
                      className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-mono-data bg-[#F9735B]/15 text-[#F9735B]"
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
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => {
                          setAnswers((prev) => ({ ...prev, [q.id]: opt.id }));
                          checkQuestion(q, opt.id);
                        }}
                        className="text-left px-4 py-3 rounded-xl border text-sm transition-all flex items-center gap-3"
                        style={{
                          backgroundColor: selected ? 'rgba(255,255,255,0.07)' : '#070B14',
                          borderColor:
                            selected && status === 'correct'
                              ? '#36EBA8'
                              : selected && status === 'incorrect'
                                ? '#FF7A5C'
                                : isThisCorrect && solOpen
                                  ? 'rgba(54, 235, 168, 0.5)'
                                  : selected
                                    ? accentColor
                                    : 'rgba(237, 235, 228, 0.12)',
                        }}
                      >
                        <span className="font-mono-data text-xs text-[#6C7689] uppercase">
                          {opt.id}.
                        </span>
                        {opt.tex ? (
                          <MathTex tex={opt.tex} className="text-[#EDEBE4]" />
                        ) : (
                          <span className="text-[#EDEBE4]">{opt.label}</span>
                        )}
                      </button>
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
                      className="w-44 px-3.5 py-2 rounded-full bg-[#060A13] border border-white/15 font-mono-data text-sm text-[#F4F3EE] focus:border-white/40"
                    />
                    {q.unitLabel && (
                      <span className="font-mono-data text-xs text-[#A5B4CC]">{q.unitLabel}</span>
                    )}
                  </div>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-full text-xs font-semibold text-[#03050A] transition-all hover:brightness-110"
                    style={{ backgroundColor: accentColor }}
                  >
                    Check Answer
                  </button>
                </form>
              )}

              <div className="flex flex-wrap items-center gap-4 pt-1 text-xs">
                <button
                  type="button"
                  onClick={() =>
                    setOpenHints((prev) => ({ ...prev, [q.id]: !prev[q.id] }))
                  }
                  className="inline-flex items-center gap-1.5 font-mono-data text-[#9CA6B8] hover:text-[#EDEBE4]"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  {hintOpen ? 'Hide Hint' : 'Show Hint'}
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setOpenSolutions((prev) => ({ ...prev, [q.id]: !prev[q.id] }))
                  }
                  className="inline-flex items-center gap-1.5 font-mono-data text-[#9CA6B8] hover:text-[#EDEBE4]"
                >
                  {solOpen ? (
                    <ChevronUp className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5" />
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
                    <div className="p-3 rounded bg-[#161D29] border border-[rgba(229,169,76,0.22)] text-xs text-[#EDEBE4]/90">
                      <span className="font-mono-data text-[#E5A94C] mr-2">HINT:</span>
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
            </div>
          );
        })}
      </div>
    </div>
  );
}
