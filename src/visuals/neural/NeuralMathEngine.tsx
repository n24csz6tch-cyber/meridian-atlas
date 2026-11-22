import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Play, Pause, RotateCcw, Zap } from 'lucide-react';
import { MathTex } from '../../components/MathTex';
import { useReducedMotion } from '../../hooks/useReducedMotion';

export type ActivationKind = 'sigmoid' | 'tanh' | 'relu';
export type PatternKey = 'parabola' | 'diagonal' | 'vortex' | 'step';

export interface NeuralMathEngineProps {
  compact?: boolean;
  heightClass?: string;
}

const LAYER_SIZES = [6, 8, 8, 4] as const;

const PATTERN_PRESETS: Record<PatternKey, { label: string; color: string; grid: number[] }> = {
  parabola: {
    label: 'Parabola',
    color: '#F4B956',
    grid: [
      1, 0, 0, 0, 1,
      1, 0, 0, 0, 1,
      0, 1, 0, 1, 0,
      0, 1, 0, 1, 0,
      0, 0, 1, 0, 0,
    ],
  },
  diagonal: {
    label: 'Diagonal',
    color: '#38D4FF',
    grid: [
      1, 1, 0, 0, 0,
      0, 1, 1, 0, 0,
      0, 0, 1, 1, 0,
      0, 0, 0, 1, 1,
      0, 0, 0, 0, 1,
    ],
  },
  vortex: {
    label: 'Vortex Ring',
    color: '#34E8A5',
    grid: [
      0, 1, 1, 1, 0,
      1, 0, 0, 0, 1,
      1, 0, 1, 0, 1,
      1, 0, 0, 0, 1,
      0, 1, 1, 1, 0,
    ],
  },
  step: {
    label: 'Step Jump',
    color: '#FF785A',
    grid: [
      0, 0, 0, 1, 1,
      0, 0, 0, 1, 1,
      0, 0, 1, 1, 1,
      1, 1, 1, 0, 0,
      1, 1, 1, 0, 0,
    ],
  },
};

const PATTERN_KEYS: PatternKey[] = ['parabola', 'diagonal', 'vortex', 'step'];

const INPUT_FEATURE_NAMES = [
  'Diag Trace',
  'Symmetry',
  'U-Curvature',
  'Ring Loop',
  'Quadrant Flip',
  'Fill Density',
];

function extractFeatures(grid: number[]): number[] {
  const g = (r: number, c: number) => grid[r * 5 + c] ?? 0;

  let diagSum = 0;
  let symDiff = 0;
  let total = 0;
  for (let r = 0; r < 5; r++) {
    diagSum += g(r, r);
    if (r < 4) diagSum += 0.35 * g(r, r + 1);
    for (let c = 0; c < 5; c++) {
      total += g(r, c);
      if (c < 2) symDiff += Math.abs(g(r, c) - g(r, 4 - c));
    }
  }

  const fDiag = Math.min(1, diagSum / 5.4);
  const fSym = Math.max(0, 1 - symDiff / 8);

  // U-Curvature: upper outer wings + bottom center minus bottom outer corners
  const uRaw =
    (g(0, 0) + g(0, 4) + g(1, 0) + g(1, 4) + g(4, 2) + g(2, 1) + g(2, 3)) / 7 -
    (g(4, 0) + g(4, 4) + g(0, 2)) / 3;
  const fU = Math.max(0, Math.min(1, 0.4 + 0.65 * uRaw));

  // Ring Loop: center dot + mid-border pixels minus corners
  let ringSum = g(2, 2);
  for (let i = 1; i <= 3; i++) {
    ringSum += g(0, i) + g(4, i) + g(i, 0) + g(i, 4);
  }
  const corners = g(0, 0) + g(0, 4) + g(4, 0) + g(4, 4);
  const fRing = Math.max(0, Math.min(1, (ringSum - corners * 1.1) / 8));

  // Quadrant flip: top-right + bottom-left vs opposite corners
  const trBl = g(0, 3) + g(0, 4) + g(1, 3) + g(1, 4) + g(3, 0) + g(3, 1) + g(4, 0) + g(4, 1);
  const tlBr = g(0, 0) + g(0, 1) + g(1, 0) + g(1, 1) + g(3, 3) + g(3, 4) + g(4, 3) + g(4, 4);
  const fQuad = Math.max(0, Math.min(1, 0.5 + (trBl - tlBr) / 10));

  const fDensity = total / 25;

  return [fDiag, fSym, fU, fRing, fQuad, fDensity];
}

function activate(z: number, kind: ActivationKind): number {
  if (kind === 'sigmoid') return 1 / (1 + Math.exp(-Math.max(-18, Math.min(18, z))));
  if (kind === 'tanh') return 0.5 * (Math.tanh(z) + 1); // shifted to [0,1] probability space cleanly
  return Math.min(1.5, z > 0 ? Math.tanh(z * 0.7) : 0.08 * z);
}

function activateDeriv(z: number, out: number, kind: ActivationKind): number {
  if (kind === 'sigmoid') return out * (1 - out);
  if (kind === 'tanh') {
    const t = Math.tanh(z);
    return 0.5 * (1 - t * t);
  }
  return z > 0 ? 0.7 * (1 - Math.tanh(z * 0.7) ** 2) : 0.08;
}

interface NetworkParams {
  weights: number[][][]; // [layerIdx][toNode][fromNode], layerIdx in 0..2
  biases: number[][]; // [layerIdx][toNode]
}

interface ForwardCache {
  zs: number[][]; // pre-activations for layers 1..3 (index 0..2)
  activations: number[][]; // [layer 0..3][node]
}

function createDeterministicWeights(seedOffset = 0): NetworkParams {
  // Deterministic PRNG with zero-mean input-centered initial biases so sigmoid/tanh stay in active gradient region
  let s = 1337 + seedOffset * 97;
  const rand = () => {
    s = (s * 16807) % 2147483647;
    return ((s - 1) / 2147483646) * 2 - 1;
  };

  const weights: number[][][] = [];
  const biases: number[][] = [];
  for (let l = 0; l < LAYER_SIZES.length - 1; l++) {
    const inN = LAYER_SIZES[l];
    const outN = LAYER_SIZES[l + 1];
    const scale = Math.sqrt(6 / (inN + outN)) * 1.45;
    const wMat: number[][] = [];
    const bVec: number[] = [];
    for (let j = 0; j < outN; j++) {
      const row: number[] = [];
      let rowSum = 0;
      for (let i = 0; i < inN; i++) {
        const w = Number((rand() * scale).toFixed(3));
        row.push(w);
        rowSum += w;
      }
      wMat.push(row);
      // Center around expected mean activation (~0.5)
      bVec.push(Number((-0.5 * rowSum + rand() * 0.2).toFixed(3)));
    }
    weights.push(wMat);
    biases.push(bVec);
  }
  return { weights, biases };
}

function runForward(
  inputs: number[],
  params: NetworkParams,
  actKind: ActivationKind
): ForwardCache {
  const activations: number[][] = [inputs.slice()];
  const zs: number[][] = [];

  for (let l = 0; l < params.weights.length; l++) {
    const prev = activations[l];
    const wMat = params.weights[l];
    const bVec = params.biases[l];
    const zLayer: number[] = [];
    const aLayer: number[] = [];
    const isOutput = l === params.weights.length - 1;

    for (let j = 0; j < wMat.length; j++) {
      let sum = bVec[j];
      const wRow = wMat[j];
      for (let i = 0; i < prev.length; i++) {
        sum += wRow[i] * prev[i];
      }
      zLayer.push(sum);
      // Output layer always sigmoid so class confidences read smoothly in [0, 1]
      aLayer.push(isOutput ? activate(sum, 'sigmoid') : activate(sum, actKind));
    }
    zs.push(zLayer);
    activations.push(aLayer);
  }

  return { zs, activations };
}

function trainOneEpoch(
  params: NetworkParams,
  actKind: ActivationKind,
  lr = 0.85
): number {
  let totalLoss = 0;

  for (let pIdx = 0; pIdx < PATTERN_KEYS.length; pIdx++) {
    const key = PATTERN_KEYS[pIdx];
    const target = [0.02, 0.02, 0.02, 0.02];
    target[pIdx] = 0.98;

    const features = extractFeatures(PATTERN_PRESETS[key].grid);
    const cache = runForward(features, params, actKind);

    const outA = cache.activations[3];
    for (let k = 0; k < 4; k++) {
      const err = outA[k] - target[k];
      totalLoss += 0.5 * err * err;
    }

    // Deltas using Cross-Entropy output gradient (a - y) so output units never vanish
    const deltas: number[][] = [[], [], []];
    deltas[2] = outA.map((a, k) => a - target[k]);

    // Backprop through hidden layers 1 and 0
    for (let l = 1; l >= 0; l--) {
      const nextW = params.weights[l + 1];
      const nextD = deltas[l + 1];
      const curA = cache.activations[l + 1];
      const curZ = cache.zs[l];
      const dVec: number[] = [];
      for (let j = 0; j < curA.length; j++) {
        let weightedErr = 0;
        for (let k = 0; k < nextD.length; k++) {
          weightedErr += nextW[k][j] * nextD[k];
        }
        const deriv = activateDeriv(curZ[j], curA[j], actKind);
        dVec.push(Math.max(-3, Math.min(3, weightedErr * deriv)));
      }
      deltas[l] = dVec;
    }

    // Gradient descent update
    for (let l = 0; l < 3; l++) {
      const prevA = cache.activations[l];
      for (let j = 0; j < params.weights[l].length; j++) {
        const d = deltas[l][j];
        params.biases[l][j] = Math.max(-5, Math.min(5, params.biases[l][j] - lr * d));
        for (let i = 0; i < prevA.length; i++) {
          params.weights[l][j][i] = Math.max(
            -5,
            Math.min(5, params.weights[l][j][i] - lr * d * prevA[i])
          );
        }
      }
    }
  }

  return totalLoss / PATTERN_KEYS.length;
}

function createSeededPretrainedNetwork(actKind: ActivationKind): {
  params: NetworkParams;
  loss: number;
  epoch: number;
} {
  const params = createDeterministicWeights(1);
  // Pre-train 30 epochs so Parabola already leads (~0.70+) on mount, and clicking Train pushes to ~0.95+
  let loss = 0.5;
  for (let e = 0; e < 30; e++) {
    loss = trainOneEpoch(params, actKind, 0.85);
  }
  return { params, loss, epoch: 30 };
}

interface NodePos {
  x: number;
  y: number;
  layer: number;
  index: number;
}

export function NeuralMathEngine({
  compact = false,
  heightClass = 'h-[430px] sm:h-[480px]',
}: NeuralMathEngineProps) {
  const reducedMotion = useReducedMotion();
  const [activePreset, setActivePreset] = useState<PatternKey>('parabola');
  const [grid, setGrid] = useState<number[]>(() => [...PATTERN_PRESETS.parabola.grid]);
  const [actKind, setActKind] = useState<ActivationKind>('sigmoid');
  const [playing, setPlaying] = useState(true);
  const [autoCycle, setAutoCycle] = useState(true);
  const [selectedNode, setSelectedNode] = useState<{ layer: number; index: number }>({
    layer: 3,
    index: 0,
  });

  // Mutable network params stored in ref + revision tick for React readouts
  const initNet = useMemo(() => createSeededPretrainedNetwork('sigmoid'), []);
  const netRef = useRef<NetworkParams>(initNet.params);
  const [netRevision, setNetRevision] = useState(0);
  const [epochs, setEpochs] = useState(initNet.epoch);
  const [mseLoss, setMseLoss] = useState(initNet.loss);
  const pulseBoostRef = useRef(0);

  const features = useMemo(() => extractFeatures(grid), [grid]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const forward = useMemo(
    () => runForward(features, netRef.current, actKind),
    [features, actKind, netRevision]
  );

  const forwardRef = useRef(forward);
  forwardRef.current = forward;
  const selectedRef = useRef(selectedNode);
  selectedRef.current = selectedNode;

  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const sizeRef = useRef({ width: 780, height: 440, dpr: 1 });
  const visibleRef = useRef(true);
  const animPhaseRef = useRef(0);
  const nodePositionsRef = useRef<NodePos[]>([]);

  const handleLoadPreset = (key: PatternKey, fromAuto = false) => {
    if (!fromAuto) setAutoCycle(false);
    setActivePreset(key);
    setGrid([...PATTERN_PRESETS[key].grid]);
    setSelectedNode({ layer: 3, index: PATTERN_KEYS.indexOf(key) });
    pulseBoostRef.current = 1.0;
  };

  const handleToggleCell = (idx: number) => {
    setAutoCycle(false);
    setGrid((prev) => {
      const next = [...prev];
      next[idx] = next[idx] > 0.5 ? 0 : 1;
      return next;
    });
    pulseBoostRef.current = 0.85;
  };

  // Autonomous pattern & training sweep so the neural network is visibly learning and pulsing out of the box
  useEffect(() => {
    if (!playing || !autoCycle) return;
    const timer = window.setInterval(() => {
      if (!visibleRef.current || document.hidden) return;
      setActivePreset((prev) => {
        const nextIdx = (PATTERN_KEYS.indexOf(prev) + 1) % PATTERN_KEYS.length;
        const nextKey = PATTERN_KEYS[nextIdx];
        setGrid([...PATTERN_PRESETS[nextKey].grid]);
        setSelectedNode({ layer: 3, index: nextIdx });
        let lastLoss = mseLoss;
        for (let step = 0; step < 2; step++) {
          lastLoss = trainOneEpoch(netRef.current, actKind, 0.75);
        }
        setEpochs((e) => e + 2);
        setMseLoss(lastLoss);
        setNetRevision((r) => r + 1);
        pulseBoostRef.current = 1.0;
        return nextKey;
      });
    }, 2800);
    return () => window.clearInterval(timer);
  }, [playing, autoCycle, actKind, mseLoss]);

  const handleTrain = (count: number) => {
    let lastLoss = mseLoss;
    for (let i = 0; i < count; i++) {
      lastLoss = trainOneEpoch(netRef.current, actKind, 0.9);
    }
    setEpochs((e) => e + count);
    setMseLoss(lastLoss);
    setNetRevision((r) => r + 1);
    pulseBoostRef.current = 1.0;
  };

  const handleResetWeights = () => {
    const fresh = createDeterministicWeights(epochs + 7);
    netRef.current = fresh;
    const initF = runForward(features, fresh, actKind);
    const loss = trainOneEpoch(fresh, actKind, 0.05);
    void initF;
    setEpochs(1);
    setMseLoss(loss);
    setNetRevision((r) => r + 1);
  };

  const drawNetwork = useCallback((advancePulse: boolean) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height, dpr } = sizeRef.current;
    if (width < 60 || height < 60) return;

    if (advancePulse) {
      animPhaseRef.current = (animPhaseRef.current + 0.022) % 3;
      pulseBoostRef.current = Math.max(0, pulseBoostRef.current - 0.012);
    }

    const phase = animPhaseRef.current;
    const cache = forwardRef.current;
    const params = netRef.current;
    const sel = selectedRef.current;

    ctx.save();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = '#05070C';
    ctx.fillRect(0, 0, width, height);

    // Responsive spacing so both desktop (1440px) and mobile (390px) remain crystal clear
    const isNarrow = width < 480;
    const padX = isNarrow ? 26 : compact ? Math.max(40, width * 0.08) : Math.max(88, width * 0.14);
    const rightPad = isNarrow ? 94 : compact ? Math.max(95, width * 0.16) : Math.max(126, width * 0.19);
    const usableW = Math.max(140, width - padX - rightPad);
    const layerXs = [
      padX,
      padX + usableW * 0.34,
      padX + usableW * 0.68,
      padX + usableW,
    ];

    const positionsByLayer: NodePos[][] = [];
    const flatPositions: NodePos[] = [];

    for (let l = 0; l < 4; l++) {
      const count = LAYER_SIZES[l];
      const topMargin = 46;
      const bottomMargin = 58;
      const span = height - topMargin - bottomMargin;
      const layerPts: NodePos[] = [];
      const effectiveSpan = l === 3 ? span * 0.78 : l === 0 ? span * 0.88 : span;
      const yOffset = topMargin + (span - effectiveSpan) * 0.5;
      for (let i = 0; i < count; i++) {
        const y = yOffset + (i / (count - 1)) * effectiveSpan;
        const pos = { x: layerXs[l], y, layer: l, index: i };
        layerPts.push(pos);
        flatPositions.push(pos);
      }
      positionsByLayer.push(layerPts);
    }
    nodePositionsRef.current = flatPositions;

    // Layer column labels at top
    ctx.font = isNarrow ? '8.5px "JetBrains Mono", monospace' : '10px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    const colTitles = isNarrow
      ? ['IN (6)', 'H1 (8)', 'H2 (8)', 'OUT (4)']
      : ['INPUT (6)', 'HIDDEN 1 (8)', 'HIDDEN 2 (8)', 'OUTPUT (4)'];
    for (let l = 0; l < 4; l++) {
      ctx.fillStyle = sel.layer === l ? '#F2F0E8' : 'rgba(167, 179, 199, 0.7)';
      ctx.fillText(colTitles[l], layerXs[l], 22);
      ctx.strokeStyle = 'rgba(237, 235, 228, 0.045)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(layerXs[l], 30);
      ctx.lineTo(layerXs[l], height - 18);
      ctx.stroke();
    }

    // 1. Synaptic Edges + Forward Signal Photons (additive bloom)
    ctx.globalCompositeOperation = 'lighter';

    for (let l = 0; l < 3; l++) {
      const srcNodes = positionsByLayer[l];
      const dstNodes = positionsByLayer[l + 1];
      const wMat = params.weights[l];
      const srcActs = cache.activations[l];

      for (let j = 0; j < dstNodes.length; j++) {
        const dst = dstNodes[j];
        const isDstSelected = sel.layer === l + 1 && sel.index === j;

        for (let i = 0; i < srcNodes.length; i++) {
          const src = srcNodes[i];
          const w = wMat[j][i];
          const absW = Math.abs(w);
          const signal = Math.min(1.4, absW * Math.abs(srcActs[i]));
          const isSrcSelected = sel.layer === l && sel.index === i;
          const highlighted = isDstSelected || isSrcSelected;

          const baseAlpha = highlighted
            ? Math.min(0.88, 0.25 + signal * 0.55)
            : Math.min(0.42, 0.05 + signal * 0.24);

          if (baseAlpha < 0.045 && !highlighted) continue;

          ctx.strokeStyle =
            w >= 0
              ? `rgba(56, 212, 255, ${baseAlpha.toFixed(2)})`
              : `rgba(255, 120, 90, ${baseAlpha.toFixed(2)})`;
          ctx.lineWidth = highlighted ? 1.2 + Math.min(2.2, absW * 1.1) : 0.65 + Math.min(1.5, absW * 0.55);

          ctx.beginPath();
          ctx.moveTo(src.x, src.y);
          ctx.lineTo(dst.x, dst.y);
          ctx.stroke();

          // Traveling photon pulse along active synapses in layer wave [0..3]
          const localT = phase - l;
          if (localT >= 0 && localT <= 1 && (signal > 0.28 || highlighted)) {
            const px = src.x + (dst.x - src.x) * localT;
            const py = src.y + (dst.y - src.y) * localT;
            const pulseAlpha = Math.sin(localT * Math.PI) * (highlighted ? 0.95 : 0.6 + pulseBoostRef.current * 0.35);
            const radius = highlighted ? 4.2 : 2.6;
            const rgb = w >= 0 ? '56, 212, 255' : '255, 120, 90';
            ctx.fillStyle = `rgba(${rgb}, ${Math.min(1, pulseAlpha).toFixed(2)})`;
            ctx.beginPath();
            ctx.arc(px, py, radius, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
    }

    // 2. Neuron Nodes + Outer Halos + Live Readout Bars
    ctx.globalCompositeOperation = 'source-over';
    const nodeR = isNarrow ? 9 : compact ? 11 : 13;

    for (let l = 0; l < 4; l++) {
      const nodes = positionsByLayer[l];
      const acts = cache.activations[l];

      for (let i = 0; i < nodes.length; i++) {
        const pt = nodes[i];
        const a = Math.max(0, Math.min(1, acts[i]));
        const isSelected = sel.layer === l && sel.index === i;

        // Output class accent or cyan-to-gold interpolation
        const accentHex =
          l === 3 ? PATTERN_PRESETS[PATTERN_KEYS[i]].color : l === 0 ? '#F4B956' : '#34E8A5';

        if (a > 0.25 || isSelected) {
          const halo = ctx.createRadialGradient(pt.x, pt.y, 2, pt.x, pt.y, nodeR * 2.1);
          halo.addColorStop(0, `${accentHex}${isSelected ? '66' : '38'}`);
          halo.addColorStop(1, 'transparent');
          ctx.fillStyle = halo;
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, nodeR * 2.1, 0, Math.PI * 2);
          ctx.fill();
        }

        // Solid obsidian core + scaled luminosity interior
        ctx.fillStyle = '#080C15';
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, nodeR, 0, Math.PI * 2);
        ctx.fill();

        if (a > 0.02) {
          ctx.fillStyle = accentHex;
          ctx.globalAlpha = 0.16 + a * 0.78;
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, nodeR - 2, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 1;
        }

        // Sharp ring stroke
        ctx.strokeStyle = isSelected ? '#FFFFFF' : `${accentHex}${a > 0.4 ? 'EE' : '88'}`;
        ctx.lineWidth = isSelected ? 2.2 : 1.3;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, nodeR, 0, Math.PI * 2);
        ctx.stroke();

        // Numeric activation value inside or beside nodes
        if (!compact && !isNarrow && (l === 0 || l === 1 || l === 2)) {
          ctx.fillStyle = a > 0.58 ? '#05070C' : '#F2F0E8';
          ctx.font = '9px "JetBrains Mono", monospace';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(a.toFixed(1), pt.x, pt.y);
        }

        if (l === 0 && !compact && !isNarrow) {
          ctx.fillStyle = '#707D94';
          ctx.font = '9px "JetBrains Mono", monospace';
          ctx.textAlign = 'right';
          ctx.textBaseline = 'middle';
          ctx.fillText(INPUT_FEATURE_NAMES[i], pt.x - nodeR - 8, pt.y);
        }

        // Output right-hand probability bars + numbers (inspired by user diagram)
        if (l === 3) {
          const pKey = PATTERN_KEYS[i];
          const meta = PATTERN_PRESETS[pKey];
          const valX = pt.x + nodeR + 8;
          ctx.textAlign = 'left';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = a > 0.5 ? '#F2F0E8' : '#A7B3C7';
          ctx.font = isNarrow ? '600 10px "JetBrains Mono", monospace' : '600 11px "JetBrains Mono", monospace';
          ctx.fillText(a.toFixed(2), valX, pt.y - 5);

          ctx.fillStyle = meta.color;
          ctx.font = isNarrow ? '9.5px "IBM Plex Sans", sans-serif' : '10px "IBM Plex Sans", sans-serif';
          ctx.fillText(isNarrow ? meta.label.split(' ')[0] : meta.label, valX + 32, pt.y - 5);

          // Micro probability bar below label
          const barW = isNarrow ? 56 : compact ? 52 : 76;
          ctx.fillStyle = 'rgba(237, 235, 228, 0.1)';
          ctx.fillRect(valX, pt.y + 4, barW, 3.5);
          ctx.fillStyle = meta.color;
          ctx.fillRect(valX, pt.y + 4, barW * a, 3.5);
        }
      }
    }

    ctx.restore();
  }, [compact]);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const updateSize = () => {
      const rect = container.getBoundingClientRect();
      const width = Math.max(260, Math.floor(rect.width));
      const height = Math.max(220, Math.floor(rect.height));
      const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      sizeRef.current = { width, height, dpr };
      drawNetwork(false);
    };

    updateSize();
    const ro = new ResizeObserver(updateSize);
    ro.observe(container);

    const io = new IntersectionObserver(
      (entries) => {
        visibleRef.current = entries.some((e) => e.isIntersecting);
      },
      { threshold: 0.05 }
    );
    io.observe(container);

    return () => {
      ro.disconnect();
      io.disconnect();
    };
  }, [drawNetwork]);

  useEffect(() => {
    drawNetwork(false);
  }, [forward, selectedNode, drawNetwork]);

  useEffect(() => {
    let rafId = 0;
    const tick = () => {
      if (visibleRef.current && !document.hidden && playing && !reducedMotion) {
        drawNetwork(true);
      }
      rafId = window.requestAnimationFrame(tick);
    };
    rafId = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(rafId);
  }, [playing, reducedMotion, drawNetwork]);

  const handleCanvasClick = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    let closest: NodePos | null = null;
    let bestDist = 22;
    for (const pt of nodePositionsRef.current) {
      const d = Math.hypot(pt.x - mx, pt.y - my);
      if (d < bestDist) {
        bestDist = d;
        closest = pt;
      }
    }
    if (closest) {
      setSelectedNode({ layer: closest.layer, index: closest.index });
    }
  };

  // Details for the inspected neuron + color-coded matrix math formula
  const selActivation = forward.activations[selectedNode.layer]?.[selectedNode.index] ?? 0;
  const selBias =
    selectedNode.layer > 0 ? netRef.current.biases[selectedNode.layer - 1][selectedNode.index] : 0;
  const selZ =
    selectedNode.layer > 0 ? forward.zs[selectedNode.layer - 1][selectedNode.index] : selActivation;
  const selIncomingW =
    selectedNode.layer > 0
      ? netRef.current.weights[selectedNode.layer - 1][selectedNode.index]
      : [];

  const predictedIdx = forward.activations[3].reduce(
    (best, val, idx, arr) => (val > arr[best] ? idx : best),
    0
  );
  const predictedMeta = PATTERN_PRESETS[PATTERN_KEYS[predictedIdx]];

  return (
    <div className="instrument-frame fiducial-frame overflow-hidden">
      {/* Top Bar */}
      <div className="px-4 py-2.5 border-b hairline-rule bg-[#080C15]/90 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: '#38D4FF', boxShadow: '0 0 10px #38D4FF' }}
          />
          <span className="font-mono-data text-[10px] uppercase tracking-[0.18em] text-[#A7B3C7]">
            Neural Matrix Lab · [6 → 8 → 8 → 4]
          </span>
          <span className="font-mono-data text-[10px] px-2 py-0.5 rounded bg-[#121927] border border-[rgba(237,235,228,0.12)] text-[#F2F0E8]">
            Epoch {epochs} · MSE {mseLoss.toFixed(4)}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setAutoCycle((a) => !a)}
            className={`px-2.5 py-1 rounded text-[11px] font-mono-data border transition-colors ${
              autoCycle
                ? 'border-[#34E8A5]/60 text-[#34E8A5] bg-[#34E8A5]/15'
                : 'border-[rgba(237,235,228,0.16)] text-[#A7B3C7]'
            }`}
          >
            {autoCycle ? 'Auto-Sweep: ON' : 'Auto-Sweep: OFF'}
          </button>
          <button
            type="button"
            onClick={() => handleTrain(1)}
            className="px-2.5 py-1 rounded text-[11px] font-mono-data border border-[#38D4FF]/45 text-[#38D4FF] bg-[#38D4FF]/10 hover:bg-[#38D4FF]/20"
          >
            +1 Epoch
          </button>
          <button
            type="button"
            onClick={() => handleTrain(25)}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-mono-data font-semibold bg-[#F4B956] text-[#05070C] hover:brightness-110"
          >
            <Zap className="w-3 h-3" />
            Train 25 Epochs
          </button>
          <button
            type="button"
            onClick={() => setPlaying((p) => !p)}
            aria-label={playing ? 'Pause signal flow' : 'Play signal flow'}
            className="p-1.5 rounded border border-[rgba(237,235,228,0.16)] text-[#F2F0E8]"
          >
            {playing ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>
          <button
            type="button"
            onClick={handleResetWeights}
            aria-label="Randomize synaptic weights"
            className="p-1.5 rounded border border-[rgba(237,235,228,0.16)] text-[#A7B3C7] hover:text-[#F2F0E8]"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Split: Network Canvas + Interactive 5x5 Stimulus Pad & Math Readout */}
      <div className="grid grid-cols-1 lg:grid-cols-12">
        <div
          ref={containerRef}
          className={`lg:col-span-8 relative ${heightClass} bg-[#05070C] border-b lg:border-b-0 lg:border-r hairline-rule`}
        >
          <canvas
            ref={canvasRef}
            onPointerDown={handleCanvasClick}
            className="block w-full h-full cursor-pointer touch-none"
          />

          <div className="pointer-events-none absolute bottom-3 left-3 obsidian-glass rounded px-3 py-1.5 text-[11px] flex items-center gap-3">
            <span className="font-mono-data text-[#A7B3C7]">
              Prediction:{' '}
              <strong style={{ color: predictedMeta.color }}>{predictedMeta.label}</strong> (
              {(forward.activations[3][predictedIdx] * 100).toFixed(0)}%)
            </span>
            <span className="hidden sm:inline text-[#707D94]">· Click any neuron to inspect weights</span>
          </div>
        </div>

        {/* Right Side Panel: 5x5 Stimulus Pad + Activation Curves + Live Matrix Math */}
        <div className="lg:col-span-4 p-4 bg-[#080C15]/85 flex flex-col justify-between gap-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono-data text-[10px] uppercase tracking-[0.16em] text-[#A7B3C7]">
                5×5 Stimulus Matrix
              </span>
              <span className="font-mono-data text-[10px] text-[#38D4FF]">
                Click pixels to perturb
              </span>
            </div>

            <div className="flex items-start gap-4">
              {/* 5x5 Interactive Grid */}
              <div
                className="grid grid-cols-5 gap-1 p-1.5 rounded bg-[#05070C] border border-[rgba(237,235,228,0.12)] shrink-0"
                role="grid"
                aria-label="5 by 5 stimulus pattern matrix"
              >
                {grid.map((cell, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleToggleCell(idx)}
                    aria-label={`Matrix cell ${Math.floor(idx / 5) + 1},${(idx % 5) + 1}`}
                    className="w-6 h-6 rounded-[3px] border transition-all"
                    style={{
                      backgroundColor: cell > 0.5 ? '#38D4FF' : '#121927',
                      borderColor:
                        cell > 0.5 ? 'rgba(56, 212, 255, 0.9)' : 'rgba(237, 235, 228, 0.1)',
                      boxShadow: cell > 0.5 ? '0 0 10px rgba(56, 212, 255, 0.45)' : 'none',
                    }}
                  />
                ))}
              </div>

              {/* Preset Buttons */}
              <div className="flex-1 grid grid-cols-1 gap-1.5">
                {PATTERN_KEYS.map((key) => {
                  const p = PATTERN_PRESETS[key];
                  const active = activePreset === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => handleLoadPreset(key)}
                      className={`px-2.5 py-1.5 rounded text-left text-[11px] font-medium border transition-colors flex items-center justify-between ${
                        active
                          ? 'bg-[#172032] text-[#F2F0E8] border-[rgba(237,235,228,0.28)]'
                          : 'bg-[#0C111C] text-[#A7B3C7] border-[rgba(237,235,228,0.1)] hover:text-[#F2F0E8]'
                      }`}
                    >
                      <span>{p.label}</span>
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: p.color }}
                      />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Activation Nonlinearity Switcher + Mini SVG Curve */}
          <div className="instrument-panel p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono-data text-[10px] uppercase tracking-[0.15em] text-[#A7B3C7]">
                Activation <span className="normal-case">σ(z)</span>
              </span>
              <div className="flex gap-1">
                {(['sigmoid', 'tanh', 'relu'] as ActivationKind[]).map((k) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => {
                      setActKind(k);
                      pulseBoostRef.current = 0.7;
                    }}
                    className={`px-2 py-0.5 rounded text-[10px] font-mono-data uppercase border ${
                      actKind === k
                        ? 'bg-[#34E8A5]/15 text-[#34E8A5] border-[#34E8A5]/50'
                        : 'text-[#A7B3C7] border-[rgba(237,235,228,0.12)]'
                    }`}
                  >
                    {k}
                  </button>
                ))}
              </div>
            </div>

            {!compact && (
              <svg viewBox="0 0 180 46" className="w-full h-11 bg-[#05070C] rounded border border-[rgba(237,235,228,0.08)]">
                <line x1="90" y1="2" x2="90" y2="44" stroke="rgba(237,235,228,0.12)" strokeWidth="1" />
                <line x1="6" y1="23" x2="174" y2="23" stroke="rgba(237,235,228,0.12)" strokeWidth="1" />
                <path
                  d={(() => {
                    const pts: string[] = [];
                    for (let i = 0; i <= 40; i++) {
                      const z = -4 + (i / 40) * 8;
                      const val = activate(z, actKind);
                      const px = 10 + (i / 40) * 160;
                      const py = 39 - Math.max(-0.2, Math.min(1.2, val)) * 28;
                      pts.push(`${i === 0 ? 'M' : 'L'}${px.toFixed(1)},${py.toFixed(1)}`);
                    }
                    return pts.join(' ');
                  })()}
                  fill="none"
                  stroke="#34E8A5"
                  strokeWidth="2"
                />
              </svg>
            )}
          </div>

          {/* Inspected Neuron Linear Algebra Breakdown */}
          <div className="instrument-panel p-3 space-y-2">
            <div className="flex items-center justify-between font-mono-data text-[10px]">
              <span className="uppercase tracking-[0.15em] text-[#A7B3C7]">
                Neuron L{selectedNode.layer} · #{selectedNode.index + 1}
              </span>
              <span className="text-[#F4B956]">a = {selActivation.toFixed(3)}</span>
            </div>

            <div className="overflow-x-auto">
              <MathTex
                tex={
                  selectedNode.layer === 0
                    ? `a^{(0)}_${selectedNode.index + 1} = x_{\\text{${INPUT_FEATURE_NAMES[selectedNode.index].split(' ')[0]}}} = ${selActivation.toFixed(2)}`
                    : `a^{(${selectedNode.layer})}_${selectedNode.index + 1} = \\sigma\\!\\left(${selZ.toFixed(2)}\\right) = ${selActivation.toFixed(3)}`
                }
                className="text-xs text-[#F2F0E8]"
              />
            </div>

            {selectedNode.layer > 0 ? (
              <div className="font-mono-data text-[10px] text-[#707D94] leading-relaxed">
                b = {selBias.toFixed(2)} · Top incoming weights:{' '}
                <span className="text-[#A7B3C7]">
                  [
                  {selIncomingW
                    .slice(0, 4)
                    .map((w) => (w >= 0 ? `+${w.toFixed(2)}` : w.toFixed(2)))
                    .join(', ')}
                  ]
                </span>
              </div>
            ) : (
              <div className="font-mono-data text-[10px] text-[#707D94]">
                Geometric feature detector: {INPUT_FEATURE_NAMES[selectedNode.index]}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Linear Algebra Matrix Formulation Strip */}
      <div className="px-4 py-2.5 border-t hairline-rule bg-[#080C15]/95 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-[#A7B3C7]">
          <span className="font-mono-data text-[10px] uppercase tracking-[0.15em] text-[#38D4FF]">
            Matrix Form
          </span>
          <MathTex
            tex="\mathbf{a}^{(l)} = \sigma\!\left(\mathbf{W}^{(l)}\mathbf{a}^{(l-1)} + \mathbf{b}^{(l)}\right)"
            className="text-sm text-[#F2F0E8]"
          />
        </div>
        <span className="font-mono-data text-[10px] text-[#707D94]">
          6×8 → 8×8 → 8×4 transformations · Real gradient descent backprop
        </span>
      </div>
    </div>
  );
}
