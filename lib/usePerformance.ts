'use client';

import { useEffect, useRef, useCallback } from 'react';
import {
  recordMetric,
  startTiming,
  endTiming,
  getTimingStats,
  performanceLogger,
} from './logger';

/**
 * Hook to monitor component render performance
 */
export function useRenderPerformance(componentName: string) {
  const renderCount = useRef(0);
  const lastRenderTime = useRef(performance.now());

  useEffect(() => {
    const now = performance.now();
    const timeSinceLastRender = now - lastRenderTime.current;
    lastRenderTime.current = now;
    renderCount.current += 1;

    recordMetric(`render.${componentName}`, timeSinceLastRender, 'timing');

    // Log slow renders
    if (timeSinceLastRender > 16 && renderCount.current > 1) {
      performanceLogger.warn(`Slow render in ${componentName}`, {
        renderTime: timeSinceLastRender,
        renderCount: renderCount.current,
      });
    }
  });

  return {
    renderCount: renderCount.current,
  };
}

/**
 * Hook to measure callback execution time
 */
export function useTimedCallback<T extends (...args: unknown[]) => unknown>(
  callback: T,
  name: string
): T {
  return useCallback(
    ((...args: Parameters<T>) => {
      const start = performance.now();
      try {
        return callback(...args);
      } finally {
        const duration = performance.now() - start;
        recordMetric(name, duration, 'timing');

        if (duration > 16) {
          performanceLogger.warn(`Slow callback: ${name}`, { durationMs: duration });
        }
      }
    }) as T,
    [callback, name]
  );
}

/**
 * Hook to track frame rate
 */
export function useFrameRate(enabled: boolean = true) {
  const frameCount = useRef(0);
  const lastTime = useRef(performance.now());
  const fps = useRef(60);

  useEffect(() => {
    if (!enabled) return;

    let rafId: number;

    const measureFrame = () => {
      frameCount.current += 1;
      const now = performance.now();
      const elapsed = now - lastTime.current;

      // Calculate FPS every second
      if (elapsed >= 1000) {
        fps.current = Math.round((frameCount.current * 1000) / elapsed);
        recordMetric('fps', fps.current, 'gauge');

        // Log low FPS
        if (fps.current < 30) {
          performanceLogger.warn('Low frame rate detected', { fps: fps.current });
        }

        frameCount.current = 0;
        lastTime.current = now;
      }

      rafId = requestAnimationFrame(measureFrame);
    };

    rafId = requestAnimationFrame(measureFrame);

    return () => cancelAnimationFrame(rafId);
  }, [enabled]);

  return fps.current;
}

/**
 * Hook to monitor memory usage (if available)
 */
export function useMemoryMonitor(intervalMs: number = 5000) {
  useEffect(() => {
    // Check if memory API is available
    const memory = (performance as unknown as { memory?: {
      usedJSHeapSize: number;
      totalJSHeapSize: number;
      jsHeapSizeLimit: number;
    } }).memory;

    if (!memory) return;

    const checkMemory = () => {
      const usedMB = memory.usedJSHeapSize / (1024 * 1024);
      const totalMB = memory.totalJSHeapSize / (1024 * 1024);
      const limitMB = memory.jsHeapSizeLimit / (1024 * 1024);

      recordMetric('memory.used_mb', usedMB, 'gauge');
      recordMetric('memory.total_mb', totalMB, 'gauge');
      recordMetric('memory.usage_percent', (usedMB / limitMB) * 100, 'gauge');

      // Warn if memory usage is high
      if (usedMB / limitMB > 0.8) {
        performanceLogger.warn('High memory usage', {
          usedMB,
          totalMB,
          limitMB,
          usagePercent: (usedMB / limitMB) * 100,
        });
      }
    };

    checkMemory();
    const intervalId = setInterval(checkMemory, intervalMs);

    return () => clearInterval(intervalId);
  }, [intervalMs]);
}

/**
 * Hook to measure effect execution time
 */
export function useTimedEffect(
  effect: () => void | (() => void),
  deps: React.DependencyList,
  name: string
) {
  useEffect(() => {
    startTiming(name);
    const cleanup = effect();
    const duration = endTiming(name);

    if (duration > 16) {
      performanceLogger.warn(`Slow effect: ${name}`, { durationMs: duration });
    }

    return cleanup;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

/**
 * Get performance report for debugging
 */
export function getPerformanceReport(): {
  fps: ReturnType<typeof getTimingStats>;
  renders: Record<string, ReturnType<typeof getTimingStats>>;
  calculations: ReturnType<typeof getTimingStats>;
} {
  return {
    fps: getTimingStats('fps'),
    renders: {
      Scene: getTimingStats('render.Scene'),
      Planet: getTimingStats('render.Planet'),
      HUD: getTimingStats('render.HUD'),
    },
    calculations: getTimingStats('calc.batch_update'),
  };
}

/**
 * Debug panel data hook
 */
export function useDebugData() {
  const fps = useFrameRate(process.env.NODE_ENV === 'development');

  return {
    fps,
    getReport: getPerformanceReport,
  };
}
