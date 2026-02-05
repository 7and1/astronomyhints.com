'use client';

import { useEffect, useMemo, useRef } from 'react';
import { useOrbitStore } from '@/lib/store';
import { useShallow } from 'zustand/react/shallow';
import { useFocusTrap } from '@/lib/useFocusTrap';
import { PLANET_ORDER } from '@/lib/planets';
import {
  Battery,
  Camera,
  CircleHelp,
  Command as CommandIcon,
  Film,
  Gauge,
  Orbit as OrbitIcon,
  Rocket,
  RotateCcw,
  Share2,
  Sparkles,
  Tags,
  X,
} from 'lucide-react';

export default function HUDMenuDialog({
  open,
  onClose,
  onOpenHelp,
  onOpenPalette,
  onOpenMission,
  onSnapshot,
  onShare,
  onOpenTutorial,
}: {
  open: boolean;
  onClose: () => void;
  onOpenHelp: () => void;
  onOpenPalette: () => void;
  onOpenMission: () => void;
  onSnapshot: () => void;
  onShare: () => void;
  onOpenTutorial: () => void;
}) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  const {
    selectedPlanet,
    showOrbits,
    showLabels,
    cinematicPlaying,
    renderQuality,
    setSelectedPlanet,
    setRenderQuality,
    toggleOrbits,
    toggleLabels,
    toggleCinematic,
  } = useOrbitStore(
    useShallow((s) => ({
      selectedPlanet: s.selectedPlanet,
      showOrbits: s.showOrbits,
      showLabels: s.showLabels,
      cinematicPlaying: s.cinematicPlaying,
      renderQuality: s.renderQuality,
      setSelectedPlanet: s.setSelectedPlanet,
      setRenderQuality: s.setRenderQuality,
      toggleOrbits: s.toggleOrbits,
      toggleLabels: s.toggleLabels,
      toggleCinematic: s.toggleCinematic,
    }))
  );

  useFocusTrap(open, dialogRef);

  const qualityOptions = useMemo(() => {
    return [
      {
        value: 'high' as const,
        title: 'High',
        description: 'Max clarity (more GPU).',
        icon: <Gauge className="size-4 text-cyan-200" />,
      },
      {
        value: 'balanced' as const,
        title: 'Balanced',
        description: 'Recommended for most devices.',
        icon: <Gauge className="size-4 text-cyan-200" />,
      },
      {
        value: 'low' as const,
        title: 'Low',
        description: 'Battery saver.',
        icon: <Battery className="size-4 text-cyan-200" />,
      },
    ];
  }, []);

  useEffect(() => {
    if (!open) return;
    closeButtonRef.current?.focus();
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[65]" onClick={onClose}>
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm hud-backdrop"
        role="presentation"
        aria-hidden="true"
      />

      <div className="absolute inset-0 flex items-start justify-center p-4 pt-20 md:pt-28">
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          className="ui-panel ui-panel-strong hud-dialog w-full max-w-2xl overflow-hidden"
          ref={dialogRef}
          onClick={(event) => event.stopPropagation()}
        >
          <div className="flex items-start justify-between gap-6 p-6">
            <div className="space-y-1">
              <div className="text-xs font-mono text-white/50 tracking-wider">
                ORBIT COMMAND
              </div>
              <h2 className="text-2xl font-semibold tracking-tight">Menu</h2>
              <p className="text-sm text-white/70">
                Quick actions, toggles, and planet shortcuts.
              </p>
            </div>

            <button
              ref={closeButtonRef}
              type="button"
              className="ui-icon-btn"
              aria-label="Close menu"
              onClick={onClose}
            >
              <X className="size-5" />
            </button>
          </div>

          <div className="ui-divider" />

          <div className="max-h-[70dvh] overflow-auto p-6">
            <div className="grid gap-6">
              <Section title="Quick actions">
                <div className="grid gap-2 sm:grid-cols-2">
                  <ActionButton
                    icon={<CommandIcon className="size-4 text-cyan-200" />}
                    title="Command palette"
                    description="Search planets and controls."
                    onClick={() => {
                      onClose();
                      onOpenPalette();
                    }}
                  />
                  <ActionButton
                    icon={<Sparkles className="size-4 text-cyan-200" />}
                    title="Guided tour"
                    description="Step-by-step tips."
                    onClick={() => {
                      onClose();
                      onOpenTutorial();
                    }}
                  />
                  <ActionButton
                    icon={<Share2 className="size-4 text-cyan-200" />}
                    title="Share link"
                    description="Copy a link to this moment."
                    onClick={() => {
                      onClose();
                      onShare();
                    }}
                  />
                  <ActionButton
                    icon={<Rocket className="size-4 text-cyan-200" />}
                    title="Mission control"
                    description="Start or review a mission."
                    onClick={() => {
                      onClose();
                      onOpenMission();
                    }}
                  />
                  <ActionButton
                    icon={<Camera className="size-4 text-cyan-200" />}
                    title="Snapshot"
                    description="Download a PNG of the view."
                    onClick={() => {
                      onClose();
                      onSnapshot();
                    }}
                  />
                  <ActionButton
                    icon={<CircleHelp className="size-4 text-cyan-200" />}
                    title="Help"
                    description="Controls and shortcuts."
                    onClick={() => {
                      onClose();
                      onOpenHelp();
                    }}
                  />
                </div>
              </Section>

              <Section title="Toggles">
                <div className="flex flex-wrap items-center gap-2">
                  <ToggleButton
                    active={showOrbits}
                    icon={<OrbitIcon className="size-4" />}
                    label="Orbits"
                    onClick={toggleOrbits}
                  />
                  <ToggleButton
                    active={showLabels}
                    icon={<Tags className="size-4" />}
                    label="Labels"
                    onClick={toggleLabels}
                  />
                  <ToggleButton
                    active={cinematicPlaying}
                    danger={cinematicPlaying}
                    icon={<Film className="size-4" />}
                    label="Cinematic"
                    onClick={toggleCinematic}
                  />
                  <button
                    type="button"
                    className="ui-btn px-3 py-2"
                    aria-label="Reset view"
                    onClick={() => setSelectedPlanet(null)}
                  >
                    <RotateCcw className="size-4" />
                    Reset view
                  </button>
                </div>
              </Section>

              <Section title="Planets">
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {PLANET_ORDER.map((planet) => {
                    const active = selectedPlanet === planet;
                    return (
                      <button
                        key={planet}
                        type="button"
                        className="ui-btn justify-start px-3 py-2"
                        data-active={active}
                        aria-pressed={active}
                        onClick={() => {
                          setSelectedPlanet(active ? null : planet);
                          onClose();
                        }}
                      >
                        <span className="font-mono text-xs">{planet}</span>
                      </button>
                    );
                  })}
                </div>
              </Section>

              <Section title="Graphics">
                <div role="radiogroup" aria-label="Graphics quality" className="grid gap-2 sm:grid-cols-3">
                  {qualityOptions.map((option) => {
                    const active = option.value === renderQuality;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        className="rounded-xl border border-white/10 bg-white/5 p-4 text-left hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black data-[active='true']:border-cyan-400/30 data-[active='true']:bg-cyan-500/10"
                        data-active={active}
                        onClick={() => setRenderQuality(option.value)}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            {option.icon}
                            <div className="text-sm font-semibold text-white/90">
                              {option.title}
                            </div>
                          </div>
                          {active && <span className="ui-chip">Current</span>}
                        </div>
                        <div className="mt-2 text-xs text-white/60">
                          {option.description}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </Section>
            </div>
          </div>

          <div className="ui-divider" />

          <div className="flex flex-wrap items-center justify-between gap-2 px-6 py-4 text-[11px] text-white/50">
            <div className="font-mono">
              Tip: press <span className="ui-kbd">K</span> anytime to open search.
            </div>
            <div className="font-mono">
              Close: <span className="ui-kbd">Esc</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <div className="text-xs font-mono text-white/50 tracking-wider uppercase">
        {title}
      </div>
      {children}
    </div>
  );
}

function ActionButton({
  icon,
  title,
  description,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className="rounded-xl border border-white/10 bg-white/5 p-4 text-left hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
      onClick={onClick}
    >
      <div className="flex items-center gap-2">
        {icon}
        <div className="text-sm font-semibold text-white/90">{title}</div>
      </div>
      <div className="mt-2 text-xs text-white/60 leading-relaxed">{description}</div>
    </button>
  );
}

function ToggleButton({
  active,
  danger,
  icon,
  label,
  onClick,
}: {
  active: boolean;
  danger?: boolean;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  const dangerAttr = danger ? 'true' : undefined;
  return (
    <button
      type="button"
      className="ui-btn px-3 py-2"
      data-active={active}
      data-danger={dangerAttr}
      aria-pressed={active}
      onClick={onClick}
    >
      {icon}
      {label}
    </button>
  );
}
