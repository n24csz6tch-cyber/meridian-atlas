import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Compass, Pause, Play, RotateCcw } from 'lucide-react';
import { MathTex } from '../../components/MathTex';
import { WebGLErrorBoundary } from '../../components/WebGLErrorBoundary';
import { useReducedMotion } from '../../hooks/useReducedMotion';

export type VectorFieldPresetId = 'vortex' | 'dipole' | 'saddle' | 'sink';

interface VectorFieldPreset {
  id: VectorFieldPresetId;
  label: string;
  shortLabel: string;
  formulaTex: string;
  intuition: string;
  accent: string;
  secondaryHex: string;
  probePoint: [number, number, number];
}

const FIELD_PRESETS: Record<VectorFieldPresetId, VectorFieldPreset> = {
  vortex: {
    id: 'vortex',
    label: 'Swirl Vortex',
    shortLabel: 'Swirl Vortex',
    formulaTex: '\\mathbf{F}(x,y,z) = \\langle -z\\omega - \\alpha x,\\; k\\cos(1.35r) - 0.24y,\\; x\\omega - \\alpha z \\rangle',
    intuition:
      'Every point in 3D space holds an invisible arrow. Here, the arrows loop around a glowing ring while twisting up and down like a cosmic whirlpool.',
    accent: '#F4C46C',
    secondaryHex: '#46D6E8',
    probePoint: [1.2, 0.4, 0.0],
  },
  dipole: {
    id: 'dipole',
    label: 'Magnetic Dipole',
    shortLabel: 'Magnetic Dipole',
    formulaTex: '\\mathbf{B}(\\mathbf{r}) = \\frac{3(\\mathbf{m}\\cdot\\hat{\\mathbf{r}})\\hat{\\mathbf{r}} - \\mathbf{m}}{r^3} + k(\\mathbf{m}\\times\\mathbf{r})',
    intuition:
      'Arrows surge out of the north pole, arc smoothly across space, and dive into the south pole—just like Earth’s magnetic field guiding solar particles.',
    accent: '#46D6E8',
    secondaryHex: '#FFE29E',
    probePoint: [1.1, 0.5, 0.0],
  },
  saddle: {
    id: 'saddle',
    label: 'Saddle Curl',
    shortLabel: 'Saddle Curl',
    formulaTex: '\\mathbf{F}(x,y,z) = \\langle 0.85x - kz,\\; -1.15y,\\; -0.85z + kx \\rangle',
    intuition:
      'Arrows pull particles inward from front and back, then fling them outward left and right. Raising Curl twists that highway into a spinning spiral.',
    accent: '#45E6A6',
    secondaryHex: '#F4C46C',
    probePoint: [0.8, 0.3, 0.9],
  },
  sink: {
    id: 'sink',
    label: 'Gravity Sink',
    shortLabel: 'Gravity Sink',
    formulaTex: '\\mathbf{F}(\\mathbf{r}) = -\\frac{\\mu\\,\\mathbf{r}}{(r^2+\\epsilon)^{1.15}} + k\\langle -z,\\; 0.28\\sin(x-z),\\; x \\rangle',
    intuition:
      'At zero Curl, every arrow points straight into the gravity core. Add Curl / Twist and particles curve sideways into glowing spirals before falling inward.',
    accent: '#FF8563',
    secondaryHex: '#FFE29E',
    probePoint: [1.3, 0.4, 0.2],
  },
};

const PRESET_ORDER: VectorFieldPresetId[] = ['vortex', 'dipole', 'saddle', 'sink'];

const MAX_PARTICLES = 2400;
const TRAIL_STEPS = 4; // 4 trail points => 3 glowing segments (6 vertices) per particle
const TRAIL_VERTS_PER_PARTICLE = (TRAIL_STEPS - 1) * 2;
const BOUND_RADIUS = 2.65;

const POINT_VERTEX_SHADER = /* glsl */ `
  attribute vec3 aColor;
  attribute float aEnergy;
  uniform float uPixelRatio;
  uniform float uPointScale;
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    vColor = aColor;
    vAlpha = clamp(0.45 + aEnergy * 0.55, 0.0, 1.0);
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    float rawSize = (2.8 + aEnergy * 3.1) * uPointScale * uPixelRatio * (7.2 / max(1.2, -mvPosition.z));
    gl_PointSize = clamp(rawSize, 1.8, 16.0);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const POINT_FRAGMENT_SHADER = /* glsl */ `
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    vec2 uv = gl_PointCoord - vec2(0.5);
    float d = length(uv) * 2.0;
    if (d > 1.0) discard;

    float halo = pow(1.0 - d, 2.2);
    float core = exp(-d * d * 7.0);
    float intensity = halo * 0.58 + core * 0.85;
    vec3 col = mix(vColor, vec3(1.0, 0.96, 0.88), core * 0.42);
    gl_FragColor = vec4(col, clamp(vAlpha * intensity, 0.0, 1.0));
  }
`;

function createPrng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s += 0x6d2b79f5;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function evalVectorField(
  preset: VectorFieldPresetId,
  x: number,
  y: number,
  z: number,
  curl: number,
  out: [number, number, number]
): void {
  if (preset === 'vortex') {
    const rXZ = Math.hypot(x, z);
    const omega = (1.32 + 0.95 * curl) / (0.42 + rXZ * rXZ);
    const radialPull = -0.45 * (rXZ - 1.32);
    const invR = rXZ > 0.0005 ? 1 / rXZ : 0;
    out[0] = -z * omega + x * invR * radialPull;
    out[1] = curl * 0.85 * Math.cos(1.35 * rXZ) - 0.24 * y;
    out[2] = x * omega + z * invR * radialPull;
    return;
  }

  if (preset === 'dipole') {
    const r2 = x * x + y * y + z * z;
    const softR2 = r2 + 0.28;
    const rs = Math.sqrt(softR2);
    const invR5 = 2.65 / (softR2 * softR2 * rs);
    let vx = 3 * x * y * invR5 - curl * 0.72 * z;
    let vy = (3 * y * y - softR2) * invR5;
    let vz = 3 * z * y * invR5 + curl * 0.72 * x;
    const mag = Math.hypot(vx, vy, vz);
    if (mag > 3.8) {
      const s = 3.8 / mag;
      vx *= s;
      vy *= s;
      vz *= s;
    }
    out[0] = vx;
    out[1] = vy;
    out[2] = vz;
    return;
  }

  if (preset === 'saddle') {
    out[0] = 0.85 * x - curl * 0.92 * z;
    out[1] = -1.15 * y + 0.36 * curl * Math.sin(x * 1.35) * Math.cos(z * 1.35);
    out[2] = -0.85 * z + curl * 0.92 * x;
    return;
  }

  // Gravity Sink
  const r2 = x * x + y * y + z * z;
  const pull = -2.15 / Math.pow(r2 + 0.24, 1.15);
  let vx = x * pull - curl * 1.05 * z;
  let vy = y * pull + curl * 0.28 * Math.sin(x - z);
  let vz = z * pull + curl * 1.05 * x;
  const mag = Math.hypot(vx, vy, vz);
  if (mag > 4.2) {
    const s = 4.2 / mag;
    vx *= s;
    vy *= s;
    vz *= s;
  }
  out[0] = vx;
  out[1] = vy;
  out[2] = vz;
}

function spawnParticlePosition(
  preset: VectorFieldPresetId,
  rand: () => number,
  out: [number, number, number]
): void {
  if (preset === 'vortex') {
    const ang = rand() * Math.PI * 2;
    const rad = 0.35 + rand() * 1.95;
    out[0] = Math.cos(ang) * rad;
    out[1] = (rand() - 0.5) * 2.1;
    out[2] = Math.sin(ang) * rad;
    return;
  }

  if (preset === 'dipole') {
    // Seed primarily around the polar launch cones & equatorial lobes
    const ang = rand() * Math.PI * 2;
    if (rand() < 0.58) {
      const sign = rand() < 0.5 ? 1 : -1;
      const rad = 0.22 + rand() * 0.65;
      out[0] = Math.cos(ang) * rad;
      out[1] = sign * (0.45 + rand() * 0.55);
      out[2] = Math.sin(ang) * rad;
    } else {
      const rad = 0.8 + rand() * 1.35;
      out[0] = Math.cos(ang) * rad;
      out[1] = (rand() - 0.5) * 1.65;
      out[2] = Math.sin(ang) * rad;
    }
    return;
  }

  if (preset === 'saddle') {
    // Feed along the inflow Z axis and midplane
    const signZ = rand() < 0.5 ? 1 : -1;
    out[0] = (rand() - 0.5) * 2.1;
    out[1] = (rand() - 0.5) * 2.0;
    out[2] = signZ * (0.65 + rand() * 1.65);
    return;
  }

  // Gravity Sink: outer shell spawn
  const u = rand() * 2 - 1;
  const phi = rand() * Math.PI * 2;
  const r = 1.65 + rand() * 0.85;
  const s = Math.sqrt(Math.max(0, 1 - u * u));
  out[0] = r * s * Math.cos(phi);
  out[1] = r * u * 0.82;
  out[2] = r * s * Math.sin(phi);
}

export function VectorFlowField3D(props?: {
  compact?: boolean;
  heightClass?: string;
}): JSX.Element {
  const { compact = false, heightClass } = props ?? {};
  const reducedMotion = useReducedMotion();

  const [presetId, setPresetId] = useState<VectorFieldPresetId>('vortex');
  const [speed, setSpeed] = useState(1.0);
  const [curl, setCurl] = useState(0.95);
  const [density, setDensity] = useState(1800);
  const [playing, setPlaying] = useState(true);
  const [showArrows, setShowArrows] = useState(true);
  const [autoOrbit, setAutoOrbit] = useState(true);
  const [nearViewport, setNearViewport] = useState(false);
  const [webglError, setWebglError] = useState<string | null>(null);

  const hostRef = useRef<HTMLDivElement | null>(null);
  const mountRef = useRef<HTMLDivElement | null>(null);

  const paramsRef = useRef({
    presetId,
    speed,
    curl,
    density,
    playing,
    showArrows,
    autoOrbit,
  });
  paramsRef.current = {
    presetId,
    speed,
    curl,
    density,
    playing,
    showArrows,
    autoOrbit,
  };

  const onPresetChangeRef = useRef<((nextPreset: VectorFieldPresetId) => void) | null>(null);
  const onFieldShapeChangeRef = useRef<(() => void) | null>(null);
  const onResetSimRef = useRef<(() => void) | null>(null);
  const onDensityChangeRef = useRef<((count: number) => void) | null>(null);
  const onArrowsVisibilityRef = useRef<((visible: boolean) => void) | null>(null);

  const preset = FIELD_PRESETS[presetId];

  const probeVector = useMemo(() => {
    const out: [number, number, number] = [0, 0, 0];
    const [px, py, pz] = preset.probePoint;
    evalVectorField(presetId, px, py, pz, curl, out);
    const mag = Math.hypot(out[0], out[1], out[2]);
    return { x: out[0], y: out[1], z: out[2], mag };
  }, [presetId, preset, curl]);

  // IntersectionObserver with rootMargin '200px' gating WebGL mount & teardown
  useEffect(() => {
    const el = hostRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setNearViewport(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        setNearViewport(entries.some((entry) => entry.isIntersecting));
      },
      { rootMargin: '200px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Main Three.js WebGL lifecycle
  useEffect(() => {
    if (!nearViewport) return;
    const container = mountRef.current;
    if (!container) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        powerPreference: 'high-performance',
      });
    } catch (err) {
      setWebglError(
        err instanceof Error ? err.message : 'WebGL context could not be initialized.'
      );
      return;
    }

    setWebglError(null);
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    renderer.setPixelRatio(dpr);
    renderer.setClearColor(0x050508, 1);

    const rect = container.getBoundingClientRect();
    const initW = Math.max(240, Math.floor(rect.width));
    const initH = Math.max(220, Math.floor(rect.height));
    renderer.setSize(initW, initH);
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050508);

    const camera = new THREE.PerspectiveCamera(42, initW / initH, 0.1, 80);
    camera.position.set(4.1, 2.55, 4.4);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.rotateSpeed = 0.82;
    controls.enablePan = false;
    controls.minDistance = 2.6;
    controls.maxDistance = 12.5;
    controls.target.set(0, 0, 0);

    // Subtle AUREA observatory rings & 3D coordinate guides
    const decoGroup = new THREE.Group();
    scene.add(decoGroup);

    const ringSpecs = [
      { radius: 1.5, color: 0xf4c46c, opacity: 0.24 },
      { radius: 2.35, color: 0x46d6e8, opacity: 0.16 },
    ];
    const ringGeos: THREE.BufferGeometry[] = [];
    const ringMats: THREE.Material[] = [];
    ringSpecs.forEach((spec) => {
      const rg = new THREE.RingGeometry(spec.radius - 0.008, spec.radius + 0.008, 96);
      rg.rotateX(-Math.PI / 2);
      const rm = new THREE.MeshBasicMaterial({
        color: spec.color,
        transparent: true,
        opacity: spec.opacity,
        side: THREE.DoubleSide,
      });
      ringGeos.push(rg);
      ringMats.push(rm);
      const mesh = new THREE.Mesh(rg, rm);
      mesh.position.y = -1.75;
      decoGroup.add(mesh);
    });

    // Hairline 3D axis crosshairs
    const axisPositions = new Float32Array([
      -2.3, 0, 0, 2.3, 0, 0,
      0, -1.75, 0, 0, 1.95, 0,
      0, 0, -2.3, 0, 0, 2.3,
    ]);
    const axisGeo = new THREE.BufferGeometry();
    axisGeo.setAttribute('position', new THREE.BufferAttribute(axisPositions, 3));
    const axisMat = new THREE.LineBasicMaterial({
      color: 0xf4c46c,
      transparent: true,
      opacity: 0.14,
    });
    const axisLines = new THREE.LineSegments(axisGeo, axisMat);
    decoGroup.add(axisLines);

    // Central luminous core beacon (highlights Gravity Sink / Dipole focus)
    const coreGeo = new THREE.SphereGeometry(0.085, 20, 20);
    const coreMat = new THREE.MeshBasicMaterial({
      color: 0xffe29e,
      transparent: true,
      opacity: 0.85,
    });
    const coreSphere = new THREE.Mesh(coreGeo, coreMat);
    decoGroup.add(coreSphere);

    const haloGeo = new THREE.SphereGeometry(0.22, 20, 20);
    const haloMat = new THREE.MeshBasicMaterial({
      color: 0xf4c46c,
      transparent: true,
      opacity: 0.18,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const coreHalo = new THREE.Mesh(haloGeo, haloMat);
    decoGroup.add(coreHalo);

    // 3D Velocity Vector Arrows Lattice (LineSegments)
    const arrowAnchors: [number, number, number][] = [];
    const xs = [-1.55, -0.52, 0.52, 1.55];
    const ys = [-0.95, 0.0, 0.95];
    const zs = [-1.55, -0.52, 0.52, 1.55];
    for (const ax of xs) {
      for (const ay of ys) {
        for (const az of zs) {
          if (ax * ax + ay * ay + az * az < 0.25) continue;
          arrowAnchors.push([ax, ay, az]);
        }
      }
    }

    const arrowVertCount = arrowAnchors.length * 6; // shaft + 2 head barbs = 3 segments = 6 verts
    const arrowPosArr = new Float32Array(arrowVertCount * 3);
    const arrowColArr = new Float32Array(arrowVertCount * 3);
    const arrowGeo = new THREE.BufferGeometry();
    const arrowPosAttr = new THREE.BufferAttribute(arrowPosArr, 3);
    const arrowColAttr = new THREE.BufferAttribute(arrowColArr, 3);
    arrowGeo.setAttribute('position', arrowPosAttr);
    arrowGeo.setAttribute('color', arrowColAttr);

    const arrowMat = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.42,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const arrowLines = new THREE.LineSegments(arrowGeo, arrowMat);
    arrowLines.visible = paramsRef.current.showArrows;
    scene.add(arrowLines);

    const updateVelocityArrows = () => {
      const { presetId: curPreset, curl: curCurl } = paramsRef.current;
      const vOut: [number, number, number] = [0, 0, 0];
      const baseCol = new THREE.Color(FIELD_PRESETS[curPreset].accent);
      const tipCol = new THREE.Color('#FFE29E');

      for (let i = 0; i < arrowAnchors.length; i++) {
        const [px, py, pz] = arrowAnchors[i];
        evalVectorField(curPreset, px, py, pz, curCurl, vOut);
        const mag = Math.hypot(vOut[0], vOut[1], vOut[2]);
        const invM = mag > 0.0001 ? 1 / mag : 0;
        const dx = vOut[0] * invM;
        const dy = vOut[1] * invM;
        const dz = vOut[2] * invM;

        const len = mag > 0.0001 ? 0.16 + 0.19 * Math.tanh(mag * 0.55) : 0.05;
        const tx = px + dx * len;
        const ty = py + dy * len;
        const tz = pz + dz * len;

        // Build perpendicular vectors for crisp 3D arrowhead chevron
        const refX = Math.abs(dy) < 0.85 ? 0 : 1;
        const refY = Math.abs(dy) < 0.85 ? 1 : 0;
        const refZ = 0;
        let rx = dy * refZ - dz * refY;
        let ry = dz * refX - dx * refZ;
        let rz = dx * refY - dy * refX;
        const rMag = Math.hypot(rx, ry, rz) || 1;
        rx /= rMag;
        ry /= rMag;
        rz /= rMag;

        const back = len * 0.28;
        const wing = len * 0.14;
        const b1x = tx - dx * back + rx * wing;
        const b1y = ty - dy * back + ry * wing;
        const b1z = tz - dz * back + rz * wing;
        const b2x = tx - dx * back - rx * wing;
        const b2y = ty - dy * back - ry * wing;
        const b2z = tz - dz * back - rz * wing;

        const o = i * 18; // 6 verts * 3
        // Shaft
        arrowPosArr[o] = px;
        arrowPosArr[o + 1] = py;
        arrowPosArr[o + 2] = pz;
        arrowPosArr[o + 3] = tx;
        arrowPosArr[o + 4] = ty;
        arrowPosArr[o + 5] = tz;
        // Barb 1
        arrowPosArr[o + 6] = tx;
        arrowPosArr[o + 7] = ty;
        arrowPosArr[o + 8] = tz;
        arrowPosArr[o + 9] = b1x;
        arrowPosArr[o + 10] = b1y;
        arrowPosArr[o + 11] = b1z;
        // Barb 2
        arrowPosArr[o + 12] = tx;
        arrowPosArr[o + 13] = ty;
        arrowPosArr[o + 14] = tz;
        arrowPosArr[o + 15] = b2x;
        arrowPosArr[o + 16] = b2y;
        arrowPosArr[o + 17] = b2z;

        // Colors: dim tail -> bright tip
        arrowColArr[o] = baseCol.r * 0.25;
        arrowColArr[o + 1] = baseCol.g * 0.25;
        arrowColArr[o + 2] = baseCol.b * 0.25;
        for (let v = 1; v < 6; v++) {
          const factor = v <= 2 ? 0.92 : 0.6;
          arrowColArr[o + v * 3] = tipCol.r * factor;
          arrowColArr[o + v * 3 + 1] = tipCol.g * factor;
          arrowColArr[o + v * 3 + 2] = tipCol.b * factor;
        }
      }

      arrowPosAttr.needsUpdate = true;
      arrowColAttr.needsUpdate = true;
    };

    // Streaming Particle System (2,400 max preallocated, drawRange gated)
    const rand = createPrng(987654321);
    const pointPosArr = new Float32Array(MAX_PARTICLES * 3);
    const pointColArr = new Float32Array(MAX_PARTICLES * 3);
    const pointEnergyArr = new Float32Array(MAX_PARTICLES);
    const particleAges = new Float32Array(MAX_PARTICLES);
    const particleMaxAges = new Float32Array(MAX_PARTICLES);
    const particleSeeds = new Float32Array(MAX_PARTICLES);

    // Trail history [MAX_PARTICLES][TRAIL_STEPS][3]
    const trailHistory = new Float32Array(MAX_PARTICLES * TRAIL_STEPS * 3);
    const trailPosArr = new Float32Array(MAX_PARTICLES * TRAIL_VERTS_PER_PARTICLE * 3);
    const trailColArr = new Float32Array(MAX_PARTICLES * TRAIL_VERTS_PER_PARTICLE * 3);

    const pointsGeo = new THREE.BufferGeometry();
    const pointPosAttr = new THREE.BufferAttribute(pointPosArr, 3);
    const pointColAttr = new THREE.BufferAttribute(pointColArr, 3);
    const pointEnergyAttr = new THREE.BufferAttribute(pointEnergyArr, 1);
    pointsGeo.setAttribute('position', pointPosAttr);
    pointsGeo.setAttribute('aColor', pointColAttr);
    pointsGeo.setAttribute('aEnergy', pointEnergyAttr);
    pointsGeo.setDrawRange(0, paramsRef.current.density);

    const pointsMat = new THREE.ShaderMaterial({
      vertexShader: POINT_VERTEX_SHADER,
      fragmentShader: POINT_FRAGMENT_SHADER,
      uniforms: {
        uPixelRatio: { value: dpr },
        uPointScale: { value: compact ? 0.95 : 1.05 },
      },
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const pointsMesh = new THREE.Points(pointsGeo, pointsMat);
    scene.add(pointsMesh);

    const trailGeo = new THREE.BufferGeometry();
    const trailPosAttr = new THREE.BufferAttribute(trailPosArr, 3);
    const trailColAttr = new THREE.BufferAttribute(trailColArr, 3);
    trailGeo.setAttribute('position', trailPosAttr);
    trailGeo.setAttribute('color', trailColAttr);
    trailGeo.setDrawRange(0, paramsRef.current.density * TRAIL_VERTS_PER_PARTICLE);

    const trailMat = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.72,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const trailLines = new THREE.LineSegments(trailGeo, trailMat);
    scene.add(trailLines);

    const colorGold = new THREE.Color('#FFE29E');
    const colorChampagne = new THREE.Color('#F4C46C');
    const colorCyan = new THREE.Color('#46D6E8');
    const colorEmerald = new THREE.Color('#45E6A6');
    const colorCoral = new THREE.Color('#FF8563');

    const tmpSpawn: [number, number, number] = [0, 0, 0];
    const tmpV1: [number, number, number] = [0, 0, 0];
    const tmpV2: [number, number, number] = [0, 0, 0];
    const tmpColor = new THREE.Color();

    const resetParticleTrail = (idx: number, x: number, y: number, z: number) => {
      pointPosArr[idx * 3] = x;
      pointPosArr[idx * 3 + 1] = y;
      pointPosArr[idx * 3 + 2] = z;
      const hBase = idx * TRAIL_STEPS * 3;
      for (let s = 0; s < TRAIL_STEPS; s++) {
        trailHistory[hBase + s * 3] = x;
        trailHistory[hBase + s * 3 + 1] = y;
        trailHistory[hBase + s * 3 + 2] = z;
      }
    };

    const seedAllParticles = (presetKey: VectorFieldPresetId) => {
      for (let i = 0; i < MAX_PARTICLES; i++) {
        spawnParticlePosition(presetKey, rand, tmpSpawn);
        resetParticleTrail(i, tmpSpawn[0], tmpSpawn[1], tmpSpawn[2]);
        particleMaxAges[i] = 2.4 + rand() * 3.4;
        particleAges[i] = rand() * particleMaxAges[i];
        particleSeeds[i] = rand();
      }
    };

    const colorParticle = (
      presetKey: VectorFieldPresetId,
      speedMag: number,
      seedVal: number,
      lifeFade: number,
      idx: number
    ) => {
      const speedNorm = Math.min(1, speedMag / 2.6);
      if (presetKey === 'vortex') {
        tmpColor.copy(colorChampagne).lerp(colorCyan, speedNorm * 0.55);
        if (seedVal > 0.72) tmpColor.lerp(colorGold, 0.5);
      } else if (presetKey === 'dipole') {
        tmpColor.copy(colorCyan).lerp(colorGold, speedNorm * 0.8);
        if (seedVal < 0.22) tmpColor.lerp(colorEmerald, 0.45);
      } else if (presetKey === 'saddle') {
        tmpColor.copy(colorEmerald).lerp(colorGold, speedNorm * 0.75);
        if (seedVal > 0.78) tmpColor.lerp(colorCyan, 0.4);
      } else {
        tmpColor.copy(colorCoral).lerp(colorGold, speedNorm * 0.85);
        if (seedVal > 0.82) tmpColor.lerp(colorCyan, 0.35);
      }

      pointColArr[idx * 3] = tmpColor.r;
      pointColArr[idx * 3 + 1] = tmpColor.g;
      pointColArr[idx * 3 + 2] = tmpColor.b;
      pointEnergyArr[idx] = (0.25 + 0.75 * speedNorm) * lifeFade;

      return lifeFade;
    };

    const syncTrailBuffers = (count: number, trailGain: number) => {
      for (let i = 0; i < count; i++) {
        const hBase = i * TRAIL_STEPS * 3;
        const tBase = i * TRAIL_VERTS_PER_PARTICLE * 3;
        const pr = pointColArr[i * 3];
        const pg = pointColArr[i * 3 + 1];
        const pb = pointColArr[i * 3 + 2];
        const energy = pointEnergyArr[i];

        for (let seg = 0; seg < TRAIL_STEPS - 1; seg++) {
          const aIdx = hBase + seg * 3;
          const bIdx = hBase + (seg + 1) * 3;
          const vOut = tBase + seg * 6;

          trailPosArr[vOut] = trailHistory[aIdx];
          trailPosArr[vOut + 1] = trailHistory[aIdx + 1];
          trailPosArr[vOut + 2] = trailHistory[aIdx + 2];

          trailPosArr[vOut + 3] = trailHistory[bIdx];
          trailPosArr[vOut + 4] = trailHistory[bIdx + 1];
          trailPosArr[vOut + 5] = trailHistory[bIdx + 2];

          const wA = (1 - seg / (TRAIL_STEPS - 1)) * (0.45 + 0.55 * energy) * trailGain;
          const wB = (1 - (seg + 1) / (TRAIL_STEPS - 1)) * 0.35 * trailGain;

          trailColArr[vOut] = pr * wA;
          trailColArr[vOut + 1] = pg * wA;
          trailColArr[vOut + 2] = pb * wA;

          trailColArr[vOut + 3] = pr * wB;
          trailColArr[vOut + 4] = pg * wB;
          trailColArr[vOut + 5] = pb * wB;
        }
      }
    };

    const stepParticles = (dt: number) => {
      const {
        presetId: curPreset,
        speed: curSpeed,
        curl: curCurl,
        density: curDensity,
      } = paramsRef.current;
      const stepDt = dt * curSpeed * 0.85;

      for (let i = 0; i < curDensity; i++) {
        let px = pointPosArr[i * 3];
        let py = pointPosArr[i * 3 + 1];
        let pz = pointPosArr[i * 3 + 2];

        particleAges[i] += dt;
        const r2 = px * px + py * py + pz * pz;
        const hitCore = (curPreset === 'sink' || curPreset === 'dipole') && r2 < 0.065;
        const outOfBounds = r2 > BOUND_RADIUS * BOUND_RADIUS;

        if (particleAges[i] >= particleMaxAges[i] || hitCore || outOfBounds) {
          spawnParticlePosition(curPreset, rand, tmpSpawn);
          resetParticleTrail(i, tmpSpawn[0], tmpSpawn[1], tmpSpawn[2]);
          particleAges[i] = 0;
          particleMaxAges[i] = 2.4 + rand() * 3.4;
          px = tmpSpawn[0];
          py = tmpSpawn[1];
          pz = tmpSpawn[2];
        } else {
          // Shift trail history back by 1 slot
          const hBase = i * TRAIL_STEPS * 3;
          for (let s = TRAIL_STEPS - 1; s >= 1; s--) {
            trailHistory[hBase + s * 3] = trailHistory[hBase + (s - 1) * 3];
            trailHistory[hBase + s * 3 + 1] = trailHistory[hBase + (s - 1) * 3 + 1];
            trailHistory[hBase + s * 3 + 2] = trailHistory[hBase + (s - 1) * 3 + 2];
          }
        }

        // RK2 Midpoint Integration for smooth curved streamlines
        evalVectorField(curPreset, px, py, pz, curCurl, tmpV1);
        const midX = px + tmpV1[0] * stepDt * 0.5;
        const midY = py + tmpV1[1] * stepDt * 0.5;
        const midZ = pz + tmpV1[2] * stepDt * 0.5;
        evalVectorField(curPreset, midX, midY, midZ, curCurl, tmpV2);

        const nx = px + tmpV2[0] * stepDt;
        const ny = py + tmpV2[1] * stepDt;
        const nz = pz + tmpV2[2] * stepDt;

        pointPosArr[i * 3] = nx;
        pointPosArr[i * 3 + 1] = ny;
        pointPosArr[i * 3 + 2] = nz;

        const hBase = i * TRAIL_STEPS * 3;
        trailHistory[hBase] = nx;
        trailHistory[hBase + 1] = ny;
        trailHistory[hBase + 2] = nz;

        const lifeFrac = Math.min(1, particleAges[i] / particleMaxAges[i]);
        const lifeFade = Math.sin(lifeFrac * Math.PI);
        const mag = Math.hypot(tmpV2[0], tmpV2[1], tmpV2[2]);
        colorParticle(curPreset, mag, particleSeeds[i], lifeFade, i);
      }

      syncTrailBuffers(curDensity, 0.92);

      pointPosAttr.needsUpdate = true;
      pointColAttr.needsUpdate = true;
      pointEnergyAttr.needsUpdate = true;
      trailPosAttr.needsUpdate = true;
      trailColAttr.needsUpdate = true;
    };

    // Initial seed & warm-up 14 tiny steps so trails are visible on frame 1 even if paused
    seedAllParticles(paramsRef.current.presetId);
    for (let w = 0; w < 14; w++) {
      stepParticles(0.018);
    }
    updateVelocityArrows();

    onPresetChangeRef.current = (nextPreset: VectorFieldPresetId) => {
      seedAllParticles(nextPreset);
      for (let w = 0; w < 12; w++) {
        stepParticles(0.018);
      }
      updateVelocityArrows();
      const accentHex = FIELD_PRESETS[nextPreset].accent;
      coreMat.color.set(accentHex);
      haloMat.color.set(accentHex);
    };

    onFieldShapeChangeRef.current = () => {
      updateVelocityArrows();
    };

    onResetSimRef.current = () => {
      seedAllParticles(paramsRef.current.presetId);
      for (let w = 0; w < 12; w++) {
        stepParticles(0.018);
      }
      updateVelocityArrows();
      camera.position.set(4.1, 2.55, 4.4);
      controls.target.set(0, 0, 0);
      controls.update();
    };

    onDensityChangeRef.current = (count: number) => {
      const clamped = Math.max(800, Math.min(MAX_PARTICLES, count));
      pointsGeo.setDrawRange(0, clamped);
      trailGeo.setDrawRange(0, clamped * TRAIL_VERTS_PER_PARTICLE);
    };

    onArrowsVisibilityRef.current = (visible: boolean) => {
      arrowLines.visible = visible;
    };

    const ro = new ResizeObserver(() => {
      const r = container.getBoundingClientRect();
      const w = Math.max(240, Math.floor(r.width));
      const h = Math.max(220, Math.floor(r.height));
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      pointsMat.uniforms.uPixelRatio.value = Math.min(window.devicePixelRatio || 1, 2);
    });
    ro.observe(container);

    let rafId = 0;
    let lastNow = performance.now();
    let elapsed = 0;

    const tick = (now: number) => {
      const dt = Math.min(0.045, Math.max(0.001, (now - lastNow) / 1000));
      lastNow = now;
      elapsed += dt;

      if (!document.hidden) {
        const { playing: isPlaying, autoOrbit: isAutoOrbit } = paramsRef.current;
        controls.autoRotate = isAutoOrbit && !reducedMotion;
        controls.autoRotateSpeed = 0.65;
        controls.update();

        if (isPlaying && !reducedMotion) {
          stepParticles(dt);
          const pulse = 1 + Math.sin(elapsed * 2.4) * 0.14;
          coreHalo.scale.setScalar(pulse);
        }

        renderer.render(scene, camera);
      }
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
      onPresetChangeRef.current = null;
      onFieldShapeChangeRef.current = null;
      onResetSimRef.current = null;
      onDensityChangeRef.current = null;
      onArrowsVisibilityRef.current = null;

      controls.dispose();
      ringGeos.forEach((g) => g.dispose());
      ringMats.forEach((m) => m.dispose());
      axisGeo.dispose();
      axisMat.dispose();
      coreGeo.dispose();
      coreMat.dispose();
      haloGeo.dispose();
      haloMat.dispose();
      arrowGeo.dispose();
      arrowMat.dispose();
      pointsGeo.dispose();
      pointsMat.dispose();
      trailGeo.dispose();
      trailMat.dispose();
      renderer.dispose();

      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [nearViewport, compact, reducedMotion]);

  // Sync interactive controls to live WebGL scene
  useEffect(() => {
    onPresetChangeRef.current?.(presetId);
  }, [presetId]);

  useEffect(() => {
    onFieldShapeChangeRef.current?.();
  }, [curl]);

  useEffect(() => {
    onDensityChangeRef.current?.(density);
  }, [density]);

  useEffect(() => {
    onArrowsVisibilityRef.current?.(showArrows);
  }, [showArrows]);

  const handleReset = () => {
    setPresetId('vortex');
    setSpeed(1.0);
    setCurl(0.95);
    setDensity(1800);
    setPlaying(true);
    setShowArrows(true);
    setAutoOrbit(true);
    onResetSimRef.current?.();
  };

  const viewportHeight =
    heightClass ?? (compact ? 'h-[310px] sm:h-[360px]' : 'h-[360px] sm:h-[440px]');

  return (
    <div
      ref={hostRef}
      className="instrument-frame fiducial-frame overflow-hidden bg-[#050508] min-w-0 max-w-full"
    >
      {/* Top Bar */}
      <div className="px-3 sm:px-4 py-2.5 border-b hairline-rule bg-[#0B0C12]/95 flex flex-wrap items-center justify-between gap-2 min-w-0">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className="w-2 h-2 rounded-full shrink-0"
            style={{
              backgroundColor: preset.accent,
              boxShadow: `0 0 10px ${preset.accent}`,
            }}
          />
          <span className="font-mono-data text-[10px] uppercase tracking-[0.16em] text-[#F4C46C] truncate">
            Vector Flow Field 3D
          </span>
          <span className="hidden sm:inline font-mono-data text-[10px] px-2 py-0.5 rounded bg-[#11131C] border border-[rgba(244,196,108,0.18)] text-[#A8B2C6]">
            {density.toLocaleString()} Particles
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setShowArrows((v) => !v)}
            className={`inline-flex items-center gap-1 px-2 py-1 rounded text-[10.5px] font-mono-data border transition-colors ${
              showArrows
                ? 'border-[#46D6E8]/55 text-[#46D6E8] bg-[#46D6E8]/12'
                : 'border-[rgba(244,196,108,0.18)] bg-[#11131C] text-[#A8B2C6]'
            }`}
          >
            <Compass className="w-3 h-3" />
            <span>Arrows</span>
          </button>

          {!compact && (
            <button
              type="button"
              onClick={() => setAutoOrbit((s) => !s)}
              className={`px-2 py-1 rounded text-[10.5px] font-mono-data border transition-colors ${
                autoOrbit
                  ? 'border-[#F4C46C]/50 text-[#FFE29E] bg-[#F4C46C]/15'
                  : 'border-[rgba(244,196,108,0.18)] bg-[#11131C] text-[#A8B2C6]'
              }`}
            >
              {autoOrbit ? 'Orbit: Auto' : 'Orbit: Free'}
            </button>
          )}

          <button
            type="button"
            onClick={() => setPlaying((p) => !p)}
            aria-label={playing ? 'Pause flow field' : 'Play flow field'}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-[10.5px] font-mono-data border transition-colors ${
              playing
                ? 'border-[#45E6A6]/50 text-[#45E6A6] bg-[#45E6A6]/12'
                : 'border-[#F4C46C]/50 text-[#FFE29E] bg-[#F4C46C]/15'
            }`}
          >
            {playing ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
            <span>{playing ? 'Pause' : 'Play'}</span>
          </button>

          <button
            type="button"
            onClick={handleReset}
            aria-label="Reset 3D vector flow field"
            className="p-1.5 rounded border border-[rgba(244,196,108,0.18)] bg-[#11131C] text-[#A8B2C6] hover:text-[#F7F4EC]"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Split: 3D Viewport + Controls & Live Equation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 min-w-0">
        <div
          className={`${
            compact
              ? 'lg:col-span-12'
              : 'lg:col-span-8 border-b lg:border-b-0 lg:border-r hairline-rule'
          } relative bg-[#050508] min-w-0`}
        >
          <WebGLErrorBoundary fallbackTitle="3D Vector Flow Field Unavailable">
            {webglError ? (
              <div
                className={`w-full ${viewportHeight} flex items-center justify-center p-4 text-center bg-[#050508] font-mono-data text-xs text-[#A8B2C6]`}
              >
                {webglError}
              </div>
            ) : nearViewport ? (
              <div ref={mountRef} className={`w-full ${viewportHeight} bg-[#050508]`} />
            ) : (
              <div
                className={`w-full ${viewportHeight} flex items-center justify-center bg-[#050508] font-mono-data text-xs text-[#A8B2C6]`}
              >
                Initializing 3D Vector Flow Observatory…
              </div>
            )}
          </WebGLErrorBoundary>

          {/* Top-Left Live Field Formula Overlay */}
          <div className="pointer-events-none absolute top-3 left-3 obsidian-glass rounded-lg px-2.5 sm:px-3 py-2 border border-[rgba(244,196,108,0.24)] space-y-1 max-w-[calc(100%-24px)]">
            <div className="flex flex-wrap items-center gap-1.5 font-mono-data text-[10px]">
              <span style={{ color: preset.accent }} className="font-semibold uppercase">
                {preset.label}
              </span>
              <span className="text-[#A8B2C6]">· k = {curl.toFixed(2)}</span>
              <span className="hidden sm:inline text-[#FFE29E]">· {speed.toFixed(1)}× speed</span>
            </div>
            <div className="overflow-x-auto max-w-full">
              <MathTex tex={preset.formulaTex} className="text-[11px] sm:text-xs text-[#F7F4EC]" />
            </div>
          </div>

          {/* Compact Mode Bottom Presets & Caption */}
          {compact ? (
            <div className="absolute bottom-3 left-3 right-3 flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap gap-1.5">
                {PRESET_ORDER.map((id) => {
                  const p = FIELD_PRESETS[id];
                  const active = presetId === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setPresetId(id)}
                      className={`px-2 py-1 rounded text-[10px] font-mono-data border transition-all ${
                        active
                          ? 'text-[#050508] font-semibold'
                          : 'bg-[#0B0C12]/85 border-[rgba(244,196,108,0.2)] text-[#A8B2C6] hover:text-[#F7F4EC]'
                      }`}
                      style={
                        active ? { backgroundColor: p.accent, borderColor: p.accent } : undefined
                      }
                    >
                      {p.shortLabel}
                    </button>
                  );
                })}
              </div>
              <span className="pointer-events-none hidden sm:inline font-mono-data text-[10px] text-[#A8B2C6] bg-[#0B0C12]/80 px-2 py-1 rounded border border-[rgba(244,196,108,0.16)]">
                Drag to orbit · Scroll to zoom
              </span>
            </div>
          ) : (
            <div className="pointer-events-none absolute bottom-2.5 left-3 right-3 sm:right-auto px-2.5 py-1 rounded bg-[#0B0C12]/85 border border-[rgba(244,196,108,0.18)] text-[10px] sm:text-[10.5px] font-mono-data text-[#A8B2C6] truncate">
              Drag to orbit · Scroll to zoom · Velocity arrows steer all {density.toLocaleString()} glowing particles
            </div>
          )}
        </div>

        {/* Full Controls & Intuition Panel */}
        {!compact && (
          <div className="lg:col-span-4 bg-[#0B0C12] p-4 sm:p-5 flex flex-col justify-between gap-3.5 min-w-0">
            <div className="space-y-3 min-w-0">
              <div className="font-mono-data text-[10px] uppercase tracking-[0.16em] text-[#A8B2C6]">
                3D Vector Field Preset
              </div>

              <div className="grid grid-cols-2 gap-1.5">
                {PRESET_ORDER.map((id) => {
                  const p = FIELD_PRESETS[id];
                  const active = presetId === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setPresetId(id)}
                      className={`px-2.5 py-2 rounded-lg text-left text-xs font-mono-data border transition-all truncate ${
                        active
                          ? 'text-[#050508] font-semibold'
                          : 'bg-[#11131C] border-[rgba(244,196,108,0.16)] text-[#A8B2C6] hover:text-[#F7F4EC]'
                      }`}
                      style={
                        active
                          ? {
                              backgroundColor: p.accent,
                              borderColor: p.accent,
                              boxShadow: `0 0 18px -6px ${p.accent}`,
                            }
                          : undefined
                      }
                    >
                      {p.label}
                    </button>
                  );
                })}
              </div>

              {/* Sliders */}
              <div className="p-3.5 rounded-xl bg-[#11131C] border border-[rgba(244,196,108,0.16)] space-y-3">
                <label className="block space-y-1 text-xs">
                  <div className="flex justify-between font-mono-data">
                    <span className="text-[#A8B2C6]">Flow Speed</span>
                    <span className="text-[#FFE29E] font-semibold">{speed.toFixed(2)}×</span>
                  </div>
                  <input
                    type="range"
                    min={0.2}
                    max={2.5}
                    step={0.05}
                    value={speed}
                    onChange={(e) => setSpeed(parseFloat(e.target.value))}
                    className="meridian-slider"
                    style={{ ['--slider-accent' as string]: '#FFE29E' }}
                  />
                </label>

                <label className="block space-y-1 text-xs">
                  <div className="flex justify-between font-mono-data">
                    <span className="text-[#A8B2C6]">Curl / Twist (k)</span>
                    <span className="text-[#46D6E8] font-semibold">{curl.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min={0.0}
                    max={2.0}
                    step={0.05}
                    value={curl}
                    onChange={(e) => setCurl(parseFloat(e.target.value))}
                    className="meridian-slider"
                    style={{ ['--slider-accent' as string]: '#46D6E8' }}
                  />
                </label>

                <label className="block space-y-1 text-xs">
                  <div className="flex justify-between font-mono-data">
                    <span className="text-[#A8B2C6]">Particle Density</span>
                    <span className="text-[#45E6A6] font-semibold">
                      {density.toLocaleString()}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={800}
                    max={2400}
                    step={100}
                    value={density}
                    onChange={(e) => setDensity(parseInt(e.target.value, 10))}
                    className="meridian-slider"
                    style={{ ['--slider-accent' as string]: '#45E6A6' }}
                  />
                  <div className="flex justify-between font-mono-data text-[10px] text-[#727D94]">
                    <span>800 sparse</span>
                    <span>2,400 dense</span>
                  </div>
                </label>
              </div>
            </div>

            {/* Plain-English Intuition + Sample Arrow Readout */}
            <div className="p-3.5 rounded-xl bg-[#11131C] border border-[rgba(244,196,108,0.2)] space-y-2 min-w-0">
              <div className="flex items-center justify-between gap-2 font-mono-data text-[10px] uppercase tracking-[0.14em] text-[#F4C46C]">
                <span>How Arrows Steer Particles</span>
                <span className="text-[#46D6E8]">|v| = {probeVector.mag.toFixed(2)}</span>
              </div>
              <p className="text-xs leading-relaxed text-[#A8B2C6]">{preset.intuition}</p>
              <div className="pt-1.5 border-t border-[rgba(244,196,108,0.12)] font-mono-data text-[10.5px] text-[#FFE29E] overflow-x-auto">
                F({preset.probePoint.join(', ')}) = ⟨{probeVector.x.toFixed(2)},{' '}
                {probeVector.y.toFixed(2)}, {probeVector.z.toFixed(2)}⟩
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Compact Intuition Strip for Embedded Views */}
      {compact && (
        <div className="px-3 sm:px-4 py-2 border-t hairline-rule bg-[#0B0C12]/90 flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#A8B2C6]">
          <span className="leading-snug">{preset.intuition}</span>
        </div>
      )}
    </div>
  );
}

export default VectorFlowField3D;
