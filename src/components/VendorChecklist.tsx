import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  RefreshCw,
  Plus,
  AlertTriangle,
  HelpCircle,
  Check,
  Trash2,
  ShieldCheck,
} from 'lucide-react';
import { EventConfig, VendorBookingStatus, VendorItem } from '../types/event';
import { CURRENCY_SYMBOLS, formatCurrency, sanitizeText } from '../utils/eventLogic';

interface VendorChecklistProps {
  config: EventConfig;
  vendors: VendorItem[];
  onUpdateVendors: (vendors: VendorItem[]) => void;
  onNotify: (message: string, type?: 'success' | 'error', retryFn?: () => void) => void;
}

const BOOKING_STATUSES: VendorBookingStatus[] = [
  'Researching',
  'Contacted',
  'Booked',
  'Paid',
];

export const VendorChecklist: React.FC<VendorChecklistProps> = ({
  config,
  vendors,
  onUpdateVendors,
  onNotify,
}) => {
  const [loadingVendorId, setLoadingVendorId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // New vendor category form
  const [newCategory, setNewCategory] = useState('');
  const [newRoleDesc, setNewRoleDesc] = useState('');
  const [newPriority, setNewPriority] = useState<VendorItem['priority']>('Recommended');

  const currency = config.currency || 'USD';
  const currencySymbol = CURRENCY_SYMBOLS[currency] || '$';

  const handleGenerateVetting = async (vendor: VendorItem) => {
    setLoadingVendorId(vendor.id);
    setStatusMessage(null);
    try {
      const res = await fetch('/api/ai/vendor-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vendorCategory: vendor.category,
          roleDescription: vendor.roleDescription,
          config,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate vendor questions.');
      }

      const updated = vendors.map((v) =>
        v.id === vendor.id
          ? {
              ...v,
              vettingQuestions: Array.isArray(data.vettingQuestions)
                ? data.vettingQuestions
                : v.vettingQuestions,
              contractRedFlags: Array.isArray(data.contractRedFlags)
                ? data.contractRedFlags
                : v.contractRedFlags,
            }
          : v
      );
      onUpdateVendors(updated);
      const msg = `Generated 5 tailored vetting questions and contract red flags for ${vendor.category}.`;
      setStatusMessage(msg);
      onNotify(msg, 'success');
    } catch (err: any) {
      const message = err?.message || 'Unable to generate vetting questions right now.';
      setStatusMessage(message);
      onNotify(message, 'error', () => handleGenerateVetting(vendor));
    } finally {
      setLoadingVendorId(null);
    }
  };

  const handleVendorFieldChange = <K extends keyof VendorItem>(
    vendorId: string,
    key: K,
    value: VendorItem[K]
  ) => {
    onUpdateVendors(
      vendors.map((v) => (v.id === vendorId ? { ...v, [key]: value } : v))
    );
  };

  const handleDeleteVendor = (vendorId: string) => {
    onUpdateVendors(vendors.filter((v) => v.id !== vendorId));
  };

  const handleAddVendor = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCat = sanitizeText(newCategory, 100);
    if (!cleanCat) return;
    const created: VendorItem = {
      id: `vendor-custom-${Date.now()}`,
      category: cleanCat,
      roleDescription:
        sanitizeText(newRoleDesc, 200) ||
        `Specialized ${cleanCat.toLowerCase()} services for ${config.eventName}`,
      priority: newPriority,
      bookingStatus: 'Researching',
      vendorName: '',
      quotedPrice: 0,
      contactInfo: '',
      vettingQuestions: [],
      contractRedFlags: [],
    };
    onUpdateVendors([...vendors, created]);
    setNewCategory('');
    setNewRoleDesc('');
    const msg = `Added "${created.category}" to your vendor directory.`;
    setStatusMessage(msg);
    onNotify(msg, 'success');
  };

  const handleAddMunicipalPermitEntry = () => {
    const permitEntry: VendorItem = {
      id: `vendor-permit-${Date.now()}`,
      category: 'Municipal Permits, Noise Variance & Safety Compliance',
      roleDescription: `Special event permit, fire marshal inspection, ADA sanitation compliance, and crowd/EMT safety for ${config.location}`,
      priority: 'Essential',
      bookingStatus: 'Researching',
      vendorName: 'Municipal Special Events Office',
      quotedPrice: Math.round(config.totalBudget * 0.05),
      contactInfo: 'permits@city-events.example',
      isPermitOrCompliance: true,
      vettingQuestions: [
        'What is the mandatory lead-time deadline for filing Special Event and Street/Park Use permits?',
        'Are NFPA-701 fire-retardant certificates and non-staking tent ballast weights required on-site?',
        'What are the amplified sound decibel limits and curfew hours at this location?',
        'How many certified crowd managers, security personnel, or EMTs are required for our guest count?',
        'What specific Additional Insured endorsement wording is required on our General Liability COI?',
      ],
      contractRedFlags: [
        'Late permit filing surcharges or automatic application rejection within 30 days of event date',
        'Missing inclement weather evacuation plan or unobstructed 20ft emergency fire lane',
      ],
    };
    onUpdateVendors([permitEntry, ...vendors]);
    const msg = 'Added Municipal Permits & Safety Compliance tracker to your directory.';
    setStatusMessage(msg);
    onNotify(msg, 'success');
  };

  const { bookedOrPaidCount, totalQuoted, hasPermitTracker } = useMemo(() => {
    const bookedOrPaid = vendors.filter(
      (v) => v.bookingStatus === 'Booked' || v.bookingStatus === 'Paid'
    ).length;
    const quotedSum = vendors.reduce((sum, v) => sum + (Number(v.quotedPrice) || 0), 0);
    const hasPermit = vendors.some(
      (v) =>
        v.isPermitOrCompliance ||
        v.category.toLowerCase().includes('permit') ||
        v.category.toLowerCase().includes('municipal')
    );
    return {
      bookedOrPaidCount: bookedOrPaid,
      totalQuoted: quotedSum,
      hasPermitTracker: hasPermit,
    };
  }, [vendors]);

  return (
    <div className="space-y-8">
      {/* Header & Summary */}
      <section
        aria-labelledby="vendors-heading"
        className="bg-white border border-slate-200 rounded-xl p-6 lg:p-8"
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <p className="text-xs font-medium text-slate-500">
              04 · Procurement, Vetting & Permit Tracker
            </p>
            <h2
              id="vendors-heading"
              className="text-xl lg:text-2xl font-semibold text-slate-900 mt-1"
            >
              Vendor & Logistics Checklist
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Manage required vendors and municipal permits for your {config.eventType.toLowerCase()} and generate AI vetting questions & contract red flags before signing.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs text-slate-600 shrink-0">
            <div>
              <span className="block text-slate-500">Booked / Paid</span>
              <strong className="text-lg font-mono tabular-nums text-slate-900">
                {bookedOrPaidCount} / {vendors.length}
              </strong>
            </div>
            <div className="border-l border-slate-200 pl-6">
              <span className="block text-slate-500">Total Quoted Contracts</span>
              <strong className="text-lg font-mono tabular-nums text-slate-900">
                {formatCurrency(totalQuoted, currency)}
              </strong>
            </div>
          </div>
        </div>

        {/* Municipal Permit & Safety Compliance Reminder Banner */}
        <div className="mt-5 p-4 rounded-lg bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <ShieldCheck className="w-4 h-4 text-slate-700 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-700 space-y-0.5">
              <p className="font-semibold text-slate-900">
                Municipal Permits, Fire Marshal & Safety Compliance ({config.eventType} · {config.setting})
              </p>
              <p className="text-slate-600">
                {config.eventType === 'Community Event' || config.setting === 'Outdoor'
                  ? `Outdoor and Community Events for ${config.guestCount} guests require civic special event permits, noise variances, NFPA-701 tent tags, and ADA sanitation compliance.`
                  : `Verify venue occupancy certificates, liquor liability insurance endorsements, and open-flame/candle regulations with ${config.location}.`}
              </p>
            </div>
          </div>

          {!hasPermitTracker && (
            <button
              type="button"
              onClick={handleAddMunicipalPermitEntry}
              className="px-3.5 py-2 text-xs font-semibold text-slate-900 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              + Add Permit & Safety Checklist
            </button>
          )}
        </div>

        <div aria-live="polite">
          {statusMessage && (
            <div
              role="status"
              className="mt-5 p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-between gap-2 text-xs text-emerald-900"
            >
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>{statusMessage}</span>
              </div>
              <button
                type="button"
                onClick={() => setStatusMessage(null)}
                className="text-xs font-medium underline whitespace-nowrap shrink-0 cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          )}
        </div>

        {/* Add Vendor Category Form */}
        <form
          onSubmit={handleAddVendor}
          className="mt-6 pt-2 flex flex-col lg:flex-row items-stretch lg:items-end gap-3"
        >
          <div className="w-full lg:w-64">
            <label
              htmlFor="new-vendor-category"
              className="block text-xs font-medium text-slate-700 mb-1"
            >
              Add Vendor or Permit Category
            </label>
            <input
              id="new-vendor-category"
              type="text"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="e.g., Guest Shuttle & Valet Transport"
              className="w-full h-9 px-3 text-xs bg-white border border-slate-300 rounded-lg text-slate-900"
            />
          </div>

          <div className="flex-1">
            <label
              htmlFor="new-vendor-desc"
              className="block text-xs font-medium text-slate-700 mb-1"
            >
              Scope / Deliverable Description
            </label>
            <input
              id="new-vendor-desc"
              type="text"
              value={newRoleDesc}
              onChange={(e) => setNewRoleDesc(e.target.value)}
              placeholder="e.g., Two 40-passenger coaches looping between hotel and venue"
              className="w-full h-9 px-3 text-xs bg-white border border-slate-300 rounded-lg text-slate-900"
            />
          </div>

          <div className="w-full lg:w-40">
            <label
              htmlFor="new-vendor-priority"
              className="block text-xs font-medium text-slate-700 mb-1"
            >
              Priority Level
            </label>
            <select
              id="new-vendor-priority"
              value={newPriority}
              onChange={(e) => setNewPriority(e.target.value as VendorItem['priority'])}
              className="w-full h-9 px-2.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-900"
            >
              <option value="Essential">Essential</option>
              <option value="Recommended">Recommended</option>
              <option value="Optional">Optional</option>
            </select>
          </div>

          <button
            type="submit"
            className="h-9 px-4 inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Category</span>
          </button>
        </form>
      </section>

      {/* Vendor Directory Cards */}
      <div className="space-y-6">
        {vendors.map((vendor, index) => {
          const isGeneratingThis = loadingVendorId === vendor.id;
          return (
            <article
              key={vendor.id}
              className="bg-white border border-slate-200 rounded-xl p-6 lg:p-8 space-y-6"
            >
              {/* Top Row: Category Title, Status Segmented Control & AI Questions Trigger */}
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 pb-5 border-b border-slate-200">
                <div>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    <span className="font-mono tabular-nums">Vendor 0{index + 1}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-medium text-slate-700">
                      {vendor.priority} Priority
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>Status: {vendor.bookingStatus}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mt-1">
                    {vendor.category}
                  </h3>
                  <p className="text-xs text-slate-600 mt-1">{vendor.roleDescription}</p>
                </div>

                <div className="flex flex-wrap items-center gap-3 shrink-0">
                  {/* Booking Status Selector */}
                  <div
                    role="group"
                    aria-label={`Booking status for ${vendor.category}`}
                    className="inline-flex items-center p-1 bg-slate-100 rounded-lg border border-slate-200"
                  >
                    {BOOKING_STATUSES.map((st) => (
                      <button
                        key={st}
                        type="button"
                        aria-pressed={vendor.bookingStatus === st}
                        onClick={() =>
                          handleVendorFieldChange(vendor.id, 'bookingStatus', st)
                        }
                        className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                          vendor.bookingStatus === st
                            ? st === 'Booked' || st === 'Paid'
                              ? 'bg-emerald-700 text-white'
                              : 'bg-white text-slate-900 shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>

                  {/* AI Questions to Ask Generator Button */}
                  <button
                    type="button"
                    onClick={() => handleGenerateVetting(vendor)}
                    disabled={isGeneratingThis}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 disabled:opacity-60 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    {isGeneratingThis ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Generating...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>AI Questions to Ask</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    aria-label={`Remove vendor ${vendor.category}`}
                    onClick={() => handleDeleteVendor(vendor.id)}
                    className="p-2 text-slate-400 hover:text-red-600 rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Middle Row: Vendor Details Inputs */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label
                    htmlFor={`vendor-name-${vendor.id}`}
                    className="block text-xs font-medium text-slate-700 mb-1"
                  >
                    Shortlisted / Booked Company Name
                  </label>
                  <input
                    id={`vendor-name-${vendor.id}`}
                    type="text"
                    value={vendor.vendorName}
                    onChange={(e) =>
                      handleVendorFieldChange(vendor.id, 'vendorName', e.target.value)
                    }
                    placeholder="Enter vendor or agency name"
                    className="w-full h-9 px-3 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white"
                  />
                </div>

                <div>
                  <label
                    htmlFor={`vendor-quote-${vendor.id}`}
                    className="block text-xs font-medium text-slate-700 mb-1"
                  >
                    Quoted / Contract Price ({currencySymbol})
                  </label>
                  <input
                    id={`vendor-quote-${vendor.id}`}
                    type="number"
                    min={0}
                    step={100}
                    value={vendor.quotedPrice}
                    onChange={(e) =>
                      handleVendorFieldChange(
                        vendor.id,
                        'quotedPrice',
                        Math.max(0, Number(e.target.value) || 0)
                      )
                    }
                    className="w-full h-9 px-3 text-xs font-mono tabular-nums bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white"
                  />
                </div>

                <div>
                  <label
                    htmlFor={`vendor-contact-${vendor.id}`}
                    className="block text-xs font-medium text-slate-700 mb-1"
                  >
                    Contact Notes / Email / Phone
                  </label>
                  <input
                    id={`vendor-contact-${vendor.id}`}
                    type="text"
                    value={vendor.contactInfo}
                    onChange={(e) =>
                      handleVendorFieldChange(vendor.id, 'contactInfo', e.target.value)
                    }
                    placeholder="contact@vendor.example · Ext 204"
                    className="w-full h-9 px-3 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white"
                  />
                </div>
              </div>

              {/* Bottom Split: 5 Vetting Questions & Contract Red Flags */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
                {/* 5 Specific Vetting Questions */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-900">
                    <HelpCircle className="w-4 h-4 text-slate-500" />
                    <span>
                      5 Vetting Questions to Ask Before Booking ({vendor.vettingQuestions.length})
                    </span>
                  </div>
                  {vendor.vettingQuestions.length === 0 ? (
                    <p className="text-xs text-slate-500">
                      Click "AI Questions to Ask" above to generate 5 bespoke vetting questions for {vendor.category}.
                    </p>
                  ) : (
                    <ol className="space-y-2 text-xs text-slate-700 list-decimal pl-4">
                      {vendor.vettingQuestions.map((q, qIdx) => (
                        <li key={qIdx} className="leading-relaxed">
                          {q}
                        </li>
                      ))}
                    </ol>
                  )}
                </div>

                {/* Contract Red Flags */}
                <div className="space-y-3 lg:border-l lg:border-slate-200 lg:pl-6">
                  <div className="flex items-center gap-2 text-xs font-semibold text-red-900">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                    <span>
                      Contract Red Flags to Watch Out For ({vendor.contractRedFlags.length})
                    </span>
                  </div>
                  {vendor.contractRedFlags.length === 0 ? (
                    <p className="text-xs text-slate-500">
                      Click "AI Questions to Ask" above to surface contract clauses and hidden fees to audit.
                    </p>
                  ) : (
                    <ul className="space-y-2 text-xs text-slate-700 list-disc pl-4">
                      {vendor.contractRedFlags.map((flag, fIdx) => (
                        <li key={fIdx} className="leading-relaxed">
                          {flag}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
};
