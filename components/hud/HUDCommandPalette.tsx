'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useOrbitStore } from '@/lib/store';
import { useShallow } from 'zustand/react/shallow';
import { useFocusTrap } from '@/lib/useFocusTrap';
import { PLANET_ORDER } from '@/lib/planets';
import {
  Battery,
  Command,
  Compass,
  Film,
  Gauge,
  HelpCircle,
  Orbit as OrbitIcon,
  Search,
  Sparkles,
  Tags,
  Timer,
  X,
} from 'lucide-react';

type PaletteGroup = 'Planets' | 'Commands';

type PaletteItem = {
  id: string;
  label: string;
  description?: string;
  group: PaletteGroup;
  shortcut?: string;
  icon?: React.ReactNode;
  action: () => void;
  keywords?: string[];
};

function normalizeQuery(value: string) {
  return value.trim().toLowerCase();
}

function matchesQuery(item: PaletteItem, query: string) {
  if (!query) return true;
  const haystack = [
    item.label,
    item.description ?? '',
    ...(item.keywords ?? []),
  ]
    .join(' ')
    .toLowerCase();
  return haystack.includes(query);
}

function clampIndex(index: number, max: number) {
  if (max <= 0) return 0;
  return Math.min(Math.max(index, 0), max - 1);
}

export default function HUDCommandPalette({
  open,
  onClose,
  onOpenHelp,
  onSnapshot,
}: {
  open: boolean;
  onClose: () => void;
  onOpenHelp: () => void;
  onSnapshot: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);

  const {
    showOrbits,
    showLabels,
    cinematicPlaying,
    timeSpeed,
    renderQuality,
    setSelectedPlanet,
    setTimeSpeed,
    setRenderQuality,
    toggleOrbits,
    toggleLabels,
    toggleCinematic,
  } = useOrbitStore(
    useShallow((s) => ({
      showOrbits: s.showOrbits,
      showLabels: s.showLabels,
      cinematicPlaying: s.cinematicPlaying,
      timeSpeed: s.timeSpeed,
      renderQuality: s.renderQuality,
      setSelectedPlanet: s.setSelectedPlanet,
      setTimeSpeed: s.setTimeSpeed,
      setRenderQuality: s.setRenderQuality,
      toggleOrbits: s.toggleOrbits,
      toggleLabels: s.toggleLabels,
      toggleCinematic: s.toggleCinematic,
    }))
  );

  useFocusTrap(open, dialogRef);

  useEffect(() => {
    if (!open) return;
    setQuery('');
    setActiveIndex(0);
    window.setTimeout(() => inputRef.current?.focus(), 0);
  }, [open]);

  const items = useMemo(() => {
    const planetItems: PaletteItem[] = PLANET_ORDER.map((planet) => ({
      id: `focus-${planet}`,
      label: `Focus ${planet}`,
      description: 'Center the camera and open details.',
      group: 'Planets',
      icon: <Compass className="size-4 text-cyan-200" />,
      action: () => setSelectedPlanet(planet),
      keywords: [planet, 'planet', 'focus', 'details'],
    }));

    const commandItems: PaletteItem[] = [
      {
        id: 'quality-high',
        label: 'Graphics: High',
        description:
          renderQuality === 'high' ? 'Current • max clarity.' : 'Max clarity (more GPU).',
        group: 'Commands',
        icon: <Sparkles className="size-4 text-cyan-200" />,
        action: () => setRenderQuality('high'),
        keywords: ['graphics', 'quality', 'high', 'performance', 'dpr', 'bloom'],
      },
      {
        id: 'quality-balanced',
        label: 'Graphics: Balanced',
        description:
          renderQuality === 'balanced'
            ? 'Current • recommended.'
            : 'Recommended for most devices.',
        group: 'Commands',
        icon: <Gauge className="size-4 text-cyan-200" />,
        action: () => setRenderQuality('balanced'),
        keywords: ['graphics', 'quality', 'balanced', 'recommended', 'performance'],
      },
      {
        id: 'quality-low',
        label: 'Graphics: Low',
        description:
          renderQuality === 'low' ? 'Current • battery saver.' : 'Faster, fewer effects.',
        group: 'Commands',
        icon: <Battery className="size-4 text-cyan-200" />,
        action: () => setRenderQuality('low'),
        keywords: ['graphics', 'quality', 'low', 'battery', 'performance'],
      },
      {
        id: 'toggle-orbits',
        label: showOrbits ? 'Hide orbits' : 'Show orbits',
        description: 'Toggle orbital paths.',
        group: 'Commands',
        shortcut: 'O',
        icon: <OrbitIcon className="size-4 text-cyan-200" />,
        action: toggleOrbits,
        keywords: ['orbits', 'paths'],
      },
      {
        id: 'toggle-labels',
        label: showLabels ? 'Hide labels' : 'Show labels',
        description: 'Toggle planet name labels.',
        group: 'Commands',
        shortcut: 'L',
        icon: <Tags className="size-4 text-cyan-200" />,
        action: toggleLabels,
        keywords: ['labels', 'names'],
      },
      {
        id: 'toggle-cinematic',
        label: cinematicPlaying ? 'Stop cinematic tour' : 'Start cinematic tour',
        description: 'Hands-free flyby tour.',
        group: 'Commands',
        shortcut: 'C',
        icon: <Film className="size-4 text-cyan-200" />,
        action: toggleCinematic,
        keywords: ['cinematic', 'tour', 'autoplay'],
      },
      {
        id: 'snapshot',
        label: 'Take snapshot',
        description: 'Download a PNG of the current view.',
        group: 'Commands',
        shortcut: 'S',
        icon: <Sparkles className="size-4 text-cyan-200" />,
        action: onSnapshot,
        keywords: ['snapshot', 'screenshot', 'png'],
      },
      {
        id: 'time-pause',
        label: timeSpeed === 0 ? 'Resume time' : 'Pause time',
        description: 'Toggle simulation time.',
        group: 'Commands',
        shortcut: 'Space',
        icon: <Timer className="size-4 text-cyan-200" />,
        action: () => setTimeSpeed(timeSpeed === 0 ? 30 : 0),
        keywords: ['time', 'pause', 'resume', 'speed'],
      },
      {
        id: 'surprise',
        label: 'Surprise me',
        description: 'Jump to a random planet.',
        group: 'Commands',
        icon: <Command className="size-4 text-cyan-200" />,
        action: () => {
          const next = PLANET_ORDER[Math.floor(Math.random() * PLANET_ORDER.length)];
          setSelectedPlanet(next);
        },
        keywords: ['random', 'planet', 'surprise'],
      },
      {
        id: 'help',
        label: 'Open help',
        description: 'Keyboard shortcuts and controls.',
        group: 'Commands',
        shortcut: '?',
        icon: <HelpCircle className="size-4 text-cyan-200" />,
        action: onOpenHelp,
        keywords: ['help', 'shortcuts', 'controls'],
      },
      {
        id: 'reset',
        label: 'Reset view',
        description: 'Clear focus and return to overview.',
        group: 'Commands',
        shortcut: 'Esc',
        icon: <Compass className="size-4 text-cyan-200" />,
        action: () => setSelectedPlanet(null),
        keywords: ['reset', 'overview', 'clear'],
      },
    ];

    const allItems = [...planetItems, ...commandItems];
    const q = normalizeQuery(query);
    const filtered = allItems.filter((item) => matchesQuery(item, q));

    if (!q) return filtered;

    return filtered.sort((a, b) => {
      if (a.group === b.group) return a.label.localeCompare(b.label);
      return a.group === 'Commands' ? -1 : 1;
    });
  }, [
    cinematicPlaying,
    onOpenHelp,
    onSnapshot,
    query,
    renderQuality,
    setSelectedPlanet,
    setRenderQuality,
    setTimeSpeed,
    showLabels,
    showOrbits,
    timeSpeed,
    toggleCinematic,
    toggleLabels,
    toggleOrbits,
  ]);

  useEffect(() => {
    setActiveIndex((v) => clampIndex(v, items.length));
  }, [items.length]);

  const runItem = (item: PaletteItem) => {
    item.action();
    onClose();
  };

  if (!open) return null;

  let lastGroup: PaletteGroup | null = null;

  return (
    <div className="fixed inset-0 z-50" onClick={onClose}>
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm hud-backdrop"
        role="presentation"
        aria-hidden="true"
      />

      <div className="absolute inset-0 flex items-start justify-center p-4 pt-20 md:pt-28">
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Command palette"
          className="ui-panel ui-panel-strong hud-dialog w-full max-w-2xl overflow-hidden"
          ref={dialogRef}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-3 p-4">
            <Search className="size-4 text-white/60" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Escape') {
                  event.preventDefault();
                  onClose();
                  return;
                }

                if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
                  event.preventDefault();
                  const direction = event.key === 'ArrowDown' ? 1 : -1;
                  setActiveIndex((v) => clampIndex(v + direction, items.length));
                  return;
                }

                if (event.key === 'Enter') {
                  event.preventDefault();
                  const item = items[activeIndex];
                  if (item) runItem(item);
                }
              }}
              className="h-10 w-full bg-transparent text-sm text-white placeholder:text-white/40 focus:outline-none"
              placeholder="Search planets and commands…"
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              aria-label="Search commands"
            />
            <button
              type="button"
              className="ui-icon-btn size-9"
              aria-label="Close command palette"
              onClick={onClose}
            >
              <X className="size-4" />
            </button>
          </div>

          <div className="ui-divider" />

          <div className="max-h-[60dvh] overflow-auto p-2">
            {items.length === 0 ? (
              <div className="px-3 py-8 text-center text-sm text-white/60">
                No results. Try “Mars”, “cinematic”, or “snapshot”.
              </div>
            ) : (
              <div role="listbox" aria-label="Command results" className="space-y-1">
                {items.map((item, index) => {
                  const isActive = index === activeIndex;
                  const groupHeader = item.group !== lastGroup ? item.group : null;
                  lastGroup = item.group;

                  return (
                    <div key={item.id}>
                      {groupHeader && (
                        <div className="px-3 pb-1 pt-3 text-[11px] font-mono tracking-wider text-white/45">
                          {groupHeader}
                        </div>
                      )}

                      <button
                        type="button"
                        role="option"
                        aria-selected={isActive}
                        data-active={isActive}
                        className="w-full rounded-lg border border-transparent px-3 py-2 text-left hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black data-[active='true']:border-white/10 data-[active='true']:bg-white/5"
                        onMouseEnter={() => setActiveIndex(index)}
                        onClick={() => runItem(item)}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="shrink-0">{item.icon}</span>
                              <div className="truncate text-sm font-medium text-white/90">
                                {item.label}
                              </div>
                            </div>
                            {item.description && (
                              <div className="mt-1 truncate text-xs text-white/55">
                                {item.description}
                              </div>
                            )}
                          </div>

                          {item.shortcut && (
                            <span className="shrink-0 ui-kbd">{item.shortcut}</span>
                          )}
                        </div>
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="ui-divider" />

          <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-[11px] text-white/50">
            <div className="font-mono">
              <span className="ui-kbd">↑</span> <span className="ui-kbd">↓</span> navigate •{' '}
              <span className="ui-kbd">Enter</span> run • <span className="ui-kbd">Esc</span> close
            </div>
            <div className="font-mono">
              Open anytime: <span className="ui-kbd">K</span> or <span className="ui-kbd">⌘K</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
