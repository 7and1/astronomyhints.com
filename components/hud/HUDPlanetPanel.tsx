'use client';

import { useMemo } from 'react';
import { useOrbitStore } from '@/lib/store';
import { useShallow } from 'zustand/react/shallow';
import { Camera, ExternalLink, X } from 'lucide-react';

export default function HUDPlanetPanel() {
  const { selectedPlanet, planetData, setSelectedPlanet } = useOrbitStore(
    useShallow((s) => {
      const selectedPlanet = s.selectedPlanet;
      const planetData = selectedPlanet ? s.planets.get(selectedPlanet) ?? null : null;
      return {
        selectedPlanet,
        planetData,
        setSelectedPlanet: s.setSelectedPlanet,
      };
    })
  );

  const photographyTip = useMemo(() => {
    if (!planetData) return null;

    const tips: Record<string, string> = {
      Mercury: 'Best viewed at twilight near greatest elongation—stay safe and avoid the Sun.',
      Venus: 'Try capturing Venus during blue hour; a crescent phase looks dramatic.',
      Earth: 'ISS transits and lunar eclipses make unforgettable frames.',
      Mars: 'Around opposition, use red/IR filters to bring out surface detail.',
      Jupiter: 'Watch for Great Red Spot rotations and moon transits.',
      Saturn: 'Opposition is best; ring tilt changes over the years.',
      Uranus: 'A tracking mount and longer exposures help reveal its blue-green tint.',
      Neptune: 'A larger aperture and steady seeing are key—aim for crisp, high-magnification shots.',
    };

    return tips[planetData.name] ?? 'Point your telescope and capture the cosmos.';
  }, [planetData]);

  const ctaHref = useMemo(() => {
    if (!planetData) return 'https://astronomyhints.com';
    const base = 'https://astronomyhints.com/';
    const params = new URLSearchParams({
      utm_source: 'orbit-command',
      utm_medium: 'app',
      utm_campaign: 'solar-system',
      utm_content: planetData.name,
    });
    return `${base}?${params.toString()}`;
  }, [planetData]);

  if (!selectedPlanet || !planetData) return null;

  return (
    <aside
      className="fixed left-4 right-4 bottom-4 z-30 md:left-auto md:right-6 md:top-24 md:bottom-auto md:w-[26rem]"
      role="complementary"
      aria-label={`${planetData.name} information panel`}
    >
      <div className="ui-panel ui-panel-strong max-h-[70dvh] overflow-hidden md:max-h-[calc(100dvh-8.5rem)]">
        <div className="flex items-start justify-between gap-4 p-4">
          <div className="min-w-0">
            <div className="text-xs font-mono text-white/50 tracking-wider" aria-hidden="true">
              PLANET
            </div>
            <h2 className="truncate text-2xl font-semibold tracking-tight" id="planet-panel-title">
              {planetData.name}
            </h2>
          </div>

          <button
            type="button"
            className="ui-icon-btn"
            aria-label={`Close ${planetData.name} panel`}
            onClick={() => setSelectedPlanet(null)}
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>

        <div className="ui-divider" role="separator" />

        <div className="max-h-[calc(70dvh-64px)] overflow-auto p-4 md:max-h-[calc(100dvh-8.5rem-64px)]">
          <div
            className="grid grid-cols-2 gap-3"
            role="list"
            aria-label={`${planetData.name} statistics`}
          >
            <StatItem label="Distance" value={`${planetData.distance.toFixed(2)} AU`} unit="astronomical units" />
            <StatItem label="Velocity" value={`${planetData.velocity.toFixed(1)} km/s`} unit="kilometers per second" />
            <StatItem label="Temperature" value={`${planetData.temperature} K`} unit="Kelvin" />
            <StatItem label="Mass" value={`${planetData.mass.toFixed(2)} M⊕`} unit="Earth masses" />
            <StatItem label="Moons" value={planetData.moons.toString()} />
            <StatItem label="Radius" value={`${planetData.radius.toFixed(2)} R⊕`} unit="Earth radii" />
          </div>

          <div
            className="mt-4 rounded-xl border border-white/10 bg-white/5 p-4"
            role="region"
            aria-labelledby="photography-tip-heading"
          >
            <div className="flex items-center gap-2">
              <Camera className="size-4 text-cyan-200" aria-hidden="true" />
              <h3
                id="photography-tip-heading"
                className="text-xs font-mono text-white/60 tracking-wider"
              >
                PHOTOGRAPHY TIP
              </h3>
            </div>
            <p className="mt-2 text-sm text-white/80 leading-relaxed">
              {photographyTip}
            </p>
          </div>

          <div className="mt-4">
            <a
              className="ui-btn ui-btn-primary w-full py-3"
              href={ctaHref}
              target="_blank"
              rel="noreferrer"
              aria-label={`Read the full guide about ${planetData.name} on AstronomyHints.com (opens in new tab)`}
            >
              Read the full guide on AstronomyHints.com
              <ExternalLink className="size-4" aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>
    </aside>
  );
}

function StatItem({ label, value, unit }: { label: string; value: string; unit?: string }) {
  const srValue = unit ? `${value.replace(/[^\d.]/g, '')} ${unit}` : value;

  return (
    <div className="rounded-lg border border-white/10 bg-white/5 p-3" role="listitem">
      <div className="text-[11px] font-mono text-white/50 tracking-wider">
        {label}
      </div>
      <div className="mt-1 text-sm font-semibold text-white" aria-label={`${label}: ${srValue}`}>
        {value}
      </div>
    </div>
  );
}
