import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Layers, RotateCcw } from 'lucide-react';
import { MathTex } from '../../components/MathTex';
import { WebGLErrorBoundary } from '../../components/WebGLErrorBoundary';
import { useReducedMotion } from '../../hooks/useReducedMotion';

export interface TensorRiemann3DProps {
  compact?: boolean;
  heightClass?: string;
}

type SurfacePresetId = 'paraboloid' | 'saddle' | 'gaussian' | 'wave';
type SampleRule = 'midpoint' | 'corner';

interface SurfacePreset {
  id: SurfacePresetId;
  label: string;
  formulaTex: string;
  domainLabel: string;
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
  exactIntegral: number;
  exactAbsIntegral: number;
  zVisScale: number;
  accent: string;
  evalFn: (x: number, y: number) => number;
}

// Exact (sqrt(pi) * erf(1))^2 = 2.230985124...
const GAUSSIAN_EXACT = 2.230985;

const SURFACE_PRESETS: Record<SurfacePresetId, SurfacePreset> = {
  paraboloid: {
    id: 'paraboloid',
    label: 'Paraboloid',
    formulaTex: 'z = x^2 + y^2',
    domainLabel: '[-1, 1] × [-1, 1]',
    xMin: -1,
    xMax: 1,
    yMin: -1,
    yMax: 1,
    exactIntegral: 8 / 3,
    exactAbsIntegral: 8 / 3,
    zVisScale: 0.92,
    accent: '#F4C46C',
    evalFn: (x, y) => x * x + y * y,
  },
  saddle: {
    id: 'saddle',
    label: 'Saddle',
    formulaTex: 'z = x^2 - y^2',
    domainLabel: '[-1, 1] × [-1, 1]',
    xMin: -1,
    xMax: 1,
    yMin: -1,
    yMax: 1,
    exactIntegral: 0,
    exactAbsIntegral: 4 / 3,
    zVisScale: 1.25,
    accent: '#FF8563',
    evalFn: (x, y) => x * x - y * y,
  },
  gaussian: {
    id: 'gaussian',
    label: 'Gaussian Bell',
    formulaTex: 'z = e^{-(x^2 + y^2)}',
    domainLabel: '[-1, 1] × [-1, 1]',
    xMin: -1,
    xMax: 1,
    yMin: -1,
    yMax: 1,
    exactIntegral: GAUSSIAN_EXACT,
    exactAbsIntegral: GAUSSIAN_EXACT,
    zVisScale: 1.85,
    accent: '#46D6E8',
    evalFn: (x, y) => Math.exp(-(x * x + y * y)),
  },
  wave: {
    id: 'wave',
    label: 'Wave',
    formulaTex: 'z = \\sin(x)\\cos(y)',
    domainLabel: '[0, π] × [-π/2, π/2]',
    xMin: 0,
    xMax: Math.PI,
    yMin: -Math.PI / 2,
    yMax: Math.PI / 2,
    exactIntegral: 4.0,
    exactAbsIntegral: 4.0,
    zVisScale: 1.75,
    accent: '#45E6A6',
    evalFn: (x, y) => Math.sin(x) * Math.cos(y),
  },
};

const PRESET_ORDER: SurfacePresetId[] = ['paraboloid', 'saddle', 'gaussian', 'wave'];

interface HoveredCellInfo {
  i: number;
  j: number;
  x: number;
  y: number;
  z: number;
  dV: number;
}

function colorForHeight(zVal: number): THREE.Color {
  if (zVal < 0) return new THREE.Color('#FF8563');
  if (zVal < 0.45) return new THREE.Color('#46D6E8');
  if (zVal < 0.95) return new THREE.Color('#45E6A6');
  if (zVal < 1.45) return new THREE.Color('#F4C46C');
  return new THREE.Color('#FFE29E');
}

function disposeGroupMaterialsAndGeos(group: THREE.Group, skipGeos?: Set<THREE.BufferGeometry>) {
  while (group.children.length > 0) {
    const child = group.children[0];
    group.remove(child);
    child.traverse((obj) => {
      const mesh = obj as THREE.Mesh & { geometry?: THREE.BufferGeometry; material?: THREE.Material | THREE.Material[] };
      if (mesh.geometry && (!skipGeos || !skipGeos.has(mesh.geometry))) {
        mesh.geometry.dispose();
      }
      if (mesh.material) {
        if (Array.isArray(mesh.material)) mesh.material.forEach((m) => m.dispose());
        else mesh.material.dispose();
      }
    });
  }
}

export function TensorRiemann3D({
  compact = false,
  heightClass,
}: TensorRiemann3DProps = {}): JSX.Element {
  const reducedMotion = useReducedMotion();
  const [presetId, setPresetId] = useState<SurfacePresetId>('paraboloid');
  const [gridN, setGridN] = useState(6);
  const [sampleRule, setSampleRule] = useState<SampleRule>('midpoint');
  const [showMatrixPlanes, setShowMatrixPlanes] = useState(true);
  const [showExactSurface, setShowExactSurface] = useState(true);
  const [autoSpin, setAutoSpin] = useState(true);
  const [nearViewport, setNearViewport] = useState(false);
  const [webglError, setWebglError] = useState<string | null>(null);
  const [hoveredCell, setHoveredCell] = useState<HoveredCellInfo | null>(null);

  const hostRef = useRef<HTMLDivElement | null>(null);
  const mountRef = useRef<HTMLDivElement | null>(null);

  const rebuildRef = useRef<
    ((id: SurfacePresetId, n: number, rule: SampleRule, planes: boolean, surf: boolean) => void) | null
  >(null);
  const paramsRef = useRef({ presetId, gridN, sampleRule, showMatrixPlanes, showExactSurface });
  paramsRef.current = { presetId, gridN, sampleRule, showMatrixPlanes, showExactSurface };

  const autoSpinRef = useRef(autoSpin);
  autoSpinRef.current = autoSpin;

  const preset = SURFACE_PRESETS[presetId];

  // Exact Riemann Sum Volume calculation
  const riemannStats = useMemo(() => {
    const dx = (preset.xMax - preset.xMin) / gridN;
    const dy = (preset.yMax - preset.yMin) / gridN;
    const dA = dx * dy;
    let sum = 0;
    let absSum = 0;

    for (let i = 0; i < gridN; i++) {
      const x = preset.xMin + (sampleRule === 'midpoint' ? i + 0.5 : i) * dx;
      for (let j = 0; j < gridN; j++) {
        const y = preset.yMin + (sampleRule === 'midpoint' ? j + 0.5 : j) * dy;
        const z = preset.evalFn(x, y);
        sum += z * dA;
        absSum += Math.abs(z) * dA;
      }
    }

    const diff = Math.abs(sum - preset.exactIntegral);
    const absDiff = Math.abs(absSum - preset.exactAbsIntegral);
    const denom = Math.max(0.001, preset.exactAbsIntegral);
    const accuracyPct = Math.max(
      0,
      Math.min(100, (1 - (presetId === 'saddle' ? absDiff : diff) / denom) * 100)
    );

    return { sum, absSum, diff, absDiff, dA, accuracyPct };
  }, [preset, presetId, gridN, sampleRule]);

  // IntersectionObserver with rootMargin 200px so WebGL mounts ONLY near viewport
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
      setWebglError(err instanceof Error ? err.message : 'WebGL context could not be initialized.');
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
    camera.position.set(4.5, 3.85, 4.5);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.065;
    controls.rotateSpeed = 0.78;
    controls.minDistance = 3.2;
    controls.maxDistance = 12.5;
    controls.maxPolarAngle = Math.PI * 0.62;
    controls.target.set(0, 0.65, 0);

    // Lightweight studio PMREM environment in Aurea Gold & Cyan
    const pmrem = new THREE.PMREMGenerator(renderer);
    const envScene = new THREE.Scene();
    envScene.background = new THREE.Color(0x060609);
    const envGeo = new THREE.PlaneGeometry(8, 8);
    const envGold = new THREE.MeshBasicMaterial({ color: 0xffe29e, side: THREE.DoubleSide });
    const envCyan = new THREE.MeshBasicMaterial({ color: 0x46d6e8, side: THREE.DoubleSide });
    const envPanel1 = new THREE.Mesh(envGeo, envGold);
    envPanel1.position.set(4, 5, 4);
    envPanel1.lookAt(0, 0, 0);
    const envPanel2 = new THREE.Mesh(envGeo, envCyan);
    envPanel2.position.set(-5, 3, -4);
    envPanel2.lookAt(0, 0, 0);
    envScene.add(envPanel1, envPanel2);
    const envRT = pmrem.fromScene(envScene);
    scene.environment = envRT.texture;

    // Aurea Gold / Cyan / Emerald Rim Lighting
    const ambient = new THREE.AmbientLight(0xf7f4ec, 0.42);
    const keyLight = new THREE.DirectionalLight(0xffe29e, 1.35);
    keyLight.position.set(5, 7, 4);
    const cyanRim = new THREE.DirectionalLight(0x46d6e8, 0.95);
    cyanRim.position.set(-5, 3, -4);
    const emeraldRim = new THREE.DirectionalLight(0x45e6a6, 0.7);
    emeraldRim.position.set(3, -2, -5);
    scene.add(ambient, keyLight, cyanRim, emeraldRim);

    // Circular Observatory Base Rings (inspired by frames2/f_06.jpg)
    const baseGroup = new THREE.Group();
    scene.add(baseGroup);

    const floorGeo = new THREE.CircleGeometry(3.05, 64);
    floorGeo.rotateX(-Math.PI / 2);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x0b0c12,
      roughness: 0.85,
      metalness: 0.2,
    });
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.position.y = -0.012;
    baseGroup.add(floorMesh);

    const ringRadii = [2.15, 2.55, 2.95];
    const ringGeos: THREE.BufferGeometry[] = [];
    const ringMats: THREE.Material[] = [];
    ringRadii.forEach((rad, idx) => {
      const rg = new THREE.RingGeometry(rad - 0.01, rad + 0.01, 96);
      rg.rotateX(-Math.PI / 2);
      const rm = new THREE.MeshBasicMaterial({
        color: idx === 1 ? 0x46d6e8 : 0xf4c46c,
        transparent: true,
        opacity: idx === 0 ? 0.35 : 0.18,
        side: THREE.DoubleSide,
      });
      ringGeos.push(rg);
      ringMats.push(rm);
      baseGroup.add(new THREE.Mesh(rg, rm));
    });

    // Ambient floating golden particle motes
    const moteCount = 140;
    const motePos = new Float32Array(moteCount * 3);
    const motePhase = new Float32Array(moteCount);
    for (let m = 0; m < moteCount; m++) {
      const ang = (m * 2.39996) % (Math.PI * 2);
      const rad = 0.3 + ((m * 0.61803) % 1) * 2.3;
      motePos[m * 3] = Math.cos(ang) * rad;
      motePos[m * 3 + 1] = ((m * 0.37) % 1) * 2.3;
      motePos[m * 3 + 2] = Math.sin(ang) * rad;
      motePhase[m] = m * 0.43;
    }
    const moteGeo = new THREE.BufferGeometry();
    moteGeo.setAttribute('position', new THREE.BufferAttribute(motePos, 3));
    const moteMat = new THREE.PointsMaterial({
      color: 0xffe29e,
      size: 0.045,
      transparent: true,
      opacity: 0.55,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const motes = new THREE.Points(moteGeo, moteMat);
    scene.add(motes);

    // Shared unit primitives for prisms
    const unitBoxGeo = new THREE.BoxGeometry(1, 1, 1);
    const unitEdgesGeo = new THREE.EdgesGeometry(unitBoxGeo);
    const beaconGeo = new THREE.SphereGeometry(0.032, 10, 10);
    const sharedGeos = new Set<THREE.BufferGeometry>([unitBoxGeo, unitEdgesGeo, beaconGeo]);

    const prismGroup = new THREE.Group();
    const matrixGroup = new THREE.Group();
    const surfaceGroup = new THREE.Group();
    scene.add(matrixGroup, prismGroup, surfaceGroup);

    let prismMeshes: THREE.Mesh[] = [];
    let apexDiamond: THREE.Mesh | null = null;
    let hoveredMesh: THREE.Mesh | null = null;
    let lastHoveredKey = '';

    const SPAN = 2.6; // World [-1.3, 1.3] footprint

    const buildSceneGeometry = (
      id: SurfacePresetId,
      n: number,
      rule: SampleRule,
      showPlanes: boolean,
      showSurf: boolean
    ) => {
      disposeGroupMaterialsAndGeos(prismGroup, sharedGeos);
      disposeGroupMaterialsAndGeos(matrixGroup);
      disposeGroupMaterialsAndGeos(surfaceGroup);
      prismMeshes = [];
      apexDiamond = null;
      hoveredMesh = null;
      lastHoveredKey = '';
      setHoveredCell(null);

      const p = SURFACE_PRESETS[id];
      const dx = (p.xMax - p.xMin) / n;
      const dy = (p.yMax - p.yMin) / n;
      const dA = dx * dy;
      const cellSpan = SPAN / n;
      const colFoot = cellSpan * 0.88;

      // 1. Stepped Riemann Prism Stacks (frames2/f_06.jpg aesthetic)
      for (let i = 0; i < n; i++) {
        const xSample = p.xMin + (rule === 'midpoint' ? i + 0.5 : i) * dx;
        const wx = -SPAN * 0.5 + (i + 0.5) * cellSpan;

        for (let j = 0; j < n; j++) {
          const ySample = p.yMin + (rule === 'midpoint' ? j + 0.5 : j) * dy;
          const wz = -SPAN * 0.5 + (j + 0.5) * cellSpan;
          const fVal = p.evalFn(xSample, ySample);
          const worldH = Math.max(0.035, Math.abs(fVal) * p.zVisScale);
          const signY = fVal >= 0 ? 1 : -1;
          const col = colorForHeight(fVal);

          const mat = new THREE.MeshPhysicalMaterial({
            color: col,
            emissive: col,
            emissiveIntensity: 0.16,
            roughness: 0.24,
            metalness: 0.32,
            clearcoat: 0.7,
            transparent: true,
            opacity: 0.86,
          });

          const box = new THREE.Mesh(unitBoxGeo, mat);
          box.scale.set(colFoot, worldH, colFoot);
          box.position.set(wx, signY * worldH * 0.5, wz);
          box.userData = {
            i: i + 1,
            j: j + 1,
            x: xSample,
            y: ySample,
            z: fVal,
            dV: fVal * dA,
          };
          prismGroup.add(box);
          prismMeshes.push(box);

          const edgeMat = new THREE.LineBasicMaterial({
            color: fVal < 0 ? 0xffb399 : 0xffe29e,
            transparent: true,
            opacity: 0.52,
          });
          const edges = new THREE.LineSegments(unitEdgesGeo, edgeMat);
          edges.scale.set(colFoot * 1.002, worldH * 1.002, colFoot * 1.002);
          edges.position.copy(box.position);
          prismGroup.add(edges);

          // Sample point beacon on the prism roof
          const beaconMat = new THREE.MeshBasicMaterial({
            color: 0xffffff,
          });
          const beacon = new THREE.Mesh(beaconGeo, beaconMat);
          const bx =
            rule === 'midpoint'
              ? wx
              : wx - colFoot * 0.44;
          const bz =
            rule === 'midpoint'
              ? wz
              : wz - colFoot * 0.44;
          beacon.position.set(bx, signY * worldH + signY * 0.015, bz);
          prismGroup.add(beacon);
        }
      }

      // 2. Stacked Isometric Tensor Matrix Grid Planes (frames2/f_09.jpg aesthetic)
      if (showPlanes) {
        const planeLevels = id === 'saddle' ? [0, 0.95] : [0, 0.95, 1.92];
        planeLevels.forEach((py, lvlIdx) => {
          const grid = new THREE.GridHelper(
            SPAN,
            n,
            lvlIdx === 0 ? 0xf4c46c : 0x46d6e8,
            lvlIdx === 0 ? 0x6b562d : 0x265966
          );
          grid.position.y = py;
          if (Array.isArray(grid.material)) {
            grid.material.forEach((m) => {
              m.transparent = true;
              m.opacity = lvlIdx === 0 ? 0.65 : 0.34;
            });
          } else {
            grid.material.transparent = true;
            grid.material.opacity = lvlIdx === 0 ? 0.65 : 0.34;
          }
          matrixGroup.add(grid);

          // Subtle translucent tensor slice glass sheet
          const sheetGeo = new THREE.PlaneGeometry(SPAN, SPAN);
          sheetGeo.rotateX(-Math.PI / 2);
          const sheetMat = new THREE.MeshBasicMaterial({
            color: lvlIdx === 1 ? 0x46d6e8 : 0xf4c46c,
            transparent: true,
            opacity: lvlIdx === 0 ? 0.05 : 0.035,
            side: THREE.DoubleSide,
            depthWrite: false,
          });
          const sheet = new THREE.Mesh(sheetGeo, sheetMat);
          sheet.position.y = py - 0.002;
          matrixGroup.add(sheet);
        });

        // Glowing Apex Voxel Beacon (matching the summit diamond in f_09.jpg)
        const apexGeo = new THREE.OctahedronGeometry(0.11, 0);
        const apexMat = new THREE.MeshBasicMaterial({
          color: 0xffe29e,
        });
        apexDiamond = new THREE.Mesh(apexGeo, apexMat);
        apexDiamond.position.set(0, 2.16, 0);
        matrixGroup.add(apexDiamond);
      }

      // 3. Smooth Continuous Target Surface Wireframe Overlay
      if (showSurf) {
        const segs = 32;
        const surfGeo = new THREE.PlaneGeometry(SPAN, SPAN, segs, segs);
        surfGeo.rotateX(-Math.PI / 2);
        const posAttr = surfGeo.attributes.position as THREE.BufferAttribute;
        for (let k = 0; k < posAttr.count; k++) {
          const wx = posAttr.getX(k);
          const wz = posAttr.getZ(k);
          const u = (wx + SPAN * 0.5) / SPAN;
          const v = (wz + SPAN * 0.5) / SPAN;
          const mathX = p.xMin + u * (p.xMax - p.xMin);
          const mathY = p.yMin + v * (p.yMax - p.yMin);
          const mathZ = p.evalFn(mathX, mathY);
          posAttr.setY(k, mathZ * p.zVisScale);
        }
        surfGeo.computeVertexNormals();

        const surfMat = new THREE.MeshBasicMaterial({
          color: 0xffe29e,
          wireframe: true,
          transparent: true,
          opacity: 0.24,
        });
        const surfMesh = new THREE.Mesh(surfGeo, surfMat);
        surfaceGroup.add(surfMesh);
      }
    };

    rebuildRef.current = buildSceneGeometry;
    const init = paramsRef.current;
    buildSceneGeometry(
      init.presetId,
      init.gridN,
      init.sampleRule,
      init.showMatrixPlanes,
      init.showExactSurface
    );

    // Hover Raycasting
    const raycaster = new THREE.Raycaster();
    const pointerNdc = new THREE.Vector2(-99, -99);

    const onPointerMove = (e: PointerEvent) => {
      const r = renderer.domElement.getBoundingClientRect();
      pointerNdc.x = ((e.clientX - r.left) / Math.max(1, r.width)) * 2 - 1;
      pointerNdc.y = -(((e.clientY - r.top) / Math.max(1, r.height)) * 2 - 1);

      raycaster.setFromCamera(pointerNdc, camera);
      const hits = raycaster.intersectObjects(prismMeshes, false);
      const hitMesh = hits.length > 0 ? (hits[0].object as THREE.Mesh) : null;

      if (hoveredMesh && hoveredMesh !== hitMesh) {
        const prevMat = hoveredMesh.material as THREE.MeshPhysicalMaterial;
        prevMat.emissiveIntensity = 0.16;
      }
      hoveredMesh = hitMesh;

      if (hitMesh) {
        const mat = hitMesh.material as THREE.MeshPhysicalMaterial;
        mat.emissiveIntensity = 0.72;
        const ud = hitMesh.userData as HoveredCellInfo;
        const key = `${ud.i}:${ud.j}:${ud.z.toFixed(3)}`;
        if (key !== lastHoveredKey) {
          lastHoveredKey = key;
          setHoveredCell(ud);
        }
      } else if (lastHoveredKey !== '') {
        lastHoveredKey = '';
        setHoveredCell(null);
      }
    };

    const onPointerLeave = () => {
      if (hoveredMesh) {
        (hoveredMesh.material as THREE.MeshPhysicalMaterial).emissiveIntensity = 0.16;
        hoveredMesh = null;
      }
      if (lastHoveredKey !== '') {
        lastHoveredKey = '';
        setHoveredCell(null);
      }
    };

    const dom = renderer.domElement;
    dom.addEventListener('pointermove', onPointerMove);
    dom.addEventListener('pointerleave', onPointerLeave);

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
    let elapsed = 0;

    const tick = (now: number) => {
      const dt = Math.min(0.05, Math.max(0.001, (now - lastNow) / 1000));
      lastNow = now;
      elapsed += dt;

      if (!document.hidden) {
        controls.autoRotate = autoSpinRef.current && !reducedMotion;
        controls.autoRotateSpeed = 0.65;
        controls.update();

        // Drift ambient particles softly upward
        const attr = moteGeo.attributes.position as THREE.BufferAttribute;
        for (let m = 0; m < moteCount; m++) {
          let py = attr.getY(m) + dt * 0.18;
          if (py > 2.35) py = 0.05;
          attr.setY(m, py);
        }
        attr.needsUpdate = true;

        if (apexDiamond) {
          apexDiamond.rotation.y = elapsed * 1.1;
          apexDiamond.position.y = 2.16 + Math.sin(elapsed * 2.1) * 0.04;
        }

        renderer.render(scene, camera);
      }
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
      dom.removeEventListener('pointermove', onPointerMove);
      dom.removeEventListener('pointerleave', onPointerLeave);
      rebuildRef.current = null;
      controls.dispose();

      disposeGroupMaterialsAndGeos(prismGroup, sharedGeos);
      disposeGroupMaterialsAndGeos(matrixGroup);
      disposeGroupMaterialsAndGeos(surfaceGroup);

      unitBoxGeo.dispose();
      unitEdgesGeo.dispose();
      beaconGeo.dispose();
      floorGeo.dispose();
      floorMat.dispose();
      ringGeos.forEach((g) => g.dispose());
      ringMats.forEach((m) => m.dispose());
      moteGeo.dispose();
      moteMat.dispose();
      envGeo.dispose();
      envGold.dispose();
      envCyan.dispose();
      envRT.dispose();
      pmrem.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [nearViewport, reducedMotion]);

  // Rebuild prisms/planes/surface on control changes
  useEffect(() => {
    rebuildRef.current?.(presetId, gridN, sampleRule, showMatrixPlanes, showExactSurface);
  }, [presetId, gridN, sampleRule, showMatrixPlanes, showExactSurface]);

  const viewportHeight =
    heightClass ?? (compact ? 'h-[300px] sm:h-[340px]' : 'h-[370px] sm:h-[430px]');

  return (
    <div
      ref={hostRef}
      className="instrument-frame fiducial-frame overflow-hidden bg-[#060609] min-w-0 max-w-full"
    >
      {/* Top Bar */}
      <div className="px-4 py-2.5 border-b hairline-rule bg-[#0B0C12]/95 flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className="w-2 h-2 rounded-full shrink-0"
            style={{ backgroundColor: preset.accent, boxShadow: `0 0 10px ${preset.accent}` }}
          />
          <span className="font-mono-data text-[10px] uppercase tracking-[0.16em] text-[#F4C46C] truncate">
            Tensor Riemann 3D Manifold
          </span>
          <span className="hidden sm:inline font-mono-data text-[10px] px-2 py-0.5 rounded bg-[#11131C] border border-[rgba(244,196,108,0.18)] text-[#A8B2C6]">
            {gridN}×{gridN} = {gridN * gridN} Prisms
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setShowMatrixPlanes((v) => !v)}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-mono-data border transition-colors ${
              showMatrixPlanes
                ? 'border-[#46D6E8]/55 text-[#46D6E8] bg-[#46D6E8]/12'
                : 'border-[rgba(244,196,108,0.18)] bg-[#11131C] text-[#A8B2C6]'
            }`}
          >
            <Layers className="w-3 h-3" />
            <span>Matrix Planes</span>
          </button>
          <button
            type="button"
            onClick={() => setAutoSpin((s) => !s)}
            className={`px-2.5 py-1 rounded text-[11px] font-mono-data border transition-colors ${
              autoSpin
                ? 'border-[#F4C46C]/50 text-[#FFE29E] bg-[#F4C46C]/15'
                : 'border-[rgba(244,196,108,0.18)] bg-[#11131C] text-[#A8B2C6]'
            }`}
          >
            {autoSpin ? 'Auto-Orbit: ON' : 'Orbit: Manual'}
          </button>
          <button
            type="button"
            onClick={() => {
              setPresetId('paraboloid');
              setGridN(6);
              setSampleRule('midpoint');
              setShowMatrixPlanes(true);
              setShowExactSurface(true);
              setAutoSpin(true);
            }}
            aria-label="Reset 3D Riemann manifold"
            className="p-1.5 rounded border border-[rgba(244,196,108,0.18)] bg-[#11131C] text-[#A8B2C6] hover:text-[#F7F4EC]"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Split: 3D WebGL Viewport + Resolution & Integral Telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-12">
        <div
          className={`${
            compact ? 'lg:col-span-12' : 'lg:col-span-8 border-b lg:border-b-0 lg:border-r hairline-rule'
          } relative bg-[#060609]`}
        >
          <WebGLErrorBoundary fallbackTitle="3D Tensor Riemann Lab Unavailable">
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
                Initializing 3D Tensor Riemann Observatory…
              </div>
            )}
          </WebGLErrorBoundary>

          {/* Top-Left Formula & Volume Comparison Overlay */}
          <div className="pointer-events-none absolute top-3 left-3 obsidian-glass rounded-lg px-3 py-2 border border-[rgba(244,196,108,0.24)] space-y-0.5 max-w-[calc(100%-24px)]">
            <div className="flex flex-wrap items-center gap-2 font-mono-data text-[10px]">
              <span style={{ color: preset.accent }} className="font-semibold uppercase">
                {preset.label}
              </span>
              <span className="text-[#A8B2C6]">· V_{gridN} = {riemannStats.sum.toFixed(3)}</span>
              <span className="text-[#FFE29E]">· Exact = {preset.exactIntegral.toFixed(3)}</span>
            </div>
            <MathTex tex={preset.formulaTex} className="text-xs text-[#F7F4EC] block" />
          </div>

          {/* Hovered Prism Telemetry Pill */}
          {hoveredCell && (
            <div className="pointer-events-none absolute top-3 right-3 obsidian-glass rounded-lg px-2.5 py-1.5 border border-[rgba(70,214,232,0.35)] font-mono-data text-[10px] space-y-0.5 hidden sm:block">
              <div className="text-[#46D6E8]">
                Prism ({hoveredCell.i}, {hoveredCell.j}) · ({hoveredCell.x.toFixed(2)},{' '}
                {hoveredCell.y.toFixed(2)})
              </div>
              <div className="text-[#FFE29E]">
                z = {hoveredCell.z.toFixed(3)} · ΔV = {hoveredCell.dV.toFixed(4)}
              </div>
            </div>
          )}

          {/* Compact Mode Bottom Presets */}
          {compact && (
            <div className="absolute bottom-3 left-3 right-3 flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap gap-1.5">
                {PRESET_ORDER.map((id) => {
                  const p = SURFACE_PRESETS[id];
                  const active = presetId === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setPresetId(id)}
                      className={`px-2 py-1 rounded text-[10.5px] font-mono-data border transition-all ${
                        active
                          ? 'text-[#060609] font-semibold'
                          : 'bg-[#0B0C12]/85 border-[rgba(244,196,108,0.2)] text-[#A8B2C6] hover:text-[#F7F4EC]'
                      }`}
                      style={active ? { backgroundColor: p.accent, borderColor: p.accent } : undefined}
                    >
                      {p.label}
                    </button>
                  );
                })}
              </div>
              <span className="pointer-events-none hidden sm:inline font-mono-data text-[10px] text-[#A8B2C6] bg-[#0B0C12]/80 px-2 py-1 rounded border border-[rgba(244,196,108,0.16)]">
                Drag to orbit · Scroll to zoom
              </span>
            </div>
          )}

          {!compact && (
            <div className="pointer-events-none absolute bottom-2.5 left-3 px-2.5 py-1 rounded bg-[#0B0C12]/85 border border-[rgba(244,196,108,0.18)] text-[10.5px] font-mono-data text-[#A8B2C6]">
              Drag to orbit · Hover prisms to inspect ΔV · Domain {preset.domainLabel}
            </div>
          )}
        </div>

        {/* Full Interactive Controls & Volume Telemetry Panel */}
        {!compact && (
          <div className="lg:col-span-4 bg-[#0B0C12] p-4 sm:p-5 flex flex-col justify-between gap-4 min-w-0">
            <div className="space-y-3">
              <div className="font-mono-data text-[10px] uppercase tracking-[0.16em] text-[#A8B2C6]">
                Surface Function Preset
              </div>

              <div className="grid grid-cols-2 gap-1.5">
                {PRESET_ORDER.map((id) => {
                  const p = SURFACE_PRESETS[id];
                  const active = presetId === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setPresetId(id)}
                      className={`px-2.5 py-2 rounded-lg text-left text-xs font-mono-data border transition-all ${
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
                      {p.label}
                    </button>
                  );
                })}
              </div>

              {/* Grid Resolution & Sample Rule */}
              <div className="p-3.5 rounded-xl bg-[#11131C] border border-[rgba(244,196,108,0.16)] space-y-3">
                <label className="block space-y-1 text-xs">
                  <div className="flex justify-between font-mono-data">
                    <span className="text-[#A8B2C6]">Grid Resolution (N×N)</span>
                    <span className="text-[#F4C46C] font-semibold">
                      {gridN}×{gridN} ({gridN * gridN})
                    </span>
                  </div>
                  <input
                    type="range"
                    min={2}
                    max={10}
                    step={1}
                    value={gridN}
                    onChange={(e) => setGridN(parseInt(e.target.value, 10))}
                    className="meridian-slider"
                    style={{ ['--slider-accent' as string]: '#F4C46C' }}
                  />
                  <div className="flex justify-between font-mono-data text-[10px] text-[#727D94]">
                    <span>2×2 Coarse</span>
                    <span>10×10 Fine</span>
                  </div>
                </label>

                <div className="pt-2 border-t border-[rgba(244,196,108,0.12)] flex items-center justify-between gap-2">
                  <span className="font-mono-data text-[10.5px] text-[#A8B2C6]">Sample Rule</span>
                  <div className="flex gap-1">
                    {(['midpoint', 'corner'] as SampleRule[]).map((rule) => (
                      <button
                        key={rule}
                        type="button"
                        onClick={() => setSampleRule(rule)}
                        className={`px-2 py-0.5 rounded text-[10px] font-mono-data uppercase border ${
                          sampleRule === rule
                            ? 'border-[#45E6A6]/60 bg-[#45E6A6]/15 text-[#45E6A6]'
                            : 'border-[rgba(244,196,108,0.16)] text-[#A8B2C6]'
                        }`}
                      >
                        {rule}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono-data text-[10.5px] text-[#A8B2C6]">
                    Target Surface Mesh
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowExactSurface((s) => !s)}
                    className={`px-2 py-0.5 rounded text-[10px] font-mono-data uppercase border ${
                      showExactSurface
                        ? 'border-[#FFE29E]/55 bg-[#FFE29E]/15 text-[#FFE29E]'
                        : 'border-[rgba(244,196,108,0.16)] text-[#A8B2C6]'
                    }`}
                  >
                    {showExactSurface ? 'Visible' : 'Hidden'}
                  </button>
                </div>
              </div>
            </div>

            {/* Exact Integral vs Riemann Sum Volume Readout */}
            <div className="p-3.5 rounded-xl bg-[#11131C] border border-[rgba(244,196,108,0.2)] space-y-2.5">
              <div className="font-mono-data text-[10px] uppercase tracking-[0.15em] text-[#A8B2C6]">
                Volume Convergence Readout
              </div>

              <div className="grid grid-cols-2 gap-2 font-mono-data text-xs">
                <div className="p-2 rounded bg-[#0B0C12] border border-[rgba(70,214,232,0.2)]">
                  <div className="text-[9.5px] text-[#727D94]">Riemann Sum V</div>
                  <div className="text-[#46D6E8] font-semibold text-sm">
                    {riemannStats.sum.toFixed(4)}
                  </div>
                </div>
                <div className="p-2 rounded bg-[#0B0C12] border border-[rgba(244,196,108,0.24)]">
                  <div className="text-[9.5px] text-[#727D94]">Exact Integral</div>
                  <div className="text-[#FFE29E] font-semibold text-sm">
                    {preset.exactIntegral.toFixed(4)}
                  </div>
                </div>
              </div>

              <div className="space-y-1 font-mono-data text-[10px]">
                <div className="flex justify-between text-[#A8B2C6]">
                  <span>
                    {presetId === 'saddle'
                      ? `Abs |z| Vol: ${riemannStats.absSum.toFixed(3)} / ${preset.exactAbsIntegral.toFixed(3)}`
                      : `Error |V − Exact|: ${riemannStats.diff.toFixed(4)}`}
                  </span>
                  <span className="text-[#45E6A6]">{riemannStats.accuracyPct.toFixed(1)}% match</span>
                </div>
                <div className="h-1.5 rounded-full bg-[#0B0C12] overflow-hidden border border-[rgba(244,196,108,0.1)]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#46D6E8] via-[#45E6A6] to-[#FFE29E] transition-all duration-150"
                    style={{ width: `${riemannStats.accuracyPct.toFixed(1)}%` }}
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <MathTex
                  tex={`V_{${gridN}} = \\sum_{i,j=1}^{${gridN}} f(x_i, y_j)\\,\\Delta A \\approx ${riemannStats.sum.toFixed(3)}`}
                  className="text-xs text-[#F7F4EC]"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default TensorRiemann3D;
