'use client';

import { useEffect, useCallback, useRef } from 'react';
import { useOrbitStore } from './store';

/**
 * Accessibility hook for managing screen reader announcements,
 * keyboard navigation, and reduced motion preferences.
 */

// Live region announcer for screen readers
let announcer: HTMLDivElement | null = null;

function getAnnouncer(): HTMLDivElement {
  if (announcer) return announcer;

  announcer = document.createElement('div');
  announcer.setAttribute('role', 'status');
  announcer.setAttribute('aria-live', 'polite');
  announcer.setAttribute('aria-atomic', 'true');
  announcer.className = 'sr-only';
  announcer.style.cssText = `
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  `;
  document.body.appendChild(announcer);
  return announcer;
}

export function announce(message: string, priority: 'polite' | 'assertive' = 'polite') {
  const el = getAnnouncer();
  el.setAttribute('aria-live', priority);
  // Clear and set to trigger announcement
  el.textContent = '';
  requestAnimationFrame(() => {
    el.textContent = message;
  });
}

// Hook for reduced motion preference
export function usePrefersReducedMotion(): boolean {
  const mediaQuery = typeof window !== 'undefined'
    ? window.matchMedia('(prefers-reduced-motion: reduce)')
    : null;

  return mediaQuery?.matches ?? false;
}

// Hook for high contrast preference
export function usePrefersHighContrast(): boolean {
  const mediaQuery = typeof window !== 'undefined'
    ? window.matchMedia('(prefers-contrast: more)')
    : null;

  return mediaQuery?.matches ?? false;
}

// Keyboard navigation constants
export const KEYBOARD_SHORTCUTS = {
  HELP: '?',
  TOGGLE_ORBITS: 'o',
  TOGGLE_LABELS: 'l',
  CINEMATIC_MODE: 'c',
  COMMAND_PALETTE: 'k',
  MISSION_CONTROL: 'm',
  SNAPSHOT: 's',
  PAUSE_RESUME: ' ',
  ESCAPE: 'Escape',
  ARROW_LEFT: 'ArrowLeft',
  ARROW_RIGHT: 'ArrowRight',
  ARROW_UP: 'ArrowUp',
  ARROW_DOWN: 'ArrowDown',
  HOME: 'Home',
  END: 'End',
} as const;

// Planet navigation order
export const PLANET_ORDER = [
  'Mercury',
  'Venus',
  'Earth',
  'Mars',
  'Jupiter',
  'Saturn',
  'Uranus',
  'Neptune',
] as const;

// Hook for keyboard planet navigation
export function useKeyboardPlanetNavigation() {
  const { selectedPlanet, setSelectedPlanet } = useOrbitStore((s) => ({
    selectedPlanet: s.selectedPlanet,
    setSelectedPlanet: s.setSelectedPlanet,
  }));

  const navigatePlanet = useCallback((direction: 'next' | 'prev' | 'first' | 'last') => {
    const currentIndex = selectedPlanet
      ? PLANET_ORDER.indexOf(selectedPlanet as typeof PLANET_ORDER[number])
      : -1;

    let newIndex: number;

    switch (direction) {
      case 'next':
        newIndex = currentIndex < PLANET_ORDER.length - 1 ? currentIndex + 1 : 0;
        break;
      case 'prev':
        newIndex = currentIndex > 0 ? currentIndex - 1 : PLANET_ORDER.length - 1;
        break;
      case 'first':
        newIndex = 0;
        break;
      case 'last':
        newIndex = PLANET_ORDER.length - 1;
        break;
    }

    const newPlanet = PLANET_ORDER[newIndex];
    setSelectedPlanet(newPlanet);
    announce(`Selected ${newPlanet}`);
  }, [selectedPlanet, setSelectedPlanet]);

  return { navigatePlanet };
}

// Hook for roving tabindex in planet list
export function useRovingTabIndex(
  items: string[],
  onSelect: (item: string) => void,
  containerRef: React.RefObject<HTMLElement | null>
) {
  const currentIndexRef = useRef(0);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    const container = containerRef.current;
    if (!container) return;

    const focusableItems = Array.from(
      container.querySelectorAll<HTMLElement>('[data-roving-item]')
    );

    if (focusableItems.length === 0) return;

    let newIndex = currentIndexRef.current;
    let handled = false;

    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowRight':
        newIndex = (currentIndexRef.current + 1) % focusableItems.length;
        handled = true;
        break;
      case 'ArrowUp':
      case 'ArrowLeft':
        newIndex = currentIndexRef.current > 0
          ? currentIndexRef.current - 1
          : focusableItems.length - 1;
        handled = true;
        break;
      case 'Home':
        newIndex = 0;
        handled = true;
        break;
      case 'End':
        newIndex = focusableItems.length - 1;
        handled = true;
        break;
      case 'Enter':
      case ' ':
        if (items[currentIndexRef.current]) {
          onSelect(items[currentIndexRef.current]);
        }
        handled = true;
        break;
    }

    if (handled) {
      event.preventDefault();
      currentIndexRef.current = newIndex;
      focusableItems[newIndex]?.focus();
    }
  }, [items, onSelect, containerRef]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('keydown', handleKeyDown);
    return () => container.removeEventListener('keydown', handleKeyDown);
  }, [containerRef, handleKeyDown]);

  return {
    getTabIndex: (index: number) => index === currentIndexRef.current ? 0 : -1,
    setCurrentIndex: (index: number) => { currentIndexRef.current = index; },
  };
}

// Generate accessible description for 3D scene
export function getSceneDescription(planets: Map<string, { name: string; distance: number }>) {
  const planetList = Array.from(planets.values())
    .sort((a, b) => a.distance - b.distance)
    .map(p => p.name)
    .join(', ');

  return `Interactive 3D solar system visualization showing the Sun and ${planets.size} planets: ${planetList}. Use keyboard shortcuts or mouse to navigate. Press question mark for help.`;
}

// Format planet data for screen readers
export function formatPlanetForScreenReader(planet: {
  name: string;
  distance: number;
  velocity: number;
  temperature: number;
  moons: number;
}) {
  return `${planet.name}. Distance from Sun: ${planet.distance.toFixed(2)} astronomical units. ` +
    `Orbital velocity: ${planet.velocity.toFixed(1)} kilometers per second. ` +
    `Surface temperature: ${planet.temperature} Kelvin. ` +
    `Number of moons: ${planet.moons}.`;
}
