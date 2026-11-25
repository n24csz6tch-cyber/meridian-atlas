import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BookOpen,
  Check,
  ChevronDown,
  ChevronUp,
  Compass,
  Layers,
  MapPin,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { COURSES, CURRICULUM_NODES, CurriculumNode } from '../data/curriculumGraph';
import { CourseId } from '../data/standards';
import {
  COURSE_ORDER,
  COURSE_SURVIVAL_GUIDES,
  COURSE_SYMBOL_GLOSSARY,
  getCompletedNodes,
  getNodeGuidance,
  PROGRESS_CHANGE_EVENT,
  toggleNodeCompleted,
} from '../data/studentGuidance';
import { MathTex } from './MathTex';

export interface CourseJourneySidebarProps {
  courseId: CourseId;
  activeNodeId?: string;
}

type SidebarTab = 'path' | 'survival' | 'symbols';

export function CourseJourneySidebar({
  courseId,
  activeNodeId,
}: CourseJourneySidebarProps): JSX.Element {
  const [selectedCourseId, setSelectedCourseId] = useState<CourseId>(courseId);
  const [activeTab, setActiveTab] = useState<SidebarTab>('path');
  const [mobileExpanded, setMobileExpanded] = useState<boolean>(false);
  const [completedIds, setCompletedIds] = useState<string[]>(() => getCompletedNodes());

  useEffect(() => {
    setSelectedCourseId(courseId);
  }, [courseId]);

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

  const selectedCourse = COURSES[selectedCourseId];

  const courseNodes = useMemo<CurriculumNode[]>(
    () => CURRICULUM_NODES.filter((n) => n.courseId === selectedCourseId),
    [selectedCourseId]
  );

  const nodeMap = useMemo(
    () => new Map(CURRICULUM_NODES.map((n) => [n.id, n])),
    []
  );

  const completedSet = useMemo(() => new Set(completedIds), [completedIds]);

  const masteredInCourseCount = useMemo(
    () => courseNodes.filter((n) => completedSet.has(n.id)).length,
    [courseNodes, completedSet]
  );

  const progressPercent =
    courseNodes.length > 0
      ? Math.round((masteredInCourseCount / courseNodes.length) * 100)
      : 0;

  // Determine the focus node for the "From X -> Here -> Next Y" micro-breadcrumb
  const focusNode = useMemo(() => {
    if (activeNodeId) {
      const match = courseNodes.find((n) => n.id === activeNodeId);
      if (match) return match;
    }
    const firstUnfinished = courseNodes.find((n) => !completedSet.has(n.id));
    return firstUnfinished ?? courseNodes[0];
  }, [activeNodeId, courseNodes, completedSet]);

  const focusGuidance = useMemo(
    () => (focusNode ? getNodeGuidance(focusNode.id) : null),
    [focusNode]
  );

  const prereqNode = focusGuidance?.prerequisiteNodeId
    ? nodeMap.get(focusGuidance.prerequisiteNodeId) ?? null
    : null;

  const nextNode = focusGuidance?.nextNodeId
    ? nodeMap.get(focusGuidance.nextNodeId) ?? null
    : null;

  const survivalRules = COURSE_SURVIVAL_GUIDES[selectedCourseId];
  const courseSymbols = COURSE_SYMBOL_GLOSSARY[selectedCourseId];
  const activeLessonSymbols = useMemo(() => {
    if (!activeNodeId) return null;
    const activeNode = nodeMap.get(activeNodeId);
    if (!activeNode || activeNode.courseId !== selectedCourseId) return null;
    return getNodeGuidance(activeNodeId).keySymbols;
  }, [activeNodeId, nodeMap, selectedCourseId]);

  const activeNodeRecord = activeNodeId ? nodeMap.get(activeNodeId) : undefined;

  const handleToggleMastery = (nodeId: string) => {
    const updated = toggleNodeCompleted(nodeId);
    setCompletedIds(updated);
  };

  return (
    <aside
      aria-label="Course Journey and Student Survival Guide"
      className="w-full min-w-0 max-w-full lg:sticky lg:top-20 z-20"
    >
      <div className="instrument-frame obsidian-glass rounded-2xl overflow-hidden flex flex-col lg:max-h-[calc(100vh-6rem)]">
        {/* Top Golden Hairline Accent */}
        <div
          aria-hidden="true"
          className="h-[2px] w-full shrink-0"
          style={{
            background: `linear-gradient(90deg, transparent, #F4C46C 30%, ${selectedCourse.accent} 70%, transparent)`,
          }}
        />

        {/* Mobile Compact Collapsible Bar (< lg) */}
        <div className="lg:hidden p-3.5 flex items-center justify-between gap-2.5 border-b border-[#F4C46C]/15">
          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <span
                className="px-2 py-0.5 rounded-full font-mono-data text-[10px] font-semibold border shrink-0"
                style={{
                  color: selectedCourse.accent,
                  borderColor: `${selectedCourse.accent}55`,
                  backgroundColor: `${selectedCourse.accent}18`,
                }}
              >
                {selectedCourse.shortTitle} · {masteredInCourseCount}/{courseNodes.length}
              </span>
              <span className="text-[11px] font-mono-data text-[#FFE29E] truncate">
                {activeNodeRecord
                  ? `${activeNodeRecord.code} · ${activeNodeRecord.title}`
                  : 'Journey & Survival Guide'}
              </span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-[#060609] border border-[#F4C46C]/15 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${progressPercent}%`,
                  background: `linear-gradient(90deg, #F4C46C, ${selectedCourse.accent})`,
                }}
              />
            </div>
          </div>

          <button
            type="button"
            onClick={() => setMobileExpanded((prev) => !prev)}
            aria-expanded={mobileExpanded}
            className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-mono-data border border-[#F4C46C]/35 bg-[#11131C] text-[#FFE29E] hover:border-[#F4C46C]/65 transition-colors"
          >
            <span>{mobileExpanded ? 'Hide Guide' : 'Course Guide'}</span>
            {mobileExpanded ? (
              <ChevronUp className="w-3.5 h-3.5 text-[#F4C46C]" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-[#F4C46C]" />
            )}
          </button>
        </div>

        {/* Main Docked Body (always shown on lg+, toggled on mobile) */}
        <div
          className={`${
            mobileExpanded ? 'flex' : 'hidden lg:flex'
          } flex-col min-h-0 flex-1 overflow-hidden`}
        >
          {/* Course Switcher Pill Bar + Live X/9 Progress */}
          <div className="p-3.5 sm:p-4 space-y-3 border-b border-[#F4C46C]/15 shrink-0 bg-[#0B0C12]/70">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 min-w-0">
                <Compass className="w-3.5 h-3.5 text-[#F4C46C] shrink-0" />
                <span className="font-mono-data text-[10px] uppercase tracking-[0.18em] text-[#F4C46C] truncate">
                  Course Navigator
                </span>
              </div>
              <Link
                to={`/course/${selectedCourseId}`}
                className="inline-flex items-center gap-1 text-[10.5px] font-mono-data text-[#FFE29E] hover:text-[#F7F4EC] hover:underline shrink-0"
              >
                <span>{selectedCourse.shortTitle} Hub</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {/* 4-Course Pill Selector (Algebra 1 docked first) */}
            <div
              role="group"
              aria-label="Select course to inspect"
              className="grid grid-cols-4 gap-1"
            >
              {COURSE_ORDER.map((cid) => {
                const meta = COURSES[cid];
                const isSelected = cid === selectedCourseId;
                return (
                  <button
                    key={cid}
                    type="button"
                    onClick={() => setSelectedCourseId(cid)}
                    className={`px-1.5 py-1.5 rounded-lg text-[10.5px] font-mono-data text-center transition-all border truncate ${
                      isSelected
                        ? 'text-[#060609] font-semibold'
                        : 'bg-[#060609]/80 text-[#A8B2C6] border-[#F4C46C]/15 hover:text-[#F7F4EC] hover:border-[#F4C46C]/40'
                    }`}
                    style={
                      isSelected
                        ? {
                            backgroundColor: meta.accent,
                            borderColor: meta.accent,
                            boxShadow: `0 0 14px -4px ${meta.accent}`,
                          }
                        : undefined
                    }
                    title={meta.title}
                  >
                    {meta.shortTitle}
                  </button>
                );
              })}
            </div>

            {/* Course Title + X / 9 Mastery Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between gap-2 text-xs">
                <span className="font-serif-editorial text-lg text-[#F7F4EC] truncate">
                  {selectedCourse.title}
                </span>
                <span
                  className="font-mono-data text-[11px] font-semibold px-2 py-0.5 rounded-full border shrink-0"
                  style={{
                    color: selectedCourse.accent,
                    borderColor: `${selectedCourse.accent}45`,
                    backgroundColor: `${selectedCourse.accent}12`,
                  }}
                >
                  {masteredInCourseCount} / {courseNodes.length} Mastered
                </span>
              </div>
              <div
                aria-label={`${selectedCourse.title} mastery progress: ${masteredInCourseCount} of ${courseNodes.length}`}
                className="h-2 w-full rounded-full bg-[#060609] border border-[#F4C46C]/20 overflow-hidden"
              >
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${progressPercent}%`,
                    background: `linear-gradient(90deg, #F4C46C, ${selectedCourse.accent})`,
                    boxShadow: `0 0 12px ${selectedCourse.accent}88`,
                  }}
                />
              </div>
            </div>

            {/* 3 Clean Sub-Tabs: Path (9) | Survival | Symbols */}
            <div
              role="tablist"
              aria-label="Sidebar guidance views"
              className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-[#060609]/90 border border-[#F4C46C]/18"
            >
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'path'}
                onClick={() => setActiveTab('path')}
                className={`flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg text-[11px] font-mono-data transition-all ${
                  activeTab === 'path'
                    ? 'bg-[#F4C46C]/18 text-[#FFE29E] border border-[#F4C46C]/45 shadow-[inset_0_1px_0_rgba(255,234,186,0.18)]'
                    : 'text-[#A8B2C6] border border-transparent hover:text-[#F7F4EC]'
                }`}
              >
                <Layers className="w-3 h-3 shrink-0" />
                <span className="truncate">Path (9)</span>
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'survival'}
                onClick={() => setActiveTab('survival')}
                className={`flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg text-[11px] font-mono-data transition-all ${
                  activeTab === 'survival'
                    ? 'bg-[#F4C46C]/18 text-[#FFE29E] border border-[#F4C46C]/45 shadow-[inset_0_1px_0_rgba(255,234,186,0.18)]'
                    : 'text-[#A8B2C6] border border-transparent hover:text-[#F7F4EC]'
                }`}
              >
                <ShieldCheck className="w-3 h-3 shrink-0" />
                <span className="truncate">Survival</span>
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'symbols'}
                onClick={() => setActiveTab('symbols')}
                className={`flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg text-[11px] font-mono-data transition-all ${
                  activeTab === 'symbols'
                    ? 'bg-[#F4C46C]/18 text-[#FFE29E] border border-[#F4C46C]/45 shadow-[inset_0_1px_0_rgba(255,234,186,0.18)]'
                    : 'text-[#A8B2C6] border border-transparent hover:text-[#F7F4EC]'
                }`}
              >
                <Sparkles className="w-3 h-3 shrink-0" />
                <span className="truncate">Symbols</span>
              </button>
            </div>
          </div>

          {/* Scrollable Tab Content Area */}
          <div className="p-3.5 sm:p-4 overflow-y-auto min-h-0 flex-1 space-y-3">
            {/* TAB 1: PATH (9) */}
            {activeTab === 'path' && (
              <div role="tabpanel" aria-label="Course learning path" className="space-y-3">
                {/* Micro-Breadcrumbs Orientation Card: From X -> Here -> Next Y */}
                {focusNode && focusGuidance && (
                  <div className="instrument-panel p-2.5 space-y-1.5 border-[#F4C46C]/25 bg-[#11131C]/90">
                    <div className="flex items-center gap-1.5 text-[10px] font-mono-data uppercase tracking-wider text-[#F4C46C]">
                      <MapPin className="w-3 h-3 shrink-0" />
                      <span>Where You Fit</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-1 text-[11px] leading-snug">
                      <span className="text-[#727D94]">From</span>
                      {prereqNode ? (
                        <Link
                          to={prereqNode.route}
                          className="text-[#A8B2C6] hover:text-[#FFE29E] underline decoration-[#F4C46C]/30 underline-offset-2"
                        >
                          {prereqNode.title}
                        </Link>
                      ) : (
                        <span className="text-[#A8B2C6]">
                          {focusGuidance.prerequisiteTitle}
                        </span>
                      )}
                      <span className="text-[#F4C46C]">→</span>
                      <span
                        className="font-semibold px-1.5 py-0.5 rounded bg-[#F4C46C]/15 text-[#FFE29E]"
                      >
                        Here: {focusNode.title}
                      </span>
                      <span className="text-[#F4C46C]">→</span>
                      <span className="text-[#727D94]">Next</span>
                      {nextNode ? (
                        <Link
                          to={nextNode.route}
                          className="text-[#45E6A6] hover:underline underline-offset-2"
                        >
                          {nextNode.title}
                        </Link>
                      ) : (
                        <Link
                          to="/frontier"
                          className="text-[#FFE29E] hover:underline underline-offset-2"
                        >
                          String 3D Frontier
                        </Link>
                      )}
                    </div>
                  </div>
                )}

                {/* Ordered 9-Unit List (01..09) */}
                <ol className="space-y-1.5">
                  {courseNodes.map((node, index) => {
                    const stepStr = String(index + 1).padStart(2, '0');
                    const isActive = node.id === activeNodeId;
                    const isDone = completedSet.has(node.id);
                    const g = getNodeGuidance(node.id);
                    const prevUnit = g.prerequisiteNodeId
                      ? nodeMap.get(g.prerequisiteNodeId)
                      : null;
                    const nextUnit = g.nextNodeId ? nodeMap.get(g.nextNodeId) : null;

                    return (
                      <li
                        key={node.id}
                        className={`rounded-xl border transition-all p-2.5 ${
                          isActive
                            ? 'bg-[#F4C46C]/[0.11]'
                            : isDone
                              ? 'bg-[#45E6A6]/[0.04] border-[#45E6A6]/25 hover:border-[#45E6A6]/45'
                              : 'bg-[#0B0C12]/85 border-[#F4C46C]/12 hover:border-[#F4C46C]/35'
                        }`}
                        style={
                          isActive
                            ? {
                                borderColor: selectedCourse.accent,
                                boxShadow: `0 0 18px -8px ${selectedCourse.accent}`,
                              }
                            : undefined
                        }
                      >
                        <div className="flex items-start gap-2">
                          {/* Interactive Mastery Checkmark */}
                          <button
                            type="button"
                            onClick={() => handleToggleMastery(node.id)}
                            aria-label={
                              isDone
                                ? `Unmark ${node.title} as mastered`
                                : `Mark ${node.title} as mastered`
                            }
                            aria-pressed={isDone}
                            className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-all ${
                              isDone
                                ? 'bg-[#45E6A6] border-[#45E6A6] text-[#060609] shadow-[0_0_10px_rgba(69,230,166,0.45)]'
                                : 'bg-[#060609] border-[#F4C46C]/30 text-transparent hover:border-[#F4C46C]'
                            }`}
                          >
                            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                          </button>

                          {/* Lesson Link & Micro-Metadata */}
                          <Link
                            to={node.route}
                            onClick={() => setMobileExpanded(false)}
                            className="min-w-0 flex-1 group block"
                          >
                            <div className="flex items-center justify-between gap-1.5">
                              <div className="flex items-center gap-1.5 min-w-0">
                                <span
                                  className="font-mono-data text-[10px] font-semibold shrink-0"
                                  style={{
                                    color: isActive ? selectedCourse.accent : '#F4C46C',
                                  }}
                                >
                                  {stepStr}
                                </span>
                                <span
                                  className={`text-xs font-medium truncate transition-colors ${
                                    isActive
                                      ? 'text-[#F7F4EC] font-semibold'
                                      : 'text-[#F7F4EC]/90 group-hover:text-[#FFE29E]'
                                  }`}
                                >
                                  {node.title}
                                </span>
                              </div>
                              <span className="font-mono-data text-[9.5px] text-[#727D94] shrink-0">
                                {node.symbol}
                              </span>
                            </div>

                            {isActive && (
                              <p className="mt-1 text-[10.5px] font-mono-data text-[#A8B2C6] leading-snug">
                                From {prevUnit ? prevUnit.title : 'Foundations'} →{' '}
                                <span className="text-[#FFE29E]">Here</span> → Next{' '}
                                {nextUnit ? nextUnit.title : 'String 3D Frontier'}
                              </p>
                            )}
                          </Link>
                        </div>
                      </li>
                    );
                  })}
                </ol>

                {/* Quick Portal to FL Textbook */}
                <div className="pt-1 flex items-center justify-between gap-2 border-t border-[#F4C46C]/12">
                  <Link
                    to="/textbook"
                    className="inline-flex items-center gap-1.5 text-[11px] font-mono-data text-[#A8B2C6] hover:text-[#FFE29E] transition-colors py-1"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-[#F4C46C]" />
                    <span>Open FL B.E.S.T. Textbook</span>
                  </Link>
                  <Link
                    to={`/course/${selectedCourseId}`}
                    className="text-[11px] font-mono-data hover:underline py-1"
                    style={{ color: selectedCourse.accent }}
                  >
                    All {courseNodes.length} Units →
                  </Link>
                </div>
              </div>
            )}

            {/* TAB 2: SURVIVAL CHEAT-SHEET */}
            {activeTab === 'survival' && (
              <div role="tabpanel" aria-label="Course survival cheat-sheet" className="space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[11px] text-[#A8B2C6] leading-snug">
                    Fast formulas &amp; trap-dodgers for{' '}
                    <strong className="text-[#FFE29E]">{selectedCourse.title}</strong>.
                  </p>
                  <span className="font-mono-data text-[10px] text-[#F4C46C] shrink-0">
                    {survivalRules.length} Keys
                  </span>
                </div>

                {survivalRules.map((rule) => (
                  <div
                    key={rule.id}
                    className="instrument-panel p-3 space-y-2 border-[#F4C46C]/20"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-xs font-semibold text-[#F7F4EC] leading-snug">
                        {rule.title}
                      </h4>
                      <span
                        className="px-2 py-0.5 rounded-full text-[9.5px] font-mono-data border shrink-0"
                        style={{
                          color: selectedCourse.accent,
                          borderColor: `${selectedCourse.accent}45`,
                          backgroundColor: `${selectedCourse.accent}14`,
                        }}
                      >
                        {rule.badge}
                      </span>
                    </div>

                    <div className="rounded-lg bg-[#060609]/95 border border-[#F4C46C]/15 px-2.5 py-2 overflow-x-auto no-scrollbar max-w-full">
                      <MathTex tex={rule.tex} className="text-[11.5px] text-[#FFE29E]" />
                    </div>

                    <p className="text-[11.5px] text-[#A8B2C6] leading-relaxed">
                      {rule.plainEnglish}
                    </p>

                    <p className="text-[10.5px] font-mono-data text-[#45E6A6] bg-[#45E6A6]/[0.06] border border-[#45E6A6]/20 rounded-lg px-2 py-1 leading-snug">
                      Tip: {rule.quickNote}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* TAB 3: PLAIN-ENGLISH SYMBOL DECODER */}
            {activeTab === 'symbols' && (
              <div role="tabpanel" aria-label="Plain-English symbol decoder" className="space-y-3">
                {activeLessonSymbols && (
                  <div className="space-y-2">
                    <span className="font-mono-data text-[10px] uppercase tracking-wider text-[#F4C46C] block">
                      In This Lesson ({activeNodeRecord?.code})
                    </span>
                    {activeLessonSymbols.map((sym) => (
                      <div
                        key={sym.id}
                        className="instrument-panel p-2.5 space-y-1.5 border-[#F4C46C]/35 bg-[#F4C46C]/[0.05]"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="px-2 py-1 rounded-lg bg-[#060609] border border-[#F4C46C]/30 text-[#FFE29E] text-xs shrink-0 max-w-[140px] overflow-x-auto no-scrollbar">
                            <MathTex tex={sym.symbolTex} />
                          </span>
                          <span className="text-xs font-semibold text-[#F7F4EC] leading-tight">
                            {sym.name}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#A8B2C6] leading-relaxed">
                          {sym.meaning}
                        </p>
                        <div className="rounded-md bg-[#060609]/85 border border-[#F4C46C]/12 px-2 py-1.5 space-y-0.5 overflow-x-auto no-scrollbar max-w-full">
                          <MathTex tex={sym.exampleTex} className="text-[11px] text-[#46D6E8]" />
                          <p className="text-[10px] text-[#727D94] leading-snug">
                            {sym.exampleNote}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="space-y-2">
                  <span className="font-mono-data text-[10px] uppercase tracking-wider text-[#A8B2C6] block">
                    {selectedCourse.title} Symbol Decoder
                  </span>
                  {courseSymbols.map((sym) => (
                    <div
                      key={sym.id}
                      className="instrument-panel p-2.5 space-y-1.5 border-[#F4C46C]/18"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="px-2 py-1 rounded-lg bg-[#060609] border border-[#F4C46C]/25 text-[#FFE29E] text-xs shrink-0 max-w-[140px] overflow-x-auto no-scrollbar">
                          <MathTex tex={sym.symbolTex} />
                        </span>
                        <span className="text-xs font-semibold text-[#F7F4EC] leading-tight">
                          {sym.name}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#A8B2C6] leading-relaxed">
                        {sym.meaning}
                      </p>
                      <div className="rounded-md bg-[#060609]/85 border border-[#F4C46C]/12 px-2 py-1.5 space-y-0.5 overflow-x-auto no-scrollbar max-w-full">
                        <MathTex tex={sym.exampleTex} className="text-[11px] text-[#46D6E8]" />
                        <p className="text-[10px] text-[#727D94] leading-snug">
                          {sym.exampleNote}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
