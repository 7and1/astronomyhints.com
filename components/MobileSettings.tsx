'use client';

import { memo, useState } from 'react';
import { useDevice } from '@/lib/DeviceContext';
import { useOrbitStore } from '@/lib/store';
import { usePWA } from '@/lib/usePWA';
import {
  requestFullscreen,
  exitFullscreen,
  isFullscreen,
  requestWakeLock,
  shareContent,
  canShare,
} from '@/lib/mobile';
import {
  X,
  Maximize,
  Minimize,
  Share2,
  Moon,
  Zap,
  Smartphone,
  Monitor,
  Trash2,
  RefreshCw,
} from 'lucide-react';

interface MobileSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

function MobileSettings({ isOpen, onClose }: MobileSettingsProps) {
  const { capabilities, settings, updateSettings } = useDevice();
  const { clearCache } = usePWA();
  const setRenderQuality = useOrbitStore((s) => s.setRenderQuality);
  const renderQuality = useOrbitStore((s) => s.renderQuality);

  const [isFullscreenMode, setIsFullscreenMode] = useState(isFullscreen());
  const [wakeLockActive, setWakeLockActive] = useState(false);

  if (!isOpen) return null;

  const handleFullscreen = async () => {
    if (isFullscreenMode) {
      await exitFullscreen();
      setIsFullscreenMode(false);
    } else {
      const success = await requestFullscreen();
      setIsFullscreenMode(success);
    }
  };

  const handleWakeLock = async () => {
    if (!wakeLockActive) {
      const lock = await requestWakeLock();
      setWakeLockActive(!!lock);
    }
  };

  const handleShare = async () => {
    await shareContent({
      title: 'Orbit Command - 3D Solar System Simulator',
      text: 'Explore the solar system in stunning 3D with real-time planetary positions!',
      url: window.location.href,
    });
  };

  const handleClearCache = async () => {
    await clearCache();
    window.location.reload();
  };

  const handleQualityChange = (quality: 'low' | 'balanced' | 'high') => {
    setRenderQuality(quality);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm hud-backdrop"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div className="relative w-full max-w-lg bg-black/90 border-t border-white/10 rounded-t-2xl md:rounded-2xl md:border md:m-4 hud-dialog safe-area-bottom">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h2 className="text-lg font-semibold">Settings</h2>
          <button
            type="button"
            className="ui-icon-btn"
            onClick={onClose}
            aria-label="Close settings"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Device Info */}
          <section>
            <h3 className="text-sm font-medium text-white/60 mb-3 flex items-center gap-2">
              {capabilities.isMobile ? <Smartphone className="size-4" /> : <Monitor className="size-4" />}
              Device
            </h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="bg-white/5 rounded-lg p-3">
                <div className="text-white/50 text-xs">Type</div>
                <div className="text-white">
                  {capabilities.isMobile ? 'Mobile' : capabilities.isTablet ? 'Tablet' : 'Desktop'}
                </div>
              </div>
              <div className="bg-white/5 rounded-lg p-3">
                <div className="text-white/50 text-xs">GPU</div>
                <div className="text-white capitalize">{capabilities.gpuTier}</div>
              </div>
              <div className="bg-white/5 rounded-lg p-3">
                <div className="text-white/50 text-xs">Connection</div>
                <div className="text-white capitalize">{capabilities.connectionType}</div>
              </div>
              <div className="bg-white/5 rounded-lg p-3">
                <div className="text-white/50 text-xs">Pixel Ratio</div>
                <div className="text-white">{capabilities.pixelRatio.toFixed(1)}x</div>
              </div>
            </div>
          </section>

          {/* Performance */}
          <section>
            <h3 className="text-sm font-medium text-white/60 mb-3 flex items-center gap-2">
              <Zap className="size-4" />
              Performance
            </h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-white/80 mb-2 block">Render Quality</label>
                <div className="flex gap-2">
                  {(['low', 'balanced', 'high'] as const).map((quality) => (
                    <button
                      key={quality}
                      type="button"
                      className="ui-btn flex-1 capitalize"
                      data-active={renderQuality === quality}
                      onClick={() => handleQualityChange(quality)}
                    >
                      {quality}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-white/5 rounded-lg p-3">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-sm text-white">Current Settings</div>
                    <div className="text-xs text-white/50 mt-1">
                      Stars: {settings.starCount} | Bloom: {settings.enableBloom ? 'On' : 'Off'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Display */}
          <section>
            <h3 className="text-sm font-medium text-white/60 mb-3 flex items-center gap-2">
              <Moon className="size-4" />
              Display
            </h3>
            <div className="space-y-2">
              <button
                type="button"
                className="ui-btn w-full justify-start"
                onClick={handleFullscreen}
              >
                {isFullscreenMode ? (
                  <>
                    <Minimize className="size-4" />
                    Exit Fullscreen
                  </>
                ) : (
                  <>
                    <Maximize className="size-4" />
                    Enter Fullscreen
                  </>
                )}
              </button>

              <button
                type="button"
                className="ui-btn w-full justify-start"
                onClick={handleWakeLock}
                disabled={wakeLockActive}
              >
                <Moon className="size-4" />
                {wakeLockActive ? 'Screen Wake Lock Active' : 'Keep Screen On'}
              </button>
            </div>
          </section>

          {/* Share */}
          {canShare() && (
            <section>
              <h3 className="text-sm font-medium text-white/60 mb-3 flex items-center gap-2">
                <Share2 className="size-4" />
                Share
              </h3>
              <button
                type="button"
                className="ui-btn ui-btn-primary w-full"
                onClick={handleShare}
              >
                <Share2 className="size-4" />
                Share Orbit Command
              </button>
            </section>
          )}

          {/* Cache */}
          <section>
            <h3 className="text-sm font-medium text-white/60 mb-3 flex items-center gap-2">
              <RefreshCw className="size-4" />
              Data
            </h3>
            <button
              type="button"
              className="ui-btn w-full justify-start text-rose-300 border-rose-400/30 hover:bg-rose-500/10"
              onClick={handleClearCache}
            >
              <Trash2 className="size-4" />
              Clear Cache & Reload
            </button>
          </section>
        </div>
      </div>
    </div>
  );
}

export default memo(MobileSettings);
