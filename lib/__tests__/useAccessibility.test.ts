/**
 * useAccessibility Hook Tests
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import {
  announce,
  usePrefersReducedMotion,
  usePrefersHighContrast,
  KEYBOARD_SHORTCUTS,
  PLANET_ORDER,
  getSceneDescription,
  formatPlanetForScreenReader,
} from '../useAccessibility';

// Mock the store
vi.mock('../store', () => ({
  useOrbitStore: vi.fn((selector) => {
    const state = {
      selectedPlanet: 'Earth',
      setSelectedPlanet: vi.fn(),
    };
    return selector(state);
  }),
}));

describe('useAccessibility', () => {
  beforeEach(() => {
    // Clean up any announcer elements
    document.querySelectorAll('[role="status"]').forEach(el => el.remove());
  });

  afterEach(() => {
    vi.restoreAllMocks();
    document.querySelectorAll('[role="status"]').forEach(el => el.remove());
  });

  describe('announce', () => {
    it('should create announcer element on first call', () => {
      announce('Test announcement');

      // Wait for requestAnimationFrame
      return new Promise<void>((resolve) => {
        requestAnimationFrame(() => {
          const announcer = document.querySelector('[role="status"]');
          expect(announcer).not.toBeNull();
          resolve();
        });
      });
    });

    it('should not throw when called', () => {
      expect(() => announce('Test')).not.toThrow();
      expect(() => announce('Urgent', 'assertive')).not.toThrow();
    });
  });

  describe('usePrefersReducedMotion', () => {
    it('should return false when no preference', () => {
      vi.spyOn(window, 'matchMedia').mockReturnValue({
        matches: false,
        media: '(prefers-reduced-motion: reduce)',
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      });

      const { result } = renderHook(() => usePrefersReducedMotion());
      expect(result.current).toBe(false);
    });

    it('should return true when reduced motion preferred', () => {
      vi.spyOn(window, 'matchMedia').mockReturnValue({
        matches: true,
        media: '(prefers-reduced-motion: reduce)',
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      });

      const { result } = renderHook(() => usePrefersReducedMotion());
      expect(result.current).toBe(true);
    });
  });

  describe('usePrefersHighContrast', () => {
    it('should return false when no preference', () => {
      vi.spyOn(window, 'matchMedia').mockReturnValue({
        matches: false,
        media: '(prefers-contrast: more)',
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      });

      const { result } = renderHook(() => usePrefersHighContrast());
      expect(result.current).toBe(false);
    });

    it('should return true when high contrast preferred', () => {
      vi.spyOn(window, 'matchMedia').mockReturnValue({
        matches: true,
        media: '(prefers-contrast: more)',
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      });

      const { result } = renderHook(() => usePrefersHighContrast());
      expect(result.current).toBe(true);
    });
  });

  describe('KEYBOARD_SHORTCUTS', () => {
    it('should have help shortcut', () => {
      expect(KEYBOARD_SHORTCUTS.HELP).toBe('?');
    });

    it('should have toggle orbits shortcut', () => {
      expect(KEYBOARD_SHORTCUTS.TOGGLE_ORBITS).toBe('o');
    });

    it('should have toggle labels shortcut', () => {
      expect(KEYBOARD_SHORTCUTS.TOGGLE_LABELS).toBe('l');
    });

    it('should have cinematic mode shortcut', () => {
      expect(KEYBOARD_SHORTCUTS.CINEMATIC_MODE).toBe('c');
    });

    it('should have command palette shortcut', () => {
      expect(KEYBOARD_SHORTCUTS.COMMAND_PALETTE).toBe('k');
    });

    it('should have mission control shortcut', () => {
      expect(KEYBOARD_SHORTCUTS.MISSION_CONTROL).toBe('m');
    });

    it('should have snapshot shortcut', () => {
      expect(KEYBOARD_SHORTCUTS.SNAPSHOT).toBe('s');
    });

    it('should have pause/resume shortcut', () => {
      expect(KEYBOARD_SHORTCUTS.PAUSE_RESUME).toBe(' ');
    });

    it('should have escape shortcut', () => {
      expect(KEYBOARD_SHORTCUTS.ESCAPE).toBe('Escape');
    });

    it('should have arrow key shortcuts', () => {
      expect(KEYBOARD_SHORTCUTS.ARROW_LEFT).toBe('ArrowLeft');
      expect(KEYBOARD_SHORTCUTS.ARROW_RIGHT).toBe('ArrowRight');
      expect(KEYBOARD_SHORTCUTS.ARROW_UP).toBe('ArrowUp');
      expect(KEYBOARD_SHORTCUTS.ARROW_DOWN).toBe('ArrowDown');
    });

    it('should have home/end shortcuts', () => {
      expect(KEYBOARD_SHORTCUTS.HOME).toBe('Home');
      expect(KEYBOARD_SHORTCUTS.END).toBe('End');
    });
  });

  describe('PLANET_ORDER', () => {
    it('should have 8 planets', () => {
      expect(PLANET_ORDER.length).toBe(8);
    });

    it('should be in correct order', () => {
      expect(PLANET_ORDER).toEqual([
        'Mercury',
        'Venus',
        'Earth',
        'Mars',
        'Jupiter',
        'Saturn',
        'Uranus',
        'Neptune',
      ]);
    });
  });

  describe('getSceneDescription', () => {
    it('should generate description for planets', () => {
      const planets = new Map([
        ['Mercury', { name: 'Mercury', distance: 0.39 }],
        ['Venus', { name: 'Venus', distance: 0.72 }],
        ['Earth', { name: 'Earth', distance: 1.0 }],
      ]);

      const description = getSceneDescription(planets);

      expect(description).toContain('Interactive 3D solar system');
      expect(description).toContain('3 planets');
      expect(description).toContain('Mercury');
      expect(description).toContain('Venus');
      expect(description).toContain('Earth');
    });

    it('should sort planets by distance', () => {
      const planets = new Map([
        ['Earth', { name: 'Earth', distance: 1.0 }],
        ['Mercury', { name: 'Mercury', distance: 0.39 }],
        ['Venus', { name: 'Venus', distance: 0.72 }],
      ]);

      const description = getSceneDescription(planets);

      // Mercury should come before Venus which should come before Earth
      const mercuryIndex = description.indexOf('Mercury');
      const venusIndex = description.indexOf('Venus');
      const earthIndex = description.indexOf('Earth');

      expect(mercuryIndex).toBeLessThan(venusIndex);
      expect(venusIndex).toBeLessThan(earthIndex);
    });

    it('should handle empty planet map', () => {
      const planets = new Map();
      const description = getSceneDescription(planets);

      expect(description).toContain('0 planets');
    });
  });

  describe('formatPlanetForScreenReader', () => {
    it('should format planet data for screen readers', () => {
      const planet = {
        name: 'Mars',
        distance: 1.52,
        velocity: 24.1,
        temperature: 210,
        moons: 2,
      };

      const formatted = formatPlanetForScreenReader(planet);

      expect(formatted).toContain('Mars');
      expect(formatted).toContain('1.52');
      expect(formatted).toContain('astronomical units');
      expect(formatted).toContain('24.1');
      expect(formatted).toContain('kilometers per second');
      expect(formatted).toContain('210');
      expect(formatted).toContain('Kelvin');
      expect(formatted).toContain('2');
    });

    it('should handle zero moons', () => {
      const planet = {
        name: 'Mercury',
        distance: 0.39,
        velocity: 47.4,
        temperature: 440,
        moons: 0,
      };

      const formatted = formatPlanetForScreenReader(planet);
      expect(formatted).toContain('0');
    });
  });
});
