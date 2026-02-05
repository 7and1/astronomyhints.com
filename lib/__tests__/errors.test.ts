/**
 * Errors Module Tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
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
} from '../errors';

describe('Errors Module', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('OrbitError', () => {
    it('should create an OrbitError with message', () => {
      const error = new OrbitError('Test error');
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(OrbitError);
      expect(error.message).toBe('Test error');
      expect(error.name).toBe('OrbitError');
    });

    it('should include severity and category', () => {
      const error = new OrbitError('Test error', {
        severity: 'critical',
        category: 'calculation',
      });
      expect(error.severity).toBe('critical');
      expect(error.category).toBe('calculation');
    });

    it('should have default severity and category', () => {
      const error = new OrbitError('Test error');
      expect(error.severity).toBe('error');
      expect(error.category).toBe('unknown');
    });

    it('should include context data', () => {
      const error = new OrbitError('Test error', {
        context: { planet: 'Mars', date: new Date() },
      });
      expect(error.context).toBeDefined();
      expect(error.context?.planet).toBe('Mars');
    });

    it('should capture timestamp', () => {
      const error = new OrbitError('Timestamp test');
      expect(error.timestamp).toBeInstanceOf(Date);
    });

    it('should have recoverable flag', () => {
      const error = new OrbitError('Recoverable test', { recoverable: false });
      expect(error.recoverable).toBe(false);
    });

    it('should default to recoverable', () => {
      const error = new OrbitError('Default recoverable');
      expect(error.recoverable).toBe(true);
    });

    it('should serialize to JSON', () => {
      const error = new OrbitError('JSON test', {
        severity: 'warning',
        category: 'validation',
      });
      const json = error.toJSON();
      expect(json.name).toBe('OrbitError');
      expect(json.message).toBe('JSON test');
      expect(json.severity).toBe('warning');
      expect(json.category).toBe('validation');
    });

    it('should capture stack trace', () => {
      const error = new OrbitError('Stack test');
      expect(error.stack).toBeDefined();
    });
  });

  describe('CalculationError', () => {
    it('should create a CalculationError', () => {
      const error = new CalculationError('Calculation failed');
      expect(error).toBeInstanceOf(OrbitError);
      expect(error).toBeInstanceOf(CalculationError);
      expect(error.name).toBe('CalculationError');
      expect(error.category).toBe('calculation');
    });

    it('should include body and date', () => {
      const testDate = new Date();
      const error = new CalculationError('Position calculation failed', {
        body: 'Mars',
        date: testDate,
      });
      expect(error.body).toBe('Mars');
      expect(error.date).toBe(testDate);
    });

    it('should include body in context', () => {
      const error = new CalculationError('Test', {
        body: 'Jupiter',
      });
      expect(error.context?.body).toBe('Jupiter');
    });
  });

  describe('StateError', () => {
    it('should create a StateError', () => {
      const error = new StateError('State update failed');
      expect(error).toBeInstanceOf(OrbitError);
      expect(error).toBeInstanceOf(StateError);
      expect(error.name).toBe('StateError');
      expect(error.category).toBe('state');
    });

    it('should include context', () => {
      const error = new StateError('State error', {
        context: { action: 'setSelectedPlanet' },
      });
      expect(error.context?.action).toBe('setSelectedPlanet');
    });
  });

  describe('ValidationError', () => {
    it('should create a ValidationError', () => {
      const error = new ValidationError('Invalid input');
      expect(error).toBeInstanceOf(OrbitError);
      expect(error).toBeInstanceOf(ValidationError);
      expect(error.name).toBe('ValidationError');
      expect(error.category).toBe('validation');
    });

    it('should have warning severity', () => {
      const error = new ValidationError('Invalid input');
      expect(error.severity).toBe('warning');
    });

    it('should include field and value information', () => {
      const error = new ValidationError('Invalid planet name', {
        field: 'planetName',
        value: 'Pluto',
      });
      expect(error.field).toBe('planetName');
      expect(error.value).toBe('Pluto');
    });
  });

  describe('registerErrorHandler', () => {
    it('should register custom error handlers', () => {
      const handler = vi.fn();
      const unregister = registerErrorHandler(handler);

      const error = new OrbitError('Handler test');
      reportError(error);

      expect(handler).toHaveBeenCalledWith(error);

      // Clean up
      unregister();
    });

    it('should return unregister function', () => {
      const handler = vi.fn();
      const unregister = registerErrorHandler(handler);

      expect(typeof unregister).toBe('function');

      unregister();

      const error = new OrbitError('After unregister');
      reportError(error);

      // Handler should only be called once (before unregister)
      expect(handler).toHaveBeenCalledTimes(0);
    });

    it('should support multiple handlers', () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();

      const unregister1 = registerErrorHandler(handler1);
      const unregister2 = registerErrorHandler(handler2);

      const error = new OrbitError('Multi handler test');
      reportError(error);

      expect(handler1).toHaveBeenCalledWith(error);
      expect(handler2).toHaveBeenCalledWith(error);

      unregister1();
      unregister2();
    });
  });

  describe('reportError', () => {
    it('should call registered handlers', () => {
      const handler = vi.fn();
      const unregister = registerErrorHandler(handler);

      const error = new OrbitError('Report test');
      reportError(error);

      expect(handler).toHaveBeenCalled();

      unregister();
    });

    it('should handle handler errors gracefully', () => {
      const badHandler = vi.fn(() => {
        throw new Error('Handler error');
      });
      const unregister = registerErrorHandler(badHandler);

      const error = new OrbitError('Bad handler test');

      // Should not throw
      expect(() => reportError(error)).not.toThrow();

      unregister();
    });
  });

  describe('withErrorHandling', () => {
    it('should wrap function and return result on success', () => {
      const successFn = () => 'success';
      const wrapped = withErrorHandling(successFn, { fallback: 'fallback' });
      const result = wrapped();

      expect(result).toBe('success');
    });

    it('should return fallback on error', () => {
      const throwingFn = () => {
        throw new Error('Test throw');
      };

      const wrapped = withErrorHandling(throwingFn, { fallback: 'fallback' });
      const result = wrapped();

      expect(result).toBe('fallback');
    });

    it('should handle async functions', async () => {
      const asyncFn = async () => {
        throw new Error('Async error');
      };

      const wrapped = withErrorHandling(asyncFn, { fallback: 'async-fallback' });
      const result = await wrapped();

      expect(result).toBe('async-fallback');
    });

    it('should rethrow when configured', () => {
      const throwingFn = () => {
        throw new Error('Rethrow test');
      };

      const wrapped = withErrorHandling(throwingFn, { rethrow: true });

      expect(() => wrapped()).toThrow();
    });
  });

  describe('withRetry', () => {
    it('should succeed on first try if no error', () => {
      let attempts = 0;
      const succeed = () => {
        attempts++;
        return 'immediate success';
      };

      const wrapped = withRetry(succeed, { maxAttempts: 3 });
      const result = wrapped();

      expect(result).toBe('immediate success');
      expect(attempts).toBe(1);
    });

    it('should retry on failure', () => {
      let attempts = 0;
      const failTwice = () => {
        attempts++;
        if (attempts < 3) {
          throw new Error('Fail');
        }
        return 'success';
      };

      const wrapped = withRetry(failTwice, { maxAttempts: 3, delayMs: 1 });
      const result = wrapped();

      expect(result).toBe('success');
      expect(attempts).toBe(3);
    });

    it('should throw after max retries', () => {
      const alwaysFail = () => {
        throw new Error('Always fails');
      };

      const wrapped = withRetry(alwaysFail, { maxAttempts: 2, delayMs: 1 });

      expect(() => wrapped()).toThrow('Always fails');
    });
  });

  describe('getUserMessage', () => {
    it('should return user-friendly message for calculation error', () => {
      const error = new CalculationError('Internal calculation error');
      const message = getUserMessage(error);

      expect(message).toBe(USER_MESSAGES.calculation);
    });

    it('should return user-friendly message for validation error', () => {
      const error = new ValidationError('Invalid input');
      const message = getUserMessage(error);

      expect(message).toBe(USER_MESSAGES.validation);
    });

    it('should return user-friendly message for state error', () => {
      const error = new StateError('State error');
      const message = getUserMessage(error);

      expect(message).toBe(USER_MESSAGES.state);
    });

    it('should return generic message for unknown category', () => {
      const error = new OrbitError('Unknown error');
      const message = getUserMessage(error);

      expect(message).toBe(USER_MESSAGES.unknown);
    });
  });

  describe('FALLBACK_VALUES', () => {
    it('should have position fallback', () => {
      expect(FALLBACK_VALUES.position).toBeDefined();
      expect(Array.isArray(FALLBACK_VALUES.position)).toBe(true);
      expect(FALLBACK_VALUES.position.length).toBe(3);
    });

    it('should have velocity fallback', () => {
      expect(FALLBACK_VALUES.velocity).toBeDefined();
      expect(typeof FALLBACK_VALUES.velocity).toBe('number');
    });

    it('should have temperature fallback', () => {
      expect(FALLBACK_VALUES.temperature).toBeDefined();
      expect(typeof FALLBACK_VALUES.temperature).toBe('number');
    });

    it('should have distance fallback', () => {
      expect(FALLBACK_VALUES.distance).toBeDefined();
      expect(typeof FALLBACK_VALUES.distance).toBe('number');
    });
  });

  describe('USER_MESSAGES', () => {
    it('should have calculation error message', () => {
      expect(USER_MESSAGES.calculation).toBeDefined();
      expect(typeof USER_MESSAGES.calculation).toBe('string');
    });

    it('should have validation error message', () => {
      expect(USER_MESSAGES.validation).toBeDefined();
      expect(typeof USER_MESSAGES.validation).toBe('string');
    });

    it('should have state error message', () => {
      expect(USER_MESSAGES.state).toBeDefined();
      expect(typeof USER_MESSAGES.state).toBe('string');
    });

    it('should have unknown error message', () => {
      expect(USER_MESSAGES.unknown).toBeDefined();
      expect(typeof USER_MESSAGES.unknown).toBe('string');
    });

    it('should have rendering error message', () => {
      expect(USER_MESSAGES.rendering).toBeDefined();
      expect(typeof USER_MESSAGES.rendering).toBe('string');
    });

    it('should have network error message', () => {
      expect(USER_MESSAGES.network).toBeDefined();
      expect(typeof USER_MESSAGES.network).toBe('string');
    });
  });
});
