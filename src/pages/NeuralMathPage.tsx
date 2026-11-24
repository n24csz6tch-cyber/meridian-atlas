import { Link } from 'react-router-dom';
import { ArrowRight, Compass, ExternalLink, Network, Orbit, Sparkles } from 'lucide-react';
import { AtlasShell } from '../components/AtlasShell';
import { LessonNavHeader } from '../components/LessonNavHeader';
import { MathTex } from '../components/MathTex';
import { VERIFIED_STANDARDS } from '../data/standards';
import { EquationMiniVisual } from '../visuals/equations/EquationMiniVisual';
import { GoldenHarmonicSpine } from '../visuals/harmony/GoldenHarmonicSpine';
import { NeuralMathEngine } from '../visuals/neural/NeuralMathEngine';
import { MathVortexCanvas } from '../visuals/vortex/MathVortexCanvas';

const MATRIX_STANDARDS = ['MA.912.NSO.4.1', 'MA.912.NSO.4.2'];

export function NeuralMathPage() {
  return (
    <AtlasShell activeCourse="algebra-2">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-12">
        <LessonNavHeader courseId="algebra-2" activeNodeId="a2-matrices" code="A2-06" />

        {/* Flagship AUREA Golden Observatory Hero */}
        <header
          className="relative rounded-2xl p-6 sm:p-8 bg-[#0B0C12]/90 backdrop-blur-md border overflow-hidden space-y-4"
          style={{
            borderColor: 'rgba(244, 196, 108, 0.17)',
            boxShadow: 'inset 0 1px 0 rgba(255, 232, 178, 0.14), 0 24px 60px -28px rgba(0,0,0,0.95)',
          }}
        >
          <div
            className="absolute top-0 left-0 right-0 h-[1.5px] opacity-85"
            style={{
              background:
                'linear-gradient(90deg, transparent 5%, #F4C46C 35%, #FFE29E 50%, #46D6E8 75%, transparent 95%)',
            }}
          />

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-[#F4C46C]/45 bg-[#F4C46C]/12 text-[11px] font-mono-data text-[#FFE29E]">
              <Network className="w-3.5 h-3.5 text-[#F4C46C]" />
              AUREA Observatory · Harmonic Spine, Neural Matrices &amp; Field Dynamics
            </div>
            <span className="font-mono-data text-[10px] uppercase tracking-[0.2em] text-[#B88938]">
              A2-06 · Flagship Synthesis Lab
            </span>
          </div>

          <h1 className="font-serif-editorial text-3xl sm:text-5xl text-[#F7F4EC] leading-tight max-w-4xl">
            How High School Math Powers{' '}
            <em className="italic text-[#F4C46C]">Neural Networks</em> &amp;{' '}
            <em className="italic text-[#FFE29E]">Harmonic Fields</em>
          </h1>

          <p className="text-sm sm:text-base text-[#A8B2C6] leading-relaxed max-w-3xl">
            Trace 24 mathematical foundations converging through the Golden Harmonic Spine, train a
            real backpropagation neural network on a 5×5 matrix pad, and explore continuous curl
            vortices, strange attractors, and Fourier phasor synthesis inside one live observatory.
          </p>
        </header>

        {/* SECTION 1: GOLDEN HARMONIC SPINE OBSERVATORY */}
        <section className="space-y-4">
          <div className="flex flex-wrap items-end justify-between gap-3 border-b border-[rgba(244,196,108,0.17)] pb-3">
            <div>
              <span className="font-mono-data text-[10px] uppercase tracking-[0.2em] text-[#F4C46C]">
                Observatory Instrument 01 · Harmonic Coupling Spine
              </span>
              <h2 className="font-serif-editorial text-2xl sm:text-3xl text-[#F7F4EC]">
                The Golden Harmonic Spine — 24 Foundations to Frontier Synthesis
              </h2>
            </div>
            <span className="font-mono-data text-[11px] text-[#A8B2C6]">
              Hover or click any filament node to trace live coupling
            </span>
          </div>

          <GoldenHarmonicSpine />
        </section>

        {/* SECTION 2: NEURAL MATRIX & BACKPROPAGATION LAB */}
        <section id="layer-1" className="space-y-6 scroll-mt-24">
          <div className="flex flex-wrap items-end justify-between gap-3 border-b border-[rgba(244,196,108,0.17)] pb-3">
            <div>
              <span className="font-mono-data text-[10px] uppercase tracking-[0.2em] text-[#45E6A6]">
                Observatory Instrument 02 · Matrix Layer Engine
              </span>
              <h2 className="font-serif-editorial text-2xl sm:text-3xl text-[#F7F4EC]">
                Interactive [6 → 8 → 8 → 4] Neural Matrix &amp; Backprop Lab
              </h2>
            </div>
            <span className="font-mono-data text-[11px] text-[#FFE29E]">
              Every synapse is a real weight matrix entry
            </span>
          </div>

          <div
            className="rounded-2xl p-1 bg-[#0B0C12]/80 border"
            style={{ borderColor: 'rgba(244, 196, 108, 0.17)' }}
          >
            <NeuralMathEngine />
          </div>

          <div id="layer-2" className="grid grid-cols-1 md:grid-cols-3 gap-5 scroll-mt-24">
            <div
              className="rounded-2xl p-5 space-y-3 bg-[#0B0C12]/90 border"
              style={{ borderColor: 'rgba(244, 196, 108, 0.17)' }}
            >
              <span className="font-mono-data text-[10px] uppercase tracking-wider text-[#46D6E8]">
                01 · Forward Matrix Composition
              </span>
              <h3 className="font-serif-editorial text-xl text-[#F7F4EC]">
                Weighted Space Warping
              </h3>
              <EquationMiniVisual kind="neural-layer" accent="#46D6E8" caption="Layered Synapses" />
              <div className="rounded-lg bg-[#11131C] border border-[rgba(244,196,108,0.14)] px-2.5 py-2 overflow-x-auto">
                <MathTex
                  tex="\mathbf{a}^{(l)} = \sigma\!\left(\mathbf{W}^{(l)}\mathbf{a}^{(l-1)} + \mathbf{b}^{(l)}\right)"
                  displayMode
                  className="text-[#F7F4EC]"
                />
              </div>
              <p className="text-xs text-[#A8B2C6] leading-relaxed">
                Cyan edges carry positive weights amplifying a pattern; coral edges carry negative
                weights inhibiting competing classes.
              </p>
            </div>

            <div
              className="rounded-2xl p-5 space-y-3 bg-[#0B0C12]/90 border"
              style={{ borderColor: 'rgba(244, 196, 108, 0.17)' }}
            >
              <span className="font-mono-data text-[10px] uppercase tracking-wider text-[#45E6A6]">
                02 · Nonlinear Activation Thresholds
              </span>
              <h3 className="font-serif-editorial text-xl text-[#F7F4EC]">
                Breaking Pure Linearity
              </h3>
              <EquationMiniVisual kind="activation-relu" accent="#45E6A6" caption="Nonlinear Bend" />
              <div className="rounded-lg bg-[#11131C] border border-[rgba(244,196,108,0.14)] px-2.5 py-2 overflow-x-auto">
                <MathTex
                  tex="\sigma(z) = \dfrac{1}{1 + e^{-z}}, \qquad \tanh(z) = \dfrac{e^z - e^{-z}}{e^z + e^{-z}}"
                  displayMode
                  className="text-[#F7F4EC]"
                />
              </div>
              <p className="text-xs text-[#A8B2C6] leading-relaxed">
                Without <code className="text-[#45E6A6]">σ(z)</code>, stacking layers collapses
                into a single linear matrix. Nonlinear curves bend decision boundaries around
                complex shapes.
              </p>
            </div>

            <div
              className="rounded-2xl p-5 space-y-3 bg-[#0B0C12]/90 border"
              style={{ borderColor: 'rgba(244, 196, 108, 0.17)' }}
            >
              <span className="font-mono-data text-[10px] uppercase tracking-wider text-[#F4C46C]">
                03 · Backpropagation Gradient Descent
              </span>
              <h3 className="font-serif-editorial text-xl text-[#F7F4EC]">
                Chain-Rule Error Flow
              </h3>
              <EquationMiniVisual kind="secant-to-tangent" accent="#F4C46C" caption="Slope Descent" />
              <div className="rounded-lg bg-[#11131C] border border-[rgba(244,196,108,0.14)] px-2.5 py-2 overflow-x-auto">
                <MathTex
                  tex="\Delta W^{(l)}_{ji} = -\eta\,\delta^{(l)}_j\,a^{(l-1)}_i"
                  displayMode
                  className="text-[#F7F4EC]"
                />
              </div>
              <p className="text-xs text-[#A8B2C6] leading-relaxed">
                Click <strong className="text-[#FFE29E]">Train 25 Epochs</strong> to watch gradient
                descent nudge weights across all three transformations until classification locks
                on target.
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 3: CONTINUOUS DYNAMICAL SYSTEMS & PARTICLE VORTEX */}
        <section className="space-y-5">
          <div className="flex flex-wrap items-end justify-between gap-3 border-b border-[rgba(244,196,108,0.17)] pb-3">
            <div>
              <span className="font-mono-data text-[10px] uppercase tracking-[0.2em] text-[#FFE29E]">
                Observatory Instrument 03 · Continuous Dynamical Systems
              </span>
              <h2 className="font-serif-editorial text-2xl sm:text-3xl text-[#F7F4EC]">
                Vortex Streams, Strange Attractors &amp; Fourier Epicycles
              </h2>
            </div>
            <Orbit className="w-5 h-5 text-[#F4C46C]" />
          </div>

          <MathVortexCanvas />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div
              className="rounded-xl p-4 space-y-2 bg-[#11131C]/90 border"
              style={{ borderColor: 'rgba(244, 196, 108, 0.17)' }}
            >
              <span className="font-mono-data text-[10px] uppercase tracking-wider text-[#F4C46C]">
                Curl &amp; Divergence
              </span>
              <MathTex
                tex="\nabla \times \mathbf{F} = \left(\frac{\partial F_y}{\partial x} - \frac{\partial F_x}{\partial y}\right)\hat{\mathbf{k}} = 2\omega\,\hat{\mathbf{k}}"
                displayMode
                className="text-xs text-[#F7F4EC]"
              />
              <p className="text-xs text-[#A8B2C6]">
                Curl <code className="text-[#FFE29E]">Ω</code> governs microscopic spin rate;
                eigenvalue real part <code className="text-[#FF8563]">λ</code> switches sinks to
                unstable outward sources.
              </p>
            </div>

            <div
              className="rounded-xl p-4 space-y-2 bg-[#11131C]/90 border"
              style={{ borderColor: 'rgba(244, 196, 108, 0.17)' }}
            >
              <span className="font-mono-data text-[10px] uppercase tracking-wider text-[#FFE29E]">
                Lorenz Chaos Divergences
              </span>
              <MathTex
                tex="\|\mathbf{r}_1(t) - \mathbf{r}_2(t)\| \approx \delta_0\,e^{\lambda_L t}"
                displayMode
                className="text-xs text-[#F7F4EC]"
              />
              <p className="text-xs text-[#A8B2C6]">
                Two orbits differing by just 0.002 stay bounded inside the double lobe yet separate
                exponentially onto opposite butterfly wings.
              </p>
            </div>

            <div
              className="rounded-xl p-4 space-y-2 bg-[#11131C]/90 border"
              style={{ borderColor: 'rgba(244, 196, 108, 0.17)' }}
            >
              <span className="font-mono-data text-[10px] uppercase tracking-wider text-[#45E6A6]">
                Complex Fourier Series
              </span>
              <MathTex
                tex="c_n = \frac{1}{2\pi}\int_0^{2\pi} z(t)\,e^{-int}\,dt"
                displayMode
                className="text-xs text-[#F7F4EC]"
              />
              <p className="text-xs text-[#A8B2C6]">
                Every closed plane shape decomposes into orthogonal circular phasors rotating at
                integer multiples of fundamental frequency.
              </p>
            </div>
          </div>
        </section>

        {/* Verified Standards Alignment & Next Observatory Destinations */}
        <section
          className="rounded-2xl p-5 sm:p-6 space-y-4 bg-[#0B0C12]/90 border"
          style={{ borderColor: 'rgba(244, 196, 108, 0.17)' }}
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="font-mono-data text-[10px] uppercase tracking-[0.18em] text-[#45E6A6]">
              Layer 7 · Verified Florida B.E.S.T. Matrix Alignment
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <Link
                to="/frontier"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-mono-data bg-[#11131C] border border-[rgba(244,196,108,0.28)] text-[#FFE29E] hover:border-[#F4C46C]"
              >
                <Orbit className="w-3.5 h-3.5 text-[#F4C46C]" />
                String Theory 3D
              </Link>
              <Link
                to="/map"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-mono-data bg-[#11131C] border border-[rgba(244,196,108,0.22)] text-[#FFE29E] hover:border-[#F4C46C]"
              >
                <Compass className="w-3.5 h-3.5 text-[#F4C46C]" />
                36-Symbol Constellation
              </Link>
              <Link
                to="/instruments"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-mono-data bg-[#F4C46C] text-[#060609] font-semibold hover:brightness-110"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Explore All 16 Labs
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {MATRIX_STANDARDS.map((code) => {
              const s = VERIFIED_STANDARDS[code];
              return (
                <div
                  key={code}
                  className="rounded-xl p-4 space-y-1.5 bg-[#11131C]/90 border"
                  style={{ borderColor: 'rgba(244, 196, 108, 0.15)' }}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono-data text-xs text-[#45E6A6]">{s.code}</span>
                    <a
                      href={s.sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-mono-data text-[#A8B2C6] hover:text-[#FFE29E]"
                    >
                      {s.sourceLabel} <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <p className="text-xs text-[#F7F4EC] leading-relaxed">{s.description}</p>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </AtlasShell>
  );
}
