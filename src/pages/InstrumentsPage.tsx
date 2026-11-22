import { useState } from 'react';
import {
  Activity,
  BarChart3,
  Box,
  Compass,
  FunctionSquare,
  GitBranch,
  Infinity as InfinityIcon,
  Layers,
  Network,
  Orbit,
  Radar,
  Scale,
  Sigma,
  Sparkles,
  TrendingUp,
  Triangle,
} from 'lucide-react';
import { AtlasShell } from '../components/AtlasShell';
import { CourseId } from '../data/standards';
import { QuadraticWorkbench } from '../instruments/QuadraticWorkbench';
import { SolidNetLab } from '../instruments/SolidNetLab';
import { LogarithmLab } from '../visuals/logarithms/LogarithmLab';
import { NeuralMathEngine } from '../visuals/neural/NeuralMathEngine';
import { TopicVisualCanvas } from '../visuals/topics/TopicVisualCanvas';
import { UnitCircleWaveCanvas } from '../visuals/trig/UnitCircleWaveCanvas';
import { VectorParallelogramCanvas } from '../visuals/trig/VectorParallelogramCanvas';
import { MathVortexCanvas } from '../visuals/vortex/MathVortexCanvas';

type LabId =
  | 'neural'
  | 'vortex'
  | 'quadratic'
  | 'regression'
  | 'abs-radicals'
  | 'inequalities'
  | 'solids'
  | 'angles-sim'
  | 'pythagoras'
  | 'logs'
  | 'nonlinear-inv'
  | 'pascal-prob'
  | 'polynomials'
  | 'trig-id'
  | 'parametric-polar'
  | 'limits-series';

const LAB_ITEMS: {
  id: LabId;
  label: string;
  course: CourseId;
  accent: string;
  icon: typeof Network;
}[] = [
  { id: 'neural', label: 'Neural Matrix', course: 'algebra-2', accent: '#38D9FF', icon: Network },
  { id: 'vortex', label: 'Vortex & Chaos', course: 'precalculus', accent: '#F5BC5E', icon: Orbit },
  { id: 'quadratic', label: 'Quadratic Workbench', course: 'algebra-1', accent: '#F5BC5E', icon: FunctionSquare },
  { id: 'regression', label: 'Linear Regression', course: 'algebra-1', accent: '#F5BC5E', icon: BarChart3 },
  { id: 'abs-radicals', label: 'Abs Value & Radicals', course: 'algebra-1', accent: '#F5BC5E', icon: Scale },
  { id: 'inequalities', label: 'Inequalities & Systems', course: 'algebra-1', accent: '#F5BC5E', icon: Sigma },
  { id: 'solids', label: '3D Solid & Net Lab', course: 'geometry', accent: '#38D9FF', icon: Box },
  { id: 'angles-sim', label: 'Angles, Similarity & Quads', course: 'geometry', accent: '#38D9FF', icon: Triangle },
  { id: 'pythagoras', label: 'Pythagoras & Symmetry', course: 'geometry', accent: '#38D9FF', icon: Compass },
  { id: 'logs', label: 'Logarithm Lab', course: 'algebra-2', accent: '#36EBA8', icon: TrendingUp },
  { id: 'nonlinear-inv', label: 'Nonlinear & Inverses', course: 'algebra-2', accent: '#36EBA8', icon: Layers },
  { id: 'pascal-prob', label: 'Pascal & Normal Bell', course: 'algebra-2', accent: '#36EBA8', icon: Sparkles },
  { id: 'polynomials', label: 'Polynomials & Complex', course: 'algebra-2', accent: '#36EBA8', icon: GitBranch },
  { id: 'trig-id', label: 'Unit Circle, IDs & Sines', course: 'precalculus', accent: '#FF7A5C', icon: Activity },
  { id: 'parametric-polar', label: 'Parametric, Polar & Conics', course: 'precalculus', accent: '#FF7A5C', icon: Radar },
  { id: 'limits-series', label: 'Limits & Infinite Series', course: 'precalculus', accent: '#FF7A5C', icon: InfinityIcon },
];

export function InstrumentsPage() {
  const [activeLab, setActiveLab] = useState<LabId>('neural');
  const activeMeta = LAB_ITEMS.find((l) => l.id === activeLab) ?? LAB_ITEMS[0];

  return (
    <AtlasShell activeCourse={activeMeta.course}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <header className="space-y-4 border-b hairline-rule pb-5">
          <div className="space-y-1.5">
            <span className="font-mono-data text-[11px] uppercase tracking-[0.2em] text-[#36EBA8]">
              Precision Observatory Bank · 16 Standalone Interactive Laboratories (36 Engines)
            </span>
            <h1 className="font-serif-editorial text-3xl sm:text-5xl text-[#F4F3EE]">
              Mathematical Instruments Workbench
            </h1>
          </div>

          <div className="flex flex-wrap gap-2">
            {LAB_ITEMS.map((item) => {
              const Icon = item.icon;
              const isSelected = activeLab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveLab(item.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                    isSelected
                      ? 'text-[#03050A] font-semibold'
                      : 'border-white/12 text-[#A5B4CC] hover:text-[#F4F3EE] bg-[#090E18]'
                  }`}
                  style={
                    isSelected
                      ? {
                          backgroundColor: item.accent,
                          borderColor: item.accent,
                          boxShadow: `0 0 18px -4px ${item.accent}`,
                        }
                      : undefined
                  }
                >
                  <Icon className="w-3.5 h-3.5" />
                  {item.label}
                </button>
              );
            })}
          </div>
        </header>

        {activeLab === 'neural' && <NeuralMathEngine />}
        {activeLab === 'vortex' && <MathVortexCanvas />}
        {activeLab === 'quadratic' && <QuadraticWorkbench />}
        {activeLab === 'regression' && <TopicVisualCanvas topicId="a1-statistics" />}
        {activeLab === 'abs-radicals' && (
          <div className="space-y-5">
            <TopicVisualCanvas topicId="a1-abs-piecewise" />
            <TopicVisualCanvas topicId="a1-radicals-exp" />
          </div>
        )}
        {activeLab === 'inequalities' && (
          <div className="space-y-5">
            <TopicVisualCanvas topicId="a1-inequalities" />
            <TopicVisualCanvas topicId="a1-systems" />
          </div>
        )}
        {activeLab === 'solids' && <SolidNetLab />}
        {activeLab === 'angles-sim' && (
          <div className="space-y-5">
            <TopicVisualCanvas topicId="g-parallel-angles" />
            <TopicVisualCanvas topicId="g-similarity" />
            <TopicVisualCanvas topicId="g-quadrilaterals" />
          </div>
        )}
        {activeLab === 'pythagoras' && (
          <div className="space-y-5">
            <TopicVisualCanvas topicId="g-right-trig" />
            <TopicVisualCanvas topicId="g-transformations" />
          </div>
        )}
        {activeLab === 'logs' && <LogarithmLab />}
        {activeLab === 'nonlinear-inv' && (
          <div className="space-y-5">
            <TopicVisualCanvas topicId="a2-quad-systems" />
            <TopicVisualCanvas topicId="a2-radicals" />
          </div>
        )}
        {activeLab === 'pascal-prob' && (
          <div className="space-y-5">
            <TopicVisualCanvas topicId="a2-combinatorics" />
            <TopicVisualCanvas topicId="a2-probability" />
          </div>
        )}
        {activeLab === 'polynomials' && (
          <div className="space-y-5">
            <TopicVisualCanvas topicId="a2-polynomials" />
            <TopicVisualCanvas topicId="a2-complex" />
          </div>
        )}
        {activeLab === 'trig-id' && (
          <div className="space-y-5">
            <UnitCircleWaveCanvas />
            <TopicVisualCanvas topicId="pc-trig-identities" />
            <TopicVisualCanvas topicId="pc-law-sines" />
            <VectorParallelogramCanvas />
          </div>
        )}
        {activeLab === 'parametric-polar' && (
          <div className="space-y-5">
            <TopicVisualCanvas topicId="pc-parametric" />
            <TopicVisualCanvas topicId="pc-polar" />
            <TopicVisualCanvas topicId="pc-conics" />
          </div>
        )}
        {activeLab === 'limits-series' && (
          <div className="space-y-5">
            <TopicVisualCanvas topicId="pc-limits" />
            <TopicVisualCanvas topicId="pc-series" />
          </div>
        )}
      </div>
    </AtlasShell>
  );
}
