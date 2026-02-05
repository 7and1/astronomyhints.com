/**
 * Monitoring Module Tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  trackEvent,
  trackPageView,
  captureError,
  captureMessage,
  setUser,
  reportWebVitals,
  startMeasure,
  trackPlanetSelect,
  trackCinematicMode,
  trackScreenshot,
  trackTimeScale,
  trackWebGLInit,
  trackWebGLError,
} from '../monitoring';

describe('Monitoring Module', () => {
  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    // Clean up window properties
    delete (window as Record<string, unknown>).gtag;
    delete (window as Record<string, unknown>).plausible;
    delete (window as Record<string, unknown>).Sentry;
  });

  describe('trackEvent', () => {
    it('should call gtag when available', () => {
      const mockGtag = vi.fn();
      (window as Record<string, unknown>).gtag = mockGtag;

      trackEvent({ name: 'test_event', properties: { key: 'value' } });

      expect(mockGtag).toHaveBeenCalledWith('event', 'test_event', { key: 'value' });
    });

    it('should call plausible when available', () => {
      const mockPlausible = vi.fn();
      (window as Record<string, unknown>).plausible = mockPlausible;

      trackEvent({ name: 'test_event', properties: { key: 'value' } });

      expect(mockPlausible).toHaveBeenCalledWith('test_event', { props: { key: 'value' } });
    });

    it('should handle when neither gtag nor plausible available', () => {
      // Should not throw
      expect(() => {
        trackEvent({ name: 'test_event' });
      }).not.toThrow();
    });

    it('should log in development mode', () => {
      const originalEnv = process.env.NODE_ENV;
      vi.stubEnv('NODE_ENV', 'development');

      trackEvent({ name: 'dev_event' });

      expect(console.log).toHaveBeenCalled();

      vi.stubEnv('NODE_ENV', originalEnv || 'test');
    });
  });

  describe('trackPageView', () => {
    it('should track page view event', () => {
      const mockGtag = vi.fn();
      (window as Record<string, unknown>).gtag = mockGtag;

      trackPageView('/test-page', 'Test Page');

      expect(mockGtag).toHaveBeenCalledWith('event', 'page_view', expect.objectContaining({
        page_location: '/test-page',
        page_title: 'Test Page',
      }));
    });
  });

  describe('captureError', () => {
    it('should call Sentry when available', () => {
      const mockSentry = {
        captureException: vi.fn(),
      };
      (window as Record<string, unknown>).Sentry = mockSentry;

      const error = new Error('Test error');
      captureError(error);

      expect(mockSentry.captureException).toHaveBeenCalled();
    });

    it('should handle when Sentry not available', () => {
      const error = new Error('Test error');

      // Should not throw
      expect(() => {
        captureError(error);
      }).not.toThrow();
    });

    it('should log error in development', () => {
      const originalEnv = process.env.NODE_ENV;
      vi.stubEnv('NODE_ENV', 'development');

      const error = new Error('Dev error');
      captureError(error);

      expect(console.error).toHaveBeenCalled();

      vi.stubEnv('NODE_ENV', originalEnv || 'test');
    });
  });

  describe('captureMessage', () => {
    it('should call Sentry captureMessage when available', () => {
      const mockSentry = {
        captureMessage: vi.fn(),
      };
      (window as Record<string, unknown>).Sentry = mockSentry;

      captureMessage('Test message', 'warning');

      expect(mockSentry.captureMessage).toHaveBeenCalledWith('Test message', 'warning');
    });

    it('should handle when Sentry not available', () => {
      expect(() => {
        captureMessage('Test message');
      }).not.toThrow();
    });
  });

  describe('setUser', () => {
    it('should call Sentry setUser when available', () => {
      const mockSentry = {
        setUser: vi.fn(),
      };
      (window as Record<string, unknown>).Sentry = mockSentry;

      setUser({ id: '123', email: 'test@example.com' });

      expect(mockSentry.setUser).toHaveBeenCalledWith({ id: '123', email: 'test@example.com' });
    });

    it('should handle null user (logout)', () => {
      const mockSentry = {
        setUser: vi.fn(),
      };
      (window as Record<string, unknown>).Sentry = mockSentry;

      setUser(null);

      expect(mockSentry.setUser).toHaveBeenCalledWith(null);
    });
  });

  describe('reportWebVitals', () => {
    it('should track web vital metrics', () => {
      const mockGtag = vi.fn();
      (window as Record<string, unknown>).gtag = mockGtag;

      reportWebVitals({
        id: 'v1-123',
        name: 'LCP',
        value: 2500,
        label: 'web-vital',
      });

      expect(mockGtag).toHaveBeenCalledWith('event', 'web_vital', expect.objectContaining({
        metric_name: 'LCP',
      }));
    });

    it('should multiply CLS by 1000', () => {
      const mockGtag = vi.fn();
      (window as Record<string, unknown>).gtag = mockGtag;

      reportWebVitals({
        id: 'v1-456',
        name: 'CLS',
        value: 0.1,
        label: 'web-vital',
      });

      expect(mockGtag).toHaveBeenCalledWith('event', 'web_vital', expect.objectContaining({
        metric_name: 'CLS',
        metric_value: 100,
      }));
    });
  });

  describe('startMeasure', () => {
    it('should return a function that returns duration', () => {
      vi.spyOn(performance, 'now')
        .mockReturnValueOnce(1000)
        .mockReturnValueOnce(1500);

      const endMeasure = startMeasure('test-measure');
      const duration = endMeasure();

      expect(duration).toBe(500);
    });
  });

  describe('Custom Event Helpers', () => {
    beforeEach(() => {
      (window as Record<string, unknown>).gtag = vi.fn();
    });

    describe('trackPlanetSelect', () => {
      it('should track planet selection', () => {
        trackPlanetSelect('Mars');

        expect((window as { gtag: ReturnType<typeof vi.fn> }).gtag).toHaveBeenCalledWith(
          'event',
          'planet_select',
          { planet: 'Mars' }
        );
      });
    });

    describe('trackCinematicMode', () => {
      it('should track cinematic mode enabled', () => {
        trackCinematicMode(true);

        expect((window as { gtag: ReturnType<typeof vi.fn> }).gtag).toHaveBeenCalledWith(
          'event',
          'cinematic_mode',
          { enabled: true }
        );
      });

      it('should track cinematic mode disabled', () => {
        trackCinematicMode(false);

        expect((window as { gtag: ReturnType<typeof vi.fn> }).gtag).toHaveBeenCalledWith(
          'event',
          'cinematic_mode',
          { enabled: false }
        );
      });
    });

    describe('trackScreenshot', () => {
      it('should track screenshot capture', () => {
        trackScreenshot();

        expect((window as { gtag: ReturnType<typeof vi.fn> }).gtag).toHaveBeenCalledWith(
          'event',
          'screenshot_capture',
          expect.objectContaining({ timestamp: expect.any(Number) })
        );
      });
    });

    describe('trackTimeScale', () => {
      it('should track time scale change', () => {
        trackTimeScale(10);

        expect((window as { gtag: ReturnType<typeof vi.fn> }).gtag).toHaveBeenCalledWith(
          'event',
          'time_scale_change',
          { scale: 10 }
        );
      });
    });

    describe('trackWebGLInit', () => {
      it('should track successful WebGL init', () => {
        trackWebGLInit(true, 'NVIDIA GeForce');

        expect((window as { gtag: ReturnType<typeof vi.fn> }).gtag).toHaveBeenCalledWith(
          'event',
          'webgl_init',
          { success: true, renderer: 'NVIDIA GeForce' }
        );
      });

      it('should track failed WebGL init', () => {
        trackWebGLInit(false);

        expect((window as { gtag: ReturnType<typeof vi.fn> }).gtag).toHaveBeenCalledWith(
          'event',
          'webgl_init',
          { success: false, renderer: 'unknown' }
        );
      });
    });

    describe('trackWebGLError', () => {
      it('should track WebGL error', () => {
        trackWebGLError('context_lost');

        expect((window as { gtag: ReturnType<typeof vi.fn> }).gtag).toHaveBeenCalledWith(
          'event',
          'webgl_error',
          { error_type: 'context_lost' }
        );
      });
    });
  });
});
