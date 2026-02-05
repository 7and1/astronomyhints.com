'use client';

import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { useFocusTrap } from '@/lib/useFocusTrap';

export default function HUDHelpDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

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

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50" onClick={handleClose} onKeyDown={handleKeyDown}>
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm hud-backdrop"
        role="presentation"
        aria-hidden="true"
      />

      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="help-dialog-title"
          aria-describedby="help-dialog-description"
          className="ui-panel ui-panel-strong hud-dialog w-full max-w-2xl overflow-hidden"
          ref={dialogRef}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-start justify-between gap-6 p-6">
            <div className="space-y-1">
              <div className="text-xs font-mono text-white/50 tracking-wider" aria-hidden="true">
                Orbit Command
              </div>
              <h2 id="help-dialog-title" className="text-2xl font-semibold tracking-tight">
                Controls &amp; Keyboard Shortcuts
              </h2>
              <p id="help-dialog-description" className="text-sm text-white/70">
                Quick reference for mouse, touch, and keyboard shortcuts.
              </p>
            </div>

            <button
              ref={closeButtonRef}
              type="button"
              className="ui-icon-btn"
              aria-label="Close help dialog"
              onClick={handleClose}
            >
              <X className="size-5" aria-hidden="true" />
            </button>
          </div>

          <div className="ui-divider" role="separator" />

          <div className="grid gap-6 p-6 md:grid-cols-2">
            <section aria-labelledby="mouse-touch-heading">
              <h3 id="mouse-touch-heading" className="text-xs font-mono text-white/50 tracking-wider mb-3">
                Mouse / Touch
              </h3>
              <ul className="space-y-2 text-sm text-white/80" role="list">
                <li>
                  <span className="ui-chip" aria-hidden="true">Drag</span>
                  <span className="sr-only">Drag:</span> Rotate view
                </li>
                <li>
                  <span className="ui-chip" aria-hidden="true">Scroll / Pinch</span>
                  <span className="sr-only">Scroll or Pinch:</span> Zoom in/out
                </li>
                <li>
                  <span className="ui-chip" aria-hidden="true">Click a planet</span>
                  <span className="sr-only">Click a planet:</span> Focus + details
                </li>
                <li>
                  <span className="ui-chip" aria-hidden="true">Click space</span>
                  <span className="sr-only">Click empty space:</span> Deselect
                </li>
              </ul>
            </section>

            <section aria-labelledby="keyboard-heading">
              <h3 id="keyboard-heading" className="text-xs font-mono text-white/50 tracking-wider mb-3">
                Keyboard Shortcuts
              </h3>
              <ul className="space-y-2 text-sm text-white/80" role="list">
                <li>
                  <kbd className="ui-kbd" aria-hidden="true">?</kbd>
                  <span className="sr-only">Question mark:</span> Toggle help
                </li>
                <li>
                  <kbd className="ui-kbd" aria-hidden="true">O</kbd>
                  <span className="sr-only">O key:</span> Toggle orbits
                </li>
                <li>
                  <kbd className="ui-kbd" aria-hidden="true">L</kbd>
                  <span className="sr-only">L key:</span> Toggle labels
                </li>
                <li>
                  <kbd className="ui-kbd" aria-hidden="true">C</kbd>
                  <span className="sr-only">C key:</span> Cinematic mode
                </li>
                <li>
                  <kbd className="ui-kbd" aria-hidden="true">K</kbd>
                  <span className="sr-only">K key:</span> Command palette
                </li>
                <li>
                  <kbd className="ui-kbd" aria-hidden="true">M</kbd>
                  <span className="sr-only">M key:</span> Mission control
                </li>
                <li>
                  <kbd className="ui-kbd" aria-hidden="true">S</kbd>
                  <span className="sr-only">S key:</span> Snapshot
                </li>
                <li>
                  <kbd className="ui-kbd" aria-hidden="true">Space</kbd>
                  <span className="sr-only">Spacebar:</span> Pause/resume time
                </li>
                <li>
                  <kbd className="ui-kbd" aria-hidden="true">Esc</kbd>
                  <span className="sr-only">Escape:</span> Close panels
                </li>
                <li>
                  <kbd className="ui-kbd" aria-hidden="true">←/→</kbd>
                  <span className="sr-only">Arrow keys:</span> Navigate planets
                </li>
                <li>
                  <kbd className="ui-kbd" aria-hidden="true">Home/End</kbd>
                  <span className="sr-only">Home and End:</span> First/last planet
                </li>
              </ul>
            </section>
          </div>

          <div className="ui-divider" role="separator" />

          <div className="flex flex-wrap items-center justify-between gap-3 p-6">
            <p className="text-sm text-white/70">
              Tip: cinematic mode disables manual camera controls.
            </p>
            <button
              type="button"
              className="ui-btn"
              onClick={handleClose}
              aria-label="Close help dialog"
            >
              Got it
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
