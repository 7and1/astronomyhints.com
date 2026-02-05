/**
 * Orbit Command - Library Exports
 *
 * Central export point for all library modules.
 */

// Store and state management
export {
  useOrbitStore,
  type RenderQuality,
  type PlanetData,
  PLANET_CONFIG,
  PLANET_NAMES,
  getCacheStats,
  clearAstronomyCaches,
} from './store';

// Astronomy calculations with caching
export {
  calculatePlanetPositionCached,
  calculateOrbitalVelocityCached,
  getCachedHelioVector,
  batchCalculatePositions,
  ASTRONOMICAL_CONSTANTS,
} from './astronomy-cache';

// Error handling
export {
  OrbitError,
  CalculationError,
  StateError,
  ValidationError,
  reportError,
  registerErrorHandler,
  withErrorHandling,
  withRetry,
  getUserMessage,
  FALLBACK_VALUES,
  USER_MESSAGES,
  type ErrorSeverity,
  type ErrorCategory,
} from './errors';

// Logging and monitoring
export {
  createLogger,
  configureLogger,
  enableDebugMode,
  disableLogging,
  recordMetric,
  startTiming,
  endTiming,
  measureTime,
  incrementCounter,
  getLogEntries,
  getMetrics,
  getTimingStats,
  clearLogs,
  exportLogs,
  calculationLogger,
  stateLogger,
  renderLogger,
  performanceLogger,
  CalculationMetrics,
  type LogLevel,
  type MetricType,
} from './logger';

// Validation utilities
export {
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
} from './validation';

// Planet utilities
export {
  PLANET_ORDER,
  isPlanetName,
  type PlanetName,
} from './planets';

// Performance hooks
export {
  useRenderPerformance,
  useTimedCallback,
  useFrameRate,
  useMemoryMonitor,
  useTimedEffect,
  useDebugData,
  getPerformanceReport,
} from './usePerformance';

// API design (for future use)
export {
  type CalculatePositionsRequest,
  type CalculatePositionsResponse,
  type PlanetPositionResponse,
  type EphemerisRequest,
  type EphemerisResponse,
  type AstronomicalEvent,
  type EventsRequest,
  type EventsResponse,
  type APIError,
  API_ERROR_CODES,
  RATE_LIMITS,
  CACHE_CONFIG,
  FEATURE_FLAGS,
  isFeatureEnabled,
  generatePositionCacheKey,
  generateEphemerisCacheKey,
  OrbitAPIClient,
} from './api-design';

// Missions
export {
  generateOrbitMission,
  type OrbitMission,
} from './missions';

// URL sharing
export {
  buildOrbitShareUrl,
  applyOrbitShareStateFromUrl,
} from './orbitShare';
