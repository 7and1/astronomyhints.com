/**
 * SkipLink Component Tests
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import SkipLink from '../SkipLink';

describe('SkipLink', () => {
  let mainElement: HTMLElement;

  beforeEach(() => {
    // Create main content element with mocked methods
    mainElement = document.createElement('main');
    mainElement.id = 'main-content';
    mainElement.tabIndex = -1;
    mainElement.focus = vi.fn();
    mainElement.scrollIntoView = vi.fn();
    document.body.appendChild(mainElement);
  });

  afterEach(() => {
    if (mainElement && mainElement.parentNode) {
      document.body.removeChild(mainElement);
    }
    vi.restoreAllMocks();
  });

  it('should render skip link', () => {
    render(<SkipLink />);

    const link = screen.getByText('Skip to main content');
    expect(link).toBeInTheDocument();
  });

  it('should have correct href', () => {
    render(<SkipLink />);

    const link = screen.getByText('Skip to main content');
    expect(link).toHaveAttribute('href', '#main-content');
  });

  it('should have skip-link class', () => {
    render(<SkipLink />);

    const link = screen.getByText('Skip to main content');
    expect(link).toHaveClass('skip-link');
  });

  it('should be an anchor element', () => {
    render(<SkipLink />);

    const link = screen.getByText('Skip to main content');
    expect(link.tagName).toBe('A');
  });

  it('should focus main content on click', () => {
    render(<SkipLink />);

    const link = screen.getByText('Skip to main content');
    fireEvent.click(link);

    expect(mainElement.focus).toHaveBeenCalled();
  });

  it('should scroll main content into view on click', () => {
    render(<SkipLink />);

    const link = screen.getByText('Skip to main content');
    fireEvent.click(link);

    expect(mainElement.scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' });
  });

  it('should handle missing main content gracefully', () => {
    // Remove main content
    if (mainElement && mainElement.parentNode) {
      document.body.removeChild(mainElement);
    }

    render(<SkipLink />);

    const link = screen.getByText('Skip to main content');

    // Should not throw
    expect(() => {
      fireEvent.click(link);
    }).not.toThrow();
  });

  it('should be keyboard accessible', () => {
    render(<SkipLink />);

    const link = screen.getByText('Skip to main content');

    // Should be focusable
    link.focus();
    expect(document.activeElement).toBe(link);
  });

  it('should have accessible name', () => {
    render(<SkipLink />);

    const link = screen.getByRole('link', { name: 'Skip to main content' });
    expect(link).toBeInTheDocument();
  });
});
