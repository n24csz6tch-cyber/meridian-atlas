import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RotateCcw } from 'lucide-react';
import { MathTex } from '../../components/MathTex';
import { WebGLErrorBoundary } from '../../components/WebGLErrorBoundary';
import { useReducedMotion } from '../../hooks/useReducedMotion';

export interface ApolloniusCone3DProps {
  compact?: boolean;
  heightClass?: string;
}

type ConicPresetId = 'circle' | 'ellipse' | 'parabola' | 'hyperbola';

interface ConicPreset {
  id: ConicPresetId;
  label: string;
  badge: string;
  thetaDeg: number;
  offsetD: number;
  accent: string;
}

const CONE_HALF_ANGLE_DEG = 30;
const CONE_HALF_ANGLE_RAD = (CONE_HALF_ANGLE_DEG * Math.PI) / 180;
const CONE_K = Math.tan(CONE_HALF_ANGLE_RAD); // 1 / sqrt(3)
const CONE_COS = Math.cos(CONE_HALF_ANGLE_RAD); // sqrt(3) / 2
const CONE_HEIGHT = 2.4;
const CONE_RADIUS = CONE_HEIGHT * CONE_K;

const CONIC_PRESETS: ConicPreset[] = [
  {
    id: 'circle',
    label: 'Circle',
    badge: 'e = 0',
    thetaDeg: 0,
    offsetD: 1.15,
    accent: '#46D6E8',
  },
  {
    id: 'ellipse',
    label: 'Ellipse',
    badge: '0 < e < 1',
    thetaDeg: 32,
    offsetD: 1.1,
    accent: '#45E6A6',
  },
  {
    id: 'parabola',
    label: 'Parabola',
    badge: 'e = 1',
    thetaDeg: 60,
    offsetD: 0.85,
    accent: '#F4C46C',
  },
  {
    id: 'hyperbola',
    label: 'Hyperbola',
    badge: 'e > 1',
    thetaDeg: 78,
    offsetD: 0.4,
    accent: '#FF8563',
  },
];

interface ConicBranch {
  points: THREE.Vector3[];
  closed: boolean;
}

function classifyConic(thetaDeg: number, offsetD: number) {
  const rad = (thetaDeg * Math.PI) / 180;
  const e = Math.sin(rad) / CONE_COS;
  const isApex = Math.abs(offsetD) < 0.025;

  if (thetaDeg < 0.4) {
    return {
      kind: isApex ? 'Degenerate Apex Point' : 'Circle',
      eccentricity: 0,
      accent: '#46D6E8',
      tex: isApex ? 'x^2 + z^2 = 0' : 'x^2 + z^2 = r^2,\\; e = 0',
      summary: isApex
        ? 'Plane slices right through the apex vertex — collapsing the circle to a single point.'
        : 'Plane cuts horizontally parallel to the base — every generator sits at equal radius.',
    };
  }
  if (Math.abs(e - 1) < 0.015) {
    return {
      kind: isApex ? 'Degenerate Tangent Line' : 'Parabola',
      eccentricity: 1,
      accent: '#F4C46C',
      tex: isApex ? 'y = x\\tan 60^\\circ' : 'z^2 = 4px,\\; e = 1',
      summary: isApex
        ? 'Plane sits parallel to a cone generator right on the apex — tracing one straight line.'
        : 'Plane tilt matches the cone slope (60°) — one open branch shoots off to infinity.',
    };
  }
  if (e < 1) {
    return {
      kind: isApex ? 'Degenerate Apex Point' : 'Ellipse',
      eccentricity: e,
      accent: '#45E6A6',
      tex: isApex ? '(0, 0, 0)' : `\\dfrac{x'^2}{a^2} + \\dfrac{z^2}{b^2} = 1,\\; e = ${e.toFixed(2)}`,
      summary: isApex
        ? 'Tilted shallower than the cone wall right through the apex — only the origin intersects.'
        : 'Plane cuts completely across one nappe at a tilt shallower than the cone wall.',
    };
  }
  return {
    kind: isApex ? 'Crossing Generator Lines' : 'Hyperbola',
    eccentricity: e,
    accent: '#FF8563',
    tex: isApex ? 'z = \\pm\\, m x' : `\\dfrac{x'^2}{a^2} - \\dfrac{z^2}{b^2} = 1,\\; e = ${e.toFixed(2)}`,
    summary: isApex
      ? 'Steep slice straight through the apex intersects the double cone along two crossing lines.'
      : 'Steeper than 60° — the plane pierces BOTH upper and lower cone nappes at once!',
  };
}

function clipOpenChain(pts: THREE.Vector3[], maxY: number): ConicBranch[] {
  const branches: ConicBranch[] = [];
  let current: THREE.Vector3[] = [];

  for (let i = 0; i < pts.length; i++) {
    const p = pts[i];
    const inBounds = Math.abs(p.y) <= maxY + 1e-4;
    if (inBounds) {
      if (current.length === 0 && i > 0) {
        const prev = pts[i - 1];
        const edgeY = prev.y > 0 ? maxY : -maxY;
        const frac = (edgeY - prev.y) / (p.y - prev.y || 1);
        if (frac >= 0 && frac <= 1) {
          current.push(new THREE.Vector3().lerpVectors(prev, p, frac));
        }
      }
      current.push(p);
    } else if (current.length > 0) {
      const prev = current[current.length - 1];
      const edgeY = p.y > 0 ? maxY : -maxY;
      const frac = (edgeY - prev.y) / (p.y - prev.y || 1);
      if (frac >= 0 && frac <= 1) {
        current.push(new THREE.Vector3().lerpVectors(prev, p, frac));
      }
      if (current.length >= 2) branches.push({ points: current, closed: false });
      current = [];
    }
  }
  if (current.length >= 2) branches.push({ points: current, closed: false });
  return branches;
}

function computeConicBranches(thetaDeg: number, d: number): {
  branches: ConicBranch[];
  apexHighlight: boolean;
} {
  const rad = (thetaDeg * Math.PI) / 180;
  const m = Math.tan(rad);
  const km = CONE_K * m;

  // Apex degenerate slices
  if (Math.abs(d) < 0.015) {
    if (km < 0.992) {
      return { branches: [], apexHighlight: true };
    }
    if (Math.abs(km - 1) <= 0.008) {
      const p1 = new THREE.Vector3(-CONE_RADIUS, -CONE_HEIGHT, 0);
      const p2 = new THREE.Vector3(CONE_RADIUS, CONE_HEIGHT, 0);
      return {
        branches: [{ points: [p1, new THREE.Vector3(0, 0, 0), p2], closed: false }],
        apexHighlight: true,
      };
    }
    const zSlope = Math.sqrt(Math.max(0, CONE_K * CONE_K - 1 / (m * m)));
    const b1: THREE.Vector3[] = [];
    const b2: THREE.Vector3[] = [];
    for (let i = -30; i <= 30; i++) {
      const s = (i / 30) * CONE_HEIGHT;
      const x = s / m;
      const z = s * zSlope;
      b1.push(new THREE.Vector3(x, s, z));
      b2.push(new THREE.Vector3(x, s, -z));
    }
    return {
      branches: [
        { points: b1, closed: false },
        { points: b2, closed: false },
      ],
      apexHighlight: true,
    };
  }

  // Horizontal Circle (theta ~ 0)
  if (m < 0.006) {
    if (Math.abs(d) > CONE_HEIGHT) return { branches: [], apexHighlight: false };
    const r = Math.abs(d) * CONE_K;
    const pts: THREE.Vector3[] = [];
    const steps = 96;
    for (let i = 0; i < steps; i++) {
      const phi = (i / steps) * Math.PI * 2;
      pts.push(new THREE.Vector3(r * Math.cos(phi), d, r * Math.sin(phi)));
    }
    return { branches: [{ points: pts, closed: true }], apexHighlight: false };
  }

  // Ellipse (km < 1)
  if (km < 0.996) {
    const xA = (-CONE_K * d) / (1 + km);
    const xB = (CONE_K * d) / (1 - km);
    const xMin = Math.min(xA, xB);
    const xMax = Math.max(xA, xB);
    const xMid = 0.5 * (xMin + xMax);
    const rx = 0.5 * (xMax - xMin);

    const steps = 140;
    const loopPts: THREE.Vector3[] = [];
    let allInside = true;
    for (let i = 0; i <= steps; i++) {
      const tau = (i / steps) * Math.PI * 2;
      const x = xMid + rx * Math.cos(tau);
      const y = d + m * x;
      if (Math.abs(y) > CONE_HEIGHT) allInside = false;
      const r2 = CONE_K * y * (CONE_K * y);
      const z = Math.sqrt(Math.max(0, r2 - x * x)) * (tau <= Math.PI ? 1 : -1);
      loopPts.push(new THREE.Vector3(x, y, z));
    }

    if (allInside) {
      loopPts.pop();
      return { branches: [{ points: loopPts, closed: true }], apexHighlight: false };
    }
    return { branches: clipOpenChain(loopPts, CONE_HEIGHT), apexHighlight: false };
  }

  // Parabola (km ~ 1)
  if (Math.abs(km - 1) <= 0.008) {
    const yVertex = d * 0.5;
    if (Math.abs(yVertex) >= CONE_HEIGHT) return { branches: [], apexHighlight: false };
    const zMax = Math.sqrt(Math.max(0, CONE_K * CONE_K * Math.abs(d) * (2 * CONE_HEIGHT - Math.abs(d))));
    const pts: THREE.Vector3[] = [];
    const steps = 90;
    for (let i = -steps; i <= steps; i++) {
      const t = i / steps;
      const z = t * zMax;
      const x = (z * z - CONE_K * CONE_K * d * d) / (2 * CONE_K * d);
      const y = yVertex + (z * z) / (2 * CONE_K * CONE_K * d);
      pts.push(new THREE.Vector3(x, y, z));
    }
    return { branches: [{ points: pts, closed: false }], apexHighlight: false };
  }

  // Hyperbola (km > 1): intersects both upper and lower cone nappes
  const y1 = d / (1 + km);
  const y2 = d / (1 - km);
  const branches: ConicBranch[] = [];

  for (const yv of [y1, y2]) {
    if (Math.abs(yv) >= CONE_HEIGHT - 0.005) continue;
    const rimY = yv >= 0 ? CONE_HEIGHT : -CONE_HEIGHT;
    const pts: THREE.Vector3[] = [];
    const steps = 64;
    for (let i = -steps; i <= steps; i++) {
      const t = i / steps;
      const s = yv + (rimY - yv) * (t * t);
      const x = (s - d) / m;
      const zMag = Math.sqrt(Math.max(0, (s * CONE_K) * (s * CONE_K) - x * x));
      const z = (t >= 0 ? 1 : -1) * zMag;
      pts.push(new THREE.Vector3(x, s, z));
    }
    branches.push({ points: pts, closed: false });
  }

  return { branches, apexHighlight: false };
}

function disposeGroupChildren(group: THREE.Group) {
  while (group.children.length > 0) {
    const child = group.children[0];
    group.remove(child);
    child.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (mesh.geometry) mesh.geometry.dispose();
      if (mesh.material) {
        if (Array.isArray(mesh.material)) mesh.material.forEach((mat) => mat.dispose());
        else mesh.material.dispose();
      }
    });
  }
}

export function ApolloniusCone3D({
  compact = false,
  heightClass,
}: ApolloniusCone3DProps) {
  const reducedMotion = useReducedMotion();
  const [thetaDeg, setThetaDeg] = useState(32);
  const [offsetD, setOffsetD] = useState(1.1);
  const [autoSpin, setAutoSpin] = useState(true);
  const [webglError, setWebglError] = useState<string | null>(null);
  const [nearViewport, setNearViewport] = useState(false);

  const hostRef = useRef<HTMLDivElement | null>(null);
  const mountRef = useRef<HTMLDivElement | null>(null);
  const sceneUpdateRef = useRef<((theta: number, d: number) => void) | null>(null);
  const autoSpinRef = useRef(autoSpin);
  autoSpinRef.current = autoSpin;
  const paramsRef = useRef({ thetaDeg, offsetD });
  paramsRef.current = { thetaDeg, offsetD };

  const info = useMemo(() => classifyConic(thetaDeg, offsetD), [thetaDeg, offsetD]);

  const activePresetId = useMemo(() => {
    if (thetaDeg < 0.4) return 'circle';
    if (Math.abs(info.eccentricity - 1) < 0.015) return 'parabola';
    if (info.eccentricity < 1) return 'ellipse';
    return 'hyperbola';
  }, [thetaDeg, info.eccentricity]);

  // IntersectionObserver mounts WebGL only when near viewport
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

  useEffect(() => {
    if (!nearViewport) return;
    const container = mountRef.current;
    if (!container) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    } catch (err) {
      setWebglError(err instanceof Error ? err.message : 'WebGL unavailable');
      return;
    }

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    renderer.setPixelRatio(dpr);
    renderer.setClearColor('#06070B', 1);
    const rect = container.getBoundingClientRect();
    const initW = Math.max(240, Math.floor(rect.width));
    const initH = Math.max(220, Math.floor(rect.height));
    renderer.setSize(initW, initH);
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#06070B');

    const camera = new THREE.PerspectiveCamera(38, initW / initH, 0.1, 80);
    camera.position.set(5.4, 2.8, 6.2);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.rotateSpeed = 0.8;
    controls.minDistance = 3.5;
    controls.maxDistance = 14;
    controls.target.set(0, 0, 0);

    // Lightweight procedural studio environment reflection
    const pmrem = new THREE.PMREMGenerator(renderer);
    const envScene = new THREE.Scene();
    envScene.background = new THREE.Color('#06070B');
    const envGeo = new THREE.PlaneGeometry(10, 10);
    const envGold = new THREE.MeshBasicMaterial({ color: '#FFE29E', side: THREE.DoubleSide });
    const envCyan = new THREE.MeshBasicMaterial({ color: '#46D6E8', side: THREE.DoubleSide });
    const p1 = new THREE.Mesh(envGeo, envGold);
    p1.position.set(6, 7, 6);
    p1.lookAt(0, 0, 0);
    const p2 = new THREE.Mesh(envGeo, envCyan);
    p2.position.set(-7, 4, -5);
    p2.lookAt(0, 0, 0);
    envScene.add(p1, p2);
    const envRT = pmrem.fromScene(envScene, 0.04);
    scene.environment = envRT.texture;

    // Studio lighting
    const ambient = new THREE.AmbientLight('#FFE8C2', 0.42);
    const keyLight = new THREE.DirectionalLight('#FFE29E', 1.45);
    keyLight.position.set(6, 9, 6);
    const rimLight = new THREE.DirectionalLight('#46D6E8', 0.95);
    rimLight.position.set(-7, 3, -6);
    const bottomLight = new THREE.PointLight('#F4C46C', 0.65, 16);
    bottomLight.position.set(0, -4, 4);
    scene.add(ambient, keyLight, rimLight, bottomLight);

    // Metric coordinate floor disc & subtle gold grid below lower cone
    const floorY = -CONE_HEIGHT - 0.14;
    const floorGeom = new THREE.CircleGeometry(4.8, 64);
    const floorMat = new THREE.MeshStandardMaterial({
      color: '#07090F',
      roughness: 0.9,
      metalness: 0.15,
    });
    const floorMesh = new THREE.Mesh(floorGeom, floorMat);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.position.y = floorY - 0.01;
    scene.add(floorMesh);

    const grid = new THREE.GridHelper(9.6, 12, '#5E4722', '#1C1A15');
    grid.position.y = floorY;
    scene.add(grid);

    // Double Nappe Cone Group
    const coneMat = new THREE.MeshPhysicalMaterial({
      color: '#19140E',
      emissive: '#3D2A09',
      emissiveIntensity: 0.28,
      roughness: 0.14,
      metalness: 0.28,
      clearcoat: 1.0,
      clearcoatRoughness: 0.08,
      envMapIntensity: 1.35,
      transparent: true,
      opacity: 0.46,
      side: THREE.DoubleSide,
      depthWrite: false,
    });

    // Upper nappe: ConeGeometry defaults to tip at +H/2, base at -H/2 -> invert X by PI
    const upperConeGeom = new THREE.ConeGeometry(CONE_RADIUS, CONE_HEIGHT, 64, 1, true);
    upperConeGeom.rotateX(Math.PI);
    upperConeGeom.translate(0, CONE_HEIGHT / 2, 0);
    const upperCone = new THREE.Mesh(upperConeGeom, coneMat);

    // Lower nappe: tip at origin, base at -H
    const lowerConeGeom = new THREE.ConeGeometry(CONE_RADIUS, CONE_HEIGHT, 64, 1, true);
    lowerConeGeom.translate(0, -CONE_HEIGHT / 2, 0);
    const lowerCone = new THREE.Mesh(lowerConeGeom, coneMat);

    // Rim rings + vertical axis + meridian ribs
    const rimRingGeom = new THREE.TorusGeometry(CONE_RADIUS, 0.014, 12, 72);
    const rimRingMat = new THREE.MeshBasicMaterial({
      color: '#F4C46C',
      transparent: true,
      opacity: 0.65,
    });
    const upperRim = new THREE.Mesh(rimRingGeom, rimRingMat);
    upperRim.rotation.x = Math.PI / 2;
    upperRim.position.y = CONE_HEIGHT;

    const lowerRim = new THREE.Mesh(rimRingGeom, rimRingMat);
    lowerRim.rotation.x = Math.PI / 2;
    lowerRim.position.y = -CONE_HEIGHT;

    const ribGeom = new THREE.BufferGeometry();
    const ribVerts: number[] = [];
    const numRibs = 12;
    for (let i = 0; i < numRibs; i++) {
      const ang = (i / numRibs) * Math.PI * 2;
      const rx = CONE_RADIUS * Math.cos(ang);
      const rz = CONE_RADIUS * Math.sin(ang);
      ribVerts.push(rx, CONE_HEIGHT, rz, -rx, -CONE_HEIGHT, -rz);
    }
    ribGeom.setAttribute('position', new THREE.Float32BufferAttribute(ribVerts, 3));
    const ribMat = new THREE.LineBasicMaterial({
      color: '#B88938',
      transparent: true,
      opacity: 0.34,
    });
    const ribs = new THREE.LineSegments(ribGeom, ribMat);

    const axisGeom = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, -CONE_HEIGHT - 0.14, 0),
      new THREE.Vector3(0, CONE_HEIGHT + 0.35, 0),
    ]);
    const axisMat = new THREE.LineDashedMaterial({
      color: '#F4C46C',
      dashSize: 0.14,
      gapSize: 0.1,
      transparent: true,
      opacity: 0.48,
    });
    const axisLine = new THREE.Line(axisGeom, axisMat);
    axisLine.computeLineDistances();

    const apexSphereGeom = new THREE.SphereGeometry(0.068, 18, 18);
    const apexSphereMat = new THREE.MeshPhysicalMaterial({
      color: '#FFE29E',
      emissive: '#B88938',
      emissiveIntensity: 0.65,
      metalness: 0.9,
      roughness: 0.15,
      clearcoat: 1.0,
    });
    const apexSphere = new THREE.Mesh(apexSphereGeom, apexSphereMat);

    scene.add(upperCone, lowerCone, upperRim, lowerRim, ribs, axisLine, apexSphere);

    // Interactive Tilted Luminous Golden Cutting Plane
    const planeGroup = new THREE.Group();
    const cutPlaneGeom = new THREE.PlaneGeometry(4.2, 4.2);
    cutPlaneGeom.rotateX(-Math.PI / 2);
    const cutPlaneMat = new THREE.MeshPhysicalMaterial({
      color: '#F4C46C',
      emissive: '#7A5212',
      emissiveIntensity: 0.32,
      roughness: 0.1,
      metalness: 0.25,
      clearcoat: 1.0,
      transparent: true,
      opacity: 0.17,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const cutPlaneMesh = new THREE.Mesh(cutPlaneGeom, cutPlaneMat);
    const cutPlaneEdgesGeom = new THREE.EdgesGeometry(cutPlaneGeom);
    const cutPlaneEdgesMat = new THREE.LineBasicMaterial({
      color: '#FFE29E',
      transparent: true,
      opacity: 0.72,
      toneMapped: false,
    });
    const cutPlaneEdges = new THREE.LineSegments(cutPlaneEdgesGeom, cutPlaneEdgesMat);
    planeGroup.add(cutPlaneMesh, cutPlaneEdges);
    scene.add(planeGroup);

    // Dynamic Intersecting Conic Curve Group
    const curveGroup = new THREE.Group();
    scene.add(curveGroup);

    const haloMaterials: THREE.MeshBasicMaterial[] = [];

    const rebuildConicGeometry = (theta: number, d: number) => {
      planeGroup.position.set(0, d, 0);
      planeGroup.rotation.set(0, 0, (theta * Math.PI) / 180);

      disposeGroupChildren(curveGroup);
      haloMaterials.length = 0;

      const { branches, apexHighlight } = computeConicBranches(theta, d);
      const conicMeta = classifyConic(theta, d);

      if (apexHighlight) {
        const dotGeo = new THREE.SphereGeometry(0.095, 18, 18);
        const dotMat = new THREE.MeshBasicMaterial({ color: '#46D6E8', toneMapped: false });
        curveGroup.add(new THREE.Mesh(dotGeo, dotMat));
      }

      for (const br of branches) {
        if (br.points.length < 2) continue;
        const spline = new THREE.CatmullRomCurve3(br.points, br.closed);
        const tubularSegs = Math.min(180, Math.max(36, br.points.length * 2));

        // Bright core tube
        const coreGeo = new THREE.TubeGeometry(spline, tubularSegs, 0.032, 10, br.closed);
        const coreMat = new THREE.MeshBasicMaterial({
          color: '#FFE29E',
          toneMapped: false,
        });
        const coreMesh = new THREE.Mesh(coreGeo, coreMat);
        coreMesh.renderOrder = 6;
        curveGroup.add(coreMesh);

        // Outer luminous aura sheath
        const haloGeo = new THREE.TubeGeometry(spline, tubularSegs, 0.068, 10, br.closed);
        const haloMat = new THREE.MeshBasicMaterial({
          color: conicMeta.accent,
          transparent: true,
          opacity: 0.38,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
          toneMapped: false,
        });
        haloMaterials.push(haloMat);
        const haloMesh = new THREE.Mesh(haloGeo, haloMat);
        haloMesh.renderOrder = 5;
        curveGroup.add(haloMesh);
      }
    };

    sceneUpdateRef.current = rebuildConicGeometry;
    rebuildConicGeometry(paramsRef.current.thetaDeg, paramsRef.current.offsetD);

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
    let lastTime = performance.now();
    let elapsed = 0;

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;
      elapsed += dt;

      if (!document.hidden) {
        controls.autoRotate = autoSpinRef.current && !reducedMotion;
        controls.autoRotateSpeed = 0.75;
        controls.update();

        const pulse = 0.3 + 0.14 * Math.sin(elapsed * 2.6);
        for (const hm of haloMaterials) {
          hm.opacity = pulse;
        }
        apexSphereMat.emissiveIntensity = 0.55 + 0.25 * Math.sin(elapsed * 2.2);

        renderer.render(scene, camera);
      }
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
      sceneUpdateRef.current = null;
      controls.dispose();
      disposeGroupChildren(curveGroup);

      [
        envGeo,
        floorGeom,
        upperConeGeom,
        lowerConeGeom,
        rimRingGeom,
        ribGeom,
        axisGeom,
        apexSphereGeom,
        cutPlaneGeom,
        cutPlaneEdgesGeom,
      ].forEach((g) => g.dispose());

      [
        envGold,
        envCyan,
        floorMat,
        coneMat,
        rimRingMat,
        ribMat,
        axisMat,
        apexSphereMat,
        cutPlaneMat,
        cutPlaneEdgesMat,
      ].forEach((m) => m.dispose());

      grid.geometry.dispose();
      if (Array.isArray(grid.material)) grid.material.forEach((m) => m.dispose());
      else grid.material.dispose();

      envRT.dispose();
      pmrem.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [nearViewport, reducedMotion]);

  useEffect(() => {
    sceneUpdateRef.current?.(thetaDeg, offsetD);
  }, [thetaDeg, offsetD]);

  const viewportHeight = heightClass ?? (compact ? 'h-[320px] sm:h-[360px]' : 'h-[390px] sm:h-[440px]');

  return (
    <div ref={hostRef} className="instrument-frame fiducial-frame overflow-hidden bg-[#0B0C12]">
      {!compact && (
        <div className="px-5 py-3.5 border-b border-[rgba(244,196,108,0.17)] bg-[#0B0C12]/95 flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="font-mono-data text-[10.5px] uppercase tracking-[0.18em] text-[#F4C46C]">
              3D Analytic Geometry · Apollonius of Perga
            </span>
            <h3 className="font-serif-editorial text-2xl text-[#F7F4EC]">
              Double-Nappe Conic Section Slicer
            </h3>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {CONIC_PRESETS.map((preset) => {
              const active = activePresetId === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => {
                    setThetaDeg(preset.thetaDeg);
                    setOffsetD(preset.offsetD);
                  }}
                  className={`px-3 py-1.5 rounded-md text-xs font-mono-data border transition-all ${
                    active
                      ? 'text-[#06070B] font-semibold'
                      : 'border-[rgba(244,196,108,0.18)] bg-[#11131C] text-[#A8B2C6] hover:text-[#F7F4EC] hover:border-[rgba(244,196,108,0.4)]'
                  }`}
                  style={
                    active
                      ? {
                          backgroundColor: preset.accent,
                          borderColor: preset.accent,
                          boxShadow: `0 0 18px -4px ${preset.accent}`,
                        }
                      : undefined
                  }
                >
                  {preset.label} <span className="opacity-75">({preset.badge})</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12">
        <div className={`${compact ? 'lg:col-span-12' : 'lg:col-span-8 border-b lg:border-b-0 lg:border-r border-[rgba(244,196,108,0.17)]'} relative`}>
          <WebGLErrorBoundary fallbackTitle="3D Conic Slicer Unavailable">
            {webglError ? (
              <div className={`w-full ${viewportHeight} flex items-center justify-center bg-[#06070B] font-mono-data text-xs text-[#A8B2C6]`}>
                {webglError}
              </div>
            ) : nearViewport ? (
              <div ref={mountRef} className={`w-full ${viewportHeight} bg-[#06070B]`} />
            ) : (
              <div className={`w-full ${viewportHeight} flex items-center justify-center bg-[#06070B] font-mono-data text-xs text-[#A8B2C6]`}>
                Loading Double-Nappe Conic Observatory…
              </div>
            )}
          </WebGLErrorBoundary>

          {/* Eccentricity Telemetry Overlay */}
          <div className="pointer-events-none absolute top-3 left-3 obsidian-glass rounded-lg px-3 py-2 border border-[rgba(244,196,108,0.24)] space-y-0.5">
            <div className="flex items-center gap-2 font-mono-data text-[10px] uppercase tracking-wider">
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: info.accent, boxShadow: `0 0 10px ${info.accent}` }}
              />
              <span style={{ color: info.accent }}>{info.kind}</span>
              <span className="text-[#A8B2C6]">· e = {info.eccentricity.toFixed(3)}</span>
            </div>
            <MathTex tex={info.tex} className="text-xs text-[#F7F4EC] block" />
          </div>

          {compact && (
            <div className="absolute bottom-3 left-3 right-3 flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap gap-1.5">
                {CONIC_PRESETS.map((preset) => {
                  const active = activePresetId === preset.id;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => {
                        setThetaDeg(preset.thetaDeg);
                        setOffsetD(preset.offsetD);
                      }}
                      className={`px-2.5 py-1 rounded text-[11px] font-mono-data border transition-all ${
                        active
                          ? 'text-[#06070B] font-semibold'
                          : 'bg-[#0B0C12]/85 border-[rgba(244,196,108,0.22)] text-[#A8B2C6] hover:text-[#F7F4EC]'
                      }`}
                      style={
                        active
                          ? { backgroundColor: preset.accent, borderColor: preset.accent }
                          : undefined
                      }
                    >
                      {preset.label}
                    </button>
                  );
                })}
              </div>
              <span className="pointer-events-none font-mono-data text-[10px] text-[#A8B2C6] bg-[#0B0C12]/80 px-2 py-1 rounded border border-[rgba(244,196,108,0.16)]">
                Drag to orbit · Scroll to zoom
              </span>
            </div>
          )}

          {!compact && (
            <div className="pointer-events-none absolute bottom-2.5 left-3 px-2.5 py-1 rounded-md bg-[#0B0C12]/85 border border-[rgba(244,196,108,0.2)] text-[11px] font-mono-data text-[#A8B2C6]">
              Drag to orbit · Scroll to zoom · Cone generator angle = 60°
            </div>
          )}
        </div>

        {!compact && (
          <div className="lg:col-span-4 bg-[#0B0C12] p-5 flex flex-col justify-between gap-4">
            <div className="space-y-4">
              {/* Tilt Angle Slider */}
              <div className="p-3.5 rounded-lg bg-[#11131C] border border-[rgba(244,196,108,0.17)] space-y-3">
                <label className="block space-y-1.5 text-xs">
                  <div className="flex justify-between font-mono-data">
                    <span className="text-[#A8B2C6]">Plane Tilt Angle (θ)</span>
                    <span className="text-[#F4C46C] font-semibold">{thetaDeg.toFixed(1)}°</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={86}
                    step={0.5}
                    value={thetaDeg}
                    onChange={(e) => setThetaDeg(parseFloat(e.target.value))}
                    className="meridian-slider"
                    style={{ ['--slider-accent' as string]: '#F4C46C' }}
                  />
                  <div className="flex justify-between font-mono-data text-[10px] text-[#A8B2C6]/70">
                    <span>0° Circle</span>
                    <span className="text-[#F4C46C]">60° Parabola</span>
                    <span>86° Hyperbola</span>
                  </div>
                </label>

                <label className="block space-y-1.5 text-xs pt-1 border-t border-[rgba(244,196,108,0.12)]">
                  <div className="flex justify-between font-mono-data">
                    <span className="text-[#A8B2C6]">Vertical Offset (d)</span>
                    <span className="text-[#46D6E8] font-semibold">{offsetD.toFixed(2)} u</span>
                  </div>
                  <input
                    type="range"
                    min={-1.5}
                    max={1.5}
                    step={0.05}
                    value={offsetD}
                    onChange={(e) => setOffsetD(parseFloat(e.target.value))}
                    className="meridian-slider"
                    style={{ ['--slider-accent' as string]: '#46D6E8' }}
                  />
                </label>
              </div>

              {/* Orbit Controls Bar */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setAutoSpin((s) => !s)}
                  className={`flex-1 px-3 py-1.5 rounded-md text-xs font-mono-data border transition-colors ${
                    autoSpin
                      ? 'border-[#F4C46C]/50 bg-[#F4C46C]/15 text-[#FFE29E]'
                      : 'border-[rgba(244,196,108,0.18)] bg-[#11131C] text-[#A8B2C6]'
                  }`}
                >
                  {autoSpin ? 'Auto-Orbit: ON' : 'Auto-Orbit: PAUSED'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setThetaDeg(32);
                    setOffsetD(1.1);
                  }}
                  aria-label="Reset conic slice"
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-mono-data border border-[rgba(244,196,108,0.18)] bg-[#11131C] text-[#A8B2C6] hover:text-[#F7F4EC]"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Reset
                </button>
              </div>
            </div>

            {/* Live Eccentricity Readout Card */}
            <div className="p-3.5 rounded-lg bg-[#11131C] border border-[rgba(244,196,108,0.17)] space-y-2">
              <div className="flex items-center justify-between font-mono-data text-xs">
                <span className="text-[#A8B2C6]">Eccentricity Formula</span>
                <span style={{ color: info.accent }} className="font-semibold">
                  e = {info.eccentricity.toFixed(3)}
                </span>
              </div>
              <MathTex
                tex={`e = \\frac{\\sin\\theta}{\\cos 30^\\circ} = \\frac{\\sin(${thetaDeg.toFixed(1)}^\\circ)}{0.866} = ${info.eccentricity.toFixed(3)}`}
                className="text-xs text-[#F7F4EC] block"
              />
              <p className="text-xs text-[#A8B2C6] leading-relaxed">{info.summary}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ApolloniusCone3D;
