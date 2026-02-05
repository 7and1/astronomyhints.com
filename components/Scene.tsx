'use client';

import { useEffect, useRef, useMemo, useCallback, memo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import StarField from './StarField';
import Sun from './Sun';
import Planet from './Planet';
import Orbit from './Orbit';
import CameraController from './CameraController';
import { useOrbitStore } from '@/lib/store';
import { useShallow } from 'zustand/react/shallow';
import { useDevice } from '@/lib/DeviceContext';

/**
 * PERFORMANCE OPTIMIZATIONS:
 * 1. Memoized planet/orbit arrays prevent recreation on each render
 * 2. useShallow selector minimizes store subscription overhead
 * 3. Throttled simulation tick (100ms) reduces calculation frequency
 * 4. Quality-based rendering settings (DPR, star count, bloom)
 * 5. Conditional bloom rendering based on quality setting
 * 6. Stable callback references with useCallback
 * 7. Canvas performance props: frameloop, flat shading option
 * 8. Memoized Canvas gl config
 * 9. Mobile-adaptive settings via DeviceContext
 * 10. Touch-optimized OrbitControls for mobile devices
 */

const SIM_TICK_MS = 100;
const MS_PER_DAY = 86_400_000;

// Inner scene content component that uses device context
interface SceneContentProps {
  starCount: number;
  bloomEnabled: boolean;
  bloomIntensity: number;
  isTouch: boolean;
  touchSensitivity: number;
}

const SceneContent = memo(function SceneContent({
  starCount,
  bloomEnabled,
  bloomIntensity,
  isTouch,
  touchSensitivity,
}: SceneContentProps) {
  const {
    planets,
    showOrbits,
    cinematicPlaying,
    timeSpeed,
    setCurrentDate,
    setSelectedPlanet,
    updatePlanetPositions,
  } = useOrbitStore(
    useShallow((s) => ({
      planets: s.planets,
      showOrbits: s.showOrbits,
      cinematicPlaying: s.cinematicPlaying,
      timeSpeed: s.timeSpeed,
      setCurrentDate: s.setCurrentDate,
      setSelectedPlanet: s.setSelectedPlanet,
      updatePlanetPositions: s.updatePlanetPositions,
    }))
  );

  const tickRemainderMsRef = useRef(0);

  // Initial position calculation
  useEffect(() => {
    updatePlanetPositions();
  }, [updatePlanetPositions]);

  // Simulation loop with throttling
  useEffect(() => {
    let rafId = 0;
    let lastMs = performance.now();

    const loop = (nowMs: number) => {
      const deltaMs = nowMs - lastMs;
      lastMs = nowMs;

      if (timeSpeed === 0) {
        tickRemainderMsRef.current = 0;
        rafId = requestAnimationFrame(loop);
        return;
      }

      tickRemainderMsRef.current += deltaMs;

      if (tickRemainderMsRef.current >= SIM_TICK_MS) {
        const ticks = Math.floor(tickRemainderMsRef.current / SIM_TICK_MS);
        tickRemainderMsRef.current -= ticks * SIM_TICK_MS;

        const deltaSeconds = (ticks * SIM_TICK_MS) / 1000;
        const baseDate = useOrbitStore.getState().currentDate;
        const nextDate = new Date(baseDate.getTime() + deltaSeconds * timeSpeed * MS_PER_DAY);
        setCurrentDate(nextDate);
        updatePlanetPositions();
      }

      rafId = requestAnimationFrame(loop);
    };

    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, [setCurrentDate, timeSpeed, updatePlanetPositions]);

  // Memoize planet array to prevent recreation
  const planetEntries = useMemo(() => Array.from(planets.entries()), [planets]);
  const planetValues = useMemo(() => Array.from(planets.values()), [planets]);

  // Stable click handler - unused but kept for future use
  const _handlePointerMissed = useCallback(
    (event: MouseEvent) => {
      if (event.type === 'click') setSelectedPlanet(null);
    },
    [setSelectedPlanet]
  );

  // Touch-optimized damping factor
  const dampingFactor = isTouch ? 0.08 : 0.05;

  // Adjust rotation/zoom speed for touch
  const rotateSpeed = isTouch ? 0.5 * touchSensitivity : 1.0;
  const zoomSpeed = isTouch ? 0.8 * touchSensitivity : 1.0;
  const panSpeed = isTouch ? 0.8 * touchSensitivity : 1.0;

  return (
    <>
      <color attach="background" args={['#000000']} />

      <StarField count={starCount} />
      <Sun />

      {/* Orbits - only render when visible */}
      {showOrbits &&
        planetEntries.map(([planetName, planetData]) => (
          <Orbit key={`orbit-${planetName}`} planet={planetName} color={planetData.color} />
        ))}

      {/* Planets */}
      {planetValues.map((planetData) => (
        <Planet key={planetData.name} data={planetData} />
      ))}

      <CameraController />
      <OrbitControls
        enabled={!cinematicPlaying}
        enablePan
        enableZoom
        enableRotate
        enableDamping
        dampingFactor={dampingFactor}
        rotateSpeed={rotateSpeed}
        zoomSpeed={zoomSpeed}
        panSpeed={panSpeed}
        minDistance={10}
        maxDistance={500}
        // Touch-specific settings - use TOUCH enum values
        touches={{
          ONE: 1, // TOUCH.ROTATE
          TWO: 2, // TOUCH.DOLLY_PAN
        }}
      />

      {/* Conditional bloom for performance */}
      {bloomEnabled && (
        <EffectComposer multisampling={0}>
          <Bloom
            luminanceThreshold={0.3}
            luminanceSmoothing={0.9}
            intensity={bloomIntensity}
            mipmapBlur
          />
        </EffectComposer>
      )}

      <ambientLight intensity={0.1} />
    </>
  );
});

export default function Scene() {
  const renderQuality = useOrbitStore((s) => s.renderQuality);
  const { capabilities, settings } = useDevice();

  // Determine quality settings based on device and user preference
  const qualitySettings = useMemo(() => {
    const isMobile = capabilities.isMobile || capabilities.isTablet;
    const isLowEnd = capabilities.isLowEndDevice;

    // User preference takes priority, but mobile caps it
    let effectiveQuality: 'high' | 'balanced' | 'low';
    if (renderQuality === 'high' && !isMobile) {
      effectiveQuality = 'high';
    } else if (renderQuality === 'low' || isLowEnd) {
      effectiveQuality = 'low';
    } else if (isMobile) {
      effectiveQuality = 'low';
    } else {
      effectiveQuality = 'balanced';
    }

    // Use device-specific settings when available
    const starCount = isMobile
      ? settings.starCount
      : effectiveQuality === 'high' ? 6000 : effectiveQuality === 'low' ? 2000 : 4000;

    const bloomEnabled = isMobile
      ? settings.enableBloom
      : effectiveQuality !== 'low';

    const bloomIntensity = effectiveQuality === 'high' ? 1.5 : 1.0;

    return {
      effectiveQuality,
      starCount,
      bloomEnabled,
      bloomIntensity,
      dpr: isMobile ? settings.dpr : (effectiveQuality === 'high' ? [1, 2] : effectiveQuality === 'low' ? [1, 1.25] : [1, 1.5]) as [number, number],
      antialias: isMobile ? settings.antialias : effectiveQuality !== 'low',
    };
  }, [renderQuality, capabilities, settings]);

  // Memoize gl config to prevent object recreation
  const glConfig = useMemo(
    () => ({
      antialias: qualitySettings.antialias,
      alpha: false,
      powerPreference: 'high-performance' as const,
      stencil: false,
      depth: true,
      // Mobile-specific WebGL settings
      preserveDrawingBuffer: false,
      failIfMajorPerformanceCaveat: false,
    }),
    [qualitySettings.antialias]
  );

  return (
    <Canvas
      camera={{ position: [0, 80, 100], fov: 60 }}
      gl={glConfig}
      dpr={qualitySettings.dpr}
      frameloop="always"
      flat={qualitySettings.effectiveQuality === 'low'}
      performance={{ min: 0.5 }}
      // Prevent default touch behaviors on canvas
      style={{ touchAction: 'none' }}
    >
      <SceneContent
        starCount={qualitySettings.starCount}
        bloomEnabled={qualitySettings.bloomEnabled}
        bloomIntensity={qualitySettings.bloomIntensity}
        isTouch={capabilities.isTouch}
        touchSensitivity={settings.touchSensitivity}
      />
    </Canvas>
  );
}
