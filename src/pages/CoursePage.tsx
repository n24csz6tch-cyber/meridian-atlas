import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowRight,
  BookOpen,
  Compass,
  ExternalLink,
  Layers,
  Network,
  Orbit,
  PlayCircle,
  Sparkles,
} from 'lucide-react';
import { AtlasShell } from '../components/AtlasShell';
import { CourseJourneySidebar } from '../components/CourseJourneySidebar';
import { MathTex } from '../components/MathTex';
import { COURSES, CURRICULUM_NODES, CurriculumNode } from '../data/curriculumGraph';
import { TOPIC_VISUAL_CONFIG } from '../data/lessons/topicVisualMappings';
import { CourseId, VERIFIED_STANDARDS } from '../data/standards';
import { QuadraticWorkbench } from '../instruments/QuadraticWorkbench';
import { SolidNetLab } from '../instruments/SolidNetLab';
import { EquationMiniVisual, EquationVisualKind } from '../visuals/equations/EquationMiniVisual';
import { LogarithmLab } from '../visuals/logarithms/LogarithmLab';
import { TopicVisualCanvas, TopicVisualId } from '../visuals/topics/TopicVisualCanvas';
import { UnitCircleWaveCanvas } from '../visuals/trig/UnitCircleWaveCanvas';
import { VectorParallelogramCanvas } from '../visuals/trig/VectorParallelogramCanvas';

const NODE_BY_ID = new Map<string, CurriculumNode>(CURRICULUM_NODES.map((n) => [n.id, n]));

const STAGE_DEFINITIONS = [
  {
    stage: 1,
    label: 'Stage 1 · Foundations',
    unitRange: 'Units 01–03',
    summary: 'Core building blocks, definitions, and visual intuition.',
    startIdx: 0,
    endIdx: 3,
  },
  {
    stage: 2,
    label: 'Stage 2 · Core Mechanics',
    unitRange: 'Units 04–06',
    summary: 'Multi-step relationships, transformations, and problem solving.',
    startIdx: 3,
    endIdx: 6,
  },
  {
    stage: 3,
    label: 'Stage 3 · Mastery & Connections',
    unitRange: 'Units 07–09',
    summary: 'Synthesis, real-world modeling, and bridges to higher math.',
    startIdx: 6,
    endIdx: 9,
  },
];

function getStageMetaForIndex(index: number) {
  if (index < 3) return STAGE_DEFINITIONS[0];
  if (index < 6) return STAGE_DEFINITIONS[1];
  return STAGE_DEFINITIONS[2];
}

function isValidCourse(id: string | undefined): id is CourseId {
  return id === 'algebra-1' || id === 'geometry' || id === 'algebra-2' || id === 'precalculus';
}

const FLAGSHIP_CARD_VISUAL: Record<string, EquationVisualKind> = {
  'a1-quadratics': 'parabola-vertex',
  'g-solids': 'pyramid-slant',
  'a2-logarithms': 'log-reflection',
  'a2-matrices': 'neural-layer',
  'pc-unit-circle': 'unit-circle-proj',
};

const COURSE_TOPIC_TABS: Record<CourseId, { id: TopicVisualId; label: string }[]> = {
  'algebra-1': [
    { id: 'a1-statistics', label: 'A1-09 · Regression & Residuals' },
    { id: 'a1-abs-piecewise', label: 'A1-06 · Absolute Value' },
    { id: 'a1-radicals-exp', label: 'A1-03 · Radicals & Exponents' },
    { id: 'a1-inequalities', label: 'A1-05 · Feasible Half-Planes' },
    { id: 'a1-expressions', label: 'A1-01 · Area Factoring' },
    { id: 'a1-linear', label: 'A1-02 · Slope & Secant' },
    { id: 'a1-systems', label: 'A1-04 · Linear Systems' },
    { id: 'a1-exponential', label: 'A1-07 · Exponential Cascade' },
  ],
  geometry: [
    { id: 'g-parallel-angles', label: 'G-01 · Parallel Transversals' },
    { id: 'g-similarity', label: 'G-03 · Similarity & k² Area' },
    { id: 'g-quadrilaterals', label: 'G-05 · Quadrilateral Morph' },
    { id: 'g-right-trig', label: 'G-06 · Pythagorean Visual Proof' },
    { id: 'g-triangles', label: 'G-02 · Rigid Congruence' },
    { id: 'g-transformations', label: 'G-04 · Symmetry & Dilation' },
    { id: 'g-coordinate', label: 'G-07 · Distance & Bisector' },
    { id: 'g-circles', label: 'G-08 · Inscribed Angles' },
  ],
  'algebra-2': [
    { id: 'a2-combinatorics', label: 'A2-07 · Pascal Binomial' },
    { id: 'a2-quad-systems', label: 'A2-02 · Nonlinear Systems' },
    { id: 'a2-radicals', label: 'A2-03 · Inverses & Radicals' },
    { id: 'a2-probability', label: 'A2-09 · Gaussian Bell Curve' },
    { id: 'a2-complex', label: 'A2-01 · Complex Argand Plane' },
    { id: 'a2-polynomials', label: 'A2-05 · Polynomial Multiplicity' },
    { id: 'a2-rational', label: 'A2-08 · Rational Poles' },
  ],
  precalculus: [
    { id: 'pc-parametric', label: 'PC-05 · Lissajous & Velocity' },
    { id: 'pc-trig-identities', label: 'PC-02 · sin²+cos² Conservation' },
    { id: 'pc-law-sines', label: 'PC-04 · Law of Sines (2R)' },
    { id: 'pc-polar', label: 'PC-06 · Polar Rose Curves' },
    { id: 'pc-conics', label: 'PC-07 · Conic Foci' },
    { id: 'pc-series', label: 'PC-08 · Infinite Series' },
    { id: 'pc-limits', label: 'PC-09 · Secant → Tangent Limit' },
    { id: 'pc-vectors', label: 'PC-03 · 2×2 Matrix Warp' },
  ],
};

export function CoursePage() {
  const { courseId } = useParams<{ courseId: string }>();
  const cid: CourseId = isValidCourse(courseId) ? courseId : 'algebra-1';
  const course = COURSES[cid];
  const nodes = CURRICULUM_NODES.filter((n) => n.courseId === cid);
  const topicTabs = COURSE_TOPIC_TABS[cid];
  const [selectedTopicTab, setSelectedTopicTab] = useState<TopicVisualId>(topicTabs[0].id);

  const activeTopicId = topicTabs.some((t) => t.id === selectedTopicTab)
    ? selectedTopicTab
    : topicTabs[0].id;

  const firstUnit = nodes[0];

  return (
    <AtlasShell activeCourse={cid}>
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <aside className="lg:col-span-4 xl:col-span-3 min-w-0 lg:sticky lg:top-20">
          <CourseJourneySidebar courseId={course.id} />
        </aside>

        <div className="lg:col-span-8 xl:col-span-9 min-w-0 space-y-10">
          {/* Course Observatory Header */}
          <header className="instrument-frame fiducial-frame p-6 sm:p-8 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span
                className="px-3.5 py-1 rounded-full text-xs font-mono-data border"
                style={{
                  color: course.accent,
                  borderColor: `${course.accent}55`,
                  backgroundColor: `${course.accent}16`,
                }}
              >
                {course.shortTitle} · CPALMS Course {course.cpalmsCode} · {nodes.length}-Unit Curriculum
              </span>
              <a
                href={course.cpalmsUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-mono-data text-[#A8B2C6] hover:text-[#FFE29E] transition-colors"
              >
                Official CPALMS Description <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-end">
              <div className="xl:col-span-7 space-y-2.5">
                <h1 className="font-serif-editorial text-4xl sm:text-5xl text-[#F7F4EC] leading-tight">
                  {course.title}
                </h1>
                <p className="text-sm sm:text-base text-[#A8B2C6] leading-relaxed">
                  {course.description} Spectral telemetry:{' '}
                  <strong className="text-[#FFE29E]">{course.lightName}</strong>.
                </p>
              </div>

              {/* Prominent Cross-Hub Portals: Florida B.E.S.T. Textbook Hub & String Theory 3D Frontier */}
              <div className="xl:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Link
                  to="/textbook"
                  className="instrument-panel p-4 flex flex-col justify-between gap-2 border-[#F4C46C]/30 hover:border-[#F4C46C]/65 transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono-data text-[10px] uppercase tracking-widest text-[#F4C46C]">
                      28-Chapter Guide
                    </span>
                    <BookOpen className="w-4 h-4 text-[#FFE29E] group-hover:scale-110 transition-transform" />
                  </div>
                  <div>
                    <p className="font-serif-editorial text-lg text-[#F7F4EC]">
                      Florida B.E.S.T. Textbook Hub
                    </p>
                    <p className="text-[11px] text-[#A8B2C6]">
                      EOC benchmarks, worked proofs &amp; MTR habits
                    </p>
                  </div>
                </Link>

                <Link
                  to="/frontier"
                  className="instrument-panel p-4 flex flex-col justify-between gap-2 border-[#F4C46C]/30 hover:border-[#FFE29E]/70 transition-all group"
                  style={{
                    background:
                      'linear-gradient(155deg, rgba(244, 196, 108, 0.12), rgba(11, 12, 18, 0.96))',
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono-data text-[10px] uppercase tracking-widest text-[#FFE29E]">
                      Higher Math Bridge
                    </span>
                    <Orbit className="w-4 h-4 text-[#F4C46C] group-hover:rotate-45 transition-transform" />
                  </div>
                  <div>
                    <p className="font-serif-editorial text-lg text-[#F7F4EC]">
                      String Theory 3D Frontier
                    </p>
                    <p className="text-[11px] text-[#A8B2C6]">
                      See how {course.shortTitle} scales to Calabi-Yau 3D
                    </p>
                  </div>
                </Link>
              </div>
            </div>
          </header>

          {/* Start Here · 3-Stage Guided Roadmap Strip */}
          <section
            aria-label={`${course.title} 3-Stage Guided Roadmap`}
            className="instrument-frame p-5 sm:p-6 space-y-5 border-[#F4C46C]/30"
          >
            <div className="flex flex-wrap items-center justify-between gap-4 border-b hairline-rule pb-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 font-mono-data text-[11px] uppercase tracking-[0.18em] text-[#F4C46C]">
                  <Layers className="w-3.5 h-3.5" />
                  <span>Start Here · 3-Stage Guided Roadmap</span>
                </div>
                <p className="text-xs sm:text-sm text-[#A8B2C6]">
                  Follow {course.title} in order without getting lost — or open the docked side hub
                  anytime for formula survival sheets and plain-English symbol help.
                </p>
              </div>

              {firstUnit && (
                <Link
                  to={firstUnit.route}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-semibold text-[#060609] hover:brightness-110 transition-all shrink-0 shadow-[0_0_24px_-6px_rgba(244,196,108,0.65)]"
                  style={{
                    background: `linear-gradient(135deg, ${course.accent}, #FFE29E)`,
                  }}
                >
                  <PlayCircle className="w-4 h-4" />
                  <span>New to this course? Start at Unit 01</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              {STAGE_DEFINITIONS.map((stage) => {
                const stageNodes = nodes.slice(stage.startIdx, stage.endIdx);
                return (
                  <div
                    key={stage.stage}
                    className="instrument-panel p-4 space-y-3 border-[#F4C46C]/20"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className="font-mono-data text-[10.5px] uppercase tracking-wider font-semibold"
                        style={{ color: course.accent }}
                      >
                        {stage.label}
                      </span>
                      <span className="font-mono-data text-[10px] px-2 py-0.5 rounded-full bg-[#060609] border border-[#F4C46C]/20 text-[#FFE29E]">
                        {stage.unitRange}
                      </span>
                    </div>
                    <p className="text-[11.5px] text-[#A8B2C6] leading-snug">{stage.summary}</p>
                    <div className="space-y-1.5 pt-1">
                      {stageNodes.map((sn) => (
                        <Link
                          key={sn.id}
                          to={sn.route}
                          className="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg bg-[#060609]/85 border border-[#F4C46C]/15 hover:border-[#F4C46C]/50 text-xs transition-colors group"
                        >
                          <span className="flex items-center gap-2 min-w-0">
                            <span
                              className="font-mono-data text-[10px] shrink-0"
                              style={{ color: course.accent }}
                            >
                              {sn.code}
                            </span>
                            <span className="text-[#F7F4EC] truncate">{sn.title}</span>
                          </span>
                          <ArrowRight className="w-3 h-3 text-[#727D94] group-hover:text-[#FFE29E] shrink-0 transition-colors" />
                        </Link>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Complete 9-Unit Visual Course Curriculum */}
          <section className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="font-mono-data text-[10.5px] uppercase tracking-[0.2em] text-[#F4C46C] block">
                  7-Layer Interactive Curriculum
                </span>
                <h2 className="font-serif-editorial text-2xl sm:text-3xl text-[#F7F4EC]">
                  All {nodes.length} Full-Year Visual Modules
                </h2>
              </div>
              <Link
                to="/map"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-mono-data border border-[#F4C46C]/30 bg-[#0B0C12] hover:border-[#F4C46C]/60 transition-colors"
                style={{ color: course.accent }}
              >
                <Compass className="w-3.5 h-3.5" /> Explore on 36-Node Constellation
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {nodes.map((node, index) => {
                const visualKind: EquationVisualKind =
                  FLAGSHIP_CARD_VISUAL[node.id] ??
                  TOPIC_VISUAL_CONFIG[node.id as TopicVisualId]?.axiomVisuals[0] ??
                  'parabola-vertex';
                const stageMeta = getStageMetaForIndex(index);
                const prereqNodes = node.prerequisites
                  .map((pid) => NODE_BY_ID.get(pid))
                  .filter((p): p is CurriculumNode => Boolean(p));

                return (
                  <div
                    key={node.id}
                    className="instrument-frame p-4 sm:p-5 flex flex-col justify-between gap-4"
                    style={{ borderColor: `${course.accent}36` }}
                  >
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span
                            className="px-2.5 py-0.5 rounded-lg font-mono-data text-xs font-semibold border"
                            style={{
                              color: course.accent,
                              borderColor: `${course.accent}55`,
                              backgroundColor: `${course.accent}18`,
                            }}
                          >
                            {node.symbol}
                          </span>
                          <span className="font-mono-data text-xs text-[#A8B2C6]">{node.code}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono-data text-[10px] px-2 py-0.5 rounded-full border border-[#F4C46C]/30 bg-[#F4C46C]/10 text-[#FFE29E]">
                            Stage {stageMeta.stage}
                          </span>
                          <span className="font-mono-data text-[10px] px-2 py-0.5 rounded-full uppercase border border-[#45E6A6]/35 bg-[#45E6A6]/12 text-[#45E6A6]">
                            7 Layers
                          </span>
                        </div>
                      </div>

                      <div aria-label={`${node.title} geometric preview`}>
                        <EquationMiniVisual
                          kind={visualKind}
                          accent={course.accent}
                          heightClass="h-[108px]"
                        />
                      </div>

                      <div>
                        <h3 className="font-serif-editorial text-xl text-[#F7F4EC]">{node.title}</h3>
                        <p className="text-xs text-[#A8B2C6] leading-relaxed mt-1">{node.summary}</p>
                      </div>

                      {/* Clear Prerequisite Indicator */}
                      <div className="px-3 py-2 rounded-xl bg-[#060609]/80 border border-[#F4C46C]/15 space-y-1">
                        <span className="font-mono-data text-[9.5px] uppercase tracking-wider text-[#727D94] block">
                          Prerequisite Path
                        </span>
                        {prereqNodes.length === 0 ? (
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-mono-data text-[#45E6A6]">
                            Start Here · No prior {course.title} unit required
                          </span>
                        ) : (
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="text-[11px] text-[#A8B2C6]">Builds on:</span>
                            {prereqNodes.map((pn) => (
                              <Link
                                key={pn.id}
                                to={pn.route}
                                className="px-2 py-0.5 rounded-full text-[10px] font-mono-data bg-[#11131C] border border-[#F4C46C]/25 text-[#FFE29E] hover:border-[#F4C46C]/60 transition-colors"
                              >
                                {pn.code} · {pn.title}
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="instrument-panel px-3 py-2 overflow-x-auto">
                        <MathTex tex={node.formulaTex} className="text-xs text-[#F7F4EC]" />
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        {node.standards.map((code) => {
                          const std = VERIFIED_STANDARDS[code];
                          return (
                            <a
                              key={code}
                              href={std?.sourceUrl ?? course.cpalmsUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="px-2 py-0.5 rounded-full text-[10px] font-mono-data bg-[#060609] border border-[#F4C46C]/20 text-[#A8B2C6] hover:text-[#FFE29E] hover:border-[#F4C46C]/45 transition-colors"
                            >
                              {code}
                            </a>
                          );
                        })}
                      </div>
                    </div>

                    <Link
                      to={node.route}
                      className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full text-xs font-semibold text-[#060609] hover:brightness-110 transition-all shadow-[0_0_22px_-8px_rgba(244,196,108,0.55)]"
                      style={{
                        background: `linear-gradient(135deg, ${course.accent}, #FFE29E)`,
                      }}
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      Open Visual 7-Layer Lesson
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Live Multi-Unit Visual Sandbox */}
          <section className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <span
                  className="font-mono-data text-[10px] uppercase tracking-widest block"
                  style={{ color: course.accent }}
                >
                  60fps Interactive Concept Animators ({topicTabs.length} Engines)
                </span>
                <h2 className="font-serif-editorial text-2xl sm:text-3xl text-[#F7F4EC]">
                  Live Visual Laboratories for {course.title}
                </h2>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {topicTabs.map((tab) => {
                  const active = activeTopicId === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setSelectedTopicTab(tab.id)}
                      className={`px-3 py-1.5 rounded-full text-[11px] font-mono-data border transition-all ${
                        active
                          ? 'text-[#060609] font-semibold'
                          : 'bg-[#0B0C12] text-[#A8B2C6] border-[#F4C46C]/20 hover:text-[#F7F4EC] hover:border-[#F4C46C]/45'
                      }`}
                      style={
                        active
                          ? {
                              backgroundColor: course.accent,
                              borderColor: course.accent,
                              boxShadow: `0 0 18px -5px ${course.accent}`,
                            }
                          : undefined
                      }
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <TopicVisualCanvas topicId={activeTopicId} />
          </section>

          {/* Primary Flagship Course Workbench */}
          {cid === 'algebra-1' && (
            <section className="space-y-4">
              <h2 className="font-serif-editorial text-2xl sm:text-3xl text-[#F7F4EC]">
                Algebra 1 Flagship Instrument · Quadratic Workbench
              </h2>
              <QuadraticWorkbench />
            </section>
          )}

          {cid === 'geometry' && (
            <section className="space-y-4">
              <h2 className="font-serif-editorial text-2xl sm:text-3xl text-[#F7F4EC]">
                Geometry Flagship 3D Instrument · Hinged Solid Nets
              </h2>
              <SolidNetLab />
            </section>
          )}

          {cid === 'algebra-2' && (
            <section className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="font-serif-editorial text-2xl sm:text-3xl text-[#F7F4EC]">
                  Algebra 2 Flagship Instruments · Logarithms &amp; Harmonic Spine
                </h2>
                <Link
                  to="/neural"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-mono-data bg-[#46D6E8]/15 text-[#46D6E8] border border-[#46D6E8]/45 hover:bg-[#46D6E8]/25 transition-colors"
                >
                  <Network className="w-3.5 h-3.5" />
                  Open Harmonic Matrix &amp; Vortex Lab →
                </Link>
              </div>
              <LogarithmLab />
            </section>
          )}

          {cid === 'precalculus' && (
            <section className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="font-serif-editorial text-2xl sm:text-3xl text-[#F7F4EC]">
                  Precalculus Flagship Harmonic &amp; Vector Labs
                </h2>
                <Link
                  to="/frontier"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-mono-data bg-[#F4C46C]/15 text-[#FFE29E] border border-[#F4C46C]/45 hover:bg-[#F4C46C]/25 transition-colors"
                >
                  <Orbit className="w-3.5 h-3.5 text-[#F4C46C]" />
                  Explore Calabi-Yau &amp; String 3D Frontier →
                </Link>
              </div>
              <UnitCircleWaveCanvas />
              <VectorParallelogramCanvas />
            </section>
          )}
        </div>
      </div>
    </AtlasShell>
  );
}
