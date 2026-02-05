'use client';

import { useEffect, useMemo, useRef } from 'react';
import { useOrbitStore } from '@/lib/store';
import { useShallow } from 'zustand/react/shallow';
import { Pause, Play, RotateCcw } from 'lucide-react';

const MAX_SPEED = 365;
const QUICK_SPEEDS = [0, 1, 30, 365];

export default function HUDTimePanel() {
  const { timeSpeed, currentDate, setTimeSpeed, setCurrentDate, updatePlanetPositions } = useOrbitStore(
    useShallow((s) => ({
      timeSpeed: s.timeSpeed,
      currentDate: s.currentDate,
      setTimeSpeed: s.setTimeSpeed,
      setCurrentDate: s.setCurrentDate,
      updatePlanetPositions: s.updatePlanetPositions,
    }))
  );

  const lastRunningSpeed = useRef<number>(30);

  useEffect(() => {
    if (timeSpeed > 0) lastRunningSpeed.current = timeSpeed;
  }, [timeSpeed]);

  const dateLabel = useMemo(() => {
    const formatter = new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    return formatter.format(currentDate);
  }, [currentDate]);

  const speedLabel =
    timeSpeed === 0
      ? 'Paused'
      : timeSpeed === 365
        ? '1 yr / sec'
        : `${timeSpeed} d / sec`;

  const speedLabelSR =
    timeSpeed === 0
      ? 'Paused'
      : timeSpeed === 365
        ? '1 year per second'
        : `${timeSpeed} days per second`;

  const togglePause = () => {
    setTimeSpeed(timeSpeed === 0 ? lastRunningSpeed.current : 0);
  };

  return (
    <section
      className="fixed bottom-4 left-4 z-20 md:bottom-6 md:left-6"
      aria-label="Time controls"
      role="region"
    >
      <div className="ui-panel ui-panel-strong w-[min(22rem,calc(100vw-2rem))] p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-xs font-mono text-white/50 tracking-wider" id="sim-time-label">
              SIM TIME
            </div>
            <div
              className="text-sm text-white/80"
              aria-labelledby="sim-time-label"
              aria-live="polite"
              aria-atomic="true"
            >
              {dateLabel}
            </div>
          </div>

          <div className="text-right">
            <div className="text-xs font-mono text-white/50 tracking-wider" id="speed-label">
              SPEED
            </div>
            <div
              className="text-sm font-mono text-cyan-200"
              aria-labelledby="speed-label"
              aria-live="polite"
              aria-atomic="true"
            >
              <span aria-hidden="true">{speedLabel}</span>
              <span className="sr-only">{speedLabelSR}</span>
            </div>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          <label className="sr-only" htmlFor="time-speed-slider">
            Time speed: {speedLabelSR}
          </label>
          <input
            id="time-speed-slider"
            type="range"
            min={0}
            max={MAX_SPEED}
            step={1}
            value={timeSpeed}
            onChange={(e) => setTimeSpeed(Number(e.target.value))}
            className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-white/10 accent-cyan-400"
            aria-valuemin={0}
            aria-valuemax={MAX_SPEED}
            aria-valuenow={timeSpeed}
            aria-valuetext={speedLabelSR}
          />

          <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Playback controls">
            <button
              type="button"
              className="ui-btn px-3 py-2"
              aria-label={timeSpeed === 0 ? 'Resume simulation' : 'Pause simulation'}
              aria-pressed={timeSpeed === 0}
              onClick={togglePause}
            >
              {timeSpeed === 0 ? <Play className="size-4" aria-hidden="true" /> : <Pause className="size-4" aria-hidden="true" />}
              {timeSpeed === 0 ? 'Resume' : 'Pause'}
            </button>

            <button
              type="button"
              className="ui-btn px-3 py-2"
              aria-label="Reset simulation date to current date and time"
              onClick={() => {
                setCurrentDate(new Date());
                updatePlanetPositions();
              }}
            >
              <RotateCcw className="size-4" aria-hidden="true" />
              Now
            </button>

            <div className="ml-auto flex items-center gap-1" role="group" aria-label="Quick speed presets">
              {QUICK_SPEEDS.map((speed) => (
                <button
                  key={speed}
                  type="button"
                  className="ui-btn px-3 py-2"
                  data-active={timeSpeed === speed}
                  aria-label={`Set speed to ${speed === 0 ? 'paused' : speed === 365 ? '365 days per second (1 year)' : `${speed} days per second`}`}
                  aria-pressed={timeSpeed === speed}
                  onClick={() => setTimeSpeed(speed)}
                >
                  <span className="font-mono text-xs" aria-hidden="true">
                    {speed === 0 ? '0' : speed === 365 ? '365' : speed}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-white/40" aria-hidden="true">
            <span className="font-mono">0 = pause</span>
            <span className="font-mono">{MAX_SPEED} = 1 year/sec</span>
          </div>
        </div>
      </div>
    </section>
  );
}
