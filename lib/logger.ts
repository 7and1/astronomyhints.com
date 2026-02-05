/**
 * Logging and Performance Monitoring System
 *
 * Provides structured logging, performance metrics collection,
 * and debug mode for development.
 */

// Log levels
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

// Log entry structure
interface LogEntry {
  level: LogLevel;
  category: string;
  message: string;
  timestamp: Date;
  data?: Record<string, unknown>;
}

// Performance metric types
export type MetricType = 'timing' | 'counter' | 'gauge';

interface PerformanceMetric {
  name: string;
  type: MetricType;
  value: number;
  timestamp: Date;
  tags?: Record<string, string>;
}

// Configuration
interface LoggerConfig {
  enabled: boolean;
  minLevel: LogLevel;
  maxEntries: number;
  persistToStorage: boolean;
}

const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

// Default configuration
const defaultConfig: LoggerConfig = {
  enabled: process.env.NODE_ENV === 'development',
  minLevel: 'info',
  maxEntries: 1000,
  persistToStorage: false,
};

// State
let config: LoggerConfig = { ...defaultConfig };
const logBuffer: LogEntry[] = [];
const metricsBuffer: PerformanceMetric[] = [];
const timingStarts: Map<string, number> = new Map();

/**
 * Configure the logger
 */
export function configureLogger(newConfig: Partial<LoggerConfig>): void {
  config = { ...config, ...newConfig };
}

/**
 * Enable debug mode
 */
export function enableDebugMode(): void {
  config.enabled = true;
  config.minLevel = 'debug';
  console.info('[Logger] Debug mode enabled');
}

/**
 * Disable logging
 */
export function disableLogging(): void {
  config.enabled = false;
}

/**
 * Check if a log level should be recorded
 */
function shouldLog(level: LogLevel): boolean {
  if (!config.enabled) return false;
  return LOG_LEVEL_PRIORITY[level] >= LOG_LEVEL_PRIORITY[config.minLevel];
}

/**
 * Add a log entry
 */
function addLogEntry(entry: LogEntry): void {
  if (logBuffer.length >= config.maxEntries) {
    logBuffer.shift();
  }
  logBuffer.push(entry);

  // Console output in development
  if (process.env.NODE_ENV === 'development') {
    const prefix = `[${entry.category}]`;
    const consoleMethod = entry.level === 'error' ? 'error'
      : entry.level === 'warn' ? 'warn'
      : entry.level === 'debug' ? 'debug'
      : 'log';

    if (entry.data) {
      console[consoleMethod](prefix, entry.message, entry.data);
    } else {
      console[consoleMethod](prefix, entry.message);
    }
  }
}

/**
 * Create a logger for a specific category
 */
export function createLogger(category: string) {
  return {
    debug(message: string, data?: Record<string, unknown>): void {
      if (shouldLog('debug')) {
        addLogEntry({ level: 'debug', category, message, timestamp: new Date(), data });
      }
    },

    info(message: string, data?: Record<string, unknown>): void {
      if (shouldLog('info')) {
        addLogEntry({ level: 'info', category, message, timestamp: new Date(), data });
      }
    },

    warn(message: string, data?: Record<string, unknown>): void {
      if (shouldLog('warn')) {
        addLogEntry({ level: 'warn', category, message, timestamp: new Date(), data });
      }
    },

    error(message: string, data?: Record<string, unknown>): void {
      if (shouldLog('error')) {
        addLogEntry({ level: 'error', category, message, timestamp: new Date(), data });
      }
    },
  };
}

// Pre-configured loggers
export const calculationLogger = createLogger('Calculation');
export const stateLogger = createLogger('State');
export const renderLogger = createLogger('Render');
export const performanceLogger = createLogger('Performance');

/**
 * Record a performance metric
 */
export function recordMetric(
  name: string,
  value: number,
  type: MetricType = 'gauge',
  tags?: Record<string, string>
): void {
  if (!config.enabled) return;

  if (metricsBuffer.length >= config.maxEntries) {
    metricsBuffer.shift();
  }

  metricsBuffer.push({
    name,
    type,
    value,
    timestamp: new Date(),
    tags,
  });
}

/**
 * Start a timing measurement
 */
export function startTiming(name: string): void {
  if (!config.enabled) return;
  timingStarts.set(name, performance.now());
}

/**
 * End a timing measurement and record it
 */
export function endTiming(name: string, tags?: Record<string, string>): number {
  const start = timingStarts.get(name);
  if (start === undefined) return 0;

  const duration = performance.now() - start;
  timingStarts.delete(name);

  recordMetric(name, duration, 'timing', tags);
  return duration;
}

/**
 * Measure execution time of a function
 */
export function measureTime<T>(name: string, fn: () => T): T {
  const start = performance.now();
  try {
    return fn();
  } finally {
    const duration = performance.now() - start;
    recordMetric(name, duration, 'timing');

    if (duration > 16) { // Longer than one frame
      performanceLogger.warn(`Slow operation: ${name}`, { durationMs: duration });
    }
  }
}

/**
 * Increment a counter metric
 */
export function incrementCounter(name: string, amount: number = 1): void {
  recordMetric(name, amount, 'counter');
}

/**
 * Get all log entries
 */
export function getLogEntries(options?: {
  level?: LogLevel;
  category?: string;
  limit?: number;
}): LogEntry[] {
  let entries = [...logBuffer];

  if (options?.level) {
    const minPriority = LOG_LEVEL_PRIORITY[options.level];
    entries = entries.filter((e) => LOG_LEVEL_PRIORITY[e.level] >= minPriority);
  }

  if (options?.category) {
    entries = entries.filter((e) => e.category === options.category);
  }

  if (options?.limit) {
    entries = entries.slice(-options.limit);
  }

  return entries;
}

/**
 * Get performance metrics
 */
export function getMetrics(options?: {
  name?: string;
  type?: MetricType;
  limit?: number;
}): PerformanceMetric[] {
  let metrics = [...metricsBuffer];

  if (options?.name) {
    metrics = metrics.filter((m) => m.name === options.name);
  }

  if (options?.type) {
    metrics = metrics.filter((m) => m.type === options.type);
  }

  if (options?.limit) {
    metrics = metrics.slice(-options.limit);
  }

  return metrics;
}

/**
 * Get aggregated timing statistics
 */
export function getTimingStats(name: string): {
  count: number;
  min: number;
  max: number;
  avg: number;
  p95: number;
} | null {
  const timings = metricsBuffer
    .filter((m) => m.name === name && m.type === 'timing')
    .map((m) => m.value)
    .sort((a, b) => a - b);

  if (timings.length === 0) return null;

  const sum = timings.reduce((a, b) => a + b, 0);
  const p95Index = Math.floor(timings.length * 0.95);

  return {
    count: timings.length,
    min: timings[0],
    max: timings[timings.length - 1],
    avg: sum / timings.length,
    p95: timings[p95Index] ?? timings[timings.length - 1],
  };
}

/**
 * Clear all logs and metrics
 */
export function clearLogs(): void {
  logBuffer.length = 0;
  metricsBuffer.length = 0;
  timingStarts.clear();
}

/**
 * Export logs for debugging
 */
export function exportLogs(): string {
  return JSON.stringify({
    logs: logBuffer,
    metrics: metricsBuffer,
    exportedAt: new Date().toISOString(),
  }, null, 2);
}

// Performance monitoring for calculations
export const CalculationMetrics = {
  positionCalculation: 'calc.position',
  velocityCalculation: 'calc.velocity',
  batchUpdate: 'calc.batch_update',
  cacheHit: 'cache.hit',
  cacheMiss: 'cache.miss',
  frameTime: 'render.frame_time',
} as const;
