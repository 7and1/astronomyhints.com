/**
 * Monitoring and Analytics Integration for Orbit Command
 *
 * This module provides a unified interface for:
 * - Error tracking (Sentry)
 * - Analytics (Google Analytics, Plausible)
 * - Performance monitoring
 * - Custom event tracking
 */

// =============================================================================
// Types
// =============================================================================

interface AnalyticsEvent {
  name: string;
  properties?: Record<string, string | number | boolean>;
}

interface ErrorContext {
  tags?: Record<string, string>;
  extra?: Record<string, unknown>;
  user?: {
    id?: string;
    email?: string;
  };
}

// =============================================================================
// Analytics
// =============================================================================

/**
 * Track a custom analytics event
 */
export function trackEvent(event: AnalyticsEvent): void {
  // Google Analytics 4
  if (typeof window !== 'undefined' && 'gtag' in window) {
    const gtag = (window as unknown as { gtag: (...args: unknown[]) => void }).gtag;
    gtag('event', event.name, event.properties);
  }

  // Plausible
  if (typeof window !== 'undefined' && 'plausible' in window) {
    const plausible = (window as unknown as { plausible: (name: string, options?: { props: Record<string, string | number | boolean> }) => void }).plausible;
    plausible(event.name, { props: event.properties || {} });
  }

  // Debug logging in development
  if (process.env.NODE_ENV === 'development') {
    console.log('[Analytics]', event.name, event.properties);
  }
}

/**
 * Track page view
 */
export function trackPageView(url: string, title?: string): void {
  trackEvent({
    name: 'page_view',
    properties: {
      page_location: url,
      page_title: title || document.title,
    },
  });
}

// =============================================================================
// Error Tracking
// =============================================================================

/**
 * Capture an error and send to error tracking service
 */
export function captureError(error: Error, context?: ErrorContext): void {
  // Sentry integration
  if (typeof window !== 'undefined' && 'Sentry' in window) {
    const Sentry = (window as unknown as { Sentry: { captureException: (error: Error, context?: unknown) => void } }).Sentry;
    Sentry.captureException(error, {
      tags: context?.tags,
      extra: context?.extra,
      user: context?.user,
    });
  }

  // Always log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.error('[Error]', error, context);
  }
}

/**
 * Capture a message/warning
 */
export function captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info'): void {
  if (typeof window !== 'undefined' && 'Sentry' in window) {
    const Sentry = (window as unknown as { Sentry: { captureMessage: (message: string, level: string) => void } }).Sentry;
    Sentry.captureMessage(message, level);
  }

  if (process.env.NODE_ENV === 'development') {
    console.log(`[${level.toUpperCase()}]`, message);
  }
}

/**
 * Set user context for error tracking
 */
export function setUser(user: { id?: string; email?: string } | null): void {
  if (typeof window !== 'undefined' && 'Sentry' in window) {
    const Sentry = (window as unknown as { Sentry: { setUser: (user: unknown) => void } }).Sentry;
    Sentry.setUser(user);
  }
}

// =============================================================================
// Performance Monitoring
// =============================================================================

/**
 * Measure and report Web Vitals
 */
export function reportWebVitals(metric: {
  id: string;
  name: string;
  value: number;
  label: 'web-vital' | 'custom';
}): void {
  // Send to analytics
  trackEvent({
    name: 'web_vital',
    properties: {
      metric_id: metric.id,
      metric_name: metric.name,
      metric_value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
      metric_label: metric.label,
    },
  });

  // Log in development
  if (process.env.NODE_ENV === 'development') {
    console.log('[WebVital]', metric.name, metric.value);
  }
}

/**
 * Start a performance measurement
 */
export function startMeasure(name: string): () => number {
  const start = performance.now();

  return () => {
    const duration = performance.now() - start;

    trackEvent({
      name: 'performance_measure',
      properties: {
        measure_name: name,
        duration_ms: Math.round(duration),
      },
    });

    return duration;
  };
}

// =============================================================================
// Custom Event Helpers for Orbit Command
// =============================================================================

/**
 * Track planet selection
 */
export function trackPlanetSelect(planetName: string): void {
  trackEvent({
    name: 'planet_select',
    properties: {
      planet: planetName,
    },
  });
}

/**
 * Track cinematic mode toggle
 */
export function trackCinematicMode(enabled: boolean): void {
  trackEvent({
    name: 'cinematic_mode',
    properties: {
      enabled,
    },
  });
}

/**
 * Track screenshot capture
 */
export function trackScreenshot(): void {
  trackEvent({
    name: 'screenshot_capture',
    properties: {
      timestamp: Date.now(),
    },
  });
}

/**
 * Track time scale change
 */
export function trackTimeScale(scale: number): void {
  trackEvent({
    name: 'time_scale_change',
    properties: {
      scale,
    },
  });
}

/**
 * Track WebGL initialization
 */
export function trackWebGLInit(success: boolean, renderer?: string): void {
  trackEvent({
    name: 'webgl_init',
    properties: {
      success,
      renderer: renderer || 'unknown',
    },
  });
}

/**
 * Track WebGL error
 */
export function trackWebGLError(errorType: string): void {
  trackEvent({
    name: 'webgl_error',
    properties: {
      error_type: errorType,
    },
  });
}
