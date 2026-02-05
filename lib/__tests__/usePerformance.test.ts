/**
 * Performance Hook Tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('Performance Utilities', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  describe('usePerformance module', () => {
    it('should export useRenderPerformance', async () => {
      const perfModule = await import('../usePerformance');
      expect(perfModule.useRenderPerformance).toBeDefined();
      expect(typeof perfModule.useRenderPerformance).toBe('function');
    });

    it('should export useTimedCallback', async () => {
      const perfModule = await import('../usePerformance');
      expect(perfModule.useTimedCallback).toBeDefined();
      expect(typeof perfModule.useTimedCallback).toBe('function');
    });

    it('should export useFrameRate', async () => {
      const perfModule = await import('../usePerformance');
      expect(perfModule.useFrameRate).toBeDefined();
      expect(typeof perfModule.useFrameRate).toBe('function');
    });

    it('should export useMemoryMonitor', async () => {
      const perfModule = await import('../usePerformance');
      expect(perfModule.useMemoryMonitor).toBeDefined();
      expect(typeof perfModule.useMemoryMonitor).toBe('function');
    });

    it('should export useTimedEffect', async () => {
      const perfModule = await import('../usePerformance');
      expect(perfModule.useTimedEffect).toBeDefined();
      expect(typeof perfModule.useTimedEffect).toBe('function');
    });

    it('should export useDebugData', async () => {
      const perfModule = await import('../usePerformance');
      expect(perfModule.useDebugData).toBeDefined();
      expect(typeof perfModule.useDebugData).toBe('function');
    });

    it('should export getPerformanceReport', async () => {
      const perfModule = await import('../usePerformance');
      expect(perfModule.getPerformanceReport).toBeDefined();
      expect(typeof perfModule.getPerformanceReport).toBe('function');
    });
  });
});
