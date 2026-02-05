'use client';

import { useRef, useMemo, memo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * PERFORMANCE OPTIMIZATIONS:
 * 1. React.memo prevents unnecessary re-renders when parent updates
 * 2. Static geometry with useMemo - computed once per count change
 * 3. Minimal useFrame callback - only rotation update
 * 4. depthWrite: false reduces GPU overdraw
 * 5. Proper cleanup via useEffect to dispose geometry on unmount
 * 6. Instanced attributes avoid per-frame allocations
 */

interface StarFieldProps {
  count?: number;
}

function StarField({ count = 5000 }: StarFieldProps) {
  const pointsRef = useRef<THREE.Points>(null);
  const geometryRef = useRef<THREE.BufferGeometry>(null);

  // Memoize geometry data - only recompute when count changes
  const { positions, colors } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    // Pre-compute constants outside loop
    const TWO_PI = Math.PI * 2;

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;

      // Distribute stars in a sphere shell (500-1000 units)
      const radius = 500 + Math.random() * 500;
      const theta = Math.random() * TWO_PI;
      const phi = Math.acos(2 * Math.random() - 1);

      // Pre-compute sin/cos for reuse
      const sinPhi = Math.sin(phi);

      positions[i3] = radius * sinPhi * Math.cos(theta);
      positions[i3 + 1] = radius * sinPhi * Math.sin(theta);
      positions[i3 + 2] = radius * Math.cos(phi);

      // Star colors with reduced branching
      const colorVariant = Math.random();
      if (colorVariant > 0.8) {
        // Blue-white (20% of stars)
        colors[i3] = 0.6 + Math.random() * 0.4;
        colors[i3 + 1] = 0.7 + Math.random() * 0.3;
        colors[i3 + 2] = 1.0;
      } else if (colorVariant > 0.6) {
        // Yellow-white (20% of stars)
        colors[i3] = 1.0;
        colors[i3 + 1] = 0.9 + Math.random() * 0.1;
        colors[i3 + 2] = 0.7 + Math.random() * 0.3;
      } else {
        // Pure white (60% of stars)
        colors[i3] = 1.0;
        colors[i3 + 1] = 1.0;
        colors[i3 + 2] = 1.0;
      }
    }

    return { positions, colors };
  }, [count]);

  // Cleanup geometry on unmount to prevent memory leaks
  useEffect(() => {
    const geometry = geometryRef.current;
    return () => {
      if (geometry) {
        geometry.dispose();
      }
    };
  }, []);

  // Minimal frame callback - only update rotation
  useFrame((state) => {
    if (pointsRef.current) {
      // Very slow rotation for subtle parallax effect
      pointsRef.current.rotation.y = state.clock.elapsedTime * 0.0001;
    }
  });

  return (
    <points ref={pointsRef} frustumCulled={false}>
      <bufferGeometry ref={geometryRef}>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={count}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={1.5}
        vertexColors
        transparent
        opacity={0.8}
        sizeAttenuation
        depthWrite={false}
        depthTest={false}
      />
    </points>
  );
}

// Memoize component to prevent re-renders from parent state changes
export default memo(StarField);
