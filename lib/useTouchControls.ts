/**
 * Touch Controls Hook
 * Provides touch-optimized controls for 3D scene interaction
 * Supports pinch-to-zoom, two-finger rotation, and swipe gestures
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { triggerHaptic } from './mobile';

export interface TouchState {
  isMultiTouch: boolean;
  touchCount: number;
  isPinching: boolean;
  isRotating: boolean;
  isSwiping: boolean;
  swipeDirection: 'left' | 'right' | 'up' | 'down' | null;
}

export interface TouchGesture {
  type: 'tap' | 'double-tap' | 'long-press' | 'pinch' | 'rotate' | 'swipe' | 'pan';
  delta?: { x: number; y: number };
  scale?: number;
  rotation?: number;
  velocity?: { x: number; y: number };
  center?: { x: number; y: number };
}

interface TouchPoint {
  id: number;
  x: number;
  y: number;
  startX: number;
  startY: number;
  timestamp: number;
}

interface UseTouchControlsOptions {
  onGesture?: (gesture: TouchGesture) => void;
  onTap?: (x: number, y: number) => void;
  onDoubleTap?: (x: number, y: number) => void;
  onLongPress?: (x: number, y: number) => void;
  onPinch?: (scale: number, center: { x: number; y: number }) => void;
  onRotate?: (rotation: number, center: { x: number; y: number }) => void;
  onSwipe?: (direction: 'left' | 'right' | 'up' | 'down', velocity: number) => void;
  onPan?: (delta: { x: number; y: number }) => void;
  sensitivity?: number;
  enableHaptics?: boolean;
  doubleTapDelay?: number;
  longPressDelay?: number;
  swipeThreshold?: number;
  swipeVelocityThreshold?: number;
}

export function useTouchControls(
  elementRef: React.RefObject<HTMLElement | null>,
  options: UseTouchControlsOptions = {}
) {
  const {
    onGesture,
    onTap,
    onDoubleTap,
    onLongPress,
    onPinch,
    onRotate,
    onSwipe,
    onPan,
    sensitivity = 1,
    enableHaptics = true,
    doubleTapDelay = 300,
    longPressDelay = 500,
    swipeThreshold = 50,
    swipeVelocityThreshold = 0.3,
  } = options;

  const [touchState, setTouchState] = useState<TouchState>({
    isMultiTouch: false,
    touchCount: 0,
    isPinching: false,
    isRotating: false,
    isSwiping: false,
    swipeDirection: null,
  });

  // Refs for tracking touch state
  const touchesRef = useRef<Map<number, TouchPoint>>(new Map());
  const lastTapRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const initialPinchDistanceRef = useRef<number>(0);
  const initialRotationRef = useRef<number>(0);
  const lastPinchScaleRef = useRef<number>(1);
  const lastRotationRef = useRef<number>(0);
  const gestureStartedRef = useRef<boolean>(false);

  // Calculate distance between two points
  const getDistance = useCallback((p1: TouchPoint, p2: TouchPoint): number => {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    return Math.sqrt(dx * dx + dy * dy);
  }, []);

  // Calculate angle between two points
  const getAngle = useCallback((p1: TouchPoint, p2: TouchPoint): number => {
    return Math.atan2(p2.y - p1.y, p2.x - p1.x) * (180 / Math.PI);
  }, []);

  // Calculate center point between two touches
  const getCenter = useCallback((p1: TouchPoint, p2: TouchPoint): { x: number; y: number } => {
    return {
      x: (p1.x + p2.x) / 2,
      y: (p1.y + p2.y) / 2,
    };
  }, []);

  // Clear long press timer
  const clearLongPressTimer = useCallback(() => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  }, []);

  // Handle touch start
  const handleTouchStart = useCallback(
    (e: TouchEvent) => {
      // Don't prevent default for single touch to allow scrolling in UI elements
      if (e.touches.length > 1) {
        e.preventDefault();
      }

      const now = Date.now();

      // Track all touches
      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        touchesRef.current.set(touch.identifier, {
          id: touch.identifier,
          x: touch.clientX,
          y: touch.clientY,
          startX: touch.clientX,
          startY: touch.clientY,
          timestamp: now,
        });
      }

      const touchCount = touchesRef.current.size;

      setTouchState((prev) => ({
        ...prev,
        touchCount,
        isMultiTouch: touchCount > 1,
      }));

      // Single touch - set up long press detection
      if (touchCount === 1) {
        const touch = e.touches[0];
        clearLongPressTimer();

        longPressTimerRef.current = setTimeout(() => {
          if (touchesRef.current.size === 1) {
            const currentTouch = touchesRef.current.values().next().value;
            if (currentTouch) {
              const dx = Math.abs(currentTouch.x - currentTouch.startX);
              const dy = Math.abs(currentTouch.y - currentTouch.startY);

              // Only trigger if finger hasn't moved much
              if (dx < 10 && dy < 10) {
                if (enableHaptics) triggerHaptic('medium');
                onLongPress?.(currentTouch.x, currentTouch.y);
                onGesture?.({ type: 'long-press', center: { x: currentTouch.x, y: currentTouch.y } });
              }
            }
          }
        }, longPressDelay);
      }

      // Two touches - initialize pinch/rotate
      if (touchCount === 2) {
        clearLongPressTimer();
        const touches = Array.from(touchesRef.current.values());
        initialPinchDistanceRef.current = getDistance(touches[0], touches[1]);
        initialRotationRef.current = getAngle(touches[0], touches[1]);
        lastPinchScaleRef.current = 1;
        lastRotationRef.current = 0;
        gestureStartedRef.current = false;

        setTouchState((prev) => ({
          ...prev,
          isPinching: true,
          isRotating: true,
        }));
      }
    },
    [clearLongPressTimer, enableHaptics, getAngle, getDistance, longPressDelay, onGesture, onLongPress]
  );

  // Handle touch move
  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (touchesRef.current.size > 1) {
        e.preventDefault();
      }

      // Update touch positions
      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        const existing = touchesRef.current.get(touch.identifier);
        if (existing) {
          existing.x = touch.clientX;
          existing.y = touch.clientY;
        }
      }

      const touchCount = touchesRef.current.size;

      // Single touch - pan
      if (touchCount === 1) {
        clearLongPressTimer();
        const touch = touchesRef.current.values().next().value;
        if (touch) {
          const dx = (touch.x - touch.startX) * sensitivity;
          const dy = (touch.y - touch.startY) * sensitivity;

          // Check for swipe
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance > swipeThreshold) {
            let direction: 'left' | 'right' | 'up' | 'down';
            if (Math.abs(dx) > Math.abs(dy)) {
              direction = dx > 0 ? 'right' : 'left';
            } else {
              direction = dy > 0 ? 'down' : 'up';
            }

            setTouchState((prev) => ({
              ...prev,
              isSwiping: true,
              swipeDirection: direction,
            }));
          }

          onPan?.({ x: dx, y: dy });
          onGesture?.({ type: 'pan', delta: { x: dx, y: dy } });
        }
      }

      // Two touches - pinch and rotate
      if (touchCount === 2) {
        const touches = Array.from(touchesRef.current.values());
        const currentDistance = getDistance(touches[0], touches[1]);
        const currentAngle = getAngle(touches[0], touches[1]);
        const center = getCenter(touches[0], touches[1]);

        // Calculate scale
        const scale = currentDistance / initialPinchDistanceRef.current;
        const scaleDelta = scale - lastPinchScaleRef.current;

        // Calculate rotation
        let rotation = currentAngle - initialRotationRef.current;
        // Normalize rotation to -180 to 180
        while (rotation > 180) rotation -= 360;
        while (rotation < -180) rotation += 360;
        const rotationDelta = rotation - lastRotationRef.current;

        // Only trigger if gesture has started (prevents accidental triggers)
        if (!gestureStartedRef.current) {
          if (Math.abs(scale - 1) > 0.05 || Math.abs(rotation) > 5) {
            gestureStartedRef.current = true;
            if (enableHaptics) triggerHaptic('light');
          }
        }

        if (gestureStartedRef.current) {
          // Pinch
          if (Math.abs(scaleDelta) > 0.01) {
            onPinch?.(scale, center);
            onGesture?.({ type: 'pinch', scale, center });
          }

          // Rotate
          if (Math.abs(rotationDelta) > 1) {
            onRotate?.(rotation * sensitivity, center);
            onGesture?.({ type: 'rotate', rotation: rotation * sensitivity, center });
          }
        }

        lastPinchScaleRef.current = scale;
        lastRotationRef.current = rotation;
      }
    },
    [
      clearLongPressTimer,
      enableHaptics,
      getAngle,
      getCenter,
      getDistance,
      onGesture,
      onPan,
      onPinch,
      onRotate,
      sensitivity,
      swipeThreshold,
    ]
  );

  // Handle touch end
  const handleTouchEnd = useCallback(
    (e: TouchEvent) => {
      const now = Date.now();

      // Process ended touches
      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        const trackedTouch = touchesRef.current.get(touch.identifier);

        if (trackedTouch) {
          const dx = touch.clientX - trackedTouch.startX;
          const dy = touch.clientY - trackedTouch.startY;
          const duration = now - trackedTouch.timestamp;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const velocity = distance / duration;

          // Check for swipe
          if (
            touchesRef.current.size === 1 &&
            distance > swipeThreshold &&
            velocity > swipeVelocityThreshold
          ) {
            let direction: 'left' | 'right' | 'up' | 'down';
            if (Math.abs(dx) > Math.abs(dy)) {
              direction = dx > 0 ? 'right' : 'left';
            } else {
              direction = dy > 0 ? 'down' : 'up';
            }

            if (enableHaptics) triggerHaptic('light');
            onSwipe?.(direction, velocity);
            onGesture?.({
              type: 'swipe',
              delta: { x: dx, y: dy },
              velocity: { x: dx / duration, y: dy / duration },
            });
          }

          // Check for tap (short duration, minimal movement)
          if (touchesRef.current.size === 1 && duration < 300 && distance < 10) {
            // Check for double tap
            if (
              lastTapRef.current &&
              now - lastTapRef.current.time < doubleTapDelay &&
              Math.abs(touch.clientX - lastTapRef.current.x) < 30 &&
              Math.abs(touch.clientY - lastTapRef.current.y) < 30
            ) {
              if (enableHaptics) triggerHaptic('medium');
              onDoubleTap?.(touch.clientX, touch.clientY);
              onGesture?.({ type: 'double-tap', center: { x: touch.clientX, y: touch.clientY } });
              lastTapRef.current = null;
            } else {
              // Single tap
              if (enableHaptics) triggerHaptic('light');
              onTap?.(touch.clientX, touch.clientY);
              onGesture?.({ type: 'tap', center: { x: touch.clientX, y: touch.clientY } });
              lastTapRef.current = { x: touch.clientX, y: touch.clientY, time: now };
            }
          }

          touchesRef.current.delete(touch.identifier);
        }
      }

      clearLongPressTimer();

      const remainingTouches = touchesRef.current.size;

      setTouchState({
        isMultiTouch: remainingTouches > 1,
        touchCount: remainingTouches,
        isPinching: remainingTouches >= 2,
        isRotating: remainingTouches >= 2,
        isSwiping: false,
        swipeDirection: null,
      });

      // Reset gesture tracking when all touches end
      if (remainingTouches === 0) {
        gestureStartedRef.current = false;
        initialPinchDistanceRef.current = 0;
        initialRotationRef.current = 0;
        lastPinchScaleRef.current = 1;
        lastRotationRef.current = 0;
      }
    },
    [
      clearLongPressTimer,
      doubleTapDelay,
      enableHaptics,
      onDoubleTap,
      onGesture,
      onSwipe,
      onTap,
      swipeThreshold,
      swipeVelocityThreshold,
    ]
  );

  // Handle touch cancel
  const handleTouchCancel = useCallback(() => {
    touchesRef.current.clear();
    clearLongPressTimer();
    gestureStartedRef.current = false;

    setTouchState({
      isMultiTouch: false,
      touchCount: 0,
      isPinching: false,
      isRotating: false,
      isSwiping: false,
      swipeDirection: null,
    });
  }, [clearLongPressTimer]);

  // Set up event listeners
  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // Use passive: false for touchmove to allow preventDefault
    element.addEventListener('touchstart', handleTouchStart, { passive: false });
    element.addEventListener('touchmove', handleTouchMove, { passive: false });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });
    element.addEventListener('touchcancel', handleTouchCancel, { passive: true });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
      element.removeEventListener('touchcancel', handleTouchCancel);
      clearLongPressTimer();
    };
  }, [
    elementRef,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handleTouchCancel,
    clearLongPressTimer,
  ]);

  return touchState;
}

export default useTouchControls;
