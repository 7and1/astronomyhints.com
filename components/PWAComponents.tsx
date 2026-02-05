'use client';

import { useState, useEffect, memo } from 'react';
import { usePWA } from '@/lib/usePWA';
import { useDevice } from '@/lib/DeviceContext';
import { Download, X, Wifi, WifiOff } from 'lucide-react';

/**
 * PWA Install Banner
 * Shows install prompt on supported devices
 */
function InstallBanner() {
  const { isInstallable, isInstalled, promptInstall } = usePWA();
  const { capabilities } = useDevice();
  const [dismissed, setDismissed] = useState(false);
  const [visible, setVisible] = useState(false);

  // Show banner after a delay if installable
  useEffect(() => {
    if (isInstallable && !isInstalled && !dismissed) {
      const timer = setTimeout(() => {
        setVisible(true);
      }, 5000); // Show after 5 seconds

      return () => clearTimeout(timer);
    }
  }, [isInstallable, isInstalled, dismissed]);

  // Check if user has previously dismissed
  useEffect(() => {
    const wasDismissed = localStorage.getItem('pwa-install-dismissed');
    if (wasDismissed) {
      const dismissedTime = parseInt(wasDismissed, 10);
      // Show again after 7 days
      if (Date.now() - dismissedTime < 7 * 24 * 60 * 60 * 1000) {
        setDismissed(true);
      }
    }
  }, []);

  const handleInstall = async () => {
    const installed = await promptInstall();
    if (installed) {
      setVisible(false);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    setVisible(false);
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  };

  if (!visible) return null;

  return (
    <div className={`install-banner ${visible ? 'visible' : ''}`} role="banner">
      <div className="install-banner-content">
        <div className="install-banner-title">Install Orbit Command</div>
        <div className="install-banner-text">
          {capabilities.isMobile
            ? 'Add to your home screen for the best experience'
            : 'Install for offline access and faster loading'}
        </div>
      </div>
      <div className="install-banner-actions">
        <button
          type="button"
          className="ui-icon-btn"
          onClick={handleDismiss}
          aria-label="Dismiss install prompt"
        >
          <X className="size-5" />
        </button>
        <button
          type="button"
          className="ui-btn ui-btn-primary"
          onClick={handleInstall}
        >
          <Download className="size-4" />
          Install
        </button>
      </div>
    </div>
  );
}

/**
 * Offline Indicator
 * Shows when the user is offline
 */
function OfflineIndicator() {
  const { isOnline } = usePWA();
  const [showIndicator, setShowIndicator] = useState(false);

  useEffect(() => {
    if (!isOnline) {
      setShowIndicator(true);
    } else {
      // Hide after a short delay when coming back online
      const timer = setTimeout(() => {
        setShowIndicator(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isOnline]);

  return (
    <div
      className={`offline-indicator ${showIndicator ? 'visible' : ''}`}
      role="status"
      aria-live="polite"
    >
      {isOnline ? (
        <>
          <Wifi className="inline size-4 mr-2" />
          Back online
        </>
      ) : (
        <>
          <WifiOff className="inline size-4 mr-2" />
          You are offline. Some features may be unavailable.
        </>
      )}
    </div>
  );
}

/**
 * Update Available Banner
 * Shows when a new version is available
 */
function UpdateBanner() {
  const { isUpdateAvailable, applyUpdate } = usePWA();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isUpdateAvailable) {
      setVisible(true);
    }
  }, [isUpdateAvailable]);

  if (!visible) return null;

  return (
    <div
      className="fixed top-4 left-4 right-4 z-[100] md:left-auto md:right-4 md:w-80"
      role="alert"
    >
      <div className="ui-panel ui-panel-strong p-4">
        <div className="flex items-start gap-3">
          <div className="flex-1">
            <div className="font-semibold text-white">Update Available</div>
            <div className="text-sm text-white/70 mt-1">
              A new version of Orbit Command is ready.
            </div>
          </div>
          <button
            type="button"
            className="ui-icon-btn size-8"
            onClick={() => setVisible(false)}
            aria-label="Dismiss"
          >
            <X className="size-4" />
          </button>
        </div>
        <div className="flex gap-2 mt-3">
          <button
            type="button"
            className="ui-btn flex-1"
            onClick={() => setVisible(false)}
          >
            Later
          </button>
          <button
            type="button"
            className="ui-btn ui-btn-primary flex-1"
            onClick={applyUpdate}
          >
            Update Now
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Combined PWA UI Components
 */
function PWAComponents() {
  return (
    <>
      <OfflineIndicator />
      <InstallBanner />
      <UpdateBanner />
    </>
  );
}

export default memo(PWAComponents);
export { InstallBanner, OfflineIndicator, UpdateBanner };
