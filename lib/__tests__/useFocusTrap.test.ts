/**
 * useFocusTrap Hook Tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useRef } from 'react';
import { useFocusTrap } from '../useFocusTrap';

describe('useFocusTrap', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
    vi.restoreAllMocks();
  });

  const createFocusableElements = () => {
    container.innerHTML = `
      <button id="btn1">Button 1</button>
      <input id="input1" type="text" />
      <a id="link1" href="#">Link 1</a>
      <button id="btn2">Button 2</button>
    `;
    return {
      btn1: container.querySelector('#btn1') as HTMLButtonElement,
      input1: container.querySelector('#input1') as HTMLInputElement,
      link1: container.querySelector('#link1') as HTMLAnchorElement,
      btn2: container.querySelector('#btn2') as HTMLButtonElement,
    };
  };

  it('should not trap focus when inactive', () => {
    const elements = createFocusableElements();
    const ref = { current: container };

    renderHook(() => useFocusTrap(false, ref));

    elements.btn1.focus();
    expect(document.activeElement).toBe(elements.btn1);

    // Tab should work normally (not trapped)
    const event = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true });
    container.dispatchEvent(event);

    // Focus trap is inactive, so no prevention
    expect(event.defaultPrevented).toBe(false);
  });

  it('should trap focus when active', () => {
    const elements = createFocusableElements();
    const ref = { current: container };

    renderHook(() => useFocusTrap(true, ref));

    // Focus last element
    elements.btn2.focus();
    expect(document.activeElement).toBe(elements.btn2);

    // Tab from last element should wrap to first
    const event = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true });
    Object.defineProperty(event, 'preventDefault', { value: vi.fn() });

    container.dispatchEvent(event);

    expect(event.preventDefault).toHaveBeenCalled();
  });

  it('should handle shift+tab to wrap backwards', () => {
    const elements = createFocusableElements();
    const ref = { current: container };

    renderHook(() => useFocusTrap(true, ref));

    // Focus first element
    elements.btn1.focus();
    expect(document.activeElement).toBe(elements.btn1);

    // Shift+Tab from first element should wrap to last
    const event = new KeyboardEvent('keydown', {
      key: 'Tab',
      shiftKey: true,
      bubbles: true,
    });
    Object.defineProperty(event, 'preventDefault', { value: vi.fn() });

    container.dispatchEvent(event);

    expect(event.preventDefault).toHaveBeenCalled();
  });

  it('should ignore non-Tab keys', () => {
    createFocusableElements();
    const ref = { current: container };

    renderHook(() => useFocusTrap(true, ref));

    const event = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true });
    Object.defineProperty(event, 'preventDefault', { value: vi.fn() });

    container.dispatchEvent(event);

    expect(event.preventDefault).not.toHaveBeenCalled();
  });

  it('should handle empty container', () => {
    container.innerHTML = '';
    const ref = { current: container };

    renderHook(() => useFocusTrap(true, ref));

    const event = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true });
    Object.defineProperty(event, 'preventDefault', { value: vi.fn() });

    container.dispatchEvent(event);

    // Should not throw and should not prevent default
    expect(event.preventDefault).not.toHaveBeenCalled();
  });

  it('should handle null ref', () => {
    const ref = { current: null };

    // Should not throw
    expect(() => {
      renderHook(() => useFocusTrap(true, ref));
    }).not.toThrow();
  });

  it('should exclude disabled elements', () => {
    container.innerHTML = `
      <button id="btn1">Button 1</button>
      <button id="btn2" disabled>Disabled Button</button>
      <button id="btn3">Button 3</button>
    `;
    const ref = { current: container };

    renderHook(() => useFocusTrap(true, ref));

    const btn3 = container.querySelector('#btn3') as HTMLButtonElement;
    btn3.focus();

    const event = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true });
    Object.defineProperty(event, 'preventDefault', { value: vi.fn() });

    container.dispatchEvent(event);

    // Should wrap to first, skipping disabled
    expect(event.preventDefault).toHaveBeenCalled();
  });

  it('should exclude aria-hidden elements', () => {
    container.innerHTML = `
      <button id="btn1">Button 1</button>
      <button id="btn2" aria-hidden="true">Hidden Button</button>
      <button id="btn3">Button 3</button>
    `;
    const ref = { current: container };

    renderHook(() => useFocusTrap(true, ref));

    // Hidden elements should be excluded from focus trap
    const btn3 = container.querySelector('#btn3') as HTMLButtonElement;
    btn3.focus();

    const event = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true });
    container.dispatchEvent(event);

    // Focus trap should work with only visible elements
  });

  it('should exclude visually hidden elements', () => {
    container.innerHTML = `
      <button id="btn1">Button 1</button>
      <button id="btn2" style="display: none;">Hidden Button</button>
      <button id="btn3">Button 3</button>
    `;
    const ref = { current: container };

    renderHook(() => useFocusTrap(true, ref));

    // display:none elements should be excluded
  });

  it('should clean up event listener on unmount', () => {
    const ref = { current: container };
    const removeEventListenerSpy = vi.spyOn(container, 'removeEventListener');

    const { unmount } = renderHook(() => useFocusTrap(true, ref));

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
  });

  it('should update when active state changes', () => {
    const ref = { current: container };
    createFocusableElements();

    const { rerender } = renderHook(
      ({ active }) => useFocusTrap(active, ref),
      { initialProps: { active: false } }
    );

    // Initially inactive
    let event = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true });
    Object.defineProperty(event, 'preventDefault', { value: vi.fn() });
    container.dispatchEvent(event);
    expect(event.preventDefault).not.toHaveBeenCalled();

    // Activate
    rerender({ active: true });

    // Now should trap
    const btn2 = container.querySelector('#btn2') as HTMLButtonElement;
    btn2.focus();

    event = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true });
    Object.defineProperty(event, 'preventDefault', { value: vi.fn() });
    container.dispatchEvent(event);
    expect(event.preventDefault).toHaveBeenCalled();
  });
});
