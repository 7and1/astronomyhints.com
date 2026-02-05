/**
 * Mobile Module Tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  detectDeviceCapabilities,
  getMobileSettings,
  triggerHaptic,
  requestFullscreen,
  exitFullscreen,
  isFullscreen,
  shareContent,
  canShare,
  type DeviceCapabilities,
  type MobileSettings,
} from '../mobile';

describe('Mobile Module', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('detectDeviceCapabilities', () => {
    it('should return device capabilities object', () => {
      const caps = detectDeviceCapabilities();

      expect(caps).toBeDefined();
      expect(typeof caps.isMobile).toBe('boolean');
      expect(typeof caps.isTablet).toBe('boolean');
      expect(typeof caps.isTouch).toBe('boolean');
      expect(typeof caps.hasGyroscope).toBe('boolean');
      expect(typeof caps.hasVibration).toBe('boolean');
      expect(typeof caps.pixelRatio).toBe('number');
      expect(typeof caps.screenWidth).toBe('number');
      expect(typeof caps.screenHeight).toBe('number');
      expect(typeof caps.isLowEndDevice).toBe('boolean');
    });

    it('should detect WebGL2 support', () => {
      const caps = detectDeviceCapabilities();
      expect(typeof caps.supportsWebGL2).toBe('boolean');
    });

    it('should detect max texture size', () => {
      const caps = detectDeviceCapabilities();
      expect(typeof caps.maxTextureSize).toBe('number');
      expect(caps.maxTextureSize).toBeGreaterThan(0);
    });

    it('should detect GPU tier', () => {
      const caps = detectDeviceCapabilities();
      expect(['low', 'medium', 'high']).toContain(caps.gpuTier);
    });

    it('should detect reduced motion preference', () => {
      const caps = detectDeviceCapabilities();
      expect(typeof caps.reducedMotion).toBe('boolean');
    });

    it('should detect save data preference', () => {
      const caps = detectDeviceCapabilities();
      expect(typeof caps.saveData).toBe('boolean');
    });

    it('should detect connection type', () => {
      const caps = detectDeviceCapabilities();
      expect(['slow-2g', '2g', '3g', '4g', 'wifi', 'unknown']).toContain(caps.connectionType);
    });
  });

  describe('getMobileSettings', () => {
    it('should return mobile settings based on capabilities', () => {
      const caps: DeviceCapabilities = {
        isMobile: false,
        isTablet: false,
        isTouch: false,
        hasGyroscope: false,
        hasVibration: false,
        pixelRatio: 2,
        screenWidth: 1920,
        screenHeight: 1080,
        isLowEndDevice: false,
        connectionType: '4g',
        saveData: false,
        reducedMotion: false,
        supportsWebGL2: true,
        maxTextureSize: 4096,
        gpuTier: 'high',
      };

      const settings = getMobileSettings(caps);

      expect(settings).toBeDefined();
      expect(typeof settings.particleCount).toBe('number');
      expect(typeof settings.starCount).toBe('number');
      expect(typeof settings.sphereSegments).toBe('number');
      expect(typeof settings.enableBloom).toBe('boolean');
      expect(typeof settings.enableShadows).toBe('boolean');
      expect(settings.dpr).toBeDefined();
      expect(typeof settings.antialias).toBe('boolean');
    });

    it('should reduce settings for mobile devices', () => {
      const mobileCaps: DeviceCapabilities = {
        isMobile: true,
        isTablet: false,
        isTouch: true,
        hasGyroscope: true,
        hasVibration: true,
        pixelRatio: 3,
        screenWidth: 390,
        screenHeight: 844,
        isLowEndDevice: false,
        connectionType: '4g',
        saveData: false,
        reducedMotion: false,
        supportsWebGL2: true,
        maxTextureSize: 4096,
        gpuTier: 'medium',
      };

      const desktopCaps: DeviceCapabilities = {
        isMobile: false,
        isTablet: false,
        isTouch: false,
        hasGyroscope: false,
        hasVibration: false,
        pixelRatio: 2,
        screenWidth: 1920,
        screenHeight: 1080,
        isLowEndDevice: false,
        connectionType: '4g',
        saveData: false,
        reducedMotion: false,
        supportsWebGL2: true,
        maxTextureSize: 4096,
        gpuTier: 'high',
      };

      const mobileSettings = getMobileSettings(mobileCaps);
      const desktopSettings = getMobileSettings(desktopCaps);

      // Mobile should have reduced particle count
      expect(mobileSettings.particleCount).toBeLessThanOrEqual(desktopSettings.particleCount);
    });

    it('should reduce settings for low-end devices', () => {
      const lowEndCaps: DeviceCapabilities = {
        isMobile: true,
        isTablet: false,
        isTouch: true,
        hasGyroscope: false,
        hasVibration: false,
        pixelRatio: 1,
        screenWidth: 320,
        screenHeight: 568,
        isLowEndDevice: true,
        connectionType: '3g',
        saveData: true,
        reducedMotion: false,
        supportsWebGL2: false,
        maxTextureSize: 2048,
        gpuTier: 'low',
      };

      const settings = getMobileSettings(lowEndCaps);

      expect(settings.enableBloom).toBe(false);
      expect(settings.enableShadows).toBe(false);
      expect(settings.particleCount).toBeLessThan(5000);
    });

    it('should return tablet settings for tablets', () => {
      const tabletCaps: DeviceCapabilities = {
        isMobile: false,
        isTablet: true,
        isTouch: true,
        hasGyroscope: true,
        hasVibration: true,
        pixelRatio: 2,
        screenWidth: 768,
        screenHeight: 1024,
        isLowEndDevice: false,
        connectionType: '4g',
        saveData: false,
        reducedMotion: false,
        supportsWebGL2: true,
        maxTextureSize: 4096,
        gpuTier: 'medium',
      };

      const settings = getMobileSettings(tabletCaps);

      expect(settings.particleCount).toBe(2000);
      expect(settings.enableBloom).toBe(true);
    });

    it('should use default capabilities when none provided', () => {
      const settings = getMobileSettings();
      expect(settings).toBeDefined();
      expect(typeof settings.particleCount).toBe('number');
    });
  });

  describe('triggerHaptic', () => {
    it('should call navigator.vibrate for light haptic', () => {
      const vibrateSpy = vi.spyOn(navigator, 'vibrate').mockReturnValue(true);

      triggerHaptic('light');

      expect(vibrateSpy).toHaveBeenCalledWith(10);
    });

    it('should call navigator.vibrate for medium haptic', () => {
      const vibrateSpy = vi.spyOn(navigator, 'vibrate').mockReturnValue(true);

      triggerHaptic('medium');

      expect(vibrateSpy).toHaveBeenCalledWith(25);
    });

    it('should call navigator.vibrate for heavy haptic', () => {
      const vibrateSpy = vi.spyOn(navigator, 'vibrate').mockReturnValue(true);

      triggerHaptic('heavy');

      expect(vibrateSpy).toHaveBeenCalledWith([50, 30, 50]);
    });

    it('should default to light haptic', () => {
      const vibrateSpy = vi.spyOn(navigator, 'vibrate').mockReturnValue(true);

      triggerHaptic();

      expect(vibrateSpy).toHaveBeenCalledWith(10);
    });

    it('should handle vibration errors gracefully', () => {
      vi.spyOn(navigator, 'vibrate').mockImplementation(() => {
        throw new Error('Vibration blocked');
      });

      // Should not throw
      expect(() => triggerHaptic()).not.toThrow();
    });
  });

  describe('isFullscreen', () => {
    it('should return false when not in fullscreen', () => {
      expect(isFullscreen()).toBe(false);
    });
  });

  describe('canShare', () => {
    it('should return boolean', () => {
      const result = canShare();
      expect(typeof result).toBe('boolean');
    });
  });

  describe('shareContent', () => {
    it('should return false when share API not available', async () => {
      const result = await shareContent({ title: 'Test', url: 'https://example.com' });
      expect(result).toBe(false);
    });
  });

  describe('requestFullscreen', () => {
    it('should attempt to request fullscreen', async () => {
      const mockRequestFullscreen = vi.fn().mockResolvedValue(undefined);
      document.documentElement.requestFullscreen = mockRequestFullscreen;

      const result = await requestFullscreen();

      expect(mockRequestFullscreen).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should handle fullscreen errors', async () => {
      document.documentElement.requestFullscreen = vi.fn().mockRejectedValue(new Error('Denied'));

      const result = await requestFullscreen();

      expect(result).toBe(false);
    });
  });

  describe('exitFullscreen', () => {
    it('should attempt to exit fullscreen', async () => {
      const mockExitFullscreen = vi.fn().mockResolvedValue(undefined);
      document.exitFullscreen = mockExitFullscreen;

      const result = await exitFullscreen();

      expect(mockExitFullscreen).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should handle exit fullscreen errors', async () => {
      document.exitFullscreen = vi.fn().mockRejectedValue(new Error('Failed'));

      const result = await exitFullscreen();

      expect(result).toBe(false);
    });
  });
});
