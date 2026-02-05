'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const acceptButtonRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      const timer = setTimeout(() => {
        previousFocusRef.current = document.activeElement as HTMLElement;
        setShowBanner(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  // Focus management when banner opens
  useEffect(() => {
    if (showBanner) {
      acceptButtonRef.current?.focus();
    }
  }, [showBanner]);

  // Focus trap within dialog
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      handleReject();
      return;
    }

    if (event.key !== 'Tab') return;

    const dialog = dialogRef.current;
    if (!dialog) return;

    const focusableElements = dialog.querySelectorAll<HTMLElement>(
      'button, a[href], [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (event.shiftKey && document.activeElement === firstElement) {
      event.preventDefault();
      lastElement?.focus();
    } else if (!event.shiftKey && document.activeElement === lastElement) {
      event.preventDefault();
      firstElement?.focus();
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie-consent', 'accepted');
    setShowBanner(false);
    previousFocusRef.current?.focus();
  };

  const handleReject = () => {
    localStorage.setItem('cookie-consent', 'rejected');
    setShowBanner(false);
    previousFocusRef.current?.focus();
  };

  if (!showBanner) return null;

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-labelledby="cookie-title"
      aria-describedby="cookie-description"
      aria-modal="true"
      onKeyDown={handleKeyDown}
      className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-50 bg-gray-900 border border-white/10 rounded-xl shadow-2xl p-6 animate-in slide-in-from-bottom-4 duration-500"
    >
      <h2 id="cookie-title" className="text-lg font-semibold text-white mb-2">
        Cookie Preferences
      </h2>
      <p id="cookie-description" className="text-sm text-white/70 mb-4">
        We use essential cookies to make Orbit Command work. We also use analytics cookies to
        understand how visitors interact with our solar system explorer, helping us improve
        the experience. You can choose to accept all cookies or only essential ones.
      </p>
      <div className="flex flex-col sm:flex-row gap-3" role="group" aria-label="Cookie consent options">
        <button
          onClick={handleReject}
          className="flex-1 px-4 py-2.5 text-sm font-medium text-white/80 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900"
        >
          Essential Only
        </button>
        <button
          ref={acceptButtonRef}
          onClick={handleAccept}
          className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900"
        >
          Accept All
        </button>
      </div>
      <p className="text-xs text-white/50 mt-3">
        By clicking &quot;Accept All&quot;, you consent to analytics cookies. See our{' '}
        <a
          href="https://astronomyhints.com/privacy"
          className="underline hover:text-white/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60"
        >
          Privacy Policy
        </a>{' '}
        for details.
      </p>
    </div>
  );
}
