import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Compass,
  Eye,
  EyeOff,
  Lightbulb,
  Orbit,
  Sparkles,
  Trophy,
  Zap,
} from 'lucide-react';
import { COURSES, CURRICULUM_NODES } from '../data/curriculumGraph';
import { CourseId } from '../data/standards';
import {
  getCompletedNodes,
  getNodeGuidance,
  PROGRESS_CHANGE_EVENT,
  toggleNodeCompleted,
} from '../data/studentGuidance';
import { MathTex } from './MathTex';

export interface LessonWarmupBannerProps {
  courseId: CourseId;
  nodeId: string;
}

export function LessonWarmupBanner({
  courseId,
  nodeId,
}: LessonWarmupBannerProps): JSX.Element {
  const [showAnswer, setShowAnswer] = useState(false);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    setShowAnswer(false);
  }, [nodeId]);

  const course = COURSES[courseId];
  const guidance = useMemo(() => getNodeGuidance(nodeId), [nodeId]);
  const nodeMap = useMemo(
    () => new Map(CURRICULUM_NODES.map((n) => [n.id, n])),
    []
  );
  const currentNode = nodeMap.get(nodeId);
  const nextNode = guidance.nextNodeId ? nodeMap.get(guidance.nextNodeId) ?? null : null;

  return (
    <section
      aria-label="Lesson orientation, warm-up, and symbol decoder"
      className="instrument-frame fiducial-frame p-4 sm:p-6 space-y-5 overflow-hidden"
      style={{ borderColor: `${course.accent}42` }}
    >
      {/* Top Orientation Bar: Step K of 9 + Prerequisite Link */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b hairline-rule pb-3.5">
        <div className="flex flex-wrap items-center gap-2 min-w-0">
          <span
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-mono-data text-[11px] font-semibold border"
            style={{
              color: course.accent,
              borderColor: `${course.accent}55`,
              backgroundColor: `${course.accent}16`,
            }}
          >
            <Compass className="w-3.5 h-3.5 shrink-0" />
            <span>
              Step {guidance.stepNumber} of 9 · Where You Are · {course.title}
            </span>
          </span>

          {currentNode && (
            <span className="font-mono-data text-[11px] text-[#A8B2C6] truncate">
              {currentNode.code} · {currentNode.title}
            </span>
          )}
        </div>

        {guidance.prerequisiteRoute && (
          <Link
            to={guidance.prerequisiteRoute}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono-data border border-[#F4C46C]/25 bg-[#0B0C12] text-[#A8B2C6] hover:text-[#FFE29E] hover:border-[#F4C46C]/55 transition-colors max-w-full"
          >
            <ArrowLeft className="w-3 h-3 text-[#F4C46C] shrink-0" />
            <span className="truncate">
              From: {guidance.prerequisiteTitle}
            </span>
          </Link>
        )}
      </div>

      {/* Why This Matters Now + 1-Minute Brain Warm-Up */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        {/* Why This Matters Now */}
        <div className="lg:col-span-6 instrument-panel p-4 flex flex-col justify-between gap-3 border-[#F4C46C]/20">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-[#F4C46C] shrink-0" />
              <span className="font-mono-data text-[10.5px] uppercase tracking-[0.18em] text-[#F4C46C]">
                Why This Matters Now
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#F7F4EC]/95 leading-relaxed">
              {guidance.whyThisMatters}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 text-[10.5px] font-mono-data text-[#727D94] pt-2 border-t border-[#F4C46C]/12">
            <span>Path:</span>
            <span className="text-[#A8B2C6]">{guidance.prerequisiteTitle}</span>
            <span className="text-[#F4C46C]">→</span>
            <span className="text-[#FFE29E] font-semibold">
              {currentNode?.title ?? nodeId}
            </span>
            <span className="text-[#F4C46C]">→</span>
            <span className="text-[#45E6A6]">
              {nextNode ? nextNode.title : 'String 3D Frontier'}
            </span>
          </div>
        </div>

        {/* Interactive 1-Minute Brain Warm-Up */}
        <div
          className="lg:col-span-6 instrument-panel p-4 flex flex-col justify-between gap-3"
          style={{
            borderColor: `${course.accent}38`,
            background:
              'linear-gradient(155deg, rgba(244, 196, 108, 0.08), rgba(11, 12, 18, 0.96))',
          }}
        >
          <div className="space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 shrink-0" style={{ color: course.accent }} />
                <span
                  className="font-mono-data text-[10.5px] uppercase tracking-[0.18em]"
                  style={{ color: course.accent }}
                >
                  1-Minute Brain Warm-Up
                </span>
              </div>
              <span className="font-mono-data text-[10px] text-[#727D94]">
                No Calculator Needed
              </span>
            </div>

            <p className="text-xs sm:text-sm text-[#F7F4EC] leading-relaxed">
              {guidance.warmUpPrompt}
            </p>

            {guidance.warmUpPromptTex && (
              <div className="rounded-lg bg-[#060609]/90 border border-[#F4C46C]/18 px-3 py-2 overflow-x-auto no-scrollbar max-w-full">
                <MathTex
                  tex={guidance.warmUpPromptTex}
                  className="text-xs sm:text-sm text-[#FFE29E]"
                />
              </div>
            )}
          </div>

          <div className="space-y-2.5 pt-1">
            <button
              type="button"
              onClick={() => setShowAnswer((prev) => !prev)}
              aria-expanded={showAnswer}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-mono-data font-medium border transition-all hover:brightness-110"
              style={{
                borderColor: `${course.accent}60`,
                backgroundColor: showAnswer ? `${course.accent}22` : '#060609',
                color: '#FFE29E',
              }}
            >
              {showAnswer ? (
                <>
                  <EyeOff className="w-3.5 h-3.5 text-[#F4C46C]" />
                  <span>Hide Answer</span>
                </>
              ) : (
                <>
                  <Eye className="w-3.5 h-3.5 text-[#F4C46C]" />
                  <span>Reveal Answer</span>
                </>
              )}
            </button>

            <AnimatePresence initial={false}>
              {showAnswer && (
                <motion.div
                  initial={reducedMotion ? false : { opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reducedMotion ? undefined : { opacity: 0, y: -4 }}
                  transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                  className="rounded-xl border border-[#45E6A6]/35 bg-[#45E6A6]/[0.08] p-3 space-y-1.5"
                >
                  <p className="text-xs text-[#F7F4EC] leading-relaxed">
                    <strong className="text-[#45E6A6]">Answer:</strong>{' '}
                    {guidance.warmUpAnswer}
                  </p>
                  {guidance.warmUpAnswerTex && (
                    <div className="overflow-x-auto no-scrollbar max-w-full">
                      <MathTex
                        tex={guidance.warmUpAnswerTex}
                        className="text-xs text-[#45E6A6]"
                      />
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* 3 Key Symbols Decoded Before You Start */}
      <div className="space-y-2.5 pt-1">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-[#F4C46C]" />
            <span className="font-mono-data text-[10.5px] uppercase tracking-[0.18em] text-[#F4C46C]">
              3 Key Symbols Translated Into Plain English
            </span>
          </div>
          <span className="text-[11px] text-[#727D94]">
            Quick decode before you dive in
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {guidance.keySymbols.map((sym) => (
            <div
              key={sym.id}
              className="instrument-panel p-3.5 space-y-2 border-[#F4C46C]/20 min-w-0"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="px-2.5 py-1 rounded-lg bg-[#060609] border border-[#F4C46C]/30 text-[#FFE29E] text-xs shrink-0 max-w-[155px] overflow-x-auto no-scrollbar">
                  <MathTex tex={sym.symbolTex} />
                </span>
                <span className="text-xs font-semibold text-[#F7F4EC] leading-tight">
                  {sym.name}
                </span>
              </div>

              <p className="text-xs text-[#A8B2C6] leading-relaxed">
                {sym.meaning}
              </p>

              <div className="rounded-lg bg-[#060609]/85 border border-[#F4C46C]/14 px-2.5 py-1.5 space-y-0.5 overflow-x-auto no-scrollbar max-w-full">
                <MathTex tex={sym.exampleTex} className="text-[11px] text-[#46D6E8]" />
                <p className="text-[10.5px] text-[#727D94] leading-snug">
                  {sym.exampleNote}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export interface LessonNextBridgeProps {
  courseId: CourseId;
  nodeId: string;
}

export function LessonNextBridge({
  courseId,
  nodeId,
}: LessonNextBridgeProps): JSX.Element {
  const [completedIds, setCompletedIds] = useState<string[]>(() => getCompletedNodes());

  useEffect(() => {
    const syncProgress = () => {
      setCompletedIds(getCompletedNodes());
    };
    syncProgress();
    window.addEventListener(PROGRESS_CHANGE_EVENT, syncProgress);
    window.addEventListener('storage', syncProgress);
    return () => {
      window.removeEventListener(PROGRESS_CHANGE_EVENT, syncProgress);
      window.removeEventListener('storage', syncProgress);
    };
  }, []);

  const course = COURSES[courseId];
  const guidance = useMemo(() => getNodeGuidance(nodeId), [nodeId]);
  const nodeMap = useMemo(
    () => new Map(CURRICULUM_NODES.map((n) => [n.id, n])),
    []
  );
  const currentNode = nodeMap.get(nodeId);
  const nextNode = guidance.nextNodeId ? nodeMap.get(guidance.nextNodeId) ?? null : null;
  const nextCourse = nextNode ? COURSES[nextNode.courseId] : null;
  const isCrossCourseJump = Boolean(nextNode && nextNode.courseId !== courseId);

  const courseNodes = useMemo(
    () => CURRICULUM_NODES.filter((n) => n.courseId === courseId),
    [courseId]
  );

  const isMastered = completedIds.includes(nodeId);
  const masteredCount = useMemo(
    () => courseNodes.filter((n) => completedIds.includes(n.id)).length,
    [courseNodes, completedIds]
  );

  const handleToggle = () => {
    const updated = toggleNodeCompleted(nodeId);
    setCompletedIds(updated);
  };

  return (
    <section
      aria-label="Lesson completion and next-step bridge"
      className="instrument-frame fiducial-frame p-5 sm:p-7 space-y-5 overflow-hidden"
      style={{
        borderColor: isMastered ? 'rgba(69, 230, 166, 0.5)' : `${course.accent}48`,
        background: isMastered
          ? 'linear-gradient(160deg, rgba(69, 230, 166, 0.08) 0%, rgba(11, 12, 18, 0.96) 55%)'
          : undefined,
      }}
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        {/* Story Connection & Unlock Preview */}
        <div className="space-y-2.5 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-mono-data text-[10.5px] uppercase tracking-[0.16em] border"
              style={{
                color: isMastered ? '#45E6A6' : course.accent,
                borderColor: isMastered ? 'rgba(69, 230, 166, 0.45)' : `${course.accent}50`,
                backgroundColor: isMastered ? 'rgba(69, 230, 166, 0.14)' : `${course.accent}15`,
              }}
            >
              <Trophy className="w-3.5 h-3.5" />
              <span>
                {isCrossCourseJump && nextCourse
                  ? `${course.title} Complete · ${nextCourse.title} Unlocked!`
                  : `Step ${guidance.stepNumber} of 9 Complete · ${masteredCount} / ${courseNodes.length} Mastered`}
              </span>
            </span>
          </div>

          <h3 className="font-serif-editorial text-2xl sm:text-3xl text-[#F7F4EC] leading-tight">
            {currentNode
              ? `What You Unlock After ${currentNode.title}`
              : 'Your Next Mathematical Milestone'}
          </h3>

          <p className="text-xs sm:text-sm text-[#A8B2C6] leading-relaxed">
            {guidance.nextTip}
          </p>
        </div>

        {/* Mastery Toggle + Next Lesson CTA */}
        <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row items-stretch sm:items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={handleToggle}
            aria-pressed={isMastered}
            className={`inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full text-xs font-mono-data font-semibold border transition-all ${
              isMastered
                ? 'bg-[#45E6A6]/18 text-[#45E6A6] border-[#45E6A6]/65 shadow-[0_0_24px_-6px_rgba(69,230,166,0.65)] hover:bg-[#45E6A6]/25'
                : 'bg-[#0B0C12] text-[#FFE29E] border-[#F4C46C]/45 hover:border-[#FFE29E] hover:bg-[#F4C46C]/12'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>
              {isMastered ? 'Mastered ✓' : 'Mark This Lesson Mastered'}
            </span>
          </button>

          {nextNode && nextCourse ? (
            <Link
              to={nextNode.route}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full text-xs font-semibold text-[#060609] hover:brightness-110 transition-all shadow-[0_0_26px_-6px_rgba(244,196,108,0.65)]"
              style={{
                background: `linear-gradient(135deg, ${nextCourse.accent}, #FFE29E)`,
              }}
            >
              <Sparkles className="w-3.5 h-3.5 shrink-0" />
              <span>
                {isCrossCourseJump
                  ? `Start ${nextCourse.title} Step 1: ${nextNode.title}`
                  : `Next: Step ${guidance.stepNumber + 1} · ${nextNode.title}`}
              </span>
              <ArrowRight className="w-3.5 h-3.5 shrink-0" />
            </Link>
          ) : (
            <Link
              to="/frontier"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full text-xs font-semibold text-[#060609] hover:brightness-110 transition-all shadow-[0_0_26px_-6px_rgba(244,196,108,0.7)]"
              style={{
                background: 'linear-gradient(135deg, #F4C46C, #FFE29E)',
              }}
            >
              <Orbit className="w-3.5 h-3.5 shrink-0" />
              <span>Launch 10D String Theory 3D Frontier</span>
              <ArrowRight className="w-3.5 h-3.5 shrink-0" />
            </Link>
          )}
        </div>
      </div>

      {/* Bottom Helpful Micro-Nav */}
      <div className="pt-3 border-t hairline-rule flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono-data text-[#727D94]">
        <Link
          to={`/course/${courseId}`}
          className="text-[#A8B2C6] hover:text-[#FFE29E] transition-colors"
        >
          ← Overview All 9 {course.title} Units
        </Link>
        <div className="flex flex-wrap items-center gap-4">
          <Link to="/textbook" className="text-[#A8B2C6] hover:text-[#FFE29E] transition-colors">
            FL B.E.S.T. Textbook
          </Link>
          <Link to="/map" className="text-[#A8B2C6] hover:text-[#46D6E8] transition-colors">
            36-Node Constellation
          </Link>
        </div>
      </div>
    </section>
  );
}
