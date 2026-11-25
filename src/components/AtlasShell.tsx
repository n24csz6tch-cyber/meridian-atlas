import { ReactNode, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BookOpen, Menu, Orbit, Presentation, Sparkles, Trophy, X } from 'lucide-react';
import { COURSES, CURRICULUM_NODES } from '../data/curriculumGraph';
import { CourseId, FLDOE_SOURCES } from '../data/standards';
import { AmbientNeuralBackdrop } from '../visuals/bg/AmbientNeuralBackdrop';

interface AtlasShellProps {
  children: ReactNode;
  activeCourse?: CourseId;
}

const MASTERED_STORAGE_KEY = 'aurea_mastered_nodes_v1';
const TOTAL_NODES = CURRICULUM_NODES.length;

function readMasteredCount(): number {
  if (typeof window === 'undefined') return 0;
  try {
    const raw = window.localStorage.getItem(MASTERED_STORAGE_KEY);
    if (!raw) return 0;
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return 0;
    const unique = new Set(
      parsed.filter((item): item is string => typeof item === 'string' && item.trim().length > 0),
    );
    return Math.min(TOTAL_NODES, unique.size);
  } catch {
    return 0;
  }
}

interface NavItem {
  label: string;
  to: string;
  coreGold?: boolean;
  highlight?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Atlas', to: '/' },
  { label: 'Algebra 1', to: '/course/algebra-1', coreGold: true },
  { label: 'String 3D', to: '/frontier', highlight: true },
  { label: 'FL Book', to: '/textbook' },
  { label: 'Constellation', to: '/map' },
  { label: 'Geom', to: '/course/geometry' },
  { label: 'Alg 2', to: '/course/algebra-2' },
  { label: 'Precalc', to: '/course/precalculus' },
  { label: '3D Labs', to: '/instruments' },
  { label: 'Spine', to: '/neural' },
  { label: 'Planner', to: '/planner' },
];

export function AtlasShell({ children, activeCourse }: AtlasShellProps) {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [masteredCount, setMasteredCount] = useState<number>(() => readMasteredCount());

  useEffect(() => {
    const syncProgress = () => {
      setMasteredCount(readMasteredCount());
    };
    syncProgress();
    window.addEventListener('aurea-progress-change', syncProgress);
    window.addEventListener('storage', syncProgress);
    return () => {
      window.removeEventListener('aurea-progress-change', syncProgress);
      window.removeEventListener('storage', syncProgress);
    };
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const accent = activeCourse ? COURSES[activeCourse].accent : '#F4C46C';
  const glow = activeCourse ? `${COURSES[activeCourse].accent}36` : 'rgba(244, 196, 108, 0.22)';
  const masteredPct = Math.round((masteredCount / Math.max(1, TOTAL_NODES)) * 100);

  return (
    <div
      data-course={activeCourse ?? 'algebra-1'}
      className="relative min-h-screen flex flex-col bg-[#050508] text-[#F7F4EC] cartographic-grid overflow-x-clip"
      style={{
        ['--active-accent' as string]: accent,
        ['--active-glow' as string]: glow,
      }}
    >
      {/* Living global atmospheric aura + ambient golden neural filaments */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 observatory-aura"
      />
      <AmbientNeuralBackdrop accent={accent} />

      {/* AUREA Golden Command Bar */}
      <header className="sticky top-0 z-30 px-2.5 sm:px-5 pt-2.5 pb-2 pointer-events-none">
        <div className="pointer-events-auto max-w-[1380px] mx-auto obsidian-glass rounded-2xl px-3 sm:px-4 h-14 flex items-center justify-between gap-2 relative overflow-hidden">
          <div
            className="absolute top-0 left-0 right-0 h-[1.5px] opacity-90 pointer-events-none"
            style={{
              background: `linear-gradient(90deg, transparent 4%, #F4C46C 30%, ${accent} 52%, #FFE5A3 74%, transparent 96%)`,
            }}
          />

          {/* Brand Emblem */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
            <span
              className="w-8 h-8 rounded-xl border flex items-center justify-center transition-all group-hover:scale-105"
              style={{
                borderColor: 'rgba(244, 196, 108, 0.48)',
                background: 'radial-gradient(circle at 30% 30%, rgba(255, 229, 163, 0.25), rgba(244, 196, 108, 0.08))',
                boxShadow: `0 0 20px -5px ${accent}99`,
              }}
            >
              <Orbit className="w-4 h-4 text-[#FFE5A3]" />
            </span>
            <div className="leading-none">
              <span className="font-serif-editorial text-lg tracking-wide text-[#F7F4EC] block">
                AUREA
              </span>
              <span className="hidden 2xl:block font-mono-data text-[8px] uppercase tracking-[0.24em] text-[#F4C46C]/85">
                Florida B.E.S.T. Atlas
              </span>
            </div>
          </Link>

          {/* Scroll-Safe Interactive Pill Rail (never clips on mid-width viewports) */}
          <nav
            aria-label="Main navigation"
            className="hidden md:flex flex-1 min-w-0 items-center justify-start xl:justify-center gap-1 overflow-x-auto no-scrollbar px-1"
          >
            {NAV_ITEMS.map((item) => {
              const isActive =
                item.to === '/'
                  ? location.pathname === '/'
                  : location.pathname.startsWith(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`relative shrink-0 px-2.5 py-1.5 rounded-full text-[11px] font-medium whitespace-nowrap transition-all border ${
                    isActive
                      ? 'aurea-pill-active font-semibold'
                      : item.coreGold
                        ? 'text-[#FFE5A3] border-[#F4C46C]/42 bg-gradient-to-r from-[#F4C46C]/[0.16] to-[#FFE5A3]/[0.08] shadow-[inset_0_1px_0_rgba(255,229,163,0.22),0_0_16px_-8px_rgba(244,196,108,0.55)] hover:border-[#FFE5A3]/70 hover:bg-[#F4C46C]/[0.22]'
                        : item.highlight
                          ? 'text-[#FFE5A3]/95 border-[#F4C46C]/25 bg-[#F4C46C]/[0.06] hover:border-[#F4C46C]/50 hover:bg-[#F4C46C]/[0.12]'
                          : 'text-[#A8B2C6] border-transparent hover:text-[#F7F4EC] hover:bg-white/[0.04] hover:border-[#F4C46C]/22'
                  }`}
                >
                  {isActive ? (
                    <span
                      className="inline-block w-1.5 h-1.5 rounded-full mr-1.5 align-middle"
                      style={{ backgroundColor: accent, boxShadow: `0 0 8px ${accent}` }}
                    />
                  ) : item.coreGold ? (
                    <Sparkles className="inline-block w-2.5 h-2.5 mr-1 -mt-0.5 text-[#F4C46C]" />
                  ) : null}
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Progress Pill + Stage Action + Mobile Drawer Toggle */}
          <div className="flex items-center gap-1.5 shrink-0">
            <Link
              to="/course/algebra-1"
              title="View your mastery progress across all 36 modules"
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full text-[10.5px] sm:text-[11px] font-mono-data font-medium border border-[#F4C46C]/35 bg-[#12121D]/90 text-[#FFE5A3] hover:border-[#FFE5A3]/65 hover:bg-[#F4C46C]/15 transition-all shadow-[inset_0_1px_0_rgba(255,229,163,0.16)]"
            >
              <Trophy className="w-3 h-3 text-[#F4C46C] shrink-0" />
              <span className="sm:hidden">{masteredCount}/{TOTAL_NODES}</span>
              <span className="hidden sm:inline">
                {masteredCount} / {TOTAL_NODES} Mastered
              </span>
            </Link>

            <Link
              to="/presentation"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-mono-data font-medium border transition-all hover:brightness-110"
              style={{
                borderColor: 'rgba(244, 196, 108, 0.55)',
                background: 'linear-gradient(135deg, rgba(244, 196, 108, 0.22), rgba(255, 229, 163, 0.1))',
                color: '#FFE5A3',
                boxShadow: '0 0 22px -6px rgba(244, 196, 108, 0.65)',
              }}
              title="Open Live Observatory Stage (Alt+P)"
            >
              <Presentation className="w-3.5 h-3.5 text-[#F4C46C]" />
              <span>Stage</span>
            </Link>

            <button
              type="button"
              onClick={() => setMobileOpen((o) => !o)}
              aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileOpen}
              className="md:hidden p-2 rounded-xl border border-[#F4C46C]/28 bg-[#12121D]/85 text-[#F7F4EC] hover:border-[#F4C46C]/55 transition-colors"
            >
              {mobileOpen ? <X className="w-4 h-4 text-[#F4C46C]" /> : <Menu className="w-4 h-4 text-[#F4C46C]" />}
            </button>
          </div>
        </div>

        {/* Mobile Drawer */}
        {mobileOpen && (
          <nav
            aria-label="Mobile navigation"
            className="pointer-events-auto md:hidden mt-2 max-w-[1380px] mx-auto obsidian-glass rounded-2xl p-3 space-y-2.5"
          >
            {/* Mobile Mastery Progress Card */}
            <Link
              to="/course/algebra-1"
              onClick={() => setMobileOpen(false)}
              className="block p-3 rounded-xl border border-[#F4C46C]/35 bg-gradient-to-r from-[#12121D] via-[#12121D] to-[#F4C46C]/[0.1] space-y-2"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 font-mono-data text-xs font-semibold text-[#FFE5A3]">
                  <Trophy className="w-3.5 h-3.5 text-[#F4C46C]" />
                  {masteredCount} / {TOTAL_NODES} Mastered
                </span>
                <span className="font-mono-data text-[10px] text-[#F4C46C]">
                  Algebra 1 Hub →
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-[#050508] border border-[#F4C46C]/20 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${masteredPct}%`,
                    background: 'linear-gradient(90deg, #B88938, #F4C46C, #FFE5A3)',
                  }}
                />
              </div>
            </Link>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              {NAV_ITEMS.map((item) => {
                const isActive =
                  item.to === '/'
                    ? location.pathname === '/'
                    : location.pathname.startsWith(item.to);
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setMobileOpen(false)}
                    className={`px-3 py-2 rounded-xl text-xs font-medium flex items-center gap-1.5 border transition-colors ${
                      isActive
                        ? 'aurea-pill-active font-semibold'
                        : item.coreGold
                          ? 'text-[#FFE5A3] bg-[#F4C46C]/[0.12] border-[#F4C46C]/40'
                          : 'text-[#A8B2C6] bg-[#12121D]/70 border-[#F4C46C]/14 hover:text-[#F7F4EC]'
                    }`}
                  >
                    {isActive ? (
                      <span
                        className="w-1.5 h-1.5 rounded-full shrink-0"
                        style={{ backgroundColor: accent }}
                      />
                    ) : item.coreGold ? (
                      <Sparkles className="w-3 h-3 text-[#F4C46C] shrink-0" />
                    ) : null}
                    <span className="truncate">{item.label}</span>
                  </Link>
                );
              })}
            </div>

            <Link
              to="/presentation"
              onClick={() => setMobileOpen(false)}
              className="w-full px-3.5 py-2.5 rounded-xl text-xs font-mono-data font-semibold inline-flex items-center justify-center gap-2 border border-[#F4C46C]/50 bg-[#F4C46C]/15 text-[#FFE5A3]"
            >
              <Presentation className="w-3.5 h-3.5 text-[#F4C46C]" />
              Launch Observatory Stage Mode
            </Link>
          </nav>
        )}
      </header>

      <main className="relative z-10 flex-1 min-w-0 overflow-x-clip">{children}</main>

      {/* Clean AUREA Observatory Footer (Zero Watermarks) */}
      <footer className="relative z-10 border-t border-[#F4C46C]/16 bg-[#050508]/94 backdrop-blur-md py-10 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 text-xs text-[#727D94]">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2">
              <Orbit className="w-4 h-4 text-[#F4C46C]" />
              <p className="font-serif-editorial text-lg text-[#F7F4EC] tracking-wide">
                AUREA — Living Atlas of Mathematics &amp; String Geometry
              </p>
            </div>
            <p className="leading-relaxed text-[#A8B2C6]">
              36 interactive 7-layer visual modules, 28 Florida B.E.S.T. textbook chapters, and
              3D manifold labs aligned with{' '}
              <a
                href={FLDOE_SOURCES.bestIndex.url}
                target="_blank"
                rel="noreferrer"
                className="text-[#FFE5A3] underline underline-offset-2 hover:text-[#F7F4EC]"
              >
                Florida B.E.S.T. Standards (FLDOE / CPALMS)
              </a>{' '}
              · Consulted Nov 22, 2026.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 font-mono-data text-[11px]">
            <Link to="/presentation" className="text-[#FFE5A3] hover:opacity-85 inline-flex items-center gap-1">
              <Presentation className="w-3 h-3 text-[#F4C46C]" /> Stage
            </Link>
            <Link to="/frontier" className="text-[#F4C46C] hover:opacity-85">
              String 3D
            </Link>
            <Link to="/textbook" className="text-[#FFE5A3] hover:opacity-85 inline-flex items-center gap-1">
              <BookOpen className="w-3 h-3 text-[#F4C46C]" /> FL Book
            </Link>
            <Link to="/map" className="text-[#A8B2C6] hover:text-[#F7F4EC]">
              Constellation
            </Link>
            <Link to="/neural" className="text-[#46D6E8] hover:opacity-80">
              Harmonic Spine
            </Link>
            <Link to="/course/algebra-1" className="text-[#F5C25B] hover:opacity-80">
              Algebra 1
            </Link>
            <Link to="/course/geometry" className="text-[#46D6E8] hover:opacity-80">
              Geom
            </Link>
            <Link to="/course/algebra-2" className="text-[#45E6A6] hover:opacity-80">
              Alg 2
            </Link>
            <Link to="/course/precalculus" className="text-[#FF8563] hover:opacity-80">
              Precalc
            </Link>
            <Link to="/instruments" className="text-[#A8B2C6] hover:text-[#F7F4EC]">
              3D Labs
            </Link>
            <Link to="/planner" className="text-[#A8B2C6] hover:text-[#F7F4EC]">
              Planner
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
