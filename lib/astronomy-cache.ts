/**
 * Astronomy Calculation Cache
 *
 * Implements LRU caching for expensive astronomy calculations
 * to reduce redundant computations during animation frames.
 */

import * as Astronomy from 'astronomy-engine';

// Cache configuration
const POSITION_CACHE_SIZE = 1000;
const VELOCITY_CACHE_SIZE = 500;
const CACHE_TIME_TOLERANCE_MS = 50; // Positions within 50ms are considered equivalent

interface CacheEntry<T> {
  value: T;
  timestamp: number;
}

class LRUCache<K, V> {
  private cache: Map<K, CacheEntry<V>>;
  private readonly maxSize: number;

  constructor(maxSize: number) {
    this.cache = new Map();
    this.maxSize = maxSize;
  }

  get(key: K): V | undefined {
    const entry = this.cache.get(key);
    if (entry) {
      // Move to end (most recently used)
      this.cache.delete(key);
      this.cache.set(key, entry);
      return entry.value;
    }
    return undefined;
  }

  set(key: K, value: V): void {
    // Remove oldest entries if at capacity
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey !== undefined) {
        this.cache.delete(firstKey);
      }
    }
    this.cache.set(key, { value, timestamp: Date.now() });
  }

  clear(): void {
    this.cache.clear();
  }

  get size(): number {
    return this.cache.size;
  }
}

// Generate cache key from body and date
function generateCacheKey(body: string, dateMs: number, toleranceMs: number): string {
  // Round to tolerance to allow cache hits for nearby times
  const roundedMs = Math.round(dateMs / toleranceMs) * toleranceMs;
  return `${body}:${roundedMs}`;
}

// Position cache
const positionCache = new LRUCache<string, [number, number, number]>(POSITION_CACHE_SIZE);

// Velocity cache
const velocityCache = new LRUCache<string, number>(VELOCITY_CACHE_SIZE);

// Helio vector cache (raw astronomy-engine results)
const helioVectorCache = new LRUCache<string, Astronomy.Vector>(POSITION_CACHE_SIZE);

/**
 * Get cached heliocentric vector or compute and cache it
 */
export function getCachedHelioVector(body: Astronomy.Body, date: Date): Astronomy.Vector {
  const key = generateCacheKey(body, date.getTime(), CACHE_TIME_TOLERANCE_MS);

  let vector = helioVectorCache.get(key);
  if (!vector) {
    vector = Astronomy.HelioVector(body, date);
    helioVectorCache.set(key, vector);
  }

  return vector;
}

/**
 * Calculate planet position with caching
 * Returns [x, y, z] in 3D space units (1 AU = 10 units)
 */
export function calculatePlanetPositionCached(
  body: Astronomy.Body,
  date: Date
): [number, number, number] {
  const key = generateCacheKey(body, date.getTime(), CACHE_TIME_TOLERANCE_MS);

  let position = positionCache.get(key);
  if (!position) {
    const vector = getCachedHelioVector(body, date);
    const scale = 10;
    position = [
      vector.x * scale,
      vector.z * scale, // Y-up in Three.js
      -vector.y * scale
    ];
    positionCache.set(key, position);
  }

  return position;
}

/**
 * Calculate orbital velocity with caching
 * Returns velocity in km/s
 */
export function calculateOrbitalVelocityCached(
  body: Astronomy.Body,
  date: Date
): number {
  const key = generateCacheKey(body, date.getTime(), CACHE_TIME_TOLERANCE_MS);

  let velocity = velocityCache.get(key);
  if (!velocity) {
    const vector = getCachedHelioVector(body, date);
    const distance = Math.sqrt(vector.x ** 2 + vector.y ** 2 + vector.z ** 2);
    // Simplified orbital velocity: v = sqrt(GM/r)
    const GM = 1.327e20; // Sun's gravitational parameter (m^3/s^2)
    const AU_TO_METERS = 1.496e11;
    velocity = Math.sqrt(GM / (distance * AU_TO_METERS)) / 1000; // Convert to km/s
    velocityCache.set(key, velocity);
  }

  return velocity;
}

/**
 * Batch calculate positions for multiple bodies
 * More efficient than individual calls due to reduced overhead
 */
export function batchCalculatePositions(
  bodies: Astronomy.Body[],
  date: Date
): Map<string, [number, number, number]> {
  const results = new Map<string, [number, number, number]>();

  for (const body of bodies) {
    results.set(body, calculatePlanetPositionCached(body, date));
  }

  return results;
}

/**
 * Clear all caches - useful when jumping to a very different time
 */
export function clearAstronomyCaches(): void {
  positionCache.clear();
  velocityCache.clear();
  helioVectorCache.clear();
}

/**
 * Get cache statistics for monitoring
 */
export function getCacheStats(): {
  positionCacheSize: number;
  velocityCacheSize: number;
  helioVectorCacheSize: number;
} {
  return {
    positionCacheSize: positionCache.size,
    velocityCacheSize: velocityCache.size,
    helioVectorCacheSize: helioVectorCache.size,
  };
}

// Pre-computed constants for performance
export const ASTRONOMICAL_CONSTANTS = {
  AU_TO_METERS: 1.496e11,
  SUN_GM: 1.327e20, // m^3/s^2
  SCALE_FACTOR: 10, // 1 AU = 10 3D units
} as const;
