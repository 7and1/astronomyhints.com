import { LoaderCircle } from 'lucide-react';

export default function BootScreen() {
  return (
    <div
      className="w-full h-dvh flex items-center justify-center bg-black"
      role="status"
      aria-live="polite"
      aria-label="Loading Orbit Command"
    >
      <div className="ui-panel ui-panel-strong w-[min(560px,calc(100vw-2rem))] p-8">
        <div className="flex items-start justify-between gap-6">
          <div className="space-y-2">
            <div className="text-xs font-mono text-white/50 tracking-wider" aria-hidden="true">
              astronomyhints.com
            </div>
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
              <span className="text-cyan-200">Orbit</span> Command
            </h1>
            <p className="text-sm text-white/70 leading-relaxed">
              Initializing the real-time solar system.
            </p>
          </div>

          <div className="shrink-0">
            <div className="ui-chip" role="status" aria-label="Loading WebGL graphics">
              <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
              <span>Loading WebGL…</span>
            </div>
          </div>
        </div>

        <div className="ui-divider my-6" role="separator" />

        <div className="grid grid-cols-2 gap-3 text-xs text-white/60">
          <div className="space-y-1">
            <div className="font-mono text-white/40">Tip</div>
            <div>Use a trackpad pinch or mouse wheel to zoom.</div>
          </div>
          <div className="space-y-1">
            <div className="font-mono text-white/40">Shortcut</div>
            <div>
              Press <kbd className="ui-kbd">?</kbd> for help.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
