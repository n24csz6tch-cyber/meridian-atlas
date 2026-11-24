import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  AlertTriangle,
  ArrowRight,
  Atom,
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Compass,
  ExternalLink,
  Layers,
  Pause,
  Play,
  Search,
  Sparkles,
  X,
} from 'lucide-react';
import { AtlasShell } from '../components/AtlasShell';
import { MathTex } from '../components/MathTex';
import { PracticeEngine } from '../components/PracticeEngine';
import { COURSES } from '../data/curriculumGraph';
import {
  FLORIDA_COURSE_TEXTBOOK_META,
  FLORIDA_MTR_HABITS,
  FLORIDA_TEXTBOOK_CHAPTERS,
  FloridaTextbookChapter,
} from '../data/floridaTextbookGuide';
import { CONSULTED_DATE, CourseId, FLDOE_SOURCES, VERIFIED_STANDARDS } from '../data/standards';
import { EquationMiniVisual } from '../visuals/equations/EquationMiniVisual';
import { TopicVisualCanvas } from '../visuals/topics/TopicVisualCanvas';

const COURSE_ORDER: CourseId[] = ['algebra-1', 'geometry', 'algebra-2', 'precalculus'];

function isValidCourseId(val: string | null): val is CourseId {
  return val === 'algebra-1' || val === 'geometry' || val === 'algebra-2' || val === 'precalculus';
}

export function FloridaTextbookPage() {
  const reducedMotion = useReducedMotion();
  const [searchParams, setSearchParams] = useSearchParams();

  const initialCourse = isValidCourseId(searchParams.get('course'))
    ? (searchParams.get('course') as CourseId)
    : 'algebra-1';

  const [selectedCourse, setSelectedCourse] = useState<CourseId>(initialCourse);
  const [chapterId, setChapterId] = useState<string>(() => {
    const requested = searchParams.get('chapter');
    if (requested && FLORIDA_TEXTBOOK_CHAPTERS.some((c) => c.id === requested)) {
      return requested;
    }
    return (
      FLORIDA_TEXTBOOK_CHAPTERS.find((c) => c.courseId === initialCourse)?.id ??
      FLORIDA_TEXTBOOK_CHAPTERS[0].id
    );
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [exampleStepIdx, setExampleStepIdx] = useState(0);
  const [autoPlayExample, setAutoPlayExample] = useState(false);
  const [selectedMtrNumber, setSelectedMtrNumber] = useState<number>(5);

  const courseChapters = useMemo(
    () =>
      FLORIDA_TEXTBOOK_CHAPTERS.filter((ch) => ch.courseId === selectedCourse).sort(
        (a, b) => a.chapterNumber - b.chapterNumber
      ),
    [selectedCourse]
  );

  const activeChapter: FloridaTextbookChapter = useMemo(() => {
    return (
      courseChapters.find((ch) => ch.id === chapterId) ??
      courseChapters[0] ??
      FLORIDA_TEXTBOOK_CHAPTERS[0]
    );
  }, [courseChapters, chapterId]);

  const course = COURSES[selectedCourse];
  const textbookMeta = FLORIDA_COURSE_TEXTBOOK_META[selectedCourse];

  // Sync URL query params cleanly when user switches courses or chapters
  useEffect(() => {
    const nextCourse = activeChapter.courseId;
    if (searchParams.get('course') !== nextCourse || searchParams.get('chapter') !== activeChapter.id) {
      setSearchParams({ course: nextCourse, chapter: activeChapter.id }, { replace: true });
    }
  }, [activeChapter.courseId, activeChapter.id, searchParams, setSearchParams]);

  // Reset worked example playback and sync highlighted MTR habit when changing chapter
  useEffect(() => {
    setExampleStepIdx(0);
    setAutoPlayExample(false);
    const match = activeChapter.mtrFocus.match(/MTR\.(\d)\.1/);
    if (match) {
      setSelectedMtrNumber(Number(match[1]));
    }
  }, [activeChapter.id, activeChapter.mtrFocus]);

  const totalExampleSteps = activeChapter.workedExample.steps.length;

  useEffect(() => {
    if (!autoPlayExample) return;
    const id = window.setInterval(() => {
      setExampleStepIdx((prev) => (prev + 1) % totalExampleSteps);
    }, 2700);
    return () => window.clearInterval(id);
  }, [autoPlayExample, totalExampleSteps]);

  // Global search across all 28 chapters & benchmarks
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    return FLORIDA_TEXTBOOK_CHAPTERS.filter((ch) => {
      const stdMatch = ch.benchmarks.some((code) => {
        const std = VERIFIED_STANDARDS[code];
        return (
          code.toLowerCase().includes(q) ||
          (std?.description.toLowerCase().includes(q) ?? false) ||
          (std?.strand.toLowerCase().includes(q) ?? false)
        );
      });
      return (
        stdMatch ||
        ch.title.toLowerCase().includes(q) ||
        ch.subtitle.toLowerCase().includes(q) ||
        ch.bigIdea.toLowerCase().includes(q) ||
        ch.frontierConnection.toLowerCase().includes(q) ||
        COURSES[ch.courseId].title.toLowerCase().includes(q)
      );
    });
  }, [searchQuery]);

  const handleSelectCourse = (cid: CourseId) => {
    setSelectedCourse(cid);
    const first = FLORIDA_TEXTBOOK_CHAPTERS.find((c) => c.courseId === cid);
    if (first) setChapterId(first.id);
  };

  const handleSelectChapter = (ch: FloridaTextbookChapter) => {
    setSelectedCourse(ch.courseId);
    setChapterId(ch.id);
  };

  const activeIdx = courseChapters.findIndex((c) => c.id === activeChapter.id);
  const prevChapter = activeIdx > 0 ? courseChapters[activeIdx - 1] : null;
  const nextChapter =
    activeIdx >= 0 && activeIdx < courseChapters.length - 1 ? courseChapters[activeIdx + 1] : null;

  const safeStepIdx = Math.min(exampleStepIdx, Math.max(0, totalExampleSteps - 1));
  const currentWorkedStep = activeChapter.workedExample.steps[safeStepIdx];
  const activeMtrHabit =
    FLORIDA_MTR_HABITS.find((m) => m.number === selectedMtrNumber) ?? FLORIDA_MTR_HABITS[0];

  return (
    <AtlasShell activeCourse={selectedCourse}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-10">
        {/* HERO COMMAND HEADER */}
        <header className="instrument-frame p-5 sm:p-8 space-y-6 border-[rgba(244,196,108,0.24)] relative overflow-hidden">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-24 right-0 w-96 h-96 rounded-full opacity-20 blur-3xl"
            style={{ background: `radial-gradient(circle, ${course.accent}, transparent 70%)` }}
          />

          <div className="relative z-10 flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-[#F4C46C]/40 bg-[#F4C46C]/10 font-mono-data text-[11px] text-[#FFE29E]">
              <BookOpen className="w-3.5 h-3.5 text-[#F4C46C]" />
              <span>Florida B.E.S.T. Interactive Textbook · 28 Chapters · B1G-M Aligned</span>
            </div>

            <div className="flex flex-wrap items-center gap-3 font-mono-data text-[11px]">
              <a
                href={FLDOE_SOURCES.bestPdf.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-[#A8B2C6] hover:text-[#FFE29E] transition-colors"
              >
                FLDOE B.E.S.T. PDF <ExternalLink className="w-3 h-3" />
              </a>
              <a
                href={textbookMeta.cpalmsUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 hover:underline transition-colors"
                style={{ color: course.accent }}
              >
                CPALMS {textbookMeta.cpalmsCode} <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-end">
            <div className="lg:col-span-7 space-y-2.5">
              <h1 className="font-serif-editorial text-3xl sm:text-5xl text-[#F7F4EC] leading-tight">
                Florida High School Math —{' '}
                <span style={{ color: course.accent }}>Alive in Real Time</span>
              </h1>
              <p className="text-sm sm:text-base text-[#A8B2C6] leading-relaxed">
                Every chapter from Florida&apos;s{' '}
                <strong className="text-[#F7F4EC]">
                  Algebra 1, Geometry, Algebra 2 &amp; Precalculus Honors
                </strong>{' '}
                sequence rebuilt with live 60fps geometry, animated EOC worked examples, instant
                drills, and bridges to String Theory &amp; AI.
              </p>
            </div>

            {/* Search chapters & B.E.S.T. benchmarks */}
            <div className="lg:col-span-5 space-y-2">
              <label htmlFor="fl-textbook-search" className="sr-only">
                Search Florida B.E.S.T. chapters or benchmark codes
              </label>
              <div className="relative">
                <Search className="w-4 h-4 text-[#F4C46C] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="fl-textbook-search"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search chapter, formula, or code (e.g. MA.912.GR.7)..."
                  className="w-full pl-10 pr-9 py-2.5 rounded-full bg-[#060609] border border-[rgba(244,196,108,0.26)] text-xs sm:text-sm text-[#F7F4EC] placeholder:text-[#727D94] focus:border-[#F4C46C]"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    aria-label="Clear textbook search"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A8B2C6] hover:text-[#F7F4EC]"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              <p className="font-mono-data text-[10.5px] text-[#727D94] px-2">
                {textbookMeta.audience} · Consulted {CONSULTED_DATE}
              </p>
            </div>
          </div>

          {/* Live Search Matches Drawer */}
          <AnimatePresence initial={false}>
            {searchQuery.trim().length > 0 && (
              <motion.div
                initial={reducedMotion ? false : { opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reducedMotion ? undefined : { opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
                className="relative z-10 p-4 rounded-xl bg-[#0B0C12] border border-[rgba(244,196,108,0.28)] space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono-data text-[11px] uppercase tracking-wider text-[#F4C46C]">
                    Search Results across all 28 Chapters ({searchResults.length})
                  </span>
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="font-mono-data text-[11px] text-[#A8B2C6] hover:text-[#F7F4EC]"
                  >
                    Close
                  </button>
                </div>

                {searchResults.length === 0 ? (
                  <p className="text-xs text-[#A8B2C6]">
                    No chapters matched &ldquo;{searchQuery}&rdquo;. Try keywords like{' '}
                    <span className="text-[#FFE29E]">quadratics</span>,{' '}
                    <span className="text-[#46D6E8]">triangles</span>,{' '}
                    <span className="text-[#45E6A6]">logarithms</span>, or{' '}
                    <span className="text-[#FF8563]">MA.912.T.1.3</span>.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-64 overflow-y-auto pr-1">
                    {searchResults.map((res) => {
                      const rc = COURSES[res.courseId];
                      return (
                        <button
                          key={res.id}
                          type="button"
                          onClick={() => {
                            handleSelectChapter(res);
                            setSearchQuery('');
                          }}
                          className="text-left p-3 rounded-xl bg-[#11131C] border border-white/10 hover:border-[#F4C46C]/50 transition-all space-y-1"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span
                              className="font-mono-data text-[10px] uppercase"
                              style={{ color: rc.accent }}
                            >
                              {rc.shortTitle} · Ch {res.chapterNumber}
                            </span>
                            <span className="font-mono-data text-[10px] text-[#727D94]">
                              {res.benchmarks[0]}
                            </span>
                          </div>
                          <p className="text-xs font-semibold text-[#F7F4EC] line-clamp-1">
                            {res.title}
                          </p>
                          <p className="text-[11px] text-[#A8B2C6] line-clamp-1">{res.subtitle}</p>
                        </button>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* 4-COURSE SELECTOR TABS */}
          <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
            {COURSE_ORDER.map((cid) => {
              const c = COURSES[cid];
              const meta = FLORIDA_COURSE_TEXTBOOK_META[cid];
              const isSelected = selectedCourse === cid;
              return (
                <button
                  key={cid}
                  type="button"
                  onClick={() => handleSelectCourse(cid)}
                  className={`text-left p-3.5 rounded-xl border transition-all flex flex-col justify-between gap-2 ${
                    isSelected
                      ? 'bg-[#11131C]'
                      : 'bg-[#08090F] border-white/10 hover:border-[rgba(244,196,108,0.28)]'
                  }`}
                  style={
                    isSelected
                      ? {
                          borderColor: c.accent,
                          boxShadow: `0 0 24px -10px ${c.accent}`,
                        }
                      : undefined
                  }
                >
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className="font-mono-data text-[10.5px] uppercase tracking-wider font-semibold"
                      style={{ color: c.accent }}
                    >
                      {c.shortTitle} · {meta.cpalmsCode}
                    </span>
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{
                        backgroundColor: isSelected ? c.accent : 'rgba(255,255,255,0.14)',
                        boxShadow: isSelected ? `0 0 10px ${c.accent}` : undefined,
                      }}
                    />
                  </div>
                  <div>
                    <p className="font-serif-editorial text-lg text-[#F7F4EC] leading-snug">
                      {c.title}
                    </p>
                    <p className="text-[11px] text-[#A8B2C6] mt-0.5">7 Interactive Chapters</p>
                  </div>
                </button>
              );
            })}
          </div>
        </header>

        {/* CHAPTER RAIL (7 CHAPTERS FOR ACTIVE COURSE) */}
        <section aria-label={`${course.title} chapter selector`} className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4" style={{ color: course.accent }} />
              <span className="font-mono-data text-xs uppercase tracking-wider text-[#FFE29E]">
                {textbookMeta.b1gmLabel}
              </span>
            </div>

            <Link
              to={`/course/${selectedCourse}`}
              className="inline-flex items-center gap-1.5 font-mono-data text-xs hover:underline"
              style={{ color: course.accent }}
            >
              View All {course.title} 9 Deep Units <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
            {courseChapters.map((ch) => {
              const active = ch.id === activeChapter.id;
              return (
                <button
                  key={ch.id}
                  type="button"
                  onClick={() => handleSelectChapter(ch)}
                  className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between gap-1.5 ${
                    active
                      ? 'bg-[#171A26] text-[#F7F4EC]'
                      : 'bg-[#0B0C12] border-white/10 text-[#A8B2C6] hover:text-[#F7F4EC] hover:border-[rgba(244,196,108,0.28)]'
                  }`}
                  style={
                    active
                      ? { borderColor: course.accent, boxShadow: `0 0 18px -8px ${course.accent}` }
                      : undefined
                  }
                >
                  <span
                    className="font-mono-data text-[10px] uppercase tracking-wider"
                    style={{ color: active ? course.accent : '#727D94' }}
                  >
                    Chapter 0{ch.chapterNumber}
                  </span>
                  <span className="text-xs font-medium leading-snug line-clamp-2">{ch.title}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* ACTIVE CHAPTER OBSERVATORY WORKSPACE */}
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={activeChapter.id}
            initial={reducedMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reducedMotion ? undefined : { opacity: 0, y: -8 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-8"
          >
            {/* 1. CHAPTER OVERVIEW, BIG IDEA & STANDARDS */}
            <section className="instrument-frame p-5 sm:p-7 space-y-6">
              <div className="flex flex-wrap items-start justify-between gap-4 border-b hairline-rule pb-5">
                <div className="space-y-2 max-w-3xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className="px-3 py-1 rounded-full font-mono-data text-[11px] font-semibold border"
                      style={{
                        color: course.accent,
                        borderColor: `${course.accent}55`,
                        backgroundColor: `${course.accent}18`,
                      }}
                    >
                      {course.shortTitle} · CHAPTER 0{activeChapter.chapterNumber}
                    </span>
                    <span className="px-3 py-1 rounded-full font-mono-data text-[11px] border border-[#F4C46C]/35 bg-[#F4C46C]/10 text-[#FFE29E]">
                      {activeChapter.mtrFocus}
                    </span>
                  </div>
                  <h2 className="font-serif-editorial text-2xl sm:text-4xl text-[#F7F4EC] leading-tight">
                    {activeChapter.title}
                  </h2>
                  <p className="text-sm text-[#A8B2C6]">{activeChapter.subtitle}</p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <Link
                    to={activeChapter.linkedLessonRoute}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-semibold text-[#060609] hover:brightness-110 transition-all"
                    style={{
                      backgroundColor: course.accent,
                      boxShadow: `0 0 22px -6px ${course.accent}`,
                    }}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Launch 7-Layer Lesson
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  <Link
                    to="/frontier"
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full text-xs font-mono-data border border-[#F4C46C]/40 bg-[#F4C46C]/10 text-[#FFE29E] hover:bg-[#F4C46C]/20 transition-colors"
                  >
                    <Atom className="w-3.5 h-3.5 text-[#F4C46C]" />
                    String Theory 3D
                  </Link>
                </div>
              </div>

              {/* Big Idea Card */}
              <div className="p-4 sm:p-5 rounded-xl bg-[#0B0C12] border border-[rgba(244,196,108,0.22)] space-y-1.5">
                <span className="font-mono-data text-[10.5px] uppercase tracking-widest text-[#F4C46C] block">
                  Core Chapter Intuition · Why It All Fits Together
                </span>
                <p className="text-sm sm:text-base text-[#F7F4EC] leading-relaxed">
                  {activeChapter.bigIdea}
                </p>
              </div>

              {/* EOC Trap + Frontier Physics Bridge */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-[#11131C] border border-[#FF8563]/35 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-[#FF8563]" />
                    <span className="font-mono-data text-[10.5px] uppercase tracking-wider text-[#FF8563]">
                      Florida EOC &amp; Exam Trap Watch
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-[#F7F4EC]/90 leading-relaxed">
                    {activeChapter.eocTrap}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#11131C] border border-[#F4C46C]/35 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <Compass className="w-4 h-4 text-[#F4C46C]" />
                    <span className="font-mono-data text-[10.5px] uppercase tracking-wider text-[#FFE29E]">
                      Beyond to String Theory, AI &amp; Frontier Physics
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-[#A8B2C6] leading-relaxed">
                    {activeChapter.frontierConnection}
                  </p>
                </div>
              </div>

              {/* Verified Benchmarks */}
              <div className="space-y-2.5">
                <span className="font-mono-data text-[10.5px] uppercase tracking-widest text-[#727D94] block">
                  Official Florida B.E.S.T. Benchmarks Covered ({activeChapter.benchmarks.length})
                </span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {activeChapter.benchmarks.map((code) => {
                    const std = VERIFIED_STANDARDS[code];
                    if (!std) return null;
                    return (
                      <div
                        key={code}
                        className="p-3.5 rounded-xl bg-[#0B0C12] border border-white/10 space-y-1"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span
                            className="font-mono-data text-xs font-semibold"
                            style={{ color: course.accent }}
                          >
                            {std.code}
                          </span>
                          <a
                            href={std.sourceUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 font-mono-data text-[10.5px] text-[#A8B2C6] hover:text-[#F7F4EC]"
                          >
                            {std.strand} <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                        <p className="text-xs text-[#A8B2C6] leading-relaxed">{std.description}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>

            {/* 2. INTERACTIVE LIVE LAB + ANIMATED KEY FORMULA CARDS */}
            <section className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span
                    className="font-mono-data text-[11px] uppercase tracking-widest block"
                    style={{ color: course.accent }}
                  >
                    Interactive Visual Laboratory &amp; Animated Key Equations
                  </span>
                  <h3 className="font-serif-editorial text-2xl sm:text-3xl text-[#F7F4EC]">
                    Manipulate the Parameters &amp; Watch Every Formula Move
                  </h3>
                </div>
                {activeChapter.linkedLessonRoute === '/lesson/solids-3d' && (
                  <Link
                    to="/lesson/solids-3d"
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full font-mono-data text-xs border border-[#46D6E8]/45 bg-[#46D6E8]/12 text-[#46D6E8] hover:bg-[#46D6E8]/20"
                  >
                    Open Full 3D Hinged Solids WebGL Lab <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {activeChapter.keyFormulas.map((kf) => (
                  <div
                    key={kf.label}
                    className="instrument-frame p-4 flex flex-col justify-between gap-3"
                  >
                    <span
                      className="font-mono-data text-[10.5px] uppercase tracking-wider"
                      style={{ color: course.accent }}
                    >
                      {kf.label}
                    </span>
                    <EquationMiniVisual
                      kind={kf.visualKind}
                      accent={course.accent}
                      heightClass="h-[132px]"
                      showReplay
                    />
                    <div className="instrument-panel px-3 py-2 overflow-x-auto">
                      <MathTex tex={kf.tex} displayMode className="text-[#F7F4EC]" />
                    </div>
                  </div>
                ))}
              </div>

              <TopicVisualCanvas topicId={activeChapter.interactiveTopicId} />
            </section>

            {/* 3. INTERACTIVE EOC WORKED EXAMPLE WITH AUTO-PLAY */}
            <section className="instrument-frame p-5 sm:p-7 space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <span
                    className="font-mono-data text-[11px] uppercase tracking-widest block"
                    style={{ color: course.accent }}
                  >
                    Animated EOC Worked Example · Step {safeStepIdx + 1} / {totalExampleSteps}
                  </span>
                  <h3 className="font-serif-editorial text-2xl sm:text-3xl text-[#F7F4EC]">
                    Guided Problem Walkthrough
                  </h3>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setAutoPlayExample(false);
                      setExampleStepIdx(
                        (prev) => (prev - 1 + totalExampleSteps) % totalExampleSteps
                      );
                    }}
                    aria-label="Previous worked example step"
                    className="p-2 rounded-full border border-white/15 bg-[#0B0C12] text-[#A8B2C6] hover:text-[#F7F4EC] transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setAutoPlayExample((p) => !p)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-mono-data border transition-all"
                    style={{
                      borderColor: autoPlayExample ? course.accent : 'rgba(244,196,108,0.28)',
                      backgroundColor: autoPlayExample ? `${course.accent}22` : '#0B0C12',
                      color: autoPlayExample ? course.accent : '#FFE29E',
                    }}
                  >
                    {autoPlayExample ? (
                      <Pause className="w-3.5 h-3.5" />
                    ) : (
                      <Play className="w-3.5 h-3.5" />
                    )}
                    <span>{autoPlayExample ? 'Pause Auto-Play' : 'Auto-Play Steps'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setAutoPlayExample(false);
                      setExampleStepIdx((prev) => (prev + 1) % totalExampleSteps);
                    }}
                    aria-label="Next worked example step"
                    className="p-2 rounded-full border border-white/15 bg-[#0B0C12] text-[#A8B2C6] hover:text-[#F7F4EC] transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="p-4 sm:p-5 rounded-xl bg-[#0B0C12] border border-white/10 space-y-2">
                <span className="font-mono-data text-[10px] uppercase tracking-wider text-[#727D94]">
                  Problem Statement
                </span>
                <p className="text-sm sm:text-base text-[#F7F4EC] leading-relaxed">
                  {activeChapter.workedExample.problem}
                </p>
                <div className="overflow-x-auto pt-1">
                  <MathTex
                    tex={activeChapter.workedExample.problemTex}
                    displayMode
                    className="text-[#FFE29E]"
                  />
                </div>
              </div>

              {/* Step selector pills */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {activeChapter.workedExample.steps.map((st, idx) => {
                  const isCurrent = idx === safeStepIdx;
                  return (
                    <button
                      key={st.title}
                      type="button"
                      onClick={() => {
                        setAutoPlayExample(false);
                        setExampleStepIdx(idx);
                      }}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        isCurrent
                          ? 'bg-[#171A26] text-[#F7F4EC]'
                          : 'bg-[#0B0C12] border-white/10 text-[#A8B2C6] hover:text-[#F7F4EC]'
                      }`}
                      style={
                        isCurrent
                          ? {
                              borderColor: course.accent,
                              boxShadow: `0 0 18px -8px ${course.accent}`,
                            }
                          : undefined
                      }
                    >
                      <span
                        className="font-mono-data text-[10px] uppercase block"
                        style={{ color: course.accent }}
                      >
                        Step 0{idx + 1}
                      </span>
                      <span className="text-xs font-medium line-clamp-1">{st.title}</span>
                    </button>
                  );
                })}
              </div>

              {/* Active Step Card */}
              <AnimatePresence mode="wait" initial={false}>
                {currentWorkedStep && (
                  <motion.div
                    key={`${activeChapter.id}-step-${safeStepIdx}`}
                    initial={reducedMotion ? false : { opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={reducedMotion ? undefined : { opacity: 0, x: -10 }}
                    transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                    className="instrument-panel p-5 space-y-3 border-[rgba(244,196,108,0.28)]"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono-data text-xs" style={{ color: course.accent }}>
                        Step 0{safeStepIdx + 1} · {currentWorkedStep.title}
                      </span>
                      <span className="font-mono-data text-[10px] text-[#727D94]">
                        {Math.round(((safeStepIdx + 1) / totalExampleSteps) * 100)}% complete
                      </span>
                    </div>
                    <div className="overflow-x-auto py-1">
                      <MathTex tex={currentWorkedStep.tex} displayMode className="text-[#F7F4EC]" />
                    </div>
                    <p className="text-xs sm:text-sm text-[#A8B2C6] leading-relaxed">
                      {currentWorkedStep.note}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </section>

            {/* 4. CHAPTER MASTERY DRILLS (PRACTICE ENGINE) */}
            <section className="space-y-4">
              <div>
                <span
                  className="font-mono-data text-[11px] uppercase tracking-widest block"
                  style={{ color: course.accent }}
                >
                  Chapter 0{activeChapter.chapterNumber} Mastery Check · Instant KaTeX Feedback
                </span>
                <h3 className="font-serif-editorial text-2xl sm:text-3xl text-[#F7F4EC]">
                  Solve the Chapter Drills
                </h3>
              </div>

              <PracticeEngine
                key={activeChapter.id}
                questions={activeChapter.checkQuestions}
                accentColor={course.accent}
                visualKinds={activeChapter.keyFormulas.map((k) => k.visualKind)}
              />
            </section>

            {/* PREV / NEXT CHAPTER NAVIGATION */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t hairline-rule">
              {prevChapter ? (
                <button
                  type="button"
                  onClick={() => handleSelectChapter(prevChapter)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full border border-white/15 bg-[#0B0C12] text-xs font-mono-data text-[#A8B2C6] hover:text-[#F7F4EC] hover:border-[#F4C46C]/45 transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Ch 0{prevChapter.chapterNumber}: {prevChapter.title}
                </button>
              ) : (
                <span />
              )}

              {nextChapter && (
                <button
                  type="button"
                  onClick={() => handleSelectChapter(nextChapter)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold text-[#060609] hover:brightness-110 transition-all"
                  style={{ backgroundColor: course.accent }}
                >
                  Next: Ch 0{nextChapter.chapterNumber} · {nextChapter.title}
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* 5. THE 7 FLORIDA MTR THINKING HABITS */}
        <section className="instrument-frame p-5 sm:p-7 space-y-5 border-[rgba(244,196,108,0.22)]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="font-mono-data text-[11px] uppercase tracking-widest text-[#F4C46C] block">
                Florida B.E.S.T. Mathematical Thinking &amp; Reasoning (MA.K12.MTR.1.1 – 7.1)
              </span>
              <h2 className="font-serif-editorial text-2xl sm:text-3xl text-[#F7F4EC]">
                The 7 Problem-Solver Habits Used Across Every Chapter
              </h2>
            </div>
            <a
              href={FLDOE_SOURCES.bestPdf.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 font-mono-data text-xs text-[#FFE29E] hover:underline"
            >
              Official FLDOE MTR Guide <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
            {FLORIDA_MTR_HABITS.map((mtr) => {
              const active = mtr.number === selectedMtrNumber;
              const isChapterFocus = activeChapter.mtrFocus.includes(mtr.code);
              return (
                <button
                  key={mtr.code}
                  type="button"
                  onClick={() => setSelectedMtrNumber(mtr.number)}
                  className={`p-3 rounded-xl border text-left transition-all space-y-1 ${
                    active
                      ? 'bg-[#171A26] border-[#F4C46C] text-[#F7F4EC]'
                      : 'bg-[#0B0C12] border-white/10 text-[#A8B2C6] hover:text-[#F7F4EC]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-mono-data text-[10px] text-[#F4C46C]">
                      MTR.{mtr.number}.1
                    </span>
                    {isChapterFocus && (
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: course.accent }}
                        title="Current chapter focus"
                      />
                    )}
                  </div>
                  <p className="text-xs font-medium leading-snug">{mtr.shortTitle}</p>
                </button>
              );
            })}
          </div>

          <div className="p-4 sm:p-5 rounded-xl bg-[#0B0C12] border border-[rgba(244,196,108,0.22)] grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            <div className="lg:col-span-6 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono-data text-xs text-[#F4C46C] font-semibold">
                  {activeMtrHabit.code}
                </span>
                {activeChapter.mtrFocus.includes(activeMtrHabit.code) && (
                  <span
                    className="px-2.5 py-0.5 rounded-full font-mono-data text-[10px]"
                    style={{
                      backgroundColor: `${course.accent}20`,
                      color: course.accent,
                    }}
                  >
                    Active Chapter Focus
                  </span>
                )}
              </div>
              <h3 className="font-serif-editorial text-xl sm:text-2xl text-[#F7F4EC]">
                {activeMtrHabit.title}
              </h3>
              <p className="text-xs sm:text-sm text-[#A8B2C6] leading-relaxed">
                {activeMtrHabit.teenHook}
              </p>
            </div>

            <div className="lg:col-span-6 space-y-2">
              <span className="font-mono-data text-[10px] uppercase tracking-wider text-[#727D94] block">
                Action Moves When Solving Problems
              </span>
              <ul className="space-y-2">
                {activeMtrHabit.actionChecklist.map((move) => (
                  <li key={move} className="flex items-start gap-2 text-xs sm:text-sm text-[#F7F4EC]/90">
                    <CheckCircle2 className="w-4 h-4 text-[#45E6A6] shrink-0 mt-0.5" />
                    <span>{move}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      </div>
    </AtlasShell>
  );
}
