/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Trash2 } from 'lucide-react';
import { CATEGORY_COLORS, MAX_BUDGET } from '../constants/event.constants';
import { BudgetCategoryItem, CurrencyCode } from '../types/event.types';
import {
  classifyCategoryBudgetStatus,
  formatCurrency,
} from '../utils/eventLogic';

export interface BudgetTableRowProps {
  readonly item: BudgetCategoryItem;
  readonly totalBudget: number;
  readonly currency: CurrencyCode;
  readonly canDelete: boolean;
  readonly onUpdateAmount: (
    id: string,
    field: 'estimatedCost' | 'actualSpent',
    rawValue: string
  ) => void;
  readonly onUpdateNotes: (id: string, notes: string) => void;
  readonly onDelete: (id: string) => void;
}

const STATUS_TEXT_COLOR: Readonly<Record<string, string>> = {
  'Over Budget': 'text-rose-700',
  'Near Limit': 'text-amber-800',
  'Under Budget': 'text-emerald-800',
  Unspent: 'text-slate-600',
};

/**
 * Renders a single interactive row in the Smart Budget Allocator ledger table.
 *
 * @param props - Row item, currency, and update callbacks
 * @returns Table row JSX element
 */
export function BudgetTableRow({
  item,
  totalBudget,
  currency,
  canDelete,
  onUpdateAmount,
  onUpdateNotes,
  onDelete,
}: BudgetTableRowProps): React.ReactElement {
  const variance = item.estimatedCost - item.actualSpent;
  const statusLabel = classifyCategoryBudgetStatus(
    item.estimatedCost,
    item.actualSpent
  );
  const shareOfTotal =
    totalBudget > 0 ? Math.round((item.estimatedCost / totalBudget) * 100) : 0;
  const spentOfEst =
    item.estimatedCost > 0
      ? Math.min(100, Math.round((item.actualSpent / item.estimatedCost) * 100))
      : item.actualSpent > 0
      ? 100
      : 0;
  const color = CATEGORY_COLORS[item.category] ?? '#334155';
  const slug = item.category.toLowerCase().replace(/\s+/g, '-');

  return (
    <tr
      data-testid={`budget-row-${slug}`}
      className="hover:bg-slate-50/70 transition-colors"
    >
      <td className="px-5 py-3.5 align-top">
        <div className="flex items-center gap-2">
          <span
            className="w-2.5 h-2.5 rounded-xs shrink-0"
            style={{ backgroundColor: color }}
          />
          <span className="text-sm font-medium text-slate-900">
            {item.category}
          </span>
        </div>
        <span className="text-[11px] font-mono text-slate-600 mt-0.5 block tabular-nums">
          {shareOfTotal}% of total ({item.recommendedPercent}% std)
        </span>
      </td>

      <td className="px-4 py-3.5 align-top">
        <input
          type="text"
          aria-label={`${item.category} scope notes`}
          value={item.notes}
          onChange={(e) => onUpdateNotes(item.id, e.target.value)}
          className="w-full text-xs text-slate-700 bg-transparent border border-transparent hover:border-slate-200 focus:border-slate-900 focus:bg-white rounded px-2 py-1 focus:outline-none"
        />
        <div className="mt-2 flex items-center gap-2 px-2">
          <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all ${
                statusLabel === 'Over Budget'
                  ? 'bg-rose-600'
                  : statusLabel === 'Near Limit'
                  ? 'bg-amber-500'
                  : 'bg-slate-800'
              }`}
              style={{ width: `${spentOfEst}%` }}
            />
          </div>
          <span className="text-[10px] font-mono text-slate-600 tabular-nums w-9 text-right">
            {spentOfEst}%
          </span>
        </div>
      </td>

      <td className="px-4 py-3.5 align-top text-right">
        <input
          type="number"
          aria-label={`${item.category} estimated cost`}
          data-testid={`budget-estimated-${slug}`}
          min={0}
          max={MAX_BUDGET}
          step={100}
          value={item.estimatedCost}
          onChange={(e) =>
            onUpdateAmount(item.id, 'estimatedCost', e.target.value)
          }
          className="w-28 text-right px-2.5 py-1.5 text-xs font-mono tabular-nums bg-slate-50 border border-slate-300 rounded-md text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white"
        />
      </td>

      <td className="px-4 py-3.5 align-top text-right">
        <input
          type="number"
          aria-label={`${item.category} actual spent`}
          data-testid={`budget-actual-${slug}`}
          min={0}
          max={MAX_BUDGET}
          step={100}
          value={item.actualSpent}
          onChange={(e) =>
            onUpdateAmount(item.id, 'actualSpent', e.target.value)
          }
          className="w-28 text-right px-2.5 py-1.5 text-xs font-mono tabular-nums bg-white border border-slate-300 rounded-md text-slate-900 focus:outline-none focus:border-slate-900"
        />
      </td>

      <td className="px-4 py-3.5 align-top text-right">
        <div
          className={`text-xs font-mono font-semibold tabular-nums ${
            variance >= 0 ? 'text-slate-800' : 'text-rose-700'
          }`}
        >
          {variance >= 0 ? '+' : '-'}
          {formatCurrency(Math.abs(variance), currency)}
        </div>
        <div
          className={`text-[10px] font-mono uppercase tracking-wider mt-0.5 ${
            STATUS_TEXT_COLOR[statusLabel] ?? 'text-slate-600'
          }`}
        >
          {statusLabel}
        </div>
      </td>

      <td className="px-4 py-3.5 align-top text-right">
        {canDelete && (
          <button
            type="button"
            onClick={() => onDelete(item.id)}
            title="Remove category"
            aria-label={`Remove ${item.category} category`}
            className="p-1.5 text-slate-400 hover:text-rose-600 rounded transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        )}
      </td>
    </tr>
  );
}
