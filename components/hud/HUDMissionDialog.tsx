'use client';

import { useEffect, useRef } from 'react';
import { useOrbitStore } from '@/lib/store';
import { CheckCircle2, Rocket, X } from 'lucide-react';
import type { OrbitMission } from '@/lib/missions';
import { useFocusTrap } from '@/lib/useFocusTrap';

export default function HUDMissionDialog({
  open,
  mission,
  completed,
  onClose,
  onNewMission,
}: {
  open: boolean;
  mission: OrbitMission | null;
  completed: boolean;
  onClose: () => void;
  onNewMission: () => void;
}) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const selectedPlanet = useOrbitStore((s) => s.selectedPlanet);

  useFocusTrap(open, dialogRef);

  useEffect(() => {
    if (!open) return;
    previousFocusRef.current = document.activeElement as HTMLElement;
    closeButtonRef.current?.focus();
  }, [open]);

  const handleClose = () => {
    onClose();
    previousFocusRef.current?.focus();
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      handleClose();
    }
  };

  if (!open || !mission) return null;

  return (
    <div className="fixed inset-0 z-[60]" onClick={handleClose} onKeyDown={handleKeyDown}>
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm hud-backdrop"
        role="presentation"
        aria-hidden="true"
      />

      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="mission-dialog-title"
          aria-describedby="mission-dialog-description"
          className="ui-panel ui-panel-strong hud-dialog w-full max-w-2xl overflow-hidden"
          ref={dialogRef}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-start justify-between gap-6 p-6">
            <div className="space-y-1">
              <div className="text-xs font-mono text-white/50 tracking-wider" aria-hidden="true">
                MISSION CONTROL
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Rocket className="size-5 text-cyan-200" aria-hidden="true" />
                <h2 id="mission-dialog-title" className="text-2xl font-semibold tracking-tight">
                  {mission.title}
                </h2>
              </div>
              <p id="mission-dialog-description" className="text-sm text-white/75">
                {mission.prompt}
              </p>
            </div>

            <button
              ref={closeButtonRef}
              type="button"
              className="ui-icon-btn"
              aria-label="Close mission control"
              onClick={handleClose}
            >
              <X className="size-5" aria-hidden="true" />
            </button>
          </div>

          <div className="ui-divider" role="separator" />

          <div className="space-y-4 p-6">
            <div
              className="rounded-xl border border-white/10 bg-white/5 p-4"
              role="region"
              aria-label="Mission status"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="text-xs font-mono text-white/50 tracking-wider">
                  STATUS
                </div>
                <div
                  className="ui-chip"
                  role="status"
                  aria-live="polite"
                >
                  {completed ? (
                    <>
                      <CheckCircle2 className="size-4 text-emerald-200" aria-hidden="true" />
                      <span>Completed</span>
                    </>
                  ) : (
                    <span>In progress</span>
                  )}
                </div>
              </div>
              <div className="mt-2 text-sm text-white/70">
                {completed
                  ? 'Nice work. Generate a new mission when you are ready.'
                  : 'Select a planet to complete the mission.'}
              </div>
              <div className="mt-2 text-xs text-white/45">
                Current selection:{' '}
                <span className="font-mono text-white/70" aria-live="polite">
                  {selectedPlanet ?? 'None'}
                </span>
              </div>
            </div>

            {mission.hint && (
              <div
                className="rounded-xl border border-white/10 bg-white/5 p-4"
                role="region"
                aria-label="Mission hint"
              >
                <div className="text-xs font-mono text-white/50 tracking-wider">
                  HINT
                </div>
                <div className="mt-2 text-sm text-white/75 leading-relaxed">
                  {mission.hint}
                </div>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Mission actions">
              <button
                type="button"
                className="ui-btn ui-btn-primary px-4 py-2"
                onClick={onNewMission}
              >
                New mission
              </button>
              <button
                type="button"
                className="ui-btn px-4 py-2"
                onClick={handleClose}
              >
                Close
              </button>

              <div className="ml-auto text-xs text-white/45">
                Tip: press <kbd className="ui-kbd">K</kbd> to jump to a planet.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
