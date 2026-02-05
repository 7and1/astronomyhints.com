/**
 * Performance Monitoring Utilities
 *
 * Provides FPS monitoring, Web Vitals tracking, and performance budgets
 * for the Orbit Command Three.js application.
 */

// Performance budget thresholds
export const PERFORMANCE_BUDGET = {
  FPS_TARGET_DESKTOP: 60,
  FPS_TARGET_MOBILE: 30,
  FPS_WARNING_THRESHOLD: 45,
  INITIAL_LOAD_MS: 3000,
  INTERACTION_RESPONSE_MS: 100,
  LCP_THRESHOLD_MS: 2500,
  FID_THRESHOLD_MS: 100,
  CLS_THRESHOLD: 0.1,
} as const;

// FPS Monitor for development
class FPSMonitor {
  private frames: number[] = [];
  private lastTime = 0;
  private isRunning = false;
  private callback: ((fps: number) => void) | null = null;
  private rafId: number | null = null;

  start(callback?: (fps: number) => void): void {
    if (this.isRunning) return;
    this.isRunning = true;
    this.callback = callback ?? null;
    this.lastTime = performance.now();
    this.tick();
  }

  stop(): void {
    this.isRunning = false;
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  private tick = (): void => {
    if (!this.isRunning) return;

    const now = performance.now();
    const delta = now - this.lastTime;
    this.lastTime = now;

    // Store frame time
    this.frames.push(delta);

    // Keep only last 60 frames for rolling average
    if (this.frames.length > 60) {
      this.frames.shift();
    }

    // Calculate FPS every 10 frames
    if (this.frames.length % 10 === 0) {
      const avgFrameTime = this.frames.reduce((a, b) => a + b, 0) / this.frames.length;
      const fps = Math.round(1000 / avgFrameTime);

      if (this.callback) {
        this.callback(fps);
      }
    }

    this.rafId = requestAnimationFrame(this.tick);
  };

  getCurrentFPS(): number {
    if (this.frames.length === 0) return 0;
    const avgFrameTime = this.frames.reduce((a, b) => a + b, 0) / this.frames.length;
    return Math.round(1000 / avgFrameTime);
  }

  getFrameTimeStats(): { avg: number; min: number; max: number } {
    if (this.frames.length === 0) {
      return { avg: 0, min: 0, max: 0 };
    }
    return {
      avg: this.frames.reduce((a, b) => a + b, 0) / this.frames.length,
      min: Math.min(...this.frames),
      max: Math.max(...this.frames),
    };
  }
}

// Singleton FPS monitor instance
export const fpsMonitor = new FPSMonitor();

// Performance marks for custom timing
export function markStart(name: string): void {
  if (typeof performance === 'undefined') return;
  try {
    performance.mark(`${name}-start`);
  } catch {
    // Ignore errors in environments without Performance API
  }
}

export function markEnd(name: string): number | null {
  if (typeof performance === 'undefined') return null;
  try {
    performance.mark(`${name}-end`);
    const measure = performance.measure(name, `${name}-start`, `${name}-end`);
    return measure.duration;
  } catch {
    return null;
  }
}

// Web Vitals tracking
interface WebVitalsMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
}

type WebVitalsCallback = (metric: WebVitalsMetric) => void;

export function trackWebVitals(callback: WebVitalsCallback): void {
  if (typeof window === 'undefined') return;

  // Largest Contentful Paint
  const lcpObserver = new PerformanceObserver((list) => {
    const entries = list.getEntries();
    const lastEntry = entries[entries.length - 1];
    if (lastEntry) {
      const value = lastEntry.startTime;
      callback({
        name: 'LCP',
        value,
        rating:
          value <= PERFORMANCE_BUDGET.LCP_THRESHOLD_MS
            ? 'good'
            : value <= PERFORMANCE_BUDGET.LCP_THRESHOLD_MS * 1.6
              ? 'needs-improvement'
              : 'poor',
      });
    }
  });

  try {
    lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
  } catch {
    // LCP not supported
  }

  // First Input Delay
  const fidObserver = new PerformanceObserver((list) => {
    const entries = list.getEntries();
    const firstEntry = entries[0] as PerformanceEventTiming | undefined;
    if (firstEntry) {
      const value = firstEntry.processingStart - firstEntry.startTime;
      callback({
        name: 'FID',
        value,
        rating:
          value <= PERFORMANCE_BUDGET.FID_THRESHOLD_MS
            ? 'good'
            : value <= PERFORMANCE_BUDGET.FID_THRESHOLD_MS * 3
              ? 'needs-improvement'
              : 'poor',
      });
    }
  });

  try {
    fidObserver.observe({ type: 'first-input', buffered: true });
  } catch {
    // FID not supported
  }

  // Cumulative Layout Shift
  let clsValue = 0;
  const clsObserver = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      const layoutShiftEntry = entry as PerformanceEntry & { hadRecentInput?: boolean; value?: number };
      if (!layoutShiftEntry.hadRecentInput && layoutShiftEntry.value) {
        clsValue += layoutShiftEntry.value;
      }
    }
    callback({
      name: 'CLS',
      value: clsValue,
      rating:
        clsValue <= PERFORMANCE_BUDGET.CLS_THRESHOLD
          ? 'good'
          : clsValue <= PERFORMANCE_BUDGET.CLS_THRESHOLD * 2.5
            ? 'needs-improvement'
            : 'poor',
    });
  });

  try {
    clsObserver.observe({ type: 'layout-shift', buffered: true });
  } catch {
    // CLS not supported
  }
}

// Memory monitoring (Chrome only)
export function getMemoryUsage(): { usedJSHeapSize: number; totalJSHeapSize: number } | null {
  if (typeof window === 'undefined') return null;

  const perf = performance as Performance & {
    memory?: {
      usedJSHeapSize: number;
      totalJSHeapSize: number;
    };
  };

  if (perf.memory) {
    return {
      usedJSHeapSize: perf.memory.usedJSHeapSize,
      totalJSHeapSize: perf.memory.totalJSHeapSize,
    };
  }

  return null;
}

// Device capability detection
export function getDeviceCapabilities(): {
  isMobile: boolean;
  isLowEnd: boolean;
  devicePixelRatio: number;
  hardwareConcurrency: number;
  prefersReducedMotion: boolean;
} {
  if (typeof window === 'undefined') {
    return {
      isMobile: false,
      isLowEnd: false,
      devicePixelRatio: 1,
      hardwareConcurrency: 4,
      prefersReducedMotion: false,
    };
  }

  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
  const hardwareConcurrency = navigator.hardwareConcurrency ?? 4;
  const devicePixelRatio = window.devicePixelRatio ?? 1;
  const prefersReducedMotion =
    window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false;

  // Consider low-end if: mobile with < 4 cores, or desktop with < 2 cores
  const isLowEnd = (isMobile && hardwareConcurrency < 4) || hardwareConcurrency < 2;

  return {
    isMobile,
    isLowEnd,
    devicePixelRatio,
    hardwareConcurrency,
    prefersReducedMotion,
  };
}

// Performance report generator
export function generatePerformanceReport(): {
  fps: number;
  frameTimeStats: { avg: number; min: number; max: number };
  memory: { usedJSHeapSize: number; totalJSHeapSize: number } | null;
  device: ReturnType<typeof getDeviceCapabilities>;
  timestamp: number;
} {
  return {
    fps: fpsMonitor.getCurrentFPS(),
    frameTimeStats: fpsMonitor.getFrameTimeStats(),
    memory: getMemoryUsage(),
    device: getDeviceCapabilities(),
    timestamp: Date.now(),
  };
}
