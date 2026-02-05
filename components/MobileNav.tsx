'use client';

import { memo } from 'react';
import { useOrbitStore } from '@/lib/store';
import { useShallow } from 'zustand/react/shallow';
import { useDevice } from '@/lib/DeviceContext';
import {
  Home,
  Orbit as OrbitIcon,
  Clock,
  Rocket,
  Settings,
} from 'lucide-react';

interface MobileNavProps {
  onOpenTimePanel?: () => void;
  onOpenMission?: () => void;
  onOpenSettings?: () => void;
}

function MobileNav({ onOpenTimePanel, onOpenMission, onOpenSettings }: MobileNavProps) {
  const { capabilities } = useDevice();

  const { selectedPlanet, setSelectedPlanet, toggleOrbits, showOrbits } = useOrbitStore(
    useShallow((s) => ({
      selectedPlanet: s.selectedPlanet,
      setSelectedPlanet: s.setSelectedPlanet,
      toggleOrbits: s.toggleOrbits,
      showOrbits: s.showOrbits,
    }))
  );

  // Only show on mobile/tablet with touch
  if (!capabilities.isMobile && !capabilities.isTablet) {
    return null;
  }

  return (
    <nav className="mobile-nav md:hidden" role="navigation" aria-label="Mobile navigation">
      <button
        type="button"
        className="mobile-nav-item touch-ripple"
        data-active={!selectedPlanet}
        onClick={() => setSelectedPlanet(null)}
        aria-label="Reset view to home"
      >
        <Home />
        <span>Home</span>
      </button>

      <button
        type="button"
        className="mobile-nav-item touch-ripple"
        data-active={showOrbits}
        onClick={toggleOrbits}
        aria-label={showOrbits ? 'Hide orbits' : 'Show orbits'}
        aria-pressed={showOrbits}
      >
        <OrbitIcon />
        <span>Orbits</span>
      </button>

      <button
        type="button"
        className="mobile-nav-item touch-ripple"
        onClick={onOpenTimePanel}
        aria-label="Open time controls"
      >
        <Clock />
        <span>Time</span>
      </button>

      <button
        type="button"
        className="mobile-nav-item touch-ripple"
        onClick={onOpenMission}
        aria-label="Open missions"
      >
        <Rocket />
        <span>Missions</span>
      </button>

      <button
        type="button"
        className="mobile-nav-item touch-ripple"
        onClick={onOpenSettings}
        aria-label="Open settings"
      >
        <Settings />
        <span>Settings</span>
      </button>
    </nav>
  );
}

export default memo(MobileNav);
