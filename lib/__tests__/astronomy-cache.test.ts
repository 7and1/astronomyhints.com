/**
 * Unit Tests for Astronomy Calculations
 *
 * Tests for the astronomy-cache module and calculation accuracy.
 * Run with: npx vitest run lib/__tests__/astronomy-cache.test.ts
 */

import { describe, it, expect, beforeEach } from 'vitest';
import * as Astronomy from 'astronomy-engine';
import {
  calculatePlanetPositionCached,
  calculateOrbitalVelocityCached,
  getCachedHelioVector,
  clearAstronomyCaches,
  getCacheStats,
  batchCalculatePositions,
  ASTRONOMICAL_CONSTANTS,
} from '../astronomy-cache';

describe('Astronomy Cache', () => {
  beforeEach(() => {
    clearAstronomyCaches();
  });

  describe('calculatePlanetPositionCached', () => {
    it('should return valid position array for Earth', () => {
      const date = new Date('2024-01-01T00:00:00Z');
      const position = calculatePlanetPositionCached('Earth', date);

      expect(position).toHaveLength(3);
      expect(position[0]).toBeTypeOf('number');
      expect(position[1]).toBeTypeOf('number');
      expect(position[2]).toBeTypeOf('number');
      expect(Number.isFinite(position[0])).toBe(true);
      expect(Number.isFinite(position[1])).toBe(true);
      expect(Number.isFinite(position[2])).toBe(true);
    });

    it('should return positions within expected range for inner planets', () => {
      const date = new Date('2024-06-15T12:00:00Z');
      const scale = ASTRONOMICAL_CONSTANTS.SCALE_FACTOR;

      // Mercury: ~0.39 AU
      const mercury = calculatePlanetPositionCached('Mercury', date);
      const mercuryDist = Math.sqrt(mercury[0] ** 2 + mercury[1] ** 2 + mercury[2] ** 2);
      expect(mercuryDist).toBeGreaterThan(0.3 * scale);
      expect(mercuryDist).toBeLessThan(0.5 * scale);

      // Earth: ~1 AU
      const earth = calculatePlanetPositionCached('Earth', date);
      const earthDist = Math.sqrt(earth[0] ** 2 + earth[1] ** 2 + earth[2] ** 2);
      expect(earthDist).toBeGreaterThan(0.98 * scale);
      expect(earthDist).toBeLessThan(1.02 * scale);
    });

    it('should cache results for same time', () => {
      const date = new Date('2024-03-20T00:00:00Z');

      // First call
      calculatePlanetPositionCached('Mars', date);
      const stats1 = getCacheStats();

      // Second call with same date
      calculatePlanetPositionCached('Mars', date);
      const stats2 = getCacheStats();

      // Cache size should not increase significantly
      expect(stats2.positionCacheSize).toBe(stats1.positionCacheSize);
    });

    it('should return consistent results for same input', () => {
      const date = new Date('2024-07-04T00:00:00Z');

      const pos1 = calculatePlanetPositionCached('Jupiter', date);
      const pos2 = calculatePlanetPositionCached('Jupiter', date);

      expect(pos1[0]).toBe(pos2[0]);
      expect(pos1[1]).toBe(pos2[1]);
      expect(pos1[2]).toBe(pos2[2]);
    });
  });

  describe('calculateOrbitalVelocityCached', () => {
    it('should return valid velocity for planets', () => {
      const date = new Date('2024-01-01T00:00:00Z');

      const earthVelocity = calculateOrbitalVelocityCached('Earth', date);
      expect(earthVelocity).toBeTypeOf('number');
      expect(Number.isFinite(earthVelocity)).toBe(true);
      expect(earthVelocity).toBeGreaterThan(0);
    });

    it('should return higher velocity for inner planets', () => {
      const date = new Date('2024-01-01T00:00:00Z');

      const mercuryV = calculateOrbitalVelocityCached('Mercury', date);
      const earthV = calculateOrbitalVelocityCached('Earth', date);
      const neptuneV = calculateOrbitalVelocityCached('Neptune', date);

      // Mercury should be fastest, Neptune slowest
      expect(mercuryV).toBeGreaterThan(earthV);
      expect(earthV).toBeGreaterThan(neptuneV);
    });

    it('should return Earth velocity around 30 km/s', () => {
      const date = new Date('2024-01-01T00:00:00Z');
      const earthVelocity = calculateOrbitalVelocityCached('Earth', date);

      // Earth's orbital velocity is approximately 29.78 km/s
      expect(earthVelocity).toBeGreaterThan(28);
      expect(earthVelocity).toBeLessThan(32);
    });
  });

  describe('getCachedHelioVector', () => {
    it('should return valid heliocentric vector', () => {
      const date = new Date('2024-01-01T00:00:00Z');
      const vector = getCachedHelioVector('Earth', date);

      expect(vector).toHaveProperty('x');
      expect(vector).toHaveProperty('y');
      expect(vector).toHaveProperty('z');
      expect(vector).toHaveProperty('t');
    });

    it('should match direct astronomy-engine calculation', () => {
      const date = new Date('2024-06-21T00:00:00Z');

      const cached = getCachedHelioVector('Mars', date);
      const direct = Astronomy.HelioVector('Mars', date);

      expect(cached.x).toBeCloseTo(direct.x, 10);
      expect(cached.y).toBeCloseTo(direct.y, 10);
      expect(cached.z).toBeCloseTo(direct.z, 10);
    });
  });

  describe('batchCalculatePositions', () => {
    it('should calculate positions for multiple bodies', () => {
      const date = new Date('2024-01-01T00:00:00Z');
      const bodies: Astronomy.Body[] = ['Mercury', 'Venus', 'Earth', 'Mars'];

      const positions = batchCalculatePositions(bodies, date);

      expect(positions.size).toBe(4);
      expect(positions.has('Mercury')).toBe(true);
      expect(positions.has('Venus')).toBe(true);
      expect(positions.has('Earth')).toBe(true);
      expect(positions.has('Mars')).toBe(true);
    });

    it('should return valid positions for all bodies', () => {
      const date = new Date('2024-01-01T00:00:00Z');
      const bodies: Astronomy.Body[] = [
        'Mercury', 'Venus', 'Earth', 'Mars',
        'Jupiter', 'Saturn', 'Uranus', 'Neptune'
      ];

      const positions = batchCalculatePositions(bodies, date);

      positions.forEach((position, name) => {
        expect(position).toHaveLength(3);
        expect(Number.isFinite(position[0])).toBe(true);
        expect(Number.isFinite(position[1])).toBe(true);
        expect(Number.isFinite(position[2])).toBe(true);
      });
    });
  });

  describe('clearAstronomyCaches', () => {
    it('should clear all caches', () => {
      const date = new Date('2024-01-01T00:00:00Z');

      // Populate caches
      calculatePlanetPositionCached('Earth', date);
      calculateOrbitalVelocityCached('Earth', date);

      const statsBefore = getCacheStats();
      expect(statsBefore.positionCacheSize).toBeGreaterThan(0);

      // Clear caches
      clearAstronomyCaches();

      const statsAfter = getCacheStats();
      expect(statsAfter.positionCacheSize).toBe(0);
      expect(statsAfter.velocityCacheSize).toBe(0);
      expect(statsAfter.helioVectorCacheSize).toBe(0);
    });
  });

  describe('getCacheStats', () => {
    it('should return cache statistics', () => {
      const stats = getCacheStats();

      expect(stats).toHaveProperty('positionCacheSize');
      expect(stats).toHaveProperty('velocityCacheSize');
      expect(stats).toHaveProperty('helioVectorCacheSize');
      expect(stats.positionCacheSize).toBeTypeOf('number');
      expect(stats.velocityCacheSize).toBeTypeOf('number');
      expect(stats.helioVectorCacheSize).toBeTypeOf('number');
    });

    it('should track cache growth', () => {
      clearAstronomyCaches();

      const stats1 = getCacheStats();
      expect(stats1.positionCacheSize).toBe(0);

      // Add entries
      const date1 = new Date('2024-01-01T00:00:00Z');
      const date2 = new Date('2024-06-01T00:00:00Z');

      calculatePlanetPositionCached('Earth', date1);
      calculatePlanetPositionCached('Earth', date2);

      const stats2 = getCacheStats();
      expect(stats2.positionCacheSize).toBeGreaterThan(0);
    });
  });

  describe('ASTRONOMICAL_CONSTANTS', () => {
    it('should have correct AU to meters conversion', () => {
      expect(ASTRONOMICAL_CONSTANTS.AU_TO_METERS).toBe(1.496e11);
    });

    it('should have correct Sun gravitational parameter', () => {
      expect(ASTRONOMICAL_CONSTANTS.SUN_GM).toBe(1.327e20);
    });

    it('should have correct scale factor', () => {
      expect(ASTRONOMICAL_CONSTANTS.SCALE_FACTOR).toBe(10);
    });
  });
});

describe('Calculation Accuracy', () => {
  it('should calculate Earth position accurately for known date', () => {
    // Vernal equinox 2024 - Earth should be roughly at specific position
    const date = new Date('2024-03-20T03:06:00Z');
    const position = calculatePlanetPositionCached('Earth', date);

    // Distance from Sun should be approximately 1 AU (10 units in our scale)
    const distance = Math.sqrt(position[0] ** 2 + position[1] ** 2 + position[2] ** 2);
    expect(distance).toBeCloseTo(10, 0); // Within 1 unit of 10
  });

  it('should show planetary motion over time', () => {
    const date1 = new Date('2024-01-01T00:00:00Z');
    const date2 = new Date('2024-01-02T00:00:00Z');

    const pos1 = calculatePlanetPositionCached('Earth', date1);
    const pos2 = calculatePlanetPositionCached('Earth', date2);

    // Position should change over 1 day
    const moved = (
      pos1[0] !== pos2[0] ||
      pos1[1] !== pos2[1] ||
      pos1[2] !== pos2[2]
    );
    expect(moved).toBe(true);
  });

  it('should maintain orbital mechanics relationships', () => {
    const date = new Date('2024-06-01T00:00:00Z');

    // Get distances from Sun
    const planets = ['Mercury', 'Venus', 'Earth', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune'] as const;
    const distances = planets.map(planet => {
      const pos = calculatePlanetPositionCached(planet, date);
      return Math.sqrt(pos[0] ** 2 + pos[1] ** 2 + pos[2] ** 2);
    });

    // Verify general ordering (inner to outer)
    // Note: Due to elliptical orbits, exact ordering may vary slightly
    expect(distances[0]).toBeLessThan(distances[4]); // Mercury < Jupiter
    expect(distances[2]).toBeLessThan(distances[5]); // Earth < Saturn
    expect(distances[4]).toBeLessThan(distances[7]); // Jupiter < Neptune
  });
});
