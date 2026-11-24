import { useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, GitBranch, Network, Orbit } from 'lucide-react';
import { AtlasShell } from '../components/AtlasShell';
import { NeuralAtlasMap } from '../visuals/map/NeuralAtlasMap';
import { PrerequisiteMap } from '../visuals/map/PrerequisiteMap';

export function MapPage() {
  const [viewMode, setViewMode] = useState<'neural' | 'chart'>('neural');

  return (
    <AtlasShell>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <header className="instrument-frame fiducial-frame p-6 sm:p-7 flex flex-col lg:flex-row lg:items-end justify-between gap-5">
          <div className="space-y-2">
            <span className="font-mono-data text-[11px] uppercase tracking-[0.22em] text-[#F4C46C] block">
              Observatory Constellation · 36 Interconnected Mathematical Nodes
            </span>
            <h1 className="font-serif-editorial text-3xl sm:text-5xl text-[#F7F4EC]">
              Mathematical <em className="italic text-[#FFE29E]">Constellation</em> Atlas
            </h1>
            <p className="text-xs sm:text-sm text-[#A8B2C6] max-w-2xl leading-relaxed">
              Every glowing symbol launches a full 7-layer visual module. Hover or click any node to
              trace its upstream prerequisites (champagne pulses) and unlocked higher math (cyan
              pulses) — click again or double-click to enter the lesson directly.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col items-stretch sm:items-center lg:items-end gap-2.5 shrink-0">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setViewMode('neural')}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-mono-data border transition-all ${
                  viewMode === 'neural'
                    ? 'bg-[#46D6E8] text-[#060609] border-[#46D6E8] font-semibold shadow-[0_0_22px_-6px_#46D6E8]'
                    : 'bg-[#0B0C12] text-[#A8B2C6] border-[#F4C46C]/20 hover:text-[#F7F4EC] hover:border-[#F4C46C]/45'
                }`}
              >
                <Network className="w-3.5 h-3.5" />
                Constellation View (36)
              </button>
              <button
                type="button"
                onClick={() => setViewMode('chart')}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-mono-data border transition-all ${
                  viewMode === 'chart'
                    ? 'bg-[#F4C46C] text-[#060609] border-[#F4C46C] font-semibold shadow-[0_0_22px_-6px_#F4C46C]'
                    : 'bg-[#0B0C12] text-[#A8B2C6] border-[#F4C46C]/20 hover:text-[#F7F4EC] hover:border-[#F4C46C]/45'
                }`}
              >
                <GitBranch className="w-3.5 h-3.5" />
                Prerequisite Flowchart
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono-data">
              <Link
                to="/textbook"
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#F4C46C]/25 bg-[#0B0C12] text-[#FFE29E] hover:border-[#F4C46C]/55 transition-colors"
              >
                <BookOpen className="w-3 h-3 text-[#F4C46C]" /> FL Textbook (28 Ch.)
              </Link>
              <Link
                to="/frontier"
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#F4C46C]/25 bg-[#0B0C12] text-[#F4C46C] hover:border-[#FFE29E]/55 transition-colors"
              >
                <Orbit className="w-3 h-3" /> String Theory 3D
              </Link>
            </div>
          </div>
        </header>

        {viewMode === 'neural' ? (
          <NeuralAtlasMap heightClass="h-[560px] sm:h-[620px]" />
        ) : (
          <PrerequisiteMap />
        )}
      </div>
    </AtlasShell>
  );
}
