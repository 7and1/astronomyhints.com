'use client';

import { ReactNode, useEffect } from 'react';
import { DeviceProvider } from '@/lib/DeviceContext';
import { usePWA } from '@/lib/usePWA';
import PWAComponents from './PWAComponents';

/**
 * PWA Manager Component
 * Handles service worker registration and update notifications
 */
function PWAManager() {
  const { isUpdateAvailable, isOnline } = usePWA();

  // Show update notification when available
  useEffect(() => {
    if (isUpdateAvailable) {
      // Could show a toast notification here
      console.log('[PWA] Update available. Refresh to update.');
    }
  }, [isUpdateAvailable]);

  // Log online/offline status changes
  useEffect(() => {
    if (!isOnline) {
      console.log('[PWA] You are offline. Some features may be unavailable.');
    }
  }, [isOnline]);

  return <PWAComponents />;
}

/**
 * App Providers
 * Wraps the application with necessary context providers
 */
export default function Providers({ children }: { children: ReactNode }) {
  return (
    <DeviceProvider>
      <PWAManager />
      {children}
    </DeviceProvider>
  );
}
