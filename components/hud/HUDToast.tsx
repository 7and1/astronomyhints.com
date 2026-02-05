export type HUDToastTone = 'neutral' | 'success' | 'danger';

export interface HUDToastState {
  message: string;
  tone?: HUDToastTone;
}

export default function HUDToast({ toast }: { toast: HUDToastState | null }) {
  if (!toast) return null;

  const toneClass =
    toast.tone === 'success'
      ? 'border-emerald-400/30 text-emerald-100'
      : toast.tone === 'danger'
        ? 'border-rose-400/30 text-rose-100'
        : 'border-white/15 text-white';

  return (
    <div
      className="fixed bottom-6 left-1/2 z-50 w-[min(520px,calc(100vw-2rem))] -translate-x-1/2"
      aria-live="polite"
      aria-atomic="true"
    >
      <div className={`ui-panel ui-panel-strong hud-toast px-4 py-3 ${toneClass}`}>
        <div className="text-sm leading-relaxed">{toast.message}</div>
      </div>
    </div>
  );
}
