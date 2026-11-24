import { useMemo, useState } from 'react';
import { Calculator, CheckCircle2, Info, Plus, Scale, Trash2 } from 'lucide-react';
import { AtlasShell } from '../components/AtlasShell';
import { MathTex } from '../components/MathTex';
import { COURSES } from '../data/curriculumGraph';
import { CourseId } from '../data/standards';

interface GradeCategory {
  id: string;
  name: string;
  weight: number;
  score: number;
  isFinal: boolean;
}

const TEMPLATES: Record<string, { label: string; rows: GradeCategory[] }> = {
  balanced: {
    label: 'Balanced Syllabus',
    rows: [
      { id: 'c1', name: 'Unit Tests & Mastery', weight: 40, score: 86, isFinal: false },
      { id: 'c2', name: 'Quizzes & Labs', weight: 25, score: 91, isFinal: false },
      { id: 'c3', name: 'Homework & Practice', weight: 15, score: 94, isFinal: false },
      { id: 'c4', name: 'Cumulative Final Exam', weight: 20, score: 85, isFinal: true },
    ],
  },
  honors: {
    label: 'Honors Exam-Heavy',
    rows: [
      { id: 'c1', name: 'Major Assessments', weight: 50, score: 84, isFinal: false },
      { id: 'c2', name: 'Weekly Checkpoints', weight: 20, score: 89, isFinal: false },
      { id: 'c3', name: 'Labs & Problem Sets', weight: 10, score: 96, isFinal: false },
      { id: 'c4', name: 'Semester Final / EOC', weight: 20, score: 80, isFinal: true },
    ],
  },
  project: {
    label: 'Lab & Project Weighted',
    rows: [
      { id: 'c1', name: 'Unit Exams', weight: 35, score: 88, isFinal: false },
      { id: 'c2', name: 'Applied Labs & Proofs', weight: 30, score: 93, isFinal: false },
      { id: 'c3', name: 'Classwork & Journals', weight: 20, score: 95, isFinal: false },
      { id: 'c4', name: 'Final Portfolio Exam', weight: 15, score: 85, isFinal: true },
    ],
  },
};

const SEGMENT_COLORS = ['#F5C25B', '#46D6E8', '#45E6A6', '#FF8563', '#FFE29E', '#B88938'];

export function GradePlannerPage() {
  const [selectedCourse, setSelectedCourse] = useState<CourseId>('algebra-1');
  const [rows, setRows] = useState<GradeCategory[]>(() =>
    TEMPLATES.balanced.rows.map((r) => ({ ...r }))
  );
  const [targetGrade, setTargetGrade] = useState(90);

  const course = COURSES[selectedCourse];

  const stats = useMemo(() => {
    const totalWeight = rows.reduce((s, r) => s + Math.max(0, r.weight), 0);
    const nonFinalRows = rows.filter((r) => !r.isFinal);
    const finalRows = rows.filter((r) => r.isFinal);

    const earnedPreFinal = nonFinalRows.reduce(
      (s, r) => s + (Math.max(0, r.weight) / 100) * Math.max(0, Math.min(110, r.score)),
      0
    );
    const projectedTotal = rows.reduce(
      (s, r) => s + (Math.max(0, r.weight) / 100) * Math.max(0, Math.min(110, r.score)),
      0
    );
    const finalWeight = finalRows.reduce((s, r) => s + Math.max(0, r.weight), 0);

    const requiredFinal =
      finalWeight > 0 ? (targetGrade - earnedPreFinal) / (finalWeight / 100) : null;

    return {
      totalWeight,
      earnedPreFinal,
      projectedTotal,
      finalWeight,
      requiredFinal,
    };
  }, [rows, targetGrade]);

  const updateRow = (id: string, patch: Partial<GradeCategory>) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  };

  const normalizeWeights = () => {
    if (stats.totalWeight <= 0) return;
    const raw = rows.map((r) => Math.round((r.weight / stats.totalWeight) * 100));
    const diff = 100 - raw.reduce((a, b) => a + b, 0);
    if (raw.length > 0) raw[0] += diff;
    setRows((prev) => prev.map((r, i) => ({ ...r, weight: Math.max(0, raw[i]) })));
  };

  const addCategory = () => {
    setRows((prev) => [
      ...prev,
      {
        id: `c-${Date.now()}`,
        name: `Category ${prev.length + 1}`,
        weight: 0,
        score: 90,
        isFinal: false,
      },
    ]);
  };

  const removeCategory = (id: string) => {
    setRows((prev) => (prev.length > 1 ? prev.filter((r) => r.id !== id) : prev));
  };

  const finalStatus = (() => {
    if (stats.requiredFinal === null) {
      return {
        label: 'No Final Category Marked',
        color: '#A8B2C6',
        note: 'Toggle one category as Final Slot to simulate required exam score.',
      };
    }
    if (stats.requiredFinal <= 0) {
      return {
        label: 'Target Locked Even at 0%',
        color: '#45E6A6',
        note: 'Prior earned points already guarantee your target score.',
      };
    }
    if (stats.requiredFinal <= 85) {
      return {
        label: 'Comfortably Achievable',
        color: '#45E6A6',
        note: 'Maintain steady review to hit or beat this benchmark.',
      };
    }
    if (stats.requiredFinal <= 100) {
      return {
        label: 'High-Focus Stretch Target',
        color: '#F4C46C',
        note: 'Requires dedicated mastery or raising current coursework before finals.',
      };
    }
    return {
      label: 'Exceeds 100% — Raise Pre-Final Averages',
      color: '#FF8563',
      note: 'Raise current coursework scores or adjust syllabus target.',
    };
  })();

  const gaugePct =
    stats.requiredFinal === null ? 0 : Math.max(0, Math.min(100, stats.requiredFinal));
  const arcR = 58;
  const arcC = Math.PI * arcR;
  const arcDash = (gaugePct / 100) * arcC;

  const mapF = (f: number) => 28 + (f / 100) * 260;
  const mapG = (g: number) => 122 - ((Math.max(45, Math.min(105, g)) - 45) / 60) * 102;
  const gAt0 = stats.earnedPreFinal;
  const gAt100 = stats.earnedPreFinal + stats.finalWeight;
  const reqClamped =
    stats.requiredFinal === null ? null : Math.max(0, Math.min(100, stats.requiredFinal));

  return (
    <AtlasShell activeCourse={selectedCourse}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        <header className="instrument-frame fiducial-frame p-6 sm:p-7 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-[#F4C46C]/45 bg-[#F4C46C]/10 text-[11px] font-mono-data text-[#FFE29E]">
              <Info className="w-3.5 h-3.5 text-[#F4C46C]" />
              Custom User Weights (Editable — Match Your Syllabus)
            </div>

            <div className="flex flex-wrap gap-1.5">
              {(['algebra-1', 'geometry', 'algebra-2', 'precalculus'] as CourseId[]).map((cid) => {
                const c = COURSES[cid];
                const active = selectedCourse === cid;
                return (
                  <button
                    key={cid}
                    type="button"
                    onClick={() => setSelectedCourse(cid)}
                    className={`px-3.5 py-1 rounded-full text-xs font-mono-data border transition-all ${
                      active
                        ? 'text-[#060609] font-semibold'
                        : 'bg-[#0B0C12] text-[#A8B2C6] border-[#F4C46C]/20 hover:text-[#F7F4EC] hover:border-[#F4C46C]/45'
                    }`}
                    style={
                      active
                        ? {
                            backgroundColor: c.accent,
                            borderColor: c.accent,
                            boxShadow: `0 0 18px -4px ${c.accent}`,
                          }
                        : undefined
                    }
                  >
                    {c.shortTitle}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="max-w-3xl space-y-2">
            <h1 className="font-serif-editorial text-4xl sm:text-5xl text-[#F7F4EC]">
              Syllabus Grade Planner &amp; Linear Sensitivity Observatory
            </h1>
            <p className="text-sm text-[#A8B2C6] leading-relaxed">
              Enter your teacher&apos;s exact category percentages below — clearly marked as{' '}
              <strong className="text-[#FFE29E]">user-editable custom weights</strong> — and watch
              your linear weighted-average line <MathTex tex="G(F) = E + w_{\text{final}}F" /> solve{' '}
              <em>&ldquo;What score do I need on the final?&rdquo;</em> in real time.
            </p>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Editable Category Table + Stacked Weight Bar */}
          <div className="lg:col-span-7 instrument-frame p-5 sm:p-6 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Scale className="w-4 h-4" style={{ color: course.accent }} />
                <h2 className="font-serif-editorial text-2xl text-[#F7F4EC]">
                  Syllabus Category Weights
                </h2>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {Object.entries(TEMPLATES).map(([key, tpl]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setRows(tpl.rows.map((r) => ({ ...r })))}
                    className="px-3 py-1 rounded-full text-[11px] font-mono-data bg-[#0B0C12] border border-[#F4C46C]/20 text-[#A8B2C6] hover:text-[#FFE29E] hover:border-[#F4C46C]/45 transition-colors"
                  >
                    {tpl.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Visual Stacked Syllabus Weight Bar */}
            <div className="space-y-2">
              <div className="h-3 w-full rounded-full bg-[#060609] border border-[#F4C46C]/20 overflow-hidden flex">
                {rows.map((row, i) => {
                  const pct =
                    stats.totalWeight > 0 ? (Math.max(0, row.weight) / stats.totalWeight) * 100 : 0;
                  return (
                    <div
                      key={row.id}
                      style={{
                        width: `${pct}%`,
                        backgroundColor: SEGMENT_COLORS[i % SEGMENT_COLORS.length],
                      }}
                      title={`${row.name}: ${row.weight}%`}
                      className="h-full transition-all duration-300 border-r border-[#060609]/60"
                    />
                  );
                })}
              </div>
              <div className="flex flex-wrap gap-3 font-mono-data text-[10px] text-[#A8B2C6]">
                {rows.map((row, i) => (
                  <span key={row.id} className="inline-flex items-center gap-1.5">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: SEGMENT_COLORS[i % SEGMENT_COLORS.length] }}
                    />
                    {row.name} ({row.weight}%)
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              {rows.map((row, i) => (
                <div
                  key={row.id}
                  className="instrument-panel p-3.5 grid grid-cols-1 sm:grid-cols-12 gap-3 items-center"
                >
                  <div className="sm:col-span-5">
                    <label className="flex items-center gap-1.5 font-mono-data text-[9px] uppercase text-[#727D94] mb-1">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: SEGMENT_COLORS[i % SEGMENT_COLORS.length] }}
                      />
                      Category Name
                    </label>
                    <input
                      type="text"
                      value={row.name}
                      onChange={(e) => updateRow(row.id, { name: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg bg-[#060609] border border-[#F4C46C]/20 text-xs text-[#F7F4EC] focus:border-[#F4C46C]"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-mono-data text-[9px] uppercase text-[#727D94] mb-1">
                      Weight %
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={row.weight}
                      onChange={(e) => updateRow(row.id, { weight: Number(e.target.value) })}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-[#060609] border border-[#F4C46C]/20 text-xs font-mono-data text-[#F7F4EC] focus:border-[#F4C46C]"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-mono-data text-[9px] uppercase text-[#727D94] mb-1">
                      Current %
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={110}
                      value={row.score}
                      onChange={(e) => updateRow(row.id, { score: Number(e.target.value) })}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-[#060609] border border-[#F4C46C]/20 text-xs font-mono-data text-[#F7F4EC] focus:border-[#F4C46C]"
                    />
                  </div>

                  <div className="sm:col-span-3 flex items-center justify-between sm:justify-end gap-2 pt-3 sm:pt-4">
                    <button
                      type="button"
                      onClick={() => updateRow(row.id, { isFinal: !row.isFinal })}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-mono-data border transition-all ${
                        row.isFinal
                          ? 'bg-[#46D6E8]/18 text-[#46D6E8] border-[#46D6E8]/55'
                          : 'text-[#727D94] border-[#F4C46C]/20 hover:text-[#F7F4EC]'
                      }`}
                    >
                      {row.isFinal ? 'Final Slot' : 'Term Work'}
                    </button>
                    <button
                      type="button"
                      onClick={() => removeCategory(row.id)}
                      aria-label={`Remove ${row.name}`}
                      className="p-1.5 rounded-lg text-[#727D94] hover:text-[#FF8563] transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t hairline-rule">
              <button
                type="button"
                onClick={addCategory}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-mono-data border border-[#F4C46C]/30 bg-[#0B0C12] text-[#F7F4EC] hover:border-[#F4C46C]/60 transition-colors"
              >
                <Plus className="w-3.5 h-3.5 text-[#F4C46C]" /> Add Category
              </button>

              <div className="flex items-center gap-3">
                <span
                  className={`font-mono-data text-xs px-3 py-1 rounded-full border ${
                    stats.totalWeight === 100
                      ? 'bg-[#45E6A6]/15 border-[#45E6A6]/40 text-[#45E6A6]'
                      : 'bg-[#FF8563]/15 border-[#FF8563]/40 text-[#FF8563]'
                  }`}
                >
                  Total Weight: {stats.totalWeight}%
                </span>
                {stats.totalWeight !== 100 && (
                  <button
                    type="button"
                    onClick={normalizeWeights}
                    className="px-3 py-1 rounded-full text-xs font-mono-data bg-gradient-to-r from-[#F4C46C] to-[#FFE29E] text-[#060609] font-semibold"
                  >
                    Normalize to 100%
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Right: Visual Radial Gauge + Linear Sensitivity Graph */}
          <div className="lg:col-span-5 instrument-frame fiducial-frame p-5 sm:p-6 space-y-5 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Calculator className="w-4 h-4" style={{ color: course.accent }} />
                <h2 className="font-serif-editorial text-2xl text-[#F7F4EC]">
                  Final Exam Target Telemetry
                </h2>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'A (90%)', val: 90 },
                  { label: 'B (80%)', val: 80 },
                  { label: 'C (70%)', val: 70 },
                ].map((p) => (
                  <button
                    key={p.val}
                    type="button"
                    onClick={() => setTargetGrade(p.val)}
                    className={`py-2 rounded-full text-xs font-mono-data border transition-all ${
                      targetGrade === p.val
                        ? 'text-[#060609] font-semibold'
                        : 'bg-[#0B0C12] text-[#A8B2C6] border-[#F4C46C]/20 hover:text-[#F7F4EC]'
                    }`}
                    style={
                      targetGrade === p.val
                        ? {
                            backgroundColor: course.accent,
                            borderColor: course.accent,
                            boxShadow: `0 0 18px -5px ${course.accent}`,
                          }
                        : undefined
                    }
                  >
                    {p.label}
                  </button>
                ))}
              </div>

              <label className="block space-y-1 text-xs">
                <span className="flex justify-between font-mono-data text-[#A8B2C6]">
                  <span>Custom Target Course Grade</span>
                  <span style={{ color: course.accent }}>{targetGrade}%</span>
                </span>
                <input
                  type="range"
                  min={60}
                  max={100}
                  step={1}
                  value={targetGrade}
                  onChange={(e) => setTargetGrade(Number(e.target.value))}
                  className="meridian-slider"
                  style={{ ['--slider-accent' as string]: course.accent }}
                />
              </label>

              {/* Glowing Semicircular Observatory Gauge */}
              <div className="instrument-panel p-4 text-center space-y-1.5">
                <svg viewBox="0 0 160 96" className="w-48 h-28 mx-auto" role="img" aria-label="Required Final Score Gauge">
                  <path
                    d="M 22 80 A 58 58 0 0 1 138 80"
                    fill="none"
                    stroke="rgba(244, 196, 108, 0.14)"
                    strokeWidth="10"
                    strokeLinecap="round"
                  />
                  <path
                    d="M 22 80 A 58 58 0 0 1 138 80"
                    fill="none"
                    stroke={finalStatus.color}
                    strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray={`${arcDash.toFixed(1)} ${arcC.toFixed(1)}`}
                    style={{ transition: 'stroke-dasharray 0.35s ease' }}
                  />
                  <text
                    x="80"
                    y="67"
                    fill={finalStatus.color}
                    fontSize="22"
                    fontWeight="600"
                    textAnchor="middle"
                    fontFamily="JetBrains Mono"
                  >
                    {stats.requiredFinal === null
                      ? 'N/A'
                      : `${Math.max(0, stats.requiredFinal).toFixed(1)}%`}
                  </text>
                  <text
                    x="80"
                    y="84"
                    fill="#727D94"
                    fontSize="7.5"
                    textAnchor="middle"
                    fontFamily="JetBrains Mono"
                  >
                    REQUIRED FINAL SCORE
                  </text>
                </svg>

                <div
                  className="inline-flex items-center gap-1.5 text-xs font-mono-data"
                  style={{ color: finalStatus.color }}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {finalStatus.label}
                </div>
                <p className="text-xs text-[#A8B2C6] leading-relaxed">{finalStatus.note}</p>
              </div>

              {/* Live Linear Sensitivity Plot: G(F) vs Final Exam Score F */}
              <div className="rounded-xl bg-[#060609] border border-[#F4C46C]/20 p-3 space-y-1.5">
                <span className="font-mono-data text-[9.5px] uppercase tracking-wider text-[#727D94] block">
                  Linear Grade Projection · Course Grade G(F) vs Final Score F
                </span>
                <svg viewBox="0 0 308 138" className="w-full h-[132px]" role="img" aria-label="Grade sensitivity plot">
                  <line x1="28" y1="122" x2="290" y2="122" stroke="rgba(244,196,108,0.22)" />
                  <line x1="28" y1="16" x2="28" y2="122" stroke="rgba(244,196,108,0.22)" />
                  <line
                    x1="28"
                    y1={mapG(targetGrade)}
                    x2="290"
                    y2={mapG(targetGrade)}
                    stroke={course.accent}
                    strokeDasharray="4 3"
                    strokeWidth="1.2"
                  />
                  <line
                    x1={mapF(0)}
                    y1={mapG(gAt0)}
                    x2={mapF(100)}
                    y2={mapG(gAt100)}
                    stroke="#46D6E8"
                    strokeWidth="2.4"
                  />
                  {reqClamped !== null && (
                    <g>
                      <line
                        x1={mapF(reqClamped)}
                        y1={mapG(targetGrade)}
                        x2={mapF(reqClamped)}
                        y2="122"
                        stroke={finalStatus.color}
                        strokeDasharray="3 2"
                        strokeWidth="1.2"
                      />
                      <circle
                        cx={mapF(reqClamped)}
                        cy={mapG(targetGrade)}
                        r="5"
                        fill={finalStatus.color}
                        stroke="#060609"
                        strokeWidth="1.5"
                      />
                    </g>
                  )}
                  <text x="32" y={mapG(targetGrade) - 5} fill={course.accent} fontSize="8.5" fontFamily="JetBrains Mono">
                    Target {targetGrade}%
                  </text>
                  <text x="28" y="134" fill="#727D94" fontSize="8" fontFamily="JetBrains Mono">0% Final</text>
                  <text x="288" y="134" fill="#727D94" fontSize="8" textAnchor="end" fontFamily="JetBrains Mono">100% Final</text>
                </svg>
              </div>
            </div>

            <div className="pt-3 border-t hairline-rule overflow-x-auto">
              <MathTex
                tex="F_{\text{req}} = \dfrac{G_{\text{target}} - \sum w_i s_i}{w_{\text{final}}}"
                className="text-xs text-[#A8B2C6]"
              />
            </div>
          </div>
        </div>
      </div>
    </AtlasShell>
  );
}
