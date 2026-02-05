/**
 * API Design Document for Orbit Command
 *
 * This module defines the API structure for potential server-side
 * astronomy calculations. Currently client-side only, but designed
 * for future scalability.
 */

// =============================================================================
// API Types
// =============================================================================

/**
 * Request to calculate planetary positions
 */
export interface CalculatePositionsRequest {
  /** ISO 8601 date string */
  date: string;
  /** List of planet names to calculate (optional, defaults to all) */
  planets?: string[];
  /** Include velocity calculations */
  includeVelocity?: boolean;
  /** Include extended orbital data */
  includeOrbitalData?: boolean;
}

/**
 * Single planet position response
 */
export interface PlanetPositionResponse {
  name: string;
  /** Position in AU [x, y, z] */
  positionAU: [number, number, number];
  /** Position in 3D units [x, y, z] */
  position3D: [number, number, number];
  /** Orbital velocity in km/s */
  velocity?: number;
  /** Distance from Sun in AU */
  distanceAU?: number;
  /** Orbital data */
  orbital?: {
    /** Semi-major axis in AU */
    semiMajorAxis: number;
    /** Eccentricity */
    eccentricity: number;
    /** Inclination in degrees */
    inclination: number;
    /** Orbital period in Earth days */
    period: number;
  };
}

/**
 * Response for position calculations
 */
export interface CalculatePositionsResponse {
  /** Request timestamp */
  requestedAt: string;
  /** Calculation date */
  date: string;
  /** Planet positions */
  planets: PlanetPositionResponse[];
  /** Calculation metadata */
  meta: {
    /** Calculation time in ms */
    calculationTimeMs: number;
    /** Cache hit */
    cached: boolean;
    /** API version */
    version: string;
  };
}

/**
 * Request for time range calculations (ephemeris)
 */
export interface EphemerisRequest {
  /** Planet name */
  planet: string;
  /** Start date ISO 8601 */
  startDate: string;
  /** End date ISO 8601 */
  endDate: string;
  /** Step size in hours */
  stepHours?: number;
  /** Maximum number of points */
  maxPoints?: number;
}

/**
 * Ephemeris response
 */
export interface EphemerisResponse {
  planet: string;
  startDate: string;
  endDate: string;
  stepHours: number;
  /** Array of positions over time */
  positions: Array<{
    date: string;
    position: [number, number, number];
    velocity?: number;
  }>;
  meta: {
    pointCount: number;
    calculationTimeMs: number;
    version: string;
  };
}

/**
 * Astronomical event (conjunction, opposition, etc.)
 */
export interface AstronomicalEvent {
  type: 'conjunction' | 'opposition' | 'elongation' | 'transit' | 'eclipse';
  date: string;
  planets: string[];
  description: string;
  visibility?: {
    bestLocation: string;
    duration?: string;
  };
}

/**
 * Request for astronomical events
 */
export interface EventsRequest {
  startDate: string;
  endDate: string;
  eventTypes?: AstronomicalEvent['type'][];
  planets?: string[];
}

/**
 * Events response
 */
export interface EventsResponse {
  startDate: string;
  endDate: string;
  events: AstronomicalEvent[];
  meta: {
    eventCount: number;
    version: string;
  };
}

// =============================================================================
// API Error Types
// =============================================================================

export interface APIError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  requestId?: string;
}

export const API_ERROR_CODES = {
  INVALID_DATE: 'INVALID_DATE',
  INVALID_PLANET: 'INVALID_PLANET',
  DATE_OUT_OF_RANGE: 'DATE_OUT_OF_RANGE',
  RATE_LIMITED: 'RATE_LIMITED',
  CALCULATION_ERROR: 'CALCULATION_ERROR',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const;

// =============================================================================
// API Endpoints Design
// =============================================================================

/**
 * API Endpoint Definitions
 *
 * Base URL: /api/v1/astronomy
 *
 * Endpoints:
 *
 * GET /positions
 *   Query params: date, planets (comma-separated), includeVelocity, includeOrbitalData
 *   Response: CalculatePositionsResponse
 *   Rate limit: 100 requests/minute
 *
 * POST /positions/batch
 *   Body: { dates: string[], planets?: string[] }
 *   Response: { results: CalculatePositionsResponse[] }
 *   Rate limit: 10 requests/minute
 *
 * GET /ephemeris/:planet
 *   Query params: startDate, endDate, stepHours, maxPoints
 *   Response: EphemerisResponse
 *   Rate limit: 20 requests/minute
 *
 * GET /events
 *   Query params: startDate, endDate, types (comma-separated), planets (comma-separated)
 *   Response: EventsResponse
 *   Rate limit: 50 requests/minute
 *
 * GET /health
 *   Response: { status: 'ok', version: string, uptime: number }
 *   No rate limit
 */

// =============================================================================
// Rate Limiting Configuration
// =============================================================================

export const RATE_LIMITS = {
  positions: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 100,
  },
  positionsBatch: {
    windowMs: 60 * 1000,
    maxRequests: 10,
  },
  ephemeris: {
    windowMs: 60 * 1000,
    maxRequests: 20,
  },
  events: {
    windowMs: 60 * 1000,
    maxRequests: 50,
  },
} as const;

// =============================================================================
// Caching Strategy
// =============================================================================

export const CACHE_CONFIG = {
  /** Position cache TTL in seconds */
  positionsTTL: 60,
  /** Ephemeris cache TTL in seconds */
  ephemerisTTL: 3600,
  /** Events cache TTL in seconds */
  eventsTTL: 86400,
  /** Maximum cache size in MB */
  maxCacheSizeMB: 100,
  /** Cache key prefix */
  keyPrefix: 'orbit-cmd:',
} as const;

/**
 * Generate cache key for position request
 */
export function generatePositionCacheKey(date: string, planets: string[]): string {
  const sortedPlanets = [...planets].sort().join(',');
  return `${CACHE_CONFIG.keyPrefix}pos:${date}:${sortedPlanets}`;
}

/**
 * Generate cache key for ephemeris request
 */
export function generateEphemerisCacheKey(
  planet: string,
  startDate: string,
  endDate: string,
  stepHours: number
): string {
  return `${CACHE_CONFIG.keyPrefix}eph:${planet}:${startDate}:${endDate}:${stepHours}`;
}

// =============================================================================
// API Client (for future use)
// =============================================================================

export interface APIClientConfig {
  baseUrl: string;
  apiKey?: string;
  timeout?: number;
  retries?: number;
}

/**
 * API Client class for server communication
 * Currently a placeholder for future implementation
 */
export class OrbitAPIClient {
  private config: Required<APIClientConfig>;

  constructor(config: APIClientConfig) {
    this.config = {
      baseUrl: config.baseUrl,
      apiKey: config.apiKey ?? '',
      timeout: config.timeout ?? 10000,
      retries: config.retries ?? 3,
    };
  }

  async getPositions(request: CalculatePositionsRequest): Promise<CalculatePositionsResponse> {
    // Placeholder - would make actual HTTP request
    throw new Error('API client not implemented - using client-side calculations');
  }

  async getEphemeris(request: EphemerisRequest): Promise<EphemerisResponse> {
    throw new Error('API client not implemented - using client-side calculations');
  }

  async getEvents(request: EventsRequest): Promise<EventsResponse> {
    throw new Error('API client not implemented - using client-side calculations');
  }
}

// =============================================================================
// Feature Flags
// =============================================================================

export const FEATURE_FLAGS = {
  /** Use server-side calculations instead of client-side */
  useServerCalculations: false,
  /** Enable ephemeris endpoint */
  enableEphemeris: false,
  /** Enable events endpoint */
  enableEvents: false,
  /** Enable batch position requests */
  enableBatchPositions: false,
  /** Enable detailed orbital data */
  enableOrbitalData: false,
} as const;

/**
 * Check if a feature is enabled
 */
export function isFeatureEnabled(flag: keyof typeof FEATURE_FLAGS): boolean {
  // In production, this would check environment variables or remote config
  return FEATURE_FLAGS[flag];
}
