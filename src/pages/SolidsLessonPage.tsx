import { Suspense, lazy, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, Layers, Sparkles } from 'lucide-react';
import { AtlasShell } from '../components/AtlasShell';
import { LessonNavHeader } from '../components/LessonNavHeader';
import { MathTex } from '../components/MathTex';
import { PracticeEngine, PracticeQuestion } from '../components/PracticeEngine';
import { FLDOE_SOURCES, VERIFIED_STANDARDS } from '../data/standards';
import { SolidNetLab } from '../instruments/SolidNetLab';
import { EquationMiniVisual } from '../visuals/equations/EquationMiniVisual';
import type { SolidHighlightPart } from '../visuals/solids/SolidNetScene';

const LazySolidNetScene = lazy(() => import('../visuals/solids/SolidNetScene'));

const WORKED_3D_STEPS: {
  title: string;
  tex: string;
  note: string;
  unfold: number;
  highlight: SolidHighlightPart;
  internalTriangle: boolean;
}[] = [
  {
    title: 'Step 1 · Inspect Internal Right Triangle',
    tex: '\\text{Base } s = 6\\text{ cm} \\implies \\text{apothem } \\frac{s}{2} = 3\\text{ cm},\\quad h = 4\\text{ cm}',
    note: 'Look inside the closed pyramid: the vertical altitude h (coral) and half-base apothem s/2 (amber) meet at 90°.',
    unfold: 0,
    highlight: 'all',
    internalTriangle: true,
  },
  {
    title: 'Step 2 · Solve Slant Height via Pythagoras',
    tex: 'l = \\sqrt{h^2 + \\left(\\frac{s}{2}\\right)^2} = \\sqrt{4^2 + 3^2} = \\sqrt{25} = 5\\text{ cm}',
    note: 'The green hypotenuse l = 5 cm is the true height of each triangular lateral wall.',
    unfold: 0,
    highlight: 'lateral',
    internalTriangle: true,
  },
  {
    title: 'Step 3 · Unfold Hinged Net into 2D Faces',
    tex: 'B = 6^2 = 36\\text{ cm}^2,\\quad L = 4\\left(\\tfrac{1}{2} \\cdot 6 \\cdot 5\\right) = 60\\text{ cm}^2',
    note: 'Unfolding flattens the square base and four congruent triangles onto one plane without changing area.',
    unfold: 1,
    highlight: 'all',
    internalTriangle: false,
  },
  {
    title: 'Step 4 · Compute Total Surface Area & Volume',
    tex: 'SA = 36 + 60 = 96\\text{ cm}^2,\\quad V = \\tfrac{1}{3}Bh = \\tfrac{1}{3}(36)(4) = 48\\text{ cm}^3',
    note: 'Surface area sums the 2D net (cm²); volume fills one-third of the enclosing 6 × 6 × 4 prism (cm³).',
    unfold: 0,
    highlight: 'base',
    internalTriangle: false,
  },
];

const GEOMETRY_QUESTIONS: PracticeQuestion[] = [
  {
    id: 'g1',
    type: 'numeric',
    prompt: 'A right rectangular prism measures 4 cm wide, 3 cm deep, and 5 cm tall. What is its total surface area?',
    promptTex: 'SA = 2B + Ph \\quad (w = 4,\\; d = 3,\\; h = 5)',
    correctAnswer: 94,
    tolerance: 0.05,
    unitLabel: 'cm²',
    hint: 'Compute two bases (2 × 4 × 3) plus lateral area P·h where P = 2(4 + 3).',
    solutionSteps: [
      {
        label: 'Base Area & Perimeter',
        tex: 'B = 4 \\cdot 3 = 12,\\quad P = 2(4 + 3) = 14',
        note: 'Two identical rectangular bases contribute 2B = 24 cm².',
      },
      {
        label: 'Add Lateral Band',
        tex: 'SA = 2(12) + 14(5) = 24 + 70 = 94\\text{ cm}^2',
        note: 'Verified across all 6 faces of the unfolded net.',
      },
    ],
  },
  {
    id: 'g2',
    type: 'numeric',
    prompt: 'A square pyramid has base side s = 10 m and vertical altitude h = 12 m. Find its slant height l.',
    promptTex: 'l = \\sqrt{h^2 + (s/2)^2}',
    correctAnswer: 13,
    tolerance: 0.05,
    unitLabel: 'm',
    hint: 'The apothem is half the base side: s/2 = 5 m. Use the 5-12-13 Pythagorean triple.',
    solutionSteps: [
      {
        label: 'Apply Internal Right Triangle',
        tex: 'l = \\sqrt{12^2 + 5^2} = \\sqrt{144 + 25} = \\sqrt{169} = 13\\text{ m}',
        note: 'Slant height is strictly greater than vertical altitude h = 12 m.',
      },
    ],
  },
  {
    id: 'g3',
    type: 'multiple-choice',
    prompt: 'If every linear dimension of a prism is tripled (scale factor k = 3), how does its volume change?',
    promptTex: 'V_{\\text{scaled}} = k^3 \\cdot V_{\\text{original}}',
    options: [
      { id: 'a', label: 'Increases by a factor of 3' },
      { id: 'b', label: 'Increases by a factor of 9' },
      { id: 'c', label: 'Increases by a factor of 27' },
      { id: 'd', label: 'Increases by a factor of 6' },
    ],
    correctAnswer: 'c',
    hint: 'Surface area scales by k² while 3D volume scales in all three orthogonal directions by k³.',
    solutionSteps: [
      {
        label: '3D Dilation Scaling Law (MA.912.GR.4.3)',
        tex: '(3w)(3d)(3h) = 3^3(wdh) = 27V',
        note: 'Volume scales with the cube of the linear scale factor: 3³ = 27.',
      },
    ],
  },
  {
    id: 'g4',
    type: 'multiple-choice',
    prompt: 'A plane slices horizontally through a right square pyramid parallel to its base (MA.912.GR.4.1). What 2D cross-section results?',
    options: [
      { id: 'a', label: 'An isosceles triangle' },
      { id: 'b', label: 'A smaller square similar to the base' },
      { id: 'c', label: 'A regular pentagon' },
      { id: 'd', label: 'A circle' },
    ],
    correctAnswer: 'b',
    hint: 'Enable the Cross-Section Slicer in Layer 01 above on the Square Pyramid to see the highlighted horizontal slice!',
    solutionSteps: [
      {
        label: 'Parallel Cross-Section Invariance',
        tex: '\\text{Slice parallel to square base} \\implies \\text{scaled square}',
        note: 'At fraction t ∈ (0, 1) of height, the square has side (1 - t)·s.',
      },
    ],
  },
];

const LESSON_STANDARD_CODES = ['MA.912.GR.4.1', 'MA.912.GR.4.5', 'MA.912.GR.4.6'];

export function SolidsLessonPage() {
  // Layer 3 synced step + lazy mount second WebGL context only when scrolled near Layer 3
  const [stepIdx, setStepIdx] = useState(0);
  const [mountWorked3D, setMountWorked3D] = useState(false);
  const worked3DRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = worked3DRef.current;
    if (!el || mountWorked3D) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setMountWorked3D(true);
          io.disconnect();
        }
      },
      { rootMargin: '220px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [mountWorked3D]);

  // Layer 5 misconception: Altitude vs Slant Height
  const [misSide, setMisSide] = useState(6);
  const [misHeight, setMisHeight] = useState(4);
  const slantVal = Math.sqrt(misHeight * misHeight + (misSide / 2) * (misSide / 2));
  const trueLateral = 2 * misSide * slantVal;
  const wrongLateral = 2 * misSide * misHeight;
  const errorGap = trueLateral - wrongLateral;

  // Layer 6 Architectural Atrium Estimator
  const [atriumSide, setAtriumSide] = useState(18);
  const [atriumHeight, setAtriumHeight] = useState(12);
  const atriumSlant = Math.sqrt(atriumHeight ** 2 + (atriumSide / 2) ** 2);
  const atriumGlass = 2 * atriumSide * atriumSlant;
  const atriumVol = (1 / 3) * atriumSide * atriumSide * atriumHeight;

  const activeStep = WORKED_3D_STEPS[stepIdx];

  return (
    <AtlasShell activeCourse="geometry">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-12">
        <LessonNavHeader courseId="geometry" activeNodeId="g-solids" code="G-09" />

        {/* Header */}
        <header className="space-y-3 max-w-4xl">
          <h1 className="font-serif-editorial text-4xl sm:text-5xl text-[#F4F3EE] leading-tight">
            3D Solids, Articulated Nets &amp; Cross-Sections
          </h1>
          <p className="text-sm sm:text-base text-[#A5B4CC] leading-relaxed">
            Surface area is not a formula to memorize — it is literally the 2D skin of a solid
            hinged open onto a flat plane. Unfold, orbit, resize, and slice three-dimensional
            solids directly below.
          </p>
        </header>

        {/* LAYER 1: 3D Visual Intuition & Embedded SolidNetLab */}
        <section id="layer-1" className="space-y-4 scroll-mt-24">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="font-mono-data text-[11px] uppercase tracking-widest text-[#38BDF8]">
                Layer 01 · Interactive 3D Visual Intuition
              </span>
              <h2 className="font-serif-editorial text-2xl text-[#EDEBE4]">
                Unfold 3D Hinges Into Planar 2D Nets
              </h2>
            </div>
            <Link
              to="/instruments"
              className="inline-flex items-center gap-1.5 text-xs font-mono-data text-[#38BDF8] hover:underline"
            >
              <Sparkles className="w-3.5 h-3.5" /> Open in Instruments Lab
            </Link>
          </div>
          <SolidNetLab />
        </section>

        {/* LAYER 2: Clean Formalization */}
        <section id="layer-2" className="space-y-4 scroll-mt-24">
          <div>
            <span className="font-mono-data text-[11px] uppercase tracking-widest text-[#38D9FF]">
              Layer 02 · Visualized 3D Surface &amp; Volume Equations
            </span>
            <h2 className="font-serif-editorial text-2xl sm:text-3xl text-[#F4F3EE]">
              Surface Area via Unfolded Nets &amp; Volume Conservation
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="instrument-frame p-5 space-y-3">
              <span className="font-mono-data text-[10.5px] text-[#38D9FF] uppercase tracking-wider block">
                Right Prisms
              </span>
              <EquationMiniVisual kind="prism-net" accent="#38D9FF" caption="Unfolded Prism Net" />
              <div className="instrument-panel px-3 py-2">
                <MathTex tex="SA = 2B + Ph \qquad V = Bh" displayMode className="text-[#F4F3EE]" />
              </div>
              <p className="text-xs text-[#A5B4CC] leading-relaxed">
                Two congruent bases (<MathTex tex="2B" />) plus one unwrapped rectangular lateral
                band of width <MathTex tex="P" /> (base perimeter) and height <MathTex tex="h" />.
              </p>
            </div>

            <div className="instrument-frame p-5 space-y-3">
              <span className="font-mono-data text-[10.5px] text-[#F5BC5E] uppercase tracking-wider block">
                Regular Pyramids &amp; Slant Height
              </span>
              <EquationMiniVisual kind="pyramid-slant" accent="#F5BC5E" caption="Pyramid Net & Slant l" />
              <div className="instrument-panel px-3 py-2">
                <MathTex
                  tex="SA = B + \tfrac{1}{2}Pl \qquad V = \tfrac{1}{3}Bh"
                  displayMode
                  className="text-[#F4F3EE]"
                />
              </div>
              <p className="text-xs text-[#A5B4CC] leading-relaxed">
                Lateral triangles taper to an apex along slant height{' '}
                <MathTex tex="l = \sqrt{h^2 + a^2}" />, while volume occupies one-third of its
                parent prism.
              </p>
            </div>

            <div className="instrument-frame p-5 space-y-3">
              <span className="font-mono-data text-[10.5px] text-[#36EBA8] uppercase tracking-wider block">
                Cylinders &amp; Scaling Laws
              </span>
              <EquationMiniVisual kind="cylinder-unroll" accent="#36EBA8" caption="Unrolled 2πr × h Band" />
              <div className="instrument-panel px-3 py-2">
                <MathTex
                  tex="SA' = k^2 SA \qquad V' = k^3 V"
                  displayMode
                  className="text-[#F4F3EE]"
                />
              </div>
              <p className="text-xs text-[#A5B4CC] leading-relaxed">
                Dilating linear dimensions by <MathTex tex="k" /> scales 2D net area by{' '}
                <MathTex tex="k^2" /> and 3D volume by <MathTex tex="k^3" />.
              </p>
            </div>
          </div>
        </section>

        {/* LAYER 3: Synchronized 3D Guided Worked Example */}
        <section id="layer-3" className="space-y-4 scroll-mt-24">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#38BDF8]" />
            <div>
              <span className="font-mono-data text-[11px] uppercase tracking-widest text-[#38BDF8]">
                Layer 03 · Synchronized 3D Worked Example
              </span>
              <h2 className="font-serif-editorial text-2xl text-[#EDEBE4]">
                Square Pyramid (<MathTex tex="s = 6\text{ cm},\; h = 4\text{ cm}" />)
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            <div className="lg:col-span-5 space-y-2.5">
              {WORKED_3D_STEPS.map((st, idx) => {
                const active = stepIdx === idx;
                return (
                  <button
                    key={st.title}
                    type="button"
                    onClick={() => setStepIdx(idx)}
                    className="w-full text-left p-4 rounded border transition-colors space-y-1.5"
                    style={{
                      backgroundColor: active ? '#161D29' : '#111620',
                      borderColor: active ? '#38BDF8' : 'rgba(237, 235, 228, 0.1)',
                    }}
                  >
                    <p className="font-mono-data text-[11px] text-[#38BDF8]">{st.title}</p>
                    <MathTex tex={st.tex} displayMode className="text-sm text-[#EDEBE4]" />
                    <p className="text-xs text-[#9CA6B8] leading-relaxed">{st.note}</p>
                  </button>
                );
              })}
            </div>

            <div ref={worked3DRef} className="lg:col-span-7 instrument-frame overflow-hidden">
              {mountWorked3D ? (
                <Suspense
                  fallback={
                    <div className="h-[380px] flex items-center justify-center bg-[#0B1018] font-mono-data text-xs text-[#9CA6B8]">
                      Loading 3D Worked Example…
                    </div>
                  }
                >
                  <LazySolidNetScene
                    solid="square-pyramid"
                    width={3.0}
                    depth={3.0}
                    height={2.0}
                    unfold={activeStep.unfold}
                    highlightPart={activeStep.highlight}
                    showInternalTriangle={activeStep.internalTriangle}
                    heightClass="h-[380px] sm:h-[420px]"
                  />
                </Suspense>
              ) : (
                <div className="h-[380px] sm:h-[420px] flex flex-col items-center justify-center gap-3 bg-[#080C15] p-6 text-center">
                  <EquationMiniVisual kind="pyramid-slant" accent="#38D9FF" heightClass="h-[170px]" />
                  <button
                    type="button"
                    onClick={() => setMountWorked3D(true)}
                    className="px-4 py-2 rounded-full text-xs font-mono-data bg-[#38D9FF]/15 text-[#38D9FF] border border-[#38D9FF]/45"
                  >
                    Activate 3D Interactive Worked Pyramid
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* LAYER 4: Interactive Practice */}
        <section id="layer-4" className="space-y-4 scroll-mt-24">
          <div>
            <span className="font-mono-data text-[11px] uppercase tracking-widest text-[#38BDF8]">
              Layer 04 · Interactive Mastery Practice
            </span>
            <h2 className="font-serif-editorial text-2xl text-[#EDEBE4]">
              Calculate Nets, Slant Heights &amp; Cross-Sections
            </h2>
          </div>
          <PracticeEngine questions={GEOMETRY_QUESTIONS} accentColor="#38BDF8" />
        </section>

        {/* LAYER 5: Visualized Misconception (Altitude h vs Slant Height l) */}
        <section id="layer-5" className="space-y-4 scroll-mt-24">
          <div>
            <span className="font-mono-data text-[11px] uppercase tracking-widest text-[#F9735B]">
              Layer 05 · Visualized Common Misconception
            </span>
            <h2 className="font-serif-editorial text-2xl text-[#EDEBE4]">
              Vertical Altitude (<MathTex tex="h" />) Is NOT Triangle Slant Height (<MathTex tex="l" />)
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
            <div className="lg:col-span-6 instrument-frame p-5 bg-[#0D121A]">
              <svg viewBox="0 0 420 260" className="w-full h-auto" role="img" aria-label="Cross-section right triangle showing altitude h, apothem s/2, and slant height l">
                <defs>
                  <pattern id="smallGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(237,235,228,0.05)" strokeWidth="1" />
                  </pattern>
                </defs>
                <rect width="420" height="260" fill="url(#smallGrid)" />

                {/* Pyramid cross section triangle */}
                <polygon
                  points="80,215 340,215 210,45"
                  fill="rgba(56, 189, 248, 0.08)"
                  stroke="rgba(56, 189, 248, 0.4)"
                  strokeWidth="1.5"
                />
                {/* Vertical Altitude h */}
                <line x1="210" y1="45" x2="210" y2="215" stroke="#F9735B" strokeWidth="3" />
                {/* Apothem s/2 */}
                <line x1="210" y1="215" x2="340" y2="215" stroke="#E5A94C" strokeWidth="3" />
                {/* Slant Height l */}
                <line x1="210" y1="45" x2="340" y2="215" stroke="#34D399" strokeWidth="3.2" />
                {/* Right angle */}
                <polyline points="210,197 228,197 228,215" fill="none" stroke="#EDEBE4" strokeWidth="1.5" />

                <text x="195" y="135" fill="#F9735B" fontSize="13" fontFamily="JetBrains Mono, monospace" textAnchor="end">
                  h = {misHeight}
                </text>
                <text x="275" y="236" fill="#E5A94C" fontSize="13" fontFamily="JetBrains Mono, monospace" textAnchor="middle">
                  s/2 = {(misSide / 2).toFixed(1)}
                </text>
                <text x="292" y="122" fill="#34D399" fontSize="13" fontFamily="JetBrains Mono, monospace" textAnchor="start">
                  l = {slantVal.toFixed(2)}
                </text>
                <text x="210" y="24" fill="#9CA6B8" fontSize="11" fontFamily="JetBrains Mono, monospace" textAnchor="middle">
                  Cross-Section Slice Through Pyramid Apex
                </text>
              </svg>
            </div>

            <div className="lg:col-span-6 instrument-frame p-5 space-y-4">
              <p className="text-sm text-[#9CA6B8] leading-relaxed">
                Using vertical altitude <MathTex tex="h" /> inside{' '}
                <MathTex tex="\frac{1}{2} P (\cdot)" /> always <strong>underestimates</strong>{' '}
                surface area because a tilted triangle face is the hypotenuse{' '}
                <MathTex tex="l = \sqrt{h^2 + (s/2)^2} > h" />.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="space-y-1 text-xs">
                  <div className="flex justify-between font-mono-data">
                    <span className="text-[#E5A94C]">Base Side (s)</span>
                    <span>{misSide}</span>
                  </div>
                  <input
                    type="range"
                    min={4}
                    max={14}
                    step={2}
                    value={misSide}
                    onChange={(e) => setMisSide(parseFloat(e.target.value))}
                    className="meridian-slider"
                    style={{ ['--slider-accent' as string]: '#E5A94C' }}
                  />
                </label>
                <label className="space-y-1 text-xs">
                  <div className="flex justify-between font-mono-data">
                    <span className="text-[#F9735B]">Altitude (h)</span>
                    <span>{misHeight}</span>
                  </div>
                  <input
                    type="range"
                    min={3}
                    max={12}
                    step={1}
                    value={misHeight}
                    onChange={(e) => setMisHeight(parseFloat(e.target.value))}
                    className="meridian-slider"
                    style={{ ['--slider-accent' as string]: '#F9735B' }}
                  />
                </label>
              </div>

              <div className="p-3.5 rounded bg-[#0D121A] border border-[rgba(237,235,228,0.1)] space-y-1.5 font-mono-data text-xs">
                <div className="flex justify-between">
                  <span className="text-[#34D399]">True Lateral Area (½·P·l):</span>
                  <span className="text-[#34D399]">{trueLateral.toFixed(1)} u²</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#F9735B]">Erroneous (½·P·h):</span>
                  <span className="text-[#F9735B]">{wrongLateral.toFixed(1)} u²</span>
                </div>
                <div className="flex justify-between border-t hairline-rule pt-1.5">
                  <span className="text-[#EDEBE4]">Missing Material Error:</span>
                  <span className="text-[#E5A94C]">−{errorGap.toFixed(1)} u²</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* LAYER 6: Real-World Application */}
        <section className="space-y-4">
          <div>
            <span className="font-mono-data text-[11px] uppercase tracking-widest text-[#38BDF8]">
              Layer 06 · Real-World Engineering Application
            </span>
            <h2 className="font-serif-editorial text-2xl text-[#EDEBE4]">
              Architectural Glass Pyramid Atrium Estimator
            </h2>
          </div>

          <div className="instrument-frame p-5 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            <div className="md:col-span-6 space-y-3">
              <p className="text-sm text-[#9CA6B8] leading-relaxed">
                Structural glazing engineers compute <strong>lateral surface area</strong> to order
                tempered glass panels, and <strong>interior volume</strong> to size HVAC air
                exchange.
              </p>
              <label className="block space-y-1 text-xs">
                <div className="flex justify-between font-mono-data">
                  <span className="text-[#38BDF8]">Atrium Base Span (s)</span>
                  <span>{atriumSide} m</span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={40}
                  step={2}
                  value={atriumSide}
                  onChange={(e) => setAtriumSide(parseFloat(e.target.value))}
                  className="meridian-slider"
                  style={{ ['--slider-accent' as string]: '#38BDF8' }}
                />
              </label>
              <label className="block space-y-1 text-xs">
                <div className="flex justify-between font-mono-data">
                  <span className="text-[#38BDF8]">Apex Height (h)</span>
                  <span>{atriumHeight} m</span>
                </div>
                <input
                  type="range"
                  min={8}
                  max={30}
                  step={1}
                  value={atriumHeight}
                  onChange={(e) => setAtriumHeight(parseFloat(e.target.value))}
                  className="meridian-slider"
                  style={{ ['--slider-accent' as string]: '#38BDF8' }}
                />
              </label>
            </div>

            <div className="md:col-span-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-4 rounded bg-[#0D121A] border border-[rgba(237,235,228,0.1)]">
                <span className="font-mono-data text-[10px] uppercase text-[#6C7689] block">
                  Beam Slant (l)
                </span>
                <span className="font-mono-data text-xl text-[#34D399]">
                  {atriumSlant.toFixed(1)} m
                </span>
              </div>
              <div className="p-4 rounded bg-[#0D121A] border border-[rgba(56,189,248,0.3)]">
                <span className="font-mono-data text-[10px] uppercase text-[#6C7689] block">
                  Glass Cladding (L)
                </span>
                <span className="font-mono-data text-xl text-[#38BDF8]">
                  {atriumGlass.toFixed(0)} m²
                </span>
              </div>
              <div className="p-4 rounded bg-[#0D121A] border border-[rgba(237,235,228,0.1)]">
                <span className="font-mono-data text-[10px] uppercase text-[#6C7689] block">
                  HVAC Volume (V)
                </span>
                <span className="font-mono-data text-xl text-[#EDEBE4]">
                  {atriumVol.toFixed(0)} m³
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* LAYER 7: Verified Standards & Sources */}
        <section id="layer-7" className="space-y-4 border-t hairline-rule pt-8 scroll-mt-24">
          <div>
            <span className="font-mono-data text-[11px] uppercase tracking-widest text-[#9CA6B8]">
              Layer 07 · Verified Standards &amp; Official Sources
            </span>
            <h2 className="font-serif-editorial text-2xl text-[#EDEBE4]">
              Florida B.E.S.T. / CPALMS Alignment
            </h2>
            <p className="text-xs text-[#9CA6B8] mt-1">
              Geometry Course Code{' '}
              <a
                href={FLDOE_SOURCES.cpalmsGeom.url}
                target="_blank"
                rel="noreferrer"
                className="text-[#38BDF8] underline underline-offset-2"
              >
                1206310 (CPALMS)
              </a>{' '}
              · Official{' '}
              <a
                href={FLDOE_SOURCES.bestPdf.url}
                target="_blank"
                rel="noreferrer"
                className="text-[#EDEBE4] underline underline-offset-2"
              >
                FLDOE B.E.S.T. Mathematics PDF
              </a>{' '}
              · Consulted November 22, 2026.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {LESSON_STANDARD_CODES.map((code) => {
              const std = VERIFIED_STANDARDS[code];
              if (!std) return null;
              return (
                <div key={code} className="instrument-frame p-4 space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono-data text-xs text-[#38BDF8]">{std.code}</span>
                    <a
                      href={std.sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 font-mono-data text-[11px] text-[#9CA6B8] hover:text-[#EDEBE4]"
                    >
                      CPALMS <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <p className="text-xs text-[#EDEBE4] leading-relaxed">{std.description}</p>
                  {std.clarification && (
                    <p className="text-[11px] text-[#6C7689] leading-snug">{std.clarification}</p>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </AtlasShell>
  );
}
