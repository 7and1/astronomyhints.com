'use client';

import { useOrbitStore } from '@/lib/store';
import { useShallow } from 'zustand/react/shallow';
import { useMemo } from 'react';

/**
 * Provides accessible text description of the 3D scene for screen readers.
 * WCAG 2.1 AA: 1.1.1 Non-text Content - Text alternative for 3D visualization
 */
export default function AccessibleSceneDescription() {
  const { planets, selectedPlanet, currentDate, timeSpeed, cinematicPlaying } = useOrbitStore(
    useShallow((s) => ({
      planets: s.planets,
      selectedPlanet: s.selectedPlanet,
      currentDate: s.currentDate,
      timeSpeed: s.timeSpeed,
      cinematicPlaying: s.cinematicPlaying,
    }))
  );

  const sceneDescription = useMemo(() => {
    const planetList = Array.from(planets.values())
      .sort((a, b) => a.distance - b.distance)
      .map((p) => p.name)
      .join(', ');

    const dateStr = currentDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    let status = '';
    if (cinematicPlaying) {
      status = 'Cinematic tour is playing. ';
    } else if (timeSpeed === 0) {
      status = 'Simulation is paused. ';
    } else {
      status = `Simulation running at ${timeSpeed} days per second. `;
    }

    return `3D Solar System visualization showing the Sun and ${planets.size} planets: ${planetList}. ` +
      `Current simulation date: ${dateStr}. ${status}` +
      (selectedPlanet ? `Currently focused on ${selectedPlanet}. ` : '') +
      'Use keyboard shortcuts to navigate: Press question mark for help, K for command palette, ' +
      'arrow keys to navigate between planets when focused.';
  }, [planets, selectedPlanet, currentDate, timeSpeed, cinematicPlaying]);

  const selectedPlanetDescription = useMemo(() => {
    if (!selectedPlanet) return null;
    const planet = planets.get(selectedPlanet);
    if (!planet) return null;

    return `${planet.name} details: ` +
      `Distance from Sun: ${planet.distance.toFixed(2)} astronomical units. ` +
      `Orbital velocity: ${planet.velocity.toFixed(1)} kilometers per second. ` +
      `Surface temperature: ${planet.temperature} Kelvin. ` +
      `Mass: ${planet.mass.toFixed(2)} Earth masses. ` +
      `Radius: ${planet.radius.toFixed(2)} Earth radii. ` +
      `Number of moons: ${planet.moons}.`;
  }, [selectedPlanet, planets]);

  return (
    <div className="sr-only" aria-live="polite" aria-atomic="true">
      <h2 id="scene-description-heading">Scene Description</h2>
      <p id="scene-description">{sceneDescription}</p>
      {selectedPlanetDescription && (
        <p id="selected-planet-description">{selectedPlanetDescription}</p>
      )}
    </div>
  );
}
