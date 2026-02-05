/**
 * ErrorBoundary Component Tests
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ErrorBoundary, withErrorBoundary, CanvasErrorBoundary } from '../ErrorBoundary';

// Mock the error reporting
vi.mock('@/lib/errors', () => ({
  OrbitError: class OrbitError extends Error {
    constructor(message: string, options?: Record<string, unknown>) {
      super(message);
      this.name = 'OrbitError';
      Object.assign(this, options);
    }
  },
  reportError: vi.fn(),
}));

vi.mock('@/lib/logger', () => ({
  createLogger: () => ({
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
  }),
}));

describe('ErrorBoundary', () => {
  // Suppress console.error for cleaner test output
  const originalError = console.error;
  beforeEach(() => {
    console.error = vi.fn();
  });

  afterEach(() => {
    console.error = originalError;
    vi.clearAllMocks();
  });

  // Component that throws an error
  const ThrowingComponent = ({ shouldThrow = true }: { shouldThrow?: boolean }) => {
    if (shouldThrow) {
      throw new Error('Test error');
    }
    return <div>No error</div>;
  };

  describe('Basic Functionality', () => {
    it('should render children when no error', () => {
      render(
        <ErrorBoundary>
          <div>Child content</div>
        </ErrorBoundary>
      );

      expect(screen.getByText('Child content')).toBeInTheDocument();
    });

    it('should catch errors and show fallback', () => {
      render(
        <ErrorBoundary fallback={<div>Error occurred</div>}>
          <ThrowingComponent />
        </ErrorBoundary>
      );

      expect(screen.getByText('Error occurred')).toBeInTheDocument();
    });

    it('should show default fallback when no custom fallback provided', () => {
      render(
        <ErrorBoundary>
          <ThrowingComponent />
        </ErrorBoundary>
      );

      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });
  });

  describe('Fallback Render Prop', () => {
    it('should support render prop fallback', () => {
      render(
        <ErrorBoundary
          fallback={(error, reset) => (
            <div>
              <span>Error: {error.message}</span>
              <button onClick={reset}>Reset</button>
            </div>
          )}
        >
          <ThrowingComponent />
        </ErrorBoundary>
      );

      expect(screen.getByText('Error: Test error')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Reset' })).toBeInTheDocument();
    });

    it('should pass error to render prop', () => {
      const fallbackFn = vi.fn(() => <div>Fallback</div>);

      render(
        <ErrorBoundary fallback={fallbackFn}>
          <ThrowingComponent />
        </ErrorBoundary>
      );

      expect(fallbackFn).toHaveBeenCalledWith(
        expect.any(Error),
        expect.any(Function)
      );
    });
  });

  describe('Reset Functionality', () => {
    it('should reset error state when reset is called', () => {
      let shouldThrow = true;

      const ConditionalThrower = () => {
        if (shouldThrow) {
          throw new Error('Test error');
        }
        return <div>Recovered</div>;
      };

      const { rerender } = render(
        <ErrorBoundary
          fallback={(error, reset) => (
            <button onClick={() => {
              shouldThrow = false;
              reset();
            }}>
              Reset
            </button>
          )}
        >
          <ConditionalThrower />
        </ErrorBoundary>
      );

      expect(screen.getByRole('button', { name: 'Reset' })).toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: 'Reset' }));

      // After reset, should try to render children again
      rerender(
        <ErrorBoundary
          fallback={(error, reset) => (
            <button onClick={reset}>Reset</button>
          )}
        >
          <ConditionalThrower />
        </ErrorBoundary>
      );

      expect(screen.getByText('Recovered')).toBeInTheDocument();
    });
  });

  describe('Error Callback', () => {
    it('should call onError callback when error occurs', () => {
      const onError = vi.fn();

      render(
        <ErrorBoundary onError={onError}>
          <ThrowingComponent />
        </ErrorBoundary>
      );

      expect(onError).toHaveBeenCalledWith(
        expect.any(Error),
        expect.objectContaining({
          componentStack: expect.any(String),
        })
      );
    });
  });

  describe('Error Levels', () => {
    it('should support page level', () => {
      render(
        <ErrorBoundary level="page">
          <ThrowingComponent />
        </ErrorBoundary>
      );

      expect(screen.getByText('Houston, we have a problem')).toBeInTheDocument();
    });

    it('should support component level', () => {
      render(
        <ErrorBoundary level="component">
          <ThrowingComponent />
        </ErrorBoundary>
      );

      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });

    it('should support feature level', () => {
      render(
        <ErrorBoundary level="feature">
          <ThrowingComponent />
        </ErrorBoundary>
      );

      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });
  });

  describe('Max Reset Attempts', () => {
    it('should show permanent error after max attempts', () => {
      let throwCount = 0;

      const AlwaysThrows = () => {
        throwCount++;
        throw new Error(`Error ${throwCount}`);
      };

      const { rerender } = render(
        <ErrorBoundary
          fallback={(error, reset) => (
            <button onClick={reset}>Try Again</button>
          )}
        >
          <AlwaysThrows />
        </ErrorBoundary>
      );

      // Click reset multiple times to exceed max attempts
      for (let i = 0; i < 3; i++) {
        const button = screen.queryByRole('button', { name: /Try Again/i });
        if (button) {
          fireEvent.click(button);
          rerender(
            <ErrorBoundary
              fallback={(error, reset) => (
                <button onClick={reset}>Try Again</button>
              )}
            >
              <AlwaysThrows />
            </ErrorBoundary>
          );
        }
      }

      // After max attempts, should show permanent error
      expect(screen.getByText('Please refresh the page to continue.')).toBeInTheDocument();
    });
  });

  describe('Refresh Button', () => {
    it('should have refresh button on page level error', () => {
      render(
        <ErrorBoundary level="page">
          <ThrowingComponent />
        </ErrorBoundary>
      );

      expect(screen.getByRole('button', { name: 'Refresh Page' })).toBeInTheDocument();
    });
  });
});

describe('withErrorBoundary HOC', () => {
  const originalError = console.error;
  beforeEach(() => {
    console.error = vi.fn();
  });

  afterEach(() => {
    console.error = originalError;
  });

  it('should wrap component with error boundary', () => {
    const TestComponent = () => <div>Test</div>;
    const WrappedComponent = withErrorBoundary(TestComponent);

    render(<WrappedComponent />);

    expect(screen.getByText('Test')).toBeInTheDocument();
  });

  it('should catch errors in wrapped component', () => {
    const ThrowingComponent = () => {
      throw new Error('HOC test error');
    };
    const WrappedComponent = withErrorBoundary(ThrowingComponent, {
      fallback: <div>HOC Error</div>,
    });

    render(<WrappedComponent />);

    expect(screen.getByText('HOC Error')).toBeInTheDocument();
  });

  it('should set displayName', () => {
    const TestComponent = () => <div>Test</div>;
    TestComponent.displayName = 'TestComponent';

    const WrappedComponent = withErrorBoundary(TestComponent);

    expect(WrappedComponent.displayName).toBe('withErrorBoundary(TestComponent)');
  });

  it('should pass props to wrapped component', () => {
    const TestComponent = ({ message }: { message: string }) => <div>{message}</div>;
    const WrappedComponent = withErrorBoundary(TestComponent);

    render(<WrappedComponent message="Hello" />);

    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});

describe('CanvasErrorBoundary', () => {
  const originalError = console.error;
  beforeEach(() => {
    console.error = vi.fn();
  });

  afterEach(() => {
    console.error = originalError;
  });

  it('should render children when no error', () => {
    render(
      <CanvasErrorBoundary>
        <div>Canvas content</div>
      </CanvasErrorBoundary>
    );

    expect(screen.getByText('Canvas content')).toBeInTheDocument();
  });

  it('should show 3D rendering error message', () => {
    const ThrowingCanvas = () => {
      throw new Error('WebGL error');
    };

    render(
      <CanvasErrorBoundary>
        <ThrowingCanvas />
      </CanvasErrorBoundary>
    );

    expect(screen.getByText('3D Rendering Error')).toBeInTheDocument();
  });

  it('should have retry button', () => {
    const ThrowingCanvas = () => {
      throw new Error('WebGL error');
    };

    render(
      <CanvasErrorBoundary>
        <ThrowingCanvas />
      </CanvasErrorBoundary>
    );

    expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument();
  });

  it('should have WebGL check link', () => {
    const ThrowingCanvas = () => {
      throw new Error('WebGL error');
    };

    render(
      <CanvasErrorBoundary>
        <ThrowingCanvas />
      </CanvasErrorBoundary>
    );

    const link = screen.getByRole('link', { name: 'Check WebGL' });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', 'https://get.webgl.org/');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('should mention WebGL compatibility', () => {
    const ThrowingCanvas = () => {
      throw new Error('WebGL error');
    };

    render(
      <CanvasErrorBoundary>
        <ThrowingCanvas />
      </CanvasErrorBoundary>
    );

    // Check that WebGL is mentioned in the error message
    expect(screen.getByText(/WebGL compatibility/i)).toBeInTheDocument();
  });
});
