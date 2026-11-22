import { useState } from 'react';
import { GitBranch, Network } from 'lucide-react';
import { AtlasShell } from '../components/AtlasShell';
import { NeuralAtlasMap } from '../visuals/map/NeuralAtlasMap';
import { PrerequisiteMap } from '../visuals/map/PrerequisiteMap';

export function MapPage() {
  const [viewMode, setViewMode] = useState<'neural' | 'chart'>('neural');

  return (
    <AtlasShell>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b hairline-rule pb-5">
          <div className="space-y-1.5">
            <span className="font-mono-data text-[11px] uppercase tracking-[0.22em] text-[#38D9FF]">
              General Atlas · 36 Interconnected Mathematical Symbols
            </span>
            <h1 className="font-serif-editorial text-3xl sm:text-5xl text-[#F4F3EE]">
              Neural Mathematical <em className="italic text-[#F5BC5E]">Constellation</em> Atlas
            </h1>
            <p className="text-xs sm:text-sm text-[#A5B4CC] max-w-2xl leading-relaxed">
              Every glowing symbol represents a full 7-layer interactive lesson. Hover or click any
              symbol to trace its upstream prerequisites (gold pulses) and unlocked higher math
              (cyan pulses) — click again or double-click to enter the lesson directly.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setViewMode('neural')}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-mono-data border transition-all ${
                viewMode === 'neural'
                  ? 'bg-[#38D9FF] text-[#03050A] border-[#38D9FF] font-semibold'
                  : 'bg-[#090E18] text-[#A5B4CC] border-white/15 hover:text-[#F4F3EE]'
              }`}
            >
              <Network className="w-3.5 h-3.5" />
              Neural Constellation (36)
            </button>
            <button
              type="button"
              onClick={() => setViewMode('chart')}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-mono-data border transition-all ${
                viewMode === 'chart'
                  ? 'bg-[#F5BC5E] text-[#03050A] border-[#F5BC5E] font-semibold'
                  : 'bg-[#090E18] text-[#A5B4CC] border-white/15 hover:text-[#F4F3EE]'
              }`}
            >
              <GitBranch className="w-3.5 h-3.5" />
              Prerequisite Flowchart
            </button>
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
