/**
 * OrbitShare Module Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { buildOrbitShareUrl } from '../orbitShare';

describe('OrbitShare Module', () => {
  describe('buildOrbitShareUrl', () => {
    const mockLocation = {
      pathname: '/',
      origin: 'https://astronomyhints.com',
    } as Location;

    it('should build URL with version parameter', () => {
      const state = {
        selectedPlanet: null,
        timeSpeed: 1,
        currentDate: new Date('2024-01-01T00:00:00Z'),
        showOrbits: true,
        showLabels: true,
        cinematicPlaying: false,
        renderQuality: 'balanced' as const,
      };

      const url = buildOrbitShareUrl(mockLocation, state);
      expect(url).toContain('v=1');
    });

    it('should include planet parameter when selected', () => {
      const state = {
        selectedPlanet: 'Mars',
        timeSpeed: 1,
        currentDate: new Date('2024-01-01T00:00:00Z'),
        showOrbits: true,
        showLabels: true,
        cinematicPlaying: false,
        renderQuality: 'balanced' as const,
      };

      const url = buildOrbitShareUrl(mockLocation, state);
      expect(url).toContain('planet=Mars');
    });

    it('should include speed parameter when not default', () => {
      const state = {
        selectedPlanet: null,
        timeSpeed: 10,
        currentDate: new Date('2024-01-01T00:00:00Z'),
        showOrbits: true,
        showLabels: true,
        cinematicPlaying: false,
        renderQuality: 'balanced' as const,
      };

      const url = buildOrbitShareUrl(mockLocation, state);
      expect(url).toContain('speed=10');
    });

    it('should not include speed parameter when default (1)', () => {
      const state = {
        selectedPlanet: null,
        timeSpeed: 1,
        currentDate: new Date('2024-01-01T00:00:00Z'),
        showOrbits: true,
        showLabels: true,
        cinematicPlaying: false,
        renderQuality: 'balanced' as const,
      };

      const url = buildOrbitShareUrl(mockLocation, state);
      expect(url).not.toContain('speed=');
    });

    it('should include quality parameter when not balanced', () => {
      const state = {
        selectedPlanet: null,
        timeSpeed: 1,
        currentDate: new Date('2024-01-01T00:00:00Z'),
        showOrbits: true,
        showLabels: true,
        cinematicPlaying: false,
        renderQuality: 'high' as const,
      };

      const url = buildOrbitShareUrl(mockLocation, state);
      expect(url).toContain('q=high');
    });

    it('should include orbits=0 when orbits hidden', () => {
      const state = {
        selectedPlanet: null,
        timeSpeed: 1,
        currentDate: new Date('2024-01-01T00:00:00Z'),
        showOrbits: false,
        showLabels: true,
        cinematicPlaying: false,
        renderQuality: 'balanced' as const,
      };

      const url = buildOrbitShareUrl(mockLocation, state);
      expect(url).toContain('o=0');
    });

    it('should include labels=0 when labels hidden', () => {
      const state = {
        selectedPlanet: null,
        timeSpeed: 1,
        currentDate: new Date('2024-01-01T00:00:00Z'),
        showOrbits: true,
        showLabels: false,
        cinematicPlaying: false,
        renderQuality: 'balanced' as const,
      };

      const url = buildOrbitShareUrl(mockLocation, state);
      expect(url).toContain('l=0');
    });

    it('should include cinematic parameter when playing without planet', () => {
      const state = {
        selectedPlanet: null,
        timeSpeed: 1,
        currentDate: new Date('2024-01-01T00:00:00Z'),
        showOrbits: true,
        showLabels: true,
        cinematicPlaying: true,
        renderQuality: 'balanced' as const,
      };

      const url = buildOrbitShareUrl(mockLocation, state);
      expect(url).toContain('cin=1');
    });

    it('should not include cinematic when planet is selected', () => {
      const state = {
        selectedPlanet: 'Earth',
        timeSpeed: 1,
        currentDate: new Date('2024-01-01T00:00:00Z'),
        showOrbits: true,
        showLabels: true,
        cinematicPlaying: true,
        renderQuality: 'balanced' as const,
      };

      const url = buildOrbitShareUrl(mockLocation, state);
      expect(url).not.toContain('cin=');
    });

    it('should include timestamp', () => {
      const date = new Date('2024-06-15T12:00:00Z');
      const state = {
        selectedPlanet: null,
        timeSpeed: 1,
        currentDate: date,
        showOrbits: true,
        showLabels: true,
        cinematicPlaying: false,
        renderQuality: 'balanced' as const,
      };

      const url = buildOrbitShareUrl(mockLocation, state);
      expect(url).toContain(`t=${date.getTime()}`);
    });

    it('should round speed to integer', () => {
      const state = {
        selectedPlanet: null,
        timeSpeed: 10.7,
        currentDate: new Date('2024-01-01T00:00:00Z'),
        showOrbits: true,
        showLabels: true,
        cinematicPlaying: false,
        renderQuality: 'balanced' as const,
      };

      const url = buildOrbitShareUrl(mockLocation, state);
      expect(url).toContain('speed=11');
    });

    it('should build complete URL with multiple parameters', () => {
      const state = {
        selectedPlanet: 'Jupiter',
        timeSpeed: 50,
        currentDate: new Date('2024-06-15T12:00:00Z'),
        showOrbits: false,
        showLabels: false,
        cinematicPlaying: false,
        renderQuality: 'high' as const,
      };

      const url = buildOrbitShareUrl(mockLocation, state);

      expect(url).toContain('planet=Jupiter');
      expect(url).toContain('speed=50');
      expect(url).toContain('q=high');
      expect(url).toContain('o=0');
      expect(url).toContain('l=0');
    });
  });
});
