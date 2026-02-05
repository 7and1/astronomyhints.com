/**
 * Logger Module Tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  createLogger,
  enableDebugMode,
  disableLogging,
  clearLogs,
  exportLogs,
  calculationLogger,
  stateLogger,
  renderLogger,
  performanceLogger,
} from '../logger';

describe('Logger Module', () => {
  beforeEach(() => {
    clearLogs();
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'debug').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    disableLogging();
  });

  describe('createLogger', () => {
    it('should create a logger with the specified namespace', () => {
      const logger = createLogger('test');
      expect(logger).toBeDefined();
      expect(typeof logger.info).toBe('function');
      expect(typeof logger.warn).toBe('function');
      expect(typeof logger.error).toBe('function');
      expect(typeof logger.debug).toBe('function');
    });

    it('should have all log level methods', () => {
      const logger = createLogger('test-namespace');

      expect(typeof logger.info).toBe('function');
      expect(typeof logger.warn).toBe('function');
      expect(typeof logger.error).toBe('function');
      expect(typeof logger.debug).toBe('function');
    });

    it('should not throw when logging', () => {
      enableDebugMode();
      const logger = createLogger('no-throw');

      expect(() => logger.info('test')).not.toThrow();
      expect(() => logger.warn('test')).not.toThrow();
      expect(() => logger.error('test')).not.toThrow();
      expect(() => logger.debug('test')).not.toThrow();
    });
  });

  describe('enableDebugMode / disableLogging', () => {
    it('should enable debug mode without error', () => {
      expect(() => enableDebugMode()).not.toThrow();
    });

    it('should disable logging without error', () => {
      expect(() => disableLogging()).not.toThrow();
    });
  });

  describe('Log Management', () => {
    it('should clear logs without error', () => {
      expect(() => clearLogs()).not.toThrow();
    });

    it('should export logs as string', () => {
      enableDebugMode();
      const logger = createLogger('export-test');
      logger.info('exportable');

      const exported = exportLogs();
      expect(typeof exported).toBe('string');
    });
  });

  describe('Pre-configured Loggers', () => {
    it('should have calculationLogger', () => {
      expect(calculationLogger).toBeDefined();
      expect(typeof calculationLogger.info).toBe('function');
    });

    it('should have stateLogger', () => {
      expect(stateLogger).toBeDefined();
      expect(typeof stateLogger.info).toBe('function');
    });

    it('should have renderLogger', () => {
      expect(renderLogger).toBeDefined();
      expect(typeof renderLogger.info).toBe('function');
    });

    it('should have performanceLogger', () => {
      expect(performanceLogger).toBeDefined();
      expect(typeof performanceLogger.info).toBe('function');
    });
  });
});
