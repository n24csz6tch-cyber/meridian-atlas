import { Link } from 'react-router-dom';
import { ArrowLeft, Compass } from 'lucide-react';
import { COURSES, CURRICULUM_NODES } from '../data/curriculumGraph';
import { CourseId } from '../data/standards';

interface LessonNavHeaderProps {
  courseId: CourseId;
  activeNodeId: string;
  code: string;
}

const LAYER_LINKS = [
  { href: '#layer-1', num: '01', label: 'Visual Lab' },
  { href: '#layer-2', num: '02', label: 'Visual Equations' },
  { href: '#layer-3', num: '03', label: 'Step Proof' },
  { href: '#layer-4', num: '04', label: 'Practice' },
  { href: '#layer-5', num: '05', label: 'Error Visualized' },
  { href: '#layer-6', num: '06', label: 'Real World' },
  { href: '#layer-7', num: '07', label: 'Standards' },
];

export function LessonNavHeader({ courseId, activeNodeId, code }: LessonNavHeaderProps) {
  const course = COURSES[courseId];
  const siblings = CURRICULUM_NODES.filter((n) => n.courseId === courseId);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b hairline-rule pb-4">
        <div className="flex items-center gap-4">
          <Link
            to={`/course/${courseId}`}
            className="inline-flex items-center gap-1.5 text-xs font-mono-data text-[#A5B4CC] hover:text-[#F4F3EE] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> {course.title} Hub
          </Link>
          <Link
            to="/map"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-mono-data text-[#6F7F99] hover:text-[#38D9FF] transition-colors"
          >
            <Compass className="w-3.5 h-3.5" /> 36-Symbol Neural Atlas
          </Link>
        </div>
        <span
          className="px-3 py-1 rounded-full font-mono-data text-[10.5px] uppercase tracking-[0.18em] border"
          style={{
            color: course.accent,
            borderColor: `${course.accent}55`,
            backgroundColor: `${course.accent}16`,
          }}
        >
          {code} · 7-LAYER VISUAL MODULE · {course.shortTitle}
        </span>
      </div>

      {/* All 9 Sibling Units in Course */}
      <div className="flex flex-wrap items-center gap-1.5">
        {siblings.map((node) => {
          const active = node.id === activeNodeId;
          return (
            <Link
              key={node.id}
              to={node.route}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono-data border transition-all ${
                active
                  ? 'text-[#03050A] font-semibold'
                  : 'bg-[#090E18]/90 text-[#A5B4CC] border-white/10 hover:text-[#F4F3EE] hover:border-white/25'
              }`}
              style={
                active
                  ? {
                      backgroundColor: course.accent,
                      borderColor: course.accent,
                      boxShadow: `0 0 16px -4px ${course.accent}`,
                    }
                  : undefined
              }
            >
              <span className={active ? 'opacity-80' : 'opacity-60'}>{node.code}</span>
              <span>{node.title}</span>
            </Link>
          );
        })}
      </div>

      {/* 7-Layer Quick Jump Bar */}
      <nav
        aria-label="Lesson layers"
        className="flex flex-wrap items-center gap-1.5 pt-1"
      >
        {LAYER_LINKS.map((l) => (
          <a
            key={l.href}
            href={l.href}
            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono-data bg-white/[0.03] border border-white/[0.08] text-[#6F7F99] hover:text-[#F4F3EE] hover:border-white/25 transition-colors"
          >
            <span style={{ color: course.accent }}>{l.num}</span>
            <span>{l.label}</span>
          </a>
        ))}
      </nav>
    </div>
  );
}
