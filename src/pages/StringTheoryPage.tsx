import { Link } from 'react-router-dom';
import { ArrowRight, Atom, Compass, Layers, Orbit, Sparkles } from 'lucide-react';
import { AtlasShell } from '../components/AtlasShell';
import { MathTex } from '../components/MathTex';
import { PracticeEngine, PracticeQuestion } from '../components/PracticeEngine';
import { CalabiYauManifold3D } from '../visuals/frontier/CalabiYauManifold3D';
import { OrbitalSignalTorus3D } from '../visuals/frontier/OrbitalSignalTorus3D';

interface MathBridgeCard {
  id: string;
  tag: string;
  courseLabel: string;
  courseRoute: string;
  accent: string;
  title: string;
  tex: string;
  insight: string;
  connection: string;
}

const MATH_BRIDGE_CARDS: MathBridgeCard[] = [
  {
    id: 'euler-phase',
    tag: '01 · Complex Phase Rotation',
    courseLabel: 'Algebra 2 · Complex Numbers',
    courseRoute: '/course/algebra-2',
    accent: '#FFE29E',
    title: 'Why Euler’s e^(iθ) Powers Quantum String Phase',
    tex: 'e^{i\\theta} = \\cos\\theta + i\\sin\\theta',
    insight:
      'Every point on the complex unit circle encodes both a horizontal cosine wave and a vertical sine wave inside one compact exponential.',
    connection:
      'In string theory, quantum amplitudes and hidden extra-dimensional loops spin smoothly by multiplying by e^(iθ)—turning trigonometry into simple exponent addition!',
  },
  {
    id: 'trig-harmonics',
    tag: '02 · Standing Wave Harmonics',
    courseLabel: 'Precalculus · Unit Circle & Waves',
    courseRoute: '/lesson/unit-circle',
    accent: '#F4C46C',
    title: 'Why sin(nπx/L) Creates Particle Masses',
    tex: 'y(x,t) = A\\sin\\!\\left(\\dfrac{n\\pi x}{L}\\right)\\cos(\\omega_n t),\\quad E_n \\propto n\\sqrt{T}',
    insight:
      'Just like a guitar string pinned at both ends can only vibrate in whole-number overtones n = 1, 2, 3…, a quantum string only allows discrete standing waves.',
    connection:
      'Each harmonic integer n sounds a different "note" in spacetime: n=1 behaves like a massless photon, n=2 closed loops match the spin-2 graviton, and higher overtones carry greater mass energy!',
  },
  {
    id: 'calabi-yau-roots',
    tag: '03 · Complex Polynomials',
    courseLabel: 'Algebra 2 · Roots of Unity',
    courseRoute: '/neural',
    accent: '#46D6E8',
    title: 'Why z₁ⁿ + z₂ⁿ = 1 Folds 6 Compact Dimensions',
    tex: 'z_1^n + z_2^n = 1 \\implies z_k = r^{1/n}e^{i(\\theta + 2\\pi k)/n}',
    insight:
      'Solving zⁿ = 1 places n evenly spaced roots around the unit circle. Pairing two complex dimensions stitches n² smooth hyperbolic sheets together.',
    connection:
      'When 6 extra dimensions curl into a Ricci-flat Calabi-Yau manifold (R_μν = 0), strings can wrap and vibrate inside its n² symmetric throats without tearing spacetime.',
  },
  {
    id: 'curvature-scaling',
    tag: '04 · Geometry & Exponents',
    courseLabel: 'Geometry · 3D Topology & Scaling',
    courseRoute: '/lesson/solids-3d',
    accent: '#FF8563',
    title: 'Vectors, Euler Invariants & Hidden Volume',
    tex: '\\chi = V - E + F,\\qquad N_{\\text{families}} = \\dfrac{|\\chi|}{2},\\qquad V_6 \\sim (2\\pi R)^6',
    insight:
      'Geometry tracks shape invariants like Euler’s χ = V − E + F, while exponent laws govern how volume shrinks across d dimensions when radius R gets tiny.',
    connection:
      'At R ≈ 10⁻³⁵ m, raising R to the 6th power hides six whole spatial directions from human eyes—yet χ = −6 still predicts why matter appears in 3 particle families.',
  },
];

const STRING_PRACTICE_QUESTIONS: PracticeQuestion[] = [
  {
    id: 'str-1',
    prompt:
      'A relativistic string’s harmonic energy scales as E(n, T) = E₁ · n · √(T / T₀). If the fundamental photon mode (n = 1) at tension T₀ has energy E₁ = 2.5 units, what energy does a quark harmonic mode (n = 3) reach when string tension increases to T = 4 T₀?',
    promptTex: 'E(3,\\; 4T_0) = 2.5 \\cdot 3 \\cdot \\sqrt{\\dfrac{4T_0}{T_0}} = \\text{?}',
    type: 'numeric',
    correctAnswer: 15,
    tolerance: 0.05,
    unitLabel: 'energy units',
    hint: 'First simplify √(4T₀ / T₀) = √4 = 2, then multiply by harmonic number n = 3 and baseline E₁ = 2.5.',
    visualKind: 'sinusoid-wave',
    solutionSteps: [
      {
        label: 'Evaluate Tension Factor',
        tex: '\\sqrt{\\dfrac{4T_0}{T_0}} = \\sqrt{4} = 2',
        note: 'Quadrupling string tension doubles the wave speed and oscillation frequency.',
      },
      {
        label: 'Scale by Harmonic Mode n = 3',
        tex: 'E = 2.5 \\times 3 \\times 2 = 15',
        note: 'Both higher overtone n and tighter tension T raise the string’s quantized mass-energy.',
      },
    ],
  },
  {
    id: 'str-2',
    prompt:
      'In the quintic Calabi-Yau patch z₁⁵ + z₂⁵ = 1, each sheet rotates by a fifth root of unity e^(i 2πk / 5). How many degrees separate two neighboring roots around the complex unit circle?',
    promptTex: '\\Delta \\theta = \\dfrac{360^\\circ}{5} = \\text{?}',
    type: 'numeric',
    correctAnswer: 72,
    tolerance: 0.1,
    unitLabel: 'degrees',
    hint: 'Divide a full 360° circle evenly into n = 5 sectors.',
    visualKind: 'euler-circle',
    solutionSteps: [
      {
        label: 'Full Circle in Radians or Degrees',
        tex: '2\\pi \\text{ rad} = 360^\\circ',
        note: 'All 5 roots of z⁵ = 1 sit equally spaced on the unit circle |z| = 1.',
      },
      {
        label: 'Divide by Symmetry Exponent n = 5',
        tex: '\\Delta\\theta = \\dfrac{360^\\circ}{5} = 72^\\circ',
        note: 'Each 72° turn advances k → k + 1, stitching 5 × 5 = 25 local sheets smoothly.',
      },
    ],
  },
  {
    id: 'str-3',
    prompt:
      'Suppose a folded polyhedral model of a Calabi-Yau slice has V = 12 vertices, E = 36 edges, and F = 18 faces. Using Euler’s formula χ = V − E + F and the generation rule N_gen = |χ| / 2, how many particle families does this geometry produce?',
    promptTex: '\\chi = 12 - 36 + 18,\\qquad N_{\\text{gen}} = \\dfrac{|\\chi|}{2}',
    type: 'multiple-choice',
    options: [
      { id: 'a', label: '2 families', tex: 'N_{\\text{gen}} = 2\\; (|\\chi|=4)' },
      { id: 'b', label: '3 families', tex: 'N_{\\text{gen}} = 3\\; (|\\chi|=6)' },
      { id: 'c', label: '6 families', tex: 'N_{\\text{gen}} = 6\\; (|\\chi|=12)' },
      { id: 'd', label: '1 family', tex: 'N_{\\text{gen}} = 1\\; (|\\chi|=2)' },
    ],
    correctAnswer: 'b',
    hint: 'Compute V − E + F carefully first (watch the negative sign!), then take absolute value and divide by 2.',
    visualKind: 'prism-net',
    solutionSteps: [
      {
        label: 'Compute Euler Characteristic χ',
        tex: '\\chi = V - E + F = 12 - 36 + 18 = -6',
        note: 'Unlike a sphere (χ = 2), higher-genus folded surfaces have negative Euler numbers.',
      },
      {
        label: 'Count Independent Particle Generations',
        tex: 'N_{\\text{gen}} = \\dfrac{|-6|}{2} = 3',
        note: 'An Euler characteristic of −6 naturally yields 3 matter generations—matching our universe!',
      },
    ],
  },
  {
    id: 'str-4',
    prompt:
      'A 6-dimensional compact torus has internal volume V₆ = (2πR)⁶. If you shrink the compactification radius R in half (R_new = R / 2), what fraction of the original 6D volume remains?',
    promptTex: '\\dfrac{V_{6,\\text{new}}}{V_{6,\\text{old}}} = \\dfrac{(2\\pi \\cdot R/2)^6}{(2\\pi R)^6} = \\text{?}',
    type: 'multiple-choice',
    options: [
      { id: 'a', label: '1/12', tex: '\\dfrac{1}{12}' },
      { id: 'b', label: '1/32', tex: '\\dfrac{1}{32}' },
      { id: 'c', label: '1/64', tex: '\\dfrac{1}{64}' },
      { id: 'd', label: '1/8', tex: '\\dfrac{1}{8}' },
    ],
    correctAnswer: 'c',
    hint: 'Apply the power-of-a-product exponent law: (1/2)⁶ = 1 / 2⁶.',
    visualKind: 'exponent-product',
    solutionSteps: [
      {
        label: 'Cancel Shared 2πR Factors',
        tex: '\\dfrac{(2\\pi R / 2)^6}{(2\\pi R)^6} = \\left(\\dfrac{1}{2}\\right)^6',
        note: 'Every spatial dimension contributes one factor of 1/2.',
      },
      {
        label: 'Evaluate Sixth Power',
        tex: '\\left(\\dfrac{1}{2}\\right)^6 = \\dfrac{1}{2^6} = \\dfrac{1}{64}',
        note: 'Higher dimensions amplify tiny changes in radius dramatically—explaining why extra dimensions stay hidden at subatomic scales.',
      },
    ],
  },
];

export function StringTheoryPage() {
  return (
    <AtlasShell>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-14">
        {/* SECTION 1: IMMERSIVE HERO + CALABI-YAU MANIFOLD LAB */}
        <section id="manifold-lab" className="space-y-6 scroll-mt-24">
          <div
            className="relative rounded-2xl p-6 sm:p-8 bg-[#0B0C12]/95 overflow-hidden"
            style={{
              border: '1px solid rgba(244, 196, 108, 0.17)',
              boxShadow:
                'inset 0 1px 0 rgba(255, 232, 178, 0.22), 0 28px 60px -28px rgba(0, 0, 0, 0.96)',
            }}
          >
            <div
              className="pointer-events-none absolute -top-24 right-8 w-80 h-80 rounded-full blur-3xl opacity-20"
              style={{ background: 'radial-gradient(circle, #F4C46C 0%, transparent 70%)' }}
            />

            <div className="relative z-10 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
              <div className="space-y-3.5 max-w-3xl">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-[#F4C46C]/40 bg-[#F4C46C]/10 text-[11px] font-mono-data uppercase tracking-[0.18em] text-[#FFE29E]">
                  <Atom className="w-3.5 h-3.5 text-[#F4C46C]" />
                  10D Frontier Observatory · High School Math to String Theory
                </div>

                <h1 className="font-serif-editorial text-4xl sm:text-5xl text-[#F7F4EC] leading-[1.12]">
                  From Trigonometry &amp; Complex Numbers to{' '}
                  <span className="text-[#F4C46C]">10-Dimensional String Geometry</span>
                </h1>

                <p className="text-sm sm:text-base text-[#A8B2C6] leading-relaxed">
                  What if electrons, photons, and gravity aren’t zero-size dots—but microscopic
                  vibrating filaments of energy? The exact tools you study in high school math (
                  <MathTex tex="a+bi" />, <MathTex tex="e^{i\theta}" />,{' '}
                  <MathTex tex="\sin(n\omega t)" />, and 3D curvature) are the real blueprint behind{' '}
                  <strong className="text-[#FFE29E]">Calabi-Yau manifolds</strong> and{' '}
                  <strong className="text-[#46D6E8]">string vibrations</strong>.
                </p>
              </div>

              {/* Section Quick Navigation */}
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <a
                  href="#manifold-lab"
                  className="px-3 py-1.5 rounded-full font-mono-data text-[11px] bg-[#F4C46C] text-[#060609] font-semibold"
                >
                  01 · Manifold Lab
                </a>
                <a
                  href="#orbital-flux"
                  className="px-3 py-1.5 rounded-full font-mono-data text-[11px] bg-[#11131C] text-[#A8B2C6] hover:text-[#F7F4EC] border border-[#F4C46C]/20"
                >
                  02 · 60k Flux Engine
                </a>
                <a
                  href="#math-bridge"
                  className="px-3 py-1.5 rounded-full font-mono-data text-[11px] bg-[#11131C] text-[#A8B2C6] hover:text-[#F7F4EC] border border-[#F4C46C]/20"
                >
                  03 · Math Bridge
                </a>
                <a
                  href="#practice-deck"
                  className="px-3 py-1.5 rounded-full font-mono-data text-[11px] bg-[#11131C] text-[#A8B2C6] hover:text-[#F7F4EC] border border-[#F4C46C]/20"
                >
                  04 · Mastery Check
                </a>
              </div>
            </div>

            {/* Dimension Breakdown Strip */}
            <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-[#F4C46C]/15 font-mono-data text-xs">
              <div className="p-3 rounded-xl bg-[#11131C]/90 border border-[#F4C46C]/15">
                <span className="text-[10px] text-[#A8B2C6] uppercase block">Macro Space</span>
                <span className="text-base text-[#F7F4EC] font-semibold">3 Dimensions</span>
                <span className="text-[10.5px] text-[#FFE29E] block mt-0.5">x, y, z we move in</span>
              </div>
              <div className="p-3 rounded-xl bg-[#11131C]/90 border border-[#F4C46C]/15">
                <span className="text-[10px] text-[#A8B2C6] uppercase block">Flowing Time</span>
                <span className="text-base text-[#F7F4EC] font-semibold">+ 1 Dimension</span>
                <span className="text-[10.5px] text-[#46D6E8] block mt-0.5">Worldsheet coordinate τ</span>
              </div>
              <div className="p-3 rounded-xl bg-[#11131C]/90 border border-[#F4C46C]/15">
                <span className="text-[10px] text-[#A8B2C6] uppercase block">Calabi-Yau Fold</span>
                <span className="text-base text-[#F4C46C] font-semibold">+ 6 Compact</span>
                <span className="text-[10.5px] text-[#FF8563] block mt-0.5">Curled at ~10⁻³⁵ m</span>
              </div>
              <div className="p-3 rounded-xl bg-[#11131C]/90 border border-[#F4C46C]/15">
                <span className="text-[10px] text-[#A8B2C6] uppercase block">Superstring Total</span>
                <span className="text-base text-[#45E6A6] font-semibold">= 10D Spacetime</span>
                <span className="text-[10.5px] text-[#A8B2C6] block mt-0.5">Consistent quantum waves</span>
              </div>
            </div>
          </div>

          <CalabiYauManifold3D />
        </section>

        {/* SECTION 2: 60,000-PARTICLE STRING FLUX EXPLORER */}
        <section id="orbital-flux" className="space-y-5 scroll-mt-24">
          <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#F4C46C]/20 pb-3">
            <div className="space-y-1 max-w-3xl">
              <span className="font-mono-data text-[10.5px] uppercase tracking-[0.2em] text-[#F4C46C] flex items-center gap-1.5">
                <Orbit className="w-3.5 h-3.5" />
                Layer 02 · 60,000-Particle String Flux Explorer
              </span>
              <h2 className="font-serif-editorial text-2xl sm:text-3xl text-[#F7F4EC]">
                Orbital Torus Flux, Hopf Rings &amp; Exponential Resonance Plumes
              </h2>
              <p className="text-xs sm:text-sm text-[#A8B2C6]">
                Switch between four real-time GPU particle manifolds, watch the{' '}
                <span className="text-[#FFE29E]">6×6 Coupling Matrix</span> track dimensional
                mixing, and click anywhere on the vortex to fire a radial harmonic shockwave.
              </p>
            </div>
            <Link
              to="/neural"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full font-mono-data text-[11px] bg-[#11131C] border border-[#F4C46C]/30 text-[#FFE29E] hover:border-[#F4C46C]"
            >
              Compare with 2D Vortex Lab <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <OrbitalSignalTorus3D />
        </section>

        {/* SECTION 3: FROM HIGH SCHOOL MATH TO 10 DIMENSIONS BRIDGE CARDS */}
        <section id="math-bridge" className="space-y-6 scroll-mt-24">
          <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#F4C46C]/20 pb-3">
            <div className="space-y-1 max-w-3xl">
              <span className="font-mono-data text-[10.5px] uppercase tracking-[0.2em] text-[#46D6E8] flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" />
                Layer 03 · Conceptual Bridge
              </span>
              <h2 className="font-serif-editorial text-2xl sm:text-3xl text-[#F7F4EC]">
                From High School Math to 10 Dimensions
              </h2>
              <p className="text-xs sm:text-sm text-[#A8B2C6]">
                Every frontier equation in theoretical physics builds directly on ideas you already
                know—exponents, complex circles, standing sine waves, and geometric invariants.
              </p>
            </div>
            <Link
              to="/map"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full font-mono-data text-[11px] bg-[#11131C] border border-[#46D6E8]/35 text-[#46D6E8] hover:border-[#46D6E8]"
            >
              <Compass className="w-3.5 h-3.5" /> Explore 36-Topic Atlas
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {MATH_BRIDGE_CARDS.map((card) => (
              <article
                key={card.id}
                className="rounded-2xl p-5 sm:p-6 bg-[#0B0C12]/95 flex flex-col justify-between gap-4 transition-colors"
                style={{
                  border: '1px solid rgba(244, 196, 108, 0.17)',
                  boxShadow:
                    'inset 0 1px 0 rgba(255, 232, 178, 0.22), 0 22px 48px -26px rgba(0, 0, 0, 0.92)',
                }}
              >
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span
                      className="font-mono-data text-[10.5px] uppercase tracking-wider"
                      style={{ color: card.accent }}
                    >
                      {card.tag}
                    </span>
                    <Link
                      to={card.courseRoute}
                      className="px-2.5 py-0.5 rounded-full font-mono-data text-[10px] bg-[#11131C] border border-[#F4C46C]/20 text-[#A8B2C6] hover:text-[#F7F4EC]"
                    >
                      {card.courseLabel} →
                    </Link>
                  </div>

                  <h3 className="font-serif-editorial text-xl sm:text-2xl text-[#F7F4EC]">
                    {card.title}
                  </h3>

                  <div
                    className="p-3 rounded-xl bg-[#11131C] overflow-x-auto"
                    style={{ border: '1px solid rgba(244, 196, 108, 0.17)' }}
                  >
                    <MathTex tex={card.tex} displayMode className="text-[#FFE29E]" />
                  </div>

                  <p className="text-xs sm:text-sm text-[#F7F4EC]/90 leading-relaxed">
                    <strong style={{ color: card.accent }}>High School Core:</strong>{' '}
                    {card.insight}
                  </p>
                  <p className="text-xs sm:text-sm text-[#A8B2C6] leading-relaxed">
                    <strong className="text-[#45E6A6]">10D Leap:</strong> {card.connection}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* SECTION 4: WORKED MULTI-STEP PRACTICE ENGINE */}
        <section id="practice-deck" className="space-y-5 scroll-mt-24">
          <div className="flex flex-wrap items-end justify-between gap-3 border-b border-[#F4C46C]/20 pb-3">
            <div className="space-y-1">
              <span className="font-mono-data text-[10.5px] uppercase tracking-[0.2em] text-[#F4C46C] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Layer 04 · Interactive Frontier Mastery Check
              </span>
              <h2 className="font-serif-editorial text-2xl sm:text-3xl text-[#F7F4EC]">
                Test Your Intuition: Harmonics, Roots of Unity, Euler Topology &amp; 6D Scaling
              </h2>
            </div>
          </div>

          <div
            className="rounded-2xl p-4 sm:p-6 bg-[#0B0C12]/95"
            style={{
              border: '1px solid rgba(244, 196, 108, 0.17)',
              boxShadow: 'inset 0 1px 0 rgba(255, 232, 178, 0.2)',
            }}
          >
            <PracticeEngine accentColor="#F4C46C" questions={STRING_PRACTICE_QUESTIONS} />
          </div>
        </section>
      </div>
    </AtlasShell>
  );
}
