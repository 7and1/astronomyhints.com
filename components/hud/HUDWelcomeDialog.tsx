'use client';

import { useEffect, useRef } from 'react';
import { Command, Film, MousePointer2, Rocket, Sparkles, X } from 'lucide-react';
import { useFocusTrap } from '@/lib/useFocusTrap';

export default function HUDWelcomeDialog({
  open,
  onClose,
  onStartMission,
  onStartTour,
}: {
  open: boolean;
  onClose: () => void;
  onStartMission: () => void;
  onStartTour: () => void;
}) {
  const primaryButtonRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useFocusTrap(open, dialogRef);

  useEffect(() => {
    if (!open) return;
    previousFocusRef.current = document.activeElement as HTMLElement;
    primaryButtonRef.current?.focus();
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

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70]" onClick={handleClose} onKeyDown={handleKeyDown}>
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm hud-backdrop"
        role="presentation"
        aria-hidden="true"
      />

      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="welcome-dialog-title"
          aria-describedby="welcome-dialog-description"
          className="ui-panel ui-panel-strong hud-dialog w-full max-w-2xl overflow-hidden"
          ref={dialogRef}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-start justify-between gap-6 p-6">
            <div className="space-y-2">
              <div className="text-xs font-mono text-white/50 tracking-wider" aria-hidden="true">
                ORBIT COMMAND
              </div>
              <h2 id="welcome-dialog-title" className="text-3xl font-semibold tracking-tight">
                Mission briefing
              </h2>
              <p id="welcome-dialog-description" className="text-sm text-white/70 leading-relaxed">
                Explore the solar system in real time — and unlock a few fun tricks.
              </p>
            </div>

            <button
              type="button"
              className="ui-icon-btn"
              aria-label="Close welcome dialog"
              onClick={handleClose}
            >
              <X className="size-5" aria-hidden="true" />
            </button>
          </div>

          <div className="ui-divider" role="separator" />

          <div className="grid gap-4 p-6 md:grid-cols-3" role="list" aria-label="Features">
            <FeatureCard
              icon={<MousePointer2 className="size-4 text-cyan-200" aria-hidden="true" />}
              title="Explore"
              body="Drag to rotate, scroll/pinch to zoom, click planets for details."
            />
            <FeatureCard
              icon={<Command className="size-4 text-cyan-200" aria-hidden="true" />}
              title="Command palette"
              body="Press K (or ⌘K) to jump to planets and run commands fast."
            />
            <FeatureCard
              icon={<Film className="size-4 text-cyan-200" aria-hidden="true" />}
              title="Cinematic tour"
              body="Press C for a hands-free flyby. Great for screenshots."
            />
          </div>

          <div className="ui-divider" role="separator" />

          <div className="flex flex-wrap items-center justify-between gap-3 p-6">
            <div className="flex items-center gap-2 text-xs text-white/60">
              <Sparkles className="size-4 text-cyan-200" aria-hidden="true" />
              <span>Tip: press <kbd className="ui-kbd">S</kbd> to save a snapshot.</span>
            </div>

            <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Getting started options">
              <button
                ref={primaryButtonRef}
                type="button"
                className="ui-btn ui-btn-primary px-4 py-2"
                onClick={onStartTour}
              >
                Guided tour
              </button>
              <button
                type="button"
                className="ui-btn px-4 py-2"
                onClick={handleClose}
              >
                Start exploring
              </button>
              <button
                type="button"
                className="ui-btn px-4 py-2"
                onClick={onStartMission}
              >
                <Rocket className="size-4" aria-hidden="true" />
                Start a mission
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4" role="listitem">
      <div className="flex items-center gap-2">
        {icon}
        <h3 className="text-sm font-semibold text-white/90">{title}</h3>
      </div>
      <p className="mt-2 text-sm text-white/70 leading-relaxed">{body}</p>
    </div>
  );
}
