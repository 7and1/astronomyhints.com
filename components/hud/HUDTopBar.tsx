'use client';

import { useOrbitStore } from '@/lib/store';
import { useShallow } from 'zustand/react/shallow';
import {
  Camera,
  CircleHelp,
  Command as CommandIcon,
  Eye,
  EyeOff,
  Menu,
  Orbit as OrbitIcon,
  Pause,
  Play,
  Rocket,
  RotateCcw,
} from 'lucide-react';

export default function HUDTopBar({
  onSnapshot,
  onOpenHelp,
  onOpenPalette,
  onOpenMission,
  onOpenMenu,
}: {
  onSnapshot: () => void;
  onOpenHelp: () => void;
  onOpenPalette: () => void;
  onOpenMission: () => void;
  onOpenMenu: () => void;
}) {
  const {
    selectedPlanet,
    showOrbits,
    showLabels,
    cinematicPlaying,
    toggleOrbits,
    toggleLabels,
    toggleCinematic,
    setSelectedPlanet,
  } = useOrbitStore(
    useShallow((s) => ({
      selectedPlanet: s.selectedPlanet,
      showOrbits: s.showOrbits,
      showLabels: s.showLabels,
      cinematicPlaying: s.cinematicPlaying,
      toggleOrbits: s.toggleOrbits,
      toggleLabels: s.toggleLabels,
      toggleCinematic: s.toggleCinematic,
      setSelectedPlanet: s.setSelectedPlanet,
    }))
  );

  return (
    <header className="fixed top-0 left-0 right-0 z-20 p-4 md:p-6" role="banner">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2 md:gap-4">
          <div className="ui-panel ui-panel-strong min-w-0 flex-1 px-4 py-3 md:flex-none">
            <div className="text-[10px] font-mono text-white/40 tracking-wider" aria-hidden="true">
              astronomyhints.com
            </div>
            <h1 className="truncate text-xl md:text-2xl font-semibold tracking-tight leading-tight">
              <span className="text-cyan-200">Orbit</span>{' '}
              <span className="text-white">Command</span>
            </h1>
            <div className="text-xs text-white/60" aria-hidden="true">Real-time solar system</div>
          </div>

          <nav
            className="ui-panel ui-panel-strong flex shrink-0 items-center gap-2 p-2 md:hidden"
            aria-label="Mobile quick actions"
          >
            <button
              type="button"
              className="ui-icon-btn size-9"
              aria-label="Open command palette (keyboard shortcut: K)"
              title="Command palette (K / ⌘K)"
              onClick={onOpenPalette}
            >
              <CommandIcon className="size-4" aria-hidden="true" />
            </button>

            <button
              type="button"
              className="ui-icon-btn size-9"
              aria-label="Take snapshot (keyboard shortcut: S)"
              title="Snapshot (S)"
              onClick={onSnapshot}
            >
              <Camera className="size-4" aria-hidden="true" />
            </button>

            <button
              type="button"
              className="ui-icon-btn size-9"
              aria-label="Open menu"
              title="Menu"
              onClick={onOpenMenu}
            >
              <Menu className="size-4" aria-hidden="true" />
            </button>
          </nav>

          {selectedPlanet && (
            <div className="hidden md:flex ui-chip" role="status" aria-live="polite">
              Focused: <span className="text-white">{selectedPlanet}</span>
            </div>
          )}
        </div>

        <nav
          className="hidden md:flex ui-panel ui-panel-strong items-center gap-2 p-2"
          aria-label="Main controls"
          role="toolbar"
        >
          <IconToggleButton
            active={showOrbits}
            onClick={toggleOrbits}
            label={showOrbits ? 'Hide orbital paths (keyboard shortcut: O)' : 'Show orbital paths (keyboard shortcut: O)'}
            title="Toggle orbits (O)"
          >
            <OrbitIcon className="size-5" aria-hidden="true" />
          </IconToggleButton>

          <IconToggleButton
            active={showLabels}
            onClick={toggleLabels}
            label={showLabels ? 'Hide planet labels (keyboard shortcut: L)' : 'Show planet labels (keyboard shortcut: L)'}
            title="Toggle labels (L)"
          >
            {showLabels ? <Eye className="size-5" aria-hidden="true" /> : <EyeOff className="size-5" aria-hidden="true" />}
          </IconToggleButton>

          <IconToggleButton
            active={cinematicPlaying}
            danger={cinematicPlaying}
            onClick={toggleCinematic}
            label={cinematicPlaying ? 'Stop cinematic tour (keyboard shortcut: C)' : 'Start cinematic tour (keyboard shortcut: C)'}
            title="Cinematic mode (C)"
          >
            {cinematicPlaying ? (
              <Pause className="size-5" aria-hidden="true" />
            ) : (
              <Play className="size-5" aria-hidden="true" />
            )}
          </IconToggleButton>

          <button
            type="button"
            className="ui-icon-btn"
            aria-label="Take snapshot (keyboard shortcut: S)"
            title="Snapshot (S)"
            onClick={onSnapshot}
          >
            <Camera className="size-5" aria-hidden="true" />
          </button>

          <button
            type="button"
            className="ui-icon-btn"
            aria-label="Open command palette (keyboard shortcut: K)"
            title="Command palette (K / ⌘K)"
            onClick={onOpenPalette}
          >
            <CommandIcon className="size-5" aria-hidden="true" />
          </button>

          <button
            type="button"
            className="ui-icon-btn"
            aria-label="Open mission control (keyboard shortcut: M)"
            title="Missions (M)"
            onClick={onOpenMission}
          >
            <Rocket className="size-5" aria-hidden="true" />
          </button>

          <button
            type="button"
            className="ui-icon-btn"
            aria-label="Reset view to default position"
            title="Reset view"
            onClick={() => setSelectedPlanet(null)}
          >
            <RotateCcw className="size-5" aria-hidden="true" />
          </button>

          <button
            type="button"
            className="ui-icon-btn"
            aria-label="Open help dialog (keyboard shortcut: ?)"
            title="Help (?)"
            onClick={onOpenHelp}
          >
            <CircleHelp className="size-5" aria-hidden="true" />
          </button>

          <button
            type="button"
            className="ui-icon-btn"
            aria-label="Open settings menu"
            title="Menu"
            onClick={onOpenMenu}
          >
            <Menu className="size-5" aria-hidden="true" />
          </button>
        </nav>

        {selectedPlanet && (
          <div className="md:hidden ui-chip" role="status" aria-live="polite">
            Focused: <span className="text-white">{selectedPlanet}</span>
          </div>
        )}
      </div>
    </header>
  );
}

function IconToggleButton({
  active,
  danger,
  label,
  title,
  onClick,
  children,
}: {
  active: boolean;
  danger?: boolean;
  label: string;
  title?: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      className="ui-icon-btn"
      data-active={active}
      data-danger={danger ? 'true' : undefined}
      aria-label={label}
      aria-pressed={active}
      title={title}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
