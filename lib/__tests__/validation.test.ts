/**
 * Unit Tests for Validation Utilities
 *
 * Run with: npx vitest run lib/__tests__/validation.test.ts
 */

import { describe, it, expect } from 'vitest';
import {
  isValidBody,
  validateBody,
  validateDate,
  validateTimeSpeed,
  validatePosition,
  validateRenderQuality,
  validatePlanetName,
  validateRange,
  validatePositive,
  validateNonNegative,
  safeParseInt,
  safeParseFloat,
  isDefined,
  assertDefined,
  VALID_BODIES,
} from '../validation';
import { ValidationError } from '../errors';

describe('Validation Utilities', () => {
  describe('isValidBody', () => {
    it('should return true for valid planet names', () => {
      expect(isValidBody('Mercury')).toBe(true);
      expect(isValidBody('Venus')).toBe(true);
      expect(isValidBody('Earth')).toBe(true);
      expect(isValidBody('Mars')).toBe(true);
      expect(isValidBody('Jupiter')).toBe(true);
      expect(isValidBody('Saturn')).toBe(true);
      expect(isValidBody('Uranus')).toBe(true);
      expect(isValidBody('Neptune')).toBe(true);
    });

    it('should return false for invalid names', () => {
      expect(isValidBody('Pluto')).toBe(false);
      expect(isValidBody('Sun')).toBe(false);
      expect(isValidBody('Moon')).toBe(false);
      expect(isValidBody('')).toBe(false);
      expect(isValidBody('earth')).toBe(false); // Case sensitive
    });
  });

  describe('validateBody', () => {
    it('should return body for valid input', () => {
      expect(validateBody('Earth')).toBe('Earth');
      expect(validateBody('Mars')).toBe('Mars');
    });

    it('should throw ValidationError for invalid body', () => {
      expect(() => validateBody('Pluto')).toThrow(ValidationError);
      expect(() => validateBody('invalid')).toThrow(ValidationError);
    });

    it('should include valid bodies in error context', () => {
      try {
        validateBody('invalid');
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).context?.validBodies).toEqual(VALID_BODIES);
      }
    });
  });

  describe('validateDate', () => {
    it('should return valid dates', () => {
      const date = new Date('2024-01-01');
      expect(validateDate(date)).toBe(date);
    });

    it('should throw for invalid Date objects', () => {
      expect(() => validateDate(new Date('invalid'))).toThrow(ValidationError);
    });

    it('should throw for dates outside supported range', () => {
      expect(() => validateDate(new Date('12000-01-01'))).toThrow(ValidationError);
      expect(() => validateDate(new Date('-12000-01-01'))).toThrow(ValidationError);
    });

    it('should accept dates within supported range', () => {
      // Note: JavaScript Date parsing of negative years is inconsistent
      // Testing with dates that are clearly within range
      const pastDate = new Date('1000-01-01');
      const futureDate = new Date('5000-01-01');

      expect(validateDate(pastDate).getFullYear()).toBe(1000);
      expect(validateDate(futureDate).getFullYear()).toBe(5000);
    });
  });

  describe('validateTimeSpeed', () => {
    it('should accept valid time speeds', () => {
      expect(validateTimeSpeed(0)).toBe(0);
      expect(validateTimeSpeed(1)).toBe(1);
      expect(validateTimeSpeed(365)).toBe(365);
      expect(validateTimeSpeed(100)).toBe(100);
    });

    it('should throw for negative speeds', () => {
      expect(() => validateTimeSpeed(-1)).toThrow(ValidationError);
    });

    it('should throw for non-finite values', () => {
      expect(() => validateTimeSpeed(Infinity)).toThrow(ValidationError);
      expect(() => validateTimeSpeed(NaN)).toThrow(ValidationError);
    });

    it('should throw for speeds exceeding maximum', () => {
      expect(() => validateTimeSpeed(365 * 100 + 1)).toThrow(ValidationError);
    });
  });

  describe('validatePosition', () => {
    it('should accept valid position arrays', () => {
      const pos: [number, number, number] = [1, 2, 3];
      expect(validatePosition(pos)).toEqual([1, 2, 3]);
    });

    it('should accept zero positions', () => {
      expect(validatePosition([0, 0, 0])).toEqual([0, 0, 0]);
    });

    it('should accept negative positions', () => {
      expect(validatePosition([-1, -2, -3])).toEqual([-1, -2, -3]);
    });

    it('should throw for non-array input', () => {
      expect(() => validatePosition('invalid')).toThrow(ValidationError);
      expect(() => validatePosition(null)).toThrow(ValidationError);
      expect(() => validatePosition(undefined)).toThrow(ValidationError);
    });

    it('should throw for wrong array length', () => {
      expect(() => validatePosition([1, 2])).toThrow(ValidationError);
      expect(() => validatePosition([1, 2, 3, 4])).toThrow(ValidationError);
    });

    it('should throw for non-number elements', () => {
      expect(() => validatePosition([1, 'two', 3])).toThrow(ValidationError);
    });

    it('should throw for non-finite numbers', () => {
      expect(() => validatePosition([1, Infinity, 3])).toThrow(ValidationError);
      expect(() => validatePosition([NaN, 2, 3])).toThrow(ValidationError);
    });
  });

  describe('validateRenderQuality', () => {
    it('should accept valid quality settings', () => {
      expect(validateRenderQuality('high')).toBe('high');
      expect(validateRenderQuality('balanced')).toBe('balanced');
      expect(validateRenderQuality('low')).toBe('low');
    });

    it('should throw for invalid quality', () => {
      expect(() => validateRenderQuality('ultra')).toThrow(ValidationError);
      expect(() => validateRenderQuality('medium')).toThrow(ValidationError);
      expect(() => validateRenderQuality('')).toThrow(ValidationError);
    });
  });

  describe('validatePlanetName', () => {
    it('should accept valid planet names', () => {
      expect(validatePlanetName('Earth')).toBe('Earth');
      expect(validatePlanetName('Mars')).toBe('Mars');
    });

    it('should throw for invalid planet names', () => {
      expect(() => validatePlanetName('Pluto')).toThrow(ValidationError);
      expect(() => validatePlanetName('earth')).toThrow(ValidationError);
    });
  });

  describe('validateRange', () => {
    it('should accept values within range', () => {
      expect(validateRange(5, 0, 10, 'test')).toBe(5);
      expect(validateRange(0, 0, 10, 'test')).toBe(0);
      expect(validateRange(10, 0, 10, 'test')).toBe(10);
    });

    it('should throw for values outside range', () => {
      expect(() => validateRange(-1, 0, 10, 'test')).toThrow(ValidationError);
      expect(() => validateRange(11, 0, 10, 'test')).toThrow(ValidationError);
    });

    it('should throw for non-finite values', () => {
      expect(() => validateRange(NaN, 0, 10, 'test')).toThrow(ValidationError);
      expect(() => validateRange(Infinity, 0, 10, 'test')).toThrow(ValidationError);
    });
  });

  describe('validatePositive', () => {
    it('should accept positive numbers', () => {
      expect(validatePositive(1, 'test')).toBe(1);
      expect(validatePositive(0.001, 'test')).toBe(0.001);
      expect(validatePositive(1000000, 'test')).toBe(1000000);
    });

    it('should throw for zero', () => {
      expect(() => validatePositive(0, 'test')).toThrow(ValidationError);
    });

    it('should throw for negative numbers', () => {
      expect(() => validatePositive(-1, 'test')).toThrow(ValidationError);
    });
  });

  describe('validateNonNegative', () => {
    it('should accept non-negative numbers', () => {
      expect(validateNonNegative(0, 'test')).toBe(0);
      expect(validateNonNegative(1, 'test')).toBe(1);
    });

    it('should throw for negative numbers', () => {
      expect(() => validateNonNegative(-1, 'test')).toThrow(ValidationError);
      expect(() => validateNonNegative(-0.001, 'test')).toThrow(ValidationError);
    });
  });

  describe('safeParseInt', () => {
    it('should parse valid integers', () => {
      expect(safeParseInt('42', 'test')).toBe(42);
      expect(safeParseInt('-10', 'test')).toBe(-10);
      expect(safeParseInt('0', 'test')).toBe(0);
    });

    it('should throw for invalid integers', () => {
      expect(() => safeParseInt('abc', 'test')).toThrow(ValidationError);
      expect(() => safeParseInt('', 'test')).toThrow(ValidationError);
    });

    it('should truncate floats', () => {
      expect(safeParseInt('3.14', 'test')).toBe(3);
    });
  });

  describe('safeParseFloat', () => {
    it('should parse valid floats', () => {
      expect(safeParseFloat('3.14', 'test')).toBeCloseTo(3.14);
      expect(safeParseFloat('-2.5', 'test')).toBeCloseTo(-2.5);
      expect(safeParseFloat('42', 'test')).toBe(42);
    });

    it('should throw for invalid floats', () => {
      expect(() => safeParseFloat('abc', 'test')).toThrow(ValidationError);
      expect(() => safeParseFloat('', 'test')).toThrow(ValidationError);
    });

    it('should throw for Infinity', () => {
      expect(() => safeParseFloat('Infinity', 'test')).toThrow(ValidationError);
    });
  });

  describe('isDefined', () => {
    it('should return true for defined values', () => {
      expect(isDefined(0)).toBe(true);
      expect(isDefined('')).toBe(true);
      expect(isDefined(false)).toBe(true);
      expect(isDefined([])).toBe(true);
      expect(isDefined({})).toBe(true);
    });

    it('should return false for null and undefined', () => {
      expect(isDefined(null)).toBe(false);
      expect(isDefined(undefined)).toBe(false);
    });
  });

  describe('assertDefined', () => {
    it('should return value if defined', () => {
      expect(assertDefined(42, 'test')).toBe(42);
      expect(assertDefined('hello', 'test')).toBe('hello');
      expect(assertDefined(0, 'test')).toBe(0);
    });

    it('should throw for null', () => {
      expect(() => assertDefined(null, 'test')).toThrow(ValidationError);
    });

    it('should throw for undefined', () => {
      expect(() => assertDefined(undefined, 'test')).toThrow(ValidationError);
    });
  });
});
