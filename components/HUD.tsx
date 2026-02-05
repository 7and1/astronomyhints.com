'use client';

import { useCallback, useEffect, useRef, useState, lazy, Suspense, memo } from 'react';
import { useOrbitStore } from '@/lib/store';
import HUDTopBar from '@/components/hud/HUDTopBar';
import HUDTimePanel from '@/components/hud/HUDTimePanel';
import HUDPlanetPanel from '@/components/hud/HUDPlanetPanel';
import HUDToast, { type HUDToastState } from '@/components/hud/HUDToast';
import { generateOrbitMission, type OrbitMission } from '@/lib/missions';
import { applyOrbitShareStateFromUrl, buildOrbitShareUrl } from '@/lib/orbitShare';
import AccessibleSceneDescription from '@/components/AccessibleSceneDescription';
import { announce, PLANET_ORDER } from '@/lib/useAccessibility';
import MobileNav from '@/components/MobileNav';

/**
 * PERFORMANCE OPTIMIZATIONS:
 * 1. Lazy load dialog components (only loaded when opened)
 * 2. Memoized callbacks with useCallback
 * 3. Optimized store selector (single property)
 * 4. Debounced toast timer cleanup
 * 5. Event listener cleanup on unmount
 */

// Lazy load dialog components - only loaded when needed
const HUDHelpDialog = lazy(() => import('@/components/hud/HUDHelpDialog'));
const HUDCommandPalette = lazy(() => import('@/components/hud/HUDCommandPalette'));
const HUDWelcomeDialog = lazy(() => import('@/components/hud/HUDWelcomeDialog'));
const HUDMissionDialog = lazy(() => import('@/components/hud/HUDMissionDialog'));
const HUDMenuDialog = lazy(() => import('@/components/hud/HUDMenuDialog'));
const HUDTutorialCoachmarks = lazy(() => import('@/components/hud/HUDTutorialCoachmarks'));
const MobileSettings = lazy(() => import('@/components/MobileSettings'));

// Null fallback for lazy components
const DialogFallback = null;

function isTextInput(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
  return target.isContentEditable;
}

export default function HUD() {
  const selectedPlanet = useOrbitStore((s) => s.selectedPlanet);
  const [helpOpen, setHelpOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [welcomeOpen, setWelcomeOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [tutorialOpen, setTutorialOpen] = useState(false);
  const [toast, setToast] = useState<HUDToastState | null>(null);
  const toastTimerRef = useRef<number | null>(null);
  const [missionOpen, setMissionOpen] = useState(false);
  const [mission, setMission] = useState<OrbitMission | null>(null);
  const [missionCompleted, setMissionCompleted] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const showToast = useCallback((nextToast: HUDToastState) => {
    setToast(nextToast);

    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => setToast(null), 2600);
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    };
  }, []);

  useEffect(() => {
    try {
      const seen = window.localStorage.getItem('orbit-command:onboarded');
      if (!seen) setWelcomeOpen(true);
    } catch {
      setWelcomeOpen(true);
    }
  }, []);

  useEffect(() => {
    try {
      applyOrbitShareStateFromUrl(window.location.search);
    } catch {
      // ignore malformed URLs/state
    }
  }, []);

  const closeWelcome = useCallback(() => {
    setWelcomeOpen(false);
    try {
      window.localStorage.setItem('orbit-command:onboarded', '1');
    } catch {
      // ignore
    }
  }, []);

  const closeTutorial = useCallback(() => {
    setTutorialOpen(false);
    try {
      window.localStorage.setItem('orbit-command:onboarded', '1');
    } catch {
      // ignore
    }
  }, []);

  const startTutorial = useCallback(() => {
    closeWelcome();
    setTutorialOpen(true);
  }, [closeWelcome]);

  const startNewMission = useCallback(() => {
    const planets = useOrbitStore.getState().planets;
    const next = generateOrbitMission({ planets, previousId: mission?.id });
    setMission(next);
    setMissionCompleted(false);
    setMissionOpen(true);
  }, [mission?.id]);

  useEffect(() => {
    if (!mission || missionCompleted) return;
    if (!selectedPlanet) return;

    if (mission.accept.includes(selectedPlanet)) {
      setMissionCompleted(true);
      showToast({ message: `Mission complete: ${mission.title}`, tone: 'success' });
    }
  }, [mission, missionCompleted, selectedPlanet, showToast]);

  const handleSnapshot = useCallback(() => {
    const canvas = document.querySelector('canvas');
    if (!canvas) {
      showToast({ message: 'Snapshot failed: canvas not ready.', tone: 'danger' });
      return;
    }

    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const link = document.createElement('a');
      link.download = `orbit-command-${timestamp}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      showToast({ message: 'Snapshot saved.', tone: 'success' });
    } catch {
      showToast({ message: 'Snapshot failed. Try again.', tone: 'danger' });
    }
  }, [showToast]);

  const handleShare = useCallback(async () => {
    const url = buildOrbitShareUrl(window.location, useOrbitStore.getState());

    const share = (navigator as unknown as { share?: (data: unknown) => Promise<void> }).share;
    if (typeof share === 'function') {
      try {
        await share({
          title: 'Orbit Command',
          text: 'Explore the solar system in real time.',
          url,
        });
        showToast({ message: 'Shared.', tone: 'success' });
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') return;
      }
    }

    const copyFallback = () => {
      const textarea = document.createElement('textarea');
      textarea.value = url;
      textarea.setAttribute('readonly', 'true');
      textarea.style.position = 'fixed';
      textarea.style.top = '0';
      textarea.style.left = '-9999px';
      document.body.appendChild(textarea);
      textarea.select();
      textarea.setSelectionRange(0, textarea.value.length);
      const ok = document.execCommand('copy');
      textarea.remove();
      return ok;
    };

    try {
      await navigator.clipboard.writeText(url);
      showToast({ message: 'Share link copied.', tone: 'success' });
      return;
    } catch {
      const ok = copyFallback();
      showToast({
        message: ok ? 'Share link copied.' : 'Copy failed. Try again.',
        tone: ok ? 'success' : 'danger',
      });
    }
  }, [showToast]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented) return;
      if (isTextInput(event.target)) return;

      const key = event.key;

      if (key === 'Escape') {
        if (welcomeOpen) {
          closeWelcome();
          return;
        }
        if (menuOpen) {
          setMenuOpen(false);
          return;
        }
        if (missionOpen) {
          setMissionOpen(false);
          return;
        }
        if (helpOpen) {
          setHelpOpen(false);
          return;
        }
        if (paletteOpen) {
          setPaletteOpen(false);
          return;
        }
        const { selectedPlanet, setSelectedPlanet } = useOrbitStore.getState();
        if (selectedPlanet) {
          setSelectedPlanet(null);
          return;
        }
        if (tutorialOpen) {
          closeTutorial();
          return;
        }
        return;
      }

      if (welcomeOpen || menuOpen || missionOpen) return;

      if (key.toLowerCase() === 'k' && !event.altKey) {
        event.preventDefault();
        setHelpOpen(false);
        setPaletteOpen(true);
        return;
      }

      if (event.metaKey || event.ctrlKey || event.altKey) return;

      if (key === '?' || (key === '/' && event.shiftKey)) {
        event.preventDefault();
        setPaletteOpen(false);
        setHelpOpen((v) => !v);
        return;
      }

      const store = useOrbitStore.getState();

      switch (key.toLowerCase()) {
        case ' ': {
          event.preventDefault();
          const { timeSpeed, setTimeSpeed } = useOrbitStore.getState();
          const next = timeSpeed === 0 ? 30 : 0;
          setTimeSpeed(next);
          const msg = next === 0 ? 'Time paused.' : 'Time resumed.';
          showToast({ message: msg });
          announce(msg);
          break;
        }
        case 'o': {
          store.toggleOrbits();
          const next = useOrbitStore.getState().showOrbits;
          const msg = next ? 'Orbits shown.' : 'Orbits hidden.';
          showToast({ message: msg });
          announce(msg);
          break;
        }
        case 'l': {
          store.toggleLabels();
          const next = useOrbitStore.getState().showLabels;
          const msg = next ? 'Labels shown.' : 'Labels hidden.';
          showToast({ message: msg });
          announce(msg);
          break;
        }
        case 'c': {
          store.toggleCinematic();
          const next = useOrbitStore.getState().cinematicPlaying;
          const msg = next ? 'Cinematic mode on.' : 'Cinematic mode off.';
          showToast({ message: msg });
          announce(msg);
          break;
        }
        case 'm': {
          event.preventDefault();
          setHelpOpen(false);
          setPaletteOpen(false);
          if (!mission) startNewMission();
          else setMissionOpen(true);
          break;
        }
        case 's': {
          event.preventDefault();
          handleSnapshot();
          break;
        }
        case 'arrowleft':
        case 'arrowup': {
          event.preventDefault();
          const { selectedPlanet, setSelectedPlanet } = useOrbitStore.getState();
          const currentIndex = selectedPlanet
            ? PLANET_ORDER.indexOf(selectedPlanet as typeof PLANET_ORDER[number])
            : -1;
          const newIndex = currentIndex > 0 ? currentIndex - 1 : PLANET_ORDER.length - 1;
          const newPlanet = PLANET_ORDER[newIndex];
          setSelectedPlanet(newPlanet);
          announce(`Selected ${newPlanet}`);
          break;
        }
        case 'arrowright':
        case 'arrowdown': {
          event.preventDefault();
          const { selectedPlanet, setSelectedPlanet } = useOrbitStore.getState();
          const currentIndex = selectedPlanet
            ? PLANET_ORDER.indexOf(selectedPlanet as typeof PLANET_ORDER[number])
            : -1;
          const newIndex = currentIndex < PLANET_ORDER.length - 1 ? currentIndex + 1 : 0;
          const newPlanet = PLANET_ORDER[newIndex];
          setSelectedPlanet(newPlanet);
          announce(`Selected ${newPlanet}`);
          break;
        }
        case 'home': {
          event.preventDefault();
          const { setSelectedPlanet } = useOrbitStore.getState();
          setSelectedPlanet(PLANET_ORDER[0]);
          announce(`Selected ${PLANET_ORDER[0]}`);
          break;
        }
        case 'end': {
          event.preventDefault();
          const { setSelectedPlanet } = useOrbitStore.getState();
          const lastPlanet = PLANET_ORDER[PLANET_ORDER.length - 1];
          setSelectedPlanet(lastPlanet);
          announce(`Selected ${lastPlanet}`);
          break;
        }
        default:
          break;
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [
    closeWelcome,
    closeTutorial,
    handleSnapshot,
    helpOpen,
    menuOpen,
    mission,
    missionOpen,
    paletteOpen,
    showToast,
    startNewMission,
    tutorialOpen,
    welcomeOpen,
  ]);

  return (
    <>
      <HUDTopBar
        onSnapshot={handleSnapshot}
        onOpenHelp={() => {
          setPaletteOpen(false);
          setMenuOpen(false);
          setHelpOpen(true);
        }}
        onOpenPalette={() => {
          setHelpOpen(false);
          setMenuOpen(false);
          setPaletteOpen(true);
        }}
        onOpenMission={() => {
          setHelpOpen(false);
          setMenuOpen(false);
          setPaletteOpen(false);
          if (!mission) startNewMission();
          else setMissionOpen(true);
        }}
        onOpenMenu={() => {
          setHelpOpen(false);
          setPaletteOpen(false);
          setMenuOpen(true);
        }}
      />
      <HUDTimePanel />
      <HUDPlanetPanel />

      {/* Lazy-loaded dialogs wrapped in Suspense */}
      <Suspense fallback={DialogFallback}>
        {helpOpen && (
          <HUDHelpDialog open={helpOpen} onClose={() => setHelpOpen(false)} />
        )}
      </Suspense>

      <Suspense fallback={DialogFallback}>
        {menuOpen && (
          <HUDMenuDialog
            open={menuOpen}
            onClose={() => setMenuOpen(false)}
            onOpenHelp={() => setHelpOpen(true)}
            onOpenPalette={() => setPaletteOpen(true)}
            onOpenMission={() => {
              if (!mission) startNewMission();
              else setMissionOpen(true);
            }}
            onSnapshot={handleSnapshot}
            onShare={handleShare}
            onOpenTutorial={() => setTutorialOpen(true)}
          />
        )}
      </Suspense>

      <Suspense fallback={DialogFallback}>
        {welcomeOpen && (
          <HUDWelcomeDialog
            open={welcomeOpen}
            onClose={closeWelcome}
            onStartMission={() => {
              closeWelcome();
              startNewMission();
            }}
            onStartTour={startTutorial}
          />
        )}
      </Suspense>

      <Suspense fallback={DialogFallback}>
        {paletteOpen && (
          <HUDCommandPalette
            open={paletteOpen}
            onClose={() => setPaletteOpen(false)}
            onOpenHelp={() => setHelpOpen(true)}
            onSnapshot={handleSnapshot}
          />
        )}
      </Suspense>

      <Suspense fallback={DialogFallback}>
        {missionOpen && (
          <HUDMissionDialog
            open={missionOpen}
            mission={mission}
            completed={missionCompleted}
            onClose={() => setMissionOpen(false)}
            onNewMission={startNewMission}
          />
        )}
      </Suspense>

      <HUDToast toast={toast} />

      {/* Accessible scene description for screen readers */}
      <AccessibleSceneDescription />

      <Suspense fallback={DialogFallback}>
        {tutorialOpen && (
          <HUDTutorialCoachmarks
            open={tutorialOpen}
            onClose={closeTutorial}
            onOpenHelp={() => setHelpOpen(true)}
            onOpenPalette={() => setPaletteOpen(true)}
            onOpenMenu={() => setMenuOpen(true)}
            onShare={handleShare}
          />
        )}
      </Suspense>

      {/* Mobile Settings Dialog */}
      <Suspense fallback={DialogFallback}>
        {settingsOpen && (
          <MobileSettings
            isOpen={settingsOpen}
            onClose={() => setSettingsOpen(false)}
          />
        )}
      </Suspense>

      {/* Mobile Bottom Navigation */}
      <MobileNav
        onOpenTimePanel={() => {
          // Time panel is always visible, but could scroll to it on mobile
        }}
        onOpenMission={() => {
          if (!mission) startNewMission();
          else setMissionOpen(true);
        }}
        onOpenSettings={() => setSettingsOpen(true)}
      />

      <div className="fixed bottom-4 right-4 z-10 text-[10px] font-mono text-white/35 md:bottom-6 md:right-6 hidden md:block">
        astronomyhints.com
      </div>
    </>
  );
}
