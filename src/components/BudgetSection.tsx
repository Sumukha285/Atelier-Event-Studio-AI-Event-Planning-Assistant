/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useMemo, useState } from 'react';
import { Loader2, Plus, RotateCcw, Wand2 } from 'lucide-react';
import { MAX_BUDGET_LIMIT, TOAST_DISMISS_MS } from '../constants/event.constants';
import { fetchBudgetAllocation, getRemainingCooldownMs } from '../services/gemini.service';
import { BudgetCategoryItem, EventConfig } from '../types/event.types';
import { calculateBudgetAllocation, calculateBudgetMetrics, formatCurrency } from '../utils/domain.utils';
import { clampNumber, sanitizeText } from '../utils/security.utils';
import { BudgetKpiStrip } from './BudgetKpiStrip';
import { BudgetTableRow } from './BudgetTableRow';
import { StatusAlertBanner } from './ui/AtomicControls';

export interface BudgetSectionProps {
  readonly config: EventConfig;
  readonly categories: readonly BudgetCategoryItem[];
  readonly onUpdateCategories: (categories: readonly BudgetCategoryItem[]) => void;
  readonly onUpdateTotalBudget: (newTotalBudget: number) => void;
  readonly onAnnounce?: (message: string) => void;
}

/**
 * @description Renders the Smart Budget Allocator section with 4 KPI cards, stacked allocation bar, AI Auto-Allocate, and ledger table.
 * @param {BudgetSectionProps} props - Event config, budget categories, and update callbacks
 * @returns {React.ReactElement} Memoized BudgetSection JSX element
 */
export const BudgetSection = React.memo(function BudgetSection({
  config,
  categories,
  onUpdateCategories,
  onUpdateTotalBudget,
  onAnnounce,
}: BudgetSectionProps): React.ReactElement {
  const [isAiAllocating, setIsAiAllocating] = useState(false);
  const [aiMessage, setAiMessage] = useState<string | null>(null);
  const [isErrorBanner, setIsErrorBanner] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryEstimate, setNewCategoryEstimate] = useState(1200);

  const summary = useMemo(() => calculateBudgetMetrics(categories, config.totalBudget), [categories, config.totalBudget]);

  const notify = useCallback((msg: string, isError: boolean = false): void => {
    setAiMessage(msg);
    setIsErrorBanner(isError);
    if (onAnnounce) onAnnounce(msg);
    if (!isError) window.setTimeout(() => setAiMessage(null), TOAST_DISMISS_MS);
  }, [onAnnounce]);

  const handleUpdateAmount = useCallback((id: string, field: 'estimatedCost' | 'actualSpent', rawValue: string): void => {
    const numeric = clampNumber(rawValue, 0, MAX_BUDGET_LIMIT);
    onUpdateCategories(categories.map((c) => (c.id === id ? { ...c, [field]: Math.round(numeric) } : c)));
  }, [categories, onUpdateCategories]);
  const handleUpdateNotes = useCallback((id: string, notes: string): void => {
    onUpdateCategories(categories.map((c) => (c.id === id ? { ...c, notes: sanitizeText(notes, 200) } : c)));
  }, [categories, onUpdateCategories]);
  const handleDeleteRow = useCallback((id: string): void => onUpdateCategories(categories.filter((c) => c.id !== id)), [categories, onUpdateCategories]);
  const handleResetStandard = useCallback((): void => {
    onUpdateCategories(calculateBudgetAllocation(config.totalBudget, config.eventType, categories));
    notify(`Reset estimates to ${config.eventType} industry-standard weights (including 10% Contingency).`);
  }, [categories, config.eventType, config.totalBudget, notify, onUpdateCategories]);

  const handleAiAutoAllocate = useCallback(async (): Promise<void> => {
    const waitMs = getRemainingCooldownMs();
    if (waitMs > 0) return notify(`Please wait ${Math.ceil(waitMs / 1000)}s before another AI request.`);
    setIsAiAllocating(true);
    try {
      const data = await fetchBudgetAllocation(config);
      const merged = data.categories.map((item) => {
        const existing = categories.find((c) => c.category.toLowerCase() === item.category.toLowerCase());
        return { ...item, actualSpent: existing ? existing.actualSpent : 0 };
      });
      onUpdateCategories(merged);
      notify(`Allocated ${formatCurrency(config.totalBudget, config.currency)} across ${merged.length} categories.`);
    } catch {
      handleResetStandard();
    } finally {
      setIsAiAllocating(false);
    }
  }, [categories, config, handleResetStandard, notify, onUpdateCategories]);

  const handleAddCategory = useCallback((e: React.FormEvent): void => {
    e.preventDefault();
    const cleanName = sanitizeText(newCategoryName, 50);
    if (!cleanName) return;
    const est = Math.round(clampNumber(newCategoryEstimate, 0, MAX_BUDGET_LIMIT));
    const pct = config.totalBudget > 0 ? Math.round((est / config.totalBudget) * 100) : 0;
    onUpdateCategories([...categories, { id: `budget-custom-${Date.now()}`, category: cleanName, recommendedPercent: pct, estimatedCost: est, actualSpent: 0, notes: 'Custom line item allocation' }]);
    setNewCategoryName('');
    setNewCategoryEstimate(1000);
  }, [categories, config.totalBudget, newCategoryEstimate, newCategoryName, onUpdateCategories]);

  return (
    <div className="space-y-6" data-testid="budget-view">
      <section className="bg-white border border-slate-200/90 rounded-xl p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-200/80">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-600 block mb-1">Pillar 02 · Financial Ledger & Proportional Allocation</span>
            <h2 className="text-lg font-semibold text-slate-900 tracking-tight">Smart Budget Allocator</h2>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <button type="button" data-testid="reset-budget-weights-btn" onClick={handleResetStandard} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 text-xs font-medium hover:bg-slate-50 cursor-pointer"><RotateCcw className="w-3.5 h-3.5" aria-hidden="true" /><span>Reset Standard Weights</span></button>
            <button type="button" data-testid="btn-auto-allocate" onClick={handleAiAutoAllocate} disabled={isAiAllocating} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 text-white text-xs font-medium hover:bg-slate-800 disabled:opacity-60 cursor-pointer">{isAiAllocating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Wand2 className="w-3.5 h-3.5 text-amber-400" />}<span>{isAiAllocating ? 'Optimizing...' : 'AI Auto-Allocate Budget'}</span></button>
          </div>
        </div>
        <BudgetKpiStrip config={config} categories={categories} summary={summary} onUpdateTotalBudget={onUpdateTotalBudget} />
        {aiMessage && <div className="mt-4"><StatusAlertBanner message={aiMessage} variant={isErrorBanner ? 'error' : 'info'} onDismiss={() => setAiMessage(null)} /></div>}
      </section>
      <section className="bg-white border border-slate-200/90 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead><tr className="border-b border-slate-200/80 bg-slate-50/70 text-[11px] font-semibold uppercase tracking-wider text-slate-600"><th className="py-3 px-5">Category</th><th className="py-3 px-4">Allocation & Progress</th><th className="py-3 px-4 text-right">Estimated ({config.currency})</th><th className="py-3 px-4 text-right">Actual Spent ({config.currency})</th><th className="py-3 px-4 text-right">Variance</th><th className="py-3 px-4 text-right w-12">Action</th></tr></thead>
            <tbody className="divide-y divide-slate-200/60 text-sm">{categories.map((item) => <BudgetTableRow key={item.id} item={item} totalBudget={config.totalBudget} currency={config.currency} canDelete={categories.length > 1} onUpdateAmount={handleUpdateAmount} onUpdateNotes={handleUpdateNotes} onDelete={handleDeleteRow} />)}</tbody>
          </table>
        </div>
        <form onSubmit={handleAddCategory} className="p-4 bg-slate-50/50 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 flex-1">
            <label htmlFor="new-budget-category-name" className="sr-only">New budget category name</label>
            <input id="new-budget-category-name" type="text" data-testid="new-budget-category-name" placeholder="Add custom budget category..." value={newCategoryName} aria-invalid={false} aria-describedby="add-budget-desc" onChange={(e) => setNewCategoryName(e.target.value)} maxLength={50} className="px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-md text-slate-900 w-full sm:w-64" />
            <label htmlFor="new-budget-category-estimate" className="sr-only">New category estimated cost</label>
            <input id="new-budget-category-estimate" type="number" data-testid="new-budget-category-estimate" min={0} max={MAX_BUDGET_LIMIT} step={100} value={newCategoryEstimate} aria-invalid={false} aria-describedby="add-budget-desc" onChange={(e) => setNewCategoryEstimate(Number(e.target.value))} className="px-3 py-1.5 text-xs font-mono bg-white border border-slate-300 rounded-md text-slate-900 w-28" />
            <span id="add-budget-desc" className="sr-only">Enter a category name and estimated cost to append a budget row.</span>
          </div>
          <button type="submit" data-testid="add-budget-category-btn" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-900 text-white text-xs font-medium hover:bg-slate-800 cursor-pointer"><Plus className="w-3.5 h-3.5" aria-hidden="true" /><span>Add Line Item</span></button>
        </form>
      </section>
    </div>
  );
});

export default BudgetSection;
