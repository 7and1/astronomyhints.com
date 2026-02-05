import { create } from 'zustand';
import * as Astronomy from 'astronomy-engine';
import {
  calculatePlanetPositionCached,
  calculateOrbitalVelocityCached,
  clearAstronomyCaches,
  getCacheStats,
} from './astronomy-cache';
import {
  OrbitError,
  CalculationError,
  reportError,
  FALLBACK_VALUES,
} from './errors';
import {
  calculationLogger,
  stateLogger,
  measureTime,
  recordMetric,
  CalculationMetrics,
} from './logger';
import {
  validateDate,
  validateTimeSpeed,
  validateRenderQuality,
  isValidBody,
} from './validation';

export type RenderQuality = 'high' | 'balanced' | 'low';

export interface PlanetData {
  name: string;
  position: [number, number, number];
  radius: number;
  color: string;
  texture?: string;
  distance: number; // AU from Sun
  velocity: number; // km/s
  temperature: number; // Kelvin
  mass: number; // Earth masses
  moons: number;
}

interface OrbitState {
  selectedPlanet: string | null;
  timeSpeed: number; // 1 = real-time, 365 = 1 year per second
  currentDate: Date;
  cameraMode: 'overview' | 'focused' | 'cinematic';
  showOrbits: boolean;
  showLabels: boolean;
  cinematicPlaying: boolean;
  renderQuality: RenderQuality;
  planets: Map<string, PlanetData>;
  lastError: OrbitError | null;
  isCalculating: boolean;

  setSelectedPlanet: (planet: string | null) => void;
  setTimeSpeed: (speed: number) => void;
  setCurrentDate: (date: Date) => void;
  setCameraMode: (mode: 'overview' | 'focused' | 'cinematic') => void;
  setRenderQuality: (quality: RenderQuality) => void;
  toggleOrbits: () => void;
  toggleLabels: () => void;
  toggleCinematic: () => void;
  updatePlanetPositions: () => void;
  clearError: () => void;
  jumpToDate: (date: Date) => void;
}

// Planet configuration with static data - frozen for immutability
const PLANET_CONFIG = Object.freeze({
  Mercury: { radius: 0.383, color: '#8C7853', distance: 0.39, mass: 0.055, moons: 0, temp: 440 },
  Venus: { radius: 0.949, color: '#FFC649', distance: 0.72, mass: 0.815, moons: 0, temp: 737 },
  Earth: { radius: 1.0, color: '#4A90E2', distance: 1.0, mass: 1.0, moons: 1, temp: 288 },
  Mars: { radius: 0.532, color: '#E27B58', distance: 1.52, mass: 0.107, moons: 2, temp: 210 },
  Jupiter: { radius: 11.21, color: '#C88B3A', distance: 5.2, mass: 317.8, moons: 95, temp: 165 },
  Saturn: { radius: 9.45, color: '#FAD5A5', distance: 9.54, mass: 95.2, moons: 146, temp: 134 },
  Uranus: { radius: 4.01, color: '#4FD0E7', distance: 19.19, mass: 14.5, moons: 28, temp: 76 },
  Neptune: { radius: 3.88, color: '#4166F5', distance: 30.07, mass: 17.1, moons: 16, temp: 72 },
} as const);

// Pre-computed planet names array for iteration (avoids Object.keys on each update)
const PLANET_NAMES = Object.keys(PLANET_CONFIG) as (keyof typeof PLANET_CONFIG)[];

// Memoized initial render quality detection
let cachedInitialQuality: RenderQuality | null = null;

function getInitialRenderQuality(): RenderQuality {
  if (cachedInitialQuality !== null) return cachedInitialQuality;
  if (typeof window === 'undefined') return 'balanced';

  try {
    const stored = window.localStorage.getItem('orbit-command:quality');
    if (stored === 'high' || stored === 'balanced' || stored === 'low') {
      cachedInitialQuality = stored;
      return stored;
    }
  } catch {
    // Storage access failed, continue with detection
  }

  const prefersReduced =
    window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false;
  if (prefersReduced) {
    cachedInitialQuality = 'low';
    return 'low';
  }

  const dpr = window.devicePixelRatio ?? 1;
  const cores = typeof navigator !== 'undefined' ? navigator.hardwareConcurrency ?? 4 : 4;

  if (cores <= 4) {
    cachedInitialQuality = 'balanced';
    return 'balanced';
  }
  if (dpr >= 2.5) {
    cachedInitialQuality = 'balanced';
    return 'balanced';
  }

  cachedInitialQuality = 'high';
  return 'high';
}

/**
 * Calculate position for a single planet with error handling
 */
function safeCalculatePosition(
  body: Astronomy.Body,
  date: Date
): [number, number, number] {
  try {
    return calculatePlanetPositionCached(body, date);
  } catch (error) {
    const calcError = new CalculationError(
      `Failed to calculate position for ${body}`,
      { body, date, cause: error as Error }
    );
    reportError(calcError);
    calculationLogger.error(`Position calculation failed for ${body}`, {
      error: (error as Error).message,
      date: date.toISOString(),
    });
    return FALLBACK_VALUES.position;
  }
}

/**
 * Calculate velocity for a single planet with error handling
 */
function safeCalculateVelocity(body: Astronomy.Body, date: Date): number {
  try {
    return calculateOrbitalVelocityCached(body, date);
  } catch (error) {
    const calcError = new CalculationError(
      `Failed to calculate velocity for ${body}`,
      { body, date, cause: error as Error }
    );
    reportError(calcError);
    calculationLogger.error(`Velocity calculation failed for ${body}`, {
      error: (error as Error).message,
      date: date.toISOString(),
    });
    return FALLBACK_VALUES.velocity;
  }
}

/**
 * Batch update all planet positions - optimized with caching
 */
function calculateAllPlanets(date: Date): Map<string, PlanetData> {
  const planets = new Map<string, PlanetData>();

  // Use for loop instead of forEach for better performance in hot path
  for (let i = 0; i < PLANET_NAMES.length; i++) {
    const name = PLANET_NAMES[i];
    const config = PLANET_CONFIG[name];

    if (!isValidBody(name)) continue;

    const position = safeCalculatePosition(name, date);
    const velocity = safeCalculateVelocity(name, date);

    planets.set(name, {
      name,
      position,
      radius: config.radius,
      color: config.color,
      distance: config.distance,
      velocity,
      temperature: config.temp,
      mass: config.mass,
      moons: config.moons,
    });
  }

  return planets;
}

export const useOrbitStore = create<OrbitState>((set, get) => ({
  selectedPlanet: null,
  timeSpeed: 1,
  currentDate: new Date(),
  cameraMode: 'overview',
  showOrbits: true,
  showLabels: true,
  cinematicPlaying: false,
  renderQuality: getInitialRenderQuality(),
  planets: new Map(),
  lastError: null,
  isCalculating: false,

  setSelectedPlanet: (planet) => {
    stateLogger.debug('Setting selected planet', { planet });
    set({
      selectedPlanet: planet,
      cameraMode: planet ? 'focused' : 'overview',
      cinematicPlaying: false,
    });
  },

  setTimeSpeed: (speed) => {
    try {
      const validSpeed = validateTimeSpeed(speed);
      stateLogger.debug('Setting time speed', { speed: validSpeed });
      set({ timeSpeed: validSpeed });
    } catch (error) {
      reportError(error as OrbitError);
      // Keep current speed on validation failure
    }
  },

  setCurrentDate: (date) => {
    try {
      const validDate = validateDate(date);
      set({ currentDate: validDate });
    } catch (error) {
      reportError(error as OrbitError);
      // Keep current date on validation failure
    }
  },

  setCameraMode: (mode) => {
    stateLogger.debug('Setting camera mode', { mode });
    set({ cameraMode: mode });
  },

  setRenderQuality: (quality) => {
    try {
      const validQuality = validateRenderQuality(quality);
      stateLogger.info('Setting render quality', { quality: validQuality });
      set({ renderQuality: validQuality });

      if (typeof window !== 'undefined') {
        try {
          window.localStorage.setItem('orbit-command:quality', validQuality);
        } catch {
          // Storage write failed, continue without persistence
        }
      }
    } catch (error) {
      reportError(error as OrbitError);
    }
  },

  toggleOrbits: () => set((state) => ({ showOrbits: !state.showOrbits })),
  toggleLabels: () => set((state) => ({ showLabels: !state.showLabels })),

  toggleCinematic: () =>
    set((state) => ({
      cinematicPlaying: !state.cinematicPlaying,
      cameraMode: !state.cinematicPlaying ? 'cinematic' : 'overview',
      selectedPlanet: !state.cinematicPlaying ? null : state.selectedPlanet,
    })),

  updatePlanetPositions: () => {
    const { currentDate, isCalculating } = get();

    // Prevent concurrent calculations
    if (isCalculating) {
      calculationLogger.debug('Skipping update - calculation in progress');
      return;
    }

    set({ isCalculating: true });

    try {
      const planets = measureTime(CalculationMetrics.batchUpdate, () =>
        calculateAllPlanets(currentDate)
      );

      // Record cache stats for monitoring
      const cacheStats = getCacheStats();
      recordMetric('cache.position_size', cacheStats.positionCacheSize);
      recordMetric('cache.velocity_size', cacheStats.velocityCacheSize);

      set({ planets, isCalculating: false, lastError: null });
    } catch (error) {
      const orbitError =
        error instanceof OrbitError
          ? error
          : new CalculationError('Failed to update planet positions', {
              cause: error as Error,
            });

      reportError(orbitError);
      set({ isCalculating: false, lastError: orbitError });
    }
  },

  clearError: () => set({ lastError: null }),

  jumpToDate: (date: Date) => {
    try {
      const validDate = validateDate(date);
      stateLogger.info('Jumping to date', { date: validDate.toISOString() });

      // Clear caches when jumping to a significantly different time
      clearAstronomyCaches();

      set({ currentDate: validDate });
      get().updatePlanetPositions();
    } catch (error) {
      reportError(error as OrbitError);
    }
  },
}));

// Export planet config for external use
export { PLANET_CONFIG, PLANET_NAMES };

// Export cache utilities for debugging
export { getCacheStats, clearAstronomyCaches };
