'use client';

import { useMemo, memo, useEffect, useRef } from 'react';
import * as THREE from 'three';
import * as Astronomy from 'astronomy-engine';

/**
 * PERFORMANCE OPTIMIZATIONS:
 * 1. React.memo prevents re-renders when parent updates
 * 2. Use LineLoop instead of TubeGeometry (massive reduction in vertices)
 *    - TubeGeometry: 256 segments * 6 radial = 1536+ vertices per orbit
 *    - LineLoop: 120 vertices per orbit (92% reduction)
 * 3. Reduced orbit calculation steps (240 -> 120)
 * 4. Proper geometry disposal on unmount
 * 5. BufferGeometry with Float32Array for better memory layout
 * 6. Pre-computed scale constant
 */

interface OrbitProps {
  planet: string;
  color: string;
}

const SCALE = 10; // 1 AU = 10 units
const ORBIT_STEPS = 120; // Reduced from 240, still smooth visually

function Orbit({ planet, color }: OrbitProps) {
  const geometryRef = useRef<THREE.BufferGeometry>(null);

  // Compute orbit path positions as Float32Array
  const positions = useMemo(() => {
    const positions = new Float32Array((ORBIT_STEPS + 1) * 3);
    const baseDate = new Date();
    const daysPerStep = 365 / ORBIT_STEPS;

    for (let i = 0; i <= ORBIT_STEPS; i++) {
      const date = new Date(baseDate);
      date.setDate(date.getDate() + i * daysPerStep);

      const body = planet as Astronomy.Body;
      const vector = Astronomy.HelioVector(body, date);

      const i3 = i * 3;
      positions[i3] = vector.x * SCALE;
      positions[i3 + 1] = vector.z * SCALE; // Y-up in Three.js
      positions[i3 + 2] = -vector.y * SCALE;
    }

    return positions;
  }, [planet]);

  // Memoize material properties
  const materialProps = useMemo(
    () => ({
      color,
      transparent: true,
      opacity: 0.4,
      linewidth: 1,
      depthWrite: false,
    }),
    [color]
  );

  // Cleanup geometry on unmount
  useEffect(() => {
    const geometry = geometryRef.current;
    return () => {
      if (geometry) {
        geometry.dispose();
      }
    };
  }, []);

  return (
    <lineLoop frustumCulled={false}>
      <bufferGeometry ref={geometryRef}>
        <bufferAttribute
          attach="attributes-position"
          count={ORBIT_STEPS + 1}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <lineBasicMaterial {...materialProps} />
    </lineLoop>
  );
}

// Custom comparison - only re-render if planet or color changes
function arePropsEqual(prev: OrbitProps, next: OrbitProps): boolean {
  return prev.planet === next.planet && prev.color === next.color;
}

export default memo(Orbit, arePropsEqual);
