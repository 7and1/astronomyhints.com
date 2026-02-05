/**
 * Input Validation Utilities
 *
 * Provides type-safe validation for all inputs to the astronomy system.
 */

import * as Astronomy from 'astronomy-engine';
import { ValidationError } from './errors';
import { PLANET_ORDER, type PlanetName } from './planets';

// Valid astronomy bodies for our solar system simulation
// Use type assertion since astronomy-engine Body type is a branded string
export const VALID_BODIES = [
  'Mercury',
  'Venus',
  'Earth',
  'Mars',
  'Jupiter',
  'Saturn',
  'Uranus',
  'Neptune',
] as const;

type ValidBody = (typeof VALID_BODIES)[number];

const validBodiesSet = new Set<string>(VALID_BODIES);

/**
 * Check if a string is a valid astronomy body
 */
export function isValidBody(body: string): body is Astronomy.Body {
  return validBodiesSet.has(body);
}

/**
 * Validate and return a body, or throw ValidationError
 */
export function validateBody(body: string): Astronomy.Body {
  if (!isValidBody(body)) {
    throw new ValidationError(`Invalid celestial body: ${body}`, {
      field: 'body',
      value: body,
      context: { validBodies: VALID_BODIES },
    });
  }
  return body;
}

/**
 * Validate a date for astronomy calculations
 * astronomy-engine supports dates from year -9999 to 9999
 */
export function validateDate(date: Date): Date {
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    throw new ValidationError('Invalid date object', {
      field: 'date',
      value: date,
    });
  }

  const year = date.getFullYear();
  if (year < -9999 || year > 9999) {
    throw new ValidationError(`Date year ${year} is out of supported range (-9999 to 9999)`, {
      field: 'date',
      value: date,
      context: { year, minYear: -9999, maxYear: 9999 },
    });
  }

  return date;
}

/**
 * Validate time speed multiplier
 */
export function validateTimeSpeed(speed: number): number {
  if (typeof speed !== 'number' || !isFinite(speed)) {
    throw new ValidationError('Time speed must be a finite number', {
      field: 'timeSpeed',
      value: speed,
    });
  }

  const MIN_SPEED = 0;
  const MAX_SPEED = 365 * 100; // 100 years per second max

  if (speed < MIN_SPEED || speed > MAX_SPEED) {
    throw new ValidationError(`Time speed ${speed} is out of range (${MIN_SPEED} to ${MAX_SPEED})`, {
      field: 'timeSpeed',
      value: speed,
      context: { min: MIN_SPEED, max: MAX_SPEED },
    });
  }

  return speed;
}

/**
 * Validate position array
 */
export function validatePosition(position: unknown): [number, number, number] {
  if (!Array.isArray(position) || position.length !== 3) {
    throw new ValidationError('Position must be an array of 3 numbers', {
      field: 'position',
      value: position,
    });
  }

  const [x, y, z] = position;
  if (typeof x !== 'number' || typeof y !== 'number' || typeof z !== 'number') {
    throw new ValidationError('Position coordinates must be numbers', {
      field: 'position',
      value: position,
    });
  }

  if (!isFinite(x) || !isFinite(y) || !isFinite(z)) {
    throw new ValidationError('Position coordinates must be finite', {
      field: 'position',
      value: position,
    });
  }

  return [x, y, z];
}

/**
 * Validate render quality setting
 */
export function validateRenderQuality(quality: string): 'high' | 'balanced' | 'low' {
  if (quality !== 'high' && quality !== 'balanced' && quality !== 'low') {
    throw new ValidationError(`Invalid render quality: ${quality}`, {
      field: 'renderQuality',
      value: quality,
      context: { validValues: ['high', 'balanced', 'low'] },
    });
  }
  return quality;
}

/**
 * Validate planet name
 */
export function validatePlanetName(name: string): PlanetName {
  if (!PLANET_ORDER.includes(name as PlanetName)) {
    throw new ValidationError(`Invalid planet name: ${name}`, {
      field: 'planetName',
      value: name,
      context: { validPlanets: PLANET_ORDER },
    });
  }
  return name as PlanetName;
}

/**
 * Validate numeric range
 */
export function validateRange(
  value: number,
  min: number,
  max: number,
  fieldName: string
): number {
  if (typeof value !== 'number' || !isFinite(value)) {
    throw new ValidationError(`${fieldName} must be a finite number`, {
      field: fieldName,
      value,
    });
  }

  if (value < min || value > max) {
    throw new ValidationError(`${fieldName} must be between ${min} and ${max}`, {
      field: fieldName,
      value,
      context: { min, max },
    });
  }

  return value;
}

/**
 * Validate positive number
 */
export function validatePositive(value: number, fieldName: string): number {
  if (typeof value !== 'number' || !isFinite(value) || value <= 0) {
    throw new ValidationError(`${fieldName} must be a positive number`, {
      field: fieldName,
      value,
    });
  }
  return value;
}

/**
 * Validate non-negative number
 */
export function validateNonNegative(value: number, fieldName: string): number {
  if (typeof value !== 'number' || !isFinite(value) || value < 0) {
    throw new ValidationError(`${fieldName} must be a non-negative number`, {
      field: fieldName,
      value,
    });
  }
  return value;
}

/**
 * Safe parse integer with validation
 */
export function safeParseInt(value: string, fieldName: string): number {
  const parsed = parseInt(value, 10);
  if (isNaN(parsed)) {
    throw new ValidationError(`${fieldName} must be a valid integer`, {
      field: fieldName,
      value,
    });
  }
  return parsed;
}

/**
 * Safe parse float with validation
 */
export function safeParseFloat(value: string, fieldName: string): number {
  const parsed = parseFloat(value);
  if (isNaN(parsed) || !isFinite(parsed)) {
    throw new ValidationError(`${fieldName} must be a valid number`, {
      field: fieldName,
      value,
    });
  }
  return parsed;
}

/**
 * Type guard for checking if value is defined
 */
export function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

/**
 * Assert value is defined, throw if not
 */
export function assertDefined<T>(
  value: T | null | undefined,
  fieldName: string
): T {
  if (!isDefined(value)) {
    throw new ValidationError(`${fieldName} is required`, {
      field: fieldName,
      value,
    });
  }
  return value;
}
