import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Eye, Pause, Play, RotateCcw } from 'lucide-react';
import { MathTex } from '../../components/MathTex';
import { WebGLErrorBoundary } from '../../components/WebGLErrorBoundary';
import { useReducedMotion } from '../../hooks/useReducedMotion';

export interface MatrixTransform3DProps {
  compact?: boolean;
  heightClass?: string;
}

// Row-major 3x3 matrix: [m00, m01, m02, m10, m11, m12, m20, m21, m22]
type Mat3 = readonly [
  number, number, number,
  number, number, number,
  number, number, number,
];

type PresetId = 'rotation' | 'shear' | 'squeeze' | 'mirror' | 'spiral';

interface MatrixPreset {
  id: PresetId;
  label: string;
  badge: string;
  accent: string;
  matrix: Mat3;
  insight: string;
}

const IDENTITY_MAT3: Mat3 = [1, 0, 0, 0, 1, 0, 0, 0, 1];

const MATRIX_PRESETS: MatrixPreset[] = [
  {
    id: 'rotation',
    label: '3D Rotation',
    badge: 'det = 1',
    accent: '#46D6E8',
    // Exact composition of Pythagorean rotations Ry(53.13°) * Rx(36.87°) -> det = +1.000
    matrix: [0.6, 0.48, 0.64, 0, 0.8, -0.6, -0.8, 0.36, 0.48],
    insight:
      'Turns all of 3D space rigidly without stretching or squishing — the cube keeps its exact volume of 1.',
  },
  {
    id: 'shear',
    label: 'Shear Warp',
    badge: 'det = 1',
    accent: '#F4C46C',
    matrix: [1, 0.85, 0.4, 0, 1, 0.5, 0, 0, 1],
    insight:
      'Slides upper layers sideways like a tilted deck of cards. Base area and height stay fixed, so volume stays 1!',
  },
  {
    id: 'squeeze',
    label: 'Squeeze (det=1)',
    badge: 'det = 1',
    accent: '#45E6A6',
    matrix: [1.6, 0, 0, 0, 0.5, 0, 0, 0, 1.25],
    insight:
      'Stretches X and Z while squishing Y in balance (1.6 × 0.5 × 1.25 = 1), preserving total 3D volume.',
  },
  {
    id: 'mirror',
    label: 'Mirror Flip (det=-1)',
    badge: 'det = -1',
    accent: '#FF8563',
    matrix: [-1, 0, 0, 0, 1, 0, 0, 0, 1],
    insight:
      'Flips X across the mirror plane! Halfway through (t = 0.5), space flattens to 2D (det = 0) before inverting.',
  },
  {
    id: 'spiral',
    label: 'Spiral Scale',
    badge: 'det = 1.88',
    accent: '#FFE29E',
    matrix: [1.0, 0, -0.75, 0.25, 1.2, 0.25, 0.75, 0, 1.0],
    insight:
      'Twists the horizontal plane while lifting and expanding all three axes, scaling unit volume by 1.875×.',
  },
];

const CUBE_BASE_CORNERS: readonly [number, number, number][] = [
  [0, 0, 0], // 0
  [1, 0, 0], // 1
  [1, 1, 0], // 2
  [0, 1, 0], // 3
  [0, 0, 1], // 4
  [1, 0, 1], // 5
  [1, 1, 1], // 6
  [0, 1, 1], // 7
];

const CUBE_EDGE_PAIRS: readonly [number, number][] = [
  [0, 1], [1, 2], [2, 3], [3, 0],
  [4, 5], [5, 6], [6, 7], [7, 4],
  [0, 4], [1, 5], [2, 6], [3, 7],
];

const CUBE_FACE_QUADS: readonly [number, number, number, number][] = [
  [0, 3, 2, 1],
  [4, 5, 6, 7],
  [0, 1, 5, 4],
  [3, 7, 6, 2],
  [0, 4, 7, 3],
  [1, 2, 6, 5],
];

const LATTICE_VALS = [-1, -0.5, 0, 0.5, 1];

interface LatticeSegment {
  ax: number;
  ay: number;
  az: number;
  bx: number;
  by: number;
  bz: number;
  isMainAxis: boolean;
}

function buildLatticeSegments(): LatticeSegment[] {
  const segs: LatticeSegment[] = [];
  for (const u of LATTICE_VALS) {
    for (const v of LATTICE_VALS) {
      const axisLine = u === 0 && v === 0;
      segs.push({ ax: -1, ay: u, az: v, bx: 1, by: u, bz: v, isMainAxis: axisLine });
      segs.push({ ax: u, ay: -1, az: v, bx: u, by: 1, bz: v, isMainAxis: axisLine });
      segs.push({ ax: u, ay: v, az: -1, bx: u, by: v, bz: 1, isMainAxis: axisLine });
    }
  }
  return segs;
}

const LATTICE_SEGMENTS = buildLatticeSegments();

function det3(m: Mat3): number {
  return (
    m[0] * (m[4] * m[8] - m[5] * m[7]) -
    m[1] * (m[3] * m[8] - m[5] * m[6]) +
    m[2] * (m[3] * m[7] - m[4] * m[6])
  );
}

function lerpMat3(a: Mat3, b: Mat3, t: number): Mat3 {
  const s = 1 - t;
  return [
    a[0] * s + b[0] * t,
    a[1] * s + b[1] * t,
    a[2] * s + b[2] * t,
    a[3] * s + b[3] * t,
    a[4] * s + b[4] * t,
    a[5] * s + b[5] * t,
    a[6] * s + b[6] * t,
    a[7] * s + b[7] * t,
    a[8] * s + b[8] * t,
  ];
}

function fmtEntry(n: number): string {
  const rounded = Math.abs(n) < 0.005 ? 0 : Number(n.toFixed(2));
  return Number.isInteger(rounded) ? `${rounded}` : rounded.toFixed(2).replace(/0$/, '');
}

function matricesMatch(a: Mat3, b: Mat3): boolean {
  for (let i = 0; i < 9; i++) {
    if (Math.abs(a[i] - b[i]) > 0.004) return false;
  }
  return true;
}

function easeInOutCubic(x: number): number {
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

// Smooth loop: hold at 0 (0.8s) -> ease to 1 (2.1s) -> hold at 1 (1.8s) -> ease to 0 (1.7s)
function sampleAutoMorphT(phaseSeconds: number): number {
  const cycle = 6.4;
  const p = ((phaseSeconds % cycle) + cycle) % cycle;
  if (p < 0.8) return 0;
  if (p < 2.9) return easeInOutCubic((p - 0.8) / 2.1);
  if (p < 4.7) return 1;
  return 1 - easeInOutCubic((p - 4.7) / 1.7);
}

interface VectorArrowRig {
  shaft: THREE.Mesh;
  cone: THREE.Mesh;
  tip: THREE.Mesh;
}

const UP_AXIS = new THREE.Vector3(0, 1, 0);
const TMP_DIR = new THREE.Vector3();
const TMP_QUAT = new THREE.Quaternion();

function updateVectorRig(rig: VectorArrowRig, vx: number, vy: number, vz: number) {
  const len = Math.hypot(vx, vy, vz);
  if (len < 0.035) {
    rig.shaft.visible = false;
    rig.cone.visible = false;
    rig.tip.position.set(vx, vy, vz);
    return;
  }

  TMP_DIR.set(vx / len, vy / len, vz / len);
  TMP_QUAT.setFromUnitVectors(UP_AXIS, TMP_DIR);

  const headLen = Math.min(0.18, len * 0.34);
  const shaftLen = Math.max(0.01, len - headLen);

  rig.shaft.visible = true;
  rig.shaft.scale.set(1, shaftLen, 1);
  rig.shaft.quaternion.copy(TMP_QUAT);
  rig.shaft.position.copy(TMP_DIR).multiplyScalar(shaftLen * 0.5);

  rig.cone.visible = true;
  rig.cone.scale.set(1, headLen / 0.18, 1);
  rig.cone.quaternion.copy(TMP_QUAT);
  rig.cone.position.copy(TMP_DIR).multiplyScalar(shaftLen + headLen * 0.5);

  rig.tip.position.set(vx, vy, vz);
}

export function MatrixTransform3D({
  compact = false,
  heightClass,
}: MatrixTransform3DProps = {}): JSX.Element {
  const reducedMotion = useReducedMotion();
  const [targetMatrix, setTargetMatrix] = useState<Mat3>(MATRIX_PRESETS[0].matrix);
  const [morphT, setMorphT] = useState<number>(1);
  const [autoAnimate, setAutoAnimate] = useState<boolean>(true);
  const [showGhostRef, setShowGhostRef] = useState<boolean>(true);
  const [nearViewport, setNearViewport] = useState<boolean>(false);
  const [webglError, setWebglError] = useState<string | null>(null);

  const hostRef = useRef<HTMLDivElement | null>(null);
  const mountRef = useRef<HTMLDivElement | null>(null);

  const targetMatrixRef = useRef<Mat3>(targetMatrix);
  targetMatrixRef.current = targetMatrix;

  const morphTRef = useRef<number>(morphT);
  const autoAnimateRef = useRef<boolean>(autoAnimate);
  autoAnimateRef.current = autoAnimate;

  const showGhostRefState = useRef<boolean>(showGhostRef);
  showGhostRefState.current = showGhostRef;

  const applyTransformRef = useRef<((mat: Mat3, tVal: number) => void) | null>(null);
  const setGhostVisibleRef = useRef<((visible: boolean) => void) | null>(null);
  const animClockRef = useRef<number>(3.1); // begins at t=1.00 showcase hold, then smoothly cycles 1 -> 0 -> 1

  const activePreset = useMemo(
    () => MATRIX_PRESETS.find((p) => matricesMatch(p.matrix, targetMatrix)) ?? null,
    [targetMatrix]
  );

  const targetDet = useMemo(() => det3(targetMatrix), [targetMatrix]);

  const currentMatrix = useMemo(
    () => lerpMat3(IDENTITY_MAT3, targetMatrix, morphT),
    [targetMatrix, morphT]
  );
  const currentDet = useMemo(() => det3(currentMatrix), [currentMatrix]);

  const matrixTex = useMemo(() => {
    const m = targetMatrix;
    return `A = \\begin{bmatrix} {\\color{#FF8563}${fmtEntry(m[0])}} & {\\color{#45E6A6}${fmtEntry(m[1])}} & {\\color{#46D6E8}${fmtEntry(m[2])}} \\\\ {\\color{#FF8563}${fmtEntry(m[3])}} & {\\color{#45E6A6}${fmtEntry(m[4])}} & {\\color{#46D6E8}${fmtEntry(m[5])}} \\\\ {\\color{#FF8563}${fmtEntry(m[6])}} & {\\color{#45E6A6}${fmtEntry(m[7])}} & {\\color{#46D6E8}${fmtEntry(m[8])}} \\end{bmatrix}`;
  }, [targetMatrix]);

  const detStatus = useMemo(() => {
    if (Math.abs(currentDet) < 0.03) {
      return {
        label: 'Collapsed Space (det ≈ 0)',
        color: '#46D6E8',
        detail: 'Box squashed onto a flat plane/line — zero 3D volume.',
      };
    }
    if (currentDet < 0) {
      return {
        label: 'Orientation Flipped (det < 0)',
        color: '#FF8563',
        detail: `Space turned inside-out! Volume scaled by ${Math.abs(currentDet).toFixed(2)}×.`,
      };
    }
    return {
      label: 'Orientation Preserved',
      color: '#45E6A6',
      detail: `Unit cube volume scales by ${currentDet.toFixed(2)}×.`,
    };
  }, [currentDet]);

  // IntersectionObserver gates WebGL mounting/animation to near-viewport only
  useEffect(() => {
    const el = hostRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setNearViewport(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        setNearViewport(entries.some((e) => e.isIntersecting));
      },
      { rootMargin: '200px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Main Three.js WebGL setup & teardown
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
    renderer.setClearColor(0x060609, 1);

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
    scene.background = new THREE.Color(0x060609);

    const camera = new THREE.PerspectiveCamera(38, initW / initH, 0.1, 80);
    camera.position.set(3.45, 2.55, 3.75);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.065;
    controls.rotateSpeed = 0.78;
    controls.minDistance = 2.4;
    controls.maxDistance = 11.5;
    controls.target.set(0.28, 0.35, 0.22);

    // Lightweight procedural studio reflections
    const pmrem = new THREE.PMREMGenerator(renderer);
    const envScene = new THREE.Scene();
    envScene.background = new THREE.Color(0x060609);
    const envGeo = new THREE.PlaneGeometry(8, 8);
    const envGold = new THREE.MeshBasicMaterial({ color: 0xffe29e, side: THREE.DoubleSide });
    const envCyan = new THREE.MeshBasicMaterial({ color: 0x46d6e8, side: THREE.DoubleSide });
    const envP1 = new THREE.Mesh(envGeo, envGold);
    envP1.position.set(5, 6, 4);
    envP1.lookAt(0, 0, 0);
    const envP2 = new THREE.Mesh(envGeo, envCyan);
    envP2.position.set(-5, 3, -4);
    envP2.lookAt(0, 0, 0);
    envScene.add(envP1, envP2);
    const envRT = pmrem.fromScene(envScene);
    scene.environment = envRT.texture;

    const ambient = new THREE.AmbientLight(0xf7f4ec, 0.48);
    const keyLight = new THREE.DirectionalLight(0xffe29e, 1.4);
    keyLight.position.set(5, 7, 5);
    const cyanRim = new THREE.DirectionalLight(0x46d6e8, 0.9);
    cyanRim.position.set(-6, 3, -4);
    const coralRim = new THREE.DirectionalLight(0xff8563, 0.45);
    coralRim.position.set(3, -3, -4);
    scene.add(ambient, keyLight, cyanRim, coralRim);

    // Subtle Observatory Floor Disc & Rings below transformation space
    const baseY = -1.72;
    const floorGeo = new THREE.CircleGeometry(3.1, 64);
    floorGeo.rotateX(-Math.PI / 2);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x0a0b10,
      roughness: 0.88,
      metalness: 0.2,
    });
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.position.y = baseY - 0.01;
    scene.add(floorMesh);

    const ringGeos: THREE.BufferGeometry[] = [];
    const ringMats: THREE.Material[] = [];
    [1.65, 2.25, 2.85].forEach((r, idx) => {
      const rg = new THREE.RingGeometry(r - 0.008, r + 0.008, 96);
      rg.rotateX(-Math.PI / 2);
      const rm = new THREE.MeshBasicMaterial({
        color: idx === 1 ? 0x46d6e8 : 0xf4c46c,
        transparent: true,
        opacity: idx === 0 ? 0.3 : 0.16,
        side: THREE.DoubleSide,
      });
      ringGeos.push(rg);
      ringMats.push(rm);
      const ring = new THREE.Mesh(rg, rm);
      ring.position.y = baseY;
      scene.add(ring);
    });

    // Static Ghost Reference Group (Original Identity Lattice & Unit Cube)
    const ghostGroup = new THREE.Group();
    scene.add(ghostGroup);

    const ghostLatticePositions = new Float32Array(LATTICE_SEGMENTS.length * 6);
    LATTICE_SEGMENTS.forEach((seg, idx) => {
      const o = idx * 6;
      ghostLatticePositions[o] = seg.ax;
      ghostLatticePositions[o + 1] = seg.ay;
      ghostLatticePositions[o + 2] = seg.az;
      ghostLatticePositions[o + 3] = seg.bx;
      ghostLatticePositions[o + 4] = seg.by;
      ghostLatticePositions[o + 5] = seg.bz;
    });
    const ghostLatticeGeo = new THREE.BufferGeometry();
    ghostLatticeGeo.setAttribute(
      'position',
      new THREE.BufferAttribute(ghostLatticePositions, 3)
    );
    const ghostLatticeMat = new THREE.LineBasicMaterial({
      color: 0x4b566e,
      transparent: true,
      opacity: 0.2,
    });
    ghostGroup.add(new THREE.LineSegments(ghostLatticeGeo, ghostLatticeMat));

    const ghostCubePos = new Float32Array(CUBE_EDGE_PAIRS.length * 6);
    CUBE_EDGE_PAIRS.forEach(([ia, ib], idx) => {
      const ca = CUBE_BASE_CORNERS[ia];
      const cb = CUBE_BASE_CORNERS[ib];
      const o = idx * 6;
      ghostCubePos[o] = ca[0];
      ghostCubePos[o + 1] = ca[1];
      ghostCubePos[o + 2] = ca[2];
      ghostCubePos[o + 3] = cb[0];
      ghostCubePos[o + 4] = cb[1];
      ghostCubePos[o + 5] = cb[2];
    });
    const ghostCubeGeo = new THREE.BufferGeometry();
    ghostCubeGeo.setAttribute('position', new THREE.BufferAttribute(ghostCubePos, 3));
    const ghostCubeMat = new THREE.LineBasicMaterial({
      color: 0xa8b2c6,
      transparent: true,
      opacity: 0.34,
    });
    ghostGroup.add(new THREE.LineSegments(ghostCubeGeo, ghostCubeMat));
    ghostGroup.visible = showGhostRefState.current;

    // Transformed Luminous Golden 3D Spatial Lattice
    const latticePosArray = new Float32Array(LATTICE_SEGMENTS.length * 6);
    const latticeColArray = new Float32Array(LATTICE_SEGMENTS.length * 6);
    const mainGold = new THREE.Color(0xffe29e);
    const subGold = new THREE.Color(0xb88938);
    LATTICE_SEGMENTS.forEach((seg, idx) => {
      const c = seg.isMainAxis ? mainGold : subGold;
      const o = idx * 6;
      latticeColArray[o] = c.r;
      latticeColArray[o + 1] = c.g;
      latticeColArray[o + 2] = c.b;
      latticeColArray[o + 3] = c.r;
      latticeColArray[o + 4] = c.g;
      latticeColArray[o + 5] = c.b;
    });
    const latticeGeo = new THREE.BufferGeometry();
    latticeGeo.setAttribute('position', new THREE.BufferAttribute(latticePosArray, 3));
    latticeGeo.setAttribute('color', new THREE.BufferAttribute(latticeColArray, 3));
    const latticeMat = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.56,
    });
    const latticeLines = new THREE.LineSegments(latticeGeo, latticeMat);
    scene.add(latticeLines);

    // Transformed Lattice Intersection Motes (125 golden points)
    const moteCoords: [number, number, number][] = [];
    for (const gx of LATTICE_VALS) {
      for (const gy of LATTICE_VALS) {
        for (const gz of LATTICE_VALS) {
          moteCoords.push([gx, gy, gz]);
        }
      }
    }
    const motePosArray = new Float32Array(moteCoords.length * 3);
    const moteGeo = new THREE.BufferGeometry();
    moteGeo.setAttribute('position', new THREE.BufferAttribute(motePosArray, 3));
    const moteMat = new THREE.PointsMaterial({
      color: 0xffe29e,
      size: 0.045,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const latticeMotes = new THREE.Points(moteGeo, moteMat);
    scene.add(latticeMotes);

    // Translucent Transformed Unit Cube (24 faceted vertices + 36 indices)
    const cubeFacePosArray = new Float32Array(24 * 3);
    const cubeIndices: number[] = [];
    for (let f = 0; f < 6; f++) {
      const base = f * 4;
      cubeIndices.push(base, base + 1, base + 2, base, base + 2, base + 3);
    }
    const cubeGeo = new THREE.BufferGeometry();
    cubeGeo.setAttribute('position', new THREE.BufferAttribute(cubeFacePosArray, 3));
    cubeGeo.setIndex(cubeIndices);

    const cubeMat = new THREE.MeshPhysicalMaterial({
      color: 0xf4c46c,
      emissive: 0x6b4b16,
      emissiveIntensity: 0.35,
      roughness: 0.16,
      metalness: 0.25,
      clearcoat: 0.9,
      clearcoatRoughness: 0.08,
      transparent: true,
      opacity: 0.28,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const cubeMesh = new THREE.Mesh(cubeGeo, cubeMat);
    cubeMesh.renderOrder = 3;
    scene.add(cubeMesh);

    const cubeEdgesPosArray = new Float32Array(CUBE_EDGE_PAIRS.length * 6);
    const cubeEdgesGeo = new THREE.BufferGeometry();
    cubeEdgesGeo.setAttribute('position', new THREE.BufferAttribute(cubeEdgesPosArray, 3));
    const cubeEdgesMat = new THREE.LineBasicMaterial({
      color: 0xffe29e,
      transparent: true,
      opacity: 0.92,
      toneMapped: false,
    });
    const cubeEdges = new THREE.LineSegments(cubeEdgesGeo, cubeEdgesMat);
    cubeEdges.renderOrder = 4;
    scene.add(cubeEdges);

    // Origin anchor sphere
    const originGeo = new THREE.SphereGeometry(0.055, 16, 16);
    const originMat = new THREE.MeshBasicMaterial({ color: 0xf7f4ec, toneMapped: false });
    const originDot = new THREE.Mesh(originGeo, originMat);
    scene.add(originDot);

    // Basis Vectors (i-hat Coral, j-hat Emerald, k-hat Cyan)
    const shaftGeo = new THREE.CylinderGeometry(0.025, 0.025, 1, 14);
    const coneGeo = new THREE.ConeGeometry(0.072, 0.18, 16);
    const tipGeo = new THREE.SphereGeometry(0.044, 12, 12);

    const basisColors = [0xff8563, 0x45e6a6, 0x46d6e8];
    const basisMats: THREE.Material[] = [];
    const basisRigs: VectorArrowRig[] = basisColors.map((hex) => {
      const shaftMat = new THREE.MeshPhysicalMaterial({
        color: hex,
        emissive: hex,
        emissiveIntensity: 0.55,
        roughness: 0.2,
        metalness: 0.2,
      });
      const coneMat = new THREE.MeshBasicMaterial({
        color: hex,
        toneMapped: false,
      });
      basisMats.push(shaftMat, coneMat);

      const shaft = new THREE.Mesh(shaftGeo, shaftMat);
      const cone = new THREE.Mesh(coneGeo, coneMat);
      const tip = new THREE.Mesh(tipGeo, coneMat);
      shaft.renderOrder = 5;
      cone.renderOrder = 5;
      tip.renderOrder = 5;
      scene.add(shaft, cone, tip);
      return { shaft, cone, tip };
    });

    // Cached corner buffer to prevent allocations inside 60fps loop
    const transformedCorners: [number, number, number][] = Array.from(
      { length: 8 },
      () => [0, 0, 0]
    );

    const applyTransform = (target: Mat3, tVal: number) => {
      const m = lerpMat3(IDENTITY_MAT3, target, tVal);

      // 1. Update Lattice Lines
      const latAttr = latticeGeo.attributes.position as THREE.BufferAttribute;
      for (let idx = 0; idx < LATTICE_SEGMENTS.length; idx++) {
        const seg = LATTICE_SEGMENTS[idx];
        const o = idx * 6;
        latticePosArray[o] = m[0] * seg.ax + m[1] * seg.ay + m[2] * seg.az;
        latticePosArray[o + 1] = m[3] * seg.ax + m[4] * seg.ay + m[5] * seg.az;
        latticePosArray[o + 2] = m[6] * seg.ax + m[7] * seg.ay + m[8] * seg.az;
        latticePosArray[o + 3] = m[0] * seg.bx + m[1] * seg.by + m[2] * seg.bz;
        latticePosArray[o + 4] = m[3] * seg.bx + m[4] * seg.by + m[5] * seg.bz;
        latticePosArray[o + 5] = m[6] * seg.bx + m[7] * seg.by + m[8] * seg.bz;
      }
      latAttr.needsUpdate = true;

      // 2. Update Lattice Motes
      const moteAttr = moteGeo.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < moteCoords.length; i++) {
        const [gx, gy, gz] = moteCoords[i];
        const o = i * 3;
        motePosArray[o] = m[0] * gx + m[1] * gy + m[2] * gz;
        motePosArray[o + 1] = m[3] * gx + m[4] * gy + m[5] * gz;
        motePosArray[o + 2] = m[6] * gx + m[7] * gy + m[8] * gz;
      }
      moteAttr.needsUpdate = true;

      // 3. Update Unit Cube Corners, Faces & Edges
      for (let c = 0; c < 8; c++) {
        const [cx, cy, cz] = CUBE_BASE_CORNERS[c];
        transformedCorners[c][0] = m[0] * cx + m[1] * cy + m[2] * cz;
        transformedCorners[c][1] = m[3] * cx + m[4] * cy + m[5] * cz;
        transformedCorners[c][2] = m[6] * cx + m[7] * cy + m[8] * cz;
      }

      const cubePosAttr = cubeGeo.attributes.position as THREE.BufferAttribute;
      for (let f = 0; f < 6; f++) {
        const quad = CUBE_FACE_QUADS[f];
        for (let k = 0; k < 4; k++) {
          const pt = transformedCorners[quad[k]];
          const o = (f * 4 + k) * 3;
          cubeFacePosArray[o] = pt[0];
          cubeFacePosArray[o + 1] = pt[1];
          cubeFacePosArray[o + 2] = pt[2];
        }
      }
      cubePosAttr.needsUpdate = true;
      cubeGeo.computeVertexNormals();

      const edgeAttr = cubeEdgesGeo.attributes.position as THREE.BufferAttribute;
      for (let e = 0; e < CUBE_EDGE_PAIRS.length; e++) {
        const [ia, ib] = CUBE_EDGE_PAIRS[e];
        const pa = transformedCorners[ia];
        const pb = transformedCorners[ib];
        const o = e * 6;
        cubeEdgesPosArray[o] = pa[0];
        cubeEdgesPosArray[o + 1] = pa[1];
        cubeEdgesPosArray[o + 2] = pa[2];
        cubeEdgesPosArray[o + 3] = pb[0];
        cubeEdgesPosArray[o + 4] = pb[1];
        cubeEdgesPosArray[o + 5] = pb[2];
      }
      edgeAttr.needsUpdate = true;

      // Color cube according to determinant sign (Positive Gold, Zero Cyan, Inverted Coral)
      const d = det3(m);
      if (Math.abs(d) < 0.03) {
        cubeMat.color.setHex(0x46d6e8);
        cubeMat.emissive.setHex(0x16515c);
        cubeMat.opacity = 0.42;
        cubeEdgesMat.color.setHex(0x46d6e8);
      } else if (d < 0) {
        cubeMat.color.setHex(0xff8563);
        cubeMat.emissive.setHex(0x6b2214);
        cubeMat.opacity = 0.3;
        cubeEdgesMat.color.setHex(0xffb59e);
      } else {
        cubeMat.color.setHex(0xf4c46c);
        cubeMat.emissive.setHex(0x6b4b16);
        cubeMat.opacity = 0.28;
        cubeEdgesMat.color.setHex(0xffe29e);
      }

      // 4. Update Basis Vectors (columns of M)
      updateVectorRig(basisRigs[0], m[0], m[3], m[6]); // i-hat = col 1
      updateVectorRig(basisRigs[1], m[1], m[4], m[7]); // j-hat = col 2
      updateVectorRig(basisRigs[2], m[2], m[5], m[8]); // k-hat = col 3
    };

    applyTransformRef.current = applyTransform;
    setGhostVisibleRef.current = (visible: boolean) => {
      ghostGroup.visible = visible;
    };

    applyTransform(targetMatrixRef.current, morphTRef.current);

    const ro = new ResizeObserver(() => {
      const r = container.getBoundingClientRect();
      const w = Math.max(240, Math.floor(r.width));
      const h = Math.max(220, Math.floor(r.height));
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    });
    ro.observe(container);

    let rafId = 0;
    let lastNow = performance.now();
    let uiSyncAccum = 0;

    const tick = (now: number) => {
      const dt = Math.min(0.05, Math.max(0.001, (now - lastNow) / 1000));
      lastNow = now;

      if (!document.hidden) {
        if (autoAnimateRef.current && !reducedMotion) {
          animClockRef.current += dt;
          const nextT = sampleAutoMorphT(animClockRef.current);
          morphTRef.current = nextT;
          applyTransform(targetMatrixRef.current, nextT);

          uiSyncAccum += dt;
          if (uiSyncAccum >= 0.065) {
            uiSyncAccum = 0;
            setMorphT(nextT);
          }
        }

        controls.autoRotate = !reducedMotion;
        controls.autoRotateSpeed = 0.38;
        controls.update();
        renderer.render(scene, camera);
      }
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
      applyTransformRef.current = null;
      setGhostVisibleRef.current = null;
      controls.dispose();

      [
        envGeo,
        floorGeo,
        ghostLatticeGeo,
        ghostCubeGeo,
        latticeGeo,
        moteGeo,
        cubeGeo,
        cubeEdgesGeo,
        originGeo,
        shaftGeo,
        coneGeo,
        tipGeo,
        ...ringGeos,
      ].forEach((g) => g.dispose());

      [
        envGold,
        envCyan,
        floorMat,
        ghostLatticeMat,
        ghostCubeMat,
        latticeMat,
        moteMat,
        cubeMat,
        cubeEdgesMat,
        originMat,
        ...ringMats,
        ...basisMats,
      ].forEach((m) => m.dispose());

      envRT.dispose();
      pmrem.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [nearViewport, reducedMotion]);

  // Sync target matrix changes cleanly without snapping back active auto-morph frames
  useEffect(() => {
    applyTransformRef.current?.(targetMatrix, morphTRef.current);
  }, [targetMatrix, nearViewport]);

  useEffect(() => {
    setGhostVisibleRef.current?.(showGhostRef);
  }, [showGhostRef]);

  const selectPreset = (preset: MatrixPreset) => {
    setTargetMatrix(preset.matrix);
    animClockRef.current = 0.85; // starts smoothly morphing 0 -> 1 right after picking preset
    const startT = sampleAutoMorphT(0.85);
    morphTRef.current = startT;
    setAutoAnimate(true);
    setMorphT(startT);
    applyTransformRef.current?.(preset.matrix, startT);
  };

  const updateMatrixEntry = (index: number, value: number) => {
    setAutoAnimate(false);
    morphTRef.current = 1;
    setMorphT(1);
    setTargetMatrix((prev) => {
      const next = [...prev];
      next[index] = value;
      return next as unknown as Mat3;
    });
  };

  const handleManualMorphChange = (val: number) => {
    setAutoAnimate(false);
    morphTRef.current = val;
    setMorphT(val);
    applyTransformRef.current?.(targetMatrixRef.current, val);
  };

  const viewportHeight =
    heightClass ?? (compact ? 'h-[310px] sm:h-[350px]' : 'h-[370px] sm:h-[440px]');

  return (
    <div
      ref={hostRef}
      className="instrument-frame fiducial-frame overflow-hidden bg-[#060609] min-w-0 max-w-full"
    >
      {/* Top Instrument Bar */}
      <div className="px-4 py-2.5 border-b hairline-rule bg-[#0B0C12]/95 flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className="w-2 h-2 rounded-full shrink-0"
            style={{
              backgroundColor: activePreset?.accent ?? '#F4C46C',
              boxShadow: `0 0 10px ${activePreset?.accent ?? '#F4C46C'}`,
            }}
          />
          <span className="font-mono-data text-[10px] uppercase tracking-[0.16em] text-[#F4C46C] truncate">
            3D Matrix Linear Transformation
          </span>
          <span className="hidden sm:inline font-mono-data text-[10px] px-2 py-0.5 rounded bg-[#11131C] border border-[rgba(244,196,108,0.18)] text-[#A8B2C6]">
            det(A) = {targetDet.toFixed(2)}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setShowGhostRef((v) => !v)}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-mono-data border transition-colors ${
              showGhostRef
                ? 'border-[#46D6E8]/55 text-[#46D6E8] bg-[#46D6E8]/12'
                : 'border-[rgba(244,196,108,0.18)] bg-[#11131C] text-[#A8B2C6]'
            }`}
          >
            <Eye className="w-3 h-3" />
            <span className="hidden sm:inline">Ghost Grid</span>
            <span className="sm:hidden">Ghost</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (!autoAnimate) {
                animClockRef.current = 0.85;
              }
              setAutoAnimate((a) => !a);
            }}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-mono-data border transition-colors ${
              autoAnimate
                ? 'border-[#F4C46C]/55 text-[#FFE29E] bg-[#F4C46C]/15'
                : 'border-[rgba(244,196,108,0.18)] bg-[#11131C] text-[#A8B2C6]'
            }`}
          >
            {autoAnimate ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
            <span>{autoAnimate ? 'Auto-Morph' : 'Paused'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              const first = MATRIX_PRESETS[0].matrix;
              setTargetMatrix(first);
              animClockRef.current = 0.85;
              const startT = sampleAutoMorphT(0.85);
              morphTRef.current = startT;
              setMorphT(startT);
              setAutoAnimate(true);
              setShowGhostRef(true);
              applyTransformRef.current?.(first, startT);
            }}
            aria-label="Reset 3D matrix transform"
            className="p-1.5 rounded border border-[rgba(244,196,108,0.18)] bg-[#11131C] text-[#A8B2C6] hover:text-[#F7F4EC]"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Split: 3D Viewport + Matrix & Determinant Telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-12 min-w-0">
        <div
          className={`${
            compact
              ? 'lg:col-span-12'
              : 'lg:col-span-8 border-b lg:border-b-0 lg:border-r hairline-rule'
          } relative bg-[#060609] min-w-0`}
        >
          <WebGLErrorBoundary fallbackTitle="3D Matrix Lab Unavailable">
            {webglError ? (
              <div
                className={`w-full ${viewportHeight} flex items-center justify-center p-4 text-center bg-[#060609] font-mono-data text-xs text-[#A8B2C6]`}
              >
                {webglError}
              </div>
            ) : nearViewport ? (
              <div ref={mountRef} className={`w-full ${viewportHeight} bg-[#060609]`} />
            ) : (
              <div
                className={`w-full ${viewportHeight} flex items-center justify-center bg-[#060609] font-mono-data text-xs text-[#A8B2C6]`}
              >
                Initializing 3D Linear Transform Observatory…
              </div>
            )}
          </WebGLErrorBoundary>

          {/* Top-Left HUD Overlay */}
          <div className="pointer-events-none absolute top-3 left-3 obsidian-glass rounded-lg px-3 py-2 border border-[rgba(244,196,108,0.24)] space-y-1 max-w-[calc(100%-24px)] overflow-x-auto">
            <div className="flex flex-wrap items-center gap-2 font-mono-data text-[10px]">
              <span
                style={{ color: activePreset?.accent ?? '#F4C46C' }}
                className="font-semibold uppercase"
              >
                {activePreset?.label ?? 'Custom Matrix'}
              </span>
              <span className="text-[#A8B2C6]">· t = {morphT.toFixed(2)}</span>
              <span style={{ color: detStatus.color }}>
                · det(M) = {currentDet.toFixed(2)}
              </span>
            </div>
            <div className="hidden sm:block overflow-x-auto">
              <MathTex tex={matrixTex} className="text-[11px] text-[#F7F4EC]" />
            </div>
          </div>

          {/* Basis Vector Legend Pill (top-right on sm+) */}
          <div className="pointer-events-none absolute top-3 right-3 hidden sm:flex items-center gap-2.5 obsidian-glass rounded-lg px-2.5 py-1.5 border border-[rgba(244,196,108,0.2)] font-mono-data text-[10px]">
            <span className="inline-flex items-center gap-1 text-[#FF8563]">
              <span className="w-2 h-2 rounded-full bg-[#FF8563]" /> î Col 1
            </span>
            <span className="inline-flex items-center gap-1 text-[#45E6A6]">
              <span className="w-2 h-2 rounded-full bg-[#45E6A6]" /> ĵ Col 2
            </span>
            <span className="inline-flex items-center gap-1 text-[#46D6E8]">
              <span className="w-2 h-2 rounded-full bg-[#46D6E8]" /> k̂ Col 3
            </span>
          </div>

          {/* Compact Mode Bottom Presets & Scrub Bar */}
          {compact && (
            <div className="absolute bottom-3 left-3 right-3 flex flex-col gap-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap gap-1">
                  {MATRIX_PRESETS.map((p) => {
                    const active = activePreset?.id === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => selectPreset(p)}
                        className={`px-2 py-1 rounded text-[10px] font-mono-data border transition-all ${
                          active
                            ? 'text-[#060609] font-semibold'
                            : 'bg-[#0B0C12]/85 border-[rgba(244,196,108,0.2)] text-[#A8B2C6] hover:text-[#F7F4EC]'
                        }`}
                        style={
                          active
                            ? { backgroundColor: p.accent, borderColor: p.accent }
                            : undefined
                        }
                      >
                        {p.label}
                      </button>
                    );
                  })}
                </div>
                <span className="pointer-events-none hidden md:inline font-mono-data text-[10px] text-[#A8B2C6] bg-[#0B0C12]/80 px-2 py-1 rounded border border-[rgba(244,196,108,0.16)]">
                  Drag to orbit · Scroll to zoom
                </span>
              </div>

              <div className="obsidian-glass rounded-lg px-2.5 py-1.5 border border-[rgba(244,196,108,0.2)] flex items-center gap-2.5">
                <span className="font-mono-data text-[10px] text-[#FFE29E] shrink-0">
                  Morph t={morphT.toFixed(2)}
                </span>
                <input
                  type="range"
                  aria-label="Morph progress"
                  min={0}
                  max={1}
                  step={0.01}
                  value={morphT}
                  onChange={(e) => handleManualMorphChange(parseFloat(e.target.value))}
                  className="meridian-slider"
                  style={{ ['--slider-accent' as string]: '#F4C46C' }}
                />
              </div>
            </div>
          )}

          {!compact && (
            <div className="pointer-events-none absolute bottom-2.5 left-3 px-2.5 py-1 rounded bg-[#0B0C12]/85 border border-[rgba(244,196,108,0.18)] text-[10.5px] font-mono-data text-[#A8B2C6] max-w-[calc(100%-24px)] truncate">
              Drag to orbit · Scroll to zoom · Columns of A show where î, ĵ, k̂ land
            </div>
          )}
        </div>

        {/* Full Interactive Control Panel */}
        {!compact && (
          <div className="lg:col-span-4 bg-[#0B0C12] p-4 sm:p-5 flex flex-col justify-between gap-3.5 min-w-0">
            <div className="space-y-3 min-w-0">
              {/* Preset Selector */}
              <div className="space-y-1.5">
                <div className="font-mono-data text-[10px] uppercase tracking-[0.16em] text-[#A8B2C6]">
                  3D Transformation Presets
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {MATRIX_PRESETS.map((p, idx) => {
                    const active = activePreset?.id === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => selectPreset(p)}
                        className={`px-2.5 py-1.5 rounded-lg text-left text-[11px] font-mono-data border transition-all ${
                          idx === MATRIX_PRESETS.length - 1 ? 'col-span-2' : ''
                        } ${
                          active
                            ? 'text-[#060609] font-semibold'
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
                        <div className="flex items-center justify-between gap-1">
                          <span className="truncate">{p.label}</span>
                          <span className="opacity-75 text-[9.5px] shrink-0">{p.badge}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Morph Progress Scrub Slider */}
              <div className="p-3 rounded-xl bg-[#11131C] border border-[rgba(244,196,108,0.16)] space-y-2.5">
                <label className="block space-y-1 text-xs">
                  <div className="flex justify-between font-mono-data">
                    <span className="text-[#A8B2C6]">Morph Progress (I → A)</span>
                    <span className="text-[#FFE29E] font-semibold">t = {morphT.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.01}
                    value={morphT}
                    onChange={(e) => handleManualMorphChange(parseFloat(e.target.value))}
                    className="meridian-slider"
                    style={{ ['--slider-accent' as string]: '#F4C46C' }}
                  />
                  <div className="flex justify-between font-mono-data text-[9.5px] text-[#727D94]">
                    <span>0.00 Identity I</span>
                    <span>1.00 Target A</span>
                  </div>
                </label>
              </div>

              {/* Live Diagonal & Shear Matrix Sliders */}
              <div className="p-3 rounded-xl bg-[#11131C] border border-[rgba(244,196,108,0.16)] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono-data text-[10px] uppercase tracking-[0.14em] text-[#A8B2C6]">
                    Customize Matrix Entries
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setAutoAnimate(false);
                      setMorphT(1);
                      setTargetMatrix(IDENTITY_MAT3);
                    }}
                    className="font-mono-data text-[10px] text-[#F4C46C] hover:underline"
                  >
                    Set Identity I
                  </button>
                </div>

                {/* Diagonal Scale Controls */}
                <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3 gap-2">
                  {[
                    { idx: 0, label: 'a₁₁ (X)', color: '#FF8563' },
                    { idx: 4, label: 'a₂₂ (Y)', color: '#45E6A6' },
                    { idx: 8, label: 'a₃₃ (Z)', color: '#46D6E8' },
                  ].map((s) => (
                    <label key={s.idx} className="block space-y-1 text-[10.5px]">
                      <div className="flex justify-between font-mono-data">
                        <span className="text-[#A8B2C6]">{s.label}</span>
                        <span style={{ color: s.color }}>{targetMatrix[s.idx].toFixed(2)}</span>
                      </div>
                      <input
                        type="range"
                        min={-2}
                        max={2}
                        step={0.05}
                        value={targetMatrix[s.idx]}
                        onChange={(e) => updateMatrixEntry(s.idx, parseFloat(e.target.value))}
                        className="meridian-slider"
                        style={{ ['--slider-accent' as string]: s.color }}
                      />
                    </label>
                  ))}
                </div>

                {/* Shear Controls */}
                <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3 gap-2 pt-1.5 border-t border-[rgba(244,196,108,0.1)]">
                  {[
                    { idx: 1, label: 'a₁₂ Shear', color: '#F4C46C' },
                    { idx: 2, label: 'a₁₃ Shear', color: '#FFE29E' },
                    { idx: 3, label: 'a₂₁ Shear', color: '#F4C46C' },
                  ].map((s) => (
                    <label key={s.idx} className="block space-y-1 text-[10.5px]">
                      <div className="flex justify-between font-mono-data">
                        <span className="text-[#A8B2C6]">{s.label}</span>
                        <span style={{ color: s.color }}>{targetMatrix[s.idx].toFixed(2)}</span>
                      </div>
                      <input
                        type="range"
                        min={-1.5}
                        max={1.5}
                        step={0.05}
                        value={targetMatrix[s.idx]}
                        onChange={(e) => updateMatrixEntry(s.idx, parseFloat(e.target.value))}
                        className="meridian-slider"
                        style={{ ['--slider-accent' as string]: s.color }}
                      />
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Live MathTex Matrix & Determinant Volume-Scale Readout */}
            <div className="p-3 rounded-xl bg-[#11131C] border border-[rgba(244,196,108,0.2)] space-y-2 min-w-0">
              <div className="flex items-center justify-between gap-2 font-mono-data text-[10px]">
                <span className="uppercase tracking-[0.14em] text-[#A8B2C6]">
                  Live Matrix &amp; Volume Scale
                </span>
                <span style={{ color: detStatus.color }} className="font-semibold">
                  {detStatus.label}
                </span>
              </div>

              <div className="overflow-x-auto py-0.5 max-w-full">
                <MathTex
                  tex={`${matrixTex} \\qquad \\det(A) = ${targetDet.toFixed(2)}`}
                  className="text-xs text-[#F7F4EC]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 font-mono-data text-xs">
                <div className="p-2 rounded bg-[#0B0C12] border border-[rgba(244,196,108,0.18)]">
                  <div className="text-[9.5px] text-[#727D94]">Target det(A)</div>
                  <div className="text-[#FFE29E] font-semibold">{targetDet.toFixed(3)}×</div>
                </div>
                <div className="p-2 rounded bg-[#0B0C12] border border-[rgba(70,214,232,0.2)]">
                  <div className="text-[9.5px] text-[#727D94]">Current Vol (t)</div>
                  <div style={{ color: detStatus.color }} className="font-semibold">
                    {currentDet.toFixed(3)}×
                  </div>
                </div>
              </div>

              <p className="text-[11.5px] text-[#A8B2C6] leading-relaxed">
                {activePreset?.insight ?? detStatus.detail}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default MatrixTransform3D;
