import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { WebGLErrorBoundary } from '../../components/WebGLErrorBoundary';
import { useReducedMotion } from '../../hooks/useReducedMotion';

export type SolidKind = 'rectangular-prism' | 'square-pyramid' | 'triangular-prism';
export type SolidHighlightPart = 'all' | 'base' | 'lateral';

export interface SolidNetSceneProps {
  solid: SolidKind;
  width: number;
  depth: number;
  height: number;
  unfold: number; // 0 = closed solid, 1 = flat 2D net
  highlightPart?: SolidHighlightPart;
  showInternalTriangle?: boolean;
  sliceHeight?: number | null; // 0..1 fraction of height
  autoOrbitSpeed?: number;
  heightClass?: string;
  showControlsHint?: boolean;
}

function makeTriangleGeometry(base: number, height: number): THREE.BufferGeometry {
  const geom = new THREE.BufferGeometry();
  const vertices = new Float32Array([
    -base / 2, 0, 0,
    base / 2, 0, 0,
    0, height, 0,
  ]);
  const normals = new Float32Array([
    0, 0, 1,
    0, 0, 1,
    0, 0, 1,
  ]);
  const uvs = new Float32Array([
    0, 0,
    1, 0,
    0.5, 1,
  ]);
  geom.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
  geom.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
  geom.setAttribute('uv', new THREE.BufferAttribute(uvs, 3));
  geom.computeBoundingSphere();
  return geom;
}

/**
 * Generates a lightweight procedural studio environment map (warm champagne key +
 * cool starlight cyan rim panels) so MeshPhysicalMaterial panels catch museum-grade
 * specular highlights without loading external HDRI assets.
 */
function StudioEnvironment() {
  const { gl, scene } = useThree();

  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    pmrem.compileEquirectangularShader();

    const envScene = new THREE.Scene();
    envScene.background = new THREE.Color('#05060A');

    const panelGeo = new THREE.PlaneGeometry(10, 10);
    const warmMat = new THREE.MeshBasicMaterial({ color: '#FFE8B5', side: THREE.DoubleSide });
    const goldMat = new THREE.MeshBasicMaterial({ color: '#F4C46C', side: THREE.DoubleSide });
    const cyanMat = new THREE.MeshBasicMaterial({ color: '#46D6E8', side: THREE.DoubleSide });
    const coralMat = new THREE.MeshBasicMaterial({ color: '#5A3422', side: THREE.DoubleSide });

    const topPanel = new THREE.Mesh(panelGeo, warmMat);
    topPanel.position.set(5, 8, 6);
    topPanel.lookAt(0, 0, 0);
    envScene.add(topPanel);

    const keyPanel = new THREE.Mesh(panelGeo, goldMat);
    keyPanel.position.set(9, 3, -3);
    keyPanel.lookAt(0, 0, 0);
    envScene.add(keyPanel);

    const rimPanel = new THREE.Mesh(panelGeo, cyanMat);
    rimPanel.position.set(-9, 4, -6);
    rimPanel.lookAt(0, 0, 0);
    envScene.add(rimPanel);

    const floorBounce = new THREE.Mesh(panelGeo, coralMat);
    floorBounce.position.set(0, -8, 2);
    floorBounce.lookAt(0, 0, 0);
    envScene.add(floorBounce);

    const envRT = pmrem.fromScene(envScene, 0.04);
    const prevEnv = scene.environment;
    scene.environment = envRT.texture;

    return () => {
      scene.environment = prevEnv;
      envRT.dispose();
      pmrem.dispose();
      panelGeo.dispose();
      warmMat.dispose();
      goldMat.dispose();
      cyanMat.dispose();
      coralMat.dispose();
    };
  }, [gl, scene]);

  return null;
}

interface SegmentLineProps {
  points: [number, number, number][];
  color: string;
  dashed?: boolean;
  opacity?: number;
}

function SegmentLine({ points, color, dashed = false, opacity = 1 }: SegmentLineProps) {
  const lineObj = useMemo(() => {
    const geom = new THREE.BufferGeometry().setFromPoints(
      points.map((p) => new THREE.Vector3(p[0], p[1], p[2]))
    );
    const mat = dashed
      ? new THREE.LineDashedMaterial({
          color,
          dashSize: 0.18,
          gapSize: 0.12,
          transparent: opacity < 1,
          opacity,
          toneMapped: false,
        })
      : new THREE.LineBasicMaterial({
          color,
          transparent: opacity < 1,
          opacity,
          toneMapped: false,
        });
    const line = new THREE.Line(geom, mat);
    if (dashed) line.computeLineDistances();
    return line;
  }, [points, color, dashed, opacity]);

  useEffect(() => {
    return () => {
      lineObj.geometry.dispose();
      (lineObj.material as THREE.Material).dispose();
    };
  }, [lineObj]);

  return <primitive object={lineObj} />;
}

interface EdgeOutlineProps {
  geometry: THREE.BufferGeometry;
  color: string;
  glowColor?: string;
}

function EdgeOutline({ geometry, color, glowColor = '#F4C46C' }: EdgeOutlineProps) {
  const edgesGeom = useMemo(() => new THREE.EdgesGeometry(geometry, 15), [geometry]);
  useEffect(() => () => edgesGeom.dispose(), [edgesGeom]);

  return (
    <group>
      <lineSegments geometry={edgesGeom} renderOrder={3}>
        <lineBasicMaterial color={color} transparent opacity={0.96} toneMapped={false} />
      </lineSegments>
      <lineSegments geometry={edgesGeom} scale={[1.003, 1.003, 1.003]} renderOrder={2}>
        <lineBasicMaterial
          color={glowColor}
          transparent
          opacity={0.34}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </lineSegments>
    </group>
  );
}

interface BrassJointProps {
  positions: [number, number, number][];
  dimmed?: boolean;
}

function BrassJoints({ positions, dimmed = false }: BrassJointProps) {
  const sphereGeom = useMemo(() => new THREE.SphereGeometry(0.056, 16, 16), []);
  const sphereMat = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: dimmed ? '#6E624D' : '#F4C46C',
        emissive: dimmed ? '#000000' : '#6B480B',
        emissiveIntensity: dimmed ? 0 : 0.45,
        metalness: 0.9,
        roughness: 0.16,
        clearcoat: 1.0,
        clearcoatRoughness: 0.1,
        envMapIntensity: 1.5,
      }),
    [dimmed]
  );

  useEffect(() => {
    return () => {
      sphereGeom.dispose();
      sphereMat.dispose();
    };
  }, [sphereGeom, sphereMat]);

  return (
    <group>
      {positions.map((pos, idx) => (
        <mesh key={idx} geometry={sphereGeom} material={sphereMat} position={pos} renderOrder={4} />
      ))}
    </group>
  );
}

interface FaceStyle {
  color: string;
  emissive: string;
  emissiveIntensity: number;
  opacity: number;
  metalness: number;
  roughness: number;
  clearcoat: number;
  clearcoatRoughness: number;
  edgeColor: string;
  glowColor: string;
  depthWrite: boolean;
  dimmed: boolean;
}

function getFaceStyle(role: 'base' | 'lateral', highlight: SolidHighlightPart): FaceStyle {
  if (highlight === 'all') {
    if (role === 'base') {
      // Brushed Champagne-Gold base plate
      return {
        color: '#D8A346',
        emissive: '#472E08',
        emissiveIntensity: 0.32,
        opacity: 0.92,
        metalness: 0.64,
        roughness: 0.22,
        clearcoat: 0.92,
        clearcoatRoughness: 0.14,
        edgeColor: '#FFE29E',
        glowColor: '#F4C46C',
        depthWrite: true,
        dimmed: false,
      };
    }
    // Smoky Crystal Glass lateral panels
    return {
      color: '#1C2636',
      emissive: '#141B29',
      emissiveIntensity: 0.24,
      opacity: 0.56,
      metalness: 0.18,
      roughness: 0.09,
      clearcoat: 1.0,
      clearcoatRoughness: 0.06,
      edgeColor: '#F4C46C',
      glowColor: '#FFE29E',
      depthWrite: false,
      dimmed: false,
    };
  }

  if (highlight === role) {
    return role === 'base'
      ? {
          color: '#F4C46C',
          emissive: '#946212',
          emissiveIntensity: 0.48,
          opacity: 0.95,
          metalness: 0.72,
          roughness: 0.18,
          clearcoat: 1.0,
          clearcoatRoughness: 0.1,
          edgeColor: '#FFF3D1',
          glowColor: '#FFE29E',
          depthWrite: true,
          dimmed: false,
        }
      : {
          color: '#349BB3',
          emissive: '#115D70',
          emissiveIntensity: 0.42,
          opacity: 0.72,
          metalness: 0.22,
          roughness: 0.08,
          clearcoat: 1.0,
          clearcoatRoughness: 0.06,
          edgeColor: '#46D6E8',
          glowColor: '#FFE29E',
          depthWrite: false,
          dimmed: false,
        };
  }

  return {
    color: '#0E121B',
    emissive: '#000000',
    emissiveIntensity: 0,
    opacity: 0.18,
    metalness: 0.1,
    roughness: 0.45,
    clearcoat: 0.3,
    clearcoatRoughness: 0.3,
    edgeColor: '#3A4254',
    glowColor: '#3A4254',
    depthWrite: false,
    dimmed: true,
  };
}

interface PlanePanelProps {
  width: number;
  height: number;
  style: FaceStyle;
  position?: [number, number, number];
  rotation?: [number, number, number];
  jointCorners?: [number, number, number][];
}

function PlanePanel({
  width,
  height,
  style,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  jointCorners,
}: PlanePanelProps) {
  const geom = useMemo(() => new THREE.PlaneGeometry(width, height), [width, height]);
  useEffect(() => () => geom.dispose(), [geom]);

  return (
    <group position={position} rotation={rotation}>
      <mesh geometry={geom} renderOrder={style.depthWrite ? 0 : 1}>
        <meshPhysicalMaterial
          color={style.color}
          emissive={style.emissive}
          emissiveIntensity={style.emissiveIntensity}
          transparent
          opacity={style.opacity}
          side={THREE.DoubleSide}
          roughness={style.roughness}
          metalness={style.metalness}
          clearcoat={style.clearcoat}
          clearcoatRoughness={style.clearcoatRoughness}
          reflectivity={0.95}
          ior={1.52}
          envMapIntensity={1.35}
          depthWrite={style.depthWrite}
        />
        <EdgeOutline geometry={geom} color={style.edgeColor} glowColor={style.glowColor} />
      </mesh>
      {jointCorners && jointCorners.length > 0 && (
        <BrassJoints positions={jointCorners} dimmed={style.dimmed} />
      )}
    </group>
  );
}

interface LaserCutRingProps {
  points: [number, number, number][];
  y: number;
  planeW: number;
  planeD: number;
}

function LaserCutRing({ points, y, planeW, planeD }: LaserCutRingProps) {
  const tubes = useMemo(() => {
    const items: {
      pos: [number, number, number];
      quat: THREE.Quaternion;
      len: number;
    }[] = [];
    const up = new THREE.Vector3(0, 1, 0);
    for (let i = 0; i < points.length - 1; i++) {
      const a = new THREE.Vector3(...points[i]);
      const b = new THREE.Vector3(...points[i + 1]);
      const dir = new THREE.Vector3().subVectors(b, a);
      const len = dir.length();
      if (len < 1e-4) continue;
      const mid = new THREE.Vector3().addVectors(a, b).multiplyScalar(0.5);
      const quat = new THREE.Quaternion().setFromUnitVectors(up, dir.clone().normalize());
      items.push({ pos: [mid.x, mid.y, mid.z], quat, len });
    }
    return items;
  }, [points]);

  const unitCyl = useMemo(() => new THREE.CylinderGeometry(0.024, 0.024, 1, 10), []);
  const glowCyl = useMemo(() => new THREE.CylinderGeometry(0.056, 0.056, 1, 10), []);
  const cornerSphere = useMemo(() => new THREE.SphereGeometry(0.052, 12, 12), []);
  const planeGeom = useMemo(() => new THREE.PlaneGeometry(planeW, planeD), [planeW, planeD]);
  const planeEdges = useMemo(() => new THREE.EdgesGeometry(planeGeom), [planeGeom]);

  useEffect(() => {
    return () => {
      unitCyl.dispose();
      glowCyl.dispose();
      cornerSphere.dispose();
      planeGeom.dispose();
      planeEdges.dispose();
    };
  }, [unitCyl, glowCyl, cornerSphere, planeGeom, planeEdges]);

  const uniqueCorners = points.slice(0, Math.max(0, points.length - 1));

  return (
    <group>
      {/* Translucent golden-cyan laser slicing plane */}
      <mesh geometry={planeGeom} rotation={[-Math.PI / 2, 0, 0]} position={[0, y, 0]} renderOrder={2}>
        <meshBasicMaterial
          color="#46D6E8"
          transparent
          opacity={0.11}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
      <lineSegments geometry={planeEdges} rotation={[-Math.PI / 2, 0, 0]} position={[0, y, 0]}>
        <lineBasicMaterial color="#F4C46C" transparent opacity={0.35} />
      </lineSegments>

      {/* Blazing 3D laser cut ring */}
      {tubes.map((seg, i) => (
        <group key={i} position={seg.pos} quaternion={seg.quat}>
          <mesh geometry={unitCyl} scale={[1, seg.len, 1]} renderOrder={5}>
            <meshBasicMaterial color="#FFE29E" toneMapped={false} />
          </mesh>
          <mesh geometry={glowCyl} scale={[1, seg.len, 1]} renderOrder={4}>
            <meshBasicMaterial
              color="#FF8563"
              transparent
              opacity={0.42}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
              toneMapped={false}
            />
          </mesh>
        </group>
      ))}
      {uniqueCorners.map((pt, idx) => (
        <mesh key={idx} geometry={cornerSphere} position={pt} renderOrder={5}>
          <meshBasicMaterial color="#46D6E8" toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}

interface DampedOrbitControlsProps {
  autoOrbitSpeed: number;
}

function DampedOrbitControls({ autoOrbitSpeed }: DampedOrbitControlsProps) {
  const { camera, gl, invalidate } = useThree();
  const controlsRef = useRef<OrbitControls | null>(null);

  useEffect(() => {
    const controls = new OrbitControls(camera, gl.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.rotateSpeed = 0.8;
    controls.zoomSpeed = 0.85;
    controls.minDistance = 3.2;
    controls.maxDistance = 15.5;
    controls.maxPolarAngle = Math.PI * 0.49;
    controls.autoRotate = autoOrbitSpeed > 0;
    controls.autoRotateSpeed = autoOrbitSpeed;

    const onChange = () => invalidate();
    controls.addEventListener('change', onChange);
    controlsRef.current = controls;
    invalidate();

    return () => {
      controls.removeEventListener('change', onChange);
      controls.dispose();
      controlsRef.current = null;
    };
  }, [camera, gl, invalidate, autoOrbitSpeed]);

  useFrame(() => {
    const c = controlsRef.current;
    if (!c) return;
    if (c.update() || autoOrbitSpeed > 0) {
      invalidate();
    }
  });

  return null;
}

function ArticulatedSolid({
  solid,
  width,
  depth,
  height,
  unfold,
  highlightPart = 'all',
  showInternalTriangle = false,
  sliceHeight = null,
}: Omit<SolidNetSceneProps, 'autoOrbitSpeed' | 'heightClass'>) {
  const { invalidate } = useThree();
  const reducedMotion = useReducedMotion();
  const smoothUnfold = useRef(unfold);

  const rpFrontRef = useRef<THREE.Group>(null);
  const rpBackRef = useRef<THREE.Group>(null);
  const rpTopRef = useRef<THREE.Group>(null);
  const rpRightRef = useRef<THREE.Group>(null);
  const rpLeftRef = useRef<THREE.Group>(null);

  const pyrHinge0 = useRef<THREE.Group>(null);
  const pyrHinge1 = useRef<THREE.Group>(null);
  const pyrHinge2 = useRef<THREE.Group>(null);
  const pyrHinge3 = useRef<THREE.Group>(null);
  const pyrHingeRefs = [pyrHinge0, pyrHinge1, pyrHinge2, pyrHinge3];

  const tpFrontRef = useRef<THREE.Group>(null);
  const tpBackRef = useRef<THREE.Group>(null);
  const tpRightRef = useRef<THREE.Group>(null);
  const tpLeftRef = useRef<THREE.Group>(null);

  const S = width;
  const pyrSlant = Math.sqrt(height * height + (S / 2) * (S / 2));
  const pyrTheta0 = -Math.atan2(S / 2, height);

  const tpSlant = Math.sqrt(height * height + (width / 2) * (width / 2));
  const tpPhi0 = Math.atan2(width / 2, height);

  const pyrTriangleGeom = useMemo(() => makeTriangleGeometry(S, pyrSlant), [S, pyrSlant]);
  const tpCapGeom = useMemo(() => makeTriangleGeometry(width, height), [width, height]);
  const floorDiscGeom = useMemo(() => new THREE.CircleGeometry(7.6, 64), []);

  useEffect(() => () => pyrTriangleGeom.dispose(), [pyrTriangleGeom]);
  useEffect(() => () => tpCapGeom.dispose(), [tpCapGeom]);
  useEffect(() => () => floorDiscGeom.dispose(), [floorDiscGeom]);

  const applyHingeRotations = useCallback(
    (u: number) => {
      if (solid === 'rectangular-prism') {
        if (rpFrontRef.current) rpFrontRef.current.rotation.x = u * (Math.PI / 2);
        if (rpBackRef.current) rpBackRef.current.rotation.x = -u * (Math.PI / 2);
        if (rpTopRef.current) rpTopRef.current.rotation.x = -u * (Math.PI / 2);
        if (rpRightRef.current) rpRightRef.current.rotation.z = -u * (Math.PI / 2);
        if (rpLeftRef.current) rpLeftRef.current.rotation.z = u * (Math.PI / 2);
      } else if (solid === 'square-pyramid') {
        const theta = pyrTheta0 + u * (Math.PI / 2 - pyrTheta0);
        if (pyrHinge0.current) pyrHinge0.current.rotation.x = theta;
        if (pyrHinge1.current) pyrHinge1.current.rotation.x = theta;
        if (pyrHinge2.current) pyrHinge2.current.rotation.x = theta;
        if (pyrHinge3.current) pyrHinge3.current.rotation.x = theta;
      } else if (solid === 'triangular-prism') {
        if (tpFrontRef.current) tpFrontRef.current.rotation.x = u * (Math.PI / 2);
        if (tpBackRef.current) tpBackRef.current.rotation.x = -u * (Math.PI / 2);
        if (tpRightRef.current) tpRightRef.current.rotation.z = tpPhi0 + u * (-Math.PI / 2 - tpPhi0);
        if (tpLeftRef.current) tpLeftRef.current.rotation.z = -tpPhi0 + u * (Math.PI / 2 + tpPhi0);
      }
    },
    [solid, pyrTheta0, tpPhi0]
  );

  useLayoutEffect(() => {
    applyHingeRotations(smoothUnfold.current);
    invalidate();
  }, [solid, width, depth, height, unfold, applyHingeRotations, invalidate]);

  useEffect(() => {
    invalidate();
  }, [
    solid,
    width,
    depth,
    height,
    unfold,
    highlightPart,
    showInternalTriangle,
    sliceHeight,
    invalidate,
  ]);

  const baseStyle = getFaceStyle('base', highlightPart);
  const lateralStyle = getFaceStyle('lateral', highlightPart);
  const yCenterOffset = -0.85;

  useFrame((_, delta) => {
    const diff = Math.abs(smoothUnfold.current - unfold);
    if (reducedMotion || diff <= 0.0005) {
      smoothUnfold.current = unfold;
    } else {
      const step = 1 - Math.exp(-14 * Math.min(delta, 0.05));
      smoothUnfold.current += (unfold - smoothUnfold.current) * step;
      invalidate();
    }

    applyHingeRotations(smoothUnfold.current);
  });

  const sliceOutline = useMemo(() => {
    if (sliceHeight === null || sliceHeight === undefined) return null;
    const t = Math.min(0.95, Math.max(0.05, sliceHeight));
    const y = t * height;
    if (solid === 'rectangular-prism') {
      const hw = width / 2;
      const hd = depth / 2;
      return {
        y,
        points: [
          [-hw, y, -hd],
          [hw, y, -hd],
          [hw, y, hd],
          [-hw, y, hd],
          [-hw, y, -hd],
        ] as [number, number, number][],
        planeW: width * 1.48,
        planeD: depth * 1.48,
      };
    }
    if (solid === 'square-pyramid') {
      const hs = ((1 - t) * S) / 2;
      return {
        y,
        points: [
          [-hs, y, -hs],
          [hs, y, -hs],
          [hs, y, hs],
          [-hs, y, hs],
          [-hs, y, -hs],
        ] as [number, number, number][],
        planeW: S * 1.48,
        planeD: S * 1.48,
      };
    }
    const hw = ((1 - t) * width) / 2;
    const hd = depth / 2;
    return {
      y,
      points: [
        [-hw, y, -hd],
        [hw, y, -hd],
        [hw, y, hd],
        [-hw, y, hd],
        [-hw, y, -hd],
      ] as [number, number, number][],
      planeW: width * 1.48,
      planeD: depth * 1.48,
    };
  }, [sliceHeight, solid, width, depth, height, S]);

  const xAxisPts = useMemo<[number, number, number][]>(() => [[-6, -0.012, 0], [6, -0.012, 0]], []);
  const zAxisPts = useMemo<[number, number, number][]>(() => [[0, -0.012, -6], [0, -0.012, 6]], []);
  const yAxisPts = useMemo<[number, number, number][]>(
    () => [[0, 0, 0], [0, height + 1.25, 0]],
    [height]
  );

  const pyrAltPts = useMemo<[number, number, number][]>(() => [[0, 0, 0], [0, height, 0]], [height]);
  const pyrApoPts = useMemo<[number, number, number][]>(() => [[0, 0.014, 0], [0, 0.014, S / 2]], [S]);
  const pyrSlantPts = useMemo<[number, number, number][]>(
    () => [[0, 0, S / 2], [0, height, 0]],
    [S, height]
  );
  const rightAnglePts = useMemo<[number, number, number][]>(
    () => [[0, 0.34, 0], [0, 0.34, 0.34], [0, 0.014, 0.34]],
    []
  );

  const rectCorners = (w: number, h: number): [number, number, number][] => [
    [-w / 2, -h / 2, 0],
    [w / 2, -h / 2, 0],
    [w / 2, h / 2, 0],
    [-w / 2, h / 2, 0],
  ];

  const topEdgeCorners = (w: number, h: number): [number, number, number][] => [
    [-w / 2, h / 2, 0],
    [w / 2, h / 2, 0],
  ];

  const bottomEdgeCorners = (w: number, h: number): [number, number, number][] => [
    [-w / 2, -h / 2, 0],
    [w / 2, -h / 2, 0],
  ];

  return (
    <group position={[0, yCenterOffset, 0]}>
      {/* Metric Coordinate Floor Grid */}
      <mesh geometry={floorDiscGeom} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.026, 0]}>
        <meshStandardMaterial color="#07090F" roughness={0.92} metalness={0.12} />
      </mesh>
      <gridHelper args={[14, 14, '#5A4520', '#1B1914']} position={[0, -0.018, 0]} />
      <SegmentLine points={xAxisPts} color="#A68238" opacity={0.5} />
      <SegmentLine points={zAxisPts} color="#2B7285" opacity={0.5} />
      <SegmentLine points={yAxisPts} color="#F4C46C" dashed opacity={0.4} />

      {solid === 'rectangular-prism' && (
        <group>
          <PlanePanel
            width={width}
            height={depth}
            rotation={[-Math.PI / 2, 0, 0]}
            style={baseStyle}
            jointCorners={rectCorners(width, depth)}
          />
          <group ref={rpFrontRef} position={[0, 0, depth / 2]}>
            <PlanePanel
              width={width}
              height={height}
              position={[0, height / 2, 0]}
              style={lateralStyle}
              jointCorners={topEdgeCorners(width, height)}
            />
          </group>
          <group ref={rpBackRef} position={[0, 0, -depth / 2]}>
            <PlanePanel
              width={width}
              height={height}
              position={[0, height / 2, 0]}
              style={lateralStyle}
              jointCorners={topEdgeCorners(width, height)}
            />
            <group ref={rpTopRef} position={[0, height, 0]}>
              <PlanePanel
                width={width}
                height={depth}
                position={[0, 0, depth / 2]}
                rotation={[-Math.PI / 2, 0, 0]}
                style={baseStyle}
                jointCorners={bottomEdgeCorners(width, depth)}
              />
            </group>
          </group>
          <group ref={rpRightRef} position={[width / 2, 0, 0]}>
            <PlanePanel
              width={depth}
              height={height}
              position={[0, height / 2, 0]}
              rotation={[0, Math.PI / 2, 0]}
              style={lateralStyle}
              jointCorners={topEdgeCorners(depth, height)}
            />
          </group>
          <group ref={rpLeftRef} position={[-width / 2, 0, 0]}>
            <PlanePanel
              width={depth}
              height={height}
              position={[0, height / 2, 0]}
              rotation={[0, Math.PI / 2, 0]}
              style={lateralStyle}
              jointCorners={topEdgeCorners(depth, height)}
            />
          </group>
        </group>
      )}

      {solid === 'square-pyramid' && (
        <group>
          <PlanePanel
            width={S}
            height={S}
            rotation={[-Math.PI / 2, 0, 0]}
            style={baseStyle}
            jointCorners={rectCorners(S, S)}
          />

          {[0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2].map((rotY, idx) => (
            <group key={idx} rotation={[0, rotY, 0]}>
              <group ref={pyrHingeRefs[idx]} position={[0, 0, S / 2]}>
                <mesh geometry={pyrTriangleGeom} renderOrder={lateralStyle.depthWrite ? 0 : 1}>
                  <meshPhysicalMaterial
                    color={lateralStyle.color}
                    emissive={lateralStyle.emissive}
                    emissiveIntensity={lateralStyle.emissiveIntensity}
                    transparent
                    opacity={lateralStyle.opacity}
                    side={THREE.DoubleSide}
                    roughness={lateralStyle.roughness}
                    metalness={lateralStyle.metalness}
                    clearcoat={lateralStyle.clearcoat}
                    clearcoatRoughness={lateralStyle.clearcoatRoughness}
                    reflectivity={0.95}
                    ior={1.52}
                    envMapIntensity={1.35}
                    depthWrite={lateralStyle.depthWrite}
                  />
                  <EdgeOutline
                    geometry={pyrTriangleGeom}
                    color={lateralStyle.edgeColor}
                    glowColor={lateralStyle.glowColor}
                  />
                </mesh>
                <BrassJoints positions={[[0, pyrSlant, 0]]} dimmed={lateralStyle.dimmed} />
              </group>
            </group>
          ))}

          {showInternalTriangle && unfold < 0.35 && (
            <group>
              <SegmentLine points={pyrAltPts} color="#FF8563" />
              <SegmentLine points={pyrApoPts} color="#F4C46C" />
              <SegmentLine points={pyrSlantPts} color="#45E6A6" />
              <SegmentLine points={rightAnglePts} color="#F7F4EC" />
              <BrassJoints positions={[[0, 0, 0], [0, 0, S / 2]]} />
            </group>
          )}
        </group>
      )}

      {solid === 'triangular-prism' && (
        <group>
          <PlanePanel
            width={width}
            height={depth}
            rotation={[-Math.PI / 2, 0, 0]}
            style={lateralStyle}
            jointCorners={rectCorners(width, depth)}
          />
          <group ref={tpFrontRef} position={[0, 0, depth / 2]}>
            <mesh geometry={tpCapGeom} renderOrder={baseStyle.depthWrite ? 0 : 1}>
              <meshPhysicalMaterial
                color={baseStyle.color}
                emissive={baseStyle.emissive}
                emissiveIntensity={baseStyle.emissiveIntensity}
                transparent
                opacity={baseStyle.opacity}
                side={THREE.DoubleSide}
                roughness={baseStyle.roughness}
                metalness={baseStyle.metalness}
                clearcoat={baseStyle.clearcoat}
                clearcoatRoughness={baseStyle.clearcoatRoughness}
                reflectivity={0.95}
                ior={1.52}
                envMapIntensity={1.35}
                depthWrite={baseStyle.depthWrite}
              />
              <EdgeOutline
                geometry={tpCapGeom}
                color={baseStyle.edgeColor}
                glowColor={baseStyle.glowColor}
              />
            </mesh>
            <BrassJoints positions={[[0, height, 0]]} dimmed={baseStyle.dimmed} />
          </group>
          <group ref={tpBackRef} position={[0, 0, -depth / 2]}>
            <mesh geometry={tpCapGeom} renderOrder={baseStyle.depthWrite ? 0 : 1}>
              <meshPhysicalMaterial
                color={baseStyle.color}
                emissive={baseStyle.emissive}
                emissiveIntensity={baseStyle.emissiveIntensity}
                transparent
                opacity={baseStyle.opacity}
                side={THREE.DoubleSide}
                roughness={baseStyle.roughness}
                metalness={baseStyle.metalness}
                clearcoat={baseStyle.clearcoat}
                clearcoatRoughness={baseStyle.clearcoatRoughness}
                reflectivity={0.95}
                ior={1.52}
                envMapIntensity={1.35}
                depthWrite={baseStyle.depthWrite}
              />
              <EdgeOutline
                geometry={tpCapGeom}
                color={baseStyle.edgeColor}
                glowColor={baseStyle.glowColor}
              />
            </mesh>
            <BrassJoints positions={[[0, height, 0]]} dimmed={baseStyle.dimmed} />
          </group>
          <group ref={tpRightRef} position={[width / 2, 0, 0]}>
            <PlanePanel
              width={depth}
              height={tpSlant}
              position={[0, tpSlant / 2, 0]}
              rotation={[0, Math.PI / 2, 0]}
              style={lateralStyle}
              jointCorners={topEdgeCorners(depth, tpSlant)}
            />
          </group>
          <group ref={tpLeftRef} position={[-width / 2, 0, 0]}>
            <PlanePanel
              width={depth}
              height={tpSlant}
              position={[0, tpSlant / 2, 0]}
              rotation={[0, Math.PI / 2, 0]}
              style={lateralStyle}
              jointCorners={topEdgeCorners(depth, tpSlant)}
            />
          </group>
        </group>
      )}

      {sliceOutline && unfold < 0.15 && (
        <LaserCutRing
          points={sliceOutline.points}
          y={sliceOutline.y}
          planeW={sliceOutline.planeW}
          planeD={sliceOutline.planeD}
        />
      )}
    </group>
  );
}

export function SolidNetScene({
  solid,
  width,
  depth,
  height,
  unfold,
  highlightPart = 'all',
  showInternalTriangle = false,
  sliceHeight = null,
  autoOrbitSpeed = 0,
  heightClass = 'h-[400px] sm:h-[440px]',
  showControlsHint = true,
}: SolidNetSceneProps) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const [nearViewport, setNearViewport] = useState(false);

  useEffect(() => {
    const el = hostRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setNearViewport(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        setNearViewport(entries.some((e) => e.isIntersecting));
      },
      { rootMargin: '200px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const cappedDpr = useMemo(
    () => (typeof window !== 'undefined' ? Math.min(window.devicePixelRatio || 1, 2) : 1),
    []
  );

  return (
    <div ref={hostRef} className={`relative w-full ${heightClass} bg-[#06070B] overflow-hidden`}>
      {nearViewport ? (
        <WebGLErrorBoundary>
          <Canvas
            frameloop={autoOrbitSpeed > 0 ? 'always' : 'demand'}
            dpr={cappedDpr}
            camera={{ position: [7.1, 5.5, 7.9], fov: 38, near: 0.1, far: 100 }}
            gl={{ antialias: true, powerPreference: 'high-performance' }}
          >
            <color attach="background" args={['#06070B']} />
            <StudioEnvironment />
            <ambientLight intensity={0.32} color="#FFE8C2" />
            <hemisphereLight args={['#FFF2D6', '#07090F', 0.55]} />
            <directionalLight position={[6, 11, 7]} intensity={1.45} color="#FFE29E" />
            <directionalLight position={[-7, 5, -6]} intensity={0.9} color="#46D6E8" />
            <pointLight position={[0, -1.5, 5]} intensity={0.6} distance={14} color="#F4C46C" />

            <ArticulatedSolid
              solid={solid}
              width={width}
              depth={depth}
              height={height}
              unfold={unfold}
              highlightPart={highlightPart}
              showInternalTriangle={showInternalTriangle}
              sliceHeight={sliceHeight}
            />

            <DampedOrbitControls autoOrbitSpeed={autoOrbitSpeed} />
          </Canvas>
        </WebGLErrorBoundary>
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-[#06070B] font-mono-data text-xs text-[#A8B2C6]">
          Observatory 3D Viewport Standing By…
        </div>
      )}

      {showControlsHint && (
        <div className="pointer-events-none absolute bottom-2.5 left-3 px-2.5 py-1 rounded-md bg-[#0B0C12]/85 border border-[rgba(244,196,108,0.2)] text-[11px] font-mono-data text-[#A8B2C6]">
          Drag to orbit · Scroll to zoom · Right-drag to pan
        </div>
      )}
    </div>
  );
}

export default SolidNetScene;
