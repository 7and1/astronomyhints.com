/**
 * DeviceContext Tests
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { DeviceProvider, useDevice } from '../DeviceContext';

// Mock mobile module
vi.mock('../mobile', () => ({
  detectDeviceCapabilities: vi.fn(() => ({
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
  })),
  getMobileSettings: vi.fn(() => ({
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
  })),
}));

describe('DeviceContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // Test component that uses the context
  function TestConsumer() {
    const { capabilities, settings, isLoading } = useDevice();
    return (
      <div>
        <span data-testid="loading">{isLoading ? 'loading' : 'loaded'}</span>
        <span data-testid="is-mobile">{capabilities.isMobile ? 'yes' : 'no'}</span>
        <span data-testid="particle-count">{settings.particleCount}</span>
      </div>
    );
  }

  describe('DeviceProvider', () => {
    it('should provide device context to children', async () => {
      render(
        <DeviceProvider>
          <TestConsumer />
        </DeviceProvider>
      );

      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('loaded');
      });
    });

    it('should detect device capabilities', async () => {
      render(
        <DeviceProvider>
          <TestConsumer />
        </DeviceProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('loaded');
      });

      expect(screen.getByTestId('is-mobile')).toHaveTextContent('no');
    });

    it('should provide mobile settings', async () => {
      render(
        <DeviceProvider>
          <TestConsumer />
        </DeviceProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('loaded');
      });

      expect(screen.getByTestId('particle-count')).toHaveTextContent('5000');
    });
  });

  describe('useDevice hook', () => {
    it('should return device context', async () => {
      let contextValue: ReturnType<typeof useDevice> | null = null;

      function ContextCapture() {
        contextValue = useDevice();
        return null;
      }

      render(
        <DeviceProvider>
          <ContextCapture />
        </DeviceProvider>
      );

      await waitFor(() => {
        expect(contextValue?.isLoading).toBe(false);
      });

      expect(contextValue?.capabilities).toBeDefined();
      expect(contextValue?.settings).toBeDefined();
      expect(contextValue?.updateSettings).toBeDefined();
    });
  });
});
