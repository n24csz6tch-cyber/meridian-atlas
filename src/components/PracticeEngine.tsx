import { useEffect, useMemo, useState } from 'react';
import { Link, useInRouterContext, useLocation } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  ArrowDown,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Flame,
  HelpCircle,
  Lightbulb,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
  Trophy,
  XCircle,
  Zap,
} from 'lucide-react';
import { MathTex } from './MathTex';
import { CURRICULUM_NODES } from '../data/curriculumGraph';
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

export interface PracticeEngineProps {
  questions: PracticeQuestion[];
  accentColor: string;
  visualKinds?: EquationVisualKind[];
  nodeId?: string;
}

interface NormalizedStage {
  label: string;
  tex?: string;
  resultText?: string;
  note: string;
  isFinal?: boolean;
}

interface StrategyNudge {
  moveLabel: string;
  setupTex?: string;
  guidance: string;
}

const MASTERED_STORAGE_KEY = 'aurea_mastered_nodes_v1';

function readMasteredNodes(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(MASTERED_STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((id): id is string => typeof id === 'string' && id.trim().length > 0);
  } catch {
    return [];
  }
}

function toggleMasteredNode(targetNodeId: string): string[] {
  const current = readMasteredNodes();
  const exists = current.includes(targetNodeId);
  const next = exists ? current.filter((id) => id !== targetNodeId) : [...current, targetNodeId];
  try {
    window.localStorage.setItem(MASTERED_STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new Event('aurea-progress-change'));
  } catch {
    // Ignore storage quota or private browsing errors
  }
  return next;
}

function escapeRegExp(val: string): string {
  return val.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function leaksNumericAnswer(text: string, correct: string | number): boolean {
  const target = String(correct).trim();
  if (!target) return false;
  const escaped = escapeRegExp(target);
  const eqRegex = new RegExp(`(?:=|\\\\implies|is|equals)\\s*${escaped}(?![0-9.])`, 'i');
  if (eqRegex.test(text)) return true;
  if (target.length >= 2) {
    const tokenRegex = new RegExp(`(?:^|[^0-9.])${escaped}(?![0-9.])`);
    if (tokenRegex.test(text)) return true;
  }
  return false;
}

function leaksChoiceAnswer(text: string, q: PracticeQuestion): boolean {
  const matched = q.options?.find((o) => o.id === String(q.correctAnswer));
  if (!matched) return false;
  const lower = text.toLowerCase();
  if (matched.label && matched.label.length > 4 && lower.includes(matched.label.toLowerCase())) {
    return true;
  }
  if (matched.tex && matched.tex.length > 3 && text.includes(matched.tex)) {
    return true;
  }
  return false;
}

function buildStrategyNudge(q: PracticeQuestion): StrategyNudge {
  const firstStep = q.solutionSteps[0];
  const moveLabel = firstStep?.label ?? 'Analyze the Structure';

  let setupTex: string | undefined;
  if (firstStep?.tex && q.solutionSteps.length >= 2) {
    const candidateTex = firstStep.tex.includes('\\implies')
      ? firstStep.tex.split('\\implies')[0].trim()
      : firstStep.tex.trim();
    const leaks =
      q.type === 'numeric'
        ? leaksNumericAnswer(candidateTex, q.correctAnswer)
        : leaksChoiceAnswer(candidateTex, q);
    if (!leaks && candidateTex.length > 0) {
      setupTex = candidateTex;
    }
  }

  const safeNote =
    firstStep?.note &&
    q.solutionSteps.length >= 2 &&
    !(q.type === 'numeric'
      ? leaksNumericAnswer(firstStep.note, q.correctAnswer)
      : leaksChoiceAnswer(firstStep.note, q))
      ? firstStep.note
      : null;

  let guidance: string;
  if (safeNote) {
    guidance = `${safeNote} Keep simplifying from here — open Hint if you want a closer clue.`;
  } else if (q.type === 'multiple-choice') {
    guidance = `Start with "${moveLabel}". Check signs, units, or key vertex and slope behavior first to rule out 1–2 choices before selecting.`;
  } else {
    const unitNote = q.unitLabel ? ` (watch your units: ${q.unitLabel})` : '';
    guidance = `Set up Step 1 (${moveLabel.toLowerCase()})${unitNote} using the given relationship, then isolate your target value before verifying.`;
  }

  return { moveLabel, setupTex, guidance };
}

function RouterPathSync({ onPathChange }: { onPathChange: (pathname: string) => void }) {
  const location = useLocation();
  useEffect(() => {
    onPathChange(location.pathname);
  }, [location.pathname, onPathChange]);
  return null;
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
      className="p-4 sm:p-5 rounded-2xl bg-[#0B0B12] border border-[#F4C46C]/28 space-y-4 overflow-hidden shadow-[inset_0_1px_0_rgba(255,229,163,0.12)]"
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
              borderColor: playing ? accentColor : 'rgba(244, 196, 108, 0.24)',
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
            className="p-1.5 rounded-full border border-[#F4C46C]/22 text-[#A8B2C6] hover:text-[#F7F4EC] disabled:opacity-35 transition-colors"
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
            className="p-1.5 rounded-full border border-[#F4C46C]/22 text-[#A8B2C6] hover:text-[#F7F4EC] disabled:opacity-35 transition-colors"
          >
            <ChevronRight className="w-3 h-3" />
          </button>

          <button
            type="button"
            onClick={() => {
              setPlaying(false);
              setVisibleCount(totalStages);
            }}
            className="px-2.5 py-1 rounded-full border border-[#F4C46C]/22 text-[#A8B2C6] hover:text-[#F7F4EC] transition-colors"
          >
            Show All
          </button>

          <button
            type="button"
            onClick={handleReplay}
            aria-label="Replay worked solution"
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full border border-[#F4C46C]/22 text-[#A8B2C6] hover:text-[#F7F4EC] transition-colors"
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
          <div className="absolute left-2 top-2 bottom-2 w-[2px] rounded-full bg-[#F4C46C]/14 overflow-hidden">
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
                      ? 'rgba(244, 196, 108, 0.08)'
                      : '#050508',
                  borderColor: st.isFinal
                    ? 'rgba(69, 230, 166, 0.48)'
                    : isActive
                      ? `${accentColor}77`
                      : 'rgba(244, 196, 108, 0.16)',
                  boxShadow: isActive ? `0 0 22px -10px ${nodeColor}` : undefined,
                }}
              >
                <span
                  className="absolute -left-[21px] top-4 w-2.5 h-2.5 rounded-full border border-[#0B0B12]"
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
                  <div className="overflow-x-auto max-w-full">
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

export function PracticeEngine({
  questions,
  accentColor,
  visualKinds,
  nodeId,
}: PracticeEngineProps) {
  const reducedMotion = useReducedMotion();
  const inRouter = useInRouterContext();
  const [pathname, setPathname] = useState<string>(() =>
    typeof window !== 'undefined' ? window.location.pathname : '',
  );
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [results, setResults] = useState<Record<string, 'correct' | 'incorrect' | undefined>>({});
  const [openNudges, setOpenNudges] = useState<Record<string, boolean>>({});
  const [openHints, setOpenHints] = useState<Record<string, boolean>>({});
  const [openSolutions, setOpenSolutions] = useState<Record<string, boolean>>({});
  const [streak, setStreak] = useState<number>(0);
  const [bestStreak, setBestStreak] = useState<number>(0);
  const [masteredNodes, setMasteredNodes] = useState<string[]>(() => readMasteredNodes());

  useEffect(() => {
    const syncMastered = () => setMasteredNodes(readMasteredNodes());
    syncMastered();
    window.addEventListener('aurea-progress-change', syncMastered);
    window.addEventListener('storage', syncMastered);
    return () => {
      window.removeEventListener('aurea-progress-change', syncMastered);
      window.removeEventListener('storage', syncMastered);
    };
  }, []);

  const resolvedNode = useMemo(() => {
    if (nodeId) {
      return CURRICULUM_NODES.find((n) => n.id === nodeId);
    }
    const normalized = pathname.replace(/\/+$/, '');
    if (!normalized) return undefined;
    return CURRICULUM_NODES.find((n) => normalized.endsWith(n.route));
  }, [nodeId, pathname]);

  const isNodeMastered = resolvedNode ? masteredNodes.includes(resolvedNode.id) : false;

  const solvedCount = Object.values(results).filter((r) => r === 'correct').length;
  const totalCount = Math.max(1, questions.length);
  const masteryPct = Math.round((solvedCount / totalCount) * 100);
  const xpEarned = solvedCount * 25;
  const xpTotal = questions.length * 25;
  const allVerified = questions.length > 0 && solvedCount === questions.length;
  const masteryUnlocked = allVerified || streak >= 3 || bestStreak >= 3;

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

    const wasAlreadyCorrect = results[q.id] === 'correct';
    setResults((prev) => ({ ...prev, [q.id]: isCorrect ? 'correct' : 'incorrect' }));

    if (isCorrect) {
      if (!wasAlreadyCorrect) {
        const nextStreak = streak + 1;
        setStreak(nextStreak);
        setBestStreak((prev) => Math.max(prev, nextStreak));
      }
      setOpenSolutions((prev) => ({ ...prev, [q.id]: true }));
    } else {
      setStreak(0);
    }
  };

  const resetAll = () => {
    setAnswers({});
    setResults({});
    setOpenNudges({});
    setOpenHints({});
    setOpenSolutions({});
    setStreak(0);
    setBestStreak(0);
  };

  return (
    <div className="space-y-4">
      {inRouter && <RouterPathSync onPathChange={setPathname} />}

      {/* Golden HUD Mastery Terminal Header with Mastery Bar & Streak Meter */}
      <div className="aurea-gold-frame p-4 sm:p-5 space-y-3.5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 min-w-0 flex-1">
            <div className="flex items-center gap-2.5">
              <span
                className="w-8 h-8 rounded-xl border flex items-center justify-center shrink-0"
                style={{
                  borderColor: allVerified ? 'rgba(69, 230, 166, 0.55)' : 'rgba(244, 196, 108, 0.45)',
                  backgroundColor: allVerified ? 'rgba(69, 230, 166, 0.14)' : 'rgba(244, 196, 108, 0.12)',
                  boxShadow: allVerified
                    ? '0 0 18px -6px rgba(69, 230, 166, 0.65)'
                    : '0 0 18px -6px rgba(244, 196, 108, 0.5)',
                }}
              >
                {allVerified ? (
                  <Trophy className="w-4 h-4 text-[#45E6A6]" />
                ) : (
                  <Zap className="w-4 h-4 text-[#FFE5A3]" />
                )}
              </span>
              <div>
                <span className="font-mono-data text-[10px] uppercase tracking-[0.18em] text-[#F4C46C]/85 block">
                  Mastery Terminal
                </span>
                <span className="font-mono-data text-xs sm:text-sm text-[#F7F4EC]">
                  <strong style={{ color: allVerified ? '#45E6A6' : '#FFE5A3' }}>
                    {solvedCount} / {questions.length}
                  </strong>{' '}
                  solved · <span className="text-[#F4C46C]">{masteryPct}%</span>
                </span>
              </div>
            </div>

            {/* Golden Mastery Progress Bar */}
            <div className="flex-1 min-w-[160px] max-w-sm space-y-1.5">
              <div className="flex justify-between font-mono-data text-[10px]">
                <span className="text-[#FFE5A3]">XP {xpEarned} / {xpTotal}</span>
                <span className={allVerified ? 'text-[#45E6A6] font-semibold' : 'text-[#A8B2C6]'}>
                  {allVerified ? '100% LOCKED IN' : masteryPct > 0 ? 'IN PROGRESS' : 'READY'}
                </span>
              </div>
              <div className="h-2.5 rounded-full bg-[#050508] border border-[#F4C46C]/28 overflow-hidden p-[1px]">
                <motion.div
                  className="h-full rounded-full"
                  style={{
                    background: allVerified
                      ? 'linear-gradient(90deg, #F4C46C, #FFE5A3, #45E6A6)'
                      : `linear-gradient(90deg, #B88938, #F4C46C, ${accentColor}, #FFE5A3)`,
                    boxShadow: `0 0 14px ${allVerified ? '#45E6A6' : '#F4C46C'}`,
                  }}
                  initial={false}
                  animate={{ width: `${masteryPct}%` }}
                  transition={reducedMotion ? { duration: 0 } : { type: 'spring', stiffness: 240, damping: 24 }}
                />
              </div>
            </div>
          </div>

          {/* Streak Meter + Reset Set */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border font-mono-data text-xs transition-all"
              style={{
                borderColor: streak >= 3 ? 'rgba(255, 229, 163, 0.58)' : 'rgba(244, 196, 108, 0.28)',
                background:
                  streak >= 3
                    ? 'linear-gradient(135deg, rgba(244, 196, 108, 0.22), rgba(255, 229, 163, 0.1))'
                    : 'rgba(5, 5, 8, 0.8)',
                boxShadow: streak >= 3 ? '0 0 18px -6px rgba(244, 196, 108, 0.65)' : undefined,
              }}
            >
              <Flame
                className={`w-3.5 h-3.5 ${
                  streak >= 3 ? 'text-[#FFE5A3]' : streak > 0 ? 'text-[#F4C46C]' : 'text-[#727D94]'
                }`}
              />
              <span className={streak > 0 ? 'text-[#FFE5A3] font-semibold' : 'text-[#A8B2C6]'}>
                Streak {streak}
              </span>
              <span className="inline-flex items-center gap-1 pl-1" aria-hidden="true">
                {[1, 2, 3].map((pip) => (
                  <span
                    key={pip}
                    className="w-1.5 h-1.5 rounded-full transition-colors"
                    style={{
                      backgroundColor: streak >= pip ? '#FFE5A3' : 'rgba(244, 196, 108, 0.2)',
                      boxShadow: streak >= pip ? '0 0 6px #F4C46C' : undefined,
                    }}
                  />
                ))}
              </span>
              {bestStreak > streak && (
                <span className="text-[10px] text-[#A8B2C6] border-l border-[#F4C46C]/20 pl-1.5">
                  Best {bestStreak}
                </span>
              )}
            </div>

            {Object.keys(results).length > 0 && (
              <button
                type="button"
                onClick={resetAll}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#F4C46C]/28 bg-[#050508]/85 text-xs font-mono-data text-[#A8B2C6] hover:text-[#FFE5A3] hover:border-[#F4C46C]/55 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset Set
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Encouraging Golden Mastery Unlocked Callout */}
      <AnimatePresence initial={false}>
        {masteryUnlocked && (
          <motion.div
            key="mastery-unlocked-callout"
            initial={reducedMotion ? false : { opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reducedMotion ? undefined : { opacity: 0, y: -6 }}
            transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
            className="aurea-glass-card p-4 sm:p-5 border-[#FFE5A3]/45 bg-gradient-to-r from-[#12121D]/95 via-[#181827]/90 to-[#F4C46C]/[0.14] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            style={{
              boxShadow:
                'inset 0 1px 0 rgba(255, 229, 163, 0.28), 0 0 32px -14px rgba(244, 196, 108, 0.55)',
            }}
          >
            <div className="flex items-start gap-3 min-w-0">
              <span className="w-9 h-9 rounded-xl border border-[#FFE5A3]/50 bg-[#F4C46C]/20 flex items-center justify-center shrink-0 mt-0.5">
                <Trophy className="w-4.5 h-4.5 text-[#FFE5A3]" />
              </span>
              <div className="space-y-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono-data text-[10.5px] uppercase tracking-[0.18em] text-[#FFE5A3] font-semibold">
                    Mastery Unlocked
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono-data bg-[#45E6A6]/15 border border-[#45E6A6]/40 text-[#45E6A6]">
                    {allVerified ? '100% Verified' : `${Math.max(streak, bestStreak)}x Streak`}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-[#F7F4EC] leading-relaxed">
                  {allVerified
                    ? 'Awesome job! You nailed every problem in this set.'
                    : 'Momentum locked in — 3+ accurate solves in a row!'}{' '}
                  {resolvedNode
                    ? 'Save this lesson as mastered or scroll to the Lesson Bridge below for your next step.'
                    : 'Ready to keep leveling up? Jump into your course hub to track all 36 modules.'}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              {resolvedNode ? (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      const next = toggleMasteredNode(resolvedNode.id);
                      setMasteredNodes(next);
                    }}
                    className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition-all border ${
                      isNodeMastered
                        ? 'border-[#45E6A6]/55 bg-[#45E6A6]/18 text-[#45E6A6] hover:bg-[#45E6A6]/25'
                        : 'text-[#050508] border-[#FFE5A3]/70 hover:brightness-110 shadow-[0_0_22px_-6px_rgba(244,196,108,0.7)]'
                    }`}
                    style={
                      isNodeMastered
                        ? undefined
                        : { background: 'linear-gradient(135deg, #F4C46C, #FFE5A3)' }
                    }
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{isNodeMastered ? 'Lesson Mastered ✓' : 'Mark Lesson Mastered'}</span>
                  </button>

                  <a
                    href="#layer-7"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-mono-data border border-[#F4C46C]/35 bg-[#0B0B12] text-[#FFE5A3] hover:border-[#FFE5A3]/65 transition-colors"
                  >
                    <span>Lesson Bridge</span>
                    <ArrowDown className="w-3.5 h-3.5 text-[#F4C46C]" />
                  </a>
                </>
              ) : inRouter ? (
                <Link
                  to="/course/algebra-1"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold text-[#050508] hover:brightness-110 transition-all shadow-[0_0_22px_-6px_rgba(244,196,108,0.65)]"
                  style={{ background: 'linear-gradient(135deg, #F4C46C, #FFE5A3)' }}
                >
                  <span>View Course Hub</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              ) : null}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Practice Cards */}
      <div className="space-y-4">
        {questions.map((q, idx) => {
          const status = results[q.id];
          const nudgeOpen = !!openNudges[q.id];
          const hintOpen = !!openHints[q.id];
          const solOpen = !!openSolutions[q.id];
          const resolvedVisual =
            q.visualKind ??
            (visualKinds && visualKinds.length > 0 ? visualKinds[idx % visualKinds.length] : undefined);
          const nudge = buildStrategyNudge(q);

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
                    <div className="py-1 overflow-x-auto max-w-full">
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
                        className="text-left px-4 py-3 rounded-xl border text-sm transition-all flex items-center gap-3 hover:border-[#F4C46C]/42"
                        style={{
                          backgroundColor: selected ? 'rgba(244, 196, 108, 0.1)' : '#0B0B12',
                          borderColor:
                            selected && status === 'correct'
                              ? '#45E6A6'
                              : selected && status === 'incorrect'
                                ? '#FF8563'
                                : isThisCorrect && solOpen
                                  ? 'rgba(69, 230, 166, 0.55)'
                                  : selected
                                    ? accentColor
                                    : 'rgba(244, 196, 108, 0.18)',
                        }}
                      >
                        <span className="font-mono-data text-xs text-[#F4C46C]/85 uppercase shrink-0">
                          {opt.id}.
                        </span>
                        <span className="min-w-0 overflow-x-auto max-w-full">
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
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <input
                      type="text"
                      inputMode="decimal"
                      value={answers[q.id] ?? ''}
                      onChange={(e) =>
                        setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))
                      }
                      placeholder="Enter numeric value"
                      aria-label={`Answer for problem ${idx + 1}`}
                      className="w-full sm:w-44 px-3.5 py-2 rounded-full bg-[#050508] border border-[#F4C46C]/28 font-mono-data text-sm text-[#F7F4EC] placeholder:text-[#727D94] focus:border-[#F4C46C]"
                    />
                    {q.unitLabel && (
                      <span className="font-mono-data text-xs text-[#A8B2C6] shrink-0">
                        {q.unitLabel}
                      </span>
                    )}
                  </div>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-full text-xs font-semibold text-[#050508] transition-all hover:brightness-110 shadow-[0_0_20px_-6px_rgba(244,196,108,0.6)]"
                    style={{
                      background: `linear-gradient(135deg, ${accentColor}, #FFE5A3)`,
                    }}
                  >
                    Verify Answer
                  </button>
                </form>
              )}

              {/* Progressive Scaffolding Controls: Step-1 Nudge -> Hint -> Full Solution */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 pt-1 text-xs">
                <button
                  type="button"
                  aria-expanded={nudgeOpen}
                  onClick={() =>
                    setOpenNudges((prev) => ({ ...prev, [q.id]: !prev[q.id] }))
                  }
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border font-mono-data transition-all ${
                    nudgeOpen
                      ? 'aurea-pill-active'
                      : 'border-[#F4C46C]/28 bg-[#12121D]/80 text-[#FFE5A3] hover:border-[#F4C46C]/55'
                  }`}
                >
                  <Lightbulb className="w-3.5 h-3.5 text-[#F4C46C]" />
                  <span>{nudgeOpen ? 'Hide Strategy Nudge' : 'Quick Strategy Nudge'}</span>
                </button>

                <button
                  type="button"
                  aria-expanded={hintOpen}
                  onClick={() =>
                    setOpenHints((prev) => ({ ...prev, [q.id]: !prev[q.id] }))
                  }
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-transparent font-mono-data text-[#A8B2C6] hover:text-[#FFE5A3] hover:border-[#F4C46C]/25 transition-colors"
                >
                  <HelpCircle className="w-3.5 h-3.5 text-[#F4C46C]" />
                  <span>{hintOpen ? 'Hide Hint' : 'Show Hint'}</span>
                </button>

                <button
                  type="button"
                  aria-expanded={solOpen}
                  onClick={() =>
                    setOpenSolutions((prev) => ({ ...prev, [q.id]: !prev[q.id] }))
                  }
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-transparent font-mono-data text-[#A8B2C6] hover:text-[#45E6A6] hover:border-[#45E6A6]/25 transition-colors"
                >
                  {solOpen ? (
                    <ChevronUp className="w-3.5 h-3.5 text-[#45E6A6]" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5 text-[#45E6A6]" />
                  )}
                  <span>{solOpen ? 'Hide Step-by-Step Solution' : 'Step-by-Step Solution'}</span>
                </button>
              </div>

              {/* Quick Strategy Nudge Accordion (Step-1 Gentle Scaffold) */}
              <AnimatePresence initial={false}>
                {nudgeOpen && (
                  <motion.div
                    key={`${q.id}-nudge`}
                    initial={reducedMotion ? false : { opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={reducedMotion ? undefined : { opacity: 0, height: 0 }}
                    transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="p-3.5 rounded-xl bg-gradient-to-br from-[#12121D] to-[#0B0B12] border border-[#F4C46C]/38 space-y-2 text-xs shadow-[inset_0_1px_0_rgba(255,229,163,0.12)]">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="inline-flex items-center gap-1.5 font-mono-data text-[10.5px] uppercase tracking-wider text-[#FFE5A3]">
                          <Lightbulb className="w-3.5 h-3.5 text-[#F4C46C]" />
                          Step-1 Strategy Nudge · {nudge.moveLabel}
                        </span>
                        <span className="font-mono-data text-[10px] text-[#727D94]">
                          No spoiler
                        </span>
                      </div>
                      {nudge.setupTex && (
                        <div className="px-3 py-2 rounded-lg bg-[#050508] border border-[#F4C46C]/20 overflow-x-auto max-w-full">
                          <MathTex tex={nudge.setupTex} className="text-[#FFE5A3]" />
                        </div>
                      )}
                      <p className="text-[#F7F4EC]/90 leading-relaxed">{nudge.guidance}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

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
                    <div className="p-3.5 rounded-xl bg-[#12121D] border border-[#F4C46C]/30 text-xs text-[#F7F4EC]/90">
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
