/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AlertCircle, CheckCircle2, RotateCcw } from 'lucide-react';

export interface SectionHeaderProps {
  readonly eyebrow: string;
  readonly title: string;
  readonly description: string;
  readonly actions?: React.ReactNode;
}

/**
 * Reusable section header adhering to editorial typographic hierarchy.
 *
 * @param props - Header content and action slot
 * @returns Header JSX element
 */
export function SectionHeader({
  eyebrow,
  title,
  description,
  actions,
}: SectionHeaderProps): React.ReactElement {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white border border-slate-200/90 rounded-xl p-5">
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
          <span>{eyebrow}</span>
        </div>
        <h2 className="text-lg font-semibold text-slate-900 tracking-tight">
          {title}
        </h2>
        <p className="text-xs text-slate-600 mt-0.5">{description}</p>
      </div>
      {actions && (
        <div className="flex flex-wrap items-center gap-2.5">{actions}</div>
      )}
    </div>
  );
}

export interface StatusAlertBannerProps {
  readonly message: string | null;
  readonly variant?: 'info' | 'error';
  readonly onRetry?: () => void;
  readonly onDismiss?: () => void;
}

/**
 * Accessible ARIA live status banner with optional retry and dismiss buttons.
 *
 * @param props - Banner message, variant, and callbacks
 * @returns Banner JSX element or `null`
 */
export function StatusAlertBanner({
  message,
  variant = 'info',
  onRetry,
  onDismiss,
}: StatusAlertBannerProps): React.ReactElement | null {
  if (!message) {
    return null;
  }
  const isError = variant === 'error';
  return (
    <div
      role={isError ? 'alert' : 'status'}
      aria-live={isError ? 'assertive' : 'polite'}
      data-testid="status-alert-banner"
      className={`flex items-center justify-between gap-3 px-4 py-2.5 rounded-lg border text-xs ${
        isError
          ? 'bg-rose-50/90 border-rose-200 text-rose-900'
          : 'bg-slate-900 text-white border-slate-800'
      }`}
    >
      <div className="flex items-center gap-2">
        {isError ? (
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" aria-hidden="true" />
        ) : (
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" aria-hidden="true" />
        )}
        <span>{message}</span>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-white/15 hover:bg-white/25 font-medium cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" aria-hidden="true" />
            <span>Retry</span>
          </button>
        )}
        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            className="underline opacity-80 hover:opacity-100 cursor-pointer"
          >
            Dismiss
          </button>
        )}
      </div>
    </div>
  );
}

export interface EmptyStateBoxProps {
  readonly title: string;
  readonly description: string;
  readonly actionLabel?: string;
  readonly onAction?: () => void;
  readonly testId?: string;
}

/**
 * Reusable empty-state presentation box with optional primary recovery action.
 *
 * @param props - Empty state copy and optional action callback
 * @returns EmptyState JSX element
 */
export function EmptyStateBox({
  title,
  description,
  actionLabel,
  onAction,
  testId = 'empty-state-box',
}: EmptyStateBoxProps): React.ReactElement {
  return (
    <div
      data-testid={testId}
      className="bg-white border border-dashed border-slate-300 rounded-xl p-8 text-center space-y-2"
    >
      <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      <p className="text-xs text-slate-600 max-w-md mx-auto">{description}</p>
      {actionLabel && onAction && (
        <div className="pt-2">
          <button
            type="button"
            onClick={onAction}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-900 text-white text-xs font-medium hover:bg-slate-800 cursor-pointer"
          >
            {actionLabel}
          </button>
        </div>
      )}
    </div>
  );
}
