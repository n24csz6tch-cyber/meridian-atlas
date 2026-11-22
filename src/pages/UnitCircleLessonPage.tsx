import { useState } from 'react';
import { AlertTriangle, ExternalLink } from 'lucide-react';
import { AtlasShell } from '../components/AtlasShell';
import { LessonNavHeader } from '../components/LessonNavHeader';
import { MathTex } from '../components/MathTex';
import { PracticeEngine, PracticeQuestion } from '../components/PracticeEngine';
import { CONSULTED_DATE, VERIFIED_STANDARDS } from '../data/standards';
import { EquationMiniVisual } from '../visuals/equations/EquationMiniVisual';
import { DerivationStepVisual } from '../visuals/equations/LessonLayerVisuals';
import { UnitCircleWaveCanvas } from '../visuals/trig/UnitCircleWaveCanvas';
import { VectorParallelogramCanvas } from '../visuals/trig/VectorParallelogramCanvas';

const TRIG_STEPS = [
  {
    title: 'Step 1 · Identify Amplitude |A|',
    tex: 'y = 3\\sin(2x) \\implies |A| = 3',
    note: 'The vertical wave peak reaches +3 above midline y = 0 and drops to −3.',
  },
  {
    title: 'Step 2 · Compute Period T = 2π / |B|',
    tex: 'B = 2 \\implies T = \\dfrac{2\\pi}{2} = \\pi',
    note: 'Doubling angular speed completes a full unit-circle lap twice as fast.',
  },
  {
    title: 'Step 3 · Plot Key Quarter-Cycle Points',
    tex: 'x \\in \\left\\{0,\\; \\tfrac{\\pi}{4},\\; \\tfrac{\\pi}{2},\\; \\tfrac{3\\pi}{4},\\; \\pi\\right\\}',
    note: 'Divide period π by 4 to locate zero, peak (+3), zero, trough (−3), and cycle end.',
  },
  {
    title: 'Step 4 · Evaluate Exact Value at π/6',
    tex: 'y\\!\\left(\\tfrac{\\pi}{6}\\right) = 3\\sin\\!\\left(\\tfrac{\\pi}{3}\\right) = \\dfrac{3\\sqrt{3}}{2} \\approx 2.60',
    note: 'Connect unit-circle triangle altitude √3/2 directly back to scaled wave height.',
  },
];

const TRIG_PRACTICE: PracticeQuestion[] = [
  {
    id: 'trig-1',
    prompt: 'What is the exact value of sin(5π/6)?',
    promptTex: '\\sin\\!\\left(\\dfrac{5\\pi}{6}\\right) = \\text{?}',
    type: 'numeric',
    correctAnswer: 0.5,
    tolerance: 0.01,
    hint: '5π/6 lies in Quadrant II with reference angle π/6 above the negative x-axis.',
    solutionSteps: [
      { label: 'Quadrant II Check', tex: 'y > 0', note: 'Sine is positive above the x-axis.' },
      { label: 'Reference Angle π/6', tex: '\\sin(\\pi/6) = 0.5', note: 'Half unit vertical leg.' },
    ],
  },
  {
    id: 'trig-2',
    prompt: 'Which expression gives the period of y = 4 cos(3x)?',
    promptTex: 'T = \\dfrac{2\\pi}{|B|}',
    type: 'multiple-choice',
    options: [
      { id: 'a', label: 'Period A', tex: '\\dfrac{2\\pi}{3}' },
      { id: 'b', label: 'Period B', tex: '6\\pi' },
      { id: 'c', label: 'Period C', tex: '4\\pi' },
      { id: 'd', label: 'Period D', tex: '\\dfrac{\\pi}{3}' },
    ],
    correctAnswer: 'a',
    hint: 'Divide fundamental circle period 2π by frequency B = 3.',
    solutionSteps: [
      { label: 'Extract B = 3', tex: 'B = 3', note: 'Amplitude 4 affects height, not period.' },
      { label: 'Divide 2π', tex: 'T = \\dfrac{2\\pi}{3}', note: 'Compressed horizontally 3×.' },
    ],
  },
  {
    id: 'trig-3',
    prompt: 'Convert 180° into radians (approx to 2 decimal places).',
    type: 'numeric',
    correctAnswer: 3.14,
    tolerance: 0.02,
    hint: 'A full circle 360° is 2π radians.',
    solutionSteps: [
      { label: 'Radian Ratio', tex: '180^\\circ \\cdot \\dfrac{\\pi}{180^\\circ} = \\pi \\approx 3.14', note: 'Half turn.' },
    ],
  },
  {
    id: 'trig-4',
    prompt: 'Find the magnitude of resultant vector u + v if u = ⟨1, 2⟩ and v = ⟨2, 2⟩.',
    promptTex: '\\|\\langle 1, 2 \\rangle + \\langle 2, 2 \\rangle\\| = \\text{?}',
    type: 'numeric',
    correctAnswer: 5,
    tolerance: 0.01,
    hint: 'Add components first to obtain ⟨3, 4⟩, then apply Pythagoras √(3² + 4²).',
    solutionSteps: [
      { label: 'Component Sum', tex: '\\langle 1+2,\\; 2+2 \\rangle = \\langle 3, 4 \\rangle', note: 'Sum x and y legs.' },
      { label: 'Euclidean Norm', tex: '\\sqrt{3^2 + 4^2} = \\sqrt{25} = 5', note: '3-4-5 right triangle.' },
    ],
  },
];

const STD_CODES = ['MA.912.T.2.2', 'MA.912.T.3.1', 'MA.912.T.3.2', 'MA.912.NSO.3.1'];

export function UnitCircleLessonPage() {
  const [stepIdx, setStepIdx] = useState(0);
  const [freqTest, setFreqTest] = useState(2.0);
  const [windSpeed, setWindSpeed] = useState(40);
  const planeAirspeed = 180;
  const groundSpeed = Math.hypot(planeAirspeed, windSpeed);
  const driftDeg = (Math.atan2(windSpeed, planeAirspeed) * 180) / Math.PI;

  return (
    <AtlasShell activeCourse="precalculus">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-12">
        <LessonNavHeader courseId="precalculus" activeNodeId="pc-unit-circle" code="PC-01" />

        <header className="space-y-3 max-w-4xl">
          <h1 className="font-serif-editorial text-4xl sm:text-5xl text-[#F4F3EE] leading-tight">
            Unit Circle Projections, Sinusoids &amp; Vector Addition
          </h1>
          <p className="text-base text-[#A5B4CC] leading-relaxed">
            Sine and cosine are simply the horizontal and vertical shadows of steady circular
            rotation unwrapped along time — forming the language of oscillations, signals, and
            2D directional vectors.
          </p>
        </header>

        {/* LAYER 1: VISUAL INTUITION */}
        <section id="layer-1" className="space-y-4 scroll-mt-24">
          <span className="font-mono-data text-[11px] uppercase tracking-widest text-[#FF7A5C]">
            Layer 01 · Visual Intuition — Live Unit Circle Oscillation
          </span>
          <UnitCircleWaveCanvas />
        </section>

        {/* LAYER 2: MATHEMATICAL FORMALIZATION */}
        <section id="layer-2" className="space-y-4 scroll-mt-24">
          <div>
            <span className="font-mono-data text-[11px] uppercase tracking-widest text-[#FF7A5C]">
              Layer 02 · Visualized Circular &amp; Wave Architecture
            </span>
            <h2 className="font-serif-editorial text-2xl sm:text-3xl text-[#F4F3EE]">
              Every Harmonic Formula Illustrated Geometrically
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="instrument-frame p-5 space-y-3">
              <span className="font-mono-data text-[10.5px] uppercase text-[#F5BC5E] block">
                Circular Coordinates
              </span>
              <EquationMiniVisual kind="unit-circle-proj" accent="#FF7A5C" caption="Projection (cos θ, sin θ)" />
              <div className="instrument-panel px-3 py-2">
                <MathTex tex="P(\theta) = (\cos\theta,\; \sin\theta)" displayMode className="text-[#F4F3EE]" />
              </div>
              <p className="text-xs text-[#A5B4CC]">
                By Pythagoras on radius 1: <MathTex tex="\cos^2\theta + \sin^2\theta = 1" /> for all real angles.
              </p>
            </div>
            <div className="instrument-frame p-5 space-y-3">
              <span className="font-mono-data text-[10.5px] uppercase text-[#FF7A5C] block">
                Sinusoidal Model
              </span>
              <EquationMiniVisual kind="trig-pythag-id" accent="#FF7A5C" caption="Amplitude & Period" />
              <div className="instrument-panel px-3 py-2">
                <MathTex tex="y = A\sin\!\big(B(x - C)\big) + D" displayMode className="text-[#F4F3EE]" />
              </div>
              <p className="text-xs text-[#A5B4CC]">
                Amplitude <MathTex tex="|A|" />, angular frequency <MathTex tex="B" />, period{' '}
                <MathTex tex="T = \frac{2\pi}{|B|}" />.
              </p>
            </div>
            <div className="instrument-frame p-5 space-y-3">
              <span className="font-mono-data text-[10.5px] uppercase text-[#38D9FF] block">
                Vector Components
              </span>
              <EquationMiniVisual kind="vector-parallelogram" accent="#38D9FF" caption="Orthogonal Resultant" />
              <div className="instrument-panel px-3 py-2">
                <MathTex tex="\|\vec{v}\| = \sqrt{v_x^2 + v_y^2},\quad \tan\theta = \frac{v_y}{v_x}" displayMode className="text-[#F4F3EE]" />
              </div>
              <p className="text-xs text-[#A5B4CC]">
                Trigonometry converts magnitude &amp; bearing back into orthogonal <MathTex tex="x, y" /> components.
              </p>
            </div>
          </div>
        </section>

        {/* LAYER 3: GUIDED WORKED EXAMPLE */}
        <section id="layer-3" className="instrument-frame p-5 sm:p-6 space-y-4 scroll-mt-24">
          <div>
            <span className="font-mono-data text-[11px] uppercase tracking-widest text-[#FF7A5C] block">
              Layer 03 · Synchronized Guided Step-by-Step Analysis
            </span>
            <h2 className="font-serif-editorial text-2xl text-[#F4F3EE]">
              Graphing &amp; Evaluating <MathTex tex="y = 3\sin(2x)" />
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            <div className="lg:col-span-7 space-y-3">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {TRIG_STEPS.map((st, idx) => (
                  <button
                    key={st.title}
                    type="button"
                    onClick={() => setStepIdx(idx)}
                    className={`p-3 rounded-xl text-left border transition-all ${
                      stepIdx === idx
                        ? 'bg-[#FF7A5C]/15 border-[#FF7A5C] text-[#F4F3EE]'
                        : 'bg-[#080D16] border-white/10 text-[#A5B4CC] hover:text-[#F4F3EE]'
                    }`}
                  >
                    <span className="font-mono-data text-[10px] text-[#FF7A5C] block">STEP 0{idx + 1}</span>
                    <span className="text-xs font-medium">{st.title.replace(/^Step \d+ · /, '')}</span>
                  </button>
                ))}
              </div>

              <div className="instrument-panel p-5 space-y-2">
                <p className="font-mono-data text-xs text-[#FF7A5C]">{TRIG_STEPS[stepIdx].title}</p>
                <MathTex tex={TRIG_STEPS[stepIdx].tex} displayMode className="text-[#F4F3EE]" />
                <p className="text-xs text-[#A5B4CC]">{TRIG_STEPS[stepIdx].note}</p>
              </div>
            </div>

            <div className="lg:col-span-5">
              <DerivationStepVisual
                visualKinds={['unit-circle-proj', 'trig-pythag-id', 'unit-circle-proj', 'right-trig-ratios']}
                stepIndex={stepIdx}
                stepTitle={TRIG_STEPS[stepIdx].title}
                accent="#FF7A5C"
              />
            </div>
          </div>
        </section>

        {/* LAYER 4: PRACTICE */}
        <section id="layer-4" className="space-y-4 scroll-mt-24">
          <span className="font-mono-data text-[11px] uppercase tracking-widest text-[#FF785A]">
            Layer 4 · Interactive Check &amp; Vector Norm Drills
          </span>
          <PracticeEngine questions={TRIG_PRACTICE} accentColor="#FF785A" />
        </section>

        {/* LAYER 5: MISCONCEPTION VISUALIZED */}
        <section className="instrument-frame p-5 sm:p-6 space-y-4 border-[#FF785A]/35">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-[#FF785A] shrink-0 mt-0.5" />
            <div>
              <span className="font-mono-data text-[11px] uppercase tracking-widest text-[#FF785A] block">
                Layer 5 · Typical Error Visualized — The Frequency Stretch Trap
              </span>
              <h2 className="font-serif-editorial text-2xl text-[#F2F0E8]">
                Why <MathTex tex="y = \sin(Bx)" /> Compresses Horizontally When <MathTex tex="B > 1" />
              </h2>
              <p className="text-xs text-[#A7B3C7] mt-1">
                Multiplying <MathTex tex="x" /> by <MathTex tex="B" /> makes the angle race{' '}
                {freqTest.toFixed(1)}× faster around the unit circle, shrinking period from{' '}
                <MathTex tex="2\pi" /> down to <MathTex tex={`2\\pi/${freqTest.toFixed(1)}`} />.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
            <div className="md:col-span-4 space-y-3">
              <label className="block space-y-1 text-xs">
                <span className="flex justify-between font-mono-data text-[#A7B3C7]">
                  <span>Multiplier B in sin(Bx)</span>
                  <span className="text-[#FF785A]">B = {freqTest.toFixed(1)}</span>
                </span>
                <input
                  type="range"
                  min={0.5}
                  max={3.5}
                  step={0.1}
                  value={freqTest}
                  onChange={(e) => setFreqTest(Number(e.target.value))}
                  className="meridian-slider"
                  style={{ ['--slider-accent' as string]: '#FF785A' }}
                />
              </label>
              <div className="instrument-panel p-3 text-xs font-mono-data space-y-1">
                <div className="text-[#38D4FF]">Parent sin(x) period: 2π ≈ 6.28</div>
                <div className="text-[#FF785A]">
                  sin({freqTest.toFixed(1)}x) period: {( (Math.PI * 2) / freqTest ).toFixed(2)} rad
                </div>
              </div>
            </div>

            <div className="md:col-span-8">
              <svg
                viewBox="0 0 560 140"
                className="w-full h-36 rounded bg-[#05070C] border border-[rgba(237,235,228,0.12)]"
              >
                <line x1="16" y1="70" x2="544" y2="70" stroke="rgba(237,235,228,0.16)" strokeWidth="1" />
                <path
                  d={Array.from({ length: 120 }, (_, i) => {
                    const t = (i / 119) * Math.PI * 4;
                    const x = 16 + (i / 119) * 528;
                    const y = 70 - Math.sin(t) * 44;
                    return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
                  }).join(' ')}
                  fill="none"
                  stroke="rgba(56, 212, 255, 0.45)"
                  strokeWidth="1.8"
                  strokeDasharray="4 4"
                />
                <path
                  d={Array.from({ length: 180 }, (_, i) => {
                    const t = (i / 179) * Math.PI * 4;
                    const x = 16 + (i / 179) * 528;
                    const y = 70 - Math.sin(freqTest * t) * 44;
                    return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
                  }).join(' ')}
                  fill="none"
                  stroke="#FF785A"
                  strokeWidth="2.4"
                />
              </svg>
            </div>
          </div>
        </section>

        {/* LAYER 6: REAL-WORLD APPLICATION + EMBEDDED VECTOR PARALLELOGRAM LAB */}
        <section id="vectors" className="space-y-5">
          <span className="font-mono-data text-[11px] uppercase tracking-widest text-[#38D4FF] block">
            Layer 6 · Vector Addition &amp; Real-World Crosswind Resultant
          </span>

          <div className="instrument-frame p-5 grid grid-cols-1 md:grid-cols-3 gap-5 items-center">
            <div className="md:col-span-2 space-y-2">
              <h2 className="font-serif-editorial text-2xl text-[#F2F0E8]">
                Aircraft Bearing + Crosswind Resultant
              </h2>
              <p className="text-xs text-[#A7B3C7] leading-relaxed">
                An aircraft flying due north at 180 knots encounters an eastern crosswind of{' '}
                {windSpeed} knots. Adding the two orthogonal vectors yields true ground speed{' '}
                <strong className="text-[#FF785A]">{groundSpeed.toFixed(1)} kt</strong> shifted{' '}
                <strong className="text-[#F4B956]">{driftDeg.toFixed(1)}°</strong> off heading.
              </p>
            </div>
            <label className="space-y-1 text-xs">
              <span className="flex justify-between font-mono-data text-[#A7B3C7]">
                <span>East Crosswind</span>
                <span className="text-[#38D4FF]">{windSpeed} kt</span>
              </span>
              <input
                type="range"
                min={0}
                max={95}
                step={5}
                value={windSpeed}
                onChange={(e) => setWindSpeed(Number(e.target.value))}
                className="meridian-slider"
                style={{ ['--slider-accent' as string]: '#38D4FF' }}
              />
            </label>
          </div>

          <VectorParallelogramCanvas />
        </section>

        {/* LAYER 7: VERIFIED FLORIDA B.E.S.T. STANDARDS */}
        <section className="instrument-frame p-5 space-y-3">
          <span className="font-mono-data text-[10px] uppercase tracking-[0.18em] text-[#FF785A] block">
            Layer 7 · Verified Florida B.E.S.T. Standards (Consulted {CONSULTED_DATE})
          </span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {STD_CODES.map((code) => {
              const s = VERIFIED_STANDARDS[code];
              return (
                <div key={code} className="instrument-panel p-4 space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono-data text-xs text-[#FF785A]">{s.code}</span>
                    <a
                      href={s.sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-mono-data text-[#A7B3C7] hover:text-[#F2F0E8]"
                    >
                      {s.sourceLabel} <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <p className="text-xs text-[#F2F0E8] leading-relaxed">{s.description}</p>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </AtlasShell>
  );
}
