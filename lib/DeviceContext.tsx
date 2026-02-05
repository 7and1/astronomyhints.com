/**
 * Device Context Provider
 * Provides device capabilities and mobile settings throughout the app
 */

'use client';

import React, { createContext, useContext, useEffect, useState, useMemo, ReactNode } from 'react';
import {
  DeviceCapabilities,
  MobileSettings,
  detectDeviceCapabilities,
  getMobileSettings,
} from './mobile';

interface DeviceContextValue {
  capabilities: DeviceCapabilities;
  settings: MobileSettings;
  isLoading: boolean;
  updateSettings: (partial: Partial<MobileSettings>) => void;
}

const defaultCapabilities: DeviceCapabilities = {
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

const defaultSettings: MobileSettings = {
  particleCount: 5000,
  starCount: 6000,
  sphereSegments: 32,
  enableBloom: true,
  enableShadows: true,
  dpr: [1, 2],
  antialias: true,
  shaderQuality: 'high',
  touchSensitivity: 1.0,
  enableHaptics: false,
};

const DeviceContext = createContext<DeviceContextValue>({
  capabilities: defaultCapabilities,
  settings: defaultSettings,
  isLoading: true,
  updateSettings: () => {},
});

export function DeviceProvider({ children }: { children: ReactNode }) {
  const [capabilities, setCapabilities] = useState<DeviceCapabilities>(defaultCapabilities);
  const [settings, setSettings] = useState<MobileSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);

  // Detect device capabilities on mount
  useEffect(() => {
    const caps = detectDeviceCapabilities();
    const mobileSettings = getMobileSettings(caps);

    setCapabilities(caps);
    setSettings(mobileSettings);
    setIsLoading(false);

    // Log device info in development
    if (process.env.NODE_ENV === 'development') {
      console.log('[Device] Capabilities:', caps);
      console.log('[Device] Settings:', mobileSettings);
    }
  }, []);

  // Listen for connection changes
  useEffect(() => {
    if (typeof navigator === 'undefined') return;

    const connection = (navigator as Navigator & { connection?: { addEventListener: (type: string, listener: () => void) => void; removeEventListener: (type: string, listener: () => void) => void } }).connection;
    if (!connection) return;

    const handleConnectionChange = () => {
      const caps = detectDeviceCapabilities();
      const mobileSettings = getMobileSettings(caps);
      setCapabilities(caps);
      setSettings(mobileSettings);
    };

    connection.addEventListener('change', handleConnectionChange);
    return () => connection.removeEventListener('change', handleConnectionChange);
  }, []);

  // Listen for orientation changes
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleOrientationChange = () => {
      // Re-detect capabilities on orientation change
      const caps = detectDeviceCapabilities();
      setCapabilities(caps);
    };

    window.addEventListener('orientationchange', handleOrientationChange);
    window.addEventListener('resize', handleOrientationChange);

    return () => {
      window.removeEventListener('orientationchange', handleOrientationChange);
      window.removeEventListener('resize', handleOrientationChange);
    };
  }, []);

  const updateSettings = useMemo(
    () => (partial: Partial<MobileSettings>) => {
      setSettings((prev) => ({ ...prev, ...partial }));
    },
    []
  );

  const value = useMemo(
    () => ({
      capabilities,
      settings,
      isLoading,
      updateSettings,
    }),
    [capabilities, settings, isLoading, updateSettings]
  );

  return <DeviceContext.Provider value={value}>{children}</DeviceContext.Provider>;
}

export function useDevice() {
  return useContext(DeviceContext);
}

export default DeviceContext;
