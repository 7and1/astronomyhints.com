/**
 * Error Handling System for Orbit Command
 *
 * Provides structured error types, error boundaries support,
 * and graceful degradation mechanisms.
 */

// Error severity levels
export type ErrorSeverity = 'critical' | 'error' | 'warning' | 'info';

// Error categories for classification
export type ErrorCategory =
  | 'calculation'
  | 'rendering'
  | 'state'
  | 'network'
  | 'validation'
  | 'unknown';

/**
 * Base error class for Orbit Command
 */
export class OrbitError extends Error {
  readonly severity: ErrorSeverity;
  readonly category: ErrorCategory;
  readonly timestamp: Date;
  readonly context?: Record<string, unknown>;
  readonly recoverable: boolean;

  constructor(
    message: string,
    options: {
      severity?: ErrorSeverity;
      category?: ErrorCategory;
      context?: Record<string, unknown>;
      recoverable?: boolean;
      cause?: Error;
    } = {}
  ) {
    super(message, { cause: options.cause });
    this.name = 'OrbitError';
    this.severity = options.severity ?? 'error';
    this.category = options.category ?? 'unknown';
    this.timestamp = new Date();
    this.context = options.context;
    this.recoverable = options.recoverable ?? true;
  }

  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      message: this.message,
      severity: this.severity,
      category: this.category,
      timestamp: this.timestamp.toISOString(),
      context: this.context,
      recoverable: this.recoverable,
      stack: this.stack,
    };
  }
}

/**
 * Error for astronomy calculation failures
 */
export class CalculationError extends OrbitError {
  readonly body?: string;
  readonly date?: Date;

  constructor(
    message: string,
    options: {
      body?: string;
      date?: Date;
      context?: Record<string, unknown>;
      cause?: Error;
    } = {}
  ) {
    super(message, {
      severity: 'error',
      category: 'calculation',
      context: {
        ...options.context,
        body: options.body,
        date: options.date?.toISOString(),
      },
      recoverable: true,
      cause: options.cause,
    });
    this.name = 'CalculationError';
    this.body = options.body;
    this.date = options.date;
  }
}

/**
 * Error for state management issues
 */
export class StateError extends OrbitError {
  constructor(
    message: string,
    options: {
      context?: Record<string, unknown>;
      cause?: Error;
    } = {}
  ) {
    super(message, {
      severity: 'error',
      category: 'state',
      context: options.context,
      recoverable: true,
      cause: options.cause,
    });
    this.name = 'StateError';
  }
}

/**
 * Error for validation failures
 */
export class ValidationError extends OrbitError {
  readonly field?: string;
  readonly value?: unknown;

  constructor(
    message: string,
    options: {
      field?: string;
      value?: unknown;
      context?: Record<string, unknown>;
    } = {}
  ) {
    super(message, {
      severity: 'warning',
      category: 'validation',
      context: {
        ...options.context,
        field: options.field,
        value: options.value,
      },
      recoverable: true,
    });
    this.name = 'ValidationError';
    this.field = options.field;
    this.value = options.value;
  }
}

// Error handler type
type ErrorHandler = (error: OrbitError) => void;

// Global error handlers registry
const errorHandlers: Set<ErrorHandler> = new Set();

/**
 * Register a global error handler
 */
export function registerErrorHandler(handler: ErrorHandler): () => void {
  errorHandlers.add(handler);
  return () => errorHandlers.delete(handler);
}

/**
 * Report an error to all registered handlers
 */
export function reportError(error: OrbitError): void {
  errorHandlers.forEach((handler) => {
    try {
      handler(error);
    } catch (e) {
      console.error('Error handler failed:', e);
    }
  });

  // Always log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.error(`[${error.severity.toUpperCase()}] ${error.category}:`, error.message, error.context);
  }
}

/**
 * Wrap a function with error handling
 */
export function withErrorHandling<T extends (...args: unknown[]) => unknown>(
  fn: T,
  options: {
    category?: ErrorCategory;
    fallback?: ReturnType<T>;
    rethrow?: boolean;
  } = {}
): T {
  return ((...args: Parameters<T>): ReturnType<T> => {
    try {
      const result = fn(...args);

      // Handle promises
      if (result instanceof Promise) {
        return result.catch((error) => {
          const orbitError = error instanceof OrbitError
            ? error
            : new OrbitError(error.message ?? 'Unknown error', {
                category: options.category,
                cause: error,
              });

          reportError(orbitError);

          if (options.rethrow) throw orbitError;
          return options.fallback as ReturnType<T>;
        }) as ReturnType<T>;
      }

      return result as ReturnType<T>;
    } catch (error) {
      const orbitError = error instanceof OrbitError
        ? error
        : new OrbitError((error as Error).message ?? 'Unknown error', {
            category: options.category,
            cause: error as Error,
          });

      reportError(orbitError);

      if (options.rethrow) throw orbitError;
      return options.fallback as ReturnType<T>;
    }
  }) as T;
}

/**
 * Create a retry wrapper for functions that may fail transiently
 */
export function withRetry<T extends (...args: unknown[]) => unknown>(
  fn: T,
  options: {
    maxAttempts?: number;
    delayMs?: number;
    backoff?: boolean;
  } = {}
): T {
  const { maxAttempts = 3, delayMs = 100, backoff = true } = options;

  return ((...args: Parameters<T>): ReturnType<T> => {
    let lastError: Error | undefined;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return fn(...args) as ReturnType<T>;
      } catch (error) {
        lastError = error as Error;

        if (attempt < maxAttempts) {
          const delay = backoff ? delayMs * Math.pow(2, attempt - 1) : delayMs;
          // Synchronous delay (for non-async functions)
          const start = Date.now();
          while (Date.now() - start < delay) {
            // Busy wait - only for sync retry
          }
        }
      }
    }

    throw lastError;
  }) as T;
}

/**
 * Default fallback values for graceful degradation
 */
export const FALLBACK_VALUES = {
  position: [0, 0, 0] as [number, number, number],
  velocity: 0,
  temperature: 0,
  distance: 1,
} as const;

/**
 * User-friendly error messages
 */
export const USER_MESSAGES: Record<ErrorCategory, string> = {
  calculation: 'Unable to calculate planetary positions. Using estimated values.',
  rendering: 'Display issue detected. Try refreshing the page.',
  state: 'Application state error. Some features may be unavailable.',
  network: 'Network connection issue. Working in offline mode.',
  validation: 'Invalid input detected. Please check your settings.',
  unknown: 'An unexpected error occurred. Please try again.',
};

/**
 * Get user-friendly message for an error
 */
export function getUserMessage(error: OrbitError): string {
  return USER_MESSAGES[error.category] ?? USER_MESSAGES.unknown;
}
