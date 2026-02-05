'use client';

import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';
import Scene from './Scene';
import HUD from './HUD';
import Controls from './Controls';
import { useStore } from '@/store/useStore';

export default function OrbitCommand() {
  const showHUD = useStore((state) => state.showHUD);

  return (
    <div className="relative w-full h-full">
      <Canvas
        camera={{ position: [0, 50, 100], fov: 60 }}
        gl={{ antialias: true, alpha: false }}
      >
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>

      {showHUD && <HUD />}
      <Controls />
    </div>
  );
}
