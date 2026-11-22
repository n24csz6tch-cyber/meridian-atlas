import { ReactNode, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Compass, Menu, Presentation, X } from 'lucide-react';
import { COURSES } from '../data/curriculumGraph';
import { CourseId, FLDOE_SOURCES } from '../data/standards';
import { AmbientNeuralBackdrop } from '../visuals/bg/AmbientNeuralBackdrop';

interface AtlasShellProps {
  children: ReactNode;
  activeCourse?: CourseId;
}

const NAV_ITEMS = [
  { label: 'Atlas', to: '/' },
  { label: 'Neural Map', to: '/map' },
  { label: 'Neural & Vortex', to: '/neural' },
  { label: 'Algebra 1', to: '/course/algebra-1' },
  { label: 'Geometry', to: '/course/geometry' },
  { label: 'Algebra 2', to: '/course/algebra-2' },
  { label: 'Precalculus', to: '/course/precalculus' },
  { label: '16 Labs', to: '/instruments' },
  { label: 'Planner', to: '/planner' },
];

export function AtlasShell({ children, activeCourse }: AtlasShellProps) {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const accent = activeCourse ? COURSES[activeCourse].accent : '#F5BC5E';
  const glow = activeCourse ? `${COURSES[activeCourse].accent}34` : 'rgba(245, 188, 94, 0.2)';

  return (
    <div
      data-course={activeCourse ?? 'algebra-1'}
      className="relative min-h-screen flex flex-col bg-[#03050A] text-[#F4F3EE] cartographic-grid"
      style={{
        ['--active-accent' as string]: accent,
        ['--active-glow' as string]: glow,
      }}
    >
      {/* Living global atmospheric aura + Claude-style ambient neural filaments */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 observatory-aura"
      />
      <AmbientNeuralBackdrop accent={accent} />

      {/* Sleek Floating Glass Navigation Pill */}
      <header className="sticky top-0 z-30 px-3 sm:px-6 pt-3 pb-2 pointer-events-none">
        <div className="pointer-events-auto max-w-7xl mx-auto obsidian-glass rounded-2xl px-3.5 sm:px-5 h-14 flex items-center justify-between gap-2 relative overflow-hidden">
          <div
            className="absolute top-0 left-0 right-0 h-[1.5px] opacity-85"
            style={{
              background: `linear-gradient(90deg, transparent 5%, ${accent} 38%, #38D9FF 62%, transparent 95%)`,
            }}
          />

          <Link to="/" className="flex items-center gap-2 shrink-0 group">
            <span
              className="w-8 h-8 rounded-xl border flex items-center justify-center transition-all"
              style={{
                borderColor: `${accent}66`,
                backgroundColor: `${accent}18`,
                boxShadow: `0 0 18px -4px ${accent}80`,
              }}
            >
              <Compass className="w-4 h-4" style={{ color: accent }} />
            </span>
            <div className="leading-none">
              <span className="font-serif-editorial text-base lg:text-lg tracking-wide text-[#F4F3EE] block">
                MERIDIAN
              </span>
              <span className="hidden xl:block font-mono-data text-[8.5px] uppercase tracking-[0.22em] text-[#6F7F99]">
                Neural Math Atlas
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-0.5 lg:gap-1" aria-label="Main navigation">
            {NAV_ITEMS.map((item) => {
              const isActive =
                item.to === '/'
                  ? location.pathname === '/'
                  : location.pathname.startsWith(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`relative px-1.5 lg:px-2.5 xl:px-3 py-1.5 rounded-full text-[10.5px] lg:text-xs font-medium whitespace-nowrap transition-all ${
                    isActive
                      ? 'text-[#F4F3EE] bg-white/[0.08] border border-white/[0.15] shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]'
                      : 'text-[#A5B4CC] hover:text-[#F4F3EE] hover:bg-white/[0.04]'
                  }`}
                >
                  {isActive && (
                    <span
                      className="inline-block w-1.5 h-1.5 rounded-full mr-1.5 align-middle"
                      style={{ backgroundColor: accent, boxShadow: `0 0 8px ${accent}` }}
                    />
                  )}
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-1.5 shrink-0">
            <Link
              to="/presentation"
              className="hidden sm:inline-flex items-center gap-1.5 px-2.5 lg:px-3 py-1.5 rounded-full text-[11px] font-mono-data border transition-all hover:brightness-110"
              style={{
                borderColor: `${accent}66`,
                backgroundColor: `${accent}18`,
                color: accent,
                boxShadow: `0 0 18px -6px ${accent}`,
              }}
              title="Open Live Observatory Presentation (Alt+P)"
            >
              <Presentation className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">Presentation</span>
              <span className="lg:hidden">Stage</span>
            </Link>

            <button
              type="button"
              onClick={() => setMobileOpen((o) => !o)}
              aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
              className="md:hidden p-2 rounded-xl border border-white/15 text-[#F4F3EE]"
            >
              {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <nav
            aria-label="Mobile navigation"
            className="pointer-events-auto md:hidden mt-2 max-w-7xl mx-auto obsidian-glass rounded-2xl p-3 grid grid-cols-2 sm:grid-cols-3 gap-1.5"
          >
            <Link
              to="/presentation"
              onClick={() => setMobileOpen(false)}
              className="px-3 py-2 rounded-xl text-xs font-medium inline-flex items-center gap-1.5 border"
              style={{
                borderColor: `${accent}55`,
                backgroundColor: `${accent}16`,
                color: accent,
              }}
            >
              <Presentation className="w-3.5 h-3.5" />
              Presentation Mode
            </Link>
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
                  className={`px-3 py-2 rounded-xl text-xs font-medium ${
                    isActive
                      ? 'text-[#F4F3EE] bg-white/10 border border-white/15'
                      : 'text-[#A5B4CC] hover:text-[#F4F3EE]'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        )}
      </header>

      <main className="relative z-10 flex-1">{children}</main>

      <footer className="relative z-10 border-t hairline-rule bg-[#04070E]/90 backdrop-blur-md py-10 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 text-xs text-[#6F7F99]">
          <div className="space-y-1.5">
            <p className="font-serif-editorial text-base text-[#F4F3EE]">
              MERIDIAN — Living Neural Atlas of High School Mathematics
            </p>
            <p>
              36 interactive 7-layer lessons with visualized equations aligned with{' '}
              <a
                href={FLDOE_SOURCES.bestIndex.url}
                target="_blank"
                rel="noreferrer"
                className="text-[#A5B4CC] underline underline-offset-2 hover:text-[#F4F3EE]"
              >
                Florida B.E.S.T. Standards (FLDOE / CPALMS)
              </a>{' '}
              · Consulted Nov 22, 2026.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4 font-mono-data text-[11px]">
            <Link to="/presentation" className="text-[#F5BC5E] hover:opacity-85 inline-flex items-center gap-1">
              <Presentation className="w-3 h-3" /> Presentation Mode
            </Link>
            <Link to="/map" className="text-[#A5B4CC] hover:text-[#F4F3EE]">
              Neural Atlas Map
            </Link>
            <Link to="/neural" className="text-[#38D9FF] hover:opacity-80">
              Neural &amp; Vortex
            </Link>
            <Link to="/course/algebra-1" className="text-[#F5BC5E] hover:opacity-80">
              Algebra 1
            </Link>
            <Link to="/course/geometry" className="text-[#38D9FF] hover:opacity-80">
              Geometry
            </Link>
            <Link to="/course/algebra-2" className="text-[#36EBA8] hover:opacity-80">
              Algebra 2
            </Link>
            <Link to="/course/precalculus" className="text-[#FF7A5C] hover:opacity-80">
              Precalculus
            </Link>
            <Link to="/instruments" className="text-[#A5B4CC] hover:text-[#F4F3EE]">
              16 Labs
            </Link>
            <Link to="/planner" className="text-[#A5B4CC] hover:text-[#F4F3EE]">
              Grade Planner
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
