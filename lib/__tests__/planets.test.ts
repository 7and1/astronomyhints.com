/**
 * Planets Module Tests
 */

import { describe, it, expect } from 'vitest';
import { PLANET_ORDER, isPlanetName, type PlanetName } from '../planets';

describe('Planets Module', () => {
  describe('PLANET_ORDER', () => {
    it('should contain all 8 planets', () => {
      expect(PLANET_ORDER.length).toBe(8);
    });

    it('should be in correct order from Sun', () => {
      expect(PLANET_ORDER[0]).toBe('Mercury');
      expect(PLANET_ORDER[1]).toBe('Venus');
      expect(PLANET_ORDER[2]).toBe('Earth');
      expect(PLANET_ORDER[3]).toBe('Mars');
      expect(PLANET_ORDER[4]).toBe('Jupiter');
      expect(PLANET_ORDER[5]).toBe('Saturn');
      expect(PLANET_ORDER[6]).toBe('Uranus');
      expect(PLANET_ORDER[7]).toBe('Neptune');
    });

    it('should not include Pluto', () => {
      expect(PLANET_ORDER).not.toContain('Pluto');
    });

    it('should be an array', () => {
      expect(Array.isArray(PLANET_ORDER)).toBe(true);
    });
  });

  describe('isPlanetName', () => {
    it('should return true for valid planet names', () => {
      expect(isPlanetName('Mercury')).toBe(true);
      expect(isPlanetName('Venus')).toBe(true);
      expect(isPlanetName('Earth')).toBe(true);
      expect(isPlanetName('Mars')).toBe(true);
      expect(isPlanetName('Jupiter')).toBe(true);
      expect(isPlanetName('Saturn')).toBe(true);
      expect(isPlanetName('Uranus')).toBe(true);
      expect(isPlanetName('Neptune')).toBe(true);
    });

    it('should return false for invalid planet names', () => {
      expect(isPlanetName('Pluto')).toBe(false);
      expect(isPlanetName('Sun')).toBe(false);
      expect(isPlanetName('Moon')).toBe(false);
      expect(isPlanetName('Ceres')).toBe(false);
      expect(isPlanetName('Eris')).toBe(false);
    });

    it('should return false for lowercase planet names', () => {
      expect(isPlanetName('mercury')).toBe(false);
      expect(isPlanetName('earth')).toBe(false);
      expect(isPlanetName('mars')).toBe(false);
    });

    it('should return false for empty string', () => {
      expect(isPlanetName('')).toBe(false);
    });

    it('should return false for non-string values coerced to string', () => {
      expect(isPlanetName(String(null))).toBe(false);
      expect(isPlanetName(String(undefined))).toBe(false);
      expect(isPlanetName(String(123))).toBe(false);
    });

    it('should work as type guard', () => {
      const value: string = 'Mars';
      if (isPlanetName(value)) {
        // TypeScript should narrow type to PlanetName
        const planet: PlanetName = value;
        expect(planet).toBe('Mars');
      }
    });

    it('should handle strings with extra whitespace', () => {
      expect(isPlanetName(' Mars')).toBe(false);
      expect(isPlanetName('Mars ')).toBe(false);
      expect(isPlanetName(' Mars ')).toBe(false);
    });

    it('should handle mixed case', () => {
      expect(isPlanetName('MARS')).toBe(false);
      expect(isPlanetName('mars')).toBe(false);
      expect(isPlanetName('MaRs')).toBe(false);
    });
  });

  describe('PlanetName type', () => {
    it('should be a union of planet names', () => {
      // Type-level test - if this compiles, the type is correct
      const planets: PlanetName[] = [
        'Mercury',
        'Venus',
        'Earth',
        'Mars',
        'Jupiter',
        'Saturn',
        'Uranus',
        'Neptune',
      ];
      expect(planets.length).toBe(8);
    });
  });
});
