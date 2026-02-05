'use client';

import { useEffect, useRef, useMemo, memo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useOrbitStore } from '@/lib/store';
import { useShallow } from 'zustand/react/shallow';
import * as THREE from 'three';
import gsap from 'gsap';

/**
 * PERFORMANCE OPTIMIZATIONS:
 * 1. React.memo prevents re-renders from parent state changes
 * 2. useShallow selector minimizes store subscription overhead
 * 3. Memoized Vector3 instances prevent per-frame allocations
 * 4. Reduced motion support with instant transitions
 * 5. Throttled cinematic transitions (5s intervals)
 * 6. Cached planet names array to avoid Map iteration
 * 7. Early returns in useFrame to minimize work
 */

// Reusable Vector3 to avoid allocations in render loop
const tempVector = new THREE.Vector3();
const originVector = new THREE.Vector3(0, 0, 0);

function CameraController() {
  const { camera } = useThree();

  // Optimized store selector
  const { selectedPlanet, cameraMode, planets, cinematicPlaying } = useOrbitStore(
    useShallow((s) => ({
      selectedPlanet: s.selectedPlanet,
      cameraMode: s.cameraMode,
      planets: s.planets,
      cinematicPlaying: s.cinematicPlaying,
    }))
  );

  const cinematicIndex = useRef(0);
  const cinematicTimer = useRef(0);
  const prefersReducedMotion = useRef(false);

  // Cache planet names to avoid repeated Map.keys() calls
  const planetNames = useMemo(() => Array.from(planets.keys()), [planets]);

  // Detect reduced motion preference
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const media = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    if (!media) return;

    const update = () => {
      prefersReducedMotion.current = media.matches;
    };

    update();
    media.addEventListener?.('change', update);
    return () => media.removeEventListener?.('change', update);
  }, []);

  // Handle camera mode transitions
  useEffect(() => {
    const duration = prefersReducedMotion.current ? 0 : 2;
    const ease = prefersReducedMotion.current ? 'none' : 'power2.inOut';

    // Kill any existing tweens to prevent conflicts
    gsap.killTweensOf(camera.position);
    gsap.killTweensOf(camera.rotation);

    if (cameraMode === 'overview') {
      gsap.to(camera.position, {
        x: 0,
        y: 80,
        z: 100,
        duration,
        ease,
      });
      gsap.to(camera.rotation, {
        x: -0.6,
        y: 0,
        z: 0,
        duration,
        ease,
      });
    } else if (cameraMode === 'focused' && selectedPlanet) {
      const planetData = planets.get(selectedPlanet);
      if (planetData) {
        const [x, y, z] = planetData.position;
        const distance = 15 + planetData.radius * 2;

        gsap.to(camera.position, {
          x: x + distance,
          y: y + distance * 0.5,
          z: z + distance,
          duration,
          ease,
        });
      }
    }
  }, [cameraMode, selectedPlanet, planets, camera]);

  // Render loop - optimized with early returns
  useFrame((state, delta) => {
    // Cinematic mode: auto-tour through planets
    if (cinematicPlaying && cameraMode === 'cinematic') {
      cinematicTimer.current += delta;

      // Transition every 5 seconds
      if (cinematicTimer.current > 5) {
        cinematicTimer.current = 0;

        if (planetNames.length > 0) {
          cinematicIndex.current = (cinematicIndex.current + 1) % planetNames.length;

          const nextPlanet = planetNames[cinematicIndex.current];
          const planetData = planets.get(nextPlanet);

          if (planetData) {
            const [x, y, z] = planetData.position;
            const distance = 20 + planetData.radius * 3;
            const duration = prefersReducedMotion.current ? 0 : 4;
            const ease = prefersReducedMotion.current ? 'none' : 'power1.inOut';
            const elapsed = state.clock.elapsedTime;

            gsap.to(camera.position, {
              x: x + distance * Math.cos(elapsed),
              y: y + distance * 0.3,
              z: z + distance * Math.sin(elapsed),
              duration,
              ease,
            });
          }
        }
      }
    }

    // Camera look-at logic - use reusable vector to avoid allocations
    if (cameraMode === 'focused' && selectedPlanet) {
      const planetData = planets.get(selectedPlanet);
      if (planetData) {
        tempVector.set(...planetData.position);
        camera.lookAt(tempVector);
      }
    } else if (cameraMode === 'cinematic' && planetNames.length > 0) {
      const currentPlanet = planetNames[cinematicIndex.current];
      const planetData = planets.get(currentPlanet);
      if (planetData) {
        tempVector.set(...planetData.position);
        camera.lookAt(tempVector);
      }
    } else {
      camera.lookAt(originVector);
    }
  });

  return null;
}

export default memo(CameraController);
