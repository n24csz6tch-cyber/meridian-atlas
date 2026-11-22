import { useCallback, useEffect, useLayoutEffect, useMemo, useRef } from 'react';
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
  geom.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
  geom.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
  geom.computeBoundingSphere();
  return geom;
}

interface SegmentLineProps {
  points: [number, number, number][];
  color: string;
  dashed?: boolean;
}

function SegmentLine({ points, color, dashed = false }: SegmentLineProps) {
  const lineObj = useMemo(() => {
    const geom = new THREE.BufferGeometry().setFromPoints(
      points.map((p) => new THREE.Vector3(p[0], p[1], p[2]))
    );
    const mat = dashed
      ? new THREE.LineDashedMaterial({ color, dashSize: 0.2, gapSize: 0.14 })
      : new THREE.LineBasicMaterial({ color });
    const line = new THREE.Line(geom, mat);
    if (dashed) line.computeLineDistances();
    return line;
  }, [points, color, dashed]);

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
}

function EdgeOutline({ geometry, color }: EdgeOutlineProps) {
  const edgesGeom = useMemo(() => new THREE.EdgesGeometry(geometry, 15), [geometry]);
  useEffect(() => () => edgesGeom.dispose(), [edgesGeom]);

  return (
    <lineSegments geometry={edgesGeom}>
      <lineBasicMaterial color={color} />
    </lineSegments>
  );
}

interface PlanePanelProps {
  width: number;
  height: number;
  color: string;
  emissive: string;
  emissiveIntensity: number;
  opacity: number;
  edgeColor: string;
  position?: [number, number, number];
  rotation?: [number, number, number];
}

function PlanePanel({
  width,
  height,
  color,
  emissive,
  emissiveIntensity,
  opacity,
  edgeColor,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
}: PlanePanelProps) {
  const geom = useMemo(() => new THREE.PlaneGeometry(width, height), [width, height]);
  useEffect(() => () => geom.dispose(), [geom]);

  return (
    <mesh geometry={geom} position={position} rotation={rotation}>
      <meshStandardMaterial
        color={color}
        emissive={emissive}
        emissiveIntensity={emissiveIntensity}
        transparent
        opacity={opacity}
        side={THREE.DoubleSide}
        roughness={0.45}
        metalness={0.1}
      />
      <EdgeOutline geometry={geom} color={edgeColor} />
    </mesh>
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
    controls.dampingFactor = 0.08;
    controls.minDistance = 3.2;
    controls.maxDistance = 15;
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

interface FaceStyle {
  color: string;
  emissive: string;
  emissiveIntensity: number;
  opacity: number;
  edgeColor: string;
}

function getFaceStyle(role: 'base' | 'lateral', highlight: SolidHighlightPart): FaceStyle {
  if (highlight === 'all') {
    if (role === 'base') {
      return {
        color: '#193554',
        emissive: '#0c243d',
        emissiveIntensity: 0.35,
        opacity: 0.88,
        edgeColor: '#38BDF8',
      };
    }
    return {
      color: '#1d4a68',
      emissive: '#0e364f',
      emissiveIntensity: 0.25,
      opacity: 0.84,
      edgeColor: '#7DD3FC',
    };
  }

  if (highlight === role) {
    return role === 'base'
      ? {
          color: '#0ea5e9',
          emissive: '#0284c7',
          emissiveIntensity: 0.45,
          opacity: 0.92,
          edgeColor: '#BAE6FD',
        }
      : {
          color: '#22d3ee',
          emissive: '#0891b2',
          emissiveIntensity: 0.4,
          opacity: 0.9,
          edgeColor: '#CFFAFE',
        };
  }

  return {
    color: '#141B27',
    emissive: '#000000',
    emissiveIntensity: 0,
    opacity: 0.24,
    edgeColor: '#475569',
  };
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

  useEffect(() => () => pyrTriangleGeom.dispose(), [pyrTriangleGeom]);
  useEffect(() => () => tpCapGeom.dispose(), [tpCapGeom]);

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
        planeW: width * 1.45,
        planeD: depth * 1.45,
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
        planeW: S * 1.45,
        planeD: S * 1.45,
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
      planeW: width * 1.45,
      planeD: depth * 1.45,
    };
  }, [sliceHeight, solid, width, depth, height, S]);

  const xAxisPts = useMemo<[number, number, number][]>(() => [[-5, -0.012, 0], [5, -0.012, 0]], []);
  const zAxisPts = useMemo<[number, number, number][]>(() => [[0, -0.012, -5], [0, -0.012, 5]], []);
  const yAxisPts = useMemo<[number, number, number][]>(
    () => [[0, 0, 0], [0, height + 1.2, 0]],
    [height]
  );

  const pyrAltPts = useMemo<[number, number, number][]>(() => [[0, 0, 0], [0, height, 0]], [height]);
  const pyrApoPts = useMemo<[number, number, number][]>(() => [[0, 0.01, 0], [0, 0.01, S / 2]], [S]);
  const pyrSlantPts = useMemo<[number, number, number][]>(
    () => [[0, 0, S / 2], [0, height, 0]],
    [S, height]
  );
  const rightAnglePts = useMemo<[number, number, number][]>(
    () => [[0, 0.32, 0], [0, 0.32, 0.32], [0, 0.01, 0.32]],
    []
  );

  return (
    <group position={[0, yCenterOffset, 0]}>
      <gridHelper args={[16, 16, '#263449', '#16202F']} position={[0, -0.018, 0]} />
      <SegmentLine points={xAxisPts} color="#334155" />
      <SegmentLine points={zAxisPts} color="#334155" />
      <SegmentLine points={yAxisPts} color="#283548" dashed />

      {solid === 'rectangular-prism' && (
        <group>
          <PlanePanel
            width={width}
            height={depth}
            rotation={[-Math.PI / 2, 0, 0]}
            {...baseStyle}
          />
          <group ref={rpFrontRef} position={[0, 0, depth / 2]}>
            <PlanePanel width={width} height={height} position={[0, height / 2, 0]} {...lateralStyle} />
          </group>
          <group ref={rpBackRef} position={[0, 0, -depth / 2]}>
            <PlanePanel width={width} height={height} position={[0, height / 2, 0]} {...lateralStyle} />
            <group ref={rpTopRef} position={[0, height, 0]}>
              <PlanePanel
                width={width}
                height={depth}
                position={[0, 0, depth / 2]}
                rotation={[-Math.PI / 2, 0, 0]}
                {...baseStyle}
              />
            </group>
          </group>
          <group ref={rpRightRef} position={[width / 2, 0, 0]}>
            <PlanePanel
              width={depth}
              height={height}
              position={[0, height / 2, 0]}
              rotation={[0, Math.PI / 2, 0]}
              {...lateralStyle}
            />
          </group>
          <group ref={rpLeftRef} position={[-width / 2, 0, 0]}>
            <PlanePanel
              width={depth}
              height={height}
              position={[0, height / 2, 0]}
              rotation={[0, Math.PI / 2, 0]}
              {...lateralStyle}
            />
          </group>
        </group>
      )}

      {solid === 'square-pyramid' && (
        <group>
          <PlanePanel width={S} height={S} rotation={[-Math.PI / 2, 0, 0]} {...baseStyle} />

          {[0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2].map((rotY, idx) => (
            <group key={idx} rotation={[0, rotY, 0]}>
              <group ref={pyrHingeRefs[idx]} position={[0, 0, S / 2]}>
                <mesh geometry={pyrTriangleGeom}>
                  <meshStandardMaterial
                    color={lateralStyle.color}
                    emissive={lateralStyle.emissive}
                    emissiveIntensity={lateralStyle.emissiveIntensity}
                    transparent
                    opacity={lateralStyle.opacity}
                    side={THREE.DoubleSide}
                    roughness={0.45}
                    metalness={0.1}
                  />
                  <EdgeOutline geometry={pyrTriangleGeom} color={lateralStyle.edgeColor} />
                </mesh>
              </group>
            </group>
          ))}

          {showInternalTriangle && unfold < 0.35 && (
            <group>
              <SegmentLine points={pyrAltPts} color="#F9735B" />
              <SegmentLine points={pyrApoPts} color="#E5A94C" />
              <SegmentLine points={pyrSlantPts} color="#34D399" />
              <SegmentLine points={rightAnglePts} color="#EDEBE4" />
            </group>
          )}
        </group>
      )}

      {solid === 'triangular-prism' && (
        <group>
          <PlanePanel width={width} height={depth} rotation={[-Math.PI / 2, 0, 0]} {...lateralStyle} />
          <group ref={tpFrontRef} position={[0, 0, depth / 2]}>
            <mesh geometry={tpCapGeom}>
              <meshStandardMaterial
                color={baseStyle.color}
                emissive={baseStyle.emissive}
                emissiveIntensity={baseStyle.emissiveIntensity}
                transparent
                opacity={baseStyle.opacity}
                side={THREE.DoubleSide}
                roughness={0.45}
                metalness={0.1}
              />
              <EdgeOutline geometry={tpCapGeom} color={baseStyle.edgeColor} />
            </mesh>
          </group>
          <group ref={tpBackRef} position={[0, 0, -depth / 2]}>
            <mesh geometry={tpCapGeom}>
              <meshStandardMaterial
                color={baseStyle.color}
                emissive={baseStyle.emissive}
                emissiveIntensity={baseStyle.emissiveIntensity}
                transparent
                opacity={baseStyle.opacity}
                side={THREE.DoubleSide}
                roughness={0.45}
                metalness={0.1}
              />
              <EdgeOutline geometry={tpCapGeom} color={baseStyle.edgeColor} />
            </mesh>
          </group>
          <group ref={tpRightRef} position={[width / 2, 0, 0]}>
            <PlanePanel
              width={depth}
              height={tpSlant}
              position={[0, tpSlant / 2, 0]}
              rotation={[0, Math.PI / 2, 0]}
              {...lateralStyle}
            />
          </group>
          <group ref={tpLeftRef} position={[-width / 2, 0, 0]}>
            <PlanePanel
              width={depth}
              height={tpSlant}
              position={[0, tpSlant / 2, 0]}
              rotation={[0, Math.PI / 2, 0]}
              {...lateralStyle}
            />
          </group>
        </group>
      )}

      {sliceOutline && unfold < 0.15 && (
        <group>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, sliceOutline.y, 0]}>
            <planeGeometry args={[sliceOutline.planeW, sliceOutline.planeD]} />
            <meshBasicMaterial
              color="#38BDF8"
              transparent
              opacity={0.14}
              side={THREE.DoubleSide}
              depthWrite={false}
            />
          </mesh>
          <SegmentLine points={sliceOutline.points} color="#F9735B" />
        </group>
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
  return (
    <div className={`relative w-full ${heightClass} bg-[#0B1018] overflow-hidden`}>
      <WebGLErrorBoundary>
        <Canvas
          frameloop={autoOrbitSpeed > 0 ? 'always' : 'demand'}
          dpr={[1, 1.75]}
          camera={{ position: [7.2, 5.6, 8.0], fov: 38, near: 0.1, far: 100 }}
          gl={{ antialias: true, powerPreference: 'high-performance' }}
        >
          <color attach="background" args={['#0B1018']} />
          <ambientLight intensity={0.48} />
          <hemisphereLight args={['#e8f4ff', '#0b1019', 0.65]} />
          <directionalLight position={[6, 10, 7]} intensity={1.15} color="#fff7eb" />
          <directionalLight position={[-6, 4, -5]} intensity={0.5} color="#38bdf8" />

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

      {showControlsHint && (
        <div className="pointer-events-none absolute bottom-2.5 left-3 px-2.5 py-1 rounded bg-[#0A0D12]/80 border border-[rgba(237,235,228,0.12)] text-[11px] font-mono-data text-[#9CA6B8]">
          Drag to orbit · Scroll to zoom · Right-drag to pan
        </div>
      )}
    </div>
  );
}

export default SolidNetScene;
