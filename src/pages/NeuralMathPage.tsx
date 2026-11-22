import { ExternalLink, Network, Sparkles } from 'lucide-react';
import { AtlasShell } from '../components/AtlasShell';
import { LessonNavHeader } from '../components/LessonNavHeader';
import { MathTex } from '../components/MathTex';
import { VERIFIED_STANDARDS } from '../data/standards';
import { EquationMiniVisual } from '../visuals/equations/EquationMiniVisual';
import { NeuralMathEngine } from '../visuals/neural/NeuralMathEngine';
import { MathVortexCanvas } from '../visuals/vortex/MathVortexCanvas';

const MATRIX_STANDARDS = ['MA.912.NSO.4.1', 'MA.912.NSO.4.2'];

export function NeuralMathPage() {
  return (
    <AtlasShell activeCourse="algebra-2">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-12">
        <LessonNavHeader courseId="algebra-2" activeNodeId="a2-matrices" code="A2-06" />

        {/* Hero Title */}
        <header className="space-y-3 max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-[#38D9FF]/40 bg-[#38D9FF]/10 text-[11px] font-mono-data text-[#38D9FF]">
            <Network className="w-3.5 h-3.5" />
            Interactive Linear Algebra, Calculus &amp; Dynamical Systems
          </div>
          <h1 className="font-serif-editorial text-4xl sm:text-5xl text-[#F4F3EE] leading-tight">
            Neural Networks as Layered Matrix Geometry — Plus Kinetic Field Vorticities
          </h1>
          <p className="text-sm sm:text-base text-[#A5B4CC] leading-relaxed">
            Every artificial neuron performs a weighted dot product plus bias shifted through a
            nonlinear activation curve. Manipulate a real 5×5 stimulus matrix below, watch
            activations ripple forward, train the network via analytical backpropagation, and then
            explore continuous phase vortices and chaotic attractors.
          </p>
        </header>

        {/* SECTION 1: NEURAL NETWORK LAB */}
        <section id="layer-1" className="space-y-6 scroll-mt-24">
          <NeuralMathEngine />

          <div id="layer-2" className="grid grid-cols-1 md:grid-cols-3 gap-5 scroll-mt-24">
            <div className="instrument-frame p-5 space-y-3">
              <span className="font-mono-data text-[10px] uppercase tracking-wider text-[#38D9FF]">
                01 · Forward Matrix Composition
              </span>
              <h2 className="font-serif-editorial text-xl text-[#F4F3EE]">
                Weighted Space Warping
              </h2>
              <EquationMiniVisual kind="neural-layer" accent="#38D9FF" caption="Layered Synapses" />
              <div className="instrument-panel px-2.5 py-2 overflow-x-auto">
                <MathTex
                  tex="\mathbf{a}^{(l)} = \sigma\!\left(\mathbf{W}^{(l)}\mathbf{a}^{(l-1)} + \mathbf{b}^{(l)}\right)"
                  displayMode
                  className="text-[#F4F3EE]"
                />
              </div>
              <p className="text-xs text-[#A5B4CC] leading-relaxed">
                Cyan edges carry positive weights amplifying a pattern; coral edges carry negative
                weights inhibiting competing classes.
              </p>
            </div>

            <div className="instrument-frame p-5 space-y-3">
              <span className="font-mono-data text-[10px] uppercase tracking-wider text-[#36EBA8]">
                02 · Nonlinear Activation Thresholds
              </span>
              <h2 className="font-serif-editorial text-xl text-[#F4F3EE]">
                Breaking Pure Linearity
              </h2>
              <EquationMiniVisual kind="activation-relu" accent="#36EBA8" caption="Nonlinear Bend" />
              <div className="instrument-panel px-2.5 py-2 overflow-x-auto">
                <MathTex
                  tex="\sigma(z) = \dfrac{1}{1 + e^{-z}}, \qquad \tanh(z) = \dfrac{e^z - e^{-z}}{e^z + e^{-z}}"
                  displayMode
                  className="text-[#F4F3EE]"
                />
              </div>
              <p className="text-xs text-[#A5B4CC] leading-relaxed">
                Without <code className="text-[#36EBA8]">σ(z)</code>, stacking layers collapses
                into a single linear matrix. Nonlinear curves bend decision boundaries around
                complex shapes.
              </p>
            </div>

            <div className="instrument-frame p-5 space-y-3">
              <span className="font-mono-data text-[10px] uppercase tracking-wider text-[#F5BC5E]">
                03 · Backpropagation Gradient Descent
              </span>
              <h2 className="font-serif-editorial text-xl text-[#F4F3EE]">
                Chain-Rule Error Flow
              </h2>
              <EquationMiniVisual kind="secant-to-tangent" accent="#F5BC5E" caption="Slope Descent" />
              <div className="instrument-panel px-2.5 py-2 overflow-x-auto">
                <MathTex
                  tex="\Delta W^{(l)}_{ji} = -\eta\,\delta^{(l)}_j\,a^{(l-1)}_i"
                  displayMode
                  className="text-[#F4F3EE]"
                />
              </div>
              <p className="text-xs text-[#A5B4CC] leading-relaxed">
                Click <strong className="text-[#F5BC5E]">Train 25 Epochs</strong> to watch gradient
                descent nudge weights across all three transformations until classification locks
                on target.
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 2: MATHEMATICAL VORTEX, LORENZ, FOURIER & COMPLEX FLOW */}
        <section className="space-y-5">
          <div className="flex flex-wrap items-end justify-between gap-3 border-b hairline-rule pb-3">
            <div>
              <span className="font-mono-data text-[10px] uppercase tracking-[0.2em] text-[#F4B956]">
                Continuous Dynamical Systems Theater
              </span>
              <h2 className="font-serif-editorial text-2xl sm:text-3xl text-[#F2F0E8]">
                Vortex Fields, Strange Attractors &amp; Fourier Epicycles
              </h2>
            </div>
            <Sparkles className="w-5 h-5 text-[#F4B956]" />
          </div>

          <MathVortexCanvas />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="instrument-panel p-4 space-y-2">
              <span className="font-mono-data text-[10px] uppercase tracking-wider text-[#38D4FF]">
                Curl &amp; Divergence
              </span>
              <MathTex
                tex="\nabla \times \mathbf{F} = \left(\frac{\partial F_y}{\partial x} - \frac{\partial F_x}{\partial y}\right)\hat{\mathbf{k}} = 2\omega\,\hat{\mathbf{k}}"
                displayMode
                className="text-xs text-[#F2F0E8]"
              />
              <p className="text-xs text-[#A7B3C7]">
                Curl <code className="text-[#38D4FF]">Ω</code> governs microscopic spin rate;
                eigenvalue real part <code className="text-[#F4B956]">λ</code> switches sinks to
                unstable outward sources.
              </p>
            </div>

            <div className="instrument-panel p-4 space-y-2">
              <span className="font-mono-data text-[10px] uppercase tracking-wider text-[#F4B956]">
                Lorenz Chaos Divergences
              </span>
              <MathTex
                tex="\|\mathbf{r}_1(t) - \mathbf{r}_2(t)\| \approx \delta_0\,e^{\lambda_L t}"
                displayMode
                className="text-xs text-[#F2F0E8]"
              />
              <p className="text-xs text-[#A7B3C7]">
                Two orbits differing by just 0.002 stay bounded inside the double lobe yet separate
                exponentially onto opposite butterfly wings.
              </p>
            </div>

            <div className="instrument-panel p-4 space-y-2">
              <span className="font-mono-data text-[10px] uppercase tracking-wider text-[#34E8A5]">
                Complex Fourier Series
              </span>
              <MathTex
                tex="c_n = \frac{1}{2\pi}\int_0^{2\pi} z(t)\,e^{-int}\,dt"
                displayMode
                className="text-xs text-[#F2F0E8]"
              />
              <p className="text-xs text-[#A7B3C7]">
                Every closed plane shape decomposes into orthogonal circular phasors rotating at
                integer multiples of fundamental frequency.
              </p>
            </div>
          </div>
        </section>

        {/* Verified Standards Alignment */}
        <section className="instrument-frame p-5 space-y-4">
          <span className="font-mono-data text-[10px] uppercase tracking-[0.18em] text-[#34E8A5] block">
            Layer 7 · Verified Florida B.E.S.T. Matrix Alignment
          </span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {MATRIX_STANDARDS.map((code) => {
              const s = VERIFIED_STANDARDS[code];
              return (
                <div key={code} className="instrument-panel p-4 space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono-data text-xs text-[#34E8A5]">{s.code}</span>
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
