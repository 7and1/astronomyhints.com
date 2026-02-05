'use client';

import React, { Component, type ReactNode } from 'react';
import { OrbitError, reportError } from '@/lib/errors';
import { createLogger } from '@/lib/logger';

const logger = createLogger('ErrorBoundary');

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode | ((error: Error, reset: () => void) => ReactNode);
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  level?: 'page' | 'component' | 'feature';
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorCount: number;
}

const MAX_RESET_ATTEMPTS = 3;

/**
 * Error Boundary for graceful error handling in React components
 *
 * Usage:
 * <ErrorBoundary fallback={<ErrorFallback />}>
 *   <YourComponent />
 * </ErrorBoundary>
 *
 * Or with render prop:
 * <ErrorBoundary fallback={(error, reset) => <button onClick={reset}>Retry</button>}>
 *   <YourComponent />
 * </ErrorBoundary>
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    const { onError, level = 'component' } = this.props;

    // Log the error
    logger.error(`Error caught at ${level} level`, {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    });

    // Report to error tracking
    const orbitError = error instanceof OrbitError
      ? error
      : new OrbitError(error.message, {
          category: 'rendering',
          context: {
            componentStack: errorInfo.componentStack,
            level,
          },
          cause: error,
        });

    reportError(orbitError);

    // Increment error count
    this.setState((prev) => ({ errorCount: prev.errorCount + 1 }));

    // Call custom error handler
    onError?.(error, errorInfo);
  }

  handleReset = (): void => {
    const { errorCount } = this.state;

    if (errorCount >= MAX_RESET_ATTEMPTS) {
      logger.warn('Max reset attempts reached, not resetting');
      return;
    }

    logger.info('Resetting error boundary', { attemptNumber: errorCount + 1 });
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    const { hasError, error, errorCount } = this.state;
    const { children, fallback, level = 'component' } = this.props;

    if (hasError && error) {
      // If max attempts reached, show permanent error
      if (errorCount >= MAX_RESET_ATTEMPTS) {
        return (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <div className="text-red-500 text-lg font-semibold mb-2">
              Something went wrong
            </div>
            <p className="text-gray-400 text-sm mb-4">
              Please refresh the page to continue.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition-colors"
            >
              Refresh Page
            </button>
          </div>
        );
      }

      // Render custom fallback
      if (fallback) {
        if (typeof fallback === 'function') {
          return fallback(error, this.handleReset);
        }
        return fallback;
      }

      // Default fallback based on level
      return (
        <DefaultErrorFallback
          error={error}
          level={level}
          onReset={this.handleReset}
          attemptNumber={errorCount}
        />
      );
    }

    return children;
  }
}

interface DefaultErrorFallbackProps {
  error: Error;
  level: 'page' | 'component' | 'feature';
  onReset: () => void;
  attemptNumber: number;
}

function DefaultErrorFallback({
  error,
  level,
  onReset,
  attemptNumber,
}: DefaultErrorFallbackProps): JSX.Element {
  const isPageLevel = level === 'page';

  return (
    <div
      className={`flex flex-col items-center justify-center text-center ${
        isPageLevel ? 'min-h-screen bg-black' : 'p-6'
      }`}
    >
      <div className="max-w-md">
        {/* Icon */}
        <div className="text-4xl mb-4">
          {isPageLevel ? '🛸' : '⚠️'}
        </div>

        {/* Title */}
        <h2 className="text-xl font-semibold text-white mb-2">
          {isPageLevel ? 'Houston, we have a problem' : 'Something went wrong'}
        </h2>

        {/* Message */}
        <p className="text-gray-400 text-sm mb-4">
          {isPageLevel
            ? 'The solar system simulation encountered an error. Our engineers have been notified.'
            : 'This component encountered an error and cannot be displayed.'}
        </p>

        {/* Error details (development only) */}
        {process.env.NODE_ENV === 'development' && (
          <details className="mb-4 text-left">
            <summary className="text-cyan-400 cursor-pointer text-sm">
              Error Details
            </summary>
            <pre className="mt-2 p-3 bg-gray-900 rounded text-xs text-red-400 overflow-auto max-h-40">
              {error.message}
              {error.stack && `\n\n${error.stack}`}
            </pre>
          </details>
        )}

        {/* Actions */}
        <div className="flex gap-3 justify-center">
          <button
            onClick={onReset}
            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition-colors text-sm"
          >
            Try Again {attemptNumber > 0 && `(${MAX_RESET_ATTEMPTS - attemptNumber} left)`}
          </button>

          {isPageLevel && (
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors text-sm"
            >
              Refresh Page
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * HOC to wrap a component with error boundary
 */
export function withErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  options?: Omit<ErrorBoundaryProps, 'children'>
): React.FC<P> {
  const displayName = WrappedComponent.displayName || WrappedComponent.name || 'Component';

  const WithErrorBoundary: React.FC<P> = (props) => (
    <ErrorBoundary {...options}>
      <WrappedComponent {...props} />
    </ErrorBoundary>
  );

  WithErrorBoundary.displayName = `withErrorBoundary(${displayName})`;

  return WithErrorBoundary;
}

/**
 * Specialized error boundary for 3D canvas errors
 */
export function CanvasErrorBoundary({
  children,
}: {
  children: ReactNode;
}): JSX.Element {
  return (
    <ErrorBoundary
      level="feature"
      fallback={(error, reset) => (
        <div className="flex flex-col items-center justify-center h-full bg-black text-white p-8">
          <div className="text-2xl mb-4">🌌</div>
          <h3 className="text-lg font-semibold mb-2">3D Rendering Error</h3>
          <p className="text-gray-400 text-sm mb-4 max-w-sm text-center">
            The 3D solar system could not be rendered. This may be due to WebGL
            compatibility issues.
          </p>
          <div className="flex gap-3">
            <button
              onClick={reset}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 rounded-lg text-sm"
            >
              Retry
            </button>
            <a
              href="https://get.webgl.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm"
            >
              Check WebGL
            </a>
          </div>
        </div>
      )}
    >
      {children}
    </ErrorBoundary>
  );
}

export default ErrorBoundary;
