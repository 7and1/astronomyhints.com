'use client';

import { useEffect, useMemo, useState } from 'react';
import { useOrbitStore } from '@/lib/store';
import { useShallow } from 'zustand/react/shallow';
import {
  CircleHelp,
  Command as CommandIcon,
  Compass,
  Share2,
  Sparkles,
  X,
} from 'lucide-react';

type TutorialStepId = 'navigate' | 'focus' | 'commands' | 'share';

type TutorialStep = {
  id: TutorialStepId;
  title: string;
  body: React.ReactNode;
  primaryAction?: { label: string; onClick: () => void };
  secondaryAction?: { label: string; onClick: () => void };
};

function clampIndex(value: number, max: number) {
  if (max <= 0) return 0;
  return Math.min(Math.max(value, 0), max - 1);
}

export default function HUDTutorialCoachmarks({
  open,
  onClose,
  onOpenHelp,
  onOpenPalette,
  onOpenMenu,
  onShare,
}: {
  open: boolean;
  onClose: () => void;
  onOpenHelp: () => void;
  onOpenPalette: () => void;
  onOpenMenu: () => void;
  onShare: () => void;
}) {
  const [stepIndex, setStepIndex] = useState(0);
  const [coarsePointer, setCoarsePointer] = useState(false);

  const { selectedPlanet } = useOrbitStore(
    useShallow((s) => ({
      selectedPlanet: s.selectedPlanet,
    }))
  );

  useEffect(() => {
    if (!open) return;
    setStepIndex(0);
  }, [open]);

  useEffect(() => {
    const media = window.matchMedia?.('(pointer: coarse)');
    if (!media) return;

    const update = () => setCoarsePointer(media.matches);
    update();

    media.addEventListener?.('change', update);
    return () => media.removeEventListener?.('change', update);
  }, []);

  const steps = useMemo<TutorialStep[]>(() => {
    const navigateBody = (
      <div className="space-y-2 text-sm text-white/75 leading-relaxed">
        <div className="flex flex-wrap items-center gap-2">
          <span className="ui-chip">
            {coarsePointer ? 'Touch + drag' : 'Drag'} to rotate
          </span>
          <span className="ui-chip">
            {coarsePointer ? 'Pinch' : 'Scroll'} to zoom
          </span>
          <span className="ui-chip">{coarsePointer ? 'Tap space' : 'Click space'} to clear</span>
        </div>
        <div className="text-xs text-white/55">
          Tip: press <span className="ui-kbd">?</span> anytime for the full controls list.
        </div>
      </div>
    );

    const focusBody = (
      <div className="space-y-2 text-sm text-white/75 leading-relaxed">
        <div className="flex flex-wrap items-center gap-2">
          <span className="ui-chip">Tap a planet</span>
          <span className="ui-chip">View stats + tips</span>
          <span className="ui-chip">Esc to close panels</span>
        </div>
        <div className="text-xs text-white/55">
          {selectedPlanet
            ? (
                <>
                  Nice — you’re focused on{' '}
                  <span className="font-mono text-white/80">{selectedPlanet}</span>.
                </>
              )
            : 'Try selecting a planet to open the details panel.'}
        </div>
      </div>
    );

    const commandsBody = (
      <div className="space-y-2 text-sm text-white/75 leading-relaxed">
        <div className="flex flex-wrap items-center gap-2">
          <span className="ui-chip">Search planets</span>
          <span className="ui-chip">Toggle orbits/labels</span>
          <span className="ui-chip">Change graphics</span>
        </div>
        <div className="text-xs text-white/55">
          Keyboard: <span className="ui-kbd">K</span> or <span className="ui-kbd">⌘K</span>
        </div>
      </div>
    );

    const shareBody = (
      <div className="space-y-2 text-sm text-white/75 leading-relaxed">
        <div className="flex flex-wrap items-center gap-2">
          <span className="ui-chip">Open Menu</span>
          <span className="ui-chip">Copy share link</span>
          <span className="ui-chip">Snapshot</span>
        </div>
        <div className="text-xs text-white/55">
          Sharing saves your moment: planet focus, time, speed, orbits/labels, and quality.
        </div>
      </div>
    );

    return [
      {
        id: 'navigate',
        title: 'Navigate the scene',
        body: navigateBody,
        primaryAction: { label: 'Open help', onClick: onOpenHelp },
      },
      {
        id: 'focus',
        title: 'Focus a planet',
        body: focusBody,
      },
      {
        id: 'commands',
        title: 'Find anything fast',
        body: commandsBody,
        primaryAction: { label: 'Open palette', onClick: onOpenPalette },
      },
      {
        id: 'share',
        title: 'Tune & share',
        body: shareBody,
        primaryAction: { label: 'Open menu', onClick: onOpenMenu },
        secondaryAction: { label: 'Copy link', onClick: onShare },
      },
    ];
  }, [coarsePointer, onOpenHelp, onOpenMenu, onOpenPalette, onShare, selectedPlanet]);

  const step = steps[clampIndex(stepIndex, steps.length)];
  const stepCount = steps.length;

  if (!open || !step) return null;

  const isLast = stepIndex >= stepCount - 1;
  const titleIcon =
    step.id === 'navigate' ? (
      <Compass className="size-4 text-cyan-200" />
    ) : step.id === 'focus' ? (
      <Sparkles className="size-4 text-cyan-200" />
    ) : step.id === 'commands' ? (
      <CommandIcon className="size-4 text-cyan-200" />
    ) : (
      <Share2 className="size-4 text-cyan-200" />
    );

  return (
    <div className="pointer-events-none fixed inset-0 z-40">
      <div className="pointer-events-auto absolute left-1/2 top-24 w-[min(560px,calc(100vw-2rem))] -translate-x-1/2 md:top-28">
        <div className="ui-panel ui-panel-strong hud-dialog overflow-hidden">
          <div className="flex items-start justify-between gap-4 p-4">
            <div className="min-w-0 space-y-1">
              <div className="flex items-center gap-2">
                {titleIcon}
                <div className="truncate text-sm font-semibold tracking-tight text-white/90">
                  Guided tour
                </div>
                <div className="ui-chip">
                  {stepIndex + 1}/{stepCount}
                </div>
              </div>
              <div className="text-lg font-semibold tracking-tight">{step.title}</div>
            </div>

            <button
              type="button"
              className="ui-icon-btn size-9"
              aria-label="Close guided tour"
              onClick={onClose}
            >
              <X className="size-4" />
            </button>
          </div>

          <div className="ui-divider" />

          <div className="p-4">
            {step.body}
          </div>

          <div className="ui-divider" />

          <div className="flex flex-wrap items-center justify-between gap-2 p-4">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                className="ui-btn px-3 py-2"
                onClick={() => setStepIndex((v) => clampIndex(v - 1, stepCount))}
                disabled={stepIndex === 0}
                aria-disabled={stepIndex === 0}
              >
                Back
              </button>
              <button
                type="button"
                className="ui-btn ui-btn-primary px-3 py-2"
                onClick={() => {
                  if (isLast) onClose();
                  else setStepIndex((v) => clampIndex(v + 1, stepCount));
                }}
              >
                {isLast ? 'Done' : 'Next'}
              </button>
              {!isLast && (
                <button type="button" className="ui-btn px-3 py-2" onClick={onClose}>
                  Skip
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {step.primaryAction && (
                <button
                  type="button"
                  className="ui-btn px-3 py-2"
                  onClick={step.primaryAction.onClick}
                >
                  {step.primaryAction.label}
                </button>
              )}
              {step.secondaryAction && (
                <button
                  type="button"
                  className="ui-btn px-3 py-2"
                  onClick={step.secondaryAction.onClick}
                >
                  {step.secondaryAction.label}
                </button>
              )}
            </div>
          </div>

          <div className="px-4 pb-4 text-[11px] text-white/50">
            <div className="flex flex-wrap items-center gap-2 font-mono">
              <CircleHelp className="size-4 text-white/50" />
              Pro tip: open the palette with <span className="ui-kbd">K</span> /{' '}
              <span className="ui-kbd">⌘K</span> and search “Mars”.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
