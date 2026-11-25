import { Link } from 'react-router-dom';
import { BookOpen, ChevronLeft, ChevronRight, Compass, Home } from 'lucide-react';
import { COURSES, CURRICULUM_NODES } from '../data/curriculumGraph';
import { CourseId } from '../data/standards';

export interface LessonNavHeaderProps {
  courseId: CourseId;
  activeNodeId: string;
  code: string;
}

const LAYER_LINKS = [
  { href: '#layer-1', num: '01', label: 'Visual Lab' },
  { href: '#layer-2', num: '02', label: 'Visual Equations' },
  { href: '#layer-3', num: '03', label: 'Step Proof' },
  { href: '#layer-4', num: '04', label: 'Practice' },
  { href: '#layer-5', num: '05', label: 'Error Proof' },
  { href: '#layer-6', num: '06', label: 'Real World' },
  { href: '#layer-7', num: '07', label: 'Standards' },
];

export function LessonNavHeader({ courseId, activeNodeId, code }: LessonNavHeaderProps) {
  const course = COURSES[courseId];
  const siblings = CURRICULUM_NODES.filter((n) => n.courseId === courseId);
  const courseIdx = siblings.findIndex((n) => n.id === activeNodeId);
  const stepNumber = courseIdx >= 0 ? courseIdx + 1 : 1;
  const totalSteps = siblings.length || 9;

  const globalIdx = CURRICULUM_NODES.findIndex((n) => n.id === activeNodeId);
  const prevNode = globalIdx > 0 ? CURRICULUM_NODES[globalIdx - 1] : null;
  const nextNode =
    globalIdx >= 0 && globalIdx < CURRICULUM_NODES.length - 1
      ? CURRICULUM_NODES[globalIdx + 1]
      : null;

  return (
    <div className="aurea-glass-card p-3.5 sm:p-4 space-y-3">
      {/* Top Row: Clean Breadcrumbs + Step K of 9 + Prev/Next Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b hairline-rule pb-3">
        <nav
          aria-label="Lesson breadcrumbs"
          className="flex flex-wrap items-center gap-1.5 text-xs font-mono-data min-w-0"
        >
          <Link
            to="/"
            className="inline-flex items-center gap-1 text-[#A8B2C6] hover:text-[#FFE5A3] transition-colors"
          >
            <Home className="w-3.5 h-3.5 text-[#F4C46C]" />
            <span>Course Hub</span>
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-[#727D94] shrink-0" />
          <Link
            to={`/course/${courseId}`}
            className="font-semibold hover:underline underline-offset-2 transition-colors"
            style={{ color: course.accent }}
          >
            {course.title}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-[#727D94] shrink-0 hidden sm:inline" />
          <Link
            to="/textbook"
            className="hidden sm:inline-flex items-center gap-1 text-[#A8B2C6] hover:text-[#FFE5A3] transition-colors"
          >
            <BookOpen className="w-3.5 h-3.5 text-[#F4C46C]" />
            <span>FL Textbook</span>
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-[#727D94] shrink-0 hidden md:inline" />
          <Link
            to="/map"
            className="hidden md:inline-flex items-center gap-1 text-[#A8B2C6] hover:text-[#46D6E8] transition-colors"
          >
            <Compass className="w-3.5 h-3.5 text-[#46D6E8]" />
            <span>Constellation</span>
          </Link>
        </nav>

        {/* Step K of 9 Badge + Prev / Next Arrow Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <span
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-mono-data text-[10.5px] uppercase tracking-[0.14em] border"
            style={{
              color: '#FFE5A3',
              borderColor: 'rgba(244, 196, 108, 0.42)',
              background: 'linear-gradient(135deg, rgba(244, 196, 108, 0.16), rgba(18, 18, 29, 0.9))',
              boxShadow: 'inset 0 1px 0 rgba(255, 229, 163, 0.18), 0 0 16px -8px rgba(244, 196, 108, 0.5)',
            }}
          >
            <span style={{ color: course.accent }}>{code}</span>
            <span className="text-[#727D94]">·</span>
            <span>
              Step {stepNumber} of {totalSteps}
            </span>
          </span>

          <div className="inline-flex items-center gap-1">
            {prevNode ? (
              <Link
                to={prevNode.route}
                aria-label={`Previous lesson: ${prevNode.title}`}
                title={`Previous: ${prevNode.code} · ${prevNode.title}`}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-mono-data border border-[#F4C46C]/22 bg-[#0B0B12]/90 text-[#A8B2C6] hover:text-[#FFE5A3] hover:border-[#F4C46C]/50 transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5 text-[#F4C46C]" />
                <span className="hidden sm:inline">Prev</span>
              </Link>
            ) : (
              <span
                aria-disabled="true"
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-mono-data border border-[#F4C46C]/10 bg-[#050508]/60 text-[#727D94]/45 cursor-not-allowed"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Prev</span>
              </span>
            )}

            {nextNode ? (
              <Link
                to={nextNode.route}
                aria-label={`Next lesson: ${nextNode.title}`}
                title={`Next: ${nextNode.code} · ${nextNode.title}`}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-mono-data border border-[#F4C46C]/32 bg-[#12121D]/90 text-[#FFE5A3] hover:border-[#FFE5A3]/65 hover:bg-[#F4C46C]/15 transition-colors"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="w-3.5 h-3.5 text-[#F4C46C]" />
              </Link>
            ) : (
              <span
                aria-disabled="true"
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-mono-data border border-[#F4C46C]/10 bg-[#050508]/60 text-[#727D94]/45 cursor-not-allowed"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Concise 7-Layer Quick-Jump Pill Bar */}
      <nav
        aria-label="Lesson layers"
        className="flex items-center gap-1.5 overflow-x-auto no-scrollbar max-w-full"
      >
        {LAYER_LINKS.map((l) => (
          <a
            key={l.href}
            href={l.href}
            className="shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10.5px] font-mono-data bg-[#0B0B12]/90 border border-[#F4C46C]/16 text-[#A8B2C6] hover:text-[#FFE5A3] hover:border-[#F4C46C]/48 hover:bg-[#F4C46C]/[0.08] transition-all"
          >
            <span style={{ color: course.accent }}>{l.num}</span>
            <span>{l.label}</span>
          </a>
        ))}
      </nav>
    </div>
  );
}
