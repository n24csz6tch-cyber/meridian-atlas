import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Pause, Play, RotateCcw, Sliders } from 'lucide-react';
import { MathTex } from '../../components/MathTex';
import { WebGLErrorBoundary } from '../../components/WebGLErrorBoundary';
import { useReducedMotion } from '../../hooks/useReducedMotion';

export type CalabiMode = 'calabi-yau' | 'hopf' | 'worldsheet';

interface HarmonicModeInfo {
  n: number;
  particle: string;
  spin: string;
  accent: string;
}

const HARMONIC_MODES: HarmonicModeInfo[] = [
  { n: 1, particle: 'Fundamental Photon γ', spin: 'Spin-1 Vector', accent: '#FFE29E' },
  { n: 2, particle: 'Graviton G (Closed)', spin: 'Spin-2 Tensor', accent: '#F4C46C' },
  { n: 3, particle: 'Quark Harmonic q', spin: 'Triplet Mode', accent: '#46D6E8' },
  { n: 4, particle: 'Gluon Gauge g', spin: 'Color Octet', accent: '#45E6A6' },
  { n: 5, particle: 'Higher Excitation', spin: '5-Node Wave', accent: '#FF8563' },
  { n: 6, particle: 'Planck Resonance', spin: '6-Node Wave', accent: '#B88938' },
];

function buildCalabiYauBuffers(n: number, alpha: number, twist: number) {
  const NU = 13;
  const NV = 13;
  const vertsPerPatch = (NU + 1) * (NV + 1);
  const trisPerPatch = NU * NV * 2;
  const patchCount = n * n;

  const totalVerts = patchCount * vertsPerPatch;
  const positions = new Float32Array(totalVerts * 3);
  const colors = new Float32Array(totalVerts * 3);
  const indices = new Uint32Array(patchCount * trisPerPatch * 3);

  // Wireframe line segments along every 2nd grid line in u and v
  const uStep = 2;
  const vStep = 2;
  const uWireCount = Math.floor(NU / uStep) + 1;
  const vWireCount = Math.floor(NV / vStep) + 1;
  const segmentsPerPatch = uWireCount * NV + vWireCount * NU;
  const wirePositions = new Float32Array(patchCount * segmentsPerPatch * 2 * 3);

  const cosA = Math.cos(alpha);
  const sinA = Math.sin(alpha);
  const expPow = 2 / n;
  const scale = 1.38;

  const goldChampagne = new THREE.Color('#F4C46C');
  const starGold = new THREE.Color('#FFE29E');
  const cyan = new THREE.Color('#46D6E8');
  const coral = new THREE.Color('#FF8563');
  const tmpColor = new THREE.Color();

  let vCursor = 0;
  let iCursor = 0;
  let wCursor = 0;

  for (let k1 = 0; k1 < n; k1++) {
    const phase1 = (2 * Math.PI * k1) / n;
    for (let k2 = 0; k2 < n; k2++) {
      const phase2 = (2 * Math.PI * k2) / n;
      const patchBaseVert = vCursor;

      // Temporary patch grid positions for wireframe construction
      const patchPts = new Float32Array(vertsPerPatch * 3);
      let pLocal = 0;

      for (let iu = 0; iu <= NU; iu++) {
        const u = (iu / NU) * (Math.PI / 2);
        const cu = Math.cos(u);
        const su = Math.sin(u);

        for (let iv = 0; iv <= NV; iv++) {
          const v = -1.02 + (iv / NV) * 2.04;
          const chv = Math.cosh(v);
          const shv = Math.sinh(v);

          // cos(u + iv) = cos(u)cosh(v) - i sin(u)sinh(v)
          const re1 = cu * chv;
          const im1 = -su * shv;
          const r1 = Math.hypot(re1, im1);
          const th1 = Math.atan2(im1, re1);

          // sin(u + iv) = sin(u)cosh(v) + i cos(u)sinh(v)
          const re2 = su * chv;
          const im2 = cu * shv;
          const r2 = Math.hypot(re2, im2);
          const th2 = Math.atan2(im2, re2);

          const m1 = Math.pow(r1, expPow);
          const a1 = phase1 + expPow * th1;
          const z1re = m1 * Math.cos(a1);
          const z1im = m1 * Math.sin(a1);

          const m2 = Math.pow(r2, expPow);
          const a2 = phase2 + expPow * th2;
          const z2re = m2 * Math.cos(a2);
          const z2im = m2 * Math.sin(a2);

          const px = z1re;
          const py = z2re;
          const pz = cosA * z1im + sinA * z2im;
          const hiddenDim = -sinA * z1im + cosA * z2im;

          // Interactive Helical Twist around vertical axis
          const twistAng = twist * py;
          const ct = Math.cos(twistAng);
          const st = Math.sin(twistAng);
          const rx = (px * ct - pz * st) * scale;
          const ry = py * scale;
          const rz = (px * st + pz * ct) * scale;

          positions[vCursor * 3] = rx;
          positions[vCursor * 3 + 1] = ry;
          positions[vCursor * 3 + 2] = rz;

          patchPts[pLocal * 3] = rx;
          patchPts[pLocal * 3 + 1] = ry;
          patchPts[pLocal * 3 + 2] = rz;

          // Rich AUREA color blending across hidden 4D depth & root phase
          const depthMix = THREE.MathUtils.clamp(0.5 + hiddenDim * 0.42, 0, 1);
          const sheetRatio = (k1 + k2) / Math.max(1, 2 * (n - 1));
          tmpColor.copy(goldChampagne).lerp(starGold, 0.35 + 0.35 * Math.sin(sheetRatio * Math.PI));
          if (depthMix > 0.58) {
            tmpColor.lerp(cyan, (depthMix - 0.58) * 1.15);
          } else if (depthMix < 0.42) {
            tmpColor.lerp(coral, (0.42 - depthMix) * 0.95);
          }

          colors[vCursor * 3] = tmpColor.r;
          colors[vCursor * 3 + 1] = tmpColor.g;
          colors[vCursor * 3 + 2] = tmpColor.b;

          vCursor++;
          pLocal++;
        }
      }

      // Triangle indices
      for (let iu = 0; iu < NU; iu++) {
        for (let iv = 0; iv < NV; iv++) {
          const a = patchBaseVert + iu * (NV + 1) + iv;
          const b = patchBaseVert + (iu + 1) * (NV + 1) + iv;
          const c = patchBaseVert + (iu + 1) * (NV + 1) + (iv + 1);
          const d = patchBaseVert + iu * (NV + 1) + (iv + 1);

          indices[iCursor++] = a;
          indices[iCursor++] = b;
          indices[iCursor++] = d;

          indices[iCursor++] = b;
          indices[iCursor++] = c;
          indices[iCursor++] = d;
        }
      }

      // Wireframe contour segments
      for (let iu = 0; iu <= NU; iu += uStep) {
        for (let iv = 0; iv < NV; iv++) {
          const p0 = (iu * (NV + 1) + iv) * 3;
          const p1 = (iu * (NV + 1) + iv + 1) * 3;
          wirePositions[wCursor++] = patchPts[p0];
          wirePositions[wCursor++] = patchPts[p0 + 1];
          wirePositions[wCursor++] = patchPts[p0 + 2];
          wirePositions[wCursor++] = patchPts[p1];
          wirePositions[wCursor++] = patchPts[p1 + 1];
          wirePositions[wCursor++] = patchPts[p1 + 2];
        }
      }
      for (let iv = 0; iv <= NV; iv += vStep) {
        for (let iu = 0; iu < NU; iu++) {
          const p0 = (iu * (NV + 1) + iv) * 3;
          const p1 = ((iu + 1) * (NV + 1) + iv) * 3;
          wirePositions[wCursor++] = patchPts[p0];
          wirePositions[wCursor++] = patchPts[p0 + 1];
          wirePositions[wCursor++] = patchPts[p0 + 2];
          wirePositions[wCursor++] = patchPts[p1];
          wirePositions[wCursor++] = patchPts[p1 + 1];
          wirePositions[wCursor++] = patchPts[p1 + 2];
        }
      }
    }
  }

  const surfaceGeom = new THREE.BufferGeometry();
  surfaceGeom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  surfaceGeom.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  surfaceGeom.setIndex(new THREE.BufferAttribute(indices, 1));
  surfaceGeom.computeVertexNormals();

  const wireGeom = new THREE.BufferGeometry();
  wireGeom.setAttribute('position', new THREE.BufferAttribute(wirePositions, 3));

  return { surfaceGeom, wireGeom };
}

function createHopfTubeCurve(eta: number, phi: number): THREE.Curve<THREE.Vector3> {
  const pts: THREE.Vector3[] = [];
  const segs = 72;
  for (let i = 0; i < segs; i++) {
    const xi = (i / segs) * Math.PI * 2;
    const x1 = Math.cos(eta) * Math.cos(xi + phi);
    const x2 = Math.cos(eta) * Math.sin(xi + phi);
    const x3 = Math.sin(eta) * Math.cos(xi);
    const x4 = Math.sin(eta) * Math.sin(xi);
    const denom = Math.max(0.36, 1.38 - x4);
    const scale = 1.42 / denom;
    pts.push(new THREE.Vector3(x1 * scale, x3 * scale * 0.92, x2 * scale));
  }
  return new THREE.CatmullRomCurve3(pts, true);
}

const HOPF_PULSE_VERTEX = /* glsl */ `
  attribute vec4 aFiber; // [eta, phi, xi0, speed]
  attribute float aHue;
  uniform float uTime;
  uniform float uPixelRatio;
  varying float vHue;
  varying float vGlow;

  void main() {
    float eta = aFiber.x;
    float phi = aFiber.y;
    float xi = aFiber.z + uTime * aFiber.w;

    float x1 = cos(eta) * cos(xi + phi);
    float x2 = cos(eta) * sin(xi + phi);
    float x3 = sin(eta) * cos(xi);
    float x4 = sin(eta) * sin(xi);
    float denom = max(0.36, 1.38 - x4);
    vec3 pos = vec3(x1, x3 * 0.92, x2) * (1.42 / denom);

    vHue = aHue;
    vGlow = 0.55 + 0.45 * sin(xi * 2.0 - uTime * 2.5);
    vec4 mvPos = modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = clamp((3.4 + vGlow * 2.2) * uPixelRatio * (8.5 / max(1.0, -mvPos.z)), 1.5, 11.0);
    gl_Position = projectionMatrix * mvPos;
  }
`;

const HOPF_PULSE_FRAGMENT = /* glsl */ `
  varying float vHue;
  varying float vGlow;

  void main() {
    float d = length(gl_PointCoord - vec2(0.5)) * 2.0;
    if (d > 1.0) discard;
    float alpha = pow(1.0 - d, 2.0) * (0.45 + 0.55 * vGlow);
    vec3 gold = vec3(1.0, 0.886, 0.62);
    vec3 cyan = vec3(0.275, 0.839, 0.91);
    vec3 col = mix(gold, cyan, vHue);
    gl_FragColor = vec4(col, alpha);
  }
`;

export function CalabiYauManifold3D({
  compact = false,
  heightClass,
}: {
  compact?: boolean;
  heightClass?: string;
}) {
  const reducedMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasHostRef = useRef<HTMLDivElement | null>(null);

  const [isNearViewport, setIsNearViewport] = useState(false);
  const [webglError, setWebglError] = useState<string | null>(null);

  const [mode, setMode] = useState<CalabiMode>('calabi-yau');
  const [playing, setPlaying] = useState(true);

  // Mode 1: Calabi-Yau Hypersurface parameters
  const [symmetryN, setSymmetryN] = useState(5);
  const [alpha, setAlpha] = useState(0.72);
  const [twist, setTwist] = useState(0.35);

  // Mode 2: Hopf Fibration parameters
  const [hopfFlowSpeed, setHopfFlowSpeed] = useState(1.0);

  // Mode 3: Relativistic String Worldsheet parameters
  const [harmonicN, setHarmonicN] = useState(2);
  const [tension, setTension] = useState(1.25);
  const [closedString, setClosedString] = useState(true);

  const resolvedHeight =
    heightClass ?? (compact ? 'h-[400px] sm:h-[460px]' : 'h-[470px] sm:h-[530px]');

  // Live synced parameters ref for animation loop
  const paramsRef = useRef({
    mode,
    playing,
    reducedMotion,
    symmetryN,
    alpha,
    twist,
    hopfFlowSpeed,
    harmonicN,
    tension,
    closedString,
  });

  useEffect(() => {
    paramsRef.current = {
      mode,
      playing,
      reducedMotion,
      symmetryN,
      alpha,
      twist,
      hopfFlowSpeed,
      harmonicN,
      tension,
      closedString,
    };
  }, [
    mode,
    playing,
    reducedMotion,
    symmetryN,
    alpha,
    twist,
    hopfFlowSpeed,
    harmonicN,
    tension,
    closedString,
  ]);

  // Ref to trigger camera reset cleanly from button
  const resetSignalRef = useRef(0);
  const handleResetView = useCallback(() => {
    resetSignalRef.current += 1;
  }, []);

  // Callback ref to rebuild Calabi-Yau geometry when sliders move
  const rebuildCyRef = useRef<(() => void) | null>(null);
  useEffect(() => {
    if (isNearViewport && mode === 'calabi-yau') {
      rebuildCyRef.current?.();
    }
  }, [isNearViewport, mode, symmetryN, alpha, twist]);

  // IntersectionObserver (rootMargin: '200px') for WebGL lifecycle safety
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          setIsNearViewport(entry.isIntersecting);
        }
      },
      { rootMargin: '200px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Main Three.js WebGL scene managed purely while near viewport
  useEffect(() => {
    if (!isNearViewport) return;
    const host = canvasHostRef.current;
    if (!host) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        powerPreference: 'high-performance',
        alpha: false,
      });
    } catch (err) {
      setWebglError(err instanceof Error ? err.message : 'Unable to create WebGL context.');
      return;
    }

    setWebglError(null);
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    renderer.setPixelRatio(dpr);
    renderer.setClearColor(0x060609, 1);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.18;

    const initW = Math.max(280, host.clientWidth || 680);
    const initH = Math.max(260, host.clientHeight || 480);
    renderer.setSize(initW, initH);
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x060609);

    // Lightweight procedural studio PMREM environment so MeshPhysicalMaterial sparkles like liquid gold
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const envScene = new THREE.Scene();
    envScene.background = new THREE.Color(0x08090f);
    const panelGeom = new THREE.PlaneGeometry(6, 4);
    const panelGoldMat = new THREE.MeshBasicMaterial({ color: 0xffe29e, side: THREE.DoubleSide });
    const panelCyanMat = new THREE.MeshBasicMaterial({ color: 0x46d6e8, side: THREE.DoubleSide });
    const panelCoralMat = new THREE.MeshBasicMaterial({ color: 0xff8563, side: THREE.DoubleSide });

    const p1 = new THREE.Mesh(panelGeom, panelGoldMat);
    p1.position.set(4, 5, 4);
    p1.lookAt(0, 0, 0);
    const p2 = new THREE.Mesh(panelGeom, panelCyanMat);
    p2.position.set(-5, 2, -4);
    p2.lookAt(0, 0, 0);
    const p3 = new THREE.Mesh(panelGeom, panelCoralMat);
    p3.position.set(0, -5, 2);
    p3.lookAt(0, 0, 0);
    envScene.add(p1, p2, p3);

    const envRT = pmremGenerator.fromScene(envScene, 0.04);
    scene.environment = envRT.texture;
    panelGeom.dispose();
    panelGoldMat.dispose();
    panelCyanMat.dispose();
    panelCoralMat.dispose();

    const camera = new THREE.PerspectiveCamera(42, initW / initH, 0.1, 80);
    camera.position.set(4.5, 2.7, 5.4);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.minDistance = 2.6;
    controls.maxDistance = 14;
    controls.autoRotateSpeed = 0.85;

    // Observatory Lighting
    const ambient = new THREE.AmbientLight(0xffe9c4, 0.45);
    const hemi = new THREE.HemisphereLight(0xffe29e, 0x0b1020, 0.85);
    const keyLight = new THREE.DirectionalLight(0xffe29e, 2.4);
    keyLight.position.set(6, 8, 6);
    const rimLight = new THREE.DirectionalLight(0x46d6e8, 1.55);
    rimLight.position.set(-6, 3, -5);
    const fillLight = new THREE.PointLight(0xff8563, 2.2, 22);
    fillLight.position.set(0, -4, 4);
    scene.add(ambient, hemi, keyLight, rimLight, fillLight);

    // Subtle 3D Cartesian coordinate reference ring
    const equatorRingGeom = new THREE.RingGeometry(2.78, 2.8, 96);
    equatorRingGeom.rotateX(-Math.PI / 2);
    const equatorRingMat = new THREE.MeshBasicMaterial({
      color: 0xf4c46c,
      transparent: true,
      opacity: 0.14,
      side: THREE.DoubleSide,
    });
    const equatorRing = new THREE.Mesh(equatorRingGeom, equatorRingMat);
    equatorRing.position.y = -1.95;
    scene.add(equatorRing);

    // -------------------------------------------------------------
    // GROUP 1: Calabi-Yau Hypersurface (z1^n + z2^n = 1)
    // -------------------------------------------------------------
    const cyGroup = new THREE.Group();
    scene.add(cyGroup);

    const cyMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xf4c46c,
      emissive: 0x362005,
      emissiveIntensity: 0.35,
      metalness: 0.35,
      roughness: 0.18,
      clearcoat: 1.0,
      clearcoatRoughness: 0.12,
      transmission: 0.35,
      thickness: 0.75,
      ior: 1.48,
      side: THREE.DoubleSide,
      vertexColors: true,
      transparent: true,
      opacity: 0.94,
    });

    const cyWireMaterial = new THREE.LineBasicMaterial({
      color: 0xffe29e,
      transparent: true,
      opacity: 0.25,
    });

    const initialCy = buildCalabiYauBuffers(
      paramsRef.current.symmetryN,
      paramsRef.current.alpha,
      paramsRef.current.twist
    );
    const cyMesh = new THREE.Mesh(initialCy.surfaceGeom, cyMaterial);
    const cyWire = new THREE.LineSegments(initialCy.wireGeom, cyWireMaterial);
    cyGroup.add(cyMesh, cyWire);

    rebuildCyRef.current = () => {
      const { symmetryN: n, alpha: a, twist: tw } = paramsRef.current;
      const next = buildCalabiYauBuffers(n, a, tw);
      const oldSurf = cyMesh.geometry;
      const oldWire = cyWire.geometry;
      cyMesh.geometry = next.surfaceGeom;
      cyWire.geometry = next.wireGeom;
      oldSurf.dispose();
      oldWire.dispose();
    };

    // -------------------------------------------------------------
    // GROUP 2: Hopf Fibration (S^3 -> S^2)
    // -------------------------------------------------------------
    const hopfGroup = new THREE.Group();
    scene.add(hopfGroup);

    const hopfMeshes: { geom: THREE.BufferGeometry; mat: THREE.Material }[] = [];
    const hopfGoldMat = new THREE.MeshPhysicalMaterial({
      color: 0xf4c46c,
      emissive: 0x5c3c0e,
      emissiveIntensity: 0.42,
      metalness: 0.45,
      roughness: 0.16,
      clearcoat: 1.0,
      transparent: true,
      opacity: 0.85,
    });
    const hopfCyanMat = new THREE.MeshPhysicalMaterial({
      color: 0x46d6e8,
      emissive: 0x0c3e4d,
      emissiveIntensity: 0.45,
      metalness: 0.4,
      roughness: 0.18,
      clearcoat: 1.0,
      transparent: true,
      opacity: 0.82,
    });
    const hopfCoralMat = new THREE.MeshPhysicalMaterial({
      color: 0xff8563,
      emissive: 0x4f1a0c,
      emissiveIntensity: 0.4,
      metalness: 0.38,
      roughness: 0.2,
      clearcoat: 1.0,
      transparent: true,
      opacity: 0.8,
    });

    const hopfShells = [
      { eta: 0.34, count: 10, radius: 0.028, mat: hopfCyanMat },
      { eta: 0.64, count: 12, radius: 0.025, mat: hopfGoldMat },
      { eta: 0.96, count: 10, radius: 0.024, mat: hopfCoralMat },
    ];

    const pulseParticleCount = 2400;
    const fiberAttr = new Float32Array(pulseParticleCount * 4);
    const hueAttr = new Float32Array(pulseParticleCount);
    const fiberSpecs: { eta: number; phi: number; hue: number }[] = [];

    hopfShells.forEach((shell, sIdx) => {
      for (let j = 0; j < shell.count; j++) {
        const phi = (j / shell.count) * Math.PI * 2 + sIdx * 0.28;
        const curve = createHopfTubeCurve(shell.eta, phi);
        const tubeGeom = new THREE.TubeGeometry(curve, 64, shell.radius, 8, true);
        const mesh = new THREE.Mesh(tubeGeom, shell.mat);
        hopfGroup.add(mesh);
        hopfMeshes.push({ geom: tubeGeom, mat: shell.mat });
        fiberSpecs.push({ eta: shell.eta, phi, hue: sIdx === 0 ? 0.9 : sIdx === 1 ? 0.1 : 0.45 });
      }
    });

    for (let i = 0; i < pulseParticleCount; i++) {
      const spec = fiberSpecs[i % fiberSpecs.length];
      fiberAttr[i * 4] = spec.eta;
      fiberAttr[i * 4 + 1] = spec.phi;
      fiberAttr[i * 4 + 2] = ((i * 0.6180339887) % 1) * Math.PI * 2;
      fiberAttr[i * 4 + 3] = 0.75 + ((i % 7) / 7) * 0.65;
      hueAttr[i] = spec.hue;
    }

    const hopfPulseGeom = new THREE.BufferGeometry();
    hopfPulseGeom.setAttribute('position', new THREE.BufferAttribute(new Float32Array(pulseParticleCount * 3), 3));
    hopfPulseGeom.setAttribute('aFiber', new THREE.BufferAttribute(fiberAttr, 4));
    hopfPulseGeom.setAttribute('aHue', new THREE.BufferAttribute(hueAttr, 1));

    const hopfPulseUniforms = {
      uTime: { value: 0 },
      uPixelRatio: { value: dpr },
    };
    const hopfPulseMat = new THREE.ShaderMaterial({
      vertexShader: HOPF_PULSE_VERTEX,
      fragmentShader: HOPF_PULSE_FRAGMENT,
      uniforms: hopfPulseUniforms,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const hopfPulses = new THREE.Points(hopfPulseGeom, hopfPulseMat);
    hopfGroup.add(hopfPulses);

    // -------------------------------------------------------------
    // GROUP 3: Relativistic String Worldsheet X^mu(tau, sigma)
    // -------------------------------------------------------------
    const wsGroup = new THREE.Group();
    scene.add(wsGroup);

    const SEG_TAU = 48;
    const SEG_SIGMA = 44;
    const wsVertCount = (SEG_TAU + 1) * (SEG_SIGMA + 1);
    const wsPos = new Float32Array(wsVertCount * 3);
    const wsCol = new Float32Array(wsVertCount * 3);
    const wsIdx: number[] = [];

    for (let it = 0; it < SEG_TAU; it++) {
      for (let is = 0; is < SEG_SIGMA; is++) {
        const a = it * (SEG_SIGMA + 1) + is;
        const b = (it + 1) * (SEG_SIGMA + 1) + is;
        const c = (it + 1) * (SEG_SIGMA + 1) + (is + 1);
        const d = it * (SEG_SIGMA + 1) + (is + 1);
        wsIdx.push(a, b, d, b, c, d);
      }
    }

    const wsGeom = new THREE.BufferGeometry();
    wsGeom.setAttribute('position', new THREE.BufferAttribute(wsPos, 3));
    wsGeom.setAttribute('color', new THREE.BufferAttribute(wsCol, 3));
    wsGeom.setIndex(wsIdx);

    const wsMat = new THREE.MeshPhysicalMaterial({
      color: 0xf4c46c,
      emissive: 0x3b2406,
      emissiveIntensity: 0.35,
      metalness: 0.32,
      roughness: 0.2,
      clearcoat: 1.0,
      transmission: 0.28,
      side: THREE.DoubleSide,
      vertexColors: true,
      transparent: true,
      opacity: 0.88,
    });
    const wsMesh = new THREE.Mesh(wsGeom, wsMat);
    wsGroup.add(wsMesh);

    // Worldsheet active leading string curve + wireframe ribs
    const wsWirePtsCount = (Math.floor(SEG_TAU / 4) + 1) * SEG_SIGMA * 2;
    const wsWirePos = new Float32Array(wsWirePtsCount * 3);
    const wsWireGeom = new THREE.BufferGeometry();
    wsWireGeom.setAttribute('position', new THREE.BufferAttribute(wsWirePos, 3));
    const wsWireMat = new THREE.LineBasicMaterial({
      color: 0xffe29e,
      transparent: true,
      opacity: 0.38,
    });
    const wsWire = new THREE.LineSegments(wsWireGeom, wsWireMat);
    wsGroup.add(wsWire);

    // Highlighted active string line along tau = 0
    const activeStringPts = new Float32Array((SEG_SIGMA + 1) * 3);
    const activeStringGeom = new THREE.BufferGeometry();
    activeStringGeom.setAttribute('position', new THREE.BufferAttribute(activeStringPts, 3));
    const activeStringMat = new THREE.LineBasicMaterial({
      color: 0x46d6e8,
      transparent: true,
      opacity: 0.95,
    });
    const activeStringLine = new THREE.Line(activeStringGeom, activeStringMat);
    wsGroup.add(activeStringLine);

    const wsChampagne = new THREE.Color('#F4C46C');
    const wsGold = new THREE.Color('#FFE29E');
    const wsCyan = new THREE.Color('#46D6E8');
    const wsCoral = new THREE.Color('#FF8563');
    const wsTmpCol = new THREE.Color();

    const updateWorldsheet = (timeNow: number) => {
      const { harmonicN: n, tension: T, closedString: isClosed } = paramsRef.current;
      const omega = 1.65 * Math.sqrt(T) * (0.65 + 0.35 * n);
      const posAttr = wsGeom.getAttribute('position') as THREE.BufferAttribute;
      const colAttr = wsGeom.getAttribute('color') as THREE.BufferAttribute;
      const wPosAttr = wsWireGeom.getAttribute('position') as THREE.BufferAttribute;
      const actAttr = activeStringGeom.getAttribute('position') as THREE.BufferAttribute;

      const amp = 0.42 / Math.pow(n, 0.18);

      for (let it = 0; it <= SEG_TAU; it++) {
        const uTau = it / SEG_TAU; // 0..1
        const tau = (uTau - 0.5) * 4.6;
        const phaseTime = omega * (tau - timeNow * 0.55);

        for (let is = 0; is <= SEG_SIGMA; is++) {
          const uSig = is / SEG_SIGMA;
          const idx = it * (SEG_SIGMA + 1) + is;
          let x = 0;
          let y = 0;
          let z = 0;
          let waveMag = 0;

          if (isClosed) {
            // Closed string loop worldsheet cylinder with rotating n-lobed vibrational wave
            const theta = uSig * Math.PI * 2;
            const radialOsc = amp * Math.cos(n * theta - phaseTime);
            const r = 1.25 + radialOsc + 0.16 * Math.sin(tau * 1.1);
            x = Math.cos(theta) * r;
            z = tau;
            y = Math.sin(theta) * r + 0.25 * amp * Math.sin(n * theta + phaseTime);
            waveMag = radialOsc / Math.max(0.01, amp);
          } else {
            // Open string standing wave y(x, t) = A sin(n * pi * x / L) cos(omega * t)
            const sigma = uSig * Math.PI;
            const env = Math.sin(n * sigma);
            const xSpan = (uSig - 0.5) * 4.4;
            const yDisp = amp * 1.45 * env * Math.cos(phaseTime);
            const zCurve = tau;
            x = xSpan;
            y = yDisp;
            z = zCurve;
            waveMag = env * Math.cos(phaseTime);
          }

          posAttr.setXYZ(idx, x, y, z);

          const tNorm = THREE.MathUtils.clamp(0.5 + waveMag * 0.5, 0, 1);
          wsTmpCol.copy(wsChampagne);
          if (tNorm > 0.55) {
            wsTmpCol.lerp(wsGold, (tNorm - 0.55) * 1.8);
            wsTmpCol.lerp(wsCyan, (tNorm - 0.72) * 0.8);
          } else {
            wsTmpCol.lerp(wsCoral, (0.55 - tNorm) * 0.9);
          }
          colAttr.setXYZ(idx, wsTmpCol.r, wsTmpCol.g, wsTmpCol.b);

          if (it === Math.floor(SEG_TAU / 2)) {
            actAttr.setXYZ(is, x, y + 0.018, z);
          }
        }
      }

      // Update cross-section wireframe ribs every 4th tau slice
      let wIdx = 0;
      for (let it = 0; it <= SEG_TAU; it += 4) {
        for (let is = 0; is < SEG_SIGMA; is++) {
          const i0 = it * (SEG_SIGMA + 1) + is;
          const i1 = i0 + 1;
          wPosAttr.setXYZ(wIdx++, posAttr.getX(i0), posAttr.getY(i0), posAttr.getZ(i0));
          wPosAttr.setXYZ(wIdx++, posAttr.getX(i1), posAttr.getY(i1), posAttr.getZ(i1));
        }
      }

      posAttr.needsUpdate = true;
      colAttr.needsUpdate = true;
      wPosAttr.needsUpdate = true;
      actAttr.needsUpdate = true;
      wsGeom.computeVertexNormals();
    };

    updateWorldsheet(0);

    // ResizeObserver
    let width = initW;
    let height = initH;
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const nw = Math.max(260, Math.floor(entry.contentRect.width));
        const nh = Math.max(240, Math.floor(entry.contentRect.height));
        if (nw !== width || nh !== height) {
          width = nw;
          height = nh;
          camera.aspect = width / height;
          camera.updateProjectionMatrix();
          renderer.setSize(width, height);
        }
      }
    });
    resizeObserver.observe(host);

    let hidden = document.hidden;
    const onVisChange = () => {
      hidden = document.hidden;
    };
    document.addEventListener('visibilitychange', onVisChange);

    let rafId = 0;
    let lastNow = performance.now();
    let simTime = 0;
    let hopfPhaseTime = 0;
    let lastResetSeen = resetSignalRef.current;

    const animate = (now: number) => {
      rafId = requestAnimationFrame(animate);
      const dt = Math.min(0.05, Math.max(0.001, (now - lastNow) / 1000));
      lastNow = now;
      if (hidden) return;

      if (resetSignalRef.current !== lastResetSeen) {
        lastResetSeen = resetSignalRef.current;
        camera.position.set(4.5, 2.7, 5.4);
        controls.target.set(0, 0, 0);
        controls.update();
      }

      const p = paramsRef.current;
      const activeAnim = p.playing && !p.reducedMotion;

      cyGroup.visible = p.mode === 'calabi-yau';
      hopfGroup.visible = p.mode === 'hopf';
      wsGroup.visible = p.mode === 'worldsheet';

      controls.autoRotate = activeAnim;
      controls.update();

      if (activeAnim) {
        simTime += dt;
        hopfPhaseTime += dt * p.hopfFlowSpeed;
        if (p.mode === 'calabi-yau') {
          cyGroup.rotation.y += dt * 0.12;
        } else if (p.mode === 'hopf') {
          hopfGroup.rotation.y += dt * 0.15;
          hopfPulseUniforms.uTime.value = hopfPhaseTime;
        } else if (p.mode === 'worldsheet') {
          updateWorldsheet(simTime);
        }
      } else if (p.mode === 'worldsheet') {
        updateWorldsheet(simTime);
      }

      renderer.render(scene, camera);
    };

    rafId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
      document.removeEventListener('visibilitychange', onVisChange);
      controls.dispose();

      // Dispose Calabi-Yau
      cyMesh.geometry.dispose();
      cyWire.geometry.dispose();
      cyMaterial.dispose();
      cyWireMaterial.dispose();

      // Dispose Hopf
      hopfMeshes.forEach((item) => item.geom.dispose());
      hopfGoldMat.dispose();
      hopfCyanMat.dispose();
      hopfCoralMat.dispose();
      hopfPulseGeom.dispose();
      hopfPulseMat.dispose();

      // Dispose Worldsheet
      wsGeom.dispose();
      wsMat.dispose();
      wsWireGeom.dispose();
      wsWireMat.dispose();
      activeStringGeom.dispose();
      activeStringMat.dispose();

      // Dispose Equator & Environment
      equatorRingGeom.dispose();
      equatorRingMat.dispose();
      envRT.dispose();
      pmremGenerator.dispose();

      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [isNearViewport]);

  const activeHarmonic = useMemo(
    () => HARMONIC_MODES.find((h) => h.n === harmonicN) ?? HARMONIC_MODES[0],
    [harmonicN]
  );

  const worldsheetEnergy = useMemo(
    () => (harmonicN * Math.sqrt(tension)).toFixed(2),
    [harmonicN, tension]
  );

  const sheetCount = symmetryN * symmetryN;

  return (
    <div
      ref={containerRef}
      className="relative w-full rounded-2xl overflow-hidden bg-[#060609]"
      style={{
        border: '1px solid rgba(244, 196, 108, 0.17)',
        boxShadow:
          'inset 0 1px 0 rgba(255, 232, 178, 0.22), 0 28px 64px -26px rgba(0, 0, 0, 0.96)',
      }}
    >
      {/* Top Mode Switcher Strip */}
      <div
        className="relative z-20 flex flex-wrap items-center justify-between gap-2.5 px-4 py-3 bg-[#0B0C12]/90 backdrop-blur-md"
        style={{ borderBottom: '1px solid rgba(244, 196, 108, 0.17)' }}
      >
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#FFE29E] shadow-[0_0_10px_#FFE29E]" />
          <span className="font-mono-data text-[10.5px] uppercase tracking-[0.18em] text-[#FFE29E]">
            Extra-Dimensional Geometry Lab
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {(
            [
              { id: 'calabi-yau', label: compact ? 'Calabi-Yau' : '1. Calabi-Yau (z₁ⁿ + z₂ⁿ = 1)' },
              { id: 'hopf', label: compact ? 'Hopf S³→S²' : '2. Hopf Fibration (S³ → S²)' },
              { id: 'worldsheet', label: compact ? 'Worldsheet' : '3. String Worldsheet Xᵘ(τ,σ)' },
            ] as { id: CalabiMode; label: string }[]
          ).map((item) => {
            const active = mode === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setMode(item.id)}
                className={`px-3 py-1 rounded-full font-mono-data text-[10.5px] border transition-all ${
                  active
                    ? 'text-[#060609] font-semibold'
                    : 'bg-[#11131C]/85 text-[#A8B2C6] hover:text-[#F7F4EC]'
                }`}
                style={{
                  backgroundColor: active ? '#F4C46C' : undefined,
                  borderColor: active ? '#FFE29E' : 'rgba(244, 196, 108, 0.17)',
                  boxShadow: active ? '0 0 18px -4px rgba(244, 196, 108, 0.7)' : undefined,
                }}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setPlaying((p) => !p)}
            aria-label={playing ? 'Pause rotation and motion' : 'Play rotation and motion'}
            className="p-1.5 rounded-full border border-[#F4C46C]/25 bg-[#11131C] text-[#F7F4EC] hover:border-[#F4C46C]/60"
          >
            {playing ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>
          <button
            type="button"
            onClick={handleResetView}
            aria-label="Reset 3D camera"
            className="p-1.5 rounded-full border border-[#F4C46C]/25 bg-[#11131C] text-[#A8B2C6] hover:text-[#F7F4EC]"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Interactive 3D Canvas + Live Telemetry Overlay */}
      <div className={`relative w-full ${resolvedHeight} bg-[#060609]`}>
        <WebGLErrorBoundary
          fallbackTitle="Manifold Lab WebGL Unavailable"
          fallbackDescription="Hardware WebGL could not start for the 3D manifold laboratory."
        >
          {webglError ? (
            <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-[#060609]">
              <p className="font-serif-editorial text-lg text-[#F7F4EC] mb-1">
                3D Manifold Context Unavailable
              </p>
              <p className="font-mono-data text-xs text-[#A8B2C6] max-w-md">{webglError}</p>
            </div>
          ) : (
            <div
              ref={canvasHostRef}
              className="w-full h-full cursor-grab active:cursor-grabbing select-none"
              aria-label="Interactive 3D Calabi-Yau, Hopf fibration, and String Worldsheet laboratory"
            />
          )}
        </WebGLErrorBoundary>

        {!isNearViewport && !webglError && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-[#060609]">
            <span className="font-mono-data text-xs text-[#F4C46C]/70">
              Preparing Calabi-Yau 3D Laboratory...
            </span>
          </div>
        )}

        {/* Top-Left Formula Telemetry Chip */}
        <div
          className="pointer-events-none absolute top-3 left-3 z-10 px-3 py-2 rounded-xl bg-[#0B0C12]/88 backdrop-blur-md max-w-[300px]"
          style={{
            border: '1px solid rgba(244, 196, 108, 0.2)',
            boxShadow: 'inset 0 1px 0 rgba(255, 232, 178, 0.18)',
          }}
        >
          {mode === 'calabi-yau' && (
            <div className="space-y-0.5">
              <span className="font-mono-data text-[9.5px] uppercase tracking-wider text-[#F4C46C] block">
                Complex Algebraic Patch · {sheetCount} Sheets
              </span>
              <MathTex
                tex={`z_1^{${symmetryN}} + z_2^{${symmetryN}} = 1,\\; \\alpha = ${alpha.toFixed(2)}\\text{ rad}`}
                className="text-xs text-[#F7F4EC]"
              />
            </div>
          )}
          {mode === 'hopf' && (
            <div className="space-y-0.5">
              <span className="font-mono-data text-[9.5px] uppercase tracking-wider text-[#46D6E8] block">
                Stereographic Fiber Bundle · 32 Linked Loops
              </span>
              <MathTex
                tex="S^1 \hookrightarrow S^3 \xrightarrow{\pi} S^2"
                className="text-xs text-[#F7F4EC]"
              />
            </div>
          )}
          {mode === 'worldsheet' && (
            <div className="space-y-0.5">
              <span
                className="font-mono-data text-[9.5px] uppercase tracking-wider block"
                style={{ color: activeHarmonic.accent }}
              >
                {activeHarmonic.particle} · {activeHarmonic.spin}
              </span>
              <MathTex
                tex={`y(\\sigma,\\tau) = A\\sin(${harmonicN}\\sigma)\\cos(\\omega\\tau),\\; E_${harmonicN}\\propto ${worldsheetEnergy}`}
                className="text-xs text-[#F7F4EC]"
              />
            </div>
          )}
        </div>

        {/* Bottom Drag Hint */}
        <div
          className="pointer-events-none absolute bottom-3 left-3 z-10 px-2.5 py-1 rounded-full bg-[#0B0C12]/82 font-mono-data text-[10px] text-[#A8B2C6]"
          style={{ border: '1px solid rgba(244, 196, 108, 0.18)' }}
        >
          Drag to orbit · Scroll to zoom · Right-drag to pan
        </div>
      </div>

      {/* Interactive Control Deck (Full Laboratory Mode) */}
      {!compact && (
        <div
          className="p-4 sm:p-5 bg-[#0B0C12] space-y-4"
          style={{ borderTop: '1px solid rgba(244, 196, 108, 0.17)' }}
        >
          {mode === 'calabi-yau' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
              <div className="p-3 rounded-xl bg-[#11131C] border border-[#F4C46C]/20 space-y-2">
                <div className="flex items-center justify-between font-mono-data text-[11px]">
                  <span className="text-[#FFE29E] flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-[#F4C46C]" />
                    Symmetry Exponent n
                  </span>
                  <span className="text-[#46D6E8]">{sheetCount} sheets</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {[2, 3, 4, 5, 6].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setSymmetryN(val)}
                      className={`flex-1 py-1.5 rounded-lg font-mono-data text-xs border transition-all ${
                        symmetryN === val
                          ? 'bg-[#F4C46C] text-[#060609] font-semibold border-[#FFE29E]'
                          : 'bg-[#0B0C12] text-[#A8B2C6] border-[#F4C46C]/20 hover:text-[#F7F4EC]'
                      }`}
                    >
                      n={val}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#11131C] border border-[#F4C46C]/20 space-y-2">
                <div className="flex items-center justify-between font-mono-data text-[11px]">
                  <span className="text-[#FFE29E]">Projection Phase α</span>
                  <span className="text-[#F4C46C]">{alpha.toFixed(2)} rad</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={Math.PI * 2}
                  step={0.02}
                  value={alpha}
                  onChange={(e) => setAlpha(parseFloat(e.target.value))}
                  aria-label="Calabi-Yau projection phase alpha"
                  className="meridian-slider"
                  style={{ ['--slider-accent' as string]: '#F4C46C' }}
                />
                <p className="text-[11px] text-[#A8B2C6]">
                  Rotates which slice of 4D imaginary space projects into 3D depth.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-[#11131C] border border-[#F4C46C]/20 space-y-2">
                <div className="flex items-center justify-between font-mono-data text-[11px]">
                  <span className="text-[#FFE29E]">Helical Twist</span>
                  <span className="text-[#FF8563]">{twist.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min={-1.4}
                  max={1.4}
                  step={0.04}
                  value={twist}
                  onChange={(e) => setTwist(parseFloat(e.target.value))}
                  aria-label="Calabi-Yau helical twist"
                  className="meridian-slider"
                  style={{ ['--slider-accent' as string]: '#FF8563' }}
                />
                <p className="text-[11px] text-[#A8B2C6]">
                  Twists the complex roots of unity around the manifold spine.
                </p>
              </div>
            </div>
          )}

          {mode === 'hopf' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
              <div className="p-3.5 rounded-xl bg-[#11131C] border border-[#F4C46C]/20 space-y-2">
                <div className="flex items-center justify-between font-mono-data text-[11px]">
                  <span className="text-[#46D6E8]">Fiber Pulse Speed</span>
                  <span className="text-[#FFE29E]">{hopfFlowSpeed.toFixed(2)}×</span>
                </div>
                <input
                  type="range"
                  min={0.2}
                  max={2.6}
                  step={0.05}
                  value={hopfFlowSpeed}
                  onChange={(e) => setHopfFlowSpeed(parseFloat(e.target.value))}
                  aria-label="Hopf fiber pulse speed"
                  className="meridian-slider"
                  style={{ ['--slider-accent' as string]: '#46D6E8' }}
                />
              </div>
              <div className="p-3.5 rounded-xl bg-[#11131C] border border-[#F4C46C]/20 text-xs text-[#A8B2C6] leading-relaxed">
                Every circle here is a fiber <MathTex tex="S^1" /> in 4D hypersphere{' '}
                <MathTex tex="S^3" /> projected stereographically into 3D. Every pair of rings
                links once—never colliding—showing how extra dimensions weave smooth topology.
              </div>
            </div>
          )}

          {mode === 'worldsheet' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
              <div className="lg:col-span-7 p-3 rounded-xl bg-[#11131C] border border-[#F4C46C]/20 space-y-2">
                <div className="flex items-center justify-between font-mono-data text-[11px]">
                  <span className="text-[#FFE29E]">Harmonic Mode n (Standing Wave Overtones)</span>
                  <span style={{ color: activeHarmonic.accent }}>{activeHarmonic.particle}</span>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                  {HARMONIC_MODES.map((hm) => {
                    const active = harmonicN === hm.n;
                    return (
                      <button
                        key={hm.n}
                        type="button"
                        onClick={() => setHarmonicN(hm.n)}
                        className={`px-2 py-1.5 rounded-lg font-mono-data text-[11px] border transition-all ${
                          active
                            ? 'text-[#060609] font-semibold'
                            : 'bg-[#0B0C12] text-[#A8B2C6] border-[#F4C46C]/20 hover:text-[#F7F4EC]'
                        }`}
                        style={{
                          backgroundColor: active ? hm.accent : undefined,
                          borderColor: active ? hm.accent : undefined,
                        }}
                      >
                        n={hm.n}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="lg:col-span-3 p-3 rounded-xl bg-[#11131C] border border-[#F4C46C]/20 space-y-2">
                <div className="flex items-center justify-between font-mono-data text-[11px]">
                  <span className="text-[#FFE29E]">String Tension T</span>
                  <span className="text-[#45E6A6]">{tension.toFixed(2)} T₀</span>
                </div>
                <input
                  type="range"
                  min={0.4}
                  max={2.4}
                  step={0.05}
                  value={tension}
                  onChange={(e) => setTension(parseFloat(e.target.value))}
                  aria-label="Relativistic string tension T"
                  className="meridian-slider"
                  style={{ ['--slider-accent' as string]: '#45E6A6' }}
                />
              </div>

              <div className="lg:col-span-2 flex lg:flex-col gap-1.5">
                <button
                  type="button"
                  onClick={() => setClosedString(true)}
                  className={`flex-1 py-2 px-2.5 rounded-lg font-mono-data text-[11px] border transition-all ${
                    closedString
                      ? 'bg-[#F4C46C]/20 text-[#FFE29E] border-[#F4C46C]'
                      : 'bg-[#0B0C12] text-[#A8B2C6] border-[#F4C46C]/20'
                  }`}
                >
                  Closed Loop
                </button>
                <button
                  type="button"
                  onClick={() => setClosedString(false)}
                  className={`flex-1 py-2 px-2.5 rounded-lg font-mono-data text-[11px] border transition-all ${
                    !closedString
                      ? 'bg-[#46D6E8]/20 text-[#46D6E8] border-[#46D6E8]'
                      : 'bg-[#0B0C12] text-[#A8B2C6] border-[#F4C46C]/20'
                  }`}
                >
                  Open String
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
