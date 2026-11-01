/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { TOAST_DISMISS_MS } from '../constants/event.constants';
import { fetchVendorVetting, getRemainingCooldownMs } from '../services/gemini.service';
import { EventConfig, VendorItem } from '../types/event.types';
import { filterVendorsByCategory, formatCurrency } from '../utils/domain.utils';
import { AddVendorForm } from './AddVendorForm';
import { StatusAlertBanner } from './ui/AtomicControls';
import { VendorCard } from './VendorCard';

export interface VendorSectionProps {
  readonly config: EventConfig;
  readonly vendors: readonly VendorItem[];
  readonly onUpdateVendors: (vendors: readonly VendorItem[]) => void;
  readonly onAnnounce?: (message: string) => void;
}

/**
 * @description Renders the Vendor & Logistics Checklist directory with AI vetting question generation and inline quote management.
 * @param {VendorSectionProps} props - Event config, vendor records, and update callback
 * @returns {React.ReactElement} Memoized VendorSection JSX element
 */
export const VendorSection = React.memo(function VendorSection({
  config,
  vendors,
  onUpdateVendors,
  onAnnounce,
}: VendorSectionProps): React.ReactElement {
  const [loadingVendorId, setLoadingVendorId] = useState<string | null>(null);
  const [aiMessage, setAiMessage] = useState<string | null>(null);
  const [isErrorBanner, setIsErrorBanner] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  const visibleVendors = useMemo(() => filterVendorsByCategory(vendors, config.eventType), [config.eventType, vendors]);
  const totalQuoted = useMemo(() => visibleVendors.reduce((acc, v) => acc + (v.quotedPrice || 0), 0), [visibleVendors]);
  const bookedOrPaidCount = useMemo(
    () => visibleVendors.filter((v) => v.bookingStatus === 'Booked' || v.bookingStatus === 'Paid').length,
    [visibleVendors]
  );

  const notify = useCallback((msg: string, isError: boolean = false): void => {
    setAiMessage(msg);
    setIsErrorBanner(isError);
    if (onAnnounce) onAnnounce(msg);
    if (!isError) window.setTimeout(() => setAiMessage(null), TOAST_DISMISS_MS);
  }, [onAnnounce]);

  const handleUpdateField = useCallback(<K extends keyof VendorItem>(id: string, field: K, value: VendorItem[K]): void => {
    onUpdateVendors(vendors.map((v) => (v.id === id ? { ...v, [field]: value } : v)));
  }, [onUpdateVendors, vendors]);

  const handleGenerateQuestions = useCallback(async (vendor: VendorItem): Promise<void> => {
    const waitMs = getRemainingCooldownMs();
    if (waitMs > 0) {
      notify(`Please wait ${Math.ceil(waitMs / 1000)}s before another AI request.`);
      return;
    }
    setLoadingVendorId(vendor.id);
    try {
      const data = await fetchVendorVetting(config, vendor);
      onUpdateVendors(
        vendors.map((v) =>
          v.id === vendor.id ? { ...v, vettingQuestions: data.vettingQuestions, contractRedFlags: data.contractRedFlags } : v
        )
      );
      notify(`Generated 5 vetting questions & contract red flags for ${vendor.category}.`);
    } catch {
      notify(`Unable to refresh vetting checklist for ${vendor.category}.`, true);
    } finally {
      setLoadingVendorId(null);
    }
  }, [config, notify, onUpdateVendors, vendors]);

  const handleDeleteVendor = useCallback((id: string): void => {
    onUpdateVendors(vendors.filter((v) => v.id !== id));
  }, [onUpdateVendors, vendors]);

  const handleAddVendor = useCallback((vendor: VendorItem): void => {
    onUpdateVendors([...vendors, vendor]);
    setShowAddForm(false);
  }, [onUpdateVendors, vendors]);

  const handleToggleAddForm = useCallback((): void => setShowAddForm((prev) => !prev), []);
  const handleDismissBanner = useCallback((): void => setAiMessage(null), []);

  return (
    <div className="space-y-6" data-testid="vendor-view">
      <section className="bg-white border border-slate-200/90 rounded-xl p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-200/80">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-600 block mb-1">Pillar 04 · Supplier Directory, Contract Vetting & Civic Compliance</span>
            <h2 className="text-lg font-semibold text-slate-900 tracking-tight">Vendor & Logistics Checklist</h2>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="text-right">
              <span className="text-[11px] text-slate-600 block">Total Vendor Quotes</span>
              <span className="text-sm font-mono font-semibold text-slate-900 tabular-nums" data-testid="total-vendor-quotes">{formatCurrency(totalQuoted, config.currency)}</span>
            </div>
            <div className="h-7 w-px bg-slate-200" />
            <div className="text-right">
              <span className="text-[11px] text-slate-600 block">Booked / Paid</span>
              <span className="text-sm font-mono font-semibold text-emerald-700 tabular-nums">{bookedOrPaidCount} of {visibleVendors.length}</span>
            </div>
            <button type="button" data-testid="toggle-add-vendor-btn" onClick={handleToggleAddForm} className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-900 text-white text-xs font-medium hover:bg-slate-800 cursor-pointer">
              <Plus className="w-3.5 h-3.5" /><span>Add Vendor Category</span>
            </button>
          </div>
        </div>
        {showAddForm && <AddVendorForm config={config} onAddVendor={handleAddVendor} />}
        {aiMessage && <div className="mt-4"><StatusAlertBanner message={aiMessage} variant={isErrorBanner ? 'error' : 'info'} onDismiss={handleDismissBanner} /></div>}
      </section>

      <div className="grid grid-cols-1 gap-4">
        {visibleVendors.map((vendor, idx) => (
          <VendorCard
            key={vendor.id}
            vendor={vendor}
            index={idx}
            currency={config.currency}
            isGenerating={loadingVendorId === vendor.id}
            onUpdateField={handleUpdateField}
            onGenerateQuestions={handleGenerateQuestions}
            onDelete={handleDeleteVendor}
          />
        ))}
      </div>
    </div>
  );
});

export default VendorSection;
