/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { Check, Copy, Download, FileText, Printer, X } from 'lucide-react';
import { EventPlanState } from '../types/event.types';
import { generatePlanMarkdown } from '../utils/eventLogic';

export interface ExportModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly state: EventPlanState;
}

/**
 * Modal dialog for previewing, copying, downloading (`.md`), or printing (`PDF`) the master event plan.
 *
 * @param props - Modal visibility, close callback, and full event state
 * @returns ExportModal JSX element or `null`
 */
export function ExportModal({
  isOpen,
  onClose,
  state,
}: ExportModalProps): React.ReactElement | null {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent): void => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const markdown = generatePlanMarkdown(state);

  const handleCopy = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(markdown);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  };

  const handleDownloadMarkdown = (): void => {
    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const safeSlug =
      state.config.eventName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') || 'event-plan';
    link.href = url;
    link.download = `${safeSlug}-blueprint.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 p-4"
      data-testid="export-modal"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="export-modal-title"
        className="bg-white border border-slate-200 rounded-xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl"
      >
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <FileText className="w-5 h-5 text-slate-800" aria-hidden="true" />
            <div>
              <h3 id="export-modal-title" className="text-base font-semibold text-slate-900">
                Export Master Event Blueprint
              </h3>
              <p className="text-xs text-slate-600">
                Download as Markdown (.md), copy to clipboard, or print to PDF.
              </p>
            </div>
          </div>
          <button
            type="button"
            data-testid="close-export-modal-btn"
            onClick={onClose}
            aria-label="Close export modal"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 bg-slate-50">
          <pre
            data-testid="export-markdown-preview"
            className="text-xs font-mono text-slate-800 whitespace-pre-wrap bg-white border border-slate-200 rounded-lg p-4 leading-relaxed select-all"
          >
            {markdown}
          </pre>
        </div>

        <div className="px-6 py-4 border-t border-slate-200 bg-white flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs text-slate-600 font-mono">
            Auto-saved to browser localStorage
          </span>
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              data-testid="copy-markdown-btn"
              onClick={() => void handleCopy()}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 text-xs font-medium hover:bg-slate-50 cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Copied Markdown</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Markdown</span>
                </>
              )}
            </button>
            <button
              type="button"
              data-testid="print-pdf-btn"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 text-xs font-medium hover:bg-slate-50 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <button
              type="button"
              data-testid="download-markdown-btn"
              onClick={handleDownloadMarkdown}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-900 text-white text-xs font-medium hover:bg-slate-800 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download .MD File</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ExportModal;
