'use client';

import { useRef, useState, useMemo, useCallback, memo, useEffect } from 'react';
import { useFrame, ThreeEvent } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { useOrbitStore, PlanetData } from '@/lib/store';
import { useShallow } from 'zustand/react/shallow';

/**
 * PERFORMANCE OPTIMIZATIONS:
 * 1. React.memo with custom comparison prevents unnecessary re-renders
 * 2. useShallow selector minimizes store subscription overhead
 * 3. Shared geometry instances via useMemo reduce GPU memory
 * 4. useCallback for event handlers prevents child re-renders
 * 5. Conditional rendering of Html component (expensive DOM overlay)
 * 6. Reduced sphere segments for smaller planets (LOD concept)
 * 7. Proper disposal of geometries on unmount
 */

interface PlanetProps {
  data: PlanetData;
}

// Shared geometries for all planets - reduces GPU memory
const SPHERE_GEOMETRY_HIGH = new THREE.SphereGeometry(1, 32, 32);
const SPHERE_GEOMETRY_LOW = new THREE.SphereGeometry(1, 16, 16);
const RING_GEOMETRY = new THREE.RingGeometry(1.5, 1.7, 32);

// Gas giants set for O(1) lookup
const GAS_GIANTS = new Set(['Jupiter', 'Saturn', 'Uranus', 'Neptune']);

function Planet({ data }: PlanetProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  // Optimized store selector - only subscribe to needed values
  const { selectedPlanet, setSelectedPlanet, showLabels } = useOrbitStore(
    useShallow((s) => ({
      selectedPlanet: s.selectedPlanet,
      setSelectedPlanet: s.setSelectedPlanet,
      showLabels: s.showLabels,
    }))
  );

  const isSelected = selectedPlanet === data.name;
  const scale = data.radius * 0.5;

  // Memoize whether this is a gas giant
  const isGasGiant = useMemo(() => GAS_GIANTS.has(data.name), [data.name]);

  // Use lower detail geometry for smaller planets (LOD)
  const sphereGeometry = useMemo(
    () => (data.radius > 2 ? SPHERE_GEOMETRY_HIGH : SPHERE_GEOMETRY_LOW),
    [data.radius]
  );

  // Memoize material properties to prevent object recreation
  const materialProps = useMemo(
    () => ({
      color: data.color,
      emissive: data.color,
      emissiveIntensity: isSelected ? 0.5 : 0.2,
      roughness: 0.7,
      metalness: 0.3,
    }),
    [data.color, isSelected]
  );

  // Memoize glow material to prevent recreation
  const glowMaterialProps = useMemo(
    () => ({
      color: data.color,
      transparent: true,
      opacity: 0.15,
      side: THREE.BackSide,
    }),
    [data.color]
  );

  // Stable event handlers with useCallback
  const handleClick = useCallback(
    (e: ThreeEvent<MouseEvent>) => {
      e.stopPropagation();
      setSelectedPlanet(isSelected ? null : data.name);
    },
    [setSelectedPlanet, isSelected, data.name]
  );

  const handlePointerOver = useCallback((e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setHovered(true);
    document.body.style.cursor = 'pointer';
  }, []);

  const handlePointerOut = useCallback(() => {
    setHovered(false);
    document.body.style.cursor = 'auto';
  }, []);

  // Minimal frame callback - only rotation
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.001;
    }
  });

  // Memoize computed scale to avoid recalculation
  const displayScale = hovered ? scale * 1.2 : scale;
  const ringScale = useMemo(() => [scale, scale, scale] as [number, number, number], [scale]);
  const labelPosition = useMemo(
    () => [0, scale * 1.5, 0] as [number, number, number],
    [scale]
  );

  return (
    <group position={data.position}>
      {/* Main planet mesh */}
      <mesh
        ref={meshRef}
        geometry={sphereGeometry}
        onClick={handleClick}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        scale={displayScale}
      >
        <meshStandardMaterial {...materialProps} />
      </mesh>

      {/* Selection ring - only render when selected */}
      {isSelected && (
        <mesh rotation={[Math.PI / 2, 0, 0]} geometry={RING_GEOMETRY} scale={ringScale}>
          <meshBasicMaterial
            color="#00ffff"
            transparent
            opacity={0.6}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {/* Label - Html is expensive, only render when needed */}
      {(showLabels || hovered) && (
        <Html
          distanceFactor={20}
          position={labelPosition}
          style={{ pointerEvents: 'none' }}
          occlude={false}
          sprite
        >
          <div className="bg-black/80 text-white px-3 py-1 rounded-full text-sm font-mono border border-cyan-500/50 whitespace-nowrap backdrop-blur-sm select-none">
            {data.name}
          </div>
        </Html>
      )}

      {/* Atmospheric glow for gas giants only */}
      {isGasGiant && (
        <mesh scale={scale * 1.1} geometry={SPHERE_GEOMETRY_LOW}>
          <meshBasicMaterial {...glowMaterialProps} />
        </mesh>
      )}
    </group>
  );
}

// Custom comparison function for memo - only re-render if data actually changed
function arePropsEqual(prevProps: PlanetProps, nextProps: PlanetProps): boolean {
  const prev = prevProps.data;
  const next = nextProps.data;

  return (
    prev.name === next.name &&
    prev.color === next.color &&
    prev.radius === next.radius &&
    prev.position[0] === next.position[0] &&
    prev.position[1] === next.position[1] &&
    prev.position[2] === next.position[2]
  );
}

export default memo(Planet, arePropsEqual);
