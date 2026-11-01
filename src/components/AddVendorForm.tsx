/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { MAX_BUDGET_LIMIT } from '../constants/event.constants';
import { EventConfig, VendorItem, VendorPriority } from '../types/event.types';
import { clampNumber, sanitizeText } from '../utils/security.utils';

export interface AddVendorFormProps {
  readonly config: EventConfig;
  readonly onAddVendor: (vendor: VendorItem) => void;
}

/**
 * @description Renders the inline Add Vendor form inside `VendorSection`.
 * @param {AddVendorFormProps} props - Event configuration and vendor creation callback
 * @returns {React.ReactElement} Memoized AddVendorForm JSX element
 */
export const AddVendorForm = React.memo(function AddVendorForm({
  config,
  onAddVendor,
}: AddVendorFormProps): React.ReactElement {
  const [newCategory, setNewCategory] = useState('');
  const [newRole, setNewRole] = useState('');
  const [newVendorName, setNewVendorName] = useState('');
  const [newQuote, setNewQuote] = useState(2500);
  const [newPriority, setNewPriority] = useState<VendorPriority>('Recommended');

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    const cleanCat = sanitizeText(newCategory, 80);
    if (!cleanCat) return;
    onAddVendor({
      id: `vendor-custom-${Date.now()}`,
      category: cleanCat,
      roleDescription: sanitizeText(newRole, 160) || 'Custom event supplier & logistics service',
      priority: newPriority,
      bookingStatus: 'Researching',
      vendorName: sanitizeText(newVendorName, 80) || 'Unassigned Supplier',
      quotedPrice: Math.round(clampNumber(newQuote, 0, MAX_BUDGET_LIMIT)),
      contactInfo: '',
      vettingQuestions: [
        `What is the exact arrival, setup, and strike window included for ${config.location}?`,
        'Are all labor, delivery, and overtime charges itemized in the base contract?',
        'Can you provide a Certificate of Insurance ($2M aggregate) naming our venue?',
        `What is your contingency staffing and equipment backup plan for ${config.guestCount} guests?`,
        'What are the deposit milestones and cancellation refund terms?',
      ],
      contractRedFlags: [
        'Uncapped overtime rates if strike runs past midnight',
        'Vague substitution clauses without client approval',
      ],
    });
    setNewCategory('');
    setNewRole('');
    setNewVendorName('');
  };

  return (
    <form onSubmit={handleSubmit} className="mt-5 p-4 bg-slate-50 border border-slate-200 rounded-lg grid grid-cols-1 md:grid-cols-5 gap-3">
      <div>
        <label htmlFor="new-vendor-cat" className="sr-only">Vendor Category</label>
        <input id="new-vendor-cat" type="text" data-testid="new-vendor-category-input" placeholder="Category (e.g., Lighting)" value={newCategory} aria-invalid={false} aria-describedby="add-vendor-desc" onChange={(e) => setNewCategory(e.target.value)} maxLength={80} className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-md text-slate-900" />
      </div>
      <div>
        <label htmlFor="new-vendor-role" className="sr-only">Role Scope</label>
        <input id="new-vendor-role" type="text" placeholder="Role / Deliverable scope" value={newRole} aria-invalid={false} aria-describedby="add-vendor-desc" onChange={(e) => setNewRole(e.target.value)} maxLength={160} className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-md text-slate-900" />
      </div>
      <div>
        <label htmlFor="new-vendor-name" className="sr-only">Vendor Name</label>
        <input id="new-vendor-name" type="text" placeholder="Vendor Name (optional)" value={newVendorName} aria-invalid={false} aria-describedby="add-vendor-desc" onChange={(e) => setNewVendorName(e.target.value)} maxLength={80} className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-md text-slate-900" />
      </div>
      <div>
        <label htmlFor="new-vendor-quote" className="sr-only">Quoted Price</label>
        <input id="new-vendor-quote" type="number" min={0} max={MAX_BUDGET_LIMIT} step={100} value={newQuote} aria-invalid={false} aria-describedby="add-vendor-desc" onChange={(e) => setNewQuote(Number(e.target.value))} className="w-full px-3 py-2 text-xs font-mono bg-white border border-slate-300 rounded-md text-slate-900" />
      </div>
      <div className="flex gap-2">
        <label htmlFor="new-vendor-priority" className="sr-only">Vendor Priority</label>
        <select id="new-vendor-priority" value={newPriority} aria-invalid={false} aria-describedby="add-vendor-desc" onChange={(e) => setNewPriority(e.target.value as VendorPriority)} className="px-2 py-2 text-xs bg-white border border-slate-300 rounded-md text-slate-800 flex-1">
          <option value="Essential">Essential</option>
          <option value="Recommended">Recommended</option>
          <option value="Optional">Optional</option>
        </select>
        <span id="add-vendor-desc" className="sr-only">Add a custom supplier category to the vendor directory.</span>
        <button type="submit" data-testid="save-new-vendor-btn" className="px-3 py-2 rounded-md bg-slate-900 text-white text-xs font-medium cursor-pointer">Save</button>
      </div>
    </form>
  );
});
