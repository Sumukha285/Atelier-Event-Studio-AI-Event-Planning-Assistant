/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { CheckCircle2, ShieldCheck, X } from 'lucide-react';
import { DiagnosticAssertionResult, runDiagnosticSelfTests } from '../utils/diagnostics.utils';

export interface DiagnosticsModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
}

/**
 * @description Renders a single assertion result row inside the Diagnostics self-test modal.
 * @param {{ readonly item: DiagnosticAssertionResult }} props - Assertion result item
 * @returns {React.ReactElement} Assertion row JSX element
 */
function DiagnosticRow({ item }: { readonly item: DiagnosticAssertionResult }): React.ReactElement {
  return (
    <li className="px-4 py-2.5 flex items-start justify-between gap-3 bg-slate-50/70 rounded-lg border border-slate-200/80">
      <div className="flex items-start gap-2.5">
        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" aria-hidden="true" />
        <div>
          <p className="text-xs font-medium text-slate-900">
            #{item.id} · {item.name}
          </p>
          <p className="text-[11px] font-mono text-slate-600 mt-0.5">{item.detail}</p>
        </div>
      </div>
      <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold shrink-0">
        {item.passed ? 'PASS' : 'FAIL'}
      </span>
    </li>
  );
}

/**
 * @description Modal displaying live execution results of the 12 in-app unit & integration diagnostic assertions.
 * @param {DiagnosticsModalProps} props - Open state and close callback
 * @returns {React.ReactElement | null} Memoized DiagnosticsModal JSX element or `null`
 */
export const DiagnosticsModal = React.memo(function DiagnosticsModal({
  isOpen,
  onClose,
}: DiagnosticsModalProps): React.ReactElement | null {
  const suite = useMemo(() => runDiagnosticSelfTests(), []);
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-[1px] p-4" data-testid="diagnostics-modal">
      <div role="dialog" aria-modal="true" aria-label="In-App Diagnostic Self-Test Suite" className="bg-white border border-slate-200 rounded-xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-emerald-400" aria-hidden="true" />
            <div>
              <h2 className="text-sm font-semibold">Diagnostics / Self-Test Passed ({suite.passedCount}/{suite.total})</h2>
              <p className="text-[11px] text-slate-300 font-mono">Security Sanitization · Integer-Cent Math · Reducer Transitions · Schema Validation</p>
            </div>
          </div>
          <button type="button" data-testid="close-diagnostics-btn" onClick={onClose} aria-label="Close Diagnostics Modal" className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
        <ul className="p-5 space-y-2 overflow-y-auto">
          {suite.results.map((item) => (
            <DiagnosticRow key={item.id} item={item} />
          ))}
        </ul>
      </div>
    </div>
  );
});

export default DiagnosticsModal;
