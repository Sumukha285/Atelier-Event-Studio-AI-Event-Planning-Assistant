/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import { STORAGE_KEY } from '../constants/event.constants';

export interface ErrorBoundaryProps {
  readonly children: ReactNode;
  readonly onResetState?: () => void;
}

export interface ErrorBoundaryState {
  readonly hasError: boolean;
  readonly errorMessage: string;
}

/**
 * Class-based React Error Boundary that catches runtime rendering faults and offers a recovery reset.
 */
export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  public state: ErrorBoundaryState = {
    hasError: false,
    errorMessage: '',
  };

  /**
   * Updates boundary state when a descendant component throws during rendering.
   *
   * @param error - Thrown error instance
   * @returns Next `ErrorBoundaryState`
   */
  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      errorMessage:
        error?.message || 'An unexpected rendering issue occurred.',
    };
  }

  /**
   * Lifecycle hook invoked after a descendant throws an error.
   *
   * @param _error - Caught error
   * @param _errorInfo - React component stack trace
   * @returns Void
   */
  public componentDidCatch(_error: Error, _errorInfo: ErrorInfo): void {
    // Structured error state is already captured in getDerivedStateFromError
  }

  /**
   * Clears persisted application state in `localStorage` and resets the error boundary.
   *
   * @returns Void
   */
  private handleResetApplicationState = (): void => {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      // Ignore storage access restrictions
    }
    this.setState({ hasError: false, errorMessage: '' });
    if (this.props.onResetState) {
      this.props.onResetState();
    }
  };

  /**
   * Renders either the protected child tree or the recovery fallback card.
   *
   * @returns React element tree
   */
  public render(): ReactNode {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <div
        role="alert"
        aria-live="assertive"
        data-testid="error-boundary-fallback"
        className="min-h-screen bg-[#F9F8F6] text-slate-900 flex items-center justify-center p-6"
      >
        <div className="max-w-md w-full bg-white border border-slate-200 rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-3 text-rose-700">
            <AlertTriangle className="w-6 h-6 shrink-0" aria-hidden="true" />
            <h1 className="text-lg font-semibold tracking-tight text-slate-900">
              Workspace Recovery Required
            </h1>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed">
            Atelier Event Studio encountered an unexpected rendering fault:{' '}
            <span className="font-mono text-xs text-slate-800">
              {this.state.errorMessage}
            </span>
          </p>
          <div className="pt-2">
            <button
              type="button"
              data-testid="error-boundary-reset"
              onClick={this.handleResetApplicationState}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-slate-900 text-white text-xs font-medium hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" aria-hidden="true" />
              <span>Reset Application State</span>
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
