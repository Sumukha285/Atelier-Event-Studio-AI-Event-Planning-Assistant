import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  RefreshCw,
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  Plus,
  Trash2,
  AlertCircle,
} from 'lucide-react';
import { BudgetCategoryItem, EventConfig } from '../types/event';
import {
  BUDGET_CATEGORIES,
  CURRENCY_SYMBOLS,
  calculateBudgetAllocation,
  classifyCategoryBudgetStatus,
  computeBudgetSummary,
  formatCurrency,
  sanitizeText,
} from '../utils/eventLogic';

interface SmartBudgetAllocatorProps {
  config: EventConfig;
  categories: BudgetCategoryItem[];
  onUpdateCategories: (categories: BudgetCategoryItem[]) => void;
  onUpdateTotalBudget: (newBudget: number) => void;
  onNotify: (message: string, type?: 'success' | 'error', retryFn?: () => void) => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  Venue: '#0F172A',
  Catering: '#2563EB',
  Decor: '#0D9488',
  Entertainment: '#D97706',
  Photography: '#7C3AED',
  Logistics: '#475569',
  Contingency: '#16A34A',
};

export const SmartBudgetAllocator: React.FC<SmartBudgetAllocatorProps> = ({
  config,
  categories,
  onUpdateCategories,
  onUpdateTotalBudget,
  onNotify,
}) => {
  const [isAllocating, setIsAllocating] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Add custom budget row state
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newEstimatedCost, setNewEstimatedCost] = useState(1500);
  const [newCategoryNotes, setNewCategoryNotes] = useState('');

  const currency = config.currency || 'USD';
  const currencySymbol = CURRENCY_SYMBOLS[currency] || '$';

  const summary = useMemo(
    () => computeBudgetSummary(categories, config.totalBudget),
    [categories, config.totalBudget]
  );

  const perGuestEstimated = useMemo(
    () => (config.guestCount > 0 ? Math.round(summary.totalEstimated / config.guestCount) : 0),
    [summary.totalEstimated, config.guestCount]
  );

  const handleAIAutoAllocate = async () => {
    setIsAllocating(true);
    setFeedbackMsg(null);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/ai/budget', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          config,
          existingCategories: categories,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to rebalance budget.');
      }
      if (Array.isArray(data.budgetCategories)) {
        onUpdateCategories(data.budgetCategories);
        const msg = `AI Rebalanced ${formatCurrency(config.totalBudget, currency)} across 7 categories using ${config.eventType} industry benchmarks.`;
        setFeedbackMsg(msg);
        onNotify(msg, 'success');
      }
    } catch (err: any) {
      const message = err?.message || 'Could not rebalance budget right now.';
      setErrorMsg(message);
      onNotify(message, 'error', handleAIAutoAllocate);
    } finally {
      setIsAllocating(false);
    }
  };

  const handleResetStandard = () => {
    const standard = calculateBudgetAllocation(
      config.totalBudget,
      config.eventType,
      categories
    );
    onUpdateCategories(standard);
    const msg = `Reset estimated allocations to standard ${config.eventType} weights.`;
    setFeedbackMsg(msg);
    onNotify(msg, 'success');
  };

  const handleItemChange = (
    id: string,
    field: 'estimatedCost' | 'actualSpent' | 'notes' | 'category',
    value: number | string
  ) => {
    const next = categories.map((item) => {
      if (item.id !== id) return item;
      if (field === 'notes' || field === 'category') {
        return { ...item, [field]: String(value).replace(/<[^>]*>?/gm, '') };
      }
      const numeric = Math.max(0, Math.round(Number(value) || 0));
      const updated = { ...item, [field]: numeric };
      if (field === 'estimatedCost' && config.totalBudget > 0) {
        updated.recommendedPercent = Math.round((numeric / config.totalBudget) * 100);
      }
      return updated;
    });
    onUpdateCategories(next);
  };

  const handleAddBudgetRow = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCat = sanitizeText(newCategoryName, 60);
    if (!cleanCat) return;
    const est = Math.max(0, Math.round(Number(newEstimatedCost) || 0));
    const share = config.totalBudget > 0 ? Math.round((est / config.totalBudget) * 100) : 0;

    const newRow: BudgetCategoryItem = {
      id: `budget-custom-${Date.now()}`,
      category: cleanCat,
      recommendedPercent: share,
      estimatedCost: est,
      actualSpent: 0,
      notes: sanitizeText(newCategoryNotes, 180) || `Custom allocation for ${cleanCat}`,
    };
    onUpdateCategories([...categories, newRow]);
    setNewCategoryName('');
    setNewCategoryNotes('');
    const msg = `Added "${cleanCat}" (${formatCurrency(est, currency)}) to your budget ledger.`;
    setFeedbackMsg(msg);
    onNotify(msg, 'success');
  };

  const handleDeleteBudgetRow = (id: string, categoryName: string) => {
    onUpdateCategories(categories.filter((c) => c.id !== id));
    onNotify(`Removed "${categoryName}" from budget ledger.`, 'success');
  };

  return (
    <div className="space-y-8">
      {/* Header & Primary Actions */}
      <section
        aria-labelledby="budget-heading"
        className="bg-white border border-slate-200 rounded-xl p-6 lg:p-8"
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <p className="text-xs font-medium text-slate-500">
              02 · Financial Architecture & Spend Tracking
            </p>
            <h2
              id="budget-heading"
              className="text-xl lg:text-2xl font-semibold text-slate-900 mt-1"
            >
              Smart Budget Allocator
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Distribute your total budget across core categories for{' '}
              <strong className="font-medium text-slate-900">{config.eventName}</strong> and track Estimated Cost vs. Actual Spent.
            </p>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 shrink-0">
            <div className="flex items-center gap-2">
              <label
                htmlFor="quick-total-budget"
                className="text-xs font-medium text-slate-600 whitespace-nowrap"
              >
                Total Budget ({currencySymbol}):
              </label>
              <input
                id="quick-total-budget"
                type="number"
                min={100}
                step={500}
                value={config.totalBudget}
                onChange={(e) => onUpdateTotalBudget(Math.max(0, Number(e.target.value) || 0))}
                className="w-32 h-9 px-2.5 py-1 text-xs font-mono tabular-nums bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
              />
            </div>

            <button
              type="button"
              onClick={handleResetStandard}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Weights</span>
            </button>

            <button
              type="button"
              onClick={handleAIAutoAllocate}
              disabled={isAllocating}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 disabled:opacity-60 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              {isAllocating ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Rebalancing...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>AI Auto-Allocate</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div aria-live="polite">
          {feedbackMsg && (
            <div
              role="status"
              className="mt-5 p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-between gap-2 text-xs text-emerald-900"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>{feedbackMsg}</span>
              </div>
              <button
                type="button"
                onClick={() => setFeedbackMsg(null)}
                className="text-xs font-medium underline hover:text-emerald-950 whitespace-nowrap shrink-0 cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          )}

          {errorMsg && (
            <div
              role="alert"
              className="mt-5 p-3.5 rounded-lg bg-red-50 border border-red-200 flex items-center justify-between gap-2 text-xs text-red-800"
            >
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{errorMsg}</span>
              </div>
              <button
                type="button"
                onClick={handleAIAutoAllocate}
                className="px-2.5 py-1 text-xs font-semibold bg-white border border-red-300 rounded-md text-red-800 hover:bg-red-100 whitespace-nowrap shrink-0 cursor-pointer"
              >
                Retry
              </button>
            </div>
          )}
        </div>

        {/* 4-Column Financial KPI Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-6">
          <div>
            <p className="text-xs text-slate-500">Total Target Budget</p>
            <p className="text-2xl font-semibold font-mono tabular-nums text-slate-900 mt-1">
              {formatCurrency(summary.totalBudget, currency)}
            </p>
            <p className="text-xs text-slate-500 mt-1 font-mono tabular-nums">
              {config.guestCount} guests · {formatCurrency(perGuestEstimated, currency)}/guest est.
            </p>
          </div>

          <div className="sm:border-l sm:border-slate-200 sm:pl-6">
            <p className="text-xs text-slate-500">Estimated Allocation</p>
            <p className="text-2xl font-semibold font-mono tabular-nums text-slate-900 mt-1">
              {formatCurrency(summary.totalEstimated, currency)}
            </p>
            <p className="text-xs text-slate-600 mt-1 font-mono tabular-nums">
              {summary.estimatedPercentOfTotal}% of target{' '}
              {summary.unallocatedBudget === 0
                ? '· Fully allocated'
                : summary.unallocatedBudget > 0
                ? `· ${formatCurrency(summary.unallocatedBudget, currency)} unallocated`
                : `· ${formatCurrency(Math.abs(summary.unallocatedBudget), currency)} over target`}
            </p>
          </div>

          <div className="lg:border-l lg:border-slate-200 lg:pl-6">
            <p className="text-xs text-slate-500">Actual Spent to Date</p>
            <p className="text-2xl font-semibold font-mono tabular-nums text-slate-900 mt-1">
              {formatCurrency(summary.totalActual, currency)}
            </p>
            <p className="text-xs text-slate-600 mt-1 font-mono tabular-nums">
              {summary.actualPercentOfTotal}% of total budget committed
            </p>
          </div>

          <div className="sm:border-l sm:border-slate-200 sm:pl-6">
            <p className="text-xs text-slate-500">Remaining Budget Balance</p>
            <p
              className={`text-2xl font-semibold font-mono tabular-nums mt-1 ${
                summary.remainingFromTotal < 0 ? 'text-red-700' : 'text-emerald-700'
              }`}
            >
              {formatCurrency(summary.remainingFromTotal, currency)}
            </p>
            <p className="text-xs text-slate-600 mt-1">
              {summary.overBudgetCount > 0
                ? `${summary.overBudgetCount} category Over Budget`
                : summary.nearLimitCount > 0
                ? `${summary.nearLimitCount} category Near Limit`
                : 'All categories Under Budget'}
            </p>
          </div>
        </div>

        {/* Visual Proportional Allocation Bar */}
        <div className="mt-8 pt-6 border-t border-slate-200">
          <div className="flex items-center justify-between text-xs text-slate-600 mb-2">
            <span className="font-medium text-slate-800">
              Proportional Category Breakdown ({config.eventType} Benchmark)
            </span>
            <span className="font-mono tabular-nums">
              Estimated: {formatCurrency(summary.totalEstimated, currency)} /{' '}
              {formatCurrency(summary.totalBudget, currency)}
            </span>
          </div>

          <div
            role="progressbar"
            aria-label="Total budget allocation progress"
            aria-valuenow={Math.min(100, Math.round(summary.estimatedPercentOfTotal))}
            aria-valuemin={0}
            aria-valuemax={100}
            className="h-3.5 w-full bg-slate-100 rounded-lg overflow-hidden flex border border-slate-200"
          >
            {categories.map((item) => {
              const widthPct =
                summary.totalEstimated > 0
                  ? Math.max(0, (item.estimatedCost / summary.totalEstimated) * 100)
                  : 0;
              return (
                <div
                  key={item.id}
                  style={{
                    width: `${widthPct}%`,
                    backgroundColor: CATEGORY_COLORS[item.category] || '#334155',
                  }}
                  title={`${item.category}: ${formatCurrency(item.estimatedCost, currency)} (${Math.round(widthPct)}%)`}
                  className="h-full transition-opacity hover:opacity-85"
                />
              );
            })}
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-600">
            {categories.map((item) => {
              const share =
                config.totalBudget > 0
                  ? Math.round((item.estimatedCost / config.totalBudget) * 100)
                  : 0;
              return (
                <div key={`legend-${item.id}`} className="flex items-center gap-1.5">
                  <span
                    className="w-2.5 h-2.5 rounded-xs shrink-0"
                    style={{ backgroundColor: CATEGORY_COLORS[item.category] || '#334155' }}
                  />
                  <span className="font-medium text-slate-800">{item.category}</span>
                  <span className="font-mono tabular-nums text-slate-500">{share}%</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Add Custom Budget Row Form */}
      <form
        onSubmit={handleAddBudgetRow}
        className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col lg:flex-row items-stretch lg:items-end gap-3"
      >
        <div className="w-full lg:w-56">
          <label
            htmlFor="new-budget-category"
            className="block text-xs font-medium text-slate-700 mb-1"
          >
            Add Budget Line Item
          </label>
          <input
            id="new-budget-category"
            type="text"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            placeholder="e.g., Stationery & Signage"
            className="w-full h-9 px-3 text-xs bg-white border border-slate-300 rounded-lg text-slate-900"
          />
        </div>

        <div className="w-full lg:w-40">
          <label
            htmlFor="new-budget-estimate"
            className="block text-xs font-medium text-slate-700 mb-1"
          >
            Estimated Cost ({currencySymbol})
          </label>
          <input
            id="new-budget-estimate"
            type="number"
            min={0}
            step={100}
            value={newEstimatedCost}
            onChange={(e) => setNewEstimatedCost(Number(e.target.value))}
            className="w-full h-9 px-3 text-xs font-mono tabular-nums bg-white border border-slate-300 rounded-lg text-slate-900"
          />
        </div>

        <div className="flex-1">
          <label
            htmlFor="new-budget-notes"
            className="block text-xs font-medium text-slate-700 mb-1"
          >
            Scope Notes
          </label>
          <input
            id="new-budget-notes"
            type="text"
            value={newCategoryNotes}
            onChange={(e) => setNewCategoryNotes(e.target.value)}
            placeholder="e.g., Printed menus, seating chart plinth, and welcome signage"
            className="w-full h-9 px-3 text-xs bg-white border border-slate-300 rounded-lg text-slate-900"
          />
        </div>

        <button
          type="submit"
          className="h-9 px-4 inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Budget Row</span>
        </button>
      </form>

      {/* High-Density Interactive Budget Breakdown Table */}
      <section className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h3 className="text-base font-semibold text-slate-900">
              Category Ledger & Manual Overrides
            </h3>
            <p className="text-xs text-slate-500">
              Edit Estimated Cost or Actual Spent directly to model custom vendor quotes.
            </p>
          </div>
          <span className="text-xs font-mono tabular-nums text-slate-500">
            {categories.length} Categories · Currency: {currency} ({currencySymbol})
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-semibold text-slate-600">
                <th className="py-3 px-6 w-[34%] min-w-[250px]">Category & Scope Notes</th>
                <th className="py-3 px-4 text-right">Share</th>
                <th className="py-3 px-4 text-right">Estimated ({currencySymbol})</th>
                <th className="py-3 px-4 text-right">Actual ({currencySymbol})</th>
                <th className="py-3 px-4 w-52">Spend Status</th>
                <th className="py-3 px-6 text-right">Variance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-sm">
              {categories.map((item) => {
                const sharePct =
                  config.totalBudget > 0
                    ? Math.round((item.estimatedCost / config.totalBudget) * 100)
                    : 0;
                const statusInfo = classifyCategoryBudgetStatus(
                  item.estimatedCost,
                  item.actualSpent
                );
                const utilizationBarPct = Math.min(100, statusInfo.ratioPercent);
                const variance = item.estimatedCost - item.actualSpent;
                const isOver = statusInfo.label === 'Over Budget';
                const isNear = statusInfo.label === 'Near Limit';
                const isCore = BUDGET_CATEGORIES.includes(item.category as any);

                return (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50/80 transition-colors align-top"
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-xs shrink-0"
                            style={{
                              backgroundColor:
                                CATEGORY_COLORS[item.category] || '#334155',
                            }}
                          />
                          <span className="font-semibold text-slate-900">
                            {item.category}
                          </span>
                        </div>
                        {!isCore && (
                          <button
                            type="button"
                            aria-label={`Remove budget row ${item.category}`}
                            onClick={() => handleDeleteBudgetRow(item.id, item.category)}
                            className="p-1 text-slate-400 hover:text-red-600 rounded transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                      <input
                        type="text"
                        aria-label={`${item.category} scope notes`}
                        value={item.notes}
                        onChange={(e) =>
                          handleItemChange(item.id, 'notes', e.target.value)
                        }
                        className="mt-1.5 w-full text-xs text-slate-600 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-slate-900 focus:outline-none py-0.5"
                      />
                    </td>

                    <td className="py-4 px-4 text-right font-mono tabular-nums text-xs text-slate-600">
                      {sharePct}%
                    </td>

                    <td className="py-4 px-4 text-right">
                      <input
                        type="number"
                        min={0}
                        step={100}
                        aria-label={`${item.category} Estimated Cost`}
                        value={item.estimatedCost}
                        onChange={(e) =>
                          handleItemChange(item.id, 'estimatedCost', e.target.value)
                        }
                        className="w-28 h-9 px-2.5 text-right font-mono tabular-nums text-xs bg-white border border-slate-300 rounded-md text-slate-900"
                      />
                    </td>

                    <td className="py-4 px-4 text-right">
                      <input
                        type="number"
                        min={0}
                        step={100}
                        aria-label={`${item.category} Actual Spent`}
                        value={item.actualSpent}
                        onChange={(e) =>
                          handleItemChange(item.id, 'actualSpent', e.target.value)
                        }
                        className="w-28 h-9 px-2.5 text-right font-mono tabular-nums text-xs bg-white border border-slate-300 rounded-md text-slate-900"
                      />
                    </td>

                    <td className="py-4 px-4">
                      <div className="flex items-center justify-between text-[11px] font-mono tabular-nums text-slate-600 mb-1">
                        <span>{statusInfo.ratioPercent}%</span>
                        <span
                          className={`inline-flex items-center gap-1 font-sans font-medium ${
                            isOver
                              ? 'text-red-700'
                              : isNear
                              ? 'text-amber-700'
                              : 'text-slate-600'
                          }`}
                        >
                          {isOver && <AlertTriangle className="w-3 h-3 text-red-600" />}
                          {statusInfo.label}
                        </span>
                      </div>
                      <div
                        role="progressbar"
                        aria-label={`${item.category} spend vs estimate`}
                        aria-valuenow={utilizationBarPct}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        className="h-2 w-full bg-slate-100 rounded-xs overflow-hidden"
                      >
                        <div
                          className={`h-full transition-all ${
                            isOver
                              ? 'bg-red-600'
                              : isNear
                              ? 'bg-amber-600'
                              : 'bg-slate-900'
                          }`}
                          style={{ width: `${utilizationBarPct}%` }}
                        />
                      </div>
                    </td>

                    <td className="py-4 px-6 text-right font-mono tabular-nums text-xs">
                      <span
                        className={`font-semibold ${
                          variance < 0
                            ? 'text-red-700'
                            : variance > 0
                            ? 'text-emerald-700'
                            : 'text-slate-600'
                        }`}
                      >
                        {variance >= 0 ? '+' : ''}
                        {formatCurrency(variance, currency)}
                      </span>
                      <div className="text-[11px] font-sans text-slate-500 mt-0.5">
                        {variance < 0 ? 'Over Budget' : 'Under Budget'}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-slate-200 bg-slate-50 font-semibold text-xs text-slate-900">
                <td className="py-4 px-6">Total Event Ledger</td>
                <td className="py-4 px-4 text-right font-mono tabular-nums">
                  {summary.estimatedPercentOfTotal}%
                </td>
                <td className="py-4 px-4 text-right font-mono tabular-nums">
                  {formatCurrency(summary.totalEstimated, currency)}
                </td>
                <td className="py-4 px-4 text-right font-mono tabular-nums">
                  {formatCurrency(summary.totalActual, currency)}
                </td>
                <td className="py-4 px-4 font-mono tabular-nums text-slate-600">
                  {summary.actualPercentOfTotal}% total spent
                </td>
                <td
                  className={`py-4 px-6 text-right font-mono tabular-nums ${
                    summary.varianceEstimatedVsActual < 0
                      ? 'text-red-700'
                      : 'text-emerald-700'
                  }`}
                >
                  {summary.varianceEstimatedVsActual >= 0 ? '+' : ''}
                  {formatCurrency(summary.varianceEstimatedVsActual, currency)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </section>
    </div>
  );
};
