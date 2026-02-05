/**
 * Mobile Detection and Optimization Utilities
 * Provides device detection, performance profiling, and adaptive settings
 */

export interface DeviceCapabilities {
  isMobile: boolean;
  isTablet: boolean;
  isTouch: boolean;
  hasGyroscope: boolean;
  hasVibration: boolean;
  pixelRatio: number;
  screenWidth: number;
  screenHeight: number;
  isLowEndDevice: boolean;
  connectionType: 'slow-2g' | '2g' | '3g' | '4g' | 'wifi' | 'unknown';
  saveData: boolean;
  reducedMotion: boolean;
  supportsWebGL2: boolean;
  maxTextureSize: number;
  gpuTier: 'low' | 'medium' | 'high';
}

export interface MobileSettings {
  particleCount: number;
  starCount: number;
  sphereSegments: number;
  enableBloom: boolean;
  enableShadows: boolean;
  dpr: [number, number];
  antialias: boolean;
  shaderQuality: 'low' | 'medium' | 'high';
  touchSensitivity: number;
  enableHaptics: boolean;
}

// Singleton for device capabilities
let cachedCapabilities: DeviceCapabilities | null = null;

/**
 * Detect device capabilities
 */
export function detectDeviceCapabilities(): DeviceCapabilities {
  if (cachedCapabilities && typeof window !== 'undefined') {
    return cachedCapabilities;
  }

  if (typeof window === 'undefined') {
    // SSR fallback
    return {
      isMobile: false,
      isTablet: false,
      isTouch: false,
      hasGyroscope: false,
      hasVibration: false,
      pixelRatio: 1,
      screenWidth: 1920,
      screenHeight: 1080,
      isLowEndDevice: false,
      connectionType: 'unknown',
      saveData: false,
      reducedMotion: false,
      supportsWebGL2: true,
      maxTextureSize: 4096,
      gpuTier: 'high',
    };
  }

  const ua = navigator.userAgent.toLowerCase();
  const isMobile = /android|webos|iphone|ipod|blackberry|iemobile|opera mini/i.test(ua);
  const isTablet = /ipad|android(?!.*mobile)/i.test(ua) ||
    (navigator.maxTouchPoints > 0 && window.innerWidth >= 768 && window.innerWidth <= 1024);
  const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  // Check for gyroscope
  const hasGyroscope = 'DeviceOrientationEvent' in window;

  // Check for vibration API
  const hasVibration = 'vibrate' in navigator;

  // Get connection info
  const connection = (navigator as Navigator & { connection?: NetworkInformation }).connection;
  let connectionType: DeviceCapabilities['connectionType'] = 'unknown';
  let saveData = false;

  if (connection) {
    const effectiveType = connection.effectiveType;
    if (effectiveType === 'slow-2g' || effectiveType === '2g') {
      connectionType = effectiveType;
    } else if (effectiveType === '3g') {
      connectionType = '3g';
    } else if (effectiveType === '4g') {
      connectionType = connection.downlink && connection.downlink > 10 ? 'wifi' : '4g';
    }
    saveData = connection.saveData || false;
  }

  // Check reduced motion preference
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // WebGL capabilities
  let supportsWebGL2 = false;
  let maxTextureSize = 2048;
  let gpuTier: DeviceCapabilities['gpuTier'] = 'medium';

  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');

    if (gl) {
      supportsWebGL2 = !!canvas.getContext('webgl2');
      maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE) || 2048;

      // Estimate GPU tier based on max texture size and other factors
      const renderer = gl.getParameter(gl.RENDERER) || '';
      const isIntegrated = /intel|mali|adreno 3|adreno 4|powervr/i.test(renderer);
      const isHighEnd = /nvidia|radeon|adreno 6|adreno 7|apple gpu/i.test(renderer);

      if (maxTextureSize >= 8192 && isHighEnd) {
        gpuTier = 'high';
      } else if (maxTextureSize >= 4096 && !isIntegrated) {
        gpuTier = 'medium';
      } else {
        gpuTier = 'low';
      }
    }
  } catch {
    // WebGL not available
  }

  // Determine if low-end device
  // Note: deviceMemory is not in standard Navigator type but exists in Chrome
  const navWithMemory = navigator as Navigator & { deviceMemory?: number };
  const isLowEndDevice =
    (isMobile && gpuTier === 'low') ||
    (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4) ||
    (navWithMemory.deviceMemory && navWithMemory.deviceMemory <= 4) ||
    connectionType === 'slow-2g' || connectionType === '2g';

  cachedCapabilities = {
    isMobile,
    isTablet,
    isTouch,
    hasGyroscope,
    hasVibration,
    pixelRatio: Math.min(window.devicePixelRatio || 1, 3),
    screenWidth: window.screen.width,
    screenHeight: window.screen.height,
    isLowEndDevice,
    connectionType,
    saveData,
    reducedMotion,
    supportsWebGL2,
    maxTextureSize,
    gpuTier,
  };

  return cachedCapabilities;
}

/**
 * Get optimized settings based on device capabilities
 */
export function getMobileSettings(capabilities?: DeviceCapabilities): MobileSettings {
  const caps = capabilities || detectDeviceCapabilities();

  // Low-end mobile or slow connection
  if (caps.isLowEndDevice || caps.saveData || caps.connectionType === 'slow-2g' || caps.connectionType === '2g') {
    return {
      particleCount: 500,
      starCount: 1000,
      sphereSegments: 12,
      enableBloom: false,
      enableShadows: false,
      dpr: [1, 1],
      antialias: false,
      shaderQuality: 'low',
      touchSensitivity: 1.5,
      enableHaptics: caps.hasVibration,
    };
  }

  // Standard mobile
  if (caps.isMobile) {
    return {
      particleCount: 1000,
      starCount: 2000,
      sphereSegments: 16,
      enableBloom: caps.gpuTier !== 'low',
      enableShadows: false,
      dpr: [1, Math.min(caps.pixelRatio, 1.5)],
      antialias: caps.gpuTier !== 'low',
      shaderQuality: caps.gpuTier === 'low' ? 'low' : 'medium',
      touchSensitivity: 1.2,
      enableHaptics: caps.hasVibration,
    };
  }

  // Tablet
  if (caps.isTablet) {
    return {
      particleCount: 2000,
      starCount: 3000,
      sphereSegments: 24,
      enableBloom: true,
      enableShadows: false,
      dpr: [1, Math.min(caps.pixelRatio, 2)],
      antialias: true,
      shaderQuality: 'medium',
      touchSensitivity: 1.0,
      enableHaptics: caps.hasVibration,
    };
  }

  // Desktop (default)
  return {
    particleCount: 5000,
    starCount: 6000,
    sphereSegments: 32,
    enableBloom: true,
    enableShadows: true,
    dpr: [1, Math.min(caps.pixelRatio, 2)],
    antialias: true,
    shaderQuality: 'high',
    touchSensitivity: 1.0,
    enableHaptics: false,
  };
}

/**
 * Trigger haptic feedback
 */
export function triggerHaptic(type: 'light' | 'medium' | 'heavy' = 'light'): void {
  if (typeof navigator === 'undefined' || !navigator.vibrate) return;

  const patterns: Record<string, number | number[]> = {
    light: 10,
    medium: 25,
    heavy: [50, 30, 50],
  };

  try {
    navigator.vibrate(patterns[type]);
  } catch {
    // Vibration not supported or blocked
  }
}

/**
 * Request screen wake lock to prevent sleep during use
 */
export async function requestWakeLock(): Promise<WakeLockSentinel | null> {
  if (typeof navigator === 'undefined' || !('wakeLock' in navigator)) {
    return null;
  }

  try {
    const wakeLock = await navigator.wakeLock.request('screen');
    return wakeLock;
  } catch {
    // Wake lock not available or denied
    return null;
  }
}

/**
 * Request fullscreen mode
 */
export async function requestFullscreen(element?: HTMLElement): Promise<boolean> {
  const el = element || document.documentElement;

  try {
    if (el.requestFullscreen) {
      await el.requestFullscreen();
      return true;
    }
    // Webkit prefix for older Safari
    const webkitEl = el as HTMLElement & { webkitRequestFullscreen?: () => Promise<void> };
    if (webkitEl.webkitRequestFullscreen) {
      await webkitEl.webkitRequestFullscreen();
      return true;
    }
  } catch {
    // Fullscreen not available or denied
  }

  return false;
}

/**
 * Exit fullscreen mode
 */
export async function exitFullscreen(): Promise<boolean> {
  try {
    if (document.exitFullscreen) {
      await document.exitFullscreen();
      return true;
    }
    const webkitDoc = document as Document & { webkitExitFullscreen?: () => Promise<void> };
    if (webkitDoc.webkitExitFullscreen) {
      await webkitDoc.webkitExitFullscreen();
      return true;
    }
  } catch {
    // Exit fullscreen failed
  }

  return false;
}

/**
 * Check if currently in fullscreen
 */
export function isFullscreen(): boolean {
  if (typeof document === 'undefined') return false;

  const webkitDoc = document as Document & { webkitFullscreenElement?: Element };
  return !!(document.fullscreenElement || webkitDoc.webkitFullscreenElement);
}

/**
 * Share content using Web Share API
 */
export async function shareContent(data: {
  title?: string;
  text?: string;
  url?: string;
}): Promise<boolean> {
  if (typeof navigator === 'undefined' || !navigator.share) {
    return false;
  }

  try {
    await navigator.share(data);
    return true;
  } catch (error) {
    // Share cancelled or failed
    if ((error as Error).name !== 'AbortError') {
      console.warn('Share failed:', error);
    }
    return false;
  }
}

/**
 * Check if Web Share API is available
 */
export function canShare(): boolean {
  return typeof navigator !== 'undefined' && 'share' in navigator;
}

// Type definitions for Network Information API
interface NetworkInformation {
  effectiveType?: 'slow-2g' | '2g' | '3g' | '4g';
  downlink?: number;
  saveData?: boolean;
}

// Type definitions for Wake Lock API
interface WakeLockSentinel {
  released: boolean;
  type: 'screen';
  release(): Promise<void>;
}
