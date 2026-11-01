/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback } from 'react';
import { AlertTriangle, HelpCircle, Loader2, ShieldCheck, Trash2, Wand2 } from 'lucide-react';
import { MAX_BUDGET_LIMIT, VENDOR_BOOKING_STATUSES } from '../constants/event.constants';
import { CurrencyCode, VendorBookingStatus, VendorItem } from '../types/event.types';
import { clampNumber, sanitizeText } from '../utils/security.utils';

export interface VendorCardProps {
  readonly vendor: VendorItem;
  readonly index: number;
  readonly currency: CurrencyCode;
  readonly isGenerating: boolean;
  readonly onUpdateField: <K extends keyof VendorItem>(id: string, field: K, value: VendorItem[K]) => void;
  readonly onGenerateQuestions: (vendor: VendorItem) => void;
  readonly onDelete: (id: string) => void;
}

/**
 * @description Renders a single vendor directory card with booking status, quote tracking, 5 vetting questions, and contract red flags.
 * @param {VendorCardProps} props - Vendor item, currency, loading flag, and mutation handlers
 * @returns {React.ReactElement} Memoized vendor card article element
 */
export const VendorCard = React.memo(function VendorCard({
  vendor,
  index,
  currency,
  isGenerating,
  onUpdateField,
  onGenerateQuestions,
  onDelete,
}: VendorCardProps): React.ReactElement {
  const handleStatusChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    onUpdateField(vendor.id, 'bookingStatus', e.target.value as VendorBookingStatus);
  }, [onUpdateField, vendor.id]);
  const handleNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdateField(vendor.id, 'vendorName', sanitizeText(e.target.value, 90));
  }, [onUpdateField, vendor.id]);
  const handlePriceChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdateField(vendor.id, 'quotedPrice', Math.round(clampNumber(e.target.value, 0, MAX_BUDGET_LIMIT)));
  }, [onUpdateField, vendor.id]);
  const handleContactChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdateField(vendor.id, 'contactInfo', sanitizeText(e.target.value, 100));
  }, [onUpdateField, vendor.id]);
  const handleGenerateClick = useCallback(() => onGenerateQuestions(vendor), [onGenerateQuestions, vendor]);
  const handleDeleteClick = useCallback(() => onDelete(vendor.id), [onDelete, vendor.id]);

  return (
    <article data-testid={`vendor-card-${index}`} className="bg-white border border-slate-200/90 rounded-xl p-6 space-y-4">
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="space-y-1 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-600">{vendor.priority} Priority</span>
            {vendor.isPermitOrCompliance && (
              <span className="inline-flex items-center gap-1 text-[11px] font-mono uppercase tracking-wider text-blue-700 font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />Civic Permit / Safety
              </span>
            )}
          </div>
          <h3 className="text-base font-semibold text-slate-900 tracking-tight">{vendor.category}</h3>
          <p id={`vendor-desc-${vendor.id}`} className="text-xs text-slate-600">{vendor.roleDescription}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <label htmlFor={`vendor-status-${index}`} className="sr-only">Booking status for {vendor.category}</label>
          <select id={`vendor-status-${index}`} data-testid={`vendor-status-select-${index}`} value={vendor.bookingStatus} aria-invalid={false} aria-describedby={`vendor-desc-${vendor.id}`} onChange={handleStatusChange} className="px-3 py-1.5 text-xs font-mono rounded-lg border border-slate-300 bg-slate-50 text-slate-900">
            {VENDOR_BOOKING_STATUSES.map((st) => <option key={st} value={st}>Status: {st}</option>)}
          </select>
          <button type="button" data-testid={`vendor-ai-questions-btn-${index}`} onClick={handleGenerateClick} disabled={isGenerating} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-medium hover:bg-slate-800 disabled:opacity-60 cursor-pointer">
            {isGenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Wand2 className="w-3.5 h-3.5 text-amber-400" />}
            <span>{isGenerating ? 'Generating...' : 'AI Questions to Ask'}</span>
          </button>
          <button type="button" onClick={handleDeleteClick} aria-label={`Delete ${vendor.category}`} className="p-1.5 text-slate-500 hover:text-rose-600 rounded cursor-pointer"><Trash2 className="w-4 h-4" /></button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label htmlFor={`vendor-name-${index}`} className="block text-[11px] font-medium text-slate-600 mb-1">Vendor / Company Name</label>
          <input id={`vendor-name-${index}`} type="text" value={vendor.vendorName} aria-invalid={false} aria-describedby={`vendor-desc-${vendor.id}`} onChange={handleNameChange} placeholder="Assign supplier..." className="w-full px-3 py-1.5 text-xs bg-slate-50/70 border border-slate-200 rounded-md text-slate-900" />
        </div>
        <div>
          <label htmlFor={`vendor-price-${index}`} className="block text-[11px] font-medium text-slate-600 mb-1">Quoted / Contracted Price ({currency})</label>
          <input id={`vendor-price-${index}`} type="number" min={0} max={MAX_BUDGET_LIMIT} step={100} value={vendor.quotedPrice} aria-invalid={false} aria-describedby={`vendor-desc-${vendor.id}`} onChange={handlePriceChange} className="w-full px-3 py-1.5 text-xs font-mono tabular-nums bg-slate-50/70 border border-slate-200 rounded-md text-slate-900" />
        </div>
        <div>
          <label htmlFor={`vendor-contact-${index}`} className="block text-[11px] font-medium text-slate-600 mb-1">Contact Email / Phone</label>
          <input id={`vendor-contact-${index}`} type="text" value={vendor.contactInfo} aria-invalid={false} aria-describedby={`vendor-desc-${vendor.id}`} onChange={handleContactChange} placeholder="email@vendor.com" className="w-full px-3 py-1.5 text-xs bg-slate-50/70 border border-slate-200 rounded-md text-slate-900" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 pt-2">
        <div className="lg:col-span-7 bg-slate-50/70 border border-slate-200/80 rounded-lg p-4">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-900 mb-2">
            <HelpCircle className="w-3.5 h-3.5 text-blue-600" aria-hidden="true" /><span>5 Essential Vetting Questions Before Signing</span>
          </div>
          <ol className="space-y-1.5">
            {vendor.vettingQuestions.map((q, qIdx) => (
              <li key={qIdx} className="text-xs text-slate-700 leading-relaxed flex items-start gap-2"><span className="font-mono text-[10px] text-slate-500 mt-0.5 shrink-0">0{qIdx + 1}.</span><span>{q}</span></li>
            ))}
          </ol>
        </div>
        <div className="lg:col-span-5 bg-rose-50/35 border border-rose-200/70 rounded-lg p-4">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-900 mb-2">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" aria-hidden="true" /><span>Contract Red Flags to Watch Out For</span>
          </div>
          <ul className="space-y-1.5">
            {vendor.contractRedFlags.map((flag, fIdx) => (
              <li key={fIdx} className="text-xs text-rose-900/90 leading-relaxed flex items-start gap-2"><span className="text-rose-500 font-bold">·</span><span>{flag}</span></li>
            ))}
          </ul>
        </div>
      </div>
    </article>
  );
});
