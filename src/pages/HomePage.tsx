import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Atom,
  BookOpen,
  Calculator,
  Compass,
  Cpu,
  ExternalLink,
  Layers,
  Network,
  Orbit,
  Presentation,
  Sparkles,
} from 'lucide-react';
import { AtlasShell } from '../components/AtlasShell';
import { MathTex } from '../components/MathTex';
import { COURSES, CURRICULUM_NODES } from '../data/curriculumGraph';
import {
  FLORIDA_COURSE_TEXTBOOK_META,
  FLORIDA_TEXTBOOK_CHAPTERS,
} from '../data/floridaTextbookGuide';
import { CourseId, FLDOE_SOURCES } from '../data/standards';
import { CalabiYauManifold3D } from '../visuals/frontier/CalabiYauManifold3D';
import { OrbitalSignalTorus3D } from '../visuals/frontier/OrbitalSignalTorus3D';
import { GoldenHarmonicSpine } from '../visuals/harmony/GoldenHarmonicSpine';
import { NeuralAtlasMap } from '../visuals/map/NeuralAtlasMap';
import { ApolloniusCone3D } from '../visuals/solids/ApolloniusCone3D';
import { MathVortexCanvas } from '../visuals/vortex/MathVortexCanvas';

const COURSE_ORDER: CourseId[] = ['algebra-1', 'geometry', 'algebra-2', 'precalculus'];

type HeroStageMode = 'orbital' | 'calabi' | 'vortex';

const HERO_TABS: {
  id: HeroStageMode;
  label: string;
  accent: string;
  formulaTex: string;
  caption: string;
}[] = [
  {
    id: 'orbital',
    label: 'Orbital String Flux 3D',
    accent: '#F4C46C',
    formulaTex: 'X^\\mu(\\tau, \\sigma) \\cdot S^1 \\times S^1',
    caption: '60,000-particle 3D manifold — drag to orbit or click to emit radial shockwaves',
  },
  {
    id: 'calabi',
    label: 'Calabi-Yau 3D',
    accent: '#FFE29E',
    formulaTex: 'z_1^n + z_2^n = 1',
    caption: 'Compactified 6D manifold sheets, Hopf fibration rings, and relativistic worldsheets',
  },
  {
    id: 'vortex',
    label: 'Math Vortex & Chaos',
    accent: '#46D6E8',
    formulaTex: '\\dot{x} = \\sigma(y-x),\\; \\dot{z} = xy - \\beta z',
    caption: 'Interactive eigen-flow vortex, Lorenz chaos butterfly, and Fourier epicycles',
  },
];

export function HomePage() {
  const [heroMode, setHeroMode] = useState<HeroStageMode>('orbital');
  const [dirFilter, setDirFilter] = useState<'all' | CourseId>('all');
  const [dirView, setDirView] = useState<'both' | 'textbook' | 'lessons'>('both');

  const activeHeroTab = HERO_TABS.find((t) => t.id === heroMode) ?? HERO_TABS[0];
  const visibleDirectoryCourses = dirFilter === 'all' ? COURSE_ORDER : [dirFilter];

  return (
    <AtlasShell>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-20">
        {/* SECTION A: AUREA GOLDEN CYBER-OBSERVATORY HERO */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center pt-1">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-5 space-y-6"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#F4C46C]/35 bg-[#F4C46C]/10 text-[11px] font-mono-data uppercase tracking-[0.16em] text-[#FFE29E]">
              <Sparkles className="w-3.5 h-3.5 text-[#F4C46C]" />
              AUREA Observatory · High School to 10D Physics
            </div>

            <h1 className="font-serif-editorial text-4xl sm:text-5xl lg:text-[3.55rem] text-[#F7F4EC] leading-[1.03] tracking-tight">
              See Mathematics{' '}
              <em className="italic bg-gradient-to-r from-[#FFE29E] via-[#F4C46C] to-[#FF8563] bg-clip-text text-transparent">
                Move in 3D Dimensions
              </em>
            </h1>

            <p className="text-sm sm:text-base text-[#A8B2C6] leading-relaxed">
              Master Algebra 1, Geometry, Algebra 2, and Precalculus Honors through real-time 3D
              engines, step-by-step proofs, and a 28-chapter Florida B.E.S.T. textbook—and discover
              how the exact same exponents, waves, and curves describe modern physics and String
              Theory.
            </p>

            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              <Link
                to="/frontier"
                className="luminous-pill-btn inline-flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm"
              >
                <Orbit className="w-4 h-4" />
                String Theory 3D
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/textbook"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-xs sm:text-sm font-medium bg-[#11131C] border border-[#F4C46C]/35 text-[#FFE29E] hover:border-[#FFE29E]/70 hover:bg-[#F4C46C]/10 transition-all"
              >
                <BookOpen className="w-4 h-4 text-[#F4C46C]" />
                Florida B.E.S.T. Book
              </Link>
              <a
                href="#constellation"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-xs sm:text-sm font-medium bg-[#0B0C12] border border-[#46D6E8]/35 text-[#46D6E8] hover:border-[#46D6E8]/70 hover:bg-[#46D6E8]/10 transition-all"
              >
                <Network className="w-4 h-4" />
                36-Node Atlas
              </a>
              <Link
                to="/presentation"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-xs sm:text-sm font-medium bg-[#FF8563]/12 border border-[#FF8563]/40 text-[#FF8563] hover:bg-[#FF8563]/20 transition-all"
              >
                <Presentation className="w-4 h-4" />
                Live Keynote
              </Link>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-[rgba(244,196,108,0.16)]">
              <div>
                <span className="font-mono-data text-lg sm:text-xl text-[#FFE29E] block">
                  36 / 36
                </span>
                <span className="text-[11px] text-[#A8B2C6]">7-Layer Lessons</span>
              </div>
              <div>
                <span className="font-mono-data text-lg sm:text-xl text-[#F4C46C] block">
                  28 Chapters
                </span>
                <span className="text-[11px] text-[#A8B2C6]">Florida B.E.S.T. Book</span>
              </div>
              <div>
                <span className="font-mono-data text-lg sm:text-xl text-[#46D6E8] block">
                  108+ Visuals
                </span>
                <span className="text-[11px] text-[#A8B2C6]">3D &amp; Animated Proofs</span>
              </div>
            </div>
          </motion.div>

          {/* Live Interactive Hero 3D Stage */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-7 space-y-3"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 px-1">
              <div
                className="flex flex-wrap gap-1.5"
                role="tablist"
                aria-label="Hero 3D mathematical engines"
              >
                {HERO_TABS.map((tab) => {
                  const active = heroMode === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      onClick={() => setHeroMode(tab.id)}
                      className={`px-3 py-1 rounded-full text-[11px] font-mono-data border transition-all ${
                        active
                          ? 'text-[#060609] font-semibold'
                          : 'bg-[#0B0C12]/90 text-[#A8B2C6] border-[rgba(244,196,108,0.18)] hover:text-[#F7F4EC]'
                      }`}
                      style={
                        active
                          ? {
                              backgroundColor: tab.accent,
                              borderColor: tab.accent,
                              boxShadow: `0 0 20px -4px ${tab.accent}`,
                            }
                          : undefined
                      }
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              <span className="inline-flex items-center gap-1.5 font-mono-data text-[10px] text-[#45E6A6]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#45E6A6] shadow-[0_0_8px_#45E6A6]" />
                60fps Interactive Stage
              </span>
            </div>

            {heroMode === 'orbital' && (
              <OrbitalSignalTorus3D compact heightClass="h-[360px] sm:h-[430px]" />
            )}
            {heroMode === 'calabi' && (
              <CalabiYauManifold3D compact heightClass="h-[360px] sm:h-[430px]" />
            )}
            {heroMode === 'vortex' && (
              <MathVortexCanvas compact heightClass="h-[360px] sm:h-[430px]" />
            )}

            <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-[11px] font-mono-data text-[#A8B2C6]">
              <span className="flex items-center gap-2 flex-wrap">
                <strong style={{ color: activeHeroTab.accent }}>{activeHeroTab.label}:</strong>
                <span>{activeHeroTab.caption}</span>
              </span>
              <div className="flex items-center gap-3">
                <MathTex tex={activeHeroTab.formulaTex} className="text-[#FFE29E] hidden sm:inline" />
                <Link to="/frontier" className="text-[#F4C46C] hover:underline shrink-0">
                  Full String Frontier →
                </Link>
              </div>
            </div>
          </motion.div>
        </section>

        {/* SECTION B: FULL-BLEED GOLDEN HARMONIC SPINE */}
        <section className="space-y-5">
          <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[rgba(244,196,108,0.16)] pb-4">
            <div className="space-y-1">
              <span className="font-mono-data text-[11px] uppercase tracking-[0.22em] text-[#F4C46C]">
                Golden Harmonic Spine · 24 Foundations Connected to Modern Physics
              </span>
              <h2 className="font-serif-editorial text-3xl sm:text-4xl text-[#F7F4EC]">
                How High School Math Weaves Directly Into String Theory
              </h2>
            </div>
            <Link
              to="/neural"
              className="inline-flex items-center gap-1.5 text-xs font-mono-data text-[#FFE29E] hover:underline"
            >
              Open Neural Matrix &amp; Harmonic Studio <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <GoldenHarmonicSpine />
        </section>

        {/* SECTION C: 3D STRING THEORY, CALABI-YAU & APOLLONIUS CONICS SPOTLIGHT */}
        <section className="space-y-6">
          <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[rgba(244,196,108,0.16)] pb-4">
            <div className="space-y-1">
              <span className="font-mono-data text-[11px] uppercase tracking-[0.22em] text-[#FFE29E]">
                Interactive 3D Geometry &amp; Frontier Laboratories
              </span>
              <h2 className="font-serif-editorial text-3xl sm:text-4xl text-[#F7F4EC]">
                Calabi-Yau Manifolds, String Harmonics &amp; Apollonius Conics in 3D
              </h2>
            </div>
            <div className="flex flex-wrap items-center gap-2.5">
              <Link
                to="/frontier"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-mono-data bg-[#F4C46C]/15 border border-[#F4C46C]/45 text-[#FFE29E] hover:bg-[#F4C46C]/25 transition-colors"
              >
                <Atom className="w-3.5 h-3.5" />
                Explore /frontier
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                to="/instruments"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-mono-data bg-[#11131C] border border-[#46D6E8]/40 text-[#46D6E8] hover:bg-[#46D6E8]/15 transition-colors"
              >
                <Compass className="w-3.5 h-3.5" />
                All /instruments Labs
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          <div className="space-y-8">
            {/* Spotlight 1: Calabi-Yau, Hopf Fibration & Worldsheet */}
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3 px-1">
                <div className="space-y-0.5">
                  <span className="font-mono-data text-[10.5px] uppercase tracking-[0.18em] text-[#F4C46C]">
                    01 · String Theory &amp; Complex Roots of Unity
                  </span>
                  <h3 className="font-serif-editorial text-2xl text-[#F7F4EC]">
                    Calabi-Yau Hypersurfaces, Hopf Fibers &amp; Vibrating Strings
                  </h3>
                </div>
                <Link
                  to="/frontier"
                  className="inline-flex items-center gap-1.5 text-xs font-mono-data text-[#FFE29E] hover:underline"
                >
                  Open String Theory 3D Challenges <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
              <CalabiYauManifold3D />
            </div>

            {/* Spotlight 2: Apollonius Double-Nappe Cone Slicer */}
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3 px-1">
                <div className="space-y-0.5">
                  <span className="font-mono-data text-[10.5px] uppercase tracking-[0.18em] text-[#46D6E8]">
                    02 · Precalculus &amp; Classical Conic Geometry
                  </span>
                  <h3 className="font-serif-editorial text-2xl text-[#F7F4EC]">
                    One Double Cone, Four Curves: Circle, Ellipse, Parabola &amp; Hyperbola
                  </h3>
                </div>
                <Link
                  to="/instruments"
                  className="inline-flex items-center gap-1.5 text-xs font-mono-data text-[#46D6E8] hover:underline"
                >
                  Launch Full 3D &amp; Math Lab Bank <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
              <ApolloniusCone3D />
            </div>
          </div>
        </section>

        {/* SECTION D: INTERACTIVE 36-NODE CONSTELLATION ATLAS */}
        <section id="constellation" className="space-y-5 scroll-mt-24">
          <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[rgba(244,196,108,0.16)] pb-4">
            <div className="space-y-1">
              <span className="font-mono-data text-[11px] uppercase tracking-[0.22em] text-[#46D6E8]">
                Constellation Atlas · 36 Interconnected Prerequisite Nodes
              </span>
              <h2 className="font-serif-editorial text-3xl sm:text-4xl text-[#F7F4EC]">
                Click Any Glowing Node to Inspect Prerequisites &amp; Launch Its 7-Layer Lesson
              </h2>
            </div>
            <Link
              to="/map"
              className="inline-flex items-center gap-1.5 text-xs font-mono-data text-[#46D6E8] hover:underline"
            >
              Open Fullscreen Constellation Atlas <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <NeuralAtlasMap heightClass="h-[540px] sm:h-[600px]" />
        </section>

        {/* SECTION E: FLORIDA B.E.S.T. 4-YEAR CURRICULUM & 28-CHAPTER TEXTBOOK DIRECTORY */}
        <section className="space-y-6">
          <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[rgba(244,196,108,0.16)] pb-4">
            <div className="space-y-1">
              <span className="font-mono-data text-[11px] uppercase tracking-[0.22em] text-[#F4C46C]">
                Florida B.E.S.T. Curriculum &amp; Interactive Textbook
              </span>
              <h2 className="font-serif-editorial text-3xl sm:text-4xl text-[#F7F4EC]">
                4 Full-Year Courses · 28 Textbook Chapters &amp; 36 Interactive Lessons
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setDirFilter('all')}
                  className={`px-3 py-1 rounded-full text-[11px] font-mono-data border transition-all ${
                    dirFilter === 'all'
                      ? 'bg-[#F4C46C]/20 border-[#F4C46C] text-[#FFE29E]'
                      : 'border-[rgba(244,196,108,0.18)] text-[#A8B2C6] hover:text-[#F7F4EC]'
                  }`}
                >
                  All 4 Courses
                </button>
                {COURSE_ORDER.map((cid) => {
                  const c = COURSES[cid];
                  const active = dirFilter === cid;
                  return (
                    <button
                      key={cid}
                      type="button"
                      onClick={() => setDirFilter(cid)}
                      className="px-3 py-1 rounded-full text-[11px] font-mono-data border transition-all"
                      style={{
                        borderColor: active ? c.accent : 'rgba(244,196,108,0.18)',
                        backgroundColor: active ? `${c.accent}22` : 'transparent',
                        color: active ? c.accent : '#A8B2C6',
                      }}
                    >
                      {c.title}
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-1 rounded-full p-0.5 bg-[#0B0C12] border border-[rgba(244,196,108,0.18)]">
                {(
                  [
                    ['both', 'Chapters + Lessons'],
                    ['textbook', '28 Chapters'],
                    ['lessons', '36 Lessons'],
                  ] as const
                ).map(([modeId, modeLabel]) => {
                  const active = dirView === modeId;
                  return (
                    <button
                      key={modeId}
                      type="button"
                      onClick={() => setDirView(modeId)}
                      className={`px-2.5 py-1 rounded-full text-[10.5px] font-mono-data transition-colors ${
                        active
                          ? 'bg-[#F4C46C] text-[#060609] font-semibold'
                          : 'text-[#A8B2C6] hover:text-[#F7F4EC]'
                      }`}
                    >
                      {modeLabel}
                    </button>
                  );
                })}
              </div>

              <a
                href={FLDOE_SOURCES.bestIndex.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-[11px] font-mono-data text-[#727D94] hover:text-[#FFE29E]"
              >
                FLDOE B.E.S.T. <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          <div
            className={`grid grid-cols-1 ${
              dirFilter === 'all' ? 'lg:grid-cols-2' : 'max-w-5xl'
            } gap-6`}
          >
            {visibleDirectoryCourses.map((cid) => {
              const c = COURSES[cid];
              const tbMeta = FLORIDA_COURSE_TEXTBOOK_META[cid];
              const chapters = FLORIDA_TEXTBOOK_CHAPTERS.filter((ch) => ch.courseId === cid).sort(
                (a, b) => a.chapterNumber - b.chapterNumber
              );
              const nodes = CURRICULUM_NODES.filter((n) => n.courseId === cid);

              return (
                <article
                  key={cid}
                  className="instrument-frame p-5 sm:p-6 flex flex-col justify-between gap-5"
                  style={{ borderTop: `2px solid ${c.accent}` }}
                >
                  <div className="space-y-4">
                    {/* Course Header */}
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2 font-mono-data text-[10px]">
                          <span style={{ color: c.accent }}>
                            {c.shortTitle} · CPALMS {c.cpalmsCode}
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-[#11131C] border border-[rgba(244,196,108,0.18)] text-[#A8B2C6]">
                            {tbMeta.eocBadge}
                          </span>
                        </div>
                        <Link
                          to={`/course/${cid}`}
                          className="font-serif-editorial text-2xl sm:text-3xl text-[#F7F4EC] hover:underline block"
                        >
                          {c.title}
                        </Link>
                        <p className="text-xs text-[#A8B2C6] leading-relaxed">{tbMeta.overview}</p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <Link
                          to={`/textbook?course=${cid}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-mono-data border border-[rgba(244,196,108,0.28)] bg-[#11131C] text-[#FFE29E] hover:border-[#F4C46C]"
                        >
                          <BookOpen className="w-3 h-3" />7 Chapters
                        </Link>
                        <Link
                          to={`/course/${cid}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-mono-data text-[#060609] font-semibold"
                          style={{ backgroundColor: c.accent }}
                        >
                          Course Hub →
                        </Link>
                      </div>
                    </div>

                    {/* 7 Florida B.E.S.T. Textbook Chapters */}
                    {(dirView === 'both' || dirView === 'textbook') && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between font-mono-data text-[10px] uppercase tracking-wider text-[#F4C46C]">
                          <span>Florida B.E.S.T. Textbook Chapters (7)</span>
                          <Link to={`/textbook?course=${cid}`} className="hover:underline">
                            Open Book →
                          </Link>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {chapters.map((ch) => (
                            <Link
                              key={ch.id}
                              to={`/textbook?course=${cid}&chapter=${ch.id}`}
                              className="p-2.5 rounded-xl bg-[#0B0C12] border border-[rgba(244,196,108,0.14)] hover:border-[rgba(244,196,108,0.4)] transition-all group"
                            >
                              <div className="flex items-center justify-between gap-2 font-mono-data text-[10px]">
                                <span style={{ color: c.accent }}>CH 0{ch.chapterNumber}</span>
                                <span className="text-[#727D94] truncate">{ch.benchmarks[0]}</span>
                              </div>
                              <div className="text-xs font-medium text-[#F7F4EC] truncate mt-0.5 group-hover:underline">
                                {ch.title}
                              </div>
                              <div className="text-[10.5px] text-[#A8B2C6] truncate">
                                {ch.subtitle}
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 9 Interactive 7-Layer Lessons */}
                    {(dirView === 'both' || dirView === 'lessons') && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between font-mono-data text-[10px] uppercase tracking-wider text-[#A8B2C6]">
                          <span>Interactive 7-Layer Lessons ({nodes.length})</span>
                          <Link
                            to={`/course/${cid}`}
                            className="hover:underline"
                            style={{ color: c.accent }}
                          >
                            All {c.shortTitle} Units →
                          </Link>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          {nodes.map((node) => (
                            <Link
                              key={node.id}
                              to={node.route}
                              className="flex items-center gap-2 p-2 rounded-xl bg-[#060609]/85 border border-[rgba(244,196,108,0.12)] hover:border-[rgba(244,196,108,0.38)] transition-all group"
                            >
                              <span
                                className="w-8 h-8 rounded-lg shrink-0 flex items-center justify-center font-mono-data text-[9px] font-semibold border"
                                style={{
                                  borderColor: `${c.accent}44`,
                                  backgroundColor: `${c.accent}14`,
                                  color: c.accent,
                                }}
                              >
                                {node.symbol}
                              </span>
                              <div className="min-w-0">
                                <div className="text-[11.5px] font-medium text-[#F7F4EC] truncate group-hover:underline">
                                  {node.title}
                                </div>
                                <div className="text-[9.5px] font-mono-data text-[#727D94] truncate">
                                  {node.code}
                                </div>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-[rgba(244,196,108,0.14)] flex flex-wrap items-center justify-between gap-2 text-xs font-mono-data">
                    <span className="text-[#727D94] text-[11px]">{tbMeta.audience}</span>
                    <Link
                      to={`/course/${cid}`}
                      className="inline-flex items-center gap-1 hover:underline"
                      style={{ color: c.accent }}
                    >
                      Open {c.title} Hub <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* SECTION F: OBSERVATORY SUITE PORTALS */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            to="/frontier"
            className="instrument-frame p-5 space-y-2.5 hover:border-[#F4C46C]/60 transition-all"
          >
            <div className="flex items-center justify-between text-[#FFE29E]">
              <span className="font-mono-data text-[10px] uppercase tracking-wider">10D Frontier</span>
              <Orbit className="w-4 h-4" />
            </div>
            <h3 className="font-serif-editorial text-xl text-[#F7F4EC]">String Theory 3D</h3>
            <p className="text-xs text-[#A8B2C6] leading-relaxed">
              Calabi-Yau manifolds, Hopf rings, worldsheet vibrations, and 60,000-particle flux.
            </p>
          </Link>

          <Link
            to="/textbook"
            className="instrument-frame p-5 space-y-2.5 hover:border-[#46D6E8]/60 transition-all"
          >
            <div className="flex items-center justify-between text-[#46D6E8]">
              <span className="font-mono-data text-[10px] uppercase tracking-wider">28 Chapters</span>
              <Layers className="w-4 h-4" />
            </div>
            <h3 className="font-serif-editorial text-xl text-[#F7F4EC]">Florida B.E.S.T. Book</h3>
            <p className="text-xs text-[#A8B2C6] leading-relaxed">
              Interactive examples, EOC trap alerts, MTR habits, and live checks for all 4 courses.
            </p>
          </Link>

          <Link
            to="/instruments"
            className="instrument-frame p-5 space-y-2.5 hover:border-[#45E6A6]/60 transition-all"
          >
            <div className="flex items-center justify-between text-[#45E6A6]">
              <span className="font-mono-data text-[10px] uppercase tracking-wider">Lab Workbench</span>
              <Cpu className="w-4 h-4" />
            </div>
            <h3 className="font-serif-editorial text-xl text-[#F7F4EC]">All 3D &amp; Math Labs</h3>
            <p className="text-xs text-[#A8B2C6] leading-relaxed">
              Every standalone 3D manifold, conic slicer, solid net, neural engine, and topic lab.
            </p>
          </Link>

          <Link
            to="/planner"
            className="instrument-frame p-5 space-y-2.5 hover:border-[#FF8563]/60 transition-all"
          >
            <div className="flex items-center justify-between text-[#FF8563]">
              <span className="font-mono-data text-[10px] uppercase tracking-wider">Target Gauge</span>
              <Calculator className="w-4 h-4" />
            </div>
            <h3 className="font-serif-editorial text-xl text-[#F7F4EC]">Syllabus Grade Planner</h3>
            <p className="text-xs text-[#A8B2C6] leading-relaxed">
              Simulate category weights and compute the exact final exam score needed for your goal.
            </p>
          </Link>
        </section>
      </div>
    </AtlasShell>
  );
}
