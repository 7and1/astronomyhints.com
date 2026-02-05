'use client';

import dynamic from 'next/dynamic';
import HUD from '@/components/HUD';
import BootScreen from '@/components/BootScreen';
import SEOContent from '@/components/SEOContent';

const Scene = dynamic(() => import('@/components/Scene'), {
  ssr: false,
  loading: () => <BootScreen />,
});

export default function Home() {
  return (
    <main
      id="main-content"
      className="w-full h-dvh overflow-hidden bg-black"
      tabIndex={-1}
      role="application"
      aria-label="Orbit Command - Interactive 3D Solar System Simulator"
    >
      <Scene />
      <HUD />
      <SEOContent />
    </main>
  );
}
