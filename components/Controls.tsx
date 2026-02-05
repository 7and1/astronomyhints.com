'use client';

import { useStore } from '@/store/useStore';
import { Play, Pause, Camera, Share2, Eye, EyeOff, RotateCcw } from 'lucide-react';
import { useState } from 'react';

export default function Controls() {
  const timeSpeed = useStore((state) => state.timeSpeed);
  const setTimeSpeed = useStore((state) => state.setTimeSpeed);
  const cinematicMode = useStore((state) => state.cinematicMode);
  const toggleCinematicMode = useStore((state) => state.toggleCinematicMode);
  const showHUD = useStore((state) => state.showHUD);
  const toggleHUD = useStore((state) => state.toggleHUD);
  const setCurrentDate = useStore((state) => state.setCurrentDate);
  const selectedPlanet = useStore((state) => state.selectedPlanet);

  const [showShareModal, setShowShareModal] = useState(false);

  const handleTimeSpeedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTimeSpeed(parseFloat(e.target.value));
  };

  const handleResetTime = () => {
    setCurrentDate(new Date());
    setTimeSpeed(1);
  };

  const handleSnapshot = async () => {
    // Create canvas snapshot
    const canvas = document.querySelector('canvas');
    if (!canvas) return;

    try {
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `orbit-command-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Failed to capture snapshot:', error);
    }
  };

  const handleShare = () => {
    setShowShareModal(true);
  };

  const speedLabels: Record<number, string> = {
    0: 'PAUSED',
    0.1: '0.1x',
    0.5: '0.5x',
    1: '1x',
    5: '5x',
    10: '10x',
    50: '50x',
    100: '100x',
  };

  return (
    <>
      {/* Main Control Panel */}
      <div className="absolute bottom-6 right-6 pointer-events-auto">
        <div className="bg-black/80 backdrop-blur-sm border border-cyber-blue/50 rounded-lg p-4 space-y-4">
          {/* Time Control */}
          <div className="space-y-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono text-gray-400">TIME SPEED</span>
              <span className="text-sm font-mono text-cyber-blue text-glow">
                {speedLabels[timeSpeed] || `${timeSpeed}x`}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="0.1"
              value={timeSpeed}
              onChange={handleTimeSpeedChange}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
              style={{
                background: `linear-gradient(to right, #00f3ff 0%, #00f3ff ${(timeSpeed / 100) * 100}%, #374151 ${(timeSpeed / 100) * 100}%, #374151 100%)`,
              }}
            />
            <div className="flex gap-2">
              <button
                onClick={() => setTimeSpeed(timeSpeed === 0 ? 1 : 0)}
                className="flex-1 bg-cyber-blue/20 hover:bg-cyber-blue/30 border border-cyber-blue/50 text-cyber-blue font-mono text-xs py-2 px-3 rounded transition-colors flex items-center justify-center gap-2"
              >
                {timeSpeed === 0 ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                {timeSpeed === 0 ? 'PLAY' : 'PAUSE'}
              </button>
              <button
                onClick={handleResetTime}
                className="bg-cyber-purple/20 hover:bg-cyber-purple/30 border border-cyber-purple/50 text-cyber-purple font-mono text-xs py-2 px-3 rounded transition-colors"
                title="Reset to current date"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-gray-700"></div>

          {/* View Controls */}
          <div className="space-y-2">
            <button
              onClick={toggleCinematicMode}
              className={`w-full font-mono text-xs py-2 px-3 rounded transition-colors flex items-center justify-center gap-2 ${
                cinematicMode
                  ? 'bg-cyber-green/30 border border-cyber-green text-cyber-green'
                  : 'bg-cyber-green/20 hover:bg-cyber-green/30 border border-cyber-green/50 text-cyber-green'
              }`}
            >
              <Camera className="w-4 h-4" />
              {cinematicMode ? 'CINEMATIC ON' : 'CINEMATIC OFF'}
            </button>

            <button
              onClick={toggleHUD}
              className={`w-full font-mono text-xs py-2 px-3 rounded transition-colors flex items-center justify-center gap-2 ${
                showHUD
                  ? 'bg-cyber-purple/30 border border-cyber-purple text-cyber-purple'
                  : 'bg-cyber-purple/20 hover:bg-cyber-purple/30 border border-cyber-purple/50 text-cyber-purple'
              }`}
            >
              {showHUD ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              {showHUD ? 'HUD ON' : 'HUD OFF'}
            </button>
          </div>

          {/* Divider */}
          <div className="h-px bg-gray-700"></div>

          {/* Action Buttons */}
          <div className="space-y-2">
            <button
              onClick={handleSnapshot}
              className="w-full bg-cyber-pink/20 hover:bg-cyber-pink/30 border border-cyber-pink/50 text-cyber-pink font-mono text-xs py-2 px-3 rounded transition-colors flex items-center justify-center gap-2"
            >
              <Camera className="w-4 h-4" />
              SNAPSHOT
            </button>

            <button
              onClick={handleShare}
              className="w-full bg-gradient-to-r from-cyber-blue to-cyber-purple hover:shadow-lg hover:shadow-cyber-blue/50 text-white font-mono text-xs py-2 px-3 rounded transition-all flex items-center justify-center gap-2"
            >
              <Share2 className="w-4 h-4" />
              SHARE
            </button>
          </div>
        </div>
      </div>

      {/* Logo/Branding */}
      {!selectedPlanet && (
        <div className="absolute top-6 left-6 pointer-events-auto">
          <div className="bg-black/80 backdrop-blur-sm border border-cyber-blue/50 rounded-lg p-4">
            <div className="text-2xl font-mono text-cyber-blue text-glow mb-1" role="banner" aria-label="Orbit Command">
              ORBIT COMMAND
            </div>
            <p className="text-xs text-gray-400 font-mono">
              Real-time Solar System Dashboard
            </p>
          </div>
        </div>
      )}

      {/* Instructions */}
      {!selectedPlanet && (
        <div className="absolute top-24 left-6 pointer-events-auto">
          <div className="bg-black/80 backdrop-blur-sm border border-cyber-green/50 rounded-lg p-4 max-w-xs">
            <h3 className="text-sm font-mono text-cyber-green mb-2">INSTRUCTIONS</h3>
            <ul className="text-xs text-gray-300 font-mono space-y-1">
              <li>▸ Click planets to view details</li>
              <li>▸ Drag to rotate view</li>
              <li>▸ Scroll to zoom in/out</li>
              <li>▸ Adjust time speed slider</li>
            </ul>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && (
        <div className="absolute inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center pointer-events-auto z-50">
          <div className="bg-black border-2 border-cyber-blue rounded-lg p-8 max-w-md w-full mx-4">
            <h2 className="text-2xl font-mono text-cyber-blue text-glow mb-4">
              SHARE ORBIT COMMAND
            </h2>
            <p className="text-sm text-gray-300 font-mono mb-6">
              Share this amazing 3D solar system visualization with your friends!
            </p>
            <div className="space-y-3 mb-6">
              <button
                onClick={() => {
                  window.open(
                    `https://twitter.com/intent/tweet?text=Check out this amazing 3D Solar System visualization! 🚀&url=${encodeURIComponent(window.location.href)}`,
                    '_blank'
                  );
                }}
                className="w-full bg-[#1DA1F2] hover:bg-[#1a8cd8] text-white font-mono text-sm py-3 px-4 rounded transition-colors"
              >
                Share on Twitter
              </button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  alert('Link copied to clipboard!');
                }}
                className="w-full bg-cyber-purple/20 hover:bg-cyber-purple/30 border border-cyber-purple text-cyber-purple font-mono text-sm py-3 px-4 rounded transition-colors"
              >
                Copy Link
              </button>
            </div>
            <button
              onClick={() => setShowShareModal(false)}
              className="w-full bg-gray-700 hover:bg-gray-600 text-white font-mono text-sm py-2 px-4 rounded transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
