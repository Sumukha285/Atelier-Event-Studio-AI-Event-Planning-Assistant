/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { CATEGORY_COLORS, MAX_BUDGET, MIN_BUDGET } from '../constants/event.constants';
import {
  BudgetCategoryItem,
  BudgetSummary,
  EventConfig,
} from '../types/event.types';
import { clampNumber, formatCurrency } from '../utils/eventLogic';

export interface BudgetKpiStripProps {
  readonly config: EventConfig;
  readonly categories: readonly BudgetCategoryItem[];
  readonly summary: BudgetSummary;
  readonly onUpdateTotalBudget: (newTotalBudget: number) => void;
}

/**
 * Renders the 4 KPI metric cards and proportional stacked allocation bar for `BudgetView`.
 *
 * @param props - Event config, categories, computed summary, and budget update handler
 * @returns KPI strip JSX element
 */
export function BudgetKpiStrip({
  config,
  categories,
  summary,
  onUpdateTotalBudget,
}: BudgetKpiStripProps): React.ReactElement {
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-5">
        <div className="p-4 rounded-lg border border-slate-200/80 bg-slate-50/50">
          <label htmlFor="master-budget-input" className="text-xs font-medium text-slate-600 block">
            Total Event Budget Ceiling
          </label>
          <div className="mt-1.5 flex items-baseline gap-2">
            <span className="text-xs font-mono text-slate-600">{config.currency}</span>
            <input
              id="master-budget-input"
              data-testid="master-budget-input"
              type="number"
              min={MIN_BUDGET}
              max={MAX_BUDGET}
              step={500}
              value={config.totalBudget}
              onChange={(e) =>
                onUpdateTotalBudget(
                  clampNumber(e.target.value, MIN_BUDGET, MAX_BUDGET, MIN_BUDGET)
                )
              }
              className="w-full text-xl font-semibold text-slate-900 font-mono tabular-nums bg-white border border-slate-300 rounded px-2 py-0.5 focus:outline-none focus:border-slate-900"
            />
          </div>
          <p className="text-[11px] text-slate-600 mt-1 font-mono tabular-nums">
            {formatCurrency(Math.round(config.totalBudget / Math.max(1, config.guestCount)), config.currency)} per guest
          </p>
        </div>

        <div className="p-4 rounded-lg border border-slate-200/80 bg-slate-50/50">
          <span className="text-xs font-medium text-slate-600">Total Estimated Allocation</span>
          <div className="text-2xl font-semibold text-slate-900 font-mono tabular-nums mt-1.5" data-testid="kpi-total-estimated">
            {formatCurrency(summary.totalEstimated, config.currency)}
          </div>
          <p className={`text-[11px] mt-1 font-mono tabular-nums ${summary.unallocatedBudget >= 0 ? 'text-slate-600' : 'text-rose-600 font-medium'}`}>
            {summary.unallocatedBudget >= 0
              ? `${formatCurrency(summary.unallocatedBudget, config.currency)} unallocated`
              : `${formatCurrency(Math.abs(summary.unallocatedBudget), config.currency)} over ceiling`}
          </p>
        </div>

        <div className="p-4 rounded-lg border border-slate-200/80 bg-slate-50/50">
          <span className="text-xs font-medium text-slate-600">Actual Committed / Spent</span>
          <div className="text-2xl font-semibold text-slate-900 font-mono tabular-nums mt-1.5" data-testid="kpi-total-actual">
            {formatCurrency(summary.totalActual, config.currency)}
          </div>
          <p className="text-[11px] text-slate-600 mt-1 font-mono tabular-nums">
            {summary.actualPercentOfTotal}% of total budget utilized
          </p>
        </div>

        <div className="p-4 rounded-lg border border-slate-200/80 bg-slate-50/50">
          <span className="text-xs font-medium text-slate-600">Remaining Available</span>
          <div className={`text-2xl font-semibold font-mono tabular-nums mt-1.5 ${summary.remainingFromTotal >= 0 ? 'text-emerald-700' : 'text-rose-600'}`} data-testid="kpi-remaining-budget">
            {formatCurrency(summary.remainingFromTotal, config.currency)}
          </div>
          <p className="text-[11px] text-slate-600 mt-1 font-mono tabular-nums">
            {summary.overBudgetCount === 0 ? 'All categories within ceiling' : `${summary.overBudgetCount} category over estimate`}
          </p>
        </div>
      </div>

      <div className="mt-5 pt-4 border-t border-slate-100">
        <div className="h-3 w-full rounded-full bg-slate-100 overflow-hidden flex border border-slate-200/80">
          {categories.map((item) => {
            const pct = summary.totalEstimated > 0 ? Math.max(1, (item.estimatedCost / summary.totalEstimated) * 100) : 0;
            return (
              <div
                key={item.id}
                style={{ width: `${pct}%`, backgroundColor: CATEGORY_COLORS[item.category] ?? '#64748B' }}
                title={`${item.category}: ${formatCurrency(item.estimatedCost, config.currency)}`}
              />
            );
          })}
        </div>
      </div>
    </>
  );
}
